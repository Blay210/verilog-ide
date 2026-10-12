// Original provisional RTL IDE artwork, shared SVG/ICO geometry.
const pins=[10,15,20];
const segments=[[10,18,13,18],[13,18,13,13],[13,13,18,13],[18,13,18,18],[18,18,22,18]];
export const iconSvg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect x="2" y="2" width="28" height="28" rx="7" fill="#14263d"/>
<g fill="none" stroke="#67e8f9" stroke-width="1.6" stroke-linecap="round">
${pins.map(p=>`<path d="M${p} 5v3 M${p} 24v3 M5 ${p}h3 M24 ${p}h3"/>`).join('\n')}
<rect x="8" y="8" width="16" height="16" rx="2"/><path d="M10 18h3v-5h5v5h4"/>
</g></svg>\n`;
const line=(x,y,a,b,c,d)=>{
  const t=Math.max(0,Math.min(1,((x-a)*(c-a)+(y-b)*(d-b))/((c-a)**2+(d-b)**2)));
  return Math.hypot(x-a-t*(c-a),y-b-t*(d-b))<=.8;
};
const rounded=(x,y,a,b,c,d,r)=>{
  const dx=Math.max(a+r-x,0,x-(c-r)),dy=Math.max(b+r-y,0,y-(d-r));
  return dx*dx+dy*dy<=r*r;
};
function color(x,y){
  if(!rounded(x,y,2,2,30,30,7)) return [0,0,0,0];
  const chip=rounded(x,y,7.2,7.2,24.8,24.8,2.8)&&!rounded(x,y,8.8,8.8,23.2,23.2,1.2);
  const trace=segments.some(s=>line(x,y,...s))||pins.some(p=>[[p,5,p,8],[p,24,p,27],[5,p,8,p],[24,p,27,p]].some(s=>line(x,y,...s)));
  return chip||trace?[103,232,249,255]:[20,38,61,255];
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
