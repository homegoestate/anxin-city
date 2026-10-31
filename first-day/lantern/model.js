// Fictional neighbors and events. Historical notes cite their own primary sources.
export const SOURCES = {
  street:{title:'神農街｜國家文化記憶庫（臺南市政府文化局建檔）',url:'https://tcmb.culture.tw/zh-tw/detail?id=273628&indexCode=Culture_Place',checked:'2026-10-31'},
  temple:{title:'金華府｜內政部臺灣宗教文化地圖',url:'https://taiwangods.moi.gov.tw/Religious_Culture/html/Cultural/3_0011.aspx?i=240',checked:'2026-10-31'}
};
export const STORAGE_KEY='anxin-lantern-story-v1';
const option=(id,label,to,extra={})=>({id,label,to,...extra});
export function fresh(){return {node:'arrival',approach:null,bo:null,momo:null,rain:null,heading:null,visited:[],trail:[]};}
export function view(s){
 const v=(chapter,scene,speaker,title,lines,choices,extra={})=>({chapter,scene,speaker,title,lines,choices,...extra});
 switch(s.node){
 case 'arrival':return v('序幕','wide','小安','今晚，巷口留一盞燈',[
   '行李還在新家的玄關，小安先走出來透口氣。雨剛停，木窗裡透出暖光，巷口有人在搬椅子。',
   '一張畫著街屋的紙，被風吹到鞋尖前。文具店裡傳來一聲：「欸——幫我留住那張！」'
 ],[option('hold','用手壓住紙角','aho',{set:{approach:'help'}}),option('pick','撿起來，看一眼畫面','aho',{set:{approach:'look'}})]);
 case 'aho':return v('第一幕 · 一張少了什麼的畫','shop','阿荷｜文具店老闆','畫了房子，還少了這條街',[
   s.approach==='help'?'「謝啦，動作真快。」阿荷接過紙，又把它轉向你。':'你看見一排整齊的門窗，卻沒有半個人。「你也發現了？」阿荷笑著說。',
   '「今晚街坊想在巷口坐坐，沫沫畫了邀請卡。屋頂、窗戶都畫了，總覺得還沒畫完。」',
   '她遞來一支鉛筆：「博伯記得這裡以前的故事，沫沫在畫今天的街坊。你替這張卡帶回一點什麼，好不好？」'
 ],[option('accept','接過鉛筆，走進街區','hub')],{item:'一張還沒畫完的邀請卡'});
 case 'hub':{
   const first=s.visited.length===0;
   const choices=[];
   if(!s.visited.includes('bo'))choices.push(option('visit-bo','走向長椅，找博伯','bo-intro',{spot:'bench'}));
   if(!s.visited.includes('momo'))choices.push(option('visit-momo','走到畫板旁，找沫沫','momo-intro',{spot:'street'}));
   return v('第二幕 · 把地方走成故事','wide','巷口','先往哪邊走？',[
     first?'博伯把舊筆記攤在膝上；沫沫蹲在另一邊，畫一扇不像店門的門。':'你把新添的那一筆收好。巷子還是同一條，看起來卻比剛才多了一點意思。',
     first?'不用猜對答案。挑一個人走近，故事就會接下去。':'另一位鄰居也替今晚的邀請卡留著一個位置。'
   ],choices,{pause:true});
 }
 case 'quiet':return v('巷邊的一小會','bench','小安','先坐一下，也很好',[
   '店裡的杯子輕輕碰了一聲。有人把門前的盆栽移到還濕著的石板旁。',
   '小安把鉛筆放在膝上。剛搬來時，這條巷子只是地址；現在，已經能分辨誰的聲音從哪扇門傳出來。'
 ],[option('rest-done','起身，繼續剛才的散步','hub')]);
 case 'bo-intro':return v('第二幕 · 博伯的那一頁','bench','博伯｜整理舊街故事的鄰居','沒有船的巷子，為什麼老說起港？',[
   s.visited.includes('momo')?'「沫沫說你替她找到了畫人的辦法。」博伯往旁邊挪一點，讓出半張長椅。':'「新搬來的？坐。站著看故事，腳會先累。」博伯把筆記攤開。',
   '「我原本想替今晚寫一句『老街很漂亮』，又覺得太少。你看——這裡以前叫北勢街。」',
   '他把畫著貨物與街屋的筆記放到你手邊，再指向巷子上方的窗。'
 ],[option('look-window','順著他的手，抬頭看窗','bo-window'),option('look-name','翻開寫著「北勢街」的那頁','bo-name')]);
 case 'bo-window':return v('第二幕 · 抬頭之後','windows','博伯','原來窗後還有另一段時間',[
   '你本來只看店門。抬起頭，才注意到上面的木窗、屋瓦，和不同年代留下的立面。',
   '「看同一條街，眼睛放高一點，就像多翻一頁。」博伯把筆記往你這裡推近。'
 ],[option('window-note','把街屋的輪廓描進卡片','bo-story')],{fact:{source:'street',title:'你正在看的台南｜神農街',text:'神農街部分街段保留二層樓鋪瓦街屋，立面可見清代、日治等不同年代的風貌。遊戲畫面是以此為靈感的原創場景。'}});
 case 'bo-name':return v('第二幕 · 舊名字的線索','bench','博伯','北勢街，把港口留在名字裡',[
   '你用鉛筆沿著「北勢街」三個字輕輕畫了一圈。旁邊不是景點清單，而是貨物、店門，和來來往往的人。',
   '「所以，這條街不只是讓人經過，」小安說，「也曾讓東西、工作和日子聚在一起。」'
 ],[option('name-note','把舊名字記在畫的背面','bo-story')],{fact:{source:'street',title:'你正在看的台南｜五條港',text:'神農街舊稱北勢街，位於昔日五條港區域。河港、碼頭與商業往來，是理解這一帶街屋生活的重要背景。'}});
 case 'bo-story':return v('第二幕 · 讓舊街走進今晚','bench','博伯','「那你想替今晚，留哪一筆？」',[
   '五條港的河港與商業，曾把貨物和人帶進這片街區；今天走過神農街，名字與街屋仍能讓人追問那段往來。',
   '博伯合上筆記：「不用把整本抄走。帶一筆回去，讓來坐的人有話聊，就夠了。」'
 ],[option('draw-port','畫一艘小船，留住港的故事','bo-finish',{set:{bo:'port'}}),option('draw-window','畫一扇木窗，留住老屋的時間','bo-finish',{set:{bo:'window'}})],{source:'street'});
 case 'bo-finish':return v('第二幕 · 帶回一筆','bench','小安',s.bo==='port'?'卡片上，多了一艘小船':'卡片上，多了一扇木窗',[
   s.bo==='port'?'你沒有把街道畫成今天仍有船通行的水路，而是在紙角畫了一艘小船，寫下「這裡曾與港口相連」。':'你替卡片添上一扇木窗。窗裡沒畫完整的房間，只留了一點暖光，像還有人在過日子。',
   '「今晚，換你講這一小段。」博伯拍拍筆記本，說他等會兒就來。'
 ],[option('bo-done','收好這一筆，回到巷口','hub',{visit:'bo'})],{item:s.bo==='port'?'小船與北勢街的故事':'木窗與街屋的時間'});
 case 'momo-intro':return v('第三幕 · 沫沫的留白','street','沫沫｜抱著畫板的街坊','她把廟，畫在兩間房子中間',[
   s.visited.includes('bo')?'「博伯剛才跟你聊了好久！」沫沫看見卡片上的新筆畫，把畫板往旁邊讓。':'「阿荷說會有新鄰居來幫忙。」沫沫挪開鉛筆盒，讓你一起看畫。',
   '「這張是我看金華府的資料畫的。第一次看，我沒想到廟也可以藏在街屋之間。」',
   '她的畫上有店、有廟、有窗，門前卻全是空白。'
 ],[option('temple-detail','靠近畫板，看那扇廟門','momo-detail'),option('ask-blank','指指門前的空白','momo-blank')]);
 case 'momo-detail':return v('第三幕 · 小小門面裡','street','沫沫','一間廟，也可以是街坊的一部分',[
   '她用筆尖點了點兩旁的屋子：「它沒有站到生活外面。旁邊有人做生意，有人回家。」',
   '你再看她的畫，突然覺得，真正少的可能不是另一棟建築。'
 ],[option('detail-done','把視線移到空著的街道','momo-blank')],{fact:{source:'temple',title:'你正在看的台南｜金華府',text:'神農街上的金華府是街屋型態的廟宇，夾在兩棟街屋之間。地方信仰與街屋空間，在這裡交會。'}});
 case 'momo-blank':return v('第三幕 · 把人畫進來','street','沫沫','「房子有了，那住在這裡的人呢？」',[
   '你們看著畫裡的金華府——一座夾在街屋之間的廟。旁邊的日常，不必全是名勝介紹。',
   '沫沫望向正在搬椅子的阿荷：「我一直想把房子畫漂亮，卻忘了大家等一下會坐在這裡。」',
   '她把鉛筆交給你。門前的空白，這回有了用途。'
 ],[option('draw-help','畫一個替鄰居搬椅子的人','momo-finish',{set:{momo:'help'}}),option('draw-talk','畫兩個坐下來聊天的人','momo-finish',{set:{momo:'talk'}})],{source:'temple'});
 case 'momo-finish':return v('第三幕 · 今天的街坊','street','沫沫',s.momo==='help'?'「這個背影，好像阿荷。」':'「這兩個人，等一下會聊什麼？」',[
   s.momo==='help'?'你畫的人有點歪，椅子卻搬得很認真。沫沫補上一隻手，讓另一個人也來幫忙。':'你畫了兩把相鄰的椅子。沫沫在中間放上一杯茶，兩個陌生人，看起來已經能聊幾句。',
   '「這張比較像我們住的地方了。」她把鉛筆屑攏進紙盒，帶著畫板跟你回巷口。'
 ],[option('momo-done','一起把畫帶回去','hub',{visit:'momo'})],{item:s.momo==='help'?'一起搬椅子的街坊':'並肩聊天的鄰居'});
 case 'rain':return v('第四幕 · 又落了幾滴雨','rain','阿荷','聚會還沒開始，雨先來了',[
   '卡片剛放到門前，簷角又落下幾滴雨。阿荷望望紙，再望望椅子，忍不住笑：「好啦，換個擺法。」',
   '博伯扶住畫板，沫沫抱起鉛筆盒。你離哪一樣比較近，就先幫哪一樣。'
 ],[option('save-paper','把畫紙先收到店裡','rain-after',{set:{rain:'inside'}}),option('move-bench','把長椅挪到屋簷下','rain-after',{set:{rain:'eaves'}})]);
 case 'rain-after':return v('第四幕 · 換個地方，也能聚在一起',s.rain==='inside'?'shop':'bench','阿荷',s.rain==='inside'?'今晚，文具店多開一會兒':'今晚，椅子靠近一點',[
   s.rain==='inside'?'你把畫紙鋪在店裡的桌上，沫沫跟進來壓平紙角。阿荷索性把門敞著，請博伯把椅子搬到門邊。':'你和博伯把長椅挪到簷下，阿荷墊了塊乾布。沫沫趁空把畫收好，等雨停再掛出來。',
   s.approach==='help'?'「剛才幫我留住紙，現在又幫上忙了。」阿荷替你留了一個靠邊的位置。':'「還好你剛才停下來看了那張畫。」阿荷把茶杯放到你旁邊。',
   '雨沒有讓故事重來，只是讓今晚變成另一個樣子。'
 ],[option('finish-card','坐下，把邀請卡最後一句寫完','card')]);
 case 'card':return v('第五幕 · 留一句給今晚',s.rain==='inside'?'shop':'bench','小安','這張卡，終於有了自己的故事',[
   s.bo==='port'?'紙角的小船，替博伯留下北勢街與港口的往來。':'紙角的木窗，替博伯留下老街不同年代的時間。',
   s.momo==='help'?'門前一起搬椅子的人，是你和沫沫補上的今天。':'門前相鄰的兩把椅子，是你和沫沫補上的今天。',
   '最後還有一行空白。寫給今晚會來的人，也寫給剛搬來的自己。'
 ],[option('title-time','寫下「從前有港，現在有你」','hang',{set:{heading:'time'}}),option('title-home','寫下「今晚，一起坐一下」','hang',{set:{heading:'home'}})],{card:true});
 case 'hang':return v('第五幕 · 等你來坐',s.rain==='inside'?'shop':'bench','沫沫','「好了，掛上去吧。」',[
   '紙還有一點皺，畫也沒有完全對稱。阿荷找來兩個木夾，博伯替你扶住畫板。',
   '你忽然發現，這張邀請卡上除了街屋，已經有今晚會來的人，也有剛才一起經過的事情。'
 ],[option('light-up','掛好邀請卡，點亮巷口的燈','ending')],{card:true});
 case 'ending':return v('第一章 · 完','night','博伯','「下次來，不用先想好要問什麼。」',[
   s.rain==='inside'?'燈從文具店的木窗裡亮起來。門敞著，椅子一直排到屋簷下。有人問起畫裡的'+(s.bo==='port'?'小船':'木窗')+'，有人認出'+(s.momo==='help'?'搬椅子的背影':'坐在一起聊天的鄰居')+'。':'雨停了，簷下的椅子還靠在一起。燈落在微濕的石板上，有人把畫板轉向街口，讓晚來的人也看得見。',
   '博伯把茶往你這邊推了一點：「坐一下，也可以。」',
   '早上，小安搬進一個地址。到了晚上，這裡開始有了會叫他名字的人。'
 ],[],{card:true,ending:true});
 default:return view(fresh());
 }
}
export function advance(s,id){
 if(id==='quiet'&&view(s).pause)return {...s,node:'quiet',trail:[...s.trail,id]};
 const c=view(s).choices.find(c=>c.id===id);if(!c)return s;
 const n={...s,...c.set,node:c.to,visited:[...s.visited],trail:[...s.trail,id]};
 if(c.visit&&!n.visited.includes(c.visit))n.visited.push(c.visit);
 if(n.node==='hub'&&n.visited.length===2)n.node='rain';
 return n;
}
export function replay(trail){let s=fresh();for(const id of (Array.isArray(trail)?trail:[]).slice(0,160)){const n=advance(s,id);if(n===s)break;s=n;}return s;}
export function restore(raw){try{const data=JSON.parse(raw);return data?.version===1?replay(data.trail):fresh();}catch{return fresh();}}
export function postcard(s){return {title:s.heading==='time'?'從前有港，現在有你':s.heading==='home'?'今晚，一起坐一下':'留一句，給今晚',past:s.bo==='port'?'一艘小船，記得北勢街與港口的往來。':s.bo==='window'?'一扇木窗，留著老街不同年代的時間。':'等博伯，留下一段老街的時間。',today:s.momo==='help'?'有人替鄰居搬椅子，另一雙手也伸了過來。':s.momo==='talk'?'兩把相鄰的椅子，讓陌生人開始聊天。':'等沫沫，把今天的街坊畫進來。',place:s.rain==='inside'?'今晚的相聚，在敞著門的文具店。':'今晚的相聚，在巷口的屋簷下。'};}
