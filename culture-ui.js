import { cultureReviewedAt, cultureThemes, cultureSources, culturePlaces } from './culture-data.js?v=12.0.0';
import { tainanDistricts } from './tainan-data.js?v=12.0.0';
import { readingButtonHtml } from './service-hub.js?v=8.0.0';
import { loadCulturePassport, saveCulturePassport, stampCulturePlace, cultureQuizOutcome, filterCulturePlaces } from './culture-state.js?v=10.0.0';

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const placesById = new Map(culturePlaces.map(place => [place.id, place]));
const themesById = new Map(cultureThemes.map(theme => [theme.id, theme]));
const districtsById = new Map(tainanDistricts.map(district => [district.id, district]));
const placeIds = culturePlaces.map(place => place.id);
const districtName = id => districtsById.get(id)?.name || '指定地區';
const safeUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
const paragraphs = value => (Array.isArray(value) ? value : String(value ?? '').split(/\n+/)).filter(Boolean).map(text => `<p>${esc(text)}</p>`).join('');

// Original abstract drawings suggest a theme; they do not depict a specific monument.
function themeArt(themeId, small = false) {
  const drawings = {
    'gates-harbors': '<path d="M52 146V65h136v81M70 65V48h100v17M44 48h152M80 146V96h80v50"/><path d="M103 146v-29a17 17 0 0 1 34 0v29"/><path d="M28 160q23-14 46 0t46 0t46 0t46 0M28 174q23-14 46 0t46 0t46 0t46 0"/>',
    'learning-streets': '<path d="M35 68q43-20 85 0q43-20 85 0v77q-43-20-85 0q-42-20-85 0ZM120 68v77M50 84q26-9 53 0M50 99q26-9 53 0M137 84q26-9 53 0M137 99q26-9 53 0"/><path d="M60 163q65-28 122 0M80 179q39-13 82 0"/>',
    'faith-festivals': '<path d="M62 43h116M78 43v15m84-15v15M87 60h66M87 138h66M91 60q-34 40 0 78m58-78q34 40 0 78M91 60q-12 39 0 78m58-78q12 39 0 78M120 60v78M75 99h90M107 145v30m13-30v39m13-39v30"/><path d="M44 151q14-16 28 0m96 0q14-16 28 0"/>',
    'rural-crafts': '<path d="M34 134h172M45 117l24-57l24 57m54 0l24-57l24 57M69 66v64m102-64v64M34 151h172M34 168h172M52 134v47m34-47v47m34-47v47m34-47v47m34-47v47"/><path d="M103 58h34v57h-34zM108 72h24m-24 15h24m-24 15h24"/>',
    'water-industry': '<circle cx="120" cy="94" r="49"/><circle cx="120" cy="94" r="11"/><path d="M120 45v38m0 22v38M71 94h38m22 0h38M85 59l27 27m16 16l27 27M85 129l27-27m16-16l27-27M28 163q23-14 46 0t46 0t46 0t46 0M28 178q23-14 46 0t46 0t46 0t46 0"/>',
    'people-land': '<path d="M55 160V63h88v97M70 160V79h58v81M99 79v81M48 173h144M158 155V97q-29-20-5-43q27 9 12 40q8-36 35-22q1 31-35 28M157 131q-28 0-29-23q26-5 29 23"/><circle cx="88" cy="121" r="3"/><circle cx="110" cy="121" r="3"/>',
  };
  return `<svg class="cw-art${small ? ' is-small' : ''}" viewBox="0 0 240 210" aria-hidden="true" focusable="false"><circle cx="179" cy="48" r="27" fill="#dfb98e" opacity=".65"/><path d="M17 185Q92 173 223 185" stroke="#c5c9b1" stroke-width="2" fill="none"/><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${drawings[themeId] || drawings['people-land']}</g></svg>`;
}

export function createCultureWalk({ onExplore, onFeedback, onResidents, toast } = {}) {
  const dialog = document.createElement('dialog');
  dialog.id = 'culture-dialog';
  dialog.className = 'cw-dialog';
  dialog.setAttribute('aria-labelledby', 'culture-title');
  document.body.append(dialog);

  let storage;
  try { storage = window.localStorage; } catch { storage = undefined; }
  const loaded = loadCulturePassport(storage, placeIds);
  let passport = loaded.passport;
  let storageAvailable = loaded.available;
  let view = 'list', selectedPlaceId = null, lens = 'visitor', query = '', themeId = 'all', districtId = 'all';
  let returnFocus = null, listScroll = 0, listFocusId = null;
  const answers = new Map();
  const lensText = place => lens === 'local' ? place.localLens : place.visitorLens;
  const lensLabel = () => lens === 'local' ? '我就是台南人' : '第一次來台南';
  const matchingPlaces = () => filterCulturePlaces(culturePlaces, { themeId, districtId, query }, tainanDistricts);

  function focusAfterRender(selector) {
    requestAnimationFrame(() => { if (dialog.open) dialog.querySelector(selector)?.focus({ preventScroll: true }); });
  }
  function releaseFocus() {
    document.body.classList.remove('culture-walk-open');
    const target = returnFocus;
    returnFocus = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  }
  function close() {
    if (dialog.open) dialog.close();
    releaseFocus();
  }
  function open({ placeId, themeId: nextTheme, districtId: nextDistrict } = {}) {
    if (!dialog.open) returnFocus = document.activeElement;
    themeId = typeof nextTheme === 'string' && nextTheme ? nextTheme : 'all';
    districtId = typeof nextDistrict === 'string' && nextDistrict ? nextDistrict : 'all';
    query = ''; listScroll = 0; listFocusId = null;
    selectedPlaceId = placesById.has(placeId) ? placeId : null;
    view = selectedPlaceId ? 'story' : 'list';
    render();
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('culture-walk-open');
    focusAfterRender(view === 'story' ? '#culture-place-title' : '#culture-list-title');
    if (placeId && !selectedPlaceId) toast?.('這個文化點暫時沒有資料，請從文化讀本選擇。');
  }
  function showStory(placeId) {
    if (!placesById.has(placeId)) return;
    listScroll = dialog.querySelector('.cw-content')?.scrollTop || 0;
    listFocusId = placeId;
    selectedPlaceId = placeId; view = 'story';
    render(); focusAfterRender('#culture-place-title');
  }
  function showList() {
    view = 'list'; render();
    requestAnimationFrame(() => {
      if (!dialog.open) return;
      dialog.querySelector('.cw-content').scrollTop = listScroll;
      const previous = [...dialog.querySelectorAll('[data-culture-open]')].find(button => button.dataset.cultureOpen === listFocusId);
      (previous || dialog.querySelector('#culture-list-title'))?.focus({ preventScroll: true });
    });
  }
  function passportHtml() {
    return `<div class="cw-passport"><span class="cw-stamp-icon" aria-hidden="true">讀</span><div><strong>文化章 <span class="cw-passport-total">${passport.stamps.length}</span> / ${culturePlaces.length}</strong><span>讀故事，答一題，留一枚閱讀印記。</span></div></div>`;
  }
  function storageNoteHtml() {
    return `<p class="cw-storage-note"${storageAvailable ? ' hidden' : ''}>本機儲存暫時無法使用；新收下的文化章只保留在這次頁面裡。</p>`;
  }
  function lensesHtml() {
    return `<div class="cw-lenses" role="group" aria-label="選擇閱讀角度"><button type="button" data-culture-lens="visitor" aria-pressed="${lens === 'visitor'}">第一次來台南</button><button type="button" data-culture-lens="local" aria-pressed="${lens === 'local'}">我就是台南人</button></div>`;
  }
  function placeMeta(place) {
    return `<span>${esc(districtName(place.districtId))}</span><span aria-hidden="true">·</span><span>${esc(place.kind)}</span>`;
  }
  function featuredHtml(place) {
    const theme = themesById.get(place.themeId);
    return `<article class="cw-feature"><figure>${themeArt(place.themeId)}<figcaption>原創文化意象・非現地照片</figcaption></figure><div class="cw-feature-copy"><span class="cw-eyebrow">從這一頁開始 · ${esc(theme?.title || '地方文化')}</span><div class="cw-meta">${placeMeta(place)}</div><h4>${esc(place.name)}</h4><p class="cw-feature-hook">${esc(place.hook)}</p><div class="cw-feature-lens"><span data-culture-lens-label>${esc(lensLabel())}的觀察</span><div data-culture-lens-copy="${esc(place.id)}">${paragraphs(lensText(place))}</div></div><button type="button" class="cw-primary" data-culture-open="${esc(place.id)}">打開這段故事 <span aria-hidden="true">→</span>${passport.stamps.includes(place.id) ? '<span class="cw-button-stamp">已集章</span>' : ''}</button></div></article>`;
  }
  function cardHtml(place, index) {
    return `<button type="button" class="cw-place-card" data-culture-open="${esc(place.id)}"><span class="cw-card-top"><span class="cw-card-number" aria-hidden="true">${String(index + 2).padStart(2, '0')}</span><span>${esc(themesById.get(place.themeId)?.title || '地方文化')}</span>${passport.stamps.includes(place.id) ? '<span class="cw-earned">已集章</span>' : ''}</span><span class="cw-meta">${placeMeta(place)}</span><strong>${esc(place.name)}</strong><span class="cw-card-hook">${esc(place.hook)}</span><span class="cw-card-cta">讀這段故事 <span aria-hidden="true">↗</span></span></button>`;
  }
  function resultsHtml(shown) {
    if (!shown.length) return `<div class="cw-empty"><span class="cw-empty-seal" aria-hidden="true">慢讀</span><h4>這一頁，還沒有符合的文化點。</h4><p>${districtId !== 'all' ? `目前整理的${esc(districtName(districtId))}文化點沒有符合這組條件。` : '試試地名、建築、工藝，或換一個主題。'}這份讀本是文化選讀，並非全市古蹟名錄。</p><button type="button" class="cw-primary" data-culture-clear>查看全部文化點</button></div>`;
    return `${featuredHtml(shown[0])}${shown.length > 1 ? `<div class="cw-grid" aria-label="更多文化故事">${shown.slice(1).map(cardHtml).join('')}</div>` : ''}`;
  }
  function activeFiltersHtml() {
    const active = query.trim() || themeId !== 'all' || districtId !== 'all';
    return `${districtId !== 'all' ? `<button type="button" class="cw-district-filter" data-culture-clear-district aria-label="解除${esc(districtName(districtId))}篩選">${esc(districtName(districtId))} <span aria-hidden="true">×</span></button>` : ''}${active ? '<button type="button" class="cw-text-button" data-culture-clear>清除全部篩選</button>' : ''}`;
  }
  function listHtml() {
    const shown = matchingPlaces();
    return `<section class="cw-directory"><div class="cw-intro"><div><span class="cw-eyebrow">一處地方，不只一種讀法</span><h3 id="culture-list-title" tabindex="-1">把台南，讀進日常裡。</h3><p>這次精選 ${culturePlaces.length} 處文化點，從城門、巷弄讀到水岸與聚落。<br>每段導讀都有來源；這份選讀並非全市古蹟名錄。</p></div>${passportHtml()}</div><div class="cw-angle-row"><div><span class="cw-field-label">今天，用哪個角度讀台南？</span>${lensesHtml()}</div><p class="cw-angle-note" data-culture-angle-note>${lens === 'local' ? '熟悉的地方，也有值得再看一眼的線索。' : '先認識故事，再帶著好奇觀察地方。'}</p></div><div class="cw-filters"><label for="culture-search">找一個地名，或故事裡的線索</label><div class="cw-search-row"><input id="culture-search" type="search" value="${esc(query)}" placeholder="例如：城門、鹽田、老街" autocomplete="off" maxlength="120"><button type="button" class="cw-text-button" data-culture-clear-query>清除搜尋</button></div><div class="cw-theme-filters" role="group" aria-label="依文化主題篩選"><button type="button" data-culture-theme="all" aria-pressed="${themeId === 'all'}">全部主題</button>${cultureThemes.map(theme => `<button type="button" data-culture-theme="${esc(theme.id)}" aria-pressed="${themeId === theme.id}" title="${esc(theme.subtitle)}">${esc(theme.title)}</button>`).join('')}</div><div class="cw-result-row"><p id="culture-result-count" role="status" aria-live="polite" aria-atomic="true">找到 ${shown.length} / ${culturePlaces.length} 處文化點</p><div class="cw-active-filters">${activeFiltersHtml()}</div></div></div><div class="cw-results">${resultsHtml(shown)}</div><footer class="cw-directory-footer"><p><strong>文化章是網站閱讀紀錄</strong>，答對故事小問答後留在這個瀏覽器；不代表實地到訪，也不使用定位。</p>${storageNoteHtml()}${typeof onResidents === 'function' ? '<button type="button" class="cw-text-button" data-culture-residents>去和街坊聊一段日常 →</button>' : ''}</footer></section>`;
  }
  function sourcesHtml(place) {
    return `<section class="cw-sources" aria-label="官方來源與查核日期"><h4>故事的資料從哪裡來？</h4><p>這段導讀依官方資料整理；本輯更新：<time datetime="${esc(cultureReviewedAt)}">${esc(cultureReviewedAt)}</time>。現場開放及活動異動請再查看官方公告。</p><ul>${[...new Set(place.sourceIds)].map(id => cultureSources[id]).filter(Boolean).map(source => `<li>${safeUrl(source.url) ? `<a href="${esc(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">${esc(source.title)} <span aria-hidden="true">↗</span><span class="cw-sr-only">（另開分頁）</span></a>` : `<span>${esc(source.title)}</span>`}<span>查核：${esc(source.reviewedAt || cultureReviewedAt)}</span></li>`).join('')}</ul></section>`;
  }
  function quizBodyHtml(place) {
    const answer = answers.get(place.id);
    return `<span class="cw-eyebrow">讀完，留下一枚文化章</span><h4 id="culture-quiz-title">${esc(place.quiz.question)}</h4><p class="cw-quiz-note">${passport.stamps.includes(place.id) ? '這枚文化章已在閱讀紀錄中。' : '從剛才的故事找答案；答錯可以再試。'}</p><div class="cw-quiz-options" role="group" aria-labelledby="culture-quiz-title">${place.quiz.options.map((option, index) => `<button type="button" data-culture-answer="${index}"${answer?.correct ? ' disabled' : ''} class="${answer?.index === index ? (answer.correct ? 'is-correct' : 'is-wrong') : ''}"><span class="cw-option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span>${esc(option)}</span>${answer?.index === index ? `<span class="cw-option-mark">${answer.correct ? '答對了' : '再想想'}</span>` : ''}</button>`).join('')}</div>${answer ? `<div id="culture-answer-result" class="cw-answer-result${answer.correct ? ' is-correct' : ''}" role="status" aria-live="polite" tabindex="-1"><strong>${answer.correct ? '答對了，這段地方故事留在心裡了。' : '再看一下故事裡的線索。'}</strong><p>${esc(answer.explanation)}</p>${answer.correct ? `<p>${storageAvailable ? '文化章已保存在這個瀏覽器。' : '文化章已加入這次閱讀；本機儲存暫時無法使用。'}</p>` : '<button type="button" class="cw-text-button" data-culture-retry>再答一次</button>'}</div>` : ''}`;
  }
  function storyHtml(place) {
    return `<article class="cw-story"><header class="cw-story-heading"><div><span class="cw-eyebrow">${esc(themesById.get(place.themeId)?.title || '地方文化')}</span><div class="cw-meta">${placeMeta(place)}</div><h3 id="culture-place-title" tabindex="-1">${esc(place.name)}</h3><p class="cw-story-hook">${esc(place.hook)}</p></div><figure>${themeArt(place.themeId, true)}<figcaption>原創文化意象</figcaption></figure></header><div class="cw-story-body"><section class="cw-story-section"><h4>這個地方，留下了什麼？</h4>${paragraphs(place.story)}</section><section class="cw-look-for"><span class="cw-section-number" aria-hidden="true">看</span><div><h4>到現場，留意這些線索</h4>${paragraphs(place.lookFor)}</div></section><section class="cw-reading-angle"><div class="cw-section-heading"><h4>換個角度，再讀一次</h4>${lensesHtml()}</div><span class="cw-angle-label" data-culture-lens-label>${esc(lensLabel())}的觀察</span><div data-culture-lens-copy="${esc(place.id)}">${paragraphs(lensText(place))}</div></section><aside class="cw-respect"><h4>把尊重，也帶到現場</h4>${paragraphs(place.respect)}</aside><section class="cw-quiz" aria-labelledby="culture-quiz-title">${quizBodyHtml(place)}</section>${sourcesHtml(place)}<section class="cw-next"><h4>帶著這段故事，接著走</h4><div class="cw-next-actions">${typeof onExplore === 'function' ? `<button type="button" data-culture-explore-district>認識${esc(districtName(place.districtId))} →</button>${place.attractionId ? '<button type="button" data-culture-explore-attraction>看這處景點介紹 →</button>' : ''}` : ''}${typeof onResidents === 'function' ? '<button type="button" data-culture-residents>去和街坊聊聊 →</button>' : ''}${typeof onFeedback === 'function' ? '<button type="button" data-culture-feedback>補充在地故事 →</button>' : ''}</div><button type="button" class="cw-text-button" data-culture-back>← 回到文化讀本</button><p class="cw-reading-boundary">文化章是網站閱讀紀錄，不是到訪證明，也不使用定位。</p>${storageNoteHtml()}</section></div></article>`;
  }
  function render() {
    const place = placesById.get(selectedPlaceId);
    if (view === 'story' && !place) view = 'list';
    dialog.innerHTML = `<div class="cw-shell"><header class="cw-header"><div><span class="cw-eyebrow">安心城 · 台南文化讀本</span><h2 id="culture-title">台南文化走讀</h2></div><div class="cw-header-tools">${readingButtonHtml()}<button type="button" class="cw-close" data-culture-close aria-label="關閉台南文化走讀">×</button></div></header><nav class="cw-viewbar" aria-label="文化走讀導覽">${view === 'story' ? '<button type="button" data-culture-back>← 回文化讀本</button>' : '<span>選一處，讀一段地方故事。</span>'}<span>文化章 <span class="cw-passport-total">${passport.stamps.length}</span> / ${culturePlaces.length}</span></nav><div class="cw-content">${view === 'story' ? storyHtml(place) : listHtml()}</div></div>`;
  }
  function refreshResults() {
    if (view !== 'list') return;
    const shown = matchingPlaces();
    dialog.querySelector('.cw-results').innerHTML = resultsHtml(shown);
    dialog.querySelector('#culture-result-count').textContent = `找到 ${shown.length} / ${culturePlaces.length} 處文化點`;
    dialog.querySelector('.cw-active-filters').innerHTML = activeFiltersHtml();
    dialog.querySelectorAll('[data-culture-theme]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cultureTheme === themeId)));
  }
  function updateLens(nextLens) {
    if (!['visitor', 'local'].includes(nextLens)) return;
    lens = nextLens;
    dialog.querySelectorAll('[data-culture-lens]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cultureLens === lens)));
    dialog.querySelectorAll('[data-culture-lens-label]').forEach(element => { element.textContent = `${lensLabel()}的觀察`; });
    dialog.querySelectorAll('[data-culture-lens-copy]').forEach(element => {
      const place = placesById.get(element.dataset.cultureLensCopy);
      if (place) element.innerHTML = paragraphs(lensText(place));
    });
    const note = dialog.querySelector('[data-culture-angle-note]');
    if (note) note.textContent = lens === 'local' ? '熟悉的地方，也有值得再看一眼的線索。' : '先認識故事，再帶著好奇觀察地方。';
  }
  function answerQuiz(index) {
    const place = placesById.get(selectedPlaceId);
    if (!place || answers.get(place.id)?.correct) return;
    const result = cultureQuizOutcome(place, index);
    if (!result.valid) return;
    answers.set(place.id, { index, ...result });
    if (result.correct) {
      const alreadyStamped = passport.stamps.includes(place.id);
      passport = stampCulturePlace(passport, place.id, placeIds);
      storageAvailable = saveCulturePassport(storage, passport, placeIds);
      dialog.querySelectorAll('.cw-passport-total').forEach(element => { element.textContent = String(passport.stamps.length); });
      dialog.querySelectorAll('.cw-storage-note').forEach(element => { element.hidden = storageAvailable; });
      if (!alreadyStamped) toast?.(`已收下「${place.name}」文化章。`);
    }
    dialog.querySelector('.cw-quiz').innerHTML = quizBodyHtml(place);
    focusAfterRender('#culture-answer-result');
  }

  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  // A native close event can arrive after a synchronous close-and-reopen route.
  dialog.addEventListener('close', () => { if (!dialog.open) releaseFocus(); });
  dialog.addEventListener('input', event => {
    if (event.target.id !== 'culture-search') return;
    query = event.target.value; refreshResults();
  });
  dialog.addEventListener('click', event => {
    const target = event.target.closest('button');
    if (!target || !dialog.contains(target)) return;
    if (target.hasAttribute('data-culture-close')) close();
    else if (target.hasAttribute('data-culture-back')) showList();
    else if (target.hasAttribute('data-culture-open')) showStory(target.dataset.cultureOpen);
    else if (target.hasAttribute('data-culture-lens')) updateLens(target.dataset.cultureLens);
    else if (target.hasAttribute('data-culture-theme')) { themeId = target.dataset.cultureTheme; refreshResults(); }
    else if (target.hasAttribute('data-culture-clear')) {
      query = ''; themeId = 'all'; districtId = 'all';
      dialog.querySelector('#culture-search').value = ''; refreshResults();
      focusAfterRender('#culture-search');
    } else if (target.hasAttribute('data-culture-clear-query')) {
      query = ''; dialog.querySelector('#culture-search').value = ''; refreshResults(); focusAfterRender('#culture-search');
    } else if (target.hasAttribute('data-culture-clear-district')) {
      districtId = 'all'; refreshResults(); focusAfterRender('#culture-search');
    } else if (target.hasAttribute('data-culture-answer') && /^[012]$/.test(target.dataset.cultureAnswer)) answerQuiz(Number(target.dataset.cultureAnswer));
    else if (target.hasAttribute('data-culture-retry')) {
      const place = placesById.get(selectedPlaceId);
      if (!place) return;
      answers.delete(place.id); dialog.querySelector('.cw-quiz').innerHTML = quizBodyHtml(place); focusAfterRender('[data-culture-answer]');
    } else if (target.hasAttribute('data-culture-residents') && typeof onResidents === 'function') { close(); onResidents(); }
    else if (view === 'story') {
      const place = placesById.get(selectedPlaceId);
      if (!place) return;
      if (target.hasAttribute('data-culture-explore-district') && typeof onExplore === 'function') { close(); onExplore({ kind: 'district', id: place.districtId }); }
      else if (target.hasAttribute('data-culture-explore-attraction') && place.attractionId && typeof onExplore === 'function') { close(); onExplore({ kind: 'attraction', id: place.attractionId }); }
      else if (target.hasAttribute('data-culture-feedback') && typeof onFeedback === 'function') { close(); onFeedback({ scene: 'general', persona: 'none', contextLabel: `台南文化走讀｜${place.name}` }); }
    }
  });
  return { open, close };
}
