import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { districtShapes } from './atlas/geometry.js';
import { createModelKit, makeLandmark, makePerson } from './life-models.js?v=28.0.0';
import { createAmenity } from './life-amenities.js';
import { createCrowd, idlePose, stepPose } from './life-crowd.js?v=29.0.0';
import { createOverviewWalkers, overviewTrails } from './life-overview-walkers.js?v=28.0.0';
import { districtWalks } from './district-stories.js?v=27.0.0';
import { makeDistrictMiniature } from './district-miniatures.js?v=27.0.0';
import { makeStreetNeighborhood, planWalk, walkablePoint } from './street-scenery.js?v=30.0.0';

// SVG label points are inside their districts. The small southern districts use
// two other interior points so their neighbouring scenes can sit side by side.
const originalStops = [
  {id:'shuixian-morning',district:'中西區',scale:.84,point:[178.8,453.6]},
  {id:'yujing-morning',district:'玉井區',scale:1.44},
  {id:'anping-afternoon',district:'安平區',scale:.76,point:[133.4,450.5]},
  {id:'dongshan-afternoon',district:'東山區',scale:1.37},
  {id:'yanshui-evening',district:'鹽水區',scale:1.34},
  {id:'beimen-evening',district:'北門區',scale:1.32}
];
const stops=[...originalStops,...districtWalks.map(stop=>({...stop,district:stop.name,scale:1}))];
const regionFor = new Map(stops.map(s=>[s.district,s]));
const mapX = u => (u-300)/5.3;
const mapZ = v => (v-300)/5.3;
const smooth = v => { v=THREE.MathUtils.clamp(v,0,1); return v*v*(3-2*v); };
const lerp = THREE.MathUtils.lerp;
const mixed = (a,b,t) => new THREE.Color(a).lerp(new THREE.Color(b),t);
const east = new Set(['楠西區','南化區','東山區','玉井區','左鎮區','龍崎區','白河區']);
const shore = new Set(['北門區','將軍區','七股區','安南區','安平區','南區']);
const metro = new Set(['安平區','南區','中西區','東區','北區','永康區','新營區']);
const palettes={east:[0x84b78a,0x6fa381,0x99ba7d], coast:[0xe0d6a6,0xe3d5a4,0xc5d3a2], urban:[0xe6b18f,0xdc9b7d,0xebc59f], plain:[0xb2c780,0xd6c782,0xc3ce87,0xb4c98c]};
function biome(d){
  return east.has(d.name)?'east':metro.has(d.name)?'urban':shore.has(d.name)?'coast':'plain';
}
const mapRing=d=>Array.from(d.path.matchAll(/([-\d.]+),([-\d.]+)/g),m=>[Number(m[1]),Number(m[2])]);
function atlasCanvas(size,extent=600){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d'),pixels=size/extent,margin=(extent-600)/2;
  ctx.setTransform(pixels,0,0,pixels,margin*pixels,margin*pixels);
  return {canvas,ctx};
}
function texture(canvas){
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  return tex;
}
function seeded(n){
  return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
}
function landCover(){
  const {canvas,ctx}=atlasCanvas(1536);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,600,600);
  districtShapes.forEach((d,i)=>{
    const type=biome(d),palette=palettes[type],p=new Path2D(d.path),rand=seeded(1000+i*43);
    ctx.save();ctx.clip(p);
    ctx.fillStyle='#'+palette[i%palette.length].toString(16).padStart(6,'0');ctx.fill(p);
    const vertices=mapRing(d),xs=vertices.map(v=>v[0]),ys=vertices.map(v=>v[1]);
    const west=Math.min(...xs),north=Math.min(...ys),width=Math.max(...xs)-west,height=Math.max(...ys)-north;
    const count=Math.max(2,Math.round(width*height/(type==='east'?1800:1050)));
    for(let j=0;j<count;j++){
      const x=west+rand()*width,z=north+rand()*height;
      ctx.save();ctx.translate(x,z);ctx.rotate((rand()-.5)*.9);
      if(type==='east'){
        ctx.strokeStyle='rgba(47,100,70,.27)';ctx.lineWidth=.65;
        for(let row=0;row<3;row++){ctx.beginPath();ctx.moveTo(-5,row*2+3);ctx.quadraticCurveTo(-1,-4+row*2,6,-4+row*2);ctx.stroke();}
      }else{
        const field=type==='coast';
        const colors=field?['#80ada0','#99c1a8','#e4d49f','#aaba93']:type==='urban'?['#ce9c84','#e9c8a3','#dbaa86']:['#92ab69','#dfc879','#b0bd76','#c8d08b'];
        const w=4+rand()*5,h=3+rand()*4;
        for(let row=0;row<2;row++)for(let col=0;col<2;col++){
          if(col&&row&&rand()>.50)continue;
          const dx=col*(w+1.05),dy=row*(h+.9);
          ctx.fillStyle=colors[Math.floor(rand()*colors.length)];ctx.fillRect(dx,dy,w,h);
          if(type==='plain'){
            ctx.strokeStyle='rgba(244,226,158,.59)';ctx.lineWidth=.43;
            for(let line=1;line<=3;line++){ctx.beginPath();ctx.moveTo(dx+.7,dy+h*line/4);ctx.lineTo(dx+w-.6,dy+h*line/4);ctx.stroke();}
          }
        }
      }
      ctx.restore();
    }
    ctx.restore();
  });
  for(const trail of overviewTrails){
    const d=districtShapes.find(d=>d.name===trail.district);
    const [a,b,c]=trail.path;ctx.save();ctx.clip(new Path2D(d.path));ctx.lineCap='round';
    const gate=Math.hypot(c[0]-d.x,c[1]-d.y)<Math.hypot(a[0]-d.x,a[1]-d.y)?c:a;
    ctx.beginPath();ctx.moveTo(...gate);
    ctx.bezierCurveTo(gate[0]+(gate===c?8:-8),gate[1]-2,d.x-12,d.y+12,d.x,d.y+2);
    ctx.lineWidth=1.6;ctx.strokeStyle='#e2c99e';ctx.stroke();
    ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo(...b,...c);
    ctx.lineWidth=4.8;ctx.strokeStyle='#b1a77d';ctx.stroke();
    ctx.lineWidth=3.2;ctx.strokeStyle='#ead1a1';ctx.stroke();ctx.restore();
  }
  return texture(canvas);
}

// The coastal shelf follows the union of the 37 polygons. Water colours are
// fixed to the sea floor, so rotating or zooming never moves the breaking line.
function seaTexture(){
  const extent=1440,size=1536,{canvas,ctx}=atlasCanvas(size,extent);
  const {canvas:mask,ctx:coast}=atlasCanvas(size,extent);
  const depth=ctx.createLinearGradient(-270,130,880,510);
  depth.addColorStop(0,'#256b83');depth.addColorStop(.32,'#398e9a');depth.addColorStop(.63,'#499e9f');depth.addColorStop(1,'#70b5ae');
  ctx.fillStyle=depth;ctx.fillRect(-420,-420,extent,extent);
  coast.fillStyle='#92d6bd';coast.strokeStyle=coast.fillStyle;coast.lineWidth=2.2;
  for(const d of districtShapes){const p=new Path2D(d.path);coast.fill(p);coast.stroke(p);}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  for(const [blur,color] of [[82,'#6cd2bd'],[28,'#9edbc1'],[5,'#ebefd0']]){
    ctx.shadowBlur=blur;ctx.shadowColor=color;ctx.drawImage(mask,0,0);
  }
  ctx.restore();
  const rand=seeded(72);
  for(let i=0;i<1750;i++){
    const x=-415+rand()*1430,y=-415+rand()*1430,w=2+rand()**3*21;
    ctx.strokeStyle=i%5===0?'rgba(210,243,222,.34)':'rgba(192,230,219,.17)';
    ctx.lineWidth=.5+rand()*.8;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+w*.4,y+rand()*2.3,x+w,y-.2);ctx.stroke();
    if(w>16){ctx.beginPath();ctx.moveTo(x+w*.22,y+3.6);ctx.lineTo(x+w*.74,y+3.2);ctx.stroke();}
  }
  return {map:texture(canvas),extent};
}

function terrain(scene) {
  const ground=new Map(), picks=[], lines=[],cover=landCover();
  districtShapes.forEach((district,index)=>{
    const coast=shore.has(district.name),city=metro.has(district.name),hills=east.has(district.name);
    const palette=hills?palettes.east:city?palettes.urban:coast?palettes.coast:palettes.plain;
    const altitude=hills?1.1+(district.x-350)*.008:city?.24:coast?.17:.45+(district.x-180)*.002;
    const roof=new THREE.Color(palette[index%palette.length]);
    const rim=mixed(0xe3c38f,roof,.18), base=new THREE.Color(0x987856);
    const ring=Array.from(district.path.matchAll(/([-\d.]+),([-\d.]+)/g),m=>new THREE.Vector2(mapX(Number(m[1])),mapZ(Number(m[2]))));
    const triangles=THREE.ShapeUtils.triangulateShape(ring,[]);
    const pos=[],col=[],ind=[],uv=[];
    function vertex(x,y,z,c,top=false){pos.push(x,y,z);col.push(c.r,c.g,c.b);uv.push(top?(x*5.3+300)/600:.003,top?1-(z*5.3+300)/600:.997);}
    const paper=new THREE.Color(0xffffff);
    for(const point of ring) vertex(point.x,altitude,point.y,paper,true);
    // Earcut triangles face +Z in 2D XY. In the horizontal XZ plane, their winding is reversed.
    for(const [a,b,c] of triangles) ind.push(a,c,b);
    const clockwise=THREE.ShapeUtils.isClockWise(ring);
    for(let i=0;i<ring.length;i++){
      const a=ring[i],b=ring[(i+1)%ring.length],j=pos.length/3;
      vertex(a.x,altitude,a.y,rim); vertex(b.x,altitude,b.y,rim);
      vertex(a.x,-1.50,a.y,base); vertex(b.x,-1.50,b.y,base);
      // The projection's source polygon windings can differ.
      if(clockwise) ind.push(j,j+2,j+1,j+1,j+2,j+3);
      else ind.push(j,j+1,j+2,j+1,j+3,j+2);
      lines.push(a.x,altitude+.024,a.y,b.x,altitude+.024,b.y);
    }
    const stop=regionFor.get(district.name);
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    geo.setIndex(ind); geo.computeVertexNormals();
    const mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,map:cover}));
    mesh.userData.stopId=stop.id; mesh.receiveShadow=true;
    mesh.name=district.name; scene.add(mesh); picks.push(mesh);
    ground.set(district.name,{district,altitude,mesh});
  });
  const outline=new THREE.BufferGeometry();
  outline.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
  scene.add(new THREE.LineSegments(outline,new THREE.LineBasicMaterial({color:0x697954,transparent:true,opacity:.44})));
  return {ground,picks};
}

function coastalScenery(scene,k,ground) {
  const decor=new THREE.Group();
  const westWater=k.group(decor,0,-1.53,0);
  for(const [x,z,s] of [[-62,2,1.35],[-50,-31,.80],[-47,32,1.0]]){
    const boat=k.group(westWater,x,.04,z); boat.scale.setScalar(s); boat.rotation.y=-.3;
    k.oval(boat,0x345863,0,.19,0,1.49,.23,.51);
    k.oval(boat,0xb66646,0,.31,0,1.42,.26,.49);
    k.oval(boat,0xe4b476,0,.45,0,1.23,.12,.38);
    k.post(boat,0x91734f,0,1.33,0,.064,1.86);
    const sail=new THREE.Shape(); sail.moveTo(.05,.67); sail.lineTo(.05,2.40); sail.lineTo(1.05,.67); sail.closePath();
    k.part(boat,new THREE.ExtrudeGeometry(sail,{depth:.06,bevelEnabled:false}),x===-62?0xf5ba66:0xffe5ad,0,0,0);
    k.oval(boat,0xc5e6ca,-1.66,.015,.04,.64,.014,.073);
    k.oval(boat,0x95d1c3,-1.79,.025,-.24,.61,.017,.059);
  }
  // Two oyster racks sit off the west coast, their floats rising just above the water.
  for(const [x,z,a] of [[-54,8,-.28],[-52.8,9.5,-.28]]){
    const rack=k.group(westWater,x,.07,z);rack.rotation.y=a;
    k.rod(rack,0x957355,[-1.55,.10,0],[1.55,.10,0],.052);
    for(const dx of [-1.5,-.5,.5,1.5]){
      k.post(rack,0x7b6755,dx,.09,0,.064,.64);
      k.oval(rack,0xd3bb82,dx+.16,.13,.04,.15,.095,.10);
    }
  }
  for(const [i,trail] of overviewTrails.entries()){
    const [u,v]=trail.path[0],y=ground.get(trail.district).altitude;
    const rest=k.group(decor,mapX(u)+.27,y,mapZ(v)-1.00);rest.rotation.y=-.27;
    if(i===0){
      for(const dx of [0,.61]){
        k.post(rest,0xbda483,dx,.45,0,.074,.9);
        k.oval(rest,0xe8c995,dx,.80,0,.10,.17,.10);
      }
      k.rod(rest,0xa88b62,[0,.67,0],[.61,.52,0],.040);
    }else{
      for(const dx of [-.48,.48])k.box(rest,0x45655a,dx,.27,0,.15,.54,.32);
      k.box(rest,0xb77d54,0,.54,0,1.24,.13,.43);
      k.box(rest,0xc58c5c,0,.81,-.19,1.25,.20,.090);
    }
  }
  const pen=document.createElement('canvas').getContext('2d'),features=[...ground.values()];
  const stopsXY=stops.map(s=>s.point||[ground.get(s.district).district.x,ground.get(s.district).district.y]);
  const trailPoints=overviewTrails.flatMap(t=>t.path);
  for(const {district:d,altitude} of features){
    if(biome(d)!=='east'&&d.name!=='大內區'&&d.name!=='後壁區') continue;
    const path=new Path2D(d.path),ring=mapRing(d),xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);
    const x0=Math.min(...xs),z0=Math.min(...ys),w=Math.max(...xs)-x0,h=Math.max(...ys)-z0;
    const rand=seeded(Math.floor(d.x*71+d.y*113));let placed=0;
    for(let attempt=0;attempt<90&&placed<Math.min(4,Math.ceil(w*h/2600));attempt++){
      const u=x0+w*rand(),v=z0+h*rand(),r=4+rand()*4;
      if(![[0,0],[-r,-r],[-r,r],[r,-r],[r,r]].every(([dx,dz])=>pen.isPointInPath(path,u+dx,v+dz)))continue;
      if(stopsXY.some(([x,z])=>Math.hypot(x-u,z-v)<22)||trailPoints.some(([x,z])=>Math.hypot(x-u,z-v)<15))continue;
      const hill=k.group(decor,mapX(u),altitude,mapZ(v));hill.rotation.y=rand()*Math.PI;
      const s=.85+rand()*.62;
      if(biome(d)==='east'){
        k.rock(hill,placed%2?0x699866:0x80a66b,0,-.35,0,2.10*s,1.10*s,1.47*s,true);
        k.rock(hill,0x9ab578,.79*s,-.31,.23*s,1.36*s,.79*s,1.40*s,true);
      }
      for(const [dx,dz,size] of [[-.70,-.22,.85],[.16,.21,1.08],[.57,-.57,.71]]){
        const tree=k.group(hill,dx*s,biome(d)==='east'?.49:0,dz*s),t=size*s;
        k.post(tree,0x775c40,0,t*.57,0,.115*t,t*1.16);
        k.rock(tree,placed%2?0x406f52:0x487e5e,-.16*t,t*1.16,.04*t,.53*t,.79*t,.51*t,true);
        k.rock(tree,placed%2?0x709b54:0x79a866,.11*t,t*1.48,-.10*t,.54*t,.65*t,.47*t,true);
      }
      placed++;
    }
  }
  const objects=k.bake(decor); objects.castShadow=true; objects.receiveShadow=true; scene.add(objects);
}

const streetColors = {
  morning:{sky:['#98c6ca','#d5e6d7','#ffdfaf'],ground:0xcab78d, haze:0xcddbc0, sun:0xffe8c7},
  afternoon:{sky:['#9cc7c9','#dfebd6','#f6d6a4'],ground:0xcab48d, haze:0xd3dbc1, sun:0xffe7c1},
  evening:{sky:['#aebdcf','#e5d5c6','#f7cc9c'],ground:0xbfa789, haze:0xdecbb4, sun:0xffd5aa}
};
function skyTexture(stops){
  const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=256;
  const ctx=canvas.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,256);
  stops.forEach((color,i)=>gradient.addColorStop(i/(stops.length-1),color));
  ctx.fillStyle=gradient;ctx.fillRect(0,0,512,256);
  // Long, translucent wisps stay soft behind the buildings on a narrow display.
  ctx.fillStyle='rgba(255,249,221,.32)';
  for(const [x,y,w] of [[43,38,47],[114,42,22],[300,26,61],[438,67,42],[223,82,30]]){
    ctx.beginPath();ctx.ellipse(x,y,w,2.3,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(x-w*.2,y-2,w*.53,3.1,0,0,Math.PI*2);ctx.fill();
  }
  const tex=new THREE.CanvasTexture(canvas); tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}

function addResident(k,group,style) {
  const resident=makePerson(k,style);
  resident.root.position.set(2.48,.174,2.24); resident.root.rotation.y=-.73;
  resident.root.userData.guestKey='resident'; group.add(resident.root);
  return resident;
}
function shadows(group) {
  group.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
}
function disposeObjects(group) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  group.traverse(obj=>{
    if(obj.geometry) geometries.add(obj.geometry);
    for(const m of [].concat(obj.material||[])) materials.add(m);
  });
  for(const m of materials) for(const value of Object.values(m)) if(value?.isTexture) textures.add(value);
  for(const tex of textures) tex.dispose();
  for(const geo of geometries) geo.dispose();
  for(const material of materials) material.dispose();
}

export function createLifeWorld({canvas,onChoose,onArrive,onSelectLabels,onError,onResident,onExit,initialStreet=null}) {
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
  renderer.setClearColor(0x56969a);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  const scene=new THREE.Scene();
  const overviewSky=new THREE.Color(0x56969a);
  scene.background=overviewSky;
  const camera=new THREE.OrthographicCamera(-75,75,50,-50,.5,370);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=false; controls.enablePan=true;controls.zoomToCursor=true;
  controls.minPolarAngle=.23; controls.maxPolarAngle=1.37; controls.rotateSpeed=.65;
  controls.minAzimuthAngle=-1.04; controls.maxAzimuthAngle=1.04;
  controls.minZoom=.62; controls.maxZoom=7;
  const hemisphere=new THREE.HemisphereLight(0xf0fbff,0xafb7a8,1.55);
  scene.add(hemisphere);
  const sun=new THREE.DirectionalLight(0xfff2df,1.99);
  sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
  sun.shadow.bias=-.0006; sun.shadow.normalBias=.035;
  sun.shadow.camera.near=.5; sun.shadow.camera.far=210;
  sun.shadow.radius=2; scene.add(sun,sun.target);
  const map=new THREE.Group(); scene.add(map);
  const sea=seaTexture(),waterGeo=new THREE.PlaneGeometry(900,900),seaScale=900*5.3/sea.extent,waterUV=waterGeo.attributes.uv;
  for(let i=0;i<waterUV.count;i++)waterUV.setXY(i,(waterUV.getX(i)-.5)*seaScale+.5,(waterUV.getY(i)-.5)*seaScale+.5);
  const water=new THREE.Mesh(waterGeo,new THREE.MeshBasicMaterial({map:sea.map}));
  water.rotation.x=-Math.PI/2; water.position.y=-1.56; water.receiveShadow=true; map.add(water);
  const {ground,picks}=terrain(map);
  const k=createModelKit();
  coastalScenery(map,k,ground);
  const townsfolk=createOverviewWalkers(k,ground,mapX);
  map.add(townsfolk.root);picks.push(townsfolk.root);
  const skies=new Map();
  const streetLens=new THREE.PerspectiveCamera(40,1,.09,550);
  const places=new Map();
  for(const spec of stops){
    const {district,altitude}=ground.get(spec.district);
    const [u,v]=spec.point||[district.x,district.y], root=new THREE.Group();
    root.name=spec.district; root.userData.stopId=spec.id;
    root.position.set(mapX(u),altitude+.013,mapZ(v)); root.scale.setScalar(spec.scale);
    const landmark=spec.motif?makeDistrictMiniature(k,spec):makeLandmark(k,spec.id);
    root.add(landmark);
    let resident=null;
    if(!spec.motif){
      const amenityGround=new THREE.Group();
      k.oval(amenityGround,0xd7c89d,7.25,.043,-1.70,1.53,.12,1.59);
      root.add(k.bake(amenityGround));
      const amenity=createAmenity(spec.id); amenity.scale.setScalar(.83); amenity.position.set(7.25,.12,-1.70); root.add(amenity);
      resident=addResident(k,root,spec.id);
      const shadowSketch=new THREE.Group();
      k.oval(shadowSketch,0xc2ac83,2.49,.174,2.27,.52,.025,.30);
      root.add(k.bake(shadowSketch));
    }
    shadows(root);
    scene.add(root); picks.push(root);
    const style=spec.motif?originalStops[places.size%originalStops.length].id:spec.id;
    places.set(spec.id,{...spec,root,resident,landmark,style,index:places.size});
  }
  // Size every model against its closest neighbour, especially the old city core.
  // Street geometry uses its original local scale once the surrounding map is hidden.
  for(const p of places.values()){
    const gap=Math.min(...[...places.values()].filter(n=>n!==p).map(n=>Math.hypot(n.root.position.x-p.root.position.x,n.root.position.z-p.root.position.z)));
    const size=p.motif?Math.min(2.04,gap*.80/5.40):Math.min(p.scale,gap*.79/16.8);
    p.mapScale=new THREE.Vector3(size,Math.max(size,p.motif?.94:.82),size);
    p.root.scale.copy(p.mapScale);
  }
  const player=makePerson(k,'player',true); player.root.visible=false; player.root.name='小安';
  player.root.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
  scene.add(player.root);
  k.releaseSources();

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let width=1,height=1,span=100,frame=0,previous=0,intersecting=true,covered=false,disposed=false,dirty=true;
  let stroll=null,motion=null,selected=null,gesture=null,multitouch=false;
  let streetPlace=null,crowd=null,crowdPlace=null,paused=reduced.matches,ambientTime=0,timer=0,conversation=null;
  const touching=new Set();
  const overviewAim=new THREE.Vector3(0,.22,0),overviewOffset=new THREE.Vector3(0,100,82);
  const localOffset=new THREE.Vector3(21,54,118);
  let regionBounds=null;
  function viewSpan(place){
    const aspect=width/height;
    if(place) return Math.max(9.65,(aspect<1.08?13.30:15.2)/aspect)*place.scale;
    if(regionBounds) return Math.max(34,regionBounds.height,regionBounds.width/aspect);
    return Math.max(83,111/aspect);
  }
  function setSpan(next){
    span=next; camera.top=next/2; camera.bottom=-next/2;
    camera.right=next/2*width/height; camera.left=-camera.right;
    camera.updateProjectionMatrix();
    townsfolk.resize(next/height);
  }
  function lightAt(target,radius){
    sun.target.position.copy(target); sun.position.copy(target).add(new THREE.Vector3(-35,75,45));
    const shadow=sun.shadow.camera;
    shadow.left=shadow.bottom=-radius; shadow.right=shadow.top=radius;
    shadow.updateProjectionMatrix();
    renderer.shadowMap.needsUpdate=true;
  }
  function placeView(aim,offset,size){
    controls.target.copy(aim);
    camera.position.copy(aim).add(offset);
    setSpan(size); controls.update();
  }
  function endpoint(place,x,y,z){return new THREE.Vector3(x,y,z).multiplyScalar(place.scale).add(place.root.position);}
  function destination(place){
    return place?endpoint(place,.0,1.04,.78):overviewAim.clone();
  }
  function newCameraMotion(place){
    const initialSpan=span/camera.zoom;
    camera.zoom=1; setSpan(initialSpan);
    return {fromAim:controls.target.clone(),fromOffset:camera.position.clone().sub(controls.target),fromSpan:initialSpan,
      aim:destination(place),offset:place?localOffset:overviewOffset};
  }
  function cameraMotion(c,t,place){
    const f=smooth(t), aim=c.fromAim.clone().lerp(c.aim,f), offset=c.fromOffset.clone().lerp(c.offset,f);
    placeView(aim,offset,Math.exp(lerp(Math.log(c.fromSpan),Math.log(viewSpan(place)),f)));
    lightAt(aim,Math.max(7.5,span*.81));
  }
  function labels(){
    if(!onSelectLabels) return;
    const result=[];
    for(const p of places.values()){
      const point=new THREE.Vector3(0,p.motif?2.85:4.3,-.42).multiply(p.root.scale).add(p.root.position);
      point.project(camera);
      const x=(point.x+1)*width/2, y=(1-point.y)*height/2;
      result.push({id:p.id,x,y,visible:(!selected||selected===p.id)&&point.z>-1&&point.z<1&&x>=0&&x<=width&&y>=0&&y<=height});
    }
    onSelectLabels(result,streetPlace?[]:townsfolk.labelGaps(camera,width,height));
  }
  function renderCamera(){
    if(!streetPlace)return camera;
    const distance=span/(camera.zoom*2*Math.tan(THREE.MathUtils.degToRad(streetLens.fov/2)));
    streetLens.aspect=width/height;streetLens.updateProjectionMatrix();
    scene.fog.near=distance+7*streetPlace.scale;scene.fog.far=distance+63*streetPlace.scale;
    streetLens.position.copy(camera.position).sub(controls.target).normalize().multiplyScalar(distance).add(controls.target);
    streetLens.lookAt(controls.target);streetLens.updateMatrixWorld();
    return streetLens;
  }
  function draw(){
    renderer.render(scene,renderCamera());
    if(dirty) labels();
    dirty=false;
  }
  function schedule(delay=0){
    if(frame||timer||disposed||covered||!intersecting||document.hidden||width<2||height<2) return;
    if(delay) timer=setTimeout(()=>{timer=0;schedule();},delay);
    else frame=requestAnimationFrame(tick);
  }
  function invalidate(){
    dirty=true;
    if(timer){clearTimeout(timer);timer=0;}
    schedule();
  }
  function setStage(place){
    if(place===streetPlace) return;
    const former=streetPlace;stroll=null;
    if(former){
      former.root.scale.copy(former.mapScale);
      if(former.detail){
        former.detail.removeFromParent();disposeObjects(former.detail);
        former.detail=null;
        if(former.motif)former.resident=null;
        former.landmark.position.set(0,0,0);former.landmark.scale.setScalar(1);
      }
    }
    streetPlace=place;
    map.visible=!place;
    renderer.shadowMap.autoUpdate=!!place;renderer.shadowMap.needsUpdate=true;
    hemisphere.intensity=place?1.85:1.55;sun.intensity=place?1.94:1.99;
    controls.enablePan=!place;controls.zoomToCursor=!place;
    clearHover();
    for(const p of places.values()) p.root.visible=!place||place===p;
    if(crowd) crowd.root.visible=false;
    if(place){
      place.root.scale.setScalar(place.scale);
      const localKit=createModelKit(),detail=makeStreetNeighborhood(localKit,place);
      if(place.motif){
        place.resident=addResident(localKit,detail,place.style);
        place.landmark.position.set(0,.12,-.95);place.landmark.scale.setScalar(1.52);
      }
      localKit.releaseSources();shadows(detail);place.root.add(detail);place.detail=detail;
      const time=place.id.split('-').at(-1),palette=streetColors[time];
      if(!skies.has(time))skies.set(time,skyTexture(palette.sky));
      scene.background=skies.get(time);scene.fog=new THREE.Fog(shore.has(place.district)?0xb6d9d2:palette.haze,22*place.scale,74*place.scale);
      controls.minZoom=.78;controls.maxZoom=2.6;
      if(crowdPlace!==place){
        crowd?.dispose();
        crowd=createCrowd(place.style,place.index);
        crowdPlace=place;place.root.add(crowd.root);
      }
      crowd.root.visible=true;crowd.hold(null);
      sun.color.setHex(streetColors[place.id.split('-').at(-1)].sun);
    }else{
      scene.background=overviewSky;scene.fog=null;controls.minZoom=.62;controls.maxZoom=7;
      sun.color.setHex(0xfff2df);
    }

  }
  function showPlayer(place,position){
    player.root.visible=true;
    player.root.scale.setScalar(place.scale);
    player.root.position.copy(position);
    player.root.rotation.y=.34;
    idlePose(player,0);
  }
  function guestAt(place,key){
    return key==='resident' ? place.resident.root : crowd.actor(key);
  }
  function beginApproach(m){
    const p=m.place;
    setStage(p);
    crowd.hold(m.key);
    const guest=guestAt(p,m.key);
    const g=guest.position;
    m.start=player.root.visible ? player.root.position.clone() : endpoint(p,-1.35,.155,2.54);
    // Keep a clear gap at either shoulder so the player and speaker remain visible.
    const side=g.x<=-1.7 ? 1 : -1;
    m.end=endpoint(p,g.x+side*.94,g.y,g.z+.12);
    m.face=Math.atan2(-side*.94,-.12);
    m.guest=guest;
    const from=p.root.worldToLocal(m.start.clone()),to=p.root.worldToLocal(m.end.clone());
    m.route=measuredWalk([from.x,from.z],[to.x,to.z]);
    m.walkMs=(reduced.matches||paused)?0:Math.min(2150,Math.max(450,m.route.distance*395));
    showPlayer(p,m.start);m.approachStarted=true;
  }
  function ambientActive(){return !paused;}
  function tick(now){
    frame=0;
    if(disposed||covered||!intersecting||document.hidden) return;
    const dt=previous?Math.min(250,now-previous):0;
    previous=now;
    const animated=ambientActive();
    if(stroll)advanceStroll(dt);
    if(animated){
      ambientTime+=Math.min(dt,140)/1000;
      if(streetPlace){
        crowd.update(Math.min(dt,140)/1000,ambientTime);
        idlePose(streetPlace.resident,ambientTime+1.8);
        if(player.root.visible&&!motion&&!stroll) idlePose(player,ambientTime+.5);
      }else townsfolk.update(Math.min(dt,140)/1000);
    }
    let arrived=null;
    if(motion){
      const m=motion,p=m.place;
      m.time+=dt;
      if(m.camera&&!m.approachStarted){
        cameraMotion(m.camera,m.focusMs?Math.min(1,m.time/m.focusMs):1,p);
        dirty=true;
      }
      if(m.time>=m.focusMs){
        controls.enabled=true;
        if(!p) motion=null;
        else{
          if(!m.approachStarted) beginApproach(m);
          const f=m.walkMs?Math.min(1,(m.time-m.focusMs)/m.walkMs):1;
          placeWalker(p,m.route,f);
          if(f>=1){
            idlePose(player,0);player.root.rotation.y=m.face;
            m.guest.rotation.y=Math.atan2(m.end.x-(p.root.position.x+m.guest.position.x*p.scale),m.end.z-(p.root.position.z+m.guest.position.z*p.scale));
            conversation=m.key;arrived=m;motion=null;
          }
        }
      }
      draw();
    }else if(dirty||animated||stroll) draw();
    if(arrived) onArrive?.(arrived.place.id,arrived.key);
    if(motion||stroll) schedule();
    else if(ambientActive()) schedule(streetPlace?24:43);
    else previous=0;
  }
  function street(id){
    const p=places.get(id);
    if(disposed||!p) return;
    const same=streetPlace===p;
    stroll=null;motion=null;selected=id;conversation=null;controls.enabled=true;
    setStage(p);crowd.hold(null);
    p.resident.root.rotation.y=-.64;
    if(!same){
      camera.zoom=1;
      const aim=destination(p);
      placeView(aim,localOffset,viewSpan(p));lightAt(aim,Math.max(8,viewSpan(p)));
    }
    // When a conversation ends, return the player to the shop frontage before
    // the pedestrian resumes walking along the lane.
    showPlayer(p,endpoint(p,-1.38,.155,2.50));
    previous=0;invalidate();
  }
  function overview(){
    if(disposed) return;
    const cameraState=newCameraMotion(null);
    setStage(null);selected=null;conversation=null;player.root.visible=false;controls.enabled=false;
    motion={place:null,camera:cameraState,time:0,focusMs:reduced.matches?0:580,approachStarted:false};
    previous=0;invalidate();
  }
  function focusRegion(ids){
    if(disposed||streetPlace||selected) return;
    const items=(ids||[]).map(id=>places.get(id)).filter(Boolean);
    regionBounds=null;overviewAim.set(0,.22,0);
    if(items.length&&items.length<places.size){
      const x=items.map(p=>p.root.position.x),z=items.map(p=>p.root.position.z);
      const left=Math.min(...x),right=Math.max(...x),far=Math.min(...z),near=Math.max(...z);
      overviewAim.set((left+right)/2,.22,(far+near)/2-1.3);
      // Preserve comfortable room around the outermost shop, label and touch target.
      regionBounds={width:right-left+17,height:(near-far)*.78+20};
    }
    overview();
  }
  function zoomOverview(factor){
    if(disposed||streetPlace||motion||!Number.isFinite(factor)||factor<=0) return;
    camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,controls.minZoom,controls.maxZoom);
    camera.updateProjectionMatrix();invalidate();
  }
  function walkTo(id,guestKey='resident'){
    const p=places.get(id);
    if(disposed||!p) return;
    stroll=null;
    const key=['neighbor','visitor'].includes(guestKey)?guestKey:'resident';
    if(motion?.place===p&&motion.key===key) return;
    if(conversation===key&&streetPlace===p&&!motion){onArrive?.(id,key);return;}
    if(streetPlace&&streetPlace!==p) street(id);
    const same=streetPlace===p;
    const cameraState=same?null:newCameraMotion(p);
    if(!same) player.root.visible=false;
    else{
      crowd.hold(key);
      p.resident.root.rotation.y=-.64;
    }
    selected=id;conversation=null;controls.enabled=same;
    motion={place:p,key,camera:cameraState,time:0,focusMs:!same&&!reduced.matches?650:0,approachStarted:false};
    previous=0;invalidate();
  }
  function setPaused(value){
    paused=!!value;previous=0;
    if(paused&&stroll)advanceStroll(stroll.duration);
    invalidate();
  }
  function syncMotionPreference(){setPaused(reduced.matches);}
  function resize(){
    const w=Math.round(canvas.clientWidth),h=Math.round(canvas.clientHeight);
    if(w<2||h<2){width=w;height=h;return;}
    width=w;height=h;renderer.setSize(w,h,false);
    setSpan(viewSpan(places.get(selected))); invalidate();
  }
  function suspend(){
    if(covered||!intersecting||document.hidden){
      cancelAnimationFrame(frame);clearTimeout(timer);timer=0;frame=0;previous=0;return;
    }
    invalidate();
  }
  function down(e){
    touching.add(e.pointerId);
    if(touching.size>1) multitouch=true;
    if(e.button!==0||!e.isPrimary||!controls.enabled) return;
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY,drag:false};
  }
  function move(e){
    if(gesture&&e.pointerId===gesture.id&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>6) gesture.drag=true;
    if(e.pointerType==='mouse'&&!streetPlace&&!motion&&!gesture){
      setPointerRay(e);
      const surface=ray.intersectObjects(groundMeshes,false)[0]?.object;
      if(surface!==hovered){
        clearHover();hovered=surface;
        if(hovered){hovered.material.emissive.setHex(0x2c2910);canvas.style.cursor='pointer';invalidate();}
      }
    }
  }
  const groundMeshes=[...ground.values()].map(entry=>entry.mesh);
  let hovered=null;
  function clearHover(){
    if(hovered){hovered.material.emissive.setHex(0);hovered=null;invalidate();}
    canvas.style.cursor='';
  }
  function setPointerRay(e){
    const rect=canvas.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
    ray.setFromCamera(pointer,renderCamera());
  }
  function up(e){
    const isTap=gesture&&gesture.id===e.pointerId&&!gesture.drag&&!multitouch&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<=6;
    touching.delete(e.pointerId); if(!touching.size) multitouch=false;
    if(!gesture||gesture.id!==e.pointerId) return;
    gesture=null;
    if(!isTap||!controls.enabled||disposed) return;
    setPointerRay(e);
    const candidates=streetPlace?[streetPlace.root,player.root]:picks;
    const hit=ray.intersectObjects(candidates,true).find(row=>{
      let owner=row.object;
      while(owner){ if(!owner.visible) return false;owner=owner.parent; }
      return true;
    });
    if(!hit) return;
    let obj=hit.object,guest=null,exit=null,overviewGuest=false;
    while(obj){
      guest ||= obj.userData.guestKey;exit ||= obj.userData.exitId;overviewGuest ||= !!obj.userData.overviewWalker;
      if(obj.userData.stopId)break;
      obj=obj.parent;
    }
    if(exit&&streetPlace){walkToExit(exit);return;}
    if((guest||overviewGuest)&&obj&&onResident){onResident(obj.userData.stopId,guest||'resident');return;}
    if(streetPlace){
      if(!motion&&!conversation){
        const local=streetPlace.root.worldToLocal(hit.point.clone());
        if(local.y<.30&&walkablePoint(local.x,local.z))beginStroll([local.x,local.z]);
      }
      return;
    }
    if(obj)onChoose?.(obj.userData.stopId);
  }
  function measuredWalk(from,to){
    const path=planWalk(from,to),cumulative=[0];
    for(let i=1;i<path.length;i++)cumulative.push(cumulative[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
    return {path,cumulative,distance:cumulative.at(-1)};
  }
  function placeWalker(place,route,fraction){
    if(route.path.length<2)return;
    const distance=fraction*route.distance;
    let i=1;while(i+1<route.path.length&&route.cumulative[i]<distance)i++;
    const a=route.path[i-1],b=route.path[i],t=(distance-route.cumulative[i-1])/(route.cumulative[i]-route.cumulative[i-1]);
    player.root.position.copy(endpoint(place,lerp(a[0],b[0],t),.153,lerp(a[1],b[1],t)));
    player.root.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);stepPose(player,distance*5.7);
  }
  function beginStroll(to,exitId=null){
    const place=streetPlace,from=place.root.worldToLocal(player.root.position.clone()),route=measuredWalk([from.x,from.z],to);
    if(route.path.length<2){if(exitId)onExit?.(exitId);return;}
    stroll={place,route,elapsed:0,duration:Math.max(320,Math.min(exitId?1450:3100,route.distance*330)),exitId};
    if(reduced.matches||paused)advanceStroll(stroll.duration);
    previous=0;invalidate();
  }
  function advanceStroll(dt){
    const s=stroll;
    if(!s||s.place!==streetPlace){stroll=null;return;}
    s.elapsed=Math.min(s.duration,s.elapsed+dt);
    const fraction=s.elapsed/s.duration;
    placeWalker(s.place,s.route,fraction);
    if(fraction>=1){
      stroll=null;idlePose(player,0);dirty=true;
      if(s.exitId)onExit?.(s.exitId);
    }
  }
  function walkToExit(id){
    if(!streetPlace||!onExit)return false;
    const post=streetPlace.detail.children.find(o=>o.userData.exitId===id);
    if(!post)return false;
    if(stroll?.exitId===id)return true;
    conversation=null;motion=null;controls.enabled=true;crowd.hold(null);
    beginStroll([post.position.x,post.position.z+.56],id);return true;
  }
  function cancel(e){
    touching.delete(e.pointerId); if(!touching.size) multitouch=false;
    if(gesture?.id===e.pointerId) gesture=null;
  }
  function lost(e){
    e.preventDefault();
    destroy(); onError?.(new Error('3D 畫面連線中斷'));
  }
  controls.addEventListener('change',invalidate);
  canvas.addEventListener('pointerdown',down,true);
  canvas.addEventListener('pointermove',move,true);
  canvas.addEventListener('pointerleave',clearHover);
  canvas.addEventListener('pointerup',up,true);
  canvas.addEventListener('pointercancel',cancel,true);
  canvas.addEventListener('webglcontextlost',lost);
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(canvas);
  const observer=new IntersectionObserver(entries=>{intersecting=entries[entries.length-1].isIntersecting;suspend();});
  observer.observe(canvas); document.addEventListener('visibilitychange',suspend);
  // A native modal can cover the renderer without changing canvas intersection.
  // Check the top layer only on dialog transitions, preserving the user's pause
  // setting and the current walk while a chapter or mission has focus.
  const tourDialog=canvas.closest('dialog');
  function checkTopLayer(){
    if(!tourDialog||!tourDialog.open||document.hidden)return;
    const box=canvas.getBoundingClientRect();
    const x=THREE.MathUtils.clamp(box.left+box.width/2,0,innerWidth-1);
    const y=THREE.MathUtils.clamp(box.top+box.height/2,0,innerHeight-1);
    const top=document.elementFromPoint(x,y)?.closest('dialog');
    const next=!!top&&top!==tourDialog;
    if(next!==covered){covered=next;suspend();}
  }
  const layers=new MutationObserver(records=>{
    if(records.some(r=>r.type==='attributes'?r.target.tagName==='DIALOG':
      [...r.addedNodes,...r.removedNodes].some(n=>n.nodeName==='DIALOG')))checkTopLayer();
  });
  if(tourDialog){
    layers.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['open']});
    layers.observe(document.body,{childList:true});
    document.addEventListener('visibilitychange',checkTopLayer);
    checkTopLayer();
  }
  reduced.addEventListener('change',syncMotionPreference);
  const portraits=new Map();
  function portraitFor(key='resident'){
    if(disposed||!streetPlace) return null;
    const actor=guestAt(streetPlace,key);
    if(!actor) return null;
    const cacheKey=streetPlace.style+':'+key;
    if(portraits.has(cacheKey)) return portraits.get(cacheKey);
    const size=176,portraitStage=new THREE.Scene(),face=actor.clone(true);
    face.position.set(0,0,0);face.rotation.set(0,.20,0);face.scale.setScalar(1);
    face.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(face),h=bounds.max.y-bounds.min.y;
    const aim=new THREE.Vector3(0,bounds.min.y+h*.75,0),half=h*.37;
    const lens=new THREE.OrthographicCamera(-half,half,half,-half,.1,15);
    lens.position.copy(aim).add(new THREE.Vector3(.04,.17,5));lens.lookAt(aim);
    portraitStage.background=new THREE.Color(0xf2dcb7);portraitStage.add(face);
    portraitStage.add(new THREE.HemisphereLight(0xfff7e1,0xc8ad8e,1.8));
    const keyLight=new THREE.DirectionalLight(0xffecd8,1.85);
    keyLight.position.set(-2,4,4);portraitStage.add(keyLight);
    const target=new THREE.WebGLRenderTarget(size,size,{colorSpace:THREE.SRGBColorSpace});
    const previousTarget=renderer.getRenderTarget();
    try{
      renderer.setRenderTarget(target);renderer.render(portraitStage,lens);
      const pixels=new Uint8Array(size*size*4);renderer.readRenderTargetPixels(target,0,0,size,size,pixels);
      const photo=document.createElement('canvas');photo.width=photo.height=size;
      const pen=photo.getContext('2d'),image=pen.createImageData(size,size),stride=size*4;
      for(let y=0;y<size;y++)image.data.set(pixels.subarray((size-y-1)*stride,(size-y)*stride),y*stride);
      pen.putImageData(image,0,0);const url=photo.toDataURL();portraits.set(cacheKey,url);return url;
    }catch{return null;}finally{renderer.setRenderTarget(previousTarget);target.dispose();}
  }
  function destroy(){
    if(disposed) return;
    disposed=true; motion=null; cancelAnimationFrame(frame);clearTimeout(timer);
    portraits.clear();crowd?.dispose();for(const sky of skies.values())sky.dispose();reduced.removeEventListener('change',syncMotionPreference);
    resizeObserver.disconnect(); observer.disconnect(); layers.disconnect();
    document.removeEventListener('visibilitychange',suspend);document.removeEventListener('visibilitychange',checkTopLayer);
    canvas.removeEventListener('pointerdown',down,true); canvas.removeEventListener('pointermove',move,true);
    canvas.removeEventListener('pointerleave',clearHover);canvas.style.cursor='';
    canvas.removeEventListener('pointerup',up,true); canvas.removeEventListener('pointercancel',cancel,true);
    canvas.removeEventListener('webglcontextlost',lost);
    controls.removeEventListener('change',invalidate); controls.dispose();
    disposeObjects(scene);
    sun.shadow.dispose(); renderer.dispose(); renderer.forceContextLoss();
  }
  resize();
  if(places.has(initialStreet)) street(initialStreet);
  else { placeView(overviewAim,overviewOffset,viewSpan(null));lightAt(overviewAim,72);invalidate(); }
  function captureFrame(){
    if(disposed) return null;
    renderer.render(scene,renderCamera());return canvas;
  }
  return {walkTo,walkToExit,overview,focusRegion,zoomOverview,street,setPaused,captureFrame,portraitFor,destroy};
}
