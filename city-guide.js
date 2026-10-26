const regions = {
  city: {name:'府城',line:'從城門、廟埕到巷弄，讀一段仍在生活裡的歷史。',tags:'古蹟・街區・文化走讀'},
  coast: {name:'海線',line:'走近鹽田、潟湖與濕地，看海與人的生活如何相遇。',tags:'鹽業記憶・濕地・候鳥'},
  plains: {name:'平原',line:'沿著農田、聚落與水路，認識台南四季的生活風景。',tags:'農村・水利・四季風物'},
  hills: {name:'山城',line:'循著山路認識果鄉與地方故事，慢慢安排一趟小旅行。',tags:'芒果・山林・地方記憶'},
};
export function createCityGuide({onExplore,onResidents,onOverview}) {
  const panel=document.createElement('aside');
  panel.id='city-guide';panel.hidden=true;panel.setAttribute('aria-label','這一區的散步提案');
  panel.innerHTML='<div class="city-guide-top"><span>跟著城市，認識台南</span><button type="button" aria-label="收起散步提案">×</button></div><h2 tabindex="-1"></h2><p class="city-guide-copy"></p><p class="city-guide-tags"></p><div class="city-guide-actions"><button type="button" class="primary-button">認識這一區 →</button><button type="button" class="city-guide-neighbours">和街坊聊聊</button><button type="button" class="city-guide-overview">回到全景</button></div>';
  document.querySelector('#experience').append(panel);
  let selected;
  function close(){panel.hidden=true;document.body.classList.remove('region-preview');if(!document.body.classList.contains('scene-selected')){const intro=document.querySelector('#intro');intro.inert=false;intro.removeAttribute('aria-hidden');}}
  panel.querySelector('.city-guide-top button').onclick=()=>{close();onOverview();};
  panel.querySelector('.primary-button').onclick=()=>onExplore(selected);
  panel.querySelector('.city-guide-neighbours').onclick=()=>onResidents();
  panel.querySelector('.city-guide-overview').onclick=()=>{close();onOverview();};
  return {close,open(region){selected=region==='plain'?'plains':region;const item=regions[selected];if(!item)return;panel.querySelector('h2').textContent=item.name;panel.querySelector('.city-guide-copy').textContent=item.line;panel.querySelector('.city-guide-tags').textContent=item.tags;panel.hidden=false;document.body.classList.add('region-preview');const intro=document.querySelector('#intro');intro.inert=true;intro.setAttribute('aria-hidden','true');}};
}
