/* ==== device.js ==== */
/* 9.10: Gemeinsame Geräteerkennung für alle Bereiche (statt verstreuter Einzelprüfungen).
   touch(): Gerät mit Touch (iPhone, iPad, Android) – Mac und PC mit Maus: false.
   ios: iPhone/iPad (auch iPadOS, das sich als Mac meldet). mobile: iOS oder Android. */
(()=>{if(window.classroomDevice)return;const ua=navigator.userAgent||'',tp=navigator.maxTouchPoints||0;
 const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&tp>1)||(/Mac/i.test(navigator.platform||'')&&tp>1);
 window.classroomDevice={ios,mobile:ios||/Android/i.test(ua),touch:()=>tp>0||matchMedia('(pointer:coarse)').matches};
})();
/* 9.14: Ein gemeinsamer Beobachter je Seite statt vieler einzelner. Module melden sich mit classroomOnDomChange(fn) an;
   nach Änderungen im Dokument laufen alle angemeldeten Funktionen gebündelt einmal vor dem nächsten Bild.
   Schutz vor Endlosschleifen (vgl. 9.06): Ändern die Funktionen selbst über viele Bilder hinweg ständig das Dokument,
   wird auf ruhige 2-mal pro Sekunde gedrosselt und ein Eintrag ins Fehlerprotokoll geschrieben. */
(()=>{if(window.classroomOnDomChange)return;const fns=[];let planned=false,busy=false,streak=0,slow=false,warned=false,obs=null;
 const note=()=>{if(warned)return;warned=true;try{const k='classroom-error-log-v1',l=JSON.parse(localStorage.getItem(k)||'[]');l.push({t:new Date().toISOString(),w:document.body?.dataset.module||'App',m:'Darstellung: Dauer-Änderungsschleife erkannt – gedrosselt ('+culprits.join(' | ').slice(0,300)+')',s:'device.js'});localStorage.setItem(k,JSON.stringify(l.slice(-50)))}catch{}};
 /* 9.75: merkt sich, welche Funktion das Dokument bei jedem Lauf erneut ändert (für Fehlerprotokoll und Ruhe-Test) */
 const name=f=>(f.name&&f.name!=='fn'?f.name+': ':'')+String(f).replace(/\s+/g,' ').slice(0,90);let culprits=[];
 window.classroomDomChangeStats={runs:0,changes:0,get culprits(){return culprits.slice()}};
 const ms=new Map();window.classroomDomChangeStats.time=()=>[...ms].map(([f,t])=>[name(f),Math.round(t)]).sort((a,b)=>b[1]-a[1]);
 const run=()=>{planned=false;obs?.takeRecords();busy=true;const by=[];for(const f of fns){const t0=performance.now();try{f()}catch(e){console.error(e)}ms.set(f,(ms.get(f)||0)+performance.now()-t0);if(obs&&obs.takeRecords().length)by.push(f)}busy=false;
  const stats=window.classroomDomChangeStats;stats.runs++;const changed=by.length>0;if(changed){stats.changes++;culprits=by.map(name);streak++;if(streak>40&&!slow){slow=true;note()}schedule()}else{streak=0;slow=false}};
 const schedule=()=>{if(planned)return;planned=true;if(slow)setTimeout(()=>requestAnimationFrame(run),500);else requestAnimationFrame(run)};
 const start=()=>{if(obs)return;obs=new MutationObserver(()=>{if(!busy)schedule()});obs.observe(document.documentElement,{childList:true,subtree:true,characterData:true})};
 window.classroomOnDomChange=fn=>{fns.push(fn);start();schedule()};
})();
/* 9.75: Zeilen einer (evtl. umsortierten) Tabelle in Datenreihenfolge – für Stellen, die Zeile i der Schüler:in i zuordnen.
   Die Sortierung (perf-sort.js) merkt sich die ursprüngliche Position je Zeile in data-ps-idx. */
window.classroomDataOrder=list=>{const a=[...(list||[])];if(!a.some(r=>r?.parentElement?.dataset?.psSorted==='1'))return a;if(a.some(r=>r.dataset?.psIdx===undefined))return a;return a.sort((x,y)=>Number(x.dataset.psIdx)-Number(y.dataset.psIdx))};
;

/* ==== glyph-icons.js ==== */
/* 12.38: Strich-Symbole statt Textzeichen.
   Ersetzt in sichtbarem Text die Zeichen ☰ ▾ ▸ › ‹ ✕ 🔒 ▶ ⠿ ✓ ⋯ ··· ⭐ ⚠ durch Strich-Symbole (24er-Raster, Strichstärke 2, runde Enden).
   Das Zeichen bleibt unsichtbar im Text erhalten – textContent, Kopieren und Vergleiche im Code ändern sich nicht.
   Ausgenommen: Eingabefelder, Auswahllisten, Skripte, Druckseiten-Text in Attributen (title, aria-label). */
(()=>{if(window.__glyphIcons)return;window.__glyphIcons=true;
 const S=(p,extra='')=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'+extra+'>'+p+'</svg>';
 const dot=(x,y,r=1.4)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="currentColor" stroke="none"/>';
 const I={
  '☰':S('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  '▾':S('<path d="M6 9l6 6 6-6"/>'),'▴':S('<path d="M6 15l6-6 6 6"/>'),
  '▸':S('<path d="M9 6l6 6-6 6"/>'),'›':S('<path d="M9 6l6 6-6 6"/>'),'‹':S('<path d="M15 6l-6 6 6 6"/>'),
  '✕':S('<path d="M6 6l12 12M18 6L6 18"/>'),
  '🔒':S('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  '▶':S('<path d="M7 5l12 7-12 7z"/>'),
  '⠿':S(dot(9,6)+dot(15,6)+dot(9,12)+dot(15,12)+dot(9,18)+dot(15,18)),
  '✓':S('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  '⋯':S(dot(5,12,1.6)+dot(12,12,1.6)+dot(19,12,1.6)),'···':S(dot(5,12,1.6)+dot(12,12,1.6)+dot(19,12,1.6)),
  '⭐':S('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>'),
  '⚠':S('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>')};
 const RX=/···|⚠[︎️]?|[☰▾▴▸›‹✕▶⠿✓⋯]|🔒|⭐️?/;const RXG=new RegExp(RX.source,'g');
 const SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION','TITLE','NOSCRIPT','CODE','PRE','svg','SVG']);
 const css=document.createElement('style');css.textContent='.gi{display:inline-flex;align-items:center;justify-content:center;vertical-align:-.14em;line-height:1}.gi>svg{width:1.05em;height:1.05em;flex:none}.gi-t{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.gi-star>svg{color:#e0a020}.gi-grip>svg{width:1.1em;height:1.1em}';(document.head||document.documentElement).append(css);
 const ok=t=>{for(let e=t.parentNode;e&&e.nodeType===1;e=e.parentNode){if(SKIP.has(e.nodeName)||e.isContentEditable||e.classList?.contains('gi')||e.hasAttribute?.('data-no-glyph'))return false}return true};
 function conv(t){const s=t.nodeValue;if(!s||!RX.test(s)||!ok(t))return;const f=document.createDocumentFragment();let last=0;s.replace(RXG,(m,i)=>{if(i>last)f.append(s.slice(last,i));const k=m.startsWith('⚠')?'⚠':m.startsWith('⭐')?'⭐':m;const sp=document.createElement('span');sp.className='gi'+(k==='⭐'?' gi-star':k==='⠿'?' gi-grip':'');sp.innerHTML=I[k];const tx=document.createElement('span');tx.className='gi-t';tx.textContent=m;sp.append(tx);f.append(sp);last=i+m.length;return m});if(last<s.length)f.append(s.slice(last));t.replaceWith(f)}
 function scan(root){if(!root)return;if(root.nodeType===3){conv(root);return}if(root.nodeType!==1&&root.nodeType!==11)return;if(root.nodeType===1&&SKIP.has(root.nodeName))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>RX.test(n.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP});const L=[];while(w.nextNode())L.push(w.currentNode);L.forEach(conv)}
 let pend=new Set(),planned=false;const flush=()=>{planned=false;const L=[...pend];pend.clear();for(const n of L)if(n.isConnected)scan(n)};
 const mo=new MutationObserver(recs=>{for(const r of recs){if(r.type==='characterData')pend.add(r.target);else r.addedNodes.forEach(n=>pend.add(n))}if(!planned&&pend.size){planned=true;queueMicrotask(flush)}});
 const start=()=>{scan(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})};
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
})();
;

/* ==== ui-dialogs.js ==== */
/* 8.29: Kein Hineinzoomen per Zwei-Finger-Geste oder Doppeltippen (iPad/iPhone) – die App ist für den Bildschirm fertig gelayoutet.
   Scrollen bleibt erlaubt; der Sitzplan-Zoom läuft weiter über seine Tasten. */
(()=>{const stop=e=>{if(e.cancelable)e.preventDefault()};for(const t of ['gesturestart','gesturechange','gestureend'])document.addEventListener(t,stop,{passive:false});
 document.addEventListener('touchmove',e=>{if(e.touches&&e.touches.length>1)stop(e)},{passive:false});
 const s=document.createElement('style');s.textContent='html,body{touch-action:pan-x pan-y}';document.head.append(s)})();
/* Speicher-Schutz für Anzeige-Einstellungen: Ist der Browserspeicher voll, merken sich Schalter wie Fortschritt, Schraffur/Rahmen,
   „1. Quartal“ oder Notengrenzen-Aufklappen ihren Zustand im Arbeitsspeicher, statt still zu scheitern. Noten und andere Daten sind
   ausdrücklich NICHT betroffen – dort bleibt die Fehlermeldung bestehen, damit nichts unbemerkt verloren geht. */
(()=>{try{const P=Storage.prototype;if(P.__classroomGuard)return;P.__classroomGuard=true;const set=P.setItem,get=P.getItem,rem=P.removeItem,mem=new Map();
 const ui=k=>/^classroom-(previous-quarter:|next-quarter:|progress-v1$|ng-open-v1$|ov-mean-v1$|hatch-style-v1$|manager-hatching-v1$|manager-theme-v1$|mm-last-v1$)/.test(String(k));
 P.setItem=function(k,v){try{/* 11.99: unveränderte Werte nicht erneut schreiben (laut Standard ohnehin ohne Wirkung – spart beim Start Zeit) */if(get.call(this,k)===String(v)){if(this===window.localStorage)mem.delete(String(k));return}set.call(this,k,v);if(this===window.localStorage)mem.delete(String(k))}catch(e){if(this===window.localStorage&&ui(k)){mem.set(String(k),String(v));return}throw e}};
 P.getItem=function(k){if(this===window.localStorage&&mem.has(String(k)))return mem.get(String(k));return get.call(this,k)};
 P.removeItem=function(k){if(this===window.localStorage)mem.delete(String(k));return rem.call(this,k)}}catch{}})();
/* Fehlerprotokoll auf dem Gerät (App, Noten-Manager, Unterrichts-Manager): nur Fehlermeldung, Datei/Zeile und Zeitpunkt,
   keine Schülerdaten. Höchstens 30 Einträge; sichtbar unter Backup → Daten prüfen. */
(()=>{
 if(window.classroomLogError)return;
 const key='classroom-error-log-v1';
 const where=()=>window.parent===window?'App':/noten/.test(location.pathname)||document.body?.dataset.module==='noten'?'Noten-Manager':'Unterrichts-Manager';
 window.classroomLogError=(message,source)=>{try{
  const list=JSON.parse(localStorage.getItem(key)||'[]');const m=String(message||'Unbekannter Fehler').replace(/\s+/g,' ').slice(0,180);
  const last=list.at(-1);if(last&&last.m===m&&Date.now()-Date.parse(last.t)<5000)return;
  list.push({t:new Date().toISOString(),w:where(),m,s:String(source||'').split('/').pop().replace(/\?v=\d+/,'').slice(0,60)});
  localStorage.setItem(key,JSON.stringify(list.slice(-30)));
 }catch{}};
 window.addEventListener('error',e=>{if(e.message)window.classroomLogError(e.message,(e.filename||'')+(e.lineno?':'+e.lineno:''))});
 window.addEventListener('unhandledrejection',e=>{const r=e.reason;window.classroomLogError(r&&r.message||r,'Promise')});
})();
/* Eigene Dialoge im Stil der App statt der grauen Browserfenster.
   classroomAlert(text) · classroomConfirm(text, {ok, cancel, danger}) · classroomPrompt(text, vorgabe)
   liefern jeweils ein Promise. window.alert wird auf den eigenen Hinweisdialog umgeleitet. */
(()=>{
 if(window.classroomConfirm)return;
 const nativeAlert=window.alert.bind(window);
 let queue=Promise.resolve();
 const css=document.createElement('style');css.textContent=
  '.ui-dialog{width:min(460px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;padding:22px 24px 20px;border:1px solid #dce3ef;border-radius:18px;color:#243247;background:#fff;box-shadow:0 18px 60px #1c2b4630;font:16px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}'
  +'.ui-dialog::backdrop{background:#1c2b4638}'
  +'.ui-dialog h2{margin:0 0 8px;font-size:1.15rem;line-height:1.3}'
  +'.ui-dialog .ui-dialog-text{margin:0;white-space:pre-line;color:#4a5b73;font-size:.95rem;line-height:1.5}'
  +'.ui-dialog input{box-sizing:border-box;width:100%;min-height:38px;margin-top:14px;padding:7px 11px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:#243247;font:inherit}'
  +'.ui-dialog input:focus{outline:2px solid var(--primary,#2f5f9b);outline-offset:1px}'
  +'.ui-dialog-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:20px}'
  +'.ui-dialog-actions button{min-height:38px;padding:8px 16px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:var(--primary,#2f5f9b);font:inherit;font-size:.95rem;font-weight:600;cursor:pointer}'
  +'.ui-dialog-actions button:hover{background:#f3f6fb}'
  +'.ui-dialog-actions button.ui-primary{border-color:var(--primary,#2f5f9b);background:var(--primary,#2f5f9b);color:#fff}'
  +'.ui-dialog-actions button.ui-primary:hover{background:var(--primary-hover,#244c80)}'
  +'.ui-dialog-actions button.ui-danger{border-color:#c4372b;background:#c4372b;color:#fff}'
  +'.ui-dialog-actions button.ui-danger:hover{background:#a82c22}';
 (document.head||document.documentElement).append(css);
 function okLabel(text){const t=String(text).toLowerCase();if(/zurücksetzen/.test(t))return ['Zurücksetzen',true];if(/löschen|gelöscht/.test(t))return ['Löschen',true];if(/entfernen|entfernt/.test(t))return ['Entfernen',true];if(/ersetzt|überschreib/.test(t))return ['Ersetzen',true];return ['OK',false]}
 function open(kind,text,opts={}){
  const run=()=>new Promise(resolve=>{
   const d=document.createElement('dialog');d.className='ui-dialog';d.setAttribute('aria-modal','true');
   /* 13.16: erster Absatz = Überschrift, der Rest = Erklärung (einheitlicher Dialog-Stil) */
   {const T=String(text??'').trim(),i=T.indexOf('\n\n');let h='',b=T;if(i>0&&i<=160){h=T.slice(0,i).trim();b=T.slice(i+2).trim()}else if(kind!=='alert'&&T.length<=110&&!T.includes('\n')){h=T;b=''}else if(kind==='alert'){h='Hinweis'}
    if(h){const h2=document.createElement('h2');h2.textContent=h;d.append(h2)}if(b){const p=document.createElement('p');p.className='ui-dialog-text';p.textContent=b;d.append(p)}}
   let input=null;if(kind==='prompt'){input=document.createElement('input');input.type='text';input.autocomplete='off';input.value=opts.value??'';input.setAttribute('aria-label',String(text||'Eingabe'));d.append(input)}
   const actions=document.createElement('div');actions.className='ui-dialog-actions';d.append(actions);
   const [defOk,defDanger]=kind==='confirm'?okLabel(text):kind==='prompt'?['Speichern',false]:['OK',false];
   const ok=document.createElement('button');ok.type='button';ok.textContent=opts.ok||defOk;ok.className=(opts.danger??defDanger)?'ui-danger':'ui-primary';
   let cancel=null;if(kind!=='alert'){cancel=document.createElement('button');cancel.type='button';cancel.textContent=opts.cancel||'Abbrechen';actions.append(cancel)}
   actions.append(ok);
   let done=false;const finish=value=>{if(done)return;done=true;try{d.close()}catch{}d.remove();resolve(value)};
   ok.onclick=()=>finish(kind==='prompt'?input.value:kind==='confirm'?true:undefined);
   if(cancel)cancel.onclick=()=>finish(kind==='prompt'?null:false);
   d.addEventListener('cancel',e=>{e.preventDefault();finish(kind==='prompt'?null:kind==='confirm'?false:undefined)});
   d.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.target===input||kind==='alert')){e.preventDefault();ok.click()}});
   (document.body||document.documentElement).append(d);
   try{d.showModal()}catch{d.setAttribute('open','')}
   setTimeout(()=>{if(input){input.focus();input.select()}else (cancel&&(opts.danger??defDanger)?cancel:ok).focus()},0);
  });
  const result=queue.then(run,run);queue=result.catch(()=>{});return result;
 }
 /* 12.42: kurze Hinweise als Einblendung unten statt OK-Fenster. Erfolg: dunkel, verschwindet nach ca. 3 s. Problem: rot umrandet, bleibt bis zum Wegklicken.
    Lange oder mehrzeilige Texte bleiben ein Dialog ({dialog:true} erzwingt ihn). */
 const isErr=t=>/(nicht|fehler|ungültig|kein[e ]?|bitte|fehlt|konnte|unmöglich|zu groß|abgebrochen|gesperrt|leer|falsch|achtung|warnung)/i.test(t);
 const tcss=document.createElement('style');tcss.textContent='.cm-toasts{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483000;display:flex;flex-direction:column-reverse;align-items:center;gap:8px;pointer-events:none;max-width:calc(100vw - 24px)}'
  +'.cm-toast{pointer-events:auto;display:flex;align-items:center;gap:10px;max-width:640px;background:#1f2f47;color:#fff;border-radius:12px;padding:10px 14px 10px 16px;box-shadow:0 10px 26px rgba(10,20,40,.3);font:600 14.5px/1.35 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;opacity:0;transform:translateY(8px);transition:opacity .18s,transform .18s}'
  +'.cm-toast.in{opacity:1;transform:none}.cm-toast svg{flex:none;width:18px;height:18px}.cm-toast span{white-space:pre-line}'
  +'.cm-toast.err{background:#fff;color:#a3261b;border:1px solid #f0c4bf}.cm-toast button{flex:none;border:0;background:none;color:inherit;opacity:.75;cursor:pointer;padding:2px;display:grid;place-items:center;font:inherit}.cm-toast button:hover{opacity:1}.cm-toast .u{color:#9cc0f0;font-weight:700;opacity:1}';
 (document.head||document.documentElement).append(tcss);
 const OKI='<svg viewBox="0 0 24 24" fill="none" stroke="#7fd39a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',ERI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/></svg>',XI='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
 function toastHere(text,o={}){const err=o.type?o.type==='error':isErr(text);let box=document.querySelector('.cm-toasts');if(!box){box=document.createElement('div');box.className='cm-toasts';box.setAttribute('role','status');box.setAttribute('aria-live','polite');(document.body||document.documentElement).append(box)}
  const t=document.createElement('div');t.className='cm-toast'+(err?' err':'');t.innerHTML=(err?ERI:OKI)+'<span></span>';t.querySelector('span').textContent=String(text??'');
  const close=()=>{t.classList.remove('in');setTimeout(()=>t.remove(),200)};
  if(o.undo){const u=document.createElement('button');u.type='button';u.className='u';u.textContent=o.undoLabel||'Rückgängig';u.onclick=()=>{close();try{o.undo()}catch{}};t.append(u)}
  if(err||o.sticky){const x=document.createElement('button');x.type='button';x.setAttribute('aria-label','Schließen');x.innerHTML=XI;x.onclick=close;t.append(x)}
  box.append(t);while(box.children.length>3)box.firstChild.remove();requestAnimationFrame(()=>t.classList.add('in'));
  if(!(err||o.sticky))setTimeout(close,Math.min(6000,2600+String(text).length*35));return t}
 window.classroomToast=(text,o={})=>{try{if(window.top!==window&&window.top.classroomToast&&window.top.document.body)return window.top.classroomToast(text,o)}catch{}return toastHere(text,o)};
 const short=t=>{t=String(t??'');return t.length<=170&&t.split('\n').filter(Boolean).length<=2&&!/\n\s*\n/.test(t)};
 window.classroomAlert=(text,opts={})=>{if(!opts.dialog&&short(text)){window.classroomToast(text,opts);return Promise.resolve()}return open('alert',text,opts)};
 window.classroomConfirm=(text,opts)=>open('confirm',text,opts);
 window.classroomPrompt=(text,value='',opts={})=>open('prompt',text,{...opts,value});
 window.alert=text=>{if(!document.body){nativeAlert(text);return}window.classroomAlert(text)};
})();
/* Datenschutzmodus (zum Vorführen): Namen unscharf, Bewertungen unleserlich mit Zufallsfarben ohne Bezug zur echten Bewertung.
   Gilt für App, Noten- und Unterrichts-Manager; endet mit dem Schließen der App (sessionStorage). Ändert keine Daten.
   Drucken, Export, Backup und Abgleich sind gesperrt, Kopieren ebenfalls; Bewertungs- und Namensfelder sind nicht bedienbar. */
(()=>{
 if(window.classroomPrivacy)return;
 const KEY='classroom-privacy-v1',top=window.parent===window;
 const read=()=>{try{const v=JSON.parse(sessionStorage.getItem(KEY)||'null');return v&&v.on?v:null}catch{return null}};
 const PAL=['#5fcf91','#b9e08f','#fff36b','#f6d36b','#e6877d','#c8635e'];
 // Namen: Text unscharf (Schatten statt Schrift), Felder bleiben scharf umrandet.
 const NAME='html.classroom-privacy :is(input[type=text],input:not([type]),input[type=search],textarea):not(.lu-q):not(.task-name-input):not(.task-label-input):not([data-exam-topic-field]):not(.help-search):not([data-test-name]):not([name=testPass]):not(.ui-dialog input)';
 const T=':is(.task-table,.homework-table,.compact-entry-table,.test-detail-results)';
 const CELL=':is(span,input,select,button,label):not(.task-remove):not(.student-remove-button):not(.task-add-button):not(:has(*))';
 const GRADE='html.classroom-privacy '+T+' tbody td:not(:first-child) '+CELL+',html.classroom-privacy '+T+' tbody .task-end-grade,html.classroom-privacy .so-val';
 function css(seed){
  /* 8.21: echte Zufallsfarben je Einschalten (Zufallsgenerator mit großem Startwert statt nur 5 verschobener Muster) */
  let t=(seed>>>0)||1;const rnd=()=>{t+=0x6D2B79F5;let x=Math.imul(t^t>>>15,t|1);x^=x+Math.imul(x^x>>>7,x|61);return ((x^x>>>14)>>>0)/4294967296},pick=()=>PAL[Math.floor(rnd()*5)];
  let rules=NAME+','+NAME+'::placeholder,html.classroom-privacy '+T+' tbody :is(td,th):first-child,html.classroom-privacy .room-grid .cell,html.classroom-privacy .classroom-quick-heading,html.classroom-privacy .student-finder-list,html.classroom-privacy #randomStudentStatus,html.classroom-privacy .student-overview .so-list ol,html.classroom-privacy .student-overview .so-list ol *,html.classroom-privacy .student-overview .so-profile :is(h2,h3,p,span,td,th,li,strong,em),html.classroom-privacy [data-parent-mail-student]{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.75)!important;-webkit-user-select:none!important;user-select:none!important}'
  +'html.classroom-privacy '+T+' tbody :is(td,th):first-child :is(input,button),html.classroom-privacy [data-student-name]{pointer-events:none!important}'
  +GRADE+'{box-shadow:none!important;outline:0!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:0 0 8px rgba(36,51,71,.6)!important;background-image:none!important;border-color:transparent!important;pointer-events:none!important;filter:saturate(.8)}'
  +'html.classroom-privacy '+T+' tbody td{color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.6)!important;background-color:transparent!important;background-image:none!important}'
  /* 9.88: auch gesperrte („Zurückgegeben“) und farblose Felder – dort setzt eine eigene Regel Text- und Füllfarbe; Platzhalter ebenso */
  +'html.classroom-privacy body[data-module] [class*=participation-between-]:not(#_):not(#__){box-shadow:none!important;background-image:none!important}'
  +'html.classroom-privacy '+T+' tbody td:not(:first-child) :is(input,select)::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important}'
  +'html.classroom-privacy .test-rating-symbol svg,html.classroom-privacy '+T+' tbody td:not(:first-child) svg{opacity:0!important}'
  +'html.classroom-privacy .room-grid .cell{background-image:none!important}html.classroom-privacy .room-grid .cell::after,html.classroom-privacy .room-grid .cell::before{display:none!important}'
  +'html.classroom-privacy .room-grid .cell.besetzt{pointer-events:none!important}';
  // Zufallsfarben: Muster aus Zeilen- und Spaltenposition, je Einschalten neu gemischt.
  for(let r=0;r<7;r++)for(let c=0;c<4;c++)rules+='html.classroom-privacy '+T+' tbody tr:nth-child(7n+'+(r+1)+') td:nth-child(4n+'+(c+1)+'):not(:first-child) '+CELL+',html.classroom-privacy '+T+' tbody tr:nth-child(7n+'+(r+1)+') td:nth-child(4n+'+(c+1)+'):not(:first-child) .task-end-grade{background-color:'+pick()+'!important}';
  // Sitzplan: jeder besetzte Tisch eine Zufallsfarbe (aus Reihe, Spalte und Mischwert), unabhängig von Bewertung, Hausaufgaben-Rahmen und Hinweisen;
  // Namen auch auf bewerteten Tischen unscharf.
  rules+='html.classroom-privacy body .room-grid .cell.cell.besetzt,html.classroom-privacy body .room-grid .cell.cell.besetzt *{color:transparent!important;text-shadow:0 0 8px rgba(36,51,71,.75)!important;text-decoration:none!important}'
   +'html.classroom-privacy body .room-grid .cell.cell.besetzt{background-image:none!important;border:1px solid transparent!important;box-shadow:none!important;outline:0!important}';
  for(let r=0;r<10;r++)for(let c=0;c<10;c++){let h=Math.imul(((r+1)*73856093)^((c+1)*19349663)^((seed+1)*83492791),2654435761);h=(h^(h>>>15))>>>0;h=(h>>>7)%5;rules+='html.classroom-privacy body .room-grid .cell.cell.besetzt[data-row="'+r+'"][data-col="'+c+'"]{background:'+PAL[h%5]+'!important}'}
  for(let j=0;j<3;j++)for(let k=0;k<5;k++)rules+='html.classroom-privacy .so-section:nth-of-type(3n+'+(j+1)+') :nth-child(5n+'+(k+1)+')>.so-val,html.classroom-privacy .so-section:nth-of-type(3n+'+(j+1)+') .so-val:nth-child(5n+'+(k+1)+'){background-color:'+pick()+'!important}';
  // iPhone-Karten und Detailblatt (Noten): Namen unscharf, Noten unkenntlich mit Zufallsfarben
  rules+='html.classroom-privacy :is(.qs-name,.qd-title b,.qs-stand,.qs-note,.tt-row b,.tt-last b){color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.75)!important;-webkit-user-select:none!important;user-select:none!important}'
   +'html.classroom-privacy :is(.qs-big,.qs-val i,.qs-sq i,.qs-q1chip i,.qs-miss-n,.qs-chip i){color:transparent!important;text-shadow:0 0 8px rgba(36,51,71,.6)!important;background-image:none!important;box-shadow:none!important;border-color:transparent!important}'
   +'html.classroom-privacy :is(.qs-card,.qd-panel){pointer-events:none!important}html.classroom-privacy .qd-head{pointer-events:auto!important}'
   /* 11.25: iPhone quer – Namensliste links und Übersicht rechts (.qsl) ebenfalls unkenntlich */
   +'html.classroom-privacy :is(.qsl-it b,.qsl-sec h4 b){color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.75)!important;-webkit-user-select:none!important;user-select:none!important}'
   +'html.classroom-privacy .qsl-m{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:0 0 8px rgba(36,51,71,.6)!important;background-image:none!important;box-shadow:none!important;border-color:transparent!important}'
   +'html.classroom-privacy :is(.qsl-it,.qsl-sec){pointer-events:none!important}';
  for(let a=0;a<5;a++)for(let c=0;c<4;c++)rules+='html.classroom-privacy .qsl-sec:nth-of-type(5n+'+(a+1)+') .qsl-row:nth-child(4n+'+(c+1)+') .qsl-m{background-color:'+pick()+'!important}';
  for(let a=0;a<7;a++)rules+='html.classroom-privacy .qsl-it:nth-child(7n+'+(a+1)+') .qs-big,html.classroom-privacy .qsl-sec:nth-of-type(7n+'+(a+1)+') h4 .qs-big{background-color:'+pick()+'!important;box-shadow:none!important;border-color:transparent!important}';
  for(let a=0;a<5;a++){rules+='html.classroom-privacy .qs-card:nth-child(5n+'+(a+1)+') .qs-big,html.classroom-privacy .qs-card:nth-child(5n+'+(a+1)+') .qs-q1chip i{background-color:'+pick()+'!important}';
   for(let c=0;c<4;c++)rules+='html.classroom-privacy .qs-card:nth-child(5n+'+(a+1)+') .qs-sect:nth-child(4n+'+(c+1)+') .qs-val i:not(.qs-none),html.classroom-privacy .qd-sec:nth-child(5n+'+(a+1)+') .qd-item:nth-child(4n+'+(c+1)+') .qd-val,html.classroom-privacy .qd-sec:nth-child(5n+'+(a+1)+') .qd-row:nth-child(4n+'+(c+1)+') .qd-val{background-color:'+pick()+'!important}'
    +'html.classroom-privacy .qs-card:nth-child(5n+'+(a+1)+') .qs-sq:nth-child(4n+'+(c+1)+') i:not(.qs-x){background-color:'+pick()+'!important}'}
  return rules;
 }
 let style=null;
 function apply(state){
  const on=!!state;document.documentElement.classList.toggle('classroom-privacy',on);
  if(on){if(!style){style=document.createElement('style');style.dataset.privacy='';document.head.append(style)}style.textContent=css(state.seed||0)}else if(style){style.textContent=''}
  if(top)renderTop(on);
 }
 const BLOCK=/^(drucken|drucken …|backup|excel.*|export.*|abgleich senden|abgleich einlesen|jetzt teilen|als excel.*|pdf.*|word.*)$/i;
 const say=()=>{(window.classroomAlert||alert)('Im Datenschutzmodus nicht verfügbar. Bitte den Datenschutzmodus zuerst ausschalten.')};
 document.addEventListener('click',e=>{if(!document.documentElement.classList.contains('classroom-privacy'))return;const b=e.target.closest?.('button,a,[role=menuitem]');if(!b)return;const t=(b.textContent||'').replace(/\s+/g,' ').trim();if(BLOCK.test(t)||b.id==='classroomBackupButton'||b.id==='classroomQuickBackup'||b.id==='classroomQuickRestore'||b.id==='classroomRestoreUndoButton'||b.matches('.cr-undo')||b.matches('.page-print-button,[data-print],#exportButton')){e.preventDefault();e.stopImmediatePropagation();say()}},true);
 document.addEventListener('copy',e=>{if(document.documentElement.classList.contains('classroom-privacy'))e.preventDefault()},true);
 const nativePrint=window.print?.bind(window);window.print=function(){if(document.documentElement.classList.contains('classroom-privacy'))return say();return nativePrint?.()};
 window.addEventListener('message',e=>{if(e.data?.type==='classroom:privacy')apply(e.data.state)});
 // Oberfläche nur im Hauptfenster: Button neben „?“ und Hinweis oben.
 let button=null,banner=null;
 function renderTop(on){
  const actions=document.querySelector('.classroom-global-actions');
  if(actions&&!button){button=document.createElement('button');button.type='button';button.className='classroom-privacy-button';button.title='Datenschutzmodus: Namen unscharf, Bewertungen unkenntlich (zum Vorführen)';button.setAttribute('aria-pressed','false');
   button.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="privacy-slash" d="M3 21L21 3"/></svg>';button.setAttribute('aria-label','Datenschutzmodus');
   button.onclick=()=>toggle();}
  if(actions&&button){const help=actions.querySelector('.classroom-help-button');if(help&&help.nextElementSibling!==button)help.after(button);else if(!help&&!button.isConnected)actions.prepend(button)}
  if(button){/* 9.75: nur bei Änderung schreiben */if(button.getAttribute('aria-pressed')!==String(on))button.setAttribute('aria-pressed',String(on));button.classList.toggle('is-on',on);const slash=button.querySelector('.privacy-slash'),disp=on?'':'none';if(slash&&slash.style.display!==disp)slash.style.display=disp;const t=on?'Datenschutzmodus ist aktiv – klicken zum Beenden':'Datenschutzmodus: Namen unscharf, Bewertungen unkenntlich (zum Vorführen)';if(button.title!==t)button.title=t}
  if(on&&!banner){banner=document.createElement('div');banner.className='classroom-privacy-banner';banner.setAttribute('role','status');banner.textContent='Datenschutzmodus aktiv – Namen unscharf, Farben zufällig';document.body.append(banner)}
  if(!on&&banner){banner.remove();banner=null}
 }
 function broadcast(state){for(const f of document.querySelectorAll('iframe'))try{f.contentWindow.postMessage({type:'classroom:privacy',state},'*')}catch{}}
 function toggle(force){const now=read(),on=force===undefined?!now:!!force;const state=on?{on:true,seed:(()=>{let v;do{v=1+Math.floor(Math.random()*2147483646)}while(v===read()?.seed);return v})()}:null;try{state?sessionStorage.setItem(KEY,JSON.stringify(state)):sessionStorage.removeItem(KEY)}catch{}apply(state);broadcast(state)}
 window.classroomPrivacy={toggle,active:()=>!!read()};
 const start=()=>{apply(read());if(top){renderTop(!!read());let tries=0;const iv=setInterval(()=>{renderTop(!!read());const a=document.querySelector('.classroom-global-actions');if(a&&!a.__privacyWatch){a.__privacyWatch=true;new MutationObserver(()=>renderTop(!!read())).observe(a,{childList:true})}if(++tries>20)clearInterval(iv)},500);document.querySelectorAll('iframe').forEach(f=>f.addEventListener('load',()=>{const s=read();if(s)try{f.contentWindow.postMessage({type:'classroom:privacy',state:s},'*')}catch{}}))}};
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
 if(top){const st=document.createElement('style');st.textContent='.classroom-global-actions>.classroom-privacy-button{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:40px;min-width:40px;padding:0!important;flex:none}.classroom-global-actions>.classroom-privacy-button svg{width:20px;height:20px}.classroom-global-actions>.classroom-privacy-button.is-on{background:#2f5f9b!important;color:#fff!important;border-color:#2f5f9b!important}'
  +'.classroom-privacy-banner{position:fixed;left:50%;top:6px;transform:translateX(-50%);z-index:9000;max-width:calc(100vw - 24px);box-sizing:border-box;padding:5px 14px;border-radius:999px;background:#2f5f9b;color:#fff;font:600 13px/1.3 ui-sans-serif,system-ui,-apple-system,sans-serif;text-align:center;box-shadow:0 4px 12px #233d6033;pointer-events:none}'
  +'@media screen and (max-width:540px) and (orientation:portrait){.app-header .classroom-global-actions:has(>.classroom-privacy-button){grid-template-columns:42px 42px minmax(0,1fr) minmax(0,1fr)!important}.app-header .classroom-global-actions>.classroom-privacy-button{order:-1;width:42px!important;padding:0!important}.app-header .classroom-global-actions>.classroom-help-button{order:-2}}'
  /* iPhone: Hinweis über der unteren Leiste statt hinter der Kopfzeile */
  +'@media (max-width:540px) and (orientation:portrait) and (pointer:coarse),(max-height:500px) and (orientation:landscape) and (pointer:coarse){.classroom-privacy-banner{top:auto;bottom:calc(84px + env(safe-area-inset-bottom));font-size:11px;white-space:nowrap;padding:5px 12px}}'
  /* 11.25: iPhone quer – die Leiste ist links, der Hinweis gehört ganz nach unten (nicht über den Inhalt) */+'@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){.classroom-privacy-banner{bottom:calc(6px + env(safe-area-inset-bottom))}}'
  +'@media print{.classroom-privacy-banner{display:none}}';(document.head||document.documentElement).append(st)}
})();
/* 13.16: Ein Dialog-Stil für alle Fenster – Kopf mit Titel (Teil nach dem ersten „ · “ als Unterzeile) und ×,
   Fußleiste mit Trennlinie über die ganze Breite: links Neben-Aktionen, rechts Abbrechen + Hauptaktion (dunkelblau, Löschen rot). */
(()=>{
 if(window.__cmDlgStyle)return;window.__cmDlgStyle=1;const P=window.HTMLDialogElement&&HTMLDialogElement.prototype;if(!P||!P.showModal)return;
 const SKIP='.settings-dialog,.cn-dialog,.ew-dialog,#einOrd,.rdr,.vt-full,.vt-big-dlg,[data-nocmd]';
 const css=document.createElement('style');css.textContent=
  'dialog.cmd{position:fixed;overflow:auto}dialog.cmd .cmd-x{position:absolute;top:14px;right:14px;width:34px;height:34px;min-height:0;padding:0;border:0;border-radius:999px;background:#eef2f8;color:#66758a;display:grid;place-items:center;cursor:pointer;z-index:3;box-shadow:none}'
  +'dialog.cmd .cmd-x:hover{background:#e2e8f2;color:#243247}dialog.cmd .cmd-x svg{width:16px;height:16px}'
  +'dialog.cmd .cmd-t{padding-right:44px!important;font-size:1.15rem!important;font-weight:750!important;line-height:1.3!important;color:#243247}dialog.cmd .cmd-t small{display:block;font-size:.86rem;font-weight:500;color:#66758a;margin-top:3px}'
  +'dialog.cmd .cmd-f{display:flex!important;flex-wrap:wrap;align-items:center;gap:8px;border-top:1px solid #e6ebf3;background:#fafbfd;box-sizing:border-box}'
  +'dialog.cmd .cmd-f>button,dialog.cmd .cmd-f>a{min-height:40px}dialog.cmd .cmd-f .cmd-pri{background:#2f5f9b!important;border-color:#2f5f9b!important;color:#fff!important}';
 (document.head||document.documentElement).append(css);
 const X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
 const PRI=/(^|\s)(pri|ui-primary|ui-danger|primary|vt-pri|btn-primary|danger|del|vt-danger)(\s|$)/;
 function deco(d){if(!d||d.matches(SKIP)||d.closest(SKIP))return;const root=d.querySelector(':scope>form')||d;
  const head=[...root.children].find(e=>/^H[23]$/.test(e.tagName));const foot=root.lastElementChild;
  const isFoot=foot&&foot!==head&&(foot.matches('.dialog-actions,.acts,.ui-dialog-actions,.vt-actions,.row')||(foot.querySelectorAll(':scope>button').length>=1&&foot.children.length===foot.querySelectorAll(':scope>button,:scope>span,:scope>a').length));
  if(!head)return;d.__cmdBusy=1;d.classList.add('cmd');
  if(!head.classList.contains('cmd-t')){head.classList.add('cmd-t');const t=head.textContent,i=t.indexOf(' · ');if(i>0&&!head.querySelector('*')){head.textContent=t.slice(0,i);const sm=document.createElement('small');sm.textContent=t.slice(i+3);head.append(sm)}}
  if(!d.querySelector(':scope>.cmd-x')){const b=document.createElement('button');b.type='button';b.className='cmd-x';b.setAttribute('aria-label','Schließen');b.title='Schließen (Esc)';b.innerHTML=X;
   b.onclick=e=>{e.preventDefault();e.stopPropagation();const ev=new Event('cancel',{cancelable:true});d.dispatchEvent(ev);if(!ev.defaultPrevented&&d.open)d.close()};d.prepend(b)}
  if(isFoot&&getComputedStyle(foot).position!=='sticky'){const cs=getComputedStyle(d),fs=getComputedStyle(root),pl=(parseFloat(cs.paddingLeft)||0)+(root!==d?parseFloat(fs.paddingLeft)||0:0),pr=(parseFloat(cs.paddingRight)||0)+(root!==d?parseFloat(fs.paddingRight)||0:0),pb=(parseFloat(cs.paddingBottom)||0)+(root!==d?parseFloat(fs.paddingBottom)||0:0);
   foot.classList.add('cmd-f');Object.assign(foot.style,{marginLeft:-pl+'px',marginRight:-pr+'px',marginBottom:-pb+'px',paddingLeft:Math.max(pl,18)+'px',paddingRight:Math.max(pr,18)+'px',paddingTop:'14px',paddingBottom:Math.max(14,pb>0?14:14)+'px',marginTop:foot.style.marginTop||'18px'});
   const bs=[...foot.querySelectorAll(':scope>button')];if(bs.length&&!bs.some(b=>PRI.test(b.className))){const last=bs[bs.length-1];if(/^(Schließen|Fertig|OK|Übernehmen|Speichern)$/.test(last.textContent.trim()))last.classList.add('cmd-pri')}}
  setTimeout(()=>{d.__cmdBusy=0},0)}
 const watch=d=>{if(d.__cmdObs)return;d.__cmdObs=new MutationObserver(()=>{if(d.__cmdBusy||!d.open)return;clearTimeout(d.__cmdT);d.__cmdT=setTimeout(()=>deco(d),0)});d.__cmdObs.observe(d,{childList:true,subtree:false});const f=d.querySelector(':scope>form');if(f)d.__cmdObs.observe(f,{childList:true})};
 const sm=P.showModal;P.showModal=function(){const r=sm.apply(this,arguments);try{deco(this);watch(this)}catch(e){}return r};
 window.classroomDialogStyle=deco;
})();
;

/* ==== hooks.js ==== */
/* Zentrale Erweiterungspunkte (Noten-Manager und Unterrichts-Manager).
   Statt dass jedes Zusatzmodul eine Grundfunktion (setPage, renderTasksPage, …) selbst umhüllt, meldet es hier
   seine Ergänzung an. Vorteile: eine feste, nachvollziehbare Reihenfolge, ein Fehler in einem Modul bricht die
   übrigen nicht ab, und classroomHooks.list() zeigt jederzeit, wer sich wo eingehängt hat.

   Reihenfolge (entspricht genau den früheren Hüllen; später geladene Module lagen „außen“):
   - before(args):     läuft vor der Grundfunktion – zuletzt angemeldete zuerst.
   - intercept(args):  darf übernehmen; gibt er {handled:true,value} zurück, entfallen die Grundfunktion sowie
                       before/after aller früher angemeldeten Ergänzungen – später angemeldete after laufen weiter.
   - after(result,args): läuft nach der Grundfunktion – zuerst angemeldete zuerst; Rückgabe ≠ undefined ersetzt das Ergebnis.
   - always(args):     läuft zum Schluss immer, auch wenn unterwegs ein Fehler auftrat (wie „finally“). */
(()=>{
 if(window.classroomHooks)return;
 const table={};
 const report=(name,label,e)=>{console.error('Erweiterung „'+label+'“ an '+name+':',e);try{window.classroomLogError?.(e)}catch{}};
 function install(name){
  if(table[name])return table[name];
  const original=window[name];if(typeof original!=='function')throw new Error('classroomHooks: '+name+' ist keine Funktion');
  const entry={name,original,hooks:[]};table[name]=entry;
  window[name]=function(...args){
   const hooks=entry.hooks;let start=0,value,handled=false;
   // before/intercept von außen (zuletzt angemeldet) nach innen
   for(let i=hooks.length-1;i>=0;i--){const h=hooks[i];
    if(h.intercept){let r;try{r=h.intercept.apply(this,args)}catch(e){report(name,h.label,e)}if(r&&r.handled){handled=true;value=r.value;start=i+1;break}}
    if(h.before){try{h.before.apply(this,args)}catch(e){report(name,h.label,e)}}}
   try{
    if(!handled)value=entry.original.apply(this,args);
    // after von innen nach außen; bei Übernahme nur die später angemeldeten
    for(let i=start;i<hooks.length;i++){const h=hooks[i];if(!h.after)continue;try{const r=h.after.call(this,value,args);if(r!==undefined)value=r}catch(e){report(name,h.label,e)}}
   }finally{for(let i=start;i<hooks.length;i++){const h=hooks[i];if(h.always){try{h.always.apply(this,args)}catch(e){report(name,h.label,e)}}}}
   return value};
  return entry}
 window.classroomHooks={
  add(name,label,spec){const entry=install(name);entry.hooks.push({label,...spec});return entry},
  list(){return Object.fromEntries(Object.entries(table).map(([k,v])=>[k,v.hooks.map(h=>h.label+' ['+['intercept','before','after','always'].filter(x=>h[x]).join('+')+']')]))}
 };
})();
;

/* ==== sitzplan/seat-rename.js ==== */
/* 8.30: Umbenannte Personen in allen gespeicherten Sitzplänen nachziehen (aktueller Plan, Räume, datierte Versionen, Paare/Tabu).
   Läuft beim Laden, also auch nach dem Wiederherstellen eines Backups auf einem anderen Gerät, und vor jedem Zeichnen des Rasters.
   Grundlage: frühere Namen in der gemeinsamen Klassenliste (formerNames). Ohne diese Angabe (ältere Umbenennungen) wird ein Name nur
   ersetzt, wenn genau eine Person der Klasse fast gleich heißt (höchstens 2 Buchstaben anders) und noch keinen Platz in diesem Plan hat. */
(()=>{
 const norm=n=>String(n||'').trim().toLowerCase(),TOK=new Set(['','X','PULT']);
 const dist=(a,b)=>{if(Math.abs(a.length-b.length)>2)return 9;let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const q=[i];let m=i;for(let j=1;j<=b.length;j++){q[j]=Math.min(p[j]+1,q[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));if(q[j]<m)m=q[j]}if(m>2)return 9;p=q}return p[b.length]};
 const readJ=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
 /* 11.99: normierte Namen einmal vorab statt bei jedem Vergleich */function prep(group){const active=(group?.students||[]).filter(s=>!s.deleted&&norm(s.name));const activeN=active.map(p=>[p,norm(p.name)]);const cur=new Set(active.map(s=>norm(s.name))),gone=new Set((group?.students||[]).filter(s=>s.deleted).map(s=>norm(s.name))),map=new Map();
  for(const p of active)for(const f of p.formerNames||[])if(!cur.has(norm(f)))map.set(norm(f),p.name);return {active,activeN,cur,gone,map}}
 function target(v,P,present){const n=norm(v);if(typeof v!=='string'||TOK.has(v.trim().toUpperCase())||P.cur.has(n)||P.gone.has(n))return null;
  let to=P.map.get(n);if(!to&&n.length>=6){const c=P.activeN.filter(([,pn])=>!(present&&present.has(pn))&&dist(n,pn)<=2);if(c.length===1)to=c[0][0].name}
  return to&&!(present&&present.has(norm(to)))?to:null}
 function fixGrid(grid,P){if(!Array.isArray(grid)||!grid.length||!grid.every(Array.isArray))return false;const present=new Set(grid.flat().filter(v=>typeof v==='string').map(norm));let ch=false;
  for(const row of grid)for(let i=0;i<row.length;i++){const to=target(row[i],P,present);if(to){row[i]=to;present.add(norm(to));ch=true}}return ch}
 function fixPairs(list,P){let ch=false;if(Array.isArray(list))for(const p of list)for(const f of ['s1','s2']){const to=p&&target(p[f],P,null);if(to){p[f]=to;ch=true}}return ch}
 function fixRoom(r,P){let ch=fixGrid(r?.grid,P);for(const x of r?.people||[]){const to=target(x?.name,P,null);if(to){if(x.id===x.name)x.id=to;x.name=to;ch=true}}
  if(r?.anchors&&typeof r.anchors==='object')for(const k of Object.keys(r.anchors)){const to=target(k,P,null);if(to&&!(to in r.anchors)){r.anchors[to]=r.anchors[k];delete r.anchors[k];ch=true}}return ch}
 const prefix=name=>'sitzplan_'+name.replace(/\s+/g,'_')+'_';
 /* Gespeicherte Daten aller verknüpften Klassen */
 function fixStorage(model){if(!model?.classes)return 0;const links=readJ('classroom-manager-linked-classes-v1',{});let n=0;
  const rooms=readJ('sitzplan_rooms_v1',{}),dated=readJ('sitzplan_dated_layouts_v1',{});let rCh=false,dCh=false;
  for(const group of model.classes){const sn=links[group.id]?.storageName;if(!sn)continue;const P=prep(group);if(!P.active.length)continue;const pre=prefix(sn);
   const g=readJ(pre+'grid',null);if(fixGrid(g,P)){localStorage.setItem(pre+'grid',JSON.stringify(g));n++}
   for(const f of ['paare','tabu']){const l=readJ(pre+f,null);if(fixPairs(l,P)){localStorage.setItem(pre+f,JSON.stringify(l));n++}}
   for(const r of rooms[sn]?.rooms||[])if(fixRoom(r,P)){rCh=true;n++}
   for(const [k,days] of Object.entries(dated))if(k===sn||k.startsWith(sn+'::room::'))for(const vs of Object.values(days||{}))for(const v of Array.isArray(vs)?vs:[vs])if(fixGrid(v?.grid,P)){dCh=true;n++}}
  try{if(rCh)localStorage.setItem('sitzplan_rooms_v1',JSON.stringify(rooms));if(dCh)localStorage.setItem('sitzplan_dated_layouts_v1',JSON.stringify(dated))}catch{}return n}
 try{fixStorage(readJ('classroom-manager-common-v2',null))}catch(e){window.classroomLogError?.('Sitzplan: Namen nachziehen ('+e.message+')','seat-rename.js')}
 /* Laufende Sitzung: angezeigtes Raster vor dem Zeichnen prüfen (z. B. beim Öffnen einer älteren Version) */
 window.classroomSeatRenameFix=()=>{try{const group=typeof classroomCurrentGroup==='function'&&classroomCurrentGroup();if(!group)return;const P=prep(group);
  if(typeof gridData!=='undefined'&&fixGrid(gridData,P)){try{localStorage.setItem(prefix(aktuelleKlasse)+'grid',JSON.stringify(gridData))}catch{}}
  if(typeof schuelerPaare!=='undefined')fixPairs(schuelerPaare,P);if(typeof tabuPaare!=='undefined')fixPairs(tabuPaare,P)}catch{}};
 /* 9.92: nur wenn sich die gemeinsame Klassenliste geändert hat (Umbenennungen kommen nur von dort) */let lastModel=null;
 window.classroomSeatRenameStorage=()=>{try{const raw=localStorage.getItem('classroom-manager-common-v2');if(raw===lastModel)return 0;lastModel=raw;return fixStorage(raw?JSON.parse(raw):null)}catch{return 0}};
 addEventListener('DOMContentLoaded',()=>{try{classroomHooks.add('initGrid','seat-rename: Namen nachziehen',{before(){window.classroomSeatRenameFix()}})}catch{}});
})();
;

/* ==== sitzplan/index.html (eingebettet) ==== */

        const COLS = 10;
        const ROWS = 10;
        const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const TISCHANORDNUNGEN = [
            {id: 'drei-reihen', name: '3 ganze Reihen', description: 'Drei Reihen mit je zehn Tischen', capacity: 30},
            {id: 'mittelgang', name: '3 Reihen mit Mittelgang', description: 'Drei Reihen mit einem breiten Mittelgang', capacity: 24},
            {id: 'vier-reihen', name: '4 ganze Reihen', description: 'Vier durchgängige Reihen mit je zehn Tischen', capacity: 40},
            {id: 'vier-mittelgang', name: '4 Reihen mit Mittelgang', description: 'Vier Reihen mit einem breiten Mittelgang', capacity: 24},
            {id: 'fuenf-reihen', name: '5 ganze Reihen', description: 'Fünf durchgängige Reihen mit je zehn Tischen', capacity: 50},
            {id: 'u-mitte', name: 'U-Form mit Mitte', description: 'U-Form mit vier Doppeltischen in der Mitte', capacity: 27},
            {id: 'zwei-gruppen', name: '2 Gruppen', description: 'Zwei seitliche Tischgruppen', capacity: 30},
            {id: 'drei-gruppen', name: '3 Gruppen', description: 'Zwei Gruppen oben und eine mittige Gruppe unten', capacity: 30},
            {id: 'gruppen', name: '4 Gruppen', description: 'Vier Gruppen mit jeweils sieben bis acht Tischen', capacity: 30},
            {id: 'fuenf-gruppen', name: '5 Gruppen', description: 'Fünf Gruppen mit je sechs Tischen', capacity: 30},
            {id: 'sechs-gruppen', name: '6 Gruppen', description: 'Sechs Gruppen mit je fünf Tischen', capacity: 30}
        ];
        const erstelleTischgruppe = (spalten, reihen, anzahl = spalten.length * reihen.length) =>
            reihen.flatMap(r => spalten.map(c => [r, c])).slice(0, anzahl);
        const TISCHGRUPPEN = {
            'zwei-gruppen': [
                erstelleTischgruppe([1, 2, 3], [2, 3, 4, 5, 6]),
                erstelleTischgruppe([6, 7, 8], [2, 3, 4, 5, 6])
            ],
            'drei-gruppen': [
                erstelleTischgruppe([0, 1, 2], [0, 1, 2, 3]),
                erstelleTischgruppe([7, 8, 9], [0, 1, 2]),
                erstelleTischgruppe([3, 4, 5], [5, 6, 7])
            ],
            'gruppen': [
                erstelleTischgruppe([1, 2, 3], [1, 2, 3]),
                erstelleTischgruppe([6, 7, 8], [1, 2, 3]),
                erstelleTischgruppe([1, 2, 3], [5, 6, 7]),
                erstelleTischgruppe([6, 7, 8], [5, 6, 7])
            ],
            'fuenf-gruppen': [
                erstelleTischgruppe([0, 1], [1, 2, 3]),
                erstelleTischgruppe([4, 5], [1, 2, 3]),
                erstelleTischgruppe([8, 9], [1, 2, 3]),
                erstelleTischgruppe([2, 3], [5, 6, 7]),
                erstelleTischgruppe([6, 7], [5, 6, 7])
            ],
            'sechs-gruppen': [
                erstelleTischgruppe([1, 2], [1, 2, 3], 5),
                erstelleTischgruppe([4, 5], [1, 2, 3], 5),
                erstelleTischgruppe([7, 8], [1, 2, 3], 5),
                erstelleTischgruppe([1, 2], [5, 6, 7], 5),
                erstelleTischgruppe([4, 5], [5, 6, 7], 5),
                erstelleTischgruppe([7, 8], [5, 6, 7], 5)
            ]
        };
        const FARBEN_TISCHGRUPPEN = [
            {fill: '#bfdbfe', stroke: '#3b82f6', text: '#1e3a8a'},
            {fill: '#bbf7d0', stroke: '#22c55e', text: '#14532d'},
            {fill: '#fed7aa', stroke: '#f97316', text: '#7c2d12'},
            {fill: '#ddd6fe', stroke: '#8b5cf6', text: '#4c1d95'},
            {fill: '#fecdd3', stroke: '#f43f5e', text: '#881337'},
            {fill: '#99f6e4', stroke: '#14b8a6', text: '#134e4a'}
        ];

        const BEISPIELKLASSEN = {
            'Klasse 7a': [
                ['Mia', 'w'], ['Emma', 'w'], ['Hanna', 'w'], ['Lina', 'w'], ['Lea', 'w'],
                ['Mila', 'w'], ['Ella', 'w'], ['Clara', 'w'], ['Nora', 'w'], ['Lotta', 'w'],
                ['Ben', 'm'], ['Finn', 'm'], ['Leon', 'm'], ['Paul', 'm'], ['Jonas', 'm'],
                ['Emil', 'm'], ['Noah', 'm'], ['Theo', 'm'], ['Luis', 'm'], ['Oskar', 'm'],
                ['Leni', 'w'], ['Ida', 'w'], ['Amelie', 'w'], ['Felix', 'm'], ['Anton', 'm']
            ],
            'Klasse 9b': [
                ['Lena', 'w'], ['Marie', 'w'], ['Sophie', 'w'], ['Lara', 'w'], ['Emily', 'w'],
                ['Emilia', 'w'], ['Nele', 'w'], ['Jule', 'w'], ['Frida', 'w'], ['Johanna', 'w'],
                ['Sarah', 'w'], ['Laura', 'w'], ['Pia', 'w'], ['Greta', 'w'], ['Maja', 'w'],
                ['Leon', 'm'], ['Elias', 'm'], ['Ben', 'm'], ['Luca', 'm'], ['Emil', 'm'],
                ['Mats', 'm'], ['Moritz', 'm'], ['Tim', 'm'], ['David', 'm'], ['Felix', 'm'],
                ['Paul', 'm'], ['Jonas', 'm'], ['Finn', 'm'], ['Max', 'm'], ['Anton', 'm']
            ]
        };
        
        let aktuelleKlasse = "Klasse 7a";
        let klassenListe = ["Klasse 7a", "Klasse 9b"];
        
        let gridData = [];
        let gridGroupData = [];
        let schuelerEinzel = [];
        let schuelerPaare = [];
        let tabuPaare = [];
        let tischZiehenAktiv = false;
        let tischZiehWert = null;
        const MAX_UNDO_STEPS = 50;
        let undoGridHistory = [];
        let undoGroupHistory = [];
        let ausgewaehlteAnordnung = null;
        let layoutViewMode = 'layouts';
        let zufallsAuswahl = null;
        const EIGENE_TISCHANORDNUNGEN_KEY = 'sitzplan_eigene_tischanordnungen';
        let eigeneTischanordnungen = [];
        let suchbegriffSchueler = '';

        function normalisiereSitzRaster(value) {
            return Array.from({length: ROWS}, (_, r) => Array.from({length: COLS}, (_, c) => typeof value?.[r]?.[c] === 'string' ? value[r][c] : ''));
        }

        function leeresGruppenRaster() {
            return Array.from({length: ROWS}, () => Array(COLS).fill(null));
        }

        function normalisiereGruppenRaster(wert) {
            if (!Array.isArray(wert) || wert.length > ROWS || !wert.every(zeile => Array.isArray(zeile) && zeile.length === COLS)) {
                return leeresGruppenRaster();
            }
            return Array.from({length: ROWS}, (_, r) => Array.from({length: COLS}, (_, c) => {const index=wert[r]?.[c];return Number.isInteger(index) && index >= 0 && index < FARBEN_TISCHGRUPPEN.length ? index : null}));
        }

        function istAnwesend(schueler) {
            return Boolean(schueler && !schueler.abwesend);
        }

        function initialisiereBeispielklassen() {
            const migrationKey = 'sitzplan_beispielklassen_v1';
            if (localStorage.getItem(migrationKey)) return;

            Object.entries(BEISPIELKLASSEN).forEach(([klasse, roster]) => {
                if (!klassenListe.includes(klasse)) return;
                const prefix = 'sitzplan_' + klasse.replace(/\s+/g, '_') + '_';
                const einzelRaw = localStorage.getItem(prefix + 'einzel');
                const paareRaw = localStorage.getItem(prefix + 'paare');
                let einzelVorhanden = null;
                let paareVorhanden = null;
                try {
                    einzelVorhanden = einzelRaw === null ? null : JSON.parse(einzelRaw);
                    paareVorhanden = paareRaw === null ? null : JSON.parse(paareRaw);
                } catch (_) {
                    return;
                }

                const unveraendertePlatzhalter = Array.isArray(einzelVorhanden) &&
                    einzelVorhanden.length === 2 && einzelVorhanden[0] && einzelVorhanden[1] &&
                    einzelVorhanden[0].name === 'Max Mustermann' && einzelVorhanden[1].name === 'Anna Schmidt';
                const einzelLeer = einzelVorhanden === null || (Array.isArray(einzelVorhanden) && einzelVorhanden.length === 0) || unveraendertePlatzhalter;
                const paareLeer = paareVorhanden === null || (Array.isArray(paareVorhanden) && paareVorhanden.length === 0);
                if (!einzelLeer || !paareLeer) return;

                const einzel = roster.map(([name, geschlecht]) => ({name, geschlecht, anker: ''}));
                const paare = [];
                for (let i = 0; i < roster.length; i += 2) {
                    paare.push({s1: roster[i][0], s2: roster[i + 1] ? roster[i + 1][0] : '', geschlecht: roster[i][1]});
                }
                localStorage.setItem(prefix + 'einzel', JSON.stringify(einzel));
                localStorage.setItem(prefix + 'paare', JSON.stringify(paare));
            });

            localStorage.setItem(migrationKey, '1');
        }

        function anzahlSchuelerFuerBelegung() {
            const modusEl = document.querySelector('input[name="belegung"]:checked');
            const modus = modusEl ? modusEl.value : 'einzeln';
            if (modus === 'festePaare') {
                return schuelerPaare.reduce((summe, paar) => summe + Number(Boolean(paar.s1 && paar.s1.trim() && !paar.s1Abwesend)) + Number(Boolean(paar.s2 && paar.s2.trim() && !paar.s2Abwesend)), 0);
            }
            if (modus === 'zufallsPaare') {
                return schuelerEinzel.filter(s => istAnwesend(s) && s.name && (s.anker || ['m', 'w'].includes((s.geschlecht || '').toLowerCase()))).length;
            }
            return schuelerEinzel.filter(s => istAnwesend(s) && s.name && s.name.trim()).length;
        }

        function speichereEigeneTischanordnungen() {
            try {
                localStorage.setItem(EIGENE_TISCHANORDNUNGEN_KEY, JSON.stringify(eigeneTischanordnungen));
                return true;
            } catch (error) {
                alert('Die eigenen Tischanordnungen konnten im Browser nicht gespeichert werden.');
                return false;
            }
        }

        async function eigeneTischanordnungSpeichern() {
            const positions = aktuelleTischpositionen();
            if (!positions.length) {
                alert('Im Raster sind noch keine Tische, die gespeichert werden können.');
                return;
            }
            const eingabe = await classroomPrompt('Wie soll diese Tischanordnung heißen?');
            if (eingabe === null) return;
            const name = eingabe.trim().slice(0, 60);
            if (!name) {
                alert('Bitte gib einen Namen für die Tischanordnung ein.');
                return;
            }
            if (eigeneTischanordnungen.some(item => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
                alert('Es gibt bereits eine eigene Tischanordnung mit diesem Namen.');
                return;
            }
            eigeneTischanordnungen.push({id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, positions});
            if (speichereEigeneTischanordnungen()) renderTischanordnungen();
            else eigeneTischanordnungen.pop();
        }

        function aktuelleTischpositionen() {
            const positions = [];
            gridData.forEach((zeile, r) => zeile.forEach((wert, c) => {
                // Namen und Pult-Markierungen werden absichtlich nicht übernommen.
                if (wert !== '' && wert !== 'PULT') positions.push([r, c]);
            }));
            return positions;
        }

        async function eigeneTischanordnungUmbenennen(id) {
            const anordnung = eigeneTischanordnungen.find(item => item.id === id);
            if (!anordnung) return;
            const eingabe = await classroomPrompt('Neuer Name für die Vorlage:', anordnung.name);
            if (eingabe === null) return;
            const name = eingabe.trim().slice(0, 60);
            if (!name) {
                alert('Bitte gib einen Namen für die Vorlage ein.');
                return;
            }
            if (eigeneTischanordnungen.some(item => item.id !== id && item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
                alert('Es gibt bereits eine eigene Tischanordnung mit diesem Namen.');
                return;
            }
            const alterName = anordnung.name;
            anordnung.name = name;
            if (speichereEigeneTischanordnungen()) renderTischanordnungen();
            else anordnung.name = alterName;
        }

        async function eigeneTischanordnungErsetzen(id) {
            const anordnung = eigeneTischanordnungen.find(item => item.id === id);
            const positions = aktuelleTischpositionen();
            if (!anordnung) return;
            if (!positions.length) {
                alert('Im aktuellen Sitzplan sind keine Tischpositionen zum Übernehmen.');
                return;
            }
            if (!await classroomConfirm(`Die Tischpositionen der Vorlage „${anordnung.name}“ durch die aktuelle Anordnung ersetzen? Namen und Pult-Markierungen werden nicht gespeichert.`)) return;
            const altePositionen = anordnung.positions;
            anordnung.positions = positions;
            if (speichereEigeneTischanordnungen()) renderTischanordnungen();
            else anordnung.positions = altePositionen;
        }

        function renderVorlagenverwaltung() {
            const container = document.getElementById('layoutManagerList');
            if (!container) return;
            container.replaceChildren();
            if (!eigeneTischanordnungen.length) {
                const hinweis = document.createElement('span');
                hinweis.className = 'info-text';
                hinweis.textContent = 'Noch keine eigenen Vorlagen gespeichert.';
                container.appendChild(hinweis);
                const importieren = document.createElement('button');
                importieren.type = 'button';
                importieren.className = 'btn btn-secondary';
                importieren.textContent = 'Importieren';
                importieren.onclick = () => document.getElementById('importLayoutsFile').click();
                container.appendChild(importieren);
                return;
            }
            eigeneTischanordnungen.forEach(anordnung => {
                const zeile = document.createElement('div');
                zeile.className = 'layout-manager-item';
                const name = document.createElement('span');
                name.className = 'layout-manager-name';
                name.textContent = anordnung.name;
                zeile.appendChild(name);
                const umbenennen = document.createElement('button');
                umbenennen.type = 'button';
                umbenennen.className = 'btn btn-secondary';
                umbenennen.textContent = 'Umbenennen';
                umbenennen.onclick = () => eigeneTischanordnungUmbenennen(anordnung.id);
                zeile.appendChild(umbenennen);
                const ersetzen = document.createElement('button');
                ersetzen.type = 'button';
                ersetzen.className = 'btn btn-secondary';
                ersetzen.textContent = 'Ersetzen';
                ersetzen.title = 'Übernimmt die Tischpositionen des aktuellen Rasters in diese Vorlage.';
                ersetzen.onclick = () => eigeneTischanordnungErsetzen(anordnung.id);
                zeile.appendChild(ersetzen);
                const loeschen = document.createElement('button');
                loeschen.type = 'button';
                loeschen.className = 'btn layout-manager-delete';
                loeschen.textContent = 'Löschen';
                loeschen.onclick = () => eigeneTischanordnungLoeschen(anordnung.id);
                zeile.appendChild(loeschen);
                const exportieren = document.createElement('button');
                exportieren.type = 'button';
                exportieren.className = 'btn btn-secondary';
                exportieren.textContent = 'Exportieren';
                exportieren.title = 'Exportiert nur diese Tischvorlage.';
                exportieren.onclick = () => exportiereEigeneTischanordnungen(anordnung.id);
                zeile.appendChild(exportieren);
                const importieren = document.createElement('button');
                importieren.type = 'button';
                importieren.className = 'btn btn-secondary';
                importieren.textContent = 'Importieren';
                importieren.title = 'Importiert eigene Tischvorlagen aus einer Sicherungsdatei.';
                importieren.onclick = () => document.getElementById('importLayoutsFile').click();
                zeile.appendChild(importieren);
                container.appendChild(zeile);
            });
        }

        async function eigeneTischanordnungLoeschen(id) {
            const anordnung = eigeneTischanordnungen.find(item => item.id === id);
            if (!anordnung || !await classroomConfirm(`Eigene Tischanordnung „${anordnung.name}“ löschen?`)) return;
            const vorherige = eigeneTischanordnungen;
            eigeneTischanordnungen = eigeneTischanordnungen.filter(item => item.id !== id);
            if (ausgewaehlteAnordnung === `eigene:${id}`) ausgewaehlteAnordnung = null;
            if (!speichereEigeneTischanordnungen()) eigeneTischanordnungen = vorherige;
            renderTischanordnungen();
        }

        function exportiereEigeneTischanordnungen(id = null) {
            const zuExportieren = id
                ? eigeneTischanordnungen.filter(item => item.id === id)
                : eigeneTischanordnungen;
            if (!zuExportieren.length) {
                alert('Es gibt noch keine eigenen Tischanordnungen zum Exportieren.');
                return;
            }
            const backup = {
                version: 1,
                layouts: zuExportieren.map(({name, positions}) => ({name, positions}))
            };
            const datei = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(datei);
            const link = document.createElement('a');
            link.href = url;
            const einzelname = zuExportieren.length === 1
                ? `-${zuExportieren[0].name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-')}`
                : '';
            link.download = `Sitzplan-Tischanordnungen${einzelname}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        async function importiereEigeneTischanordnungen(event) {
            const input = event.target;
            const datei = input.files && input.files[0];
            if (!datei) return;
            try {
                const backup = JSON.parse(await datei.text());
                if (!backup || backup.version !== 1 || !Array.isArray(backup.layouts)) throw new Error('Ungültige Sicherungsdatei');
                const neue = backup.layouts.map(item => {
                    const name = typeof item.name === 'string' ? item.name.trim().slice(0, 60) : '';
                    if (!name || !Array.isArray(item.positions) || !item.positions.length) throw new Error('Ungültiger Eintrag');
                    const seen = new Set();
                    const positions = item.positions.map(position => {
                        if (!Array.isArray(position) || position.length !== 2) throw new Error('Ungültige Tischposition');
                        const [r, c] = position;
                        if (!Number.isInteger(r) || !Number.isInteger(c) || r < 0 || r >= ROWS || c < 0 || c >= COLS) throw new Error('Ungültige Tischposition');
                        const key = `${r},${c}`;
                        if (seen.has(key)) throw new Error('Doppelte Tischposition');
                        seen.add(key);
                        return [r, c];
                    });
                    return {name, positions};
                });
                if (eigeneTischanordnungen.length + neue.length > 100) throw new Error('Zu viele Tischanordnungen');
                const names = new Set(eigeneTischanordnungen.map(item => item.name.toLocaleLowerCase()));
                for (const item of neue) {
                    const baseName = item.name;
                    let suffix = 2;
                    while (names.has(item.name.toLocaleLowerCase())) {
                        const zusatz = ` (${suffix++})`;
                        item.name = `${baseName.slice(0, 60 - zusatz.length)}${zusatz}`;
                    }
                    names.add(item.name.toLocaleLowerCase());
                    item.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                }
                const vorherige = eigeneTischanordnungen;
                eigeneTischanordnungen = [...eigeneTischanordnungen, ...neue];
                if (!speichereEigeneTischanordnungen()) eigeneTischanordnungen = vorherige;
                else {
                    renderTischanordnungen();
                    alert(`${neue.length} Tischanordnung(en) wurden importiert.`);
                }
            } catch (error) {
                alert('Die Datei konnte nicht importiert werden. Bitte wähle eine exportierte Sitzplan-Sicherungsdatei.');
            } finally {
                input.value = '';
            }
        }

        function zentrierVersatz(positions) {
            if (!positions.length) return [0,0];
            const rs=positions.map(p=>p[0]),cs=positions.map(p=>p[1]);
            return [Math.floor((ROWS-1-Math.min(...rs)-Math.max(...rs))/2),Math.round((COLS-1-Math.min(...cs)-Math.max(...cs))/2)];
        }

        function berechneSitzpositionen(musterId, anzahl, zentrieren = true) {
            const mitteZuerst = [4, 5, 3, 6, 2, 7, 1, 8, 0, 9];
            let sitze = [];

            if (musterId === 'u-mitte') {
                // Die vier Doppeltische in der Mitte haben Vorrang vor einzelnen Tischen am U-Rand.
                // Je zwei benachbarte Zellen bilden einen Doppeltisch; breite Abstände trennen die vier Gruppen.
                // Die beiden Tischpaare der unteren Mittelreihe sind eine Zeile nach unten versetzt.
                const mitte = [[2, 2], [2, 3], [2, 5], [2, 6], [4, 2], [4, 3], [4, 5], [4, 6]];
                sitze = [...mitte];
                let rest = Math.max(0, anzahl - sitze.length);
                if (rest > 0) {
                    let obenAnzahl = Math.min(7, rest);
                    if ((rest - obenAnzahl) % 2 !== 0) obenAnzahl--;
                    const obereSpalten = [1, 2, 3, 4, 5, 6, 7];
                    const zentrierteObereSpalten = [4, 5, 3, 6, 2, 7, 1];
                    sitze.push(...zentrierteObereSpalten.slice(0, obenAnzahl).map(c => [0, c]));
                    rest -= obenAnzahl;
                    const seitenpaare = Math.floor(rest / 2);
                    for (let r = 1; r <= seitenpaare; r++) sitze.push([r, obereSpalten[0]], [r, obereSpalten[6]]);
                }
            } else if (TISCHGRUPPEN[musterId]) {
                const gruppen = TISCHGRUPPEN[musterId];
                const verteilteSitze = [];
                const maxPlaetzeJeGruppe = Math.max(...gruppen.map(gruppe => gruppe.length));
                for (let platzInGruppe = 0; platzInGruppe < maxPlaetzeJeGruppe; platzInGruppe++) {
                    gruppen.forEach(gruppe => {
                        if (gruppe[platzInGruppe]) verteilteSitze.push(gruppe[platzInGruppe]);
                    });
                }
                sitze = verteilteSitze.slice(0, anzahl);
            } else if (musterId === 'drei-reihen') {
                const reihen = [1, 3, 5];
                reihen.forEach((r, index) => {
                    const anzahlInReihe = Math.floor(anzahl / 3) + (index < anzahl % 3 ? 1 : 0);
                    mitteZuerst.slice(0, anzahlInReihe).forEach(c => sitze.push([r, c]));
                });
            } else if (musterId === 'mittelgang') {
                const reihen = [1, 3, 5];
                const vonMitte = [3, 6, 2, 7, 1, 8, 0, 9];
                reihen.forEach((r, index) => {
                    const anzahlInReihe = Math.floor(anzahl / 3) + (index < anzahl % 3 ? 1 : 0);
                    vonMitte.slice(0, anzahlInReihe).forEach(c => sitze.push([r, c]));
                });
            } else if (musterId === 'vier-reihen' || musterId === 'fuenf-reihen') {
                const reihen = musterId === 'fuenf-reihen' ? [0, 2, 4, 6, 8] : [0, 2, 4, 6];
                reihen.forEach((r, index) => {
                    const anzahlInReihe = Math.floor(anzahl / reihen.length) + (index < anzahl % reihen.length ? 1 : 0);
                    mitteZuerst.slice(0, anzahlInReihe).forEach(c => sitze.push([r, c]));
                });
            } else if (musterId === 'vier-mittelgang') {
                const reihen = [0, 2, 4, 6];
                const vomGang = [3, 6, 2, 7, 1, 8];
                reihen.forEach((r, index) => {
                    const anzahlInReihe = Math.floor(anzahl / reihen.length) + (index < anzahl % reihen.length ? 1 : 0);
                    vomGang.slice(0, anzahlInReihe).forEach(c => sitze.push([r, c]));
                });
            }
            const result = musterId === 'u-mitte' ? sitze : sitze.slice(0, anzahl);
            const [dr, dc] = zentrieren ? zentrierVersatz(result) : [0, 0];
            return result.map(([r,c]) => [r+dr,c+dc]);
        }

        function renderTischanordnungen(modus = layoutViewMode) {
            const container = document.getElementById('layoutPresets');
            if (!container) return;
            container.innerHTML = '';

            const schuelerAnzahl = anzahlSchuelerFuerBelegung();
            TISCHANORDNUNGEN.forEach(muster => {
                const gruppen = TISCHGRUPPEN[muster.id] || [];
                if ((modus === 'groups') !== Boolean(gruppen.length)) return;
                const beispiel = schuelerAnzahl === 0;
                const tischAnzahl = beispiel ? muster.capacity : Math.min(schuelerAnzahl, muster.capacity);
                const sitze = berechneSitzpositionen(muster.id, tischAnzahl);
                const gruppenIndexProSitz = new Map();
                const [dr, dc] = zentrierVersatz(berechneSitzpositionen(muster.id, tischAnzahl, false));
                gruppen.forEach((gruppe, gruppenIndex) => gruppe.forEach(([r, c]) => gruppenIndexProSitz.set(`${r+dr},${c+dc}`, gruppenIndex)));
                const passt = beispiel || schuelerAnzahl <= muster.capacity;
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'layout-preset';
                button.dataset.layout = muster.id;
                button.title = muster.description + (beispiel ? '. Beispielvorschau, da noch keine Schüler eingetragen sind.' : `. ${schuelerAnzahl} Schülerplätze benötigt; dieses Muster bietet bis zu ${muster.capacity}.`);
                button.setAttribute('aria-pressed', String(ausgewaehlteAnordnung === muster.id));
                button.setAttribute('aria-label', gruppen.length
                    ? `${muster.description}. ${gruppen.length} farblich markierte Gruppen.`
                    : muster.description);

                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', `0 0 116 ${8 + ROWS * 9.2}`);
                svg.setAttribute('role', 'img');
                svg.setAttribute('aria-label', muster.description);
                for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        rect.setAttribute('x', String(7 + c * 10.2));
                        rect.setAttribute('y', String(4 + r * 9.2));
                        rect.setAttribute('width', '8.4');
                        rect.setAttribute('height', '7.2');
                        rect.setAttribute('rx', '1.2');
                        const istTisch = sitze.some(([seatRow, seatCol]) => seatRow === r && seatCol === c);
                        const gruppenIndex = gruppenIndexProSitz.get(`${r},${c}`);
                        const farbe = istTisch && gruppenIndex !== undefined ? FARBEN_TISCHGRUPPEN[gruppenIndex % FARBEN_TISCHGRUPPEN.length] : null;
                        rect.setAttribute('fill', farbe ? farbe.fill : istTisch ? '#64748b' : '#f1f5f9');
                        rect.setAttribute('stroke', farbe ? farbe.stroke : istTisch ? '#475569' : '#cbd5e1');
                        rect.setAttribute('stroke-width', '0.7');
                        svg.appendChild(rect);
                    }
                }
                button.appendChild(svg);
                const caption = document.createElement('span');
                caption.textContent = muster.name;
                button.appendChild(caption);
                const count = document.createElement('small');
                count.className = 'layout-preset-count';
                count.textContent = beispiel
                    ? `Beispiel · max. ${muster.capacity}`
                    : !passt ? `${muster.capacity} von ${schuelerAnzahl} · Rest ergänzen`
                    : muster.id === 'u-mitte' && schuelerAnzahl < 8
                        ? `4 Doppeltische · ${schuelerAnzahl} Schüler`
                        : `${berechneSitzpositionen(muster.id, schuelerAnzahl).length} Tische`;
                if (!passt) count.style.color = 'var(--danger)';
                button.appendChild(count);
                button.addEventListener('click', () => waehleTischanordnung(muster.id));
                container.appendChild(button);
            });
            if (modus !== 'groups' && eigeneTischanordnungen.length) {
                const heading = document.createElement('h3');
                heading.className = 'layout-section-heading';
                heading.textContent = 'Eigene Anordnungen';
                container.appendChild(heading);
                eigeneTischanordnungen.forEach(eigene => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'layout-saved-card';
                    const id = `eigene:${eigene.id}`;
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'layout-preset';
                    button.dataset.layout = id;
                    button.title = `Eigene Tischanordnung „${eigene.name}“ mit ${eigene.positions.length} Tischen.`;
                    button.setAttribute('aria-pressed', String(ausgewaehlteAnordnung === id));
                    button.setAttribute('aria-label', `${eigene.name}, ${eigene.positions.length} Tische`);

                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', `0 0 116 ${8 + ROWS * 9.2}`);
                    svg.setAttribute('role', 'img');
                    svg.setAttribute('aria-label', `Vorschau: ${eigene.name}`);
                    for (let r = 0; r < ROWS; r++) {
                        for (let c = 0; c < COLS; c++) {
                            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            rect.setAttribute('x', String(7 + c * 10.2));
                            rect.setAttribute('y', String(4 + r * 9.2));
                            rect.setAttribute('width', '8.4');
                            rect.setAttribute('height', '7.2');
                            rect.setAttribute('rx', '1.2');
                            const istTisch = eigene.positions.some(([seatRow, seatCol]) => seatRow === r && seatCol === c);
                            rect.setAttribute('fill', istTisch ? '#64748b' : '#f1f5f9');
                            rect.setAttribute('stroke', istTisch ? '#475569' : '#cbd5e1');
                            rect.setAttribute('stroke-width', '0.7');
                            svg.appendChild(rect);
                        }
                    }
                    button.appendChild(svg);
                    const caption = document.createElement('span');
                    caption.textContent = eigene.name;
                    button.appendChild(caption);
                    const count = document.createElement('small');
                    count.className = 'layout-preset-count';
                    count.textContent = `${eigene.positions.length} Tische`;
                    button.appendChild(count);
                    button.addEventListener('click', () => waehleTischanordnung(id));
                    wrapper.appendChild(button);
                    container.appendChild(wrapper);
                });
            }
            const manager = document.querySelector('.layout-manager');
            if (manager) manager.hidden = modus === 'groups';
            if (modus !== 'groups') renderVorlagenverwaltung();
            const applyButton = document.getElementById('applyLayoutButton');
            if (applyButton) {
                applyButton.disabled = !ausgewaehlteAnordnung;
                const muster = TISCHANORDNUNGEN.find(item => item.id === ausgewaehlteAnordnung);
                const eigene = ausgewaehlteAnordnung && ausgewaehlteAnordnung.startsWith('eigene:')
                    ? eigeneTischanordnungen.find(item => item.id === ausgewaehlteAnordnung.slice(7))
                    : null;
                applyButton.title = eigene && schuelerAnzahl > eigene.positions.length
                    ? `Diese Anordnung hat ${eigene.positions.length} Tische; weitere kannst du anschließend im Raster ergänzen.`
                    : muster && schuelerAnzahl > muster.capacity
                    ? `Erstellt ${muster.capacity} Tische; ${schuelerAnzahl - muster.capacity} weitere kannst du anschließend im Raster ergänzen.`
                    : 'Ersetzt die aktuelle Tischanordnung durch das ausgewählte Muster.';
            }
        }

        function waehleTischanordnung(id) {
            ausgewaehlteAnordnung = id;
            renderTischanordnungen();
        }

        function zeigeTischanordnungen(modus = 'layouts') {
            layoutViewMode = modus;
            document.getElementById('layoutView').hidden = false;
            document.getElementById('roomGrid').hidden = true;
            document.getElementById('mainGroupLegend').hidden = true;
            document.getElementById('titelKlasse').hidden = true;
            document.getElementById('gridInstructions').hidden = true;
            document.getElementById('placementStatus').hidden = true;
            document.querySelector('.student-search').hidden = true;
            document.getElementById('layoutViewTitle').textContent = modus === 'groups' ? 'Gruppen auswählen' : 'Tischanordnung auswählen';
            const buttons = [
                {id: 'layoutToggleButton', mode: 'layouts', shown: 'Tischanordnung …', hidden: 'Tischanordnung …'},
                {id: 'groupsToggleButton', mode: 'groups', shown: 'Gruppen', hidden: 'Gruppen'}
            ];
            buttons.forEach(({id, mode, shown, hidden}) => {
                const button = document.getElementById(id);
                if (!button) return;
                const active = mode === modus;
                button.classList.toggle('btn-secondary', !active);
                button.classList.toggle('btn-grid-reset', active);
                button.setAttribute('aria-expanded', String(active));
                button.title = active ? 'Zurück zum Sitzplan, ohne Änderungen zu übernehmen.' : mode === 'groups' ? 'Wähle eine Gruppenvorlage rechts neben dem Sitzplan.' : 'Wähle eine Vorlage rechts neben dem Sitzplan.';
                button.textContent = active ? hidden : shown;
            });
            renderTischanordnungen(modus);
        }

        function zeigeSitzplan() {
            document.getElementById('layoutView').hidden = true;
            document.getElementById('roomGrid').hidden = false;
            aktualisiereGruppenLegende();
            document.getElementById('titelKlasse').hidden = false;
            document.getElementById('gridInstructions').hidden = false;
            document.querySelector('.student-search').hidden = false;
            document.getElementById('layoutViewTitle').textContent = 'Tischanordnung auswählen';
            [
                ['layoutToggleButton', 'Tischanordnung …'],
                ['groupsToggleButton', 'Gruppen']
            ].forEach(([id, label]) => {
                const button = document.getElementById(id);
                if (!button) return;
                button.classList.remove('btn-grid-reset');
                button.classList.add('btn-secondary');
                button.setAttribute('aria-expanded', 'false');
                button.title = id === 'groupsToggleButton' ? 'Wähle eine Gruppenvorlage rechts neben dem Sitzplan.' : 'Wähle eine Vorlage rechts neben dem Sitzplan.';
                button.textContent = label;
            });
        }

        function schalteTischanordnungenUm(modus) {
            if (!document.getElementById('layoutView').hidden && layoutViewMode === modus) zeigeSitzplan();
            else zeigeTischanordnungen(modus);
        }

        async function wendeTischanordnungAn() {
            const istEigene = ausgewaehlteAnordnung && ausgewaehlteAnordnung.startsWith('eigene:');
            const eigene = istEigene
                ? eigeneTischanordnungen.find(item => item.id === ausgewaehlteAnordnung.slice(7))
                : null;
            const muster = TISCHANORDNUNGEN.find(eintrag => eintrag.id === ausgewaehlteAnordnung);
            if (!muster && !eigene) return;
            const schuelerAnzahl = anzahlSchuelerFuerBelegung();
            const anzahl = schuelerAnzahl || (muster ? muster.capacity : eigene.positions.length);
            const sitze = eigene
                ? eigene.positions.map(position => [...position])
                : berechneSitzpositionen(muster.id, Math.min(anzahl, muster.capacity));
            const hatInhalt = gridData.some(zeile => zeile.some(wert => wert !== ''));
            if (hatInhalt && !await classroomConfirm('Die aktuelle Tischanordnung, das Pult und platzierte Namen werden ersetzt. Du kannst den Wechsel anschließend mit „Rückgängig“ aufheben. Fortfahren?')) return;

            merkeSitzplanFuerUndo();
            gridData = Array.from({length: ROWS}, () => Array(COLS).fill(''));
            gridGroupData = leeresGruppenRaster();
            sitze.forEach(([r, c]) => { gridData[r][c] = 'X'; });
            if (muster && TISCHGRUPPEN[muster.id]) {
                const [dr, dc] = zentrierVersatz(berechneSitzpositionen(muster.id, Math.min(anzahl, muster.capacity), false));
                TISCHGRUPPEN[muster.id].forEach((gruppe, gruppenIndex) => {
                    gruppe.forEach(([r, c]) => {
                        if (gridData[r+dr]?.[c+dc] === 'X') gridGroupData[r+dr][c+dc] = gruppenIndex;
                    });
                });
            }
            initGrid();
            datenSpeichern();
            zeigeSitzplan();
        }

        function merkeSitzplanFuerUndo() {
            undoGridHistory.push(gridData.map(zeile => [...zeile]));
            undoGroupHistory.push(normalisiereGruppenRaster(gridGroupData).map(zeile => [...zeile]));
            if (undoGridHistory.length > MAX_UNDO_STEPS) undoGridHistory.shift();
            if (undoGroupHistory.length > MAX_UNDO_STEPS) undoGroupHistory.shift();
            aktualisiereUndoButton();
        }

        function aktualisiereUndoButton() {
            const button = document.getElementById('undoGridButton');
            if (button) button.disabled = undoGridHistory.length === 0;
        }

        function sitzplanRueckgaengig() {
            if (undoGridHistory.length === 0) return;
            gridData = undoGridHistory.pop();
            gridGroupData = undoGroupHistory.pop() || leeresGruppenRaster();
            initGrid();
            datenSpeichern();
            aktualisiereUndoButton();
        }

        function ladeDaten() {
            try {
                const layoutsRaw = JSON.parse(localStorage.getItem(EIGENE_TISCHANORDNUNGEN_KEY) || '[]');
                eigeneTischanordnungen = Array.isArray(layoutsRaw) ? layoutsRaw.filter(item =>
                    item && typeof item.id === 'string' && typeof item.name === 'string' && item.name.trim() &&
                    Array.isArray(item.positions) && item.positions.length > 0 && item.positions.every(position =>
                        Array.isArray(position) && position.length === 2 && Number.isInteger(position[0]) &&
                        Number.isInteger(position[1]) && position[0] >= 0 && position[0] < ROWS && position[1] >= 0 && position[1] < COLS
                    )
                ) : [];
                let gespeicherteKlassen = localStorage.getItem('sitzplan_klassen_liste');
                if (gespeicherteKlassen) {
                    klassenListe = JSON.parse(gespeicherteKlassen);
                }
                if (!Array.isArray(klassenListe) || klassenListe.length === 0) {
                    klassenListe = ["Klasse 7a", "Klasse 9b"];
                }
                initialisiereBeispielklassen();

                let gespeicherteAktuelle = localStorage.getItem('sitzplan_aktuelle_klasse');
                if (gespeicherteAktuelle && klassenListe.includes(gespeicherteAktuelle)) {
                    aktuelleKlasse = gespeicherteAktuelle;
                } else {
                    aktuelleKlasse = klassenListe[0];
                }

                let prefix = 'sitzplan_' + aktuelleKlasse.replace(/\s+/g, '_') + '_';
                gridData = normalisiereSitzRaster(JSON.parse(localStorage.getItem(prefix + 'grid')));
                gridGroupData = normalisiereGruppenRaster(JSON.parse(localStorage.getItem(prefix + 'groupGrid') || 'null'));
                schuelerEinzel = JSON.parse(localStorage.getItem(prefix + 'einzel')) || [
                    {name: "Max Mustermann", geschlecht: "m", anker: ""},
                    {name: "Anna Schmidt", geschlecht: "w", anker: ""}
                ];
                schuelerPaare = JSON.parse(localStorage.getItem(prefix + 'paare')) || [];
                tabuPaare = JSON.parse(localStorage.getItem(prefix + 'tabu')) || [];
            } catch (e) {
                console.error("Ladefehler, setze Standardwerte:", e);
                klassenListe = ["Klasse 7a", "Klasse 9b"];
                aktuelleKlasse = "Klasse 7a";
                gridData = Array(ROWS).fill().map(() => Array(COLS).fill(''));
                gridGroupData = leeresGruppenRaster();
                schuelerEinzel = [{name: "Max Mustermann", geschlecht: "m", anker: ""}];
                schuelerPaare = [];
                tabuPaare = [];
                eigeneTischanordnungen = [];
            }
            aktualisiereKlassenDropdown();
        }

        async function tischanordnungZuruecksetzen() {
            if (!await classroomConfirm('Tische, Pult und platzierte Namen im Raumraster wirklich entfernen? Die Klassen und Schülerlisten bleiben erhalten.')) return;
            merkeSitzplanFuerUndo();
            gridData = Array.from({length: ROWS}, () => Array(COLS).fill(''));
            gridGroupData = leeresGruppenRaster();
            initGrid();
            datenSpeichern();
        }

        function datenSpeichern() {
            try {
                localStorage.setItem('sitzplan_klassen_liste', JSON.stringify(klassenListe));
                localStorage.setItem('sitzplan_aktuelle_klasse', aktuelleKlasse);

                let prefix = 'sitzplan_' + aktuelleKlasse.replace(/\s+/g, '_') + '_';
                localStorage.setItem(prefix + 'grid', JSON.stringify(gridData));
                localStorage.setItem(prefix + 'groupGrid', JSON.stringify(normalisiereGruppenRaster(gridGroupData)));
                localStorage.setItem(prefix + 'einzel', JSON.stringify(schuelerEinzel));
                localStorage.setItem(prefix + 'paare', JSON.stringify(schuelerPaare));
                localStorage.setItem(prefix + 'tabu', JSON.stringify(tabuPaare));
            } catch (e) {
                console.error("Speicherfehler:", e);
            }
            aktualisiereExportButtons();
        }

        function aktualisiereExportButtons() {
            const button = document.getElementById('studentExportButton');
            if (!button) return;
            const einzelGefuellt = schuelerEinzel.some(s => (s.name || '').trim());
            const paareGefuellt = schuelerPaare.some(p => (p.s1 || '').trim() || (p.s2 || '').trim());
            const tabuGefuellt = tabuPaare.some(t => (t.s1 || '').trim() || (t.s2 || '').trim());
            button.hidden = !(einzelGefuellt || paareGefuellt || tabuGefuellt);
            button.textContent = 'Exportieren';
            button.title = einzelGefuellt && paareGefuellt
                ? 'Exportiert Einzel- und Paarliste gemeinsam als JSON-Datei.'
                : tabuGefuellt && (document.getElementById('tab-tabu').classList.contains('active') || (!einzelGefuellt && !paareGefuellt))
                    ? 'Exportiert die Tabu-Paare als CSV-Datei.'
                    : 'Exportiert die gefüllte Schülerliste als CSV-Datei.';
        }

        function aktualisiereKlassenDropdown() {
            let select = document.getElementById('klassenSelect');
            if (!select) return;
            klassenListe.sort((a, b) => Number(/^klasse\s/i.test(b))-Number(/^klasse\s/i.test(a))||a.localeCompare(b, 'de', {numeric: true, sensitivity: 'base'}));
            select.innerHTML = '';
            klassenListe.forEach(k => {
                let opt = document.createElement('option');
                opt.value = k;
                opt.innerText = k;
                if (k === aktuelleKlasse) opt.selected = true;
                select.appendChild(opt);
            });
            let titelEl = document.getElementById('titelKlasse');
            if (titelEl) titelEl.innerText = "Klassenraum (" + aktuelleKlasse + ")";
        }

        function klasseWechseln(neueKlasse) {
            if (!neueKlasse) return;
            undoGridHistory = [];
            undoGroupHistory = [];
            aktuelleKlasse = neueKlasse;
            localStorage.setItem('sitzplan_aktuelle_klasse', aktuelleKlasse);
            ladeDaten();
            initGrid();
            renderTables();
        }

        async function neueKlasseHinzufuegen() {
            let neueKlasse = await classroomPrompt("Name der neuen Klasse (z.B. Latein 10a):");
            if (neueKlasse && neueKlasse.trim() !== "") {
                neueKlasse = neueKlasse.trim();
                if (!klassenListe.includes(neueKlasse)) {
                    klassenListe.push(neueKlasse);
                    undoGridHistory = [];
                    undoGroupHistory = [];
                    aktuelleKlasse = neueKlasse;
                    gridData = Array(ROWS).fill().map(() => Array(COLS).fill(''));
                    gridGroupData = leeresGruppenRaster();
                    schuelerEinzel = [];
                    schuelerPaare = [];
                    tabuPaare = [];
                    datenSpeichern();
                    ladeDaten();
                    initGrid();
                    renderTables();
                } else {
                    alert("Diese Klasse existiert bereits!");
                }
            }
        }

        async function klasseLoeschen() {
            if (klassenListe.length <= 1) {
                alert("Du kannst nicht die letzte verbleibende Klasse löschen!");
                return;
            }
            if (await classroomConfirm("Möchtest du '" + aktuelleKlasse + "' samt aller Sitzpläne und Schülerlisten wirklich löschen?")) {
                undoGridHistory = [];
                undoGroupHistory = [];
                let prefix = 'sitzplan_' + aktuelleKlasse.replace(/\s+/g, '_') + '_';
                localStorage.removeItem(prefix + 'grid');
                localStorage.removeItem(prefix + 'groupGrid');
                localStorage.removeItem(prefix + 'einzel');
                localStorage.removeItem(prefix + 'paare');
                localStorage.removeItem(prefix + 'tabu');

                klassenListe = klassenListe.filter(k => k !== aktuelleKlasse);
                aktuelleKlasse = klassenListe[0];
                // Erst die verbliebene Klasse laden; sonst würden die noch im Speicher
                // befindlichen Daten der gelöschten Klasse ihre Listen überschreiben.
                localStorage.setItem('sitzplan_klassen_liste', JSON.stringify(klassenListe));
                localStorage.setItem('sitzplan_aktuelle_klasse', aktuelleKlasse);
                ladeDaten();
                initGrid();
                renderTables();
            }
        }

        /* 9.92: Namensliste je Durchgang nur einmal aufbauen (vorher für jeden Tisch neu) */
        function sitzplatzKurzname(name) {
            const normalize = value => String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
            let kurznameCache = sitzplatzKurzname.cache;
            if (!kurznameCache) {
                const group = typeof classroomCurrentGroup === 'function' ? classroomCurrentGroup() : null;
                const names = [...(group?.students.filter(person => !person.deleted).map(person => person.name) || []), ...schuelerEinzel.map(person => person.name), ...schuelerPaare.flatMap(pair => [pair.s1, pair.s2]), ...gridData.flat()];
                const people = new Map(), firstCount = new Map();
                for (const value of names) {
                    const full = String(value || '').trim(), key = normalize(full);
                    if (!key || ['X', 'PULT'].includes(full) || people.has(key)) continue;
                    const comma = full.indexOf(',');
                    const parts = full.split(/\s+/);
                    const first = comma >= 0 ? full.slice(comma + 1).trim() || full.slice(0, comma).trim() : parts.shift();
                    const last = comma >= 0 ? full.slice(0, comma).trim() : parts.join(' ');
                    people.set(key, {first, last});
                    const fk = normalize(first); firstCount.set(fk, (firstCount.get(fk) || 0) + 1);
                }
                kurznameCache = sitzplatzKurzname.cache = {people, firstCount};
                Promise.resolve().then(() => { sitzplatzKurzname.cache = null; });
            }
            const person = kurznameCache.people.get(normalize(name));
            if (!person) return String(name || '');
            const duplicate = (kurznameCache.firstCount.get(normalize(person.first)) || 0) > 1;
            return person.first + (duplicate && person.last ? ' ' + Array.from(person.last)[0].toUpperCase() + '.' : '');
        }

        function aktualisiereZellenDarstellung(cell, wert, gruppenIndex = null) {
            cell.classList.remove('tisch', 'pult', 'besetzt', 'gruppenfarbe', 'random-selected');
            ['--group-fill', '--group-stroke', '--group-text'].forEach(name => cell.style.removeProperty(name));
            if (wert && wert !== 'PULT' && Number.isInteger(gruppenIndex) && FARBEN_TISCHGRUPPEN[gruppenIndex]) {
                const farbe = FARBEN_TISCHGRUPPEN[gruppenIndex];
                cell.classList.add('gruppenfarbe');
                cell.style.setProperty('--group-fill', farbe.fill);
                cell.style.setProperty('--group-stroke', farbe.stroke);
                cell.style.setProperty('--group-text', farbe.text);
            }
            if (wert === 'X') {
                cell.classList.add('tisch');
                cell.textContent = 'Tisch';
                cell.title = document.getElementById('classroomEditRoom')?.checked?'Tisch. Klicken oder ziehen, um ihn zu entfernen. Rechtsklick oder langes Drücken setzt hier das Pult.':'Freier Tisch. Klicken, um eine Person aus der Klassenliste zuzuweisen.';
            } else if (wert === 'PULT') {
                cell.classList.add('pult');
                cell.textContent = 'PULT';
                cell.title = 'Pult. Rechtsklick oder langes Drücken, um es zu entfernen.';
            } else if (wert) {
                cell.classList.add('besetzt');
                cell.textContent = sitzplatzKurzname(wert);
                cell.title = wert + '. Unterricht: anklicken, um einen Eintrag zu erfassen. Im Bearbeitungsmodus kann der Tisch verändert werden.';
            } else {
                cell.textContent = '';
                cell.title = 'Freies Feld. Klicken oder ziehen, um einen Tisch zu setzen. Rechtsklick oder langes Drücken setzt hier das Pult.';
            }

        }

        function aktualisiereGruppenLegende() {
            const legende = document.getElementById('mainGroupLegend');
            if (!legende) return;
            legende.replaceChildren();
            const gruppen = new Set();
            gridGroupData.forEach((zeile, r) => zeile.forEach((gruppenIndex, c) => {
                if (Number.isInteger(gruppenIndex) && gridData[r]?.[c] && gridData[r][c] !== 'PULT') gruppen.add(gruppenIndex);
            }));
            if (!gruppen.size) {
                legende.hidden = true;
                return;
            }
            gruppen.forEach(gruppenIndex => {
                const farbe = FARBEN_TISCHGRUPPEN[gruppenIndex];
                if (!farbe) return;
                const eintrag = document.createElement('span');
                eintrag.className = 'main-group-legend-item';
                eintrag.setAttribute('role', 'listitem');
                const farbfeld = document.createElement('span');
                farbfeld.className = 'main-group-legend-swatch';
                farbfeld.style.backgroundColor = farbe.fill;
                farbfeld.style.borderColor = farbe.stroke;
                eintrag.append(farbfeld, document.createTextNode(`Gruppe ${gruppenIndex + 1}`));
                legende.appendChild(eintrag);
            });
            legende.hidden = !legende.childElementCount;
        }

        function classroomToggleStudentSearch(){
            const input=document.getElementById('studentSearchInput'),button=document.getElementById('studentSearchToggle');
            input.hidden=!input.hidden;button.setAttribute('aria-expanded',String(!input.hidden));
            if(!input.hidden){input.focus();input.select()}else{input.value='';sucheSchuelerImSitzplan('')}
        }
        function sucheSchuelerImSitzplan(suchtext) {
            suchbegriffSchueler = String(suchtext || '').trim();
            aktualisiereSchuelersuche();
        }

        function aktualisiereSchuelersuche() {
            const grid = document.getElementById('roomGrid');
            const status = document.getElementById('studentSearchStatus');
            if (!grid || !status) return;
            const suchtext = suchbegriffSchueler.toLowerCase();
            grid.classList.toggle('search-active', Boolean(suchtext));
            const treffer = [];
            grid.querySelectorAll('.cell').forEach(cell => {
                cell.classList.remove('search-match');
                const zeile = gridData[Number(cell.dataset.row)];
                const wert = zeile ? zeile[Number(cell.dataset.col)] : '';
                if (suchtext && wert && wert !== 'X' && wert !== 'PULT' && String(wert).toLowerCase().includes(suchtext)) {
                    cell.classList.add('search-match');
                    treffer.push(cell);
                }
            });
            if (!suchtext) {
                status.textContent = '';
            } else if (treffer.length) {
                status.textContent = treffer.length === 1 ? '1 Sitzplatz gefunden.' : `${treffer.length} Sitzplätze gefunden.`;
            } else {
                const namen = [
                    ...schuelerEinzel.map(s => s.name),
                    ...schuelerPaare.flatMap(p => [p.s1, p.s2])
                ].filter(Boolean);
                const inListe = namen.some(name => String(name).toLowerCase().includes(suchtext));
                status.textContent = inListe ? 'In der Schülerliste, aber noch nicht im Sitzplan.' : 'Kein passender Name im Sitzplan gefunden.';
            }
        }

        function springeZumSuchtreffer() {
            const treffer = document.querySelector('#roomGrid .search-match');
            if (treffer) treffer.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
        }

        function setzeBelegungsstatus(text, erfolgreich) {
            const status = document.getElementById('placementStatus');
            if (!status) return;
            status.hidden = false;
            status.className = `placement-status ${erfolgreich ? 'success' : 'warning'}`;
            status.textContent = text;
        }

        function loescheBelegungsstatus() {
            const status = document.getElementById('placementStatus');
            if (!status) return;
            status.hidden = true;
            status.className = 'placement-status';
            status.textContent = '';
        }

        function beginneTischZiehen(e, r, c) {
            if (e.button !== 0 || gridData[r][c] === 'PULT') return;
            /* 8.54: Tische setzen/entfernen nur im Sitzplanmodus und nur mit einem Finger */
            if (!document.getElementById('classroomEditRoom')?.checked || e.isPrimary === false) return;
            if (zufallsAuswahl && zufallsAuswahl.r === r && zufallsAuswahl.c === c) {
                e.preventDefault();
                zufallsAuswahl = null;
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) aktualisiereZellenDarstellung(cell, gridData[r][c], gridGroupData[r]?.[c]);
                const status = document.getElementById('randomStudentStatus');
                if (status) status.textContent = '';
                return;
            }
            e.preventDefault();
            tischZiehenAktiv = true;
            // Von einem Tisch aus wird gelöscht, sonst werden Tische gesetzt.
            tischZiehWert = gridData[r][c] === 'X' ? '' : 'X';
            merkeSitzplanFuerUndo();
            bearbeiteTischZelle(r, c);
        }

        function bearbeiteTischZelle(r, c) {
            const aktuellerWert = gridData[r][c];
            if (aktuellerWert === 'PULT') return;
            if (tischZiehWert === '' && aktuellerWert !== 'X') return;
            if (aktuellerWert === tischZiehWert) return;

            loescheBelegungsstatus();
            gridData[r][c] = tischZiehWert;
            gridGroupData[r][c] = null;
            if (zufallsAuswahl && zufallsAuswahl.r === r && zufallsAuswahl.c === c) {
                zufallsAuswahl = null;
                const status = document.getElementById('randomStudentStatus');
                if (status) status.textContent = '';
            }
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) aktualisiereZellenDarstellung(cell, tischZiehWert, null);
            aktualisiereZufallButton();
            aktualisiereSchuelersuche();
            datenSpeichern();
        }

        function bewegeTischZiehen(e) {
            if (!tischZiehenAktiv) return;
            if (e.cancelable) e.preventDefault();
            const unterCursor = document.elementFromPoint(e.clientX, e.clientY);
            const cell = unterCursor && unterCursor.closest ? unterCursor.closest('.cell') : null;
            if (!cell) return;
            bearbeiteTischZelle(Number(cell.dataset.row), Number(cell.dataset.col));
        }

        function ermittleZufaelligeSitzplaetze() {
            const abwesendeNamen = new Set();
            schuelerEinzel.forEach(s => {
                if (s.abwesend && s.name && s.name.trim()) abwesendeNamen.add(s.name.trim().toLowerCase());
            });
            schuelerPaare.forEach(p => {
                if (p.s1Abwesend && p.s1 && p.s1.trim()) abwesendeNamen.add(p.s1.trim().toLowerCase());
                if (p.s2Abwesend && p.s2 && p.s2.trim()) abwesendeNamen.add(p.s2.trim().toLowerCase());
            });

            const kandidaten = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const name = gridData[r][c];
                    if (name && name !== 'X' && name !== 'PULT' && name.trim() && !abwesendeNamen.has(name.trim().toLowerCase())) {
                        kandidaten.push({r, c, name});
                    }
                }
            }
            return kandidaten;
        }

        function aktualisiereZufallButton() {
            const button = document.getElementById('randomStudentButton');
            if (!button) return;
            const kandidaten = ermittleZufaelligeSitzplaetze();
            button.disabled = kandidaten.length === 0;
            button.title = kandidaten.length
                ? 'Wählt zufällig einen anwesenden Schüler aus dem aktuellen Sitzplan aus.'
                : 'Im Sitzplan sind keine anwesenden Schüler ausgewählt.';

            if (zufallsAuswahl && !kandidaten.some(k => k.r === zufallsAuswahl.r && k.c === zufallsAuswahl.c && k.name === zufallsAuswahl.name)) {
                zufallsAuswahl = null;
                document.querySelectorAll('.cell.random-selected').forEach(cell => cell.classList.remove('random-selected'));
                const status = document.getElementById('randomStudentStatus');
                if (status) status.textContent = '';
            }
        }

        function waehleZufaelligenSchueler() {
            const kandidaten = ermittleZufaelligeSitzplaetze();
            if (!kandidaten.length) {
                aktualisiereZufallButton();
                return;
            }

            let auswahl = kandidaten;
            if (kandidaten.length > 1 && zufallsAuswahl) {
                auswahl = kandidaten.filter(k => k.r !== zufallsAuswahl.r || k.c !== zufallsAuswahl.c);
            }
            zufallsAuswahl = auswahl[Math.floor(Math.random() * auswahl.length)];
            const status = document.getElementById('randomStudentStatus');
            if (status) status.textContent = `Ausgewählt: ${zufallsAuswahl.name}`;
            initGrid();
        }

        function initGrid() {
            const grid = document.getElementById('roomGrid');
            if (!grid) return;
            loescheBelegungsstatus();
            grid.innerHTML = '';

            const emptyCorner = document.createElement('div');
            emptyCorner.className = 'grid-corner';
            grid.appendChild(emptyCorner);
            for (let c = 0; c < COLS; c++) {
                const header = document.createElement('div');
                header.className = 'grid-header';
                header.innerText = COL_LETTERS[c];
                grid.appendChild(header);
            }

            for (let r = 0; r < ROWS; r++) {
                const rowHeader = document.createElement('div');
                rowHeader.className = 'grid-header';
                rowHeader.innerText = (r + 1);
                grid.appendChild(rowHeader);

                for (let c = 0; c < COLS; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    aktualisiereZellenDarstellung(cell, gridData[r][c], gridGroupData[r]?.[c]);
                    if (zufallsAuswahl && zufallsAuswahl.r === r && zufallsAuswahl.c === c && zufallsAuswahl.name === gridData[r][c]) {
                        cell.classList.add('random-selected');
                        cell.title = 'Zufällig ausgewählter Schüler. Klicken, um die rote Markierung zu entfernen.';
                    }

                    // Pointer-Ereignisse unterstützen Maus, Trackpad und Touch.
                    cell.addEventListener('pointerdown', e => beginneTischZiehen(e, r, c));

                    // Rechtsklick (bzw. langer Druck am iPad) für Pult
                    cell.oncontextmenu = (e) => {
                        e.preventDefault();
                        merkeSitzplanFuerUndo();
                        gridData[r][c] = gridData[r][c] === 'PULT' ? '' : 'PULT';
                        gridGroupData[r][c] = null;
                        datenSpeichern();
                        initGrid();
                    };

                    grid.appendChild(cell);
                }
            }

            const groupLegend = document.createElement('div');
            groupLegend.className = 'main-group-legend';
            groupLegend.id = 'mainGroupLegend';
            groupLegend.setAttribute('role', 'list');
            groupLegend.setAttribute('aria-label', 'Gruppen im Sitzplan');
            groupLegend.hidden = true;
            grid.appendChild(groupLegend);

            const actions = document.createElement('div');
            actions.className = 'grid-action-buttons';

            const undoButton = document.createElement('button');
            undoButton.type = 'button';
            undoButton.id = 'undoGridButton';
            undoButton.className = 'btn btn-grid-undo';
            undoButton.textContent = 'Rückgängig';
            undoButton.title = 'Nimmt die letzte Änderung am Sitzplan zurück. Mehrfaches Klicken nimmt weitere Änderungen zurück.';
            undoButton.onclick = sitzplanRueckgaengig;
            undoButton.disabled = undoGridHistory.length === 0;
            actions.appendChild(undoButton);

            const resetButton = document.createElement('button');
            resetButton.type = 'button';
            resetButton.id = 'classroomResetButton';
            resetButton.className = 'btn btn-grid-reset';
            resetButton.textContent = 'Zurücksetzen';
            resetButton.title = 'Entfernt alle Tische, das Pult und platzierte Namen aus dem Raster.';
            resetButton.onclick = tischanordnungZuruecksetzen;
            actions.appendChild(resetButton);
            grid.appendChild(actions);

            const saveLayoutButton = document.createElement('button');
            saveLayoutButton.type = 'button';
            saveLayoutButton.className = 'btn grid-save-button';
            saveLayoutButton.textContent = 'Tischanordnung speichern';
            saveLayoutButton.title = 'Speichert nur die Tischpositionen des aktuellen Rasters als eigene Vorlage.';
            saveLayoutButton.onclick = eigeneTischanordnungSpeichern;
            grid.appendChild(saveLayoutButton);

            const primaryActions = document.createElement('div');
            primaryActions.className = 'grid-primary-buttons';

            const printButton = document.createElement('button');
            printButton.type = 'button';
            printButton.className = 'btn btn-secondary';
            printButton.textContent = document.fullscreenElement ? 'Vollbild beenden' : 'Vollbild';
            printButton.title = 'Zeigt den Sitzplan im Vollbild. Mit Escape beenden.';
            printButton.onclick = async () => { try { if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.grid-container').requestFullscreen(); } catch(error) { alert('Vollbild ist in diesem Browser nicht verfügbar.'); } };
            document.addEventListener('fullscreenchange',()=>{printButton.textContent=document.fullscreenElement?'Vollbild beenden':'Vollbild'},{signal:classroomFullscreenSignal()});
            primaryActions.appendChild(printButton);
            const pagePrintButton=document.createElement('button');pagePrintButton.type='button';pagePrintButton.className='btn btn-secondary';pagePrintButton.textContent='Drucken';pagePrintButton.onclick=()=>{window.focus();window.print()};primaryActions.appendChild(pagePrintButton);

            const startButton = document.createElement('button');
            startButton.type = 'button';
            startButton.id = 'classroomStartButton';
            startButton.className = 'btn';
            startButton.textContent = 'Start';
            startButton.title = 'Verteilt die Schüler aus den Listen auf die gesetzten Tische.';
            startButton.onclick = generiereSitzplan;
            primaryActions.appendChild(startButton);
            grid.appendChild(primaryActions);
            aktualisiereZufallButton();
            aktualisiereSchuelersuche();
            aktualisiereGruppenLegende();
        }

        document.addEventListener('pointermove', bewegeTischZiehen, {passive: false});
        window.addEventListener('pointerup', () => { tischZiehenAktiv = false; tischZiehWert = null; });
        window.addEventListener('pointercancel', () => { tischZiehenAktiv = false; tischZiehWert = null; });

        function switchTab(tabId, btnElement) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            const target = document.getElementById('tab-' + tabId);
            if (target) target.classList.add('active');
            if (btnElement) btnElement.classList.add('active');
            aktualisiereExportButtons();
            renderTables();
        }








        function checkDir(group, id) {
            if (group === 'vert') {
                if (id === 'dirUp' && document.getElementById('dirUp').checked) document.getElementById('dirDown').checked = false;
                if (id === 'dirDown' && document.getElementById('dirDown').checked) document.getElementById('dirUp').checked = false;
            } else {
                if (id === 'dirLeft' && document.getElementById('dirLeft').checked) document.getElementById('dirRight').checked = false;
                if (id === 'dirRight' && document.getElementById('dirRight').checked) document.getElementById('dirLeft').checked = false;
            }
        }

        function setzeAbwesenheit(nameKodiert, abwesend, quelle, index) {
            const name = decodeURIComponent(nameKodiert).trim().toLowerCase();
            if (quelle === 'einzel') schuelerEinzel[index].abwesend = abwesend;
            if (quelle === 'paare1') schuelerPaare[index].s1Abwesend = abwesend;
            if (quelle === 'paare2') schuelerPaare[index].s2Abwesend = abwesend;

            if (name) {
                schuelerEinzel.forEach(s => {
                    if ((s.name || '').trim().toLowerCase() === name) s.abwesend = abwesend;
                });
                schuelerPaare.forEach(p => {
                    if ((p.s1 || '').trim().toLowerCase() === name) p.s1Abwesend = abwesend;
                    if ((p.s2 || '').trim().toLowerCase() === name) p.s2Abwesend = abwesend;
                });
            }
            renderTables();
            initGrid();
            datenSpeichern();
        }

function classroomEscapeAttribute(value){return String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
        function classroomSuggestionPeople(){
            const group=typeof classroomCurrentGroup==='function'?classroomCurrentGroup():null;
            const names=group?group.students.filter(p=>!p.deleted).map(p=>p.name):schuelerEinzel.map(p=>p.name);
            return [...new Set(names.filter(name=>name?.trim()))].map(name=>({name,label:sitzplatzKurzname(name)}));
        }
        function classroomNameFromSuggestion(value){
            const normalize=v=>String(v||'').normalize('NFC').trim().toLowerCase();
            const matches=classroomSuggestionPeople().filter(p=>normalize(p.label)===normalize(value));
            return matches.length===1?matches[0].name:value;
        }
        function classroomSuggestNames(value='') {
            let list=document.getElementById('classroomRosterNames');
            if(!list){list=document.createElement('datalist');list.id='classroomRosterNames';document.body.append(list)}
            const normalize=v=>String(v||'').normalize('NFC').trim().toLowerCase(),query=normalize(value);
            const candidates=classroomSuggestionPeople().filter(p=>!query||normalize(p.label).startsWith(query)).sort((a,b)=>a.label.localeCompare(b.label,'de-DE'));
            list.replaceChildren(...candidates.map(person=>{const option=document.createElement('option');option.value=person.label;return option}));
        }
        const classroomNamePopup=document.createElement('div');classroomNamePopup.className='classroom-name-suggestions';classroomNamePopup.hidden=true;classroomNamePopup.setAttribute('role','listbox');document.body.append(classroomNamePopup);
        let classroomNameInput=null,classroomNameOptions=[],classroomNameIndex=-1;
        function classroomHideNames(){if(classroomNamePopup.hidden&&!classroomNameInput)return;classroomNamePopup.hidden=true;if(classroomNameInput)classroomNameInput.setAttribute('aria-expanded','false');classroomNameInput=null;classroomNameIndex=-1}
        function classroomChooseName(index){const input=classroomNameInput,person=classroomNameOptions[index];if(!input||!person)return;input.value=person.label;classroomHideNames();input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));classroomHideNames();input.blur()}
        function classroomShowNames(input){
            const query=input.value.normalize('NFC').trim().toLowerCase();if(!query){classroomHideNames();return}
            classroomNameOptions=classroomSuggestionPeople().filter(p=>p.label.normalize('NFC').toLowerCase().startsWith(query)).sort((a,b)=>a.label.localeCompare(b.label,'de-DE'));if(!classroomNameOptions.length){classroomHideNames();return}
            classroomNameInput=input;classroomNameIndex=-1;classroomNamePopup.replaceChildren();classroomNameOptions.forEach((person,index)=>{const button=document.createElement('button');button.type='button';button.textContent=person.label;button.setAttribute('role','option');button.setAttribute('aria-selected','false');button.onpointerdown=e=>{e.preventDefault();classroomChooseName(index)};classroomNamePopup.append(button)});
            const rect=input.getBoundingClientRect();classroomNamePopup.style.left=rect.left+'px';classroomNamePopup.style.top=(rect.bottom+3)+'px';classroomNamePopup.style.width=rect.width+'px';classroomNamePopup.hidden=false;input.setAttribute('aria-expanded','true');input.setAttribute('aria-autocomplete','list');
        }
        for(const eventName of ['focusin','input'])document.addEventListener(eventName,event=>{if(event.target.matches('input[data-classroom-suggest]'))classroomShowNames(event.target)});
        document.addEventListener('focusout',event=>{if(event.target===classroomNameInput)setTimeout(classroomHideNames,100)});
        document.addEventListener('pointerdown',event=>{if(!classroomNamePopup.contains(event.target)&&event.target!==classroomNameInput)classroomHideNames()},true);
        document.addEventListener('keydown',event=>{if(event.target!==classroomNameInput||classroomNamePopup.hidden)return;if(event.key==='Escape'){classroomHideNames();return}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();classroomNameIndex=(classroomNameIndex+(event.key==='ArrowDown'?1:-1)+classroomNameOptions.length)%classroomNameOptions.length;[...classroomNamePopup.children].forEach((button,i)=>button.setAttribute('aria-selected',String(i===classroomNameIndex)))}else if(event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();classroomChooseName(classroomNameIndex<0?0:classroomNameIndex)}},true);
        window.addEventListener('resize',classroomHideNames);window.addEventListener('scroll',classroomHideNames,true);

        function classroomPairKey(pair){
            const names=[pair.s1,pair.s2].map(value=>classroomNameFromSuggestion(value||'').normalize('NFC').trim().replace(/\s+/g,' ').toLowerCase());
            return names.every(Boolean)?names.sort().join('\u0000'):null;
        }
        function classroomCommitPair(input,type,index,side){
            const list=type==='paare'?schuelerPaare:tabuPaare,other=type==='paare'?tabuPaare:schuelerPaare,pair=list[index];if(!pair)return;
            const value=classroomNameFromSuggestion(input.value),candidate={...pair,[side]:value},key=classroomPairKey(candidate);
            if(key&&other.some(p=>classroomPairKey(p)===key)){
                input.value=sitzplatzKurzname(pair[side]||'');
                input.setCustomValidity(type==='paare'?'Diese beiden Personen sind bereits als Tabu-Paar eingetragen. Bitte zuerst dort entfernen.':'Diese beiden Personen sind bereits als festes Paar eingetragen. Bitte zuerst dort entfernen.');input.reportValidity();return;
            }
            input.setCustomValidity('');pair[side]=value;renderTischanordnungen();datenSpeichern();
        }
        let classroomAnchorDrafts=[];
        let classroomAnchorDraftClass='';
        function classroomRemoveAnchor(index){schuelerEinzel[index].anker='';renderTables();datenSpeichern()}
        function classroomCommitAnchor(input,index){
            const value=input.value.trim().toUpperCase();if(value&&!parseCoord(value)){input.setCustomValidity('Bitte einen gültigen Platz wie A3 eingeben.');input.reportValidity();return}input.setCustomValidity('');
            const draft=classroomAnchorDrafts[index],name=classroomNameFromSuggestion(draft.name),person=schuelerEinzel.find(s=>s.name===name);
            if(!person){input.setCustomValidity('Bitte eine Person aus der Klassenliste auswählen.');input.reportValidity();return}
            if(value&&schuelerEinzel.some(s=>s!==person&&s.anker?.trim().toUpperCase()===value)){input.setCustomValidity('Dieser Ankerplatz ist bereits vergeben.');input.reportValidity();return}
            person.anker=value;classroomAnchorDrafts.splice(index,1);renderTables();datenSpeichern();
        }
        function renderTables() {
            classroomSuggestNames();
            let htmlE = '<tr><th style="width:25px;"></th><th>Name</th><th class="student-centered-cell">Platz</th></tr>';
            if(classroomAnchorDraftClass!==aktuelleKlasse){classroomAnchorDrafts=[];classroomAnchorDraftClass=aktuelleKlasse}
            schuelerEinzel.map((s,i)=>({s,i})).filter(({s})=>s.anker?.trim()).sort((a,b)=>sitzplatzKurzname(a.s.name).localeCompare(sitzplatzKurzname(b.s.name),'de-DE',{sensitivity:'base',numeric:true})).forEach(({s,i}) => {
                htmlE += `<tr><td><button class="btn-delete" title="Nur diese feste Platzzuweisung entfernen." onclick="classroomRemoveAnchor(${i})">-</button></td><td><input type="text" readonly value="${classroomEscapeAttribute(sitzplatzKurzname(s.name))}" title="${classroomEscapeAttribute(s.name)}"></td><td class="student-centered-cell"><input class="student-centered-input" type="text" value="${classroomEscapeAttribute(s.anker)}" placeholder="z.B. A3" onchange="if(this.value.trim()&&!parseCoord(this.value.toUpperCase())){this.setCustomValidity('Bitte einen gültigen Platz wie A3 eingeben.');this.reportValidity();return}this.setCustomValidity('');schuelerEinzel[${i}].anker=this.value.trim().toUpperCase();datenSpeichern();if(!this.value.trim())renderTables()"></td></tr>`;
            });
            classroomAnchorDrafts.forEach((draft,i)=>{htmlE+=`<tr><td><button class="btn-delete" title="Diese Ankerzeile entfernen." onclick="classroomAnchorDrafts.splice(${i},1);renderTables()">-</button></td><td><input data-anchor-draft="${i}" type="text" data-classroom-suggest autocomplete="off" value="${classroomEscapeAttribute(draft.name)}" oninput="classroomAnchorDrafts[${i}].name=this.value"></td><td class="student-centered-cell"><input class="student-centered-input" type="text" placeholder="z.B. A3" onchange="classroomCommitAnchor(this,${i})"></td></tr>`});
            const tE = document.getElementById('tableEinzel');
            if (tE) tE.innerHTML = htmlE;

            let htmlP = '<tr><th style="width:25px;"></th><th>Schüler 1</th><th>Schüler 2</th></tr>';
            schuelerPaare.forEach((p, i) => {
                htmlP += `<tr>
                            <td><button class="btn-delete" title="Dieses Paar aus der Liste löschen." aria-label="Paar löschen" onclick="loescheZeile('paare', ${i})">-</button></td>
                            <td><input type="text" data-classroom-suggest autocomplete="off" value="${classroomEscapeAttribute(sitzplatzKurzname(p.s1))}" oninput="this.setCustomValidity('')" onchange="classroomCommitPair(this,'paare',${i},'s1')"></td>
                            <td><input type="text" data-classroom-suggest autocomplete="off" value="${classroomEscapeAttribute(sitzplatzKurzname(p.s2))}" oninput="this.setCustomValidity('')" onchange="classroomCommitPair(this,'paare',${i},'s2')"></td>
                          </tr>`;
            });
            const tP = document.getElementById('tablePaare');
            if (tP) tP.innerHTML = htmlP;

            let htmlT = '<tr><th style="width:25px;"></th><th>Schüler 1</th><th>Schüler 2</th></tr>';
            tabuPaare.forEach((t, i) => {
                htmlT += `<tr>
                            <td><button class="btn-delete" title="Dieses Tabu-Paar aus der Liste löschen." aria-label="Tabu-Paar löschen" onclick="loescheZeile('tabu', ${i})">-</button></td>
                            <td><input type="text" data-classroom-suggest autocomplete="off" value="${classroomEscapeAttribute(sitzplatzKurzname(t.s1))}" oninput="this.setCustomValidity('')" onchange="classroomCommitPair(this,'tabu',${i},'s1')"></td>
                            <td><input type="text" data-classroom-suggest autocomplete="off" value="${classroomEscapeAttribute(sitzplatzKurzname(t.s2))}" oninput="this.setCustomValidity('')" onchange="classroomCommitPair(this,'tabu',${i},'s2')"></td>
                          </tr>`;
            });
            const tT = document.getElementById('tableTabu');
            if (tT) tT.innerHTML = htmlT;
            renderTischanordnungen();
            aktualisiereExportButtons();
        }

        function loescheZeile(typ, index) {
            if (typ === 'einzel') schuelerEinzel.splice(index, 1);
            else if (typ === 'paare') schuelerPaare.splice(index, 1);
            else if (typ === 'tabu') tabuPaare.splice(index, 1);
            renderTables();
            datenSpeichern();
        }

        async function ankerLoeschen() {
            if (!schuelerEinzel.some(person => String(person.anker || '').trim())&&!classroomAnchorDrafts.length) return;
            if (!await classroomConfirm('Alle festen Platzzuweisungen (Anker) im aktuellen Raum entfernen? Namen, Bewertungen und Sitzordnung bleiben erhalten.')) return;
            schuelerEinzel.forEach(person => { person.anker = ''; });classroomAnchorDrafts=[];
            renderTables();datenSpeichern();
        }

        async function alleLoeschen(typ) {
            const liste = typ === 'einzel' ? schuelerEinzel : typ === 'paare' ? schuelerPaare : tabuPaare;
            if (!liste.length) return;
            if (typ === 'einzel') { ankerLoeschen(); return; }
            const bezeichnung = typ === 'paare' ? 'feste Paare' : 'Tabu-Paare';
            if (!await classroomConfirm(`Alle Vorgaben für ${bezeichnung} aus dieser Liste entfernen? Schülernamen, Bewertungen und Sitzordnung bleiben erhalten.`)) return;
            liste.length = 0;
            renderTables();
            datenSpeichern();
        }

        function addZeileEinzel() { classroomAnchorDraftClass=aktuelleKlasse;classroomAnchorDrafts.push({name:''});renderTables();document.querySelector('#tableEinzel [data-anchor-draft="'+(classroomAnchorDrafts.length-1)+'"]')?.focus(); }
        function addZeilePaare() { schuelerPaare.push({s1:"", s2:"", geschlecht:"m"}); renderTables(); datenSpeichern(); }
        function addZeileTabu() { tabuPaare.push({s1:"", s2:""}); renderTables(); datenSpeichern(); }

        // Liest CSV- und tab-getrennte Textdateien ohne externe Bibliothek.
        // Unterstützt Anführungszeichen, escaped quotes, BOM sowie Komma/Semikolon/Tab.







        function parseCoord(coordStr) {
            if (!coordStr || coordStr.length < 2) return null;
            let colChar = coordStr.charAt(0).toUpperCase();
            let rowPart = parseInt(coordStr.substring(1));
            let c = COL_LETTERS.indexOf(colChar);
            let r = rowPart - 1;
            if (c >= 0 && c < COLS && r >= 0 && r < ROWS) return {r, c};
            return null;
        }

        let classroomFullscreenController;
        function classroomFullscreenSignal(){classroomFullscreenController?.abort();classroomFullscreenController=new AbortController();return classroomFullscreenController.signal}

        window.onload = function() {
            ladeDaten();
            renderTischanordnungen();
            initGrid();
            renderTables();
        };
;

/* ==== sitzplan/index.html (eingebettet) ==== */

        function aktualisiereAppNamenAusCache() {
            const appName = 'Sitzplan-Generator';
            const setzeVersion = version => {
                const name = `${appName} ${version}`;
                document.title = name;
                const titel = document.querySelector('h1');
                if (titel) titel.textContent = name;
                const appleTitel = document.querySelector('meta[name="apple-mobile-web-app-title"]');
                if (appleTitel) appleTitel.content = `Sitzplan ${version}`;
            };

            setzeVersion(document.querySelector('meta[name="app-version"]')?.content || '1.15');
        }
        aktualisiereAppNamenAusCache();
;

/* ==== model.js ==== */
(function(root){
/* 9.92: gemerkt – wird beim Abgleich der Klassenlisten sehr oft mit denselben Namen aufgerufen */const normalizeCache=new Map();const normalize=value=>{const k=String(value||'');let r=normalizeCache.get(k);if(r===undefined){r=k.normalize('NFC').trim().replace(/\s+/g,' ').toLowerCase();if(normalizeCache.size>50000)normalizeCache.clear();normalizeCache.set(k,r)}return r};
const uuid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
function newModel(){return {version:1,classes:[],sourceClasses:{},studentAliases:{}}}
const classNameKey=value=>normalize(value).replace(/^klasse\s+/, '');
// Older imports could create two canonical records for the same unique roster name.
function repairRosterDuplicates(model){
 for(const group of model.classes){
  const names=new Map(),redirects=new Map();
  for(const person of group.students){if(person.deleted)continue;const key=normalize(person.name);if(!key)continue;const kept=names.get(key);if(!kept){names.set(key,person);continue}redirects.set(person.id,kept.id);if(!kept.gender&&person.gender)kept.gender=person.gender;}
  if(!redirects.size)continue;
  for(const alias of Object.values(model.studentAliases||{}))if(redirects.has(alias.id))alias.id=redirects.get(alias.id);
  for(const [oldId,id] of redirects)for(const source of Object.keys(model.sourceClasses||{}))if(model.sourceClasses[source]===group.id)model.studentAliases[source+'::'+oldId]={id,name:names.get(normalize(group.students.find(p=>p.id===oldId).name)).name};
  for(const day of Object.values(group.attendance||{}))for(const [oldId,id] of redirects){if(Object.hasOwn(day,oldId)){day[id]=Boolean(day[id]||day[oldId]);delete day[oldId]}}
  group.students=group.students.filter(person=>!redirects.has(person.id));
 }
 return model;
}
function ingest(model,sources){
 repairRosterDuplicates(model);
 for(const source of sources){
  let group=model.classes.find(item=>item.id===model.sourceClasses[source.id]);
  if(group&&classNameKey(group.name)!==classNameKey(source.label)){group=null;delete model.sourceClasses[source.id]}
  if(!group){group=model.classes.find(item=>classNameKey(item.name)===classNameKey(source.label));if(!group){group={id:'class-'+uuid(),name:source.label,students:[],attendance:{}};model.classes.push(group)}model.sourceClasses[source.id]=group.id}
  if(!group.students.some(student=>!student.deleted)){
   const shared=model.classes.find(item=>item.id!==group.id&&classNameKey(item.name)===classNameKey(source.label)&&item.students.some(student=>!student.deleted));
   if(shared){model.sourceClasses[source.id]=shared.id;group=shared}
  }
  model.sourceClassLabels??={};if(model.sourceClassLabels[source.id]&&model.sourceClassLabels[source.id]!==source.label&&classNameKey(group.name)===classNameKey(source.label))group.name=source.label;model.sourceClassLabels[source.id]=source.label;
  group.attendance??={};let added=false;
  const byName=new Map(group.students.filter(s=>!s.deleted).map(s=>[normalize(s.name),s]));
  for(const input of source.students||[]){
   if(!normalize(input.name))continue;if(group.students.some(s=>s.deleted&&normalize(s.name)===normalize(input.name)))continue;
   const aliasKey=source.id+'::'+input.id,alias=model.studentAliases[aliasKey];
   let student=group.students.find(s=>s.id===input.classroomId)||group.students.find(s=>s.id===input.id)||group.students.find(s=>s.id===alias?.id);
   if(student?.deleted)continue;
   student??=byName.get(normalize(input.name));
   if(!student){student={id:'student-'+uuid(),name:input.name.trim()};group.students.push(student);added=true}
   if(!student.gender&&['m','w','d'].includes(input.gender))student.gender=input.gender;
   // Existing shared names change only through the explicit rename action; stale snapshots cannot rename them back.
   byName.set(normalize(student.name),student);model.studentAliases[aliasKey]={id:student.id,name:input.name};
  }
  // Neu hinzugekommene Personen (z. B. „+ Schüler:in“) alphabetisch einsortieren.
  if(added)sortStudents(group);
 }
 return model;
}
function sortStudents(group){group.students.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'de-DE',{numeric:true,sensitivity:'base'}))}
function seatNameLabels(names){
 const people=new Map();
 for(const value of names){const full=String(value||'').trim();if(!full||['X','PULT'].includes(full))continue;const key=normalize(full);if(people.has(key))continue;
  const comma=full.indexOf(',');let first,last;
  if(comma>=0){last=full.slice(0,comma).trim();first=full.slice(comma+1).trim()||last;}else{const parts=full.split(/\s+/);first=parts.shift();last=parts.join(' ')}
  people.set(key,{first,last});
 }
 const counts=new Map();for(const person of people.values()){const key=normalize(person.first);counts.set(key,(counts.get(key)||0)+1)}
 return new Map([...people].map(([key,person])=>[key,person.first+(counts.get(normalize(person.first))>1&&person.last?' '+Array.from(person.last)[0].toUpperCase()+'.':'')]));
}
function solveSeating({seats,students,tabuPairs=[],fixedPairs=[],alternate=false,maxNodes=70000,maxMillis=1500,random=Math.random,maxGenderConflicts=0,relaxGender=false,alternatePairs=false,pairSlots=false}){
 if(alternate&&relaxGender){
  let result=solveSeating({seats,students,tabuPairs,fixedPairs,alternate,maxNodes,maxMillis,random,alternatePairs,pairSlots});if(result.ok)return result;
  for(let budget=1;budget<=seats.length;budget++){const next=solveSeating({seats,students,tabuPairs,fixedPairs,alternate,maxNodes,maxMillis,random,maxGenderConflicts:budget,alternatePairs,pairSlots});if(next.ok)return {...next,genderRelaxed:true};if(!next.searchLimited&&!next.genderLimited)return next;result=next}
  return result;
 }
 const norm=normalize,people=students.filter(s=>norm(s.name)),byName=new Map();
 for(const s of people){if(byName.has(norm(s.name)))return {ok:false,message:'Ein Name ist mehrfach vorhanden. Bitte unterscheide gleichnamige Personen.'};byName.set(norm(s.name),s)}
 if(people.length>seats.length)return {ok:false,message:`Zu wenige Sitzplätze: ${people.length} Personen, ${seats.length} Plätze.`};
 const seatKey=s=>`${s.r},${s.c}`,seatMap=new Map(seats.map(s=>[seatKey(s),s])),placed=new Map(),occupied=new Map(),banned=new Set();
 for(const p of tabuPairs){const a=norm(p.s1),b=norm(p.s2);if(a&&b){banned.add(a+'|'+b);banned.add(b+'|'+a)}}
 const partner=new Map();
 for(const p of fixedPairs){const a=norm(p.s1),b=norm(p.s2);if(!byName.has(a)||!byName.has(b))continue;if(a===b||partner.has(a)||partner.has(b))return {ok:false,message:'Feste Paare enthalten doppelte oder widersprüchliche Zuordnungen.'};partner.set(a,b);partner.set(b,a)}
 // A U-shaped perimeter is one continuous seating run; interior desks follow it.
 let seatingRuns=null;
 if(pairSlots&&seats.length){
  const top=Math.min(...seats.map(s=>s.r)),left=Math.min(...seats.map(s=>s.c)),right=Math.max(...seats.map(s=>s.c));
  const topSeats=seats.filter(s=>s.r===top).sort((a,b)=>a.c-b.c);
  const arm=c=>{const run=[];for(let r=top+1;seatMap.has(`${r},${c}`);r++)run.push(seatMap.get(`${r},${c}`));return run};
  const l=arm(left),r=arm(right);
  if(right-left>=3&&topSeats.length===right-left+1&&l.length>=2&&r.length>=2){
   let outer=[...l].reverse().concat(topSeats,r);
   const fromRight=seats.find(s=>s.c===left||s.c===right)?.c===right;
   if(fromRight)outer.reverse();
   const perimeter=new Set(outer.map(seatKey)),inside=seats.filter(s=>!perimeter.has(seatKey(s))),runs=[];
   for(const seat of inside){const last=runs[runs.length-1];if(last&&last[last.length-1].r===seat.r&&Math.abs(last[last.length-1].c-seat.c)===1)last.push(seat);else runs.push([seat])}
   seatingRuns=[outer,...runs];seats=seatingRuns.flat();
  }
 }
 const pathNeighbors=seatingRuns?new Set(seatingRuns.flatMap(run=>run.slice(1).flatMap((s,i)=>[seatKey(run[i])+'|'+seatKey(s),seatKey(s)+'|'+seatKey(run[i])]))):null;
 const adjacent=(a,b)=>pathNeighbors?pathNeighbors.has(seatKey(a)+'|'+seatKey(b)):a.r===b.r&&Math.abs(a.c-b.c)===1;
 const gender=s=>['m','w'].includes(String(s.geschlecht||'').toLowerCase())?String(s.geschlecht).toLowerCase():null;
 const compatible=(a,b)=>!banned.has(norm(a.name)+'|'+norm(b.name))&&(!alternate||maxGenderConflicts>0||(alternatePairs&&partner.get(norm(a.name))===norm(b.name))||!gender(a)||!gender(b)||gender(a)!==gender(b));
 const slotMate=new Map(),reservedPairSeats=new Set();
 if(pairSlots){
  const anchored=new Set(people.filter(p=>p.anchor).map(p=>seatKey(p.anchor))),slots=[];let pending=null;
  for(const seat of seats){if(anchored.has(seatKey(seat))){pending=null;continue}if(pending&&adjacent(pending,seat)){slots.push([pending,seat]);pending=null}else pending=seat}
  const needed=partner.size/2;
  if(slots.length<needed)return {ok:false,message:'Mit den Ankerplätzen sind nicht genügend vollständige Paarplätze vorhanden.'};
  for(const [a,b] of slots.slice(0,needed)){slotMate.set(seatKey(a),seatKey(b));slotMate.set(seatKey(b),seatKey(a));reservedPairSeats.add(seatKey(a));reservedPairSeats.add(seatKey(b))}
 }
 let genderConflicts=0;
 const extraConflicts=(person,seat)=>alternate&&gender(person)?[...placed].filter(([name,position])=>adjacent(seat,position)&&!(alternatePairs&&partner.get(norm(person.name))===name)&&gender(byName.get(name))===gender(person)).length:0;
 function valid(person,seat){
  if(pairSlots&&!person.anchor){const paired=partner.has(norm(person.name));if(paired!==reservedPairSeats.has(seatKey(seat)))return false;const mate=partner.get(norm(person.name));if(mate&&placed.has(mate)&&slotMate.get(seatKey(seat))!==seatKey(placed.get(mate)))return false}
  if(occupied.has(seatKey(seat))||genderConflicts+extraConflicts(person,seat)>maxGenderConflicts)return false;
  for(const [name,position] of placed){
   const sameGroup=Number.isInteger(seat.group)&&seat.group===position.group;
   if(sameGroup&&banned.has(norm(person.name)+'|'+name))return false;
   if(adjacent(seat,position)&&!compatible(person,byName.get(name)))return false;
  }
  const mate=partner.get(norm(person.name));if(mate&&placed.has(mate)&&!adjacent(seat,placed.get(mate)))return false;
  return true;
 }
 for(const person of people.filter(s=>s.anchor)){
  const key=norm(person.name),seat=seatMap.get(seatKey(person.anchor));
  if(!seat||!valid(person,seat))return {ok:false,genderLimited:!!seat&&alternate&&genderConflicts+extraConflicts(person,seat)>maxGenderConflicts,message:'Feste Plätze widersprechen der Tischanordnung, einem Tabu-Paar oder dem Geschlechterwechsel.'};
  genderConflicts+=extraConflicts(person,seat);placed.set(key,seat);occupied.set(seatKey(seat),key);
 }
 for(const [a,b] of partner){if(!compatible(byName.get(a),byName.get(b)))return {ok:false,message:'Ein festes Paar widerspricht einem Tabu-Paar oder dem Geschlechterwechsel.'};if(placed.has(a)&&placed.has(b)&&!adjacent(placed.get(a),placed.get(b)))return {ok:false,message:'Ein festes Paar hat getrennte feste Plätze.'}}
 // For a full room without pair/taboo constraints, optimize the gender sequence directly.
 if(alternate&&!partner.size&&!banned.size&&people.length===seats.length&&people.every(p=>gender(p))){
  const ordered=[...seats],counts={m:0,w:0};people.forEach(p=>counts[gender(p)]++);
  const memo=new Map();
  function sequence(i,m,w,last){if(i===ordered.length)return {cost:0,path:[]};const key=[i,m,w,last].join(',');if(memo.has(key))return memo.get(key);let best=null;const fixed=occupied.get(seatKey(ordered[i])),required=fixed?gender(byName.get(fixed)):null;
   for(const g of ['m','w']){if(required&&g!==required||g==='m'&&!m||g==='w'&&!w)continue;const extra=i&&adjacent(ordered[i-1],ordered[i])&&last===g?1:0,next=sequence(i+1,m-(g==='m'),w-(g==='w'),g);if(next&&(!best||extra+next.cost<best.cost))best={cost:extra+next.cost,path:[g,...next.path]}}
   memo.set(key,best);return best;
  }
  const best=sequence(0,counts.m,counts.w,'');
  if(best&&best.cost<=maxGenderConflicts){const pools={m:[],w:[]};people.filter(p=>!p.anchor).forEach(p=>pools[gender(p)].push(p));for(const g of ['m','w'])for(let i=pools[g].length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pools[g][i],pools[g][j]]=[pools[g][j],pools[g][i]]}return {ok:true,genderConflicts:best.cost,placements:ordered.map((seat,i)=>({name:occupied.has(seatKey(seat))?byName.get(occupied.get(seatKey(seat))).name:pools[best.path[i]].pop().name,...seat})),nodes:memo.size}}
 }
 // Identical unrestricted pupils must not generate factorially many equivalent searches.
 const restricted=new Set([...partner.keys(),...tabuPairs.flatMap(p=>[norm(p.s1),norm(p.s2)])]);
 const failedStates=new Set();
 function genderCapacity(g){
  const available=seats.filter(seat=>!occupied.has(seatKey(seat))&&![...placed].some(([name,pos])=>gender(byName.get(name))===g&&adjacent(seat,pos))).sort((a,b)=>a.r-b.r||a.c-b.c);
  let capacity=0,last=null;for(const seat of available){if(!last||!adjacent(last,seat)){capacity++;last=seat}}return capacity;
 }
 function genderProblem(){if(!alternate||alternatePairs)return null;for(const g of ['m','w']){const remaining=people.filter(p=>!placed.has(norm(p.name))&&gender(p)===g).length,capacity=genderCapacity(g);if(remaining>capacity+maxGenderConflicts-genderConflicts)return {gender:g,remaining,capacity}}return null}
 const impossible=genderProblem();
 if(impossible)return {ok:false,genderLimited:true,message:`Die Klassenliste wurde geladen (${people.length} Personen). Der strenge Geschlechterwechsel ist mit dieser Tischanordnung und den Ankerplätzen nicht möglich: Für ${impossible.remaining} weitere ${impossible.gender==='m'?'männliche':'weibliche'} Personen sind höchstens ${impossible.capacity} passende Plätze verfügbar. Wähle „Geschlecht nach Zufall“ oder ändere die Anordnung.`};
 const order=people.filter(s=>!placed.has(norm(s.name)));for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
 if(alternate&&!partner.size){const counts=new Map();for(const p of order)counts.set(gender(p),(counts.get(gender(p))||0)+1);order.sort((a,b)=>(counts.get(gender(a))||0)-(counts.get(gender(b))||0))}
 let nodes=0,limited=false;const deadline=Date.now()+maxMillis;
 function search(){
  if(placed.size===people.length)return true;
  if(++nodes>maxNodes||Date.now()>deadline){limited=true;return false}
  if(genderProblem())return false;
  const state=seats.map(seat=>{const name=occupied.get(seatKey(seat));return name?(restricted.has(name)?name:'gender:'+String(alternate?gender(byName.get(name)):'any')):''}).join('|');
  if(failedStates.has(state))return false;
  // Place complete pairs in directional seat order, rather than permuting individual partners.
  if(pairSlots){
   const seat=seats.find(s=>reservedPairSeats.has(seatKey(s))&&!occupied.has(seatKey(s)));
   if(seat){const other=seatMap.get(slotMate.get(seatKey(seat))),seen=new Set();
    for(const p of order){const name=norm(p.name),mate=partner.get(name);if(placed.has(name)||!mate||placed.has(mate))continue;const q=byName.get(mate);
     const tabooNames=new Set(tabuPairs.flatMap(t=>[norm(t.s1),norm(t.s2)]));const type=tabooNames.has(name)||tabooNames.has(mate)?name:gender(p)+'/'+gender(q);if(seen.has(type))continue;seen.add(type);
     if(!valid(p,seat))continue;const a=extraConflicts(p,seat);genderConflicts+=a;placed.set(name,seat);occupied.set(seatKey(seat),name);
     if(valid(q,other)){const b=extraConflicts(q,other);genderConflicts+=b;placed.set(mate,other);occupied.set(seatKey(other),mate);if(search())return true;placed.delete(mate);occupied.delete(seatKey(other));genderConflicts-=b}
     placed.delete(name);occupied.delete(seatKey(seat));genderConflicts-=a;if(limited)return false;
    }
    if(!limited)failedStates.add(state);return false;
   }
  }
  let selected=null,candidates=null;const seenTypes=new Set();
  for(const p of order){const name=norm(p.name);if(placed.has(name))continue;const type=restricted.has(name)?name:'gender:'+String(alternate?gender(p):'any');if(seenTypes.has(type))continue;seenTypes.add(type);
   const options=seats.filter(seat=>{
    if(!valid(p,seat))return false;
    const mate=partner.get(name);if(mate&&!placed.has(mate)){const m=byName.get(mate);return seats.some(other=>adjacent(seat,other)&&(!pairSlots||slotMate.get(seatKey(seat))===seatKey(other))&&seatKey(other)!==seatKey(seat)&&valid(m,other)&&compatible(p,m))}
    return true;
   });
   if(!options.length)return false;
   if(!candidates||options.length<candidates.length){selected=p;candidates=options;if(options.length===1)break}
  }
  const name=norm(selected.name);
  candidates.sort((a,b)=>extraConflicts(selected,a)-extraConflicts(selected,b));
  for(const seat of candidates){const extra=extraConflicts(selected,seat);genderConflicts+=extra;placed.set(name,seat);occupied.set(seatKey(seat),name);if(search())return true;placed.delete(name);occupied.delete(seatKey(seat));genderConflicts-=extra;if(limited)return false}
  if(!limited)failedStates.add(state);
  return false;
 }
 if(!search())return {ok:false,searchLimited:limited,genderLimited:alternate,message:limited?'Innerhalb der Suchgrenze wurde kein passender Plan gefunden. Erneut versuchen oder Regeln lockern.':'Diese Vorgaben lassen sich mit der aktuellen Tischanordnung nicht erfüllen.'};
 const exceptionNames=new Set();
 if(alternatePairs)for(let i=0;i<people.length;i++)for(let j=i+1;j<people.length;j++){
  const a=people[i],b=people[j],ak=norm(a.name),bk=norm(b.name);
  if(!adjacent(placed.get(ak),placed.get(bk))||!gender(a)||!gender(b))continue;
  const mixedRemainder=!partner.has(ak)&&!partner.has(bk)&&gender(a)!==gender(b);
  const brokenAlternation=alternate&&partner.get(ak)!==bk&&gender(a)===gender(b);
  if(mixedRemainder||brokenAlternation){exceptionNames.add(a.name);exceptionNames.add(b.name)}
 }
 return {ok:true,genderConflicts,exceptionNames:[...exceptionNames],placements:people.map(p=>({name:p.name,...placed.get(norm(p.name))})),nodes};
}
const api={normalize,newModel,repairRosterDuplicates,ingest,solveSeating,seatNameLabels,sortStudents};if(typeof module!=='undefined')module.exports=api;else root.ClassroomCore=api;
})(globalThis);
;

/* ==== sitzplan/classroom-link.js ==== */
const classroomLinkMapKey='classroom-manager-linked-classes-v1';
function classroomReadLinks(){try{return JSON.parse(localStorage.getItem(classroomLinkMapKey)||'{}')}catch{return {}}}
function classroomStoragePrefix(name){return 'sitzplan_'+name.replace(/\s+/g,'_')+'_'}
const classroomNameCache=new Map();function classroomNormalizeName(name){const k=String(name||'');let r=classroomNameCache.get(k);if(r===undefined){r=k.normalize('NFC').trim().replace(/\s+/g,' ').toLowerCase();if(classroomNameCache.size>50000)classroomNameCache.clear();classroomNameCache.set(k,r)}return r}
function classroomReadArray(key){const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}
const classroomOriginalClassDropdown=aktualisiereKlassenDropdown;
aktualisiereKlassenDropdown=function(){
  classroomOriginalClassDropdown();
  const links=classroomReadLinks();
  const byName=new Map(Object.values(links).map(item=>[item.storageName,item.label]));
  for(const option of document.getElementById('klassenSelect')?.options||[])if(byName.has(option.value))option.textContent=byName.get(option.value);
  const title=document.getElementById('titelKlasse');if(title&&byName.has(aktuelleKlasse))title.textContent='Klassenraum ('+byName.get(aktuelleKlasse)+')';
};
// Eingebaute fiktive Beispielklassen: passende Sitzordnung, sobald die Klasse zum ersten Mal ankommt (nie für eigene Klassen).
// Raster 10×10, vorne = unten (Pult). '.' kein Tisch, 'X' Tisch, 'P' Pult, Ziffer = Tisch einer Gruppentisch-Insel (nur zur Lesbarkeit).
const classroomDemoLayouts=(()=>{
 const reihen2=['XX.XXXX.XX','..........','XX.XXXX.XX','..........','XX.XXXX.XX','..........','XX.XXXX.XX','..........','..........','....PP....'];
 const reihen3=['XXX.XX.XXX','..........','XXX.XX.XXX','..........','XXX.XX.XXX','..........','XXX.XX.XXX','..........','..........','....PP....'];
 const gruppen=['00..11..22','00..11..22','..........','33..44..55','33..44..55','..........','66......77','66......77','..........','....PP....'];
 const uForm=['XXXXXXXXXX','X........X','X........X','X........X','X........X','X........X','X........X','X........X','..........','....PP....'];
 const doppelU=['XXXXXXXXXX','X........X','X.XXXXXX.X','X.X....X.X','X.X....X.X','X.X....X.X','X........X','X........X','..........','....PP....'];
 return {'demo-class-1':gruppen,'demo-class-2':reihen2,'demo-class-3':uForm,'demo-class-4':gruppen,'demo-class-5':reihen3,'demo-class-6':reihen2,'demo-class-7':doppelU,'demo-class-8':uForm};
})();
function classroomDemoSeating(demoId,names){
 const map=classroomDemoLayouts[demoId];if(!map)return null;
 let seed=[...demoId].reduce((a,c)=>a*31+c.charCodeAt(0),7)>>>0;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;
 const list=[...names];for(let i=list.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[list[i],list[j]]=[list[j],list[i]]}
 const grid=map.map(row=>[...row].map(ch=>ch==='.'?'':ch==='P'?'PULT':'X'));
 // Plätze von vorne nach hinten besetzen, damit leere Tische hinten bleiben.
 const seats=[];for(let r=grid.length-1;r>=0;r--)for(let c=0;c<grid[r].length;c++)if(grid[r][c]==='X')seats.push([r,c]);
 seats.slice(0,list.length).forEach(([r,c],i)=>grid[r][c]=list[i]);
 return {grid};
}
function classroomSyncRosters(snapshot){
  if(!snapshot||!Array.isArray(snapshot.classes))throw new Error('Klassen fehlen');
  datenSpeichern();
  const links=classroomReadLinks();let added=0,people=0;
  for(const item of snapshot.classes){
    if(typeof item.id!=='string'||typeof item.label!=='string'||!Array.isArray(item.students))continue;
    const storageName=links[item.id]?.storageName||`NM:${encodeURIComponent(item.id)}`;
    links[item.id]={storageName,label:item.subject?`${item.label} · ${item.subject}`:item.label};
    const prefix=classroomStoragePrefix(storageName);
    const roster=classroomReadArray(prefix+'einzel');
    const pairs=classroomReadArray(prefix+'paare');
    let grid=JSON.parse(localStorage.getItem(prefix+'grid')||'null');
    const rename=(before,after)=>{
      if(!before||before===after)return;
      if(Array.isArray(grid))grid=grid.map(row=>Array.isArray(row)?row.map(value=>value===before?after:value):row);
      for(const pair of pairs){if(pair.s1===before)pair.s1=after;if(pair.s2===before)pair.s2=after;}
    };
    for(const source of item.students){
      const name=String(source.name||'').trim();if(!name)continue;
      const existing=roster.find(student=>(source.id&&student.classroomId===source.id)||classroomNormalizeName(student.name)===classroomNormalizeName(name));
      if(existing){rename(existing.name,name);existing.name=name;existing.classroomId=source.id;if(Object.hasOwn(source,'gender'))existing.geschlecht=source.gender||'';}
      else{roster.push({name,geschlecht:source.gender||'',anker:'',classroomId:source.id});added++;}
      people++;
    }
    localStorage.setItem(prefix+'einzel',JSON.stringify(roster));
    localStorage.setItem(prefix+'paare',JSON.stringify(pairs));
    if(!grid&&item.demo&&localStorage.getItem(prefix+'grid')===null){const seated=classroomDemoSeating(item.demo,roster.map(s=>s.name));if(seated)grid=seated.grid;}
    if(grid)localStorage.setItem(prefix+'grid',JSON.stringify(grid));
    if(!klassenListe.includes(storageName))klassenListe.push(storageName);
  }
  // Mit den Noten-Beispielklassen sind die alten Sitzplan-Beispiele „Klasse 7a/9b“ (nur Vornamen, ohne Plan) doppelt – unverändert ausblenden.
  if(snapshot.classes.some(item=>item.demo)&&typeof BEISPIELKLASSEN==='object')for(const [name,roster] of Object.entries(BEISPIELKLASSEN)){
    if(!klassenListe.includes(name)||klassenListe.length<2)continue;const prefix=classroomStoragePrefix(name);
    try{const people=classroomReadArray(prefix+'einzel').map(s=>s.name),grid=JSON.parse(localStorage.getItem(prefix+'grid')||'[]');
      const untouched=people.join('|')===roster.map(r=>r[0]).join('|')&&!(Array.isArray(grid)&&grid.flat().some(v=>v&&v!=='X'&&v!=='PULT'));
      if(untouched){klassenListe=klassenListe.filter(k=>k!==name);if(aktuelleKlasse===name)aktuelleKlasse=klassenListe[0]}}catch{}
  }
  localStorage.setItem(classroomLinkMapKey,JSON.stringify(links));
  localStorage.setItem('sitzplan_klassen_liste',JSON.stringify(klassenListe));
  const target=links[snapshot.activeClass]?.storageName||aktuelleKlasse;
  localStorage.setItem('sitzplan_aktuelle_klasse',target);
  ladeDaten();initGrid();renderTables();
  const status=document.getElementById('classroomSyncStatus');
  status.textContent=snapshot.classes.length?`${snapshot.classes.length} Klassen aus dem Noten-Manager · ${people} Namen${added?' · '+added+' neu':''}`:'Im Noten-Manager sind noch keine Klassen angelegt.';
}
const classroomSyncBox=document.createElement('div');
classroomSyncBox.className='classroom-sync';
classroomSyncBox.innerHTML='<button type="button" class="btn btn-secondary" id="classroomSyncButton">Klassen aktualisieren</button><p id="classroomSyncStatus" role="status" aria-live="polite">Klassen aus dem Noten-Manager übernehmen</p>';
document.querySelector('.class-selector-box')?.append(classroomSyncBox);
document.getElementById('classroomSyncButton').addEventListener('click',()=>{document.getElementById('classroomSyncStatus').textContent='Klassen werden aktualisiert …';parent.postMessage({type:'classroom:request-rosters'},'*');});
window.addEventListener('message',event=>{
  if(event.source!==parent)return;
  if(event.data?.type==='classroom:rosters'){
    try{classroomSyncRosters(event.data.snapshot);}catch(error){console.error(error);document.getElementById('classroomSyncStatus').textContent='Die Übernahme konnte nicht abgeschlossen werden. Bitte erneut aktualisieren.';}
  }else if(event.data?.type==='classroom:sync-error')document.getElementById('classroomSyncStatus').textContent=event.data.message;
});
// Bereitschaft wird nach dem Laden des Sitzplans gemeldet.

let classroomLinkedModel=null,classroomLinkedSnapshot=null;
const classroomDate=document.createElement('input');classroomDate.type='date';classroomDate.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);classroomDate.setAttribute('aria-label','Unterrichtsdatum');
window.classroomDateInput=classroomDate; // für den Stundenplan im Hauptfenster („Aktuell“ setzt das Datum der Stunde)
const classroomDateLabel=document.createElement('label');classroomDateLabel.className='classroom-date-only';classroomDateLabel.textContent='Datum';classroomDateLabel.append(classroomDate);document.querySelector('.class-selector-box')?.prepend(classroomDateLabel);
const classroomMode=document.createElement('label');classroomMode.className='classroom-mode-toggle';classroomMode.innerHTML='<input type="checkbox" id="classroomEditRoom" role="switch" aria-label="Sitzplanmodus"><span class="classroom-mode-track" aria-hidden="true"></span><span id="classroomModeLabel">Bewertungsmodus</span>';document.querySelector('.room-header')?.append(classroomMode);
document.getElementById('classroomEditRoom').addEventListener('change',event=>{document.getElementById('classroomModeLabel').textContent=event.target.checked?'Sitzplanmodus':'Bewertungsmodus'});
const classroomRosterButton=document.createElement('button');classroomRosterButton.type='button';classroomRosterButton.className='btn btn-secondary';classroomRosterButton.textContent='Gemeinsame Klassenliste';document.querySelector('.class-selector-box')?.append(classroomRosterButton);
function classroomCurrentGroup(){return classroomLinkedModel?.classes.find(g=>classroomReadLinks()[g.id]?.storageName===aktuelleKlasse)}
function classroomMarkAbsent(){const group=classroomCurrentGroup();if(!group)return;for(const cell of document.querySelectorAll('.room-grid .cell')){const name=gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)],person=group.students.find(s=>ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name));const absent=person&&group.attendance?.[classroomDate.value]?.[person.id];cell.classList.toggle('classroom-absent',!!absent);if(person){cell.tabIndex=0;cell.setAttribute('role','button');cell.setAttribute('aria-label',person.name+(absent?' – abwesend':' – Bewertung erfassen'));}}}
classroomHooks.add('initGrid','classroom-link: Abwesende markieren',{after(){classroomMarkAbsent()}});
function classroomApplyAttendance(){const group=classroomCurrentGroup();if(!group)return;const flags=group.attendance?.[classroomDate.value]||{};for(const person of schuelerEinzel){const central=group.students.find(s=>s.id===person.classroomId||ClassroomCore.normalize(s.name)===ClassroomCore.normalize(person.name));person.abwesend=!!flags[central?.id]}
 for(const pair of schuelerPaare)for(const side of ['s1','s2']){const person=group.students.find(s=>ClassroomCore.normalize(s.name)===ClassroomCore.normalize(pair[side]));pair[side+'Abwesend']=!!flags[person?.id]}
 /* 12.53: nur neu aufbauen, wenn sich Anwesenheit, Klasse, Datum oder Liste wirklich geändert haben (nach jeder Bewertung kommt derselbe Stand) */
 {const sig=JSON.stringify([group.id,classroomDate.value,aktuelleKlasse,schuelerEinzel.map(p=>p.name+(p.abwesend?'!':'')),schuelerPaare.map(p=>p.s1+'/'+p.s2+(p.s1Abwesend?'!':'')+(p.s2Abwesend?'!':''))]);if(sig===window.__cmAttSig&&!classroomApplyAttendance.force)return;window.__cmAttSig=sig}
 renderTables();initGrid();datenSpeichern();
}
classroomDate.onchange=classroomApplyAttendance;
// Dismiss the native date picker when focus moves outside its input.
document.addEventListener('pointerdown',event=>{if(event.target!==classroomDate)classroomDate.blur()},true);
window.addEventListener('blur',()=>classroomDate.blur());
window.addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='classroom:dismiss-date-picker')classroomDate.blur()});

classroomHooks.add('klasseWechseln','classroom-link: Anwesenheit und Stunde',{after(){classroomApplyAttendance();if(typeof classroomRefreshLesson==='function')classroomRefreshLesson()}});
const classroomOriginalAbsence=setzeAbwesenheit;setzeAbwesenheit=function(name,absent,source,index){classroomOriginalAbsence(name,absent,source,index);const group=classroomCurrentGroup(),person=group?.students.find(s=>ClassroomCore.normalize(s.name)===ClassroomCore.normalize(decodeURIComponent(name)));if(person)parent.postMessage({type:'classroom:attendance',classId:group.id,studentId:person.id,date:classroomDate.value,absent},'*')};
classroomRosterButton.onclick=()=>parent.postMessage({type:'classroom:roster-request',classId:classroomCurrentGroup()?.id},'*');
let classroomPendingLinked=null;const classroomHiddenFrame=()=>{try{return !!window.frameElement?.hidden}catch{return false}};
try{if(window.frameElement)new MutationObserver(()=>{if(classroomPendingLinked&&!classroomHiddenFrame()){const e=classroomPendingLinked;classroomPendingLinked=null;window.dispatchEvent(new MessageEvent('message',{data:e.data,source:parent}))}}).observe(window.frameElement,{attributes:true,attributeFilter:['hidden']})}catch{}
window.addEventListener('message',event=>{
 if(event.source!==parent)return;const msg=event.data;
 if(msg?.type==='classroom:linked-state'&&classroomHiddenFrame()&&!msg.id){classroomLinkedModel=msg.model;classroomLinkedSnapshot=msg.snapshot;classroomPendingLinked=event;return}
 if(msg?.type==='classroom:linked-state'){
  classroomMigrateSeatNames(msg.model);classroomLinkedModel=msg.model;classroomLinkedSnapshot=msg.snapshot;
  if(!msg.snapshot)return;
  const oldLinks=classroomReadLinks();
  for(const group of msg.model.classes){if(!oldLinks[group.id]){const source=Object.keys(msg.model.sourceClasses).find(k=>msg.model.sourceClasses[k]===group.id&&oldLinks[k]);if(source)oldLinks[group.id]=oldLinks[source];}}
  localStorage.setItem(classroomLinkMapKey,JSON.stringify(oldLinks));
  const activeIds=new Set(msg.snapshot.classes.map(c=>msg.model.sourceClasses[c.id]));
  const classes=msg.model.classes.filter(g=>activeIds.has(g.id)).map(g=>({id:g.id,demo:(Object.keys(msg.model.sourceClasses).find(k=>msg.model.sourceClasses[k]===g.id&&/::demo-class-\d+$/.test(k))||'').split('::').pop()||'',label:g.name,subject:'',students:g.students.filter(s=>!s.deleted).map(s=>({id:s.id,name:s.name,gender:s.gender||''}))}));
  // Keep a manually selected seating class when only an attendance/value update arrives.
  const active=msg.model.sourceClasses[msg.snapshot.activeClass];
  const shouldFollow=classroomLastSource!==msg.snapshot.activeClass;
  classroomLastSource=msg.snapshot.activeClass;
  /* 12.53: Nach jeder Bewertung schickt der Noten-Manager den Stand – Klassenlisten unverändert? Dann den Sitzplan nicht komplett neu aufbauen (sparte ~70 ms je Bewertung) */
  {const act=shouldFollow?active:classroomCurrentGroup()?.id||active,sig=JSON.stringify([classes,act]),links=classroomReadLinks(),target=links[act]?.storageName;
   if(sig!==window.__cmRosterSig||!target||target!==aktuelleKlasse){classroomSyncRosters({classes,activeClass:act});window.__cmRosterSig=sig}}
  // The central class list is authoritative; remove deleted pupils from linked local lists and placements.
  const group=classroomCurrentGroup();if(group){const allowed=new Set(group.students.filter(s=>!s.deleted).map(s=>s.id));const removed=schuelerEinzel.filter(s=>s.classroomId&&!allowed.has(s.classroomId));schuelerEinzel=schuelerEinzel.filter(s=>!s.classroomId||allowed.has(s.classroomId));for(const person of removed){for(const row of gridData)for(let c=0;c<row.length;c++)if(row[c]===person.name)row[c]='X';schuelerPaare=schuelerPaare.filter(p=>p.s1!==person.name&&p.s2!==person.name);tabuPaare=tabuPaare.filter(p=>p.s1!==person.name&&p.s2!==person.name)}}
  classroomApplyAttendance();
  if(typeof classroomRefreshLesson==='function')classroomRefreshLesson();
 }else if(msg?.type==='classroom:backup-request'){
  datenSpeichern();const values={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('sitzplan_')||key.startsWith('classroom-manager-linked-classes-'))values[key]=localStorage.getItem(key)}parent.postMessage({type:'classroom:backup-result',id:msg.id,values},'*');
 }else if(msg?.type==='classroom:restore'){
  const before={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith('sitzplan_')||key.startsWith('classroom-manager-linked-classes-'))before[key]=localStorage.getItem(key)}
  try{for(const key of Object.keys(before))localStorage.removeItem(key);for(const [key,value] of Object.entries(msg.values))localStorage.setItem(key,value);parent.postMessage({type:'classroom:restore-result',id:msg.id,ok:true},'*')}
  catch(error){for(const key of Object.keys(msg.values))localStorage.removeItem(key);for(const [key,value] of Object.entries(before))localStorage.setItem(key,value);parent.postMessage({type:'classroom:error',id:msg.id,ok:false,message:'Die Sitzplandaten konnten nicht geladen werden.'},'*')}
 }
});
let classroomLastSource=null;
// Sitzplatz-Klicks und Ziehen werden in seat-drag.js gemeinsam behandelt.
document.addEventListener('keydown',event=>{const cell=event.target.closest('.room-grid .cell');if(cell&&['Enter',' '].includes(event.key)&&!document.getElementById('classroomEditRoom').checked){event.preventDefault();classroomOpenStudent(gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)])}});
// Replace the generator with a constraint solver; a failed search leaves the current plan intact.
generiereSitzplan=function(){
 const seats=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(gridData[r][c]&&gridData[r][c]!=='PULT')seats.push({r,c,group:Number.isInteger(gridGroupData[r]?.[c])?gridGroupData[r][c]:null});
 if(!seats.length){setzeBelegungsstatus('Setze zuerst Tische im „Sitzplanmodus“.',false);return}
 // Older layouts may have no saved group IDs: recognize two-dimensional table blocks.
 if(!seats.some(seat=>Number.isInteger(seat.group))){
  const remaining=new Map(seats.map(seat=>[seat.r+','+seat.c,seat])),blocks=[];
  while(remaining.size){const first=remaining.values().next().value,block=[first];remaining.delete(first.r+','+first.c);for(let i=0;i<block.length;i++)for(const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]){const key=(block[i].r+dr)+','+(block[i].c+dc),next=remaining.get(key);if(next){remaining.delete(key);block.push(next)}}blocks.push(block)}
  const groups=blocks.filter(block=>new Set(block.map(seat=>seat.r)).size>1&&new Set(block.map(seat=>seat.c)).size>1);
  if(groups.length>1)groups.forEach((block,index)=>block.forEach(seat=>seat.group=index));
 }

 const fromBottom=document.getElementById('dirUp').checked,fromRight=document.getElementById('dirLeft').checked;seats.sort((a,b)=>(fromBottom?b.r-a.r:a.r-b.r)||(fromRight?b.c-a.c:a.c-b.c));
 const groupLayout=seats.some(seat=>Number.isInteger(seat.group));
 const selectedMode=document.querySelector('input[name="belegung"]:checked')?.value||'einzeln';
 const mode=groupLayout&&selectedMode==='festePaare'?'einzeln':selectedMode,alternate=document.querySelector('input[name="geschlecht"]:checked')?.value==='wechsel';
 const randomPairs=['zufallsPaare','gleichgeschlechtlichePaare'].includes(mode),sameGender=mode==='gleichgeschlechtlichePaare';
 const ignoreAnchors=groupLayout;
 const people=new Map(),norm=ClassroomCore.normalize,add=(name,gender,anchor)=>{if(ignoreAnchors)anchor=null;if(!norm(name))return;const key=norm(name),old=people.get(key);if(!old)people.set(key,{name:String(name).trim(),geschlecht:String(gender||'').toLowerCase().trim(),...(anchor?{anchor}: {})});else{if(!old.geschlecht)old.geschlecht=gender||'';if(anchor)old.anchor=anchor}};
 for(const s of schuelerEinzel.filter(istAnwesend))if(mode!=='festePaare'||s.anker){const anchor=!ignoreAnchors&&s.anker?.trim()?parseCoord(s.anker.trim()):null;if(!ignoreAnchors&&s.anker?.trim()&&!anchor){setzeBelegungsstatus('Ungültiger fester Platz für '+s.name+'.',false);return}add(s.name,s.geschlecht,anchor)}
 const individualNames=schuelerEinzel.filter(istAnwesend).map(s=>norm(s.name)).filter(Boolean);if(mode!=='festePaare'&&new Set(individualNames).size!==individualNames.length){setzeBelegungsstatus('Bitte gleichnamige oder doppelte Einträge in der Schülerliste unterscheiden.',false);return}
 const fixed=[];if(mode==='festePaare')for(const p of schuelerPaare){const a=p.s1&&!p.s1Abwesend?p.s1:'',b=p.s2&&!p.s2Abwesend?p.s2:'';for(const name of [a,b]){const row=schuelerEinzel.find(s=>norm(s.name)===norm(name));add(name,row?.geschlecht||p.geschlecht,row?.anker?parseCoord(row.anker):null)}if(a&&b)fixed.push({s1:a,s2:b})}
 let result;
 for(let attempt=0;attempt<(randomPairs?16:1);attempt++){
  const pairs=[...fixed];
  if(sameGender){
   const buckets=new Map();for(const person of people.values()){if(person.anchor||!['m','w','d'].includes(person.geschlecht))continue;if(!buckets.has(person.geschlecht))buckets.set(person.geschlecht,[]);buckets.get(person.geschlecht).push(person)}
   let blocked=false;
   for(const members of buckets.values()){const pool=members.sort(()=>Math.random()-.5);while(pool.length>1){const first=pool.shift(),index=pool.findIndex(other=>!tabuPaare.some(p=>[norm(p.s1),norm(p.s2)].includes(norm(first.name))&&[norm(p.s1),norm(p.s2)].includes(norm(other.name))));if(index<0){blocked=true;break}pairs.push({s1:first.name,s2:pool.splice(index,1)[0].name})}}
   if(blocked){result={ok:false,message:'Mit diesen Tabu-Paaren konnten keine gleichgeschlechtlichen Zufallspaare gebildet werden.'};continue}
  }
  if(mode==='zufallsPaare'){const pool=[...people.values()].sort(()=>Math.random()-.5);while(pool.length>1){const first=pool.shift();if(alternate)pool.sort((a,b)=>Number(a.geschlecht===first.geschlecht)-Number(b.geschlecht===first.geschlecht));const index=pool.findIndex(other=>!tabuPaare.some(p=>[norm(p.s1),norm(p.s2)].includes(norm(first.name))&&[norm(p.s1),norm(p.s2)].includes(norm(other.name))));if(index<0)break;pairs.push({s1:first.name,s2:pool.splice(index,1)[0].name})}if(pairs.length!==Math.floor(people.size/2)){result={ok:false,message:'Unter diesen Vorgaben konnten keine zufälligen Paare gebildet werden. Prüfe Tabu-Paare und Geschlechterangaben.'};continue}}
  result=ClassroomCore.solveSeating({seats,students:[...people.values()],tabuPairs:tabuPaare,fixedPairs:pairs,alternate,alternatePairs:sameGender,pairSlots:sameGender,relaxGender:true,maxNodes:randomPairs?8000:70000,maxMillis:randomPairs?120:1500});if(result.ok)break;
 }
 if(!result?.ok){setzeBelegungsstatus(result?.message||'Es wurde kein passender Plan gefunden.',false);return}
 merkeSitzplanFuerUndo();for(const seat of seats)gridData[seat.r][seat.c]='X';for(const p of result.placements)gridData[p.r][p.c]=p.name;zufallsAuswahl=null;initGrid();datenSpeichern();
 const ruleExceptions=sameGender&&result.exceptionNames?.length?' Die Paarregel konnte bei '+result.exceptionNames.map(name=>String(name).includes(',')?String(name).split(',').slice(1).join(',').trim():String(name).trim()).join(' und ')+' nicht angewendet werden.':'';
 setzeBelegungsstatus(`${result.placements.length} Personen platziert${sameGender?' · gleichgeschlechtliche Zufallspaare':''} · Tabu-Paare berücksichtigt${alternate?(result.genderConflicts?(sameGender?' · Paarwechsel mit ':' · Geschlechterwechsel mit ')+result.genderConflicts+(result.genderConflicts===1?' Ausnahme':' Ausnahmen'):(sameGender?' · Paare im Geschlechterwechsel':' · Geschlechterwechsel aktiv (bekannte m/w-Angaben)')):''}.${ruleExceptions}`,true);
};
window.addEventListener('load',()=>{parent.postMessage({type:'classroom:seat-ready'},'*')});
const classroomOriginalDeleteRow=loescheZeile;loescheZeile=async function(type,index){const group=classroomCurrentGroup(),student=schuelerEinzel[index];if(type==='einzel'&&group&&student?.classroomId){if(await classroomConfirm('Diese Person aus der gemeinsamen Klassenliste und den Bewertungslisten entfernen?'))parent.postMessage({type:'classroom:roster-delete',classId:group.id,studentIds:[student.classroomId]},'*');return}classroomOriginalDeleteRow(type,index)};
const classroomOriginalClearList=alleLoeschen;alleLoeschen=function(type){if(type==='einzel'){ankerLoeschen();return}classroomOriginalClearList(type)};
const classroomOldNewClass=neueKlasseHinzufuegen;neueKlasseHinzufuegen=function(){parent.postMessage({type:'classroom:manage-classes',classId:classroomCurrentGroup()?.id,create:true},'*')};
const classroomOldDeleteClass=klasseLoeschen;klasseLoeschen=function(){const group=classroomCurrentGroup();if(group)parent.postMessage({type:'classroom:manage-classes',classId:group.id},'*');else classroomOldDeleteClass()};
// Explain the two modes where the room is shown.
const classroomRoomHelp=document.querySelector('.room-header')?.nextElementSibling;
if(classroomRoomHelp?.classList.contains('info-text'))classroomRoomHelp.textContent='Bewertungsmodus: Namen zum Verschieben oder Tauschen ziehen; kurzer Klick öffnet die Bewertung. Sitzplanmodus: Tische setzen oder entfernen; Rechtsklick für das Pult.';
document.addEventListener('contextmenu',event=>{if(event.target.closest('.room-grid .cell')&&classroomCurrentGroup()&&!document.getElementById('classroomEditRoom').checked){event.preventDefault();event.stopImmediatePropagation()}},true);

function classroomMigrateSeatNames(model){
 const links=classroomReadLinks();
 for(const group of model.classes){
  const previous=classroomLinkedModel?.classes.find(g=>g.id===group.id),storageName=links[group.id]?.storageName;if(!storageName)continue;
  const renames=new Map();for(const person of group.students){const old=previous?.students.find(s=>s.id===person.id);if(old&&old.name!==person.name)renames.set(old.name,person.name)}
  const removed=new Set(group.students.filter(s=>s.deleted).map(s=>s.name));
  const prefix=classroomStoragePrefix(storageName),active=storageName===aktuelleKlasse;
  const changeGrid=grid=>grid?.map(row=>row.map(name=>removed.has(name)?'X':renames.get(name)||name));
  const changePairs=pairs=>pairs.filter(p=>!removed.has(p.s1)&&!removed.has(p.s2)).map(p=>({...p,s1:renames.get(p.s1)||p.s1,s2:renames.get(p.s2)||p.s2}));
  if(active){gridData=changeGrid(gridData);schuelerPaare=changePairs(schuelerPaare);tabuPaare=changePairs(tabuPaare);}
  else{
   const raw=localStorage.getItem(prefix+'grid');if(raw)localStorage.setItem(prefix+'grid',JSON.stringify(changeGrid(JSON.parse(raw))));
   for(const field of ['paare','tabu'])localStorage.setItem(prefix+field,JSON.stringify(changePairs(classroomReadArray(prefix+field))));
  }
 }
 window.classroomSeatRenameStorage?.();
}




window.addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='classroom:print'){window.focus();window.print()}});

// Use the selected class and lesson date for the browser's PDF filename.
(()=>{
 function printTitle(){
  const name=String(classroomCurrentGroup()?.name||aktuelleKlasse||'Klasse').trim().replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,'-');
  const date=classroomDate.value||new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  document.title='Sitzplan_'+name+'_'+date;
  const label=String(classroomCurrentGroup()?.name||aktuelleKlasse||'Klasse').trim().replace(/^Klasse\s*/i,'');const header=document.querySelector('.room-header');const roomName=document.getElementById('classroomRoomSelect')?.selectedOptions[0]?.textContent?.trim();const roomLabel=roomName?(/^Raum\b/i.test(roomName)?roomName:'Raum '+roomName):'';if(header)header.dataset.printTitle='Sitzplan – '+label+(roomLabel?' ('+roomLabel+')':'');
  /* 11.82: Dateiname der PDF wie gewünscht „Sitzplan - 8d (Raum 106)“ – Safari nimmt den Titel des Hauptfensters, deshalb auch dort kurz setzen */
  const T=('Sitzplan - '+label+(roomLabel?' ('+roomLabel+')':'')).replace(/[\\/:*?"<>|]/g,'-');document.title=T;
  try{const pd=parent.document;if(pd&&pd!==document){if(window.__cmTopTitle==null)window.__cmTopTitle=pd.title;pd.title=T}}catch{}
  clearTimeout(window.__cmTitleT);window.__cmTitleT=setTimeout(restoreTitle,60000);
 }
 const OWN=document.title;function restoreTitle(){clearTimeout(window.__cmTitleT);document.title=OWN;try{if(window.__cmTopTitle!=null){parent.document.title=window.__cmTopTitle;window.__cmTopTitle=null}}catch{}}
 window.addEventListener('afterprint',()=>setTimeout(restoreTitle,500));
 const originalPrint=window.print.bind(window);window.print=function(){printTitle();return originalPrint()};
 window.addEventListener('beforeprint',printTitle);
})();

function classroomUpdateDistributionLabels(){
 const same=document.querySelector('input[name="belegung"]:checked')?.value==='gleichgeschlechtlichePaare';
 const label=document.querySelector('[data-seat-alternation-label]');if(label)label.textContent=same?'Abwechselnd mm/ww':'Abwechselnd m/w';
 const option=label?.closest('label');if(option)option.title=same?'Gleichgeschlechtliche Paare wechseln sich ab: mm–ww–mm–ww.':'Bei bekannten m/w-Angaben wechseln sich benachbarte Personen ab.';
}
const classroomRenderDistributionLabels=renderTischanordnungen;
renderTischanordnungen=function(...args){const result=classroomRenderDistributionLabels(...args);classroomUpdateDistributionLabels();return result};
document.addEventListener('change',event=>{if(event.target.matches('input[name="belegung"]'))classroomUpdateDistributionLabels()});
window.addEventListener('load',classroomUpdateDistributionLabels);
classroomUpdateDistributionLabels();

// Gemeinsame Kompaktleiste: Abstand und Schließen per Klick ohne direkten Frame-Zugriff (auch file://).
if(parent!==window){const classroomNavStyle=document.createElement('style');classroomNavStyle.textContent='body[data-module=sitzplan] main{padding-top:0!important}';document.head.append(classroomNavStyle);document.addEventListener('pointerdown',()=>parent.postMessage({type:'classroom:frame-pointerdown'},'*'),true)}

// Eingaben für „Rückgängig“ melden (nötig, wenn die App als lokale Datei geöffnet ist).
if(parent!==window)for(const name of ['pointerdown','input','change','paste','drop','keydown'])document.addEventListener(name,event=>{if(name==='keydown'&&!['Backspace','Delete','Enter'].includes(event.key))return;parent.postMessage({type:'classroom:user-edit',kind:name,key:event.key||''},'*')},true);
;

/* ==== sitzplan/quick-entry.js ==== */
// Lesson context is chosen once; each seat offers only the two classroom actions.
const classroomLesson=document.createElement('div');
classroomLesson.className='classroom-lesson';
classroomLesson.innerHTML='<strong>Unterricht</strong><label>Fach<select id="classroomLessonSubject"></select></label><label>Mündliche Mitarbeit<select id="classroomLessonGrade"></select></label><label>Hausaufgaben<select id="classroomLessonHomework"></select></label>';
classroomDateLabel.after(classroomLesson);
const lessonSubject=document.getElementById('classroomLessonSubject'),lessonGrade=document.getElementById('classroomLessonGrade'),lessonHomework=document.getElementById('classroomLessonHomework');
const classroomQuick=document.createElement('div');classroomQuick.className='classroom-quick';classroomQuick.hidden=true;classroomQuick.setAttribute('role','region');classroomQuick.setAttribute('aria-label','Schnelle Bewertung');
classroomQuick.innerHTML='<button type="button" id="classroomQuickHomeworkButton" aria-pressed="false"><span>Hausaufgabe fehlt</span></button><div class="classroom-quick-heading"><strong id="classroomQuickName"></strong></div><fieldset id="classroomQuickGrade" class="classroom-grade-buttons"><legend>Mündliche Mitarbeit</legend></fieldset><label class="classroom-quick-absence"><input type="checkbox" id="classroomQuickAbsent"> Abwesend</label><input type="checkbox" id="classroomQuickHomework" hidden><p role="status" aria-live="polite" id="classroomQuickStatus"></p>';
document.body.append(classroomQuick);
const materialButton=document.createElement('button');materialButton.type='button';materialButton.id='classroomQuickMaterialButton';materialButton.textContent='Material fehlt';materialButton.setAttribute('aria-pressed','false');
const quickTop=document.createElement('div');quickTop.className='classroom-quick-top';const originalHomeworkButton=document.getElementById('classroomQuickHomeworkButton');originalHomeworkButton.before(quickTop);quickTop.append(originalHomeworkButton,materialButton);
let quickMaterialMissing=false;
// iPhone: Fenster als Blatt (hochkant unten, quer rechts) mit „‹ Zurück | Weiter ›“; bleibt nach einer Bewertung offen.
const QE_PHONE=matchMedia('(max-width:540px) and (orientation:portrait), (max-height:500px) and (pointer:coarse) and (orientation:landscape)');
const qeSheet=()=>QE_PHONE.matches;
const qePos=document.createElement('small');qePos.className='cq-pos';document.querySelector('.classroom-quick-heading').append(qePos);
const qeNav=document.createElement('div');qeNav.className='cq-nav';qeNav.innerHTML='<button type="button" data-step="-1">‹ Zurück</button><button type="button" data-step="1" class="cq-next">Weiter ›</button>';classroomQuick.append(qeNav);
let qeName=null;
function qeSeats(){
 const group=classroomCurrentGroup();if(!group)return [];
 const list=[];for(const cell of document.querySelectorAll('.room-grid .cell')){if(cell.style.display==='none')continue;const name=gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)];if(!name||!group.students.some(s=>!s.deleted&&ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name)))continue;const r=cell.getBoundingClientRect();list.push({cell,name,top:Math.round(r.top),left:r.left})}
 list.sort((a,b)=>a.top-b.top||a.left-b.left);let row=0,last=null;for(const it of list){if(last===null||Math.abs(it.top-last)>4){row++;last=it.top}it.row=row}return list}
function qeMarkCurrent(){for(const c of document.querySelectorAll('.room-grid .classroom-seat-current'))c.classList.remove('classroom-seat-current');if(!qeName||classroomQuick.hidden)return;const it=qeSeats().find(x=>x.name===qeName);it?.cell.classList.add('classroom-seat-current')}
function qeLayout(){
 const on=qeSheet()&&!classroomQuick.hidden;classroomQuick.classList.toggle('is-sheet',on);
 const land=on&&matchMedia('(orientation:landscape)').matches;
 document.body.style.paddingBottom=on&&!land?(classroomQuick.offsetHeight+12)+'px':'';document.body.style.paddingRight=land?(classroomQuick.offsetWidth+8)+'px':'';
}
function qeAfterOpen(name){
 qeName=name;if(!qeSheet()){qeLayout();return}
 /* 10.76: iPhone – voller Name statt Kurzname */{const el=document.getElementById('classroomQuickName'),full=qeFullName(quickPerson?.name||name);if(el.textContent!==full)el.textContent=full}
 classroomQuick.style.left='';classroomQuick.style.top='';qeLayout();
 const seats=qeSeats(),i=seats.findIndex(x=>x.name===name);qePos.textContent=i<0?'':'Reihe '+seats[i].row+' · '+(i+1)+' von '+seats.length;
 qeNav.querySelector('[data-step="-1"]').disabled=i<=0;qeNav.querySelector('[data-step="1"]').disabled=i<0||i>=seats.length-1;
 qeMarkCurrent();
 // Aktuellen Tisch sichtbar halten (über bzw. links neben dem Blatt)
 const cell=seats[i]?.cell;if(cell)requestAnimationFrame(()=>{const r=cell.getBoundingClientRect(),q=classroomQuick.getBoundingClientRect(),land=matchMedia('(orientation:landscape)').matches,limit=land?innerHeight:q.top;
  if(r.bottom>limit-8)scrollBy(0,r.bottom-limit+16);else if(r.top<8)scrollBy(0,r.top-16)});
}
qeNav.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(!b||b.disabled||quickPending)return;const seats=qeSeats(),i=seats.findIndex(x=>x.name===qeName),next=seats[i+Number(b.dataset.step)];if(next)classroomOpenStudent(next.name)});
QE_PHONE.addEventListener?.('change',()=>quickClose());
function classroomMaterialTarget(){const targets=lessonSource()?.targets||[],grade=targets.find(t=>t.key===lessonGrade.value);return targets.find(t=>t.type==='material'&&(!grade||t.halfYearId===grade.halfYearId&&t.quarterIndex===grade.quarterIndex))}
materialButton.onclick=()=>{if(performance.now()-classroomQuickOpenedAt<60||quickPending)return;quickMaterialMissing=!quickMaterialMissing;materialButton.setAttribute('aria-pressed',String(quickMaterialMissing));quickSave('material')};

const quickAbsent=document.getElementById('classroomQuickAbsent');
const quickGrade=document.getElementById('classroomQuickGrade'),quickHomework=document.getElementById('classroomQuickHomework'),quickStatus=document.getElementById('classroomQuickStatus');
['++','++/+','+','+/o','o','o/-','-','-/--','--','--/---','---',''].map((symbol,i)=>({symbol,i})).filter(({symbol})=>symbol&&symbol!=='--/---').forEach(({symbol,i})=>{
 const button=document.createElement('button');button.type='button';button.value=symbol?String(1+i/2):'';button.dataset.ratingSymbol=symbol;
 const number=i%2?`${Math.floor(1+i/2)}–${Math.ceil(1+i/2)}`:String(1+i/2);
 const main=document.createElement('span');if(symbol){main.className='classroom-aligned-symbol';main.setAttribute('aria-hidden','true');for(const char of symbol){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 32');svg.setAttribute('class','classroom-symbol-glyph'+(char==='/'?' classroom-symbol-slash':char==='+'||char==='-'?' classroom-symbol-sign':''));svg.innerHTML=char==='o'?'<circle cx="12" cy="16" r="8" stroke-width="4"/>':char==='+'?'<path d="M2 16h20M12 6v20"/>':char==='-'?'<path d="M4 16h16"/>':'<path d="M7 28L17 4"/>';main.append(svg)}}else main.textContent=symbol||'∅';button.append(main);
 if(symbol){const palette=['','#b8e9ce','#e0f2ce','#fffbb8','#ffedb8','#fbcbc7','#edb8b8'],grade=Number(button.value),low=Math.floor(grade),high=Math.ceil(grade);button.classList.add('classroom-rating-choice');button.style.setProperty('--rating-fill',low===high?palette[low]:`repeating-linear-gradient(135deg,${palette[low]} 0 9px,${palette[high]} 9px 18px)`);button.style.setProperty('--rating-ink','#24334b')}

 button.setAttribute('aria-label',symbol||'Bewertung entfernen');button.setAttribute('aria-pressed','false');
 button.onclick=()=>{quickGrade.value=quickGrade.value===button.value?'':button.value;quickSave('grade')};quickGrade.append(button);
});
function quickHighlightGrade(){for(const button of quickGrade.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.value===quickGrade.value))}

const homeworkButton=document.getElementById('classroomQuickHomeworkButton');let classroomQuickOpenedAt=0;
homeworkButton.onclick=()=>{if(performance.now()-classroomQuickOpenedAt<60||quickPending)return;quickHomework.checked=!quickHomework.checked;homeworkButton.setAttribute('aria-pressed',String(quickHomework.checked));quickSave('homework')};
let quickPerson=null,quickPending=null,lessonGroup=null,quickCloseAfterSave=false;
const lessonChoices=new Map();
let classroomLastSavedGrade=null;
function quickClose(){/* 9.75: beim Scrollen nicht ständig erneut schließen */if(classroomQuick.hidden&&!quickPerson)return;classroomQuick.hidden=true;quickPerson=null;if(typeof qeLayout==='function'){qeLayout();qeMarkCurrent()}}

function lessonSource(){return classroomLinkedSnapshot?.classes.find(s=>s.id===lessonSubject.value)}
function fillLesson(select,items,preferred){select.replaceChildren();for(const item of items){const option=document.createElement('option');option.value=item.key??item.id;option.textContent=item.label??item.subject;select.append(option)}if([...select.options].some(o=>o.value===preferred))select.value=preferred;select.disabled=!items.length;if(!items.length){const option=document.createElement('option');option.textContent='Noch nicht angelegt';option.value='';select.append(option)}}
function classroomRefreshLesson(){
 const group=classroomCurrentGroup();if(!group)return;
 if(lessonGroup!==group.id){quickClose();lessonGroup=group.id}
 const saved=lessonChoices.get(group.id)||{},sources=classroomLinkedSnapshot?.classes.filter(s=>classroomLinkedModel.sourceClasses[s.id]===group.id)||[];
 fillLesson(lessonSubject,sources.map(s=>({id:s.id,label:s.subject})),classroomLinkedSnapshot?.activeClass||saved.subject);
 const targets=lessonSource()?.targets||[],grades=targets.filter(t=>t.type==='performance');
 const activeTarget=targets.find(t=>t.active),selectedGrade=grades.find(t=>t.active)||grades.find(t=>activeTarget&&t.halfYearId===activeTarget.halfYearId&&t.quarterIndex===activeTarget.quarterIndex);
 const recent=classroomLastSavedGrade;
 const byDate=classroomGradeTargetForDate(grades,classroomDate.value),manual=saved.gradeDate===classroomDate.value&&grades.some(t=>t.key===saved.grade)?saved.grade:null;
 fillLesson(lessonGrade,grades,recent?.sourceClass===lessonSubject.value&&recent.date===classroomDate.value?recent.gradePage:manual||byDate?.key||selectedGrade?.key||saved.grade);
 const halfYear=targets.find(t=>t.key===lessonGrade.value)?.halfYearId,homeworks=targets.filter(t=>t.type==='homework'&&(!halfYear||t.halfYearId===halfYear));
 const gradeTarget=targets.find(t=>t.key===lessonGrade.value),matching=homeworks.find(t=>t.quarterIndex===(gradeTarget?.quarterIndex??0));fillLesson(lessonHomework,gradeTarget?homeworks.filter(t=>t.quarterIndex===gradeTarget.quarterIndex):homeworks,matching?.key||saved.homework);
 lessonChoices.set(group.id,{subject:lessonSubject.value,grade:lessonGrade.value,homework:lessonHomework.value,gradeDate:saved.gradeDate});
 if(!classroomQuick.hidden&&!quickPending)quickReadValues();
}
lessonSubject.onchange=()=>{lessonChoices.set(lessonGroup,{subject:lessonSubject.value});quickClose();classroomRefreshLesson()};
lessonGrade.onchange=()=>{lessonChoices.set(lessonGroup,{subject:lessonSubject.value,grade:lessonGrade.value,gradeDate:classroomDate.value});quickClose();classroomRefreshLesson()};
lessonHomework.onchange=()=>{lessonChoices.set(lessonGroup,{subject:lessonSubject.value,grade:lessonGrade.value,homework:lessonHomework.value});quickClose();classroomPaintAssessments()};
classroomDate.addEventListener('change',quickClose);document.getElementById('klassenSelect')?.addEventListener('change',()=>{quickClose();classroomRefreshLesson()});
function quickReadValues(){
 if(!quickPerson)return;
 const targets=lessonSource()?.targets||[];
 function valueFor(key,type){const target=targets.find(t=>t.key===key),data=target?.data,student=data?.students?.find(s=>s.id===quickPerson.id||s.classroomId===quickPerson.id||ClassroomCore.normalize(s.name)===ClassroomCore.normalize(quickPerson.name)),task=(type==='performance'?data?.tasks:data?.assignments)?.find(t=>t.date===classroomDate.value);return type==='performance'?student?.grades?.[task?.id]:student?.statuses?.[task?.id]}
 const material=classroomMaterialTarget();quickMaterialMissing=valueFor(material?.key,'material')==='missing';materialButton.setAttribute('aria-pressed',String(quickMaterialMissing));materialButton.disabled=!!quickPending||!!classroomCurrentGroup()?.attendance?.[classroomDate.value]?.[quickPerson.id];
 // Bezeichnung der Mitarbeitsspalte dieses Tages (z. B. „Kurzvortrag“) in der Überschrift zeigen.
 {const legend=quickGrade.querySelector('legend'),label=String(targets.find(t=>t.key===lessonGrade.value)?.data?.tasks?.find(t=>t.date===classroomDate.value)?.label||'').trim(),text='Mündliche Mitarbeit'+(label?' · '+label:'');if(legend&&legend.textContent!==text)legend.textContent=text}
 const grade=valueFor(lessonGrade.value,'performance');quickGrade.value=grade==null?'':String(grade);quickHighlightGrade();quickHomework.checked=valueFor(lessonHomework.value,'homework')==='missing';homeworkButton.setAttribute('aria-pressed',String(quickHomework.checked));
 const absent=classroomCurrentGroup()?.attendance?.[classroomDate.value]?.[quickPerson.id];quickAbsent.checked=!!absent;quickAbsent.disabled=!!quickPending;
 quickGrade.disabled=!!quickPending||!!absent||!lessonGrade.value;quickHomework.disabled=!!quickPending||!!absent||!lessonSubject.value;
 homeworkButton.disabled=quickHomework.disabled;
 quickStatus.textContent=absent?'Abwesend – keine Bewertung.':!lessonGrade.value&&!lessonHomework.value?'Die Hausaufgabenübersicht wird beim ersten Eintrag automatisch angelegt.':'';
}
function classroomOpenStudent(name,point){
 if(quickPending)return;quickStatus.classList.remove('cq-ok');
 classroomRefreshLesson();const group=classroomCurrentGroup();quickPerson=group?.students.find(s=>!s.deleted&&ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name));if(!quickPerson)return;
 document.getElementById('classroomQuickName').textContent=qeFullName(quickPerson.name||name);/* 10.82: auch am Mac voller Name */classroomQuick.title=quickPerson.name;classroomQuick.hidden=false;quickReadValues();
 const cell=[...document.querySelectorAll('.room-grid .cell')].find(c=>gridData[Number(c.dataset.row)]?.[Number(c.dataset.col)]===name),rect=cell?.getBoundingClientRect();
 const anchorX=point?.x??rect?.left??8,anchorY=point?.y??rect?.top??8;
 homeworkButton.style.removeProperty('width');homeworkButton.style.removeProperty('min-height');
 classroomQuick.classList.remove('classroom-homework-right');
 let buttonRect=homeworkButton.getBoundingClientRect(),panelRect=classroomQuick.getBoundingClientRect();
 const defaultOffset=buttonRect.left-panelRect.left+buttonRect.width/2;
 if(anchorX-defaultOffset+panelRect.width>innerWidth){
  classroomQuick.classList.add('classroom-homework-right');
  buttonRect=homeworkButton.getBoundingClientRect();panelRect=classroomQuick.getBoundingClientRect();
 }
 const offsetX=buttonRect.left-panelRect.left+buttonRect.width/2,offsetY=buttonRect.top-panelRect.top+buttonRect.height/2;
 classroomQuick.style.left=Math.max(0,Math.min(anchorX-offsetX,innerWidth-classroomQuick.offsetWidth))+'px';
 classroomQuick.style.top=Math.max(0,Math.min(anchorY-offsetY,innerHeight-classroomQuick.offsetHeight))+'px';
 classroomQuickOpenedAt=performance.now();
 homeworkButton.focus({preventScroll:true});
 qeAfterOpen(name);
}
function quickSave(type){
 if(!quickPerson||quickPending)return;
 if(type==='grade')mmLastMark(mmKey());
 const group=classroomCurrentGroup(),requestId=crypto.randomUUID();quickCloseAfterSave=!qeSheet();quickPending=requestId;window.__qT0=performance.now();qeLastSave={id:requestId,type,value:quickGrade.value,name:quickPerson.name,symbol:type==='grade'?(sb=>sb?(sb.dataset.ratingSymbol||sb.getAttribute('aria-label')||sb.textContent||'').trim():'')(Array.from(quickGrade.querySelectorAll('button')).find(b=>b.value===quickGrade.value)):''};materialButton.disabled=true;quickGrade.disabled=true;quickHomework.disabled=true;homeworkButton.disabled=true;quickStatus.textContent='Wird gespeichert …';
 parent.postMessage({type:'classroom:save-record',requestId,payload:{classId:group.id,studentId:quickPerson.id,sourceClass:lessonSubject.value,date:classroomDate.value,attendanceChanged:false,gradePage:lessonGrade.value,grade:type==='grade'?(Array.from(quickGrade.querySelectorAll('button')).find(button=>button.value===quickGrade.value)?.dataset.ratingSymbol||''):quickGrade.value,gradeChanged:type==='grade',homeworkPage:lessonHomework.value,homework:quickHomework.checked?'missing':'done',materialPage:classroomMaterialTarget()?.key,material:quickMaterialMissing?'missing':'done',materialChanged:type==='material',homeworkChanged:type==='homework',initializeHomework:type==='homework'&&quickHomework.checked}},'*');
}
quickHomework.onchange=()=>quickSave('homework');
quickAbsent.onchange=()=>{if(!quickPerson||quickPending)return;const group=classroomCurrentGroup(),absent=quickAbsent.checked;group.attendance??={};group.attendance[classroomDate.value]??={};group.attendance[classroomDate.value][quickPerson.id]=absent;parent.postMessage({type:'classroom:attendance',classId:group.id,studentId:quickPerson.id,date:classroomDate.value,absent},'*');classroomMarkAbsent();if(qeSheet()){quickReadValues();qeMarkCurrent()}else quickClose()};
window.addEventListener('message',event=>{if(event.source!==parent||event.data?.type!=='classroom:save-result'||event.data.requestId!==quickPending)return;quickPending=null;/* 12.35: Wartezeit protokollieren */{const w=Math.round(performance.now()-(window.__qT0||performance.now()));if(w>700)window.classroomLogError?.('Langsam gespeichert (Sitzplan wartet '+w+' ms auf die App)','quick-entry.js')}if(event.data.ok&&event.data.historyContext){classroomLastSavedGrade=event.data.historyContext;classroomRefreshLesson()}if(event.data.ok&&quickCloseAfterSave){quickCloseAfterSave=false;quickClose();return}quickCloseAfterSave=false;quickReadValues();quickStatus.textContent=event.data.ok?'Gespeichert':event.data.message||'Speichern fehlgeschlagen. Bitte erneut auswählen.'});
document.addEventListener('pointerdown',event=>{if(!classroomQuick.hidden&&!classroomQuick.contains(event.target))quickClose()},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape')quickClose()});
window.addEventListener('resize',()=>{if(qeSheet()){if(!classroomQuick.hidden)qeLayout()}else quickClose()});window.addEventListener('scroll',()=>{if(!qeSheet())quickClose()},true);

// Seat colours always reflect the chosen lesson, date and pupil identity.
function classroomPaintAssessments(){
 const group=classroomCurrentGroup(),target=lessonSource()?.targets.find(t=>t.key===lessonGrade.value),data=target?.data;
 const task=data?.tasks?.find(t=>t.date===classroomDate.value);
 const homeworkData=lessonSource()?.targets.find(t=>t.key===lessonHomework.value)?.data,assignment=homeworkData?.assignments?.find(t=>t.date===classroomDate.value);
 const palette=['','#b8e9ce','#e0f2ce','#fffbb8','#ffedb8','#fbcbc7','#edb8b8'];
 for(const cell of document.querySelectorAll('.room-grid .cell')){
  cell.classList.remove('classroom-seat-assessed','classroom-seat-homework-missing','classroom-unstriped');cell.style.removeProperty('--unstriped-color');cell.style.removeProperty('--seat-grade-background');cell.style.removeProperty('--seat-grade-ink');
  const name=gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)],person=group?.students.find(s=>!s.deleted&&ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name));
  if(!person)continue;
  const homeworkStudent=homeworkData?.students?.find(s=>s.id===person.id||s.classroomId===person.id||ClassroomCore.normalize(s.name)===ClassroomCore.normalize(person.name));
  const homeworkMissing=homeworkStudent?.statuses?.[assignment?.id]==='missing';
  cell.classList.toggle('classroom-seat-homework-missing',homeworkMissing);
  cell.title=person.name+(homeworkMissing?' · Hausaufgabe fehlt':'');
  cell.setAttribute('aria-label',person.name+(group.attendance?.[classroomDate.value]?.[person.id]?' – abwesend':' – Bewertung erfassen')+(homeworkMissing?' – Hausaufgabe fehlt':''));
  if(group.attendance?.[classroomDate.value]?.[person.id])continue;
  const student=data?.students?.find(s=>s.id===person.id||s.classroomId===person.id||ClassroomCore.normalize(s.name)===ClassroomCore.normalize(person.name)),raw=student?.grades?.[task?.id];
  if(raw==null||raw===''||raw==='x')continue;
  const grade=Number(raw);if(!Number.isFinite(grade)||grade<1||grade>6)continue;
  const low=Math.floor(grade),high=Math.ceil(grade),label=low===high?String(low):`${low}–${high}`;
  cell.classList.add('classroom-seat-assessed');
  cell.style.setProperty('--seat-grade-background',low===high?palette[low]:`repeating-linear-gradient(135deg,${palette[low]} 0 9px,${palette[high]} 9px 18px)`);
  cell.style.setProperty('--seat-grade-ink','#24334b');
  cell.setAttribute('aria-label',`${person.name} – Note ${label} – Bewertung ändern${homeworkMissing?' – Hausaufgabe fehlt':''}`);
  cell.title=`${person.name} · ${classroomDate.value.split('-').reverse().join('.')} · Note ${label}${homeworkMissing?' · Hausaufgabe fehlt':''}`;
 }
 try{window.classroomUnstripe?.(document.querySelector('.room-grid')||document)}catch{}{const h=document.documentElement.classList.contains('classroom-assessments-hidden');for(const c of document.querySelectorAll('.room-grid .cell'))c.toggleAttribute('data-ah',h);window.classroomRepaintBoard?.()}
 classroomPaintParticipation(group);
 qeMarkCurrent();
}
// Hinweise: (a) weniger als 3 mündliche Noten im gewählten Bewertungsblatt – erst wenn mindestens ein Mitschüler 3 hat
// und die letzte mündliche Bewertung in dieser Lerngruppe mindestens 2 Stunden her ist (Tisch getönt + Zähler „n/3“);
// (b) ab der dritten fehlenden Hausaufgabe wird der rote Rahmen mit jeder weiteren dicker.
const MM_LAST_KEY='classroom-mm-last-v1',MM_MIN=3,MM_WAIT=2*3600e3;
function mmLastRead(){try{return JSON.parse(localStorage.getItem(MM_LAST_KEY)||'{}')||{}}catch{return {}}}
function mmLastMark(key){const all=mmLastRead();all[key]=Date.now();try{localStorage.setItem(MM_LAST_KEY,JSON.stringify(all))}catch{}}
function mmKey(){const g=classroomCurrentGroup();return (g?.id||'')+'|'+lessonSubject.value+'|'+lessonGrade.value}
function classroomPaintParticipation(group){
 const cells=[...document.querySelectorAll('.room-grid .cell')];
 for(const cell of cells){cell.classList.remove('classroom-seat-mm-low','classroom-seat-material-missing');cell.removeAttribute('data-mm-count');cell.removeAttribute('data-material');cell.style.removeProperty('--hw-w')}
 if(!group)return;
 // Gezählt wird über das ganze Halbjahr: im 2. (4.) Quartal zählt das 1. (3.) mit; mit dem neuen Halbjahr beginnt es bei 0.
 const targets=lessonSource()?.targets||[],today=classroomDate.value;
 const upTo=(type,ref)=>ref?targets.filter(t=>t.type===type&&t.data&&t.halfYearId===ref.halfYearId&&(t.quarterIndex??0)<=(ref.quarterIndex??0)):[];
 const gradeRef=targets.find(t=>t.key===lessonGrade.value),homeRef=targets.find(t=>t.key===lessonHomework.value)||gradeRef,matRef=classroomMaterialTarget();
 const gradePages=upTo('performance',gradeRef),homePages=upTo('homework',homeRef),matPages=upTo('material',matRef||gradeRef);
 const find=(list,person)=>list?.find(s=>s.id===person.id||s.classroomId===person.id||ClassroomCore.normalize(s.name)===ClassroomCore.normalize(person.name));
 const isGrade=v=>v!=null&&v!==''&&v!=='x'&&Number.isFinite(Number(v))&&Number(v)>=1&&Number(v)<=6;
 const missed=(pages,person)=>{let n=0;for(const pg of pages){const st=find(pg.data.students,person);for(const a of pg.data.assignments||[])if((!a.date||a.date<=today)&&st?.statuses?.[a.id]==='missing')n++}return n};
 const missingToday=(pg,person)=>{const a=pg?.data?.assignments?.find(x=>x.date===today);return !!a&&find(pg.data.students,person)?.statuses?.[a.id]==='missing'};
 const people=group.students.filter(s=>!s.deleted),counts=new Map();let max=0,lastDate='';
 for(const person of people){let n=0;for(const pg of gradePages){const st=find(pg.data.students,person);for(const t of pg.data.tasks||[])if((!t.date||t.date<=today)&&isGrade(st?.grades?.[t.id])){n++;if((t.date||'')>lastDate)lastDate=t.date||''}}counts.set(person.id,n);if(n>max)max=n}
 let waited=true;
 if(lastDate&&lastDate>=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10)){const at=mmLastRead()[mmKey()];if(at)waited=Date.now()-at>=MM_WAIT}
 const showMm=gradePages.length>0&&max>=MM_MIN&&waited;
 for(const cell of cells){
  const name=gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)],person=people.find(s=>ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name));
  if(!person)continue;
  const note=t=>{cell.title+=' · '+t;cell.setAttribute('aria-label',(cell.getAttribute('aria-label')||person.name)+' – '+t)};
  if(showMm&&counts.get(person.id)<MM_MIN){const n=counts.get(person.id);cell.classList.add('classroom-seat-mm-low');cell.dataset.mmCount=n+'/'+MM_MIN;note('erst '+n+' von '+MM_MIN+' mündlichen Noten im Halbjahr')}
  if(cell.classList.contains('classroom-seat-homework-missing')){const n=missed(homePages,person);if(n>=3){cell.style.setProperty('--hw-w',Math.min(6,n+1)+'px');note(n+'. fehlende Hausaufgabe im Halbjahr')}}
  if(matRef&&missingToday(matRef,person)&&!group.attendance?.[today]?.[person.id]){const n=missed(matPages,person);cell.classList.add('classroom-seat-material-missing');cell.dataset.material=n>=3?String(n):'M';note('Material fehlt'+(n>=3?' ('+n+'. Mal im Halbjahr)':''))}
 }
}
setInterval(()=>{if(!document.hidden)classroomPaintAssessments()},300000);
classroomHooks.add('initGrid','quick-entry: Bewertungen zeichnen',{after(){classroomPaintAssessments()}});
classroomHooks.add('classroomRefreshLesson','quick-entry: Bewertungen zeichnen',{after(){classroomPaintAssessments()}});
classroomDate.addEventListener('change',classroomPaintAssessments);

// In lesson mode these controls operate on records, in room mode on the layout.
const classroomLessonUndoState=new Map();
function classroomLessonHistoryKey(){return JSON.stringify([lessonSubject.value,classroomDate.value,lessonGrade.value,lessonHomework.value])}
function classroomUpdateRecordButtons(){
 const start=document.getElementById('classroomStartButton');if(start){start.disabled=false;start.title='Verteilt die Schüler auf die gesetzten Tische – auch im Bewertungsmodus.'}
 const editing=document.getElementById('classroomEditRoom')?.checked,undo=document.getElementById('undoGridButton'),reset=document.getElementById('classroomResetButton');
 if(undo){undo.disabled=editing?undoGridHistory.length===0:!!quickPending||!classroomLessonUndoState.get(classroomLessonHistoryKey());undo.title=editing?'Letzte Sitzplanänderung rückgängig machen':'Letzten Bewertungs- oder Hausaufgabeneintrag dieser Unterrichtsstunde rückgängig machen'}
 if(reset){reset.disabled=!editing&&(!!quickPending||!lessonSubject.value);reset.title=editing?'Raum zurücksetzen':'Bewertungen und Hausaufgabeneinträge für das ausgewählte Datum zurücksetzen';/* 11.96: Name sagt, was gelöscht wird */const nm=editing?'Raum zurücksetzen …':'Einträge des Tages löschen …';if(reset.getAttribute('aria-label')!==nm)reset.setAttribute('aria-label',nm);for(const n of reset.childNodes)if(n.nodeType===3&&n.textContent.trim()&&n.textContent!==nm)n.textContent=nm}
}
const classroomRecordUndoUpdate=aktualisiereUndoButton;aktualisiereUndoButton=function(){classroomRecordUndoUpdate();classroomUpdateRecordButtons()};
async function classroomLessonHistoryAction(action){
 if(quickPending)return;
 if(action==='reset'&&!await classroomConfirm('Alle mündlichen Bewertungen und Hausaufgabeneinträge für '+classroomDate.value.split('-').reverse().join('.')+' im ausgewählten Fach und den ausgewählten Bewertungsseiten zurücksetzen? Namen und Sitzplan bleiben erhalten.'))return;
 const group=classroomCurrentGroup(),person=group?.students.find(s=>!s.deleted);if(!person)return;
 quickClose();quickPending=crypto.randomUUID();window.__qT0=performance.now();quickCloseAfterSave=false;
 parent.postMessage({type:'classroom:save-record',requestId:quickPending,payload:{action,classId:group.id,studentId:person.id,sourceClass:lessonSubject.value,date:classroomDate.value,gradePage:lessonGrade.value,homeworkPage:lessonHomework.value,attendanceChanged:false}},'*');classroomUpdateRecordButtons();
}
document.addEventListener('click',event=>{const button=event.target.closest('#undoGridButton,#classroomResetButton');if(!button||document.getElementById('classroomEditRoom')?.checked)return;event.preventDefault();event.stopImmediatePropagation();classroomLessonHistoryAction(button.id==='undoGridButton'?'undo':'reset')},true);
window.addEventListener('message',event=>{if(event.source!==parent||event.data?.type!=='classroom:save-result')return;if(event.data.ok){classroomLessonUndoState.set(event.data.historyContext?JSON.stringify([event.data.historyContext.sourceClass,event.data.historyContext.date,event.data.historyContext.gradePage||'',event.data.historyContext.homeworkPage||'']):classroomLessonHistoryKey(),!!event.data.canUndo);document.getElementById('classroomSyncStatus').textContent='Unterrichtseinträge gespeichert.'}else document.getElementById('classroomSyncStatus').textContent=event.data.message||'Eintrag konnte nicht geändert werden.';classroomUpdateRecordButtons()});
classroomHooks.add('initGrid','quick-entry: Erfassungsknöpfe',{after(){classroomUpdateRecordButtons()}});
classroomHooks.add('classroomRefreshLesson','quick-entry: Erfassungsknöpfe',{after(){classroomUpdateRecordButtons()}});
document.getElementById('classroomEditRoom')?.addEventListener('change',classroomUpdateRecordButtons);classroomDate.addEventListener('change',classroomUpdateRecordButtons);lessonHomework.addEventListener('change',classroomUpdateRecordButtons);

// Das Datum links bestimmt die Mitarbeitsseite: Halbjahr nach Startdatum, Quartal nach Quartalsgrenze
// oder – falls keine Grenze hinterlegt ist – nach den bereits eingetragenen Terminen.
function classroomGradeTargetForDate(grades,date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!grades.length)return null;
 let pool=grades;const starts=[...new Set(grades.map(t=>t.halfYearStart).filter(Boolean))].filter(d=>d<=date).sort();
 if(starts.length){const start=starts.at(-1);pool=grades.filter(t=>t.halfYearStart===start)}
 else{const years=[...new Set(grades.map(t=>t.halfYearId))];if(years.length>1){const firstDate=t=>(t.data?.tasks||[]).map(x=>x.date).filter(Boolean).sort()[0]||'';const best=years.map(id=>({id,first:grades.filter(t=>t.halfYearId===id).map(firstDate).filter(Boolean).sort()[0]||''})).filter(y=>y.first&&y.first<=date).sort((a,b)=>a.first<b.first?1:-1)[0];if(best)pool=grades.filter(t=>t.halfYearId===best.id)}}
 const boundary=pool.find(t=>t.quarterBoundary)?.quarterBoundary;
 if(boundary){const q=date>=boundary?1:0;return pool.find(t=>t.quarterIndex===q)||null}
 const earliest=t=>(t.data?.tasks||[]).map(x=>x.date).filter(Boolean).sort()[0]||'';
 const started=pool.filter(t=>earliest(t)&&earliest(t)<=date).sort((a,b)=>b.quarterIndex-a.quarterIndex);
 return started[0]||pool.find(t=>t.quarterIndex===0)||null;
}
classroomDate.addEventListener('change',()=>{classroomRefreshLesson();if(typeof classroomPaintAssessments==='function')classroomPaintAssessments()});
/* 8.19: Bewertungsblatt auf dem iPhone nach unten wegwischen (wie die anderen Blätter) */
{let y0=null,x0=0,dy=0;
 classroomQuick.addEventListener('touchstart',e=>{if(!qeSheet()||classroomQuick.hidden||e.target.closest('input,select,textarea'))return;y0=e.touches[0].clientY;x0=e.touches[0].clientX;dy=0;classroomQuick.style.setProperty('transition','none','important')},{passive:true});
 classroomQuick.addEventListener('touchmove',e=>{if(y0===null)return;dy=e.touches[0].clientY-y0;const dx=e.touches[0].clientX-x0;if(dy>8&&dy>Math.abs(dx)){classroomQuick.style.setProperty('transform','translateY('+dy+'px)','important');if(e.cancelable)e.preventDefault()}else if(dy<=0)classroomQuick.style.removeProperty('transform')},{passive:false});
 classroomQuick.addEventListener('touchend',()=>{if(y0===null)return;y0=null;const d=dy;dy=0;
  if(d>80){classroomQuick.style.setProperty('transition','transform .18s ease','important');classroomQuick.style.setProperty('transform','translateY(100%)','important');setTimeout(()=>{quickClose();classroomQuick.style.removeProperty('transform');classroomQuick.style.removeProperty('transition')},180)}
  else{classroomQuick.style.removeProperty('transition');classroomQuick.style.removeProperty('transform')}},{passive:true});
 classroomQuick.addEventListener('touchcancel',()=>{y0=null;dy=0;classroomQuick.style.removeProperty('transition');classroomQuick.style.removeProperty('transform')},{passive:true});}
/* 8.23: ✕ oben rechts im Bewertungsblatt (iPhone), wie bei den anderen Blättern */
{const x=document.createElement('button');x.type='button';x.className='cq-x';x.setAttribute('aria-label','Schließen');x.textContent='✕';x.onclick=()=>quickClose();document.querySelector('.classroom-quick-heading')?.append(x);
 const st=document.createElement('style');st.textContent='.cq-x{display:none}@media (max-width:540px) and (orientation:portrait) and (pointer:coarse),(max-height:500px) and (orientation:landscape) and (pointer:coarse){.classroom-quick .cq-x{display:inline-flex;align-items:center;justify-content:center;flex:none;width:36px;height:36px;margin-left:6px;padding:0;border:0;background:none;color:#66758a;font-size:17px;cursor:pointer}}';document.head.append(st)}

/* 8.82: Noten-Schnellansicht (Mac/iPad) – beim Öffnen der Bewertung springt die Notenliste links zur Karte dieser Person */
{const orig=classroomOpenStudent;classroomOpenStudent=window.classroomOpenStudent=function(name,point){const r=orig.apply(this,arguments);try{if(quickPerson&&!classroomQuick.hidden)parent.classroomQuickFocus?.(quickPerson.name)}catch{}return r}}

/* 10.76: iPhone – nach einer Bewertung automatisch zum nächsten Schüler ohne Bewertung (Abwesende übersprungen).
   Die getippte Bewertung leuchtet kurz auf; eine grüne Zeile bestätigt, was gespeichert wurde. */
var qeLastSave=null;
function qeFullName(n){n=String(n||'').trim();return n.includes(',')?n.split(',').map(x=>x.trim()).filter(Boolean).reverse().join(' '):n}
function qeNextOpen(){const group=classroomCurrentGroup(),seats=qeSeats(),i=seats.findIndex(x=>x.name===qeName);if(i<0)return null;
 for(let k=1;k<seats.length;k++){const it=seats[(i+k)%seats.length];const person=group?.students.find(s=>!s.deleted&&ClassroomCore.normalize(s.name)===ClassroomCore.normalize(it.name));if(!person||group.attendance?.[classroomDate.value]?.[person.id])continue;if(!it.cell.classList.contains('classroom-seat-assessed'))return it}return null}
window.addEventListener('message',event=>{const d=event.data;if(event.source!==parent||d?.type!=='classroom:save-result'||!qeLastSave||d.requestId!==qeLastSave.id)return;const last=qeLastSave;qeLastSave=null;
 if(!d.ok||last.type!=='grade'||!last.value||!qeSheet()||classroomQuick.hidden)return;
 const from=qeName,btn=[...quickGrade.querySelectorAll('button')].find(b=>b.value===last.value);btn?.classList.add('cq-flash');quickStatus.classList.remove('cq-ok');
 setTimeout(()=>{btn?.classList.remove('cq-flash');if(classroomQuick.hidden||quickPending||qeName!==from)return;
  const msg='✓ '+qeFullName(last.name)+': '+(last.symbol||'Bewertung')+' gespeichert',next=qeNextOpen();
  if(next){classroomOpenStudent(next.name);quickStatus.textContent=msg;quickStatus.classList.add('cq-ok')}
  else{quickStatus.textContent='✓ Alle bewertet';quickStatus.classList.add('cq-ok')}},450)});
{const st=document.createElement('style');st.textContent='.classroom-quick.is-sheet #classroomQuickName{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.classroom-quick #classroomQuickStatus.cq-ok:not(#_){color:#2c7a4b!important;font-weight:650}#classroomQuickGrade button.cq-flash{outline:3px solid #2c7a4b!important;outline-offset:1px;box-shadow:0 0 0 7px rgba(44,122,75,.2)!important}';document.head.append(st)}
;

/* ==== sitzplan/student-notes.js ==== */
/* Notizen (aus dem Noten-Manager, notenrechner-notizen-v1) im Sitzplan zeigen:
   orangener Punkt am Tisch der Person, Notiztext oben im Bewertungsfenster.
   Es zählen alle Fächer/Kurse, die mit der aktuellen Lerngruppe verknüpft sind. Nur Anzeige – bearbeitet wird im Noten-Manager. */
(()=>{
 const KEY='notenrechner-notizen-v1';
 const norm=n=>String(n||'').trim().toLowerCase();
 const txt=v=>typeof v==='string'?v:(v&&typeof v.t==='string'?v.t:'');
 function refs(){try{const g=typeof classroomCurrentGroup==='function'&&classroomCurrentGroup(),src=typeof classroomLinkedModel!=='undefined'&&classroomLinkedModel?.sourceClasses;if(!g||!src)return [];return Object.keys(src).filter(k=>src[k]===g.id)}catch{return []}}
 function notesFor(name){let a={};try{a=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}const n=norm(name),out=[];for(const r of refs()){const t=txt(a[r+'::'+n]);if(t&&!out.includes(t))out.push(t)}return out}
 function marks(){const grid=document.getElementById('roomGrid');if(!grid||typeof gridData==='undefined')return;
  for(const cell of grid.querySelectorAll('.cell')){const name=cell.classList.contains('besetzt')?gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)]:null;const notes=name?notesFor(name):[];let dot=cell.querySelector(':scope>.sn-dot');
   if(notes.length){if(!dot){dot=document.createElement('i');dot.className='sn-dot';dot.setAttribute('aria-hidden','true');cell.append(dot)}cell.dataset.note=notes.join(' · ')}else{dot?.remove();if(cell.dataset.note)delete cell.dataset.note}}}
 function quick(){const q=document.querySelector('.classroom-quick');if(!q)return;let box=q.querySelector('.sn-quick');const notes=!q.hidden&&q.title?notesFor(q.title):[];
  if(!notes.length){box?.remove();return}if(!box){box=document.createElement('div');box.className='sn-quick';(q.querySelector('.classroom-quick-heading')||q.firstElementChild)?.after(box)}const t='📝 '+notes.join(' · ');if(box.textContent!==t)box.textContent=t}
 let planned=false;const schedule=()=>{if(planned)return;planned=true;requestAnimationFrame(()=>{planned=false;marks();quick()})};
 new MutationObserver(list=>{if(list.some(m=>!(m.target.classList?.contains('sn-dot')||m.target.classList?.contains('sn-quick')||[...m.addedNodes].every(n=>n.nodeType===1&&(n.classList.contains('sn-dot')||n.classList.contains('sn-quick'))&&m.addedNodes.length))))schedule()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','title']});
 addEventListener('storage',e=>{if(e.key===KEY)schedule()});schedule();
 const st=document.createElement('style');st.textContent='.room-grid .cell{position:relative}.sn-dot{position:absolute;top:4px;left:4px;width:9px;height:9px;border-radius:50%;background:#e39a3b;border:1.5px solid #fff;box-shadow:0 0 0 1px #e39a3b55;pointer-events:none}'
  +'.sn-quick{margin:2px 0 8px;padding:6px 10px;border-radius:9px;background:#fff7e0;color:#7a5410;font-size:13px;line-height:1.35}'
  +'html.classroom-privacy .sn-dot{display:none!important}html.classroom-privacy .sn-quick{color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.75)!important}'
  +'html.classroom-beamer .sn-dot,html.classroom-beamer .sn-quick{display:none!important}@media print{.sn-dot,.sn-quick{display:none}}';document.head.append(st);
})();
;

/* ==== sitzplan/seat-drag.js ==== */
// Pointer events support dragging by mouse, trackpad and touch without changing pupil records.
let classroomSeatDrag=null;
function classroomDragCell(event){const element=document.elementFromPoint(event.clientX,event.clientY);return element?.closest('.room-grid .cell')||null}
function classroomSeatDropValid(cell,state){if(!cell||cell===state.source)return false;const value=gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)];return !!value&&value!=='PULT'}
function classroomClearSeatDrag(){
 const state=classroomSeatDrag;if(!state)return;classroomSeatDrag=null;
 state.ghost?.remove();state.source.classList.remove('classroom-drag-source');state.target?.classList.remove('classroom-drop-target');
 document.body.classList.remove('classroom-dragging');
 try{if(state.source.hasPointerCapture(state.id))state.source.releasePointerCapture(state.id)}catch{}
 return state;
}
function classroomAssignEmptySeat(r,c){
 if(gridData[r]?.[c]!=='X')return;
 const placed=new Set(gridData.flat()),names=[...new Set([...(classroomCurrentGroup()?.students||[]).filter(s=>!s.deleted).map(s=>s.name),...schuelerEinzel.map(s=>s.name),...schuelerPaare.flatMap(p=>[p.s1,p.s2])].filter(name=>name?.trim()&&!placed.has(name)))].sort((a,b)=>sitzplatzKurzname(a).localeCompare(sitzplatzKurzname(b),'de'));
 if(typeof quickClose==='function')quickClose();document.getElementById('assignSeatDialog')?.remove();
 const dialog=document.createElement('dialog');dialog.id='assignSeatDialog';dialog.style.cssText='width:min(440px,90vw);max-height:80vh;overflow:auto;padding:24px;border:1px solid #d6dfed;border-radius:20px;color:#24334b;background:white;box-sizing:border-box';
 const title=document.createElement('h2');title.textContent='Tisch zuweisen';title.style.margin='0 0 16px';dialog.append(title);
 const description=document.createElement('p');description.textContent=names.length?'Schüler:in ohne Platz im aktuellen Raum auswählen:':'Alle Schüler:innen der Klasse haben bereits einen Platz.';dialog.append(description);
 const context=aktuelleKlasse;for(const name of names){const button=document.createElement('button');button.type='button';button.className='btn btn-secondary';button.textContent=sitzplatzKurzname(name);button.title=name;button.style.cssText='display:block;width:100%;margin:8px 0';button.onclick=()=>{if(context!==aktuelleKlasse||gridData[r]?.[c]!=='X'||gridData.flat().includes(name)){dialog.close();return}merkeSitzplanFuerUndo();gridData[r][c]=name;dialog.close();initGrid();datenSpeichern();setzeBelegungsstatus(sitzplatzKurzname(name)+' wurde dem Tisch zugewiesen.',true)};dialog.append(button)}
 const cancel=document.createElement('button');cancel.type='button';cancel.className='btn btn-secondary';cancel.textContent='Abbrechen';cancel.style.marginTop='16px';cancel.onclick=()=>dialog.close();dialog.append(cancel);dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();
}
let classroomSeatAssignmentMode=false;
const classroomFindStudentButton=document.getElementById('studentSearchToggle'),classroomFindStudentInput=document.getElementById('studentSearchInput');
function classroomSeatAssignmentButton(){
 const toolbar=document.querySelector('.classroom-plan-actions');if(!toolbar||toolbar.querySelector('[data-assign-student]'))return;
 const button=document.createElement('button');button.type='button';button.className='btn btn-secondary';button.dataset.assignStudent='';button.textContent='Schüler zuweisen';button.title='Eine Person aus der Klassenliste einem freien Tisch zuweisen.';button.setAttribute('aria-pressed',String(classroomSeatAssignmentMode));
 button.onclick=()=>{classroomSeatAssignmentMode=!classroomSeatAssignmentMode;button.setAttribute('aria-pressed',String(classroomSeatAssignmentMode));button.textContent=classroomSeatAssignmentMode?'Zuweisen abbrechen':'Schüler zuweisen';if(typeof quickClose==='function')quickClose();setzeBelegungsstatus(classroomSeatAssignmentMode?'Jetzt einen freien Tisch anklicken.':'Zuweisung beendet.',true)};
 const reset=toolbar.querySelector(':scope > .btn-grid-reset');toolbar.prepend(button);if(classroomFindStudentButton){const node=classroomFindStudentButton.closest('.student-finder')||classroomFindStudentButton;if(node.parentElement!==toolbar)toolbar.insertBefore(node,reset||null)}if(classroomFindStudentInput)classroomFindStudentButton.after(classroomFindStudentInput);
}
new MutationObserver(classroomSeatAssignmentButton).observe(document.getElementById('roomGrid'),{childList:true,subtree:true});classroomSeatAssignmentButton();
document.addEventListener('pointerdown',event=>{
 const cell=event.target.closest('.room-grid .cell');if(!cell||document.getElementById('classroomEditRoom')?.checked||event.button!==0)return;
 /* 8.54: Im Bewertungsmodus darf ein zweiter Finger (Zoomen) nie das Tisch-Werkzeug auslösen – sonst würden Schüler zu freien Tischen. */
 if(event.isPrimary===false){event.stopImmediatePropagation();return}
 // In lesson mode an empty field must not start the table painting tool.
 event.preventDefault();event.stopImmediatePropagation();
 const r=Number(cell.dataset.row),c=Number(cell.dataset.col),name=gridData[r]?.[c];/* 8.28: iPhone – Sitzplan nur zum Bewerten: freie Tische nicht zuweisen */if(name==='X'&&document.documentElement.classList.contains('ph-lite'))return;if(name==='X'){classroomSeatAssignmentMode=false;classroomAssignEmptySeat(r,c);const button=document.querySelector('[data-assign-student]');if(button){button.textContent='Schüler zuweisen';button.setAttribute('aria-pressed','false')}return}if(!name||name==='PULT')return;
 classroomClearSeatDrag();classroomSeatDrag={id:event.pointerId,source:cell,r,c,name,className:aktuelleKlasse,startX:event.clientX,startY:event.clientY,moved:false,target:null,ghost:null};
 try{cell.setPointerCapture(event.pointerId)}catch{}
},true);
document.addEventListener('pointermove',event=>{
 const state=classroomSeatDrag;if(!state||event.pointerId!==state.id)return;
 /* 8.28: iPhone – keine Plätze tauschen/verschieben */if(document.documentElement.classList.contains('ph-lite')){if(Math.hypot(event.clientX-state.startX,event.clientY-state.startY)>=8)state.lite=true;return}
 if(!state.moved&&Math.hypot(event.clientX-state.startX,event.clientY-state.startY)<8)return;
 event.preventDefault();event.stopImmediatePropagation();
 if(!state.moved){state.moved=true;state.source.classList.add('classroom-drag-source');document.body.classList.add('classroom-dragging');const ghost=document.createElement('div');ghost.className='classroom-drag-ghost';ghost.textContent=sitzplatzKurzname(state.name);ghost.setAttribute('aria-hidden','true');const rect=state.source.getBoundingClientRect();ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';document.body.append(ghost);state.ghost=ghost;}
 state.ghost.style.left=event.clientX+'px';state.ghost.style.top=event.clientY+'px';
 const cell=classroomDragCell(event),target=classroomSeatDropValid(cell,state)?cell:null;
 if(target!==state.target){state.target?.classList.remove('classroom-drop-target');state.target=target;target?.classList.add('classroom-drop-target')}
}, {capture:true,passive:false});
document.addEventListener('pointerup',event=>{
 const state=classroomSeatDrag;if(!state||event.pointerId!==state.id)return;
 event.preventDefault();event.stopImmediatePropagation();
 const target=classroomDragCell(event),valid=classroomSeatDropValid(target,state);classroomClearSeatDrag();
 if(state.className!==aktuelleKlasse||gridData[state.r]?.[state.c]!==state.name)return;
 if(state.lite)return;
 if(!state.moved){if(target===state.source){if(zufallsAuswahl?.r===state.r&&zufallsAuswahl?.c===state.c){zufallsAuswahl=null;const status=document.getElementById('randomStudentStatus');if(status)status.textContent='';if(typeof quickClose==='function')quickClose();initGrid()}else classroomOpenStudent(state.name,{x:event.clientX,y:event.clientY})}return}
 if(!valid){if(target&&target!==state.source)setzeBelegungsstatus('Bitte einen vorhandenen Sitzplatz als Ziel wählen. Freie Plätze kannst du unter „Sitzplanmodus“ ergänzen.',false);return}
 const r=Number(target.dataset.row),c=Number(target.dataset.col),other=gridData[r][c];
 merkeSitzplanFuerUndo();gridData[r][c]=state.name;gridData[state.r][state.c]=other;
 zufallsAuswahl=null;const randomStatus=document.getElementById('randomStudentStatus');if(randomStatus)randomStatus.textContent='';
 initGrid();datenSpeichern();
 setzeBelegungsstatus(other==='X'?`${sitzplatzKurzname(state.name)} wurde verschoben.`:`${sitzplatzKurzname(state.name)} und ${sitzplatzKurzname(other)} haben die Plätze getauscht.`,true);
},true);
window.addEventListener('pointercancel',event=>{if(classroomSeatDrag?.id===event.pointerId)classroomClearSeatDrag()},true);
window.addEventListener('blur',classroomClearSeatDrag);
;

/* ==== table-navigation.js ==== */
// Enter commits a table field and selects the next editable field in its column.
document.addEventListener('keydown',event=>{
 if(event.key!=='Enter'||event.isComposing||event.defaultPrevented)return;
 const input=event.target.closest('input,select');
 if(!input||input.matches('[type=button],[type=submit],[type=checkbox],[type=radio],[type=file]'))return;
 // Let the browser accept a highlighted native name suggestion with Enter.
 if(input.hasAttribute('list'))return;
 const table=input.closest('table'),row=input.closest('tr'),cell=input.closest('td,th');if(!table||!row||!cell)return;
 event.preventDefault();
 const tables=[...document.querySelectorAll('table')],tableIndex=tables.indexOf(table),rowIndex=[...table.rows].indexOf(row),column=cell.cellIndex;
 const selector='input:not([type=hidden]):not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]):not([type=file]),select';
 const fieldIndex=[...cell.querySelectorAll(selector)].indexOf(input);
 input.dispatchEvent(new Event('change',{bubbles:true}));
 if(!input.validity.valid){input.reportValidity();return}
 const current=table.isConnected?table:document.querySelectorAll('table')[tableIndex];if(!current)return;
 for(let index=rowIndex+1;index<current.rows.length;index++){
  const fields=current.rows[index].cells[column]?.querySelectorAll(selector),next=fields?.[fieldIndex];
  if(!next||next.disabled||next.readOnly||!next.getClientRects().length)continue;
  next.focus();if(typeof next.select==='function')try{next.select()}catch{}return;
 }
});

// Commit review grades and navigate the two-column review grid with all arrow keys.
document.addEventListener('keydown',event=>{
 if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(event.key)||event.defaultPrevented||event.isComposing||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
 const input=event.target;if(!input.matches('[data-quarter-review-field]'))return;
 const table=input.closest('table'),row=input.closest('tr');if(!table||!row)return;
 const rows=[...table.rows],rowIndex=rows.indexOf(row),field=input.dataset.quarterReviewField;
 const horizontal=event.key==='ArrowRight'||event.key==='ArrowLeft';
 const targetField=horizontal?(event.key==='ArrowRight'?'teacher':'self'):field;
 let targetRow=rowIndex;
 if(horizontal){if(targetField===field){event.preventDefault();return}}
 else{
  const direction=event.key==='ArrowDown'?1:-1;
  do{targetRow+=direction}while(rows[targetRow]&&!rows[targetRow].querySelector('[data-quarter-review-field="'+targetField+'"]'));
 }
 event.preventDefault();if(!rows[targetRow])return;
 const panel=table.closest('[data-custom-panel]'),tableIndex=[...document.querySelectorAll('table')].indexOf(table);
 input.dispatchEvent(new Event('change',{bubbles:true}));if(!input.validity.valid){input.reportValidity();return}
 const current=table.isConnected?table:panel?.querySelector('table')||document.querySelectorAll('table')[tableIndex];
 const target=current?.rows[targetRow]?.querySelector('[data-quarter-review-field="'+targetField+'"]');
 if(target&&!target.disabled&&!target.readOnly){target.focus();target.select()}
});

// Move between editable assessment cells in one pupil row.
document.addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.defaultPrevented||event.isComposing||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
 const input=event.target;if(!input.matches('input,select')||input.matches('[data-student-name],[data-quarter-review-field]'))return;
 const table=input.closest('table.task-table'),row=input.closest('tbody tr');if(!table||!row)return;
 const selector='input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([data-student-name]),select';
 const editable=r=>[...r.querySelectorAll(selector)].filter(f=>!f.disabled&&!f.readOnly&&f.getClientRects().length),fields=editable(row),index=fields.indexOf(input),next=index+(event.key==='ArrowRight'?1:-1);if(index<0||next<0||next>=fields.length)return;
 const panel=table.closest('[data-custom-panel]'),rowIndex=[...table.tBodies[0].rows].indexOf(row);event.preventDefault();input.dispatchEvent(new Event('change',{bubbles:true}));if(!input.validity.valid){input.reportValidity();return}
 const current=table.isConnected?table:panel?.querySelector('table.task-table'),newRow=current?.tBodies[0]?.rows[rowIndex],target=newRow&&editable(newRow)[next];if(target){target.focus();if(typeof target.select==='function')try{target.select()}catch{}}
});
;

/* ==== theme.js ==== */
(()=>{
 const key='classroom-manager-theme-v1';
 const palettes={blue:{label:'Blau',accent:'#2f5f9b',dark:'#244c80',bg:'#f6f8fc',pale:'#eaf0fa',tabs:'#e7edf6',line:'#dce3ef',border:'#a8bdd8',ink:'#243247',muted:'#66758a'},green:{label:'Grün',accent:'#146f5b',dark:'#105846',bg:'#f3f6f2',pale:'#e7f1ec',tabs:'#e5ebe6',line:'#dce4df',border:'#9fbdaf',ink:'#24312d',muted:'#697873'},orange:{label:'Orange',accent:'#ad6229',dark:'#8d4d20',bg:'#fcf8f4',pale:'#f8eddf',tabs:'#f2e8dd',line:'#eadfd3',border:'#d4b18d',ink:'#3b3027',muted:'#827365'}};
 Object.assign(palettes,{
 lavender:{label:'Lavendel',accent:'#6b66a6',dark:'#514d83',bg:'#f8f7fc',pale:'#eeecfa',tabs:'#e9e6f5',line:'#dfdced',border:'#b5afd6',ink:'#302e43',muted:'#77738e'},
 grey:{label:'Grau',accent:'#58616d',dark:'#424a55',bg:'#f7f8f9',pale:'#eceff2',tabs:'#e7eaee',line:'#dce0e5',border:'#b1bac5',ink:'#293039',muted:'#69737e'},
 yellow:{label:'Gelb',accent:'#826411',dark:'#664e0b',bg:'#fcfbf3',pale:'#f8f0cb',tabs:'#f1ebd2',line:'#e7e1c7',border:'#c7b66e',ink:'#373222',muted:'#787055'},
 purple:{label:'Lila',accent:'#76529a',dark:'#5d3e7e',bg:'#f9f6fc',pale:'#f0e9f8',tabs:'#ece5f2',line:'#e3dbea',border:'#bba5d1',ink:'#332b40',muted:'#796c87'},
 teal:{label:'Petrol',accent:'#286d78',dark:'#1e545e',bg:'#f3f9fa',pale:'#e3f0f2',tabs:'#e0ecef',line:'#d5e4e7',border:'#94b8bf',ink:'#24383d',muted:'#617d83'},
 rose:{label:'Rosé',accent:'#9b5270',dark:'#7e3e59',bg:'#fcf6f8',pale:'#f7e7ee',tabs:'#f1e3e9',line:'#ead9e1',border:'#cfa1b5',ink:'#402b34',muted:'#876d78'}
 });
 let current='blue';try{current=localStorage.getItem(key)||'blue'}catch{}if(!palettes[current])current='blue';
 let nx=0,originalCss=null,seen=new WeakSet(),txCss='',rootCss='',tx=null;
 /* 11.07: Stile nur einmal einlesen und umfärben; später eingefügte Stile werden nur noch angehängt (vorher bei jedem neuen Stil alles neu – kostete am iPhone ~1/5 der Startzeit) */
 const own=sheet=>/^classroomThemeStyle/.test(sheet.ownerNode?.id||'')||sheet.ownerNode?.hasAttribute?.('data-privacy');
 const cssOf=sheets=>sheets.map(sheet=>{seen.add(sheet.ownerNode||sheet);try{return [...sheet.cssRules].map(rule=>rule.cssText).join('\n')}catch{return ''}}).join('\n');
 function apply(name){
  if(!palettes[name])return;current=name;const p=palettes[name];
  if(originalCss===null){seen=new WeakSet();originalCss=cssOf([...document.styleSheets].filter(sheet=>!own(sheet)/* 8.21: Datenschutz-Zufallsfarben nicht einfrieren */))}
  const colors={'#2f5f9b':p.accent,'#244c80':p.dark,'#f6f8fc':p.bg,'#eaf0fa':p.pale,'#e7edf6':p.tabs,'#dce3ef':p.line,'#dce3df':p.line,'#a8bdd8':p.border,'#a8bfdc':p.border,'#b9cbe4':p.border,'#cbd6e5':p.line,'#d7e2f1':p.line,'#e4e8ee':p.tabs,'#e5edf9':p.pale,'#eef3fb':p.pale,'#f7f9fc':p.bg,'#f3f6fb':p.bg,'#243247':p.ink,'#24334b':p.ink,'#243247':p.ink,'#66758a':p.muted,'#405671':p.accent,'#8ba9d1':p.border,'#86acf0':p.border,'#bac9de':p.border,'#eaf1fb':p.pale,'#eef4fc':p.pale,'#d3e1f4':p.line,'#9fb8da':p.border,'#b9c6d8':p.border,'#8fb0dc':p.border,'#b9cde8':p.border,'#36557d':p.dark,'#d6dde8':p.line,'#e3e8f0':p.line,'#e6ebf3':p.line,'#edf1f6':p.line,'#f8fafd':p.bg,'#f6f8fc':p.bg,'#8794a7':p.muted,'#c5d3e6':p.border,'#e9edf3':p.tabs,'#abc1df':p.border};
  const expanded={};for(const [from,to] of Object.entries(colors)){expanded[from]=to;expanded[from+'20']=to+'20';expanded[from+'30']=to+'30';expanded[from+'55']=to+'55'}
  let style=document.getElementById('classroomThemeStyle');if(!style){style=document.createElement('style');style.id='classroomThemeStyle';document.head.append(style)}
  tx=css=>css.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi,(match,r,g,b)=>{const hex='#'+[r,g,b].map(value=>Number(value).toString(16).padStart(2,'0')).join('');return expanded[hex]||match}).replace(/#[\da-f]{3,8}\b/gi,color=>expanded[color.toLowerCase()]||color);rootCss=`\n:root{--green:${p.accent};--primary:${p.accent};--primary-hover:${p.dark};--primary-color:${p.accent};--bg:${p.bg};--bg-color:${p.bg};--pale:${p.pale};--line:${p.line};--border-color:${p.line};--ink:${p.ink};--text-main:${p.ink};--muted:${p.muted}}`;
  txCss=tx(originalCss);style.textContent=txCss+rootCss;document.querySelectorAll('style[id^=classroomThemeStyleX]').forEach(x=>x.remove());
  if(style.nextElementSibling)document.head.append(style);document.documentElement.dataset.theme=name;
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===name)));
 }
 apply(current);
 /* Später eingefügte Stile (z. B. aus Zusatzmodulen) ebenfalls umfärben, sonst bleiben blaue Flächen. */
 let restyle=0;new MutationObserver(ms=>{if(!ms.some(m=>[...m.addedNodes].some(n=>(n.tagName==='STYLE'&&!/^classroomThemeStyle/.test(n.id||''))||(n.tagName==='LINK'&&/stylesheet/.test(n.rel||'')))))return;cancelAnimationFrame(restyle);restyle=requestAnimationFrame(addNew)}).observe(document.head,{childList:true});
 function addNew(){if(!tx)return;const fresh=[...document.styleSheets].filter(sheet=>!own(sheet)&&!seen.has(sheet.ownerNode||sheet));if(!fresh.length)return keepLast();const freshNodes=new Set(fresh.map(x=>x.ownerNode));const css=cssOf(fresh);originalCss+='\n'+css;const add=tx(css);txCss+='\n'+add;/* eigener kleiner Stil statt das große Umfärbe-Blatt jedes Mal neu zu schreiben */const x=document.createElement('style');x.id='classroomThemeStyleX'+(++nx);x.textContent=add;document.head.append(x);keepLast(freshNodes)}
 /* Wird ein schon bekannter Stil ans Ende verschoben (z. B. beim Laden), die Umfärbungen wieder dahinter setzen */
 function keepLast(fresh){const main=document.getElementById('classroomThemeStyle');if(!main)return;let n=main.nextElementSibling,move=false;for(;n;n=n.nextElementSibling){if(!/^(STYLE|LINK)$/.test(n.tagName)||/^classroomThemeStyle/.test(n.id||'')||n.hasAttribute('data-privacy')||fresh?.has(n))continue;move=true;break}if(move)document.head.append(main,...document.querySelectorAll('style[id^=classroomThemeStyleX]'))}
 if(window===parent){
  const mark=document.querySelector('.brand-mark');
  if(mark){const button=document.createElement('button');button.type='button';button.className=mark.className;button.innerHTML=mark.innerHTML;button.setAttribute('aria-label','Farbgestaltung ändern');button.title='Farbgestaltung';mark.replaceWith(button);
   const dialog=document.createElement('dialog');dialog.className='classroom-dialog classroom-theme-dialog';dialog.innerHTML='<h2>Ein bisschen Farbe?</h2><p>Wähle deine Farbgestaltung.</p><div class="classroom-theme-choices"></div><div class="classroom-dialog-actions"><button type="button" data-theme-close>Schließen</button></div>';document.body.append(dialog);
   for(const [name,p] of Object.entries(palettes)){const choice=document.createElement('button');choice.type='button';choice.dataset.themeChoice=name;choice.setAttribute('aria-pressed',String(name===current));const swatch=document.createElement('span');swatch.className='classroom-theme-preview';swatch.setAttribute('aria-hidden','true');
   swatch.style.cssText=`--preview-bg:${p.bg};--preview-pale:${p.pale};--preview-tabs:${p.tabs};--preview-accent:${p.accent};--preview-line:${p.line};--preview-muted:${p.muted};`;
   swatch.innerHTML='<span class="theme-preview-header"><span class="theme-preview-logo"></span><span class="theme-preview-title"></span><span class="theme-preview-action"></span></span><span class="theme-preview-content"><span class="theme-preview-tabs"><i></i><i></i><i></i></span><span class="theme-preview-card"><span class="theme-preview-table-head"></span><span class="theme-preview-row"><i></i><i></i></span><span class="theme-preview-row"><i></i><i></i></span></span></span>';
   choice.append(swatch,document.createTextNode(p.label));choice.onclick=()=>{try{localStorage.setItem(key,name)}catch{}apply(name);for(const frame of document.querySelectorAll('iframe'))frame.contentWindow?.postMessage({type:'classroom:theme',theme:name},'*')};dialog.querySelector('.classroom-theme-choices').append(choice)}
   dialog.tabIndex=-1;dialog.style.outline='none';button.onclick=()=>{dialog.showModal();dialog.focus()};dialog.querySelector('[data-theme-close]').onclick=()=>dialog.close();dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
  }
  window.addEventListener('message',event=>{if(event.data?.type==='classroom:theme-ready'&&[...document.querySelectorAll('iframe')].some(frame=>frame.contentWindow===event.source))event.source.postMessage({type:'classroom:theme',theme:current},'*')});
 }else{
  window.addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='classroom:theme')apply(event.data.theme)});
  parent.postMessage({type:'classroom:theme-ready'},'*');
 }
})();
/* 10.54: Fokusrahmen nur bei Tastaturbedienung – nach Klick/Tipp (auch wenn ein Menü den Fokus zurückgibt) kein dicker Rahmen */
(function(){try{const r=document.documentElement;addEventListener('pointerdown',()=>r.classList.add('cm-pointer'),true);addEventListener('keydown',e=>{if(e.key==='Tab'||/^Arrow/.test(e.key))r.classList.remove('cm-pointer')},true);const st=document.createElement('style');st.textContent='html.cm-pointer :is(button,a,[role=button],[role=menuitem],[role=radio],[role=tab],summary):focus-visible{outline:none!important}';(document.head||r).append(st)}catch{}})();

(()=>{const st=document.createElement('style');st.id='ui-unify-1068';st.textContent='/* 10.68: Vereinheitlichung der Bedienelemente (Übersicht „Knöpfe, Schalter und Auswahllisten“) *//* 1 – eckige Knöpfe: 10 px Ecken, blauer Rand */html body :is(.pi-icon,.classroom-plan-zoom>button,.classroom-privacy-button,.cr-bell,.classroom-help-button,.cu-icon,.spi-btn:not(.plan-assess-switch),.btn.btn-secondary,.mode-edit-btn,.classroom-beamer-button,.ew-btn,.exam-overview-back,.test-head-overview):not(.classroom-roll-split>*):not(#_):not(#__){border-radius:10px!important}html body :is(.pi-icon:not(.pi-danger),.classroom-plan-zoom>button,:is(.ng-badge,.test-defaults-badge,.exam-lock-banner)>button,.classroom-privacy-button,.cr-bell,.classroom-help-button,.cu-icon,#classroomBackupButton,.cb-split>button,.spi-btn:not([aria-pressed=true]):not(.plan-assess-switch),.btn.btn-secondary,.mode-edit-btn,.classroom-beamer-button,.cd-seg,.ew-btn:not(.ew-hot)):not(#_):not(#__){border-color:#a8bdd8!important}html body .cb-split>:first-child:not(#_):not(#__){border-radius:10px 0 0 10px!important}html body .cb-split>.cb-quick:not(:last-child):not(#_):not(#__){border-right-width:0!important}html body .cb-split>.cb-quick+.cb-quick:not(#_):not(#__){border-left:1px solid #a8bdd8!important}html body .cb-split>:last-child:not(#_):not(#__){border-radius:0 10px 10px 0!important}html body .classroom-roll-split>:first-child:not(#_):not(#__){border-radius:10px 0 0 10px!important}html body .classroom-roll-split>:last-child:not(#_):not(#__){border-radius:0 10px 10px 0!important}/* 2 – Löschen: weiß, roter Rand, rote Schrift */html body .classroom-history-delete:not(#_):not(#__){background:#fff!important;border-color:#efb4b4!important;color:#b42318!important}html body .classroom-history-delete:hover:not(#_):not(#__){background:#fdf3f2!important}/* 3 – Schalter in Leisten als Knopf mit „gedrückt“-Zustand (wie im Sitzplan) */html:not(.ph-lite) body .task-actions>label.task-tendency-toggle:not(#_):not(#__):not(#___){position:relative;gap:0!important;padding:0 14px!important;border-radius:10px!important;font-size:14.4px!important;font-weight:400!important;color:#2f5f9b}html:not(.ph-lite) body .task-actions>label.task-tendency-toggle input:not(#_):not(#__){position:absolute!important;inset:0;width:100%!important;height:100%!important;opacity:0;margin:0!important;cursor:pointer}html:not(.ph-lite) body .task-actions>label.task-tendency-toggle:has(input:checked):not(#_):not(#__):not(#___){background:#e8f0fb!important;border-color:#9bb6dc!important;font-weight:600!important}html:not(.ph-lite) body .task-actions>label.task-tendency-toggle:has(input:focus-visible){outline:3px solid #2f5f9b55;outline-offset:2px}/* 4 – Textknöpfe 40 px, Schrift 14,4 px */html body :is(.ng-badge,.test-defaults-badge,.exam-lock-banner)>button:not(#_):not(#__){box-sizing:border-box;height:40px!important;min-height:40px!important;border-radius:10px!important;font-size:14.4px!important}html body .ew-btn:not(#_):not(#__){font-size:14.4px!important}/* 5 – Umschalter (Segmente): einheitlich 14,4 px */html body :is(.mean-seg,.ps-seg,.so-sort,.vt-seg,.so-cseg)>button:not(#_):not(#__){font-size:14.4px!important;font-weight:400!important}html body :is(.mean-seg,.ps-seg)>button:is([aria-checked=true],[aria-pressed=true],.on,.active):not(#_):not(#__){font-weight:600!important}html body th .mean-seg>button:not(#_):not(#__){color:#243247}/* 6 – Auswahllisten in Leisten 40 px / 10 px */html body .ng-basis-row select:not(#_):not(#__){box-sizing:border-box;height:40px!important;border-radius:10px!important;font-size:14.4px!important;font-weight:400!important}html body select[aria-label="Gespeicherte Sitzpläne"]:not(#_):not(#__){border-radius:10px!important}/* 7 – kleine „−“-Knöpfe 30 px */html body button.task-remove:not(#_):not(#__){box-sizing:border-box;height:30px!important;min-height:30px!important}';(document.head||document.documentElement).append(st);/* nach allen anderen Stilen einhängen */addEventListener('load',()=>{try{document.head.append(st)}catch{}})})();
/* 10.76: Datenschutz-Auge – aktiv orange ausgefüllt, damit der Modus nicht vergessen wird */
(()=>{const st=document.createElement('style');st.id='privacy-eye-1076';st.textContent='html body .classroom-privacy-button.is-on:not(#_):not(#__):not(#___),html body .classroom-global-actions>.classroom-privacy-button.is-on:not(#_):not(#__):not(#___){background:#f59e0b!important;border:1px solid #d97f06!important;border-color:#d97f06!important;color:#fff!important;box-shadow:none!important;outline:0!important}html body .classroom-privacy-button.is-on:not(#_):not(#__):not(#___) svg{stroke:#fff!important;color:#fff!important}html body .classroom-privacy-button.is-on:not(#_):not(#__):not(#___):focus-visible{box-shadow:0 0 0 3px #fde7c2!important}';const add=()=>{if(!document.getElementById(st.id))(document.head||document.documentElement).append(st)};add();addEventListener('load',add)})();
;

/* ==== sitzplan/plan-zoom.js ==== */
/* 12.24: Safari (iPad) zeichnet die verkleinerte Sitzplan-Fläche nach Farbwechseln nicht immer vollständig neu – Fläche kurz unsichtbar machen und sofort wieder zeigen, das erzwingt ein komplettes Neuzeichnen. */
/* 12.53: mehrere Aufrufe im selben Moment zu einem Neuzeichnen bündeln – ohne erzwungene Zwischenmessungen */
{let rp=0;window.classroomRepaintBoard=()=>{if(rp)return;rp=requestAnimationFrame(()=>{const L=[...document.querySelectorAll('.classroom-zoom-board,.room-grid')];for(const b of L)b.style.opacity='0.999';requestAnimationFrame(()=>{for(const b of L)b.style.removeProperty('opacity');rp=0})})}}
// Zoom only the seats and coordinate headings; controls remain full size.
(()=>{
 const grid=document.getElementById('roomGrid');if(!grid)return;
 const mobileDevice=classroomDevice.mobile;
 // iPhone: ohne Spaltenbuchstaben und Reihennummern – mehr Platz für die Tische.
 const PH=matchMedia('(max-width:540px) and (orientation:portrait), (max-height:500px) and (pointer:coarse) and (orientation:landscape)'),hw=()=>PH.matches?0:35,hh=()=>PH.matches?0:45;
 const PZL=20,PZR=20;{const st=document.createElement('style');st.textContent='body[data-module=sitzplan] .classroom-plan-scroll.pz-wide:not(#_){box-sizing:border-box;width:calc(100% + '+(PZL+PZR)+'px)!important;max-width:none!important;margin-left:-'+PZL+'px!important;margin-right:-'+PZR+'px!important;padding-right:'+PZR+'px}';document.head.append(st)}
 let scale=1,fit=false,auto=true,rotated=false,fullBarW=0;const PLQ=matchMedia('(max-height:500px) and (orientation:landscape) and (pointer:coarse)');// auto: Desktop und iPad quer 100 %, iPad/iPhone hochkant einpassen, falls 100 % zu groß
 const portrait=()=>mobileDevice&&matchMedia('(orientation: portrait)').matches;const min=.1,max=1.5;
 const controls=document.createElement('div');controls.className='classroom-plan-zoom';controls.setAttribute('role','group');controls.setAttribute('aria-label','Sitzplan vergrößern oder verkleinern');
 controls.innerHTML='<button type="button" data-zoom-minus aria-label="Sitzplan verkleinern">−</button><input type="range" min="10" max="150" step="5" value="100" aria-label="Zoom des Sitzplans"><output aria-live="polite">100 %</output><button type="button" data-zoom-plus aria-label="Sitzplan vergrößern">+</button><button type="button" data-zoom-fit>Einpassen</button><button type="button" data-zoom-reset>100 %</button>';
 // Bewertungen (im Sitzplan): Schalter (an = Noten und Hausaufgaben-Status an den Plätzen sichtbar).
 const assessmentSwitch=document.createElement('label');assessmentSwitch.className='plan-assess-switch';
 assessmentSwitch.innerHTML='<input type="checkbox" role="switch" aria-label="Bewertungen im Sitzplan"><span>Bewertungen</span>';
 assessmentSwitch.title='Noten und Hausaufgaben-Status an den Plätzen ein- oder ausblenden. Gespeicherte Einträge bleiben erhalten.';
 const assessmentInput=assessmentSwitch.querySelector('input');
 let assessmentsVisible=localStorage.getItem('classroom-seat-assessments-visible')!=='false';
 function updateAssessmentVisibility(){
  document.documentElement.classList.toggle('classroom-assessments-hidden',!assessmentsVisible);
  /* 12.24: Safari am iPad aktualisierte nach dem Umschalten nicht immer alle Plätze – jeden Platz direkt markieren, damit er neu gezeichnet wird */
  for(const c of document.querySelectorAll('.room-grid .cell'))c.toggleAttribute('data-ah',!assessmentsVisible);
  window.classroomRepaintBoard?.();
  if(assessmentInput.checked!==assessmentsVisible)assessmentInput.checked=assessmentsVisible;
 }
 assessmentInput.onchange=()=>{assessmentsVisible=assessmentInput.checked;localStorage.setItem('classroom-seat-assessments-visible',String(assessmentsVisible));updateAssessmentVisibility()};
 controls.append(assessmentSwitch);updateAssessmentVisibility();
 /* 8.81: Noten-Schnellansicht (Mac/iPad) – Notenkarten der Klasse in der linken Spalte */
 {const qv=document.createElement('button');qv.type='button';qv.dataset.quickview='';qv.className='plan-quick-notes';qv.setAttribute('aria-pressed','false');qv.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7.5 12.5l3 3 6-6.5"/></svg><span>Noten</span>';qv.title='Noten der Klasse neben dem Sitzplan zeigen';qv.onclick=()=>{try{parent.classroomQuickToggle?.()}catch{}};controls.append(qv);
  const qs=document.createElement('style');qs.textContent='.plan-quick-notes{display:inline-flex;align-items:center;gap:6px}.plan-quick-notes[aria-pressed=true]{background:#eaf0fa!important;border-color:#8fb0dc!important;color:#2f5f9b!important}html.ph-lite .plan-quick-notes{display:none!important}html.cm-quick-on body[data-module=sitzplan] .container>.panel{visibility:hidden}';document.head.append(qs)}
 const assessmentStyle=document.createElement('style');assessmentStyle.textContent='/* 12.26: stärker als „Schraffur aus“ (html.hatching-off .classroom-unstriped) – sonst blieben Tendenz-Noten farbig */html.classroom-assessments-hidden body .room-grid .cell.classroom-seat-assessed:not(#_):not(#__),html body .room-grid .cell.classroom-seat-assessed[data-ah]:not(#_):not(#__),.classroom-assessments-hidden .room-grid .classroom-seat-assessed,.room-grid .classroom-seat-assessed[data-ah]{background-color:#fff!important;background:#fff!important;background-image:none!important;color:#24334b!important}.classroom-assessments-hidden .room-grid .classroom-seat-homework-missing::after{display:none!important}';/* 11.00: Farbfeld-Knopf wie das linke Feld des Vierfach-Schalters – grün mit rotem Rahmen = Farben sichtbar, weiß mit orangem Rand = ausgeblendet */assessmentStyle.textContent+='html body label.plan-assess-switch:not(#_):not(#__):not(#___){display:inline-flex!important;align-items:center;justify-content:center;box-sizing:border-box;width:40px!important;min-width:40px!important;height:40px!important;min-height:40px!important;margin:0!important;padding:0!important;gap:0!important;border:1px solid #a8bdd8!important;border-radius:10px!important;background:#fff!important;box-shadow:none!important;opacity:1!important;cursor:pointer;user-select:none}'
  +'html body label.plan-assess-switch:not(#_):not(#__):not(#___):has(input:not(:checked)){border:1.5px solid #d97f06!important;background:#fde0b8!important}'/* 11.76: ausgeblendet = hellorange ausgefüllt, Kästchen weiß */
  +'html body label.plan-assess-switch:not(#_):not(#__):not(#___)>span,html body label.plan-assess-switch:not(#_):not(#__):not(#___)>svg{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important}'
  +'html body label.plan-assess-switch:not(#_):not(#__):not(#___) input{appearance:none;-webkit-appearance:none;position:static!important;flex:none!important;width:26px!important;height:18px!important;margin:0!important;padding:0!important;box-sizing:border-box;border:2px solid #aebbd0!important;border-radius:5px!important;background:#fff!important;-webkit-mask:none!important;mask:none!important;box-shadow:none!important;transform:none!important;cursor:pointer}'
  +'html body label.plan-assess-switch:not(#_):not(#__):not(#___) input:checked{background:#c5e39e!important;border:2.5px solid #d1453b!important}'
  +'html body label.plan-assess-switch:not(#_):not(#__):not(#___) input::before{display:none!important}html body label.plan-assess-switch:not(#_):not(#__):not(#___) input:focus-visible{outline:3px solid #8ba9d1;outline-offset:3px}'
  +'.classroom-beamer .plan-assess-switch{display:none!important}';
 document.head.append(assessmentStyle);
 grid.before(controls);const slider=controls.querySelector('input'),output=controls.querySelector('output');

 function dimensions(){return {width:35+COLS*75+COLS*5,height:(ROWS+1)*45+ROWS*5}}
 function update(){
  controls.hidden=grid.hidden;if(grid.hidden)return;
  const board=grid.querySelector('.classroom-zoom-board'),viewport=grid.querySelector('.classroom-plan-viewport'),scroll=grid.querySelector('.classroom-plan-scroll');if(!board)return;
  const cells=[...board.querySelectorAll('.cell')],used=cells.filter(cell=>!!gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)]),crop=!document.getElementById('classroomEditRoom')?.checked&&used.length>0;
  const minRow=crop?Math.min(...used.map(c=>Number(c.dataset.row))):0,maxRow=crop?Math.max(...used.map(c=>Number(c.dataset.row))):ROWS-1,minCol=crop?Math.min(...used.map(c=>Number(c.dataset.col))):0,maxCol=crop?Math.max(...used.map(c=>Number(c.dataset.col))):COLS-1,rowCount=maxRow-minRow+1,colCount=maxCol-minCol+1;
  for(const cell of cells){const row=Number(cell.dataset.row),col=Number(cell.dataset.col);cell.style.display=row<minRow||row>maxRow||col<minCol||col>maxCol?'none':'';cell.style.gridRow=String((rotated?maxRow-row:row-minRow)+2);cell.style.gridColumn=String((rotated?maxCol-col:col-minCol)+2)}
  const headers=[...board.querySelectorAll('.grid-header')];headers.forEach((header,index)=>{if(index<COLS){header.style.display=index<minCol||index>maxCol?'none':'';header.style.gridRow='1';header.style.gridColumn=String((rotated?maxCol-index:index-minCol)+2)}else{const row=index-COLS;header.style.display=row<minRow||row>maxRow?'none':'';header.style.gridColumn='1';header.style.gridRow=String((rotated?maxRow-row:row-minRow)+2)}if(PH.matches)header.style.display='none'});
  const corner=board.querySelector('.grid-corner');if(corner){corner.style.gridRow='1';corner.style.gridColumn='1';corner.style.display=PH.matches?'none':''}
  const rotate=grid.querySelector('#classroomRotateButton');if(rotate){rotate.setAttribute('aria-pressed',String(rotated));rotate.textContent='Lehrer-/Schülersicht';rotate.title=rotated?'Schülerperspektive aktiv – zur Lehrerperspektive wechseln':'Lehrerperspektive aktiv – zur Schülerperspektive wechseln'}
  const occupied=[...board.querySelectorAll('.cell')].filter(cell=>!!gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)]);
  if(occupied.length){
   const cols=occupied.map(cell=>parseInt(cell.style.gridColumn,10)),rows=occupied.map(cell=>parseInt(cell.style.gridRow,10)),left=Math.min(...cols),top=Math.min(...rows),width=(Math.max(...cols)-left)*80+75,height=(Math.max(...rows)-top)*50+45,printScale=Math.min((178*96/25.4)/width,(215*96/25.4)/height);
   board.style.setProperty('--print-seat-left',-(hw()+5+(left-2)*80)+'px');board.style.setProperty('--print-seat-top',-(hh()+5+(top-2)*50)+'px');board.style.setProperty('--print-seat-scale',printScale);viewport.style.setProperty('--print-seat-height',height*printScale+'px');
  }
  const d={width:hw()+colCount*80,height:hh()+rowCount*50};board.style.width=d.width+'px';board.style.height=d.height+'px';board.style.gridTemplateColumns=`${hw()}px repeat(${colCount},75px)`;board.style.gridTemplateRows=`${hh()}px repeat(${rowCount},45px)`;
  for(const cell of cells){cell.style.removeProperty('height');cell.style.removeProperty('width');cell.style.removeProperty('min-height');cell.style.removeProperty('box-sizing')}
  /* iPhone (schlanke Bewertungsansicht): passt der Plan nicht aufs Display, werden leere Reihen/Spalten zu schmalen Gängen
     und – nur falls nötig – die Tische etwas flacher (nie schmaler). */
  let liteScale=null;
  if(document.documentElement.classList.contains('ph-lite')&&scroll.clientWidth>0){
   const vis=cells.filter(c=>c.style.display!=='none'),R=new Map(),C=new Map();
   for(const c of vis){const r=parseInt(c.style.gridRow,10),k=parseInt(c.style.gridColumn,10),full=!!gridData[Number(c.dataset.row)]?.[Number(c.dataset.col)];if(!R.has(r))R.set(r,false);if(!C.has(k))C.set(k,false);if(full){R.set(r,true);C.set(k,true)}}
   const rowsN=R.size,colsN=C.size,eR=[...R.values()].filter(v=>!v).length,eC=[...C.values()].filter(v=>!v).length;
   const top=scroll.getBoundingClientRect().top+window.scrollY,availH=Math.max(120,window.innerHeight-top-14);let availW=Math.max(100,scroll.clientWidth);/* 8.64: bündig mit den Knöpfen – Plaketten dürfen überstehen (overflow sichtbar) */
   const W=(colW)=>hw()+[...C.values()].reduce((a,v)=>a+(v?75:colW)+5,0)-(hw()?0:5),H=(rowH,emptyH)=>hh()+[...R.values()].reduce((a,v)=>a+(v?rowH:emptyH)+5,0);
   /* 8.59: iPhone quer – begrenzt die Breite den Plan, werden Datum/Perspektive zu kleinen Knöpfen (Symbol + H/G bzw. P). Entscheidung aus der Gesamtbreite (Plan + Knöpfe) – kein Hin- und Herspringen. */
   const bar=grid.previousElementSibling?.classList.contains('pl-seatbar')?grid.previousElementSibling:null,landscape=PLQ.matches;
   if(bar&&landscape&&bar.offsetParent){const cur=bar.getBoundingClientRect().width,compact=bar.classList.contains('pl-compact');if(!compact&&cur>40)fullBarW=cur;const base=scroll.clientWidth+cur,wFull=base-(fullBarW||150),wComp=base-52;
    const hFit=Math.min(1,availH/H(45,eR?10:45)),want=wFull/W(75)<hFit-.01;if(want!==compact)bar.classList.toggle('pl-compact',want);availW=Math.max(100,want?wComp:wFull)}
   else if(bar?.classList.contains('pl-compact'))bar.classList.remove('pl-compact');
   const plain=Math.min(1,availW/W(75));
   if(H(45,45)*plain>availH+1&&(eR||rowsN)){
    /* 8.74: leere Spalten nur verschmälern, wenn die Breite begrenzt – reicht die Breite, bleiben sie normal breit */
    const rowFor=sw=>{let h=45;if(H(45,10)*sw>availH){const full=rowsN-eR;h=Math.max(34,Math.floor(((availH/sw)-hh()-eR*15-full*5)/Math.max(1,full)))}return h};
    let colW=75,sw=Math.min(1,availW/W(75)),rowH=rowFor(sw);
    if(eC&&availW/W(75)<Math.min(1,availH/H(rowH,10))-.001){colW=14;sw=Math.min(1,availW/W(colW));rowH=rowFor(sw)}
    const rowsT=[...R.entries()].sort((a,b)=>a[0]-b[0]).map(([,v])=>(v?rowH:10)+'px'),colsT=[...C.entries()].sort((a,b)=>a[0]-b[0]).map(([,v])=>(v?75:colW)+'px');
    board.style.gridTemplateRows=`${hh()}px ${rowsT.join(' ')}`;board.style.gridTemplateColumns=`${hw()}px ${colsT.join(' ')}`;
    for(const c of vis){const r=parseInt(c.style.gridRow,10),k=parseInt(c.style.gridColumn,10);c.style.setProperty('height',(R.get(r)?rowH:10)+'px','important');/* 8.56: Höhe inklusive Rand – sonst ragen die Tische in die schmalen Gänge */c.style.setProperty('min-height','0','important');c.style.setProperty('box-sizing','border-box','important');if(!C.get(k))c.style.setProperty('width',colW+'px','important')}
    d.width=W(colW);d.height=H(rowH,10);board.style.width=d.width+'px';board.style.height=d.height+'px';
    liteScale=Math.max(.3,Math.min(1,availW/d.width,availH/d.height));
   }else liteScale=plain;
   /* 8.59: iPhone quer – bleibt unten Platz, werden die Tischreihen höher (höchstens 1,6-fach), bis der Plan die Höhe ausfüllt. */
   if(landscape){const rowsE=[...R.entries()].sort((a,b)=>a[0]-b[0]),cur=new Map();const tpl=board.style.gridTemplateRows.split(' ').slice(1);const compressed=tpl.length===rowsE.length&&!/repeat/.test(board.style.gridTemplateRows);
    rowsE.forEach(([r],i)=>cur.set(r,compressed?parseFloat(tpl[i]):45));const grow=[...cur.values()].filter(h=>h>10).reduce((a,b)=>a+b,0),room=availH/liteScale-d.height;
    if(grow>0&&room>2){const f=Math.min(1.6,1+room/grow);for(const [r,h] of cur)if(h>10)cur.set(r,h*f);board.style.gridTemplateRows=`${hh()}px ${rowsE.map(([r])=>cur.get(r)+'px').join(' ')}`;
     for(const c of vis){const h=cur.get(parseInt(c.style.gridRow,10));if(h){c.style.setProperty('height',h+'px','important');c.style.setProperty('min-height','0','important');c.style.setProperty('box-sizing','border-box','important')}}
     d.height=hh()+[...cur.values()].reduce((a,h)=>a+h+5,0);board.style.height=d.height+'px'}}
  }else{const b=grid.previousElementSibling;if(b?.classList.contains('pl-compact'))b.classList.remove('pl-compact')}
  /* 9.57: Einpassen – rechts bündig mit dem Ende der Schalterzeile, links 20 px in den Kartenrand; die Pillen ragen in den rechten Innenabstand */{const wide=liteScale===null&&(auto||fit);if(scroll.classList.contains('pz-wide')!==wide)scroll.classList.toggle('pz-wide',wide)}
  if(liteScale!==null){scale=liteScale}else if(auto&&!mobileDevice&&innerWidth<1700&&!document.documentElement.classList.contains('classroom-beamer')){/* 9.89: Mac – 100 % (ist der Plan breiter, scrollt er in seinem Rahmen); 10.40: auf sehr breiten Bildschirmen (Fernseher) und im Beamer-Modus wird eingepasst */scale=1}else if(auto){/* 9.89: iPad – einpassen (Breite und Höhe, auch größer als 100 %); 10.40: am Mac/Fernseher bleibt die Knopfzeile darunter sichtbar */const fitW=Math.max(0,scroll.clientWidth-PZR)/d.width,top=scroll.getBoundingClientRect().top+window.scrollY,availH=window.innerHeight-top-70-(mobileDevice?0:((document.querySelector('.classroom-plan-actions')?.offsetHeight||40)+34)),fitH=availH>160?availH/d.height:1;scale=Math.max(min,Math.min(max,fitW,Math.max(.55,fitH)))}else if(false){/* 9.46: rechts Luft für die Gruppen-Pillen, die über die Tischkante ragen */const fitW=Math.max(0,scroll.clientWidth-PZR)/d.width,top=scroll.getBoundingClientRect().top+window.scrollY,availH=window.innerHeight-top-70,fitH=mobileDevice&&availH>160?availH/d.height:1;/* Höhe nur auf iPad/iPhone berücksichtigen – am Mac zählt nur die Breite. */scale=Math.max(min,Math.min(1,fitW,Math.max(.55,fitH)))}else if(fit)scale=Math.max(min,Math.min(max,Math.max(0,scroll.clientWidth-PZR)/d.width));
  board.style.transform=liteScale!==null&&!hw()?`scale(${scale}) translateX(-5px)`:`scale(${scale})`;/* 8.64: iPhone – linke Tischkante bündig (leere Kopfspalte hat 5 px Abstand) */viewport.style.width=d.width*scale+'px';viewport.style.height=d.height*scale+'px';
  /* 9.89: Plan waagerecht mittig (nicht in der schlanken iPhone-Ansicht); ist er breiter als die Fläche, beginnt er links und scrollt */const centered=liteScale===null;viewport.style.marginLeft=centered?'auto':'';viewport.style.marginRight=centered?'auto':'';scroll.style.paddingLeft=centered&&scroll.classList.contains('pz-wide')&&d.width*scale<=scroll.clientWidth-PZL-PZR?PZL+'px':'';
  // Gruppenlegende endet bündig mit dem rechten Rand des Sitzplans.
  const legend=grid.querySelector(':scope > .main-group-legend');if(legend){const w=Math.round(d.width*scale);for(const [k,v] of [['width',w+'px'],['max-width','100%'],['justify-self','start'],['align-self',liteScale===null?'center':'flex-start'],['justify-content','flex-end'],['box-sizing','border-box'],['margin-left',liteScale===null?'auto':'0'],['margin-right',liteScale===null?'auto':'0'],['padding-right','0']])legend.style.setProperty(k,v,'important')}
  slider.value=String(Math.round(scale*100));output.textContent=Math.round(scale*100)+' %';controls.querySelector('[data-zoom-minus]').disabled=scale<=min;controls.querySelector('[data-zoom-plus]').disabled=scale>=max;controls.querySelector('[data-zoom-fit]').setAttribute('aria-pressed',String(fit));
 }
 const randomChoice=document.getElementById('randomStudentButton');
 function build(){
  const items=[...grid.children].filter(item=>item.matches('.cell,.grid-header,.grid-corner'));if(!items.length){update();return}
  const scroll=document.createElement('div');scroll.className='classroom-plan-scroll';const viewport=document.createElement('div');viewport.className='classroom-plan-viewport';const board=document.createElement('div');board.className='classroom-zoom-board';
  const d=dimensions();board.style.width=d.width+'px';board.style.height=d.height+'px';board.style.gridTemplateColumns=`35px repeat(${COLS},75px)`;board.style.gridTemplateRows=`repeat(${ROWS+1},45px)`;board.append(...items);viewport.append(board);scroll.append(viewport);grid.prepend(scroll);
  const actions=grid.querySelector(':scope > .grid-action-buttons'),save=grid.querySelector(':scope > .grid-save-button'),primary=grid.querySelector(':scope > .grid-primary-buttons');
  const toolbar=document.createElement('div');toolbar.className='classroom-plan-actions';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Sitzplanaktionen');
  const rotate=grid.querySelector('#undoGridButton');if(rotate){rotate.id='classroomRotateButton';rotate.className='btn btn-secondary';rotate.textContent='Lehrer-/Schülersicht';rotate.title='Lehrerperspektive aktiv – zur Schülerperspektive wechseln';rotate.disabled=false;rotate.onclick=()=>{rotated=!rotated;if(typeof quickClose==='function')quickClose();update()};}
  if(actions)toolbar.append(...actions.children);if(save)toolbar.append(save);if(primary)toolbar.append(...primary.children);actions?.remove();primary?.remove();const reset=toolbar.querySelector('.btn-grid-reset'),start=toolbar.querySelector('#classroomStartButton'),fullscreen=[...toolbar.children].find(button=>button.textContent.includes('Vollbild')),print=[...toolbar.children].find(button=>button.textContent.trim()==='Drucken');if(save)save.classList.add('btn-secondary');if(fullscreen){controls.querySelector('[data-top-fullscreen]')?.remove();fullscreen.dataset.topFullscreen='';controls.insertBefore(fullscreen,assessmentSwitch)}for(const button of [randomChoice,rotate,save,print,start,reset])if(button)toolbar.append(button);grid.append(toolbar);aktualisiereZufallButton();update();
 }
 function set(value){fit=false;auto=false;scale=Math.max(min,Math.min(max,value));if(typeof quickClose==='function')quickClose();update()}
 controls.querySelector('[data-zoom-minus]').onclick=()=>set(scale-.1);controls.querySelector('[data-zoom-plus]').onclick=()=>set(scale+.1);slider.oninput=()=>set(Number(slider.value)/100);controls.querySelector('[data-zoom-reset]').onclick=()=>set(1);controls.querySelector('[data-zoom-fit]').onclick=()=>{fit=true;auto=false;if(typeof quickClose==='function')quickClose();update()};
 classroomHooks.add('initGrid','plan-zoom: Zoom aufbauen',{after(){build()}});build();
 new MutationObserver(()=>update()).observe(grid,{attributes:true,attributeFilter:['hidden']});
 document.getElementById('classroomEditRoom')?.addEventListener('change',update);
 new ResizeObserver(()=>update()).observe(grid);document.addEventListener('fullscreenchange',update);
 // Beim Drehen des iPads wieder automatisch (quer 100 %, hochkant ggf. eingepasst).
 matchMedia('(orientation: portrait)').addEventListener('change',()=>{auto=true;fit=false;update()});PH.addEventListener?.('change',()=>update());{let was=null;new MutationObserver(()=>{const c=document.documentElement.classList,now=c.contains('ph-lite')+'|'+c.contains('classroom-beamer');if(now!==was){was=now;update()}}).observe(document.documentElement,{attributes:true,attributeFilter:['class']})}
})();
/* 13.10: Vollbild-Knopf auch im Sitzplan – rechts neben „1:1“, wie im Noten-Manager.
   Echtes Vollbild für den Sitzplan-Bereich; wo der Browser das nicht erlaubt (iPad-App), legt sich der Bereich über die ganze App. */
(()=>{
 const root=document.documentElement;
 const IN='<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>';
 const OUT='<path d="M9 4v4a1 1 0 0 1-1 1H4M20 9h-4a1 1 0 0 1-1-1V4M15 20v-4a1 1 0 0 1 1-1h4M4 15h4a1 1 0 0 1 1 1v4"/>';
 const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
 const canReal=()=>!!(document.fullscreenEnabled||document.webkitFullscreenEnabled)&&!!(root.requestFullscreen||root.webkitRequestFullscreen);
 const pdoc=()=>{try{return frameElement&&parent.document}catch{return null}};
 let pseudo=false;
 function setPseudo(on){const d=pdoc();if(!d)return;pseudo=on;
  if(!d.getElementById('sitzplan-fs-style')){const st=d.createElement('style');st.id='sitzplan-fs-style';st.textContent='body.sitzplan-fs .workspace{position:fixed!important;inset:0!important;z-index:9800!important;background:#f6f8fc;padding:env(safe-area-inset-top) env(safe-area-inset-right) 0 env(safe-area-inset-left);box-sizing:border-box}body.sitzplan-fs .workspace>iframe:not(#view-sitzplan){visibility:hidden}';d.head.append(st)}
  d.body.classList.toggle('sitzplan-fs',on);changed()}
 const isOn=()=>!!fsEl()||pseudo;
 function toggle(){try{
  if(pseudo){setPseudo(false);return}
  if(fsEl()){(document.exitFullscreen||document.webkitExitFullscreen).call(document);return}
  if(!canReal()){setPseudo(true);return}
  const r=(root.requestFullscreen||root.webkitRequestFullscreen).call(root);r?.catch?.(()=>setPseudo(true));
  if(!r||!r.then)setTimeout(()=>{if(!fsEl()&&!pseudo)setPseudo(true)},400)}catch{setPseudo(true)}}
 function paint(b){const on=isOn(),k=on?'on':'off';if(b.dataset.fs===k)return;b.dataset.fs=k;
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+(on?OUT:IN)+'</svg>';
  b.title=on?'Vollbild beenden (Esc)':'Vollbild: Sitzplan über den ganzen Bildschirm';b.setAttribute('aria-label',on?'Vollbild beenden':'Vollbild');b.setAttribute('aria-pressed',on?'true':'false')}
 function place(){const bar=document.querySelector('.classroom-plan-zoom');if(!bar)return;
  const show=(canReal()||!!pdoc())&&!root.classList.contains('ph-lite');let b=bar.querySelector(':scope>.sp-fs-btn');
  if(!show){b?.remove();return}
  if(!b){b=document.createElement('button');b.type='button';b.className='sp-fs-btn';b.addEventListener('click',e=>{e.stopPropagation();toggle()})}
  const ref=bar.querySelector(':scope>[data-zoom-reset]');if(ref&&b.previousElementSibling!==ref)ref.after(b);else if(!ref&&!b.parentElement)bar.append(b);
  paint(b)}
 /* 13.11: im Vollbild die Seitenleiste (Einstellungen) einklappen und danach den vorigen Zustand wiederherstellen */
 let sideWas=null;
 function side(on){const b=document.querySelector('.classroom-sidebar-toggle');if(!b)return;const open=b.getAttribute('aria-expanded')==='true';
  if(on){if(sideWas===null){sideWas=open;if(open)b.click()}}else if(sideWas!==null){const w=sideWas;sideWas=null;if(w&&!open)b.click()}}
 function changed(){const on=isOn();root.classList.toggle('sp-fs-view',on);side(on);place();setTimeout(()=>dispatchEvent(new Event('resize')),60)}
 addEventListener('keydown',e=>{if(e.key==='Escape'&&pseudo&&!document.querySelector('dialog[open]')){e.preventDefault();setPseudo(false)}});
 document.addEventListener('fullscreenchange',changed);document.addEventListener('webkitfullscreenchange',changed);
 addEventListener('resize',place);setTimeout(place,0);setTimeout(place,800);
 try{classroomHooks.add('initGrid','plan-zoom: Vollbild',{after(){setTimeout(place,0)}})}catch{}
 window.classroomPlanFullscreen={toggle,isOn};
 const st=document.createElement('style');st.textContent=
  'html body .classroom-plan-zoom>.sp-fs-btn:not(#_):not(#__):not(#___){flex:none;width:40px!important;min-width:40px!important;height:40px!important;min-height:0!important;padding:0!important;margin:0 0 0 6px!important;border:0!important;border-radius:999px!important;background:#e7edf6!important;color:#66778f!important;display:inline-grid!important;place-items:center;box-shadow:none!important;cursor:pointer;align-self:center}'
  +'html body .classroom-plan-zoom>.sp-fs-btn[aria-pressed=true]:not(#_):not(#__):not(#___){background:#2f5f9b!important;border-color:#2f5f9b!important;color:#fff!important}'
  +'html body .classroom-plan-zoom>.sp-fs-btn:not([aria-pressed=true]):hover:not(#_):not(#__):not(#___){color:#243247!important}'
  +'html body .classroom-plan-zoom .zoom-more-toggle:not(#_):not(#__):not(#___){width:40px!important;min-width:40px!important;height:40px!important;padding:0!important;border:0!important;border-radius:999px!important;background:#e7edf6!important;color:#66778f!important;justify-content:center!important;box-shadow:none!important}'
  +'.sp-fs-btn svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}'
  +'html.ph-lite .sp-fs-btn,html.classroom-beamer .sp-fs-btn{display:none!important}@media print{.sp-fs-btn{display:none!important}}'
  +'html.sp-fs-view,html.sp-fs-view body{background:#f6f8fc}';
 document.head.append(st);
})();
;

/* ==== sitzplan/rooms.js ==== */
// Each class has independent rooms; the roster and lesson assessments stay shared.
(()=>{
 const key='sitzplan_rooms_v1';
 let store;try{store=JSON.parse(localStorage.getItem(key)||'{}')}catch{store={}}
 const persist=()=>localStorage.setItem(key,JSON.stringify(store));
 const blank=()=>Array.from({length:ROWS},()=>Array(COLS).fill(''));
 const valid=value=>Array.isArray(value)&&value.length<=ROWS&&value.every(row=>Array.isArray(row)&&row.length===COLS);
 function legacyGrid(){try{const saved=JSON.parse(localStorage.getItem(classroomStoragePrefix(aktuelleKlasse)+'grid'));return valid(saved)?saved:valid(gridData)?gridData:blank()}catch{return valid(gridData)?gridData:blank()}}
 function legacy(suffix,fallback){try{return JSON.parse(localStorage.getItem(classroomStoragePrefix(aktuelleKlasse)+suffix))||fallback}catch{return fallback}}
 function entry(){if(!store[aktuelleKlasse]){store[aktuelleKlasse]={active:'default',rooms:[{id:'default',name:'Raum 1',grid:structuredClone(legacyGrid()),groups:normalisiereGruppenRaster(legacy('groupGrid',gridGroupData)),anchors:Object.fromEntries(legacy('einzel',schuelerEinzel).map(s=>[s.classroomId||s.name,s.anker||''])),people:legacy('einzel',schuelerEinzel).map(s=>({id:s.classroomId||s.name,name:s.name}))}]};persist()}return store[aktuelleKlasse]}
 function room(){const e=entry();return e.rooms.find(r=>r.id===e.active)||e.rooms[0]}
 function selectForDate(){
  const e=entry(),date=classroomDate.value;if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
  e.usedByDate??={};const previous=new Date(date+'T12:00:00');previous.setDate(previous.getDate()-7);const week=[previous.getFullYear(),String(previous.getMonth()+1).padStart(2,'0'),String(previous.getDate()).padStart(2,'0')].join('-');
  let chosen=e.usedByDate[date]||e.usedByDate[week];
  // Existing backups already contain dated plans, so the rule also works before usage tracking was added.
  if(!chosen){let history;try{history=JSON.parse(localStorage.getItem('sitzplan_dated_layouts_v1')||'{}')}catch{history={}}let latest=-Infinity;for(const r of e.rooms){const context=r.id==='default'?aktuelleKlasse:aktuelleKlasse+'::room::'+r.id;const records=history[context]?.[week];for(const version of Array.isArray(records)?records:records?[records]:[]){const time=Number(version.createdAt)||new Date(week+'T'+(version.time||'00:00')+':00').getTime();if(time>latest){latest=time;chosen=r.id}}}}
  if(e.rooms.some(r=>r.id===chosen))e.active=chosen;
  e.usedByDate[date]=room().id;persist();
 }

 window.classroomRoomHistoryKey=()=>{const r=room();return r.id==='default'?aktuelleKlasse:aktuelleKlasse+'::room::'+r.id};
 const box=document.createElement('div');box.className='classroom-room-selector';
 const label=document.createElement('label');label.textContent='Raum';
 const select=document.createElement('select');select.id='classroomRoomSelect';select.setAttribute('aria-label','Unterrichtsraum auswählen');select.title='Raum wählen – jeder Raum hat seine eigene Tischanordnung';label.append(select);
 const add=document.createElement('button');add.type='button';add.className='btn btn-secondary';add.textContent='+ Raum';add.title='Einen weiteren Raum mit eigenem Sitzplan für diese Klasse anlegen';
 const rename=document.createElement('button');rename.type='button';rename.className='btn btn-secondary';rename.classList.add('room-rename-button');rename.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';rename.title='Ausgewählten Raum umbenennen';rename.setAttribute('aria-label',rename.title);
 box.append(label,add,rename);classroomDateLabel.after(box);/* 9.12: erst Datum, dann Raum */
 // „Tischanordnung …“ gehört zum Raum: volle Breite unter Raum, „+ Raum“ und Stift. Der frühere Halter in der Seitenleiste entfällt.
 {const layoutButton=document.getElementById('layoutToggleButton');if(layoutButton){layoutButton.classList.add('room-layout-button');box.append(layoutButton);document.querySelector('.layout-category-actions')?.remove()}}
 function refresh(){select.replaceChildren();for(const r of entry().rooms){const o=document.createElement('option');o.value=r.id;o.textContent=r.name;select.append(o)}select.value=room().id}
 function load(){const r=room(),people=new Map(schuelerEinzel.map(s=>[s.classroomId||s.name,s.name])),old=new Map((r.people||[]).map(s=>[s.name,s.id]));gridData=normalisiereSitzRaster(valid(r.grid)?r.grid:blank()).map(row=>row.map(value=>old.has(value)?people.get(old.get(value))||'X':value));gridGroupData=normalisiereGruppenRaster(r.groups);for(const s of schuelerEinzel)s.anker=r.anchors?.[s.classroomId||s.name]||'';
  // Legacy storage is the active-room mirror used by the existing history/print code.
  const p=classroomStoragePrefix(aktuelleKlasse);localStorage.setItem(p+'grid',JSON.stringify(gridData));localStorage.setItem(p+'groupGrid',JSON.stringify(gridGroupData));refresh();
 }
 classroomHooks.add('datenSpeichern','rooms: Raum mitspeichern',{after(){const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);if(classroomDate.value>=today){const r=room();r.grid=structuredClone(gridData);r.groups=structuredClone(gridGroupData);r.anchors=Object.fromEntries(schuelerEinzel.map(s=>[s.classroomId||s.name,s.anker||'']));r.people=schuelerEinzel.map(s=>({id:s.classroomId||s.name,name:s.name}));persist()}}});
 const originalLoad=ladeDaten;ladeDaten=function(...args){const result=originalLoad(...args);selectForDate();load();return result};
 function change(id){if(id===room().id)return;datenSpeichern();entry().active=id;entry().usedByDate??={};entry().usedByDate[classroomDate.value]=id;persist();load();undoGridHistory=[];undoGroupHistory=[];initGrid();renderTables();aktualisiereUndoButton();window.dispatchEvent(new Event('classroom:room-change'))}
 select.onchange=()=>change(select.value);
 /* 12.26: Raum ohne Rückfrage anlegen – für den Stundenplan (neuer Raum beim ersten Öffnen der Stunde) */window.classroomAddRoom=name=>{name=String(name||'').trim();if(!name)return null;const e=entry();const ex=e.rooms.find(r=>r.name.toLowerCase()===name.toLowerCase());if(ex){change(ex.id);return ex.id}const id=crypto.randomUUID();e.rooms.push({id,name,grid:blank(),groups:leeresGruppenRaster(),anchors:{},people:[]});persist();change(id);return id};
 add.onclick=async ()=>{const name=await classroomPrompt('Name des Raums (zum Beispiel Raum 102):','');if(!name?.trim())return;const e=entry();if(e.rooms.some(r=>r.name.toLowerCase()===name.trim().toLowerCase())){alert('Dieser Raum ist bereits vorhanden.');return}const id=crypto.randomUUID();e.rooms.push({id,name:name.trim(),grid:blank(),groups:leeresGruppenRaster(),anchors:{},people:[]});persist();change(id)};
 rename.onclick=async ()=>{const r=room(),name=await classroomPrompt('Raum umbenennen:',r.name);if(!name?.trim())return;if(entry().rooms.some(other=>other!==r&&other.name.toLowerCase()===name.trim().toLowerCase())){alert('Dieser Raum ist bereits vorhanden.');return}r.name=name.trim();persist();refresh()};
 classroomDate.addEventListener('change',()=>{const before=room().id;selectForDate();if(room().id!==before){load();undoGridHistory=[];undoGroupHistory=[];initGrid();renderTables();aktualisiereUndoButton();window.dispatchEvent(new Event('classroom:room-change'))}},true);
 selectForDate();load();
})();
/* Gruppenmodus (Button „Gruppen“) entfällt: Ein noch gespeicherter Gruppen-Sitzplan wird beim Anzeigen auf den normalen
   Sitzplan zurückgestellt; Tische und Namen bleiben, nur die Gruppenzuordnung der Tische wird entfernt. */
(()=>{const hasGroups=()=>Array.isArray(gridGroupData)&&gridGroupData.some(r=>Array.isArray(r)&&r.some(Number.isInteger));
 classroomHooks.add('initGrid','rooms: Gruppenraster zurücksetzen',{before(){if(hasGroups()){gridGroupData=leeresGruppenRaster();try{datenSpeichern()}catch{}}}});})();
/* 9.04: „Tischanordnung …“ steht im Klassenraum neben dem Schalter und erscheint nur im Sitzplanmodus (Tische stellt man nur dort um). */
(()=>{const edit=()=>document.getElementById('classroomEditRoom');
 function place(){const b=document.getElementById('layoutToggleButton'),head=document.querySelector('.room-header'),mode=head?.querySelector('.classroom-mode-toggle');if(!b||!head||!mode)return;
  let box=head.querySelector('.room-head-actions');if(!box){box=document.createElement('div');box.className='room-head-actions';mode.before(box);box.append(mode)}
  if(b.parentElement!==box){b.classList.remove('room-layout-button');b.classList.add('room-head-layout');box.prepend(b)}
  const on=!!edit()?.checked;if(b.hidden===on)b.hidden=!on;
  if(!on&&document.getElementById('layoutView')&&!document.getElementById('layoutView').hidden&&typeof zeigeSitzplan==='function')zeigeSitzplan()}
 document.addEventListener('change',e=>{if(e.target?.id==='classroomEditRoom')setTimeout(place,0)});
 classroomOnDomChange(place);place();setTimeout(place,500);
 const st=document.createElement('style');st.textContent='.room-header>.room-head-actions{display:flex;align-items:center;gap:12px;margin-left:auto}.room-head-actions>.room-head-layout:not(#_){width:auto!important;height:40px;min-height:40px;padding:0 16px;margin:0!important;border-radius:10px;font-size:14.4px;white-space:nowrap}.room-head-actions>.room-head-layout[hidden]{display:none!important}html.ph-lite .room-head-layout{display:none!important}';document.head.append(st);
})();
;

/* ==== sitzplan/plan-history.js ==== */
// Dated room layouts are independent of lesson assessments and current room storage.
(()=>{
 const key='sitzplan_dated_layouts_v1',today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
 const context=()=>window.classroomRoomHistoryKey?.()||aktuelleKlasse;
 const selectionKey='sitzplan_selected_versions_v1';
 let selections;try{selections=JSON.parse(localStorage.getItem(selectionKey)||'{}')}catch{selections={}}
 function rememberSelection(date,id){if(id)selections[context()]={date,id};else delete selections[context()];localStorage.setItem(selectionKey,JSON.stringify(selections))}
 const idleWindow=2*60*60*1000;
 function compactSeatHistory(all,now){
  let changed=false;
  for(const [className,days] of Object.entries(all))for(const [date,versions] of Object.entries(days)){
   if(!Array.isArray(versions))continue;
   const kept=[];let session=[];
   const timestamp=version=>Number.isFinite(version.createdAt)?version.createdAt:/^\d{2}:\d{2}$/.test(version.time||'')?new Date(date+'T'+version.time+':00').getTime():NaN;
   const isGroup=version=>version.label==='Gruppeneinteilung'||version.groups?.some(row=>row.some(Number.isInteger));
   const flush=()=>{if(!session.length)return;const latest=session.at(-1),lastTime=timestamp(latest);
    if(session.length>1&&Number.isFinite(lastTime)&&now-lastTime>=idleWindow){
     // Keep a historical version that is currently being viewed as well.
     kept.push(...session.filter(v=>v===latest||(selections[className]?.date===date&&selections[className]?.id===v.id)));changed=true;
    }else kept.push(...session);session=[];
   };
   for(const version of versions){
    const time=timestamp(version);
    if(isGroup(version)||!Number.isFinite(time)){flush();kept.push(version);continue}
    if(session.length&&time-timestamp(session.at(-1))>=idleWindow)flush();session.push(version);
   }
   flush();days[date]=kept;
  }
  return changed;
 }
 const read=()=>{let all;try{all=JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}
  for(const days of Object.values(all))for(const [date,value] of Object.entries(days))if(!Array.isArray(value))days[date]=[{...value,id:'legacy-'+date,time:''}];
  if(compactSeatHistory(all,Date.now()))try{localStorage.setItem(key,JSON.stringify(all))}catch{}
  return all;
 };
 const prefix=()=> 'sitzplan_'+aktuelleKlasse.replace(/\s+/g,'_')+'_';
 let lastLayout=null,selectedId=null,selectedDate=null;
 const layout=()=>JSON.stringify([gridData,gridGroupData]);
 let loading=false,trackedClass=context(),trackedDate=classroomDate.value;
 const historyBox=document.createElement('div');historyBox.className='classroom-plan-history-box';{/* 9.12: Reihenfolge Datum → Raum → gespeicherte Sitzpläne */const rs=document.querySelector('.classroom-room-selector');if(rs)rs.after(historyBox);else classroomDateLabel.append(historyBox)}
 const savedLabel=document.createElement('span');savedLabel.textContent='Gespeicherte Sitzpläne';
 const savedSelect=document.createElement('select');savedSelect.setAttribute('aria-label','Gespeicherte Sitzpläne');
 historyBox.append(savedLabel,savedSelect);
 const removeButton=document.createElement('button');removeButton.type='button';removeButton.className='btn classroom-history-delete';removeButton.textContent='Version löschen';removeButton.setAttribute('aria-label','Ausgewählten gespeicherten Sitzplan löschen');const deleteActions=document.createElement('div');deleteActions.className='classroom-history-delete-actions';deleteActions.append(removeButton);const removeDayButton=document.createElement('button');removeDayButton.type='button';removeDayButton.className='btn classroom-history-delete';removeDayButton.textContent='Ältere löschen';removeDayButton.title='Sitzplan-Zwischenstände entfernen; der letzte Sitzplan und alle Gruppeneinteilungen bleiben erhalten';deleteActions.append(removeDayButton);historyBox.append(deleteActions);
 function refreshDates(){
  const days=read()[context()]||{},dates=Object.keys(days).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&days[date].length).sort().reverse();
  savedSelect.replaceChildren();if(!savedSelect.title)savedSelect.title='Gespeicherte Sitzplan-Version wählen und anzeigen';const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=dates.length?'Version auswählen':'Noch keine Sitzpläne gespeichert';savedSelect.append(placeholder);
  for(const date of dates)for(const version of [...days[date]].reverse()){const option=document.createElement('option');option.value=JSON.stringify([date,version.id]);option.textContent=date.split('-').reverse().join('.')+(version.time?' · '+version.time:'')+' · '+(version.label||'Sitzplan');savedSelect.append(option)}
  const value=JSON.stringify([selectedDate||classroomDate.value,selectedId]);savedSelect.value=[...savedSelect.options].some(option=>option.value===value)?value:'';savedSelect.disabled=!dates.length;removeButton.disabled=!savedSelect.value;removeDayButton.disabled=!savedSelect.value;
 }
 savedSelect.addEventListener('change',()=>{if(!savedSelect.value)return;const [date,id]=JSON.parse(savedSelect.value);selectedId=id;selectedDate=date;rememberSelection(date,id);classroomDate.value=date;classroomDate.dispatchEvent(new Event('change',{bubbles:true}))});
 removeButton.addEventListener('click',()=>{
  if(!savedSelect.value)return;const [date,id]=JSON.parse(savedSelect.value),all=read();all[context()][date]=all[context()][date].filter(version=>version.id!==id);localStorage.setItem(key,JSON.stringify(all));selectedId=null;selectedDate=null;rememberSelection(null,null);lastLayout=layout();refreshDates();info.textContent='Version gelöscht. Die angezeigte Anordnung bleibt unverändert.';
 });
 removeDayButton.addEventListener('click',async ()=>{
  if(!savedSelect.value)return;const [date]=JSON.parse(savedSelect.value),label=date.split('-').reverse().join('.');
  if(!await classroomConfirm('Sitzplan-Zwischenstände vom '+label+' für diesen Raum entfernen? Der letzte gespeicherte Sitzplan und alle Gruppeneinteilungen bleiben erhalten.'))return;
  const all=read(),versions=all[context()]?.[date]||[],isGroup=v=>v.label==='Gruppeneinteilung'||v.groups?.some(row=>row.some(Number.isInteger)),lastSeat=versions.filter(v=>!isGroup(v)).at(-1);
  const kept=versions.filter(v=>isGroup(v)||v===lastSeat);
  if(all[context()])all[context()][date]=kept;
  localStorage.setItem(key,JSON.stringify(all));if(!kept.some(v=>v.id===selections[context()]?.id))rememberSelection(date,lastSeat?.id||kept.at(-1)?.id);lastLayout=layout();refreshDates();info.textContent='Tag bereinigt. Der letzte gespeicherte Sitzplan und alle Gruppeneinteilungen bleiben erhalten.';
 });
 const info=document.createElement('small');info.className='classroom-plan-history-status';info.setAttribute('role','status');historyBox.append(info);
 function archive(){
  if(!gridData?.length)return;const all=read();all[context()]??={};const versions=all[context()][classroomDate.value]??=[];
  const previous=versions.at(-1);if(previous&&JSON.stringify([previous.grid,previous.groups])===layout()){selectedId=previous.id;selectedDate=classroomDate.value;rememberSelection(selectedDate,selectedId);refreshDates();return}
  const version={createdAt:Date.now(),id:crypto.randomUUID?.()||String(Date.now()+Math.random()),time:new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}),label:gridGroupData.some(row=>row.some(Number.isInteger))?'Gruppeneinteilung':'Sitzplan',grid:structuredClone(gridData),groups:structuredClone(gridGroupData)};
  versions.push(version);selectedId=version.id;selectedDate=classroomDate.value;rememberSelection(selectedDate,selectedId);localStorage.setItem(key,JSON.stringify(all));info.textContent='Neue Sitzplan-Version gespeichert.';refreshDates();
 }

 function show(restore=false){
  loading=true;trackedClass=context();trackedDate=classroomDate.value;
  try{
   const remembered=restore?selections[context()]:null,days=read()[context()]||{},rememberedVersion=remembered&&days[remembered.date]?.find(v=>v.id===remembered.id),displayDate=rememberedVersion?remembered.date:trackedDate,versions=days[displayDate]||[],saved=rememberedVersion||versions.find(version=>version.id===selectedId)||versions.at(-1),p=prefix();if(saved){selectedId=saved.id;selectedDate=displayDate;rememberSelection(displayDate,saved.id)}else{selectedId=null;selectedDate=null;rememberSelection(null,null)}
   if(saved){gridData=normalisiereSitzRaster(saved.grid);gridGroupData=normalisiereGruppenRaster(saved.groups);info.textContent='Gespeicherter Sitzplan vom '+displayDate.split('-').reverse().join('.')+'.'}
   else if(trackedDate===today()){
    const current=localStorage.getItem(p+'grid');if(current)gridData=normalisiereSitzRaster(JSON.parse(current));gridGroupData=normalisiereGruppenRaster(JSON.parse(localStorage.getItem(p+'groupGrid')||'null'));if(!Object.prototype.hasOwnProperty.call(read()[context()]||{},trackedDate))archive();
   }else{
    const current=localStorage.getItem(p+'grid');if(current)gridData=normalisiereSitzRaster(JSON.parse(current));gridGroupData=normalisiereGruppenRaster(JSON.parse(localStorage.getItem(p+'groupGrid')||'null'));
    info.textContent='Kein Sitzplan für dieses Datum gespeichert. Angezeigt wird die aktuelle Anordnung.';
   }
   initGrid();lastLayout=layout();refreshDates();
  }finally{loading=false}
 }
 /* Bewusst eine äußere Hülle (kein Hook): Vorher-/Nachher-Werte gehören zu genau einem Speichervorgang. Sie liegt wie bisher ganz außen. */const save=datenSpeichern;datenSpeichern=function(){
  const p=prefix(),past=classroomDate.value<today(),previous=past?{grid:localStorage.getItem(p+'grid'),groups:localStorage.getItem(p+'groupGrid')}:null;
  save();
  if(previous){for(const [suffix,value] of [['grid',previous.grid],['groupGrid',previous.groups]])if(value===null)localStorage.removeItem(p+suffix);else localStorage.setItem(p+suffix,value)}
  if(!loading&&trackedClass===context()&&trackedDate===classroomDate.value&&lastLayout!==layout()){archive();lastLayout=layout()}
 };
 // Capture before attendance listeners save so an empty historical day is never invented.
 classroomDate.addEventListener('change',()=>{loading=true;show();loading=true;queueMicrotask(()=>loading=false)},true);
 classroomHooks.add('klasseWechseln','plan-history: Versionen laden',{before(){loading=true},after(){show(true)},always(){loading=false}});
 window.addEventListener('message',event=>{if(event.source===parent&&['classroom:linked-state','classroom:rosters'].includes(event.data?.type))setTimeout(()=>{if(trackedClass!==context())show(true)},0)});
 window.addEventListener('classroom:room-change',()=>{selectedId=null;lastLayout=null;show(true)});
 show(true);
 setInterval(()=>{if(!document.hidden&&!loading)refreshDates()},60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!loading)refreshDates()});
})();
;

/* ==== sitzplan/date-nav.js ==== */
/* Datum im Unterrichts-Manager (Mac/iPad, linke Spalte) – Vorschlag B (8.99):
   [ 06.11.2026  📅 ] [ ‹ | ◉ | › ]   (◉ = zurück zu heute; Stunde und Raum stehen im Tooltip des Feldes)
   ‹ / › springen zur vorigen bzw. nächsten Stunde, in der Unterricht stattgefunden hat (Einträge im Unterricht/Noten-Manager
   oder gespeicherter Sitzplan), › zuletzt zurück zu heute. Der eigene Kalender markiert gehaltene Stunden (hellblau gefüllt)
   und kommende Stunden laut Stundenplan (gestrichelt). Das versteckte <input type=date> bleibt die Quelle für alle anderen Module. */
(()=>{
 const input=window.classroomDateInput;const label=input?.closest('.classroom-date-only');if(!input||!label)return;
 const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
 const today=()=>iso(new Date()),parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
 const DAYS=['So','Mo','Di','Mi','Do','Fr','Sa'],MONTHS=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
 const fmt=s=>s?s.split('-').reverse().join('.'):'';
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};

 // Noten-Manager-Klassen (subject::classId) zur aktuellen Sitzplan-Klasse
 function refs(){
  const g=typeof classroomCurrentGroup==='function'?classroomCurrentGroup():null,sc=(typeof classroomLinkedModel!=='undefined'&&classroomLinkedModel?.sourceClasses)||read('classroom-manager-common-v2')?.sourceClasses||{};
  return g?Object.keys(sc).filter(k=>sc[k]===g.id):[];
 }
 function heldDates(){
  const out=new Set(),states=read('notenrechner-fachwahl-states-v1')||{};
  for(const ref of refs()){const [subject,cls]=ref.split('::');const cv=states[subject+'::class::'+cls]?.customValues||{};
   for(const page of Object.values(cv)){const list=[...(page?.tasks||[]),...(page?.assignments||[])];if(!list.length||!Array.isArray(page.students))continue;
    for(const t of list){if(!/^\d{4}-\d{2}-\d{2}$/.test(t?.date||'')||out.has(t.date))continue;
     if(page.students.some(s=>{const g=s.grades?.[t.id],st=s.statuses?.[t.id];return (g!==undefined&&g!==null&&g!=='')||!!st}))out.add(t.date)}}}
  const dated=read('sitzplan_dated_layouts_v1')||{};
  for(const [ctx,days] of Object.entries(dated))if(ctx===aktuelleKlasse||ctx.startsWith(aktuelleKlasse+'::'))for(const [d,versions] of Object.entries(days||{}))if(Array.isArray(versions)&&versions.some(v=>(v.grid||[]).flat().some(x=>x&&x!=='X'&&x!=='PULT')))out.add(d);
  return out;
 }
 function lessonsOn(date){// Stunden laut Stundenplan an diesem Tag (mit A-/B-Wochen und erkannten Stunden aus dem Hauptfenster)
  const r=new Set(refs()),w=parse(date).getDay();if(!r.size)return [];
  let tt=null;try{tt=parent.classroomTimetableFor?.(parse(date))}catch{}tt??=read('notenrechner-stundenplan-v1');
  return Object.entries(tt?.days?.[w]||{}).filter(([,e])=>e&&!e.ab&&r.has(e.ref)).map(([slot,e])=>({slot:Number(slot),room:e.room||''})).sort((a,b)=>a.slot-b.slot);
 }

 // ---------- Oberfläche ----------
 const st=document.createElement('style');st.textContent=`
 .classroom-date-only>input[type=date].cd-native{display:none!important}
 .classroom-date-only>.cd-row{display:flex;gap:8px;align-items:stretch;position:relative;align-self:stretch;width:100%}
 .cd-field{flex:1;min-width:0;height:42px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 12px;border:1px solid #d5deea;border-radius:12px;background:#fff;font:inherit;font-size:15px;color:#1f2a3d;cursor:pointer;text-align:left}
 .cd-field:focus-visible,.cd-field[aria-expanded=true]{outline:none;border-color:#2f6fd6;box-shadow:0 0 0 3px #d9e7fb}
 .cd-ic{width:16px;height:16px;flex:none;border:2px solid currentColor;border-radius:3px;position:relative;opacity:.8}.cd-ic:before{content:"";position:absolute;left:-2px;right:-2px;top:2px;border-top:2px solid currentColor}
 .cd-seg{display:flex;flex:none;border:1px solid #d5deea;border-radius:12px;overflow:hidden;background:#fff}
 .cd-seg button{width:40px;height:40px;border:0;background:#fff;color:#2f5f9b;font:inherit;font-size:20px;line-height:1;cursor:pointer;padding:0}
 .cd-seg button+button{border-left:1px solid #d5deea}.cd-seg button:disabled{color:#b8c3d2;cursor:default}.cd-seg button:not(:disabled):hover{background:#f2f6fc}
 .cd-seg .cd-today{width:36px;display:flex;align-items:center;justify-content:center}.cd-today i{width:14px;height:14px;border-radius:50%;border:2px solid currentColor;position:relative;box-sizing:border-box}.cd-today i:after{content:"";position:absolute;inset:2px;border-radius:50%;background:currentColor}
 .cd-pop{position:absolute;z-index:60;left:0;top:calc(100% + 6px);width:min(300px,calc(100vw - 24px));background:#fff;border:1px solid #dfe6ef;border-radius:14px;padding:12px;box-shadow:0 12px 28px rgba(30,50,80,.16)}
 .cd-pop[hidden]{display:none}
 .cd-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-weight:700;font-size:14px}
 .cd-head button{border:0;background:none;color:#2f5f9b;font-size:18px;width:30px;height:30px;border-radius:8px;cursor:pointer}.cd-head button:hover{background:#f2f6fc}
 .cd-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}
 .cd-dow{font-size:11px;color:#8090a6;padding:2px 0 4px}
 .cd-day{height:34px;display:flex;align-items:center;justify-content:center;border:0;background:none;padding:0;cursor:pointer;font:inherit;font-size:13px;color:#1f2a3d}
 .cd-day span{width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;box-sizing:border-box}
 .cd-day:hover span{background:#f2f6fc}
 .cd-day.held span{background:#d9e7fb;color:#1d4f9a;font-weight:700}
 .cd-day.plan span{border:1.5px dashed #b9cbe6}
 .cd-day.today span{box-shadow:inset 0 0 0 1.5px #f0a03a}
 .cd-day.sel span{background:#2f6fd6;color:#fff;font-weight:700}
 .cd-day.other{color:#b8c3d2}
 .cd-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11px;color:#5b6b82;margin-top:8px}.cd-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px}
 .cd-legend .l-held{background:#d9e7fb}.cd-legend .l-plan{border:1.5px dashed #b9cbe6;box-sizing:border-box}`;
 document.head.append(st);
 input.classList.add('cd-native');
 const row=document.createElement('div');row.className='cd-row';
 row.innerHTML='<button type="button" class="cd-field" aria-haspopup="dialog" aria-expanded="false" title="Datum wählen – markiert sind die Tage mit Unterricht"><span class="cd-text"></span><i class="cd-ic" aria-hidden="true"></i></button><div class="cd-seg" role="group" aria-label="Zwischen Unterrichtsstunden wechseln"><button type="button" class="cd-prev" title="Vorige Stunde mit Unterricht" aria-label="Vorige Stunde">‹</button><button type="button" class="cd-today" title="Zurück zu heute" aria-label="Heute"><i aria-hidden="true"></i></button><button type="button" class="cd-next" title="Nächste Stunde mit Unterricht (zuletzt heute)" aria-label="Nächste Stunde">›</button></div><div class="cd-pop" role="dialog" aria-label="Kalender" hidden></div>';
 input.after(row);
 const field=row.querySelector('.cd-field'),text=row.querySelector('.cd-text'),prev=row.querySelector('.cd-prev'),todayBtn=row.querySelector('.cd-today'),next=row.querySelector('.cd-next'),pop=row.querySelector('.cd-pop');
 let month=null,cache=null,target=pop,owner=row;
 const held=()=>cache||(cache=heldDates());
 function setDate(d){if(!d||d===input.value)return;input.value=d;input.dispatchEvent(new Event('change',{bubbles:true}))}
 function stops(){const s=new Set(held());s.add(today());return [...s].sort()}
 function render(){
  cache=null;const v=input.value||today(),d=parse(v);
  text.textContent=fmt(v);
  const list=stops();prev.disabled=!list.some(x=>x<v);next.disabled=!list.some(x=>x>v);
  todayBtn.disabled=v===today();
  const lessons=lessonsOn(v);field.title=DAYS[d.getDay()]+(lessons.length?' · '+(lessons[0].slot+1===lessons.at(-1).slot+1?(lessons[0].slot+1)+'. Stunde':(lessons[0].slot+1)+'.–'+(lessons.at(-1).slot+1)+'. Stunde')+(lessons[0].room?' · '+lessons[0].room:''):'')+' – Datum wählen';
  if(!target.hidden)drawMonth();
  for(const f of listeners)try{f()}catch{}
 }
 function drawMonth(){
  const v=input.value||today(),h=held(),t=today();month??=v.slice(0,7);
  const [y,m]=month.split('-').map(Number),first=new Date(y,m-1,1),lead=(first.getDay()+6)%7,start=new Date(y,m-1,1-lead);
  let html='<div class="cd-head"><button type="button" data-step="-1" aria-label="Voriger Monat">‹</button><span>'+MONTHS[m-1]+' '+y+'</span><button type="button" data-step="1" aria-label="Nächster Monat">›</button></div><div class="cd-grid">'+['Mo','Di','Mi','Do','Fr','Sa','So'].map(x=>'<div class="cd-dow">'+x+'</div>').join('');
  const weeks=Math.ceil((lead+new Date(y,m,0).getDate())/7);
  for(let i=0;i<weeks*7;i++){const day=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i),k=iso(day),c=['cd-day'];
   if(day.getMonth()!==m-1)c.push('other');if(h.has(k))c.push('held');else if(k>=t&&lessonsOn(k).length)c.push('plan');if(k===t)c.push('today');if(k===v)c.push('sel');
   html+='<button type="button" class="'+c.join(' ')+'" data-date="'+k+'" aria-label="'+DAYS[day.getDay()]+' '+fmt(k)+(h.has(k)?', Unterricht gehalten':'')+'"><span>'+day.getDate()+'</span></button>'}
  html+='</div><div class="cd-legend"><span><i class="l-held"></i>Unterricht gehalten</span><span><i class="l-plan"></i>laut Stundenplan</span></div>';
  target.innerHTML=html;
 }
 const listeners=[];
 function open(el=pop,own=row){if(target!==el&&!target.hidden)close();target=el;owner=own;month=(input.value||today()).slice(0,7);cache=null;drawMonth();el.hidden=false;if(el===pop)field.setAttribute('aria-expanded','true')}
 function close(){target.hidden=true;field.setAttribute('aria-expanded','false')}
 field.onclick=()=>pop.hidden?open():close();
 const bound=new WeakSet();function attach(el){if(bound.has(el))return;bound.add(el);el.addEventListener('click',e=>{e.stopPropagation();const step=e.target.closest('[data-step]');if(step){const [y,m]=month.split('-').map(Number),d=new Date(y,m-1+Number(step.dataset.step),1);month=iso(d).slice(0,7);drawMonth();return}
  const day=e.target.closest('[data-date]');if(day){setDate(day.dataset.date);close()}})}
 attach(pop);
 document.addEventListener('pointerdown',e=>{if(!target.hidden&&!owner.contains(e.target))close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!target.hidden){close();if(target===pop)field.focus()}});
 todayBtn.onclick=()=>setDate(today());
 prev.onclick=()=>{const v=input.value||today(),l=stops().filter(x=>x<v);if(l.length)setDate(l.at(-1))};
 next.onclick=()=>{const v=input.value||today(),l=stops().filter(x=>x>v);if(l.length)setDate(l[0])};
 // Anzeige bei jeder Änderung – auch wenn andere Module den Wert direkt setzen (z. B. „Aktuell“).
 const desc=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 Object.defineProperty(input,'value',{configurable:true,get(){return desc.get.call(this)},set(v){desc.set.call(this,v);queueMicrotask(render)}});
 input.addEventListener('change',render);
 document.getElementById('klassenSelect')?.addEventListener('change',()=>setTimeout(render,0));
 addEventListener('storage',()=>{cache=null;render()});addEventListener('focus',render);
 if(typeof classroomHooks!=='undefined')try{classroomHooks.add('ladeDaten','date-nav: Klasse gewechselt',{after(){setTimeout(render,0)}})}catch{}
 /* 9.03: Schnittstelle für die iPhone-Leiste über dem Sitzplan (gleiche Sprünge, gleicher Kalender) */
 window.classroomDateNav={prev:()=>prev.click(),next:()=>next.click(),today:()=>setDate(today()),
  state(){const v=input.value||today(),l=stops();return {value:v,prev:l.some(x=>x<v),next:l.some(x=>x>v),isToday:v===today()}},
  toggle(el,own){attach(el);if(!el.hidden&&target===el)close();else open(el,own)},onChange(f){listeners.push(f)}};
 render();setTimeout(render,1500);
})();
;

/* ==== sitzplan/roll-seats.js ==== */
// Rotate complete seating rows, including desks, while keeping anchors and the teacher's desk fixed.
(()=>{
 const coordinate=(r,c)=>String.fromCharCode(65+c)+(r+1);
 function fixedSeats(){return new Set(schuelerEinzel.map(s=>String(s.anker||'').trim().toUpperCase()).filter(Boolean))}
 function rows(){return gridData.map((row,r)=>row.some(value=>value&&value!=='PULT')?r:null).filter(r=>r!==null)}
 function groupMode(){return gridGroupData.some(row=>row.some(Number.isInteger))}
 // Vorn = Seite des Pults; ohne Pult gilt die obere Reihe (Zeile 1) als vorn.
 function frontIsLow(){const pult=[];gridData.forEach((row,r)=>row.forEach(v=>{if(v==='PULT')pult.push(r)}));if(!pult.length)return true;const occ=rows();if(!occ.length)return true;const mid=(Math.min(...occ)+Math.max(...occ))/2,p=pult.reduce((a,b)=>a+b,0)/pult.length;return p<=mid}
 function roll(forward=true){
  const occupiedRows=rows();if(groupMode()||occupiedRows.length<2)return;
  const fixed=fixedSeats(),previous=structuredClone(gridData),next=structuredClone(gridData);
  for(const r of occupiedRows)for(let c=0;c<COLS;c++)if(previous[r][c]!=='PULT'&&!fixed.has(coordinate(r,c)))next[r][c]='';
  for(let i=0;i<occupiedRows.length;i++){
   const shift=(forward===frontIsLow())?-1:1,sourceRow=occupiedRows[i],targetRow=occupiedRows[(i+occupiedRows.length+shift)%occupiedRows.length],waiting=[];
   for(let c=0;c<COLS;c++){const value=previous[sourceRow][c];if(!value||value==='PULT'||fixed.has(coordinate(sourceRow,c)))continue;
    if(!next[targetRow][c]&&!fixed.has(coordinate(targetRow,c)))next[targetRow][c]=value;else waiting.push({c,value});
   }
   // An anchored pupil keeps the seat; incoming pupils use the nearest free place in that same row.
   for(const {c,value} of waiting){const free=Array.from({length:COLS},(_,col)=>col).filter(col=>!next[targetRow][col]&&!fixed.has(coordinate(targetRow,col))).sort((a,b)=>Math.abs(a-c)-Math.abs(b-c)||a-b)[0];if(free===undefined){setzeBelegungsstatus('Rollen ist hier nicht möglich: In Reihe '+(targetRow+1)+' fehlen wegen der festen Ankerplätze freie Plätze.',false);return}next[targetRow][free]=value}
  }
  merkeSitzplanFuerUndo();gridData=next;if(typeof quickClose==='function')quickClose();zufallsAuswahl=null;initGrid();datenSpeichern();setzeBelegungsstatus('Alle Sitzreihen eine Reihe nach '+(forward?'vorn':'hinten')+' gerollt ('+((forward!==frontOnTopNow())?'nach unten':'nach oben')+'). Ankerplätze und Pult bleiben fest. „Rückgängig“ stellt den vorherigen Sitzplan wieder her.',true);
 }
 // Geteilter Button: links nach vorn (zur Tafel/zum Pult), rechts nach hinten. Die Pfeile zeigen auf dem Bildschirm in die passende Richtung.
 const split=document.createElement('div');split.className='classroom-roll-split';split.setAttribute('role','group');split.setAttribute('aria-label','Sitzreihen rollen');
 const button=document.createElement('button');button.type='button';button.id='classroomRollButton';button.className='btn btn-secondary';button.onclick=()=>roll(!frontOnTopNow());
 const back=document.createElement('button');back.type='button';back.id='classroomRollBackButton';back.className='btn btn-secondary';back.onclick=()=>roll(frontOnTopNow());
 const caption=document.createElement('span');caption.className='classroom-roll-caption';caption.textContent='Reihen rollen';caption.setAttribute('aria-hidden','true');split.append(button,back,caption);
 function rotated(){return document.getElementById('classroomRotateButton')?.getAttribute('aria-pressed')==='true'}
 function frontOnTopNow(){return frontIsLow()!==rotated()}
 // Links: nach unten rollen, rechts: nach oben – bezogen auf die Bildschirmdarstellung.
 /* 9.75: nur schreiben, was sich ändert – sonst stoßen sich die Beobachter gegenseitig endlos an */
 const put=(el,k,v)=>{if(k==='text'){if(el.textContent!==v)el.textContent=v}else if(k==='title'){if(el.title!==v)el.title=v}else if(el.getAttribute(k)!==v)el.setAttribute(k,v)};
 function labels(){const top=frontOnTopNow(),downIs=top?'hinten':'vorn',upIs=top?'vorn':'hinten';put(button,'text','↓');put(back,'text','↑');
  put(button,'title','Alle Sitzreihen samt Tischen eine Reihe nach unten verschieben (nach '+downIs+'); die unterste Reihe kommt nach oben. Ankerplätze und Pult bleiben fest.');put(button,'aria-label','Sitzreihen nach unten rollen');
  put(back,'title','Alle Sitzreihen samt Tischen eine Reihe nach oben verschieben (nach '+upIs+'); die oberste Reihe kommt nach unten. Ankerplätze und Pult bleiben fest.');put(back,'aria-label','Sitzreihen nach oben rollen')}
 function refresh(){const toolbar=document.querySelector('.classroom-plan-actions'),random0=toolbar?.querySelector('#randomStudentButton'),random=random0?.parentElement?.matches('.si-rsplit')?random0.parentElement:random0;if(split.parentElement!==toolbar||!split.isConnected){if(random)random.after(split);else toolbar?.prepend(split)}const gm=groupMode(),off=gm||rows().length<2;button.disabled=off;back.disabled=off;if(off)split.title=gm?'Rollen ist im Gruppenmodus nicht verfügbar – die Gruppen würden auseinandergerissen.':'Rollen braucht mindestens zwei besetzte Reihen.';else split.removeAttribute('title');labels()}
 new MutationObserver(()=>labels()).observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
 const style=document.createElement('style');style.textContent=
 /* Zwei gleich große Hälften; „Rollen“ steht mittig darüber. Links ↓ (nach unten), rechts ↑ (nach oben). */
 'body[data-module=sitzplan] .classroom-plan-actions>.classroom-roll-split{position:relative;display:inline-grid;grid-template-columns:1fr 1fr;flex:0 0 auto;min-width:11.5em}'
 +'.classroom-roll-split>.btn{margin:0!important;width:100%!important;min-width:0!important;flex:none}'
 +'.classroom-roll-split>#classroomRollButton{border-top-right-radius:0!important;border-bottom-right-radius:0!important;border-right:0!important;text-align:left!important;justify-content:flex-start!important;padding-left:14px!important;padding-right:4px!important}'
 +'.classroom-roll-split>#classroomRollBackButton{border-top-left-radius:0!important;border-bottom-left-radius:0!important;border-left:0!important;text-align:right!important;justify-content:flex-end!important;padding-right:14px!important;padding-left:4px!important}'
 +'.classroom-roll-split>.classroom-roll-caption{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;color:var(--accent,#315f99);font:inherit;font-size:1rem;font-weight:500}'
 +'.classroom-roll-split>.btn:disabled~.classroom-roll-caption{opacity:.55}';document.head.append(style);
 classroomHooks.add('initGrid','roll-seats: Rollen-Knöpfe',{after(){refresh()}});refresh();
})();
;

/* ==== button-help.js ==== */
// Native hover hints shared by the app and both managers, including dynamic buttons.
(()=>{
 const byId={
  editClassesQuick:'Klassennamen und das Notensystem (Noten oder Notenpunkte) bearbeiten.',
  classroomBackupButton:'Alle App-Daten als Backup sichern oder aus einem Backup wiederherstellen.',
  classroomExportBackup:'Ein vollständiges Backup der Klassen, Eintragungen und Sitzpläne speichern.',
  classroomImportBackup:'Ein gespeichertes Backup auswählen und die App-Daten wiederherstellen.',
  randomStudentButton:'Eine anwesende Person aus der aktuellen Klasse zufällig auswählen und im Sitzplan hervorheben.',
  studentSearchToggle:'Das Suchfeld öffnen, um eine Person im Sitzplan zu finden.',
  classroomStartButton:'Die Personen nach den eingestellten Regeln auf die vorhandenen Plätze verteilen.',
  classroomResetButton:'Die Bewertungen und Hausaufgabeneinträge des ausgewählten Datums zurücksetzen; Namen und Sitzplan bleiben erhalten.',
  applyLayoutButton:'Die ausgewählte Tischanordnung oder Gruppenvorlage auf den Sitzplan anwenden.',
  resetApp:'Alle App-Daten nach Bestätigung zurücksetzen.',
  tabNoten:'Den Noten-Manager öffnen.',tabSitzplan:'Den Unterrichts-Manager öffnen.'
 };
 function hint(button){
  const text=(button.textContent||'').replace(/\u00ad/g,'').replace(/\s+/g,' ').trim(),plain=text.replace(/^[＋+−–-]\s*/,''),remove=/^[−–-]/.test(text);
  if(byId[button.id])return byId[button.id];
  if(button.matches('[data-exam-topic-edit]'))return remove?'Das Klausurthema aus der Überschrift entfernen.':'Ein Klausurthema eingeben und neben „Ergebnisse“ anzeigen.';
  // Keep existing, detailed hints such as the active layout-picker return action.
  if(button.title&&!button.dataset.buttonHelp)return button.title;
  if(button.matches('[role=tab],.subject-tab,.page-tab'))return '„'+text+'“ öffnen.';
  if(button.matches('.classroom-rating-choice')){/* 10.82: Zeichen sind Grafiken – Text aus data-rating-symbol */const sym=(button.dataset.ratingSymbol||text||'').trim();return !sym||sym==='∅'?'Die mündliche Bewertung für diese Person und dieses Datum leeren.':'Die mündliche Mitarbeit mit „'+sym+'“ bewerten.'}
  if(button.matches('[data-zoom-minus]'))return 'Den Sitzplan verkleinern.';
  if(button.matches('[data-zoom-plus]'))return 'Den Sitzplan vergrößern.';
  if(button.matches('[data-zoom-fit]'))return 'Den Sitzplan an die verfügbare Breite anpassen.';
  if(button.matches('[data-zoom-reset]'))return 'Den Sitzplan in Originalgröße (100 %) anzeigen.';
  const exact={
   Drucken:'Druck- und Exportoptionen für diese Seite öffnen.',
   Backup:'App-Daten sichern oder ein Backup wiederherstellen.',
   Rückgängig:'Die letzte Änderung rückgängig machen.',
   'Eingaben löschen':'Die Eintragungen dieser Seite nach Bestätigung löschen.',
   Notenspiegel:'Die Verteilung der Ergebnisse dieser Seite anzeigen.',
   'Text kopieren':'Den angezeigten Text kopieren und das Fenster schließen.',
   'Version löschen':'Nur die ausgewählte gespeicherte Sitzplanversion löschen; die aktuelle Anordnung bleibt bestehen.',
   'Zwischenstände löschen':'Zwischenstände dieses Tages entfernen; der letzte Sitzplan und alle Gruppeneinteilungen bleiben erhalten.',
   'Vorlage speichern':'Die aktuelle Tischanordnung als eigene Vorlage speichern.',
   'Tischanordnung speichern':'Nur die Tische (ohne Namen) als eigene Anordnung speichern – sie erscheint dann unter den Tischanordnungen.',
   Schülerperspektive:'Den Sitzplan aus Sicht der Schülerinnen und Schüler anzeigen.',
   Lehrerperspektive:'Den Sitzplan aus Sicht der Lehrkraft anzeigen.',
   Vollbild:'Den Sitzplan im Vollbild anzeigen oder das Vollbild verlassen.',
   'Neue Zeile':'Eine weitere Eingabezeile in dieser Liste hinzufügen.',
   'Anker löschen':'Entfernt nur die festen Platzzuweisungen im aktuellen Raum. Namen, Bewertungen und Sitzordnung bleiben erhalten.',
   'Alle löschen':'Alle Einträge dieser Liste nach Bestätigung entfernen.',
   Abbrechen:'Dieses Fenster schließen, ohne die Änderungen zu übernehmen.',
   Schließen:'Dieses Fenster schließen.',
   Speichern:'Die Änderungen übernehmen und speichern.',
   OK:'Die Eingaben übernehmen und das Fenster schließen.',
   'Namen hinzufügen':'Die eingetragenen Namen zur aktuellen Klasse hinzufügen.',
   'Klasse hinzufügen':'Die Klasse mit den eingetragenen Namen und Einstellungen anlegen.',
   'Hausaufgabe fehlt':'Für diese Person am ausgewählten Datum eine fehlende Hausaufgabe eintragen oder den Eintrag zurücknehmen.',
   Start:'Die Sitzplätze nach den eingestellten Verteilungsregeln vergeben.'
  };
  if(exact[text])return exact[text];
  if(text==='+'||text==='＋')return 'Eine weitere Spalte hinzufügen.';
  if(/^[＋+]/.test(text))return ({'Schüler:in':'Eine Person zur aktuellen Klasse hinzufügen.',Geschlecht:'Das Geschlecht der Personen dieser Klasse manuell festlegen.',Import:'Namen, Bewertungen und Hausaufgaben aus einer Datei oder eingefügten Tabelle übernehmen.',Klasse:'Eine Klasse oder einen Kurs mit Namensliste und Notensystem anlegen.',Fach:'Ein weiteres Fach anlegen.',Halbjahr:'Ein weiteres Halbjahr anlegen.',Quartal:'Ein neues, leeres Quartal anlegen.',Klausur:'Eine weitere Klausur für das aktuelle Quartal anlegen.',Thema:'Ein Klausurthema eingeben.',Teilnoten:'Teilnoten für die Klausurergebnisse einblenden.'})[plain]||'„'+plain+'“ hinzufügen.';
  if(remove&&plain)return '„'+plain+'“ entfernen.';
  if(text==='−'||text==='–'||text==='-')return 'Diesen Eintrag entfernen.';
  if(text==='+'||text==='＋')return 'Eine weitere Spalte hinzufügen.';
  if(/importieren/i.test(text))return 'Eine Datei auswählen und deren Daten übernehmen.';
  if(/exportieren/i.test(text))return 'Die gewählten Daten als Datei speichern.';
  if(text==='Zurücksetzen')return 'Die zugehörigen Eingaben auf den Ausgangszustand zurücksetzen.';
  // Einträge mit „…“ öffnen erst ein Fenster – nicht „… ausführen“ anhängen.
  if(/…$/.test(text))return button.getAttribute('aria-label')||('„'+text.replace(/\s*…$/,'')+'“ – öffnet ein Fenster mit weiteren Angaben.');
  return button.getAttribute('aria-label')||('„'+text+'“ ausführen.');
 }
 function update(button){const value=hint(button);if(value&&button.title!==value){button.title=value;button.dataset.buttonHelp='true'}}
 function scan(root){if(!root||(root.nodeType!==1&&root!==document))return;if(root.matches?.('button,[role=button]'))update(root);root.querySelectorAll?.('button,[role=button]').forEach(update)}
 scan(document);
 let queue=new Set(),planned=false;new MutationObserver(records=>{for(const record of records){if(record.type==='characterData'){const b=record.target.parentElement?.closest?.('button,[role=button]');if(b)queue.add(b)}else{const b=record.target.closest?.('button,[role=button]');if(b)queue.add(b);for(const node of record.addedNodes)if(node.nodeType===1)queue.add(node)}}if(!planned&&queue.size){planned=true;requestAnimationFrame(()=>{planned=false;const q=queue;queue=new Set();for(const n of q)if(n.isConnected)scan(n)})}}).observe(document.body,{childList:true,subtree:true,characterData:true});
 document.addEventListener('pointerover',event=>{const button=event.target.closest('button,[role=button]');if(button)update(button)},true);
})();
;

/* ==== decimal-display.js ==== */
// Localize plain displayed decimal values without changing stored numbers or inputs.
(()=>{
 function scan(root){if(!root||root.nodeType!==1)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){/* 9.75: erst der schnelle Zahlentest, dann die teure Prüfung der Umgebung */const value=node.textContent;if(!/^\s*[+−-]?\d+\.\d+\s*(?:%|Punkte)?\s*$/.test(value))continue;if(node.parentElement.closest('script,style,textarea,input,[contenteditable=true],[data-app-version],[data-app-version-copy],[data-no-decimal]'))continue;node.textContent=value.replace(/(\d)\.(\d)/,'$1,$2')}}
 const observer=new MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='characterData')scan(r.target.parentElement);else for(const node of r.addedNodes)scan(node.nodeType===1?node:node.parentElement)}watch()});function watch(){observer.observe(document.body,{childList:true,subtree:true,characterData:true})}scan(document.body);watch();
})();
;

/* ==== hatching.js ==== */
// Shared display preference; assessment values remain unchanged.
(()=>{
 const key='classroom-manager-hatching-v1';let enabled=localStorage.getItem(key)!=='off',queued=false;
 const style=document.createElement('style');style.textContent='[data-hatching-toggle][hidden]{display:none!important}html.hatching-off .classroom-unstriped:not(.grade-four-fail){background-image:none!important;background-color:var(--unstriped-color)!important}';document.head.append(style);
 const SEL='td span,td input,td select,td button,.cell,.classroom-rating-choice,.qs-big,.qs-edit input,.qs-sq i,.qs-val i,.qs-q1chip i,.qs-chip i,.qd-val';
 /* auch von den iPhone-Karten direkt aufrufbar (8.15) */
 function unstripe(root){for(const el of root.querySelectorAll(SEL)){const fill=getComputedStyle(el).backgroundImage;if(!fill.includes('gradient')||el.classList.contains('grade-four-fail'))continue;/* 4 Notenpunkte bleiben immer schraffiert. */el.classList.remove('classroom-unstriped');const base=getComputedStyle(el).backgroundColor,color=base&&!/rgba\(0, 0, 0, 0\)|transparent/.test(base)?base:fill.match(/rgba?\([^)]+\)|#[\da-f]{3,8}/i)?.[0];/* Ohne Schraffur gilt die Grundfarbe der Note (z. B. 2+ grün-gelb wie 2). */if(color){if(el.style.getPropertyValue('--unstriped-color')!==color)el.style.setProperty('--unstriped-color',color);if(!el.classList.contains('classroom-unstriped'))el.classList.add('classroom-unstriped')}}}
 window.classroomUnstripe=root=>{if(!enabled)unstripe(root||document)};
 /* 9.51: „Aus“ (weißer Kasten) – alle Bewertungsfelder ohne Farbe, für die ganze App (alle Rahmen). Gilt auch für 4 Notenpunkte. */
 const CKEY='classroom-manager-colors-off-v1';let colorsOff=localStorage.getItem(CKEY)==='on';
 const colored=el=>{const cs=getComputedStyle(el);if(cs.backgroundImage.includes('gradient'))return true;const m=cs.backgroundColor.match(/[\d.]+/g);if(!m||m.length<3||(m.length>3&&Number(m[3])===0))return false;const [r,g,b]=m.map(Number);return Math.max(r,g,b)-Math.min(r,g,b)>=20};
 function decolor(root){for(const el of root.querySelectorAll(SEL)){if(el.classList.contains('classroom-colorless')||el.classList.contains('classroom-rating-choice'))continue;if(el.classList.contains('cell')&&!el.classList.contains('classroom-seat-assessed'))continue;if(colored(el))el.classList.add('classroom-colorless')}}
 window.classroomColorsOff={get:()=>colorsOff,set:v=>{v=!!v;try{localStorage.setItem(CKEY,v?'on':'off')}catch{}if(colorsOff!==v){colorsOff=v;apply()}}};
 style.textContent+='html.colors-off body .classroom-colorless:not(#_):not(#__){background:#fff!important;background-image:none!important;color:#243247!important;box-shadow:inset 0 0 0 1px #d5deea!important}html.colors-off body .room-grid .cell.classroom-seat-assessed.classroom-colorless:not(#_):not(#__){box-shadow:none!important}';
 const gradCache=new WeakMap();
 function apply(){
  observer.disconnect();try{
  if(!enabled)unstripe(document);
  document.documentElement.classList.toggle('hatching-off',!enabled);
  document.documentElement.classList.toggle('colors-off',colorsOff);if(colorsOff)decolor(document);
  // Schraffuren-Schalter: neben „Kompaktansicht“, auf Übersichtsseiten ohne Kompaktansicht vor „Drucken“.
  const anchors=[...document.querySelectorAll('.compact-view-toggle')];
  for(const print of document.querySelectorAll('.section-title .page-print-button')){const title=print.closest('.section-title');if(!title.querySelector('.compact-view-toggle')){/* 10.49: Drucken steht unten bei den Aktionen – Schalter bleiben oben in der Ansicht-Zeile */const row1=title.querySelector(':scope>.oral-display-actions');anchors.push(row1&&print.parentElement!==row1?{parentElement:row1,before:l=>row1.append(l)}:print)}}
  for(const compact of anchors){const parent=compact.parentElement;if(!parent.querySelector(':scope>[data-hatching-toggle]')){const label=document.createElement('label');label.className='toggle';label.dataset.hatchingToggle='';label.title='Schraffuren in Bewertungsfeldern ein- oder ausblenden.';const input=document.createElement('input');input.type='checkbox';input.setAttribute('role','switch');const caption=document.createElement('span');caption.textContent='Schraffuren';label.append(input,caption);input.onchange=()=>{enabled=input.checked;localStorage.setItem(key,enabled?'on':'off');apply()};compact.before(label)}}
  document.querySelectorAll('[data-hatching-toggle] input').forEach(input=>input.checked=enabled);
  // Alle Anzeige-Schalter einer Seite stehen in der oberen Zeile vor „Schraffuren“: 1. Quartal, Zeichen/Noten, Tendenzen.
  for(const title of document.querySelectorAll('.section-title')){const hatch=title.querySelector('[data-hatching-toggle]');if(!hatch)continue;
   const wanted=['.previous-quarter-toggle','.task-participation-display']/* 10.51: „Tendenzen“ (Eingabe-Einstellung) bleibt unten bei den Extras */.map(s=>title.querySelector(s)).filter(Boolean);
   /* Umschalter-Segmente (seg-toggle) sitzen direkt bei ihrem Schalter und zählen hier nicht mit – sonst schieben sich die Skripte gegenseitig endlos hin und her. */let ok=true,node=hatch;for(let i=wanted.length-1;i>=0;i--){node=node.previousElementSibling;while(node&&node.matches('.seg-toggle,.hatch-seg'))node=node.previousElementSibling;if(node!==wanted[i]){ok=false;break}}
   if(!ok)for(const el of wanted)hatch.before(el)}
  // Schalter auf Seiten mit Noten immer zeigen; ohne Schraffur-Werte ausgegraut (8.45).
  for(const label of document.querySelectorAll('[data-hatching-toggle]')){const scope=label.closest('[data-custom-panel]')||label.closest('section,.panel,.card')||label.parentElement?.parentElement;if(!scope)continue;
   let any=!!scope.querySelector('.classroom-unstriped,.grade-four-fail,[class*=participation-between-]');
   /* 11.07: Die teure Stil-Abfrage je Zelle nur, wenn sich der Bereich geändert hat (vorher bei jeder Änderung irgendwo auf der Seite) */
   if(!any){const sig=scope.getElementsByTagName('*').length+':'+scope.textContent.length+':'+(scope.className||''),c=gradCache.get(scope);if(c&&c.sig===sig)any=c.any;else{for(const el of scope.querySelectorAll('td span,td input,td select,td button,.cell,.classroom-rating-choice')){if(getComputedStyle(el).backgroundImage.includes('gradient')){any=true;break}}gradCache.set(scope,{sig,any})}}
   /* 8.45: Auf Seiten mit Noten bleibt der Schalter immer sichtbar (einheitliche Kopfzeile); ohne Schraffur-Werte ist er nur ausgegraut.
      Seiten ohne Noten (Hausaufgaben, Material) zeigen ihn nicht. */
   let hw=!!scope.querySelector('[data-homework-status]');try{const k=scope.dataset?.customPanel;if(k&&typeof customPagesFor==='function'&&typeof currentSubject!=='undefined'&&customPagesFor(currentSubject).some(pg=>pg.key===k&&pg.system==='homework'))hw=true}catch{}const gradePage=!hw;const hide=!gradePage;if(label.hidden!==hide)label.hidden=hide;
   const none=gradePage&&!any;if((label.dataset.hatchNone==='1')!==none){if(none)label.dataset.hatchNone='1';else delete label.dataset.hatchNone}}
  try{window.classroomHatchSegPlace?.()}catch(e){console.error(e)}
  for(const label of document.querySelectorAll('[data-hatching-toggle]')){const seg=label.previousElementSibling;if(!seg?.classList.contains('hatch-seg'))continue;const none=label.dataset.hatchNone==='1'&&!colorsOff;
   for(const b of seg.querySelectorAll('[data-hatch]:not([data-hatch="white"])')){if(b.disabled!==none){b.disabled=none;if(none){b.dataset.tipOrig=b.title;b.title='Erst möglich, wenn es Tendenzen oder eine 4 gibt'}else if(b.dataset.tipOrig!==undefined){b.title=b.dataset.tipOrig;delete b.dataset.tipOrig}}}}
  }catch(e){console.error(e)}finally{observer.observe(document.body,{childList:true,subtree:true})}
 }
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})});
 window.addEventListener('storage',e=>{if(e.key===key){enabled=e.newValue!=='off';apply()}});window.addEventListener('storage',e=>{if(e.key===CKEY){colorsOff=e.newValue==='on';apply();window.classroomHatchSync?.()}});apply();
})();
;

/* ==== sitzplan/student-finder.js ==== */
/* „Schüler finden“: Ein Klick verwandelt „Schüler“ im Button in ein Eingabefeld.
   8.39: Schon beim Tippen werden alle passenden Plätze im Sitzplan blau markiert (Vorname oder Nachname beginnt mit dem Text) –
   keine Vorschlagsliste mehr. Ein Treffer: der Plan scrollt dorthin, Enter öffnet das Bewertungsfenster. Das Feld wächst mit dem Text. */
(()=>{
 const button=document.getElementById('studentSearchToggle'),legacyInput=document.getElementById('studentSearchInput');
 if(!button)return;
 const wrap=document.createElement('div');wrap.className='student-finder';wrap.dataset.open='false';
 // Kein Kontakte-Vorschlag von Safari/iOS: Suchfeld statt Namensfeld, keine Begriffe wie „Name“ in Platzhalter, Bezeichnung oder name-Attribut.
 const input=document.createElement('input');input.type='search';input.name='sitzplan-suche';input.className='student-finder-input';input.autocomplete='off';input.spellcheck=false;
 for(const [k,v] of Object.entries({autocorrect:'off',autocapitalize:'off',enterkeyhint:'search','data-lpignore':'true','data-1p-ignore':'true','data-form-type':'other'}))input.setAttribute(k,v);
 input.placeholder='Suchen …';input.setAttribute('aria-label','Person im Sitzplan suchen');input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');
 const list=document.createElement('ul');list.className='student-finder-list';list.id='studentFinderList';list.setAttribute('role','listbox');list.hidden=true;input.setAttribute('aria-controls',list.id);
 const note=document.createElement('span');note.className='student-finder-note';note.textContent='Kein Treffer';note.hidden=true;note.setAttribute('aria-live','polite');
 const sizer=document.createElement('span');sizer.className='student-finder-sizer';sizer.setAttribute('aria-hidden','true');
 let open=false,active=-1,matches=[];

 function place(){
  // Der Unterrichts-Manager baut die Werkzeugleiste gelegentlich neu auf; der Button bleibt im Suchfeld-Verbund.
  if(button.parentElement!==wrap){button.before(wrap);wrap.append(input,note,button,list,sizer)}
  if(legacyInput){legacyInput.hidden=true;legacyInput.setAttribute('aria-hidden','true')}
 }
 function allNames(){
  const names=new Set();
  for(const row of (typeof gridData!=='undefined'?gridData:[]))for(const value of row||[])if(value&&value!=='X'&&value!=='PULT')names.add(String(value).trim());
  for(const s of (typeof schuelerEinzel!=='undefined'?schuelerEinzel:[]))if(s?.name)names.add(String(s.name).trim());
  for(const p of (typeof schuelerPaare!=='undefined'?schuelerPaare:[]))for(const n of [p?.s1,p?.s2])if(n)names.add(String(n).trim());
  return [...names].filter(Boolean).sort((a,b)=>a.localeCompare(b,'de',{sensitivity:'base'}));
 }
 const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
 // Vorschläge zeigen nur Vornamen; bei gleichen Vornamen hilft der Anfangsbuchstabe des Nachnamens.
 function firstName(full){const t=String(full).trim();if(t.includes(','))return t.split(',').slice(1).join(',').trim()||t;return t.split(/\s+/)[0]}
 function lastName(full){const t=String(full).trim();if(t.includes(','))return t.split(',')[0].trim();const parts=t.split(/\s+/);return parts.length>1?parts.at(-1):''}
 function entries(){
  const names=allNames(),firsts=names.map(firstName),count=new Map();for(const f of firsts)count.set(norm(f),(count.get(norm(f))||0)+1);
  return names.map((full,i)=>{const first=firsts[i],last=lastName(full);return {full,first,label:count.get(norm(first))>1&&last?first+' '+last[0]+'.':first}}).sort((a,b)=>a.label.localeCompare(b.label,'de',{sensitivity:'base'}));
 }
 function search(text){
  const q=norm(text.trim());if(!q)return [];
  const starts=[],words=[];
  for(const e of entries()){const n=norm(e.first);if(n.startsWith(q))starts.push(e);else if(n.split(/[\s\-]+/).some(w=>w.startsWith(q)))words.push(e)}
  return [...starts,...words].slice(0,8);
 }
 let chosen=null;
 function seatTerm(entry){
  // Hervorhebung über den vollständigen Namen; steht im Sitzplan nur der Vorname, wird danach gesucht.
  const seats=(typeof gridData!=='undefined'?gridData:[]).flat().filter(v=>v&&v!=='X'&&v!=='PULT').map(norm);
  return seats.some(v=>v.includes(norm(entry.full)))?entry.full:entry.first;
 }
 function grow(){const t=input.value||input.placeholder;if(sizer.textContent!==t)sizer.textContent=t;const fs=getComputedStyle(button).fontSize;if(input.style.getPropertyValue('font-size')!==fs)input.style.setProperty('font-size',fs);const w=Math.max(30,Math.ceil(sizer.getBoundingClientRect().width)+4)+'px';if(input.style.getPropertyValue('width')!==w)input.style.setProperty('width',w,'important')}
 function renderList(){
  list.replaceChildren();matches.forEach((entry,i)=>{const li=document.createElement('li');li.setAttribute('role','option');li.id='studentFinderOption'+i;li.textContent=entry.label;li.setAttribute('aria-selected',String(i===active));
   li.addEventListener('pointerdown',e=>{e.preventDefault();choose(entry)});list.append(li)});
  list.hidden=!matches.length;input.setAttribute('aria-expanded',String(!list.hidden));
  if(active>=0)input.setAttribute('aria-activedescendant','studentFinderOption'+active);else input.removeAttribute('aria-activedescendant');
 }
 function choose(entry){chosen=entry;input.value=entry.label;matches=[];active=-1;renderList();grow();sucheSchuelerImSitzplan(seatTerm(entry));input.focus()}
 function find(){
  const value=input.value.trim();if(!value){input.focus();return}
  let entry=chosen&&norm(chosen.label)===norm(value)?chosen:entries().find(e=>norm(e.label)===norm(value))||(matches.length?matches[Math.max(0,active)]:search(value)[0]);
  if(entry){chosen=entry;input.value=entry.label}
  matches=[];active=-1;renderList();grow();sucheSchuelerImSitzplan(entry?seatTerm(entry):value);springeZumSuchtreffer();
 }
 function setOpen(state){
  open=state;wrap.dataset.open=String(state);button.textContent=state?'finden':'Schüler finden';button.setAttribute('aria-expanded',String(state));
  button.title=state?'Bei genau einem Treffer: Bewertungsfenster öffnen.':'Das Suchfeld öffnen, um eine Person im Sitzplan zu finden.';button.dataset.buttonHelp='';
  if(state){const f=getComputedStyle(button).font;for(const el of [wrap,input,sizer])el.style.font=f;grow();input.focus();input.select()}else{input.value='';matches=[];active=-1;renderList();sucheSchuelerImSitzplan('');mark(false)}
 }
 window.classroomToggleStudentSearch=()=>{place();if(!open)setOpen(true);else if(!input.value.trim())input.focus();else openHit()};
 /* Markierung im Sitzplan */
 let hits=[];
 function cellName(cell){return cell.classList.contains('besetzt')&&typeof gridData!=='undefined'?gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)]:null}
 function matchesQuery(full,q){const f=norm(firstName(full)),l=norm(lastName(full));return f.startsWith(q)||f.split(/[\s\-]+/).some(w=>w.startsWith(q))||(l&&(l.startsWith(q)||l.split(/[\s\-]+/).some(w=>w.startsWith(q))))}
 let lastMark='';
 function mark(scroll){const q=norm(input.value.trim());const prevHits=hits;hits=[];
  for(const cell of document.querySelectorAll('#roomGrid .cell')){const n=cellName(cell),hit=!!(open&&q&&n&&n!=='X'&&n!=='PULT'&&matchesQuery(n,q));if(cell.hasAttribute('data-finder-hit')!==hit){if(hit)cell.setAttribute('data-finder-hit','');else cell.removeAttribute('data-finder-hit')}if(hit)hits.push(cell)}
  const key=q+'|'+hits.length+'|'+open;const nh=!(open&&q&&!hits.length);if(note.hidden!==nh)note.hidden=nh;if(key!==lastMark){lastMark=key;grow()}
  /* 10.30: nur den Plan selbst (senkrecht) scrollen – kein scrollIntoView, das in Safari auch die umgebenden Flächen waagerecht verschob */
  if(scroll&&hits.length===1){const sc=hits[0].closest('.classroom-plan-scroll');if(sc){const r=hits[0].getBoundingClientRect(),b=sc.getBoundingClientRect();if(r.top<b.top||r.bottom>b.bottom)sc.scrollTop+=r.top<b.top?r.top-b.top-8:r.bottom-b.bottom+8;if(r.left<b.left||r.right>b.right)sc.scrollLeft+=r.left<b.left?r.left-b.left-8:r.right-b.right+8}}}
 function openHit(){if(!hits.length)return;const cell=hits[0],name=cellName(cell);try{cell.scrollIntoView({block:'nearest',inline:'nearest'})}catch{}
  if(hits.length===1&&name&&typeof window.classroomOpenStudent==='function'&&!document.getElementById('classroomEditRoom')?.checked){setOpen(false);window.classroomOpenStudent(name)}}
 input.addEventListener('input',()=>{chosen=null;matches=[];active=-1;renderList();mark(true)});
 let markPlanned=false;new MutationObserver(()=>{if(!open||!input.value.trim()||markPlanned)return;markPlanned=true;requestAnimationFrame(()=>{markPlanned=false;mark(false)})}).observe(document.getElementById('roomGrid')||document.body,{childList:true});
 wrap.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target!==input){e.preventDefault();setOpen(false);button.focus()}});
 input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();openHit()}
  else if(e.key==='Escape'){e.preventDefault();setOpen(false);button.focus()}
 });
 // Esc oder ein Klick/Tipp irgendwo außerhalb beendet die Suche: Hervorhebung weg, Name aus dem Suchfeld entfernt.
 document.addEventListener('pointerdown',e=>{if(open&&!wrap.contains(e.target))setOpen(false)},true);
 document.addEventListener('keydown',e=>{if(open&&e.key==='Escape'&&!wrap.contains(e.target)){e.preventDefault();setOpen(false)}},true);
 /* 10.28: Direkt lostippen – ist der Sitzplan aktiv (angeklickt) und kein Eingabefeld/Fenster offen, startet ein Buchstabe die Suche */
 document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
  if(!/^[\p{L}]$/u.test(e.key))return;
  const t=e.target,tag=(t?.tagName||'').toLowerCase();
  if(t?.isContentEditable||tag==='input'||tag==='textarea'||tag==='select')return;
  if(document.querySelector('dialog[open]')||document.documentElement.classList.contains('classroom-beamer'))return;
  if(!button.isConnected||!button.getClientRects().length)return;
  e.preventDefault();place();if(!open)setOpen(true);input.focus();input.value=(open&&input.value&&document.activeElement===input?input.value:'')+e.key;chosen=null;matches=[];active=-1;renderList();mark(true);grow();
  try{input.setSelectionRange(input.value.length,input.value.length)}catch{}
 });
 place();classroomOnDomChange(place);
 const style=document.createElement('style');style.textContent=
 '.student-finder{position:relative;display:inline-flex!important;align-items:stretch;flex:0 0 auto!important;width:auto!important;min-width:0;max-width:100%;border-radius:10px;box-sizing:border-box}'
 +'body[data-module=sitzplan] .student-finder>#studentSearchToggle{min-height:38px;padding:7px 12px;font:inherit;font-size:1rem;font-weight:500;line-height:1.4;box-sizing:border-box}.student-finder>#studentSearchToggle{margin:0;flex:0 0 auto!important;width:auto!important;max-width:none!important;white-space:nowrap!important}'
 +'.student-finder .student-finder-input{display:none;flex:0 0 auto!important;min-width:30px!important;max-width:min(320px,60vw)!important;height:auto!important;box-sizing:content-box!important;border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;color:#253349;padding:0 0 0 14px!important;margin:0!important;align-self:center;border-radius:0!important}'
 +'.student-finder[data-open=true]{border:1px solid #ccd9e9;background:#fff;box-shadow:0 0 0 3px #315f9922}'
 +'.student-finder[data-open=true] .student-finder-input{display:block!important}'
 +'.student-finder[data-open=true]>#studentSearchToggle{border:0!important;box-shadow:none!important;background:transparent!important;padding-left:6px!important}'
 +'.student-finder .student-finder-input{-webkit-appearance:none;appearance:none}.student-finder .student-finder-input::-webkit-search-cancel-button,.student-finder .student-finder-input::-webkit-search-decoration{-webkit-appearance:none;display:none}'
 +'.student-finder-sizer{position:absolute;visibility:hidden;white-space:pre;font:inherit;pointer-events:none;left:0;top:0}'
 +'.student-finder-list{position:absolute;z-index:40;left:0;top:calc(100% + 6px);min-width:100%;max-height:260px;overflow:auto;margin:0;padding:5px;list-style:none;background:#fff;border:1px solid #ccd9e9;border-radius:12px;box-shadow:0 12px 26px #2533491f}'
 +'.student-finder-list li{padding:8px 12px;border-radius:8px;white-space:nowrap;cursor:pointer;color:#253349}'
 +'.student-finder-list li[aria-selected=true],.student-finder-list li:hover{background:#eaf0fa}.student-finder-list{display:none!important}'+'.student-finder-note{display:none;align-self:center;padding-left:8px;color:#8794a7;font-size:.85em;white-space:nowrap}.student-finder[data-open=true] .student-finder-note:not([hidden]){display:block}'+/* 10.29: Markierung nur innerhalb der Kachel (kein outline/äußerer Schatten) – Safari zählt den äußeren Rahmen zur Breite des Plans; das ließ den Plan beim Einpassen hin- und herspringen */'body .room-grid .cell[data-finder-hit]:not(#_){background:#eaf0fa!important;background-image:none!important;color:#2f5f9b!important;border-color:#2f5f9b!important;outline:0!important;box-shadow:inset 0 0 0 2px #2f5f9b!important;z-index:2}'/* 10.30: Randbreite unverändert – ein dickerer Rand machte die Kachel größer, der Plan wurde neu eingepasst, die Markierung neu gesetzt … (Flackern) */+'html.classroom-privacy .room-grid .cell[data-finder-hit]{color:transparent!important}';
 document.head.append(style);
})();
;

/* ==== sitzplan/sidebar-toggle.js ==== */
/* Linke Einstellungsleiste (Raum, Datum, gespeicherte Sitzpläne …) per Menü-Button ein- und ausblenden.
   Fly-out/Fly-in mit translateX; eingeklappt nimmt die Leiste keinen Platz ein und der Sitzplan nutzt die volle Breite.
   Auf iPhone und iPad hochkant ist die Leiste standardmäßig eingeklappt; auf dem iPad quer und dem aufgeklappten iPhone Duo im Querformat eingeblendet. Ersetzt den Vollbild-Button. */
(()=>{
 const container=document.querySelector('.container'),panel=container?.querySelector(':scope>.panel');if(!container||!panel)return;
 const key='classroom-manager-seat-sidebar-v1',duration=320;
 const ios=classroomDevice.ios;
 // Aufgeklapptes iPhone Duo (kurze Seite ca. 600–700 pt) im Querformat: Leiste und Sitzplan stehen nebeneinander,
 // deshalb ist die Leiste dort standardmäßig ausgeklappt. Im Hochformat stünde sie über dem Plan und bleibt eingeklappt.
 // Eigener gespeicherter Zustand für diese Lage. iPads (ab 744 pt) bleiben unverändert.
 const unfolded=()=>{const m=Math.min(screen.width,screen.height); // Gerätemaß – im iframe ist innerHeight durch die Kopfzeile kleiner
 return ios&&m>=560&&m<720&&matchMedia('(min-width:951px)').matches};
 // iPad im Querformat: Leiste standardmäßig eingeblendet (eigener gespeicherter Zustand für diese Lage).
 const landscape=()=>ios&&!unfolded()&&Math.min(screen.width,screen.height)>=720&&matchMedia('(orientation: landscape)').matches;
 const currentMode=()=>unfolded()?'unfolded':landscape()?'landscape':'normal';
 let mode=currentMode();
 const storeKey=()=>mode==='unfolded'?'classroom-manager-seat-sidebar-unfolded-v1':mode==='landscape'?'classroom-manager-seat-sidebar-landscape-v1':key;
 function initial(){let stored=null;try{stored=localStorage.getItem(storeKey())}catch{}return stored?stored==='open':mode==='unfolded'||mode==='landscape'||!ios}
 let open=initial(),timer=0;
 const button=document.createElement('button');button.type='button';button.className='classroom-sidebar-toggle';button.dataset.buttonHelp='';
 button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
 function label(){const text=open?'Einstellungen ausblenden':'Einstellungen einblenden';button.title=text;button.setAttribute('aria-label',text);button.setAttribute('aria-expanded',String(open))}
 function refit(){window.dispatchEvent(new Event('resize'));document.querySelector('[data-zoom-fit][aria-pressed="true"]')?.click()}
 function apply(animate){
  clearTimeout(timer);label();
  if(!animate){container.classList.toggle('sidebar-collapsed',!open);container.classList.toggle('sidebar-hidden',!open);refit();return}
  if(open){container.classList.remove('sidebar-hidden');void panel.offsetWidth;container.classList.remove('sidebar-collapsed');timer=setTimeout(refit,duration+20)}
  else{container.classList.add('sidebar-collapsed');timer=setTimeout(()=>{container.classList.add('sidebar-hidden');refit()},duration)}
 }
 button.onclick=()=>{open=!open;try{localStorage.setItem(storeKey(),open?'open':'closed')}catch{}apply(true)};
 // Auf- oder Zuklappen während der Nutzung: passenden Zustand übernehmen.
 addEventListener('resize',()=>{const next=currentMode();if(next===mode)return;mode=next;const want=initial();if(want!==open){open=want;apply(true)}else label()});
 function place(){
  const bar=document.querySelector('.classroom-plan-zoom');if(!bar)return;
  if(button.parentElement!==bar||bar.firstElementChild!==button)bar.prepend(button);
  // Vollbild entfällt – die eingeklappte Leiste schafft den Platz.
  for(const b of bar.querySelectorAll('button'))if(b.textContent.trim()==='Vollbild'&&!b.hidden){b.hidden=true;b.setAttribute('aria-hidden','true')}
 }
 const style=document.createElement('style');style.textContent=
  `body[data-module=sitzplan] .container{transition:grid-template-columns ${duration}ms ease,column-gap ${duration}ms ease;overflow-x:clip}`
  +`body[data-module=sitzplan] .container>.panel{transition:transform ${duration}ms ease,opacity ${duration}ms ease;will-change:transform;min-width:0}`
  +'body[data-module=sitzplan] .container.sidebar-collapsed{grid-template-columns:0px minmax(0,1fr)!important;column-gap:0!important}'
  +'body[data-module=sitzplan] .container.sidebar-collapsed>.panel{transform:translateX(calc(-100% - 40px));opacity:0;pointer-events:none}'
  +'body[data-module=sitzplan] .container.sidebar-hidden>.panel{display:none!important}'
  +'body[data-module=sitzplan] .container.sidebar-hidden{grid-template-columns:minmax(0,1fr)!important}'
  +'.classroom-sidebar-toggle{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:40px;height:40px;min-height:40px;padding:0;margin:0;border:1px solid #d7e2f1;border-radius:10px;background:#fff;color:#66778f;cursor:pointer}'
  +'.classroom-sidebar-toggle:hover{color:#253349;border-color:#aabbd3;background:#f6f8fc}.classroom-sidebar-toggle svg{width:20px;height:20px}'
  +'.classroom-sidebar-toggle[aria-expanded="false"]{color:#315f99;border-color:#aabbd3}'
  +'@media (prefers-reduced-motion:reduce){body[data-module=sitzplan] .container,body[data-module=sitzplan] .container>.panel{transition:none}}';
 document.head.append(style);
 place();apply(false);
 classroomOnDomChange(place);
})();

/* 8.89: Linke Spalte – zwei verbundene Symbol-Knöpfe ganz links: ☰ Einstellungen | ☑ Noten (ersetzt ☰ und „Noten“).
   Ein Tipp auf den aktiven Knopf klappt die Spalte zu, ein Tipp auf einen Knopf bei zugeklappter Spalte öffnet sie mit diesem Inhalt. */
(()=>{const zoom=document.querySelector('.classroom-plan-zoom'),tog=zoom?.querySelector('.classroom-sidebar-toggle');if(!zoom||!tog)return;
 const I={set:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  notes:'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>'};
 const seg=document.createElement('span');seg.className='plan-col-pair';seg.setAttribute('role','group');seg.setAttribute('aria-label','Linke Spalte');
 seg.innerHTML='<button type="button" data-col="set">'+I.set+'</button><button type="button" data-col="notes">'+I.notes+'</button>';
 zoom.prepend(seg);
 const qv=()=>{try{return parent.localStorage.getItem('classroom-quickview-v1')==='1'}catch{return false}},isOpen=()=>tog.getAttribute('aria-expanded')!=='false';
 const cur=()=>!isOpen()?'off':qv()?'notes':'set';
 function sync(){const c=cur();for(const b of seg.querySelectorAll('[data-col]:not([data-col=swap])')){const k=b.dataset.col,on=k===c;if(b.getAttribute('aria-pressed')!==String(on))b.setAttribute('aria-pressed',String(on));const t=on?(k==='set'?'Einstellungen ausblenden':'Noten ausblenden'):(k==='set'?'Einstellungen in der Spalte zeigen':'Noten der Klasse in der Spalte zeigen');if(b.title!==t)b.title=t;if(b.getAttribute('aria-label')!==t)b.setAttribute('aria-label',t)}
  {const sw=seg.querySelector('.plan-col-swap');if(sw){const off=c==='off';if(sw.disabled!==off)sw.disabled=off;if(off){sw.title='Erst die Spalte einblenden';sw.setAttribute('aria-label',sw.title)}else if(sw.title==='Erst die Spalte einblenden'){const r=document.documentElement.classList.contains('cm-side-right');sw.title=r?'Spalte auf die linke Seite':'Spalte auf die rechte Seite';sw.setAttribute('aria-label',sw.title)}}}}
 seg.addEventListener('click',e=>{const b=e.target.closest('[data-col]');if(!b)return;const k=b.dataset.col,active=cur()===k;
  /* 8.91: zweiter Klick auf ☑ Noten holt die Einstellungen zurück; zweiter Klick auf ☰ klappt die Spalte zu */
  /* 9.07: Klick auf den aktiven Knopf (☰ oder ☑) blendet die Spalte aus; der andere Knopf wechselt den Inhalt */
  if(active){if(isOpen())tog.click()}
  else{try{parent.localStorage.setItem('classroom-quickview-v1',k==='notes'?'1':'0')}catch{}if(!isOpen())tog.click()}
  try{parent.classroomQuickLayout?.()}catch{}setTimeout(()=>{try{parent.classroomQuickLayout?.()}catch{}sync()},380);sync()});
 new MutationObserver(sync).observe(tog,{attributes:true,attributeFilter:['aria-expanded']});/* 12.55: statt jede Sekunde nachzusehen auf Änderungen reagieren – Spalteninhalt (Hauptfenster), Seite links/rechts, Rückkehr in die App */addEventListener('storage',e=>{if(!e.key||e.key==='classroom-quickview-v1')sync()});new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});setTimeout(sync,0);sync();
 const st=document.createElement('style');st.textContent='.classroom-plan-zoom>.classroom-sidebar-toggle,.classroom-plan-zoom>.plan-quick-notes{display:none!important}.plan-col-pair{display:inline-flex;flex:none;border:1px solid #dce3ef;border-radius:12px;overflow:hidden;background:#fff}.plan-col-pair button{width:46px;height:42px;min-height:0;padding:0;margin:0;border:0!important;border-radius:0!important;background:#fff!important;color:#2f5f9b;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:none!important}.plan-col-pair button+button{border-left:1px solid #dce3ef!important}.plan-col-pair button[aria-pressed=true]{background:#eaf0fa!important}html.ph-lite .plan-col-pair,.classroom-beamer .plan-col-pair{display:none!important}';document.head.append(st)})();
/* 8.94: Abstand zwischen linker Spalte und Klassenraum = Abstand zur Navigationsleiste darüber (10 px) */
(()=>{const st=document.createElement('style');st.textContent='html:not(.ph-lite) body[data-module=sitzplan] .container:not(#_){column-gap:10px}';document.head.append(st)})();
/* 9.04: Spalte wahlweise rechts (z. B. am iPad für Rechtshänder): drittes Feld ⇄ im Schalter ☰ ☑ ⇄. Der Schalter wandert mit nach außen.
   Die Seite gilt nur für dieses Gerät (nicht im Backup). */
(()=>{const zoom=document.querySelector('.classroom-plan-zoom'),seg=zoom?.querySelector('.plan-col-pair');if(!zoom||!seg)return;const KEY='classroom-side-right-v1';
 const b=document.createElement('button');b.type='button';b.dataset.col='swap';b.className='plan-col-swap';b.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/></svg>';seg.append(b);
 const right=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
 function apply(){const r=right();document.documentElement.classList.toggle('cm-side-right',r);/* 9.06: Position nur per CSS (order) – kein Umhängen im DOM, sonst Endlosschleife mit „Mehr“ (Klicks gingen am Mac verloren) */
  seg.setAttribute('aria-label',r?'Rechte Spalte':'Linke Spalte');const t=r?'Spalte auf die linke Seite':'Spalte auf die rechte Seite';b.title=t;b.setAttribute('aria-label',t)}
 b.addEventListener('click',e=>{e.stopImmediatePropagation();try{localStorage.setItem(KEY,right()?'0':'1')}catch{}apply();setTimeout(()=>{window.dispatchEvent(new Event('resize'));try{parent.classroomQuickLayout?.()}catch{}},30);setTimeout(()=>{try{parent.classroomQuickLayout?.()}catch{}},400)},true);
 const st=document.createElement('style');st.textContent='@media (min-width:951px){html.cm-side-right body[data-module=sitzplan] .container:not(#_){grid-template-columns:minmax(0,1fr) 360px}'
  +'html.cm-side-right body[data-module=sitzplan] .container>.panel{grid-column:2;grid-row:1}html.cm-side-right body[data-module=sitzplan] .container>:not(.panel){grid-column:1;grid-row:1}'
  +'html.cm-side-right body[data-module=sitzplan] .container.sidebar-collapsed:not(#_){grid-template-columns:minmax(0,1fr) 0px!important}'
  +'html.cm-side-right body[data-module=sitzplan] .container.sidebar-collapsed>.panel:not(#_){transform:translateX(calc(100% + 40px))}'
  +'html.cm-side-right body[data-module=sitzplan] .container.sidebar-hidden:not(#_){grid-template-columns:minmax(0,1fr)!important}html.cm-side-right .classroom-plan-zoom>.plan-col-pair{order:99;margin-left:auto}}'
  +'@media (max-width:950px){.plan-col-pair>.plan-col-swap{display:none!important}}';document.head.append(st);
 apply();
})();
/* 9.06: Einheitliche Knöpfe im Unterrichts-Manager (Mac/iPad): Aktionsknöpfe und Knopfgruppen 40 px hoch mit 10 px Ecken;
   Pillen (ganz rund) bleiben den Umschaltern vorbehalten (z. B. „Bewertungen“). */
(()=>{const B='html:not(.ph-lite) body[data-module=sitzplan] ',st=document.createElement('style');st.textContent=
 B+':is(.classroom-plan-zoom>button,.zoom-more-toggle,.plan-actions-more-toggle,.classroom-plan-actions>button,.classroom-plan-actions>.plan-actions-right>.btn,.room-head-layout,#classroomRoomSelect,.class-selector-box button:not(.cd-seg>button):not(.cd-pop button):not(.cd-field)):not(#_){border-radius:10px!important}'
 +B+'.plan-col-pair:not(#_){border-radius:10px}'+B+'.plan-col-pair button:not(#_){height:38px!important;min-height:0!important}'
 +B+'.classroom-date-only .cd-field:not(#_){height:40px;border-radius:10px}'+B+'.classroom-date-only .cd-seg:not(#_){border-radius:10px}'+B+'.classroom-date-only .cd-seg button:not(#_){height:38px}';
 document.head.append(st)})();
/* 9.07: ⇄ ausgegraut, solange die Spalte ausgeblendet ist */
(()=>{const st=document.createElement('style');st.textContent='.plan-col-pair>.plan-col-swap:disabled{color:#b8c3d2!important;cursor:default}';document.head.append(st)})();
/* 9.08: Spalte rechts – ⇄ sitzt auf der Seite des Klassenraums (⇄ ☰ ☑), ☰ und ☑ behalten ihre Reihenfolge */
(()=>{const st=document.createElement('style');st.textContent='html.cm-side-right .plan-col-pair>.plan-col-swap:not(#_){order:-1;border-left:0!important;border-right:1px solid #dce3ef!important}';document.head.append(st)})();
;

/* ==== sitzplan/beamer-mode.js ==== */
/* Klassenansicht (früher „Präsentieren“/„Beamer-Modus“): Ein Klick verbirgt alles Sensible, damit beim Projizieren des Sitzplans nichts aufblitzt –
   Bewertungsfarben, Hausaufgabenhinweise, Schnelleingabe (Klick auf Sitzplätze), Einstellungsleiste,
   Bewertungs-/Sitzplanmodus sowie in der Kopfzeile den Noten-Manager, Rückgängig, Backup und das Auswahlmenü.
   Bleibt beim Neuladen im selben Tab aktiv. */
(()=>{
 const key='classroom-manager-beamer-v1';
 /* 11.27: Knopf „Klassenansicht“ entfernt (wird nicht gebraucht) – Modus bleibt aus */let on=false;try{sessionStorage.removeItem(key)}catch{}
 const button=document.createElement('button');button.type='button';button.className='classroom-beamer-button';button.dataset.buttonHelp='';
 function apply(){
  document.documentElement.classList.toggle('classroom-beamer',on);
  button.textContent=on?'Klassenansicht beenden':'Klassenansicht';button.setAttribute('aria-pressed',String(on));
  button.title=on?'Klassenansicht beenden und alle Bereiche wieder einblenden.':'Sitzplan fürs Smartboard/AirPlay: ohne Bedienelemente und ohne Bewertungen.';
  try{on?sessionStorage.setItem(key,'on'):sessionStorage.removeItem(key)}catch{}
  try{parent.postMessage({type:'classroom:beamer',on},'*')}catch{}
  if(on){const edit=document.getElementById('classroomEditRoom');if(edit?.checked)edit.click();document.activeElement?.blur?.()}
  setTimeout(()=>window.dispatchEvent(new Event('resize')),60);
 }
 button.onclick=()=>{on=!on;apply()};
 const hideLabels=['Schüler zuweisen','Vorlage speichern','Tischanordnung speichern','Einträge des Tages löschen …','Drucken','Start','Verteilen','Zurücksetzen','Zurücksetzen …','Zuweisen abbrechen'];
 function place(){button.remove();
  // Bearbeitende Aktionen unter dem Plan ausblenden; Zufallsauswahl, Rollen, Perspektive und Schüler finden bleiben.
  for(const b of document.querySelectorAll('.classroom-plan-actions button'))if(hideLabels.includes(b.textContent.trim())&&!b.dataset.beamerHide)b.dataset.beamerHide='1'}
 // Klicks und Ziehen auf Sitzplätze sind in der Klassenansicht gesperrt (keine Bewertungsfenster).
 for(const type of ['pointerdown','mousedown','click','dblclick','contextmenu','touchstart','dragstart'])
  document.addEventListener(type,e=>{if(on&&e.target.closest?.('#roomGrid .cell, #roomGrid .classroom-seat, .classroom-quick')){e.preventDefault();e.stopImmediatePropagation()}},true);
 window.addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='classroom:beamer-exit'&&on){on=false;apply()}});
 const style=document.createElement('style');style.textContent=
  '.classroom-beamer .classroom-beamer-button{background:var(--primary,#2f5f9b)!important;border-color:var(--primary,#2f5f9b)!important;color:#fff!important}'
  +'.classroom-beamer .room-grid .classroom-seat-assessed{background:#fff!important;background-image:none!important;color:#24334b!important}'
  +'.classroom-beamer .room-grid .classroom-seat-homework-missing::after{display:none!important}'
  +'.classroom-beamer body[data-module=sitzplan] .container>.panel,.classroom-beamer .classroom-sidebar-toggle,.classroom-beamer .classroom-quick,.classroom-beamer label:has(#classroomEditRoom),.classroom-beamer .room-header+.info-text,.classroom-beamer [data-beamer-hide],.classroom-beamer .classroom-plan-zoom>button:not(.classroom-beamer-button):not([data-zoom-minus]):not([data-zoom-plus]):not([data-zoom-fit]){display:none!important}'
  +'.classroom-beamer body[data-module=sitzplan] .container{grid-template-columns:minmax(0,1fr)!important}'
  +'.classroom-beamer #roomGrid .cell{cursor:default!important}.classroom-beamer .classroom-absent{opacity:1!important;filter:none!important;text-decoration:none!important}';
 document.head.append(style);
 place();apply();classroomOnDomChange(place);
})();
;

/* ==== sitzplan/random-groups.js ==== */
/* Zufallsgruppen: teilt die Klasse in Gruppen ein, ohne die Sitzordnung zu verändern.
   Einstellbar: Anzahl Gruppen oder Gruppengröße, Abwesende (Datum der Seitenleiste) auslassen, Tabu-Paare trennen, gemischt m/w.
   „Neu mischen“, „Groß zeigen“ (für Beamer/AirPlay), „Drucken“. Der Button steht neben „Zufallsauswahl“ (Anordnung: plan-actions.js). */
(()=>{
 const key='classroom-random-groups-v1',colors=['#3b82c4','#e08a1e','#3f9b6b','#9b59b6','#d9534f','#2aa1a8','#c2569b','#6d7f2f','#5b6bd6','#a8642a'];
 let opt={mode:'count',count:4,size:4,absent:true,tabu:true,mix:false,perf:'off',col:'',last:true,kind:'groups',lart:'ring',lsex:'off',lperf:'off',nb:true};try{Object.assign(opt,JSON.parse(localStorage.getItem(key)||'{}'))}catch{}
 /* 12.13: Geschlecht als Dreierschalter (zufällig | gemischt | getrennt), Nachnamen ein-/ausblendbar */
 if(!opt.sex)opt.sex=opt.mix?'mix':'off';
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(opt))}catch{}};
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const display=n=>{const m=/^\s*([^,]+),\s*(.+)$/.exec(n||'');return m?m[2].trim()+' '+m[1].trim():String(n||'').trim()};
 const button=document.createElement('button');button.type='button';button.id='randomGroupsButton';button.className='btn btn-secondary';button.textContent='Gruppen bilden';
 button.title='Die anwesenden Schüler:innen zufällig in Gruppen einteilen – die Sitzordnung bleibt unverändert.';
 window.classroomRandomGroupsButton=button;
 const dlg=document.createElement('dialog');dlg.className='rg-dialog';dlg.setAttribute('aria-label','Gruppen bilden');
 dlg.innerHTML='<div class="rg-head"><div><h2></h2><p class="rg-sub"></p></div><span class="rg-seg rg-kind" role="group"><button type="button" data-kind="groups">Gruppen</button><button type="button" data-kind="lots">Lospartner</button></span><span class="rg-hb"><button type="button" class="rg-small" data-rg-small>Normale Ansicht</button><button type="button" class="rg-x" data-rg-close aria-label="Schließen">×</button></span></div>'
  +'<div class="rg-opts"><span>Einteilen nach</span><span class="rg-seg" role="group"><button type="button" data-mode="count">Anzahl Gruppen</button><button type="button" data-mode="size">Gruppengröße</button></span>'
  +'<span class="rg-num"><button type="button" data-step="-1" aria-label="weniger">−</button><output></output><button type="button" data-step="1" aria-label="mehr">+</button></span>'
  
  +'<span class="rg-perf"><span>Geschlecht</span><span class="rg-seg" role="group"><button type="button" data-sex="off">zufällig</button><button type="button" data-sex="mix">gemischt</button><button type="button" data-sex="sep">getrennt</button></span></span>'
  +'<span class="rg-br"></span><span class="rg-perf"><span>Leistung</span><span class="rg-seg" role="group"><button type="button" data-perf="off">zufällig</button><button type="button" data-perf="mix" title="leistungsgemischt">gemischt</button><button type="button" data-perf="same" title="leistungsgleich">gleich</button></span><select data-col aria-label="Notenspalte"></select></span>'
  +'<label><input type="checkbox" data-opt="absent"> Abwesende auslassen</label><label title="Tabu-Paare trennen"><input type="checkbox" data-opt="tabu"> Tabu trennen</label>'+'</div>'
  +'<div class="rg-lopts"><span>Art</span><span class="rg-seg" role="group"><button type="button" data-lart="ring" title="Jede:r zieht eine:n andere:n – wie beim Wichteln">reihum</button><button type="button" data-lart="pair" title="Feste Paare, bei ungerader Zahl ein Dreierteam">gegenseitig</button></span>'
  +'<span class="rg-perf"><span>Geschlecht</span><span class="rg-seg" role="group"><button type="button" data-lsex="off">zufällig</button><button type="button" data-lsex="mix">gemischt</button><button type="button" data-lsex="same">gleich</button></span></span>'
  +'<span class="rg-br"></span><span class="rg-perf"><span>Leistung</span><span class="rg-seg" role="group"><button type="button" data-lperf="off">zufällig</button><button type="button" data-lperf="mix" title="stärkere und schwächere zusammen">gemischt</button><button type="button" data-lperf="same" title="ähnliche Noten zusammen">gleich</button></span><select data-col data-lcol aria-label="Notenspalte"></select></span>'
  +'<label><input type="checkbox" data-opt="absent"> Abwesende auslassen</label><label><input type="checkbox" data-opt="tabu"> Tabu beachten</label><label><input type="checkbox" data-opt="nb"> nicht der Sitznachbar</label></div>'
  +'<p class="rg-note" role="status"></p><p class="rg-gn"></p><div class="rg-grid"></div><div class="rg-lcover"><span>Lospartner sind verdeckt – sicher auch beim Spiegeln aufs Smartboard.</span><button type="button" data-rg-reveal>Liste aufdecken</button></div><div class="rg-lots"></div><div class="rg-desk" hidden></div>'
  +'<div class="rg-actions"><label class="rg-ln"><input type="checkbox" data-opt="last"> Nachnamen</label><button type="button" data-rg-print>Drucken</button><button type="button" data-rg-big>Groß zeigen</button><button type="button" data-rg-shuffle>Neu mischen</button><button type="button" class="rg-primary" data-rg-close>Schließen</button></div>';
 document.body.append(dlg);
 const grid=dlg.querySelector('.rg-grid'),out=dlg.querySelector('output'),note=dlg.querySelector('.rg-note');
 let groups=[];
 function people(){
  const list=(typeof schuelerEinzel!=='undefined'?schuelerEinzel:[]).filter(s=>String(s.name||'').trim());
  return list.map(s=>({name:s.name.trim(),gender:String(s.geschlecht||'').toLowerCase(),absent:!!s.abwesend}));
 }
 /* 11.68: leistungsbezogen – Noten aus dem Noten-Manager (aktuelles Halbjahr, gewählte Spalte) */
 let GC={half:'',cols:[]};
 const norm=n=>String(n||'').trim().toLowerCase().replace(/\s+/g,' ');
 function gradeCols(){GC={half:'',cols:[]};try{const nw=parent.document.getElementById('view-noten')?.contentWindow;if(!nw?.classroomGradeColumns)return;
  const g=typeof classroomCurrentGroup==='function'&&classroomCurrentGroup(),src=(typeof classroomLinkedModel!=='undefined'&&classroomLinkedModel?.sourceClasses)||{},refs=g?Object.keys(src).filter(k=>src[k]===g.id):[];
  const sel=nw.classroomCurrentSelection?.()||{},cur=sel.subject+'::'+sel.classId,key=refs.includes(cur)?cur:refs[0]||cur,[su,ci]=key.split('::');if(su&&ci)GC=nw.classroomGradeColumns(su,ci)||GC}catch(e){console.warn(e)}
  const sels=[...dlg.querySelectorAll('[data-col]')];if(!GC.cols.some(c=>c.id===opt.col)){const q=[...GC.cols].reverse().find(c=>/^Quartalsnote|^Klassenarbeit|^Halbjahresnote/.test(c.label))||GC.cols.at(-1);opt.col=q?q.id:''}
  for(const sel of sels){sel.innerHTML=GC.cols.length?GC.cols.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===opt.col?' selected':'')+'>'+esc(c.label)+'</option>').join(''):'<option value="">keine Noten gefunden</option>';sel.disabled=!GC.cols.length}}
 function gradeOf(name){const c=GC.cols.find(x=>x.id===opt.col);if(!c)return null;const V=c.vals||(c.vals=Object.fromEntries(Object.entries(c.values).flatMap(([n,v])=>[[norm(n),v],[norm(display(n)),v]])));const v=V[norm(name)]??V[norm(display(name))];return typeof v==='number'?v:null}
 const fmt=v=>v==null?'':(Math.round(v*10)/10).toLocaleString('de-DE');
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 /* Zielwert: Tabu-Konflikte zählen am meisten, dann Abstand der Gruppenschnitte zum Klassenschnitt, dann m/w-Ausgleich (bei „gemischt“) */
 function mixScore(g,conflicts){const v=g.flat().map(p=>p.g).filter(x=>x!=null),M=v.length?v.reduce((a,b)=>a+b,0)/v.length:0;let d=0;
  for(const x of g){const q=x.map(p=>p.g).filter(y=>y!=null);if(q.length)d+=(q.reduce((a,b)=>a+b,0)/q.length-M)**2*q.length}
  let sx=0;if(opt.sex==='mix'){for(const x of g){const w=x.filter(p=>p.gender==='w').length,m=x.filter(p=>p.gender==='m').length;sx+=Math.max(0,Math.abs(w-m)-1)}}
  return conflicts(g)*1000+d+sx*0.6}
 function mixImprove(g,conflicts){let cur=mixScore(g,conflicts);const k=g.length;if(k<2)return cur;
  for(let it=0;it<3000;it++){const a=Math.floor(Math.random()*k);let b=Math.floor(Math.random()*(k-1));if(b>=a)b++;const A=g[a],B=g[b];if(!A.length||!B.length)continue;
   const i=Math.floor(Math.random()*A.length),j=Math.floor(Math.random()*B.length);[A[i],B[j]]=[B[j],A[i]];const nx=mixScore(g,conflicts);if(nx<=cur+1e-9)cur=nx;else[A[i],B[j]]=[B[j],A[i]]}
  return cur}
 function build(){
  const all=people(),present=opt.absent?all.filter(p=>!p.absent):all,n=present.length,perf=opt.perf!=='off'&&GC.cols.length?opt.perf:'';
  for(const p of all)p.g=perf?gradeOf(p.name):null;
  let count=opt.mode==='count'?opt.count:Math.ceil(n/Math.max(1,opt.size));count=Math.max(1,Math.min(count,Math.max(1,n)));
  const tabu=(typeof tabuPaare!=='undefined'?tabuPaare:[]).map(t=>[String(t.s1||'').trim(),String(t.s2||'').trim()]).filter(t=>t[0]&&t[1]);
  const conflicts=g=>opt.tabu?g.reduce((c,members)=>c+tabu.filter(([a,b])=>members.some(m=>m.name===a)&&members.some(m=>m.name===b)).length,0):0;
  let best=null,bestScore=Infinity;
  for(let attempt=0;attempt<400&&bestScore>0;attempt++){
   let order;
   if(perf){/* graded: sort by grade (small random noise for ties); ungraded students are spread randomly */
    const gr=shuffle(present.filter(p=>p.g!=null)).map(p=>[p.g+Math.random()*0.3,p]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]),un=shuffle(present.filter(p=>p.g==null));
    if(perf==='mix')order=gr;else{const g=Array.from({length:count},()=>[]),m=gr.length;let k=0;for(let i=0;i<count;i++){const c=Math.floor(m/count)+(i<m%count?1:0);g[i].push(...gr.slice(k,k+c));k+=c}
     for(const p of un){const min=Math.min(...g.map(x=>x.length)),c=g.filter(x=>x.length===min);c[Math.floor(Math.random()*c.length)].push(p)}
     const score=conflicts(g);if(score<bestScore){best=g;bestScore=score}continue}
    if(un.length){const ins=[...order];for(const p of un)ins.splice(Math.floor(Math.random()*(ins.length+1)),0,p);order=ins}
   }
   else if(opt.sex==='sep'){/* getrennt: Gruppen nur aus Mädchen bzw. nur aus Jungen; Anzahl der Gruppen anteilig */
    const W=shuffle(present.filter(p=>p.gender==='w')),M=shuffle(present.filter(p=>p.gender==='m')),O=shuffle(present.filter(p=>p.gender!=='m'&&p.gender!=='w'));
    let gw=W.length&&M.length?Math.max(1,Math.min(count-1,Math.round(count*W.length/(W.length+M.length)))):(W.length?count:0);if(count<2&&W.length&&M.length)gw=count;
    const g=Array.from({length:count},()=>[]),deal=(L,a,b)=>{L.forEach((p,i)=>g[a+i%Math.max(1,b-a)].push(p))};if(gw>=count||!M.length)deal([...W,...M],0,count);else{deal(W,0,gw);deal(M,gw,count)}
    for(const p of O){const min=Math.min(...g.map(x=>x.length)),c=g.filter(x=>x.length===min);c[Math.floor(Math.random()*c.length)].push(p)}
    const score=conflicts(g);if(score<bestScore){best=g;bestScore=score}continue}
   else if(opt.sex==='mix'){const m=shuffle(present.filter(p=>p.gender==='m')),w=shuffle(present.filter(p=>p.gender==='w')),o=shuffle(present.filter(p=>p.gender!=='m'&&p.gender!=='w'));order=[];while(m.length||w.length){if(w.length)order.push(w.shift());if(m.length)order.push(m.shift())}order.push(...o)}
   else order=shuffle([...present]);
   const g=Array.from({length:count},()=>[]);order.forEach((p,i)=>{const round=Math.floor(i/count),pos=i%count;g[round%2?count-1-pos:pos].push(p)});
   /* 12.67: Leistung gemischt – Schnitte der Gruppen durch Tauschen angleichen (auch Geschlecht und Tabu beachten); jedes „Neu mischen“ startet zufällig neu */
   if(perf==='mix'){const sc=mixImprove(g,conflicts);if(sc<bestScore){best=g;bestScore=sc}if(attempt>=11)break;continue}
   const score=conflicts(g);if(score<bestScore){best=g;bestScore=score}
  }
  if(perf==='mix')bestScore=conflicts(best||[]);
  groups=(best||[]).map(g=>g.sort((a,b)=>display(a.name).localeCompare(display(b.name),'de')));
  const missing=all.filter(p=>opt.absent&&p.absent).length;
  dlg.querySelector('.rg-sub').textContent=`${n} ${opt.absent?'anwesend':'Schüler:innen'}${missing?` · ${missing} abwesend (nicht eingeteilt)`:''}`;
  note.textContent=bestScore>0&&bestScore<Infinity?`Hinweis: ${bestScore} Tabu-Paar${bestScore===1?'':'e'} ließ${bestScore===1?'':'en'} sich nicht trennen.`:'';
  render();
 }
 function render(){
  out.textContent=String(opt.mode==='count'?opt.count:opt.size);
  for(const b of dlg.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===opt.mode));
  for(const c of dlg.querySelectorAll('[data-opt]'))c.checked=!!opt[c.dataset.opt];
  for(const b of dlg.querySelectorAll('[data-perf]'))b.setAttribute('aria-pressed',String(b.dataset.perf===opt.perf));dlg.querySelector('[data-col]:not([data-lcol])').hidden=opt.perf==='off';
  for(const b of dlg.querySelectorAll('[data-sex]'))b.setAttribute('aria-pressed',String(b.dataset.sex===opt.sex));
  const allP=people(),unk=allP.filter(p=>p.gender!=='m'&&p.gender!=='w').length;dlg.querySelector('.rg-gn').textContent=opt.sex!=='off'&&unk?'Bei '+unk+' Schüler:innen fehlt das Geschlecht (Klasse bearbeiten).':'';
  const first=n=>display(n).split(/\s+/)[0]||display(n),lastOf=n=>{const d=display(n).split(/\s+/);return d.length>1?d[d.length-1]:''},fc={};for(const p of allP){const f=first(p.name);fc[f]=(fc[f]||0)+1}
  const nm=n=>opt.last?display(n):(fc[first(n)]>1&&lastOf(n)?first(n)+' '+lastOf(n)[0]+'.':first(n));
  const gch=g=>{if(opt.sex==='off')return '';const w=g.filter(p=>p.gender==='w').length,m=g.filter(p=>p.gender==='m').length;return `<span class="rg-v rg-sx">${w} w · ${m} m</span>`};
  const pf=opt.perf!=='off'&&GC.cols.length,avg=g=>{const v=g.map(p=>p.g).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  grid.innerHTML=groups.length?groups.map((g,i)=>`<div class="rg-card"><h4 style="background:${colors[i%colors.length]}">Gruppe ${i+1}${gch(g)}${pf&&avg(g)!=null?`<span class="rg-v rg-avg">Ø ${fmt(avg(g))}</span>`:''}</h4><ul>${g.map(p=>`<li>${esc(nm(p.name))}${pf?`<span class="rg-v rg-g">${p.g==null?'–':fmt(p.g)}</span>`:''}</li>`).join('')}</ul></div>`).join(''):'<p class="rg-empty">Keine Schüler:innen in dieser Klasse.</p>';
 }
 function open(){
  let label='';try{const g=typeof classroomCurrentGroup==='function'?classroomCurrentGroup():null;label=g?.name||aktuelleKlasse||''}catch{}
  LBL=label.replace(/^NM:.*/,'');dlg.classList.remove('rg-big');dlg.querySelector('[data-rg-big]').textContent='Groß zeigen';closeDesk();
  gradeCols();rebuild();if(!dlg.open)dlg.showModal();
 }

 /* 12.95: Lospartner – reihum (jede:r zieht eine:n andere:n, keine gegenseitigen Paare) oder gegenseitig (Paare, bei ungerader Zahl ein Dreierteam).
    Vorgaben: Geschlecht, Leistung, Abwesende, Tabu, nicht der Sitznachbar. Die Liste ist verdeckt; „Groß zeigen“ = Ziehen am Pult:
    jede:r tippt den eigenen Namen, sieht nur den eigenen Lospartner, „Fertig – verdecken“ graut den Namen aus. */
 let LBL='',lots=null,revealed=false,pick=null;const desk=dlg.querySelector('.rg-desk'),lotsEl=dlg.querySelector('.rg-lots');
 const SEP='\u0001';
 function neighbors(){const S=new Set();try{const G=typeof gridData!=='undefined'?gridData:[];const nm=v=>typeof v==='string'?v.trim():String(v?.name||'').trim();
  for(let r=0;r<G.length;r++)for(let c=0;c<(G[r]||[]).length;c++){const a=nm(G[r][c]);if(!a)continue;for(const [dr,dc] of [[0,1],[1,0]]){const b=nm(G[r+dr]?.[c+dc]);if(b){S.add(a+SEP+b);S.add(b+SEP+a)}}}}catch{}return S}
 function buildLots(){
  const all=people(),present=opt.absent?all.filter(p=>!p.absent):all,n=present.length,perf=opt.lperf!=='off'&&GC.cols.length?opt.lperf:'';
  for(const p of all)p.g=perf?gradeOf(p.name):null;
  const tabu=new Set();if(opt.tabu)for(const t of (typeof tabuPaare!=='undefined'?tabuPaare:[])){const a=String(t.s1||'').trim(),b=String(t.s2||'').trim();if(a&&b){tabu.add(a+SEP+b);tabu.add(b+SEP+a)}}
  const NB=opt.nb?neighbors():new Set();
  const ec=(a,b)=>{let c=0;const k=a.name+SEP+b.name;if(tabu.has(k))c+=1000;if(NB.has(k))c+=100;
   const ga=a.gender,gb=b.gender,known=(ga==='m'||ga==='w')&&(gb==='m'||gb==='w');if(known&&opt.lsex==='mix'&&ga===gb)c+=10;if(known&&opt.lsex==='same'&&ga!==gb)c+=10;
   if(perf&&a.g!=null&&b.g!=null){const d=Math.abs(a.g-b.g);c+=perf==='same'?d*3:Math.max(0,3-d)*3}return c};
  const bad={tabu:0,nb:0},missing=all.filter(p=>opt.absent&&p.absent).length;let res=[];
  if(n<2){lots={list:[],n,bad,missing,done:new Set()};revealed=false;return}
  const count=k=>{if(tabu.has(k))bad.tabu++;if(NB.has(k))bad.nb++};
  if(opt.lart==='ring'){/* Permutation ohne Fixpunkt; ab 3 Personen zieht niemand die Person, die ihn/sie gezogen hat */
   const P=shuffle([...present]),T=P.map((_,i)=>(i+1)%n),cost=i=>ec(P[i],P[T[i]]);
   const valid=()=>T.every((t,i)=>t!==i&&(n<3||T[t]!==i));
   for(let it=0;it<6000;it++){const i=Math.floor(Math.random()*n);let j=Math.floor(Math.random()*(n-1));if(j>=i)j++;const before=cost(i)+cost(j);[T[i],T[j]]=[T[j],T[i]];
    const bad2=T[i]===i||T[j]===j||(n>=3&&(T[T[i]]===i||T[T[j]]===j));if(bad2){[T[i],T[j]]=[T[j],T[i]];continue}
    const after=cost(i)+cost(j);if(after>before+1e-9||(after===before&&Math.random()<.5))[T[i],T[j]]=[T[j],T[i]]}
   if(!valid())for(let i=0;i<n;i++)T[i]=(i+1)%n;
   res=P.map((p,i)=>({from:p,to:[P[T[i]]]}));P.forEach((p,i)=>count(p.name+SEP+P[T[i]].name));
  }else{/* Paare; bei ungerader Zahl ein Dreierteam */
   const P=shuffle([...present]),G=[];for(let i=0;i+1<n;i+=2)G.push([i,i+1]);if(n%2)G[G.length-1].push(n-1);
   const gcost=g=>{let c=0;for(let a=0;a<g.length;a++)for(let b=a+1;b<g.length;b++)c+=ec(P[g[a]],P[g[b]])+ec(P[g[b]],P[g[a]]);return c};
   for(let it=0;it<5000&&G.length>1;it++){const x=Math.floor(Math.random()*G.length);let y=Math.floor(Math.random()*(G.length-1));if(y>=x)y++;const A=G[x],B=G[y],i=Math.floor(Math.random()*A.length),j=Math.floor(Math.random()*B.length);const before=gcost(A)+gcost(B);[A[i],B[j]]=[B[j],A[i]];const after=gcost(A)+gcost(B);if(after>before+1e-9||(after===before&&Math.random()<.5))[A[i],B[j]]=[B[j],A[i]]}
   for(const g of G){for(const i of g)res.push({from:P[i],to:g.filter(j=>j!==i).map(j=>P[j])});for(let a=0;a<g.length;a++)for(let b=a+1;b<g.length;b++)count(P[g[a]].name+SEP+P[g[b]].name)}
  }
  res.sort((a,b)=>display(a.from.name).localeCompare(display(b.from.name),'de'));lots={list:res,n,bad,missing,done:new Set()};revealed=false}
 const nmL=n=>{const allP=people(),first=x=>display(x).split(/\s+/)[0]||display(x),lastOf=x=>{const d=display(x).split(/\s+/);return d.length>1?d[d.length-1]:''},fc={};for(const p of allP){const f=first(p.name);fc[f]=(fc[f]||0)+1}return opt.last?display(n):(fc[first(n)]>1&&lastOf(n)?first(n)+' '+lastOf(n)[0]+'.':first(n))};
 function renderLots(){
  for(const b of dlg.querySelectorAll('[data-lart]'))b.setAttribute('aria-pressed',String(b.dataset.lart===opt.lart));
  for(const b of dlg.querySelectorAll('[data-lsex]'))b.setAttribute('aria-pressed',String(b.dataset.lsex===opt.lsex));
  for(const b of dlg.querySelectorAll('[data-lperf]'))b.setAttribute('aria-pressed',String(b.dataset.lperf===opt.lperf));dlg.querySelector('[data-lcol]').hidden=opt.lperf==='off';
  for(const c of dlg.querySelectorAll('[data-opt]'))c.checked=!!opt[c.dataset.opt];
  const L=lots||{list:[],n:0,bad:{}};
  dlg.querySelector('.rg-sub').textContent=`${L.n} ${opt.absent?'anwesend':'Schüler:innen'}${L.missing?` · ${L.missing} abwesend (nicht gelost)`:''} · ${opt.lart==='ring'?'jede:r zieht eine:n andere:n':'Paare, die sich gegenseitig haben'}`;
  const parts=[];if(L.bad.tabu)parts.push(`${L.bad.tabu} Tabu-Paar${L.bad.tabu===1?'':'e'}`);if(L.bad.nb)parts.push(`${L.bad.nb}× Sitznachbar`);
  note.textContent=L.n<2?'Für Lospartner sind mindestens zwei Schüler:innen nötig.':parts.length?'Hinweis: '+parts.join(' und ')+' ließ sich nicht vermeiden.':'';
  dlg.querySelector('.rg-gn').textContent=opt.lsex!=='off'&&people().some(p=>p.gender!=='m'&&p.gender!=='w')?'Bei einigen Schüler:innen fehlt das Geschlecht (Klasse bearbeiten).':'';
  dlg.classList.toggle('rg-revealed',revealed);dlg.querySelector('[data-rg-reveal]').textContent=revealed?'Liste verdecken':'Liste aufdecken';
  const arrow=opt.lart==='ring'?'→':'↔';
  lotsEl.innerHTML=L.list.map(x=>`<div class="rg-pr"><span class="rg-pa">${esc(nmL(x.from.name))}</span><span class="rg-par">${arrow}</span>${revealed?`<span class="rg-pb">${esc(x.to.map(t=>nmL(t.name)).join(' & '))}</span>`:'<span class="rg-pb rg-hid" aria-label="verdeckt"></span>'}</div>`).join('');
  if(!desk.hidden)renderDesk()}
 function rebuild(){const lm=opt.kind==='lots';dlg.classList.toggle('rg-lotsmode',lm);for(const b of dlg.querySelectorAll('[data-kind]'))b.setAttribute('aria-pressed',String(b.dataset.kind===opt.kind));
  dlg.querySelector('h2').textContent=(lm?'Lospartner':'Gruppen')+(LBL?' · '+LBL:'');
  if(lm){note.textContent='';buildLots();renderLots()}else{dlg.querySelector('.rg-gn').textContent='';build()}}
 function renderDesk(){setTimeout(layDesk,0);const L=lots||{list:[],done:new Set()};const left=L.list.filter(x=>!L.done.has(x.from.name)).length;
  desk.innerHTML=`<div class="rg-dh"><b>Lospartner ziehen${LBL?' · '+esc(LBL):''}</b><span>${L.list.length-left} von ${L.list.length} gezogen</span><button type="button" class="rg-dx" data-desk-close aria-label="Beenden" title="Beenden">×</button></div><p class="rg-dsub">${left?'Tippe auf deinen Namen.':'Alle haben gezogen.'}</p>`
   +`<div class="rg-dgrid">${L.list.map((x,i)=>`<button type="button" class="rg-dn${L.done.has(x.from.name)?' is-done':''}" data-desk-i="${i}"${L.done.has(x.from.name)?' disabled':''}>${esc(nmL(x.from.name))}</button>`).join('')}</div>`
   +`<p class="rg-dfoot">Bereits gezogene Namen sind ausgegraut – ihre Lospartner bleiben verborgen.</p>`
   +(pick!=null&&L.list[pick]?`<div class="rg-dov"><div class="rg-dcard"><div class="rg-dw">${esc(nmL(L.list[pick].from.name))}</div><div class="rg-dz">${opt.lart==='ring'?'du hast gezogen':'dein Lospartner'+(L.list[pick].to.length>1?' (Dreierteam)':'')}</div><div class="rg-dp">${L.list[pick].to.map(t=>esc(nmL(t.name))).join('<br>')}</div><button type="button" class="rg-dok" data-desk-ok>Fertig – verdecken</button></div></div>`:'')}
 /* Pult-Ansicht über den ganzen Bildschirm: Kopfzeile, Navigation und Tab-Leiste der App ausblenden (iPad: kein echtes Vollbild in der Home-Bildschirm-App) */
 const PD=(()=>{try{return parent.document!==document?parent.document:null}catch{return null}})();
 function full(on){if(!PD)return;if(on&&!PD.getElementById('cmDeskFullSt')){const st=PD.createElement('style');st.id='cmDeskFullSt';st.textContent='html.cm-deskfull .app-header,html.cm-deskfull .compact-navigation,html.cm-deskfull .compact-navigation-backdrop,html.cm-deskfull .phone-tabbar{display:none!important}html.cm-deskfull #view-sitzplan{position:fixed!important;inset:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;border:0!important;z-index:99999!important}';PD.head.append(st)}PD.documentElement.classList.toggle('cm-deskfull',!!on)}
 /* 12.96: Kacheln füllen die freie Fläche – Spaltenzahl mit der größten Schrift */
 function layDesk(){const g=desk.querySelector('.rg-dgrid');if(!g||desk.hidden)return;const n=g.children.length;if(!n)return;const W=g.clientWidth,H=g.clientHeight,gap=10;let best=null;
  for(let c=1;c<=n;c++){const r=Math.ceil(n/c),w=(W-gap*(c-1))/c,h=(H-gap*(r-1))/r;if(w<90&&best)break;const fs=Math.max(14,Math.min(h*0.34,w/8.5,64)),sc=fs-(r*c-n)*0.02;if(!best||sc>best.sc)best={c,r,fs,sc}}
  g.style.gridTemplateColumns='repeat('+best.c+',minmax(0,1fr))';g.style.gridTemplateRows='repeat('+best.r+',minmax(0,1fr))';g.style.fontSize=best.fs+'px'}
 addEventListener('resize',()=>requestAnimationFrame(layDesk));
 function openDesk(){if(!lots?.list.length)return;pick=null;desk.hidden=false;dlg.classList.add('rg-deskon');full(true);renderDesk()}
 function closeDesk(){pick=null;desk.hidden=true;desk.innerHTML='';dlg.classList.remove('rg-deskon');full(false)}
 dlg.addEventListener('close',()=>{if(!desk.hidden)closeDesk()});
 function lotsClick(t){
  if(t.dataset.kind){opt.kind=t.dataset.kind;save();closeDesk();dlg.classList.remove('rg-big');dlg.querySelector('[data-rg-big]').textContent='Groß zeigen';rebuild();return true}
  if(t.hasAttribute('data-desk-close')){closeDesk();return true}
  if(t.dataset.deskI!=null){if(!t.disabled){pick=+t.dataset.deskI;renderDesk()}return true}
  if(t.hasAttribute('data-desk-ok')){if(pick!=null&&lots?.list[pick])lots.done.add(lots.list[pick].from.name);pick=null;renderDesk();return true}
  if(opt.kind!=='lots')return false;
  if(t.dataset.lart){opt.lart=t.dataset.lart;save();rebuild();return true}
  if(t.dataset.lsex){opt.lsex=t.dataset.lsex;save();rebuild();return true}
  if(t.dataset.lperf){opt.lperf=t.dataset.lperf;save();rebuild();if(opt.lperf!=='off'&&!GC.cols.length)note.textContent='Für diese Lerngruppe sind im aktuellen Halbjahr noch keine Noten eingetragen – die Lospartner werden zufällig gezogen.';return true}
  if(t.hasAttribute('data-rg-reveal')){revealed=!revealed;renderLots();return true}
  if(t.hasAttribute('data-rg-shuffle')){rebuild();return true}
  if(t.hasAttribute('data-rg-big')){openDesk();return true}
  if(t.hasAttribute('data-rg-print')){const w=window.open('','_blank');if(!w){alert('Bitte Pop-ups für den Druck erlauben.');return true}const arrow=opt.lart==='ring'?'→':'↔';
   w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(dlg.querySelector('h2').textContent)}</title><style>body{font:14px/1.4 -apple-system,system-ui,sans-serif;margin:14mm;color:#24334b}h1{font-size:18px;margin:0 0 12px}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:6px 18px}.r{display:flex;gap:8px;border-bottom:1px solid #e1e7f0;padding:4px 0;break-inside:avoid}.r span:first-child{flex:1}.r b{flex:1;color:#2f5f9b}</style></head><body><h1>${esc(dlg.querySelector('h2').textContent)} · ${new Date().toLocaleDateString('de-DE')}</h1><div class="g">${(lots?.list||[]).map(x=>`<div class="r"><span>${esc(nmL(x.from.name))}</span><span>${arrow}</span><b>${esc(x.to.map(t=>nmL(t.name)).join(' & '))}</b></div>`).join('')}</div></body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print()},250);return true}
  return false}
 button.onclick=open;
 dlg.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(lotsClick(t))return;
  if(t.dataset.sex){opt.sex=t.dataset.sex;opt.mix=opt.sex==='mix';save();build()}
  else if(t.dataset.perf){opt.perf=t.dataset.perf;save();if(opt.perf!=='off'&&!GC.cols.length)note.textContent='';build();if(opt.perf!=='off'&&!GC.cols.length)note.textContent='Für diese Lerngruppe sind im aktuellen Halbjahr noch keine Noten eingetragen – die Gruppen werden zufällig gebildet.'}
  else if(t.dataset.mode){opt.mode=t.dataset.mode;save();build()}
  else if(t.dataset.step){const k=opt.mode==='count'?'count':'size';opt[k]=Math.max(opt.mode==='count'?1:2,Math.min(15,opt[k]+Number(t.dataset.step)));save();build()}
  else if(t.hasAttribute('data-rg-shuffle'))build();
  else if(t.hasAttribute('data-rg-close'))dlg.close();
  else if(t.hasAttribute('data-rg-small')){dlg.classList.remove('rg-big');dlg.querySelector('[data-rg-big]').textContent='Groß zeigen'}
  else if(t.hasAttribute('data-rg-big')){const big=dlg.classList.toggle('rg-big');t.textContent=big?'Normale Ansicht':'Groß zeigen'}
  else if(t.hasAttribute('data-rg-print')){const w=window.open('','_blank');if(!w){alert('Bitte Pop-ups für den Druck erlauben.');return}w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(dlg.querySelector('h2').textContent)}</title><style>body{font:14px/1.4 -apple-system,system-ui,sans-serif;margin:14mm;color:#24334b}h1{font-size:18px;margin:0 0 12px}.rg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.rg-card{border:1px solid #cfd8e6;border-radius:10px;overflow:hidden;break-inside:avoid}.rg-card h4{margin:0;padding:6px 10px;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.rg-card ul{margin:0;padding:6px 10px 8px;list-style:none}</style></head><body><h1>${esc(dlg.querySelector('h2').textContent)} · ${new Date().toLocaleDateString('de-DE')}</h1><div class="rg-grid">${grid.innerHTML.replace(/<span class="rg-v[^"]*">[^<]*<\/span>/g,'')}</div></body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print()},250)}
 });
 dlg.addEventListener('change',e=>{if(e.target.matches('[data-col]')){opt.col=e.target.value;for(const x of dlg.querySelectorAll('[data-col]'))x.value=opt.col;save();rebuild();return}const c=e.target.closest('[data-opt]');if(c){opt[c.dataset.opt]=c.checked;save();for(const x of dlg.querySelectorAll('[data-opt="'+c.dataset.opt+'"]'))x.checked=c.checked;if(c.dataset.opt==='last'){render();if(opt.kind==='lots')renderLots()}else rebuild()}});
 dlg.addEventListener('cancel',e=>{if(!desk.hidden){e.preventDefault();closeDesk()}});
 const style=document.createElement('style');style.textContent=
  '.rg-dialog{width:min(900px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;padding:20px 22px;border:1px solid #dce3ef;border-radius:18px;background:#fff;color:#24334b;box-shadow:0 18px 60px #1c2b4630;font:15px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}'
  +'.rg-dialog::backdrop{background:#1c2b4638}.rg-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.rg-head h2{margin:0;font-size:1.2rem}.rg-sub{margin:2px 0 12px;color:#66758a;font-size:.88rem}'
  +'.rg-x{border:0;background:none;font-size:26px;line-height:1;color:#66758a;cursor:pointer;padding:0 4px}'
  +'.rg-opts{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;padding:10px 14px;border:1px solid #dce3ef;border-radius:12px;background:#f8fafd;font-size:.9rem}.rg-opts label{display:inline-flex;gap:6px;align-items:center;cursor:pointer}'
  +'.rg-seg{display:inline-flex;gap:2px;padding:3px;border-radius:9px;background:#e7edf6}.rg-seg button{border:0;background:none;padding:3px 11px;border-radius:7px;color:#66758a;font:inherit;cursor:pointer}.rg-seg button[aria-pressed=true]{background:#fff;color:var(--primary,#2f5f9b);font-weight:650;box-shadow:0 1px 3px #1c2b4626}'
  +'.rg-num{display:inline-flex;align-items:center;border:1px solid #cbd6e5;border-radius:8px;background:#fff}.rg-num button{border:0;background:none;padding:2px 10px;color:var(--primary,#2f5f9b);font:inherit;font-size:1.1rem;cursor:pointer}.rg-num output{min-width:26px;text-align:center;font-weight:650}'
  +'.rg-note{margin:8px 0 0;color:#a56522;font-size:.86rem}.rg-note:empty{display:none}'
  +'.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:14px}.rg-card{border:1px solid #dce3ef;border-radius:12px;overflow:hidden}.rg-card h4{margin:0;padding:7px 12px;color:#fff;font-size:.92rem}.rg-card ul{margin:0;padding:8px 12px 10px;list-style:none}.rg-card li{padding:2px 0}.rg-empty{color:#66758a}'
  +'.rg-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-top:16px}.rg-actions button{min-height:38px;padding:7px 16px;border:1px solid #cbd6e5;border-radius:10px;background:#fff;color:var(--primary,#2f5f9b);font:inherit;font-weight:600;cursor:pointer}.rg-actions .rg-primary{background:var(--primary,#2f5f9b);border-color:var(--primary,#2f5f9b);color:#fff}'
  +'.rg-dialog.rg-big{box-sizing:border-box;width:calc(100vw - 16px);max-width:none;height:calc(100dvh - 16px);max-height:none}.rg-big .rg-opts,.rg-big .rg-note,.rg-big .rg-sub,.rg-big [data-rg-print],.rg-big [data-rg-shuffle]{display:none}.rg-big .rg-grid{grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:14px}.rg-big .rg-actions{display:none}.rg-hb{display:flex;align-items:center;gap:10px}.rg-small{display:none}.rg-big .rg-small{display:inline-flex;align-items:center;height:40px;padding:0 16px;border:1px solid #cfd8e6;border-radius:10px;background:#fff;color:#2f5f9b;font:inherit;font-size:15px;cursor:pointer}.rg-big .rg-x{width:42px;height:40px;border:1px solid #cfd8e6;border-radius:10px;background:#fff;font-size:22px;display:inline-flex;align-items:center;justify-content:center}.rg-big .rg-head{align-items:center}.rg-big .rg-card h4{font-size:1.4rem;padding:10px 16px}.rg-big .rg-card li{font-size:1.45rem;padding:4px 0}.rg-big .rg-card ul{padding:10px 16px 14px}.rg-big h2{font-size:1.6rem}'
  +'.rg-ln{display:inline-flex;gap:6px;align-items:center;margin-right:auto;font-size:.9rem;cursor:pointer}.rg-big .rg-ln{display:none}.rg-gn{color:#b45309;font-size:.85rem;margin:6px 2px 0}.rg-gn:empty{display:none}.rg-sx{margin-left:auto;font-size:.8em;font-weight:600;opacity:.92}.rg-sx+.rg-avg{margin-left:10px}.rg-perf{display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px}.rg-opts .rg-br{flex-basis:100%;height:0}.rg-perf select{height:32px;border:1px solid #cbd6e5;border-radius:8px;background:#fff;font:inherit;padding:0 6px;max-width:180px}.rg-perf select[hidden]{display:none}'
  +'.rg-card h4{display:flex;justify-content:space-between;gap:8px}.rg-avg{font-weight:600;background:#ffffff33;border-radius:6px;padding:0 6px}.rg-card li{display:flex;justify-content:space-between;gap:8px}.rg-g{font-size:.8rem;color:#475569;background:#eef2f7;border-radius:6px;padding:0 6px;font-variant-numeric:tabular-nums}.rg-big .rg-v{display:none}'
  +'.rg-head .rg-kind{margin:0 auto 0 18px;align-self:center}.rg-kind button{font-size:.98rem;padding:5px 16px}.rg-lopts,.rg-lcover,.rg-lots{display:none}.rg-lotsmode .rg-opts,.rg-lotsmode .rg-grid{display:none}.rg-lotsmode .rg-lopts{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;padding:10px 14px;border:1px solid #dce3ef;border-radius:12px;background:#f8fafd;font-size:.9rem}.rg-lopts label{display:inline-flex;gap:6px;align-items:center;cursor:pointer}.rg-lopts .rg-br{flex-basis:100%;height:0}.rg-lopts select{height:32px;border:1px solid #cbd6e5;border-radius:8px;background:#fff;font:inherit;padding:0 6px;max-width:180px}.rg-lopts select[hidden]{display:none}'
  +'.rg-lotsmode .rg-lcover{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:12px;padding:8px 12px;border:1px dashed #e8a25a;border-radius:10px;background:#fff8ef;color:#8a4b08;font-size:.88rem}.rg-lcover button{height:34px;padding:0 14px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:#2f5f9b;font:inherit;font-weight:600;cursor:pointer}'
  +'.rg-lotsmode .rg-lots{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin-top:12px}.rg-pr{display:flex;align-items:center;gap:8px;border:1px solid #dce3ef;border-radius:11px;padding:7px 11px}.rg-pa,.rg-pb{flex:1;min-width:0}.rg-par{color:#e8790c;font-weight:800}.rg-pb{font-weight:600;color:#2f5f9b}.rg-hid{height:22px;max-width:170px;border-radius:7px;background:repeating-linear-gradient(-45deg,#e3e9f2 0 8px,#eef2f8 8px 16px)}'
  +'.rg-desk{position:fixed;inset:0;z-index:20;background:#fff;padding:max(20px,env(safe-area-inset-top)) max(24px,env(safe-area-inset-right)) 20px max(24px,env(safe-area-inset-left));overflow:auto;display:flex;flex-direction:column;box-sizing:border-box}.rg-desk[hidden]{display:none}.rg-dh{display:flex;align-items:center;gap:14px}.rg-dh b{font-size:1.4rem}.rg-dh span{margin-left:auto;color:#66758a}.rg-dx{width:44px;height:42px;border:1px solid #cfd8e6;border-radius:10px;background:#fff;color:#2f5f9b;font-size:24px;cursor:pointer}'
  +'.rg-dsub{margin:2px 0 10px;color:#66758a;font-size:1.1rem}.rg-dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;flex:1;min-height:0}.rg-dn{min-height:0;line-height:1.15;overflow:hidden;border:1.5px solid #a8bdd8;border-radius:14px;background:#fff;color:#2f5f9b;font:inherit;font-size:1em;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:16px}.rg-dn.is-done{background:#f1f4f8;border-color:#e1e7f0;color:#9aa6b6;font-weight:500;cursor:default}.rg-dn.is-done::before{content:"✓ ";color:#2c7a4b}'
  +'.rg-dfoot{margin:8px 0 0;color:#66758a;font-size:.9rem}.rg-dov{position:fixed;inset:0;background:rgba(28,43,70,.5);display:grid;place-items:center;padding:16px}.rg-dcard{background:#fff;border-radius:22px;padding:30px 36px;text-align:center;width:min(600px,100%);box-sizing:border-box;box-shadow:0 20px 50px #0004}.rg-dw{font-size:1.9rem;font-weight:700}.rg-dz{color:#66758a;font-size:1.1rem;margin:6px 0}.rg-dp{font-size:clamp(2rem,6vw,3rem);font-weight:800;color:#fff;background:#2f5f9b;border-radius:18px;padding:14px 20px;margin:8px 0 20px;line-height:1.2}.rg-dok{height:50px;padding:0 28px;border:0;border-radius:12px;background:#2f5f9b;color:#fff;font:inherit;font-size:1.1rem;font-weight:600;cursor:pointer}'
  +'.rg-dialog.rg-deskon{box-sizing:border-box;width:100vw;max-width:none;height:100dvh;max-height:none;margin:0;border-radius:0}'
  +'@media (max-width:600px){.rg-head{flex-wrap:wrap}.rg-head .rg-kind{order:3;margin:6px 0 0}}';
 document.head.append(style);
})();
;

/* ==== sitzplan/plan-actions.js ==== */
/* Buttonreihe unter dem Sitzplan geordnet, immer in einer Zeile:
   [Schüler zuweisen] │ [Perspektive] [Schüler finden] [Zufallsauswahl] [Zufallsgruppen] │ [Rollen] │ [Drucken] [Mehr ▾] [Verteilen]
   Reicht der Platz nicht, wandern Drucken, Rollen, Zufallsgruppen, Zufallsauswahl und Perspektive ins Menü „Mehr“.
   „Start“ heißt „Verteilen“ und steht als Hauptaktion direkt rechts neben „Mehr“ (8.99). „Vorlage speichern“ und „Zurücksetzen“ liegen im Menü „Mehr“.
   Der Unterrichts-Manager baut die Reihe bei jedem Neuzeichnen neu auf – danach wird sie wieder geordnet. */
(()=>{
 const grid=document.getElementById('roomGrid');if(!grid)return;
 let busy=false,menuOpen=false;
 const label=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
 function separator(){const s=document.createElement('span');s.className='plan-actions-sep';s.setAttribute('aria-hidden','true');return s}
 function closeMenu(){menuOpen=false;document.querySelectorAll('.plan-actions-more').forEach(m=>{m.classList.remove('open');m.querySelector('.plan-actions-more-toggle')?.setAttribute('aria-expanded','false')})}
 /* 10.78: „Alle Namen vom Plan nehmen …“ – Tische bleiben, Klassenliste und Bewertungen bleiben, rückgängig möglich */
 function clearButton(){let clr=document.getElementById('classroomClearNamesButton');if(clr)return clr;clr=document.createElement('button');clr.type='button';clr.id='classroomClearNamesButton';clr.className='btn';clr.dataset.beamerHide='1';clr.title='Alle Namen vom Sitzplan nehmen. Tische, Pult, Klassenliste und Bewertungen bleiben erhalten; „Rückgängig“ holt die Namen zurück.';
  clr.innerHTML='<svg class="pa-mi-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.4 2.8-5.3 5.5-5.3s4.9 1.9 5.5 5.3"/><path d="M16 9.5h5"/></svg>Alle Namen vom Plan nehmen …';clr.onclick=()=>clearNames();return clr}
 function arrange(){
  const bar=grid.querySelector('.classroom-plan-actions');if(!bar||busy)return;
  const items=[...bar.querySelectorAll('button')];
  const byText=t=>items.find(el=>el.matches?.('button')&&label(el)===t);
  const assign=bar.querySelector('[data-assign-student]')||byText('Schüler zuweisen'),random=(()=>{const r=document.getElementById('randomStudentButton');return r?.parentElement?.matches('.si-rsplit')?r.parentElement:r})(),finder=bar.querySelector('.student-finder'),
   roll=bar.querySelector('.classroom-roll-split'),persp=document.getElementById('classroomRotateButton'),print=byText('Drucken'),
   save=bar.querySelector('.grid-save-button'),reset=document.getElementById('classroomResetButton'),start=document.getElementById('classroomStartButton'),legacy=document.getElementById('studentSearchInput'),groupsBtn=window.classroomRandomGroupsButton||null;
  if(!start)return;
  /* 11.01: Vorlage speichern, Zurücksetzen, Alle Namen vom Plan nehmen stehen als Symbolknöpfe in der Zeile; nur bei Platzmangel wandern sie (zuerst) ins Menü „Mehr“ */
  const clr=clearButton();
  /* 11.03: ohne Trennstriche; Drucken rechts neben „Vorlage speichern“ */const expected=[assign,persp,finder,random,groupsBtn,roll,save,print,reset,clr,'more','right',document.getElementById('spLegendActions')].filter(Boolean);
  const right0=bar.querySelector(':scope > .plan-actions-right'),more0=bar.querySelector(':scope > .plan-actions-more'),current=[...bar.children].filter(c=>c!==legacy&&!c.matches('.plan-actions-sep'));
  const want=expected.map(x=>x==='more'?more0:x==='right'?right0:x).filter(x=>x!=='sep');
  if(right0&&more0&&right0.lastElementChild===start&&start.textContent==='Verteilen'&&current.length===want.length&&current.every((c,i)=>c===want[i]))return;
  busy=true;
  try{
   start.textContent='Verteilen';
   let more=bar.querySelector('.plan-actions-more');
   if(!more){more=document.createElement('div');more.className='plan-actions-more';
    more.innerHTML='<button type="button" class="btn btn-secondary plan-actions-more-toggle" aria-haspopup="menu" aria-expanded="false" aria-label="Mehr" title="Mehr"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="5.5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18.5" cy="12" r="2"/></svg><span class="cm-more-lbl">Mehr</span></button><div class="plan-actions-menu" role="menu"></div>';
    more.querySelector('.plan-actions-more-toggle').onclick=e=>{e.stopPropagation();const open=!more.classList.contains('open');closeMenu();if(open){more.classList.add('open');menuOpen=true;e.currentTarget.setAttribute('aria-expanded','true');const r=e.currentTarget.getBoundingClientRect(),m=more.querySelector('.plan-actions-menu');m.style.position='fixed';m.style.right=Math.max(8,innerWidth-r.right)+'px';m.style.left='auto';const h=m.offsetHeight;m.style.top=(r.top-h-6>8?r.top-h-6:r.bottom+6)+'px';m.style.bottom='auto'}};
   }
   const menu=more.querySelector('.plan-actions-menu');
   for(const b of [save,reset].filter(Boolean)){b.removeAttribute('role');if(b===reset&&!/…$/.test(label(b)))b.textContent='Einträge des Tages löschen …';/* 10.67: Symbole – Ablage (speichern) und Radiergummi (zurücksetzen) */if(!b.querySelector(':scope>.pa-mi-ic'))b.insertAdjacentHTML('afterbegin','<svg class="pa-mi-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(b===reset?'<path d="M14.5 4.5 20 10l-8.5 8.5H7L4 15.5z"/><path d="m9.5 9.5 5.5 5.5"/><path d="M11.5 18.5H20"/>':'<path d="M12 3.5v9"/><path d="m8.5 9 3.5 3.5L15.5 9"/><path d="M4 13.5v4.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5"/><path d="M4 13.5h4l1 2h6l1-2h4"/>')+'</svg>')}
   /* 10.83: nur als Symbole (Name als Infotext) */
   for(const b of [save,reset,clr].filter(Boolean)){b.classList.add('pa-tool');const t=label(b).replace(/\s+/g,' ').trim();if(t&&b.getAttribute('aria-label')!==t)b.setAttribute('aria-label',t);if(!b.title)b.title=t;}
   menu.onclick=()=>closeMenu();
   let right=bar.querySelector(':scope > .plan-actions-right');if(!right){right=document.createElement('div');right.className='plan-actions-right'}
   right.append(start);
   const nodes=expected.map(x=>x==='sep'?separator():x==='right'?right:x==='more'?more:x);
   bar.querySelectorAll(':scope > .plan-actions-sep').forEach(n=>n.remove());
   if(legacy)bar.append(legacy);bar.append(...nodes);
   bar.dataset.arranged='1';
  }finally{busy=false}
 }
 // Was nicht in eine Zeile passt, wandert von rechts nach links ins Menü „Mehr“ (Stellvertreter-Einträge lösen den Originalbutton aus).
 let fitPlanned=false,lastKey='';
 // Reihenfolge beim Einklappen: zuletzt „Schüler finden“ (nicht während der Suche) und „Schüler zuweisen“ (nicht während des Zuweisens).
 let forceFinder=false;
 function collapsibles(bar){const finder=bar.querySelector(':scope > .student-finder'),assign=bar.querySelector(':scope > [data-assign-student]');
  return [document.getElementById('classroomClearNamesButton'),document.getElementById('classroomResetButton'),[...bar.querySelectorAll(':scope > .btn')].find(b=>label(b)==='Drucken'),bar.querySelector(':scope > .grid-save-button'),bar.querySelector(':scope > .classroom-roll-split'),window.classroomRandomGroupsButton,(()=>{const r=document.getElementById('randomStudentButton');return r?.parentElement?.matches('.si-rsplit')?r.parentElement:r})(),document.getElementById('classroomRotateButton'),
   finder&&finder.dataset.open!=='true'&&!forceFinder?finder:null,assign&&assign.getAttribute('aria-pressed')!=='true'?assign:null].filter(el=>el&&el.parentElement===bar)}
 function proxy(text,target){const b=document.createElement('button');b.type='button';b.className='plan-actions-proxy'+(/^(classroomResetButton|classroomClearNamesButton)$/.test(target.id)?' pa-danger':'');b.setAttribute('role','menuitem');/* 12.07: nur Symbole – der Name steht als Infotext (Finger halten oder „i“) */const t=String(text).replace(/\s*…$/,'');b.setAttribute('aria-label',t);b.title=t;const ic=target.querySelector?.(':scope>.pa-mi-ic')||target.querySelector?.('svg');if(ic){const c=ic.cloneNode(true);c.removeAttribute('style');c.setAttribute('class','pa-mi-ic');b.append(c)}else if(/^Drucken/.test(t))b.innerHTML='<svg class="pa-mi-ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V4h10v5"/><path d="M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><path d="M7 14h10v6H7z"/></svg>';else b.innerHTML='<span class="pa-ictxt">'+(/↓/.test(t)?'↓':/↑/.test(t)?'↑':t.slice(0,2))+'</span>';b.disabled=!!target.disabled;b.onclick=()=>target.click();b._target=target;return b}
 function fit(){
  fitPlanned=false;const bar=grid.querySelector('.classroom-plan-actions');if(!bar||!bar.dataset.arranged)return;
  const menu=bar.querySelector(':scope > .plan-actions-more .plan-actions-menu');if(!menu)return;
  const finderEl=bar.querySelector(':scope > .student-finder'),assignEl=bar.querySelector(':scope > [data-assign-student]');
  // Suche geschlossen bzw. Zuweisen beendet: neu einpassen.
  if(finderEl&&!finderEl.__planWatch){finderEl.__planWatch=true;new MutationObserver(()=>{if(finderEl.dataset.open!=='true')forceFinder=false;scheduleFit()}).observe(finderEl,{attributes:true,attributeFilter:['data-open']})}
  if(assignEl&&!assignEl.__planWatch){assignEl.__planWatch=true;new MutationObserver(scheduleFit).observe(assignEl,{attributes:true,attributeFilter:['aria-pressed']})}
  const list=collapsibles(bar),beamer=document.documentElement.classList.contains('classroom-beamer');
  /* 9.75: Hat sich nichts geändert, was die Aufteilung beeinflusst, nichts anfassen (Probe-Umschalten löste sonst Beobachter-Schleifen aus) */
  /* 10.32: Zustand inkl. tatsächlich eingeklappter Knöpfe und Überlauf – baut der Sitzplan die Leiste neu auf, fällt das sonst nicht auf */
  const base=()=>[bar.clientWidth,innerWidth,document.documentElement.className,forceFinder,finderEl?.dataset.open,assignEl?.getAttribute('aria-pressed'),...[...bar.children].map(c=>c.matches('.plan-actions-more')?'more':(c.id||String(c.className).replace(/\s*plan-actions-collapsed/g,''))+':'+c.textContent.length+':'+(c.disabled?1:0)+(c.hidden?1:0))].join('#'),bits=()=>[...bar.children].map(c=>c.classList.contains('plan-actions-collapsed')?1:0).join(''),post=()=>base()+'#'+bits()+'#'+(bar.scrollWidth>bar.clientWidth+1),sig=post(),same=bits()===lastBits;
  if(sig===lastSig)return;
  /* 10.31: Nur etwas breiter geworden (z. B. Scrollleiste verschwindet, weil die Leiste einzeilig wurde) → Aufteilung behalten, sonst Hin-und-Her */
  const rest=base().split('#').slice(2).join('#'),bw=bar.clientWidth;
  if(same&&rest===lastRest&&lastKey&&bw>=lastW&&bw-lastW<=40&&Date.now()-lastFlip<4000&&!(bar.scrollWidth>bw+1)){lastSig=sig;return}
  /* 10.32: Nach erkanntem Hin-und-Her eingefroren: nur noch weiter einklappen, nie wieder aufklappen – bis sich wirklich etwas ändert */
  if(freeze&&same){if(rest!==freeze.rest||Math.abs(bw-freeze.w)>40)freeze=null;else if(!(bar.scrollWidth>bw+1)){lastSig=sig;return}}
  for(const el of [...list,finderEl,assignEl].filter(Boolean))el.classList.remove('plan-actions-collapsed');bar.classList.remove('plan-actions-wrap');
  // Trennstriche nur zwischen sichtbaren Gruppen – 10.32: schon beim Messen, sonst kommt ein Trennstrich (+20 px) erst danach dazu und die Leiste läuft über
  const kids=[...bar.children],visible=el=>getComputedStyle(el).display!=='none';
  const seps=()=>{for(const [i,sep] of kids.entries()){if(!sep.matches('.plan-actions-sep'))continue;let before=false,after=false;for(let j=i-1;j>=0&&!kids.at(j).matches('.plan-actions-sep');j--)if(visible(kids.at(j)))before=true;for(let j=i+1;j<kids.length&&!kids.at(j).matches('.plan-actions-sep');j++)if(visible(kids.at(j)))after=true;const off=!(before&&after);if(sep.classList.contains('plan-actions-collapsed')!==off)sep.classList.toggle('plan-actions-collapsed',off)}};
  const over=()=>{seps();return bar.scrollWidth>bar.clientWidth+1},hidden=[],moreBox=menu.closest('.plan-actions-more');moreBox.classList.add('plan-actions-collapsed');
  if(!beamer&&bar.clientWidth>0)for(const el of list){if(!over())break;moreBox.classList.remove('plan-actions-collapsed');el.classList.add('plan-actions-collapsed');hidden.push(el)}
  if(bar.clientWidth>0&&over())bar.classList.add('plan-actions-wrap');
  seps();
  hidden.sort((a,b)=>kids.indexOf(a)-kids.indexOf(b));
  const key=hidden.map(el=>el.id||label(el)).join('|');
  let box=menu.querySelector(':scope > .plan-actions-overflow');
  if(key!==lastKey||!box){
   lastKey=key;box?.remove();menu.querySelector(':scope > .plan-actions-menu-sep')?.remove();
   if(hidden.length){box=document.createElement('div');box.className='plan-actions-overflow';
    for(const el of hidden){if(el.matches('.student-finder')){const b=proxy('Schüler finden',el);b.onclick=()=>{forceFinder=true;el.classList.remove('plan-actions-collapsed');el.querySelector('#studentSearchToggle')?.click();scheduleFit()};box.append(b);continue}if(el.matches('.classroom-roll-split')){for(const b of el.querySelectorAll(':scope > .btn')){const arrow=label(b);box.append(proxy('Reihen rollen '+arrow+(arrow.includes('↓')?' (nach unten)':arrow.includes('↑')?' (nach oben)':''),b))}}else if(el.matches('.si-rsplit')){for(const b of el.querySelectorAll(':scope > .btn'))box.append(proxy(b.getAttribute('aria-label')||label(b),b))}else box.append(proxy(label(el),el))}
    const line=document.createElement('div');line.className='plan-actions-menu-sep';line.setAttribute('role','separator');menu.prepend(box,line)}
  }else for(const b of box.querySelectorAll('.plan-actions-proxy'))if(b.disabled!==!!b._target.disabled)b.disabled=!!b._target.disabled;
  if(key!==prevKey){prevKey=key;lastFlip=Date.now()}
  lastSig=post();lastBits=bits();lastRest=rest;lastW=bw;
 }
 let lastBits='',lastSig='',lastRest='',lastW=0,lastFlip=0,prevKey='';
 /* 10.30: Schutz vor Hin- und Herspringen – ändert sich die Aufteilung mehr als 6× pro Sekunde, 1,5 s Pause */
 let fitRuns=[],fitPause=0,freeze=null;
 function scheduleFit(){if(fitPlanned)return;const now=Date.now();if(now<fitPause)return;fitRuns=fitRuns.filter(t=>now-t<1000);fitRuns.push(now);if(fitRuns.length>12){fitPause=now+1500;fitRuns=[];const bar=grid.querySelector('.classroom-plan-actions');if(bar)freeze={w:bar.clientWidth,rest:lastRest};try{window.classroomFlickerNote?.('plan-actions')}catch{}setTimeout(scheduleFit,1600);return}fitPlanned=true;requestAnimationFrame(fit)}
 new ResizeObserver(scheduleFit).observe(grid);
 new MutationObserver(scheduleFit).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 window.classroomFitPlanActions=fit;
 document.addEventListener('pointerdown',e=>{if(menuOpen&&!e.target.closest?.('.plan-actions-more'))closeMenu()},true);
 document.addEventListener('keydown',e=>{if(menuOpen&&e.key==='Escape')closeMenu()});
 addEventListener('scroll',()=>{if(menuOpen)closeMenu()},true);addEventListener('resize',()=>{if(menuOpen)closeMenu()});
 const style=document.createElement('style');style.textContent=
  'body[data-module=sitzplan] .classroom-plan-actions{display:flex!important;flex-wrap:wrap;align-items:center;gap:10px!important}'
  +'body[data-module=sitzplan] .classroom-plan-actions>*{margin:0!important}'
  +'body[data-module=sitzplan] .classroom-plan-actions>.btn,body[data-module=sitzplan] .classroom-plan-actions .plan-actions-more-toggle,body[data-module=sitzplan] .classroom-plan-actions>.student-finder,body[data-module=sitzplan] .classroom-plan-actions>.classroom-roll-split{box-sizing:border-box;height:40px!important;min-height:40px!important;font-size:14.4px!important;width:auto!important;flex:0 0 auto}'
  +'body[data-module=sitzplan] .classroom-plan-actions>.student-finder>#studentSearchToggle{min-height:0!important;height:100%}'
  +'body[data-module=sitzplan] .classroom-plan-actions .btn{display:inline-flex;align-items:center;justify-content:center;padding:0 12px!important;white-space:nowrap}'
  +'.plan-actions-sep{width:1px;height:26px;background:#dce3ef;flex:none}'
  +'body[data-module=sitzplan] .classroom-plan-actions>.plan-actions-right{display:flex;align-items:center;gap:10px;margin-left:0!important;flex:none}'
  +'body[data-module=sitzplan] .plan-actions-right>.btn,body[data-module=sitzplan] .plan-actions-right .plan-actions-more-toggle{box-sizing:border-box;height:40px!important;min-height:40px!important;font-size:14.4px!important;width:auto!important;margin:0!important}'
  +'.plan-actions-more{position:relative;flex:none;display:flex;align-items:center;height:40px}'
  +'.plan-actions-more-toggle{gap:6px}.plan-actions-more-toggle span{font-size:.75em}'
  +'.plan-actions-menu{display:none;position:fixed;z-index:1000;min-width:210px;padding:6px;background:#fff;border:1px solid #dce3ef;border-radius:12px;box-shadow:0 12px 30px #1c2b4626}'
  +'.plan-actions-more.open .plan-actions-menu{display:block}.plan-actions-menu{min-width:0!important}.plan-actions-overflow{display:flex;flex-wrap:wrap;gap:6px;max-width:260px}.plan-actions-menu-sep{display:none!important}'+'body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy.plan-actions-proxy:not(#_){width:46px!important;height:46px!important;padding:0!important;justify-content:center;border:1px solid #e3e9f2!important;border-radius:10px!important}body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy.pa-danger:not(#_){border-color:#f2c4b3!important}.plan-actions-proxy .pa-mi-ic{width:22px;height:22px;flex:none}.pa-ictxt{font-size:18px;font-weight:700}'
  +'body[data-module=sitzplan] .classroom-plan-actions>.pa-tool:not(.plan-actions-collapsed):not(#_):not(#__):not(#___){display:inline-flex!important;align-items:center;justify-content:center;box-sizing:border-box;width:40px!important;min-width:40px!important;height:40px!important;padding:0!important;font-size:0!important;gap:0!important;flex:none;background:#fff!important;border:1px solid #a8bdd8!important;border-radius:10px!important;color:#2f5f9b!important;box-shadow:none!important}'
  +'body[data-module=sitzplan] .classroom-plan-actions>.pa-tool:hover:not(#_):not(#__):not(#___){background:#f3f6fb!important}body[data-module=sitzplan] .classroom-plan-actions>:is(#classroomResetButton,#classroomClearNamesButton).pa-tool:not(#_):not(#__):not(#___){color:#b42318!important}body[data-module=sitzplan] .classroom-plan-actions>.pa-tool:disabled{opacity:.45}.pa-tool>.pa-mi-ic{width:22px;height:22px;flex:none}'
  +'body[data-module=sitzplan] .classroom-roll-split:has(.btn:disabled){opacity:.45;filter:grayscale(1);cursor:not-allowed}body[data-module=sitzplan] .classroom-roll-split:has(.btn:disabled)>.btn{background:#fff!important;color:inherit}body[data-module=sitzplan] .classroom-roll-split:has(.btn:disabled)>.classroom-roll-caption{opacity:1!important}'
  +'.classroom-beamer .plan-actions-more,.classroom-beamer .plan-actions-sep{display:none!important}'
  +'@media(max-width:700px){.plan-actions-sep{display:none}}'
  +'body[data-module=sitzplan] .classroom-plan-actions{flex-wrap:nowrap!important}body[data-module=sitzplan] .classroom-plan-actions.plan-actions-wrap{flex-wrap:wrap!important}'
  +'body[data-module=sitzplan] .classroom-plan-actions>.plan-actions-collapsed{display:none!important}'
  +'.plan-actions-menu-sep{height:1px;margin:5px 6px;background:#e3e9f2}.plan-actions-menu-sep:last-child{display:none}'
  +'body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy{display:flex!important;align-items:center;gap:10px;width:100%!important;height:auto!important;min-height:0!important;margin:0!important;padding:9px 12px!important;border:0!important;border-radius:8px!important;background:none!important;color:var(--primary,#2f5f9b)!important;text-align:left!important;font:inherit;font-weight:500;box-shadow:none!important;cursor:pointer;white-space:nowrap}'
  +'body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy:hover{background:#f3f6fb!important}body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy:disabled{opacity:.45;cursor:not-allowed}body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy.pa-danger{color:#b42318!important}.plan-actions-proxy>.pa-mi-ic{width:20px;height:20px;flex:none}';
 document.head.append(style);
 arrange();
 new MutationObserver(()=>{if(!busy){arrange();scheduleFit()}}).observe(grid,{childList:true,subtree:true});
 scheduleFit();
})();

/* Zoomleiste über dem Sitzplan, immer einzeilig: Was nicht passt, wandert von rechts nach links in „Mehr ▾“ (ganz rechts,
   nur sichtbar, wenn etwas darin steht): Klassenansicht, „100 %“, „Einpassen“, zuletzt der Schalter „Bewertungen“ (9.09).
   ☰, −, Regler, Prozentanzeige und + bleiben immer sichtbar. In der Klassenansicht wird nichts verschoben. */
(()=>{
 let planned=false,lastKey='',open=false,observed=null;
 const label=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
 const style=document.createElement('style');style.textContent=
  'html body[data-module=sitzplan] .classroom-plan-zoom .zoom-collapsed:not(#_):not(#__):not(#___):not(#____){display:none!important}'
  +'body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row{flex-wrap:nowrap}body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-wrap{flex-wrap:wrap}'
  +'.classroom-plan-zoom>.zoom-collapsed,html body[data-module=sitzplan] .classroom-plan-zoom>.zoom-collapsed:not(#_):not(#__):not(#___){display:none!important}'/* 9.09: „Bewertungen“ wurde trotz Platz im Menü „Mehr“ zusätzlich angezeigt (iPad) */
  +'.zoom-more{flex:none;position:relative}/* 9.05: direkt nach „Bewertungen“ statt isoliert rechts */.zoom-more[hidden]{display:none!important}'
  +'.classroom-plan-zoom .zoom-more-toggle{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.zoom-more-toggle span{font-size:.75em}'
  +'.zoom-more-menu{display:none;position:fixed;z-index:1000;min-width:200px;padding:6px;background:#fff;border:1px solid #dce3ef;border-radius:12px;box-shadow:0 12px 30px #1c2b4626}'
  +'.zoom-more.open .zoom-more-menu,.zoom-more-menu.zm-float{display:flex;gap:6px}.zoom-more-menu{min-width:0!important}'
  +'body .zoom-more-menu>button.zoom-more-menu-b:not(#_):not(#__),body[data-module=sitzplan] .zoom-more-menu>button:not(#_){width:46px!important;height:46px!important;padding:0!important;justify-content:center!important;border:1px solid #e3e9f2!important;border-radius:10px!important}'
  +'.zoom-more-menu>button svg{width:22px;height:22px}.zoom-more-menu>button[aria-checked=true],.zoom-more-menu>button[aria-pressed=true]{background:#fff4e2!important;border-color:#f2c98a!important;color:#c2410c!important}.zm-txt{font-size:12px;font-weight:800}.zm-as{width:20px;height:14px;border-radius:4px;background:#c8e6b0;border:2.5px solid #d9534f}[aria-checked=false]>.zm-as{opacity:.45}'
  +'body[data-module=sitzplan] .zoom-more-menu>button{display:flex!important;align-items:center;justify-content:flex-start;gap:12px;width:100%!important;min-width:0!important;min-height:0!important;margin:0!important;padding:9px 12px!important;border:0!important;border-radius:8px!important;background:none!important;color:var(--primary,#2f5f9b)!important;text-align:left;font:inherit;font-size:.95rem;font-weight:500;white-space:nowrap;cursor:pointer}'
  +'body[data-module=sitzplan] .zoom-more-menu>button:hover{background:#f3f6fb!important}'
  +'.zoom-proxy-switch{position:relative;flex:0 0 34px;width:34px;height:20px;border-radius:999px;background:#c9d3e1;transition:background .15s}.zoom-proxy-switch::before{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #1c2b4635;transition:transform .15s}'
  +'[aria-checked=true]>.zoom-proxy-switch{background:var(--primary,#2f5f9b)}[aria-checked=true]>.zoom-proxy-switch::before{transform:translateX(14px)}'
  +'.zoom-proxy-check{visibility:hidden}[aria-pressed=true]>.zoom-proxy-check{visibility:visible}'
  // iPhone: Regler darf schmaler werden, damit die Leiste in eine Zeile passt.
  +'@media(max-width:540px){body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row input[type=range]{flex:1 1 130px;width:auto!important;min-width:56px}body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row{gap:6px}}';
 document.head.append(style);
 function close(){open=false;document.querySelectorAll('.zoom-more.open').forEach(m=>{m.classList.remove('open');m.querySelector('.zoom-more-toggle')?.setAttribute('aria-expanded','false');const mm=m._menu;if(mm){mm.classList.remove('zm-float');if(mm.parentElement!==m)m.append(mm)}})}
 function ensureMore(bar){
  let more=bar.querySelector(':scope > .zoom-more');
  if(!more){more=document.createElement('div');more.className='zoom-more';more.hidden=true;
   more.innerHTML='<button type="button" class="zoom-more-toggle" aria-haspopup="menu" aria-expanded="false" aria-label="Mehr" title="Mehr"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="5.5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18.5" cy="12" r="2"/></svg><span class="cm-more-lbl">Mehr</span></button><div class="zoom-more-menu" role="menu"></div>';
   const toggle=more.querySelector('.zoom-more-toggle');
   toggle.onclick=e=>{e.stopPropagation();const was=more.classList.contains('open');close();if(was)return;more.classList.add('open');open=true;toggle.setAttribute('aria-expanded','true');const r=toggle.getBoundingClientRect(),m=more._menu||more.querySelector('.zoom-more-menu');more._menu=m;document.body.append(m);m.classList.add('zm-float');m.style.right=Math.max(8,innerWidth-r.right)+'px';m.style.left='auto';m.style.top=(r.bottom+6)+'px'};
   more._menu=more.querySelector('.zoom-more-menu');more._menu.onclick=()=>close();
  }
  if(bar.lastElementChild!==more)bar.append(more);
  return more;
 }
 /* 13.13: Die obere Leiste bleibt immer eine Zeile. Was links von „…“ nicht passt, wandert der Reihe nach ins Menü „…“:
    1:1 · Einpassen · Vollbild · Trend · Lerneinheit · Anzahl · Bewertungen · Zoom-Regler · −/+. Rechts von „…“ (ⓘ) und der Schalter ⇄ ☰ ☑ bleiben immer sichtbar;
    reicht es trotzdem nicht, wird die Seite nicht schmaler. */
 function units(bar){const q=s=>bar.querySelector(':scope > '+s),vis=e=>!!e&&e.getClientRects().length>0,pill=q('.si-pill'),U=[];
  const add=(els,px)=>{els=els.filter(vis);if(els.length)U.push({els,px:px||els})};
  add([q('.classroom-beamer-button')]);add([q('[data-zoom-reset]')]);add([q('[data-zoom-fit]')]);add([q('.sp-fs-btn')]);
  if(pill)for(const b of [...pill.querySelectorAll(':scope>button')].reverse())add([b]);
  add([q('.plan-assess-switch')]);add([q('input[type=range]'),q('output')],[]);add([q('[data-zoom-minus]'),q('[data-zoom-plus]')]);
  return U}
 /* 9.09: „Bewertungen“ wandert als Letztes ins Menü – es ist der wichtigste Schalter */function items(bar){return [bar.querySelector(':scope > .classroom-beamer-button'),bar.querySelector(':scope > [data-zoom-reset]'),bar.querySelector(':scope > [data-zoom-fit]'),bar.querySelector(':scope > .plan-assess-switch')].filter(Boolean)}
 function proxyFor(el){
  const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b._target=el;
  const nm=el.matches('.plan-assess-switch')?'Bewertungen am Platz':el.matches('[data-zoom-fit]')?'Einpassen':el.matches('[data-zoom-reset]')?'Originalgröße 100 %':(el.getAttribute('aria-label')||label(el));b.setAttribute('aria-label',nm);b.title=nm;
  const ic=()=>{const s=el.querySelector('svg');if(s){const c=s.cloneNode(true);c.removeAttribute('class');c.removeAttribute('style');return c.outerHTML}return '<span class="zm-txt">'+label(el).replace(/\s+/g,'')+'</span>'};
  if(el.matches('.plan-assess-switch')){const input=el.querySelector('input');b.setAttribute('role','menuitemcheckbox');b.innerHTML='<span class="zm-as" aria-hidden="true"></span>';b.setAttribute('aria-checked',String(!!input?.checked));b.onclick=()=>input?.click()}
  else if(el.matches('[data-zoom-fit]')){b.innerHTML=ic();b.setAttribute('aria-pressed',el.getAttribute('aria-pressed')||'false');b.onclick=()=>el.click()}
  else{b.innerHTML=ic();b.onclick=()=>el.click()}
  return b;
 }
 function sync(menu){const put=(b,k,v)=>{if(b.getAttribute(k)!==v)b.setAttribute(k,v)};for(const b of menu.querySelectorAll('button')){const el=b._target;if(!el)continue;if(el.matches('.plan-assess-switch'))put(b,'aria-checked',String(!!el.querySelector('input')?.checked));else if(el.matches('[data-zoom-fit]'))put(b,'aria-pressed',el.getAttribute('aria-pressed')||'false');if(b.disabled!==!!el.disabled)b.disabled=!!el.disabled}}
 function fit(){
  planned=false;const bar=document.querySelector('.classroom-plan-zoom');if(!bar)return;
  if(observed!==bar){observed=bar;new MutationObserver(list=>{if(list.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>!n.closest?.('.zoom-more')&&!(n.matches?.('.zoom-more')))))schedule()}).observe(bar,{childList:true});new ResizeObserver(schedule).observe(bar);bar.addEventListener('change',()=>sync(document.querySelector('.zoom-more-menu')||document.createElement('div')))}
  const more=ensureMore(bar),menu=more._menu||more.querySelector('.zoom-more-menu'),list=items(bar),beamer=document.documentElement.classList.contains('classroom-beamer');
  const sig=[bar.clientWidth,innerWidth,document.documentElement.className,...[...bar.children].map(c=>String(c.className).replace(/\s*zoom-collapsed/g,'')+':'+c.textContent.length+':'+(c.disabled?1:0))].join('#');
  if(sig===zoomSig){sync(menu);return}
  for(const el of bar.querySelectorAll('.zoom-collapsed'))el.classList.remove('zoom-collapsed');more.hidden=false;bar.classList.add('zoom-fit-row');bar.classList.remove('zoom-fit-wrap');bar.style.removeProperty('min-width');
  const over=()=>bar.scrollWidth>bar.clientWidth+1,hidden=[],pill=bar.querySelector(':scope>.si-pill');
  if(!beamer&&bar.clientWidth>0)for(const u of units(bar)){if(!over())break;for(const el of u.els)el.classList.add('zoom-collapsed');hidden.push(...u.px);
   if(pill&&[...pill.querySelectorAll(':scope>button')].every(b=>b.classList.contains('zoom-collapsed')||!b.getClientRects().length))pill.classList.add('zoom-collapsed')}
  more.hidden=!hidden.length;if(!hidden.length)close();
  if(bar.clientWidth>0&&over())bar.style.setProperty('min-width','max-content');
  hidden.sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
  const key=hidden.map(label).join('|');
  if(key!==lastKey){lastKey=key;menu.replaceChildren(...hidden.map(proxyFor))}
  sync(menu);zoomSig=sig;
 }
 let zoomSig='';
 function schedule(){if(planned)return;planned=true;requestAnimationFrame(fit)}
 document.addEventListener('pointerdown',e=>{if(open&&!e.target.closest?.('.zoom-more'))close()},true);
 document.addEventListener('keydown',e=>{if(open&&e.key==='Escape')close()});
 addEventListener('scroll',()=>{if(open)close()},true);addEventListener('resize',()=>{close();schedule()});
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 // Zustand der Originale (Einpassen gedrückt, Schalter) im Menü aktuell halten.
 document.addEventListener('click',e=>{if(e.target.closest?.('.classroom-plan-zoom'))setTimeout(()=>{const m=document.querySelector('.zoom-more-menu');if(m)sync(m)},0)},true);
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',schedule);else schedule();
 setTimeout(schedule,500);
 window.classroomFitZoomBar=fit;
})();

/* 10.55: „Mehr“ als Symbol (drei Punkte) */
(()=>{const st=document.createElement('style');st.textContent='body :is(.plan-actions-more-toggle,.zoom-more-toggle):not(#_):not(#__){display:inline-flex!important;align-items:center;justify-content:center;width:42px!important;min-width:42px!important;padding:0!important}body :is(.plan-actions-more-toggle,.zoom-more-toggle)>svg{width:22px;height:22px;flex:none}.cm-more-lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';document.head.append(st)})();

/* 10.78: alle Namen vom Plan nehmen (aktueller Raum) */
async function clearNames(){
 if(typeof gridData==='undefined')return;
 const named=v=>v&&v!=='X'&&v!=='PULT';const n=gridData.reduce((a,z)=>a+z.filter(named).length,0);
 if(!n){(window.classroomAlert||alert)('Auf dem Plan stehen keine Namen.');return}
 const ok=window.classroomConfirm?await classroomConfirm(n+' Name'+(n===1?'':'n')+' vom Plan nehmen? Die Tische bleiben stehen; Klassenliste und Bewertungen bleiben erhalten. Mit „Rückgängig“ kommen die Namen zurück.'):confirm('Alle Namen vom Plan nehmen?');
 if(!ok)return;
 merkeSitzplanFuerUndo();
 gridData=gridData.map(z=>z.map(v=>named(v)?'X':v));
 initGrid();datenSpeichern();
}

/* 12.07: Symbole ohne Beschriftung – Finger kurz halten zeigt den Namen (Menüs „…“ und Schalter „Am Platz“) */
(()=>{let t=0,tip=null,shown=false;const hide=()=>{clearTimeout(t);tip?.remove();tip=null};
 document.addEventListener('pointerdown',e=>{const b=e.target.closest?.('.zoom-more-menu>button,.plan-actions-menu .plan-actions-proxy,.si-pill>button');hide();shown=false;if(!b)return;
  t=setTimeout(()=>{const n=b.getAttribute('aria-label')||b.title;if(!n)return;shown=true;tip=document.createElement('div');tip.className='cm-hold-tip';tip.textContent=n;document.body.append(tip);const r=b.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,r.left+r.width/2-tip.offsetWidth/2))+'px';tip.style.top=Math.max(8,r.top-tip.offsetHeight-8)+'px'},450)},true);
 for(const ev of ['pointerup','pointercancel','scroll'])addEventListener(ev,()=>{clearTimeout(t);if(tip)setTimeout(hide,900)},true);
 document.addEventListener('click',e=>{if(shown&&e.target.closest?.('.zoom-more-menu>button,.plan-actions-menu .plan-actions-proxy,.si-pill>button')){e.preventDefault();e.stopPropagation();shown=false}},true);
 document.addEventListener('contextmenu',e=>{if(e.target.closest?.('.zoom-more-menu,.plan-actions-menu,.si-pill'))e.preventDefault()},true);
 const st=document.createElement('style');st.textContent='.cm-hold-tip{position:fixed;z-index:3000;padding:6px 10px;border-radius:8px;background:#243247;color:#fff;font:600 13px/1.3 Inter,system-ui,sans-serif;pointer-events:none;white-space:nowrap;box-shadow:0 6px 16px #1c2b4640}.zoom-more-menu button,.plan-actions-menu button,.si-pill>button{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}';document.head.append(st)})();
;

/* ==== sitzplan/flicker-diag.js ==== */
/* 10.32: Diagnose fürs Flackern der Knopfzeile (nur Mac/iPad-Größe). Springt „Verteilen“ ohne Fenster-Größenänderung
   mehrfach pro Sekunde hin und her, werden 0,8 s lang die DOM-Änderungen mitgeschrieben – ohne Schülernamen.
   Passiert das wiederholt, erscheint unten links ein Hinweis mit „Diagnose anzeigen“ zum Kopieren. */
(function(){
 const KEY='classroom-flicker-diag-v1';
 let lastResize=0,xs=[],lastX=null,capturing=false,lastCapture=-1e9,detections=[],toastShown=false;
 addEventListener('resize',()=>{lastResize=performance.now()});
 const desc=el=>{if(!el||el.nodeType!==1)return el?.nodeName||'?';if(el.classList?.contains('cell'))return 'cell';const c=[...el.classList].filter(x=>!/^\d/.test(x)).slice(0,3).join('.');return el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(c?'.'+c:'')};
 const short=v=>v==null?'∅':String(v).slice(0,90);
 const btn=()=>{const bar=document.querySelector('.classroom-plan-actions');if(!bar)return null;return [...bar.querySelectorAll('button')].find(b=>b.textContent.trim()==='Verteilen')||null};
 function state(){const bar=document.querySelector('.classroom-plan-actions'),g=bar?.closest('.grid-container');
  return {bar:bar?{cw:bar.clientWidth,sw:bar.scrollWidth,h:bar.offsetHeight,cls:bar.className,kids:[...bar.children].map(c=>desc(c)+':'+Math.round(c.getBoundingClientRect().width)+(getComputedStyle(c).display==='none'?'(aus)':''))}:null,
   grid:g?{cw:g.clientWidth,ow:g.offsetWidth,ch:g.clientHeight,sh:g.scrollHeight,sw:g.scrollWidth}:null,
   win:[innerWidth,innerHeight,devicePixelRatio],html:document.documentElement.className,
   finder:(()=>{const f=document.querySelector('.student-finder');return f?{open:f.dataset.open,hits:document.querySelectorAll('[data-finder-hit]').length,w:Math.round(f.getBoundingClientRect().width)}:null})()}}
 function capture(xsSeen){capturing=true;lastCapture=performance.now();const counts=new Map();
  const mo=new MutationObserver(list=>{for(const m of list){let k;if(m.type==='attributes'){const keep=m.attributeName==='class'||m.attributeName==='style'||m.attributeName==='hidden'||m.attributeName.startsWith('data-');k='attr '+m.attributeName+' @'+desc(m.target)+(keep?' | '+short(m.oldValue)+' → '+short(m.target.getAttribute(m.attributeName)):'')}
   else if(m.type==='childList')k='child @'+desc(m.target)+' +'+[...m.addedNodes].map(desc).join(',')+' -'+[...m.removedNodes].map(desc).join(',');else continue;counts.set(k,(counts.get(k)||0)+1)}});
  mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeOldValue:true});
  const before=state();
  setTimeout(()=>{mo.disconnect();capturing=false;
   const rec={t:new Date().toISOString(),v:document.querySelector('script[src*="sitzplan.js"]')?.src.split('v=')[1]||'',ua:navigator.userAgent,xs:xsSeen,guard:notes.slice(),before,after:state(),changes:[...counts].sort((a,b)=>b[1]-a[1]).slice(0,40)};
   try{const all=JSON.parse(localStorage.getItem(KEY)||'[]');all.push(rec);localStorage.setItem(KEY,JSON.stringify(all.slice(-3)))}catch{}
   const now=performance.now();detections=detections.filter(t=>now-t<90000);detections.push(now);if(detections.length>=2)toast()},800)}
 let notes=[];window.classroomFlickerNote=src=>{notes.push([new Date().toISOString().slice(11,23),src]);notes=notes.slice(-10)};
 function tick(){requestAnimationFrame(tick);if(document.hidden)return;const b=btn();if(!b||!b.getClientRects().length){lastX=null;return}
  const x=Math.round(b.getBoundingClientRect().left),now=performance.now();
  if(lastX!==null&&x!==lastX){xs.push([now,x])}lastX=x;xs=xs.filter(e=>now-e[0]<1000);
  if(xs.length>=6&&!capturing&&now-lastResize>1500&&now-lastCapture>15000){const seen=xs.map(e=>e[1]);xs=[];capture(seen)}}
 /* 11.07: Die Dauerprüfung (60× pro Sekunde, mit Neuvermessung der Seite) ist abgeschaltet – das Springen ist seit 10.32 behoben; sie kostete im Leerlauf ständig Akku. */
 function toast(){if(toastShown||document.querySelector('.fd-toast'))return;toastShown=true;
  const t=document.createElement('div');t.className='fd-toast';t.setAttribute('role','status');
  t.innerHTML='<span>Die Knopfzeile springt hin und her. Diagnose für Claude?</span><button type="button" class="fd-show">Diagnose anzeigen</button><button type="button" class="fd-x" aria-label="Schließen">×</button>';
  t.querySelector('.fd-x').onclick=()=>t.remove();t.querySelector('.fd-show').onclick=()=>{t.remove();show()};document.body.append(t)}
 function show(){const text=(()=>{try{return JSON.stringify(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch{return '[]'}})();
  const d=document.createElement('dialog');d.className='fd-dialog';
  d.innerHTML='<h3>Diagnose Knopfzeile</h3><p>Enthält keine Schülernamen – nur Breiten, Klassen und Änderungen der Seite. Kopieren und Claude schicken.</p><textarea readonly></textarea><div class="fd-row"><button type="button" class="fd-copy">Kopieren</button><button type="button" class="fd-close">Schließen</button></div>';
  const ta=d.querySelector('textarea');ta.value=text;d.querySelector('.fd-close').onclick=()=>{d.close();d.remove()};
  d.querySelector('.fd-copy').onclick=async e=>{ta.focus();ta.select();let ok=false;try{await navigator.clipboard.writeText(text);ok=true}catch{try{ok=document.execCommand('copy')}catch{}}e.target.textContent=ok?'Kopiert ✓':'Bitte ⌘C drücken'};
  document.body.append(d);d.showModal();ta.select()}
 window.classroomFlickerDiag=show;
 const st=document.createElement('style');st.textContent=
  '.fd-toast{position:fixed;left:16px;bottom:16px;z-index:9990;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);padding:8px 8px 8px 14px;background:#fff;border:1px solid #dce3ef;border-radius:12px;box-shadow:0 10px 30px #1c2b4626;font-size:14px;color:#243247}'
  +'.fd-toast button,.fd-dialog button{height:40px;border-radius:10px;border:1px solid #c9d6ea;background:#fff;color:#2f5f9b;font:inherit;font-weight:600;padding:0 14px;cursor:pointer}'
  +'.fd-toast .fd-show,.fd-dialog .fd-copy{background:#2f5f9b;border-color:#2f5f9b;color:#fff}.fd-toast .fd-x{width:40px;padding:0;font-size:20px}'
  +'.fd-dialog{width:min(560px,calc(100vw - 32px));border:0;border-radius:16px;padding:20px;box-shadow:0 20px 50px #1c2b4640}.fd-dialog h3{margin:0 0 6px}.fd-dialog p{margin:0 0 10px;color:#66758a;font-size:14px}'
  +'.fd-dialog textarea{width:100%;height:180px;box-sizing:border-box;font:12px/1.4 ui-monospace,Menlo,monospace;border:1px solid #dce3ef;border-radius:10px;padding:8px}.fd-row{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}';
 document.head.append(st);
})();
;

/* ==== sitzplan/touch-pult.js ==== */
/* Touch (iPhone/iPad): Safari meldet langes Drücken nicht als Rechtsklick und markiert stattdessen den Text unter dem Finger.
   Deshalb entscheidet die App bei Touch erst, was gemeint ist: kurz tippen = Tisch setzen/entfernen (beim Loslassen),
   Finger bewegen = Tische malen, Finger etwa 0,5 s still halten = Pult setzen/entfernen (wie Rechtsklick am Mac). Maus und Trackpad bleiben unverändert. */
(()=>{
 if(typeof beginneTischZiehen!=='function')return;
 const original=beginneTischZiehen,HOLD=500,MOVE=10;
 let pending=null;
 const clear=()=>{if(pending){clearTimeout(pending.timer);pending=null}};
 const fake=p=>({button:0,pointerType:'touch',clientX:p.x,clientY:p.y,preventDefault(){},stopPropagation(){}});
 beginneTischZiehen=function(e,r,c){
  if(e.pointerType!=='touch'||e.button!==0)return original.apply(this,arguments);
  e.preventDefault();clear();
  const cell=e.target.closest?.('.cell');
  pending={id:e.pointerId,r,c,x:e.clientX,y:e.clientY,cell,timer:setTimeout(()=>{
   const p=pending;pending=null;if(!p||!p.cell?.isConnected)return;
   // Gleicher Weg wie der Rechtsklick: Sperren (z. B. im Bewertungsmodus) gelten weiterhin.
   p.cell.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:p.x,clientY:p.y}));
  },HOLD)};
 };
 document.addEventListener('pointermove',e=>{
  if(!pending||e.pointerId!==pending.id)return;
  if(Math.hypot(e.clientX-pending.x,e.clientY-pending.y)<MOVE)return;
  const p=pending;clear();original(fake(p),p.r,p.c);   // ab jetzt normales Malen (bewegeTischZiehen)
 },{passive:true,capture:true});
 window.addEventListener('pointerup',e=>{
  if(!pending||e.pointerId!==pending.id)return;
  const p=pending;clear();original(fake(p),p.r,p.c);tischZiehenAktiv=false;tischZiehWert=null;   // kurzer Tipp
 },true);
 window.addEventListener('pointercancel',e=>{if(pending&&e.pointerId===pending.id)clear()},true);
 // Keine Textmarkierung und kein iOS-Menü beim langen Drücken im Raster
 const style=document.createElement('style');
 style.textContent='.room-grid,.room-grid .cell,.room-grid .cell *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}';
 document.head.append(style);
 // Hinweistexte für Touch-Geräte
 if(matchMedia('(pointer:coarse)').matches){
  const fix=()=>{
   const g=document.getElementById('gridInstructions');if(g&&/Rechtsklick/.test(g.textContent))g.textContent='Tippen oder ziehen: Tische setzen oder entfernen. Lange drücken: Pult setzen oder entfernen.';
   document.querySelectorAll('.info-text').forEach(el=>{if(/Rechtsklick für das Pult/.test(el.textContent))el.textContent=el.textContent.replace('Rechtsklick für das Pult','lange drücken für das Pult').replace('kurzer Klick','kurzes Tippen')});
  };
  fix();classroomOnDomChange(fix);
 }
})();
;

/* ==== sitzplan/phone-lite.js ==== */
/* iPhone hochkant: Unterricht nur zum Bewerten. Sitzplan ohne Knöpfe darüber/darunter, immer im Bewertungsmodus,
   Bewertungen sichtbar, Seitenleiste nicht einblendbar. Oben eine schmale Zeile: Datum („Heute ▾“, zum Nachtragen) und
   „Perspektive“; das Pult antippen dreht den Plan ebenfalls. Gilt auf dem iPhone hochkant und quer; Mac und iPad bleiben unverändert. */
(()=>{
 const PH=matchMedia('(max-width:540px) and (orientation:portrait) and (pointer:coarse)'),PL=matchMedia('(max-height:500px) and (orientation:landscape) and (pointer:coarse)');
 /* iPhone hochkant und quer gleich; ein ausgeblendeter Rahmen (0 px) gilt nie als iPhone */
 const isPhone=()=>(PH.matches&&innerWidth>=280&&innerHeight>=300)||(PL.matches&&innerWidth>=400&&innerHeight>=150);
 const grid=document.getElementById('roomGrid');if(!grid||typeof classroomDate==='undefined')return;
 const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
 const dateLabel=v=>{const t=new Date(),today=iso(t),y=new Date(t);y.setDate(t.getDate()-1);if(v===today)return 'Heute';if(v===iso(y))return 'Gestern';const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');if(!m)return 'Datum';const d=new Date(+m[1],+m[2]-1,+m[3]);return ['So','Mo','Di','Mi','Do','Fr','Sa'][d.getDay()]+', '+m[3]+'.'+m[2]+'.'};
 const bar=document.createElement('div');bar.className='pl-seatbar';
 bar.innerHTML='<label class="pl-date" role="button" tabindex="0" aria-label="Datum wählen"><span class="pl-date-text">Heute</span><span class="pl-chev">▾</span></label><span class="pl-dnav" role="group" aria-label="Zwischen Unterrichtsstunden wechseln"><button type="button" class="pl-dstep" data-dir="prev" aria-label="Vorige Stunde mit Unterricht">‹</button><button type="button" class="pl-dtoday" aria-label="Zurück zu heute"><i aria-hidden="true"></i></button><button type="button" class="pl-dstep" data-dir="next" aria-label="Nächste Stunde mit Unterricht">›</button></span><div class="cd-pop pl-cal" role="dialog" aria-label="Kalender" hidden></div><button type="button" class="pl-rotate" aria-pressed="false" data-short="P"><span aria-hidden="true">⇅</span> Perspektive</button>';
 const dateInput={value:''},/* 9.03: eigener Kalender statt iOS-Datumswahl */dateText=bar.querySelector('.pl-date-text'),rotateBtn=bar.querySelector('.pl-rotate');
 const syncDate=()=>{dateInput.value=classroomDate.value;dateText.textContent=dateLabel(classroomDate.value);{const l=dateText.textContent;bar.querySelector('.pl-date').dataset.short=l==='Heute'?'H':l==='Gestern'?'G':(/(\d+)\./.exec(l)?.[1]||'D').replace(/^0/,'')}bar.querySelector('.pl-date').classList.toggle('is-past',classroomDate.value!==iso(new Date()))};
 {const nav=()=>window.classroomDateNav,cal=bar.querySelector('.pl-cal'),dl=bar.querySelector('.pl-date');
  dl.addEventListener('click',e=>{e.preventDefault();nav()?.toggle(cal,bar)});dl.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();nav()?.toggle(cal,bar)}});
  bar.querySelectorAll('.pl-dstep').forEach(b=>b.onclick=()=>nav()?.[b.dataset.dir]());bar.querySelector('.pl-dtoday').onclick=()=>nav()?.today();
  const syncNav=()=>{const s=nav()?.state();if(!s)return;bar.querySelector('[data-dir="prev"]').disabled=!s.prev;bar.querySelector('[data-dir="next"]').disabled=!s.next;bar.querySelector('.pl-dtoday').disabled=s.isToday};
  const wait=setInterval(()=>{if(nav()){clearInterval(wait);nav().onChange(()=>{syncNav();syncDate()});syncNav()}},200);setTimeout(()=>clearInterval(wait),10000)}
 classroomDate.addEventListener('change',syncDate);
 const rotate=()=>{const b=document.getElementById('classroomRotateButton');if(!b)return;b.click();setTimeout(syncRotate,0)};
 const syncRotate=()=>rotateBtn.setAttribute('aria-pressed',document.getElementById('classroomRotateButton')?.getAttribute('aria-pressed')||'false');
 rotateBtn.onclick=rotate;
 // Pult antippen = Perspektive wechseln (nur im Bewertungsmodus auf dem iPhone)
 document.addEventListener('click',e=>{if(!document.documentElement.classList.contains('ph-lite'))return;const c=e.target.closest?.('.room-grid .cell.pult');if(!c||document.getElementById('classroomEditRoom')?.checked)return;e.preventDefault();e.stopPropagation();rotate()},true);
 function ensure(){
  const on=isPhone();document.documentElement.classList.toggle('ph-lite',on);if(!on)return;
  if(bar.nextElementSibling!==grid)grid.before(bar);
  const edit=document.getElementById('classroomEditRoom');if(edit?.checked)edit.click();
  const assess=document.querySelector('.plan-assess-switch input');if(assess&&!assess.checked)assess.click();
  const sidebar=document.querySelector('.container');if(sidebar&&!sidebar.classList.contains('sidebar-collapsed')){const t=document.querySelector('.classroom-sidebar-toggle');if(t&&t.getAttribute('aria-expanded')==='true')t.click()}
  syncDate();syncRotate();
 }
 PH.addEventListener?.('change',ensure);PL.addEventListener?.('change',ensure);addEventListener('resize',()=>{if(isPhone()!==document.documentElement.classList.contains('ph-lite'))ensure()});
 if(typeof classroomHooks!=='undefined')classroomHooks.add('initGrid','phone-lite: Bewertungsansicht',{after(){setTimeout(ensure,0)}});
 setTimeout(ensure,300);setTimeout(ensure,1500);
 const st=document.createElement('style');st.textContent='.pl-seatbar{display:none}'
  +'@media (max-width:540px) and (orientation:portrait) and (pointer:coarse),(max-height:500px) and (orientation:landscape) and (pointer:coarse){'
  +'html.ph-lite .room-header,html.ph-lite #gridInstructions,html.ph-lite .classroom-plan-zoom,html.ph-lite .classroom-plan-actions,html.ph-lite .classroom-sidebar-toggle,html.ph-lite .classroom-mode-toggle,html.ph-lite .student-search,html.ph-lite .grid-save-button{display:none!important}'
  +'html.ph-lite .pl-seatbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 10px}'
  +'.pl-date{position:relative;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border:1px solid #cbd6e5;border-radius:18px;background:#fff;color:#243247;font-size:14.5px;font-weight:650}'
  +'.pl-date.is-past{background:#fff7e8;border-color:#e9cfa5;color:#8a5a12}.pl-chev{font-size:11px;color:#8794a7}'
  +'.pl-date input{position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0;margin:0;font-size:16px}'
  +'.pl-rotate{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border:1px solid #cbd6e5;border-radius:18px;background:#fff;color:#2f5f9b;font:inherit;font-size:14px;font-weight:650;cursor:pointer}'
  +'.pl-rotate[aria-pressed=true]{background:#eaf0fa;border-color:#8fb0dc}.pl-rotate span{font-size:15px}'
  +'html.ph-lite .room-grid .cell.pult{cursor:pointer}'
  +'}';
 document.head.append(st);
})();
/* 8.57: iPhone quer – Datum („Heute“/„Gestern“) und „Perspektive“ untereinander rechts neben dem Plan, gleich breit; der Plan bekommt die volle Höhe */
(()=>{const st=document.createElement('style');st.textContent='@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){html.ph-lite .grid-container:has(>.pl-seatbar){display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:12px;align-items:start}html.ph-lite .grid-container>.pl-seatbar{grid-column:2;grid-row:1;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-start;gap:8px;margin:0;width:auto}html.ph-lite .grid-container>.pl-seatbar>*{box-sizing:border-box;width:100%;min-width:0;margin:0;justify-content:center}html.ph-lite .grid-container>#roomGrid{grid-column:1;grid-row:1;min-width:0}}';document.head.append(st)})();
/* 8.58: „Heute“ und „Perspektive“ gleich gestaltet (Höhe, Schrift, Farbe, Abstand); ein anderer Tag bleibt orange */
(()=>{const st=document.createElement('style');st.textContent='html.ph-lite .pl-seatbar>:is(.pl-date,.pl-rotate):not(#_):not(#__){box-sizing:border-box!important;height:36px!important;min-height:36px!important;padding:0 14px!important;font-size:14px!important;font-weight:500!important;color:#2f5f9b!important;border:1px solid #dce3ef!important;border-radius:18px!important;background:#fff!important;display:inline-flex!important;align-items:center;gap:6px;line-height:1}html.ph-lite .pl-seatbar>.pl-date.is-past:not(#_):not(#__){background:#fff7e8!important;border-color:#e9cfa5!important;color:#8a5a12!important}';document.head.append(st)})();

/* 8.59: iPhone quer – reicht die Breite nicht, werden die Knöpfe klein (▾ H/G bzw. ⇅ P), damit der Sitzplan größer wird (gesteuert von plan-zoom.js). */
(()=>{const st=document.createElement('style');const X='html.ph-lite .grid-container>.pl-seatbar.pl-compact>:is(.pl-date,.pl-rotate)';st.textContent='@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){'+X+'{width:52px;min-width:52px;padding:0;gap:0;justify-content:center;font-size:0}'+X+'>.pl-date-text{display:none}'+X+'>.pl-chev{font-size:11px;color:inherit;margin-left:5px}'+X+'>span[aria-hidden]{font-size:15px;margin-right:5px}'+X+':is(.pl-date)::before,'+X+':is(.pl-rotate)::after{content:attr(data-short);font-size:15px;font-weight:600;line-height:1}}';document.head.append(st)})();
/* 8.63: iPhone quer – oberste Tischreihe auf Höhe des Datumsknopfs (weniger Rand oben). */
(()=>{const st=document.createElement('style');st.textContent='@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){html.ph-lite .grid-container:has(>.pl-seatbar)>#roomGrid:not(#_):not(#__){margin-top:-5px!important}}';document.head.append(st)})();
/* 8.64: iPhone – Tische bündig mit den Knöpfen; „2/3“-Plaketten am Rand dürfen überstehen. */
(()=>{const st=document.createElement('style');st.textContent='html.ph-lite #roomGrid .classroom-plan-scroll{overflow:visible}';document.head.append(st)})();
/* 8.66: iPhone quer – Sitzplan und Eingabe als zwei gleich hohe Karten, Knöpfe in Pillenform wie „H“/„P“ (Vorschlag B). */
(()=>{const st=document.createElement('style');const Q='html.ph-lite body .classroom-quick.is-sheet',K=':not(#_):not(#__)';
st.textContent='@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){'
 +'html.ph-lite body:has(.classroom-quick.is-sheet)'+K+'{padding-right:338px!important}'+'html.ph-lite body:has(.classroom-quick.is-sheet) .grid-container'+K+'{height:calc(100vh - 14px)!important;box-sizing:border-box!important}'
 +Q+K+'{top:0!important;bottom:auto!important;height:calc(100vh - 14px)!important;right:8px!important;width:322px!important;border:1px solid #dce3ef!important;border-radius:18px!important;box-shadow:none!important;box-sizing:border-box!important;display:flex!important;flex-direction:column;justify-content:space-between;padding:12px;overflow:auto}'
 +Q+' .cq-nav'+K+'{padding:0;margin:0;position:static;background:none!important;border:0!important;width:100%!important;box-sizing:border-box!important;display:flex!important;gap:8px!important}'
 +Q+' .cq-nav>button'+K+'{flex:1 1 0!important;margin:0!important;width:auto;min-width:0}'
 +Q+' .classroom-rating-choice'+K+'{height:44px;border-radius:10px}'
 +Q+' :is(#classroomQuickHomeworkButton,#classroomQuickMaterialButton,.cq-nav button)'+K+'{height:36px;border-radius:18px;font-size:14px!important;font-weight:500!important;box-shadow:none!important}'
 +Q+' :is(#classroomQuickHomeworkButton,#classroomQuickMaterialButton):not([aria-pressed=true])'+K+','+Q+' .cq-nav button:not(.cq-next)'+K+'{background:#fff!important;border:1px solid #dce3ef!important;color:#2f5f9b!important}'
 +Q+' #classroomQuickName'+K+'{font-size:16px!important}'
 +'}';document.head.append(st)})();
/* 8.67: iPhone quer – während der Eingabe sind „H“/„P“ ausgeblendet, die Tische bekommen die ganze Kartenbreite. */
(()=>{const st=document.createElement('style');st.textContent='@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){html.ph-lite body:has(.classroom-quick.is-sheet) .grid-container>.pl-seatbar:not(#_):not(#__):not(#___){display:none!important}html.ph-lite body:has(.classroom-quick.is-sheet) .grid-container:has(>.pl-seatbar):not(#_):not(#__){grid-template-columns:minmax(0,1fr)!important;column-gap:0!important}}';document.head.append(st)})();
// 8.96: iPhone hochkant – Unterrichtsfenster wie die Noten-Karte: 6 px Rand, gleiche Rundung, füllt die Höhe bis zur Leiste.
(()=>{const st=document.createElement('style');st.textContent='@media (max-width:540px) and (orientation:portrait) and (pointer:coarse){html.ph-lite body:not(#_){padding:6px!important}html.ph-lite .grid-container:not(#_){border-radius:20px;min-height:calc(100dvh - 12px);box-sizing:border-box}}';document.head.append(st)})();
/* 9.03: iPhone – Datum wie am Mac: [Datum ▾] [‹ ◉ ›], Tipp aufs Datum öffnet den Kalender mit markierten Stunden; „Perspektive“ hochkant nur als ⇅ */
(()=>{const st=document.createElement('style');st.textContent='html.ph-lite .pl-seatbar{position:relative}'
 +'html.ph-lite .pl-seatbar>.pl-date:not(#_):not(#__){white-space:nowrap;cursor:pointer}'
 +'html.ph-lite .pl-seatbar>.pl-dnav{flex:none;display:inline-flex;box-sizing:border-box;height:36px;border:1px solid #dce3ec;border-radius:18px;overflow:hidden;background:#fff}'
 +'html.ph-lite .pl-dnav>button{width:38px;height:34px;padding:0;border:0;background:#fff;color:#2f5f9b;font:inherit;font-size:19px;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}'
 +'html.ph-lite .pl-dnav>button+button{border-left:1px solid #dce3ec}html.ph-lite .pl-dnav>button:disabled{color:#b8c3d2}'
 +'html.ph-lite .pl-dnav .pl-dtoday i{width:13px;height:13px;border-radius:50%;border:2px solid currentColor;position:relative;box-sizing:border-box}html.ph-lite .pl-dnav .pl-dtoday i:after{content:"";position:absolute;inset:2px;border-radius:50%;background:currentColor}'
 +'html.ph-lite .pl-seatbar>.pl-cal:not(#_){top:calc(100% + 6px);left:0;z-index:80}'
 +'@media (max-width:540px) and (orientation:portrait) and (pointer:coarse){html.ph-lite .pl-seatbar>.pl-rotate:not(#_):not(#__):not(#___){font-size:0!important;width:44px!important;min-width:44px!important;padding:0!important;justify-content:center}html.ph-lite .pl-seatbar>.pl-rotate>span{font-size:18px}}'
 +'@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){html.ph-lite .pl-seatbar>.pl-dnav{align-self:center}html.ph-lite .pl-seatbar>.pl-cal:not(#_):not(#__){position:fixed;top:50%;left:50%;width:300px!important;min-width:0!important;height:auto!important;transform:translate(-50%,-50%) scale(.92);max-height:96vh;overflow:auto}}';
 document.head.append(st)})();
/* 9.12: iPhone quer – ‹ ◉ › nur hochkant (quer rutschten sie bei breiten Plänen hinter die Tische); Kalender per Tipp aufs Datum bleibt */
(()=>{const st=document.createElement('style');st.textContent='@media (max-height:500px) and (orientation:landscape) and (pointer:coarse){html.ph-lite .pl-seatbar>.pl-dnav{display:none!important}}';document.head.append(st)})();
/* 9.28: iPhone quer – die Tische bekommen die volle Breite; Datum, ‹ ◉ › und Perspektive liegen hinter dem runden Knopf „⋯“ unten rechts.
   Ein Tipp öffnet die kleine Leiste, ein zweiter Tipp oder ein Tipp daneben schließt sie. Das Datum steht dort kurz als „7.11.“. */
(()=>{const start=()=>{const bar=document.querySelector('.pl-seatbar');if(!bar)return false;const date=bar.querySelector('.pl-date');
 const dm=document.createElement('span');dm.className='pl-date-dm';date?.prepend(dm);
 const sync=()=>{const v=(typeof classroomDate!=='undefined'&&classroomDate.value)||'',m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v);const t=m?(+m[3])+'.'+(+m[2])+'.':'Datum';if(dm.textContent!==t)dm.textContent=t};
 sync();try{classroomDate.addEventListener('change',sync);classroomDate.addEventListener('input',sync);/* 12.55: auch beim Setzen per Programm (‹ ›, Verlauf) sofort – statt alle 2 Sekunden nachzusehen *//* auf eine schon vorhandene Hülle (Datumsleiste) aufsetzen */const D=Object.getOwnPropertyDescriptor(classroomDate,'value')||Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');Object.defineProperty(classroomDate,'value',{configurable:true,get(){return D.get.call(this)},set(v){D.set.call(this,v);sync()}})}catch{}
 const more=document.createElement('button');more.type='button';more.className='pl-more';more.textContent='⋯';more.setAttribute('aria-label','Datum und Perspektive');more.setAttribute('aria-expanded','false');document.body.append(more);
 const set=on=>{document.documentElement.classList.toggle('pl-more-open',on);more.setAttribute('aria-expanded',String(on))};
 more.onclick=e=>{e.stopPropagation();set(!document.documentElement.classList.contains('pl-more-open'))};
 /* Schließen nur bei einem Tipp außerhalb; der Pfad wird beim Antippen gelesen, weil sich ‹ ◉ › danach neu aufbauen */const outside=e=>{if(!document.documentElement.classList.contains('pl-more-open'))return;if(e.composedPath().some(n=>n.nodeType===1&&n.matches?.('.pl-seatbar,.pl-more,.pl-cal,.cd-pop')))return;set(false)};for(const t of ['pointerdown','touchstart','mousedown'])window.addEventListener(t,outside,{capture:true,passive:true});
 const L='@media (max-height:500px) and (orientation:landscape) and (pointer:coarse)',B='html.ph-lite .grid-container>.pl-seatbar';
 const st=document.createElement('style');st.textContent='.pl-more,.pl-date-dm{display:none}'+L+'{'
  +'html.ph-lite .grid-container:has(>.pl-seatbar):not(#_):not(#__){grid-template-columns:minmax(0,1fr)!important;column-gap:0!important}'
  +B+':not(#_):not(#__):not(#___){position:fixed!important;right:62px;bottom:10px;z-index:60;display:none!important;flex-direction:row!important;align-items:center!important;gap:8px!important;width:auto!important;margin:0!important;padding:8px!important;background:#fff;border:1px solid #dce3ec;border-radius:16px;box-shadow:0 8px 24px #233d6033}'
  +'html.ph-lite.pl-more-open .grid-container>.pl-seatbar:not(#_):not(#__):not(#___){display:flex!important}'
  +B+'>:is(.pl-date,.pl-rotate):not(#_):not(#__):not(#___){width:auto!important;min-width:0!important;padding:0 14px!important;font-size:14px!important;gap:6px!important}'
  +B+'>.pl-date>:is(.pl-date-text,.pl-chev):not(#_){display:none!important}'+B+'>.pl-date>.pl-date-dm{display:inline;font-size:14px;font-weight:600}'
  +B+'>.pl-dnav:not(#_):not(#__):not(#___){display:inline-flex!important;width:auto!important}'+B+'>.pl-dnav>button{width:38px}'
  +'html.ph-lite .pl-more{display:flex;position:fixed;right:10px;bottom:10px;z-index:61;width:44px;height:44px;align-items:center;justify-content:center;border:1px solid #cbd6e5;border-radius:22px;background:#fff;color:#2f5f9b;font:inherit;font-size:22px;line-height:1;box-shadow:0 4px 12px #233d6026;cursor:pointer}'
  +'html.ph-lite.pl-more-open .pl-more{background:#eaf1fb}'
  +'html.ph-lite body:has(.classroom-quick.is-sheet) .pl-more{display:none}}';
 document.head.append(st);return true};
 /* die Leiste wird erst eingesetzt, wenn das iPhone erkannt ist */const t=setInterval(()=>{if(start())clearInterval(t)},300);setTimeout(()=>clearInterval(t),30000);
})();
;

/* ==== sitzplan/quick-note.js ==== */
/* 9.44: Bewertungsfenster – unten zwei Knöpfe wie „Hausaufgabe fehlt / Material fehlt“: „Abwesend“ (aktiv rot) und „Notiz“.
   „Notiz“ klappt ein Textfeld auf (dieselbe Notiz wie auf dem iPhone unter „Noten“, je Fach und Klasse). Ist schon eine Notiz da,
   zeigt der Knopf „Notiz •“ und das Feld ist gleich offen. Der frühere Haken „Abwesend“ bleibt unsichtbar und wird weiter ausgelöst. */
(()=>{
 const box=document.querySelector('.classroom-quick'),absent=document.getElementById('classroomQuickAbsent'),label=absent?.closest('label');if(!box||!absent||!label)return;
 const notes=()=>{try{return parent.document.getElementById('view-noten')?.contentWindow?.classroomStudentNotes||null}catch{return null}};
 const row=document.createElement('div');row.className='classroom-quick-top cq-bottom';
 const ab=document.createElement('button');ab.type='button';ab.className='cq-abs';ab.textContent='Abwesend';ab.setAttribute('aria-pressed','false');
 const nb=document.createElement('button');nb.type='button';nb.className='cq-note';nb.textContent='Notiz';nb.setAttribute('aria-expanded','false');
 const ta=document.createElement('textarea');ta.className='cq-note-text';ta.rows=3;ta.maxLength=500;ta.placeholder='z. B. Elterngespräch, Nachschreibtermin …';ta.hidden=true;
 row.append(ab,nb);label.after(row,ta);label.hidden=true;
 /* 13.18: iPhone – statt „Notiz“ ein Dreifachschalter ‹ zurück · › weiter · ⇅ Perspektive; die Leiste „Zurück / Weiter“ entfällt dort (iPad und Mac unverändert) */
 {const sv=d=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>';
  const seg=document.createElement('div');seg.className='cq-seg';seg.setAttribute('role','group');seg.setAttribute('aria-label','Platz wechseln');
  seg.innerHTML='<button type="button" data-sg="-1" aria-label="Voriger Platz">'+sv('M15 6l-6 6 6 6')+'</button><button type="button" data-sg="1" class="cq-sg-next" aria-label="Nächster Platz">'+sv('M9 6l6 6-6 6')+'</button><button type="button" data-sg="r" aria-label="Perspektive drehen">'+sv('M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4')+'</button>';
  row.append(seg);const navB=k=>document.querySelector('.cq-nav [data-step="'+k+'"]');
  seg.onclick=e=>{const b=e.target.closest('[data-sg]');if(!b||b.disabled)return;e.stopPropagation();if(b.dataset.sg==='r'){document.querySelector('.pl-rotate')?.click();return}navB(b.dataset.sg)?.click()};
  const sync=()=>{for(const k of ['-1','1']){const o=navB(k),m=seg.querySelector('[data-sg="'+k+'"]');if(o&&m&&m.disabled!==o.disabled)m.disabled=o.disabled}};
  const nav=document.querySelector('.cq-nav');if(nav)new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['disabled']});sync();
  const st=document.createElement('style');st.textContent='.cq-seg{display:none}html.ph-lite .classroom-quick .cq-note:not(#_):not(#__),html.ph-lite .classroom-quick .cq-note-text:not(#_):not(#__),html.ph-lite .classroom-quick .cq-nav:not(#_):not(#__):not(#___){display:none!important}'
   +'html.ph-lite .classroom-quick .cq-seg:not(#_){display:flex;flex:1 1 0;min-width:0;border:1px solid #c9d5e6;border-radius:18px;overflow:hidden;background:#fff}'
   +'html.ph-lite .classroom-quick .cq-seg>button:not(#_):not(#__){flex:1 1 0;min-width:0;height:auto;min-height:40px;margin:0;padding:0;border:0;border-radius:0;background:#fff;color:#2f5f9b;display:grid;place-items:center;box-shadow:none}'
   +'html.ph-lite .classroom-quick .cq-seg>button+button:not(#_):not(#__){border-left:1px solid #dce3ef}html.ph-lite .classroom-quick .cq-seg>.cq-sg-next:not(#_):not(#__){background:#2f5f9b;color:#fff}'
   +'html.ph-lite .classroom-quick .cq-seg>button:disabled:not(#_):not(#__){opacity:.4}';document.head.append(st)}
 const person=()=>box.title||document.getElementById('classroomQuickName')?.textContent||'';
 let shownFor=null;
 const syncAbs=()=>ab.setAttribute('aria-pressed',String(absent.checked));
 const syncNote=open=>{const n=notes(),t=n?n.get(person()):'';nb.disabled=!n;nb.title=n?'Notiz zu dieser Person (wie auf dem iPhone unter „Noten“)':'Notizen sind verfügbar, sobald der Noten-Manager geladen ist.';
  nb.textContent=t?'Notiz •':'Notiz';if(open!==undefined){ta.hidden=!open;nb.setAttribute('aria-expanded',String(open))}if(document.activeElement!==ta)ta.value=t};
 ab.onclick=()=>{absent.click();syncAbs()};absent.addEventListener('change',syncAbs);
 nb.onclick=()=>{const open=ta.hidden;syncNote(open);if(open)ta.focus()};
 const save=()=>{const n=notes();if(!n)return;n.set(person(),ta.value);nb.textContent=ta.value.trim()?'Notiz •':'Notiz'};
 ta.addEventListener('input',()=>{clearTimeout(ta._t);ta._t=setTimeout(save,400)});ta.addEventListener('change',save);ta.addEventListener('blur',save);
 ta.addEventListener('keydown',e=>e.stopPropagation());
 // Beim Öffnen des Fensters (neue Person) Zustand übernehmen
 new MutationObserver(()=>{if(box.hidden){if(shownFor!==null&&!ta.hidden)save();shownFor=null;return}const p=person();if(p===shownFor)return;shownFor=p;syncAbs();const n=notes();syncNote(!!(n&&n.get(p)))}).observe(box,{attributes:true,attributeFilter:['hidden','title']});
 const st=document.createElement('style');st.textContent=`
 .classroom-quick .cq-bottom{margin:14px 0 0;padding-top:12px;}
 .classroom-quick .cq-bottom>button{flex:1 1 0;min-width:0;padding:9px 8px;font:inherit;font-size:15px;line-height:1.3;white-space:nowrap;text-align:center;border:1px solid #d5deea;border-radius:10px;background:#f6f8fc;color:#2f5f9b;cursor:pointer}
 .classroom-quick .cq-abs[aria-pressed=true]{background:#fdecea;border-color:#e6a8a1;color:#b0453c;font-weight:650}
 .classroom-quick .cq-note[aria-expanded=true]{background:#eaf1fb;border-color:#9fb8da}
 .classroom-quick .cq-note:disabled{opacity:.5;cursor:default}
 .classroom-quick .cq-note-text{display:block;box-sizing:border-box;width:100%;margin:10px 0 0;padding:8px 10px;border:1px solid #efcf9c;border-radius:10px;background:#fffdf6;font:inherit;font-size:14px;resize:vertical;color:#243247}
 .classroom-quick .cq-note-text[hidden]{display:none}
 body[data-module] .classroom-quick .classroom-quick-absence[hidden]:not(#_){display:none!important}
 .classroom-quick:has(.cq-note-text:not([hidden])) .sn-quick{display:none}
 .classroom-quick .cq-bottom{border-top:1px solid var(--line,#dbe3ef)}
 .classroom-quick.is-sheet .cq-bottom{margin-top:6px;padding-top:8px}`;document.head.append(st);
})();
;

/* ==== sitzplan/orga-seat.js ==== */
/* 9.99: Organisation am Sitzplatz – solange in einer Liste der Klasse (Noten-Manager › Organisation) noch etwas offen ist,
   zeigt das Bewertungsfenster je Liste einen Knopf („Exkursion Köln: offen“ / „✓ 15 €“). Antippen hakt ab bzw. nimmt zurück. */
(()=>{
 const KEY='notenrechner-organisation-v1';
 const load=()=>{try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');s.classes??={};return s}catch{return {classes:{}}}};
 const store=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
 const eur=v=>(Math.round(Number(v)*100)/100).toLocaleString('de-DE',{maximumFractionDigits:2})+' €';
 const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function cell(l,e){if(e?.s==='ex')return 'ex';if(l.type==='money'){const v=Number(e?.v)||0;return v<=0?'open':v+1e-9>=Number(l.amount||0)?'ok':'part'}return e?.s==='ok'?'ok':'open'}
 const quick=document.querySelector('.classroom-quick');if(!quick)return;
 const box=document.createElement('div');box.className='qe-orga';box.hidden=true;
 (document.getElementById('classroomQuickGrade')||quick.lastElementChild)?.after(box);
 function draw(){let g=null,p=null;try{g=classroomCurrentGroup();p=typeof quickPerson!=='undefined'?quickPerson:null}catch{}
  const c=g&&load().classes[g.id];const people=g?.students?.filter(s=>!s.deleted)||[];
  const lists=(c?.lists||[]).filter(l=>people.some(x=>{const st=cell(l,c.entries?.[l.id]?.[x.id]);return st==='open'||st==='part'})||c.entries?.[l.id]?.[p?.id]);
  if(!p||!lists.length){box.hidden=true;box.innerHTML='';return}
  box.hidden=false;box.innerHTML=lists.map(l=>{const e=c.entries?.[l.id]?.[p.id],st=cell(l,e),txt=st==='ok'?'✓ '+(l.type==='money'?eur(e.v):'erledigt'):st==='part'?eur(e.v)+' von '+eur(l.amount):st==='ex'?'befreit':'offen';
   return `<button type="button" class="qe-orga-b qe-orga-${st}" data-l="${esc(l.id)}" ${st==='ex'||st==='part'?'title="Im Noten-Manager › Organisation ändern"':''}><span>${esc(l.name)}</span><b>${txt}</b></button>`}).join('');
  box.querySelectorAll('[data-l]').forEach(b=>b.onclick=e=>{e.stopPropagation();const s=load(),cc=s.classes[g.id],l=cc?.lists.find(x=>x.id===b.dataset.l);if(!l)return;cc.entries??={};cc.entries[l.id]??={};const cur=cc.entries[l.id][p.id],st=cell(l,cur);
   if(st==='ex'||st==='part')return;if(st==='ok'){if(cur?.note)cc.entries[l.id][p.id]={note:cur.note};else delete cc.entries[l.id][p.id]}else cc.entries[l.id][p.id]={...(cur||{}),s:'ok',...(l.type==='money'?{v:Number(l.amount)||0}:{})};store(s);draw()})}
 if(typeof qeAfterOpen==='function'){const orig=qeAfterOpen;qeAfterOpen=function(...a){try{draw()}catch(e){console.warn(e)}return orig.apply(this,a)}}
 new MutationObserver(()=>{if(!quick.hidden)try{draw()}catch{}}).observe(quick,{attributes:true,attributeFilter:['hidden']});
 const st=document.createElement('style');st.textContent=`
 .qe-orga{display:flex;flex-direction:column;gap:6px;margin:8px 0 2px}.qe-orga[hidden]{display:none}
 .qe-orga-b{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:38px;padding:0 12px;border-radius:10px;border:1px dashed #c6d1df;background:#f6f8fb;color:#4a5a70;font:inherit;font-size:13.5px;cursor:pointer;text-align:left}
 .qe-orga-b span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qe-orga-b b{flex:none}
 .qe-orga-ok{border-style:solid;border-color:#bfe0c9;background:#e7f6ed;color:#1d6b3a}.qe-orga-part{border-style:solid;border-color:#f0d9a8;background:#fff8e2;color:#8a5a12}.qe-orga-ex{opacity:.6}
 html.classroom-beamer .qe-orga{display:none!important}`;document.head.append(st);
})();
;

/* ==== sitzplan/mode-edit.js ==== */
/* 9.44: Bewerten ist der Normalzustand. Statt des Schalters „Bewertungs-/Sitzplanmodus“ gibt es den Knopf „Sitzplan bearbeiten“;
   im Bearbeiten-Modus erscheint über dem Plan eine orange Leiste mit „Tischanordnung …“ und „Fertig“. Der bisherige Schalter
   (#classroomEditRoom) bleibt unsichtbar im Dokument und wird weiter ausgelöst – alle anderen Teile reagieren wie bisher. */
(()=>{
 const edit=()=>document.getElementById('classroomEditRoom');if(!edit())return;
 const PEN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 const btn=document.createElement('button');btn.type='button';btn.className='mode-edit-btn';btn.innerHTML=PEN+'<span>Sitzplan bearbeiten</span>';btn.title='Tische setzen oder entfernen, Pult festlegen, Tischanordnung wählen';
 const bar=document.createElement('div');bar.className='mode-edit-bar';bar.hidden=true;bar.setAttribute('role','status');
 bar.innerHTML='<span class="meb-text">'+PEN+' <b>Sitzplan bearbeiten</b> · Feld antippen setzt oder entfernt einen Tisch · '+(matchMedia('(pointer:coarse)').matches?'lange drücken = Pult':'Rechtsklick = Pult')+'</span><span class="meb-actions"><button type="button" class="meb-layout">Tischanordnung …</button><button type="button" class="meb-cancel" hidden>Abbrechen</button><button type="button" class="meb-done">Fertig</button></span>';
 const set=on=>{const e=edit();if(e.checked!==on){e.checked=on;e.dispatchEvent(new Event('change',{bubbles:true}))}sync()};
 btn.onclick=()=>set(true);
 /* 9.50: Ist die Tischanordnungs-Auswahl offen, übernimmt „Fertig“ die gewählte Anordnung (früher „Anwenden“ ganz unten); „Abbrechen“ schließt sie ohne Änderung. */
 const layoutOpen=()=>{const v=document.getElementById('layoutView');let m='layouts';try{m=layoutViewMode}catch{}return !!v&&!v.hidden&&m!=='groups'};
 bar.querySelector('.meb-done').onclick=async()=>{if(layoutOpen()){const ap=document.getElementById('applyLayoutButton');if(ap&&!ap.disabled){await wendeTischanordnungAn();if(layoutOpen())return}else{try{zeigeSitzplan()}catch{}}}set(false)};
 bar.querySelector('.meb-cancel').onclick=()=>{try{zeigeSitzplan()}catch{}sync()};
 bar.querySelector('.meb-layout').onclick=()=>{document.getElementById('layoutToggleButton')?.click();setTimeout(sync,30)};
 function place(){const head=document.querySelector('.room-header'),box=head?.querySelector('.room-head-actions')||head;if(box&&btn.parentElement!==box)box.append(btn);
  const help=head?.nextElementSibling?.classList.contains('info-text')?head.nextElementSibling:head;if(help&&help.nextElementSibling!==bar)help.after(bar);sync()}
 function sync(){const on=!!edit()?.checked;{const lo=on&&layoutOpen(),c=bar.querySelector('.meb-cancel');if(c.hidden===lo)c.hidden=!lo;document.documentElement.classList.toggle('meb-layout-open',lo)}if(bar.hidden===on)bar.hidden=!on;if(btn.hidden!==on)btn.hidden=on;document.documentElement.classList.toggle('mode-editing',on);
  const help=document.querySelector('.room-header+.info-text');const t='Namen antippen öffnet die Bewertung · Namen ziehen verschiebt oder tauscht Plätze. Tische setzt du über „Sitzplan bearbeiten“.';if(help&&!on&&help.textContent!==t&&/Bewertungsmodus|Sitzplanmodus|Tische setzen oder entfernen/.test(help.textContent))help.textContent=t}
 document.addEventListener('change',e=>{if(e.target?.id==='classroomEditRoom')sync()});
 if(typeof classroomOnDomChange==='function')classroomOnDomChange(place);place();setTimeout(place,600);
 const st=document.createElement('style');st.textContent=`
 body[data-module=sitzplan] .room-header .classroom-mode-toggle:not(#_){display:none!important}
 body[data-module=sitzplan] .room-head-actions>.room-head-layout:not(#_){display:none!important}
 .mode-edit-btn{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 16px;border:1px solid #cbd6e5;border-radius:10px;background:#fff;color:#2f5f9b;font:inherit;font-size:14.4px;cursor:pointer;white-space:nowrap}
 .mode-edit-btn[hidden]{display:none}.mode-edit-btn svg,.mode-edit-bar svg{width:17px;height:17px}
 .mode-edit-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:0 0 12px;padding:8px 10px 8px 14px;border:1px solid #efcf9c;border-radius:12px;background:#fff7e8;color:#8a5a12;font-size:14px}
 .mode-edit-bar[hidden]{display:none}.mode-edit-bar .meb-text{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap}
 .mode-edit-bar .meb-actions{display:flex;gap:8px}.mode-edit-bar button{height:36px;padding:0 14px;border:1px solid #cbd6e5;border-radius:10px;background:#fff;color:#2f5f9b;font:inherit;font-size:14px;cursor:pointer}
 .mode-edit-bar .meb-done{background:#2f5f9b;border-color:#2f5f9b;color:#fff;font-weight:600}
 html.meb-layout-open #applyLayoutButton{display:none!important}.mode-edit-bar .meb-cancel[hidden]{display:none}
 html.ph-lite .mode-edit-btn,html.ph-lite .mode-edit-bar{display:none!important}
 html.classroom-beamer .mode-edit-btn,html.classroom-beamer .mode-edit-bar{display:none!important}`;document.head.append(st);
})();
;

/* ==== sitzplan/side-resize.js ==== */
/* 10.41: Seitenmenü (Noten-Schnellansicht) per Griff breiter ziehen. 12.43: ohne Zoom – Schrift und Knöpfe behalten ihre Größe.
   Griff: helle Pille ⋮ im Spalt; beim Ziehen blaue Linie über die volle Höhe und ein Schild mit der Größe.
   Doppelklick/-tipp: zurück auf 100 %. Breite wird gemerkt (Maus- und Touch-Geräte getrennt). */
(function(){
 const BASE=360,root=document.documentElement;
 const KEY='classroom-side-width-v1-'+(matchMedia('(pointer:coarse)').matches?'touch':'mouse');
 let width=BASE;try{const v=+localStorage.getItem(KEY);if(v>=BASE&&v<4000)width=v}catch{}
 const cont=()=>document.querySelector('body[data-module=sitzplan] .container');
 const panel=()=>cont()?.querySelector(':scope>.panel');
 const right=()=>root.classList.contains('cm-side-right');
 function usable(){const c=cont(),p=panel();if(!c||!p||!p.getClientRects().length)return false;
  if(root.classList.contains('classroom-beamer')||root.classList.contains('ph-lite'))return false;
  if(c.classList.contains('sidebar-collapsed')||c.classList.contains('sidebar-hidden'))return false;
  return getComputedStyle(c).gridTemplateColumns.trim().split(/\s+/).length>=2}
 const maxW=()=>{const c=cont();return Math.max(BASE,Math.round((c?c.clientWidth:1200)*0.5))};
 const clampW=w=>Math.max(BASE,Math.min(maxW(),Math.round(w)));
 let applied=null;
 function apply(){const on=usable(),w=on?clampW(width):BASE,z=(w/BASE).toFixed(4),key=on+'|'+w;
  if(key!==applied){applied=key;root.classList.toggle('sp-side-sized',on&&w!==BASE);root.style.setProperty('--sp-side-w',w+'px');root.style.setProperty('--sp-side-z',z);try{window.classroomFitPanels?.()}catch{}}
  place(on)}
 /* Griff */
 const h=document.createElement('div');h.className='sp-side-handle';h.setAttribute('role','separator');h.setAttribute('aria-orientation','vertical');h.setAttribute('aria-label','Seitenmenü breiter oder schmaler ziehen');h.title='Ziehen: Seitenmenü breiter oder schmaler · Doppelklick: Standardbreite';
 h.innerHTML='<span class="sp-side-pill" aria-hidden="true">⋮</span><span class="sp-side-line" aria-hidden="true"></span><span class="sp-side-badge" aria-hidden="true"></span>';
 function place(on){const c=cont(),p=panel();if(!on||!c||!p){h.hidden=true;return}
  if(h.parentElement!==c)c.append(h);h.hidden=false;
  /* 10.79: Lage aus dem Spaltenraster statt aus dem Seitenmenü – das Menü ist gezoomt, und Safari liefert für gezoomte
     Elemente verschobene Koordinaten (Griff saß dann im Menü statt im Spalt). */
  const cs=getComputedStyle(c),cr=c.getBoundingClientRect(),gap=parseFloat(cs.columnGap)||20,first=parseFloat(cs.gridTemplateColumns)||0;
  const x=parseFloat(cs.paddingLeft)+(parseFloat(cs.borderLeftWidth)||0)+first+gap/2;
  const top=Math.max(cr.top+parseFloat(cs.paddingTop),0)-cr.top,bottom=Math.min(cr.bottom-parseFloat(cs.paddingBottom),innerHeight)-cr.top;
  const s=h.style,L=Math.round(x-12)+'px',T=Math.round(top)+'px',H=Math.max(60,Math.round(bottom-top))+'px';
  if(s.left!==L)s.left=L;if(s.top!==T)s.top=T;if(s.height!==H)s.height=H}
 const badge=h.querySelector('.sp-side-badge');
 let drag=null;
 h.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();drag={x:e.clientX,w:clampW(width),id:e.pointerId};try{h.setPointerCapture(e.pointerId)}catch{}root.classList.add('sp-side-dragging');badge.textContent=drag.w+' px'});
 h.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;width=clampW(drag.w+(right()?-dx:dx));badge.textContent=width+' px';apply()});
 const end=e=>{if(!drag)return;drag=null;root.classList.remove('sp-side-dragging');try{localStorage.setItem(KEY,String(width))}catch{}apply()};
 h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);
 let lastTap=0;h.addEventListener('pointerup',()=>{const now=Date.now();if(now-lastTap<350){reset()}lastTap=now});
 h.addEventListener('dblclick',e=>{e.preventDefault();reset()});
 function reset(){width=BASE;try{localStorage.setItem(KEY,String(BASE))}catch{}applied=null;apply()}
 h.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const d=(e.key==='ArrowRight')!==right()?36:-36;width=clampW(width+d);try{localStorage.setItem(KEY,String(width))}catch{}apply()}});
 h.tabIndex=0;
 let planned=false;const run=()=>{if(planned)return;planned=true;requestAnimationFrame(()=>{planned=false;try{apply()}catch(e){console.warn(e)}})};
 addEventListener('resize',run);addEventListener('scroll',run,true);
 /* 12.20: nach dem Seitentausch steht das Spaltenraster erst etwas später fest – Griff sonst mitten im Sitzplan */new MutationObserver(()=>{run();setTimeout(run,150);setTimeout(run,500)}).observe(root,{attributes:true,attributeFilter:['class']});
 const watch=()=>{const c=cont();if(c&&!c.__spSide){c.__spSide=true;new MutationObserver(run).observe(c,{attributes:true,attributeFilter:['class']});new ResizeObserver(run).observe(c)}};
 new MutationObserver(()=>{watch();run()}).observe(document.body,{childList:true});watch();
 addEventListener('load',run);run();setTimeout(run,700);
 window.classroomSideZoom=()=>1;
 const st=document.createElement('style');st.textContent=
  'body[data-module=sitzplan] .container{position:relative}'
  +'html.sp-side-sized:not(.classroom-beamer) body[data-module=sitzplan] .container:not(.sidebar-collapsed):not(.sidebar-hidden):not(#_){grid-template-columns:var(--sp-side-w) minmax(0,1fr)!important}'
  +'html.sp-side-sized.cm-side-right:not(.classroom-beamer) body[data-module=sitzplan] .container:not(.sidebar-collapsed):not(.sidebar-hidden):not(#_){grid-template-columns:minmax(0,1fr) var(--sp-side-w)!important}'
  /* 12.43: kein Zoom mehr – breiter heißt nur breiter */
  +'html.sp-side-dragging body[data-module=sitzplan] .container{transition:none!important}html.sp-side-dragging,html.sp-side-dragging *{cursor:col-resize!important;user-select:none!important;-webkit-user-select:none!important}'
  +'.sp-side-handle{position:absolute;z-index:30;width:24px;cursor:col-resize;touch-action:none;display:flex;align-items:center;justify-content:center;outline:none}.sp-side-handle[hidden]{display:none}'
  +'.sp-side-pill{width:10px;height:56px;border-radius:6px;background:#fff;border:1px solid #c9d4e3;box-shadow:0 1px 3px #233d6022;display:flex;align-items:center;justify-content:center;color:#8aa0bd;font-size:14px;line-height:1;transition:background .15s,border-color .15s,color .15s}'
  +'.sp-side-handle:hover .sp-side-pill,.sp-side-handle:focus-visible .sp-side-pill{background:#2f5f9b;border-color:#2f5f9b;color:#fff}'
  +'.sp-side-line{position:absolute;left:10px;top:8px;bottom:8px;width:4px;border-radius:3px;background:#2f5f9b;display:none}'
  +'.sp-side-badge{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:#2f5f9b;color:#fff;font:700 12px/1 system-ui,-apple-system,sans-serif;padding:6px 9px;border-radius:8px;white-space:nowrap;display:none}'
  +'html.sp-side-dragging .sp-side-line,html.sp-side-dragging .sp-side-badge{display:block}html.sp-side-dragging .sp-side-pill{opacity:0}'
  +'@media print{.sp-side-handle{display:none!important}}';
 document.head.append(st);
})();
;

/* ==== sitzplan/fit-panels.js ==== */
/* 10.19: Mac/iPad – Sitzplan-Fenster und Einstellungs-Spalte enden unten auf derselben Höhe wie die Noten-Schnellansicht
   (12 px über dem unteren Rand). Die Seite selbst scrollt nicht mehr, gescrollt wird innerhalb der Fenster. */
(function(){
 const root=document.documentElement,GAP=12;
 let boxes=[];
 const phone=()=>{try{return parent.document.documentElement.classList.contains('is-phone')}catch{return innerWidth<600}};
 const usable=()=>!phone()&&innerWidth>=700&&innerHeight>=420&&!root.classList.contains('classroom-beamer')&&!(document.fullscreenElement||document.webkitFullscreenElement);
 /* nur ändern, was wirklich anders ist – sonst löst jedes remove() einen Beobachter aus (Endlosschleife) */
 /* 10.31: 12 px über dem Bildschirmrand – wie im Noten-Manager (Platz unter dem Rahmen abziehen) */
 function gap(){let below=0;try{const fr=frameElement,pd=parent.document;if(fr&&pd)below=Math.max(0,pd.documentElement.clientHeight-fr.getBoundingClientRect().bottom)}catch{}return Math.max(4,Math.round(GAP-below))}
 function clear(){for(const b of boxes){b.style.height='';b.classList.remove('sp-fit-box')}boxes=[];if(root.classList.contains('sp-fit'))root.classList.remove('sp-fit')}
 function fit(){
  if(!usable()){clear();return}
  const list=[...document.querySelectorAll('.container>.panel,.container>.grid-container')].filter(e=>e.getClientRects().length);
  if(!list.length){clear();return}
  for(const b of boxes)if(!list.includes(b)){b.style.height='';b.classList.remove('sp-fit-box')}
  boxes=list;if(!root.classList.contains('sp-fit'))root.classList.add('sp-fit');
  if(document.scrollingElement.scrollTop)document.scrollingElement.scrollTop=0;
  for(const b of list){if(!b.classList.contains('sp-fit-box'))b.classList.add('sp-fit-box');
   /* 10.41: vergrößertes Seitenmenü (zoom) – Höhe in seinen eigenen Einheiten */const z=b.classList.contains('panel')?(window.classroomSideZoom?.()||1):1;
   const h=Math.max(240,Math.round((innerHeight-b.getBoundingClientRect().top-gap())/z));
   if(Math.abs((parseFloat(b.style.height)||0)-h)>1)b.style.height=h+'px'}
 }
 let planned=false;const run=()=>{if(planned)return;planned=true;requestAnimationFrame(()=>{planned=false;try{fit()}catch(e){console.warn(e)}})};
 addEventListener('resize',run);window.visualViewport?.addEventListener('resize',run);window.classroomFitPanels=run;
 /* 10.95: gemeinsamer Beobachter */if(typeof classroomOnDomChange==='function')classroomOnDomChange(run);else new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
 new MutationObserver(run).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 document.addEventListener('fullscreenchange',run);document.addEventListener('webkitfullscreenchange',run);
 addEventListener('load',run);run();setTimeout(run,600);
 const st=document.createElement('style');st.textContent=`
html.sp-fit,html.sp-fit body{height:100%;overflow:hidden;overscroll-behavior:none}
html.sp-fit body{padding-bottom:0!important;margin-bottom:0!important}
html.sp-fit .container{align-items:start}
html.sp-fit .grid-container.sp-fit-box{overflow-x:hidden!important;scrollbar-gutter:stable}
html.sp-fit .sp-fit-box{overflow:auto;overscroll-behavior:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;margin-bottom:0!important}
@media print{html.sp-fit,html.sp-fit body{height:auto;overflow:visible}html.sp-fit .sp-fit-box{height:auto!important;overflow:visible}}`;
 document.head.append(st);
})();
;

/* ==== no-contacts.js ==== */
/* Safari/iOS soll bei Schülernamen keine Einträge aus den eigenen Kontakten vorschlagen (Datenschutz, z. B. am Beamer).
   Namensfelder erhalten autocomplete="off" und ein name-Attribut, das Safari nicht als Kontaktfeld erkennt. */
(()=>{
 const sel='input[type=text],input[type=search],input:not([type])';
 let n=0;
 function protect(input){
  if(input.dataset.noContacts)return;
  const hint=((input.placeholder||'')+' '+(input.getAttribute('aria-label')||'')+' '+(input.name||'')+' '+(input.id||'')).toLowerCase();
  if(!/name|schüler|person/.test(hint))return;
  input.dataset.noContacts='1';input.autocomplete='off';
  for(const [k,v] of Object.entries({autocorrect:'off','data-lpignore':'true','data-1p-ignore':'true','data-form-type':'other'}))input.setAttribute(k,v);
  if(!input.name||/name/i.test(input.name))input.name='search-roster-'+(++n);
 }
 function scan(root){if(root.matches?.(sel))protect(root);root.querySelectorAll?.(sel).forEach(protect)}
 scan(document);
 new MutationObserver(list=>{for(const m of list)for(const node of m.addedNodes)if(node.nodeType===1)scan(node)}).observe(document.documentElement,{childList:true,subtree:true});
 // Nachträglich gesetzte Platzhalter/Bezeichnungen ebenfalls prüfen.
 document.addEventListener('focusin',e=>{if(e.target.matches?.(sel))protect(e.target)},true);
})();
;

/* ==== sitzplan/sp-icons.js ==== */
/* 10.56: Knöpfe über und unter dem Sitzplan als Symbole (Text bleibt als Hinweis und für Vorlesen erhalten).
   Oben: Einpassen · 100 % · Bewertungen (Auge). Unten: Schüler zuweisen · Perspektive · Schüler finden · Zufallsauswahl · Zufallsgruppen.
   „Verteilen“ (Hauptaktion) und der Seitenwechsel bleiben unverändert. Nicht am iPhone. */
(function(){
 const S=p=>'<svg class="spi" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
 const IC={
  fit:S('<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><rect x="8" y="8" width="8" height="8" rx="1.5"/>'),
  reset:S('<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M7.2 10.2l1.6-1.2v6.2M15.2 10.2l1.6-1.2v6.2"/><circle cx="12" cy="10.6" r=".75" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r=".75" fill="currentColor" stroke="none"/>'),
  assign:S('<circle cx="8" cy="7.5" r="2.8"/><path d="M3 18c.5-3 2.4-4.6 5-4.6M14 13h7M18 10l3 3-3 3"/>'),
  rotate:S('<path d="M8 4v16M5 7l3-3 3 3M16 20V4M13 17l3 3 3-3"/>'),
  find:S('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>'),
  random:S('<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>'),
  print:'<svg class="spi spi-pr" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 8V4.5h9V8"/><path d="M6.5 16.5H6A2.5 2.5 0 0 1 3.5 14v-3.5A2.5 2.5 0 0 1 6 8h12a2.5 2.5 0 0 1 2.5 2.5V14a2.5 2.5 0 0 1-2.5 2.5h-.5"/><path d="M7.5 13h9v6.5h-9z"/></svg>',
  /* 10.67: vier Gruppenkarten (2 × 2) wie in der Gruppenansicht */groups:S('<rect x="2" y="2" width="9" height="9" rx="1.4" fill="#fff" stroke="currentColor" stroke-width="1.5"/><path d="M2 3.4a1.4 1.4 0 0 1 1.4 -1.4h6.2a1.4 1.4 0 0 1 1.4 1.4v2.0h-9z" stroke="currentColor" stroke-width="1.5" fill="#3b82c4"/><path d="M3.6 8.4h5.8" stroke="#7d8ea6" stroke-width="1.3"/><rect x="13" y="2" width="9" height="9" rx="1.4" fill="#fff" stroke="currentColor" stroke-width="1.5"/><path d="M13 3.4a1.4 1.4 0 0 1 1.4 -1.4h6.2a1.4 1.4 0 0 1 1.4 1.4v2.0h-9z" stroke="currentColor" stroke-width="1.5" fill="#e08a1e"/><path d="M14.6 8.4h5.8" stroke="#7d8ea6" stroke-width="1.3"/><rect x="2" y="13" width="9" height="9" rx="1.4" fill="#fff" stroke="currentColor" stroke-width="1.5"/><path d="M2 14.4a1.4 1.4 0 0 1 1.4 -1.4h6.2a1.4 1.4 0 0 1 1.4 1.4v2.0h-9z" stroke="currentColor" stroke-width="1.5" fill="#3f9b6b"/><path d="M3.6 19.4h5.8" stroke="#7d8ea6" stroke-width="1.3"/><rect x="13" y="13" width="9" height="9" rx="1.4" fill="#fff" stroke="currentColor" stroke-width="1.5"/><path d="M13 14.4a1.4 1.4 0 0 1 1.4 -1.4h6.2a1.4 1.4 0 0 1 1.4 1.4v2.0h-9z" stroke="currentColor" stroke-width="1.5" fill="#9b59b6"/><path d="M14.6 19.4h5.8" stroke="#7d8ea6" stroke-width="1.3"/>')};
 const phone=()=>{const r=document.documentElement;try{if(parent!==window&&parent.document.documentElement.classList.contains('is-phone'))return true}catch{}return r.classList.contains('ph-lite')||r.classList.contains('is-phone')};
 function icon(el,key,label){if(!el)return;const want=label||[...el.childNodes].filter(n=>!(n.nodeType===1&&n.matches('svg'))).map(n=>n.textContent).join('').trim();if(!want)return;const has=el.querySelector(':scope>svg.spi'),lbl=el.querySelector(':scope>.spi-lbl');if(has&&lbl&&lbl.textContent===want)return;
  el.innerHTML=IC[key]+'<span class="spi-lbl">'+want.replace(/[<>&]/g,'')+'</span>';el.classList.add('spi-btn');if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',want);if(!el.title)el.title=want}
 let busy=false;
 function apply(){if(busy)return;busy=true;try{const on=!phone();document.documentElement.classList.toggle('spi-on',on);if(!on)return;
   icon(document.querySelector('[data-zoom-fit]'),'fit');icon(document.querySelector('[data-zoom-reset]'),'reset');
   icon(document.querySelector('[data-assign-student]'),'assign');icon(document.getElementById('classroomRotateButton'),'rotate');
   icon(document.getElementById('studentSearchToggle'),'find');icon(document.getElementById('randomStudentButton'),'random');icon(document.getElementById('randomGroupsButton'),'groups');
   {const lab=e=>[...e.childNodes].filter(n=>!(n.nodeType===1&&n.matches('svg'))).map(n=>n.textContent).join('').replace(/\s+/g,' ').trim();const pr=[...document.querySelectorAll('.classroom-plan-actions > .btn')].find(b=>lab(b)==='Drucken');icon(pr,'print')}
   const sw=document.querySelector('.plan-assess-switch');if(sw){sw.classList.add('spi-btn');if(!sw.title)sw.title='Bewertungen im Sitzplan ein- oder ausblenden'}
  }catch(e){console.warn(e)}finally{busy=false}}
 let planned=false;const run=()=>{if(planned)return;planned=true;requestAnimationFrame(()=>{planned=false;apply()})};
 /* 10.95: gemeinsamer Beobachter */if(typeof classroomOnDomChange==='function')classroomOnDomChange(run);else new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('load',run);apply();setTimeout(apply,600);
 const st=document.createElement('style');st.textContent=
  'html.spi-on .spi-btn:not(#_):not(#__){position:relative;display:inline-flex!important;align-items:center;justify-content:center;min-width:42px!important;width:42px!important;padding:0!important;gap:0!important}'
  +'html.spi-on .spi-btn>svg.spi{width:22px;height:22px;flex:none}html.spi-on .spi-btn>svg.spi-pr{width:26px;height:26px}html.spi-on .spi-btn>.spi-lbl,html.spi-on label.plan-assess-switch.spi-btn>span{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  +'html.spi-on .spi-btn[aria-pressed=true]:not(#_):not(#__){background:#e8f0fb!important;border-color:#9bb6dc!important}'
  /* „Schüler finden“ geöffnet: Lupe neben dem Eingabefeld */
  +'html.spi-on .student-finder[data-open=true]>#studentSearchToggle.spi-btn:not(#_):not(#__){width:36px!important;min-width:36px!important}';
 document.head.append(st);
})();
;

/* ==== cm-html.js ==== */
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

/* 13.06: Schülerfassung einer Lerneinheit – ohne Lehrkraft-Teile, mit Stand (Prüfsumme + Datum).
   Gesperrte Einheiten (ganze Reihe verteilt) sind verschlüsselt; den Schlüssel bringt erst der Start-QR-Code mit.
   Der Schlüssel ergibt sich aus dem Inhalt – ändert sich die Einheit, passt der alte Schlüssel nicht mehr. */
(()=>{
 const te=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const b64u=b=>{const a=new Uint8Array(b);let s='';for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
 const ub64=s=>{s=String(s).replace(/-/g,'+').replace(/_/g,'/');s+='='.repeat((4-s.length%4)%4);const t=atob(s),a=new Uint8Array(t.length);for(let i=0;i<t.length;i++)a[i]=t.charCodeAt(i);return a};
 const sha=t=>crypto.subtle.digest('SHA-256',te.encode(t));
 const strip=u=>{const x=JSON.parse(JSON.stringify(u));if(x.def){delete x.def.vt;delete x.def.vtRec}delete x.stand;return x};
 const day=()=>{const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')};
 window.cmStuStrip=strip;
 window.cmStuHash=async u=>hex(await sha('cm-stand|'+JSON.stringify(strip(u).def))).slice(0,12);
 window.cmStuKey=async u=>{const x=strip(u);return b64u((await sha('cm-key|'+x.id+'|'+JSON.stringify(x.def))).slice(0,16))};
 window.cmStuPlain=(u,stand)=>{const x=strip(u);x.stand={d:stand?.d||day(),h:stand.h};return x};
 window.cmStuLock=async(u,stand,k)=>{const x=cmStuPlain(u,stand),M=x.def.meta||{},key=await crypto.subtle.importKey('raw',ub64(k),'AES-GCM',false,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(JSON.stringify(x)));
  return {type:'classroom-lerneinheit-locked',id:x.id,title:M.title||x.title||'Lerneinheit',meta:{subject:M.subject||'',jg:M.jg||0,reihe:M.reihe||'',n:x.def.steps.filter(s=>s&&s.k).length},stand:x.stand,enc:{iv:b64u(iv),data:b64u(data)}}};
 window.cmStuLocked=L=>!!(L&&L.type==='classroom-lerneinheit-locked'&&L.id&&/^[a-z0-9_-]+$/i.test(L.id)&&L.enc&&L.enc.data);
 window.cmStuUnlock=async(L,k)=>{try{const key=await crypto.subtle.importKey('raw',ub64(k),'AES-GCM',false,['decrypt']);const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(L.enc.iv)},key,ub64(L.enc.data));const u=JSON.parse(new TextDecoder().decode(p));return u&&u.id===L.id?u:null}catch{return null}};
 /* Stand einer Einheit auf dem iPad – die Prüfsumme immer aus dem Inhalt (auch ältere Dateien ohne Stand) */
 window.cmStuStand=async u=>({h:await cmStuHash(u),d:u?.stand?.d||''});
 /* Neue Fassung geladen: nur die geänderten Stationen zurücksetzen – der Rest bleibt erhalten */
 window.cmStuReset=(id,oldU,newU)=>{if(!oldU||!oldU.def||!newU||!newU.def)return [];const sk=u=>{const o={};for(const s of u.def.steps||[])if(s&&s.k)o[s.k]=JSON.stringify(s);return o};const a=sk(oldU),b=sk(newU),ch=Object.keys(a).filter(k=>a[k]!==b[k]);
  if(!ch.length)return ch;const K='cm-'+id+'-v1';let ST=null;try{ST=JSON.parse(localStorage.getItem(K)||'null')}catch{}if(!ST)return ch;
  for(const k of ch){const re=new RegExp('^'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:[A-Z][A-Za-z0-9]*)?$');for(const s of Object.keys(ST))if(re.test(s))delete ST[s]}
  try{localStorage.setItem(K,JSON.stringify(ST))}catch{}return ch};
 /* alle Einheiten aus einer Datei: Einheit, gesperrte Einheit, Reihe (auch gesperrt), Paket */
 window.cmStuUnits=d=>{if(!d)return [];const okU=u=>u&&((u.type==='classroom-lerneinheit'&&u.id&&/^[a-z0-9_-]+$/i.test(u.id)&&u.def&&Array.isArray(u.def.steps))||cmStuLocked(u));
  if(okU(d))return [d];const L=d.type==='classroom-reihe'&&d.units?Object.values(d.units):d.type==='classroom-paket'&&Array.isArray(d.units)?d.units:[];return L.filter(okU)};
 window.cmStuDate=d=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d||'');return m?m[3]+'.'+m[2]+'.':''};
})();
;

/* ==== sitzplan/einheiten.js ==== */
/* 11.23: Bereich „Unterricht“ (Kopf: Sitzplan · Unterricht · Noten). Läuft im Sitzplan-Rahmen, der dafür ganz ausgefüllt wird.
   Gezeigt wird nur die Lerngruppe, in der du gerade bist (Stundenplan bzw. gewählte Klasse), mit ihrem „Stand“ (aktuelle Lektion/Einheit).
   „Alle Einheiten …“ öffnet die Bibliothek nach Jahrgang (Paket laden/exportieren). Bausteine: Üben zuerst (QR), Test nur auf Wunsch.
   Daten und Dialoge kommen aus dem Noten-Manager (classroomBibliothek). Lektionstexte und Schulbuchbilder bleiben auf dem Gerät. */
(()=>{
 const grid=document.querySelector('.grid-container');if(!grid)return;
 const UIKEY='classroom-einheiten-ui-v1',STAND='classroom-unterricht-stand-v1';
 const rd=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch{return {}}},wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
 const ui=rd(UIKEY);ui.sel??={};const saveUi=()=>wr(UIKEY,ui);
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const top=()=>{try{return parent!==window?parent:null}catch{return null}};
 const NF=()=>{try{return top().document.getElementById('view-noten').contentWindow}catch{return null}};
 const B=()=>{try{return NF()?.classroomBibliothek||null}catch{return null}};
 /* 12.56: „Lerneinheiten (iPad)“ – Start-QR, Abgaben scannen, Übersicht aller Einheiten – links neben dem Lesezeichen */
 const LUB='<button type="button" class="ein-curb ein-lu" style="margin-right:-4px" data-do="lu" data-k="" title="Material: alle Fächer und Jahrgänge – Lerneinheiten, Übersetzungs-Trainer, Vokabeln, Lernpakete" aria-label="Material"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M9 7h6M9 10.5h6M9 14h3"/><circle cx="12" cy="18.2" r=".6" fill="currentColor"/></svg></button>';
 const SUBJ={latein:'Latein',erdkunde:'Erdkunde',geschichte:'Geschichte',physik:'Physik',biologie:'Biologie',chemie:'Chemie',deutsch:'Deutsch',englisch:'Englisch',mathematik:'Mathematik',politik:'Politik',religion:'Religion',musik:'Musik',kunst:'Kunst',franzoesisch:'Französisch'};
 const css=`html.cm-unterricht .container{grid-template-columns:1fr!important}
html.cm-unterricht .container>.panel,html.cm-unterricht .sp-side-handle,html.cm-unterricht .classroom-sidebar-toggle{display:none!important}
html.cm-unterricht .grid-container{display:flex!important;flex-direction:column;padding:0!important;overflow:hidden}
html.cm-unterricht .grid-container>*:not(#einView){display:none!important}
#einView{display:none;flex:1;min-height:0;--ein-w:290px}html.cm-unterricht #einView{display:grid;grid-template-columns:var(--ein-w) 24px 1fr}html.cm-unterricht #einView{align-self:stretch;width:100%;min-width:0;box-sizing:border-box}
.ein-side{display:flex;flex-direction:column;min-height:0;padding:12px 10px 10px 12px}
.ein-q{height:38px;border:1px solid #dce3ef;border-radius:10px;padding:0 10px;font:inherit;font-size:.92rem;margin-bottom:6px;background:#fff;color:#243247}
.ein-list{flex:1;min-height:0;overflow:auto;overflow-x:hidden}/* 12.76: Verschiebe-Griff nur am Mac beim Darüberfahren, auf iPad/iPhone gar nicht */html body .ein-row:not(:hover) .ein-gr:not(#_){opacity:0!important}@media (hover:none),(pointer:coarse){html body .ein-gr:not(#_){display:none!important}}.ein-list>.ein-ptf{width:calc(100% - 32px)!important}.ein-list .ein-row{box-sizing:border-box;max-width:100%}
.ein-sacts{display:flex;gap:6px;border-top:1px solid #eef2f7;padding-top:10px;margin-top:6px}.ein-sacts .ein-b{flex:1;padding:0 8px}
.ein-handle{position:relative;display:flex;align-items:center;justify-content:center;cursor:col-resize;touch-action:none;outline:none;background:var(--bg-color,#f6f8fc);border-left:1px solid var(--border-color,#dce3ef);border-right:1px solid var(--border-color,#dce3ef)}
.ein-handle:hover .sp-side-pill,.ein-handle:focus-visible .sp-side-pill{background:#2f5f9b;border-color:#2f5f9b;color:#fff}
.ein-handle .sp-side-line{left:50%;margin-left:-2px}#einView.ein-dragging .sp-side-line,#einView.ein-dragging .sp-side-badge{display:block}#einView.ein-dragging .sp-side-pill{opacity:0}
html.ein-dragging,html.ein-dragging *{cursor:col-resize!important;user-select:none!important;-webkit-user-select:none!important}
.ein-main{padding:16px 20px 22px;min-width:0;overflow:auto}
.ein-mh{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.ein-mh h2{margin:0;font-size:1.4rem;color:#243247}.ein-mh .sp{flex:1}
.ein-sub{color:#66758a;margin:4px 0 14px}
.ein-b{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-size:.92rem;font-weight:650;padding:0 14px;cursor:pointer;white-space:nowrap}.ein-b:hover{background:#f3f7fd}
.ein-tog{display:inline-flex;align-items:center;gap:9px;font-weight:650;font-size:.9rem;color:#9a5400;background:#fff4e2;border:1px solid #f2c98a;border-radius:999px;padding:5px 12px 5px 8px;cursor:pointer;user-select:none}
.ein-tog.off{color:#66758a;background:#fff;border-color:#dce3ef}.ein-tog input{position:absolute;opacity:0;pointer-events:none}
.ein-togw{display:inline-flex;align-items:center;flex:none;margin-left:auto}.ein-curl{font-size:.88rem;color:#66758a;margin-right:8px;white-space:nowrap}.ein-curl.on{color:#9a5400;font-weight:650}.ein-curb{flex:none;width:42px;height:40px;display:inline-grid;place-items:center;border:1px solid #a8bdd8;border-radius:10px;background:#fff;color:#2f5f9b;cursor:pointer;padding:0}.ein-curb.on{background:#fff4e0;border-color:#e8a23a;color:#c2410c}.ein-curb[data-ledit].on,.ein-curb[data-redit].on{background:#fde0b8;border:1.5px solid #d97f06;color:#8a4b00}.ein-edbar{position:sticky;top:0;z-index:6;display:flex;align-items:center;gap:12px;margin:0 0 12px;padding:10px 14px;border-radius:12px;background:#fff4e5;border:1.5px solid #f0c27a;color:#7a4300;font-size:.92rem;box-shadow:0 4px 12px #7a43000f}.ein-edbar b{font-size:1rem;white-space:nowrap}.ein-edbar span{flex:1}.ein-edbar button{height:36px;padding:0 16px;border:0;border-radius:10px;background:#2f5f9b;color:#fff;font:inherit;font-weight:700;cursor:pointer}.ein-curb.on .bm{fill:#f6c27a}@media (max-width:540px){.ein-curl{display:none}}.ein-pinb{flex:none;width:42px;height:40px;margin-left:8px;display:inline-grid;place-items:center;border:1px solid #a8bdd8;border-radius:10px;background:#fff;color:#2f5f9b;cursor:pointer;padding:0}.ein-pinb svg{width:20px;height:20px}.ein-pinb.on{background:#fff4e0;border-color:#e8a23a;color:#c2410c}.ein-pinb.on .pp{fill:#f6c27a}
.ein-tog .sw{width:38px;height:22px;border-radius:11px;background:#e8590c;position:relative;flex:none;transition:background .15s}.ein-tog .sw::after{content:'';position:absolute;top:3px;left:19px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s}
.ein-tog.off .sw{background:#c9d2df}.ein-tog.off .sw::after{left:3px}
.ein-dots{display:inline-flex;gap:3px;flex:none}.ein-dots b{width:7px;height:7px;border-radius:50%;background:#d5dde9}.ein-dots b.dv{background:#2f5f9b}.ein-dots b.dg{background:#6b8fc4}.ein-dots b.dt{background:#e8590c}.ein-dots b.dw{background:#9db4d6}
.ein-chips{display:inline-flex;gap:3px;margin-right:10px;vertical-align:1px}.ein-chips i{font-style:normal;width:18px;height:18px;border-radius:5px;display:inline-grid;place-items:center;font-size:11px;font-weight:800;background:#f1f4f9;color:#c3ccd9;cursor:default}.ein-chips i.on{background:#eaf0fa;color:#2f5f9b}.ein-chips i.on.t{background:#fff1e3;color:#c2570c}
.ein-sub b{color:#2f5f9b;font-weight:650}
.ein-toc{display:grid;grid-template-columns:1.25fr 1fr;gap:4px 26px;border-top:1px solid #eef2f7;border-bottom:1px solid #eef2f7;padding:10px 0 8px;margin:0 0 16px;font-size:.92rem;color:#243247}
.ein-tk{font-size:.72rem;font-weight:750;letter-spacing:.05em;text-transform:uppercase;color:#8a97aa;margin:4px 0 2px}
.ein-tr{margin-bottom:4px;line-height:1.4}.ein-tr i{font-style:normal;font-size:.7rem;font-weight:750;letter-spacing:.04em;color:#c2570c;text-transform:uppercase;margin-right:6px}
@media (max-width:760px){.ein-toc{grid-template-columns:1fr}}
/* 12.31: Ordnen im Baum */.ein-row .ein-ck,.ein-ck{flex:none;align-self:center;width:17px;height:17px;border:1.5px solid #b3bfd1;border-radius:5px;background:#fff;cursor:pointer;opacity:.75}.ein-ck:hover{border-color:#e8822a;opacity:1}.ein-ck.y{background:#e8822a;border-color:#e8822a;opacity:1;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\");background-size:14px;background-position:center;background-repeat:no-repeat}.ein-row.ck{background:#fff6ec}.ein-row .ein-gr,.ein-gr{flex:none;align-self:center;color:#a6b2c4;cursor:grab;letter-spacing:-2px;font-size:.9rem;opacity:0;touch-action:none;padding:0 1px}.ein-row:hover .ein-gr,.ein-row:focus-within .ein-gr{opacity:1}@media (pointer:coarse){.ein-gr{opacity:.7}}.ein-dt{flex:none!important;align-self:center;border:1px solid transparent;border-radius:7px;padding:0 6px;color:#7d8aa0;line-height:1.3;cursor:pointer;opacity:.0}.ein-row:hover .ein-dt,.ein-row.on .ein-dt,.ein-dt:focus{opacity:1;border-color:#d6dce8;background:#fff}@media (pointer:coarse){.ein-dt{opacity:.8;border-color:#d6dce8}}.ein-dt:hover{color:#e8822a;border-color:#e8822a}.ein-ghost{position:fixed;z-index:9999;pointer-events:none;background:#fff;box-shadow:0 10px 26px rgba(20,40,80,.22);border-radius:9px;opacity:.95;box-sizing:border-box;max-width:calc(100vw - 24px)}.ein-src{opacity:.35}.ein-dropb{box-shadow:inset 0 3px 0 #e8822a}.ein-dropin{outline:2px dashed #e8822a;outline-offset:-2px;background:#fff6ec}.ein-pt0{font-size:.8rem;color:#9aa6b8;padding:2px 10px 8px}.ein-row.ein-in:has(.ein-ck){padding-left:20px}
.ein-row{position:relative}
.ein-row .ein-gr{position:absolute;left:0;top:50%;transform:translateY(-50%);opacity:0;padding:4px 1px}
.ein-row.ein-in .ein-gr{left:16px}
.ein-row:hover .ein-gr{opacity:.8}
@media (pointer:coarse){.ein-row .ein-gr{opacity:.45}}
.ein-ch[data-chn]{display:flex;align-items:center;gap:6px;border-radius:8px;padding:2px 4px 2px 0}
.ein-ch[data-chn]>span{flex:1;min-width:0}
.ein-ch .ein-dt{font-weight:400}
.ein-ch:hover .ein-dt,.ein-ch .ein-dt:focus{opacity:1;border-color:#d6dce8;background:#fff}
.ein-ch.ein-ch0{color:#7d8aa0;font-weight:600}
.ein-ch.ein-dropin{padding-left:6px}
.ein-row:has(.ein-ck){gap:6px;padding-right:6px}
.ein-ur>span:not([class]){overflow-wrap:break-word;hyphens:auto}
.ein-selbar .ein-sbb{display:flex;flex-wrap:wrap;gap:6px}
.ein-selbar .ein-sbb .ein-b{flex:1 1 auto;width:auto;margin:0;padding:6px 10px;font-size:.84rem;min-height:0}
.ein-selbar{margin-top:8px;padding:8px 10px;border-radius:12px;background:#fff6ec;border:1px solid #f3c99b}.ein-sbt{display:flex;align-items:center;gap:8px;margin-bottom:8px}.ein-sbt b{flex:1;font-size:.88rem;color:#7a3f00}.ein-sbx{border:0;background:transparent;color:#7a3f00;cursor:pointer;font-size:1rem}.ein-sbb{display:flex;gap:6px;flex-wrap:wrap}.ein-sbb .ein-b{display:inline-flex;align-items:center;gap:6px}.ein-sbb .ein-b svg{width:16px;height:16px}.ein-sbb .ein-b.pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}.ein-sbb .ein-b.del{color:#c0392b;border-color:#f0b8b0}.ein-tmenu{position:fixed;z-index:10000;background:#fff;border:1px solid #d6dce8;border-radius:12px;box-shadow:0 12px 30px rgba(20,40,80,.18);padding:6px;max-height:calc(100vh - 16px);overflow:auto;font-size:.92rem}.ein-tmenu button{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:0;background:transparent;border-radius:8px;padding:8px 10px;font:inherit;color:#243247;cursor:pointer}.ein-tmenu button:hover:not(:disabled){background:#f3f6fb}.ein-tmenu button:disabled{color:#9aa6b8;cursor:default}.ein-tmenu button svg{width:17px;height:17px;flex:none}.ein-tmenu .del{color:#c0392b}.ein-tmenu hr{border:0;border-top:1px solid #e6ebf3;margin:5px 2px}.ein-tmenu h6{margin:8px 10px 2px;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:#8a97aa}.ein-sb .ein-b[data-newr2]{display:inline-flex;align-items:center;justify-content:center;gap:6px}.ein-sb .ein-b[data-newr2] svg{width:16px;height:16px}.ein-row.ein-rr{font-weight:700}.ein-row.ein-rr small{font-weight:600}.ein-row.ein-in{padding-left:22px}.ein-sacts2{border-top:0;padding-top:0;margin-top:6px}.ein-sacts.ein-sb{border-top:1px solid #eef2f7;padding-top:10px}.ein-sb [data-ord]{flex:1}.ein-sacts.ein-sb .ein-b.ein-ico{flex:none;width:44px;padding:0;justify-content:center}.ein-sb .ein-ico svg{margin:0}.od-btn{display:inline-flex;align-items:center;gap:7px}.od-btn svg,.od-x svg,.od-menu button svg{width:18px;height:18px;flex:none}.od-menu button svg,.ein-tmenu button svg{color:#2f5f9b}.od-menu button.del svg,.ein-tmenu .del svg{color:#c62828}.od-menu .msub,.ein-tmenu .msub{margin-left:auto;font-style:normal;color:#8a97aa;font-size:1.1em}.od-menu .msub svg,.ein-tmenu .msub svg{color:#8a97aa!important}.od-x{display:inline-flex;align-items:center;justify-content:center}.od-menu button{display:flex!important;align-items:center;gap:10px}.od-menu button.del svg{color:#c62828}.ein-ib{display:inline-flex;align-items:center;justify-content:center;gap:7px}.ein-ib svg{width:17px;height:17px;flex:none}.ein-b.ein-del{color:#c62828;border-color:#efb4b4}.ein-curb svg{width:20px;height:20px}
.rh-list{display:flex;flex-direction:column;gap:8px;max-width:900px}.rh-list.rh-ed{max-width:none}.rh-row{display:flex;align-items:center;gap:12px;border:1px solid #dce3ef;border-radius:12px;padding:10px 12px;background:#fff;font:inherit;color:#243247;text-align:left;cursor:pointer}.rh-row:hover{background:#f6f9fd}.rh-n{width:26px;height:26px;border-radius:50%;background:#e8f0fa;color:#2f5f9b;font-size:.8rem;font-weight:800;display:grid;place-items:center;flex:none}.rh-t{flex:1;min-width:0}.rh-t small{display:block;color:#8a97aa;font-size:.8rem;font-weight:500}
.rh-er{display:flex;align-items:center;gap:10px;border:1px solid #dce3ef;border-radius:12px;padding:6px 8px;background:#fff}.rh-er.drag{border-color:#e8a23a;background:#fffaf2;box-shadow:0 8px 22px #1d2b4026}.rh-er.hid{opacity:.55}.rh-er.own .rh-n{background:#f1f3f7;color:#66758a}.rh-grip{width:24px;text-align:center;color:#9aa7b8;font-size:20px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}.rh-in{flex:1;min-width:0;height:40px;border:1px solid #cfd8e6;border-radius:8px;padding:0 10px;font:inherit;color:#243247}.rh-b{width:42px;height:40px;flex:none;border:1px solid #a8bdd8;border-radius:10px;background:#fff;color:#2f5f9b;display:inline-grid;place-items:center;cursor:pointer}.rh-b svg{width:20px;height:20px}.rh-b.on{background:#fff4e0;border-color:#e8a23a;color:#c2410c}.rh-b.del{color:#c62828;border-color:#efb4b4}.rh-add{border:1px dashed #a8bdd8;border-radius:12px;padding:12px;background:#f7f9fd;color:#2f5f9b;font:inherit;font-weight:650;cursor:pointer}
#einRh{border:0;border-radius:16px;padding:0;max-width:560px;width:calc(100% - 32px);box-shadow:0 20px 60px #0004}#einRh form{padding:20px 22px}#einRh h2{margin:0 0 4px}#einRh .muted{color:#66758a;margin:0 0 10px}#einRh .note{background:#eef3fa;border-radius:10px;padding:10px 12px;color:#3c4d66;font-size:.88rem;margin-top:10px}#einRh .acts{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}#einRh .acts button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;padding:0 14px;cursor:pointer}#einRh .acts button.pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}.rh-sel{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:.92rem;margin:4px 0 6px}.rh-sel select{height:38px;border:1px solid #cfd8e6;border-radius:8px;padding:0 8px;font:inherit;background:#f7f9fc}.rh-dl{list-style:none;margin:8px 0 0;padding:0;max-height:46vh;overflow:auto}.rh-dl li{display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #eef1f6;font-size:.92rem}.rh-dl li.m{color:#66758a}.rh-chip{font-size:.72rem;font-weight:750;padding:2px 8px;border-radius:999px;background:#eaf6ee;color:#1f6f43;flex:none}.rh-chip.new{background:#fff4e0;color:#c2410c}.rh-chip.b{background:#e8f0fa;color:#2f5f9b}
.ein-row .why{display:block;font-size:.78rem;color:#8a97aa;font-weight:500}
.ein-pick{display:none}
.ein-all{display:block;width:calc(100% - 16px);margin:12px 8px 4px;min-height:40px;border:1px dashed #a8bdd8;border-radius:10px;background:#f7f9fd;color:#2f5f9b;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer}.ein-all:hover{background:#eef3fb}.ein-tile.t4 i{background:#f1ebfe;color:#7c3aed}
.gl-meta .vt2{background:#fff3cf!important;color:#8a6200!important}.gl-meta .vt3{background:#fde3e1!important;color:#a33a34!important}.ein-ch{font-size:.86rem;font-weight:750;color:#243247;margin:10px 10px 2px;line-height:1.3}.ein-pt{font-size:.72rem;font-weight:750;letter-spacing:.05em;text-transform:uppercase;color:#8a97aa;margin:10px 10px 2px}.ein-jg{font-size:.78rem;font-weight:750;letter-spacing:.06em;text-transform:uppercase;color:#66758a;margin:14px 8px 4px}.ein-jg:first-child{margin-top:4px}
.ein-row{display:flex;align-items:baseline;gap:8px;width:100%;text-align:left;border:0;background:transparent;border-radius:9px;padding:8px 10px;font:inherit;color:#243247;cursor:pointer}
.ein-row:hover{background:#f3f6fb}.ein-row.on{background:#eaf0fa;color:#2f5f9b;font-weight:700}.ein-row span{flex:1;min-width:0}.ein-row small{color:#8a97aa;font-size:.8rem}.ein-row.dim span{color:#8a97aa}.ein-row.dim.on span{color:#2f5f9b}
.ein-row .stand,.rh-row .stand{font-size:.72rem;font-weight:700;color:#fff;background:#e8790c;border:1px solid #e8790c;border-radius:999px;padding:1px 8px;flex:none;align-self:center;letter-spacing:.01em}/* 12.74: Platz für ⋯, damit „aktuell“ nicht verdeckt wird */.ein-row.on:has(>.ein-dt),.ein-row:has(>.stand):has(>.ein-dt){padding-right:44px}.ein-row:has(>.stand)>.neu{display:none}
.ein-row .neu,.rh-row .neu{font-size:.72rem;font-weight:700;color:#1d6b3a;background:#e6f6ec;border:1px solid #9fd7b2;border-radius:999px;padding:0 7px;flex:none}.ein-row .neu+.stand{margin-left:5px}.ein-rr .neu{margin-left:6px}
.ein-foot{color:#8a97aa;font-size:.82rem;margin:16px 8px 0;line-height:1.5}.ein-foot a{color:#2f5f9b;cursor:pointer;text-decoration:underline}
.ein-tile b .gl-pill{vertical-align:2px}.ein-tile b .gl-pill i{display:inline-block;width:7px;height:7px;margin:0;border-radius:50%;background:#1f8a4c}
.ein-part{display:grid;grid-template-columns:190px 1fr;gap:14px;margin:0 0 14px}.ein-pl{padding-top:8px}.ein-pl .n{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#2f5f9b;color:#fff;font-weight:800;font-size:12.5px;margin-right:6px}.ein-pl b{font-size:1rem}.ein-pl small{display:block;color:#66758a;margin:2px 0 0 30px;font-size:.82rem}@media (max-width:900px){.ein-part{grid-template-columns:1fr}}
.ein-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:12px}
.ein-tile{border:1px solid #dce3ef;border-radius:12px;padding:14px;background:#fff;display:flex;flex-direction:column;gap:3px}
.ein-tile i{font-style:normal;display:inline-grid;place-items:center;width:32px;height:32px;border-radius:9px;background:#eaf0fa;color:#2f5f9b;font-weight:800;margin-bottom:4px}
.ein-tile b{color:#2f5f9b;font-size:1.05rem}.ein-tile small{color:#66758a}
.ein-tile.t2 i{background:#e6f6ea;color:#2f7d46}.ein-tile.t3 i{background:#fff1e3;color:#c2570c}
.ein-tile.off{background:#fbfcfe}.ein-tile.off b,.ein-tile.off small,.ein-tile.off i{opacity:.55}
.ein-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
.ein-acts button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-size:.9rem;font-weight:650;padding:0 12px;cursor:pointer}
.ein-acts button.look{background:#fff;border-color:#cfd8e6;color:#2f5f9b}/* 11.80: Orange nur noch für Aktives */
.ein-acts button.pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}
.ein-acts button.abg{border-color:#cfd8e6;background:#fff;color:#2f5f9b}.ein-acts button.ghost{border-style:dashed;color:#66758a}.ein-acts button.air,button.air[data-do]{border-color:#9fb6d6;color:#2f5f9b;background:#f3f7fc}
.ein-acts button:hover{filter:brightness(.97)}
.ein-empty{color:#66758a;padding:10px 2px}
#einExp,#einQr{border:0;border-radius:14px;padding:0;max-width:640px;width:calc(100% - 32px);box-shadow:0 20px 60px #0004}
#einExp form,#einQr form{padding:20px 22px}#einExp h2,#einQr h2{margin:0 0 2px}#einExp .muted,#einQr .muted{color:#66758a;margin:0 0 10px}
#einExp label{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid #eef2f7;cursor:pointer}
#einExp label.l2{padding-left:30px}#einOrd{border:0;border-radius:18px;padding:0;width:min(1400px,calc(100vw - 24px));height:calc(100dvh - 24px);max-height:none;max-width:none;box-shadow:0 20px 60px #0004;color:#24334b;overflow:hidden}#einOrd[open]{display:flex;flex-direction:column}#einOrd::backdrop{background:#1c2b4655}#einOrd .od-hd{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #e3e9f2}#einOrd .od-hd h2{margin:0;font-size:1.2rem;flex:1}#einOrd .od-q{height:40px;border:1px solid #cfd8e6;border-radius:10px;padding:0 12px;font:inherit;width:min(280px,40vw)}#einOrd .od-x{width:42px;height:40px;border:1px solid #c9d5e6;border-radius:10px;background:#fff;color:#2f5f9b;font-size:24px;cursor:pointer}#einOrd .od-bd{display:flex;flex:1;min-height:0}#einOrd .od-sd{width:240px;flex:none;background:#f6f8fc;border-right:1px solid #e3e9f2;padding:12px 10px;overflow:auto}#einOrd .od-sd h5{margin:14px 8px 6px;font-size:.74rem;letter-spacing:.08em;color:#7a879b;text-transform:uppercase}#einOrd .od-it{display:flex;width:100%;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:10px;margin:2px 0;font:inherit;font-weight:600;border:0;background:none;color:#24334b;cursor:pointer;text-align:left}#einOrd .od-it small{color:#7a879b;font-weight:500}#einOrd .od-it.on{background:#fff4e0;color:#c2410c;box-shadow:inset 0 0 0 1px #e8a23a}#einOrd .od-un{color:#c2410c}#einOrd .od-bdg{background:#c2410c;color:#fff;border-radius:9px;padding:0 7px;font-size:.8rem}#einOrd .od-hint{font-size:.8rem;color:#7a879b;margin:16px 8px}#einOrd .od-mn{flex:1;min-width:0;overflow:auto;padding:14px 18px}#einOrd .od-msel{display:none}#einOrd h3{margin:4px 0 12px}#einOrd .od-h{display:flex;justify-content:space-between;align-items:center;gap:10px}#einOrd .od-ban{display:flex;align-items:center;gap:12px;background:#fff7ed;border:1px solid #f5c58a;border-radius:12px;padding:8px 12px;margin-bottom:12px}#einOrd .od-ban b{flex:1}#einOrd .od-btn{height:40px;padding:0 14px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;cursor:pointer;white-space:nowrap}#einOrd .od-sub{color:#66758a;margin:-6px 0 12px;font-size:.9rem}#einOrd .od-card{border:1px solid #dce3ef;border-radius:14px;margin-bottom:12px;overflow:hidden;background:#fff}#einOrd .od-card.od-free{border-style:dashed}#einOrd .od-rh{display:flex;align-items:center;gap:10px;padding:8px 14px;background:#f6f8fc;border-bottom:1px solid #eef2f7}#einOrd .od-rh b{font-size:1rem}#einOrd .od-rh small{margin-left:auto;color:#7a879b;white-space:nowrap}#einOrd .od-chg{font-style:normal;background:#fff4e0;color:#c2410c;border-radius:8px;padding:0 8px;font-size:.78rem;font-weight:700}#einOrd .od-list .od-c{border:0;border-radius:0;margin:0;border-bottom:1px solid #eef2f7;padding:5px 12px}#einOrd .od-list .od-c:last-of-type{border-bottom:0}#einOrd .od-c.sel{background:#f2f7fd}#einOrd .od-list .od-p{background:#fafbfd}#einOrd .od-list .od-e{margin:10px 14px}#einOrd .od-cb,.od-ghost .od-cb{width:24px;height:24px;flex:none;border-radius:6px;border:2px solid #9aa7b8;background:#fff;display:grid;place-items:center;cursor:pointer;padding:0;color:#fff;font-weight:900;font-size:14px;line-height:1}#einOrd .od-cb.y,#einOrd .od-cb.p,.od-ghost .od-cb.y{background:#2f5f9b;border-color:#2f5f9b}#einOrd .od-cb.y:after,.od-ghost .od-cb.y:after{content:'✓'}#einOrd .od-cb.p:after{content:'–'}#einOrd .od-cb:disabled{opacity:.35;cursor:default}#einOrd .od-cb0{width:24px;flex:none}#einOrd .od-l .od-t{padding:8px 0}#einOrd .od-bar{display:flex;align-items:center;gap:12px;padding:10px 18px;background:#24334b;color:#fff;flex-wrap:wrap}#einOrd .od-sum{flex:1;min-width:200px}#einOrd .od-sum span{display:block;font-size:.85rem;color:#c9d3e2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw}#einOrd .od-bb{height:40px;padding:0 16px;border-radius:10px;border:1px solid #ffffff55;background:transparent;color:#fff;font:inherit;font-weight:650;cursor:pointer}#einOrd .od-bb.pri{background:#fff;color:#24334b;border-color:#fff}#einStu{border:0;border-radius:14px;padding:0;max-width:640px;width:calc(100% - 32px);box-shadow:0 20px 60px #0004}#einStu form{padding:20px 22px}#einStu h2{margin:0 0 4px;font-size:1.15rem}#einStu .muted{color:#66758a;margin:0 0 14px}#einStu .opt{display:flex;gap:10px;border:1px solid #d6dfeb;border-radius:12px;padding:12px 14px;margin:0 0 10px;cursor:pointer}#einStu .opt.on{border:2px solid #2f5f9b;background:#f4f8fd;padding:11px 13px}#einStu .opt input{position:absolute;opacity:0;pointer-events:none}#einStu .opt span{display:flex;flex-direction:column;gap:3px;min-width:0}#einStu .opt small{color:#556274;font-size:.88rem}#einStu .opt i{font-style:normal;color:#2f5f9b;font-size:.86rem;display:flex;align-items:center;gap:5px;overflow-wrap:anywhere}#einStu .opt i.err{color:#b42318}#einStu .acts{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}#einStu .acts button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;padding:0 14px;cursor:pointer}#einStu .acts .pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}#einStu .acts .pri:disabled{opacity:.5;cursor:default}#einJg{border:0;border-radius:14px;padding:0;max-width:460px;width:calc(100% - 32px);box-shadow:0 20px 60px #0004}#einJg form{padding:20px 22px}#einJg h2{margin:0 0 6px;font-size:1.1rem}#einJg .muted{color:#66758a;margin:0 0 12px}#einJg select{width:100%;height:42px;border:1px solid #cfd8e6;border-radius:10px;font:inherit;background:#f7f9fc;padding:0 8px}#einJg .acts{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}#einJg .acts button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;padding:0 14px;cursor:pointer}#einJg .acts .pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}#einOrd .od-rh .od-m{margin-left:4px}#einParts{border:0;border-radius:14px;padding:0;max-width:460px;width:calc(100% - 32px);box-shadow:0 20px 60px #0004}#einParts form{padding:20px 22px}#einParts h2{margin:0 0 12px;font-size:1.1rem}#einParts .pp{display:grid;grid-template-columns:1fr 1fr;gap:8px}#einParts label{display:flex;gap:8px;align-items:center}#einParts .acts{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}#einParts .acts button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;padding:0 14px;cursor:pointer}#einParts .acts .pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}#einOrd .od-cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px;align-items:start}#einOrd .od-col{background:#f6f8fc;border:1px solid #e3e9f2;border-radius:14px;padding:10px;min-height:120px}#einOrd .od-col.od-wide{max-width:760px;min-height:0}#einOrd .od-free{border-style:dashed}#einOrd .od-col h4{margin:2px 4px 10px;display:flex;justify-content:space-between;gap:8px}#einOrd .od-col h4 small{color:#7a879b;font-weight:500}#einOrd .od-e{color:#7a879b;font-size:.88rem;margin:6px 4px}#einOrd .od-c,.od-ghost{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #dce3ef;border-radius:10px;padding:6px 8px;margin-bottom:8px}#einOrd .od-c.hid{opacity:.6}#einOrd .od-p{background:#f1f3f7;color:#66758a;font-size:.9rem}#einOrd .od-g,.od-ghost .od-g{width:22px;flex:none;text-align:center;color:#9aa7b8;font-size:19px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}#einOrd .od-t,.od-ghost .od-t{flex:1;min-width:0;font-size:.93rem}#einOrd .od-t small{display:block;color:#7a879b;font-size:.78rem}#einOrd .od-t small.od-w{color:#c2410c}#einOrd .od-m,.od-ghost .od-m{width:42px;height:40px;flex:none;border:1px solid #c9d5e6;border-radius:10px;background:#fff;color:#2f5f9b;font-weight:800;cursor:pointer}#einOrd .od-src{opacity:.35}.od-ghost{position:fixed;z-index:10;pointer-events:none;margin:0;border-color:#e8a23a;background:#fffaf2;box-shadow:0 10px 24px #1d2b4033;box-sizing:border-box;max-width:min(640px,calc(100vw - 24px));border-radius:10px;border:1px solid #e8a23a}#einOrd .od-fold{flex:none;width:30px;height:30px;display:grid;place-items:center;border:0;background:none;color:#2f5f9b;border-radius:8px;cursor:pointer;padding:0}#einOrd .od-fold:hover{background:#eef3fa}#einOrd.od-dragr .od-card[data-rc] .od-fold svg{transform:rotate(-90deg)}#einOrd .od-rh .od-g{width:20px}#einOrd .od-card.od-fd>.od-list,#einOrd.od-dragr .od-card[data-rc]>.od-list{display:none}#einOrd .od-card.od-fd>.od-rh,#einOrd.od-dragr .od-card[data-rc]>.od-rh{border-bottom:0}#einOrd .od-rph{border:2px dashed #e8a23a;border-radius:14px;background:#fffaf2;margin-bottom:12px;box-sizing:border-box}.od-ghost.od-rghost{display:block;padding:0;border-radius:14px;overflow:hidden}.od-rghost>.od-list{display:none}#einOrd .od-ph{border:2px dashed #e8a23a;border-radius:10px;height:40px;background:#fffaf2;margin-bottom:8px}#einOrd .od-end{height:4px}#einOrd .od-rn{flex:1;min-width:0;display:flex;gap:6px;align-items:center;padding:3px 0}.od-rn .od-in:not(#_){flex:1;min-width:0;font:inherit;font-size:.93rem;border:2px solid #e8790c!important;border-radius:8px;padding:6px 9px;background:#fffaf4!important;outline:0;box-shadow:none;height:36px;box-sizing:border-box}.od-ok,.od-no{flex:none;width:36px;height:36px;border-radius:9px;display:grid;place-items:center;cursor:pointer;font-size:15px}.od-ok{background:#2f5f9b;border:0;color:#fff}.od-no{background:#fff;border:1px solid #cfd8e6;color:#243247}.od-menu{position:fixed;z-index:11;background:#fff;border:1px solid #dce3ef;border-radius:12px;box-shadow:0 14px 40px #1d2b4033;padding:6px;max-height:calc(100dvh - 16px);overflow:auto}#einOrd .od-menu button{display:block;width:100%;text-align:left;padding:10px 12px;border:0;border-radius:8px;background:none;font:inherit;color:#24334b;cursor:pointer}#einOrd .od-menu button:hover:not(:disabled){background:#eef3fa}#einOrd .od-menu button:disabled{color:#9aa7b8;cursor:default}#einOrd .od-menu .del{color:#c62828}#einOrd .od-menu hr{border:0;border-top:1px solid #e3e9f2;margin:4px}#einOrd .od-menu h6{margin:8px 12px 2px;font-size:.72rem;letter-spacing:.06em;color:#7a879b;text-transform:uppercase}@media (max-width:760px){#einOrd{width:100vw;height:100dvh;border-radius:0}#einOrd .od-sd{display:none}#einOrd .od-msel{display:block;width:100%;height:42px;border:1px solid #cfd8e6;border-radius:10px;font:inherit;margin-bottom:12px;background:#f7f9fc}#einOrd .od-cols{grid-template-columns:1fr}#einOrd .od-q{width:42vw}#einOrd .od-ban{flex-wrap:wrap}}#einAsk{border:0;border-radius:14px;padding:0;max-width:640px;width:calc(100% - 32px);box-shadow:0 20px 60px #0004}#einAsk form{padding:20px 22px}#einAsk h2{margin:0 0 4px}#einAsk .muted{color:#66758a;margin:0 0 10px}#einAsk .ask-r{display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #eef2f7;flex-wrap:wrap}#einAsk .ask-r b{flex:1;min-width:180px}#einAsk select{height:40px;border:1px solid #cfd8e6;border-radius:10px;padding:0 8px;font:inherit;background:#f7f9fc}#einAsk .acts{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}#einAsk .acts button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;padding:0 14px;cursor:pointer}#einAsk .acts .pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}#einExp .rg.rg-un{color:#c2410c}#einExp .ask-b{margin-left:auto;height:36px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:600;padding:0 12px;cursor:pointer}#einExp .rg{font-size:11px;font-weight:800;letter-spacing:.06em;color:#8a97aa;text-transform:uppercase;padding:10px 4px 2px 30px}#einExp .chg{font-style:normal;font-size:11px;font-weight:700;padding:2px 7px;border-radius:20px;background:#fff4e0;color:#c2410c;margin-left:6px}#einExp .rnote{margin:8px 0 12px}#einExp{max-height:calc(100dvh - 32px);overflow:auto}#einExp label small{margin-left:auto;color:#8a97aa}
#einExp input[type=checkbox]{width:20px;height:20px;accent-color:#2f5f9b;margin:0}
#einExp .parts{display:flex;flex-wrap:wrap;gap:4px 14px;margin:12px 0}#einExp .parts label{border:0;padding:4px 0}
#einExp .note,#einQr .note{background:#eef3fa;border-radius:10px;padding:10px 12px;color:#3c4d66;font-size:.9rem}
#einExp .acts,#einQr .acts{display:flex;gap:8px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
#einExp .acts button,#einQr .acts button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:650;padding:0 14px;cursor:pointer}
#einExp .acts button.pri,#einQr .acts button.pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}
#einQr{max-height:calc(100dvh - 24px);overflow:auto}#einQr .qr{display:flex;justify-content:center;margin:8px 0}#einQr .qr svg{width:300px;height:300px;max-width:100%}
#einQr.big{max-width:none;width:calc(100% - 32px);height:calc(100% - 32px)}#einQr.big .qr svg{width:min(78vh,90vw);height:min(78vh,90vw)}
#einQr code{display:block;font-size:.75rem;color:#66758a;word-break:break-all;max-height:3.2em;overflow:hidden}
/* 12.42: drei Etikett-Typen – Status (runde Pille), Kategorie (eckig mit Rand), Info (grauer Text) */.ein-row .neu,.rh-row .neu,.neu{display:inline-flex;align-items:center;height:20px;padding:0 8px;border:0;border-radius:99px;background:#e7f4ea;color:#2e7d32;font-size:11.5px;font-weight:650;line-height:1;flex:none}.gl-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;margin:5px 0}.gl-meta span:not(#_){display:inline;padding:0;border:0;border-radius:0;background:none!important;color:#66758a!important;font-size:.82rem;font-weight:500}.gl-meta span:not(#_):first-child,.gl-meta .vt1+span:not(#_),.gl-meta .vt3+span:not(#_){font-weight:650;color:#3b4a60!important}.gl-meta span:not(.vt1):not(.vt2):not(.vt3):not(.st-w):not(:first-child):not(.vt1+span):not(.vt3+span)::before{content:'· ';color:#9aa6b8}.gl-meta .vt1:not(#_),.gl-meta .vt2:not(#_),.gl-meta .vt3:not(#_){display:inline-flex;align-items:center;height:22px;padding:0 8px;border:1px solid;border-radius:6px;font-size:12px;font-weight:700}.gl-meta .vt1:not(#_){color:#2f5f9b!important;border-color:#c5d6ec;background:#f3f7fc!important}.gl-meta .vt2:not(#_){color:#9a6200!important;border-color:#f0d9a8;background:#fffaf0!important}.gl-meta .vt3:not(#_){color:#b3261e!important;border-color:#f2c9c4;background:#fff6f5!important}.gl-meta .st-w:not(#_){display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:99px;background:#fff1e3!important;color:#b3560c!important;font-size:12px;font-weight:650}/* 12.42: Seitenleiste – klare Ebenen */.ein-jg:not(#_){font-size:11px;font-weight:800;letter-spacing:.08em;color:#8a97aa}.ein-ch:not(#_){font-size:12.5px;font-weight:700;color:#5b6b82;letter-spacing:.01em}.ein-rr:not(#_)>span:not([class]){font-size:15.5px;font-weight:700;line-height:1.3}.ein-rr:not(#_):not(.on)>span:not([class]){color:#1d2b40}.ein-ur:not(#_)>span:not([class]){font-size:14px;font-weight:450;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;hyphens:auto}.ein-ur:not(#_):not(.on)>span:not([class]){color:#3b4a60}.ein-ur.on:not(#_)>span:not([class]){font-weight:600}.ein-ur.ein-in:not(#_){box-shadow:inset 2px 0 #e3e9f2;margin-left:12px;width:calc(100% - 12px);border-radius:0 8px 8px 0;padding-left:14px}.ein-ur.ein-in.on:not(#_){box-shadow:inset 2px 0 #2f5f9b}.ein-ur.ein-in .ein-gr{left:2px}.ein-row{position:relative}.ein-row>.ein-dt:not(#_){position:absolute;right:4px;top:50%;transform:translateY(-50%);opacity:0;pointer-events:none;box-shadow:-10px 0 8px -2px #fff}.ein-row:hover>.ein-dt:not(#_),.ein-row.on>.ein-dt:not(#_),.ein-row:focus-within>.ein-dt:not(#_),.ein-row>.ein-dt.on:not(#_){opacity:1;pointer-events:auto}.ein-row.on>.ein-dt:not(#_){box-shadow:-10px 0 8px -2px #eef3fa}.ein-ur:not(#_)>span:not([class]){-webkit-line-clamp:3}.ein-pt:not(#_){font-size:12.5px;font-weight:700;letter-spacing:.01em;text-transform:none;color:#5b6b82;margin:8px 10px 2px 26px}
@media (max-width:760px){html.cm-unterricht #einView{grid-template-columns:1fr}.ein-handle{display:none}.ein-side{display:none;border-right:0;border-bottom:1px solid var(--border-color,#dce3ef);max-height:60vh;padding:10px}#einView.side-open .ein-side{display:flex}#einView.side-open{grid-template-rows:auto 1fr}#einView.side-open .ein-main{order:-1;flex:none;padding-bottom:6px}#einView.side-open .ein-main>:not(.ein-pick){display:none}.ein-pick{display:block;width:100%;height:44px;border:1px solid #c9d5e6;border-radius:12px;background:#fff;color:#2f5f9b;font:inherit;font-weight:700;text-align:left;padding:0 14px;margin-bottom:12px}.ein-main{padding:12px}.ein-mh h2{font-size:1.15rem;flex-basis:100%}.ein-tiles{grid-template-columns:1fr}/* 12.71: iPhone – Knöpfe in einer Zeile, nur der Hauptknopf mit Text; Kopf kompakter */.ein-mh{gap:8px}.ein-mh .sp{display:none}.ein-mh>button,.ein-mh>span>button{height:40px;min-width:40px}.ein-main .ein-sub{font-size:.88rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:6px}.ein-tile{padding:12px 14px}html body .ein-tile>.ein-acts:not(#_){flex-wrap:nowrap!important;gap:5px!important;margin-top:8px!important;justify-content:flex-start!important}html body .ein-tile>.ein-acts>button:not(#_):not(#__){height:44px!important;min-width:44px!important;width:auto;padding:0 10px!important;flex:none!important}html body .ein-tile>.ein-acts>button.look:not(#_):not(#__),html body .ein-tile>.ein-acts>button.ein-icb:not(#_):not(#__),html body .ein-tile>.ein-acts>button.ein-one:not(#_):not(#__),html body .ein-tile>.ein-acts>button.ein-more:not(#_):not(#__){font-size:0!important;width:44px!important;min-width:44px!important;padding:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:0!important}html body .ein-tile>.ein-acts>button svg{width:20px;height:20px;margin:0;display:block}html body .ein-tile>.ein-acts:not(:has(>button.pri))>button.look:not(#_):not(#__):not(#___){font-size:.95rem!important;width:auto!important;padding:0 16px!important;display:inline-flex!important;gap:6px}html body .ein-tile>.ein-acts:not(:has(>button.pri))>button.look svg{width:18px;height:18px}html body .ein-tile>.ein-acts>button.pri:not(#_):not(#__){flex:1 1 auto!important;min-width:80px!important;justify-content:center}html body .ein-mh .sp{display:none}}`;
 {const g=document.createElement('style');g.textContent='.gl-pill{display:inline-flex;align-items:center;gap:5px;margin-left:8px;padding:1px 9px;border-radius:999px;background:#e5f5ea;color:#1f8a4c;font-size:.74rem;font-weight:750;font-style:normal;vertical-align:middle;white-space:nowrap;letter-spacing:.01em}.gl-pill i{width:7px;height:7px;border-radius:50%;background:#2f9e44}.ein-mh h2 .gl-pill{font-size:.8rem;padding:2px 11px;transform:translateY(-2px)}.gl-meta{display:flex;gap:5px;flex-wrap:wrap;margin:4px 0 4px}.gl-meta span{font-size:.76rem;padding:2px 8px;border-radius:999px;background:#eef3fa;color:#2f5f9b;font-weight:650}.lp-h{margin:18px 0 4px;font-size:1.05rem}.ein-tile.gl-next{border:1.5px dashed #c9b8f0!important;background:#fcfaff!important}.ein-tile.gl-next>i{background:#f3ecfd!important;color:#7c3aed!important}.ein-tile.gl-next>b{color:#7c3aed!important}';document.head.append(g)}
  const st=document.createElement('style');st.textContent=css;document.head.append(st);
 /* 12.14: Layout A – Abschnitte als Überschrift, Inhalte als kompakte Zeilen; Sequenzen im Seitenmenü einklappbar */
 {const s2=document.createElement('style');s2.textContent='.ein-main{container-type:inline-size}.ein-part{display:block;margin:0 0 4px}.ein-pl{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px;padding:12px 0 8px}.ein-pl .n{margin-right:0;align-self:center}.ein-pl small{display:inline;margin:0;font-size:.84rem}'
  +'.ein-tiles{display:flex;flex-direction:column;gap:7px}.ein-tile{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:14px;row-gap:1px;align-items:center;padding:9px 10px 9px 14px}.ein-tile>i{display:none}.ein-tile>b{grid-column:1;font-size:1rem}.ein-tile>small{grid-column:1;font-size:.82rem}'
  +'.ein-tile{grid-template-columns:minmax(0,1fr) minmax(394px,auto)}.ein-tile>.ein-acts{grid-column:2;grid-row:1/span 4;margin-top:0;flex-wrap:nowrap;justify-content:flex-start;align-items:center}.ein-tile>.ein-acts>button.look{min-width:116px;justify-content:center}.ein-tile>.ein-acts:not(:has(>button.pri)){justify-content:flex-end}.ein-tile>.ein-acts>button.pri{min-width:140px;justify-content:center}.ein-tile>.ein-acts button{height:38px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px}.ein-acts button.ein-icb{width:38px;padding:0;justify-content:center}.ein-acts button.look:not(#_),.ein-acts>button.pri:not(#_){min-width:132px;justify-content:center;display:inline-flex;align-items:center;gap:7px}/* 12.49: Reihenfolge Ansehen · Start · AirDrop · Rest */.ein-tile>.ein-acts>*:not(#_){order:4}.ein-tile>.ein-acts>button.look:not(#_){order:1}.ein-tile>.ein-acts>button.pri:not(#_){order:2}.ein-acts>button.air.ein-icb:not(#_):not(#__){order:3;width:40px;height:40px;display:inline-grid;place-items:center;padding:0}.ein-acts>button.ein-one:not(#_){display:inline-grid;place-items:center;width:40px;height:40px;padding:0;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;border-style:solid}.ein-acts>button.ein-one svg{width:18px;height:18px}/* 12.38: ein Mehr-Knopf-Stil */.ein-acts button.ein-more{display:inline-grid;place-items:center;width:38px;height:38px;border-color:#c9d5e6;color:#2f5f9b}.ein-acts button.ein-more.on,.ein-dt.on:not(#_){background:#fff6ec;border-color:#e8822a;color:#b3560c}.ein-dt:not(#_){display:inline-grid;place-items:center;width:30px;height:30px;padding:0;box-sizing:border-box;border:1px solid #d6dce8;border-radius:8px;background:#fff;color:#2f5f9b;opacity:1}.ein-dt:not(#_):hover{border-color:#2f5f9b}.ein-dt svg{width:16px;height:16px}.ein-tmenu .del{color:#c0392b}.ein-acts button[hidden]{display:none}'
  +'@container (max-width:720px){.ein-tile{grid-template-columns:1fr}.ein-tile>.ein-acts{grid-column:1;grid-row:auto;flex-wrap:wrap;justify-content:flex-start;margin-top:7px}}'
  +'@container (max-width:860px){.ein-tile:has(>.ein-acts>button.air){grid-template-columns:1fr}.ein-tile:has(>.ein-acts>button.air)>.ein-acts{grid-column:1;grid-row:auto;flex-wrap:wrap;justify-content:flex-start;margin-top:7px}}'
  +'.ein-lkh svg:last-child{margin-left:-2px;opacity:.8}.ein-lkh.on{border-color:#e8822a;background:#fff6ec;color:#b3560c}.ein-tmenu .lk-mi{display:flex!important;align-items:flex-start;gap:11px;text-align:left;white-space:normal;padding:9px 11px!important}.ein-tmenu .lk-mi svg{width:19px;height:19px;flex:none;margin-top:1px;color:#2f5f9b}.ein-tmenu .lk-mi b{display:block;font-weight:600;color:#2f5f9b}.ein-tmenu .lk-mi small{display:block;color:#6b7a90;font-size:.78rem;font-weight:400;margin-top:1px}.ein-airh{flex:none;height:40px;margin-right:8px;display:inline-flex;align-items:center;gap:6px;padding:0 13px;border:1px solid #a8bdd8;border-radius:10px;background:#fff;color:#2f5f9b;font:inherit;font-size:.88rem;font-weight:650;cursor:pointer;white-space:nowrap}.ein-airh:hover{background:#f3f7fd}@media (max-width:640px){.ein-airh span{display:none}.ein-airh{padding:0 11px}}.ein-mm{min-width:220px}'
  +'.ein-row .ein-vt{flex:0 0 auto!important;width:auto!important;min-width:0!important;margin-left:auto;align-self:flex-start;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:99px;background:#ece6fb;color:#5b3fb0;white-space:nowrap}.ein-row .stand+.ein-vt{margin-left:6px}.ein-vts{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 10px}.ein-vtb{display:inline-flex;align-items:center;min-height:36px;border:0;border-radius:99px;padding:0 14px;background:#ece6fb;color:#5b3fb0;font:inherit;font-weight:700;font-size:14px;cursor:pointer}.ein-vtb:hover{background:#e0d6f8}'+'.ein-icb.done,button.abg.done{border-color:#f0b27a!important;background:#fff1e3!important;color:#c2410c!important}'+'.ein-row .ein-done{flex:0 0 auto!important;width:auto!important;min-width:0!important;margin-left:auto;align-self:flex-start;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e6f5ec;color:#1e7a45;white-space:nowrap;cursor:pointer}.ein-row .ein-done:hover{background:#d3eedd}.ein-done{font-variant-numeric:tabular-nums}'+'.ein-ptf{display:flex;align-items:center;gap:6px;width:calc(100% - 12px);border:0;background:none;font-family:inherit;text-align:left;padding:6px 4px;margin:10px 6px 2px;border-radius:8px;cursor:pointer;min-height:36px}.ein-ptf:hover{background:#eef2f8}.ein-ptf .ein-cv{flex:0 0 22px;display:inline-grid;place-items:center;width:22px;height:22px;margin:0;color:#2f5f9b;transition:transform .15s;transform:rotate(90deg)}.ein-ptf.cl .ein-cv{transform:none}.ein-ptf small{margin-left:auto;font-weight:600;letter-spacing:0;color:#8a97aa}'+'.ein-row.ein-rr{align-items:center}.ein-row .ein-cv{flex:0 0 26px;display:inline-grid;place-items:center;width:26px;height:26px;margin:-4px 0 -4px -6px;border-radius:7px;color:#2f5f9b;transition:transform .15s;transform:rotate(90deg)}.ein-rr.cl .ein-cv{transform:none}.ein-cv:hover{background:#e9eef7}.ein-rr.cl{color:#5b6b82;font-weight:600}.ein-row.ein-in{padding-left:36px}';
  document.head.append(s2)}
 const view=document.createElement('div');view.id='einView';grid.append(view);
 let on=false,sel=null,q='',sideOpen=false,keepSel=false;
 /* 12.70: iPhone – die aufgeklappte Liste nutzt die ganze freie Höhe bis unten (statt fest 60 %) */
 function sideFit(){try{const sd=view&&view.querySelector('.ein-side');if(!sd)return;if(!matchMedia('(max-width:760px)').matches){sd.style.maxHeight='';return}const t=sd.getBoundingClientRect().top;sd.style.maxHeight=Math.max(260,Math.floor((visualViewport?.height||innerHeight)-Math.max(0,t)-22))+'px'}catch{}}
 addEventListener('resize',()=>sideFit());
 function mode(v){on=!!v;document.documentElement.classList.toggle('cm-unterricht',on);if(on){sel=null;q='';sideOpen=false;render()}tabsDeco()}
 window.classroomEinheiten={mode,openMat:()=>openMat(),standOf:k=>{try{const id=rd(STAND)[k];if(!id||!data)return null;const f=find(id),t=f.l?lname(f.l):f.u?f.u.title:f.t?f.t.title:f.r?rName(f.r):null;return t?{id,t}:null}catch{return null}},show:()=>mode(true),hide:()=>mode(false),get on(){return on},/* 11.43: von einer Nadel aus öffnen */open:async id=>{sel=id;keepSel=true;await render()},pinId:()=>on&&cx&&sel?'ein|'+cx.subject+'|'+cx.classId+'|'+sel:null};
 /* Kontext der Lerngruppe (der Noten-Manager führt; der Sitzplan folgt ihm) */
 const jgOf=lab=>{lab=String(lab||'').trim();const d=new Date(),end=d.getMonth()>=7?d.getFullYear()+1:d.getFullYear();/* 12.28: Oberstufen-Kurs mit Abiturjahrgang am Ende (z. B. EK1e28 → Abitur 2028 → Jg. 12) */const k=/^[A-Za-zÄÖÜäöü]{1,4}\s*\d?\s*[A-Za-z]{0,2}\s*(\d{2})$/.exec(lab);if(k){const jg=13-(2000+ +k[1]-end);if(jg>=10&&jg<=13)return jg}const m=/(\d{1,2})\s*[a-zäöü]?\s*$/i.exec(lab)||/(\d{1,2})/.exec(lab);const n=m?+m[1]:0;return n>=1&&n<=13?n:0};
 function ctx(){const b=B();let c={};try{c=b?.context()||{}}catch{}const lab=c.label||'';
  return {subject:c.subject||'',label:lab,short:lab.replace(/^Klasse\s+/i,''),classId:c.classId||'',jg:jgOf(lab),key:(c.subject||'')+'::'+(c.classId||'')}}
 let data=null,openJg=new Set(),cx=null,ALA={};
 const load=async()=>{const b=B();if(!b)return null;try{await b.ttReady?.()}catch{}return {lessons:b.lessons(),units:(await b.units()).map(u=>{const t=(edOf('_units').names||{})[u.u];return t?{...u,t0:u.title,title:t}:u}),reihen:(b.reihen?await b.reihen():[]).map(r=>{const e=edOf(r.id);let x=e.title?{...r,title:e.title}:r;/* 12.32: eigener Obertitel */if(typeof e.ch==='string')x={...x,ch0:r.ch||'',ch:e.ch};return x})}};/* 11.84: umbenannte Reihen */
 const blocks=l=>(l.nV?1:0)+(l.nW?1:0)+(l.gr.length?1:0)+(l.ueb?1:0)+(l.tt.length?1:0);
 const lname=l=>l.tag+(l.name?' '+l.name:'');
 /* Stand = aktuelle Lektion/Einheit dieser Lerngruppe */
 /* 11.57: Unterrichtsreihen kommen aus Reihen-Dateien (.cmreihe). Eigene Änderungen (Reihenfolge, Namen, ausgeblendet, gelöscht,
    eigene Einträge) liegen nur auf diesem Gerät und bleiben erhalten, wenn eine neuere Fassung der Reihe geladen wird. */
 const EKEY='classroom-reihen-edit-v1';/* 13.41: eigene Reihenfolge der Reihen je Fach und Jahrgang */const OKEY='classroom-reihen-order-v1';const rOrd=(s,j)=>rd(OKEY)[s+'|'+(+j)]||[];const edAll=()=>rd(EKEY),edOf=id=>edAll()[id]||{},edSet=(id,e)=>{const a=edAll();a[id]=e;wr(EKEY,a)};
 /* 13.42: doppelte Schlüssel reparieren – beim Verschieben mehrerer Einheiten in derselben Millisekunde bekamen sie denselben Schlüssel und „klebten“ dann aneinander */function dupFix(r){const e=edOf(r.id),own=e.own||[];if(!own.length)return;const seen=new Set((r.entries||[]).map(x=>x.k));let ch=false;const ord=[...(e.order||[])];for(const o of own){if(seen.has(o.k)){const old=o.k;let n=2;while(seen.has(old+'_'+n))n++;o.k=old+'_'+n;const i=ord.indexOf(old);if(i>=0)ord.splice(i+1,0,o.k);ch=true}seen.add(o.k)}if(ch){e.own=own;if(e.order)e.order=ord;edSet(r.id,e)}}
 function eff(r){dupFix(r);const e=edOf(r.id),del=new Set(e.del||[]),names=e.names||{},hid=new Set(e.hid||[]),show=new Set(e.show||[]);const L=[...(r.entries||[]),...(e.own||[]).map(x=>({...x,own:1}))].filter(x=>!del.has(x.k));
  const ord=e.order||[],pos=k=>{const i=ord.indexOf(k);return i<0?1e6:i};
  return L.map((x,i)=>({...x,i})).sort((a,b)=>pos(a.k)-pos(b.k)||a.i-b.i).map(x=>({k:x.k,t:names[x.k]||x.t,t0:x.t,u:x.u||null,...(x.les!=null?{les:String(x.les)}:{}),own:!!x.own,hid:hid.has(x.k)||(!!x.hid&&!show.has(x.k))}))}
 const lesJg=k=>(data?.lessons||[]).find(l=>l.k===String(k))?.jg;
 /* 12.56: Latein-Reihen ohne Pontes-Lektionen (z. B. Lektüre) nach ihrem Jahrgang wie in den anderen Fächern */const reihenOf=(subj,jg)=>{const O=rOrd(subj,jg),p=r=>{const i=O.indexOf(r.id);return i<0?1e9:i};return (data?.reihen||[]).filter(r=>r.subject===subj&&(subj==='latein'&&(r.entries||[]).some(e=>e.les!=null)?(r.entries||[]).some(e=>e.les!=null&&lesJg(e.les)===+jg):+r.jg===+jg)).sort((a,b)=>p(a)-p(b)||(+a.n||0)-(+b.n||0)||String(a.ch).localeCompare(String(b.ch))||String(a.title).localeCompare(String(b.title)))};
 const rMoveTo=(subj,jg,rid,i)=>{const ids=reihenOf(subj,jg).map(r=>r.id).filter(x=>x!==rid);ids.splice(Math.max(0,Math.min(i,ids.length)),0,rid);const a=rd(OKEY);a[subj+'|'+(+jg)]=ids;wr(OKEY,a)};
 const topicId=(r,jg,x,unit)=>x.les!=null?'l:'+x.les:unit?'u:'+x.u:r.subject==='latein'?'t:'+r.id+'.'+x.k:'t:'+jg+':'+(x.own?r.id+'.'+x.k:x.k);
 const topicsOf=(r,jg,all)=>{const o=[];for(const x of eff(r)){if(x.hid&&!all)continue;const unit=x.u&&data.units.find(y=>y.u===x.u),les=x.les!=null?data.lessons.find(l=>l.k===String(x.les))||null:null;if(x.les!=null&&!les)continue;o.push({id:topicId(r,jg,x,unit),k:x.k,title:x.t,u:unit||null,l:les,ch:r.ch,part:r.title,rid:r.id,jg,own:x.own,hid:x.hid})}return o};
 const topics=(subj,jg,all)=>reihenOf(subj,jg).flatMap(r=>topicsOf(r,jg,all));
 const allTopics=()=>(data?.reihen||[]).flatMap(r=>topicsOf(r,r.subject==='latein'?0:+r.jg));
 const reiheOf=id=>(data?.reihen||[]).find(r=>r.id===id)||null;
 /* 12.56: auch Lerneinheiten aus Latein-Reihen (z. B. Lektüre) lassen sich als „aktuell“ markieren */const items=()=>cx.subject==='latein'?[...data.lessons.map(l=>'l:'+l.k),...data.units.filter(u=>u.subject==='latein').map(u=>'u:'+u.u),...allTopics().filter(t=>!t.u&&!t.l).map(t=>t.id)]:cx.subject?[...data.units.map(u=>'u:'+u.u),...allTopics().filter(t=>!t.u).map(t=>t.id)]:[];
 function stand(){const s=rd(STAND)[cx.key];if(s&&items().includes(s))return s;
  /* 11.43: nur Inhalte dieser Lerngruppe (Fach + Jahrgang) – sonst nichts vorwählen */
  const v=visIds();if(cx.subject&&cx.subject!=='latein')return v.find(id=>id.startsWith('u:'))||v.find(id=>id.startsWith('t:'))||v[0]||'';
  if(cx.subject==='latein'){const ls=data.lessons.filter(l=>l.jg===cx.jg);const best=ls.filter(l=>blocks(l)).at(-1)||ls[0];return best?'l:'+best.k:''}return ''}
 const visIds=()=>{if(cx.subject==='latein'){if(ui.allL)return data.lessons.map(l=>'l:'+l.k);const RS=reihenOf('latein',cx.jg),T=topics('latein',cx.jg).map(t=>t.id),own=data.lessons.filter(l=>l.jg===cx.jg).map(l=>'l:'+l.k);return [...new Set([...RS.map(r=>'r:'+r.id),...T,...own])]}if(!cx.subject)return [];const RS=reihenOf(cx.subject,cx.jg).map(r=>'r:'+r.id),T=topics(cx.subject,cx.jg).map(t=>t.id),TA=topics(cx.subject,cx.jg,1).map(t=>t.id),U=data.units.filter(u=>u.subject===cx.subject&&u.jg===cx.jg).sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'de',{numeric:true}))/* 12.50: lose Einheiten wie in „Inhalte organisieren“ nach Titel (1, 2, … 10) */.map(u=>'u:'+u.u);return [...RS,...T,...U.filter(id=>!TA.includes(id))]};
 const setStand=v=>{const s=rd(STAND);if(v)s[cx.key]=v;else delete s[cx.key];wr(STAND,s);tabsDeco()};
 /* 12.71: die Leiste oben (Noten-Manager) zeigt im Unterricht bei jeder Klasse ihre aktuelle Stunde */const tabsDeco=()=>{try{NF()?.classroomClassTabsDeco?.()}catch{}};
 const isStand=id=>rd(STAND)[cx.key]===id;
 /* 12.00: Etikett „neu“ für frisch importierte Reihen, Stunden und Lerneinheiten – weg nach dem Öffnen oder nach 14 Tagen */
 const NEUK='classroom-neu-v1',NEUB='<span class="neu">neu</span>';let NEU={};
 const neuLoad=()=>{const a=rd(NEUK),now=Date.now();let ch=0;for(const k of Object.keys(a)){const x=a[k];if(!x||!(now-(+x.t||0)<14*864e5)||(x.k&&!x.k.length)){delete a[k];ch=1}}if(ch)wr(NEUK,a);NEU=a;return a};
 const neuTp=tp=>!!tp&&((NEU['r:'+tp.rid]?.k||[]).includes(tp.k)||(!!tp.u&&!!NEU['u:'+tp.u.u]));
 const neuR=r=>!!(NEU['r:'+r.id]?.k||[]).length;
 function neuSeen(id){if(!id||id.startsWith('r:'))return;const a=rd(NEUK);let ch=0;for(const tp of allTopics())if(tp.id===id){const x=a['r:'+tp.rid];if(x?.k?.includes(tp.k)){x.k=x.k.filter(k=>k!==tp.k);if(!x.k.length)delete a['r:'+tp.rid];ch=1}}if(id.startsWith('u:')&&a[id]){delete a[id];ch=1}if(ch)wr(NEUK,a)}
 const find=id=>id?.startsWith('r:')?{r:reiheOf(id.slice(2))}:id?.startsWith('l:')?{l:data.lessons.find(x=>x.k===id.slice(2))}:id?.startsWith('u:')?{u:data.units.find(x=>x.u===id.slice(2))}:id?.startsWith('t:')?{t:allTopics().find(x=>x.id===id)}:{};
 const sub=l=>[...l.formen.slice(0,3),l.syntax&&'Syntax: '+l.syntax].filter(Boolean).map(esc).join(' · ');
 /* 11.26: festes Seitenmenü (Breite per Schieber), Schalter „Aktuelle Lektion“, Punkte je Baustein, Suche nach Thema */
 /* 12.76: iPad/iPhone – Hover-Regeln entfernen; sie lassen Safari den ersten Tipp als „Hover“ werten (sonst braucht jede Zeile zwei Tipps) */
 let hoverStripped=0;function stripHover(){try{if(!matchMedia('(hover: none)').matches)return;for(const sh of document.styleSheets){let R;try{R=sh.cssRules}catch{continue}const walk=L=>{for(let i=L.length-1;i>=0;i--){const r=L[i];if(r.cssRules&&!r.selectorText){walk(r.cssRules);continue}if(!r.selectorText||!r.selectorText.includes(':hover'))continue;const keep=r.selectorText.split(',').filter(x=>!x.includes(':hover'));if(keep.length)r.selectorText=keep.join(',');else (r.parentRule||sh).deleteRule(i)}};walk(R)}hoverStripped=document.styleSheets.length}catch{}}
 async function render(){if(!on)return;if(hoverStripped!==document.styleSheets.length)stripHover();const k0=cx?.key;cx=ctx();data=await load();/* 12.71: Klasse oben gewechselt → deren aktuelle Stunde (Lesezeichen) */if(k0&&k0!==cx.key&&!keepSel)sel=null;keepSel=false;
  /* 11.53: Alternative Lateinarbeiten (private Dateien) ab Lektion 15 */ALA={};try{const b=B();if(data&&b?.ala)for(const l of data.lessons)if(/^\d+$/.test(l.k)&&+l.k>=15){const x=await b.ala(l.k);if(x)ALA[l.k]=x}}catch{}
  if(!data){view.innerHTML='<div class="ein-body ein-empty">Der Unterricht ist gerade nicht erreichbar. Öffne einmal „Noten“ und versuche es erneut.</div>';return}
  {const f=find(sel);if((!f.l&&!f.u&&!f.t&&!f.r)||!okSel(sel))sel=stand()}draw();tabsDeco()}
 /* 11.28: Buchstaben-Chips (V · G · Ü · W) in der Zeile unter dem Lektionstitel – kräftig = vorhanden, blass = fehlt noch */
 const chips=l=>'<span class="ein-chips">'+[['V',l.nV,'Vokabeln'],['G',l.gr.length,'Grammatik'],['Ü',l.tt.length,'Übersetzungs-Trainer','t'],['W',l.nW,'Wiederholung']].map(([c,n,t,o])=>'<i class="'+(n?(o?'on t':'on'):'')+'" title="'+t+(n?'':' – fehlt noch')+'">'+c+'</i>').join('')+'</span>';
 /* 11.29: Themen aus dem Inhaltsverzeichnis unter dem Lektionstitel (ohne Inhaltsverzeichnis: Grammatik-Themen) */
 function tocHtml(l){const T=l.toc;if(!T){vtLoad();const VTs=vtOf(l.k);return '<p class="ein-sub">'+(sub(l)||'&nbsp;')+'</p>'+(VTs.length?'<div class="ein-vts">'+VTs.map(t=>'<button type="button" class="ein-vtb" data-vto="'+esc(t.id)+'" title="Ergebnisse öffnen">'+esc(t.title)+' · '+esc(vtD(t.last))+(t.avg!=null?' · Ø '+t.avg.toFixed(1).replace('.',','):'')+' ›</button>').join('')+'</div>':'')}const li=a=>(a||[]).map(esc).join(' · ');
  const head=[T.text&&'Lektionstext: <b>'+esc(T.text)+'</b>',T.sach&&'Sachinfo: '+esc(T.sach)].filter(Boolean).join(' · ');
  const L=[['Syntax',T.syn],['Formenlehre',T.form],['Wortschatz',T.wort]].filter(x=>x[1]).map(([k,v])=>'<div class="ein-tr"><i>'+k+'</i>'+esc(v)+'</div>').join('');
  const R=[['Textkompetenz',T.textk],['Kulturkompetenz',T.kult],['Medienkompetenz',T.med]].filter(x=>x[1]?.length).map(([k,v])=>'<div class="ein-tk">'+k+'</div><div class="ein-tr">'+li(v)+'</div>').join('');
  const O=T.orig?'<div class="ein-tk">Originaltext (fakultativ)</div><div class="ein-tr"><b>'+esc(T.orig.t)+'</b>'+(T.orig.q?' · '+esc(T.orig.q):'')+'</div>':'';
  vtLoad();const VTs=vtOf(l.k),vtH=VTs.length?'<div class="ein-vts">'+VTs.map(t=>'<button type="button" class="ein-vtb" data-vto="'+esc(t.id)+'" title="Ergebnisse öffnen">'+esc(t.title)+' · '+esc(vtD(t.last))+(t.avg!=null?' · Ø '+t.avg.toFixed(1).replace('.',','):'')+' ›</button>').join('')+'</div>':'';
  return (head?'<p class="ein-sub">'+head+'</p>':'')+vtH+'<div class="ein-toc"><div>'+(L?'<div class="ein-tk">Sprachkompetenz</div>'+L:'')+'</div><div>'+R+O+'</div></div>'}
 const dots=l=>'<span class="ein-dots" title="Vokabeln · Grammatik · Übersetzungs-Trainer · Wiederholung">'+[['dv',l.nV],['dg',l.gr.length],['dt',l.tt.length],['dw',l.nW]].map(([c,n])=>'<b class="'+(n?c:'')+'"></b>').join('')+'</span>';
 /* 12.67: iPad-Tests der Lerngruppe zu einer Lektion – violette Pille links, Pillen unter dem Titel */
 let VT=[];const vtLoad=()=>{VT=[];try{VT=B()?.tests?.(cx.subject,cx.classId)||[]}catch{}};const vtOf=k=>VT.filter(t=>t.les===String(k)).sort((a,b)=>b.last-a.last);const vtD=t=>{try{return new Date(t).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}catch{return ''}};
 const vtP=l=>{const T=vtOf(l.k);return T.length?'<span class="ein-vt" title="'+esc(T.map(t=>t.title+' · '+vtD(t.last)).join('\n'))+'">Test '+esc(vtD(T[0].last))+'</span>':''};
 const rowL=(l,t,ind,nw)=>'<button type="button" class="ein-row'+(ind?' ein-in':'')+(sel==='l:'+l.k?' on':'')+(blocks(l)&&(!ind||l.jg===cx.jg)?'':' dim')+'" data-sel="l:'+esc(l.k)+'"><span>'+esc(t?l.tag+' '+t:lname(l))+'</span>'+(nw?NEUB:'')+(isStand('l:'+l.k)?'<span class="stand">aktuell</span>':'')+vtP(l)+'</button>';
 const GLP='';/* 11.60: ohne „Grundlagen“-Pille */
 /* 12.31: Inhalte direkt im Baum ordnen – Kästchen (mehrere auswählen), Griff ⠿ (ziehen) und ⋯ (Menü) an Einheiten und Reihen; Latein bleibt im Fenster „Alle Inhalte“ */
 const orgOn=()=>cx&&cx.subject&&cx.subject!=='latein'&&!ui.allL;
 /* 12.32: Variante C ohne Häkchen – Mehrfachauswahl entfällt */const tCk=(t,id)=>false?'<span class="ein-ck'+(CHK[t].has(id)?' y':'')+'" data-tck="'+t+'" data-id="'+esc(id)+'" role="checkbox" aria-checked="'+CHK[t].has(id)+'" aria-label="Auswählen"></span>':'';
 const tGrip=(u,tp)=>orgOn()?'<span class="ein-gr" data-tgrip data-u="'+esc(u.u)+'" data-r="'+esc(tp?.rid||'')+'" data-k="'+esc(tp?.k||'')+'" title="Ziehen: in eine andere Reihe oder an eine andere Stelle" aria-hidden="true">⠿</span>':'';
 const tDots=(attr,lab)=>orgOn()?'<span class="ein-dt" '+attr+' role="button" tabindex="0" aria-label="Aktionen für '+esc(lab)+'" title="Weitere Aktionen"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg></span>':'';
 /* 12.66: Pille mit Datum, wenn die Lerneinheit in dieser Klasse durchgeführt wurde (gestartet oder Abgaben gescannt) – antippen öffnet die Auswertung */
 let DONE=new Map();const doneLoad=()=>{DONE=new Map();try{for(const x of B()?.usage?.()||[])if(x.k===cx.key&&x.last&&(!DONE.has(x.u)||x.last>DONE.get(x.u).last))DONE.set(x.u,x)}catch{}};
 const doneP=id=>{const x=DONE.get(id);if(!x)return '';let d='';try{d=new Date(x.last).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}catch{}return '<span class="ein-done" data-ov="'+esc(id)+'" role="button" tabindex="0" title="Durchgeführt am '+esc(d)+(x.n?' · '+x.n+' Abgaben':'')+' – antippen: Auswertung">✓ '+esc(d)+'</span>'};
 const rowU=(u,t,ind,nw,tp)=>'<button type="button" class="ein-row ein-ur'+(ind?' ein-in':'')+(sel==='u:'+u.u?' on':'')+(CHK.u.has(u.u)?' ck':'')+'" data-sel="u:'+esc(u.u)+'" data-u="'+esc(u.u)+'" data-r="'+esc(tp?.rid||'')+'" data-k="'+esc(tp?.k||'')+'">'+tCk('u',u.u)+tGrip(u,tp)+'<span>'+esc(t||u.title)+(u.gl?GLP:'')+'</span>'+((nw||NEU['u:'+u.u])&&!DONE.has(u.u)?NEUB:'')+(isStand('u:'+u.u)?'<span class="stand">aktuell</span>':'')+doneP(u.u)+tDots('data-tmu="'+esc(u.u)+'" data-r="'+esc(tp?.rid||'')+'" data-k="'+esc(tp?.k||'')+'"',t||u.title)+'</button>';
 const norm=x=>String(x||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9äöüß]+/g,' ').trim();
 /* 11.43: Seitenmenü zeigt nur die Inhalte der gewählten Lerngruppe (Fach + Jahrgang), keine anderen Klassen oder Fächer */
 /* 12.14: Sequenzen ein-/ausklappen (gemerkt je Gerät) */const rCl=id=>!!(ui.cl&&ui.cl[id]);
 const rowR=(r,n,cl)=>'<button type="button" class="ein-row ein-rr'+(cl?' cl':'')+(sel==='r:'+r.id?' on':'')+(CHK.r.has(r.id)?' ck':'')+'" data-sel="r:'+esc(r.id)+'" data-rid="'+esc(r.id)+'">'+tCk('r',r.id)+(orgOn()?'<span class="ein-gr" data-tgripr="'+esc(r.id)+'" title="Ziehen: unter einen anderen Obertitel" aria-hidden="true">⠿</span>':'')+'<span class="ein-cv" data-tg="'+esc(r.id)+'" role="button" aria-expanded="'+!cl+'" aria-label="'+(cl?'Aufklappen':'Zuklappen')+'" title="'+(cl?'Aufklappen':'Zuklappen')+'"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span><span>'+esc((r.lab?r.lab+' ':'')+r.title)+'</span>'+(neuR(r)?NEUB:'')+'<small>'+n+'</small>'+tDots('data-tmr="'+esc(r.id)+'"',r.title)+'</button>';
 const rowT=(t,nw)=>'<button type="button" class="ein-row ein-in dim'+(sel===t.id?' on':'')+'" data-sel="'+esc(t.id)+'" title="Noch keine Lerneinheit"><span>'+esc(t.title)+'</span>'+(nw?NEUB:'')+(isStand(t.id)?'<span class="stand">aktuell</span>':'')+'</button>';
 /* 12.32: Obertitel mit ⋯ (umbenennen, neue Reihe) – und Ziel beim Ziehen einer Reihe */
 const chHead=c=>c?'<div class="ein-ch" data-chn="'+esc(c)+'"><span>'+esc(c)+'</span>'+tDots('data-tmc="'+esc(c)+'"','Obertitel '+c)+'</div>':'<div class="ein-ch ein-ch0" data-chn="">Ohne Obertitel</div>';
 /* 12.56: Suche auch in anderen Jahrgängen – Treffer stehen unter „In anderen Jahrgängen“ und lassen sich öffnen */
 const FOR=new Set(),okSel=id=>visIds().includes(id)||FOR.has(id);
 const rJg=r=>{const e=(r.entries||[]).find(x=>x.les!=null);return (e&&lesJg(e.les))||+r.jg||''};
 function otherJg(){const t=norm(q);if(!t||!data||(cx.subject==='latein'&&ui.allL))return '';const vis=new Set(visIds());
  const R=(data.reihen||[]).filter(r=>r.subject===cx.subject&&!vis.has('r:'+r.id)&&norm([r.title,r.ch,r.lab,...(r.entries||[]).map(e=>e.t)].join(' ')).includes(t));
  const U=cx.subject==='latein'?[]:data.units.filter(u=>u.subject===cx.subject&&!vis.has('u:'+u.u)&&!R.some(r=>(r.entries||[]).some(e=>e.u===u.u))&&norm(u.title+' '+(u.sub||'')).includes(t));
  if(!R.length&&!U.length)return '';
  const jg=x=>x?'<small>Jg. '+esc(x)+'</small>':'';
  return '<div class="ein-pt ein-ojg">In anderen Jahrgängen</div>'+R.map(r=>'<button type="button" class="ein-row ein-ojr'+(sel==='r:'+r.id?' on':'')+'" data-sel="r:'+esc(r.id)+'" data-ojg><span>'+esc((r.lab?r.lab+' ':'')+r.title)+'</span>'+jg(rJg(r))+'</button>').join('')
   +U.map(u=>'<button type="button" class="ein-row'+(sel==='u:'+u.u?' on':'')+'" data-sel="u:'+esc(u.u)+'" data-ojg><span>'+esc(u.title)+'</span>'+jg(u.jg)+'</button>').join('')}
 function treeHtml(){const h=treeHtml0(),o=otherJg();if(!o)return h;return /Nichts gefunden\./.test(h)?o:h+o}
 function treeHtml0(){neuLoad();doneLoad();vtLoad();const subj=SUBJ[cx.subject]||cx.subject||'',ids=visIds(),t=norm(q);
  const L=ids.map(id=>find(id)).filter(x=>{if(!t)return true;if(x.r)return norm(x.r.title+' '+x.r.ch).includes(t);if(x.t)return norm(x.t.title+' '+x.t.part).includes(t);if(x.l){const l=x.l,T=l.toc||{};return [lname(l),l.label,T.syn,T.form,T.wort,...(T.textk||[]),...(T.kult||[]),T.text,T.sach,...l.gr,...l.formen,l.syntax].filter(Boolean).some(v=>norm(v).includes(t))}return norm(x.u.title+' '+x.u.sub).includes(t)});
  if(!ids.length)return '<div class="ein-empty" style="padding:8px">Für die '+esc(cx.short||'Lerngruppe')+(subj?' ('+esc(subj)+')':'')+' sind noch keine Einheiten vorhanden.</div>'+(cx.subject==='latein'?'<button type="button" class="ein-all" data-all>Alle Lektionen von Pontes einblenden</button>':'');
  if(!L.length)return '<div class="ein-empty" style="padding:8px">Nichts gefunden.</div>';
  /* 11.57: Reihen als eigene Zeile (antippen = Übersicht der Reihe), darunter ihre Einträge */
  let RS=cx.subject!=='latein'||!ui.allL?reihenOf(cx.subject,cx.jg):[];/* 12.58: Latein – Pontes-Reihen zuerst, Lektüre-Reihen darunter */if(cx.subject==='latein'){const pon=r=>(r.entries||[]).some(e=>e.les!=null)?0:1;RS=RS.map((r,i)=>[r,i]).sort((x,y)=>pon(x[0])-pon(y[0])||x[1]-y[1]).map(x=>x[0])}/* 12.32: Reihen nach Obertitel gruppieren (geänderte Obertitel), Reihen ohne Obertitel zuletzt */if(cx.subject!=='latein'){const ord=[];for(const r of RS){const c=r.ch||'';if(!ord.includes(c))ord.push(c)}ord.sort((a,b)=>(a==='')-(b===''));RS=ord.flatMap(c=>RS.filter(r=>(r.ch||'')===c))}if(RS.length){const show=new Set(L.map(x=>x.r?'r:'+x.r.id:x.l?'l:'+x.l.k:x.u?'u:'+x.u.u:x.t.id));let h='<div class="ein-jg">Jahrgang '+cx.jg+' · '+esc(subj)+'</div>',ch='';const TP=topics(cx.subject,cx.jg);
   for(const r of RS){const tps=TP.filter(x=>x.rid===r.id),vis=tps.filter(tp=>show.has(tp.id));if(t&&!vis.length&&!show.has('r:'+r.id))continue;if(cx.subject==='latein'){if(r.ch&&r.ch!==ch){ch=r.ch;h+='<div class="ein-ch">'+esc(ch)+'</div>'}}else if((r.ch||'')!==ch){ch=r.ch||'';h+=chHead(ch)}const cl=!t&&rCl(r.id);h+=rowR(r,tps.length,cl);if(!cl)for(const tp of vis){const nw=neuTp(tp);h+=tp.l?rowL(tp.l,tp.title,1,nw):tp.u?rowU(tp.u,tp.title,1,nw,tp):rowT(tp,nw)}}
   const TPA=topics(cx.subject,cx.jg,1),rest=L.filter(x=>x.u&&!TPA.some(tp=>tp.id==='u:'+x.u.u));/* 12.65: „Weitere Einheiten“ ein- und ausklappbar – zu Beginn zu, außer beim Suchen oder wenn die gewählte Einheit darin liegt */
   if(rest.length||orgOn()){const fv=ui.cl&&ui.cl['~free'],op=!!(t||!rest.length||fv==='o'||(fv!=='c'&&rest.some(x=>sel==='u:'+x.u.u)));h+='<button type="button" class="ein-pt ein-ptf'+(op?'':' cl')+'" data-tfree data-tgf aria-expanded="'+op+'"><span class="ein-cv"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>Weitere Einheiten<small>'+rest.length+'</small></button>'+(op?(rest.length?'':'<div class="ein-pt0">Hierher ziehen, um eine Einheit aus ihrer Reihe zu nehmen.</div>')+rest.map(x=>rowU(x.u)).join(''):'')}
   if(cx.subject==='latein'){const rl=L.filter(x=>x.l&&x.l.jg===cx.jg&&!TPA.some(tp=>tp.id==='l:'+x.l.k));if(rl.length)h+='<div class="ein-pt">Weitere Lektionen</div>'+rl.map(x=>rowL(x.l)).join('');h+='<button type="button" class="ein-all" data-all>Alle Lektionen von Pontes einblenden</button>'}return h}
  /* 11.53: Latein – Knopf „Alle Lektionen von Pontes einblenden“ */const allB=cx.subject==='latein'?'<button type="button" class="ein-all" data-all>'+(ui.allL?'Nur Jahrgang '+cx.jg+' zeigen':'Alle Lektionen von Pontes einblenden')+'</button>':'';
  if(cx.subject==='latein'&&ui.allL){let h='',jg=null;for(const x of L){if(!x.l)continue;if(x.l.jg!==jg){jg=x.l.jg;h+='<div class="ein-jg">'+(jg?'Jahrgang '+jg:'ohne Jahrgang')+' · '+esc(subj)+'</div>'}h+=rowL(x.l)}/* 12.58: Lektüre-Reihen (ohne Pontes-Lektionen) ganz unten */const LK=(data.reihen||[]).filter(r=>r.subject==='latein'&&!(r.entries||[]).some(e=>e.les!=null)&&(!t||norm([r.title,r.ch,...(r.entries||[]).map(e=>e.t)].join(' ')).includes(t)));if(LK.length){h+='<div class="ein-jg">Lektüre · '+esc(subj)+'</div>';/* 12.60: Lektüre-Reihen mit ihren Einheiten, ein- und ausklappbar */for(const r of LK){FOR.add('r:'+r.id);const tps=topicsOf(r,+r.jg||0),cl=!t&&rCl(r.id);h+=rowR(r,tps.length,cl);if(!cl)for(const tp of tps){FOR.add(tp.id);const nw=neuTp(tp);h+=tp.l?rowL(tp.l,tp.title,1,nw):tp.u?rowU(tp.u,tp.title,1,nw,tp):rowT(tp,nw)}}}return h+allB}
  return '<div class="ein-jg">Jahrgang '+cx.jg+' · '+esc(subj)+'</div>'+L.map(x=>x.l?rowL(x.l):rowU(x.u)).join('')+allB}
 function wireTree(){const T=view.querySelector('.ein-list');
  T.querySelectorAll('[data-sel]').forEach(b=>b.onclick=e=>{if(b.hasAttribute('data-ojg')){const id=b.dataset.sel;FOR.add(id);if(id.startsWith('r:'))for(const en of reiheOf(id.slice(2))?.entries||[]){if(en.u)FOR.add('u:'+en.u);if(en.k)FOR.add(en.k)}}const ov=e.target.closest('[data-ov]');if(ov){e.stopPropagation();run('ov',ov.dataset.ov,ov);return}if(e.target.closest('[data-tck],[data-tmu],[data-tmr],[data-tgrip],[data-tgripr],[data-tmc]'))return;const tg=e.target.closest('[data-tg]');if(tg){e.stopPropagation();ui.cl={...(ui.cl||{})};if(ui.cl[tg.dataset.tg])delete ui.cl[tg.dataset.tg];else ui.cl[tg.dataset.tg]=1;saveUi();const sc=T.scrollTop;T.innerHTML=treeHtml();wireTree();T.scrollTop=sc;return}sel=b.dataset.sel;neuSeen(sel);sideOpen=false;draw()});
  T.querySelector('[data-tgf]')?.addEventListener('click',e=>{ui.cl={...(ui.cl||{})};ui.cl['~free']=e.currentTarget.getAttribute('aria-expanded')==='true'?'c':'o';saveUi();const sc=T.scrollTop;T.innerHTML=treeHtml();wireTree();T.scrollTop=sc});
  T.querySelectorAll('[data-jg]').forEach(b=>b.onclick=()=>{openJg.add(+b.dataset.jg);T.innerHTML=treeHtml();wireTree()});
  T.querySelectorAll('[data-tck]').forEach(x=>x.onclick=e=>{e.preventDefault();e.stopPropagation();const t=x.dataset.tck,id=x.dataset.id;CHK[t].has(id)?CHK[t].delete(id):CHK[t].add(id);treeRefresh()});
  T.querySelectorAll('[data-tmu]').forEach(x=>x.onclick=e=>{e.preventDefault();e.stopPropagation();tMenuU(x)});
  T.querySelectorAll('[data-tmr]').forEach(x=>x.onclick=e=>{e.preventDefault();e.stopPropagation();tMenuR(x)});T.querySelectorAll('[data-tmc]').forEach(x=>x.onclick=e=>{e.preventDefault();e.stopPropagation();tMenuC(x)});T.querySelectorAll('[data-tgripr]').forEach(g=>g.onpointerdown=e=>tDragR(g,e));
  T.querySelectorAll('[data-tmu],[data-tmr]').forEach(x=>x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();x.click()}});
  T.querySelectorAll('[data-tgrip]').forEach(g=>g.onpointerdown=e=>tDrag(g,e));
  selBar();
  /* 12.71: die gewählte Stunde links sichtbar halten */{const o=T.querySelector('.ein-row.on');if(o){const tr=T.getBoundingClientRect(),rr=o.getBoundingClientRect();if(rr.top<tr.top||rr.bottom>tr.bottom)T.scrollTop+=rr.top-tr.top-tr.height/3}}
  T.querySelector('[data-all]')?.addEventListener('click',()=>{ui.allL=!ui.allL;saveUi();T.innerHTML=treeHtml();wireTree();if(!ui.allL&&!okSel(sel)){sel=stand();draw()}});
  }
 /* ---------- 12.31: Ordnen im Baum ---------- */
 const tRefresh=async()=>{data=await load();draw()};
 function treeRefresh(){const T=view.querySelector('.ein-list');if(!T)return;const sc=T.scrollTop;T.innerHTML=treeHtml();wireTree();T.scrollTop=sc}
 let tMenuEl=null;const tClose=()=>{tMenuEl?._b?.classList?.remove('on');tMenuEl?.remove();tMenuEl=null};
 function tMenuAt(btn,html,W=260){tClose();const m=document.createElement('div');m.className='ein-tmenu';m.innerHTML=html;document.body.append(m);tMenuEl=m;m._b=btn;btn?.classList?.add('on');const bx=btn.getBoundingClientRect(),w=Math.min(W,innerWidth-16);m.style.width=w+'px';m.style.left=Math.max(8,Math.min(bx.left,innerWidth-w-8))+'px';const top=bx.bottom+4,mh=Math.min(m.scrollHeight,innerHeight-16);m.style.top=(top+mh>innerHeight-8?Math.max(8,bx.top-mh-4):top)+'px';setTimeout(()=>document.addEventListener('pointerdown',function f(e){if(!m.contains(e.target)){/* 12.41: 2. Klick auf denselben Knopf schließt nur (öffnet nicht neu) */if(btn&&btn.contains?.(e.target))document.addEventListener('click',ev=>{if(btn.contains(ev.target)){ev.stopPropagation();ev.preventDefault()}},{capture:true,once:true});tClose();document.removeEventListener('pointerdown',f,true)}},true),0);return m}
 const tReihenList=(cur,uSub)=>{const RS=ordReihen().sort((a,b)=>String(a.subject).localeCompare(String(b.subject))||(+a.jg)-(+b.jg)||(+a.n||0)-(+b.n||0)||String(a.title).localeCompare(String(b.title)));let lg='';
  return RS.map(r=>{const g=(SUBJ[r.subject]||r.subject)+' · Jahrgang '+r.jg,h=g!==lg?'<h6>'+esc(g)+'</h6>':'';lg=g;return h+'<button type="button" data-to="'+esc(r.id)+'"'+(r.id===cur?' disabled':'')+'>'+esc(r.title)+(r.id===cur?' ✓':'')+'</button>'}).join('')+'<hr><button type="button" data-to=""'+(cur?'':' disabled')+'>Nicht in einer Reihe</button>'};
 async function tRename(uid,rid,k){const u=ordUnits().find(y=>y.u===uid);if(!u)return;const base=u.t0||u.title,cur=(rid&&k&&(edOf(rid).names||{})[k])||u.title,v=((await classroomPrompt('Neuer Name der Einheit:',cur))??'').trim();if(v===''||v===cur)return;
  if(rid&&k){const x=edOf(rid);x.names={...(x.names||{})};const r0=reiheOf(rid),b0=(r0&&eff(r0).find(o=>o.k===k)||{}).t0||base;if(v===b0)delete x.names[k];else x.names[k]=v;edSet(rid,x)}else{const x=edOf('_units');x.names={...(x.names||{})};if(v===base)delete x.names[uid];else x.names[uid]=v;edSet('_units',x)}tRefresh()}
 async function tRemoveUnits(ids){const b=B();for(const uid of ids){for(const r of ordReihen())for(const x of eff(r))if(x.u===uid)ordMove(uid,r.id,x.k,null,null);CHK.u.delete(uid);try{await b.removeUnit(uid)}catch(err){alert('Entfernen nicht möglich: '+err.message)}}if(ids.includes(String(sel).replace(/^u:/,'')))sel=null;data=null;render()}
 function tMenuU(btn,sub){const uid=btn.dataset.tmu,rid=btn.dataset.r||null,k=btn.dataset.k||null,u=ordUnits().find(y=>y.u===uid);if(!u)return;
  const m=tMenuAt(btn,sub?'<button type="button" data-a="back">‹ zurück</button><hr>'+tReihenList(rid):unitMenuHtml(u,{done:DONE.has(uid)}),sub?300:260);
  m.onclick=async e=>{const t=e.target.closest('button');if(!t||t.disabled)return;e.stopPropagation();const a=t.dataset.a;
   if(a==='mv')return tMenuU(btn,1);if(a==='back')return tMenuU(btn);tClose();
   if(t.dataset.to!=null){ordMove(uid,rid,k,t.dataset.to||null,null);return tRefresh()}
   if(a==='ren')return tRename(uid,rid,k);
   if(a==='fj'){if(await askAssign([u],{title:'Fach und Jahrgang ändern',text:'Wohin gehört „'+esc(u.title)+'“?'})){data=null;render()}return}
   if(a==='exp')return unitExport(uid,null);
   if(a==='pv')return prev({title:u.title,url:u.file+(u.file.includes('?')?'&':'?')+'vorschau=1'});
   if(a==='stu')return stuDist(uid,rid);
   /* 13.03: Haken „durchgeführt am“ für diese Lerngruppe zurücknehmen */if(a==='undone'){const b=B(),n=b?.subsOf?.(cx.key,uid)||0,cl=cx.label||'diese Lerngruppe';
    if(n){if(!(await classroomConfirm('„'+u.title+'“ für '+cl+' als nicht durchgeführt markieren?\n\nDazu werden die '+n+' Abgabe'+(n===1?'':'n')+' gelöscht. Bereits in die Noten übernommene Ergebnisse bleiben dort stehen.')))return}
    else if(!(await classroomConfirm('„'+u.title+'“ für '+cl+' als nicht durchgeführt markieren?\n\nDer Haken mit dem Datum verschwindet.')))return;
    b?.undone?.(cx.key,uid,!!n);doneLoad();return tRefresh()}
   if(a==='rm'){if(!(await classroomConfirm('„'+u.title+'“ von diesem Gerät entfernen?\n\nDie Einheit verschwindet aus allen Reihen. Noten und Ergebnisse der Schüler bleiben erhalten. Du kannst sie später wieder aus ihrer Datei laden.')))return;return tRemoveUnits([uid])}}}
 function chSet(r,v){const e={...edOf(r.id)},o=r.ch0!==undefined?r.ch0:(r.ch||'');if(v===o)delete e.ch;else e.ch=v;edSet(r.id,e)}
 const chList=()=>[...new Set(reihenOf(cx.subject,cx.jg).map(r=>r.ch||'').filter(Boolean))];
 function tMenuC(btn){const c=btn.dataset.tmc,rs=reihenOf(cx.subject,cx.jg).filter(r=>(r.ch||'')===c),chg=rs.some(r=>r.ch0!==undefined);
  const m=tMenuAt(btn,'<button type="button" data-a="ren">'+ICO.pen+'<span>Obertitel umbenennen …<small style="display:block;color:#7d8aa0;font-size:.78rem">gilt für '+(rs.length===1?'die Reihe':'alle '+rs.length+' Reihen')+' darunter</small></span></button><button type="button" data-a="new">'+ICO.plus+'Neue Reihe unter diesem Obertitel</button>'+(chg?'<hr><button type="button" data-a="reset">Ursprünglichen Obertitel wiederherstellen</button>':''),290);
  m.onclick=async e=>{const t=e.target.closest('button');if(!t)return;e.stopPropagation();tClose();const a=t.dataset.a;
   if(a==='ren'){const n=((await classroomPrompt('Neuer Obertitel (gilt für '+rs.length+(rs.length===1?' Reihe':' Reihen')+'):',c))||'').trim();if(!n||n===c)return;for(const r of rs)chSet(r,n);return tRefresh()}
   if(a==='reset'){for(const r of rs){const x={...edOf(r.id)};delete x.ch;edSet(r.id,x)}return tRefresh()}
   if(a==='new'){const n=((await classroomPrompt('Name der neuen Reihe unter „'+c+'“:',''))||'').trim();if(!n)return;try{await B().reiheSave({type:'classroom-reihe',id:'eigen-'+Date.now().toString(36),title:n,ch:c,subject:cx.subject,jg:+cx.jg,n:99,entries:[],units:{}},{subject:cx.subject,jg:+cx.jg})}catch(err){alert('Anlegen nicht möglich: '+err.message);return}data=null;render()}}}
 function tMenuR(btn,sub){const r=reiheOf(btn.dataset.tmr),b=B();if(!r)return;const cur=r.ch||'';
  const m=tMenuAt(btn,sub?'<button type="button" data-a="back">‹ zurück</button><hr>'+chList().map(c=>'<button type="button" data-ch="'+esc(c)+'"'+(c===cur?' disabled':'')+'>'+(c===cur?'✓ ':'')+esc(c)+'</button>').join('')+'<hr><button type="button" data-a="newch">'+ICO.plus+'Neuer Obertitel …</button>'+(cur?'<button type="button" data-ch="">Ohne Obertitel</button>':''):reiheMenuHtml(r,{ch:1,stu:stuRUnits(r).length>0}),sub?320:260);
  m.onclick=async e=>{const t=e.target.closest('button');if(!t||t.disabled)return;e.stopPropagation();const a=t.dataset.a;
   if(a==='ch')return tMenuR(btn,1);if(a==='back')return tMenuR(btn);tClose();
   if(t.dataset.ch!=null){chSet(r,t.dataset.ch);return tRefresh()}
   if(a==='newch'){const n=((await classroomPrompt('Neuer Obertitel für „'+r.title+'“:',''))||'').trim();if(!n)return;chSet(r,n);return tRefresh()}
   if(a==='ren'){const n=((await classroomPrompt('Neuer Name der Reihe:',r.title))||'').trim();if(!n||n===r.title)return;edSet(r.id,{...edOf(r.id),title:n});return tRefresh()}
   if(a==='exp')return reiheExp(r,null);
   if(a==='rm'){if(!(await classroomConfirm('Reihe „'+rName(r)+'“ von diesem Gerät entfernen?\n\nDie Ergebnisse und Noten der Schüler bleiben erhalten. Lädst du die Reihe wieder, sind sie sofort wieder zugeordnet.')))return;try{await b.reiheRemove(r.id)}catch(err){alert('Entfernen nicht möglich: '+err.message);return}CHK.r.delete(r.id);sel=null;data=null;render()}}}
 /* Leiste unter dem Baum, sobald etwas angehakt ist */
 function selBar(){const side=view.querySelector('.ein-side');if(!side)return;let bar=side.querySelector('.ein-selbar');const nR=CHK.r.size,nU=CHK.u.size;
  if(!orgOn()||!(nR||nU)){bar?.remove();return}
  if(!bar){bar=document.createElement('div');bar.className='ein-selbar';side.querySelector('.ein-sb')?.before(bar)}
  const p=[];if(nR)p.push(nR+(nR===1?' Reihe':' Reihen'));if(nU)p.push(nU+(nU===1?' Einheit':' Einheiten'));
  bar.innerHTML='<div class="ein-sbt"><b>'+p.join(' · ')+' ausgewählt</b><button type="button" class="ein-sbx" data-sclr aria-label="Auswahl aufheben" title="Auswahl aufheben">✕</button></div><div class="ein-sbb"><button type="button" class="ein-b pri" data-sexp>'+ICO.up+'Exportieren</button>'+(nU&&!nR?'<button type="button" class="ein-b" data-smv>'+ICO.mv+'In Reihe …</button>':'')+(nU&&!nR?'<button type="button" class="ein-b del" data-srm>'+ICO.del+'Entfernen</button>':'')+'</div>';
  bar.querySelector('[data-sclr]').onclick=()=>{CHK.r.clear();CHK.u.clear();treeRefresh()};
  bar.querySelector('[data-sexp]').onclick=e=>{const rs=[...CHK.r].map(id=>reiheOf(id)).filter(Boolean),us=[...CHK.u];/* 12.32: eine einzelne Einheit oder Reihe als HTML */if(!rs.length&&us.length===1)return unitExport(us[0],e.currentTarget);if(rs.length===1&&!us.length)return reiheExp(rs[0],e.currentTarget);exportSel({rs,units:us,lessons:[]},e.currentTarget)};
  bar.querySelector('[data-smv]')?.addEventListener('click',e=>{const m=tMenuAt(e.currentTarget,tReihenList(null),300);m.onclick=ev=>{const t=ev.target.closest('button');if(!t||t.dataset.to==null)return;tClose();const to=t.dataset.to||null;for(const uid of [...CHK.u]){const r=ordReihen().find(r=>eff(r).some(x=>x.u===uid)),x=r&&eff(r).find(x=>x.u===uid);if((r?.id||null)!==to)ordMove(uid,r?.id||null,x?.k||null,to,null)}CHK.u.clear();tRefresh()}});
  bar.querySelector('[data-srm]')?.addEventListener('click',async ()=>{const ids=[...CHK.u];if(!(await classroomConfirm(ids.length+(ids.length===1?' Einheit':' Einheiten')+' von diesem Gerät entfernen?\n\nNoten und Ergebnisse der Schüler bleiben erhalten.')))return;tRemoveUnits(ids)})}
 /* Ziehen: auf eine Einheit = davor einsortieren, auf eine Reihe = ans Ende, auf „Weitere Einheiten“ = aus der Reihe nehmen */
 /* 12.32: Reihe auf einen Obertitel ziehen */
 function tDragR(g,ev){if(ev.button)return;ev.preventDefault();ev.stopPropagation();const r=reiheOf(g.dataset.tgripr);if(!r)return;const row=g.closest('.ein-row'),bx=row.getBoundingClientRect(),T=view.querySelector('.ein-list');
  const ghost=row.cloneNode(true);ghost.classList.add('ein-ghost');ghost.style.width=bx.width+'px';document.body.append(ghost);const dx=ev.clientX-bx.left,dy=ev.clientY-bx.top;row.classList.add('ein-src');let tgt=null,moved=false;const x0=ev.clientX,y0=ev.clientY;
  const clr=()=>T.querySelectorAll('.ein-dropin').forEach(x=>x.classList.remove('ein-dropin'));
  g.onpointermove=m=>{if(!moved&&Math.hypot(m.clientX-x0,m.clientY-y0)<4)return;moved=true;ghost.style.left=(m.clientX-dx)+'px';ghost.style.top=(m.clientY-dy)+'px';clr();const el=document.elementFromPoint(m.clientX,m.clientY),h=el&&(el.closest('[data-chn]')||(el.closest('.ein-rr')&&T.querySelector('.ein-rr[data-rid="'+CSS.escape(el.closest('.ein-rr').dataset.rid)+'"]')));tgt=null;
   if(h&&h.dataset.chn!=null){tgt=h.dataset.chn;h.classList.add('ein-dropin')}else if(h&&h.classList.contains('ein-rr')&&h!==row){const o=reiheOf(h.dataset.rid);if(o){tgt=o.ch||'';h.classList.add('ein-dropin')}}
   const b=T.getBoundingClientRect();if(m.clientY<b.top+30)T.scrollTop-=12;else if(m.clientY>b.bottom-30)T.scrollTop+=12};
  try{g.setPointerCapture(ev.pointerId)}catch{}
  g.onpointerup=g.onpointercancel=e=>{g.onpointermove=g.onpointerup=g.onpointercancel=null;ghost.remove();row.classList.remove('ein-src');clr();if(e.type==='pointerup'&&moved&&tgt!=null&&tgt!==(r.ch||'')){chSet(r,tgt);tRefresh()}}}
 function tDrag(g,ev){if(ev.button)return;ev.preventDefault();ev.stopPropagation();const row=g.closest('.ein-row'),uid=g.dataset.u,rid=g.dataset.r||null,k=g.dataset.k||null,bx=row.getBoundingClientRect(),T=view.querySelector('.ein-list');
  const ghost=row.cloneNode(true);ghost.classList.add('ein-ghost');ghost.style.width=bx.width+'px';document.body.append(ghost);const dx=ev.clientX-bx.left,dy=ev.clientY-bx.top;row.classList.add('ein-src');let tgt=null,moved=false;const x0=ev.clientX,y0=ev.clientY;
  const clr=()=>T.querySelectorAll('.ein-dropb,.ein-dropin').forEach(x=>x.classList.remove('ein-dropb','ein-dropin'));
  const mv=m=>{if(!moved&&Math.hypot(m.clientX-x0,m.clientY-y0)<4)return;moved=true;ghost.style.left=(m.clientX-dx)+'px';ghost.style.top=(m.clientY-dy)+'px';clr();const el=document.elementFromPoint(m.clientX,m.clientY);
   const ur=el&&el.closest('.ein-ur'),rr=el&&el.closest('.ein-rr'),fr=el&&el.closest('[data-tfree],.ein-pt0');tgt=null;
   if(ur&&ur!==row&&ur.dataset.r){tgt={to:ur.dataset.r,before:ur.dataset.k};ur.classList.add('ein-dropb')}else if(rr){tgt={to:rr.dataset.rid,before:null};rr.classList.add('ein-dropin')}else if(fr&&rid){tgt={to:null,before:null};fr.classList.add('ein-dropin')}
   const r=T.getBoundingClientRect();if(m.clientY<r.top+30)T.scrollTop-=12;else if(m.clientY>r.bottom-30)T.scrollTop+=12};
  try{g.setPointerCapture(ev.pointerId)}catch{}g.onpointermove=mv;
  g.onpointerup=g.onpointercancel=e=>{g.onpointermove=g.onpointerup=g.onpointercancel=null;ghost.remove();row.classList.remove('ein-src');clr();
   if(e.type==='pointerup'&&moved&&tgt&&!(tgt.to===rid&&tgt.before===k)){ordMove(uid,rid,k,tgt.to,tgt.before===k?null:tgt.before);tRefresh()}}}
 /* 11.43: Nadel rechts neben „Aktuelle Einheit“ – heftet diese Lektion/Einheit für die Lerngruppe an (Menü oben neben „?“) */
 const PINI='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path class="pp" d="M9 3h6l-1 6 4 3v2H6v-2l4-3z"/><path d="M12 14v7"/></svg>';
 function pinObj(l,u,cls,subj){const tt=find(sel).t;return {kind:'ein',sel,s:cx.subject,c:cx.classId,cls,subj:'Unterricht · '+subj,page:l?lname(l):u?u.title:tt?tt.title:'',topic:'',id:'ein|'+cx.subject+'|'+cx.classId+'|'+sel}}
 function pinBtn(l,u,cls,subj){const P=top()?.classroomPins;if(!P?.has||!cx.key)return '';const on=P.has('ein|'+cx.subject+'|'+cx.classId+'|'+sel);return '<button type="button" class="ein-pinb'+(on?' on':'')+'" data-pinb title="'+(on?'Angeheftet – tippen zum Lösen':'Diese '+(l?'Lektion':'Einheit')+' anheften (oben über die Nadel neben „?“ wieder öffnen)')+'" aria-pressed="'+on+'">'+PINI+'</button>'}
 const inR0=u=>u?topics(u.subject,u.jg,1).find(x=>x.id==='u:'+u.u):null;
 /* 12.15: „Buchübungen L16“ oben in der Kopfzeile neben Lesezeichen und Nadel */
 const AIRI='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5.5 15.5a8 8 0 1 1 13 0"/><path d="M8.5 13.5a4 4 0 1 1 7 0"/><path d="M12 13l-4 8h8z"/></svg>';
 /* 12.38: „Lernkontrolle“ im Kopf der Lektion – Vokabeltest, Kombitest, Ergebnisse, Navigium */
 const LKI='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6"/></svg>',CHV='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
 function lkHead(l){if(!l||cx.subject!=='latein')return '';const lab=/^\d+$/.test(l.k)?'L'+l.k:(l.tag||l.k);return '<button type="button" class="ein-airh ein-lkh" data-lk="'+esc(l.k)+'" aria-haspopup="menu" title="Lernkontrolle '+esc(lab)+': Vokabeltest, Kombitest, Ergebnisse, Navigium">'+LKI+'Lernkontrolle'+CHV+'</button>'}
 const MI=(i,t,s2,a)=>'<button type="button" class="lk-mi" data-lka="'+a+'">'+i+'<span><b>'+esc(t)+'</b>'+(s2?'<small>'+esc(s2)+'</small>':'')+'</span></button>';
 const LKIC={kw:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M20.5 15.5a3.5 3.5 0 1 1-1-2.5"/><path d="M20.5 11.5v2h-2"/></svg>',b:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2 2 0 0 1 6 4h13v14H6a2 2 0 0 0-2 2z"/><path d="M4 20V5.5M8 8h7M8 11h5"/></svg>',w:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16"/><path d="M3 21v-5h5"/></svg>',g:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5h16v2M12 5v14M9 19h6"/></svg>',v:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/></svg>',k:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M14 16.5l2 2 3.5-3.5"/></svg>',r:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',a:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',n:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3"/></svg>'};
 function lkMenu(btn){const k=btn.dataset.lk,b=B(),lab=/^\d+$/.test(k)?'L'+k:k;let open=0;try{open=b?.openTests?.()||0}catch{}
  let L=null;try{L=b?.lesson?.(k)}catch{}const nV=L?.nV||0,gr=L?.gr||[];
  const m=tMenuAt(btn,MI(LKIC.w,'Vokabeltest (Wdh.) '+lab,'Vokabeln aus früheren Lektionen, die in '+lab+' wiederkommen','wh')+MI(LKIC.v,'Vokabeltest '+lab,(nV?nV+' neue Vokabeln · ':'')+'iPad, Start per QR','voc')+MI(LKIC.g,'Grammatiktest '+lab,gr.length?gr.join(' · '):'Grammatikthemen der Lektion','gr')+MI(LKIC.kw,'Kombitest (Wdh.) '+lab,'Vokabeln (Wdh.) + Grammatik '+lab+' in einem Test, Gruppen A/B','kbw')+MI(LKIC.k,'Kombitest '+lab,'Vokabeln + Grammatik in einem Test, Gruppen A/B','kb')+MI(LKIC.r,'Ergebnisse und Abgaben',open?open+' Test'+(open>1?'s':'')+' mit Abgaben – Auswertung öffnen':'Meine iPad-Tests dieser Klasse','mine')+'<hr>'+MI(LKIC.b,'Pontes-Bibliothek …','Alle Lektionen, Tests über mehrere Lektionen, Datenbank weitergeben','home')+MI(LKIC.n,'Navigium importieren …','Online-Vokabeltest: Ergebnisse aus PDF','nav'),340);
  /* 12.90: iPhone – Blatt von unten mit Kacheln (nur CSS ≤600px), Kopf mit ✕ */m.classList.add('lk-sheet');{const h=document.createElement('div');h.className='lk-shh';h.innerHTML='<span class="lk-grip"></span><b>Lernkontrolle '+esc(lab)+'</b><button type="button" class="lk-x" aria-label="Schließen">✕</button>';m.prepend(h);h.querySelector('.lk-x').onclick=e=>{e.stopPropagation();tClose();btn.classList.remove('on')}}
  btn.classList.add('on');const off=()=>btn.classList.remove('on');setTimeout(()=>document.addEventListener('pointerdown',off,{once:true}),0);
  m.onclick=async e=>{const t=e.target.closest('[data-lka]');if(!t)return;e.stopPropagation();tClose();off();const a=t.dataset.lka;
   if(a==='nav'){const fs=(await pickFiles()).filter(f=>/\.pdf$/i.test(f.name)||f.type==='application/pdf');if(!fs.length)return;top()?.document?.getElementById('tab-noten')?.click();await new Promise(r=>setTimeout(r,80));try{await NF().classroomNavigiumFile(fs[0])}catch(err){alert('Navigium-Import: '+(err&&err.message||err))}return}
   run(a,k,null)}}
 function airHead(l){if(!l)return '';const bu=data.units.find(u=>u.subject==='latein'&&String(u.lesson)===String(l.k)&&u.book),ntt=(l.tt||[]).length;if(!bu&&!ntt)return '';/* 13.32: Lektionsdatei – Pontes-Übungen und Übersetzungs-Trainer in einer Datei */const lab='Lektionsdatei '+(/^\d+$/.test(l.k)?'L'+l.k:esc(l.tag||l.k));return '<button type="button" class="ein-airh" data-do="air" data-k="lek:'+esc(l.k)+'" data-bu="'+esc(bu?bu.u:'')+'" title="'+lab+' per AirDrop an die Schüler-iPads – mit '+(bu?'den Pontes-Übungen':'')+(bu&&ntt?' und ':'')+(ntt?ntt+' Übersetzungs-Trainer'+(ntt>1?'n':''):'')+'. Im Lernordner mit „Datei öffnen“ laden.">'+AIRI+'<span>'+lab+'</span></button>'}
 /* 12.90: iPhone – Lektionsansicht kompakt: eine Knopfzeile (Lernkontrolle breit, Lesezeichen, ⋯), Kompetenzen zum Aufklappen,
    Hinweistext aus, Karten mit Ansehen + Hauptaktion + ⋯. Nur bei schmaler Breite; Mac/iPad unverändert. */
 function phMenu(btn,list){const H=list.map((b,i)=>'<button type="button" class="lk-mi ph-mi" data-phi="'+i+'">'+(b.querySelector('svg')?.outerHTML||'')+'<span><b>'+esc(b.getAttribute('aria-label')||b.title||b.textContent.trim())+'</b></span></button>').join('');const m=tMenuAt(btn,H,280);m.classList.add('ph-sheet');m.onclick=e=>{const t=e.target.closest('[data-phi]');if(!t)return;e.stopPropagation();tClose();list[+t.dataset.phi].click()}}
 function phoneLes(){if(!matchMedia('(max-width:600px)').matches)return;const mh=view.querySelector('.ein-mh');
  if(mh&&!mh.dataset.ph){mh.dataset.ph='1';const st=mh.querySelector('[data-stand]');const pk=view.querySelector('.ein-pick');if(pk&&st?.classList.contains('on')&&!pk.querySelector('.ein-pkcur'))pk.insertAdjacentHTML('beforeend','<small class="ein-pkcur">aktuell</small>');
   const extra=[mh.querySelector('[data-do=air]'),mh.querySelector('.ein-lu'),mh.querySelector('[data-pinb]'),mh.querySelector('[data-ledit]')].filter(Boolean);
   if(extra.length){extra.forEach(b=>{b.classList.add('ph-x');if(b.matches('[data-do=air]')&&!b.getAttribute('aria-label'))b.setAttribute('aria-label','Lektionsdatei per AirDrop');if(b.matches('.ein-lu'))b.setAttribute('aria-label','Material');if(b.matches('[data-ledit]'))b.setAttribute('aria-label',b.classList.contains('on')?'Bearbeiten beenden':'Bearbeiten');if(b.matches('[data-pinb]'))b.setAttribute('aria-label',b.classList.contains('on')?'Lösen':'Anheften')});
    const m=document.createElement('button');m.type='button';m.className='ein-curb ph-more';m.textContent='⋯';m.setAttribute('aria-label','Weitere');m.onclick=e=>{e.stopPropagation();phMenu(m,extra)};(mh.querySelector('.ein-togw')||mh).append(m)}}
  const toc=view.querySelector('.ein-toc');if(toc&&!toc.dataset.ph){toc.dataset.ph='1';const sum=[...toc.querySelectorAll('.ein-tr')].slice(0,2).map(x=>x.textContent.replace(/^(Syntax|Formenlehre|Wortschatz)/,'').trim()).join(' · ');const b=document.createElement('button');b.type='button';b.className='ph-ktog';b.innerHTML='<b>Kompetenzen</b><small>'+esc(sum)+'</small><span>›</span>';b.onclick=()=>toc.classList.toggle('ph-open');toc.before(b)}
  view.querySelectorAll('.ein-tile>.ein-acts').forEach(a=>{if(a.dataset.ph)return;a.dataset.ph='1';const ic=[...a.querySelectorAll(':scope>button.ein-icb:not(.ein-more)')],more=a.querySelector(':scope>.ein-more'),gh=[...a.querySelectorAll(':scope>button.ghost')];const list=[...ic,...gh];if(!list.length)return;ic.forEach(b=>b.classList.add('ph-x'));more?.classList.add('ph-x');const m=document.createElement('button');m.type='button';m.className='ein-more ein-icb ph-more2';m.innerHTML=BI.more;m.setAttribute('aria-label','Weitere');m.onclick=e=>{e.stopPropagation();phMenu(m,list)};a.append(m)})}
 function draw(){neuLoad();const {l,u,t:tp,r:rh}=find(sel),cls=cx.short||'—',subj=SUBJ[cx.subject]||cx.subject||'';
  const title=l?esc(l.label)+(l.name?' · '+esc(l.name):''):u?esc(inR0(u)?.title||u.title)+(u.gl?GLP:''):tp?esc(tp.title):'';const inR=u?topics(u.subject,u.jg,1).find(x=>x.id==='u:'+u.u):null;const st=isStand(sel);
  view.style.setProperty('--ein-w',(ui.w||290)+'px');view.classList.toggle('side-open',sideOpen);
  view.innerHTML='<div class="ein-side"><input type="search" class="ein-q" placeholder="Lektion oder Thema suchen …" value="'+esc(q)+'" autocomplete="off" autocorrect="off" spellcheck="false"><div class="ein-list">'+treeHtml()+'</div>'
   /* 11.84: Variante B – „Inhalte organisieren …“ und daneben nur das Lade-Symbol; Reihe entfernen steht im ⋯-Menü der Reihe im Fenster */
   +'<div class="ein-sacts ein-sacts2 ein-sb">'+(orgOn()?'<button type="button" class="ein-b" data-newr2 title="Neue, leere Reihe für '+esc(SUBJ[cx.subject]||cx.subject)+' · Jahrgang '+cx.jg+'">'+ICO.plus+'Neue Reihe</button><button type="button" class="ein-b ein-ib ein-ico" data-ord title="Alle Inhalte: alle Fächer und Jahrgänge auf einen Blick" aria-label="Alle Inhalte …"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></button>':'<button type="button" class="ein-b" data-ord title="Reihen und Einheiten ordnen, laden, exportieren und entfernen">Inhalte organisieren …</button>')+'<button type="button" class="ein-b ein-ib ein-ico" data-load title="Datei laden: Reihen (.cmreihe), Einheiten (.cmeinheit), Vokabel- und Grammatik-Pakete, Übersetzungstexte (.cmtext) oder ein Zip" aria-label="Datei laden …">'+ICO.down+'</button></div></div>'
   +'<div class="ein-handle" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Seitenmenü breiter oder schmaler ziehen" title="Ziehen: Seitenmenü breiter oder schmaler · Doppelklick: Standardbreite"><span class="sp-side-pill" aria-hidden="true">⋮</span><span class="sp-side-line" aria-hidden="true"></span><span class="sp-side-badge" aria-hidden="true"></span></div>'
   +'<div class="ein-main"><button type="button" class="ein-pick" data-pick>☰ '+(rh?esc(rh.title):l?esc(lname(l)):u?esc(inR0(u)?.title||u.title):tp?esc(tp.title):'Einheit wählen')+' ▾</button>'
   +(rh?reiheHtml(rh):l||u||tp?'<div class="ein-mh"><h2>'+title+'</h2><span class="sp"></span>'+airHead(l)+lkHead(l)+LUB+(cx.key&&items().includes(sel)?'<span class="ein-togw"><button type="button" class="ein-curb'+(st?' on':'')+'" data-stand aria-pressed="'+!!st+'" aria-label="Aktuelle '+(l?'Lektion':'Einheit')+' der '+esc(cls)+'" title="'+(st?'Aktuell – „Unterricht“ öffnet für die '+esc(cls)+' automatisch diese '+(l?'Lektion':'Einheit')+'. Tippen zum Aufheben.':'Als aktuelle '+(l?'Lektion':'Einheit')+' der '+esc(cls)+' markieren')+'"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path class="bm" d="M7 3h10v18l-5-4-5 4z"/></svg></button>'+pinBtn(l,u,cls,subj)+(l&&data.units.some(x=>x.subject==='latein'&&String(x.lesson)===l.k)||l&&edOf('les:'+l.k).own?.length?'<button type="button" class="ein-curb'+(lEdit?' on':'')+'" data-ledit aria-pressed="'+lEdit+'" title="'+(lEdit?'Bearbeiten beenden':'Lernpakete bearbeiten: verschieben, umbenennen, ausblenden, löschen')+'" style="margin-left:8px">'+ICO.pen+'</button>':'')+'</span>':cx.key?'<span class="ein-tog off" style="cursor:default" title="„Aktuell“ gilt je Lerngruppe. Wechsle in eine '+(l?'Latein':(SUBJ[(u||tp)?.subject]||'passende'))+'-Klasse, um diese '+(l?'Lektion':'Einheit')+' dort als aktuell zu markieren.">„Aktuell“ nur in einer '+(l?'Latein':(SUBJ[(u||tp)?.subject]||'passenden'))+'-Klasse · gewählt: '+esc(cls)+' · '+esc(subj)+'</span>':'')+'</div>'
     +(l?tocHtml(l)+lessonTiles(l):tp?'<p class="ein-sub">'+[tp.ch,tp.part].filter(Boolean).map(esc).concat('Jahrgang '+tp.jg).join(' · ')+'</p><div class="ein-empty">Zu diesem Thema gibt es noch keine digitale Lerneinheit. Du kannst es trotzdem als aktuelles Thema der '+esc(cls)+' markieren oder anheften.</div>':'<p class="ein-sub">'+[...(inR?[inR.ch,inR.part]:[u.sub]).filter(Boolean).map(esc),'Jahrgang '+u.jg].join(' · ')+'</p>'+unitTiles(u))
    :'<div class="ein-empty">Für die '+esc(cls)+(subj?' ('+esc(subj)+')':'')+' sind noch keine Einheiten vorhanden.</div>')+'</div>';
  wireTree();
  const qi=view.querySelector('.ein-q');qi.oninput=()=>{q=qi.value;const T=view.querySelector('.ein-list');T.innerHTML=treeHtml();wireTree()};
  view.querySelector('[data-load]').onclick=loadPkg;/* 11.80: Bearbeiten-Leiste oben (bleibt beim Scrollen stehen) mit „Fertig“ */
  if((lEdit&&find(sel).l)||(rEdit&&rh)){const mh=view.querySelector('.ein-mh');if(mh){const bar=document.createElement('div');bar.className='ein-edbar';bar.innerHTML='<b>Bearbeiten</b><span>'+(lEdit&&find(sel).l?'Lernpakete ziehen ⠿, umbenennen, ausblenden oder löschen. Eigene Einträge hinzufügen.':'Lektionen und Einheiten ziehen ⠿, umbenennen, ausblenden oder löschen. Eigene Einträge hinzufügen.')+'</span><button type="button" data-edone>Fertig</button>';mh.after(bar);bar.querySelector('[data-edone]').onclick=()=>{if(lEdit)lEdit=false;else rEdit=false;draw()}}}
  view.querySelector('[data-ledit]')?.addEventListener('click',()=>{lEdit=!lEdit;draw();/* 11.78: die bearbeitbaren Lernpakete liegen weiter unten – hinscrollen */if(lEdit)setTimeout(()=>view.querySelector('.rh-ed')?.closest('.ein-part')?.scrollIntoView({behavior:'smooth',block:'start'}),60)});if(find(sel).l&&lEdit)wireLes(find(sel).l);if(rh)wireReihe(rh);view.querySelector('[data-ord]').onclick=()=>orgOpen();view.querySelector('[data-newr2]')?.addEventListener('click',async()=>{const t=((await classroomPrompt('Name der neuen Reihe ('+(SUBJ[cx.subject]||cx.subject)+' · Jahrgang '+cx.jg+'):',''))||'').trim();if(!t)return;try{await B().reiheSave({type:'classroom-reihe',id:'eigen-'+Date.now().toString(36),title:t,subject:cx.subject,jg:+cx.jg,n:99,entries:[],units:{}},{subject:cx.subject,jg:+cx.jg})}catch(e){alert('Anlegen nicht möglich: '+e.message);return}data=null;render()});
  view.querySelector('[data-pick]').onclick=()=>{sideOpen=!sideOpen;view.classList.toggle('side-open',sideOpen);sideFit()};sideFit();
  view.querySelector('[data-stand]')?.addEventListener('click',e=>{setStand(e.currentTarget.classList.contains('on')?null:sel);draw()});
  view.querySelector('[data-pinb]')?.addEventListener('click',()=>{const {l,u}=find(sel),P=top()?.classroomPins;if(!P)return;P.toggleObj(pinObj(l,u,cx.short||'—',SUBJ[cx.subject]||cx.subject||''));draw();P.render?.()});
  /* 11.27: derselbe Griff wie im Sitzplan (Pille ⋮, beim Ziehen blaue Linie und Größenschild, Doppelklick = Standard) */
  const h=view.querySelector('.ein-handle'),bd=h.querySelector('.sp-side-badge'),W0=290,pct=w=>Math.round(w/W0*100)+' %',setW=w=>{ui.w=Math.max(200,Math.min(560,Math.round(w)));view.style.setProperty('--ein-w',ui.w+'px');bd.textContent=pct(ui.w)};
  h.onpointerdown=e=>{if(e.button>0)return;e.preventDefault();try{h.setPointerCapture(e.pointerId)}catch{}const x0=e.clientX,w0=ui.w||W0;view.classList.add('ein-dragging');document.documentElement.classList.add('ein-dragging');bd.textContent=pct(w0);
   h.onpointermove=ev=>setW(w0+ev.clientX-x0);
   h.onpointerup=h.onpointercancel=()=>{h.onpointermove=null;h.onpointerup=null;h.onpointercancel=null;view.classList.remove('ein-dragging');document.documentElement.classList.remove('ein-dragging');saveUi()}};
  h.ondblclick=e=>{e.preventDefault();setW(W0);saveUi()};
  h.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setW((ui.w||W0)+(e.key==='ArrowRight'?36:-36));saveUi()}};
  wire();/* 13.32: Lektionsdatei hängt von Klasse und Texten ab – bei jedem Zeichnen neu vorbereiten */for(const k of Object.keys(AIR))if(/^lek:/.test(k))delete AIR[k];prefetchAir();try{top()?.classroomPins?.render?.()}catch{}}
 const tile=(ic,cls,t,s,acts,off)=>'<div class="ein-tile '+cls+(off?' off':'')+'">'+(ic?'<i>'+ic+'</i>':'')+'<b>'+t+'</b><small>'+s+'</small>'+(acts?'<div class="ein-acts">'+acts+'</div>':'')+'</div>';
 /* 11.45: Abgaben aus Üben, Übungen und Übersetzungs-Trainer scannen */
 const AB=u=>btn('scan',u,'Abgaben scannen','abg')+btn('ov',u,'Übersicht','abg');
 const BI={eye:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',scan:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/></svg>',ov:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 20V11M11 20V5M17 20v-6M3 20h18"/></svg>',more:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'};
 /* 12.14: kompakte Zeilen – „Ansehen“ mit Auge, „Abgaben scannen“ und „Übersicht“ als Symbole (Name beim Zeigen), „Für Kollegen …“ und „Als Test …“ im ···-Menü */
 /* 12.43: feste Spalten – Üben/Start mit QR-Symbol, AirDrop als Symbol */const QRI='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2"/></svg>';
 const btn=(d,k,t,c)=>{const ic=c==='abg'||c==='air';/* 12.66: Auswertung orange, wenn die Einheit in dieser Klasse schon gemacht wurde */let dn='';if(d==='ov'){doneLoad();if(DONE.has(k)){dn=' done';t='Auswertung – durchgeführt am '+new Date(DONE.get(k).last).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}}return '<button type="button" '+(c?'class="'+c+dn+(ic?' ein-icb':'')+'" ':'')+'data-do="'+d+'" data-k="'+esc(k)+'"'+(ic?' title="'+t+'" aria-label="'+t+'"':c==='pri'&&/^(uw|uv|qr)$/.test(d)?' title="QR-Code zeigen – die Klasse scannt und startet auf den iPads"':'')+'>'+(c==='look'?BI.eye:'')+(c==='pri'&&/^(uw|uv|qr)$/.test(d)?QRI:'')+(c==='abg'&&BI[d]?BI[d]:c==='air'?AIRI:t)+'</button>'};
 /* 11.47: Lektion in der Reihenfolge des Buchs – Vorbereitung · Lektionstext · Sachinfo · Grammatik · Übungen · Ponticulus.
    Jede Karte hat dieselben Knöpfe: Ansehen · Üben/Start-QR/Link senden · Abgaben · Übersicht · Für Kollegen … (Vokabeln/Grammatik: Als Test …) */
 const KOL=k=>btn('kolp',k,'Für Kollegen …','ghost');
 const sec=(n,t,sub,cards)=>cards?'<div class="ein-part"><div class="ein-pl"><span class="n">'+n+'</span><b>'+t+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div><div class="ein-tiles">'+cards+'</div></div>':'';
 function lpCard(u,t){return tile(String.fromCharCode(65+data.units.filter(x=>x.subject==='latein'&&String(x.lesson)===String(u.lesson)).indexOf(u)),'t2',esc(t||u.title.replace(/^L\d+ · /,''))+GLP,'<span class="gl-meta"><span>'+u.gl.n+' Stationen</span><span>ca. '+u.gl.min+' Min.</span></span>'+esc(u.sub.replace(/^Latein · (Lektion |L)\d+ · /,''))+(u.book?' · mit Buchübungen ✓':' · eigene Beispiele')+(u.subs?' · '+u.subs+' Abgabe'+(u.subs>1?'n':''):''),btn('pl',u.u,'Ansehen','look')+btn('qr',u.u,'Start','pri')+AB(u.u)+btn('kol',u.u,'Für Kollegen …','ghost'))}
 function lessonTiles(l){const k=l.k,T=l.toc||{},us=data.units.filter(u=>u.subject==='latein'&&String(u.lesson)===String(k)),LE=edOf('les:'+k),parts=p=>lesParts(k,us,p),part=p=>parts(p).filter(x=>!x.hid),rest=us.filter(u=>!u.part);
   const cards=p=>lEdit?lesEditHtml(p,parts(p)):part(p).map(x=>x.u?lpCard(x.u,x.t):tile('·','t2',esc(x.t),'eigener Eintrag','')).join('');
  /* Lektionstext = der Text mit dem Titel aus dem Inhaltsverzeichnis, sonst der erste */
  const norm2=x=>String(x||'').toLowerCase();let ti=T.text?l.tt.findIndex(x=>norm2(x.title).includes(norm2(T.text))):-1;if(ti<0&&l.tt.length)ti=0;
  const ttCard=(x,i,main)=>tile('T','t3',esc(x.title.replace(/^(Lektion|L)\s*\d+\s*[·:–-]?\s*/i,'')||'Übersetzungs-Trainer'),x.n+' Sätze'+(x.hunt?' · '+esc(x.hunt):'')+(main?' · Übersetzungs-Trainer':' · Zusatztext'),btn('pt',k+'|'+i,'Ansehen','look')+btn('tt',k,'Link senden …','pri')+AB('pt-'+k+(i?'.'+(i+1):''))+KOL('t|'+k+'|'+i));
  const bk=us.some(u=>u.book);
  const head=us.length?'<p class="ein-sub ein-lphint" style="margin:0 0 10px">Lernpakete: wischen, ziehen, antippen – höchstens zwei Versuche, Abgabe per QR. '+(bk?'Übungen aus dem Buch sind geladen ✓':'Ohne Buchdatei mit eigenen Beispielen · <span class="ein-acts" style="display:inline-flex;vertical-align:middle">'+btn('load','','Buchdatei laden …')+'</span>')+'</p>':'';
  return head
   +sec(1,'Vorbereitung','vor dem Lektionstext',
     tile('W','','Wiederholungsvokabular',l.nW?l.nW+' Wörter aus dem Lektionstext':'keine Liste geladen',l.nW?btn('lw',k,'Ansehen','look')+btn('uw',k,'Üben','pri')+AB('pw-'+k)+KOL('w|'+k):btn('load','','Datei laden …'),!l.nW)
    +tile('V','','Lernvokabular',l.nV?l.nV+' neue Wörter':'kein Vokabular geladen',l.nV?btn('lv',k,'Ansehen','look')+btn('uv',k,'Üben','pri')+AB('pv-'+k)+KOL('v|'+k):btn('load','','Datei laden …'),!l.nV))
   +sec(2,'Sachinfo',T.sach?esc(T.sach):'',cards('sach'))
   +sec(3,'Lektionstext',T.text?'„'+esc(T.text)+'“':'',
     (ti>=0?ttCard(l.tt[ti],ti,true)+l.tt.map((x,i)=>i===ti?'':ttCard(x,i,false)).join(''):tile('T','t3','Übersetzungs-Trainer','noch kein Text – Datei laden',btn('load','','Datei laden …'),true)))
   +sec(4,'Grammatik',[T.syn,T.form].filter(Boolean).map(esc).join(' · '),
     (l.gr.length?tile('G','','Formen bilden und bestimmen',l.gr.length+(l.gr.length>1?' Themen':' Thema'),btn('lg',k,'Ansehen','look')+btn('ug',k,'Üben (QR)','pri')+AB('pg-'+k)+KOL('g|'+k)+btn('gr',k,'Als Test …','ghost')):'')
    +(l.ueb?tile('+','t2','Training: Relativpronomen · Passiv','7 Übungen · 3 Stufen',btn('pu',k,'Ansehen','look')+btn('ueb',k,'Start-QR','pri')+AB('px')+KOL('x|'+k)):''))
   +sec(5,'Übungen','Ü und Differenzierung',cards('ueb'))
   +sec(6,'Ponticulus','',cards('pont'))
   +(/^\d+$/.test(k)&&+k>=15?sec(7,'Alternative Lateinarbeit',ALA[k]?.fields?Object.values(ALA[k].fields).join(' · '):'Klassenarbeit nach den Grundsätzen · A Sprache · B Text · C Kontext',ALA[k]?tile('A','t4','Alternative Lateinarbeit','„'+esc(ALA[k].text?.t||'')+'“ · '+(ALA[k].tasks||[]).length+' Aufgaben · '+(ALA[k].total||'')+' '+(ALA[k].unit||'BE'),btn('ala',k,'Ansehen','look')+btn('alan',k,'In die Noten übernehmen …','ghost')):tile('A','t4','Alternative Lateinarbeit','noch keine Arbeit für diese Lektion – private Datei (.cmeinheit) laden',btn('load','','Datei laden …'),true)):'')
   +(rest.length?sec(/^\d+$/.test(k)&&+k>=15?8:7,'Weitere Lernpakete','',rest.map(lpCard).join('')):'')+(lEdit?'<p class="ein-foot" style="margin:4px 2px 0">Die Abschnitte bleiben fest. Umbenennen ändert nur die Anzeige; Ergebnisse und Noten bleiben beim richtigen Lernpaket.'+(Object.keys(LE).length?' · <a data-lreset>Ursprüngliche Fassung wiederherstellen</a>':'')+'</p>':'')}
 /* 12.58: Übersetzungs-Trainer, der zu dieser Einheit gehört (Feld u in der .cmtext) */
 /* 12.59: unsichtbare Platzhalter, damit die Knöpfe in derselben Spalte stehen wie bei der Lerneinheit */const SPB='<button type="button" class="abg ein-icb" tabindex="-1" aria-hidden="true" style="visibility:hidden"></button>';
 function unitTT(u){for(const l of data.lessons||[]){const i=(l.tt||[]).findIndex(x=>x.u&&x.u===u.u);if(i>=0){const x=l.tt[i],k=l.k;return tile('T','t3','Übersetzungs-Trainer',esc(x.title)+' · '+x.n+' Sätze'+(x.hunt?' · '+esc(x.hunt):''),btn('pt',k+'|'+i,'Ansehen','look')+btn('tt',k,'Link senden …','pri')+(u.book?SPB.replace('abg ein-icb','air ein-icb'):'')+AB('pt-'+k+(i?'.'+(i+1):''))+SPB.replace('abg ein-icb','ein-icb ein-one'))}}return ''}
 function unitTiles(u){return '<div class="ein-tiles">'
   /* 11.37: „Grundlagen“-Einheiten (AFB I) mit Kurzinfo und dem Hinweis auf die Vertiefung in GoodNotes */
   +tile('','t2','Lerneinheit (iPad)',(u.gl?'<span class="gl-meta"><span class="vt1">AFB I</span><span>'+u.gl.n+' Stationen</span><span>ca. '+u.gl.min+' Min.</span><span>wischen · ziehen · antippen</span></span>':'')+(u.book?'mit Schulbuchmaterial ✓':'ohne Schulbuchmaterial')+(u.subs?' · '+u.subs+' Abgabe'+(u.subs>1?'n':'')+' gescannt':''),btn('pl',u.u,'Ansehen','look')+btn('qr',u.u,'Start','pri')+btn('scan',u.u,'Abgaben scannen','abg')+btn('ov',u.u,'Übersicht','abg')+(u.book?btn('air',u.u,u.dat?'Einheit per AirDrop':'Material per AirDrop','air'):'')+btn('uexp',u.u,'Exportieren …','ghost'))+unitTT(u)
   +(u.vt&&u.book?tile('','t5','Aufgabensammlung · AFB II und III','<span class="gl-meta"><span class="vt2">AFB II</span><span class="vt3">AFB III</span><span>'+u.vt+' Aufgaben</span><span class="st-w">nur für dich</span></span>Vertiefung zum Auswählen – mit Lösungen und Smartboard-Ansicht',btn('vt',u.u,'Öffnen','look')):'')
   +(u.dat?'':tile('B','t3','Schulbuchmaterial',u.book?'auf diesem Gerät geladen ✓':'noch nicht geladen (.cmeinheit)',btn('load','',u.book?'Neu laden …':'Datei laden …')))+(u.dat?'<p class="ein-foot" style="grid-column:1/-1;margin:2px">Die Schüler-iPads brauchen die Einheit einmal als Datei: das AirDrop-Symbol rechts neben „Start“ und auf dem iPad sichern. Dann im Lernordner auf „Datei öffnen“ tippen – Name und Klasse sind schon da, wenn die Klasse einmal einen Start-QR gescannt hat. Oder wie bisher: Start-QR scannen und „Datei laden …“.</p>':'')+'</div>'}
 const MMS=p=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>',MMU=MMS('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.6a3.2 3.2 0 0 1 0 6.3M21 20c0-2.8-1.8-5-4-5.7"/>'),MMT=MMS('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6"/>'),MMI={kol:MMU,kolp:MMU,gr:MMT,voc:MMT,wh:MMT,alan:MMS('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>'),uexp:MMS('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),_:MMS('<path d="M9 6l6 6-6 6"/>')};
 const mmClose=()=>{const d=document.querySelector('.ein-mm');d?._m?.classList.remove('on');d?.remove()};
 function moreMenu(m,g){mmClose();const d=document.createElement('div');d.className='ein-mm ein-tmenu';const del=b=>/l(ö|oe)schen|entfernen/i.test(b.textContent),L=g.map((b,i)=>[b,i]),it=([b,i])=>'<button type="button" data-i="'+i+'"'+(del(b)?' class="del"':'')+'>'+(MMI[b.dataset.do]||MMI._)+'<span>'+esc(b.textContent)+'</span></button>',A=L.filter(x=>!del(x[0])),Z=L.filter(x=>del(x[0]));d.innerHTML=A.map(it).join('')+(Z.length&&A.length?'<hr>':'')+Z.map(it).join('');m.classList.add('on');d._m=m;document.body.append(d);
  const bx=m.getBoundingClientRect(),W=Math.max(200,d.offsetWidth);d.style.left=Math.max(8,Math.min(bx.right-W,innerWidth-W-8))+'px';d.style.top=(bx.bottom+d.offsetHeight+8>innerHeight?bx.top-d.offsetHeight-4:bx.bottom+4)+'px';
  const off=e=>{if(!d.contains(e.target)&&!m.contains(e.target)){mmClose();removeEventListener('pointerdown',off,true)}};addEventListener('pointerdown',off,true);
  d.onclick=e=>{const b=e.target.closest('button');if(!b)return;mmClose();removeEventListener('pointerdown',off,true);g[+b.dataset.i].click()}}
 const wire=()=>{view.querySelectorAll('[data-do]').forEach(b=>b.onclick=()=>run(b.dataset.do,b.dataset.k,b));view.querySelectorAll('[data-vto]').forEach(b=>b.onclick=()=>run('vtopen',b.dataset.vto,b));view.querySelectorAll('[data-lk]').forEach(b=>b.onclick=e=>{e.stopPropagation();lkMenu(b)});
  view.querySelectorAll('.ein-tile>.ein-acts').forEach(a=>{const g=[...a.querySelectorAll(':scope>button.ghost')];if(!g.length||a.querySelector('.ein-more'))return;/* 12.43: nur eine weitere Aktion – direkt als Symbol statt ⋯ */if(g.length===1){const b=g[0];const t=b.textContent.trim();b.className='ein-icb ein-one';b.title=t;b.setAttribute('aria-label',t);b.innerHTML=MMI[b.dataset.do]||MMI._;return}g.forEach(b=>b.hidden=true);const m=document.createElement('button');m.type='button';m.className='ein-more ein-icb';m.title='Weitere Aktionen';m.setAttribute('aria-label','Weitere Aktionen');m.innerHTML=BI.more;m.onclick=e=>{e.stopPropagation();document.querySelector('.ein-mm')?._m===m?mmClose():moreMenu(m,g)};a.append(m)});phoneLes()};
 /* Aktionen */

 /* 11.64: Aufgabensammlung (AFB II gelb, AFB III rötlich) – nur für die Lehrkraft: auswählen, Lösungen zeigen, am Smartboard zeigen.
    Aufgaben aus dem Schulbuch tragen „📘 Schulbuch S. … Aufg. …“, eigene „✎ eigene Aufgabe“; Material als farbige Pille wie in den Stationen. */
 const VTK='classroom-vt-sel-v1',vtSel=u=>{try{return new Set((JSON.parse(localStorage.getItem(VTK)||'{}')[u])||[])}catch{return new Set()}},vtSave=(u,S)=>{try{const o=JSON.parse(localStorage.getItem(VTK)||'{}');if(S.size)o[u]=[...S];else delete o[u];localStorage.setItem(VTK,JSON.stringify(o))}catch{}};
 const VMI={T:['Text','<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 13.5h6M9 17h4"/>'],D:['Diagramm','<path d="M4 20h16"/><path d="M7 20v-6M11 20V9M15 20v-9M19 20V6"/>'],K:['Karte','<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'],B:['Bild','<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>'],A:['Tabelle','<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 10h18M3 14.5h18M9 5v14"/>'],U:['Übung im Buch','<path d="M4 5.5C6.5 4 9.5 4 12 5.5 14.5 4 17.5 4 20 5.5V19c-2.5-1.5-5.5-1.5-8 0-2.5-1.5-5.5-1.5-8 0z"/><path d="M12 5.5V19"/>']};
 const vtRes=(M,l)=>M&&(M[l]||(l==='Info'?Object.keys(M).filter(k=>/^Info/.test(k)).flatMap(k=>M[k]):null)),vtMat=(m,M)=>String(m||'').replace(/\{([TDKBUA])\}([^{]*)/g,(x,k,l)=>'<span class="cm-mc cm-mc-'+k+'"'+(vtRes(M,l.trim())?.length?' data-mat="'+esc(l.trim())+'" data-mk="'+k+'" role="button" tabindex="0" title="Material ansehen"':'')+'><svg class="cm-mi" viewBox="0 0 24 24" role="img" aria-label="'+VMI[k][0]+'"><title>'+VMI[k][0]+'</title>'+VMI[k][1]+'</svg>'+esc(l.trim())+'</span>');
 const VTCSS='<style>.cmpv-bar button.vt-rbtn{background:#fff4e8;border-color:#e8a23a;color:#b45309}.cmpv-bar button.vt-rbtn.on{background:#e8790c;border-color:#e8790c;color:#fff}.vt-rp{border:1.5px solid #e8a23a;background:#fffaf2;border-radius:16px;padding:14px 16px;margin:0 0 16px}.vt-rp[hidden]{display:none}.vt-rh b{display:block;font-size:1.05rem}.vt-rh span{display:block;color:#66758a;font-size:.86rem;margin:2px 0 4px}.vt-rl{font-size:.72rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#8a97aa;margin:10px 0 5px}.vt-seg{display:inline-flex;flex-wrap:wrap;gap:2px;background:#e7edf6;border-radius:10px;padding:3px}.vt-seg button{border:0;background:none;border-radius:8px;padding:6px 12px;font:inherit;font-size:.9rem;color:#2f5f9b;cursor:pointer}.vt-seg button.on{background:#fff;font-weight:700;box-shadow:0 1px 3px #0002}.vt-rn{color:#9a5400;font-size:.85rem;margin:8px 0 0}.vt-rr{margin-top:12px;border-top:1px solid #f0dfb5;padding-top:6px}.vt-ri{display:flex;gap:10px;align-items:flex-start;padding:6px 0;font-size:.92rem}.vt-ri small{display:block;color:#9a5400;font-size:.8rem;margin-top:1px}.vt-ri.hw{color:#66758a}.vt-ri .vt-lv{flex:none;color:#fff!important;background:#9aa7b8!important}.vt-ri .vt-lv.vt-l2{background:#c9971c!important}.vt-ri .vt-lv.vt-l3{background:#c0443d!important}.vt-rf{display:flex;align-items:center;gap:12px;margin-top:8px;color:#66758a;font-size:.86rem}.vt-rf span{flex:1}.vt-rgo{border:0;border-radius:10px;background:#2f5f9b;color:#fff;font:inherit;font-weight:700;padding:8px 16px;cursor:pointer}.vt-rb{display:none;margin-left:8px;font-size:.72rem;font-weight:800;color:#c2560c;background:#fff1e3;border-radius:999px;padding:1px 8px;vertical-align:2px}.vt-tk.vt-rec{outline:2px solid #e8790c;outline-offset:-1px}.vt-tk.vt-rec .vt-rb{display:inline-block}.vt-why{color:#9a5400;font-size:.82rem}.vt-why:empty{display:none}.vt-in h2{margin:0 0 2px;font-size:1.2rem}.vt-sub{color:#66758a;margin:0 0 14px;font-size:.92rem}.vt-afb{border-radius:16px;padding:12px 14px 4px;margin-bottom:14px;border:1px solid}.vt-afb h3{margin:0 0 8px!important;font-size:1rem!important;display:flex;gap:8px;align-items:center;color:#243247!important;text-transform:none!important;letter-spacing:0!important}.vt-lv{font-size:.72rem;font-weight:800;padding:3px 8px;border-radius:20px;color:#fff}.vt-a2{background:#fff8e3;border-color:#f0d58c}.vt-a2 .vt-lv{background:#c08a12}.vt-a3{background:#fdeeee;border-color:#f0b8b8}.vt-a3 .vt-lv{background:#c0453f}.vt-tk{display:flex;gap:12px;background:#fff;border-radius:12px;padding:10px 12px;margin-bottom:10px;border:1px solid #e6ebf2;cursor:pointer}.vt-tk input{width:22px;height:22px;accent-color:#e8a23a;margin:2px 0 0;flex:none}.vt-tk p{margin:0 0 6px}.vt-tg{display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:.75rem}.vt-tg>span{padding:2px 8px;border-radius:20px;font-weight:700}.vt-bk{background:#e8f0fa;color:#2f5f9b}.vt-ow{background:#f3eafc;color:#6b3fa0}.vt-ls{margin-top:8px;padding:8px 10px;border-left:4px solid #3f8f52;background:#f3faf4;border-radius:8px;font-size:.88rem;white-space:pre-line}.vt-lpt{white-space:normal;margin-top:6px}.vt-ls>b+.vt-lpt{margin-top:8px}.vt-lpt ul{margin:4px 0 0;padding-left:18px}.vt-lpt li{margin:2px 0;text-align:left}.vt-bl{display:inline-block;margin-left:4px;padding:0 7px;border-radius:7px;background:#e3eefb;color:#2f5f9b;font-size:.78rem;font-weight:600}.vt-ls b{display:block;font-size:.72rem;color:#3f8f52;text-transform:uppercase;letter-spacing:.04em}.cmpv-list:not(.on) .vt-ls{display:none}.vt-foot{display:flex;gap:8px;justify-content:space-between;align-items:center;color:#66758a;font-size:.9rem;margin:4px 0 8px}.vt-foot button{height:40px;border-radius:10px;border:1px solid #c9d5e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:600;padding:0 14px;cursor:pointer}.cmpv-bar button.vt-bm{background:#2f5f9b;border-color:#2f5f9b;color:#fff}.cmpv-bar button.vt-bm:disabled{opacity:.45;cursor:default}.cmpv-bar button.vt-cp:disabled{opacity:.45;cursor:default}.cmpv-bar button.vt-cp.ok{color:#1e7a45;border-color:#9fd3b3;background:#eef8f1}.cm-mi{width:15px;height:15px;vertical-align:-2px;margin-right:2px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.cm-mc{display:inline-flex;align-items:center;gap:1px;padding:0 7px 0 5px;border-radius:999px;font-weight:650;line-height:21px;white-space:nowrap}.cm-mc-T{color:#2f6fd0;background:#e8f0fd}.cm-mc-D{color:#1f8a4c;background:#e5f5ea}.cm-mc-K{color:#d9622b;background:#fdeee6}.cm-mc-B{color:#7c3aed;background:#f1ebfe}.cm-mc-A{color:#0e7490;background:#e0f4f7}.cm-mc-U{color:#b45309;background:#fdf2e3}'
  +'.cm-mc[data-mat]{cursor:pointer;box-shadow:inset 0 0 0 1.5px currentColor}.cm-mc[data-mat]:hover{filter:brightness(.92)}'
  +'.vt-mp{position:fixed;inset:0;z-index:2147483647;background:rgba(15,27,45,.5);display:flex;align-items:center;justify-content:center;padding:16px;font:15px/1.45 -apple-system,Inter,"Segoe UI",sans-serif;color:#243247}.vt-mpb{background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.4);width:min(1000px,100%);max-height:calc(100dvh - 32px);display:flex;flex-direction:column;overflow:hidden}.vt-mph{display:flex;align-items:center;gap:6px;padding:12px 14px;border-bottom:1px solid #eef1f6;flex-wrap:wrap}.vt-mph b{flex:1;min-width:160px;margin-left:6px}.vt-mph .cm-mc{cursor:pointer;opacity:.55}.vt-mph .cm-mc.on{opacity:1;box-shadow:inset 0 0 0 1.5px currentColor}.vt-mpx{width:42px;height:40px;border:1px solid #a8bdd8;border-radius:10px;background:#fff;color:#2f5f9b;font:inherit;cursor:pointer}.vt-mpc p,.vt-mpc li,.vt-mpc>div:not(.cap),.vt-tk p,.vt-bt,.vt-ls{text-align:justify;-webkit-hyphens:auto;hyphens:auto}.vt-mpc{overflow:auto;padding:12px 16px}.vt-mpc img{display:block;max-width:100%;max-height:70dvh;margin:0 auto 10px;border-radius:10px;cursor:zoom-in}.vt-mpc img.zoom{max-height:none;cursor:zoom-out}.vt-mpc h4{margin:10px 0 6px}.vt-mpc p{margin:0 0 8px;font-size:1rem}.vt-mph2 table{border-collapse:collapse;width:100%}.vt-mph2 td,.vt-mph2 th{border:1px solid #dce3ef;padding:4px 6px}.vt-mpf{padding:8px 16px 12px;color:#66758a;font-size:.85rem}'
  +'.vt-beam{position:fixed;inset:0;z-index:2147483600;background:#0f1b2d;color:#fff;overflow:auto;padding:4vh 5vw;font:clamp(18px,2.1vw,30px)/1.4 -apple-system,Inter,"Segoe UI",sans-serif}.vt-beam h2{margin:0 0 .2em;font-size:1.5em}.vt-beam .s{color:#a9b6c9;margin:0 0 1em;font-size:.75em}.vt-bt{border-radius:18px;padding:.7em .9em;margin-bottom:.7em;color:#243247;border:1px solid}.vt-bt .vt-lv{font-size:.55em;margin-right:.5em;vertical-align:.25em}.vt-bt small{display:flex;gap:.3em;margin-top:.4em;font-size:.6em}.vt-bt small .cm-mc{line-height:1.6;padding:0 .5em 0 .35em}.vt-bt small .cm-mi{width:1em;height:1em}.vt-bx{position:fixed;top:16px;right:16px;height:44px;padding:0 16px;border-radius:10px;border:1px solid #6d7d96;background:#1d2b40;color:#fff;font:600 16px -apple-system,Inter,sans-serif;cursor:pointer}</style>';

 /* 11.65: Material-Pille antippen → das Material der Einheit (Bild, Karte, Diagramm, Text) in einem Fenster; ← → wechselt zwischen den Materialien der Aufgabe */
 const vtSafe=h=>String(h||'').replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,'');
 const vtMd=t=>esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
 function vtMatPop(T,host,L,i,M){const D=T.document;D.querySelector('.vt-mp')?.remove();const ov=D.createElement('div');ov.className='vt-mp';ov.setAttribute('role','dialog');host.append(ov);
  const draw=()=>{const [l,k]=L[i],xs=vtRes(M,l)||[];ov.innerHTML=VTCSS+'<div class="vt-mpb"><div class="vt-mph">'+L.map(([a,b],j)=>'<span class="cm-mc cm-mc-'+b+(j===i?' on':'')+'" data-j="'+j+'"><svg class="cm-mi" viewBox="0 0 24 24">'+VMI[b][1]+'</svg>'+esc(a)+'</span>').join('')+'<b>'+esc(xs.length===1?xs[0].t:'')+'</b><button type="button" class="vt-mpx" aria-label="Schließen">✕</button></div><div class="vt-mpc">'
    +xs.map(x=>(xs.length>1&&x.t?'<h4>'+esc(x.t)+'</h4>':'')+(x.src?'<img src="'+esc(x.src)+'" alt="'+esc(x.t||l)+'">':x.html?'<div class="vt-mph2">'+vtSafe(x.html)+'</div>':(x.text||[]).map(p=>'<p>'+vtMd(p)+'</p>').join(''))).join('')
    +'</div><div class="vt-mpf">'+(xs.some(x=>x.src)?'Tippe auf das Bild zum Vergrößern':'')+(L.length>1?(xs.some(x=>x.src)?' · ':'')+'← → weitere Materialien der Aufgabe':'')+'</div></div>';
   ov.querySelector('.vt-mpx').onclick=done;ov.querySelectorAll('[data-j]').forEach(x=>x.onclick=()=>{i=+x.dataset.j;draw()});ov.querySelectorAll('.vt-mpc img').forEach(x=>x.onclick=()=>x.classList.toggle('zoom'))};
  const done=()=>{ov.remove();T.removeEventListener('keydown',key,true)},key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();done()}else if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&L.length>1){e.preventDefault();e.stopImmediatePropagation();i=(i+(e.key==='ArrowRight'?1:L.length-1))%L.length;draw()}};
  ov.addEventListener('click',e=>{if(e.target===ov)done()});T.addEventListener('keydown',key,true);draw()}
 /* 13.49: Lösung zusätzlich in Stichpunkten mit Materialbeleg – pts:[[Stichpunkt,Beleg],…] */
 const vtPts=t=>Array.isArray(t.pts)&&t.pts.length?'<div class="vt-lpt"><b>In Stichpunkten</b><ul>'+t.pts.map(p=>{const [x,bl]=Array.isArray(p)?p:[p,''];return '<li>'+esc(x)+(bl?' <span class="vt-bl">'+esc(bl)+'</span>':'')+'</li>'}).join('')+'</ul></div>':'';
 async function vtOpen(u){const b=B(),T=top();if(!b?.unitVt||!T?.classroomPreview)return;const {title,vt,mats:M,stats={},nsub=0,steps:STN={},rec:REC=[]}=await b.unitVt(u);if(!vt.length){alert('Für diese Einheit gibt es noch keine Aufgabensammlung.');return}
  const S=vtSel(u),id=(t,i)=>t.id||String(i);
  const card=(t,i)=>'<label class="vt-tk" data-vtc="'+esc(id(t,i))+'"><input type="checkbox" data-vt="'+esc(id(t,i))+'"'+(S.has(id(t,i))?' checked':'')+'><div><p>'+esc(t.q)+'<span class="vt-rb">empfohlen</span></p><div class="vt-why"></div><div class="vt-tg">'+(t.src?'<span class="vt-bk">'+(/^S\.\s?\d/.test(t.src)?'📘 Schulbuch ':'📄 ')+esc(t.src)+'</span>':'<span class="vt-ow">✎ eigene Aufgabe</span>')+vtMat(t.mat,M)+'</div>'+(t.sol||vtPts(t)?'<div class="vt-ls">'+(t.sol?'<b>Lösung'+(vtPts(t)?' als Fließtext':'')+(t.src&&t.lb!==false?' (Lehrerband)':' (Vorschlag)')+'</b>'+esc(t.sol):'')+vtPts(t)+'</div>':'')+'</div></label>';
  const box=(lv,title)=>{const L=vt.map((t,i)=>[t,i]).filter(([t])=>+t.afb===lv);return L.length?'<div class="vt-afb vt-a'+lv+'"><h3><span class="vt-lv">AFB '+(lv===2?'II':'III')+'</span>'+title+'</h3>'+L.map(([t,i])=>card(t,i)).join('')+'</div>':''};
  const html=VTCSS+'<div class="vt-in"><h2>Vertiefung: Aufgaben für AFB II und III</h2><p class="vt-sub">Hake an, was du im Unterricht stellen möchtest. „Lösungen“ zeigt die Lösungen (Lehrerband bzw. Vorschlag) – nur hier, nie auf den Schüler-iPads.</p>'+box(2,'Zusammenhänge erklären')+box(3,'Beurteilen und gestalten')+'<div class="vt-foot"><span data-vtn></span><button type="button" data-vtclr>Auswahl aufheben</button></div></div>';
  const P=T.classroomPreview({title:'Aufgabensammlung · '+title,html,solutions:true,keep:true});if(!P)return;
  const bm=T.document.createElement('button');bm.type='button';bm.className='vt-bm';P.querySelector('[data-close]').before(bm);
  /* 12.18: Aufgaben-Empfehlung – nach Zeit, Ziel und Grundlage (Ergebnisse der Klasse oder Vorschlag aus dem Lehrerband) */
  const rb=T.document.createElement('button');rb.type='button';rb.className='vt-rbtn';rb.textContent='✦ Empfehlung';bm.before(rb);
  /* 12.70: angehakte Aufgaben als Text kopieren – zum Einfügen ins Hausaufgabenmodul der Schule (ohne Lösungen) */
  const cp=T.document.createElement('button');cp.type='button';cp.className='vt-cp';bm.after(cp);
  const cpText=()=>{const L=vt.map((t,i)=>[t,i]).filter(([t,i])=>S.has(id(t,i))).sort((a,b)=>(+a[0].afb)-(+b[0].afb));const mat=t=>String(t.mat||'').split(/\{[A-Z]\}/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean).join(', ');
   return title+'\n\n'+L.map(([t],n)=>(n+1)+'. '+t.q.trim()+([t.src&&('Buch: '+t.src),mat(t)&&('Material: '+mat(t))].filter(Boolean).length?' ('+[t.src&&('Buch: '+t.src),mat(t)&&('Material: '+mat(t))].filter(Boolean).join(' · ')+')':'')).join('\n\n')};
  cp.onclick=async()=>{if(!S.size)return;const tx=cpText();let ok=false;try{await T.navigator.clipboard.writeText(tx);ok=true}catch{}
   if(!ok){try{const ta=T.document.createElement('textarea');ta.value=tx;ta.style.cssText='position:fixed;left:-9999px';T.document.body.append(ta);ta.select();ok=T.document.execCommand('copy');ta.remove()}catch{}}
   if(ok){cp.textContent='✓ Kopiert';cp.classList.add('ok');setTimeout(()=>{cp.classList.remove('ok');upd()},1800)}else T.prompt('Zum Kopieren markieren:',tx)};
  const RO={t:'45',g:'aus',b:Object.keys(stats).length?'cls':(REC.length?'lb':'cls'),...(()=>{try{return JSON.parse(localStorage.getItem('classroom-vt-rec-v1')||'{}')}catch{return {}}})()};
  const mins=t=>+t.min||(+t.afb===3?20:12),pctS=k=>stats[k]!=null?Math.round(stats[k]*100):null;
  const weak=t=>{const L=(t.st||[]).map(k=>stats[k]).filter(v=>v!=null);return L.length?Math.min(...L):null};
  const why=t=>{if(RO.b==='lb')return '';const w=weak(t),k=(t.st||[]).filter(k=>stats[k]!=null).sort((a,b)=>stats[a]-stats[b])[0];if(w==null)return Object.keys(stats).length?'':'';return (w<.75?'Schwachstelle der Klasse: „':w>=.85?'Station sicher: „':'Station: „')+(STN[k]||k)+'“ ('+pctS(k)+' %)'};
  function recPick(){const ids=vt.map((t,i)=>[t,id(t,i)]);
   if(RO.b==='lb'&&REC.length){const r=REC.find(x=>String(x.time)===RO.t)||REC.find(x=>x.time==='hw'&&RO.t==='hw')||REC[0];return {set:new Set((RO.t==='hw'?(r.hw||r.ids):r.ids)||[]),hw:RO.t==='hw'?null:r.hw||null,note:r.t||'Vorschlag aus dem Lehrerband'}}
   const lim=RO.t==='hw'?30:+RO.t,G=RO.g;const hasS=Object.keys(stats).length>0,sc=([t])=>{const w=weak(t);let v=(w==null?(hasS?.3:.5):1-w)*2;if(G==='fes')v+=+t.afb===2?.8:-.6;if(G==='ver')v+=+t.afb===3?.8:-.2;return v};
   const L=[...ids].sort((a,b)=>sc(b)-sc(a));const set=new Set(),usedM=new Set();let tot=0;const matsOf=t=>String(t.mat||'').split(/\s+/).filter(Boolean);
   if(RO.t==='hw'){const h=L.find(([t])=>mins(t)<=30)||L[0];if(h)set.add(h[1]);return {set,note:'eine Aufgabe als Hausaufgabe'}}
   for(const [t,k] of L){if(tot+mins(t)>lim+5)continue;const ov=matsOf(t).some(m=>usedM.has(m));if(ov&&L.some(([t2,k2])=>!set.has(k2)&&k2!==k&&!matsOf(t2).some(m=>usedM.has(m))&&tot+mins(t2)<=lim+5&&sc([t2])>=sc([t])-.6))continue;set.add(k);tot+=mins(t);matsOf(t).forEach(m=>usedM.add(m))}
   if(G!=='fes'&&lim>=45&&![...set].some(k=>+ids.find(x=>x[1]===k)[0].afb===3)){const T2=k=>ids.find(x=>x[1]===k)[0],drops=[...set].reverse().filter(k=>+T2(k).afb===2);let ok=false;for(const a3 of L.filter(([t])=>+t.afb===3)){if(tot+mins(a3[0])<=lim+8){set.add(a3[1]);ok=true;break}for(const d of drops)if(tot-mins(T2(d))+mins(a3[0])<=lim+8){set.delete(d);set.add(a3[1]);ok=true;break}if(ok)break}}
   if(!set.size&&L[0])set.add(L[0][1]);return {set,note:''}}
  const seg=(k,opts)=>'<span class="vt-seg">'+opts.map(([v,l])=>'<button type="button" data-ro="'+k+'" data-v="'+v+'" class="'+(RO[k]===v?'on':'')+'">'+l+'</button>').join('')+'</span>';
  const pan=T.document.createElement('div');pan.className='vt-rp';pan.hidden=true;P.querySelector('.vt-in').prepend(pan);
  function recDraw(){try{localStorage.setItem('classroom-vt-rec-v1',JSON.stringify({t:RO.t,g:RO.g,b:RO.b}))}catch{}
   const R=recPick(),byId=Object.fromEntries(vt.map((t,i)=>[id(t,i),t])),L=[...R.set].map(k=>[k,byId[k]]).filter(x=>x[1]).sort((a,b)=>(+a[1].afb)-(+b[1].afb)),tot=L.reduce((a,[,t])=>a+mins(t),0),n2=L.filter(([,t])=>+t.afb===2).length,n3=L.length-n2;
   const noStats=RO.b==='cls'&&!Object.keys(stats).length;
   pan.innerHTML='<div class="vt-rh"><b>Aufgaben-Empfehlung</b><span>Wähle Zeit, Ziel und Grundlage – mit „Anhaken“ übernimmst du die Auswahl. Danach kannst du frei ändern.</span></div>'
    +'<div class="vt-rl">Zeit in GoodNotes</div>'+seg('t',[['20','20 Min.'],['45','45 Min.'],['90','90 Min.'],['hw','Hausaufgabe']])
    +(RO.b==='cls'?'<div class="vt-rl">Ziel</div>'+seg('g',[['fes','Festigen'],['aus','Ausgewogen'],['ver','Vertiefen']]):'')
    +'<div class="vt-rl">Grundlage</div>'+seg('b',[['cls','Ergebnisse der Klasse'],['lb','Lehrerband']])
    +(noStats?'<p class="vt-rn">Noch keine Abgaben gescannt – die Auswahl richtet sich nur nach Zeit und Ziel.</p>':'')+(RO.b==='lb'&&!REC.length?'<p class="vt-rn">Für diese Einheit ist kein Vorschlag aus dem Lehrerband hinterlegt – gewählt wird nach Zeit und Ziel.</p>':'')
    +'<div class="vt-rr">'+L.map(([k,t])=>'<div class="vt-ri"><span class="vt-lv vt-l'+(+t.afb)+'">AFB '+(+t.afb===2?'II':'III')+'</span><div>'+esc((t.src?t.src.replace(/^S\.\s?\d+,\s*/,'')+' · ':'')+t.q.slice(0,90)+(t.q.length>90?' …':''))+(why(t)?'<small>'+esc(why(t))+'</small>':'')+'</div></div>').join('')
    +(R.hw&&byId[R.hw]?'<div class="vt-ri hw"><span class="vt-lv">HA</span><div>Hausaufgabe: '+esc(byId[R.hw].q.slice(0,90))+'</div></div>':'')+'</div>'
    +'<div class="vt-rf"><span>'+(R.note?esc(R.note)+' · ':'')+'≈ '+tot+' Min. · '+n2+'× AFB II, '+n3+'× AFB III</span><button type="button" class="vt-rgo" data-rgo>Anhaken</button></div>';
   P.querySelectorAll('.vt-tk').forEach(c=>{const on=R.set.has(c.dataset.vtc),t=byId[c.dataset.vtc];c.classList.toggle('vt-rec',on&&!pan.hidden);const w=c.querySelector('.vt-why');if(w)w.textContent=on&&!pan.hidden&&t?why(t):''});
   pan.querySelectorAll('[data-ro]').forEach(x=>x.onclick=()=>{RO[x.dataset.ro]=x.dataset.v;recDraw()});
   pan.querySelector('[data-rgo]').onclick=()=>{S.clear();for(const k of R.set)S.add(k);vtSave(u,S);P.querySelectorAll('[data-vt]').forEach(x=>x.checked=S.has(x.dataset.vt));upd()}}
  rb.onclick=()=>{pan.hidden=!pan.hidden;rb.classList.toggle('on',!pan.hidden);recDraw();if(!pan.hidden)pan.scrollIntoView({block:'start'})};
  const upd=()=>{const n=S.size;bm.textContent='Am Smartboard zeigen ('+n+')';bm.disabled=!n;cp.textContent='Kopieren ('+n+')';cp.title='Die angehakten Aufgaben als Text kopieren – ohne Lösungen, z. B. für das Hausaufgabenmodul';cp.disabled=!n;P.querySelector('[data-vtn]').textContent=n+' von '+vt.length+' Aufgaben angehakt · die Auswahl bleibt gespeichert'};upd();
  P.querySelectorAll('[data-vt]').forEach(x=>x.onchange=()=>{x.checked?S.add(x.dataset.vt):S.delete(x.dataset.vt);vtSave(u,S);upd()});
  const mp=host=>e=>{const p=e.target.closest?.('.cm-mc[data-mat]');if(!p||(e.type==='keydown'&&e.key!=='Enter'&&e.key!==' '))return;e.preventDefault();e.stopPropagation();const ps=[...p.parentNode.querySelectorAll('.cm-mc[data-mat]')];vtMatPop(T,host(),ps.map(x=>[x.dataset.mat,x.dataset.mk]),ps.indexOf(p),M)};
  P.addEventListener('click',mp(()=>T.document.body),true);P.addEventListener('keydown',mp(()=>T.document.body),true);
  P.querySelector('[data-vtclr]').onclick=()=>{S.clear();vtSave(u,S);P.querySelectorAll('[data-vt]').forEach(x=>x.checked=false);upd()};
  bm.onclick=()=>{const L=vt.map((t,i)=>[t,i]).filter(([t,i])=>S.has(id(t,i))).sort((a,b)=>(+a[0].afb)-(+b[0].afb));if(!L.length)return;
   const ov=T.document.createElement('div');ov.className='vt-beam';ov.setAttribute('role','dialog');ov.innerHTML=VTCSS+'<button type="button" class="vt-bx">Schließen</button><h2>'+esc(title)+'</h2><p class="s">Vertiefung · bearbeite die Aufgaben in GoodNotes</p>'
    +L.map(([t])=>'<div class="vt-bt vt-afb vt-a'+(+t.afb)+'"><span class="vt-lv">AFB '+(+t.afb===2?'II':'III')+'</span>'+esc(t.q)+(t.mat?'<small>'+vtMat(t.mat,M)+'</small>':'')+'</div>').join('');
   ov.addEventListener('click',mp(()=>ov),true);T.document.body.append(ov);const done=()=>{ov.remove();T.removeEventListener('keydown',k,true)},k=e=>{if(e.key==='Escape'&&!T.document.querySelector('.vt-mp')){e.preventDefault();e.stopImmediatePropagation();done()}};T.addEventListener('keydown',k,true);ov.querySelector('.vt-bx').onclick=done;
   try{ov.requestFullscreen?.().catch(()=>{})}catch{}}}
 const prev=o=>{try{top().classroomPreview(o)}catch(e){alert('Vorschau nicht möglich: '+e.message)}};
 function listHtml(secs,note){return (note?'<p class="cmpv-note">'+esc(note)+'</p>':'')+secs.map(s=>(secs.length>1?'<h3>'+esc(s.name)+'</h3>':'')+'<table>'+s.rows.map(r=>'<tr><td>'+esc(r[0])+'</td><td class="info">'+esc(r[1])+'</td><td><span class="sol">'+esc(r[2])+'</span></td></tr>').join('')+'</table>').join('')}
 /* 11.42: „Material per AirDrop“ – die Schulbuch-Datei über das Teilen-Menü (AirDrop) an die Schüler-iPads schicken.
    Die Datei wird beim Anzeigen schon vorbereitet, damit das Teilen-Menü direkt beim Tippen aufgeht (Safari verlangt das). */
 /* 11.46: Teilen-Menü nur auf iPad/iPhone; am Mac wird die Datei gespeichert */
 const touchDev=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent));
 function saveFile(f){const W=top()||window,a=W.document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;W.document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}
 const AIR={};
 function prefetchAir(){const b=B();if(!b?.bookFile)return;view.querySelectorAll('[data-do="air"]').forEach(x=>{const k=x.dataset.k;if(AIR[k])return;AIR[k]='…';(/^lek:/.test(k)?(b.lessonFile?b.lessonFile(k.slice(4),x.dataset.bu||''):Promise.resolve(null)):b.bookFile(k)).then(f=>{AIR[k]=f?new File([f.text],f.name,{type:'application/octet-stream'}):null}).catch(()=>{AIR[k]=null})})}
 function airdrop(k){const f=AIR[k];if(!f||f==='…'){prefetchAir();alert('Die Datei wird noch vorbereitet – bitte gleich noch einmal tippen.');return}
  if(touchDev()){const N=navigator;try{if(N.canShare&&N.canShare({files:[f]})){N.share({files:[f],title:f.name}).catch(()=>{});return}}catch{}}
  /* am Mac: Datei in „Downloads“ speichern – dann im Finder per AirDrop senden (das Teilen-Menü von Chrome gibt am Mac nur einen Dateipfad weiter) */
  saveFile(f);alert('„'+f.name+'“ liegt jetzt in „Downloads“. Im Finder: rechte Maustaste › Teilen › AirDrop.')}
 /* 11.44: „Für Kollegen …“ – eine einzige HTML-Datei mit der Lerneinheit (und dem Schulbuchmaterial, falls geladen).
    Sie läuft ohne die App in jedem Browser; unten links zeigt „Lösungen“ alle Lösungen. */
 const ascii=t=>String(t).replace(/[äÄöÖüÜß]/g,c=>({'ä':'ae','Ä':'Ae','ö':'oe','Ö':'Oe','ü':'ue','Ü':'Ue','ß':'ss'}[c])).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\w .,-]+/g,'').replace(/\s+/g,' ').trim();
 async function colleague(k,el){const b=B(),u=data.units.find(x=>x.u===k);if(!u)return;let book=null;try{book=u.book&&b.bookFile?await b.bookFile(k):null}catch{}const uq=new URLSearchParams(u.file.split('?')[1]||'').get('u');
  return buildKol({file:u.file.split('?')[0],uq,book,name:ascii(u.title.replace(/^L\d+ · /,(uq||'').toUpperCase()+' '))},el)}
 /* 11.47: auch Vokabeln, Wiederholung, Grammatik, Übersetzungs-Trainer und Training – der Inhalt reist in der Datei mit */
 async function colleagueP(k,el){const b=B(),[kind,kk,ii]=String(k).split('|'),L2=data.lessons.find(x=>x.k===kk),lab=L2?lname(L2):'';
  try{if(kind==='v'||kind==='w'||kind==='g'){const r=await b.practice(kind,kk,true);if(!r){alert('Dafür fehlen noch Inhalte.');return}return buildKol({file:'ueben.html',hash:r.hash,name:ascii(({v:'Lernvokabeln',w:'Wiederholungsvokabeln',g:'Grammatik'})[kind]+' '+lab)},el)}
   if(kind==='t'){const h=await b.ttHash(kk,+ii||0);if(!h)return;const x=L2?.tt?.[+ii||0];return buildKol({file:'texttrainer.html',hash:h,name:ascii('Uebersetzungs-Trainer '+(x?x.title:lab))},el)}
   if(kind==='x')return buildKol({file:'uebungen.html',name:ascii('Training Relativpronomen Passiv')},el)}catch(e){alert('Die Datei konnte nicht erstellt werden: '+(e&&e.message||e))}}
 /* 12.32: „Exportieren …“ einer Einheit = eine HTML-Datei: im Browser ansehen und ausprobieren (auch für Kollegen ohne App), in der App laden, Finder-Vorschau */
 const SUBA={erdkunde:'Ek',geschichte:'Ge'};
 function askExp(u,hasVt){return new Promise(res=>{let d=document.getElementById('einExp');if(!d){d=document.createElement('dialog');d.id='einExp';d.className='ein-ask2';document.body.append(d)}
  d.innerHTML='<form method="dialog"><h2>Exportieren</h2><p class="ein-sub" style="margin:0 0 10px">„'+esc(u.title)+'“ als HTML-Datei – zum Laden in den Classroom-Manager und zum Ansehen im Browser, auch für Kollegen ohne App.</p><div class="pp">'+(hasVt?'<label><input type="checkbox" data-p="vt" checked> Aufgabensammlung AFB II/III mitnehmen</label>':'')+'<label><input type="checkbox" data-p="lock"> Lösungen in der Browser-Ansicht sperren <small style="color:#7d8aa0">(z. B. wenn die Datei an Schüler geht)</small></label></div><div class="acts"><button type="button" data-no>Abbrechen</button><button type="submit" class="pri">Speichern</button></div></form>';
  d.querySelector('[data-no]').onclick=()=>{d.close();res(null)};d.querySelector('form').onsubmit=e=>{e.preventDefault();const p=Object.fromEntries([...d.querySelectorAll('[data-p]')].map(x=>[x.dataset.p,x.checked]));d.close();res(p)};d.showModal()})}
 async function unitExport(k,el){const b=B(),u=data.units.find(x=>x.u===k);if(!u)return;let bf=null;try{bf=b?.bookFile?await b.bookFile(k):null}catch{}
  let x=null;try{x=bf&&JSON.parse(bf.text)}catch{}if(!x){alert('Die Einheit ist auf diesem Gerät nicht vollständig gespeichert. Lade ihre Datei einmal neu.');return}
  const D=x.def||{},hasVt=Array.isArray(D.vt)&&D.vt.length>0,opt=await askExp(u,hasVt);if(!opt)return;
  if(x.def){const def={...D,meta:{...(D.meta||{}),...(u.subject&&u.subject!=='latein'?{subject:u.subject}:{}),...(+u.jg?{jg:+u.jg}:{})}};if(hasVt&&!opt.vt)delete def.vt;x={...x,def}}
  const r=ordReihen().find(r=>eff(r).some(e=>e.u===k)),st=(x.def?.steps||[]).filter(s=>s&&s.type!=='pant'),min=Math.round(st.reduce((a,s)=>a+(+s.min||0),0)),nm=ascii(((SUBA[u.subject]?SUBA[u.subject]+(u.jg||''):'')+' '+u.title.replace(/^L\d+ · /,'')).trim());
  const ql={kind:'Lerneinheit',title:u.title,sub:[SUBJ[u.subject]||u.subject,+u.jg?'Jahrgang '+u.jg:'',r?'Reihe „'+r.title+'“':''].filter(Boolean).join(' · '),chips:['AFB I',st.length+' Stationen',...(min?['ca. '+min+' Min.']:[]),...(hasVt&&opt.vt?['+ Aufgabensammlung AFB II/III']:[])],
   actions:'<div class="ac"><button type="button" class="o" data-cmq="start">▶ Einheit starten</button>'+(opt.lock?'':'<button type="button" data-cmq="sol">Mit Lösungen ansehen</button>')+'<p class="s" style="flex-basis:100%;margin:4px 0 0">Diese Datei lädst du auch direkt in den Classroom-Manager: Unterricht → Laden-Symbol.</p></div>',
   items:st.map(s=>[s.t||s.k,+s.min?'ca. '+String(s.min).replace('.',',')+' Min.':'']),note:'Doppelklick öffnet die Einheit im Browser zum Ansehen und Ausprobieren. In den Classroom-Manager laden: Unterricht → Laden-Symbol.'};
  const uq=new URLSearchParams(u.file.split('?')[1]||'').get('u');
  return buildKol({file:u.file.split('?')[0],uq,book:{text:JSON.stringify(x)},name:nm,fname:nm+'.html',ql,lock:!!opt.lock,msg:f=>'„'+f.name+'“ ('+Math.round(f.size/1024)+' KB) liegt jetzt in „Downloads“. In den Classroom-Manager laden (auch auf einem anderen Gerät) oder an Kollegen weitergeben – sie öffnet sich mit Doppelklick im Browser.'},el)}
 async function buildKol(o,el){const t0=el?.textContent;if(el){el.disabled=true;el.textContent='Wird erstellt …'}
  try{const file=o.file,uq=o.uq,book=o.book;let html=await (await fetch('../'+file,{cache:'no-store'})).text();
   for(const m of [...html.matchAll(/<script src="([^"]+)"><\/script>/g)]){const js=await (await fetch('../'+m[1].split('?')[0],{cache:'no-store'})).text();html=html.replace(m[0],()=>'<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>')}
   const emb='<script>window.CM_EMBED_U='+JSON.stringify(uq||'')+';window.CM_EMBED_BOOK='+(book?book.text.replace(/</g,'\\u003c'):'null')+';window.CM_EMBED_HASH='+JSON.stringify(o.hash||'')+';</script>';
   html=html.replace(/<script>/,emb+'<script>');
   const tail='<script>(()=>{const d=document.createElement("div");d.style.cssText="position:fixed;left:12px;bottom:12px;z-index:99999;display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;border-radius:12px;background:#fff6e5;border:1px solid #f1d8a8;color:#7a4b00;font:600 13px -apple-system,Inter,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.12)";const B="height:34px;padding:0 12px;border-radius:9px;border:1px solid #d9c49a;background:#fff;font:inherit;cursor:pointer";d.innerHTML="Ansicht für Kolleginnen und Kollegen <button type=button data-a style=\\""+B+"\\">Lösungen</button><button type=button data-b style=\\""+B+"\\">Lösungsblatt</button>";let a=false,b=false;const sty=(x,on)=>{x.style.background=on?"#fff4e0":"#fff";x.style.borderColor=on?"#e8a23a":"#d9c49a"};const A=d.querySelector("[data-a]"),S=d.querySelector("[data-b]");A.onclick=()=>{a=!a;sty(A,a);try{cmPreviewSolutions(a)}catch(e){}};S.onclick=()=>{b=!b;sty(S,b);try{cmSolutionSheet(b)}catch(e){}};addEventListener("message",e=>{if(e.data&&e.data.type==="cm-sol-off"){b=false;sty(S,false)}});document.body.append(d);setTimeout(()=>{A.hidden=typeof window.cmPreviewSolutions!=="function";S.hidden=typeof window.cmSolutionSheet!=="function";if(A.hidden&&S.hidden)d.firstChild.textContent="Ansicht für Kolleginnen und Kollegen"},1500);const w=document.getElementById("who");if(w)w.style.display="none"})();</script>';
   {const bi=html.toLowerCase().lastIndexOf('</body>');const add=(o.lock?'<script>(()=>{const w=document.getElementById("who");if(w)w.style.display="none"})()</script>':tail);html=bi<0?html+add:html.slice(0,bi)+add+html.slice(bi)}
   /* 12.32: Übersicht für Finder-Vorschau und Startseite im Browser */if(o.ql&&window.cmQlInject)html=cmQlInject(html,o.ql);
   const f=new File([html],o.fname||o.name+' - fuer Kollegen.html',{type:'text/html'});
   if(touchDev()){const N=navigator;try{if(N.canShare&&N.canShare({files:[f]})){await N.share({files:[f],title:f.name});return}}catch(e){if(e&&e.name==='AbortError')return}}
   /* 11.46: am Mac nicht über das Teilen-Menü (Chrome reicht dort nur einen Dateipfad als Text weiter), sondern als echte Datei speichern */
   saveFile(f);alert(o.msg?o.msg(f):'„'+f.name+'“ ('+Math.round(f.size/1024)+' KB) liegt jetzt in „Downloads“. Schicke sie per Mail oder AirDrop an deine Kollegin oder deinen Kollegen – sie öffnet sich mit Doppelklick im Browser.')}
  catch(e){alert('Die Datei konnte nicht erstellt werden: '+(e&&e.message||e))}finally{if(el){el.disabled=false;el.textContent=t0}}}
 async function run(d,k,el){const b=B();if(!b)return;/* 12.62: Knopf „Lerneinheiten (iPad)“ öffnet das Fenster „Material“ */if(d==='lu'){openMat();return}const l=data.lessons.find(x=>x.k===k),u=data.units.find(x=>x.u===k);
  if(d==='lv')return prev({title:'Vokabeln '+l.label,html:listHtml(b.list('main',k),'Lateinisch und Angaben – die Bedeutungen erscheinen mit „mit Lösungen“.'),solutions:true});
  if(d==='lw')return prev({title:'Wiederholung '+l.label,html:listHtml(b.list('wh',k)),solutions:true});
  /* 11.50: „Ansehen“ zeigt die Grammatik-Aufgaben selbst (wie die Schüler sie üben), nicht nur die Themen */
  if(d==='lg'){let r=null;try{r=await b.practice('g',k,true)}catch{}if(r&&r.hash)return prev({title:'Grammatik '+l.label,url:'ueben.html?vorschau=1'+r.hash})}
  if(d==='lg')return prev({title:'Grammatik '+l.label,html:'<h3>Themen</h3><ul>'+l.gr.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>'+(l.syntax?'<h3>Syntax</h3><p>'+esc(l.syntax)+'</p>':'')});
  if(d==='alan'){if(cx.subject!=='latein'){alert('Bitte zuerst eine Latein-Klasse wählen.');return}if(!(await classroomConfirm('„Alternative Lateinarbeit · L'+k+'“ als Klassenarbeit der '+(cx.short||'Klasse')+' im aktuellen Halbjahr anlegen?\n\nNotengrenzen aus dem Notenschlüssel, Eingabe je Schüler in A · B · C.')))return;try{const r=await b.alaNotes(k);if(r)top().document.getElementById('tab-noten')?.click()}catch(e){alert('Übernehmen nicht möglich: '+(e.message||e))}return}
  if(d==='vt')return vtOpen(k);
  if(d==='ala')return prev({title:'Alternative Lateinarbeit '+l.label,url:'lateinarbeit.html?vorschau=1&id=ala-'+encodeURIComponent(k),noStudent:true});
  if(d==='pu')return prev({title:'Übungen '+l.label,url:'uebungen.html?vorschau=1'});
  if(d==='pt'){const [kk,ii]=String(k).split('|'),L2=data.lessons.find(x=>x.k===kk);const h=await b.ttHash(kk,+ii||0);if(!h)return;return prev({title:'Übersetzungs-Trainer '+lname(L2),url:'texttrainer.html?vorschau=1'+h})}
  if(d==='pl')return prev({title:u.title,url:u.file+(u.file.includes('?')?'&':'?')+'vorschau=1'});
  if(d==='load')return loadPkg();
  if(d==='air')return airdrop(k);
  if(d==='kol')return colleague(k,el);
  if(d==='uexp')return unitExport(k,el);
  if(d==='kolp')return colleagueP(k,el);
  if(d==='uv'||d==='uw'||d==='ug')return practice(d.slice(1),k,el);
  /* Dialoge des Noten-Managers: kurz zu „Noten“ wechseln, nach dem Schließen zurück */
  const T=top()?.document;const back0=[...(T?.querySelectorAll('[data-view][aria-selected="true"]')||[])][0];
  const skip=v=>{try{top().classroomCoverSkip=v;top().classroomCoverUpdate?.()}catch{}};skip(true);T?.getElementById('tab-noten')?.click();await new Promise(r=>setTimeout(r,60));let dl=null;try{dl=b.act(d,k)}catch(e){skip(false);alert(e.message);return}if(!dl||!back0)skip(false);
  if(dl&&back0){const back=()=>{setTimeout(()=>{/* 12.74: „Zur Notentabelle“ – in Noten bleiben */if(NF().cmStayNoten){NF().cmStayNoten=false;skip(false);return}const W=NF().document;if([...W.querySelectorAll('dialog')].some(x=>x.open)){W.addEventListener('close',back,{capture:true,once:true});return}back0.click();skip(false)},0)};dl.addEventListener('close',back,{once:true})}}
 /* Üben: QR-Code (ohne Note, ohne Abgabe) */
 async function practice(kind,k,el){const b=B();let r=null;if(el){el.disabled=true}try{r=await b.practice(kind,k)}catch(e){alert('Üben nicht möglich: '+e.message)}finally{if(el)el.disabled=false}
  if(!r){alert('Dafür fehlen noch Inhalte.');return}
  let dlg=document.getElementById('einQr');if(!dlg){dlg=document.createElement('dialog');dlg.id='einQr';document.body.append(dlg)}
  let svg='';if(r.qr){try{svg=b.qr(r.url,{ecc:'L',boost:false,dark:'#243247',border:3})}catch{svg=''}}
  dlg.classList.remove('big');
  dlg.innerHTML='<form method="dialog"><h2>'+esc(r.title)+' üben · '+esc(cx.short)+'</h2><p class="muted">'+(r.n)+' '+(kind==='g'?'Aufgaben':'Wörter')+' · sofortige Rückmeldung, falsche kommen wieder · Abgabe-QR oben rechts (gewertet: erster Versuch).</p>'
   +(svg?'<div class="qr">'+svg+'</div>':'<div class="note">Für einen QR-Code ist das zu viel. Schicke den Link per Jamf Teacher („Webseite öffnen“) oder AirDrop.</div>')
   +'<code>'+esc(r.url.split('#')[0])+'</code>'
   +'<div class="acts">'+(svg?'<button type="button" data-big>Groß zeigen</button>':'')+'<button type="button" data-copy>Link kopieren</button><button type="button" data-look>👁 Ansehen</button><button type="button" class="pri" data-x>Schließen</button></div></form>';
  dlg.querySelector('[data-x]').onclick=()=>dlg.close();dlg.querySelector('[data-big]')?.addEventListener('click',e=>{dlg.classList.toggle('big');e.target.textContent=dlg.classList.contains('big')?'Klein':'Groß zeigen'});
  dlg.querySelector('[data-copy]').onclick=async e=>{try{await navigator.clipboard.writeText(r.url);e.target.textContent='Kopiert ✓'}catch{(await classroomPrompt('Link:',r.url))}};
  dlg.querySelector('[data-look]').onclick=()=>{dlg.close();prev({title:r.title+' üben',url:'ueben.html?vorschau=1'+r.hash})};
  dlg.showModal()}
 /* ---------- 11.57: Seite einer Reihe – Übersicht und Bearbeiten (Stift: verschieben, umbenennen, ausblenden, löschen, eigene Einträge) ---------- */
 /* ---------- 11.58: Lernpakete einer Lektion je Abschnitt ordnen (Stift in der Lektion) ---------- */
 let lEdit=false;
 function lesParts(k,us,p){const e=edOf('les:'+k),del=new Set(e.del||[]),hid=new Set(e.hid||[]),names=e.names||{},ord=e.order||[],pos=x=>{const i=ord.indexOf(x);return i<0?1e6:i};
  return [...us.filter(u=>u.part===p&&!del.has(u.u)).map((u,i)=>({key:u.u,u,i,t:names[u.u]||u.title.replace(/^L\d+ · /,'')})),...(e.own||[]).filter(o=>o.part===p).map((o,i)=>({key:o.k,own:1,i:1000+i,t:o.t}))]
   .sort((a,b)=>pos(a.key)-pos(b.key)||a.i-b.i).map(x=>({...x,hid:hid.has(x.key)}))}
 function lesEditHtml(p,L){return '<div class="rh-list rh-ed" data-part="'+p+'" style="grid-column:1/-1">'+L.map((x,i)=>'<div class="rh-er'+(x.hid?' hid':'')+(x.own?' own':'')+'" data-k="'+esc(x.key)+'"><span class="rh-grip" data-grip title="Ziehen zum Verschieben">⠿</span><span class="rh-n">'+String.fromCharCode(65+i)+'</span>'
   +(x.hid?'<span class="rh-t">'+esc(x.t)+'<small>ausgeblendet</small></span>':'<input class="rh-in" value="'+esc(x.t)+'" data-name aria-label="Name">')
   +'<button type="button" class="rh-b'+(x.hid?' on':'')+'" data-hid title="'+(x.hid?'Wieder einblenden':'Ausblenden')+'">'+(x.hid?ICO.noeye:ICO.eye)+'</button><button type="button" class="rh-b del" data-del title="Löschen">'+ICO.del+'</button></div>').join('')
  +'<button type="button" class="rh-add" data-add>+ Eigenen Eintrag hinzufügen</button></div>'}
 function wireLes(l){const M=view.querySelector('.ein-main');if(!M)return;const id='les:'+l.k,us=data.units.filter(u=>u.subject==='latein'&&String(u.lesson)===l.k);
  const e=()=>{const x=edOf(id);x.names??={};x.hid??=[];x.del??=[];x.own??=[];return x};
  const save=x=>{for(const k of ['names','hid','del','own','order'])if(x[k]&&(Array.isArray(x[k])?!x[k].length:!Object.keys(x[k]).length))delete x[k];edSet(id,x)};
  const allKeys=()=>['sach','ueb','pont'].flatMap(p=>lesParts(l.k,us,p).map(x=>x.key));
  M.querySelectorAll('[data-part]').forEach(list=>{const p=list.dataset.part,rows=()=>[...list.querySelectorAll('.rh-er')];
   list.querySelectorAll('[data-name]').forEach(inp=>inp.onchange=()=>{const k=inp.closest('.rh-er').dataset.k,x=e(),own=x.own.find(o=>o.k===k),v=inp.value.trim();if(own){own.t=v||own.t}else{const u=us.find(y=>y.u===k),base=u?u.title.replace(/^L\d+ · /,''):'';if(!v||v===base)delete x.names[k];else x.names[k]=v}save(x);draw()});
   list.querySelectorAll('[data-hid]').forEach(b=>b.onclick=()=>{const k=b.closest('.rh-er').dataset.k,x=e(),i=x.hid.indexOf(k);if(i>=0)x.hid.splice(i,1);else x.hid.push(k);save(x);draw()});
   list.querySelectorAll('[data-del]').forEach(b=>b.onclick=async ()=>{const k=b.closest('.rh-er').dataset.k,x=e(),own=x.own.find(o=>o.k===k);const t=b.closest('.rh-er').querySelector('input,.rh-t')?.value||b.closest('.rh-er').querySelector('.rh-t')?.firstChild?.textContent||'';
    if(!(await classroomConfirm('„'+t+'“ aus dieser Lektion löschen?'+(own?'':'\n\nDas Lernpaket und die Ergebnisse der Schüler bleiben erhalten. Über „Ursprüngliche Fassung“ kommt es zurück.'))))return;if(own)x.own=x.own.filter(o=>o.k!==k);else x.del.push(k);save(x);draw()});
   list.querySelector('[data-add]').onclick=async ()=>{const t=((await classroomPrompt('Name des Eintrags (z. B. Vokabeltest, Wiederholung):',''))||'').trim();if(!t)return;const x=e(),k='own'+Date.now().toString(36);x.own.push({k,t,part:p});x.order=[...allKeys(),k];save(x);draw()};
   list.querySelectorAll('[data-grip]').forEach(g=>g.onpointerdown=ev=>{ev.preventDefault();const row=g.closest('.rh-er');try{g.setPointerCapture(ev.pointerId)}catch{}row.classList.add('drag');
    g.onpointermove=m=>{let before=null;for(const o of rows()){if(o===row)continue;const bx=o.getBoundingClientRect();if(m.clientY<bx.top+bx.height/2){before=o;break}}const ref=before||list.querySelector('[data-add]');if(ref&&ref!==row&&row.nextSibling!==ref)list.insertBefore(row,ref)};
    g.onpointerup=g.onpointercancel=()=>{g.onpointermove=g.onpointerup=g.onpointercancel=null;row.classList.remove('drag');const x=e(),mine=rows().map(o=>o.dataset.k),others=allKeys().filter(k=>!mine.includes(k));x.order=[...others,...mine];save(x);draw()}})});
  M.querySelector('[data-lreset]')?.addEventListener('click',async ()=>{if(!(await classroomConfirm('Alle Änderungen an den Lernpaketen dieser Lektion verwerfen?')))return;const a=edAll();delete a[id];wr(EKEY,a);draw()})}
 let rEdit=false;
 const ICO={pen:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg>',
  eye:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  noeye:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.4-1"/></svg>',
  del:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  up:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 15V4M7 9l5-5 5 5M5 20h14"/></svg>',
  chk:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/></svg>',box:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',plus:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',x:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',mv:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M4 6h10M4 12h7M4 18h10"/><path d="M15 9l4 3-4 3"/></svg>',
  down:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 20V9M7 14l5-5 5 5M5 4h14"/></svg>'};/* 11.91: „Datei laden“ wie beim Backup – Pfeil nach oben zur Linie */
 const lesSum=l=>{const us=data.units.filter(u=>u.subject==='latein'&&String(u.lesson)===l.k).length,a=[l.nV&&'Vokabeln',l.gr.length&&'Grammatik',l.tt.length&&(l.tt.length>1?l.tt.length+' Texte':'Lektionstext'),us&&us+' Lernpaket'+(us>1?'e':''),ALA[l.k]&&'Lateinarbeit'].filter(Boolean);return a.length?a.join(' · '):'noch keine Inhalte geladen'};
 function reiheHtml(r){const L=eff(r),vis=L.filter(x=>!x.hid),nh=L.length-vis.length,subj=SUBJ[r.subject]||r.subject;
  const head='<div class="ein-mh"><h2>'+esc((r.lab?r.lab+' · ':'')+r.title)+'</h2><span class="sp"></span><button type="button" class="ein-b ein-ib" data-rexp>'+ICO.up+'Reihe exportieren</button><button type="button" class="ein-curb'+(rEdit?' on':'')+'" data-redit aria-pressed="'+rEdit+'" title="'+(rEdit?'Bearbeiten beenden':'Reihe bearbeiten: verschieben, umbenennen, ausblenden, löschen')+'">'+ICO.pen+'</button></div>'
   +'<p class="ein-sub">'+[r.ch&&esc(r.ch),esc(subj)+(r.subject==='latein'?'':' · Jahrgang '+r.jg),r.src&&esc(r.src),vis.length+' Einträge'+(nh?' · '+nh+' ausgeblendet':'')].filter(Boolean).join(' · ')+'</p>';
  if(!rEdit)return head+'<div class="rh-list">'+vis.map((x,i)=>{const un=x.u&&data.units.find(y=>y.u===x.u),ll=x.les!=null?data.lessons.find(l=>l.k===x.les):null;return '<button type="button" class="rh-row" data-go="'+esc(topicId(r,r.jg,x,un))+'"><span class="rh-n">'+(ll?esc(ll.tag):i+1)+'</span><span class="rh-t">'+esc(x.t)+'<small>'+(ll?lesSum(ll):un?(un.gl?un.gl.n+' Stationen · ca. '+un.gl.min+' Min.':'Lerneinheit'):x.own?'eigener Eintrag':r.subject==='latein'?'im Buch':'noch keine Lerneinheit')+'</small></span>'+(un?GLP:'')+((NEU['r:'+r.id]?.k||[]).includes(x.k)||(un&&NEU['u:'+un.u])?NEUB:'')+(isStand(topicId(r,r.jg,x,un))?'<span class="stand">aktuell</span>':'')+'</button>'}).join('')+'</div>'
   +'<p class="ein-foot" style="margin:14px 2px 0">Mit dem Stift kannst du die Reihe ändern. Die Änderungen gelten nur auf diesem Gerät; „Reihe exportieren“ speichert sie in eine neue Datei.</p>';
  return head+'<div class="rh-list rh-ed">'+L.map((x,i)=>'<div class="rh-er'+(x.hid?' hid':'')+(x.own?' own':'')+'" data-k="'+esc(x.k)+'"><span class="rh-grip" data-grip title="Ziehen zum Verschieben">⠿</span><span class="rh-n">'+(i+1)+'</span>'
    +(x.hid?'<span class="rh-t">'+esc(x.t)+'<small>ausgeblendet</small></span>':'<input class="rh-in" value="'+esc(x.t)+'" data-name aria-label="Name">')
    +'<button type="button" class="rh-b'+(x.hid?' on':'')+'" data-hid title="'+(x.hid?'Wieder einblenden':'Ausblenden')+'">'+(x.hid?ICO.noeye:ICO.eye)+'</button><button type="button" class="rh-b del" data-del title="Löschen">'+ICO.del+'</button></div>').join('')
   +'<button type="button" class="rh-add" data-add>+ Eigenen Eintrag hinzufügen (z. B. Test, Wiederholung, Exkursion)</button></div>'
   +'<p class="ein-foot" style="margin:12px 2px 0">Umbenennen ändert nur die Anzeige. Die Notenspalten heißen dann genauso, und die Ergebnisse bleiben bei der richtigen Einheit.'+(Object.keys(edOf(r.id)).length?' · <a data-reset>Ursprüngliche Reihe wiederherstellen</a>':'')+'</p>'}
 function wireReihe(r){const M=view.querySelector('.ein-main');if(!M)return;
  M.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{if(FOR.has('r:'+r.id))FOR.add(b.dataset.go);sel=b.dataset.go;neuSeen(sel);draw()});
  M.querySelector('[data-redit]')?.addEventListener('click',()=>{rEdit=!rEdit;draw()});
  M.querySelector('[data-rexp]')?.addEventListener('click',e=>reiheExp(r,e.currentTarget));
  if(!rEdit)return;const e=()=>{const x=edOf(r.id);x.names??={};x.hid??=[];x.del??=[];x.own??=[];return x};
  const save=x=>{for(const k of ['names','hid','show','del','own','order'])if(x[k]&&(Array.isArray(x[k])?!x[k].length:!Object.keys(x[k]).length))delete x[k];edSet(r.id,x)};
  const rows=()=>[...M.querySelectorAll('.rh-er')];
  M.querySelectorAll('[data-name]').forEach(inp=>inp.onchange=()=>{const k=inp.closest('.rh-er').dataset.k,x=e(),own=x.own.find(o=>o.k===k),v=inp.value.trim();
   if(own){own.t=v||own.t}else{const base=(r.entries||[]).find(o=>o.k===k);if(!v||v===base?.t)delete x.names[k];else x.names[k]=v}save(x);draw()});
  M.querySelectorAll('[data-hid]').forEach(b=>b.onclick=()=>{const k=b.closest('.rh-er').dataset.k,x=e(),it=eff(r).find(o=>o.k===k);x.show??=[];const i=x.hid.indexOf(k),j=x.show.indexOf(k);if(it&&it.hid){if(i>=0)x.hid.splice(i,1);else if(j<0)x.show.push(k)}else{if(j>=0)x.show.splice(j,1);else x.hid.push(k)}save(x);draw()});
  M.querySelectorAll('[data-del]').forEach(b=>b.onclick=async ()=>{const k=b.closest('.rh-er').dataset.k,x=e(),it=eff(r).find(o=>o.k===k);if(!it)return;
   if(!(await classroomConfirm('„'+it.t+'“ aus der Reihe löschen?'+(it.u?'\n\nDie Lerneinheit und die Ergebnisse der Schüler bleiben erhalten. Über „Ursprüngliche Reihe wiederherstellen“ kommt der Eintrag zurück.':''))))return;
   if(it.own)x.own=x.own.filter(o=>o.k!==k);else x.del.push(k);save(x);draw()});
  M.querySelector('[data-add]')?.addEventListener('click',async ()=>{const t=((await classroomPrompt('Name des Eintrags (z. B. Test, Wiederholung, Exkursion):',''))||'').trim();if(!t)return;const x=e(),k='own'+Date.now().toString(36);x.own.push({k,t});x.order=[...eff(r).map(o=>o.k),k];save(x);draw()});
  M.querySelector('[data-reset]')?.addEventListener('click',async ()=>{if(!(await classroomConfirm('Alle Änderungen an dieser Reihe verwerfen (Reihenfolge, Namen, ausgeblendet, gelöscht, eigene Einträge)?')))return;edSet(r.id,{});const a=edAll();delete a[r.id];wr(EKEY,a);draw()});
  /* Verschieben am Griff (Finger oder Maus) */
  M.querySelectorAll('[data-grip]').forEach(g=>g.onpointerdown=ev=>{ev.preventDefault();const row=g.closest('.rh-er'),list=row.parentNode;try{g.setPointerCapture(ev.pointerId)}catch{}row.classList.add('drag');
   g.onpointermove=m=>{let before=null;for(const o of rows()){if(o===row)continue;const bx=o.getBoundingClientRect();if(m.clientY<bx.top+bx.height/2){before=o;break}}const ref=before||list.querySelector('[data-add]');if(ref&&ref!==row&&row.nextSibling!==ref)list.insertBefore(row,ref)};
   g.onpointerup=g.onpointercancel=()=>{g.onpointermove=g.onpointerup=g.onpointercancel=null;row.classList.remove('drag');const x=e();x.order=rows().map(o=>o.dataset.k);save(x);draw()}})}
 /* 11.63: eine Reihe mit allen Änderungen als Datei (auch für „Inhalte organisieren“) */async function reiheFile(r){const b=B();const E=eff(r).map(x=>({k:x.k,t:x.t,...(x.u?{u:x.u}:{}),...(x.les!=null?{les:x.les}:{}),...(x.own?{own:1}:{}),...(x.hid?{hid:1}:{})}));const LE={};for(const x of E)if(x.les!=null){const v=edOf('les:'+x.les);if(Object.keys(v).length)LE[x.les]=v}return b.reiheExport(r.id,E,LE,{title:r.title,ch:r.ch||''})}
 /* 11.63: Zip ohne Komprimierung (Bilder sind schon komprimiert) – „Datei laden …“ liest sie wieder ein */
 function zipStore(files){const CT=zipStore.t||(zipStore.t=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0})),crc=u=>{let c=~0;for(let i=0;i<u.length;i++)c=CT[(c^u[i])&255]^(c>>>8);return ~c>>>0},te=new TextEncoder(),parts=[],cen=[];let off=0;/* 13.04: echtes Datum statt 1980 (Finder) */const N=new Date(),dt=((N.getFullYear()-1980)<<9)|((N.getMonth()+1)<<5)|N.getDate(),tm=(N.getHours()<<11)|(N.getMinutes()<<5)|(N.getSeconds()>>1);
  for(const f of files){const nm=te.encode(f.name),d=f.data,c=crc(d),h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(10,tm,true);h.setUint16(12,dt,true);h.setUint32(14,c,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);parts.push(h,nm,d);
   const z=new DataView(new ArrayBuffer(46));z.setUint32(0,0x02014b50,true);z.setUint16(4,20,true);z.setUint16(6,20,true);z.setUint16(8,0x0800,true);z.setUint16(12,tm,true);z.setUint16(14,dt,true);z.setUint32(16,c,true);z.setUint32(20,d.length,true);z.setUint32(24,d.length,true);z.setUint16(28,nm.length,true);z.setUint32(42,off,true);cen.push(z,nm);off+=30+nm.length+d.length}
  const cs=cen.reduce((a,x)=>a+x.byteLength,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);return new Blob([...parts,...cen,e],{type:'application/zip'})}
 /* 12.32: Reihe als HTML – Finder-Vorschau und Browser zeigen die Einheiten, die App lädt die eingebettete .cmreihe */
 async function reiheHtml2(r){const f0=await reiheFile(r),text=await f0.text();if(!window.cmWrapHtml)return f0;let d=null;try{d=JSON.parse(text)}catch{}
  const E=eff(r).filter(x=>!x.hid),U=d?.units||{},nU=E.filter(x=>x.u).length;
  const html=cmWrapHtml({kind:'Reihe',title:(r.lab?r.lab+' · ':'')+r.title,sub:[SUBJ[r.subject]||r.subject,r.jg?'Jahrgang '+r.jg:'',r.ch||''].filter(Boolean).join(' · '),chips:[E.length+' Einträge',...(nU?[nU+' Lerneinheiten']:[])],
   items:E.map(x=>{const u=x.u&&U[x.u],n=u?.def?.steps?.filter(s=>s&&s.type!=='pant').length;return [x.t||u?.title||x.u||'',x.u?(n?n+' Stationen':'Lerneinheit'):x.les!=null?'Lektion':'']}),
   note:'Diese Datei in den Classroom-Manager laden: Unterricht → Laden-Symbol. Die Lerneinheiten der Reihe stecken darin.',file:{name:f0.name,data:text}});
  return new File([html],f0.name.replace(/\.cmreihe$/,'.html'),{type:'text/html'})}
 async function reiheExp(r,el){const b=B();if(!b?.reiheExport)return;const t0=el?.textContent;try{if(el){el.disabled=true}
   const f=await reiheHtml2(r);
   if(touchDev()){const N=navigator;try{if(N.canShare&&N.canShare({files:[f]})){await N.share({files:[f],title:f.name});return}}catch(e){if(e&&e.name==='AbortError')return}}
   saveFile(f);alert('„'+f.name+'“ ('+Math.round(f.size/1024)+' KB) liegt jetzt in „Downloads“.')}catch(e){alert('Export nicht möglich: '+(e&&e.message||e))}finally{if(el){el.disabled=false}}}
 /* Reihe laden: Datei wählen → Dialog (neu / neuere Fassung) → speichern */
 async function reiheLoad(pre){const b=B();if(!b?.reiheParse)return;const fs=(pre||(window.cmHtmlToFiles?await cmHtmlToFiles(await pickFiles()):await pickFiles())).filter(Boolean);if(!fs.length)return;
  for(const f of fs){let P;try{P=await b.reiheParse(await f.text())}catch(e){alert('„'+f.name+'“: '+e.message);continue}if(!await reiheDialog(P))continue;
   try{await b.reiheSave(P.d,P.opt)}catch(e){alert('Laden nicht möglich: '+(e.name==='QuotaExceededError'?'Speicher voll.':e.message));return}
   sel='r:'+P.d.id}
  await render()}
 function reiheDialog(P){return new Promise(res=>{let dlg=document.getElementById('einRh');if(!dlg){dlg=document.createElement('dialog');dlg.id='einRh';document.body.append(dlg)}
  const d=P.d,old=P.old,mb=(P.size/1048576).toFixed(1).replace('.',','),un=k=>d.units&&d.units[k],subjOpt=Object.entries(SUBJ).filter(([k])=>k!=='latein');
  const lat=d.subject==='latein',pk=d.paket||{},chips=k=>[pk.vocab?.lessons?.[k]&&'Vokabeln',pk.grammar?.lessons?.[k]&&'Grammatik',(pk.texts||[]).filter(t=>new RegExp('^Lektion '+(k==='0'?'S\\b|^Salve':k+'\\b')).test(t.title||'')).length&&'Texte',(pk.units||[]).some(x=>x&&x.lps&&Object.values(x.lps).some(P=>String(P.lesson)===String(k)))&&'Lernpakete',(pk.units||[]).some(x=>x&&x.id==='ala-'+k)&&'Lateinarbeit'].filter(Boolean),
   sj=(old&&old.subject)||d.subject||cx.subject||'erdkunde',jg=+((old&&old.jg)||d.jg||cx.jg||7);
  dlg.innerHTML='<form method="dialog">'+(old?'<h2>Neuere Fassung gefunden</h2><p class="muted">„'+esc((d.lab?d.lab+' ':'')+d.title)+'“ ist schon geladen.'+(lat?' Vokabeln, Grammatik und Texte werden zusammengeführt – nichts wird gelöscht.':'')+'</p><ul class="rh-dl">'
    +P.neu.map(e=>'<li><span class="rh-chip new">neu</span>'+esc(e.t)+' – kommt ans Ende</li>').join('')+P.upd.map(id=>{const e=d.entries.find(x=>x.u===id);return '<li><span class="rh-chip">aktualisiert</span>'+esc(e?e.t:id)+'</li>'}).join('')
    +(!P.neu.length&&!P.upd.length?'<li>Keine Änderungen an den Stationen.</li>':'')+'<li class="m">Deine Namen, deine Reihenfolge und deine eigenen Einträge bleiben erhalten.</li></ul>'
   :'<h2>'+esc((d.lab?d.lab+' · ':'')+d.title)+'</h2><p class="muted">'+[d.src&&esc(d.src),d.entries.length+' Einträge',P.nUnits?'Schulbuchmaterial enthalten':'',mb+' MB'].filter(Boolean).join(' · ')+'</p>'
    +(lat?'':'<div class="rh-sel">Einordnen in: <select data-s>'+subjOpt.map(([k,v])=>'<option value="'+k+'"'+(k===sj?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select><select data-j>'+[5,6,7,8,9,10,11,12,13].map(n=>'<option value="'+n+'"'+(n===jg?' selected':'')+'>Jahrgang '+n+'</option>').join('')+'</select></div>')
    +'<ul class="rh-dl">'+d.entries.map((e,i)=>'<li'+(e.hid?' class="m"':'')+'><span class="rh-chip b">'+(e.les!=null?(e.les==='0'?'S':esc(e.les)):'+')+'</span>'+esc(e.t)+(e.hid?' (fakultativ, ausgeblendet)':'')+(e.les!=null?chips(e.les).map(c=>' <span class="rh-chip">'+c+'</span>').join(''):'')+(un(e.u)?' <span class="rh-chip">'+((un(e.u).def&&un(e.u).def.steps||[]).length)+' Stationen</span>':'')+'</li>').join('')+'</ul>')
   +'<div class="note">Enthält Schulbuchmaterial – nur für den eigenen Unterricht. Die Datei bleibt auf diesem Gerät, nichts wird hochgeladen.</div>'
   +'<div class="acts"><button type="button" data-x>Abbrechen</button><button type="submit" class="pri">'+(old?'Aktualisieren':'Reihe laden')+'</button></div></form>';
  const end=v=>{dlg.close();res(v)};dlg.querySelector('[data-x]').onclick=()=>end(false);dlg.oncancel=()=>res(false);
  dlg.querySelector('form').onsubmit=ev=>{ev.preventDefault();P.opt=old?{subject:old.subject,jg:old.jg}:lat?{subject:'latein',jg:0}:{subject:dlg.querySelector('[data-s]').value,jg:+dlg.querySelector('[data-j]').value};end(true)};dlg.showModal()})}
 async function reiheDel(){const b=B();if(!b?.reiheRemove)return;const f=find(sel);let r=f.r||null;
  if(!r){const tp=f.t||(f.u&&topics(cx.subject,cx.jg).find(x=>x.id==='u:'+f.u.u))||(f.l&&topics(cx.subject,cx.jg).find(x=>x.id==='l:'+f.l.k));if(tp)r=reiheOf(tp.rid)}
  const RS=reihenOf(cx.subject,cx.jg);if(!r&&RS.length===1)r=RS[0];if(!r){alert(RS.length?'Tippe zuerst links auf die Reihe, die du entfernen möchtest.':'Für diese Lerngruppe ist keine Reihe geladen.');return}
  if(!(await classroomConfirm('Reihe „'+(r.lab?r.lab+' ':'')+r.title+'“ von diesem Gerät entfernen?\n\nDie Ergebnisse und Noten der Schüler bleiben erhalten. Lädst du die Reihe wieder, sind sie sofort wieder zugeordnet.'+(r.subject==='latein'?'\n\nVokabeln, Grammatik und Übersetzungstexte bleiben in der App; entfernt werden die Gliederung, die Lernpakete und die Lateinarbeit dieser Sequenz.':''))))return;
  try{await b.reiheRemove(r.id)}catch(e){alert('Entfernen nicht möglich: '+e.message);return}sel=null;await render()}

 /* 11.68: Einheiten ohne Fach/Jahrgang – die App fragt nach (beim Laden und über „Zuordnen …“ im Export-Fenster) */
 function askAssign(us,o={}){return new Promise(res=>{const b=B();if(!b?.assignUnit||!us.length)return res(false);let dlg=document.getElementById('einAsk');if(!dlg){dlg=document.createElement('dialog');dlg.id='einAsk';document.body.append(dlg)}
  const subj=cx.subject&&cx.subject!=='latein'?cx.subject:'erdkunde',jg=+cx.jg||0,opt=(v,list)=>list.map(([k,t])=>'<option value="'+k+'"'+(String(k)===String(v)?' selected':'')+'>'+t+'</option>').join('');
  dlg.innerHTML='<form method="dialog"><h2>'+esc(o.title||'Wohin gehören diese Inhalte?')+'</h2><p class="muted">'+(o.text||'Bei '+(us.length===1?'einer Lerneinheit':us.length+' Lerneinheiten')+' steht nicht, zu welchem Fach und Jahrgang sie gehören. Bitte gib es an – du kannst es später unter „Inhalte organisieren …“ ändern.')+'</p>'
   +us.map((u,i)=>'<div class="ask-r"><b>'+esc(u.title)+'</b><select data-s="'+i+'">'+opt(u.subject&&u.subject!=='latein'?u.subject:subj,Object.entries(SUBJ).filter(([k])=>k!=='latein'))+'</select><select data-j="'+i+'">'+opt(+u.jg||jg,[[0,'Jahrgang …'],...[5,6,7,8,9,10,11,12,13].map(n=>[n,'Jahrgang '+n])])+'</select></div>').join('')
   +(o.title?'':'<p class="muted" style="font-size:.85rem">Vorbelegt mit Fach und Jahrgang der gerade geöffneten Klasse.</p>')+'<div class="acts"><button type="button" data-later>'+(o.title?'Abbrechen':'Später')+'</button><button type="submit" class="pri">Übernehmen</button></div></form>';
  dlg.querySelector('[data-later]').onclick=()=>{dlg.close();res(false)};
  dlg.querySelector('form').onsubmit=e=>{e.preventDefault();const miss=us.some((u,i)=>!+dlg.querySelector('[data-j="'+i+'"]').value);if(miss){alert('Bitte bei jeder Einheit einen Jahrgang wählen – oder „Später“.');return}
   us.forEach((u,i)=>b.assignUnit(u.u,dlg.querySelector('[data-s="'+i+'"]').value,+dlg.querySelector('[data-j="'+i+'"]').value));dlg.close();res(true)};
  dlg.showModal()})}
 /* Paket laden */
 function pickFiles(){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.multiple=true;i.hidden=true;document.body.append(i);i.onchange=()=>{res([...i.files]);i.remove()};i.addEventListener('cancel',()=>{res([]);i.remove()});i.click()})}
 async function loadPkg(){const b=B();if(!b)return;/* 12.25: auch HTML-Dateien von Lerneinheiten */let picked=await pickFiles();/* 13.44: ZIP aus „Unterrichtsmaterial sichern“ enthält HTML-Dateien – vorher entpacken, damit sie wie einzelne HTML-Dateien gelesen werden */if(b.unzip){const ex=[];for(const f of picked){if(/\.zip$/i.test(f.name)||f.type==='application/zip'){try{const es=await b.unzip(await f.arrayBuffer());if(es.some(x=>/\.html?$/i.test(x.name))){for(const x of es)ex.push(new File([x.text],x.name.split('/').pop(),{type:/\.html?$/i.test(x.name)?'text/html':'application/json'}));continue}}catch{}}ex.push(f)}picked=ex}
  const all=window.cmHtmlToFiles?await cmHtmlToFiles(picked):picked;if(!all.length)return;let r;
  /* 11.60: „Datei laden …“ für alles – Reihen bekommen ihren Dialog, der Rest wird zusammengeführt */
  const rs=[],fs=[];for(const f of all){let isR=/\.cmreihe$/i.test(f.name);if(!isR&&!/\.zip$/i.test(f.name)&&f.size<60e6){try{const head=await f.slice(0,400).text();isR=/"type"\s*:\s*"classroom-reihe"/.test(head)}catch{}}(isR?rs:fs).push(f)}
  if(rs.length){await reiheLoad(rs);if(!fs.length)return}
  try{r=await b.importFiles(fs)}catch(e){alert('Laden nicht möglich: '+(e.name==='QuotaExceededError'?'Speicher voll.':e.message));return}
  const parts=[r.reihe&&r.reihe+' Unterrichtsreihe'+(r.reihe>1?'n':''),r.toc&&'Inhaltsverzeichnis: '+r.toc+' Lektionen',r.voc&&'Vokabular +'+r.voc+' Wörter',r.wh&&'Wiederholung +'+r.wh+' Wörter',r.gr&&'Grammatik +'+r.gr+' Themen',r.tt&&r.tt+' Übersetzungs-Trainer-Text'+(r.tt>1?'e':''),r.le&&r.le+' Lerneinheit'+(r.le>1?'en':'')+' (Schulbuchmaterial)'].filter(Boolean);
  await (window.classroomAlert||alert)(parts.length?'Geladen und zusammengeführt:\n'+parts.join('\n')+(r.bad||r.unknown?'\n\n'+(r.bad+r.unknown)+' Datei(en) nicht erkannt.':''):'Nichts Neues gefunden'+(r.bad||r.unknown?' – '+(r.bad+r.unknown)+' Datei(en) nicht erkannt.':' – alles war schon vorhanden.'));render();try{const uk=(await B().units()).filter(u=>u.unk&&u.subject!=='latein');if(uk.length&&await askAssign(uk)){data=null;render()}}catch{}}
 /* ---------- 11.69: Fenster „Inhalte ordnen“ – Fach/Jahrgang zuordnen, Einheiten zwischen Reihen verschieben ---------- */
 let ordSel=null;
 const ordUnits=()=>(data?.units||[]).filter(u=>u.subject!=='latein');
 const ordReihen=()=>(data?.reihen||[]).filter(r=>r.subject!=='latein');
 /* 13.06: „Für Schüler verteilen …“ – ohne Musterlösungen, Lösungsblatt und Aufgabensammlung.
    Eine Einheit ist sofort offen; eine ganze Reihe liegt im Lernordner gesperrt, bis der Start-QR-Code die Einheit freischaltet. */
 const stuOk=u=>!!u&&/^einheit\.html\?/.test(u.file||'');
 const stuRUnits=r=>{const U=data?.units||[];return eff(r).filter(x=>x.u).map(x=>U.find(y=>y.u===x.u)).filter(stuOk)};
 const stuRName=r=>(r.lab?r.lab+' ':'')+r.title;
 const stuDay=d=>{const m=/^\d{4}-(\d\d)-(\d\d)$/.exec(d||'');return m?m[2]+'.'+m[1]+'.':''};
 async function stuDist(uid,rid){const b=B();if(!b?.stuFile){alert('Bitte die App neu laden.');return}
  const U=data?.units||[],u=uid?U.find(x=>x.u===uid):null;let r=rid?(data?.reihen||[]).find(x=>x.id===rid):null;
  if(u&&!r)r=(data?.reihen||[]).find(x=>eff(x).some(y=>y.u===uid))||null;const RU=r?stuRUnits(r):[];if(!u&&!RU.length){alert('In dieser Reihe ist keine Lerneinheit zum Verteilen.');return}
  const sid=x=>new URLSearchParams(x.file.split('?')[1]).get('u');
  let d=document.getElementById('einStu');if(!d){d=document.createElement('dialog');d.id='einStu';document.body.append(d)}
  const op=(v,h,t,f)=>'<label class="opt"><input type="radio" name="stu" value="'+v+'"><span><b>'+h+'</b><small>'+t+'</small><i data-f="'+v+'">'+f+'</i></span></label>';
  d.innerHTML='<form method="dialog"><h2>Für Schüler verteilen</h2><p class="muted">Die Datei enthält keine Musterlösungen, kein Lösungsblatt und keine Aufgabensammlung.</p>'
   +(RU.length?op('r','Ganze Reihe „'+esc(stuRName(r))+'“',RU.length+' Einheit'+(RU.length===1?'':'en')+' · im Lernordner zunächst <b>gesperrt</b> – dein Start-QR-Code schaltet jede Einheit in ihrer Stunde frei.','wird vorbereitet …'):'')
   +(u?op('u','Nur diese Einheit „'+esc(u.title)+'“','sofort offen – startet mit dem QR-Code oder im Lernordner.','wird vorbereitet …'):'')
   +'<div class="acts"><button type="button" data-no>Abbrechen</button><button type="submit" class="pri" disabled>Per AirDrop teilen …</button></div></form>';
  const F={},go=d.querySelector('.pri'),FI=ico=>'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>';
  const pick=()=>{const v=d.querySelector('input[name=stu]:checked')?.value;go.disabled=!v||!F[v];d.querySelectorAll('.opt').forEach(o=>o.classList.toggle('on',o.querySelector('input').checked))};
  d.querySelectorAll('input[name=stu]').forEach(i=>i.onchange=pick);const first=d.querySelector(u?'input[value=u]':'input[value=r]');first.checked=true;pick();
  d.querySelector('[data-no]').onclick=()=>d.close();
  d.querySelector('form').onsubmit=e=>{e.preventDefault();const v=d.querySelector('input[name=stu]:checked')?.value,f=F[v];if(!f)return;d.close();
   if(touchDev()){try{if(navigator.canShare?.({files:[f]})){navigator.share({files:[f],title:f.name}).catch(()=>{});return}}catch{}}
   saveFile(f);alert('„'+f.name+'“ liegt jetzt in „Downloads“. Im Finder: rechte Maustaste › Teilen › AirDrop.')};
  d.showModal();
  const set=(v,r0,err)=>{const el=d.querySelector('[data-f="'+v+'"]');if(!el)return;if(!r0){el.textContent=err||'nicht möglich';el.classList.add('err');return}F[v]=r0.file;el.innerHTML=FI()+' '+esc(r0.file.name)+(r0.stand?.d?' · Stand '+stuDay(r0.stand.d):'');pick()};
  if(u)b.stuFile([sid(u)],{title:u.title}).then(x=>set('u',x)).catch(e=>set('u',null,e&&e.message));
  if(RU.length)b.stuFile(RU.map(sid),{reihe:stuRName(r)}).then(x=>set('r',x)).catch(e=>set('r',null,e&&e.message))}
 const STUI='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M12 14V3M8 7l4-4 4 4"/><path d="M8 11H6v9h12v-9h-2"/></svg>';

 /* 13.16: ⋯-Menüs überall gleich – Symbol vor jedem Eintrag, Gruppen: Bearbeiten · Weitergeben · Status · Löschen */
 const ICX={tag:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/></svg>',
  eye:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  undo:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M9 14l-5-5 5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
  mv:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M3 7h6l2 2h10v10H3z"/><path d="M12 14h6M15 11l3 3-3 3"/></svg>'};
 const MIT=(a,ic,t,o={})=>'<button type="button" data-a="'+a+'"'+(o.del?' class="del"':'')+'>'+(ic||'')+'<span>'+t+'</span>'+(o.sub?'<i class="msub" aria-hidden="true">›</i>':'')+'</button>';
 const MSEP=g=>g.filter(x=>x.length).map(x=>x.join('')).join('<hr>');
 const unitMenuHtml=(u,o)=>MSEP([[MIT('ren',ICO.pen,'Umbenennen …'),MIT('mv',ICX.mv,'In Reihe verschieben',{sub:1}),MIT('fj',ICX.tag,'Fach / Jahrgang ändern …')],
  [MIT('pv',ICX.eye,'Vorschau'),...(stuOk(u)?[MIT('stu',STUI,'Für Schüler verteilen …')]:[]),MIT('exp',ICO.up,'Exportieren …')],o.done?[MIT('undone',ICX.undo,'Als nicht durchgeführt markieren …')]:[],[MIT('rm',ICO.del,'Aus der App entfernen …',{del:1})]]);
 const reiheMenuHtml=(r,o)=>MSEP([[MIT('ren',ICO.pen,'Reihe umbenennen …'),...(o.ch?[MIT('ch',ICX.tag,'Obertitel ändern',{sub:1})]:[]),...(o.jg?[MIT('jg',ICX.mv,'In anderen Jahrgang …')]:[])],
  [...(o.stu?[MIT('stu',STUI,'Für Schüler verteilen …')]:[]),MIT('exp',ICO.up,'Reihe exportieren …')],[MIT('rm',ICO.del,'Reihe entfernen …',{del:1})]]);
 const ordUsed=()=>{const m=new Map();for(const r of ordReihen())for(const x of eff(r))if(x.u&&!m.has(x.u))m.set(x.u,r.id);return m};
 /* 12.62: Fenster „Material“ – alle Fächer und Jahrgänge, auch ohne eigene Lerngruppe (Bibliothek · Tabelle) */
 let matS={s:null,j:null,f:'all',v:'b',q:'',tg:{}};
 const MT={le:['Lerneinheit','mt-le'],tt:['Übersetzungs-Trainer','mt-tt'],vo:['Vokabeln','mt-vo'],lp:['Lernpakete','mt-lp'],as:['Aufgabensammlung','mt-as']};
 function matCss(){if(document.getElementById('matCss'))return;const st=document.createElement('style');st.id='matCss';st.textContent='#einMat{border:0;border-radius:18px;padding:0;width:min(1300px,calc(100vw - 24px));height:calc(100dvh - 24px);max-height:none;max-width:none;box-shadow:0 20px 60px #0004;color:#24334b;overflow:hidden}#einMat[open]{display:flex;flex-direction:column}#einMat::backdrop{background:#1c2b4655}'
  +'#einMat .mt-hd{display:flex;align-items:center;gap:12px;padding:16px 22px;border-bottom:1px solid #e3e8f0}#einMat .mt-hd h2{margin:0;font-size:22px;flex:1}#einMat .mt-hd h2 small{display:block;font-size:14px;color:#66758a;font-weight:400;margin-top:2px}'
  +'#einMat .mt-q{width:min(300px,40vw);height:44px;box-sizing:border-box;border:1px solid #cfd8e6;border-radius:11px;padding:0 12px;font:inherit}#einMat .mt-x{width:44px;height:44px;border:1px solid #dde3ee;border-radius:11px;background:#fff;color:#2f5f9b;font-size:18px}'
  +'#einMat .mt-bd{flex:1;display:grid;grid-template-columns:260px minmax(0,1fr);min-height:0}#einMat .mt-sd{background:#f5f7fb;border-right:1px solid #e3e8f0;padding:12px 12px;overflow:auto}#einMat .mt-mn{padding:14px 22px 22px;overflow:auto}'
  +'#einMat .mt-sg{display:inline-flex;background:#e9eef6;border-radius:11px;padding:3px;margin-bottom:6px}#einMat .mt-sg button{border:0;background:none;border-radius:9px;min-height:36px;padding:0 13px;font:inherit;font-weight:600;color:#66758a}#einMat .mt-sg button.on{background:#fff;color:#2f5f9b;box-shadow:0 1px 3px #0001}'
  +'#einMat .mt-lb{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8a94a6;font-weight:700;margin:14px 6px 4px}#einMat .mt-si{display:flex;width:100%;justify-content:space-between;align-items:baseline;gap:8px;border:0;background:none;text-align:left;padding:8px 10px;border-radius:9px;font:inherit;font-size:15px;color:inherit;min-height:40px}#einMat .mt-si small{color:#8a94a6;font-size:12.5px;white-space:nowrap}#einMat .mt-si.on{background:#fff4e0;color:#a8480f;font-weight:650}'
  +'#einMat .mt-ch{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:6px}#einMat .mt-ch button{border:1px solid #d7deea;border-radius:99px;min-height:36px;padding:0 12px;font:inherit;font-size:13.5px;font-weight:600;color:#33476a;background:#fff}#einMat .mt-ch button.on{background:#2f5f9b;color:#fff;border-color:#2f5f9b}'
  +'#einMat .mt-tag{display:inline-flex;align-items:center;border-radius:99px;padding:1px 9px;font-size:12px;font-weight:650;margin-right:4px}.mt-le{background:#e3edfb;color:#24508f}.mt-tt{background:#fbeede;color:#a8480f}.mt-vo{background:#e6f5ec;color:#1e7a45}.mt-lp{background:#efe7fb;color:#6a3fb0}.mt-as{background:#fff4d6;color:#8a6200}'
  +'#einMat .mt-rh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:18px 0 8px}#einMat .mt-rh b{font-size:17px}#einMat .mt-rh span{color:#66758a;font-size:13.5px}'
  +'#einMat .mt-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:center;border:1px solid #e3e8f0;border-radius:12px;padding:10px 14px;margin-bottom:6px;background:#fff}#einMat .mt-row .t{font-weight:600}#einMat .mt-row .m{color:#66758a;font-size:13px;margin-top:3px}'
  +'#einMat .mt-st{font-size:12.5px;color:#66758a;white-space:nowrap;text-align:right}#einMat .mt-st b{color:#1e7a45}#einMat .mt-bt{display:flex;gap:6px}#einMat .mt-bt button{min-height:38px;border-radius:10px;padding:0 12px;font:inherit;font-weight:600;border:1px solid #cfd8e6;background:#fff;color:#2f5f9b}#einMat .mt-bt button.pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff}'
  +'#einMat table{border-collapse:collapse;width:100%;font-size:14.5px}#einMat th{font-size:12px;text-align:left;color:#66758a;font-weight:700;padding:8px 10px;border-bottom:1px solid #e3e8f0;background:#f8fafd;position:sticky;top:-14px}#einMat td{padding:8px 10px;border-bottom:1px solid #eef1f6}#einMat td.c,#einMat th.c{text-align:center}#einMat tr.g td{background:#f5f7fb;font-weight:700;font-size:13px;color:#33476a}#einMat .mt-n{display:inline-grid;place-items:center;min-width:32px;height:26px;border-radius:8px;font-weight:700;font-size:12.5px;border:0;cursor:pointer;font-family:inherit}#einMat .mt-d{color:#c3cad6}#einMat tr[data-go]{cursor:pointer}#einMat tr[data-go]:hover td{background:#f8fafd}'
  +'#einMat tr.mt-used td{background:#eef8f1}#einMat tr.mt-used td:first-child{box-shadow:inset 4px 0 0 #2e9d5b;font-weight:650}#einMat .mt-row.mt-used{background:#eef8f1;border-color:#bfe3cc;box-shadow:inset 4px 0 0 #2e9d5b}#einMat .mt-ps{display:inline-flex;flex-wrap:wrap;gap:5px}#einMat .mt-p{display:inline-flex;align-items:center;border-radius:99px;padding:2px 9px;background:#e6f5ec;color:#1e7a45;font-weight:700;font-size:12.5px;white-space:nowrap}#einMat tr.mt-used .mt-p{background:#fff}#einMat .mt-pm{background:#eef1f6;color:#66758a}#einMat .mt-no{color:#c3cad6}'+'#einMat .mt-me{margin:0 0 10px;padding:9px 11px;border-radius:11px;background:#fff;border:1px solid #dce3ef;font-size:12.5px;color:#66758a}#einMat .mt-me b{display:block;font-size:15px;color:#24334b;margin:2px 0}#einMat .mt-me small{font-size:12px}#einMat .mt-lo{display:block;width:100%;margin-top:16px;min-height:42px;border-radius:11px;border:1px solid #cfd8e6;background:#fff;color:#2f5f9b;font:inherit;font-weight:600;font-size:14px}'+'#einMat .mt-sg .mt-sgi{display:inline-grid;place-items:center;padding:0 10px}#einMat .mt-sg .mt-sgi.on{color:#c2410c}#einMat .mt-cls{display:inline-flex;border-radius:7px;padding:1px 7px;background:#e3edfb;color:#24508f;font-weight:700;font-size:12px;margin-right:4px}#einMat .mt-lz{border-color:#f3cfa9;box-shadow:inset 4px 0 0 #e8790c}#einMat .mt-lz0{background:#fafbfd}'+'#einMat .mt-tgl{cursor:pointer}#einMat .mt-rh.mt-tgl{align-items:center;padding:6px 8px;margin-left:-8px;border-radius:10px}#einMat .mt-rh.mt-tgl:hover,#einMat tr.mt-tgl:hover td{background:#eef2f8!important}#einMat .mt-rh>svg,#einMat .mt-th>svg{color:#2f5f9b}#einMat .mt-th{display:flex;align-items:center;gap:8px}#einMat .mt-cn{margin-left:auto;color:#8a94a6;font-weight:600;font-size:12.5px}#einMat .mt-bm{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:1px 9px;background:#fff1e3;color:#c2410c;font-size:12px;font-weight:700}'+'#einMat .mt-e{color:#66758a;padding:20px 4px}@media (max-width:760px){#einMat .mt-bd{grid-template-columns:1fr}#einMat .mt-sd{max-height:30vh}#einMat .mt-row{grid-template-columns:1fr}#einMat .mt-st{text-align:left}}';document.head.append(st)}
 const matRJg=r=>{const C={};for(const e of r.entries||[])if(e.les!=null){const j=lesJg(e.les);if(j)C[j]=(C[j]||0)+1}const k=Object.keys(C).sort((a,b)=>C[b]-C[a]||a-b)[0];return k?+k:(+r.jg||'')};
 const matJgs=s=>matJgs0(s).filter(j=>matGroups(s,j).some(g=>g.it.length));
 const matJgs0=s=>{const J=new Set();for(const r of data.reihen||[])if(r.subject===s){const j=matRJg(r);if(j)J.add(+j)}for(const u of data.units||[])if(u.subject===s&&!u.unk&&u.jg&&!(s==='latein'&&u.lesson!=null))J.add(+u.jg);if(s==='latein')for(const l of data.lessons||[])if(l.jg&&(l.tt?.length||l.nV||l.nW||data.units.some(u=>u.subject==='latein'&&String(u.lesson)===l.k)))J.add(+l.jg);return [...J].sort((a,b)=>a-b)};
 function matLes(l){const k=l.k,lp=data.units.filter(u=>u.subject==='latein'&&String(u.lesson)===k),c={le:0,tt:(l.tt||[]).filter(x=>!x.u).length,vo:(l.nV||l.nW)?1:0,lp:lp.length,as:0};return {id:'l:'+k,t:lname(l),m:[l.toc?.text?'Lektionstext „'+l.toc.text+'“':'',(l.tt||[]).length?(l.tt.length+' Übersetzungs-Trainer'):''].filter(Boolean).join(' · '),c,ids:['pw-'+k,'pv-'+k,...(l.tt||[]).map((_,i)=>'pt-'+k+(i?'.'+(i+1):'')),...lp.map(u=>u.u)],look:null}}
 function matUnit(u){let tt=0;const ids=[u.u];for(const l of data.lessons||[])(l.tt||[]).forEach((x,i)=>{if(x.u&&x.u===u.u){tt++;ids.push('pt-'+l.k+(i?'.'+(i+1):''))}});return {id:'u:'+u.u,t:u.title,m:u.gl?u.gl.n+' Stationen · ca. '+u.gl.min+' Min.':(u.sub||''),c:{le:1,tt,vo:0,lp:0,as:u.vt?1:0},ids,look:u.u}}
 function matGroups(s,j){const out=[],used=new Set();let RS=reihenOf(s,j).filter(r=>s!=='latein'||+matRJg(r)===+j)/* jede Reihe nur in ihrem Jahrgang (Mehrheit der Lektionen) */;if(s==='latein'){const pon=r=>(r.entries||[]).some(e=>e.les!=null)?0:1;RS=RS.map((r,i)=>[r,i]).sort((x,y)=>pon(x[0])-pon(y[0])||x[1]-y[1]).map(x=>x[0])}
  for(const r of RS){const it=[];for(const e of eff(r)){if(e.hid)continue;if(e.les!=null){const l=data.lessons.find(x=>x.k===String(e.les));if(l&&!used.has('l:'+l.k)){used.add('l:'+l.k);it.push(matLes(l))}}else if(e.u){const u=data.units.find(x=>x.u===e.u);if(u&&!used.has('u:'+u.u)){used.add('u:'+u.u);it.push(matUnit(u))}}}out.push({t:rName(r),sub:[s==='latein'&&!(r.entries||[]).some(e=>e.les!=null)?'Lektüre':'',r.src||''].filter(Boolean).join(' · '),it})}
  if(s==='latein'){const inAny=new Set((data.reihen||[]).filter(r=>r.subject==='latein').flatMap(r=>eff(r).filter(e=>e.les!=null).map(e=>String(e.les)))),fl=(data.lessons||[]).filter(l=>l.jg===j&&!used.has('l:'+l.k)&&!inAny.has(l.k)).map(matLes).filter(x=>Object.values(x.c).some(Boolean));if(fl.length)out.push({t:'Weitere Lektionen',sub:'',it:fl})}
  const fu=(data.units||[]).filter(u=>u.subject===s&&+u.jg===+j&&!u.unk&&!(s==='latein'&&u.lesson!=null)&&!used.has('u:'+u.u)).map(matUnit);if(fu.length)out.push({t:'Einzelne Einheiten',sub:'',it:fu});return out}
 function matUse(){let U=[];try{U=B()?.usage?.()||[]}catch{}const M=new Map();for(const x of U){const a=M.get(x.u)||[];a.push(x);M.set(x.u,a)}return M}
 const matDate=t=>{try{const d=new Date(t);return Date.now()-t<6*864e5?d.toLocaleDateString('de-DE',{weekday:'short'}):d.toLocaleDateString('de-DE',{day:'numeric',month:'short'})}catch{return ''}};
 /* 12.66: eine grüne Pille je Klasse, die das Material schon benutzt hat (neueste zuerst) */
 function matCl(it,M){const C=new Map();for(const id of it.ids)for(const x of M.get(id)||[]){const o=C.get(x.k);if(!o||x.last>o.last)C.set(x.k,x)}return [...C.values()].sort((a,b)=>b.last-a.last)}
 function matSt(it,M){const L=matCl(it,M);if(!L.length)return '';/* 13.53: ohne Einsatz kein Strich */const dd=t=>{try{return new Date(t).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}catch{return ''}};return '<span class="mt-ps">'+L.slice(0,3).map(x=>'<span class="mt-p" title="'+esc(x.lab)+' · '+esc(dd(x.last))+(x.n?' · '+x.n+' Abgaben':'')+'">✓ '+esc(x.lab)+' '+esc(dd(x.last))+'</span>').join('')+(L.length>3?'<span class="mt-p mt-pm">+'+(L.length-3)+'</span>':'')+'</span>'}
 const matTags=c=>Object.keys(MT).filter(k=>c[k]).map(k=>{const n=c[k];const t=k==='le'?(n>1?n+' Lerneinheiten':'Lerneinheit'):k==='tt'?(n>1?n+' Übersetzungs-Trainer':'Übersetzungs-Trainer'):k==='lp'?n+(n>1?' Lernpakete':' Lernpaket'):MT[k][0];return '<span class="mt-tag '+MT[k][1]+'">'+t+'</span>'}).join('');
 /* 12.67: Lesezeichen-Ansicht – eigene Lerngruppen mit ihrem Lesezeichen */
 function matMine(){let C=[];try{C=B()?.classes?.()||[]}catch{}const ST=rd(STAND)||{};return C.filter(c=>SUBJ[c.s]).map(c=>{const key=c.s+'::'+c.id,id=ST[key]||null,jg=jgOf(c.label);let it=null,gt='';if(id)for(const j of matJgs(c.s)){for(const g of matGroups(c.s,j)){const x=g.it.find(y=>y.id===id);if(x){it=x;gt=g.t;break}}if(it)break}
  if(id&&!it){const f=id.startsWith('l:')?data.lessons.find(l=>'l:'+l.k===id):id.startsWith('u:')?data.units.find(u=>'u:'+u.u===id):null;if(f)it={id,t:f.label?lname(f):f.title,m:'',c:{},ids:[id.slice(2)]}}
  return {...c,key,id,jg,it,gt,sh:c.label.replace(/^Klasse\s+/i,'')}}).filter(c=>c.jg).sort((a,b)=>String(SUBJ[a.s]).localeCompare(String(SUBJ[b.s]))||a.jg-b.jg||a.sh.localeCompare(b.sh,'de',{numeric:true}))}
 function matMineSide(MC){const G=new Map();for(const c of MC){const k=c.s+'|'+c.jg;if(!G.has(k))G.set(k,{s:c.s,j:c.jg,cl:[]});G.get(k).cl.push(c)}const by={};for(const g of G.values())(by[g.s]??=[]).push(g);
  return '<button type="button" class="mt-si'+(!matS.lj?' on':'')+'" data-lj="" style="margin-top:8px"><span>Alle aktuellen Stunden</span><small>'+MC.filter(c=>c.id).length+'</small></button>'+Object.keys(by).map(s=>'<div class="mt-lb">'+esc(SUBJ[s])+'</div>'+by[s].map(g=>'<button type="button" class="mt-si'+(matS.lj===s+'|'+g.j?' on':'')+'" data-lj="'+esc(s+'|'+g.j)+'"><span>Jahrgang '+g.j+'</span><small>'+esc(g.cl.map(c=>c.sh).join(' · '))+'</small></button>').join('')).join('')}
 function matMineMain(MC,M){const L=MC.filter(c=>!matS.lj||matS.lj===c.s+'|'+c.jg);if(!L.length)return '<p class="mt-e">Keine Lerngruppen gefunden.</p>';let h='',ls='';
  for(const c of L){if(!c.it)continue;if(c.s!==ls){ls=c.s;h+='<div class="mt-rh"><b>'+esc(SUBJ[c.s])+'</b></div>'}
   h+=c.it?'<div class="mt-row mt-lz"><div><div class="m" style="margin:0 0 3px"><span class="mt-cls">'+esc(c.sh)+'</span> Jahrgang '+c.jg+(c.gt?' · '+esc(c.gt):'')+'</div><div class="t"><span class="mt-bm" style="margin-right:6px">'+BMIs+'</span>'+esc(c.it.t)+'</div>'+(c.it.m?'<div class="m">'+esc(c.it.m)+'</div>':'')+'</div><div class="mt-st">'+matSt(c.it,M)+'</div><div class="mt-bt"><button type="button" class="pri" data-lzgo="'+esc(c.s+'|'+c.id+'|'+c.it.id)+'">Öffnen ›</button></div></div>'
    :''}
  const no=L.filter(c=>!c.it);if(no.length)h+='<p class="mt-e" style="padding:14px 2px">Noch ohne Lesezeichen: '+no.map(c=>'<span class="mt-cls" title="'+esc(SUBJ[c.s])+'">'+esc(c.sh)+'</span>').join(' ')+'<br><span style="font-size:13px">Lesezeichen setzt du in einer Stunde mit dem Lesezeichen-Knopf oben rechts.</span></p>';
  return h}
 const BMIs='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
 function openMat(){try{top()?.navigationSetOpen?.(false)}catch{}matCss();let d=document.getElementById('einMat');if(!d){d=document.createElement('dialog');d.id='einMat';document.body.append(d)}const SS=Object.keys(SUBJ).filter(s=>matJgs(s).length);/* 12.74: beim Öffnen immer Fach und Jahrgang der Klasse aus der Leiste */if(!d.open){matS.s=null;matS.j=null;matS.q=''}if(!matS.s||!SS.includes(matS.s)){matS.s=SS.includes(cx.subject)?cx.subject:SS[0];matS.j=null}/* 12.74: nur noch Bibliothek, ohne Filter-Pillen; „Alle Jahrgänge“ statt Tabelle */matS.v='b';matS.f='all';if(matS.j!=='all'&&(!matS.j||!matJgs(matS.s).includes(+matS.j)))matS.j=matJgs(matS.s).includes(+cx.jg)?+cx.jg:matJgs(matS.s)[0];
  const Q=matS.q.trim().toLowerCase();/* 12.65: nur die Material-Arten zeigen, die es hier gibt (Erdkunde: keine Vokabeln, keine Trainer) */
  const K=(()=>{const A=[];if(Q){for(const s of SS)for(const j of matJgs(s))A.push(...matGroups(s,j))}else for(const j of (matS.j==='all'?matJgs(matS.s):[matS.j]))A.push(...matGroups(matS.s,j));return Object.keys(MT).filter(k=>A.some(g=>g.it.some(it=>it.c[k])))})();if(matS.f!=='all'&&!K.includes(matS.f))matS.f='all';
  const M=matUse(),fOk=it=>matS.f==='all'||it.c[matS.f],qOk=it=>!Q||norm(it.t+' '+it.m).includes(norm(Q));
  const BMI0='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
  /* 12.67: „Lesezeichen“ – nur die eigenen Jahrgänge und die aktuelle Stunde jeder Lerngruppe */
  if(matS.v==='l')matS.v='b';/* 12.71: Lesezeichen stehen jetzt oben in der Leiste */const LZ=false,MC=[];
  const side=(cx.key?'<div class="mt-me">Deine Klasse<b>'+esc(cx.short||'')+' · '+esc(SUBJ[cx.subject]||cx.subject||'')+(cx.jg?' · Jg. '+cx.jg:'')+'</b><small>Klasse wechselst du oben in der Leiste.</small></div>':'')+(LZ?matMineSide(MC):SS.map(s=>'<div class="mt-lb">'+esc(SUBJ[s])+'</div>'+matJgs(s).map(j=>{const lg=s==='latein'?latGroups().find(g=>g.j===j):null,nr=reihenOf(s,j).length,lk=s==='latein'&&reihenOf(s,j).some(r=>!(r.entries||[]).some(e=>e.les!=null));return '<button type="button" class="mt-si'+(!Q&&matS.s===s&&+matS.j===j?' on':'')+'" data-s="'+s+'" data-j="'+j+'"><span>Jahrgang '+j+'</span><small>'+esc(lg?lg.lab+(lk?' · Lektüre':''):nr+(nr===1?' Reihe':' Reihen'))+'</small></button>'}).join('')+(matJgs(s).length>1?'<button type="button" class="mt-si mt-all'+(!Q&&matS.s===s&&matS.j==='all'?' on':'')+'" data-s="'+s+'" data-j="all"><span>Alle Jahrgänge</span><small>Überblick</small></button>':'')).join(''));
  const chips=true?'':'<div class="mt-ch"><button type="button" data-f="all" class="'+(matS.f==='all'?'on':'')+'">Alles</button>'+K.map(k=>'<button type="button" data-f="'+k+'" class="'+(matS.f===k?'on':'')+'"><span class="mt-tag '+MT[k][1]+'" style="margin:0">'+(k==='lp'?'Lernpaket':MT[k][0])+'</span></button>').join('')+'</div>';
  const row=it=>'<div class="mt-row'+(matCl(it,M).length?' mt-used':'')+'"><div><div class="t">'+esc(it.t)+'</div><div class="m">'+matTags(it.c)+(it.m?' '+esc(it.m):'')+'</div></div><div class="mt-st">'+matSt(it,M)+'</div><div class="mt-bt">'+(it.look?'<button type="button" data-look="'+esc(it.look)+'">Ansehen</button>':'')+'<button type="button" class="pri" data-go="'+esc(it.id)+'">Öffnen ›</button></div></div>';
  let G;if(Q){G=[];for(const s of SS)for(const j of matJgs(s))for(const g of matGroups(s,j)){const it=g.it.filter(x=>fOk(x)&&qOk(x));if(it.length)G.push({t:g.t,sub:SUBJ[s]+' · Jg. '+j+(g.sub?' · '+g.sub:''),it})}}
  else if(matS.v==='t'){G=[];for(const j of matJgs(matS.s))for(const g of matGroups(matS.s,j)){const it=g.it.filter(fOk);if(it.length)G.push({t:g.t,sub:'Jahrgang '+j+(g.sub?' · '+g.sub:''),it,j})}}
  else G=(matS.j==='all'?matJgs(matS.s):[matS.j]).flatMap(j=>matGroups(matS.s,j).map(g=>({...g,j,sub:matS.j==='all'?'Jahrgang '+j+(g.sub?' · '+g.sub:''):g.sub,it:g.it.filter(fOk)}))).filter(g=>g.it.length);
  /* 12.67: Reihen ein- und ausklappbar – zu Beginn zu, außer eine Stunde darin trägt ein Lesezeichen (dort ist man gerade); beim Suchen alles offen */
  const STS=new Set(Object.values(rd(STAND)||{})),gk=g=>matS.s+'|'+g.j+'|'+g.t;matS.tg??={};for(const g of G){g.bm=g.it.some(it=>STS.has(it.id));const v=matS.tg[gk(g)];g.op=!!Q||(v?v==='o':g.bm);g.key=gk(g)}
  const CHV=op=>'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none;transition:transform .15s;transform:rotate('+(op?90:0)+'deg)"><path d="M9 6l6 6-6 6"/></svg>',BMI='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
  const n=v=>v?'<span class="mt-n MTC">'+(v===true?'✓':v)+'</span>':'<span class="mt-d">–</span>',cell=(k,v)=>'<td class="c">'+n(v).replace('MTC',MT[k][1])+'</td>';
  const main=LZ?matMineMain(MC,M):Q||matS.v==='b'?chips+(G.length?G.map(g=>'<div class="mt-rh mt-tgl" data-tgk="'+esc(g.key)+'" data-op="'+(g.op?1:0)+'" role="button" aria-expanded="'+g.op+'">'+CHV(g.op)+'<b>'+esc(g.t)+'</b>'+(g.bm?'<span class="mt-bm">'+BMI+'aktuell</span>':'')+'<span>'+esc(g.sub||'')+(g.sub?' · ':'')+g.it.length+(g.it.length===1?' Eintrag':' Einträge')+'</span></div>'+(g.op?g.it.map(row).join(''):'')).join(''):'<p class="mt-e">'+(Q?'Nichts gefunden.':'Hier gibt es noch kein Material dieser Art.')+'</p>')
   :chips+'<table><tr><th>'+esc(SUBJ[matS.s])+' · Reihe / Lektion / Einheit</th>'+K.map(k=>'<th class="c">'+(k==='tt'?'Trainer':k==='as'?'Aufg.-Slg.':MT[k][0])+'</th>').join('')+'<th>zuletzt benutzt</th></tr>'+(()=>{let h='',lj=null;for(const g of G){if(g.j!==lj){lj=g.j;h+='<tr class="g"><td colspan="'+(K.length+2)+'">Jahrgang '+g.j+'</td></tr>'}h+='<tr class="g mt-tgl" data-tgk="'+esc(g.key)+'" data-op="'+(g.op?1:0)+'" aria-expanded="'+g.op+'"><td colspan="'+(K.length+2)+'" style="background:#fbfcfe;font-weight:650"><span class="mt-th">'+CHV(g.op)+esc(g.t)+(g.sub&&!/^Jahrgang \d+$/.test(g.sub)?' <span style="font-weight:400;color:#8a94a6">'+esc(g.sub.replace(/^Jahrgang \d+ · /,''))+'</span>':'')+(g.bm?'<span class="mt-bm">'+BMI+'aktuell</span>':'')+'<span class="mt-cn">'+g.it.length+'</span></span></td></tr>'+(g.op?g.it.map(it=>'<tr data-go="'+esc(it.id)+'" title="Öffnen"'+(matCl(it,M).length?' class="mt-used"':'')+'><td>'+esc(it.t)+(STS.has(it.id)?' <span class="mt-bm" title="Lesezeichen">'+BMI+'</span>':'')+'</td>'+K.map(k=>cell(k,k==='vo'?!!it.c.vo:it.c[k])).join('')+'<td class="mt-st" style="text-align:left">'+matSt(it,M)+'</td></tr>').join(''):'')}return h})()+'</table>'+(G.length?'':'<p class="mt-e">Hier gibt es noch kein Material dieser Art.</p>');
  d.innerHTML='<div class="mt-hd"><h2>Material<small>Bibliothek aller Fächer und Jahrgänge – zum Stöbern</small></h2><input type="search" class="mt-q" placeholder="Material suchen …" value="'+esc(matS.q)+'"><button type="button" class="mt-x" data-x aria-label="Schließen">✕</button></div><div class="mt-bd"><div class="mt-sd">'+side+(cx.subject?'<button type="button" class="mt-lo" data-loqr="'+esc(cx.subject)+'" title="QR-Code für die Schüler-App Lernordner zeigen">Lernordner-QR · '+esc(SUBJ[cx.subject]||cx.subject)+'</button>':'')+'</div><div class="mt-mn">'+main+'</div></div>';
  d.querySelector('[data-x]').onclick=()=>d.close();d.onclick=e=>{if(e.target===d)d.close()};
  d.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{matS.v=b.dataset.v;openMat()});d.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{matS.s=b.dataset.s;matS.j=b.dataset.j==='all'?'all':+b.dataset.j;matS.q='';openMat();d.querySelector('.mt-mn').scrollTop=0});d.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{matS.f=b.dataset.f;openMat()});
  const qi=d.querySelector('.mt-q');qi.oninput=()=>{matS.q=qi.value;const p=qi.selectionStart;openMat();const q2=d.querySelector('.mt-q');q2.focus();try{q2.setSelectionRange(p,p)}catch{}};
  d.querySelector('[data-loqr]')?.addEventListener('click',e=>{d.close();run('loqr',e.currentTarget.dataset.loqr,e.currentTarget)});
  d.querySelectorAll('[data-lj]').forEach(b=>b.onclick=()=>{matS.lj=b.dataset.lj||null;openMat()});
  d.querySelectorAll('[data-lzgo]').forEach(b=>b.onclick=async e=>{e.stopPropagation();const [s0,c0,...r0]=b.dataset.lzgo.split('|'),id=r0.join('|');d.close();if(s0+'::'+c0===cx.key){FOR.add(id);sel=id;sideOpen=false;draw();return}try{await top()?.classroomPins?.goEin({s:s0,c:c0,sel:id})}catch{FOR.add(id);sel=id;draw()}});
  d.querySelectorAll('[data-tgk]').forEach(x=>x.onclick=()=>{matS.tg[x.dataset.tgk]=x.dataset.op==='1'?'c':'o';const sc=d.querySelector('.mt-mn').scrollTop;openMat();d.querySelector('.mt-mn').scrollTop=sc});
  d.querySelectorAll('[data-look]').forEach(b=>b.onclick=()=>run('pl',b.dataset.look,b));
  d.querySelectorAll('[data-go]').forEach(b=>b.onclick=async()=>{const id=b.dataset.go;d.close();
   /* 12.75: Material aus einem anderen Fach/Jahrgang – passende Klasse oben wählen, damit Leiste, Seitenmenü und Abgaben stimmen */
   const L=id.startsWith('l:')?data.lessons.find(x=>'l:'+x.k===id):null,U=id.startsWith('u:')?data.units.find(x=>'u:'+x.u===id):null,s0=L?'latein':U?U.subject:matS.s,j0=+(L?L.jg:U?U.jg:matS.j)||0;
   if(s0&&(s0!==cx.subject||(j0&&j0!==+cx.jg))){let C=[];try{C=(B()?.classes?.()||[]).filter(c=>c.s===s0&&(!j0||jgOf(c.label)===j0))}catch{}
    if(C.length){const ST=rd(STAND)||{},c=C.find(c=>ST[s0+'::'+c.id]===id)||C[0];try{await top().classroomPins.goEin({s:s0,c:c.id,sel:id});return}catch{}}}
   FOR.add(id);sel=id;sideOpen=false;draw()});
  /* 13.46: beim Öffnen nicht ins Suchfeld springen – sonst klappt am iPad sofort die Tastatur auf */if(!d.open){d.tabIndex=-1;d.showModal();try{d.querySelector('.mt-q')?.blur();d.focus({preventScroll:true})}catch{}}}
 function ordGroups(){const G=new Map(),add=(s,j)=>{const k=s+'|'+j;if(!G.has(k))G.set(k,{s,j:+j,n:0})};
  for(const r of ordReihen())if(+r.jg){add(r.subject,r.jg);G.get(r.subject+'|'+r.jg).n++}
  for(const u of ordUnits())if(!u.unk&&+u.jg)add(u.subject,u.jg);
  return [...G.values()].sort((a,b)=>String(SUBJ[a.s]||a.s).localeCompare(String(SUBJ[b.s]||b.s))||a.j-b.j)}
 /* Einheit verschieben: aus Reihe from (oder null) in Reihe to (oder null) vor den Eintrag before */
 function ordMove(uid,fromRid,fromKey,toRid,before){const clean=x=>{for(const k of ['names','hid','del','own','order','show'])if(x[k]&&(Array.isArray(x[k])?!x[k].length:!Object.keys(x[k]).length))delete x[k];return x};
  const u=ordUnits().find(y=>y.u===uid);if(!u)return;
  if(fromRid&&fromRid===toRid){const r=reiheOf(toRid),x=edOf(toRid),keys=eff(r).map(y=>y.k).filter(k=>k!==fromKey),i=before?keys.indexOf(before):-1;keys.splice(i<0?keys.length:i,0,fromKey);x.order=keys;edSet(toRid,clean(x));return}
  if(fromRid){const x=edOf(fromRid);x.own=x.own||[];x.del=x.del||[];if(x.own.some(o=>o.k===fromKey))x.own=x.own.filter(o=>o.k!==fromKey);else if(!x.del.includes(fromKey))x.del.push(fromKey);edSet(fromRid,clean(x))}
  if(toRid){const r=reiheOf(toRid),x=edOf(toRid);x.own=x.own||[];x.del=x.del||[];let k;const orig=(r.entries||[]).find(e=>e.u===uid);
   if(orig&&x.del.includes(orig.k)){x.del=x.del.filter(z=>z!==orig.k);k=orig.k}else{k='mv'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);x.own.push({k,t:u.title,u:uid})}
   if(x.hid)x.hid=x.hid.filter(z=>z!==k);edSet(toRid,clean(x));const y=edOf(toRid),keys=eff(r).map(e=>e.k).filter(z=>z!==k),i=before?keys.indexOf(before):-1;keys.splice(i<0?keys.length:i,0,k);y.order=keys;edSet(toRid,clean(y));
   if(u.unk||u.subject!==r.subject||+u.jg!==+r.jg)B()?.assignUnit(uid,r.subject,+r.jg)}}
 /* 11.70/11.72: Export einer Auswahl – Reihen als .cmreihe, einzelne Einheiten und Lektionen als .cmpaket, mehreres zusammen als Zip */
 function askParts(){return new Promise(res=>{let d=document.getElementById('einParts');if(!d){d=document.createElement('dialog');d.id='einParts';d.className='ein-ask2';document.body.append(d)}
  d.innerHTML='<form method="dialog"><h2>Was soll aus den Lektionen mit?</h2><div class="pp">'+[['voc','Vokabeln'],['wh','Wiederholung'],['gr','Grammatik'],['tt','Übersetzungs-Trainer'],['le','Lernpakete'],['toc','Inhaltsverzeichnis']].map(([k,t])=>'<label><input type="checkbox" data-p="'+k+'" checked> '+t+'</label>').join('')+'</div><div class="acts"><button type="button" data-no>Abbrechen</button><button type="submit" class="pri">Exportieren</button></div></form>';
  d.querySelector('[data-no]').onclick=()=>{d.close();res(null)};d.querySelector('form').onsubmit=e=>{e.preventDefault();const p=Object.fromEntries([...d.querySelectorAll('[data-p]')].map(x=>[x.dataset.p,x.checked]));d.close();res(p)};d.showModal()})}
 async function exportSel(sel,btn,o={}){const b=B();if(!b)return;const {rs,units,lessons}=sel;
  let parts={toc:true,voc:true,wh:true,gr:true,tt:true,le:true};if(lessons.length&&!o.all){const p=await askParts();if(!p)return;parts=p;parts.le=parts.le||!!units.length}
  const s={rs,lessons,units,parts},asc=x=>x.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue').replace(/ß/g,'ss').replace(/\s+/g,'-').replace(/[^A-Za-z0-9_+.-]/g,'');
  const pkname=()=>{const p=[];if(lessons.length){const ls=data.lessons.filter(l=>lessons.includes(l.k));p.push('Latein_'+ls[0].tag+(ls.length>1?'-'+ls.at(-1).tag:''))}if(units.length)p.push(units.length>2?units.length+'-Einheiten':units.map(u=>(data.units.find(x=>x.u===u)||{}).title||u).join('_'));return asc(p.join('_')||'Einheiten')+'.cmpaket'};
  const hasPk=lessons.length||units.length,day=new Date().toISOString().slice(0,10),name=o.all?'Unterrichtsmaterial_'+day+'.zip':rs.length&&(hasPk||rs.length>1)?'Inhalte_'+day+'.zip':null;
  const t0=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent='Wird exportiert …'}let file;
  /* 13.04: „Unterrichtsmaterial sichern“ – je Reihe, je Einheit und für die Latein-Lektionen eine eigene HTML-Datei mit sprechendem Namen, nach Fach in Ordnern; Finder-Vorschau zeigt den Inhalt, „Datei laden …“ liest sie wieder ein */
  if(o.all&&window.cmWrapHtml){try{const zf=[],used=new Set(),te=new TextEncoder(),fn=x=>String(x||'').replace(/\s*:\s*/g,' – ').replace(/[\/\\*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,120);
    const add=(dir,nm,txt)=>{let n=fn(dir)+'/'+fn(nm),i=2;const b0=n;while(used.has(n))n=b0+' ('+(i++)+')';used.add(n);zf.push({name:n+'.html',data:te.encode(txt)})};
    const jgp=j=>+j?'Jg '+(+j)+' · ':'',tok=t=>String(t||'').replace(/\{[A-Z]\}/g,'').replace(/\s+/g,' ').trim();
    for(const r of rs){const f=await reiheHtml2(r);add(SUBJ[r.subject]||r.subject||'Ohne Fach',jgp(r.jg)+rName(r)+' (Reihe)',await f.text())}
    for(const uid of units){const pk=await b.exportPkg({rs:[],lessons:[],units:[uid],parts},'');const U=pk?.units?.[0];if(!U)continue;const x=data.units.find(y=>y.u===uid)||{},M=U.def?.meta||{},sub=x.subject||M.subject||'',jg=x.jg||M.jg||0,ti=x.title||U.title||uid;
     const st=(U.def?.steps||[]).filter(z=>z&&z.type!=='pant'),mn=Math.round(st.reduce((a,z)=>a+(+z.min||0),0));pk.title=ti;
     add(SUBJ[sub]||sub||'Ohne Fach',jgp(jg)+ti,cmWrapHtml({kind:'Lerneinheit',title:ti,sub:[SUBJ[sub]||sub,+jg?'Jahrgang '+(+jg):'',M.unitSub&&!/Klasse/.test(M.unitSub)?M.unitSub:''].filter(Boolean).join(' · '),chips:[st.length+' Stationen',...(mn?['ca. '+mn+' Min.']:[])],items:st.map(z=>[z.t||'',tok(z.d)]),note:'Diese Datei in den Classroom-Manager laden: Unterricht → „Datei laden …“.',file:{name:asc(ti)+'.cmpaket',data:JSON.stringify(pk)}}))}
    if(lessons.length){const ls=data.lessons.filter(l=>lessons.includes(l.k)),pk=await b.exportPkg({rs:[],lessons,units:[],parts},'Latein-Lektionen');if(pk){const lab=(ls.length>1?'Lektionen ':'Lektion ')+ls[0].tag+(ls.length>1?'–'+ls.at(-1).tag:'');
     add('Latein',lab,cmWrapHtml({kind:'Latein-Lektionen',title:lab,sub:'Latein · Lektionen ohne Reihe',chips:[ls.length+' Lektionen'],items:ls.map(l=>[(l.tag||l.k)+(l.title?' · '+l.title:''),'']),note:'Diese Datei in den Classroom-Manager laden: Unterricht → „Datei laden …“.',file:{name:'Latein-Lektionen.cmpaket',data:JSON.stringify(pk)}}))}}
    if(!zf.length){alert('Es ist noch kein Unterrichtsmaterial geladen.');return}
    file=new File([zipStore(zf)],'Unterrichtsmaterial '+day+'.zip',{type:'application/zip'})}
   catch(e){alert('Export nicht möglich: '+(e&&e.message||e));return}finally{if(btn){btn.disabled=false;btn.textContent=t0}}
   try{if(navigator.canShare?.({files:[file]})&&matchMedia('(pointer:coarse)').matches){await navigator.share({files:[file],title:file.name});return file.name}}catch(err){if(err?.name==='AbortError')return}
   saveFile(file);return file.name}
  try{const pk=hasPk?await b.exportPkg(s,pkname().replace(/\.cmpaket$/,'')):null;
   if(!rs.length&&!o.all){if(!pk){alert('In der Auswahl ist nichts zum Exportieren.');return}file=new File([JSON.stringify(pk)],pkname(),{type:'application/json'})}
   else{const fs=[];for(const r of rs)fs.push(await reiheFile(r));if(fs.length===1&&!pk&&!o.all)file=fs[0];else{if(!fs.length&&!pk){alert('Es ist noch kein Unterrichtsmaterial geladen.');return}const used=new Set(),te=new TextEncoder(),zf=[];for(const f of fs){let nm=f.name,i=2;while(used.has(nm))nm=f.name.replace(/\.cmreihe$/,' ('+(i++)+').cmreihe');used.add(nm);zf.push({name:nm,data:new Uint8Array(await f.arrayBuffer())})}if(pk)zf.push({name:pkname(),data:te.encode(JSON.stringify(pk))});file=new File([zipStore(zf)],name,{type:'application/zip'})}}}
  catch(e){alert('Export nicht möglich: '+(e&&e.message||e));return}finally{if(btn){btn.disabled=false;btn.textContent=t0}}
  try{if(navigator.canShare?.({files:[file]})&&matchMedia('(pointer:coarse)').matches){await navigator.share({files:[file],title:file.name});return file.name}}catch(err){if(err?.name==='AbortError')return}
  saveFile(file);return file.name}
 /* 11.72: alles Unterrichtsmaterial – alle Reihen, Einheiten ohne Reihe und Latein-Lektionen ohne Reihe */
 function allSel(){const R=data?.reihen||[],inR=new Set(),lesR=new Set();for(const r of R)for(const x of eff(r)){if(x.u)inR.add(x.u);if(x.les!=null)lesR.add(String(x.les))}
  return {rs:R.slice(),units:(data?.units||[]).filter(u=>u.subject!=='latein'&&u.book&&!inR.has(u.u)).map(u=>u.u),lessons:(data?.lessons||[]).filter(l=>blocks(l)&&!lesR.has(l.k)).map(l=>l.k)}}
 window.classroomExportAllMaterial=async()=>{data=await load();if(!data)throw new Error('Die Bibliothek ist noch nicht bereit.');return exportSel(allSel(),null,{all:true})};
 /* ---------- 11.70: Fenster „Inhalte organisieren“ – ordnen (ziehen, Menü ⋯) und exportieren (Kästchen) in einem ---------- */
 let orgSel=null;const CHK={r:new Set(),u:new Set(),l:new Set()};
 const latGroups=()=>[5,6,7,8,9,10,11,12,13].map(jg=>{const ls=(data?.lessons||[]).filter(l=>l.jg===jg);return {s:'latein',j:jg,ls,lab:(ls[0]?.tag||'')+' – '+(ls.at(-1)?.tag||'')}}).filter(g=>g.ls.length);
 const rName=r=>(r.lab?r.lab+' ':'')+r.title;
 async function orgOpen(){const b=B();if(!b)return;data=await load();cx=ctx();let dlg=document.getElementById('einOrd');if(!dlg){dlg=document.createElement('dialog');dlg.id='einOrd';document.body.append(dlg);dlg.addEventListener('close',()=>{data=null;render()})}
  const keyOk=k=>k==='unk'||ordGroups().some(g=>g.s+'|'+g.j===k)||latGroups().some(g=>'latein|'+g.j===k);
  if(!orgSel||!keyOk(orgSel)){const c=cx.subject+'|'+(+cx.jg);orgSel=keyOk(c)?c:(ordGroups()[0]?ordGroups()[0].s+'|'+ordGroups()[0].j:latGroups()[0]?'latein|'+latGroups()[0].j:'unk')}
  for(const k of ['r','u','l'])CHK[k].clear();
  let q='',menu=null;
  const CB=(st,attr,dis)=>'<button type="button" class="od-cb'+(st===2?' y':st===1?' p':'')+'" '+attr+(dis?' disabled':'')+' role="checkbox" aria-checked="'+(st===2?'true':st===1?'mixed':'false')+'" aria-label="Für den Export auswählen"></button>';
  /* Einträge einer Reihe (für Kästchen): Einheiten und Lektionen mit Inhalt */
  const itemsOf=r=>eff(r).flatMap(x=>{if(x.u){const u=ordUnits().find(y=>y.u===x.u);return u&&u.book?[['u',x.u]]:[]}if(x.les!=null){const l=data.lessons.find(y=>y.k===String(x.les));return l&&blocks(l)?[['l',l.k]]:[]}return []});
  const isOn=(t,id)=>CHK[t].has(id)||ordReihen0().some(r=>CHK.r.has(r.id)&&itemsOf(r).some(([a,b])=>a===t&&b===id));
  const ordReihen0=()=>data?.reihen||[];
  const rState=r=>{if(CHK.r.has(r.id))return 2;const it=itemsOf(r);return it.some(([t,id])=>CHK[t].has(id))?1:0};
  function toggleItem(t,id){const r=ordReihen0().find(r=>CHK.r.has(r.id)&&itemsOf(r).some(([a,b])=>a===t&&b===id));if(r){CHK.r.delete(r.id);for(const [a,b] of itemsOf(r))if(!(a===t&&b===id))CHK[a].add(b);return}CHK[t].has(id)?CHK[t].delete(id):CHK[t].add(id)}
  function toggleReihe(r){if(CHK.r.has(r.id)){CHK.r.delete(r.id);return}CHK.r.add(r.id);for(const [a,b] of itemsOf(r))CHK[a].delete(b)}
  /* 11.72: Alles bzw. alles in einem Jahrgang auswählen */
  function grpSel(){if(!orgSel||orgSel==='unk')return null;const [s0,j0]=orgSel.split('|'),j=+j0;
   if(s0==='latein'){const all=new Set((data.reihen||[]).filter(r=>r.subject==='latein').flatMap(r=>eff(r).filter(x=>x.les!=null).map(x=>String(x.les))));return {rs:reihenOf('latein',j),u:[],l:data.lessons.filter(l=>l.jg===j&&blocks(l)&&!all.has(l.k)).map(l=>l.k)}}
   const used=ordUsed();return {rs:reihenOf(s0,j),u:ordUnits().filter(u=>!u.unk&&u.subject===s0&&+u.jg===j&&u.book&&!used.has(u.u)).map(u=>u.u),l:[]}}
  const selOn=g=>g&&(g.rs.length+g.u.length+g.l.length)>0&&g.rs.every(r=>CHK.r.has(r.id))&&g.u.every(id=>CHK.u.has(id))&&g.l.every(k=>CHK.l.has(k));
  const allG=()=>{const a=allSel();return {rs:a.rs,u:a.units,l:a.lessons}};
  function setSel(g,on){for(const r of g.rs){if(on){if(!CHK.r.has(r.id))toggleReihe(r)}else CHK.r.delete(r.id)}for(const id of g.u)on?CHK.u.add(id):CHK.u.delete(id);for(const k of g.l)on?CHK.l.add(k):CHK.l.delete(k)}
  /* 12.09: Einheiten umbenennen – in einer Reihe wie beim Stift der Reihe (names[k]), sonst geräteweit (_units) */
  const unitNm=(u,rid,k)=>(rid&&k&&(edOf(rid).names||{})[k])||u.title;
  const card=(u,rid,k,hid,extra)=>'<div class="od-c'+(isOn('u',u.u)?' sel':'')+(hid?' hid':'')+'" data-u="'+esc(u.u)+'" data-r="'+esc(rid||'')+'" data-k="'+esc(k||'')+'">'+CB(isOn('u',u.u)?2:0,'data-ck="u" data-id="'+esc(u.u)+'"',!u.book)+'<span class="od-g" data-grip title="Ziehen: in eine andere Reihe oder an eine andere Stelle">⠿</span><span class="od-t" title="Doppelklick: umbenennen">'+esc(unitNm(u,rid,k))+(hid?'<small>ausgeblendet</small>':'')+(u.book?'':'<small>kein Material geladen</small>')+(extra||'')+'</span><button type="button" class="od-m" data-menu aria-label="Aktionen für '+esc(u.title)+'">⋯</button></div>';
  const lrow=(l,k,hid)=>'<div class="od-c od-l'+(isOn('l',l.k)?' sel':'')+(hid?' hid':'')+'" data-k="'+esc(k||'')+'">'+CB(isOn('l',l.k)?2:0,'data-ck="l" data-id="'+esc(l.k)+'"',!blocks(l))+'<span class="od-t">'+esc(lname(l))+(blocks(l)?'':'<small>noch kein Inhalt geladen</small>')+'</span></div>';
  /* 13.15: Platzhalter ohne Material (z. B. „Stadtplanung – Beispiel Mobilität“) lassen sich über ⋯ aus der Reihe entfernen */
  const plain=(t,hid,k,rid)=>'<div class="od-c od-p'+(hid?' hid':'')+'" data-k="'+esc(k)+'"><span class="od-cb0"></span><span class="od-t">'+esc(t)+' <small style="display:inline">· kein Material geladen</small></span>'+(rid?'<button type="button" class="od-m" data-pmenu data-r="'+esc(rid)+'" data-k="'+esc(k)+'" data-t="'+esc(t)+'" aria-label="Aktionen für '+esc(t)+'">⋯</button>':'')+'</div>';
  const head=(st,attr,t,n,extra,menu,pre)=>'<div class="od-rh">'+(pre||'')+CB(st,attr,false)+'<b>'+t+'</b>'+(extra||'')+'<small>'+n+'</small>'+(menu||'')+'</div>';
  /* 13.41: Reihen einklappen (pro Gerät) */const FKEY='classroom-ord-fold-v1',fold=()=>rd(FKEY),isF=id=>!!fold()[id],setF=(ids,on)=>{const a=fold();for(const id of ids)on?a[id]=1:delete a[id];wr(FKEY,a)};
  const FOLDI=on=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(on?'M9 6l6 6-6 6':'M6 9l6 6 6-6')+'"/></svg>';
  const rpre=r=>'<button type="button" class="od-fold" data-fold="'+esc(r.id)+'" aria-label="'+(isF(r.id)?'Ausklappen':'Einklappen')+'" title="'+(isF(r.id)?'Ausklappen':'Einklappen')+'">'+FOLDI(isF(r.id))+'</button><span class="od-g" data-rgrip="'+esc(r.id)+'" title="Ziehen: Reihe an eine andere Stelle">⠿</span>';
  const changed=r=>Object.values(edOf(r.id)||{}).some(v=>v&&(Array.isArray(v)?v.length:typeof v==='object'?Object.keys(v).length:1));
  function body(){const G=ordGroups(),LG=latGroups(),UK=ordUnits().filter(u=>u.unk),used=ordUsed(),Q=q.trim().toLowerCase();
   const it=(k,t,s)=>'<button type="button" class="od-it'+(orgSel===k?' on':'')+'" data-g="'+k+'">'+t+'<small>'+s+'</small></button>';
   const side='<div class="od-sd">'+[...new Set(G.map(g=>g.s))].map(s=>'<h5>'+esc(SUBJ[s]||s)+'</h5>'+G.filter(g=>g.s===s).map(g=>it(g.s+'|'+g.j,'Jahrgang '+g.j,g.n?g.n+(g.n===1?' Reihe':' Reihen'):'–')).join('')).join('')
    +(LG.length?'<h5>Latein · Pontes</h5>'+LG.map(g=>it('latein|'+g.j,'Jahrgang '+g.j,esc(g.lab))).join(''):'')
    +'<h5>Weiteres</h5><button type="button" class="od-it od-un'+(orgSel==='unk'?' on':'')+'" data-g="unk">⚠ ohne Zuordnung'+(UK.length?'<span class="od-bdg">'+UK.length+'</span>':'<small>0</small>')+'</button></div>';
   const sel='<select class="od-msel" data-gsel aria-label="Fach und Jahrgang">'+G.map(g=>'<option value="'+g.s+'|'+g.j+'"'+(orgSel===g.s+'|'+g.j?' selected':'')+'>'+esc(SUBJ[g.s]||g.s)+' · Jahrgang '+g.j+'</option>').join('')+LG.map(g=>'<option value="latein|'+g.j+'"'+(orgSel==='latein|'+g.j?' selected':'')+'>Latein · Jahrgang '+g.j+'</option>').join('')+'<option value="unk"'+(orgSel==='unk'?' selected':'')+'>⚠ ohne Zuordnung ('+UK.length+')</option></select>';
   const hint='<p class="od-sub">Griff ⠿ ziehen = verschieben · Kästchen = für den Export auswählen · ⋯ = weitere Aktionen</p>';
   let main='';
   if(Q){const hits=ordUnits().filter(u=>u.title.toLowerCase().includes(Q));main='<h3>Suche: „'+esc(q)+'“</h3>'+hint+'<div class="od-card" data-col="-"><div class="od-list">'+(hits.length?hits.map(u=>{const rid=used.get(u.u),r=rid&&reiheOf(rid),k=r?eff(r).find(x=>x.u===u.u)?.k:'';return card(u,rid,k,false,'<small>'+(u.unk?'ohne Zuordnung':esc(SUBJ[u.subject]||u.subject)+' · Jg '+u.jg)+(r?' · '+esc(r.title):' · in keiner Reihe')+'</small>')}).join(''):'<p class="od-e">Keine Einheit gefunden.</p>')+'</div></div>'}
   else if(orgSel==='unk'){main='<h3>Ohne Zuordnung</h3>'+(UK.length?'<div class="od-ban"><b>'+UK.length+(UK.length===1?' Einheit hat':' Einheiten haben')+' noch kein Fach / keinen Jahrgang.</b><button type="button" class="od-btn" data-assign>Jetzt zuordnen</button></div>'+hint+'<div class="od-card" data-col="-"><div class="od-list">'+UK.map(u=>{const rid=used.get(u.u),r=rid&&reiheOf(rid);return card(u,rid,r?eff(r).find(x=>x.u===u.u)?.k:'')}).join('')+'</div></div>':'<p class="od-e">Alle Einheiten sind einem Fach und Jahrgang zugeordnet ✓</p>')}
   else if(orgSel.startsWith('latein|')){const jg=+orgSel.split('|')[1],RS=reihenOf('latein',jg).map((r,i)=>[r,i]).sort((x,y)=>((x[0].entries||[]).some(e=>e.les!=null)?0:1)-((y[0].entries||[]).some(e=>e.les!=null)?0:1)||x[1]-y[1]).map(x=>x[0]),inR=new Set(RS.flatMap(r=>eff(r).filter(x=>x.les!=null).map(x=>String(x.les)))),allR=new Set(ordReihen0().filter(r=>r.subject==='latein').flatMap(r=>eff(r).filter(x=>x.les!=null).map(x=>String(x.les)))),free=data.lessons.filter(l=>l.jg===jg&&!allR.has(l.k));
    main='<div class="od-h"><h3>Latein · Jahrgang '+jg+'</h3>'+(()=>{const g=grpSel(),on=selOn(g);return g&&(g.rs.length+g.u.length+g.l.length)?'<button type="button" class="od-btn" data-grpsel>'+(on?ICO.box+'Alle in Jahrgang '+(+orgSel.split('|')[1])+' abwählen':ICO.chk+'Alle in Jahrgang '+(+orgSel.split('|')[1]))+'</button>':''})()+'</div><p class="od-sub">Kästchen = für den Export auswählen · die Reihenfolge der Lernpakete änderst du in der Lektion</p>'
     +RS.map(r=>{if(!eff(r).some(x=>x.les!=null)){/* 12.57: Latein-Reihen aus Einheiten (z. B. Lektüre) wie in den anderen Fächern zeigen */const L=eff(r),n=L.filter(x=>x.u).length;return '<div class="od-card" data-col="'+esc(r.id)+'">'+head(rState(r),'data-cr="'+esc(r.id)+'"',esc(rName(r)),n+(n===1?' Einheit':' Einheiten'),changed(r)?'<i class="od-chg">geändert</i>':'','<button type="button" class="od-m" data-rmenu="'+esc(r.id)+'" aria-label="Aktionen für '+esc(rName(r))+'">⋯</button>')+'<div class="od-list">'+L.map(x=>{const u=x.u&&(data?.units||[]).find(y=>y.u===x.u);return u?card(u,r.id,x.k,x.hid,''):plain(x.t,x.hid,x.k,r.id)}).join('')+'<div class="od-end"></div></div></div>'}const L=eff(r).filter(x=>x.les!=null||!x.u);return '<div class="od-card">'+head(rState(r),'data-cr="'+esc(r.id)+'"',esc(rName(r)),L.filter(x=>x.les!=null).length+' Lektionen',changed(r)?'<i class="od-chg">geändert</i>':'','<button type="button" class="od-m" data-rmenu="'+esc(r.id)+'" aria-label="Aktionen für '+esc(rName(r))+'">⋯</button>')+'<div class="od-list">'+L.map(x=>{const l=x.les!=null&&data.lessons.find(y=>y.k===String(x.les));return l?lrow(l,x.k,x.hid):x.les!=null?'':plain(x.t,x.hid,x.k,r.id)}).join('')+'</div></div>'}).join('')
     +(free.length?'<div class="od-card od-free">'+head(free.filter(l=>blocks(l)).every(l=>CHK.l.has(l.k))&&free.some(l=>blocks(l))?2:free.some(l=>CHK.l.has(l.k))?1:0,'data-cfree="l"','Nicht in einer Reihe',free.length+' Lektionen')+'<div class="od-list">'+free.map(l=>lrow(l,'')).join('')+'</div></div>':'')}
   else{const [s,j]=orgSel.split('|'),RS=reihenOf(s,+j),free=ordUnits().filter(u=>!u.unk&&u.subject===s&&+u.jg===+j&&!used.has(u.u)).sort((a,b)=>a.title.localeCompare(b.title,'de',{numeric:true}));
    main=(UK.length?'<div class="od-ban"><b>'+UK.length+(UK.length===1?' Einheit hat':' Einheiten haben')+' noch kein Fach / keinen Jahrgang.</b><button type="button" class="od-btn" data-assign>Jetzt zuordnen</button></div>':'')
     +'<div class="od-h"><h3>'+esc(SUBJ[s]||s)+' · Jahrgang '+j+'</h3>'+(()=>{const g=grpSel(),on=selOn(g);return g&&(g.rs.length+g.u.length+g.l.length)?'<button type="button" class="od-btn" data-grpsel>'+(on?ICO.box+'Alle in Jahrgang '+(+orgSel.split('|')[1])+' abwählen':ICO.chk+'Alle in Jahrgang '+(+orgSel.split('|')[1]))+'</button>':''})()+'</div>'+hint
     +RS.map(r=>{const L=eff(r);return '<div class="od-card'+(isF(r.id)?' od-fd':'')+'" data-col="'+esc(r.id)+'" data-rc="'+esc(r.id)+'">'+head(rState(r),'data-cr="'+esc(r.id)+'"',esc(rName(r)),L.filter(x=>x.u).length+(L.filter(x=>x.u).length===1?' Einheit':' Einheiten'),changed(r)?'<i class="od-chg">geändert</i>':'','<button type="button" class="od-m" data-rmenu="'+esc(r.id)+'" aria-label="Aktionen für '+esc(rName(r))+'">⋯</button>',rpre(r))+'<div class="od-list">'+L.map(x=>{const u=x.u&&ordUnits().find(y=>y.u===x.u);return u?card(u,r.id,x.k,x.hid,(u.unk||+u.jg!==+r.jg||u.subject!==r.subject)?'<small class="od-w">'+(u.unk?'ohne Zuordnung':esc(SUBJ[u.subject]||u.subject)+' · Jg '+u.jg)+'</small>':''):plain(x.t,x.hid,x.k,r.id)}).join('')+'<div class="od-end"></div></div></div>'}).join('')
     +'<div class="od-card od-free" data-col="">'+head(free.filter(u=>u.book).length&&free.filter(u=>u.book).every(u=>CHK.u.has(u.u))?2:free.some(u=>CHK.u.has(u.u))?1:0,'data-cfree="u"','Nicht in einer Reihe',free.length+(free.length===1?' Einheit':' Einheiten'))+'<div class="od-list">'+free.map(u=>card(u,'','')).join('')+(free.length?'':'<p class="od-e">Hierher ziehen, um eine Einheit aus ihrer Reihe zu nehmen.</p>')+'<div class="od-end"></div></div></div>'}
   /* Leiste unten: erscheint erst bei Auswahl */
   const nR=CHK.r.size,nU=CHK.u.size,nL=CHK.l.size,parts=[];if(nR)parts.push(nR+(nR===1?' Reihe':' Reihen'));if(nU)parts.push(nU+(nU===1?' einzelne Einheit':' einzelne Einheiten'));if(nL)parts.push(nL+(nL===1?' Lektion':' Lektionen'));
   const names=[...[...CHK.r].map(id=>reiheOf(id)).filter(Boolean).map(rName),...[...CHK.u].map(id=>ordUnits().find(u=>u.u===id)?.title).filter(Boolean),...[...CHK.l].map(k=>{const l=data.lessons.find(x=>x.k===k);return l?l.tag:''}).filter(Boolean)];
   const bar=parts.length?'<div class="od-bar"><div class="od-sum"><b>'+(selOn(allG())?'Alles ausgewählt · '+parts.join(' · '):parts.join(' · ')+' ausgewählt')+'</b><span>'+esc(names.slice(0,4).join(' · ')+(names.length>4?' · …':''))+'</span></div><button type="button" class="od-bb" data-clear>Auswahl aufheben</button>'+(CHK.u.size?'<button type="button" class="od-bb" data-mvsel>In Reihe verschieben …</button>':'')+'<button type="button" class="od-bb pri" data-export>Exportieren …</button></div>':'';
   const st=dlg.querySelector('.od-mn')?.scrollTop||0;
   const FA=!Q&&orgSel!=='unk'&&!orgSel.startsWith('latein|')?reihenOf(...orgSel.split('|')).map(r=>r.id):null,AG=allG(),allOn=selOn(AG);dlg.innerHTML='<div class="od-hd"><h2>Inhalte organisieren</h2><button type="button" class="od-btn" data-load2>'+ICO.down+'Datei laden …</button><button type="button" class="od-btn" data-allsel>'+(allOn?ICO.box+'Alles abwählen':ICO.chk+'Alles auswählen')+'</button>'+(FA&&FA.length?'<button type="button" class="od-btn" data-foldall>'+'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(FA.every(isF)?'M7 9l5-5 5 5M7 15l5 5 5-5':'M7 4l5 5 5-5M7 20l5-5 5 5')+'"/></svg>'+(FA.every(isF)?'Alle ausklappen':'Alle einklappen')+'</button>':'')+'<input type="search" class="od-q" placeholder="Suchen …" value="'+esc(q)+'">'+(orgSel!=='unk'&&!orgSel.startsWith('latein|')&&!Q?'<button type="button" class="od-btn" data-newr>'+ICO.plus+'Neue Reihe</button>':'')+'<button type="button" class="od-x" data-x aria-label="Schließen">'+ICO.x+'</button></div><div class="od-bd">'+side+'<div class="od-mn">'+sel+main+'</div></div>'+bar;
   dlg.querySelector('.od-mn').scrollTop=st;wire()}
  const redraw=async()=>{data=await load();body()};
  function closeMenu(){menu?.remove();menu=null}
  function renameRow(c){const uid=c.dataset.u,rid=c.dataset.r||null,k=c.dataset.k||null,u=ordUnits().find(y=>y.u===uid);if(!u||c.querySelector('.od-in'))return;const t=c.querySelector('.od-t'),cur=unitNm(u,rid,k),base=u.t0||u.title;
   const w=document.createElement('span');w.className='od-rn';w.innerHTML='<input class="od-in" aria-label="Neuer Name"><button type="button" class="od-ok" title="Speichern" aria-label="Speichern"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button><button type="button" class="od-no" title="Abbrechen" aria-label="Abbrechen">✕</button>';
   const inp=w.querySelector('input');inp.value=cur;t.hidden=true;c.querySelector('[data-menu]')?.setAttribute('hidden','');t.after(w);c.classList.add('od-ren');inp.focus();inp.select();
   const done=save=>{if(save){const v=inp.value.trim();if(rid&&k){const x=edOf(rid);x.names={...(x.names||{})};const r0=reiheOf(rid),b0=(r0&&eff(r0).find(o=>o.k===k)||{}).t0||base;if(!v||v===b0)delete x.names[k];else x.names[k]=v;edSet(rid,x)}else{const x=edOf('_units');x.names={...(x.names||{})};if(!v||v===base)delete x.names[uid];else x.names[uid]=v;edSet('_units',x)}return redraw()}body()};
   inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();done(1)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done(0)}};
   w.querySelector('.od-ok').onclick=e=>{e.stopPropagation();done(1)};w.querySelector('.od-no').onclick=e=>{e.stopPropagation();done(0)};w.onpointerdown=e=>e.stopPropagation()}
  function openMenu(btn,sub){closeMenu();const c=btn.closest('.od-c'),uid=c.dataset.u,rid=c.dataset.r||null,k=c.dataset.k||null,u=ordUnits().find(y=>y.u===uid);if(!u)return;
   menu=document.createElement('div');menu.className='od-menu';menu._b=btn;
   if(!sub){menu.innerHTML=unitMenuHtml(u,{});/* 13.41: feste Positionsbefehle innerhalb der Reihe */if(rid&&k){const ks=eff(reiheOf(rid)).map(x=>x.k),i=ks.indexOf(k),n=ks.length,A=d=>'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px;margin-right:8px" aria-hidden="true"><path d="'+d+'"/></svg>',P=(p,ic,t,dis)=>'<button type="button" data-pos="'+p+'"'+(dis?' disabled':'')+'>'+A(ic)+t+'</button>';menu.insertAdjacentHTML('afterbegin',P('top','M12 19V8M7 13l5-5 5 5M5 4h14','Ganz nach oben',i<=0)+P('up','M12 19V5M7 10l5-5 5 5','Eine Position nach oben',i<=0)+P('dn','M12 5v14M7 14l5 5 5-5','Eine Position nach unten',i>=n-1)+P('bot','M12 5v11M7 11l5 5 5-5M5 20h14','Ganz nach unten',i>=n-1)+'<hr>')}}
   else{const RS=ordReihen().sort((a,b)=>String(a.subject).localeCompare(String(b.subject))||(+a.jg)-(+b.jg)||(+a.n||0)-(+b.n||0)||String(a.title).localeCompare(String(b.title)));let lg='';
    menu.innerHTML='<button type="button" data-a="back">‹ zurück</button><hr>'+RS.map(r=>{const g=(SUBJ[r.subject]||r.subject)+' · Jahrgang '+r.jg,h=g!==lg?'<h6>'+esc(g)+'</h6>':'';lg=g;return h+'<button type="button" data-to="'+esc(r.id)+'"'+(r.id===rid?' disabled':'')+'>'+esc(r.title)+(r.id===rid?' ✓':'')+'</button>'}).join('')+'<hr><button type="button" data-to=""'+(rid?'':' disabled')+'>Nicht in einer Reihe</button>'}
   dlg.append(menu);const bx=btn.getBoundingClientRect(),W=Math.min(300,innerWidth-16);menu.style.width=W+'px';menu.style.left=Math.max(8,Math.min(bx.right-W,innerWidth-W-8))+'px';const top=bx.bottom+4,mh=Math.min(menu.scrollHeight,innerHeight-16);menu.style.top=(top+mh>innerHeight-8?Math.max(8,bx.top-mh-4):top)+'px';
   menu.onclick=async e=>{const t=e.target.closest('button');if(!t||t.disabled)return;e.stopPropagation();
    if(t.dataset.a==='mv')return openMenu(btn,1);if(t.dataset.a==='ren'){closeMenu();return renameRow(c)}if(t.dataset.a==='back')return openMenu(btn);closeMenu();
    if(t.dataset.to!=null){ordMove(uid,rid,k,t.dataset.to||null,null);return redraw()}
    if(t.dataset.pos){const ks=eff(reiheOf(rid)).map(x=>x.k).filter(z=>z!==k),i=eff(reiheOf(rid)).map(x=>x.k).indexOf(k),p=t.dataset.pos,j=p==='top'?0:p==='up'?i-1:p==='dn'?i+1:ks.length;ordMove(uid,rid,k,rid,ks[j]||null);return redraw()}
    if(t.dataset.a==='fj'){if(await askAssign([u],{title:'Fach und Jahrgang ändern',text:'Wohin gehört „'+esc(u.title)+'“?'}))redraw();return}
    if(t.dataset.a==='stu')return stuDist(uid,rid);
    if(t.dataset.a==='exp')return unitExport(uid,null);
    if(t.dataset.a==='pv')return prev({title:u.title,url:u.file+(u.file.includes('?')?'&':'?')+'vorschau=1'});
    if(t.dataset.a==='rm'){if(!(await classroomConfirm('„'+u.title+'“ von diesem Gerät entfernen?\n\nDie Einheit verschwindet aus allen Reihen. Noten und Ergebnisse der Schüler bleiben erhalten. Du kannst sie später wieder aus ihrer Datei laden.')))return;
     for(const r of ordReihen())for(const x of eff(r))if(x.u===uid)ordMove(uid,r.id,x.k,null,null);CHK.u.delete(uid);try{await b.removeUnit(uid)}catch(err){alert('Entfernen nicht möglich: '+err.message)}return redraw()}}}
  /* 11.84: ⋯-Menü einer Reihe: umbenennen, exportieren, (Latein) Jahrgang, entfernen */
  function openRMenu(btn){closeMenu();const r=reiheOf(btn.dataset.rmenu);if(!r)return;const lat=r.subject==='latein';
   menu=document.createElement('div');menu.className='od-menu';menu._b=btn;
   menu.innerHTML=reiheMenuHtml(r,{jg:lat,stu:!lat&&stuRUnits(r).length>0});if(!lat&&!q.trim()){const ids=reihenOf(r.subject,r.jg).map(x=>x.id),i=ids.indexOf(r.id),n=ids.length,A=d=>'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px;margin-right:8px" aria-hidden="true"><path d="'+d+'"/></svg>',P=(p,ic,t,dis)=>'<button type="button" data-rpos="'+p+'"'+(dis?' disabled':'')+'>'+A(ic)+t+'</button>';if(n>1)menu.insertAdjacentHTML('afterbegin',P('top','M12 19V8M7 13l5-5 5 5M5 4h14','Ganz nach oben',i<=0)+P('up','M12 19V5M7 10l5-5 5 5','Eine Position nach oben',i<=0)+P('dn','M12 5v14M7 14l5 5 5-5','Eine Position nach unten',i>=n-1)+P('bot','M12 5v11M7 11l5 5 5-5M5 20h14','Ganz nach unten',i>=n-1)+'<hr>')}
   dlg.append(menu);const bx=btn.getBoundingClientRect(),W=Math.min(260,innerWidth-16);menu.style.width=W+'px';menu.style.left=Math.max(8,Math.min(bx.right-W,innerWidth-W-8))+'px';const top=bx.bottom+4,mh=Math.min(menu.scrollHeight,innerHeight-16);menu.style.top=(top+mh>innerHeight-8?Math.max(8,bx.top-mh-4):top)+'px';
   menu.onclick=async e=>{const t=e.target.closest('button');if(!t||t.disabled)return;e.stopPropagation();closeMenu();const a=t.dataset.a;
    if(t.dataset.rpos){const ids=reihenOf(r.subject,r.jg).map(x=>x.id),i=ids.indexOf(r.id),p=t.dataset.rpos;rMoveTo(r.subject,r.jg,r.id,p==='top'?0:p==='up'?i-1:p==='dn'?i+1:ids.length);return redraw()}
    if(a==='ren'){const n=((await classroomPrompt('Neuer Name der Reihe:',r.title))||'').trim();if(!n||n===r.title)return;const ed=edOf(r.id);edSet(r.id,{...ed,title:n});return redraw()}
    if(a==='exp')return reiheExp(r,null);
    if(a==='stu')return stuDist(null,r.id);
    if(a==='jg'){const j=await askJg(r);if(j){orgSel='latein|'+j;await redraw()}return}
    if(a==='rm'){if(!(await classroomConfirm('Reihe „'+rName(r)+'“ von diesem Gerät entfernen?\n\nDie Ergebnisse und Noten der Schüler bleiben erhalten. Lädst du die Reihe wieder, sind sie sofort wieder zugeordnet.'+(lat?'\n\nVokabeln, Grammatik und Übersetzungstexte bleiben in der App; entfernt werden die Gliederung, die Lernpakete und die Lateinarbeit dieser Sequenz.':''))))return;
     try{await b.reiheRemove(r.id)}catch(err){alert('Entfernen nicht möglich: '+err.message);return}CHK.r.delete(r.id);sel=null;return redraw()}}}
  function drag(g,ev){ev.preventDefault();const c=g.closest('.od-c'),uid=c.dataset.u,rid=c.dataset.r||null,k=c.dataset.k||null,bx=c.getBoundingClientRect();
   /* 13.05: Ziehbild als kompakte Karte (nicht schräg, nicht breiter als das Fenster) – der Griff bleibt unter dem Finger */const ghost=c.cloneNode(true);ghost.classList.add('od-ghost');const gw=Math.min(bx.width,640,innerWidth-24);ghost.style.width=gw+'px';const dx=Math.min(ev.clientX-bx.left,gw-24),dy=ev.clientY-bx.top;
   const ph=document.createElement('div');ph.className='od-ph';let tgt=null,moved=false,lastY=ev.clientY,lastX=ev.clientX,raf=0;const x0=ev.clientX,y0=ev.clientY,sc=dlg.querySelector('.od-mn');ghost.style.left=(x0-dx)+'px';ghost.style.top=(y0-dy)+'px';
   /* 13.40: ruckelfrei – Quelle macht Platz für den Platzhalter, Mitte wird ohne Platzhalter gerechnet, Auto-Scroll am Rand */
   const place=()=>{const el=document.elementFromPoint(lastX,lastY),col=el&&el.closest('[data-col]:not([data-col="-"])');tgt=col;if(!col){if(ph.parentNode)ph.remove();return}
    const list=col.querySelector('.od-list'),inL=ph.parentNode===list,phH=inL?ph.offsetHeight+8:0,gH=ghost.offsetHeight||bx.height,gC=lastY-dy+gH/2;let bef=null;/* 13.41: Position = Mitte der gezogenen Karte, gemessen am Layout ohne Lücke – rein von der Zeigerposition abhängig, daher kein Hin-und-her-Springen */for(const o of list.querySelectorAll('.od-c:not(.od-src),.od-end')){if(o.classList.contains('od-end')){bef=o;break}const r=o.getBoundingClientRect(),aft=inL&&(ph.compareDocumentPosition(o)&4),bot=r.top-(aft?phH:0)+r.height;if(gC<bot){bef=o;break}}if(bef&&ph.nextSibling!==bef&&!(bef===ph))list.insertBefore(ph,bef)};
   const tick=()=>{raf=0;if(!moved||!sc)return;const r=sc.getBoundingClientRect(),z=60;let v=0;if(lastY<r.top+z)v=-Math.ceil((r.top+z-lastY)/4);else if(lastY>r.bottom-z)v=Math.ceil((lastY-r.bottom+z)/4);if(v){sc.scrollTop+=v;place();raf=requestAnimationFrame(tick)}};
   const mv=m=>{lastX=m.clientX;lastY=m.clientY;if(!moved){if(Math.hypot(lastX-x0,lastY-y0)<4)return;moved=true;dlg.append(ghost);ph.style.height=Math.max(40,bx.height-8)+'px';c.before(ph);c.classList.add('od-src');c.style.display='none'}ghost.style.left=(lastX-dx)+'px';ghost.style.top=(lastY-dy)+'px';place();if(!raf)raf=requestAnimationFrame(tick)};
   const up=e=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);if(raf)cancelAnimationFrame(raf);ghost.remove();c.classList.remove('od-src');c.style.display='';
    if(e.type==='pointerup'&&moved&&tgt&&ph.parentNode){const to=tgt.dataset.col||null;let n=ph.nextElementSibling;while(n&&(n===c||!n.dataset.k))n=n.nextElementSibling;const before=n?n.dataset.k:null;ph.remove();
     if(to||rid)ordMove(uid,rid,k,to,before===k?null:before);redraw()}else ph.remove()};
   addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)}
  /* 13.41: Reihen ziehen – beim Ziehen klappen alle Reihen ein; Position = Mitte der Karte (Layout ohne Lücke) */
  function rdrag(g,ev){if(ev.button)return;ev.preventDefault();const c=g.closest('.od-card'),rid=g.dataset.rgrip,sc=dlg.querySelector('.od-mn'),[s,j]=orgSel.split('|'),hb=c.querySelector('.od-rh').getBoundingClientRect(),dy=ev.clientY-hb.top,dx=Math.min(ev.clientX-hb.left,hb.width-24);
   const x0=ev.clientX,y0=ev.clientY;let moved=false,lastX=x0,lastY=y0,raf=0,ghost=null,ph=null;
   const start=()=>{moved=true;dlg.classList.add('od-dragr');const nb=c.getBoundingClientRect();sc.scrollTop+=nb.top-(y0-dy);const bx=c.getBoundingClientRect();ghost=c.cloneNode(true);ghost.classList.add('od-ghost','od-rghost');ghost.style.width=Math.min(bx.width,innerWidth-24)+'px';ghost.style.left=(lastX-dx)+'px';ghost.style.top=(lastY-dy)+'px';dlg.append(ghost);ph=document.createElement('div');ph.className='od-rph';ph.style.height=bx.height+'px';c.before(ph);c.style.display='none'};
   const place=()=>{const cards=[...sc.querySelectorAll('.od-card[data-rc]')].filter(x=>x!==c),phH=ph.offsetHeight+12,gC=lastY-dy+(ghost.offsetHeight||40)/2;let bef=null;for(const o of cards){const r=o.getBoundingClientRect(),aft=ph.compareDocumentPosition(o)&4,bot=r.top-(aft?phH:0)+r.height;if(gC<bot){bef=o;break}}if(!bef)bef=cards.length?cards[cards.length-1].nextElementSibling:null;if(bef===c)bef=c.nextElementSibling;if(bef&&bef!==ph&&ph.nextElementSibling!==bef)bef.before(ph)};
   const tick=()=>{raf=0;if(!moved)return;const r=sc.getBoundingClientRect(),z=60;let v=0;if(lastY<r.top+z)v=-Math.ceil((r.top+z-lastY)/4);else if(lastY>r.bottom-z)v=Math.ceil((lastY-r.bottom+z)/4);if(v){sc.scrollTop+=v;place();raf=requestAnimationFrame(tick)}};
   const mv=m=>{lastX=m.clientX;lastY=m.clientY;if(!moved){if(Math.hypot(lastX-x0,lastY-y0)<4)return;start()}ghost.style.left=(lastX-dx)+'px';ghost.style.top=(lastY-dy)+'px';place();if(!raf)raf=requestAnimationFrame(tick)};
   const up=e=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);if(raf)cancelAnimationFrame(raf);if(!moved)return;ghost.remove();c.style.display='';dlg.classList.remove('od-dragr');
    if(e.type==='pointerup'){let i=0;for(let n=ph.previousElementSibling;n;n=n.previousElementSibling)if(n.dataset&&n.dataset.rc&&n!==c)i++;ph.remove();rMoveTo(s,+j,rid,i);return redraw()}ph.remove()};
   addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up)}
  async function doExport(btn){const rs=[...CHK.r].map(id=>reiheOf(id)).filter(Boolean);return exportSel({rs,units:[...CHK.u],lessons:[...CHK.l]},btn,selOn(allG())?{all:true}:{})}
  /* 11.71: Latein-Reihe in einen anderen Jahrgang verschieben (alle ihre Lektionen) */
  function askJg(r){return new Promise(res=>{const les=eff(r).filter(x=>x.les!=null).map(x=>String(x.les)),cur=+orgSel.split('|')[1]||0,def=les.length?b.lessonJgDefault(les[0]):cur;let d=document.getElementById('einJg');if(!d){d=document.createElement('dialog');d.id='einJg';document.body.append(d)}
   d.innerHTML='<form method="dialog"><h2>Jahrgang ändern</h2><p class="muted">In welchem Jahrgang unterrichtest du „'+esc(rName(r))+'“? Alle '+les.length+' Lektionen der Reihe ziehen mit um.</p><select data-j>'+[5,6,7,8,9,10,11,12,13].map(n=>'<option value="'+n+'"'+(n===cur?' selected':'')+'>Jahrgang '+n+(n===def?' (Standard)':'')+'</option>').join('')+'</select><div class="acts"><button type="button" data-no>Abbrechen</button><button type="submit" class="pri">Übernehmen</button></div></form>';
   d.querySelector('[data-no]').onclick=()=>{d.close();res(null)};d.querySelector('form').onsubmit=e=>{e.preventDefault();const j=+d.querySelector('[data-j]').value;b.setLessonJg(les,j===def?0:j);d.close();res(j)};d.showModal()})}
  function wire(){dlg.querySelector('[data-x]').onclick=()=>dlg.close();
   dlg.querySelectorAll('[data-rmenu]').forEach(x=>x.onclick=e=>{e.stopPropagation();menu&&menu._b===x?closeMenu():openRMenu(x)});
   dlg.querySelectorAll('[data-fold]').forEach(x=>x.onclick=e=>{e.stopPropagation();setF([x.dataset.fold],!isF(x.dataset.fold));body()});
   dlg.querySelector('[data-foldall]')?.addEventListener('click',()=>{const ids=reihenOf(...orgSel.split('|')).map(r=>r.id);setF(ids,!ids.every(isF));body()});
   dlg.querySelectorAll('[data-rgrip]').forEach(g=>g.onpointerdown=e=>rdrag(g,e));
   dlg.querySelector('[data-load2]')?.addEventListener('click',async()=>{await loadPkg();await redraw()});
   const qi=dlg.querySelector('.od-q');qi.oninput=()=>{q=qi.value;const p=qi.selectionStart;body();const n=dlg.querySelector('.od-q');n.focus();try{n.setSelectionRange(p,p)}catch{}};
   dlg.querySelectorAll('[data-g]').forEach(x=>x.onclick=()=>{orgSel=x.dataset.g;q='';body();dlg.querySelector('.od-mn').scrollTop=0});
   dlg.querySelector('[data-gsel]').onchange=e=>{orgSel=e.target.value;q='';body()};
   dlg.querySelectorAll('[data-assign]').forEach(x=>x.onclick=async()=>{if(await askAssign(ordUnits().filter(u=>u.unk)))redraw()});
   dlg.querySelector('[data-newr]')?.addEventListener('click',async()=>{const [s,j]=orgSel.split('|'),t=((await classroomPrompt('Name der neuen Reihe ('+(SUBJ[s]||s)+' · Jahrgang '+j+'):',''))||'').trim();if(!t)return;
    try{await b.reiheSave({type:'classroom-reihe',id:'eigen-'+Date.now().toString(36),title:t,subject:s,jg:+j,n:99,entries:[],units:{}},{subject:s,jg:+j})}catch(e){alert('Anlegen nicht möglich: '+e.message);return}redraw()});
   dlg.querySelectorAll('[data-ck]').forEach(x=>x.onclick=e=>{e.stopPropagation();toggleItem(x.dataset.ck,x.dataset.id);body()});
   dlg.querySelectorAll('[data-cr]').forEach(x=>x.onclick=()=>{const r=reiheOf(x.dataset.cr);if(r){toggleReihe(r);body()}});
   dlg.querySelectorAll('[data-cfree]').forEach(x=>x.onclick=()=>{const ids=[...x.closest('.od-card').querySelectorAll('[data-ck]:not(:disabled)')].map(y=>y.dataset.id),t=x.dataset.cfree,all=ids.length&&ids.every(id=>CHK[t].has(id));ids.forEach(id=>all?CHK[t].delete(id):CHK[t].add(id));body()});
   dlg.querySelector('[data-allsel]').onclick=()=>{const g=allG();setSel(g,!selOn(g));body()};
   dlg.querySelector('[data-grpsel]')?.addEventListener('click',()=>{const g=grpSel();if(g){setSel(g,!selOn(g));body()}});
   dlg.querySelector('[data-clear]')?.addEventListener('click',()=>{for(const k of ['r','u','l'])CHK[k].clear();body()});
   dlg.querySelector('[data-export]')?.addEventListener('click',e=>doExport(e.currentTarget));
   /* 13.37: mehrere angehakte Einheiten auf einmal in eine Reihe verschieben (Reihenfolge wie angezeigt) */
   dlg.querySelector('[data-mvsel]')?.addEventListener('click',e=>{e.stopPropagation();const btn=e.currentTarget;if(menu&&menu._b===btn)return closeMenu();closeMenu();
    const seen=new Set(),src=[];dlg.querySelectorAll('.od-c[data-u]').forEach(c=>{const u=c.dataset.u;if(CHK.u.has(u)&&!seen.has(u)){seen.add(u);src.push([u,c.dataset.r||null,c.dataset.k||null])}});
    for(const u of CHK.u)if(!seen.has(u)){let at=[u,null,null];for(const r of ordReihen()){const x=eff(r).find(y=>y.u===u);if(x){at=[u,r.id,x.k];break}}src.push(at)}
    const RS=ordReihen().sort((a,b)=>String(a.subject).localeCompare(String(b.subject))||(+a.jg)-(+b.jg)||(+a.n||0)-(+b.n||0)||String(a.title).localeCompare(String(b.title)));let lg='';
    menu=document.createElement('div');menu.className='od-menu';menu._b=btn;
    menu.innerHTML='<h6>'+src.length+(src.length===1?' Einheit':' Einheiten')+' verschieben nach …</h6>'+RS.map(r=>{const g=(SUBJ[r.subject]||r.subject)+' · Jahrgang '+r.jg,h=g!==lg?'<h6>'+esc(g)+'</h6>':'';lg=g;return h+'<button type="button" data-to="'+esc(r.id)+'">'+esc(r.title)+'</button>'}).join('')+'<hr><button type="button" data-to="">Nicht in einer Reihe</button>';
    dlg.append(menu);const bx=btn.getBoundingClientRect(),W=Math.min(300,innerWidth-16);menu.style.width=W+'px';menu.style.left=Math.max(8,Math.min(bx.right-W,innerWidth-W-8))+'px';const mh=Math.min(menu.scrollHeight,innerHeight-16);menu.style.maxHeight=(innerHeight-16)+'px';menu.style.overflowY='auto';menu.style.top=Math.max(8,bx.top-mh-4)+'px';
    menu.onclick=t0=>{const t=t0.target.closest('button[data-to]');if(!t)return;t0.stopPropagation();closeMenu();const to=t.dataset.to||null;
     for(const [u,rid,k] of src){if(rid===to)continue;if(!rid&&!to)continue;ordMove(u,rid,k,to,null)}
     for(const [u] of src)CHK.u.delete(u);redraw()}});
   dlg.querySelectorAll('[data-menu]').forEach(x=>x.onclick=e=>{e.stopPropagation();menu&&menu._b===x?closeMenu():openMenu(x)});
   dlg.querySelectorAll('[data-pmenu]').forEach(x=>x.onclick=e=>{e.stopPropagation();if(menu&&menu._b===x)return closeMenu();closeMenu();
    menu=document.createElement('div');menu.className='od-menu';menu._b=x;menu.innerHTML='<button type="button" class="del" data-a="prm">'+ICO.del+'Aus der Reihe entfernen …</button>';dlg.append(menu);
    const bx=x.getBoundingClientRect(),W=Math.min(260,innerWidth-16);menu.style.width=W+'px';menu.style.left=Math.max(8,Math.min(bx.right-W,innerWidth-W-8))+'px';menu.style.top=(bx.bottom+4)+'px';
    menu.onclick=async ev=>{ev.stopPropagation();closeMenu();if(!(await classroomConfirm('„'+x.dataset.t+'“ aus der Reihe entfernen?\n\nEs ist nur ein Platzhalter ohne Material.')))return;
     const rid=x.dataset.r,ed=edOf(rid);edSet(rid,{...ed,del:[...new Set([...(ed.del||[]),x.dataset.k])]});redraw()}});
   dlg.querySelectorAll('.od-c[data-u]>.od-t').forEach(t=>{const c=t.parentNode;t.ondblclick=e=>{e.preventDefault();renameRow(c)};let tm=null,x0=0,y0=0;
    t.onpointerdown=e=>{if(e.pointerType==='mouse')return;x0=e.clientX;y0=e.clientY;clearTimeout(tm);tm=setTimeout(()=>{tm=null;renameRow(c)},550)};
    t.onpointermove=e=>{if(tm&&Math.hypot(e.clientX-x0,e.clientY-y0)>8){clearTimeout(tm);tm=null}};t.onpointerup=t.onpointercancel=()=>{clearTimeout(tm);tm=null}});
   dlg.querySelectorAll('[data-grip]').forEach(g=>g.onpointerdown=e=>drag(g,e))}
  dlg.onclick=e=>{if(menu&&!e.target.closest('.od-menu'))closeMenu()};
  body();if(!dlg.open)dlg.showModal()}
 /* Lerngruppe gewechselt → neu zeichnen, mit ihrer aktuellen Lektion */
 const title=document.getElementById('titelKlasse');if(title)new MutationObserver(()=>{if(on){sel=null;q='';render()}}).observe(title,{childList:true,characterData:true,subtree:true});
 window.addEventListener('storage',e=>{if(on&&e.key&&/^classroom-(vocab|grammar|text-trainer|lerneinheiten)/.test(e.key))render()});
 /* Beim Laden: Modus vom Hauptfenster übernehmen */
 try{if(frameElement?.dataset.mode==='unterricht')setTimeout(()=>mode(true),0)}catch{}
 {const st=document.createElement('style');st.textContent='.lk-shh{display:none}@media (max-width:600px){html body .ph-x:not(#_):not(#__):not(#___){display:none!important}.ein-mh>h2,.ein-mh>.sp{display:none!important}.ein-mh{display:flex!important;flex-wrap:nowrap!important;gap:8px!important;align-items:center!important}.ein-mh .ein-lkh{flex:1 1 auto!important;justify-content:center!important;background:#2f5f9b!important;color:#fff!important;border-color:#2f5f9b!important;min-height:46px!important;font-weight:650!important}.ein-mh .ein-lkh svg{color:#fff!important}.ein-mh .ein-togw{display:flex!important;gap:8px!important;margin:0!important;flex:none!important}.ein-mh .ein-togw>.ein-curb{width:46px!important;height:46px!important;margin:0!important}.ph-more{font-size:22px!important;font-weight:700;line-height:1;color:#2f5f9b}.ein-pick{display:flex!important;align-items:center;gap:6px}.ein-pkcur{margin-left:auto;font-size:12.5px;color:#fff;background:#e8790c;border-radius:999px;padding:2px 9px;font-weight:700}.ein-lphint{display:none!important}.ein-toc{display:none!important}.ein-toc.ph-open{display:grid!important}.ph-ktog{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;margin:10px 0;padding:11px 14px;border:1px solid #d5dfec;border-radius:12px;background:#fff;color:#2f5f9b;font:inherit;text-align:left;cursor:pointer}.ph-ktog small{flex:1;min-width:0;color:#66758a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px}.ph-ktog span{transition:transform .15s}.ph-ktog:has(+.ph-open) span{transform:rotate(90deg)}.ein-tile>.ein-acts{display:flex!important;gap:6px!important;flex-wrap:nowrap!important}.ein-tile>.ein-acts>button:not(.ph-x){flex:1 1 0!important;min-width:0!important}.ein-tile>.ein-acts>.ph-more2{flex:none!important;width:42px!important}\n.lk-sheet,.ph-sheet{position:fixed!important;left:0!important;right:0!important;top:auto!important;bottom:0!important;width:auto!important;max-height:88dvh!important;border-radius:20px 20px 0 0!important;padding:8px 14px calc(16px + env(safe-area-inset-bottom))!important;box-shadow:0 0 0 100vmax rgba(28,43,70,.35),0 -10px 30px rgba(0,0,0,.12)!important;border:0!important}.lk-sheet{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}.lk-shh{display:grid;grid-column:1/-1;grid-template-columns:1fr auto;align-items:center;order:0}.lk-grip{grid-column:1/-1;justify-self:center;width:40px;height:5px;border-radius:3px;background:#cfd8e4;margin:0 0 8px}.lk-shh b{font-size:19px;color:#1c2b46}.lk-x{width:34px;height:34px;border-radius:50%;border:0;background:#eef2f8;color:#5b6b82;font-size:15px}.lk-sheet .lk-mi{flex-direction:column!important;align-items:flex-start!important;gap:5px!important;border:1px solid #d5dfec!important;border-radius:14px!important;padding:10px 11px!important;min-height:86px;margin:0!important;background:#fff}.lk-sheet .lk-mi svg{width:20px;height:20px}.lk-sheet .lk-mi b{font-size:15px}.lk-sheet .lk-mi small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12px}.lk-sheet hr{grid-column:1/-1;margin:2px 0;order:7;width:100%}.lk-sheet [data-lka=voc]{order:1}.lk-sheet [data-lka=wh]{order:2}.lk-sheet [data-lka=gr]{order:3}.lk-sheet [data-lka=kb]{order:4}.lk-sheet [data-lka=kbw]{order:5}.lk-sheet [data-lka=mine]{order:6}.lk-sheet [data-lka=home]{order:8}.lk-sheet [data-lka=nav]{order:9}.lk-sheet [data-lka=home],.lk-sheet [data-lka=nav]{min-height:0;flex-direction:row!important;align-items:center!important}.lk-sheet [data-lka=home] small,.lk-sheet [data-lka=nav] small{display:none}.ph-sheet .ph-mi{min-height:46px;align-items:center!important}}';document.head.append(st)}
})();
;

/* ==== sitzplan/view-pills.js ==== */
/* 11.28: Sitzplan-Leiste wie im Noten-Manager – runde Knöpfe ändern nur die Ansicht, eckige tun etwas.
   ① Einstellungen | Noten-Spalte | Seite tauschen: Umschalter-Pille (36 hoch, Felder 38 × 30)
   ② Zoom als eine Pille: − Regler 100 % +   ③ Einpassen | 100 %: Umschalter   ④ Bewertungen: runder Einzelknopf 40 × 40
   Die Knöpfe bleiben direkte Kinder der Leiste (das Menü „Mehr“ verschiebt sie bei Platzmangel) – die Pillen entstehen nur per CSS. */
(()=>{
 const Z='html body[data-module=sitzplan] .classroom-plan-zoom',X=':not(#_):not(#__):not(#___)',BG='#e7edf6',ON='#fff',SH='0 2px 5px rgba(35,61,96,.08)';
 const st=document.createElement('style');st.textContent=
  /* ① Umschalter-Pille */
  Z+'>.plan-col-pair'+X+'{display:inline-flex!important;align-items:center;gap:2px!important;height:36px!important;padding:3px!important;border:0!important;border-radius:999px!important;background:'+BG+'!important;box-shadow:none!important;overflow:visible!important}'
  +Z+'>.plan-col-pair>button'+X+'{width:38px!important;min-width:38px!important;height:30px!important;min-height:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:999px!important;background:transparent!important;color:#66778f!important;box-shadow:none!important;display:inline-grid!important;place-items:center}'
  +Z+'>.plan-col-pair>button[aria-pressed=true]'+X+'{background:'+ON+'!important;color:#243247!important;box-shadow:'+SH+'!important}'
  +Z+'>.plan-col-pair>button:hover'+X+'{color:#2f5f9b!important}'
  +Z+'>.plan-col-pair>button svg{width:18px;height:18px}'
  /* ② Zoom-Pille: −, Regler, Prozent, + liegen nebeneinander, die Lücken werden geschlossen */
  +Z+'>:is([data-zoom-minus],[data-zoom-plus])'+X+'{width:36px!important;min-width:36px!important;height:36px!important;min-height:0!important;padding:0!important;border:0!important;box-shadow:none!important;color:#2f5f9b!important;font-size:18px!important;line-height:1!important;background:radial-gradient(circle at 50% 50%,#fff 14.5px,transparent 15.5px)!important}'
  +Z+'>[data-zoom-minus]'+X+'{border-radius:999px 0 0 999px!important;margin-right:-8px!important}'
  +Z+'>[data-zoom-plus]'+X+'{border-radius:0 999px 999px 0!important;margin-left:-8px!important}'
  +Z+'>[data-zoom-minus]:hover'+X+','+Z+'>[data-zoom-plus]:hover'+X+'{background:radial-gradient(circle at 50% 50%,#eaf0fa 14.5px,transparent 15.5px)!important}'
  +Z+'>input[type=range]'+X+'{margin:0 -8px 0 0!important;padding:0 8px!important;box-sizing:content-box}'
  /* Safari/Chrome malen beim Regler keinen Hintergrund – die Pille liegt als eigenes Element dahinter */
  +Z+'{position:relative;isolation:isolate}'+Z+'>.vp-zoom-bg{position:absolute;z-index:-1;height:36px;border-radius:999px;background:'+BG+';pointer-events:none}'
  +Z+'>output'+X+'{display:inline-flex!important;align-items:center;height:36px!important;margin:0!important;padding:0 6px 0 8px!important;background:transparent!important;font-size:13px!important;font-weight:650!important;color:#243247!important;white-space:nowrap}'
  /* ③ Einpassen | 100 %: Umschalter */
  +Z+'>:is([data-zoom-fit],[data-zoom-reset])'+X+'{width:41px!important;min-width:41px!important;height:36px!important;min-height:0!important;padding:0!important;border:0!important;box-shadow:none!important;color:#66778f!important;background:'+BG+'!important}'
  +Z+'>[data-zoom-fit]'+X+'{border-radius:999px 0 0 999px!important;padding-left:3px!important;width:44px!important;min-width:44px!important}'
  +Z+'>[data-zoom-reset]'+X+'{border-radius:0 999px 999px 0!important;margin-left:-8px!important;padding-right:3px!important;width:44px!important;min-width:44px!important}'
  +Z+'>:is([data-zoom-fit][aria-pressed=true],[data-zoom-reset][data-vp-on])'+X+'{color:#243247!important;background:radial-gradient(ellipse 19px 15px at calc(50% + var(--vp-off,0px)) 50%,#fff 96%,'+BG+' 100%)!important}'
  +Z+'>[data-zoom-fit]'+X+'{--vp-off:1.5px}'+Z+'>[data-zoom-reset]'+X+'{--vp-off:-1.5px}'
  +Z+'>:is([data-zoom-fit],[data-zoom-reset]):hover'+X+'{color:#2f5f9b!important}'
  /* fehlt eine Hälfte (Menü „Mehr“), ist die andere ganz rund */
  +Z+':has(>[data-zoom-reset].zoom-collapsed)>[data-zoom-fit]'+X+'{border-radius:999px!important}'
  +Z+':has(>[data-zoom-fit].zoom-collapsed)>[data-zoom-reset]'+X+'{border-radius:999px!important;margin-left:0!important}'
  /* ④ Bewertungen: runder Einzelknopf */
  +Z+'>.plan-assess-switch'+X+'{width:40px!important;min-width:40px!important;height:40px!important;border-radius:999px!important;background:#e7edf6!important;border:0!important;padding:0!important}'
  +Z+'>.plan-assess-switch'+X+':has(input:not(:checked)){border:1.5px solid #d97f06!important;background:#fde0b8!important}';
 document.head.append(st);
 /* „100 %“ gilt als aktiv, wenn nicht eingepasst und der Zoom genau 100 % ist */
 function pill(bar){const m=bar.querySelector(':scope>[data-zoom-minus]'),pl=bar.querySelector(':scope>[data-zoom-plus]');let bg=bar.querySelector(':scope>.vp-zoom-bg');
  if(!m||!pl||!m.offsetParent){if(bg)bg.hidden=true;return}if(!bg){bg=document.createElement('span');bg.className='vp-zoom-bg';bg.setAttribute('aria-hidden','true');bar.prepend(bg)}bg.hidden=false;
  const L=m.offsetLeft,R=pl.offsetLeft+pl.offsetWidth,T=m.offsetTop+(m.offsetHeight-36)/2,s=bg.style,l=L+'px',w=(R-L)+'px',t=T+'px';if(s.left!==l)s.left=l;if(s.width!==w)s.width=w;if(s.top!==t)s.top=t}
 /* 11.99: Hintergrund der Zoom-Pille gesammelt einmal pro Bild setzen (das Messen erzwingt sonst jedes Mal ein Layout) */let pq=0;const pillLater=bar=>{if(!pq)pq=requestAnimationFrame(()=>{pq=0;if(bar.isConnected)pill(bar)})};
 function sync(){const bar=document.querySelector('.classroom-plan-zoom');if(!bar)return;pillLater(bar);const fit=bar.querySelector(':scope>[data-zoom-fit]'),reset=bar.querySelector(':scope>[data-zoom-reset]'),out=bar.querySelector(':scope>output');if(!reset)return;
  const on=fit?.getAttribute('aria-pressed')!=='true'&&/^\s*100\s*%/.test(out?.textContent||'');if(reset.hasAttribute('data-vp-on')!==on)reset.toggleAttribute('data-vp-on',on)}
 let obs=null;const watch=()=>{const bar=document.querySelector('.classroom-plan-zoom');if(!bar||bar===obs)return;obs=bar;/* 11.96: Leiste mittig – bei Breitenänderung rutscht der Regler, der Hintergrund muss mit */const later=()=>pillLater(bar);const ro=new ResizeObserver(later);const obsAll=()=>{ro.observe(bar);for(const c of bar.children)ro.observe(c)};obsAll();new MutationObserver(()=>{obsAll();later()}).observe(bar,{childList:true});document.fonts?.ready?.then(()=>pill(bar));new MutationObserver(sync).observe(bar,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-pressed']});sync()};
 if(typeof classroomOnDomChange==='function')classroomOnDomChange(watch);else new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
 watch();setTimeout(watch,800);addEventListener('resize',()=>{const b=document.querySelector('.classroom-plan-zoom');if(b)pillLater(b)});
})();
;

/* ==== sitzplan/seat-insights.js ==== */
/* 11.96: Sitzplan × Noten
   ① Ansicht-Pille „Anzahl | Lerneinheit | Trend“ (rund = nur Ansicht): kleine Marke unten am Platz
      · Anzahl: mündliche Noten im gewählten Quartal (orange = 0, hell-orange = unterdurchschnittlich)
      · Lerneinheit: Stationen der zuletzt bearbeiteten Lerneinheit (Abgabe-QR) – fertig / 4/10 / –
      · Trend: mündliche Mitarbeit, letzte 4 Noten gegenüber den früheren im Halbjahr (ab 0,5 Unterschied)
   ② Zufallsauswahl als Doppelschalter: Würfel (zufällig) | Waage (fair – wer im Quartal seltener bewertet wurde, wird häufiger gezogen)
   ③ Sitzverteilung „Klassenarbeit A/B“: Einzelplätze, Gruppe A/B im Schachbrett (auch im Ausdruck)
   ④ Sitzverteilung „Lernpartner nach Leistung“: stark neben förderbedürftig (Noten aus dem Noten-Manager)
   ⑤ beide Leisten über und unter dem Plan mittig */
(()=>{
 const MODE_KEY='classroom-seat-info-v1',BEL_KEY='classroom-belegung-extra-v1';
 const rd=(k,d)=>{try{return localStorage.getItem(k)??d}catch{return d}},wr=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 let mode=rd(MODE_KEY,'');if(!['count','le','trend'].includes(mode))mode='';
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const norm=n=>ClassroomCore.normalize(n),swap=n=>{const m=/^\s*([^,]+),\s*(.+)$/.exec(n||'');return m?m[2].trim()+' '+m[1].trim():String(n||'').trim()};
 const fmt=v=>(Math.round(v*10)/10).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1});
 const isGrade=v=>v!=null&&v!==''&&v!=='x'&&Number.isFinite(Number(v))&&Number(v)>=1&&Number(v)<=6;
 const today=()=>classroomDate?.value||new Date().toISOString().slice(0,10);
 const targets=()=>{try{return lessonSource()?.targets||[]}catch{return []}};
 const nw=()=>{try{return parent.document.getElementById('view-noten')?.contentWindow||null}catch{return null}};
 const findIn=(list,p)=>list?.find(s=>s.id===p.id||s.classroomId===p.id||norm(s.name)===norm(p.name));
 const people=()=>(classroomCurrentGroup()?.students||[]).filter(s=>!s.deleted);
 const personOf=name=>name&&people().find(s=>norm(s.name)===norm(name));
 const absentToday=p=>!!classroomCurrentGroup()?.attendance?.[today()]?.[p.id];

 /* ---------- Daten ---------- */
 function quarterTarget(){const t=targets();return t.find(x=>x.key===lessonGrade.value&&x.type==='performance')||null}
 function quarterCounts(){const q=quarterTarget(),m=new Map();if(!q?.data)return null;const d=today();
  for(const p of people()){const st=findIn(q.data.students,p);let n=0;for(const t of q.data.tasks||[])if((!t.date||t.date<=d)&&isGrade(st?.grades?.[t.id]))n++;m.set(p.id,n)}return m}
 function halfYearGrades(p){const q=quarterTarget();if(!q)return [];const d=today(),out=[];
  for(const pg of targets().filter(t=>t.type==='performance'&&t.data&&t.halfYearId===q.halfYearId&&(t.quarterIndex??0)<=(q.quarterIndex??0))){const st=findIn(pg.data.students,p);for(const t of pg.data.tasks||[])if(t.date&&t.date<=d&&isGrade(st?.grades?.[t.id]))out.push({d:t.date,g:Number(st.grades[t.id])})}
  return out.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0)}
 function trendOf(p){const all=halfYearGrades(p);if(all.length<5)return null;const last=all.slice(-4),prev=all.slice(0,-4);if(prev.length<2)return null;
  const avg=a=>a.reduce((s,x)=>s+x.g,0)/a.length,a=avg(prev),b=avg(last);return Math.abs(b-a)>=.5?{a,b}:null}
 function sourceKey(){const v=lessonSubject?.value||'';return v.includes('::')?v.split('::'):null}
 function leLive(){const k=sourceKey(),w=nw();if(!k||!w?.classroomLeLive)return null;try{return w.classroomLeLive(k[0],k[1])}catch{return null}}
 function leFor(live,p){if(!live)return null;const S=live.subs;for(const [n,x] of Object.entries(S))if(norm(n)===norm(p.name)||norm(n)===norm(swap(p.name))||norm(swap(n))===norm(p.name))return x;
  const first=String(p.name).includes(',')?String(p.name).split(',').slice(1).join(',').trim():String(p.name).split(/\s+/)[0];const hit=Object.values(S).filter(x=>norm(x.n)===norm(first));return hit.length===1?hit[0]:null}
 /* Leistung für Lernpartner: Spalte aus dem Noten-Manager (Quartalsnote/Klassenarbeit/Halbjahresnote), sonst Mittel der mündlichen Noten */
 function performance(){const k=sourceKey(),w=nw();let GC=null;try{if(k&&w?.classroomGradeColumns)GC=w.classroomGradeColumns(k[0],k[1])}catch{}
  const col=GC?.cols?.length?([...GC.cols].reverse().find(c=>/^Quartalsnote|^Klassenarbeit|^Halbjahresnote/.test(c.label))||GC.cols.at(-1)):null;
  const m=new Map();if(col){const V={};for(const [n,v] of Object.entries(col.values||{})){V[norm(n)]=v;V[norm(swap(n))]=v}for(const p of people()){const v=V[norm(p.name)]??V[norm(swap(p.name))];if(typeof v==='number')m.set(norm(p.name),v)}}
  if(m.size>=4)return {label:col.label+(GC.half?' ('+GC.half+')':''),m};
  const m2=new Map();for(const p of people()){const g=halfYearGrades(p);if(g.length)m2.set(norm(p.name),g.reduce((s,x)=>s+x.g,0)/g.length)}
  return m2.size>=4?{label:'Mittel der mündlichen Noten im Halbjahr',m:m2}:null}

 /* ---------- Darstellung ---------- */
 const st=document.createElement('style');const P='body[data-module=sitzplan] .room-grid .cell';st.textContent=
  P+'.si-on{position:relative;overflow:visible!important}'
  +P+'>.si-tag{position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);z-index:3;padding:1px 7px;border-radius:999px;font-size:10.5px;font-weight:750;line-height:1.4;white-space:nowrap;pointer-events:none;box-shadow:0 1px 3px #0002;background:#eef2f8;color:#38506f;border:1px solid #cfd8e6}'
  +P+'>.si-tag.si-zero{background:#e8790c;color:#fff;border-color:#e8790c}'+P+'>.si-tag.si-low{background:#fff1e3;color:#a4500a;border-color:#f3c08e}'
  +P+'>.si-tag.si-ok{background:#e3f4ea;color:#1f7a45;border-color:#a9dcbd}'+P+'>.si-tag.si-mid{background:#fff8dc;color:#8a6a00;border-color:#ecd98a}'
  +P+'>.si-tag.si-up{background:#e3f4ea;color:#1f7a45;border-color:#a9dcbd}'+P+'>.si-tag.si-down{background:#fde8e6;color:#b42318;border-color:#f3b4ad}'
  +P+'>.si-ab{position:absolute;left:-7px;top:-8px;z-index:3;width:20px;height:20px;border-radius:999px;display:grid;place-items:center;font-size:11.5px;font-weight:800;pointer-events:none;box-shadow:0 1px 3px #0003;color:#fff}'
  +P+'>.si-ab[data-ab=A]{background:#2f5f9b}'+P+'>.si-ab[data-ab=B]{background:#e8790c}'
  +'html.classroom-assessments-hidden '+P+'>.si-tag,html.classroom-beamer '+P+'>.si-tag,html.ph-lite '+P+'>.si-tag{display:none!important}'
  +'@media print{'+P+'>.si-tag{display:none!important}'+P+'>.si-ab{-webkit-print-color-adjust:exact;print-color-adjust:exact}}'
  /* Ansicht-Pille */
  +'html body[data-module=sitzplan] .classroom-plan-zoom>.si-pill:not(#_){display:inline-flex;align-items:center;gap:2px;height:36px;padding:3px;border-radius:999px;background:#e7edf6;flex:none}'
  +'.si-pill>button{height:30px;min-height:0!important;padding:0 11px!important;margin:0!important;border:0!important;border-radius:999px!important;background:transparent!important;color:#4b5b72!important;font:inherit;font-size:13px!important;font-weight:650!important;box-shadow:none!important;cursor:pointer;white-space:nowrap}'
  +'html body .si-pill>button:not(#_){padding:0 10px!important;display:inline-flex!important;align-items:center;justify-content:center}.si-pill>button svg{width:21px;height:21px;display:block}'
  +'.si-pill>button[aria-pressed=true]{background:#fff!important;color:#c2410c!important;box-shadow:0 2px 5px rgba(35,61,96,.08)!important}.si-pill>button:hover{color:#2f5f9b!important}'
  +'.si-pill>.si-lbl{font-size:12px;font-weight:650;color:#66758a;padding:0 4px 0 9px}'
  +'html.ph-lite .si-pill,html.classroom-beamer .si-pill{display:none!important}'
  +'.si-legend{text-align:center;font-size:12.5px;color:#66758a;margin:2px 0 4px}.si-legend[hidden]{display:none}.si-legend b{color:#243247}'
  +'html.ph-lite .si-legend,html.classroom-beamer .si-legend{display:none!important}@media print{.si-legend{display:none!important}}'
  /* Fair losen: Doppelschalter Würfel | Waage */
  +'html body[data-module=sitzplan] .classroom-plan-actions>.si-rsplit{display:inline-flex;flex:none;position:relative}'
  +'html.spi-on body .si-rsplit>.btn:not(#_):not(#__):not(#___){height:40px!important;min-height:40px!important;width:42px!important;min-width:42px!important;margin:0!important}'
  +'html body .si-rsplit>#randomStudentButton:not(#_):not(#__):not(#___){border-top-right-radius:0!important;border-bottom-right-radius:0!important;border-right:0!important}'
  +'html body .si-rsplit>#fairRandomButton:not(#_):not(#__):not(#___){border-top-left-radius:0!important;border-bottom-left-radius:0!important;border-left:0!important}'
  +'.si-rsplit:after{content:"";position:absolute;left:50%;top:9px;bottom:9px;width:1px;background:#cfd8e6;pointer-events:none}'
  +'.si-rsplit>.btn.plan-actions-collapsed{display:none!important}'
  /* ⑤ Leisten mittig */
  +'html body[data-module=sitzplan] .classroom-plan-zoom:not(#_):not(#__),html body[data-module=sitzplan] .classroom-plan-actions:not(#_):not(#__){justify-content:center!important}'
  +'html body[data-module=sitzplan] .random-student-action:not(#_){justify-content:center;justify-self:stretch;grid-column:1/-1}'
  +'html.cm-side-right body[data-module=sitzplan] .classroom-plan-zoom>.plan-col-pair:not(#_):not(#__){margin-left:0!important}';
 document.head.append(st);

 const LABEL={count:'Anzahl',le:'Lerneinheit',trend:'Trend'};
 /* 12.07: Symbole statt Wörter – Anzahl (123 in der Sprechblase), Lerneinheit (iPad wie am iPhone), Trend (Börsenpfeil) */
 const SIC={count:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4 3.5V17H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 5z"/><text x="12" y="13.9" font-size="8" font-family="Inter,Arial,sans-serif" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none">123</text></svg>',le:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2.5" width="14" height="19" rx="2.5"/><path d="M21.9 3.4l.9.9-10.1 10.1-1.9.9.9-1.9z" stroke-width="1.6"/></svg>',trend:'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-5 4 3 8-8"/><path d="M14 7h6v6"/></svg>'};window.classroomSiIcons=SIC;
 const TITLE={count:'Am Platz: Anzahl der mündlichen Noten im gewählten Quartal – orange = noch keine bzw. weniger als die anderen.',le:'Am Platz: Stand der zuletzt bearbeiteten Lerneinheit (aus den gescannten Abgabe-QR-Codes).',trend:'Am Platz: Trend der mündlichen Mitarbeit – letzte 4 Noten gegenüber den früheren im Halbjahr (ab 0,5 Unterschied).'};
 let pill=null,legend=null;
 function ensureUi(){
  const bar=document.querySelector('.classroom-plan-zoom');if(!bar)return;
  if(!pill||!pill.isConnected){pill=document.createElement('span');pill.className='si-pill';pill.setAttribute('role','group');pill.setAttribute('aria-label','Am Platz anzeigen');
   pill.innerHTML=Object.entries(LABEL).map(([k,l])=>'<button type="button" data-si="'+k+'" aria-pressed="false" aria-label="'+l+'" title="'+esc(l+': '+TITLE[k])+'">'+SIC[k]+'</button>').join('');
   pill.addEventListener('click',e=>{const b=e.target.closest('[data-si]');if(!b)return;mode=mode===b.dataset.si?'':b.dataset.si;wr(MODE_KEY,mode);paint()});}
  if(pill.parentElement!==bar){const more=bar.querySelector(':scope>.zoom-more'),sw=bar.querySelector(':scope>.plan-assess-switch');if(sw)sw.after(pill);else if(more)more.before(pill);else bar.append(pill)}
  if(!legend||!legend.isConnected){legend=document.createElement('div');legend.className='si-legend';legend.hidden=true;legend.setAttribute('role','status')}
  if(legend.previousElementSibling!==bar)bar.after(legend);
  for(const b of pill.querySelectorAll('[data-si]')){const on=String(b.dataset.si===mode);if(b.getAttribute('aria-pressed')!==on)b.setAttribute('aria-pressed',on)}
  ensureFair();window.classroomLegendEnsure?.();
  const go=document.getElementById('classroomStartButton');if(go&&go.onclick!==window.generiereSitzplan)go.onclick=window.generiereSitzplan;
 }
 function setLegend(html){if(!legend)return;if(!html){if(!legend.hidden)legend.hidden=true;return}if(legend.innerHTML!==html)legend.innerHTML=html;legend.hidden=false}
 const mark=cell=>{const on=!!cell.querySelector(':scope>.si-tag,:scope>.si-ab');if(cell.classList.contains('si-on')!==on)cell.classList.toggle('si-on',on)};
 const setTag=(cell,cls,text,title)=>{let t=cell.querySelector(':scope>.si-tag');if(!text){if(t){t.remove();mark(cell)}return}if(!t){t=document.createElement('span');t.className='si-tag';t.setAttribute('aria-hidden','true');cell.append(t)}const c='si-tag '+(cls||'');if(t.className!==c)t.className=c;if(t.textContent!==text)t.textContent=text;mark(cell);if(title){cell.title=(cell.title||'')+' · '+title}};
 const cellName=cell=>gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)];

 /* ③ A/B im Schachbrett: Reihen und Spalten mit Plätzen werden durchgezählt (leere Zwischenreihen zählen nicht) */
 const belegung=()=>document.querySelector('input[name="belegung"]:checked')?.value||'einzeln';
 function paintAB(cells){
  const on=belegung()==='klassenarbeit',seats=cells.filter(c=>{const n=cellName(c);return on&&n&&n!=='X'&&n!=='PULT'&&personOf(n)});
  const rows=[...new Set(seats.map(c=>+c.dataset.row))].sort((a,b)=>a-b),cols=[...new Set(seats.map(c=>+c.dataset.col))].sort((a,b)=>a-b);let a=0,b=0;
  for(const c of cells){let t=c.querySelector(':scope>.si-ab');if(!seats.includes(c)){if(t){t.remove();mark(c)}continue}
   const g=(rows.indexOf(+c.dataset.row)+cols.indexOf(+c.dataset.col))%2?'B':'A';g==='A'?a++:b++;if(!t){t=document.createElement('span');t.className='si-ab';c.append(t)}if(t.dataset.ab!==g){t.dataset.ab=g;t.textContent=g}t.setAttribute('aria-label','Gruppe '+g);mark(c)}
  return on?{a,b}:null}

 let painting=false;
 function paint(){if(painting)return;painting=true;try{
  ensureUi();const cells=[...document.querySelectorAll('.room-grid .cell')],ab=paintAB(cells);
  if(!mode){for(const c of cells)setTag(c);setLegend(ab?'Klassenarbeit: <b>Gruppe A</b> '+ab.a+' · <b>Gruppe B</b> '+ab.b+' – im Schachbrett, auch im Ausdruck':'');return}
  if(mode==='count'){const m=quarterCounts();if(!m){for(const c of cells)setTag(c);setLegend('Für diese Klasse gibt es noch keine Seite „Mündliche Mitarbeit“.');return}
   const vals=[...m.values()],avg=vals.length?vals.reduce((s,x)=>s+x,0)/vals.length:0;let zero=0,low=0;
   for(const c of cells){const p=personOf(cellName(c));if(!p){setTag(c);continue}const n=m.get(p.id)??0;const cls=n===0?'si-zero':n<avg-.5?'si-low':'';if(n===0)zero++;else if(cls)low++;setTag(c,cls,String(n),n+' mündliche Note'+(n===1?'':'n')+' im Quartal')}
   setLegend('<b>Anzahl mündlicher Noten</b> · '+esc(quarterTarget()?.label||'')+' · Ø '+fmt(avg)+(zero?' · <b>'+zero+'</b> noch ohne Note':'')+(low?' · '+low+' unter dem Schnitt':''));}
  else if(mode==='le'){const live=leLive();if(!live){for(const c of cells)setTag(c);setLegend('Für diese Klasse gibt es noch keine Lerneinheit mit gescannten Abgaben.');return}
   let fin=0,got=0;for(const c of cells){const p=personOf(cellName(c));if(!p){setTag(c);continue}const x=leFor(live,p);
    if(!x){setTag(c,absentToday(p)?'':'si-low','–','noch keine Abgabe');continue}got++;const full=live.total&&x.done>=live.total;if(full)fin++;
    setTag(c,full?'si-ok':x.done>=live.total*.6?'si-mid':'si-low',full?'fertig':x.done+'/'+live.total,x.done+' von '+live.total+' Stationen')}
   const d=live.last?new Date(live.last).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}):'';
   setLegend('<b>Lerneinheit „'+esc(live.title)+'“</b> · '+got+' Abgaben · '+fin+' fertig'+(d?' · zuletzt '+d:''));}
  else if(mode==='trend'){let up=0,down=0;for(const c of cells){const p=personOf(cellName(c));if(!p){setTag(c);continue}const t=trendOf(p);if(!t){setTag(c);continue}
    const better=t.b<t.a;better?up++:down++;setTag(c,better?'si-up':'si-down',(better?'↗ ':'↘ ')+fmt(t.a)+' → '+fmt(t.b),'mündlich: früher Ø '+fmt(t.a)+', letzte 4 Ø '+fmt(t.b))}
   setLegend('<b>Trend mündliche Mitarbeit</b> · letzte 4 Noten gegenüber den früheren im Halbjahr · '+(up||down?'<span style="color:#1f7a45">'+up+' besser</span> · <span style="color:#b42318">'+down+' schlechter</span>':'keine deutliche Veränderung'));}
 }finally{painting=false}}
 window.classroomSeatInsightsPaint=paint;

 /* ② Fair losen: rechter Teil des Würfel-Doppelschalters (Waage) */
 const SCALE='<svg class="spi" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M8 20h8M5 7h14"/><path d="M5 7l-2.5 6h5zM19 7l-2.5 6h5z"/><path d="M2.5 13a2.5 2 0 0 0 5 0M16.5 13a2.5 2 0 0 0 5 0"/></svg>';
 let fairBtn=null;
 function ensureFair(){const r=document.getElementById('randomStudentButton');if(!r)return;
  if(!fairBtn){fairBtn=document.createElement('button');fairBtn.type='button';fairBtn.id='fairRandomButton';fairBtn.className='btn btn-secondary spi-btn';fairBtn.innerHTML=SCALE;fairBtn.setAttribute('aria-label','Fair losen');
   fairBtn.title='Fair losen: Wer im gewählten Quartal seltener mündlich bewertet wurde, wird häufiger gezogen – zufällig bleibt es trotzdem.';fairBtn.addEventListener('click',()=>window.waehleZufaelligenSchueler(true))}
  if(fairBtn.disabled!==r.disabled)fairBtn.disabled=r.disabled;
  let w=r.parentElement;if(!w?.matches('.si-rsplit')){for(const o of document.querySelectorAll('.si-rsplit'))if(!o.querySelector('#randomStudentButton')&&o!==fairBtn?.parentElement)o.remove();w=document.createElement('span');w.className='si-rsplit';w.setAttribute('role','group');w.setAttribute('aria-label','Zufallsauswahl');r.before(w);w.append(r)}
  if(fairBtn.parentElement!==w||r.nextElementSibling!==fairBtn)r.after(fairBtn)}
 const origDraw=window.waehleZufaelligenSchueler;
 window.waehleZufaelligenSchueler=function(fair){
  const m=fair===true?quarterCounts():null;if(!m){const r=origDraw.call(this);ensureFair();return r}
  const kand=ermittleZufaelligeSitzplaetze();if(!kand.length){aktualisiereZufallButton();return}
  let pool=kand;if(kand.length>1&&zufallsAuswahl)pool=kand.filter(k=>k.r!==zufallsAuswahl.r||k.c!==zufallsAuswahl.c);
  const w=pool.map(k=>{const p=personOf(k.name);const n=p?(m.get(p.id)??0):0;return 1/Math.pow(1+n,2)}),sum=w.reduce((a,b)=>a+b,0);let x=Math.random()*sum,i=0;for(;i<pool.length-1;i++){x-=w[i];if(x<=0)break}
  zufallsAuswahl=pool[i];const p=personOf(zufallsAuswahl.name),n=p?(m.get(p.id)??0):0;
  const status=document.getElementById('randomStudentStatus');if(status)status.textContent='Fair gelost: '+zufallsAuswahl.name+' · bisher '+n+' Note'+(n===1?'':'n')+' im Quartal';
  initGrid();ensureFair()};
 /* 11.99: kein Beobachter auf dem ganzen Dokument mehr – der Knopf folgt der Zufallsauswahl, wenn sie (de)aktiviert wird */
 const origUpd=window.aktualisiereZufallButton;if(typeof origUpd==='function')window.aktualisiereZufallButton=function(){const r=origUpd.apply(this,arguments);ensureFair();return r};

 /* ③/④ neue Sitzverteilungen */
 function addRadios(){const sec=document.querySelector('#tab-config .seat-option-group');if(!sec||sec.querySelector('[value=klassenarbeit]'))return;
  const mk=(v,t,title)=>{const l=document.createElement('label');l.className='checkbox-label';l.title=title;l.innerHTML='<input type="radio" name="belegung" value="'+v+'"> '+t;l.querySelector('input').addEventListener('change',()=>{try{renderTischanordnungen()}catch{}});return l};
  sec.append(mk('klassenarbeit','Klassenarbeit A/B','Jede Person erhält einen eigenen Tisch; die Plätze werden im Schachbrett in Gruppe A und B eingeteilt (auch im Ausdruck).'),
   mk('lernpartner','Lernpartner nach Leistung','Paare aus stärkeren und förderbedürftigen Schüler:innen – nach der letzten Quartalsnote bzw. Klassenarbeit im Noten-Manager (sonst nach den mündlichen Noten). Tabu-Paare werden beachtet.'));
  const saved=rd(BEL_KEY,'');const r=saved&&sec.querySelector('input[value="'+saved+'"]');if(r)r.checked=true;
  sec.addEventListener('change',e=>{if(e.target.name==='belegung'){const v=e.target.value;wr(BEL_KEY,['klassenarbeit','lernpartner'].includes(v)?v:'');paint()}})}
 function pick(v){const r=document.querySelector('input[name="belegung"][value="'+v+'"]');if(r)r.checked=true}
 function partnerPairs(){const perf=performance();if(!perf)return null;
  const present=schuelerEinzel.filter(s=>istAnwesend(s)&&String(s.name||'').trim()&&!(s.anker&&String(s.anker).trim()));
  const tabu=(a,b)=>tabuPaare.some(p=>[norm(p.s1),norm(p.s2)].includes(norm(a))&&[norm(p.s1),norm(p.s2)].includes(norm(b)));
  const graded=present.filter(s=>perf.m.has(norm(s.name))).sort((a,b)=>perf.m.get(norm(a.name))-perf.m.get(norm(b.name))||Math.random()-.5),rest=present.filter(s=>!perf.m.has(norm(s.name))).sort(()=>Math.random()-.5);
  const h=Math.floor(graded.length/2),top=graded.slice(0,h),bot=graded.slice(h);
  for(let i=0;i<top.length;i++)if(tabu(top[i].name,bot[i].name)){const j=[i+1,i-1,i+2,i-2].find(j=>j>=0&&j<top.length&&!tabu(top[i].name,bot[j].name)&&!tabu(top[j].name,bot[i].name));if(j!=null)[bot[i],bot[j]]=[bot[j],bot[i]]}
  const pairs=top.map((s,i)=>({s1:s.name,s2:bot[i].name,geschlecht:s.geschlecht||''}));const left=[...bot.slice(top.length),...rest];
  while(left.length>1){const a=left.shift(),j=Math.max(0,left.findIndex(b=>!tabu(a.name,b.name)));pairs.push({s1:a.name,s2:left.splice(j,1)[0].name,geschlecht:a.geschlecht||''})}
  if(left.length)pairs.push({s1:left[0].name,s2:'',geschlecht:left[0].geschlecht||''});
  return {pairs,label:perf.label,n:top.length}}
 const origGen=window.generiereSitzplan;
 window.generiereSitzplan=function(){const v=belegung();
  if(v==='klassenarbeit'){pick('einzeln');try{origGen.apply(this,arguments)}finally{pick('klassenarbeit')}paint();const s=document.getElementById('placementStatus');if(s&&!s.hidden&&/platziert/.test(s.textContent))s.textContent=s.textContent.replace(/\.\s*$/,'')+' · Klassenarbeit: Gruppe A/B im Schachbrett.';return}
  if(v==='lernpartner'){const r=partnerPairs();if(!r){setzeBelegungsstatus('Für „Lernpartner nach Leistung“ fehlen Noten – im Noten-Manager braucht die Klasse eine Quartalsnote, Klassenarbeit oder mündliche Noten.',false);return}
   const keep=schuelerPaare,keepSave=window.datenSpeichern;schuelerPaare=r.pairs;pick('festePaare');
   window.datenSpeichern=function(){schuelerPaare=keep;return keepSave.apply(this,arguments)};
   try{origGen.apply(this,arguments)}finally{schuelerPaare=keep;window.datenSpeichern=keepSave;pick('lernpartner')}
   const s=document.getElementById('placementStatus');if(s&&!s.hidden&&/platziert/.test(s.textContent))s.textContent=s.textContent.replace(/\.\s*$/,'')+' · Lernpartner nach '+r.label+': '+r.n+' Paare stark + förderbedürftig.';paint();return}
  return origGen.apply(this,arguments)};

 /* Einbinden */
 const origPaint=window.classroomPaintAssessments;
 if(typeof origPaint==='function')window.classroomPaintAssessments=function(){const r=origPaint.apply(this,arguments);paint();return r};
 classroomHooks.add('initGrid','seat-insights: Marken',{after(){setTimeout(paint,0)}});
 addEventListener('storage',e=>{if(e.key==='classroom-lerneinheiten-v1'&&mode==='le')paint()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&mode)paint()});
 document.getElementById('klassenSelect')?.addEventListener('change',()=>setTimeout(paint,50));
 for(const id of ['classroomLessonSubject','classroomLessonGrade'])document.getElementById(id)?.addEventListener('change',()=>setTimeout(paint,0));
 classroomDate?.addEventListener('change',()=>setTimeout(paint,50));
 addRadios();paint();setTimeout(paint,800);
})();
/* 11.96: Legende als Quicklook – ⓘ am Ende jeder Leiste; Karte mit Symbol links und Titel rechts.
   Schließen: ⓘ erneut, Tipp daneben oder Esc. Knöpfe im Menü „Mehr“ erscheinen blasser. */
(()=>{
 const INFO='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/></svg>';
 const st=document.createElement('style');st.textContent=
  'html body .classroom-plan-actions>.student-finder:not(#_):not(#__):not(#___){width:40px!important;min-width:40px!important;height:40px!important;border-radius:10px!important}html body .sp-lg-btn:not(#_):not(#__):not(#___){order:100;flex:none;width:32px!important;min-width:32px!important;height:32px!important;min-height:0!important;padding:0!important;margin:0 0 0 2px!important;border-radius:999px!important;border:1px solid #cfd8e6!important;background:#fff!important;color:#2f5f9b!important;display:inline-grid!important;place-items:center;box-shadow:none!important;cursor:pointer;align-self:center}'
  +'html body .classroom-plan-zoom>.sp-lg-btn:not(#_):not(#__):not(#___){width:40px!important;min-width:40px!important;height:40px!important;border:0!important;background:#e7edf6!important;margin-left:6px!important}'
  +'html body .sp-lg-btn[aria-expanded=true]:not(#_):not(#__):not(#___){background:#2f5f9b!important;border-color:#2f5f9b!important;color:#fff!important}.sp-lg-btn svg{width:19px;height:19px}'
  +'html.ph-lite .sp-lg-btn,html.classroom-beamer .sp-lg-btn{display:none!important}@media print{.sp-lg-btn,.sp-lg{display:none!important}}'
  +'.sp-lg{position:fixed;z-index:20000;transform:translateZ(0);background:#fff;border:1px solid #dce3ef;border-radius:14px;box-shadow:0 12px 32px rgba(35,61,96,.18);padding:9px 12px 8px;font:13px/1.3 inherit;color:#243247;min-width:230px;max-width:min(380px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;animation:spLgIn .12s ease-out}'
  +'@keyframes spLgIn{from{opacity:0;transform:translateY(var(--lg-dy,4px))}to{opacity:1;transform:none}}'
  +'.sp-lg h4{margin:0 0 5px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#66758a;display:flex;justify-content:space-between;align-items:center;gap:12px}'
  +'.sp-lg h4 button{border:0;background:none;color:#8a97aa;font-size:17px;line-height:1;padding:0 2px;cursor:pointer}'
  +'.sp-lg .r{display:flex;align-items:center;gap:9px;padding:2.5px 0;font-size:13px}.sp-lg .r.off{opacity:.5}'
  +'.sp-lg .ic{flex:none;min-width:28px;height:28px;padding:0 5px;box-sizing:border-box;border:1px solid #cfd8e6;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;gap:1px;color:#2f5f9b;font-size:12px;font-weight:700;background:#fff}'
  +'.sp-lg .ic.rd{border-radius:999px;background:#e7edf6;border-color:#e7edf6}.sp-lg .ic svg{width:17px;height:17px}.sp-lg .ic.dg{color:#b42318}.sp-lg .ic.pri{background:#2f5f9b;border-color:#2f5f9b;color:#fff;font-weight:600;font-size:11px}'
  +'.sp-lg .ic.as:before{content:"";width:16px;height:11px;border-radius:3px;background:#c8e6b0;border:2px solid #d9534f}'
  +'.sp-lg hr.lgsep{border:0;border-top:1px solid #e3e9f2;margin:6px 0}.sp-lg .ic.rd{width:29px;min-width:29px;padding:0}.sp-lg .r small{color:#66758a}.sp-lg h5{margin:8px 0 3px;padding-top:7px;border-top:1px solid #e3e9f2;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#66758a}'
  +'.sp-lg .ic.seat{position:relative;width:29px;min-width:29px;height:28px;padding:0;border:0;background:none}.sp-lg .ic.seat .tl{position:absolute;left:1px;right:3px;top:7px;bottom:4px;border-radius:5px;background:#eaf0fa;border:1px solid #8fb0dc}.sp-lg .ic.seat.wh .tl{background:#fff;border-color:#cfd8e6}.sp-lg .ic.seat.hw .tl{left:2px;right:2px;top:6px;bottom:5px;background:#fff;border:2.5px solid #c52f2f}'
  +'.sp-lg .pl{position:absolute;top:1px;right:-1px;padding:0 3px;border-radius:999px;background:#2f5f9b;color:#fff;font:700 8.5px/1.35 inherit;font-style:normal}.sp-lg .pl.or{top:auto;right:auto;bottom:0;left:-1px;background:#e39a3b;min-width:12px;text-align:center}';
 document.head.append(st);
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const svg=el=>{const s=el?.querySelector?.('svg');if(!s)return '';const c=s.cloneNode(true);c.removeAttribute('class');c.removeAttribute('style');return c.outerHTML};
 const shown=el=>!!el&&(el.offsetParent!==null||el.classList.contains('plan-actions-collapsed')||el.classList.contains('zoom-collapsed'));
 const off=el=>el.classList.contains('plan-actions-collapsed')||el.classList.contains('zoom-collapsed')||!!el.closest('.plan-actions-collapsed,.zoom-collapsed');
 const row=(icon,cls,text,isOff)=>'<div class="r'+(isOff?' off':'')+'"><span class="ic '+(cls||'')+'">'+icon+'</span><span>'+text+'</span></div>';
 function topRows(bar){const out=[],pl=[];for(const c of bar.children){if(!shown(c)||c.matches('.vp-zoom-bg,.zoom-more,.sp-lg-btn,input,output'))continue;
   if(c.matches('.plan-col-pair')){const T=['Einstellungen ein-/ausblenden','Noten der Klasse ein-/ausblenden','Spalte links/rechts tauschen'];[...c.querySelectorAll('button')].forEach((b,i)=>out.push(row(svg(b),'rd',esc(T[i]||b.getAttribute('aria-label')||''))));out.push('<hr class="lgsep">');continue}
   if(c.matches('[data-zoom-minus]')){out.push(row('−&thinsp;+','rd','Zoom: kleiner / größer'));continue}if(c.matches('[data-zoom-plus]'))continue;
   if(c.matches('[data-zoom-fit]')){out.push(row(svg(c),'rd','Einpassen',off(c)));continue}
   if(c.matches('[data-zoom-reset]')){out.push(row(svg(c),'rd','Originalgröße 100 %',off(c)));continue}
   if(c.matches('.plan-assess-switch')){out.push(row('','rd as','Bewertungen am Platz ein-/ausblenden',off(c)));continue}
   if(c.matches('.si-pill')){{const I=window.classroomSiIcons||{};pl.push(row(I.count||'123','rd','Anzahl der mündlichen Noten'),row(I.le||'LE','rd','Stand der Lerneinheit (Abgabe-QR)'),row(I.trend||'↗','rd','Trend der mündlichen Mitarbeit'))};continue}
   const t=c.getAttribute('aria-label')||c.textContent.trim();if(t)out.push(row(svg(c)||esc(t.slice(0,3)),'rd',esc(t),off(c)))}
  /* 13.08: Markierungen an den Plätzen erklären */
  out.push('<h5>Am Platz</h5>',...pl,row('<i class="tl"></i><i class="pl">2/3</i>','seat','Erst 2 von 3 mündlichen Noten'),
   row('<i class="tl"></i><i class="pl or">M</i>','seat wh','Material fehlt'),row('<i class="tl"></i>','seat hw','Hausaufgabe fehlt'));
  return out}
 function botRows(bar){const out=[];const lab=b=>b.getAttribute('aria-label')||b.textContent.trim();
  for(const c of bar.children){if(!shown(c)||c.matches('.plan-actions-more,.sp-lg-btn,#studentSearchInput,.plan-actions-sep'))continue;const o=off(c);
   if(c.matches('.plan-actions-right')){const v=c.querySelector('#classroomStartButton');if(v)out.push(row('Verteilen','pri','Schüler auf die Tische verteilen'));continue}
   if(c.matches('.si-rsplit')){const [a,b]=c.querySelectorAll(':scope>.btn');if(a)out.push(row(svg(a),'','Zufallsauswahl – zufällig',o));if(b)out.push(row(svg(b),'','Fair losen – selten Bewertete häufiger',o));continue}
   if(c.matches('.classroom-roll-split')){out.push(row('↓↑','','Reihen rollen – nach unten / oben',o));continue}
   const b=c.matches('button')?c:c.querySelector('button.btn,button');if(!b)continue;const t=lab(b);
   out.push(row(svg(b)||esc(t.slice(0,3)),/Reset|Clear/.test(b.id)?'dg':'',esc(t),o))}
  return out}
 let pop=null,owner=null;
 function close(){pop?.remove();pop=null;owner?.setAttribute('aria-expanded','false');owner=null}
 function open(btn,top){close();const bar=btn.closest('.classroom-plan-zoom,.classroom-plan-actions');if(!bar)return;
  pop=document.createElement('div');pop.className='sp-lg';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Legende');
  pop.innerHTML='<h4>'+(top?'Ansicht (oben)':'Aktionen (unten)')+'<button type="button" aria-label="Legende schließen">×</button></h4>'+(top?topRows(bar):botRows(bar)).join('');
  pop.querySelector('h4 button').onclick=close;document.body.append(pop);owner=btn;btn.setAttribute('aria-expanded','true');
  const r=btn.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;/* 12.19: im Sitzplan-Kasten bleiben – Safari malte die Notenspalte daneben über die Legende */const cb=btn.closest('.grid-container')?.getBoundingClientRect(),L=cb&&cb.width>=w+16?Math.max(8,cb.left):8,R=cb&&cb.width>=w+16?Math.min(innerWidth,cb.right):innerWidth;let left=Math.min(R-w-8,Math.max(L+8,r.left+r.width/2-w/2));
  let y=top?r.bottom+8:r.top-h-8;if(!top&&y<8)y=r.bottom+8;if(top&&y+h>innerHeight-8&&r.top-h-8>8)y=r.top-h-8;
  pop.style.left=left+'px';pop.style.top=Math.max(8,y)+'px';pop.style.setProperty('--lg-dy',(y<r.top?'4px':'-4px'))}
 function mk(id,top){const b=document.createElement('button');b.type='button';b.id=id;b.className='sp-lg-btn';b.innerHTML=INFO;b.setAttribute('aria-label','Legende');b.title='Legende: was die Symbole dieser Leiste bedeuten';b.setAttribute('aria-expanded','false');
  b.addEventListener('click',e=>{e.stopPropagation();if(owner===b)close();else open(b,top)});return b}
 const btnTop=mk('spLegendView',true),btnBot=mk('spLegendActions',false);
 function ensure(){const z=document.querySelector('.classroom-plan-zoom'),a=document.querySelector('.classroom-plan-actions');
  if(z&&btnTop.parentElement!==z)z.append(btnTop);if(a&&btnBot.parentElement!==a)a.append(btnBot)}
 document.addEventListener('pointerdown',e=>{if(pop&&!pop.contains(e.target)&&!e.target.closest?.('.sp-lg-btn'))close()},true);
 document.addEventListener('keydown',e=>{if(pop&&e.key==='Escape')close()});
 addEventListener('resize',close);addEventListener('scroll',e=>{if(pop&&!pop.contains(e.target))close()},true);
 classroomHooks.add('initGrid','seat-insights: Legende',{after(){setTimeout(ensure,0)}});
 window.classroomLegendEnsure=ensure;/* 11.99: Aufruf nach jedem Neuaufbau der Leisten (initGrid, Zeichnen der Marken) statt per Dokument-Beobachter */
 ensure();setTimeout(ensure,800);
})();

/* 12.08: einheitliche Knopfgröße 40 px in beiden Leisten */
(function(){const st=document.createElement('style');st.id='cm-btn40';st.textContent='html body .classroom-plan-zoom>:is([data-zoom-fit],[data-zoom-reset],[data-zoom-minus],[data-zoom-plus],output):not(#_):not(#__):not(#___):not(#____){height:40px!important}html body .classroom-plan-zoom>.vp-zoom-bg:not(#_):not(#__){height:40px!important}html body label.plan-assess-switch:not(#_):not(#__):not(#___){border-radius:999px!important;background:#e7edf6!important;border:0!important}html body label.plan-assess-switch:not(#_):not(#__):not(#___):has(input:not(:checked)){border:1.5px solid #d97f06!important;background:#fde0b8!important}html body .classroom-plan-zoom:not(#_):not(#__){justify-content:flex-start!important}html body .classroom-plan-zoom>.zoom-more:not(#_):not(#__):not(#___){order:90!important}html body .classroom-plan-zoom>.sp-lg-btn:not(#_):not(#__):not(#___):not(#____){order:95!important}html body .classroom-plan-zoom>.plan-col-pair:not(#_):not(#__):not(#___):not(#____){order:300!important;margin-left:auto!important}/* 12.50: Leiste mittig, Dreifachschalter auf der Seite des Seitenmenüs – im Fluss mit gleich breitem Platzhalter gegenüber (kein Überlappen, Einklappen greift) */html body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row:not(#_):not(#__){justify-content:safe center!important}html body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row>.plan-col-pair:not(#_):not(#__):not(#___):not(#____):not(#_____){position:static;order:-1!important;margin:0 auto 0 0!important}html body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row:not(#_):not(#__)::after{content:"";flex:0 1 124px;min-width:0;order:999;margin-left:auto}html.cm-side-right body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row>.plan-col-pair:not(#_):not(#__):not(#___):not(#____):not(#_____){order:999!important;margin:0 0 0 auto!important}html.cm-side-right body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row:not(#_):not(#__)::after{order:-1;margin-left:0;margin-right:auto}/* 12.47: alle Umschalter gleich – Kreis 38×34 mit 3 px Rand */html body .classroom-plan-zoom .si-pill:not(#_):not(#__){padding:3px!important;gap:0!important;height:40px!important;box-sizing:border-box!important;align-items:center}html body .classroom-plan-zoom .si-pill>button:not(#_):not(#__):not(#___){width:38px!important;min-width:38px!important;height:34px!important;min-height:0!important;padding:0!important}html body .classroom-plan-zoom>.si-pill:not(#_):not(#__):not(#___){box-sizing:border-box!important;height:40px!important;padding:3px!important}html body .si-pill>button:not(#_):not(#__){height:34px!important}html body .classroom-plan-zoom .plan-col-pair:not(#_):not(#__):not(#___):not(#____){height:34px!important;box-sizing:content-box!important}html body .classroom-plan-zoom .plan-col-pair>button:not(#_):not(#__):not(#___):not(#____){height:34px!important}html body :is(.zoom-more-toggle,.plan-actions-more-toggle):not(#_):not(#__):not(#___){width:40px!important;min-width:40px!important;height:40px!important;min-height:40px!important;border-radius:10px!important}html body .classroom-plan-actions>.spi-btn:not(#_):not(#__):not(#___){width:40px!important;min-width:40px!important;height:40px!important;border-radius:10px!important}html body .classroom-plan-actions>.student-finder:not(#_):not(#__):not(#___){width:40px!important;min-width:40px!important;height:40px!important;border-radius:10px!important}html body .sp-lg-btn:not(#_):not(#__):not(#___){width:40px!important;height:40px!important;min-width:40px!important}';const add=()=>document.head.appendChild(st);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();window.addEventListener('load',add);})();
;
