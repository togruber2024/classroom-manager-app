/* 11.45: Abgabe-QR für Üben, Übungen und Übersetzungs-Trainer – wie bei den Lerneinheiten:
   Name aus der Klassenliste wählen (kommt mit dem Link der Lehrkraft), oben rechts „Abgabe-QR“ zeigen, die Lehrkraft scannt.
   Im QR stehen Punkte je Teil (CMLE1); seit 11.73 beim Übersetzungs-Trainer auch die Übersetzungen (dann ggf. mehrere Codes, CMLE2). In der Lehrkraft-Vorschau (?vorschau=1) gibt es keinen Abgabe-QR.
   window.cmAbgabe({u,title,cls,names,score:()=>({s:{…},x:{}})}) → {update()} */
/* 11.81: gemeinsame Prüfung deutscher Vokabel-Bedeutungen (Üben, Übersetzungs-Trainer): Klammern, Artikel und „etw./jdn.“ zählen nicht, ein Tippfehler bei längeren Wörtern ist erlaubt */
window.cmVocabOk=(()=>{const plain=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/j/g,'i');
 const parts=m=>String(m||'').replace(/\([^)]*\)/g,' ').split(/[,;\/]| bzw\. | oder /).map(x=>plain(x).replace(/\b(der|die|das|ein|eine|einen|sich|etw\.?|jdn\.?|jdm\.?|jmd\.?)\b/g,' ').replace(/[^a-zäöüß\s-]/g,' ').replace(/\s+/g,' ').trim()).filter(Boolean);
 const lev=(a,b)=>{if(Math.abs(a.length-b.length)>1)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length]};
 const near=(x,y)=>x===y||(y.length>=6&&lev(x,y)<=1);
 /* 11.82: Klammern zählen nicht – „Angst haben (vor)“: richtig sind „Angst haben“ und „Angst haben vor“ */
 const all=m=>{const a=parts(m),b=parts(String(m||'').replace(/[()]/g,' '));return [...new Set([...a,...b])]};
 return (inp,m)=>{const v=parts(String(inp||'').replace(/[()]/g,' '))[0]||'';if(!v)return false;return all(m).some(p=>near(v,p)||p.split(' ').some(w=>w.length>=4&&near(v,w)))}})();

/* 12.24: Prüfsumme für Abgabe-Dateien (gleiche Funktion beim Einlesen auf dem Mac) */
window.cmAbgabeHash=async d=>{const {h,...r}=d||{};const txt='cm-abgabe-v1|'+JSON.stringify(r);try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,24)}catch{let x=2166136261;for(let i=0;i<txt.length;i++){x^=txt.charCodeAt(i);x=Math.imul(x,16777619)>>>0}return 'f'+x.toString(16)}};
(()=>{
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const css='#cmab{position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:80;display:flex;align-items:center;gap:8px;min-height:46px;padding:5px 10px 5px 12px;border:1px solid #dce3ef;border-radius:14px;background:#fff;color:#243247;font:600 13px/1.2 -apple-system,BlinkMacSystemFont,Inter,"Segoe UI",sans-serif;box-shadow:0 4px 12px #233d6018;cursor:pointer;text-align:left}#cmab b{display:block;font-size:14px}#cmab small{color:#2f5f9b;font-weight:600}#cmab svg{width:22px;height:22px}'
  +'.cmab-o{position:fixed;inset:0;z-index:2000;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;text-align:center;font:16px/1.4 -apple-system,BlinkMacSystemFont,Inter,"Segoe UI",sans-serif;color:#243247;overflow:auto}.cmab-o .nm{font-size:2.1rem;font-weight:800}.cmab-o svg.q{width:min(78vw,62vh);height:auto}.cmab-o button{min-height:48px;padding:0 20px;border-radius:12px;border:1px solid #b9c6da;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;cursor:pointer}.cmab-o button.p{background:#2f5f9b;color:#fff;border-color:#2f5f9b}.cmab-o .lnk{border:0;background:none;color:#66758a;text-decoration:underline;min-height:40px}'
  +'.cmab-names{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;width:min(760px,100%);margin:10px 0}.cmab-names button{min-height:52px;font-weight:600;color:#243247}.cmab-names button.on{background:#2f5f9b;color:#fff;border-color:#2f5f9b}.cmab-o input{min-height:50px;width:min(420px,100%);padding:0 12px;border:1px solid #cfd8e6;border-radius:12px;font:inherit}'
  +'@media print{#cmab,.cmab-o{display:none!important}}';
 window.cmAbgabe=function(o){
  if(/[?&]vorschau=1/.test(location.search))return {update(){}};
  if(!document.getElementById('cmab-css')){const st=document.createElement('style');st.id='cmab-css';st.textContent=css;document.head.append(st)}
  const K='cm-abgabe-'+o.u;let S={};try{S=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch{}
  const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch{}};
  S.dv??=Math.random().toString(36).slice(2,10);
  const roster=Array.isArray(o.names)&&o.names.length?o.names.map(String):null;
  if(roster&&(S.cls!==(o.cls||'')||(S.me&&!roster.includes(S.me))))S.me=null;S.cls=o.cls||S.cls||'';save();
  const btn=document.createElement('button');btn.type='button';btn.id='cmab';btn.setAttribute('aria-label','Abgabe-QR zeigen');document.body.append(btn);
  const sc=()=>{try{return o.score()||{s:{}}}catch{return {s:{}}}};
  const prog=()=>{const s=sc().s||{};let p=0,t=0;for(const v of Object.values(s))if(Array.isArray(v)){p+=v[0];t+=v[1]}return t?p+'/'+t:'–'};
  function update(){try{window.cmLoNote?.({title:o.title||document.title,p:prog(),me:S.me||'',cls:S.cls||''})}catch{}btn.innerHTML=S.me?'<span><b>'+esc(S.me)+'</b><small>Abgabe-QR · '+prog()+'</small></span><svg viewBox="0 0 24 24" fill="#243247" aria-hidden="true"><path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zm2 2v4h4V5zM3 13h8v8H3zm2 2v4h4v-4zM13 13h3v3h-3zM18 13h3v3h-3zM13 18h3v3h-3zM18 18h3v3h-3zM16 16h2v2h-2z"/></svg>':'<span><b>Abgabe-QR</b><small>Name wählen</small></span>'}
  function payload(){const r=sc();return 'CMLE1:'+JSON.stringify({u:o.u,v:2,c:S.cls||'',n:S.me,dv:S.dv,ts:Date.now(),b:0,s:r.s||{},x:r.x||{}})}
  function who(cb){const ov=document.createElement('div');ov.className='cmab-o';let pick=S.me;
   const draw=()=>{ov.innerHTML='<div style="font-size:1.4rem;font-weight:800">'+esc(o.title||'Abgabe')+(S.cls?' · '+esc(S.cls):'')+'</div>'
    +(roster?'<div>Tippe auf deinen Namen. Er steht später groß über deinem Abgabe-QR.</div><div class="cmab-names">'+roster.map(n=>'<button type="button" class="'+(n===pick?'on':'')+'" data-n="'+esc(n)+'">'+esc(n)+'</button>').join('')+'</div>'
     :'<div>Trage deinen Namen ein (Vor- und Nachname):</div><input id="cmabIn" value="'+esc(pick||'')+'" placeholder="Vorname Nachname">')
    +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button type="button" data-x>Abbrechen</button><button type="button" class="p" data-ok>'+(pick?'Das bin ich: '+esc(pick):'Speichern')+'</button></div>';
    ov.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{pick=b.dataset.n;draw()});const inp=ov.querySelector('#cmabIn');if(inp)inp.oninput=()=>{pick=inp.value.trim();ov.querySelector('[data-ok]').textContent=pick?'Das bin ich: '+pick:'Speichern'};
    ov.querySelector('[data-x]').onclick=()=>ov.remove();ov.querySelector('[data-ok]').onclick=()=>{if(!pick||pick.length<2)return;/* 12.24: Name wird einmal bestätigt und ist danach fest */if(!confirm('Bist du wirklich „'+pick+'“?\n\nDein Name kann danach nicht mehr geändert werden.'))return;S.me=pick;S.lk=1;save();ov.remove();update();showQr(cb)}};
   draw();document.body.append(ov)}
  /* 11.73: lange Abgaben (z. B. Übersetzungen) gehen komprimiert auf mehrere QR-Codes (CMLE2/id/k/n/…), die Lehrkraft scannt sie nacheinander */
  /* 11.90: mit o.restore (z. B. Übersetzungs-Trainer) geht der vollständige Arbeitsstand mit – die Lehrkraft kann ihn später als Wiederherstellen-QR zurückgeben */
  const rest=()=>{if(!o.restore)return {};try{const it=o.restore()||[];return {r:[...it,['cm-abgabe-'+o.u,S]],rp:location.pathname.split('/').pop()+location.search}}catch{return {}}};
  async function codes(){const r=sc(),R=rest(),C=!!(R.r&&r.wt&&window.classroomTtExpand),w=C?r.wc:r.w;/* 11.91: kompakt – Übersetzungen stecken schon im Arbeitsstand */return classroomQrPack({u:o.u,v:2,c:S.cls||'',n:S.me,dv:S.dv,ts:Date.now(),b:0,s:r.s||{},x:r.x||{},...(w&&Object.keys(w).length?{w}:{}),...(C?{wt:r.wt}:{}),...R})}
  /* 12.29: cb – wird nach dem Zeigen (Schließen) oder dem Sichern als Datei aufgerufen, z. B. „jetzt vergleichen“ im Übersetzungs-Trainer */
  async function showQr(cb){if(typeof cb!=='function')cb=null;if(!S.me){who(cb);return}const ov=document.createElement('div');ov.className='cmab-o';document.body.append(ov);ov.innerHTML='<div style="color:#66758a">QR-Code wird erstellt …</div>';
   let C=[];try{C=await codes()}catch(e){C=[payload()]}let k=0;
   const draw=()=>{let q='';try{q=classroomQrSvg(C[k],{ecc:'L',boost:false,dark:'#243247',border:3}).replace('<svg','<svg class="q"')}catch(e){q='<p>QR-Code nicht möglich: '+esc(e.message)+'</p>'}
    ov.innerHTML='<div style="color:#66758a">Abgabe · '+esc(o.title||'')+(S.cls?' · '+esc(S.cls):'')+'</div><div class="nm">'+esc(S.me)+'</div>'+(C.length>1?'<div style="font-weight:800;color:#c2410c">Code '+(k+1)+' von '+C.length+'</div>':'')+q+'<div style="color:#66758a;font-size:.9rem">Stand '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+' · '+prog()+' Punkte'+(C.length>1?' · nach dem Scannen „Nächster Code“':'')+'</div>'
     +'<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">'+(C.length>1?'<button type="button" data-pv'+(k?'':' disabled')+'>‹ Zurück</button><button type="button" class="p" data-nx'+(k<C.length-1?'':' disabled')+'>Nächster Code ›</button>':'')+'<button type="button"'+(C.length>1?'':' class="p"')+' data-c>Schließen</button></div><button type="button" data-file>Abgabe als Datei sichern</button>'+(S.lk?'<div style="color:#66758a;font-size:.85rem">Falscher Name? Sag deiner Lehrkraft Bescheid.</div>':'<button type="button" class="lnk" data-ch>Nicht dein Name? Ändern</button>');
    ov.querySelector('[data-pv]')?.addEventListener('click',()=>{k=Math.max(0,k-1);draw()});ov.querySelector('[data-nx]')?.addEventListener('click',()=>{k=Math.min(C.length-1,k+1);draw()});
    ov.querySelector('[data-c]').onclick=()=>{ov.remove();cb?.()};ov.querySelector('[data-ch]')?.addEventListener('click',()=>{if(confirm('Deinen Namen wirklich ändern? Deine Lehrkraft sieht den neuen Namen.')){ov.remove();who()}});ov.querySelector('[data-file]').onclick=async e=>{if(await saveFile(e.currentTarget)&&cb){ov.remove();cb()}}};draw()}
  /* 12.24: Abgabe als Datei (z. B. für IServ-Aufgaben) – gleicher Inhalt wie der QR, mit Prüfsumme gegen nachträgliches Ändern */
  async function fileData(){const r=sc(),R=rest(),C=!!(R.r&&r.wt&&window.classroomTtExpand),w=C?r.wc:r.w;const d={type:'classroom-abgabe',v:1,t:o.title||document.title,u:o.u,c:S.cls||'',n:S.me,dv:S.dv,ts:Date.now(),b:0,s:r.s||{},x:r.x||{},...(w&&Object.keys(w).length?{w}:{}),...(C?{wt:r.wt}:{}),...R};
   d.h=await window.cmAbgabeHash(d);return d}
  async function saveFile(btn){if(!S.me){who();return}const old=btn.textContent;try{const d=await fileData(),ti=String(o.title||'Abgabe'),m=/Lektion\s+(\d+\w?)/.exec(ti),short=m?'L'+m[1]:ti.replace(/\s*·.*$/,'').slice(0,40);
    const nm=window.classroomSubFile?classroomSubFile(ti.replace(/\s*·\s*Abgabe.*$/,''),S.me):(short+' - '+S.me).replace(/[\\/:*?"<>|]/g,'')+'.cmabgabe'/* 12.80 */,file=new File([JSON.stringify(d)],nm,{type:'application/octet-stream'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:nm});btn.textContent='✓ gesichert'}
    else{const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=nm;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);btn.textContent='✓ geladen'}}
   catch(e){if(e&&e.name==='AbortError')return false;alert('Die Abgabe-Datei konnte nicht erstellt werden: '+(e&&e.message||e));return false}setTimeout(()=>{if(btn.isConnected)btn.textContent=old},2500);return true}
  window.cmAbgabeCodes=codes;
  btn.onclick=showQr;update();if(roster&&!S.me)setTimeout(who,400);
  return {update,show:showQr}};
})();
