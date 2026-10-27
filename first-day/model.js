import { evaluateMission } from '../game-engine.js';
import { priorities, homes, timings, shocks, clues, verification, places, lesson } from './content.js';

export const STORAGE_KEY = 'anxin-first-day-v1';
export const STEPS = Object.freeze(['welcome', 'priority', 'home', 'check', 'explore', 'future', 'result']);

const ids = list => new Set(list.map(item => item.id));
const allowed = {
  priority: ids(priorities), price: ids(homes), timing: ids(timings), shock: ids(shocks),
  clues: ids(clues), verification: ids(verification.options), place: ids(places), lesson: ids(lesson.options),
};
const choiceStages = { priority: 1, price: 2, verification: 3, place: 4, cultureAnswer: 4, timing: 5, shock: 5, lesson: 5 };
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const validChoice = (key, value, fallback = null) => typeof value === 'string' && allowed[key].has(value) ? value : fallback;
const currentPlace = state => places.find(place => place.id === state.place);
const allCluesRead = state => state.clues.length === clues.length;
const checked = state => allCluesRead(state) && state.verification === verification.correctId;
const explored = state => !!currentPlace(state) && state.cultureAnswer === currentPlace(state).quiz.correctId;

export function createState() {
  return {
    version: 1, step: 'welcome', priority: null, price: null, timing: 'now', shock: 'baseline',
    clues: [], verification: null, place: null, cultureAnswer: null, lesson: null, previous: null,
  };
}

function normalizeSnapshot(value) {
  if (!isRecord(value)) return null;
  const route = {
    priority: validChoice('priority', value.priority), price: validChoice('price', value.price),
    timing: validChoice('timing', value.timing), shock: validChoice('shock', value.shock),
    place: validChoice('place', value.place),
  };
  return Object.values(route).every(Boolean) ? route : null;
}

// An unlocked step is derived from prerequisite evidence, never trusted from storage.
function furthestStep(state) {
  if (!state.priority) return 1;
  if (!state.price) return 2;
  if (!checked(state)) return 3;
  if (!explored(state)) return 4;
  if (state.lesson !== lesson.correctId) return 5;
  return 6;
}

export function normalizeState(input) {
  try {
    let value = input;
    if (typeof value === 'string') {
      if (value.length > 12_000) return createState();
      value = JSON.parse(value);
    }
    if (!isRecord(value) || value.version !== 1) return createState();
    const next = createState();
    next.previous = normalizeSnapshot(value.previous);
    // Financial choices are independent of the selected culture story. Keeping
    // them here also preserves a comparison when its destination is changed.
    next.timing = validChoice('timing', value.timing, 'now');
    next.shock = validChoice('shock', value.shock, 'baseline');
    next.priority = validChoice('priority', value.priority);
    if (next.priority) next.price = validChoice('price', value.price);
    if (next.price) {
      next.clues = Array.isArray(value.clues)
        ? clues.map(item => item.id).filter(id => value.clues.includes(id)) : [];
      if (allCluesRead(next)) next.verification = validChoice('verification', value.verification);
    }
    if (checked(next)) {
      next.place = validChoice('place', value.place);
      const quiz = currentPlace(next)?.quiz;
      if (quiz?.options.some(option => option.id === value.cultureAnswer)) next.cultureAnswer = value.cultureAnswer;
    }
    if (explored(next)) {
      next.lesson = validChoice('lesson', value.lesson);
    }
    const requestedStep = STEPS.indexOf(value.step);
    next.step = requestedStep < 0 ? 'welcome' : STEPS[Math.min(requestedStep, furthestStep(next))];
    return next;
  } catch {
    return createState();
  }
}

export function loadState(storage) {
  try {
    return typeof storage?.getItem === 'function' ? normalizeState(storage.getItem(STORAGE_KEY)) : createState();
  } catch { return createState(); }
}

export function saveState(storage, state) {
  try {
    if (typeof storage?.setItem !== 'function') return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
    return true;
  } catch { return false; }
}

export function updateChoice(state, key, value) {
  const next = normalizeState(state);
  if (!Object.hasOwn(choiceStages, key) || choiceStages[key] > furthestStep(next)) return next;
  if (key === 'cultureAnswer') {
    const quiz = currentPlace(next)?.quiz;
    if (!quiz || !quiz.options.some(option => option.id === value)) return next;
    // Correct answers are earned progress. A stray tap cannot remove that progress.
    if (next.cultureAnswer === quiz.correctId) return next;
  } else {
    if (!allowed[key].has(value)) return next;
    if (key === 'verification' && (!allCluesRead(next) || next.verification === verification.correctId)) return next;
    if (key === 'lesson' && next.lesson === lesson.correctId) return next;
  }
  if (key === 'place' && next.place !== value) {
    next.cultureAnswer = null;
    next.lesson = null;
    // A changed destination must be read and answered before the final reflection.
    if (STEPS.indexOf(next.step) > 4) next.step = 'explore';
  }
  next[key] = value;
  return normalizeState(next);
}

export function revealClue(state, id) {
  const next = normalizeState(state);
  if (furthestStep(next) < 3 || !allowed.clues.has(id) || next.clues.includes(id)) return next;
  next.clues.push(id);
  return normalizeState(next);
}

export function canContinue(state) {
  const next = normalizeState(state);
  const index = STEPS.indexOf(next.step);
  return index >= 0 && index < STEPS.length - 1 && furthestStep(next) > index;
}

export function goToStep(state, step) {
  const next = normalizeState(state);
  const index = STEPS.indexOf(step);
  if (index >= 0 && index <= furthestStep(next)) next.step = step;
  return next;
}

// Snapshots and live states share these five choices. Calculations deliberately do
// not derive from saved metric values. The original engine remains the authority.
function financialAnswers(state) {
  try {
    const value = isRecord(state) ? state : {};
    return [validChoice('priority', value.priority), validChoice('price', value.price),
      validChoice('timing', value.timing, 'now'), validChoice('shock', value.shock, 'baseline')];
  } catch { return [null, null, 'now', 'baseline']; }
}

export function getResult(state) {
  return evaluateMission('first-home', financialAnswers(state));
}

export function getBaselineResult(state) {
  const answers = financialAnswers(state);
  answers[3] = 'baseline';
  return evaluateMission('first-home', answers);
}

export function snapshotRoute(state) {
  const next = normalizeState(state);
  return next.step === 'result' && furthestStep(next) === 6 ? normalizeSnapshot(next) : null;
}

export function buildSummary(state) {
  const next = normalizeState(state);
  const completed = snapshotRoute(next) !== null;
  const titleOf = (list, id) => list.find(item => item.id === id)?.title ?? '尚未選擇';
  const result = getResult(next);
  return [
    '【宏國地政｜易丞地政・小安在台南的第一天】',
    '這是虛構角色的教學情境，不是我的真實財務資料或個案審定。',
    completed ? '故事進度：已完成本次練習。' : '故事進度：尚未完成，以下僅為選擇紀錄與預覽。',
    `生活重點：${titleOf(priorities, next.priority)}`,
    `練習房價：${titleOf(homes, next.price)}`,
    `準備時間：${titleOf(timings, next.timing)}`,
    `壓力情境：${titleOf(shocks, next.shock)}`,
    `文化選讀：${titleOf(places, next.place)}（閱讀練習，不代表到訪）`,
    '',
    ...(completed ? ['本次假設試算：', ...result.metricCards.map(card => `${card.label}：${card.value.toLocaleString('zh-TW')} ${card.unit}`), ''] : []),
    '我想進一步確認的問題：',
    '1. 要準備哪些文件，才能確認產權、權利範圍與抵押權處理？',
    '2. 使用範圍、增改建與屋況，應如何對照文件和現場？',
    '3. 銀行實際鑑價、成數與利率，會如何影響我的資金安排？',
    '4. 若收入或利率改變，應保留多少交屋現金與生活緩衝？',
    '',
    '楊代書在故事中提供教學引導；實際貸款、稅費、權利與交易條件，需另依真實文件及承辦機構確認。',
    '這份文字只供我確認後自行傳送，尚未送出訊息或成立委託。',
  ].join('\n');
}
