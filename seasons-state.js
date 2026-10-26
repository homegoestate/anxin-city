// Calendar logic is deliberately independent of device locale and UI rendering.
export const seasonCategories = {
 festival: {label:'民俗節慶',symbol:'燈',color:'#a85e42'},
 harvest: {label:'花果農事',symbol:'果',color:'#967128'},
 nature: {label:'山海自然',symbol:'野',color:'#49776b'},
 culture: {label:'歷史文化',symbol:'古',color:'#676f52'},
 art: {label:'藝文展演',symbol:'藝',color:'#876383'},
};

const normalize = value => String(value??'').normalize('NFKC').toLowerCase().replace(/臺/g,'台').replace(/\s+/g,' ').trim();
export function taiwanDate(now = new Date()) {
 const d = new Date(now);
 if(!Number.isFinite(d.getTime()))throw new RangeError('Invalid date');
 return new Date(d.getTime()+8*3600000).toISOString().slice(0,10);
}
export function validDate(value) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(`${value}T00:00:00Z`);
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
export function eventStatus(event,today=taiwanDate()) {
 if(!validDate(today)||!validDate(event.startDate)||!validDate(event.endDate)||event.endDate<event.startDate)return 'unknown';
 if(today<event.startDate)return 'upcoming';
 return today>event.endDate?'ended':'ongoing';
}
export function eventInMonth(event,month) {
 if(!month)return true;
 if(!Number.isInteger(month)||month<1||month>12||eventStatus(event,event.startDate)==='unknown')return false;
 const first=new Date(`${event.startDate.slice(0,7)}-01T00:00:00Z`);
 const last=event.endDate.slice(0,7);
 while(first.toISOString().slice(0,7)<=last) {
  if(first.getUTCMonth()+1===month)return true;
  first.setUTCMonth(first.getUTCMonth()+1);
 }
 return false;
}
export function filterSeasonEntries(items,{mode='seasons',month=0,category='all',district='all',query='',eventRange='current',today=taiwanDate()}={},districts=[]) {
 const districtNames=new Map(districts.map(d=>[d.id,d.name]));
 const terms=normalize(query).split(' ').filter(Boolean);
 const matches=items.filter(item=> {
  if(category!=='all'&&item.category!==category)return false;
  if(district!=='all'&&!item.districtIds?.includes(district))return false;
  if(mode==='events') {
   const status=eventStatus(item,today);
   if(status==='unknown'||(eventRange==='current'&&status==='ended')||(eventRange==='past'&&status!=='ended'))return false;
   if(!eventInMonth(item,month))return false;
  }else if(month&&!item.months?.includes(month))return false;
  const haystack=normalize([item.title,item.description,item.story,item.season,item.venue,item.visitTip,seasonCategories[item.category]?.label,...(item.districtIds||[]).map(id=>districtNames.get(id))].join(' '));
  return terms.every(term=>haystack.includes(term));
 });
 return mode==='events'?matches.sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.id.localeCompare(b.id)):matches;
}
