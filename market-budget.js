import { companionTools } from './tool-routes.js';
import { lineMessage } from './service-hub.js?v=11.0.0';

const households = {
  'first-home': {
    name: '首購小安', short: '小安', caption: '第一次買房，車貸還有幾期。',
    quote: '我有存頭期款，車貸也快繳完了。搬進去的第一個月，還有多少錢能過日子？',
    income: 60000, home: 18000, other: 6000, living: 23000,
    otherLabel: '車貸月付', settle: '試試車貸繳清以後',
    slips: [
      { label: '頭期款存摺', note: '存摺上是已經存下的錢。看看有沒有每個月都會入帳的那一筆。' },
      { label: '每月固定薪水', note: '薪水每月入帳，可以放在月收入。頭期款另外列在買房時要準備的資金。', correct: true }
    ],
    question: '小安帶了存摺和薪資單。哪一筆放進「每月收入」？'
  },
  'move-home': {
    name: '換屋阿成', short: '阿成', caption: '舊家還沒交屋，新家已開始還款。',
    quote: '我打算用賣舊家的錢清掉舊貸。如果交屋晚了一個月，這個月要付幾筆房貸？',
    income: 100000, home: 30000, other: 20000, living: 34000,
    otherLabel: '舊房貸月付', settle: '試試舊房貸清償以後',
    slips: [
      { label: '新、舊房貸的當月應繳金額', note: '舊貸仍在扣款，重疊的月份要把新、舊月付都放進還款欄。', correct: true },
      { label: '預計賣房收到的價金', note: '賣價是一次性收入，而且還沒有交屋。先找這個月確定要付出去的款項。' }
    ],
    question: '阿成的舊貸還沒清償。重疊的這個月，要把什麼放進「每月還款」？'
  }
};

const fieldKeys = ['income', 'home', 'other', 'living'];
const currency = new Intl.NumberFormat('zh-TW');
const percent = new Intl.NumberFormat('zh-TW', {maximumFractionDigits: 1});
const fieldName = (key, h) => ({income:'每月固定收入', home:'新房貸月付', other:h.otherLabel, living:'每月生活費'}[key]);

// The amount on each fictional loan slip is already a monthly payment.
// loan.js derives that amount from principal and interest in the original mission.
export function calculateMarketBudget({income, home, other, living}) {
  for (const amount of [income, home, other, living]) {
    if (!Number.isSafeInteger(amount) || amount < 0 || amount > 10000000) throw new RangeError('每格請填 0 至 10,000,000 的整數金額。');
  }
  if (income === 0) throw new RangeError('每月收入須大於 0 元，才能算出還款占比。');
  const payments = home + other;
  const spending = payments + living;
  return {
    payments, spending, balance: income - spending, share: payments / income * 100,
    coverage: spending === 0 ? null : income / spending * 100
  };
}

function portrait(id) {
  return `<img class="mb-portrait" src="./first-day/lantern/assets/resident-${id}.webp" alt="" width="100" height="100">`;
}

function sourceNotes() {
  return `<details class="mb-sources"><summary>收支比的算法與資料來源</summary>
    <p>看見「收支比」，先看收入放在哪一邊。本關的還款占比把月收入放在分母。原版房貸工具的「公股銀行」情境把月收入放在分子，分母還加了本人及扶養人口的生活費。本關用角色的假設生活費練習這個方向。</p>
    <p>銀行另行審查收入、負債與還款能力。內政部公布的「房貸負擔率」則以中位數房價的房貸月付與中位數家戶可支配月所得編製，用來觀察地區購屋負擔。</p>
    <a href="https://moneywise.fsc.gov.tw/tabf/FW/FW2_page_C.html" target="_blank" rel="noopener noreferrer">金管會金融智慧網｜順利辦理貸款應注意事項 ↗</a>
    <a href="https://www.sc.com/tw/personal-loan/articles/debt-burden-ratio/" target="_blank" rel="noopener noreferrer">渣打銀行｜每月還款占收入的算法 ↗</a>
    <a href="https://www.stat.gov.tw/News_NoticeCalendar_Content_temp.aspx?MetaI_D=1841&amp;n=3717&amp;year=2023" target="_blank" rel="noopener noreferrer">內政部地政司｜房價負擔能力指標定義 ↗</a>
  </details>`;
}

export function openMarketBudget({trigger = document.activeElement} = {}) {
  const existing = document.getElementById('market-budget');
  if (existing?.open) return;
  existing?.remove();
  if (!document.getElementById('market-budget-style')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'market-budget-style';
    link.href = new URL('./market-budget.css?v=31.0.0', import.meta.url).href;
    document.head.append(link);
  }
  const dialog = document.createElement('dialog');
  dialog.id = 'market-budget';
  dialog.setAttribute('aria-labelledby', 'mb-title');
  dialog.innerHTML = `<header class="mb-bar"><button type="button" data-mb-back hidden>← 換個角色</button><button type="button" data-mb-close>收起帳本 <span aria-hidden="true">×</span></button></header><div class="mb-page"></div>`;
  const page = dialog.querySelector('.mb-page');
  const back = dialog.querySelector('[data-mb-back]');
  let role;

  function focusHeading() {
    page.scrollTop = 0;
    page.querySelector('#mb-title')?.focus({preventScroll:true});
  }
  function chooseRole() {
    role = null;
    back.hidden = true;
    dialog.dataset.step = 'roles';
    page.innerHTML = `<h2 id="mb-title" tabindex="-1">街坊的買房帳本</h2><p class="mb-lead">收桌後，小安和阿成各拿出一本帳。你想陪誰算算，買房以後每個月還剩多少？</p>
      <div class="mb-people">${Object.entries(households).map(([id,h])=>`<button type="button" class="mb-person" data-mb-role="${id}">${portrait(id)}<span><strong>${h.name}</strong><small>${h.caption}</small></span><b aria-hidden="true">→</b></button>`).join('')}</div>`;
    if (dialog.open) focusHeading();
  }
  function ask(id) {
    role = id;
    const h = households[id];
    back.hidden = false;
    dialog.dataset.step = 'question';
    page.innerHTML = `<div class="mb-speaker">${portrait(id)}<div><strong>${h.name}</strong><p>「${h.quote}」</p></div></div>
      <h2 id="mb-title" tabindex="-1">${h.question}</h2><div class="mb-slips">${h.slips.map((slip,i)=>`<button type="button" aria-pressed="false" data-mb-slip="${i}">${slip.label}</button>`).join('')}</div>
      <p class="mb-reply" role="status" aria-live="polite"></p><button class="mb-primary" type="button" data-mb-ledger hidden>翻開${h.short}的月帳 →</button>`;
    focusHeading();
  }
  function showLedger() {
    const h = households[role];
    dialog.dataset.step = 'ledger';
    page.innerHTML = `<h2 id="mb-title" tabindex="-1">${h.short}這個月的帳</h2>
      <p class="mb-lead">金額都是角色的假設，可以直接改。每格填新臺幣元／月。</p>
      <form class="mb-form" novalidate autocomplete="off">
        <div class="mb-fields">${fieldKeys.map(key=>`<label>${fieldName(key,h)}<input type="number" inputmode="numeric" name="${key}" min="${key==='income'?1:0}" max="10000000" step="1" value="${h[key]}" required></label>`).join('')}</div>
        <div class="mb-actions"><button class="mb-primary" type="submit">算這個月的帳 ↓</button><button type="button" data-mb-settle>${h.settle}</button></div>
      </form><div class="mb-results" tabindex="-1" aria-label="試算結果"></div>
      ${sourceNotes()}
      <div class="mb-next"><a class="mb-primary" data-city-mission="${role}" href="./?start=${role}">陪${h.short}繼續${role==='first-home'?'首購':'換屋'}任務 →</a>
      <a href="${companionTools.loan.url}" target="_blank" rel="noopener noreferrer" data-mb-tool>開啟原版房貸規劃工具 ↗</a>
      <a href="${lineMessage(role==='first-home'?'我看了首購小安的帳本，想問簽約前要先確認哪些付款時程？':'我看了換屋阿成的帳本，想問新舊屋交接的款項怎麼安排？')}" target="_blank" rel="noopener noreferrer" data-mb-line>帶問題問地政士（LINE）↗</a></div>
      <p class="mb-note">原版工具沿用 LINE 好友驗證。這本月帳的假設數字只留在這次練習。</p>`;
    const form = page.querySelector('form');
    const result = page.querySelector('.mb-results');
    const settle = form.querySelector('[data-mb-settle]');
    let pendingOther;

    function update() {
      for (const key of fieldKeys) {
        const field = form.elements.namedItem(key);
        field.setAttribute('aria-invalid', String(!field.validity.valid));
      }
      const values = Object.fromEntries(fieldKeys.map(key=>[key,form.elements.namedItem(key).valueAsNumber]));
      const invalid = fieldKeys.find(key=>!form.elements.namedItem(key).validity.valid);
      if (invalid) {
        result.dataset.valid = 'false';
        result.setAttribute('aria-label','試算結果，請修正欄位');
        const lower = invalid === 'income' ? 1 : 0;
        result.innerHTML = `<p class="mb-error" role="status">請在「${fieldName(invalid,h)}」填 ${lower} 至 10,000,000 的整數，再看結果。</p>`;
        return false;
      }
      const {payments, balance, share, coverage} = calculateMarketBudget(values);
      const n = key => currency.format(values[key]);
      result.dataset.valid = 'true';
      result.setAttribute('aria-label',`試算結果，本月${balance<0?'短缺':'剩餘'} ${currency.format(Math.abs(balance))} 元，每月還款占收入 ${percent.format(share)}%`);
      result.innerHTML = `<div class="mb-balance"><span>付完貸款和生活費，這個月${balance<0?'還差':'還剩'}</span><strong>${currency.format(Math.abs(balance))}<small> 元</small></strong><p>${n('income')} − ${currency.format(payments)} − ${n('living')} ＝ ${currency.format(balance)} 元</p></div>
      <div class="mb-reading"><h3>每月還款，占收入多少？ <b>${percent.format(share)}%</b></h3>
      <p>（新房貸月付＋${h.otherLabel}）÷ 月收入 × 100%</p><p class="mb-equation">（${n('home')} ＋ ${n('other')}）÷ ${n('income')} × 100% ≈ ${percent.format(share)}%</p>
      <p>比例越高，每一元收入用於還債的部分越多。</p></div>
      <div class="mb-reading"><h3>月收入可以涵蓋多少支出？ <b>${coverage===null?'—':percent.format(coverage)+'%'}</b></h3>
      <p>月收入 ÷（每月還款＋生活費）× 100%</p><p class="mb-equation">${coverage===null?'這個月兩項支出都是 0 元，分母為 0，無法計算。':`${n('income')} ÷（${currency.format(payments)} ＋ ${n('living')}）× 100% ≈ ${percent.format(coverage)}%`}</p>
      <p>原版工具的「公股銀行」情境用這個方向，把生活費列入分母。比例越高，表示收入能涵蓋越多支出。實際採計項目依銀行審查。</p></div>`;
      return true;
    }
    form.addEventListener('input', event => {
      if (event.target.name === 'other') {
        pendingOther = undefined;
        settle.textContent = h.settle;
      }
      update();
    });
    function showResults() {
      if (update()) {
        result.focus({preventScroll:true});
        result.scrollIntoView({block:'start'});
      } else form.querySelector('[aria-invalid="true"]')?.focus();
    }
    form.addEventListener('submit', e => {e.preventDefault();showResults();});
    settle.onclick = () => {
      if (!update()) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
      const other = form.elements.namedItem('other');
      if (pendingOther === undefined) {
        pendingOther = other.value;
        other.value = '0';
        settle.textContent = '放回原本的月付金額';
      } else {
        other.value = pendingOther;
        pendingOther = undefined;
        settle.textContent = h.settle;
      }
      showResults();
    };
    update();
    focusHeading();
  }
  dialog.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-mb-close')) dialog.close();
    else if (button === back) chooseRole();
    else if (button.hasAttribute('data-mb-role')) ask(button.dataset.mbRole);
    else if (button.hasAttribute('data-mb-slip')) {
      const slip = households[role].slips[Number(button.dataset.mbSlip)];
      page.querySelectorAll('[data-mb-slip]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      page.querySelector('.mb-reply').textContent = slip.note;
      page.querySelector('[data-mb-ledger]').hidden = !slip.correct;
    } else if (button.hasAttribute('data-mb-ledger')) showLedger();
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (trigger?.isConnected) trigger.focus({preventScroll:true});
  }, {once:true});
  chooseRole();
  document.body.append(dialog);
  dialog.showModal();
  focusHeading();
}
