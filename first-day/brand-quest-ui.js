import { BRAND, quests } from './brand-quests.js?v=16.0.0';
import { loadQuestState, saveQuestState, normalizeQuestState, selectQuest, questProgress, answerQuest, questSummary } from './quest-state.js?v=16.0.0';
import { stops, discoveries } from './street-data.js?v=16.0.0';
import { companionTools } from '../tool-routes.js?v=6.0.0';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=(list,id)=>list.find(x=>x.id===id);
const lineUrl=text=>'https://line.me/R/oaMessage/%40604gpqef/?'+encodeURIComponent(text);
const button=(label,attrs='',kind='primary')=>'<button type="button" class="'+kind+'" '+attrs+'>'+esc(label)+'</button>';

export function createBrandQuests({storage,getStreetState,showPanel,walkTo,changed,notify}) {
  let state=loadQuestState(storage,getStreetState()),atOffice=false,storageFailed=false;
  const requested=new URLSearchParams(location.search).get('quest');
  if(quests.some(q=>q.id===requested)){
    state=selectQuest(state,requested,getStreetState());
    storageFailed=!saveQuestState(storage,state);
  }
  const progress=id=>questProgress(state,getStreetState(),id??state.active);
  function persist(){storageFailed=!saveQuestState(storage,state);changed?.();}
  function sync(){state=normalizeQuestState(state,getStreetState());}
  function completionCount(){sync();return quests.filter(q=>progress(q.id).completed).length;}
  function summary(){sync();return questSummary(state,getStreetState());}
  function active(){sync();return progress();}
  function nextStop(){const p=active();return p.quest&&!p.completed?(p.nextClue?.stopId||'lane-office'):null;}
  function brandNote(){return '<p class="quest-boundary">街坊任務是虛構學習挑戰，完成不代表委任、核貸或個案判斷。楊明宗、楊翊晟地政士各自獨立執業。<a href="https://homegoestate.github.io/about.html#practice-disclosure" target="_blank" rel="noopener noreferrer">認識我們與執業說明 ↗</a></p>'+(storageFailed?'<p class="quest-storage" role="status">此瀏覽器目前無法保存任務，請先下載卡片或複製清單。</p>':'');}
  function panel(title,html){showPanel(title,html+brandNote());}
  function clueList(p,compact=false){return '<ol class="quest-clues">'+p.clues.map(c=>'<li class="'+(c.found?'is-found':'')+'"><span aria-hidden="true">'+(c.found?'✓':'○')+'</span><div><b>'+esc(byId(discoveries,c.discoveryId)?.title)+'</b>'+(!compact?'<p>'+esc(c.hint)+'</p>':'')+'</div>'+(!c.found?button('去找線索','data-quest-walk="'+esc(c.stopId)+'"','text-link'):'')+'</li>').join('')+'</ol>';}
  function hud(){
    const p=active(),done=completionCount();
    if(!p.quest)return '<div class="quest-hud-intro"><span class="quest-emblem" aria-hidden="true">⌂</span><div><b>今天，幫一位街坊把家的問題問清楚。</b><p>'+BRAND+' · 3 條任務，選一段你的故事</p></div>'+button('領一個街坊任務 →','data-quest-board')+'</div>';
    const destination=p.nextClue?byId(stops,p.nextClue.stopId)?.name:BRAND;
    return '<div class="quest-hud-active"><div><small>街坊互助任務 · '+esc(p.quest.client)+'</small><b>'+esc(p.quest.title)+'</b><p>'+(p.completed?'已完成！你的準備清單已收好。':p.readyToReview?'線索齊了，回事務所試著做決定。':'下一步：'+esc(destination)+' · '+esc(p.nextClue?.hint||''))+'</p><span class="quest-meter" aria-label="找到 '+p.found+' / '+p.total+' 個線索">'+p.clues.map(c=>'<i class="'+(c.found?'filled':'')+'"></i>').join('')+' <span>'+p.found+' / '+p.total+' 線索 · '+done+' / 3 任務</span></span></div><div class="quest-hud-actions">'+button(p.completed?'看任務成果':'帶我去下一站 →',p.completed?'data-quest-result="'+p.quest.id+'"':'data-quest-next')+button('任務簿','data-quest-board','text-link')+'</div></div>';
  }
  function board(office=false){
    atOffice=office;
    panel(office?BRAND:'今天，想幫誰一把？','<div class="quest-office-banner"><span class="quest-emblem" aria-hidden="true">⌂</span><div><p class="eyebrow">'+BRAND+'</p><h3>家的事，一起問清楚。</h3><p>從街坊的問題出發，帶回線索，再把下一步整理成一張清單。</p></div></div><div class="quest-board">'+quests.map(q=>{const p=progress(q.id);return '<article class="quest-card"><span class="quest-tag">'+esc(q.tagline)+'</span><h3>'+esc(q.title)+'</h3><p>'+esc(q.intro)+'</p><small>'+esc(q.client)+' · 2 個線索 → 回事務所挑戰 → 準備清單</small>'+button(p.completed?'回看成果 ✓':state.active===q.id?'繼續這段任務 →':'接受這個挑戰 →',p.completed?'data-quest-result="'+q.id+'"':'data-quest-select="'+q.id+'"')+'</article>';}).join('')+'</div><p class="note">自由散步、原本的買房試算與工具都還在。可以換任務，已找到的線索會保留。</p>'+services());
  }
  function services(){return '<details class="quest-services"><summary>現實裡，我們可以陪你整理什麼？</summary><div>'+quests.map(q=>'<section><b>'+esc(q.service.title)+'</b><p>'+esc(q.service.description)+'</p></section>').join('')+'</div><a href="https://homegoestate.github.io/" target="_blank" rel="noopener noreferrer">到宏國地政・易丞地政官網認識服務 ↗</a><div class="street-tools">'+Object.values(companionTools).map(t=>'<a href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">'+esc(t.name)+' ↗</a>').join('')+'</div></details>';}
  function brief(){
    const p=active();if(!p.quest){board(atOffice);return;}
    if(p.completed){result(p.quest.id);return;}
    if(p.readyToReview&&atOffice){review();return;}
    panel(p.quest.title,'<p class="quest-tag">'+esc(p.quest.client)+' 的小小求助</p><p>'+esc(p.quest.intro)+'</p>'+clueList(p)+'<div class="quest-next-card"><b>'+(p.readyToReview?'線索找齊了，回來把問題問清楚。':'先找到線索，再做決定。')+'</b><p>點「帶我去下一站」，小安會走到對應人物旁。留意標記的任務話題，選擇仍然由你決定。</p>'+button(p.readyToReview?'回宏國 × 易丞，完成挑戰 →':'帶我去下一站 →','data-quest-next')+'</div>');
  }
  function review(feedback=''){
    const p=active();if(!p.quest||!p.readyToReview||!atOffice){brief();return;}
    panel(BRAND,'<div class="quest-office-banner"><span class="quest-emblem" aria-hidden="true">⌂</span><div><p class="eyebrow">線索帶回來了 · 一起試著判斷</p><h3>'+esc(p.quest.title)+'</h3></div></div>'+clueList(p,true)+'<section class="quest-review"><h3>'+esc(p.quest.question)+'</h3>'+(feedback?'<p class="quest-answer-feedback" role="status">'+esc(feedback)+'</p>':'')+'<div class="street-choices">'+p.quest.answers.map(a=>button(a.label,'data-quest-answer="'+esc(a.id)+'"','street-choice')).join('')+'</div><p class="note">答錯也可以重選，每個選擇都有不同回應。</p></section>');
  }
  function visitOffice(){atOffice=true;const p=active();if(!p.quest)board(true);else if(p.completed)result(p.quest.id);else if(p.readyToReview)review();else brief();}
  function lineSummary(q){return ['【安心城街坊任務｜'+BRAND+'】','我完成了虛構學習任務：'+q.title,'收下稱號：'+q.badge,'','我想向你們詢問：'+q.lineQuestion,'','想先整理的資料：',...q.checklist.map((t,i)=>(i+1)+'. '+t),'','這是遊戲產生的準備方向，不是我的真實財務資料、個案審定或委任。請先告訴我下一步如何準備。'].join('\n');}
  function result(id){
    const p=progress(id);if(!p.quest||!p.completed){brief();return;}
    const q=p.quest,t=companionTools[q.tool],text=lineSummary(q),done=completionCount();
    panel('這一次，你幫上忙了。','<div class="quest-celebrate"><span class="quest-award" aria-hidden="true">✦</span><p>街坊互助任務完成 · '+done+' / 3</p><h3>'+esc(q.badge)+'</h3><strong>'+esc(q.title)+'</strong><p>'+esc(q.answers.find(a=>a.correct).feedback)+'</p></div><div class="quest-preparation"><p class="eyebrow">'+BRAND+' · 帶回現實的下一步</p><h3>先準備這些，對話更有方向。</h3><ol>'+q.checklist.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol><p>'+esc(q.service.description)+'</p></div><div class="street-dialog-actions">'+button('保存品牌任務卡 ↓','data-quest-save="'+q.id+'"')+button('再幫一位街坊 →','data-quest-board','secondary')+'</div><section class="quest-handoff"><h3>帶這張清單，找宏國 × 易丞聊聊。</h3><label for="quest-line-text">準備帶到官方 LINE 的文字，可修改</label><textarea id="quest-line-text" rows="5" maxlength="1600">'+esc(text)+'</textarea><a class="primary" id="quest-line-link" href="'+lineUrl(text)+'" target="_blank" rel="noopener noreferrer">帶清單到官方 LINE ↗</a>'+button('複製清單','data-quest-copy','text-link')+'<p class="note">由你確認後送出，本站不會代發。請勿放入身分證、地址或真實案件資料。</p><a href="https://line.me/R/ti/p/%40604gpqef" target="_blank" rel="noopener noreferrer">官方 LINE／QR Code ↗</a><a class="secondary quest-tool" href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer">繼續使用原工具：'+esc(t.name)+' ↗</a><p class="note">保留原工具的驗證及試算流程；不會自動帶入遊戲數字。</p></section><div class="quest-share"><h3>邀朋友，走出另一種故事。</h3><p>分享的是任務入口，不包含你的進度或輸入內容。</p>'+button('複製這條任務的遊玩網址','data-quest-share="'+q.id+'"','secondary')+'</div>');
  }
  function choiceHint(stopId,choiceId){const p=active();return !p.completed&&p.clues.some(c=>!c.found&&c.stopId===stopId&&c.choiceId===choiceId);}
  function onDiscovery(){sync();const p=active();persist();return p.quest&&!p.completed&&p.readyToReview?'任務線索已齊！回宏國 × 易丞，完成最後的挑戰。':p.quest&&!p.completed?'任務更新：'+p.found+' / '+p.total+' 個線索。':'';}
  async function copy(text,fallback){try{await navigator.clipboard.writeText(text);notify('已複製。');}catch{if(fallback){fallback.focus();fallback.select();notify('文字已選取，請長按或使用複製快捷鍵。');}else{panel('遊玩網址，分享給朋友','<p>只分享任務入口，不包含進度或個人資料。</p><label for="quest-share-url">請複製這個網址</label><textarea id="quest-share-url" readonly rows="3">'+esc(text)+'</textarea>');}}}
  function shareUrl(id){const url=new URL('./',import.meta.url);url.searchParams.set('quest',id);return url.href;}
  function handleClick(b){
    if(b.hasAttribute('data-quest-board')){board(false);return true;}
    if(b.dataset.questSelect){state=selectQuest(state,b.dataset.questSelect,getStreetState());persist();brief();return true;}
    if(b.hasAttribute('data-quest-next')){const id=nextStop();if(id){atOffice=false;walkTo(id);}return true;}
    if(b.dataset.questWalk){atOffice=false;walkTo(b.dataset.questWalk);return true;}
    if(b.dataset.questResult){result(b.dataset.questResult);return true;}
    if(b.dataset.questAnswer){const p=active();const answer=answerQuest(state,getStreetState(),p.quest?.id,b.dataset.questAnswer,{atOffice});if(!answer)return true;state=answer.state;persist();if(answer.correct)result(p.quest.id);else review(answer.feedback);return true;}
    if(b.dataset.questSave){downloadCard(b.dataset.questSave);return true;}
    if(b.hasAttribute('data-quest-copy')){const box=document.querySelector('#quest-line-text');if(box)copy(box.value,box);return true;}
    if(b.dataset.questShare){copy(shareUrl(b.dataset.questShare));return true;}
    return false;
  }
  function handleInput(e){if(e.target.id!=='quest-line-text')return false;const link=document.querySelector('#quest-line-link');if(link)link.href=lineUrl(e.target.value);return true;}
  function downloadCard(id){
    const p=progress(id);if(!p.quest||!p.completed)return;
    const q=p.quest,c=document.createElement('canvas');c.width=1080;c.height=1480;const ctx=c.getContext('2d');if(!ctx){notify('圖片暫時無法產生，可先複製清單。');return;}
    ctx.fillStyle='#fbf5e8';ctx.fillRect(0,0,1080,1480);ctx.fillStyle='#195349';ctx.fillRect(0,0,1080,260);ctx.textBaseline='top';ctx.fillStyle='#fff8df';ctx.font='34px "Microsoft JhengHei",sans-serif';ctx.fillText(BRAND,64,50);ctx.font='26px "Microsoft JhengHei",sans-serif';ctx.fillText('家的事，一起問清楚。',64,112);ctx.fillStyle='#e2bd6c';ctx.font='50px "Microsoft JhengHei",sans-serif';ctx.fillText('✦ '+q.badge,64,177);
    let y=310;function write(text,size=30,color='#194f49'){ctx.font=size+'px "Microsoft JhengHei",sans-serif';ctx.fillStyle=color;let line='';for(const ch of text){if(ctx.measureText(line+ch).width>948){ctx.fillText(line,64,y);y+=size*1.55;line=ch;}else line+=ch;}if(line){ctx.fillText(line,64,y);y+=size*1.55;}y+=18;}
    write(q.title,42);write('我學會了',30);p.clues.forEach(clue=>write('✓ '+byId(discoveries,clue.discoveryId).title,29));write('帶回現實的準備清單',32);q.checklist.forEach((s,i)=>write((i+1)+'. '+s,28));write('虛構學習任務，不代表委任、核貸或個案判斷。',23,'#5c7065');
    ctx.fillStyle='#195349';ctx.fillRect(0,1310,1080,170);ctx.fillStyle='#fff8df';ctx.font='31px "Microsoft JhengHei",sans-serif';ctx.fillText('帶著清單，讓我們陪你確認下一步。',64,1340);ctx.font='26px sans-serif';ctx.fillText('LINE @604gpqef',64,1390);ctx.font='19px sans-serif';ctx.fillText('homegoestate.github.io/anxin-city/first-day/?quest='+id,64,1435);
    c.toBlob(blob=>{if(!blob){notify('圖片尚未產生，可改用複製清單。');return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='宏國易丞_街坊任務_'+id+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);notify('已開始保存任務卡；手機如開啟預覽，可長按儲存。');},'image/png');
  }
  return {hud,board,brief,visitOffice,handleClick,handleInput,onDiscovery,choiceHint,summary,active,nextStop,completionCount,result};
}
