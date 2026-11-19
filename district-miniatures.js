import * as THREE from 'three';

// Illustrative models in local metres. +Z is the visitor's side of the street.
// The silhouettes serve both the map and the street, so a selection always opens
// the same landmark. Each finished sculpture costs a single coloured draw call.
const green=0x548665, leaf=0x83a657, deep=0x315b50, wood=0x996845, umber=0x644633;
const brick=0xbc6245, coral=0xd68058, tile=0x4a706b, straw=0xe8b858, cream=0xf5deae;
const stone=0xcab696, glass=0x739d9a, water=0x67a9ae, white=0xffeacb, ink=0x434b44;
const pink=0xe58f93, jade=0x6caa8d, iron=0x56716c;

function studio(k,p) {
  const b=(c,x,y,z,w,h,d)=>k.box(p,c,x,y,z,w,h,d);
  const o=(c,x,y,z,w,h,d)=>k.oval(p,c,x,y,z,w,h,d);
  const r=(c,x,y,z,w,h,d)=>k.rock(p,c,x,y,z,w,h,d);
  const post=(c,x,y,z,radius,h)=>k.post(p,c,x,y,z,radius,h);
  const rod=(c,a,b,radius)=>k.rod(p,c,a,b,radius);
  const ring=(c,x,y,z,w,h,t=w)=>k.hoop(p,c,x,y,z,w,h,t);
  const triangle=(c,points,depth=.08)=>{
    const s=new THREE.Shape();
    points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
    return k.part(p,new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false}),c,0,0,0);
  };
  function roof(x,y,z,w,d,rise,color=tile) {
    const run=Math.hypot(d/2,rise),angle=Math.atan2(rise,d/2);
    for(const side of [-1,1]) b(color,x,y+rise/2,z+side*d/4,w,.15,run+.09).rotation.x=side*angle;
    b(umber,x,y+rise+.055,z,w+.07,.09,.11);
  }
  function window(x,y,z,w,h){
    b(cream,x,y,z,w+.10,h+.10,.07);b(glass,x,y,z+.045,w,h,.05);
    b(cream,x,y,z+.09,.055,h,.04);b(cream,x,y+h*.12,z+.09,w,.044,.04);
  }
  function tree(x,z,s=1,fruit=null){
    post(wood,x,s*.8,z,.15*s,s*1.6);
    for(const [dx,dy,dz,rr,col] of [[-.52,1.59,.01,.68,green],[.49,1.76,-.1,.78,leaf],[0,2.12,.03,.91,jade]]){
      r(col,x+dx*s,dy*s,z+dz*s,rr*s,rr*.8*s,rr*.77*s);
    }
    if(fruit) for(const [dx,dy] of [[-.75,1.53],[-.3,1.8],[.26,1.67],[.62,1.85],[.06,2.19]]){
      o(fruit,x+dx*s,dy*s,z+.48*s,.17*s,.21*s,.16*s);
    }
  }
  function bench(x,z){
    for(const dx of [-.37,.37]) b(iron,x+dx,.25,z,.10,.50,.37);
    for(const dz of [-.12,.06,.24]) b(wood,x,.5,z+dz,1.09,.09,.14);
    b(wood,x,.79,z-.17,1.09,.23,.095);
    for(const dx of [-.37,.37]) b(iron,x+dx,.65,z-.17,.07,.42,.07);
  }
  function temple(x,z,s=1) {
    const body=k.group(p,x,0,z);body.scale.setScalar(s);
    const t=studio(k,body);
    t.b(cream,0,.20,0,2.77,.38,1.82);t.b(brick,0,.94,-.23,2.35,1.45,1.17);
    t.b(umber,0,.85,.40,.76,1.16,.09);
    for(const a of [-1.08,-.59,.59,1.08]) t.post(brick,a,.97,.65,.09,1.46);
    t.roof(0,1.65,0,3.02,1.93,.59,tile);t.b(straw,0,2.30,0,3.05,.10,.12);
    for(const sign of [-1,1]){
      t.rod(straw,[sign*1.46,2.28,0],[sign*1.76,2.58,0],.07);
      t.rod(tile,[sign*1.48,1.66,.96],[sign*1.74,1.87,1.03],.09);
      t.o(straw,sign*.79,1.38,.84,.14,.21,.13);
    }
  }
  function pond(w=2.62,d=1.43){o(water,0,.07,0,w,.13,d);o(0x82bdba,-.30,.17,.07,w*.77,.026,d*.63);}
  function boat(x,z,s=1){
    o(umber,x,.34*s,z,1.17*s,.22*s,.41*s);o(cream,x,.45*s,z,.91*s,.11*s,.31*s);
    for(const dx of [-.36,.28]) b(wood,x+dx*s,.54*s,z,.13*s,.085*s,.55*s);
    rod(wood,[x-.53*s,.78*s,z-.46*s],[x+.56*s,.31*s,z+.56*s],.044*s);
  }
  function blossom(x,y,z,s,color=pink){
    for(let i=0;i<6;i++){const a=i*Math.PI/3;
      const petal=o(color,x+Math.cos(a)*s*.35,y+s*.10,z+Math.sin(a)*s*.35,s*.36,s*.19,s*.31);
      petal.rotation.y=-a;
    }
    o(straw,x,y+.22*s,z,.23*s,.17*s,.23*s);
  }
  function lily(x,z,s,y=.2){o(0x719b68,x,y,z,s,.05,s*.72);rod(deep,[x,y,z],[x,y+s*.86,z],.037);blossom(x,y+s*.86,z,.70*s);}
  function rail(x,z,w){
    for(const a of [-1,0,1]) post(wood,x+a*w/2,.46,z,.062,.91);
    for(const h of [.42,.81]) b(cream,x,h,z,w,.078,.082);
  }
  return {b,o,r,post,rod,ring,triangle,roof,window,tree,bench,temple,pond,boat,blossom,lily,rail};
}

const miniatures={
  'fan-salt'(a){
    // Ribs spread out from the sluice. Alternating shallow salt beds show the fan from above.
    for(let i=0;i<7;i++){
      const aa=-1.2+i*.34,ab=aa+.30;
      const x1=Math.sin(aa)*2.62,z1=-Math.cos(aa)*2.26,x2=Math.sin(ab)*2.62,z2=-Math.cos(ab)*2.26;
      const cell=a.triangle([0x8fbbbb,0xbad6c5,0xe2dec4][i%3],[[0,0],[x1,-z1],[x2,-z2]],.09);
      cell.rotation.x=-Math.PI/2;cell.position.set(0,.14,1.08);
      a.rod(cream,[0,.21,1.08],[x1,.21,z1+1.08],.05);
    }
    for(const [x,z,s] of [[-.9,-.46,.55],[-.19,-.74,.68],[.60,-.53,.42]]) a.r(white,x,.33,z,s,s*.85,s*.62);
    for(const x of [1.55,2.15])a.post(wood,x,.62,.33,.065,1.21);
    a.roof(1.85,1.25,.33,1.10,.88,.32,brick);a.rail(-1.25,.82,1.77);
  },
  spoonbill(a){
    a.pond();
    for(const [x,z,s] of [[-.61,.25,1.1],[.77,-.55,.83]]){
      for(const dx of [-.16,.16]){a.rod(ink,[x+dx*s,.19,z],[x+dx*s,.88*s,z],.035*s);}
      a.o(white,x,.99*s,z,.60*s,.32*s,.31*s);a.o(cream,x+.17*s,1.01*s,z+.18*s,.37*s,.19*s,.15*s);
      a.rod(white,[x-.27*s,1.10*s,z],[x-.46*s,1.62*s,z],.115*s);
      a.o(white,x-.48*s,1.66*s,z,.22*s,.17*s,.18*s);
      a.o(ink,x-.64*s,1.65*s,z+.06*s,.12*s,.11*s,.13*s);
      a.rod(ink,[x-.68*s,1.62*s,z],[x-1.11*s,1.56*s,z],.054*s);
      a.o(ink,x-1.16*s,1.56*s,z,.15*s,.045*s,.105*s);
    }
    for(const x of [1.31,1.96])for(const z of [-.4,.25])a.post(wood,x,.90,z,.067,1.79);
    a.b(wood,1.64,.50,-.08,.94,.11,1);a.roof(1.64,1.79,-.08,1.27,1.13,.30,straw);
  },
  'ceramic-tile'(a){
    a.temple(-.42,-.24,1.07);
    for(const side of [-1,1]){
      for(let i=0;i<6;i++){
        const x=-.42+side*(.26+i*.20),y=2.47+Math.sin(i/5*Math.PI)*.33;
        a.r([jade,water,coral][i%3],x,y,-.27,.18,.18,.13);
      }
      a.o(straw,-.42+side*1.34,2.82,-.27,.19,.19,.17);
    }
    a.b(wood,1.73,.67,.23,.96,1.29,.36);
    for(let x=0;x<3;x++)for(let y=0;y<4;y++)a.b([jade,cream,brick,water][(x+2*y)%4],1.43+x*.30,.22+y*.29,.44,.26,.24,.065);
  },
  'sugar-warehouse'(a){
    for(const [x,z,s] of [[-.85,.07,1],[.94,-.55,.83]]){
      a.b(brick,x,.80*s,z,1.93*s,1.6*s,1.60*s);
      // The warehouse gable faces the lane.
      const g=a.triangle(coral,[[x-.968*s,1.57*s],[x,2.30*s],[x+.968*s,1.57*s]],1.62*s);
      g.position.z=z-.81*s;
      for(const side of [-1,1])a.b(tile,x+side*.50*s,1.94*s,z,1.30*s,.13*s,1.86*s).rotation.z=-side*.63;
      a.b(umber,x,.65*s,z+.82*s,.88*s,1.30*s,.09);
      for(const dx of [-.72,.72])a.window(x+dx*s,1.04*s,z+.83*s,.23*s,.49*s);
      a.ring(cream,x,1.82*s,z+.86*s,.17*s,.17*s);
    }
    a.post(brick,1.78,1.51,-.80,.23,3.02);a.post(coral,1.78,2.99,-.80,.28,.19);
  },
  'pilgrim-palanquin'(a){
    a.temple(.68,-.94,.91);
    for(const z of [.21,1.03])a.rod(umber,[-2.45,.57,z],[.51,.57,z],.072);
    a.b(coral,-1,.88,.62,1.19,.67,.88);a.b(straw,-1,.58,.62,1.42,.13,1.02);
    for(const x of [-1.56,-.44])for(const z of [.20,1.04])a.post(brick,x,1.36,z,.065,1.19);
    a.roof(-1,1.87,.62,1.62,1.34,.47,straw);a.o(brick,-1,2.50,.60,.14,.19,.14);
    for(const x of [-1.63,-.38])for(const z of [.04,1.2])a.o(pink,x,1.70,z,.07,.16,.07);
  },
  mangrove(a){
    a.pond(2.65,1.55);
    for(const [x,z,s] of [[-1.83,-.81,1.07],[1.68,-.71,1.1],[-1.75,.42,.93],[1.74,.54,.91]]){
      const side=Math.sign(x);
      for(const dz of [-.30,0,.36])a.rod(wood,[x+side*.3,.19,z+dz],[x-side*.08,.99*s,z],.07);
      a.rod(umber,[x,.8*s,z],[x-side*.39,1.86*s,z],.12);
      a.rod(wood,[x-side*.39,1.75*s,z],[x-side*1.1,2.32*s,z],.09);
      a.r(green,x-side*.34,2.02*s,z,.81,.63,.70);a.r(leaf,x-side*1.1,2.36*s,z,.89,.52,.78);
    }
    a.boat(-.24,.54,.78);
  },
  'stone-arch'(a){
    for(const x of [-1.80,-.70,.70,1.80]){
      const center=Math.abs(x)<1;
      a.b(stone,x,.20,0,.58,.4,.64);a.b(cream,x,center?1.47:1.10,0,.27,center?2.72:1.94,.38);
      a.b(stone,x,center?2.60:1.92,0,.46,.16,.52);
    }
    for(const [x,y,w] of [[0,2.61,1.76],[-1.22,1.88,1.48],[1.22,1.88,1.48]]){
      a.b(stone,x,y,0,w,.39,.44);a.roof(x,y+.23,0,w+.26,.68,.29,0x8c9689);
      a.b(umber,x,y,.24,w*.47,.17,.045);
      for(const side of [-1,1])a.rod(cream,[x+side*w*.42,y-.42,0],[x+side*w*.23,y-.14,0],.082);
    }
    a.tree(-2.45,-.70,.62);
  },
  'brick-arcade'(a){
    a.b(brick,0,1.05,-.45,4.15,2.10,1.42);a.b(cream,0,1.15,.34,4.22,.17,.29);
    for(const x of [-1.51,-.53,.47,1.47]){
      a.b(umber,x,.50,.29,.63,.94,.09);a.window(x,1.65,.29,.54,.63);
      for(const dx of [-.38,.38])a.b(cream,x+dx,.56,.63,.12,1.11,.13);
      for(let j=0;j<7;j++){
        const th=Math.PI*j/6;
        a.b(cream,x+.38*Math.cos(th),.88+.29*Math.sin(th),.65,.19,.13,.17).rotation.z=th-Math.PI/2;
      }
    }
    a.roof(0,2.11,-.42,4.48,1.87,.61,tile);
    const pediment=a.triangle(cream,[[-.72,2.19],[0,2.89],[.72,2.19]],.24);pediment.position.z=.46;
    a.ring(brick,0,2.40,.73,.14,.14);
  },
  'sand-dune'(a){
    a.pond(2.64,1.25);
    for(const [x,z,w,h,d] of [[-1.37,-.15,1.21,.65,.83],[.10,-.56,1.90,.88,.92],[1.43,-.28,1.12,.57,.75]])
      a.r(0xe1bd83,x,.34,z,w,h,d);
    for(const x of [-1.80,-.66,.18,.94,1.65]){
      a.rod(leaf,[x,.77,-.32],[x-.17,1.17,-.28],.04);a.rod(green,[x,.77,-.32],[x+.15,1.18,-.40],.045);
    }
    for(let i=0;i<6;i++)a.b(wood,-1.76+i*.30,.40,.84,.24,.10,.57);
    a.rail(-.98,.56,1.71);
    for(let i=0;i<3;i++){const x=.67+i*.40,y=1.92+Math.sin(i)*.32;
      for(const side of [-1,1])a.rod(white,[x,y,-.52],[x+side*.17,y+.09,-.50],.032);}
  },
  library(a){
    a.b(glass,0,.83,0,2.74,1.63,1.47);
    [[0,1.62,3.21,1.80],[.04,1.99,3.67,2.00],[.08,2.40,4.12,2.29]].forEach(([x,y,w,d])=>{
      a.b(cream,x,y,0,w,.41,d);a.b(0xc79472,x,y+.12,d/2+.01,w,.10,.07);
      for(let i=0;i<14;i++)a.b(0xc18a6a,x-w*.46+i*w*.91/13,y,d/2+.04,.041,.34,.04);
    });
    for(const x of [-1.06,-.54,0,.54,1.06])a.b(iron,x,.73,.77,.08,1.4,.12);
    a.b(wood,0,.25,1.01,3.24,.18,.58);
  },
  'wooden-station'(a){
    a.b(cream,0,.25,0,4.3,.37,1.93);a.b(0xd1bc83,0,1.03,-.23,3.62,1.34,1.38);
    for(let i=0;i<7;i++)a.b(0xba936d,0,.50+i*.17,.48,3.58,.035,.035);
    for(const x of [-1.31,-.61,.91,1.41])a.window(x,1.12,.52,.40,.61);
    a.b(tile,.13,.95,.52,.54,1.19,.08);a.roof(0,1.73,-.19,4.06,1.92,.63,0x65685b);
    for(const x of [-1.72,1.72])a.post(wood,x,.90,.98,.06,1.36);
    a.b(tile,0,1.60,.86,3.91,.12,.91).rotation.x=.13;
    for(const x of [-1.88,-1.37,-.86,-.35,.16,.67,1.18,1.69])a.b(wood,x,.12,1.38,.15,.12,.64);
    for(const z of [1.18,1.59])a.b(iron,0,.21,z,4.24,.09,.085);
  },
  'flower-nursery'(a){
    for(const z of [-1.09,-.36,.39]){
      for(const x of [-1.81,1.81])a.post(iron,x,.81,z,.055,1.54);
      for(let i=0;i<8;i++){
        const t=i*Math.PI/8,u=(i+1)*Math.PI/8;
        a.rod(iron,[1.82*Math.cos(t),1.56+.75*Math.sin(t),z],[1.82*Math.cos(u),1.56+.75*Math.sin(u),z],.045);
      }
    }
    a.b(0xa7c9b1,0,2.27,-.35,1.50,.09,1.58);
    for(let i=0;i<9;i++){
      const x=i%5*.65-1.38,z=i<5?.84:-.24;
      a.post(coral,x,.27,z,.21,.51);a.rod(green,[x,.50,z],[x,.88,z],.039);
      a.blossom(x,.88,z,.42,[pink,cream,straw,0xc985ae][i%4]);
    }
  },
  'sugar-train'(a){
    for(const z of [-.05,.68])a.b(iron,0,.17,z,4.75,.12,.095);
    for(let i=0;i<9;i++)a.b(wood,-2.08+i*.51,.10,.30,.23,.095,1.11);
    for(const [x,w] of [[-.85,2.28],[1.40,1.47]]){
      a.b(ink,x,.56,.30,w,.23,1.01);
      for(const dx of [-.32,.32])for(const dz of [-.54,.54]){
        a.o(ink,x+dx*w,.47,.30+dz,.29,.29,.09);a.o(coral,x+dx*w,.47,.30+dz*1.12,.16,.16,.04);
      }
    }
    a.o(deep,-1.13,1.06,.29,.92,.47,.47);a.post(ink,-1.65,1.65,.29,.128,.70);
    a.post(ink,-1.65,2.02,.29,.19,.13);a.o(straw,-1.96,1.16,.42,.12,.12,.10);
    a.b(green,-.20,1.30,.28,.69,1.13,.96);a.window(-.20,1.55,.79,.42,.37);a.b(cream,-.20,1.89,.28,.91,.14,1.17);
    a.b(0xc19557,1.42,.90,.30,1.43,.48,.95);
    for(let i=0;i<5;i++)a.rod(straw,[.78,1.22+(i%2)*.10,-.05+i*.14],[2.05,1.38+(i%2)*.1,.04+i*.13],.071);
  },
  'rice-shop'(a){
    a.b(0xb4815a,-.38,.96,-.38,2.55,1.89,1.61);a.roof(-.38,1.95,-.38,2.89,1.89,.65,tile);
    for(const x of [-1.47,-.91,-.35,.21,.77])a.b(umber,x,1.02,.45,.08,1.91,.11);
    a.b(umber,-.65,.88,.49,.69,1.59,.11);a.window(.42,1.05,.52,.54,.69);
    for(const [x,z,s] of [[-1.48,.88,.43],[-.95,1.1,.32],[-1.84,.57,.33]]){
      a.o(straw,x,s*.86,z,s,s*.94,s*.72);a.ring(cream,x,s*1.59,z+.07,s*.42,s*.15);
    }
    for(const x of [1.38,1.75,2.04]){
      a.rod(green,[x,.12,.03],[x-.12,1.59,.02],.04);
      for(let i=0;i<5;i++)a.o(straw,x-.11+i*.065,1.55-i*.066,.02,.09,.14,.06);
    }
  },
  'painter-easel'(a){
    a.b(cream,.65,.99,-.60,2.55,1.91,1.40);a.b(brick,.65,.36,.12,2.56,.42,.10);
    a.roof(.65,1.98,-.60,2.93,1.77,.67,tile);
    for(const x of [.14,1.23])a.window(x,1.21,.13,.65,.77);
    for(const x of [-1.98,-.72])a.rod(wood,[x,.13,.85],[-1.32,2.57,.69],.08);
    a.rod(wood,[-1.34,.14,.02],[-1.32,2.49,.69],.075);
    a.b(umber,-1.34,1.56,.80,1.39,1.34,.11);a.b(0xa8c8b1,-1.34,1.57,.88,1.25,1.21,.16);
    a.r(green,-1.50,1.48,1.0,.40,.26,.035);a.r(leaf,-1.14,1.40,1.0,.40,.27,.035);
    a.o(straw,-1.02,1.87,1,.13,.13,.028);a.b(wood,-1.34,.88,.91,1.63,.11,.26);
  },
  pomelo(a){
    a.tree(-1.13,-.19,1.13,0xc5cd64);a.tree(1.10,-.76,.85,0xc3cb6b);
    for(const [x,z] of [[.67,.79],[1.55,.47]]){
      a.b(wood,x,.30,z,.97,.49,.68);
      for(const y of [.20,.40])a.b(0xc89462,x,y,z+.36,.98,.074,.04);
      for(const dx of [-.24,.22])a.o(0xb8c856,x+dx,.59,z,.23,.26,.23);
    }
  },
  mosaic(a){
    // A commemorative bust and a small decorative colour study in the artist's palette.
    a.b(stone,-.90,.82,-.03,.99,1.61,.84);
    a.o(0x758778,-.90,1.73,-.04,.46,.27,.28);
    a.o(0x6c7c6c,-.90,2.06,-.04,.27,.36,.25);
    a.o(0x5a7060,-.89,2.29,-.08,.28,.16,.23);
    a.o(0x758778,-.90,2.09,.19,.07,.075,.07);
    a.b(0x735c40,-.90,.94,.405,.47,.29,.035);
    a.b(stone,.72,.83,-.61,1.76,1.49,.39);
    const pattern=['0012210','0123210','1234321','2343432','3432343'];
    pattern.forEach((row,j)=>Array.from(row).forEach((v,i)=>{
      const tone=[cream,straw,coral,glass,deep][Number(v)];
      a.b(tone,.03+i*.23,1.34-j*.26,-.39,.218,.244,.062);
    }));
    a.tree(1.74,-.55,.79);a.bench(.87,.88);
  },
  'lotus-temple'(a){
    a.pond();a.temple(.38,-.65,1.02);
    const gable=a.triangle(cream,[[-.48,1.81],[.38,2.39],[1.24,1.81]],.14);
    gable.position.z=.34;a.o(straw,.38,2.02,.505,.12,.12,.04);
    for(const x of [-.95,1.72]){
      a.b(stone,x,.32,.19,.46,.49,.48);
      a.o(0xc89962,x,.81,.19,.20,.32,.16);a.o(0xcda475,x,1.18,.19,.14,.17,.12);
      a.rod(umber,[x+.22,.32,.21],[x+.22,1.41,.21],.034);
    }
    a.rail(-1.32,.87,1.69);
  },
  'water-caltrop'(a){
    a.pond(2.48,1.33);
    for(const [x,z,s] of [[-.88,.60,.65],[-1.59,-.43,.48],[.41,-.55,.60]]){
      for(let i=0;i<7;i++){
        const t=i*Math.PI*2/7;
        a.r(i%2?green:leaf,x+Math.cos(t)*s*.38,.23,z+Math.sin(t)*s*.36,.27*s,.073,.31*s).rotation.y=-t;
      }
    }
    a.boat(1.21,.37,.72);
    for(const [x,z,s] of [[-.44,.03,.71],[.36,.55,.41]]){
      a.o(0x743e35,x,.47,z,.36*s,.21*s,.18*s);
      for(const side of [-1,1]){
        a.rod(0x643d36,[x+side*.15*s,.47,z],[x+side*.56*s,.69,z],.09*s);
        a.rod(0x643d36,[x+side*.56*s,.69,z],[x+side*.71*s,.89,z],.052*s);
      }
    }
  },
  'market-basket'(a){
    // A stylised Taiwan cattle market with horns, muzzle, yoke and a striped market shade.
    for(const dx of [-.49,.50])for(const dz of [-.26,.26])a.post(umber,-.66+dx,.53,dz,.085,.89);
    a.o(0xa6724f,-.66,1.06,0,.87,.49,.43);a.o(wood,-1.40,1.22,.12,.37,.34,.31);
    a.o(0xc59673,-1.68,1.12,.20,.25,.16,.22);
    for(const side of [-1,1]){
      a.rod(cream,[-1.38,1.43,side*.16],[-1.37,1.65,side*.36],.076);
      a.rod(cream,[-1.37,1.65,side*.36],[-1.48,1.83,side*.41],.041);
      a.o(ink,-1.57,1.36,side*.233+.08,.04,.05,.04);
    }
    a.rod(wood,[.11,1.18,0],[.35,.61,-.03],.046);
    for(const x of [1.01,2.04])a.post(wood,x,.96,-.08,.075,1.92);
    for(let i=0;i<5;i++)a.b(i%2?cream:coral,.90+i*.31,1.95,-.11,.32,.12,1.37).rotation.x=.11;
    a.b(wood,1.53,.70,-.08,1.27,.17,.82);a.o(straw,1.47,.91,.02,.33,.21,.25);
  },
  archaeology(a){
    // Faceted masonry volumes and a section of the layers below the plaza.
    a.b(stone,-.42,1.13,-.55,3.53,2.18,1.71);
    for(let i=0;i<6;i++)a.b([0xa78067,0xbd9a7c,0xd6b996][i%3],-.42,.39+i*.28,.329,3.56,.21,.089);
    a.b(ink,-.13,1.19,.397,1.48,.65,.058);a.window(-.14,1.18,.44,1.28,.44);
    for(let i=0;i<3;i++)a.b([stone,0xd0b493,0xb6977b][i],.16+i*.58,2.19+i*.04,-.44,1.07,.38+i*.19,1.76).rotation.z=.16;
    for(const [x,z,s] of [[-1.32,.89,.44],[-.68,.99,.28]]){
      a.o(coral,x,s*.82,z,s*.67,s*.82,s*.63);a.post(umber,x,s*1.55,z,s*.34,s*.16);
    }
  },
  sesame(a){
    for(const [x,z,h] of [[-1.76,-.34,2.02],[-1.02,.26,2.31],[-.28,-.45,2.52],[.40,.20,1.99],[.92,-.67,2.13]]){
      a.rod(green,[x,.12,z],[x+.14,h,z],.055);
      for(let i=0;i<4;i++){
        const dir=i%2?1:-1,y=h*(.36+i*.14);
        a.r(leaf,x+dir*.16,y,z,.20,.095,.08).rotation.z=dir*.48;
        a.o(i>1?cream:0xb3b978,x+dir*.12,y+.14,z+.07,.102,.19,.095).rotation.z=dir*.30;
      }
    }
    a.b(wood,1.65,.52,.25,.98,.14,1.07);
    for(const x of [1.32,1.99])a.post(umber,x,.26,.24,.075,.49);
    a.o(straw,1.65,.69,.26,.41,.13,.34);
    for(let i=0;i<8;i++)a.o(ink,1.40+(i%4)*.14,.793,.19+Math.floor(i/4)*.15,.05,.032,.044);
  },
  lotus(a){
    a.pond(2.65,1.55);
    for(const [x,z,s,y] of [[-1.40,.23,.83,.22],[-.33,-.54,1.06,.23],[.80,.45,.84,.21],[1.65,-.44,.59,.23]])a.lily(x,z,s,y);
    for(const [x,z,h] of [[-1.84,-.72,1.46],[.45,-.63,1.66],[1.46,.29,1.10]]){
      a.rod(deep,[x,.22,z],[x+.08,h,z],.04);a.o(pink,x+.08,h+.13,z,.16,.26,.15);
    }
    a.rail(-.91,1.20,2.51);
  },
  telescope(a){
    a.post(cream,-.73,.69,-.35,1.05,1.35);a.o(0xb4c6bc,-.73,1.38,-.35,1.15,.91,1.14);
    a.b(tile,-.73,1.91,-.28,.18,.85,1.48).rotation.x=-.24;
    a.post(0x959e87,-.73,1.34,-.35,1.08,.11);
    for(const theta of [-.61,0,.61]){
      const x=-.73+Math.sin(theta)*1.05,z=-.35+Math.cos(theta)*1.05;
      a.b(glass,x,.87,z,.30,.37,.08).rotation.y=theta;
    }
    for(const [x,z] of [[.87,.84],[1.80,.86],[1.40,-.04]])a.rod(iron,[x,.10,z],[1.36,1.16,.43],.072);
    a.rod(iron,[1.35,1.09,.43],[1.17,1.43,.43],.109);
    a.rod(cream,[.69,1.40,.43],[1.98,2.16,.45],.207);
    a.rod(deep,[1.78,2.04,.44],[2.07,2.22,.45],.246);
    a.rod(glass,[2.06,2.22,.45],[2.11,2.25,.45],.20);
  },
  'old-street'(a){
    for(const [x,h,c] of [[-1.36,2.14,0xcfa275],[0,2.53,0xe0bd8f],[1.36,2.23,brick]]){
      a.b(c,x,h*.5,-.22,1.31,h,1.42);a.b(cream,x,1.12,.55,1.39,.14,.26);
      a.b(umber,x,.51,.52,.88,1.02,.08);
      for(const side of [-1,1])a.b(cream,x+side*.55,.57,.79,.15,1.10,.16);
      for(const side of [-1,1])a.window(x+side*.275,1.64,.53,.33,.54);
      a.b(cream,x,h,.52,1.39,.12,.26);a.b(c,x,h+.17,.48,.79,.37,.25);
      a.ring(cream,x,h+.28,.65,.20,.15);
      for(const side of [-1,1])a.o(cream,x+side*.52,h+.15,.52,.074,.17,.072);
    }
  },
  waterworks(a){
    a.b(brick,-.59,.96,-.37,2.92,1.86,1.75);a.roof(-.59,1.93,-.37,3.31,2.0,.62,tile);
    for(const x of [-1.62,-.96,-.28,.36])a.window(x,1.23,.54,.39,.65);
    a.b(cream,-.59,.52,.54,2.92,.14,.10);
    a.b(stone,1.54,.24,.21,1.41,.40,1.32);
    a.ring(iron,1.52,1.05,.56,.66,.66);
    for(let i=0;i<6;i++){const t=Math.PI*i/3;a.rod(iron,[1.52,1.05,.57],[1.52+.63*Math.cos(t),1.05+.63*Math.sin(t),.57],.042);}
    a.post(iron,1.52,.70,.23,.14,.88);
    a.rod(jade,[.39,.53,.95],[1.47,.53,.95],.15);
  },
  plum(a){
    for(const [x,z,s] of [[-1.25,-.17,1],[.62,-.73,.87]]){
      const nodes=[[0,.11],[-.13,.96],[.07,1.58],[-.45,2.13],[-.83,2.29]];
      for(let i=0;i<nodes.length-1;i++){
        const [u,v]=nodes[i],[w,h]=nodes[i+1];
        a.rod(umber,[x+u*s,v*s,z],[x+w*s,h*s,z-.06*i],(.125-i*.019)*s);
      }
      for(const [dx,y,ex,ey] of [[-.13,.96,.64,1.84],[.18,1.43,.92,1.76],[.07,1.58,.38,2.49],[-.45,2.13,-.30,2.57]]){
        a.rod(wood,[x+dx*s,y*s,z],[x+ex*s,ey*s,z+.15],.063*s);
        for(const [u,v] of [[0,0],[-.15,.13],[.12,.14]])a.blossom(x+(ex+u)*s,(ey+v)*s,z+.16,.37*s,white);
      }
    }
    a.bench(1.57,.75);
  },
  reservoir(a){
    a.pond(2.65,1.41);
    for(const [x,z,w,h] of [[-1.6,-.77,1.17,1.23],[.82,-.88,1.76,1.52],[1.89,-.38,.94,1.02]])a.r(green,x,.53,z,w,h,.94);
    a.b(stone,-.41,.48,.81,3.35,.91,.45).rotation.x=-.13;
    for(const x of [-1.81,-1.19,-.56,.07,.71])a.b(cream,x,.66,.98,.19,1.13,.40);
    a.b(cream,-.47,1.15,.84,3.48,.15,.49);
    for(const x of [-1.53,-.89,-.25,.38])a.b(glass,x,.46,1.03,.39,.57,.07);
    a.b(cream,1.39,1.02,-.30,.50,1.97,.49);a.roof(1.39,2.05,-.30,.77,.77,.29,brick);
  },
  fossil(a){
    // A raised fossil skeleton: articulated backbone, paired ribs, long skull and tusks.
    a.b(0xa48769,-.04,.25,.08,4.35,.38,1.63);
    for(const x of [-1.25,-.48,.32,1.06])a.post(iron,x,.64,.07,.045,.86);
    a.rod(cream,[-1.48,1.40,.12],[.96,1.63,.09],.105);
    for(let i=0;i<7;i++){
      const x=-1.18+i*.27,y=1.50+i*.027;
      a.o(white,x,y,.10,.14,.14,.15);
      for(const side of [-1,1]){
        a.rod(cream,[x,y,.10],[x-.07,y-.14,.10+side*.36],.064);
        a.rod(cream,[x-.07,y-.14,.10+side*.36],[x+.03,y-.58,.10+side*.28],.062);
      }
    }
    for(const x of [-1.16,.49])for(const z of [-.21,.36]){
      a.rod(cream,[x,1.12,z],[x+.12,.78,z],.085);a.rod(cream,[x+.12,.78,z],[x+.02,.45,z],.07);
    }
    a.o(cream,1.13,1.59,.10,.43,.39,.34);a.o(umber,1.24,1.68,.389,.087,.095,.05);
    for(const z of [-.08,.31]){a.rod(white,[1.40,1.47,z],[1.79,1.18,z],.084);a.rod(white,[1.79,1.18,z],[2.06,1.25,z],.055);}
    a.rod(cream,[-1.35,1.45,.1],[-1.85,1.00,.05],.073);
  },
  'noodle-rack'(a){
    for(const [x,z,w,h] of [[-.91,-.28,2.08,1.91],[1.34,-.76,1.43,1.54]]){
      for(const side of [-1,1]){
        const xx=x+side*w*.5;
        a.rod(wood,[xx,.11,z+.58],[xx,h+.06,z],.064);a.rod(wood,[xx,.11,z-.51],[xx,h+.06,z],.064);
      }
      a.rod(wood,[x-w*.59,h,z],[x+w*.59,h,z],.068);
      for(let i=0;i<15;i++){
        const xx=x-w*.44+i*w*.88/14,end=.37+(i%4)*.04;
        a.rod(i%3?cream:white,[xx,h+.04,z+.02],[xx+.023,end,z+.28],.037);
      }
    }
    a.b(wood,-.03,.59,1.00,1.53,.16,.77);
    for(const x of [-.62,.58])a.post(umber,x,.28,1.0,.066,.55);
    for(let i=0;i<3;i++){
      const x=-.45+i*.43;
      for(let j=0;j<3;j++)a.ring(cream,x,.72+j*.017,1,.19-j*.04,.15-j*.03,.21).rotation.x=-Math.PI/2;
    }
  },
  badlands(a){
    a.pond(2.53,1.30);
    // Serrated ridges in three layers, with exposed pale gullies down their faces.
    for(const [x,z,w,h,c] of [[-1.55,-.43,1.17,1.91,0xaaa08c],[-.35,-.74,1.52,2.45,0xa59a87],[1.16,-.66,1.34,2.02,0xb9a98e],[.32,.15,1.26,1.51,0xcdbc9d]]){
      const face=a.triangle(c,[[x-w,.13],[x-w*.45,h*.53],[x-w*.29,h*.48],[x-.07,h],[x+w*.21,h*.66],[x+w*.40,h*.73],[x+w,.13]],.60);
      face.position.z=z;
      a.rod(stone,[x-.07,h*.94,z+.611],[x+w*.13,.31,z+.613],.039);
      a.rod(stone,[x-w*.44,h*.46,z+.612],[x-w*.65,.21,z+.613],.032);
    }
    for(let i=0;i<6;i++)a.b(wood,-1.89+i*.34,.31,.95,.31,.091,.52);
    a.rail(-1.05,.67,1.83);
  }
};

export function makeDistrictMiniature(k,stop) {
  const root=new THREE.Group();
  miniatures[stop.motif](studio(k,root));
  const model=k.bake(root);model.name=stop.title;model.userData.motif=stop.motif;
  return model;
}

const wetlands=new Set(['fan-salt','spoonbill','mangrove','sand-dune','water-caltrop','lotus','reservoir','badlands','lotus-temple']);
const gardens=new Set(['flower-nursery','rice-shop','pomelo','sesame','plum','noodle-rack']);
export function makeDistrictStreet(k,stop) {
  const g=new THREE.Group(),a=studio(k,g), wet=wetlands.has(stop.motif), garden=gardens.has(stop.motif);
  const ground=wet?0xa2b99a:garden?0xb3bf8a:0xd6bd95;
  a.b(ground,0,-.025,-1.55,14,.15,6.07);
  a.b(wet?0xba9670:0xcbb99a,0,.054,3.63,14,.15,4.44);
  // Place props outside the two walking lanes. The path has flush joints and a continuous curb.
  for(let n=0;n<17;n++){
    const x=(n-8)*.86;
    a.b(wet?0x9b7b58:stone,x,.135,1.46,.83,.065,.18);
    if(wet)a.b(0xa68a68,x,.135,3.63,.035,.015,4.17);
    else for(const z of [2.18,3.51,4.84])a.b(0xbda98b,x+(z===3.51?.43:0),.135,z,.026,.011,1.26);
  }
  if(!wet) for(const z of [2.85,4.16])a.b(0xbda98b,0,.134,z,14,.014,.034);
  if(wet){
    a.tree(-4.68,-2.05,1.06);a.rail(3.88,-1.72,2.30);
    for(const x of [3.36,3.81,4.14])a.r(leaf,x,.35,-.94,.36,.39,.31);
  }else if(garden){
    a.roof(3.87,1.89,-1.63,1.97,1.71,.47,0x9d8053);
    for(const x of [3.09,4.65])for(const z of [-2.29,-1.0])a.post(wood,x,1.02,z,.086,2.03);
    a.b(wood,3.86,.77,-1.61,1.46,.13,.70);
    a.tree(-4.87,-2.05,1.19);
  }else{
    a.tree(-4.83,-2.54,1.27);a.tree(4.57,-2.67,.98);
    a.b(stone,3.92,.25,-1.28,1.90,.44,.91);a.r(green,3.96,.64,-1.26,.83,.46,.35);
  }
  a.bench(4.41,.77);
  // The illustrated scene title is physically integrated on the trailhead board.
  const words=stop.title.replace(/^臺南市立|^臺南市|^臺南(?=山上|左鎮)/,'');
  const lines=words.length>7?[words.slice(0,Math.ceil(words.length/2)),words.slice(Math.ceil(words.length/2))]:[words];
  for(const x of [-4.20,-3.11])a.post(wood,x,.83,.46,.083,1.66);
  a.b(deep,-3.65,1.43,.54,1.66,1.05,.15);
  a.b(cream,-3.65,1.98,.54,1.83,.10,.32);
  lines.forEach((line,i)=>k.letters(g,line,-3.65,1.43+(lines.length===1?0:.18-i*.36),.627,1.45,.37));
  return k.bake(g);
}
