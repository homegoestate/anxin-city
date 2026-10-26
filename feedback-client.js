const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SCENES = new Set(['general', 'buy', 'sell', 'legacy']);
const PERSONA_SCENES = { 'first-home': 'buy', 'move-home': 'buy', seller: 'sell', 'legacy-family': 'legacy' };
const SCENE_NAMES = { general: '整座安心城', buy: '買房', sell: '賣房', legacy: '傳承' };
const PERSONA_NAMES = { 'first-home': '首購小安', 'move-home': '換屋阿成', seller: '賣屋美玲', 'legacy-family': '傳承一家' };

export function isFeedbackUuid(value) {
  return typeof value === 'string' && UUID.test(value);
}

export function isIsoTimestamp(value) {
  if (typeof value !== 'string') return false;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!parts) return false;
  const [, year, month, day, hour, minute, second, , zone] = parts;
  const y = Number(year), m = Number(month), d = Number(day);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (m < 1 || m > 12 || d < 1 || d > days[m - 1] || Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) return false;
  if (zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4)) > 59)) return false;
  return Number.isFinite(Date.parse(value));
}

export function readFeedbackReceipt(status, result) {
  if ((status !== 200 && status !== 201) || !result || result.ok !== true
      || !isFeedbackUuid(result.receipt) || !isIsoTimestamp(result.createdAt)) return null;
  return Object.freeze({ receipt: result.receipt.toLowerCase(), createdAt: result.createdAt });
}

// Retry-After can be delta-seconds or any of the three HTTP-date formats.
export function parseRetryAfter(value, now = Date.now()) {
  if (typeof value !== 'string' || !Number.isFinite(now)) return null;
  const text = value.trim();
  if (/^\d+$/.test(text)) {
    const delay = Number(text) * 1000;
    return Number.isSafeInteger(delay) && Number.isSafeInteger(now + delay) ? now + delay : null;
  }
  const httpDate = /^(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT|(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), \d{2}-[A-Z][a-z]{2}-\d{2} \d{2}:\d{2}:\d{2} GMT|(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) [A-Z][a-z]{2} [ \d]\d \d{2}:\d{2}:\d{2} \d{4})$/;
  if (!httpDate.test(text)) return null;
  const timestamp = Date.parse(/^[A-Z][a-z]{2} [A-Z][a-z]{2} /.test(text) ? `${text} GMT` : text);
  return Number.isFinite(timestamp) ? Math.max(now, timestamp) : null;
}

export function retrySeconds(retryAt, now = Date.now()) {
  return Math.max(0, Math.ceil((retryAt - now) / 1000));
}

export function normalizeFeedbackContext(context = {}) {
  const scene = SCENES.has(context.scene) ? context.scene : 'general';
  const persona = PERSONA_SCENES[context.persona] === scene ? context.persona : 'none';
  const contextLabel = typeof context.contextLabel === 'string' ? Array.from(context.contextLabel.trim()).slice(0, 60).join('') : '';
  return Object.freeze({ scene, persona, contextLabel });
}

// In-memory only: the first submitted payload remains the retry payload until a
// receipt arrives or the visitor explicitly acknowledges starting another entry.
export function createFeedbackSession({ makeRequestId = () => crypto.randomUUID() } = {}) {
  let state = Object.freeze({ phase: 'editing', draft: null, attempt: null, receipt: null, failure: null, retryAt: 0 });
  const update = fields => (state = Object.freeze({ ...state, ...fields }));
  const canSend = now => {
    if (retrySeconds(state.retryAt, now) > 0) throw new Error('feedback_cooldown');
  };
  const fail = ({ reason = 'network', retryAfter = null, status = 0 } = {}, now = Date.now()) => {
    if (state.phase !== 'sending') throw new Error('feedback_not_sending');
    const fallback = status === 429 || status === 503 ? now + 30_000 : now;
    const retryAt = Math.max(state.retryAt, parseRetryAfter(retryAfter, now) ?? fallback);
    return update({ phase: 'uncertain', failure: Object.freeze({ reason, status }), retryAt });
  };
  return {
    getState: () => state,
    open(context = {}) {
      return state.draft ? state : update({ draft: normalizeFeedbackContext(context) });
    },
    setContext(context) {
      if (state.phase !== 'editing') throw new Error('feedback_locked');
      return update({ draft: normalizeFeedbackContext(context) });
    },
    start(fields, now = Date.now()) {
      if (state.phase !== 'editing') throw new Error('feedback_locked');
      canSend(now);
      const requestId = makeRequestId();
      if (!isFeedbackUuid(requestId)) throw new Error('feedback_invalid_request_id');
      const attempt = Object.freeze({
        requestId, clientId: fields.clientId, scene: fields.scene, persona: fields.persona,
        category: fields.category, rating: fields.rating, message: fields.message,
        consent: fields.consent, honeypot: fields.honeypot, siteVersion: fields.siteVersion,
      });
      update({ phase: 'sending', attempt, failure: null });
      return attempt;
    },
    retry(now = Date.now()) {
      if (state.phase !== 'uncertain' || !state.attempt) throw new Error('feedback_no_retry');
      canSend(now);
      update({ phase: 'sending', failure: null });
      return state.attempt;
    },
    receive(status, result, retryAfter = null, now = Date.now()) {
      if (state.phase !== 'sending') throw new Error('feedback_not_sending');
      const receipt = readFeedbackReceipt(status, result);
      if (receipt) return update({ phase: 'received', receipt, failure: null, retryAt: 0 });
      const reason = status === 429 ? 'rate-limited' : status === 503 ? 'unavailable'
        : status === 409 ? 'conflict' : status >= 400 && status < 500 ? 'rejected' : 'invalid-response';
      return fail({ reason, status, retryAfter }, now);
    },
    fail,
    newDraft(context = {}, { acknowledgeUnconfirmed = false } = {}) {
      if (state.phase === 'sending') throw new Error('feedback_sending');
      if (state.phase === 'uncertain' && !acknowledgeUnconfirmed) throw new Error('feedback_acknowledgement_required');
      return update({ phase: 'editing', draft: normalizeFeedbackContext(context), attempt: null, receipt: null, failure: null });
    },
  };
}

// One cancellable timer, even when a dialog is reopened or a deadline changes.
export function createRetryCountdown({ onTick, now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout }) {
  let timer = null, generation = 0;
  const stop = () => {
    generation += 1;
    if (timer !== null) clearTimer(timer);
    timer = null;
  };
  return {
    stop,
    start(retryAt) {
      stop();
      const activeGeneration = generation;
      const tick = () => {
        if (activeGeneration !== generation) return;
        timer = null;
        const remaining = retrySeconds(retryAt, now());
        onTick(remaining);
        if (activeGeneration === generation && remaining > 0) {
          timer = setTimer(tick, Math.min(1000, Math.max(1, retryAt - now())));
        }
      };
      tick();
    },
  };
}

export function formatReceiptTime(createdAt) {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).format(new Date(createdAt));
}

export function feedbackReceiptText(receipt) {
  return `宏國・易丞｜使用回饋\n收件編號：${receipt.receipt}\n收件時間：${formatReceiptTime(receipt.createdAt)}（台灣時間）\n原始時間：${receipt.createdAt}\n本回條確認網站改善意見已保存，不代表案件委任或預約成立。`;
}

function getClientId() {
  try {
    const stored = localStorage.getItem('anxin-feedback-client');
    if (isFeedbackUuid(stored)) return stored;
    const id = crypto.randomUUID();
    localStorage.setItem('anxin-feedback-client', id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function createFeedbackDialog({ endpoint, siteVersion, getCurrentScene, getCurrentPersona, toast }) {
  const dialog = document.createElement('dialog');
  dialog.id = 'feedback-dialog';
  dialog.className = 'sheet-dialog feedback-dialog';
  dialog.setAttribute('aria-labelledby', 'feedback-title');
  dialog.innerHTML = `
    <div class="dialog-top"><div><span class="eyebrow">ANXIN CITY · FEEDBACK</span><h2 id="feedback-title">宏國・易丞｜使用回饋</h2></div><button type="button" class="icon-button feedback-close" aria-label="關閉使用回饋">×</button></div>
    <p class="dialog-lead">讓安心城，更靠近您的需要。哪裡好用、哪裡卡住，或希望多看到什麼？每一則意見，都會作為改善參考。</p>
    <p class="feedback-purpose">本表單僅供網站改善，不是案件委任或聯絡預約。</p>
    <p id="feedback-context" class="tn-feedback-context"></p>
    <form id="feedback-form">
      <div class="form-row"><label>回饋類型<select name="category" required><option value="suggestion">功能或設計建議</option><option value="bug">操作問題／無法使用</option><option value="content">內容補充或勘誤</option><option value="experience">整體使用感受</option></select></label><label>相關場景<select name="scene"><option value="general">整座安心城</option><option value="buy">買房</option><option value="sell">賣房</option><option value="legacy">傳承</option></select></label></div>
      <label class="field-label">整體體驗（選填）<select name="rating"><option value="">先不評分</option><option value="5">5 分・很順手</option><option value="4">4 分・不錯</option><option value="3">3 分・還可以</option><option value="2">2 分・有點困難</option><option value="1">1 分・需要改善</option></select></label>
      <label class="field-label" for="feedback-message">想告訴我們的事<textarea id="feedback-message" name="message" rows="5" minlength="10" maxlength="2000" required placeholder="例如：點到換屋阿成後，我希望能更快找到先買後賣的說明。"></textarea></label>
      <div class="field-foot"><span>至少 10 字；含場景標記共限 2,000 字。</span><span id="feedback-length">0 / 2,000</span></div>
      <div class="trap-field" aria-hidden="true"><label>Website<input name="honeypot" tabindex="-1" autocomplete="off"></label></div>
      <label class="consent-row"><input name="consent" type="checkbox" required><span>我同意將這則回饋保存，供宏國・易丞整理與改善網站。</span></label>
      <p class="privacy-note">匿名、免登入，免填姓名與聯絡方式。請勿輸入電話、地址、身分證字號、財務明細或真實案件資料。回饋內容不會公開展示。</p>
      <p class="feedback-memory-note">草稿只暫存於目前頁面；重新整理或關閉分頁後不會保留。</p>
      <p id="feedback-locked" class="feedback-locked" hidden>這筆原內容已鎖定；重試會沿用相同內容與提交編號。</p>
      <div id="feedback-status" class="form-status" role="status" aria-live="polite"></div>
      <p id="feedback-countdown" class="feedback-countdown" hidden></p>
      <button type="submit" class="primary-button feedback-submit">送出使用回饋 <span>↗</span></button>
    </form>
    <div id="feedback-retry-actions" class="feedback-retry-actions" hidden>
      <button type="button" class="primary-button" id="feedback-retry">重試原內容 <span>↻</span></button>
      <button type="button" class="feedback-secondary" id="feedback-start-new">另寫一則</button>
    </div>
    <div id="feedback-new-confirm" class="feedback-new-confirm" hidden>
      <strong>原筆可能已經收到。</strong><p>另開會清空這裡的原草稿，建立另一筆回饋；之後無法在此重試原筆。若只是確認剛才的收件結果，請返回並使用「重試原內容」。</p>
      <div class="feedback-choice-actions"><button type="button" class="feedback-secondary" id="feedback-keep-original">返回原內容</button><button type="button" class="feedback-secondary" id="feedback-confirm-new">我了解，另開一則</button></div>
    </div>
    <div id="feedback-success" hidden>
      <div class="receipt-icon">✓</div><h3 tabindex="-1" id="feedback-success-title">謝謝，您的回饋已收到。</h3><p>意見已保存，會納入後續整理與網站改善。</p>
      <p class="receipt-label">收件編號</p><code id="feedback-receipt"></code>
      <p class="receipt-label">收件時間（台灣時間）</p><time id="feedback-created-at"></time>
      <button type="button" class="feedback-secondary" id="feedback-copy">複製收件回條</button>
      <p id="feedback-copy-status" role="status" aria-live="polite"></p>
      <label id="feedback-copy-fallback" class="field-label" hidden>可手動選取並複製回條<textarea id="feedback-copy-text" readonly rows="6" spellcheck="false"></textarea></label>
      <p class="feedback-receipt-note">本回條確認網站改善意見已保存，不代表案件委任或預約成立。</p>
      <button type="button" class="primary-button" id="feedback-again">再寫一則 <span>＋</span></button>
    </div>`;
  document.body.append(dialog);

  const $ = selector => dialog.querySelector(selector);
  const form = $('#feedback-form'), status = $('#feedback-status'), submit = $('.feedback-submit');
  const session = createFeedbackSession(), clientId = getClientId();
  const countdown = createRetryCountdown({ onTick: () => render() });
  let confirmingNew = false;

  function updateLength() {
    $('#feedback-length').textContent = `${form.elements.message.value.length} / ${form.elements.message.maxLength.toLocaleString('zh-TW')}`;
  }
  function updateContext() {
    const context = session.getState().draft;
    if (!context) return;
    const labels = [SCENE_NAMES[context.scene]];
    if (context.persona !== 'none') labels.push(PERSONA_NAMES[context.persona]);
    if (context.contextLabel) labels.push(context.contextLabel);
    $('#feedback-context').textContent = `本次回饋：${labels.join(' · ')}`;
    const prefix = context.contextLabel ? `[${context.contextLabel}]\n` : '';
    form.elements.message.maxLength = 2000 - prefix.length;
    updateLength();
  }
  function failureMessage(failure) {
    const explanations = {
      timeout: '連線等候較久，原筆可能已收到。',
      network: '連線中斷，原筆可能已收到。',
      'rate-limited': '目前送出較頻繁，請等候後再確認。',
      unavailable: '收件服務暫時忙碌，原筆可能已收到。',
      conflict: '提交編號與服務端內容不一致，原筆可能已收到；請先確認原文。',
      rejected: '服務未提供有效收件回條；若需修正欄位，請明確選擇「另寫一則」。',
      'invalid-response': '服務回應不完整，原筆可能已收到。',
    };
    return `尚未確認收件。${explanations[failure?.reason] || explanations.network}\n原內容與提交編號已保留，請用「重試原內容」再次確認，避免重複送件。`;
  }
  function render() {
    const state = session.getState(), locked = state.phase !== 'editing';
    const remaining = retrySeconds(state.retryAt);
    form.hidden = state.phase === 'received';
    form.setAttribute('aria-busy', String(state.phase === 'sending'));
    for (const field of form.elements) {
      if (field === submit) continue;
      if (field === form.elements.message) field.readOnly = locked;
      else field.disabled = locked;
    }
    $('#feedback-locked').hidden = !locked;
    submit.hidden = state.phase === 'uncertain';
    submit.disabled = state.phase !== 'editing' || remaining > 0;
    submit.innerHTML = state.phase === 'sending' ? '正在確認收件…' : '送出使用回饋 <span>↗</span>';
    const statusText = state.phase === 'sending' ? '正在確認收件。您可以先關閉此視窗，稍後再回來查看結果。'
      : state.phase === 'uncertain' ? failureMessage(state.failure) : '';
    if (status.textContent !== statusText) status.textContent = statusText;
    $('#feedback-countdown').hidden = remaining === 0 || state.phase === 'received';
    $('#feedback-countdown').textContent = remaining > 0 ? `還要等候 ${remaining} 秒才能再次送出。倒數不會自動提交；可先關閉此視窗。` : '';
    $('#feedback-retry-actions').hidden = state.phase !== 'uncertain' || confirmingNew;
    $('#feedback-retry').disabled = remaining > 0;
    $('#feedback-new-confirm').hidden = !confirmingNew || state.phase !== 'uncertain';
    $('#feedback-success').hidden = state.phase !== 'received';
    if (state.receipt) {
      $('#feedback-receipt').textContent = state.receipt.receipt;
      $('#feedback-created-at').dateTime = state.receipt.createdAt;
      $('#feedback-created-at').textContent = formatReceiptTime(state.receipt.createdAt);
      $('#feedback-copy-text').value = feedbackReceiptText(state.receipt);
    }
  }
  function refresh() {
    render();
    if (dialog.open && session.getState().phase !== 'received') countdown.start(session.getState().retryAt);
    else countdown.stop();
  }
  function resetForm(acknowledgeUnconfirmed = false) {
    session.newDraft({}, { acknowledgeUnconfirmed });
    form.reset();
    form.elements.scene.value = 'general';
    confirmingNew = false;
    $('#feedback-copy-fallback').hidden = true;
    $('#feedback-copy-status').textContent = '';
    updateContext();
    refresh();
    dialog.scrollTop = 0;
    form.elements.message.focus();
  }
  function open(context = {}) {
    const needsContext = !session.getState().draft;
    session.open({
      scene: context.scene || getCurrentScene?.() || 'general',
      persona: context.persona || getCurrentPersona?.() || 'none',
      contextLabel: context.contextLabel,
    });
    if (needsContext) form.elements.scene.value = session.getState().draft.scene;
    updateContext();
    if (!dialog.open) dialog.showModal();
    refresh();
  }
  async function send(payload) {
    refresh();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal, credentials: 'omit',
      });
      let result = null;
      try { result = await response.json(); } catch (error) { if (controller.signal.aborted) throw error; }
      session.receive(response.status, result, response.headers.get('Retry-After'));
      if (session.getState().phase === 'received') confirmingNew = false;
    } catch (error) {
      session.fail({
        reason: controller.signal.aborted || error.name === 'AbortError' ? 'timeout' : 'network',
        status: response?.status || 0, retryAfter: response?.headers.get('Retry-After') || null,
      });
    } finally {
      clearTimeout(timer);
      refresh();
      if (dialog.open && session.getState().phase === 'received') {
        dialog.scrollTop = 0;
        $('#feedback-success-title').focus();
      }
    }
    if (session.getState().phase === 'received') toast?.('回饋已保存，謝謝您的建議。');
  }

  $('.feedback-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { if (!dialog.open) countdown.stop(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  form.elements.message.addEventListener('input', updateLength);
  form.elements.scene.addEventListener('change', () => {
    session.setContext({ ...session.getState().draft, scene: form.elements.scene.value });
    updateContext();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (session.getState().phase !== 'editing' || retrySeconds(session.getState().retryAt) > 0 || !form.reportValidity()) return;
    const message = form.elements.message.value.trim();
    if (Array.from(message).length < 10) {
      status.textContent = '請再多描述一些，至少需要 10 個字。';
      form.elements.message.focus();
      return;
    }
    const context = session.getState().draft;
    const payload = session.start({
      clientId, scene: form.elements.scene.value, persona: context.persona,
      category: form.elements.category.value, rating: form.elements.rating.value ? Number(form.elements.rating.value) : null,
      message: (context.contextLabel ? `[${context.contextLabel}]\n` : '') + message,
      consent: form.elements.consent.checked, honeypot: form.elements.honeypot.value, siteVersion,
    });
    void send(payload);
  });
  $('#feedback-retry').onclick = () => {
    if (session.getState().phase !== 'uncertain' || retrySeconds(session.getState().retryAt) > 0) return;
    void send(session.retry());
  };
  $('#feedback-start-new').onclick = () => { confirmingNew = true; refresh(); $('#feedback-keep-original').focus(); };
  $('#feedback-keep-original').onclick = () => { confirmingNew = false; refresh(); $('#feedback-start-new').focus(); };
  $('#feedback-confirm-new').onclick = () => resetForm(true);
  $('#feedback-again').onclick = () => resetForm();
  $('#feedback-copy').onclick = async () => {
    const receipt = session.getState().receipt;
    if (!receipt) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(feedbackReceiptText(receipt));
      if (session.getState().receipt !== receipt) return;
      $('#feedback-copy-status').textContent = '收件回條已複製。';
      $('#feedback-copy-fallback').hidden = true;
    } catch {
      if (session.getState().receipt !== receipt) return;
      $('#feedback-copy-fallback').hidden = false;
      $('#feedback-copy-text').focus();
      $('#feedback-copy-text').select();
      $('#feedback-copy-status').textContent = '無法自動複製，已選取下方回條。電腦請按 Ctrl+C 或 ⌘C；手機可長按文字複製。';
    }
  };
  return { dialog, open };
}
