export const PASSPORT_KEY = 'anxin-tainan-passport-v1';

export function restorePassport(raw, validIds) {
  const allowed = new Set(validIds);
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || data.version !== 1 || !Array.isArray(data.stamps)) return {version:1,stamps:[]};
    return {version:1,stamps:[...new Set(data.stamps.filter(id=>typeof id==='string'&&allowed.has(id)))]};
  } catch { return {version:1,stamps:[]}; }
}

export function stampDistrict(passport, id, validIds) {
  if (!validIds.includes(id)) throw new RangeError('找不到這個台南地點。');
  const next=restorePassport(passport,validIds);
  if (!next.stamps.includes(id)) next.stamps.push(id);
  return next;
}

export function filterDistricts(districts, region='all', query='') {
  const normalize=value=>String(value).replaceAll('臺','台').trim().toLowerCase();
  const text=normalize(query);
  return districts.filter(d=>(region==='all'||d.region===region)&&(!text||normalize([d.name,d.tagline,d.feature,d.id].join(' ')).includes(text)));
}

export function quizOutcome(district, optionId) {
  const valid=district.quiz.options.some(option=>option.id===optionId);
  return {valid,correct:valid&&optionId===district.quiz.correctId,message:valid?district.quiz.explanation:'請選一個畫面上的答案。'};
}
