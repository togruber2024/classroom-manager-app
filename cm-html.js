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
 window.cmHtmlToFiles=async files=>{const out=[],R={};
  for(const f of files||[]){if(!f||!isHtml(f)){out.push(f);continue}let p=null;try{p=cmHtmlParse(await f.text())}catch{}
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
 window.cmFileText=async f=>{const t=await f.text();if(!isHtml(f)&&!/^\s*</.test(t))return t;const p=cmHtmlParse(t);return p?JSON.stringify(p.unit):t};
})();
