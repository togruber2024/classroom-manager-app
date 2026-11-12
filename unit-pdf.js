/* 11.34: „Für meine Unterlagen sichern“ als echte PDF-Datei – ohne Druckdialog.
   Am iPad öffnet sich das Teilen-Menü (GoodNotes, Dateien …), sonst wird die Datei geladen.
   print() bzw. ein neues Fenster klappen in Web-Apps (Home-Bildschirm) und eingebetteten Fenstern oft nicht – deshalb dieser Weg.
   Bausteine: {t:'h1'|'sub'|'h2'|'p'|'list'|'table'|'chart'|'box', …}; **fett** in Texten. Schrift: Helvetica (WinAnsi). */
(()=>{
 const PW=595.28,PH=841.89,M=48,CW=PW-2*M;
 const cv=document.createElement('canvas').getContext('2d');
 const wid=(s,sz,b)=>{cv.font=(b?'bold ':'')+sz+'px Helvetica, Arial, sans-serif';return cv.measureText(s).width};
 const MAP={'€':128,'‚':130,'„':132,'…':133,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'™':153};
 const clean=s=>String(s??'').replace(/­/g,'').replace(/[≈]/g,'~').replace(/[✓✔]/g,'+').replace(/[✗✘]/g,'x').replace(/[→]/g,'->').replace(/[\u{1F000}-\u{1FFFF}☀-➿️]/gu,'');
 const enc=s=>{let o='';for(const ch of clean(s)){const c=ch.codePointAt(0);const b=MAP[ch]??(c<256?c:63);const x=String.fromCharCode(b);o+=x==='('||x===')'||x==='\\'?'\\'+x:x}return o};
 const rgb=h=>{h=(h||'#000').replace('#','');return [0,2,4].map(i=>(parseInt(h.slice(i,i+2),16)/255).toFixed(3)).join(' ')};
 /* Text mit **fett** in Wörter zerlegen und umbrechen */
 function runs(s){const out=[];String(s??'').split(/(\*\*)/).reduce((b,part)=>{if(part==='**')return !b;part.split(/(\s+)/).forEach(w=>{if(w)out.push({w,b})});return b},false);return out}
 function wrap(s,sz,maxW,bold){const lines=[];let cur=[],cw=0;for(const r of runs(s)){const b=bold||r.b,isSp=/^\s+$/.test(r.w),w=wid(isSp?' ':r.w,sz,b);if(isSp){if(cur.length){cur.push({w:' ',b});cw+=w}continue}
   if(cw+w>maxW&&cur.length){while(cur.length&&cur[cur.length-1].w===' ')cur.pop();lines.push(cur);cur=[];cw=0}cur.push({w:r.w,b});cw+=w}
  while(cur.length&&cur[cur.length-1].w===' ')cur.pop();if(cur.length)lines.push(cur);return lines.length?lines:[[]]}
 function build(blocks,meta){const pages=[];let ops=[],y=PH-M;
  const newPage=()=>{if(ops.length)pages.push(ops.join('\n'));ops=[];y=PH-M};
  const need=h=>{if(y-h<M+10)newPage()};
  const line=(parts,x,yy,sz,col)=>{let s='BT '+rgb(col)+' rg';let cx=x,last=null;for(const p of parts){const f=p.b?'/F2':'/F1';if(f!==last){s+=' '+f+' '+sz+' Tf';last=f}s+=' 1 0 0 1 '+cx.toFixed(2)+' '+yy.toFixed(2)+' Tm ('+enc(p.w)+') Tj';cx+=wid(p.w,sz,p.b)}ops.push(s+' ET')};
  const para=(s,sz,col,bold,x=M,w=CW,lh=1.38)=>{for(const l of wrap(s,sz,w,bold)){need(sz*lh);y-=sz*lh;line(l,x,y+sz*.25,sz,col)}};
  const rect=(x,yy,w,h,stroke,fill,lw=.8)=>ops.push((fill?rgb(fill)+' rg ':'')+(stroke?rgb(stroke)+' RG '+lw+' w ':'')+x.toFixed(2)+' '+yy.toFixed(2)+' '+w.toFixed(2)+' '+h.toFixed(2)+' re '+(fill&&stroke?'B':fill?'f':'S'));
  for(const B of blocks){
   if(B.t==='h1'){para(B.s,19,'#1d2b40',true);y-=2}
   else if(B.t==='sub'){para(B.s,10,'#5c6b80');y-=6}
   else if(B.t==='h2'){need(72);y-=12;para(B.s,12.5,'#2f5f9b',true);ops.push(rgb('#c9d3e3')+' RG .8 w '+M+' '+(y-2).toFixed(2)+' m '+(PW-M)+' '+(y-2).toFixed(2)+' l S');y-=6}
   else if(B.t==='p'){para(B.s,10.5,'#111111');y-=4}
   else if(B.t==='list'){for(const it of B.items){const ls=wrap(it,10.5,CW-14);need(ls.length*14.5);ls.forEach((l,i)=>{y-=14.5;if(!i)line([{w:'•',b:false}],M+2,y+2.6,10.5,'#2f5f9b');line(l,M+14,y+2.6,10.5,'#111111')})}y-=4}
   else if(B.t==='box'){const ls=wrap(B.s,11,CW-24);const h=ls.length*15.5+16;need(h+6);y-=6;rect(M,y-h,CW,h,'#2f5f9b','#f1f6fd',1.4);let yy=y-8;for(const l of ls){yy-=15.5;line(l,M+12,yy+4,11,'#1d2b40')}y-=h+4}
   else if(B.t==='table'){const ws=B.w.map(f=>f*CW),sz=B.sz||9.5,lh=sz*1.32,pad=4;
    const hgt=(cells,head)=>{const wr=cells.map((c,i)=>wrap(c,sz,ws[i]-2*pad,head||(i===0&&B.firstBold)));return [wr,Math.max(...wr.map(x=>x.length))*lh+2*pad]};
    const row=(cells,head)=>{const [wr,h]=hgt(cells,head);if(y-h<M+10){newPage();if(!head&&B.head)row(B.head,true)}let x=M;
     wr.forEach((ls,i)=>{rect(x,y-h,ws[i],h,'#c9d3e3',head?'#eef3fa':null,.6);ls.forEach((l,k)=>line(l,x+pad,y-pad-(k+1)*lh+sz*.3,sz,'#111111'));x+=ws[i]});y-=h};
    if(B.head){need(hgt(B.head,true)[1]+(B.rows.length?hgt(B.rows[0],false)[1]:0));row(B.head,true)}B.rows.forEach(r=>row(r,false));y-=6}
   else if(B.t==='chart'){const H=200,W=CW*.82;need(H+20);const x0=M+36,y0=y-H+18,w=W-40,h=H-34,X=v=>x0+(v-B.xr[0])/(B.xr[1]-B.xr[0])*w,Y=v=>y0+(v-B.yr[0])/(B.yr[1]-B.yr[0])*h;
    for(const v of B.yt){ops.push(rgb('#dde3ec')+' RG .5 w '+x0+' '+Y(v).toFixed(2)+' m '+(x0+w)+' '+Y(v).toFixed(2)+' l S');const s=String(v).replace(/\B(?=(\d{3})+(?!\d))/g,'.');line([{w:s}],x0-6-wid(s,8),Y(v)-2.5,8,'#66758a')}
    for(const v of B.xt)line([{w:String(v)}],X(v)-wid(String(v),8)/2,y0-12,8,'#66758a');
    for(const S of B.series){ops.push(rgb(S.color)+' RG 1.8 w '+S.pts.map((p,i)=>X(p[0]).toFixed(2)+' '+Y(p[1]).toFixed(2)+(i?' l':' m')).join(' ')+' S')}
    for(const L of B.labels||[])line([{w:L.s,b:true}],X(L.x),Y(L.y),9,L.color);y-=H+6}
  }
  newPage();
  /* Fußzeile mit Seitenzahl */
  const n=pages.length;const P=pages.map((c,i)=>c+'\nBT '+rgb('#8a97aa')+' rg /F1 8 Tf 1 0 0 1 '+M+' 24 Tm ('+enc((meta.foot||'')+' · Seite '+(i+1)+' von '+n)+') Tj ET');
  /* PDF zusammensetzen (latin1-String = Bytes) */
  const objs=[];const add=s=>{objs.push(s);return objs.length};
  const cat=add(''),pagesId=add(''),f1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),f2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids=[];for(const c of P){const cs=add('<< /Length '+c.length+' >>\nstream\n'+c+'\nendstream');kids.push(add('<< /Type /Page /Parent '+pagesId+' 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /Font << /F1 '+f1+' 0 R /F2 '+f2+' 0 R >> >> /Contents '+cs+' 0 R >>'))}
  objs[cat-1]='<< /Type /Catalog /Pages '+pagesId+' 0 R >>';objs[pagesId-1]='<< /Type /Pages /Kids ['+kids.map(k=>k+' 0 R').join(' ')+'] /Count '+kids.length+' >>';
  const info=add('<< /Title ('+enc(meta.title||'')+') /Producer (Classroom-Manager) >>');
  let out='%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';const off=[];objs.forEach((o,i)=>{off.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});
  const xr=out.length;out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root '+cat+' 0 R /Info '+info+' 0 R >>\nstartxref\n'+xr+'\n%%EOF';
  const u=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;return new Blob([u],{type:'application/pdf'})}
 /* Teilen (iPad: GoodNotes, Dateien …) – sonst herunterladen */
 async function save(blob,name){const file=new File([blob],name,{type:'application/pdf'});
  try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:name.replace(/\.pdf$/,'')});return 'share'}}catch(e){if(e&&e.name==='AbortError')return 'abort'}
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);return 'download'}
 window.cmPdf={build,save,_wrap:wrap};
})();
