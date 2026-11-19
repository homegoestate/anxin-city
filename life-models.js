import * as THREE from 'three';

// All models are built in local coordinates, with the front of each shop facing +Z.
// Combining their coloured surfaces keeps even a whole market to one draw call.
export function createModelKit() {
  const cube = new THREE.BoxGeometry();
  const ball = new THREE.SphereGeometry(1, 12, 9);
  const crown = new THREE.IcosahedronGeometry(1, 0);
  const soft = new THREE.IcosahedronGeometry(1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
  const cone = new THREE.ConeGeometry(1, 1, 9);
  const simpleMaterials = new Map();
  const sources = new Set([cube, ball, crown, soft, cylinder, cone]);
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
    const positions=[], normals=[], colors=[], indices=[];
    root.traverse(obj=>{
      if (!obj.isMesh) return;
      transform.multiplyMatrices(inverse,obj.matrixWorld);
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
    return new THREE.Mesh(geo,surface);
  }
  function releaseSources() {
    for(const source of sources) source.dispose();
    for(const material of simpleMaterials.values()) material.dispose();
  }
  return {box,oval,rock,post,peak,rod,group,part,bake,releaseSources};
}

const wood=0x9b6440, darkwood=0x664334, cream=0xffe4ae, spruce=0x376d58;
const yards = {
  'shuixian-morning': 0xcba87b, 'yujing-morning':0xb7ba76, 'anping-afternoon':0xcdab8d,
  'dongshan-afternoon':0x9cab76, 'yanshui-evening':0xb4b299, 'beimen-evening':0xc9baa0
};

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
  [[-.65,2.1,.04,.85,0x548754],[.58,2.18,-.02,1,0x699758],[0,2.69,-.15,1.11,0x88a65d],[0,2.07,.36,.76,0x558855]].forEach(([tx,ty,tz,r,c])=>{
    const leaf=k.rock(t,c,tx,ty,tz,r,r*.81,r*.79,true); leaf.rotation.z=tx;
  });
  for(const [a,b,c,twist] of [[-.83,2.23,.53,-.82],[-.70,2.49,.50,.9],[.51,2.54,.56,-.69],[1.01,2.30,.45,.9],[.12,2.94,.50,.92],[-.16,2.20,.87,-1]]){
    const leaf=k.oval(t,0x83a45f,a,b,c,.078,.20,.042); leaf.rotation.z=twist;
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
  k.post(p,0xffc367,x,y+.26*s,z,.16*s,.07*s);
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
  k.box(temple,0x5b795a,0,2.02,1.09,1.05,.34,.12);
  for(const x of [-.28,0,.28]) k.box(temple,0xffce70,x,2.03,1.16,.11,.14,.032);
  roof(k,temple,0,2.48,0,4.66,.84,2.78,0xb45b47,0xe29756);
  roof(k,temple,0,3.12,-.06,3.36,.55,1.29,0x4e8476,0xe6a64b);
  for(const side of [-1,1]){
    k.rod(temple,0xf2bd65,[side*1.49,3.7,-.06],[side*1.85,4,-.06],.10);
    k.rod(temple,0xf2bc64,[side*2.17,2.53,1.38],[side*2.48,2.79,1.38],.09);
    lantern(k,temple,side*1.34,1.84,1.20,.84);
  }
  stall(k,p,-3,.91,0xc9684b,0x6c9350);
  stall(k,p,3.04,.7,0x6a9991,0xdf963c);
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
  const gate=k.group(p,-1.45,0,-.27);
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
  k.oval(p,0x9fc4ad,0,.055,-.73,4.55,.23,2.40);
  k.oval(p,0x659c99,0,.17,-.73,4.38,.18,2.21);
  for(let i=0;i<11;i++){
    const x=(i%6-2.5)*1.23,z=-2.13+Math.floor(i/6)*2.42+(i%2)*.13;
    k.box(p,0xc0ddbd,x,.333,z,.43,.045,.045);
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
  const skiff=k.group(p,2.2,.33,-1.93); skiff.rotation.y=-.20;
  k.oval(skiff,0x9c6946,0,.14,0,.95,.16,.24); k.oval(skiff,0xc69360,0,.25,0,.64,.06,.17);
  tree(k,p,-3.51,-2.63,.78);
}
function salt(k,p){
  k.box(p,0xb9aa88,-.62,.10,-.55,6.81,.2,3.82);
  for(let r=0;r<2;r++) for(let col=0;col<3;col++){
    const x=-2.85+2.24*col,z=-1.50+1.82*r;
    k.box(p,[0x91b7b1,0x94bdbe,0xb3cab9,0xa6c6bd,0x86aca8,0xafccbf][r*3+col],x,.22,z,2.05,.085,1.61);
    if((r+col)%2===0) {
      k.peak(p,0xece5c6,x-.22,.59,z,.63,.72,.53);
      k.peak(p,0xfff2d9,x+.17,.47,z+.13,.44,.50,.36);
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

const builders={'shuixian-morning':market,'yujing-morning':mango,'anping-afternoon':alley,'dongshan-afternoon':coffee,'yanshui-evening':harbor,'beimen-evening':salt};
export function makeLandmark(k,id) {
  const p=new THREE.Group();
  k.oval(p,yards[id],0,.02,-.05,4.92,.14,3.46);
  // The pale southern lane is shared by the two characters and stays clear of the scenery.
  k.oval(p,0xe2cf9f,0,.10,2.44,3.99,.10,.82);
  builders[id](k,p);
  return k.bake(p);
}

const outfits={
  'shuixian-morning':[0xbc7c64,0x778563,0x554034,'bun'],
  'yujing-morning':[0xe0af56,0x667e68,0x553d32,'brim'],
  'anping-afternoon':[0xb8765f,0x758d81,0x4f3b32,'bob'],
  'dongshan-afternoon':[0xe0d5ac,0x617f67,0x554238,'bun'],
  'yanshui-evening':[0xdfccad,0x647a71,0x9d9b86,'silver'],
  'beimen-evening':[0x9cb9aa,0x738472,0x4b4740,'brim'],
  player:[0x417764,0xcaba91,0x473b33,'wave']
};
export function makePerson(k,id,animated=false) {
  const [shirt,trousers,hair,style]=outfits[id],skin=0xe8ad81;
  const root=new THREE.Group(), body=new THREE.Group(), legs=[], arms=[];
  const torso=new THREE.Group();
  k.oval(torso,shirt,0,.97,0,.36,.49,.257);
  k.oval(torso,skin,0,1.44,0,.137,.14,.12);
  k.oval(torso,skin,0,1.80,0,.389,.437,.343);
  for(const side of [-1,1]){
    k.oval(torso,skin,side*.371,1.78,0,.073,.112,.064);
    k.oval(torso,0x483e36,side*.14,1.84,.307,.04,.055,.025);
    k.oval(torso,0xffebd7,side*.14-.009,1.863,.329,.012,.014,.009);
    k.oval(torso,0xde937d,side*.235,1.70,.258,.059,.025,.020);
  }
  k.oval(torso,skin,0,1.75,.34,.06,.061,.043);
  k.rod(torso,0x9f6550,[-.064,1.66,.317],[.00,1.645,.327],.012);
  k.rod(torso,0x9f6550,[.00,1.645,.327],[.064,1.66,.317],.012);
  k.oval(torso,hair,0,1.99,-.058,.405,.286,.335);
  for(let i=0;i<3;i++){
    const lock=k.oval(torso,hair,-.20+i*.18,2.035-(i%2)*.061,.199,.154,.115,.137);
    lock.rotation.z=-.34;
  }
  if(style==='bun') k.oval(torso,hair,.02,2.22,-.20,.217,.193,.19);
  if(style==='bob') for(const side of [-1,1]) k.oval(torso,hair,.318*side,1.84,-.035,.108,.272,.223);
  if(style==='brim'){
    k.oval(torso,0xd5aa64,0,2.085,0,.52,.073,.449);
    k.oval(torso,0xe3bd77,0,2.167,-.02,.36,.18,.30);
    k.oval(torso,0x9c6a43,0,2.137,0,.36,.041,.308);
  }
  if(style==='silver') for(const s of [-1,1]) k.rod(torso,hair,[s*.09,1.953,.292],[s*.21,1.958,.25],.022);
  if(id==='player'){
    k.oval(torso,cream,0,1.05,.182,.183,.35,.083);
    k.rod(torso,0xaa7e4c,[.209,1.32,.176],[-.27,.76,.221],.043);
    k.box(torso,0xb7854c,-.285,.745,.213,.31,.25,.12);
    k.box(torso,0xe4b56f,-.285,.796,.28,.30,.064,.037);
  } else if(['shuixian-morning','dongshan-afternoon'].includes(id)) {
    k.oval(torso,id==='shuixian-morning'?0x91aa79:0x567660,0,.94,.19,.264,.324,.084);
    k.box(torso,cream,0,.98,.276,.132,.072,.021);
  }
  const torsoMesh=k.bake(torso); body.add(torsoMesh);
  for(const s of [-1,1]){
    const leg=new THREE.Group(), arm=new THREE.Group(), lower=new THREE.Group(), upper=new THREE.Group();
    leg.position.set(s*.155,.70,0);
    k.oval(lower,trousers,0,-.245,0,.13,.275,.13);
    k.oval(lower,0x655144,0,-.574,.048,.137,.123,.20);
    leg.add(k.bake(lower)); body.add(leg); legs.push(leg);
    arm.position.set(s*.32,1.22,0);
    k.oval(upper,shirt,s*.045,-.166,0,.117,.215,.121);
    k.oval(upper,skin,s*.082,-.405,.034,.094,.112,.097);
    if(s>0&&id==='dongshan-afternoon'){
      k.post(upper,cream,.12,-.36,.15,.112,.163);
      k.post(upper,darkwood,.12,-.273,.15,.087,.014);
    }
    if(s<0&&['shuixian-morning','yujing-morning','anping-afternoon'].includes(id)){
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
