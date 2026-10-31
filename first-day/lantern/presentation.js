// Presentation only: never changes story choices, financial formulas or original save data.
export const CAST={
 xiaoan:{name:'小安',column:0,greeting:'「有你一起走，好像沒那麼陌生了。」'},
 aho:{name:'阿荷',column:1,greeting:'「欸，你來啦！慢慢看，沒關係。」'},
 bo:{name:'博伯',column:2,greeting:'「來，旁邊還有位子。」'},
 momo:{name:'沫沫',column:3,greeting:'「等一下，我把你也畫進去！」'},
 yang:{name:'楊代書',column:4,greeting:'「你好，家的事，我們一起問清楚。」'}
};
export const STOPS=[
 {id:'aho',district:'lane',kind:'resident',name:'阿荷',role:'文具店・今晚的邀請卡',x:130,y:440},
 {id:'bo',district:'lane',kind:'resident',name:'博伯',role:'長椅邊・北勢街的故事',x:360,y:440},
 {id:'momo',district:'lane',kind:'resident',name:'沫沫',role:'畫板旁・把街坊畫進來',x:870,y:220},
 {id:'yang',district:'lane',kind:'office',name:'宏國地政 × 易丞地政',role:'楊代書・家的事一起問清楚',x:870,y:440},
 {id:'street',district:'lane',kind:'place',name:'港街轉角',role:'神農街與五條港',x:620,y:220},
 {id:'temple',district:'lane',kind:'place',name:'街屋裡的廟',role:'認識金華府',x:360,y:220}
];
export function dialoguePages(lines,limit=64){
 const pages=[];
 for(const line of lines){let remaining=String(line);while(remaining.length>limit){let cut=-1;for(let i=Math.min(limit,remaining.length-1);i>=Math.floor(limit*.55);i--)if('。！？；，、'.includes(remaining[i])){cut=i+1;break;}if(cut<0)cut=limit;pages.push(remaining.slice(0,cut));remaining=remaining.slice(cut);}if(remaining)pages.push(remaining);}
 return pages;
}
export function sceneCast(state,speaker){
 const active=speaker.startsWith('阿荷')?'aho':speaker.startsWith('博伯')?'bo':speaker.startsWith('沫沫')?'momo':speaker.startsWith('楊')?'yang':'xiaoan';
 let ids=['xiaoan',active==='xiaoan'?'aho':active];
 if(state.node.startsWith('bo-'))ids=['xiaoan','bo'];
 if(state.node.startsWith('momo-'))ids=['xiaoan','momo'];
 if(state.node==='quiet')ids=['xiaoan'];
 if(['rain','rain-after','card','hang','ending'].includes(state.node))ids=['xiaoan','aho','bo','momo'];
 return {active,ids};
}
export function nextDestination(s){if(s.node==='hub')return s.visited.includes('bo')?'momo':'bo';if(s.node.startsWith('bo-'))return 'bo';if(s.node.startsWith('momo-'))return 'momo';return 'aho';}
