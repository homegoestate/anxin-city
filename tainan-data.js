// 地方特色資料快照；不是即時新聞或年度活動日曆。
// 四組是遊戲探索主題，不是行政分區圖，也不表示特色只存在於該區。
// season 的「全年」指主題可全年認識，不保證場館每日開放。
// livingTip 是原創生活觀察建議，不是官方調查、房價預測或開發承諾。
// 花期、產期會受天候影響；活動與開放資訊仍以當年官方公告為準。

export const tainanReviewedAt = '2026-10-25';

export const tainanRegions = [
  { id: 'coast', name: '海風與鹽田', kicker: '濕地・鹽業・地方信仰', description: '從鹽田、漁村走進廟口與濕地，把七個地方串成一條探索線。這是遊戲主題分組，並非行政分區。', color: '#4c969a', icon: '🌊' },
  { id: 'city', name: '府城與日常', kicker: '古街・藝文・生活步調', description: '從府城古蹟走向閱讀、藝文與花卉生活，認識八個地方的不同面貌。這是遊戲主題分組，並非行政分區。', color: '#b87562', icon: '🏘️' },
  { id: 'plains', name: '田野與聚落', kicker: '農產・水利・老街故事', description: '沿著平原的農村、鐵道與街市，收集十一個地方的生活線索。這是遊戲主題分組，並非行政分區。', color: '#a58c45', icon: '🌾' },
  { id: 'hills', name: '淺山與果香', kicker: '山林・果園・自然學堂', description: '讓果香、花季、博物館與地景帶路，探索十一個地方。這是遊戲主題分組，並非行政分區。', color: '#688d65', icon: '⛰️' },
];

const source = (id, title, url) => ({ id, title, url, reviewedAt: tainanReviewedAt });

export const tainanSources = [
  source('administrative-districts', '臺南市政府｜行政區域：37 區名單', 'https://www.tainan.gov.tw/cp.aspx?lang=en&n=13293'),
  source('city-walk', '臺南市政府觀光旅遊局｜城市散策行', 'https://www.twtainan.net/zh-tw/district/0/'),
  source('coast-tour', '臺南市政府觀光旅遊局｜西濱海遊憩', 'https://www.twtainan.net/zh-tw/district/1/'),
  source('farm-tour', '臺南市政府觀光旅遊局｜賞花農遊趣', 'https://www.twtainan.net/zh-tw/district/2/'),
  source('south-tour', '臺南市政府觀光旅遊局｜南關山海遊', 'https://www.twtainan.net/zh-tw/district/3/'),
  source('fruit-tour', '臺南市政府觀光旅遊局｜採果森呼吸', 'https://www.twtainan.net/zh-tw/district/4/'),
  source('culture-tour', '臺南市政府觀光旅遊局｜人文巡禮行', 'https://www.twtainan.net/zh-tw/district/5/'),
  source('museum-tour', '臺南市政府觀光旅遊局｜樂玩山博線', 'https://www.twtainan.net/zh-tw/district/6/'),
  source('science-tour', '臺南市政府觀光旅遊局｜南科親子遊', 'https://www.twtainan.net/zh-tw/district/7/'),
  source('agricultural-seasons', '臺南市政府農業局｜臺南農產分布及產期', 'https://agron.tainan.gov.tw/cp.aspx?n=34637'),
  source('spring-flowers', '臺南市政府觀光旅遊局｜春季賞花地圖', 'https://www.twtainan.net/zh-tw/attractions/detail/6104/'),
  source('houbi-orchids', '農業部農業易遊網｜後壁蘭花香與時光之旅', 'https://ezgo.ardswc.gov.tw/zh-tw/tour/1332/'),
  source('baihe-lotus', '臺南市白河區公所｜白河蓮花季節與賞蓮資訊', 'https://baihe.tainan.gov.tw/News_Content.aspx?n=20859&s=8748666'),
  source('winter-birds', '台江國家公園管理處｜十份里與黑面琵鷺賞鳥亭', 'https://www.tjnp.gov.tw/ch/sglarticle/shifen-village'),
  source('meiling', '西拉雅國家風景區管理處｜梅嶺風景區', 'https://www.siraya-nsa.gov.tw/zh-tw/attractions/detail/26'),
  source('guiren-flowers', '臺南市政府觀光旅遊局｜歸仁七甲花卉區', 'https://www.twtainan.net/zh-tw/attractions/detail/656/'),
];

function quiz(question, answer, distractors, correctId, explanation) {
  let nextDistractor = 0;
  return {
    question,
    options: ['a', 'b', 'c'].map(id => ({ id, text: id === correctId ? answer : distractors[nextDistractor++] })),
    correctId,
    explanation,
  };
}

export const tainanDistricts = [
  {
    id: 'beimen', name: '北門區', region: 'coast', tagline: '鹽田映著天光', icon: '🧂',
    feature: '井仔腳瓦盤鹽田保留曬鹽地景。看鹽田與水面光影，也能認識沿海聚落的產業記憶。',
    season: '全年', livingTip: '走訪住家周邊時，觀察海風、門窗五金維護與採買路程。', sourceIds: ['coast-tour'],
    quiz: quiz('這張北門卡介紹的曬鹽地景是？', '井仔腳瓦盤鹽田', ['南瀛天文館', '知事官邸'], 'a', '井仔腳瓦盤鹽田是認識北門鹽業地景的入口。'),
  },
  {
    id: 'jiangjun', name: '將軍區', region: 'coast', tagline: '扇形鹽田的線條', icon: '🪭',
    feature: '青鯤鯓扇形鹽田留下有別於方格鹽田的構圖。鹽業地景成為認識將軍海線的一條線索。',
    season: '全年', livingTip: '平日與假日各走一次生活路線，記錄漁港周邊車流及停車位置。', sourceIds: ['coast-tour'],
    quiz: quiz('青鯤鯓這處鹽田最容易記住的造型是？', '扇形', ['圓形劇場', '高山梯田'], 'b', '官方旅遊介紹以青鯤鯓扇形鹽田呈現將軍的人文地景。'),
  },
  {
    id: 'qigu', name: '七股區', region: 'coast', tagline: '濕地裡的冬日訪客', icon: '🐦',
    feature: '七股的濕地與魚塭連結養殖、生態和候鳥故事。黑面琵鷺是秋冬至翌春值得認識的訪客。',
    season: '全年；候鳥觀察常見於秋冬至翌春', livingTip: '把景點距離和日常採買分開看，實走通勤路線並觀察風向與遮蔭。', sourceIds: ['coast-tour', 'winter-birds'],
    quiz: quiz('七股濕地這張卡介紹的度冬候鳥是？', '黑面琵鷺', ['企鵝', '鴕鳥'], 'c', '七股是黑面琵鷺在臺灣的重要度冬棲地之一。'),
  },
  {
    id: 'xuejia', name: '學甲區', region: 'coast', tagline: '從廟宇讀工藝', icon: '🏮',
    feature: '學甲慈濟宮保存交趾陶等傳統工藝。走進地方信仰空間，也可以留意人物、色彩與裝飾細節。',
    season: '全年；春季另有蜀葵花景', livingTip: '廟口生活圈可分平日與活動日觀察，留意通行、噪音及停車安排。', sourceIds: ['coast-tour', 'spring-flowers'],
    quiz: quiz('學甲慈濟宮這張卡邀請你觀察哪項工藝？', '交趾陶', ['製糖離心機', '水庫閘門'], 'a', '慈濟宮的交趾陶是官方介紹的文化特色之一。'),
  },
  {
    id: 'jiali', name: '佳里區', region: 'coast', tagline: '老建築裡看展演', icon: '🎨',
    feature: '蕭壠文化園區把老建築、綠地與展演放在一起。認識佳里，可以先從一場展覽與一段散步開始。',
    season: '全年', livingTip: '實走住家到市場、公園與常用服務的路線，別只用開車時間判斷便利。', sourceIds: ['culture-tour'],
    quiz: quiz('佳里這張卡推薦從哪個藝文場域開始？', '蕭壠文化園區', ['梅嶺風景區', '七股潟湖'], 'b', '蕭壠文化園區是佳里可認識展演與老建築的場域。'),
  },
  {
    id: 'xigang', name: '西港區', region: 'coast', tagline: '廟口連著地方記憶', icon: '🥁',
    feature: '慶安宮與西港香讓地方祭祀文化成為認識西港的入口。欣賞祭典時，也能留意社群如何共同參與。',
    season: '全年可認識文化；香科辦理依官方公告', livingTip: '若在廟宇或主要道路旁看房，分平日與祭典時段觀察聲音及替代通行路線。', sourceIds: ['culture-tour'],
    quiz: quiz('西港香在這張卡對應的文化主題是？', '王醮祭典', ['高山滑雪', '深海潛航'], 'c', '官方旅遊資料以王醮民俗介紹西港香。'),
  },
  {
    id: 'annan', name: '安南區', region: 'coast', tagline: '走進台江水綠', icon: '🌿',
    feature: '四草綠色隧道以水道與紅樹林景觀讓人認識台江。從水邊植物開始，能看見與市區不同的生態面貌。',
    season: '全年', livingTip: '把實際通勤、採買和休閒路線各走一次，雨後再留意住家周邊排水。', sourceIds: ['coast-tour'],
    quiz: quiz('四草綠色隧道主要讓人觀察什麼？', '紅樹林水道', ['冰河地形', '高山針葉林'], 'a', '四草綠色隧道是官方介紹的紅樹林觀察景點。'),
  },
  {
    id: 'anping', name: '安平區', region: 'city', tagline: '沿著劍獅逛老街', icon: '🦁',
    feature: '劍獅與老街是安平的人文辨識線索。放慢腳步看巷弄細節，能讓古蹟之外的地方故事更鮮明。',
    season: '全年', livingTip: '在不同時段走訪，分清觀光人潮、平日採買與住家停車是否方便。', sourceIds: ['city-walk'],
    quiz: quiz('這張安平卡以哪個形象作為巷弄線索？', '劍獅', ['火鶴花', '天文望遠鏡'], 'b', '劍獅是官方安平旅遊介紹中的地方文化線索。'),
  },
  {
    id: 'west-central', name: '中西區', region: 'city', tagline: '古蹟就在日常旁', icon: '🏯',
    feature: '赤崁樓周邊串起古蹟、廟宇與街市。中西區的散步樂趣，是在日常街道裡讀到歷史。',
    season: '全年', livingTip: '沿著巷弄實走一圈，留意採光、夜間聲音、裝卸貨與停車安排。', sourceIds: ['city-walk'],
    quiz: quiz('這張中西區卡從哪個古蹟周邊開始散步？', '赤崁樓', ['南化水庫', '林初埤木棉道'], 'c', '赤崁樓及周邊古蹟是府城散步的重要線索。'),
  },
  {
    id: 'north', name: '北區', region: 'city', tagline: '鎮北坊的巷弄步調', icon: '🚶',
    feature: '鎮北坊的古蹟與巷弄，連著北區的庶民生活。逛街之外，也能從市場和老街口認識城市節奏。',
    season: '全年', livingTip: '從住家步行到市場或公車站，實測轉角視線、人行空間與夜間照明。', sourceIds: ['city-walk'],
    quiz: quiz('北區這張卡介紹哪個文化聚落？', '鎮北坊', ['菁寮', '青鯤鯓'], 'a', '鎮北坊位於北區，官方旅遊資料以其古蹟與巷弄介紹庶民文化。'),
  },
  {
    id: 'east', name: '東區', region: 'city', tagline: '從官邸讀建築', icon: '🏛️',
    feature: '知事官邸等歷史建築，是東區認識城市文化的入口。看建築細節，也能把散步和地方歷史連在一起。',
    season: '全年', livingTip: '把上下學、上下班與晚間三種時段分開觀察，確認路口車流和生活噪音。', sourceIds: ['city-walk'],
    quiz: quiz('東區這張卡提到的歷史建築是？', '知事官邸', ['井仔腳鹽田', '南瀛天文館'], 'b', '知事官邸是官方東區旅遊介紹列出的歷史建築。'),
  },
  {
    id: 'south', name: '南區', region: 'city', tagline: '海岸與聚落相遇', icon: '🌅',
    feature: '黃金海岸與喜樹、灣裡等聚落，帶出南區的海邊生活。海景之外，巷弄和地方飲食也值得慢慢認識。',
    season: '全年', livingTip: '海邊休閒與日常生活分開評估，觀察風向、門窗維護和晚間返家路線。', sourceIds: ['south-tour'],
    quiz: quiz('這張南區卡介紹的海岸景點是？', '黃金海岸', ['烏山頭水庫', '梅嶺'], 'c', '黃金海岸及鯤喜灣聚落是官方南區旅遊介紹的內容。'),
  },
  {
    id: 'yongkang', name: '永康區', region: 'city', tagline: '閱讀也是城市旅行', icon: '📚',
    feature: '臺南市立圖書館新總館位於永康。用一次閱讀或親子活動，能從不同角度認識這裡的公共生活。',
    season: '全年', livingTip: '實走住家到圖書館、公園和日常採買點，確認路口與步行距離適合家人。', sourceIds: ['city-walk'],
    quiz: quiz('永康這張卡介紹的公共文化設施是？', '市立圖書館新總館', ['左鎮化石園區', '七股鹽山'], 'a', '官方旅遊資料將市立圖書館新總館列為永康的知性旅遊場域。'),
  },
  {
    id: 'rende', name: '仁德區', region: 'city', tagline: '博物館裡外看藝術', icon: '🎻',
    feature: '奇美博物館是仁德的藝文入口之一。欣賞展覽，也可把園區景觀納入一段認識地方的散步。',
    season: '全年', livingTip: '比較平日通勤與假日景點車流，確認住家到採買和醫療服務的實際路程。', sourceIds: ['south-tour'],
    quiz: quiz('仁德這張卡以哪座博物館作為藝文入口？', '奇美博物館', ['南瀛天文館', '左鎮化石園區'], 'b', '奇美博物館位於仁德，也是官方推薦的藝文旅遊場域。'),
  },
  {
    id: 'guiren', name: '歸仁區', region: 'city', tagline: '七甲的一片花草', icon: '🪴',
    feature: '七甲花卉區聚集花草、盆栽與園藝展售。從植物的選擇與照顧，也能認識歸仁的一種地方產業。',
    season: '全年', livingTip: '想在家種植物，可現場確認陽台日照、通風與澆水排水，不只看裝潢照片。', sourceIds: ['guiren-flowers'],
    quiz: quiz('歸仁七甲在這張卡介紹的特色是？', '花卉與園藝', ['曬鹽', '天文觀測'], 'c', '官方介紹七甲花卉區為花草與園藝展售的集中場域。'),
  },
  {
    id: 'xinying', name: '新營區', region: 'plains', tagline: '鐵道留下的產業記憶', icon: '🚂',
    feature: '新營鐵道文化園區保留車輛與鐵道文物。走近這些物件，可以從運輸線索認識地方產業歷史。',
    season: '全年', livingTip: '到工作地、車站與市場實走或試乘，確認等候時間和最後一段步行。', sourceIds: ['farm-tour'],
    quiz: quiz('這張新營卡從哪種文化認識地方產業？', '鐵道文化', ['梅花栽培', '紅樹林生態'], 'a', '新營鐵道文化園區保存車輛和鐵道相關文物。'),
  },
  {
    id: 'yanshui', name: '鹽水區', region: 'plains', tagline: '月津街區的節慶記憶', icon: '🎆',
    feature: '月津港與老街承接鹽水的城鎮記憶，元宵蜂炮則呈現地方民俗。平日散步和節慶造訪，會看見不同節奏。',
    season: '全年；蜂炮在農曆元宵前後，依當年公告', livingTip: '看房時分平日與節慶時段觀察，確認交通、聲音與住家出入口安排。', sourceIds: ['farm-tour'],
    quiz: quiz('鹽水這張卡介紹的元宵民俗是？', '蜂炮', ['端午龍舟', '中秋採柚'], 'b', '鹽水武廟在元宵舉辦蜂炮民俗活動，實際安排依當年公告。'),
  },
  {
    id: 'houbi', name: '後壁區', region: 'plains', tagline: '米鄉與蘭花相遇', icon: '🌾',
    feature: '菁寮聚落讓人看見後壁的稻作生活，蘭花產業則帶來另一種農業面貌。地方故事可以從田野，也可以從花開始。',
    season: '全年；蘭展常見於早春，依當年公告', livingTip: '從住家實走到常用採買與交通站點，留意農忙時段的車流和道路使用。', sourceIds: ['houbi-orchids'],
    quiz: quiz('這張後壁卡把哪兩種農業生活放在一起？', '稻作與蘭花', ['咖啡與海鹽', '菱角與高山茶'], 'c', '官方農遊資料同時介紹後壁米鄉、菁寮與蘭花產業。'),
  },
  {
    id: 'liuying', name: '柳營區', region: 'plains', tagline: '從牛奶認識農村', icon: '🥛',
    feature: '牛奶是農業局列出的柳營地方農產之一。從一杯乳品出發，可以把日常飲食與酪農產業連在一起。',
    season: '全年', livingTip: '不同時段實地感受環境、氣味與運輸車流，再確認採買和通勤是否合用。', sourceIds: ['agricultural-seasons'],
    quiz: quiz('這張柳營卡用哪項農產認識地方？', '牛奶', ['海鹽', '梅子'], 'a', '臺南農產分布表將牛奶列為柳營的特色農產之一。'),
  },
  {
    id: 'madou', name: '麻豆區', region: 'plains', tagline: '夏末秋初的一口柚香', icon: '🍈',
    feature: '文旦是麻豆鮮明的農產線索；總爺藝文中心則讓人看見糖業留下的建築。果香與老建築能串成不同角度的小旅行。',
    season: '全年；文旦產期常見於8–9月', livingTip: '把果園和觀光印象放到一旁，實看工作日採買、停車及住家周邊道路。', sourceIds: ['culture-tour', 'agricultural-seasons'],
    quiz: quiz('麻豆這張卡介紹的柚類農產是？', '文旦', ['白蓮霧', '菱角'], 'b', '文旦是麻豆的特色農產之一，並非只在麻豆生產。'),
  },
  {
    id: 'xiaying', name: '下營區', region: 'plains', tagline: '農產裡的黑豆線索', icon: '🫘',
    feature: '黑豆是下營的特色農產之一。認識地方不只看景點，也能從日常飲食背後的作物開始。',
    season: '全年可認識農產文化', livingTip: '實地查看鄰近農田、加工與住家出入動線，並記錄生活服務的距離。', sourceIds: ['agricultural-seasons'],
    quiz: quiz('這張下營卡選哪種作物當作地方線索？', '黑豆', ['咖啡', '梅子'], 'c', '臺南市農業局把黑豆列入下營的特色農產。'),
  },
  {
    id: 'liujia', name: '六甲區', region: 'plains', tagline: '火鶴花點亮農村', icon: '🌺',
    feature: '火鶴花是六甲的特色花卉產業。從花形、色彩到栽培，可以用不同於賞景的方式認識農村。',
    season: '全年可認識花卉產業', livingTip: '看房時實測工作地與採買路線，農村景觀和日常便利分開評估。', sourceIds: ['fruit-tour', 'agricultural-seasons'],
    quiz: quiz('這張六甲卡介紹的花卉產業是？', '火鶴花', ['高山杜鵑', '梅花'], 'a', '官方區域旅遊與農產資料都介紹六甲的火鶴花。'),
  },
  {
    id: 'guantian', name: '官田區', region: 'plains', tagline: '菱角與水的故事', icon: '🛶',
    feature: '官田的菱角產業與埤塘景觀相互連結。沿著水利與農作線索，可認識不同於街市的地方生活。',
    season: '全年；菱角產期常見於9–12月', livingTip: '實走水邊與田間道路時，觀察照明、通行寬度和雨後路況。', sourceIds: ['culture-tour', 'agricultural-seasons'],
    quiz: quiz('官田這張卡介紹哪種與水田相關的農產？', '菱角', ['咖啡豆', '白蓮霧'], 'b', '菱角是官田的重要地方農產，官方資料也介紹其採收景象。'),
  },
  {
    id: 'shanhua', name: '善化區', region: 'plains', tagline: '牛墟裡看見生活百貨', icon: '🧺',
    feature: '善化牛墟保留農業市集的生活氣息。逛市集時，可以從器具、食物和交易方式認識地方日常。',
    season: '全年可認識市集文化；開市安排依公告', livingTip: '尖峰通勤與市集時段分開實測，確認住家周邊停車與步行安全。', sourceIds: ['science-tour'],
    quiz: quiz('這張善化卡的地方市集叫什麼？', '牛墟', ['花市拍賣場', '港口魚市場'], 'c', '官方旅遊資料以牛墟介紹善化的農業市集文化。'),
  },
  {
    id: 'xinshi', name: '新市區', region: 'plains', tagline: '科技印象之外的果香', icon: '🍐',
    feature: '白蓮霧是新市的特色農產之一。認識這項水果，也能看見科技園區印象之外的農村面貌。',
    season: '全年可認識農產文化；採收依產地資訊', livingTip: '實測上班尖峰與非尖峰通勤，並確認每天會用到的採買和步行路線。', sourceIds: ['science-tour', 'agricultural-seasons'],
    quiz: quiz('這張新市卡介紹哪種地方水果？', '白蓮霧', ['梅子', '文旦'], 'a', '官方新市旅遊與農業資料都列出白蓮霧。'),
  },
  {
    id: 'anding', name: '安定區', region: 'plains', tagline: '從胡麻讀農村', icon: '🌱',
    feature: '胡麻是安定的特色農產之一。把作物與日常飲食連在一起，是認識農村生活的一種方式。',
    season: '全年可認識農產文化', livingTip: '觀察住家附近道路與農機出入，並把實際通勤、採買距離寫下來。', sourceIds: ['agricultural-seasons'],
    quiz: quiz('這張安定卡選用哪項農產作為線索？', '胡麻', ['咖啡', '梅子'], 'b', '臺南市農業局將胡麻列為安定的特色農產。'),
  },
  {
    id: 'baihe', name: '白河區', region: 'hills', tagline: '蓮田到溫泉的季節旅行', icon: '🪷',
    feature: '白河的蓮田與關子嶺溫泉呈現不同的旅行節奏。夏季看蓮花，也能從山區溫泉認識地方自然特色。',
    season: '全年；蓮花常見於5–8月，木棉約3–4月', livingTip: '把山區休閒與平日生活分開，實測就醫、採買及夜間返家的路程。', sourceIds: ['farm-tour', 'baihe-lotus', 'spring-flowers'],
    quiz: quiz('白河這張卡的夏季花田主角是？', '蓮花', ['梅花', '白蓮霧花'], 'c', '白河區公所介紹每年約5至8月的蓮花季節，實際花況依天候。'),
  },
  {
    id: 'dongshan', name: '東山區', region: 'hills', tagline: '沿著山路聞咖啡香', icon: '☕',
    feature: '175咖啡公路串起東山的山景與咖啡產業。從一杯咖啡開始，可以慢慢認識淺山的農業生活。',
    season: '全年', livingTip: '實走彎道與上下坡路線，確認雨天、夜間以及日常採買的交通安排。', sourceIds: ['farm-tour'],
    quiz: quiz('東山175公路這張卡介紹的產業是？', '咖啡', ['曬鹽', '牛奶'], 'a', '官方旅遊資料以175咖啡公路介紹東山的咖啡產區。'),
  },
  {
    id: 'danei', name: '大內區', region: 'hills', tagline: '把好奇心交給星空', icon: '🔭',
    feature: '南瀛天文館位於大內，把觀測、展示與星象體驗帶進旅行。白天看展，也能為夜空多準備一些問題。',
    season: '全年；觀測依天候與館方安排', livingTip: '若喜歡較安靜的環境，也要實測夜間道路、通訊與常用生活服務的距離。', sourceIds: ['museum-tour'],
    quiz: quiz('大內這張卡介紹哪座知識場館？', '南瀛天文館', ['奇美博物館', '知事官邸'], 'b', '南瀛天文館是官方山博線介紹的大內科普場館。'),
  },
  {
    id: 'xinhua', name: '新化區', region: 'hills', tagline: '大目降的老街記憶', icon: '🏠',
    feature: '新化老街與大目降文化線索，讓人從街屋認識地方歷史。再向周邊走，可以把文化散步和自然休閒接在一起。',
    season: '全年', livingTip: '老街或主要道路旁看房，可分白天、晚間和假日觀察採光、噪音與停車。', sourceIds: ['museum-tour'],
    quiz: quiz('新化這張卡提到的地方舊名線索是？', '大目降', ['月津', '北門嶼'], 'c', '官方新化旅遊介紹以大目降、老街和文化園區串起地方故事。'),
  },
  {
    id: 'shanshang', name: '山上區', region: 'hills', tagline: '一滴水的工程旅行', icon: '💧',
    feature: '山上花園水道博物館讓人看見早期自來水工程。從建築與設備出發，可以把用水日常和城市發展史連起來。',
    season: '全年', livingTip: '現場確認住家用水設備、維護紀錄與日常交通，不把景點設施當成住宅條件。', sourceIds: ['museum-tour'],
    quiz: quiz('山上花園水道博物館主要讓人認識哪段歷史？', '自來水工程', ['海鹽出口', '高山茶製作'], 'a', '官方介紹以昔日用水工程說明山上花園水道博物館的特色。'),
  },
  {
    id: 'yujing', name: '玉井區', region: 'hills', tagline: '夏天從一顆芒果開始', icon: '🥭',
    feature: '芒果是玉井鮮明的農產特色。走訪果品與地方飲食，也能認識淺山農村和季節的關係。',
    season: '全年可認識；芒果產期常見於6–9月', livingTip: '觀光採果與平日生活分開看，實測通勤、採買及炎熱時段的遮蔭。', sourceIds: ['fruit-tour', 'agricultural-seasons'],
    quiz: quiz('玉井這張卡介紹的代表性果品是？', '芒果', ['白蓮霧', '菱角'], 'b', '玉井是臺南芒果產區之一，其他行政區也有種植。'),
  },
  {
    id: 'nanxi', name: '楠西區', region: 'hills', tagline: '梅嶺的冬日花信', icon: '🌸',
    feature: '楠西梅嶺以梅樹、步道和梅子料理形成地方特色。冬季花景之外，也能認識山區農產與生活。',
    season: '全年；梅花常見於12月至翌年1月', livingTip: '先走過不同天候的山路，確認坡度、照明與常用醫療採買路線。', sourceIds: ['meiling'],
    quiz: quiz('楠西梅嶺這張卡介紹的冬季花景是？', '梅花', ['蓮花', '木棉花'], 'c', '西拉雅國家風景區管理處介紹梅嶺約12至1月的賞梅季節。'),
  },
  {
    id: 'nanhua', name: '南化區', region: 'hills', tagline: '水庫與山脊之間', icon: '🏞️',
    feature: '南化水庫與周邊山林，是認識南化的地景線索。沿著可開放的觀景和步道路線，能看見山區不同的尺度。',
    season: '全年；路線開放依管理單位公告', livingTip: '實測山路轉彎、會車與雨後通行，並確認日常採買和緊急就醫的安排。', sourceIds: ['fruit-tour'],
    quiz: quiz('南化這張卡以哪座水庫作為地景線索？', '南化水庫', ['烏山頭水庫', '白河水庫'], 'a', '官方南化旅遊介紹包括南化水庫與周邊山林路線。'),
  },
  {
    id: 'zuozhen', name: '左鎮區', region: 'hills', tagline: '從化石想像很久以前', icon: '🦴',
    feature: '左鎮化石園區把古生物與地質知識帶到眼前。周邊白堊地景，也讓人用不同眼光看山丘。',
    season: '全年', livingTip: '看房時實走坡地道路與住家出入口，另外查明土地和建物資料，不以風景替代查證。', sourceIds: ['museum-tour'],
    quiz: quiz('左鎮這張卡的知識探索主題是？', '化石與地質', ['牛奶加工', '海港造船'], 'b', '官方山博線以左鎮化石園區及特殊地貌介紹這個地方。'),
  },
  {
    id: 'guanmiao', name: '關廟區', region: 'hills', tagline: '陽光裡的麵香', icon: '🍜',
    feature: '關廟麵把製麵與日曬工序連在一起。鳳梨和竹筍也是地方農產，讓一趟旅行可以從餐桌開始。',
    season: '全年', livingTip: '沿住家周邊走一圈，觀察加工、運輸和日常車流，再確認採買動線。', sourceIds: ['south-tour'],
    quiz: quiz('這張關廟卡介紹哪項日曬食品？', '關廟麵', ['鹽水意麵', '白河蓮藕粉'], 'c', '官方關廟旅遊介紹把日曬製麵列為地方特色之一。'),
  },
  {
    id: 'longqi', name: '龍崎區', region: 'hills', tagline: '竹影與泥岩地景', icon: '🎋',
    feature: '龍崎的竹林與泥岩地景呈現淺山的不同面貌。觀察植物與地形，可以慢慢理解地方產業和環境的連結。',
    season: '全年', livingTip: '實走坡度與彎道路線，確認日照、夜間通行和生活服務距離。', sourceIds: ['south-tour'],
    quiz: quiz('這張龍崎卡用哪組線索認識地方？', '竹林與泥岩', ['鹽田與潟湖', '稻米與蘭花'], 'a', '官方介紹龍崎的竹林、農產與泥岩侵蝕地景。'),
  },
];

export const tainanSeasons = [
  {
    id: 'yujing-mango', title: '玉井與淺山芒果', season: '夏季至初秋，常見6–9月', months: [6, 7, 8, 9],
    districtIds: ['yujing', 'nanxi', 'nanhua', 'danei'],
    description: '從玉井認識芒果，也別忘了楠西、南化和大內等產區。品種與天候會影響產期；採果及年度活動依官方與產地公告。',
    sourceIds: ['agricultural-seasons', 'fruit-tour'],
  },
  {
    id: 'madou-pomelo', title: '麻豆文旦的季節', season: '夏末至初秋，常見8–9月', months: [8, 9],
    districtIds: ['madou', 'xiaying', 'danei'],
    description: '文旦把麻豆的果香帶進日常餐桌，下營與大內也有種植。這是一般產期提示；成熟狀況及年度活動依官方與產地公告。',
    sourceIds: ['agricultural-seasons', 'culture-tour'],
  },
  {
    id: 'yanshui-lantern', title: '鹽水元宵民俗', season: '農曆元宵前後，約國曆2–3月', months: [2, 3], districtIds: ['yanshui'],
    description: '蜂炮是鹽水的元宵民俗線索。此卡介紹一般節期，沒有預告任何年度日期；活動安排、交通與參與須知依當年官方公告。',
    sourceIds: ['farm-tour'],
  },
  {
    id: 'baihe-lotus', title: '白河夏日蓮田', season: '初夏至夏季，常見5–8月', months: [5, 6, 7, 8], districtIds: ['baihe'],
    description: '蓮花讓白河的田野多了一種季節表情，清晨是觀察花朵的好時段。花況受天候影響，賞蓮與年度活動依區公所公告。',
    sourceIds: ['baihe-lotus'],
  },
  {
    id: 'spring-kapok', title: '春日木棉的橘紅', season: '春季，常見3–4月', months: [3, 4], districtIds: ['baihe', 'jiangjun'],
    description: '白河林初埤與將軍的木棉道路，提供不同的春日田野視角。花期會隨天候改變，花況及活動交通安排依官方公告。',
    sourceIds: ['spring-flowers'],
  },
  {
    id: 'houbi-orchid', title: '後壁早春蘭花', season: '早春，蘭展常見2–3月', months: [2, 3], districtIds: ['houbi'],
    description: '後壁的蘭花產業可以全年認識，早春蘭展則是另一個入口。月份僅提示一般時節，年度展期、場地及入場安排依官方公告。',
    sourceIds: ['houbi-orchids'],
  },
  {
    id: 'winter-wetlands', title: '濕地的度冬候鳥', season: '秋冬至翌春，常見10月至翌年4月', months: [1, 2, 3, 4, 10, 11, 12], districtIds: ['qigu'],
    description: '以七股曾文溪口一帶認識黑面琵鷺與濕地，遠觀、不追逐，讓觀察保留安靜。鳥況、場域開放與解說活動依台江國家公園公告。',
    sourceIds: ['winter-birds', 'coast-tour'],
  },
  {
    id: 'nanxi-plum', title: '楠西梅嶺冬日花信', season: '冬季，常見12月至翌年1月', months: [1, 12], districtIds: ['nanxi'],
    description: '梅嶺步道與梅花把冬日山景串成一次慢行。花況隨氣溫變動，步道開放、接駁與年度活動依官方公告，不保證抵達即盛開。',
    sourceIds: ['meiling'],
  },
];
