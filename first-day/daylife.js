import { dayStories } from './daylife-data.js?v=21.0.0';
import { companionTools } from '../tool-routes.js?v=6.0.0';

const STORAGE_KEY = 'anxin-tainan-daylife-v1';
const DRAFT_LIMIT = 2200;
const PERIODS = [
  { id: 'morning', name: '清晨', title: '把早晨，留給一點人情。', description: '市場剛醒，山城也正準備開始一天。', alt: '台南市場早晨的原創情境插畫', caption: '清晨意象・想像中的府城市場' },
  { id: 'afternoon', name: '午後', title: '慢下來，才聽得見地方。', description: '走進安平的巷子，或坐進東山的午後。', alt: '台南東山咖啡山城午後的原創情境插畫', caption: '午後意象・想像中的咖啡山城' },
  { id: 'evening', name: '傍晚', title: '天色慢慢暗，故事還亮著。', description: '從鹽水的街角，到北門的暮色。', alt: '台南北門鹽田暮色的原創情境插畫', caption: '傍晚意象・想像中的鹽田暮色' }
];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const lineUrl = value => 'https://line.me/R/oaMessage/%40604gpqef/?' + encodeURIComponent(value);
const periodById = id => PERIODS.find(period => period.id === id);
const storyById = id => dayStories.find(story => story.id === id);
const choiceById = (story, id) => story?.choices.find(choice => choice.id === id);
const asset = period => new URL('./daylife-' + period + '.webp', import.meta.url).href;
const paragraphs = lines => lines.map(line => '<p>' + esc(line) + '</p>').join('');
const safeUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
};

export function createDaylife({ storage, showPanel, notify = () => {}, onChanged = () => {} }) {
  let state = { version: 1, period: 'morning', selections: {}, draft: null };
  let memoryOnly = !storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function';
  let warned = false;

  if (!memoryOnly) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const saved = raw && raw.length < 32000 ? JSON.parse(raw) : null;
      if (saved?.version === 1) {
        if (periodById(saved.period)) state.period = saved.period;
        if (saved.selections && typeof saved.selections === 'object' && !Array.isArray(saved.selections)) {
          for (const story of dayStories) {
            if (Object.prototype.hasOwnProperty.call(saved.selections, story.id) && choiceById(story, saved.selections[story.id])) {
              state.selections[story.id] = saved.selections[story.id];
            }
          }
        }
        if (typeof saved.draft === 'string') state.draft = saved.draft.slice(0, DRAFT_LIMIT);
      }
    } catch (error) {
      // Invalid old data starts a fresh notebook; blocked storage stays playable.
      if (!(error instanceof SyntaxError)) memoryOnly = true;
    }
  }

  function announceStorage() {
    if (memoryOnly && !warned) {
      warned = true;
      notify('這次仍可慢慢逛；瀏覽器暫時無法保存，片刻與草稿僅留在本次頁面。');
    }
  }

  function persist() {
    if (!storage || typeof storage.setItem !== 'function' || typeof storage.getItem !== 'function') {
      memoryOnly = true;
    } else {
      try {
        const value = JSON.stringify(state);
        storage.setItem(STORAGE_KEY, value);
        memoryOnly = storage.getItem(STORAGE_KEY) !== value;
      } catch { memoryOnly = true; }
    }
    announceStorage();
  }

  function selected() {
    return dayStories.map(story => ({ story, choice: choiceById(story, state.selections[story.id]) })).filter(item => item.choice);
  }

  function count() { return selected().length; }

  function summary() {
    const moments = selected();
    if (!moments.length) return '台南慢日子：還沒留下片刻，今天可以從喜歡的時光開始。';
    return ['【我的台南片刻】', ...moments.map(({ story, choice }) =>
      '・' + story.district + '｜' + choice.memory + '\n  想多問一句：' + choice.homePrompt
    ), '這是原創虛構故事的閱讀手帳，不代表實際到訪或個案判斷。'].join('\n');
  }

  function defaultDraft() {
    return ('你好，我在「台南慢日子」留下了這些片刻。\n\n' + summary() + '\n\n想請宏國地政 × 易丞地政陪我了解：\n（可在這裡寫下目前最想問的一個問題。）').slice(0, DRAFT_LIMIT);
  }

  function storageNote() {
    return '<p class="daylife-storage" data-daylife-storage>' + (memoryOnly
      ? '僅留在本次頁面：瀏覽器目前無法保存，離開前可先複製手帳文字。'
      : '片刻與草稿只保存在目前瀏覽器。每則故事留下最近一次選擇，隨時可以重選。') + '</p>';
  }

  function about() {
    return '<details class="daylife-about"><summary>關於這些台南片刻</summary><p>清晨、午後或傍晚，現在幾點都能開始，也可以隨時換一段時光。</p><p>居民、對話與插畫為原創虛構，借台南地景描寫日常縮影；不是實際到訪紀錄，也不是可照走的地理路線。地方資訊與故事分開呈現，官方來源可展開查閱。</p></details>';
  }

  function exploreLinks() {
    return '<nav class="daylife-explore-links" aria-label="延伸認識台南"><a href="../?start=culture">古蹟與文化走讀 →</a><a href="../?start=events">當期活動與四季 →</a></nav>';
  }

  function source(story) {
    const url = safeUrl(story.source?.url);
    return '<details class="daylife-source"><summary>這個地方的真實線索</summary><p>' + esc(story.fact) + '</p>' +
      (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(story.source.title) + ' ↗</a>' : '') +
      '<p class="daylife-note">官方資料查核：' + esc(story.source?.checkedAt) + '。上方人物與對話是原創故事。</p></details>';
  }

  function illustration(periodId, compact = false) {
    const period = periodById(periodId);
    return '<figure class="daylife-illustration' + (compact ? ' daylife-story-art' : '') + '"><img src="' + esc(asset(period.id)) + '" alt="' + esc(period.alt) + '" width="1200" height="800" decoding="async">' +
      '<figcaption>' + esc(period.caption) + '，並非目的地實景。</figcaption></figure>';
  }

  function panel(title, body, browse = false) {
    showPanel(title, '<section class="daylife' + (browse ? ' daylife-browse' : '') + '">' + body + storageNote() + '</section>');
    announceStorage();
  }

  function launch(periodId) {
    if (periodById(periodId)) { state.period = periodId; persist(); }
    const period = periodById(state.period);
    const stories = dayStories.filter(story => story.period === period.id);
    panel('台南慢日子',
      '<p class="daylife-lead">今天，想在台南多待一會？</p>' +
      '<nav class="daylife-times" aria-label="選擇台南的一段時光">' + PERIODS.map(item =>
        '<button type="button" data-daylife-period="' + item.id + '" aria-pressed="' + (item.id === period.id) + '">' + item.name + '</button>'
      ).join('') + '</nav>' +
      '<div class="daylife-browse-layout">' + illustration(period.id) +
      '<div class="daylife-browse-content"><div class="daylife-time-copy"><h3>' + esc(period.title) + '</h3><p>' + esc(period.description) + '</p></div>' +
      '<div class="daylife-destinations">' + stories.map(story => {
        const choice = choiceById(story, state.selections[story.id]);
        return '<button type="button" class="daylife-destination" data-daylife-story="' + esc(story.id) + '"><span class="daylife-district">' + esc(story.district) +
          '</span><strong>' + esc(story.title) + '</strong><span class="daylife-destination-bottom">' + (choice ? '已留一刻，再聽一次' : '去聽一段日常') + '<span aria-hidden="true"> →</span></span></button>';
      }).join('') + '</div></div></div>' +
      '<p class="daylife-note daylife-browse-caption">' + esc(period.caption) + '，並非目的地實景。</p>' +
      '<div class="daylife-actions"><button type="button" class="daylife-button daylife-secondary" data-daylife-book>我的台南片刻' + (count() ? ' · ' + count() : '') + '</button></div>' + exploreLinks() + about(), true);
  }

  function storyScreen(storyId) {
    const story = storyById(storyId);
    if (!story) return;
    if (state.period !== story.period) { state.period = story.period; persist(); }
    const current = state.selections[story.id];
    panel(story.title,
      '<div class="daylife-story-heading"><span>' + esc(periodById(story.period).name) + ' · ' + esc(story.district) + '</span><button class="daylife-text-button" type="button" data-daylife-launch>回到時光選單</button></div>' +
      illustration(story.period, true) +
      '<p class="daylife-speaker">' + esc(story.speaker) + '</p><div class="daylife-prose">' + paragraphs(story.intro) + '</div>' +
      '<h3 class="daylife-choice-title">這一刻，你想怎麼接住？</h3><div class="daylife-choices">' + story.choices.map(choice =>
        '<button type="button" class="daylife-choice" data-daylife-choice="' + esc(choice.id) + '" data-daylife-story-id="' + esc(story.id) + '" aria-pressed="' + (current === choice.id) + '"><span>' + esc(choice.label) +
        (current === choice.id ? '<small>目前留在手帳裡的選擇</small>' : '') + '</span><span aria-hidden="true">→</span></button>'
      ).join('') + '</div><p class="daylife-note">沒有標準答案。換一句話，也會聽到另一段日常。</p>' + source(story) + about());
  }

  function choose(storyId, choiceId) {
    const story = storyById(storyId), choice = choiceById(story, choiceId);
    if (!choice) return;
    state.period = story.period;
    state.selections[story.id] = choice.id;
    persist();
    onChanged();
    panel('留下一個台南片刻',
      '<p class="daylife-location">' + esc(story.district) + ' · ' + esc(story.title) + '</p>' +
      '<div class="daylife-prose daylife-response"><p class="daylife-speaker">' + esc(story.speaker) + '</p>' + paragraphs(choice.response) + '</div>' +
      '<div class="daylife-memory"><span>我想記住的</span><p>' + esc(choice.memory) + '</p></div>' +
      '<div class="daylife-home-question"><h3>如果把日子放進一個家⋯</h3><p>' + esc(choice.homePrompt) + '</p></div>' +
      '<div class="daylife-actions"><button type="button" class="daylife-button" data-daylife-book>收進我的台南片刻 →</button><button type="button" class="daylife-button daylife-secondary" data-daylife-launch>換個地方，再待一會</button><button type="button" class="daylife-text-button" data-daylife-story="' + esc(story.id) + '">倒帶，試試另一種回話</button></div>' + source(story) + about());
  }

  function notebook() {
    const moments = selected();
    const draft = state.draft ?? defaultDraft();
    panel('我的台南片刻',
      '<p class="daylife-lead">' + (moments.length ? '有些地方，是從一句話開始喜歡的。' : '留一點時間，給還沒遇見的日常。') + '</p>' +
      (moments.length ? '<div class="daylife-notebook">' + moments.map(({ story, choice }) =>
        '<article class="daylife-notebook-item"><p class="daylife-location">' + esc(periodById(story.period).name) + ' · ' + esc(story.district) + '</p><h3>' + esc(story.title) + '</h3><p>' + esc(choice.memory) +
        '</p><div class="daylife-notebook-question"><span>關於住在這裡，我想多問一句</span><p>' + esc(choice.homePrompt) + '</p></div><button type="button" class="daylife-text-button" data-daylife-story="' + esc(story.id) + '">回到這個片刻，重新選擇 →</button>' + source(story) + '</article>'
      ).join('') + '</div>' : '<p>清晨、午後或傍晚，挑一段時光、聽一位居民說話。喜歡的片刻會留在這裡。</p>') +
      '<div class="daylife-actions"><button type="button" class="daylife-button daylife-secondary" data-daylife-launch>回到台南，繼續慢慢逛 →</button></div>' +
      (moments.length ? '<section class="daylife-handoff"><p class="daylife-brand">宏國地政 × 易丞地政</p><h3>把喜歡的生活，變成能問清楚的問題。</h3><p>住在哪裡、怎麼買、家人怎麼安排，都可以先從一個疑問開始。</p>' +
        '<label for="daylife-line-draft">想帶到 LINE 的文字，可以先改成自己的話</label><textarea id="daylife-line-draft" data-daylife-draft rows="8" maxlength="' + DRAFT_LIMIT + '" spellcheck="false">' + esc(draft) + '</textarea>' +
        '<p class="daylife-note">草稿留在這個瀏覽器，請勿放入身分證、地址或真實案件的個資。</p>' +
        '<div class="daylife-actions"><a class="daylife-button" data-daylife-line href="' + esc(lineUrl(draft)) + '" target="_blank" rel="noopener noreferrer">帶著問題，開啟官方 LINE ↗</a><button type="button" class="daylife-button daylife-secondary" data-daylife-copy>複製這份文字</button>' +
        '<button type="button" class="daylife-text-button" data-daylife-refresh-draft>依目前片刻重新整理草稿</button></div>' +
        '<p class="daylife-copy-help" data-daylife-copy-help hidden>文字已選取。請長按文字選「複製」，或按 Ctrl／⌘ + C，再貼到 LINE。</p>' +
        '<p class="daylife-note">開啟後由你確認並按送出，本站不會代發。若電腦沒有帶入文字，可先複製，再<a href="https://line.me/R/ti/p/%40604gpqef" target="_blank" rel="noopener noreferrer">開啟官方帳號</a>。</p>' +
        '<details class="daylife-tools"><summary>也想把問題算一算？</summary><p>需要時，再接著使用原本的工具。</p><div>' + Object.values(companionTools).map(tool =>
          '<a href="' + esc(safeUrl(tool.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(tool.name) + ' ↗</a>'
        ).join('') + '</div></details></section>' : '') + exploreLinks() + about());
  }

  async function copyDraft() {
    const textarea = document.querySelector('[data-daylife-draft]');
    if (!textarea) return;
    try {
      await navigator.clipboard.writeText(textarea.value);
      const help = document.querySelector('[data-daylife-copy-help]');
      if (help) help.hidden = true;
      notify('已複製這份文字，可貼到 LINE 再確認送出。');
    } catch {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const help = document.querySelector('[data-daylife-copy-help]');
      if (help) help.hidden = false;
      notify('自動複製暫時無法使用。文字已選取，請長按或按 Ctrl／⌘ + C 複製。');
    }
  }

  function handleClick(button) {
    if (!button?.dataset) return false;
    if (button.hasAttribute('data-daylife-launch')) { launch(); return true; }
    if (button.hasAttribute('data-daylife-book')) { notebook(); return true; }
    if (button.hasAttribute('data-daylife-copy')) { void copyDraft(); return true; }
    if (button.hasAttribute('data-daylife-refresh-draft')) { state.draft = null; persist(); notebook(); notify('已依目前片刻重新整理草稿，仍可自由修改。'); return true; }
    if (button.dataset.daylifePeriod) {
      if (periodById(button.dataset.daylifePeriod)) { state.period = button.dataset.daylifePeriod; persist(); launch(); }
      return true;
    }
    if (button.dataset.daylifeStory) { storyScreen(button.dataset.daylifeStory); return true; }
    if (button.dataset.daylifeChoice) { choose(button.dataset.daylifeStoryId, button.dataset.daylifeChoice); return true; }
    return false;
  }

  function handleInput(event) {
    const textarea = event?.target;
    if (!textarea?.hasAttribute?.('data-daylife-draft')) return false;
    state.draft = textarea.value.slice(0, DRAFT_LIMIT);
    const link = textarea.closest('.daylife')?.querySelector('[data-daylife-line]');
    if (link) link.href = lineUrl(state.draft);
    persist();
    const note = textarea.closest('.daylife')?.querySelector('[data-daylife-storage]');
    if (note && memoryOnly) note.textContent = '僅留在本次頁面：瀏覽器目前無法保存，離開前可先複製手帳文字。';
    return true;
  }

  function entry() {
    return '<button class="daylife-entry" type="button" data-daylife-launch><img src="' + esc(asset('morning')) + '" alt="" width="180" height="120" decoding="async"><span class="daylife-entry-copy"><span class="daylife-entry-name">台南慢日子</span><strong>今天，想在台南多待一會？</strong><span>從清晨到暮色，聽六個地方的日常。</span></span><span class="daylife-entry-arrow" aria-hidden="true">→</span></button>';
  }

  return { launch, handleClick, handleInput, summary, count, entry };
}
