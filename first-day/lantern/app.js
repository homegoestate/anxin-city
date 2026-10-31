import {fresh,view,advance,replay,restore,postcard,SOURCES,STORAGE_KEY} from './model.js';
const root=document.getElementById('lantern-story');
const q=id=>root.querySelector('#'+id);
const element=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
const CAST={
 xiaoan:{name:'小安',src:'./assets/xiaoan.svg'},
 aho:{name:'阿荷',src:'./assets/aho.svg',role:'文具店老闆',intro:'「今晚想邀大家在巷口坐坐。這張邀請卡，還少了一點什麼。」阿荷把畫攤在桌上，招手請你過來。'},
 bo:{name:'博伯',src:'./assets/bo.svg',role:'整理舊街故事的鄰居',intro:'「現在看不到船，這條街以前卻和港口有關。」博伯拍拍長椅，手邊留著一本舊街筆記。'},
 momo:{name:'沫沫',src:'./assets/momo.svg',role:'抱著畫板的街坊',intro:'「房子都畫了，怎麼還不太像我們這裡？」沫沫指著畫裡空白的街道，等你一起看看。'}
};
let screen='map',neighbor=null,culture=null;
let storage=null,s=fresh();
if(root.dataset.persist==='true'){try{storage=window.localStorage;s=restore(storage.getItem(STORAGE_KEY));}catch{}}
function persist(){
 if(root.dataset.persist!=='true'){q('ls-save-note').textContent='本次試玩只留在畫面中；原安心城的資料與進度不受影響。';return;}
 try{if(!storage)throw new Error('unavailable');storage.setItem(STORAGE_KEY,JSON.stringify({version:1,trail:s.trail}));q('ls-save-note').textContent='本章進度僅保留在這個瀏覽器，可接著玩。';}
 catch{q('ls-save-note').textContent='目前無法保存進度；這次仍可玩，重新整理會從開場開始。';}
}
function link(source){const a=element('a',source.title+' ↗','ls-source-link');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function choose(id){s=advance(s,id);screen='story';persist();render();}
function portrait(img,id){img.setAttribute('src',CAST[id].src);img.setAttribute('alt',CAST[id].name);}
function presentCast(n){
 const active=n.speaker.startsWith('阿荷')?'aho':n.speaker.startsWith('博伯')?'bo':n.speaker.startsWith('沫沫')?'momo':'xiaoan';
 let ids=['xiaoan',active==='xiaoan'?'aho':active];
 if(s.node.startsWith('bo-'))ids=['xiaoan','bo'];
 if(s.node.startsWith('momo-'))ids=['xiaoan','momo'];
 if(s.node==='quiet')ids=['xiaoan'];
 if(['hub','rain','rain-after','card','hang','ending'].includes(s.node))ids=['xiaoan','aho','bo','momo'];
 q('ls-cast').replaceChildren();q('ls-cast').dataset.group=ids.length>2?'gathering':'pair';
 for(const id of ids){const f=element('figure',undefined,'ls-person'+(id===active?' ls-speaking':''));f.dataset.character=id;const img=element('img');portrait(img,id);img.width=68;img.height=118;f.append(img,element('figcaption',CAST[id].name));q('ls-cast').append(f);}
 portrait(q('ls-speaker-portrait'),active);
}
function renderMap(){
 const n=view(s);q('ls-map-view').hidden=screen!=='map';q('ls-story-view').hidden=screen!=='story';q('ls-map-return').hidden=screen==='map';
 const c=neighbor?CAST[neighbor]:null;portrait(q('ls-welcome-portrait'),neighbor||'xiaoan');
 q('ls-map-speaker').textContent=c?c.name+' · '+c.role:'小安 · 剛搬來的新鄰居';
 q('ls-map-title').textContent=c?'先認識'+c.name:s.trail.length?'你剛才走到：'+n.chapter:'巷口那張畫，好像還沒畫完。';
 q('ls-map-text').textContent=c?c.intro:s.trail.length?'剛才的選擇還在。逛逛這一帶，再回到故事裡也可以。':'行李先放下了。文具店的阿荷正在搬椅子，博伯和沫沫也在。先走過去看看吧。';
 const canVisit=neighbor&&n.choices.some(c=>c.id==='visit-'+neighbor);
 q('ls-enter').textContent=canVisit?'走過去，找'+c.name+'聊聊 →':s.trail.length?'接著剛才的故事 →':'走到文具店，故事開始 →';
 for(const id of ['aho','bo','momo'])q('ls-map-'+id).setAttribute('aria-pressed',String(neighbor===id));
 q('ls-culture').hidden=!culture;q('ls-culture').replaceChildren();
 for(const id of ['street','temple'])q('ls-culture-'+id).setAttribute('aria-expanded',String(culture===id));
 if(culture){
  const text=culture==='street'?'神農街舊稱北勢街，過去與五條港的河港商業往來密切。抬頭看部分二層街屋，還能讀到不同年代留下的樣貌。':'金華府位在神農街，是夾在兩棟街屋之間的廟宇。它讓人看見地方信仰與街坊生活共享一條街的樣子。';
  q('ls-culture').append(element('strong',culture==='street'?'街名裡，留著港口的日子':'廟宇，也可以是街屋的一員'),element('p',text),link(SOURCES[culture]),element('p','資料查核：2026-10-31。圖中位置為虛構，不作導航。','ls-muted'));
 }
}
function render(){
 const n=view(s);root.querySelector('.ls-scene').dataset.camera=n.scene;
 renderMap();presentCast(n);
 q('ls-chapter').textContent=n.chapter;q('ls-speaker').textContent=n.speaker;q('ls-title').textContent=n.title;
 q('ls-lines').replaceChildren(...n.lines.map(t=>element('p',t)));
 if(n.source)q('ls-lines').append(link(SOURCES[n.source]));
 q('ls-moment').textContent=n.scene==='night'?'夜色裡，有人替你留了一個位置':n.scene==='rain'?'簷角又落下幾滴雨':'雨後，傍晚的巷口';
 q('ls-fact').hidden=!n.fact;q('ls-fact').replaceChildren();
 if(n.fact)q('ls-fact').append(element('strong',n.fact.title),element('p',n.fact.text),link(SOURCES[n.fact.source]));
 q('ls-inventory').hidden=!n.item;q('ls-inventory').textContent=n.item||'';
 const card=postcard(s);q('ls-postcard').hidden=!n.card;
 q('ls-card-title').textContent=card.title;q('ls-card-past').textContent=card.past;q('ls-card-today').textContent=card.today;q('ls-card-place').textContent=card.place;
 q('ls-hanging').hidden=!n.ending;q('ls-card-caption').textContent=card.title;
 q('ls-choices').replaceChildren();q('ls-spots').replaceChildren();q('ls-spots').hidden=!n.pause;
 for(const c of n.choices){
   const b=element('button',undefined,'cursor-interaction');b.type='button';b.dataset.choice=c.id;b.append(element('span',c.label),element('span','→'));b.addEventListener('click',()=>choose(c.id));q('ls-choices').append(b);
   if(c.spot){const spot=element('button',c.id==='visit-bo'?'找博伯':'找沫沫','cursor-interaction');spot.type='button';spot.setAttribute('aria-label',c.label);spot.addEventListener('click',()=>choose(c.id));q('ls-spots').append(spot);}
 }
 q('ls-back').disabled=s.trail.length===0;q('ls-pause').hidden=!n.pause;q('ls-ending').hidden=!n.ending;
 q('ls-copy-status').textContent='';q('ls-copy-fallback').hidden=true;
}
q('ls-back').addEventListener('click',()=>{s=replay(s.trail.slice(0,-1));persist();render();});
q('ls-pause').addEventListener('click',()=>choose('quiet'));
q('ls-replay').addEventListener('click',()=>{s=fresh();screen='map';neighbor=null;culture=null;persist();render();});
q('ls-map-return').addEventListener('click',()=>{screen='map';neighbor=null;render();});
q('ls-enter').addEventListener('click',()=>{const id='visit-'+neighbor;if(view(s).choices.some(c=>c.id===id)){choose(id);return;}screen='story';render();});
for(const id of ['aho','bo','momo'])q('ls-map-'+id).addEventListener('click',()=>{neighbor=id;renderMap();});
for(const id of ['street','temple'])q('ls-culture-'+id).addEventListener('click',()=>{culture=culture===id?null:id;renderMap();});
q('ls-copy').addEventListener('click',async()=>{
 const card=postcard(s),text=[card.title,card.past,card.today,card.place,'安心城｜台南街坊故事・虛構情節'].join('\n');
 try{await navigator.clipboard.writeText(text);q('ls-copy-status').textContent='已複製，可留給自己或分享給朋友。';}
 catch{q('ls-copy-fallback').hidden=false;q('ls-copy-fallback').value=text;q('ls-copy-fallback').focus();q('ls-copy-fallback').select();q('ls-copy-status').textContent='請選取文字手動複製。';}
});
persist();render();
