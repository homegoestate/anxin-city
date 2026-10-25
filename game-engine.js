import { calculateLoan } from './loan.js';

// All amounts are illustrative NT dollars. This module has no DOM, I/O, clock,
// randomness or saved state. Every result is rebuilt from the entire answer list.
const WAN = 10_000;
const money = value => Math.round(value);
const positiveGap = value => Math.max(0, money(value));
const yuan = value => `${money(value).toLocaleString('zh-TW')} 元`;
const option = (id, label, description, acknowledgement) => ({ id, label, description, acknowledgement });
const question = (id, title, prompt, help, options) => ({ id, title, prompt, help, options });
const card = (id, label, value, detail, tone = 'neutral', unit = '元') => ({ id, label, value, unit, detail, tone });

function freezeDeep(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

export const scenarios = freezeDeep([
  {
    id: 'first-home', title: '首購小安的第一間家', description: '在功能、價格、準備時間與壓力情境之間，找出現金和每月生活的界線。',
    character: { name: '首購小安', role: '首購練習角色' },
    questions: [
      question('priority', '先選生活重點', '住進新家後，你最想先保住哪一筆預算？', '基本生活費固定每月 35,000 元；以下是額外的優先預算，不重複扣入基本生活費。', [
        option('commute', '通勤與時間', '每月另留 4,000 元交通與通勤安排預算。', '你先替日常通勤保留空間。'),
        option('space', '家人與空間', '每月另留 6,000 元家庭空間維護與設備預算。', '你把家人的使用需求放進每月支出。'),
        option('buffer', '持續存下緩衝金', '每月另留 10,000 元作為持續儲蓄目標。', '你希望繳完房貸後仍能繼續存錢。'),
      ]),
      question('price', '選一間練習住宅', '要用哪個總價繼續試算？', '一律先用貸款 75%、30 年、年利率 2.5% 的假設試算；這不是銀行核貸承諾。', [
        option('price-900', '900 萬元', '較低總價，也要檢查功能是否足夠。', '你選了 900 萬元的價格情境。'),
        option('price-1200', '1,200 萬元', '價格提高會同時增加自備款與月付金。', '你選了 1,200 萬元的價格情境。'),
        option('price-1600', '1,600 萬元', '先看清現金與月付差距，再談喜不喜歡。', '你選了 1,600 萬元的價格情境。'),
      ]),
      question('timing', '準備進場時間', '要用現有存款，還是先累積一段時間？', '假設等待期間每月另存 30,000 元，房價、利率與其他條件不變；這不是未來價格預測。', [
        option('now', '現在開始評估', '以現有存款 350 萬元計算。', '你選擇用目前的假設存款評估。'),
        option('save-12', '先存 12 個月', '假設增加 36 萬元存款。', '你用一年準備期增加自備資金。'),
        option('save-24', '先存 24 個月', '假設增加 72 萬元存款。', '你用兩年準備期增加自備資金。'),
      ]),
      question('shock', '做一次壓力演練', '如果條件改變，要先測哪一種情境？', '月收入 85,000 元、生活費 35,000 元、其他債務月付 5,000 元。每次只套用所選的一種壓力。', [
        option('baseline', '維持基準條件', '年利率 2.5%，月收入不變。', '先確認基準條件下的生活餘額。'),
        option('income-down', '收入減少 20%', '月收入改為 68,000 元，房貸利率維持 2.5%。', '收入下降，生活費與房貸不會跟著自動減少。'),
        option('rate-up', '利率增加 1 個百分點', '以 3.5% 重新計算整筆 30 年貸款的月付金。', '你選擇比較較高利率下的新貸款月付情境。'),
      ]),
    ],
  },
  {
    id: 'move-home', title: '換屋阿成的資金接力', description: '用同一條 16 個月現金時間線，檢查買、賣、交屋與短期資金能否接上。',
    character: { name: '換屋阿成', role: '換屋練習角色' },
    questions: [
      question('order', '排定買賣順序', '你想先怎麼安排換屋？', '舊屋假設售價 1,000 萬、舊貸餘額 500 萬；新屋總價 1,200 萬。買賣與交屋條件都要另行確認。', [
        option('buy-first', '先買，再賣舊屋', '今天先買新屋，之後等舊屋出售。', '先買能先確定新住處，也會提早出現資金需求。'),
        option('sell-first', '先賣，再買新屋', '舊屋交屋後兩個月再買，期間租屋。', '先賣可以先看清資金，這裡另計兩個月租屋及兩次搬家。'),
        option('coordinated', '協調同月交屋', '假設舊屋價款先到位，再於同月底買新屋。', '同月交屋依賴雙方契約、銀行與付款順序配合。'),
      ]),
      question('sale-time', '測試出售時間', '假設舊屋在哪一個月完成出售交屋？', '這是時間壓力演練，不是對實際成交速度的預測。', [
        option('month-1', '第 1 個月', '一個月後完成交屋。', '你採用較快出售的假設。'),
        option('month-6', '第 6 個月', '半年後完成交屋。', '你讓舊屋持有與資金銜接持續半年。'),
        option('month-12', '第 12 個月', '一年後完成交屋。', '你用一年出售期檢查備案能否撐住。'),
      ]),
      question('financing', '設定新屋貸款情境', '要用哪個貸款比例試算新屋？', '50%、60%、70% 都只是數學輸入。第二戶、換屋、銀行鑑價及現行管制可能限制貸款，必須先查證。', [
        option('ltv-50', '模擬貸款 50%', '貸款 600 萬，自備房款 600 萬。', '較低貸款降低月付金，但提高交屋現金需求。'),
        option('ltv-60', '模擬貸款 60%', '貸款 720 萬，自備房款 480 萬。', '你選擇中間的貸款比例作情境比較。'),
        option('ltv-70', '模擬貸款 70%', '貸款 840 萬，自備房款 360 萬。', '較高貸款降低自備房款，卻提高每月還款。'),
      ]),
      question('fallback', '訂一個缺口備案', '如果舊屋價款還沒到，如何看待資金缺口？', '引擎不會自動補入一筆「已核准」借款。時間線中的缺口始終保留可見。', [
        option('no-bridge', '不預設借得到短期資金', '缺口直接列為尚未準備的資金。', '你沒有把尚未核准的資金當成已到位。'),
        option('quoted-bridge', '測試年息 6% 的短期資金', '僅估算缺口利息，不代表任何銀行或親友願意提供。', '你把短期資金成本列入演練，仍需確認來源、期限與清償條件。'),
        option('sale-contingency', '舊屋價款到位才買', '若原本先買，改成舊屋交屋後同月底才付款買新屋。', '你將付款條件改成價款先到位；是否能寫入契約仍須協調。'),
      ]),
    ],
  },
  {
    id: 'seller', title: '賣屋美玲的實拿帳', description: '分開看開價、議價、出售時間與預留金，避免把成交價當成可以全部使用的現金。',
    character: { name: '賣屋美玲', role: '出售練習角色' },
    questions: [
      question('asking-price', '決定價格情境', '先用哪個開價做演練？', '參考情境價為 1,200 萬。價格選擇不會自動決定多久賣掉。', [
        option('ask-1100', '1,100 萬元', '用較低價格測試可接受的實拿金額。', '你先測試較低開價的結果。'),
        option('ask-1200', '1,200 萬元', '以練習基準價格比較。', '你以 1,200 萬元作為練習開價。'),
        option('ask-1300', '1,300 萬元', '較高價格不代表一定成交。', '你選了較高開價，下一步仍要獨立測試等待時間。'),
      ]),
      question('sale-time', '測試等待時間', '假設在哪個月完成交屋？', '每月計舊屋貸款月付及額外持有支出 5,000 元；交屋前可動用持有預算為 20 萬元。', [
        option('month-1', '第 1 個月', '支付 1 期房貸後交屋。', '你用一個月持有期演練。'),
        option('month-6', '第 6 個月', '支付 6 期房貸後交屋。', '半年等待會占用持有預算。'),
        option('month-12', '第 12 個月', '支付 12 期房貸後交屋。', '一年等待需要檢查交屋之前的現金是否足夠。'),
      ]),
      question('offer', '面對議價情境', '要測試哪一種成交價？', '折讓只是一個假設，不是對買方出價或市場價格的預測。', [
        option('at-ask', '照練習開價成交', '不另扣議價折讓。', '你先看沒有折讓的結果。'),
        option('discount-5', '比開價少 5%', '將開價乘以 95%。', '你把 5% 折讓放入實拿金額。'),
        option('discount-10', '比開價少 10%', '將開價乘以 90%。', '你把 10% 折讓放入實拿金額。'),
      ]),
      question('tax-reserve', '留出待確認的稅務金額', '先預留多少示意稅務資金？', '50／100／150 萬元是練習輸入，不是房地合一稅、土增稅或任何實際稅額。', [
        option('reserve-50', '示意預留 50 萬元', '先從可用現金扣住這筆預留金。', '你選擇預留 50 萬元，實際稅額仍待文件試算。'),
        option('reserve-100', '示意預留 100 萬元', '先從可用現金扣住這筆預留金。', '你選擇預留 100 萬元，實際稅額仍待文件試算。'),
        option('reserve-150', '示意預留 150 萬元', '先從可用現金扣住這筆預留金。', '你選擇預留 150 萬元，實際稅額仍待文件試算。'),
      ]),
    ],
  },
  {
    id: 'legacy-family', title: '傳承一家：現在安排，還是留待以後？', description: '比較生前規劃與日後繼承，再盤點本人意願、照顧現金、參與家人與討論時間。',
    character: { name: '傳承一家', role: '家庭傳承練習角色' },
    questions: [
      question('control', '比較生前與身後路徑', '要先研究現在安排，還是保留財產並準備日後繼承？', '只選擇要研究的路徑，尚未辦理任何移轉；要一起看本人控制、照顧費與家人協調，不能只看稅。', [
        option('retain-control', '保留財產，先安排日後繼承', '先盤點本人控制與生活需要，再討論日後繼承協調。', '你選擇先研究保留財產、安排日後繼承的路徑。'),
        option('staged-handover', '比較生前贈與，讓孩子提早接手', '先安排控制權、居住與照顧費，再比較移轉及後續流程。', '你選擇研究生前贈與，尚未辦理移轉，也不能直接等同節稅。'),
        option('review-options', '兩條路都比較，再決定', '把生前贈與與日後繼承的需求、現金和流程放在一起比較。', '你保留兩條路徑，先取得足夠資料再決定。'),
      ]),
      question('care', '估算照顧現金', '假設每月需要多少照顧預算？', '另假設已有專用月收入 20,000 元、照顧現金 200 萬元；只計不足額，不計投資報酬或物價變動。', [
        option('care-30000', '每月 30,000 元', '專用收入以外，每月需要 10,000 元現金。', '你選擇每月 30,000 元的照顧預算情境。'),
        option('care-60000', '每月 60,000 元', '專用收入以外，每月需要 40,000 元現金。', '你選擇每月 60,000 元的照顧預算情境。'),
        option('care-90000', '每月 90,000 元', '專用收入以外，每月需要 70,000 元現金。', '你選擇每月 90,000 元的照顧預算情境。'),
      ]),
      question('participants', '安排參與順序', '第一輪討論要先找哪些人？', '參與範圍是溝通安排，不代表已取得法定同意、代理權或處分權。', [
        option('all-together', '本人、照顧者與受影響家人', '把需求與分工放在同一張討論表。', '你希望讓相關家人一起看見照顧與資金安排。'),
        option('caregiver-first', '先和主要照顧者盤點', '先整理照顧工作，再安排其他家人討論。', '你先釐清照顧現況，後續仍要補上其他受影響者的需求。'),
        option('self-first', '先釐清本人意願', '先整理想保留的生活與決策，再談家人分工。', '你先讓本人的意願被清楚記錄，尚未形成全家共同方案。'),
      ]),
      question('planning-time', '決定下一次討論時間', '假設多久後完成第一輪盤點？', '等待期間仍會支付照顧缺口；盤點後另預留未來 24 個月的照顧缺口。', [
        option('plan-1', '1 個月內', '先支付 1 個月缺口，再保留 24 個月。', '你安排近期完成第一輪盤點。'),
        option('plan-6', '6 個月後', '先支付 6 個月缺口，再保留 24 個月。', '你選擇半年準備期，照顧現金仍持續流出。'),
        option('plan-12', '12 個月後', '先支付 12 個月缺口，再保留 24 個月。', '你用一年等待期檢查照顧現金是否足夠。'),
      ]),
    ],
  },
]);

export const MISSION_IDS = freezeDeep(scenarios.map(mission => mission.id));

export function getMission(id) {
  const mission = scenarios.find(item => item.id === id);
  if (!mission) throw new RangeError('找不到這個練習任務。');
  return mission;
}

function normalizeAnswers(mission, answers) {
  if (!Array.isArray(answers)) throw new TypeError('答案必須是依題目順序排列的選項 ID 陣列。');
  if (answers.length > mission.questions.length) throw new RangeError('答案超過任務題數。');
  return mission.questions.map((item, index) => {
    const answer = answers[index];
    if (answer === undefined || answer === null) return null;
    if (typeof answer !== 'string' || !item.options.some(choice => choice.id === answer)) {
      throw new RangeError(`第 ${index + 1} 題的選項不正確。`);
    }
    return answer;
  });
}

function mortgage(principal, annualRate, years, income = 100_000) {
  return money(calculateLoan({ principalWan: principal / WAN, annualRate, years, income, otherDebt: 0 }).monthly);
}

function loanMonth(balance, annualRate, payment) {
  const interest = money(balance * annualRate / 1200);
  const paid = Math.min(payment, balance + interest);
  const principal = paid - interest;
  return { interest, paid, principal, balance: balance - principal };
}

function evaluateFirstHome(selected) {
  const [priority, priceChoice, timing, shock] = selected;
  const purchasePrice = { 'price-900': 900, 'price-1200': 1200, 'price-1600': 1600 }[priceChoice] * WAN;
  const preparationMonths = { now: 0, 'save-12': 12, 'save-24': 24 }[timing];
  const priorityBudget = { commute: 4000, space: 6000, buffer: 10_000 }[priority];
  const savings = 3_500_000 + preparationMonths * 30_000;
  const income = shock === 'income-down' ? 68_000 : 85_000;
  const annualRate = shock === 'rate-up' ? 3.5 : 2.5;
  const loanPrincipal = purchasePrice * 0.75;
  const downPayment = purchasePrice - loanPrincipal;
  const acquisitionOtherCost = 300_000;
  const protectedReserve = 600_000;
  const cashRequired = downPayment + acquisitionOtherCost + protectedReserve;
  const downPaymentGap = positiveGap(cashRequired - savings);
  const monthlyMortgage = mortgage(loanPrincipal, annualRate, 30, income);
  const baselineMortgage = mortgage(loanPrincipal, 2.5, 30, 85_000);
  const remainingMonthly = income - 35_000 - 5_000 - monthlyMortgage;
  const comfortRemainingMonthly = remainingMonthly - priorityBudget;
  const viewingTip = {
    commute: '看房前後各走一次尖峰通勤路線，記錄門到門時間、轉乘與停車費。',
    space: '把家人日常動線畫出來，現場核對使用空間、屋況與合法用途資料，不只看裝潢。',
    buffer: '問清管理費、公共設施維護、近期修繕與保險支出，把可查到的金額加進預算。',
  }[priority];
  const metrics = {
    purchasePrice, loanPrincipal, loanPercent: 75, downPayment, acquisitionOtherCost,
    protectedReserve, cashRequired, savings, preparationMonths, monthlyPreparationSaving: 30_000,
    downPaymentGap, cashAfterPurchase: savings - downPayment - acquisitionOtherCost,
    cashAfterReserve: savings - cashRequired, income, livingCost: 35_000, otherDebt: 5_000,
    annualRate, loanYears: 30, monthlyMortgage, baselineMortgage,
    mortgageIncreaseMonthly: monthlyMortgage - baselineMortgage, incomeReductionMonthly: 85_000 - income,
    remainingMonthly, priorityBudget, comfortRemainingMonthly,
  };
  const ending = downPaymentGap > 0
    ? { id: 'cash-gap', title: '先補齊進場現金', tone: 'danger', summary: `在這組假設下，連同費用與 60 萬元預備金，仍有 ${yuan(downPaymentGap)} 的進場缺口。` }
    : comfortRemainingMonthly < 0
      ? { id: 'monthly-gap', title: '每月預算需要調整', tone: 'danger', summary: `進場現金雖可涵蓋假設需求，但扣除生活、其他債務與優先預算後，每月少 ${yuan(-comfortRemainingMonthly)}。` }
      : comfortRemainingMonthly < 10_000
        ? { id: 'narrow-buffer', title: '現金可接上，月餘裕較窄', tone: 'caution', summary: `這組情境每月剩 ${yuan(comfortRemainingMonthly)}；仍須檢查修繕、保險與其他未列支出。` }
        : { id: 'budget-buffer', title: '這組假設保留了月餘裕', tone: 'good', summary: `扣除已列支出與優先預算後，每月保留 ${yuan(comfortRemainingMonthly)}；這不是貸款資格判定。` };
  return {
    metrics, ending, timeline: [], flags: ['illustrative-only', 'financing-not-approved'],
    metricCards: [
      card('entry-gap', '進場現金缺口', downPaymentGap, '自備房款＋其他費用 30 萬＋預備金 60 萬－假設存款。', downPaymentGap > 0 ? 'danger' : 'good'),
      card('mortgage', '假設房貸月付', monthlyMortgage, `${annualRate}%、30 年本息平均攤還；未代表銀行條件。`),
      card('remaining', '扣除基本支出後月餘額', remainingMonthly, '已扣房貸、生活費 35,000 元及其他債務月付 5,000 元。', remainingMonthly < 0 ? 'danger' : 'neutral'),
      card('comfort', '再保留優先預算後', comfortRemainingMonthly, `另保留所選生活目標 ${yuan(priorityBudget)}／月。`, comfortRemainingMonthly < 0 ? 'danger' : 'good'),
    ],
    insights: [
      `自備房款 ${yuan(downPayment)}，其他取得費用 ${yuan(acquisitionOtherCost)}，預備金 ${yuan(protectedReserve)}，合計 ${yuan(cashRequired)}。`,
      `每月算式：${yuan(income)}－${yuan(monthlyMortgage)} 房貸－35,000 元生活費－5,000 元其他債務＝${yuan(remainingMonthly)}。`,
      shock === 'income-down' ? '本次只調降收入 20%；利率仍為 2.5%。' : shock === 'rate-up' ? `本次以 3.5% 重算整筆 30 年新貸款，較基準每月增加 ${yuan(monthlyMortgage - baselineMortgage)}。不是既有貸款中途調息的精算。` : '本次尚未加入收入下降或利率上升壓力。',
    ],
    nextSteps: ['把實際可用存款與不可動用的預備金分開。', '向銀行確認鑑價、可貸金額、利率、期限與其他授信條件。', '加入實際管理費、保險、修繕與家庭支出後再看價格範圍。'],
    assumptions: ['全部為虛構情境，金額單位為新臺幣元。', '貸款 75% 是計算假設，不是可貸成數或核貸承諾。', '其他取得費用 30 萬元是概估預留，未逐項計算稅費。', '等待期間每月存 30,000 元，假設總價與利率不變；沒有預測市場。', '月付金四捨五入至元；基本生活費不含另外所選的優先預算。'],
    feedbackDetails: [
      [`基本生活費之外，每月另留 ${yuan(priorityBudget)}。`, `本組情境保留後的月餘額為 ${yuan(comfortRemainingMonthly)}。`, viewingTip],
      [`假設總價 ${yuan(purchasePrice)}；貸款 ${yuan(loanPrincipal)}；自備房款 ${yuan(downPayment)}。`, `含費用與預備金後，進場需要 ${yuan(cashRequired)}。`],
      [`準備 ${preparationMonths} 個月後，假設存款為 ${yuan(savings)}。`, `依目前全部選擇計算，進場缺口為 ${yuan(downPaymentGap)}。`],
      [`目前採用月收入 ${yuan(income)}、年利率 ${annualRate}%。`, `房貸月付 ${yuan(monthlyMortgage)}；扣完所列全部預算後剩 ${yuan(comfortRemainingMonthly)}／月。`],
    ],
  };
}

function blankTimelineRow(month, openingBalance) {
  return {
    month, label: month === 0 ? '今天' : `第 ${month} 月`, openingBalance,
    income: 0, saleProceeds: 0, purchaseCash: 0, oldMortgage: 0, newMortgage: 0,
    livingCost: 0, otherDebt: 0, rent: 0, movingCost: 0, bridgeInterest: 0,
    otherHoldingCost: 0, taxReserve: 0, cashIn: 0, cashOut: 0, cost: 0,
    netCashFlow: 0, preEventBalance: openingBalance, balance: openingBalance,
    fundingGap: 0, peakFundingGap: 0, events: [],
  };
}

function finalizeRow(row, reserve) {
  row.cashIn = row.income + row.saleProceeds;
  row.cashOut = row.purchaseCash + row.oldMortgage + row.newMortgage + row.livingCost
    + row.otherDebt + row.rent + row.movingCost + row.bridgeInterest + row.otherHoldingCost + row.taxReserve;
  row.cost = row.cashOut;
  row.netCashFlow = row.cashIn - row.cashOut;
  row.balance = row.openingBalance + row.netCashFlow;
  row.fundingGap = positiveGap(reserve - row.balance);
  row.peakFundingGap = positiveGap(reserve - Math.min(row.openingBalance, row.preEventBalance, row.balance));
  return row;
}

function evaluateMoveHome(selected) {
  const [requestedOrder, saleTime, financing, fallback] = selected;
  const saleMonth = { 'month-1': 1, 'month-6': 6, 'month-12': 12 }[saleTime];
  const effectiveOrder = fallback === 'sale-contingency' && requestedOrder === 'buy-first' ? 'coordinated' : requestedOrder;
  const purchaseMonth = effectiveOrder === 'buy-first' ? 0 : effectiveOrder === 'sell-first' ? saleMonth + 2 : saleMonth;
  const loanPercent = { 'ltv-50': 50, 'ltv-60': 60, 'ltv-70': 70 }[financing];
  const purchasePrice = 12_000_000;
  const loanPrincipal = purchasePrice * loanPercent / 100;
  const downPayment = purchasePrice - loanPrincipal;
  const acquisitionOtherCost = 300_000;
  const protectedReserve = 600_000;
  const oldMortgageMonthly = mortgage(5_000_000, 2, 20);
  const newMortgageMonthly = mortgage(loanPrincipal, 2.5, 30);
  const bridgeAnnualRate = fallback === 'quoted-bridge' ? 6 : 0;
  let oldLoanBalance = 5_000_000;
  let newLoanBalance = loanPrincipal;
  let balance = 3_000_000;
  let saleNetProceeds = 0;
  let oldInterestTotal = 0;
  let newInterestTotal = 0;
  const timeline = [];
  for (let month = 0; month <= 16; month++) {
    const row = blankTimelineRow(month, balance);
    if (month > 0) {
      row.income = 100_000;
      row.livingCost = 45_000;
      row.otherDebt = 5_000;
      row.bridgeInterest = money(positiveGap(protectedReserve - balance) * bridgeAnnualRate / 1200);
      if (month <= saleMonth) {
        const payment = loanMonth(oldLoanBalance, 2, oldMortgageMonthly);
        row.oldMortgage = payment.paid;
        oldInterestTotal += payment.interest;
        oldLoanBalance = payment.balance;
      }
      if (month > purchaseMonth) {
        const payment = loanMonth(newLoanBalance, 2.5, newMortgageMonthly);
        row.newMortgage = payment.paid;
        newInterestTotal += payment.interest;
        newLoanBalance = payment.balance;
      }
      if (effectiveOrder === 'sell-first' && month > saleMonth && month <= purchaseMonth) row.rent = 20_000;
    }
    row.preEventBalance = balance + row.income - row.livingCost - row.otherDebt - row.oldMortgage - row.newMortgage - row.rent - row.bridgeInterest;
    if (month === saleMonth) {
      saleNetProceeds = 10_000_000 - oldLoanBalance - 300_000;
      row.saleProceeds = saleNetProceeds;
      row.events.push('月底出售舊屋；價款先清償當期舊貸餘額及假設出售費用 30 萬元');
      oldLoanBalance = 0;
      if (effectiveOrder === 'sell-first') row.movingCost += 30_000;
    }
    if (month === purchaseMonth) {
      row.purchaseCash = downPayment + acquisitionOtherCost;
      row.movingCost += 30_000;
      row.events.push(month === 0 ? '今天買新屋；支付自備房款與概估取得費用' : '月底買新屋；支付自備房款與概估取得費用');
    }
    if (row.rent) row.events.push('過渡租屋 20,000 元');
    if (row.bridgeInterest) row.events.push('缺口按年息 6% 估算單月資金成本，未補入任何已核准借款');
    finalizeRow(row, protectedReserve);
    timeline.push(row);
    balance = row.balance;
  }
  const sum = key => timeline.reduce((total, row) => total + row[key], 0);
  const maxFundingGap = Math.max(...timeline.map(row => row.peakFundingGap));
  const firstGap = timeline.find(row => row.peakFundingGap > 0);
  const dualMortgageMonths = timeline.filter(row => row.oldMortgage > 0 && row.newMortgage > 0).length;
  const lowestMonthlyRemaining = Math.min(...timeline.slice(1).map(row => row.income - row.livingCost - row.otherDebt - row.oldMortgage - row.newMortgage - row.rent - row.bridgeInterest));
  const metrics = {
    purchasePrice, loanPercent, loanPrincipal, downPayment, acquisitionOtherCost, protectedReserve,
    startingCash: 3_000_000, salePrice: 10_000_000, sellingCost: 300_000, saleMonth, purchaseMonth,
    horizonMonths: 16, oldMortgageMonthly, newMortgageMonthly, saleNetProceeds,
    oldMortgageTotal: sum('oldMortgage'), newMortgageTotal: sum('newMortgage'), oldInterestTotal, newInterestTotal,
    newLoanBalanceAtEnd: newLoanBalance, bridgeAnnualRate, bridgeInterestTotal: sum('bridgeInterest'),
    rentTotal: sum('rent'), movingCostTotal: sum('movingCost'), maxFundingGap,
    firstGapMonth: firstGap ? firstGap.month : -1, dualMortgageMonths,
    peakMortgageMonthly: Math.max(...timeline.map(row => row.oldMortgage + row.newMortgage)),
    lowestMonthlyRemaining, normalMonthlyRemaining: 100_000 - 45_000 - 5_000 - newMortgageMonthly,
    cashAtEnd: balance, cashAfterReserveAtEnd: balance - protectedReserve,
    minCashBalance: Math.min(...timeline.map(row => Math.min(row.balance, row.preEventBalance))),
    transitionExpense: sum('rent') + sum('movingCost') + sum('bridgeInterest'),
  };
  const ending = maxFundingGap > 0
    ? { id: bridgeAnnualRate ? 'bridge-dependency' : 'funding-gap', title: bridgeAnnualRate ? '方案依賴尚待確認的短期資金' : '先處理付款時間的現金缺口', tone: 'danger', summary: `保留 60 萬元預備金時，最高仍需 ${yuan(maxFundingGap)} 的額外資金。時間線沒有將這筆錢視為已核准。` }
    : effectiveOrder === 'sell-first'
      ? { id: 'sell-before-buy', title: '先看清價款，再安排購屋', tone: 'good', summary: `這組假設沒有預備金缺口，另付 ${yuan(sum('rent'))} 租金及 ${yuan(sum('movingCost'))} 搬家支出；實際買賣仍須確認。` }
      : { id: 'coordinated-closing', title: '現金可銜接，交屋條件要能落實', tone: 'caution', summary: '這組假設沒有預備金缺口，但同月付款順序、契約條件及銀行作業必須先協調。' };
  return {
    metrics, ending, timeline, plan: { requestedOrder, effectiveOrder, fallback },
    flags: ['illustrative-only', 'financing-not-approved', ...(maxFundingGap > 0 ? ['unfunded-gap'] : []), ...(bridgeAnnualRate ? ['bridge-quote-not-approval'] : [])],
    metricCards: [
      card('funding-gap', '過渡期最高資金缺口', maxFundingGap, '包含保留 60 萬元預備金的需求；未補入未核准借款。', maxFundingGap > 0 ? 'danger' : 'good'),
      card('new-payment', '新屋假設房貸月付', newMortgageMonthly, '以所選比例、2.5%、30 年試算；不代表銀行允許。'),
      card('dual-months', '新舊房貸重疊', dualMortgageMonths, `最高合計月付 ${yuan(metrics.peakMortgageMonthly)}。`, dualMortgageMonths ? 'caution' : 'neutral', '個月'),
      card('monthly-low', '最緊月份的日常餘額', lowestMonthlyRemaining, '已扣生活、其他債務、房貸、租屋與假設短期利息；另看交屋款。', lowestMonthlyRemaining < 0 ? 'danger' : 'neutral'),
      card('bridge-interest', '假設短期資金利息', metrics.bridgeInterestTotal, bridgeAnnualRate ? '以前月底預備金缺口按年息 6%／12 計算，不含其他借款費用。' : '未選短期資金情境；0 元不表示缺口已解決。'),
    ],
    insights: [
      `新屋在第 ${purchaseMonth} 月付款，舊屋在第 ${saleMonth} 月交屋；舊貸隨各月付款減少，出售時清償剩餘本金。`,
      `16 個月過渡費用合計 ${yuan(metrics.transitionExpense)}，僅包含租屋、搬家與所選短期利息，不把貸款本金誤列為費用。`,
      `舊屋出售後的正常每月餘額為 ${yuan(metrics.normalMonthlyRemaining)}，已扣生活 45,000 元、其他債務 5,000 元與新屋房貸。`,
    ],
    nextSteps: ['先確認舊貸實際清償金額、出售費用與可動用存款。', '向銀行逐項確認換屋或第二戶貸款條件，不能把選項成數當成核准額度。', '把價款到位、交屋期限與資金不足時的備案寫入可執行的協調清單。'],
    assumptions: ['虛構家庭：月收入 10 萬、生活費 4.5 萬、其他債務月付 5,000 元、存款 300 萬、保留預備金 60 萬。', '舊貸 500 萬、2%、剩餘 20 年；新屋總價 1,200 萬，新貸 2.5%、30 年，成數尚未核准。', '舊屋售價 1,000 萬、出售概估費用 30 萬；新屋取得概估費用 30 萬，均不是逐項稅費報價。', '第 0 月為今天；每月先計收支與房貸，月底交屋，新貸從購屋次月付款。', '所有路徑同看 16 個月；先賣後買有兩個月租屋，每月 2 萬，搬家兩次各 3 萬；其餘一次 3 萬。', '缺口表示在保留預備金下尚需的資金；模擬不等於買賣可實際履約。', '選 6% 情境時，以前月底缺口估算當月利息；沒有核准借款流入，未計開辦費與違約費。'],
    feedbackDetails: [
      [`目前完整選擇使新屋於第 ${purchaseMonth} 月付款、舊屋於第 ${saleMonth} 月交屋。`, `新舊房貸重疊 ${dualMortgageMonths} 個月。`],
      [`舊屋在第 ${saleMonth} 月完成交屋前，會先支付 ${saleMonth} 期舊房貸。`, `保留預備金時的最高資金缺口為 ${yuan(maxFundingGap)}。`],
      [`假設貸款 ${loanPercent}%：新貸 ${yuan(loanPrincipal)}，自備房款 ${yuan(downPayment)}。`, `新屋月付約 ${yuan(newMortgageMonthly)}；仍須銀行確認。`],
      [fallback === 'sale-contingency' && requestedOrder === 'buy-first' ? '已將原本先買的付款時間改成舊屋交屋同月底；條件仍需協調。' : '未把任何尚未核准的借款加入現金餘額。', `短期利息情境合計 ${yuan(metrics.bridgeInterestTotal)}；最高資金缺口 ${yuan(maxFundingGap)}。`],
    ],
  };
}

function evaluateSeller(selected) {
  const [asking, saleTime, offer, reserveChoice] = selected;
  const askingPrice = { 'ask-1100': 1100, 'ask-1200': 1200, 'ask-1300': 1300 }[asking] * WAN;
  const saleMonth = { 'month-1': 1, 'month-6': 6, 'month-12': 12 }[saleTime];
  const discountPercent = { 'at-ask': 0, 'discount-5': 5, 'discount-10': 10 }[offer];
  const closingPrice = money(askingPrice * (100 - discountPercent) / 100);
  const taxReserve = { 'reserve-50': 50, 'reserve-100': 100, 'reserve-150': 150 }[reserveChoice] * WAN;
  const sellingCost = money(closingPrice * 0.03);
  const monthlyMortgage = mortgage(5_000_000, 2, 20);
  let loanBalance = 5_000_000;
  let balance = 200_000;
  let interestPaid = 0;
  let principalPaid = 0;
  let payoffAtSale = 0;
  let netSaleProceeds = 0;
  let cashBeforeClosing = 0;
  const timeline = [];
  for (let month = 0; month <= 12; month++) {
    const row = blankTimelineRow(month, balance);
    if (month > 0 && month <= saleMonth) {
      const payment = loanMonth(loanBalance, 2, monthlyMortgage);
      row.oldMortgage = payment.paid;
      row.otherHoldingCost = 5_000;
      loanBalance = payment.balance;
      interestPaid += payment.interest;
      principalPaid += payment.principal;
    }
    row.preEventBalance = balance - row.oldMortgage - row.otherHoldingCost;
    if (month === saleMonth) {
      payoffAtSale = loanBalance;
      row.saleProceeds = closingPrice - payoffAtSale - sellingCost;
      row.taxReserve = taxReserve;
      cashBeforeClosing = row.preEventBalance;
      netSaleProceeds = row.saleProceeds - taxReserve;
      row.events.push('月底交屋：扣清償舊貸、假設出售費用，再保留示意稅務金額');
      loanBalance = 0;
    }
    finalizeRow(row, 0);
    timeline.push(row);
    balance = row.balance;
  }
  const mortgagePaid = timeline.reduce((sum, row) => sum + row.oldMortgage, 0);
  const otherHoldingCost = saleMonth * 5_000;
  const maxHoldingCashGap = Math.max(...timeline.map(row => row.peakFundingGap));
  const metrics = {
    askingPrice, saleMonth, discountPercent, closingPrice, sellingCost, sellingCostPercent: 3,
    taxReserve, startingHoldingCash: 200_000, monthlyMortgage, monthlyOtherHoldingCost: 5_000,
    monthlyHoldingOutflow: monthlyMortgage + 5_000, mortgagePaid, interestPaid, principalPaid,
    otherHoldingCost, holdingOutflow: mortgagePaid + otherHoldingCost,
    holdingExpense: interestPaid + otherHoldingCost, payoffAtSale, netSaleProceeds, cashBeforeClosing,
    availableCashAfterSale: balance, maxHoldingCashGap, netTarget: 5_000_000,
    netTargetGap: positiveGap(5_000_000 - netSaleProceeds),
  };
  const ending = maxHoldingCashGap > 0
    ? { id: 'holding-cash-gap', title: '先補好交屋前的持有預算', tone: 'danger', summary: `雖然出售後可能有價款，交屋之前仍曾短少 ${yuan(maxHoldingCashGap)}。未來價款不能直接支付今天的帳單。` }
    : metrics.netTargetGap > 0
      ? { id: 'net-target-gap', title: '成交價與實拿目標仍有距離', tone: 'caution', summary: `扣除舊貸、概估費用及示意稅務預留後，交屋淨額比練習目標 500 萬元少 ${yuan(metrics.netTargetGap)}。` }
      : { id: 'net-cash-visible', title: '價格、時間與實拿已拆開', tone: 'good', summary: `本組交屋淨額為 ${yuan(netSaleProceeds)}；稅務預留仍只是輸入，必須用實際資料另外核算。` };
  return {
    metrics, ending, timeline, flags: ['illustrative-only', 'tax-reserve-not-tax-quote', 'sale-timing-not-prediction'],
    metricCards: [
      card('sale-price', '模擬成交價', closingPrice, `開價 ${yuan(askingPrice)}，假設折讓 ${discountPercent}%。`),
      card('net-sale', '交屋淨額', netSaleProceeds, '扣舊貸剩餘本金、假設出售費用及示意稅務預留。'),
      card('holding-gap', '交屋前最高現金缺口', maxHoldingCashGap, '只用 20 萬元專用持有預算支付每期房貸及每月 5,000 元持有支出。', maxHoldingCashGap > 0 ? 'danger' : 'good'),
      card('holding-month', '每月持有現金支出', metrics.monthlyHoldingOutflow, '房貸月付包含本金與利息，不等於全部是費用。'),
      card('tax-reserve', '示意稅務預留', taxReserve, '使用者所選假設；沒有計算房地合一稅、土增稅或實際稅額。', 'caution'),
    ],
    insights: [
      `交屋淨額＝${yuan(closingPrice)}－舊貸 ${yuan(payoffAtSale)}－概估出售費用 ${yuan(sellingCost)}－示意稅務預留 ${yuan(taxReserve)}。`,
      `${saleMonth} 個月房貸現金支出 ${yuan(mortgagePaid)}，其中本金 ${yuan(principalPaid)} 已降低出售時清償額；未重複當成費用。`,
      `連同原持有預算及等待期間收支後，可動用現金為 ${yuan(balance)}；這與單筆交屋淨額不同。`,
    ],
    nextSteps: ['取得實際貸款清償明細、仲介或其他交易費用。', '用取得原因、日期、成本憑證與土地資料另做正式稅費試算。', '同時訂出可接受實拿金額與可負擔的等待期間，不只設定開價。'],
    assumptions: ['虛構賣方：舊貸 500 萬、2%、剩餘 20 年，另有 20 萬專用持有預算。', '每月除房貸外另支出 5,000 元；此表沒有模擬個人的薪資或全部家庭收支。', '每月底先付當期房貸，再交屋並清償已減少的舊貸本金。', '出售費用以成交價 3% 作練習，不代表仲介約定、法定費率或完整稅費。', '50／100／150 萬稅務預留完全由選項指定，沒有推算實際應納稅額。', '淨額 500 萬是虛構練習目標；開價與成交時間各自獨立選擇，不構成市場預測。'],
    feedbackDetails: [
      [`開價 ${yuan(askingPrice)}；依目前議價選項，假設成交價 ${yuan(closingPrice)}。`, '較低或較高開價都不保證成交時間。'],
      [`等待 ${saleMonth} 個月支付房貸及其他持有現金 ${yuan(metrics.holdingOutflow)}。`, `交屋前最高資金缺口為 ${yuan(maxHoldingCashGap)}。`],
      [`本次假設折讓 ${discountPercent}%，成交價減少 ${yuan(askingPrice - closingPrice)}。`, `依目前全部選擇，交屋淨額為 ${yuan(netSaleProceeds)}。`],
      [`先保留示意金額 ${yuan(taxReserve)}，不能將它當成已算出的稅。`, `扣除這筆預留後，交屋淨額為 ${yuan(netSaleProceeds)}。`],
    ],
  };
}

function evaluateLegacyFamily(selected) {
  const [control, care, participants, planningTime] = selected;
  const careMonthlyBudget = { 'care-30000': 30_000, 'care-60000': 60_000, 'care-90000': 90_000 }[care];
  const planningMonths = { 'plan-1': 1, 'plan-6': 6, 'plan-12': 12 }[planningTime];
  const monthlyCareGap = careMonthlyBudget - 20_000;
  const planningPeriodCareCost = monthlyCareGap * planningMonths;
  const careCashAtPlanning = 2_000_000 - planningPeriodCareCost;
  const requiredCareReserve = monthlyCareGap * 24;
  const careCashAfterReserve = careCashAtPlanning - requiredCareReserve;
  const careReserveGap = positiveGap(-careCashAfterReserve);
  const metrics = {
    careCashStart: 2_000_000, dedicatedCareIncome: 20_000, careMonthlyBudget, monthlyCareGap,
    planningMonths, planningPeriodCareCost, careCashAtPlanning, reserveMonths: 24,
    requiredCareReserve, careCashAfterReserve, careReserveGap,
    coverageMonthsAfterPlanning: Math.max(0, Math.floor(careCashAtPlanning / monthlyCareGap)),
  };
  const controlText = {
    'retain-control': '先研究保留財產與日後繼承：記錄本人想保留的控制、居住與生活需要，再安排日後繼承協調。',
    'staged-handover': '先研究生前贈與與孩子提早接手：控制權、居住和照顧費必須先安排，不能把路徑簡化成節稅；目前未辦理移轉。',
    'review-options': '把生前贈與與日後繼承兩條路都列入比較，連同控制、照顧現金與家人協調一起評估，尚未決定或辦理移轉。',
  }[control];
  const participantText = {
    'all-together': '本人、照顧者與受影響家人一起盤點，但參與討論不等於法律同意或授權。',
    'caregiver-first': '先訪談照顧者，再安排本人及其他受影響家人；目前不是全家共同決議。',
    'self-first': '先記錄本人意願，再安排照顧與家人分工；目前不是全家共同決議。',
  }[participants];
  const ending = careReserveGap > 0
    ? { id: 'care-cash-gap', title: '先處理照顧現金，再談資產安排', tone: 'danger', summary: `在等待 ${planningMonths} 個月並另保留未來 24 個月缺口後，照顧現金還少 ${yuan(careReserveGap)}。` }
    : participants !== 'all-together'
      ? { id: 'discussion-in-progress', title: '已有盤點起點，仍需補齊討論', tone: 'caution', summary: '這組假設照顧預留尚可涵蓋；下一步是把本人意願、照顧者工作與其他家人需求接起來。' }
      : { id: 'discussion-agenda-ready', title: '可以帶著清楚的需求開會', tone: 'good', summary: '你已選出意願重點、照顧預算、參與者與時間；尚未形成法律或稅務方案。' };
  return {
    metrics, ending, timeline: [], plan: { control, participants }, flags: ['illustrative-only', 'no-legal-or-tax-determination'],
    metricCards: [
      card('care-gap', '每月需動用照顧現金', monthlyCareGap, '照顧預算扣除假設專用月收入 20,000 元。'),
      card('planning-time', '第一輪盤點時間', planningMonths, '等待期間仍支付照顧缺口。', planningMonths > 1 ? 'caution' : 'neutral', '個月後'),
      card('care-reserve', '盤點後 24 個月預留', requiredCareReserve, '僅為照顧現金缺口預留，沒有計算稅額。'),
      card('care-remaining', '等待及預留後現金餘額', careCashAfterReserve, '假設照顧現金 200 萬，未計投資報酬、物價變動或突發醫療。', careCashAfterReserve < 0 ? 'danger' : 'good'),
    ],
    insights: [controlText, participantText, `等待期使用 ${yuan(planningPeriodCareCost)}；之後的 24 個月另需 ${yuan(requiredCareReserve)}。`, '這個任務不推算贈與、繼承或信託的稅額與法律效果。'],
    nextSteps: ['記錄本人的生活、居住、決策與照顧意願。', '列出資產權利、現有貸款、照顧支出與可用現金，避免只看不動產名目價值。', '安排尚未參與的相關家人，再以實際文件確認法律工具與稅務資料。'],
    assumptions: ['全部為虛構家庭情境：照顧現金 200 萬、照顧專用月收入 2 萬。', '所選照顧預算先扣專用收入，只有不足額由現金支付；沒有重複計入整筆照顧費。', '等待期費用與盤點後未來 24 個月預留分開計算，期間不重疊。', '沒有模擬不動產變現、投資報酬、通膨或突發醫療。', '選項只表達需求與討論順序，不判定任何法律資格、有效性或稅負。'],
    feedbackDetails: [
      [controlText, '目前沒有指定或執行任何法律工具。'],
      [`每月照顧預算 ${yuan(careMonthlyBudget)}，扣專用收入後需 ${yuan(monthlyCareGap)}。`, `未來 24 個月缺口預留為 ${yuan(requiredCareReserve)}。`],
      [participantText, '請把尚待討論者與資料列成下一步。'],
      [`等待 ${planningMonths} 個月先使用 ${yuan(planningPeriodCareCost)}。`, `另留未來 24 個月後，現金餘額 ${yuan(careCashAfterReserve)}。`],
    ],
  };
}

const evaluators = {
  'first-home': evaluateFirstHome,
  'move-home': evaluateMoveHome,
  seller: evaluateSeller,
  'legacy-family': evaluateLegacyFamily,
};

export function evaluateMission(id, answers = []) {
  const mission = getMission(id);
  const normalized = normalizeAnswers(mission, answers);
  const selected = normalized.map((answer, index) => answer ?? mission.questions[index].options[0].id);
  const evaluated = evaluators[id](selected);
  const answeredCount = normalized.filter(answer => answer !== null).length;
  const nextIndex = normalized.indexOf(null);
  const feedback = mission.questions.flatMap((item, index) => {
    if (normalized[index] === null) return [];
    const chosen = item.options.find(choice => choice.id === normalized[index]);
    return [{ questionId: item.id, optionId: chosen.id, summary: chosen.acknowledgement, details: [...evaluated.feedbackDetails[index]] }];
  });
  const defaults = mission.questions.flatMap((item, index) => normalized[index] === null ? [`尚未作答的「${item.title}」暫以「${item.options[0].label}」預覽。`] : []);
  const { feedbackDetails, ...result } = evaluated;
  void feedbackDetails;
  return {
    missionId: id, answers: normalized, answeredCount, complete: answeredCount === mission.questions.length,
    nextQuestionId: nextIndex === -1 ? null : mission.questions[nextIndex].id,
    ...result, feedback, assumptions: [...defaults, ...result.assumptions],
  };
}

export function buildLineSummary(id, answers = []) {
  const mission = getMission(id);
  const result = evaluateMission(id, answers);
  const choices = mission.questions.map((item, index) => {
    const selected = item.options.find(choice => choice.id === result.answers[index]);
    return `${index + 1}. ${item.title}：${selected ? selected.label : '尚未選擇（結果使用預覽假設）'}`;
  });
  const figures = result.metricCards.map(item => `${item.label}：${item.value.toLocaleString('zh-TW')} ${item.unit}`);
  return [
    '【安心城市｜虛構情境演練】',
    '只記錄遊戲選擇，不代表訪客的實際財務、貸款資格或法律方案。',
    `${mission.title}（${result.complete ? '已完成 4 題' : `已選 ${result.answeredCount}／4 題，仍為預覽`}）`,
    ...choices, '', ...figures, '',
    `練習結果：${result.ending.title}`, result.ending.summary,
    '想進一步確認：', ...result.nextSteps.map((step, index) => `${index + 1}. ${step}`),
    '以上均為假設；實際貸款、稅費與法律效果須以資料另行確認。',
  ].join('\n');
}
