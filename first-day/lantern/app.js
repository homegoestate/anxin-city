import {fresh,view,advance,replay,restore,postcard,SOURCES,STORAGE_KEY} from './model.js';
const root=document.getElementById('lantern-story');
const q=id=>root.querySelector('#'+id);
const element=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
let storage=null,s=fresh();
if(root.dataset.persist==='true'){try{storage=window.localStorage;s=restore(storage.getItem(STORAGE_KEY));}catch{}}
function persist(){
 if(root.dataset.persist!=='true'){q('ls-save-note').textContent='本次試玩只留在畫面中；原安心城的資料與進度不受影響。';return;}
 try{if(!storage)throw new Error('unavailable');storage.setItem(STORAGE_KEY,JSON.stringify({version:1,trail:s.trail}));q('ls-save-note').textContent='本章進度僅保留在這個瀏覽器，可接著玩。';}
 catch{q('ls-save-note').textContent='目前無法保存進度；這次仍可玩，重新整理會從開場開始。';}
}
function link(source){const a=element('a',source.title+' ↗','ls-source-link');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function choose(id){s=advance(s,id);persist();render();}
function render(){
 const n=view(s);root.querySelector('.ls-scene').dataset.camera=n.scene;
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
q('ls-replay').addEventListener('click',()=>{s=fresh();persist();render();});
q('ls-copy').addEventListener('click',async()=>{
 const card=postcard(s),text=[card.title,card.past,card.today,card.place,'安心城｜台南街坊故事・虛構情節'].join('\n');
 try{await navigator.clipboard.writeText(text);q('ls-copy-status').textContent='已複製，可留給自己或分享給朋友。';}
 catch{q('ls-copy-fallback').hidden=false;q('ls-copy-fallback').value=text;q('ls-copy-fallback').focus();q('ls-copy-fallback').select();q('ls-copy-status').textContent='請選取文字手動複製。';}
});
persist();render();
