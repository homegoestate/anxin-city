import { streetSceneArt, personArt, stopArt } from './street-art.js?v=16.0.0';

const X_ROADS = [130,360,500,620,870];
const Y_ROADS = [220,440,540];
const BOUNDS = {left:60,right:940,top:175,bottom:565};
const SPEED = 205;
const TALK_DISTANCE = 68;
const APPROACH_DISTANCE = 48;
const EPSILON = 0.05;
const DIRECTIONS = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const KEYS = {ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const finite = (n,fallback) => Number.isFinite(Number(n)) ? Number(n) : fallback;
const same = (a,b) => Math.abs(a-b)<EPSILON;
let worldNumber=0;

/** Return a point on the shared, fully connected street network. */
export function projectToStreet(point={x:500,y:540}) {
  if(!point||typeof point!=='object')point={x:500,y:540};
  const p={x:clamp(finite(point.x,500),BOUNDS.left,BOUNDS.right),y:clamp(finite(point.y,540),BOUNDS.top,BOUNDS.bottom)};
  const candidates=[...Y_ROADS.map(y=>({x:p.x,y})),...X_ROADS.map(x=>({x,y:p.y}))];
  return candidates.reduce((best,next)=>distance(p,next)<distance(p,best)?next:best,candidates[0]);
}

/** Small Dijkstra graph, including the current position and arbitrary street destinations. */
export function planStreetRoute(from,to) {
  const start=projectToStreet(from),end=projectToStreet(to),nodes=[];
  const add=p=>{let i=nodes.findIndex(n=>same(n.x,p.x)&&same(n.y,p.y));if(i<0){nodes.push(p);i=nodes.length-1;}return i;};
  const first=add(start),last=add(end);
  for(const y of Y_ROADS) for(const x of [BOUNDS.left,...X_ROADS,BOUNDS.right]) add({x,y});
  for(const x of X_ROADS) for(const y of [BOUNDS.top,BOUNDS.bottom]) add({x,y});
  const costs=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),pending=new Set(nodes.map((_,i)=>i));
  costs[first]=0;
  while(pending.size){
    let at=-1;
    for(const i of pending) if(at<0||costs[i]<costs[at]) at=i;
    if(at===last||!Number.isFinite(costs[at])) break;
    pending.delete(at);
    for(const next of pending){
      const a=nodes[at],b=nodes[next];
      const vertical=same(a.x,b.x)&&X_ROADS.some(x=>same(x,a.x));
      const horizontal=same(a.y,b.y)&&Y_ROADS.some(y=>same(y,a.y));
      if(!vertical&&!horizontal) continue;
      const cost=costs[at]+distance(a,b);
      if(cost<costs[next]){costs[next]=cost;previous[next]=at;}
    }
  }
  if(!Number.isFinite(costs[last])) return [start];
  const route=[];
  for(let i=last;i>=0;i=previous[i]){route.unshift({...nodes[i]});if(i===first)break;}
  // Only retain actual turns. Intermediate intersections remain part of the road.
  return route.filter((p,i)=>i===0||i===route.length-1||!((same(route[i-1].x,p.x)&&same(p.x,route[i+1].x))||(same(route[i-1].y,p.y)&&same(p.y,route[i+1].y))));
}

/** Leave room for two full sprites while staying within the existing talk radius. */
export function approachStopPosition(stop) {
  const location=projectToStreet(stop);
  return Y_ROADS.some(y=>same(y,location.y))
    ? {x:clamp(location.x-APPROACH_DISTANCE,BOUNDS.left,BOUNDS.right),y:location.y}
    : {x:location.x,y:clamp(location.y+APPROACH_DISTANCE,BOUNDS.top,BOUNDS.bottom)};
}

function mapStopName(stop) {
  if(stop.kind!=='office')return esc(stop.name);
  const brands=String(stop.name??'').split(/\s*×\s*/);
  return `<span class="street-office-name">${brands.map((brand,index)=>`<span>${index?'<b class="street-office-times" aria-hidden="true">×</b> ':''}${esc(brand)}</span>`).join('')}</span>`;
}

function stepOnRoad(position,direction,amount) {
  const d=DIRECTIONS[direction];
  if(!d)return {...position};
  if(d.x){
    const y=Y_ROADS.find(value=>Math.abs(value-position.y)<9);
    if(y===undefined)return {...position};
    return {x:clamp(position.x+d.x*amount,BOUNDS.left,BOUNDS.right),y};
  }
  const x=X_ROADS.find(value=>Math.abs(value-position.x)<9);
  if(x===undefined)return {...position};
  return {x,y:clamp(position.y+d.y*amount,BOUNDS.top,BOUNDS.bottom)};
}

function cleanStops(stops,district) {
  return (Array.isArray(stops)?stops:[]).filter(stop=>stop&&typeof stop.id==='string'&&(!stop.district||stop.district===district)&&Number.isFinite(Number(stop.x))&&Number.isFinite(Number(stop.y))).map(stop=>({...stop,x:Number(stop.x),y:Number(stop.y)}));
}

/** The host owns story/state. This world emits settled movement and explicit interactions only. */
export function mountStreetWorld(container,{district,position,stops=[],onMove=()=>{},onInteract=()=>{},reducedMotion=false,highlightStopId=null}={}) {
  if(!container||typeof container.replaceChildren!=='function')throw new TypeError('A street map host is required.');
  const doc=container.ownerDocument,win=doc.defaultView;
  const prefix=`street-world-${++worldNumber}`;
  let currentDistrict=district||{id:'lane',title:'府城巷弄',spawn:{x:500,y:540}};
  let player=projectToStreet(position||currentDistrict.spawn),lastEmitted={...player};
  let visibleStops=cleanStops(stops,currentDistrict.id),targetId=null,route=[],routeIndex=0;
  let highlightedStopId=typeof highlightStopId==='string'?highlightStopId:null;
  let destroyed=false,raf=0,lastTime=0,nearId=null,moving=false,facing='right',lastManualDirection=null;
  let held=new Map(),pointerDirections=new Map(),listeners=[],stage,svg,actors,playerGroup,routeLine,routeDot,nearButton,live,status,destinationList,stopLayer;
  const media=win.matchMedia?.('(prefers-reduced-motion: reduce)');
  let reduce=Boolean(reducedMotion||media?.matches);
  const listen=(element,type,handler,options)=>{element.addEventListener(type,handler,options);listeners.push(()=>element.removeEventListener(type,handler,options));};
  const say=message=>{if(live&&live.textContent!==message)live.textContent=message;};

  function emitMove(){
    if(distance(player,lastEmitted)<.1)return;
    lastEmitted={...player};
    onMove({x:Math.round(player.x*10)/10,y:Math.round(player.y*10)/10});
  }
  function setMoving(value){
    if(moving===value)return;
    moving=value;
    playerGroup?.classList.toggle('is-walking',value&&!reduce);
    stage?.classList.toggle('is-walking',value);
  }
  function nearest(){
    let best=null;
    for(const stop of visibleStops)if(distance(player,stop)<=TALK_DISTANCE&&(!best||distance(player,stop)<distance(player,best)))best=stop;
    return best;
  }
  function refreshNear(){
    const stop=nearest(),next=stop?.id||null;
    if(next===nearId&&nearButton.dataset.ready!==undefined)return;
    nearId=next;nearButton.dataset.ready='true';
    nearButton.disabled=!stop;
    nearButton.innerHTML=stop?`<span aria-hidden="true">${stop.kind==='place'?'◇':'✦'}</span> ${esc(stop.kind==='place'?'看看':'聊聊')}・${esc(stop.name)}`:'<span aria-hidden="true">◇</span> 走近人物或地標';
    nearButton.setAttribute('aria-label',stop?`${stop.kind==='place'?'觀察':'和'}${stop.name}${stop.kind==='place'?'':'交談'}`:'走近人物或地標後互動');
    stopLayer.querySelectorAll('[data-stop]').forEach(button=>button.classList.toggle('is-near',button.dataset.stop===next));
    if(stop&&!route.length)say(`附近有${stop.name}。按 E、Enter 或空白鍵${stop.kind==='place'?'觀察':'交談'}。`);
  }
  function refreshHighlight(){
    const activeId=visibleStops.some(stop=>stop.id===highlightedStopId)?highlightedStopId:null;
    for(const button of [...stopLayer.querySelectorAll('[data-stop]'),...destinationList.querySelectorAll('[data-stop]')]){
      const active=button.dataset.stop===activeId;
      button.classList.toggle('is-clue',active);
      const badge=button.querySelector('.street-clue-label,.street-destination-clue');
      if(badge)badge.hidden=!active;
      button.setAttribute('aria-label',`${active?'目前任務線索；':''}${button.dataset.label}`);
    }
    actors.querySelectorAll('[data-actor-stop]').forEach(actor=>actor.classList.toggle('is-clue',actor.dataset.actorStop===activeId));
  }
  function renderPlayer(){
    playerGroup.setAttribute('transform',`translate(${player.x.toFixed(2)} ${player.y.toFixed(2)})`);
    playerGroup.dataset.facing=facing;
    // Depth follows feet; destination labels stay in an independent HTML layer.
    const after=[...actors.children].find(child=>child!==playerGroup&&Number(child.dataset.y)>player.y);
    if(after){if(playerGroup.nextElementSibling!==after)actors.insertBefore(playerGroup,after);}
    else if(actors.lastElementChild!==playerGroup)actors.append(playerGroup);
    refreshNear();
  }
  function drawRoute(){
    const remaining=route.length?[player,...route.slice(routeIndex)]:[];
    routeLine.setAttribute('points',remaining.map(p=>`${p.x},${p.y}`).join(' '));
    routeLine.style.display=remaining.length?'':'none';
    routeDot.style.display=remaining.length?'':'none';
    if(remaining.length){const end=remaining.at(-1);routeDot.setAttribute('cx',end.x);routeDot.setAttribute('cy',end.y);}
  }
  function cancelFrame(){if(raf)win.cancelAnimationFrame(raf);raf=0;lastTime=0;setMoving(false);}
  function stopMovement(notify=true){
    cancelFrame();route=[];routeIndex=0;targetId=null;held.clear();pointerDirections.clear();lastManualDirection=null;
    container.querySelectorAll('[data-direction]').forEach(button=>button.classList.remove('is-held'));
    drawRoute();
    if(notify)emitMove();
    if(status)status.textContent='沿著街道慢慢走';
    refreshNear();
  }
  function openStop(id){
    const stop=visibleStops.find(item=>item.id===id);
    if(!stop||distance(player,stop)>TALK_DISTANCE||destroyed||doc.hidden)return;
    stopMovement(true);
    say(`${stop.kind==='place'?'觀察':'遇見'}${stop.name}。`);
    onInteract(id);
  }
  function finishRoute(){
    const arrivedId=targetId;
    route=[];routeIndex=0;targetId=null;cancelFrame();drawRoute();renderPlayer();emitMove();
    status.textContent=arrivedId?'已經走到了':'到了，看看附近吧';
    if(arrivedId)openStop(arrivedId);
    else say('小安停下腳步。可以點下一個地方，或和附近的人聊聊。');
  }
  function ensureFrame(){if(!raf&&!destroyed&&!doc.hidden){lastTime=0;raf=win.requestAnimationFrame(tick);}}
  function beginRoute(to,id=null){
    if(destroyed||doc.hidden)return;
    cancelFrame();held.clear();lastManualDirection=null;targetId=id;
    route=planStreetRoute(player,to);routeIndex=route.length>1?1:route.length;
    const stop=visibleStops.find(item=>item.id===id);
    status.textContent=stop?`走向${stop.name}…`:'小安正在散步…';
    say(stop?`小安沿著街道走向${stop.name}，抵達後會${stop.kind==='place'?'打開地方故事':'開始交談'}。`:'小安沿著街道走向你點的位置。');
    drawRoute();
    if(routeIndex>=route.length){finishRoute();return;}
    if(reduce){player={...route.at(-1)};finishRoute();return;}
    setMoving(true);ensureFrame();
  }
  function walkTo(id){
    const stop=visibleStops.find(item=>item.id===id);
    if(!stop||destroyed)return false;
    const approach=approachStopPosition(stop);
    stage.focus({preventScroll:true});beginRoute(approach,id);return true;
  }
  function manualDirections(){return [...pointerDirections.values(),...held.values()];}
  function tick(time){
    raf=0;if(destroyed||doc.hidden){cancelFrame();return;}
    const dt=lastTime?Math.min((time-lastTime)/1000,.04):1/60;lastTime=time;
    if(route.length){
      let budget=SPEED*dt;
      while(budget>0&&routeIndex<route.length){
        const goal=route[routeIndex],d=distance(player,goal);
        if(goal.x!==player.x)facing=goal.x>player.x?'right':'left';
        if(d<=budget){player={...goal};budget-=d;routeIndex++;}
        else {player={x:player.x+(goal.x-player.x)*budget/d,y:player.y+(goal.y-player.y)*budget/d};budget=0;}
      }
      renderPlayer();drawRoute();
      if(routeIndex>=route.length){finishRoute();return;}
      setMoving(true);raf=win.requestAnimationFrame(tick);return;
    }
    const directions=manualDirections();
    if(!directions.length){cancelFrame();emitMove();return;}
    const preferred=directions.at(-1);
    let next=stepOnRoad(player,preferred,SPEED*dt),used=preferred;
    // Holding a direction through an intersection allows a buffered turn.
    if(distance(next,player)<.1&&lastManualDirection&&directions.includes(lastManualDirection)){
      used=lastManualDirection;next=stepOnRoad(player,used,SPEED*dt);
    }
    if(distance(next,player)<.1){
      cancelFrame();emitMove();status.textContent='沿街道走，到路口再轉彎';
      say('這裡是街道邊緣。請沿街道走，到路口再轉彎。');return;
    }
    if(DIRECTIONS[used].x)facing=DIRECTIONS[used].x>0?'right':'left';
    player=next;lastManualDirection=used;setMoving(true);renderPlayer();status.textContent='小安正在散步…';raf=win.requestAnimationFrame(tick);
  }
  function startManual(direction,key){
    if(route.length){route=[];targetId=null;routeIndex=0;drawRoute();}
    held.delete(key);held.set(key,direction);ensureFrame();
  }
  function releaseManual(key){
    held.delete(key);
    if(!manualDirections().length&&!route.length){cancelFrame();emitMove();status.textContent='沿著街道慢慢走';refreshNear();}
    else ensureFrame();
  }
  function nudge(direction){
    const next=stepOnRoad(player,direction,65);
    if(distance(next,player)<.1){say('請沿街道走，到路口再轉彎。');return;}
    beginRoute(next);
  }
  function populateStops(){
    const actorMarkup=[...visibleStops].sort((a,b)=>a.y-b.y).map((stop,i)=>`<g class="street-npc" data-actor-stop="${esc(stop.id)}" data-y="${stop.y}" transform="translate(${stop.x} ${stop.y})"><ellipse class="street-clue-ring" cy="3" rx="28" ry="12" fill="#f8e8b3" fill-opacity=".5" stroke="#b17d2e" stroke-width="4"/>${stopArt(stop,i)}</g>`).join('');
    actors.innerHTML=actorMarkup;
    playerGroup=doc.createElementNS('http://www.w3.org/2000/svg','g');
    playerGroup.setAttribute('class','street-player');playerGroup.innerHTML=`<ellipse class="street-player-ring" cy="4" rx="24" ry="10" fill="none" stroke="#f8f3d2" stroke-width="4"/>${personArt('guide',true)}<path d="M-6-107 0-100l6-7z" fill="#2b7460"/>`;
    actors.append(playerGroup);
    stopLayer.innerHTML=visibleStops.map(stop=>`<button type="button" class="street-stop-button ${stop.kind==='place'?'is-place':''} ${stop.kind==='office'?'is-office':''}" data-stop="${esc(stop.id)}" data-label="走到${esc(stop.name)}${stop.kind==='place'?'，閱讀地方故事':'，和他交談'}" style="left:${stop.x/10}%;top:${(stop.y-78)/6.2}%"><span class="street-clue-label" aria-hidden="true" hidden>線索</span><span class="street-stop-label"><i aria-hidden="true">${stop.kind==='place'?'◇':stop.kind==='office'?'⌂':'●'}</i><span>${mapStopName(stop)}</span></span></button>`).join('');
    destinationList.innerHTML=visibleStops.map(stop=>`<button type="button" class="street-destination ${stop.kind==='office'?'is-office':''}" data-stop="${esc(stop.id)}" data-label="走到${esc(stop.name)}，${esc(stop.role|| (stop.kind==='place'?'地方故事':'街區居民'))}"><span class="street-destination-icon" aria-hidden="true">${stop.kind==='place'?'◇':stop.kind==='office'?'⌂':'●'}</span><span><strong>${esc(stop.name)}</strong><small>${esc(stop.role|| (stop.kind==='place'?'地方故事':'街區居民'))}</small><span class="street-destination-clue" aria-hidden="true" hidden>目前任務線索</span></span><span aria-hidden="true">↗</span></button>`).join('');
    refreshHighlight();
    nearId=null;delete nearButton.dataset.ready;renderPlayer();
    playerGroup.classList.toggle('is-walking',moving&&!reduce);
  }
  function build(){
    const directionButtons=[['up','↑','向上走'],['left','←','向左走'],['down','↓','向下走'],['right','→','向右走']].map(([direction,arrow,label])=>`<button type="button" data-direction="${direction}" aria-label="${label}">${arrow}</button>`).join('');
    container.innerHTML=`<div class="street-world" data-district="${esc(currentDistrict.id)}"><div class="street-map-top"><span><i aria-hidden="true"></i>${esc(currentDistrict.title)}<small>・想像街區</small></span><span class="street-walk-status">沿著街道慢慢走</span></div><div class="street-stage" tabindex="0" role="group" aria-label="${esc(currentDistrict.title)}，可步行街區" aria-describedby="${prefix}-instructions"><svg class="street-map-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" aria-hidden="true" focusable="false"><g class="street-scenery">${streetSceneArt(currentDistrict.id)}</g><polyline class="street-route" fill="none" stroke="#668f75" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 12"/><circle class="street-route-dot" r="12" fill="#f6e4ad" stroke="#54836e" stroke-width="3"/><g class="street-actors"></g></svg><div class="street-stop-layer"></div><span class="street-map-badge">小安的散步地圖 <span aria-hidden="true">↗</span></span></div><div class="street-world-controls"><div class="street-control-copy"><p id="${prefix}-instructions"><b>點人物或地標，小安就會走過去。</b><span>也能點地面散步；方向鍵 / WASD 移動，到路口轉彎，E / Enter / 空白鍵互動。</span></p><button type="button" class="street-near-button" disabled>走近人物或地標</button></div><div class="street-dpad" role="group" aria-label="步行方向控制">${directionButtons}<span aria-hidden="true">步行</span></div></div><details class="street-destination-menu"><summary>街區目的地 <span>點一個地方，開始走</span></summary><div class="street-destinations"></div></details><p class="street-world-live street-visually-hidden" role="status" aria-live="polite" aria-atomic="true"></p></div>`;
    stage=container.querySelector('.street-stage');svg=container.querySelector('.street-map-svg');actors=container.querySelector('.street-actors');routeLine=container.querySelector('.street-route');routeDot=container.querySelector('.street-route-dot');stopLayer=container.querySelector('.street-stop-layer');nearButton=container.querySelector('.street-near-button');status=container.querySelector('.street-walk-status');live=container.querySelector('.street-world-live');destinationList=container.querySelector('.street-destinations');
    populateStops();drawRoute();
    listen(stage,'click',event=>{
      if(event.target.closest('button,a'))return;
      const rect=svg.getBoundingClientRect();if(!rect.width||!rect.height)return;
      const point={x:(event.clientX-rect.left)/rect.width*1000,y:(event.clientY-rect.top)/rect.height*620};
      stage.focus({preventScroll:true});beginRoute(point);
    });
    listen(stage,'keydown',event=>{
      if(event.target!==stage||event.altKey||event.ctrlKey||event.metaKey)return;
      const direction=KEYS[event.key];
      if(direction){event.preventDefault();if(!event.repeat)startManual(direction,event.code||event.key);return;}
      if(['e','E','Enter',' '].includes(event.key)){event.preventDefault();if(!event.repeat&&nearId)openStop(nearId);}
      if(event.key==='Escape'){event.preventDefault();stopMovement();say('小安停下腳步。');}
    });
    listen(stage,'keyup',event=>{if(KEYS[event.key]){event.preventDefault();releaseManual(event.code||event.key);}});
    listen(stage,'blur',()=>{if(held.size){held.clear();if(!pointerDirections.size)stopMovement();}});
    listen(nearButton,'click',()=>{if(nearId)openStop(nearId);});
    listen(container.querySelector('.street-world'),'click',event=>{
      const destination=event.target.closest('[data-stop]');
      if(destination)walkTo(destination.dataset.stop);
    });
    for(const button of container.querySelectorAll('[data-direction]')){
      listen(button,'pointerdown',event=>{
        if(event.button!==0)return;event.preventDefault();stage.focus({preventScroll:true});
        if(route.length){route=[];targetId=null;routeIndex=0;drawRoute();}
        button.setPointerCapture?.(event.pointerId);pointerDirections.set(event.pointerId,button.dataset.direction);button.classList.add('is-held');ensureFrame();
      });
      const release=event=>{
        pointerDirections.delete(event.pointerId);button.classList.remove('is-held');
        if(!manualDirections().length){cancelFrame();emitMove();status.textContent='沿著街道慢慢走';refreshNear();}
      };
      listen(button,'pointerup',release);listen(button,'pointercancel',release);listen(button,'lostpointercapture',release);
      listen(button,'click',event=>{if(event.detail===0)nudge(button.dataset.direction);});
    }
  }
  build();
  const sceneListenerCount=()=>listeners.length;
  // Scene listeners are removed on district replacement; environment listeners remain separate.
  let sceneCount=sceneListenerCount();
  const hide=()=>{if(doc.hidden)stopMovement();};
  const blur=()=>stopMovement();
  const reduceChanged=event=>{
    // The option seeds the initial preference; later OS changes work in both directions.
    reduce=Boolean(event.matches);
    playerGroup?.classList.toggle('is-walking',moving&&!reduce);
    if(reduce&&route.length){player={...route.at(-1)};finishRoute();}
  };
  doc.addEventListener('visibilitychange',hide);win.addEventListener('blur',blur);
  media?.addEventListener?.('change',reduceChanged);

  return {
    walkTo,
    update(next={}){
      if(destroyed)return;
      if(Object.prototype.hasOwnProperty.call(next,'highlightStopId'))highlightedStopId=typeof next.highlightStopId==='string'?next.highlightStopId:null;
      const changed=next.district&&next.district.id!==currentDistrict.id;
      if(changed){
        stopMovement(false);
        listeners.splice(0,sceneCount).forEach(remove=>remove());
        currentDistrict=next.district;player=projectToStreet(next.position||currentDistrict.spawn);lastEmitted={...player};nearId=null;
        visibleStops=cleanStops(next.stops||[],currentDistrict.id);build();sceneCount=listeners.length;
      }else{
        if(next.district)currentDistrict=next.district;
        if(next.stops){visibleStops=cleanStops(next.stops,currentDistrict.id);populateStops();}
        if(targetId&&!visibleStops.some(stop=>stop.id===targetId))stopMovement();
        refreshHighlight();
      }
    },
    destroy(){
      if(destroyed)return;
      destroyed=true;cancelFrame();held.clear();pointerDirections.clear();route=[];
      listeners.forEach(remove=>remove());listeners=[];
      doc.removeEventListener('visibilitychange',hide);win.removeEventListener('blur',blur);media?.removeEventListener?.('change',reduceChanged);
      container.replaceChildren();
    },
  };
}
