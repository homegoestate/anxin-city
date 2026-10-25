// Editable scenario assumptions only. No browser state, financial eligibility or tax logic.
const field = (id, label, unit, min, max, step, defaultValue, help) =>
  Object.freeze({ id, label, unit, min, max, step, defaultValue, help });
const fields = Object.freeze({
  'first-home': Object.freeze([
    field('age', '假設開始年齡', '歲', 18, 80, 1, 35, '只用於準備期與貸款期末的時間提示，不代表銀行年齡上限。'),
    field('income', '基準月收入', '元／月', 0, 1_000_000, 1, 85_000, '收入下降選項會在這個基準上減少 20%。'),
    field('savingsWan', '開始時可用存款', '萬元', 0, 100_000, 1, 350, '與取得費用及保留預備金分開計算。'),
    field('livingCosts', '基本生活費', '元／月', 0, 1_000_000, 1, 35_000, '不含題目中另外選擇的購屋後優先預算。'),
    field('otherDebt', '其他債務月付', '元／月', 0, 1_000_000, 1, 5_000, '不含這次練習住宅的房貸月付。'),
    field('loanPercent', '假設貸款比例', '%', 0, 90, 1, 75, '純計算輸入，不代表銀行可貸成數或核准結果。'),
    field('annualRate', '基準年利率', '%', 0, 15, 0.1, 2.5, '升息選項會再增加 1 個百分點；不是利率預測。'),
    field('loanYears', '假設貸款年限', '年', 1, 40, 1, 30, '採本息平均攤還；實際期限仍須由銀行確認。'),
  ]),
  'move-home': Object.freeze([]),
  seller: Object.freeze([]),
  'legacy-family': Object.freeze([
    field('age', '假設開始年齡', '歲', 18, 100, 1, 65, '只標示等待與預留期間，不是壽命或照顧需求預測。'),
    field('careCashWan', '照顧專用現金', '萬元', 0, 100_000, 1, 200, '僅用於照顧缺口，與另頁稅務案例的財產金額分開。'),
    field('dedicatedCareIncome', '照顧專用月收入', '元／月', 0, 1_000_000, 1, 20_000, '只抵減本組照顧支出；未用餘額不自動加入照顧專款。'),
    field('reserveMonths', '盤點後預留期間', '個月', 1, 120, 1, 24, '等待期支出先扣，盤點後再另留這段期間，兩者不重疊。'),
  ]),
});

export function getProfileFields(id) {
  if (!Object.hasOwn(fields, id)) throw new RangeError('找不到這個練習任務。');
  return fields[id];
}

export function normalizeProfile(id, input = {}) {
  const definitions = getProfileFields(id);
  if (!input || typeof input !== 'object' || Array.isArray(input)
      || ![Object.prototype, null].includes(Object.getPrototypeOf(input))) {
    throw new TypeError('情境設定必須是欄位與數字組成的物件。');
  }
  const supported = new Map(definitions.map(item => [item.id, item]));
  for (const key of Reflect.ownKeys(input)) {
    if (!supported.has(key)) throw new RangeError(`不支援的情境欄位：${String(key)}。`);
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor.get || descriptor.set) throw new TypeError('情境欄位必須是直接提供的數字。');
  }
  const result = {};
  for (const item of definitions) {
    const value = Object.hasOwn(input, item.id) ? input[item.id] : item.defaultValue;
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${item.label}必須是有限數字。`);
    if (value < item.min || value > item.max) throw new RangeError(`${item.label}必須介於 ${item.min} 與 ${item.max} 之間。`);
    const steps = (value - item.min) / item.step;
    if (Math.abs(steps - Math.round(steps)) > 1e-7) throw new RangeError(`${item.label}請以 ${item.step} 為間隔輸入。`);
    result[item.id] = value === 0 ? 0 : value;
  }
  return Object.freeze(result);
}
