import { mountStreetWorld } from './street-world.js?v=23.0.3';
import { daylifeWalkScene } from './daylife-walk-art.js?v=23.0.3';
import { walkScenes, walkDiscoveries, walkSceneById, walkDiscoveryById, walkStops, loadWalkState, saveWalkState } from './daylife-walk-data.js?v=23.0.3';
import { companionTools } from '../tool-routes.js?v=6.0.0';
import { lifeFor, livingStops, residentPlans } from './daylife-life-data.js?v=23.0.3';
import { daylifePlayerArt, daylifeActorArt } from './daylife-character-art.js?v=23.0.3';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const times = { morning: '清晨', afternoon: '午後', evening: '傍晚' };
const art = period => new URL(`./daylife-${period}.webp`, import.meta.url).href;
const source = item => '<details class="daylife-source"><summary>這個地方的真實線索與來源</summary><p>' + esc(item.fact) + '</p><a href="' + esc(item.source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(item.source.title) + ' ↗</a><p class="daylife-note">官方資料查核：' + esc(item.source.checkedAt) + '。人物、對話與上方小場景為原創虛構；不代表當日營業、天候或活動安排。</p></details>';

export function createDaylifeWalk({ storage, onStory = () => {}, onBook = () => {}, onExit = () => {}, onLesson = () => {}, onFeedback = () => {}, showPanel = () => {}, closePanel = () => {}, notify = () => {}, getMoments = () => 0, getSelections = () => [] } = {}) {
  const loaded = loadWalkState(storage);
  let state = loaded.state, memoryOnly = !loaded.saved, warned = false, host = null, world = null, fast = false, removeClick = null;
  let lifePaused = false, lineIndex = 0;
  try { lifePaused = storage?.getItem('anxin-daylife-ambient-paused-v1') === 'true'; } catch {}
  const sceneNow = () => walkSceneById(state.selectedId);
  const foundIn = scene => scene.discoveries.filter(item => state.discoveryIds.includes(item.id)).length;
  const selectedStories = () => { const value = getSelections(); return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.keys(value) : []; };
  function storageText() { return memoryOnly ? '目前僅留在本次頁面，關閉後可能無法保留。' : '小發現與停留位置只存在目前瀏覽器，隨時可回來重看。'; }
  function persist() {
    memoryOnly = !saveWalkState(storage, state);
    if (memoryOnly && !warned) { warned = true; notify('這次仍可散步；瀏覽器暫時無法保存，小發現僅留在本次頁面。'); }
    refresh();
  }
  function summary() {
    const entries = state.discoveryIds.map(walkDiscoveryById).filter(Boolean);
    if (!entries.length) return '';
    return ['【小安的台南散步小發現】', `已收下 ${entries.length} / ${walkDiscoveries.length} 個地方小發現。`, ...entries.map(item => `・${walkSceneById(item.sceneId).name}｜${item.memory}`), '六個地方是獨立的想像小街區，這是遊戲內的觀察紀錄，不代表實際到訪。'].join('\n');
  }
  function refresh() {
    if (!host) return;
    const selected = selectedStories(), scene = sceneNow();
    for (const button of host.querySelectorAll('[data-walk-scene]')) {
      const item = walkSceneById(button.dataset.walkScene);
      if (!item) continue;
      const status = button.querySelector('[data-walk-scene-status]');
      if (status) status.textContent = `${foundIn(item)} / 2 小發現${selected.includes(item.id) ? ' · 已留片刻' : ''}`;
    }
    const count = host.querySelector('[data-walk-count]');
    if (count) count.textContent = `${state.discoveryIds.length} / ${walkDiscoveries.length}`;
    const local = host.querySelector('[data-walk-local-count]');
    if (local) local.textContent = `${scene.name}：${foundIn(scene)} / 2 個小發現`;
    const progress = host.querySelector('[data-walk-progress]');
    if (progress) progress.value = state.discoveryIds.length;
    const moments = host.querySelector('[data-walk-moment-count]');
    if (moments) moments.textContent = `我的台南片刻${getMoments() ? ' · ' + getMoments() : ''}`;
    const note = host.querySelector('[data-walk-storage]');
    if (note) note.textContent = storageText();
    for (const stop of host.querySelectorAll('[data-stop]')) {
      const item = walkDiscoveryById(stop.dataset.stop);
      if (item) {
        stop.dataset.walkCollected = String(state.discoveryIds.includes(item.id));
        stop.setAttribute('aria-label', `${state.discoveryIds.includes(item.id) ? '已收下，可重看；' : ''}走到${item.name}，發現地方日常`);
      }
    }
  }
  function panel(title, html) {
    world?.setAmbientPaused(true);
    showPanel(title, '<section class="daylife daylife-walk-panel">' + html + '<p class="daylife-note">原創想像場景，並非實景導覽；所有地點都可以重訪。</p></section>');
  }
  function showDailyLine(line) {
    if (!host) return;
    const [speaker, ...words] = line.split('｜');
    const name = host.querySelector('[data-life-speaker]'), text = host.querySelector('[data-life-line]');
    if (name) name.textContent = speaker;
    if (text) text.textContent = words.join('｜') || line;
  }
  function neighborTalk(replyIndex) {
    const scene = sceneNow(), life = lifeFor(scene.id), reply = life.replies[replyIndex];
    panel(life.neighbor + '的日常', '<p class="daylife-speaker">' + esc(life.role) + '</p><div class="life-portrait" aria-hidden="true"><svg viewBox="-48 -120 96 128">' + daylifeActorArt({id:scene.id+'-neighbor',kind:'resident',portrait:'neighbor'},0) + '</svg></div><div class="daylife-prose"><p>' + esc(reply ? reply.text : life.hello) + '</p></div>' +
      '<div class="daylife-choices">' + life.replies.map((item, index) => '<button type="button" class="daylife-choice" data-life-reply="'+index+'">' + esc(item.label) + '<span aria-hidden="true">→</span></button>').join('') + '</div><button type="button" class="daylife-button daylife-secondary" data-walk-back>跟他說聲謝謝，回街上走走 →</button>');
  }
  function discovery(id) {
    const item = walkDiscoveryById(id);
    if (!item) return;
    const saved = state.discoveryIds.includes(id);
    panel(item.name, '<p class="daylife-location">' + esc(walkSceneById(item.sceneId).name) + ' · 地方小發現</p><h3>' + esc(item.question) + '</h3><div class="daylife-prose"><p>' + esc(item.scene) + '</p></div><div class="daylife-memory"><span>我想記住的</span><p>' + esc(item.memory) + '</p></div><div class="daylife-actions"><button type="button" class="daylife-button" data-walk-collect="' + esc(id) + '">' + (saved ? '已在手帳裡，回街上走走 →' : '收下這個小發現，繼續走 →') + '</button><button type="button" class="daylife-text-button" data-walk-back>先回街上</button></div>' + source(item));
  }
  function office() {
    panel('散步累了，坐一下。', '<p class="daylife-brand">宏國地政 × 易丞地政 · 散步陪伴站</p><p class="daylife-speaker">楊代書｜原創情境角色</p><div class="daylife-prose"><p>「剛剛有沒有哪個小地方，讓你想再多待一會？」楊代書把空椅子拉開，讓小安坐下。</p><p>喜歡一個地方，可以先留在手帳。若開始想像住在這裡，也不必急著做決定：先把最想問的事說清楚，再一起想想要看哪些資料、到現場確認什麼。</p></div><div class="daylife-actions"><button type="button" class="daylife-button" data-walk-book>看看我的台南片刻與 LINE 草稿 →</button><button type="button" class="daylife-button daylife-secondary" data-walk-journal>翻翻散步小發現</button><button type="button" class="daylife-text-button" data-walk-back>謝謝，繼續散步</button></div><details class="daylife-tools"><summary>想把關於家的問題，再練習一次？</summary><p>可以接續原本的買房練習，或開啟已經使用的試算工具。</p><button type="button" class="daylife-button daylife-secondary" data-walk-lesson>接著做買房練習 →</button><div>' + Object.values(companionTools).map(tool => '<a href="' + esc(tool.url) + '" target="_blank" rel="noopener noreferrer">' + esc(tool.name) + ' ↗</a>').join('') + '</div></details><p class="daylife-note">陪伴站是遊戲原創情境，六地並無因此設立的實體分店。開啟 LINE 草稿後，由你確認並送出。</p>');
  }
  function journal() {
    const entries = state.discoveryIds.map(walkDiscoveryById).filter(Boolean);
    panel('沿路收下的小發現', '<p class="daylife-lead">' + (entries.length ? '慢慢走過的地方，多留下一點日常。' : '手帳還空著，街角有小發現在等你。') + '</p><p>已收下 ' + entries.length + ' / ' + walkDiscoveries.length + ' 個小發現。每個地方有兩個，可以隨時回去重看。</p>' + (entries.length ? '<div class="daylife-notebook">' + entries.map(item => '<article class="daylife-notebook-item"><p class="daylife-location">' + esc(walkSceneById(item.sceneId).name) + '</p><h3>' + esc(item.name) + '</h3><p>' + esc(item.memory) + '</p><button type="button" class="daylife-text-button" data-walk-replay="' + esc(item.id) + '">回到這個地方，再走近看看 →</button>' + source(item) + '</article>').join('') + '</div>' : '<p>點地圖上的小地標，等小安走到後，看看問題，再決定要不要收下。</p>') + '<div class="daylife-actions"><button type="button" class="daylife-button" data-walk-back>回到散步地圖 →</button><button type="button" class="daylife-button daylife-secondary" data-walk-book>居民對話與 LINE 草稿</button></div><p class="daylife-storage">' + storageText() + '</p>');
  }
  function interact(id) {
    const scene = sceneNow();
    if (id === `${scene.id}-resident`) { world?.setAmbientPaused(true); onStory(scene.id); }
    else if (id === `${scene.id}-neighbor`) neighborTalk();
    else if (id === `${scene.id}-office`) office();
    else if (scene.discoveries.some(item => item.id === id)) discovery(id);
  }
  function mount(container, storyId) {
    if (!container) return;
    destroy(); host = container;
    if (walkSceneById(storyId)) state.selectedId = storyId;
    const scene = sceneNow();
    host.innerHTML = '<section class="daylife-walk" data-walk-root data-walk-period="' + esc(scene.period) + '"><header class="daylife-walk-header"><div><p class="daylife-walk-kicker">小安的台南慢日子 · ' + times[scene.period] + '</p><h1 id="chapter-title" tabindex="-1">今天，想在哪裡慢慢走？</h1><p>' + esc(scene.invitation) + '</p></div><img src="' + esc(art(scene.period)) + '" width="1200" height="800" alt="' + times[scene.period] + '的原創台南生活意象插畫，並非實景" decoding="async"></header><nav class="daylife-walk-scenes" aria-label="選擇獨立的台南想像小街區">' + walkScenes.map(item => '<button type="button" data-walk-scene="' + esc(item.id) + '" aria-pressed="' + (scene.id === item.id) + '"><span>' + times[item.period] + '</span><strong>' + esc(item.name) + '</strong><small data-walk-scene-status></small></button>').join('') + '</nav><label class="life-mobile-select">換個地方散步<select data-life-scene aria-label="選擇散步地方">' + walkScenes.map(item => '<option value="' + esc(item.id) + '"' + (item.id === scene.id ? ' selected' : '') + '>' + esc(item.name) + ' · ' + times[item.period] + '</option>').join('') + '</select></label><div class="daylife-walk-map-intro"><p><strong>' + esc(scene.name) + '</strong> · 走到' + esc(scene.story.speaker.split('｜')[0]) + '身旁，聽一段日常；路上還有兩個小發現。</p><button type="button" data-walk-fast aria-pressed="' + fast + '">快速移動：' + (fast ? '開啟' : '關閉') + '</button></div><div class="daylife-walk-map" data-walk-map></div><aside class="life-chat" aria-label="街坊日常，原創情境"><div class="life-chat-mark" aria-hidden="true">❝</div><div class="life-chat-copy"><p><span>街坊日常</span><b data-life-speaker></b></p><p data-life-line></p></div><div class="life-chat-actions"><button type="button" data-life-next>再聽一句</button><button type="button" data-life-pause aria-pressed="' + lifePaused + '">' + (lifePaused ? '繼續街坊散步' : '暫停街坊散步') + '</button></div></aside><section class="daylife-walk-progress" aria-label="散步小發現進度"><div><span>我的散步小發現</span><strong data-walk-count></strong><progress max="12" value="0" data-walk-progress aria-label="已收集的小發現"></progress></div><p data-walk-local-count></p><button type="button" data-walk-journal>打開發現手帳 →</button></section><nav class="daylife-walk-actions" aria-label="散步與原街區功能"><button type="button" data-walk-book data-walk-moment-count>我的台南片刻</button><button type="button" data-walk-exit>回原街區，接著玩互助任務</button><button type="button" data-walk-feedback>告訴我們哪裡好玩、哪裡卡住</button></nav><details class="daylife-walk-about"><summary>關於這六個地方與我的進度</summary><p>這是以真實地方文化為線索的六個獨立想像小街區，不是能跨越全市照走的步行路線。選地方只會切換場景，點人物或地標後才開始走近。</p><p>居民、對話、場景與插畫為原創虛構；地方文化附官方來源與查核日期。場景時段不是營業、天候或活動保證，印記也不代表實際到訪。</p><p>預設沿街步行；可自行開啟快速移動。裝置的減少動態效果設定也會受到尊重。</p><p data-walk-storage>' + storageText() + '</p></details></section>';
    const click = event => { const button = event.target.closest?.('button'); if (button && handleClick(button)) event.stopPropagation(); };
    host.addEventListener('click', click);
    const change = event => { if (event.target.matches('[data-life-scene]') && walkSceneById(event.target.value)) { open(event.target.value); host?.querySelector('[data-life-scene]')?.focus({preventScroll:true}); } };
    host.addEventListener('change', change);
    removeClick = () => {container.removeEventListener('click', click);container.removeEventListener('change', change);};
    world = mountStreetWorld(host.querySelector('[data-walk-map]'), { district: scene, position: state.positions[scene.id] || scene.spawn, stops: livingStops(scene, walkStops(scene.id)), sceneArt: daylifeWalkScene, playerArt: daylifePlayerArt, actorArt: daylifeActorArt, residentLife: residentPlans(scene), ambientEnabled: !lifePaused, onAmbientLine: ({text}) => showDailyLine(text), instantTravel: fast, onMove: position => { state.positions[scene.id] = position; persist(); }, onInteract: interact });
    for (const button of host.querySelectorAll('[data-stop]')) {
      button.dataset.walkStop = button.dataset.stop;
      if (button.dataset.stop === scene.discoveries[0].id) button.dataset.walkEdge = 'left';
      if (button.dataset.stop === `${scene.id}-office`) button.dataset.walkOffice = 'true';
      if (button.dataset.stop === `${scene.id}-neighbor`) button.dataset.lifeNeighbor = 'true';
    }
    lineIndex = 0; showDailyLine(lifeFor(scene.id).lines[0]);
    host.querySelector('[data-walk-root]').dataset.lifePaused = String(lifePaused);
    persist();
  }
  function open(storyId) {
    if (host) { const container = host; closePanel(); mount(container, storyId); }
    else if (walkSceneById(storyId)) { state.selectedId = storyId; persist(); }
  }
  function destroy() { removeClick?.(); removeClick = null; world?.destroy(); world = null; host = null; }
  function handleClick(button) {
    if (!button?.dataset) return false;
    const data = button.dataset;
    if ('lifePause' in data) {
      lifePaused = !lifePaused;
      try { storage?.setItem('anxin-daylife-ambient-paused-v1', String(lifePaused)); } catch {}
      world?.update({ambientEnabled: !lifePaused});
      button.setAttribute('aria-pressed', String(lifePaused));
      button.textContent = lifePaused ? '繼續街坊散步' : '暫停街坊散步';
      host?.querySelector('[data-walk-root]')?.setAttribute('data-life-paused', String(lifePaused));
      return true;
    }
    if ('lifeNext' in data) { const lines = lifeFor(sceneNow().id).lines; lineIndex = (lineIndex + 1) % lines.length; showDailyLine(lines[lineIndex]); return true; }
    if ('lifeReply' in data) { const i = Number(data.lifeReply); if (Number.isInteger(i) && i >= 0 && i < 2) neighborTalk(i); return true; }
    if (data.walkScene) { if (walkSceneById(data.walkScene)) { open(data.walkScene); host?.querySelector(`[data-walk-scene="${data.walkScene}"]`)?.focus({ preventScroll: true }); } return true; }
    if ('walkFast' in data) { fast = !fast; if (host) { const container = host; mount(container); host.querySelector('[data-walk-fast]').focus({ preventScroll: true }); } return true; }
    if ('walkCollect' in data) { const item = walkDiscoveryById(data.walkCollect); if (item && item.sceneId === state.selectedId) { const fresh = !state.discoveryIds.includes(item.id); if (fresh) { state.discoveryIds.push(item.id); persist(); } closePanel(); notify(fresh ? `收下「${item.name}」，現在有 ${state.discoveryIds.length} 個小發現。` : '小發現已在手帳裡，繼續慢慢走。'); } return true; }
    if ('walkReplay' in data) { const item = walkDiscoveryById(data.walkReplay); if (item && host) { open(item.sceneId); world?.walkTo(item.id); } return true; }
    if ('walkBack' in data) { closePanel(); host?.querySelector('.street-stage')?.focus({ preventScroll: true }); return true; }
    if ('walkJournal' in data) { journal(); return true; }
    if ('walkBook' in data) { world?.setAmbientPaused(true); onBook(); return true; }
    if ('walkExit' in data) { closePanel(); destroy(); onExit(); return true; }
    if ('walkLesson' in data) { closePanel(); destroy(); onLesson(); return true; }
    if ('walkFeedback' in data) { onFeedback(); return true; }
    return false;
  }
  return { mount, destroy, handleClick, summary, context: () => `${sceneNow().name} · 台南慢日子散步`, refresh, open, resumeAmbient: () => world?.setAmbientPaused(false) };
}
