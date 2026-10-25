// Navigation only. Scenario assumptions are never passed to the calculators.
export const companionTools = {
  loan: { name: '房貸規劃', title: '每月負擔，先算清楚', url: 'https://yangceo-taiwan.github.io/loan-forecast/', description: '整理收入與負債，接著比較貸款額度、月付金與新青安條件。', tag: '首購・換屋', prepare: ['月收入與其他債務月付', '購屋預算、自備款與貸款年限'], access: '沿用 LINE 好友驗證' },
  property: { name: '賣屋實拿', title: '售價之外，還剩多少？', url: 'https://homegoestate.github.io/test-Property-tax/', description: '用實際取得、出售與成本資料，拆開稅費、清償貸款與賣屋實拿。', tag: '賣屋・換屋', prepare: ['取得原因、日期與預計出售日', '買賣金額、成本及貸款清償資料'], access: '沿用 LINE 好友驗證' },
  inheritance: { name: '傳承稅務', title: '把家人的安排，放在一起看', url: 'https://yangceo-taiwan.github.io/inheritance-tax-issues/', description: '從繼承年度、家庭成員與資產，整理遺產稅試算。生前贈與與照顧安排，仍需另外比較。', tag: '傳承一家', prepare: ['繼承年度與家庭成員', '遺產、債務及相關扣除資料'], access: '依工具內建年度試算' }
};
export const missionToolRoutes = {
  'first-home': { primary: 'loan', action: '用自己的條件，試算房貸', intro: '喜歡的房子，放進自己的每月生活後，還從容嗎？', service: 'services.html#loan', keyword: '新青安', video: 'loan' },
  'move-home': { primary: 'loan', secondary: 'property', action: '先看新房貸的每月負擔', intro: '換屋要接好兩筆帳：新屋貸款怎麼付、舊屋出售能留下多少。', secondaryAction: '再算舊屋出售後的實拿', service: 'services.html#loan', keyword: '貸款規定', video: 'loan' },
  seller: { primary: 'property', secondary: 'loan', action: '用實際資料，試算賣屋實拿', intro: '遊戲裡的稅務預留只是假設。下一步，把真正的成本與貸款清償資料整理進來。', secondaryAction: '賣後還要買？接續評估房貸', service: 'services.html#tax', keyword: '官方服務', video: 'sellerTax' },
  'legacy-family': { primary: 'inheritance', action: '盤點家人與資產，試算遺產稅', intro: '先看身後繼承的稅務，再帶著照顧、居住與生前安排的問題一起討論。', service: 'services.html#inheritance', keyword: '官方服務', video: 'inheritance' }
};
