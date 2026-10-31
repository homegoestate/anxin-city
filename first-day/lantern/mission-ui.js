import { getMission, getProfileFields, normalizeProfile, MISSION_IDS } from '../../game-engine.js';
import { officialWebsite, lineProfile, lineMessage } from '../../service-hub.js';
import { companionTools, missionToolRoutes } from '../../tool-routes.js';
import { videoPlaylists } from '../../video-links.js';
import { RESIDENT_ASSETS } from './character-assets.js';
import { MISSION_SAVE_KEY, restoreMission, chooseMission, continueMission, rewindMission, missionResult, missionSummary } from './mission-state.js';

const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,run,cls='')=>{const b=el('button',text,'cursor-interaction '+cls);b.type='button';b.addEventListener('click',run);return b;};
const link=(label,url)=>{const a=el('a',label+' ↗','ls-life-link');a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
const themes={
 'first-home':{tag:'喜歡的家，住得從容',quote:'「我想有自己的家，也想留一點錢，好好過生活。」'},
 'move-home':{tag:'兩個家的資金接力',quote:'「新家找到了。舊家的錢，什麼時候接得上？」'},
 seller:{tag:'下一站，帶走多少',quote:'「準備告別這個家，我想先看清楚，最後能留下多少。」'},
 'legacy-family':{tag:'家人的下一段日常',quote:'「未來怎麼安排？我們想先把自己的生活照顧好。」'}
};
function portrait(id,cls=''){
 const holder=el('span',undefined,'ls-resident-image '+cls),img=el('img');
 img.src=RESIDENT_ASSETS[id];img.alt=getMission(id).character.name;img.width=360;img.height=360;img.draggable=false;
 const fallback=el('span',getMission(id).character.name,'ls-image-fallback');fallback.hidden=true;
 img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false;});holder.append(img,fallback);return holder;
}
function list(title,items){const d=el('details'),s=el('summary',title),ul=el('ul');for(const t of items)ul.append(el('li',t));d.append(s,ul);return d;}

export function mountMissions({root,storage,onOpen,onClose}){
 const roster=root.querySelector('#ls-residents'),host=root.querySelector('#ls-life-view');
 let state=null,saved={},sourceSaved={},saveFailed=false,settings=false,returnFocus=null;
 const parse=key=>{try{const value=JSON.parse(storage?.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}};
 saved=parse(MISSION_SAVE_KEY);sourceSaved={...parse('anxin-missions-v3'),...parse('anxin-missions-v5')};
 const persist=()=>{if(!state)return;saved[state.id]={answers:state.answers,profile:state.profile,step:state.step,phase:state.phase};try{storage?.setItem(MISSION_SAVE_KEY,JSON.stringify(saved));}catch{saveFailed=true;}};
 const close=()=>{settings=false;onClose();returnFocus?.focus({preventScroll:true});};
 function open(id){if(!MISSION_IDS.includes(id))return;returnFocus=document.activeElement;state=restoreMission(id,saved[id]??sourceSaved[id]);settings=false;onOpen();render();host.scrollIntoView({block:'start'});}
 function update(next){state=next;persist();render();host.scrollIntoView({block:'start'});}
 for(const id of MISSION_IDS){const b=button('',()=>open(id),'ls-resident-card');b.dataset.mission=id;b.append(portrait(id),el('strong',getMission(id).character.name),el('span',themes[id].tag));roster.append(b);}
 function renderSettings(body){
  body.append(el('h2','換一組條件，再陪他走一次'),el('p','這是角色的情境設定。套用後保留已選的路徑，重新計算。','ls-life-help'));
  const form=el('form'),grid=el('div',undefined,'ls-profile-grid');
  for(const f of getProfileFields(state.id)){
   const label=el('label'),name=el('span',f.label+'（'+f.unit+'）'),input=el('input'),help=el('small',f.help);
   input.id='life-field-'+f.id;input.name=f.id;input.type='number';input.inputMode='decimal';input.required=true;input.min=f.min;input.max=f.max;input.step=f.step;input.value=state.profile[f.id];
   help.id=input.id+'-help';input.setAttribute('aria-describedby',help.id);label.append(name,input,help);grid.append(label);
  }
  const error=el('p',undefined,'ls-life-error');error.setAttribute('role','alert');
  const actions=el('div',undefined,'ls-life-actions'),submit=el('button','套用這組條件','ls-life-primary cursor-interaction');submit.type='submit';
  actions.append(submit,button('保留原條件',()=>{settings=false;render();}));form.append(grid,error,actions);
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;try{const data={};for(const f of getProfileFields(state.id))data[f.id]=Number(form.elements.namedItem(f.id).value);state={...state,profile:normalizeProfile(state.id,data)};settings=false;persist();render();}catch(e){error.textContent=e.message;}});body.append(form);
 }
 function renderEnding(body){
  const result=missionResult(state),route=missionToolRoutes[state.id];
  body.append(el('p','這次選擇，留下的線索','ls-eyebrow'),el('h2',result.ending.title),el('p',result.ending.summary,'ls-life-summary'));
  const cards=el('div',undefined,'ls-result-grid');
  for(const m of result.metricCards){const c=el('section');c.append(el('p',m.label),el('strong',m.value.toLocaleString('zh-TW')+' '+m.unit),el('small',m.detail));cards.append(c);}body.append(cards);
  body.append(list('看懂這次結果',result.insights),list('本次假設與限制',result.assumptions));
  if(result.timeline.length){const d=el('details'),table=el('table'),head=el('tr'),tbody=el('tbody');for(const t of ['月份','月底現金','月內最高缺口'])head.append(el('th',t));const thead=el('thead');thead.append(head);table.append(thead,tbody);for(const row of result.timeline){const tr=el('tr');for(const t of [row.month+' 月',row.balance.toLocaleString('zh-TW')+' 元',row.peakFundingGap.toLocaleString('zh-TW')+' 元'])tr.append(el('td',t));tbody.append(tr);}d.append(el('summary','查看換屋現金時間線'),el('p','缺口含保留 60 萬元預備金的需求；各月取最高值，並非只看月底。','ls-life-help'),table);body.append(d);}
  const revise=el('details'),routes=el('div',undefined,'ls-life-actions');revise.append(el('summary','換個選擇，看看另一種可能'));getMission(state.id,state.profile).questions.forEach((q,i)=>routes.append(button(q.title,()=>update(rewindMission(state,i)))));revise.append(routes);body.append(revise);
  const handoff=el('section',undefined,'ls-handoff');handoff.append(el('p','宏國地政｜易丞地政','ls-eyebrow'),el('h3','把剛才的問題，接著聊下去'),el('p',route.intro));
  const label=el('label','我還想問…（選填）');label.htmlFor='ls-followup';const question=el('textarea');question.id='ls-followup';question.rows=2;question.maxLength=300;question.placeholder='例如：我想先確認還要準備哪些文件。';
  const review=el('details');review.append(el('summary','確認將帶到官方 LINE 的內容'));const summary=el('textarea');summary.rows=6;summary.readOnly=true;summary.setAttribute('aria-label','即將帶到官方 LINE 的遊戲摘要');review.append(summary);
  const actions=el('div',undefined,'ls-life-actions'),line=link('帶著問題到官方 LINE',lineProfile);line.classList.add('ls-life-primary');
  const note=el('p','先確認摘要，再到 LINE 自行送出。這裡不會自動傳送；遊戲數字不會帶入試算工具。','ls-life-help');
  const updateDraft=()=>{summary.value=missionSummary(state)+(question.value.trim()?'\n\n我另外想問：'+question.value.trim():'');line.href=lineMessage(summary.value);};question.addEventListener('input',updateDraft);updateDraft();
  const copyStatus=el('p');copyStatus.setAttribute('role','status');const copy=button('複製摘要',async()=>{try{await navigator.clipboard.writeText(summary.value);copyStatus.textContent='已複製，可以貼到官方 LINE。';}catch{review.open=true;summary.focus();summary.select();copyStatus.textContent='請手動複製已選取的摘要。';}});
  actions.append(line,copy,link('官方網站',officialWebsite));handoff.append(label,question,review,actions,note,copyStatus);
  const resources=el('div',undefined,'ls-life-resources');resources.append(link(route.action,companionTools[route.primary].url));if(route.secondary)resources.append(link(route.secondaryAction,companionTools[route.secondary].url));const video=videoPlaylists.find(v=>v.id===route.video);if(video)resources.append(link('接著看：'+video.title,video.url));handoff.append(resources,list('帶哪些資料接著談',result.nextSteps),el('p','影片請留意發布日期；實際貸款、稅費與法律效果仍需以資料確認。','ls-life-help'));body.append(handoff);
 }
 function render(){
  host.replaceChildren();const mission=getMission(state.id,state.profile),theme=themes[state.id];
  const nav=el('div',undefined,'ls-life-nav');nav.append(button('← 回街上',close),el('span','家的四個主角'),link('原版完整任務','https://homegoestate.github.io/anxin-city/?start='+state.id));host.append(nav);
  const stage=el('div',undefined,'ls-life-stage'),intro=el('div');intro.append(el('p',mission.character.name,'ls-eyebrow'),el('h1',theme.tag),el('p',theme.quote));stage.append(portrait(state.id),intro);host.append(stage);
  const body=el('section',undefined,'ls-life-body');body.setAttribute('aria-label',mission.title);host.append(body);
  if(settings){renderSettings(body);return;}
  const meta=el('div',undefined,'ls-life-meta');meta.append(el('span',state.phase==='ending'?'四段選擇 · 這次的結果':`第 ${state.step+1} 段 / 4 · ${mission.questions[state.step].title}`));
  if(getProfileFields(state.id).length)meta.append(button('調整情境條件',()=>{settings=true;render();},'ls-text-button'));body.append(meta);
  if(state.phase==='ending')renderEnding(body);
  else{
   const question=mission.questions[state.step];
   if(state.phase==='question'){
    body.append(el('h2',question.prompt),el('p',question.help,'ls-life-help'));const options=el('div',undefined,'ls-life-options');
    for(const [i,o]of question.options.entries()){const b=button('',()=>update(chooseMission(state,o.id)));b.dataset.option=o.id;b.append(el('span',String(i+1),'ls-option-number'));const text=el('span');text.append(el('strong',o.label),el('small',o.description));b.append(text,el('span','→'));options.append(b);}body.append(options);
    if(state.step>0)body.append(button('← 回上一段改選擇',()=>update(rewindMission(state,state.step-1)),'ls-text-button'));
   }else{
    const result=missionResult(state),reaction=result.feedback[state.step];body.append(el('h2',reaction.summary));if(!result.complete)body.append(el('p','還沒選完的部分，暫用每題第一個選項預覽。走完四段後，再看完整結果。','ls-life-help'));const lines=el('div',undefined,'ls-life-reaction');for(const text of reaction.details)lines.append(el('p',text));body.append(lines);
    // Partial results use the engine's documented default choices, disclosed alongside the numbers.
    const previews=result.assumptions.filter(x=>x.startsWith('尚未作答'));if(previews.length)body.append(list('這些數字還用了哪些暫定選項？',previews));
    const actions=el('div',undefined,'ls-life-actions');actions.append(button(state.step===3?'看看這次的結果 →':'陪他走下一段 →',()=>update(continueMission(state)),'ls-life-primary'),button('換個選擇',()=>update(rewindMission(state,state.step))));body.append(actions);
   }
  }
  body.append(el('p',saveFailed?'這次可以繼續玩，但瀏覽器無法保存進度。':storage?'本次進度另外保存；原版任務與原有設定保留。':'本次試玩進度只留在這個畫面。','ls-life-help'));
 }
 return {open};
}
