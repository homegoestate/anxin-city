// 六組為閱讀主題，並非行政分區或完整文化名錄。
// kind 是介面用的中性分類，不代表法定文化資產類別或級別。
// lookFor、localLens、visitorLens 與 respect 是編輯提出的觀察與參觀建議。
// 未列固定開放時間、費用或年度祭典日期；現場開放及活動請查官方公告。
export const cultureReviewedAt = '2026-10-26';

export const cultureThemes = [
  { id: 'gates-harbors', title: '城門與海港', subtitle: '從城牆、洋行與舊港，讀懂城市如何與外界往來。' },
  { id: 'learning-streets', title: '府城學問與老街', subtitle: '讀書、寫作與做生意，都在街巷留下了線索。' },
  { id: 'faith-festivals', title: '信仰與節俗', subtitle: '從工藝、祭儀與庄頭合作，認識仍在延續的地方生活。' },
  { id: 'rural-crafts', title: '農村工藝與生活', subtitle: '把目光交給農人、材料、老屋與社區的創造力。' },
  { id: 'water-industry', title: '水利與產業記憶', subtitle: '一口水、一粒鹽、一段鐵道，都連著生活與勞動。' },
  { id: 'people-land', title: '多元族群與土地記憶', subtitle: '聽見不同群體的聲音，也理解歷史如何被記錄。' },
];

// 舊來源保留原查核日；新增或重新查核時必須明確傳入日期。
const source = (id, title, url, reviewedAt = '2026-10-25') => ({ id, title, url, reviewedAt });

export const cultureSources = {
  'culture-anping-fort': source('culture-anping-fort', '臺南市政府文化局｜安平古堡', 'https://historic.tainan.gov.tw/index.php?id=58&lang=cht&option=module&task=pageinfo'),
  'culture-south-gate': source('culture-south-gate', '臺南市政府觀光旅遊局｜臺灣府城大南門', 'https://www.twtainan.net/zh-tw/attractions/detail/856/'),
  'culture-tait': source('culture-tait', '臺南市政府文化局｜安平樹屋暨原德記洋行', 'https://historic.tainan.gov.tw/index.php?belongid=45&id=60&index=13&lang=cht&option=module&task=pageinfo'),
  'culture-tree-house': source('culture-tree-house', '臺南市政府文化局｜安平樹屋與倉庫再利用', 'https://historic.tainan.gov.tw/index.php?id=1061&index=4&lang=cht&option=module&task=pageinfo'),
  'culture-yuejin': source('culture-yuejin', '臺南市政府觀光旅遊局｜月津港・聚波亭大眾廟', 'https://www.twtainan.net/zh-tw/attractions/detail/491/'),
  'culture-confucius': source('culture-confucius', '臺南市政府觀光旅遊局｜臺南孔子廟', 'https://twtainan.net/zh-tw/attractions/detail/800/'),
  'culture-yeh': source('culture-yeh', '臺南市政府觀光旅遊局｜葉石濤文學紀念館', 'https://www.twtainan.net/zh-tw/attractions/detail/743/'),
  'culture-shennong': source('culture-shennong', '臺南市政府觀光旅遊局｜神農街', 'https://www.twtainan.net/zh-tw/attractions/detail/1351/'),
  'culture-xinhua': source('culture-xinhua', '臺南市政府觀光旅遊局｜新化老街', 'https://www.twtainan.net/zh-tw/attractions/detail/559/'),
  'culture-xuejia': source('culture-xuejia', '臺南市政府觀光旅遊局｜學甲慈濟宮', 'https://www.twtainan.net/zh-tw/attractions/detail/475/'),
  'culture-xigang': source('culture-xigang', '臺南市政府觀光旅遊局｜西港慶安宮', 'https://www.twtainan.net/zh-tw/attractions/detail/485/'),
  'culture-nankunshen': source('culture-nankunshen', '臺南市政府觀光旅遊局｜南鯤鯓代天府', 'https://www.twtainan.net/zh-tw/attractions/detail/466/'),
  'culture-bixuan': source('culture-bixuan', '臺南市政府觀光旅遊局｜東山碧軒寺', 'https://www.twtainan.net/zh-tw/attractions/detail/1333/'),
  'culture-jingliao': source('culture-jingliao', '臺南市政府觀光旅遊局｜菁寮老街', 'https://twtainan.net/zh-tw/attractions/detail/943/'),
  'culture-yen-park': source('culture-yen-park', '臺南市政府觀光旅遊局｜顏水龍紀念公園', 'https://www.twtainan.net/zh-tw/attractions/detail/525/'),
  'culture-craft-history': source('culture-craft-history', '國立臺灣工藝研究發展中心｜緣起沿革', 'https://www.ntcri.gov.tw/home/zh-tw/history'),
  'culture-bamboo': source('culture-bamboo', '農業部農村發展及水土保持署｜龍崎竹炭故事館', 'https://ezgo.ardswc.gov.tw/zh-tw/spot/2194/'),
  'culture-tugou': source('culture-tugou', '臺南市後壁區公所｜後壁導覽・土溝農村美術館', 'https://web.tainan.gov.tw/houbi/News_Content.aspx?n=7000&s=72650'),
  'culture-waterworks': source('culture-waterworks', '臺南市政府觀光旅遊局｜山上花園水道博物館', 'https://www.twtainan.net/zh-tw/attractions/detail/5816/'),
  'culture-wusanto': source('culture-wusanto', '西拉雅國家風景區管理處｜烏山頭水庫風景區', 'https://www.siraya-nsa.gov.tw/zh-tw/attractions/detail/16'),
  'culture-wusanto-water': source('culture-wusanto-water', '農業部農田水利署｜烏山頭水庫簡介', 'https://www.ia.gov.tw/zh-TW/operations/ReservoirContent?a=16703&id=8'),
  'culture-xinying-rail': source('culture-xinying-rail', '臺南市政府觀光旅遊局｜新營鐵道文化園區', 'https://www.twtainan.net/zh-tw/attractions/detail/498/'),
  'culture-salt': source('culture-salt', '臺南市政府觀光旅遊局｜井仔腳瓦盤鹽田', 'https://www.twtainan.net/zh-tw/attractions/detail/587/'),
  'culture-stsp-history': source('culture-stsp-history', '國立臺灣史前文化博物館南科考古館｜簡介', 'https://stsp.nmp.gov.tw/introduction'),
  'culture-stsp-gallery': source('culture-stsp-gallery', '國立臺灣史前文化博物館南科考古館｜第一展廳', 'https://stsp.nmp.gov.tw/permanent?id=1'),
  'culture-kabua-sua': source('culture-kabua-sua', '臺南市政府觀光旅遊局｜西拉雅部落・吉貝耍', 'https://www.twtainan.net/zh-tw/attractions/detail/1060/'),
  'culture-tapani': source('culture-tapani', '噍吧哖文化園區｜關於我們', 'https://tapani.tainan.gov.tw/index.php?inter=about'),
  'culture-hakka': source('culture-hakka', '臺南市政府客家事務委員會｜臺南市客家文化會館', 'https://web.tainan.gov.tw/hakka/cp.aspx?n=26775'),
  'culture-fan-salt': source('culture-fan-salt', '雲嘉南濱海國家風景區管理處｜青鯤鯓扇形鹽田', 'https://www.swcoast-nsa.gov.tw/zh-tw/attraction/details/87', '2026-10-26'),
  'culture-qigu-lagoon': source('culture-qigu-lagoon', '臺南市政府觀光旅遊局｜七股潟湖的養蚵與漁業地景', 'https://www.twtainan.net/zh-tw/tours/columns/detail/7018/', '2026-10-26'),
  'culture-soulangh': source('culture-soulangh', '蕭壠文化園區｜園區沿革', 'https://soulangh.tnc.gov.tw/index.php?id=1&inter=about', '2026-10-26'),
  'culture-sicao-fort': source('culture-sicao-fort', '臺灣國家公園主題網｜四草砲臺', 'https://www.taiwan.nps.gov.tw/home/zh-tw/attractions/21109.html', '2026-10-26'),
  'culture-chongwen-arch': source('culture-chongwen-arch', '文化部國家文化記憶庫｜重道崇文坊', 'https://tcmb.culture.tw/zh-tw/detail?id=19851127000065&indexCode=BOCH_CountryCulture_11', '2026-10-26'),
  'culture-magistrate': source('culture-magistrate', '臺南市政府文化局｜原臺南縣知事官邸', 'https://historic.tainan.gov.tw/index.php?id=533&index=4&lang=cht&option=module&task=pageinfo', '2026-10-26'),
  'culture-sankandian': source('culture-sankandian', '臺南市政府觀光旅遊局｜永康三崁店糖廠神社遺蹟', 'https://www.twtainan.net/zh-tw/attractions/detail/4260/', '2026-10-26'),
  'culture-baoan': source('culture-baoan', '臺南市政府觀光旅遊局｜保安車站', 'https://www.twtainan.net/zh-tw/attractions/detail/571/', '2026-10-26'),
  'culture-guiren-art': source('culture-guiren-art', '臺南市政府觀光旅遊局｜歸仁美學館', 'https://www.twtainan.net/zh-tw/attractions/detail/4279/', '2026-10-26'),
  'culture-liu-chi-hsiang': source('culture-liu-chi-hsiang', '臺南市政府觀光旅遊局｜劉啟祥美術紀念館', 'https://www.twtainan.net/zh-tw/attractions/detail/5624/', '2026-10-26'),
  'culture-tsung-yeh': source('culture-tsung-yeh', '總爺藝文中心｜園區沿革', 'https://tyart.tnc.gov.tw/index.php?id=1&inter=about', '2026-10-26'),
  'culture-longhu': source('culture-longhu', '臺南市政府觀光旅遊局｜赤山龍湖巖', 'https://www.twtainan.net/zh-tw/attractions/detail/532/', '2026-10-26'),
  'culture-shanhua-market': source('culture-shanhua-market', '臺南市政府觀光旅遊局｜善化牛墟', 'https://www.twtainan.net/zh-tw/attractions/detail/5603/', '2026-10-26'),
  'culture-zhenhu': source('culture-zhenhu', '臺南市政府觀光旅遊局｜蘇厝第一代天府真護宮', 'https://www.twtainan.net/zh-tw/attractions/detail/1339/', '2026-10-26'),
  'culture-guanziling': source('culture-guanziling', '西拉雅國家風景區管理處｜關子嶺溫泉', 'https://www.siraya-nsa.gov.tw/zh-tw/attractions/detail/3', '2026-10-26'),
  'culture-toushe': source('culture-toushe', '臺南市政府觀光旅遊局｜頭社太上龍頭忠義廟・西拉雅公廨', 'https://www.twtainan.net/zh-tw/attractions/detail/1004/', '2026-10-26'),
  'culture-jiang-settlement': source('culture-jiang-settlement', '臺南市楠西區公所｜認識楠西・鹿陶洋江家古厝', 'https://nansi.tainan.gov.tw/cp.aspx?n=7560', '2026-10-26'),
  'culture-nanhua-reservoir': source('culture-nanhua-reservoir', '臺南市政府觀光旅遊局｜南化水庫', 'https://www.twtainan.net/zh-tw/attractions/detail/623/', '2026-10-26'),
  'culture-zuozhen-history': source('culture-zuozhen-history', '臺南左鎮化石園區｜沿革', 'https://fossil.tnc.gov.tw/content/index.php?m2=20', '2026-10-26'),
  'culture-zuozhen-intro': source('culture-zuozhen-intro', '臺南左鎮化石園區｜園區簡介', 'https://fossil.tnc.gov.tw/content/index.php?m2=96', '2026-10-26'),
  'culture-shanxi': source('culture-shanxi', '臺南市政府觀光旅遊局｜關廟山西宮', 'https://www.twtainan.net/zh-tw/attractions/detail/580/', '2026-10-26'),
};

export const culturePlaces = [
  {
    id: 'culture-anping-fort', name: '安平古堡', districtId: 'anping', themeId: 'gates-harbors', kind: '古蹟建築',
    hook: '白色瞭望台與老磚牆，說的其實是不同年代。',
    story: '安平古堡所在位置曾是荷蘭時期的熱蘭遮堡，兼具軍事防禦與海上往來的角色。歷經鄭氏、清領與日治時期，建築用途和周邊海岸環境持續改變。今天看到的園區不是某個年代完整留下的原貌；老城垣、後來的建築與瞭望台，應分開閱讀。沿著解說辨認不同時期的痕跡，可以理解安平如何從海口要塞轉成居民生活與歷史展示共存的地方。',
    lookFor: '找出外城南城垣的老磚牆，再比較園區其他建築的材料與樣式。',
    localLens: '把熟悉的古堡當作一次辨認年代的練習，試著向同行者說明兩處不同時期的痕跡。',
    visitorLens: '先看城與海的關係，再逛老街，較能理解安平何以成為重要門戶。',
    respect: '不攀爬城垣、不觸摸脆弱牆面；參觀範圍依現場公告。',
    sourceIds: ['culture-anping-fort'], attractionId: 'anping-fort',
    quiz: { question: '閱讀今日安平古堡，最合適的方法是？', options: ['辨認不同時期留下的建築痕跡', '把所有建築都視為荷蘭時期原物', '只看瞭望台便能理解全部歷史'], correctIndex: 0, explanation: '園區歷經多次變動，老城垣與後來的建築需要分開閱讀。' },
  },
  {
    id: 'culture-south-gate', name: '臺灣府城大南門', districtId: 'west-central', themeId: 'gates-harbors', kind: '古蹟建築',
    hook: '一個轉彎的入口，藏著城防與日常通行的安排。',
    story: '大南門又稱寧南門，外圍半月形的甕城，讓出入不只是穿過一座門洞。城門原本連著府城防禦與對外交通，周邊今日則成為居民休息的公園。現存形貌也經歷風災後重建，不能把眼前每塊材料都當作清代原物。附近碑林保存不同時期的文字記錄，讓一次散步可以同時閱讀城的形狀、出入的路線，以及過往社會留下的規範。',
    lookFor: '從外門到內門走一次，觀察半月形空間如何改變行走方向。',
    localLens: '比較平常經過的道路與城門入口，想想城市交通如何改寫舊邊界。',
    visitorLens: '留一點時間讀碑文題名，將城門和人的生活連起來。',
    respect: '不攀爬城牆或拓印石碑；保留居民休息及通行空間。',
    sourceIds: ['culture-south-gate'],
    quiz: { question: '大南門外圍的半月形空間稱為什麼？', options: ['船塢', '甕城', '曬鹽池'], correctIndex: 1, explanation: '甕城是城門外圍的防禦空間，也會影響出入動線。' },
  },
  {
    id: 'culture-tait', name: '原德記洋行與安平樹屋', districtId: 'anping', themeId: 'gates-harbors', kind: '古蹟建築',
    hook: '樹根包住的倉庫，曾經連向海外的貨物航線。',
    story: '德記洋行是安平開港後設立的外商據點之一，曾經經手糖、樟腦等貨物。洋行與後方倉庫，使港口貿易不只出現在船上，也走進建築與地方工作。後來場域轉作鹽業用途，倉庫閒置後，榕樹逐漸與牆體交織，形成今日樹屋景觀。看洋行外觀與樹根時，也可以追問貨物從哪裡來、由誰搬運，再理解這片園區不同年代的使用方式。',
    lookFor: '比較洋行外觀與倉庫牆體，找出不同使用空間的差別。',
    localLens: '從家鄉常見的糖與鹽，延伸認識安平曾經參與的貿易網絡。',
    visitorLens: '樹屋之外也看洋行展覽，將自然景觀接回港口和產業故事。',
    respect: '依棧道和指示參觀，不拉扯氣根或跨進保護區。',
    sourceIds: ['culture-tait', 'culture-tree-house'],
    quiz: { question: '安平樹屋所在建築，早期與哪一種用途有關？', options: ['學校教室', '火車修理工場', '洋行倉庫'], correctIndex: 2, explanation: '樹屋前身為洋行倉庫，後續也與鹽業使用相連。' },
  },
  {
    id: 'culture-yuejin', name: '月津港・聚波亭大眾廟', districtId: 'yanshui', themeId: 'gates-harbors', kind: '地方記憶',
    hook: '港口退到歷史裡，樹下聊天的人仍讓地方繼續生活。',
    story: '月津港曾有商船與商賈往來，聚波漁火也是昔日月津景觀的一部分。聚波亭旁的大眾廟，讓港口記憶與地方信仰落在同一處空間。官方介紹記錄了廟前樹下居民乘涼聊天的日常，也提到廟內以麻將牌製作的小廟。走到這裡，可以把港口、廟宇與生活中的巧思一起看，理解鹽水不只有節慶燈景，也有持續被居民使用的街區。',
    lookFor: '先觀察水岸、廟口與街道的相對位置，再依現場指引看廟內細節。',
    localLens: '把熟悉的乘涼場所與舊港史連起來，記下自己或家人記得的水岸變化。',
    visitorLens: '節慶之外再來一次，感受月津平日的生活節奏。',
    respect: '不打擾祭拜與聊天的居民；拍攝人物及廟內物件先詢問。',
    sourceIds: ['culture-yuejin'],
    quiz: { question: '月津港的歷史，與哪一種活動密切相關？', options: ['商船與商賈往來', '高山林木運送', '航空飛行訓練'], correctIndex: 0, explanation: '月津曾是商船往來的港口，這是理解鹽水街區的重要線索。' },
  },
  {
    id: 'culture-confucius', name: '臺南孔子廟', districtId: 'west-central', themeId: 'learning-streets', kind: '古蹟建築',
    hook: '紅牆裡的學問，也留在門外的石坊與街道。',
    story: '臺南孔子廟把祭祀孔子與地方教育的歷史連在一起，泮宮石坊則提供閱讀學校身分的線索。石坊以石材模仿木構形式，能看見雀替等建築細節；它也曾因道路拓寬而移動。今日從石坊望向廟區，眼前道路便提醒我們，文化空間會隨城市生活改變。除了記住全臺首學的稱呼，也可以觀察門、庭院與殿堂如何組織一段學習和行禮的路徑。',
    lookFor: '比較石坊的石材與仿木構細節，再觀察它與廟區之間的道路。',
    localLens: '用自己上學的經驗想一想，現代學校與昔日官學的空間有何不同。',
    visitorLens: '先理解學與廟的關係，再往府中街散步，讓街區不只剩下店家。',
    respect: '典禮期間遵守動線與攝影規範；不觸碰祭器與石刻。',
    sourceIds: ['culture-confucius'],
    quiz: { question: '孔廟外泮宮石坊提供了哪一種歷史線索？', options: ['貨物報關', '地方教育與學校', '糖廠生產'], correctIndex: 1, explanation: '泮宮與地方學校的歷史相連，能幫助理解孔廟的教育角色。' },
  },
  {
    id: 'culture-yeh', name: '葉石濤文學紀念館', districtId: 'west-central', themeId: 'learning-streets', kind: '文化場域',
    hook: '把城市讀進小說，也把小說帶回巷子裡。',
    story: '葉石濤文學紀念館利用原山林事務所的紅磚建築，展示作家的生平、著作與手稿，也以府城文學地景連結城市空間。書房展示讓創作不只是書名，而能與書桌、筆及閱讀生活相遇。參觀時可以選一個出現在作品介紹裡的地名，再走回街上尋找今天的樣子。文學提供的是觀看生活的角度，也提醒我們，同一條街可以被不同的人寫成不同故事。',
    lookFor: '從手稿或書房展示選一件物品，想想它如何參與寫作日常。',
    localLens: '找一個自己熟悉的地名，比較日常印象與作家筆下的觀看方式。',
    visitorLens: '先在館內讀一段作品介紹，再以步行感受附近街區的尺度。',
    respect: '館內保持安靜，手稿及展示物依規定觀賞；拍照先看標示。',
    sourceIds: ['culture-yeh'],
    quiz: { question: '這座紀念館如何連結文學與城市？', options: ['只展示交通路線', '只排列商品價格', '透過作品、手稿與府城文學地景'], correctIndex: 2, explanation: '館內以生平、作品和文學地景，幫助觀眾理解作家與城市的關係。' },
  },
  {
    id: 'culture-shennong', name: '神農街', districtId: 'west-central', themeId: 'learning-streets', kind: '生活文化',
    hook: '今天的街道，曾是商人往來河港的路。',
    story: '神農街與清代五條港的商業活動相連，曾是商賈由河港進出府城的重要街道。河港與城市路網改變後，老街又出現手作、藝文與不同店家的使用方式。沿街看屋面、門窗與店鋪，可以理解建築如何承接一代又一代生活需求。這裡既是旅人的散步目的地，也是居民與經營者的日常場所；閱讀街區時，別忘了把今天正在生活的人放進故事裡。',
    lookFor: '比較相鄰街屋的門面與使用方式，找找舊建築如何容納新活動。',
    localLens: '回想自己記得的店家變化，分辨哪些是港口歷史、哪些是近年的街區生活。',
    visitorLens: '少追一個拍照角度，多讀一間店或一棟屋子的故事。',
    respect: '室內與作品拍攝先徵詢同意，不堵住店門及住家出入口。',
    sourceIds: ['culture-shennong'],
    quiz: { question: '神農街早期的商業生活與哪個區域有關？', options: ['五條港', '阿里山林場', '航空園區'], correctIndex: 0, explanation: '神農街曾是五條港商業往來的一條重要街道。' },
  },
  {
    id: 'culture-xinhua', name: '新化老街', districtId: 'xinhua', themeId: 'learning-streets', kind: '生活文化',
    hook: '抬頭看店屋，會發現山區入口曾有的商業雄心。',
    story: '日治時期的新化是臺南山區入口的重要政經中心，商業往來帶動洋樓與街屋興建。今天老街保留仿巴洛克式立面，花紋、窗框與山牆裝飾讓一排街屋各有表情。老商號與新的街道生活並存，提醒我們這裡不是停在某年的布景。看建築時也看店面如何營業、居民如何通行，便能把漂亮立面放回城鎮與周邊農村相互連結的脈絡。',
    lookFor: '選兩棟相鄰街屋，比較山牆、窗形及裝飾的繁簡。',
    localLens: '問自己平常買東西時忽略了哪些門面細節，重新閱讀熟悉的商店街。',
    visitorLens: '把視線從招牌移到二樓，再觀察地面正在發生的日常交易。',
    respect: '注意車流與騎樓通行；私人室內空間須經同意才能進入。',
    sourceIds: ['culture-xinhua'], attractionId: 'xinhua-old-street',
    quiz: { question: '新化老街的洋樓與街屋，與哪種地方發展相連？', options: ['海上捕鯨', '山區入口的政經與商業往來', '大型航空維修'], correctIndex: 1, explanation: '新化的政經地位與商業往來，促成了街屋和商店街的發展。' },
  },
  {
    id: 'culture-xuejia', name: '學甲慈濟宮', districtId: 'xuejia', themeId: 'faith-festivals', kind: '生活文化',
    hook: '一座廟可以同時讀到陶、木、彩繪與地方情感。',
    story: '學甲慈濟宮主祀保生大帝，地方信仰與上白礁、刈香等活動相連。不同時代的匠師留下交趾陶、剪黏、木雕與門神彩繪，部分作品移入文物館保存。這些裝飾有故事題材，也有魚蝦、螃蟹等生活意象。參觀時可以先辨認材料，再閱讀人物與寓意，理解信眾如何透過工藝表達心意，也看見保存文物與持續祭拜如何在同一處場域相遇。',
    lookFor: '比較交趾陶、剪黏與木雕的材質差異，挑一個熟悉的動物找解說。',
    localLens: '從家人熟悉的祭典經驗，延伸認識平常不易注意的匠師與作品。',
    visitorLens: '不要一次追完所有神像，先用一件作品理解一種技藝。',
    respect: '不碰觸裝飾與祭器；祭儀及文物館參觀依管理者安排。',
    sourceIds: ['culture-xuejia'], attractionId: 'xuejia-ciji-temple',
    quiz: { question: '這張卡建議先用什麼方法閱讀慈濟宮工藝？', options: ['只看建築高度', '將所有裝飾當成相同材質', '辨認材料，再讀故事與寓意'], correctIndex: 2, explanation: '交趾陶、剪黏、木雕與彩繪各有材料和手法，辨認後更容易讀懂。' },
  },
  {
    id: 'culture-xigang', name: '西港慶安宮', districtId: 'xigang', themeId: 'faith-festivals', kind: '生活文化',
    hook: '一面令旗、一尾鯉魚，串起庄頭之間的關係。',
    story: '西港慶安宮主祀媽祖，並是認識西港刈香的重要入口。刈香中的陣頭與各地信眾，把祭典變成跨庄頭的共同參與。廟中可見鯉魚意象，與地方關於鯉魚穴的傳說及祭儀物件相連；傳說屬於信仰記憶，宜和可查證的建築、活動分開理解。平日也能從門神、龍柱與裝飾認識這座廟，不必等到香科才開始學習地方文化。',
    lookFor: '找出鯉魚圖像，再觀察門神的配色與人物姿態。',
    localLens: '把自己認識的陣頭放回庄頭協作中，想想一場祭典需要哪些人共同準備。',
    visitorLens: '先讀基本祭儀介紹，觀賞時更能理解隊伍與廟宇的關係。',
    respect: '香科時間與路線依當年公告；不穿越儀式隊伍或擋住神轎動線。',
    sourceIds: ['culture-xigang'], attractionId: 'xigang-qingan-temple',
    quiz: { question: '慶安宮常見的鯉魚意象，與什麼相連？', options: ['地方傳說及祭儀物件', '機場導航標記', '糖廠運輸編號'], correctIndex: 0, explanation: '鯉魚意象與地方信仰傳說、鯉魚公及令旗等物件相連。' },
  },
  {
    id: 'culture-nankunshen', name: '南鯤鯓代天府', districtId: 'beimen', themeId: 'faith-festivals', kind: '生活文化',
    hook: '進香的人群之外，屋脊與廊道也值得慢慢讀。',
    story: '南鯤鯓代天府主祀李、池、吳、朱、范五府千歲，進香活動連結不同地方的信眾。廟宇留下石雕、彩繪與剪黏等工藝，屋脊可見人物、動物與各種裝飾，廊道彩繪也承載戲曲及歷史故事。若只看熱鬧規模，容易錯過一件件作品的細節。從一幅彩繪或一處屋脊開始，可以把沿海王爺信仰、匠師技術與信眾共同維護的空間連在一起。',
    lookFor: '先在安全位置看屋脊剪黏，再選一幅廊道彩繪辨認人物和情節。',
    localLens: '把熟悉的進香經驗延伸到工藝，練習說出一個作品細節。',
    visitorLens: '先了解主祀五府千歲，再看不同進香團如何使用廟埕。',
    respect: '不跨越祭儀管制區；周邊園林與展館是否開放另查公告。',
    sourceIds: ['culture-nankunshen'],
    quiz: { question: '南鯤鯓代天府主要奉祀哪一組神明？', options: ['孔子與四配', '五府千歲', '五文昌帝君'], correctIndex: 1, explanation: '代天府主祀李、池、吳、朱、范五府千歲。' },
  },
  {
    id: 'culture-bixuan', name: '東山碧軒寺', districtId: 'dongshan', themeId: 'faith-festivals', kind: '生活文化',
    hook: '迎佛祖的路，讓平原與關子嶺山區保持聯繫。',
    story: '東山碧軒寺主祀觀音佛祖，地方又以佛祖媽親切稱呼。迎佛祖往返關子嶺碧雲寺的傳統，讓東山市街與山區的信仰關係持續被實踐。寺廟也留下白象與石獅等不同形象，可從造型理解宗教故事和匠師手法。把參訪焦點放在往返路線、居民參與及工藝細節，能看見祭典如何連結地方，而不只是記住一次活動的熱鬧畫面。',
    lookFor: '依現場開放範圍觀察白象、石獅的姿態與細節。',
    localLens: '在地圖上連起東山與碧雲寺，理解熟悉的迎佛祖路線跨越哪些地景。',
    visitorLens: '先讀往返祖廟的關係，才能理解隊伍行走的文化意義。',
    respect: '官方景點頁載有整修提醒，出發前確認可參觀範圍；祭典安排依公告。',
    sourceIds: ['culture-bixuan'],
    quiz: { question: '碧軒寺迎佛祖的傳統，連結東山與哪一處？', options: ['安平德記洋行', '新營糖廠', '關子嶺碧雲寺'], correctIndex: 2, explanation: '迎佛祖往返碧雲寺的傳統，延續東山與關子嶺的信仰關係。' },
  },
  {
    id: 'culture-jingliao', name: '菁寮老街', districtId: 'houbi', themeId: 'rural-crafts', kind: '生活文化',
    hook: '嫁妝街、稻田與老店，都是農村生活的不同切面。',
    story: '菁寮曾是通往諸羅縣城路上的重要驛站，交通位置帶來商店、旅宿與生活服務，老街也有嫁妝街的稱呼。後來《無米樂》紀錄片讓更多人認識這裡的稻作與農人。農村故事不只屬於某位人物或一部作品，還在店家、學校和田間工作中繼續發生。走讀時把老街與周邊農作生活一起理解，便能看見地方如何在交易、勞動與人情之間延續。',
    lookFor: '比較日常用品店、老街屋與周邊田野，想想彼此如何支援生活。',
    localLens: '用家中一件舊生活用品作起點，回想它曾在哪裡購買或修理。',
    visitorLens: '老店與農田都有人工作，請以聆聽和尊重取代要求居民表演農村生活。',
    respect: '不擅入農田、住家或農作區；人物拍攝和體驗活動先取得同意。',
    sourceIds: ['culture-jingliao'], attractionId: 'houbi-jingliao-old-street',
    quiz: { question: '菁寮早期的熱鬧商業，與什麼條件有關？', options: ['位在重要交通路線上的驛站', '深水貨櫃港的興建', '山頂礦場的開採'], correctIndex: 0, explanation: '菁寮位居往來諸羅的交通要道，帶動商店及各種生活服務。' },
  },
  {
    id: 'culture-yen-park', name: '顏水龍紀念公園', districtId: 'xiaying', themeId: 'rural-crafts', kind: '文化場域',
    hook: '從下營出發的藝術家，把美感帶進生活器物。',
    story: '顏水龍出身下營紅毛厝，投入繪畫、公共藝術，也積極推動臺灣工藝。紀念公園以家廟、紀念館及相關展示，讓人從家鄉認識他的生命路徑。工藝中心的沿革也記錄，他促成的南投縣工藝研究班培育竹、木、陶瓷等領域人才。把這兩條線索放在一起，可以理解藝術不只在畫布上，也能透過材料、技術與人才培育，進入人們每天使用的物件。',
    lookFor: '從生平介紹找出繪畫與工藝兩條路徑，再觀察紀念空間與家廟的關係。',
    localLens: '選一件家中常用器物，想想造型、材料與好用之間如何取得平衡。',
    visitorLens: '把小型紀念場域和臺灣工藝發展連起來，認識地方人物更廣的影響。',
    respect: '家廟與紀念館依現場規範參觀，勿將公園開放視為室內隨時開放。',
    sourceIds: ['culture-yen-park', 'culture-craft-history'], attractionId: 'xiaying-yen-shui-long',
    quiz: { question: '顏水龍除了繪畫，也投入哪一項工作？', options: ['海關貨運管理', '工藝推廣與人才培育', '水庫閘門操作'], correctIndex: 1, explanation: '顏水龍推動工藝教育，參與培育竹、木、陶瓷等領域人才。' },
  },
  {
    id: 'culture-bamboo', name: '龍崎竹炭故事館', districtId: 'longqi', themeId: 'rural-crafts', kind: '文化場域',
    hook: '同一根竹子，能從山坡材料走進新的生活用途。',
    story: '龍崎竹炭故事館由舊公所建築改造，透過展覽和製程介紹，連起在地竹材與竹炭產業。農會運用地方竹材燒製竹炭，館舍則讓旅人認識材料、加工與生活用途之間的關係。閱讀這個場域，可以同時看老建築如何再利用，以及農村產業怎麼重新介紹自己的技術。體驗項目是否辦理仍依現場安排，重點是理解材料轉變背後的知識與工作。',
    lookFor: '比較原竹、竹炭與展示物的外觀，依解說了解加工帶來的變化。',
    localLens: '回想竹製用品在家庭中的用途，與竹材炭化後的生活用途作比較。',
    visitorLens: '先讀製程與材料解說，再觀察舊公所如何成為地方文化展示空間。',
    respect: '炭窯與作業區須依導覽安排進入；不自行觸摸設備或採集竹材。',
    sourceIds: ['culture-bamboo'],
    quiz: { question: '竹炭故事館主要連結哪種地方材料與產業？', options: ['海鹽與製冰', '稻米與釀酒', '竹材與竹炭'], correctIndex: 2, explanation: '館舍介紹龍崎竹材加工成竹炭，以及相關生活用途。' },
  },
  {
    id: 'culture-tugou', name: '土溝農村美術館', districtId: 'houbi', themeId: 'rural-crafts', kind: '生活文化',
    hook: '美術館的邊界，可以沿著村路與農田展開。',
    story: '土溝農村美術館以社區營造為基礎，居民與投入地方工作的年輕人，共同把農村生活和藝術連在一起。理解這裡，不能只尋找一棟放滿作品的館舍，而要把村落、農田與生活空間一起閱讀。走在社區裡，作品與日常勞動可能出現在相近的視野；這也提醒來訪者，藝術走入生活，並不代表整個村子都成了可任意進入、拍攝或使用的展場。',
    lookFor: '依公開動線觀察作品如何回應村路、田野及居民生活，而不只看造型。',
    localLens: '想想家鄉有哪些空間適合共同維護，哪些地方需要保留生活隱私。',
    visitorLens: '先了解社區導覽或展覽安排，讓作品與居民的地方經驗一起被看見。',
    respect: '以公開路線參觀，私人院落和農田須經同意；不將農具當成拍照道具。',
    sourceIds: ['culture-tugou'],
    quiz: { question: '閱讀土溝農村美術館，應把什麼一起納入？', options: ['村落、農田與生活空間', '只看單一售票大樓', '只看停車場大小'], correctIndex: 0, explanation: '土溝以農村生活與社區營造為核心，閱讀範圍不只是一棟館舍。' },
  },
  {
    id: 'culture-waterworks', name: '臺南山上花園水道博物館', districtId: 'shanshang', themeId: 'water-industry', kind: '文化場域',
    hook: '打開水龍頭之前，水曾經走過哪些設備？',
    story: '山上花園水道博物館保留老水道的建築與設備，把原本藏在日常用水背後的工程帶到眼前。快濾筒、水泵與交錯管線，讓人從物件理解濾水和送水的過程。園區另有淨水池區，與博物館區是不同場域。參觀時先追一段管線，再讀設備解說，便能把紅磚建築的美感接回公共用水的需求，也看見維護城市生活所需的技術與工作。',
    lookFor: '選一座快濾筒，依解說追蹤進出水路，留意設備與屋架的尺度。',
    localLens: '從家中最常用水的時刻出發，想想便利生活背後有哪些人與設施。',
    visitorLens: '先分清博物館區與淨水池區，再依體力及開放範圍安排參觀。',
    respect: '不攀爬或操作歷史設備；各區開放與戲水設施使用依館方公告。',
    sourceIds: ['culture-waterworks'], attractionId: 'shanshang-waterworks-museum',
    quiz: { question: '快濾筒、水泵與管線主要幫助理解什麼？', options: ['廟宇祭典', '濾水與送水工程', '港口報關'], correctIndex: 1, explanation: '這些設備把日常供水背後的工程過程呈現在觀眾眼前。' },
  },
  {
    id: 'culture-wusanto', name: '烏山頭水庫', districtId: 'guantian', themeId: 'water-industry', kind: '地方記憶',
    hook: '珊瑚般的湖岸，也是一套水利系統的一部分。',
    story: '烏山頭水庫位於官田與六甲交界，曲折湖岸帶來珊瑚潭的稱呼。它最初以灌溉為目標，後來也承擔公共給水等多種功能；今日湖景背後，仍有引水、蓄水與分配用水的工作。園區的歷史展示可作為認識工程的入口，再把視線延伸到農田與水路，能看見水利不只關於一位工程師，也關於施工、維護、耕作與地方長期使用水資源的關係。',
    lookFor: '在允許停留的區域辨認湖岸與水利設施，再對照展示中的水路說明。',
    localLens: '思考自家或家鄉農田如何用水，將休閒湖景與生活需要接起來。',
    visitorLens: '看風景也看用途，先認識灌溉角色，再閱讀人物與工程歷史。',
    respect: '只使用開放步道與觀景點，不進入水域、閘門或其他管制設施。',
    sourceIds: ['culture-wusanto', 'culture-wusanto-water'], attractionId: 'guantian-wusanto-reservoir',
    quiz: { question: '烏山頭水庫原本的主要設計目標是？', options: ['貨船停泊', '鹽田結晶', '農田灌溉'], correctIndex: 2, explanation: '水庫原以灌溉為目標，後來發展出多種供水與公共功能。' },
  },
  {
    id: 'culture-xinying-rail', name: '新營鐵道文化園區', districtId: 'xinying', themeId: 'water-industry', kind: '文化場域',
    hook: '小火車的尺寸，透露糖業運輸如何工作。',
    story: '新營鐵道文化園區位在新營糖廠，保存車廂、機車頭與相關鐵道設施。昔日糖廠鐵路不只運送原料，也曾承擔客運，密集軌道與調度工作支持了地方的產業往來。不同車輛與軌距留下用途差異，是閱讀運輸史的線索。看展示時不妨先問這台車載什麼、往哪裡去，再把車輛與工作者、工廠及周邊聚落連起來，理解鐵道如何參與日常生活。',
    lookFor: '依說明牌比較客車、運料車與機車頭，留意用途如何改變車體外形。',
    localLens: '從長輩搭車或糖廠工作的記憶找問題，再以現場資料核對。',
    visitorLens: '參觀重點不只搭車，也能從靜態展示讀懂產業網絡。',
    respect: '不擅自進入軌道或攀上車輛；搭乘、營運與開放安排另查公告。',
    sourceIds: ['culture-xinying-rail'], attractionId: 'xinying-railway-culture',
    quiz: { question: '昔日糖廠鐵路除了運料，也曾提供什麼服務？', options: ['客運', '遠洋郵輪', '航空貨運'], correctIndex: 0, explanation: '官方介紹記錄新營糖廠鐵路也曾是五分仔車客運的重要據點。' },
  },
  {
    id: 'culture-salt', name: '井仔腳瓦盤鹽田', districtId: 'beimen', themeId: 'water-industry', kind: '地方記憶',
    hook: '夕陽照亮的格子，也曾是鹽工每天工作的地面。',
    story: '井仔腳保存瓦盤鹽田地景，田面細碎瓦片與水光構成容易辨認的紋理。這裡曾經進行曬鹽，產業停止後又以文化保存及體驗的方式讓人認識鹽業。看鹽田時，除了等待夕陽，也可以觀察田區、水與鹽堆之間的關係，思考曬鹽勞動如何依靠環境條件。今日景觀與過往工作現場有不同用途，理解這個轉變，能讓照片多一層地方產業記憶。',
    lookFor: '在開放動線上看瓦片、田格與水面，讀現場介紹的曬鹽步驟。',
    localLens: '把一包日用鹽接回沿海勞動，認識地方產業停止後如何保存記憶。',
    visitorLens: '先理解鹽田用途，再等光線變化；體驗是否辦理依現場公告。',
    respect: '官方景點頁載有修復及部分開放提醒，行前再確認；不自行踏入鹽田或取鹽。',
    sourceIds: ['culture-salt'], attractionId: 'beimen-jingzaijiao',
    quiz: { question: '井仔腳景觀最直接連結哪一種勞動記憶？', options: ['高山伐木', '曬鹽', '採煤'], correctIndex: 1, explanation: '瓦盤鹽田留下曬鹽產業的地景與工作記憶。' },
  },
  {
    id: 'culture-stsp', name: '國立臺灣史前文化博物館南科考古館', districtId: 'xinshi', themeId: 'people-land', kind: '文化場域',
    hook: '科技園區的地下，藏著比廠房更早的生活線索。',
    story: '南科考古館的成立，與科學園區開發時進行的遺址調查、搶救發掘及文物保存有關。館內以不同時期的器物與生活場景，呈現南科地區長時間的人群活動；貝刀、石斧與陶偶等物件，都是理解過往生活的線索。參觀時要留意出土位置、年代與研究說明，而不是僅憑外形猜用途，也不要把不同考古文化直接等同於今天單一族群的身分。',
    lookFor: '選兩件不同材料的器物，對照年代、出土脈絡及用途說明。',
    localLens: '在熟悉的科技園區之外，加入一張更長時間尺度的家鄉地圖。',
    visitorLens: '注意展覽如何從物件提出證據，分辨已知資訊與研究推論。',
    respect: '文物與模型依標示觀看，不觸摸未開放互動的展品。',
    sourceIds: ['culture-stsp-history', 'culture-stsp-gallery'], attractionId: 'xinshi-stsp-archaeology',
    quiz: { question: '南科考古館成立的重要背景是？', options: ['將港口倉庫改作商場', '舉辦大型運動賽事', '保存園區開發搶救發掘的文物'], correctIndex: 2, explanation: '館舍與南科開發時的考古調查、搶救發掘及出土文物保存相連。' },
  },
  {
    id: 'culture-kabua-sua', name: '吉貝耍部落', districtId: 'dongshan', themeId: 'people-land', kind: '生活文化',
    hook: '地名與公廨，讓人從部落自己的故事開始認識。',
    story: '吉貝耍位於東山，地名Kabua-sua與木棉意象相連，是認識西拉雅文化的地方之一。大公廨、阿立母信仰與夜祭，讓族人和土地、祖靈的關係持續被表達。這裡也是居民生活的部落，祭儀不是隨時可觀看的演出。認識吉貝耍時，應以部落解說與安排為起點，尊重當地稱呼和不同人的經驗，也不把一個部落的做法代表所有西拉雅社群。',
    lookFor: '依部落公開導覽認識地名與木棉意象，留意公廨與聚落的空間關係。',
    localLens: '從臺南不同社群的自我介紹開始，增加對同一座城市多種生活方式的理解。',
    visitorLens: '先了解可參訪範圍與導覽安排，讓在地聲音帶路。',
    respect: '祭儀、祭器和人物拍攝先取得同意；不任意觸碰供品或進入公廨祭祀空間。',
    sourceIds: ['culture-kabua-sua'], attractionId: 'dongshan-kabua-sua',
    quiz: { question: '認識吉貝耍文化時，應以什麼作為起點？', options: ['部落的解說與參訪安排', '把所有部落習俗視為相同', '只依旅客照片推測祭儀'], correctIndex: 0, explanation: '部落仍是生活與祭祀的場所，應尊重當地解說、安排及差異。' },
  },
  {
    id: 'culture-tapani', name: '噍吧哖文化園區', districtId: 'yujing', themeId: 'people-land', kind: '地方記憶',
    hook: '走進舊糖廠建築，重新理解玉井的名字與歷史。',
    story: '玉井舊稱噍吧哖，文化園區以原玉井糖廠招待所等建築，介紹1915年噍吧哖事件與地方歷史。園區於2025年改用現名，延伸關注在地文化、產業與風土。閱讀事件時，可以把人物行動放回日本殖民統治與地方處境中，留意史料如何呈現衝突及其影響。芒果之外，這裡提供另一種理解玉井的方法：從土地的名字出發，閱讀不同年代的生活。',
    lookFor: '比較歷史照片、敘述與現存建築，留意每項資料記錄的時間及對象。',
    localLens: '把家鄉農產印象與地方文史接起來，分清家族記憶、展覽敘述和史料證據。',
    visitorLens: '給事件前後的地方處境多一點閱讀時間，避免只用單一人物概括全部經驗。',
    respect: '涉及衝突與生命損失的歷史，請以尊重態度閱讀；展覽與導覽依館方公告。',
    sourceIds: ['culture-tapani'], attractionId: 'yujing-tapani-cultural-park',
    quiz: { question: '噍吧哖文化園區利用了哪一類原有建築？', options: ['海關燈塔', '玉井糖廠招待所等建築', '高山氣象站'], correctIndex: 1, explanation: '園區整修原玉井糖廠招待所等建築，用於歷史與地方文化推廣。' },
  },
  {
    id: 'culture-hakka', name: '臺南市客家文化會館', districtId: 'south', themeId: 'people-land', kind: '文化場域',
    hook: '在市區公園旁，也能找到客語與文化交流的入口。',
    story: '臺南市客家文化會館位於水萍塭公園內，結合文化展示、研習與展演等功能，讓客家文化在城市日常中有交流空間。館內介紹生活、手工藝及相關文化，也設有體驗和影音內容。參觀時可以從一件用品或一段語言開始，追問它在不同家庭與地區如何被使用；會館提供認識文化的入口，但每個人的經驗仍有差異，不宜用單一性格或物件概括所有客家人。',
    lookFor: '選一件生活用品或一段影音，比較自己熟悉的用途與展覽介紹。',
    localLens: '把附近的公共文化場館納入日常學習，認識臺南不同社群的生活經驗。',
    visitorLens: '從展示延伸到語言與文化交流，避免只把文化化約成裝飾圖案。',
    respect: '課程與展演須依報名及使用規範參與；拍攝活動中的人物先徵詢同意。',
    sourceIds: ['culture-hakka'],
    quiz: { question: '客家文化會館結合了哪些功能？', options: ['只提供停車', '只進行港口裝卸', '文化展示、研習與展演'], correctIndex: 2, explanation: '會館兼具文化展示、教育研習與交流展演等功能。' },
  },
  {
    "id": "culture-fan-salt",
    "name": "青鯤鯓扇形鹽田",
    "districtId": "jiangjun",
    "themeId": "water-industry",
    "kind": "地方記憶",
    "hook": "像扇子展開的線條，原本是為了讓鹽工方便工作。",
    "story": "青鯤鯓扇形鹽田以鹽工宿舍為中心，向外展開的扇骨包含給水、排水、給鹵的溝渠和道路。收鹽的結晶池靠近宿舍，讓工作路程縮短。這種排列先服務生產，後來才成為容易辨認的地景。鹽田停止曬鹽後，水面與田埂仍留下作業配置；看懂一條溝通往哪裡，比只記住扇形外觀更接近鹽工曾經的日常。",
    "lookFor": "沿公開道路比較田格、溝渠與道路方向，找出扇形如何展開。",
    "localLens": "把長輩記得的季節工作與田區位置對照，區分口述記憶和現場解說。",
    "visitorLens": "先想像水與鹵如何移動，再欣賞夕陽映照的幾何線條。",
    "respect": "不走上鹽田田埂或進入舊宿舍；拍攝不阻礙道路通行。",
    "sourceIds": [
      "culture-fan-salt"
    ],
    "attractionId": "jiangjun-fan-salt",
    "quiz": {
      "question": "扇形鹽田的「扇骨」主要包含什麼？",
      "options": [
        "遊樂設施的排隊欄杆",
        "給排水溝渠與道路",
        "城牆防禦壕溝"
      ],
      "correctIndex": 1,
      "explanation": "扇骨安排了水、鹵的流動與交通，結晶池則靠近鹽工宿舍。"
    }
  },
  {
    "id": "culture-qigu-lagoon",
    "name": "七股潟湖與養蚵地景",
    "districtId": "qigu",
    "themeId": "water-industry",
    "kind": "生活文化",
    "hook": "水面上的一排竹竿，也是一戶人家的工作日程。",
    "story": "七股潟湖被當地漁民稱為內海仔，潮汐交換的水域支持養蚵與捕魚。從岸上或合法遊程看見的桿架，有些連著蚵棚，有些是定置漁網，並非都為遊客搭設。不同養殖方式回應水深與潮水條件，沿海風景因此也包含生產知識。把水面當作仍在工作的地方閱讀，便能理解漁民、食物與潟湖環境彼此相依。",
    "lookFor": "從開放觀察點辨認蚵棚與定置網，留意解說如何區分用途。",
    "localLens": "從餐桌上一顆蚵的來源出發，了解地方養殖需要哪些環境條件。",
    "visitorLens": "把注意力留給正在工作的人，少用單一漂亮畫面概括漁村。",
    "respect": "不碰漁具或擅登蚵棚；搭船依合法業者與海況安排，不假定每日出航。",
    "sourceIds": [
      "culture-qigu-lagoon"
    ],
    "attractionId": "qigu-lagoon",
    "quiz": {
      "question": "潟湖水面的桿架可以連結哪些生產用途？",
      "options": [
        "蚵棚與定置漁網",
        "水庫發電機",
        "火車維修設備"
      ],
      "correctIndex": 0,
      "explanation": "故事介紹養蚵與捕魚，蚵棚及定置網都是仍與居民生計相連的設施。"
    }
  },
  {
    "id": "culture-soulangh",
    "name": "蕭壠文化園區",
    "districtId": "jiali",
    "themeId": "rural-crafts",
    "kind": "文化場域",
    "hook": "十四棟倉庫換了工作，運糖的空間成了看展的地方。",
    "story": "蕭壠文化園區由原佳里糖廠倉庫群轉用，十四棟倉庫曾由運糖鐵道串連，留下南、北兩條廊道的空間特色。糖業停止後，老倉庫經整修，逐步承接展覽、藝術家駐村與兒童藝術教育。「蕭壠」也來自西拉雅社名。一次參觀可以分開讀地名、產業與今日創作，理解文化園區如何在既有建築裡繼續長出新的生活。",
    "lookFor": "比較倉庫門口與廊道的排列，再看各館如何安排展示。",
    "localLens": "想想身邊閒置建築除了拆除，還能容納哪些公共活動。",
    "visitorLens": "看一場展覽，也花幾分鐘追問展場原來儲存什麼。",
    "respect": "作品能否觸碰依標示，尊重駐村工作空間；不攀爬舊設施。",
    "sourceIds": [
      "culture-soulangh"
    ],
    "attractionId": "jiali-soulangh",
    "quiz": {
      "question": "蕭壠文化園區的十四棟倉庫，原本屬於哪種產業？",
      "options": [
        "航空修造",
        "石油提煉",
        "糖業"
      ],
      "correctIndex": 2,
      "explanation": "園區前身是佳里糖廠倉庫群，運糖鐵道曾串連各倉庫。"
    }
  },
  {
    "id": "culture-sicao-fort",
    "name": "四草砲臺",
    "districtId": "annan",
    "themeId": "gates-harbors",
    "kind": "古蹟建築",
    "hook": "學校旁的一段牆，曾經朝向需要守備的海口。",
    "story": "四草砲臺又稱鎮海城，是清代因應鴉片戰爭威脅而設置的海防設施。當年的砲與完整防禦配置已不復見，鎮海國小旁仍可讀到城壘和砲孔。今天靠近校園的牆面，提醒我們歷史空間會被後來的城市生活包圍。沿著說明想像舊海口與防線，比把現存牆體誤認成整座砲臺，更能理解遺存的意義。",
    "lookFor": "在可通行區域觀察砲孔與城壘，不以現況補猜已消失的設施。",
    "localLens": "比較熟悉的校園周邊與解說中的舊海口，找出地景改變的線索。",
    "visitorLens": "把四草的生態行程和海防歷史並讀，認識同一片土地的不同用途。",
    "respect": "遵守校園及現場管制，不擅入教學區、不攀爬或坐上城壘。",
    "sourceIds": [
      "culture-sicao-fort"
    ],
    "quiz": {
      "question": "今日四草砲臺主要可從哪些遺存閱讀歷史？",
      "options": [
        "完整海軍艦隊",
        "城壘與砲孔",
        "大型製糖機具"
      ],
      "correctIndex": 1,
      "explanation": "現存線索包括鎮海國小旁的城壘與砲孔，並非完整保存的砲臺配置。"
    }
  },
  {
    "id": "culture-chongwen-arch",
    "name": "臺南公園重道崇文坊",
    "districtId": "north",
    "themeId": "learning-streets",
    "kind": "古蹟建築",
    "hook": "公園裡的石坊，原來為一筆支持教育的捐助而立。",
    "story": "重道崇文坊原為表揚林朝英捐資修建縣學文廟而設，不是臺南公園一開始就有的裝飾。它曾位在龍王廟前，後因都市道路改造而遷到公園燕潭旁，並經修繕保存。石坊一面記錄地方人士對教育的支持，一面也記錄城市更新如何移動歷史物件。讀字、看石材，再對照遷移經過，就能把散步接回公共生活的變化。",
    "lookFor": "辨認石匾上的文字，再看柱、橫梁與石雕如何組成牌坊。",
    "localLens": "下次到公園時，試著向同行者說明這座石坊為何不在原址。",
    "visitorLens": "將公園當作可閱讀的公共空間，留意不同年代留下的物件。",
    "respect": "不攀坐石坊、不自行拓印；拍照時保留步道與居民休憩空間。",
    "sourceIds": [
      "culture-chongwen-arch"
    ],
    "attractionId": "north-tainan-park",
    "quiz": {
      "question": "重道崇文坊最初為表揚哪一件事而設？",
      "options": [
        "捐資修建縣學文廟",
        "開闢製鹽池",
        "興建飛機跑道"
      ],
      "correctIndex": 0,
      "explanation": "林朝英支持地方教育的捐助，是石坊建立的背景。"
    }
  },
  {
    "id": "culture-magistrate",
    "name": "原臺南縣知事官邸",
    "districtId": "east",
    "themeId": "learning-streets",
    "kind": "古蹟建築",
    "hook": "一棟官邸的房間，曾接住不同年代的公務與生活。",
    "story": "原臺南縣知事官邸最初規劃為地方首長住所，日治時期也曾作為總督與皇族巡視臺南時的行館。戰後，地政事務所、東區區公所等公家機關先後使用，部分時期由多個單位共用。今天讀這棟建築，不能只停在官邸一個名稱；把用途變化排成時間線，能看見行政制度、接待需求與市民洽公如何先後進入同一處空間。",
    "lookFor": "對照館內年代說明，找出住所、接待與公務用途的差別。",
    "localLens": "從家人曾經洽公的經驗出發，理解熟悉建築不只一種身分。",
    "visitorLens": "先讀使用年代，再看建築細節，避免把所有空間都歸於同一時期。",
    "respect": "依開放範圍參觀，展覽、課程與商業服務分別看公告，不擅入工作區。",
    "sourceIds": [
      "culture-magistrate"
    ],
    "attractionId": "east-magistrate-residence",
    "quiz": {
      "question": "戰後哪些單位曾使用這座官邸？",
      "options": [
        "遠洋捕鯨船隊",
        "高山伐木工班",
        "地政事務所、東區區公所等機關"
      ],
      "correctIndex": 2,
      "explanation": "建築戰後曾由多個公家機關使用，地政與區政服務也是它的歷史。"
    }
  },
  {
    "id": "culture-sankandian",
    "name": "永康三崁店糖廠神社遺蹟",
    "districtId": "yongkang",
    "themeId": "water-industry",
    "kind": "地方記憶",
    "hook": "木造建築不在了，基座仍能讓人讀到糖廠生活。",
    "story": "三崁店糖廠內曾設有神社，將生產場所與日治時期的信仰空間連在一起。木造部分已消失，現場仍留下本殿、鳥居、石燈等設施的基座和參道線索。這裡因此不只關於製糖機器，也能讓人思考工廠中的日常與制度。參觀時應以遺構和解說為依據，不把想像的完整神社當作眼前實物；周邊林地同時也是生態棲地。",
    "lookFor": "依解說辨認基座與參道，分清現存部分和已消失的建築。",
    "localLens": "把工廠看成曾有人生活的場所，想想產業記憶除了產品還包含什麼。",
    "visitorLens": "用遺構的位置閱讀空間，留意林地裡仍在延續的生命。",
    "respect": "依現場開放及修復動線行走，不攀登基座、不捕捉或驚擾動物。",
    "sourceIds": [
      "culture-sankandian"
    ],
    "attractionId": "yongkang-sankandian",
    "quiz": {
      "question": "三崁店神社木造部分消失後，還能觀察什麼？",
      "options": [
        "完整木造殿堂",
        "基座與參道等遺構",
        "正在生產的製糖流水線"
      ],
      "correctIndex": 1,
      "explanation": "故事列出的現存線索是基座與參道，不能把已消失的木構視為仍然存在。"
    }
  },
  {
    "id": "culture-baoan",
    "name": "保安車站",
    "districtId": "rende",
    "themeId": "water-industry",
    "kind": "地方記憶",
    "hook": "祝福車票之外，木造車站也記得糖廠與通學的人。",
    "story": "保安車站原稱車路墘車站，後來為配合車路墘糖廠運輸而遷到現址。木造站房與今日旅客動線並存，使它同時是歷史建築景觀與日常交通空間。「永保安康」車票讓站名廣為人知，但車站的故事也包括產業運輸、居民出門和學生通學。看屋架與候車空間時，不妨想一想，保存老車站如何兼顧持續使用的需要。",
    "lookFor": "在開放候車區觀察木構與屋頂，並留意旅客進出動線。",
    "localLens": "記錄自己或家人的搭車路線，將個人通勤接回地方運輸史。",
    "visitorLens": "拍站名之前先讓旅客通行，再從糖廠運輸理解車站位置。",
    "respect": "月臺進出依鐵路規定；不跨越軌道，不為取景阻擋通勤旅客。",
    "sourceIds": [
      "culture-baoan"
    ],
    "attractionId": "rende-baoan-station",
    "quiz": {
      "question": "保安車站遷到現址的重要原因是？",
      "options": [
        "配合糖廠運輸",
        "改建為海港碼頭",
        "設置高山纜車"
      ],
      "correctIndex": 0,
      "explanation": "車站原稱車路墘車站，位置調整與車路墘糖廠運輸需求有關。"
    }
  },
  {
    "id": "culture-guiren-art",
    "name": "歸仁美學館",
    "districtId": "guiren",
    "themeId": "learning-streets",
    "kind": "文化場域",
    "hook": "原本辦公與維持治安的地方，現在讓人看展、讀書。",
    "story": "歸仁圓環旁的歸仁美學館，日治時期是歸仁莊役場，後來由警察分局使用，遷出後再經空間活化。今天的展覽、圖書與課程，和保留下來的拘留室形成不同年代的對照。這棟建築的轉變，不只是外觀變漂亮，而是公共空間從行政、警政用途走向文化學習。辨認保留的痕跡，能理解再利用為何也要交代原來的歷史。",
    "lookFor": "對照舊用途介紹和今日展覽動線，觀察哪些空間被保留。",
    "localLens": "想想家鄉常用的公有建築，退休之後還能如何服務居民。",
    "visitorLens": "把拘留室放回警政使用的脈絡，不只當作拍照布景。",
    "respect": "課程進行時勿打擾，展品與保留空間依館方標示使用。",
    "sourceIds": [
      "culture-guiren-art"
    ],
    "attractionId": "guiren-living-art-center",
    "quiz": {
      "question": "歸仁美學館曾有哪些公務用途？",
      "options": [
        "鹽工宿舍與鹽倉",
        "港口海關與燈塔",
        "莊役場與警察分局"
      ],
      "correctIndex": 2,
      "explanation": "館舍先後承接地方行政與警政用途，後來才轉為文化學習空間。"
    }
  },
  {
    "id": "culture-liu-chi-hsiang",
    "name": "劉啟祥美術紀念館",
    "districtId": "liuying",
    "themeId": "learning-streets",
    "kind": "文化場域",
    "hook": "從一位柳營畫家的老家，看藝術如何走向遠方再被記住。",
    "story": "出生於柳營的劉啟祥，曾到日本與法國學習繪畫，是臺灣早期留學畫家之一。他的故居長期閒置損壞後，經家屬、土地持有人與政府協調修復，成為美術紀念館。看畫家經歷時，也可以看保存工作如何完成：一棟老屋要重新向公眾敞開，除了修繕材料，還需要不同人的同意與合作。藝術史於是和地方共同記憶相遇。",
    "lookFor": "從作品介紹選一段學習經歷，再對照故居的修復說明。",
    "localLens": "找找家鄉人物的故事如何被保存，思考誰參與了這份工作。",
    "visitorLens": "不只記住洋樓外觀，也讀畫家如何往返不同地方與創作經驗。",
    "respect": "依展覽規範拍攝，不碰作品與老屋構件；各空間用途看現場標示。",
    "sourceIds": [
      "culture-liu-chi-hsiang"
    ],
    "attractionId": "liuying-liu-chi-hsiang",
    "quiz": {
      "question": "劉啟祥曾到哪兩個國家學習繪畫？",
      "options": [
        "冰島與芬蘭",
        "日本與法國",
        "巴西與秘魯"
      ],
      "correctIndex": 1,
      "explanation": "故事介紹他的留日、留法經歷，也說明故居修復需要多方合作。"
    }
  },
  {
    "id": "culture-tsung-yeh",
    "name": "總爺藝文中心",
    "districtId": "madou",
    "themeId": "rural-crafts",
    "kind": "文化場域",
    "hook": "糖廠停止製糖後，居民把共同記憶留下來。",
    "story": "總爺藝文中心前身是明治製糖的工廠與本社。糖廠關閉、廠房面臨拆除時，地方文史工作者與居民提出保留訴求，使紅樓辦公室、宿舍、餐廳等空間得以保存再用。今日園區以工藝、展覽與藝術交流為主要方向。散步時若把辦公、居住和飲食空間分開看，便會發現糖廠原本是一套工作與生活相連的地方。",
    "lookFor": "依園區解說辨認紅樓、宿舍與餐廳各自原來的用途。",
    "localLens": "想想哪些共同生活記憶值得留下，以及保存需要誰一起參與。",
    "visitorLens": "選一種工藝深入看，再回頭觀察展館原本服務哪些工作者。",
    "respect": "老樹、建物與展示品依保護規範觀賞；工作坊及展期另查館方公告。",
    "sourceIds": [
      "culture-tsung-yeh"
    ],
    "attractionId": "madou-tsung-yeh",
    "quiz": {
      "question": "總爺部分建築得以保留，與哪一項行動有關？",
      "options": [
        "地方居民與文史工作者提出保存訴求",
        "將所有舊建築移到海上",
        "停止所有文化使用"
      ],
      "correctIndex": 0,
      "explanation": "關廠與拆除之際，地方的保存訴求促成後續修復與再利用。"
    }
  },
  {
    "id": "culture-longhu",
    "name": "赤山龍湖巖",
    "districtId": "liujia",
    "themeId": "faith-festivals",
    "kind": "生活文化",
    "hook": "看起來像木頭的構造，也可能藏著新材料的手藝。",
    "story": "六甲赤山龍湖巖的現有建築經過改建，並非整座都可視為早期原貌。寺內可從門神姿態、觀音石雕與磨石子書法讀到不同技藝，也能看見鋼筋水泥模仿木構、剪黏結合西式山牆的做法。材料改變，匠師仍透過造型與手工延續表達。這裡適合練習分辨建築年代和信仰歷史，兩者相關，卻不一定同樣古老。",
    "lookFor": "選一處仿木構與一處石雕，比較材料、線條和表面質感。",
    "localLens": "從家中常見的磨石子出發，找出寺廟如何把生活材料做成文字與圖像。",
    "visitorLens": "少追問「有多老」，多觀察不同年代工藝如何一起存在。",
    "respect": "保持寺院安靜，不觸摸雕刻或干擾禮佛；攝影依現場規範。",
    "sourceIds": [
      "culture-longhu"
    ],
    "attractionId": "liujia-chishan-longhu",
    "quiz": {
      "question": "赤山龍湖巖有哪些材料與形式交會的例子？",
      "options": [
        "全館都由冰塊雕成",
        "只保留未加工岩洞",
        "水泥仿木構與剪黏結合西式山牆"
      ],
      "correctIndex": 2,
      "explanation": "故事以這些做法說明材料變化與手工技藝可以同時存在。"
    }
  },
  {
    "id": "culture-shanhua-market",
    "name": "善化牛墟",
    "districtId": "shanhua",
    "themeId": "rural-crafts",
    "kind": "生活文化",
    "hook": "名字還叫牛墟，交易的東西卻跟著農村生活改變。",
    "story": "牛墟原是農業社會交易耕牛的市場。善化牛墟的牛隻買賣已成歷史，現在延續為定期農民市集，可見種苗、農具、竹編籃具與生活用品等不同攤位。從耕牛轉向多樣商品，反映農村生產與採買需求的改變。來這裡不只找稀奇物件，也可以觀察哪些工具仍被需要，讓市場成為理解勞動、修補與日常消費的地方。",
    "lookFor": "比較農用工具與生活用品，想想每件物品解決什麼工作。",
    "localLens": "向熟悉的長輩請教一件舊工具，再和攤商或解說核對用途。",
    "visitorLens": "先看交易與使用情境，別把還在營業的市集當成展示櫥窗。",
    "respect": "開市與休市另查當期公告；拍攝攤商先詢問，不擋住交易或裝卸。",
    "sourceIds": [
      "culture-shanhua-market"
    ],
    "quiz": {
      "question": "今日善化牛墟主要延續為什麼樣的場所？",
      "options": [
        "仍只交易耕牛的市場",
        "農具與生活用品等定期市集",
        "船舶修理工場"
      ],
      "correctIndex": 1,
      "explanation": "牛隻交易已成歷史，市集以多樣農用與日常商品繼續服務地方生活。"
    }
  },
  {
    "id": "culture-zhenhu",
    "name": "蘇厝第一代天府真護宮",
    "districtId": "anding",
    "themeId": "faith-festivals",
    "kind": "生活文化",
    "hook": "不用等祭典，也能從一艘王船看見工藝與地方心意。",
    "story": "曾文溪旁的真護宮主祀五府千歲，建廟敘事與漂流王船相連，這屬地方信仰記憶。廟方保存的永祀王船，讓平日也有理解王船文化的入口；船上縮小的廟宇形船艙、旗幟與彩繪，各有儀式意義。閱讀時先區分傳說、實物和當年度祭儀安排，再看裝飾如何把信眾的願望放進一艘船，而不把它當作日常交通工具。",
    "lookFor": "依開放指引觀察船艙造型、旗幟與彩繪的不同位置。",
    "localLens": "從熟悉的王船祭經驗延伸，了解平日保存與維護也需要人力。",
    "visitorLens": "請解說協助辨認裝飾寓意，避免只憑外形推測祭儀用途。",
    "respect": "不登船、不觸碰祭器；祭典日期及參觀安排依廟方最新公告。",
    "sourceIds": [
      "culture-zhenhu"
    ],
    "attractionId": "anding-zhenhu-temple",
    "quiz": {
      "question": "永祀王船最適合放在哪一種脈絡中理解？",
      "options": [
        "地方信仰、儀式與工藝",
        "一般渡輪時刻表",
        "糖廠運料車隊"
      ],
      "correctIndex": 0,
      "explanation": "王船的船艙、旗幟與彩繪承載祭儀意義，並不是日常渡輪。"
    }
  },
  {
    "id": "culture-guanziling",
    "name": "關子嶺溫泉公園與寶泉露頭",
    "districtId": "baihe",
    "themeId": "water-industry",
    "kind": "地方記憶",
    "hook": "一處冒出的泉水，如何讓山城長出旅宿與街道？",
    "story": "關子嶺以泥漿溫泉聞名，日治時期的開發使泉水與山城的遊憩生活逐漸連結。從溫泉公園的寶泉橋，可在規定範圍內認識溫泉源頭之一的寶泉露頭。把老街和露頭放在一起看，能理解自然資源如何帶動住宿、交通與地方服務。這張卡閱讀的是地方發展與用水文化，不把歷史上的溫泉美稱當成現代療效保證。",
    "lookFor": "先讀寶泉露頭的解說，再觀察公園與街道如何接近泉源。",
    "localLens": "比較自己記得的山城樣貌，哪些設施因溫泉而逐漸形成。",
    "visitorLens": "除了選擇泡湯，也走一段公共空間，閱讀水源與聚落的關係。",
    "respect": "不跨越泉源防護柵欄、不直接碰觸湧泉；各設施使用依管理者規範。",
    "sourceIds": [
      "culture-guanziling"
    ],
    "attractionId": "baihe-guanziling-spring",
    "quiz": {
      "question": "寶泉露頭提供哪一種地方文化線索？",
      "options": [
        "遠洋貨輪裝卸",
        "高山採礦軌道",
        "溫泉水源與山城發展"
      ],
      "correctIndex": 2,
      "explanation": "露頭是溫泉源頭之一，可把泉水與關子嶺的旅宿、街道及服務發展連起來。"
    }
  },
  {
    "id": "culture-toushe",
    "name": "頭社公廨（太上龍頭忠義廟）",
    "districtId": "danei",
    "themeId": "people-land",
    "kind": "生活文化",
    "hook": "名稱裡雖有「廟」，認識它仍要從頭社的文化脈絡開始。",
    "story": "大內頭社的太上龍頭忠義廟，是西拉雅族人祭祀太祖的公廨。建築保留三面有牆、沒有廟門的形式，內部東、中、西三室與不同部落相連；祀壺也是認識祭祀空間的重要物件。這些安排不能只套用一般漢人廟宇的解讀方式。從地方說明出發，辨認名稱、空間與社群關係，才能看見頭社本身的文化，而非把各部落混為一談。",
    "lookFor": "在同意的參觀範圍觀察三面牆與分室配置，閱讀各室介紹。",
    "localLens": "比較頭社與其他社群的自我介紹，留意相似之中仍有不同。",
    "visitorLens": "先聽在地解說再理解祭器，讓社群的稱呼與經驗居於中心。",
    "respect": "祭儀不是隨到隨看的表演；進入、拍照及活動參與先詢問，不碰祀壺。",
    "sourceIds": [
      "culture-toushe"
    ],
    "attractionId": "danei-toushe-shrine",
    "quiz": {
      "question": "頭社公廨內東、中、西三室的安排與什麼相連？",
      "options": [
        "三種製糖程序",
        "不同部落的祭祀空間",
        "三條國際航線"
      ],
      "correctIndex": 1,
      "explanation": "東、中、西三室與不同部落的祭祀空間相連，需從地方社群理解。"
    }
  },
  {
    "id": "culture-jiang-settlement",
    "name": "鹿陶洋江家古厝",
    "districtId": "nanxi",
    "themeId": "rural-crafts",
    "kind": "地方記憶",
    "hook": "一排排護龍，記錄一家族如何把住居向兩側展開。",
    "story": "鹿陶洋江家古厝是大型單姓傳統聚落，四進三院的主軸外，兩側還伸出多排護龍。拜亭、公廳、神明廳與祖祀堂等空間，把家族共同使用和各房居住的需求放在同一組建築裡。閱讀古厝不只看屋齡，也看房舍如何相互連接。這裡仍有住居與家族使用的性質，老屋保存要同時顧到生活、維護與參訪，不能把整個聚落當成無人的展館。",
    "lookFor": "依公開動線看主軸與兩側房舍的排列，分清共用和居住空間。",
    "localLens": "從家族聚會的經驗想想，共用空間如何協調不同成員的生活。",
    "visitorLens": "先了解開放範圍，再以建築配置認識聚落，避免自行探入房舍。",
    "respect": "住家、祭祀及修復區不擅入；參訪安排先向管理單位確認。",
    "sourceIds": [
      "culture-jiang-settlement"
    ],
    "quiz": {
      "question": "江家古厝兩側多排房舍，常用哪個名稱來描述？",
      "options": [
        "護龍",
        "砲墩",
        "蚵棚"
      ],
      "correctIndex": 0,
      "explanation": "主軸之外的護龍向兩側展開，形成大型家族住居聚落的配置。"
    }
  },
  {
    "id": "culture-nanhua-reservoir",
    "name": "南化水庫",
    "districtId": "nanhua",
    "themeId": "water-industry",
    "kind": "地方記憶",
    "hook": "眼前是湖景，背後也是城市每天需要的供水工作。",
    "story": "南化水庫是臺南重要的供水水庫，從台20線一帶可讀到水域與山地聚落的關係。壩下周邊也承載噍吧哖事件相關的歷史記憶，水利設施與地方故事在同一片地景交會。看水庫時，可以先問它服務哪些生活需求，再分開閱讀工程與歷史解說。漂亮湖面並不表示整個水域都是遊憩空間，持續供水與設施維護仍是重要用途。",
    "lookFor": "在合法觀景點對照水庫用途介紹，留意供水設施與遊憩區的界線。",
    "localLens": "把日常節水或停水經驗接回水源，思考城市與上游的關係。",
    "visitorLens": "用兩條線閱讀：一條是公共供水，一條是地方歷史，避免混成同一故事。",
    "respect": "不進入庫區水域或管制設施；道路與觀景點是否開放另查公告。",
    "sourceIds": [
      "culture-nanhua-reservoir"
    ],
    "attractionId": "nanhua-reservoir",
    "quiz": {
      "question": "南化水庫在今日城市生活中的重要角色是？",
      "options": [
        "替遠洋商船補給",
        "公共供水",
        "製作陶土窯燒"
      ],
      "correctIndex": 1,
      "explanation": "故事指出水庫是臺南的重要供水設施，湖景之外仍有公共用水功能。"
    }
  },
  {
    "id": "culture-zuozhen-fossil",
    "name": "臺南左鎮化石園區",
    "districtId": "zuozhen",
    "themeId": "people-land",
    "kind": "文化場域",
    "hook": "一間學校的收藏，如何走到今天的五座展館？",
    "story": "左鎮化石園區的歷史，不只是一批化石被放進櫥窗。菜寮溪的發現吸引研究者，也有地方採集者與光榮國小師生長年整理、保存；校內鄉土文物室逐步促成化石館，後來再整合成園區。今日展示把自然史、西拉雅文物和研究工作放在不同脈絡中。看展時留意出土、分類與解說的過程，就能理解地方好奇心如何累積成公共知識。",
    "lookFor": "選一件化石追讀發現與研究說明，再看館史中的地方參與。",
    "localLens": "想想學校或社區保留的物件，如何整理後成為大家能讀懂的資料。",
    "visitorLens": "區分化石、考古文物與研究推論，不把不同年代的事物混為同時。",
    "respect": "只使用館方開放的互動設施；不自行到溪床採集或移動疑似化石。",
    "sourceIds": [
      "culture-zuozhen-history",
      "culture-zuozhen-intro"
    ],
    "attractionId": "zuozhen-fossil-park",
    "quiz": {
      "question": "化石館發展過程中，哪一項地方參與很重要？",
      "options": [
        "港口船員報關",
        "糖廠工人調度列車",
        "地方採集者與國小師生整理收藏"
      ],
      "correctIndex": 2,
      "explanation": "故事介紹地方採集者及光榮國小師生的保存工作，收藏逐步走向公共展館。"
    }
  },
  {
    "id": "culture-shanxi",
    "name": "關廟山西宮",
    "districtId": "guanmiao",
    "themeId": "faith-festivals",
    "kind": "生活文化",
    "hook": "拜拜、買菜與看彩繪，可以在同一段廟口路上發生。",
    "story": "山西宮主祀關聖帝君，關廟地名也與這座廟的信仰相連。廟埕緊接市場，祭拜與採買交織成地方日常；現有建築歷經修建，門神、壁畫與樑枋畫則可讀到潘麗水、潘岳雄等彩繪藝師的工作。看一幅人物畫，再回頭觀察廟口的人流，便能理解廟宇如何同時承接信仰、技藝與生活，而不是只在大型祭典時才有故事。",
    "lookFor": "選一幅門神或壁畫讀題材，再比較畫中人物姿勢與配色。",
    "localLens": "逛市場時多留幾分鐘看彩繪，替平常採買路線加上一段工藝觀察。",
    "visitorLens": "把廟埕與市場一起看，理解地方文化如何在每天的往來中延續。",
    "respect": "不干擾祭拜與市場交易；拍攝人物先詢問，祭典路線依當年公告。",
    "sourceIds": [
      "culture-shanxi"
    ],
    "attractionId": "guanmiao-shanxi-temple",
    "quiz": {
      "question": "山西宮廟埕與市場相接，最能呈現什麼？",
      "options": [
        "信仰與日常採買交織",
        "只有祭典日才有人使用",
        "港口與海關共用碼頭"
      ],
      "correctIndex": 0,
      "explanation": "廟宇與市場相鄰，祭拜、採買與工藝欣賞都能進入平日生活。"
    }
  },
];
