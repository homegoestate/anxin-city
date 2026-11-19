import { tainanDistricts, tainanRegions, tainanSources } from '../tainan-data.js';
import { tainanAtlas, tainanAtlasSources } from '../tainan-atlas.js';
import { tainanUpdates } from '../tainan-updates.js';
import { tainanEvents } from '../tainan-events.js';
import { filterSeasonEntries } from '../seasons-state.js';
import { culturePlaces, cultureSources } from '../culture-data.js';
import { dayStories } from '../first-day/daylife-data.js';
import { districtWalks } from '../district-stories.js?v=27.0.0';
import { districtShapes, geometrySource } from './geometry.js';
import { servicesFor, nextStopsFor } from './civic.js';

const byId = new Map(tainanDistricts.map(district => [district.id, district]));
const byName = new Map(tainanDistricts.map(district => [district.name, district]));
const regions = new Map(tainanRegions.map(region => [region.id, region]));
const sources = Object.fromEntries(tainanSources.map(source => [source.id, source]));
const shapes = new Map(districtShapes.map(shape => [shape.name, shape]));
const namedPlaces = new Set(['北門區', '新營區', '白河區', '東山區', '七股區', '麻豆區', '善化區', '玉井區', '南化區', '安南區', '歸仁區', '中西區']);
const compactPlaces = new Set(['七股區', '新營區', '玉井區', '中西區']);
const regionNames = { coast: '海線', city: '府城', plains: '平原', hills: '淺山' };
const element = id => document.getElementById(id);
const tabs = [...document.querySelectorAll('[role="tab"]')];
const mapItems = new Map();
const mapLabels = new Map();
const defaultDistrict = 'west-central';
let activeDistrict;
let activeTab = 'places';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function sourceList(items) {
  return '<ul>' + items.filter(Boolean).map(source => {
    const published = source.publishedAt || source.date;
    const dates = [
      published && '發布 ' + published,
      source.reviewedAt && '查核 ' + source.reviewedAt,
    ].filter(Boolean).join(' · ');
    return `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.title)} ↗</a>${dates ? `<span class="source-date">${escapeHtml(dates)}</span>` : ''}</li>`;
  }).join('') + '</ul>';
}

function sourceDetails(ids, registry) {
  const items = ids.map(id => registry[id]).filter(Boolean);
  return items.length ? `<details class="sources"><summary>資料來源與日期</summary>${sourceList(items)}</details>` : '';
}

function svg(tag, attributes, content) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (content !== undefined) node.textContent = content;
  return node;
}

function prepareMap() {
  const picker = element('district-picker');
  picker.replaceChildren();
  for (const region of tainanRegions) {
    const group = document.createElement('optgroup');
    group.label = region.name;
    for (const district of tainanDistricts.filter(district => district.region === region.id)) {
      group.append(new Option(district.name, district.id));
    }
    picker.append(group);
    const item = document.createElement('li');
    item.className = region.id;
    item.title = region.name;
    item.innerHTML = `<i aria-hidden="true"></i>${escapeHtml(regionNames[region.id])}`;
    element('legend').append(item);
  }
  for (const shape of districtShapes) {
    const district = byName.get(shape.name);
    if (!district) continue;
    const path = svg('path', { d: shape.path, class: 'district-shape ' + district.region, 'data-district': district.id, 'fill-rule': 'evenodd' });
    path.append(svg('title', {}, district.name + '・' + district.tagline));
    element('boundaries').append(path);
    mapItems.set(district.id, path);
    if (namedPlaces.has(shape.name)) {
      const label = svg('text', { y: 4, class: 'region-tag' }, shape.name.replace(/區$/, ''));
      element('map-labels').append(label);
      mapLabels.set(district.id, label);
    }
  }
  element('geometry-credit').innerHTML =
    `<p>${escapeHtml(geometrySource.attribution)}</p><a href="${escapeHtml(geometrySource.url)}">${escapeHtml(geometrySource.title)} ↗</a>`
    + ` · <a href="${escapeHtml(geometrySource.licenseUrl)}">圖資授權 ↗</a>`;
  picker.addEventListener('change', () => chooseDistrict(picker.value));
  element('boundaries').addEventListener('click', event => {
    const id = event.target.closest('[data-district]')?.dataset.district;
    if (id) chooseDistrict(id);
  });
}

function markOnMap(district) {
  const shape = shapes.get(district.name);
  const path = mapItems.get(district.id);
  if (!shape || !path) return;
  const map = element('district-map');
  const unit = 1 / (map.getScreenCTM()?.a || 1);
  const compact = 600 / unit < 390 || window.innerWidth <= 680;
  const side = shape.x > 330 ? 1 : -1;
  const labelWidth = district.name.length * 16 + 16;
  const margin = (labelWidth / 2 + 5) * unit;
  const labelX = Math.max(margin, Math.min(600 - margin, shape.x + 48 * unit * side));
  const labelY = Math.max(19 * unit, shape.y - 22 * unit);
  for (const [id, item] of mapItems) item.classList.toggle('current', id === district.id);
  for (const [id, label] of mapLabels) {
    const place = shapes.get(byId.get(id).name);
    const overlaps = Math.abs(place.x - labelX) < (labelWidth / 2 + 17) * unit
      && Math.abs(place.y - labelY) < 22 * unit;
    const visible = id !== district.id && !overlaps && (!compact || compactPlaces.has(place.name));
    label.setAttribute('visibility', visible ? 'visible' : 'hidden');
    label.setAttribute('transform', `translate(${place.x} ${place.y}) scale(${unit})`);
  }
  const pill = svg('g', { transform: `translate(${labelX} ${labelY}) scale(${unit})` });
  pill.append(
    svg('rect', { x: -labelWidth / 2, y: -13, width: labelWidth, height: 26, rx: 6, class: 'selection-pill' }),
    svg('text', { x: 0, y: 5, class: 'selection-name' }, district.name),
  );
  element('map-selection').replaceChildren(
    svg('path', { d: shape.path, class: 'selection-edge' }),
    svg('path', { d: `M${shape.x} ${shape.y}L${labelX} ${labelY}`, class: 'selection-line' }),
    svg('circle', { cx: shape.x, cy: shape.y, r: 2.6 * unit, class: 'selection-dot' }),
    pill,
  );
  const mini = element('mini-shape');
  mini.setAttribute('d', shape.path);
  const bounds = path.getBBox();
  const pad = Math.max(bounds.width, bounds.height) * .09 + 1;
  mini.ownerSVGElement.setAttribute('viewBox', [bounds.x - pad, bounds.y - pad, bounds.width + 2 * pad, bounds.height + 2 * pad].join(' '));
}

function districtLink(url, label) {
  return `<a href="${escapeHtml(url)}">${escapeHtml(label)} <span aria-hidden="true">→</span></a>`;
}

function showDistrict(district) {
  element('district-picker').value = district.id;
  element('district-title').textContent = district.name;
  element('district-mast').className = 'district-mast ' + district.region;
  element('region-name').textContent = regions.get(district.region).name;
  element('tagline').textContent = district.tagline;
  element('local-feature').textContent = district.feature;
  element('living-tip').textContent = district.livingTip;
  element('feature-sources').open = false;
  element('feature-sources').innerHTML = '<summary>地方資料來源</summary>' + sourceList(district.sourceIds.map(id => sources[id]));
  element('content-title').textContent = district.name + '走讀';
  const links = [];
  const scene = dayStories.find(story => story.district.split('・').at(-1) === district.name);
  const walk = districtWalks.find(story => story.districtId === district.id);
  const stopId = scene?.id || walk?.id;
  if (stopId) {
    const resident = scene ? scene.speaker.split('｜')[0] : walk.resident;
    links.push(districtLink('../?start=life&scene=' + encodeURIComponent(stopId), '在立體城找' + resident));
  }
  if (scene) links.push(districtLink('../first-day/?walk=1&scene=' + encodeURIComponent(scene.id) + '#street', '走進街區・' + scene.title));
  links.push(districtLink('../?start=tainan&district=' + encodeURIComponent(district.id), '讀' + district.name + '故事，收集風物章'));
  element('experience-links').innerHTML = links.join('');
  const stops = nextStopsFor(district.name);
  const bus = element('bus-panel');
  bus.hidden = !stops.length;
  bus.innerHTML = stops.length ? `<h2>沿公車幹線探索</h2><div class="nearby">${stops.map(stop => {
    const next = byName.get(stop.name);
    return next ? `<button type="button" data-next="${escapeHtml(next.id)}">${escapeHtml(stop.line)}・${escapeHtml(stop.name)} →</button>` : '';
  }).join('')}</div><p>沿線地區選讀，實際停靠與時刻請查<a href="https://2384.tainan.gov.tw/newtnbusweb/">公車動態</a>。</p>` : '';
  document.title = district.name + '｜台南生活地圖・宏國地政與易丞地政';
  markOnMap(district);
  showPanel();
}

function chooseDistrict(id, updateHistory = true) {
  const district = byId.get(id) || byName.get(id) || byId.get(defaultDistrict);
  if (district.id === activeDistrict?.id) return;
  activeDistrict = district;
  if (updateHistory) {
    const url = new URL(location.href);
    url.searchParams.set('district', district.id);
    url.hash = '';
    history.pushState(null, '', url);
  }
  showDistrict(district);
  element('announcement').textContent = '已選擇' + district.name + '。' + district.tagline + '。';
}

function card(category, heading, content, cssClass = '') {
  return `<article class="entry ${cssClass}"><header><small>${escapeHtml(category)}</small><h3>${escapeHtml(heading)}</h3></header>${content}</article>`;
}

function placeCards(district, atlas) {
  const story = card('地方沿革', atlas.past.title, `<p>${escapeHtml(atlas.past.text)}</p>${sourceDetails(atlas.past.sourceIds, tainanAtlasSources)}`);
  const attractions = atlas.attractions.map(place => card('散步地點', place.name,
    `<p>${escapeHtml(place.story)}</p><p class="note">${escapeHtml(place.visitNote)}</p>${sourceDetails(place.sourceIds, tainanAtlasSources)}`));
  const culture = culturePlaces.filter(place => place.districtId === district.id).map(place => card(place.kind, place.name,
    `<p>${escapeHtml(place.hook)}</p><a class="card-more" href="../?start=culture&amp;place=${encodeURIComponent(place.id)}">進入文化走讀 →</a>${sourceDetails(place.sourceIds, cultureSources)}`, 'culture'));
  const events = filterSeasonEntries(tainanEvents, { mode: 'events', district: district.id });
  const eventCards = events.map(event => card('本區已公告活動', event.title,
    `<p><strong>${escapeHtml(event.dateLabel)}</strong></p><p>${escapeHtml(event.venue)}</p><p>${escapeHtml(event.description)}</p><p class="note">${escapeHtml(event.caution)}</p><a class="card-more" href="${escapeHtml(event.source.url)}">${escapeHtml(event.source.title)} ↗</a><span class="source-date">查核 ${escapeHtml(event.reviewedAt)}</span>`, 'event'));
  return `<div class="entry-grid">${[story, ...attractions, ...culture, ...eventCards].join('')}</div><a class="all-events" href="../?start=events">看全市已公告活動 →</a>`;
}

function projectCards(district, atlas) {
  const updateCards = tainanUpdates.filter(update => update.kind === 'development' && update.districtNames.includes(district.name))
    .map(update => card('官方進度快照', update.title,
      `<p><strong>${escapeHtml(update.status)}</strong> · 查核 ${escapeHtml(update.reviewedAt)}</p><p>${escapeHtml(update.statusDetail)}</p><p class="note">${escapeHtml(update.lifeQuestion)}</p><details class="sources"><summary>公告與日期</summary>${sourceList(update.sources)}</details>`, 'project'));
  const future = atlas.future;
  const isProject = future.kind === 'project';
  const category = isProject ? '地方計畫觀察' : '編輯觀察・走訪提問';
  const status = isProject ? `<p><strong>${escapeHtml(future.status)}</strong> · 查核 ${escapeHtml(future.reviewedAt)}</p>` : '';
  updateCards.push(card(category, future.title, status + `<p>${escapeHtml(future.text)}</p>` + sourceDetails(future.sourceIds, tainanAtlasSources), 'project'));
  const note = !isProject && updateCards.length === 1
    ? '目前尚未收錄本區具官方進度的建設。以下是走訪時可觀察的地方議題。'
    : '依各項查核日期閱讀進度。後續工程與啟用時間，請查最新官方公告。';
  return `<p class="panel-note">${note}</p><div class="entry-grid">${updateCards.join('')}</div>`;
}

function serviceCards(district) {
  const cards = servicesFor(district.name).map(service => card('市民辦事', service.title,
    `<p>${escapeHtml(service.body)}</p><a class="card-more" href="${escapeHtml(service.url)}">${escapeHtml(service.source)} ↗</a><span class="source-date">查核 ${escapeHtml(service.checked)}</span>`));
  return `<div class="entry-grid">${cards.join('')}</div>`;
}

function showPanel() {
  const atlas = tainanAtlas[activeDistrict.id];
  for (const tab of tabs) {
    const selected = tab.id === 'tab-' + activeTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  const panel = element('district-panel');
  panel.setAttribute('aria-labelledby', 'tab-' + activeTab);
  if (activeTab === 'services') panel.innerHTML = serviceCards(activeDistrict);
  else if (activeTab === 'projects') panel.innerHTML = projectCards(activeDistrict, atlas);
  else panel.innerHTML = placeCards(activeDistrict, atlas);
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => {
    activeTab = tab.id.slice(4);
    showPanel();
  });
  tab.addEventListener('keydown', event => {
    const destinations = { ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    const next = tabs[destinations[event.key]];
    next.focus();
    next.click();
  });
}
element('bus-panel').addEventListener('click', event => {
  const id = event.target.closest('[data-next]')?.dataset.next;
  if (id) {
    chooseDistrict(id);
    element('district-picker').focus();
    element('map-title').scrollIntoView({ block: 'start' });
  }
});
window.addEventListener('popstate', () => chooseDistrict(new URLSearchParams(location.search).get('district'), false));
prepareMap();
chooseDistrict(new URLSearchParams(location.search).get('district'), false);
new ResizeObserver(() => markOnMap(activeDistrict)).observe(element('district-map'));
