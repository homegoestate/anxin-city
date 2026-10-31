import {CHAPTERS} from './data.js?v=17.0.0';
export const STORAGE_KEY = 'anxin-fucheng-journey-v1';
const ids = CHAPTERS.map(c => c.id);
export function fresh() { return {version: 1, view: 'intro', active: ids[0], choices: {}}; }
export function restore(raw) {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!value || value.version !== 1) return fresh();
    const choices = {};
    for (const id of ids) if ([0, 1].includes(value.choices?.[id])) choices[id] = value.choices[id];
    return {version: 1, view: ['intro', 'chapter', 'book'].includes(value.view) ? value.view : 'intro', active: ids.includes(value.active) ? value.active : ids[0], choices};
  } catch { return fresh(); }
}
export function transition(state, action) {
  const next = restore(state);
  if (action.type === 'home') next.view = 'intro';
  if (action.type === 'book') next.view = 'book';
  if (action.type === 'begin') { next.active = ids.find(id => next.choices[id] === undefined) || ids[0]; next.view = 'chapter'; }
  if (action.type === 'open' && ids.includes(action.id)) { next.active = action.id; next.view = 'chapter'; }
  if (action.type === 'choose' && [0, 1].includes(action.index)) { next.choices[next.active] = action.index; next.view = 'chapter'; }
  if (action.type === 'next') {
    const index = ids.indexOf(next.active);
    if (index === ids.length - 1) next.view = 'book';
    else { next.active = ids[index + 1]; next.view = 'chapter'; }
  }
  return next;
}
export function collected(state) { return CHAPTERS.filter(c => [0, 1].includes(state.choices[c.id])); }
export function postcardText(state) {
  return ['我的府城明信片｜宏國地政・易丞地政', ...collected(state).map(c => c.name + '：' + c.choices[state.choices[c.id]].memory), '這是線上故事閱讀紀錄，非實際到訪證明。', 'https://homegoestate.github.io/anxin-city/fucheng/'].join('\n');
}
