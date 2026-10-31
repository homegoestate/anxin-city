import {fresh,view,advance,replay,restore,postcard,SOURCES,STORAGE_KEY} from './model.js';
import {mountStreetWorld,projectToStreet} from './walk-world.js';
import {CAST,STOPS,dialoguePages,sceneCast,nextDestination} from './presentation.js';
const root=document.getElementById('lantern-story');
import {CHARACTER_ASSETS} from './character-assets.js';
import {mountMissions} from './mission-ui.js';
const q=id=>root.querySelector('#'+id);
const element=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
const WALK_KEY='anxin-lantern-walk-v1';
let s=fresh(),storage=null,position={x:500,y:540},screen='walk',storyPage=0,customPage=0,custom=null,bookReturn='walk',greetingTimer=0;
let sceneryOnly=false,world=null,restartPending=false;
if(root.dataset.persist==='true')try{storage=window.localStorage;s=restore(storage.getItem(STORAGE_KEY));const p=JSON.parse(storage.getItem(WALK_KEY));if(p?.version===1)position=projectToStreet(p.position);}catch{}
function persist(){
 if(root.dataset.persist!=='true'){q('ls-save-note').textContent='本次試玩只留在這個畫面。';return;}
 try{if(!storage)throw Error('storage');storage.setItem(STORAGE_KEY,JSON.stringify({version:1,trail:s.trail}));storage.setItem(WALK_KEY,JSON.stringify({version:1,position}));q('ls-save-note').textContent='本章進度保存在這個瀏覽器；原版遊戲進度不變。';}
 catch{q('ls-save-note').textContent='這次可以繼續玩；瀏覽器目前無法保存進度。';}
}
function external(label,url){return {label,url};}
function sourceLink(source){const a=element('a',source.title+' ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function goWalk(target=null){screen='walk';custom=null;sceneryOnly=false;world?.pause();render();if(target)world?.walkTo(target);}
function showStory(){screen='story';custom=null;sceneryOnly=false;world?.pause();render();}
function showCustom(node){custom=node;customPage=0;screen='custom';sceneryOnly=false;world?.pause();render();}
function select(id){s=advance(s,id);storyPage=0;persist();if(s.node==='hub'){goWalk();return;}showStory();}
function culture(id,back=()=>goWalk()){
 const source=SOURCES[id];
 showCustom({chapter:'在街上遇見台南',scene:id==='temple'?'street':'windows',speaker:id==='temple'?'沫沫':'博伯',active:id==='temple'?'momo':'bo',title:id==='temple'?'原來，廟也住在街屋裡':'沒有船的街道，留下港口的故事',lines:id==='temple'?['金華府位在神農街，夾在兩棟街屋之間，是街屋型態的廟宇。','「它旁邊就是大家過日子的地方。」沫沫指著畫板，替廟門旁添了一個回家的人。']:['神農街舊稱北勢街，與昔日五條港的河港商業往來有關。','部分街段保留二層鋪瓦街屋，不同年代的立面，讓你抬頭就能多看見一層故事。'],choices:[{label:'回到剛才，繼續走',run:back},external('看官方介紹 ↗',source.url)]});
}
function office(){
 showCustom({chapter:'宏國地政｜易丞地政',scene:'shop',speaker:'楊代書｜街坊的專業夥伴',active:'yang',title:'家的事，一起問清楚。',lines:['「歡迎，先坐。」楊代書把資料袋往旁邊放，替你留下一個位置。','「選一位和你有共鳴的主角，陪他試一次。最後把你想問的，一起帶回來聊。」'],choices:[{label:'首購小安 · 第一間家',run:()=>missions.open('first-home')},{label:'換屋阿成 · 資金接力',run:()=>missions.open('move-home')},{label:'賣屋美玲 · 實拿帳',run:()=>missions.open('seller')},{label:'傳承一家 · 未來安排',run:()=>missions.open('legacy-family')}]});
}
function meet(id){
 if(id==='yang'){office();return;}
 if(id==='street'||id==='temple'){culture(id);return;}
 const choice=view(s).choices.find(c=>c.id==='visit-'+id);
 if(choice){select(choice.id);return;}
 if(id===nextDestination(s)&&s.node!=='hub'){showStory();return;}
 const names={aho:'文具店裡，還亮著燈',bo:'博伯替你留了半張長椅',momo:'畫板上，還有一個空位'};
 showCustom({chapter:'街坊打個招呼',scene:id==='bo'?'bench':id==='momo'?'street':'shop',speaker:CAST[id].name,active:id,title:names[id],lines:[CAST[id].greeting,id==='bo'?'「我們這一帶，以前叫北勢街。等你有空，我再慢慢講。」':id==='momo'?'「阿荷今晚要邀大家坐坐，我還在畫那張邀請卡。」':'「先去看看大家想替卡片留什麼，再一起掛起來。」'],choices:[{label:'接著今晚的邀請卡',run:()=>goWalk(nextDestination(s))},{label:'再散步一下',run:()=>goWalk()}]});
}
function actorAsset(stop,player){return CHARACTER_ASSETS[player?'xiaoan':stop?.id]?.calm;}
function mountWorld(){
 world?.destroy();
 world=mountStreetWorld(q('ls-world'),{district:{id:'lane',title:'府城巷弄',spawn:{x:500,y:540}},position,stops:STOPS,actorAsset,highlightStopId:nextDestination(s),onMove:p=>{position=p;persist();},onInteract:meet});
}
function showCast(node){
 const group=screen==='story'?sceneCast(s,node.speaker):{active:node.active||'yang',ids:['xiaoan',node.active||'yang']};
 const currentPage=screen==='story'?storyPage:customPage;
 q('ls-cast').replaceChildren();q('ls-cast').dataset.group=group.ids.length>2?'gathering':'pair';
 for(const id of group.ids){
  const wrap=element('div',undefined,'ls-person'+(id===group.active?' is-speaking':''));wrap.dataset.character=id;
  const b=element('button',undefined,'cursor-interaction');b.type='button';b.setAttribute('aria-label','向'+CAST[id].name+'打招呼');
  const sprite=element('img',undefined,'ls-sprite');sprite.alt='';sprite.width=246;sprite.height=410;sprite.src=CHARACTER_ASSETS[id][(id===group.active&&currentPage%2===0)||node.ending?'happy':'calm'];sprite.setAttribute('aria-hidden','true');
  b.append(sprite);b.addEventListener('click',()=>{sprite.src=CHARACTER_ASSETS[id].happy;q('ls-greeting').hidden=false;q('ls-greeting').textContent=CAST[id].greeting;clearTimeout(greetingTimer);greetingTimer=setTimeout(()=>{q('ls-greeting').hidden=true;},2800);});
  wrap.append(b,element('span',CAST[id].name,'ls-person-label'));q('ls-cast').append(wrap);
 }
}
function renderConversation(){
 const n=screen==='story'?view(s):custom;if(!n)return;
 const lines=n.fact?[...n.lines,n.fact.text]:n.lines, pages=dialoguePages(lines);
 const index=Math.min(screen==='story'?storyPage:customPage,pages.length-1);
 q('ls-scene').dataset.camera=n.scene;q('ls-chapter').textContent=n.chapter;q('ls-title').textContent=n.title;q('ls-speaker').textContent=n.speaker;
 q('ls-line').textContent=pages[index];q('ls-page-indicator').textContent=(index+1)+' / '+pages.length;
 q('ls-place').textContent=n.active==='yang'?'宏國地政｜易丞地政':n.scene==='bench'?'台南・長椅邊':n.scene==='shop'?'台南・巷口文具店':'台南・神農街的故事';
 q('ls-scene-caption').textContent=n.ending?'夜色裡，有人替你留了一個位置。':'點點人物，和他打聲招呼。';
 showCast(n);q('ls-greeting').hidden=true;clearTimeout(greetingTimer);
 q('ls-scene-card').hidden=!n.ending;q('ls-scene-card-title').textContent=postcard(s).title;
 q('ls-talk-panel').hidden=sceneryOnly;root.querySelector('.ls-conversation-grid').classList.toggle('is-scenery',sceneryOnly);
 q('ls-scene-only').textContent=sceneryOnly?'繼續聊天':'欣賞畫面';q('ls-scene-only').setAttribute('aria-pressed',String(sceneryOnly));
 const fact=n.fact?.source||n.source;q('ls-fact-open').hidden=!fact;q('ls-fact-open').onclick=()=>{const savedPage=storyPage;culture(fact,()=>{storyPage=savedPage;showStory();});};
 q('ls-choices').replaceChildren();
 const add=(label,run,url,id)=>{const b=element(url?'a':'button',undefined,'cursor-interaction');b.append(element('span',label),element('span',url?'↗':'→'));if(url){b.href=url;b.target='_blank';b.rel='noopener noreferrer';}else{b.type='button';b.addEventListener('click',run);}if(id)b.dataset.choice=id;q('ls-choices').append(b);};
 if(index<pages.length-1)add('繼續聽',()=>{if(screen==='story')storyPage++;else customPage++;renderConversation();},null,'next-line');
 else if(n.ending){add('把今晚收進手帳',()=>openBook());add('回街上，再走走',()=>goWalk());}
 else for(const c of n.choices)add(c.label,screen==='story'?()=>select(c.id):c.run,c.url,c.id);
 q('ls-back').disabled=index===0&&(screen!=='story'||!s.trail.length);
 q('ls-progress-note').textContent=screen==='story'?'你的選擇，會留在今晚的故事裡。':'想散步時，隨時回街上。';
}
function openBook(){bookReturn=screen;screen='book';world?.pause();render();}
function renderBook(){
 const host=q('ls-book-content');host.replaceChildren();
 const entry=(title,text,source)=>{const el=element('section',undefined,'ls-book-entry');el.append(element('h3',title),element('p',text));if(source)el.append(sourceLink(source));host.append(el);};
 const c=postcard(s);entry(s.heading?c.title:'今晚，巷口留一盞燈',s.trail.length?[c.past,c.today].join(' '):'還沒有開始也沒關係。走到文具店，阿荷會把故事交給你。');
 if(s.bo)entry('博伯留下的台南','神農街舊稱北勢街；街屋與港口的往來，替今天留下另一段時間。',SOURCES.street);
 if(s.momo)entry('沫沫畫裡的金華府','街屋型態的廟宇，讓你看見信仰與街坊生活的交會。',SOURCES.temple);
 if(!s.bo&&!s.momo)entry('街坊還在等你','認識鄰居後，這裡會留下你帶回來的故事。');
 entry('宏國地政｜易丞地政','散步時遇見問題，可以到街區右側找楊代書。房貸、賣屋與傳承工具，沿用各自原有的功能。');
 q('ls-replay').textContent=restartPending?'確定重新散步':'重新散步';
}
function render(){
 q('ls-walk-view').hidden=screen!=='walk';q('ls-life-view').hidden=screen!=='mission';q('ls-conversation').hidden=!['story','custom'].includes(screen);q('ls-notebook').hidden=screen!=='book';
 if(screen==='walk'){
  const target=nextDestination(s);q('ls-mission-tag').textContent=s.node==='hub'?'邀請卡的下一筆':s.node==='ending'?'今晚，你也是街坊了':'巷口有人在等你';
  q('ls-mission-text').textContent=s.node==='hub'?'走近博伯或沫沫，把他們的故事帶回來。':s.node==='ending'?'還可以回去找楊代書，或慢慢散步。':s.trail.length?'剛才的故事還在，走回'+CAST[target].name+'身邊接著聊。':'阿荷的邀請卡，好像還少了一點什麼。';
  root.querySelector('.ls-mini-portrait').src=CHARACTER_ASSETS[target].happy;
  q('ls-guide').textContent=s.node==='ending'?'找楊代書 →':'走去看看 →';
  world?.update({highlightStopId:s.node==='ending'?'yang':target});
 }else if(screen==='book')renderBook();else if(['story','custom'].includes(screen))renderConversation();
}
q('ls-guide').addEventListener('click',()=>world?.walkTo(s.node==='ending'?'yang':nextDestination(s)));
q('ls-back-map').addEventListener('click',()=>goWalk());
q('ls-office-shortcut').addEventListener('click',()=>goWalk('yang'));
q('ls-scene-only').addEventListener('click',()=>{sceneryOnly=!sceneryOnly;renderConversation();});
q('ls-back').addEventListener('click',()=>{if(screen==='story'){if(storyPage>0)storyPage--;else{s=replay(s.trail.slice(0,-1));storyPage=0;persist();if(s.node==='hub'){goWalk();return;}}}else customPage=Math.max(0,customPage-1);renderConversation();});
q('ls-book').addEventListener('click',()=>screen==='book'?(screen=bookReturn,render()):openBook());
q('ls-book-close').addEventListener('click',()=>{screen=bookReturn;restartPending=false;render();});
q('ls-replay').addEventListener('click',()=>{if(!restartPending){restartPending=true;renderBook();return;}s=fresh();position={x:500,y:540};storyPage=0;restartPending=false;persist();screen='walk';render();mountWorld();});
q('ls-copy').addEventListener('click',async()=>{
 const c=postcard(s),text=['安心城｜宏國地政｜易丞地政',c.title,c.past,c.today,c.place,'虛構街坊故事，不代表真實到訪或個案判斷。'].join('\n');
 try{await navigator.clipboard.writeText(text);q('ls-copy-status').textContent='已複製。可以留下來，也可以分享給朋友。';}
 catch{q('ls-copy-fallback').hidden=false;q('ls-copy-fallback').value=text;q('ls-copy-fallback').focus();q('ls-copy-fallback').select();q('ls-copy-status').textContent='請選取文字手動複製。';}
});
const missions=mountMissions({root,storage,onOpen:()=>{screen='mission';world?.pause();render();},onClose:()=>goWalk()});
persist();render();mountWorld();
