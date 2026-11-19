import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { districtShapes } from './atlas/geometry.js';
import { createModelKit, makeLandmark, makePerson } from './life-models.js';
import { createAmenity } from './life-amenities.js';

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

export function createLifeWorld({canvas,onChoose,onArrive,onSelectLabels,onError}) {
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
  renderer.setClearColor(0x8dbab8);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x9fc9c2);
  const camera=new THREE.OrthographicCamera(-75,75,50,-50,.5,370);
  const controls=new OrbitControls(camera,canvas);
  controls.enableDamping=false; controls.enablePan=false;
  controls.minPolarAngle=.23; controls.maxPolarAngle=1.20; controls.rotateSpeed=.65;
  controls.minAzimuthAngle=-1.04; controls.maxAzimuthAngle=1.04;
  controls.minZoom=.62; controls.maxZoom=7;
  scene.add(new THREE.HemisphereLight(0xf7faff,0xb1bcae,1.95));
  const sun=new THREE.DirectionalLight(0xfff0d6,1.94);
  sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
  sun.shadow.bias=-.0006; sun.shadow.normalBias=.035;
  sun.shadow.camera.near=.5; sun.shadow.camera.far=210;
  sun.shadow.radius=2; scene.add(sun,sun.target);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshLambertMaterial({color:0x80b5bb}));
  water.rotation.x=-Math.PI/2; water.position.y=-1.56; water.receiveShadow=true; scene.add(water);
  const {ground,picks}=terrain(scene);
  const k=createModelKit();
  landscape(scene,k,ground);
  const places=new Map();
  for(const spec of stops){
    const {district,altitude}=ground.get(spec.district);
    const [u,v]=spec.point||[district.x,district.y], root=new THREE.Group();
    root.name=spec.district; root.userData.stopId=spec.id;
    root.position.set(mapX(u),altitude+.013,mapZ(v)); root.scale.setScalar(spec.scale);
    const landmark=makeLandmark(k,spec.id);
    root.add(landmark);
    const amenityGround=new THREE.Group();
    k.oval(amenityGround,0xd7c89d,4.69,.043,-.3,1.53,.12,1.59);
    root.add(k.bake(amenityGround));
    const amenity=createAmenity(spec.id); amenity.scale.setScalar(.83); amenity.position.set(5.25,.12,-.3); root.add(amenity);
    const resident=makePerson(k,spec.id);
    resident.root.position.set(2.48,.174,2.24); resident.root.rotation.y=-.73;
    root.add(resident.root);
    const shadowSketch=new THREE.Group();
    k.oval(shadowSketch,0xc2ac83,2.49,.174,2.27,.52,.025,.30);
    root.add(k.bake(shadowSketch));
    root.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
    scene.add(root); picks.push(root);
    places.set(spec.id,{...spec,root});
  }
  const player=makePerson(k,'player',true); player.root.visible=false; player.root.name='小安';
  player.root.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
  scene.add(player.root);
  k.releaseSources();

  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let width=1,height=1,span=100,frame=0,previous=0,intersecting=true,disposed=false,dirty=true;
  let motion=null,selected=null,gesture=null,multitouch=false;
  const touching=new Set();
  const overviewAim=new THREE.Vector3(0,.2,0),overviewOffset=new THREE.Vector3(0,100,70);
  const localOffset=new THREE.Vector3(14,62,105);
  function viewSpan(place){
    const aspect=width/height;
    return place ? Math.max(9.3,13.4/aspect)*place.scale : Math.max(91,114/aspect);
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
    return place?endpoint(place,.47,1.08,-.06):overviewAim.clone();
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
    renderer.render(scene,camera); labels(); dirty=false;
  }
  function schedule(){
    if(!frame&&!disposed&&intersecting&&!document.hidden&&width>1&&height>1) frame=requestAnimationFrame(tick);
  }
  function invalidate(){dirty=true; schedule();}
  function stand(){
    player.legs.forEach(leg=>{leg.rotation.x=0;}); player.arms.forEach(arm=>{arm.rotation.x=0;});
    player.body.position.y=0;
  }
  function tick(now){
    frame=0;
    if(disposed||!intersecting||document.hidden) return;
    const dt=previous?Math.min(300,now-previous):0;
    previous=now;
    let arrived;
    if(motion){
      motion.time+=dt;
      const m=motion,p=m.place;
      if(m.time<=m.focusMs || !m.approachStarted){
        cameraMotion(m.camera,m.focusMs?Math.min(1,m.time/m.focusMs):1,p);
      }
      if(m.time>=m.focusMs){
        if(!m.approachStarted){
          m.approachStarted=true; controls.enabled=true;
          if(p){
            for(const place of places.values()) place.root.visible=place===p;
            player.root.scale.setScalar(p.scale);
            player.root.position.copy(m.start); player.root.visible=true;
          }
        }
        if(!p) motion=null;
        else{
          const f=Math.min(1,(m.time-m.focusMs)/m.walkMs);
          player.root.position.lerpVectors(m.start,m.end,f);
          // The entrance curves gently along the raised footpath, with both feet grounded.
          player.root.position.z+=Math.sin(Math.PI*f)*.20*p.scale;
          player.root.rotation.y=Math.atan2(m.end.x-m.start.x,m.end.z-m.start.z+Math.cos(Math.PI*f)*Math.PI*.20*p.scale);
          const phase=f*Math.PI*10, swing=Math.sin(phase)*(reduced.matches?.18:.46);
          player.legs[0].rotation.x=swing; player.legs[1].rotation.x=-swing;
          player.arms[0].rotation.x=-swing*.75; player.arms[1].rotation.x=swing*.75;
          player.body.position.y=Math.abs(Math.sin(phase))*.027;
          if(f>=1){
            stand(); player.root.rotation.y=1.13; arrived=p.id; motion=null;
          }
        }
      }
      dirty=true;
    }
    if(dirty) draw();
    if(arrived) onArrive?.(arrived);
    if(motion) schedule(); else previous=0;
  }
  function overview(){
    if(disposed) return;
    const cameraState=newCameraMotion(null);
    for(const place of places.values()) place.root.visible=true;
    selected=null; player.root.visible=false; stand(); controls.enabled=false;
    motion={place:null,camera:cameraState,time:0,focusMs:reduced.matches?0:580,approachStarted:false};
    previous=0; invalidate();
  }
  function walkTo(id){
    const p=places.get(id);
    if(disposed||!p) return;
    if(selected===id&&motion) return;
    if(selected===id&&player.root.visible){onArrive?.(id);return;}
    const cameraState=newCameraMotion(p);
    for(const place of places.values()) place.root.visible=true;
    selected=id; player.root.visible=false; stand(); controls.enabled=false;
    motion={place:p,camera:cameraState,time:0,focusMs:reduced.matches?0:700,walkMs:reduced.matches?480:1700,approachStarted:false,
      start:endpoint(p,-3.12,.167,2.71),end:endpoint(p,1.49,.180,2.31)};
    previous=0; invalidate();
  }
  function resize(){
    const w=Math.round(canvas.clientWidth),h=Math.round(canvas.clientHeight);
    if(w<2||h<2){width=w;height=h;return;}
    width=w;height=h;renderer.setSize(w,h,false);
    setSpan(viewSpan(places.get(selected))); invalidate();
  }
  function suspend(){
    if(!intersecting||document.hidden){
      cancelAnimationFrame(frame); frame=0; previous=0; return;
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
    const hit=ray.intersectObjects(picks.filter(obj=>obj.visible),true)[0];
    if(!hit) return;
    let obj=hit.object;
    while(obj&&!obj.userData.stopId) obj=obj.parent;
    if(obj) onChoose?.(obj.userData.stopId);
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
  function destroy(){
    if(disposed) return;
    disposed=true; motion=null; cancelAnimationFrame(frame);
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
  resize(); placeView(overviewAim,overviewOffset,viewSpan(null)); lightAt(overviewAim,72); invalidate();
  return {walkTo,overview,destroy};
}
