import assert from 'node:assert/strict';
import {fresh,view,advance,replay,restore,postcard,STORAGE_KEY} from './model.js';
const endings=[],visitedNodes=new Set();
function walk(s){
 const n=view(s);visitedNodes.add(s.node);
 assert(n.lines.length>0);assert(n.choices.length<=2);
 assert(s.trail.length<40,'story must terminate');
 if(n.ending){
  assert.deepEqual(new Set(s.visited),new Set(['bo','momo']));
  assert(s.bo&&s.momo&&s.rain&&s.heading);
  assert.deepEqual(restore(JSON.stringify({version:1,trail:s.trail})),s);
  assert.deepEqual(advance(replay(s.trail.slice(0,-1)),s.trail.at(-1)),s);
  assert(postcard(s).past.includes(s.bo==='port'?'小船':'木窗'));
  assert(postcard(s).today.includes(s.momo==='help'?'搬椅':'聊天'));
  assert(postcard(s).place.includes(s.rain==='inside'?'文具店':'屋簷'));
  endings.push(s);return;
 }
 assert(n.choices.length>0,'no dead end');
 for(const choice of n.choices){const next=advance(s,choice.id);assert.notEqual(next,s);walk(next);}
}
walk(fresh());
assert.equal(endings.length,256);
assert.equal(visitedNodes.size,17);
let hub=replay(['hold','accept']);let pause=advance(hub,'quiet');assert.equal(pause.node,'quiet');assert.equal(advance(pause,'rest-done').node,'hub');
assert.equal(advance(hub,'not-a-choice'),hub);
assert.deepEqual(restore('broken'),fresh());assert.deepEqual(restore('{"version":4}'),fresh());
assert.deepEqual(restore('{"version":1,"trail":["bogus","accept"]}'),fresh());
const boFirst=replay(['hold','accept','visit-bo','look-name','name-note','draw-port','bo-done','visit-momo']);
assert(view(boFirst).lines[0].includes('博伯'));
const momoFirst=replay(['hold','accept','visit-momo','ask-blank','draw-talk','momo-done','visit-bo']);
assert(view(momoFirst).lines[0].includes('沫沫'));
assert.equal(STORAGE_KEY,'anxin-lantern-story-v1');
console.log(`PASS: ${endings.length} complete routes; ${visitedNodes.size} story nodes + optional rest; branch callbacks; postcard; rewind/replay; persisted-state recovery.`);
