import { officialWebsite, lineProfile } from './service-hub.js?v=11.0.0';

// Public contact/practice information verified against the official website on 2026-10-26.
export const officeInfo = Object.freeze({
  brand: '宏國地政｜易丞地政',
  practitioners: '楊明宗地政士、楊翊晟地政士',
  phone: '06-258-2589',
  phoneHref: 'tel:062582589',
  address: '台南市北區文賢路1080巷11號',
  about: officialWebsite + 'about.html#practice-disclosure',
  contact: officialWebsite + 'contact.html'
});

export function officeCardHtml() {
  return `<section class="office-card" aria-label="事務所與執業資訊"><span class="office-eyebrow">在台南，陪您把事情想清楚</span><h3>${officeInfo.brand}</h3><p class="office-practitioners">${officeInfo.practitioners}</p><p>服務以產權、登記、稅務與交易安全為核心。兩位地政士各自獨立執業；實際受任、費用與收據依個別案件確認。</p><div class="office-contacts"><a href="${officeInfo.phoneHref}"><small>電話</small><strong>${officeInfo.phone}</strong></a><a href="${officeInfo.contact}" target="_blank" rel="noopener noreferrer"><small>服務地址</small><strong>${officeInfo.address} ↗</strong></a></div><div class="office-links"><a href="${officeInfo.about}" target="_blank" rel="noopener noreferrer">查看官網執業說明 ↗</a><a href="${lineProfile}" target="_blank" rel="noopener noreferrer">官方 LINE｜@604gpqef ↗</a></div></section>`;
}

const qualityChoices = [
  ['auto', '自動', '依裝置選擇適合的畫質。'],
  ['standard', '標準', '兼顧畫面清晰度與操作順暢。'],
  ['high', '高畫質', '呈現更多畫面細節，可能較耗電。'],
  ['economy', '省電', '降低畫面負擔，適合省電或較慢的裝置。'],
];
const regionChoices = [
  ['coast', '海風與鹽田'], ['city', '府城與日常'],
  ['plains', '田野與聚落'], ['hills', '淺山與果香'],
];

// Callbacks own city state and persistence. Setters below only synchronize this UI.
export function createExperienceUI({
  enhancements, tainanExplorer, residentChat, cultureWalk, serviceHub,
  quality = 'auto', exploreMode = 'homes', region = null,
  onQualityChange, onExploreMode, onRegionFocus, onReturnOverview,
}) {
  const $ = selector => document.querySelector(selector);
  const trigger = $('#menu-toggle');
  const nav = $('.header-nav');
  const menu = document.createElement('dialog');
  menu.id = 'experience-menu';
  menu.className = 'experience-menu';
  menu.setAttribute('aria-labelledby', 'menu-heading');
  menu.innerHTML = `<header class="experience-dialog-top"><div><span class="office-eyebrow">安心城 · 功能選單</span><h2 id="menu-heading">想從哪裡繼續？</h2></div><button type="button" class="menu-close icon-button" aria-label="關閉功能選單">×</button></header>
    <p class="menu-lead">地政士陪你練習家的選擇，也認識台南生活。</p>
    <section class="menu-primary"><h3>先練習，再把問題問清楚</h3><div data-menu-primary></div></section>
    <details class="menu-local"><summary>也想認識台南？</summary><p>在地故事、古蹟與四季，是我們生活的延伸。</p><div data-menu-local></div></details>
    <section class="menu-support"><h3>需要協助與準備</h3><div data-menu-support></div></section>
    <details class="menu-preferences"><summary>城市探索與畫質</summary><div class="experience-preferences">
      <label for="experience-quality">畫質</label>
      <select id="experience-quality" aria-describedby="experience-quality-note">${qualityChoices.map(([value, title]) => `<option value="${value}">${title}</option>`).join('')}</select>
      <p id="experience-quality-note" class="preference-note" role="status" aria-live="polite"></p>
      <fieldset class="explore-mode-field"><legend>探索圖層</legend><div class="experience-mode-options">
        <button type="button" data-explore-mode="homes" aria-pressed="false">家的選擇</button>
        <button type="button" data-explore-mode="tainan" aria-pressed="false">台南風物</button>
      </div><p class="preference-note">切換城市上的探索標記。</p></fieldset>
      <fieldset class="experience-region-field" hidden><legend>前往台南主題區</legend><div class="experience-region-options">${regionChoices.map(([id, title]) => `<button type="button" data-region-focus="${id}" aria-pressed="false">${title}</button>`).join('')}</div><p class="preference-note">主題分組用來探索地方特色，並非行政分區圖。</p></fieldset>
      <button type="button" class="experience-overview">回到城市全景</button>
      <p class="experience-city-status preference-note" role="status" hidden>城市尚未就緒，仍可使用上方任務與台南資料。</p>
    </div></details>`;
  document.body.append(menu);
  nav.setAttribute('aria-label', '安心城所有功能');
  menu.querySelector('[data-menu-primary]').append(nav);
  const primary = new Set(['people-button', 'open-checklist']);
  const local = new Set(['resident-button', 'tainan-button']);
  for (const button of [...nav.children]) {
    button.classList.remove('icon-button');
    button.classList.add('menu-action');
    button.setAttribute('data-menu-action', '');
    button.type = 'button';
    if (local.has(button.id)) menu.querySelector('[data-menu-local]').append(button);
    else if (!primary.has(button.id)) menu.querySelector('[data-menu-support]').append(button);
  }
  const label = (id, text) => { const e = $(id); if (e) e.textContent = text; };
  label('#people-button', '選一位角色，開始人生任務');
  label('#service-hub-button', '事務所・官網・官方 LINE');
  $('#service-hub-button')?.setAttribute('aria-label','事務所、官網與官方 LINE');
  label('#feedback-button', '使用回饋');
  label('#help-button', '操作說明');
  $('#help-button')?.classList.remove('icon-button');
  const firstDayLink = document.createElement('a');
  firstDayLink.className = 'menu-action first-day-menu-link';
  firstDayLink.setAttribute('data-menu-action', '');
  firstDayLink.href = './first-day/';
  firstDayLink.textContent = '街區冒險｜小安在台南的第一天 →';
  menu.querySelector('[data-menu-primary]').prepend(firstDayLink);
  const cultureButton = document.createElement('button');
  cultureButton.type = 'button';
  cultureButton.className = 'menu-action';
  cultureButton.setAttribute('data-menu-action', '');
  cultureButton.textContent = '古蹟與文化走讀';
  cultureButton.onclick = () => cultureWalk.open();
  menu.querySelector('[data-menu-local]').append(cultureButton);
  // Close before the original button handler opens its destination dialog.
  menu.addEventListener('click', event => {
    if (event.target.closest('[data-menu-action]')) menu.close();
  }, true);
  trigger.onclick = () => { menu.showModal(); trigger.setAttribute('aria-expanded', 'true'); };
  menu.querySelector('.menu-close').onclick = () => menu.close();
  menu.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    requestAnimationFrame(() => { if (!document.querySelector('dialog[open]')) trigger.focus({preventScroll:true}); });
  });
  menu.addEventListener('click', event => {
    if (event.target !== menu) return;
    const r = menu.getBoundingClientRect();
    if (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) menu.close();
  });

  const qualitySelect = menu.querySelector('#experience-quality');
  const qualityNote = menu.querySelector('#experience-quality-note');
  const modeButtons = [...menu.querySelectorAll('[data-explore-mode]')];
  const regionButtons = [...menu.querySelectorAll('[data-region-focus]')];
  const regionField = menu.querySelector('.experience-region-field');
  const overviewButton = menu.querySelector('.experience-overview');
  quality = qualityChoices.some(([id]) => id === quality) ? quality : 'auto';
  exploreMode = ['homes', 'tainan'].includes(exploreMode) ? exploreMode : 'homes';
  region = regionChoices.some(([id]) => id === region) ? region : null;

  function setQuality(mode) {
    const choice = qualityChoices.find(([id]) => id === mode);
    if (!choice) return quality;
    quality = mode;
    qualitySelect.value = quality;
    qualityNote.textContent = choice[2];
    return quality;
  }
  function setExploreMode(mode) {
    if (!['homes', 'tainan'].includes(mode)) return exploreMode;
    exploreMode = mode;
    modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.exploreMode === mode)));
    regionField.hidden = mode !== 'tainan';
    return exploreMode;
  }
  function setRegionFocus(id) {
    if (id !== null && !regionChoices.some(([value]) => value === id)) return region;
    region = id;
    regionButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.regionFocus === id)));
    return region;
  }
  function setCityAvailable(available) {
    const ready = Boolean(available);
    modeButtons.forEach(button => { button.disabled = !ready || typeof onExploreMode !== 'function'; });
    regionButtons.forEach(button => { button.disabled = !ready || typeof onRegionFocus !== 'function'; });
    overviewButton.disabled = !ready || typeof onReturnOverview !== 'function';
    menu.querySelector('.experience-city-status').hidden = ready;
  }
  qualitySelect.disabled = typeof onQualityChange !== 'function';
  qualitySelect.addEventListener('change', () => {
    setQuality(qualitySelect.value);
    if (typeof onQualityChange === 'function') onQualityChange(quality);
  });
  modeButtons.forEach(button => button.addEventListener('click', () => {
    setExploreMode(button.dataset.exploreMode);
    if (typeof onExploreMode === 'function') onExploreMode(exploreMode);
  }));
  regionButtons.forEach(button => button.addEventListener('click', () => {
    setRegionFocus(button.dataset.regionFocus);
    setExploreMode('tainan');
    menu.close();
    // Focusing a region implies the Tainan layer; do not emit a second mode callback.
    if (typeof onRegionFocus === 'function') onRegionFocus(region);
  }));
  overviewButton.addEventListener('click', () => {
    setRegionFocus(null);
    menu.close();
    if (typeof onReturnOverview === 'function') onReturnOverview();
  });
  setQuality(quality);
  setExploreMode(exploreMode);
  setRegionFocus(region);
  setCityAvailable(true);

  $('#start-explore').onclick = () => enhancements.openPeople();
  $('#start-tainan').onclick = () => tainanExplorer.open();
  $('#office-info').onclick = () => serviceHub.open();
  $('#skip-to-mission').onclick = event => { event.preventDefault(); enhancements.openPeople(); };
  const hub = $('#service-hub');
  hub.querySelector('h2').textContent = '認識我們，把下一步問清楚。';
  hub.querySelector('.hub-lead').insertAdjacentHTML('afterend', officeCardHtml());
  hub.setAttribute('aria-label', '事務所、官網與官方 LINE');
  const people = $('#people-dialog');
  people.querySelector('h2').textContent = '從哪個角色開始？';
  people.querySelector('.dialog-lead').textContent = '四個選擇，看見不同結果。人物與數字為教學假設。';
  people.querySelector('.keyboard-hint').textContent = '可以重選比較，進度留在這台裝置。';

  // Capture also covers dialogs created later by a lazy feature. Native close does not bubble.
  document.addEventListener('close', event => {
    if (event.target === menu || event.target.tagName !== 'DIALOG') return;
    requestAnimationFrame(() => {
      if (document.querySelector('dialog[open]')) return;
      const active = document.activeElement;
      if (!active || active === document.body || !active.getClientRects().length || active.closest('dialog:not([open])')) trigger.focus({preventScroll:true});
    });
  }, true);

  // Keep the compact toolbar usable without covering the city on a small phone.
  const controls = $('.scene-tools');
  const toggle = document.createElement('button');
  toggle.id = 'view-tools-toggle'; toggle.className = 'view-tools-toggle';
  toggle.type='button'; toggle.textContent='視角'; toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-controls','city-view-tools');
  const panel = document.createElement('div'); panel.id='city-view-tools'; panel.className='view-tools-panel';
  while (controls.firstChild) panel.append(controls.firstChild);
  controls.append(toggle,panel);
  toggle.onclick=()=>{const next=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(next));controls.classList.toggle('is-expanded',next);};
  controls.addEventListener('keydown',event=>{if(event.key==='Escape'){controls.classList.remove('is-expanded');toggle.setAttribute('aria-expanded','false');toggle.focus();event.stopPropagation();}});
  return {
    openMenu:()=>trigger.click(), closeMenu:()=>menu.close(),
    setQuality, setExploreMode, setRegionFocus, setCityAvailable,
    getPreferences:()=>({quality, exploreMode, region}),
  };
}
