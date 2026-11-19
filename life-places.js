// 六位鄰居沿用 first-day 的虛構角色。設施與故事地標位於同一行政區，
// 遊戲中的位置及散步時段並不對應實際距離或營業時間。
const checked = '2026-11-19';

export const lifeStops = [
  {
    id: 'shuixian-morning', districtId: 'west-central', name: '中西區', title: '水仙宮市場', resident: '阿雯',
    hello: '來，幫我看一下，這把蔥的尾巴是不是露出袋子了？要是沿路掉一根，我家晚餐的湯就少一味啦。',
    life: {
      question: '妳怎麼提一籃菜回家？',
      answer: '沉的放底下，葉菜擺上面。豆腐我會留到最後買，自己用手拎。你等我付完錢，我們站到攤子旁邊再分袋，後面的人也好買菜。',
    },
    facility: {
      name: '衛生福利部臺南醫院', kind: 'hospital', question: '陪家人看診，要去哪一個院區？',
      answer: '我陪媽媽回診，會先跟她對一次預約的院區。中西區的臺南醫院總院在中山路125號。你把掛號日期和科別一起存下來，明天出門就不用邊走邊翻了。',
      source: '衛生福利部臺南醫院', url: 'https://www.tnhosp.mohw.gov.tw/', checked,
    },
    extraFacilities: [{
      name: '湯德章紀念公園', kind: 'park', question: '圓環邊那座公園叫什麼？',
      answer: '那是湯德章紀念公園，好幾條路都在那裡會合。我約人會先說在哪一條路口碰面；只講「圓環旁邊」，兩個人可能繞了半圈還找不到。',
      source: '臺南市政府觀光旅遊局', url: 'https://twtainan.net/zh-tw/attractions/detail/737/', checked,
    }],
  },
  {
    id: 'yujing-morning', districtId: 'yujing', name: '玉井區', title: '玉井青果市場', resident: '阿禾',
    hello: '我的本子上畫了兩顆長得一模一樣的芒果。上回忘了寫名字，回到家連自己都猜不出來！今天你幫我記，好不好？',
    life: {
      question: '想帶水果回家，要先問哪一句？',
      answer: '我會先跟攤商說「我打算哪一天吃」。如果要送人，再請他幫忙挑適合帶回家的。等他秤重，我就在袋子上寫好品種，回去切開才對得起來。',
    },
    facility: {
      name: '玉井區圖書館', kind: 'library', question: '帶小朋友去玉井哪裡看書？',
      answer: '我帶小佑去民族路218號的玉井區圖書館。館裡有兒童區，也有給零到五歲孩子的空間。我們說好一人挑一本，回家換對方念自己選的那本。',
      source: '臺南市立圖書館', url: 'https://www.tnpl.tn.edu.tw/Page/EachPavilionIndex.aspx?id=u5485192215171537777', checked,
    },
    extraFacilities: [{
      name: '玉井區衛生所', kind: 'health-center', question: '想幫孩子問預防接種，去哪裡？',
      answer: '玉井區衛生所在中正路5號。先問清楚孩子適合預約哪一次，再把兒童健康手冊和健保卡放進同一個袋子，出門時拿了就走。',
      source: '臺南市玉井區衛生所', url: 'https://tnsychs.tainan.gov.tw/News_Content.aspx?n=12084&s=86110', checked,
    }],
  },
  {
    id: 'anping-afternoon', districtId: 'anping', name: '安平區', title: '安平巷弄', resident: '阿秀',
    hello: '你也看到門上那對眉毛了齁？我每回看都覺得牠在瞪我。來，往牆這邊站一點，讓人家把門打開。',
    life: {
      question: '要怎麼看清楚門上的劍獅？',
      answer: '我跟小茵一人看一樣。她記眉毛，我記嘴裡那把劍，走到寬一點的地方再比手畫腳。門口要留給進出的人，站遠些反而看得到整張臉。',
    },
    facility: {
      name: '港濱歷史特色遊戲場', kind: 'playground', question: '安平哪裡能讓小孩玩、大人散步？',
      answer: '到安億路的港濱歷史公園。我陪阿公走步道，小茵和爸爸去遊戲場找大鯨魚土丘、玩溜滑梯。出發前跟孩子一起指好碰面的地方，待會兒就找得到彼此。',
      source: '臺南市政府觀光旅遊局', url: 'https://twtainan.net/zh-tw/attractions/detail/6081/', checked,
    },
    extraFacilities: [{
      name: '安平樹屋', kind: 'heritage', question: '榕樹長進倉庫，真的看得到嗎？',
      answer: '安平樹屋本來是德記洋行的倉庫。你沿參觀動線找一條垂下來的氣根，看它在哪裡碰到磚牆。我會先看園區的票務與開放資訊，再決定哪天帶小茵去。',
      source: '臺南市政府觀光旅遊局', url: 'https://www.twtainan.net/zh-tw/attractions/detail/806/', checked,
    }],
  },
  {
    id: 'dongshan-afternoon', districtId: 'dongshan', name: '東山區', title: '東山咖啡時光', resident: '阿蓉',
    hello: '杯子有點燙，我幫你把杯耳轉過來。上回小哲說他的咖啡聞起來像烤吐司；你也聞聞看，會想到什麼？',
    life: {
      question: '喝到喜歡的咖啡，怎麼記得是哪一杯？',
      answer: '我會等店家手空，問今天這杯用的是哪裡的豆子，把名字寫下來就好。回去看筆記時，如果旁邊還寫了「像烤吐司」，我就記得那天跟誰坐一桌了。',
    },
    facility: {
      name: '東山運動公園', kind: 'park', question: '在東山想動一動，有步道也有球場嗎？',
      answer: '東山運動公園裡有步道，也有籃球場。小哲帶球，我就把水壺帶著。各自走一段、投幾球，再約在原來的入口會合，兩個人都玩得到。',
      source: '臺南市東山區公所', url: 'https://dongshan.tainan.gov.tw/News_Content.aspx?n=6627&s=72745', checked,
    },
    extraFacilities: [{
      name: '東山碧軒寺', kind: 'heritage', question: '廟門口站著兩隻白象，你看過嗎？',
      answer: '東山碧軒寺門口就站著一對白象，正殿前還有一對石獅。我跟小哲玩過找不同，看誰先找到石獅身上的鈴鐺。記得站旁邊看，把中間留給來拜拜的人。',
      source: '臺南市政府觀光旅遊局', url: 'https://www.twtainan.net/zh-tw/attractions/detail/1333/', checked,
    }],
  },
  {
    id: 'yanshui-evening', districtId: 'yanshui', name: '鹽水區', title: '橋南老街', resident: '榮伯',
    hello: '小蓁帶了整盒色鉛筆，只說要畫一扇窗。我當她貪心，結果是我在旁邊越看越久。你幫她挑個顏色？',
    life: {
      question: '走老街想畫一張小畫，從哪裡下筆？',
      answer: '挑一扇窗，只畫窗框和一道影子就夠了。先站在能讓行人通過的地方。我會連路名也寫在紙角，隔幾天拿出來，才找得到故事是從哪條街開始的。',
    },
    facility: {
      name: '永成戲院', kind: 'theater', question: '鹽水哪裡看得到老戲院的座椅？',
      answer: '康樂路的永成戲院，以前是碾米廠的倉庫。你仔細看檜木椅背，木匠把它做得微微往後斜。打算進去看老放映機，先查戲院開放日，再挑一天來。',
      source: '臺南市政府文化局・永成戲院', url: 'https://xinying-culture.tainan.gov.tw/onepage.php?id=25', checked,
    },
    extraFacilities: [{
      name: '月津港親水公園', kind: 'park', question: '想看老街和水岸，往哪裡走？',
      answer: '你可以從橋南老街走到月津港親水公園。走到岸邊記得回頭，剛才經過的街屋就跑進水邊的風景裡。我畫完街再畫水，紙上就有去有回了。',
      source: '臺南市政府觀光旅遊局', url: 'https://www.twtainan.net/zh-tw/attractions/detail/4282/', checked,
    }],
  },
  {
    id: 'beimen-evening', districtId: 'beimen', name: '北門區', title: '井仔腳瓦盤鹽田', resident: '阿海',
    hello: '小岑說鹽田是白的，我說再看一眼。你看，雲一過去，剛才那格水就換了顏色。今天要不要幫它取個名字？',
    life: {
      question: '想把鹽田和天色放進同一張照片，要站哪裡？',
      answer: '我選開放走道上站得穩的位置，把手機放低一點，讓鹽田格子佔畫面下半部。跟小岑約好，拍完就在這裡碰頭；誰也不用踩進鹽田找角度。',
    },
    facility: {
      name: '北門遊客中心', kind: 'visitor-center', question: '在北門，要去哪裡看鯨魚骨骼？',
      answer: '北門遊客中心。它用洗滌鹽工廠的舊倉庫改成，館裡有抹香鯨骨骼標本。想看鹽田夕色的話，我會先查館方開放時間，把室內這一站排在前頭。',
      source: '雲嘉南濱海國家風景區管理處', url: 'https://www.swcoast-nsa.gov.tw/zh-tw/attraction/details/154', checked,
    },
    extraFacilities: [{
      name: '北門區衛生所', kind: 'health-center', question: '家裡長輩要問預防保健，有地方可以問嗎？',
      answer: '北門區衛生所在北門里港北50號。我要幫家人問時，會先記下想辦的項目，打電話核對服務日期和要帶的資料，才不用陪長輩白走一趟。',
      source: '臺南市北門區衛生所', url: 'https://web.tainan.gov.tw/tnspmhs/cp.aspx?n=11706', checked,
    }],
  },
];
