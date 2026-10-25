import {readingButtonHtml} from './service-hub.js?v=8.0.0';
import {tainanRegions,tainanDistricts,tainanSources,tainanSeasons,tainanReviewedAt} from './tainan-data.js?v=8.0.0';
import {tainanUpdates,tainanUpdatesReviewedAt} from './tainan-updates.js?v=8.0.0';
import {tainanAtlas,tainanAtlasSources,tainanAtlasReviewedAt} from './tainan-atlas.js?v=8.0.0';
import {PASSPORT_KEY,restorePassport,stampDistrict,filterDistricts,filterAttractions,quizOutcome} from './tainan-state.js?v=8.0.0';

import {culturePlaces} from './culture-data.js?v=10.0.0';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ids=tainanDistricts.map(d=>d.id);
const districtById=new Map(tainanDistricts.map(d=>[d.id,d]));
const sourceById=new Map(tainanSources.map(s=>[s.id,s]));
const regionById=new Map(tainanRegions.map(r=>[r.id,r]));
const regionLabels={coast:'海線',city:'府城',plains:'平原',hills:'山城'};
const storyPhases=[['past','過去的故事','地方記憶'],['present','現在的樣子','此刻風景'],['future','往哪裡走','看懂方向']];
const attractionCategories={heritage:{label:'文化古蹟',icon:'🏛️'},nature:{label:'自然生態',icon:'🌿'},museum:{label:'博物館舍',icon:'🏺'},landscape:{label:'地方風景',icon:'⛅'}};
const attractionPageSize=12;

function landscape(region) {
 const common='<path d="M0 180Q90 146 180 168T360 154V240H0Z" fill="#d8dfbb"/><circle cx="292" cy="51" r="24" fill="#e5c582"/>';
 const art={
  coast:'<path d="M0 164Q90 137 180 168T360 160V240H0Z" fill="#a6c6c3"/><g stroke="#7aafa8" stroke-width="2" fill="none"><path d="M0 191Q65 173 123 193M236 206Q300 186 360 198"/></g><path d="M59 173L111 85L165 173Z" fill="#fff9e9"/><path d="M111 85L165 173H126Z" fill="#deded3"/><g stroke="#b7c6ad" stroke-width="3"><path d="M168 175L302 156L333 189L192 212Z" fill="#e5e4cb"/><path d="M209 170L235 205M255 163L283 198M180 192L318 173"/></g><g stroke="#47706c" stroke-width="3" fill="none"><path d="M211 90q10 -10 20 0q10 -10 20 0M239 115q7 -7 14 0q7 -7 14 0"/></g><path d="M40 165v-29m0 15l-8 -10m8 1l8 -13" stroke="#6c967c" stroke-width="4" fill="none"/>',
  city:'<path d="M0 207Q89 181 180 203T360 197V240H0Z" fill="#9fc1b9"/><path d="M43 181V100h135v82" fill="#b17658"/><path d="M34 103L111 59L188 103Z" fill="#686e56"/><path d="M70 181v-37q0 -38 38 -38t38 38v37" fill="#f1d7af"/><path d="M87 181v-35q0 -21 21 -21t21 21v35" fill="#7d795e"/><path d="M57 111h27m49 0h30M55 129h18m74 0h17" stroke="#d89b72" stroke-width="4"/><path d="M218 185V121h76v64" fill="#dfc298"/><path d="M207 121l49 -31l50 31Z" fill="#9b604d"/><path d="M231 143h13v20h-13zm34 0h13v20h-13z" fill="#658774"/><path d="M160 214l36 -12l45 8l-19 12h-46Z" fill="#b77c4d"/><path d="M195 205v-50l25 35h-25" fill="#fbf3db" stroke="#9b997a" stroke-width="2"/>',
  plains:'<path d="M0 171L360 146V240H0Z" fill="#a8b87f"/><g stroke="#d6dba9" stroke-width="4"><path d="M0 201l360 -27M0 230l360 -28M75 165l-30 75M167 157l-9 83M263 150l20 90"/></g><path d="M54 159V93h82v68" fill="#e4d9b4"/><path d="M45 96L95 61L146 96Z" fill="#9c7353"/><path d="M76 162v-42h36v42" fill="#7e8a5e"/><ellipse cx="259" cy="185" rx="60" ry="22" fill="#a5c1ae"/><ellipse cx="235" cy="182" rx="18" ry="6" fill="#698c64"/><ellipse cx="276" cy="190" rx="16" ry="5" fill="#6b9069"/><path d="M260 186v-22" stroke="#6b8863" stroke-width="3"/><path d="M260 169q-24 -7 -12 -20q12 3 12 20q0 -21 12 -20q13 14 -12 20" fill="#cf9d96"/><g fill="#ead694"><path d="M169 134l4 -28l6 27ZM187 131l5 -30l6 29Z"/></g>',
  hills:'<path d="M19 179L94 60L179 179Z" fill="#b1bc8d"/><path d="M124 180L213 42L325 180Z" fill="#91aa80"/><path d="M213 42L325 180H245Z" fill="#76976f"/><path d="M76 187v-64" stroke="#89734e" stroke-width="10"/><g fill="#72915e"><circle cx="77" cy="111" r="39"/><circle cx="47" cy="125" r="26"/><circle cx="105" cy="128" r="29"/></g><g fill="#e8b853"><ellipse cx="58" cy="125" rx="10" ry="15" transform="rotate(30 58 125)"/><ellipse cx="91" cy="108" rx="10" ry="15" transform="rotate(30 91 108)"/><ellipse cx="97" cy="144" rx="9" ry="13" transform="rotate(30 97 144)"/></g><path d="M203 198v-59h104v59" fill="#cba377"/><path d="M191 143l11 -23h106l12 23" fill="#bf7953"/><path d="M216 144v48M295 144v48" stroke="#8f7955" stroke-width="5"/><path d="M212 172h89v27h-89Z" fill="#987b53"/><g fill="#e9ba59"><ellipse cx="227" cy="170" rx="10" ry="6"/><ellipse cx="252" cy="170" rx="10" ry="6"/><ellipse cx="277" cy="170" rx="10" ry="6"/></g>'
 };
 return `<svg viewBox="0 0 360 240" class="tn-landscape" aria-hidden="true"><rect width="360" height="240" rx="20" fill="#f0ead7"/>${common}${art[region]||art.hills}<path d="M0 239H360" stroke="#c7cda8" stroke-width="2"/></svg>`;
}

export function createTainanExplorer({onStartMission,onFeedback,onExploreCulture,toast}) {
 const nav=document.querySelector('.header-nav');
 const button=document.createElement('button');button.id='tainan-button';button.className='tainan-nav';button.textContent='台南散步';nav.insertBefore(button,document.querySelector('#open-checklist'));
 const dialog=document.createElement('dialog');dialog.id='tainan-dialog';dialog.className='tn-dialog';dialog.setAttribute('aria-label','台南散步集章');document.body.append(dialog);
 let passport;try{passport=restorePassport(localStorage.getItem(PASSPORT_KEY),ids);}catch{passport=restorePassport(null,ids);}
 let tab='explore',region='all',query='',selected=(tainanDistricts.find(d=>d.name==='玉井區')||tainanDistricts[0]).id,month=0,updateFilter='all',saved=true;
 let storyPhase='past',attractionCategory='all',attractionQuery='',attractionLimit=attractionPageSize,returnFocus=null;
 const picks=new Map();
 function save(){try{localStorage.setItem(PASSPORT_KEY,JSON.stringify(passport));saved=true;}catch{saved=false;}}
 function close(){dialog.close();document.body.classList.remove('tn-exploring');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function open(regionId){
  if(!dialog.open)returnFocus=document.activeElement;
  tab='explore';query='';storyPhase='past';region=regionById.has(regionId)?regionId:'all';
  if(region!=='all'){const preferred={coast:'七股區',city:'安平區',plains:'後壁區',hills:'玉井區'};selected=(tainanDistricts.find(d=>d.name===preferred[region])||tainanDistricts.find(d=>d.region===region)).id;}
  render({resetScroll:true});if(!dialog.open)dialog.showModal();document.body.classList.add('tn-exploring');
 }
 function openTarget({districtId,tab:targetTab='explore',attractionQuery:targetQuery='',month:targetMonth=0,phase='past',seasonId}={}){
  if(!dialog.open)returnFocus=document.activeElement;
  const district=districtById.get(districtId);
  if(district)selected=district.id;
  region=district?.region||'all';query='';
  tab=['explore','attractions','seasons','updates','passport'].includes(targetTab)?targetTab:'explore';
  storyPhase=storyPhases.some(([id])=>id===phase)?phase:'past';
  attractionCategory='all';attractionQuery=String(targetQuery).slice(0,60);attractionLimit=attractionPageSize;
  month=Number.isInteger(targetMonth)&&targetMonth>=0&&targetMonth<=12?targetMonth:0;
  render({resetScroll:true});if(!dialog.open)dialog.showModal();document.body.classList.add('tn-exploring');
  requestAnimationFrame(()=>{
   if(!dialog.open)return;
   const seasonCard=Array.from(dialog.querySelectorAll('[data-season-card]')).find(card=>card.dataset.seasonCard===seasonId);
   if(seasonCard)seasonCard.focus();
   else if(tab==='explore'&&storyPhase==='future')dialog.querySelector('[data-story-tab="future"]')?.focus();
   else dialog.querySelector(tab==='attractions'?'#tn-atlas-title':'#tn-district-title')?.focus({preventScroll:true});
  });
 }
 button.onclick=()=>open();dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 function sourcesHtml(sourceIds){return sourceIds.map(id=>sourceById.get(id)).filter(Boolean).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`).join('');}
 function atlasSourcesHtml(sourceIds){
  const sources=[...new Set(sourceIds||[])].map(id=>tainanAtlasSources[id]).filter(Boolean);
  return sources.length?`<ul class="tn-atlas-source-list">${sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><small>來源發布：${esc(s.publishedAt||'原文未列明')} · 查核：${esc(s.reviewedAt||tainanAtlasReviewedAt)}</small>${s.verificationNote?`<p class="tn-verification-note">${esc(s.verificationNote)}</p>`:''}</li>`).join('')}</ul>`:'<p>來源資料尚待補齊，請以官方公告確認。</p>';
 }
 function storySourcesHtml(story){
  return `<details class="tn-sources tn-atlas-sources"><summary>資料來源與日期 · 查核 ${esc(story.reviewedAt||tainanAtlasReviewedAt)}</summary>${story.publishedAt?`<p>本則資料發布：${esc(story.publishedAt)}</p>`:''}${atlasSourcesHtml(story.sourceIds)}<p>人工整理的資料快照；請開啟來源確認後續更新。</p></details>`;
 }
 function nearbyDistrictsHtml(atlas){
  const nearby=[...new Set(atlas?.nearbyDistrictIds||[])].map(id=>districtById.get(id)).filter(Boolean);
  return nearby.length?`<section class="tn-nearby" aria-labelledby="tn-nearby-title"><h3 id="tn-nearby-title">再認識附近一區</h3><div>${nearby.map(d=>`<button data-place="${esc(d.id)}"><span aria-hidden="true">${esc(d.icon)}</span>${esc(d.name)} →</button>`).join('')}</div></section>`:'';
 }
 function showDistrict(id){
  if(!districtById.has(id))return;
  selected=id;tab='explore';query='';storyPhase='past';region=districtById.get(id).region;render({resetScroll:true});
  dialog.querySelector('#tn-district-title')?.focus({preventScroll:innerWidth>760});
 }
 function nextDistrict(){const items=filterDistricts(tainanDistricts,region);const remaining=items.find(d=>!passport.stamps.includes(d.id));const index=items.findIndex(d=>d.id===selected);showDistrict((remaining||items[(index+1)%items.length]||tainanDistricts[0]).id);}
 function answer(optionId){
  const district=districtById.get(selected);const result=quizOutcome(district,optionId);if(!result.valid)return;
  picks.set(selected,optionId);
  if(result.correct){const isNew=!passport.stamps.includes(selected);passport=stampDistrict(passport,selected,ids);save();if(isNew)toast(`集到${district.name}風物章 · ${passport.stamps.length} / 37`);}
  render();dialog.querySelector('.tn-answer')?.focus();
 }
 function regionNav(){return `<div class="tn-region-options" aria-label="依散步主題分組"><button data-region="all" aria-pressed="${region==='all'}">全部 37 區</button>${tainanRegions.map(r=>`<button data-region="${r.id}" aria-pressed="${region===r.id}">${esc(regionLabels[r.id])}</button>`).join('')}</div>`;}
 function cultureEntryHtml(districtId){
  const count=culturePlaces.filter(p=>p.districtId===districtId).length;
  return count?`<aside class="tn-culture-invite"><div><strong>熟悉的地方，還藏著哪些故事？</strong><p>這裡整理了 ${count} 個古蹟與文化線索，換個角度再認識一次。</p></div><button data-culture-district="${esc(districtId)}" aria-haspopup="dialog" aria-controls="culture-dialog">走進文化走讀 →</button></aside>`:'';
 }
 function storyHtml(atlas){
  if(!atlas)return '<p class="tn-empty">這一區的地方故事正在整理，先看看代表特色與在地小知識。</p>';
  const story=atlas[storyPhase];
  if(!story)return '<p class="tn-empty">這段故事尚待整理。</p>';
  const phase=storyPhases.find(([id])=>id===storyPhase);
  const futureLabel=storyPhase==='future'?(story.kind==='project'?`<div class="tn-direction-label is-project"><span>官方工程／計畫</span><strong>查核時階段：${esc(story.status)}</strong></div>`:`<div class="tn-direction-label is-outlook"><span>編輯觀察</span><strong>地方觀察方向，非已核定建設</strong></div>`):'';
  return `<div class="tn-story-tabs" role="tablist" aria-label="地方故事的時間軸">${storyPhases.map(([id,label],i)=>`<button id="tn-story-tab-${id}" type="button" role="tab" data-story-tab="${id}" aria-selected="${storyPhase===id}" aria-controls="tn-story-panel" tabindex="${storyPhase===id?'0':'-1'}"><small aria-hidden="true">0${i+1}</small><span>${label}</span></button>`).join('')}</div><section id="tn-story-panel" class="tn-story-panel tn-story-${storyPhase}" role="tabpanel" aria-labelledby="tn-story-tab-${storyPhase}" tabindex="0"><span class="tn-story-label">${phase[2]}</span>${futureLabel}<h3>${esc(story.title)}</h3><p class="tn-story-copy">${esc(story.text)}</p>${storySourcesHtml(story)}</section>`;
 }
 function attractionCardHtml(d,attraction,{inDistrict=false}={}){
  const category=attractionCategories[attraction.category]||attractionCategories.landscape;
  const cardId=`tn-attraction-${d.id}-${attraction.id}`;
  const mapUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${attraction.name} 台南市 ${d.name}`)}`;
  const heading=inDistrict?'h4':'h3';
  return `<article class="tn-attraction-card ${inDistrict?'is-district':''}" aria-labelledby="${esc(cardId)}"><div class="tn-attraction-art" aria-hidden="true">${landscape(d.region)}<span class="tn-attraction-icon">${category.icon}</span></div><div class="tn-attraction-content"><div class="tn-attraction-overline"><span>${esc(category.label)}</span><button data-place="${esc(d.id)}" aria-label="認識${esc(d.name)}的地方故事">${esc(d.name)} →</button></div><${heading} id="${esc(cardId)}">${inDistrict?esc(attraction.name):`<button class="tn-attraction-title" data-place="${esc(d.id)}" aria-label="從${esc(attraction.name)}走進${esc(d.name)}的故事">${esc(attraction.name)}</button>`}</${heading}><p class="tn-attraction-highlight"><span>值得停一下</span>${esc(attraction.highlight)}</p><details class="tn-attraction-story"><summary>景點故事與出發提醒</summary><div class="tn-attraction-story-body"><p>${esc(attraction.story)}</p><div class="tn-visit-note"><strong>出發前，留意這件事</strong><p>${esc(attraction.visitNote)}</p></div><details class="tn-sources tn-atlas-sources"><summary>故事來源 · 查核 ${esc(tainanAtlasReviewedAt)}</summary>${atlasSourcesHtml(attraction.sourceIds)}</details></div></details><div class="tn-attraction-actions"><a href="${esc(attraction.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(attraction.name)}官方介紹，另開視窗">官方介紹 ↗</a><a href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer" aria-label="在 Google 地圖查詢${esc(d.name)}${esc(attraction.name)}，另開視窗">Google 地圖查詢 ↗</a></div></div></article>`;
 }
 function exploreHtml(){
  const filtered=filterDistricts(tainanDistricts,region,query,tainanAtlas);
  const d=districtById.get(selected),r=regionById.get(d.region),atlas=tainanAtlas[d.id];
  const pick=picks.get(selected),result=pick?quizOutcome(d,pick):null,earned=passport.stamps.includes(d.id);
  return `<div class="tn-explore-layout"><aside class="tn-directory" aria-label="尋找台南行政區"><span class="tn-kicker">走進不同的台南</span><h2>今天，想去哪裡？</h2><label class="tn-search-label" for="tn-search">找行政區、地名或特色</label><input id="tn-search" type="search" placeholder="試試玉井、水道、鹽田…" value="${esc(query)}" maxlength="60">${regionNav()}<p class="tn-group-note">海線、府城、平原、山城為主題分組</p><p class="tn-count" role="status">找到 ${filtered.length} 區 · 已集 ${passport.stamps.length} / 37 章</p><div class="tn-district-list">${filtered.length?filtered.map(item=>`<button data-district="${esc(item.id)}" aria-pressed="${item.id===selected}"><span class="tn-list-icon" aria-hidden="true">${esc(item.icon)}</span><span><b>${esc(item.name)}</b><small>${esc(item.tagline)}</small></span><i aria-label="${passport.stamps.includes(item.id)?'已集章':'尚未集章'}">${passport.stamps.includes(item.id)?'✓':'＋'}</i></button>`).join(''):'<p class="tn-empty">沒有找到這個詞，試試行政區名稱或清除搜尋。</p>'}</div><p class="tn-footnote">這是散步主題導覽，並非官方分區或精準地圖。每個地方，都可以從一段故事開始。</p></aside><article class="tn-district-detail" style="--tn-accent:${esc(r?.color||'#718568')}"><header class="tn-postcard"><div><span class="tn-kicker">${esc(regionLabels[d.region])}散步 · TAINAN</span><h2 id="tn-district-title" tabindex="-1">${esc(d.name)}</h2><p>${esc(d.tagline)}</p><span class="tn-postmark ${earned?'is-earned':''}">${earned?'已集風物章':'等你來集章'}<small>ANXIN CITY</small></span></div>${landscape(d.region)}</header><div class="tn-district-content"><section class="tn-feature"><span class="tn-section-number">01 / 沿著時間，認識地方</span><p class="tn-place-intro">${esc(d.feature)}</p>${storyHtml(atlas)}${cultureEntryHtml(d.id)}<div class="tn-season-line"><span>適合留意的時節</span><p>${esc(d.season)}</p></div></section><section class="tn-district-attractions" aria-labelledby="tn-attractions-title"><div class="tn-section-heading"><div><span class="tn-section-number">02 / 帶著故事，去看一個地方</span><h3 id="tn-attractions-title">${esc(d.name)}，值得停下的風景</h3></div><button class="tn-open-attractions" data-open-attractions="${esc(d.name)}">探索更多景點 →</button></div><div class="tn-district-attraction-list">${atlas?.attractions?.length?atlas.attractions.map(a=>attractionCardHtml(d,a,{inDistrict:true})).join(''):'<p class="tn-empty">代表景點資料正在整理。</p>'}</div><p class="tn-map-note">地圖連結以景點名稱與行政區查詢位置，並非導航路線；不讀取你的位置，出發安排請查看官方介紹。</p></section><section class="tn-quiz"><span class="tn-section-number">03 / 一題在地小知識</span><h3>${esc(d.quiz.question)}</h3><div class="tn-quiz-options">${d.quiz.options.map((o,i)=>`<button data-quiz="${esc(o.id)}" aria-pressed="${pick===o.id}" class="${pick===o.id?(result.correct?'answer-correct':'answer-other'):''}"><span>${String.fromCharCode(65+i)}</span><b>${esc(o.text)}</b>${pick===o.id?`<i>${result.correct?'✓':'↻'}</i>`:''}</button>`).join('')}</div>${result?`<div class="tn-answer ${result.correct?'is-correct':''}" tabindex="-1" role="status"><strong>${result.correct?`集到${esc(d.name)}風物章！`:'換個角度，再試一次。'}</strong><p>${esc(result.message)}</p>${result.correct?'<button class="tn-next-district">繼續下一站 →</button>':''}</div>`:'<p class="tn-small-note">答對集章；選錯也可以重試，慢慢認識就好。</p>'}</section><details class="tn-life tn-life-observation"><summary><span>散步之後</span><strong>想多認識這裡的日常生活？</strong></summary><div><p>${esc(d.livingTip)}</p><p class="tn-small-note">生活觀察建議；實際通勤、公共設施、環境與物件條件，需要到現場確認。</p><button class="tn-start-mission">帶著生活需求，陪小安看房 ↗</button></div></details>${nearbyDistrictsHtml(atlas)}<details class="tn-sources"><summary>地方特色補充資料 · 查核 ${esc(tainanReviewedAt)}</summary>${sourcesHtml(d.sourceIds)}<p>農作花況受天候影響，活動日期與開放安排請查看當年度公告。景觀插畫為意象示意。</p></details><button class="tn-context-feedback">補充${esc(d.name)}的故事，或告訴我們哪裡可改進 ↗</button></div></article></div>`;
 }
 function attractionsHtml(){
  const items=filterAttractions(tainanDistricts,tainanAtlas,attractionCategory,attractionQuery);
  const shown=items.slice(0,attractionLimit),allCount=filterAttractions(tainanDistricts,tainanAtlas).length;
  return `<section class="tn-page tn-atlas-page"><div class="tn-page-heading tn-atlas-heading"><div><span class="tn-kicker">FOLLOW A STORY, FIND A PLACE</span><h2 id="tn-atlas-title" tabindex="-1">從一個景點，走進一個地方。</h2><p>古蹟裡的時間、河海邊的生態、館舍裡的記憶。先挑一個好奇的風景，再認識它所在的行政區。</p></div><span class="tn-atlas-count-mark" aria-label="已整理${allCount}個景點"><b>${allCount}</b><small>個故事入口</small></span></div><div class="tn-atlas-controls"><label for="tn-atlas-search">找行政區或景點</label><div class="tn-atlas-search-row"><input id="tn-atlas-search" data-atlas-search type="search" value="${esc(attractionQuery)}" placeholder="試試水道、鹽田、梅嶺…" maxlength="60"><button class="tn-clear-attractions" ${attractionQuery?'':'hidden'} aria-label="清除景點搜尋">清除</button></div><div class="tn-attraction-filters" aria-label="依景點類別探索">${[['all',{label:'全部景點',icon:'✦'}],...Object.entries(attractionCategories)].map(([id,category])=>`<button data-attraction-category="${id}" aria-pressed="${attractionCategory===id}"><span aria-hidden="true">${category.icon}</span>${category.label}</button>`).join('')}</div></div><p class="tn-atlas-result-count" role="status">找到 ${items.length} 個景點${items.length>shown.length?` · 目前顯示 ${shown.length} 個`:''}<span>點景點名稱或行政區，可接著讀地方故事。</span></p><div class="tn-attraction-grid">${shown.length?shown.map(a=>attractionCardHtml(districtById.get(a.districtId),a)).join(''):'<div class="tn-atlas-empty"><span aria-hidden="true">✦</span><h3>換一個線索，再找找看。</h3><p>可以試試行政區名稱，或選「全部景點」放寬類別。</p><button class="tn-reset-attractions">清除搜尋與分類</button></div>'}</div>${items.length>shown.length?`<button class="tn-more-attractions">再看 ${Math.min(attractionPageSize,items.length-shown.length)} 個景點 <span>還有 ${items.length-shown.length} 個 →</span></button>`:''}<p class="tn-map-note">景點資料查核：${esc(tainanAtlasReviewedAt)}。插畫為風景意象；地圖按景點名稱查詢位置，並非導航路線，不讀取你的位置。開放時間、參觀方式與現場安排請以官方公告為準。</p></section>`;
 }

 function seasonsHtml(){const entries=tainanSeasons.filter(s=>month===0||s.months.includes(month));return `<section class="tn-page"><div class="tn-page-heading"><span class="tn-kicker">THE RHYTHM OF TAINAN</span><h2>跟著時節，換一種散步方式。</h2><p>記住芒果的香、花開的樣子與節慶的故事。這裡介紹常見時節，沒有把它當作今年的活動行事曆。</p></div><div class="tn-months" aria-label="依常見月份探索"><button data-month="0" aria-pressed="${month===0}">看全年</button>${Array.from({length:12},(_,i)=>`<button data-month="${i+1}" aria-pressed="${month===i+1}">${i+1} 月</button>`).join('')}</div><p class="tn-footnote">月份是一般季節範圍；農曆節日對應國曆日期每年不同。出發前請確認當年度官網、花果況及現場安排。</p><div class="tn-season-grid">${entries.map(s=>{const first=districtById.get(s.districtIds[0]);return `<article class="tn-season-card" data-season-card="${esc(s.id)}" tabindex="-1"><div class="tn-season-art">${landscape(first?.region||'hills')}<span>${esc(s.season)}</span></div><div class="tn-season-content"><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><div class="tn-place-links">${s.districtIds.map(id=>districtById.get(id)).filter(Boolean).map(d=>`<button data-place="${d.id}">${esc(d.name)} →</button>`).join('')}</div><details class="tn-sources"><summary>確認官方介紹與年度公告</summary>${sourcesHtml(s.sourceIds)}</details></div></article>`;}).join('')||'<p class="tn-empty">這個月份尚未整理專屬季節卡；仍可到37區探索全年特色。</p>'}</div></section>`;}
 function updatesHtml(){const records=tainanUpdates.filter(x=>updateFilter==='all'||x.kind===updateFilter);const old=(Date.now()-Date.parse(`${tainanUpdatesReviewedAt}T00:00:00+08:00`))/86400000>90;return `<section class="tn-page"><div class="tn-page-heading"><span class="tn-kicker">UNDERSTAND THE CHANGE</span><h2>看懂改變，也看清進度。</h2><p>先認識台南正在發生的建設與公共服務，再問：這和我的日常生活有什麼關係？</p></div><div class="tn-update-notice ${old?'is-old':''}"><strong>資料查核：${esc(tainanUpdatesReviewedAt)} · 人工整理快照</strong><p>${old?'距離本次查核已有一段時間，請先開啟官方來源確認現況。':'各項目分別標示目前階段、資料日期及官方來源。'} 本頁不自動更新；規劃、核定、施工與營運的意義不同，不能據此推論房價。</p></div><div class="tn-filter-buttons" aria-label="資訊類型">${[['all','全部'],['development','地方發展'],['policy','政策與公共服務']].map(([id,label])=>`<button data-update-filter="${id}" aria-pressed="${updateFilter===id}">${label}</button>`).join('')}</div><div class="tn-update-grid">${records.map(item=>`<article class="tn-update-card"><div class="tn-update-top"><span>${item.kind==='policy'?'政策與公共服務':'地方發展'}</span><b>查核時：${esc(item.status)}</b></div><h3>${esc(item.title)}</h3><p class="tn-update-area">${item.districtNames.length>10?'臺南全市；適用條件與服務範圍見官方說明':esc(item.districtNames.join('・'))}</p><p>${esc(item.summary)}</p><div class="tn-status-detail">${esc(item.statusDetail)}</div><div class="tn-life-question"><strong>換成生活問題，可以這樣問</strong><p>${esc(item.lifeQuestion)}</p></div><p class="tn-small-note">${esc(item.caution)}</p><dl class="tn-dates"><div><dt>資料發布</dt><dd>${esc(item.publishedAt||'來源未列明，請見原文')}</dd></div><div><dt>生效／啟用</dt><dd>${esc(item.effectiveAt||'無單一日期，詳見階段說明')}</dd></div><div><dt>本次查核</dt><dd>${esc(item.reviewedAt)}</dd></div></dl><div class="tn-update-sources">${item.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}${s.date?` · ${esc(s.date)}`:''} ↗</a>`).join('')}</div></article>`).join('')}</div></section>`;}
 function passportHtml(){const count=passport.stamps.length;return `<section class="tn-page tn-passport-page"><div class="tn-page-heading"><span class="tn-kicker">YOUR TAINAN FIELD NOTES</span><h2>把台南，一區一區收進心裡。</h2><p>每回答一題，就多認識一個地方。這本風物集章冊只存在這台裝置，沒有登入或上傳遊玩紀錄。</p></div><div class="tn-passport-progress"><strong>${count}<small>/ 37</small></strong><div><b>${count===37?'37區足跡收集完成':'你的台南散步足跡'}</b><p>${count===0?'先從一個好奇的地方開始。':count===37?'下一次散步，帶著這些故事到現場看看。':'不急著一次走完，喜歡的地方可以再回訪。'}</p><progress value="${count}" max="37" aria-label="已收集的行政區風物章"></progress></div></div><div class="tn-stamp-grid">${tainanDistricts.map(d=>{const earned=passport.stamps.includes(d.id);return `<button class="tn-stamp ${earned?'is-earned':''}" data-place="${d.id}" aria-label="${esc(d.name)}，${earned?'已集章，重新探索':'尚未集章，前往探索'}"><span>${earned?esc(d.icon):'✦'}</span><b>${esc(d.name)}</b><small>${earned?'已認識':'待探索'}</small></button>`;}).join('')}</div><div class="tn-passport-actions"><button class="tn-copy-passport">複製我的散步足跡</button><button class="tn-feedback-general">分享使用回饋 ↗</button></div><p class="tn-footnote">清除瀏覽器資料或換裝置，足跡不會同步；不收集定位或真實居住資料。</p></section>`;}
 function render({resetScroll=false}={}){
  const bodyScroll=resetScroll?0:(dialog.querySelector('.tn-body')?.scrollTop||0);
  const tabScroll=dialog.querySelector('.tn-tabs')?.scrollLeft||0;
  const list=dialog.querySelector('.tn-district-list'),listScroll={top:list?.scrollTop||0,left:list?.scrollLeft||0};
  dialog.innerHTML=`<div class="tn-shell"><header class="tn-header"><div><span class="tn-kicker">宏國・易丞 · TAINAN FIELD NOTES</span><h1>台南散步集章</h1></div><div class="tn-header-actions">${readingButtonHtml()}<span class="tn-total"><b>${passport.stamps.length}</b> / 37 章</span><button class="tn-close" aria-label="關閉台南散步，回到城市">×</button></div></header><nav class="tn-tabs" aria-label="台南散步內容"><button data-open-culture aria-haspopup="dialog" aria-controls="culture-dialog">文化走讀 ↗</button>${[['explore','認識 37 區'],['attractions','景點探索'],['seasons','四季風物'],['updates','發展與政策'],['passport','我的足跡']].map(([id,label])=>`<button data-tn-tab="${id}" aria-pressed="${tab===id}">${label}${id==='passport'?` <span>${passport.stamps.length}</span>`:''}</button>`).join('')}</nav><div class="tn-body">${tab==='explore'?exploreHtml():tab==='attractions'?attractionsHtml():tab==='seasons'?seasonsHtml():tab==='updates'?updatesHtml():passportHtml()}</div><footer class="tn-footer"><span>在地的故事，陪你找到喜歡的生活。</span><small>${saved?'集章僅存於本機':'此瀏覽器無法保存，仍可繼續探索'}</small></footer></div>`;
  dialog.querySelector('.tn-body').scrollTop=bodyScroll;
  dialog.querySelector('.tn-tabs').scrollLeft=tabScroll;
  const nextList=dialog.querySelector('.tn-district-list');if(nextList){nextList.scrollTop=listScroll.top;nextList.scrollLeft=listScroll.left;}
  dialog.querySelector('.tn-close').onclick=close;
  dialog.querySelector('[data-open-culture]').onclick=()=>{close();onExploreCulture?.({});};
  dialog.querySelectorAll('[data-culture-district]').forEach(b=>b.onclick=()=>{const districtId=b.dataset.cultureDistrict;close();onExploreCulture?.({districtId});});
  dialog.querySelectorAll('[data-tn-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tnTab;render({resetScroll:true});dialog.querySelector(`[data-tn-tab="${tab}"]`)?.focus({preventScroll:true});});
  dialog.querySelectorAll('[data-region]').forEach(b=>b.onclick=()=>{region=b.dataset.region;query='';const items=filterDistricts(tainanDistricts,region);if(!items.some(d=>d.id===selected)){selected=items[0].id;storyPhase='past';}render();dialog.querySelector(`[data-region="${region}"]`)?.focus({preventScroll:true});});
  dialog.querySelectorAll('[data-district]').forEach(b=>b.onclick=()=>{selected=b.dataset.district;storyPhase='past';render();dialog.querySelector('#tn-district-title')?.focus({preventScroll:innerWidth>760});});
  function bindSearch(selector,setValue){
   const search=dialog.querySelector(selector);if(!search)return;
   const searchNow=event=>{if(event.isComposing)return;const start=search.selectionStart,end=search.selectionEnd;setValue(search.value);render();const current=dialog.querySelector(selector);current.focus({preventScroll:true});if(start!==null&&end!==null)current.setSelectionRange(start,end);};
   search.oninput=searchNow;search.oncompositionend=searchNow;
  }
  bindSearch('#tn-search',value=>{query=value;});
  bindSearch('[data-atlas-search]',value=>{attractionQuery=value;attractionLimit=attractionPageSize;});
  function switchStory(phase){storyPhase=phase;render();dialog.querySelector(`[data-story-tab="${phase}"]`)?.focus({preventScroll:true});}
  dialog.querySelectorAll('[data-story-tab]').forEach(b=>{
   b.onclick=()=>switchStory(b.dataset.storyTab);
   b.onkeydown=event=>{const keys=['ArrowLeft','ArrowRight','Home','End'];if(!keys.includes(event.key))return;event.preventDefault();const phaseIds=storyPhases.map(([id])=>id);let index=phaseIds.indexOf(storyPhase);if(event.key==='Home')index=0;else if(event.key==='End')index=phaseIds.length-1;else index=(index+(event.key==='ArrowRight'?1:-1)+phaseIds.length)%phaseIds.length;switchStory(phaseIds[index]);};
  });
  dialog.querySelectorAll('[data-attraction-category]').forEach(b=>b.onclick=()=>{attractionCategory=b.dataset.attractionCategory;attractionLimit=attractionPageSize;render();dialog.querySelector(`[data-attraction-category="${attractionCategory}"]`)?.focus({preventScroll:true});});
  dialog.querySelectorAll('[data-open-attractions]').forEach(b=>b.onclick=()=>{tab='attractions';attractionCategory='all';attractionQuery=b.dataset.openAttractions;attractionLimit=attractionPageSize;render({resetScroll:true});dialog.querySelector('#tn-atlas-title')?.focus({preventScroll:true});});
  dialog.querySelector('.tn-clear-attractions')?.addEventListener('click',()=>{attractionQuery='';attractionLimit=attractionPageSize;render();dialog.querySelector('[data-atlas-search]')?.focus({preventScroll:true});});
  dialog.querySelector('.tn-reset-attractions')?.addEventListener('click',()=>{attractionQuery='';attractionCategory='all';attractionLimit=attractionPageSize;render({resetScroll:true});dialog.querySelector('[data-atlas-search]')?.focus({preventScroll:true});});
  dialog.querySelector('.tn-more-attractions')?.addEventListener('click',()=>{const firstNew=attractionLimit;attractionLimit+=attractionPageSize;render();dialog.querySelectorAll('.tn-attraction-title')[firstNew]?.focus();});
  dialog.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>answer(b.dataset.quiz));
  dialog.querySelector('.tn-next-district')?.addEventListener('click',nextDistrict);
  dialog.querySelector('.tn-start-mission')?.addEventListener('click',()=>{close();onStartMission('first-home');});
  dialog.querySelectorAll('[data-place]').forEach(b=>b.onclick=()=>showDistrict(b.dataset.place));
  dialog.querySelectorAll('[data-month]').forEach(b=>b.onclick=()=>{month=Number(b.dataset.month);render();dialog.querySelector(`[data-month="${month}"]`)?.focus({preventScroll:true});});
  dialog.querySelectorAll('[data-update-filter]').forEach(b=>b.onclick=()=>{updateFilter=b.dataset.updateFilter;render();dialog.querySelector(`[data-update-filter="${updateFilter}"]`)?.focus({preventScroll:true});});
  dialog.querySelector('.tn-context-feedback')?.addEventListener('click',()=>{const d=districtById.get(selected);close();onFeedback({scene:'general',persona:'none',contextLabel:`台南散步｜${d.name}`});});
  dialog.querySelector('.tn-feedback-general')?.addEventListener('click',()=>{close();onFeedback({scene:'general',persona:'none',contextLabel:'台南散步集章'});});
  dialog.querySelector('.tn-copy-passport')?.addEventListener('click',async()=>{const text=`我的台南散步足跡｜宏國・易丞安心城\n已認識 ${passport.stamps.length} / 37 區\n${passport.stamps.map(id=>districtById.get(id).name).join('、')||'準備出發'}\n這是網站小知識集章，並非實際到訪或定位紀錄。\nhttps://homegoestate.github.io/anxin-city/`;try{await navigator.clipboard.writeText(text);toast('散步足跡已複製。');}catch{toast('瀏覽器未允許複製，可直接查看集章冊。');}});
 }
 return {open,openTarget,close};
}
