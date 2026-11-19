import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { districtShapes } from './atlas/geometry.js';
import { createModelKit, makeLandmark, makePerson } from './life-models.js?v=26.0.0';
import { createAmenity } from './life-amenities.js';
import { createCrowd, idlePose, stepPose } from './life-crowd.js?v=26.0.0';

// SVG label points are inside their districts. The small southern districts use
// two other interior points so their neighbouring scenes can sit side by side.
const stops = [
  {id:'shuixian-morning',district:'中西區',scale:.84,point:[178.8,453.6]},
  {id:'yujing-morning',district:'玉井區',scale:1.44},
  {id:'anping-afternoon',district:'安平區',scale:.76,point:[133.4,450.5]},
  {id:'dongshan-afternoon',district:'東山區',scale:1.37},
  {id:'yanshui-evening',district:'鹽水區',scale:1.34},
  {id:'beimen-evening',district:'北門區',scale:1.32}
];
const regionFor = new Map(stops.map(s=>[s.district,s]));
const mapX = u => (u-300)/5.3;
const mapZ = v => (v-300)/5.3;
const smooth = v => { v=THREE.MathUtils.clamp(v,0,1); return v*v*(3-2*v); };
const lerp = THREE.MathUtils.lerp;
const mixed = (a,b,t) => new THREE.Color(a).lerp(new THREE.Color(b),t);
const east = new Set(['楠西區','南化區','東山區','玉井區','左鎮區','龍崎區','白河區']);
const shore = new Set(['北門區','將軍區','七股區','安南區','安平區','南區']);
const metro = new Set(['安平區','南區','中西區','東區','北區','永康區','新營區']);
const palettes={east:[0x98b878,0xb1bf81,0x9eb678], coast:[0xc4c9a1,0xbcc9a0,0xb5c3a1], urban:[0xdbbd95,0xe5cba3,0xd9c6a3], plain:[0xc6ce99,0xd4d09c,0xbeca98,0xd1cd99]};

function terrain(scene) {
  const ground=new Map(), picks=[], lines=[];
  const material=new THREE.MeshLambertMaterial({vertexColors:true});
  const allPositions=[],allColors=[],allIndices=[];
  districtShapes.forEach((district,index)=>{
    const coast=shore.has(district.name),city=metro.has(district.name),hills=east.has(district.name);
    const palette=hills?palettes.east:city?palettes.urban:coast?palettes.coast:palettes.plain;
    const altitude=hills?1.1+(district.x-350)*.008:city?.24:coast?.17:.45+(district.x-180)*.002;
    const roof=new THREE.Color(palette[index%palette.length]);
    const rim=mixed(roof,0x947c52,.40), base=mixed(0x9e9274,roof,.16);
    const ring=Array.from(district.path.matchAll(/([-\d.]+),([-\d.]+)/g),m=>new THREE.Vector2(mapX(Number(m[1])),mapZ(Number(m[2]))));
    const triangles=THREE.ShapeUtils.triangulateShape(ring,[]);
    const pos=[],col=[],ind=[];
    function vertex(x,y,z,c){ pos.push(x,y,z); col.push(c.r,c.g,c.b); }
    for(const point of ring) vertex(point.x,altitude,point.y,roof);
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
    if(stop){
      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
      geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
      geo.setIndex(ind); geo.computeVertexNormals();
      const mesh=new THREE.Mesh(geo,material); mesh.userData.stopId=stop.id; mesh.receiveShadow=true;
      mesh.name=district.name; scene.add(mesh); picks.push(mesh);
    }else{
      const first=allPositions.length/3;
      allPositions.push(...pos); allColors.push(...col);
      for(const i of ind) allIndices.push(i+first);
    }
    ground.set(district.name,{district,altitude,ring});
  });
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(allPositions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(allColors,3));
  geo.setIndex(allIndices); geo.computeVertexNormals();
  const land=new THREE.Mesh(geo,material); land.receiveShadow=true; scene.add(land);
  const outline=new THREE.BufferGeometry();
  outline.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
  scene.add(new THREE.LineSegments(outline,new THREE.LineBasicMaterial({color:0x8c9972,transparent:true,opacity:.48})));
  return {ground,picks};
}

function landscape(scene,k,ground) {
  const decor=new THREE.Group();
  function home(g,x,z,w,h,d,wall,roof){
    k.box(g,wall,x,h/2,z,w,h,d);
    const tiles=k.group(g,x,h,z);
    for(const s of [-1,1]){
      const panel=k.box(tiles,roof,0,.11,s*d*.26,w+.19,.09,d*.59+.08); panel.rotation.x=s*.37;
    }
    k.box(g,0x8a8170,x-.14*w,.28*h,z+d*.51,w*.18,h*.56,.035);
    k.box(g,0x7d9890,x+.22*w,.55*h,z+d*.51,w*.24,h*.31,.04);
  }
  function pine(p,x,z,s) {
    k.post(p,0x856e4c,x,.45*s,z,.115*s,.9*s);
    k.peak(p,0x628b63,x,1.30*s,z,.80*s,1.65*s,.75*s);
    k.peak(p,0x729b6a,x,1.91*s,z,.62*s,1.44*s,.58*s);
  }
  for(const {district:d,altitude} of ground.values()){
    if(regionFor.has(d.name)) continue;
    // East District neighbours the market. Its southern block leaves the market's hospital entrance visible.
    const x=mapX(d.name==='東區'?207:d.x),z=mapZ(d.name==='東區'?468:d.y),g=k.group(decor,x,altitude,z);
    if(east.has(d.name)||['六甲區','大內區','山上區'].includes(d.name)){
      // Relief and vegetation are illustrative. They do not encode surveyed elevations.
      const size=east.has(d.name)?1:.59;
      for(const [dx,dz,s] of [[-1,-.64,1.04],[1.62,.30,.77],[-2.74,1.35,.53]]){
        const hill=k.rock(g,dx>0?0x83a977:0x92ae77,dx*size,-.15,dz*size,2.45*s*size,2.95*s*size,2.08*s*size);
        hill.rotation.y=dx*.7;
      }
      pine(g,-2.9*size,1.8*size,.76*size); pine(g,2.61*size,.99*size,.65*size);
    }else if(metro.has(d.name)){
      const street=k.group(g); street.rotation.y=d.name==='東區'?-.37:.21;
      const large=['新營區','永康區'].includes(d.name);
      street.scale.setScalar(large?1:.73);
      k.box(street,0xd2be9e,0,.032,0,3.54,.06,1.07);
      home(street,-1,-1.05,1.07,.89,1.04,0xe0c49e,0xae8266);
      home(street,.18,-1.0,.91,1.16,1.07,0xdac9a6,0x7e978a);
      home(street,1.25,-1.04,1.10,.77,.94,0xddc8a3,0xbe8669);
      if(large){
        home(street,.69,1.12,1.12,.95,.91,0xe2c5a6,0xa89275);
        home(street,-.60,.99,.92,.76,1.04,0xd5bb99,0x93988b);
        pine(street,-1.77,-.31,.56);
      }
    }else{
      const field=k.group(g); field.rotation.y=(d.x%5-2)*.13;
      for(let i=0;i<3;i++){
        const c=shore.has(d.name)?[0x92b6ad,0xa6c1b1,0xb0c5ae]:[0xabc178,0xc4be74,0xa5bb78];
        k.box(field,c[i],(i-1)*1.05,.038,0,1,.075,2.91-i*.21);
        if(!shore.has(d.name)) for(let line=0;line<2;line++) k.box(field,0xbcc587,(i-1)*1.05-.29+line*.42,.086,0,.035,.023,2.62-i*.2);
      }
      if(!shore.has(d.name)){
        for(const [x,z,s] of [[1.86,-.87,.58],[2.32,-.12,.46],[2.54,.65,.43]]) pine(g,x,z,s);
        if(['麻豆區','善化區','關廟區','佳里區','學甲區'].includes(d.name)) home(field,-2.29,-.43,.98,.74,1.03,0xd6be97,0xad7f64);
      }
    }
  }
  const westWater=k.group(decor,0,-1.53,0);
  for(let i=0;i<91;i++){
    const u=(i*109+39)%550,w=(i*73+17)%570;
    const x=mapX(u)-26,z=mapZ(w);
    if(x> -37+Math.sin(z*.11)*5) continue;
    const col=i%3?0xa9d1c7:0x93beb9;
    k.oval(westWater,col,x,.04,z,1.12+i%3*.42,.027,.085);
    if(i%3===0) k.oval(westWater,col,x+.89,.04,z+.30,.62,.027,.072);
  }
  for(const [x,z,s] of [[-47,7,1.16],[-52,-16,.64],[-45,31,.93]]){
    const boat=k.group(westWater,x,.04,z); boat.scale.setScalar(s); boat.rotation.y=-.3;
    k.oval(boat,0x9f7354,0,.27,0,1.32,.31,.47);
    k.oval(boat,0xc6a376,0,.45,0,.95,.14,.36);
    k.post(boat,0x91734f,0,1.33,0,.064,1.86);
    const sail=new THREE.Shape(); sail.moveTo(.05,.67); sail.lineTo(.05,2.40); sail.lineTo(1.05,.67); sail.closePath();
    k.part(boat,new THREE.ExtrudeGeometry(sail,{depth:.06,bevelEnabled:false}),0xffe1a0,0,0,0);
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

// Paint the distant rooftops and mountain ridges on a single quiet horizon.
// The foreground and the street itself remain fully modelled in three dimensions.
function hillsideTexture(time){
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=192;
  const ctx=canvas.getContext('2d');
  const colors=time==='evening'?['#d9c8b6','#c7bba6','#aab4a0','#c5b69c','#c3af93']:['#d5dfcd','#c3d2be','#a9c3af','#d2c8af','#c3bba2'];
  function ridge(base,heights,color){
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,192);ctx.lineTo(0,base);
    for(let x=0;x<=2048;x+=10){
      const h=Math.sin(x*.011)*heights[0]+Math.sin(x*.029+.5)*heights[1]+Math.cos(x*.067)*heights[2];
      ctx.lineTo(x,base-h);
    }
    ctx.lineTo(2048,192);ctx.fill();
  }
  ridge(95,[18,8,3],colors[0]);ridge(116,[11,5,2],colors[1]);
  ridge(137,[6,3,2],colors[2]);
  for(let i=0;i<55;i++){
    const x=i*39+Math.sin(i*2.2)*14, w=13+(i*11)%22,h=5+(i*7)%13,base=145+Math.sin(i)*3;
    ctx.fillStyle=colors[3];ctx.fillRect(x,base-h,w,h+2);
    ctx.fillStyle=colors[4];ctx.beginPath();ctx.moveTo(x-2,base-h);ctx.lineTo(x+3,base-h-3);ctx.lineTo(x+w-3,base-h-3);
    ctx.lineTo(x+w+2,base-h);ctx.fill();
    for(let j=0;j<3;j++)ctx.fillRect(x+3+j*w*.27,base-h+3,2,2.7);
  }
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  return tex;
}
function streetSetting(){
  const root=new THREE.Group(), backgrounds=new Map(),horizons=new Map();
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,38),new THREE.MeshLambertMaterial());
  // The far edge tucks behind the horizon and the near edge stays beyond the
  // camera's field, even on tall phones.
  ground.rotation.x=-Math.PI/2;ground.position.set(0,-.18,11);ground.receiveShadow=true;root.add(ground);
  const scenery=new THREE.Mesh(new THREE.PlaneGeometry(90,8.45),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  scenery.position.set(0,2.48,-8.23);root.add(scenery);root.visible=false;
  return {root, apply(scene,place){
    root.visible=!!place;
    if(!place) return;
    const time=place.id.split('-')[1],palette=streetColors[time];
    if(!backgrounds.has(time)){
      backgrounds.set(time,skyTexture(palette.sky));
      horizons.set(time,hillsideTexture(time));
    }
    root.position.copy(place.root.position);root.scale.copy(place.root.scale);
    ground.material.color.setHex(palette.ground);
    scenery.material.map=horizons.get(time);scenery.material.needsUpdate=true;
    scene.background=backgrounds.get(time);
  },dispose(){for(const tex of [...backgrounds.values(),...horizons.values()]) tex.dispose();}};
}

export function createLifeWorld({canvas,onChoose,onArrive,onSelectLabels,onError,onResident,initialStreet=null}) {
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
  renderer.setClearColor(0x8dbab8);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const overviewSky=new THREE.Color(0x9fc9c2);
  scene.background=overviewSky;
  const camera=new THREE.OrthographicCamera(-75,75,50,-50,.5,370);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=false; controls.enablePan=false;
  controls.minPolarAngle=.23; controls.maxPolarAngle=1.37; controls.rotateSpeed=.65;
  controls.minAzimuthAngle=-1.04; controls.maxAzimuthAngle=1.04;
  controls.minZoom=.62; controls.maxZoom=7;
  scene.add(new THREE.HemisphereLight(0xf7faff,0xb1bcae,1.95));
  const sun=new THREE.DirectionalLight(0xfff0d6,1.94);
  sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
  sun.shadow.bias=-.0006; sun.shadow.normalBias=.035;
  sun.shadow.camera.near=.5; sun.shadow.camera.far=210;
  sun.shadow.radius=2; scene.add(sun,sun.target);
  const map=new THREE.Group(); scene.add(map);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshLambertMaterial({color:0x80b5bb}));
  water.rotation.x=-Math.PI/2; water.position.y=-1.56; water.receiveShadow=true; map.add(water);
  const {ground,picks}=terrain(map);
  const k=createModelKit();
  landscape(map,k,ground);
  const setting=streetSetting();scene.add(setting.root);
  const places=new Map();
  for(const spec of stops){
    const {district,altitude}=ground.get(spec.district);
    const [u,v]=spec.point||[district.x,district.y], root=new THREE.Group();
    root.name=spec.district; root.userData.stopId=spec.id;
    root.position.set(mapX(u),altitude+.013,mapZ(v)); root.scale.setScalar(spec.scale);
    const landmark=makeLandmark(k,spec.id);
    root.add(landmark);
    const amenityGround=new THREE.Group();
    k.oval(amenityGround,0xd7c89d,7.25,.043,-1.70,1.53,.12,1.59);
    root.add(k.bake(amenityGround));
    const amenity=createAmenity(spec.id); amenity.scale.setScalar(.83); amenity.position.set(7.25,.12,-1.70); root.add(amenity);
    const resident=makePerson(k,spec.id);
    resident.root.position.set(2.48,.174,2.24); resident.root.rotation.y=-.73;
    resident.root.userData.guestKey='resident'; root.add(resident.root);
    const shadowSketch=new THREE.Group();
    k.oval(shadowSketch,0xc2ac83,2.49,.174,2.27,.52,.025,.30);
    root.add(k.bake(shadowSketch));
    root.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
    scene.add(root); picks.push(root);
    places.set(spec.id,{...spec,root,resident,index:places.size});
  }
  const player=makePerson(k,'player',true); player.root.visible=false; player.root.name='小安';
  player.root.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
  scene.add(player.root);
  k.releaseSources();

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let width=1,height=1,span=100,frame=0,previous=0,intersecting=true,disposed=false,dirty=true;
  let motion=null,selected=null,gesture=null,multitouch=false;
  let streetPlace=null,crowd=null,crowdPlace=null,paused=reduced.matches,ambientTime=0,timer=0,conversation=null;
  const touching=new Set();
  const overviewAim=new THREE.Vector3(0,.2,0),overviewOffset=new THREE.Vector3(0,100,70);
  const localOffset=new THREE.Vector3(18,37,117);
  function viewSpan(place){
    const aspect=width/height;
    return place ? Math.max(8.60,(aspect<1.08?9.9:11.7)/aspect)*place.scale : Math.max(91,114/aspect);
  }
  function setSpan(next){
    span=next; camera.top=next/2; camera.bottom=-next/2;
    camera.right=next/2*width/height; camera.left=-camera.right;
    camera.updateProjectionMatrix();
  }
  function lightAt(target,radius){
    sun.target.position.copy(target); sun.position.copy(target).add(new THREE.Vector3(-35,75,45));
    const shadow=sun.shadow.camera;
    shadow.left=shadow.bottom=-radius; shadow.right=shadow.top=radius;
    shadow.updateProjectionMatrix();
  }
  function placeView(aim,offset,size){
    controls.target.copy(aim);
    camera.position.copy(aim).add(offset);
    setSpan(size); controls.update();
  }
  function endpoint(place,x,y,z){return new THREE.Vector3(x,y,z).multiplyScalar(place.scale).add(place.root.position);}
  function destination(place){
    return place?endpoint(place,.25,1.99,.62):overviewAim.clone();
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
      const point=endpoint(p,0,4.3,-.42);
      point.project(camera);
      const x=(point.x+1)*width/2, y=(1-point.y)*height/2;
      result.push({id:p.id,x,y,visible:(!selected||selected===p.id)&&point.z>-1&&point.z<1&&x>=0&&x<=width&&y>=0&&y<=height});
    }
    onSelectLabels(result);
  }
  function draw(){
    renderer.render(scene,camera);
    if(dirty) labels();
    dirty=false;
  }
  function schedule(delay=0){
    if(frame||timer||disposed||!intersecting||document.hidden||width<2||height<2) return;
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
    streetPlace=place;
    map.visible=!place;
    for(const p of places.values()) p.root.visible=!place||place===p;
    if(crowd) crowd.root.visible=false;
    if(place){
      if(crowdPlace!==place){
        crowd?.dispose();
        crowd=createCrowd(place.id,place.index);
        crowdPlace=place;place.root.add(crowd.root);
      }
      crowd.root.visible=true;crowd.hold(null);
      sun.color.setHex(streetColors[place.id.split('-')[1]].sun);
    }else{
      scene.background=overviewSky;
      sun.color.setHex(0xfff0d6);
    }
    setting.apply(scene,place);
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
    m.walkMs=reduced.matches?0:Math.min(1950,Math.max(450,m.start.distanceTo(m.end)/p.scale*435));
    showPlayer(p,m.start);m.approachStarted=true;
  }
  function ambientActive(){return !!streetPlace&&!paused;}
  function tick(now){
    frame=0;
    if(disposed||!intersecting||document.hidden) return;
    const dt=previous?Math.min(250,now-previous):0;
    previous=now;
    const animated=ambientActive();
    if(animated){
      ambientTime+=Math.min(dt,140)/1000;
      crowd.update(Math.min(dt,140)/1000,ambientTime);
      idlePose(streetPlace.resident,ambientTime+1.8);
      if(player.root.visible&&!motion) idlePose(player,ambientTime+.5);
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
          player.root.position.lerpVectors(m.start,m.end,f);
          player.root.position.z+=Math.sin(Math.PI*f)*.12*p.scale;
          player.root.rotation.y=Math.atan2(m.end.x-m.start.x,m.end.z-m.start.z+Math.cos(Math.PI*f)*Math.PI*.12*p.scale);
          stepPose(player,f*Math.PI*2*Math.max(1,m.walkMs/330));
          if(f>=1){
            idlePose(player,0);player.root.rotation.y=m.face;
            m.guest.rotation.y=Math.atan2(m.end.x-(p.root.position.x+m.guest.position.x*p.scale),m.end.z-(p.root.position.z+m.guest.position.z*p.scale));
            conversation=m.key;arrived=m;motion=null;
          }
        }
      }
      draw();
    }else if(dirty||animated) draw();
    if(arrived) onArrive?.(arrived.place.id,arrived.key);
    if(motion) schedule();
    else if(ambientActive()) schedule(24);
    else previous=0;
  }
  function street(id){
    const p=places.get(id);
    if(disposed||!p) return;
    const same=streetPlace===p;
    motion=null;selected=id;conversation=null;controls.enabled=true;
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
  function walkTo(id,guestKey='resident'){
    const p=places.get(id);
    if(disposed||!p) return;
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
    paused=!!value;previous=0;invalidate();
  }
  function syncMotionPreference(){setPaused(reduced.matches);}
  function resize(){
    const w=Math.round(canvas.clientWidth),h=Math.round(canvas.clientHeight);
    if(w<2||h<2){width=w;height=h;return;}
    width=w;height=h;renderer.setSize(w,h,false);
    setSpan(viewSpan(places.get(selected))); invalidate();
  }
  function suspend(){
    if(!intersecting||document.hidden){
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
  }
  function up(e){
    const isTap=gesture&&gesture.id===e.pointerId&&!gesture.drag&&!multitouch&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<=6;
    touching.delete(e.pointerId); if(!touching.size) multitouch=false;
    if(!gesture||gesture.id!==e.pointerId) return;
    gesture=null;
    if(!isTap||!controls.enabled||disposed) return;
    const rect=canvas.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
    ray.setFromCamera(pointer,camera);
    const candidates=streetPlace?[streetPlace.root,player.root]:picks;
    const hit=ray.intersectObjects(candidates,true).find(row=>{
      let owner=row.object;
      while(owner){ if(!owner.visible) return false;owner=owner.parent; }
      return true;
    });
    if(!hit) return;
    let obj=hit.object,guest=null;
    while(obj&&!obj.userData.stopId){ guest=guest||obj.userData.guestKey;obj=obj.parent; }
    if(guest&&obj&&streetPlace&&onResident) onResident(obj.userData.stopId,guest);
    else if(obj) onChoose?.(obj.userData.stopId);
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
  canvas.addEventListener('pointerup',up,true);
  canvas.addEventListener('pointercancel',cancel,true);
  canvas.addEventListener('webglcontextlost',lost);
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(canvas);
  const observer=new IntersectionObserver(entries=>{intersecting=entries[entries.length-1].isIntersecting;suspend();});
  observer.observe(canvas); document.addEventListener('visibilitychange',suspend);
  reduced.addEventListener('change',syncMotionPreference);
  function destroy(){
    if(disposed) return;
    disposed=true; motion=null; cancelAnimationFrame(frame);clearTimeout(timer);
    crowd?.dispose();setting.dispose();reduced.removeEventListener('change',syncMotionPreference);
    resizeObserver.disconnect(); observer.disconnect(); document.removeEventListener('visibilitychange',suspend);
    canvas.removeEventListener('pointerdown',down,true); canvas.removeEventListener('pointermove',move,true);
    canvas.removeEventListener('pointerup',up,true); canvas.removeEventListener('pointercancel',cancel,true);
    canvas.removeEventListener('webglcontextlost',lost);
    controls.removeEventListener('change',invalidate); controls.dispose();
    const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(obj=>{
      if(obj.geometry) geometries.add(obj.geometry);
      for(const m of [].concat(obj.material||[])) materials.add(m);
    });
    for(const m of materials) for(const value of Object.values(m)) if(value?.isTexture) textures.add(value);
    for(const tex of textures) tex.dispose();
    for(const geometry of geometries) geometry.dispose();
    for(const material of materials) material.dispose();
    sun.shadow.dispose(); renderer.dispose(); renderer.forceContextLoss();
  }
  resize();
  if(places.has(initialStreet)) street(initialStreet);
  else { placeView(overviewAim,overviewOffset,viewSpan(null));lightAt(overviewAim,72);invalidate(); }
  function captureFrame(){
    if(disposed) return null;
    renderer.render(scene,camera);return canvas;
  }
  return {walkTo,overview,street,setPaused,captureFrame,destroy};
}
