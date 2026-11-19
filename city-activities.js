// A chapter sits above the same district and camera. The original games keep their own state.
const chapters = {
  lantern: {title:'今晚，巷口留一盞燈',path:'./first-day/lantern/'},
  'first-day': {title:'小安在台南的第一天',path:'./first-day/'},
  fucheng: {title:'府城四段散步',path:'./fucheng/'},
  atlas: {title:'台南生活圖鑑',path:'./atlas/'}
};
const residents = [
  ['first-home','首購小安','買房與每月負擔'],
  ['move-home','換屋阿成','交屋時間與資金'],
  ['seller','賣屋美玲','賣房後能留下多少'],
  ['legacy-family','傳承一家','照顧與傳承安排']
];

export function connectActivities({onMission,onStop,onService,onFeedback,onChecklist,onSeasons,onCulture}) {
  const menu=document.createElement('dialog'), reader=document.createElement('dialog');
  menu.id='city-activities'; reader.id='city-chapter';
  menu.setAttribute('aria-labelledby','activities-title');reader.setAttribute('aria-labelledby','chapter-title');
  menu.innerHTML='<header><div><small>宏國地政 × 易丞地政</small><h2 id="activities-title">故事與任務</h2></div><button data-back type="button">回到街上</button></header><div class="ca-scroll"><button type="button" class="ca-lantern" data-city-chapter="lantern"><span>府城巷弄 · 街坊故事</span><strong>今晚，巷口留一盞燈</strong><span>陪阿荷準備一張邀請卡 →</span></button><h3>陪一位居民做四個選擇</h3><div class="ca-people">'+residents.map(([id,name,topic])=>'<button type="button" data-city-mission="'+id+'"><strong>'+name+'</strong><small>'+topic+'</small></button>').join('')+'</div><details><summary>更多散步、工具與聯絡</summary><div class="ca-more"><button data-city-chapter="first-day">小安的第一天與點交任務</button><button data-city-chapter="fucheng">府城四段散步</button><button data-city-chapter="atlas">37 區生活圖鑑</button><button data-city-extra="seasons">四季與活動</button><button data-city-extra="culture">文化走讀</button><button data-city-extra="checklist">我的準備清單</button><button data-city-extra="service">試算工具、官網與官方 LINE</button><button data-city-extra="feedback">給安心城一點建議</button></div></details></div>';
  reader.innerHTML='<header><strong id="chapter-title"></strong><button data-back type="button">回到街上</button></header><div class="ca-page"></div>';
  document.body.append(menu,reader);
  let opener=null,frame=null;
  const base=new URL('./',document.baseURI);
  const urls=Object.fromEntries(Object.entries(chapters).map(([id,{path}])=>[id,new URL(path,base)]));
  function returnFocus(){if(opener?.isConnected && !opener.closest('dialog:not([open])'))opener.focus({preventScroll:true});}
  function setChapter(id,src){
    const url=new URL(location.href);
    const entered=Boolean(id)&&!url.searchParams.has('chapter');
    url.searchParams.delete('chapter');url.searchParams.delete('chapterDistrict');url.searchParams.delete('chapterScene');
    if(id){
      url.searchParams.set('chapter',id);
      const district=src.searchParams.get('district'),scene=src.searchParams.get('scene');
      if(id==='atlas' && district)url.searchParams.set('chapterDistrict',district);
      if(id==='first-day' && scene)url.searchParams.set('chapterScene',scene);
    }
    if(entered)history.pushState(history.state,'',url);
    else history.replaceState(history.state,'',url);
  }
  function leaveReader(){
    if(reader.open)reader.close();
  }
  function openChapter(id,href){
    if(!Object.hasOwn(chapters,id))return;
    const src=href?new URL(href,base):new URL(urls[id]);
    if(src.origin!==base.origin || src.pathname.replace(/index\.html$/,'')!==urls[id].pathname)return;
    if(menu.open)menu.close();
    if(id==='lantern')src.searchParams.set('inCity','1');
    const chapterFrame=document.createElement('iframe');
    frame=chapterFrame;frame.title=chapters[id].title;
    reader.querySelector('#chapter-title').textContent=frame.title;
    frame.addEventListener('load',()=>{
      if(frame!==chapterFrame || !reader.open)return;
      const doc=frame.contentDocument;
      if(!doc)return;
      const childUrl=new URL(doc.URL);
      if(childUrl.origin===base.origin && childUrl.pathname===urls[id].pathname)setChapter(id,childUrl);
      doc.addEventListener('click',e=>{
        const link=e.target.closest('a[href]');
        if(!link||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||link.hasAttribute('download'))return;
        const dest=new URL(link.href);
        if(dest.origin!==base.origin)return;
        const pathname=dest.pathname.replace(/index\.html$/,'');
        if(pathname===base.pathname){
          e.preventDefault();leaveReader();
          if(residents.some(([key])=>key===dest.searchParams.get('start')))onMission(dest.searchParams.get('start'));
          else if(dest.searchParams.get('start')==='life'&&dest.searchParams.has('scene'))onStop(dest.searchParams.get('scene'));
          return;
        }
        const next=Object.keys(chapters).find(key=>urls[key].pathname===pathname);
        if(next && (next!==id || dest.search!==childUrl.search)){e.preventDefault();openChapter(next,dest.href);}
      });
      doc.addEventListener('keydown',e=>{
        if(e.key==='Escape'&&!e.defaultPrevented&&!doc.querySelector('dialog[open]')){e.preventDefault();leaveReader();}
      });
    });
    reader.querySelector('.ca-page').replaceChildren(frame);
    frame.src=src.href;
    reader.dataset.chapter=id;
    if(!reader.open)reader.showModal();
    reader.querySelector('[data-back]').focus({preventScroll:true});
    setChapter(id,src);
  }
  reader.addEventListener('close',()=>{
    if(reader.open)return;
    frame?.remove();frame=null;
    delete reader.dataset.chapter;
    setChapter(null);
    returnFocus();
  });
  reader.querySelector('[data-back]').onclick=leaveReader;
  reader.addEventListener('city-chapter-mission',e=>{
    if(e.target!==frame || !reader.open || reader.dataset.chapter!=='lantern' || !residents.some(([id])=>id===e.detail))return;
    e.preventDefault();
    onMission(e.detail);
  });
  menu.querySelector('[data-back]').onclick=()=>menu.close();
  menu.addEventListener('close',()=>{if(!document.querySelector('dialog[open]:not(#life-tour)'))returnFocus();});
  const extras={service:onService,feedback:onFeedback,checklist:onChecklist,seasons:onSeasons,culture:onCulture};
  document.addEventListener('click',e=>{
    const item=e.target.closest('[data-life-activities],[data-city-chapter],[data-city-mission],[data-city-extra]');
    if(!item||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    if(item.closest('#life-tour'))opener=item;
    e.preventDefault();
    if(item.hasAttribute('data-life-activities')){
      if(!menu.open)menu.showModal();
    }else if(item.dataset.cityChapter)openChapter(item.dataset.cityChapter,item.getAttribute('href'));
    else if(item.dataset.cityMission){menu.close();onMission(item.dataset.cityMission);}
    else if(Object.hasOwn(extras,item.dataset.cityExtra)){menu.close();extras[item.dataset.cityExtra]();}
  });
  function openFromUrl(params){
    const id=params.get('chapter');
    if(!Object.hasOwn(chapters,id))return;
    const src=new URL(urls[id]);
    if(id==='atlas'&&params.get('chapterDistrict'))src.searchParams.set('district',params.get('chapterDistrict'));
    if(id==='first-day'&&params.get('chapterScene')){src.searchParams.set('walk','1');src.searchParams.set('scene',params.get('chapterScene'));src.hash='street';}
    openChapter(id,src.href);
  }
  window.addEventListener('popstate',()=>{
    const params=new URLSearchParams(location.search);
    if(Object.hasOwn(chapters,params.get('chapter')))openFromUrl(params);
    else if(reader.open)leaveReader();
  });
  return {openFromUrl};
}
