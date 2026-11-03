// 虛構街坊的任務後來信。回信只留下本機學習紀念，不代表真實案件、
// 專業判定或公開參與人數；完成資格由呼叫端的 questProgress 即時判斷。
export const LETTER_KEY = 'anxin-first-day-neighborhood-letters-v1';

export const letters = Object.freeze([
  {
    id: 'buy',
    sender: '小晴',
    title: '騎樓下，多了一本口袋筆記',
    intro: '台南午後下起小雨，小晴在騎樓等雨停，把上次的看屋問題抄進小本子。「現在我看窗景，也會記下還沒問清楚的事。下次出門，你想陪我先做哪一件？」',
    choices: [
      {
        id: 'pocket-notes',
        label: '陪她把文件與貸款問題分頁，圈出最想先問的三件事。',
        response: '小晴用兩張不同顏色的紙，分開夾好文件問題和貸款問題。「不用一次問完全部，至少知道下一句要問什麼。」雨停了，她把筆記收進帆布袋。',
        keepsake: '小晴的口袋提問本',
      },
      {
        id: 'walk-plan',
        label: '陪她畫一張生活散步圖，另記喜歡的地方與待查的問題。',
        response: '小晴從早餐攤畫到巷口，再把喜歡的採光寫在旁邊。另一頁仍留著需要文件和說明才能回答的問題。「生活喜好寫清楚，未知的事也不假裝知道。」',
        keepsake: '小晴的巷口散步圖',
      },
    ],
    servicePrompt: '想把自己的看屋筆記接著整理，可以帶著房地資料與貸款問題，到相談所查看準備清單。',
  },
  {
    id: 'sell',
    sender: '阿成',
    title: '搬家紙箱旁，空格有了名字',
    intro: '阿成在巷口買了兩杯冬瓜茶，回家繼續整理搬家紙箱。「上次你陪我把那個大數字拆開，我才發現還有幾格沒資料。」他想挑一個下午，把下一步做得更清楚。',
    choices: [
      {
        id: 'sort-folder',
        label: '一起整理明細資料夾，分成已找到、還缺少與待詢問。',
        response: '阿成替資料夾貼上三種標籤，每一張紙都找到位置；沒有資料的格子仍留白。「這樣下次討論，我就能說清楚缺哪一張，而不是只帶一個猜的數字。」',
        keepsake: '阿成的三色資料夾',
      },
      {
        id: 'moving-list',
        label: '一起排搬家待辦，把生活支出和交易待確認款項分開。',
        response: '阿成先記下紙箱、搬運和安頓新家的待辦，再把交易款項留在另一頁。「先知道有哪些事要處理，遇到不清楚的金額就標記，等有明細再補。」',
        keepsake: '阿成的搬家雙頁清單',
      },
    ],
    servicePrompt: '想整理自己的賣屋資料，可以帶著取得、出售與費用明細，到相談所查看準備清單，再接續原有工具。',
  },
  {
    id: 'legacy',
    sender: '美玲',
    title: '榕樹下，留一頁給家人說話',
    intro: '美玲在廟埕旁的榕樹下翻開家庭筆記。「上次分開寫之後，我才看見有些是家人的希望，有些是還沒找到的文件。」她想邀家人再坐下來聊一次，先從一件小事開始。',
    choices: [
      {
        id: 'family-notes',
        label: '幫每位家人留一頁，先記想法、擔心和還沒談攏的地方。',
        response: '美玲替每個人留了同樣大小的空白頁，沒有先替誰填答案。「這次我想先聽完，再把不同的想法放在一起。」茶還溫著，筆記也留著繼續討論的空間。',
        keepsake: '美玲的留白家庭筆記',
      },
      {
        id: 'document-envelope',
        label: '幫她整理文件袋，列出手邊資料與下次要補問的項目。',
        response: '美玲在文件袋外寫上現有資料、缺少資料和待問問題，再把家人的希望另外收好。「先知道手上有什麼，談到不確定的地方，就把問題記下來。」',
        keepsake: '美玲的家庭文件袋',
      },
    ],
    servicePrompt: '想接著整理家庭安排，可以帶著家人需求、現有權利文件與待確認支出，到相談所查看準備清單。',
  },
].map(letter => Object.freeze({ ...letter, choices: Object.freeze(letter.choices.map(choice => Object.freeze(choice))) })));

const letterById = new Map(letters.map(letter => [letter.id, letter]));
const emptyState = () => ({ version: 1, choices: {} });
const isRecord = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
// Read own data only: inherited values and accessors cannot become saved choices.
const ownValue = (record, key) => {
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  return descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value') ? descriptor.value : undefined;
};
const validChoice = (letter, id) => typeof id === 'string' && letter.choices.some(choice => choice.id === id);

export function normalizeLetters(raw) {
  const state = emptyState();
  try {
    if (typeof raw === 'string') {
      if (raw.length > 4096) return state;
      raw = JSON.parse(raw);
    }
    if (!isRecord(raw) || ownValue(raw, 'version') !== 1) return state;
    const choices = ownValue(raw, 'choices');
    if (!isRecord(choices)) return state;
    for (const letter of letters) {
      const id = ownValue(choices, letter.id);
      if (validChoice(letter, id)) state.choices[letter.id] = id;
    }
    return state;
  } catch {
    return emptyState();
  }
}

export function loadLetters(storage) {
  try { return normalizeLetters(storage?.getItem(LETTER_KEY)); }
  catch { return emptyState(); }
}

export function saveLetters(storage, state) {
  try {
    if (!storage || typeof storage.setItem !== 'function') return false;
    storage.setItem(LETTER_KEY, JSON.stringify(normalizeLetters(state)));
    return true;
  } catch { return false; }
}

export function chooseLetter(state, questId, choiceId, completed) {
  if (completed !== true || typeof questId !== 'string') return null;
  const letter = letterById.get(questId);
  if (!letter || !validChoice(letter, choiceId)) return null;
  const next = normalizeLetters(state);
  next.choices[questId] = choiceId;
  return next;
}
