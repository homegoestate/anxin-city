import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, LatheGeometry, PlaneGeometry, Shape, ShapeGeometry, Vector2 } from 'three';

const linen=0xffe8bc, jade=0x2e756a, ink=0x3a534d;
const brick=0xb47157, red=0xc6533b, honey=0xefad5e, wood=0x996746;

// Terrazzo thresholds and russet setts outside the playable lanes. The street
// network and the landmark's foreground flagstones are laid over this surface.
export function marketPaving(c,rand){
  c.fillStyle='#bdaf98';c.fillRect(-46,-46,92,92);
  for(let row=0;row<105;row++){
    const z=-46+row*.92,offset=(row%2)*.91;
    for(let col=0;col<52;col++){
      const x=-47+col*1.84+offset,shade=rand();
      c.fillStyle=shade<.24?'#d0bca0':shade<.67?'#d2c1a8':'#dac7ac';
      c.fillRect(x,z,1.80,.89);
    }
  }
  // The drain beside the tea handcart has a row of inset stone caps.
  c.fillStyle='#98937f';c.fillRect(-4.9,7.83,10.7,.18);
  c.fillStyle='#d7cbb1';
  for(let i=0;i<34;i++)c.fillRect(-4.84+i*.312,7.86,.23,.075);
}

function molding(k,p,x,y,z,w,tint=linen){
  k.box(p,tint,x,y,z,w,.09,.25);
  k.box(p,tint,x,y+.085,z+.035,w+.08,.055,.29);
}

// Open arch silhouettes give each shop a real recessed walkway and shadow.
function archPanel(k,p,width,height,rise,color,z){
  const shoulder=height-rise,s=new Shape();
  s.moveTo(-width/2,height+.12);s.lineTo(width/2,height+.12);
  s.lineTo(width/2,0);s.lineTo(width*.405,0);s.lineTo(width*.405,shoulder);
  s.bezierCurveTo(width*.40,height,-width*.40,height,-width*.405,shoulder);
  s.lineTo(-width*.405,0);s.lineTo(-width/2,0);s.closePath();
  k.part(p,new ShapeGeometry(s,8),color,0,0,z);
}

function oldShop(k,p,x,z,w,h,wall,accent,yaw=0){
  const g=k.group(p,x,.11,z);g.rotation.y=yaw;
  const bay=w/2,front=.93,arcade=2.08;
  k.box(g,wall,0,h/2,-.42,w,h,2.7);
  k.box(g,0x547168,0,.96,front+.02,w-.15,1.85,.07);
  k.box(g,0xd9b995,0,.10,front+.42,w+.11,.17,1.14);
  k.box(g,0x746455,0,arcade-.02,front+.38,w,.16,1.01);
  for(const sign of [-1,1]){
    const b=k.group(g,sign*w*.25,0,0);
    archPanel(k,b,bay,arcade,.64,wall,front+.90);
    k.box(b,0x8c6651,0,.49,front+.19,bay*.69,.73,.24);
    k.box(b,0xcda379,0,.88,front+.22,bay*.75,.075,.30);
    for(let n=-2;n<=2;n++){
      k.box(b,0xb9845c,n*bay*.12,.49,front+.32,bay*.103,.59,.022);
      k.rock(b,n%2?0xbf9759:0x9ba668,n*bay*.115,.99,front+.23,.14,.095,.12);
    }
    k.box(b,accent,0,1.62,front+.12,bay*.73,.18,.12);
    const wy=(arcade+h)*.50,wh=Math.max(.52,(h-arcade)*.61);
    k.box(b,linen,0,wy,front+.03,bay*.69+.14,wh+.17,.11);
    k.box(b,ink,0,wy,front+.103,bay*.69,wh,.07);
    for(const i of [-1,1]){
      k.box(b,0x84a598,i*bay*.16,wy,front+.152,bay*.276,wh*.87,.026);
      k.box(b,accent,i*bay*.39,wy,front+.12,bay*.102,wh,.06);
    }
    k.box(b,linen,0,wy+wh*.19,front+.174,bay*.64,.053,.052);
    k.box(b,accent,0,wy-wh*.52,front+.14,bay*.82,.093,.27);
    k.box(b,linen,0,wy-wh*.51,front+.27,bay*.80,.065,.32);
    for(let j=-2;j<=2;j++)k.box(b,accent,j*bay*.125,wy-wh*.35,front+.39,.023,wh*.23,.027);
    k.box(b,accent,0,wy-wh*.23,front+.39,bay*.74,.036,.035);
  }
  molding(k,g,0,arcade+.13,front+.89,w+.09);
  molding(k,g,0,h,front+.08,w+.23);
  k.box(g,wall,0,h+.25,front,w,.43,.24);
  k.box(g,accent,0,h+.46,front,w+.14,.08,.30);
  for(const n of [-1,0,1])k.box(g,linen,n*w*.37,h+.24,front+.13,w*.12,.14,.054);
}

function tiledHouse(k,p,x,z,w,h,tiles,wall){
  const g=k.group(p,x,.12,z),d=2.82,rise=.85,run=Math.hypot(d*.5,rise);
  k.box(g,wall,0,h*.5,0,w,h,d);
  for(const side of [-1,1]){
    k.box(g,tiles,0,h+rise*.50,side*d*.25,w+.27,.14,run+.24).rotation.x=side*Math.atan2(rise,d*.5);
    k.box(g,0x8d705a,0,h+.01,side*d*.54,w+.35,.13,.16);
  }
  k.box(g,0xbd8b6b,0,h+rise+.06,0,w+.31,.13,.14);
  for(let i=0;i<Math.ceil(w/.29);i++){
    const a=-w/2+i*.29;
    k.box(g,0xc48f6f,a,h+rise*.50+.08,d*.25,.052,.038,run+.18).rotation.x=Math.atan2(rise,d*.5);
  }
  for(const n of [-1,0,1]){
    k.box(g,0xd0b997,n*w*.30,h*.53,d*.50+.03,w*.19,.94,.10);
    k.box(g,0x637b70,n*w*.30,h*.53,d*.50+.085,w*.16,.79,.04);
    k.box(g,0xb4ac8d,n*w*.30,h*.53,d*.50+.115,.046,.80,.035);
  }
}

function lampion(k,p,x,y,z,r,tint){
  const g=k.group(p,x,y,z);
  k.part(g,k.farBall,tint,0,0,0,r,r*.98,r*.88);
  for(const sign of [-1,1]){
    k.post(g,0x83533b,0,sign*r*.86,0,r*.59,.052);
    const seam=k.rock(g,honey,sign*r*.41,0,r*.76,.012,r*.73,.014);
    seam.rotation.z=sign*.07;
  }
  k.post(g,0xe8ae5a,0,-r*1.17,0,.025,r*.38);
}

function lanternLine(k,p,start,end,count,tint=red){
  const point=t=>{
    const [x,y,z]=start,[ex,ey,ez]=end;
    return [x+(ex-x)*t,y+(ey-y)*t-.44*4*t*(1-t),z+(ez-z)*t];
  };
  for(let i=0;i<count+1;i++)k.rod(p,0x675c48,point(i/(count+1)),point((i+1)/(count+1)),.015);
  for(let i=1;i<=count;i++){
    const [x,y,z]=point(i/(count+1)),r=.15+(i%2)*.035;
    k.rod(p,0x77654b,[x,y,z],[x,y-.13,z],.014);
    lampion(k,p,x,y-.13-r*.86,z,r,i%2?tint:0xf2b464);
  }
}

function curtain(k,p,x,y,z,word,tint){
  const g=k.group(p,x,y,z);g.rotation.y=-.10;
  k.rod(g,wood,[-.40,.49,0],[.40,.49,0],.034);
  for(const side of [-1,1]){
    const cloth=k.box(g,tint,side*.17,.01,0,.327,.89,.045);
    cloth.rotation.z=side*.028;
    k.box(g,linen,side*.172,-.354,.026,.314,.030,.018);
  }
  k.letters(g,word,0,.11,.038,.57,.51);
}

function steamer(k,p,x,y,z,s){
  const g=k.group(p,x,y,z);g.scale.setScalar(s);
  k.post(g,0x596966,0,.11,0,.40,.21);
  for(let i=0;i<3;i++){
    const h=.27+i*.16;
    k.post(g,i%2?0xd9a265:0xe6b478,0,h,0,.42,.15);
    k.post(g,0xae774e,0,h-.045,0,.426,.037);
  }
  k.post(g,0xedc994,0,.62,0,.392,.035);
  for(const [x,z] of [[-.16,.09],[.15,.10],[-.02,-.17]]){
    k.part(g,k.farBall,0xffe2ad,x,.69,z,.125,.094,.11);
    k.rock(g,0xba5b45,x+.012,.775,z,.024,.017,.023);
  }
  // Bent wire-like wisps dissolve into the light at their narrow tips.
  for(const [dx,h] of [[-.10,.40],[.12,.29]]){
    k.rod(g,0xe3d9bd,[dx,.78,.02],[dx+.049,.78+h*.31,.035],.016);
    k.rod(g,0xe9dec6,[dx+.049,.78+h*.31,.035],[dx-.008,.78+h*.67,.046],.013);
    k.rod(g,0xf7e5c3,[dx-.008,.78+h*.67,.046],[dx+.044,.78+h,.05],.010);
  }
}

function bambooCart(k,p,x,z,width,front=false){
  const g=k.group(p,x,.13,z);g.rotation.y=front?-.32:.05;
  for(const side of [-1,1]){
    // Wheels lie in the x/y plane, with the axle running through the cart.
    const wx=side*width*.33;
    k.post(g,ink,wx,.31,0,.27,.12).rotation.x=Math.PI/2;
    k.post(g,0xd3a474,wx,.31,.078,.20,.03).rotation.x=Math.PI/2;
    k.post(g,wood,wx,.31,.105,.052,.03).rotation.x=Math.PI/2;
  }
  k.box(g,wood,0,.65,0,width,.65,.70);
  for(let i=0;i<9;i++)k.box(g,i%3?0xc4915e:0xd3a676,(i-4)*width/9,.64,.362,width/9-.012,.56,.04);
  k.box(g,0x8f603e,0,.52,.40,width+.05,.047,.071);
  k.box(g,linen,0,1.0,0,width+.13,.09,.82);
  for(const sign of [-1,1])k.box(g,wood,sign*width*.43,1.57,-.24,.055,1.06,.055);
  if(front){
    k.box(g,jade,0,2.09,-.24,width*.94,.10,.09);
    for(let i=0;i<5;i++){
      const shade=k.box(g,i%2?0xe4bf81:0xeccf9a,(i-2)*width*.20,2.07,.04,width*.20,.050,.78);
      shade.rotation.x=.14;
    }
    steamer(k,g,-width*.20,1.05,.03,.63);
    k.post(g,0xa05540,width*.24,1.15,0,.14,.19);
    for(const dx of [-.055,0,.05])k.rod(g,0xf4dca4,[width*.24+dx,1.19,0],[width*.24+dx*1.6,1.48,.02],.012);
  }else{
    steamer(k,g,-width*.21,1.05,.025,.85);
    for(const n of [0,1])k.post(g,n?0x8e654a:0xa37153,width*.23,1.14+n*.13,-.05,.23,.14);
    k.post(g,linen,width*.23,1.36,-.05,.22,.035);
    curtain(k,g,.06,1.94,-.23,'蒸',jade);
  }
}

function greens(k,p,x,z,s){
  const g=k.group(p,x,.13,z);g.scale.setScalar(s);
  k.taper(g,0xcb9563,0,.24,0,.48,.42,.39).rotation.z=Math.PI;
  for(const h of [.20,.33,.44])k.taper(g,h>.4?0xb67d4d:0xd5a675,0,h,0,.46+h*.085,.038,.37+h*.08);
  for(let i=0;i<9;i++){
    const a=i*2.4,b=i%3*.09;
    const dx=Math.cos(a),dz=Math.sin(a),sx=dx*(.19+b),sz=dz*(.13+b);
    const leaf=k.rock(g,[0x527b50,0x719947,0x93a953][i%3],sx,.57+i%3*.028,sz,.10,.26,.088);
    leaf.rotation.z=-dx*.60;leaf.rotation.x=dz*.59;
    k.rod(g,0xc1cd81,[sx*.75,.42,sz*.75],[sx*1.15,.68,sz*1.15],.021);
  }
}

function fruitStand(k,p,x,z,tint){
  const g=k.group(p,x,0,z);
  // Sun-bleached piping and hand-stitched hems on the existing striped shades.
  for(let i=0;i<7;i+=2){
    const dx=(i-3)*.36-.115;
    k.box(g,0xedce9e,dx,2.102,.04,.030,.018,1.43).rotation.x=.15;
    k.box(g,0xedce9e,dx,1.855,.804,.029,.20,.014);
  }
  k.box(g,tint,-.44,.49,.515,.88,.39,.022);
  for(const y of [.35,.39])k.box(g,linen,-.44,y,.539,.86,.015,.012);
  for(let i=0;i<4;i++){
    const a=-.56+i*.14;
    k.rock(g,0xe2ad5d,a,1.50-(i%2)*.05,.20,.052,.15,.065);
    k.box(g,0x847455,a,1.75,.20,.014,.26,.014);
  }
  const slip=k.group(g,.81,1.09,.49);slip.rotation.x=-.17;slip.rotation.z=.06;
  k.box(slip,wood,0,-.04,0,.023,.28,.024);
  k.box(slip,0xf3d596,0,.06,.015,.26,.16,.023);
  for(let i=0;i<3;i++)k.box(slip,0xad7557,(i-1)*.055,.06,.032,.023,.075-i%2*.017,.011);
}

function gridSurface(columns,rows,point){
  const positions=[],indices=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++)positions.push(...point(i/columns,j/rows));
  for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
    const a=j*(columns+1)+i,b=a+1,c=a+columns+1;
    indices.push(a,c,b,b,c,c+1);
  }
  const geometry=new BufferGeometry();
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}

// Each stitched panel dips between its stitched edges. The hanging scallops
// have a warm contrasting binding which can still be read from a phone.
function canvasShade(k,p,x,z,tint){
  const stall=k.group(p,x,0,z),w=.385;
  for(let i=0;i<7;i++){
    const center=(i-3)*w,a=i%2?0xffe4ae:tint;
    const sculpt=(u,v)=>.065*Math.sin(i*1.7+v*1.4)-.072*Math.sin(u*Math.PI)*Math.sin(v*Math.PI);
    const roof=gridSurface(5,5,(u,v)=>[(u-.5)*w,2.34-v*.236+sculpt(u,v),-.79+v*1.69]);
    k.part(stall,roof,a,center,0,0);
    const valance=(u,v)=>[(u-.5)*w,2.104+sculpt(u,1)-v*(.31+.109*Math.sin(u*Math.PI)),.903+.063*Math.sin(u*Math.PI)*v];
    k.part(stall,gridSurface(7,2,valance),a,center,0,0);
    k.part(stall,gridSurface(7,1,(u,v)=>{
      const [x,y,z]=valance(u,.90+.055*v);return [x,y,z+.005];
    }),i%2?0xd2a67b:0xd8ac72,center,0,0);
  }
}

function produceLeaves(){
  return gridSurface(4,6,(u,v)=>{
    const half=.038+.39*Math.pow(Math.sin(v*Math.PI),.77);
    const side=(u-.5)*2;
    return [-side*half,v,.14*Math.sin(v*Math.PI)+.14*v*v-.12*side*side*Math.sin(v*Math.PI)];
  });
}
function cabbage(k,p,leaf,x,y,z,s,turn){
  const g=k.group(p,x,y,z);g.rotation.y=turn;g.scale.setScalar(s);
  for(let i=0;i<6;i++){
    const a=i*2.4,curl=k.group(g,Math.sin(a)*.041,0,Math.cos(a)*.04);
    curl.rotation.y=a;curl.rotation.x=.22+(i%3)*.24;
    k.part(curl,leaf,[0x337244,0x558d43,0x89ab52][i%3],0,.035,0,.54,.68,.52);
    k.rock(curl,0xe0dda4,0,.172,.054,.055,.17,.055,true);
    k.rod(curl,0xa5bd67,[0,.29,.069],[0,.55,.093],.013);
  }
}
function vegetableCounter(k,p){
  const leaf=produceLeaves(),g=k.group(p,-3.10,0,.68);
  for(let i=0;i<4;i++)cabbage(k,g,leaf,(i-1.5)*.34,.85,.24,.64+(i%2)*.14,i*.81);
  const scallions=k.group(g,.35,.93,.51);scallions.rotation.z=-.94;scallions.rotation.x=.46;
  for(let i=0;i<6;i++){
    const x=(i-2.5)*.042,top=.44+.041*(i%3),z=.018*(i%2);
    k.rod(scallions,0xeee2b2,[x,-.10,z],[x*.8,.15,z],.026);
    k.rod(scallions,i%2?0x628950:0x47794c,[x*.8,.15,z],[x*1.6,top,z+.035],.024);
  }
  k.box(scallions,0xb45645,0,.09,.016,.25,.039,.082);
  // A few whole daikon, their white roots tilted together over the crate lip.
  for(let i=0;i<3;i++){
    const root=k.group(g,-.87+i*.14,.91,.41);root.rotation.z=-.43;root.rotation.x=.82;
    k.part(root,k.farBall,0xefdda7,0,0,0,.075,.22,.071);
    k.rod(root,0xf5e8c7,[0,-.15,0],[.028,-.26,0],.019);
    k.part(root,leaf,0x488342,0,.16,0,.20,.24,.26);
  }
  for(const [x,z] of [[-.75,.60],[.68,.60]]){
    k.box(g,0x8a5637,x,.47,z,.44,.84,.10);
    for(let n=0;n<4;n++)k.box(g,n%2?0xb3784c:0xc18c57,x,.25+n*.14,z+.07,.49,.093,.062);
  }
  k.box(g,0xb18257,0,.54,.596,.73,.47,.058);
  k.box(g,0x365b50,0,.54,.639,.65,.40,.04);k.letters(g,'青菜',0,.55,.669,.59,.32);
}

function settingCloth(k,p){
  const g=k.group(p,.86,0,1.48);g.rotation.y=.12;
  for(const x of [-.47,.47])for(const z of [-.18,.18])k.box(g,0x825639,x,.32,z,.061,.62,.061);
  k.box(g,wood,0,.62,0,1.10,.10,.55);
  const colors=[[0xffeacf,0xa1bec1],[0xa1bec1,0x618793]],cell=.141;
  // The pattern continues from the tabletop down the folded front hem.
  for(let row=0;row<6;row++)for(let col=0;col<8;col++){
    const x=(col-3.5)*cell,color=colors[row%2][col%2];
    if(row<4)k.box(g,color,x,.678,(row-1.5)*cell,cell+.001,.014,cell+.001);
    else k.box(g,color,x,.67-(row-3.5)*cell,.285,cell+.001,cell+.001,.013);
  }
  steamer(k,g,.28,.686,0,.63);
  const bowl=k.group(g,-.23,.686,.015);bowl.rotation.x=.22;bowl.scale.setScalar(1.24);
  const rim=new LatheGeometry([[.075,0],[.083,.027],[.139,.047],[.219,.106],[.265,.185],[.268,.20],[.254,.207],[.238,.18],[.193,.119],[.119,.080],[.005,.071]].map(v=>new Vector2(...v)),20);
  k.part(bowl,rim,0xfff0cf,0,0,0);
  k.part(bowl,new LatheGeometry([new Vector2(.263,.172),new Vector2(.268,.187)],20),0x658887,0,0,0);
  k.part(bowl,k.farBall,0xac4939,-.018,.080,.037,.069,.009,.036);
  const tail=k.rock(bowl,0xc3543f,.061,.086,.041,.031,.013,.037);tail.rotation.y=-.23;
  k.part(bowl,k.farBall,0x513e36,-.050,.09,.048,.009,.006,.009);
}

function roofCrest(k,p){
  const g=k.group(p,0,0,-1.67);
  for(const side of [-1,1]){
    const crest=k.group(g,0,0,0);crest.rotation.y=side>0?0:Math.PI;
    const curls=[[.22,3.85],[.43,3.98],[.61,3.95],[.82,3.81],[1.05,3.78],[1.26,3.88],[1.38,4.00]];
    for(let i=1;i<curls.length;i++){
      const [x,y]=curls[i-1],[xx,yy]=curls[i];
      k.rod(crest,0x41796c,[x,y,0],[xx,yy,0],.058);
      k.rod(crest,0xd69a53,[x,y-.051,.021],[xx,yy-.051,.021],.026);
      if(i>1)k.rock(crest,i%2?0xeaad60:0xbe6241,x,y+.063,0,.050,.094,.039).rotation.z=-.44;
    }
    k.rock(crest,0x4b857a,.40,4.02,.026,.126,.093,.091,true);
    k.rock(crest,0xc76041,.30,4.01,.058,.093,.049,.067);
    k.rock(crest,linen,.38,4.047,.103,.029,.031,.019);
    k.rod(crest,0xdeaa67,[.45,4.057,0],[.52,4.175,-.015],.030);
    for(const x of [.78,1.80]){
      for(let i=0;i<3;i++)k.post(g,i%2?0x578073:0xd19d52,side*x,.56+i*.44,1,.128,.052);
    }
  }
}

// Narrow branches sit beyond the frontage, framing the roofs without passing
// in front of the people or street signs.
function figBough(k,p,x,z,side){
  const g=k.group(p,x,0,z);g.rotation.y=side>0?0:Math.PI;
  const joints=[[0,.12],[.10,2.72],[.46,4.10],[1.49,4.77],[2.86,5.14],[3.63,5.27]];
  for(let n=1;n<joints.length;n++){
    const [a,b]=joints[n-1],[c,d]=joints[n];k.rod(g,0x72553e,[a,b,-.02*n],[c,d,-.02*n],.222-n*.033);
  }
  for(let i=0;i<10;i++){
    const base=.62+i*.30,j=4.28+Math.sqrt(i*.096),dir=i%2?1:-1;
    k.rod(g,0x846547,[base,j,0],[base+.40,j+.29,dir*.43],.039);
    for(let n=0;n<6;n++){
      const a=i*2.37+n*1.27,dx=base+.41+Math.cos(a)*.39,dy=j+.32+Math.sin(a)*.19;
      const leaf=k.rock(g,[0x537647,0x749448,0x98a751,0xb1b664][(n+i)%4],dx,dy,dir*.42+.27*Math.sin(a),.25,.095,.119);
      leaf.rotation.z=Math.sin(a)*.67;leaf.rotation.y=a;
    }
  }
}

function banyan(k,p,x,z,s){
  const g=k.group(p,x,.1,z);g.scale.setScalar(s);
  for(const [dx,dy] of [[-.68,2.0],[.64,2.14],[.06,2.63]]){
    k.rod(g,0x8c7051,[0,.06,0],[dx*.34,1.27,.02],.19);
    k.rod(g,0x866e50,[dx*.34,1.27,.02],[dx,dy,.04],.12);
  }
  for(const [x,y,z,w,h,c] of [[-1.04,2.45,0,1.27,.72,0x62815c],[.77,2.47,.10,1.36,.79,0x769262],[-.22,3.15,-.10,1.45,.89,0x8caa6c],[.92,2.88,-.33,.86,.64,0x96ae70],[-1.02,2.98,-.40,.90,.68,0x9bb174],[-.18,2.42,.77,.96,.60,0x719162]]){
    k.rock(g,c,x,y,z,w,h,w*.71,true);
  }
}

export function marketQuarter(kit,p){
  // Shutter laths, painted shapes and slim mouldings face the lane. A single
  // front plane is enough at this size; round fittings need only eight sides.
  const paintedFace=new PlaneGeometry(),octagon=new CylinderGeometry(1,1,1,8);
  const k={...kit,
    box(parent,color,x,y,z,w,h,d){
      if(d<=.085&&d*1.5<Math.min(w,h))return kit.part(parent,paintedFace,color,x,y,z+d*.5,w,h,1);
      return kit.box(parent,color,x,y,z,w,h,d);
    },
    post:(parent,color,x,y,z,r,h)=>kit.part(parent,octagon,color,x,y,z,r,h,r)
  };
  const facades=[
    [-12.2,-7.2,4.7,4.15,0xc58d74,brick,.08],[-7.4,-7.6,4.55,5.14,0xeac89e,0x927a5e,.025],
    [6.30,-8.1,3.67,4.42,0xd3c6a4,0x758a75,-.05],[10.23,-7.74,4.05,5.24,0xe3b18b,0xa25f50,-.08],
    [-12.8,-2.24,4.14,3.35,0xdfb18f,0xa5664e,.41],[11.3,-3.75,4.12,3.67,0xe8c698,0x60897b,-.33]
  ];
  for(const spec of facades)oldShop(k,p,...spec);
  tiledHouse(k,p,-2.13,-9.40,5.61,2.75,0xb47760,0xd6b18c);
  tiledHouse(k,p,2.43,-10.44,3.69,2.87,0x789087,0xc6b797);
  for(const [x,z,s] of [[-15,-13,1.76],[-6.23,-17,1.47],[.73,-21,1.20],[7.4,-18,1.49],[16,-14,1.71]]){
    banyan(k,p,x,z,s);
  }
  tiledHouse(k,p,-5.57,-19.36,7.01,2.24,0xac846b,0xcfb092);
  tiledHouse(k,p,1.92,-18.91,7.36,2.55,0xaa7e66,0xc4ac88);
  // Two diagonal lines frame the temple's own swallowtail ridges.
  lanternLine(k,p,[-8.0,4.53,-1.37],[-2.25,3.69,-.58],5);
  lanternLine(k,p,[2.27,3.50,-.73],[8.60,4.36,-1.72],5);
  curtain(k,p,-5.75,2.00,-.65,'茶',0x9e493a);
  curtain(k,p,5.25,2.31,-1.55,'米',jade);
  bambooCart(k,p,-5.74,-.10,1.36);
  greens(k,p,5.45,.27,.76);
  fruitStand(k,p,-3,.68,0x98503e);
  fruitStand(k,p,3.04,.49,0x558374);
  canvasShade(k,p,-3,.68,0xb25541);
  canvasShade(k,p,3.04,.49,0x437b70);
  roofCrest(k,p);
  vegetableCounter(k,p);settingCloth(k,p);
  figBough(k,p,-8.70,-2.78,1);figBough(k,p,8.70,-3.03,-1);
  // At the near verge: an opening onto the lane, bordered by a vendor's cart
  // and two baskets. All three sit inside the island between the branching roads.
  bambooCart(k,p,1.13,9.14,1.58,true);
  greens(k,p,-.32,8.74,.96);greens(k,p,-1.09,8.92,.72);
}
