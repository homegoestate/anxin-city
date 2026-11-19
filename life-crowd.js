import * as THREE from 'three';
import { createModelKit, makePerson } from './life-models.js?v=28.0.0';

import { pedestrianCircuit } from './street-scenery.js?v=31.0.0';

const lanes = [
  {key:'neighbor',speed:.83,scale:.92,pace:5.8,rest:1.6},
  {key:'visitor',speed:1.06,scale:.84,pace:5.35,rest:1.18}
];
const unit=x=>Math.min(1,Math.max(0,x));
const smooth=x=>{const t=unit(x);return t*t*(3-2*t);};

export function idlePose(rig,time) {
  const breath=Math.sin(time*1.69), shift=Math.sin(time*.80);
  rig.body.position.x=shift*.009;
  rig.body.position.y=(breath+1)*.006;
  rig.body.rotation.set(rig.lean||0,shift*.026,shift*.014);
  rig.legs[0].rotation.x=.024;
  rig.legs[1].rotation.x=-.019;
  for(let i=0;i<2;i++){
    const sign=i===0?-1:1;
    rig.arms[i].rotation.set(i===rig.carried?-.13:-.073+sign*breath*.034,0,sign*.049);
  }
}

export function stepPose(rig,phase,amount=1) {
  const swing=Math.sin(phase)*amount;
  rig.legs[0].rotation.x=.425*swing;
  rig.legs[1].rotation.x=-.425*swing;
  for(let i=0;i<2;i++){
    const sign=i===0?-1:1;
    const amplitude=i===rig.carried?.11:.32;
    rig.arms[i].rotation.set(sign*amplitude*swing-.075,0,sign*.048);
  }
  rig.body.position.x=Math.cos(phase)*.018*amount;
  rig.body.position.y=Math.cos(phase)**2*.027*amount;
  rig.body.rotation.set((rig.lean||0)+.020*amount,-swing*.051,swing*.019);
}

// From the lane, the free hand has to clear the shoulder silhouette for a
// greeting to read. Between greetings the vendor settles back into work.
export function vendorPose(rig,time,offset=0){
  idlePose(rig,time+offset);
  const cycle=(time+offset)%7.5;
  const hello=smooth(cycle/.58)*(1-smooth((cycle-2.05)/.64));
  const arm=rig.arms[rig.carried===1?0:1],side=rig.carried===1?-1:1;
  arm.rotation.x-=.21+hello*.24;
  arm.rotation.z+=side*hello*(2.03+.19*Math.sin(cycle*10.1));
  rig.body.rotation.y+=.11*hello;
  rig.body.rotation.z+=side*.055*hello;
  rig.body.position.y+=hello*.022;
}

export function createMarketVendors(kit,detail){
  const vendors=[];
  for(const [key,look,x,z,scale,yaw,offset] of [
    ['greens','yujing-morning',-2.42,1.62,.84,.09,.83],
    ['steam','yanshui-evening',.95,.69,.87,-.12,3.45]
  ]){
    const rig=makePerson(kit,look,true,{detail:'far'});
    rig.root.position.set(x,.12,z);rig.root.scale.setScalar(scale);
    rig.root.rotation.y=yaw;rig.root.userData.marketVendor=key;
    detail.add(rig.root);vendorPose(rig,0,offset);
    vendors.push({rig,offset});
  }
  return vendors;
}

function updateWalker(walker,dt=0) {
  const {lane,rig,curve,run,rest,length}=walker;
  const cycle=run+rest,clock=walker.elapsed%cycle;
  const u=(Math.min(clock,run)/run+walker.start)%1;
  curve.getPointAt(u,walker.point);curve.getTangentAt(u,walker.tangent);
  rig.root.position.set(walker.point.x,.149,walker.point.z);
  let yaw=Math.atan2(walker.tangent.x,walker.tangent.z);
  if(clock<run){
    stepPose(rig,walker.elapsed*length/run*lane.pace+walker.phase);
  }else{
    idlePose(rig,walker.elapsed+walker.phase);
    const t=(clock-run)/rest,gesture=Math.sin(t*Math.PI)**2;
    yaw+=gesture*.49;
    const hand=rig.arms[rig.carried===1?0:1];
    hand.rotation.x-=gesture*.38;
    hand.rotation.z+=(rig.carried===1?-1:1)*gesture*(1.33+.10*Math.sin(t*15));
  }
  if(walker.releasing>0){
    walker.releasing=Math.max(0,walker.releasing-dt);
    const angleDiff=Math.atan2(Math.sin(walker.releaseYaw-yaw),Math.cos(walker.releaseYaw-yaw));
    yaw+=angleDiff*smooth(walker.releasing/.5);
  }
  rig.root.rotation.y=yaw;
}

export function createCrowd(id,index) {
  const kit=createModelKit(),root=new THREE.Group();
  const walkers=lanes.map((lane,i)=>{
    const rig=makePerson(kit,id,true,{variant:i+1});
    rig.root.scale.setScalar(lane.scale);
    rig.root.userData.guestKey=lane.key;
    rig.root.name=lane.key;
    root.add(rig.root);
    const points=pedestrianCircuit(index,i===1).map(([x,z])=>new THREE.Vector3(x,0,z));
    if((index+i)%2)points.reverse();
    const curve=new THREE.CatmullRomCurve3(points,true,'centripetal');
    curve.arcLengthDivisions=96;
    const length=curve.getLength(),run=length/(lane.speed*(index===0?1.20:1+(index%5)*.025));
    const walker={
      rig,lane,curve,length,run,rest:lane.rest+(index%3)*.17,point:new THREE.Vector3(),tangent:new THREE.Vector3(),
      elapsed:0,start:i?.89:.02,phase:i*1.64+index*.43,releasing:0,releaseYaw:0
    };
    updateWalker(walker);
    return walker;
  });
  root.traverse(obj=>{if(obj.isMesh){obj.castShadow=true;obj.receiveShadow=true;}});
  kit.releaseSources();
  let held=null;
  return {
    root,
    actor(key){return walkers.find(w=>w.lane.key===key)?.rig.root;},
    hold(key){
      if(held&&key!==held){
        const walker=walkers.find(w=>w.lane.key===held);
        if(walker){walker.releaseYaw=walker.rig.root.rotation.y;walker.releasing=.5;}
      }
      held=key;
    },
    update(dt,time){
      for(const walker of walkers){
        if(walker.lane.key===held){idlePose(walker.rig,time+walker.phase);continue;}
        walker.elapsed+=dt;
        updateWalker(walker,dt);
      }
    },
    dispose(){
      root.removeFromParent();
      const materials=new Set();
      root.traverse(obj=>{
        if(!obj.isMesh) return;
        obj.geometry.dispose();
        materials.add(obj.material);
      });
      for(const material of materials) material.dispose();
    }
  };
}
