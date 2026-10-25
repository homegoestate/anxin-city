// Reading stamps are local to this module. They do not prove an on-site visit.
export const CULTURE_STORAGE_KEY = 'anxin-city-culture-walk-v1';
const scope = 'culture-walk';
const emptyPassport = () => ({ version: 1, scope, stamps: [] });
const knownSet = ids => new Set(Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : []);

export function restoreCulturePassport(raw, knownIds = []) {
  let value = raw;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { return emptyPassport(); }
  }
  if (!value || Array.isArray(value) || value.version !== 1 || value.scope !== scope || !Array.isArray(value.stamps)) return emptyPassport();
  const known = knownSet(knownIds);
  return { version: 1, scope, stamps: [...new Set(value.stamps.filter(id => typeof id === 'string' && known.has(id)))] };
}

export function stampCulturePlace(passport, placeId, knownIds = []) {
  if (typeof placeId !== 'string' || !knownSet(knownIds).has(placeId)) throw new RangeError('找不到這個文化點。');
  const restored = restoreCulturePassport(passport, knownIds);
  return { ...restored, stamps: [...new Set([...restored.stamps, placeId])] };
}

export function loadCulturePassport(storage, knownIds = []) {
  try {
    if (typeof storage?.getItem !== 'function') return { passport: emptyPassport(), available: false };
    return { passport: restoreCulturePassport(storage.getItem(CULTURE_STORAGE_KEY), knownIds), available: true };
  } catch { return { passport: emptyPassport(), available: false }; }
}

export function saveCulturePassport(storage, passport, knownIds = []) {
  try {
    if (typeof storage?.setItem !== 'function') return false;
    storage.setItem(CULTURE_STORAGE_KEY, JSON.stringify(restoreCulturePassport(passport, knownIds)));
    return true;
  } catch { return false; }
}

export function cultureQuizOutcome(place, optionIndex) {
  const quiz = place?.quiz;
  if (!quiz || !Array.isArray(quiz.options) || quiz.options.length !== 3 ||
      !quiz.options.every(option => typeof option === 'string' && option.trim()) ||
      !Number.isInteger(quiz.correctIndex) || quiz.correctIndex < 0 || quiz.correctIndex >= quiz.options.length ||
      !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= quiz.options.length) {
    return { valid: false, correct: false, explanation: '請選擇畫面上的答案。' };
  }
  return { valid: true, correct: optionIndex === quiz.correctIndex, explanation: String(quiz.explanation || '') };
}

const searchable = value => (Array.isArray(value) ? value.join(' ') : String(value ?? '')).normalize('NFKC').replaceAll('臺', '台').toLocaleLowerCase('zh-TW').replace(/\s+/g, ' ').trim();

export function filterCulturePlaces(places, { themeId = 'all', districtId = 'all', query = '' } = {}, districts = []) {
  const districtNames = new Map(districts.map(district => [district.id, district.name]));
  const words = searchable(query).split(' ').filter(Boolean);
  return places.filter(place => {
    if (themeId !== 'all' && place.themeId !== themeId) return false;
    if (districtId !== 'all' && place.districtId !== districtId) return false;
    const haystack = searchable([place.name, place.kind, place.hook, place.story, place.lookFor, place.localLens, place.visitorLens, place.respect, districtNames.get(place.districtId)].flat().join(' '));
    return words.every(word => haystack.includes(word));
  });
}
