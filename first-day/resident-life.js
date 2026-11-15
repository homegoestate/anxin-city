const WALK_SPEED = 30;
const LINE_INTERVAL = 10;
const close = (a,b) => Math.hypot(a.x-b.x,a.y-b.y)<.05;
const point = value => value&&typeof value==='object'&&Number.isFinite(value.x)&&Number.isFinite(value.y);
const seedOf = id => [...id].reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,0);

/** One policy for every ambient pause source. No wall-clock catch-up after a pause. */
export function residentPauseReason({enabled=true,paused=false,hidden=false,reducedMotion=false,offscreen=false,modal=false,approaching=false,engaged=false,pointerHeld=false,destroyed=false}={}) {
  if(destroyed)return 'destroyed';
  if(!enabled)return 'disabled';
  if(reducedMotion)return 'reduced-motion';
  if(hidden)return 'hidden';
  if(offscreen)return 'offscreen';
  if(modal)return 'modal';
  if(paused)return 'paused';
  if(approaching)return 'approaching';
  if(engaged)return 'conversation';
  if(pointerHeld)return 'pointer';
  return null;
}

/** Copy and connect valid resident routes using the world's existing street planner. */
export function createResidentLife(configs,stops,{projectPoint,planRoute}={}) {
  if(!Array.isArray(configs)||!Array.isArray(stops)||typeof projectPoint!=='function'||typeof planRoute!=='function')return [];
  const used=new Set(),residents=[];
  for(const config of configs.slice(0,12)){
    if(!config||typeof config.id!=='string'||used.has(config.id)||!Array.isArray(config.route))continue;
    const stop=stops.find(item=>item.id===config.id&&item.kind==='resident');
    if(!stop||!point(stop))continue;
    const candidates=config.route.slice(0,24).filter(point).map(value=>projectPoint({x:value.x,y:value.y}));
    if(candidates.length<2)continue;
    const waypoints=[projectPoint({x:stop.x,y:stop.y})];
    for(const candidate of candidates)if(!close(waypoints.at(-1),candidate))waypoints.push(candidate);
    if(waypoints.length>1&&close(waypoints[0],waypoints.at(-1)))waypoints.pop();
    if(waypoints.length<2)continue;
    const segments=waypoints.map((from,index)=>planRoute(from,waypoints[(index+1)%waypoints.length]).map(value=>({...value})));
    if(segments.some(segment=>segment.length<2||segment.some(value=>!point(value))))continue;
    const lines=Array.isArray(config.lines)?config.lines.filter(value=>typeof value==='string').map(value=>value.trim().slice(0,120)).filter(Boolean).slice(0,12):[];
    const seed=seedOf(config.id);
    residents.push({id:config.id,x:waypoints[0].x,y:waypoints[0].y,facing:'right',phase:'standing',standRemaining:4+seed%4,segments,segmentIndex:0,pathIndex:1,stopsVisited:0,seed,lines});
    used.add(config.id);
  }
  return residents;
}

/** Advance one bounded frame without changing the previous state or route data. */
export function advanceResidentLife(resident,seconds,pauseReason=null) {
  if(pauseReason||!resident||!Number.isFinite(seconds)||seconds<=0)return resident;
  // A delayed foreground frame cannot make someone jump across a whole street.
  let remaining=Math.min(seconds,.1);
  const next={...resident};
  while(remaining>1e-8){
    if(next.phase==='standing'){
      const waited=Math.min(remaining,next.standRemaining);
      next.standRemaining-=waited;remaining-=waited;
      if(next.standRemaining>1e-8)break;
      next.phase='walking';
    }
    const path=next.segments[next.segmentIndex],goal=path[next.pathIndex];
    const gap=Math.hypot(goal.x-next.x,goal.y-next.y);
    if(Math.abs(goal.x-next.x)>.01)next.facing=goal.x>next.x?'right':'left';
    const travel=Math.min(gap,WALK_SPEED*remaining);
    if(gap>1e-8){next.x+=(goal.x-next.x)*travel/gap;next.y+=(goal.y-next.y)*travel/gap;remaining-=travel/WALK_SPEED;}
    if(travel+1e-8<gap)break;
    next.x=goal.x;next.y=goal.y;next.pathIndex++;
    if(next.pathIndex>=path.length){
      next.segmentIndex=(next.segmentIndex+1)%next.segments.length;next.pathIndex=1;
      next.stopsVisited++;next.phase='standing';next.standRemaining=4+(next.seed+next.stopsVisited)%4;
    }
  }
  return next;
}

/** One readable daily line at a time, alternating neighbors without callback bursts. */
export function createResidentDialogue(residents=[]){
  const entries=[];
  const count=Math.max(0,...residents.map(resident=>resident.lines.length));
  for(let line=0;line<count;line++)for(const resident of residents){
    if(resident.lines[line])entries.push({id:resident.id,text:resident.lines[line]});
  }
  return {entries,index:0,elapsed:0};
}

export function advanceResidentDialogue(dialogue,seconds,pauseReason=null){
  if(pauseReason||!dialogue||dialogue.entries.length<2||!Number.isFinite(seconds)||seconds<=0)return dialogue;
  const next={...dialogue,elapsed:dialogue.elapsed+Math.min(seconds,.1)};
  if(next.elapsed>=LINE_INTERVAL){next.elapsed-=LINE_INTERVAL;next.index=(next.index+1)%next.entries.length;}
  return next;
}
