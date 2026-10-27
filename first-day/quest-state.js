import { BRAND, quests } from './brand-quests.js?v=16.0.0';
import { normalizeStreetState } from './street-state.js?v=16.0.0';

export const QUEST_KEY = 'anxin-first-day-quests-v1';
const questById = new Map(quests.map(quest => [quest.id, quest]));
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const answerFor = (quest, id) => typeof id === 'string' ? quest.answers.find(answer => answer.id === id) : undefined;

export function createQuestState() {
  return { version: 1, active: null, answers: {}, completedAnswers: {} };
}

// answers stores each quest's latest valid answer ID. completedAnswers retains a
// known correct answer ID separately so retrying with a wrong option does not
// erase an earned learning badge. Both maps are bounded by the three known IDs.
// Neither map is a signature: completion always also needs normalized street
// evidence. No saved completed/ready flags or raw discovery arrays are trusted.
function sanitizeQuestState(raw) {
  if (typeof raw === 'string') {
    if (raw.length > 16384) return createQuestState();
    try { raw = JSON.parse(raw); } catch { return createQuestState(); }
  }
  if (!isRecord(raw) || raw.version !== 1) return createQuestState();
  const state = createQuestState();
  state.active = questById.has(raw.active) ? raw.active : null;
  for (const quest of quests) {
    const latest = isRecord(raw.answers) && hasOwn(raw.answers, quest.id) ? answerFor(quest, raw.answers[quest.id]) : undefined;
    const earned = isRecord(raw.completedAnswers) && hasOwn(raw.completedAnswers, quest.id) ? answerFor(quest, raw.completedAnswers[quest.id]) : undefined;
    if (latest) state.answers[quest.id] = latest.id;
    if (earned?.correct) state.completedAnswers[quest.id] = earned.id;
    else if (latest?.correct) state.completedAnswers[quest.id] = latest.id;
  }
  return state;
}

function learnedIds(streetState) {
  return new Set(normalizeStreetState(streetState).discoveries);
}

function hasClues(quest, learned) {
  return quest.requiredDiscoveries.length > 0 && quest.requiredDiscoveries.every(id => learned.has(id));
}

export function normalizeQuestState(raw, streetState) {
  const state = sanitizeQuestState(raw);
  const learned = learnedIds(streetState);
  for (const quest of quests) {
    if (!hasClues(quest, learned)) {
      // Otherwise an answer injected before the clues could auto-complete later
      // without the player returning to the office to review the decision.
      delete state.answers[quest.id];
      delete state.completedAnswers[quest.id];
    }
  }
  return state;
}

export function loadQuestState(storage, streetState) {
  try { return normalizeQuestState(storage?.getItem(QUEST_KEY), streetState); }
  catch { return createQuestState(); }
}

export function saveQuestState(storage, state) {
  try {
    if (!storage || typeof storage.setItem !== 'function') return false;
    // This two-argument storage API checks structure only. It does not claim a
    // completion; load/normalize/progress re-check current street evidence.
    storage.setItem(QUEST_KEY, JSON.stringify(sanitizeQuestState(state)));
    return true;
  } catch { return false; }
}

export function selectQuest(state, id, streetState) {
  const next = normalizeQuestState(state, streetState);
  if (questById.has(id)) next.active = id;
  return next;
}

export function questProgress(state, streetState, id = state?.active) {
  const normalized = normalizeQuestState(state, streetState);
  const quest = questById.get(id === undefined ? normalized.active : id);
  if (!quest) return { quest: null, clues: [], found: 0, total: 0, readyToReview: false, completed: false, nextClue: null };
  const learned = learnedIds(streetState);
  const clues = quest.clues.map(clue => ({ ...clue, found: learned.has(clue.discoveryId) }));
  const found = quest.requiredDiscoveries.filter(discoveryId => learned.has(discoveryId)).length;
  const total = quest.requiredDiscoveries.length;
  const readyToReview = total > 0 && found === total;
  const completed = readyToReview && Boolean(answerFor(quest, normalized.completedAnswers[quest.id])?.correct);
  return { quest, clues, found, total, readyToReview, completed, nextClue: clues.find(clue => !clue.found) || null };
}

export function answerQuest(state, streetState, questId, answerId, { atOffice = false } = {}) {
  // UI supplies true only for the office conversation. Geography and walking
  // remain with the street world; answering here never moves or saves it.
  if (atOffice !== true) return null;
  const quest = questById.get(questId);
  const answer = quest && answerFor(quest, answerId);
  if (!quest || !answer) return null;
  const before = questProgress(state, streetState, questId);
  if (!before.readyToReview) return null;
  const next = normalizeQuestState(state, streetState);
  next.active = questId;
  next.answers[questId] = answer.id;
  if (answer.correct) next.completedAnswers[questId] = answer.id;
  return { state: next, correct: answer.correct, feedback: answer.feedback, newlyCompleted: answer.correct && !before.completed };
}

export function questSummary(state, streetState) {
  const normalized = normalizeQuestState(state, streetState);
  const active = questById.get(normalized.active);
  const completed = quests.filter(quest => questProgress(normalized, streetState, quest.id).completed);
  const parts = [
    `${BRAND}｜街坊互助學習紀錄`,
    `目前任務：${active ? active.title : '尚未選擇'}`,
    `已完成學習：${completed.length ? completed.map(quest => `${quest.title}（${quest.badge}）`).join('、') : '尚未完成'}`,
  ];
  if (active) {
    const progress = questProgress(normalized, streetState, active.id);
    parts.push(`已收集線索：${progress.found}/${progress.total}；${progress.completed ? '已完成情境答題' : progress.readyToReview ? '請回相談所答題' : '繼續找線索'}`);
    parts.push(`想繼續問：${active.lineQuestion}`);
  }
  parts.push('以上為虛構居民的遊戲學習，不代表真實案件已查證、核貸、稅額或委任成立。');
  return parts.join('\n');
}
