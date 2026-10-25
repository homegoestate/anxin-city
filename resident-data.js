// 原創虛構居民與分支對話。地方知識接到 tainan-atlas 的官方來源；活動是有日期的人工快照。
export const residentReviewedAt='2026-10-25';
const reply=(id,label,next=id)=>({id,label,next});
const place=(kind,id,label)=>({kind,id,label});
const events=()=>({kind:'events',label:'一起看近期活動公告 →'});
const node=(lines,choices=[],actions=[])=>({lines,choices,actions});
export const residents=[
 {id:'mango-uncle',name:'芒果阿伯',role:'把日子過成一座果園',home:'玉井・淺山日常',group:'daily',color:'#b47d3e',initial:'果',icon:'🥭',teaser:'你以為我只會聊芒果？坐一下，還有別的故事。',ambient:['今天不趕路，坐一下？','玉井不只有芒果喔。','假日想往山城走嗎？'],start:'hello',districtIds:['yujing','nanxi'],nodes:{
  hello:node(['來喔，先在樹蔭下歇一下。你今天是想散心，還是帶著好奇心來的？','我最喜歡跟人聊玉井，但不會只講芒果啦。'],[reply('daily','今天想放慢一點'),reply('story','除了芒果，玉井還有什麼？'),reply('weekend','假日想去山城走走')]),
  daily:node(['我剛才把事情排得滿滿的，走到這裡才發現：連坐下來喝口水都忘了。','今天要不要也替自己留一小段沒有行程的時間？'],[reply('slow','好，給我一個慢慢逛的地方'),reply('story','坐著聽你講一段故事')]),
  story:node(['玉井以前叫噍吧哖。果香之外，這裡也留下了1915年事件的地方記憶。','我會先到噍吧哖文化園區看展，再問自己：同一塊土地，經歷過多少人的生活？'],[reply('museum','想走進那段歷史'),reply('weekend','再幫我想一個假日方向')]),
  weekend:node(['山城不用一次跑好多站。你想先聽地方故事，還是看山林的樣子？'],[reply('museum','先看文化園區'),reply('plum','我想往梅嶺走')]),
  slow:node(['就從玉井的一段故事開始吧。看完不急著趕下一站，挑一個你以前沒注意過的細節。','旅行有時候不是多去一個地方，是多看懂一件事。'],[],[place('district','yujing','走進玉井的過去與現在 →')]),
  museum:node(['看展時，我喜歡先找一張照片，看看人物的表情，再讀旁邊的說明。','園區也利用了舊糖廠的空間；建築本身就是另一段故事。開放安排先看館方公告。'],[],[place('culture','culture-tapani','從文化記憶再認識噍吧哖 →'),place('attraction','yujing-tapani-cultural-park','看看噍吧哖文化園區 →')]),
  plum:node(['梅嶺不只有花開那幾天。沿路的坡地、作物和林間風景，也值得慢慢看。','冬季常有梅花話題，但花況要看天氣；先選適合體力的路線，再查當次開放資訊。'],[],[place('attraction','nanxi-meiling','認識梅嶺與出發提醒 →'),place('season','nanxi-plum','看看梅嶺常見時節 →')])
 }},
 {id:'salt-auntie',name:'鹽田阿霞',role:'海風吹來就想說故事',home:'北門・海線記憶',group:'culture',color:'#779b9a',initial:'霞',icon:'🧂',teaser:'照片先別急著拍，你有看見腳邊的瓦片嗎？',ambient:['鹽田也能讀出生活喔。','海風大，帽子拿好嘿。','想聽海線的小故事嗎？'],start:'hello',districtIds:['beimen','jiangjun'],nodes:{
  hello:node(['欸，你也來看海線的天光啊？我剛才跟朋友說，照片先收一張，眼睛再多看一會兒。','鹽田不是只有一片白，還有很多人的日常藏在裡面。'],[reply('story','瓦片跟曬鹽有什麼關係？'),reply('weekend','想找海線的假日去處'),reply('daily','你平常怎麼散步？')]),
  story:node(['井仔腳的鹽田鋪著瓦片，走近看，那些細細的拼接很有意思。','以前工作的設施，現在也讓我們認識曬鹽的技術與地方生活。'],[reply('salt','我想看看井仔腳'),reply('fan','還有不同模樣的鹽田嗎？')]),
  weekend:node(['你喜歡細細看腳邊的紋路，還是想理解大片地景的形狀？'],[reply('salt','想看瓦片和水面'),reply('fan','想看扇形鹽田')]),
  daily:node(['我會跟朋友約定：走累了就停，不為了湊步數一直趕。今天的話題可能是天色，也可能只是誰家的貓在睡覺。','你如果來海邊，先看風和日曬，留點喝水、休息的空檔就很好。'],[reply('salt','那就挑一個地方慢慢看'),reply('fan','也想知道將軍的故事')]),
  salt:node(['在井仔腳，我會先看瓦片，再看水面映著什麼顏色。','鹽田與步道能走的範圍可能調整，出發前看官方介紹；別為了照片跨進作業或管制區。'],[],[place('culture','culture-salt','讀懂鹽田裡的生活技術 →'),place('attraction','beimen-jingzaijiao','看看井仔腳瓦盤鹽田 →'),place('district','beimen','接著認識北門 →')]),
  fan:node(['將軍的青鯤鯓扇形鹽田，可以從水路與田格理解它的安排。','站在地面不一定看得出完整扇形，配著官方俯瞰照片看，反而更容易懂。'],[],[place('attraction','jiangjun-fan-salt','認識青鯤鯓扇形鹽田 →')])
 }},
 {id:'dad-zhe',name:'阿哲爸爸',role:'週末行程由孩子出題',home:'山上・大內・親子出遊',group:'family',color:'#64889a',initial:'哲',icon:'🎒',teaser:'孩子問水從哪裡來，我決定週末一起找答案。',ambient:['週末讓孩子挑一站吧。','水從哪裡來？去看看！','今天別把行程排太滿。'],start:'hello',districtIds:['shanshang','danei','rende'],nodes:{
  hello:node(['我家小朋友剛問我：「水龍頭的水，之前住在哪裡？」我一時還真不知道怎麼講得好玩。','你這個假日，想找一個可以邊玩邊問問題的地方嗎？'],[reply('water','想跟孩子追一滴水'),reply('stars','孩子對星星很好奇'),reply('rain','想找館舍，天氣不好也有備案')]),
  water:node(['山上的花園水道博物館，把從前藏在日常背後的濾水設備留了下來。','我想跟孩子分工：他找管子往哪裡走，我找機器以前做什麼。'],[reply('water-go','這個遊戲我喜歡'),reply('daily','孩子一下就說累了呢？')]),
  stars:node(['大內的南瀛天文館，可以從展示認識天空。先找孩子最想問的一題，整趟就有了方向。','如果想參加特定觀測或場次，要再查館方公告；看到星星也要看天候。'],[],[place('attraction','danei-astronomy-museum','認識南瀛天文館 →')]),
  rain:node(['我們家會先選一個館舍，再看票務、開放時間和孩子適合的展覽。','仁德的奇美博物館可以從藝術、樂器等主題開始；不用一次看完所有東西。'],[reply('museum','想先看奇美的介紹'),reply('events','有表演活動可以看看嗎？')]),
  daily:node(['那就休息啊！我們的旅行規則是：孩子可以喊停，大人也可以。','一趟只記住一台有趣的機器，也算很有收穫。'],[],[place('culture','culture-waterworks','一起解開水道的文化線索 →'),place('attraction','shanshang-waterworks-museum','挑一個水道小任務 →')]),
  'water-go':node(['就約好找「一段管線、一個濾筒、一個新問題」。回家讓孩子講給家人聽，換他當小導覽員。','博物館區和淨水池區是不同場域，安排路線前記得看介紹。'],[],[place('culture','culture-waterworks','一起解開水道的文化線索 →'),place('attraction','shanshang-waterworks-museum','去看水道故事與參觀提醒 →')]),
  museum:node(['我會讓孩子自己選一件最想再看一次的作品，順便聽聽他的理由。','先確認當日開放與預約方式，再決定要留多少時間。'],[],[place('attraction','rende-chimei-museum','看看奇美博物館 →')]),
  events:node(['可以，一起翻活動公告吧。看到喜歡的節目，先查適合年齡、場次和票務，再跟孩子約時間。'],[],[events()])
 }},
 {id:'student-qing',name:'小晴同學',role:'下課後是城市觀察員',home:'府城・古蹟與當代文化',group:'culture',color:'#b68683',initial:'晴',icon:'📓',teaser:'我的散步作業：今天找一個以前沒看見的細節。',ambient:['你有抬頭看過屋頂嗎？','下課後，去看一場戲？','老建築每天都有新表情。'],start:'hello',districtIds:['west-central','anping','east','annan'],nodes:{
  hello:node(['嗨，我正在做自己的城市小筆記。今天的題目是：同一條路，能不能看到以前沒注意過的東西？','你想聊老建築，還是一起翻翻藝文活動？'],[reply('old','老建築要怎麼看才有趣？'),reply('events','我想看展或看表演'),reply('daily','先聊聊你今天發現什麼')]),
  old:node(['我不會一開始就背年代。先找一扇門、一塊磚，再問它以前怎麼被使用。','你對安平的城堡比較有興趣，還是中西區的樓閣和石碑？'],[reply('fort','我選安平古堡'),reply('tower','我選赤崁樓')]),
  daily:node(['今天我本來一直看手機，朋友突然問：「這棟樓的窗戶怎麼每層不一樣？」我才真的抬起頭。','所以我的作業改成：先看，再查，最後用自己的話講給朋友聽。'],[reply('old','我也想試試這個觀察法'),reply('events','這週想換成看表演')]),
  fort:node(['在安平古堡，可以試著分辨舊遺構和後來的建築。先看磚牆與榕根交界，就有不少問題可問。','讀完地方故事再回頭看，風景常常就變得不一樣了。'],[],[place('culture','culture-anping-fort','聽古堡城牆的文化故事 →'),place('attraction','anping-fort','從安平古堡開始 →')]),
  tower:node(['赤崁樓的閣樓、石碑和贔屭，不是只有拍照好看的背景。','我會挑一塊石碑看說明，想想它記錄誰的時代、又為什麼來到這裡。'],[],[place('attraction','west-central-chihkan','看看赤崁樓的故事 →')]),
  events:node(['我會先看節目在講什麼，再選想聽、想看的內容。台江或臺南文化中心，也可以成為一次新的城市旅行。','活動小本子列的是已查核公告；買票、報名和是否異動，都回主辦單位確認。'],[],[events()])
 }},
 {id:'birder-wei',name:'賞鳥小葦',role:'把望遠鏡讓給好奇的人',home:'七股・台江濕地',group:'nature',color:'#77966a',initial:'葦',icon:'🦆',teaser:'先別找最漂亮的一隻，看看牠們正在做什麼。',ambient:['望遠鏡借你，慢慢看。','濕地的客人要安靜招呼。','不是每次都要拍到照片。'],start:'hello',districtIds:['qigu','annan'],nodes:{
  hello:node(['噓，我不是在找最好看的照片，是在看水面上有沒有有趣的小動作。','如果你第一次看鳥，我們可以先從「牠正在吃飯，還是在休息？」聊起。'],[reply('bird','第一次賞鳥，可以怎麼開始？'),reply('lagoon','想知道七股潟湖的故事'),reply('weekend','想找水邊的出遊方向')]),
  bird:node(['先遠遠看，別急著靠近。秋冬到翌春是台南濕地常被討論的候鳥時節，但鳥會移動，不是來了就一定看得到。','你喜歡先看一個賞鳥地點，還是認識候鳥的季節？'],[reply('hide','先看賞鳥亭'),reply('season','想知道適合留意的時節')]),
  lagoon:node(['潟湖不是單純一大片水。沙洲、水道、蚵田與漁作，把人的生活和自然地景放在一起。','我的小任務是找出水從哪裡進出，再想像不同生物如何利用這個地方。'],[],[place('attraction','qigu-lagoon','看看七股潟湖 →')]),
  weekend:node(['如果喜歡開闊的水景，可以先認識七股；想看樹冠與倒影，也可以看看四草。','先挑一處就好，行程、船班與開放範圍再查當天官方資訊。'],[reply('lagoon','我想看潟湖'),reply('tunnel','我想看綠色隧道')]),
  hide:node(['在賞鳥亭慢慢觀察，記下鳥的動作，比一路追著牠跑更有意思。','保持距離、不餵食，也讓旁邊的人一起安靜看。'],[],[place('attraction','qigu-spoonbill-hide','認識黑面琵鷺賞鳥亭 →')]),
  season:node(['季節可以提供線索，但不能替鳥排班。先看看常見時節，再查最新現場資訊吧。'],[],[place('season','winter-wetlands','看看度冬候鳥的時節 →')]),
  tunnel:node(['四草綠色隧道可以從樹冠和水面倒影看起，抬頭與低頭是兩種不同風景。','參觀方式與當日安排，以管理單位公告為準。'],[],[place('attraction','annan-sicao-tunnel','看看四草綠色隧道 →')])
 }},
 {id:'commuter-he',name:'通勤阿禾',role:'正在認識台南的新住民',home:'永康・新市・歸仁',group:'daily',color:'#857eaa',initial:'禾',icon:'🚲',teaser:'以前只記得上下班路線，現在想知道沿途的故事。',ambient:['下班後，也有自己的台南。','科技園區旁還有老故事。','週末想去圖書館坐坐。'],start:'hello',districtIds:['yongkang','xinshi','guiren'],nodes:{
  hello:node(['剛到台南時，我只記得公司和住處中間那條路。後來發現，認識一座城市不能只靠通勤。','你下班後想找安靜角落，還是想知道這些地方正在怎麼改變？'],[reply('quiet','想找能安靜待著的地方'),reply('future','想知道台南的新發展'),reply('history','科技印象之外還有什麼？')]),
  quiet:node(['我會把圖書館放進週末清單，挑一本原本不會借的書。','永康的市立圖書館總館，可以從閱讀和公共空間認識城市。活動與開館時間記得查官方。'],[reply('library','先看看圖書館'),reply('events','也想看看最近的活動')]),
  future:node(['沙崙有新的研發與應用場域，南科周邊也有不同階段的發展。','我想看的不只是建築變多，而是工作、移動與日常如何接在一起。你想先看哪一邊？'],[reply('shalun','先看歸仁沙崙'),reply('science','先看新市南科')]),
  history:node(['新市的南科考古館，提醒我科技園區這塊土地也有很長的過去。','看展時，把「今天的工作場所」和「以前的人怎麼生活」放在一起想，很有意思。'],[],[place('culture','culture-stsp','從考古認識這塊土地 →'),place('attraction','xinshi-stsp-archaeology','看看南科考古館 →')]),
  library:node(['下次我想找一扇看得到光的窗，讀到累了就抬頭休息。','有時候喜歡一座城市，就是從找到一個舒服的公共空間開始。'],[],[place('attraction','yongkang-main-library','認識臺南市立圖書館總館 →')]),
  shalun:node(['我們去看有日期的資料吧。啟用、設計和施工是不同階段，研究場域也不一定能自由參觀。','認識發展的同時，別忘了歸仁原有的文化與生活。'],[],[place('future','guiren','看歸仁的現在與發展方向 →')]),
  science:node(['先看官方列出的階段，再想想公共空間和地方文化怎麼一起延續。','我把它當成認識地方的線索，不拿來猜房價。'],[],[place('future','xinshi','看新市的發展資料 →')]),
  events:node(['好啊，先翻活動小本子。要出門之前，我們再到主辦單位確認場次。'],[],[events()])
 }},
 {id:'photo-bai',name:'攝影阿柏',role:'喜歡拍下平日的風景',home:'鹽水・後壁・白河',group:'culture',color:'#a38c61',initial:'柏',icon:'📷',teaser:'節慶之外，我也想拍這個地方平常生活的樣子。',ambient:['今天拍一張平日的風景。','月津港沒有燈節也有故事。','花沒開，還能看什麼呢？'],start:'hello',districtIds:['yanshui','houbi','baihe'],nodes:{
  hello:node(['我剛拍了一張沒有大場面的照片，只有水面、樹影和散步的人。','你喜歡熱鬧的活動，還是想看看地方平常的模樣？'],[reply('water','想看看平日的月津港'),reply('village','想拍農村和老街'),reply('events','想知道哪裡有活動')]),
  water:node(['很多人從節慶認識鹽水，但平日到月津港，也能沿著水岸看街區怎麼相連。','我會先找一個倒影，再問：這條水路和地方以前的生活有什麼關係？'],[reply('yuejin','帶我認識月津港'),reply('season','元宵前後又有什麼不同？')]),
  village:node(['後壁的菁寮，可以從老屋、街道和稻作生活的關係慢慢看。','拍照前先看看是不是住家，有人在生活的地方，值得多留一點空間。'],[reply('jingliao','想看菁寮的故事'),reply('flower','如果想看花呢？')]),
  yuejin:node(['先把相機收起一分鐘，觀察居民怎麼使用水岸。等你找到自己的問題，再拍也不遲。'],[],[place('culture','culture-yuejin','走讀月津港的水路記憶 →'),place('attraction','yanshui-yuejin-waterfront','看看月津港親水公園 →')]),
  season:node(['元宵民俗與燈節有不同安排，農曆換成國曆的日期也會改變。','我們先認識常見時節；要看當年度活動，再去讀正式公告。'],[],[place('season','yanshui-lantern','認識鹽水元宵時節 →'),events()]),
  jingliao:node(['老街不是只剩下一排房子，也能從中看見農村生活如何被保留和使用。','我喜歡拍建築的細節，但不把住家門口當成隨意進出的布景。'],[],[place('culture','culture-jingliao','換個角度讀菁寮的日常 →'),place('attraction','houbi-jingliao-old-street','認識菁寮老街 →')]),
  flower:node(['白河有蓮田的季節，春日也有木棉的色彩；花況仍要看當年的天氣。','如果沒遇到盛開，就練習看水田、樹形和聚落吧，風景不只一種。'],[],[place('season','baihe-lotus','看看白河蓮田的時節 →'),place('season','spring-kapok','看看春日木棉的時節 →')]),
  events:node(['來，一起看有日期的活動公告。過了日期的就留作紀錄，不把去年的熱鬧當成這週的行程。'],[],[events()])
 }},
 {id:'walker-you',name:'散步阿祐',role:'下班後把步調放慢',home:'南區・安平水岸',group:'nature',color:'#568a7d',initial:'祐',icon:'🌤️',teaser:'今天只想吹風，不想把休假排成另一份工作。',ambient:['下班了，散步一小段？','夕陽不保證，放鬆可以。','你喜歡海邊還是巷弄？'],start:'hello',districtIds:['south','anping'],nodes:{
  hello:node(['下班啦！我想走一小段，把今天沒做完的事先放在明天。','你想聊聊今天，還是一起挑個不用趕路的去處？'],[reply('daily','今天有點累，先聊一下'),reply('weekend','假日想去海邊'),reply('lanes','比較想逛老地方')]),
  daily:node(['我有時候也會一直想著「今天還差什麼」。後來發現，散步不用達成什麼，也可以就是陪自己走一段。','今天想安靜看海，還是找一個有故事的地方轉換心情？'],[reply('coast','想安靜看海'),reply('fort','想換個地方走走')]),
  weekend:node(['黃金海岸可以從海岸景觀和附近聚落認識南區。','我會先查天候和現場公告，避開封閉區域；如果天氣不適合，就換一個日子。'],[reply('coast','先看黃金海岸的介紹'),reply('events','想看看假日有哪些活動')]),
  lanes:node(['安平的古堡與巷弄有不同的時間感。先看一段歷史，再想像當年人們怎麼經過這裡。','不用把每個點都走完，留一個問題給下次也很好。'],[reply('fort','從古堡開始'),reply('district','想多認識安平的現在')]),
  coast:node(['看海的時候，我喜歡先辨認天空和水面的顏色。夕陽會不會漂亮，當天才知道。','先到景點卡看出發提醒，再安排時間吧。'],[],[place('attraction','south-golden-coast','看看黃金海岸 →')]),
  fort:node(['那就從一塊磚、一段牆開始，今天不用急著把整本歷史讀完。'],[],[place('culture','culture-anping-fort','聽古堡城牆的文化故事 →'),place('attraction','anping-fort','走進安平古堡 →')]),
  district:node(['好，看看安平的過去、現在，和可以繼續關心的方向。下次散步就會多一點線索。'],[],[place('district','anping','認識安平的生活與故事 →')]),
  events:node(['我會先看公告列的實際日期，不把整個活動季都當成每天有節目。來，一起看看。'],[],[events()])
 }}
];

export const residentEventSources={
 'guanziling-2026':{id:'guanziling-2026',title:'2026關子嶺溫泉美食節官方網站',url:'https://2026gzlevent.twtainan.net/',publishedAt:null,reviewedAt:residentReviewedAt},
 'tnaf-princess':{id:'tnaf-princess',title:'臺南藝術節｜感謝公主節目頁',url:'https://tnaf.tainan.gov.tw/index.php?category=1162&id=572&inter=program',publishedAt:null,reviewedAt:residentReviewedAt},
 'tnaf-jimmy':{id:'tnaf-jimmy',title:'臺南藝術節｜幾米男孩的100次勇敢節目頁',url:'https://tnaf.tainan.gov.tw/index.php?category=1162&id=593&inter=program',publishedAt:null,reviewedAt:residentReviewedAt},
 'tourism-calendar':{id:'tourism-calendar',title:'台南旅遊網｜官方活動行事曆',url:'https://www.twtainan.net/zh-tw/event/touristcalendar/',publishedAt:null,reviewedAt:residentReviewedAt}
};
export const residentEvents=[
 {id:'guanziling-opening',title:'關子嶺溫泉美食節・開幕週',district:'白河區・關子嶺',startDate:'2026-10-24',endDate:'2026-10-25',summary:'認識山城的節慶氣氛，依官方各場次安排選擇行程。',note:'開幕週與主題週日期不同；踩街等節目有指定日與時段，請確認當日節目及交通公告。',url:residentEventSources['guanziling-2026'].url,sourceIds:['guanziling-2026']},
 {id:'tnaf-princess',title:'臺南藝術節《感謝公主》',district:'安南區・台江文化中心',startDate:'2026-10-31',endDate:'2026-11-01',summary:'從當代表演走進地方的藝文生活，官方節目頁列兩日演出。',note:'公告場次14:30，屬售票演出；請由官方頁確認票務、觀演規定與異動，本網站不提供訂位。',url:residentEventSources['tnaf-princess'].url,sourceIds:['tnaf-princess']},
 {id:'guanziling-theme',title:'關子嶺溫泉美食節・主題週',district:'白河區・關子嶺',startDate:'2026-11-07',endDate:'2026-11-08',summary:'把假日留給山城，依主題週公告找一段想參與的節目。',note:'本卡只列主題週，未表示整個活動季每日都有市集或表演；場次與參加方式以官方公告為準。',url:residentEventSources['guanziling-2026'].url,sourceIds:['guanziling-2026']},
 {id:'tnaf-jimmy',title:'《幾米男孩的100次勇敢》',district:'東區・臺南文化中心',startDate:'2026-11-21',endDate:'2026-11-22',summary:'用馬戲表演打開一段想像，官方館慶節目頁列兩日演出。',note:'公告場次14:30，屬售票演出；出發前確認適合年齡、票務與當日觀演規定。',url:residentEventSources['tnaf-jimmy'].url,sourceIds:['tnaf-jimmy']}
];
export function taipeiDay(now=new Date()){
 const d=now instanceof Date?now:new Date(now);if(!Number.isFinite(d.getTime()))throw new RangeError('無法判讀日期。');
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(p=>[p.type,p.value]));
 return `${parts.year}-${parts.month}-${parts.day}`;
}
export function eventStatus(event,now=new Date()){
 const valid=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
 if(!valid(event.startDate)||!valid(event.endDate)||event.startDate>event.endDate)throw new RangeError('活動日期資料有誤。');
 const today=taipeiDay(now),key=today<event.startDate?'upcoming':today>event.endDate?'past':'current';
 return {key,label:{upcoming:'即將開始',current:'公告期間',past:'已結束'}[key]};
}
