import { videoPlaylists } from './video-links.js?v=5.0.0';
export const officialWebsite='https://homegoestate.github.io/';
export const officialLine='@604gpqef';
export const lineProfile='https://line.me/R/ti/p/%40604gpqef';
export const lineMessage=text=>`https://line.me/R/oaMessage/%40604gpqef/?${encodeURIComponent(text)}`;
export const readingButtonHtml=()=>`<button type="button" class="reading-action" aria-label="切換大字閱讀" aria-pressed="${document.documentElement.classList.contains('read-large')}">A＋</button>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const nextServices={
 'first-home':{label:'首購與貸款',path:'loan-forecast.html',tool:'官網房貸與收支比工具',service:'services.html#loan',keyword:'新青安',video:'loan'},
 'move-home':{label:'換屋與資金',path:'loan-forecast.html',tool:'官網房貸與收支比工具',service:'services.html#loan',keyword:'貸款規定',video:'loan'},
 seller:{label:'賣屋與實拿',path:'property-tax.html',tool:'官網房地合一稅工具',service:'services.html#tax',keyword:'官方服務',video:'sellerTax'},
 'legacy-family':{label:'傳承與照顧',path:'services.html#inheritance',tool:'官網繼承、贈與與信託服務',service:'documents.html',keyword:'官方服務',video:'inheritance'}
};
export function nextServiceHtml(id){const item=nextServices[id]||nextServices['first-home'];const video=videoPlaylists.find(v=>v.id===item.video);return `<section class="next-services"><span class="mission-kicker">把已有的工具接起來</span><h3>這個問題，還可以往哪裡走？</h3><div class="service-links"><a href="${officialWebsite+item.path}" target="_blank" rel="noopener noreferrer">${esc(item.tool)} ↗</a><a href="${officialWebsite+item.service}" target="_blank" rel="noopener noreferrer">查看相關服務與準備資料 ↗</a><a href="${lineMessage(item.keyword)}" target="_blank" rel="noopener noreferrer">到 LINE 輸入「${esc(item.keyword)}」 ↗</a><a href="${video.url}" target="_blank" rel="noopener noreferrer">YouTube・${esc(video.title)} ↗</a></div><p class="mission-fine">部分官網工具有既有身分確認流程。LINE 關鍵字需由您確認送出；這裡不自動傳送遊戲或個人資料。影片請留意發布日期，政策以最新官方公告為準。</p></section>`;}

export function createServiceHub({toast,onMission,onTainan,onGuide}){
 const nav=document.querySelector('.header-nav');
 const hubButton=document.createElement('button');hubButton.className='service-hub-button';hubButton.id='service-hub-button';hubButton.textContent='官網・LINE';hubButton.setAttribute('aria-label','開啟官網、LINE與延伸服務');nav.insertBefore(hubButton,document.querySelector('#feedback-button'));
 const sizeButton=document.createElement('button');sizeButton.id='reading-size';sizeButton.className='reading-size';sizeButton.setAttribute('aria-label','切換大字閱讀');sizeButton.textContent='A＋';document.querySelector('.scene-tools').append(sizeButton);
 let large=false;try{large=localStorage.getItem('anxin-reading-size')==='large';}catch{}
 function setSize(next){large=next;document.documentElement.classList.toggle('read-large',large);document.querySelectorAll('.reading-action,.reading-size').forEach(b=>b.setAttribute('aria-pressed',String(large)));sizeButton.title=large?'目前為大字，點選回到舒適字級':'切換大字閱讀';try{localStorage.setItem('anxin-reading-size',large?'large':'comfortable');}catch{}}
 setSize(large);sizeButton.onclick=()=>{setSize(!large);toast(large?'已切換大字閱讀':'已切換舒適字級');};
 document.addEventListener('click',event=>{if(event.target.closest('.reading-action'))setSize(!large);});
 const dialog=document.createElement('dialog');dialog.id='service-hub';dialog.className='service-hub';dialog.setAttribute('aria-label','官網與LINE服務入口');document.body.append(dialog);
 const links=[['先看看公司與服務','官網','宏國・易丞的專業服務、應備文件與聯絡方式。',officialWebsite],['進一步試算','實用工具','房貸、稅務、賣屋實拿與其他官網工具。',officialWebsite+'tools.html'],['回到官方 LINE','LINE','加入宏國易丞地政｜官方，接續提問或服務導覽。',lineProfile]];
 dialog.innerHTML=`<header class="hub-header"><div><span class="mission-kicker">宏國・易丞 · 一起走下一步</span><h2>玩過一次，接著做什麼？</h2></div><button class="hub-close" aria-label="關閉服務入口">×</button></header><p class="hub-lead">安心城陪您練習選擇，官網提供服務與工具，需要釐清時，再把問題帶回 LINE。</p><div class="hub-route"><span>① 安心城練習</span><i>→</i><span>② 官網找資料</span><i>→</i><span>③ LINE 接續聊</span></div><div class="hub-cards">${links.map(([title,tag,description,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer"><small>${tag}</small><h3>${title} ↗</h3><p>${description}</p></a>`).join('')}</div><section class="hub-keywords"><span class="mission-kicker">不用記很多字，先從這裡開始</span><h3>LINE 裡，可以這樣繼續。</h3><p class="hub-account">宏國易丞地政｜官方 <strong>${officialLine}</strong></p><div class="hub-keyword-list">${[['安心城','叫出角色選單，直接回來玩'],['官方服務','回到既有服務導覽'],['新青安','查看既有貸款政策內容'],['貸款規定','了解貸款、財力與相關說明']].map(([word,description])=>`<div><div><b>${word}</b><p>${description}</p></div><a href="${lineMessage(word)}" target="_blank" rel="noopener noreferrer">帶入 LINE ↗</a><button data-copy-keyword="${word}">複製</button></div>`).join('')}</div><p class="hub-small">手機開啟後，確認內容再按送出。電腦可先複製關鍵字，再使用官方帳號 QR Code；加入好友後不會自動替您送訊息。政策圖片或影片請連同日期及最新公告一起看。</p></section><section class="hub-videos"><span class="mission-kicker">宏國・易丞的影音內容</span><h3>想再聽一次，從主題開始。</h3><div>${videoPlaylists.map(v=>`<a href="${v.url}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ↗</a>`).join('')}</div><p class="hub-small">接續既有 YouTube 播放清單；影片發布時間不同，貸款與稅務條件請搭配最新公告。</p></section><section class="hub-play"><h3>也可以從這裡直接開玩。</h3><div><button data-start="first-home">首購小安</button><button data-start="move-home">換屋阿成</button><button data-start="seller">賣屋美玲</button><button data-start="legacy-family">傳承一家</button><button data-start="tainan">台南散步</button><button data-start="policy">新青安政策小抄</button></div></section><p class="hub-small">遊戲與試算只提供練習；沒有提交預約。後續需要完整判斷時，可在官網查看付費諮詢安排。</p>`;
 function close(){dialog.close();}
 function open(){if(!dialog.open)dialog.showModal();}
 dialog.querySelector('.hub-close').onclick=close;hubButton.onclick=open;
 dialog.querySelectorAll('[data-copy-keyword]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copyKeyword);toast('關鍵字已複製，貼到宏國官方 LINE 即可。');}catch{toast('請手動複製畫面上的關鍵字。');}});
 dialog.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{close();const key=b.dataset.start;if(key==='tainan')onTainan();else if(key==='policy')onGuide('first-home');else onMission(key);});
 return {open,close,setSize};
}
