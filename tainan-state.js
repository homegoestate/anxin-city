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

const normalizeSearch=value=>String(value??'').normalize('NFKC').replaceAll('臺','台').trim().toLowerCase();

export function filterDistricts(districts, region='all', query='', storyMap={}) {
  const text=normalizeSearch(query);
  return districts.filter(d=>{
    if (region!=='all'&&d.region!==region) return false;
    const story=storyMap[d.id];
    const fields=[d.name,d.tagline,d.feature,d.id];
    if(story){
      for(const phase of ['past','present','future']) fields.push(story[phase]?.title,story[phase]?.text);
      for(const attraction of story.attractions||[]) fields.push(attraction.name,attraction.story,attraction.highlight);
    }
    return !text||normalizeSearch(fields.join(' ')).includes(text);
  });
}

export function filterAttractions(districts, storyMap={}, category='all', query='') {
  const text=normalizeSearch(query);
  return districts.flatMap(d=>(storyMap[d.id]?.attractions||[]).map(attraction=>({
    ...attraction,districtId:d.id,districtName:d.name,districtRegion:d.region
  }))).filter(attraction=>(category==='all'||attraction.category===category)&&(!text||normalizeSearch([
    attraction.name,attraction.districtName,attraction.districtId,attraction.story,attraction.highlight,attraction.visitNote
  ].join(' ')).includes(text)));
}

export function quizOutcome(district, optionId) {
  const valid=district.quiz.options.some(option=>option.id===optionId);
  return {valid,correct:valid&&optionId===district.quiz.correctId,message:valid?district.quiz.explanation:'請選一個畫面上的答案。'};
}
