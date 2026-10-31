import {CHAPTERS, REVIEWED_AT, asset, portrait} from './data.js?v=17.0.0';
import {STORAGE_KEY, fresh, restore, transition, collected, postcardText} from './state.js?v=17.0.0';
import {officialWebsite, lineMessage} from '../service-hub.js?v=11.0.0';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const site = path => new URL('../' + path, import.meta.url).href;
const link = (url, text, cls = '') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>`;
const countLabel = state => `${collected(state).length} / 4 張明信片`;

export function mountFucheng(host, {onCulture, onDistrict, onFeedback, storage: suppliedStorage, initialState} = {}) {
  let storage, state = fresh(), available = true, feedbackTopic = '想看更多地方', feedbackDraft = '';
  try { storage = suppliedStorage === undefined ? window.localStorage : suppliedStorage; state = restore(storage?.getItem(STORAGE_KEY)); available = Boolean(storage); } catch { available = false; }
  if (initialState) state = restore(initialState);
  host.classList.add('fc-app');
  function save() { try { if (!storage) throw Error('unavailable'); storage.setItem(STORAGE_KEY, JSON.stringify(state)); available = true; } catch { available = false; } }
  function go(action, focus = '[data-fc-heading]') { state = transition(state, action); save(); render(); host.querySelector(focus)?.focus(); }
  function sources(c) {
    return `<details class="fc-sources"><summary>這段地方知識，從哪裡來？</summary><p>${link(c.source.url, c.source.title)}</p><p>來源更新：${c.source.updated || '原頁未標示'} · 本次查核：${REVIEWED_AT}</p><p>地方知識依官方資料整理；角色對話為創作。插畫呈現氣氛，並非現地照片或古蹟復原圖。</p></details>`;
  }
  function cards() {
    return `<div class="fc-chapters">${CHAPTERS.map((c, i) => `<button type="button" data-fc-open="${c.id}" class="fc-chapter-card"><img src="${asset(c.image)}" alt="" width="768" height="512" loading="lazy"><span><small>第 ${i + 1} 幕 · ${esc(c.theme)}</small><strong>${esc(c.name)}</strong><em>${state.choices[c.id] === undefined ? '走進這段故事 →' : '已收進明信片 · 再看看 →'}</em></span></button>`).join('')}</div>`;
  }
  function intro() {
    return `<section class="fc-intro"><div class="fc-intro-copy"><p class="fc-eyebrow">FOUR LITTLE STORIES OF TAINAN</p><h2 data-fc-heading tabindex="-1">府城，<br>值得慢一點。</h2><p class="fc-lede">替街坊的小展覽，<br>帶回四張有故事的明信片。</p><p>跟著博伯與沫沫，從巷子走進城門、紅牆與港口。每次選一個好奇的細節，就多認識一點台南。</p><button type="button" class="fc-primary" data-fc-action="begin">${collected(state).length ? '接著收集故事' : '跟著街坊出發'} <span aria-hidden="true">→</span></button><p class="fc-small">選你想看的，沒有答題分數。四幕可分開慢慢玩。</p></div><figure class="fc-intro-art"><img src="${asset('shennong')}" alt="以台南老街為靈感的街屋與暖燈插畫" width="768" height="512" fetchpriority="high"><figcaption><span>巷口的燈亮了</span><b>台南<br>慢行</b></figcaption></figure></section><div class="fc-section-line"><div><span class="fc-eyebrow">YOUR LITTLE EXHIBITION</span><h3>從你喜歡的風景開始</h3></div><span>${countLabel(state)}</span></div>${cards()}<p class="fc-caption">四幕串起地方故事，並非建議步行路線；各地距離與開放資訊請另查官方導覽。場景插畫與人物情節為創作。</p>`;
  }
  function chapter() {
    const index = CHAPTERS.findIndex(c => c.id === state.active), c = CHAPTERS[index];
    const picked = state.choices[c.id], chosen = c.choices[picked];
    return `<nav class="fc-steps" aria-label="府城四幕">${CHAPTERS.map((part, i) => `<button type="button" data-fc-open="${part.id}" ${part.id === c.id ? 'aria-current="step"' : ''}><i aria-hidden="true">${state.choices[part.id] === undefined ? String(i + 1).padStart(2, '0') : '✓'}</i><span>${esc(part.name)}</span></button>`).join('')}</nav><section class="fc-stage"><div class="fc-scene"><figure><img src="${asset(c.image)}" alt="${esc(c.name)}主題場景想像插畫，非古蹟復原圖" width="768" height="512"><figcaption><span>第 ${index + 1} 幕</span><strong>${esc(c.name)}</strong><small>${esc(c.theme)}</small></figcaption></figure><div class="fc-scene-note"><span class="fc-seal">${c.word}</span><p>看風景，也把故事帶回去。<br><small>場景想像插畫 · 非現地照片</small></p></div><div class="fc-place-actions"><button type="button" data-fc-culture="${c.placeId}">閱讀完整文化介紹 ↗</button><button type="button" data-fc-district="${c.districtId}">再認識這一區 ↗</button></div></div><div class="fc-story"><p class="fc-eyebrow">${esc(c.theme)}</p><h2 data-fc-heading tabindex="-1">${esc(c.name)}</h2><div class="fc-guide"><img src="${portrait(c.guide)}" alt="${esc(c.speaker)}" width="246" height="410"><div><strong>${esc(c.speaker)}</strong><span>${esc(c.role)}</span></div></div><p class="fc-opening">${esc(c.opening)}</p><h3 class="fc-prompt">${esc(c.prompt)}</h3><div class="fc-choices" role="group" aria-label="選擇想認識的細節">${c.choices.map((choice, i) => `<button type="button" data-fc-choose="${i}" aria-pressed="${picked === i}"><span class="fc-choice-no" aria-hidden="true">${picked === i ? '✓' : i === 0 ? '左' : '右'}</span><span><small>${esc(choice.label)}</small><strong>${esc(choice.question)}</strong></span><span aria-hidden="true">→</span></button>`).join('')}</div>${chosen ? `<section class="fc-reveal" aria-labelledby="fc-answer-title"><h3 id="fc-answer-title" data-fc-answer tabindex="-1">${esc(chosen.question)}</h3><p class="fc-reaction">${esc(chosen.reaction)}</p><p class="fc-fact">${esc(chosen.fact)}</p><div class="fc-memory"><span>這張卡，記住這一句</span><strong>${esc(chosen.memory)}</strong></div><p class="fc-note">${esc(chosen.note)}</p><p class="fc-bridge">${esc(c.bridge)}</p><button type="button" class="fc-primary" data-fc-action="next">${index === CHAPTERS.length - 1 ? '看看我的府城小展覽' : '帶著這張卡，接著走'} <span aria-hidden="true">→</span></button><p class="fc-small">也可以點另一個選項，換一個角度看。</p></section>` : ''}${sources(c)}</div></section>`;
  }
  function book() {
    const found = collected(state), complete = found.length === 4;
    return `<section class="fc-book"><header class="fc-book-heading"><p class="fc-eyebrow">A LITTLE EXHIBITION, BY YOU</p><h2 data-fc-heading tabindex="-1">${complete ? '你眼裡的台南，開展了。' : '把剛才的發現，留下來。'}</h2><p>${complete ? '四張明信片，四個你親自選下的觀察。下次走進台南，風景會多一層意思。' : '每一張卡，都有你選下的一個角度。想繼續時，街坊還在等你。'}</p><span class="fc-book-count">${countLabel(state)}</span></header><div class="fc-postcards">${found.map(c => `<article class="fc-postcard"><img src="${asset(c.image)}" alt="${esc(c.name)}主題插畫" width="768" height="512" loading="lazy"><div><span class="fc-eyebrow">${esc(c.choices[state.choices[c.id]].label)}</span><h3>${esc(c.name)}</h3><p>${esc(c.choices[state.choices[c.id]].memory)}</p><button type="button" data-fc-open="${c.id}">換個角度，再看一次 →</button></div></article>`).join('') || '<p class="fc-empty">你的展覽，從第一個好奇開始。</p>'}</div><div class="fc-book-actions"><button type="button" class="fc-primary" data-fc-action="${complete ? 'home' : 'begin'}">${complete ? '回到四幕，重訪喜歡的地方' : '繼續收集故事'} →</button>${found.length ? '<button type="button" class="fc-secondary" data-fc-copy>複製我的明信片文字</button>' : ''}</div><p class="fc-status" data-fc-status role="status"></p><textarea class="fc-copy-fallback" data-fc-copy-fallback hidden readonly aria-label="可手動複製的明信片文字"></textarea><p class="fc-caption">這是網站閱讀紀錄，非實際到訪證明。${available ? '明信片保存在這個瀏覽器，清除資料或換裝置不會同步。' : '此瀏覽器暫時無法保存；仍可繼續遊玩及複製明信片。'}</p><section class="fc-feedback"><div><p class="fc-eyebrow">YOUR VOICE, OUR NEXT STORY</p><h3>下一張台南，想看什麼？</h3><p>在地故事、想認識的地方，或哪裡可以做得更好，都可以告訴我們。</p></div><div class="fc-feedback-form"><div class="fc-feedback-topics" role="group" aria-label="回饋方向">${['想看更多地方', '我有在地故事', '畫面或操作問題'].map(t => `<button type="button" data-fc-topic="${t}" aria-pressed="${feedbackTopic === t}">${t}</button>`).join('')}</div><label for="fc-feedback-text">想補充的一句話 <span>（選填，最多 300 字）</span></label><textarea id="fc-feedback-text" maxlength="300" rows="3" placeholder="例如：下次想看鹽水的老街故事。">${esc(feedbackDraft)}</textarea><button type="button" class="fc-secondary" data-fc-review>先看看我要分享的內容 →</button><div class="fc-feedback-review" data-fc-review-box hidden><p>確認這段話，再開啟官方 LINE：</p><pre data-fc-review-text></pre><a class="fc-primary" data-fc-send target="_blank" rel="noopener noreferrer">開啟官方 LINE，確認送出 ↗</a><p class="fc-small">由你在 LINE 確認傳送，本頁不會自動送出。</p></div>${typeof onFeedback === 'function' ? '<button type="button" class="fc-text-link" data-fc-original-feedback>也可以使用原有建議表單 →</button>' : ''}</div></section><aside class="fc-company"><div><span class="fc-eyebrow">宏國地政｜易丞地政</span><h3>認識地方，也陪你想清楚家的事。</h3><p>從台南的故事，到買房、換屋、賣屋與傳承，帶著你的問題，找到適合的下一步。</p></div><div>${link(site('first-day/lantern/'), '和四位主角試試人生選擇', 'fc-secondary')}${link(officialWebsite, '前往官方網站', 'fc-text-link')}</div></aside></section>`;
  }
  function render() {
    host.innerHTML = `<div class="fc-toolbar"><button type="button" data-fc-action="home" aria-label="回府城四段散步首頁">府城四段散步</button><button type="button" data-fc-action="book">我的小展覽 <span>${collected(state).length} / 4</span></button></div><div class="fc-content">${state.view === 'intro' ? intro() : state.view === 'chapter' ? chapter() : book()}</div>`;
  }
  async function click(event) {
    const button = event.target.closest('button'); if (!button || !host.contains(button)) return;
    if (button.dataset.fcAction) return go({type: button.dataset.fcAction});
    if (button.dataset.fcOpen) return go({type: 'open', id: button.dataset.fcOpen});
    if (button.hasAttribute('data-fc-choose')) return go({type: 'choose', index: Number(button.dataset.fcChoose)}, '[data-fc-answer]');
    if (button.dataset.fcCulture) {
      if (onCulture) onCulture({placeId: button.dataset.fcCulture});
      else window.open(site('?start=culture&place=' + encodeURIComponent(button.dataset.fcCulture)), '_blank', 'noopener,noreferrer');
    }
    if (button.dataset.fcDistrict) {
      if (onDistrict) onDistrict(button.dataset.fcDistrict);
      else window.open(site('?start=tainan&district=' + encodeURIComponent(button.dataset.fcDistrict)), '_blank', 'noopener,noreferrer');
    }
    if (button.hasAttribute('data-fc-copy')) {
      const text = postcardText(state), status = host.querySelector('[data-fc-status]');
      try { await navigator.clipboard.writeText(text); if (status.isConnected) status.textContent = '明信片文字已複製，可以留給自己，也可以分享給朋友。'; }
      catch { const area = host.querySelector('[data-fc-copy-fallback]'); if (!area) return; area.hidden = false; area.value = text; area.focus(); area.select(); status.textContent = '瀏覽器未允許自動複製，請選取下方文字手動複製。'; }
    }
    if (button.dataset.fcTopic) { feedbackTopic = button.dataset.fcTopic; host.querySelectorAll('[data-fc-topic]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fcTopic === feedbackTopic))); host.querySelector('[data-fc-review-box]').hidden = true; }
    if (button.hasAttribute('data-fc-review')) {
      const text = ['府城四段散步｜使用回饋', '方向：' + feedbackTopic, '已讀故事：' + (collected(state).map(c => c.name).join('、') || '準備出發'), feedbackDraft.trim() ? '我的補充：' + feedbackDraft.trim() : '想請團隊留意這個方向。'].join('\n');
      host.querySelector('[data-fc-review-text]').textContent = text;
      host.querySelector('[data-fc-send]').href = lineMessage(text);
      host.querySelector('[data-fc-review-box]').hidden = false;
      host.querySelector('[data-fc-send]').focus();
    }
    if (button.hasAttribute('data-fc-original-feedback')) onFeedback?.({scene: 'general', persona: 'none', contextLabel: '府城四段散步｜' + feedbackTopic});
  }
  function input(event) { if (event.target.id === 'fc-feedback-text') { feedbackDraft = event.target.value.slice(0, 300); host.querySelector('[data-fc-review-box]').hidden = true; } }
  host.addEventListener('click', click); host.addEventListener('input', input); render();
  return {destroy() { host.removeEventListener('click', click); host.removeEventListener('input', input); }, getState: () => restore(state)};
}
