// Original fictional encounters. Each district's two answers share one collectible.
export const encounters = {
  'shuixian-morning': {
    title: '阿雯的晚餐菜籃', invite: '找阿雯買晚餐的菜', teaser: '「騰一隻手給我，這把蔥要掉啦！」',
    question: '蔥從菜籃裡探出頭了。你要怎麼幫阿雯？', stamp: '把市場提回家', ink: '#923e30', paper: '#f9d8ad',
    choices: [
      ['接過那把蔥', '你把蔥抱在胸前，蔥尖搔到鼻子。阿雯忍住笑：「今晚那鍋湯，算你也有煮到。」'],
      ['幫她挪一挪菜籃', '你托住籃底，阿雯讓沉甸甸的蘿蔔躺平，把嫩葉放回上頭。「好，這下豆腐也有位子了。」']
    ],
    art: '<path d="M8 24h30l-4 12H13Z" fill="#c27843"/><path d="M12 24a10 10 0 0 1 20 0M13 28h21m-19 4h17m-14-7 2 9m5-9v10m5-10-1 9" fill="none"/><path d="m21 25 4-15 2 1-4 14m1-5 5-14 2 1-5 14m-7 4-3-11 2-1 3 10" fill="#72956c"/><path d="m29 22 6-12m-3 5 5-3" fill="none"/>'
  },
  'yujing-morning': {
    title: '阿禾的芒果筆記', invite: '陪阿禾記下這顆芒果', teaser: '「兩顆畫得一模一樣，這下怎麼認？」',
    question: '阿禾攤開小本子。這顆芒果旁邊，你想記哪一筆？', stamp: '枝頭有一點甜', ink: '#804817', paper: '#ffe39f',
    choices: [
      ['寫下想吃的日子', '你在旁邊畫了個星期天。阿禾朝攤商晃晃本子：「我們想留到那天切，您幫忙挑一顆？」'],
      ['畫出果皮的斑點', '你點了三個小圓點，阿禾補上一彎果梗。「像不像一張臉？這顆回家一定認得。」']
    ],
    art: '<path d="M24 14c-1 4-8 3-12 9-6 9 3 17 12 13 10-4 13-20 6-23-2-1-4 0-6 1Z" fill="#e8a33f"/><path d="M26 14c-1-5 1-8 4-10m-4 8C17 13 12 9 12 5c8-1 12 1 14 7Z" fill="#70935e"/><path d="M15 28c0 3 2 5 5 5m9-14 1-1" fill="none"/>'
  },
  'anping-afternoon': {
    title: '阿秀家的劍獅', invite: '跟阿秀看劍獅的表情', teaser: '「牠很兇嗎？你先看看那對眉毛。」',
    question: '這張劍獅的臉，回家要怎麼畫給朋友看？', stamp: '巷口的小守門員', ink: '#954832', paper: '#f6d4ba',
    choices: [
      ['先記住濃眉毛', '你把眉毛揚得高高的。阿秀跟著學，兩個人還沒開始畫，已經多了兩隻守門的獅子。'],
      ['先看嘴裡的劍', '你用手指在空中比了一條線。阿秀退到巷子旁邊點點頭：「這一筆加上去，神氣就出來了。」']
    ],
    art: '<path d="m8 16 2-8 9 4 4-4 5 4 8-4 1 9 2 6-4 4-2 6-10 4-9-4-2-5-5-4Z" fill="#cf8057"/><path d="m12 18 6-2 3 3m4 0 3-3 6 2m-16 4h1m9 0h1m-9 4 3 2 3-2m-13 4 19 1 5-2m-3-2-1 7" fill="none"/><path d="m20 10 3 4 3-4" fill="none"/>'
  },
  'dongshan-afternoon': {
    title: '阿蓉的咖啡桌', invite: '陪阿蓉聞一杯咖啡', teaser: '「先別喝，猜猜這個味道像什麼？」',
    question: '阿蓉轉過杯耳。熱氣裡，有哪個味道讓你想起家？', stamp: '山裡的一杯', ink: '#684733', paper: '#efdcc0',
    choices: [
      ['剛出爐的麵包', '「那我知道你家早上的味道了。」阿蓉把兩隻手貼在杯邊，說下回要帶一片吐司來配。'],
      ['雨後的泥土', '阿蓉把窗推開一點：「你這樣講，我眼前都有那條山路了。」你們把這四個字留在杯墊背面。']
    ],
    art: '<path d="M7 19h25v5c0 9-6 12-12 12s-13-4-13-12Z" fill="#a87755"/><path d="M32 21h3c8 0 5 12-4 11M8 37h27" fill="none"/><path d="M16 15c4-5-4-5 0-10m6 9c4-5-3-5 1-9" fill="none"/><path d="M16 25c2-4 6-4 8-2 1 3-3 7-6 7-2 0-3-2-2-5Z" fill="#efdcc0"/><path d="m17 28 5-4" fill="none"/>'
  },
  'yanshui-evening': {
    title: '榮伯的老街速寫', invite: '陪榮伯畫一扇木窗', teaser: '「整條街太大，就畫眼前這一格吧。」',
    question: '榮伯把色鉛筆分你一半。窗框旁邊還空著，你想畫什麼？', stamp: '木窗留住暮色', ink: '#684761', paper: '#ebdbe1',
    choices: [
      ['磚牆上的影子', '你塗了一小塊紫灰。榮伯指著看了半天：「明天同一扇窗，這道影子會跑去哪裡？」'],
      ['路過的人影', '你在紙角添了個提袋的人。榮伯把畫拿遠一點：「這樣好，我知道這條街有人正要回家。」']
    ],
    art: '<path d="M8 10h29v25H8Z" fill="#be8a72"/><path d="M11 13h23v19H11Z" fill="#ebc9ad"/><path d="M14 14v16m6-16v16m6-16v16m5-16v16m-19-8h20M6 36h33M7 8h31m-30 8-4 2m35 7 2-1" fill="none"/>'
  },
  'beimen-evening': {
    title: '阿海的鹽田色票', invite: '跟阿海替天光取個名', teaser: '「你看那格水，剛才還不是這個顏色。」',
    question: '雲影滑過鹽田。你想替眼前這一格取什麼名字？', stamp: '鹽田借來的天光', ink: '#366166', paper: '#cce3db',
    choices: [
      ['曬過太陽的橘子', '阿海瞇起眼：「那我給隔壁那格取名橘子皮。」你們比著兩塊水面，連晚餐的水果都想好了。'],
      ['一口薄荷冰', '阿海笑出聲：「有風的時候，真的會涼一下。」你把名字記在紙角，等下一朵雲來換色。']
    ],
    art: '<circle cx="30" cy="12" r="5" fill="#e4a66c"/><path d="M5 22h34l-4 12H9Z" fill="#9bc4bd"/><path d="m13 23-4 10m13-10-2 10m10-10 2 10m-24-6h28" fill="none"/><path d="m7 22 7-10 8 10Z" fill="#fff2d8"/><path d="m13 14 3 7M4 36h35" fill="none"/>'
  }
};

export function stampArt(card) {
  return `<svg class="lt-stamp-art" viewBox="0 0 44 42" aria-hidden="true" focusable="false" fill="none" stroke="${card.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${card.art}</svg>`;
}
