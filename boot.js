// Keep contact links and a retry available even if a module download fails.
const loading=document.querySelector('#loading');
const retry=document.querySelector('#retry-site');
const caption=document.querySelector('#loading-caption');
const fallback=document.querySelector('#loading-fallback');
let starting=false;
async function start(){
  if(starting)return;
  starting=true;retry.hidden=true;caption.textContent='正在準備人生任務與城市…';
  const slow=setTimeout(()=>{fallback.hidden=false;caption.textContent='網路較慢，您也可以先查看官網或官方 LINE。';},8000);
  try{await import('./app.js?v=14.0.0');clearTimeout(slow);document.documentElement.dataset.siteReady='true';}
  catch(error){clearTimeout(slow);console.error('Experience could not start',error);loading.hidden=false;loading.classList.remove('loaded');caption.textContent='這次載入未完成，請重試，或先使用下方聯絡入口。';fallback.hidden=false;retry.hidden=false;}
  finally{starting=false;}
}
retry.onclick=()=>location.reload();
start();
