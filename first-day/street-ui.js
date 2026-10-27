import { districts, stops, discoveries } from './street-data.js?v=16.0.0';
import { loadStreetState, saveStreetState, changeDistrict, movePlayer, availableStops, interact, chooseStory, streetSummary, streetProgress } from './street-state.js?v=16.0.0';
import { mountStreetWorld } from './street-world.js?v=16.0.0';
import { createBrandQuests } from './brand-quest-ui.js?v=16.0.0';
import { companionTools } from '../tool-routes.js?v=6.0.0';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lineUrl = text => 'https://line.me/R/oaMessage/%40604gpqef/?' + encodeURIComponent(text);
const byId = (items,id) => items.find(item=>item.id===id);

export function createStreetExperience({storage,onLesson,onFeedback,toast=()=>{}}) {
  let state=loadStreetState(storage),host=null,world=null,lastStop=null,dialog=null,lastChoice=null;
  let memoryOnly=false;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const questsUI=createBrandQuests({storage,getStreetState:()=>state,showPanel:showDialog,walkTo:goToStop,
    changed:()=>{refreshProgress();world?.update({highlightStopId:questsUI.nextStop()});},notify:announce});
  function announce(message) {
    if(dialog?.open) {const status=dialog.querySelector('[data-street-status]');if(status)status.textContent=message;}
    toast(message);
  }
  function persist() {
    memoryOnly=!saveStreetState(storage,state);
    const status=host?.querySelector('[data-street-storage-status]');
    if(status)status.textContent=memoryOnly?'目前僅暫存於此頁面，關閉後可能無法保留。':'進度保留在目前瀏覽器；可重選對話，已找到的知識會留下。';
    if(memoryOnly) announce('這次仍可探索，但此瀏覽器暫時無法保存進度。');
  }
  function summary() {
    return ['【宏國地政 × 易丞地政・小安的台南街區探索】',streetSummary(state),questsUI.summary(),'',
      '我想帶回現實繼續確認：產權文件、使用與屋況、銀行條件，以及家人的安排。',
      '這是虛構街區的學習紀錄，不代表實際到訪、核貸或個案法律判斷。','尚未送出訊息；由我確認後自行傳送。'].join('\n');
  }
  function sources(ids) {
    const found=ids.map(id=>byId(discoveries,id)).filter(Boolean);
    return found.map(item=>'<details class="street-source"><summary>'+esc(item.title)+' · 查證來源</summary><p>'+esc(item.summary)+'</p><a href="'+esc(item.source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.source.title)+' ↗</a><small>查核 '+esc(item.source.checkedAt)+'</small>'+(item.cityUrl?'<a href="'+esc(item.cityUrl)+'" target="_blank" rel="noopener noreferrer">到安心城延伸閱讀 ↗</a>':'')+'</details>').join('');
  }
  function ensureDialog() {
    if(dialog) return;
    dialog=document.createElement('dialog');dialog.className='street-dialog';dialog.setAttribute('aria-label','小安的街區故事');
    document.body.append(dialog);
    dialog.addEventListener('close',()=>host?.querySelector('[data-street-notebook]')?.focus({preventScroll:true}));
    dialog.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b)return;
      if(questsUI.handleClick(b))return;
      if(b.hasAttribute('data-dialog-close')) dialog.close();
      if(b.dataset.answer) answer(b.dataset.answer);
      if(b.hasAttribute('data-talk-again')) talk(lastStop);
      if(b.hasAttribute('data-open-book')) notebook();
      if(b.hasAttribute('data-street-lesson')) {dialog.close();onLesson();}
      if(b.dataset.walk) {const id=b.dataset.walk;dialog.close();world?.walkTo(id);}
      if(b.hasAttribute('data-save-exploration')) saveCard();
      if(b.hasAttribute('data-copy-exploration')) copySummary();
    });
    dialog.addEventListener('input',event=>{
      if(questsUI.handleInput(event))return;
      if(event.target.id==='street-line-text')dialog.querySelector('#street-line-link').href=lineUrl(event.target.value);
    });
  }
  function showDialog(title,body) {
    ensureDialog();
    dialog.innerHTML='<header class="street-dialog-top"><div><small>小安的台南街區冒險</small><h2 tabindex="-1" id="street-dialog-title">'+esc(title)+'</h2></div><button type="button" data-dialog-close aria-label="回到街區">×</button></header><div class="street-dialog-body">'+body+'<p data-street-status role="status" aria-live="polite"></p></div>';
    dialog.setAttribute('aria-labelledby','street-dialog-title');
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('#street-dialog-title').focus({preventScroll:true});
    dialog.scrollTop=0;
    if(memoryOnly)dialog.querySelector('[data-street-status]').textContent='此瀏覽器目前無法保存進度；這次仍可探索、下載卡片或複製摘要。';
  }
  function talk(id) {
    const story=interact(state,id),stop=byId(stops,id);
    if(!story||!stop)return;
    lastStop=id;lastChoice=null;
    if(id==='lane-office'){questsUI.visitOffice();return;}
    showDialog(stop.name+' · '+stop.role,'<p class="street-speaker">'+esc(stop.kind==='place'?'觀察一下這個地方':'你想怎麼接話？')+'</p>'+story.intro.map(t=>'<p>'+esc(t)+'</p>').join('')+
      '<div class="street-choices">'+story.choices.map(c=>'<button type="button" class="street-choice'+(questsUI.choiceHint(id,c.id)?' quest-current-choice':'')+'" data-answer="'+esc(c.id)+'"><span>'+(questsUI.choiceHint(id,c.id)?'<small class="quest-choice-tag">這段話裡有任務線索</small>':'')+esc(c.label)+'</span><span aria-hidden="true">→</span></button>').join('')+'</div><p class="note">換個選擇，可以聽見另一段故事。</p>');
  }
  function answer(choiceId) {
    const result=chooseStory(state,lastStop,choiceId);if(!result)return;
    state=result.state;lastChoice=result.choice;persist();refreshProgress();
    const questUpdate=questsUI.onDiscovery();
    world?.update({district:byId(districts,state.district),position:state.position,stops:availableStops(state),highlightStopId:questsUI.nextStop()});
    const stop=byId(stops,lastStop),items=result.choice.discoveryIds.map(id=>byId(discoveries,id)).filter(Boolean);
    const unlocked=result.unlocked.map(id=>byId(stops,id)).filter(Boolean);
    let action='';
    if(result.choice.action==='lesson') action='<button class="primary" type="button" data-street-lesson>跟楊代書做一次買房練習 →</button>';
    else if(companionTools[result.choice.action]) {const tool=companionTools[result.choice.action];action='<a class="primary" href="'+esc(tool.url)+'" target="_blank" rel="noopener noreferrer">打開'+esc(tool.name)+' ↗</a><p class="note">沿用原工具與驗證流程；遊戲選項不會自動填入個案欄位。</p>';}
    showDialog(stop.name+'的下一句','<div class="street-response">'+result.response.map(t=>'<p>'+esc(t)+'</p>').join('')+
      (result.choice.followUp?'<p class="street-followup">'+esc(result.choice.followUp)+'</p>':'')+
      '<div class="street-reward"><span aria-hidden="true">✦</span><div><b>收進你的探索手帳</b><p>'+items.map(i=>esc(i.title)).join('、')+'</p></div></div>'+
      unlocked.map(s=>'<div class="street-unlocked"><b>新故事出現了：'+esc(s.name)+'</b><p>'+esc(s.role)+'</p>'+(s.district===state.district?'<button class="secondary" type="button" data-walk="'+esc(s.id)+'">走過去找'+esc(s.name)+' →</button>':'')+'</div>').join('')+
      sources(result.choice.discoveryIds)+action+
      (questUpdate?'<div class="quest-discovery-note">'+esc(questUpdate)+'<button type="button" class="text-link" data-quest-next>繼續任務，帶我去下一站 →</button></div>':'')+
      '<div class="street-dialog-actions"><button class="primary" type="button" data-dialog-close>回街上，繼續探索 →</button><button class="secondary" type="button" data-talk-again>換一句話，看看不同故事</button><button class="text-link" type="button" data-open-book>看看我的探索手帳</button></div>');
  }
  function refreshProgress() {
    if(!host)return;
    const p=streetProgress(state),goal=host.querySelector('.street-goal'),button=host.querySelector('[data-street-notebook]');
    const questHost=host.querySelector('.quest-hud');if(questHost)questHost.innerHTML=questsUI.hud();
    const mission=p.ready?'已完成今日探索！打開手帳，帶走你的發現。':'今日小任務：和 2 位居民聊聊，找到 1 個地方故事與 1 個家的線索。';
    if(goal)goal.innerHTML='<div><b>'+mission+'</b><p>已聊 '+p.residents+' 位居民 · 地方故事 '+p.culture+' · 家的線索 '+p.property+'</p></div><span aria-hidden="true">'+(p.ready?'✦':'⌕')+'</span>';
    if(button)button.textContent=(p.ready?'收下今日探索卡':'我的探索手帳')+' · '+p.discoveries;
  }
  function goToStop(id){
    const target=byId(stops,id);if(!target||!host)return;
    if(dialog?.open)dialog.close();
    if(state.district!==target.district){state=changeDistrict(state,target.district);persist();mount(host);}
    if(!availableStops(state).some(s=>s.id===id)){announce('這個角色還沒出現，先跟街坊聊聊。');return;}
    host.querySelector('.street-map-host')?.scrollIntoView({block:'center',behavior:'instant'});
    world?.walkTo(id);
  }
  function mount(container) {
    if(world)world.destroy();world=null;host=container;
    const d=byId(districts,state.district);
    host.innerHTML='<section class="street-screen"><header class="street-heading"><div><p class="eyebrow">宏國地政 × 易丞地政 · 家的事，一起問清楚</p><h1 id="chapter-title" tabindex="-1">小安在台南的第一天<span>陪街坊解開家的小問題。</span></h1></div><button class="secondary" type="button" data-street-notebook>我的探索手帳</button></header>'+
      '<nav class="street-toolbar" aria-label="選擇探索街區">'+districts.map(item=>'<button type="button" data-district="'+esc(item.id)+'" aria-pressed="'+(item.id===state.district)+'">'+esc(item.title)+'</button>').join('')+'</nav>'+
      '<div class="quest-hud" aria-label="目前街坊任務"></div><div class="street-map-heading"><strong>'+esc(d.title)+'</strong><span>'+esc(d.subtitle)+'</span></div>'+
      '<div class="street-map-host"></div>'+
      '<div class="street-bottom"><p>點路面讓小安走過去；點居民，走近後聊聊。方向鍵 / WASD 移動，E 交談。</p><div><button class="primary" type="button" data-street-lesson>也想練習買房？帶著選擇算一算 →</button><button class="text-link" type="button" data-street-feedback>哪裡好玩、哪裡卡住？</button></div><details><summary>關於這張探索地圖與進度</summary><p>這是台南特色的想像縮影，各主題街區不是實際地理位置或步行路線。居民與對話為原創虛構；文化與不動產知識附官方來源。探索印記表示網站內學習，並非到訪。</p><p data-street-storage-status>'+(memoryOnly?'目前僅暫存於此頁面，關閉後可能無法保留。':'進度保留在目前瀏覽器；可重選對話，已找到的知識會留下。')+'</p></details></div></section>';
    host.querySelectorAll('[data-district]').forEach(b=>b.onclick=()=>{state=changeDistrict(state,b.dataset.district);persist();mount(host);host.querySelector('h1').focus({preventScroll:true});toast('來到'+byId(districts,state.district).title+'，找找新朋友。');});
    host.querySelector('[data-street-notebook]').onclick=notebook;
    host.querySelector('[data-street-lesson]').onclick=onLesson;
    host.querySelector('[data-street-feedback]').onclick=onFeedback;
    host.querySelector('.quest-hud').onclick=event=>{const button=event.target.closest('button');if(button)questsUI.handleClick(button);};
    refreshProgress();
    world=mountStreetWorld(host.querySelector('.street-map-host'),{district:d,position:state.position,stops:availableStops(state),reducedMotion:reduce.matches,highlightStopId:questsUI.nextStop(),
      onMove:position=>{state=movePlayer(state,position);persist();},onInteract:id=>{if(!dialog?.open)talk(id);}});
  }
  function notebook() {
    const p=streetProgress(state),learned=state.discoveries.map(id=>byId(discoveries,id)).filter(Boolean);
    const title=p.ready?(p.property>=3?'今天，你是家的偵探。':p.culture>=4?'台南故事，被你發現了。':'今天，多懂了台南和家。'):'小安的探索手帳';
    showDialog(title,'<section class="street-result"><p class="street-progress">'+p.residents+' 位居民對話 · '+p.culture+' 則地方故事 · '+p.property+' 則家的知識</p>'+
      (p.ready?'<div class="street-reward"><span>✦</span><b>完成今日小任務 · 還有其他街區與分支等你發現</b></div>':'<p>先和 2 位居民聊聊，找到 1 個地方故事與 1 個家的線索，就能收下今日探索卡。</p>')+
      '<div class="street-list">'+['culture','property'].map(topic=>'<section><h3>'+(topic==='culture'?'台南，把故事留在日常':'關於家，多問清楚一步')+'</h3>'+sources(learned.filter(i=>i.topic===topic).map(i=>i.id))+(learned.some(i=>i.topic===topic)?'':'<p class="note">這一頁還空著，去找居民或景點聊聊吧。</p>')+'</section>').join('')+'</div>'+
      '<div class="street-dialog-actions">'+(p.ready?'<button class="primary" type="button" data-save-exploration>保存今日探索卡 ↓</button>':'')+'<button class="secondary" type="button" data-dialog-close>回街上，再發現一件事 →</button></div></section>'+
      '<button class="secondary" type="button" data-quest-board>街坊互助任務 · 已完成 '+questsUI.completionCount()+' / 3 →</button><section class="street-handoff"><p class="eyebrow">宏國地政 × 易丞地政</p><h3>把好奇，變成下一個問清楚的問題。</h3><p>街上學到的產權、房貸與家庭安排，可以再放進原本的買房練習，或帶著問題找我們。</p><button class="primary" type="button" data-street-lesson>保留探索，繼續買房練習 →</button><label for="street-line-text">準備帶到 LINE 的文字，可先修改</label><textarea id="street-line-text" rows="5" maxlength="1600">'+esc(summary())+'</textarea><a id="street-line-link" class="primary" href="'+lineUrl(summary())+'" target="_blank" rel="noopener noreferrer">前往官方 LINE，帶上發現 ↗</a><button class="text-link" type="button" data-copy-exploration>複製這份文字</button><p class="note">由你確認後按送出；本站不會代發。電腦可複製文字，再開啟官方帳號。編輯文字只留在此畫面，請勿放入個資或真實案件資料。</p><a class="text-link" href="https://line.me/R/ti/p/%40604gpqef" target="_blank" rel="noopener noreferrer">官方帳號／QR Code ↗</a><div class="street-tools">'+Object.values(companionTools).map(t=>'<a href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">'+esc(t.name)+' ↗</a>').join('')+'</div></section>');
  }
  async function copySummary() {
    const textarea=dialog.querySelector('#street-line-text');
    try {await navigator.clipboard.writeText(textarea.value);announce('已複製，可貼到 LINE。');}
    catch {textarea.focus();textarea.select();announce('文字已選取，請長按或使用複製快捷鍵。');}
  }
  function saveCard() {
    const p=streetProgress(state);if(!p.ready)return;
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1420;
    const ctx=canvas.getContext('2d');if(!ctx){announce('暫時無法產生圖片，可以先複製探索摘要。');return;}
    ctx.fillStyle='#f7f2e6';ctx.fillRect(0,0,1080,1420);
    ctx.fillStyle='#194f49';ctx.fillRect(0,0,1080,190);ctx.fillStyle='#fff9e8';
    ctx.textBaseline='top';ctx.font='30px "Microsoft JhengHei",sans-serif';ctx.fillText('宏國地政｜易丞地政 · 台南街區冒險',64,50);
    ctx.font='48px "Microsoft JhengHei",sans-serif';ctx.fillText('小安在台南的第一天',64,110);
    let y=230;
    const write=(text,size=30,color='#194f49')=>{ctx.font=size+'px "Microsoft JhengHei",sans-serif';ctx.fillStyle=color;let line='';for(const c of text){if(ctx.measureText(line+c).width>940){ctx.fillText(line,64,y);y+=size*1.55;line=c;}else line+=c;}if(line){ctx.fillText(line,64,y);y+=size*1.55;}y+=14;};
    write('今天的探索，有了自己的樣子。',40);
    write(p.residents+' 位居民對話 · '+p.culture+' 則地方故事 · '+p.property+' 則家的線索',29);
    const items=state.discoveries.map(id=>byId(discoveries,id)).filter(Boolean);
    write('我在台南發現了',32);
    items.filter(i=>i.topic==='culture').slice(0,4).forEach(i=>write('✦ '+i.title,29));
    write('關於家，我想多問清楚',32);
    items.filter(i=>i.topic==='property').slice(0,3).forEach(i=>write('• '+i.title,28));
    write('這是虛構街區的學習紀錄，不代表實際到訪、核貸或個案判斷。',23,'#617563');
    ctx.fillStyle='#194f49';ctx.fillRect(0,1280,1080,140);ctx.fillStyle='#fff9e8';ctx.font='28px "Microsoft JhengHei",sans-serif';ctx.fillText('帶著問題，楊代書陪你往下一步。',64,1302);ctx.font='23px sans-serif';ctx.fillText('LINE @604gpqef · homegoestate.github.io/anxin-city/first-day/',64,1358);
    canvas.toBlob(blob=>{if(!blob){announce('圖片暫未完成，請改用摘要。');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='小安在台南_今日探索卡.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);announce('探索卡已開始保存。');},'image/png');
  }
  function destroy() {world?.destroy();world=null;host=null;if(dialog?.open)dialog.close();}
  return {mount,destroy,summary,progress:()=>streetProgress(state),context:()=>byId(districts,state.district)?.title||'街區探索',notebook};
}
