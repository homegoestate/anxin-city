import * as THREE from 'three';
import { createModelKit, makePerson } from './life-models.js?v=26.0.0';

// Each resident walks their own stretch of pavement. The pauses at the ends give
// them time to turn, and the two lanes stay clear of the conversation at the shops.
const lanes = [
  { key:'neighbor', left:-3.85, right:.94, z:3.61, speed:.76, start:.045, scale:.91, stride:1.09 },
  { key:'visitor', left:-.38, right:3.94, z:4.78, speed:.93, start:.54, scale:.82, stride:1.25 }
];
const turn = 1.12;
const smooth = t => t*t*(3-2*t);

export function idlePose(rig, time) {
  const breath = Math.sin(time*1.8);
  rig.body.position.y = breath*.012;
  rig.body.rotation.z = Math.sin(time*.75)*.013;
  rig.legs[0].rotation.x = .029;
  rig.legs[1].rotation.x = -.024;
  rig.arms[0].rotation.x = -.12 + breath*.052;
  rig.arms[1].rotation.x = -.075 - breath*.039;
}

export function stepPose(rig, phase, amount = 1) {
  const swing = Math.sin(phase)*amount;
  rig.legs[0].rotation.x = .48*swing;
  rig.legs[1].rotation.x = -.48*swing;
  rig.arms[0].rotation.x = -.33*swing-.05;
  rig.arms[1].rotation.x = .33*swing-.05;
  rig.body.position.y = Math.abs(Math.cos(phase))*.046*amount;
  rig.body.rotation.z = .025*swing;
}

function updateWalker(walker) {
  const {lane, rig, elapsed, legTime} = walker;
  const cycle = 2*(legTime+turn);
  const t = elapsed%cycle;
  const inbound = t >= legTime+turn;
  const local = inbound ? t-legTime-turn : t;
  const progress = Math.min(1,local/legTime);
  const along = inbound ? 1-progress : progress;
  const bend = Math.sin(along*Math.PI*2+walker.phase);
  const facing = inbound ? -1 : 1;
  const change = smooth(Math.max(0,(local-legTime)/turn));
  rig.root.position.set(THREE.MathUtils.lerp(lane.left,lane.right,along),.146,lane.z+.09*bend);
  rig.root.rotation.y = facing*(1-2*change)*1.33+.07*bend;
  if(local < legTime) {
    const rate = Math.min(1, (legTime-local)*4, local*4);
    stepPose(rig,elapsed*lane.speed*7.9*lane.stride+walker.phase,rate);
  } else idlePose(rig,elapsed+walker.phase);
}

export function createCrowd(id, index) {
  const kit = createModelKit();
  const root = new THREE.Group();
  const walkers = lanes.map((lane, i) => {
    const rig = makePerson(kit,id,true,{variant:i+1});
    rig.root.scale.setScalar(lane.scale);
    rig.root.userData.guestKey = lane.key;
    rig.root.name = lane.key;
    root.add(rig.root);
    const legTime = (lane.right-lane.left)/(lane.speed*(1+index*.022));
    const walker = {rig,lane,legTime,elapsed:(lane.start+index*.013)*2*(legTime+turn),phase:i*1.8+index*.41};
    updateWalker(walker);
    return walker;
  });
  root.traverse(obj=>{ if(obj.isMesh){ obj.castShadow=true; obj.receiveShadow=true; } });
  kit.releaseSources();
  let held = null;
  return {
    root,
    actor(key){ return walkers.find(w=>w.lane.key===key)?.rig.root; },
    hold(key){ held=key; },
    update(dt, time){
      for(const walker of walkers){
        if(walker.lane.key===held){ idlePose(walker.rig,time+walker.phase); continue; }
        walker.elapsed+=dt;
        updateWalker(walker);
      }
    },
    dispose(){
      root.removeFromParent();
      const materials = new Set();
      root.traverse(obj=>{
        if(!obj.isMesh) return;
        obj.geometry.dispose();
        materials.add(obj.material);
      });
      for(const material of materials) material.dispose();
    }
  };
}
