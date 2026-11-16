/* 12.25: Lerneinheiten als HTML-Datei einlesen.
   Eine HTML-Datei einer Lerneinheit („Für Kollegen …“ oder eine exportierte Einheit) trägt die Einheit selbst in sich
   (window.CM_EMBED_BOOK=…). Optional: window.CM_EMBED_REIHE=… (Titel, Einträge und Angaben der Reihe, ohne die Einheiten).
   cmHtmlToFiles(Dateien) ersetzt HTML-Dateien durch gleichwertige .cmeinheit-/.cmreihe-Dateien – Einheiten derselben Reihe
   werden wieder zu einer Reihe zusammengesetzt. Aus der Datei wird kein Programmcode ausgeführt, nur die Daten gelesen. */
(()=>{
 const grab=(t,name)=>{const m='window.'+name+'=';let i=t.indexOf(m);while(i>=0&&t[i+m.length]!=='{'&&t[i+m.length]!=='[')i=t.indexOf(m,i+1);if(i<0)return null;let j=i+m.length;
  /* JSON-Wert vom Anfang bis zum passenden Ende lesen (Klammern zählen, Zeichenketten überspringen) */
  const c0=t[j];if(c0!=='{'&&c0!=='[')return null;let d=0,s=false,e=false;for(let k=j;k<t.length;k++){const c=t[k];
   if(s){if(e)e=false;else if(c==='\\')e=true;else if(c==='"')s=false;continue}
   if(c==='"')s=true;else if(c==='{'||c==='[')d++;else if(c==='}'||c===']'){d--;if(!d){try{return JSON.parse(t.slice(j,k+1))}catch{return null}}}}
  return null};
 const isHtml=f=>/\.html?$/i.test(f.name||'')||/^text\/html/.test(f.type||'');
 window.cmHtmlParse=text=>{const u=grab(text,'CM_EMBED_BOOK');/* 12.31: auch Buchdateien mit Lernpaketen (lps), z. B. „L16A … für Kollegen“ */if(!u||u.type!=='classroom-lerneinheit'||!(u.def||(u.lps&&typeof u.lps==='object')))return null;return {unit:u,reihe:grab(text,'CM_EMBED_REIHE')}};
 /* 12.32: jede exportierte Datei (Reihe, Paket, Einheit) kann als HTML reisen: window.CM_EMBED_FILE={name,data} trägt die Originaldatei */
 const embFile=t=>{const e=grab(t,'CM_EMBED_FILE');return e&&typeof e.name==='string'&&typeof e.data==='string'?e:null};
 window.cmEmbeddedFile=embFile;
 window.cmHtmlToFiles=async files=>{const out=[],R={};
  for(const f of files||[]){if(!f||!isHtml(f)){out.push(f);continue}let p=null,t='';try{t=await f.text()}catch{}const ef=embFile(t);if(ef){out.push(new File([ef.data],ef.name,{type:'application/json'}));continue}try{p=cmHtmlParse(t)}catch{}
   if(!p){out.push(f);continue}
   const r=p.reihe;if(r&&r.id){(R[r.id]??={meta:r,units:{}}).units[p.unit.id]=p.unit;continue}
   out.push(new File([JSON.stringify(p.unit)],f.name.replace(/\.html?$/i,'')+'.cmeinheit',{type:'application/json'}))}
  for(const {meta,units} of Object.values(R)){const have=new Set(Object.keys(units));
   /* Reihenfolge: wie in der Reihe angegeben; Einträge ohne Einheit (Texte) bleiben, fehlende Einheiten entfallen */
   const entries=(meta.entries||[]).filter(e=>!e.u||have.has(e.u));const d={...meta,type:'classroom-reihe',entries,units:{}};
   for(const e of entries)if(e.u&&units[e.u])d.units[e.u]=units[e.u];for(const [id,u] of Object.entries(units))if(!d.units[id])d.units[id]=u;
   out.push(new File([JSON.stringify(d)],String(meta.title||'Reihe').replace(/[\/\\:*?"<>|]/g,'-')+'.cmreihe',{type:'application/json'}))}
  return out};
 /* Text einer Datei lesen – bei HTML die eingebettete Einheit als JSON-Text */
 window.cmFileText=async f=>{const t=await f.text();if(!isHtml(f)&&!/^\s*</.test(t))return t;const ef=embFile(t);if(ef)return ef.data;const p=cmHtmlParse(t);return p?JSON.stringify(p.unit):t};

 /* 12.32: Übersicht für die Finder-Vorschau (Leertaste) – reines HTML ohne Skript, denn die Vorschau führt keine Skripte aus */
 const H=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const CSS='.cmq{font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;color:#243247;max-width:860px;margin:0 auto;padding:28px 22px 40px}.cmq *{box-sizing:border-box}.cmq .k{font-size:12.5px;color:#6b7a90}.cmq h1{font-size:24px;line-height:1.2;margin:8px 0 4px}.cmq .s{color:#6b7a90;margin:0 0 14px}.cmq .ch{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}.cmq .ch span{font-size:12.5px;font-weight:600;color:#2f5f9b;background:#e8eef7;border-radius:99px;padding:2px 10px}.cmq .ls{background:#fff;border:1px solid #dde3ec;border-radius:12px;padding:4px 16px}.cmq .it{display:flex;gap:10px;padding:9px 0;border-top:1px solid #eef1f6}.cmq .it:first-child{border:0}.cmq .it i{flex:none;width:23px;height:23px;border-radius:50%;background:#e8eef7;color:#2f5f9b;font:700 11.5px/23px sans-serif;text-align:center;font-style:normal}.cmq .it small{display:block;color:#7d8aa0;font-size:12.5px}.cmq .nt{margin-top:16px;padding:12px 14px;border-radius:10px;background:#fff6ec;border:1px solid #f3c99b;font-size:13.5px;color:#7a3f00}.cmq .ac{display:none;flex-wrap:wrap;gap:8px;margin:0 0 16px}.cmq .ac button{font:600 15px -apple-system,Inter,sans-serif;border-radius:10px;padding:11px 18px;border:1px solid #cfd8e5;background:#fff;color:#2f5f9b;cursor:pointer}.cmq .ac button.o{background:#2f5f9b;border-color:#2f5f9b;color:#fff}';
 window.cmOverviewHtml=o=>'<div class="cmq"><div class="k">▣ Classroom-Manager · '+H(o.kind||'Datei')+'</div><h1>'+H(o.title)+'</h1>'+(o.sub?'<p class="s">'+H(o.sub)+'</p>':'')+(o.chips&&o.chips.length?'<div class="ch">'+o.chips.map(c=>'<span>'+H(c)+'</span>').join('')+'</div>':'')+(o.actions||'')+(o.items&&o.items.length?'<div class="ls">'+o.items.map((x,i)=>'<div class="it"><i>'+(i+1)+'</i><div>'+H(x[0])+(x[1]?'<small>'+H(x[1])+'</small>':'')+'</div></div>').join('')+'</div>':'')+(o.note?'<div class="nt ql">'+H(o.note)+'</div>':'')+'</div>';
 /* Datei ohne Abspieler (Reihe, Paket): die Übersicht ist zugleich die Ansicht im Browser */
 window.cmWrapHtml=o=>'<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+H(o.title)+'</title><style>body{margin:0;background:#f4f6fa}'+CSS+'</style></head><body>'+cmOverviewHtml(o)+'<script>window.CM_EMBED_FILE='+JSON.stringify(o.file).replace(/</g,'\\u003c')+';</'+'script></bo'+'dy></ht'+'ml>';
 /* Datei mit Abspieler (eine Lerneinheit): in der Finder-Vorschau nur die Übersicht, im Browser die Übersicht als Startseite mit „Einheit starten“ */
 window.cmQlInject=(html,o)=>{const blk='<style id="cmqls">body>*:not(#cmql){display:none!important}</style><style>#cmql{background:#f4f6fa;min-height:100vh}#cmql.live{position:fixed;inset:0;z-index:100000;overflow:auto}#cmql.live .ac{display:flex}#cmql.live .ql{display:none}'+CSS+'</style><div id="cmql">'+cmOverviewHtml(o)+'</div><script>(()=>{document.getElementById("cmqls").remove();const q=document.getElementById("cmql");q.classList.add("live");q.onclick=e=>{const b=e.target.closest("[data-cmq]");if(!b)return;q.remove();if(b.dataset.cmq==="sol")setTimeout(()=>{const a=document.querySelector("[data-a]");a&&!a.hidden&&a.click()},300)}})()</'+'script>';
  return html.replace(/<body[^>]*>/i,m=>m+blk)};

})();
