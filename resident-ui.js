import {residents,residentEvents,residentEventSources,residentReviewedAt,eventStatus,taipeiDay} from './resident-data.js?v=8.0.0';
import {createConversation,chooseReply,currentNode} from './resident-state.js?v=8.0.0';
import {readingButtonHtml} from './service-hub.js?v=8.0.0';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups=[['all','都來聊聊'],['daily','日常生活'],['culture','地方文化'],['family','親子時光'],['nature','自然出遊']];
const calendarUrl='https://www.twtainan.net/zh-tw/event/touristcalendar/';
const residentById=new Map(residents.map(resident=>[resident.id,resident]));
const sources=Array.isArray(residentEventSources)?residentEventSources:Object.entries(residentEventSources||{}).map(([id,source])=>({id,...source}));
const sourceById=new Map(sources.map(source=>[source.id,source]));
const safeUrl=value=>{try{const url=new URL(String(value));return /^https?:$/.test(url.protocol)?url.href:'';}catch{return '';}};
const safeColor=value=>/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(String(value))?value:'#68806b';
const dateText=value=>String(value??'').replaceAll('-',' / ');

// Original, locally drawn portraits. The people are fictional, not photographs.
function portrait(resident,small=false){
 const index=Math.max(0,residents.findIndex(item=>item.id===resident.id))%8;
 const hair=['#79766a','#4b4940','#383e36','#393f38','#515448','#45433c','#747568','#3a443b'][index];
 const skin=['#d9ac84','#e8ba95','#d6a47f','#edc5a3','#e1b48e','#d4a180','#e2b692','#deb08b'][index];
 const backHair=[
  '<path d="M39 74Q27 35 65 34Q102 34 95 80L86 95H42Z"/>',
  '<path d="M36 88V64Q34 34 66 32Q97 33 96 66V89Z"/><circle cx="95" cy="46" r="15"/>',
  '<path d="M36 71Q30 32 68 33Q103 35 96 75L89 89H42Z"/>',
  '<path d="M34 104V65Q34 30 66 31Q98 29 98 64V105Z"/>',
  '<path d="M35 92V63Q34 34 65 33Q99 34 98 66V94Z"/><path d="M90 49Q116 45 104 95L88 85Z"/>',
  '<path d="M35 75Q30 39 62 32Q101 29 98 76L90 88H42Z"/>',
  '<path d="M37 73Q31 35 67 35Q101 35 96 75L90 88H43Z"/>',
  '<path d="M35 72Q33 33 68 34Q99 32 96 72L90 87H40Z"/>'
 ][index];
 const fringe=[
  '<path d="M40 58Q49 38 69 39Q87 40 92 59L81 51L74 57L63 48L52 57Z"/>',
  '<path d="M38 64Q39 36 65 36Q91 36 94 65Q75 62 66 44Q60 60 38 64Z"/>',
  '<path d="M38 60L39 43L80 36L96 50L92 63L78 48L55 56Z"/>',
  '<path d="M38 63Q40 35 66 35Q92 36 94 64L81 62L77 49L74 63L53 60L50 49L47 63Z"/>',
  '<path d="M38 63Q42 34 67 36Q90 36 94 64L76 57L68 44L58 59Z"/>',
  '<path d="M37 61Q40 34 65 36Q91 34 95 61L80 50L67 55L58 47L51 59Z"/>',
  '<path d="M39 60Q43 39 68 39Q88 40 94 61L82 50L73 56L60 49L49 58Z"/>',
  '<path d="M38 62L40 42L59 36L76 37L92 45L95 62L78 52L60 57L50 51Z"/>'
 ][index];
 const glasses=[0,2,6].includes(index)?'<g fill="none" stroke="#4b5144" stroke-width="2.4"><rect x="44" y="64" width="18" height="13" rx="5"/><rect x="70" y="64" width="18" height="13" rx="5"/><path d="M62 68h8M39 66h5m44 0h5"/></g>':'';
 const hat=index===0?'<path d="M35 48L42 25Q65 17 89 27L96 48Z" fill="#c1a474"/><path d="M28 49Q65 38 104 49L103 56Q65 47 29 56Z" fill="#e0c795"/><path d="M39 41Q66 34 92 42" stroke="#a6885f" stroke-width="6" fill="none"/>':index===4?'<path d="M37 49Q40 23 66 24Q92 23 95 49Z" fill="#8b9870"/><path d="M27 51Q65 40 105 51L102 58Q66 51 29 58Z" fill="#a7b082"/>':'';
 const accessory=index===1?'<path d="M48 110L55 102H77L84 110V147H48Z" fill="#dfca9a"/><path d="M56 122h20v15H56Z" fill="#b79a69"/>':index===6?'<path d="M47 107L61 126L84 107" stroke="#4b5447" stroke-width="4" fill="none"/><rect x="53" y="122" width="29" height="20" rx="4" fill="#4c5d52"/><circle cx="68" cy="132" r="7" fill="#b2c0ab"/>':'';
 return `<svg class="rc-portrait${small?' is-small':''}" viewBox="0 0 132 148" aria-hidden="true" focusable="false"><rect width="132" height="148" rx="28" fill="#eee7d3"/><circle cx="105" cy="28" r="14" fill="#ddc48d"/><path d="M0 126Q37 102 69 122T132 113V148H0Z" fill="#d7dfc8"/><g fill="${hair}">${backHair}</g><path d="M18 148V132Q21 103 52 100H80Q111 104 115 132V148Z" fill="${esc(safeColor(resident.color))}"/><path d="M56 92V109Q66 117 76 109V91" fill="${skin}"/><circle cx="39" cy="73" r="7" fill="${skin}"/><circle cx="93" cy="73" r="7" fill="${skin}"/><path d="M40 57Q41 41 66 40Q91 41 92 57V77Q89 100 66 104Q42 99 40 77Z" fill="${skin}"/><g fill="${hair}">${fringe}</g><g fill="#38483d"><circle cx="53" cy="69" r="2.2"/><circle cx="79" cy="69" r="2.2"/></g><path d="M61 86Q66 90 72 86" stroke="#965e4d" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M66 72l-2 8h4" stroke="#bc876a" stroke-width="1.5" fill="none"/>${glasses}${hat}${accessory}<path d="M34 134v14m64 -14v14" stroke="#fff7e9" stroke-opacity=".25" stroke-width="2"/></svg>`;
}

export function createResidentChat({onExplore,onMission,onFeedback,toast}={}){
 const nav=document.querySelector('.header-nav');
 const button=document.createElement('button');
 button.id='resident-button';button.className='resident-nav';button.type='button';button.textContent='街坊聊聊';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','resident-dialog');
 if(nav){const before=nav.querySelector('#tainan-button');nav.insertBefore(button,before||null);}
 const dialog=document.createElement('dialog');
 dialog.id='resident-dialog';dialog.className='rc-dialog';dialog.setAttribute('aria-labelledby','resident-title');
 document.body.append(dialog);
 let view='directory',previousView='directory',group='all',conversation=null,previousStates=[],returnFocus=null,currentDay='';
 const selectedResident=()=>residentById.get(conversation?.residentId);

 function releaseFocus(){
  document.body.classList.remove('resident-chat-open');
  const target=returnFocus;returnFocus=null;
  if(target?.isConnected)target.focus({preventScroll:true});
 }
 function close(){if(dialog.open)dialog.close();releaseFocus();}
 function open(id){
  if(!dialog.open)returnFocus=document.activeElement;
  if(residentById.has(id)){conversation=createConversation(residents,id);previousStates=[];view='chat';}
  else{view='directory';group='all';}
  render();
  if(!dialog.open)dialog.showModal();
  document.body.classList.add('resident-chat-open');
  focusAfterRender(view==='chat'?'#resident-person-title':'#resident-directory-title');
 }
 function focusAfterRender(selector){
  requestAnimationFrame(()=>{if(dialog.open)dialog.querySelector(selector)?.focus({preventScroll:true});});
 }
 function showDirectory(){view='directory';render();focusAfterRender('#resident-directory-title');}
 function start(id){
  if(!residentById.has(id))return;
  conversation=createConversation(residents,id);previousStates=[];view='chat';
  render();focusAfterRender('#resident-person-title');
 }
 function showEvents(){previousView=view==='chat'?'chat':'directory';view='events';render();focusAfterRender('#resident-events-title');}
 function returnFromEvents(){view=previousView==='chat'&&conversation?'chat':'directory';render();focusAfterRender(view==='chat'?'#resident-person-title':'#resident-directory-title');}

 function directoryHtml(){
  const shown=residents.filter(resident=>group==='all'||resident.group===group);
  return `<section class="rc-directory"><div class="rc-directory-intro"><span class="rc-eyebrow">一聲招呼，就是故事的開始</span><h3 id="resident-directory-title" tabindex="-1">今天，想和誰聊聊？</h3><p>${residents.length} 位虛構街坊，把台南的日常說給你聽。<br>挑一個好奇的人，選一句話接著聊。</p></div><div class="rc-group-options" aria-label="依聊天主題選擇街坊">${groups.map(([id,label])=>`<button type="button" data-resident-group="${id}" aria-pressed="${group===id}">${label}</button>`).join('')}</div><div class="rc-resident-grid">${shown.map(resident=>`<button type="button" class="rc-person-card" data-resident="${esc(resident.id)}" aria-label="和${esc(resident.name)}聊聊：${esc(resident.teaser)}"><span class="rc-card-art">${portrait(resident)}<span class="rc-person-icon" aria-hidden="true">${esc(resident.icon||'☀')}</span></span><span class="rc-card-place">${esc(resident.home)}</span><strong>${esc(resident.name)}</strong><span class="rc-person-role">${esc(resident.role)}</span><span class="rc-teaser">${esc(resident.teaser)}</span><span class="rc-card-cta">打聲招呼 <span aria-hidden="true">↗</span></span></button>`).join('')}</div><div class="rc-directory-footer"><p>人物與對話是創作；地方資訊可從對話裡接著探索。<br>只用選項聊天，不需要姓名或聯絡資料。</p>${typeof onMission==='function'?'<button type="button" class="rc-text-button" data-resident-mission>想聊家的選擇 →</button>':''}</div></section>`;
 }
 function messageGroups(){
  const result=[];
  for(const turn of conversation?.turns||[]){
   const speaker=turn.speaker==='visitor'?'visitor':'resident';
   if(result.at(-1)?.speaker===speaker)result.at(-1).lines.push(turn.text);
   else result.push({speaker,lines:[turn.text]});
  }
  return result;
 }
 function messagesHtml(){
  const resident=selectedResident(),messages=messageGroups();
  return messages.map((message,index)=>`<div class="rc-message rc-${message.speaker}"${index===messages.length-1?' id="resident-latest-message" tabindex="-1"':''}>${message.speaker==='resident'?`<span class="rc-message-avatar">${portrait(resident,true)}</span>`:''}<div class="rc-bubble"><span class="rc-sr-only">${message.speaker==='resident'?esc(resident.name):'你'}說：</span>${message.lines.map(line=>`<p>${esc(line)}</p>`).join('')}</div></div>`).join('');
 }
 function repliesHtml(){
  const node=currentNode(residents,conversation),choices=node?.choices||[],actions=node?.actions||[];
  return `<div class="rc-replies" aria-labelledby="resident-reply-title"><p id="resident-reply-title" class="rc-reply-title">${choices.length?'你想怎麼接話？':'這段先聊到這裡，帶著好奇繼續走。'}</p>${choices.length?`<div class="rc-choice-list">${choices.map(choice=>`<button type="button" class="rc-choice" data-resident-reply="${esc(choice.id)}"><span>${esc(choice.label)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div>`:''}${actions.length?`<div class="rc-conversation-actions" aria-label="接著去看看">${actions.map((action,index)=>`<button type="button" data-resident-action="${index}">${esc(action.label)} <span aria-hidden="true">→</span></button>`).join('')}</div>`:''}<div class="rc-chat-tools">${previousStates.length?'<button type="button" class="rc-text-button" data-resident-undo>← 回上一句</button>':''}<button type="button" class="rc-text-button" data-resident-restart>重新聊</button><button type="button" class="rc-text-button" data-resident-directory>換位街坊</button>${typeof onFeedback==='function'?'<button type="button" class="rc-text-button rc-feedback" data-resident-feedback>補充在地故事</button>':''}</div></div>`;
 }
 function chatHtml(){
  const resident=selectedResident();
  if(!resident)return directoryHtml();
  return `<section class="rc-chat" aria-labelledby="resident-person-title"><header class="rc-chat-profile">${portrait(resident)}<div><span class="rc-eyebrow">${esc(resident.home)} · 安心城虛構居民</span><h3 id="resident-person-title" tabindex="-1">${esc(resident.name)}</h3><p>${esc(resident.role)}</p></div><span class="rc-profile-icon" aria-hidden="true">${esc(resident.icon||'☀')}</span></header>${resident.ambient?.length?`<p class="rc-ambient"><span aria-hidden="true">◌</span> ${esc(resident.ambient[0])}</p>`:''}<div class="rc-transcript" role="log" aria-live="off" aria-label="與${esc(resident.name)}的對話">${messagesHtml()}</div><div class="rc-replies-slot">${repliesHtml()}</div></section>`;
 }
 function sourceLinkHtml(source){
  const url=safeUrl(source.url);
  return `<li>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(source.title||source.name||'官方資料')} ↗</a>`:`<span>${esc(source.title||source.name||'官方資料')}</span>`}${source.publishedAt?`<small>公告：${esc(source.publishedAt)}</small>`:''}${source.reviewedAt?`<small>查核：${esc(source.reviewedAt)}</small>`:''}</li>`;
 }
 function eventCardHtml(event,status){
  const url=safeUrl(event.url),eventSources=[...new Set(event.sourceIds||[])].map(id=>sourceById.get(id)).filter(Boolean);
  const statusKey=['current','upcoming','past'].includes(status.key)?status.key:'past';
  return `<article class="rc-event-card" data-resident-event="${esc(event.id)}"><div class="rc-event-top"><span>${esc(event.district)}</span><span class="rc-event-status is-${statusKey}">${esc(status.label)}</span></div><h4>${esc(event.title)}</h4><p class="rc-event-dates"><time datetime="${esc(event.startDate)}">${esc(dateText(event.startDate))}</time><span>至</span><time datetime="${esc(event.endDate)}">${esc(dateText(event.endDate))}</time></p><p>${esc(event.summary)}</p>${event.note?`<p class="rc-event-note">${esc(event.note)}</p>`:''}${url?`<a class="rc-event-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">查看官方公告 <span aria-hidden="true">↗</span></a>`:''}<details class="rc-event-sources"><summary>官方來源與查核日期</summary><p>查核：${esc(residentReviewedAt)}</p>${eventSources.length?`<ul>${eventSources.map(sourceLinkHtml).join('')}</ul>`:url?`<ul><li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">活動官方公告 ↗</a></li></ul>`:'<p>來源尚待補齊，請至台南旅遊網確認。</p>'}</details></article>`;
 }
 function eventsHtml(){
  const now=new Date();currentDay=taipeiDay(now);
  const items=residentEvents.map(event=>({event,status:eventStatus(event,now)}));
  const active=items.filter(({status})=>status.key==='current'||status.key==='upcoming').sort((a,b)=>(a.status.key==='current'?0:1)-(b.status.key==='current'?0:1)||a.event.startDate.localeCompare(b.event.startDate));
  const past=items.filter(({status})=>status.key==='past').sort((a,b)=>b.event.endDate.localeCompare(a.event.endDate));
  return `<section class="rc-events"><div class="rc-events-heading"><span class="rc-eyebrow">把聊天，變成一次出門</span><h3 id="resident-events-title" tabindex="-1">這幾天，有什麼好走走？</h3><p>先看看公告，再決定哪天出發。</p></div><div class="rc-event-notice"><p>依公告日期判斷，場次、報名與異動請確認官方。</p><p>台灣日期：${esc(currentDay)} · 資料查核：${esc(residentReviewedAt)}</p></div>${active.length?`<div class="rc-event-grid">${active.map(({event,status})=>eventCardHtml(event,status)).join('')}</div>`:`<div class="rc-events-empty"><span aria-hidden="true">☀</span><h4>這一頁的活動，已經告一段落。</h4><p>目前整理的公告裡，沒有尚未結束的活動。<br>新的散步靈感，可以從官方行事曆找起。</p><a href="${calendarUrl}" target="_blank" rel="noopener noreferrer">查看台南官方活動行事曆 ↗</a></div>`}${past.length?`<details class="rc-past-events"><summary>已結束的活動 · ${past.length} 則</summary><p>留下作為地方故事；以下日期已結束。</p><div class="rc-event-grid">${past.map(({event,status})=>eventCardHtml(event,status)).join('')}</div></details>`:''}${active.length?`<p class="rc-calendar-more"><a href="${calendarUrl}" target="_blank" rel="noopener noreferrer">更多日期，查看台南官方活動行事曆 ↗</a></p>`:''}</section>`;
 }
 function render({keepScroll=false}={}){
  const oldScroll=dialog.querySelector('.rc-content')?.scrollTop||0;
  dialog.innerHTML=`<div class="rc-shell"><header class="rc-header"><div><span class="rc-eyebrow">安心城的日常</span><h2 id="resident-title">街坊聊聊</h2></div><div class="rc-header-tools">${readingButtonHtml()}<button type="button" class="rc-close" aria-label="關閉街坊聊聊">×</button></div></header><nav class="rc-viewbar" aria-label="街坊聊聊導覽">${view==='events'?`<button type="button" data-resident-return>← ${previousView==='chat'&&conversation?'回到聊天':'回到街坊'}</button>`:view==='chat'?'<button type="button" data-resident-directory>← 回到街坊</button>':'<span>在台南，聊一點生活。</span>'}${view!=='events'?'<button type="button" data-resident-events>近期活動 <span aria-hidden="true">↗</span></button>':'<span>出發前，再看一次官方公告</span>'}</nav><div class="rc-content${view==='chat'?' is-chat':''}">${view==='events'?eventsHtml():view==='chat'?chatHtml():directoryHtml()}</div></div>`;
  if(view==='chat')dialog.querySelector('.rc-header .rc-eyebrow').textContent=`跟${selectedResident()?.name||'街坊'}聊日常`;
  if(keepScroll)dialog.querySelector('.rc-content').scrollTop=oldScroll;
 }
 function updateConversation(){
  const transcript=dialog.querySelector('.rc-transcript');
  const replySlot=dialog.querySelector('.rc-replies-slot');
  if(!transcript||!replySlot){render();return;}
  transcript.innerHTML=messagesHtml();replySlot.innerHTML=repliesHtml();
  requestAnimationFrame(()=>{
   if(!dialog.open)return;
   const latest=dialog.querySelector('#resident-latest-message');
   latest?.focus({preventScroll:true});
   latest?.scrollIntoView({block:'start',behavior:'instant'});
  });
 }
 function refreshDate(){
  if(!dialog.open||view!=='events'||currentDay===taipeiDay())return;
  const active=document.activeElement;
  // Date rollover should not interrupt a reader who is using a source link.
  const focusWasContent=dialog.querySelector('.rc-content')?.contains(active);
  render({keepScroll:true});
  if(focusWasContent)focusAfterRender('#resident-events-title');
 }

 button.addEventListener('click',()=>open());
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('close',releaseFocus);
 dialog.addEventListener('click',event=>{
  const target=event.target.closest('button');
  if(!target||!dialog.contains(target))return;
  if(target.matches('.rc-close'))close();
  else if(target.hasAttribute('data-resident-group')){
   group=target.dataset.residentGroup;render();
   const next=Array.from(dialog.querySelectorAll('[data-resident-group]')).find(item=>item.dataset.residentGroup===group);next?.focus({preventScroll:true});
  }
  else if(target.hasAttribute('data-resident'))start(target.dataset.resident);
  else if(target.hasAttribute('data-resident-directory'))showDirectory();
  else if(target.hasAttribute('data-resident-events'))showEvents();
  else if(target.hasAttribute('data-resident-return'))returnFromEvents();
  else if(target.hasAttribute('data-resident-reply')&&conversation){
   const next=chooseReply(residents,conversation,target.dataset.residentReply);
   if(next&&next!==conversation){previousStates.push(conversation);conversation=next;updateConversation();}
  }
  else if(target.hasAttribute('data-resident-undo')&&previousStates.length){conversation=previousStates.pop();updateConversation();}
  else if(target.hasAttribute('data-resident-restart')&&conversation){const id=conversation.residentId;start(id);toast?.('已重新打聲招呼，這次可以換個話題。');}
  else if(target.hasAttribute('data-resident-action')&&conversation){
   const action=currentNode(residents,conversation)?.actions?.[Number(target.dataset.residentAction)];
   if(!action)return;
   if(action.kind==='events')showEvents();
   else if(typeof onExplore==='function'){close();onExplore(action);}
  }
  else if(target.hasAttribute('data-resident-mission')&&typeof onMission==='function'){close();onMission();}
  else if(target.hasAttribute('data-resident-feedback')&&typeof onFeedback==='function'){
   const resident=selectedResident(),context={section:'residents',residentId:resident?.id,residentName:resident?.name,nodeId:conversation?.nodeId,page:view};
   close();onFeedback(context);
  }
 });
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshDate();});
 return {open,close,refreshDate};
}
