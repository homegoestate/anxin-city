import { districts, stops, discoveries, stories } from './street-data.js?v=16.0.0';

export const STREET_KEY = 'anxin-first-day-street-v1';
const districtById = new Map(districts.map(item => [item.id, item]));
const stopById = new Map(stops.map(item => [item.id, item]));
const discoveryById = new Map(discoveries.map(item => [item.id, item]));
const totalChoices = Object.values(stories).reduce((sum, story) => sum + story.choices.length, 0);
const maxReadRecords = totalChoices * 4;
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const appendUnique = (array, value) => { if (!array.includes(value)) array.push(value); };
const coordinate = (value, fallback, maximum) => typeof value === 'number' && Number.isFinite(value)
  ? Math.min(maximum, Math.max(0, Math.round(value * 100) / 100)) : fallback;

export function createStreetState() {
  return { version: 1, district: 'lane', position: { ...districts[0].spawn }, seen: [], discoveries: [], choices: {}, flags: [], visitedDistricts: ['lane'], history: [] };
}

// history is a bounded ordered list of unique { stopId, choiceId } pairs.
// It retains each option's FIRST valid completion, so replaying an option cannot
// move an unlock after its dependent visit. choices remembers the latest replay,
// but only a pair already supported by valid history may be restored there.
// Client saves are not cryptographic proof; this rejects impossible/unknown
// rewards and locked-before-unlock histories, not a fully fabricated legal play.
export function normalizeStreetState(input) {
  if (typeof input === 'string') {
    if (input.length > 65536) return createStreetState();
    try { input = JSON.parse(input); } catch { return createStreetState(); }
  }
  if (!isRecord(input) || input.version !== 1) return createStreetState();
  const next = createStreetState();
  next.district = districtById.has(input.district) ? input.district : 'lane';
  const spawn = districtById.get(next.district).spawn;
  const position = isRecord(input.position) ? input.position : {};
  next.position = { x: coordinate(position.x, spawn.x, 1000), y: coordinate(position.y, spawn.y, 620) };
  const knownPairs = new Set();
  // A choice-only save may be restored in its insertion order. New saves always
  // have history; raw discoveries, seen and flags are never reward evidence.
  const records = Array.isArray(input.history) ? input.history : isRecord(input.choices)
    ? Object.entries(input.choices).map(([stopId, choiceId]) => ({ stopId, choiceId })) : [];
  for (const record of records.slice(0, maxReadRecords)) {
    if (!isRecord(record) || typeof record.stopId !== 'string' || typeof record.choiceId !== 'string') continue;
    const stop = stopById.get(record.stopId);
    if (!stop || (stop.requires && !next.flags.includes(stop.requires))) continue;
    const choice = stories[stop.id]?.choices.find(item => item.id === record.choiceId);
    if (!choice) continue;
    const key = `${stop.id}:${choice.id}`;
    if (knownPairs.has(key)) continue;
    knownPairs.add(key);
    next.history.push({ stopId: stop.id, choiceId: choice.id });
    appendUnique(next.seen, stop.id);
    next.choices[stop.id] = choice.id;
    for (const id of choice.discoveryIds) if (discoveryById.has(id)) appendUnique(next.discoveries, id);
    if (choice.flag) appendUnique(next.flags, choice.flag);
  }
  if (isRecord(input.choices)) {
    for (const stop of stops) {
      const choiceId = hasOwn(input.choices, stop.id) ? input.choices[stop.id] : null;
      if (typeof choiceId === 'string' && knownPairs.has(`${stop.id}:${choiceId}`)) next.choices[stop.id] = choiceId;
    }
  }
  const visited = Array.isArray(input.visitedDistricts) ? input.visitedDistricts.slice(0, 20) : [];
  for (const id of visited) if (districtById.has(id)) appendUnique(next.visitedDistricts, id);
  for (const record of next.history) appendUnique(next.visitedDistricts, stopById.get(record.stopId).district);
  appendUnique(next.visitedDistricts, next.district);
  return next;
}

export function loadStreetState(storage) {
  try { return normalizeStreetState(storage?.getItem(STREET_KEY)); } catch { return createStreetState(); }
}

export function saveStreetState(storage, state) {
  try {
    if (!storage || typeof storage.setItem !== 'function') return false;
    storage.setItem(STREET_KEY, JSON.stringify(normalizeStreetState(state)));
    return true;
  } catch { return false; }
}

export function changeDistrict(state, id) {
  const next = normalizeStreetState(state);
  if (!districtById.has(id)) return next;
  next.district = id;
  next.position = { ...districtById.get(id).spawn };
  appendUnique(next.visitedDistricts, id);
  return next;
}

export function movePlayer(state, position) {
  const next = normalizeStreetState(state);
  const target = isRecord(position) ? position : {};
  next.position = { x: coordinate(target.x, next.position.x, 1000), y: coordinate(target.y, next.position.y, 620) };
  return next;
}

export function availableStops(state) {
  const normalized = normalizeStreetState(state);
  return stops.filter(stop => stop.district === normalized.district && (!stop.requires || normalized.flags.includes(stop.requires)));
}

export function interact(state, stopId) {
  const normalized = normalizeStreetState(state);
  const stop = stopById.get(stopId);
  if (!stop || stop.district !== normalized.district || (stop.requires && !normalized.flags.includes(stop.requires))) return null;
  return stories[stop.id] || null;
}

export function chooseStory(state, stopId, choiceId) {
  const normalized = normalizeStreetState(state);
  const story = interact(normalized, stopId);
  const choice = story?.choices.find(item => item.id === choiceId);
  if (!choice) return null;
  const before = new Set(availableStops(normalized).map(stop => stop.id));
  const history = normalized.history.some(item => item.stopId === stopId && item.choiceId === choiceId)
    ? normalized.history : [...normalized.history, { stopId, choiceId }];
  const next = normalizeStreetState({ ...normalized, history, choices: { ...normalized.choices, [stopId]: choiceId } });
  const unlocked = availableStops(next).filter(stop => !before.has(stop.id)).map(stop => stop.id);
  return { state: next, response: [...choice.response], choice, unlocked };
}

export function streetProgress(state) {
  const normalized = normalizeStreetState(state);
  const learned = normalized.discoveries.map(id => discoveryById.get(id));
  const residents = normalized.seen.filter(id => stopById.get(id).kind === 'resident').length;
  const places = normalized.seen.filter(id => stopById.get(id).kind === 'place').length;
  const culture = learned.filter(item => item.topic === 'culture').length;
  const property = learned.filter(item => item.topic === 'property').length;
  return { residents, places, discoveries: learned.length, culture, property, ready: residents >= 2 && culture >= 1 && property >= 1 };
}

export function streetSummary(state) {
  const normalized = normalizeStreetState(state);
  const names = topic => normalized.discoveries.map(id => discoveryById.get(id)).filter(item => item.topic === topic).map(item => item.title).join('、') || '尚未收集';
  const route = normalized.visitedDistricts.map(id => districtById.get(id).title).join(' → ');
  return `小安的街區學習筆記\n故事路線：${route}\n文化發現：${names('culture')}\n不動產提問：${names('property')}\n這是遊戲中的學習紀錄，不代表實地到訪、房屋安全、核貸結果或個案評估。`.slice(0, 600);
}
