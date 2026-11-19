import * as THREE from 'three';
import { makePerson } from './life-models.js?v=28.0.0';
import { idlePose, stepPose } from './life-crowd.js?v=28.0.0';

// Hand-placed on separate stretches of dry ground, in the atlas' 600-unit projection.
export const overviewTrails = [
  { district:'七股區', outfit:'anping-afternoon', path:[[34,368],[47,374],[60,369]], phase:.31 },
  { district:'白河區', outfit:'player', path:[[434,131],[447,127],[462,127]], phase:.65 },
  { district:'官田區', outfit:'yujing-morning', path:[[339,261],[352,256],[365,255]], phase:.13 },
  { district:'歸仁區', outfit:'beimen-evening', path:[[242,479],[256,481],[269,488]], phase:.81 }
];

export function createOverviewWalkers(k,ground,project) {
  const root=new THREE.Group(), walkers=[];
  root.name='台南小徑上的散步街坊';
  const point=new THREE.Vector3(),tangent=new THREE.Vector3();
  const stamp=document.createElement('canvas');stamp.width=stamp.height=64;
  const pen=stamp.getContext('2d'),shade=pen.createRadialGradient(32,32,0,32,32,32);
  shade.addColorStop(0,'rgba(52,59,45,.46)');shade.addColorStop(.46,'rgba(52,59,45,.28)');shade.addColorStop(1,'rgba(52,59,45,0)');
  pen.fillStyle=shade;pen.fillRect(0,0,64,64);
  const shadow=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(stamp),transparent:true,depthWrite:false});
  const footprint=new THREE.PlaneGeometry(1.72,1.08);
  for(const [i,trail] of overviewTrails.entries()){
    const {altitude,mesh}=ground.get(trail.district), id=mesh.userData.stopId;
    const points=trail.path.map(([x,z])=>new THREE.Vector3(project(x),altitude+.055,project(z)));
    const route=new THREE.QuadraticBezierCurve3(...points);
    const rig=makePerson(k,trail.outfit,true,{detail:'far'});
    rig.root.name=trail.district+'散步街坊';
    rig.root.userData.overviewWalker=id;rig.root.userData.stopId=id;
    const contact=new THREE.Mesh(footprint,shadow);contact.rotation.x=-Math.PI/2;
    contact.position.set(.08,.014,-.11);rig.root.add(contact);
    root.add(rig.root);
    const duration=route.getLength()/(.76+i*.045), pause=1.25+i*.21;
    walkers.push({rig,route,points,duration,pause,time:(duration+pause)*2*trail.phase,index:i});
  }
  function update(dt){
    for(const w of walkers){
      w.time+=dt;
      const leg=w.duration+w.pause,t=w.time%(2*leg),back=t>=leg,local=t%leg;
      const u=Math.min(1,local/w.duration),progress=back?1-u:u;
      w.route.getPoint(progress,point);w.route.getTangent(progress,tangent);
      const turn=Math.max(0,(local-w.duration)/w.pause);
      // Turn towards the viewer during the pause, so the face is visible at both ends.
      const sign=back?-1:1;
      const facing=THREE.MathUtils.clamp(Math.atan2(tangent.x*sign,tangent.z*sign),-1.11,1.11);
      const endFacing=THREE.MathUtils.clamp(Math.atan2(-tangent.x*sign,-tangent.z*sign),-1.11,1.11);
      w.rig.root.rotation.y=THREE.MathUtils.lerp(facing,endFacing,turn*turn*(3-2*turn));
      w.rig.root.position.copy(point);
      if(local<w.duration) stepPose(w.rig,w.time*(3.3+w.index*.18)+w.index,.93);
      else idlePose(w.rig,w.time);
    }
  }
  function resize(worldUnitsPerPixel){
    // The little people are map figurines. Preserve their silhouette on a narrow phone.
    for(const w of walkers) w.rig.root.scale.setScalar(THREE.MathUtils.clamp(worldUnitsPerPixel*15.5,2.65,4.55));
  }
  function labelGaps(camera,width,height){
    const toScreen=p=>{
      const v=p.clone().project(camera);
      return [(v.x+1)*width/2,(1-v.y)*height/2];
    };
    return walkers.map(w=>{
      const scale=w.rig.root.scale.x, box=new THREE.Box3().setFromPoints(w.points);
      box.min.add(new THREE.Vector3(-.63*scale,0,-.56*scale));
      box.max.add(new THREE.Vector3(.63*scale,2.5*scale,.56*scale));
      const pixels=[];
      for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
        pixels.push(toScreen(point.set(x,y,z)));
      }
      return {left:Math.min(...pixels.map(p=>p[0]))-2,right:Math.max(...pixels.map(p=>p[0]))+2,
        top:Math.min(...pixels.map(p=>p[1]))-2,bottom:Math.max(...pixels.map(p=>p[1]))+2};
    });
  }
  update(0);
  return {root,update,resize,labelGaps};
}
