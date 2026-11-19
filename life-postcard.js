// Render the player's actual camera view locally. No upload or saved image history.
const palettes = {
  'west-central': '#995030', beimen: '#366b72', yujing: '#9c5c1e',
  dongshan: '#66533b', anping: '#376b59', yanshui: '#755566',
};
const paper = '#fbf4df', ink = '#233e33';
const font = '"PingFang TC","Microsoft JhengHei","Noto Sans TC",sans-serif';
let current = null;

function linesOf(context, text, width) {
  const lines = [];
  let line = '';
  for (const c of text) {
    if (line && context.measureText(line+c).width > width) { lines.push(line); line = ''; }
    line += c;
  }
  if (line) lines.push(line);
  return lines;
}

function printView(source, stop, memory) {
  const print = document.createElement('canvas');
  const ctx = print.getContext('2d');
  if (!ctx || !source?.width || !source.height) return null;
  const w = 1200, margin = 52, frameW = w-2*margin;
  const frameH = Math.round(Math.min(890,Math.max(440,frameW*source.height/source.width)));
  const frameY = 86, captionY = frameY + frameH + 75;
  const quote = memory ? '我在這一站選了「'+memory+'」。' : (stop.hello || '').trim();
  ctx.font = '400 28px '+font;
  const copy = linesOf(ctx,quote,frameW-40);
  print.width = w;
  print.height = captionY + 124 + copy.length*41;
  const color = palettes[stop.districtId] || ink;
  const date = new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  ctx.fillStyle = paper; ctx.fillRect(0,0,w,print.height);
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.strokeRect(17,17,w-34,print.height-34);
  ctx.fillStyle = color; ctx.font = 'bold 26px '+font;
  ctx.fillText('台南散步明信片',margin,58);
  ctx.textAlign = 'right'; ctx.font = '500 22px '+font;
  ctx.fillText(date,w-margin,58);
  // Preserve the whole scene, including each character when the player rotates the camera.
  const scale=Math.min(frameW/source.width,frameH/source.height);
  const sw=source.width*scale,sh=source.height*scale;
  ctx.fillStyle='#d9dcc5'; ctx.fillRect(margin,frameY,frameW,frameH);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(source,margin+(frameW-sw)/2,frameY+(frameH-sh)/2,sw,sh);
  ctx.fillStyle=ink;ctx.textAlign='left';ctx.font='700 55px '+font;
  ctx.fillText(stop.title,margin,captionY,w-380);
  ctx.fillStyle=color;ctx.font='bold 30px '+font;ctx.textAlign='right';
  ctx.fillText('臺南 · '+stop.name,w-margin,captionY-4);
  ctx.textAlign='left';ctx.fillStyle=ink;ctx.font='400 28px '+font;
  copy.forEach((line,i)=>ctx.fillText(line,margin+2,captionY+52+i*41));
  const footerY=print.height-47;
  ctx.strokeStyle='#c4b99e';ctx.beginPath();ctx.moveTo(margin,footerY-35);ctx.lineTo(w-margin,footerY-35);ctx.stroke();
  ctx.fillStyle=ink;ctx.font='600 24px '+font;ctx.fillText('宏國地政 × 易丞地政',margin,footerY);
  ctx.textAlign='right';ctx.fillStyle=color;ctx.font='400 22px '+font;ctx.fillText('不動產安心城',w-margin,footerY);
  return print;
}

export function openPostcard({source,stop,memory='',trigger}) {
  if (!stop || current?.open) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'life-photo';
  dialog.setAttribute('aria-labelledby','life-photo-title');
  dialog.innerHTML = '<div class="lp-sheet"><header><div><h2 id="life-photo-title">我的街景明信片</h2></div><button type="button" aria-label="收起明信片，回到街上">✕</button></header><div class="lp-print"><img alt="" hidden><p role="status">正在沖印這張街景…</p></div><footer><small>手機也可以長按明信片儲存。</small><a hidden>下載明信片</a></footer></div>';
  const img=dialog.querySelector('img'),status=dialog.querySelector('[role=status]'),link=dialog.querySelector('a');
  const parent=trigger?.closest('dialog');
  let url='';
  const cleanup=()=>{
    parent?.removeEventListener('close',close);
    if(url) URL.revokeObjectURL(url);
    dialog.remove();
    if(current===dialog) current=null;
    if(trigger?.isConnected) trigger.focus({preventScroll:true});
  };
  function close() { if(dialog.open) dialog.close(); }
  parent?.addEventListener('close',close,{once:true});
  dialog.addEventListener('close',cleanup,{once:true});
  dialog.querySelector('button').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  // Copy during the same rendering task while the WebGL drawing buffer is valid.
  let print=null;
  try { print=printView(source,stop,memory); } catch { /* A lost rendering context can be retried. */ }
  document.body.append(dialog);current=dialog;dialog.showModal();
  const fail=()=>{status.textContent='這張街景沒有拍成功。收起明信片，再拍一次。';};
  if(!print){fail();return;}
  print.toBlob(blob=>{
    if(!dialog.isConnected||!dialog.open)return;
    if(!blob){fail();return;}
    url=URL.createObjectURL(blob);
    img.src=url;img.alt=stop.name+'・'+stop.title+'，這次散步拍下的立體街景';img.hidden=false;
    link.href=url;link.download='安心城-'+stop.name+'-'+stop.title+'.jpg';link.hidden=false;
    status.hidden=true;
  },'image/jpeg',.93);
}
