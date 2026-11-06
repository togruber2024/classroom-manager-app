/* ==== ui-dialogs.js ==== */
/* Speicher-Schutz für Anzeige-Einstellungen: Ist der Browserspeicher voll, merken sich Schalter wie Fortschritt, Schraffur/Rahmen,
   „1. Quartal“ oder Notengrenzen-Aufklappen ihren Zustand im Arbeitsspeicher, statt still zu scheitern. Noten und andere Daten sind
   ausdrücklich NICHT betroffen – dort bleibt die Fehlermeldung bestehen, damit nichts unbemerkt verloren geht. */
(()=>{try{const P=Storage.prototype;if(P.__classroomGuard)return;P.__classroomGuard=true;const set=P.setItem,get=P.getItem,rem=P.removeItem,mem=new Map();
 const ui=k=>/^classroom-(previous-quarter:|progress-v1$|ng-open-v1$|ov-mean-v1$|hatch-style-v1$|manager-hatching-v1$|manager-theme-v1$|mm-last-v1$)/.test(String(k));
 P.setItem=function(k,v){try{set.call(this,k,v);if(this===window.localStorage)mem.delete(String(k))}catch(e){if(this===window.localStorage&&ui(k)){mem.set(String(k),String(v));return}throw e}};
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
   const p=document.createElement('p');p.className='ui-dialog-text';p.textContent=String(text??'');d.append(p);
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
 window.classroomAlert=(text,opts)=>open('alert',text,opts);
 window.classroomConfirm=(text,opts)=>open('confirm',text,opts);
 window.classroomPrompt=(text,value='',opts={})=>open('prompt',text,{...opts,value});
 window.alert=text=>{if(!document.body){nativeAlert(text);return}open('alert',text)};
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
 const NAME='html.classroom-privacy :is(input[type=text],input:not([type]),input[type=search],textarea):not(.task-name-input):not(.task-label-input):not([data-exam-topic-field]):not(.help-search):not([data-test-name]):not([name=testPass]):not(.ui-dialog input)';
 const T=':is(.task-table,.homework-table,.compact-entry-table,.test-detail-results)';
 const CELL=':is(span,input,select,button,label):not(.task-remove):not(.student-remove-button):not(.task-add-button):not(:has(*))';
 const GRADE='html.classroom-privacy '+T+' tbody td:not(:first-child) '+CELL+',html.classroom-privacy '+T+' tbody .task-end-grade,html.classroom-privacy .so-val';
 function css(seed){
  /* 8.21: echte Zufallsfarben je Einschalten (Zufallsgenerator mit großem Startwert statt nur 5 verschobener Muster) */
  let t=(seed>>>0)||1;const rnd=()=>{t+=0x6D2B79F5;let x=Math.imul(t^t>>>15,t|1);x^=x+Math.imul(x^x>>>7,x|61);return ((x^x>>>14)>>>0)/4294967296},pick=()=>PAL[Math.floor(rnd()*5)];
  let rules=NAME+','+NAME+'::placeholder,html.classroom-privacy '+T+' tbody :is(td,th):first-child,html.classroom-privacy .room-grid .cell,html.classroom-privacy .classroom-quick-heading,html.classroom-privacy .student-finder-list,html.classroom-privacy #randomStudentStatus,html.classroom-privacy .student-overview .so-list ol,html.classroom-privacy .student-overview .so-list ol *,html.classroom-privacy .student-overview .so-profile :is(h2,h3,p,span,td,th,li,strong,em),html.classroom-privacy .parent-mail-text,html.classroom-privacy [data-parent-mail-student]{color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.75)!important;-webkit-user-select:none!important;user-select:none!important}'
  +'html.classroom-privacy '+T+' tbody :is(td,th):first-child :is(input,button),html.classroom-privacy [data-student-name]{pointer-events:none!important}'
  +GRADE+'{color:transparent!important;text-shadow:0 0 8px rgba(36,51,71,.6)!important;background-image:none!important;border-color:transparent!important;pointer-events:none!important;filter:saturate(.8)}'
  +'html.classroom-privacy '+T+' tbody td{color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.6)!important;background-color:transparent!important;background-image:none!important}'
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
  rules+='html.classroom-privacy :is(.qs-name,.qd-title b,.qs-stand,.qs-note,.tt-row b,.tt-last b){color:transparent!important;text-shadow:0 0 7px rgba(36,51,71,.75)!important;-webkit-user-select:none!important;user-select:none!important}'
   +'html.classroom-privacy :is(.qs-big,.qs-val i,.qs-sq i,.qs-q1chip i,.qd-val,.qs-miss-n,.qs-chip i){color:transparent!important;text-shadow:0 0 8px rgba(36,51,71,.6)!important;background-image:none!important;box-shadow:none!important;border-color:transparent!important}'
   +'html.classroom-privacy :is(.qs-card,.qd-panel){pointer-events:none!important}html.classroom-privacy .qd-head{pointer-events:auto!important}';
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
  if(button){button.setAttribute('aria-pressed',String(on));button.classList.toggle('is-on',on);const slash=button.querySelector('.privacy-slash');if(slash)slash.style.display=on?'':'none';button.title=on?'Datenschutzmodus ist aktiv – klicken zum Beenden':'Datenschutzmodus: Namen unscharf, Bewertungen unkenntlich (zum Vorführen)'}
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
  +'@media print{.classroom-privacy-banner{display:none}}';(document.head||document.documentElement).append(st)}
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

        function sitzplatzKurzname(name) {
            const normalize = value => String(value || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('de-DE');
            const group = typeof classroomCurrentGroup === 'function' ? classroomCurrentGroup() : null;
            const names = [...(group?.students.filter(person => !person.deleted).map(person => person.name) || []), ...schuelerEinzel.map(person => person.name), ...schuelerPaare.flatMap(pair => [pair.s1, pair.s2]), ...gridData.flat()];
            const people = new Map();
            for (const value of names) {
                const full = String(value || '').trim(), key = normalize(full);
                if (!key || ['X', 'PULT'].includes(full) || people.has(key)) continue;
                const comma = full.indexOf(',');
                const parts = full.split(/\s+/);
                const first = comma >= 0 ? full.slice(comma + 1).trim() || full.slice(0, comma).trim() : parts.shift();
                const last = comma >= 0 ? full.slice(0, comma).trim() : parts.join(' ');
                people.set(key, {first, last});
            }
            const person = people.get(normalize(name));
            if (!person) return String(name || '');
            const duplicate = [...people.values()].filter(other => normalize(other.first) === normalize(person.first)).length > 1;
            return person.first + (duplicate && person.last ? ' ' + Array.from(person.last)[0].toLocaleUpperCase('de-DE') + '.' : '');
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
            const suchtext = suchbegriffSchueler.toLocaleLowerCase('de');
            grid.classList.toggle('search-active', Boolean(suchtext));
            const treffer = [];
            grid.querySelectorAll('.cell').forEach(cell => {
                cell.classList.remove('search-match');
                const zeile = gridData[Number(cell.dataset.row)];
                const wert = zeile ? zeile[Number(cell.dataset.col)] : '';
                if (suchtext && wert && wert !== 'X' && wert !== 'PULT' && String(wert).toLocaleLowerCase('de').includes(suchtext)) {
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
                const inListe = namen.some(name => String(name).toLocaleLowerCase('de').includes(suchtext));
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
                if (s.abwesend && s.name && s.name.trim()) abwesendeNamen.add(s.name.trim().toLocaleLowerCase('de'));
            });
            schuelerPaare.forEach(p => {
                if (p.s1Abwesend && p.s1 && p.s1.trim()) abwesendeNamen.add(p.s1.trim().toLocaleLowerCase('de'));
                if (p.s2Abwesend && p.s2 && p.s2.trim()) abwesendeNamen.add(p.s2.trim().toLocaleLowerCase('de'));
            });

            const kandidaten = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const name = gridData[r][c];
                    if (name && name !== 'X' && name !== 'PULT' && name.trim() && !abwesendeNamen.has(name.trim().toLocaleLowerCase('de'))) {
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
            saveLayoutButton.textContent = 'Vorlage speichern';
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
            const name = decodeURIComponent(nameKodiert).trim().toLocaleLowerCase('de');
            if (quelle === 'einzel') schuelerEinzel[index].abwesend = abwesend;
            if (quelle === 'paare1') schuelerPaare[index].s1Abwesend = abwesend;
            if (quelle === 'paare2') schuelerPaare[index].s2Abwesend = abwesend;

            if (name) {
                schuelerEinzel.forEach(s => {
                    if ((s.name || '').trim().toLocaleLowerCase('de') === name) s.abwesend = abwesend;
                });
                schuelerPaare.forEach(p => {
                    if ((p.s1 || '').trim().toLocaleLowerCase('de') === name) p.s1Abwesend = abwesend;
                    if ((p.s2 || '').trim().toLocaleLowerCase('de') === name) p.s2Abwesend = abwesend;
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
            const normalize=v=>String(v||'').normalize('NFC').trim().toLocaleLowerCase('de-DE');
            const matches=classroomSuggestionPeople().filter(p=>normalize(p.label)===normalize(value));
            return matches.length===1?matches[0].name:value;
        }
        function classroomSuggestNames(value='') {
            let list=document.getElementById('classroomRosterNames');
            if(!list){list=document.createElement('datalist');list.id='classroomRosterNames';document.body.append(list)}
            const normalize=v=>String(v||'').normalize('NFC').trim().toLocaleLowerCase('de-DE'),query=normalize(value);
            const candidates=classroomSuggestionPeople().filter(p=>!query||normalize(p.label).startsWith(query)).sort((a,b)=>a.label.localeCompare(b.label,'de-DE'));
            list.replaceChildren(...candidates.map(person=>{const option=document.createElement('option');option.value=person.label;return option}));
        }
        const classroomNamePopup=document.createElement('div');classroomNamePopup.className='classroom-name-suggestions';classroomNamePopup.hidden=true;classroomNamePopup.setAttribute('role','listbox');document.body.append(classroomNamePopup);
        let classroomNameInput=null,classroomNameOptions=[],classroomNameIndex=-1;
        function classroomHideNames(){classroomNamePopup.hidden=true;if(classroomNameInput)classroomNameInput.setAttribute('aria-expanded','false');classroomNameInput=null;classroomNameIndex=-1}
        function classroomChooseName(index){const input=classroomNameInput,person=classroomNameOptions[index];if(!input||!person)return;input.value=person.label;classroomHideNames();input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));classroomHideNames();input.blur()}
        function classroomShowNames(input){
            const query=input.value.normalize('NFC').trim().toLocaleLowerCase('de-DE');if(!query){classroomHideNames();return}
            classroomNameOptions=classroomSuggestionPeople().filter(p=>p.label.normalize('NFC').toLocaleLowerCase('de-DE').startsWith(query)).sort((a,b)=>a.label.localeCompare(b.label,'de-DE'));if(!classroomNameOptions.length){classroomHideNames();return}
            classroomNameInput=input;classroomNameIndex=-1;classroomNamePopup.replaceChildren();classroomNameOptions.forEach((person,index)=>{const button=document.createElement('button');button.type='button';button.textContent=person.label;button.setAttribute('role','option');button.setAttribute('aria-selected','false');button.onpointerdown=e=>{e.preventDefault();classroomChooseName(index)};classroomNamePopup.append(button)});
            const rect=input.getBoundingClientRect();classroomNamePopup.style.left=rect.left+'px';classroomNamePopup.style.top=(rect.bottom+3)+'px';classroomNamePopup.style.width=rect.width+'px';classroomNamePopup.hidden=false;input.setAttribute('aria-expanded','true');input.setAttribute('aria-autocomplete','list');
        }
        for(const eventName of ['focusin','input'])document.addEventListener(eventName,event=>{if(event.target.matches('input[data-classroom-suggest]'))classroomShowNames(event.target)});
        document.addEventListener('focusout',event=>{if(event.target===classroomNameInput)setTimeout(classroomHideNames,100)});
        document.addEventListener('pointerdown',event=>{if(!classroomNamePopup.contains(event.target)&&event.target!==classroomNameInput)classroomHideNames()},true);
        document.addEventListener('keydown',event=>{if(event.target!==classroomNameInput||classroomNamePopup.hidden)return;if(event.key==='Escape'){classroomHideNames();return}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();classroomNameIndex=(classroomNameIndex+(event.key==='ArrowDown'?1:-1)+classroomNameOptions.length)%classroomNameOptions.length;[...classroomNamePopup.children].forEach((button,i)=>button.setAttribute('aria-selected',String(i===classroomNameIndex)))}else if(event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();classroomChooseName(classroomNameIndex<0?0:classroomNameIndex)}},true);
        window.addEventListener('resize',classroomHideNames);window.addEventListener('scroll',classroomHideNames,true);

        function classroomPairKey(pair){
            const names=[pair.s1,pair.s2].map(value=>classroomNameFromSuggestion(value||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE'));
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
            let htmlE = '<tr><th style="width:25px;"></th><th>Name</th><th class="student-centered-cell">Anker</th></tr>';
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
const normalize=value=>String(value||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE');
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
 return new Map([...people].map(([key,person])=>[key,person.first+(counts.get(normalize(person.first))>1&&person.last?' '+Array.from(person.last)[0].toLocaleUpperCase('de-DE')+'.':'')]));
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
function classroomNormalizeName(name){return String(name||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE')}
function classroomReadArray(key){const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}
const classroomOriginalClassDropdown=aktualisiereKlassenDropdown;
aktualisiereKlassenDropdown=function(){
  classroomOriginalClassDropdown();
  const links=classroomReadLinks();
  const byName=new Map(Object.values(links).map(item=>[item.storageName,item.label]));
  for(const option of document.getElementById('klassenSelect')?.options||[])if(byName.has(option.value))option.textContent=byName.get(option.value);
  const title=document.getElementById('titelKlasse');if(title&&byName.has(aktuelleKlasse))title.textContent='Klassenraum ('+byName.get(aktuelleKlasse)+')';
};
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
    if(grid)localStorage.setItem(prefix+'grid',JSON.stringify(grid));
    if(!klassenListe.includes(storageName))klassenListe.push(storageName);
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
  const classes=msg.model.classes.filter(g=>activeIds.has(g.id)).map(g=>({id:g.id,label:g.name,subject:'',students:g.students.filter(s=>!s.deleted).map(s=>({id:s.id,name:s.name,gender:s.gender||''}))}));
  // Keep a manually selected seating class when only an attendance/value update arrives.
  const active=msg.model.sourceClasses[msg.snapshot.activeClass];
  const shouldFollow=classroomLastSource!==msg.snapshot.activeClass;
  classroomLastSource=msg.snapshot.activeClass;
  classroomSyncRosters({classes,activeClass:shouldFollow?active:classroomCurrentGroup()?.id||active});
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
}


function classroomShortSeatName(name){
 const group=classroomCurrentGroup();
 const names=[...(group?.students.filter(s=>!s.deleted).map(s=>s.name)||[]),...schuelerEinzel.map(s=>s.name),...schuelerPaare.flatMap(p=>[p.s1,p.s2]),...gridData.flat()];
 return ClassroomCore.seatNameLabels(names).get(ClassroomCore.normalize(name))||name;
}

window.addEventListener('message',event=>{if(event.source===parent&&event.data?.type==='classroom:print'){window.focus();window.print()}});

// Use the selected class and lesson date for the browser's PDF filename.
(()=>{
 function printTitle(){
  const name=String(classroomCurrentGroup()?.name||aktuelleKlasse||'Klasse').trim().replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,'-');
  const date=classroomDate.value||new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  document.title='Sitzplan_'+name+'_'+date;
  const label=String(classroomCurrentGroup()?.name||aktuelleKlasse||'Klasse').trim().replace(/^Klasse\s*/i,'');const header=document.querySelector('.room-header');const roomName=document.getElementById('classroomRoomSelect')?.selectedOptions[0]?.textContent?.trim();const roomLabel=roomName?(/^Raum\b/i.test(roomName)?roomName:'Raum '+roomName):'';if(header)header.dataset.printTitle='Sitzplan – '+label+(roomLabel?' ('+roomLabel+')':'');
 }
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
function quickClose(){classroomQuick.hidden=true;quickPerson=null;if(typeof qeLayout==='function'){qeLayout();qeMarkCurrent()}}

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
 if(quickPending)return;
 classroomRefreshLesson();const group=classroomCurrentGroup();quickPerson=group?.students.find(s=>!s.deleted&&ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name));if(!quickPerson)return;
 document.getElementById('classroomQuickName').textContent=classroomShortSeatName(name);classroomQuick.title=quickPerson.name;classroomQuick.hidden=false;quickReadValues();
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
 const group=classroomCurrentGroup(),requestId=crypto.randomUUID();quickCloseAfterSave=!qeSheet();quickPending=requestId;materialButton.disabled=true;quickGrade.disabled=true;quickHomework.disabled=true;homeworkButton.disabled=true;quickStatus.textContent='Wird gespeichert …';
 parent.postMessage({type:'classroom:save-record',requestId,payload:{classId:group.id,studentId:quickPerson.id,sourceClass:lessonSubject.value,date:classroomDate.value,attendanceChanged:false,gradePage:lessonGrade.value,grade:type==='grade'?(Array.from(quickGrade.querySelectorAll('button')).find(button=>button.value===quickGrade.value)?.dataset.ratingSymbol||''):quickGrade.value,gradeChanged:type==='grade',homeworkPage:lessonHomework.value,homework:quickHomework.checked?'missing':'done',materialPage:classroomMaterialTarget()?.key,material:quickMaterialMissing?'missing':'done',materialChanged:type==='material',homeworkChanged:type==='homework',initializeHomework:type==='homework'&&quickHomework.checked}},'*');
}
quickHomework.onchange=()=>quickSave('homework');
quickAbsent.onchange=()=>{if(!quickPerson||quickPending)return;const group=classroomCurrentGroup(),absent=quickAbsent.checked;group.attendance??={};group.attendance[classroomDate.value]??={};group.attendance[classroomDate.value][quickPerson.id]=absent;parent.postMessage({type:'classroom:attendance',classId:group.id,studentId:quickPerson.id,date:classroomDate.value,absent},'*');classroomMarkAbsent();if(qeSheet()){quickReadValues();qeMarkCurrent()}else quickClose()};
window.addEventListener('message',event=>{if(event.source!==parent||event.data?.type!=='classroom:save-result'||event.data.requestId!==quickPending)return;quickPending=null;if(event.data.ok&&event.data.historyContext){classroomLastSavedGrade=event.data.historyContext;classroomRefreshLesson()}if(event.data.ok&&quickCloseAfterSave){quickCloseAfterSave=false;quickClose();return}quickCloseAfterSave=false;quickReadValues();quickStatus.textContent=event.data.ok?'Gespeichert':event.data.message||'Speichern fehlgeschlagen. Bitte erneut auswählen.'});
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
  cell.classList.remove('classroom-seat-assessed','classroom-seat-homework-missing');cell.style.removeProperty('--seat-grade-background');cell.style.removeProperty('--seat-grade-ink');
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
 if(reset){reset.disabled=!editing&&(!!quickPending||!lessonSubject.value);reset.title=editing?'Raum zurücksetzen':'Bewertungen und Hausaufgabeneinträge für das ausgewählte Datum zurücksetzen'}
}
const classroomRecordUndoUpdate=aktualisiereUndoButton;aktualisiereUndoButton=function(){classroomRecordUndoUpdate();classroomUpdateRecordButtons()};
async function classroomLessonHistoryAction(action){
 if(quickPending)return;
 if(action==='reset'&&!await classroomConfirm('Alle mündlichen Bewertungen und Hausaufgabeneinträge für '+classroomDate.value.split('-').reverse().join('.')+' im ausgewählten Fach und den ausgewählten Bewertungsseiten zurücksetzen? Namen und Sitzplan bleiben erhalten.'))return;
 const group=classroomCurrentGroup(),person=group?.students.find(s=>!s.deleted);if(!person)return;
 quickClose();quickPending=crypto.randomUUID();quickCloseAfterSave=false;
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
;

/* ==== sitzplan/student-notes.js ==== */
/* Notizen (aus dem Noten-Manager, notenrechner-notizen-v1) im Sitzplan zeigen:
   orangener Punkt am Tisch der Person, Notiztext oben im Bewertungsfenster.
   Es zählen alle Fächer/Kurse, die mit der aktuellen Lerngruppe verknüpft sind. Nur Anzeige – bearbeitet wird im Noten-Manager. */
(()=>{
 const KEY='notenrechner-notizen-v1';
 const norm=n=>String(n||'').trim().toLocaleLowerCase('de-DE');
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
 const cell=event.target.closest('.room-grid .cell');if(!cell||document.getElementById('classroomEditRoom')?.checked||event.button!==0||event.isPrimary===false)return;
 // In lesson mode an empty field must not start the table painting tool.
 event.preventDefault();event.stopImmediatePropagation();
 const r=Number(cell.dataset.row),c=Number(cell.dataset.col),name=gridData[r]?.[c];if(name==='X'){classroomSeatAssignmentMode=false;classroomAssignEmptySeat(r,c);const button=document.querySelector('[data-assign-student]');if(button){button.textContent='Schüler zuweisen';button.setAttribute('aria-pressed','false')}return}if(!name||name==='PULT')return;
 classroomClearSeatDrag();classroomSeatDrag={id:event.pointerId,source:cell,r,c,name,className:aktuelleKlasse,startX:event.clientX,startY:event.clientY,moved:false,target:null,ghost:null};
 try{cell.setPointerCapture(event.pointerId)}catch{}
},true);
document.addEventListener('pointermove',event=>{
 const state=classroomSeatDrag;if(!state||event.pointerId!==state.id)return;
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
 let originalCss=null;
 function apply(name){
  if(!palettes[name])return;current=name;const p=palettes[name];
  if(originalCss===null){originalCss=[...document.styleSheets].filter(sheet=>sheet.ownerNode?.id!=='classroomThemeStyle'&&!sheet.ownerNode?.hasAttribute?.('data-privacy')/* 8.21: Datenschutz-Zufallsfarben nicht einfrieren */).map(sheet=>{try{return [...sheet.cssRules].map(rule=>rule.cssText).join('\n')}catch{return ''}}).join('\n')}
  const colors={'#2f5f9b':p.accent,'#244c80':p.dark,'#f6f8fc':p.bg,'#eaf0fa':p.pale,'#e7edf6':p.tabs,'#dce3ef':p.line,'#dce3df':p.line,'#a8bdd8':p.border,'#a8bfdc':p.border,'#b9cbe4':p.border,'#cbd6e5':p.line,'#d7e2f1':p.line,'#e4e8ee':p.tabs,'#e5edf9':p.pale,'#eef3fb':p.pale,'#f7f9fc':p.bg,'#f3f6fb':p.bg,'#243247':p.ink,'#24334b':p.ink,'#243247':p.ink,'#66758a':p.muted,'#405671':p.accent,'#8ba9d1':p.border,'#86acf0':p.border,'#bac9de':p.border,'#eaf1fb':p.pale,'#eef4fc':p.pale,'#d3e1f4':p.line,'#9fb8da':p.border,'#b9c6d8':p.border,'#8fb0dc':p.border,'#b9cde8':p.border,'#36557d':p.dark,'#d6dde8':p.line,'#e3e8f0':p.line,'#e6ebf3':p.line,'#edf1f6':p.line,'#f8fafd':p.bg,'#f6f8fc':p.bg,'#8794a7':p.muted,'#c5d3e6':p.border,'#e9edf3':p.tabs,'#abc1df':p.border};
  const expanded={};for(const [from,to] of Object.entries(colors)){expanded[from]=to;expanded[from+'20']=to+'20';expanded[from+'30']=to+'30';expanded[from+'55']=to+'55'}
  let style=document.getElementById('classroomThemeStyle');if(!style){style=document.createElement('style');style.id='classroomThemeStyle';document.head.append(style)}
  style.textContent=originalCss.replace(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi,(match,r,g,b)=>{const hex='#'+[r,g,b].map(value=>Number(value).toString(16).padStart(2,'0')).join('');return expanded[hex]||match}).replace(/#[\da-f]{3,8}\b/gi,color=>expanded[color.toLowerCase()]||color)+`\n:root{--green:${p.accent};--primary:${p.accent};--primary-hover:${p.dark};--primary-color:${p.accent};--bg:${p.bg};--bg-color:${p.bg};--pale:${p.pale};--line:${p.line};--border-color:${p.line};--ink:${p.ink};--text-main:${p.ink};--muted:${p.muted}}`;
  if(style.nextElementSibling)document.head.append(style);document.documentElement.dataset.theme=name;
  document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===name)));
 }
 apply(current);
 /* Später eingefügte Stile (z. B. aus Zusatzmodulen) ebenfalls umfärben, sonst bleiben blaue Flächen. */
 let restyle=0;new MutationObserver(ms=>{if(!ms.some(m=>[...m.addedNodes].some(n=>(n.tagName==='STYLE'&&n.id!=='classroomThemeStyle')||(n.tagName==='LINK'&&/stylesheet/.test(n.rel||'')))))return;cancelAnimationFrame(restyle);restyle=requestAnimationFrame(()=>{originalCss=null;apply(current)})}).observe(document.head,{childList:true});
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
;

/* ==== sitzplan/plan-zoom.js ==== */
// Zoom only the seats and coordinate headings; controls remain full size.
(()=>{
 const grid=document.getElementById('roomGrid');if(!grid)return;
 const mobileDevice=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(/Mac/i.test(navigator.platform)&&navigator.maxTouchPoints>1);
 // iPhone: ohne Spaltenbuchstaben und Reihennummern – mehr Platz für die Tische.
 const PH=matchMedia('(max-width:540px) and (orientation:portrait), (max-height:500px) and (pointer:coarse) and (orientation:landscape)'),hw=()=>PH.matches?0:35,hh=()=>PH.matches?0:45;
 let scale=1,fit=false,auto=true,rotated=false;// auto: Desktop und iPad quer 100 %, iPad/iPhone hochkant einpassen, falls 100 % zu groß
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
  if(assessmentInput.checked!==assessmentsVisible)assessmentInput.checked=assessmentsVisible;
 }
 assessmentInput.onchange=()=>{assessmentsVisible=assessmentInput.checked;localStorage.setItem('classroom-seat-assessments-visible',String(assessmentsVisible));updateAssessmentVisibility()};
 controls.append(assessmentSwitch);updateAssessmentVisibility();
 const assessmentStyle=document.createElement('style');assessmentStyle.textContent='.classroom-assessments-hidden .room-grid .classroom-seat-assessed{background:#fff!important;background-image:none!important;color:#24334b!important}.classroom-assessments-hidden .room-grid .classroom-seat-homework-missing::after{display:none!important}';assessmentStyle.textContent+='.plan-assess-switch{display:inline-flex;align-items:center;gap:9px;min-height:36px;padding:0 6px;color:var(--muted,#66758a);font-size:13.6px;font-weight:600;white-space:nowrap;cursor:pointer;user-select:none}'
  +'.plan-assess-switch input{appearance:none;-webkit-appearance:none;position:relative;flex:0 0 42px;width:42px;height:25px;margin:0;padding:0;border:0;border-radius:999px;background:#c8d2e0;cursor:pointer;transition:background .18s ease}'
  +'.plan-assess-switch input::before{content:"";position:absolute;top:3px;left:3px;width:19px;height:19px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #1c2b4635;transition:transform .18s ease}'
  +'.plan-assess-switch input:checked{background:var(--primary,#2f5f9b)}.plan-assess-switch input:checked::before{transform:translateX(17px)}'
  +'.plan-assess-switch input:focus-visible{outline:3px solid #8ba9d1;outline-offset:2px}'
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
  const rotate=grid.querySelector('#classroomRotateButton');if(rotate){rotate.setAttribute('aria-pressed',String(rotated));rotate.textContent='Perspektive';rotate.title=rotated?'Schülerperspektive aktiv – zur Lehrerperspektive wechseln':'Lehrerperspektive aktiv – zur Schülerperspektive wechseln'}
  const occupied=[...board.querySelectorAll('.cell')].filter(cell=>!!gridData[Number(cell.dataset.row)]?.[Number(cell.dataset.col)]);
  if(occupied.length){
   const cols=occupied.map(cell=>parseInt(cell.style.gridColumn,10)),rows=occupied.map(cell=>parseInt(cell.style.gridRow,10)),left=Math.min(...cols),top=Math.min(...rows),width=(Math.max(...cols)-left)*80+75,height=(Math.max(...rows)-top)*50+45,printScale=Math.min((184*96/25.4)/width,(215*96/25.4)/height);
   board.style.setProperty('--print-seat-left',-(hw()+5+(left-2)*80)+'px');board.style.setProperty('--print-seat-top',-(hh()+5+(top-2)*50)+'px');board.style.setProperty('--print-seat-scale',printScale);viewport.style.setProperty('--print-seat-height',height*printScale+'px');
  }
  const d={width:hw()+colCount*80,height:hh()+rowCount*50};board.style.width=d.width+'px';board.style.height=d.height+'px';board.style.gridTemplateColumns=`${hw()}px repeat(${colCount},75px)`;board.style.gridTemplateRows=`${hh()}px repeat(${rowCount},45px)`;
  for(const cell of cells){cell.style.removeProperty('height');cell.style.removeProperty('width')}
  /* iPhone (schlanke Bewertungsansicht): passt der Plan nicht aufs Display, werden leere Reihen/Spalten zu schmalen Gängen
     und – nur falls nötig – die Tische etwas flacher (nie schmaler). */
  let liteScale=null;
  if(document.documentElement.classList.contains('ph-lite')&&scroll.clientWidth>0){
   const vis=cells.filter(c=>c.style.display!=='none'),R=new Map(),C=new Map();
   for(const c of vis){const r=parseInt(c.style.gridRow,10),k=parseInt(c.style.gridColumn,10),full=!!gridData[Number(c.dataset.row)]?.[Number(c.dataset.col)];if(!R.has(r))R.set(r,false);if(!C.has(k))C.set(k,false);if(full){R.set(r,true);C.set(k,true)}}
   const rowsN=R.size,colsN=C.size,eR=[...R.values()].filter(v=>!v).length,eC=[...C.values()].filter(v=>!v).length;
   const top=scroll.getBoundingClientRect().top+window.scrollY,availH=Math.max(120,window.innerHeight-top-14),availW=scroll.clientWidth;
   const W=(colW)=>hw()+[...C.values()].reduce((a,v)=>a+(v?75:colW)+5,0),H=(rowH,emptyH)=>hh()+[...R.values()].reduce((a,v)=>a+(v?rowH:emptyH)+5,0);
   const plain=Math.min(1,availW/W(75));
   if(H(45,45)*plain>availH+1&&(eR||rowsN)){
    const colW=eC?14:75,sw=Math.min(1,availW/W(colW));let rowH=45;
    if(H(45,10)*sw>availH){const full=rowsN-eR;rowH=Math.max(34,Math.floor(((availH/sw)-hh()-eR*15-full*5)/Math.max(1,full)))}
    const rowsT=[...R.entries()].sort((a,b)=>a[0]-b[0]).map(([,v])=>(v?rowH:10)+'px'),colsT=[...C.entries()].sort((a,b)=>a[0]-b[0]).map(([,v])=>(v?75:colW)+'px');
    board.style.gridTemplateRows=`${hh()}px ${rowsT.join(' ')}`;board.style.gridTemplateColumns=`${hw()}px ${colsT.join(' ')}`;
    for(const c of vis){const r=parseInt(c.style.gridRow,10),k=parseInt(c.style.gridColumn,10);c.style.setProperty('height',(R.get(r)?rowH:10)+'px','important');if(!C.get(k))c.style.setProperty('width',colW+'px','important')}
    d.width=W(colW);d.height=H(rowH,10);board.style.width=d.width+'px';board.style.height=d.height+'px';
    liteScale=Math.max(.3,Math.min(1,availW/d.width,availH/d.height));
   }else liteScale=plain;
  }
  if(liteScale!==null){scale=liteScale}else if(auto){/* 100 %, außer der Plan passt nicht vollständig auf den Bildschirm – dann einpassen (Breite und Höhe). */const fitW=scroll.clientWidth/d.width,top=scroll.getBoundingClientRect().top+window.scrollY,availH=window.innerHeight-top-70,fitH=mobileDevice&&availH>160?availH/d.height:1;/* Höhe nur auf iPad/iPhone berücksichtigen – am Mac zählt nur die Breite. */scale=Math.max(min,Math.min(1,fitW,Math.max(.55,fitH)))}else if(fit)scale=Math.max(min,Math.min(max,scroll.clientWidth/d.width));
  board.style.transform=`scale(${scale})`;viewport.style.width=d.width*scale+'px';viewport.style.height=d.height*scale+'px';
  // Gruppenlegende endet bündig mit dem rechten Rand des Sitzplans.
  const legend=grid.querySelector(':scope > .main-group-legend');if(legend){const w=Math.round(d.width*scale);for(const [k,v] of [['width',w+'px'],['max-width','100%'],['justify-self','start'],['align-self','flex-start'],['justify-content','flex-end'],['box-sizing','border-box'],['margin-left','0'],['margin-right','0'],['padding-right','0']])legend.style.setProperty(k,v,'important')}
  slider.value=String(Math.round(scale*100));output.textContent=Math.round(scale*100)+' %';controls.querySelector('[data-zoom-minus]').disabled=scale<=min;controls.querySelector('[data-zoom-plus]').disabled=scale>=max;controls.querySelector('[data-zoom-fit]').setAttribute('aria-pressed',String(fit));
 }
 const randomChoice=document.getElementById('randomStudentButton');
 function build(){
  const items=[...grid.children].filter(item=>item.matches('.cell,.grid-header,.grid-corner'));if(!items.length){update();return}
  const scroll=document.createElement('div');scroll.className='classroom-plan-scroll';const viewport=document.createElement('div');viewport.className='classroom-plan-viewport';const board=document.createElement('div');board.className='classroom-zoom-board';
  const d=dimensions();board.style.width=d.width+'px';board.style.height=d.height+'px';board.style.gridTemplateColumns=`35px repeat(${COLS},75px)`;board.style.gridTemplateRows=`repeat(${ROWS+1},45px)`;board.append(...items);viewport.append(board);scroll.append(viewport);grid.prepend(scroll);
  const actions=grid.querySelector(':scope > .grid-action-buttons'),save=grid.querySelector(':scope > .grid-save-button'),primary=grid.querySelector(':scope > .grid-primary-buttons');
  const toolbar=document.createElement('div');toolbar.className='classroom-plan-actions';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Sitzplanaktionen');
  const rotate=grid.querySelector('#undoGridButton');if(rotate){rotate.id='classroomRotateButton';rotate.className='btn btn-secondary';rotate.textContent='Perspektive';rotate.title='Lehrerperspektive aktiv – zur Schülerperspektive wechseln';rotate.disabled=false;rotate.onclick=()=>{rotated=!rotated;if(typeof quickClose==='function')quickClose();update()};}
  if(actions)toolbar.append(...actions.children);if(save)toolbar.append(save);if(primary)toolbar.append(...primary.children);actions?.remove();primary?.remove();const reset=toolbar.querySelector('.btn-grid-reset'),start=toolbar.querySelector('#classroomStartButton'),fullscreen=[...toolbar.children].find(button=>button.textContent.includes('Vollbild')),print=[...toolbar.children].find(button=>button.textContent.trim()==='Drucken');if(save)save.classList.add('btn-secondary');if(fullscreen){controls.querySelector('[data-top-fullscreen]')?.remove();fullscreen.dataset.topFullscreen='';controls.insertBefore(fullscreen,assessmentSwitch)}for(const button of [randomChoice,rotate,save,print,start,reset])if(button)toolbar.append(button);grid.append(toolbar);aktualisiereZufallButton();update();
 }
 function set(value){fit=false;auto=false;scale=Math.max(min,Math.min(max,value));if(typeof quickClose==='function')quickClose();update()}
 controls.querySelector('[data-zoom-minus]').onclick=()=>set(scale-.1);controls.querySelector('[data-zoom-plus]').onclick=()=>set(scale+.1);slider.oninput=()=>set(Number(slider.value)/100);controls.querySelector('[data-zoom-reset]').onclick=()=>set(1);controls.querySelector('[data-zoom-fit]').onclick=()=>{fit=true;auto=false;if(typeof quickClose==='function')quickClose();update()};
 classroomHooks.add('initGrid','plan-zoom: Zoom aufbauen',{after(){build()}});build();
 new MutationObserver(()=>update()).observe(grid,{attributes:true,attributeFilter:['hidden']});
 document.getElementById('classroomEditRoom')?.addEventListener('change',update);
 new ResizeObserver(()=>update()).observe(grid);document.addEventListener('fullscreenchange',update);
 // Beim Drehen des iPads wieder automatisch (quer 100 %, hochkant ggf. eingepasst).
 matchMedia('(orientation: portrait)').addEventListener('change',()=>{auto=true;fit=false;update()});PH.addEventListener?.('change',()=>update());{let was=null;new MutationObserver(()=>{const now=document.documentElement.classList.contains('ph-lite');if(now!==was){was=now;update()}}).observe(document.documentElement,{attributes:true,attributeFilter:['class']})}
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
 const select=document.createElement('select');select.id='classroomRoomSelect';select.setAttribute('aria-label','Unterrichtsraum auswählen');label.append(select);
 const add=document.createElement('button');add.type='button';add.className='btn btn-secondary';add.textContent='+ Raum';add.title='Einen weiteren Raum mit eigenem Sitzplan für diese Klasse anlegen';
 const rename=document.createElement('button');rename.type='button';rename.className='btn btn-secondary';rename.classList.add('room-rename-button');rename.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';rename.title='Ausgewählten Raum umbenennen';rename.setAttribute('aria-label',rename.title);
 box.append(label,add,rename);classroomDateLabel.before(box);
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
 add.onclick=async ()=>{const name=await classroomPrompt('Name des Raums (zum Beispiel Raum 102):','');if(!name?.trim())return;const e=entry();if(e.rooms.some(r=>r.name.toLocaleLowerCase('de-DE')===name.trim().toLocaleLowerCase('de-DE'))){alert('Dieser Raum ist bereits vorhanden.');return}const id=crypto.randomUUID();e.rooms.push({id,name:name.trim(),grid:blank(),groups:leeresGruppenRaster(),anchors:{},people:[]});persist();change(id)};
 rename.onclick=async ()=>{const r=room(),name=await classroomPrompt('Raum umbenennen:',r.name);if(!name?.trim())return;if(entry().rooms.some(other=>other!==r&&other.name.toLocaleLowerCase('de-DE')===name.trim().toLocaleLowerCase('de-DE'))){alert('Dieser Raum ist bereits vorhanden.');return}r.name=name.trim();persist();refresh()};
 classroomDate.addEventListener('change',()=>{const before=room().id;selectForDate();if(room().id!==before){load();undoGridHistory=[];undoGroupHistory=[];initGrid();renderTables();aktualisiereUndoButton();window.dispatchEvent(new Event('classroom:room-change'))}},true);
 selectForDate();load();
})();
/* Gruppenmodus (Button „Gruppen“) entfällt: Ein noch gespeicherter Gruppen-Sitzplan wird beim Anzeigen auf den normalen
   Sitzplan zurückgestellt; Tische und Namen bleiben, nur die Gruppenzuordnung der Tische wird entfernt. */
(()=>{const hasGroups=()=>Array.isArray(gridGroupData)&&gridGroupData.some(r=>Array.isArray(r)&&r.some(Number.isInteger));
 classroomHooks.add('initGrid','rooms: Gruppenraster zurücksetzen',{before(){if(hasGroups()){gridGroupData=leeresGruppenRaster();try{datenSpeichern()}catch{}}}});})();
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
 const historyBox=document.createElement('div');historyBox.className='classroom-plan-history-box';classroomDateLabel.append(historyBox);
 const savedLabel=document.createElement('span');savedLabel.textContent='Gespeicherte Sitzpläne';
 const savedSelect=document.createElement('select');savedSelect.setAttribute('aria-label','Gespeicherte Sitzpläne');
 historyBox.append(savedLabel,savedSelect);
 const removeButton=document.createElement('button');removeButton.type='button';removeButton.className='btn classroom-history-delete';removeButton.textContent='Version löschen';removeButton.setAttribute('aria-label','Ausgewählten gespeicherten Sitzplan löschen');const deleteActions=document.createElement('div');deleteActions.className='classroom-history-delete-actions';deleteActions.append(removeButton);const removeDayButton=document.createElement('button');removeDayButton.type='button';removeDayButton.className='btn classroom-history-delete';removeDayButton.textContent='Tag bereinigen';removeDayButton.title='Sitzplan-Zwischenstände entfernen; der letzte Sitzplan und alle Gruppeneinteilungen bleiben erhalten';deleteActions.append(removeDayButton);historyBox.append(deleteActions);
 function refreshDates(){
  const days=read()[context()]||{},dates=Object.keys(days).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&days[date].length).sort().reverse();
  savedSelect.replaceChildren();const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=dates.length?'Version auswählen':'Noch keine Sitzpläne gespeichert';savedSelect.append(placeholder);
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
 const caption=document.createElement('span');caption.className='classroom-roll-caption';caption.textContent='Rollen';caption.setAttribute('aria-hidden','true');split.append(button,back,caption);
 function rotated(){return document.getElementById('classroomRotateButton')?.getAttribute('aria-pressed')==='true'}
 function frontOnTopNow(){return frontIsLow()!==rotated()}
 // Links: nach unten rollen, rechts: nach oben – bezogen auf die Bildschirmdarstellung.
 function labels(){const top=frontOnTopNow(),downIs=top?'hinten':'vorn',upIs=top?'vorn':'hinten';button.textContent='↓';back.textContent='↑';
  button.title='Alle Sitzreihen samt Tischen eine Reihe nach unten verschieben (nach '+downIs+'); die unterste Reihe kommt nach oben. Ankerplätze und Pult bleiben fest.';button.setAttribute('aria-label','Sitzreihen nach unten rollen');
  back.title='Alle Sitzreihen samt Tischen eine Reihe nach oben verschieben (nach '+upIs+'); die oberste Reihe kommt nach unten. Ankerplätze und Pult bleiben fest.';back.setAttribute('aria-label','Sitzreihen nach oben rollen')}
 function refresh(){const toolbar=document.querySelector('.classroom-plan-actions'),random=toolbar?.querySelector('#randomStudentButton');if(split.parentElement!==toolbar||!split.isConnected){if(random)random.after(split);else toolbar?.prepend(split)}const gm=groupMode(),off=gm||rows().length<2;button.disabled=off;back.disabled=off;if(off)split.title=gm?'Rollen ist im Gruppenmodus nicht verfügbar – die Gruppen würden auseinandergerissen.':'Rollen braucht mindestens zwei besetzte Reihen.';else split.removeAttribute('title');labels()}
 new MutationObserver(()=>labels()).observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
 const style=document.createElement('style');style.textContent=
 /* Zwei gleich große Hälften; „Rollen“ steht mittig darüber. Links ↓ (nach unten), rechts ↑ (nach oben). */
 'body[data-module=sitzplan] .classroom-plan-actions>.classroom-roll-split{position:relative;display:inline-grid;grid-template-columns:1fr 1fr;flex:0 0 auto;min-width:9.5em}'
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
  if(button.matches('.classroom-rating-choice'))return text==='∅'?'Die mündliche Bewertung für diese Person und dieses Datum leeren.':'Die mündliche Mitarbeit mit „'+text+'“ bewerten.';
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
   'Tag bereinigen':'Zwischenstände dieses Tages entfernen; der letzte Sitzplan und alle Gruppeneinteilungen bleiben erhalten.',
   'Vorlage speichern':'Die aktuelle Tischanordnung als eigene Vorlage speichern.',
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
 function scan(root){if(!root||root.nodeType!==1)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(node.parentElement.closest('script,style,textarea,input,[contenteditable=true],[data-app-version]'))continue;const value=node.textContent;if(/^\s*[+−-]?\d+\.\d+\s*(?:%|Punkte)?\s*$/.test(value))node.textContent=value.replace(/(\d)\.(\d)/,'$1,$2')}}
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
 function apply(){
  observer.disconnect();try{
  if(!enabled)unstripe(document);
  document.documentElement.classList.toggle('hatching-off',!enabled);
  // Schraffuren-Schalter: neben „Kompaktansicht“, auf Übersichtsseiten ohne Kompaktansicht vor „Drucken“.
  const anchors=[...document.querySelectorAll('.compact-view-toggle')];
  for(const print of document.querySelectorAll('.section-title .page-print-button')){const title=print.closest('.section-title');if(!title.querySelector('.compact-view-toggle'))anchors.push(print)}
  for(const compact of anchors){const parent=compact.parentElement;if(!parent.querySelector(':scope>[data-hatching-toggle]')){const label=document.createElement('label');label.className='toggle';label.dataset.hatchingToggle='';label.title='Schraffuren in Bewertungsfeldern ein- oder ausblenden.';const input=document.createElement('input');input.type='checkbox';input.setAttribute('role','switch');const caption=document.createElement('span');caption.textContent='Schraffuren';label.append(input,caption);input.onchange=()=>{enabled=input.checked;localStorage.setItem(key,enabled?'on':'off');apply()};compact.before(label)}}
  document.querySelectorAll('[data-hatching-toggle] input').forEach(input=>input.checked=enabled);
  // Alle Anzeige-Schalter einer Seite stehen in der oberen Zeile vor „Schraffuren“: 1. Quartal, Zeichen/Noten, Tendenzen.
  for(const title of document.querySelectorAll('.section-title')){const hatch=title.querySelector('[data-hatching-toggle]');if(!hatch)continue;
   const wanted=['.previous-quarter-toggle','.task-participation-display','.task-tendency-toggle'].map(s=>title.querySelector(s)).filter(Boolean);
   /* Umschalter-Segmente (seg-toggle) sitzen direkt bei ihrem Schalter und zählen hier nicht mit – sonst schieben sich die Skripte gegenseitig endlos hin und her. */let ok=true,node=hatch;for(let i=wanted.length-1;i>=0;i--){node=node.previousElementSibling;while(node&&node.matches('.seg-toggle,.hatch-seg'))node=node.previousElementSibling;if(node!==wanted[i]){ok=false;break}}
   if(!ok)for(const el of wanted)hatch.before(el)}
  // Schalter nur zeigen, wenn auf der Seite etwas schraffiert ist (z. B. nicht bei Tests mit Bewertungszeichen).
  for(const label of document.querySelectorAll('[data-hatching-toggle]')){const scope=label.closest('[data-custom-panel]')||label.closest('section,.panel,.card')||label.parentElement?.parentElement;if(!scope)continue;
   let any=!!scope.querySelector('.classroom-unstriped,.grade-four-fail,[class*=participation-between-]');
   if(!any)for(const el of scope.querySelectorAll('td span,td input,td select,td button,.cell,.classroom-rating-choice')){if(getComputedStyle(el).backgroundImage.includes('gradient')){any=true;break}}
   if(label.hidden===any)label.hidden=!any}
  try{window.classroomHatchSegPlace?.()}catch(e){console.error(e)}
  }catch(e){console.error(e)}finally{observer.observe(document.body,{childList:true,subtree:true})}
 }
 const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})});
 window.addEventListener('storage',e=>{if(e.key===key){enabled=e.newValue!=='off';apply()}});apply();
})();
;

/* ==== sitzplan/student-finder.js ==== */
/* „Schüler finden“: Ein Klick verwandelt „Schüler“ im Button in ein Eingabefeld mit Namensvorschlägen.
   Nach Auswahl eines Namens springt „finden“ zum Sitzplatz. Das Feld wächst mit der Namenslänge. */
(()=>{
 const button=document.getElementById('studentSearchToggle'),legacyInput=document.getElementById('studentSearchInput');
 if(!button)return;
 const wrap=document.createElement('div');wrap.className='student-finder';wrap.dataset.open='false';
 // Kein Kontakte-Vorschlag von Safari/iOS: Suchfeld statt Namensfeld, keine Begriffe wie „Name“ in Platzhalter, Bezeichnung oder name-Attribut.
 const input=document.createElement('input');input.type='search';input.name='sitzplan-suche';input.className='student-finder-input';input.autocomplete='off';input.spellcheck=false;
 for(const [k,v] of Object.entries({autocorrect:'off',autocapitalize:'off',enterkeyhint:'search','data-lpignore':'true','data-1p-ignore':'true','data-form-type':'other'}))input.setAttribute(k,v);
 input.placeholder='Suchen …';input.setAttribute('aria-label','Person im Sitzplan suchen');input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');
 const list=document.createElement('ul');list.className='student-finder-list';list.id='studentFinderList';list.setAttribute('role','listbox');list.hidden=true;input.setAttribute('aria-controls',list.id);
 const sizer=document.createElement('span');sizer.className='student-finder-sizer';sizer.setAttribute('aria-hidden','true');
 let open=false,active=-1,matches=[];

 function place(){
  // Der Unterrichts-Manager baut die Werkzeugleiste gelegentlich neu auf; der Button bleibt im Suchfeld-Verbund.
  if(button.parentElement!==wrap){button.before(wrap);wrap.append(input,button,list,sizer)}
  if(legacyInput){legacyInput.hidden=true;legacyInput.setAttribute('aria-hidden','true')}
 }
 function allNames(){
  const names=new Set();
  for(const row of (typeof gridData!=='undefined'?gridData:[]))for(const value of row||[])if(value&&value!=='X'&&value!=='PULT')names.add(String(value).trim());
  for(const s of (typeof schuelerEinzel!=='undefined'?schuelerEinzel:[]))if(s?.name)names.add(String(s.name).trim());
  for(const p of (typeof schuelerPaare!=='undefined'?schuelerPaare:[]))for(const n of [p?.s1,p?.s2])if(n)names.add(String(n).trim());
  return [...names].filter(Boolean).sort((a,b)=>a.localeCompare(b,'de',{sensitivity:'base'}));
 }
 const norm=v=>String(v||'').toLocaleLowerCase('de').normalize('NFD').replace(/[̀-ͯ]/g,'');
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
 function grow(){sizer.textContent=input.value||input.placeholder;input.style.setProperty('font-size',getComputedStyle(button).fontSize);input.style.setProperty('width',Math.max(30,Math.ceil(sizer.getBoundingClientRect().width)+4)+'px','important')}
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
  button.title=state?'Zum ausgewählten Sitzplatz springen.':'Das Suchfeld öffnen, um eine Person im Sitzplan zu finden.';button.dataset.buttonHelp='';
  if(state){const f=getComputedStyle(button).font;for(const el of [wrap,input,sizer])el.style.font=f;grow();input.focus();input.select()}else{input.value='';matches=[];active=-1;renderList();sucheSchuelerImSitzplan('')}
 }
 window.classroomToggleStudentSearch=()=>{place();if(!open)setOpen(true);else find()};
 input.addEventListener('input',()=>{chosen=null;matches=search(input.value);active=matches.length?0:-1;renderList();grow();if(!input.value.trim())sucheSchuelerImSitzplan('')});
 wrap.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target!==input){e.preventDefault();setOpen(false);button.focus()}});
 input.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'&&matches.length){e.preventDefault();active=(active+1)%matches.length;renderList()}
  else if(e.key==='ArrowUp'&&matches.length){e.preventDefault();active=(active-1+matches.length)%matches.length;renderList()}
  else if(e.key==='Enter'){e.preventDefault();if(matches.length&&active>=0)choose(matches[active]);else find()}
  else if(e.key==='Escape'){e.preventDefault();setOpen(false);button.focus()}
 });
 // Esc oder ein Klick/Tipp irgendwo außerhalb beendet die Suche: Hervorhebung weg, Name aus dem Suchfeld entfernt.
 document.addEventListener('pointerdown',e=>{if(open&&!wrap.contains(e.target))setOpen(false)},true);
 document.addEventListener('keydown',e=>{if(open&&e.key==='Escape'&&!wrap.contains(e.target)){e.preventDefault();setOpen(false)}},true);
 place();new MutationObserver(place).observe(document.body,{childList:true,subtree:true});
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
 +'.student-finder-list li[aria-selected=true],.student-finder-list li:hover{background:#eaf0fa}';
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
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
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
 new MutationObserver(place).observe(document.body,{childList:true,subtree:true});
})();
;

/* ==== sitzplan/beamer-mode.js ==== */
/* Klassenansicht (früher „Präsentieren“/„Beamer-Modus“): Ein Klick verbirgt alles Sensible, damit beim Projizieren des Sitzplans nichts aufblitzt –
   Bewertungsfarben, Hausaufgabenhinweise, Schnelleingabe (Klick auf Sitzplätze), Einstellungsleiste,
   Bewertungs-/Sitzplanmodus sowie in der Kopfzeile den Noten-Manager, Rückgängig, Backup und das Auswahlmenü.
   Bleibt beim Neuladen im selben Tab aktiv. */
(()=>{
 const key='classroom-manager-beamer-v1';
 let on=false;try{on=sessionStorage.getItem(key)==='on'}catch{}
 const button=document.createElement('button');button.type='button';button.className='classroom-beamer-button';button.dataset.buttonHelp='';
 function apply(){
  document.documentElement.classList.toggle('classroom-beamer',on);
  button.textContent=on?'Klassenansicht beenden':'Klassenansicht';button.setAttribute('aria-pressed',String(on));
  button.title=on?'Klassenansicht beenden und alle Bereiche wieder einblenden.':'Sitzplan für Beamer/AirPlay: ohne Bedienelemente und ohne Bewertungen.';
  try{on?sessionStorage.setItem(key,'on'):sessionStorage.removeItem(key)}catch{}
  try{parent.postMessage({type:'classroom:beamer',on},'*')}catch{}
  if(on){const edit=document.getElementById('classroomEditRoom');if(edit?.checked)edit.click();document.activeElement?.blur?.()}
  setTimeout(()=>window.dispatchEvent(new Event('resize')),60);
 }
 button.onclick=()=>{on=!on;apply()};
 const hideLabels=['Schüler zuweisen','Vorlage speichern','Drucken','Start','Verteilen','Zurücksetzen','Zurücksetzen …','Zuweisen abbrechen'];
 function place(){const bar=document.querySelector('.classroom-plan-zoom');if(bar&&button.parentElement!==bar)bar.append(button);
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
  +'.classroom-beamer body[data-module=sitzplan] .container>.panel,.classroom-beamer .classroom-sidebar-toggle,.classroom-beamer .classroom-quick,.classroom-beamer .classroom-mode-switch,.classroom-beamer label:has(#classroomEditRoom),.classroom-beamer .room-header+.info-text,.classroom-beamer [data-beamer-hide],.classroom-beamer .classroom-plan-zoom>button:not(.classroom-beamer-button):not([data-zoom-minus]):not([data-zoom-plus]):not([data-zoom-fit]){display:none!important}'
  +'.classroom-beamer body[data-module=sitzplan] .container{grid-template-columns:minmax(0,1fr)!important}'
  +'.classroom-beamer #roomGrid .cell{cursor:default!important}.classroom-beamer .classroom-absent{opacity:1!important;filter:none!important;text-decoration:none!important}';
 document.head.append(style);
 place();apply();new MutationObserver(place).observe(document.body,{childList:true,subtree:true});
})();
;

/* ==== sitzplan/random-groups.js ==== */
/* Zufallsgruppen: teilt die Klasse in Gruppen ein, ohne die Sitzordnung zu verändern.
   Einstellbar: Anzahl Gruppen oder Gruppengröße, Abwesende (Datum der Seitenleiste) auslassen, Tabu-Paare trennen, gemischt m/w.
   „Neu mischen“, „Groß zeigen“ (für Beamer/AirPlay), „Drucken“. Der Button steht neben „Zufallsauswahl“ (Anordnung: plan-actions.js). */
(()=>{
 const key='classroom-random-groups-v1',colors=['#3b82c4','#e08a1e','#3f9b6b','#9b59b6','#d9534f','#2aa1a8','#c2569b','#6d7f2f','#5b6bd6','#a8642a'];
 let opt={mode:'count',count:4,size:4,absent:true,tabu:true,mix:false};try{Object.assign(opt,JSON.parse(localStorage.getItem(key)||'{}'))}catch{}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(opt))}catch{}};
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const display=n=>{const m=/^\s*([^,]+),\s*(.+)$/.exec(n||'');return m?m[2].trim()+' '+m[1].trim():String(n||'').trim()};
 const button=document.createElement('button');button.type='button';button.id='randomGroupsButton';button.className='btn btn-secondary';button.textContent='Zufallsgruppen';
 button.title='Die anwesenden Schüler:innen zufällig in Gruppen einteilen – die Sitzordnung bleibt unverändert.';
 window.classroomRandomGroupsButton=button;
 const dlg=document.createElement('dialog');dlg.className='rg-dialog';dlg.setAttribute('aria-label','Zufallsgruppen');
 dlg.innerHTML='<div class="rg-head"><div><h2></h2><p class="rg-sub"></p></div><button type="button" class="rg-x" data-rg-close aria-label="Schließen">×</button></div>'
  +'<div class="rg-opts"><span>Einteilen nach</span><span class="rg-seg" role="group"><button type="button" data-mode="count">Anzahl Gruppen</button><button type="button" data-mode="size">Gruppengröße</button></span>'
  +'<span class="rg-num"><button type="button" data-step="-1" aria-label="weniger">−</button><output></output><button type="button" data-step="1" aria-label="mehr">+</button></span>'
  +'<label><input type="checkbox" data-opt="absent"> Abwesende auslassen</label><label><input type="checkbox" data-opt="tabu"> Tabu-Paare trennen</label><label><input type="checkbox" data-opt="mix"> gemischt m/w</label></div>'
  +'<p class="rg-note" role="status"></p><div class="rg-grid"></div>'
  +'<div class="rg-actions"><button type="button" data-rg-print>Drucken</button><button type="button" data-rg-big>Groß zeigen</button><button type="button" data-rg-shuffle>Neu mischen</button><button type="button" class="rg-primary" data-rg-close>Schließen</button></div>';
 document.body.append(dlg);
 const grid=dlg.querySelector('.rg-grid'),out=dlg.querySelector('output'),note=dlg.querySelector('.rg-note');
 let groups=[];
 function people(){
  const list=(typeof schuelerEinzel!=='undefined'?schuelerEinzel:[]).filter(s=>String(s.name||'').trim());
  return list.map(s=>({name:s.name.trim(),gender:String(s.geschlecht||'').toLowerCase(),absent:!!s.abwesend}));
 }
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function build(){
  const all=people(),present=opt.absent?all.filter(p=>!p.absent):all,n=present.length;
  let count=opt.mode==='count'?opt.count:Math.ceil(n/Math.max(1,opt.size));count=Math.max(1,Math.min(count,Math.max(1,n)));
  const tabu=(typeof tabuPaare!=='undefined'?tabuPaare:[]).map(t=>[String(t.s1||'').trim(),String(t.s2||'').trim()]).filter(t=>t[0]&&t[1]);
  const conflicts=g=>opt.tabu?g.reduce((c,members)=>c+tabu.filter(([a,b])=>members.some(m=>m.name===a)&&members.some(m=>m.name===b)).length,0):0;
  let best=null,bestScore=Infinity;
  for(let attempt=0;attempt<400&&bestScore>0;attempt++){
   let order;
   if(opt.mix){const m=shuffle(present.filter(p=>p.gender==='m')),w=shuffle(present.filter(p=>p.gender==='w')),o=shuffle(present.filter(p=>p.gender!=='m'&&p.gender!=='w'));order=[];while(m.length||w.length){if(w.length)order.push(w.shift());if(m.length)order.push(m.shift())}order.push(...o)}
   else order=shuffle([...present]);
   const g=Array.from({length:count},()=>[]);order.forEach((p,i)=>{const round=Math.floor(i/count),pos=i%count;g[round%2?count-1-pos:pos].push(p)});
   const score=conflicts(g);if(score<bestScore){best=g;bestScore=score}
  }
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
  grid.innerHTML=groups.length?groups.map((g,i)=>`<div class="rg-card"><h4 style="background:${colors[i%colors.length]}">Gruppe ${i+1}</h4><ul>${g.map(p=>`<li>${esc(display(p.name))}</li>`).join('')}</ul></div>`).join(''):'<p class="rg-empty">Keine Schüler:innen in dieser Klasse.</p>';
 }
 function open(){
  let label='';try{const g=typeof classroomCurrentGroup==='function'?classroomCurrentGroup():null;label=g?.name||aktuelleKlasse||''}catch{}
  dlg.querySelector('h2').textContent='Zufallsgruppen'+(label?' · '+label.replace(/^NM:.*/,''):'');
  dlg.classList.remove('rg-big');dlg.querySelector('[data-rg-big]').textContent='Groß zeigen';
  build();if(!dlg.open)dlg.showModal();
 }
 button.onclick=open;
 dlg.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.mode){opt.mode=t.dataset.mode;save();build()}
  else if(t.dataset.step){const k=opt.mode==='count'?'count':'size';opt[k]=Math.max(opt.mode==='count'?1:2,Math.min(15,opt[k]+Number(t.dataset.step)));save();build()}
  else if(t.hasAttribute('data-rg-shuffle'))build();
  else if(t.hasAttribute('data-rg-close'))dlg.close();
  else if(t.hasAttribute('data-rg-big')){const big=dlg.classList.toggle('rg-big');t.textContent=big?'Normale Ansicht':'Groß zeigen'}
  else if(t.hasAttribute('data-rg-print')){const w=window.open('','_blank');if(!w){alert('Bitte Pop-ups für den Druck erlauben.');return}w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(dlg.querySelector('h2').textContent)}</title><style>body{font:14px/1.4 -apple-system,system-ui,sans-serif;margin:14mm;color:#24334b}h1{font-size:18px;margin:0 0 12px}.rg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.rg-card{border:1px solid #cfd8e6;border-radius:10px;overflow:hidden;break-inside:avoid}.rg-card h4{margin:0;padding:6px 10px;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.rg-card ul{margin:0;padding:6px 10px 8px;list-style:none}</style></head><body><h1>${esc(dlg.querySelector('h2').textContent)} · ${new Date().toLocaleDateString('de-DE')}</h1><div class="rg-grid">${grid.innerHTML}</div></body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print()},250)}
 });
 dlg.addEventListener('change',e=>{const c=e.target.closest('[data-opt]');if(c){opt[c.dataset.opt]=c.checked;save();build()}});
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
  +'.rg-dialog.rg-big{width:calc(100vw - 16px);max-width:none;height:calc(100dvh - 16px);max-height:none}.rg-big .rg-opts,.rg-big .rg-note,.rg-big .rg-sub,.rg-big [data-rg-print],.rg-big [data-rg-shuffle]{display:none}.rg-big .rg-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}.rg-big .rg-card h4{font-size:1.4rem;padding:10px 16px}.rg-big .rg-card li{font-size:1.45rem;padding:4px 0}.rg-big .rg-card ul{padding:10px 16px 14px}.rg-big h2{font-size:1.6rem}';
 document.head.append(style);
})();
;

/* ==== sitzplan/plan-actions.js ==== */
/* Buttonreihe unter dem Sitzplan geordnet, immer in einer Zeile:
   [Schüler zuweisen] │ [Perspektive] [Schüler finden] [Zufallsauswahl] [Zufallsgruppen] │ [Rollen] │ [Drucken] [Mehr ▾] …… [Verteilen]
   Reicht der Platz nicht, wandern Drucken, Rollen, Zufallsgruppen, Zufallsauswahl und Perspektive ins Menü „Mehr“.
   „Start“ heißt „Verteilen“ und steht als Hauptaktion ganz rechts. „Vorlage speichern“ und „Zurücksetzen“ liegen im Menü „Mehr“.
   Der Unterrichts-Manager baut die Reihe bei jedem Neuzeichnen neu auf – danach wird sie wieder geordnet. */
(()=>{
 const grid=document.getElementById('roomGrid');if(!grid)return;
 let busy=false,menuOpen=false;
 const label=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
 function separator(){const s=document.createElement('span');s.className='plan-actions-sep';s.setAttribute('aria-hidden','true');return s}
 function closeMenu(){menuOpen=false;document.querySelectorAll('.plan-actions-more').forEach(m=>{m.classList.remove('open');m.querySelector('.plan-actions-more-toggle')?.setAttribute('aria-expanded','false')})}
 function arrange(){
  const bar=grid.querySelector('.classroom-plan-actions');if(!bar||busy)return;
  const items=[...bar.querySelectorAll('button')];
  const byText=t=>items.find(el=>el.matches?.('button')&&label(el)===t);
  const assign=bar.querySelector('[data-assign-student]')||byText('Schüler zuweisen'),random=document.getElementById('randomStudentButton'),finder=bar.querySelector('.student-finder'),
   roll=bar.querySelector('.classroom-roll-split'),persp=document.getElementById('classroomRotateButton'),print=byText('Drucken'),
   save=bar.querySelector('.grid-save-button'),reset=document.getElementById('classroomResetButton'),start=document.getElementById('classroomStartButton'),legacy=document.getElementById('studentSearchInput'),groupsBtn=window.classroomRandomGroupsButton||null;
  if(!start)return;
  const expected=[assign,'sep',persp,finder,random,groupsBtn,'sep',roll,'sep',print,'more','right'].filter(Boolean);
  const right0=bar.querySelector(':scope > .plan-actions-right'),more0=bar.querySelector(':scope > .plan-actions-more'),current=[...bar.children].filter(c=>c!==legacy&&!c.matches('.plan-actions-sep'));
  const want=expected.map(x=>x==='more'?more0:x==='right'?right0:x).filter(x=>x!=='sep');
  if(right0&&more0&&right0.lastElementChild===start&&(!save||more0.contains(save))&&(!reset||more0.contains(reset))&&start.textContent==='Verteilen'&&current.length===want.length&&current.every((c,i)=>c===want[i]))return;
  busy=true;
  try{
   start.textContent='Verteilen';
   let more=bar.querySelector('.plan-actions-more');
   if(!more){more=document.createElement('div');more.className='plan-actions-more';
    more.innerHTML='<button type="button" class="btn btn-secondary plan-actions-more-toggle" aria-haspopup="menu" aria-expanded="false">Mehr <span aria-hidden="true">▾</span></button><div class="plan-actions-menu" role="menu"></div>';
    more.querySelector('.plan-actions-more-toggle').onclick=e=>{e.stopPropagation();const open=!more.classList.contains('open');closeMenu();if(open){more.classList.add('open');menuOpen=true;e.currentTarget.setAttribute('aria-expanded','true');const r=e.currentTarget.getBoundingClientRect(),m=more.querySelector('.plan-actions-menu');m.style.position='fixed';m.style.right=Math.max(8,innerWidth-r.right)+'px';m.style.left='auto';const h=m.offsetHeight;m.style.top=(r.top-h-6>8?r.top-h-6:r.bottom+6)+'px';m.style.bottom='auto'}};
   }
   const menu=more.querySelector('.plan-actions-menu');
   for(const b of [save,reset].filter(Boolean)){b.setAttribute('role','menuitem');if(b===reset&&!/…$/.test(label(b)))b.textContent='Zurücksetzen …';menu.append(b)}
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
  return [[...bar.querySelectorAll(':scope > .btn')].find(b=>label(b)==='Drucken'),bar.querySelector(':scope > .classroom-roll-split'),window.classroomRandomGroupsButton,document.getElementById('randomStudentButton'),document.getElementById('classroomRotateButton'),
   finder&&finder.dataset.open!=='true'&&!forceFinder?finder:null,assign&&assign.getAttribute('aria-pressed')!=='true'?assign:null].filter(el=>el&&el.parentElement===bar)}
 function proxy(text,target){const b=document.createElement('button');b.type='button';b.className='plan-actions-proxy';b.setAttribute('role','menuitem');b.textContent=text;b.disabled=!!target.disabled;b.onclick=()=>target.click();b._target=target;return b}
 function fit(){
  fitPlanned=false;const bar=grid.querySelector('.classroom-plan-actions');if(!bar||!bar.dataset.arranged)return;
  const menu=bar.querySelector(':scope > .plan-actions-more .plan-actions-menu');if(!menu)return;
  const finderEl=bar.querySelector(':scope > .student-finder'),assignEl=bar.querySelector(':scope > [data-assign-student]');
  // Suche geschlossen bzw. Zuweisen beendet: neu einpassen.
  if(finderEl&&!finderEl.__planWatch){finderEl.__planWatch=true;new MutationObserver(()=>{if(finderEl.dataset.open!=='true')forceFinder=false;scheduleFit()}).observe(finderEl,{attributes:true,attributeFilter:['data-open']})}
  if(assignEl&&!assignEl.__planWatch){assignEl.__planWatch=true;new MutationObserver(scheduleFit).observe(assignEl,{attributes:true,attributeFilter:['aria-pressed']})}
  const list=collapsibles(bar),beamer=document.documentElement.classList.contains('classroom-beamer');
  for(const el of [...list,finderEl,assignEl].filter(Boolean))el.classList.remove('plan-actions-collapsed');bar.classList.remove('plan-actions-wrap');
  const over=()=>bar.scrollWidth>bar.clientWidth+1,hidden=[];
  if(!beamer&&bar.clientWidth>0)for(const el of list){if(!over())break;el.classList.add('plan-actions-collapsed');hidden.push(el)}
  if(bar.clientWidth>0&&over())bar.classList.add('plan-actions-wrap');
  // Trennstriche nur zwischen sichtbaren Gruppen.
  const kids=[...bar.children],visible=el=>getComputedStyle(el).display!=='none';
  for(const [i,sep] of kids.entries()){if(!sep.matches('.plan-actions-sep'))continue;let before=false,after=false;for(let j=i-1;j>=0&&!kids.at(j).matches('.plan-actions-sep');j--)if(visible(kids.at(j)))before=true;for(let j=i+1;j<kids.length&&!kids.at(j).matches('.plan-actions-sep');j++)if(visible(kids.at(j)))after=true;sep.classList.toggle('plan-actions-collapsed',!(before&&after))}
  hidden.sort((a,b)=>kids.indexOf(a)-kids.indexOf(b));
  const key=hidden.map(el=>el.id||label(el)).join('|');
  let box=menu.querySelector(':scope > .plan-actions-overflow');
  if(key!==lastKey||!box){
   lastKey=key;box?.remove();menu.querySelector(':scope > .plan-actions-menu-sep')?.remove();
   if(hidden.length){box=document.createElement('div');box.className='plan-actions-overflow';
    for(const el of hidden){if(el.matches('.student-finder')){const b=proxy('Schüler finden',el);b.onclick=()=>{forceFinder=true;el.classList.remove('plan-actions-collapsed');el.querySelector('#studentSearchToggle')?.click();scheduleFit()};box.append(b);continue}if(el.matches('.classroom-roll-split')){for(const b of el.querySelectorAll(':scope > .btn')){const arrow=label(b);box.append(proxy('Rollen '+arrow+(arrow.includes('↓')?' (nach unten)':arrow.includes('↑')?' (nach oben)':''),b))}}else box.append(proxy(label(el),el))}
    const line=document.createElement('div');line.className='plan-actions-menu-sep';line.setAttribute('role','separator');menu.prepend(box,line)}
  }else for(const b of box.querySelectorAll('.plan-actions-proxy'))if(b.disabled!==!!b._target.disabled)b.disabled=!!b._target.disabled;
 }
 function scheduleFit(){if(fitPlanned)return;fitPlanned=true;requestAnimationFrame(fit)}
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
  +'body[data-module=sitzplan] .classroom-plan-actions>.plan-actions-right{display:flex;align-items:center;gap:10px;margin-left:auto!important;flex:none}'
  +'body[data-module=sitzplan] .plan-actions-right>.btn,body[data-module=sitzplan] .plan-actions-right .plan-actions-more-toggle{box-sizing:border-box;height:40px!important;min-height:40px!important;font-size:14.4px!important;width:auto!important;margin:0!important}'
  +'.plan-actions-more{position:relative;flex:none;display:flex;align-items:center;height:40px}'
  +'.plan-actions-more-toggle{gap:6px}.plan-actions-more-toggle span{font-size:.75em}'
  +'.plan-actions-menu{display:none;position:fixed;z-index:1000;min-width:210px;padding:6px;background:#fff;border:1px solid #dce3ef;border-radius:12px;box-shadow:0 12px 30px #1c2b4626}'
  +'.plan-actions-more.open .plan-actions-menu{display:block}'
  +'body[data-module=sitzplan] .plan-actions-menu>button{display:block!important;width:100%!important;height:auto!important;min-height:0!important;margin:0!important;padding:9px 12px!important;border:0!important;border-radius:8px!important;background:none!important;color:var(--primary,#2f5f9b)!important;text-align:left!important;font:inherit;font-weight:500;box-shadow:none!important;cursor:pointer}'
  +'body[data-module=sitzplan] .plan-actions-menu>button:hover{background:#f3f6fb!important}'
  +'body[data-module=sitzplan] .plan-actions-menu>#classroomResetButton{color:#b42318!important}'
  +'body[data-module=sitzplan] .classroom-roll-split:has(.btn:disabled){opacity:.45;filter:grayscale(1);cursor:not-allowed}body[data-module=sitzplan] .classroom-roll-split:has(.btn:disabled)>.btn{background:#fff!important;color:inherit}body[data-module=sitzplan] .classroom-roll-split:has(.btn:disabled)>.classroom-roll-caption{opacity:1!important}'
  +'.classroom-beamer .plan-actions-more,.classroom-beamer .plan-actions-sep{display:none!important}'
  +'@media(max-width:700px){.plan-actions-sep{display:none}}'
  +'body[data-module=sitzplan] .classroom-plan-actions{flex-wrap:nowrap!important}body[data-module=sitzplan] .classroom-plan-actions.plan-actions-wrap{flex-wrap:wrap!important}'
  +'body[data-module=sitzplan] .classroom-plan-actions>.plan-actions-collapsed{display:none!important}'
  +'.plan-actions-menu-sep{height:1px;margin:5px 6px;background:#e3e9f2}'
  +'body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy{display:block!important;width:100%!important;height:auto!important;min-height:0!important;margin:0!important;padding:9px 12px!important;border:0!important;border-radius:8px!important;background:none!important;color:var(--primary,#2f5f9b)!important;text-align:left!important;font:inherit;font-weight:500;box-shadow:none!important;cursor:pointer;white-space:nowrap}'
  +'body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy:hover{background:#f3f6fb!important}body[data-module=sitzplan] .plan-actions-menu .plan-actions-proxy:disabled{opacity:.45;cursor:not-allowed}';
 document.head.append(style);
 arrange();
 new MutationObserver(()=>{if(!busy){arrange();scheduleFit()}}).observe(grid,{childList:true,subtree:true});
 scheduleFit();
})();

/* Zoomleiste über dem Sitzplan, immer einzeilig: Was nicht passt, wandert von rechts nach links in „Mehr ▾“ (ganz rechts,
   nur sichtbar, wenn etwas darin steht): Klassenansicht, Schalter „Bewertungen“, „100 %“, „Einpassen“.
   ☰, −, Regler, Prozentanzeige und + bleiben immer sichtbar. In der Klassenansicht wird nichts verschoben. */
(()=>{
 let planned=false,lastKey='',open=false,observed=null;
 const label=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
 const style=document.createElement('style');style.textContent=
  'body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row{flex-wrap:nowrap}body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-wrap{flex-wrap:wrap}'
  +'.classroom-plan-zoom>.zoom-collapsed{display:none!important}'
  +'.zoom-more{margin-left:auto;flex:none;position:relative}.zoom-more[hidden]{display:none!important}'
  +'.classroom-plan-zoom .zoom-more-toggle{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.zoom-more-toggle span{font-size:.75em}'
  +'.zoom-more-menu{display:none;position:fixed;z-index:1000;min-width:200px;padding:6px;background:#fff;border:1px solid #dce3ef;border-radius:12px;box-shadow:0 12px 30px #1c2b4626}'
  +'.zoom-more.open .zoom-more-menu{display:block}'
  +'body[data-module=sitzplan] .zoom-more-menu>button{display:flex!important;align-items:center;justify-content:flex-start;gap:12px;width:100%!important;min-width:0!important;min-height:0!important;margin:0!important;padding:9px 12px!important;border:0!important;border-radius:8px!important;background:none!important;color:var(--primary,#2f5f9b)!important;text-align:left;font:inherit;font-size:.95rem;font-weight:500;white-space:nowrap;cursor:pointer}'
  +'body[data-module=sitzplan] .zoom-more-menu>button:hover{background:#f3f6fb!important}'
  +'.zoom-proxy-switch{position:relative;flex:0 0 34px;width:34px;height:20px;border-radius:999px;background:#c9d3e1;transition:background .15s}.zoom-proxy-switch::before{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #1c2b4635;transition:transform .15s}'
  +'[aria-checked=true]>.zoom-proxy-switch{background:var(--primary,#2f5f9b)}[aria-checked=true]>.zoom-proxy-switch::before{transform:translateX(14px)}'
  +'.zoom-proxy-check{visibility:hidden}[aria-pressed=true]>.zoom-proxy-check{visibility:visible}'
  // iPhone: Regler darf schmaler werden, damit die Leiste in eine Zeile passt.
  +'@media(max-width:540px){body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row input[type=range]{flex:1 1 130px;width:auto!important;min-width:56px}body[data-module=sitzplan] .classroom-plan-zoom.zoom-fit-row{gap:6px}}';
 document.head.append(style);
 function close(){open=false;document.querySelectorAll('.zoom-more.open').forEach(m=>{m.classList.remove('open');m.querySelector('.zoom-more-toggle')?.setAttribute('aria-expanded','false')})}
 function ensureMore(bar){
  let more=bar.querySelector(':scope > .zoom-more');
  if(!more){more=document.createElement('div');more.className='zoom-more';more.hidden=true;
   more.innerHTML='<button type="button" class="zoom-more-toggle" aria-haspopup="menu" aria-expanded="false">Mehr <span aria-hidden="true">▾</span></button><div class="zoom-more-menu" role="menu"></div>';
   const toggle=more.querySelector('.zoom-more-toggle');
   toggle.onclick=e=>{e.stopPropagation();const was=more.classList.contains('open');close();if(was)return;more.classList.add('open');open=true;toggle.setAttribute('aria-expanded','true');const r=toggle.getBoundingClientRect(),m=more.querySelector('.zoom-more-menu');m.style.right=Math.max(8,innerWidth-r.right)+'px';m.style.left='auto';m.style.top=(r.bottom+6)+'px'};
   more.querySelector('.zoom-more-menu').onclick=()=>close();
  }
  if(bar.lastElementChild!==more)bar.append(more);
  return more;
 }
 function items(bar){return [bar.querySelector(':scope > .classroom-beamer-button'),bar.querySelector(':scope > .plan-assess-switch'),bar.querySelector(':scope > [data-zoom-reset]'),bar.querySelector(':scope > [data-zoom-fit]')].filter(Boolean)}
 function proxyFor(el){
  const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b._target=el;
  if(el.matches('.plan-assess-switch')){const input=el.querySelector('input');b.setAttribute('role','menuitemcheckbox');b.innerHTML='<span>Bewertungen</span><span class="zoom-proxy-switch" aria-hidden="true"></span>';b.setAttribute('aria-checked',String(!!input?.checked));b.onclick=()=>input?.click()}
  else if(el.matches('[data-zoom-fit]')){b.innerHTML='<span>Einpassen</span><span class="zoom-proxy-check" aria-hidden="true">✓</span>';b.setAttribute('aria-pressed',el.getAttribute('aria-pressed')||'false');b.onclick=()=>el.click()}
  else{b.textContent=label(el);b.onclick=()=>el.click()}
  return b;
 }
 function sync(menu){for(const b of menu.querySelectorAll('button')){const el=b._target;if(!el)continue;if(el.matches('.plan-assess-switch'))b.setAttribute('aria-checked',String(!!el.querySelector('input')?.checked));else if(el.matches('[data-zoom-fit]'))b.setAttribute('aria-pressed',el.getAttribute('aria-pressed')||'false');b.disabled=!!el.disabled}}
 function fit(){
  planned=false;const bar=document.querySelector('.classroom-plan-zoom');if(!bar)return;
  if(observed!==bar){observed=bar;new MutationObserver(list=>{if(list.some(m=>[...m.addedNodes,...m.removedNodes].some(n=>!n.closest?.('.zoom-more')&&!(n.matches?.('.zoom-more')))))schedule()}).observe(bar,{childList:true});new ResizeObserver(schedule).observe(bar);bar.addEventListener('change',()=>sync(bar.querySelector('.zoom-more-menu')||document.createElement('div')))}
  const more=ensureMore(bar),menu=more.querySelector('.zoom-more-menu'),list=items(bar),beamer=document.documentElement.classList.contains('classroom-beamer');
  for(const el of list)el.classList.remove('zoom-collapsed');more.hidden=false;bar.classList.add('zoom-fit-row');bar.classList.remove('zoom-fit-wrap');
  const over=()=>bar.scrollWidth>bar.clientWidth+1,hidden=[];
  if(!beamer&&bar.clientWidth>0)for(const el of list){if(!over())break;el.classList.add('zoom-collapsed');hidden.push(el)}
  more.hidden=!hidden.length;if(!hidden.length)close();
  if(bar.clientWidth>0&&over())bar.classList.add('zoom-fit-wrap');
  const kids=[...bar.children];hidden.sort((a,b)=>kids.indexOf(a)-kids.indexOf(b));
  const key=hidden.map(label).join('|');
  if(key!==lastKey){lastKey=key;menu.replaceChildren(...hidden.map(proxyFor))}
  sync(menu);
 }
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
  fix();new MutationObserver(fix).observe(document.body,{subtree:true,childList:true,characterData:true});
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
 bar.innerHTML='<label class="pl-date"><span class="pl-date-text">Heute</span><span class="pl-chev">▾</span><input type="date" aria-label="Datum der Unterrichtsstunde"></label><button type="button" class="pl-rotate" aria-pressed="false"><span aria-hidden="true">⇅</span> Perspektive</button>';
 const dateInput=bar.querySelector('input'),dateText=bar.querySelector('.pl-date-text'),rotateBtn=bar.querySelector('.pl-rotate');
 const syncDate=()=>{dateInput.value=classroomDate.value;dateText.textContent=dateLabel(classroomDate.value);bar.querySelector('.pl-date').classList.toggle('is-past',classroomDate.value!==iso(new Date()))};
 dateInput.addEventListener('change',()=>{if(!dateInput.value)return;classroomDate.value=dateInput.value;classroomDate.dispatchEvent(new Event('input',{bubbles:true}));classroomDate.dispatchEvent(new Event('change',{bubbles:true}));syncDate()});
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
