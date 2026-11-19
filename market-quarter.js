import { CanvasTexture, CylinderGeometry, Float32BufferAttribute, PlaneGeometry, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace } from 'three';

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

// One repeating grain on the vertex-coloured batch breaks up the flat plaster
// and timber. Project in metres so it holds its scale around corners and roofs.
export function finishMarketSurfaces(mesh,rand){
  const tile=document.createElement('canvas');tile.width=tile.height=128;
  const c=tile.getContext('2d');
  c.fillStyle='#fffdf9';c.fillRect(0,0,128,128);
  for(let i=0;i<2900;i++){
    c.fillStyle=i%5?'#7b65581b':'#99847634';
    c.fillRect(rand()*128,rand()*128,.4+rand()*1.35,.4+rand()*.76);
  }
  const tex=new CanvasTexture(tile);
  tex.colorSpace=SRGBColorSpace;tex.wrapS=tex.wrapT=RepeatWrapping;tex.anisotropy=4;
  const {position,normal}=mesh.geometry.attributes,uv=new Float32Array(position.count*2);
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i);
    const ax=Math.abs(normal.getX(i)),ay=Math.abs(normal.getY(i)),az=Math.abs(normal.getZ(i));
    uv[2*i]=(ax>az&&ax>ay?z:x)*.68;
    uv[2*i+1]=(ay>ax&&ay>az?z:y)*.68;
  }
  mesh.geometry.setAttribute('uv',new Float32BufferAttribute(uv,2));
  mesh.material=mesh.material.clone();mesh.material.map=tex;
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
    k.rock(g,0xd8bc8b,x+.012,.763,z,.048,.019,.023);
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
  // At the near verge: an opening onto the lane, bordered by a vendor's cart
  // and two baskets. All three sit inside the island between the branching roads.
  bambooCart(k,p,1.13,9.14,1.58,true);
  greens(k,p,-.32,8.74,.96);greens(k,p,-1.09,8.92,.72);
}
