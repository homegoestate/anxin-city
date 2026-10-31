// Presentation state only. All choices, calculations and summaries come from the existing engine.
import { getMission, evaluateMission, normalizeProfile, buildLineSummary } from '../../game-engine.js';
export const MISSION_SAVE_KEY='anxin-lantern-missions-v1';
export function restoreMission(id,entry){
 let profile;try{profile=normalizeProfile(id,entry?.profile||{});}catch{profile=normalizeProfile(id,{});}
 let answers=[],step=0,phase='question';
 try{
  if(Array.isArray(entry?.answers)){
   const result=evaluateMission(id,entry.answers,profile);
   answers=result.answers.slice(0,result.answeredCount);
   if(answers.some(x=>x===null))throw Error('Noncontiguous answers');
   step=Math.max(0,Math.min(3,answers.length,Number.isInteger(entry.step)?entry.step:answers.length));
   phase=result.complete&&entry.phase==='ending'?'ending':entry.phase==='reaction'&&answers.length===step+1?'reaction':'question';
   if(phase==='question')answers=answers.slice(0,step);
  }
 }catch{answers=[];step=0;phase='question';}
 return {id,profile,answers,step,phase};
}
export function chooseMission(state,optionId){
 const question=getMission(state.id,state.profile).questions[state.step];
 if(state.phase!=='question'||!question.options.some(x=>x.id===optionId))return state;
 return {...state,answers:[...state.answers.slice(0,state.step),optionId],phase:'reaction'};
}
export function continueMission(state){
 if(state.phase!=='reaction')return state;
 return {...state,step:Math.min(3,state.step+1),phase:state.step===3?'ending':'question'};
}
export function rewindMission(state,step){
 const index=Math.max(0,Math.min(3,state.answers.length,step));
 return {...state,step:index,answers:state.answers.slice(0,index),phase:'question'};
}
export function missionResult(state){return evaluateMission(state.id,state.answers,state.profile);}
export function missionSummary(state){return buildLineSummary(state.id,state.answers,state.profile);}
