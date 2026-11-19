import { CanvasTexture, Color, Float32BufferAttribute, SRGBColorSpace } from 'three';

// The four swatches are white-based so the modeller's own material colours
// survive. A single atlas serves the whole market, including the moving rigs.
const CELL=256;
const masonry=new Set([0xc58d74,0xeac89e,0xd3c6a4,0xe3b18b,0xdfb18f,0xe8c698,0xd4ab91,0xd6b18c,0xeaca9e,0xc9d5bb]);
const awnings=new Set([0xc95c49,0x568a82,0xffe4ae,0xe4bf81,0xeccf9a,0x9e493a,0x2e756a]);
const fabrics=new Set([0xb8493f,0x284f52,0x365568,0x528291,0xad8564,0x398a7e,0x34867b,0x315b6b,0x487e88]);

function makeAtlas(){
  const cv=document.createElement('canvas');cv.width=cv.height=CELL*2;
  const c=cv.getContext('2d');let seed=3371;
  const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  function stroke(color,width,points){
    c.beginPath();c.moveTo(...points[0]);
    for(const point of points.slice(1))c.lineTo(...point);
    c.strokeStyle=color;c.lineWidth=width;c.stroke();
  }
  // Bottom-left in UV space. A rubbed plaster or clay surface, with fine,
  // irregular stipple and broad cloudy colour like an unfired maquette.
  for(let tile=0;tile<4;tile++){
    c.save();c.translate(tile%2*CELL,(1-Math.floor(tile/2))*CELL);
    c.beginPath();c.rect(0,0,CELL,CELL);c.clip();
    c.fillStyle=['#fffaf1','#dccbb9','#f8ecdb','#f8f1df'][tile];c.fillRect(0,0,CELL,CELL);
    if(tile===1){
      // Handmade stretcher bond with warm mortar and a fine, lit upper edge.
      for(let row=0;row<8;row++)for(let col=-1;col<4;col++){
        const x=col*80+(row%2)*40,y=row*32;
        const light=220+Math.floor(random()*32);
        c.fillStyle='rgb('+light+','+(light-5)+','+(light-10)+')';
        c.fillRect(x+2,y+2,77,28);
        c.fillStyle='#fff5df9c';c.fillRect(x+3,y+2,75,1.6);
        c.fillStyle='#8773646b';c.fillRect(x+2,y+28,76,1.3);
      }
    }
    if(tile===2){
      for(let n=0;n<125;n++){
        const y=random()*CELL,offset=random()*6,phase=random()*6;
        const x0=random()*CELL-60,length=30+random()*200,pts=[];
        for(let j=0;j<=12;j++)pts.push([x0+j*length/12,y+Math.sin(phase+j*.37)*offset+Math.sin(j*.88+phase)*.6]);
        stroke(n%3?'#975d3a39':'#ffffff8c',.45+random()*.94,pts);
      }
      for(const [x,y] of [[68,61],[188,186]]){
        for(let i=0;i<3;i++){c.beginPath();c.ellipse(x,y,4+i*5,1.2+i*1.05,-.04,0,Math.PI*2);c.strokeStyle='#9c735344';c.lineWidth=.9;c.stroke();}
      }
    }
    if(tile===3){
      for(let j=0;j<CELL;j+=3){
        stroke('#8c795d32',.85,[[j,0],[j+.7,73],[j-.4,162],[j,CELL]]);
        stroke('#9279632a',.8,[[0,j],[99,j+.6],[195,j-.8],[CELL,j]]);
        c.fillStyle='#ffffffb0';c.fillRect(j+1.2,0,.8,CELL);
      }
    }
    for(let n=0;n<(tile?95:140);n++){
      const x=random()*CELL,y=random()*CELL,r=4+random()*15;
      const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,tile?'#715f5010':'#71604313');g.addColorStop(1,'#8b796200');
      c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
    }
    for(let n=0;n<5600;n++){
      c.fillStyle=n%4?'#69574422':'#ffffffa3';
      c.fillRect(random()*CELL,random()*CELL,.4+random()*1.6,.45+random()*.7);
    }
    c.restore();
  }
  const tex=new CanvasTexture(cv);tex.colorSpace=SRGBColorSpace;tex.anisotropy=4;
  return tex;
}

function swatch(color,kind){
  if(kind==='person')return fabrics.has(color)?3:0;
  if(masonry.has(color))return 1;
  if(awnings.has(color))return 3;
  const r=color>>16,g=(color>>8)&255,b=color&255;
  if(r>g*1.20&&g>b*1.16&&r<222&&g>82)return 2;
  return 0;
}

function surfaceCoordinates(geo,kind){
  if(geo.getAttribute('marketSwatch'))return;
  const {position,normal,color}=geo.attributes,tile=new Float32Array(position.count),uv=new Float32Array(position.count*2);
  const tint=new Color();let lastR=-1,lastG=-1,lastB=-1,hex=0;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),r=color.getX(i),g=color.getY(i),b=color.getZ(i);
    if(r!==lastR||g!==lastG||b!==lastB){
      hex=tint.setRGB(r,g,b).getHex();lastR=r;lastG=g;lastB=b;
    }
    const sample=swatch(hex,kind),ax=Math.abs(normal.getX(i)),ay=Math.abs(normal.getY(i)),az=Math.abs(normal.getZ(i));
    const scale=kind==='person'?1.36:sample===1?.64:sample===2?.83:.76;
    uv[2*i]=(ax>az&&ax>ay?z:x)*scale;uv[2*i+1]=(ay>ax&&ay>az?z:y)*scale;
    tile[i]=sample;
  }
  geo.setAttribute('uv',new Float32BufferAttribute(uv,2));
  geo.setAttribute('marketSwatch',new Float32BufferAttribute(tile,1));
}

export function dressMarketScene(objects){
  const originals=new Map(),atlas=makeAtlas();
  let material;
  for(const [object,kind] of objects){
    object.traverse(mesh=>{
      if(!mesh.geometry?.attributes.color)return;
      if(!material){
        material=mesh.material.clone();material.map=atlas;
        material.onBeforeCompile=shader=>{
          shader.vertexShader='attribute float marketSwatch; varying float vMarketSwatch;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvMarketSwatch = marketSwatch;');
          shader.fragmentShader='varying float vMarketSwatch;\n'+shader.fragmentShader.replace('#include <map_fragment>',`
            vec2 cell = vec2(mod(floor(vMarketSwatch + 0.5),2.0), floor((vMarketSwatch + 0.5)/2.0));
            vec2 atlasUV = (cell + 0.006 + fract(vMapUv)*0.988)*0.5;
            diffuseColor *= textureGrad(map, atlasUV, dFdx(vMapUv)*0.494, dFdy(vMapUv)*0.494);
          `);
        };
        material.customProgramCacheKey=()=>'market-craft-31';
      }
      surfaceCoordinates(mesh.geometry,kind);
      originals.set(mesh,mesh.material);mesh.material=material;
    });
  }
  return ()=>{
    for(const [mesh,original] of originals)mesh.material=original;
    material?.dispose();atlas.dispose();
  };
}
