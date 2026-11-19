import * as THREE from 'three';
import { streetSetting, marketFront, orchardFront, laneFront, hillsideFront, watersideFront, saltFront } from './life-streetscape.js';

// All models are built in local coordinates, with the front of each shop facing +Z.
// Combining their coloured surfaces keeps even a whole market to one draw call.
export function createModelKit() {
  const cube = new THREE.BoxGeometry();
  const ball = new THREE.SphereGeometry(1, 12, 9);
  const crown = new THREE.IcosahedronGeometry(1, 0);
  const soft = new THREE.IcosahedronGeometry(1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
  const cone = new THREE.ConeGeometry(1, 1, 9);
  const tapered = new THREE.CylinderGeometry(.79, 1, 1, 14);
  const hoopShape = new THREE.TorusGeometry(1,.080,6,22);
  const letterPlane = new THREE.PlaneGeometry();
  const farBall = new THREE.SphereGeometry(1, 8, 5);
  const bead = new THREE.SphereGeometry(1, 10, 7);
  const mouthShape = new THREE.Shape();
  mouthShape.moveTo(-1,.26);
  mouthShape.quadraticCurveTo(-.97,.50,-.78,.31);
  mouthShape.quadraticCurveTo(.06,-.20,.81,.45);
  mouthShape.quadraticCurveTo(1.06,.58,1,.29);
  mouthShape.bezierCurveTo(.56,-.91,-.59,-.87,-1,.26);
  const smileMark = new THREE.ShapeGeometry(mouthShape,5);
  const letterCells=new Map();
  let paper,pen,ink;
  const simpleMaterials = new Map();
  const sources = new Set([cube, ball, crown, soft, cylinder, cone,tapered,hoopShape,letterPlane,farBall,bead,smileMark]);
  const surface = new THREE.MeshLambertMaterial({ vertexColors: true });
  const v = new THREE.Vector3(), normal = new THREE.Vector3(), transform = new THREE.Matrix4(), normalMatrix = new THREE.Matrix3();
  function part(parent, geometry, color, x, y, z, sx=1, sy=1, sz=1) {
    if (!simpleMaterials.has(color)) simpleMaterials.set(color, new THREE.MeshBasicMaterial({color}));
    sources.add(geometry);
    const mesh = new THREE.Mesh(geometry, simpleMaterials.get(color));
    mesh.position.set(x,y,z);
    mesh.scale.set(sx,sy,sz);
    parent.add(mesh);
    return mesh;
  }
  const box = (p,c,x,y,z,w,h,d) => part(p,cube,c,x,y,z,w,h,d);
  const oval = (p,c,x,y,z,w,h,d) => part(p,ball,c,x,y,z,w,h,d);
  const rock = (p,c,x,y,z,w,h,d,round=false) => part(p,round?soft:crown,c,x,y,z,w,h,d);
  const post = (p,c,x,y,z,r,h) => part(p,cylinder,c,x,y,z,r,h,r);
  const peak = (p,c,x,y,z,rx,h,rz) => part(p,cone,c,x,y,z,rx,h,rz);
  const taper = (p,c,x,y,z,rx,h,rz) => part(p,tapered,c,x,y,z,rx,h,rz);
  const hoop = (p,c,x,y,z,rx,ry,thick=rx) => part(p,hoopShape,c,x,y,z,rx,ry,thick);
  function letters(p,word,x,y,z,w,h,color='#fff2d0') {
    if(!ink){
      paper=document.createElement('canvas'); paper.width=2048; paper.height=1024;
      pen=paper.getContext('2d');
      const map=new THREE.CanvasTexture(paper);
      map.colorSpace=THREE.SRGBColorSpace; map.anisotropy=4;
      ink=new THREE.MeshBasicMaterial({map,alphaTest:.20,polygonOffset:true,polygonOffsetFactor:-1});
    }
    const key=word+color;
    if(!letterCells.has(key)){
      const index=letterCells.size;
      if(index>=64) throw new Error('招牌字版超出容量');
      const left=(index%8)*256,top=Math.floor(index/8)*128;
      pen.fillStyle=color; pen.textAlign='center'; pen.textBaseline='middle';
      pen.font='bold 93px "Microsoft JhengHei", "Noto Sans TC", sans-serif';
      pen.fillText(word,left+128,top+66,244);
      ink.map.needsUpdate=true;
      letterCells.set(key,[left/2048,1-(top+128)/1024]);
    }
    const m=new THREE.Mesh(letterPlane,ink);
    m.userData.letters=letterCells.get(key);
    m.position.set(x,y,z); m.scale.set(w,h,1); p.add(m);
    return m;
  }
  const group = (p,x=0,y=0,z=0) => { const g=new THREE.Group(); g.position.set(x,y,z); p.add(g); return g; };
  function rod(p,c,a,b,r) {
    const start=new THREE.Vector3(...a), end=new THREE.Vector3(...b), d=end.sub(start);
    const mid=start.addScaledVector(d,0.5);
    const mesh=post(p,c,mid.x,mid.y,mid.z,r,d.length());
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
    return mesh;
  }
  function bake(root) {
    root.updateWorldMatrix(true,true);
    const inverse = root.matrixWorld.clone().invert();
    const positions=[], normals=[], colors=[], indices=[],glyphPositions=[],glyphUV=[],glyphIndices=[];
    root.traverse(obj=>{
      if (!obj.isMesh) return;
      transform.multiplyMatrices(inverse,obj.matrixWorld);
      if(obj.userData.letters){
        const [u,v0]=obj.userData.letters,geo=obj.geometry,points=geo.getAttribute('position'),uv=geo.getAttribute('uv'),start=glyphPositions.length/3;
        for(let i=0;i<points.count;i++){
          v.fromBufferAttribute(points,i).applyMatrix4(transform); glyphPositions.push(v.x,v.y,v.z);
          glyphUV.push(u+uv.getX(i)/8,v0+uv.getY(i)/8);
        }
        for(const i of geo.index.array) glyphIndices.push(start+i);
        return;
      }
      normalMatrix.getNormalMatrix(transform);
      const geo=obj.geometry, start=positions.length/3;
      const points=geo.getAttribute('position'), ns=geo.getAttribute('normal'), color=obj.material.color;
      for(let i=0;i<points.count;i++){
        v.fromBufferAttribute(points,i).applyMatrix4(transform);
        normal.fromBufferAttribute(ns,i).applyNormalMatrix(normalMatrix);
        positions.push(v.x,v.y,v.z); normals.push(normal.x,normal.y,normal.z); colors.push(color.r,color.g,color.b);
      }
      if(geo.index) for (const i of geo.index.array) indices.push(start+i);
      else for(let i=0;i<points.count;i++) indices.push(start+i);
    });
    const geo=new THREE.BufferGeometry();
    for(const [name,array] of [['position',positions],['normal',normals],['color',colors]]) geo.setAttribute(name,new THREE.Float32BufferAttribute(array,3));
    geo.setIndex(indices);
    geo.computeBoundingSphere();
    const mesh=new THREE.Mesh(geo,surface);
    if(glyphPositions.length){
      const glyph=new THREE.BufferGeometry();
      glyph.setAttribute('position',new THREE.Float32BufferAttribute(glyphPositions,3));
      glyph.setAttribute('uv',new THREE.Float32BufferAttribute(glyphUV,2));
      glyph.setIndex(glyphIndices); glyph.computeBoundingSphere();
      mesh.add(new THREE.Mesh(glyph,ink));
    }
    return mesh;
  }
  function releaseSources() {
    for(const source of sources) source.dispose();
    for(const material of simpleMaterials.values()) material.dispose();
  }
  return {box,oval,rock,post,peak,taper,hoop,letters,rod,group,part,bake,releaseSources,bead,farBall,smileMark};
}

const wood=0x9b6440, darkwood=0x664334, cream=0xffe4ae, spruce=0x376d58;

function roof(k,p,x,y,z,w,h,d,color,trim) {
  const slope=Math.atan2(h,d/2), run=Math.hypot(h,d/2);
  for(const sign of [-1,1]) {
    const panel=k.box(p,color,x,y+h/2,z+sign*d/4,w,0.17,run+0.12);
    panel.rotation.x=sign*slope;
    k.box(p,trim,x,y,z+sign*d/2,w+0.12,0.13,0.16);
    const ribs=Math.max(5,Math.floor(w/.27));
    for(let i=0;i<=ribs;i++){
      const ridgeX=x-w/2+.09+(w-.18)*i/ribs;
      k.rod(p,color,[ridgeX,y+.09,z+sign*(d/2+.04)],[ridgeX,y+h+.10,z],.045);
    }
  }
  k.box(p,trim,x,y+h+0.06,z,w+0.09,0.16,0.19);
}

function produce(k,p,x,y,z,color,large=false) {
  const berry=k.oval(p,color,x,y,z,large?.17:.10,large?.22:.10,large?.14:.10);
  berry.rotation.z=-0.32;
}
function tree(k,p,x,z,s=1,fruit=false) {
  const t=k.group(p,x,0,z); t.scale.setScalar(s);
  k.oval(t,0x839665,0,.04,.13,1.15,.06,.74);
  k.post(t,wood,0,.92,0,.19,1.87);
  k.rod(t,wood,[0,1.12,0],[-.54,1.84,0],.12);
  k.rod(t,wood,[0,1.25,0],[.61,1.93,.04],.13);
  [[-.66,2.09,.06,.81,0x4e855d],[.58,2.19,-.04,.91,0x689758],[0,2.59,-.15,1.07,0x87a75c],[0,2.04,.35,.76,0x52845a],[-.61,2.49,.03,.53,0x779d5e],[.54,2.59,.14,.51,0x9bad68]].forEach(([tx,ty,tz,r,c])=>{
    const leaf=k.rock(t,c,tx,ty,tz,r,r*.72,r*.79,true); leaf.rotation.z=tx*.45;
  });
  for(const [a,b,c,twist] of [[-.83,2.23,.53,-.82],[-.70,2.49,.50,.9],[.51,2.54,.56,-.69],[1.01,2.30,.45,.9],[.12,2.94,.50,.92],[-.16,2.20,.87,-1]]){
    const leaf=k.rock(t,0x8caf65,a,b,c,.099,.19,.063,true); leaf.rotation.z=twist;
    const second=k.rock(t,0x779c59,a+.11,b-.04,c-.022,.081,.15,.047,true);second.rotation.z=-twist;
  }
  if(fruit) [[-.84,1.88,.5],[-.46,2.19,.74],[.1,2.04,.87],[.7,2.16,.68],[.94,1.94,.5],[.19,2.65,.62]].forEach(([a,b,c],i)=>produce(k,t,a,b,c,i%2?0xf4b53c:0xe78234,true));
}
function stall(k,p,x,z,cover,produceColor) {
  const s=k.group(p,x,0,z);
  for(const a of [-1.02,1.02]) for(const b of [-.48,.48]) k.post(s,wood,a,1.07,b,.066,2.13);
  k.box(s,darkwood,0,.38,0,2.1,.66,1);
  k.box(s,cream,0,.75,0,2.35,.13,1.14);
  for(let i=0;i<7;i++){
    const col=i%2?cream:cover, tx=(i-3)*.36;
    const canopy=k.box(s,col,tx,2.03,.04,.365,.12,1.47); canopy.rotation.x=.15;
    k.box(s,col,tx,1.85,.75,.365,.24,.09);
    k.oval(s,col,tx,1.73,.75,.18,.083,.052);
  }
  for(const tx of [-.55,0,.55]) k.box(s,0xaf8753,tx,.835,0,.49,.10,.72);
  for(let i=0;i<8;i++) produce(k,s,(i%4-1.5)*.42,.99+Math.floor(i/4)*.04,(Math.floor(i/4)-.5)*.36,produceColor,true);
}
function lantern(k,p,x,y,z,s=1) {
  k.post(p,wood,x,y+s*.45,z,.026*s,.57*s);
  k.oval(p,0xcb5135,x,y,z,.24*s,.30*s,.24*s);
  for(const side of [-1,1]){
    const seam=k.oval(p,0xee9665,x+side*.115*s,y,z+.17*s,.018*s,.224*s,.018*s);
    seam.rotation.z=side*.045;
  }
  k.post(p,0xffc367,x,y+.26*s,z,.16*s,.07*s);
  k.post(p,0xdda44e,x,y-.26*s,z,.13*s,.063*s);
  k.post(p,0xf5b34f,x,y-.36*s,z,.05*s,.19*s);
}
function cottage(k,p,x,z,w,d,wall,tiles) {
  const h=1.75;
  k.box(p,wall,x,h/2,z,w,h,d);
  roof(k,p,x,h+.08,z,w+.37,.68,d+.42,tiles,darkwood);
  k.box(p,darkwood,x,.66,z+d/2+.025,.63,1.3,.07);
  for(const side of [-1,1]) {
    const xx=x+side*w*.32;
    k.box(p,cream,xx,.97,z+d/2+.045,.52,.6,.08);
    k.box(p,0x4d7772,xx,.97,z+d/2+.093,.4,.47,.04);
    k.box(p,wood,xx,.97,z+d/2+.13,.045,.47,.04);
  }
}

function templeRoof(k,p,x,y,z,w,h,d,c,edge) {
  // Across the eaves the roof sweeps up into four swallowtails. Parallel
  // ceramic rolls follow the curve, including the curved corners of each tier.
  const strips=Math.ceil(w/.22);
  for(let i=0;i<strips;i++){
    const t=(i+.5)/strips*2-1,xx=x+t*w/2,rise=.27*Math.pow(Math.abs(t),3.6);
    const depth=d*(1+.075*Math.abs(t));
    for(const s of [-1,1]){
      const points=[[xx,y+h+rise*.44,z],[xx,y+h*.30+rise*.72,z+s*depth*.25],[xx,y+rise,z+s*depth*.5]];
      for(let j=0;j<2;j++){
        const a=points[j],b=points[j+1],dy=a[1]-b[1],dz=b[2]-a[2];
        const panel=k.box(p,c,xx,(a[1]+b[1])/2,(a[2]+b[2])/2,w/strips+.022,.12,Math.hypot(dy,dz)+.07);
        panel.rotation.x=Math.atan(dy/dz);
        k.rod(p,i%4===0?edge:c,[a[0],a[1]+.073,a[2]],[b[0],b[1]+.073,b[2]],.052);
      }
      k.box(p,edge,xx,y+rise-.015,z+s*depth*.50,w/strips+.025,.12,.15);
    }
    k.box(p,edge,xx,y+h+rise*.44+.07,z,w/strips+.027,.15,.18);
  }
}
function market(k,p) {
  const temple=k.group(p,0,0,-1.62);
  k.box(temple,0xb37d58,0,.15,0,4.65,.3,2.38);
  k.box(temple,0xf3c68d,0,1.27,-.19,3.95,2.27,1.55);
  k.box(temple,0x513e34,0,1.11,.63,1.05,1.82,.14);
  for(const x of [-1.8,-.76,.76,1.8]){
    k.post(temple,0xb64936,x,1.36,1,.12,2.33);
    k.post(temple,0xf5bc57,x,.31,1,.17,.24);
  }
  for(const side of [-1,1]){
    const x=side*1.28;
    k.box(temple,0x72543c,x,1.34,.617,.64,.89,.09);
    for(const dx of [-.18,0,.18]) k.box(temple,0xd6a55b,x+dx,1.34,.679,.042,.75,.04);
    for(const dy of [-.22,0,.22]) k.box(temple,0xd6a55b,x,1.34+dy,.689,.55,.042,.04);
  }
  for(const x of [-1.76,-1.26,-.76,-.26,.26,.76,1.26,1.76]){
    k.box(temple,0x4f8374,x,2.40,1.15,.43,.16,.19);
    k.oval(temple,0xedb568,x,2.40,1.25,.107,.055,.023);
  }
  templeRoof(k,temple,0,2.48,0,4.66,.84,2.78,0xb4513e,0xe9a45c);
  templeRoof(k,temple,0,3.12,-.06,3.36,.55,1.29,0x467b71,0xe4ad63);
  for(const side of [-1,1]){
    k.rod(temple,0xf2bd65,[side*1.49,3.7,-.06],[side*1.85,4,-.06],.10);
    k.rod(temple,0xf2bc64,[side*2.17,2.53,1.38],[side*2.48,2.79,1.38],.09);
    lantern(k,temple,side*1.34,1.84,1.20,.84);
  }
  stall(k,p,-3,.68,0xc95c49,0x6c9350);
  stall(k,p,3.04,.49,0x568a82,0xdf963c);
  for(let i=0;i<3;i++) k.box(p,0xe5c497,0,.064,(i*.56-.24),1.38,.125,.48);
}
function mango(k,p){
  for(const [x,z,s] of [[-3.3,-1.73,.96],[-1.42,-2.15,1.06],[1,-2.28,.87],[-3.28,.45,.8]]) tree(k,p,x,z,s,true);
  stall(k,p,2.55,.12,0xe9a340,0xeaa432);
  for(const x of [-.8,.34]) {
    k.box(p,wood,x,.23,.42,.95,.44,.67);
    for(let i=0;i<5;i++) produce(k,p,x+(i%3-1)*.23,.49,.3+Math.floor(i/3)*.20,i%2?0xe77838:0xf4b53d,true);
  }
}
function brick(k,p,x,z,w,h) {
  k.box(p,0xac6750,x,h/2,z,w,h,.31);
  for(let row=0;row<4;row++) for(let col=0;col<Math.floor(w/.56);col++){
    const bx=x-w/2+.33+col*.55+(row%2)*.15;
    if(bx<x+w/2-.15) k.box(p,(col+row)%3?0xc47d5d:0xb66b51,bx,.21+row*.32,z+.16,.47,.24,.045);
  }
}
function alley(k,p){
  cottage(k,p,-1.47,-1.3,3.28,1.9,0xcc8a66,0x98604c);
  cottage(k,p,1.82,-1.81,2.89,1.81,0xe5b885,0x657c76);
  brick(k,p,-3.31,.16,1.76,1.55);
  brick(k,p,3.24,-.01,1.47,1.5);
  const gate=k.group(p,-.59,.05,-.27);
  k.box(gate,darkwood,0,.91,.11,1.40,1.83,.12);
  k.oval(gate,0xc79247,0,1.08,.22,.51,.5,.085);
  for(let i=0;i<9;i++){
    const a=i*2*Math.PI/9;
    k.oval(gate,0xad6541,.43*Math.cos(a),1.09+.41*Math.sin(a),.28,.12,.13,.065);
  }
  for(const side of [-1,1]){
    k.oval(gate,cream,side*.16,1.20,.315,.10,.08,.045);
    k.oval(gate,0x3d4540,side*.16,1.20,.356,.045,.051,.025);
  }
  k.oval(gate,0x904939,0,1.04,.35,.106,.083,.052);
  k.rod(gate,0xf3db9c,[-.57,.78,.35],[.55,.98,.35],.04);
  k.box(gate,0xbd793a,-.44,.82,.35,.065,.22,.084);
  lantern(k,p,-2.72,1.51,-.15,.8);
  for(const [x,z,s] of [[-3.63,.72,.61],[2.65,.37,.45]]){
    k.post(p,0xaa6545,x,.24,z,.24,.44);
    k.post(p,0xd08a59,x,.45,z,.27,.10);
    for(const [dx,angle] of [[-.16,.56],[.02,0],[.16,-.65]]){
      const leaf=k.oval(p,0x597e50,x+dx,.48+s/2,z,.11,s*.53,.12); leaf.rotation.z=angle;
    }
  }
  for(let i=0;i<6;i++) k.box(p,i%2?0xce9879:0xddae88,1.1+(i%2)*.52,.047,.36+Math.floor(i/2)*.38,.46,.08,.3);
  tree(k,p,3.6,-2.24,.65);
}
function coffee(k,p){
  const cafe=k.group(p,1.7,0,-1.77);
  cottage(k,cafe,0,0,3.05,1.75,0xf0cca1,0x517865);
  k.box(cafe,0x7e4e36,0,.93,1.01,1.49,.95,.10);
  k.box(cafe,cream,0,.49,1.17,1.83,.13,.43);
  k.post(cafe,cream,-.32,.64,1.17,.13,.21);
  k.rod(cafe,darkwood,[1.5,1.58,.84],[1.9,1.58,.84],.05);
  k.box(cafe,0xb28451,1.81,1.27,.84,.48,.46,.085);
  const sign=k.oval(cafe,0x694934,1.81,1.27,.897,.13,.16,.033); sign.rotation.z=-.59;
  for(let i=0;i<6;i++){
    const x=-3.53+(i%3)*1.12,z=-2.1+Math.floor(i/3)*1.14;
    k.post(p,wood,x,.49,z,.1,.99);
    k.rock(p,i%2?0x4e7b4e:0x648b54,x,1.12,z,.73,.7,.64,true);
    for(let n=0;n<3;n++) produce(k,p,x-.32+n*.26,1.16+(n%2)*.21,z+.51,0xb54934);
    for(const sign of [-1,1]){
      const leaf=k.oval(p,0x72955c,x+.21*sign,1.46,z+.43,.10,.20,.062);
      leaf.rotation.z=sign*.82;
    }
  }
  for(const x of [-2.25,-.36,1.53]){
    k.box(p,wood,x,.22,.85,1.56,.33,1.10);
    k.box(p,0xa26343,x,.40,.85,1.34,.09,.91);
    for(let i=0;i<15;i++){
      const dx=(i%5-2)*.22,dz=(Math.floor(i/5)-1)*.22;
      k.oval(p,i%3?0x764b36:0xad6941,x+dx,.46,.85+dz,.063,.04,.085);
    }
  }
}
function harbor(k,p){
  k.box(p,0x57958f,0,.17,-.69,5.44,.26,4.28);
  for(const side of [-1,1]){
    k.box(p,0x969c83,side*3.26,.16,-.69,1.17,.29,4.34);
    for(let n=0;n<8;n++)k.box(p,n%3?0xbab79a:0xc6c2a4,side*2.79,.337,-2.51+n*.52,.37,.14,.498);
  }
  for(let i=0;i<12;i++){
    const x=(i%4-1.5)*1.12,z=-2.28+Math.floor(i/4)*1.56+(i%2)*.17;
    k.box(p,i%3?0x85b7a6:0xb4d2b9,x,.308,z,.45+(i%2)*.19,.017,.035);
  }
  const span=2.98, n=15;
  const deck=x=>.48+1.16*(1-(x/span)**2);
  for(let i=0;i<n;i++){
    const x1=-span+span*2*i/n,x2=x1+span*2/n,xx=(x1+x2)/2;
    const beam=k.box(p,i%2?0xc49870:0xcfa780,xx,(deck(x1)+deck(x2))/2,-.76,x2-x1+.057,.20,.99);
    beam.rotation.z=Math.atan2(deck(x2)-deck(x1),x2-x1);
    for(const z of [-1.29,-.23]){
      k.rod(p,0xac624a,[x1,deck(x1)+.55,z],[x2,deck(x2)+.55,z],.063);
      if(i%2===0) k.post(p,0xb37454,x1,deck(x1)+.30,z,.067,.66);
    }
  }
  for(const x of [-2.56,-1.75,1.75,2.56]) for(const z of [-1.17,-.35]) k.post(p,wood,x,deck(x)/2,z,.10,deck(x));
  for(const x of [-3.29,3.29]){
    k.box(p,0xd8bd95,x,.21,-.76,.75,.4,1.24);
    k.post(p,darkwood,x,1.42,-1.28,.082,2.45);
    k.rod(p,darkwood,[x,2.6,-1.28],[x,2.6,-.76],.055);
    lantern(k,p,x,2.18,-.76,.9);
  }
  for(const x of [-4.05,3.90]) for(let i=0;i<4;i++){
    const tx=x+(i-1.5)*.13;
    k.rod(p,i%2?0x809757:0xa19c5a,[tx,.20,-.12],[tx+(i-1.5)*.12,.72+(i%2)*.22,-.1],.033);
  }
  const skiff=k.group(p,.26,.31,.75); skiff.rotation.y=-.34;
  k.oval(skiff,0x8b5943,0,.13,0,.95,.15,.28); k.oval(skiff,0xd2a67b,0,.225,0,.78,.079,.218);
  k.oval(skiff,0x806a54,0,.250,0,.63,.064,.17);
  for(const dx of [-.39,.22])k.box(skiff,0xbd9065,dx,.306,0,.115,.047,.34);
  k.rod(skiff,0xa5794f,[-.74,.36,-.27],[.63,.36,.30],.029);
  const paddle=k.oval(skiff,wood,.66,.36,.31,.19,.037,.071);paddle.rotation.y=-.42;
  tree(k,p,-3.51,-2.63,.78);
}
function salt(k,p){
  k.box(p,0xb9aa88,-.62,.10,-.55,6.81,.2,3.82);
  for(let r=0;r<2;r++) for(let col=0;col<3;col++){
    const x=-2.85+2.24*col,z=-1.50+1.82*r;
    k.box(p,[0x91b7b1,0x94bdbe,0xb3cab9,0xa6c6bd,0x86aca8,0xafccbf][r*3+col],x,.22,z,2.05,.085,1.61);
    if((r+col)%2===0) {
      k.peak(p,0xf0e9d3,x-.22,.59,z,.63,.72,.53);
      k.peak(p,0xfff3df,x+.17,.47,z+.13,.44,.50,.36);
      for(const [dx,dz,s] of [[-.60,.13,.13],[.40,.22,.105],[-.17,.40,.083],[-.47,.32,.059]]) k.rock(p,0xf1e7cf,x+dx,.28,z+dz,s,.82*s,.72*s);
    } else k.box(p,0xd2e4cd,x,.27,z,.82,.031,.07);
  }
  const hut=k.group(p,3.00,0,-1.54);
  k.box(hut,0xa28764,0,.15,0,1.96,.28,1.40);
  for(const tx of [-.86,.86]) for(const tz of [-.56,.56]) k.post(hut,wood,tx,.86,tz,.087,1.53);
  k.box(hut,0xbca583,0,.91,-.60,1.82,1.37,.14);
  for(let i=0;i<7;i++) k.box(hut,0x99805f,-.75+i*.25,.88,-.51,.045,1.23,.065);
  roof(k,hut,0,1.64,0,2.27,.52,1.76,0xa59977,0x816c51);
  k.box(hut,wood,-.31,.47,-.08,1.04,.10,.48);
  for(let i=0;i<5;i++){
    const pole=k.post(p,0xb18b61,3.24,.17,.10+i*.15,.075,1.9);
    pole.rotation.z=Math.PI/2;
  }
  k.rod(p,wood,[3.24,.22,.44],[3.24,1.86,.44],.06);
  const flag=k.box(p,0xd48c64,3.53,1.44,.44,.54,.60,.045); flag.rotation.z=-.12;
  k.rod(p,darkwood,[-3.43,.19,.87],[-2.64,1.93,1.04],.055);
  k.box(p,wood,-3.42,.25,.88,.64,.13,.18);
}

const builders={'shuixian-morning':[market,marketFront],'yujing-morning':[mango,orchardFront],
  'anping-afternoon':[alley,laneFront],'dongshan-afternoon':[coffee,hillsideFront],
  'yanshui-evening':[harbor,watersideFront],'beimen-evening':[salt,saltFront]};
export function makeLandmark(k,id) {
  const p=new THREE.Group();
  streetSetting(k,p,id);
  for(const build of builders[id])build(k,p);
  return k.bake(p);
}

// Colours, hair and the item each person carries give them a readable silhouette
// both in the street and from the map. Positions below are relative to the feet.
const residents = {
  'shuixian-morning':   [0xb8493f,0x284f52,0x453234,0xe9aa84,'bun','apron','greens'],
  'yujing-morning':     [0xe39a35,0x315b59,0x483631,0xd79b70,'straw','overalls','mango'],
  'anping-afternoon':   [0xac4845,0x35475b,0x3b3032,0xf2ba94,'bob','dress','tote'],
  'dongshan-afternoon': [0xe7cfaa,0x3d5552,0x493530,0xdb9b75,'kerchief','apron','coffee'],
  'yanshui-evening':    [0xe5cba6,0x435469,0xb9b8a9,0xdba380,'silver','vest','sketch'],
  'beimen-evening':     [0x4c8f94,0x304b60,0x443a38,0xca8b68,'bucket','sailor','bottle'],
  player:               [0x267d77,0xb99665,0x483633,0xedb38e,'cap','jacket','satchel']
};
const neighbors = {
  'shuixian-morning':   [0x528291,0xad8564,0x423435,0xebaf8d,'bob','sailor','tote'],
  'yujing-morning':     [0xca6d42,0x345e6e,0x493631,0xe6a27d,'cap','overalls','bottle'],
  'anping-afternoon':   [0xba6e85,0x4c6074,0x4d3532,0xebae85,'braid','dress',null],
  'dongshan-afternoon': [0x528c94,0xaa8459,0x563b33,0xd59974,'wave','sailor',null],
  'yanshui-evening':    [0xad7887,0x3c6968,0x463436,0xedb591,'bob','dress','sketch'],
  'beimen-evening':     [0x568394,0xa78e61,0x473633,0xe3a37e,'bucket','sailor',null]
};
const traveler=[0xe0a042,0x3b536a,0x503a34,0xcc8d6b,'wave','overalls','pack'];
const rice=0xffe9be, midnight=0x322d37, coral=0xb64b43, gold=0xf2b948, sea=0x356d72;
const rounded = (k,far,p,c,x,y,z,w,h,d) => k.part(p,far?k.farBall:k.bead,c,x,y,z,w,h,d);

function makeHead(k,head,look,far) {
  const [, ,hair,skin,style]=look;
  const oval=(...args)=>rounded(k,far,head,...args);
  // A broad cheek and a short chin keep the expression legible from the pavement.
  k.part(head,far?k.farBall:k.bead,skin,0,0,0,.462,.435,.367);
  for(const side of [-1,1]){
    oval(skin,side*.438,-.028,-.026,.078,.102,.073);
    if(!far) oval(0xcb806b,side*.465,-.025,.026,.038,.052,.024);
    if(style==='kerchief'){
      const lid=k.part(head,k.smileMark,midnight,side*.165,.036,.350,.060,.083,1);
      lid.rotation.set(-.04,side*.28,Math.PI);
    }else{
      const eye=oval(midnight,side*.165,.034,.337,.051,.066,.032);
      eye.rotation.y=side*.24;
      if(!far) oval(0xfff3d9,side*.165-.013,.056,.362,.017,.019,.009);
    }
    if(!far) {
      const brow=oval(style==='silver'?0x726e60:hair,side*.167,.149,.315,.074,.021,.022);
      brow.rotation.z=side*(style==='silver'?.20:.11)+(style==='straw'?.12:0);
    }
    const cheek=oval(0xda776b,side*.292,-.075,.277,.095,.044,.026);
    cheek.rotation.y=side*.57;
  }
  oval(skin,0,-.040,.356,.057,.054,.052);
  const smile=k.part(head,k.smileMark,0x8c4a46,0,-.148,.345,style==='kerchief'?.115:.097,style==='wave'?.083:.066,1);
  smile.rotation.set(.27,0,style==='straw'?.08:0);
  if(style==='silver'){
    for(const s of [-1,1]){
      if(!far) k.hoop(head,0x445665,s*.164,.040,.367,.111,.094,.15);
      const whisker=oval(0xd5cbb7,s*.045,-.103,.350,.061,.025,.016);
      whisker.rotation.z=s*.16;
    }
    if(!far) k.rod(head,0x445665,[-.054,.045,.377],[.054,.045,.377],.013);
  }

  oval(hair,0,.201,-.070,.474,.282,.366);
  oval(hair,-.015,.014,-.232,.414,.333,.169);
  if(style==='bob'||style==='braid'){
    const fringe=oval(hair,-.036,.244,.226,.299,.086,.118);
    fringe.rotation.z=style==='bob'?-.15:.09;
    oval(hair,.189,.219,.222,.145,.083,.119);
  }else{
    const fringe=oval(hair,-.133,.239,.220,.243,.097,.108);
    fringe.rotation.z=style==='kerchief'?.64:.37;
  }
  const sideLock=oval(hair,.248,.205,.170,.16,.111,.165);
  sideLock.rotation.z=-.44;
  if(style==='bob'||style==='braid'){
    for(const side of [-1,1]){
      const lock=oval(hair,side*.391,-.017,-.033,.116,.225,.228);
      lock.rotation.z=-side*.12;
      if(style==='braid'){
        oval(hair,side*.424,-.212,.020,.096,.115,.100);
        oval(gold,side*.424,-.293,.040,.082,.038,.084);
        oval(hair,side*.439,-.342,.049,.063,.082,.066);
      }
    }
    if(!far){
      for(const d of [0,.048]){
        const pin=oval(gold,-.347,.146+d,.222,.060,.014,.025);
        pin.rotation.z=-.51;
      }
    }
  }else if(style==='bun'||style==='kerchief'){
    const side=style==='bun'?-1:1;
    oval(hair,side*.229,.408,-.17,.202,.195,.164);
    if(style==='bun'){
      oval(coral,-.208,.329,-.131,.189,.060,.168);
      k.rod(head,gold,[-.407,.405,-.121],[-.069,.500,-.075],.018);
      oval(rice,-.408,.405,-.121,.037,.037,.037);
    }else{
      const band=oval(sea,0,.293,.015,.46,.114,.317);
      band.rotation.z=-.16;
      for(const sign of [-1,1]){
        const knot=oval(gold,.35+sign*.060,.340,-.047,.092,.050,.047);
        knot.rotation.z=sign*.55;
      }
    }
  }else if(style==='wave'||style==='silver'){
    for(const [x,y] of [[-.297,.268],[-.092,.365],[.116,.334]]){
      const wave=oval(hair,x,y,.113,.174,.141,.208);
      wave.rotation.z=-.48;
    }
  }else if(style==='cap'){
    const cap=look===residents.player?gold:sea;
    oval(cap,0,.344,-.020,.464,.207,.379);
    const brim=oval(cap,.032,.275,.259,.370,.052,.248);
    brim.rotation.z=-.055;
    oval(look===residents.player?coral:rice,0,.543,-.027,.046,.031,.043);
    if(!far) oval(rice,-.11,.382,.345,.052,.050,.021);
  }else if(style==='straw'){
    oval(0xd09047,0,.277,.002,.586,.061,.494);
    oval(0xe9b963,0,.298,.002,.581,.052,.490);
    oval(0xe3ad5a,0,.386,-.027,.363,.183,.308);
    oval(sea,0,.337,-.021,.366,.050,.314);
  }else if(style==='bucket'){
    k.taper(head,0x487e88,0,.358,-.008,.453,.246,.378);
    k.taper(head,0x315b6b,0,.267,.017,.536,.108,.446);
    if(!far) k.taper(head,0xeecb87,0,.315,-.006,.449,.040,.378);
  }
}

function dressBody(k,p,look,far) {
  const [shirt,trousers,,skin,,outfit,item]=look;
  const oval=(...args)=>rounded(k,far,p,...args);
  const cloth=outfit==='vest'?0x365568:shirt;
  k.taper(p,cloth,0,1.025,0,.349,.587,.239).rotation.z=Math.PI;
  oval(cloth,0,1.255,0,.359,.16,.237);
  oval(trousers,0,.717,-.007,.301,.132,.215);
  oval(skin,0,1.394,.003,.14,.14,.14);
  if(outfit==='dress'){
    k.taper(p,shirt,0,.786,0,.391,.324,.259);
    k.taper(p,0xe7be8d,0,.905,0,.328,.053,.235);
  }
  if(outfit==='apron'||outfit==='overalls'){
    const fabric=outfit==='overalls'?trousers:item==='coffee'?0x356864:0x457667;
    k.taper(p,fabric,0,.899,.133,.284,.436,.148);
    k.box(p,fabric,0,1.135,.216,.337,.212,.055);
    for(const s of [-1,1]){
      k.rod(p,fabric,[s*.136,1.214,.218],[s*.183,1.365,.14],.033);
      if(!far) oval(gold,s*.133,1.217,.252,.022,.023,.012);
    }
    if(!far){
      k.box(p,item==='coffee'?0xc49165:0x92aa85,0,.973,.285,.177,.112,.017);
      k.box(p,rice,0,1.021,.299,.173,.014,.013);
    }
  }else if(outfit==='vest'){
    k.peak(p,rice,0,1.242,.205,.139,.243,.055).rotation.z=Math.PI;
    if(!far){
      for(const y of [.870,.961,1.055]) oval(0xceab73,0,y,.226,.019,.020,.017);
      k.box(p,0x809296,-.169,.902,.184,.120,.025,.031);
    }
  }else if(outfit==='jacket'){
    k.box(p,rice,0,1.029,.167,.219,.514,.140);
    for(const s of [-1,1]){
      k.rod(p,0x398a7e,[s*.179,1.317,.176],[s*.109,1.095,.238],.034);
    }
    if(!far) for(const y of [.924,1.021,1.119]) k.box(p,sea,0,y,.242,.204,.028,.013);
  }else if(!far&&outfit==='sailor'){
    for(const y of [.976,1.082,1.186]) k.box(p,rice,0,y,.221,.343,.029,.020);
  }
  if(item==='satchel'||item==='bottle'){
    k.rod(p,0xa26541,[.211,1.345,.172],[.011,1.114,.262],.032);
    k.rod(p,0xa26541,[.011,1.114,.262],[-.276,.795,.219],.032);
    if(item==='satchel'){
      const bag=k.group(p,-.277,.757,.181);bag.rotation.z=-.12;
      k.box(bag,0xb87940,0,0,0,.312,.229,.134);
      k.box(bag,gold,0,.046,.073,.310,.093,.031);
      if(!far) k.box(bag,rice,0,.020,.096,.040,.050,.021);
    }else{
      k.post(p,0x347f87,-.30,.825,.166,.086,.282);
      k.post(p,rice,-.30,.982,.166,.075,.050);
    }
  }else if(item==='pack'){
    oval(0x50746c,0,1.040,-.215,.287,.309,.180);
    const roll=k.post(p,0xc69261,0,1.283,-.244,.087,.512);
    roll.rotation.z=Math.PI/2;
    for(const s of [-1,1]) k.rod(p,0xa16c49,[s*.203,1.358,.113],[s*.220,1.016,.192],.030);
  }
  if((outfit==='vest'||outfit==='dress'||outfit==='sailor')&&!far){
    for(const side of [-1,1]){
      const collar=oval(rice,side*.089,1.340,.179,.086,.065,.031);
      collar.rotation.z=-side*.44;
    }
  }
}

function carriedItem(k,p,item,far) {
  const oval=(...args)=>rounded(k,far,p,...args);
  if(item==='greens'||item==='mango'||item==='tote'){
    const x=-.205,y=-.616,z=.057,tote=item==='tote';
    const basket=k.group(p,x,y,z);
    const loop=k.hoop(basket,tote?0x895d45:0x9e6c42,.015,.106,0,.178,.157,.27);
    loop.rotation.z=-.1;
    if(tote){
      k.box(basket,0xcf9569,0,-.086,0,.376,.318,.177);
      k.box(basket,0xae624a,0,-.165,.093,.372,.094,.018);
    }else{
      k.taper(basket,0xbe884f,0,-.079,0,.268,.231,.157).rotation.z=Math.PI;
      rounded(k,far,basket,0xe5b76f,0,.029,0,.270,.039,.155);
      if(!far) for(const x of [-.16,-.06,.055,.153]){
        k.rod(basket,0xe2b16d,[x*.86,-.166,.123],[x,-.02,.142],.011);
      }
      if(item==='mango'){
        for(const [dx,dy] of [[-.116,.077],[.05,.095],[.132,.066]]) oval(0xf8ae37,x+dx,y+dy,z,.083,.104,.076).rotation.z=-.36;
        oval(0x537b4f,x+.113,y+.181,z,.074,.034,.047).rotation.z=.62;
      }else{
        oval(rice,x-.057,y+.071,z,.094,.061,.080);
        for(const [dx,dy,a] of [[.093,.18,-.43],[.018,.206,.13],[-.080,.18,.58]]){
          oval(0x548251,x+dx,y+dy,z,.052,.164,.041).rotation.z=a;
          if(!far) oval(0x91a758,x+dx-.018,y+dy,z+.016,.022,.134,.027).rotation.z=a;
        }
      }
    }
  }else if(item==='coffee'){
    k.post(p,rice,.112,-.338,.16,.12,.175);
    k.post(p,0x674335,.112,-.248,.16,.097,.013);
    k.hoop(p,rice,.235,-.33,.159,.066,.063,.19);
  }else if(item==='sketch'){
    const book=k.group(p,-.086,-.387,.137);book.rotation.z=-.25;book.rotation.x=-.29;
    k.box(book,0x936449,0,0,0,.214,.285,.050);
    k.box(book,rice,.009,0,.026,.193,.267,.017);
    if(!far) k.rod(book,coral,[-.066,-.072,.045],[.070,.081,.045],.013);
  }
}

export function makePerson(k,id,animated=false,appearance=0) {
  const variant=typeof appearance==='number'?appearance:appearance?.variant||0;
  const far=appearance?.detail==='far';
  const look=variant===2?traveler:variant===1?(neighbors[id]||traveler):(residents[id]||residents.player);
  const [shirt,trousers,,skin,style,,item]=look;
  const child=variant===1&&(id==='anping-afternoon'||id==='yujing-morning');
  const elder=style==='silver';
  const root=new THREE.Group(), body=k.group(root),legs=[],arms=[];
  const torso=new THREE.Group();
  const height=child?.825:elder?.92:variant===2?1.01:.98;
  body.scale.set(child?.91:elder?1.045:1,height,1);
  dressBody(k,torso,look,far);
  const head=k.group(torso,0,child?1.726:1.766,elder?.032:.004);
  head.scale.setScalar(child?1.105:far?1.055:1);
  makeHead(k,head,look,far);
  body.add(k.bake(torso));

  const carried=item==='coffee'?1:['greens','mango','tote','sketch'].includes(item)?0:-1;
  for(const [i,s] of [-1,1].entries()){
    const leg=k.group(body,s*.158,.698,-.005),lower=new THREE.Group();
    k.taper(lower,trousers,0,-.242,0,.132,.511,.129).rotation.z=Math.PI;
    if(!far) k.taper(lower,look===residents.player?0xd2b58d:trousers,0,-.464,0,.125,.086,.129);
    rounded(k,far,lower,rice,0,-.529,.016,.106,.095,.106);
    const shoe=look===residents.player?rice:variant===2?0x946847:child?coral:0x694d41;
    rounded(k,far,lower,shoe,0,-.595,.067,.145,.092,.193);
    if(!far) rounded(k,false,lower,0x70574b,0,-.652,.061,.143,.041,.188);
    leg.add(k.bake(lower)); legs.push(leg);

    const arm=k.group(body,s*.320,1.236,0),upper=new THREE.Group();
    const sleeve=rounded(k,far,upper,shirt,s*.054,-.125,0,.133,.176,.139);
    sleeve.rotation.z=s*.22;
    if(!far) rounded(k,false,upper,skin,s*.094,-.281,.025,.077,.153,.083);
    rounded(k,far,upper,skin,s*.098,far?-.307:-.391,.072,.092,far?.156:.103,.096);
    if(!far) rounded(k,false,upper,skin,s*.051,-.360,.123,.046,.056,.036);
    if(i===carried) carriedItem(k,upper,item,far);
    arm.add(k.bake(upper));arms.push(arm);
  }
  if(!animated) root.rotation.y=-.46;
  return {root,body,legs,arms,carried,lean:elder?.033:0};
}
