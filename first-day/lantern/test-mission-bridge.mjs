import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getMission,evaluateMission,buildLineSummary,MISSION_IDS} from '../../game-engine.js';
import {restoreMission,chooseMission,continueMission,rewindMission,missionResult,missionSummary,MISSION_SAVE_KEY} from './mission-state.js';
import {RESIDENT_ASSETS,CHARACTER_ASSETS} from './character-assets.js';
import {missionToolRoutes,companionTools} from '../../tool-routes.js';
import {officialWebsite,lineMessage} from '../../service-hub.js';
let paths=0;
function walk(state){
 const m=getMission(state.id,state.profile);
 for(const option of m.questions[state.step].options){
  let next=chooseMission(state,option.id);
  assert.equal(next.phase,'reaction');
  assert.deepEqual(missionResult(next),evaluateMission(next.id,next.answers,next.profile));
  assert.deepEqual(restoreMission(next.id,JSON.parse(JSON.stringify(next))),next,'reload during reaction preserves conditions and choices');
  next=continueMission(next);
  if(next.phase==='ending'){
   paths++;assert(missionResult(next).complete);
   assert.equal(missionSummary(next),buildLineSummary(next.id,next.answers,next.profile),'handoff retains original summary and boundaries');
   assert.deepEqual(restoreMission(next.id,next),next);
   for(let i=0;i<4;i++){const back=rewindMission(next,i);assert.deepEqual(back.answers,next.answers.slice(0,i));assert.equal(back.phase,'question');}
   const url=new URL(lineMessage(missionSummary(next)+'\n我想問：A&B #問題'));
   assert.equal(url.origin,'https://line.me');assert.equal(decodeURIComponent(url.search.slice(1)),missionSummary(next)+'\n我想問：A&B #問題');
  }else walk(next);
 }
}
for(const id of MISSION_IDS){
 walk(restoreMission(id));assert(RESIDENT_ASSETS[id]);const route=missionToolRoutes[id];assert(companionTools[route.primary]);
 await readFile(new URL(RESIDENT_ASSETS[id],import.meta.url));
}
const customProfiles={'first-home':{income:0,savingsWan:0,loanPercent:0,annualRate:0,loanYears:1},'legacy-family':{dedicatedCareIncome:1000000,careCashWan:0,reserveMonths:120}};
for(const [id,profile]of Object.entries(customProfiles))walk(restoreMission(id,{profile}));
const bad=restoreMission('first-home',{answers:['bogus'],phase:'ending',profile:{income:-1}});assert.equal(bad.step,0);assert.deepEqual(bad.answers,[]);assert.equal(bad.profile.income,85000);
assert.notEqual(MISSION_SAVE_KEY,'anxin-missions-v5');assert.equal(new URL(officialWebsite).origin,'https://homegoestate.github.io');
for(const poses of Object.values(CHARACTER_ASSETS))for(const path of Object.values(poses))await readFile(new URL(path,import.meta.url));
const ui=await readFile(new URL('./mission-ui.js',import.meta.url),'utf8');assert(!/setItem\(['"]anxin-missions-v[35]/.test(ui));
console.log(`PASS: ${paths} complete mission paths including zero-income/zero-rate/zero-gap boundary profiles; exact original engine results and summaries; rewind, restore, art assets and official handoff encoding.`);
