/* Original, code-drawn Tainan miniature streets. No remote or copied assets.
 * Artwork shares street-world's road centres; all water and building footprints
 * remain inside the blocks. Labels and interactive characters belong to the host.
 * These are imaginative daily-life vignettes, not geographic replicas or shops.
 */

const scenes = {
  'shuixian-morning': { kind:'market', sky:['#d9e8dc','#f9ecd2'], ground:'#e6ddc2', road:'#fbf0d8', edge:'#cdbd9c', roof:'#ae6954', wall:'#ead0a4', leaf:'#789367', light:'#fff3b9', ink:'#746650' },
  'yujing-morning': { kind:'orchard', sky:['#d7e5dc','#f3e8c7'], ground:'#dce0b8', road:'#f9eed2', edge:'#bdc59a', roof:'#857f54', wall:'#edd4a0', leaf:'#6f8e55', light:'#fff2ae', ink:'#6e7250' },
  'anping-afternoon': { kind:'alley', sky:['#d8e5df','#f4dfc0'], ground:'#e9d6b6', road:'#fff1d7', edge:'#d1b797', roof:'#a86650', wall:'#e5b38a', leaf:'#7e956d', light:'#ffdb95', ink:'#856655' },
  'dongshan-afternoon': { kind:'coffee', sky:['#dee5d5','#f5e3ba'], ground:'#daddb2', road:'#f9edcf', edge:'#bac194', roof:'#788162', wall:'#e9cf9b', leaf:'#617e50', light:'#fbe5a0', ink:'#697150' },
  'yanshui-evening': { kind:'canal', sky:['#829da9','#edc9ab'], ground:'#d5ccb3', road:'#f1e4cd', edge:'#b7ae9b', roof:'#697c7b', wall:'#d8bf9e', leaf:'#697f6b', light:'#ffd69a', ink:'#687271' },
  'beimen-evening': { kind:'salt', sky:['#8ba7b1','#efceb5'], ground:'#ded9c4', road:'#f6e9d2', edge:'#c3bba6', roof:'#8c8583', wall:'#e7d6b7', leaf:'#8b9b77', light:'#ffdeb1', ink:'#7d7c77' },
};

const group = (x,y,content,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${content}</g>`;
const stroke = 'stroke-linecap="round" stroke-linejoin="round"';
const line = (d,color,width=2,opacity=1) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}" ${stroke}/>`;

function defs(p,id) {
  return `<defs>
    <linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>
    <linearGradient id="${id}-wall" x2="1" y2="1"><stop stop-color="${p.wall}"/><stop offset="1" stop-color="${p.wall}" stop-opacity=".65"/></linearGradient>
    <linearGradient id="${id}-roof" x2="0" y2="1"><stop stop-color="${p.roof}"/><stop offset="1" stop-color="${p.ink}"/></linearGradient>
    <linearGradient id="${id}-water" x2="0" y2="1"><stop stop-color="#9db5b0"/><stop offset="1" stop-color="#c4c9b8"/></linearGradient>
    <linearGradient id="${id}-glass" x2="1" y2="1"><stop stop-color="#b6c8ac"/><stop offset=".5" stop-color="#849e8e"/><stop offset="1" stop-color="#58766e"/></linearGradient>
    <linearGradient id="${id}-canal" x2=".3" y2="1"><stop stop-color="#6e9b9d"/><stop offset=".5" stop-color="#95b7b0"/><stop offset="1" stop-color="#617f83"/></linearGradient>
    <linearGradient id="${id}-copper" x2=".7" y2="1"><stop stop-color="#d6b882"/><stop offset=".46" stop-color="#ae8556"/><stop offset="1" stop-color="#886c4e"/></linearGradient>
    <radialGradient id="${id}-sun"><stop stop-color="${p.light}" stop-opacity=".65"/><stop offset="1" stop-color="${p.light}" stop-opacity="0"/></radialGradient>
    <pattern id="${id}-paper" width="37" height="29" patternUnits="userSpaceOnUse"><path d="M3 7h2m16 13h1M31 4h2M10 26h1" stroke="#8d8267" stroke-width="1" opacity=".12"/><path d="M12 11h3m17 12h2" stroke="#fff8e0" stroke-width="1.5" opacity=".42"/></pattern>
    <pattern id="${id}-brick" width="28" height="14" patternUnits="userSpaceOnUse"><path d="M0 0h28M0 14h28M14 0v7M0 7h28M5 7v7M26 7v7" fill="none" stroke="#f8d7b3" stroke-width="1" opacity=".45"/></pattern>
    <pattern id="${id}-tiles" width="15" height="11" patternUnits="userSpaceOnUse"><path d="M0 8q7-5 15 0M7 0v5" fill="none" stroke="#f6dfb3" stroke-width="1.1" opacity=".26"/></pattern>
    <pattern id="${id}-paving" width="30" height="18" patternUnits="userSpaceOnUse"><path d="M0 17h30M15 0v17" fill="none" stroke="${p.edge}" stroke-width=".8" opacity=".25"/></pattern>
    <pattern id="${id}-timber" width="17" height="39" patternUnits="userSpaceOnUse"><path d="M2 0v39m12-39v39M6 5q5 5 0 12t0 16" fill="none" stroke="#f1d6a5" stroke-width=".8" opacity=".3"/></pattern>
    <pattern id="${id}-saltclay" width="22" height="16" patternUnits="userSpaceOnUse"><path d="M0 0h22v16H0Z" fill="#bb8e77"/><path d="M0 15h22M11 0v15" stroke="#e4c6a4" stroke-width="1.4"/><path d="M2 3h7m5 6h5M2 11h6" stroke="#e7b698" opacity=".45" stroke-width="1"/></pattern>
    <pattern id="${id}-woven" width="8" height="7" patternUnits="userSpaceOnUse"><path d="M0 1h8M0 5h8m-6-5v7m4-7v7" fill="none" stroke="#ebcc94" stroke-width=".8" opacity=".6"/></pattern>
    <pattern id="${id}-stone" width="36" height="24" patternUnits="userSpaceOnUse"><path d="m1 2 13-1 4 9-11 5-6-5Zm20 0 14 2-2 12-13-3ZM9 19l13-3 6 7H9Z" fill="none" stroke="#a39678" opacity=".25" stroke-width="1"/></pattern>
    <pattern id="${id}-roofribs" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M2 0v12m9-12v12" stroke="#453e35" stroke-opacity=".12" stroke-width="2"/><path d="M4 0v12" stroke="#ffe8bd" stroke-opacity=".2" stroke-width="1.2"/></pattern>
  </defs>`;
}

function cloud(x,y,s=1) {
  return group(x,y,'<path d="M-42 7c-15-13-4-25 9-24 3-20 29-25 39-11 14-8 30 0 32 13 19-2 26 18 11 23-19 5-75 4-91-1Z" fill="#fff6df" opacity=".65"/>',s);
}

function birds(x,y,color='#6c8380',s=1) {
  return group(x,y,line('M0 4q7-10 14 0 7-10 14 0m19-14q5-7 10 0 5-7 10 0',color,1.8,.7),s);
}

function tree(x,y,s=1,color='#7e9469',fruit=false) {
  return group(x,y,`<ellipse cy="4" rx="30" ry="9" fill="#566346" opacity=".13"/><ellipse cx="7" cy="5" rx="19" ry="5" fill="#526448" opacity=".08"/>${line('M0 0 1-53M1-24-15-44M1-30 18-50','#927a55',5)}${line('M-1-2 0-26M-1-29-12-43','#c3ad7f',1.5,.75)}<g class="life-leaves"><path d="M-30-29c-14-13-10-32 4-37-2-20 22-29 35-19 15-9 34 4 31 20 19 13 10 35-4 38-11 17-48 16-66-2Z" fill="${color}"/><path d="M-37-49q13 10 25-1 9 16 23 5 12 13 31-5 4 18-12 24-5 11-25 10-25 1-35-13Z" fill="#405f46" opacity=".17"/><path d="M-25-66q4-11 18-11m15-3q15 0 19 11M-33-50q5-12 15-12m17 2q6-8 15-3m7 9q10-4 14 5" fill="none" stroke="#e8e3a7" stroke-width="4" opacity=".33" ${stroke}/><g fill="#d4d99a" opacity=".42"><ellipse cx="-21" cy="-58" rx="3.4" ry="1.6" transform="rotate(-30 -21 -58)"/><ellipse cx="4" cy="-74" rx="3" ry="1.5"/><ellipse cx="23" cy="-44" rx="3" ry="1.5"/><ellipse cx="-9" cy="-33" rx="3" ry="1.5"/></g>${line('M-22-39q7 7 15 1m10-10q10 8 18 0','#456a4d',1.8,.35)}${fruit?'<g fill="#e9b64c" stroke="#ac7f3e" stroke-width=".8"><ellipse cx="-18" cy="-44" rx="5" ry="7" transform="rotate(-20 -18 -44)"/><ellipse cx="12" cy="-61" rx="5" ry="7" transform="rotate(22 12 -61)"/><ellipse cx="23" cy="-34" rx="5" ry="7"/><ellipse cx="-4" cy="-65" rx="4" ry="6"/></g><path d="M-20-47v4m31-22-1 4m12 25v4" stroke="#f8d77d" stroke-width="1.5" stroke-linecap="round"/>':''}</g><path d="M-8 3q7-7 16 0" fill="none" stroke="#7d875b" stroke-width="2"/>`,s);
}

function shrub(x,y,s=1,color='#829872') {
  return group(x,y,`<path d="M-24 0c-10-10-3-25 10-23 5-17 24-17 28-3 16-3 25 15 13 26Z" fill="${color}"/>${line('M-17-8q5-7 11-4m10-7q8 0 12 7','#eef0c4',2,.35)}`,s);
}

function pot(x,y,s=1,flower=false) {
  return group(x,y,`<ellipse cy="3" rx="12" ry="4" fill="#5f6652" opacity=".12"/><path d="M-10-13h20L7 1H-7Z" fill="#b88766"/><path d="M-12-14h24v5h-24Z" fill="#d4aa80"/>${line('M-4-13-7-34M1-13 4-38M5-15 14-28','#6e8b62',2)}<path d="M-7-26q-17-12-12-18 15 1 15 16M5-29q2-16 13-17 4 14-13 17M9-21q13-15 20-8-2 11-20 12" fill="#809968"/>${flower?'<g fill="#e3b166"><circle cx="4" cy="-40" r="4"/><circle cx="-9" cy="-35" r="3"/></g>':''}`,s);
}

function basket(x,y,s=1,type='fruit') {
  const produce=type==='green'?'<path d="M-19-13q-10-15 0-18 10-10 17 4 9-17 17-8 12 1 7 18Z" fill="#829650"/>':type==='coffee'?'<path d="M-21-12q-3-14 9-15 6-5 12 1 11-9 21 4v12Z" fill="#725c45"/><g fill="#9e805b"><ellipse cx="-11" cy="-19" rx="3" ry="2"/><ellipse cx="4" cy="-22" rx="3" ry="2"/><ellipse cx="13" cy="-15" rx="3" ry="2"/></g>':'<g fill="#e7b655" stroke="#c89342" stroke-width=".7"><ellipse cx="-12" cy="-17" rx="8" ry="9"/><ellipse cy="-23" rx="8" ry="9"/><ellipse cx="12" cy="-17" rx="8" ry="9"/></g><path d="M-1-31q7-8 14-2" fill="none" stroke="#798c50" stroke-width="3"/>';
  return group(x,y,`<ellipse cy="3" rx="25" ry="6" fill="#736849" opacity=".12"/>${produce}<path d="M-24-13h48L18 2h-36Z" fill="#bd9562" stroke="#9e7c51" stroke-width="1"/><path d="M-23-13h46" stroke="#e1bb81" stroke-width="4"/>${line('M-14-10-11 0M-4-10-3 0M6-10 5 0M16-10 13 0M-20-5h40','#e2c28d',1.4)}`,s);
}

function windowAt(x,y,w=25,h=31,color='#79968a',lit=false) {
  return group(x,y,`<rect x="-3" y="-3" width="${w+6}" height="${h+6}" rx="2" fill="#a38a66"/><path d="M-2-2h${w+4}v2H0v${h}h-2Z" fill="#efdab5"/><rect width="${w}" height="${h}" rx="1" fill="${lit?'#edc98c':color}"/><path d="M0 0h${w}v4H3v${h}H0Z" fill="#485c50" opacity=".24"/><path d="M3 3h${Math.max(6,w/2-5)}L3 ${h-8}Z" fill="#f6edd2" opacity="${lit?'.42':'.22'}"/><path d="M${w/2} 0v${h}M0 ${h/2}h${w}" stroke="#e8cf9f" stroke-width="2.2"/><path d="M${w/2+1.8} 1v${h-2}M1 ${h/2+1.5}h${w-2}" stroke="#7e775c" stroke-width=".6" opacity=".7"/><path d="M-5 ${h+4}h${w+10}" stroke="#b49972" stroke-width="4" ${stroke}/><path d="M-5 ${h+2}h${w+10}" stroke="#f1d9ad" stroke-width="1.6" ${stroke}/>${lit?`<path d="M3 ${h-5}h${w-6}v3H3Z" fill="#fff2c5" opacity=".5"/>`:''}`);
}

function lantern(x,y,s=1,lit=false) {
  return group(x,y,`${lit?'<circle cy="2" r="22" fill="#f7d195" opacity=".12"/>':''}${line('M0-20v8','#8e7957',1.4)}<ellipse cy="-1" rx="8" ry="12" fill="${lit?'#e8b56c':'#cf8860'}"/>${line('M-4-11v20M4-11v20','#f5d29c',.9,.5)}<path d="M-4-13h8M-4 11h8" stroke="#a57b52" stroke-width="3"/>${line('M0 12v6','#c89558',2)}`,s);
}

function house(x,y,w,h,p,id,opts={}) {
  const { brick=false, awning=false, lit=false, balcony=false, shutter=false, color=p.wall, roof=p.roof }=opts;
  const roofShape=`M-8 ${-h+2} 7 ${-h-18} ${w-15} ${-h-18} ${w+8} ${-h+2}Z`;
  const winW=w>110?26:19;
  return group(x,y,`<path d="M-3 3 ${w+10} 3 ${w+22} 13 11 13Z" fill="#5f644f" opacity=".15"/><path d="M${w} ${-h} ${w+11} ${-h+7}V1l-11 4Z" fill="#b29874"/>${line(`M${w+8} ${-h+16}V-3`,'#8c795e',1,.35)}<rect y="${-h}" width="${w}" height="${h}" rx="2" fill="${color}"/><path d="M0 ${-h+3}h${w}v${h-3}h-12V${-h+16}H0Z" fill="#7d6851" opacity=".08"/>${brick?`<rect y="${-h}" width="${w}" height="${h}" fill="url(#${id}-brick)"/>`:''}<path d="M2 ${-h+3}h${w-4}v17H2Z" fill="#584f42" opacity=".14"/><path d="M0-12h${w}V0H0Z" fill="#8a7e64" opacity=".18"/><path d="M1 ${-h+17}V-15" stroke="#fff0d0" stroke-width="2" opacity=".55"/>
    <path d="M-8 ${-h+2}h${w+16}l-4 8H-4Z" fill="#77604c"/><path d="${roofShape}" fill="${roof}"/><path d="${roofShape}" fill="url(#${id}-roofribs)"/><path d="${roofShape}" fill="url(#${id}-tiles)"/>${line(`M-9 ${-h+3}h${w+18}`,p.ink,4)}${line(`M-7 ${-h+1}h${w+14}`,'#efd3a1',1.5,.65)}${line(`M10 ${-h-17}h${w-24}`,'#edcf9b',3,.8)}${line(`M11 ${-h-21}h${w-26}`,roof,4)}<path d="M9 ${-h-21}h${w-24}" stroke="#f4dab0" stroke-width="1.2" opacity=".7"/>
    ${windowAt(13,-h+21,winW,29,'#7b9280',lit)}${w>100?windowAt(w-winW-14,-h+21,winW,29,'#7b9280',lit):''}
    ${shutter?`<g fill="#759383" stroke="#526e62" stroke-width="1"><path d="M10 ${-h+21} 0 ${-h+18}v33l10-2ZM${w-10} ${-h+21}l10-3v33l-10-2Z"/></g>`:''}
    <path d="M${w/2-19} 0v-49q19-17 38 0V0Z" fill="#a58c68"/><path d="M${w/2-16} 0v-47q16-15 32 0V0Z" fill="${lit?'#a88663':'#638477'}"/><path d="M${w/2-13}-43q13-12 26 0v39h-26Z" fill="${lit?'#4f625b':'#3d625a'}" opacity=".35"/><path d="M${w/2} -53V0" stroke="#d9bd8c" stroke-width="2"/><circle cx="${w/2+7}" cy="-21" r="1.6" fill="#ead4a7"/>${line(`M${w/2-12}-42v29m7-33v30m10-30v30m7-29v28`,'#e6d5a8',1,.35)}<path d="M${w/2-18} 0h36l4 5h-44Z" fill="#c7b18d"/>${line(`M${w/2-21} 5h42`,'#f3dfb8',1.7)}
    ${balcony?`<path d="M5 ${-h+60}h${w-10}m-${w-15} 0v-15m15 15v-15m15 15v-15m15 15v-15m15 15v-15m15 15v-15m15 15v-15m15 15v-15" fill="none" stroke="#8d785c" stroke-width="2"/><path d="M2 ${-h+63}h${w-4}" stroke="#c3a77c" stroke-width="5"/>`:''}
    ${awning?`<path d="M0-45h${w}v12H0Z" fill="#4e5844" opacity=".16"/><path d="M-4-66h${w+7}l8 21H-12Z" fill="${p.roof}"/>${Array.from({length:Math.floor(w/22)},(_,i)=>`<path d="M${4+i*22}-66h10l3 21h-13Z" fill="#f2dfb4" opacity=".85"/>`).join('')}<path d="M-12-45h${w+23}v6H-12Z" fill="${p.roof}"/>${Array.from({length:Math.floor((w+23)/12)},(_,i)=>`<path d="M${-12+i*12}-44q6 8 12 0" fill="none" stroke="#e6c99a" stroke-width="1" opacity=".65"/>`).join('')}${line(`M-4-66h${w+7}`,'#f7e0b3',1.5,.65)}${line(`M-8-42V0M${w+7}-42V0`,'#9c845b',2)}${line(`M-8-41 0-32M${w+7}-41 ${w-1}-32`,'#7d6c51',1.5)}`:''}
    ${line(`M3 0h${w-6}`,'#b19974',5)}${line(`M5 4h${w-10}`,'#f5e0b8',2)}<path d="M5-7h14m${w-42}-49h12M9 ${-h+12}h10" stroke="#fff0d2" stroke-width="2" opacity=".4"/>`);
}

function temple(x,y,p,id,s=1) {
  return group(x,y,`<ellipse cx="69" cy="5" rx="85" ry="10" fill="#646547" opacity=".12"/><path d="M3-70h132V0H3Z" fill="#d2ad79"/><path d="M12-68h114v10H12Z" fill="#a3664d"/><path d="M20-59v58m98-58v58" stroke="#b46950" stroke-width="10"/><path d="M42-45h55V0H42Z" fill="#67755a"/><path d="M69-45V0" stroke="#b99c65" stroke-width="3"/><path d="M-15-75q14 7 21-10l25-17h76l25 17q8 17 21 10l-11 21H-3Z" fill="${p.roof}"/><path d="M-15-75q14 7 21-10l25-17h76l25 17q8 17 21 10l-11 21H-3Z" fill="url(#${id}-tiles)"/>${line('M-4-58h145M31-100h77','#efc783',3)}${line('M56-107q-8-10-17-4m44 4q8-10 17-4','#bd8e56',3)}<circle cx="69" cy="-109" r="5" fill="#dfb761"/><rect x="51" y="-65" width="37" height="14" rx="2" fill="#756b43"/><g fill="#d4b66b"><circle cx="60" cy="-58" r="2"/><circle cx="69" cy="-58" r="2"/><circle cx="78" cy="-58" r="2"/></g>${lantern(29,-43,.7)}${lantern(109,-43,.7)}<path d="M-3 1h144l7 9H-10Z" fill="#c8ba97"/>${line('M-7 10h152','#e7d6b3',2)}`,s);
}

function stall(x,y,w,p,id,green=false) {
  return group(x,y,`<ellipse cx="${w/2}" cy="3" rx="${w/2+10}" ry="9" fill="#6f6f4e" opacity=".13"/><path d="M8-85V0m${w-16}-85V0" stroke="#a88c60" stroke-width="4"/><path d="M-5-79 7-101h${w-14}l12 22Z" fill="${green?'#819576':'#c79362'}"/><path d="M-5-79 7-101h${w-14}l12 22Z" fill="url(#${id}-tiles)"/>${Array.from({length:Math.floor(w/24)},(_,i)=>`<path d="M${9+i*24}-101h12l3 22H${6+i*24}Z" fill="#f4dfad" opacity=".9"/>`).join('')}${line(`M-5-78h${w+10}`,'#957d56',3)}<path d="M2-34h${w-4}v33H2Z" fill="#ac8d60"/><path d="M-3-36h${w+6}v8H-3Z" fill="#d4b27b"/>${line(`M10-25v21m18-21v21m18-21v21m18-21v21m18-21v21m18-21v21`,'#d4b482',2)}${basket(26,-38,.72)}${basket(w/2+6,-38,.68,green?'green':'fruit')}${w>100?basket(w-20,-38,.64,'green'):''}`);
}

function bench(x,y,p,s=1) {
  return group(x,y,`${line('M-21-15h42m-42 7h42',p.roof,5)}${line('M-17-5v12M17-5v12',p.ink,3)}${line('M-25 0h50','#ba9c72',6)}`,s);
}

function lamp(x,y,p,id,lit=false) {
  return group(x,y,`${lit?`<ellipse cx="10" cy="-60" rx="32" ry="37" fill="url(#${id}-sun)"/>`:''}<ellipse cy="2" rx="10" ry="4" fill="#5c6756" opacity=".12"/>${line('M0 0v-64q0-8 8-8h11',p.ink,3.5)}<path d="M9-73h15l-3 12h-9Z" fill="${lit?'#f3cd8e':'#d8ba7e'}"/>${line('M8-74h17',p.ink,3)}`,.58);
}

function roads(p,id) {
  const d='M60 220H940M60 440H940M60 540H940M130 175V565M360 175V565M500 175V565M620 175V565M870 175V565';
  return `<g fill="none" ${stroke}><path d="${d}" stroke="${p.edge}" stroke-width="50"/><path d="${d}" stroke="#fff6e4" stroke-opacity=".55" stroke-width="46"/><path d="${d}" stroke="${p.road}" stroke-width="42"/><path d="${d}" stroke="url(#${id}-paper)" stroke-width="41"/>${line('M69 540H931',p.edge,1.3,.5)}${line('M500 184V561',p.edge,1.1,.4)}</g><g fill="${p.edge}" opacity=".25">${[176,242,304,402,550,680,743,804,922].map((x,i)=>`<ellipse cx="${x}" cy="${i%2?448:432}" rx="3" ry="1"/>`).join('')}</g>`;
}

function foreground(p,id,evening=false) {
  return `<path d="M0 585q90-16 170-2t180 0 180 3 180-1 290 0v35H0Z" fill="${p.leaf}" opacity=".18"/>${shrub(53,602,.9,p.leaf)}${shrub(951,598,1.2,p.leaf)}${shrub(459,612,.7,p.leaf)}${pot(306,497,.65,true)}${pot(675,497,.65)}${bench(232,494,p)}${bench(757,494,p)}${lamp(73,508,p,id,evening)}${lamp(927,508,p,id,evening)}${line('M164 514h170m318 0h180',p.edge,1,.65)}<path d="M9 615h982" stroke="${p.edge}" stroke-width="2"/><rect width="1000" height="620" fill="url(#${id}-paper)" pointer-events="none"/>`;
}

function sky(p,id,evening=false) {
  return `<rect width="1000" height="620" fill="${p.ground}"/><rect width="1000" height="181" fill="url(#${id}-sky)"/><circle cx="${evening?770:802}" cy="${evening?105:58}" r="96" fill="url(#${id}-sun)"/><circle cx="${evening?770:802}" cy="${evening?105:58}" r="${evening?27:24}" fill="${p.light}" opacity=".85"/>${cloud(184,47,.9)}${cloud(539,39,.65)}${cloud(936,65,.65)}${birds(422,60,p.ink,.7)}`;
}

function market(p,id) {
  return `<path d="M0 157q90-40 191-11t197-10 232 10 193-4 187 3v39H0Z" fill="#a7b48e" opacity=".6"/>${house(24,164,67,62,p,id,{color:'#c6cfaf',roof:'#899d80'})}${temple(225,166,p,id,.96)}${house(683,165,130,77,p,id,{awning:true,color:'#e8ce9e'})}${tree(442,167,.67,p.leaf)}${tree(944,177,.85,p.leaf)}
    ${roads(p,id)}
    <path d="M163 260h168v145H163Z" fill="#d4c8a4" rx="8"/><path d="M164 260h167v144H164Z" fill="url(#${id}-paving)"/>
    ${house(177,398,129,115,p,id,{brick:true,awning:true})}${basket(193,397,.67)}${basket(286,397,.65,'green')}${pot(319,397,.62)}
    ${stall(394,390,67,p,id,true)}${basket(432,408,.55)}
    <path d="M534 273h53v133h-53Z" fill="#c8c9a1"/>${tree(561,335,.59,p.leaf)}${pot(551,397,.8)}${pot(577,397,.6,true)}
    ${house(675,396,143,118,p,id,{balcony:true,shutter:true,color:'#f0dcb2',roof:'#a77458'})}${pot(664,396,.67)}${pot(831,397,.6)}
    <g fill="#bda47b"><rect x="25" y="287" width="64" height="112" rx="5"/><rect x="911" y="283" width="68" height="117" rx="5"/></g>${stall(28,395,58,p,id)}${tree(948,383,.85,p.leaf)}
    ${line('M178 259q65 17 134-1','#a99169',1.7)}${lantern(193,267,.65)}${lantern(242,271,.65)}${lantern(290,267,.65)}
    <path d="M686 266h121" stroke="#cfbd96" stroke-width="4"/>${birds(886,131,p.ink,.62)}`;
}

function orchard(p,id) {
  return `<path d="M0 153 117 43l110 90L356 25l151 119L650 55l133 88L906 63l94 73v48H0Z" fill="#b1c3a0"/><path d="M0 171 124 106l105 55 113-72 163 82 156-60 135 61 103-60 101 45v28H0Z" fill="#8da77e"/><path d="M0 174q106-28 210-4t222-4 222 6 346-4v21H0Z" fill="#b9c99d"/>${tree(52,177,.68,p.leaf,true)}${tree(251,166,.82,p.leaf,true)}${tree(424,168,.72,p.leaf,true)}${house(696,165,108,65,p,id,{awning:true,roof:'#84946b'})}${tree(939,177,.82,p.leaf,true)}
    ${roads(p,id)}
    <path d="M166 258h164v150H166Z" fill="#c8d099"/><path d="M171 269q70-22 154-1m-154 21q80-22 154-1m-154 22q80-22 154-1m-154 22q80-22 154-1" fill="none" stroke="#e4dfb0" stroke-width="6"/>
    ${stall(178,397,133,p,id,true)}${basket(184,405,.63)}${basket(311,405,.53)}
    <path d="M389 264h83v141h-83Z" fill="#bac996"/>${tree(431,341,.83,p.leaf,true)}${basket(424,398,.7)}
    <path d="M534 275h53v129h-53Z" fill="#b6c593"/>${tree(561,333,.58,'#849b62',true)}${shrub(561,393,.8,'#91a15e')}
    ${house(679,395,136,104,p,id,{awning:true,color:'#ebd2a2',roof:'#7f895b'})}${pot(666,399,.61)}${basket(822,399,.6)}${basket(695,399,.58,'green')}
    ${tree(47,367,.93,p.leaf,true)}${shrub(57,404,1.1,p.leaf)}${tree(944,377,1.08,p.leaf,true)}
    <g stroke="#9e9767" stroke-width="3" fill="none"><path d="M171 411h154m-147-8v13m24-13v13m24-13v13m24-13v13m24-13v13m24-13v13m24-13v13"/></g>${birds(567,107,p.ink,.7)}`;
}

function swordLion(x,y,s=1) {
  return group(x,y,'<path d="M-18-9-13-19-4-15 4-18 13-13 20-6 17 8 7 15-8 13-19 5Z" fill="#c8a25e" stroke="#9b744e" stroke-width="1.5"/><path d="M-12-8q5-8 12-4 7-5 13 4l-3 12H-9Z" fill="#d6b36d"/><path d="M-10-5-3-3m7 0 7-3" stroke="#60756a" stroke-width="3" stroke-linecap="round"/><path d="M-4 1 0-2l4 3-4 4Z" fill="#987351"/><path d="M-15 7H18" stroke="#e6d9ae" stroke-width="3"/><path d="M-21 7h7m31-5v10m2-5h7" stroke="#857051" stroke-width="3"/>',s);
}

function alley(p,id) {
  return `<path d="M0 155q115-28 218-10t207-7 206 9 194-7 175 3v40H0Z" fill="#c1c5a2"/>${house(25,168,71,72,p,id,{brick:true,roof:'#9e705d'})}<path d="M197 167V96h172v71Z" fill="#c39a75"/><path d="M197 167V96h172v71Z" fill="url(#${id}-brick)"/><path d="M191 99h184l-7-13H199Z" fill="#b18667"/><path d="M215 86V72h23v14m25 0V72h23v14m26 0V72h23v14" fill="#bd9976"/><path d="M270 167v-36q18-23 36 0v36Z" fill="#7c8570"/>${tree(434,176,.76,p.leaf)}${house(687,167,126,78,p,id,{brick:true,roof:'#ac7862'})}${tree(943,179,.79,p.leaf)}
    ${roads(p,id)}
    <path d="M164 258h169v148H164Z" fill="#d2bc95"/>${house(177,398,131,115,p,id,{brick:true,shutter:true,color:'#cf9772',roof:'#986953'})}${swordLion(242,329,.7)}${pot(316,400,.67,true)}${pot(173,400,.6)}
    <path d="M390 283h81v120h-81Z" fill="#bf9573"/><path d="M390 283h81v120h-81Z" fill="url(#${id}-brick)"/><path d="M387 283h87l-5-9h-78Z" fill="#a87b5c"/><path d="M410 404v-80q20-24 41 0v80Z" fill="#7e8f77"/><path d="M430 316v86" stroke="#d2b58b" stroke-width="2"/>${swordLion(430,297,.47)}
    <path d="M533 274h55v131h-55Z" fill="#d0c6a1"/>${tree(560,333,.6,p.leaf)}${pot(549,395,.7)}${pot(576,399,.59)}
    ${house(677,395,139,120,p,id,{brick:true,balcony:true,shutter:true,color:'#e9c4a1',roof:'#a56a52'})}${swordLion(747,302,.56)}${pot(829,397,.58)}
    <path d="M23 291h69v105H23Z" fill="#c49d7b"/><path d="M23 291h69v105H23Z" fill="url(#${id}-brick)"/>${tree(53,370,.77,p.leaf)}${tree(946,376,1.03,p.leaf)}
    ${line('M178 261q65 19 135 0','#aa8765',1.4)}${lantern(192,269,.63)}${lantern(292,270,.63)}<g fill="#d4bf96"><ellipse cx="220" cy="406" rx="14" ry="3"/><ellipse cx="284" cy="404" rx="11" ry="2"/></g>${birds(560,101,p.ink,.72)}`;
}

function coffeeCup(x,y,s=1) {
  return group(x,y,`<ellipse cy="10" rx="17" ry="4" fill="#b8aa7e"/><path d="M-12-6h24v10q-12 13-24 0Z" fill="#f0e5c3"/><path d="M12-3q13-2 10 7-3 6-10 2" fill="none" stroke="#f0e5c3" stroke-width="4"/><ellipse cy="-6" rx="12" ry="3" fill="#87634b"/>${line('M-4-13q-5-7 1-13M5-13q5-6 0-13','#f9eed0',2,.7)}`,s);
}

function crops(x,y,w,rows=4) {
  return group(x,y,`<path d="M0 0h${w}v${rows*20+7}H0Z" fill="#b5bf89"/>${Array.from({length:rows},(_,r)=>`${line(`M4 ${r*20+13}h${w-8}`,'#e3d6a0',5)}${Array.from({length:Math.floor(w/18)},(_,i)=>`<path d="M${10+i*18} ${r*20+13}q-9-9-7-12 8 1 8 10 2-12 8-12 3 6-9 14Z" fill="${r%2?'#7e935c':'#6e8a55'}"/>`).join('')}`).join('')}`);
}

function coffee(p,id) {
  return `<path d="M0 160 86 99l81 41 123-91 138 99L586 65l131 79L853 78l147 72v36H0Z" fill="#aabd91"/><path d="M0 176q111-54 238-9t214-3 220 6 328-6v25H0Z" fill="#8fa77a"/><path d="M0 172q123-23 249-5m174 8q115-29 224-6m145 3q104-24 208-5" fill="none" stroke="#d4d9a8" stroke-width="7"/>${tree(48,181,.82,p.leaf)}${house(226,168,108,63,p,id,{brick:true,roof:'#788167',color:'#c4b391'})}${tree(425,172,.76,p.leaf)}${tree(742,169,.84,p.leaf)}${tree(944,180,.87,p.leaf)}
    ${roads(p,id)}
    <path d="M166 257h166v151H166Z" fill="#d2c69e"/><path d="M166 257h166v151H166Z" fill="url(#${id}-paving)"/>${house(178,395,130,111,p,id,{awning:true,brick:true,color:'#ccaa7c',roof:'#7f886b'})}${coffeeCup(242,330,.51)}${basket(183,399,.6,'coffee')}${pot(316,399,.6)}
    ${crops(391,272,78,2)}${dryingRack(395,401,70,74,id)}${crops(535,304,51,5)}${shrub(559,288,.68,p.leaf)}
    <path d="M653 260h182v146H653Z" fill="#d9cfaa"/><path d="M653 260h182v146H653Z" fill="url(#${id}-paving)"/>${house(686,357,124,73,p,id,{brick:true,color:'#dcc296',roof:'#737c60'})}
    <path d="M668 367h159m-151-9v45m143-45v45" fill="none" stroke="#ad966c" stroke-width="3"/><path d="M663 367 683 343h129l20 24Z" fill="#93a375" opacity=".9"/>${line('M674 363h145M691 347l-10 16m32-16-4 16m29-16 2 16m22-16 7 16m17-16 11 16','#c3c994',2,.7)}
    <ellipse cx="741" cy="391" rx="25" ry="8" fill="#bda070"/>${line('M741 393v15','#947d5b',4)}${coffeeCup(738,386,.38)}${pot(671,399,.6)}${pot(822,399,.58)}
    ${tree(49,377,.98,p.leaf)}${basket(61,404,.62,'coffee')}${tree(948,377,1.04,p.leaf)}<path d="M912 401h66" stroke="#c5b98b" stroke-width="6"/>${birds(550,115,p.ink,.65)}`;
}

function canal(p,id) {
  return `<path d="M0 100q219 15 440-3t560 4v75H0Z" fill="url(#${id}-water)"/><path d="M0 160q214-7 413 0t587-1v20H0Z" fill="#bfbca5"/>${line('M0 156q234-8 431 0t569-2','#e8dcc0',4)}${line('M42 125h63m62 16h88m159-25h57m50 24h80m211-10h95','#efdbbc',2,.55)}
    ${house(202,120,99,61,p,id,{brick:true,lit:true,color:'#c4b59d',roof:'#6f807d'})}${house(308,127,80,69,p,id,{lit:true,color:'#d4c3a6',roof:'#7f8071'})}${house(680,129,132,77,p,id,{brick:true,lit:true,color:'#cfb8a0',roof:'#6b7775'})}${tree(50,167,.78,p.leaf)}${tree(940,173,.8,p.leaf)}
    <path d="M420 161v-17q62-55 124 0v17h-17v-11q-45-38-90 0v11Z" fill="#c9b99b"/>${line('M419 143q63-57 126 0','#e8d8b8',4)}<path d="M431 145v-13m17 1v-16m18 8v-16m18 13v-16m18 19v-16m18 24v-16m15 28v-13" stroke="#b6a88d" stroke-width="2"/>${birds(570,74,p.ink,.68)}
    ${roads(p,id)}
    <path d="M165 259h166v148H165Z" fill="#bdb69a"/>${house(178,397,131,123,p,id,{lit:true,balcony:true,brick:true,color:'#d7b59b',roof:'#6d7b77'})}${pot(169,400,.56)}${pot(320,399,.6)}
    ${canalCourt(391,276,79,129,id)}${lantern(399,311,.7,true)}${lantern(462,311,.7,true)}
    <path d="M534 276h54v129h-54Z" fill="#bec3a4"/>${tree(561,335,.62,p.leaf)}${pot(551,398,.66,true)}${pot(577,398,.55)}
    ${house(676,395,142,120,p,id,{brick:true,lit:true,balcony:true,color:'#d9c2a6',roof:'#72807d'})}${pot(666,398,.6)}${pot(832,399,.55)}${lantern(691,355,.7,true)}${lantern(804,355,.7,true)}
    ${tree(50,374,.98,p.leaf)}${tree(949,377,1.03,p.leaf)}${line('M178 261q65 17 136-1','#7f826e',1.5)}${lantern(192,269,.65,true)}${lantern(241,272,.65,true)}${lantern(294,268,.65,true)}
    <g fill="#edc991" opacity=".18"><path d="M189 355h23l-9 50h-33Z"/><path d="M786 353h23l14 51h-34Z"/></g>`;
}

function saltMound(x,y,s=1) {
  return group(x,y,'<ellipse cy="4" rx="40" ry="8" fill="#a8b6b0" opacity=".35"/><path d="M-40 1Q-17-22-2-48 17-22 42 1Z" fill="#f8f3df" stroke="#c6c9ba" stroke-width="1.5"/><path d="M-2-48Q13-12 42 1H-4l-9-9Z" fill="#d4dcd2"/><path d="M-24-9-8-24m-9 27 9-9m16-11 5 8" stroke="#fffdf1" stroke-width="2" stroke-linecap="round"/>',s);
}

function saltPans(x,y,w,h,p,id) {
  return group(x,y,`<path d="M0 2h${w}v${h+3}H0Z" fill="#ab9c80"/><rect width="${w}" height="${h}" rx="3" fill="url(#${id}-saltclay)" stroke="#b8a48b" stroke-width="4"/><path d="M3 3h${w/2-5}v${h/2-5}H3Z" fill="#96b7b3" opacity=".78"/><path d="M${w/2+2} ${h/2+2}h${w/2-5}v${h/2-5}H${w/2+2}Z" fill="#ded8c1" opacity=".5"/><path d="M3 ${h/2+3}h${w/2-6}v${h/2-6}H3Z" fill="#f1e5cb" opacity=".42"/>${line(`M0 ${h/2}h${w}M${w/2} 0v${h}`,'#e8e1ca',5)}${line(`M2 ${h/2+3}h${w-4}M${w/2+3} 2v${h-4}`,'#8e876e',1.5,.45)}${line(`M8 12h${w/2-18}m15 ${h/2}h${w/2-18}`,'#f8ead2',1.5,.75)}${line(`M7 24h${Math.max(6,w/2-26)}m8 7h${Math.max(6,w/2-26)}`,'#e8f0df',1,.45)}<rect width="${w}" height="${h}" fill="url(#${id}-paper)"/>`);
}

function salt(p,id) {
  return `<path d="M0 119q180-9 355 0t334 0 311 0v58H0Z" fill="#9cb7b9"/>${line('M0 128q187-10 363 0t329 0 308 0','#d7d8c5',3,.65)}<path d="M0 161q230-5 437 1t563-3v24H0Z" fill="#c7cfba"/>
    <path d="M179 139 227 115h318l-33 40H177Z" fill="#d4d1bc"/><path d="M194 140h318m-292-11h300m-247-14-14 38m92-38-14 38m92-38-14 38" stroke="#f2e9d0" stroke-width="3"/><path d="M196 137 233 119h52l-12 18Z" fill="#b8cbc5"/><path d="M349 137 357 119h59l-7 18Z" fill="#e3d9bd"/>${saltMound(717,159,.82)}${saltMound(794,164,.64)}${birds(562,76,p.ink,.72)}${birds(904,116,p.ink,.55)}
    ${roads(p,id)}
    ${saltPans(168,260,160,145,p,id)}${saltMound(217,337,.87)}${saltMound(285,394,.66)}
    ${saltPans(392,277,78,128,p,id)}<path d="M395 271h70" stroke="#d9d4bb" stroke-width="5"/>${saltMound(433,391,.63)}
    <path d="M534 280h54v125h-54Z" fill="#c7cbb3"/>${shrub(560,307,.72,p.leaf)}<g transform="translate(562 386)"><path d="M-21 0 0-26 21 0Z" fill="#eae7d3"/><path d="M-2-26 9-3h-10Z" fill="#c4cfc5"/></g>${line('M550 354l24-30M545 353l8 6m14-39 14 12','#a38e67',2.6)}
    ${house(678,395,140,104,p,id,{lit:true,color:'#e8d9bd',roof:'#8b8e87'})}${pot(666,400,.58)}${pot(832,398,.56)}<path d="M697 356h38v31h-38Z" fill="#a99b79"/><path d="M702 361h28v20h-28Z" fill="#c5d0b6"/>
    <path d="M24 302q32-25 66-1v103H24Z" fill="#cbd1ba"/>${shrub(56,339,1,p.leaf)}${saltMound(58,398,.72)}<path d="M911 283h69v122h-69Z" fill="#c6cfb5"/>${shrub(946,319,1.05,p.leaf)}${shrub(947,404,1.06,p.leaf)}
    <g stroke="#9b987a" stroke-width="2" fill="none"><path d="M911 367q8-35 15-40m-7 39q14-31 21-30m-8 36q9-29 22-31"/></g><g fill="#c4b992"><ellipse cx="925" cy="326" rx="3" ry="9" transform="rotate(25 925 326)"/><ellipse cx="940" cy="335" rx="3" ry="9" transform="rotate(35 940 335)"/><ellipse cx="954" cy="340" rx="3" ry="9" transform="rotate(42 954 340)"/></g>`;
}

// Small hand-built props are deliberately confined to pavements and courtyards.
// Their silhouettes stay simple at phone size; the close-up view reveals the craft.
function wovenTray(x,y,w,id,produce='empty',s=1) {
  const half=w/2;
  const contents=produce==='mango'?Array.from({length:5},(_,i)=>`<ellipse cx="${-half+9+i*(w-18)/4}" cy="${-4-(i%2)*3}" rx="4.5" ry="6.5" transform="rotate(${i%2?26:-19} ${-half+9+i*(w-18)/4} ${-4-(i%2)*3})" fill="${i%2?'#efc66e':'#e8ac48'}" stroke="#c1924b" stroke-width=".65"/>`).join(''):produce==='beans'?Array.from({length:14},(_,i)=>`<ellipse cx="${-half+6+(i%7)*(w-12)/6}" cy="${-5+Math.floor(i/7)*4}" rx="2.6" ry="1.5" fill="${i%3?'#94664a':'#c09162'}"/>`).join(''):produce==='rice'?`<path d="M${-half+5}-2q${half-5}-15 ${w-10} 0Z" fill="#f8e6bd"/>${line(`M${-half+10}-4h4m7-2h4m7 2h4`,'#cdbb8d',.9,.8)}`:'';
  return group(x,y,`<ellipse cy="4" rx="${half+1}" ry="5" fill="#5d6250" opacity=".13"/><path d="M${-half}-5q${half}-7 ${w} 0v6q${-half} 10 ${-w} 0Z" fill="#b48f61"/><ellipse cy="-5" rx="${half}" ry="7" fill="#c5a46d"/><ellipse cy="-5" rx="${half-2}" ry="5.5" fill="url(#${id}-woven)"/>${contents}<path d="M${-half}-4q${half} 13 ${w} 0" fill="none" stroke="#ead09a" stroke-width="2"/><path d="M${-half+4} 0v3m7-2v4m7-3v4m7-3v4m7-5v4" stroke="#e2bd83" stroke-width="1" opacity=".8"/>`,s);
}

function riceSteamer(x,y,s,id) {
  return group(x,y,`<ellipse cy="4" rx="22" ry="6" fill="#5c614f" opacity=".16"/><path d="M-17-31h34v31q-17 7-34 0Z" fill="url(#${id}-copper)"/><path d="M-17-29q17 8 34 0m-34 10q17 8 34 0m-34 10q17 8 34 0" fill="none" stroke="#e3c78f" stroke-width="2"/><path d="M-12-30v29m8-28v30m8-30v30m8-31v29" stroke="#795f46" opacity=".22" stroke-width="1"/><ellipse cy="-31" rx="18" ry="5" fill="#e4c28c"/><path d="M-19-32q19-19 38 0Z" fill="#c3a16b"/><ellipse cy="-44" rx="4" ry="2" fill="#897553"/>${line('M-24-23h7m34 0h7','#89714f',3)}<g class="life-steam" fill="none" stroke="#fff4d7" stroke-width="2.3" stroke-linecap="round" opacity=".85"><path d="M-10-49q-8-10 0-19t0-12"/><path d="M1-50q8-13 1-22"/><path d="M11-47q7-8 2-16"/></g>`,s);
}

function curtain(x,y,w,h,color='#6f9186') {
  const panel=w/3;
  return group(x,y,`<path d="M0 0h${w}v${h}H0Z" fill="#3d5b52" opacity=".2"/>${Array.from({length:3},(_,i)=>`<path d="M${i*panel} 0h${panel-1}v${h-4+(i%2?3:0)}q${-panel/2} 3 ${-panel+1} 0Z" fill="${color}"/>${line(`M${i*panel+3} 3v${h-9}`, '#f2dfb4',1,.3)}`).join('')}${line(`M-2 0h${w+4}`,'#685d47',2.5)}${line(`M2 2h${w-4}`,'#f0d7ab',1,.55)}`);
}

function stool(x,y,s=1,color='#ac8359') {
  return group(x,y,`<ellipse cy="4" rx="12" ry="3.5" fill="#536047" opacity=".12"/>${line('M-7-7-9 3M7-7 9 3M-7-1H7','#826d4f',2.8)}<ellipse cy="-8" rx="12" ry="4" fill="${color}"/><path d="M-11-8q11 5 22 0v3q-11 5-22 0Z" fill="#93754f"/><path d="M-8-9h16" stroke="#dfc293" stroke-width="1.2"/>`,s);
}

function stoneJar(x,y,s=1,glaze='#8e9a88') {
  return group(x,y,`<ellipse cy="3" rx="15" ry="4.5" fill="#5d6655" opacity=".16"/><path d="M-10-30q-8 14-6 24 2 11 16 10 14 1 16-10 2-10-6-24Z" fill="${glaze}"/><path d="M6-27q10 23 0 28 15 0 10-15l-6-16Z" fill="#435d53" opacity=".25"/><path d="M-9-24q-5 9-3 17" fill="none" stroke="#e4dcc0" stroke-width="2.2" opacity=".6" ${stroke}/><ellipse cy="-30" rx="11" ry="4" fill="#69796a"/><ellipse cy="-30" rx="7.5" ry="2.3" fill="#455a50"/><path d="M-11-29q11 6 22 0" fill="none" stroke="#c6c6a6" stroke-width="2"/>${line('M-13-10q13 4 26 0','#ced0ae',.8,.5)}`,s);
}

function fruitCrate(x,y,s=1,full=true) {
  return group(x,y,`<path d="M-21-24h42V2h-42Z" fill="#b0915d"/><path d="M-21-24h42l7-7h-42Z" fill="#d7b77c"/><path d="M21-24 28-31V-5l-7 7Z" fill="#917f50"/><path d="M-18-19h36m-36 8h36m-36 8h36" stroke="#e0c18b" stroke-width="4"/><path d="M-17-24V0m34-24V0" stroke="#927750" stroke-width="3"/><path d="M-8-17H8" stroke="#735e40" stroke-width="3" stroke-linecap="round"/>${full?'<g fill="#e9b54f" stroke="#bd9245" stroke-width=".7"><ellipse cx="-13" cy="-26" rx="6" ry="5"/><ellipse cx="-1" cy="-28" rx="6" ry="5"/><ellipse cx="12" cy="-26" rx="6" ry="5"/></g><path d="M-2-32q6-8 10-1" fill="#79894d"/>':''}`,s);
}

function dryingRack(x,y,w,h,id) {
  return group(x,y,`<path d="M2-3h${w+1}l5 7H6Z" fill="#576347" opacity=".13"/>${line(`M4-${h-10}V0M${w-4}-${h-10}V0M5-11h${w-10}`,'#8c7650',3)}<path d="M0-${h}h${w}v${h-17}H0Z" fill="#b59766" stroke="#8f7952" stroke-width="2"/><path d="M3-${h-3}h${w-6}v${h-23}H3Z" fill="url(#${id}-woven)"/>${Array.from({length:4},(_,r)=>Array.from({length:7},(_,c)=>`<ellipse cx="${7+c*(w-14)/6}" cy="${-h+9+r*(h-36)/3}" rx="2.8" ry="1.8" transform="rotate(${r%2?22:-18} ${7+c*(w-14)/6} ${-h+9+r*(h-36)/3})" fill="${(r+c)%3?'#91684a':'#bb8a5c'}"/>`).join('')).join('')}${line(`M0-${h}h${w}M0-17h${w}`,'#e2c38e',2)}${line(`M${w/2}-${h}v${h-17}`,'#ac8e5e',1.2,.75)}`);
}

function woodenWindow(x,y,w,h,id,lit=false) {
  return group(x,y,`<path d="M-3-3h${w+6}v${h+7}H-3Z" fill="#91775c"/><path d="M0 0h${w}v${h}H0Z" fill="${lit?'#e8c48b':'#5c7e74'}"/><path d="M0 0h${w}v${h}" fill="url(#${id}-timber)"/><path d="M2 2h${w-4}v${h-4}H2Z" fill="none" stroke="#d3b789" stroke-width="1.7"/>${line(`M${w/3} 0v${h}M${w*2/3} 0v${h}M0 ${h/2}h${w}`,'#9c805d',2.4)}${line(`M${w/6} 2v${h-4}M${w/2} 2v${h-4}M${w*5/6} 2v${h-4}`,'#c4a577',1.3)}<path d="M-5 ${h+3}h${w+10}" stroke="#a38a69" stroke-width="4"/><path d="M-5 ${h+1}h${w+10}" stroke="#ecd0a4" stroke-width="1.5"/>${lit?`<path d="M4 ${h-7}h${w-8}v4H4Z" fill="#ffdf9e" opacity=".5"/>`:''}`);
}

function tiledCanopy(x,y,w,id,color='#76877d') {
  return group(x,y,`<path d="M0 3h${w}v9H0Z" fill="#414f45" opacity=".18"/><path d="M0-9h${w}l7 13H-7Z" fill="${color}"/><path d="M0-9h${w}l7 13H-7Z" fill="url(#${id}-roofribs)"/>${line(`M-7 4h${w+14}`,'#5f6d63',3)}${line(`M-7 2h${w+14}`,'#c3c3a4',1.3)}${Array.from({length:Math.floor((w+8)/9)},(_,i)=>`<path d="M${-5+i*9} 4q3 4 6 0" fill="none" stroke="#a7b5a3" stroke-width="1.2"/>`).join('')}`);
}

function washingBasin(x,y,s=1) {
  return group(x,y,'<ellipse cy="5" rx="18" ry="5" fill="#5f6954" opacity=".12"/><path d="M-18-9h36L14 5Q0 12-14 5Z" fill="#9eaea1"/><ellipse cy="-9" rx="18" ry="6" fill="#d9dcc3"/><ellipse cy="-9" rx="14" ry="4" fill="#80a49b"/><path d="M-9-10h12m-6 3h9" stroke="#e9e8c9" stroke-width="1.2" opacity=".8"/><path d="M-15-3q1 7 8 9" fill="none" stroke="#d0d9bf" stroke-width="2"/>',s);
}

function saltRake(x,y,s=1) {
  return group(x,y,`${line('M-13 2 15-35','#a18963',3)}${line('M-21-3-3 10','#8c785b',3)}${line('M-21-3-24 1m9 1-3 4m9 0-3 4m9 0-3 4','#9d8865',2)}${line('M14-35 16-37','#e4cda5',1.5)}`,s);
}

function ceramicCat(x,y,s=1) {
  // A tiny ceramic ornament, distinct from the host's moving NPCs.
  return group(x,y,'<ellipse cy="3" rx="10" ry="3" fill="#7b775c" opacity=".14"/><path d="M-7 1q-2-9 1-14l-1-7 7 4 6-4 1 8q6 9 1 13Z" fill="#ded0a6" stroke="#b39d73" stroke-width=".8"/><path d="M5-3q13-8 11 1-1 5-8 4" fill="none" stroke="#c8b286" stroke-width="3" stroke-linecap="round"/><path d="M-4-11h2m5 0h2" stroke="#6b7160" stroke-width="1.5" stroke-linecap="round"/><path d="m0-8 2 0-1 2Z" fill="#b18a68"/><path d="M-3-3h6" stroke="#9c9168" stroke-width="2"/>',s);
}

function leafLitter(x,y,s=1) {
  return group(x,y,'<g fill="#bba770" opacity=".65"><path d="M-13 0q-5-7 4-5 3 4-4 5Zm21 6q3-8 8-4 0 5-8 4ZM-1-8q-2-7 5-5 2 4-5 5Z"/></g><path d="M-12-1-3 3m12 2 8-2" stroke="#9c9967" stroke-width=".8" opacity=".6"/>',s);
}

function canalCourt(x,y,w,h,id) {
  return group(x,y,`<path d="M0 0h${w}v${h}H0Z" fill="#b7ad91"/><path d="M0 0h${w}v${h}H0Z" fill="url(#${id}-stone)"/><path d="M10 2h${w-20}v${h-4}H10Z" fill="url(#${id}-canal)"/><path d="M10 2h5v${h-4}h-5ZM${w-13} 2h3v${h-4}h-3Z" fill="#4e6b67" opacity=".4"/><g class="life-water" fill="none" stroke-linecap="round"><path d="M19 17h19m4 7h15M22 41h23m-14 7h21M19 89h25m4 17h12m-36 9h15" stroke="#d9e0c3" stroke-width="1.7" opacity=".65"/><path d="M20 4h5l4 36h-6Zm27 3h7l-4 43h-5Z" fill="#e5c38c" opacity=".22"/><path d="M19 25h13m10 13h16M32 95h18" stroke="#f2d29b" stroke-width="2" opacity=".55"/></g><path d="M5 65q${w/2-5}-18 ${w-10} 0v14q${-w/2+5}-13 ${-w+10} 0Z" fill="#9d825f"/>${Array.from({length:8},(_,i)=>`<path d="M${9+i*(w-18)/7} ${66-Math.sin(i/7*Math.PI)*8}v11" stroke="#d3b990" stroke-width="2"/>`).join('')}<path d="M4 64q${w/2-4}-20 ${w-8} 0m-${w-8} 0v-16m${w-8} 16v-16" fill="none" stroke="#806f55" stroke-width="2.7"/><path d="M5 49q${w/2-5}-19 ${w-10} 0" fill="none" stroke="#c7b48c" stroke-width="2.5"/>${line(`M13 47v16M${w-13} 47v16M${w/2} 40v15`,'#918163',1.8)}<g fill="#7e9570"><path d="M4 117q-6-12 2-18 3 7 0 13 4-8 9-8 0 9-11 13Z"/><path d="M${w-4} 29q-7-7-4-16 6 4 5 11 3-8 6-7 1 8-7 12Z"/></g>`);
}

function lifeDetails(kind,p,id) {
  if(kind==='market') return `<g class="daylife-scene-details">
    ${curtain(222,352,38,29,'#6e9687')}
    <g transform="translate(187 387)"><path d="M-1 6h112l5 7H5Z" fill="#6b654c" opacity=".13"/><path d="M0-1h107v7H0Z" fill="#c9a873"/>${line('M4 6v13m98-13v13M4 10h98','#917551',3)}${line('M1-2h105','#f0d29c',2)}${wovenTray(27,-4,39,id,'rice')}${riceSteamer(84,-4,.7,id)}</g>
    ${wovenTray(302,407,29,id,'empty')}${wovenTray(301,403,29,id,'empty')}${washingBasin(176,405,.6)}
    ${riceSteamer(414,396,.56,id)}${wovenTray(451,404,25,id,'rice')}${curtain(400,315,51,17,'#b98761')}
    <path d="M693 341h109v9H693Z" fill="#8f8467" opacity=".14"/>${curtain(707,340,28,20,'#b2b594')}${curtain(764,340,24,19,'#d9b27e')}
    ${stoneJar(813,404,.42,'#7b998a')}${wovenTray(795,407,25,id,'empty')}${ceramicCat(686,407,.55)}
    ${riceSteamer(53,391,.62,id)}${wovenTray(77,405,27,id,'rice')}${basket(930,403,.48,'green')}
    <path d="M171 493h31v7h-31Z" fill="#b5986b"/>${wovenTray(187,490,33,id,'empty')}${wovenTray(187,486,33,id,'empty')}${stool(810,495,.8)}${leafLitter(701,506,.7)}
    <g fill="#f4dfae" opacity=".52"><path d="M170 277h12v3h-12m139 91h12v3h-12M664 282h10v3h-10"/></g>
  </g>`;
  if(kind==='orchard') return `<g class="daylife-scene-details">
    ${fruitCrate(190,407,.66)}${fruitCrate(299,405,.62)}${wovenTray(246,398,48,id,'mango')}
    <path d="M180 274q72-19 140-1m-136 15q64-14 130-1" stroke="#f0e6b7" stroke-width="2" fill="none" opacity=".8"/>
    ${fruitCrate(410,405,.54)}${wovenTray(449,405,29,id,'mango')}${leafLitter(455,359,.5)}
    ${curtain(730,351,34,28,'#a4a66e')}
    <g transform="translate(692 394)"><path d="M0-4h104v8H0Z" fill="#c4a273"/>${line('M6 4v12m92-12v12m-92-4h92','#99774d',3)}${line('M0-5h104','#e6c895',2)}${wovenTray(25,-9,34,id,'mango')}${wovenTray(76,-9,36,id,'mango')}</g>
    ${fruitCrate(818,408,.54,false)}${washingBasin(661,407,.59)}${stool(677,404,.62)}
    ${line('M695 285q48 10 95 0','#8f9160',1.5)}<path d="M713 289h15v17l-4 5h-9Z" fill="#d8cf9a"/><path d="M754 290h22v18q-11 3-22 0Z" fill="#a5b6a1"/>${line('M717 289v16m44-14v13','#f0e2b6',1,.6)}
    <path d="M922 398h47m-40-9v15m18-15v15m18-15v15" stroke="#a09a69" stroke-width="2.5"/>${wovenTray(940,392,31,id,'mango')}${fruitCrate(45,403,.65)}
    ${fruitCrate(180,499,.65,false)}${wovenTray(295,497,31,id,'mango')}${stool(806,497,.8)}${washingBasin(695,498,.65)}${leafLitter(786,509,.8)}
  </g>`;
  if(kind==='alley') return `<g class="daylife-scene-details">
    ${curtain(226,351,33,33,'#78938c')}${tiledCanopy(220,343,45,id,'#a77458')}
    <path d="M219 400h47l5 5h-57Z" fill="#b69572"/><path d="M215 405h55l5 6h-65Z" fill="#c9ad88"/>${line('M214 405h57m-61 6h65','#f2d8b0',1.4)}
    ${stoneJar(288,405,.49,'#b59c78')}${stoneJar(302,405,.33,'#79998b')}${ceramicCat(190,405,.7)}
    <path d="M400 404h61l5 7h-71Z" fill="#b29979"/>${line('M398 408h65','#ead1a8',1.8)}${curtain(415,328,31,43,'#8a9f85')}${tiledCanopy(406,317,48,id,'#a4745c')}
    <path d="M395 291h11m47 12h12M397 367h11m53 19h8" stroke="#f0cda5" stroke-width="2" opacity=".6"/>
    ${woodenWindow(693,298,24,29,id)}${woodenWindow(779,298,23,29,id)}${curtain(729,347,35,31,'#b39b7a')}
    ${stoneJar(800,407,.5,'#698c82')}${stool(699,406,.65)}${ceramicCat(718,407,.55)}
    ${stoneJar(43,405,.6,'#9eae97')}${stool(69,406,.64)}${leafLitter(925,405,.8)}
    <path d="M172 496h30v8h-30Z" fill="#bda17c"/><path d="M175 491h24v5h-24Z" fill="#d6bd95"/>${stoneJar(183,492,.38,'#6e9081')}${ceramicCat(288,497,.75)}${pot(812,500,.75,true)}
    ${line('M164 474h42m80 35h40M654 477h37m107 32h33','#b9a585',1.3,.48)}
  </g>`;
  if(kind==='coffee') return `<g class="daylife-scene-details">
    ${curtain(226,349,33,27,'#a0ac80')}${woodenWindow(191,306,25,24,id)}
    ${wovenTray(270,403,37,id,'beans')}${stoneJar(294,405,.43,'#81947e')}${stool(212,405,.55)}${coffeeCup(210,393,.28)}
    ${wovenTray(429,315,48,id,'beans')}${leafLitter(460,405,.5)}
    ${stoneJar(551,403,.45,'#91a28b')}${wovenTray(574,407,24,id,'beans')}
    ${curtain(731,313,33,29,'#9b9f78')}${woodenWindow(699,303,25,27,id)}
    ${stool(713,404,.72)}${stool(768,404,.72)}${stoneJar(799,405,.54,'#82967f')}${stoneJar(813,406,.34,'#b19e78')}
    <path d="M686 371h116m-113 8h16m70 0h23" fill="none" stroke="#5c7050" stroke-width="2" opacity=".2"/>
    ${wovenTray(938,401,41,id,'beans')}${stoneJar(31,404,.65,'#849880')}${stool(77,406,.6)}
    ${dryingRack(170,501,32,27,id)}${wovenTray(296,497,32,id,'beans')}${stool(693,497,.8)}${coffeeCup(691,485,.34)}${stoneJar(811,499,.58,'#8d9a84')}${leafLitter(799,510,.7)}
    <g stroke="#e6d6a7" stroke-width="1.5" opacity=".65"><path d="M395 282h65M538 318h45m-45 40h45"/></g>
  </g>`;
  if(kind==='canal') return `<g class="daylife-scene-details">
    <g class="life-water" fill="none" stroke-linecap="round"><path d="M214 137h21m-13 5h24m-9 6h13M326 141h22m-16 5h27m-14 6h19M710 141h31m-22 7h28m11 5h24" stroke="#f4cd94" stroke-width="2.2" opacity=".55"/><path d="M28 146h44m83-15h37m376 19h35m210-13h33" stroke="#d7e2cd" stroke-width="1.3" opacity=".65"/></g>
    ${woodenWindow(191,296,27,30,id,true)}${woodenWindow(269,296,26,30,id,true)}${tiledCanopy(185,288,115,id,'#6b817a')}
    ${curtain(226,351,34,29,'#8a947f')}${tiledCanopy(220,343,46,id,'#7a8a7b')}${stoneJar(292,405,.5,'#6c8f85')}${stool(185,406,.55)}
    ${woodenWindow(690,296,27,29,id,true)}${woodenWindow(778,296,27,29,id,true)}${tiledCanopy(685,288,126,id,'#6b817a')}${curtain(730,349,34,30,'#a89f84')}
    ${stoneJar(803,405,.5,'#729389')}${ceramicCat(695,406,.62)}${stool(718,406,.55)}
    <path d="M537 405h47m-44-4h41" stroke="#a1a38b" stroke-width="2"/>${leafLitter(559,407,.7)}
    ${stoneJar(37,404,.67,'#79988b')}${stoneJar(63,407,.45,'#a7aa8a')}${stool(926,405,.75)}
    <path d="M165 475h47v30h-47Z" fill="url(#${id}-stone)" opacity=".6"/>${stoneJar(182,499,.55,'#7c9b8b')}${lantern(298,483,.65,true)}${ceramicCat(806,499,.8)}
    <path d="M285 489h16l8 21h-29Z" fill="#f6d39a" opacity=".13"/>
  </g>`;
  return `<g class="daylife-scene-details">
    ${saltRake(309,309,.8)}${wovenTray(188,399,26,id,'empty')}${wovenTray(189,395,25,id,'rice')}
    <path d="M180 271h42m20 0h22m35 78h17m-113 24h24" stroke="#f9efd4" stroke-width="1.6" opacity=".7"/>
    ${saltRake(456,312,.61)}${wovenTray(408,403,25,id,'empty')}${leafLitter(580,407,.5)}
    ${curtain(731,348,34,31,'#9aafa2')}${woodenWindow(692,312,26,24,id,true)}
    <path d="M766 399h49l5 10h-55Z" fill="#a49e7d"/>${wovenTray(790,400,37,id,'empty')}${saltRake(810,386,.66)}${stoneJar(663,405,.47,'#8e9e8c')}
    <g transform="translate(714 403)"><path d="M-10-24h20l4 25h-28Z" fill="#bba885"/><path d="M-8-20h16m-19 8h22m-23 9h24" stroke="#dac9a5" stroke-width="1.5"/><path d="M-9-24q9-5 18 0" fill="none" stroke="#8e8468" stroke-width="2"/></g>
    ${wovenTray(931,404,31,id,'empty')}${saltRake(75,383,.65)}
    <g fill="#eff0dc" stroke="#aab4a4" stroke-width=".8"><path d="M924 366q5-7 10-3l-1 5h-8Z"/><path d="M951 378q5-7 10-3l-1 5h-8Z"/></g>${line('M927 368v7m5-7v7m22 5v6m5-6v6','#928e72',1)}${line('M934 364h5m22 12h5','#a38b63',1.3)}
    ${wovenTray(183,498,35,id,'empty')}${saltRake(295,498,.8)}${stoneJar(693,498,.56,'#a2ac95')}${stool(811,498,.75)}
    <path d="M166 509h37m70-31h24m395 30h29M792 477h31" stroke="#b9b69b" stroke-width="1.2" opacity=".7"/>
  </g>`;
}

const renderers={market,orchard,alley,coffee,canal,salt};
let sceneInstance=0;

/** Return SVG children for the host's 1000 × 620 viewBox, never an external asset. */
export function daylifeWalkScene(sceneId='shuixian-morning') {
  const p=Object.prototype.hasOwnProperty.call(scenes,sceneId)?scenes[sceneId]:scenes['shuixian-morning'];
  const id=`dlw-${p.kind}-${++sceneInstance}`;
  const evening=p.kind==='canal'||p.kind==='salt';
  return `${defs(p,id)}<g class="daylife-walk-scenery" aria-hidden="true">${sky(p,id,evening)}${renderers[p.kind](p,id)}${lifeDetails(p.kind,p,id)}${foreground(p,id,evening)}</g>`;
}
