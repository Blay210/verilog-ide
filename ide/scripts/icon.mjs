// Pulse: original vector implementation of the approved star + digital pulse concept.
// Shared SVG/ICO geometry, flat colors and no external image/runtime dependencies.
import { deflateSync } from 'node:zlib';
const star=[[16,3],[20,12],[29,16],[20,20],[16,29],[12,20],[3,16],[12,12]];
const pulse=[[3,16],[10,16],[10,12],[14,12],[14,20],[18,20],[18,12],[22,12],[22,16],[29,16]];
const segments=pulse.slice(1).map((point,i)=>[...pulse[i],...point]);
export const iconSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<title>Pulse</title><desc>A navigation star with a digital pulse cut through its center.</desc>
<defs><clipPath id="star"><polygon points="${star.map(p=>p.join(',')).join(' ')}"/></clipPath></defs>
<rect x="1" y="1" width="30" height="30" rx="7" fill="#15202b"/>
<polygon points="${star.map(p=>p.join(',')).join(' ')}" fill="#f4f7fa"/>
<path d="M16 0H32V16H16Z M0 16H16V32H0Z" fill="#58efc4" clip-path="url(#star)"/>
<path d="M${pulse.map(p=>p.join(' ')).join('L')}" fill="none" stroke="#15202b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>\n`;
const line=(x,y,a,b,c,d)=>{
  const t=Math.max(0,Math.min(1,((x-a)*(c-a)+(y-b)*(d-b))/((c-a)**2+(d-b)**2)));
  return Math.hypot(x-a-t*(c-a),y-b-t*(d-b))<=1.2;
};
const rounded=(x,y,a,b,c,d,r)=>{
  const dx=Math.max(a+r-x,0,x-(c-r)),dy=Math.max(b+r-y,0,y-(d-r));
  return dx*dx+dy*dy<=r*r;
};
function color(x,y){
  if(!rounded(x,y,1,1,31,31,7)) return [0,0,0,0];
  let inside=false;
  for(let i=0,j=star.length-1;i<star.length;j=i++){
    const [a,b]=star[i],[c,d]=star[j];
    if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;
  }
  if(!inside||segments.some(s=>line(x,y,...s)))return [21,32,43,255];
  return (x>=16&&y<16)||(x<16&&y>=16)?[88,239,196,255]:[244,247,250,255];
}
export function createIcon(sizes=[16,32,48,64,256]){
  const bodies=sizes.map(size=>{
    const stride=Math.ceil(size/32)*4,body=Buffer.alloc(40+size*size*4+size*stride);
    body.writeUInt32LE(40,0);body.writeInt32LE(size,4);body.writeInt32LE(size*2,8);
    body.writeUInt16LE(1,12);body.writeUInt16LE(32,14);body.writeUInt32LE(size*size*4,20);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const sum=[0,0,0,0];
      for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){
        const c=color((x+(sx+.5)/4)*32/size,(y+(sy+.5)/4)*32/size);
        for(let k=0;k<3;k++)sum[k]+=c[k]*c[3]/255;
        sum[3]+=c[3];
      }
      const a=Math.round(sum[3]/16),rgb=sum.slice(0,3).map(v=>sum[3]?Math.round(v*255/sum[3]):0);
      body.set([rgb[2],rgb[1],rgb[0],a],40+((size-1-y)*size+x)*4);
      if(!a)body[40+size*size*4+(size-1-y)*stride+(x>>3)]|=128>>(x%8);
    }
    return body;
  });
  const header=Buffer.alloc(6+16*sizes.length);
  header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
  let offset=header.length;
  bodies.forEach((body,i)=>{
    const p=6+16*i;header[p]=sizes[i]%256;header[p+1]=sizes[i]%256;
    header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);
    header.writeUInt32LE(body.length,p+8);header.writeUInt32LE(offset,p+12);offset+=body.length;
  });
  return Buffer.concat([header,...bodies]);
}

export function createPng(size=256) {
  const icon=createIcon([size]), offset=icon.readUInt32LE(18);
  const pixels=Buffer.alloc(size*(1+size*4));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const source=offset+40+((size-1-y)*size+x)*4,target=y*(1+size*4)+1+x*4;
    pixels.set([icon[source+2],icon[source+1],icon[source],icon[source+3]],target);
  }
  const chunk=(name,body)=>{
    const data=Buffer.concat([Buffer.from(name),body]);let crc=0xffffffff;
    for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    const header=Buffer.alloc(4),footer=Buffer.alloc(4);header.writeUInt32BE(body.length);footer.writeUInt32BE((crc^0xffffffff)>>>0);
    return Buffer.concat([header,data,footer]);
  };
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
