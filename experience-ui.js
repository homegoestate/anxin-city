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

export function createExperienceUI({ enhancements, tainanExplorer, residentChat, cultureWalk, serviceHub }) {
  const $ = selector => document.querySelector(selector);
  const trigger = $('#menu-toggle');
  const nav = $('.header-nav');
  const menu = document.createElement('dialog');
  menu.id = 'experience-menu';
  menu.className = 'experience-menu';
  menu.setAttribute('aria-labelledby', 'menu-heading');
  menu.innerHTML = `<header class="experience-dialog-top"><div><span class="office-eyebrow">安心城 · 功能選單</span><h2 id="menu-heading">想從哪裡繼續？</h2></div><button class="menu-close icon-button" aria-label="關閉功能選單">×</button></header><p class="menu-lead">第一次來，先陪一位角色做四個選擇。</p><section class="menu-primary"><h3>先練習，再把問題問清楚</h3><div data-menu-primary></div></section><details class="menu-local"><summary>也想認識台南？</summary><p>在地故事、古蹟與四季，是我們生活的延伸。</p><div data-menu-local></div></details><section class="menu-support"><h3>需要協助與準備</h3><div data-menu-support></div></section>`;
  document.body.append(menu);
  nav.setAttribute('aria-label', '安心城所有功能');
  menu.querySelector('[data-menu-primary]').append(nav);
  const primary = new Set(['people-button', 'open-checklist']);
  const local = new Set(['resident-button', 'tainan-button']);
  for (const button of [...nav.children]) {
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
  const cultureButton = document.createElement('button');
  cultureButton.textContent = '古蹟與文化走讀';
  cultureButton.onclick = () => cultureWalk.open();
  menu.querySelector('[data-menu-local]').append(cultureButton);
  // Close before the original button handler opens its destination dialog.
  menu.addEventListener('click', event => {
    if (event.target.closest('button') && !event.target.closest('.menu-close')) menu.close();
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

  // A native dialog may otherwise restore focus to a now-hidden menu item.
  document.querySelectorAll('dialog').forEach(dialog => {
    if (dialog === menu) return;
    dialog.addEventListener('close', () => requestAnimationFrame(() => {
      if (document.querySelector('dialog[open]')) return;
      const active = document.activeElement;
      if (!active || active === document.body || !active.getClientRects().length || active.closest('dialog:not([open])')) trigger.focus({preventScroll:true});
    }));
  });

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
  return {openMenu:()=>trigger.click(), closeMenu:()=>menu.close()};
}
