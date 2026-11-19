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
  const letterCells=new Map();
  let paper,pen,ink;
  const simpleMaterials = new Map();
  const sources = new Set([cube, ball, crown, soft, cylinder, cone,tapered,hoopShape,letterPlane]);
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
  return {box,oval,rock,post,peak,taper,hoop,letters,rod,group,part,bake,releaseSources};
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

const outfits={
  'shuixian-morning':[0xc06f5a,0x66775f,0x523b36,'bun'],
  'yujing-morning':[0xe0af56,0x677f75,0x553d32,'brim'],
  'anping-afternoon':[0xba6e5f,0x66827c,0x4f3b32,'bob'],
  'dongshan-afternoon':[0xdbc6a2,0x567d68,0x554238,'bun'],
  'yanshui-evening':[0xcbb48c,0x546e6d,0xb3aaa0,'silver'],
  'beimen-evening':[0x80aaa4,0x707d65,0x4b4740,'brim'],
  player:[0x29796f,0xc7a980,0x493f39,'cap']
};
const neighbors={
  'shuixian-morning':[0x719aa6,0xd0b694,0x4c4138,'bob'],
  'yujing-morning':[0xb58a61,0x638b91,0x524033,'cap'],
  'anping-afternoon':[0xb19cb7,0x6e827b,0x593d34,'braid'],
  'dongshan-afternoon':[0x799eab,0xa99970,0x674a3a,'wave'],
  'yanshui-evening':[0xa89bb2,0x637e75,0x5d463b,'bob'],
  'beimen-evening':[0x86a8b1,0xc1a67e,0x543d32,'cap'],
};
export function makePerson(k,id,animated=false,appearance=0) {
  const variant=typeof appearance==='number'?appearance:appearance?.variant||0;
  const pedestrian=variant>0,player=id==='player',resident=!pedestrian&&!player;
  const [shirt,trousers,hair,style]=variant===2?[0xc69448,0x63778a,0x685246,'wave']:variant===1?(neighbors[id]||outfits.player):(outfits[id]||outfits.player);
  const skin=variant===2?0xc88d70:variant===1?0xf1bb98:id==='beimen-evening'?0xd8a17e:0xe6ad89;
  const root=new THREE.Group(), body=new THREE.Group(), legs=[], arms=[];
  const torso=new THREE.Group();
  const overshirt=k.taper(torso,shirt,0,1.03,0,.348,.65,.232);
  overshirt.rotation.z=Math.PI;
  k.oval(torso,shirt,0,1.265,0,.343,.175,.224);
  k.oval(torso,trousers,0,.704,0,.295,.131,.205);
  k.oval(torso,skin,0,1.44,0,.137,.14,.12);
  k.oval(torso,skin,0,1.79,0,.375,.419,.332);
  for(const side of [-1,1]){
    k.oval(torso,skin,side*.357,1.77,0,.067,.089,.065);
    k.oval(torso,0xeb9f84,side*.373,1.765,.044,.035,.045,.024);
    k.oval(torso,0x493d39,side*.136,1.833,.302,.041,.053,.029);
    k.oval(torso,0xffebd7,side*.136-.012,1.852,.329,.013,.014,.009);
    const brow=k.oval(torso,hair,side*.144,1.922,.282,.071,.018,.020);
    brow.rotation.z=side*.13;
    k.oval(torso,0xde937d,side*.235,1.70,.258,.059,.025,.020);
    if(!player){
      const collar=k.oval(torso,variant===2?0xf2d28b:0xf1dcba,side*.092,1.36,.176,.068,.079,.032);
      collar.rotation.z=side*.56;
    }
  }
  k.oval(torso,skin,0,1.75,.331,.06,.061,.053);
  k.rod(torso,0x9f6550,[-.064,1.66,.317],[.00,1.645,.327],.012);
  k.rod(torso,0x9f6550,[.00,1.645,.327],[.064,1.66,.317],.012);
  k.oval(torso,hair,0,1.98,-.060,.389,.267,.329);
  for(const [dx,dy,w,h,tilt] of [[-.24,1.974,.12,.136,-.60],[-.05,2.039,.208,.102,.31],[.173,2.014,.160,.109,.44],[.276,1.953,.096,.109,.47]]){
    const lock=k.oval(torso,hair,dx,dy,.184,w,h,.131);
    lock.rotation.z=tilt;
  }
  if(style==='bun'){
    k.oval(torso,0xb7654c,.019,2.15,-.19,.184,.093,.17);
    k.oval(torso,hair,.028,2.265,-.24,.204,.175,.19);
    k.rod(torso,0xdeaa72,[-.13,2.19,-.13],[.24,2.31,-.13],.016);
  }
  if(style==='bob'||style==='braid'){
    for(const side of [-1,1]) k.oval(torso,hair,.308*side,1.82,-.059,.094,.233,.203);
    k.oval(torso,hair,0,1.81,-.179,.348,.24,.18);
    if(style==='braid')for(const dx of [-.24,.24]){
      for(let i=0;i<3;i++)k.oval(torso,hair,dx,1.71-i*.082,-.15,.075-i*.012,.065,.077);
      k.oval(torso,0xb88789,dx,1.53,-.15,.059,.029,.059);
    }
  }
  if(style==='cap'){
    const cap=player?0xedb546:0x698ba2;
    k.oval(torso,cap,.01,2.099,-.010,.383,.176,.337);
    k.oval(torso,cap,.029,2.060,.253,.306,.044,.236);
    k.oval(torso,player?0xc98543:0x587682,.01,2.264,-.008,.042,.029,.046);
    k.rod(torso,player?0xf2d07c:0x8eafbb,[.01,2.254,.035],[.012,2.106,.283],.009);
  }
  if(style==='brim'){
    k.oval(torso,0xd5aa64,0,2.085,0,.52,.073,.449);
    k.oval(torso,0xe3bd77,0,2.167,-.02,.36,.18,.30);
    k.oval(torso,0x9c6a43,0,2.137,0,.36,.041,.308);
  }
  if(style==='silver'){
    for(const s of [-1,1])k.hoop(torso,0x716857,s*.139,1.836,.329,.094,.072,.12);
    k.rod(torso,0x716857,[-.046,1.846,.342],[.046,1.846,.342],.011);
  }
  if(player){
    k.taper(torso,cream,0,1.036,.153,.164,.58,.092);
    for(const yy of [.95,1.02,1.09])k.box(torso,0x97a99a,0,yy,.245,.20,.018,.019);
    for(const s of [-1,1]){
      const lapel=k.oval(torso,0x579187,s*.128,1.296,.18,.072,.105,.038);
      lapel.rotation.z=s*.44;
    }
    k.rod(torso,0xaa7e4c,[.209,1.32,.176],[-.27,.76,.221],.043);
    k.box(torso,0xb7854c,-.285,.745,.213,.31,.25,.12);
    k.box(torso,0xe4b56f,-.285,.796,.28,.30,.064,.037);
    k.box(torso,cream,-.285,.773,.304,.043,.041,.024);
  }else if(resident&&['shuixian-morning','dongshan-afternoon'].includes(id)) {
    const apron=id==='shuixian-morning'?0x87a181:0x547c69;
    k.taper(torso,apron,0,.93,.135,.268,.50,.147);
    for(const s of [-1,1])k.rod(torso,apron,[s*.118,1.15,.226],[s*.169,1.37,.145],.027);
    k.box(torso,0xaeb793,0,.91,.276,.171,.113,.023);
    k.box(torso,cream,0,.961,.295,.173,.018,.016);
  }else{
    for(let j=0;j<3;j++)k.oval(torso,cream,0,1.24-j*.13,.224,.015,.016,.013);
    k.box(torso,variant===2?0xe1b773:shirt,-.167,1.16,.206,.115,.097,.020);
    if(variant===2){
      for(const s of [-1,1])k.rod(torso,0x687570,[s*.20,1.365,.14],[s*.22,1.04,.193],.032);
      k.oval(torso,0x89928a,0,1.07,-.196,.268,.343,.144);
    }
  }
  if(pedestrian)body.scale.setScalar(variant===2?.92:id==='shuixian-morning'?.94:.82);
  const torsoMesh=k.bake(torso); body.add(torsoMesh);
  for(const s of [-1,1]){
    const leg=new THREE.Group(), arm=new THREE.Group(), lower=new THREE.Group(), upper=new THREE.Group();
    leg.position.set(s*.155,.70,0);
    k.taper(lower,trousers,0,-.245,0,.124,.49,.121).rotation.z=Math.PI;
    k.oval(lower,trousers,0,-.027,0,.134,.11,.137);
    k.taper(lower,player||variant===1?0xc3af8e:trousers,0,-.464,0,.117,.071,.12);
    k.oval(lower,cream,0,-.525,.014,.103,.078,.11);
    const shoe=player?0xf3d9a7:variant===1?0xc49169:0x795d49;
    k.oval(lower,shoe,0,-.598,.059,.132,.090,.194);
    k.oval(lower,player?0xac8b6e:0x66564a,0,-.651,.057,.132,.041,.193);
    for(const j of [0,1])k.box(lower,0xe6cdac,0,-.533,.105+j*.054,.094,.012,.017);
    leg.add(k.bake(lower)); body.add(leg); legs.push(leg);
    arm.position.set(s*.32,1.22,0);
    const sleeve=k.oval(upper,shirt,s*.039,-.146,0,.121,.187,.125);sleeve.rotation.z=s*.15;
    k.oval(upper,skin,s*.075,-.304,.021,.072,.143,.079);
    k.oval(upper,skin,s*.082,-.432,.055,.084,.099,.088);
    k.oval(upper,skin,s*.043,-.411,.105,.049,.057,.047);
    if(s>0&&resident&&id==='dongshan-afternoon'){
      k.post(upper,cream,.12,-.36,.15,.112,.163);
      k.post(upper,darkwood,.12,-.273,.15,.087,.014);
    }
    if(s<0&&(resident||id==='shuixian-morning'&&variant===1)&&['shuixian-morning','yujing-morning','anping-afternoon'].includes(id)){
      const basket=id!=='anping-afternoon', c=basket?0xc1985f:0xb78f62;
      for(const dx of [-.128,.128]) k.rod(upper,c,[dx-.10,-.39,.09],[dx*1.26-.10,-.55,.09],.023);
      k.box(upper,c,-.10,-.65,.10,.43,.25,.22);
      if(basket){
        for(const dx of [-.13,-.03,.07,.17]) k.box(upper,0xa27c4d,dx-.11,-.65,.22,.020,.21,.011);
        for(let i=0;i<3;i++) k.oval(upper,id==='yujing-morning'?0xf2ac3a:0x688958,i*.095-.22,-.50,.13,.070,.085,.059);
      }
    }
    arm.add(k.bake(upper)); body.add(arm); arms.push(arm);
  }
  root.add(body);
  if(!animated){
    root.rotation.y=-.46;
  }
  return {root,body,legs,arms};
}
