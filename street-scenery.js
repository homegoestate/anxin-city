import * as THREE from 'three';
import { neighborsFor } from './street-neighbors.js?v=29.0.0';
import { marketPaving, marketQuarter } from './market-quarter.js?v=31.0.0';

// Roads and pedestrian circuits use local metres. +Z faces the entrance.
const mainRoad=[[-39,4],[-17,3.1],[-8,3.7],[-5.7,3.55],[-4,3.15],[.3,3.03],[4.6,3.18],[8.1,3.85],[15,2.1],[34,-1]];
const bypass=[[-43,-14.7],[-17,-16.1],[-12.8,-13],[-8.7,-5.5],[-7.5,.4],[-5.7,3.55],[-3.5,5.30],[.3,6.13],[3.08,5.8],[5.56,4.64],[8.1,3.85],[11,-.4],[12.7,-9],[17,-15.4],[43,-13.8]];
const westFork=[[-3.5,5.30],[-6.5,7.72],[-9.8,11.1],[-18,17.6],[-31,23]];
const eastFork=[[5.56,4.64],[7.65,7.75],[10.2,13.2],[18,28]];
const saltTypes=new Set(['fan-salt','beimen-evening']);
const tidalTypes=new Set(['spoonbill','mangrove','sand-dune','yanshui-evening']);
const hillTypes=new Set(['yujing-morning','dongshan-afternoon','plum','reservoir','telescope','waterworks','fossil','badlands']);
const farmTypes=new Set(['flower-nursery','rice-shop','pomelo','sesame','lotus','water-caltrop','lotus-temple','noodle-rack','painter-easel','mosaic']);
function familyFor(place){
  const id=place.motif||place.id;
  if(saltTypes.has(id))return 'salt';
  if(tidalTypes.has(id))return 'water';
  if(hillTypes.has(id))return 'hill';
  if(farmTypes.has(id))return 'farm';
  return 'town';
}
const palettes={
  salt:{cover:'#b1b68c',road:'#e2cb9e',border:'#ac9772',verge:'#e5d8b7',mark:'#a89472',far:0x93b6a5},
  water:{cover:'#93ac85',road:'#ceb78c',border:'#898b72',verge:'#e6d6aa',mark:'#9b896e',far:0x90bba8},
  hill:{cover:'#a9b47d',road:'#d8bf97',border:'#a69b77',verge:'#dfcca0',mark:'#aa9575',far:0xa4c29c},
  farm:{cover:'#abbb85',road:'#e3c99d',border:'#ab9874',verge:'#e5d2a7',mark:'#aa9675',far:0xb0bea0},
  town:{cover:'#a9b793',road:'#a4aaa0',border:'#858b81',verge:'#e3ceb0',mark:'#ebe3bc',far:0xb8b7a4}
};
function randomAt(n){return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
export function pedestrianCircuit(index,visitor){
  const skew=((index%3)-1)*.22;
  if(index===0){
    // Both paths cross the camera's central aisle. One turns back beside the
    // red canopy, the other passes the right-hand counter and returns by the fork.
    if(visitor)return [[.48,5.38],[2.46,5.19],[4.53,4.32],[5.32,3.61],[4.08,2.92],[2.98,3.08],[2.02,3.75],[.25,4.57],[-.31,5.07]];
    return [[-3.75,3.18],[-2.53,3.36],[-.62,3.42],[.73,3.33],[1.06,3.75],[.03,4.15],[-2.03,4.52],[-3.66,4.20],[-4.48,3.65],[-4.36,3.32]];
  }
  if(visitor)return [[1.3,3.8],[3.75,3.05+skew],[6.0,3.2],[7.5,3.84],[6.75,4.63],[4.48,5.48],[2.52,5.72],[1.18,5.21]];
  return [[-3.45,3.13],[-5.72,3.31],[-7.07,1.5],[-7.78,-.25],[-8.10,.29],[-7.49,2.28],[-5.9,4.23],[-3.57,5.36+skew],[-1.1,5.76],[-.08,4.86],[-.80,3.55+skew]];
}
function drawGround(root,type,index,place){
  const market=place.id==='shuixian-morning';
  const p=market?{...palettes.town,road:'#a9aaa0',border:'#978c76',verge:'#e7ceaa',mark:'#e4d5b5'}:palettes[type];
  const rand=randomAt(index*509+63),cv=document.createElement('canvas');
  cv.width=cv.height=1536;
  const c=cv.getContext('2d'),size=92,px=cv.width/size;
  c.scale(px,px);c.translate(size/2,size/2);
  c.fillStyle=p.cover;c.fillRect(-46,-46,92,92);
  if(market)marketPaving(c,rand);
  for(let i=0;i<7300;i++){
    const x=rand()*92-46,z=rand()*92-46;
    c.fillStyle=i%3?'#70855824':'#eacb8e40';c.fillRect(x,z,.08+rand()*.61,.05+rand()*.13);
  }
  function stroke(points,width,color){
    c.beginPath();points.forEach(([x,z],i)=>i?c.lineTo(x,z):c.moveTo(x,z));
    c.lineJoin='round';c.lineCap='round';c.lineWidth=width;c.strokeStyle=color;c.stroke();
  }
  function bed(x,z,w,d,col){
    c.fillStyle='#9c9975';c.fillRect(x-.20,z-.20,w+.40,d+.40);
    c.fillStyle=col;c.fillRect(x,z,w,d);
    c.fillStyle='rgba(243,225,176,.24)';
    for(let r=0;r<17;r++)c.fillRect(x+.15+rand()*(w-.9),z+.13+rand()*(d-.4),.20+rand()*.47,.045);
  }
  if(type==='salt'||type==='water'){
    c.fillStyle='#6aa7a5';c.fillRect(-46,-46,92,28);
    for(let i=0;i<500;i++){c.fillStyle=i%3?'#90c4b8':'#73aeae';c.fillRect(rand()*92-46,-46+rand()*27,.4+rand()*1.8,.07);}
    const brine=type==='salt'?['#86b8af','#b6c9ad','#9fc5bd','#d2c5ad','#a5bcaa']:['#83b4a2','#8bb6a5','#71a69e','#92b6a1'];
    if(place.motif==='fan-salt'){
      for(let col=0;col<10;col++)for(let row=0;row<3;row++){
        const a=-1.22+col*.244+.013,b=a+.222,r=4+row*4.25,r2=r+3.98;
        c.beginPath();c.arc(-.15,.65,r,-Math.PI/2+a,-Math.PI/2+b);
        c.arc(-.15,.65,r2,-Math.PI/2+b,-Math.PI/2+a,true);c.closePath();
        c.fillStyle=brine[(col*3+row)%brine.length];c.fill();c.strokeStyle='#cfc49e';c.lineWidth=.15;c.stroke();
      }
    }else for(let row=0;row<3;row++)for(let col=0;col<5;col++)bed(col*4.30-10.75,-17.6+row*3.1,3.94,2.77,brine[(col*3+row)%brine.length]);
    for(const x of [-31,-23,15,23])for(let r=0;r<4;r++)bed(x,-18+r*4.15,7.22,3.65,brine[r%brine.length]);
    for(const x of [-15.7,9.1])bed(x,5.8,6.0,6.2,brine[0]);
  }else if(type==='farm'||type==='hill'){
    const crops=['#9db467','#b8c478','#7d9c66','#ccb773'];
    for(let r=0;r<5;r++)for(let col=0;col<7;col++){
      const x=-30+col*8.62,z=-30+r*4.78;
      bed(x,z,8.0,4.19,crops[(r+col*3+index)%4]);
      for(let s=0;s<6;s++)stroke([[x+.3,z+.4+s*.66],[x+7.7,z+.4+s*.66]],.11,'#e2d48f82');
    }
  }else{
    for(const z of [-15,-8.8]){stroke([[-42,z],[40,z-1.8]],3.15,p.verge);stroke([[-42,z],[40,z-1.8]],2.50,p.road);}
  }
  const roads=[[mainRoad,3.22],[bypass,type==='town'?2.80:1.85],[westFork,2.36],[eastFork,2.46]];
  for(const [route,w] of roads)stroke(route,w+.48,p.border);
  for(const [route,w] of roads)stroke(route,w+.27,p.verge);
  for(const [route,w] of roads)stroke(route,w,p.road);
  // The compact centre of the fork forms a single crossing. Weathered pavers and
  // pebbles remain visible at eye level where the two road surfaces meet.
  c.fillStyle=p.road;c.beginPath();c.moveTo(-4.65,3.65);c.lineTo(5.03,3.68);
  c.lineTo(3.45,5.53);c.lineTo(-1.13,5.73);c.lineTo(-3.85,4.86);c.closePath();c.fill();
  for(const [points,w] of roads){
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz);
      for(let j=0;j<d*13;j++){
        const t=rand(),l=(rand()-.5)*w*.88,x=a[0]+t*dx-l*dz/d,z=a[1]+t*dz+l*dx/d;
        c.fillStyle=j%3?'#6c60462d':'#fff0c55c';c.fillRect(x,z,.045+rand()*.14,.025+rand()*.055);
      }
    }
  }
  if(type==='town'){
    for(const road of [mainRoad,bypass]){c.setLineDash([.60,1.22]);stroke(road,.08,p.mark);c.setLineDash([]);}
    for(let i=0;i<6;i++){c.fillStyle='#e7dfc5';c.fillRect(4.98,2.07+i*.41,1.10,.17);}
  }
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshLambertMaterial({map:tex}));
  ground.rotation.x=-Math.PI/2;ground.position.y=.105;ground.receiveShadow=true;root.add(ground);
}
function house(k,p,x,z,w,h,wall,roof,yaw=0,awning=false){
  const g=k.group(p,x,0,z);g.rotation.y=yaw;
  const depth=w*.64,front=depth*.50,trim=0xf1d5a3,ink=0x455f58;
  k.box(g,wall,0,h*.5,0,w,h,depth);
  if(awning){
    k.box(g,trim,0,h+.055,0,w+.20,.12,depth+.20);
    k.box(g,wall,0,h+.24,front-.06,w,.37,.22);
    for(const s of [-1,1])k.box(g,trim,s*(w*.49-.06),h*.73,front+.02,.12,h*.50,.08);
    const y=h*.47;
    k.box(g,ink,0,y*.49,front+.015,w*.86,y*.94,.04);
    for(let j=0;j<9;j++){
      const canopy=k.box(g,j%2?0xf5d49c:roof,(j-4)*w/9,y+.21,front+.32,w/9,.10,.88);canopy.rotation.x=.20;
      k.box(g,j%2?0xf5d49c:roof,(j-4)*w/9,y+.095,front+.74,w/9,.15,.06);
    }
    for(const s of [-1,1]){k.post(g,ink,s*w*.44,y*.51,front+.66,.045,y);k.box(g,trim,s*w*.42,y*.56,front+.07,.08,y*1.04,.10);}
  }else{
    const rise=w*.20,slope=Math.atan2(rise,depth*.5);
    for(const s of [-1,1])k.box(g,roof,0,h+rise*.45,s*depth*.25,w+.34,.15,Math.hypot(rise,depth*.5)+.24).rotation.x=s*slope;
    k.box(g,roof,0,h+rise+.013,0,w+.36,.15,.16);
    k.box(g,ink,0,h*.32,front+.025,w*.22,h*.64,.07);
  }
  for(const s of [-1,1]){
    const wy=awning?h*.74:h*.54,ww=w*.22,wh=h*(awning?.26:.36);
    k.box(g,trim,s*w*.28,wy,front+.046,ww+.12,wh+.12,.07);
    k.box(g,0x749a8f,s*w*.28,wy,front+.096,ww,wh,.05);
    k.box(g,trim,s*w*.28,wy,front+.133,.045,wh,.045);
    k.box(g,trim,s*w*.28,wy-wh*.52,front+.14,ww+.19,.07,.13);
  }
}
function tree(k,p,x,z,s,fruit=false,y=0){
  const g=k.group(p,x,y,z);g.rotation.y=(x+z)*.33;
  k.rod(g,0x876947,[0,0,0],[-.10,1.55*s,0],.14*s);
  for(const [dx,dy,dz,r,col] of [[-.5,1.88,.17,.81,0x69895c],[.51,2.10,-.08,.96,0x82a368],[.04,2.62,-.03,.96,0x93ac6a],[-.12,2.15,.49,.61,0x79985d]]){
    k.rock(g,col,dx*s,dy*s,dz*s,r*s,r*.83*s,r*.86*s);
    if(fruit&&dy<2.5)k.rock(g,0xdba34c,(dx+.19)*s,(dy-.17)*s,(dz+.69)*s,.13*s,.14*s,.12*s);
  }
}
function boat(k,p,x,z,s,yaw){
  const g=k.group(p,x,.11,z);g.scale.setScalar(s);g.rotation.y=yaw;
  k.oval(g,0x325f65,0,.29,0,1.64,.33,.53);k.oval(g,0xb56c50,0,.40,0,1.61,.24,.54);
  k.oval(g,0xe2c590,0,.55,0,1.45,.13,.46);
  k.box(g,0xe7d7aa,.14,.80,-.02,.83,.52,.69);k.box(g,0x739b93,.14,.85,.34,.63,.25,.035);
  k.box(g,0x457778,.14,1.10,0,1.20,.105,.92);
  k.post(g,0x9b805c,-.48,1.53,0,.047,2.00);
  k.rod(g,0xb19870,[-1.35,.52,0],[-.48,2.4,0],.019);
  const pennant=k.peak(g,0xd6855b,-.26,2.29,0,.14,.44,.03);pennant.rotation.z=-Math.PI/2;
}
function saltPile(k,p,x,z,s){
  const g=k.group(p,x,.10,z);g.rotation.y=(x+z)*.38;
  k.peak(g,0xf4e9d2,0,.52*s,0,1.01*s,1.11*s,.86*s);
  k.peak(g,0xfff3da,.37*s,.28*s,.13*s,.63*s,.62*s,.51*s);
  for(let i=0;i<4;i++)k.rock(g,i%2?0xf0e2c7:0xd8d2b8,(i-2)*s*.35,.12*s,s*(.55+Math.sin(i)*.14),s*.18,s*.12,s*.17);
}
function rushes(k,p,x,z,s=1){
  for(let i=0;i<7;i++){
    const theta=i*2.4,h=s*(.43+.12*(i%4)),dx=Math.cos(theta),dz=Math.sin(theta);
    k.rod(p,i%2?0x72865a:0xa5a66a,[x+dx*.17,.12,z+dz*.13],[x+dx*.38,.12+h,z+dz*.29],.035*s);
    if(i%2===0)k.rock(p,0xbbad73,x+dx*.38,.13+h,z+dz*.29,.05*s,.12*s,.051*s);
  }
}
function rail(k,p,x,z,x2,z2,n=4){
  for(let i=0;i<=n;i++){const t=i/n;k.post(p,0x997955,x+t*(x2-x),.49,z+t*(z2-z),.085,.93);}
  for(const h of [.43,.83])k.rod(p,0xc1a07a,[x,h,z],[x2,h,z2],.065);
}
function saltShed(k,p,x,z,s=1){
  const g=k.group(p,x,.10,z);g.scale.setScalar(s);
  for(const dx of [-1.18,1.18])for(const dz of [-.69,.69])k.box(g,0x8b6e4d,dx,.91,dz,.14,1.82,.14);
  k.box(g,0xbbaa83,0,.89,-.69,2.5,1.78,.12);
  for(let j=0;j<10;j++)k.box(g,0x968365,-1.13+j*.25,.91,-.60,.04,1.63,.05);
  for(const side of [-1,1])k.box(g,0x688a83,0,1.99,side*.46,2.99,.15,1.13).rotation.x=side*.33;
  saltPile(k,g,-.33,.08,.73);
  k.rod(g,0x8b6b49,[.59,.12,.63],[1.16,1.60,.45],.045);
  k.box(g,0xc5a177,.58,.19,.64,.69,.13,.15);
}
function coastalWork(k,p,salt,place){
  if(salt){
    for(const [x,z,s] of [[-3.4,-5.5,1.04],[2.6,-7.6,.85],[-6.8,-9.9,1.27],[.2,-12.2,1.33],[5.1,-11.6,.93],[-11.5,-15.7,.84]])saltPile(k,p,x,z,s);
    saltShed(k,p,5.9,-6.6,1.04);saltShed(k,p,-8.2,-12.9,.89);
    if(place.motif==='fan-salt'){
      // Traditional salt-field wind pump: six timber sails around a hub on a trestle.
      const pump=k.group(p,-4.05,.11,-4.8);
      for(const x of [-.58,.58])for(const z of [-.37,.37])k.rod(pump,0x836d50,[x,0,z],[x*.15,2.93,z*.19],.095);
      for(const h of [.51,1.39])k.box(pump,0xae9166,0,h,0,1.1-h*.29,.13,.70-h*.19);
      k.post(pump,0x98744f,0,2.81,0,.12,.78);
      const hub=k.group(pump,0,3.11,.12);
      for(let i=0;i<6;i++){
        const blade=k.group(hub);blade.rotation.z=i*Math.PI/3+.27;
        k.rod(blade,0x866d50,[0,0,0],[0,1.13,0],.04);
        k.box(blade,i%2?0xc58f5d:0xdeab70,.112,.76,0,.249,.68,.068).rotation.z=-.10;
      }
      k.oval(hub,0xe4bd83,0,0,.08,.16,.16,.13);
    }
  }else{
    for(const [x,z] of [[-4.1,-5.3],[4.8,-4.4],[5,-9],[-1.2,-11.6],[-9.1,-12.5],[-14,-7.3]])rushes(k,p,x,z,1.6);
    rail(k,p,-4.1,-4.4,-1.60,-5.45);boat(k,p,4.9,-6.1,1.13,-.27);
  }
  for(const [x,z,s,yaw] of [[-5.2,-22,1.12,.17],[5,-26,1.19,-.39],[-16,-28,.83,.1]])boat(k,p,x,z,s,yaw);
  for(const [x,z] of [[-4.30,1.10],[5.2,1.64],[-5.1,7.2],[6.15,6.68],[-.88,8.3],[8.16,-1.8],[-6.1,-3.75],[-3.8,-11.1]])rushes(k,p,x,z,1.06);
  k.box(p,0x71a9a7,0,-.06,-83,260,.24,80);
  for(let j=0;j<13;j++){
    const x=-35+j*3.1,z=-41.5+Math.sin(j*.39)*1.8;
    k.rock(p,j%2?0x7d9c83:0x8ca68c,x,.25,z,2.65,.43+.45*(j%4),1.68);
  }
  for(const [x,z,s] of [[4,-34,1],[7.5,-34.6,.8],[10.5,-35,.9]]){
    k.rock(p,0xa2ac89,x,.17,z,2.9,.68,1.79);
    house(k,p,x,z,2.16*s,1.32*s,0xd8bb96,0x8b7564,.01);
  }
  for(let i=0;i<6;i++){
    const x=7.5+i*1.7;
    k.post(p,0x827961,x,.65,-29.7,.13,1.15);k.post(p,0x827961,x,.65,-28.35,.13,1.15);
  }
  k.box(p,0xab9e80,11.8,1.20,-29,9.41,.17,1.77);
  // Foreground timber passing place and fishing quay, visible between the forked roads.
  for(let i=0;i<8;i++)k.box(p,i%3?0xccaa79:0xd8b98b,-.65+i*.43,.16,8.53,.41,.13,1.18);
  rail(k,p,-.78,9.02,2.48,9.02,3);
  for(const x of [-1.4,-.8]){k.post(p,0xa98052,x,.32,8.20,.29,.42);k.post(p,0xd7bb87,x,.535,8.20,.31,.061);}
  const pool=k.group(p,1.06,.108,12.26);
  k.rock(pool,0xa2ad88,0,.013,0,3.45,.059,1.58,true);
  k.rock(pool,0x89b3a6,0,.059,.08,2.94,.039,1.19,true);
  for(const [dx,dz] of [[-1.45,-.23],[-.87,.37],[.37,-.13],[1.07,.20]])k.box(pool,0xc1cfb7,dx,.103,dz,.47,.01,.042);
  rushes(k,p,-1.83,11.86,.88);rushes(k,p,3.62,12.62,.75);
  tree(k,p,-10.50,-.4,1.34);tree(k,p,11.9,-3.7,1.03);
}
function countryside(k,p,hill,index,place){
  if(hill){
    for(let i=0;i<10;i++){const x=-32+i*7.22,z=-22-(i%3)*3;k.rock(p,i%2?0x7fa179:0x91ad7d,x,-.24,z,6.5,3+(i*7%5)*.77,4.8,true);}
    for(let r=0;r<3;r++)for(let col=0;col<7;col++){
      const x=-11.8+col*3.7+(r%2)*.92,z=-6.4-r*3.3;
      tree(k,p,x,z,.56+(r+col)%3*.12,place.id==='yujing-morning'||place.motif==='plum');
    }
    house(k,p,4.5,-6.9,3.75,1.76,0xd3b78c,0x7c8d73,.05);
    rail(k,p,-4.85,1.17,-2.36,1.13);
  }else{
    const water=place.motif?.includes('lotus')||place.motif==='water-caltrop';
    if(water){
      k.box(p,0x74a799,.44,.123,-6.8,12.2,.025,4.47);
      for(let i=0;i<34;i++) {
        const x=-5.2+(i%11)*1.01,z=-5.2-Math.floor(i/11)*1.17+Math.sin(i)*.12;
        k.rock(p,0x819b60,x,.19,z,.31,.047,.24);
        if(i%5===0){k.post(p,0x658455,x,.41,z,.026,.47);k.rock(p,0xe7a99f,x,.66,z,.13,.16,.13);}
      }
    }else{
      for(let r=0;r<4;r++)for(let col=0;col<8;col++){
        const x=-5.91+col*1.65,z=-4.9-r*1.11;
        k.rock(p,(r+col)%3?0x819b5e:0x95ac68,x,.30,z,.60,.28,.32);
        if(place.motif==='flower-nursery')k.rock(p,col%2?0xd48d9e:0xf5c96d,x,.57,z,.26,.17,.20);
      }
    }
    house(k,p,-8.2,-8.60,3.7,2.06,0xd99f78,0x9a735c,.10);
    house(k,p,6.20,-9,4.0,1.80,0xe1c5a0,0x6f8c80,-.17);
    for(let i=0;i<16;i++)tree(k,p,-27+i*3.93,-18.3+(i%3)*1.2,.74+(i%4)*.17,i%3===0);
  }
  for(const [x,z,s] of [[-5.4,.1,.84],[5.2,-2.7,.95],[-9.2,5.6,1.1],[10.5,3.00,1.19],[-.93,9.8,.47]]){
    tree(k,p,x,z,s,place.motif==='pomelo'||place.id==='yujing-morning');
  }
  rail(k,p,.20,8.48,3.08,8.03,3);
}
function town(k,p,index){
  const walls=[0xd7ab89,0xcdbaa0,0xbd9176,0xdac491,0xabbca2], roofs=[0x648781,0xad755c,0xb58d57];
  for(let row=0;row<2;row++)for(let i=0;i<8;i++){
    const x=-16+i*4.45+(row%2)*.80,z=-7.64-row*6.00+(i%2)*.54;
    house(k,p,x,z,3.32+(i%2)*.48,2.00+(i*3+index+row)%4*.54,walls[(i+index+row*2)%walls.length],roofs[(i+row)%3],(i%3-1)*.05,(i+row)%4!==1);
  }
  for(const side of [-1,1]){
    house(k,p,side*10.7,-1.85,3.68,2.61,walls[(index+2)%5],roofs[(index+1)%3],side*-.38,true);
    for(const [dx,z,s] of [[1.16,5.18,.79],[4,5.85,1.1],[5.9,.81,1.04]])tree(k,p,side*(8+dx),z,s);
  }
  for(const x of [-8.56,6.1]){
    k.post(p,0x51756e,x,1.56,1.27,.083,3.01);
    k.rod(p,0x51756e,[x,3.01,1.27],[x+.47,3.15,1.27],.055);
    k.box(p,0xdfc89e,x+.55,3.10,1.27,.32,.15,.28);
  }
  const g=k.group(p,1.8,.10,8.55);g.rotation.y=.17;
  for(const x of [-.56,.56])k.box(g,0x566d64,x,.29,0,.10,.53,.52);
  for(const z of [-.16,.035,.23])k.box(g,0xbd946d,0,.55,z,1.70,.10,.14);
  k.box(g,0xbd946d,0,.88,-.2,1.70,.24,.09);
  for(const x of [-.56,.56])k.box(g,0x566d64,x,.67,-.21,.06,.54,.10);
}
function nameBoard(k,p,place){
  const g=k.group(p,-3.75,.11,.90);g.rotation.y=.10;
  k.post(g,0x947351,0,.76,-.19,.12,1.53);
  k.box(g,0x395f5b,0,1.39,.0,2.12,.75,.17);k.box(g,0xe1c294,0,1.80,0,2.26,.115,.28);
  const title=place.title.replace(/^臺南市立|^臺南市|^臺南(?=山上|左鎮)/,'');
  const middle=Math.ceil(title.length/2),words=title.length>7?[title.slice(0,middle),title.slice(middle)]:[title];
  words.forEach((s,i)=>k.letters(g,s,0,1.39+(words.length===1?0:.15-i*.29),.093,1.87,words.length===1?.47:.33));
}
function exits(k,root,place){
  const destinations=neighborsFor(place.id);
  const positions=[[-4.68,2.22,-1],[4.75,1.98,1],[3.92,5.38,1]];
  destinations.forEach((stop,i)=>{
    const [x,z,side]=positions[i],g=new THREE.Group();
    const cream=0xffe5aa,green=0x2f6665,lift=i===0?.68:0;
    k.post(g,0x745d46,0,.83+lift/2,-.11,.079,1.65+lift);k.box(g,0xb49569,0,.14,0,.28,.26,.25);
    k.box(g,green,0,1.52+lift,0,1.31,.49,.13);
    // Triangular arrow head, on the outside end of the enamel plate.
    const shape=new THREE.Shape();shape.moveTo(0,-.248);shape.lineTo(side*.29,0);shape.lineTo(0,.248);shape.closePath();
    k.part(g,new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:false}),green,side*.64,1.52+lift,-.065);
    k.letters(g,stop.name,0,1.52+lift,.075,1.15,.40);
    k.box(g,cream,0,1.76+lift,.073,1.26,.025,.02);
    const post=k.bake(g);post.name='往'+stop.name;post.userData.exitId=stop.id;post.userData.signHeight=1.52+lift;
    post.position.set(x,.12,z);post.rotation.y=side*.06;root.add(post);
  });
}
export function makeStreetNeighborhood(k,place){
  const root=new THREE.Group(),objects=new THREE.Group(),type=familyFor(place);
  root.name=place.district+'街景';drawGround(root,type,place.index,place);
  if(place.id==='shuixian-morning')marketQuarter(k,objects);
  else if(type==='salt'||type==='water')coastalWork(k,objects,type==='salt',place);
  else if(type==='town')town(k,objects,place.index);
  else countryside(k,objects,type==='hill',place.index,place);
  if(place.motif)nameBoard(k,objects,place);
  root.add(k.bake(objects));exits(k,root,place);return root;
}

// The stalls and the road are separate visible surfaces inside two large
// baked meshes. Classify the actual closest triangle, never an invisible box.
export function marketVendorAt({x,y,z}){
  if(y<.28||y>2.47)return null;
  if(x>=-4.38&&x<=-1.68&&z>=-.14&&z<=1.66)return 'greens';
  if(x>=.22&&x<=1.49&&z>=1.06&&z<=1.82)return 'steam';
  if(x>=-6.56&&x<=-4.92&&z>=-.56&&z<=.38)return 'steam';
  if(x>=.12&&x<=2.15&&z>=8.45&&z<=9.85)return 'steam';
  return null;
}
const navigationRoads=[mainRoad,bypass,westFork,eastFork];
const roadNetwork=[];
const roadIndex=new Map();
const footways=[];
function node(point){
  const key=point.join(',');
  if(!roadIndex.has(key)){roadIndex.set(key,roadNetwork.length);roadNetwork.push(point);}
  return roadIndex.get(key);
}
for(const road of navigationRoads)for(let i=1;i<road.length;i++)footways.push([node(road[i-1]),node(road[i])]);
const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function nearest(point){
  let closest=null;
  for(const [i,j] of footways){
    const a=roadNetwork[i],b=roadNetwork[j],dx=b[0]-a[0],dz=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dz)/(dx*dx+dz*dz)));
    const xy=[a[0]+t*dx,a[1]+t*dz],d=length(point,xy);
    if(!closest||d<closest.d)closest={i,j,xy,d};
  }
  return closest;
}
// Endpoints inside the pavement can sit a little off the centreline. Restrict
// direct floor taps to the neighbourhood close enough to keep the avatar in view.
export function walkablePoint(x,z){
  if(x< -11||x>11||z< -3.3||z>10.5)return false;
  return nearest([x,z]).d<1.31;
}
export function planWalk(from,to){
  const start=nearest(from),finish=nearest(to),nodes=[...roadNetwork,start.xy,finish.xy],a=nodes.length-2,b=a+1;
  const links=nodes.map(()=>[]);
  function link(i,j){const w=length(nodes[i],nodes[j]);links[i].push([j,w]);links[j].push([i,w]);}
  for(const [i,j] of footways)link(i,j);
  link(a,start.i);link(a,start.j);link(b,finish.i);link(b,finish.j);
  if(start.i===finish.i&&start.j===finish.j)link(a,b);
  const costs=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),open=new Set(nodes.keys());
  costs[a]=0;
  while(open.size){
    let n=-1;
    for(const i of open)if(n===-1||costs[i]<costs[n])n=i;
    if(n===b||!Number.isFinite(costs[n]))break;
    open.delete(n);
    for(const [m,w] of links[n])if(costs[n]+w<costs[m]){costs[m]=costs[n]+w;prev[m]=n;}
  }
  const points=[to];
  for(let n=b;n!==-1;n=prev[n])points.unshift(nodes[n]);
  points.unshift(from);
  return points.filter((p,i)=>!i||length(p,points[i-1])>.025);
}
