import * as THREE from 'three';
import { createModelKit, makePerson } from './life-models.js?v=28.0.0';

// Both pavements stay clear of the door and of the player speaking to a resident.
const lanes = [
  {key:'neighbor',left:-3.85,right:.94,z:3.61,speed:.76,start:.12,scale:.94,pace:6.0,rest:2.65},
  {key:'visitor',left:-.38,right:3.94,z:4.78,speed:.81,start:.61,scale:.85,pace:5.6,rest:2.25}
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

function strollingProgress(time,duration,ramp) {
  // Integral of smoothstep speed. The feet slow down with the actual distance.
  const end=time>duration/2;
  const fromEnd=Math.min(time,duration-time);
  const u=unit(fromEnd/ramp);
  const distance=fromEnd<ramp?ramp*u**3*(1-u*.5):fromEnd-ramp*.5;
  const portion=distance/(duration-ramp);
  return end?1-portion:portion;
}

function updateWalker(walker,dt=0) {
  const {lane,rig,elapsed,legTime,rest}=walker;
  const segment=legTime+rest,pass=Math.floor(elapsed/segment),local=elapsed-pass*segment;
  const facing=pass%2===0?1:-1,travel=Math.min(local,legTime);
  const progress=strollingProgress(travel,legTime,walker.ramp);
  const along=facing>0?progress:1-progress;
  const bend=Math.sin(along*Math.PI*2+walker.phase);
  const pause=unit((local-legTime)/rest);
  // Look towards the street for a moment between arriving and setting off.
  const angle=1.28+.075*bend;
  let yaw=facing*angle*(1-smooth(pause/.36)-smooth((pause-.63)/.37));
  rig.root.position.set(THREE.MathUtils.lerp(lane.left,lane.right,along),.146,lane.z+.095*bend);
  if(local<legTime){
    const pace=smooth(Math.min(local,legTime-local)/walker.ramp);
    const phase=(pass+progress)*(lane.right-lane.left)*lane.pace+walker.phase;
    stepPose(rig,phase,pace);
  }else{
    idlePose(rig,elapsed+walker.phase);
    if((pass+walker.greeting)%3===0){
      const gesture=smooth((pause-.13)/.21)*(1-smooth((pause-.66)/.22));
      const hand=rig.arms[rig.carried===1?0:1],side=rig.carried===1?-1:1;
      hand.rotation.x-=gesture*.44;
      hand.rotation.z+=side*gesture*(1.77+.155*Math.sin(pause*25+walker.phase));
    }
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
    const legTime=(lane.right-lane.left)/(lane.speed*(1+index*.016));
    const rest=lane.rest+(index%3)*.12;
    const walker={
      rig,lane,legTime,rest,ramp:Math.min(.69,.14*legTime),
      elapsed:(lane.start+index*.017)*2*(legTime+rest),phase:i*1.64+index*.43,
      greeting:(i+index)%3,releasing:0,releaseYaw:0
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
