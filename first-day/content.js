// Original short-story copy. Sources support the facts, not the fictional story.
// checkedAt is the date this module's source was checked, not its publication date.
const checkedAt = '2026-10-27';
const source = (title, url) => ({ title, url, checkedAt });

export const priorities = [
  { id: 'commute', title: '把時間留給生活', kicker: '通勤與時間', description: '小安想下班後還來得及好好吃飯。購屋後每月另留 4,000 元交通與通勤安排預算。' },
  { id: 'space', title: '讓家人坐得下來', kicker: '家人與空間', description: '一張能一起吃飯的桌子很重要。購屋後每月另留 6,000 元家庭空間維護與設備預算。' },
  { id: 'buffer', title: '留一點從容', kicker: '持續存下緩衝金', description: '小安希望繳完房貸，還能慢慢存下底氣。購屋後每月另留 10,000 元作為儲蓄目標。' },
];

export const homes = [
  { id: 'price-900', title: '900 萬元', kicker: '先試較低總價', description: '這是一張虛構房屋卡。先看負擔，再列出生活機能與屋況要查的事；沒有對應待售物件。' },
  { id: 'price-1200', title: '1,200 萬元', kicker: '多一點選擇，也多一點支出', description: '小安把這個總價放進筆記。價格增加，自備款與每月房貸會一起變動。' },
  { id: 'price-1600', title: '1,600 萬元', kicker: '喜歡之前，先把帳看清楚', description: '先試算現金和生活餘額的距離，再決定要不要繼續找這個總價帶的家。' },
];

export const timings = [
  { id: 'now', title: '現在開始評估', description: '用小安現有的假設存款 350 萬元，看看準備到哪裡。' },
  { id: 'save-12', title: '先存 12 個月', description: '每月另存 3 萬元，假設增加 36 萬元。房價、利率與其他條件暫時不變。' },
  { id: 'save-24', title: '先存 24 個月', description: '每月另存 3 萬元，假設增加 72 萬元。這是準備期比較，不是房價預測。' },
];

export const shocks = [
  { id: 'baseline', title: '日子照原計畫走', kicker: '基準條件', description: '假設月收入 85,000 元，貸款年利率 2.5%。' },
  { id: 'income-down', title: '收入少了兩成', kicker: '收入壓力', description: '假設月收入降至 68,000 元，利率維持 2.5%；生活費與房貸不會跟著消失。' },
  { id: 'rate-up', title: '利率增加 1 個百分點', kicker: '利率壓力', description: '用 3.5% 重算整筆 30 年貸款月付；收入維持不變。每次只測一種壓力。' },
];

export const clues = [
  {
    id: 'rights', title: '權利登記', label: '先看謄本',
    question: '門打得開，就代表這個人有權把房子賣給小安嗎？',
    finding: '先核對賣方身分與處分權，再看最新土地、建物謄本上的所有權、權利範圍及他項權利。看到抵押權，要問清楚清償塗銷如何安排，不能只聽「之後會處理」。',
    source: source('宜蘭縣政府地政處｜購買不動產注意小細節交易更安全', 'https://land.e-land.gov.tw/News_Content.aspx?n=18681&s=355479'),
  },
  {
    id: 'condition', title: '使用與屋況', label: '把現場對回文件',
    question: '照片很漂亮，還有哪些事值得小安親自確認？',
    finding: '先列出使用範圍、增改建、停車位與漏水等問題，把建物現況說明、相關文件和現場一起看。裝潢看起來新，不能代替對使用與屋況的查證。這張卡是檢查提示，沒有替任何房屋判定合法或安全。',
    source: source('新北市政府法制局｜不動產買賣契約及廣告 消費者保障權益須知', 'https://www.ntpc.gov.tw/ch/home.jsp?dataserno=201604120001&id=28&mcustomize=news_view.jsp&parentpath=0%2C6%2C27'),
  },
  {
    id: 'bank', title: '銀行條件', label: '試算之外再問一步',
    question: '畫面算出月付金，就表示銀行一定會照這個條件貸嗎？',
    finding: '銀行還會看還款能力、負債與信用，以及房屋地點、屋況和鑑價。本故事用貸款 75%、30 年與指定利率做教學試算；實際成數、額度及利率要由承辦銀行依資料審查。',
    source: source('中國信託銀行｜房貸申辦流程常見 QA', 'https://www.ctbcbank.com/content/dam/minisite/long/loan/mortgage/qa.html'),
  },
];

export const verification = {
  question: '三張線索看完了。小安現在最適合做哪件事？',
  options: [
    { id: 'ready-to-sign', label: '月付看起來能負擔，就直接簽約', feedback: '月付只是其中一條線索。產權、屋況與銀行條件還要用真實文件確認，先把問題列下來。' },
    { id: 'collect-evidence', label: '帶著產權、屋況與銀行問題，逐項查證', feedback: '答對了。楊代書在這裡帶小安練習整理問題；個案仍要看文件與實際條件，並未完成審定。' },
    { id: 'photo-is-enough', label: '照片和口頭保證都有了，就不用查文件', feedback: '照片能留下印象，卻不能說明完整權利與使用情形。把現場和文件放在一起，問題才會清楚。' },
  ],
  correctId: 'collect-evidence',
};

export const places = [
  {
    id: 'culture-anping-fort', title: '安平古堡', district: '安平區', subtitle: '沿著城牆，看見城市不同的時間',
    story: '小安沿著老城牆慢慢走，發現同一個地方也有不同年代的模樣。安平古堡與荷蘭時期的熱蘭遮堡有關，之後又經歷改建。前方外城南城垣的磚牆留下早期遺跡，今日園區並非所有建築都來自同一時期。',
    observation: '想像站在老磚牆旁：先看解說上的年代，再看看牆面與周圍建築有什麼不同。',
    quiz: {
      question: '小安要怎麼讀懂今天的安平古堡？',
      options: [
        { id: 'all-original', label: '把整個園區都當成荷蘭時期原物', feedback: '園區曾有改建，不能把不同年代的建築放成同一張時間表。' },
        { id: 'different-layers', label: '對照解說，辨認不同年代的痕跡', feedback: '答對了。先分清年代，城牆和後來的建築才會各自說出故事。' },
        { id: 'tower-only', label: '只看瞭望台，不需要其他線索', feedback: '瞭望台是景觀的一部分，老城垣和解說也能幫你理解這個地方。' },
      ],
      correctId: 'different-layers',
    },
    source: source('臺南市政府文化局｜安平古堡', 'https://historic.tainan.gov.tw/index.php?id=58&lang=cht&option=module&task=pageinfo'),
    cityUrl: '../?start=culture&place=culture-anping-fort',
  },
  {
    id: 'culture-salt', title: '井仔腳瓦盤鹽田', district: '北門區', subtitle: '一粒鹽，也有地方的生活記憶',
    story: '小安看著水面和細碎瓦片，才想到餐桌上的鹽，也曾連著一整天的勞動。井仔腳保存瓦盤鹽田地景；鹽業結束後，透過復育延續曬鹽文化。這次只在故事裡認識它，實地開放與體驗要另查官方最新公告。',
    observation: '先找瓦片鋪成的田面，再看水與鹽堆的關係。照片裡除了夕陽，還有哪些工作留下的痕跡？',
    quiz: {
      question: '井仔腳的瓦盤鹽田，最直接連著哪一種地方勞動？',
      options: [
        { id: 'logging', label: '山林伐木', feedback: '這裡是濱海鹽田。再看看瓦片、水面與鹽堆之間的關係。' },
        { id: 'salt-making', label: '曬鹽與收鹽', feedback: '答對了。好看的地景背後，也有鹽業與居民的工作記憶。' },
        { id: 'coal-mining', label: '採煤與運煤', feedback: '瓦盤鹽田留下的是鹽業線索，和煤礦開採不同。' },
      ],
      correctId: 'salt-making',
    },
    source: source('臺南市政府觀光旅遊局｜井仔腳瓦盤鹽田', 'https://www.twtainan.net/zh-tw/attractions/detail/587/'),
    cityUrl: '../?start=culture&place=culture-salt',
  },
  {
    id: 'culture-waterworks', title: '山上花園水道博物館', district: '山上區', subtitle: '打開水龍頭以前，水走過哪裡？',
    story: '小安想起早上刷牙時，從沒問過水怎麼來。山上花園水道博物館保留水道建築與設備，水泵、濾水結構和快濾筒讓日常用水的工程變得看得見。博物館區與淨水池區是不同場域，參觀前可以先查官方介紹。',
    observation: '沿著一段管線看過去，找一找水泵與濾水設備。試著用一句話說出它和每天的生活有什麼關係。',
    quiz: {
      question: '這些水泵、快濾筒與管線，主要幫小安理解什麼？',
      options: [
        { id: 'water-system', label: '城市濾水與供水的工程', feedback: '答對了。把設備接回日常生活，就能看見一口水背後的工作。' },
        { id: 'castle-defense', label: '海港城堡的防禦方法', feedback: '這裡的主角是水道設備，先看看水如何經過濾水結構與管線。' },
        { id: 'salt-fields', label: '瓦盤鹽田的收鹽工具', feedback: '曬鹽是另一種地方產業；這裡保存的是水道與供水工程的線索。' },
      ],
      correctId: 'water-system',
    },
    source: source('臺南市政府觀光旅遊局｜台南山上花園水道博物館', 'https://www.twtainan.net/zh-tw/attractions/detail/5816/'),
    cityUrl: '../?start=culture&place=culture-waterworks',
  },
];

export const lesson = {
  question: '如果未來的條件改變，小安要把今天學到的哪件事帶回家？',
  options: [
    { id: 'monthly-only', label: '只要月付金低，其他都不用看', feedback: '還要一起看交屋現金、保留金與每月生活餘額，較低月付不會自動補足自備款。' },
    { id: 'guaranteed-future', label: '今天試算沒缺口，未來就一定沒問題', feedback: '收入、利率和生活需求都可能改變；這裡的數字是固定假設下的練習。' },
    { id: 'keep-room', label: '一起比較現金與每月餘額，留出調整空間', feedback: '答對了。小安帶走的不是購屋許可，而是能繼續詢問、比較和準備的方法。' },
  ],
  correctId: 'keep-room',
};
