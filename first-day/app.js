import { STEPS, createState, loadState, saveState, updateChoice, revealClue, canContinue, goToStep, getResult, getBaselineResult, buildSummary, snapshotRoute } from './model.js?v=14.0.0';
import { priorities, homes, timings, shocks, clues, verification, places, lesson } from './content.js?v=14.0.0';
import { streetScene, houseArt, placeArt } from './art.js?v=14.0.0';
import { companionTools } from '../tool-routes.js?v=6.0.0';
import { createFeedbackDialog } from '../feedback-client.js?v=11.0.0';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = value => Math.round(value).toLocaleString('zh-TW');
const pick = (list, id) => list.find(item => item.id === id);
const titles = {priority:'留給生活的位置',home:'今天，先看哪一間？',check:'楊代書陪你找線索',explore:'散個步，認識這座城',future:'把日子，往後翻一頁',result:'今天的發現，帶回家。'};
const shortTitles = {priority:'生活',home:'看房',check:'查證',explore:'台南',future:'未來',result:'成果'};
const times = {priority:'13:00',home:'13:30',check:'14:00',explore:'15:00',future:'16:00',result:'17:00'};
const sceneLines = {
  priority:['小安說','「想搬到台南，先想像一下，我想過什麼樣的日子？」'],
  home:['小安的看房筆記','「先把喜歡的價格，放進一個月的生活裡。」'],
  check:['楊代書的資料袋','「先別急著下結論，我們把要確認的事一件件找出來。」'],
  explore:['午後，換個步調','「原來，台南的每個地方都有自己的時間。」'],
  future:['練習，替未來多想一步','「如果有一件事改變，我還有調整的空間嗎？」'],
  result:['今天多懂了一點','「帶著新的問題，下一步就更清楚了。」'],
};
let storage;
try { storage = window.localStorage; } catch { storage = null; }
let state = loadState(storage), introVisible = true, expandedClue = null, statusTimer;
let summaryDraft = null, summaryDirty = false, memoryOnly = false;
const feedback = createFeedbackDialog({
  endpoint:'https://hongguo-anxin-feedback-20261024.yang-ceo.chatgpt.site/api/feedback',siteVersion:'14.0.0',
  getCurrentScene:()=> 'buy',getCurrentPersona:()=> 'first-home',toast:notify,
});
$('#open-feedback').onclick = () => feedback.open({scene:'buy',persona:'first-home',contextLabel:`小安的一天｜${shortTitles[state.step] || '開場'}`});
try { if(storage?.getItem('anxin-first-day-large') === 'true') document.documentElement.classList.add('font-large'); } catch {}
$('#text-size').setAttribute('aria-pressed',String(document.documentElement.classList.contains('font-large')));
$('#text-size').onclick = () => {
  const large = document.documentElement.classList.toggle('font-large');
  $('#text-size').setAttribute('aria-pressed',String(large));
  try { storage?.setItem('anxin-first-day-large',String(large)); } catch {}
};

function notify(message) {
  clearTimeout(statusTimer); $('#page-status').textContent = message;
  statusTimer = setTimeout(() => { $('#page-status').textContent = ''; },6000);
}
function persist() {
  memoryOnly = !saveState(storage,state);
  if(memoryOnly) notify('此瀏覽器暫時不能保存進度，這次仍可繼續玩；關閉後可能需要重新開始。');
}
function source(item) {
  return `<a class="source-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)} ↗</a><span class="counter-label"> · 查核 ${esc(item.checkedAt)}</span>`;
}
function stepper() {
  return `<nav class="stepper screen-only" aria-label="故事進度">${STEPS.slice(1).map((step,i) => {
    const allowed = goToStep(state,step).step === step;
    return `<button type="button" class="step-dot ${state.step===step?'active':allowed?'done':''}" data-go="${step}" ${allowed?'':'disabled'} ${state.step===step?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span><small>${shortTitles[step]}</small></button>`;
  }).join('')}</nav>`;
}
function moneyStrip(result) {
  const m = result.metrics;
  return `<div class="money-strip" aria-label="這組假設的試算結果"><div class="money-item"><span class="money-label">進場現金缺口</span><strong class="money-value">${fmt(m.downPaymentGap)}<small> 元</small></strong></div><div class="money-item"><span class="money-label">房貸月付</span><strong class="money-value">${fmt(m.monthlyMortgage)}<small> 元</small></strong></div><div class="money-item"><span class="money-label">保留生活目標後月餘額</span><strong class="money-value">${fmt(m.comfortRemainingMonthly)}<small> 元</small></strong></div></div>`;
}
function assumptions(result = getResult(state)) {
  return `<details class="assumptions"><summary>這次試算用了哪些假設？</summary><ul>${result.assumptions.map(text=>`<li>${esc(text)}</li>`).join('')}</ul><p>三種房屋均為虛構總價卡，插畫與台南地點沒有行情或待售物件對應。</p></details>`;
}
function choices(list,key,{art=false}={}) {
  return `<div class="choices choice-grid first-day-choices" role="group" aria-label="${key==='price'?'選擇練習總價':key==='priority'?'選擇生活重點':key==='timing'?'選擇準備時間':'選擇壓力情境'}">${list.map((item,i)=>`<button type="button" class="choice ${state[key]===item.id?'selected':''}" data-choice="${key}" data-value="${item.id}" aria-pressed="${state[key]===item.id}">${art?`<span class="house-art">${houseArt(item.id)}</span>`:''}<span class="card-kicker">${esc(item.kicker || `方案 ${i+1}`)}</span><strong class="choice-title">${esc(item.title)}</strong><span class="choice-desc">${esc(item.description)}</span>${art?`<span class="counter-label">基準房貸月付 ${fmt(getResult({...state,price:item.id,timing:'now',shock:'baseline'}).metrics.monthlyMortgage)} 元</span>`:''}</button>`).join('')}</div>`;
}
function quiz(question,key) {
  const selected = pick(question.options,state[key]);
  const passed = state[key] === question.correctId;
  return `<section class="quiz section-gap" aria-label="${esc(question.question)}"><p class="eyebrow">換你想一想</p><h2>${esc(question.question)}</h2><div class="answer-options">${question.options.map(item=>`<button type="button" class="answer ${state[key]===item.id?'selected':''}" data-choice="${key}" data-value="${item.id}" aria-pressed="${state[key]===item.id}" ${passed?'disabled':''}>${esc(item.label)}${passed&&item.id===question.correctId?' ✓':''}</button>`).join('')}</div>${selected?`<p class="quiz-feedback ${passed?'success':'error'}" role="status">${esc(selected.feedback)}${passed?'':' 可以再選一次。'}</p>`:''}</section>`;
}
function navigation() {
  const index = STEPS.indexOf(state.step), ready = canContinue(state);
  const instruction = {priority:'選一個最在乎的生活重點。',home:'選一張房屋卡，看看不同總價。',check:state.clues.length<3?'先翻開三張線索卡，再回答楊代書的問題。':'答完查證小問題，就能出發散步。',explore:'挑一處地方，讀故事、答一題。',future:'試試不同條件，再完成最後一個問題。'};
  return `<div class="story-actions screen-only"><button class="text-link" type="button" data-go="${STEPS[Math.max(0,index-1)]}">← 上一頁</button><button type="button" class="primary" data-next ${ready?'':'disabled'}>${state.step==='future'?'收下今天的成果卡':'接著走'} <span aria-hidden="true">→</span></button></div><p class="progress-note">${ready?'已準備好，可以前往下一站。':instruction[state.step]} ${memoryOnly?'目前僅暫存於這個分頁。':'進度保留在這個瀏覽器，可隨時暫停。'}</p>`;
}
function opening() {
  const resumed = state.step !== 'welcome';
  return `<section class="opening"><div class="opening-copy"><p class="eyebrow">宏國・易丞 · 人生練習簿 01</p><span class="pill">一段故事，幾個家的選擇</span><h1 class="title" id="chapter-title" tabindex="-1">小安在台南<br>的第一天<span class="sun-dot">。</span></h1><p class="lead">一間想住的房子。<br>一袋還沒看懂的資料。<br>還有一座，值得慢慢認識的城市。</p><p>陪小安過一個有發現的下午。<br>買房先練習，台南一起走。</p><div class="story-actions"><button class="primary" type="button" data-start>${resumed?(state.step==='result'?'打開我的成果卡':'接著上次的故事'):'翻開今天的故事'} <span aria-hidden="true">→</span></button></div>${resumed?`<p class="resume-note">上次走到：${esc(shortTitles[state.step])}。${state.previous?'已保留一份先前的選擇，可在結局比較。':''}</p>`:''}<p class="progress-note">約 3–5 分鐘 · 免登入 · 可暫停<br>人物與數字為教學假設，不用填真實財務資料。</p><a class="text-link" href="../">也可以先逛逛立體安心城 ↗</a></div><div class="scene-frame">${streetScene({step:'welcome',home:state.price,place:state.place})}<p class="route-info">看房・找線索・散步・帶走今天的發現</p></div></section><div class="opening-footer"><span>不是每個選擇都一樣。</span><span>看看你的版本，會多發現什麼。</span></div>`;
}
function priorityChapter() {
  return `<p class="lead">「終於來到台南了。」小安打開筆記本。<br>先留下你希望新家容得下的生活。</p>${choices(priorities,'priority')}${state.priority?`<div class="paper-note"><b>你替小安留下了：${esc(pick(priorities,state.priority).kicker)}</b><p>基本生活費之外，另保留每月 ${fmt(getResult(state).metrics.priorityBudget)} 元。接下來挑房時，也一起把它放進預算。</p></div>`:''}<p class="field-note">三種生活重點都可以。每月基本生活費固定 35,000 元，這裡選的是額外的生活目標。</p>`;
}
function homeChapter() {
  return `<p class="lead">看房前，先拿三張總價卡練習。<br>房子越喜歡，也要看看生活還剩多少空間。</p>${choices(homes,'price',{art:true})}${state.price?`<section class="section-gap"><p class="eyebrow">你選了 ${esc(pick(homes,state.price).title)}</p>${moneyStrip(getResult(state))}<p class="note">預覽沿用你目前的準備期與壓力選擇；卡片月付固定顯示基準利率。後面還能試試不同的未來。</p></section>`:''}${assumptions()}`;
}
function checkChapter() {
  return `<p class="lead">楊代書拿出三張線索卡：<br>「喜歡一間房子之後，先把這些事看清楚。」</p><p class="check-progress" aria-live="polite">已翻開 ${state.clues.length} / ${clues.length} 張線索</p><div class="clue-list">${clues.map((item,i)=>`<section class="clue-card ${state.clues.includes(item.id)?'opened':''}"><button type="button" data-clue="${item.id}" aria-expanded="${expandedClue===item.id}" aria-controls="clue-${item.id}"><span class="book-number">0${i+1}</span><span><small class="card-kicker">${esc(item.label)}</small><strong class="choice-title">${esc(item.title)}</strong></span><span aria-hidden="true">${state.clues.includes(item.id)?'✓':'＋'}</span></button><div id="clue-${item.id}" class="evidence" ${expandedClue===item.id?'':'hidden'}><h3>${esc(item.question)}</h3><p>${esc(item.finding)}</p>${source(item.source)}</div></section>`).join('')}</div>${state.clues.length===3?quiz(verification,'verification'):'<p class="paper-note">點一下資料袋，逐張找出小安還要確認的事。</p>'}<p class="note">這是文件查證的入門練習；沒有替任何真實房屋完成調查。</p>`;
}
function exploreChapter() {
  const place = pick(places,state.place);
  return `<p class="lead">小安合上筆記，想和你換個步調。<br>今天，挑一個地方讀讀它的故事。</p><p class="note">這是線上選讀。三處位於不同區域，並非一條步行路線。</p><div class="choices choice-grid place-preview" role="group" aria-label="選一處台南故事">${places.map(item=>`<button type="button" class="choice ${state.place===item.id?'selected':''}" data-choice="place" data-value="${item.id}" aria-pressed="${state.place===item.id}"><span class="house-art">${placeArt(item.id)}</span><span class="card-kicker">${esc(item.district)}</span><strong class="choice-title">${esc(item.title)}</strong><span class="choice-desc">${esc(item.subtitle)}</span></button>`).join('')}</div>${place?`<section class="place-story"><h2>${esc(place.title)}</h2><p>${esc(place.story)}</p><div class="paper-note"><b>留給下次出門的一個小觀察</b><p>${esc(place.observation)}</p></div><p>${source(place.source)}</p>${quiz(place.quiz,'cultureAnswer')}${state.cultureAnswer===place.quiz.correctId?`<p class="stamp">✓ 留下一枚 ${esc(place.district)} 的閱讀印記</p>`:''}<a class="text-link" href="${esc(place.cityUrl)}" target="_blank" rel="noopener noreferrer">在安心城讀完整地方故事 ↗</a><p class="note">印記表示完成網站選讀，不代表到訪。現場開放與活動請看官方公告。</p></section>`:''}`;
}
function futureChapter() {
  const result=getResult(state),base=getBaselineResult(state),m=result.metrics;
  const components=[['房貸',m.monthlyMortgage,'#d28b69'],['生活',m.livingCost,'#88a78b'],['其他債務',m.otherDebt,'#b5a797'],['生活目標',m.priorityBudget,'#e4be5d'],['剩餘',Math.max(0,m.comfortRemainingMonthly),'#285f52']];
  const denominator=components.reduce((sum,item)=>sum+item[1],0)||1;
  return `<p class="lead">今天選的是一間房子，<br>往後要過的，是每一天。</p><h2>先留多少時間準備？</h2>${choices(timings,'timing')}<h2 class="section-gap">再翻開一張「如果」卡。</h2>${choices(shocks,'shock')}<section class="section-gap" aria-label="改變條件後的生活預算"><p class="eyebrow">條件改變，看看差在哪裡</p>${moneyStrip(result)}<div class="budget-track" aria-hidden="true">${components.map(([,value,color])=>`<span style="width:${(value/denominator*100).toFixed(4)}%;background:${color}"></span>`).join('')}</div><div class="budget-key">${components.map(([label,value,color])=>`<span style="--key:${color}">${label} ${fmt(value)}</span>`).join('')}</div><p class="year-note">圖條呈現每月支出配置${m.comfortRemainingMonthly<0?'；目前支出超過收入，缺口仍需補足':''}。${esc(result.ending.summary)}</p><div class="comparison table-wrap"><table><caption>同一間房、同一準備期：基準與這次壓力比較</caption><thead><tr><th scope="col">每月項目</th><th scope="col">基準</th><th scope="col">這次</th></tr></thead><tbody><tr><th scope="row">收入</th><td>${fmt(base.metrics.income)}</td><td>${fmt(m.income)}</td></tr><tr><th scope="row">房貸</th><td>${fmt(base.metrics.monthlyMortgage)}</td><td>${fmt(m.monthlyMortgage)}</td></tr><tr><th scope="row">保留生活目標後</th><td>${fmt(base.metrics.comfortRemainingMonthly)}</td><td>${fmt(m.comfortRemainingMonthly)}</td></tr></tbody></table></div><p class="note">單位：元。等待期間每月儲蓄與購屋後生活預算是兩個時期，不重複相加。每次只套用一種壓力；沒有預測未來。</p></section>${assumptions(result)}${quiz(lesson,'lesson')}`;
}
function previousComparison(result) {
  if(!state.previous) return '';
  const prev=getResult(state.previous);
  return `<section class="comparison"><h2>換一個選擇，多看見一點。</h2><p class="note">上一份完成的路線，和這次的假設一起比較。</p><div class="table-wrap"><table><thead><tr><th scope="col">項目</th><th scope="col">上次</th><th scope="col">這次</th></tr></thead><tbody>${[['總價','purchasePrice'],['進場現金缺口','downPaymentGap'],['房貸月付','monthlyMortgage'],['保留生活目標後月餘額','comfortRemainingMonthly']].map(([label,key])=>`<tr><th scope="row">${label}</th><td>${fmt(prev.metrics[key])}</td><td>${fmt(result.metrics[key])}</td></tr>`).join('')}</tbody></table></div><p class="note">單位：元；比較選擇，不評定人生好壞或貸款資格。</p></section>`;
}
function resultPage() {
  const result=getResult(state),place=pick(places,state.place);
  const text=summaryDirty?summaryDraft:buildSummary(state);
  return `${stepper()}<div class="result-page"><section class="result-card" data-print-card><div class="result-hero"><p class="eyebrow">宏國・易丞 · 人生練習簿 01</p><span class="stamp">✓ 今天的探索已完成</span><h1 id="chapter-title" tabindex="-1">${titles.result}</h1><p class="lead">${esc(pick(priorities,state.priority).title)}，<br>是你替小安留下的生活方向。</p></div>${moneyStrip(result)}<p><b>${esc(result.ending.title)}</b><br>${esc(result.ending.summary)}</p><div class="two-col"><div><h2>帶走一個地方的故事</h2><p>${esc(place.title)} · ${esc(place.district)}</p><p>${esc(place.subtitle)}</p><span class="chip">文化選讀印記 · 非到訪紀錄</span></div><div><h2>也帶走三個準備方向</h2><ol><li>整理產權、權利範圍與抵押權問題。</li><li>把屋況、使用範圍和文件一起核對。</li><li>確認銀行條件，再看自己的現金與生活預算。</li></ol></div></div><p class="note">你的路線：${esc(pick(homes,state.price).title)} · ${esc(pick(timings,state.timing).title)} · ${esc(pick(shocks,state.shock).title)}。</p><p class="note">虛構情境：貸款75%、30年；其他取得費用30萬元、保留預備金60萬元。完整假設可在下方展開；本卡不代表核貸、個案稅額或法律判斷。</p><p class="print-only">宏國地政｜易丞地政　06-258-2589　LINE：@604gpqef<br>https://homegoestate.github.io/anxin-city/first-day/</p></section><div class="result-actions"><button class="primary" type="button" id="download-card">保存成果卡圖片 ↓</button><button class="secondary" type="button" id="copy-card">複製學習摘要</button><button class="text-link" type="button" id="print-card">列印成果卡</button></div>${previousComparison(result)}${assumptions(result)}<div class="quick-actions"><button class="secondary" type="button" data-replay="home">換一間房，再走一次 ↺</button><button class="text-link" type="button" data-replay="explore">換個地方，認識另一段台南 →</button></div><section class="office-mini"><p class="eyebrow">故事裡的問題，現實中也能一起整理</p><h2>楊代書陪你把下一步問清楚。</h2><p>宏國地政｜易丞地政協助產權、登記、稅務與交易安全相關事務。從要準備哪些資料開始，把你的問題一步步說清楚。</p><a class="text-link" href="https://homegoestate.github.io/about.html#practice-disclosure" target="_blank" rel="noopener noreferrer">認識我們與執業說明 ↗</a></section><section class="summary-box"><h2>把這次發現，帶回官方 LINE。</h2><label for="line-summary">先確認或修改要帶上的文字</label><textarea id="line-summary" maxlength="1600" rows="7">${esc(text)}</textarea><p class="draft-note">此處文字不會自動儲存或傳送；重新整理會回到遊戲摘要。請勿填入身分證字號、完整地址或帳戶資料。</p><a class="primary" id="send-line" href="${lineUrl(text)}" target="_blank" rel="noopener noreferrer">前往官方 LINE，帶上問題 <span aria-hidden="true">↗</span></a><div class="quick-actions"><button class="text-link" type="button" id="copy-line">複製這份文字</button><a class="text-link" href="https://line.me/R/ti/p/%40604gpqef" target="_blank" rel="noopener noreferrer">官方帳號／QR Code ↗</a></div><p class="note">手機開啟後由你確認並按送出；電腦可複製文字，再掃官方 QR Code。尚未送出訊息或成立委託。</p></section><section class="result-tools"><h2>接著，把自己的條件整理進工具。</h2><a class="tool-link" href="${companionTools.loan.url}" target="_blank" rel="noopener noreferrer"><span><small>首購・換屋</small><strong>房貸規劃</strong>月收入、負債與購屋預算，放在一起看。</span><span aria-hidden="true">↗</span></a><details><summary>也想了解賣屋或傳承？</summary>${['property','inheritance'].map(key=>`<a class="tool-link" href="${companionTools[key].url}" target="_blank" rel="noopener noreferrer"><span><strong>${esc(companionTools[key].name)}</strong>${esc(companionTools[key].prepare.join('／'))}</span><span aria-hidden="true">↗</span></a>`).join('')}</details><p class="note">會另開原有工具，保留原本驗證與試算流程。遊戲數字不會自動帶入，請在工具中確認自己的資料。</p></section><div class="result-actions"><a class="secondary" href="../">回安心城，探索其他人生任務 →</a><button type="button" class="text-link" id="result-feedback">告訴我們哪裡好玩、哪裡卡住</button></div></div>`;
}
function lineUrl(text) { return `https://line.me/R/oaMessage/%40604gpqef/?${encodeURIComponent(text)}`; }
function render({focus=false,keepScroll=false}={}) {
  const y=window.scrollY;
  if(introVisible || state.step==='welcome') $('#app').innerHTML=opening();
  else if(state.step==='result') $('#app').innerHTML=resultPage();
  else {
    const scene=sceneLines[state.step];
    const content={priority:priorityChapter,home:homeChapter,check:checkChapter,explore:exploreChapter,future:futureChapter}[state.step]();
    $('#app').innerHTML=`${stepper()}<div class="story-layout"><aside class="scene-column"><div class="scene-frame">${streetScene({step:state.step,home:state.price,place:state.place})}</div><div class="scene-caption"><span class="book-number">${times[state.step]} / 小安的一天</span><b>${scene[0]}</b><p>${scene[1]}</p></div></aside><article class="chapter"><header class="chapter-top"><p class="eyebrow">${times[state.step]} · 第 ${STEPS.indexOf(state.step)} 站 / 5</p><h1 id="chapter-title" tabindex="-1">${titles[state.step]}</h1></header>${content}${navigation()}</article></div>`;
  }
  bind();
  if(focus){ $('#chapter-title')?.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  else if(keepScroll) window.scrollTo({top:y,behavior:'instant'});
}
function go(step,{history=true}={}) {
  const old=state.step;
  state=goToStep(state,step); introVisible=state.step==='welcome';
  if(state.step!==old){summaryDirty=false;summaryDraft=null;}
  persist();render({focus:true});
  if(history) window.history.pushState({storyStep:state.step},'',`#${state.step}`);
}
function bind() {
  $('#app').querySelectorAll('[data-go]').forEach(button=>button.onclick=()=>go(button.dataset.go));
  $('[data-start]')?.addEventListener('click',()=>{introVisible=false;go(state.step==='welcome'?'priority':state.step);});
  $('[data-next]')?.addEventListener('click',()=>{if(canContinue(state)) go(STEPS[STEPS.indexOf(state.step)+1]);});
  $('#app').querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>{
    state=updateChoice(state,button.dataset.choice,button.dataset.value);summaryDirty=false;summaryDraft=null;persist();render({keepScroll:true});
    const changed=$(`[data-choice="${button.dataset.choice}"][data-value="${button.dataset.value}"]`);changed?.focus({preventScroll:true});
  });
  $('#app').querySelectorAll('[data-clue]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.clue; expandedClue=expandedClue===id?null:id; state=revealClue(state,id);persist();render({keepScroll:true});$(`[data-clue="${id}"]`)?.focus({preventScroll:true});
  });
  $('#app').querySelectorAll('[data-replay]').forEach(button=>button.onclick=()=>{
    state={...state,previous:snapshotRoute(state),lesson:null};
    if(button.dataset.replay==='explore'){state.place=null;state.cultureAnswer=null;}
    summaryDirty=false;summaryDraft=null;go(button.dataset.replay);
  });
  $('#line-summary')?.addEventListener('input',event=>{summaryDraft=event.target.value;summaryDirty=true;$('#send-line').href=lineUrl(summaryDraft);});
  $('#copy-line')?.addEventListener('click',()=>copyText($('#line-summary').value,$('#line-summary')));
  $('#copy-card')?.addEventListener('click',()=>copyText(buildSummary(state),$('#line-summary')));
  $('#download-card')?.addEventListener('click',downloadCard);
  $('#print-card')?.addEventListener('click',()=>window.print());
  $('#result-feedback')?.addEventListener('click',()=>$('#open-feedback').click());
}
async function copyText(text,fallback) {
  try { await navigator.clipboard.writeText(text);notify('已複製，可以貼到 LINE 或自己的筆記。'); }
  catch { if(fallback){fallback.value=text;fallback.dispatchEvent(new Event('input',{bubbles:true}));fallback.focus();fallback.select();notify('自動複製未成功，文字已選取，請長按或使用複製快捷鍵。');} }
}
function downloadCard() {
  const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1460;
  const ctx=canvas.getContext('2d');if(!ctx){notify('這台裝置暫時不能產生圖片，可改用列印或複製摘要。');return;}
  const result=getResult(state),place=pick(places,state.place);
  ctx.fillStyle='#f8f3e5';ctx.fillRect(0,0,1080,1460);ctx.fillStyle='#194f49';ctx.fillRect(0,0,1080,180);
  ctx.textBaseline='top';ctx.font='28px "PingFang TC","Microsoft JhengHei",sans-serif';ctx.fillStyle='#fff8e8';ctx.fillText('宏國地政｜易丞地政 · 人生練習簿 01',64,52);ctx.fillText('小安在台南的第一天｜學習成果卡',64,106);
  let y=225;
  const write=(text,size=30,color='#194f49',gap=12)=>{ctx.font=`${size}px "PingFang TC","Microsoft JhengHei",sans-serif`;ctx.fillStyle=color;let line='';for(const ch of text){if(ctx.measureText(line+ch).width>940){ctx.fillText(line,64,y);y+=size*1.55;line=ch;}else line+=ch;}if(line){ctx.fillText(line,64,y);y+=size*1.55;}y+=gap;};
  write(pick(priorities,state.priority).title,52);write(`${pick(homes,state.price).title} · ${pick(timings,state.timing).title}`,30);write(pick(shocks,state.shock).title,28,'#6a775d');
  for(const [label,key] of [['進場現金缺口','downPaymentGap'],['假設房貸月付','monthlyMortgage'],['保留生活目標後月餘額','comfortRemainingMonthly']]){write(`${label}　${fmt(result.metrics[key])} 元`,34,'#194f49',16);}
  write(`台南閱讀印記：${place.title}`,31);write('今天學會：核對產權、使用與屋況；確認銀行條件，也一起看現金與每月生活。',30);
  write('這是虛構情境與網站選讀，不是核貸、個案稅額或法律判斷，也不代表到訪。',24,'#62705d');
  write('貸款75%、30年；固定其他費用30萬元、預備金60萬元。完整假設請回到遊戲查看。',24,'#62705d');
  ctx.fillStyle='#194f49';ctx.fillRect(0,1328,1080,132);ctx.fillStyle='#fff8e8';ctx.font='27px "PingFang TC","Microsoft JhengHei",sans-serif';ctx.fillText('想問清楚下一步？官方 LINE：@604gpqef',64,1353);ctx.font='21px sans-serif';ctx.fillText('homegoestate.github.io/anxin-city/first-day/',64,1402);
  canvas.toBlob(blob=>{
    if(!blob){notify('圖片尚未產生，可改用複製摘要。');return;}
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='小安在台南的第一天_學習成果卡.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notify('已開始保存成果卡；若手機改為預覽圖片，可長按儲存。');
  },'image/png');
}
window.addEventListener('popstate',event=>{const step=event.state?.storyStep;if(STEPS.includes(step))go(step,{history:false});});
window.history.replaceState({storyStep:'welcome'},'','#welcome');
render();
