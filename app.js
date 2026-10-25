import {createServiceHub} from './service-hub.js?v=8.0.0';
import { createCity } from './city.js?v=9.0.0';
import { createEnhancements } from './enhancements.js?v=9.0.0';
import { createTainanExplorer } from './tainan-ui.js?v=8.0.0';
import { createResidentChat } from './resident-ui.js?v=8.0.0';
import { tainanAtlas } from './tainan-atlas.js?v=8.0.0';
import { tainanSeasons } from './tainan-data.js?v=8.0.0';
let enhancements,tainanExplorer,residentChat;

const journeys = {
  buy: { no:'01', english:'A HOME TO BEGIN', name:'安心買房', title:'把理想，安放成家。', subtitle:'從看見喜歡的房子，到拿到鑰匙。把每個重要步驟，先想清楚。', steps:[['先整理購屋條件','釐清購屋目的、自備款與每月可負擔金額，留下生活預備金。'],['看懂物件與交易條件','確認土地、建物及使用現況，整理契約、付款與點交的待確認事項。'],['安排貸款與簽約','向銀行確認鑑價、申貸條件與時程，再協調付款與交屋安排。'],['完成過戶與交屋','依個案辦理稅費、登記、撥款與點交，逐項確認交付內容。']],checks:[['購屋預算與自備款範圍','先列出可運用資金與希望保留的預備金。'],['物件基本資料','整理地址、坪數、用途及手邊的物件資料。'],['貸款需求與財力資料','先盤點收入及既有負債；實際申貸文件依銀行要求。'],['預計簽約與交屋時間','列出希望完成時間及需要配合的安排。']],question:'除了房價，我還需要準備哪些支出？如果銀行鑑價與預期不同，付款安排要怎麼調整？'},
  sell: { no:'02', english:'ROOM FOR WHAT IS NEXT', name:'從容賣房', title:'為下一站，從容準備。', subtitle:'先把出售條件與資金安排攤開來看，讓每一個決定，都更有底。',steps:[['盤點出售條件','整理產權、使用、出租與貸款現況，確認需要共同參與決策的人。'],['整理成本與實拿需求','準備取得及支出資料，釐清稅費、貸款清償與交易成本的個案試算需求。'],['確認簽約與付款安排','對齊買賣雙方的付款、清償、點交與搬遷時程。'],['辦理移轉與點交','依約安排稅費、登記與款項確認，完成房屋及相關資料交付。']],checks:[['土地建物與持有資料','整理現有權狀或謄本等可供確認的資料。'],['當初取得與支出紀錄','例如契約、相關費用及手邊留存的憑證。'],['貸款餘額與使用現況','整理貸款、租約及交屋前需要處理的事項。'],['希望實拿與搬遷安排','列出資金用途、預期金額與可交屋時間。']],question:'我希望出售後可以運用多少資金？貸款清償、稅費與交屋時間，應該如何一起安排？'},
  legacy: { no:'03', english:'KEEP WHAT MATTERS CLOSE', name:'好好傳承', title:'把珍惜，留給在乎的人。',subtitle:'從家人的需要開始，整理資產、照顧與未來安排，慢慢找到適合的方向。',steps:[['先談希望照顧誰','釐清家人的生活、居住、照顧與資金需求，確認安排的優先順序。'],['整理資產與家庭關係','盤點不動產、貸款、持分及家庭關係，標記需要進一步確認的事項。'],['比較合適的安排','依個案討論贈與、繼承、遺囑或信託等方向，評估控制權、費用及執行條件。'],['確認共識與執行方式','確認意願、文件與辦理順序；家庭或資產狀況改變時，重新檢視。']],checks:[['希望照顧的人與生活需求','先寫下居住、照顧、現金流等重要考量。'],['不動產與貸款清單','整理資產種類、持分與現有負擔。'],['家庭關係與共同討論對象','標記需要參與說明、確認意願的人。'],['既有安排與相關文件','若已有遺囑、贈與或信託安排，可先整理供討論。']],question:'我希望保留哪些居住、使用與決定權？家人的需要不同時，怎樣安排比較容易執行？'}
};
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const storeKey='anxin-city-checklist-v1';
let saved={};
try { const value=JSON.parse(localStorage.getItem(storeKey)||'{}'); if(value&&typeof value==='object'&&!Array.isArray(value)) saved=value; } catch {}
let scene, currentId=null, currentTab='flow', night=false, paused=matchMedia('(prefers-reduced-motion: reduce)').matches, toastTimer;
const iconClose='<span aria-hidden="true">×</span>';
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function save(){try{localStorage.setItem(storeKey,JSON.stringify(saved));}catch{toast('瀏覽器無法儲存勾選，您仍可下載準備摘要。');}updateCount();}
function updateCount(){const count=Object.keys(journeys).reduce((sum,id)=>sum+journeys[id].checks.filter((_,i)=>saved[`${id}-${i}`]===true).length,0);$('#check-count').textContent=count;}
function checklistHtml(id){return `<div class="checklist-items">${journeys[id].checks.map(([title,desc],i)=>`<label class="check-item"><input type="checkbox" data-check="${id}-${i}" ${saved[`${id}-${i}`]===true?'checked':''}><span>${title}<small>${desc}</small></span></label>`).join('')}</div>`;}
function attachChecks(root){root.querySelectorAll('[data-check]').forEach(input=>input.addEventListener('change',()=>{saved[input.dataset.check]=input.checked;save();document.querySelectorAll(`[data-check="${input.dataset.check}"]`).forEach(other=>{other.checked=input.checked;});}));}
function renderPanel(){const data=journeys[currentId];const panel=$('#detail-panel');panel.innerHTML=`<div class="panel-top"><span class="eyebrow">JOURNEY ${data.no} · ${data.english}</span><button class="icon-button panel-close" aria-label="關閉場景導覽">${iconClose}</button></div><h2>${data.title}</h2><p class="panel-subtitle">${data.subtitle}</p><div class="panel-tabs" role="tablist" aria-label="${data.name}導覽"><button id="tab-flow" class="panel-tab" role="tab" aria-controls="scene-tab-content" aria-selected="${currentTab==='flow'}" data-tab="flow">服務旅程</button><button id="tab-ready" class="panel-tab" role="tab" aria-controls="scene-tab-content" aria-selected="${currentTab==='ready'}" data-tab="ready">準備清單</button></div><div id="scene-tab-content" role="tabpanel" aria-labelledby="tab-${currentTab}">${currentTab==='flow'?`<ol class="flow-list">${data.steps.map(([title,description],i)=>`<li class="flow-step"><span class="flow-number">${i+1}</span><h3>${title}</h3><p>${description}</p></li>`).join('')}</ol>`:checklistHtml(currentId)+`<div class="question-block"><h3>帶著這個問題，開始討論</h3><p>${data.question}</p></div>`}</div><p class="panel-note">一般服務流程示意；實際文件、順序與辦理條件依個案確認。</p><button class="panel-action">${currentTab==='flow'?'看看我可以先準備什麼':'查看我的完整準備清單'}<span>↗</span></button>`;panel.querySelector('.panel-close').onclick=resetView;panel.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{currentTab=b.dataset.tab;renderPanel();panel.querySelector(`[data-tab="${currentTab}"]`).focus({preventScroll:true});});panel.querySelector('.panel-action').onclick=()=>{if(currentTab==='flow'){currentTab='ready';renderPanel();panel.scrollTop=0;}else openChecklist();};attachChecks(panel);panel.scrollTop=0;enhancements?.decorateJourney(currentId);}
function selectScene(id){if(!journeys[id])return;enhancements?.clearPersonaState();currentId=id;currentTab='flow';document.body.classList.add('scene-selected');document.getElementById("intro").inert=true;document.getElementById("intro").setAttribute('aria-hidden','true');$('#detail-panel').hidden=false;$$('[data-scene]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scene===id)));renderPanel();scene?.select(id);}
function resetView(){enhancements?.clearPersonaState();currentId=null;$('#detail-panel').hidden=true;document.body.classList.remove('scene-selected');document.getElementById("intro").inert=false;document.getElementById("intro").removeAttribute('aria-hidden');$$('[data-scene]').forEach(button=>button.setAttribute('aria-pressed','false'));scene?.reset();}
function openChecklist(){const container=$('#all-checklists');container.innerHTML=Object.entries(journeys).map(([id,data])=>`<section class="checklist-group"><h3>${data.no} · ${data.name}</h3>${checklistHtml(id)}</section>`).join('');attachChecks(container);$('#checklist-dialog').showModal();}
$$('[data-scene]').forEach(button=>button.onclick=()=>selectScene(button.dataset.scene));
$('#start-explore').onclick=()=>residentChat?.open();$('#intro-help').onclick=()=>$('#help-dialog').showModal();$('#brand-home').onclick=resetView;$('#reset-view').onclick=resetView;$('#zoom-in').onclick=()=>scene?.zoom(0.2);$('#zoom-out').onclick=()=>scene?.zoom(-0.2);
$('#night-toggle').onclick=()=>{night=!night;document.body.classList.toggle('night-mode',night);$('#night-toggle').setAttribute('aria-pressed',String(night));$('#night-toggle').setAttribute('aria-label',night?'切換日景':'切換夜景');scene?.setNight(night);};
function updatePaused(){const button=$('#pause-toggle');button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'播放城市動畫':'暫停城市動畫');button.innerHTML=paused?'<svg viewBox="0 0 24 24"><path d="m9 5 10 7-10 7Z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>';scene?.setPaused(paused);}
$('#pause-toggle').onclick=()=>{paused=!paused;updatePaused();};$('#open-checklist').onclick=openChecklist;$('#help-button').onclick=()=>$('#help-dialog').showModal();$$('[data-close-dialog]').forEach(button=>button.onclick=()=>button.closest('dialog').close());$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
$('#download-summary').onclick=()=>{const lines=['宏國・易丞｜不動產安心城','我的諮詢準備摘要','',`整理日期：${new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}`,''];Object.entries(journeys).forEach(([id,data])=>{lines.push(`${data.no} ${data.name}`,...data.checks.map(([title],i)=>`${saved[`${id}-${i}`]===true?'[已準備]':'[待整理]'} ${title}`),`可討論的問題：${data.question}`,'');});lines.push('本摘要由您在體驗版的勾選產生，僅供諮詢準備。','未提交預約或傳送任何案件資料。實際文件與辦理方式依個案確認。');const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='宏國易丞_諮詢準備摘要.txt';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已開始下載您的諮詢準備摘要');};
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]'))return;if(['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))return;const id={'1':'buy','2':'sell','3':'legacy'}[event.key];if(id)selectScene(id);if(event.key==='Escape')resetView();});
function failCity(){const load=$('#loading');load.hidden=false;load.classList.remove('loaded');load.innerHTML='<strong>這個瀏覽器暫時無法開啟立體城市</strong><small>您仍可使用街坊聊聊、台南散步與人生任務。</small><button class="primary-button" id="continue-text" style="margin-top:24px">繼續服務導覽 ↗</button>';$('#continue-text').onclick=()=>{load.classList.add('loaded');setTimeout(()=>load.hidden=true,650);};}
enhancements=createEnhancements({onExploreTainan:()=>tainanExplorer?.open(),getScene:()=>scene,selectScene,getCurrentScene:()=>currentId,openJourneyChecklist:(id)=>{selectScene(id);currentTab='ready';renderPanel();},toast});
tainanExplorer=createTainanExplorer({onStartMission:(id)=>enhancements.showPersona(id),onFeedback:context=>enhancements.openFeedback(context),toast});
residentChat=createResidentChat({
 onExplore:action=>{
  if(action.kind==='district'||action.kind==='future')tainanExplorer.openTarget({districtId:action.id,phase:action.kind==='future'?'future':'past'});
  else if(action.kind==='attraction'){
   const attraction=Object.values(tainanAtlas).flatMap(d=>d.attractions).find(a=>a.id===action.id);
   if(attraction)tainanExplorer.openTarget({tab:'attractions',attractionQuery:attraction.name});
  }else if(action.kind==='season'){
   const season=tainanSeasons.find(s=>s.id===action.id);
   if(season)tainanExplorer.openTarget({tab:'seasons',month:season.months[0],seasonId:season.id});
  }
 },
 onMission:()=>enhancements.openPeople(),
 onFeedback:context=>enhancements.openFeedback({scene:'general',persona:'none',contextLabel:`街坊聊聊｜${context.residentName||'日常對話'}`}),toast
});
$('#start-tainan').onclick=()=>tainanExplorer.open();
const serviceHub=createServiceHub({toast,onMission:id=>enhancements.showPersona(id),onTainan:()=>tainanExplorer.open(),onGuide:id=>enhancements.openGuide(id)});
try{scene=createCity({onResident:id=>residentChat.open(id),onDistrict:region=>tainanExplorer.open(region),onPersona:(id)=>enhancements.showPersona(id),canvas:$('#city'),onSelect:selectScene,onReady:()=>{const load=$('#loading');load.classList.add('loaded');setTimeout(()=>load.hidden=true,650);},onError:failCity});updatePaused();}catch(error){console.error('City initialization failed',error);failCity();}
updateCount();




const entry=new URLSearchParams(location.search).get('start');
if(['first-home','move-home','seller','legacy-family','tainan','policy','services','residents'].includes(entry))requestAnimationFrame(()=>{if(entry==='residents')residentChat.open(new URLSearchParams(location.search).get('resident'));else if(entry==='tainan')tainanExplorer.open();else if(entry==='policy')enhancements.openGuide('first-home');else if(entry==='services')serviceHub.open();else enhancements.showPersona(entry);});
