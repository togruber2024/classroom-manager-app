/* 11.34: „Für meine Unterlagen sichern“ als echte PDF-Datei – ohne Druckdialog.
   Am iPad öffnet sich das Teilen-Menü (GoodNotes, Dateien …), sonst wird die Datei geladen.
   print() bzw. ein neues Fenster klappen in Web-Apps (Home-Bildschirm) und eingebetteten Fenstern oft nicht – deshalb dieser Weg.
   Bausteine: {t:'h1'|'sub'|'h2'|'h3'|'p'|'list'|'table'|'chart'|'box'|'img', …}; **fett** in Texten. Schrift: Helvetica (WinAnsi).
   11.35: Tabellen, Listen, Kästen und Bilder werden nicht zerrissen (passen sie auf eine Seite, beginnen sie notfalls auf der nächsten);
          Überschriften bleiben bei ihrem Inhalt; Bilder (Material aus dem Schulbuch) als JPEG. */
(()=>{
 const PW=595.28,PH=841.89,M=48,CW=PW-2*M,TOP=PH-M,BOT=M+14,FULL=TOP-BOT;
 const cv=document.createElement('canvas').getContext('2d');
 const wid=(s,sz,b)=>{s=clean(s);cv.font=(b?'bold ':'')+sz+'px Helvetica, Arial, sans-serif';return cv.measureText(s).width};
 const MAP={'€':128,'‚':130,'„':132,'…':133,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'™':153};
 const clean=s=>String(s??'').replace(/­/g,'').replace(/[≈]/g,'~').replace(/[✓✔]/g,'+').replace(/[✗✘]/g,'x').replace(/[→]/g,'->').replace(/[←]/g,'<-').replace(/[\u{1F000}-\u{1FFFF}☀-➿️]/gu,'').replace(/[^\u0000-\u00ff\u20ac\u201a\u201e\u2026\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u2122]/gu,ch=>{const b=ch.normalize('NFD')[0];return b&&b.charCodeAt(0)<256?b:'?'});
 const enc=s=>{let o='';for(const ch of clean(s)){const c=ch.codePointAt(0);const b=MAP[ch]??(c<256?c:63);const x=String.fromCharCode(b);o+=x==='('||x===')'||x==='\\'?'\\'+x:x}return o};
 const rgb=h=>{h=(h||'#000').replace('#','');return [0,2,4].map(i=>(parseInt(h.slice(i,i+2),16)/255).toFixed(3)).join(' ')};
 function runs(s){const out=[];String(s??'').split(/(\*\*)/).reduce((b,part)=>{if(part==='**')return !b;part.split(/(\s+)/).forEach(w=>{if(w)out.push({w,b})});return b},false);return out}
 function wrap(s,sz,maxW,bold){const lines=[];for(const para of String(s??'').split('\n')){let cur=[],cw=0;let open=false;
   /* **fett** über Zeilenumbrüche hinweg: Zustand je Absatz */
   for(const r of runs(para)){const b=bold||r.b,isSp=/^\s+$/.test(r.w),w=wid(isSp?' ':r.w,sz,b);if(isSp){if(cur.length){cur.push({w:' ',b});cw+=w}continue}
    if(cw+w>maxW&&cur.length){while(cur.length&&cur[cur.length-1].w===' ')cur.pop();lines.push(cur);cur=[];cw=0}cur.push({w:r.w,b});cw+=w}
   while(cur.length&&cur[cur.length-1].w===' ')cur.pop();lines.push(cur);void open}
  return lines.length?lines:[[]]}
 /* Bild vorbereiten: beliebige Bildquelle → JPEG-Bytes + Maße (async, vorab aufrufen) */
 const IMG=new Map();
 function prep(src,maxPx=1600){if(!src)return Promise.resolve(null);if(IMG.has(src))return IMG.get(src);
  const p=new Promise(res=>{const im=new Image();im.onload=()=>{try{const s=Math.min(1,maxPx/Math.max(im.naturalWidth||1,im.naturalHeight||1)),w=Math.max(1,Math.round((im.naturalWidth||800)*s)),h=Math.max(1,Math.round((im.naturalHeight||600)*s));
     const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);const d=c.toDataURL('image/jpeg',.85);res({jpg:atob(d.split(',')[1]),w,h})}catch(e){res(null)}};im.onerror=()=>res(null);im.src=src});
  IMG.set(src,p);return p}
 const ready=src=>{const p=IMG.get(src);return p&&p.v};
 function build(blocks,meta){const pages=[];let ops=[],y=TOP;const xo=[];
  const newPage=()=>{if(ops.length)pages.push(ops.join('\n'));ops=[];y=TOP};
  const need=h=>{if(y-h<BOT)newPage()};
  /* Ganz lassen: passt der Block auf eine leere Seite, aber nicht mehr auf diese → neue Seite */
  const keep=h=>{if(h<=FULL&&y-h<BOT)newPage()};
  const line=(parts,x,yy,sz,col)=>{let s='BT '+rgb(col)+' rg';let cx=x,last=null;for(const p of parts){const f=p.b?'/F2':'/F1';if(f!==last){s+=' '+f+' '+sz+' Tf';last=f}s+=' 1 0 0 1 '+cx.toFixed(2)+' '+yy.toFixed(2)+' Tm ('+enc(p.w)+') Tj';cx+=wid(p.w,sz,p.b)}ops.push(s+' ET')};
  const rect=(x,yy,w,h,stroke,fill,lw=.8)=>ops.push((fill?rgb(fill)+' rg ':'')+(stroke?rgb(stroke)+' RG '+lw+' w ':'')+x.toFixed(2)+' '+yy.toFixed(2)+' '+w.toFixed(2)+' '+h.toFixed(2)+' re '+(fill&&stroke?'B':fill?'f':'S'));
  const P={p:10.5,lh:1.38};
  const tbl=B=>{const ws=B.w.map(f=>f*CW),sz=B.sz||9.5,lh=sz*1.32,pad=4;const hgt=(cells,head)=>{const wr=cells.map((c,i)=>wrap(c,sz,ws[i]-2*pad,head||(i===0&&B.firstBold)));return [wr,Math.max(...wr.map(x=>x.length))*lh+2*pad]};return {ws,sz,lh,pad,hgt}};
  const imgDim=B=>{const im=B.img;if(!im)return null;const maxW=(B.wf||1)*CW,maxH=B.maxH||FULL-60;let w=maxW,h=w*im.h/im.w;if(h>maxH){h=maxH;w=h*im.w/im.h}return {w,h}};
  const H=B=>{switch(B.t){
   case 'h2':return 12+12.5*1.38+8;case 'h3':return 6+11*1.38+2;
   case 'p':return wrap(B.s,B.sz||P.p,CW,B.b).length*(B.sz||P.p)*P.lh+4;
   case 'list':return B.items.reduce((a,it)=>a+wrap(it,10.5,CW-14).length*14.5,0)+4;
   case 'box':return wrap(B.s,11,CW-24).length*15.5+16+10;
   case 'table':{const T=tbl(B);return (B.head?T.hgt(B.head,true)[1]:0)+B.rows.reduce((a,r)=>a+T.hgt(r,false)[1],0)+6}
   case 'chart':return 206;
   case 'img':{const d=imgDim(B);return d?d.h+6+(B.cap?wrap(B.cap,8.5,CW).length*11.5+4:0):0}
   default:return 20}};
  const para=(s,sz,col,bold,x=M,w=CW)=>{for(const l of wrap(s,sz,w,bold)){need(sz*P.lh);y-=sz*P.lh;line(l,x,y+sz*.25,sz,col)}};
  blocks=blocks.filter(Boolean);
  blocks.forEach((B,bi)=>{
   if(B.t==='h1'){para(B.s,19,'#1d2b40',true);y-=2}
   else if(B.t==='sub'){para(B.s,10,'#5c6b80');y-=6}
   else if(B.t==='h2'||B.t==='h3'){const nx=blocks[bi+1];const nh=nx&&nx.t!=='h2'?Math.min(H(nx),FULL-H(B)):0;
    /* Überschrift nie allein unten: mit dem folgenden Block (ganz, wenn er auf eine Seite passt) */
    if(y-H(B)-(nh<=FULL-H(B)?nh:60)<BOT)newPage();
    if(B.t==='h2'){if(y<TOP)y-=12;para(B.s,12.5,'#2f5f9b',true);ops.push(rgb('#c9d3e3')+' RG .8 w '+M+' '+(y-2).toFixed(2)+' m '+(PW-M)+' '+(y-2).toFixed(2)+' l S');y-=8}
    else{y-=6;para(B.s,11,'#1d2b40',true);y-=2}}
   else if(B.t==='p'){if(B.keep)keep(H(B));para(B.s,B.sz||P.p,B.col||'#111111',B.b);y-=4}
   else if(B.t==='list'){keep(H(B));for(const it of B.items){const ls=wrap(it,10.5,CW-14);need(ls.length*14.5);ls.forEach((l,i)=>{y-=14.5;if(!i)line([{w:B.num?(B.items.indexOf(it)+1)+'.':'•',b:!!B.num}],M+1,y+2.6,10.5,'#2f5f9b');line(l,M+14,y+2.6,10.5,'#111111')})}y-=4}
   else if(B.t==='box'){const ls=wrap(B.s,11,CW-24);const h=ls.length*15.5+16;keep(h+10);need(h+6);y-=6;rect(M,y-h,CW,h,'#2f5f9b','#f1f6fd',1.4);let yy=y-8;for(const l of ls){yy-=15.5;line(l,M+12,yy+4,11,'#1d2b40')}y-=h+4}
   else if(B.t==='table'){const T=tbl(B),{ws,sz,lh,pad,hgt}=T;keep(H(B));
    const row=(cells,head)=>{const [wr,h]=hgt(cells,head);if(y-h<BOT){newPage();if(!head&&B.head)row(B.head,true)}let x=M;
     wr.forEach((ls,i)=>{rect(x,y-h,ws[i],h,'#c9d3e3',head?'#eef3fa':(B.shade&&B.shade[i])||null,.6);ls.forEach((l,k)=>line(l,x+pad,y-pad-(k+1)*lh+sz*.3,sz,(B.col&&B.col[i])||'#111111'));x+=ws[i]});y-=h};
    if(B.head){need(hgt(B.head,true)[1]+(B.rows.length?hgt(B.rows[0],false)[1]:0));row(B.head,true)}B.rows.forEach(r=>row(r,false));y-=6}
   else if(B.t==='img'){const d=imgDim(B);if(!d)return;const h=H(B);keep(h);need(h);const id='/Im'+(xo.length+1);xo.push(B.img);const x=M+(CW-d.w)/2;y-=d.h;ops.push('q '+d.w.toFixed(2)+' 0 0 '+d.h.toFixed(2)+' '+x.toFixed(2)+' '+y.toFixed(2)+' cm '+id+' Do Q');rect(x,y,d.w,d.h,'#c9d3e3',null,.5);y-=4;if(B.cap){for(const l of wrap(B.cap,8.5,CW)){y-=11.5;line(l,M,y+2,8.5,'#5c6b80')}}y-=6}
   else if(B.t==='chart'){const HH=200,W=CW*.82;keep(HH+6);const x0=M+36,y0=y-HH+18,w=W-40,h=HH-34,X=v=>x0+(v-B.xr[0])/(B.xr[1]-B.xr[0])*w,Y=v=>y0+(v-B.yr[0])/(B.yr[1]-B.yr[0])*h;
    for(const v of B.yt){ops.push(rgb('#dde3ec')+' RG .5 w '+x0+' '+Y(v).toFixed(2)+' m '+(x0+w)+' '+Y(v).toFixed(2)+' l S');const s=String(v).replace(/\B(?=(\d{3})+(?!\d))/g,'.');line([{w:s}],x0-6-wid(s,8),Y(v)-2.5,8,'#66758a')}
    for(const v of B.xt)line([{w:String(v)}],X(v)-wid(String(v),8)/2,y0-12,8,'#66758a');
    for(const S of B.series){ops.push(rgb(S.color)+' RG 1.8 w '+S.pts.map((p,i)=>X(p[0]).toFixed(2)+' '+Y(p[1]).toFixed(2)+(i?' l':' m')).join(' ')+' S')}
    for(const L of B.labels||[])line([{w:L.s,b:true}],X(L.x),Y(L.y),9,L.color);y-=HH+6}
  });
  newPage();
  const n=pages.length;const PG=pages.map((c,i)=>c+'\nBT '+rgb('#8a97aa')+' rg /F1 8 Tf 1 0 0 1 '+M+' 24 Tm ('+enc((meta.foot||'')+' · Seite '+(i+1)+' von '+n)+') Tj ET');
  const objs=[];const add=s=>{objs.push(s);return objs.length};
  const cat=add(''),pagesId=add(''),f1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),f2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const imIds=xo.map(im=>add('<< /Type /XObject /Subtype /Image /Width '+im.w+' /Height '+im.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+im.jpg.length+' >>\nstream\n'+im.jpg+'\nendstream'));
  const xres=imIds.length?' /XObject << '+imIds.map((id,i)=>'/Im'+(i+1)+' '+id+' 0 R').join(' ')+' >>':'';
  const kids=[];for(const c of PG){const cs=add('<< /Length '+c.length+' >>\nstream\n'+c+'\nendstream');kids.push(add('<< /Type /Page /Parent '+pagesId+' 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /Font << /F1 '+f1+' 0 R /F2 '+f2+' 0 R >>'+xres+' >> /Contents '+cs+' 0 R >>'))}
  objs[cat-1]='<< /Type /Catalog /Pages '+pagesId+' 0 R >>';objs[pagesId-1]='<< /Type /Pages /Kids ['+kids.map(k=>k+' 0 R').join(' ')+'] /Count '+kids.length+' >>';
  const info=add('<< /Title ('+enc(meta.title||'')+') /Producer (Classroom-Manager) >>');
  let out='%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';const off=[];objs.forEach((o,i)=>{off.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});
  const xr=out.length;out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+off.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root '+cat+' 0 R /Info '+info+' 0 R >>\nstartxref\n'+xr+'\n%%EOF';
  const u=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u[i]=out.charCodeAt(i)&255;return {blob:new Blob([u],{type:'application/pdf'}),pages:n}}
 /* Teilen (iPad: GoodNotes, Dateien …) – sonst herunterladen. Fehlt die „frische“ Berührung (nach dem Vorbereiten der Bilder), gibt es einen eigenen Teilen-Knopf. */
 function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
 async function save(blob,name){name=String(name).replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue').replace(/ß/g,'ss').normalize('NFD').replace(/[^\x20-\x7e]/g,'').replace(/\s+/g,' ').trim()||'Unterlagen.pdf';const file=new File([blob],name,{type:'application/pdf'});const can=!!(navigator.canShare&&navigator.canShare({files:[file]}));
  if(can){try{await navigator.share({files:[file],title:name.replace(/\.pdf$/,'')});return 'share'}catch(e){if(e&&e.name==='AbortError')return 'abort';if(!(e&&e.name==='NotAllowedError')){download(blob,name);return 'download'}}
   return new Promise(res=>{const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:99999;background:#1d2b4066;display:grid;place-items:center;padding:20px';
    o.innerHTML='<div style="background:#fff;border-radius:18px;padding:22px 24px;max-width:420px;text-align:center;font:17px/1.45 -apple-system,Inter,sans-serif;color:#243247;box-shadow:0 10px 40px #0004"><b style="font-size:1.15rem">Deine PDF ist fertig</b><p style="margin:8px 0 16px;color:#66758a">'+name.replace(/[<>&]/g,'')+'</p><button data-s style="min-height:50px;padding:0 22px;border:0;border-radius:12px;background:#2f5f9b;color:#fff;font:inherit;font-weight:700">Teilen / sichern</button> <button data-x style="min-height:50px;padding:0 16px;border:1px solid #b9c6da;border-radius:12px;background:#fff;color:#2f5f9b;font:inherit">Schließen</button></div>';
    document.body.append(o);o.querySelector('[data-x]').onclick=()=>{o.remove();res('abort')};
    o.querySelector('[data-s]').onclick=async()=>{try{await navigator.share({files:[file],title:name.replace(/\.pdf$/,'')});o.remove();res('share')}catch(e){if(e&&e.name==='AbortError')return;download(blob,name);o.remove();res('download')}}})}
  download(blob,name);return 'download'}
 /* 11.42: Lehrkraft-Vorschau – „Lösungen“ zeigt alle Lösungen der Einheit (dieselben Inhalte wie die PDF, ohne Ergebnis-Teil) */
 function solutions(on,blocksFn){let el=document.getElementById('cm-sol');if(!on){el?.remove();return}
  const E=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),M=t=>E(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
  let B=[];try{B=blocksFn()||[]}catch(e){B=[{t:'p',s:'Lösungen konnten nicht erstellt werden: '+(e&&e.message||e)}]}
  const i0=B.findIndex(b=>b&&b.t==='h2');const L=(i0>=0?B.slice(i0):B).filter(Boolean);
  const html=L.map(b=>b.t==='h2'?'<h2>'+M(b.s)+'</h2>':b.t==='h3'?'<h3>'+M(b.s)+'</h3>':b.t==='p'?'<p'+(b.sz&&b.sz<9?' class="sm"':'')+'>'+M(b.s)+'</p>':b.t==='list'?'<ul>'+(b.items||[]).map(x=>'<li>'+M(x)+'</li>').join('')+'</ul>':b.t==='box'?'<div class="bx">'+M(b.s)+'</div>'
   :b.t==='table'?'<table>'+(b.head?'<tr>'+b.head.map(h=>'<th>'+M(h)+'</th>').join('')+'</tr>':'')+(b.rows||[]).map(r=>'<tr>'+r.map((c,j)=>'<td'+(j===r.length-1&&r.length>1?' class="a"':'')+'>'+M(c)+'</td>').join('')+'</tr>').join('')+'</table>':'').join('');
  if(!el){el=document.createElement('div');el.id='cm-sol';document.body.append(el);const st=document.createElement('style');st.textContent='#cm-sol{position:fixed;inset:0;z-index:99990;overflow:auto;background:#f6f8fc;padding:18px 20px 40px;font:15px/1.45 -apple-system,BlinkMacSystemFont,Inter,"Segoe UI",sans-serif;color:#243247}#cm-sol .in{max-width:900px;margin:0 auto}#cm-sol .hd{display:flex;align-items:center;gap:10px;margin-bottom:6px}#cm-sol .hd b{flex:1;font-size:1.25rem}#cm-sol .hd button{height:40px;padding:0 14px;border-radius:10px;border:1px solid #b9c6da;background:#fff;color:#2f5f9b;font:inherit;font-weight:600;cursor:pointer}#cm-sol h2{font-size:1.05rem;margin:18px 0 6px;color:#2f5f9b}#cm-sol h3{font-size:.95rem;margin:12px 0 4px}#cm-sol table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #dce3ef;border-radius:10px;overflow:hidden}#cm-sol th{background:#eef3fa;text-align:left;font-size:.8rem;color:#4d5d73;padding:6px 10px}#cm-sol td{padding:6px 10px;border-top:1px solid #e6ebf3;vertical-align:top}#cm-sol td.a{color:#1f6b3a;font-weight:600}#cm-sol p{margin:4px 0}#cm-sol p.sm{font-size:.8rem;color:#66758a}#cm-sol .bx{padding:8px 12px;border-radius:10px;background:#eef3fa}';el.append(st)}
  el.querySelector('.in')?.remove();const d=document.createElement('div');d.className='in';d.innerHTML='<div class="hd"><b>Lösungen</b><button type="button" data-x>Schließen</button></div>'+html;el.append(d);d.querySelector('[data-x]').onclick=()=>{el.remove();try{parent.postMessage({type:'cm-sol-off'},'*')}catch{}}}
 /* 11.43: Materialangabe in den Stationskacheln – {T} Text, {D} Diagramm, {K} Karte, {B} Bild/Foto, {U} Übung im Buch, {A} Tabelle; z. B. „{D}M1 · Aussagen wischen“ */
 const MI={T:['Text','<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 13.5h6M9 17h4"/>'],D:['Diagramm','<path d="M4 20h16"/><path d="M7 20v-6M11 20V9M15 20v-9M19 20V6"/>'],K:['Karte','<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'],B:['Bild','<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>'],U:['Übung im Buch','<path d="M4 5.5C6.5 4 9.5 4 12 5.5 14.5 4 17.5 4 20 5.5V19c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0z"/><path d="M12 5.5V19"/>'],A:['Tabelle','<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18M3 14.5h18M9 5v14"/>']};
 /* 11.51: Variante B – Symbol und M-Nummer als farbiges Etikett, jede Materialart in eigener Farbe */
 window.cmMat=d=>{let h=String(d??'').replace(/\{([TDKBUA])\}(M\d+[a-z]?|Info \d|[ÜD] ?\d+(?: [a-z](?![a-zäöü]))?|Diagramm|Karte|Text|Bild|Tabelle)?/g,(m,k,lab)=>'<span class="cm-mc cm-mc-'+k+'"><svg class="cm-mi" viewBox="0 0 24 24" role="img" aria-label="'+MI[k][0]+'"><title>'+MI[k][0]+'</title>'+MI[k][1]+'</svg>'+(lab||'')+'</span>');
  if(h!==d&&!document.getElementById('cm-mi-css')){const st=document.createElement('style');st.id='cm-mi-css';st.textContent='.cm-mi{width:15px;height:15px;vertical-align:-2px;margin-right:2px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.cm-mc{display:inline-flex;align-items:center;gap:1px;padding:0 7px 0 5px;margin:1px 1px;border-radius:999px;font-weight:650;line-height:21px;white-space:nowrap;vertical-align:baseline}.cm-mc-T{color:#2f6fd0;background:#e8f0fd}.cm-mc-D{color:#1f8a4c;background:#e5f5ea}.cm-mc-K{color:#d9622b;background:#fdeee6}.cm-mc-B{color:#7c3aed;background:#f1ebfe}.cm-mc-A{color:#0e7490;background:#e0f4f7}.cm-mc-U{color:#b45309;background:#fdf2e3}';document.head.append(st)}return h};
 window.cmMatTxt=d=>String(d??'').replace(/\{[TDKBUA]\}/g,'');
 window.cmPdf={build:(b,m)=>build(b,m).blob,buildInfo:build,save,prep,solutions,_wrap:wrap};
})();
