import {tainanDistricts,tainanSeasons,tainanSources} from './tainan-data.js';
import {tainanAtlas,tainanAtlasSources} from './tainan-atlas.js';
import {tainanEvents} from './tainan-events.js?v=28.0.0';
import {eventInMonth,eventStatus,taiwanDate} from './seasons-state.js';
import {lifeStops} from './life-places.js';
import {districtWalks} from './district-stories.js';
import {districtBites,marketCrops,monthlyWalks,foodSources,foodChecked} from './almanac-data.js?v=28.0.0';
const districts=new Map(tainanDistricts.map(d=>[d.id,d]));
const sources=new Map(tainanSources.map(s=>[s.id,s]));
const seasons=new Map(tainanSeasons.map(s=>[s.id,s]));
const stops=new Map([...lifeStops,...districtWalks].map(s=>[s.districtId,s.id]));
const periods={spring:['春天',[3,4,5]],summer:['夏天',[6,7,8]],autumn:['秋天',[9,10,11]],winter:['冬天',[12,1,2]]};
const months=Array.from({length:12},(_,n)=>n+1);
const festivalIds=['yuejin-light','yanshui-lantern','houbi-orchid','xigang-incense','dragonboat','qigu-seafood','qixi-culture','coming-of-age','confucius-festival','guanziling-autumn','beimen-salt','longqi-light'];
const todayMonth=()=>Number(taiwanDate().slice(5,7));
const clean=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validPeriod=p=>Object.hasOwn(periods,p)||p==='all'||months.some(m=>String(m)===p);
const periodMonths=p=>p==='all'?months:periods[p]?.[1]||[Number(p)];
const areaName=id=>districts.get(id)?.name||'全台南';
const official=(url,title)=>`<a href="${clean(url)}" target="_blank" rel="noopener noreferrer">${clean(title)} ↗</a>`;
const citation=s=>s?`<small>${official(s.url,s.title)}${s.reviewedAt?` · 查核 ${clean(s.reviewedAt)}`:''}</small>`:'';
function handyArea(id) {
  return `<button type="button" class="alm-link" data-browse-area="${clean(id)}">翻到${clean(areaName(id))} →</button>`;
}
function storyCard(s,browse) {
  const refs=s.sourceIds.map(id=>citation(sources.get(id))).join('');
  return `<article class="alm-entry"><div class="alm-meta">${clean(s.districtIds.map(areaName).join('、'))}</div><h4>${clean(s.title)}</h4><strong class="alm-time">${clean(s.season)}</strong><p>${clean(s.description)}</p>${browse?handyArea(s.districtIds[0]):''}<details class="alm-ref"><summary>看官方資料</summary>${refs}</details></article>`;
}
function collection(id,title,items,empty,limit=3) {
  const more=items.length>limit?`<details class="alm-more"><summary>再看其餘 ${items.length-limit} 則</summary><div class="alm-grid">${items.slice(limit).join('')}</div></details>`:'';
  return `<section class="alm-section" id="${id}"><h3 tabindex="-1">${clean(title)}</h3>${items.length?`<div class="alm-grid">${items.slice(0,limit).join('')}</div>${more}`:`<p>${empty}</p>`}</section>`;
}
function datedCard(e) {
  const status={ongoing:'進行中',upcoming:'即將舉行',ended:'已結束'}[eventStatus(e)]||'待確認';
  return `<article class="alm-entry"><div class="alm-meta">${status} · ${clean(e.venue)}</div><h4>${clean(e.title)}</h4><strong class="alm-time">${clean(e.dateLabel)}</strong><p>${clean(e.description)}</p><details class="alm-ref"><summary>出發前確認</summary><p>${clean(e.caution)}</p>${citation({...e.source,reviewedAt:e.reviewedAt})}</details></article>`;
}
let active=null;
export function openAlmanac({trigger,period,area,walk}) {
  if(active?.open)return;
  let p=validPeriod(period)?period:String(todayMonth());
  let a=districts.has(area)?area:'all';
  const d=document.createElement('dialog');
  active=d; d.id='city-almanac'; d.setAttribute('aria-labelledby','alm-title');
  d.innerHTML=`<div class="alm-bar"><h2 id="alm-title">台南風味曆</h2><button type="button" data-close-guide aria-label="關閉風味曆">關閉 ×</button></div><div class="alm-scroll"><div class="alm-filters"><label>什麼時候去<select data-period><option value="all">看全年</option><optgroup label="依月份">${months.map(n=>`<option value="${n}">${n} 月</option>`).join('')}</optgroup><optgroup label="依四季">${Object.entries(periods).map(([k,[name,ms]])=>`<option value="${k}">${name}（${ms.join('、')} 月）</option>`).join('')}</optgroup></select></label><label>想逛哪一區<select data-area><option value="all">全台南 · 37 區</option>${tainanDistricts.map(row=>`<option value="${row.id}">${clean(row.name)}</option>`).join('')}</select></label></div><div data-alm-results></div></div><div class="alm-foot"><button type="button" data-share-guide>分享這一頁 ↗</button><span class="alm-feedback" role="status"></span></div>`;
  const qs=s=>d.querySelector(s),scroll=qs('.alm-scroll'),periodSelect=qs('[data-period]'),areaSelect=qs('[data-area]');
  function updateURL(){
    const url=new URL(location.href);url.searchParams.set('guideMonth',p);url.searchParams.set('guideArea',a);
    history.replaceState(history.state,'',url);
  }
  function render(){
    const ms=periodMonths(p),specific=a!=='all',today=todayMonth();
    const sample=p==='all'?today:ms.includes(today)?today:ms[0];
    const [,,monthTitle,monthText]=monthlyWalks[sample-1],featureId=monthlyWalks[sample-1][1];
    const focal=specific?a:featureId,stop=stops.get(focal),bite=districtBites[focal],place=tainanAtlas[focal].attractions[0];
    const periodTitle=p==='all'?'全年':periods[p]?.[0]||`${p} 月`;
    const quarter=Object.keys(periods).find(k=>periods[k][1].includes(sample));
    const local=s=>!specific||s.districtIds.includes(a);
    const reduced=tainanSeasons.filter(s=>local(s)&&s.months.some(n=>ms.includes(n)));
    const events=tainanEvents.filter(e=>local(e)&&ms.some(n=>eventInMonth(e,n))).sort((l,r)=>Number(eventStatus(l)==='ended')-Number(eventStatus(r)==='ended')||l.startDate.localeCompare(r.startDate));
    const crops=marketCrops.filter(c=>(!specific||c.districts.includes(a))&&c.months.some(n=>ms.includes(n)));
    const farm=foodSources.farm,foodRef=foodSources[bite.source];
    const teaser=specific?bite.text:monthText;
    const past=tainanAtlas[focal].past;
    const foodSource=citation({title:foodRef[0],url:foodRef[1],reviewedAt:foodChecked});
    periodSelect.value=p;areaSelect.value=a;
    qs('[data-alm-results]').innerHTML=`<section class="alm-hero" data-season="${quarter}"><div class="alm-illustration" role="img" aria-label="${periods[quarter][0]}的台南食材插畫"></div><div class="alm-heading"><span class="alm-meta">${clean(periodTitle)}散步 · ${clean(areaName(focal))}</span><h3>${specific?clean(bite.title):clean(monthTitle)}</h3><p>${clean(teaser)}</p><button type="button" class="alm-walk" data-walk-to="${clean(stop)}">在地圖走進${clean(areaName(focal))} →</button>${specific?foodSource:''}</div></section>
      <nav class="alm-shortcuts" aria-label="風味曆章節"><button data-jump="alm-fruit">當季果菜</button><button data-jump="alm-stories">時節故事</button><button data-jump="alm-events">活動日期</button><button data-jump="alm-festival-nav">12 節慶</button></nav>
      <section class="alm-section"><h3>${clean(areaName(focal))}的一站一味</h3><div class="alm-grid"><article class="alm-entry"><div class="alm-meta">${specific?'從前的街坊':'在地餐桌'}</div><h4>${clean(specific?past.title:bite.title)}</h4><p>${clean(specific?past.text:bite.text)}</p>${specific?citation(tainanAtlasSources[past.sourceIds[0]]):foodSource}</article><article class="alm-entry"><div class="alm-meta">順路走走</div><h4>${clean(place.name)}</h4><p>${clean(place.story)}</p><details class="alm-ref"><summary>到現場看什麼</summary><p>${clean(place.highlight)}</p><p>${clean(place.visitNote)}</p>${citation(tainanAtlasSources[place.sourceIds[0]])}</details></article></div>${!specific?handyArea(focal):''}</section>
      <section class="alm-section" id="alm-fruit"><h3 tabindex="-1">${clean(periodTitle)}的當季果菜</h3>${crops.length?`<div class="alm-harvest">${crops.map(c=>`<details><summary>${clean(c.name)}</summary><p>常見產月 ${c.months.map(n=>n+' 月').join('、')}</p><p>${c.districts.map(id=>handyArea(id)).join(' ')}</p>${c.note?`<p>${clean(c.note)}</p>`:''}${c.source&&c.source!=='farm'?citation({title:foodSources[c.source][0],url:foodSources[c.source][1],reviewedAt:foodChecked}):''}</details>`).join('')}</div>`:'<p>這次選擇尚無收錄的產期。可以切到全年翻查，或從本區的餐桌故事開始逛。</p>'}<small>實際採收隨品種及天候變化。${official(farm[1],farm[0])} · 查核 ${foodChecked}</small></section>
      ${collection('alm-stories',periodTitle+'的花果、風景和地方故事',reduced.map(s=>storyCard(s,!specific)),'這一區在這段時間尚未收錄時節故事，全年都能走的「順路走走」在上方。')}
      ${collection('alm-events','有日期的活動',events.map(datedCard),`目前收錄的公告中，這個時段與地區沒有對應場次。${official('https://www.twtainan.net/zh-tw/event/touristcalendar/2026/','查看 2026 臺南旅遊網行事曆')}`)}
      <section class="alm-section alm-festivals" id="alm-festival-nav"><button type="button" data-festival-list aria-expanded="false" aria-controls="alm-fests">翻開全年 12 個地方節慶 <span>＋</span></button><div id="alm-fests" hidden><p>農曆節日每年落在不同的國曆日期，刈香也有自己的週期。這裡記下常見時節，實際日期請看當屆公告。</p><div class="alm-grid"></div></div></section>`;
    qs('.alm-feedback').replaceChildren();updateURL();
  }
  d.addEventListener('change',event=>{if(event.target===periodSelect||event.target===areaSelect){p=periodSelect.value;a=areaSelect.value;render();scroll.scrollTop=0;}});
  d.addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-close-guide'))d.close();
    else if(b.dataset.jump){
      const dest=d.querySelector('#'+b.dataset.jump);
      if(dest){dest.scrollIntoView({block:'start'});dest.querySelector('h3,button')?.focus({preventScroll:true});}
    }
    else if(b.hasAttribute('data-walk-to')){d.close();walk(b.dataset.walkTo);}
    else if(b.hasAttribute('data-browse-area')){a=b.dataset.browseArea;render();scroll.scrollTop=0;areaSelect.focus({preventScroll:true});}
    else if(b.hasAttribute('data-festival-list')){
      const pane=qs('#alm-fests');pane.hidden=!pane.hidden;
      b.setAttribute('aria-expanded',String(!pane.hidden));b.lastElementChild.textContent=pane.hidden?'＋':'−';
      if(!pane.hidden&&!pane.querySelector('article'))pane.querySelector('.alm-grid').innerHTML=festivalIds.map(id=>storyCard(seasons.get(id),true)).join('');
    } else if(b.hasAttribute('data-share-guide')){
      const url=location.href,status=qs('.alm-feedback');
      try{
        if(navigator.share){await navigator.share({title:`台南風味曆｜${areaName(a)}`,url});return;}
        await navigator.clipboard.writeText(url);status.textContent='已複製，可以貼給旅伴。';
      }catch(error){
        if(error.name==='AbortError')return;
        const input=document.createElement('input');input.readOnly=true;input.value=url;input.setAttribute('aria-label','分享網址');status.replaceChildren(input);input.focus();input.select();
      }
    }
  });
  d.addEventListener('close',()=>{
    const url=new URL(location.href);url.searchParams.delete('guideMonth');url.searchParams.delete('guideArea');history.replaceState(history.state,'',url);
    d.remove();active=null;if(trigger?.isConnected)trigger.focus({preventScroll:true});
  },{once:true});
  document.body.append(d);render();d.showModal();periodSelect.focus({preventScroll:true});
}
