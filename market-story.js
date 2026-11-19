const market = 'shuixian-morning';
const anping = 'anping-afternoon';
const storageKey = 'anxin-market-supper.v1';
const phases = ['idle', 'invited', 'choosing', 'carrying', 'arrived', 'table', 'complete'];
const vendors = {
  greens: {
    name: '菜攤・阿青', call: '來喔，聞聞看！這把蔥甜不甜？', short: '聞聞這把蔥',
    greeting: '阿青把蔥尖轉向你。「捏一捏葉尖再聞手指。剛才阿雯買了一大把，說晚上安平有人等她開飯。你也要去湊一桌嗎？」',
    taste: '我也想聞聞看', reply: '你輕輕一捏，蔥味直竄上來。阿青笑得瞇起眼。「這個放在桌上，連在巷口的人都知道快開飯了！」'
  },
  steam: {
    name: '蒸籠攤・林伯', call: '剛起籠！要不要掀蓋聞一口？', short: '看看蒸籠裡',
    greeting: '林伯用布巾墊著，抬起竹蓋。「小心燙！這籠留給安平那一桌。阿雯忙著找人帶口信，你順路嗎？」',
    taste: '幫林伯扶一下竹蓋', reply: '蒸氣散了，白胖的炊粿上各有一粒紅點。林伯數給你看：「這一塊多留的，給最後才到的人。」'
  }
};
const clues = {
  cloth: {
    title: '藍格布角', take: '收下藍白格桌巾的布角', keep: '阿雯把一小塊藍白格布摺進你的手心。「當初阿秀做桌巾，裁下這塊送我墊菜籃。湊在一起就像一塊完整的布。」',
    hint: '靛藍和白色的小方格，一排接一排。', look: '把布角靠在桌巾旁比對', match: '你把布角湊到桌邊。靛藍和白色的方格剛好接在一起。阿秀摸著布邊：「阿雯說要拿去墊菜籃，原來她一直留著。」',
    miss: '阿秀把白碗遞給你。「碗裡的小魚很好看。阿雯今天給你的布呢？把它攤開，放在桌角比比看。」'
  },
  fish: {
    title: '紅魚碗小畫', take: '畫下白碗裡的紅魚', keep: '你照著白瓷碗裡的小紅魚，在紙上描了一條。阿雯把碗拿起來，和你的畫並排一看：「嘿，有像！阿秀一眼就會認出來。」',
    hint: '一尾紅魚在白瓷碗裡游。', look: '捧起白碗，比對碗裡的紅魚', match: '你把小畫貼在白碗旁，碗裡的紅魚像是游上了紙。阿秀笑了：「以前這條魚要吃到碗見底才找得到。你們倒好，飯還沒開就找到了！」',
    miss: '阿秀攤平桌巾給你看。「藍格真漂亮。可是你畫的這條魚，平常游在哪裡呀？」'
  }
};
const endings = {
  chair: ['挪張椅子，替晚到的人留位', '你把靠巷口的椅子挪了半步。阿雯端著粿趕到時，一手就拉得開。她在你身邊坐下：「這張椅子留得真好。」'],
  soup: ['排好湯碗，請阿秀坐著分湯', '你把碗排成一彎，碗口朝著阿秀。她坐在自己的位子上就能分湯。阿雯最後才到，面前也有熱騰騰的一碗。']
};
const art = id => id === market ? 'market-story.webp' : 'anping-story.webp';
const storyButton = (action, label, quiet = false) =>
  `<button type="button" class="ms-choice${quiet ? ' ms-quiet' : ''}" data-market-action="${action}">${label}<span aria-hidden="true">→</span></button>`;
const initial = () => ({phase: 'idle', vendor: null, question: null, clue: null, ending: null});
let remembered = initial();
let sessionOnly = false;
function valid(s) {
  if (!s || !phases.includes(s.phase)) return false;
  const i = phases.indexOf(s.phase);
  return (i < 2 ? s.question === null : ['reason','way'].includes(s.question)) &&
    (i < 3 ? s.clue === null : Object.hasOwn(clues,s.clue)) &&
    (i < 6 ? s.ending === null : Object.hasOwn(endings,s.ending)) &&
    (s.vendor === null || Object.hasOwn(vendors,s.vendor));
}
function read() {
  if (sessionOnly) return remembered;
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (valid(stored)) remembered = stored;
  } catch { /* Local progress is still usable for this visit. */ }
  return remembered;
}
function save(patch) {
  remembered = {...read(), ...patch};
  try { localStorage.setItem(storageKey, JSON.stringify(remembered)); } catch { sessionOnly = true; }
}
export function vendorCall(key) {
  const v = vendors[key];
  return `<button class="ms-call" type="button" data-market-vendor="${key}" aria-haspopup="dialog"><small>${v.name}</small><strong>${v.call}</strong></button><button class="ms-switch" type="button" data-market-switch aria-label="聽另一攤的招呼" title="聽另一攤的招呼">換攤</button>`;
}
export function makeMarketStory({openPanel, closePanel, meet, travel, visit, refresh, announce, current}) {
  let openingVendor = 'greens';
  function commit(patch) { save(patch); refresh(); }
  function entry(id, streetTicket = false) {
    const s = read();
    if (id !== market && id !== anping) return '';
    if (id === anping && !s.clue) return '';
    let label;
    if (s.phase === 'complete') label = '翻看安平的共桌手記';
    else if (id === anping) label = s.phase === 'table' ? '回去跟阿秀一起擺桌' : `帶著${clues[s.clue].title}找阿秀`;
    else if (s.clue) label = `帶${clues[s.clue].title}去安平`;
    else label = s.phase === 'idle' ? '問阿雯，今晚去哪裡吃飯' : '接著聽阿雯說今晚那桌飯';
    if (id === market && streetTicket) {
      return `<button type="button" class="ms-story-ticket" data-market-action="resume" aria-haspopup="dialog"><img src="./assets/market-story.webp" width="67" height="48" alt=""><span><small>阿雯的共桌邀請</small><strong>${label} <span aria-hidden="true">→</span></strong></span></button>`;
    }
    return `<button type="button" class="ms-entry" data-market-action="resume" aria-haspopup="dialog">${label} <span aria-hidden="true">→</span></button>`;
  }
  function journal() {
    const s = read();
    if (s.phase === 'idle') return '';
    const text = s.phase === 'complete' ? '共桌手記 · 阿秀多留的一個位子' :
      s.clue ? `口袋裡的${clues[s.clue].title} · 去安平找阿秀` : '水仙宮市場 · 阿雯今晚要擺一桌';
    return `<button type="button" class="ms-entry" data-market-action="journal">${text} <span aria-hidden="true">→</span></button>`;
  }
  function panel(id, title, step, speaker, body, actions) {
    const scene = id === market ? '水仙宮市場' : '安平巷弄';
    const spots = step === 'arrived' ? `<button type="button" class="ms-spot ms-fish" data-market-action="look-fish" aria-label="觀察圖中白碗裡的紅魚"><span>碗</span></button><button type="button" class="ms-spot ms-cloth" data-market-action="look-cloth" aria-label="觀察圖中桌上的藍白格布"><span>布</span></button>` : '';
    const instruction = spots ? '<p class="ms-observe">點圖中的碗或桌巾，也可以從下方選擇。</p>' : '';
    const alt = id === market ? '水仙宮市場的菜攤旁，阿雯展示藍白格布與紅魚白碗。' : '劍獅門旁的小院，阿秀在鋪著藍白格布的桌上擺好紅魚碗。';
    openPanel(title,`<article class="ms-page" data-market-phase="${step}"><div class="ms-figure"><img class="ms-print" width="560" height="315" src="./assets/${art(id)}" alt="${alt}">${spots}</div><div class="ms-page-text"><small class="ms-speaker">${scene} · ${speaker}</small>${body}${instruction}<div class="ms-actions">${actions}</div></div></article>`);
  }
  function openVendor(key, tasting = false) {
    if (!Object.hasOwn(vendors, key) || current() !== market) return;
    const v = vendors[key];
    openingVendor = key;
    const s = read();
    const onward = s.phase === 'complete' ? '翻開共桌手記' : s.clue ? '看看帶給阿秀的線索' : '跟著攤主的口信去找阿雯';
    panel(market, v.short, 'vendor', v.name, `<p>${tasting ? v.reply : v.greeting}</p>`,
      (tasting ? '' : storyButton('taste',v.taste)) + storyButton('awen',onward,tasting === false));
  }
  function render(miss = false) {
    const s = read(), id = current();
    if (id !== market && id !== anping) return;
    const c = clues[s.clue];
    if (s.phase === 'complete') {
      panel(anping,'阿秀多留的一個位子','complete','共桌手記',
        `<p class="ms-keepsake">已收入手記 · ${c.title}</p><p>${endings[s.ending][1]}</p><p>小安和阿成聊起買房後的日子。小安拿出還款單，阿成還帶了舊家的帳本。兩人把帳本挪到桌子中間。</p>`,
        storyButton('budget','陪小安、阿成算每月還款') + storyButton('replay','重走水仙宮，試另一條線索',true));
    } else if (id === market && c) {
      panel(market,`口袋裡的${c.title}`,'carrying','阿雯',
        `<p>${c.keep}</p><p class="ms-keepsake">要去的地方 · 安平巷弄，劍獅門旁找阿秀</p>`, storyButton('travel','跟著安平路牌去找阿秀'));
    } else if (id === market && s.phase === 'choosing') {
      const reply = s.question === 'reason' ? '「阿秀這幾天總是一個人吃。我說好，今天換我們帶菜過去，桌子可要擺得長長的。」' :
        '「看到劍獅門就到了。巷裡有好幾桌，阿秀有一眼就認得的老物件，我給你帶個樣子。」';
      panel(market,'挑一樣帶去安平','choosing','阿雯',`<p>${reply}</p><p>阿雯從籃裡拿出一角桌巾和一隻白碗。「你想憑哪一樣認出我們那桌？」</p>`,
        storyButton('cloth',clues.cloth.take) + storyButton('fish',clues.fish.take));
    } else if (id === market) {
      const intro = s.vendor === 'steam' ? '「林伯是不是又多蒸了一塊？」阿雯笑著替竹籃騰了個空位。' :
        s.vendor === 'greens' ? '「咦，你手上也有蔥香。阿青叫你來的吧？」阿雯笑著接過菜籃。' : '阿雯抬起菜籃讓你看，蘿蔔底下還墊著一方格子布。';
      panel(market,'阿雯今晚要擺一桌','invited','阿雯',`<p>${intro}「我還要等菜到齊。你能先去安平跟阿秀說一聲，今晚我們一起吃嗎？」</p>`,
        storyButton('reason','今天怎麼想起一起吃飯？') + storyButton('way','到了安平，我怎麼找到阿秀？'));
    } else if (c && s.phase === 'table') {
      panel(anping,'一起把晚飯擺上桌','table','阿秀',`<p>${c.match}</p><p>她揭開鍋蓋：「粿還在路上，我們先動手吧。你想幫哪一頭？」</p>`,
        storyButton('chair',endings.chair[0]) + storyButton('soup',endings.soup[0]));
    } else if (c) {
      panel(anping,'劍獅門旁，哪一桌？','arrived','阿秀',`<p>${miss ? c.miss : '阿秀正把桌椅搬到小院裡。「阿雯叫你來的啊！兩桌都在等晚飯，你怎麼知道是哪一桌？」'}</p><p class="ms-keepsake">你帶來的${c.title} · ${c.hint}</p>`,
        storyButton('look-cloth',clues.cloth.look) + storyButton('look-fish',clues.fish.look));
    }
  }
  function markArrival(id) {
    if (id === anping && read().phase === 'carrying') save({phase:'arrived'});
  }
  function resume() {
    const s = read(), id = current();
    if (id === market && s.phase === 'idle') commit({phase:'invited'});
    if (s.phase === 'complete' || (id === market && s.clue)) render();
    else if (id === market || (id === anping && s.clue)) meet(id);
  }
  function handle(action, trigger) {
    const s = read(), id = current();
    if (action === 'journal' && s.phase !== 'idle') {
      closePanel();
      const goal = s.clue ? anping : market;
      if (id !== goal) visit(goal);
      return resume();
    }
    if (action === 'resume') return resume();
    if (action === 'taste') return openVendor(openingVendor,true);
    if (action === 'awen' && id === market) {
      if (s.phase === 'idle' || s.phase === 'invited') commit({phase:'invited',vendor:openingVendor});
      return resume();
    }
    if ((action === 'reason' || action === 'way') && id === market && s.phase === 'invited') commit({phase:'choosing',question:action});
    else if (Object.hasOwn(clues,action) && id === market && s.phase === 'choosing') commit({phase:'carrying',clue:action});
    else if (action === 'travel' && id === market && s.clue) { closePanel(); return travel(anping); }
    else if (action.startsWith('look-') && id === anping && s.phase === 'arrived') {
      if (action !== 'look-' + s.clue) return render(true);
      commit({phase:'table'});
    } else if (Object.hasOwn(endings,action) && id === anping && s.phase === 'table') commit({phase:'complete',ending:action});
    else if (action === 'budget' && s.phase === 'complete') {
      return import('./market-budget.js?v=31.0.0').then(({openMarketBudget}) => {
        if (trigger.isConnected && trigger.closest('dialog')?.open) openMarketBudget({trigger});
      }).catch(() => announce('帳本暫時無法開啟，可以再點一次。'));
    } else if (action === 'replay' && s.phase === 'complete') {
      commit({...initial(),phase:'invited'}); closePanel();
      if (id === market) return meet(market);
      return travel(market);
    } else return;
    render();
  }
  return {entry, journal, openVendor, handle, render, markArrival, phase: () => read().phase};
}
