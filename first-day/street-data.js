// V15：角色、對話與街區位置皆為原創虛構；文化與查證知識另列官方來源。
// 這是三張拼合的學習場景，不是實際步行距離、行政分區或景點開放承諾。
// checkedAt 只表示下列摘要在當日重新對照來源；不改寫既有 culture-data 的查核日期。
const checkedAt = '2026-10-27';
const source = (title, url) => ({ title, url, checkedAt });

export const districts = [
  { id: 'lane', title: '府城巷弄', subtitle: '借一支筆，換一段老街故事', description: '紅磚牆、老店與城門靈感拼成的小街區。和居民交換觀察，找出那位抱著速寫本的鄰居。', spawn: { x: 500, y: 540 } },
  { id: 'coast', title: '濱海慢旅', subtitle: '風把問題吹到水邊', description: '把鹽田、洋行與海邊日常放進同一張想像地圖。看風景，也學會把環境問題問得更清楚。', spawn: { x: 500, y: 540 } },
  { id: 'hills', title: '山城日常', subtitle: '讓好奇心走在答案前面', description: '街屋、水道與化石故事交會的綠色場景。跟著居民整理線索，別急著把印象當成結論。', spawn: { x: 500, y: 540 } },
];

export const discoveries = [
  { id: 'culture-south-gate', title: '大南門的轉彎', topic: 'culture', summary: '大南門外有半月形甕城，附近碑林保留文字記錄。從入口轉折與石碑，可以讀出城防和城市生活的不同線索。', source: source('臺南市政府觀光旅遊局｜臺灣府城大南門', 'https://www.twtainan.net/zh-tw/attractions/detail/856/') },
  { id: 'culture-confucius', title: '孔廟與泮宮石坊', topic: 'culture', summary: '臺南孔子廟連著地方教育歷史；泮宮石坊以石材呈現仿木構細節，也曾因道路拓寬而移動。', source: source('臺南市政府觀光旅遊局｜臺南孔子廟', 'https://twtainan.net/zh-tw/attractions/detail/800/') },
  { id: 'culture-shennong', title: '神農街的港口線索', topic: 'culture', summary: '神農街舊稱北勢街，是清代五條港商業活動的重要街道。看街屋，也可以想想貨物與人曾如何從河港進出城市。', source: source('臺南市政府觀光旅遊局｜五條港舊城漫遊：神農街', 'https://www.twtainan.net/zh-tw/application/activity/22/') },
  { id: 'culture-salt', title: '井仔腳的瓦盤與鹽', topic: 'culture', summary: '井仔腳瓦盤鹽田以鋪瓦的鹽田留下人工曬鹽的產業記憶。遊戲觀察不代表現場開放；出發前仍需查閱場域最新公告。', source: source('臺南市政府觀光旅遊局｜井仔腳瓦盤鹽田', 'https://www.twtainan.net/zh-tw/Attractions/Detail/587/') },
  { id: 'culture-tree-house', title: '樹屋曾是倉庫', topic: 'culture', summary: '安平樹屋曾是德記洋行倉庫，後來也與鹽業使用相連。榕樹與建築交織的景觀背後，還有港口貿易與空間再利用的故事。', source: source('臺南市政府文化局｜安平樹屋暨原德記洋行', 'https://historic.tainan.gov.tw/index.php?id=1061&index=4&lang=cht&option=module&task=pageinfo') },
  { id: 'culture-fan-salt', title: '扇形鹽田的工作動線', topic: 'culture', summary: '青鯤鯓扇形鹽田以鹽工宿舍為核心向外展開，水溝與道路形成扇骨，結晶池靠近宿舍，反映過去工作動線的安排。', source: source('雲嘉南濱海國家風景區管理處｜青鯤鯓扇形鹽田', 'https://www.swcoast-nsa.gov.tw/zh-tw/attraction/details/87') },
  { id: 'culture-xinhua', title: '新化老街的立面', topic: 'culture', summary: '新化老街保留仿巴洛克式街屋立面與老商號，能從花紋、門面和商業使用，閱讀地方曾經繁盛的街市生活。', source: source('臺南市政府觀光旅遊局｜新化老街', 'https://www.twtainan.net/zh-tw/attractions/detail/559') },
  { id: 'culture-waterworks', title: '水道裡的日常工程', topic: 'culture', summary: '山上花園水道博物館以水泵、濾水設備與文獻呈現供水歷史。看懂設備如何合作，能把漂亮建築連回日常用水。', source: source('臺南市政府觀光旅遊局｜山上花園水道博物館', 'https://www.twtainan.net/zh-tw/attractions/detail/5816/') },
  { id: 'culture-fossil', title: '左鎮的化石與提問', topic: 'culture', summary: '左鎮化石園區串起菜寮溪流域化石、採集研究與自然史教育。化石的來源與地層脈絡，和化石本身一樣值得追問。', source: source('臺南左鎮化石園區｜園區簡介', 'https://fossil.tnc.gov.tw/content/index.php?m2=96') },
  { id: 'property-registry', title: '謄本分部一起看', topic: 'property', summary: '登記謄本有標示、所有權及他項權利等資料。查閱時先確認標的、申請範圍、列印時間及頁面完整，再核對相關權利；老照片與口述不能代替現行登記。', source: source('新北市政府地政局｜謄本介紹', 'https://www.land.ntpc.gov.tw/cp.aspx?Create=1&n=12855') },
  { id: 'property-price', title: '實價先讀明細', topic: 'property', summary: '實價查詢不是所有成交案件的全集，車位、備註和交易條件也會影響閱讀。比較前先核對交易時間與標的條件，不把一筆數字直接當作別棟房屋的價格。', source: source('內政部｜不動產交易實價查詢常見問題', 'https://lvr.land.moi.gov.tw/R11/jsp/qa.jsp') },
  { id: 'property-use', title: '用途要查兩條線', topic: 'property', summary: '看房需分別查土地使用分區及建物核准用途，並對照契約、謄本與相關執照資料。漂亮格局或廣告稱呼，不能直接確認某種使用是否合法。', source: source('臺中市政府｜購屋前確認土地使用分區與建物主要用途', 'https://www.taichung.gov.tw/8868/8872/9962/3002509') },
  { id: 'property-loan', title: '利率之外還有費用', topic: 'property', summary: '比較貸款時，也要看總費用年百分率與它涵蓋的費用。總費用年百分率不等於借款利率，也不是所有購屋支出的總表；遊戲不據此判定核貸或購屋能力。', source: source('行政院消費者保護會｜總費用年百分率說明', 'https://cpc.ey.gov.tw/Page/4432D6D5FA6677B9/51d0fc32-0842-4849-855c-f72a5eef31b2') },
  { id: 'property-budget', title: '總價包含了什麼', topic: 'property', summary: '裝潢、設備、稅費與服務費可能依約另外計算，也可能約定包含於交易總價。實務整理時逐項問清楚包含與另付，避免把售價當作全部支出。', source: source('基隆市地政事務所｜交易總價包含其他價格資訊之申報', 'https://www.kl-land.klcg.gov.tw/tw/land/406-306866.html') },
  { id: 'property-hazard', title: '潛勢圖是查證線索', topic: 'property', summary: '災害潛勢圖有模擬條件與資料限制。有標示不代表每次都發生，未標示也不能保證不發生；可搭配現地觀察與主管機關資料追問，不能據此保證個別房屋安全。', source: source('國家災害防救科技中心｜災害潛勢圖資說明手冊', 'https://dmap.ncdr.nat.gov.tw/media/gmkhb2bu/112%E7%81%BD%E5%AE%B3%E6%BD%9B%E5%8B%A2%E5%9C%96%E8%B3%87%E8%AA%AA%E6%98%8E%E6%89%8B%E5%86%8A.pdf') },
];

export const stops = [
  { id: 'lane-gate', district: 'lane', kind: 'place', name: '城門小廣場', role: '觀察大南門的轉彎', x: 130, y: 220 },
  { id: 'lane-school', district: 'lane', kind: 'place', name: '紅牆學堂', role: '找一處石坊細節', x: 360, y: 220 },
  { id: 'lane-street', district: 'lane', kind: 'place', name: '港街轉角', role: '從街屋讀五條港', x: 620, y: 220 },
  { id: 'lane-aho', district: 'lane', kind: 'resident', name: '阿荷', role: '文具店老闆', portrait: 'guide', x: 130, y: 440 },
  { id: 'lane-abo', district: 'lane', kind: 'resident', name: '博伯', role: '整理舊照片的鄰居', portrait: 'elder', x: 360, y: 440 },
  { id: 'lane-momo', district: 'lane', kind: 'resident', name: '沫沫', role: '借走速寫本的街坊', portrait: 'child', x: 870, y: 220, requires: 'lane-sketch' },
  { id: 'lane-office', district: 'lane', kind: 'office', name: '楊代書相談所', role: '把問題帶進下一段學習', portrait: 'yang', x: 870, y: 440 },
  { id: 'coast-salt', district: 'coast', kind: 'place', name: '瓦盤鹽田角', role: '把夕陽與勞動一起看', x: 130, y: 220 },
  { id: 'coast-tree', district: 'coast', kind: 'place', name: '樹影倉庫', role: '先找樹，再找貨物', x: 360, y: 220 },
  { id: 'coast-fan', district: 'coast', kind: 'place', name: '扇形水路', role: '跟著工作動線想一想', x: 620, y: 220 },
  { id: 'coast-ayu', district: 'coast', kind: 'resident', name: '阿育', role: '收網後來散步的居民', portrait: 'worker', x: 130, y: 440 },
  { id: 'coast-xiu', district: 'coast', kind: 'resident', name: '秀姨', role: '準備搬家的早餐店主', portrait: 'elder', x: 360, y: 440 },
  { id: 'coast-an', district: 'coast', kind: 'resident', name: '岸岸', role: '畫水路筆記的志工', portrait: 'guide', x: 870, y: 220, requires: 'coast-water' },
  { id: 'hills-street', district: 'hills', kind: 'place', name: '山城街屋', role: '抬頭看立面、低頭看生活', x: 130, y: 220 },
  { id: 'hills-water', district: 'hills', kind: 'place', name: '水道展示庭', role: '一杯水背後的合作', x: 360, y: 220 },
  { id: 'hills-fossil', district: 'hills', kind: 'place', name: '化石故事窗', role: '把問題留給證據', x: 620, y: 220 },
  { id: 'hills-qing', district: 'hills', kind: 'resident', name: '若青', role: '構思小店的返鄉青年', portrait: 'guide', x: 130, y: 440 },
  { id: 'hills-lin', district: 'hills', kind: 'resident', name: '林叔', role: '愛修東西的水電師傅', portrait: 'worker', x: 360, y: 440 },
  { id: 'hills-rui', district: 'hills', kind: 'resident', name: '小睿', role: '裝滿問號的自然筆記員', portrait: 'child', x: 870, y: 220, requires: 'hills-curious' },
];

export const stories = {
  'lane-aho': {
    intro: ['阿荷把一支鉛筆推到櫃檯邊：「借你。來這條街的人常常只拍招牌，我想知道，你會先畫什麼？」', '門外有人留下半張街屋速寫，紙角寫著「找我聊聊，再把另一半畫完」。'],
    choices: [
      { id: 'ask-sketch', label: '先問：是誰留下這張速寫？', response: ['「沫沫啦，她說街屋要連人一起畫。」阿荷朝廣場另一側招手。', '沫沫抱著本子現身。你發現，神農街的故事可以從港口與商業開始，也能接著問今天住在街上的人。'], discoveryIds: ['culture-shennong'], flag: 'lane-sketch', followUp: '沫沫已到廣場等你，地圖多了一位可以聊天的街坊。' },
      { id: 'ask-paper', label: '畫一間喜歡的屋子，問看屋要帶什麼資料', response: ['阿荷把紙翻面：「先留幾格：這是哪一筆地、哪一棟房、文件是哪天的。」', '你把待查欄位寫好。謄本要連標示、所有權與他項權利一起核對，不能憑漂亮門面猜產權。'], discoveryIds: ['property-registry'], followUp: '你的筆記變成查證清單；下次也可以回來問速寫的主人。' },
    ], sourceIds: ['culture-shennong', 'property-registry'],
  },
  'lane-abo': {
    intro: ['博伯正把老照片排成一列：「奇怪，我記得這個轉角比較寬。是照片騙我，還是我的記憶偷懶？」', '他笑著留出一張椅子，等你選一個話題。'],
    choices: [
      { id: 'compare-corner', label: '陪他找城門與道路的變化', response: ['你把照片裡的入口轉折圈起來，博伯也開始比手畫腳。', '大南門的甕城能提醒人留意行走方向；看城市變化時，舊照片、現地與官方說明可以互相對照。'], discoveryIds: ['culture-south-gate'] },
      { id: 'compare-price', label: '他想問隔壁成交價，先一起讀明細', response: ['「隔壁那筆數字漂亮，拿來套我家？」博伯問。你先把問題拆成交易時間、屋況條件、車位與備註。', '他點頭：「原來不是抄個數字，就算看懂。」你們約好先查資料，今天不替任何房屋定價。'], discoveryIds: ['property-price'] },
    ], sourceIds: ['culture-south-gate', 'property-price'],
  },
  'lane-momo': {
    intro: ['沫沫把半張速寫遞給你：「阿荷找到幫手了！剩下的空白，要畫一個入口，還是寫一句問屋子的話？」'],
    choices: [
      { id: 'draw-school', label: '畫石坊的仿木構細節', response: ['你畫了一筆橫枋，沫沫補上小小的裝飾：「原來石頭也可以學木頭的樣子。」', '你們在旁註記：孔廟的教育歷史與石坊的位置變化，要和造型一起閱讀。這半張圖終於有故事了。'], discoveryIds: ['culture-confucius'] },
      { id: 'write-use', label: '替「想把老屋開成小店」寫查證問題', response: ['沫沫原本寫「有桌椅就能開店嗎」，你們一起改成「土地分區和建物用途各是什麼？」', '她把問號畫得很大：「先查清楚，設計圖才不會白忙。」你收下用途查證的方法，沒有替這間想像老屋判定可不可以營業。'], discoveryIds: ['property-use'] },
    ], sourceIds: ['culture-confucius', 'property-use'],
  },
  'lane-gate': {
    intro: ['城門小廣場擺著一張大南門示意圖。小安想留下的不是到此一遊，而是一個自己看出的線索。'],
    choices: [
      { id: 'trace-turn', label: '用手指描一遍入口轉折', response: ['你的手指在半月形空間裡轉了一個彎。甕城讓入口不是一條直線；空間本身也在說城防的故事。'], discoveryIds: ['culture-south-gate'] },
      { id: 'read-stone', label: '改看旁邊的碑林線索', response: ['你選擇讀文字留下的記錄。碑林讓城門旁的散步，多了一條理解不同時期城市生活的路。'], discoveryIds: ['culture-south-gate'] },
    ], sourceIds: ['culture-south-gate'],
  },
  'lane-school': {
    intro: ['紅牆學堂的觀察板畫了泮宮石坊。小安把鉛筆放到嘴邊想了想，又趕快放下：「這支是借的！」'],
    choices: [
      { id: 'look-material', label: '找石材模仿木構的地方', response: ['你看橫枋與雀替等細節，留下「材料與形式可以不同」的觀察。泮宮石坊把建築工藝與學校的身分連在一起。'], discoveryIds: ['culture-confucius'] },
      { id: 'look-road', label: '看石坊與道路的相對位置', response: ['你把視線拉遠。石坊曾隨道路拓寬而移動，文化場域也會和城市交通互相影響。'], discoveryIds: ['culture-confucius'] },
    ], sourceIds: ['culture-confucius'],
  },
  'lane-street': {
    intro: ['港街轉角有一張從河港到街屋的想像插圖。你可以從人走的路開始，也可以從店面開始。'],
    choices: [
      { id: 'follow-goods', label: '想像貨物如何從港口進城', response: ['你在紙上連起港口、街道與店門。神農街舊稱北勢街，曾是五條港商業往來的重要街道。'], discoveryIds: ['culture-shennong'] },
      { id: 'look-shop', label: '比較兩間街屋今天的用途', response: ['你把「歷史用途」和「眼前用途」分開寫。街區會改變；真的要買屋或開店，還要另外核對土地分區及建物核准用途。'], discoveryIds: ['culture-shennong', 'property-use'] },
    ], sourceIds: ['culture-shennong', 'property-use'],
  },
  'lane-office': {
    intro: ['楊代書把空白筆記攤開：「街上帶回來的問題，比急著做決定更有用。接下來，你想練哪一段？」', '這裡接續學習情境與整理工具；街區收藏不會自動變成你的貸款、稅務或買房判定。'],
    choices: [
      { id: 'continue-day', label: '進入小安第一天的五章故事', response: ['「好，陪小安把收入、生活與選擇慢慢走完。故事裡的情境資料，和你剛才的文化收藏分開保存。」'], discoveryIds: [], action: 'lesson' },
      { id: 'loan-questions', label: '整理貸款要問的問題', response: ['「先把利率、相關費用、還款方式與試算假設列清楚，再進一步確認適用條件。」'], discoveryIds: ['property-loan'], action: 'loan' },
      { id: 'property-questions', label: '整理買賣與產權問題', response: ['「把標的和文件帶齊，再分開核對權利、用途、價格明細與支出。」'], discoveryIds: ['property-registry'], action: 'property' },
      { id: 'inheritance-questions', label: '整理家人傳承的提問', response: ['「先分清楚想傳給誰、有哪些財產及目前權利資料，再把未確認的事項寫下來。這段只幫你整理提問。」'], discoveryIds: [], action: 'inheritance' },
    ], sourceIds: ['property-loan', 'property-registry'],
  },
  'coast-ayu': {
    intro: ['阿育拎著收好的網坐下：「今天先不談魚。你看這張扇形鹽田圖，覺得哪一條線最有意思？」'],
    choices: [
      { id: 'follow-water', label: '沿著水溝與道路找工作動線', response: ['阿育指向圖的中心：「鹽工宿舍在這裡，結晶池靠近它。原來好看的形狀，也跟工作安排有關。」', '他把你的筆記交給正在附近畫水路的岸岸，請她帶你再想一步。'], discoveryIds: ['culture-fan-salt'], flag: 'coast-water', followUp: '岸岸帶著水路筆記來了，地圖多了一段環境對話。' },
      { id: 'ask-weather', label: '先問：看一張圖能知道房子會不會淹水嗎？', response: ['阿育搖頭：「圖有它的條件，天氣也不會照一張紙演。」', '你記下要看模擬條件、資料範圍和現地情況。潛勢圖是查證的起點，不能單靠有色或無色替房屋下結論。'], discoveryIds: ['property-hazard'] },
    ], sourceIds: ['culture-fan-salt', 'property-hazard'],
  },
  'coast-xiu': {
    intro: ['秀姨拿著搬家清單，最上面寫「新店窗邊要放一盆植物」。「我是不是漏寫了更重要的？」她把筆遞過來。'],
    choices: [
      { id: 'split-budget', label: '替她把「包含」與「另付」分兩欄', response: ['你們把裝潢、設備、稅費、服務費逐項列出，再留一欄寫契約怎麼約定。', '秀姨笑了：「植物可以晚點買，漏算的費用比較會嚇到我。」今天只完成支出提問，沒有替她估總額。'], discoveryIds: ['property-budget'] },
      { id: 'take-break', label: '先休息，聊一聊鹽田裡的瓦片', response: ['秀姨拿餅乾盒當示意圖，你拿紙片排出田格。你們聊到井仔腳用瓦盤保留人工曬鹽的產業記憶。', '她把清單收好：「下次真的去之前，我先看場域公告。今天在故事裡想像就很舒服。」'], discoveryIds: ['culture-salt'] },
    ], sourceIds: ['property-budget', 'culture-salt'],
  },
  'coast-an': {
    intro: ['岸岸翻開水路筆記：「阿育說你會追著線問問題。我這裡有兩種線，一種在地圖上，一種藏在老建築裡。」'],
    choices: [
      { id: 'map-limits', label: '先看地圖旁邊的小字', response: ['你們沒有先找顏色最深的地方，而是讀圖資條件與限制。', '岸岸補上一句：「沒有標示，也不能當作安全保證。」你的提問從「會不會」變成「這張圖能說到哪裡」。'], discoveryIds: ['property-hazard'] },
      { id: 'warehouse-line', label: '追老倉庫曾經裝過什麼', response: ['岸岸在樹屋圖旁畫出貨物箱，提醒你榕樹之外還有建築的使用史。', '安平樹屋曾作洋行倉庫，也經歷鹽業使用；空間留下的不只外觀，還有人的工作。'], discoveryIds: ['culture-tree-house'] },
    ], sourceIds: ['property-hazard', 'culture-tree-house'],
  },
  'coast-salt': {
    intro: ['瓦盤鹽田角擺著一幅井仔腳示意圖，夕陽色的紙面旁留了一格「你先看到什麼」。'],
    choices: [
      { id: 'look-tiles', label: '看瓦片與田格的排列', response: ['你把一小塊瓦片畫在筆記角落，記住井仔腳的瓦盤特色。這片景觀也承接人工曬鹽的工作記憶。'], discoveryIds: ['culture-salt'] },
      { id: 'look-work', label: '替風景補上一個工作的人', response: ['你替圖中留了推鹽、挑鹽的想像位置。看產業地景時，把勞動放回畫面，風景就多了一層故事。'], discoveryIds: ['culture-salt'] },
    ], sourceIds: ['culture-salt'],
  },
  'coast-tree': {
    intro: ['樹影倉庫用枝葉和窗洞提示安平樹屋的故事。你可以讓視線停在根，也可以穿過窗看用途。'],
    choices: [
      { id: 'look-roots', label: '沿著樹根看建築的輪廓', response: ['你畫下根與牆互相纏繞的樣子，再註記：看自然景觀時，也別漏掉原本的倉庫。'], discoveryIds: ['culture-tree-house'] },
      { id: 'look-cargo', label: '把空倉庫想像成貨物往來的地方', response: ['你在紙上放進箱子與搬運的人，讓樹屋接回洋行貿易和後來的鹽業使用。建築的不同年代，值得分開閱讀。'], discoveryIds: ['culture-tree-house'] },
    ], sourceIds: ['culture-tree-house'],
  },
  'coast-fan': {
    intro: ['扇形水路的圖板展開像一把紙扇。旁邊的筆記問：「形狀好看，還能解釋什麼？」'],
    choices: [
      { id: 'find-center', label: '找出扇形展開的中心', response: ['你先圈出鹽工宿舍。鹽田以它為核心向外展開，人的生活位置也是理解地景的線索。'], discoveryIds: ['culture-fan-salt'] },
      { id: 'find-routes', label: '分辨道路、水溝與結晶池', response: ['你用三種線條畫出工作安排。扇骨不只是圖案，還包括水溝和道路；結晶池靠近宿舍，與就近作業有關。'], discoveryIds: ['culture-fan-salt'] },
    ], sourceIds: ['culture-fan-salt'],
  },
  'hills-qing': {
    intro: ['若青抱著小店草圖：「我把窗畫很大，桌子也排好了，結果第一個問題還沒寫。」她指著一個空白問號。'],
    choices: [
      { id: 'check-use', label: '先寫土地分區與建物用途怎麼查', response: ['你把草圖旁的問號拆成兩個欄位，提醒她分別確認土地分區、建物核准用途與文件內容。', '若青把橡皮擦收起來：「先把能不能做的條件弄清楚，再畫細節。」'], discoveryIds: ['property-use'] },
      { id: 'ask-street', label: '先聊老街的生活，讓草圖長出問題', response: ['你們抬頭看新化街屋的仿巴洛克式立面，再聊店門每天怎麼開、貨物怎麼進。', '若青發現只畫外觀還不夠，轉頭叫來愛問問題的小睿，請他帶上自然筆記。'], discoveryIds: ['culture-xinhua'], flag: 'hills-curious', followUp: '小睿來到展示窗旁，等你一起選下一個問題。' },
    ], sourceIds: ['property-use', 'culture-xinhua'],
  },
  'hills-lin': {
    intro: ['林叔剛修好自己的水壺蓋：「別看東西小，少一個零件就不對。」他指著水道展示圖，又指指一張貸款廣告。'],
    choices: [
      { id: 'ask-waterworks', label: '問水道設備怎麼分工', response: ['你們沿著展示圖找水泵與濾水設備。林叔說：「看它們怎麼一起工作，比只看一個漂亮大筒子有趣。」', '你把山上花園水道博物館的供水故事記下，讓一杯水連回背後的工程。'], discoveryIds: ['culture-waterworks'] },
      { id: 'ask-loan', label: '貸款廣告只看利率，還漏了什麼？', response: ['你們把「利率」旁邊補上總費用年百分率，並註記要問它算進哪些費用。', '林叔把廣告折好：「先弄懂比較的是什麼，才不會看錯。」這一步學比較問題，沒有推算他的核貸結果。'], discoveryIds: ['property-loan'] },
    ], sourceIds: ['culture-waterworks', 'property-loan'],
  },
  'hills-rui': {
    intro: ['小睿的筆記每頁都有問號：「我的收藏不是石頭，是問題。你今天想幫我完成哪一頁？」'],
    choices: [
      { id: 'fossil-context', label: '問化石從哪裡來、怎麼被研究', response: ['你把化石旁邊補上地層、溪流與採集者。左鎮的故事也連著菜寮溪流域和長期研究。', '小睿在頁底寫下：「知道來處，才不只知道名字。」'], discoveryIds: ['culture-fossil'] },
      { id: 'price-context', label: '問房價數字從哪一筆交易來', response: ['你借用同一個提問方法：日期、標的、車位、備註和條件是什麼？', '小睿把「最高那筆」劃掉，改成「條件先對齊」。資料可以提供線索，不能只挑順眼的答案。'], discoveryIds: ['property-price'] },
    ], sourceIds: ['culture-fossil', 'property-price'],
  },
  'hills-street': {
    intro: ['山城街屋的屋頂排成一列，新化老街的立面圖藏了幾處裝飾。'],
    choices: [
      { id: 'look-up', label: '抬頭畫下立面花紋', response: ['你選一處裝飾畫下來，辨認仿巴洛克式立面。細節讓街屋不只是一排背景。'], discoveryIds: ['culture-xinhua'] },
      { id: 'look-door', label: '把視線移回店門和商號', response: ['你在圖上留了買東西與搬貨的位置。新化老街也有商業與生活的記憶，外觀和使用一起看，故事才完整。'], discoveryIds: ['culture-xinhua'] },
    ], sourceIds: ['culture-xinhua'],
  },
  'hills-water': {
    intro: ['水道展示庭擺著水泵與濾水設備的圖解，小安想知道每天的水怎麼來。'],
    choices: [
      { id: 'follow-pipes', label: '沿管線想像設備合作', response: ['你用箭頭連起設備，提醒自己要讀它們的功能關係。水道博物館讓供水工程走進日常視線。'], discoveryIds: ['culture-waterworks'] },
      { id: 'read-records', label: '從瓶罐、圖表與文獻找線索', response: ['你選擇從記錄理解工程。除了看機械，圖表與文獻也能幫人把水道接回當時的生活。'], discoveryIds: ['culture-waterworks'] },
    ], sourceIds: ['culture-waterworks'],
  },
  'hills-fossil': {
    intro: ['化石故事窗裡有動物輪廓，也有採集和研究的示意。標籤留了一句：「這些線索，還能問什麼？」'],
    choices: [
      { id: 'ask-origin', label: '從發現地與地層問起', response: ['你把來處放到名字旁邊。左鎮化石園區以菜寮溪流域的化石與自然史，讓人看見研究需要脈絡。'], discoveryIds: ['culture-fossil'] },
      { id: 'ask-people', label: '找長期採集與研究的人', response: ['你注意到採集者與研究工作的故事。認識化石，也是在認識人們如何一點一滴累積證據。'], discoveryIds: ['culture-fossil'] },
    ], sourceIds: ['culture-fossil'],
  },
};
