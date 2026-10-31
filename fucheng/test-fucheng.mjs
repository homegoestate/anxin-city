import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CHAPTERS, REVIEWED_AT, asset} from './data.js';
import {fresh,restore,transition,collected,postcardText,STORAGE_KEY} from './state.js';
import {culturePlaces} from '../culture-data.js';
import {tainanDistricts} from '../tainan-data.js';
import {actorPaintBox} from '../first-day/lantern/walk-world.js';

assert.equal(CHAPTERS.length,4);
assert.equal(tainanDistricts.length,37);
assert.equal(culturePlaces.length,44);
assert.equal(REVIEWED_AT,'2026-10-31');
let routes=0;
for(let bits=0;bits<16;bits++){
  let s=transition(fresh(),{type:'begin'});
  for(let i=0;i<4;i++){
    assert.equal(s.active,CHAPTERS[i].id);
    s=transition(s,{type:'choose',index:(bits>>i)&1});
    assert.deepEqual(restore(JSON.stringify(s)),s,'resume preserves the actual selected story');
    s=transition(s,{type:'next'});
  }
  assert.equal(s.view,'book');assert.equal(collected(s).length,4);
  const text=postcardText(s);
  for(let i=0;i<4;i++)assert(text.includes(CHAPTERS[i].choices[(bits>>i)&1].memory));
  const revisit=transition(s,{type:'open',id:'street'});
  assert.equal(collected(revisit).length,4,'revisiting must not erase the other postcards');
  const changed=transition(revisit,{type:'choose',index:1-(bits&1)});
  assert.equal(Object.keys(changed.choices).length,4);
  assert.equal(s.choices.street,bits&1,'transitions never mutate earlier state');
  routes++;
}
for(const value of [null,'bad','[]','{"version":2}',{"version":1,"choices":{"street":7,"gate":"0","injected":1},"active":"missing","view":"broken"}])assert.deepEqual(restore(value),fresh());
let state=transition(fresh(),{type:'open',id:'harbor'});state=transition(state,{type:'choose',index:1});state=transition(state,{type:'next'});
assert.equal(collected(state).length,1,'out-of-order reading only credits the visited chapter');
assert.equal(transition(state,{type:'begin'}).active,'street');
assert.equal(transition(state,{type:'choose',index:NaN}).choices.harbor,1);
assert(!['anxin-missions-v5','anxin-lantern-missions-v1','anxin-tainan-passport-v1'].includes(STORAGE_KEY));
for(const c of CHAPTERS){
  assert(culturePlaces.some(p=>p.id===c.placeId&&p.districtId===c.districtId),'deep links point to existing culture records');
  assert(tainanDistricts.some(d=>d.id===c.districtId));
  assert(['www.twtainan.net','twtainan.net','historic.tainan.gov.tw'].includes(new URL(c.source.url).hostname));
  assert.equal(c.choices.length,2);
  assert(c.choices.every(o=>o.question&&o.fact&&o.memory),'every choice delivers a related answer and takeaway');
  await readFile(new URL(asset(c.image)));
}
let layouts=0;
for(const width of [285,320,390,527,644,768,1000,1120])for(const x of [60,130,360,500,620,870,940])for(const y of [175,220,440,540,565]){
  const height=width*.62,box=actorPaintBox({x,y},width,height);
  assert(Object.values(box).every(Number.isInteger),'no fractional CSS pixels on moving images');
  assert(box.left>=0&&box.left+box.width<=width,'full sprite stays inside map edges');
  assert(box.top>=0&&box.top+box.height<=height+1,'full sprite remains vertically inside the map');
  assert(Math.abs(box.left+box.width*.5-x*width/1000)<=.5);
  assert(Math.abs(box.top+box.height*.973-y*height/620)<=.5);
  layouts++;
}
console.log(`PASS: ${routes} complete culture routes; restore, revisit, out-of-order reading; 8 sourced answers; 37 districts / 44 culture records; ${layouts} pixel-aligned actor layouts.`);
