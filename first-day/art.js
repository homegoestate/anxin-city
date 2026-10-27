// Original vector illustrations for 小安在台南的第一天.
// All buildings and scenes are invented story settings, not property listings.
const C = Object.freeze({
  ink: '#194f49', dark: '#315b50', green: '#72957a', light: '#b4c9a3',
  mint: '#d9e4cb', paper: '#f5efdf', cream: '#fffaf0', yellow: '#efc65d',
  coral: '#dc8466', brick: '#b7654d', pale: '#e7b993', blue: '#8eafb1',
  water: '#bcd4cf', line: '#c5c3a6', sand: '#ded0af', skin: '#c98a60'
});

function svg(content, viewBox, className) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${className}" aria-hidden="true" focusable="false">${content}</svg>`;
}

function cloud(x, y, scale = 1, color = C.cream) {
  return `<path transform="translate(${x} ${y}) scale(${scale})" d="M0 25c0-10 8-17 18-16C24-5 48-4 53 11c14-5 27 3 28 14H0Z" fill="${color}"/>`;
}

function tree(x, y, scale = 1, color = C.green) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M-16 141c12 7 30 7 42 0" fill="none" stroke="${C.sand}" stroke-width="13" stroke-linecap="round"/>
    <path d="M7 139 5 60M6 97-20 72M7 84l25-24" fill="none" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
    <path d="M5 1C-18-4-39 14-34 34c-28 8-31 48-8 58 18 7 33 1 43-5 20 14 52 4 55-17 22-23 1-51-18-50C32 7 19 0 5 1Z" fill="${color}"/>
    <path d="M-24 45c10-10 23-12 32-8M16 62c6-9 15-13 26-11M-7 15c8 3 12 7 15 13" fill="none" stroke="${C.mint}" stroke-width="3" stroke-linecap="round" opacity=".64"/>
  </g>`;
}

function palm(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M0 115Q12 48 1 15" fill="none" stroke="${C.brick}" stroke-width="7" stroke-linecap="round"/>
    <path d="M2 20C-8-4-44-1-51 24-31 12-15 11 2 20ZM2 20C-3-6 22-22 40-9 23-4 10 7 2 20ZM2 20c25-20 53-8 57 15-23-15-36-17-57-15ZM2 20c-21 3-31 22-27 45C-11 41-4 32 2 20ZM2 20c23 3 32 25 22 44C21 45 12 31 2 20Z" fill="${C.dark}"/>
    <path d="m4 48 7-2M4 62l7-1M3 78l7-1M1 94l7-1" stroke="${C.pale}" stroke-width="2"/>
  </g>`;
}

function pot(x, y, scale = 1, color = C.coral) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M2 25C-15 9-13-5-4-5 7-1 8 13 8 25M10 25C8 6 18-9 25-5c10 8-1 24-15 30" fill="${C.green}"/>
    <path d="M0 22h23l-4 24H4Z" fill="${color}"/><path d="M-2 22h27v5H-2Z" fill="${C.brick}"/>
  </g>`;
}

function person(x, y, scale = 1, direction = 1) {
  return `<g class="art-person" transform="translate(${x} ${y}) scale(${scale * direction} ${scale})">
    <ellipse cx="0" cy="118" rx="23" ry="5" fill="${C.sand}"/>
    <path d="m-9 83-5 31M7 83l11 29" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/>
    <path d="M-16 113h-8m42-1 8 3" stroke="${C.brick}" stroke-width="6" stroke-linecap="round"/>
    <path d="M-15 40c-10 14-9 28-6 45h38c3-19 3-35-7-45Z" fill="${C.coral}"/>
    <path d="M13 46 29 66l13-9M-15 49l-14 29" fill="none" stroke="${C.skin}" stroke-width="8" stroke-linecap="round"/>
    <path d="m28 55 13 3 4 25-17-2Z" fill="${C.yellow}"/>
    <path d="M32 58v-7q5-5 8 2v5" fill="none" stroke="${C.ink}" stroke-width="2"/>
    <rect x="-5" y="28" width="10" height="16" rx="5" fill="${C.skin}"/>
    <ellipse cy="19" rx="14" ry="18" fill="${C.pale}"/>
    <path d="M-13 23c-9-13-3-29 12-28 15-1 21 12 15 25l-5-13c-8 6-15 7-22 5Z" fill="${C.ink}"/>
    <circle cx="8" cy="20" r="1.5" fill="${C.ink}"/><path d="m9 27-4 1" stroke="${C.brick}" stroke-width="1.5" stroke-linecap="round"/>
    <path d="m-13 41 27 41" stroke="${C.ink}" stroke-width="4"/>
    <path d="M1 69h20l2 20H0Z" fill="${C.cream}"/><path d="M6 73h11" stroke="${C.sand}" stroke-width="2"/>
  </g>`;
}

function bicycle(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="0" cy="30" r="22" stroke="${C.dark}" stroke-width="4"/><circle cx="70" cy="30" r="22" stroke="${C.dark}" stroke-width="4"/>
    <path d="m0 30 23-38 20 38H0l27-24h28l15 24M43 30l12-39-4-10h-9M20-8h15" stroke="${C.coral}" stroke-width="4"/>
    <circle cx="43" cy="30" r="4" fill="${C.dark}" stroke="none"/>
    <path d="m43 30 7 9h6M15-11h17" stroke="${C.dark}" stroke-width="3"/>
    <path d="m59-8 19 1-3 16H63Z" fill="${C.yellow}" stroke="none"/>
  </g>`;
}

function houseOne() {
  return `<path d="M48 81h160v119H48Z" fill="${C.pale}"/>
    <path d="M38 80h179v14H38Z" fill="${C.coral}"/><path d="m46 80 29-20h117l23 20Z" fill="${C.brick}"/>
    <path d="M63 104h132v86H63Z" fill="${C.cream}"/>
    <path d="M80 135a29 29 0 0 1 58 0v65H80Z" fill="${C.ink}"/><path d="M88 135a21 21 0 0 1 42 0v57H88Z" fill="${C.green}"/>
    <path d="M109 112v80M89 141h40" stroke="${C.ink}" stroke-width="3"/><circle cx="119" cy="162" r="2" fill="${C.yellow}"/>
    <rect x="151" y="117" width="31" height="41" rx="2" fill="${C.blue}"/><path d="M166 118v39M152 137h29" stroke="${C.cream}" stroke-width="3"/>
    <path d="M146 164h40" stroke="${C.coral}" stroke-width="5" stroke-linecap="round"/><path d="M45 201h169" stroke="${C.sand}" stroke-width="5" stroke-linecap="round"/>
    ${pot(176, 165, .65)}${pot(46, 171, .55, C.yellow)}`;
}

function houseTwo() {
  return `<path d="M48 54h161v146H48Z" fill="${C.cream}"/><path d="M39 50h177v12H39Z" fill="${C.coral}"/>
    <path d="M55 41h147v13H55Z" fill="${C.pale}"/><path d="M65 32h126v14H65Z" fill="${C.cream}"/>
    <path d="M74 73h38v37H74ZM143 73h38v37h-38Z" fill="${C.blue}"/>
    <path d="M92 74v35M161 74v35M74 89h37m32 0h37" stroke="${C.cream}" stroke-width="3"/>
    <path d="M47 116h162v10H47Z" fill="${C.pale}"/><path d="m51 130-9 22h173l-10-22Z" fill="${C.coral}"/>
    <path d="m70 131-3 20m28-20-1 20m29-20v20m28-20 1 20m28-20 3 20" stroke="${C.cream}" stroke-width="10"/>
    <path d="M77 154h48v46H77Z" fill="${C.ink}"/><path d="M84 160h34v40H84Z" fill="${C.green}"/>
    <path d="M100 161v39" stroke="${C.ink}" stroke-width="3"/><circle cx="111" cy="180" r="2" fill="${C.yellow}"/>
    <path d="M145 162h34v25h-34Z" fill="${C.blue}"/><path d="M142 188h40" stroke="${C.pale}" stroke-width="5"/>
    <path d="M43 201h173" stroke="${C.sand}" stroke-width="5" stroke-linecap="round"/>${pot(189, 166, .7)}`;
}

function houseThree() {
  return `<path d="M55 67h149v133H55Z" fill="${C.pale}"/><path d="m41 70 39-31h101l34 31Z" fill="${C.dark}"/>
    <path d="M70 69h117v54H70Z" fill="${C.cream}"/><path d="M88 79h30v30H88Zm56 0h27v30h-27Z" fill="${C.blue}"/>
    <path d="M102 80v29M157 80v29" stroke="${C.cream}" stroke-width="3"/>
    <path d="M46 123h167v12H46Z" fill="${C.coral}"/><path d="M61 135h137v65H61Z" fill="${C.cream}"/>
    <path d="M79 161a21 21 0 0 1 42 0v39H79Zm67 0a21 21 0 0 1 42 0v39h-42Z" fill="${C.ink}"/>
    <path d="M85 163a15 15 0 0 1 30 0v37H85Z" fill="${C.green}"/><path d="M151 165h32v22h-32Z" fill="${C.blue}"/>
    <path d="M99 151v49M167 165v22" stroke="${C.ink}" stroke-width="3"/>
    <path d="M128 131v69M56 131v69M199 131v69" stroke="${C.pale}" stroke-width="8"/>
    <path d="M44 202h173" stroke="${C.sand}" stroke-width="6" stroke-linecap="round"/>${pot(23, 158, .9, C.yellow)}${pot(204, 169, .65)}`;
}

const HOUSE = { 'price-900': houseOne, 'price-1200': houseTwo, 'price-1600': houseThree };

export function houseArt(id) {
  const drawHouse = Object.hasOwn(HOUSE, id) ? HOUSE[id] : houseTwo;
  return svg(`<ellipse cx="130" cy="204" rx="114" ry="10" fill="${C.sand}" opacity=".42"/>${drawHouse()}`, '0 0 260 224', 'art art-house');
}

function anpingScene() {
  return `<path d="M0 162Q90 142 172 164t188-9v65H0Z" fill="${C.mint}"/>
    <circle class="art-sun" cx="276" cy="53" r="28" fill="${C.yellow}"/>${cloud(26, 27, .8)}${cloud(171, 39, .6)}
    <path d="M36 140h183v47H36Z" fill="${C.brick}"/><path d="M31 135h193v11H31Z" fill="${C.coral}"/>
    <path d="M36 130v12m26-12v12m26-12v12m26-12v12m26-12v12m26-12v12m26-12v12m26-12v12" stroke="${C.brick}" stroke-width="16"/>
    <path d="M45 159h167M45 174h167M73 146v13m49-13v13m49-13v13m-121 0v15m49-15v15m49-15v15m49-15v15m-124 0v13m49-13v13m49-13v13" stroke="${C.pale}" stroke-width="2" opacity=".65"/>
    <path d="M104 160a22 22 0 0 1 44 0v27h-44Z" fill="${C.ink}"/>
    <path d="M79 91h85v44H79Z" fill="${C.cream}"/><path d="m68 94 51-31 57 31Z" fill="${C.dark}"/>
    <path d="M97 110h14v25H97Zm31 0h14v25h-14Z" fill="${C.blue}"/>
    <path d="m107 186-29 34h95l-25-34Z" fill="${C.sand}"/>${tree(273, 81, .83)}${pot(231, 174, .5)}
    <path d="m313 35 8-4 8 4m-28 10 6-3 6 3" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>`;
}

function saltScene() {
  return `<circle class="art-sun" cx="256" cy="56" r="32" fill="${C.yellow}"/>${cloud(29, 23, .85)}${cloud(153, 32, .55)}
    <path d="M0 108q86-8 172 1t188-4v115H0Z" fill="${C.water}"/>
    <path d="M23 165 109 76l75 89Zm109 4 82-66 62 67Z" fill="${C.cream}"/>
    <path d="m109 76 20 89h55Zm105 27 7 67h55Z" fill="${C.mint}"/>
    <path d="m65 123 44-47 15 47-15-8-12 10-10-5Z" fill="#fffdf6"/>
    <path d="M0 171h360v49H0Z" fill="${C.sand}"/><path d="M0 178h108v31H0Zm122 0h104v31H122Zm118 0h120v31H240Z" fill="${C.blue}"/>
    <path d="m10 187 60-1m67 12 49-2m73-9 61-1" stroke="${C.cream}" stroke-width="2" stroke-linecap="round" opacity=".75"/>
    <path d="M300 96v77m-6 0h13" stroke="${C.dark}" stroke-width="3"/>
    <path d="m300 97-25 10v23l25-6Z" fill="${C.coral}"/>
    <path d="m313 80 6-3 6 3m-21-12 8-4 8 4" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linecap="round"/>`;
}

function waterScene() {
  return `<circle class="art-sun" cx="273" cy="53" r="30" fill="${C.yellow}"/>${cloud(24, 29, .85)}${cloud(188, 27, .5)}
    <path d="M0 126q85-32 173-4t187-11v109H0Z" fill="${C.mint}"/>
    <path d="M0 167q55-39 132-20t150 17l78-16v72H0Z" fill="${C.water}"/>
    <path d="M0 159q55-38 132-19t150 17l78-16" fill="none" stroke="${C.cream}" stroke-width="9"/>
    <path d="M91 144q76-58 158 4" fill="none" stroke="${C.coral}" stroke-width="13"/>
    <path d="M91 132q76-58 158 4m-143-14v18m24-31v18m25-24v18m25-18v18m25-13v18m25-6v18" fill="none" stroke="${C.dark}" stroke-width="3"/>
    ${tree(51, 62, .63)}${tree(298, 78, .5, C.light)}
    <path d="M14 194h58m32-21h51m63 22h71m27-20h35" stroke="${C.cream}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <path d="M177 181q8 9 22 0" fill="${C.coral}"/><path d="M187 159v23m1-21 11 14h-11" stroke="${C.ink}" stroke-width="1.5" fill="${C.cream}"/>`;
}

const PLACE = {
  anping: anpingScene,
  salt: saltScene,
  water: waterScene,
  'culture-anping-fort': anpingScene,
  'culture-salt': saltScene,
  'culture-waterworks': waterScene
};

export function placeArt(id) {
  const drawPlace = Object.hasOwn(PLACE, id) ? PLACE[id] : anpingScene;
  return svg(`<rect width="360" height="220" fill="${C.paper}"/>${drawPlace()}`, '0 0 360 220', 'art art-place');
}

export function streetScene({ step = 'welcome', home = null, place = null } = {}) {
  const homeId = typeof home === 'string' ? home : home?.id;
  const placeId = typeof place === 'string' ? place : place?.id;
  const atResult = ['result', 'complete', 'finish'].includes(step);
  const selectedHouse = Object.hasOwn(HOUSE, homeId) ? HOUSE[homeId] : houseTwo;
  const postcard = Object.hasOwn(PLACE, placeId)
    ? `<g transform="translate(485 84) rotate(6)"><rect x="-8" y="-8" width="188" height="133" rx="3" fill="${C.cream}"/><g transform="scale(.48)">${PLACE[placeId]()}</g><path d="M5 111h85m10 0h22" stroke="${C.line}" stroke-width="3" stroke-linecap="round"/></g>`
    : `${cloud(480, 98, 1.32)}<path d="m605 78 9-5 9 5m-33-17 7-4 7 4" fill="none" stroke="${C.dark}" stroke-width="2.5" stroke-linecap="round"/>`;

  return svg(`<path d="M59 478C10 382 35 209 138 134 236 61 392 62 502 101c124 44 224 147 203 274-17 107-125 151-270 157-164 7-330 34-376-54Z" fill="${C.mint}"/>
    <path d="M55 350c81-27 200-28 294-8 94-27 228-31 345 11l10 88c-55 55-155 89-269 91-164 7-330 34-376-54-23-45-25-85-4-128Z" fill="${C.sand}"/>
    <path d="M57 403c109-35 202-20 318 13s230 25 321-22" fill="none" stroke="${C.cream}" stroke-width="42"/>
    <path d="M61 412c109-35 202-20 318 13s230 25 321-22" fill="none" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="5 8"/>
    <circle class="art-sun" cx="382" cy="113" r="49" fill="${C.yellow}"/>
    <g class="art-sun-rays" stroke="${C.yellow}" stroke-width="3" stroke-linecap="round"><path d="M382 48V36m46 30 8-8m11 55h12m-123-45-8-8"/></g>
    ${cloud(102, 111, 1.2)}${cloud(259, 63, .75)}${postcard}
    <g opacity=".82"><path d="M109 254h84v86h-84Z" fill="${C.green}"/><path d="M101 250h99v10h-99Z" fill="${C.cream}"/><path d="M122 238h59v16h-59Z" fill="${C.light}"/><path d="M127 270h18v28h-18Zm32 0h18v28h-18Z" fill="${C.cream}"/><path d="M142 312h28v28h-28Z" fill="${C.dark}"/></g>
    <g transform="translate(180 120) scale(1.16)">${selectedHouse()}</g>
    <g transform="translate(435 208)"><path d="M0 69h134v95H0Z" fill="${C.coral}"/><path d="M8 25h119v48H8Z" fill="${C.cream}"/><path d="m-6 28 32-25h80l34 25Z" fill="${C.dark}"/><path d="M23 40h25v25H23Zm62 0h25v25H85Z" fill="${C.blue}"/><path d="M35 40v25m62-25v25" stroke="${C.cream}" stroke-width="3"/><path d="M17 112a22 22 0 0 1 44 0v52H17Zm61 0a22 22 0 0 1 44 0v52H78Z" fill="${C.ink}"/><path d="M22 113a17 17 0 0 1 34 0v51H22Z" fill="${C.green}"/><path d="M6 74h123v12H6Z" fill="${C.pale}"/><path d="M83 115h34v30H83Z" fill="${C.blue}"/><path d="M100 115v30" stroke="${C.ink}" stroke-width="3"/><path d="M4 164h128" stroke="${C.brick}" stroke-width="5" stroke-linecap="round"/><path d="M136 59v45" stroke="${C.ink}" stroke-width="3"/><path d="M126 66h20v28h-20Z" fill="${C.yellow}"/><path d="M131 66v28m9-28v28" stroke="${C.coral}" stroke-width="2"/></g>
    ${tree(128, 225, .95)}${tree(636, 247, .88, C.green)}${palm(590, 204, .76)}
    ${pot(439, 347, .85)}${pot(404, 330, .75, C.yellow)}
    <g transform="translate(523 375)"><path d="M0 7h57v12H0Z" fill="${C.brick}"/><path d="M3-13h51v16H3Z" fill="${C.coral}"/><path d="M8 20v15m41-15v15" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/></g>
    ${bicycle(196, 377, .77)}
    ${person(atResult ? 395 : 365, atResult ? 352 : 350, .95)}
    <g transform="translate(91 437)"><path d="M0 22q16-27 33 0" fill="${C.green}"/><path d="M22 28q18-34 34 0" fill="${C.dark}"/><path d="M9 27h52" stroke="${C.sand}" stroke-width="3"/></g>
    <g transform="translate(578 455)"><path d="M0 22q16-27 33 0" fill="${C.green}"/><path d="M22 28q18-34 34 0" fill="${C.dark}"/><path d="M9 27h52" stroke="${C.sand}" stroke-width="3"/></g>
    <g transform="translate(466 447)"><path d="M0 13c0-9 7-13 15-13 10 0 16 7 15 15l-6 7H6Z" fill="${C.cream}"/><path d="M5 4 4-5l9 6m7 0 8-6-1 12" fill="${C.cream}"/><path d="M29 14q17 6 15-7" fill="none" stroke="${C.cream}" stroke-width="6" stroke-linecap="round"/><path d="M6 22v5m14-5v5" stroke="${C.brick}" stroke-width="3" stroke-linecap="round"/><circle cx="8" cy="9" r="1.5" fill="${C.ink}"/></g>
    ${atResult ? `<g class="art-confetti" fill="${C.coral}"><path d="m222 98 5-10 5 10-5 10Zm294 52 5-10 5 10-5 10Z"/><circle cx="461" cy="61" r="4"/><circle cx="153" cy="184" r="4"/></g>` : ''}
    <path d="m74 312-6-5m5 14-9 1m602-95 8-6m-6 16 10 1" stroke="${C.green}" stroke-width="3" stroke-linecap="round"/>
  `, '0 0 760 580', `art art-street art-step-${String(step).replace(/[^a-z0-9-]/gi, '') || 'welcome'}`);
}

const ICONS = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  home: '<path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/>',
  house: '<path d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-7h6v7"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
  leaf: '<path d="M19 3C8 2 2 7 4 14c1 4 5 6 9 4 6-3 6-10 6-15ZM3 21 15 9"/>',
  spark: '<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h13v4M3 5v14a2 2 0 0 0 2 2h15V7m0 5h-6v5h6"/><path d="M16.5 14.5h.1"/>',
  book: '<path d="M3 4h6l3 2 3-2h6v15h-6l-3 2-3-2H3V4Zm9 2v15"/>',
  pin: '<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  reset: '<path d="M4 10a8 8 0 1 1 2 8M4 4v6h6"/>',
  save: '<path d="M5 3h12l3 3v15H4V3h1Zm3 0v6h8V3M8 21v-8h8v8"/>',
  print: '<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 13h10v8H7Zm10-2h1"/>',
  printer: '<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 13h10v8H7Zm10-2h1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  ticket: '<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm12 0v2m0 3v2m0 3v2"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  external: '<path d="M14 3h7v7m0-7L10 14m0-10H4v16h16v-6"/>'
};

export function icon(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="icon" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${Object.hasOwn(ICONS, name) ? ICONS[name] : ICONS.spark}</svg>`;
}
