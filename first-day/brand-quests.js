// V16 街坊互助：角色與請託為虛構，任務只重組既有的查證知識。
// requiredDiscoveries 的事實與查核日均以 street-data.js 為準；
// 下列問答、準備清單和服務描述是學習引導，不新增稅率、核貸或法律結果。
export const BRAND = '宏國地政 × 易丞地政';

export const quests = [
  {
    id: 'buy',
    title: '幫小晴準備第一次看屋',
    tagline: '先問對問題，再把喜歡放進計畫。',
    client: '想找第一個家的小晴',
    intro: '小晴把房屋照片夾進筆記，卻發現自己只記了窗景和喜歡的顏色。「看屋時，我還該問什麼？」請幫她帶回產權與貸款的兩條線索，再回宏國地政 × 易丞地政相談所整理下一步。',
    requiredDiscoveries: ['property-registry', 'property-loan'],
    clues: [
      { discoveryId: 'property-registry', stopId: 'lane-aho', choiceId: 'ask-paper', hint: '到府城巷弄找阿荷，選「畫一間喜歡的屋子，問看屋要帶什麼資料」，把謄本要核對的部分記下來。' },
      { discoveryId: 'property-loan', stopId: 'hills-lin', choiceId: 'ask-loan', hint: '到山城日常找林叔，問「貸款廣告只看利率，還漏了什麼？」，帶回比較費用的線索。' },
    ],
    question: '兩條線索都找到了。小晴說：「照片很喜歡，廣告利率也好看，接下來呢？」你會幫她選哪一步？',
    answers: [
      { id: 'trust-photo', label: '先把喜歡的照片存好，文件和貸款費用之後再說。', correct: false, feedback: '照片能留下喜好，還不能回答權利內容與貸款費用。把剛才找到的兩條線索放在一起，再替小晴選一次。' },
      { id: 'prepare-checks', label: '先核對謄本標的與權利資料，再把利率、費用及比較條件列成問題。', correct: true, feedback: '你幫小晴把「喜歡」接到可查證的準備：產權資料要核對，貸款也要問清楚費用與假設。她收好清單，準備帶著問題展開下一次討論。這張徽章表示學習完成，不是核貸或購屋判定。' },
      { id: 'lowest-rate', label: '只挑廣告利率最低的方案，就先認定每月負擔一定合適。', correct: false, feedback: '一個利率數字不足以回答費用與負擔問題。先確認比較的條件，也不要省略房屋權利資料；這裡不會替小晴判定能貸多少或適不適合買。' },
    ],
    badge: '看屋準備小幫手',
    checklist: [
      '房地標的資料、可供核對的登記文件，以及文件日期與尚待確認的權利問題。',
      '預計購屋範圍、自備款與希望保留的生活預算；實際資料留到正式工具中確認。',
      '貸款方案的利率、相關費用、還款方式及仍不清楚的比較條件。',
    ],
    service: { title: '看屋查證與貸款提問', description: '宏國地政 × 易丞地政可陪你整理產權文件和交易問題；房貸規劃工具則供你另以自己的資料練習比較，實際條件仍須再確認。' },
    tool: 'loan',
    lineQuestion: '我完成了「第一次看屋」學習任務，想先了解看屋前的產權查證與貸款提問，需要準備哪些資料？目前只是詢問準備方向。',
  },
  {
    id: 'sell',
    title: '幫阿成看懂賣屋那筆錢',
    tagline: '成交數字之外，把每一欄問明白。',
    client: '正在整理搬家清單的阿成',
    intro: '阿成聽到鄰居的成交價，立刻在紙上寫下一個大數字，旁邊卻還有好幾個空格。「這就是賣完能留下的錢嗎？」請先帶回價格明細和費用包含範圍的線索，再到宏國地政 × 易丞地政相談所陪他重看清單。',
    requiredDiscoveries: ['property-price', 'property-budget'],
    clues: [
      { discoveryId: 'property-price', stopId: 'lane-abo', choiceId: 'compare-price', hint: '到府城巷弄找博伯，選「他想問隔壁成交價，先一起讀明細」，看看比較數字前要讀哪些條件。' },
      { discoveryId: 'property-budget', stopId: 'coast-xiu', choiceId: 'split-budget', hint: '到濱海慢旅找秀姨，幫她把「包含」與「另付」分兩欄，收下不漏問支出的做法。' },
    ],
    question: '阿成把鄰居的成交數字和自己的搬家清單放在一起。你會怎麼陪他整理「賣完留下多少」這個問題？',
    answers: [
      { id: 'separate-items', label: '先讀成交條件與備註，再逐項區分總價包含、另付及尚待確認的款項。', correct: true, feedback: '你把一個大數字拆成能查證的欄位。價格先看條件，支出再問約定與明細，接著才能把實際取得、出售、費用及清償資料帶進原工具。任務完成不代表已算出阿成的稅額或實拿。' },
      { id: 'copy-neighbor', label: '鄰居就在隔壁，直接把同一個成交價當成阿成一定拿得到的錢。', correct: false, feedback: '同一條街仍有不同交易條件，成交數字也不是這次個案的實拿保證。回想博伯的明細問題，再替阿成整理一次。' },
      { id: 'count-one-fee', label: '只從想賣的價格扣掉一筆服務費，其他欄位先略過。', correct: false, feedback: '只填一欄，仍會留下不少不知道是否包含的款項。秀姨的兩欄筆記可以幫忙：先分清包含與另付，再列出需要資料才能確認的項目。' },
    ],
    badge: '實拿提問整理員',
    checklist: [
      '取得原因、取得日期、原取得金額與相關文件，以及預計出售條件。',
      '買賣契約或報價明細，分清已包含與另付的費用，保留可核對的憑證。',
      '待確認的貸款清償及其他款項，與不清楚的稅費問題清單。',
    ],
    service: { title: '賣屋實拿與交易資料整理', description: '宏國地政 × 易丞地政可協助釐清交易與登記資料；賣屋實拿工具接續整理個別取得、出售和費用資料，遊戲不代入數字或直接判稅。' },
    tool: 'property',
    lineQuestion: '我完成了「賣屋那筆錢」學習任務，想釐清成交條件、費用包含範圍及賣屋實拿，需要先準備哪些文件與金額明細？目前尚未完成個案試算。',
  },
  {
    id: 'legacy',
    title: '幫美玲把家人的話整理好',
    tagline: '先把人、資料和問題分開寫清楚。',
    client: '想和家人好好討論的美玲',
    intro: '美玲的家庭筆記同時寫了「想讓誰住」、「目前登記」和「未來可能支出」，三件事擠在同一行。「我想先整理好，再和家人談。」請帶回權利文件與費用分類的線索，回宏國地政 × 易丞地政相談所替她排好討論順序。',
    requiredDiscoveries: ['property-registry', 'property-budget'],
    clues: [
      { discoveryId: 'property-registry', stopId: 'lane-aho', choiceId: 'ask-paper', hint: '到府城巷弄找阿荷，問看屋要帶什麼資料；把核對標的、文件日期與權利內容的方法借來整理家庭筆記。' },
      { discoveryId: 'property-budget', stopId: 'coast-xiu', choiceId: 'split-budget', hint: '到濱海慢旅找秀姨，幫她分清「包含」與「另付」。把這個列清單的方法帶回家庭討論，先不猜稅額。' },
    ],
    question: '美玲問：「家人的想法都有了，我們下一步先做什麼？」哪種整理方式能讓後續討論更清楚？',
    answers: [
      { id: 'assume-title', label: '家人提到由誰使用，就直接把他當成目前登記的所有權人。', correct: false, feedback: '家庭使用安排與現行登記資料是不同欄位，不能用一句口頭想法替代文件。先核對權利內容，並把希望怎麼安排另外記下。' },
      { id: 'guess-tax', label: '先猜一個最省稅的分配，家人需求和現有文件等決定後再補。', correct: false, feedback: '目前連資料與需求都還沒排清楚，不能據此選出方案或稅務結果。先整理誰有哪些想法、現有權利文件和待確認支出，再討論下一步。' },
      { id: 'separate-family', label: '把家人需求、目前權利文件與待確認支出分開列，再帶著清單討論。', correct: true, feedback: '你讓美玲的筆記變得可核對、可討論：家人的想法留在需求欄，現況看文件，不明款項留待查證。原傳承工具可再處理其涵蓋的繼承年度與資產資料；生前安排、居住與照顧問題仍要另外討論。' },
    ],
    badge: '家庭提問陪伴員',
    checklist: [
      '家人想討論的居住、照顧與財產安排，以及彼此仍有不同想法的地方。',
      '房地標的與現行權利文件、已知資產和債務資料；先標出缺漏，勿用猜測補齊。',
      '若討論的是繼承：相關年度與家庭成員資料；另外列出尚未確認的費用及生前安排問題。',
    ],
    service: { title: '家庭安排與傳承問題整理', description: '宏國地政 × 易丞地政可陪你整理家庭需求和財產資料。原傳承工具用於其涵蓋的遺產稅學習與試算，並不代替所有家庭安排的比較。' },
    tool: 'inheritance',
    lineQuestion: '我完成了「家人的話」學習任務，想先把家人需求、現有權利文件與待確認支出整理好，再討論傳承方向；請問應先準備哪些資料？目前尚未決定或委託任何方案。',
  },
];
