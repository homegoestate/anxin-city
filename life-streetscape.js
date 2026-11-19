// Original miniature streets, built at the scale of the walking figures. Every
// fixture stays behind the two foreground walking lanes, or beside their ends.
const board=0xa87750, plank=0xd1a375, beam=0x635046, ink=0x304f50;
const milk=0xffe8bd, jade=0x437e73, tile=0xb85d45, ochre=0xe8ac55;
const districts={
  'shuixian-morning': [0xabb9ab,0xa49883,[0xd4c7ac,0xd5cbb5,0xc3bdab,0xccc6b1],0x889b91],
  'yujing-morning': [0xa7a873,0x9a956c,[0xd5bc90,0xcdb387,0xd8c49d,0xcdba94],0x9d8e70],
  'anping-afternoon': [0xc6a48a,0x9e8a7b,[0xd5a286,0xc9957e,0xd3ac91,0xc69880],0x987d6a],
  'dongshan-afternoon': [0x9da47c,0x8d846b,[0xc9bba4,0xc7b299,0xd6c8a9,0xbcae96],0x91856e],
  'yanshui-evening': [0xadae94,0x829486,[0xc4bfa8,0xb3b5a0,0xcfc8af,0xbfb7a2],0x8e9586],
  'beimen-evening': [0xb7b5a1,0xa39381,[0xcfb78f,0xd5c29e,0xbfac8d,0xd2b995],0xa59172]
};

export function streetSetting(k,p,id){
  const [apron,mortar,colors,kerb]=districts[id];
  // A continuous strip of laid stone connects the shops and follows the
  // foreground figures. Staggered joints remain visible when viewed obliquely.
  k.box(p,apron,0,.015,-1.57,13.0,.13,6.36);
  k.box(p,mortar,0,.062,3.46,13.0,.12,3.92);
  const front=5.41,back=1.52,rows=id==='anping-afternoon'?8:6,delta=(front-back)/rows;
  for(let row=0;row<rows;row++){
    const step=id==='anping-afternoon'?1.01:1.49;
    for(let col=-5;col<17;col++){
      const a=Math.max(-6.50,(col+(row%2)*.5)*step-5.71);
      const b=Math.min(6.50,(col+1+(row%2)*.5)*step-5.71);
      if(b-a<.06) continue;
      const tint=colors[Math.abs(col*7+row*5+Math.floor(col/3))%colors.length];
      k.box(p,tint,(a+b)/2,.123,back+(row+.5)*delta,b-a-.024,.019,delta-.023);
    }
  }
  for(const z of [1.49,5.43]){
    k.box(p,kerb,0,.091,z,13,.075,.10);
    for(let j=0;j<12;j++) k.box(p,colors[(j+1)%4],j*1.06-5.84,.137,z,1.035,.025,.13);
  }
  if(id==='shuixian-morning'||id==='anping-afternoon'){
    for(const x of [-4.75,4.43]){
      k.box(p,0x707d74,x,.147,1.77,.76,.026,.24);
      for(let n=0;n<8;n++) k.box(p,0xaab0a0,x-.30+n*.087,.168,1.77,.034,.018,.20);
    }
    // Two cast covers and fixing plugs at the edge of the paving.
    for(const [x,z] of [[-2.8,3.41],[5.03,4.35]]){
      k.post(p,0x8c9489,x,.15,z,.25,.018);
      for(const i of [-1,0,1]) k.box(p,0xb8b9a8,x,.165,z+i*.075,.32-.05*Math.abs(i),.010,.016);
    }
  }
}

function windowBay(k,p,x,y,z,w,h,c=jade){
  k.box(p,0xe9d3af,x,y,z,w+.11,h+.11,.10);
  k.box(p,ink,x,y,z+.06,w,h,.07);
  for(const side of [-1,1]) {
    const a=x+side*w*.245;
    k.box(p,side<0?0x81a8a0:0x97b6aa,a,y,z+.106,w*.435,h*.85,.032);
    k.box(p,c,a,y+.075*h,z+.14,w*.45,.038,.03);
    const gleam=k.box(p,0xbad0bb,a-w*.12,y+h*.18,z+.13,w*.06,h*.20,.011); gleam.rotation.z=-.55;
  }
  k.box(p,board,x,y,z+.146,.04,h,.047);
  k.box(p,c,x,y-h*.54,z+.13,w+.19,.085,.18);
}
function shutters(k,p,x,y,z,w,h,c){
  k.box(p,c,x,y,z,w,h,.07);
  for(let j=0;j<5;j++) k.box(p,0x466f62,x,y+(j-2)*h*.16,z+.05,w*.77,.032,.029);
}
function pot(k,p,x,z,s=1,flower=false,base=0){
  const g=k.group(p,x,base,z); g.scale.setScalar(s);
  const bowl=k.taper(g,0xb87352,0,.20,0,.26,.35,.24); bowl.rotation.z=Math.PI;
  k.post(g,0xd19769,0,.38,0,.266,.075);
  k.post(g,0x766249,0,.42,0,.211,.022);
  for(let i=0;i<7;i++){
    const a=i*2.399,b=.11+(i%3)*.052,dy=.19+(i%2)*.13;
    const leaf=k.oval(g,[0x759050,0x497756,0x91a65a][i%3],Math.sin(a)*b,.53+dy*.38,Math.cos(a)*b,.075,dy,.069);
    leaf.rotation.z=-Math.sin(a)*.82;leaf.rotation.x=Math.cos(a)*.82;
    if(flower&&i%2===0) k.rock(g, i%4?0xd15c60:0xe38d79,Math.sin(a)*b,.67+dy*.43,Math.cos(a)*b,.09,.075,.08,true);
  }
}
function counterCrate(k,p,x,y,z,s=1,kind='mango'){
  const g=k.group(p,x,y,z);g.scale.setScalar(s);
  k.box(g,0x805d40,0,.089,0,.85,.17,.58);
  for(const side of [-1,1]){
    for(const h of [.10,.22]){
      k.box(g,h>.2?plank:board,0,h,side*.31,.9,.076,.049);
      k.box(g,h>.2?plank:board,side*.43,h,0,.043,.076,.61);
    }
    for(const b of [-1,1])k.box(g,board,side*.41,.14,b*.28,.072,.28,.071);
  }
  const greens=kind==='greens',c=greens?[0x7a9e50,0xa6ae55,0x55844b]:kind==='tomato'?[0xd6583a,0xe97d3b,0xb64731]:[0xe6a433,0xe8bf50,0xd5833d];
  for(let i=0;i<8;i++){
    const a=(i%4-1.5)*.192,b=(Math.floor(i/4)-.5)*.26;
    const fruit=k.rock(g,c[i%3],a,.29+(i%2)*.023,b,.102,greens?.167:.107,.118,true);
    fruit.rotation.z=(i%3-1)*.38;
    if(greens) k.oval(g,0xc7d192,a+.045,.35,b+.045,.035,.095,.041).rotation.z=-.44;
  }
}
function wheel(k,p,x,y,z,r){
  k.hoop(p,0x405152,x,y,z,r,r); k.hoop(p,0xc5c7ae,x,y,z+.011,r*.85,r*.85);
  for(let i=0;i<4;i++){
    const ang=i*Math.PI/4,a=Math.cos(ang)*r*.8,b=Math.sin(ang)*r*.8;
    k.rod(p,0xacb9ab,[x-a,y-b,z],[x+a,y+b,z],.010);
  }
}
function bicycle(k,p,x,z,s=1){
  const b=k.group(p,x,.13,z); b.scale.setScalar(s); b.rotation.y=-.15;
  wheel(k,b,-.52,.37,0,.36);wheel(k,b,.55,.37,0,.36);
  for(const [a,c] of [
    [[-.52,.37,.02],[-.24,.88,.02]],[[-.52,.37,.02],[0,.37,.02]],[[-.24,.88,.02],[0,.37,.02]],
    [[0,.37,.02],[.39,.87,.02]],[[-.24,.85,.02],[.36,.76,.02]],[[.39,.87,.02],[.55,.37,.02]]
  ]) k.rod(b,0x397773,a,c,.036);
  k.rod(b,beam,[.39,.87,0],[.31,1.05,0],.027);
  k.rod(b,beam,[.32,1.05,-.14],[.32,1.05,.15],.031);
  k.oval(b,0x714e39,-.24,.90,.015,.155,.050,.093);
  k.box(b,0xba9569,.57,.85,0,.32,.24,.28);
  for(const n of [-1,0,1]) k.box(b,0xe0b781,.57+n*.09,.85,.147,.020,.21,.019);
}
function linen(k,p,a,b,height,xSag=.25){
  const pts=[];
  for(let i=0;i<=8;i++){
    const t=i/8; pts.push([a[0]+(b[0]-a[0])*t,height-4*xSag*t*(1-t),a[1]+(b[1]-a[1])*t]);
  }
  for(let i=0;i<8;i++) k.rod(p,0x766a59,pts[i],pts[i+1],.015);
  for(const i of [1,2,3,5,6,7]){
    const [x,y,z]=pts[i],flag=k.peak(p,[tile,0xe1ba62,jade,0xebe0bc][i%4],x,y-.129,z,.099,.238,.024);
    flag.rotation.z=Math.PI+.10*Math.sin(i);
  }
}
function sign(k,p,word,x,y,z,w,h,c){
  k.box(p,beam,x,y,z,w+.105,h+.1,.145);
  k.box(p,c,x,y,z+.086,w,h,.065);
  k.letters(p,word,x,y,z+.126,w*.87,h*.93);
}
function arcade(k,p,x,z,w,h,wall,trim,word,scallop=false){
  const g=k.group(p,x,0,z),depth=2.48,front=depth/2;
  k.box(g,wall,0,h/2,-.15,w,h,depth);
  k.box(g,trim,0,h-.04,-.15,w+.16,.16,depth+.11);
  // Raised Dutch-style parapet or a flat tiled cornice, alternating along the lane.
  k.box(g,wall,0,h+.20,front-.13,w+.015,.50,.24);
  k.box(g,milk,0,h+.411,front-.11,w+.12,.10,.30);
  if(scallop){
    k.oval(g,wall,0,h+.37,front-.115,w*.32,.45,.12);
    k.oval(g,trim,0,h+.50,front+.009,.26,.18,.035);
    k.oval(g,milk,0,h+.50,front+.049,.15,.075,.018);
  }else{
    for(let i=0;i<6;i++) k.box(g,trim,-w*.36+w*.145*i,h+.18,front+.011,.15,.22,.037);
  }
  const floor=h*.55, upper=(floor+h)*.5;
  for(const side of [-1,1]){
    const a=side*w*.235;
    windowBay(k,g,a,upper,front-.095,w*.30,h*.21,trim);
    shutters(k,g,a+side*w*.206,upper,front-.02,w*.082,h*.23,trim);
    k.box(g,milk,side*(w*.5-.09),upper,front-.085,.14,h-floor,.16);
  }
  k.box(g,milk,0,floor+.08,front+.09,w+.17,.125,.86);
  k.box(g,trim,0,floor-.035,front+.48,w+.17,.15,.12);
  k.box(g,0x374e48,0,floor*.43,front-.08,w-.20,floor*.87,.09);
  for(const side of [-1,1]){
    k.box(g,wall,side*(w*.5-.14),floor*.49,front+.42,.20,floor*.98,.24);
    k.box(g,trim,side*(w*.5-.14),.28,front+.42,.26,.53,.29);
    k.box(g,milk,side*(w*.5-.14),floor-.16,front+.42,.32,.21,.33);
  }
  k.box(g,board,0,.57,front+.075,w-.53,.71,.41);
  k.box(g,plank,0,.96,front+.105,w-.48,.09,.53);
  for(let n=0;n<5;n++) k.box(g,board,(n-2)*(w-.5)*.16,floor*.69,front+.005,.055,.48,.065);
  sign(k,g,word,0,floor-.18,front+.47,w*.62,.32,trim);
  k.box(g,0xc4b094,0,.09,front+.37,w+.09,.16,1.02);
  const flank= k.group(g,w/2,0,-.13);flank.rotation.y=Math.PI/2;
  windowBay(k,flank,.10,upper,0,.79,.70,trim);
}
function lamp(k,p,x,z,h=3.35){
  k.post(p,0x5b7369,x,.25,z,.15,.39); k.post(p,0x67786f,x,h*.52,z,.054,h);
  k.rod(p,0x586f66,[x,h,z],[x+.27,h+.25,z],.044);
  k.rod(p,0x586f66,[x+.27,h+.25,z],[x+.52,h+.20,z],.044);
  k.oval(p,0x526b62,x+.52,h+.12,z,.205,.084,.175);
  k.oval(p,0xffdf99,x+.52,h+.055,z,.147,.078,.123);
}
function urn(k,p,x,y,z,s){
  const b=k.group(p,x,y,z); b.scale.setScalar(s);
  for(const xx of [-.22,.22]) k.post(b,0x797d65,xx,.20,0,.075,.34);
  k.oval(b,0x7e8068,0,.39,0,.40,.26,.26);
  k.oval(b,0xb3a06c,0,.54,0,.43,.096,.29);
  k.oval(b,0x8b7760,0,.60,0,.32,.03,.21);
  for(const side of [-1,1])k.hoop(b,0x8d8868,side*.39,.48,0,.105,.134);
  for(let i=0;i<5;i++)k.rod(b,i%2?0xb85643:0xb7864f,[(i-2)*.075,.60,0],[(i-2)*.105,.95+(i%2)*.08,-.03],.014);
}
function marketCat(k,p,x,z){
  const g=k.group(p,x,.17,z);g.rotation.y=-.57;
  k.oval(g,0xc18e5d,0,.27,0,.18,.25,.19);
  k.oval(g,0xf1d5a4,0,.32,.13,.12,.18,.080);
  for(const side of [-1,1])k.oval(g,0xedcd9e,side*.095,.102,.125,.076,.064,.11);
  k.oval(g,0xddac75,0,.54,.035,.194,.158,.15);
  for(const s of [-1,1]){
    const ear=k.peak(g,0xbe8e62,s*.128,.673,.025,.09,.17,.077);ear.rotation.z=-s*.16;
    k.oval(g,0x514c41,s*.084,.56,.163,.022,.030,.013);
  }
  k.oval(g,0xa46f58,0,.517,.191,.026,.018,.011);
  k.rod(g,0xb88053,[.14,.21,-.07],[.32,.40,-.12],.045);
  k.rod(g,0xb88053,[.32,.40,-.12],[.33,.56,-.14],.039);
  k.oval(g,0x9e7049,.306,.578,-.139,.056,.047,.04);
}
export function marketFront(k,p){
  arcade(k,p,-3.73,-2.65,2.85,3.72,0xeaca9e,jade,'青果行',true);
  arcade(k,p,3.76,-2.86,2.90,3.35,0xc9d5bb,0x64877c,'南北貨');
  const left=k.group(p,-5.70,0,-2.47); left.rotation.y=.10;
  arcade(k,left,0,-.45,1.65,2.64,0xd4ab91,0x9d624a,'茶');
  const right=k.group(p,5.61,0,-3.20);right.rotation.y=-.13;
  arcade(k,right,0,0,1.64,2.64,0xe7bd88,0x968259,'米',true);
  sign(k,p,'水仙宮',0,2.10,-.38,1.26,.34,0x456a5e);
  for(const side of [-1,1]){
    const x=side*.52;
    k.box(p,0xa7523e,x,1.23,-.887,.42,1.85,.063);
    for(const y of [.74,1.17,1.58]) for(const xx of [-.10,.10]) k.oval(p,ochre,x+xx,y,-.841,.036,.034,.022);
    for(let i=0;i<4;i++){
      const dx=1.53+.138*i,dy=3.71+.045*i+.019*i*i,next=3.71+.045*(i+1)+.019*(i+1)*(i+1);
      k.rod(p,jade,[side*dx,dy,-1.68],[side*(dx+.138),next,-1.68],.078);
      const fin=k.rock(p,0xdfa351,side*(dx+.026),dy+.083,-1.678,.076,.11,.055,true);
      fin.rotation.z=-side*.44;
    }
  }
  k.oval(p,0xed9e38,0,3.82,-1.68,.18,.19,.12);
  for(const x of [-1.92,1.92]) k.box(p,0xb8a087,x,.19,-.09,.39,.33,.38);
  urn(k,p,-.68,.11,.16,.80);
  for(const [x,z,s,kind] of [[-4.22,.91,.88,'tomato'],[-3.48,1.38,.74,'greens'],[3.91,1.20,.77,'mango'],[4.5,.74,.78,'greens']])counterCrate(k,p,x,.12,z,s,kind);
  counterCrate(k,p,-3.57,.86,1.24,.76,'greens');
  counterCrate(k,p,3.27,.86,.97,.77,'tomato');
  // A mechanical produce scale at the end of the counter.
  const scale=k.group(p,-2.15,.82,.92);
  k.box(scale,jade,0,.08,0,.38,.14,.25);
  k.oval(scale,milk,0,.21,.065,.14,.16,.07);
  k.rod(scale,tile,[0,.21,.144],[.057,.29,.144],.014);
  k.oval(scale,0x97ada7,0,.41,0,.24,.036,.17);
  pot(k,p,-4.82,.59,.96,true);pot(k,p,4.93,-.14,1.1);
  bicycle(k,p,-5.32,1.04,.99);
  marketCat(k,p,4.40,1.30);
  const balcony=k.group(p,-3.72,2.39,-1.19);
  k.box(balcony,0xab7754,0,.088,0,1.14,.16,.19);
  for(let i=0;i<7;i++){
    const xx=(i-3)*.14;
    k.rock(balcony,i%2?0x708d5a:0x8ca065,xx,.24+(i%2)*.04,0,.15,.12,.071,true);
    if(i%2===1)k.rock(balcony,0xd87972,xx,.33,0,.063,.055,.051,true);
  }
  sign(k,p,'青果',-3.75,3.89,-1.35,1.15,.29,0x528475);
  sign(k,p,'南北貨',3.78,3.51,-1.55,1.40,.30,0x678675);
  lamp(k,p,-5.02,-.38,3.38);
  linen(k,p,[-5.14,-.65],[-1.88,-.59],3.37,.39);
  linen(k,p,[1.92,-.72],[5.00,-.89],3.17,.32);
  // Household water tank and pipe visible above the rice shop.
  const tank=k.group(p,4.39,3.44,-3.16);
  k.post(tank,0x94a79b,0,.41,0,.36,.64);
  k.oval(tank,0xb9c4b3,0,.72,0,.36,.09,.36);
  for(const yy of [.18,.38,.61])k.post(tank,0xc4c7ad,0,yy,0,.368,.037);
  k.rod(tank,0x939a83,[.36,.30,0],[.53,.30,0],.037);
  k.rod(tank,0x939a83,[.53,.30,0],[.53,-.68,0],.036);
}

function handcart(k,p,x,z,load=false){
  const g=k.group(p,x,.17,z);g.rotation.y=-.37;
  for(const d of [-.30,.30]) wheel(k,g,0,.32,d,.28);
  k.box(g,plank,.01,.49,0,1.23,.10,.62);
  for(const d of [-.24,.24]){
    k.rod(g,board,[.39,.41,d],[1.05,.66,d],.035);
    k.rod(g,beam,[-.40,.45,d],[-.50,.05,d],.034);
  }
  if(load)counterCrate(k,g,-.04,.54,0,.84,'mango');
}
function fence(k,p,x,z,length,c=plank){
  const n=Math.ceil(length/.72);
  for(let i=0;i<=n;i++) {
    const a=x+length*(i/n-.5);
    k.box(p,c,a,.52,z,.09,.91,.11);
  }
  for(const y of [.40,.75])k.box(p,c,x,y,z,length+.07,.076,.088);
}
export function orchardFront(k,p){
  const g=k.group(p,2.34,0,-2.42);
  k.box(g,0xd8ba7c,0,1.29,0,4.82,2.55,2.04);
  k.box(g,0x536d64,0,1.42,1.035,4.38,1.92,.07);
  for(const side of [-1,1]){
    for(let i=0;i<5;i++)k.box(g,i%2?0x98b59a:0xa9c4a9,side*(1.64+i*.13),1.45,1.11,.115,1.94,.075);
    k.box(g,milk,side*2.22,1.52,1.36,.16,2.96,.20);
    const roof=k.box(g,0x628b7d,0,3.09,side*.60,5.19,.12,1.43); roof.rotation.x=side*.32;
    k.box(g,0xaac0a5,0,2.89,side*1.26,5.34,.14,.10);
    for(let i=0;i<15;i++)k.rod(g,0x7d9e89,[-2.45+i*.35,3.33,0],[-2.45+i*.35,2.93,side*1.28],.024);
  }
  sign(k,g,'玉井青果',0,2.63,1.23,2.46,.45,jade);
  for(const x of [-1.42,-.49,.44,1.37])counterCrate(k,g,x,.15,1.23,.89,'mango');
  const greenShed=k.group(p,-5.08,0,-2.70);
  k.box(greenShed,0x85946d,0,1.03,0,2.0,2.05,1.60);
  for(let i=0;i<8;i++)k.box(greenShed,0x9da985,-.85+.24*i,1.05,.84,.035,1.92,.056);
  const cap=k.box(greenShed,0x798b78,0,2.16,0,2.25,.14,2.01);cap.rotation.x=.13;
  fence(k,p,-5.3,-.41,1.78);pot(k,p,4.58,-.14,1.05);
  handcart(k,p,-3.01,1.07,true);
  for(const [x,z] of [[4.19,.69],[4.79,.74],[-1.68,1.22]])counterCrate(k,p,x,.13,z,.73,'mango');
  linen(k,p,[.51,-.97],[4.55,-.81],2.83,.30);
}
export function laneFront(k,p){
  const house=k.group(p,-4.62,0,-2.17);
  house.rotation.y=.13; arcade(k,house,0,0,2.68,3.06,0xd99973,0x527d71,'巷仔內',true);
  const east=k.group(p,4.70,0,-2.67);
  east.rotation.y=-.21; arcade(k,east,0,0,2.65,2.96,0xe3c5a1,0x8b7165,'安平');
  for(let i=0;i<5;i++){
    const h=[.76,.98,.87,.67,.95][i],x=2.32+i*.46;
    const cloth=k.box(p,[0xd89a8b,0xb3bdaa,0xe9cca2,0x82a69b,0xb7a3ab][i],x,2.04-h/2,-.48,.40,h,.03);
    cloth.rotation.z=.055*Math.cos(i);
    k.box(p,0xc29f6c,x-.11,2.05,-.45,.038,.092,.047);
  }
  k.rod(p,beam,[2.10,2.05,-.50],[4.44,2.05,-.47],.019);
  for(const s of [-1,1]){
    k.box(p,0xae5443,-.59+s*.65,1.09,-.046,.14,1.31,.04);
    for(const i of [-1,0,1])k.oval(p,0xf8cb79,-.59+s*.65,1.09+i*.28,-.019,.032,.061,.016);
    const brow=k.oval(p,0x6b5340,-.59+s*.19,1.354,.104,.127,.043,.048);brow.rotation.z=s*.35;
    const ear=k.rock(p,0xd5a15d,-.59+s*.39,1.52,.024,.13,.12,.072,true);ear.rotation.z=s*.38;
  }
  k.box(p,milk,-2.61,1.43,-.11,.36,.23,.07);
  k.box(p,jade,-2.61,1.43,-.063,.31,.17,.041);k.letters(p,'巷',-2.61,1.43,-.036,.20,.17);
  for(const [x,z,s] of [[-4.42,.72,.68],[-3.14,.91,.81],[1.45,-.10,.73],[4.11,.56,1.10],[4.67,.81,.70]])pot(k,p,x,z,s,x>2);
  bicycle(k,p,3.78,1.09,.86);
  lamp(k,p,-5.55,-.08,3.07);
}
function chair(k,p,x,z,angle){
  const g=k.group(p,x,.11,z);g.rotation.y=angle;
  for(const a of [-.185,.185])for(const b of [-.15,.15]) k.rod(g,board,[a*1.16,.04,b*1.12],[a,.46,b],.038);
  k.box(g,plank,0,.46,0,.48,.075,.41);
  for(const a of [-.18,.18])k.rod(g,board,[a,.43,-.14],[a,.83,-.218],.031);
  const rest=k.box(g,plank,0,.75,-.18,.43,.15,.069);rest.rotation.x=-.17;
}
function parasol(k,p,x,z){
  k.post(p,beam,x,1.23,z,.045,2.35);
  const shade=k.peak(p,0xc97a53,x,2.19,z,1.25,.62,1.15);
  shade.rotation.y=.15;
  for(let i=0;i<9;i++){
    const a=i/9*Math.PI*2+.15;
    k.rod(p,0xd99b70,[x,2.51,z],[x+1.24*Math.sin(a),1.90,z+1.14*Math.cos(a)],.024);
  }
  k.post(p,ochre,x,2.53,z,.069,.097);
}
export function hillsideFront(k,p){
  const deck=k.group(p,4.31,0,-.49);
  k.box(deck,0x8e765e,0,.15,0,2.85,.25,3.22);
  for(let i=0;i<10;i++)k.box(deck,i%3?0xc7ab87:0xb69879,0,.286,-1.44+i*.32,2.84,.034,.30);
  fence(k,deck,0,-1.39,2.64,0x9f835e);
  for(const [x,z,a] of [[3.72,.09,-.47],[5.02,-.34,1.1]])chair(k,p,x,z,a);
  k.post(p,beam,4.31,.59,-.27,.087,.63);k.post(p,plank,4.31,.91,-.27,.46,.073);
  for(const dx of [-.18,.18]){k.post(p,milk,4.31+dx,1.03,-.27,.084,.14);k.post(p,beam,4.31+dx,1.103,-.27,.067,.015);}
  parasol(k,p,4.77,-1.10);
  pot(k,p,3.09,.82,.76,true);
  sign(k,p,'東山咖啡',1.55,1.84,-.71,1.53,.34,0x71634c);
  const slope=k.group(p,-2.87,0,-3.63);
  for(let i=0;i<3;i++){
    k.box(slope,[0xa7af78,0x9aa871,0x869d6d][i],.20,.22+i*.28,-i*.53,5.96-i*.60,.42+i*.42,.76);
    for(let j=0;j<8-i;j++){
      const plant=k.rock(slope,j%2?0x66895e:0x77955d,(j-(7-i)/2)*.65,.56+i*.43,-i*.53,.46,.29,.37,true);
      plant.rotation.y=j;
    }
  }
  for(const x of [-4.79,-4.25,-3.72]) pot(k,p,x,.27,.66);
  k.box(p,0x8a7057,-4.47,.24,1.01,1.29,.29,.66);
  k.box(p,0xb49871,-4.47,.41,1.01,1.46,.065,.80);
}
function reeds(k,p,x,z,n=7){
  for(let i=0;i<n;i++){
    const a=i*2.4,r=.19+(i%3)*.046,tx=x+Math.cos(a)*r,tz=z+Math.sin(a)*r,h=.44+(i%4)*.12;
    k.rod(p,[0x899b65,0xb0ad67,0x6b8a65][i%3],[x+.05*Math.cos(a),.15,z+.05*Math.sin(a)],[tx,h+.18,tz],.022);
    if(i%3===0)k.oval(p,0x936f50,tx,h+.20,tz,.042,.083,.041);
  }
}
export function watersideFront(k,p){
  for(const [x,w,h,c,name] of [[-3.8,2.53,2.82,0xc6b39a,'橋南'],[-1.33,2.34,2.50,0xd09a7b,'茶行'],[1.03,2.17,2.91,0xe0c6a0,'布莊'],[3.40,2.43,2.60,0xb0bcab,'商行']]){
    const g=k.group(p,x,0,-3.63);g.scale.set(1,.92,.76);
    arcade(k,g,0,0,w,h,c,x<0?0x797c68:0x7d6253,name,x<-3||x>3);
  }
  for(const [x,z] of [[-5.41,.51],[4.59,.40],[5.23,-1.91]])reeds(k,p,x,z,9);
  for(const side of [-1,1])for(let i=0;i<4;i++){
    const b=k.rock(p,[0xa1a18a,0xadac92,0x939c88][i%3],side*(4.36+i*.34),.17,.86-.14*(i%2),.28,.19,.26,true); b.rotation.z=.19*i;
  }
  // An original string of round lanterns follows the rear quay above the water.
  const span=7.31,high=2.95;
  for(const side of [-1,1])k.post(p,beam,side*span/2,high*.49,-2.03,.061,high);
  for(let i=0;i<10;i++){
    const t=i/10,v=(i+1)/10,a=span*(t-.5),b=span*(v-.5),ay=high-2.1*t*(1-t),by=high-2.1*v*(1-v);
    k.rod(p,beam,[a,ay,-2.03],[b,by,-2.03],.016);
    if(i%2===1){
      k.rod(p,beam,[a,ay,-2.03],[a,ay-.13,-2.03],.014);
      k.oval(p,i%4===3?0xe3b969:0xd48162,a,ay-.24,-2.03,.126,.138,.119);
      k.post(p,milk,a,ay-.38,-2.03,.048,.031);
    }
  }
}
function egret(k,p,x,z,s){
  const bird=k.group(p,x,.14,z);bird.scale.setScalar(s);
  for(const dx of [-.057,.068])k.rod(bird,0x737861,[dx,.02,0],[dx-.018,.35,0],.018);
  k.oval(bird,0xf0ecda,0,.46,0,.20,.14,.13);
  k.rod(bird,0xedeada,[.12,.49,0],[.13,.69,.003],.053);
  k.oval(bird,0xfff5da,.17,.72,0,.09,.075,.072);
  k.rod(bird,ochre,[.24,.72,0],[.41,.70,0],.025);
  k.oval(bird,ink,.197,.738,.063,.014,.015,.014);
}
export function saltFront(k,p){
  const wet=k.group(p,0,0,-3.63);
  k.box(wet,0xa79a7b,0,.12,0,11.81,.22,1.95);
  for(let i=0;i<6;i++){
    const x=-4.92+i*1.97;
    k.box(wet,[0x90b8b2,0xacbdb5,0xb4c5b8][i%3],x,.26,0,1.83,.071,1.66);
    for(let j=0;j<3;j++)k.box(wet,0xcdcec0,x+(j-1)*.46,.302,.39-.23*(j%2),.25+(j%2)*.19,.017,.033);
  }
  k.box(p,0x9ea88a,-5.0,.12,-.67,1.92,.14,3.4);
  k.box(p,0xa7c1ac,-5.02,.22,-.72,1.65,.057,3.16);
  for(const [x,z] of [[-5.61,-1.08],[-4.67,-1.99],[5.09,.31],[5.48,-2.42]])reeds(k,p,x,z,7);
  egret(k,p,-5.11,-.56,.97);egret(k,p,-4.71,-1.01,.76);
  handcart(k,p,4.34,.71);
  sign(k,p,'鹽田',3.06,1.26,-.91,.70,.28,0x799280);
  for(const [x,z] of [[4.81,-1.01],[4.39,-1.43]]) {
    const sack=k.rock(p,0xd7b78b,x,.42,z,.30,.38,.26,true);
    sack.rotation.z=.10; k.post(p,0x967c57,x,.73,z,.083,.06);
  }
}
