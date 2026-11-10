import { companionTools } from '../../tool-routes.js?v=6.0.0';

const stage = document.querySelector('#stage');
const steps = [...document.querySelectorAll('.stepper .step')];
const observations = {
  photo: [
    { id: 'pillar', key: '1', label: '柱面標示', note: '左側柱面寫著「B」。入口指示牌說明，柱上的英文字母代表棟別。' },
    { id: 'number', key: '2', label: '地面編號', note: '車格內的地面漆著「12」，數字旁沒有棟別。' },
    { id: 'line', key: '3', label: '右側格線', note: '右側的白線標出車格邊界，線上沒有文字。' }
  ],
  plan: [
    { id: 'building', key: '1', label: '圖首棟別', note: '夾在點交資料裡的配置圖，圖首寫著「A 棟 · 地下一樓 B1」。' },
    { id: 'stall', key: '2', label: '框選的車格', note: '圖上框選的車格是 12 號，左右相鄰的是 11 號和 13 號。' },
    { id: 'aisle', key: '3', label: '行車方向', note: '通道箭頭朝右，標的是車輛行進方向。' }
  ]
};

const outcomes = {
  move: {
    title: '紙箱先到了，位置還沒對上。',
    text: '爸爸把箱子推進 12 號格。隔壁的住戶也指著圖上的 12 號，問：「你們拿的是哪一棟的圖？」爸爸只好先把箱子搬回推車。',
    scene: 'move-scene',
    alt: '爸爸蹲下把紙箱搬回推車，小晴抱著配置圖，小安托著下巴看。'
  },
  ask: {
    title: '有人答了「對」，卻沒留下依據。',
    text: '帶看的人點點頭：「平常都叫它 12 號。」隔天換人值班，只看得到點交單上的「車位一席」。小晴得再跑一趟，指出當時看的是哪一格。',
    scene: 'ask-scene',
    alt: '值班人員在窗口攤開手，小晴疑惑地回頭看爸爸，小安抬頭聽著。'
  }
};

const resolveAlt = '小安舉起柱面照片，小晴對著桌上的車位圖做筆記，爸爸俯身和她一起看。';
const checklist = [
  ['現場位置', '拍下棟別、樓層、格號與周邊位置，讓下一位查核的人找得到同一格。'],
  ['契約與附件', '找出契約、車位配置圖及車位約定，逐一對照棟別、樓層和編號。'],
  ['點交紀錄', '分別寫下現場與圖面各自的標示，附上照片、圖面日期或版本，將車位列為待確認。'],
  ['確認與複核', '請交付方提供可核對的書面說明，約定回覆人及時間，再到現場一起確認。']
];
const defaultDraft = [
  '你好，我剛玩了「小安的點交日」。練習中，現場 B 棟及附件 A 棟都出現 12 號，契約只寫「車位一席」。',
  '我想帶這份清單請教車位點交：',
  '1. 現場位置：拍下棟別、樓層、格號與周邊位置。',
  '2. 契約與附件：對照契約、配置圖及相關車位約定。',
  '3. 點交紀錄：列明兩處的棟別差異，留存照片與圖面版本。',
  '4. 確認與複核：請交付方書面說明，約定雙方複核的時間及回覆人。',
  '請問點交前，還需要準備哪些資料？'
].join('\n');
const accountUrl = 'https://line.me/R/ti/p/%40604gpqef';
const lineUrl = value => value.trim() ? 'https://line.me/R/oaMessage/%40604gpqef/?' + encodeURIComponent(value) : accountUrl;
const escapeHtml = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));

const state = {
  page: 'inspect',
  marks: { photo: '', plan: '' },
  attached: { photo: false, plan: false },
  outcome: '',
  returnTo: 'choose',
  draft: defaultDraft,
  checked: new Set()
};

const markOf = source => observations[source].find(item => item.id === state.marks[source]);
const actionButton = (action, label, kind = 'primary-btn') =>
  `<button type="button" data-action="${action}" class="${kind}">${label}</button>`;
const panelTitle = (kicker, title, copy) =>
  `<div class="panel-heading"><p class="kicker">${kicker}</p><h2 id="round-title" tabindex="-1">${title}</h2><p>${copy}</p></div>`;
const storyFrame = (file, alt, width = 960, height = 540) =>
  `<figure class="scene-frame"><img src="./${file}.webp" width="${width}" height="${height}" alt="${alt}"></figure>`;

function hotspot(source, item) {
  return `<button type="button" class="${source}-hotspot" data-source="${source}" data-spot="${item.id}"
    aria-label="${source === 'photo' ? '照片' : '配置圖'}觀察點 ${item.key}，${item.label}" aria-pressed="${state.marks[source] === item.id}">${item.key}</button>`;
}

function markControls(source) {
  const label = source === 'photo' ? '照片' : '配置圖';
  return `<div class="mark-list" role="group" aria-label="${label}標記，選一項">${observations[source].map(item =>
    `<button type="button" data-source="${source}" data-spot="${item.id}" class="mark-button" aria-pressed="${state.marks[source] === item.id}">
      <span class="mark-id" aria-hidden="true">${item.key}</span>${item.label}</button>`).join('')}</div>
    <p class="selection-note" data-note="${source}" aria-live="polite">${noteText(source)}</p>`;
}

function noteText(source) {
  const item = markOf(source);
  return item ? '已標記｜' + item.note : '尚未標記。點圖中的圓點，或選下方觀察點。';
}

// Draw only the information on the fictional plan. HTML buttons overlay the drawing
// so touch, pointer, and keyboard users can inspect the same three features.
function floorPlan() {
  return `<div class="plan-board">
    <svg class="floor-plan" viewBox="0 0 600 400" role="img" aria-labelledby="plan-title plan-desc">
      <title id="plan-title">點交資料所附的車位配置圖</title>
      <desc id="plan-desc">圖首標有棟別與樓層。圖上有四個相連的車格，其中一格被框起。下方是行車通道。三項細節均可點選查閱。</desc>
      <defs><pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#d5dfd9" stroke-width="0.7"/></pattern>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1M0 8L8 0M7 9L9 7" fill="none" stroke="#b66d41" opacity="0.27" stroke-width="1.5"/></pattern>
      </defs>
      <rect width="600" height="400" fill="#f1f3e8"/><rect width="600" height="400" fill="url(#grid)"/>
      <g font-family="system-ui,sans-serif" fill="#2e5147">
        <text x="32" y="41" font-size="15" letter-spacing="3">停車空間配置圖</text>
        <text x="31" y="86" font-size="37" font-weight="750">A 棟</text>
        <text x="254" y="82" font-size="22" font-weight="600">地下一樓 B1</text>
        <path d="M31 103H569M34 299H566" fill="none" stroke="#799085" stroke-width="2"/>
        <path d="M49 127H554V276M49 127V276M175 127V276M302 127V276M428 127V276" fill="none" stroke="#42665a" stroke-width="5"/>
        <rect x="309" y="137" width="111" height="136" fill="url(#hatch)" stroke="#a7532b" stroke-width="4" stroke-dasharray="9 5"/>
        <g text-anchor="middle" font-size="34" font-weight="650">
          <text x="112" y="219">10</text><text x="238" y="219">11</text><text x="355" y="219" fill="#85451f">12</text><text x="490" y="219">13</text>
        </g>
        <text x="52" y="349" font-size="22" letter-spacing="3">行車通道</text>
        <path d="M215 340H451M431 325L451 340L431 355" fill="none" stroke="#66877a" stroke-width="4"/>
      </g>
    </svg>${observations.plan.map(item => hotspot('plan', item)).join('')}</div>`;
}

function investigation() {
  const returning = state.returnTo === 'proof';
  return `<div class="inspection-grid">
    <section class="evidence-card photo-card" aria-labelledby="photo-title">
      <header class="card-heading"><p class="kicker">證物 01 ／ 現場</p><h2 id="photo-title">地下室現場照</h2></header>
      <div class="photo-board"><img src="./garage.webp" width="1200" height="800" alt="地下車庫示意照片。左側是有字母的柱面，右前方車格的地面有編號和白色格線。">
      ${observations.photo.map(item => hotspot('photo', item)).join('')}</div>
      ${markControls('photo')}
    </section>
    <section class="evidence-card plan-card" aria-labelledby="drawing-title">
      <header class="card-heading"><p class="kicker">證物 02 ／ 附件</p><h2 id="drawing-title">停車位配置圖</h2></header>
      ${floorPlan()}${markControls('plan')}
    </section>
    </div>
    <section class="decision-panel inspect-actions">
      <div class="contract-slip"><span class="kicker">契約摘錄</span><strong>「車位一席」</strong></div>
      <div class="panel-heading"><h2 id="round-title" tabindex="-1">你想留哪兩個記號？</h2><p>照片和圖面各標一處，點別的位置就能改。</p></div>
      <div class="stage-actions"><span id="mark-count" class="live-note">已標記 ${markCount()}／2 份</span>
      ${actionButton('inspect-next', returning ? '帶著標記回到紀錄 →' : '收好標記，去點交 →')}</div>
      <p class="live-note" aria-live="polite" id="inspect-feedback"></p>
    </section>`;
}

function markCount() {
  return Number(Boolean(state.marks.photo)) + Number(Boolean(state.marks.plan));
}

function choose() {
  return `<section class="decision-panel story-spread">
    ${panelTitle('點交現場', '爸爸問：「紙箱可以搬過去了嗎？」', '小晴握著圖，等你先開口。')}
    ${storyFrame('arrival-small', '爸爸扶著推車，等小晴和小安看完配置圖。', 600, 400)}
    <div class="spread-controls"><div class="choice-list">
      ${actionButton('move', '把紙箱搬進 12 號車格', 'choice-btn')}
      ${actionButton('ask', '先問現場人員是不是這一格', 'choice-btn')}
      ${actionButton('record', '把差異記下，請交付方確認', 'choice-btn')}
    </div>
    <div class="stage-actions">${actionButton('edit-from-choose', '← 回去看我的標記', 'text-link')}</div></div>
  </section>`;
}

function outcome() {
  const result = outcomes[state.outcome];
  return `<section class="outcome-card story-spread">${panelTitle('這個選擇之後', result.title, result.text)}
    ${storyFrame(result.scene, result.alt)}
    <div class="spread-controls"><div class="stage-actions">${actionButton('rewind', '↶ 倒帶，換個做法')}${actionButton('edit-from-choose', '重看現場證物', 'secondary-btn')}</div>
    <p class="sheet-note">倒帶會保留你做的兩個記號。</p></div></section>`;
}

function proof() {
  return `<section class="decision-panel proof-panel">
    <div class="proof-heading">
      ${panelTitle('點交紀錄 ／ 待確認', '哪兩個記號能說明差異？', '小晴攤開點交單。從你留下的標記，各附上一份能讓對方回頭核對的證據。')}
      ${storyFrame('resolve-scene', resolveAlt)}
    </div>
    <div class="review-grid">${['photo', 'plan'].map((source, i) =>
      `<article class="review-card"><p class="kicker">證物 0${i + 1} ／ ${i ? '配置圖' : '現場照片'}</p><h3>${markOf(source).label}</h3>
        <p>${markOf(source).note}</p><label class="attachment-label"><input type="checkbox" data-attach="${source}" ${state.attached[source] ? 'checked' : ''}> 附上這個標記</label></article>`).join('')}</div>
    <p class="contract-slip"><span class="kicker">契約摘錄</span><strong>「車位一席」</strong></p>
    <p id="proof-feedback" class="live-note" aria-live="polite"></p>
    <div class="stage-actions">${actionButton('prove', '完成這筆待確認紀錄 →')}${actionButton('edit-from-proof', '回到照片與圖面改標記', 'secondary-btn')}${actionButton('rewind', '↶ 回到點交決定', 'text-link')}</div>
  </section>`;
}

function messageText() {
  const priorities = checklist.filter((_, i) => state.checked.has(i)).map(item => item[0]);
  return [state.draft, priorities.length ? '我想優先詢問：' + priorities.join('、') + '。' : ''].filter(Boolean).join('\n\n');
}

function finish() {
  return `<section class="outcome-card final-outcome story-spread">
    ${panelTitle('點交紀錄已完成 ／ 車位待確認', '同樣寫著 12 號，指向的棟別卻不同。', '小晴把「現場柱面 B、附件圖首 A 棟」並列在點交單上。爸爸先收好推車，約交付方帶原圖一起核對。')}
    ${storyFrame('resolve-scene', resolveAlt)}
    <div class="spread-controls"><p class="sheet-note">「車位一席」只寫了數量。這兩個記號足以提出疑問，權利範圍仍要回到契約、附件及相關資料核對。</p>
    <div class="stage-actions">${actionButton('rewind', '↶ 保留標記，試另一個選擇', 'secondary-btn')}</div></div>
  </section>
  <section class="decision-panel checklist-panel"><p class="kicker">小晴的點交筆記</p><h2>帶到現場的四項清單</h2>
    <p>勾選想優先詢問的項目，會附在 LINE 清單最後。</p>
    <ul class="check-list">${checklist.map(([title, detail], i) =>
      `<li><label><input type="checkbox" data-check="${i}" ${state.checked.has(i) ? 'checked' : ''}><span><strong>${title}</strong><span>${detail}</span></span></label></li>`).join('')}</ul></section>
  <section class="line-panel"><p class="kicker">宏國地政 × 易丞地政</p><h2>帶著問題問官方 LINE</h2>
    <label for="line-draft">可修改這份清單與提問，開啟 LINE 後由你確認送出。</label>
    <textarea id="line-draft" rows="7" maxlength="1000">${escapeHtml(state.draft)}</textarea>
    <details class="message-preview" id="message-preview"><summary>預覽要帶到 LINE 的完整文字</summary>
      <textarea readonly id="outgoing-text" aria-label="完整提問預覽" rows="7">${escapeHtml(messageText())}</textarea></details>
    <div class="stage-actions"><a class="primary-btn" id="line-link" target="_blank" rel="noopener noreferrer" href="${escapeHtml(lineUrl(messageText()))}">開啟官方 LINE ↗</a>
    ${actionButton('copy', '複製提問', 'secondary-btn')}<a class="text-link" href="${accountUrl}" rel="noopener noreferrer" target="_blank">官方帳號／QR Code ↗</a></div>
    <p class="live-note" id="copy-feedback" aria-live="polite"></p><p class="sheet-note">官方帳號 @604gpqef。請略過姓名、地址等個案資料。</p>
  </section>
  <section class="decision-panel related-panel"><h2>接著走走</h2><div class="link-list">
    <a class="text-link" href="../?quest=buy">回小晴的第一次看屋 →</a>
    ${Object.values(companionTools).map(tool => `<a class="text-link" href="${tool.url}" target="_blank" rel="noopener noreferrer">${tool.name} ↗</a>`).join('')}
  </div></section>`;
}

const views = { inspect: investigation, choose, outcome, proof, finish };
const progress = { inspect: 0, choose: 1, outcome: 1, proof: 2, finish: 3 };

function showPage(page, moveFocus = true) {
  state.page = page;
  steps.forEach((step, i) => {
    if (progress[page] === i) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
    step.classList.toggle('is-complete', i < progress[page]);
  });
  if (moveFocus) document.querySelector('.case-shell').classList.add('in-round');
  stage.innerHTML = views[page]();
  if (moveFocus) {
    const target = page === 'inspect' ? stage : stage.querySelector('#round-title');
    target.focus({ preventScroll: true });
    document.querySelector('.stepper').scrollIntoView({ block: 'start' });
  }
}

function changeMark(button) {
  const source = button.dataset.source;
  if (state.marks[source] === button.dataset.spot) return;
  state.marks[source] = button.dataset.spot;
  state.attached[source] = false;
  stage.querySelectorAll(`button[data-source="${source}"]`).forEach(marker => {
    marker.setAttribute('aria-pressed', String(marker.dataset.spot === button.dataset.spot));
  });
  stage.querySelector(`[data-note="${source}"]`).textContent = noteText(source);
  stage.querySelector('#mark-count').textContent = `已標記 ${markCount()}／2 份`;
  stage.querySelector('#inspect-feedback').textContent = '';
}

function prove() {
  const feedback = stage.querySelector('#proof-feedback');
  if (!state.attached.photo || !state.attached.plan) {
    feedback.textContent = '請先勾選照片與圖面的標記各一份。';
    return;
  }
  if (state.marks.photo !== 'pillar' || state.marks.plan !== 'building') {
    feedback.textContent = '這一組記號還無法指出兩份資料哪裡衝突。回去看看，現場和圖面各用什麼標示位置？';
    return;
  }
  showPage('finish');
}

function updateMessage() {
  const message = messageText();
  stage.querySelector('#outgoing-text').value = message;
  stage.querySelector('#line-link').href = lineUrl(message);
  stage.querySelector('#copy-feedback').textContent = '';
}

async function copyDraft() {
  const message = messageText();
  const feedback = stage.querySelector('#copy-feedback');
  if (!message.trim()) {
    feedback.textContent = '先在提問欄輸入想詢問的內容。';
    stage.querySelector('#line-draft').focus();
    return;
  }
  try {
    await navigator.clipboard.writeText(message);
    feedback.textContent = '已複製，可貼到官方 LINE 對話框。';
  } catch {
    stage.querySelector('#message-preview').open = true;
    const preview = stage.querySelector('#outgoing-text');
    preview.focus();
    preview.select();
    feedback.textContent = '已選取文字，請長按選「複製」，或按 Ctrl+C（Mac 用 ⌘C）。';
  }
}

stage.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.spot) {
    changeMark(button);
    return;
  }
  const action = button.dataset.action;
  switch (action) {
    case 'inspect-next':
      if (markCount() === 2) showPage(state.returnTo);
      else {
        const missing = state.marks.photo ? '配置圖' : state.marks.plan ? '照片' : '照片和配置圖';
        stage.querySelector('#inspect-feedback').textContent = `請先在${missing}選一個觀察點。`;
        stage.querySelector(`button[data-source="${state.marks.photo ? 'plan' : 'photo'}"]`).focus();
      }
      break;
    case 'move':
    case 'ask':
      state.outcome = action;
      showPage('outcome');
      break;
    case 'edit-from-choose':
    case 'edit-from-proof':
      state.returnTo = action === 'edit-from-proof' ? 'proof' : 'choose';
      showPage('inspect');
      break;
    case 'rewind':
      state.returnTo = 'choose';
      state.attached = { photo: false, plan: false };
      showPage('choose');
      break;
    case 'record': showPage('proof'); break;
    case 'prove': prove(); break;
    case 'copy': void copyDraft(); break;
  }
});

stage.addEventListener('change', event => {
  const { attach, check } = event.target.dataset;
  if (attach) {
    state.attached[attach] = event.target.checked;
    stage.querySelector('#proof-feedback').textContent = '';
  }
  if (check !== undefined) {
    if (event.target.checked) state.checked.add(Number(check));
    else state.checked.delete(Number(check));
    updateMessage();
  }
});

stage.addEventListener('input', event => {
  if (event.target.id !== 'line-draft') return;
  state.draft = event.target.value;
  updateMessage();
});

showPage('inspect', false);
