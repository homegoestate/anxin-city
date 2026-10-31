// Place facts are paraphrased from the linked official sources. Character dialogue is original fiction.
export const REVIEWED_AT = '2026-10-31';
export const asset = name => new URL('./assets/' + name + '.webp', import.meta.url).href;
export const portrait = name => new URL('../first-day/lantern/assets/' + name + '-happy.webp', import.meta.url).href;
export const CHAPTERS = [
  {
    id: 'street', placeId: 'culture-shennong', districtId: 'west-central', name: '神農街', theme: '一條街，兩種時間', word: '街', image: 'shennong', guide: 'bo', speaker: '博伯', role: '把地方故事說給你聽',
    opening: '街坊想辦一場「我們眼裡的台南」小展覽。沫沫畫好了街景，卻留著明信片的背面：「這一張，該寫下什麼？」博伯停在巷口，等你選一個想聽的故事。',
    prompt: '同一條街，你想先認識哪一面？',
    choices: [
      { label: '街屋與港口', question: '這條街，曾經通向哪裡？', reaction: '博伯把手往巷子深處一指：「眼前是路，故事裡卻有船。」', fact: '清代的神農街曾是五條港的重要出入口，商業往來密切。後來水道轉為道路；今天沿街散步，仍能從街屋想起港口曾帶來的繁盛。', memory: '神農街的街屋，連著五條港的商業記憶。', note: '下次看老街，可以多問一句：人和貨物，曾經從哪裡來？' },
      { label: '店門裡的今天', question: '老街，只留下過去的故事嗎？', reaction: '沫沫把一盞燈畫亮：「我想把現在正在生活的人，也留在畫裡。」', fact: '今天的神農街有文創與手作店家進駐。它也有持續運作的生活空間；走進店裡、拍攝作品或室內前，先確認店家的規定。', memory: '老街的魅力，也來自今天仍在發生的生活。', note: '把好奇心帶進巷子，也把尊重留給店家與居民。' },
    ],
    bridge: '第一張卡有了文字。博伯說，接下來去看看：一座城，曾經怎麼守住自己的入口？',
    source: { title: '台南旅遊網｜神農街', url: 'https://www.twtainan.net/zh-tw/attractions/detail/1351/', updated: '2024-01-09' },
  },
  {
    id: 'gate', placeId: 'culture-south-gate', districtId: 'west-central', name: '大南門', theme: '走進城，也走進日常', word: '城', image: 'south-gate', guide: 'momo', speaker: '沫沫', role: '用一張畫，留住一個細節',
    opening: '第二張明信片，沫沫畫了一道彎彎的城牆。她把畫轉給你看：「像不像有人替城門張開雙手？」博伯笑了：這個形狀，還藏著另一層心思。',
    prompt: '從哪個細節，走進這座城？',
    choices: [
      { label: '彎彎的外城', question: '城門前，為什麼還有一道彎？', reaction: '博伯沿著畫上的弧線比畫：「這不只是好看的輪廓。」', fact: '大南門又稱寧南門，城門外有半月形的甕城，是加強防禦的設計。認識這道弧線，便能從建築讀出城門曾肩負的任務。', memory: '大南門前的半月形甕城，藏著防禦的巧思。', note: '這張插畫呈現意境；現場的構造與動線，請以古蹟及官方解說為準。' },
      { label: '樹下的日常', question: '城門現在，還陪著誰？', reaction: '沫沫在樹影旁留了一塊空白：「這裡，想留給今天來散步的人。」', fact: '大南門位在南門公園。昔日防守城市的入口，今天也是人們散步、聊天、下棋的日常場景；古蹟與生活可以同時出現在一張畫裡。', memory: '城門不只記錄防守，也陪伴今天的日常。', note: '到現場不妨慢一點：除了看建築，也看看人們怎麼使用這個地方。' },
    ],
    bridge: '兩張卡並排，一張有來往的人，一張有城市的邊界。下一張，沫沫想畫一處讓學問留下來的地方。',
    source: { title: '台南旅遊網｜臺灣府城大南門', url: 'https://www.twtainan.net/zh-tw/attractions/detail/856/', updated: '2025-05-07' },
  },
  {
    id: 'school', placeId: 'culture-confucius', districtId: 'west-central', name: '臺南孔子廟', theme: '紅牆裡，學問有了家', word: '學', image: 'confucius', guide: 'bo', speaker: '博伯', role: '把地方故事說給你聽',
    opening: '畫面換成紅牆與樹影。博伯把聲音放輕：「有些地方，不只值得拍一張照片。」沫沫在紙邊寫下「學」字，想請你替這張卡找出它的意思。',
    prompt: '你想替這張卡，寫下哪一個發現？',
    choices: [
      { label: '學問的起點', question: '孔廟，為什麼也和學校有關？', reaction: '博伯翻開筆記：「祭祀之外，這裡也曾肩負教育的任務。」', fact: '臺南孔子廟創建於 1665 年，鄭氏時期在此開辦教育；清領時期延續官學功能，是臺灣府學所在地。理解這一層，便更能讀懂「全臺首學」的意義。', memory: '臺南孔子廟的故事，連著祭祀，也連著教育。', note: '記住它做過什麼，比急著背下一串年代更有意思。' },
      { label: '屋頂的小鳥', question: '抬頭看，屋頂為什麼有小鳥？', reaction: '沫沫停下筆：「原來，一個小小的裝飾，也能說出很大的心意。」', fact: '孔廟大成殿屋頂的一排小鳥稱為鴟鴞。官方導覽以它們受到感化的寓意，說明孔子有教無類的精神；建築細節也承載教育理念。', memory: '抬頭的小鳥，是讀懂「有教無類」的一條線索。', note: '插畫沒有逐一重現屋頂細節；想找小鳥，可以打開官方導覽看實景。' },
    ],
    bridge: '展覽還缺最後一張。沫沫想把目光移到安平：同一個地方，能不能同時住著好幾個年代？',
    source: { title: '台南旅遊網｜臺南孔子廟', url: 'https://twtainan.net/zh-tw/attractions/detail/800/', updated: '2026-06-01' },
  },
  {
    id: 'harbor', placeId: 'culture-anping-fort', districtId: 'anping', name: '安平古堡', theme: '一面牆，不只一個年代', word: '港', image: 'anping', guide: 'momo', speaker: '沫沫', role: '用一張畫，留住一個細節',
    opening: '最後一張畫裡，磚牆帶著歲月的痕跡，遠處的白色瞭望台映著天空。沫沫把兩種顏色放在一起：「它們，是同一個時候來的嗎？」這一次，你想先看哪裡？',
    prompt: '替最後一張明信片，找一條時間線索。',
    choices: [
      { label: '老磚牆的時間', question: '哪一段，留著較早的歷史？', reaction: '博伯說：「先看留下來的部分，再想想它經歷過的改變。」', fact: '安平古堡前方的外城南城垣磚牆，保存了荷蘭時期的遺跡。今日看到的整個園區，則疊加了後來不同時期的改建與整理。', memory: '看安平古堡，要分辨遺跡與不同年代的增建。', note: '一個地方的歷史，不必被說成只有一個年代。' },
      { label: '白色瞭望台', question: '白色瞭望台，也是最早的古堡嗎？', reaction: '沫沫在卡片背面畫了兩個時間格：「原來熟悉的風景，也有先後。」', fact: '今日常見的白色瞭望台外觀，包含 1975 年整修時加上的尖頂與白色牆面。它與荷蘭時期的城牆遺跡，不能當成同一年代的建物。', memory: '熟悉的白色瞭望台，不等於荷蘭時期的原貌。', note: '把不同年代看清楚，風景反而更有層次。' },
    ],
    bridge: '沫沫把卡片排好，博伯端來一杯茶。「展覽有你的眼光，才和別人的不一樣。」看看你帶回來的台南吧。',
    source: { title: '臺南市政府文化局古蹟營運科｜安平古堡', url: 'https://historic.tainan.gov.tw/index.php?id=58&lang=cht&option=module&task=pageinfo', updated: null },
  },
];
