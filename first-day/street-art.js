/* Original SVG artwork for the fictional learning streets. No map tiles or remote assets. */
const palette = {
  lane: {ground:'#ece3ca',sky:'#dfe9dd',road:'#f8f2de',edge:'#d2c3a3',roof:'#ae6150',wall:'#e4c7a4',leaf:'#6b8d66'},
  coast:{ground:'#e9e4cb',sky:'#d5e8e5',road:'#fff6df',edge:'#cfc5a5',roof:'#578f91',wall:'#f1dfba',leaf:'#819c72'},
  hills:{ground:'#dce2bd',sky:'#e4ead7',road:'#f9edcf',edge:'#becb9b',roof:'#786f50',wall:'#e6c98e',leaf:'#68885d'},
};
const group = (x,y,content,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${content}</g>`;

function tree(x,y,scale=1,color='#6b8d66') {
  return group(x,y,`<ellipse cy="9" rx="26" ry="10" fill="#254b3a" opacity=".09"/><path d="M0 2v-43m0 23-13-15m13 8 14-20" fill="none" stroke="#8c7653" stroke-width="7" stroke-linecap="round"/><path d="M-34-31c-8-20 9-38 24-34 8-24 41-14 39 5 25 1 30 34 10 43-22 9-60 2-73-14" fill="${color}"/><path d="M-19-48q14-19 31-13" fill="none" stroke="#eff2ca" stroke-width="5" stroke-linecap="round" opacity=".3"/>`,scale);
}

function house(x,y,{w=112,h=95,wall='#e4c7a4',roof='#ae6150',shop=false}={}) {
  const awning=shop?`<path d="M8 ${-h+42}h${w-16}l9 17H0z" fill="${roof}"/><path d="M13 ${-h+43}v15m21-15v15m21-15v15m21-15v15m21-15v15" stroke="#fff0d5" stroke-width="10"/><rect x="17" y="${-h+64}" width="${w-34}" height="${h-64}" fill="#6d8a73"/><path d="M${w/2} ${-h+64}v${h-64}" stroke="#e9d5a7" stroke-width="5"/>`:`<rect x="${w/2-13}" y="-44" width="26" height="44" rx="12" fill="#59796a"/><rect x="15" y="${-h+23}" width="25" height="26" rx="3" fill="#709385"/><path d="M27 ${-h+23}v26m-12-13h25" stroke="#f3dfb5" stroke-width="3"/><rect x="${w-39}" y="${-h+23}" width="23" height="26" rx="3" fill="#709385"/><path d="M${w-28} ${-h+23}v26m-11-13h23" stroke="#f3dfb5" stroke-width="3"/>`;
  return group(x,y,`<path d="M-6 4 ${w-3} 4 ${w+23} 17 14 17z" fill="#264e3a" opacity=".1"/><path d="M${w} ${-h}l18 11V0l-18 5" fill="#b9aa86"/><rect y="${-h}" width="${w}" height="${h}" rx="3" fill="${wall}"/><path d="M-8 ${-h+2} 9 ${-h-20} ${w-10} ${-h-20} ${w+10} ${-h+2}z" fill="${roof}"/><path d="M3 ${-h-1}h${w-5}" stroke="#f3d5af" stroke-width="3" opacity=".6"/>${awning}<path d="M6 0h${w-12}" stroke="#a28a65" stroke-width="5"/>`);
}

function temple(x,y,scale=1) {
  return group(x,y,`<ellipse cx="56" cy="8" rx="77" ry="16" fill="#644e37" opacity=".1"/><path d="M0-70h112v70H0z" fill="#d9b37e"/><path d="M13-65v65m86-65v65" stroke="#b65f4d" stroke-width="12"/><path d="M32-42h48V0H32z" fill="#526e61"/><path d="M56-42V0" stroke="#dac397" stroke-width="4"/><path d="M-23-72Q-8-64 2-83L28-99h56l26 16q10 19 25 11l-11 19H-12z" fill="#a65446"/><path d="M-9-62h131M24-92h66" fill="none" stroke="#e9bb73" stroke-width="5"/><path d="M47-103q10-13 19 0" fill="none" stroke="#c28e51" stroke-width="6"/><rect x="37" y="-66" width="39" height="16" rx="2" fill="#756943"/><circle cx="48" cy="-58" r="3" fill="#f5db94"/><circle cx="63" cy="-58" r="3" fill="#f5db94"/><path d="M-3 3h119l12 9H-15z" fill="#c2b698"/>`,scale);
}

function boat(x,y,scale=1) {
  return group(x,y,`<path d="M-39 0q40 28 82 0l-12 20h-55z" fill="#9e6d4e"/><path d="M0-70V5" stroke="#9a7c56" stroke-width="5"/><path d="M5-67 5-6 39-6z" fill="#fbedd1"/><path d="M-4-57-29-7H-4z" fill="#d9a47a"/><path d="M-47 27q15-5 29 0t29 0t29 0" fill="none" stroke="#87b9b3" stroke-width="4" stroke-linecap="round"/>`,scale);
}

function lamp(x,y) {
  return group(x,y,'<ellipse cy="5" rx="15" ry="5" fill="#56735c" opacity=".1"/><path d="M0 2v-63q0-10 11-10h6" fill="none" stroke="#73826b" stroke-width="5" stroke-linecap="round"/><path d="M9-71h17l-3 12H12z" fill="#e4b95f"/><path d="M9-73h17" stroke="#73826b" stroke-width="4"/>');
}

function bench(x,y,color='#a8865c') {
  return group(x,y,`<path d="M-22-15h44m-44 8h44" stroke="${color}" stroke-width="6" stroke-linecap="round"/><path d="M-17-4v11m34-11v11" stroke="#667661" stroke-width="5"/><path d="M-27 0h54" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`);
}

function cloud(x,y,scale=1) {
  return group(x,y,'<path d="M-43 9q-13-21 8-26 5-27 30-17 19-17 33 7 22-4 27 17 4 19-18 19z" fill="#fff9e9" opacity=".83"/>',scale);
}

function officeEmblem(x,y,scale=1) {
  return group(x,y,'<g class="street-office-emblem"><rect x="-16" y="-18" width="32" height="36" rx="6" fill="#245c48" stroke="#e6cf91" stroke-width="2"/><path d="M-10-2 0-11 10-2M-7-4v15H7V-4" fill="none" stroke="#fff3ce" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M-2 11V3h4v8" fill="none" stroke="#fff3ce" stroke-width="2.4"/></g>',scale);
}

function roads(p) {
  const network='M60 220H940M60 440H940M60 540H940M130 175V565M360 175V565M500 175V565M620 175V565M870 175V565';
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${network}" stroke="${p.edge}" stroke-width="42"/><path d="${network}" stroke="${p.road}" stroke-width="34"/><path d="M65 540H935" stroke="#dbcca3" stroke-width="2" stroke-dasharray="3 12"/><path d="M500 177V555" stroke="#d5c9a8" stroke-width="2" stroke-dasharray="3 12" opacity=".6"/></g><g stroke="#fffaf0" stroke-width="7" opacity=".75">${[130,360,620,870].map(x=>`<path d="M${x-13} 516v9m9-9v9m9-9v9m9-9v9"/>`).join('')}</g>`;
}

function laneScene(p) {
  return `<path d="M0 110q130-21 247-3t255-8 250 7 248-13v80H0" fill="#b9c9a6"/><g opacity=".62">${house(40,160,{w:75,h:64,wall:'#c2cba9',roof:'#94a586'})}${house(855,155,{w:92,h:73,wall:'#c7ceb0',roof:'#9eae8d'})}</g>${temple(236,167,1.02)}${house(555,166,{w:103,h:79})}${house(680,170,{w:131,h:94,wall:'#ead8b2',roof:'#ae7862',shop:true})}${tree(420,170,.93,p.leaf)}
    ${house(176,386,{w:123,h:105,wall:'#e2bd91',roof:'#a65c4c',shop:true})}${house(678,388,{w:122,h:98,wall:'#eddbb5',roof:'#b37159'})}${officeEmblem(782,367,.8)}${house(23,392,{w:65,h:80,wall:'#dac6a2',roof:'#b78065'})}${tree(550,370,1.02,p.leaf)}${tree(948,340,.9,p.leaf)}
    <g stroke="#b48065" stroke-width="3" fill="none"><path d="M170 256q60 22 132-2"/><path d="M682 258q57 16 121-4"/></g><g fill="#d58d61"><ellipse cx="193" cy="270" rx="8" ry="13"/><ellipse cx="230" cy="274" rx="8" ry="13"/><ellipse cx="275" cy="270" rx="8" ry="13"/><ellipse cx="715" cy="271" rx="8" ry="13"/><ellipse cx="767" cy="269" rx="8" ry="13"/></g>
    ${bench(240,486)}${bench(745,485)}${lamp(86,479)}${lamp(911,480)}${tree(38,552,.83,p.leaf)}${tree(969,548,.9,p.leaf)}<path d="M157 590q160-25 283-3t240-4 207 8" fill="none" stroke="#bbca9c" stroke-width="15" stroke-linecap="round"/>`;
}

function coastScene(p) {
  return `<path d="M0 85q220 22 417-4t323 2 260-8v101q-152-21-289 1t-346 0T0 184z" fill="#89b8b6"/><path d="M0 147q155-17 306 1t350-2 344 4" fill="none" stroke="#eaf3df" stroke-width="7"/><path d="M15 113q14-7 28 0m33 11q19-8 38 0m600-19q18-8 37 0m108 23q21-8 41 0" fill="none" stroke="#c6e0d5" stroke-width="4" stroke-linecap="round"/>${boat(790,131,.7)}${boat(278,136,.53)}
    <g transform="translate(400 137)"><path d="M-12 34-5-52h30l12 86z" fill="#f8e7bb"/><path d="M-7-20h35l2 17H-8zM-3-53h28v-18H-3z" fill="#b97762"/><path d="M-10-71 11-85l22 14z" fill="#556f6b"/><rect x="6" y="-65" width="10" height="10" fill="#edc960"/><path d="M5 17h13v17H5z" fill="#688e89"/></g>
    ${house(174,384,{w:115,h:82,wall:'#f0dfb4',roof:'#638c8c',shop:true})}${house(680,389,{w:120,h:79,wall:'#ead9b4',roof:'#6b9d9c'})}<g transform="translate(540 313)"><path d="M-6 0h64v66H-6z" fill="#d4cbb0"/><path d="M-14 0 26-32 70 0z" fill="#f9f5e6"/><path d="M-14 0 26-32 70 0M-2 14h53" fill="none" stroke="#c3c5ad" stroke-width="3"/></g>
    <g transform="translate(54 338)" fill="#f6f3e0" stroke="#b6bdab" stroke-width="3"><path d="M-32 17 0-19 33 17z"/><path d="M-34 24 4-12 40 24z"/></g>${tree(940,352,.85,p.leaf)}${tree(85,184,.8,p.leaf)}
    <g transform="translate(239 484)"><path d="M-33-12 0-30 35-12z" fill="#d69470"/><path d="M0-13v28" stroke="#8b805a" stroke-width="4"/>${bench(0,12,'#ad966c')}</g>${bench(750,481,'#8b9c7a')}${lamp(911,481)}<path d="M35 588q99-15 212 0t180-2 254 2 270-3" fill="none" stroke="#c5d0a4" stroke-width="16" stroke-linecap="round"/><g fill="#bdca9f">${[55,87,918,950].map((x,i)=>`<path d="M${x} 490q-22-37-13-44 17 7 13 32 3-38 16-36 7 22-13 48z"/>`).join('')}</g>`;
}

function hillsScene(p) {
  return `<path d="M0 143 115 39l119 96L380 5l139 130L681 43l127 81L924 36l76 86v65H0z" fill="#afc49c"/><path d="M0 155 104 95l109 67L333 73l135 96L635 97l155 58 106-75 104 62v42H0z" fill="#8da77d"/><path d="m318 89 16-16 26 19-22-6zM665 61l16-18 21 14-20-4z" fill="#d8dfc0"/>
    <path d="M172 291q54-33 126 0v95H172z" fill="#b7c38f"/><path d="M170 310q65-35 130-2m-130 28q65-34 130-2m-130 28q65-34 130-2" fill="none" stroke="#e4dfb2" stroke-width="10"/>
    ${house(668,381,{w:139,h:91,wall:'#e9c98b',roof:'#767a56',shop:true})}${house(30,390,{w:58,h:71,wall:'#d9bf8f',roof:'#7e8c63'})}
    <g transform="translate(548 367)"><path d="M-29-45v47m58-47v47" stroke="#ae8f5f" stroke-width="8"/><path d="M-47-45 0-74l47 29z" fill="#7a8159"/><path d="M-37-44h74M-33-6h66" stroke="#dbba7f" stroke-width="6"/><path d="M-42 3h84" stroke="#a58d61" stroke-width="7"/></g>
    ${tree(226,165,1.12,p.leaf)}${tree(755,178,1.08,p.leaf)}${tree(937,347,1.15,p.leaf)}${tree(55,178,.8,p.leaf)}${tree(422,165,.7,p.leaf)}
    <g fill="#dba754">${[[211,122],[239,134],[752,139],[775,124],[939,304],[921,316]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>
    ${bench(235,482,'#9d865e')}${bench(740,484,'#9d865e')}${lamp(910,480)}<path d="M17 589q145-31 272 0t260 0 224-7 211 5" fill="none" stroke="#a2b67d" stroke-width="22" stroke-linecap="round"/><g fill="#ead4a0">${[65,92,410,451,915,948].map((x,i)=>`<circle cx="${x}" cy="${582+(i%2)*10}" r="5"/>`).join('')}</g>`;
}

export function streetSceneArt(district='lane') {
  const p=palette[district] || palette.lane;
  const scene={lane:laneScene,coast:coastScene,hills:hillsScene}[district] || laneScene;
  return `<rect width="1000" height="620" fill="${p.ground}"/><path d="M0 0h1000v181H0z" fill="${p.sky}"/><circle cx="856" cy="55" r="30" fill="#efd38a"/>${cloud(139,58,.9)}${cloud(573,53,.65)}${roads(p)}${scene(p)}<path d="M13 608h974" stroke="#b3be95" stroke-width="2" opacity=".6"/>`;
}

export function personArt(portrait='guide',player=false) {
  const colors={guide:['#d8976c','#3c6f66'],elder:['#9b9c78','#edf0dc'],child:['#dfb64e','#f0ca70'],worker:['#65929a','#658b84'],yang:['#f4edda','#455f53']};
  const [shirt,hair]=player?['#2f7565','#314c41']:(colors[portrait]||colors.guide);
  const scale=portrait==='child'&&!player ? 0.8 : 1;
  return `<g transform="scale(${scale})"><ellipse cy="3" rx="18" ry="6" fill="#274e3a" opacity=".2"/><g class="${player?'street-player-body':'street-resident-body'}"><g class="street-leg street-leg-left"><path d="M-7-24-8-4" stroke="#526657" stroke-width="9" stroke-linecap="round"/><path d="M-9-3h-6" stroke="#fff2d3" stroke-width="7" stroke-linecap="round"/></g><g class="street-leg street-leg-right"><path d="M7-24 8-4" stroke="#526657" stroke-width="9" stroke-linecap="round"/><path d="M8-3h7" stroke="#fff2d3" stroke-width="7" stroke-linecap="round"/></g><path d="M-12-50q12-8 24 0l6 28q-18 9-36 0z" fill="${shirt}"/><path class="street-arm" d="M-13-45-22-29M13-45l9 17" fill="none" stroke="${shirt}" stroke-width="8" stroke-linecap="round"/><circle cx="-22" cy="-27" r="4" fill="#e9bd93"/><circle cx="22" cy="-26" r="4" fill="#e9bd93"/><rect x="-5" y="-61" width="10" height="14" rx="4" fill="#e9bd93"/><circle cy="-68" r="17" fill="#e9bd93"/><path d="M-17-65q-7-26 15-26 22-1 20 24L9-77q-10 8-26 7z" fill="${hair}"/><circle cx="-5" cy="-66" r="1.7" fill="#415245"/><circle cx="7" cy="-66" r="1.7" fill="#415245"/><path d="M-3-59q4 3 8-1" fill="none" stroke="#aa775d" stroke-width="1.8" stroke-linecap="round"/>${portrait==='yang'&&!player?'<path d="M-12-69h10v7h-10zm15 0h10v7H3zM-2-66h5" fill="none" stroke="#536b58" stroke-width="2"/><path d="M-2-48v17" stroke="#bba27a" stroke-width="3"/>':''}${portrait==='worker'&&!player?'<path d="M-22-78q2-24 23-23 22 1 22 23z" fill="#dab456"/><path d="M-24-77h49" stroke="#c29943" stroke-width="5"/>':''}${portrait==='elder'&&!player?'<path d="M17-21 25 1" stroke="#9b8058" stroke-width="4"/>':''}${player?'<path d="M-12-49 14-20" stroke="#e3bf78" stroke-width="4"/><rect x="7" y="-32" width="19" height="17" rx="4" fill="#d69357"/><path d="M11-26h11" stroke="#f0cc8b" stroke-width="2"/>':''}</g></g>`;
}

export function stopArt(stop,index=0) {
  if(stop.kind==='office')return `<path d="M38-42v25" stroke="#8b805e" stroke-width="4"/>${officeEmblem(38,-60)}${personArt(stop.portrait||'yang')}`;
  if(stop.kind==='resident')return personArt(stop.portrait||'guide');
  const motifs=[
    '<path d="M-12-23h24v-22h-24z" fill="#ddc487"/><path d="M-20-44 0-59l20 15z" fill="#ab7158"/><path d="M-17-21h34" stroke="#b49764" stroke-width="5"/><path d="M-4-23v-13h8v13" fill="#6c8d77"/>',
    '<path d="M-17-27q17-33 34 0v12h-34z" fill="#76967b"/><path d="M0-43v33" stroke="#c4a26c" stroke-width="5"/><path d="M-13-30 0-21l12-11" fill="none" stroke="#d4c68f" stroke-width="3"/>',
    '<path d="M-14-19v-32h28v32" fill="#efe1b3"/><path d="M-21-50h42l-6-11h-30z" fill="#618d84"/><path d="M-6-39H6v20H-6z" fill="#ba8d63"/><path d="M-18-18h36" stroke="#ab9167" stroke-width="5"/>',
  ];
  return `<ellipse cy="2" rx="19" ry="6" fill="#365d44" opacity=".14"/><path d="M0-19V1" stroke="#8a7958" stroke-width="5"/>${motifs[index%motifs.length]}<circle cx="21" cy="-48" r="10" fill="#e2ae51"/><path d="M17-48h8m-4-4v8" stroke="#fffae7" stroke-width="2"/>`;
}
