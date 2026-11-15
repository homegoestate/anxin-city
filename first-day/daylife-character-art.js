import { stopArt } from './street-art.js?v=16.0.0';

/* Original, layered SVG characters. Feet are (0,0); bodies are 98–112 units
 * high and 42–53 wide (up to 66 including a basket). Label clearance: y=-118.
 * No definitions/IDs, external assets, or per-render randomness. Anatomical
 * groups retain the street engine's walking and facing animation hooks. */
const ink = '#514a3e';
const skin = '#e8b18a';
const skinShade = '#ca8e6b';
const line = (d, color, width=1, extra='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const shape = (d, color, extra='') => `<path d="${d}" fill="${color}" ${extra}/>`;

function legs(trousers='#d7c8a8', shade='#b7a78a', shoes='#eee2c6', skirt=false) {
  return [-1,1].map(side => `<g class="street-leg street-leg-${side<0?'left':'right'}"${side>0?' transform="translate(1 0)"':''}>
    ${shape(side<0?'M-14-30-1-29-3-8q-5 4-10 0z':'M1-29 14-30 14-8q-5 4-11 0z',skirt?skin:trousers)}
    ${shape(side<0?'M-5-28h4L-3-8l-4 1z':'M10-29h4V-8l-4 1z',skirt?skinShade:shade)}
    ${!skirt?line(side<0?'M-13-10q5 2 10 0':'M3-10q5 2 11 0',shade,2):''}
    ${shape(side<0?'M-13-7q4 2 10 0l1 5q-1 3-8 3h-8q-3-2 0-5z':'M3-7q5 2 11 0l5 4q4 2 1 4H6q-4 0-4-3z',shoes)}
    ${shape(side<0?'M-19-1h17v2h-18z':'M3-1h18l-1 2H4z','#8f846e')}
    ${line(side<0?'M-11-5h5m-7 2h6':'M7-5h5m-3 2h6','#fff7e4',1.1)}
  </g>`).join('');
}

function face({elder=false,glasses=false,beard=false}={}) {
  return `${shape('M-6-69h12v13q-6 5-12 0z',skin)}${shape('M-6-69h12v7q-6 4-12 0z',skinShade)}
    <ellipse cx="-17" cy="-82" rx="4.2" ry="6" fill="${skinShade}"/><ellipse cx="17" cy="-82" rx="4.1" ry="6" fill="${skin}"/>
    ${shape('M-17-93q3-12 17-12t18 13l-1 17q-3 13-16 13-14 0-18-13z',skin,'stroke="#c89170" stroke-width=".65"')}
    ${shape('M11-99q8 8 4 24-3 9-13 11 14 1 18-13l-1-16z','#d59a75','opacity=".66"')}
    ${shape('M-13-94q3-7 11-7 5 0 7 2-10-1-16 9z','#f5d1a7','opacity=".72"')}
    <ellipse cx="-11" cy="-77" rx="4.5" ry="2.5" fill="#cf8068" opacity=".3"/><ellipse cx="11" cy="-77" rx="4.4" ry="2.5" fill="#cf8068" opacity=".3"/>
    ${line('M-11-88q3-2 6-.5M5-89q3-1 6 1','#655244',1.6)}
    <ellipse cx="-7" cy="-82.8" rx="2" ry="2.7" fill="${ink}"/><ellipse cx="8" cy="-82.8" rx="2" ry="2.7" fill="${ink}"/>
    <circle cx="-7.5" cy="-83.6" r=".7" fill="#fff8e7"/><circle cx="7.5" cy="-83.6" r=".7" fill="#fff8e7"/>
    ${line('M1-82l-1 4 2 .7','#bc805f',.9)}${line('M-4-72q5 4 10-1','#9b654f',1.3)}${line('M-1-69q2 1 4 0','#f3cda5',1.1)}
    ${elder?`${line('M-14-80l2 1m24-1 2-1M-10-93q9-3 17 0','#bc967d',.7)}${shape('M-5-74q3-3 6-1 3-2 6 1l-5 2z','#d9d3b9')}`:''}
    ${beard?shape('M-9-69q8 9 17-1-3 10-9 9z','#9f927b','opacity=".55"'):''}
    ${glasses?`<g fill="none" stroke="#55695c" stroke-width="1.65"><rect x="-14" y="-87" width="12" height="9" rx="3"/><rect x="3" y="-87" width="12" height="9" rx="3"/><path d="M-2-84h5m-20-1h3m29 0h3"/></g>${line('M-11-85h3m6 2h3','#e9e1c7',.8,'opacity=".8"')}`:''}`;
}

function hair(style='wave',color='#493a30') {
  const styles={
    wave:`${shape('M-19-80q-5-6-3-15-3-6 4-9-1-5 7-6 6-6 15-2 9-2 14 6 8 5 4 16l-4 10-3-13q-4-4-9-5-5 13-19 12l-2 7z',color)}${shape('M-17-99q4-10 16-9 9-3 15 5-11-6-20 4-7 7-12 5z','#695344')}${line('M-12-101q6-5 12-5M5-102q6 1 10 7','#8d6f57',1.1,'opacity=".55"')}`,
    bun:`${shape('M-20-81q-4-21 9-26 7-5 18-1 14 5 13 24l-3 8-2-18q-12 0-17-8-3 13-15 13l-1 11z',color)}${shape('M-10-105q-9-8-1-13 10-5 17 2 6 8-2 12z',color)}${line('M-8-111q6-6 12 0M-16-95q8-4 12-10','#806453',1.5)}${line('M-7-105q6 3 12 0','#b48a63',2)}`,
    bob:`${shape('M-20-77q-3-20 5-28 6-7 18-5 18 2 18 22l2 18q-5 4-10-1l1-23q-8 0-16-7-3 8-13 10v22q-8 4-9-2z',color)}${shape('M-16-100q9-11 21-7-10 0-16 13z','#80604c')}${line('M-18-86v9m37-11-1 10','#80604c',1.3)}`,
    tied:`${shape('M-18-82q-7-22 9-27 8-5 18 1 15 8 10 26l-4 6-1-17q-12 4-21-8-2 10-9 10l-1 13z',color)}${shape('M17-88q10 1 9 11l-3 10-6-3 3-12z',color)}${shape('M-14-101q9-9 21-5-10 1-15 7z','#815b42')}${line('M19-85l5 1','#af6e4c',2.6)}`,
    silver:`${shape('M-18-79q-5-10-2-20 4-13 20-12 15 0 19 11 3 11-1 20l-3-14q-9-2-14-8-7 9-15 8l-1 14z','#c7c7b8')}${shape('M-16-100q10-13 26-6-11-1-18 8z','#f2edde')}${line('M-13-98q7-7 15-8m3 3 8 7','#9ca99b',1.2)}`,
    short:`${shape('M-18-80q-4-8-1-19 4-10 19-10 18 0 20 17l-3 13-3-14q-14 3-25-6l-4 19z',color)}${shape('M-14-101q11-9 24-2-12-3-22 4z','#79604b')}`,
  };
  return styles[style]||styles.wave;
}

function hat(straw=false) {
  return straw?`${shape('M-19-100q3-16 19-16 17 1 20 16l9 7q-29 10-58 0z','#d8b775')}${shape('M-19-100q21 5 39 0l4 4q-27 7-48 0z','#b28c50')}${line('M-12-111 10-109M-15-106l31 2M-23-94q23 5 47-1','#f6d697',1.2)}${shape('M-19-101q18 4 39 0v4q-22 4-41-1z','#7e8b66')}`:
    `${shape('M-20-100q3-15 20-15 16 1 20 15l4 8q-25 6-48 0z','#d8c49a')}${shape('M-20-100q20 4 40 0l2 5q-22 5-44 0z','#a99975')}${line('M-9-111q9-3 17 1','#f8e5bc',1.5)}`;
}

function hand(x,y,open=false) {
  return `<g transform="translate(${x} ${y})">${shape(open?'M-3-3q-2-4 0-4l3 3 3-3q2 1 0 4l2 1q2 4-2 6-6 2-8-2z':'M-4-4q4-3 7 0l1 5q-1 4-5 3-5-1-3-8z',skin)}${line('M-3 0q2 2 4 0',skinShade,.65)}</g>`;
}

function arms(color,shade,pose='down') {
  return `<g class="street-arm">${shape('M-14-60q-7 2-9 10l-5 17q2 5 8 2l7-18z',color)}${shape('M-24-42l5 2-2 7-5-1z',shade)}${hand(-24,-29)}
    ${pose==='cup'?`${shape('M14-60q8 0 10 10l1 9-13 8-4-6 10-6-5-8z',color)}${shape('M11-39l4 6-4 3-5-6z',shade)}${hand(8,-33)}`:
      `${shape('M14-60q7 1 10 11l4 17q-3 5-8 2l-7-19z',color)}${shape('M20-40l6-2 2 9-6 2z',shade)}${hand(24,-29)}`}</g>`;
}

function shirt(color,shade,{vest=false,cardigan=false,apron=false,stripe=false}={}) {
  return `${shape('M-7-63q7 6 14 0l9 4 3 31q-18 6-38 0l3-31z',color)}
    ${shape('M11-59l5 1 3 30-6 1-4-20z',shade)}${shape('M-14-56-10-57-12-33l-5 2z','#fff5d5','opacity=".22"')}
    ${stripe?`${line('M-15-51h30m-31 9h32m-32 9h33','#f3dfb7',2.4)}${shape('M-6-63q6 6 12 0l2 5q-8 6-16 0z',shade)}`:
      `${shape('M-7-63 0-58-5-51-11-60z','#f0e6ca')}${shape('M7-63 0-58 5-51 11-60z','#f8eed6')}`}
    ${vest?`${shape('M-11-61-4-59-1-27q-9 1-18-2l3-26z','#476b57')}${shape('M10-61 4-58 1-27l18-2-3-27z','#365b4c')}${line('M-13-40h8m11 0h7','#a5b294',1.4)}${line('M-9-56-4-30','#698976',1.3)}`:cardigan?
      `${shape('M-11-61-5-59-3-28-16-27-3-29z',color)}${shape('M7-60 11-61 17-30 5-27z',shade)}${line('M-4-55v24',shade,1.5)}`:
      `${line('M1-52v23',shade,.9)}${[46,38,30].map(y=>`<circle cx="3" cy="-${y}" r=".85" fill="#e9d5b3"/>`).join('')}`}
    ${line('M-13-32l5-2m17-5 4 5',shade,.9)}
    ${apron?`${shape('M-8-54h16l3 14 5 15q-16 7-32 0l5-15z',apron)}${line('M-8-54-4-62m12 8-4-8',apron,2.5)}${shape('M-7-40h14v9q-7 3-14 0z','#fff0cd','opacity=".25"')}${line('M-6-39h12m-13 11q7 2 14 0','#f4deb3',.9)}`:''}`;
}

function basket(fruit=false) {
  return `<g class="street-arm">${line('M18-27q0-17 10-16 11 1 10 16','#997444',2.3)}
    ${fruit?`${shape('M19-31q-3-8 4-9 7 0 6 7z','#da9d4c')}${shape('M27-33q-1-9 6-8 7 2 4 10z','#e5ad54')}${shape('M26-38q2-7 7-6-1 5-7 6z','#74915b')}`:
      `${shape('M24-29q-12-12-9-17 8-3 14 15 1-18 9-17 5 4-8 20z','#6c8f60')}${line('M24-31 18-42m9 11 7-13','#aac08b',1.4)}${shape('M31-32q8-6 10 0l-5 8z','#e6c49a')}`}
    ${shape('M16-29q12-4 25 0l-3 15q-10 5-19 0z','#b78c53')}${shape('M17-29h24v4q-12 3-23 0z','#d1a869')}${line('M21-24l1 10m5-10v11m6-11-1 11m6-11-2 9M20-20h18m-17 4h16','#e1bd7f',1)}${hand(27,-35)}</g>`;
}

function tote(color='#ba8f64') {
  return `<g class="street-arm">${line('M19-29v-7q6-6 12 0v7','#8b7358',2)}${shape('M17-30h17l3 20q-11 4-22-1z',color)}${shape('M29-29h5l3 19-6 1z','#9f7754')}${line('M20-27 19-13m4-1 8 1','#e8c596',1.2)}${hand(23,-34)}</g>`;
}

function cup() {
  return `<g class="street-arm"><ellipse cx="10" cy="-31" rx="12" ry="2.8" fill="#c8b898"/>${shape('M3-44h14l-1 10q-6 4-12 0z','#f9edce')}${line('M17-42q8-1 5 5l-5 1','#ecd9b7',2.7)}<ellipse cx="10" cy="-43" rx="6.8" ry="2.2" fill="#795b43"/>${line('M9-47q-3-3 0-6m5 5q-2-2 0-4','#c4c3a9',1,'opacity=".8"')}${hand(2,-32)}</g>`;
}

function wrap(content,player=false) {
  return `<g class="daylife-character" aria-hidden="true"><ellipse cy="2" rx="23" ry="5" fill="#394e3d" opacity=".12"/><ellipse cy="1" rx="14" ry="2.5" fill="#394e3d" opacity=".1"/><g transform="scale(.94)"><g class="${player?'street-player-body':'street-resident-body'}">${content}</g></g></g>`;
}

export function daylifePlayerArt() {
  return wrap(`${legs('#dcd0af','#bbaa8c')}${arms('#426e5b','#2f5646')}
    ${shape('M-9-63q8 5 16 0l8 5 2 32q-16 5-33 0l1-32z','#f1e5c9')}
    ${shape('M-10-63-3-60-3-24q-8 1-17-5l4-29z','#426e5b')}${shape('M7-62 12-61 17-54 20-28q-6 3-12 2L6-53z','#365f4e')}
    ${shape('M-9-63-2-60-5-52-12-58z','#64816b')}${shape('M7-62 12-61 13-53 6-56z','#577a64')}
    ${line('M-14-46h7v7h-7m25-8h3M-16-30l7 2m19-11 3 8','#2f5546',1)}${line('M-2-51v21','#d4c7a7',.8)}
    ${shape('M9-61 13-58-11-26-15-29z','#b78a4e')}${line('M11-58-12-28','#e2bb79',1.2)}
    ${shape('M-24-34q9-5 18 0l-2 20q-10 4-20-1z','#a97945')}${shape('M-25-34q10-4 19 0l-2 8q-9 4-18-1z','#c59858')}${line('M-23-22v6m5-13v5h4v-5m1 8h3','#e2ba7e',1)}
    ${face()}${hair('wave')}`,true);
}

function advisor() {
  return wrap(`${legs('#827f68','#686c5b','#715e47')}${arms('#ded1af','#c2b28f')}${shirt('#e7dbbd','#c9b994',{vest:true})}
    <g class="street-arm">${shape('M20-40 32-38 30-17 18-20z','#a48b61')}${shape('M21-38 30-36 28-19 19-21z','#f4e5c5')}${line('M23-32l5 1m-6 3 5 1m-6 3 5 1','#bdad88',.8)}${hand(22,-28)}</g>
    ${face({glasses:true})}${hair('short')}`);
}

const residents = {
  'shuixian-morning':()=>`${legs('#736f59','#5d624f','#76654e',true)}${arms('#bc8066','#9e6652')}${shirt('#c18b70','#a56e55',{apron:'#9baf87'})}${face()}${hair('bun')}${basket()}`,
  'yujing-morning':()=>`${legs('#b7b798','#969e80','#eee0bd')}${arms('#d2ad68','#b69254')}${shirt('#d9b877','#b79a60')}${face()}${hair('short')}${hat()}${basket(true)}`,
  'anping-afternoon':()=>`${legs('#768e85','#607a70','#dac8ab')}${arms('#ad715e','#8f5b4b')}${shirt('#b77e66','#97614f',{cardigan:true})}${face()}${hair('bob')}${tote('#c3a474')}`,
  'dongshan-afternoon':()=>`${legs('#b3a58b','#958e77','#6b6352')}${arms('#d7d2af','#b7b28f','cup')}${shirt('#e5ddbf','#c4b998',{apron:'#64816b'})}${face()}${hair('tied')}${cup()}`,
  'yanshui-evening':()=>`${legs('#737f79','#56695e','#6b5e4d')}${arms('#e5d9bb','#c9bc9d')}${shirt('#ece1c8','#c7ba9f')}${line('M-13-45h9v7h-9m20-12v20','#c9bfa6',.8)}${face({elder:true})}${hair('silver')}`,
  'beimen-evening':()=>`${legs('#858f7a','#69755f','#89785c')}${arms('#94afa7','#73938a')}${shirt('#a5bbb0','#819e93')}${shape('M-28-37  -19-35-18-41-26-43z','#dfdfbc')}${shape('M20-36 29-38 27-44 19-42z','#dfdfbc')}${face()}${hair('short')}${hat(true)}`,
};

function neighbor(sceneId) {
  const cap=['yujing-morning','beimen-evening'].includes(sceneId);
  const blue=['shuixian-morning','dongshan-afternoon','beimen-evening'].includes(sceneId);
  const fabric=blue?'#719a9c':'#bd9372',shade=blue?'#557e82':'#9c785d';
  return wrap(`${legs('#c6baa0','#a79e84','#7e7058')}${arms(fabric,shade)}${shirt(fabric,shade,{cardigan:!cap,stripe:cap})}
    <g class="street-arm">${shape('M18-39 30-37 29-19 17-22z',blue?'#b99a69':'#78927a')}${shape('M20-37 29-35 28-21 19-23z','#eee0bd')}${line('M21-32l5 1m-6 3 6 1m-6 3 5 1','#b9ad8a',.8)}${hand(21,-29)}</g>
    ${face()}${hair(cap?'short':'bob',blue?'#55473a':'#5a4438')}${cap?hat():''}`);
}

export function daylifeActorArt(stop,index=0) {
  if(stop.kind==='place') return stopArt(stop,index);
  if(stop.kind==='office') return advisor();
  const sceneId=Object.keys(residents).find(id=>String(stop.id||'').startsWith(id))||stop.district;
  if(stop.portrait==='neighbor'||String(stop.id||'').endsWith('-neighbor')) return neighbor(sceneId);
  return wrap((residents[sceneId]||residents['anping-afternoon'])());
}
