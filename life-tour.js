import { lifeStops } from './life-places.js';
import { dayStories } from './first-day/daylife-data.js?v=21.0.0';
import { tainanEvents } from './tainan-events.js';
import { eventStatus, taiwanDate } from './seasons-state.js';

const stopById = new Map(lifeStops.map(stop => [stop.id, stop]));
const stories = new Map(dayStories.map(story => [story.id, story]));
const districtNames = { beimen: '北門', yujing: '玉井', anping: '安平', 'west-central': '中西', dongshan: '東山', yanshui: '鹽水' };
const districtFeatures = { beimen: '鹽田', yujing: '果園', anping: '劍獅', 'west-central': '市場', dongshan: '咖啡園', yanshui: '月津港' };
const statusText = { ongoing: '活動期間', upcoming: '即將開始', ended: '已結束' };
const districtName = stop => districtNames[stop.districtId] || stop.name;
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
function projectLabels(layer, pins, rows, selected) {
  const width = layer.clientWidth;
  const height = layer.clientHeight;
  if (!width || !height) return;
  const rects = [];
  const shown = new Set();
  const pinWidth = width < 520 ? 50 : 62;
  const pinHeight = width < 520 ? 31 : 35;
  for (const { id, x, y, visible } of rows) {
    const pin = pins.get(id);
    if (!pin || !visible || (selected && id !== selected) || !Number.isFinite(x) || !Number.isFinite(y)) continue;
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
    if (!placement) continue;
    const { cx, cy } = placement;
    shown.add(id);
    rects.push(placement);
    pin.button.hidden = false;
    pin.button.style.transform = `translate(${Math.round(cx - pinWidth / 2)}px,${Math.round(cy - pinHeight / 2)}px)`;
    pin.line.hidden = false;
    pin.line.style.width = `${Math.hypot(cx - x, cy - y)}px`;
    pin.line.style.transform = `translate(${x}px,${y}px) rotate(${Math.atan2(cy - y, cx - x)}rad)`;
  }
  for (const [id, pin] of pins) {
    if (!shown.has(id)) pin.button.hidden = pin.line.hidden = true;
  }
}

export async function openLifeTour(initialStoryId, trigger) {
  if (activeTour) {
    if (stopById.has(initialStoryId)) activeTour.choose(initialStoryId);
    return;
  }
  const returnTo = trigger instanceof HTMLElement ? trigger : document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.id = 'life-tour';
  dialog.className = 'lt-dialog';
  dialog.setAttribute('aria-labelledby', 'lt-title');
  dialog.dataset.view = 'overview';
  dialog.dataset.render = 'loading';
  dialog.innerHTML = `<div class="lt-shell">
    <header class="lt-bar"><div class="lt-identity"><span class="lt-seal" aria-hidden="true">安</span><div><small>宏國地政 × 易丞地政</small><h1 id="lt-title" tabindex="-1">台南生活散步</h1></div></div><nav class="lt-header-actions" aria-label="安心城其他入口"><a class="lt-atlas-entry" data-life-atlas-home href="./atlas/" aria-label="開啟台南 37 區生活地圖">37 區<span>生活</span>地圖</a><button type="button" class="lt-exit" data-life-close aria-label="回安心城，開啟人生任務與試算"><span aria-hidden="true">↗</span> 人生任務與試算</button></nav></header>
    <main class="lt-main"><section class="lt-stage" aria-label="台南六區立體地景示意"><canvas class="lt-canvas" aria-hidden="true"></canvas><div class="lt-labels"></div>
      <div class="lt-invite"><h2>今天，陪小安去哪裡？</h2><p>到北門跟阿海看鹽田，<br>或去玉井找阿禾聊芒果。</p></div>
      <div class="lt-static" hidden><img src="./atlas/overview.svg" alt="" width="240" height="240"><div><strong>台南街坊文字導覽</strong><p>選一區，聽居民聊日常，也看看當地的公共建設。</p></div></div>
      <div class="lt-map-tools"><button type="button" data-life-overview hidden><span aria-hidden="true">←</span> 六區全景</button></div>
      <div class="lt-map-caption"><p class="lt-hint">準備立體地景中…</p><small>地景與設施為區內意象，位置及距離經縮放。</small></div></section>
      <aside class="lt-talk" aria-labelledby="lt-stop-title" hidden></aside>
    </main>
    <nav class="lt-nav" aria-label="選擇散步地區"><span class="lt-nav-title">選擇地區</span><div class="lt-stops">${lifeStops.map(stop => `<button type="button" data-life-stop="${escape(stop.id)}" aria-pressed="false"><span>${escape(districtName(stop))}</span><small>${escape(districtFeatures[stop.districtId])}</small></button>`).join('')}</div></nav>
    <span class="lt-sr" role="status" aria-live="polite" aria-atomic="true"></span></div>`;
  document.body.append(dialog);

  const stage = dialog.querySelector('.lt-stage');
  const labelLayer = dialog.querySelector('.lt-labels');
  const talk = dialog.querySelector('.lt-talk');
  const overviewButton = dialog.querySelector('[data-life-overview]');
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
    button.textContent = districtName(stop);
    button.setAttribute('aria-label', `走到${stop.name}`);
    button.hidden = true;
    labelLayer.append(line, button);
    pins.set(stop.id, { button, line });
  }
  let world = null;
  let selected = null;
  let queuedFocus = false;
  let events = [];
  let disposed = false;
  let textMode = false;
  const canvas = stage.querySelector('canvas');
  function useCamera() { dialog.dataset.interacted = 'true'; }
  canvas.addEventListener('pointerdown', useCamera, { passive: true });
  canvas.addEventListener('wheel', useCamera, { passive: true });

  function updateButtons() {
    for (const button of dialog.querySelectorAll('[data-life-stop]')) {
      button.setAttribute('aria-pressed', String(button.dataset.lifeStop === selected));
    }
    overviewButton.hidden = !selected;
  }
  function arrive(id) {
    if (disposed || id !== selected || dialog.dataset.view === 'arrived') return;
    const stop = stopById.get(id);
    const resident = stop.resident;
    dialog.dataset.view = 'arrived';
    talk.hidden = false;
    hint.textContent = textMode ? '' : '拖曳環視 · 地景示意';
    events = localEvents(stop);
    talk.innerHTML = `<div class="lt-talk-inner"><div class="lt-neighbor"><span class="lt-portrait" aria-hidden="true"></span><div><small>${escape(stop.name)} · 街坊故事</small><h2 id="lt-stop-title" tabindex="-1">${escape(stop.title)}</h2></div></div>
      <div class="lt-topics" role="group" aria-label="選擇對話主題"><button type="button" data-life-topic="life" aria-pressed="false">聊日常</button><button type="button" data-life-topic="facility" aria-pressed="false">問建設</button>${events.length ? '<button type="button" data-life-topic="event" aria-pressed="false">看活動</button>' : ''}</div>
      <div class="lt-bubble"><div class="lt-speaker">${escape(resident)}<small>故事角色</small></div><div class="lt-reply" aria-live="polite">${replyHtml(stop, null, events)}</div></div>
      <nav class="lt-onward" aria-label="繼續探索本區"><a data-life-street href="./first-day/?walk=1&amp;scene=${encodeURIComponent(stop.id)}">走進${escape(districtName(stop))}街區 <span aria-hidden="true">→</span></a><a data-life-atlas href="./atlas/?district=${encodeURIComponent(stop.districtId)}">${escape(districtName(stop))}生活圖鑑 <span aria-hidden="true">→</span></a></nav></div>`;
    const portrait = talk.querySelector('.lt-portrait');
    import('./first-day/daylife-character-art.js?v=22.0.2').then(({ daylifeActorArt }) => {
      if (portrait.isConnected) portrait.innerHTML = `<svg viewBox="-40 -113 80 86" aria-hidden="true" focusable="false">${daylifeActorArt({ id: `${id}-resident`, kind: 'resident' })}</svg>`;
    }).catch(() => {});
    talk.scrollTop = 0;
    live.textContent = `抵達${stop.name}，可以和${resident}聊聊了。`;
    if (queuedFocus) talk.querySelector('h2').focus({ preventScroll: true });
  }
  function choose(id, moveFocus = true) {
    const stop = stopById.get(id);
    if (!stop || disposed) return;
    if (selected === id) {
      if (dialog.dataset.view === 'arrived' && moveFocus) talk.querySelector('h2').focus({ preventScroll: true });
      return;
    }
    selected = id;
    queuedFocus = moveFocus;
    dialog.dataset.view = 'walking';
    dialog.dataset.stop = id;
    talk.hidden = true;
    talk.replaceChildren();
    hint.textContent = `正在走向${stop.name}…`;
    live.textContent = hint.textContent;
    updateButtons();
    window.dispatchEvent(new CustomEvent('life-tour-stop', { detail: { id } }));
    if (textMode) arrive(id);
    else world?.walkTo(id);
  }
  function overview() {
    const former = selected;
    selected = null;
    queuedFocus = false;
    delete dialog.dataset.stop;
    delete dialog.dataset.interacted;
    dialog.dataset.view = 'overview';
    talk.hidden = true;
    talk.replaceChildren();
    updateButtons();
    window.dispatchEvent(new CustomEvent('life-tour-stop', { detail: { id: null } }));
    world?.overview();
    hint.textContent = textMode ? '' : '點地名出發 · 拖曳環視';
    live.textContent = '已回到六區全景。';
    if (former) dialog.querySelector(`[data-life-stop="${former}"]`)?.focus({ preventScroll: true });
  }
  function fallback() {
    if (disposed || textMode) return;
    textMode = true;
    dialog.dataset.render = 'text';
    const old = world;
    world = null;
    old?.destroy();
    stage.querySelector('.lt-static').hidden = false;
    hint.textContent = '';
    if (selected) arrive(selected);
    else live.textContent = '已開啟文字導覽，請選擇散步地區。';
  }
  function close() {
    if (disposed) return;
    disposed = true;
    if (dialog.open) dialog.close();
    world?.destroy();
    world = null;
    activeTour = null;
    dialog.remove();
    if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent('life-tour-close'));
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('close', close);
  dialog.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-life-close')) close();
    else if (button.hasAttribute('data-life-overview')) overview();
    else if (button.hasAttribute('data-life-stop')) choose(button.dataset.lifeStop);
    else if (button.hasAttribute('data-life-pin')) choose(button.dataset.lifePin);
    else if (button.hasAttribute('data-life-topic') && selected) {
      for (const item of talk.querySelectorAll('[data-life-topic]')) item.setAttribute('aria-pressed', String(item === button));
      talk.querySelector('.lt-speaker').hidden = button.dataset.lifeTopic === 'event';
      talk.querySelector('.lt-reply').innerHTML = replyHtml(stopById.get(selected), button.dataset.lifeTopic, events);
      talk.scrollTop = 0;
    }
  });
  activeTour = { choose };
  dialog.showModal();
  dialog.querySelector('#lt-title').focus({ preventScroll: true });
  if (stopById.has(initialStoryId)) choose(initialStoryId, false);
  try {
    const { createLifeWorld } = await import('./life-world.js');
    if (disposed) return;
    const created = await createLifeWorld({ canvas, onChoose: choose, onArrive: arrive, onError: fallback,
      onSelectLabels: rows => { if (!disposed && !textMode) projectLabels(labelLayer, pins, rows, selected); } });
    if (disposed || textMode) { created?.destroy(); return; }
    world = created;
    dialog.dataset.render = '3d';
    if (selected) world.walkTo(selected);
    else hint.textContent = '點地名出發 · 拖曳環視';
  } catch { fallback(); }
}
