/* 10.21: QR-Code-Erzeuger (Byte-Modus, Fehlerkorrektur M/L, Version 1–40, automatische Maske) – eigener Code, ohne Fremdbibliothek.
   Nach dem bekannten Verfahren aus ISO/IEC 18004 (Aufbau angelehnt an Nayukis Referenzimplementierung, MIT).
   classroomQr(text,{ecc:'M'}) → {size, get(x,y)}; classroomQrSvg(text,opts) → SVG-Text */
(function(root){
 const ECC={L:[0,1],M:[1,0],Q:[2,3],H:[3,2]};/* [Ordnungsindex, Formatbits] */
 const ECC_PER_BLOCK=[
  [-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
  [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
  [-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
  [-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]];
 const BLOCKS=[
  [-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
  [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
  [-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],
  [-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]];
 function rawModules(v){let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r}
 const dataCodewords=(v,e)=>Math.floor(rawModules(v)/8)-ECC_PER_BLOCK[e][v]*BLOCKS[e][v];
 function rsMul(x,y){let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z&255}
 function rsDivisor(deg){const r=new Array(deg).fill(0);r[deg-1]=1;let root=1;for(let i=0;i<deg;i++){for(let j=0;j<r.length;j++){r[j]=rsMul(r[j],root);if(j+1<r.length)r[j]^=r[j+1]}root=rsMul(root,2)}return r}
 function rsRemainder(data,div){const r=div.map(()=>0);for(const b of data){const f=b^r.shift();r.push(0);div.forEach((c,i)=>r[i]^=rsMul(c,f))}return r}
 function utf8(s){return Array.from(new TextEncoder().encode(s))}
 function encode(text,opts={}){
  const bytes=utf8(text);let e=ECC[opts.ecc||'M'][0];
  let ver=0;for(let v=opts.minVersion||1;v<=40;v++){const cap=dataCodewords(v,e)*8,need=4+(v<10?8:16)+bytes.length*8;if(need<=cap){ver=v;break}}
  if(!ver)throw new Error('Text zu lang für einen QR-Code');
  /* höhere Fehlerkorrektur, wenn sie ohne größere Version passt */
  for(const k of ['Q','H']){const ek=ECC[k][0];if(opts.boost!==false&&ek>e&&4+(ver<10?8:16)+bytes.length*8<=dataCodewords(ver,ek)*8&&opts.ecc!=='L')e=ek}
  const bits=[];const put=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>>i)&1)};
  put(4,4);put(bytes.length,ver<10?8:16);bytes.forEach(b=>put(b,8));
  const cap=dataCodewords(ver,e)*8;put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);
  for(let pad=0xEC;bits.length<cap;pad^=0xEC^0x11)put(pad,8);
  const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b)}
  /* Blöcke + Fehlerkorrektur, verschränkt */
  const nb=BLOCKS[e][ver],ecl=ECC_PER_BLOCK[e][ver],raw=Math.floor(rawModules(ver)/8),nShort=nb-raw%nb,shortLen=Math.floor(raw/nb);
  const div=rsDivisor(ecl),blocks=[];for(let i=0,k=0;i<nb;i++){const dat=data.slice(k,k+shortLen-ecl+(i<nShort?0:1));k+=dat.length;const ec=rsRemainder(dat,div);if(i<nShort)dat.push(0);blocks.push(dat.concat(ec))}
  const all=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==shortLen-ecl||j>=nShort)all.push(b[i])});
  /* Matrix */
  const size=ver*4+17,mod=[...Array(size)].map(()=>Array(size).fill(false)),fn=[...Array(size)].map(()=>Array(size).fill(false));
  const set=(x,y,d)=>{mod[y][x]=d;fn[y][x]=true};
  for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy)),x=cx+dx,y=cy+dy;if(x>=0&&x<size&&y>=0&&y<size)set(x,y,d!==2&&d!==4)}};
  finder(3,3);finder(size-4,3);finder(3,size-4);
  const align=[];if(ver>1){const n=Math.floor(ver/7)+2,step=ver===32?26:Math.floor((ver*4+n*2+1)/(n*2-2))*2;align.push(6);for(let p=size-7;align.length<n;p-=step)align.splice(1,0,p)}
  align.forEach((a,i)=>align.forEach((b,j)=>{if((i===0&&j===0)||(i===0&&j===align.length-1)||(i===align.length-1&&j===0))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}));
  const drawFormat=mask=>{const d=(ECC_FMT[e]<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;const bit=i=>((b>>>i)&1)===1;
   for(let i=0;i<=5;i++)set(8,i,bit(i));set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));for(let i=9;i<15;i++)set(14-i,8,bit(i));
   for(let i=0;i<8;i++)set(size-1-i,8,bit(i));for(let i=8;i<15;i++)set(8,size-15+i,bit(i));set(8,size-8,true)};
  drawFormat(0);
  if(ver>=7){let r=ver;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(ver<<12)|r;for(let i=0;i<18;i++){const bt=((b>>>i)&1)===1,a=size-11+i%3,c=Math.floor(i/3);set(a,c,bt);set(c,a,bt)}}
  /* Daten im Zickzack */
  let i=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;if(!fn[y][x]&&i<all.length*8){mod[y][x]=((all[i>>>3]>>>(7-(i&7)))&1)===1;i++}}}
  const maskFn=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const applyMask=m=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!fn[y][x]&&maskFn[m](x,y))mod[y][x]=!mod[y][x]};
  const penalty=()=>{let p=0;const runs=line=>{let s=0;let c=line[0],n=1;for(let k=1;k<=line.length;k++){if(k<line.length&&line[k]===c)n++;else{if(n>=5)s+=n-2;c=line[k];n=1}}return s};
   const pat=line=>{let s=0;const L=line.map(b=>b?1:0).join('');for(const q of ['10111010000','00001011101'])for(let k=L.indexOf(q);k>=0;k=L.indexOf(q,k+1))s+=40;return s};
   for(let y=0;y<size;y++){p+=runs(mod[y])+pat(mod[y])}for(let x=0;x<size;x++){const col=mod.map(r=>r[x]);p+=runs(col)+pat(col)}
   for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){const c=mod[y][x];if(c===mod[y][x+1]&&c===mod[y+1][x]&&c===mod[y+1][x+1])p+=3}
   let dark=0;mod.forEach(r=>r.forEach(b=>dark+=b));const k=Math.ceil(Math.abs(dark*20-size*size*10)/(size*size))-1;p+=Math.max(0,k)*10;return p};
  let best=0,bestP=Infinity;for(let m=0;m<8;m++){applyMask(m);drawFormat(m);const pp=penalty();if(pp<bestP){bestP=pp;best=m}applyMask(m)}
  applyMask(best);drawFormat(best);
  return {size,version:ver,get:(x,y)=>x>=0&&y>=0&&x<size&&y<size&&mod[y][x]}}
 const ECC_FMT=[1,0,3,2];/* Formatbits nach Ordnungsindex L,M,Q,H */
 function svg(text,opts={}){const q=encode(text,opts),b=opts.border??2,n=q.size+2*b;let d='';for(let y=0;y<q.size;y++)for(let x=0;x<q.size;x++)if(q.get(x,y))d+='M'+(x+b)+','+(y+b)+'h1v1h-1z';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+n+' '+n+'" shape-rendering="crispEdges"'+(opts.size?' width="'+opts.size+'" height="'+opts.size+'"':'')+'><rect width="100%" height="100%" fill="'+(opts.light||'#fff')+'"/><path d="'+d+'" fill="'+(opts.dark||'#000')+'"/></svg>'}
 root.classroomQr=encode;root.classroomQrSvg=svg;
})(typeof window!=='undefined'?window:globalThis);
