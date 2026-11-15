import { dayStories } from './daylife-data.js?v=21.0.0';
import { projectToStreet } from './street-world.js?v=22.0.2';

export const DAYLIFE_WALK_STORAGE_KEY = 'anxin-daylife-walk-v1';
const sceneDetails = [
  ['shuixian-morning', '水仙宮市場', '菜籃還空著，先走一小圈。', 'guide', [
    ['basket', '攤邊菜籃', '一個空菜籃，能裝進多少種晚餐？', '小安在想像的攤邊停下來：如果只挑一樣食材，你會先想到湯，還是家裡某個人愛吃的菜？先把這個念頭留著，等等可以和阿雯聊聊。', '一頓晚餐，也可以從多看一眼開始。'],
    ['port', '廟口舊港', '看著廟口，想像水路曾經靠近。', '小安把手帳轉了個方向，試著想像貨物、船隻與買菜的人如何在同一個地方交會。這是藉地方資料延伸的想像；眼前畫面不是舊港口復原圖。', '市場與廟口之間，還藏著港口的記憶。']
  ]],
  ['yujing-morning', '玉井', '先問今天有什麼，再讓季節帶路。', 'child', [
    ['season', '季節小牌', '如果今天沒有照片裡的芒果呢？', '小安翻到手帳的新一頁，沒有先寫品種或價格，只留下「今天有什麼？」。芒果盛產季是地方特色；這張想像小牌不保證你出發當天的供應。', '先問今天有什麼，才把這一次記清楚。'],
    ['corner', '街口小圖', '把照片收起來，記住一個轉角。', '想像中的小圖還空著。小安用手指畫下市場外的一條線，再留一個問號：走出市場後，你想先看街屋，還是找個地方歇一歇？', '多記一個轉角，下次又有新的走法。']
  ]],
  ['anping-afternoon', '安平巷弄', '抬頭看一眼，也留一點路給鄰居。', 'guide', [
    ['lion-face', '劍獅表情', '先看眉毛，還是先看嘴角？', '小安站在不擋路的位置，對著插畫中的劍獅看了好一會兒。你覺得牠像在提醒大家什麼？這個問題沒有正確答案，也不用靠近居民門口找答案。', '認識一張表情，也尊重一扇家門。'],
    ['lane-space', '巷口留白', '若有人正要回家，你會站在哪裡？', '一段原創小場景：小安原本停在巷口中央，見到鄰居走來，就往旁邊移了一步。等對方過去，再抬頭看剛才沒看完的門牆。', '讓出一點空間，散步也能很有禮貌。']
  ]],
  ['dongshan-afternoon', '東山', '坐好，讓一杯咖啡陪你慢下來。', 'guide', [
    ['coffee-note', '咖啡小卡', '喝之前，留一個想問的問題。', '小安在想像的咖啡桌上找到一張空白小卡。可以寫「這杯豆子從哪裡來？」或「你最喜歡哪個工作步驟？」。先留著好奇，等對方方便時再問；不替任何店家預設答案。', '杯子之外，我還想認識做咖啡的人。'],
    ['mountain-seat', '看山座位', '今天如果少排一站，想多坐多久？', '小安把椅子往內收，坐在想像中能安全停留的位置。山景不會催促你；真正出發時，175 線部分路段狹窄崎嶇，先確認通行與停留安全，再享受這份從容。', '先把腳步停好，再留時間給山景。']
  ]],
  ['yanshui-evening', '鹽水', '不趕燈節，也能走進老街的日常。', 'elder', [
    ['window', '木窗磚牆', '不用畫得像，只留下一條線。', '小安在手帳畫了幾條木窗的線，又添上一塊磚的輪廓。如果只能留下其中一個細節，你會選窗框的形狀，還是牆面的層次？這一頁是觀察練習，不是建築年代鑑定。', '老街從背景，變成一個記得的細節。'],
    ['port-edge', '街與港邊', '換個位置，再回頭看看街。', '想像中的小安在可通行的岸邊停下，回頭看剛才的街屋。試著用一句話描述「街靠著水」的感覺。今天不安排任何節慶活動，只留一個慢慢看的位置。', '沒有節慶的日子，也值得回頭看一眼。']
  ]],
  ['beimen-evening', '北門井仔腳', '把手機收一下，看看格子與天光。', 'worker', [
    ['salt-grid', '鹽田格子', '晚餐裡的一點鹹，能想到哪裡？', '小安順著插畫裡的格子看向水面，想到家裡桌上的鹽罐。海水、日曬與人的勞動，讓這個小東西有了更長的故事。你會想把這個發現說給誰聽？', '一點鹹，把餐桌和製鹽的工夫連在一起。'],
    ['sky-water', '水面天光', '不等完美夕陽，先找一種顏色。', '小安沒有掏出拍照清單，只在手帳寫下自己看到的一種顏色。插畫的天光是創作，不是今日天氣；如果出發時雲多一點，你還想看什麼？', '風景不必照著照片出現，也能記住今天。']
  ]]
];

export const walkScenes = sceneDetails.map(([id, name, invitation, portrait, entries]) => {
  const story = dayStories.find(item => item.id === id);
  return { id, name, title: name, invitation, portrait, period: story.period, story,
    spawn: { x: 500, y: 540 },
    discoveries: entries.map(([key, name, question, scene, memory]) => ({ id: `${id}-${key}`, sceneId: id, name, question, scene, memory, fact: story.fact, source: story.source })) };
});
export const walkDiscoveries = walkScenes.flatMap(scene => scene.discoveries);
export const walkSceneById = id => walkScenes.find(scene => scene.id === id);
export const walkDiscoveryById = id => walkDiscoveries.find(discovery => discovery.id === id);

export function walkStops(sceneId) {
  const scene = walkSceneById(sceneId);
  if (!scene) return [];
  const [name, role] = scene.story.speaker.split('｜');
  return [
    { id: `${scene.id}-resident`, district: scene.id, name, role, kind: 'resident', portrait: scene.portrait, x: 360, y: 430 },
    ...scene.discoveries.map((item, index) => ({ id: item.id, district: scene.id, name: item.name, role: '地方小發現', kind: 'place', x: index ? 620 : 130, y: 210 })),
    { id: `${scene.id}-office`, district: scene.id, name: '宏國地政 × 易丞地政', role: '散步陪伴站・原創情境', kind: 'office', portrait: 'yang', x: 870, y: 430 }
  ];
}

export function cleanWalkState(value) {
  const state = { version: 1, selectedId: walkScenes[0].id, positions: {}, discoveryIds: [] };
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) return state;
  if (walkSceneById(value.selectedId)) state.selectedId = value.selectedId;
  if (value.positions && typeof value.positions === 'object' && !Array.isArray(value.positions)) {
    for (const scene of walkScenes) {
      const position = Object.hasOwn(value.positions, scene.id) ? value.positions[scene.id] : null;
      if (position && typeof position === 'object' && Number.isFinite(position.x) && Number.isFinite(position.y)) {
        state.positions[scene.id] = projectToStreet(position);
      }
    }
  }
  if (Array.isArray(value.discoveryIds)) state.discoveryIds = [...new Set(value.discoveryIds.filter(id => typeof id === 'string' && walkDiscoveryById(id)))];
  return state;
}

export function loadWalkState(storage) {
  if (typeof storage?.getItem !== 'function' || typeof storage?.setItem !== 'function') return { state: cleanWalkState(null), saved: false };
  try {
    const value = storage.getItem(DAYLIFE_WALK_STORAGE_KEY);
    return { state: cleanWalkState(typeof value === 'string' && value.length <= 12000 ? JSON.parse(value) : null), saved: true };
  } catch (error) { return { state: cleanWalkState(null), saved: error instanceof SyntaxError }; }
}

export function saveWalkState(storage, state) {
  try {
    if (typeof storage?.getItem !== 'function' || typeof storage?.setItem !== 'function') return false;
    const text = JSON.stringify(cleanWalkState(state));
    storage.setItem(DAYLIFE_WALK_STORAGE_KEY, text);
    return storage.getItem(DAYLIFE_WALK_STORAGE_KEY) === text;
  } catch { return false; }
}
