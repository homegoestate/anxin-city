import * as THREE from 'three';

// Six district facilities in miniature. Locations within each vignette are illustrative.
// Bake coloured pieces into one mesh per facility so a window/bench never costs a draw call.
const builders = {
  'shuixian-morning': hospital,
  'yujing-morning': library,
  'anping-afternoon': playground,
  'dongshan-afternoon': park,
  'yanshui-evening': theatre,
  'beimen-evening': visitorCentre,
};
export function createAmenity(id) {
  const group = new THREE.Group();
  if (!builders[id]) return group;
  const positions = [], normals = [], colors = [];
  const box = new THREE.BoxGeometry(1,1,1).toNonIndexed();
  const rounded = new THREE.SphereGeometry(0.5,12,8).toNonIndexed();
  const matrix = new THREE.Matrix4(), normalMatrix = new THREE.Matrix3();
  const p = new THREE.Vector3(), n = new THREE.Vector3(), rotation = new THREE.Quaternion();
  function part(source, color, x,y,z, width,height,depth, rx=0,ry=0,rz=0) {
    rotation.setFromEuler(new THREE.Euler(rx,ry,rz));
    matrix.compose(new THREE.Vector3(x,y,z),rotation,new THREE.Vector3(width,height,depth));
    normalMatrix.getNormalMatrix(matrix);
    const tone = new THREE.Color(color);
    const vertex = source.getAttribute('position'), normal = source.getAttribute('normal');
    for (let i=0; i<vertex.count; i++) {
      p.fromBufferAttribute(vertex,i).applyMatrix4(matrix);
      n.fromBufferAttribute(normal,i).applyNormalMatrix(normalMatrix);
      positions.push(p.x,p.y,p.z); normals.push(n.x,n.y,n.z); colors.push(tone.r,tone.g,tone.b);
    }
  }
  const b=(...args)=>part(box,...args), oval=(...args)=>part(rounded,...args);
  builders[id](b,oval);
  box.dispose(); rounded.dispose();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9}));
  mesh.castShadow=true; mesh.receiveShadow=true;
  group.name='district-facility-'+id; group.add(mesh);
  return group;
}
const cream='#fff0cc', teal='#477e7b', green='#639967', wood='#986645', tile='#b25941', light='#f7d99a';
function roof(b,x,y,z,width,depth,color) {
  const rise=.28;
  const angle=Math.atan2(rise,depth/2);
  const length=Math.hypot(rise,depth/2)+.06;
  for(const side of [-1,1]) b(color,x,y+rise/2,z+side*depth/4,width,.10,length,side*angle);
}
function bench(b,x,z) {
  b(wood,x,.24,z,.55,.09,.22);
  for(const dx of [-.18,.18]) b(teal,x+dx,.12,z,.07,.24,.15);
  b(wood,x,.40,z-.08,.55,.12,.06);
}
function hospital(b) {
  b('#b7c3ae',0,.055,0,2.8,.11,1.65);
  b(cream,-.12,.67,-.13,2.34,1.2,1.06);
  b('#d6d0ba',-.12,1.3,-.13,2.44,.095,1.16);
  b('#4c7878',-.12,.83,.414,2.27,.31,.02);
  for(let x=-1.16;x<1;x+=.32)b(cream,x,.83,.43,.045,.34,.045);
  b(teal,.15,.30,.45,.5,.53,.06); b(teal,.15,.61,.58,.9,.09,.48);
  b(cream,-.75,1.32,.44,.49,.52,.1);
  b(teal,-.75,1.33,.505,.27,.09,.03); b(teal,-.75,1.33,.51,.09,.27,.035);
}
function library(b) {
  b('#b4c49b',0,.05,0,2.8,.1,1.65);
  b('#ead2a9',0,.48,-.12,2.22,.87,1.07);
  b(teal,0,.53,.425,1.74,.49,.06);
  for(const x of [-.76,-.38,0,.38,.76]) b(wood,x,.52,.46,.055,.57,.05);
  for(const side of [-1,1]) b('#4e8170',side*.58,1.00,-.10,1.22,.12,1.30,0,0,side*.13);
  // Open-book emblem on the entrance fascia.
  for(const side of [-1,1]) b(cream,side*.17,.99,.595,.37,.20,.055,0,0,side*.16);
  bench(b,-.68,.66);
}
function playground(b,oval) {
  oval('#cfbc8a',0,.05,0,2.8,.14,1.73);
  oval('#90bda7',-.28,.18,-.12,1.85,.82,1.1);
  oval('#5e98aa',-.43,.35,.12,1.04,.59,.60);
  for(const side of [-1,1]) oval('#5394a3',.24,.53+side*.04,.10+side*.13,.46,.12,.27,0,side*.45,side*.33);
  oval('#233e47',-.78,.40,.32,.055,.062,.055);
  b('#e7b660',.60,.69,-.23,.63,.085,.53);
  for(const x of [.37,.83]) for(const z of [-.43,-.04]) b(teal,x,.45,z,.062,.88,.062);
  b('#df8454',.60,.41,.20,.32,.067,.91,.78);
}
function park(b,oval) {
  oval('#82a563',0,.08,0,2.8,.16,1.75);
  b('#b57455',-.08,.16,.08,1.55,.08,.78);
  b(cream,-.08,.206,.08,.025,.012,.72);
  for (const side of [-1,1]) {
    const x=-.08+side*.82;
    b(teal,x,.42,.08,.045,.58,.04);
    b(cream,x,.72,.08,.046,.22,.33);
    oval('#c27645',x-side*.085,.66,.08,.15,.025,.17);
  }
  for(const [x,z] of [[-1.0,-.27],[.95,-.25]]) {
    b(wood,x,.28,z,.08,.49,.09);
    oval(green,x,.68,z,.64,.8,.6);
  }
  bench(b,.65,.58);
}
function theatre(b) {
  b('#c8b68e',0,.055,0,2.80,.11,1.7);
  b('#9e6948',0,.48,-.15,2.36,.86,1.03);
  roof(b,0,.89,-.15,2.58,1.22,'#454d48');
  for(const x of [-.92,-.57,.57,.92]) b('#eacb93',x,.53,.377,.17,.36,.035);
  b('#423e33',0,.36,.38,.58,.59,.04);
  b(tile,0,.75,.42,.93,.20,.08);
  b(light,0,.77,.47,.47,.07,.015);
  for(const x of [-.86,.86]) bench(b,x,.63);
}
function visitorCentre(b) {
  b('#d4c5a6',0,.05,0,2.80,.1,1.66);
  for(const x of [-.61,.61]) {
    b('#ebcda7',x,.45,-.12,1.14,.79,1.08);
    // Paired warehouse gables facing the salt yard.
    const local=(color,dx,y,dz,w,h,d,rx=0)=>b(color,x+dz,y,-.12+dx,d,h,w,0,0,-rx);
    roof(local,0,.8,0,1.18,1.22,'#94654e');
    b(teal,x,.42,.431,.45,.54,.04);
    for (const dx of [-.4,.4]) b('#905e46',x+dx,.52,.43,.06,.67,.04);
  }
  b(teal,-.78,.40,.68,.32,.38,.06); b(cream,-.78,.42,.719,.18,.16,.02);
}
