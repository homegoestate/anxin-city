import assert from 'node:assert/strict';
import {fresh,view,advance} from './model.js';
import {CAST,STOPS,dialoguePages,sceneCast,nextDestination} from './presentation.js';
import {projectToStreet,planStreetRoute,approachStopPosition} from './walk-world.js';

let count=0;
function checkStory(s){
 const n=view(s),lines=n.fact?[...n.lines,n.fact.text]:n.lines;
 const pages=dialoguePages(lines),cast=sceneCast(s,n.speaker);
 assert.equal(pages.join(''),lines.join(''),'pagination must preserve every story/fact character');
 assert(pages.every(p=>p.length<=65),'mobile pages remain bounded');
 assert(cast.ids.length&&cast.ids.every(id=>CAST[id]),'every scene has renderable characters');
 assert(STOPS.some(stop=>stop.id===nextDestination(s)),'resume target must exist on map');
 count++;
 for(const choice of n.choices)checkStory(advance(s,choice.id));
}
checkStory(fresh());
assert.equal(dialoguePages(['很長的句子'.repeat(70)]).join(''),'很長的句子'.repeat(70));
assert.deepEqual(projectToStreet(null),{x:500,y:540});
assert.deepEqual(projectToStreet({x:Infinity,y:NaN}),{x:500,y:540});
const xs=[130,360,500,620,870],ys=[220,440,540];
const stops=[{x:500,y:540},...STOPS.map(approachStopPosition),{x:-100,y:900},{x:700,y:300}];
let routes=0;
for(const from of stops)for(const to of stops){
 const route=planStreetRoute(from,to);
 assert.deepEqual(route[0],projectToStreet(from));assert.deepEqual(route.at(-1),projectToStreet(to));
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i];
  assert((a.x===b.x&&xs.includes(a.x))||(a.y===b.y&&ys.includes(a.y)),'walk only along roads');
 }
 for(const p of route)assert(p.x>=60&&p.x<=940&&p.y>=175&&p.y<=565);
 routes++;
}
for(const stop of STOPS){const p=approachStopPosition(stop);assert(Math.hypot(p.x-stop.x,p.y-stop.y)<=68,'arrival can interact');}
assert.deepEqual(CAST.yang.name,'楊代書');
console.log(`PASS: ${count} story states retain every word and visible cast; ${routes} routes stay connected and on roads; all arrivals are in interaction range.`);
