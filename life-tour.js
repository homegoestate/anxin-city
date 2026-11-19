import { lifeStops, featuredStops, districtWalks, districtName, encounters, tourRegions, drawWalkMap } from './district-tour-data.js?v=27.0.0';
import { stampArt } from './life-encounters.js?v=26.0.0';
import { lifeFor } from './first-day/daylife-life-data.js';
import { dayStories } from './first-day/daylife-data.js?v=21.0.0';
import { tainanEvents } from './tainan-events.js';
import { eventStatus, taiwanDate } from './seasons-state.js';

const stopById = new Map(lifeStops.map(stop => [stop.id, stop]));
const stories = new Map([...dayStories, ...districtWalks].map(story => [story.id, story]));
const featuredIds = new Set(featuredStops.map(stop => stop.id));
// A postcard can lead into a fictional household's question wherever the player is walking.
function nextStory(stop){
  if(stop.districtId==='west-central')return '<button type="button" data-city-chapter="lantern">阿荷的邀請 · 今晚，巷口留一盞燈 →</button>';
  const region=regionOf.get(stop.id);
  const prompts={coast:['seller','陪美玲算一算，賣了房還剩多少？'],hills:['legacy-family','陪傳承一家想想，老家以後怎麼住？'],plains:['move-home','陪阿成排一排，換屋那天先搬去哪？'],city:['first-home','陪小安算一算，第一個家每月要付多少？']};
  const [id,label]=prompts[region]||prompts.city;
  return '<button type="button" data-city-mission="'+id+'">'+label+' →</button>';
}
const labelIds = new Set([...featuredIds, 'shanhua-morning', 'qigu-morning', 'baihe-morning', 'guiren-morning', 'longqi-morning']);
const mobileLabelIds = new Set(['beimen-evening','xinying-morning','shanhua-morning','yujing-morning','guanmiao-morning','shuixian-morning']);
const regionOf = new Map(tourRegions.flatMap(region => region.stops.map(stop => [stop.id, region.id])));
const districtFeatures = { beimen: '鹽田', yujing: '果園', anping: '劍獅', 'west-central': '市場', dongshan: '咖啡園', yanshui: '月津港' };
const statusText = { ongoing: '活動期間', upcoming: '即將開始', ended: '已結束' };
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let activeTour = null;

function sourceLink(url, title, checked) {
  if (!url || !title) return '';
  return `<div class="lt-source"><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(title)} <span aria-hidden="true">↗</span></a>${checked ? `<small>查核 ${escape(checked)}</small>` : ''}</div>`;
}

function localEvents(stop) {
  const today = taiwanDate();
  const order = { ongoing: 0, upcoming: 1, ended: 2 };
  return tainanEvents.filter(event => event.districtIds.includes(stop.districtId))
    .map(event => ({ event, status: eventStatus(event, today) }))
    .filter(row => row.status in order)
    .sort((a, b) => order[a.status] - order[b.status] || (a.status === 'ended'
      ? b.event.endDate.localeCompare(a.event.endDate) : a.event.startDate.localeCompare(b.event.startDate)));
}

function replyHtml(stop, topic, events) {
  if (topic === 'life') {
    const story = stories.get(stop.id);
    const context = story?.source ? `<div class="lt-fact"><strong>地方資料</strong><p>${escape(story.fact)}</p>${sourceLink(story.source.url, story.source.title, story.source.checkedAt)}</div>` : '';
    return `<p class="lt-question">${escape(stop.life.question)}</p><p>${escape(stop.life.answer)}</p>${context}`;
  }
  if (topic === 'facility') {
    const item = stop.facility;
    const extras = (stop.extraFacilities || []).map(extra => `<details class="lt-extra"><summary>${escape(extra.name)}</summary><p>${escape(extra.answer)}</p>${sourceLink(extra.url, extra.source, extra.checked)}</details>`).join('');
    return `<p class="lt-question">${escape(item.question)}</p><h3>${escape(item.name)}</h3><p>${escape(item.answer)}</p>${sourceLink(item.url, item.source, item.checked)}${extras}`;
  }
  if (topic === 'event') {
    return events.map(({ event, status }) => `<article class="lt-event"><small>${statusText[status]} · ${escape(event.dateLabel)}</small><h3>${escape(event.title)}</h3><p>${escape(event.venue)}</p><p class="lt-note">${escape(event.caution)}</p>${sourceLink(event.source.url, event.source.title, event.reviewedAt)}</article>`).join('');
  }
  return `<p>${escape(stop.hello)}</p>`;
}

// A marker can sit to either side of its model. The leader always ends at the projected anchor.
function projectLabels(layer, pins, rows, region) {
  const width = layer.clientWidth;
  const height = layer.clientHeight;
  if (!width || !height) return;
  const rects = [];
  const shown = new Set();
  const pinWidth = width < 520 ? 50 : 62;
  const pinHeight = width < 520 ? 31 : 35;
  const compact = width < 600;
  const dotPins = [];
  for (const { id, x, y, visible } of rows) {
    const pin = pins.get(id);
    if (!pin || !visible || (region && regionOf.get(id) !== region) || !Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (!region && !(compact ? mobileLabelIds : labelIds).has(id)) {
      dotPins.push({ id, x, y, pin });
      continue;
    }
    const left = Math.max(pinWidth / 2 + 4, Math.min(width - pinWidth / 2 - 4, x));
    const top = Math.max(pinHeight / 2 + 4, Math.min(height - pinHeight / 2 - 4, y - pinHeight / 2 - 8));
    const yOffsets = [0, -pinHeight - 5, pinHeight + 6, -2 * (pinHeight + 5), 2 * (pinHeight + 5)];
    const xOffsets = [0, -pinWidth / 2 - 3, pinWidth / 2 + 3, -pinWidth - 5, pinWidth + 5];
    let placement = null;
    for (const dx of xOffsets) {
      for (const dy of yOffsets) {
        const cx = left + dx, cy = top + dy;
        if (cx < pinWidth / 2 + 2 || cx > width - pinWidth / 2 - 2 || cy < pinHeight / 2 + 2 || cy > height - pinHeight / 2 - 2) continue;
        if (rects.some(rect => Math.abs(cx - rect.cx) < pinWidth + 3 && Math.abs(cy - rect.cy) < pinHeight + 3)) continue;
        const score = dx * dx + dy * dy;
        if (!placement || score < placement.score) placement = { cx, cy, score };
      }
    }
    if (!placement) { dotPins.push({ id, x, y, pin }); continue; }
    const { cx, cy } = placement;
    shown.add(id);
    rects.push(placement);
    pin.button.hidden = false;
    pin.button.dataset.compact = 'false';
    pin.button.style.transform = `translate(${Math.round(cx - pinWidth / 2)}px,${Math.round(cy - pinHeight / 2)}px)`;
    pin.line.hidden = false;
    pin.line.style.width = `${Math.hypot(cx - x, cy - y)}px`;
    pin.line.style.transform = `translate(${x}px,${y}px) rotate(${Math.atan2(cy - y, cx - x)}rad)`;
  }
  for (const {id, x, y, pin} of dotPins) {
    shown.add(id);
    pin.button.hidden = false;
    pin.button.dataset.compact = 'true';
    pin.button.style.transform = `translate(${Math.round(x - 10)}px,${Math.round(y - 10)}px)`;
    pin.line.hidden = true;
  }
  for (const [id, pin] of pins) {
    if (!shown.has(id)) pin.button.hidden = pin.line.hidden = true;
  }
}

const marketId = 'shuixian-morning';
const heldStamps = new Map();
const storageKey = id => `anxin-life-stamp.v1.${id}`;
function loadStamps() {
  for (const id of stopById.keys()) {
    try {
      const answer = localStorage.getItem(storageKey(id));
      if (answer === '0' || answer === '1') heldStamps.set(id, Number(answer));
    } catch { /* In private storage, stamps remain available for this visit. */ }
  }
}
function keepStamp(id, answer) {
  loadStamps();
  if (heldStamps.has(id)) return;
  heldStamps.set(id, answer);
  try { localStorage.setItem(storageKey(id), String(answer)); } catch { /* Keep the in-memory copy. */ }
}
const iconPaths = {
  book: '<path d="M5 3h13a1 1 0 0 1 1 1v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 1-2Zm0 14h14M8 3v14m3-10h5m-5 3h4"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15"/>',
  pin: '<path d="M18 9c0 4-6 10-6 10S6 13 6 9a6 6 0 1 1 12 0Z"/><circle cx="12" cy="9" r="2"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m1 3a5 5 0 0 1 4 5"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  pause: '<path d="M8 5v14m8-14v14" stroke-width="3.5"/>',
  play: '<path d="m8 5 11 7-11 7Z"/>',
  camera:'<path d="M3 7h4l2-3h6l2 3h4v13H3Z"/><circle cx="12" cy="13" r="3.5"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
const icon = kind => `<svg class="lt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[kind]}</svg>`;
const cardStyle = card => `--stamp-ink:${card.ink};--stamp-paper:${card.paper}`;
const emblem = card => `<span class="lt-emblem" style="${cardStyle(card)}">${stampArt(card)}</span>`;

export async function openLifeTour(initialStoryId, trigger, { overview: showOverview = false } = {}) {
  if (activeTour) {
    if (stopById.has(initialStoryId)) activeTour.choose(initialStoryId);
    else if (showOverview) activeTour.overview();
    return;
  }
  loadStamps();
  const returnTo = trigger instanceof HTMLElement ? trigger : document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.id = 'life-tour';
  dialog.className = 'lt-dialog';
  dialog.setAttribute('aria-labelledby', 'lt-title');
  dialog.dataset.render = 'loading';
  dialog.innerHTML = `<div class="lt-shell">
    <header class="lt-bar"><div class="lt-identity"><span class="lt-seal" aria-hidden="true">安</span><div><small>宏國地政 × 易丞地政 · 台南生活散步</small><h1 id="lt-title" tabindex="-1">不動產安心城</h1></div></div>
    <nav class="lt-header-actions" aria-label="安心城導覽"><a class="lt-atlas-entry" data-life-atlas-home data-city-chapter="atlas" href="./atlas/" aria-label="開啟台南 37 區生活圖鑑">生活圖鑑</a><button type="button" class="lt-exit" data-life-activities aria-haspopup="dialog">故事與任務 ${icon('book')}</button></nav></header>
    <main class="lt-main"><section class="lt-stage" aria-label="台南 37 區的街坊場景"><canvas class="lt-canvas" aria-hidden="true"></canvas><div class="lt-labels"></div>
      <div class="lt-static" hidden role="img" aria-label="街區散步插畫"><canvas class="lt-map-art" hidden></canvas></div>
      <div class="lt-map-tools"><button type="button" data-life-districts aria-haspopup="dialog">${icon('pin')} 37 區選單</button><button type="button" data-life-overview>${icon('map')} 全市全景</button>
      <label class="lt-region-filter"><span class="lt-sr">依主題顯示地圖標籤</span><select data-life-region><option value="">全區地標</option>${tourRegions.map(region => `<option value="${region.id}">${escape(region.name)}</option>`).join('')}</select></label></div>
      <div class="lt-play-tools"><button type="button" data-life-pause aria-label="暫停街景動畫" aria-pressed="false" title="暫停街景動畫">${icon('pause')}<span>暫停</span></button></div>
      <div class="lt-invite"></div>
      <div class="lt-map-caption"><p class="lt-hint"></p><small>街景為縮放意象</small></div>
    </section><aside class="lt-talk" aria-labelledby="lt-stop-title" hidden></aside></main>
    <nav class="lt-nav" aria-label="精選散步街區與手帖"><div class="lt-stops">${featuredStops.map(stop => `<button type="button" data-life-stop="${escape(stop.id)}" style="${cardStyle(encounters[stop.id])}" aria-pressed="false" aria-label="前往${escape(stop.name)}${escape(stop.title)}">${emblem(encounters[stop.id])}<span class="lt-stop-label"><strong>${districtName(stop)}</strong><small>${districtFeatures[stop.districtId]}</small></span></button>`).join('')}</div>
    <button type="button" data-life-album aria-label="開啟散步手帖">${icon('book')}<span>散步手帖</span><b data-life-count>0/${lifeStops.length}</b></button></nav>
    <span class="lt-sr" role="status" aria-live="polite" aria-atomic="true"></span></div>
    <dialog class="lt-mini" aria-labelledby="lt-mini-title"><div class="lt-mini-inner"></div></dialog>`;
  document.body.append(dialog);

  const stage = dialog.querySelector('.lt-stage');
  const labelLayer = dialog.querySelector('.lt-labels');
  const talk = dialog.querySelector('.lt-talk');
  const invite = dialog.querySelector('.lt-invite');
  const overviewButton = dialog.querySelector('[data-life-overview]');
  const regionPicker = dialog.querySelector('[data-life-region]');
  const pauseButton = dialog.querySelector('[data-life-pause]');
  const mini = dialog.querySelector('.lt-mini');
  const hint = dialog.querySelector('.lt-hint');
  const live = dialog.querySelector('[role="status"]');
  const pins = new Map();
  for (const stop of lifeStops) {
    const line = document.createElement('span');
    line.className = 'lt-tether';
    line.hidden = true;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lt-pin';
    button.dataset.lifePin = stop.id;
    const name = document.createElement('span');
    name.textContent = districtName(stop);
    button.append(name);
    button.dataset.region = regionOf.get(stop.id);
    button.setAttribute('aria-label', `走到${stop.name}，${stop.title}`);
    button.title = `${stop.name} · ${stop.title}`;
    button.hidden = true;
    labelLayer.append(line, button);
    pins.set(stop.id, { button, line });
  }
  let world = null;
  let selected = null;
  let guest = 'resident';
  let moveFocus = false;
  let events = [];
  let disposed = false;
  let textMode = false;
  let lastChoice = null;
  let labelRows = [];
  let mapShapes = null;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionQuery.matches;
  const canvas = stage.querySelector('canvas');
  const artCanvas = stage.querySelector('.lt-map-art');
  const personName = (stop, key) => key === 'neighbor' ? lifeFor(stop.id).neighbor : key === 'visitor' ? '散步客' : stop.resident;
  function updatePause() {
    const action = paused ? '播放' : '暫停';
    pauseButton.innerHTML = `${icon(paused ? 'play' : 'pause')}<span>${action}</span>`;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', `${action}街景動畫`);
    pauseButton.title = `${action}街景動畫`;
    world?.setPaused?.(paused);
  }
  function motionChange() { paused = motionQuery.matches; updatePause(); }
  motionQuery.addEventListener('change', motionChange);
  function updateButtons() {
    for (const button of dialog.querySelectorAll('[data-life-stop]')) {
      button.setAttribute('aria-pressed', String(button.dataset.lifeStop === selected));
      button.dataset.collected = String(heldStamps.has(button.dataset.lifeStop));
    }
    const count = `${heldStamps.size}/${lifeStops.length}`;
    dialog.querySelector('[data-life-count]').textContent = count;
    dialog.querySelector('[data-life-album]').setAttribute('aria-label', `開啟散步手帖，已收集 ${count} 枚街景章`);
    overviewButton.hidden = !selected;
  }
  function updateStatic() {
    if (!textMode) return;
    const stop = stopById.get(selected);
    const backdrop = stage.querySelector('.lt-static');
    artCanvas.hidden = true;
    backdrop.setAttribute('aria-label', stop ? `${stop.name} · ${stop.title}散步插圖` : '台南 37 區地圖');
    if (!stop) { backdrop.style.backgroundImage = 'url("./atlas/overview.svg")'; return; }
    if (featuredIds.has(stop.id)) {
      const day = stop.id.split('-').pop();
      backdrop.style.backgroundImage = `url("./first-day/daylife-${day}.webp")`;
    } else {
      backdrop.style.backgroundImage = 'url("./atlas/overview.svg")';
      if (mapShapes && drawWalkMap(artCanvas, mapShapes, stop)) {
        artCanvas.hidden = false;
        backdrop.style.backgroundImage = 'none';
      }
    }
  }
  const locationLabel = stop => escape(featuredIds.has(stop.id) ? stop.title : stop.resident);
  function showInvitation() {
    const stop = stopById.get(selected);
    if (!stop) {
      invite.innerHTML = `<div class="lt-overview-invite"><p>第一次來散步？</p><button type="button" data-life-enter>從水仙宮市場出發 ${icon('arrow')}</button></div>`;
      return;
    }
    const card = encounters[stop.id];
    invite.innerHTML = `<article class="lt-ticket" style="${cardStyle(card)}"><div class="lt-ticket-head"><div><p class="lt-loc">${icon('pin')}${escape(stop.name)} · ${locationLabel(stop)}</p><h2>${escape(card.title)}</h2></div>${emblem(card)}</div><p class="lt-teaser">${escape(card.teaser)}</p><div class="lt-ticket-actions"><button type="button" data-life-invite>${escape(card.invite)} ${icon('arrow')}</button>${featuredIds.has(stop.id) ? `<button type="button" data-life-people aria-label="看看街上的人">${icon('people')} 街坊</button>` : ''}</div></article>`;
    if(stop.districtId==='west-central')invite.querySelector('.lt-ticket').insertAdjacentHTML('beforeend','<div class="ca-invitation">'+nextStory(stop)+'</div>');
  }
  function street(id, focus = false, announce = true) {
    if (disposed || !stopById.has(id)) return;
    selected = id; guest = 'resident'; lastChoice = null;
    dialog.dataset.view = 'street'; dialog.dataset.stop = id;
    delete dialog.dataset.guest;
    talk.hidden = true; talk.replaceChildren();
    showInvitation(); updateButtons(); updateStatic();
    world?.street?.(id);
    hint.textContent = textMode ? '街區圖文導覽' : '點人物打招呼 · 拖曳環視';
    if (announce) window.dispatchEvent(new CustomEvent('life-tour-stop', {detail:{id}}));
    if (focus) invite.querySelector('[data-life-invite]')?.focus({preventScroll:true});
  }
  function playerChoices(choices, attr) {
    return `<div class="lt-choices">${choices.map((choice, i) => `<button type="button" ${attr}="${i}"><span aria-hidden="true" class="lt-choice-mark">${i ? '◇' : '○'}</span>${escape(choice)}${icon('arrow')}</button>`).join('')}</div>`;
  }
  function interaction(stop) {
    if (guest === 'neighbor') {
      const neighbor = lifeFor(stop.id);
      return `<p>${escape(neighbor.hello)}</p>${playerChoices(neighbor.replies.map(r => r.label), 'data-life-neighbor-answer')}`;
    }
    if (guest === 'visitor') return `<p>我剛走到${escape(stop.title)}，正想把這一站畫進手帖。你也在散步嗎？</p><button type="button" class="lt-text-link" data-life-person="resident">一起去找${escape(stop.resident)} ${icon('arrow')}</button>`;
    const card = encounters[stop.id];
    return `${featuredIds.has(stop.id) ? '' : `<p>${escape(stop.hello)}</p>`}<p class="lt-task-question">${escape(card.question)}</p>${playerChoices(card.choices.map(c => c[0]), 'data-life-answer')}`;
  }
  function arrive(id, key = guest) {
    if (disposed || selected !== id || guest !== key || dialog.dataset.view !== 'walking') return;
    const stop = stopById.get(id);
    dialog.dataset.view = 'arrived'; dialog.dataset.guest = guest;
    const who = personName(stop, guest);
    const card = encounters[id];
    events = localEvents(stop);
    talk.hidden = false;
    hint.textContent = textMode ? '街區圖文導覽' : '拖曳環視';
    talk.innerHTML = `<div class="lt-talk-inner" style="${cardStyle(card)}"><div class="lt-detail-top"><p class="lt-loc">${icon('pin')}${escape(stop.name)}${featuredIds.has(id) ? ' · '+escape(stop.title) : ''}</p><button type="button" data-life-return>回街上 ${icon('arrow')}</button></div>
      <div class="lt-neighbor"><span class="lt-portrait" aria-hidden="true">${stampArt(card)}</span><div><small class="lt-speaker">${escape(who)} · 故事角色</small><h2 id="lt-stop-title" tabindex="-1">${escape(guest === 'resident' ? card.title : guest === 'neighbor' ? lifeFor(id).role : '路上的招呼')}</h2></div></div>
      <div class="lt-topics" role="group" aria-label="選擇對話主題"><button type="button" data-life-topic="encounter" aria-pressed="true">${guest === 'resident' ? '街坊小事' : '打招呼'}</button>${guest === 'resident' ? `<button type="button" data-life-topic="life" aria-pressed="false">${featuredIds.has(id) ? '聊日常' : '認識地方'}</button>${stop.facility ? '<button type="button" data-life-topic="facility" aria-pressed="false">問建設</button>' : ''}${events.length ? '<button type="button" data-life-topic="event" aria-pressed="false">看活動</button>' : ''}` : ''}</div>
      <div class="lt-bubble"><div class="lt-reply" aria-live="polite">${interaction(stop)}</div></div>
      <nav class="lt-onward" aria-label="繼續探索本區"><button type="button" data-life-activities data-district="${escape(stop.districtId)}" aria-haspopup="dialog">在這裡接任務 ${icon('arrow')}</button>${featuredIds.has(id) ? `<a data-life-street data-city-chapter="first-day" href="./first-day/?walk=1&amp;scene=${encodeURIComponent(stop.id)}">自由走逛${escape(districtName(stop))}街區 ${icon('arrow')}</a>` : ''}<a data-life-atlas data-city-chapter="atlas" href="./atlas/?district=${encodeURIComponent(stop.districtId)}">${escape(districtName(stop))}生活圖鑑 ${icon('arrow')}</a></nav></div>`;
    const portrait = talk.querySelector('.lt-portrait');
    if (featuredIds.has(id) && guest !== 'visitor') import('./first-day/daylife-character-art.js?v=22.0.2').then(({daylifeActorArt}) => {
      if (portrait.isConnected) portrait.innerHTML = `<svg viewBox="-37 -108 74 78" aria-hidden="true" focusable="false">${daylifeActorArt({id:`${id}-${key}`,kind:'resident',portrait:key})}</svg>`;
    }).catch(() => {});
    talk.scrollTop = 0;
    live.textContent = `抵達${stop.name}，和${who}打個招呼。`;
    if (moveFocus) talk.querySelector('h2').focus({ preventScroll:true });
  }
  function choose(id, focus = true, key = 'resident') {
    const stop = stopById.get(id);
    if (!stop || disposed) return;
    if (!featuredIds.has(id) || !['resident','neighbor','visitor'].includes(key)) key = 'resident';
    if (selected === id && guest === key && dialog.dataset.view === 'arrived') {
      if (focus) talk.querySelector('h2').focus({preventScroll:true});
      return;
    }
    selected = id; guest = key; moveFocus = focus; lastChoice = null;
    dialog.dataset.view = 'walking'; dialog.dataset.stop = id; dialog.dataset.guest = key;
    talk.hidden = true; talk.replaceChildren();
    hint.textContent = `去找${personName(stop, guest)}…`;
    live.textContent = hint.textContent;
    updateButtons(); updateStatic();
    window.dispatchEvent(new CustomEvent('life-tour-stop', {detail:{id}}));
    if (textMode) arrive(id,key);
    else world?.walkTo(id,key);
  }
  function overview(focus = true, announce = true) {
    const former = selected;
    selected = null; guest = 'resident'; lastChoice = null;
    delete dialog.dataset.stop; delete dialog.dataset.guest;
    dialog.dataset.view = 'overview';
    talk.hidden = true; talk.replaceChildren(); showInvitation(); updateButtons(); updateStatic();
    if (announce) window.dispatchEvent(new CustomEvent('life-tour-stop', {detail:{id:null}}));
    world?.overview();
    hint.textContent = textMode ? '選擇行政區，開啟圖文散步' : '點地標出發 · 拖曳環視';
    live.textContent = '台南 37 區全景，選一處街坊出發。';
    if (focus && former) (dialog.querySelector(`[data-life-stop="${former}"]`) || dialog.querySelector('[data-life-districts]')).focus({preventScroll:true});
  }
  function fallback() {
    if (disposed || textMode) return;
    textMode = true;
    dialog.dataset.render = 'text';
    const old = world;
    world = null;
    old?.destroy();
    stage.querySelector('.lt-static').hidden = false;
    pauseButton.hidden = true;
    const photo = dialog.querySelector('[data-life-photo]');
    if (photo) photo.innerHTML = `${icon('camera')} 製作地圖明信片`;
    import('./atlas/geometry.js').then(({districtShapes}) => {
      if (!disposed) { mapShapes = districtShapes; updateStatic(); }
    }).catch(() => {});
    updateStatic();
    hint.textContent = '街區圖文導覽';
    if (dialog.dataset.view === 'walking') arrive(selected, guest);
  }
  function openMini(title, body, kind = '') {
    mini.dataset.kind = kind;
    mini.querySelector('.lt-mini-inner').innerHTML = `<header><h2 id="lt-mini-title">${escape(title)}</h2><button type="button" data-life-dismiss aria-label="關閉">${icon('close')}</button></header>${body}`;
    if (!mini.open) mini.showModal();
    mini.scrollTop = 0;
  }
  function districtMenu() {
    loadStamps();
    const groups = tourRegions.map(region => `<section class="lt-district-group" data-life-group="${region.id}" aria-labelledby="lt-group-${region.id}"><h3 id="lt-group-${region.id}">${escape(region.name)}</h3><div class="lt-district-grid">${region.stops.map(stop => {
      const here = stop.id === selected, has = heldStamps.has(stop.id);
      return `<button type="button" data-life-district="${stop.id}" aria-label="${escape(stop.name)}，${escape(stop.title)}${has ? '，已收章' : ''}"${here ? ' aria-current="location"' : ''}><span><strong>${escape(stop.name)}</strong><small>${escape(stop.title)}</small></span>${has ? '<span class="lt-directory-stamp" aria-hidden="true">✓</span>' : icon('arrow')}</button>`;
    }).join('')}</div></section>`).join('');
    openMini('選擇台南 37 區', `<label class="lt-district-search">找街區或地標<input type="search" data-life-search placeholder="例如：七股、鐵道" autocomplete="off"></label>${groups}<p class="lt-directory-empty" hidden role="status">找不到這個街區或地標，試試行政區名。</p>`, 'districts');
  }
  function filterDistricts(query) {
    const terms = query.trim().replaceAll('台','臺').split(/\s+/).filter(Boolean);
    let any = false;
    for (const group of mini.querySelectorAll('[data-life-group]')) {
      let visible = false;
      for (const button of group.querySelectorAll('[data-life-district]')) {
        const key = button.textContent.replaceAll('台','臺');
        button.hidden = !terms.every(term => key.includes(term));
        if (!button.hidden) visible = true;
      }
      group.hidden = !visible;
      if (visible) any = true;
    }
    mini.querySelector('.lt-directory-empty').hidden = any;
  }
  function people() {
    const stop = stopById.get(selected);
    const neighbor = lifeFor(selected);
    openMini(`${stop.title}的街坊`, `<div class="lt-person-list">${[['resident',stop.resident,encounters[selected].title],['neighbor',neighbor.neighbor,neighbor.role],['visitor','散步客','來街上走走的旅人']].map(([key,name,role]) => `<button type="button" data-life-person="${key}">${icon('people')}<span><strong>${escape(name)}</strong><small>${escape(role)}</small></span>${icon('arrow')}</button>`).join('')}</div>`);
  }
  function album() {
    loadStamps(); updateButtons();
    openMini('我的散步手帖', `<p class="lt-album-copy">${heldStamps.size === lifeStops.length ? '37 枚街景章都在這裡了。挑一枚，再去見見那位街坊。' : `與各區街坊完成一件小事，收下一枚街景章。已收集 ${heldStamps.size}／${lifeStops.length}。`}</p><div class="lt-album-grid">${lifeStops.map(stop => {
      const card = encounters[stop.id], has = heldStamps.has(stop.id);
      return `<button type="button" data-life-album-stop="${stop.id}" data-collected="${has}" style="${cardStyle(card)}" aria-label="${districtName(stop)}，${has ? '已收集' : '待收集'}，${escape(card.stamp)}，前往街區">${emblem(card)}<small>${districtName(stop)} · ${has ? '已收集' : '待收集'}</small><strong>${escape(card.stamp)}</strong></button>`;
    }).join('')}</div>`, 'album');
  }
  function answer(index) {
    const stop = stopById.get(selected);
    const card = encounters[selected];
    if (guest !== 'resident' || !card?.choices[index]) return;
    lastChoice = index;
    keepStamp(selected,index); updateButtons();
    const [memory,reply] = card.choices[index];
    talk.querySelector('.lt-reply').innerHTML = `<p class="lt-chosen">你選了「${escape(memory)}」</p><p>${escape(reply)}</p>
      <div class="lt-reward" data-life-stamp="${selected}" style="${cardStyle(card)}">${emblem(card)}<span><small>已收入散步手帖</small><strong>${escape(card.stamp)}</strong></span></div>
      <div class="lt-after"><button type="button" data-life-photo>${icon('camera')} ${textMode ? '製作地圖明信片' : '拍下眼前的街景'}</button><button type="button" data-life-retry>換個回答</button></div><div class="ca-invitation">${nextStory(stop)}</div>`;
    live.textContent = `${card.stamp}已收入手帖，目前收集 ${heldStamps.size} 枚街景章。`;
    talk.querySelector('.lt-after button')?.focus({preventScroll:true});
  }
  function close() {
    if (disposed) return;
    disposed = true;
    if (mini.open) mini.close();
    if (dialog.open) dialog.close();
    motionQuery.removeEventListener('change', motionChange);
    world?.destroy(); world = null; activeTour = null;
    dialog.remove();
    if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus({preventScroll:true});
    window.dispatchEvent(new CustomEvent('life-tour-close'));
  }
  mini.addEventListener('click', e => { if (e.target === mini) mini.close(); });
  mini.addEventListener('input', event => {
    if (event.target.matches('[data-life-search]')) filterDistricts(event.target.value);
  });
  regionPicker.addEventListener('change', () => {
    projectLabels(labelLayer, pins, labelRows, regionPicker.value);
  });
  dialog.addEventListener('cancel', event => {
    if (event.target !== dialog) return;
    event.preventDefault();
    if (selected) overview();
    else dialog.querySelector('header [data-life-activities]').click();
  });
  dialog.addEventListener('close', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    const d = button.dataset;
    if ('lifeDistricts' in d) districtMenu();
    else if ('lifeDistrict' in d) { mini.close(); street(d.lifeDistrict,true); }
    else if ('lifeOverview' in d) overview();
    else if ('lifeEnter' in d) street(marketId,true);
    else if ('lifeReturn' in d) street(selected,true);
    else if ('lifeStop' in d) choose(d.lifeStop);
    else if ('lifePin' in d) choose(d.lifePin);
    else if ('lifeInvite' in d) choose(selected);
    else if ('lifePause' in d) { paused = !paused; updatePause(); live.textContent = paused ? '街景動畫已暫停。' : '街景動畫播放中。'; }
    else if ('lifePeople' in d) people();
    else if ('lifeAlbum' in d) album();
    else if ('lifeDismiss' in d) mini.close();
    else if ('lifeAlbumStop' in d) { mini.close(); street(d.lifeAlbumStop,true); }
    else if ('lifePerson' in d) { if (mini.open) mini.close(); choose(selected,true,d.lifePerson); }
    else if ('lifeAnswer' in d) answer(Number(d.lifeAnswer));
    else if ('lifeNeighborAnswer' in d) {
      const reply = lifeFor(selected).replies[Number(d.lifeNeighborAnswer)];
      if (reply) talk.querySelector('.lt-reply').innerHTML = `<p>${escape(reply.text)}</p><button type="button" class="lt-text-link" data-life-retry>再聊一句 ${icon('arrow')}</button>`;
      talk.querySelector('[data-life-retry]')?.focus({preventScroll:true});
    } else if ('lifeRetry' in d) {
      lastChoice = null;
      talk.querySelector('.lt-reply').innerHTML = interaction(stopById.get(selected));
      talk.querySelector('.lt-reply button')?.focus({preventScroll:true});
    } else if ('lifePhoto' in d) {
      const id = selected, choice = lastChoice;
      const stop = stopById.get(id);
      try {
        const {openPostcard} = await import('./life-postcard.js?v=27.0.0');
        if (disposed || !button.isConnected || selected !== id) return;
        let source;
        if (textMode) {
          if (!mapShapes) mapShapes = (await import('./atlas/geometry.js')).districtShapes;
          if (disposed || !button.isConnected || selected !== id) return;
          source = document.createElement('canvas');
          if (!drawWalkMap(source, mapShapes, stop)) throw new Error('Canvas unavailable');
        } else source = world?.captureFrame();
        openPostcard({source,stop,memory:encounters[id].choices[choice]?.[0] || '',trigger:button});
      } catch { live.textContent = '這張街景暫時無法拍下，請再試一次。'; }
    } else if (d.lifeTopic && selected) {
      for (const item of talk.querySelectorAll('[data-life-topic]')) item.setAttribute('aria-pressed',String(item === button));
      const stop = stopById.get(selected);
      lastChoice = null;
      talk.querySelector('.lt-reply').innerHTML = d.lifeTopic === 'encounter' ? interaction(stop) : replyHtml(stop,d.lifeTopic,events);
      talk.scrollTop = 0;
    }
  });
  activeTour = {choose, overview};
  if (stopById.has(initialStoryId)) choose(initialStoryId,false);
  else if (showOverview) overview(false,false);
  else street(marketId,false,false);
  updatePause();
  dialog.showModal();
  dialog.querySelector('#lt-title').focus({preventScroll:true});
  try {
    const {createLifeWorld} = await import('./life-world.js?v=27.0.0');
    if (disposed) return;
    const initialStreet = dialog.dataset.view === 'street' ? selected : null;
    const created = await createLifeWorld({canvas,initialStreet,onChoose:id => choose(id),onResident:(id,key) => choose(id,true,key),onArrive:arrive,onError:fallback,
      onSelectLabels:rows => {
        if (!disposed && !textMode && dialog.dataset.view === 'overview') {
          labelRows = rows;
          projectLabels(labelLayer,pins,rows,regionPicker.value);
        }
      }});
    if (disposed || textMode) { created?.destroy(); return; }
    world = created;
    dialog.dataset.render = '3d';
    updatePause();
    if (dialog.dataset.view === 'walking') world.walkTo(selected,guest);
    else if (dialog.dataset.view === 'street' && selected !== initialStreet) world.street?.(selected);
    else if (dialog.dataset.view === 'overview' && initialStreet) world.overview();
  } catch { fallback(); }
}
