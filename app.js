import { createExperienceUI } from './experience-ui.js?v=14.0.0';
import { createServiceHub } from './service-hub.js?v=11.0.0';
import { createEnhancements } from './enhancements.js?v=14.0.0';
import { lazyFeature } from './lazy-feature.js?v=13.0.0';
import { createCityGuide } from './city-guide.js?v=13.0.0';
let enhancements, experienceUI, cityGuide;
let quality='auto', exploreMode='homes';
try { const saved=localStorage.getItem('anxin-city-quality-v13');if(['auto','high','standard','economy'].includes(saved))quality=saved; } catch {}
function featureProxy(label,load,create,methods){
 const get=lazyFeature(load,create);
 return Object.fromEntries(methods.map(method=>[method,(...args)=>{toast('正在準備'+label+'…');return get().then(feature=>{clearTimeout(toastTimer);$('#toast').classList.remove('show');return feature[method](...args);}).catch(error=>{console.error(label+'載入失敗',error);toast(label+'暫時載入不完整，請再點一次重試；其他功能仍可使用。');});}]));
}
async function exploreAction(action){
 if(action.kind==='culture')return cultureWalk.open({placeId:action.id});
 if(action.kind==='district'||action.kind==='future')return tainanExplorer.openTarget({districtId:action.id,phase:action.kind==='future'?'future':'past'});
 try {
  if(action.kind==='attraction'){
   const {tainanAtlas}=await import('./tainan-atlas.js?v=8.0.0');
   const place=Object.values(tainanAtlas).flatMap(d=>d.attractions).find(a=>a.id===action.id);
   if(place)return tainanExplorer.openTarget({tab:'attractions',attractionQuery:place.name});
  }else if(action.kind==='season'){
   const {tainanSeasons}=await import('./tainan-data.js?v=12.0.0');
   const season=tainanSeasons.find(item=>item.id===action.id);
   if(season)return tainanExplorer.openTarget({tab:'seasons',month:season.months[0],seasonId:season.id});
  }
 }catch(error){console.error(error);toast('這段散步資料暫時無法載入，請稍後再試。');}
}
const tainanExplorer=featureProxy('台南散步',()=>import('./tainan-ui.js?v=13.0.0'),m=>m.createTainanExplorer({onStartMission:id=>enhancements.showPersona(id),onFeedback:context=>enhancements.openFeedback(context),onExploreCulture:target=>cultureWalk.open(target),toast}),['open','openTarget']);
let cultureInstance;
const cultureWalk=featureProxy('文化走讀',()=>import('./culture-ui.js?v=13.0.0'),m=>cultureInstance=m.createCultureWalk({onExplore:action=>{cultureInstance.close();exploreAction(action);},onFeedback:context=>{cultureInstance.close();enhancements.openFeedback(context);},onResidents:()=>{cultureInstance.close();residentChat.open();},toast}),['open']);
const residentChat=featureProxy('街坊聊聊',()=>import('./resident-ui.js?v=13.0.0'),m=>m.createResidentChat({onExplore:exploreAction,onMission:()=>enhancements.openPeople(),onFeedback:context=>enhancements.openFeedback({scene:'general',persona:'none',contextLabel:'街坊聊聊｜'+(context.residentName||'日常對話')}),toast}),['open']);

const journeys = {
  buy: { no:'01', english:'A HOME TO BEGIN', name:'買房過戶', title:'買房前，先看懂權利與責任。', subtitle:'從產權、契約到付款與登記，陪您把重要的交易步驟想清楚。', steps:[['先整理購屋條件','釐清購屋目的、自備款與每月可負擔金額，留下生活預備金。'],['看懂物件與交易條件','確認土地、建物及使用現況，整理契約、付款與點交的待確認事項。'],['安排貸款與簽約','向銀行確認鑑價、申貸條件與時程，再協調付款與交屋安排。'],['完成過戶與交屋','依個案辦理稅費、登記、撥款與點交，逐項確認交付內容。']],checks:[['購屋預算與自備款範圍','先列出可運用資金與希望保留的預備金。'],['物件基本資料','整理地址、坪數、用途及手邊的物件資料。'],['貸款需求與財力資料','先盤點收入及既有負債；實際申貸文件依銀行要求。'],['預計簽約與交屋時間','列出希望完成時間及需要配合的安排。']],question:'除了房價，我還需要準備哪些支出？如果銀行鑑價與預期不同，付款安排要怎麼調整？'},
  sell: { no:'02', english:'ROOM FOR WHAT IS NEXT', name:'賣屋稅務', title:'先算清楚，再安排移轉。', subtitle:'整理持有資料、稅費與貸款清償，把出售後的資金和交屋安排一起看。',steps:[['盤點出售條件','整理產權、使用、出租與貸款現況，確認需要共同參與決策的人。'],['整理成本與實拿需求','準備取得及支出資料，釐清稅費、貸款清償與交易成本的個案試算需求。'],['確認簽約與付款安排','對齊買賣雙方的付款、清償、點交與搬遷時程。'],['辦理移轉與點交','依約安排稅費、登記與款項確認，完成房屋及相關資料交付。']],checks:[['土地建物與持有資料','整理現有權狀或謄本等可供確認的資料。'],['當初取得與支出紀錄','例如契約、相關費用及手邊留存的憑證。'],['貸款餘額與使用現況','整理貸款、租約及交屋前需要處理的事項。'],['希望實拿與搬遷安排','列出資金用途、預期金額與可交屋時間。']],question:'我希望出售後可以運用多少資金？貸款清償、稅費與交屋時間，應該如何一起安排？'},
  legacy: { no:'03', english:'KEEP WHAT MATTERS CLOSE', name:'傳承安排', title:'把珍惜，留給在乎的人。',subtitle:'從家人的需要開始，整理資產、照顧與未來安排，慢慢找到適合的方向。',steps:[['先談希望照顧誰','釐清家人的生活、居住、照顧與資金需求，確認安排的優先順序。'],['整理資產與家庭關係','盤點不動產、貸款、持分及家庭關係，標記需要進一步確認的事項。'],['比較合適的安排','依個案討論贈與、繼承、遺囑或信託等方向，評估控制權、費用及執行條件。'],['確認共識與執行方式','確認意願、文件與辦理順序；家庭或資產狀況改變時，重新檢視。']],checks:[['希望照顧的人與生活需求','先寫下居住、照顧、現金流等重要考量。'],['不動產與貸款清單','整理資產種類、持分與現有負擔。'],['家庭關係與共同討論對象','標記需要參與說明、確認意願的人。'],['既有安排與相關文件','若已有遺囑、贈與或信託安排，可先整理供討論。']],question:'我希望保留哪些居住、使用與決定權？家人的需要不同時，怎樣安排比較容易執行？'}
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
function selectScene(id){if(!journeys[id])return;cityGuide?.close();experienceUI?.setRegionFocus(null);scene?.setExploreMode('homes');experienceUI?.setExploreMode('homes');exploreMode='homes';enhancements?.clearPersonaState();currentId=id;currentTab='flow';document.body.classList.add('scene-selected');document.getElementById("intro").inert=true;document.getElementById("intro").setAttribute('aria-hidden','true');$('#detail-panel').hidden=false;$$('[data-scene]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scene===id)));renderPanel();scene?.select(id);}
function resetView(){cityGuide?.close();experienceUI?.setRegionFocus(null);enhancements?.clearPersonaState();currentId=null;$('#detail-panel').hidden=true;document.body.classList.remove('scene-selected');document.getElementById("intro").inert=false;document.getElementById("intro").removeAttribute('aria-hidden');$$('[data-scene]').forEach(button=>button.setAttribute('aria-pressed','false'));scene?.reset();}
function openChecklist(){const container=$('#all-checklists');container.innerHTML=Object.entries(journeys).map(([id,data])=>`<section class="checklist-group"><h3>${data.no} · ${data.name}</h3>${checklistHtml(id)}</section>`).join('');attachChecks(container);$('#checklist-dialog').showModal();}
$$('[data-scene]').forEach(button=>button.onclick=()=>selectScene(button.dataset.scene));
$('#start-explore').onclick=()=>residentChat?.open();$('#brand-home').onclick=resetView;$('#reset-view').onclick=resetView;$('#zoom-in').onclick=()=>scene?.zoom(0.2);$('#zoom-out').onclick=()=>scene?.zoom(-0.2);
$('#night-toggle').onclick=()=>{night=!night;document.body.classList.toggle('night-mode',night);$('#night-toggle').setAttribute('aria-pressed',String(night));$('#night-toggle').setAttribute('aria-label',night?'切換日景':'切換夜景');scene?.setNight(night);};
function updatePaused(){const button=$('#pause-toggle');button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'播放城市動畫':'暫停城市動畫');button.innerHTML=paused?'<svg viewBox="0 0 24 24"><path d="m9 5 10 7-10 7Z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M9 5v14M15 5v14"/></svg>';scene?.setPaused(paused);}
$('#pause-toggle').onclick=()=>{paused=!paused;updatePaused();};$('#open-checklist').onclick=openChecklist;$('#help-button').onclick=()=>$('#help-dialog').showModal();$$('[data-close-dialog]').forEach(button=>button.onclick=()=>button.closest('dialog').close());$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
$('#download-summary').onclick=()=>{const lines=['宏國・易丞｜不動產安心城','我的諮詢準備摘要','',`整理日期：${new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}`,''];Object.entries(journeys).forEach(([id,data])=>{lines.push(`${data.no} ${data.name}`,...data.checks.map(([title],i)=>`${saved[`${id}-${i}`]===true?'[已準備]':'[待整理]'} ${title}`),`可討論的問題：${data.question}`,'');});lines.push('本摘要由您在體驗版的勾選產生，僅供諮詢準備。','未提交預約或傳送任何案件資料。實際文件與辦理方式依個案確認。');const blob=new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='宏國易丞_諮詢準備摘要.txt';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已開始下載您的諮詢準備摘要');};
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]'))return;if(['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))return;const id={'1':'buy','2':'sell','3':'legacy'}[event.key];if(id)selectScene(id);if(event.key==='Escape')resetView();});

const cityStatus=document.createElement('div');cityStatus.className='city-runtime-status';cityStatus.hidden=true;cityStatus.setAttribute('role','status');
cityStatus.innerHTML='<span>立體城市暫時無法顯示，人生任務、散步與回饋仍可使用。</span><button type="button">重試</button>';
$('#experience').append(cityStatus);
function releaseLoading(){const load=$('#loading');load.classList.add('loaded');setTimeout(()=>load.hidden=true,650);}
function failCity(){releaseLoading();cityStatus.hidden=false;document.body.classList.add('city-text-mode');experienceUI?.setCityAvailable(false);}
function cityReady(){releaseLoading();cityStatus.hidden=true;document.body.classList.remove('city-text-mode');experienceUI?.setCityAvailable(true);}
function setMode(mode){exploreMode=mode==='tainan'?'tainan':'homes';scene?.setExploreMode(exploreMode);experienceUI?.setExploreMode(exploreMode);if(exploreMode==='homes'){cityGuide?.close();experienceUI?.setRegionFocus(null);scene?.restoreView();}}
function focusRegion(region){if(currentId)resetView();else cityGuide?.close();setMode('tainan');const key=region==='plain'?'plains':region;scene?.focusRegion(key);experienceUI?.setRegionFocus(key);cityGuide.open(key);}
function returnOverview(){cityGuide?.close();experienceUI?.setRegionFocus(null);scene?.restoreView();}
enhancements=createEnhancements({onExploreTainan:()=>tainanExplorer.open(),getScene:()=>scene,selectScene,getCurrentScene:()=>currentId,openJourneyChecklist:id=>{selectScene(id);currentTab='ready';renderPanel();},toast});
for(const [id,label,open] of [['resident-button','街坊聊聊',()=>residentChat.open()],['tainan-button','台南散步',()=>tainanExplorer.open()]]){
 const button=document.createElement('button');button.id=id;button.type='button';button.textContent=label;button.setAttribute('aria-haspopup','dialog');button.onclick=open;$('.header-nav').insertBefore(button,$('#open-checklist'));
}
const serviceHub=createServiceHub({toast,onMission:id=>enhancements.showPersona(id),onTainan:()=>tainanExplorer.open(),onGuide:id=>enhancements.openGuide(id)});
cityGuide=createCityGuide({onExplore:region=>tainanExplorer.open(region),onResidents:()=>residentChat.open(),onOverview:returnOverview});
experienceUI=createExperienceUI({enhancements,tainanExplorer,residentChat,cultureWalk,serviceHub,quality,exploreMode,
 onQualityChange:mode=>{quality=mode;try{localStorage.setItem('anxin-city-quality-v13',quality);}catch{}scene?.setQuality(quality);},
 onExploreMode:setMode,onRegionFocus:focusRegion,onReturnOverview:returnOverview});
experienceUI.setCityAvailable(false);
$('#reset-view').onclick=()=>{resetView();returnOverview();};
let cityStarting=false;
async function startCity(){
 if(cityStarting)return;cityStarting=true;cityStatus.querySelector('button').disabled=true;
 try {
  const {createCity}=await import('./city.js?v=13.0.0');
  scene?.dispose();
  scene=createCity({canvas:$('#city'),quality,onResident:id=>residentChat.open(id),onDistrict:focusRegion,onPersona:id=>enhancements.showPersona(id),onSelect:selectScene,onReady:cityReady,onRecovered:cityReady,onError:failCity,onQualityChange:state=>experienceUI.setQuality(state.mode)});
  scene.setExploreMode(exploreMode);scene.setNight(night);updatePaused();
 }catch(error){console.error('City initialization failed',error);failCity();}
 finally{cityStarting=false;cityStatus.querySelector('button').disabled=false;}
}
cityStatus.querySelector('button').onclick=startCity;
// The functional navigation stays available while the optional WebGL scene loads.
releaseLoading();startCity();
updateCount();




const entryParams=new URLSearchParams(location.search),entry=entryParams.get('start');
if(['first-home','move-home','seller','legacy-family','tainan','policy','services','residents','culture','seasons','events'].includes(entry))requestAnimationFrame(()=>{if(entry==='culture')cultureWalk.open({placeId:entryParams.get('place')});else if(entry==='residents')residentChat.open(entryParams.get('resident'));else if(entry==='tainan')tainanExplorer.open();else if(entry==='seasons'||entry==='events')tainanExplorer.openTarget({tab:'seasons',month:Number(entryParams.get('month')||0),seasonMode:entry});else if(entry==='policy')enhancements.openGuide('first-home');else if(entry==='services')serviceHub.open();else enhancements.showPersona(entry);});
