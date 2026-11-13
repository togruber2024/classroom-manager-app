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
;

/* ==== index.html (eingebettet) ==== */

/* „Alle Daten löschen“: nach dem Neuladen zuerst alles entfernen – bevor ein Skript Speicher oder Datenbanken öffnet. */
try{if(sessionStorage.getItem('classroom-reset-all')==='1'){sessionStorage.clear();localStorage.clear();for(const name of ['classroom-manager-sync','classroom-manager-auto-backup','classroom-manager-backup-crypto'])indexedDB.deleteDatabase(name);/* leer starten statt mit Beispieldaten */localStorage.setItem('notenrechner-klassen-v1','{}');localStorage.setItem('sitzplan_beispielklassen_v1','1');sessionStorage.setItem('classroom-reset-done','1')}}catch{}
const tabs=[...document.querySelectorAll('[data-view]')];/* 11.23: drei Bereiche – Sitzplan · Unterricht · Noten. „Unterricht“ nutzt den Sitzplan-Rahmen (ganz ausgefüllt, siehe sitzplan/einheiten.js). */function selectView(view){const u=view==='unterricht',fv=u||view==='sitzplan'?'sitzplan':'noten',v=u?'unterricht':fv;try{localStorage.setItem('classroom-manager-last-view-v1',v)}catch{}if(fv==='sitzplan'&&typeof classroomRequestRosters==='function')classroomRequestRosters();for(const tab of tabs){const active=tab.dataset.view===v;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1}for(const id of ['noten','sitzplan']){const frame=document.getElementById('view-'+id),active=id===fv;frame.hidden=!active;if(active&&frame.dataset.src){frame.src=frame.dataset.src;delete frame.dataset.src;}}const sf=document.getElementById('view-sitzplan');sf.dataset.mode=u?'unterricht':'';try{sf.contentWindow?.classroomEinheiten?.mode(u)}catch{}document.documentElement.classList.toggle('view-unterricht',u)}for(const tab of tabs){tab.addEventListener('click',()=>selectView(tab.dataset.view));tab.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(tabs.indexOf(tab)+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectView(tabs[index].dataset.view);tabs[index].focus();}});}
/* Start: zuletzt benutzter Manager, wenn die App vor weniger als 2 Stunden noch offen war – sonst Unterrichts-Manager. */
const resumeKey='classroom-manager-last-active-v1',resumeWindow=2*60*60*1000;
function markActive(){try{localStorage.setItem(resumeKey,String(Date.now()))}catch{}}
document.addEventListener('DOMContentLoaded',()=>{let view='sitzplan';try{const last=localStorage.getItem('classroom-manager-last-view-v1'),active=Number(localStorage.getItem(resumeKey)||0);if(last&&active&&Date.now()-active<resumeWindow)view=last}catch{}selectView(view);markActive()});
setInterval(()=>{if(document.visibilityState==='visible')markActive()},60000);
document.addEventListener('visibilitychange',markActive);addEventListener('pagehide',markActive);;
;

/* ==== model.js ==== */
(function(root){
/* 9.92: gemerkt – wird beim Abgleich der Klassenlisten sehr oft mit denselben Namen aufgerufen */const normalizeCache=new Map();const normalize=value=>{const k=String(value||'');let r=normalizeCache.get(k);if(r===undefined){r=k.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-DE');if(normalizeCache.size>50000)normalizeCache.clear();normalizeCache.set(k,r)}return r};
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

/* ==== gender-names.js ==== */
/* Vorschläge für das Geschlecht aus dem Vornamen (nur als Vorschlag im Dialog „Geschlecht bearbeiten“, nie automatisch gespeichert).
   Lokale Liste häufiger Vornamen in Deutschland (rund 1006 Namen); uneindeutige Namen (z. B. Kim, Luca, Toni) erhalten keinen Vorschlag.
   classroomGenderGuess(name) → 'm' | 'w' | '?' (uneindeutig) | null (unbekannt). Name als „Nachname, Vorname“ oder „Vorname Nachname“. */
(()=>{
 const W=new Set("aaliyah abby ada adela adele adelina adriana agata agathe agnes aileen aimee aisha aiyana alana alba aleksandra alena alessia alexa alexandra alexia alia alice alicia alina aline alisa alissa aliya aliyah allegra alma almila alva alyssa amalia amanda amelia amelie amelie-sophie amelina amina amira amy ana anastasia anastasiya andrea anela angela angelika angelina anika anissa anita anja anjali ann anna anna-lena annabell annabella annabelle annalena anne annelie annemarie annette anni annika annkathrin antje antonella antonia anya april arabella aria ariana arina arya asena asli asya aurelia ava ayla aylin ayse aysel aysun azra barbara beatrice beatrix belinda bella bente berit berivan bettina betty bianca birgit birte blanka brigitte britta bruna büsra camila camilla canan cara carina carla carlotta carmen carolin caroline cassandra catharina catherine cecilia celina celine chantal charleen charlotte chiara chloe christa christiane christin christina cindy clara clarissa claudia cora corinna cornelia dalia dana daniela daria darja dayana defne delia denise derya diana dilan dilara dilay dora doreen dorothea dorothee dunja ebru ece eda edda edith ela elaine elena elfriede eliana eliane elif elin elina elisa elisabeth elise eliza ella elle ellen ellie elly elodie eloise elsa else elvira ema emelie emely emilia emilie emily emina emine emma emmely emmi emmy enya erika esma esmeralda esra estelle ester esther eva evelin evelyn ewa fabienne fatima fatma felicia felicitas feline fenja filippa fine finja fiona franca franziska frauke frida frieda friederike gabriela gabriele gina giulia gloria greta gretchen grete gudrun gül gülsüm hafsa hailey hana hanna hannah hannelore hatice havin hayat hedda heidi helen helena helene helin henriette henrike hermine hilal hira ida ilayda ilka ilona imke ina ines inga ingrid inka irem irene irina iris irmgard isabel isabell isabella isabelle isra ivana jacqueline jamila jana janina janne jasmin jasmina jella jennifer jenny jessica jette jillian joana johanna jolie jolien jolina jorinde josefine josephine judith jula jule julia juliana julie juliette jutta kamila karin karina karla karolina kassandra katarina katharina kathrin katja katrin keira kerstin kiara kim-lea kira klara klaudia klementine kristin lana lanah lara larissa laura laureen lavinia layla lea leah leefke leentje leila lena lene leni leni-marie leona leonie leticia leyla lia liana liane lieke lilia lilian liliana lilli lillian lilly lily lina linda line linn linnea lisa lisann liv liz lotta lotte lou louisa louise luana lucia lucie lucy luisa luise lydia madita madleen madlen magdalena maike maila mailin maja malak malea malia malin malina manja manuela mara mareike maren maresa margarete margot maria mariam marie marie-sophie marieke mariella marike marina marion marit marla marleen marlen marlena marlene marta martha martina mary maryam mathilda mathilde matilda maya medina meike melanie melek melina melis melisa melissa merle merve mia michaela mila milena mina mira miray miriam mona monika muriel nadia nadine nadja naomi natalia natalie nathalie nayla nehir nela nele nelly nesrin nicole nike nina nisa noemi nora norah odette olga olivia ottilie paula paulina pauline petra philippa phoebe pia rabia rahel ramona rebecca rebekka regina renate ricarda rieke rita romy ronja rosa rosalie rosemarie ruth sabine sabrina safiya sahra salma salome samira sandra sara sarah saskia selin selina selma serap serena sevgi sibel sienna silke simone sina smilla sofia sofie sonja sophia sophie stefanie stella stephanie susanne svenja svetlana sylvia tabea talia tamara tamila tania tanja tatjana teresa thea theresa therese tilda tina tomke tomma tuana ulrike ursula valentina valeria valerie vanessa vera verena veronika victoria viktoria vivian viviane wenke wiebke wilma xenia yara yasemin yasmin yeliz ylvi ylvie yvonne zehra zeynep zoe zoey zofia zoé".split(' ')),M=new Set("aaron abdul abdullah adam adem adrian ahmad ahmed ahmet aiden alan albert alessandro alessio alexander alfred ali alim amin amir anas andre andreas andrej andrzej angelo anton antonio aras arda ari arian arik armin arne arthur artur arvid aurel axel ayaz aziz bastian ben benedikt benjamin benno bent berat bernd bernhard bjarne björn boris bruno burak calvin can carl carlo carlos carsten cedric christian christoph christopher claas clemens colin conrad constantin cornelius curt damian daniel danny dario darius david davide dean dennis devin diego dieter dimitri dirk dominic dominik dustin eddie edgar eduard edward efe egon eliah elias elijah emil emilio emir emre enes enno enrico eric erik ernst erwin eymen fabian fabio falk faruk felix ferdinand fiete filip finley finn finnlay florian flynn francesco frank franz frederick frederik friedrich fritz fynn gabriel georg george gerhard gerrit giovanni gregor gustav günter hamza hannes hans harald harry hasan hauke heiko heinrich heinz helmut hendrik henning henri henrik henry herbert hermann hinnerk hugo hüseyin ian ibrahim igor ilias ilja ivan jacob jakob jamal james jan janek janik jannes jannik jannis jarne jaron jason jasper jayden jelte jens jeremias jeremy jesper joachim joel johan johann johannes john jon jona jonah jonas jonathan jonte joop joost joris jose josef joseph joshua julian julius jun justin justus jürgen kaan karim karl karsten kasimir keanu keno kerem kevin kian kilian klaas klaus konrad konstantin kristian krzysztof kurt lars lasse laurenz laurin leander lenn lennard lennart lennert lennox lenny leo leon leonard leonardo leonhard leopold levi levin liam linus lio lion lorenz lorenzo louis luan lucas ludwig luis luka lukas luke lutz magnus maik malo malte manfred manuel marc marcel marco marcus mario marius mark markus martin marvin mathis mats matteo matthias mattis max maxim maximilian mehmet mehrdad merlin michael michel miguel mikail mike milan milo mirko mohamed mohammad mohammed moritz muhammed murat mustafa nathan neo nick niclas nico nicolas niels niklas nikolai nikolas nils noah noel norbert ocke ole oliver omar onno oscar oskar otto pascal patrick paul paulo peer pepe per peter philip philipp pierre piet quentin rafael ralf ramon ramy raphael rasmus reinhard rene richard rico robert roland roman ron ronny rudolf ryan rüdiger sachar sami samir samuel sandro sebastian sem semih sergej serkan severin simon stefan steffen stephan sven tade tamme tammo teo theo thies thilo thomas thorben thore thorge thorsten till tilo tim timo tjark tjorben tobias tom tommy torben torsten tristan ufuk ugur ulrich umut uwe valentin viktor vincent vinzent volker walter werner wiktor wilhelm willi william wolfgang wout xaver yannick yannik yasin yigit yunus yusuf zacharias zeki".split(' ')),A=new Set("alex bo charlie chris deniz eden eike emery gabi jamie jean jessie jo jules kai kaya kim luca maxi mika mischa nikita nikola noa nour robin sam sascha sky taylor toni vanja yuri".split(' '));
 const plain=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function look(n){for(const c of [n,plain(n)]){if(A.has(c))return '?';if(W.has(c))return 'w';if(M.has(c))return 'm'}return null}
 window.classroomFirstName=name=>{let s=String(name||'').trim();if(s.includes(','))s=s.split(',').slice(1).join(',').trim();return (s.split(/\s+/)[0]||'').toLocaleLowerCase('de-DE')};
 // Selbst gelernte Vornamen (lokal, im Backup und im Geräte-Abgleich): {vorname:{g:'m'|'w'|'?'}} – haben Vorrang vor der Liste.
 const KEY='notenrechner-vornamen-gelernt-v1';
 const learned=()=>{try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');return o&&typeof o==='object'?o:{}}catch{return {}}};
 const storeLearned=o=>{try{localStorage.setItem(KEY,JSON.stringify(o))}catch{}};
 function lookAll(n){const L=learned();for(const c of [n,plain(n)])if(L[c]?.g)return L[c].g;return look(n)}
 window.classroomGenderGuess=name=>{const f=window.classroomFirstName(name);if(!f)return null;const whole=lookAll(f);if(whole)return whole;const part=f.split('-')[0];return part&&part!==f?lookAll(part):null};
 window.classroomGenderBase=name=>{const f=window.classroomFirstName(name);if(!f)return null;return look(f)||(f.includes('-')?look(f.split('-')[0]):null)};
 window.classroomLearnedCount=()=>Object.keys(learned()).length;
 // Nach dem Speichern: unbekannte Namen lernen; korrigierte Vorschläge und Widersprüche als „nicht eindeutig“ merken.
 window.classroomLearnGenders=items=>{const L=learned();let changed=false;
  for(const {name,gender,guess,suggest} of items){if(gender!=='m'&&gender!=='w')continue;const f=window.classroomFirstName(name);if(!f||f.length<2)continue;
   const cur=L[f]?.g;
   if(guess===null||(cur&&!suggest)){const g=cur&&cur!==gender?'?':gender;if(cur!==g){L[f]={g};changed=true}}
   else if(suggest&&gender!==suggest){if(cur!=='?'){L[f]={g:'?'};changed=true}}
  }
  if(changed)storeLearned(L);return changed};
 // Geschlechter aus einer verlässlichen Liste (Klassenlisten-PDF der Schule) übernehmen: unbekannte oder von der Namensliste
 // abweichende Vornamen lernen; kommt ein Vorname mit beiden Geschlechtern vor oder widerspricht er Gelerntem → „nicht eindeutig“.
 // Mehrdeutige Namen der Liste (z. B. Kim) bleiben ohne Vorschlag.
 window.classroomLearnGendersFromList=items=>{const L=learned(),seen=new Map();let n=0;
  for(const {name,gender} of items||[]){if(gender!=='m'&&gender!=='w')continue;const f=window.classroomFirstName(name);if(!f||f.length<2)continue;if(!seen.has(f))seen.set(f,new Set());seen.get(f).add(gender)}
  for(const [f,set] of seen){const g=set.size>1?'?':[...set][0],cur=L[f]?.g;if(cur==='?')continue;
   if(cur){if(cur!==g){L[f]={g:'?'};n++}continue}
   const base=look(f)||(f.includes('-')?look(f.split('-')[0]):null);if(base==='?'||base===g)continue;L[f]={g};n++}
  if(n)storeLearned(L);return n};
 // Vorschläge für eine Namensliste (z. B. Kursliste ohne Geschlecht) an den Noten-Manager liefern; mehrdeutig/unbekannt → leer.
 window.addEventListener('message',event=>{const msg=event.data;if(msg?.type!=='classroom:gender-guess'||!Array.isArray(msg.names))return;if(![...document.querySelectorAll('iframe')].some(f=>f.contentWindow===event.source))return;event.source.postMessage({type:'classroom:gender-guess-result',id:msg.id,guesses:msg.names.map(n=>{const g=window.classroomGenderGuess(n);return g==='m'||g==='w'?g:''})},'*')});
 window.addEventListener('message',event=>{const msg=event.data;if(msg?.type!=='classroom:learn-genders-list'||!Array.isArray(msg.items))return;if(![...document.querySelectorAll('iframe')].some(f=>f.contentWindow===event.source))return;window.classroomLearnGendersFromList(msg.items)});
 // Liste der gelernten Namen ansehen und bearbeiten
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const cap=s=>s.replace(/(^|[-\s])(\p{L})/gu,(m,a,b)=>a+b.toLocaleUpperCase('de-DE'));
 window.classroomOpenLearnedNames=()=>new Promise(resolve=>{
  const draft=Object.entries(learned()).map(([name,v])=>({name,g:v.g})).sort((a,b)=>a.name.localeCompare(b.name,'de'));
  const d=document.createElement('dialog');d.className='ui-dialog learned-names';
  d.innerHTML='<h2>Gelernte Vornamen</h2><p class="ui-dialog-text">Diese Vornamen hat die App aus deinen Angaben gelernt. Sie haben Vorrang vor der eingebauten Liste. „Nicht eindeutig“ bedeutet: kein Vorschlag.</p><div class="ln-rows"></div><div class="ln-add"><input type="text" placeholder="Vorname" aria-label="Vorname hinzufügen" autocomplete="off"><select aria-label="Geschlecht"><option value="w">w</option><option value="m">m</option><option value="?">nicht eindeutig</option></select><button type="button" data-add>Hinzufügen</button></div><div class="ui-dialog-actions"><button type="button" data-c>Abbrechen</button><button type="button" class="ui-primary" data-s>Speichern</button></div>';
  document.body.append(d);const rows=d.querySelector('.ln-rows');
  const render=()=>{rows.innerHTML=draft.length?draft.map((r,i)=>`<div class="ln-row"><span>${esc(cap(r.name))}</span><select data-i="${i}" aria-label="Geschlecht für ${esc(cap(r.name))}"><option value="w"${r.g==='w'?' selected':''}>w</option><option value="m"${r.g==='m'?' selected':''}>m</option><option value="?"${r.g==='?'?' selected':''}>nicht eindeutig</option></select><button type="button" class="ln-del" data-del="${i}" aria-label="${esc(cap(r.name))} entfernen" title="Entfernen">−</button></div>`).join(''):'<p class="ln-empty">Noch keine gelernten Vornamen.</p>'};
  render();d.showModal();
  rows.addEventListener('change',e=>{const s=e.target.closest('[data-i]');if(s)draft[Number(s.dataset.i)].g=s.value});
  rows.addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(b){draft.splice(Number(b.dataset.del),1);render()}});
  const add=()=>{const inp=d.querySelector('.ln-add input'),name=inp.value.trim().split(/\s+/)[0]?.toLocaleLowerCase('de-DE');if(!name)return;const g=d.querySelector('.ln-add select').value;const ex=draft.find(r=>r.name===name);if(ex)ex.g=g;else draft.push({name,g});draft.sort((a,b)=>a.name.localeCompare(b.name,'de'));inp.value='';render();inp.focus()};
  d.querySelector('[data-add]').onclick=add;d.querySelector('.ln-add input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add()}});
  const done=v=>{d.close();d.remove();resolve(v)};
  d.querySelector('[data-c]').onclick=()=>done(false);d.addEventListener('cancel',e=>{e.preventDefault();done(false)});
  d.querySelector('[data-s]').onclick=()=>{const o={};for(const r of draft)o[r.name]={g:r.g};storeLearned(o);done(true)};
 });
 const style=document.createElement('style');style.textContent='.learned-names{width:min(480px,calc(100vw - 24px))}.ln-rows{max-height:46vh;overflow:auto;margin-top:12px;border:1px solid #e6ebf3;border-radius:10px}.ln-row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-top:1px solid #eef2f8}.ln-row:first-child{border-top:0}.ln-row span{flex:1}.ui-dialog .ln-row select,.ui-dialog .ln-add select{min-height:32px;padding:3px 6px;border:1px solid #cbd6e5;border-radius:8px;background:#fff;font:inherit;font-size:.9rem}.ln-del{width:30px;height:30px;border:1px solid #e3c4c0;border-radius:8px;background:#fff;color:#b42318;font:inherit;cursor:pointer}.ln-empty{margin:10px;color:#66758a}.ln-add{display:flex;gap:8px;align-items:center;margin-top:10px}.ui-dialog .ln-add input{flex:1;margin:0;min-height:34px}.ln-add button{min-height:34px;padding:4px 12px;border:1px solid #cbd6e5;border-radius:8px;background:#fff;color:var(--primary,#2f5f9b);font:inherit;font-weight:600;cursor:pointer}';
 (document.head||document.documentElement).append(style);
})();
;

/* ==== classroom-link.js ==== */
const classroomNotes=document.getElementById('view-noten'),classroomSeats=document.getElementById('view-sitzplan');
const classroomModelKey='classroom-manager-common-v2';
let classroomModel;try{classroomModel=JSON.parse(localStorage.getItem(classroomModelKey))}catch{}
if(!classroomModel||classroomModel.version!==1)classroomModel=ClassroomCore.newModel();
ClassroomCore.repairRosterDuplicates(classroomModel);
let classroomLastSnapshot=null,classroomNotesReady=false,classroomSeatReady=false,classroomRestoring=false;
const classroomRPC=new Map();
function classroomPersist(){localStorage.setItem(classroomModelKey,JSON.stringify(classroomModel))}
function classroomSend(frame,message){frame.contentWindow?.postMessage(message,'*')}
function classroomRequestRosters(){if(classroomNotesReady&&!classroomRestoring)classroomSend(classroomNotes,{type:'classroom:request-rosters'})}
function classroomPruneClasses(sources){
 const liveSources=new Set(sources.map(source=>source.id));
 for(const source of Object.keys(classroomModel.sourceClasses))if(!liveSources.has(source)){delete classroomModel.sourceClasses[source];delete classroomModel.sourceClassLabels?.[source]}
 for(const alias of Object.keys(classroomModel.studentAliases))if(![...liveSources].some(source=>alias.startsWith(source+'::')))delete classroomModel.studentAliases[alias];
 const referenced=new Set(Object.values(classroomModel.sourceClasses)),removed=classroomModel.classes.filter(group=>!referenced.has(group.id));
 if(!removed.length)return;
 classroomModel.classes=classroomModel.classes.filter(group=>referenced.has(group.id));
 const linkKey='classroom-manager-linked-classes-v1';let links={};try{links=JSON.parse(localStorage.getItem(linkKey)||'{}')}catch{}
 const storageNames=new Set();for(const group of removed){storageNames.add(links[group.id]?.storageName||`NM:${encodeURIComponent(group.id)}`);delete links[group.id]}
 for(const [source,link] of Object.entries(links))if(!referenced.has(source)&&!liveSources.has(source)&&storageNames.has(link.storageName))delete links[source];
 for(const name of storageNames){const prefix='sitzplan_'+name.replace(/\s+/g,'_')+'_';for(const key of Object.keys(localStorage))if(key.startsWith(prefix))localStorage.removeItem(key)}
 localStorage.setItem(linkKey,JSON.stringify(links));
 try{const classes=JSON.parse(localStorage.getItem('sitzplan_klassen_liste')||'[]');localStorage.setItem('sitzplan_klassen_liste',JSON.stringify(classes.filter(name=>!storageNames.has(name))));const history=JSON.parse(localStorage.getItem('sitzplan_dated_layouts_v1')||'{}');for(const name of storageNames)delete history[name];localStorage.setItem('sitzplan_dated_layouts_v1',JSON.stringify(history))}catch{}
}
/* 10.42: Umbenennen auch aus der Schülerübersicht */
function classroomRenamePerson(msg){const group=classroomModel.classes.find(g=>g.id===msg.classId),person=group?.students.find(s=>s.id===msg.studentId&&!s.deleted),name=String(msg.name||'').trim();if(!person||!name||group.students.some(s=>!s.deleted&&s.id!==person.id&&ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name)))throw new Error('Bitte einen eindeutigen Namen eingeben.');{const before=person.name;if(before!==name){person.formerNames=[...(person.formerNames||[]).filter(n=>ClassroomCore.normalize(n)!==ClassroomCore.normalize(name)&&ClassroomCore.normalize(n)!==ClassroomCore.normalize(before)),before].slice(-8);/* 8.30: Notizen (am Namen gespeichert) mitnehmen */try{const K='notenrechner-notizen-v1',all=JSON.parse(localStorage.getItem(K)||'{}'),o=String(before).trim().toLocaleLowerCase('de-DE'),nn=String(name).trim().toLocaleLowerCase('de-DE');let ch=false;for(const src of Object.keys(classroomModel.sourceClasses||{}).filter(k=>classroomModel.sourceClasses[k]===group.id)){const a=src+'::'+o,b=src+'::'+nn;if(a!==b&&all[a]!==undefined&&all[b]===undefined){const v=all[a];all[b]=typeof v==='object'&&v?{...v,n:name}:v;delete all[a];ch=true}}if(ch)localStorage.setItem(K,JSON.stringify(all))}catch{}}person.name=name}classroomBroadcast();classroomRequestRosters()}
window.classroomRenamePerson=classroomRenamePerson;
function classroomBroadcast(){
 classroomPersist();classroomSend(classroomNotes,{type:'classroom:canonical',model:classroomModel});
 if(classroomSeatReady)classroomSend(classroomSeats,{type:'classroom:linked-state',model:classroomModel,snapshot:classroomLastSnapshot});
}
function classroomSetAbsence(msg){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(msg.date))throw new Error('Ungültiges Datum.');
 const group=classroomModel.classes.find(c=>c.id===msg.classId);if(!group?.students.some(s=>s.id===msg.studentId&&!s.deleted))throw new Error('Die Person ist nicht mehr in der Klasse.');
 if(!!group.attendance?.[msg.date]?.[msg.studentId]===!!msg.absent)return;group.attendance[msg.date]??={};group.attendance[msg.date][msg.studentId]=!!msg.absent;classroomBroadcast();
}
function classroomCallOnce(frame,type,extra={}){const id=crypto.randomUUID?.()||String(Date.now()+Math.random());return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{classroomRPC.delete(id);reject(Object.assign(new Error('Die Anwendung antwortet nicht. Bitte erneut versuchen.'),{classroomTimeout:true}))},12000);classroomRPC.set(id,{frame,resolve,reject,timer});classroomSend(frame,{type,id,...extra})})}
/* Antwortet ein Bereich nicht (z. B. nach einem Fehler beim Aufbau), wird er einmal neu geladen und die Anfrage wiederholt. */
const classroomFrameName=frame=>frame===classroomNotes?'Noten-Manager':'Unterrichts-Manager';
function classroomReloadFrame(frame){return new Promise(resolve=>{const ready=frame===classroomNotes?'classroom:noten-ready':'classroom:seat-ready';let done=false;const finish=()=>{if(done)return;done=true;window.removeEventListener('message',onMessage);setTimeout(resolve,400)};const onMessage=e=>{if(e.source===frame.contentWindow&&e.data?.type===ready)finish()};window.addEventListener('message',onMessage);setTimeout(finish,10000);try{frame.contentWindow.location.reload()}catch{const src=frame.src;frame.src='about:blank';frame.src=src}})}
async function classroomCall(frame,type,extra={}){try{return await classroomCallOnce(frame,type,extra)}catch(error){if(!error.classroomTimeout)throw error;window.classroomLogError?.(classroomFrameName(frame)+' antwortet nicht ('+type.replace('classroom:','')+') – wird neu geladen','classroom-link.js');const statusBox=document.getElementById('classroomBackupStatus');if(statusBox?.closest('dialog')?.open)statusBox.textContent=classroomFrameName(frame)+' reagiert nicht und wird neu geladen … bitte kurz warten.';await classroomReloadFrame(frame);try{return await classroomCallOnce(frame,type,extra)}catch(again){if(again.classroomTimeout)window.classroomLogError?.(classroomFrameName(frame)+' antwortet auch nach dem Neuladen nicht ('+type.replace('classroom:','')+')','classroom-link.js');throw again}}}
/* Notweg ohne die Bereiche: Daten direkt aus dem gemeinsamen Gerätespeicher lesen bzw. dorthin schreiben. */
const classroomNotesKey=k=>k.startsWith('notenrechner-'),classroomSeatsKey=k=>k.startsWith('sitzplan_')||k.startsWith('classroom-manager-linked-classes-');
function classroomDirectValues(test){const values={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(test(k))values[k]=localStorage.getItem(k)}return values}
function classroomDirectRestore(backup){const before={...classroomDirectValues(classroomNotesKey),...classroomDirectValues(classroomSeatsKey)},beforeModel=localStorage.getItem(classroomModelKey);try{for(const k of Object.keys(before))localStorage.removeItem(k);for(const [k,v] of Object.entries({...backup.notes,...backup.seats}))localStorage.setItem(k,v);localStorage.setItem(classroomModelKey,JSON.stringify(backup.model))}catch(error){for(const k of Object.keys({...backup.notes,...backup.seats}))localStorage.removeItem(k);for(const [k,v] of Object.entries(before))localStorage.setItem(k,v);if(beforeModel!==null)localStorage.setItem(classroomModelKey,beforeModel);throw new Error('Das Backup passt nicht in den Speicher dieses Geräts. Die bisherigen Daten bleiben erhalten.')}}
window.addEventListener('message',async event=>{
 if(event.source!==classroomNotes.contentWindow&&event.source!==classroomSeats.contentWindow)return;
 const msg=event.data||{},fromNotes=event.source===classroomNotes.contentWindow;
 if(msg.id&&classroomRPC.has(msg.id)){
  const request=classroomRPC.get(msg.id);if(event.source!==request.frame.contentWindow)return;
  clearTimeout(request.timer);classroomRPC.delete(msg.id);if(msg.ok===false||msg.type==='classroom:error')request.reject(new Error(msg.message||'Die Aktion konnte nicht abgeschlossen werden.'));else request.resolve(msg);return;
 }
 if(classroomRestoring)return;
 try{
 if(fromNotes){
  if(msg.type==='classroom:noten-ready'){classroomNotesReady=true;classroomRequestRosters()}
  else if(msg.type==='classroom:rosters'){classroomLastSnapshot=msg.snapshot;classroomPruneClasses(msg.snapshot.classes);ClassroomCore.ingest(classroomModel,msg.snapshot.classes);for(const source of msg.snapshot.classes){const group=classroomModel.classes.find(g=>g.id===classroomModel.sourceClasses[source.id]);if(!group)continue;if(!group.gradingSystem&&['grades','gradePoints'].includes(source.gradingSystem))group.gradingSystem=source.gradingSystem;for(const absence of source.absences||[]){const alias=classroomModel.studentAliases[source.id+'::'+absence.id],person=group.students.find(s=>!s.deleted&&(s.id===absence.id||s.id===alias?.id||ClassroomCore.normalize(s.name)===ClassroomCore.normalize(absence.name)));if(person&&/^\d{4}-\d{2}-\d{2}$/.test(absence.date)){group.attendance[absence.date]??={};if(group.attendance[absence.date][person.id]===undefined)group.attendance[absence.date][person.id]=true}}}classroomBroadcast()}
  else if(msg.type==='classroom:grading-system'){const group=classroomModel.classes.find(g=>g.id===classroomModel.sourceClasses[msg.source]);if(group&&['grades','gradePoints'].includes(msg.system)){group.gradingSystem=msg.system;classroomBroadcast()}}
  else if(msg.type==='classroom:rename-student'){classroomRenamePerson(msg)}
  else if(msg.type==='classroom:attendance')classroomSetAbsence(msg);
  else if(msg.type==='classroom:roster-delete'){const group=classroomModel.classes.find(c=>c.id===msg.classId);for(const person of group?.students||[])if(msg.studentIds?.includes(person.id))person.deleted=true;classroomBroadcast();classroomRequestRosters();}
 }else{
  if(msg.type==='classroom:seat-ready'||msg.type==='classroom:request-rosters'){classroomSeatReady=true;if(classroomLastSnapshot)classroomSend(classroomSeats,{type:'classroom:linked-state',model:classroomModel,snapshot:classroomLastSnapshot});classroomRequestRosters()}
  else if(msg.type==='classroom:attendance')classroomSetAbsence(msg);
  else if(msg.type==='classroom:roster-delete'){const group=classroomModel.classes.find(c=>c.id===msg.classId);for(const person of group?.students||[])if(msg.studentIds?.includes(person.id))person.deleted=true;classroomBroadcast();classroomRequestRosters();}
  else if(msg.type==='classroom:save-record'){
   try{
    // Validate / save assessment before committing the shared attendance change.
    const recordResult=await classroomCall(classroomNotes,'classroom:record',{payload:msg.payload});
    if(msg.payload.attendanceChanged!==false)classroomSetAbsence({classId:msg.payload.classId,studentId:msg.payload.studentId,date:msg.payload.date,absent:msg.payload.absent});
    classroomSend(classroomSeats,{type:'classroom:save-result',requestId:msg.requestId,ok:true,canUndo:recordResult.canUndo,historyContext:recordResult.historyContext});classroomRequestRosters();
   }catch(error){classroomSend(classroomSeats,{type:'classroom:save-result',requestId:msg.requestId,ok:false,message:error.message})}
  }else if(msg.type==='classroom:manage-classes'){selectView('noten');classroomSend(classroomNotes,{type:'classroom:manage-classes',create:msg.create,source:classroomModel.sourceClasses[classroomLastSnapshot?.activeClass]===msg.classId?classroomLastSnapshot.activeClass:Object.keys(classroomModel.sourceClasses).find(k=>classroomModel.sourceClasses[k]===msg.classId)});
  }else if(msg.type==='classroom:roster-edit'){
   const group=classroomModel.classes.find(c=>c.id===msg.classId);if(!group)throw new Error('Klasse nicht gefunden.');
   let person=group.students.find(s=>s.id===msg.studentId&&!s.deleted);const name=String(msg.name||'').trim();if(!name||group.students.some(s=>!s.deleted&&s.id!==person?.id&&ClassroomCore.normalize(s.name)===ClassroomCore.normalize(name)))throw new Error('Bitte einen eindeutigen Namen eingeben.');
   if(!person){person={id:'student-'+crypto.randomUUID(),name};group.students.push(person)}person.name=name;if(msg.gender!==undefined)person.gender=msg.gender;classroomBroadcast();classroomRequestRosters();
  }else if(msg.type==='classroom:roster-delete'){const group=classroomModel.classes.find(c=>c.id===msg.classId);for(const person of group?.students||[])if(msg.studentIds?.includes(person.id))person.deleted=true;classroomBroadcast();classroomRequestRosters();
  }else if(msg.type==='classroom:roster-request')classroomOpenRoster(msg.classId);
 }
 }catch(error){classroomSend(classroomSeats,{type:'classroom:sync-error',message:error.message})}
});
classroomNotes.addEventListener('load',()=>{classroomNotesReady=true;classroomRequestRosters()});
function classroomToday(){const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`}
function classroomEnsureSeats(){if(classroomSeats.dataset.src){classroomSeats.src=classroomSeats.dataset.src;delete classroomSeats.dataset.src}return new Promise((resolve,reject)=>{let attempts=0;const timer=setInterval(()=>{if(classroomSeatReady){clearInterval(timer);resolve()}else if(++attempts>100){clearInterval(timer);reject(new Error('Der Sitzplan konnte nicht geladen werden.'))}},100)})}
let classroomBackupWasDirect=false;
async function classroomBackupData(){
 classroomBackupWasDirect=false;const ask=async(frame,test)=>{try{if(frame===classroomSeats)await classroomEnsureSeats();return (await classroomCall(frame,'classroom:backup-request')).values}catch(error){window.classroomLogError?.('Backup: '+classroomFrameName(frame)+' – Daten direkt aus dem Speicher gelesen ('+error.message+')','classroom-link.js');classroomBackupWasDirect=true;return classroomDirectValues(test)}};
 const [notes,seats]=await Promise.all([ask(classroomNotes,classroomNotesKey),ask(classroomSeats,classroomSeatsKey)]);
 /* 10.33: Vokabular aus den Lehrbuch-PDFs und iPad-Vokabeltests mitsichern */const extras={};for(const k of classroomExtraKeys){try{const v=localStorage.getItem(k);if(v!=null)extras[k]=v}catch{}}
 /* 11.44: auf Wunsch auch das Schulbuchmaterial (Lerneinheiten-Dateien, Übersetzungs-Trainer, Inhaltsverzeichnis) */const books=await classroomBooksForBackup(extras);
 return {format:'classroom-manager-backup',version:1,createdAt:new Date().toISOString(),model:classroomModel,notes,seats,extras,...(books?{books}:{})}}
/* 11.23: auch Ergebnisse der Lerneinheiten und der „Stand“ je Lerngruppe */const classroomExtraKeys=['classroom-vocab-library-v1','classroom-vocab-library-wh-v1','classroom-vocab-tests-v1','classroom-grammar-library-v1','classroom-lerneinheiten-v1','classroom-unterricht-stand-v1','classroom-pins-v1','classroom-reihen-edit-v1'];
/* 11.24: Vokabular und Grammatik-Themen beim Wiederherstellen zusammenführen statt ersetzen – was seit dem Backup neu geladen wurde, bleibt erhalten */
function classroomMergeLib(own,inc,gram){if(!own?.lessons)return inc;if(!inc?.lessons)return own;const out=JSON.parse(JSON.stringify(own));
 for(const [k,L] of Object.entries(inc.lessons)){const O=out.lessons[k];if(!O){out.lessons[k]=L;continue}
  if(gram){O.formen??=[];const have=new Set(O.formen.map(x=>x.t));for(const f of L.formen||[])if(!have.has(f.t)){O.formen.push(f);have.add(f.t)}if(!O.syntax&&L.syntax)O.syntax=L.syntax;continue}
  O.sections??=[];for(const sec of L.sections||[]){const os=O.sections.find(x=>x.name===sec.name);if(!os){O.sections.push(sec);continue}const key=e=>(e.lemma||'')+'|'+(e.info||''),have=new Set((os.entries||[]).map(key));os.entries??=[];for(const e of sec.entries||[])if(!have.has(key(e))){os.entries.push(e);have.add(key(e))}}}
 if(!gram)out.updated=Date.now();return out}
const classroomMergeKeys={'classroom-vocab-library-v1':0,'classroom-vocab-library-wh-v1':0,'classroom-grammar-library-v1':1};
function classroomRestoreExtras(backup){const x=backup?.extras;if(!x||typeof x!=='object')return;for(const k of classroomExtraKeys){const v=x[k];if(typeof v!=='string')continue;
 try{const inc=JSON.parse(v);if(k in classroomMergeKeys){let own=null;try{own=JSON.parse(localStorage.getItem(k)||'null')}catch{}localStorage.setItem(k,JSON.stringify(classroomMergeLib(own,inc,classroomMergeKeys[k])))}else localStorage.setItem(k,v)}catch{}}}
/* 11.44: Schulbuchmaterial mitsichern (Schalter im Backup-Fenster) – damit alle Geräte nach dem Wiederherstellen dasselbe Material haben */
const classroomMaterialKey='classroom-backup-material-v1',classroomMaterialKeys=['classroom-text-trainer-v1','classroom-pontes-toc-v1'];
const classroomMaterialOn=()=>{try{return localStorage.getItem(classroomMaterialKey)==='1'}catch{return false}};
function classroomBookDb(mode,fn){return new Promise((res,rej)=>{try{const r=indexedDB.open('cm-lerneinheiten',1);r.onupgradeneeded=()=>r.result.createObjectStore('u');r.onerror=()=>rej(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('u',mode),q=fn(tx.objectStore('u'));tx.oncomplete=()=>{res(q&&q.result);db.close()};tx.onerror=()=>rej(tx.error)}}catch(e){rej(e)}})}
async function classroomBooksForBackup(extras){if(!classroomMaterialOn())return null;for(const k of classroomMaterialKeys){try{const v=localStorage.getItem(k);if(v!=null)extras[k]=v}catch{}}
 try{const keys=await classroomBookDb('readonly',st=>st.getAllKeys()),vals=await classroomBookDb('readonly',st=>st.getAll());const out={};(keys||[]).forEach((k,i)=>{out[k]=vals[i]});return out}catch{return {}}}
async function classroomRestoreBooks(backup){const x=backup?.extras||{};
 for(const k of classroomMaterialKeys){const v=x[k];if(typeof v!=='string')continue;try{const inc=JSON.parse(v);let own=null;try{own=JSON.parse(localStorage.getItem(k)||'null')}catch{}localStorage.setItem(k,JSON.stringify(own&&typeof own==='object'&&!Array.isArray(own)?{...own,...inc}:inc))}catch{}}
 const B=backup?.books;if(!B||typeof B!=='object')return;for(const [k,v] of Object.entries(B)){try{await classroomBookDb('readwrite',st=>st.put(v,k))}catch{}}}
/* 11.24: den Browser um dauerhaften Speicher bitten – dann räumt er Noten, Sitzpläne und Schulbuchmaterial nie von selbst auf */
try{navigator.storage?.persisted?.().then(p=>{if(!p)return navigator.storage.persist?.()}).catch(()=>{})}catch{}
function classroomValidBackup(data){
 if(data?.format!=='classroom-manager-backup'||data.version!==1||data.model?.version!==1||!Array.isArray(data.model.classes)||!data.model.sourceClasses||!data.model.studentAliases)throw new Error('Bitte ein gültiges Classroom-Manager-Backup auswählen.');
 for(const g of data.model.classes)if(typeof g.id!=='string'||typeof g.name!=='string'||!Array.isArray(g.students)||!g.attendance||g.students.some(s=>typeof s.id!=='string'||typeof s.name!=='string'))throw new Error('Die Klassenliste im Backup ist ungültig.');
 for(const [values,prefixes] of [[data.notes,['notenrechner-']],[data.seats,['sitzplan_','classroom-manager-linked-classes-']]]){if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('Das Backup enthält keine gültigen App-Daten.');for(const [key,value] of Object.entries(values)){if(!prefixes.some(p=>key.startsWith(p))||typeof value!=='string')throw new Error('Das Backup enthält ungültige Speicherwerte.');if(key!=='notenrechner-aktives-fach-v1'&&key!=='sitzplan_aktuelle_klasse')JSON.parse(value)}}
 return data;
}

// Excel-Export als Backup lesen: ausgeblendetes Blatt „Classroom-Backup“ (eigene oder von Excel gespeicherte Datei).
async function classroomUnzipXlsx(file){
 if(file.size>40*1024*1024)throw Error('Die Excel-Datei ist zu groß.');
 const bytes=new Uint8Array(await file.arrayBuffer()),view=new DataView(bytes.buffer),decode=new TextDecoder();let end=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break}
 if(end<0)throw Error('Bitte eine gültige Excel-Datei (XLSX) auswählen.');
 const files=new Map();let offset=view.getUint32(end+16,true);
 for(let i=0;i<view.getUint16(end+10,true);i++){
  if(view.getUint32(offset,true)!==0x02014b50)throw Error('Die Excel-Datei konnte nicht gelesen werden.');
  const flags=view.getUint16(offset+8,true),method=view.getUint16(offset+10,true),size=view.getUint32(offset+20,true),nameLength=view.getUint16(offset+28,true),extra=view.getUint16(offset+30,true),comment=view.getUint16(offset+32,true),local=view.getUint32(offset+42,true),name=decode.decode(bytes.slice(offset+46,offset+46+nameLength));offset+=46+nameLength+extra+comment;
  if(flags&1)throw Error('Passwortgeschützte Dateien werden nicht unterstützt.');if(!/\.xml$|\.rels$/.test(name))continue;
  const start=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true),packed=bytes.slice(start,start+size);let result;
  if(method===0)result=packed;else if(method===8){try{result=new Uint8Array(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}catch{throw Error('Dieser Browser kann die Excel-Datei nicht entpacken. Bitte einen aktuellen Browser verwenden.')}}else throw Error('Dieses Excel-Kompressionsformat wird nicht unterstützt.');
  files.set(name,decode.decode(result));
 }return files;
}
async function classroomBackupFromXlsx(file){
 const files=await classroomUnzipXlsx(file),parse=text=>new DOMParser().parseFromString(text,'application/xml'),workbook=files.get('xl/workbook.xml');
 const missing='Diese Excel-Datei enthält kein Classroom-Manager-Backup. Bitte einen Excel-Export ab Version 5.94 oder eine JSON-Sicherung wählen.';
 if(!workbook)throw Error(missing);
 const sheet=[...parse(workbook).getElementsByTagName('sheet')].find(s=>s.getAttribute('name')==='Classroom-Backup');if(!sheet)throw Error(missing);
 const id=sheet.getAttribute('r:id')||sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'),rel=[...parse(files.get('xl/_rels/workbook.xml.rels')||'<r/>').getElementsByTagName('Relationship')].find(r=>r.getAttribute('Id')===id);
 const target=rel?.getAttribute('Target')||'',path=target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,''),xml=files.get(path);if(!xml)throw Error(missing);
 const shared=[...parse(files.get('xl/sharedStrings.xml')||'<sst/>').getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent).join(''));
 const cells=[...parse(xml).getElementsByTagName('c')].filter(c=>/^A\d+$/.test(c.getAttribute('r')||'A1')).map(c=>c.getAttribute('t')==='s'?shared[Number(c.getElementsByTagName('v')[0]?.textContent)]??'':[...c.getElementsByTagName('t')].map(t=>t.textContent).join('')||c.getElementsByTagName('v')[0]?.textContent||'');
 if(cells[0]!=='CLASSROOM-MANAGER-BACKUP v1')throw Error(missing);
 return cells.slice(1).join('');
}
const tools=document.createElement('div');tools.className='classroom-global-actions';tools.innerHTML='<button type="button" id="classroomBackupButton">Backup</button>';
document.querySelector('.app-header').append(tools);
const backupDialog=document.createElement('dialog');backupDialog.className='classroom-dialog classroom-backup-dialog';backupDialog.innerHTML='<h2>Backup</h2><p>Sichert Klassen, Schülerlisten, Bewertungen, Hausaufgaben, Abwesenheiten, Sitzpläne und Raumvorlagen.</p><fieldset class="classroom-backup-format"><legend>Dateiformat beim Speichern</legend><label class="classroom-format-option"><input type="radio" name="classroomBackupFormat" value="json" checked><span><strong>JSON</strong><small>Reine Sicherungsdatei · Standard</small></span></label><label class="classroom-format-option"><input type="radio" name="classroomBackupFormat" value="xlsx"><span><strong>Excel (XLSX)</strong><small>Bewertungstabellen mit eingebettetem Backup</small></span></label></fieldset><div class="classroom-dialog-actions"><button type="button" id="classroomExportBackup">Speichern</button><button type="button" id="classroomImportBackup">Wiederherstellen</button><button type="button" data-close>Schließen</button></div><p role="status" id="classroomBackupStatus"></p><input type="file" id="classroomBackupFile" accept=".json,application/json,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>';
document.body.append(backupDialog);document.getElementById('classroomBackupButton').onclick=()=>{const json=backupDialog.querySelector('input[name=classroomBackupFormat][value=json]');if(json)json.checked=true;document.getElementById('classroomBackupStatus').textContent='';backupDialog.showModal()};backupDialog.querySelector('[data-close]').onclick=()=>backupDialog.close();
document.getElementById('classroomExportBackup').onclick=async()=>{
 const now=new Date(),pad=value=>String(value).padStart(2,'0'),stamp=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`,status=document.getElementById('classroomBackupStatus'),name=`Classroom-Manager-${stamp}.json`;status.textContent='Backup wird erstellt …';
 if(backupDialog.querySelector('input[name=classroomBackupFormat]:checked')?.value==='xlsx'){
  // Excel: Bewertungstabellen und vollständiges Backup (ausgeblendetes Blatt) in einer Datei.
  const xname=name.replace(/\.json$/,'.xlsx');
  try{const target=await window.classroomBackupLocation?.prepare(xname,'xlsx');const backup=await classroomBackupData();
   if(target){const reply=await classroomCall(classroomNotes,'classroom:excel-blob',{backup:JSON.stringify(backup)});const w=await target.file.createWritable();await w.write(reply.blob);await w.close();status.textContent=target.where?'Gespeichert im Ordner „'+target.where+'“: '+xname:'Die Excel-Datei wurde gespeichert.'}
   else{classroomSend(classroomNotes,{type:'classroom:excel-export',backup:JSON.stringify(backup),filename:xname});status.textContent='Die Excel-Datei wurde als Download bereitgestellt.'}
   window.classroomMarkBackup?.();setTimeout(()=>backupDialog.close(),target?.where?1600:600)}catch(error){status.textContent=error.name==='AbortError'?'Speichern abgebrochen.':error.message}
  return;
 }
 try{
  // Open the picker while the click still grants user activation.
  const target=window.classroomBackupLocation?await window.classroomBackupLocation.prepare(name,'json'):(typeof window.showSaveFilePicker==='function'?{file:await window.showSaveFilePicker({suggestedName:name,types:[{description:'Classroom-Manager-Backup',accept:{'application/json':['.json']}}]}),where:null}:null),handle=target?.file||null;
  const backup=await classroomBackupData(),blob=new Blob([window.classroomBackupText?await window.classroomBackupText(backup):JSON.stringify(backup,null,2)],{type:'application/json'});
  if(handle){const writable=await handle.createWritable();await writable.write(blob);await writable.close();status.textContent=target.where?'Gespeichert im Ordner „'+target.where+'“: '+name:'Das Backup wurde gespeichert.';window.classroomMarkBackup?.();if(target.where){await new Promise(r=>setTimeout(r,1400))}}
  else{const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='Das Backup wurde als Download bereitgestellt.';window.classroomMarkBackup?.()}
  backupDialog.close();
 }catch(error){status.textContent=error.name==='AbortError'?'Speichern abgebrochen.':error.message}
};
document.getElementById('classroomImportBackup').onclick=()=>document.getElementById('classroomBackupFile').click();
// Wiederherstellen (Datei-Auswahl, Schnell-Wiederherstellen ⬆ und „Rückgängig“ nutzen denselben Weg).
// Vor jedem Wiederherstellen wird der aktuelle Stand in IndexedDB gesichert, damit er sich zurückholen lässt.
const classroomUndoDb=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('classroom-manager-restore-undo',1);r.onupgradeneeded=()=>r.result.createObjectStore('snap');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
async function classroomUndoStore(value){const d=await classroomUndoDb();try{return await new Promise((resolve,reject)=>{const tx=d.transaction('snap',value===undefined?'readonly':'readwrite'),st=tx.objectStore('snap');let out;const r=value===undefined?st.get('last'):value===null?st.delete('last'):st.put(value,'last');r.onsuccess=()=>{out=r.result};tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error)})}finally{d.close()}}
window.classroomRestoreUndoInfo=async()=>{try{const v=await classroomUndoStore();return v?{at:v.at,label:v.label,restored:v.restored}:null}catch{return null}};
async function classroomRestoreBackup(backup,{confirmText,restoredLabel}={}){
 const status=document.getElementById('classroomBackupStatus');let before;
 try{
  /* 8.00: im Bestätigungstext zeigen, ob das Backup einen Stundenplan enthält */
  if(confirmText){let n=0;try{const t=JSON.parse(backup?.notes?.['notenrechner-stundenplan-v1']||'null');for(const d of Object.values(t?.days||{}))for(const e of Object.values(d||{}))if(e?.ref||e?.A?.ref||e?.B?.ref)n++}catch{}confirmText+=n?` Stundenplan im Backup: ${n} Stunden.`:' Hinweis: Dieses Backup enthält keinen Stundenplan.'}
  if(confirmText&&!await classroomConfirm(confirmText))return false;
  before=await classroomBackupData();
  try{await classroomUndoStore({data:before,at:new Date().toISOString(),restored:restoredLabel||''})}catch(e){window.classroomLogError?.('Wiederherstellen: Sicherung für „Rückgängig“ nicht möglich ('+e.message+')','classroom-link.js')}
  classroomRestoring=true;let classroomDirect=false;
  try{if(classroomBackupWasDirect)throw new Error('Die Anwendung antwortet nicht (bereits beim Sichern).');await Promise.all([classroomCall(classroomNotes,'classroom:restore',{values:backup.notes}),classroomCall(classroomSeats,'classroom:restore',{values:backup.seats})])}catch(error){if(!/antwortet/.test(error.message))throw error;window.classroomLogError?.('Wiederherstellen: direkt in den Speicher geschrieben ('+error.message+')','classroom-link.js');classroomDirectRestore(backup);classroomDirect=true}
  classroomModel=backup.model;classroomPersist();classroomRestoreExtras(backup);try{await classroomRestoreBooks(backup)}catch{}window.classroomSyncReset?.();try{sessionStorage.setItem('classroom-restore-done',restoredLabel||'Backup')}catch{}backupDialog.close();if(classroomDirect){classroomNotes.remove();classroomSeats.remove()}location.reload();return true;
 }catch(error){if(before&&classroomRestoring){try{await Promise.all([classroomCall(classroomNotes,'classroom:restore',{values:before.notes}),classroomCall(classroomSeats,'classroom:restore',{values:before.seats})]);classroomModel=before.model;classroomPersist();if(status)status.textContent='Das Laden wurde abgebrochen. Die bisherigen Daten wurden wiederhergestellt.'}catch(rollback){if(status)status.textContent='Die Wiederherstellung ist fehlgeschlagen. Bitte das zuvor gespeicherte Backup laden.'}}else if(status)status.textContent=error.message;classroomRestoring=false;throw error}
}
const classroomStamp=iso=>{if(!iso)return '';const d=new Date(iso);return isNaN(d)?'':d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})};
window.classroomRestoreFile=async file=>{
 const fromExcel=/\.xlsx$/i.test(file.name)||/spreadsheetml/.test(file.type),backup=classroomValidBackup(await (window.classroomMaybeDecrypt||(x=>x))(JSON.parse(fromExcel?await classroomBackupFromXlsx(file):await file.text())));const stamp=classroomStamp(backup.createdAt);
 return classroomRestoreBackup(backup,{restoredLabel:stamp?'Backup vom '+stamp:'Backup',confirmText:fromExcel?`Die Excel-Datei enthält ein vollständiges Backup${stamp?' vom '+stamp:''}. Es ersetzt alle Daten im Classroom-Manager. Änderungen, die nachträglich in Excel vorgenommen wurden, werden nicht übernommen. Fortfahren?`:`Das gemeinsame Backup${stamp?' vom '+stamp:''} ersetzt alle Daten im Classroom-Manager. Fortfahren?`});
};
window.classroomRestoreUndo=async()=>{
 const snap=await classroomUndoStore();if(!snap?.data){await classroomAlert('Es gibt keine Wiederherstellung, die sich rückgängig machen lässt.');return false}
 const backup=classroomValidBackup(snap.data),at=classroomStamp(snap.at);
 return classroomRestoreBackup(backup,{restoredLabel:'Stand von '+at+' (vor der Wiederherstellung)',confirmText:`Den Stand von ${at}, also vor der letzten Wiederherstellung, zurückholen? Die jetzigen Daten werden dabei ersetzt – auch das lässt sich wieder rückgängig machen.`});
};
document.getElementById('classroomBackupFile').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;const status=document.getElementById('classroomBackupStatus');
 try{await window.classroomRestoreFile(file)}catch(error){if(status&&!status.textContent)status.textContent=error.message}finally{event.target.value=''}
};
const rosterDialog=document.createElement('dialog');rosterDialog.className='classroom-dialog';rosterDialog.innerHTML='<h2>Gemeinsame Klassenliste</h2><label>Klasse<select id="classroomRosterClass"></select></label><p>Die Namen gelten in allen Fächern, im Sitzplan und auf den Bewertungsseiten dieser Klasse.</p><div id="classroomRosterRows"></div><button type="button" id="classroomRosterAdd">+ Schüler:in</button><p role="status" id="classroomRosterError"></p><div class="classroom-dialog-actions"><button type="button" id="classroomRosterCancel">Abbrechen</button><button type="button" id="classroomRosterSave">Speichern</button></div>';
document.body.append(rosterDialog);let rosterDraft=[];
function classroomDrawRoster(){const box=document.getElementById('classroomRosterRows');box.replaceChildren();for(const person of rosterDraft.filter(s=>!s.deleted)){const row=document.createElement('div');row.className='classroom-roster-row';const input=document.createElement('input');input.value=person.name;input.setAttribute('aria-label','Name');input.oninput=()=>person.name=input.value;const remove=document.createElement('button');remove.type='button';remove.textContent='−';remove.setAttribute('aria-label','Person aus der Klasse entfernen');remove.onclick=()=>{person.deleted=true;classroomDrawRoster()};row.append(input,remove);box.append(row)}}
function classroomChooseRoster(){const group=classroomModel.classes.find(c=>c.id===document.getElementById('classroomRosterClass').value);rosterDraft=structuredClone(group?.students||[]);classroomDrawRoster()}
function classroomOpenRoster(id){const select=document.getElementById('classroomRosterClass');select.replaceChildren();for(const group of classroomModel.classes.filter(g=>!classroomLastSnapshot||classroomLastSnapshot.classes.some(c=>classroomModel.sourceClasses[c.id]===g.id))){const o=document.createElement('option');o.value=group.id;o.textContent=group.name;select.append(o)}select.value=id||classroomModel.sourceClasses[classroomLastSnapshot?.activeClass]||classroomModel.classes[0]?.id||'';classroomChooseRoster();document.getElementById('classroomRosterError').textContent=classroomModel.classes.length?'':'Bitte zuerst eine Klasse im Noten-Manager anlegen.';rosterDialog.showModal()}
document.getElementById('classroomRosterClass').onchange=classroomChooseRoster;document.getElementById('classroomRosterCancel').onclick=()=>rosterDialog.close();
document.getElementById('classroomRosterAdd').onclick=()=>{rosterDraft.push({id:'student-'+(crypto.randomUUID?.()||String(Date.now())),name:''});classroomDrawRoster();document.querySelector('#classroomRosterRows .classroom-roster-row:last-child input')?.focus()};
document.getElementById('classroomRosterSave').onclick=async ()=>{const group=classroomModel.classes.find(c=>c.id===document.getElementById('classroomRosterClass').value);if(!group)return;const names=rosterDraft.filter(s=>!s.deleted).map(s=>ClassroomCore.normalize(s.name));if(names.some(n=>!n)||new Set(names).size!==names.length){document.getElementById('classroomRosterError').textContent='Bitte eindeutige, nicht leere Namen eingeben.';return}if(rosterDraft.some(s=>s.deleted&&!group.students.find(old=>old.id===s.id)?.deleted)&&!await classroomConfirm('Entfernte Personen werden auch aus den Bewertungslisten gelöscht. Fortfahren?'))return;const oldIds=new Set(group.students.map(s=>s.id)),added=rosterDraft.some(s=>!s.deleted&&!oldIds.has(s.id));group.students=rosterDraft.map(s=>({...s,name:s.name.trim()}));if(added)ClassroomCore.sortStudents(group);classroomBroadcast();rosterDialog.close();classroomRequestRosters()};

window.addEventListener('load',()=>{classroomNotesReady=true;classroomRequestRosters()});

if('serviceWorker'in navigator&&location.protocol!=='file:'){navigator.serviceWorker.getRegistrations().then(registrations=>{const scopes=['noten/','sitzplan/'].map(path=>new URL(path,location.href).href);for(const reg of registrations)if(scopes.includes(reg.scope))reg.unregister()}).catch(console.warn)}



document.addEventListener('pointerdown',()=>classroomSend(classroomSeats,{type:'classroom:dismiss-date-picker'}),true);

// Manual gender editing for the selected shared class.
const genderDialog=document.createElement('dialog');genderDialog.className='classroom-dialog classroom-gender-dialog';genderDialog.innerHTML='<h2>Geschlecht bearbeiten</h2><p data-class-label></p><p class="classroom-gender-info" data-gender-info></p><div class="classroom-gender-legend" data-gender-legend hidden><span><span class="gl-solid">m</span> bereits gespeichert</span><span><span class="gl-sug">w</span> Vorschlag</span><span><span class="gl-tag">Name nicht eindeutig</span> kein Vorschlag</span></div><div class="classroom-gender-rows"></div><p role="status" data-status></p><div class="classroom-gender-foot"><span class="classroom-gender-meta"><span data-gender-count></span><button type="button" class="classroom-learned-link" data-learned-link></button></span><div class="classroom-dialog-actions"><button type="button" data-cancel>Abbrechen</button><button type="button" data-save>Speichern</button></div></div>';document.body.append(genderDialog);
let genderClassId=null,genderDraft=[];
let genderSource=null;
function classroomOpenGender(source,snapshot){genderSource=source;
 if(snapshot){classroomLastSnapshot=snapshot;ClassroomCore.ingest(classroomModel,snapshot.classes)}
 const group=classroomModel.classes.find(c=>c.id===classroomModel.sourceClasses[source]);if(!group)return;
 genderClassId=group.id;genderDraft=group.students.filter(s=>!s.deleted).map(s=>{const gender=s.gender||'',guess=gender?undefined:(window.classroomGenderGuess?.(s.name)??null);return {id:s.id,name:s.name,gender,had:!!gender,guess,originalSuggest:guess==='m'||guess==='w'?guess:'',suggest:guess==='m'||guess==='w'?guess:'',hint:gender?'':guess==='?'?'Name nicht eindeutig':guess===null?'Name unbekannt':''}});
 genderDialog.querySelector('[data-class-label]').textContent=group.name;genderDialog.querySelector('[data-status]').textContent=genderDraft.length?'':'Die Klassenliste ist noch leer.';
 const rows=genderDialog.querySelector('.classroom-gender-rows');rows.replaceChildren();
 const updateCount=()=>{const s=genderDraft.filter(p=>!p.gender&&p.suggest).length,o=genderDraft.filter(p=>!p.gender&&!p.suggest).length;genderDialog.querySelector('[data-gender-count]').textContent=s||o?[s?s+(s===1?' Vorschlag':' Vorschläge'):'',o?o+' offen':''].filter(Boolean).join(' · '):'';genderDialog.querySelector('[data-save]').textContent='Speichern';genderDialog.querySelector('[data-save]').title=s?'Speichert die Auswahl und übernimmt alle Vorschläge':''};
 const anySuggest=genderDraft.some(p=>!p.gender&&(p.suggest||p.hint));genderDialog.querySelector('[data-gender-legend]').hidden=!anySuggest;genderDialog.querySelector('[data-gender-info]').textContent=anySuggest?'Vorschläge aus dem Vornamen sind gestrichelt markiert und werden mit „Speichern“ übernommen – bitte kurz prüfen, ein Klick ändert sie. Bei uneindeutigen oder unbekannten Namen bitte selbst wählen; ohne Auswahl bleibt das Feld leer.':'Ein Klick wählt m oder w, ein erneuter Klick hebt die Auswahl auf. Ohne Auswahl bleibt das Feld leer.';
 for(const person of genderDraft){const row=document.createElement('div');row.className='classroom-gender-row';const name=document.createElement('span');name.className='classroom-gender-name';name.textContent=person.name;const tag=document.createElement('span');tag.className='classroom-gender-tag';const choices=document.createElement('div');choices.className='classroom-gender-choices';choices.setAttribute('role','group');choices.setAttribute('aria-label','Geschlecht von '+person.name);
 for(const value of ['m','w']){const b=document.createElement('button');b.type='button';b.textContent=value;b.dataset.gender=value;b.setAttribute('aria-label',value==='m'?'Männlich':'Weiblich');const paint=()=>{for(const sibling of choices.children){sibling.setAttribute('aria-pressed',String(sibling.dataset.gender===person.gender));sibling.classList.toggle('is-suggestion',!person.gender&&sibling.dataset.gender===person.suggest)}tag.textContent=person.gender?'':person.suggest?'Vorschlag':person.hint;tag.classList.toggle('is-open',!person.gender&&!person.suggest&&!!person.hint);tag.hidden=!tag.textContent;updateCount()};b.onclick=()=>{const current=person.gender||person.suggest;person.gender=current===value&&person.gender?'':value;if(!person.gender)person.suggest='';paint()};choices.append(b);b.paint=paint}row.append(name,tag,choices);rows.append(row);choices.lastChild.paint()}updateCount();const ll=genderDialog.querySelector('[data-learned-link]'),lc=window.classroomLearnedCount?.()||0;ll.textContent='Gelernte Namen ('+lc+')';ll.hidden=!window.classroomOpenLearnedNames;genderDialog.showModal();
}
genderDialog.querySelector('[data-cancel]').onclick=()=>genderDialog.close();
genderDialog.querySelector('[data-learned-link]').onclick=async()=>{const src=genderSource;genderDialog.close();await window.classroomOpenLearnedNames();if(src)classroomOpenGender(src,null)};
genderDialog.querySelector('[data-save]').onclick=()=>{const group=classroomModel.classes.find(c=>c.id===genderClassId);if(!group)return;for(const draft of genderDraft){const person=group.students.find(s=>s.id===draft.id&&!s.deleted);if(person)person.gender=draft.gender||draft.suggest||''}try{window.classroomLearnGenders?.(genderDraft.filter(d=>!d.had).map(d=>({name:d.name,gender:d.gender||d.suggest,guess:d.guess,suggest:d.originalSuggest||''})))}catch{}classroomBroadcast();classroomRequestRosters();genderDialog.close()};
window.addEventListener('message',event=>{if(event.source===classroomNotes.contentWindow&&event.data?.type==='classroom:gender-roster')classroomOpenGender(event.data.source,event.data.snapshot)});

const excelExportButton=document.createElement('button');excelExportButton.type='button';excelExportButton.textContent='Excel-Export';excelExportButton.title='Alle Bewertungen aller Fächer und Klassen direkt als Excel-Datei speichern.';excelExportButton.onclick=async()=>{selectView('noten');let backup=null;try{backup=JSON.stringify(await classroomBackupData())}catch(error){console.warn('Backup für Excel-Export nicht verfügbar',error)}classroomSend(classroomNotes,{type:'classroom:excel-export',backup})};/* Der Excel-Export ist jetzt über „Backup → Excel (XLSX)“ erreichbar; kein eigener Button mehr in der Kopfzeile. */

// Shared compact navigation lives outside the scrolling manager frames.
const compactNavigation=document.createElement('section');
compactNavigation.className='compact-navigation';
compactNavigation.innerHTML='<div class="compact-navigation-bar" role="button" tabindex="0" aria-label="Vollständiges Auswahlmenü öffnen"></div><div class="compact-navigation-flyout" aria-label="Auswahlmenü"></div>';
classroomNotes.parentElement.before(compactNavigation);
const navigationBackdrop=document.createElement('div');navigationBackdrop.className='compact-navigation-backdrop';navigationBackdrop.hidden=true;compactNavigation.before(navigationBackdrop);
navigationBackdrop.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation()});
navigationBackdrop.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();navigationUsed=true;navigationSetOpen(false)});
let navigationOpen=false,navigationUsed=false,navigationLevel=Infinity,navigationRefresh=0;
const navigationBar=compactNavigation.firstElementChild,navigationFlyout=compactNavigation.lastElementChild;
function navigationSetOpen(open){navigationOpen=open;navigationBackdrop.hidden=!open;compactNavigation.classList.toggle('is-open',open);navigationBar.setAttribute('aria-expanded',String(open));const arrow=navigationBar.querySelector('.compact-navigation-arrow');if(arrow)arrow.textContent=open?'▴':'▾'}
// Navigation snapshots arrive by postMessage, so the bar also works for local files (file://), where frame DOM access is blocked.
let navigationSnapshot=null;
function renderCompactNavigation(){
 const snap=navigationSnapshot;if(!snap)return;
 // Im Unterrichts-Manager genügen Fach und Klasse.
 const seatView=/^(sitzplan|unterricht)$/.test(document.querySelector('[data-view][aria-selected="true"]')?.dataset.view||'');
 const rows=seatView?(snap.rows||[]).slice(0,2):(snap.rows||[]);
 navigationBar.replaceChildren();navigationFlyout.replaceChildren();
 const arrow=document.createElement('span');arrow.className='compact-navigation-arrow';arrow.textContent=navigationOpen?'▴':'▾';arrow.title='Auswahlmenü ein- oder ausblenden';navigationBar.append(arrow);
 const trail=document.createElement('div');trail.className='compact-navigation-trail';navigationBar.append(trail);
 rows.forEach((row,index)=>{
  if(index<=navigationLevel&&row.selected.length&&!(snap.examSelected&&/(^|\s)shared-quarter-picker(\s|$)/.test(row.className))){const chip=document.createElement('span');chip.className='compact-navigation-chip';if(row.font)chip.style.setProperty('font',row.font,'important');if(row.color)chip.style.setProperty('color',row.color,'important');chip.textContent=row.selected.join(' · ');if(trail.children.length){const separator=document.createElement('span');separator.className='compact-navigation-separator';separator.setAttribute('aria-hidden','true');trail.append(separator)}trail.append(chip)}
  if(index>navigationLevel+1)return;
  const holder=document.createElement('div');holder.innerHTML=row.html;const clone=holder.firstElementChild;if(!clone)return;
  clone.querySelectorAll('button').forEach(button=>{const gear=button.matches('.rename-row-button');if(gear){button.innerHTML='<svg class="navigation-gear" viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M12.29 6.50L13.11 2.81L18.89 2.81L19.71 6.50L20.09 6.66L23.28 4.63L27.37 8.72L25.34 11.91L25.50 12.29L29.19 13.11L29.19 18.89L25.50 19.71L25.34 20.09L27.37 23.28L23.28 27.37L20.09 25.34L19.71 25.50L18.89 29.19L13.11 29.19L12.29 25.50L11.91 25.34L8.72 27.37L4.63 23.28L6.66 20.09L6.50 19.71L2.81 18.89L2.81 13.11L6.50 12.29L6.66 11.91L4.63 8.72L8.72 4.63L11.91 6.66Z"/><circle cx="16" cy="16" r="4.6"/></g></svg>'/* 9.50: Zahnrad B – Linie, 8 weiche Zähne */;button.setAttribute('aria-label',button.getAttribute('aria-label')||button.title||'Auswahl bearbeiten')}
   button.onclick=()=>{navigationUsed=true;navigationLevel=Infinity;if(gear)navigationSetOpen(false);if(button.matches('.rename-row-button,.add-subject-button'))selectView('noten');classroomSend(classroomNotes,{type:'classroom:navigation-click',row:row.rowIndex,index:Number(button.dataset.navIndex)});if(typeof classroomRequestRosters==='function')setTimeout(classroomRequestRosters,150)}});
  clone.classList.add('compact-navigation-row');navigationFlyout.append(clone);
 });
 navigationSetOpen(navigationOpen);
}
function scheduleCompactNavigation(){if(navigationRefresh)return;navigationRefresh=setTimeout(()=>{navigationRefresh=0;renderCompactNavigation()},0)}
function openCompleteNavigation(){navigationUsed=true;navigationLevel=Infinity;navigationSetOpen(true);renderCompactNavigation()}
// Zweiter Klick (oder Enter) auf die kompakte Leiste klappt das geöffnete Menü wieder ein.
navigationBar.addEventListener('click',()=>{if(navigationOpen){navigationUsed=true;navigationSetOpen(false);return}openCompleteNavigation()});
navigationBar.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(navigationOpen){navigationUsed=true;navigationSetOpen(false)}else openCompleteNavigation()}});
navigationFlyout.addEventListener('click',event=>{if(!event.target.closest('button,input,select,textarea,a,label,[role="tab"]')){navigationUsed=true;navigationSetOpen(false)}});
compactNavigation.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch'&&navigationUsed)navigationSetOpen(false)});
function navigationOutside(event){if(event.target===navigationBackdrop)return;if(!compactNavigation.contains(event.target)&&navigationUsed)navigationSetOpen(false)}
document.addEventListener('pointerdown',navigationOutside,true);
document.addEventListener('keydown',event=>{if(event.key==='Escape'){navigationUsed=true;navigationSetOpen(false)}});
new MutationObserver(scheduleCompactNavigation).observe(document.querySelector('[role=tablist]')||document.body,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
function requestCompactNavigation(){classroomSend(classroomNotes,{type:'classroom:navigation-request'})}
classroomNotes.addEventListener('load',requestCompactNavigation);requestCompactNavigation();
window.addEventListener('message',event=>{
 const fromFrame=event.source===classroomNotes.contentWindow||event.source===classroomSeats.contentWindow;if(!fromFrame)return;
 if(event.data?.type==='classroom:navigation'&&event.source===classroomNotes.contentWindow){navigationSnapshot=event.data.snapshot;scheduleCompactNavigation()}
 else if(event.data?.type==='classroom:frame-pointerdown'&&navigationUsed)navigationSetOpen(false);
 else if(event.data?.type==='classroom:noten-ready')requestCompactNavigation();
});

// Schuljahr im Header: aus Halbjahres-/Quartalsbeginn (Noten-Manager), sonst aus dem heutigen Datum (Wechsel zum 1. August).
(()=>{
 const el=document.querySelector('[data-school-year]');if(!el)return;
 // Dezent ganz rechts in der kompakten Navigationsleiste, senkrecht mittig. Die Leiste wird bei jeder Auswahl neu aufgebaut,
 // deshalb wird das Schuljahr danach wieder angehängt. Bei Platzmangel erst gekürzt („2026/27“), dann ausgeblendet.
 const bar=document.querySelector('.compact-navigation-bar');let full='',short='';
 function fit(){if(!bar||el.hidden||!full)return;el.textContent=full;el.style.display='';if(bar.scrollWidth>bar.clientWidth+1){el.textContent=short;if(bar.scrollWidth>bar.clientWidth+1)el.style.display='none'}}
 function place(){if(bar.lastElementChild!==el)bar.append(el);fit()}
 if(bar){new MutationObserver(()=>{if(bar.lastElementChild!==el)place()}).observe(bar,{childList:true});addEventListener('resize',fit);bar.append(el)}
 function startYear(){
  const today=new Date().toISOString().slice(0,10),dates=[];
  try{const periods=JSON.parse(localStorage.getItem('notenrechner-period-dates')||'{}');for(const p of Object.values(periods))for(const v of Object.values(p||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(v))dates.push(v)}catch{}
  try{const bounds=JSON.parse(localStorage.getItem('notenrechner-quarter-boundaries')||'{}');for(const v of Object.values(bounds))if(/^\d{4}-\d{2}-\d{2}$/.test(v))dates.push(v)}catch{}
  const past=dates.filter(d=>d<=today).sort(),ref=past.at(-1)||dates.sort()[0]||today;
  const year=Number(ref.slice(0,4)),month=Number(ref.slice(5,7)),computed=month>=8?year:year-1;/* Nach „Schuljahr abschließen“ gilt mindestens das neue Schuljahr. */let manual=0;try{manual=Number(localStorage.getItem('notenrechner-schuljahr-v1'))||0}catch{}return Math.max(computed,manual);
 }
 function update(){const y=startYear();full='Schuljahr '+y+'/'+String(y+1).slice(2);short=y+'/'+String(y+1).slice(2);el.textContent=full;el.title='Schuljahr '+y+'/'+(y+1)+' – ermittelt aus Halbjahres- und Quartalsbeginn im Noten-Manager';el.hidden=false;fit()}
 update();window.addEventListener('storage',update);window.addEventListener('message',e=>{if(e.data?.type==='classroom:rosters'||e.data?.type==='classroom:noten-ready')update()});setInterval(update,60000);
})();

// Präsentieren (aus dem Unterrichts-Manager): Kopfzeile auf Logo und Titel reduzieren, Noten-Manager sperren.
(()=>{
 const style=document.createElement('style');style.textContent='.classroom-beamer-active .module-tabs,.classroom-beamer-active .classroom-global-actions,.classroom-beamer-active .compact-navigation,.classroom-beamer-active .compact-navigation-backdrop,.classroom-beamer-active .classroom-safari-hint{display:none!important}.classroom-beamer-active .app-header{justify-content:flex-start}';
 document.head.append(style);
 window.addEventListener('message',e=>{if(e.data?.type!=='classroom:beamer')return;const frame=document.getElementById('view-sitzplan');if(frame&&e.source!==frame.contentWindow)return;document.documentElement.classList.toggle('classroom-beamer-active',!!e.data.on);if(e.data.on&&typeof selectView==='function'&&document.querySelector('[data-view="noten"][aria-selected="true"]'))selectView('sitzplan')});
 document.addEventListener('click',e=>{if(document.documentElement.classList.contains('classroom-beamer-active')&&e.target.closest?.('[data-view="noten"]')){e.preventDefault();e.stopImmediatePropagation()}},true);
})();

// „Daten prüfen“ im Backup-Dialog: Prüfbericht aus dem Noten-Manager anzeigen.
(()=>{
 const dialog=document.querySelector('.classroom-backup-dialog');if(!dialog)return;
 const row=document.createElement('div');row.className='classroom-data-check';
 row.innerHTML='<button type="button" class="classroom-data-check-button">Daten prüfen</button><span>Findet doppelte Bereiche, verwaiste Seiten, Zeilen ohne Namen und doppelte Namen – und behebt, was eindeutig ist.</span>';
 const actions=dialog.querySelector('.classroom-dialog-actions');(actions||dialog).before(row);
 const style=document.createElement('style');style.textContent='.classroom-data-check{display:flex;align-items:center;gap:12px;margin:18px 0 0;padding:12px 14px;border:1px solid #dce3ef;border-radius:12px;background:#f8fafd}.classroom-data-check span{font-size:.84rem;color:#66758a;line-height:1.4}.classroom-data-check button{flex:none;white-space:nowrap}';document.head.append(style);
 row.querySelector('button').onclick=async()=>{
  const button=row.querySelector('button');button.disabled=true;button.textContent='Prüfe …';
  try{
   const {report}=await classroomCall(classroomNotes,'classroom:check-data');
   const lines=[];
   if(report.fixed.length)lines.push('Automatisch behoben:\n'+report.fixed.map(t=>'• '+t).join('\n'));
   if(report.hints.length)lines.push('Bitte prüfen:\n'+report.hints.map(t=>'• '+t).join('\n'));
   if(!lines.length)lines.push('Alles in Ordnung – keine Unstimmigkeiten gefunden.');
   if(report.fixed.length){classroomRequestRosters?.();requestCompactNavigation?.()}
   await classroomAlert(lines.join('\n\n'));
  }catch(error){await classroomAlert('Die Prüfung konnte nicht durchgeführt werden: '+error.message)}
  finally{button.disabled=false;button.textContent='Daten prüfen'}
 };
})();
;

/* ==== backup-merge.js ==== */
/* 9.89: Backups zusammenführen statt ersetzen.
   1) Änderungsprotokoll: Für jeden gespeicherten Wert (Pfad bis zum einzelnen Eintrag) merkt sich die App, wann er zuletzt
      geändert oder gelöscht wurde. Es liegt in IndexedDB und reist im Backup mit („journal“); Einträge älter als 90 Tage entfallen.
   2) Beim Laden eines Backups vergleicht die App beide Stände Eintrag für Eintrag: Nur auf einer Seite vorhandene Einträge bleiben
      erhalten (außer die andere Seite hat sie nachweislich später gelöscht), bei Abweichungen gilt der neuere Wert. Ohne Zeitangabe
      (Änderungen vor 9.89) entscheidest du, ob das Backup oder dieses Gerät gilt. */
(()=>{
 const SEP='\u001f',MODEL='classroom-manager-common-v2',KEEP_DAYS=90;
 const tracked=k=>typeof k==='string'&&(k.startsWith('notenrechner-')||k.startsWith('sitzplan_')||k.startsWith('classroom-manager-linked-classes-')||k===MODEL);
 // Reine Ansichtszustände: immer die dieses Geräts, nicht gezählt.
 const UI=new Set(['notenrechner-letzte-ansicht-v1','notenrechner-aktives-fach-v1','sitzplan_aktuelle_klasse','notenrechner-last-inputs-v1','notenrechner-last-preferences-v1','sitzplan_selected_versions_v1']);
 const now=()=>Math.floor(Date.now()/1000);
 const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const isIdArr=v=>Array.isArray(v)&&v.length>0&&v.every(e=>isObj(e)&&typeof e.id==='string')&&new Set(v.map(e=>e.id)).size===v.length;
 const parse=(k,s)=>{if(s==null)return undefined;if(k==='notenrechner-aktives-fach-v1'||k==='sitzplan_aktuelle_klasse')return s;try{return JSON.parse(s)}catch{return s}};
 // Blätter eines Werts: Pfad → JSON (Listen ohne IDs gelten als ein Eintrag)
 function flat(v,p,out){if(isObj(v)){const ks=Object.keys(v);if(!ks.length)out.set(p,'{}');for(const k of ks)flat(v[k],p+SEP+k,out)}else if(isIdArr(v)){for(const e of v)flat(e,p+SEP+'#'+e.id,out)}else out.set(p,JSON.stringify(v===undefined?null:v));return out}

 /* ---------- Protokoll (IndexedDB) ---------- */
 let J={v:1,e:{}},ready=false,saveT=0;
 const db=()=>new Promise((res,rej)=>{const r=indexedDB.open('classroom-manager-journal',1);r.onupgradeneeded=()=>r.result.createObjectStore('j');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 async function idb(value){const d=await db();try{return await new Promise((res,rej)=>{const tx=d.transaction('j',value===undefined?'readonly':'readwrite'),st=tx.objectStore('j');let out;const r=value===undefined?st.get('journal'):st.put(value,'journal');r.onsuccess=()=>{out=r.result};tx.oncomplete=()=>res(out);tx.onerror=()=>rej(tx.error)})}finally{d.close()}}
 function prune(j){const min=now()-KEEP_DAYS*86400,e={};for(const [p,x] of Object.entries(j?.e||{}))if(Array.isArray(x)&&x[0]>=min)e[p]=x;return {v:1,e}}
 let restoreJ=null;
 async function save(){clearTimeout(saveT);saveT=0;if(restoreJ)return;try{J=prune(J);await idb(J)}catch(e){window.classroomLogError?.('Änderungsprotokoll: Speichern nicht möglich ('+e.message+')','backup-merge.js')}}
 const later=()=>{clearTimeout(saveT);saveT=setTimeout(save,1500)};
 const loaded=idb().then(v=>{if(v&&v.e)J={v:1,e:{...v.e,...J.e}};ready=true}).catch(()=>{ready=true});
 let paused=false;const pending=new Map();let procT=0;
 /* 9.93: Bezugsstand je Schlüssel. Safari meldet Änderungen aus den eingebetteten Fenstern nicht zuverlässig als „storage“-Ereignis –
    deshalb vergleicht die App zusätzlich alle 2 Sekunden selbst (nur Textvergleich; zerlegt wird nur, was sich geändert hat). */
 const snap=new Map();
 function keys(){const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(tracked(k))out.push(k)}return out}
 try{for(const k of keys())snap.set(k,localStorage.getItem(k))}catch{}
 function scan(){if(paused)return;try{const seen=new Set();for(const k of keys()){seen.add(k);const v=localStorage.getItem(k);if(snap.get(k)!==v)queue(k,snap.has(k)?snap.get(k):null,v)}for(const k of [...snap.keys()])if(!seen.has(k))queue(k,snap.get(k),null)}catch{}}
 setInterval(()=>{if(!document.hidden)scan()},2000);document.addEventListener('visibilitychange',()=>{if(document.hidden){scan();if(pending.size)process();save()}});
 function queue(k,oldV,newV){if(paused||!tracked(k))return;if(snap.has(k)||oldV==null)oldV=snap.has(k)?snap.get(k):oldV;if(newV==null)snap.delete(k);else snap.set(k,newV);if(oldV===newV)return;const q=pending.get(k);if(q)q.now=newV;else pending.set(k,{old:oldV,now:newV});clearTimeout(procT);procT=setTimeout(process,700)}
 function process(){const t=now();for(const [k,{old,now:nv}] of pending){if(old===nv)continue;const a=old==null?new Map():flat(parse(k,old),k,new Map()),b=nv==null?new Map():flat(parse(k,nv),k,new Map());
   for(const [p,v] of b)if(a.get(p)!==v)J.e[p]=[t,0];for(const p of a.keys())if(!b.has(p))J.e[p]=[t,1]}
  pending.clear();later()}
 // Änderungen aus Noten- und Unterrichts-Manager (eigene Fenster) melden sich als „storage“-Ereignis …
 window.addEventListener('storage',e=>{if(e.storageArea===localStorage&&e.key)queue(e.key,e.oldValue,e.newValue)});
 // … Änderungen dieses Fensters (Klassenlisten) direkt.
 {const P=Storage.prototype,set=P.setItem,rem=P.removeItem;
  P.setItem=function(k,v){if(this!==localStorage||!tracked(k)||paused)return set.call(this,k,v);const old=this.getItem(k);const r=set.call(this,k,v);queue(k,old,String(v));return r};
  P.removeItem=function(k){if(this!==localStorage||!tracked(k)||paused)return rem.call(this,k);const old=this.getItem(k);const r=rem.call(this,k);if(old!==null)queue(k,old,null);return r}}
 window.addEventListener('pagehide',()=>{scan();if(pending.size)process();if(saveT)save()});

 /* ---------- Zusammenführen ---------- */
 function index(j){const keys=Object.keys(j?.e||{}).sort();return {e:j?.e||{},keys}}
 function lower(keys,p){let lo=0,hi=keys.length;while(lo<hi){const m=(lo+hi)>>1;if(keys[m]<p)lo=m+1;else hi=m}return lo}
 // höchste Zeit unter einem Pfad (del=0: geändert/angelegt, del=1: gelöscht)
 function under(ix,p,del){let best=0;const x=ix.e[p];if(x&&x[1]===del)best=x[0];const pre=p+SEP;for(let i=lower(ix.keys,pre);i<ix.keys.length&&ix.keys[i].startsWith(pre);i++){const y=ix.e[ix.keys[i]];if(y[1]===del&&y[0]>best)best=y[0]}return best}
 const AREAS=['Bewertungen','Hausaufgaben & Material','Anwesenheit','Klassenlisten','Sitzplan','Einstellungen'];
 function area(p){const s=p.split(SEP),k=s[0];if(k.startsWith('sitzplan_')||k.startsWith('classroom-manager-linked'))return 'Sitzplan';
  if(s.includes('attendance'))return 'Anwesenheit';if(s.some(x=>/^(assignments|homework|material)/i.test(x)))return 'Hausaufgaben & Material';
  if(s.some(x=>/^(grades|rawScores|tendencyGrades|reviews|testGroups|participation|ratings)$/.test(x)))return 'Bewertungen';
  if(k===MODEL&&s.some(x=>/^(students|classes)$/.test(x)))return 'Klassenlisten';return 'Einstellungen'}
 const leaves=(v,p)=>flat(v,p,new Map()).size;
 /* 9.90: Spalten mit Datum (Mitarbeit, Hausaufgaben, Material) legt jedes Gerät mit eigener ID an. Gleiches Datum = dieselbe Spalte:
    die Einträge des Backups werden der Spalte dieses Geräts zugeordnet; schon doppelte Spalten (aus 9.89) werden zusammengelegt, wenn sich ihre Einträge nicht überschneiden. */
 const COLS=['tasks','assignments'];
 const sameName=(x,y)=>!x.name||!y.name||String(x.name).trim()===String(y.name).trim();
 function renameIn(obj,from,to){for(const st of obj.students||[])for(const v of Object.values(st||{}))if(isObj(v)&&from in v){if(!(to in v))v[to]=v[from];delete v[from]}}
 function hasVal(obj,id){return (obj.students||[]).map(st=>Object.values(st||{}).some(v=>isObj(v)&&v[id]!==undefined&&v[id]!==''&&v[id]!==null))}
 function unify(a,b,p,ix){for(const f of COLS){const A=a[f],Bv=b[f];if(!Array.isArray(A)||!Array.isArray(Bv)||!Array.isArray(b.students))continue;const aIds=new Set(A.map(t=>t?.id)),bIds=new Set(Bv.map(t=>t?.id)),used=new Set();
   for(const bt of Bv){if(!bt?.id||!bt.date||aIds.has(bt.id))continue;const lt=A.find(t=>t?.id&&t.date===bt.date&&!bIds.has(t.id)&&!used.has(t.id)&&sameName(t,bt));if(!lt)continue;used.add(lt.id);const from=bt.id;bt.id=lt.id;renameIn(b,from,lt.id);
    remapJ(ix,p,from,lt.id)}}
  /* Einmal-Bereiche je Halbjahr (Halbjahresnote, Quartalsnote, Tests …) entstehen auf jedem Gerät mit eigener ID */
  if(Array.isArray(a.examGroups)&&Array.isArray(b.examGroups)){const aIds=new Set(a.examGroups.map(g=>g?.id));for(const bg of b.examGroups){if(!bg?.id||aIds.has(bg.id)||!SINGLE.has(bg.type))continue;const same=x=>x?.type===bg.type&&(x.halfYearId??'')===(bg.halfYearId??'');const la=a.examGroups.filter(same),lb=b.examGroups.filter(same);if(la.length!==1||lb.length!==1||b.examGroups.some(x=>x?.id===la[0].id))continue;const from=bg.id;bg.id=la[0].id;remapJ(ix,p,from,bg.id)}}}

 const SINGLE=new Set(['semester','quarterSummary','tests','schoolYear','halfYear']);
 function remapJ(ix,p,from,to){const pre=p+SEP,e=ix.e,np=p.split(SEP).length;let ch=false;for(const k of ix.keys){if(!k.startsWith(pre))continue;const seg=k.split(SEP);let hit=false;for(let q=np;q<seg.length;q++){if(seg[q]===from){seg[q]=to;hit=true}else if(seg[q]==='#'+from){seg[q]='#'+to;hit=true}}if(!hit)continue;const n=seg.join(SEP);if(!e[n]||e[k][0]>e[n][0])e[n]=e[k];delete e[k];ch=true}if(ch)ix.keys=Object.keys(e).sort()}
 // Gewichte wie in der App: feste (bearbeitete) bleiben, der Rest wird gleichmäßig verteilt – nötig, wenn Spalten von zwei Geräten zusammenkommen.
 function reweigh(o){const t=o.tasks;if(!Array.isArray(t)||!t.length||!t.every(x=>isObj(x)&&'weight' in x&&x.date))return;const ed=t.filter(x=>x.weightEdited),free=t.filter(x=>!x.weightEdited);if(!free.length||ed.some(x=>!(Number(x.weight)>=0&&Number(x.weight)<=100)))return;
  const sum=t.reduce((s,x)=>s+(Number(x.weight)||0),0);if(Math.abs(sum-100)<.05)return;const rest=1000-ed.reduce((s,x)=>s+Math.round(Number(x.weight)*10),0);if(rest<0)return;const base=Math.floor(rest/free.length);let extra=rest-base*free.length;for(const x of free){x.weight=(base+(extra>0?1:0))/10;if(extra>0)extra--}}
 function collapse(o){for(const f of COLS){const arr=o[f];if(!Array.isArray(arr)||!Array.isArray(o.students))continue;const by=new Map();for(const t of arr)if(t?.id&&t.date){if(!by.has(t.date))by.set(t.date,[]);by.get(t.date).push(t)}
   for(const g of by.values()){if(g.length<2||!g.every(t=>sameName(t,g[0])))continue;const vals=g.map(t=>hasVal(o,t.id));if(vals[0].some((_,i)=>vals.filter(v=>v[i]).length>1))continue;
    const keep=g[0];for(const t of g.slice(1)){renameIn(o,t.id,keep.id);if(!keep.name&&t.name)keep.name=t.name;o[f]=o[f].filter(x=>x!==t)}}}}
 function merge(local,incoming,prefer){incoming=structuredClone(incoming);
  const A=index(local.journal),B=index(incoming.journal),st={neu:{},nurHier:{},geloescht:{},neuerBackup:0,neuerHier:0,offen:0,offenBackup:0},add=(o,p,n)=>{const a=area(p);o[a]=(o[a]||0)+n;if((st.samples??=[]).length<30)st.samples.push(p.split(SEP).map(x=>x.slice(0,24)).join(' › '))};
  function only(v,p,side){// side 'A': nur hier, 'B': nur im Backup
   const mine=side==='A'?A:B,other=side==='A'?B:A,tomb=under(other,p,1),live=under(mine,p,0);
   if(tomb&&tomb>live){add(st.geloescht,p,leaves(v,p));return undefined}
   add(side==='A'?st.nurHier:st.neu,p,leaves(v,p));return v}
  function m(a,b,p){
   if(a===undefined&&b===undefined)return undefined;if(a===undefined)return only(b,p,'B');if(b===undefined)return only(a,p,'A');
   if(isObj(a)&&isObj(b)){if(COLS.some(f=>Array.isArray(a[f])&&Array.isArray(b[f]))||Array.isArray(a.examGroups)&&Array.isArray(b.examGroups))unify(a,b,p,B);const out={};for(const k of Object.keys(a)){const v=m(a[k],b[k],p+SEP+k);if(v!==undefined)out[k]=v}for(const k of Object.keys(b))if(!(k in a)){const v=m(undefined,b[k],p+SEP+k);if(v!==undefined)out[k]=v}if(COLS.some(f=>Array.isArray(out[f]))){collapse(out);if(Array.isArray(out.tasks))reweigh(out)/* 10.03: immer prüfen – reweigh ändert nur, wenn die Anteile nicht 100 % ergeben */}return out}
   if((isIdArr(a)||Array.isArray(a)&&!a.length)&&(isIdArr(b)||Array.isArray(b)&&!b.length)&&(a.length||b.length)){const bm=new Map(b.map(e=>[e.id,e])),out=[];
    for(const e of a){const v=m(e,bm.get(e.id),p+SEP+'#'+e.id);if(v!==undefined)out.push(v)}const ids=new Set(a.map(e=>e.id));
    for(const e of b)if(!ids.has(e.id)){const v=m(undefined,e,p+SEP+'#'+e.id);if(v!==undefined)out.push(v)}return out}
   const sa=JSON.stringify(a),sb=JSON.stringify(b);if(sa===sb)return a;
   const ta=under(A,p,0),tb=under(B,p,0),n=Math.max(1,Math.min(leaves(a,p),leaves(b,p)));
   if(ta>tb){st.neuerHier+=n;return a}if(tb>ta){st.neuerBackup+=n;return b}
   st.offen+=n;return prefer==='local'?a:(st.offenBackup+=n,b)}
  const out={...incoming,createdAt:new Date().toISOString(),notes:{},seats:{}};
  for(const part of ['notes','seats']){const L=local[part]||{},I=incoming[part]||{};for(const k of new Set([...Object.keys(L),...Object.keys(I)])){
   if(UI.has(k)){if(k in L)out[part][k]=L[k];else out[part][k]=I[k];continue}
   const v=m(parse(k,L[k]),parse(k,I[k]),k);if(v!==undefined)out[part][k]=typeof v==='string'&&(k==='notenrechner-aktives-fach-v1'||k==='sitzplan_aktuelle_klasse')?v:JSON.stringify(v)}}
  out.model=m(local.model,incoming.model,MODEL)||local.model;
  // Protokoll: je Pfad der neuere Eintrag
  const je={...A.e};for(const [p,x] of Object.entries(B.e))if(!je[p]||x[0]>je[p][0])je[p]=x;out.journal={v:1,e:je};
  st.jA=A.keys.length;st.jB=B.keys.length;return {merged:out,stats:st}}
 window.classroomMergeBackups=merge;

 /* ---------- Backup lesen/schreiben: Protokoll mitnehmen ---------- */
 if(typeof classroomBackupData==='function'){const orig=classroomBackupData;classroomBackupData=async function(...a){const d=await orig.apply(this,a);scan();if(pending.size)process();await loaded;d.journal=prune(J);return d}}
 if(typeof classroomRestoreBackup==='function'){const orig=classroomRestoreBackup;classroomRestoreBackup=async function(backup,opts){
  // Protokoll des geladenen Stands vormerken; der Speicher-Schnappschuss für „Rückgängig“ nimmt noch das bisherige mit.
  paused=true;pending.clear();clearTimeout(procT);restoreJ=prune(backup?.journal||{v:1,e:{}});const undo=async()=>{restoreJ=null;paused=false;try{await idb(prune(J))}catch{}};
  try{await idb(restoreJ)}catch{}
  try{const r=await orig.call(this,backup,opts);if(!r)await undo();return r}catch(e){await undo();throw e}}}
 /* ---------- Dialog beim Laden einer Backup-Datei ---------- */
 const fmt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
 const list=o=>AREAS.filter(a=>o[a]).map(a=>a+' '+fmt(o[a])).join(' · ');
 const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
 function ask(stats,stamp){return new Promise(resolve=>{const d=document.createElement('dialog');d.className='classroom-dialog merge-dialog';
  const row=(lab,o,extra='')=>sum(o)?`<li><span>${lab}</span><b data-no-decimal>${fmt(sum(o))}</b><small>${list(o)}${extra}</small></li>`:'';
  const s=stats,diff=s.neuerBackup+s.neuerHier+s.offen;
  d.innerHTML=`<h2>Backup laden</h2><p>Backup${stamp?' vom '+stamp:''} und dieses Gerät im Vergleich (Anzahl Einträge):</p><ul class="mg-list">${row('Im Backup neu',s.neu)}${row('Nur auf diesem Gerät',s.nurHier)}${row('Gelöscht (auf einer Seite später entfernt)',s.geloescht)}${diff?`<li><span>Abweichend</span><b data-no-decimal>${fmt(diff)}</b><small>${[s.neuerBackup&&'neuer im Backup '+fmt(s.neuerBackup),s.neuerHier&&'neuer auf diesem Gerät '+fmt(s.neuerHier),s.offen&&'ohne Zeitangabe '+fmt(s.offen)].filter(Boolean).join(' · ')}</small></li>`:''}</ul>`
   +(!s.jB?`<p class="mg-warn">Das Backup enthält noch keine Zeitangaben – es stammt von einem Gerät mit einer älteren Version (vor 9.93). Bei Abweichungen kann die App deshalb nicht erkennen, welcher Wert neuer ist. Am besten zuerst beide Geräte auf den neuesten Stand bringen.</p>`:'')+(s.offen?`<div class="mg-pref" role="radiogroup" aria-label="Abweichungen ohne Zeitangabe"><p>Bei Abweichungen ohne Zeitangabe gilt:</p><label><input type="radio" name="mgPref" value="incoming" checked><span>das Backup</span></label><label><input type="radio" name="mgPref" value="local"><span>dieses Gerät</span></label></div>`:'')
   +`<p class="mg-note"><b>Zusammenführen</b> behält alles, was nur auf einer Seite steht, und nimmt bei Abweichungen den neueren Wert. <b>Ersetzen</b> übernimmt das Backup vollständig. Beides lässt sich mit „Rückgängig“ im Backup-Fenster zurücknehmen.</p>`
   +`<div class="classroom-dialog-actions"><button type="button" data-a="cancel">Abbrechen</button><button type="button" data-a="replace">Ersetzen</button><button type="button" class="primary" data-a="merge">Zusammenführen</button></div>`;
  document.body.append(d);d.addEventListener('close',()=>{d.remove();resolve(d.returnValue||null)});
  d.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;d.returnValue=a==='cancel'?'':a==='merge'?'merge:'+(d.querySelector('[name=mgPref]:checked')?.value||'incoming'):'replace';d.close(d.returnValue)});
  d.addEventListener('cancel',()=>{d.returnValue=''});d.showModal();d.querySelector('.primary').focus()})}
 if(typeof window.classroomRestoreFile==='function'){const orig=window.classroomRestoreFile;window.classroomRestoreFile=async file=>{
  const fromExcel=/\.xlsx$/i.test(file.name)||/spreadsheetml/.test(file.type);if(fromExcel&&typeof classroomBackupFromXlsx!=='function')return orig(file);
  const backup=classroomValidBackup(await (window.classroomMaybeDecrypt||(x=>x))(JSON.parse(fromExcel?await classroomBackupFromXlsx(file):await file.text())));
  const stamp=(()=>{const t=new Date(backup.createdAt);return isNaN(t)?'':t.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})})();
  const local=await classroomBackupData();const probe=merge(local,backup,'incoming');const s=probe.stats;
  if(!sum(s.neu)&&!sum(s.nurHier)&&!sum(s.geloescht)&&!s.neuerBackup&&!s.neuerHier&&!s.offen){await classroomAlert('Das Backup'+(stamp?' vom '+stamp:'')+' und dieses Gerät sind auf demselben Stand. Es gibt nichts zu übernehmen.');return false}
  const choice=await ask(s,stamp);if(!choice)return false;
  if(choice==='replace')return classroomRestoreBackup(backup,{restoredLabel:stamp?'Backup vom '+stamp:'Backup'});
  const {merged}=merge(local,backup,choice.split(':')[1]);
  return classroomRestoreBackup(classroomValidBackup(merged),{restoredLabel:'Zusammengeführt mit Backup'+(stamp?' vom '+stamp:'')})}}
 const st=document.createElement('style');st.textContent='.merge-dialog{max-width:540px;width:min(540px,calc(100vw - 24px));box-sizing:border-box;max-height:calc(100dvh - 24px);overflow:auto}@media (max-width:560px){.merge-dialog{padding:18px 16px!important}.merge-dialog .classroom-dialog-actions{display:grid!important;grid-template-columns:1fr 1fr}.merge-dialog .classroom-dialog-actions button{width:100%}.merge-dialog .classroom-dialog-actions button.primary{grid-column:1/-1}}.merge-dialog h2{margin:0 0 6px}.merge-dialog .mg-list{list-style:none;margin:12px 0;padding:0;border:1px solid #dbe3ef;border-radius:12px;overflow:hidden}.merge-dialog .mg-list li{display:grid;grid-template-columns:1fr auto;gap:2px 12px;padding:9px 14px;border-top:1px solid #edf1f6}.merge-dialog .mg-list li:first-child{border-top:0}.merge-dialog .mg-list b{font-size:16px}.merge-dialog .mg-list small{grid-column:1/-1;color:#66758a;font-size:12.5px}.merge-dialog .mg-pref{border:1px solid #f0d9a8;background:#fff8ea;border-radius:12px;padding:8px 14px;margin:0 0 10px}.merge-dialog .mg-pref p{margin:0 0 4px;font-size:13px;color:#8a5a12}.merge-dialog .mg-pref label{display:inline-flex!important;flex-direction:row!important;gap:8px;align-items:center;margin:4px 20px 4px 0;white-space:nowrap;font-size:15px}.merge-dialog .mg-pref input[type=radio]{flex:none;width:18px!important;height:18px!important;margin:0!important;padding:0!important}.merge-dialog .mg-note{font-size:13px;color:#66758a}.merge-dialog .mg-warn{margin:0 0 10px;padding:8px 12px;border:1px solid #f0d9a8;background:#fff8ea;border-radius:12px;font-size:13px;color:#8a5a12}.merge-dialog .classroom-dialog-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.merge-dialog .classroom-dialog-actions button{min-height:40px;border-radius:10px;padding:0 16px;font:inherit;border:1px solid #cfd9e6;background:#fff;color:#2f5f9b;cursor:pointer}.merge-dialog .classroom-dialog-actions button.primary{background:#2f5f9b;border-color:#2f5f9b;color:#fff;font-weight:600}';document.head.append(st);
})();
;

/* ==== auto-backup.js ==== */
/* Folder access stays on this device; backup JSON remains compatible with Restore. */
(()=>{
 const section=document.createElement('fieldset');section.className='classroom-auto-backup';
 section.innerHTML='<legend>Automatische Sicherung</legend><p>Speichert Änderungen spätestens nach 30 Sekunden, solange die App geöffnet ist. Die Dateinamen enthalten Datum und Uhrzeit. Sicherungen derselben Minute werden aktualisiert; frühere Sicherungen bleiben erhalten.</p><div class="classroom-auto-actions"><button type="button" data-folder>Ordner auswählen</button><button type="button" data-resume hidden>Zugriff erlauben</button><button type="button" data-stop hidden>Deaktivieren</button></div><p role="status" data-status></p>';
 backupDialog.insertBefore(section,backupDialog.querySelector('.classroom-backup-format')||backupDialog.querySelector('.classroom-dialog-actions'));
 const status=section.querySelector('[data-status]'),folder=section.querySelector('[data-folder]'),resume=section.querySelector('[data-resume]'),stop=section.querySelector('[data-stop]');
 let handle=null,enabled=false,busy=false,lastContent='',lastDay='',lastSaved='';
 const supported=typeof window.showDirectoryPicker==='function';
 function db(){return new Promise((resolve,reject)=>{const request=indexedDB.open('classroom-manager-auto-backup',1);request.onupgradeneeded=()=>request.result.createObjectStore('settings');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
 async function setting(value){const database=await db();try{return await new Promise((resolve,reject)=>{const tx=database.transaction('settings',value===undefined?'readonly':'readwrite'),store=tx.objectStore('settings');let result;const request=value===undefined?store.get('folder'):store.put(value,'folder');request.onsuccess=()=>{result=request.result};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{database.close()}}
 function controls(){stop.hidden=!enabled;resume.hidden=!enabled||!handle;folder.textContent=enabled?'Ordner wechseln':'Ordner auswählen'}
 async function save(force=false){
  if(!enabled||!handle||busy||classroomRestoring)return;
  busy=true;
  try{
   if(await handle.queryPermission({mode:'readwrite'})!=='granted'){status.textContent='Sicherung pausiert. Bitte „Zugriff erlauben“ anklicken.';resume.hidden=false;return}
   resume.hidden=true;
   const data=await classroomBackupData(),content=JSON.stringify({model:data.model,notes:data.notes,seats:data.seats}),day=classroomToday();
   if(!force&&content===lastContent&&day===lastDay)return;
   classroomValidBackup(data);
   const now=new Date(),pad=value=>String(value).padStart(2,'0'),stamp=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
   const file=await handle.getFileHandle(`Classroom-Manager-${stamp}-automatisch.json`,{create:true}),writer=await file.createWritable();
   try{await writer.write(window.classroomBackupText?await window.classroomBackupText(data):JSON.stringify(data,null,2));await writer.close();window.classroomMarkBackup?.()}catch(error){try{await writer.abort()}catch{}throw error}
   lastContent=content;lastDay=day;lastSaved=new Date().toLocaleString('de-DE');
   status.textContent=`Aktiv · Ordner: ${handle.name} · Zuletzt gesichert: ${lastSaved}`;
  }catch(error){status.textContent=`Automatische Sicherung fehlgeschlagen: ${error.message}. Bitte das manuelle Backup verwenden.`}
  finally{busy=false}
 }
 folder.onclick=async()=>{
  try{
   const selected=await window.showDirectoryPicker({id:'classroom-backup',mode:'readwrite'});
   // Persist before replacing the current working configuration.
   await setting({handle:selected,enabled:true});handle=selected;enabled=true;controls();await save(true);
  }catch(error){if(error.name!=='AbortError')status.textContent=`Ordner konnte nicht eingerichtet werden: ${error.message}`}
 };
 resume.onclick=async()=>{try{if(await handle.requestPermission({mode:'readwrite'})==='granted')await save(true);else status.textContent='Kein Schreibzugriff. Automatische Sicherung bleibt pausiert.'}catch(error){status.textContent=error.message}};
 stop.onclick=async()=>{try{await setting({enabled:false});enabled=false;handle=null;lastContent='';controls();status.textContent='Automatische Sicherung deaktiviert. Vorhandene Dateien bleiben erhalten.'}catch(error){status.textContent=error.message}};
 /* Nur dort anzeigen, wo der Browser Ordnerzugriff unterstützt (Chrome/Edge auf Mac/PC). iPhone, iPad, Android und Safari blenden den Kasten aus. */
 if(!supported){section.hidden=true;section.style.display='none';section.setAttribute('aria-hidden','true');}
 if(!supported){folder.disabled=true;status.textContent='Hier nicht verfügbar. Bitte die App in Chrome oder Edge auf einem Mac/PC öffnen und Backup → Speichern verwenden.';return}
 status.textContent='Noch nicht eingerichtet. Wähle einen Sicherungsordner aus.';
 setting().then(saved=>{if(saved?.enabled&&saved.handle){handle=saved.handle;enabled=true;controls();save()}}).catch(()=>{status.textContent='Die Ordnerfreigabe konnte nicht geladen werden. Bitte einen Ordner auswählen.'});
 setInterval(()=>save(),30000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')save()});
})();
;

/* ==== backup-reminder.js ==== */
/* Schutz vor Datenverlust:
   - merkt sich, wann zuletzt ein Backup erstellt wurde (manuell, Excel oder automatisch),
   - markiert den Backup-Button dezent, wenn das letzte Backup älter als 7 Tage ist (oder noch keins existiert),
   - zeigt im Backup-Dialog, wann zuletzt gesichert wurde,
   - weist in Safari (nicht als Home-Bildschirm-App) einmalig darauf hin, dass Safari Daten nach 7 Tagen ohne Nutzung löschen kann. */
(()=>{
 const key='classroom-manager-last-backup-v1',hintKey='classroom-manager-safari-hint-v1',day=86400000,due=7;
 const get=k=>{try{return localStorage.getItem(k)}catch{return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 const hasData=()=>{try{return Object.keys(localStorage).some(k=>/^(notenrechner|sitzplan_|classroom-manager-common)/.test(k))}catch{return false}};
 const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const safari=/Safari\//.test(navigator.userAgent)&&!/Chrome|Chromium|CriOS|FxiOS|Edg\//.test(navigator.userAgent);
 const atRisk=safari&&!standalone&&/^https?:$/.test(location.protocol);
 function age(){const t=Number(get(key)||0);return t?Math.floor((Date.now()-t)/day):null}
 function text(){const a=age();if(a===null)return 'Noch kein Backup erstellt.';const d=new Date(Number(get(key))).toLocaleDateString('de-DE');return 'Letztes Backup: '+(a===0?'heute':a===1?'gestern':'vor '+a+' Tagen')+' ('+d+')'}
 function refresh(){
  const button=document.getElementById('classroomBackupButton');if(!button)return;const a=age(),isDue=hasData()&&(a===null||a>=due);
  button.classList.toggle('backup-due',isDue);button.title=isDue?(a===null?'Noch kein Backup – jetzt sichern':'Letztes Backup vor '+a+' Tagen – jetzt sichern'):text();
  const dialog=document.querySelector('.classroom-backup-dialog');if(!dialog)return;let line=dialog.querySelector('.backup-last');
  if(!line){line=document.createElement('p');line.className='backup-last';(dialog.querySelector('h2+p')||dialog.querySelector('h2')).after(line)}
  line.textContent=text();line.classList.toggle('is-due',isDue);
  let warn=dialog.querySelector('.backup-safari');if(atRisk&&!warn){warn=document.createElement('p');warn.className='backup-safari';warn.textContent='Hinweis: Safari kann gespeicherte Daten löschen, wenn die App 7 Tage nicht geöffnet wurde. Als App auf dem Home-Bildschirm (Teilen → „Zum Home-Bildschirm“) bzw. im Dock (Ablage → „Zum Dock hinzufügen“) gilt das nicht.';line.after(warn)}
 }
 window.classroomMarkBackup=()=>{set(key,String(Date.now()));refresh()};
 function hint(){
  if(!atRisk||get(hintKey)||!hasData())return;const bar=document.createElement('div');bar.className='classroom-safari-hint';bar.setAttribute('role','status');
  bar.innerHTML='<span><strong>Tipp:</strong> Safari kann die Daten löschen, wenn die App 7 Tage nicht geöffnet wird. Füge sie zum Home-Bildschirm bzw. Dock hinzu oder sichere regelmäßig.</span><button type="button">Verstanden</button>';
  bar.querySelector('button').onclick=()=>{set(hintKey,'1');bar.remove()};document.querySelector('.app-header')?.after(bar);
 }
 const style=document.createElement('style');style.textContent=
  '#classroomBackupButton{position:relative}#classroomBackupButton.backup-due::after{content:"";position:absolute;top:-3px;right:-3px;width:9px;height:9px;border-radius:50%;background:#e08a1e;box-shadow:0 0 0 2px #fff}'
  +'.classroom-backup-dialog .backup-last{margin:-4px 0 14px;font-size:.88rem;color:#66758a}.classroom-backup-dialog .backup-last.is-due{color:#a56522;font-weight:600}'
  +'.classroom-backup-dialog .backup-safari{margin:-6px 0 14px;padding:8px 12px;border-radius:10px;background:#fff8ef;color:#7a4b14;font-size:.84rem;line-height:1.4}'
  +'.classroom-safari-hint{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:10px 22px 0;padding:9px 14px;border:1px solid #ecd2ad;border-radius:12px;background:#fff8ef;color:#6b4513;font-size:.86rem;line-height:1.4}'
  +'.classroom-safari-hint button{flex:none;border:1px solid #d4ac7d;border-radius:9px;background:#fff;color:#87501a;padding:6px 12px;font:inherit;font-weight:600;cursor:pointer}'
  +'@media(max-width:600px){.classroom-safari-hint{margin:8px 12px 0;flex-direction:column;align-items:stretch}}';
 document.head.append(style);
 refresh();hint();setInterval(refresh,3600000);
 document.addEventListener('click',e=>{if(e.target.closest?.('#classroomBackupButton'))refresh()},true);
})();
;

/* ==== backup-location.js ==== */
/* Speicherort für Backups (Backup-Dialog → „Speicherort“): Downloads · Jedes Mal fragen · Fester Ordner.
   Nur wo der Browser Datei-/Ordnerzugriff erlaubt (Chrome/Edge auf Mac/PC). Der Ordner bleibt auf diesem Gerät
   (IndexedDB); Chrome fragt höchstens einmal pro Sitzung nach der Schreiberlaubnis. */
(()=>{
 const dialog=document.querySelector('.classroom-backup-dialog');if(!dialog)return;
 const KEY='classroom-backup-location-v1',canAsk=typeof window.showSaveFilePicker==='function',canFolder=typeof window.showDirectoryPicker==='function';
 const box=document.createElement('fieldset');box.className='classroom-backup-location';
 box.innerHTML='<legend>Speicherort</legend><div class="bl-options" role="radiogroup" aria-label="Speicherort für Backups">'
  +'<label><input type="radio" name="classroomBackupLocation" value="downloads"> Downloads (wie bisher)</label>'
  +'<label><input type="radio" name="classroomBackupLocation" value="ask"> Jedes Mal fragen</label>'
  +'<label><input type="radio" name="classroomBackupLocation" value="folder"> Fester Ordner</label></div>'
  +'<div class="bl-folder" hidden><span class="bl-folder-icon" aria-hidden="true">📁</span><span class="bl-folder-name">Noch kein Ordner gewählt</span><button type="button" class="bl-change">Ändern …</button></div>'
  +'<p class="bl-note" role="status"></p>';
 dialog.insertBefore(box,dialog.querySelector('.classroom-auto-backup')||dialog.querySelector('.classroom-backup-format')||dialog.querySelector('.classroom-dialog-actions'));
 if(!canAsk&&!canFolder){box.hidden=true;box.style.display='none';window.classroomBackupLocation=null;return}
 const folderRow=box.querySelector('.bl-folder'),folderName=box.querySelector('.bl-folder-name'),note=box.querySelector('.bl-note');
 if(!canFolder)box.querySelector('input[value=folder]').closest('label').remove();
 let handle=null;
 function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open('classroom-manager-backup-location',1);r.onupgradeneeded=()=>r.result.createObjectStore('settings');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
 async function store(value){const d=await db();try{return await new Promise((resolve,reject)=>{const tx=d.transaction('settings',value===undefined?'readonly':'readwrite'),s=tx.objectStore('settings');let out;const r=value===undefined?s.get('folder'):s.put(value,'folder');r.onsuccess=()=>{out=r.result};tx.oncomplete=()=>resolve(out);tx.onerror=()=>reject(tx.error)})}finally{d.close()}}
 const readMode=()=>{let m='';try{m=localStorage.getItem(KEY)||''}catch{}if(m==='folder'&&!canFolder)m='';return ['downloads','ask','folder'].includes(m)?m:(canAsk?'ask':'downloads')};
 function render(){const mode=readMode();for(const r of box.querySelectorAll('input[type=radio]'))r.checked=r.value===mode;folderRow.hidden=mode!=='folder';folderName.textContent=handle?handle.name:'Noch kein Ordner gewählt';
  box.dataset.summary=mode==='folder'?(handle?'Ordner „'+handle.name+'“':'Ordner wählen …'):mode==='ask'?'Jedes Mal fragen':'Downloads';box.dispatchEvent(new CustomEvent('classroom-backup-location',{bubbles:true}))}
 async function chooseFolder(){try{const picked=await window.showDirectoryPicker({id:'classroom-backup-target',mode:'readwrite'});handle=picked;await store({handle:picked});try{localStorage.setItem(KEY,'folder')}catch{}note.textContent='Backups werden ab jetzt im Ordner „'+picked.name+'“ gespeichert.';render();return true}catch(error){if(error.name!=='AbortError')note.textContent='Ordner konnte nicht gewählt werden: '+error.message;render();return false}}
 box.addEventListener('change',async e=>{const r=e.target.closest('input[type=radio]');if(!r)return;note.textContent='';if(r.value==='folder'&&!handle){if(!await chooseFolder()){render();return}}try{localStorage.setItem(KEY,r.value)}catch{}render()});
 box.querySelector('.bl-change').onclick=()=>chooseFolder();
 store().then(saved=>{if(saved?.handle)handle=saved.handle;render()}).catch(()=>render());render();
 // Vom Speichern-Button aufgerufen, solange der Klick noch als Nutzeraktion gilt. Liefert einen Datei-Handle oder null (= Download).
 window.classroomBackupLocation={
  mode:readMode,
  async prepare(name,kind){const mode=readMode(),xlsx=kind==='xlsx';
   if(mode==='ask'&&canAsk)return {file:await window.showSaveFilePicker({suggestedName:name,types:[xlsx?{description:'Excel-Datei',accept:{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}}:{description:'Classroom-Manager-Backup',accept:{'application/json':['.json']}}]}),where:null};
   if(mode==='folder'&&canFolder){if(!handle&&!await chooseFolder())throw Object.assign(new Error('Kein Ordner gewählt.'),{name:'AbortError'});
    let perm=await handle.queryPermission({mode:'readwrite'});if(perm!=='granted')perm=await handle.requestPermission({mode:'readwrite'});
    if(perm!=='granted')throw new Error('Kein Schreibzugriff auf den Ordner „'+handle.name+'“. Bitte erlauben oder einen anderen Speicherort wählen.');
    return {file:await handle.getFileHandle(name,{create:true}),where:handle.name}}
   return null}
 };
 const st=document.createElement('style');st.textContent='.classroom-backup-location{border:0;margin:0;padding:0}.classroom-backup-location legend{display:none}.classroom-backup-location .bl-options{display:flex;flex-direction:column;gap:8px}.classroom-backup-dialog .classroom-backup-location .bl-options label{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;width:auto!important;margin:0!important;padding:0!important;text-align:left!important;font-weight:400!important;cursor:pointer}.classroom-backup-dialog .classroom-backup-location .bl-options input[type=radio]{flex:none!important;width:18px!important;height:18px!important;min-height:0!important;margin:0!important;padding:0!important;accent-color:#2f5f9b}.classroom-backup-location .bl-folder{display:flex;align-items:center;gap:8px;margin-top:10px;padding:8px 10px 8px 12px;border:1px solid #e1e6ee;border-radius:10px;background:#fff}.classroom-backup-location .bl-folder-name{flex:1;min-width:0;color:#36557d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.classroom-backup-location .bl-change{flex:none;height:34px!important;padding:0 12px!important}.classroom-backup-location .bl-note{margin:8px 0 0;font-size:.85rem;color:#1d6b3a}.classroom-backup-location .bl-note:empty{display:none}';document.head.append(st);
})();
;

/* ==== storage-meter.js ==== */
/* Speicheranzeige: Backup → „Speicher“ zeigt, wie voll der Browserspeicher (localStorage) ist, und ab 85 % erscheint
   oben in der App eine Warnung („Backup öffnen“ · „Später“ – blendet bis zum nächsten Start aus).
   Gezählt werden Schlüssel und Inhalte in Zeichen; die Obergrenze des Browsers wird einmal pro Sitzung ermittelt
   (kurzer Probe-Eintrag, der sofort wieder gelöscht wird). Es werden keine Inhalte gelesen oder verschickt. */
(()=>{
 if(window!==parent||window.classroomStorageMeter)return;
 const NOMINAL=5242880,PROBE='classroom-quota-probe',WARN=85,MID=70;
 let quotaCache=null;
 try{quotaCache=Number(sessionStorage.getItem('classroom-quota-v1'))||null}catch{}
 const category=k=>/^notenrechner-fachwahl-states/.test(k)?'Notenseiten der Klassen':/^sitzplan/.test(k)?'Sitzpläne':/^classroom-manager-common/.test(k)?'Klassenlisten':/^notenrechner/.test(k)?'Einstellungen des Noten-Managers':'Sonstiges';
 function used(){let total=0;const parts={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k===PROBE)continue;const n=k.length+(localStorage.getItem(k)||'').length;total+=n;const c=category(k);parts[c]=(parts[c]||0)+n}return {total,parts}}
 function probeFree(){let lo=0,hi=NOMINAL*2,best=0;try{localStorage.removeItem(PROBE)}catch{}
  while(hi-lo>4096){const mid=Math.floor((lo+hi)/2);try{localStorage.setItem(PROBE,'x'.repeat(mid));best=mid;lo=mid}catch{hi=mid}}
  try{localStorage.removeItem(PROBE)}catch{}return best+PROBE.length}
 function measure(force){const u=used();let quota=quotaCache;
  if(!quota||force){quota=u.total>NOMINAL*.4?u.total+probeFree():NOMINAL;if(quota<u.total)quota=u.total;quotaCache=quota;try{sessionStorage.setItem('classroom-quota-v1',String(quota))}catch{}}
  const pct=Math.min(100,Math.round(u.total/quota*100));return {...u,quota,pct}}
 const fmt=n=>(n/1e6).toLocaleString('de-DE',{maximumFractionDigits:1})+' Mio.';
 const color=p=>p>=WARN?'linear-gradient(90deg,#f6d36b,#e6877d)':p>=MID?'linear-gradient(90deg,#b9e08f,#f6d36b)':'#b9e08f';
 // Bereich im Backup-Dialog (backup-layout.js macht daraus einen aufklappbaren Abschnitt „Speicher“)
 const dialog=document.querySelector('.classroom-backup-dialog');
 const box=document.createElement('div');box.className='classroom-storage-meter';
 box.innerHTML='<div class="sm-pct"></div><div class="sm-bar"><div class="sm-fill"></div></div><p class="sm-text"></p><div class="sm-legend"><span><i style="background:#b9e08f"></i>bis 70 % alles gut</span><span><i style="background:#f6d36b"></i>70–85 % im Blick behalten</span><span><i style="background:#e6877d"></i>ab 85 % Warnung</span></div>';
 if(dialog){const loc=dialog.querySelector('.classroom-backup-location');if(loc)loc.after(box);else dialog.append(box)}
 const st=document.createElement('style');st.textContent='.classroom-storage-meter{padding:4px 2px}.sm-pct{font-weight:700}.sm-bar{height:12px;border-radius:6px;background:#e9edf3;overflow:hidden;margin:6px 0}.sm-fill{height:100%;border-radius:6px;transition:width .3s}.sm-text{margin:0;font-size:.85rem;color:#66758a;line-height:1.45}.sm-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:8px;font-size:.78rem;color:#66758a}.sm-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}.classroom-storage-warning{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 16px 0;padding:10px 14px;border:1px solid #f1dcb4;border-radius:12px;background:#fff8ec;color:#7a5216;font-size:.92rem}.classroom-storage-warning .sw-actions{display:flex;gap:8px;flex:0 0 auto;white-space:nowrap}.classroom-storage-warning button{box-sizing:border-box;height:36px;padding:0 14px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:#2f5f9b;font:inherit;font-size:.9rem;cursor:pointer}';document.head.append(st);
 function render(m){box.querySelector('.sm-pct').textContent=m.pct+' % belegt';const f=box.querySelector('.sm-fill');f.style.width=m.pct+'%';f.style.background=color(m.pct);
  const top=Object.entries(m.parts).sort((a,b)=>b[1]-a[1])[0];
  box.querySelector('.sm-text').textContent='Der Browser bietet dieser App etwa '+fmt(m.quota)+' Zeichen Platz; davon sind '+fmt(m.total)+' belegt.'+(top&&m.total?' Größter Anteil: '+top[0]+' ('+Math.round(top[1]/m.total*100)+' %).':'');
  const head=dialog?.querySelector('#bk-head-store .bk-status');if(head){head.textContent=m.pct+' % belegt';head.classList.toggle('is-pending',m.pct>=WARN)}}
 // Warnung oben (ab 85 %), „Später“ bis zum nächsten Start
 function warn(m){document.querySelector('.classroom-storage-warning')?.remove();let later=false;try{later=sessionStorage.getItem('classroom-storage-later')==='1'}catch{}if(m.pct<WARN||later)return;
  const w=document.createElement('div');w.className='classroom-storage-warning';w.setAttribute('role','status');w.innerHTML='<span>⚠ Der Browserspeicher ist zu <b>'+m.pct+' %</b> belegt. Wird er voll, können neue Noten nicht mehr gespeichert werden. Bitte ein Backup speichern.</span><span class="sw-actions"><button type="button" data-sw-open>Backup öffnen</button><button type="button" data-sw-later>Später</button></span>';
  w.querySelector('[data-sw-open]').onclick=()=>{document.querySelector('[data-backup-open],#classroomBackupButton,.classroom-backup-button')?.click()||[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Backup')?.click()};
  w.querySelector('[data-sw-later]').onclick=()=>{try{sessionStorage.setItem('classroom-storage-later','1')}catch{}w.remove()};
  document.querySelector('.app-header')?.after(w)}
 function update(force){let m;try{m=measure(force)}catch(e){return}render(m);warn(m);return m}
 window.classroomStorageMeter={update,measure};
 // Beim Öffnen des Backup-Dialogs frisch messen; sonst kurz nach dem Start und danach alle 10 Minuten
 if(dialog)new MutationObserver(()=>{if(dialog.open)update(false)}).observe(dialog,{attributes:true,attributeFilter:['open']});
 setTimeout(()=>update(false),4000);setInterval(()=>update(false),600000);
})();
;

/* ==== update-check.js ==== */
/* Update-Hinweis: Die App prüft beim Öffnen, beim Zurückkehren ins Fenster und alle 30 Minuten, ob auf dem Server
   eine neuere Version liegt (Nummer im Service-Worker „classroom-manager-vNNN“). Dann erscheint oben ein Hinweis
   „Neue Version … verfügbar“ mit „Jetzt aktualisieren“ und „Später“ (bis zur nächsten neueren Version bzw. bis zum
   nächsten Start). Es wird nie ungefragt neu geladen. In der Einzeldatei (file://) gibt es keine Prüfung. */
(()=>{
 if(window!==parent||location.protocol==='file:'||!('fetch' in window))return;
 /* 8.31: Nach einem stillen Update (App startet direkt mit der neuen Version) einmal kurz zeigen „Aktualisiert auf Version …“ */
 setTimeout(()=>{try{const K='classroom-last-version-v1',v=(document.querySelector('[data-app-version]')?.textContent||'').trim().replace(',','.'),n=versionNumber(v),seen=versionNumber(localStorage.getItem(K));if(!n)return;localStorage.setItem(K,v);if(!seen||n<=seen)return;
  /* 8.35: „Was ist neu?“ nur, wenn es seit der zuletzt benutzten Version einen neuen Eintrag gibt */const fresh=((window.classroomHelpContent||[]).find(c=>c.id==='neu')?.items||[]).filter(it=>versionNumber(it[3])>seen&&versionNumber(it[3])<=n).length;
  const t=document.createElement('div');t.className='cu-done';t.setAttribute('role','status');t.innerHTML='<span class="cu-msg">✓ <span class="cu-long">Aktualisiert auf </span><b>Version '+v+'</b></span>'+(fresh?'<button type="button" class="cu-news">Was ist neu?</button>':'')+'<button type="button" class="cu-x" aria-label="Hinweis schließen">✕</button>';document.body.append(t);
  const close=()=>{t.classList.add('cu-out');setTimeout(()=>t.remove(),250)};t.querySelector('.cu-x').onclick=close;if(fresh)t.querySelector('.cu-news').onclick=()=>{close();window.classroomHelpNewSince=seen;window.classroomOpenHelp?.('neu')};setTimeout(close,12000)}catch{}},1500);
 const versionNumber=text=>{const m=/(\d+)\.(\d{1,2})/.exec(String(text||''));return m?Number(m[1])*100+Number(m[2]):0};
 const label=n=>Math.floor(n/100)+'.'+String(n%100).padStart(2,'0');
 const current=()=>versionNumber(document.querySelector('[data-app-version]')?.textContent);
 let checking=false,lastCheck=0;
 async function remoteVersion(){
  const r=await fetch('sw.js?update-check='+Date.now(),{cache:'no-store'});if(!r.ok)return 0;
  const m=/classroom-manager-v(\d+)/.exec(await r.text());return m?Number(m[1]):0;
 }
 function later(n){try{return sessionStorage.getItem('classroom-update-later')===String(n)}catch{return false}}
 function show(n){
  if(later(n))return;let bar=document.querySelector('.classroom-update-banner');
  if(!bar){bar=document.createElement('div');bar.className='classroom-update-banner';bar.setAttribute('role','status');
   bar.innerHTML='<span class="cu-text"></span><span class="cu-actions"><button type="button" class="cu-now">Jetzt aktualisieren</button><button type="button" class="cu-later">Später</button></span>';
   bar.querySelector('.cu-later').onclick=()=>{try{sessionStorage.setItem('classroom-update-later',bar.dataset.version)}catch{}bar.remove()};
   bar.querySelector('.cu-now').onclick=update;
   (document.querySelector('.classroom-storage-warning')||document.querySelector('.app-header'))?.after(bar)}
  bar.dataset.version=String(n);bar.querySelector('.cu-text').innerHTML='✨ Neue <b>Version '+label(n)+'</b> verfügbar (installiert: Version '+label(current())+'). Deine Daten bleiben erhalten.';
 }
 async function update(){
  const bar=document.querySelector('.classroom-update-banner');if(bar){bar.querySelector('.cu-now').disabled=true;bar.querySelector('.cu-text').textContent='Neue Version wird geladen …'}
  try{
   const reg=await navigator.serviceWorker?.getRegistration();
   if(reg){await reg.update();const sw=reg.installing||reg.waiting;
    if(sw)await new Promise(res=>{const t=setTimeout(res,8000);navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(t);res()},{once:true});sw.addEventListener('statechange',()=>{if(sw.state==='activated'){clearTimeout(t);res()}})})}
  }catch{}
  location.reload();
 }
 async function check(){
  if(checking||document.visibilityState!=='visible'||Date.now()-lastCheck<60000)return;checking=true;lastCheck=Date.now();
  try{const remote=await remoteVersion(),mine=current();if(remote&&mine&&remote>mine)show(remote);else document.querySelector('.classroom-update-banner')?.remove()}catch{}finally{checking=false}
 }
 const st=document.createElement('style');st.textContent='.cu-done{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9900;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 24px);box-sizing:border-box;padding:8px 8px 8px 16px;border:1px solid #9fd3b4;border-radius:14px;background:#f1faf4;color:#1f4d33;font-size:.95rem;box-shadow:0 10px 30px #1c2b4630;transition:opacity .25s,transform .25s}.cu-done.cu-out{opacity:0;transform:translate(-50%,10px)}.cu-done button{height:36px;border:1px solid #9fd3b4;border-radius:9px;background:#fff;color:#1f7a45;font:inherit;font-size:.9rem;cursor:pointer;white-space:nowrap}.cu-done .cu-news{padding:0 12px;font-weight:600}.cu-done .cu-x{width:36px;border:0;background:none;color:#5f7a6a}.cu-done .cu-msg{white-space:nowrap}.is-phone .cu-done{bottom:calc(84px + env(safe-area-inset-bottom))}.is-phone .cu-done .cu-long{display:none}.classroom-beamer-active .cu-done{display:none!important}.classroom-update-banner{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 16px 0;padding:10px 14px;border:1px solid #a8bdd8;border-radius:12px;background:#eaf0fa;color:#243247;font-size:.92rem}.classroom-update-banner .cu-actions{display:flex;gap:8px;flex:0 0 auto;white-space:nowrap}.classroom-update-banner button{box-sizing:border-box;height:36px;padding:0 14px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:#2f5f9b;font:inherit;font-size:.9rem;cursor:pointer}.classroom-update-banner .cu-now{background:#2f5f9b;border-color:#2f5f9b;color:#fff;font-weight:600}.classroom-update-banner button:disabled{opacity:.6;cursor:default}.classroom-beamer-active .classroom-update-banner{display:none!important}@media(max-width:640px){.classroom-update-banner{flex-direction:column;align-items:stretch}.classroom-update-banner .cu-actions{justify-content:flex-end}}';document.head.append(st);
 window.classroomUpdateCheck={check:()=>{lastCheck=0;return check()},show};
 setTimeout(check,5000);setInterval(check,30*60000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});addEventListener('focus',check);
})();
;

/* ==== backup-layout.js ==== */
/* Backup-Dialog übersichtlich: aufklappbare Bereiche (Speicherort · Speicher · Automatische Sicherung · Daten prüfen) mit Kurzstatus,
   darunter wie gewohnt Dateiformat (JSON/Excel) und die Buttons Speichern · Wiederherstellen · Schließen.
   Es ist immer nur ein Bereich offen. */
(()=>{
 const dialog=document.querySelector('.classroom-backup-dialog');if(!dialog||dialog.dataset.layout)return;dialog.dataset.layout='1';
 const h2=dialog.querySelector('h2'),intro=dialog.querySelector('h2+p:not(.backup-last)');intro?.classList.add('bk-hidden');
 const exportBtn=document.getElementById('classroomExportBackup'),importBtn=document.getElementById('classroomImportBackup'),status=document.getElementById('classroomBackupStatus');
 const format=dialog.querySelector('.classroom-backup-format'),actions=dialog.querySelector('.classroom-dialog-actions');
 if(!exportBtn||!importBtn||!actions)return;
 // Aufklappbare Bereiche
 const acc=document.createElement('div');acc.className='bk-acc';
 const defs=[
  {id:'loc',title:'Speicherort',el:dialog.querySelector('.classroom-backup-location')},
  {id:'store',title:'Speicher',el:dialog.querySelector('.classroom-storage-meter')},
  {id:'auto',title:'Automatische Sicherung',el:dialog.querySelector('.classroom-auto-backup')},
  {id:'check',title:'Daten prüfen',el:dialog.querySelector('.classroom-data-check')}
 ].filter(d=>d.el&&!d.el.hidden);
 const sections=new Map();
 for(const d of defs){
  const sec=document.createElement('section');sec.className='bk-sec';sec.dataset.section=d.id;
  const head=document.createElement('button');head.type='button';head.className='bk-head';head.id='bk-head-'+d.id;head.setAttribute('aria-expanded','false');head.setAttribute('aria-controls','bk-body-'+d.id);
  head.innerHTML='<span class="bk-chev" aria-hidden="true">›</span><span class="bk-title"></span><span class="bk-status"></span>';head.querySelector('.bk-title').textContent=d.title;
  const body=document.createElement('div');body.className='bk-body';body.id='bk-body-'+d.id;body.hidden=true;body.setAttribute('role','region');body.setAttribute('aria-labelledby',head.id);body.append(d.el);
  head.onclick=()=>toggle(d.id);sec.append(head,body);acc.append(sec);sections.set(d.id,{head,body});
 }
 function toggle(id,force){for(const [key,{head,body}] of sections){const open=key===id?(force??body.hidden):false;body.hidden=!open;head.setAttribute('aria-expanded',String(open))}}
 // Reihenfolge: Titel · letztes Backup (+ Safari-Hinweis) · Bereiche · Dateiformat · Speichern/Wiederherstellen/Schließen · Statusmeldung
 (format||actions).before(acc);
 // Kurzstatus
 const setStatus=(id,text,pending=false)=>{const s=sections.get(id)?.head.querySelector('.bk-status');if(!s)return;if(s.textContent!==text)s.textContent=text;s.classList.toggle('is-pending',pending)};
 function syncStatus(){const s=window.classroomSyncSummary?.();if(s)setStatus('sync',s.text,s.pending);return s}
 function autoStatus(){
  const t=(dialog.querySelector('.classroom-auto-backup [data-status]')?.textContent||'').trim();
  let text='Aus';
  if(/^Aktiv/.test(t)){const m=/(\d{1,2}:\d{2})(?::\d{2})?\s*$/.exec(t);text='Aktiv'+(m?' · '+m[1]:'')}
  else if(/nicht verfügbar/i.test(t))text='Hier nicht verfügbar';
  else if(/pausiert/i.test(t))text='Pausiert';
  else if(/fehlgeschlagen|konnte nicht/i.test(t))text='Fehler';
  setStatus('auto',text,text==='Pausiert'||text==='Fehler');
 }
 setStatus('check','Unstimmigkeiten finden');
 // Geräte-Abgleich wurde entfernt (7.49): dessen Reste (Änderungsprotokoll) einmalig aufräumen.
 try{if(localStorage.getItem('classroom-sync-meta-v1')!==null||localStorage.getItem('classroom-sync-reset-v1')!==null){localStorage.removeItem('classroom-sync-meta-v1');localStorage.removeItem('classroom-sync-reset-v1');indexedDB.deleteDatabase('classroom-manager-sync')}}catch{}
 const locEl=dialog.querySelector('.classroom-backup-location'),locStatus=()=>setStatus('loc',locEl?.dataset.summary||'');if(locEl){locEl.addEventListener('classroom-backup-location',locStatus);locStatus()}
 const autoP=dialog.querySelector('.classroom-auto-backup [data-status]');if(autoP)new MutationObserver(autoStatus).observe(autoP,{childList:true,characterData:true,subtree:true});
 document.addEventListener('classroom-sync-status',syncStatus);
 autoStatus();syncStatus();
 // Beim Öffnen: alle Bereiche zu.
 document.getElementById('classroomBackupButton')?.addEventListener('click',()=>{autoStatus();toggle(null,true)});
 const style=document.createElement('style');style.textContent=
  '.classroom-backup-dialog .bk-hidden{display:none!important}'
  +'.classroom-backup-dialog .backup-last{margin:2px 0 14px!important}'
  +'.classroom-backup-dialog .bk-acc{margin:4px 0 22px;border:1px solid #dce3ef;border-radius:14px;overflow:hidden}'
  +'.classroom-backup-dialog .bk-sec+.bk-sec{border-top:1px solid #e6ebf3}'
  +'.classroom-backup-dialog .bk-head{display:flex!important;align-items:center;gap:10px;width:100%!important;min-height:0!important;margin:0!important;padding:13px 16px!important;border:0!important;border-radius:0!important;background:#fff!important;box-shadow:none!important;color:#243247!important;font:inherit!important;text-align:left!important;cursor:pointer}'
  +'.classroom-backup-dialog .bk-head:hover{background:#f7f9fc!important}'
  +'.classroom-backup-dialog .bk-head:focus-visible{outline:3px solid #8ba9d1;outline-offset:-3px}'
  +'.classroom-backup-dialog .bk-chev{flex:none;width:12px;font-size:1.2rem;line-height:1;color:#8a97a9;transition:transform .15s}'
  +'.classroom-backup-dialog .bk-head[aria-expanded=true] .bk-chev{transform:rotate(90deg)}'
  +'.classroom-backup-dialog .bk-title{flex:none;font-weight:600}'
  +'.classroom-backup-dialog .bk-status{flex:1;min-width:0;text-align:right;font-size:.84rem;color:#66758a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  +'.classroom-backup-dialog .bk-status.is-pending{color:#2a5fb8;font-weight:600}'
  +'.classroom-backup-dialog .bk-status.is-pending::before{content:"";display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:50%;background:#2f6fd6;vertical-align:1px}'
  +'.classroom-backup-dialog .bk-body{padding:12px 16px 16px 38px;border-top:1px solid #eef2f8;background:#fafbfd}'
  +'.classroom-backup-dialog .bk-body[hidden]{display:none!important}'
  +'.classroom-backup-dialog .bk-body>.classroom-sync,.classroom-backup-dialog .bk-body>.classroom-auto-backup{margin:0!important;padding:0!important;border:0!important;min-width:0}'
  +'.classroom-backup-dialog .bk-body legend{display:none!important}'
  +'.classroom-backup-dialog .bk-body>.classroom-auto-backup>p:first-of-type{margin-top:0}'
  +'.classroom-backup-dialog .bk-body>.classroom-data-check{margin:0!important;padding:0!important;border:0!important;background:none!important}'
  +'@media(max-width:480px){.classroom-backup-dialog .bk-body{padding-left:16px}.classroom-backup-dialog .bk-body>.classroom-data-check{flex-direction:column;align-items:flex-start}}';
 document.head.append(style);
})();

/* „Alle Daten löschen …“ (Bereich „Daten prüfen“): auf Wunsch zuerst Backup, Bestätigung durch Eintippen von LÖSCHEN.
   Entfernt alles, was die App auf diesem Gerät speichert; der eigentliche Löschvorgang läuft nach dem Neuladen ganz am Anfang
   (index.html), bevor ein Skript Speicher oder Datenbanken öffnet. Andere Geräte und Backup-Dateien bleiben unberührt. */
(()=>{
 const dialog=document.querySelector('.classroom-backup-dialog');if(!dialog)return;
 const row=document.createElement('div');row.className='classroom-reset-all';
 row.innerHTML='<button type="button" class="classroom-reset-all-button">Alle Daten löschen …</button><span>Löscht alle Klassen, Noten und Sitzpläne auf diesem Gerät. Backups und andere Geräte bleiben erhalten.</span>';
 const host=dialog.querySelector('#bk-body-check')||dialog.querySelector('.classroom-data-check')?.parentElement||dialog;host.append(row);
 const style=document.createElement('style');style.textContent='.classroom-reset-all{display:flex;align-items:center;gap:12px;margin:16px 0 0;padding:14px 0 0;border-top:1px solid #e3e8f0}@media(max-width:480px){.classroom-reset-all{flex-direction:column;align-items:flex-start}}.classroom-reset-all span{font-size:.84rem;color:#66758a;line-height:1.4}.classroom-backup-dialog .classroom-reset-all-button{flex:none;white-space:nowrap;color:#b42318!important;border-color:#e7a59d!important;background:#fff!important}.classroom-backup-dialog .classroom-reset-all-button:hover{background:#fdecea!important}';document.head.append(style);
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 row.querySelector('button').onclick=async()=>{
  if(!await classroomConfirm('Alle Daten dieses Geräts löschen? Klassen, Noten, Hausaufgaben, Sitzpläne, Stundenplan, gelernte Namen und Einstellungen werden entfernt. Das lässt sich nur mit einem Backup rückgängig machen.',{ok:'Weiter',danger:true}))return;
  if(await classroomConfirm('Vorher ein Backup speichern?',{ok:'Backup speichern',cancel:'Ohne Backup weiter'})){
   const format=dialog.querySelector('input[name="classroomBackupFormat"][value="json"]');if(format&&!format.checked){format.checked=true;format.dispatchEvent(new Event('change',{bubbles:true}))}
   document.getElementById('classroomExportBackup')?.click();await wait(2500);
   if(!await classroomConfirm('Wurde das Backup gespeichert? Erst dann weiter.',{ok:'Ja, weiter',cancel:'Abbrechen'}))return;
  }
  const typed=await classroomPrompt('Zum Bestätigen bitte LÖSCHEN eintippen:','',{ok:'Alle Daten löschen',danger:true});
  if(typed===null)return;
  if(typed.trim().toLocaleUpperCase('de-DE')!=='LÖSCHEN'){await classroomAlert('Nicht gelöscht – die Eingabe war nicht „LÖSCHEN“.');return}
  // Teilansichten zuerst schließen (sie speichern beim Verlassen noch), dann leeren und neu laden.
  for(const frame of document.querySelectorAll('iframe'))frame.remove();
  await wait(300);
  try{localStorage.clear();sessionStorage.clear();sessionStorage.setItem('classroom-reset-all','1')}catch{}
  location.reload();
 };
 // Nach dem Löschen kurz bestätigen.
 try{if(sessionStorage.getItem('classroom-reset-done')==='1'){sessionStorage.removeItem('classroom-reset-done');setTimeout(()=>classroomAlert('Alle Daten auf diesem Gerät wurden gelöscht. Die App startet leer – über „Backup → Wiederherstellen“ lässt sich ein gespeicherter Stand laden.'),800)}}catch{}
})();
/* Fehlerprotokoll (Bereich „Daten prüfen“): zeigt die zuletzt aufgezeichneten Fehlermeldungen dieses Geräts – ohne Schülerdaten –
   zum Kopieren, damit sich Ursachen nachvollziehen lassen. */
(()=>{
 const dialog=document.querySelector('.classroom-backup-dialog');if(!dialog)return;
 const key='classroom-error-log-v1',read=()=>{try{const l=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(l)?l:[]}catch{return []}};
 const row=document.createElement('div');row.className='classroom-error-log';
 row.innerHTML='<button type="button" class="classroom-error-log-button">Fehlerprotokoll …</button><span></span>';
 const host=dialog.querySelector('#bk-body-check')||dialog;const reset=host.querySelector('.classroom-reset-all');reset?host.insertBefore(row,reset):host.append(row);
 const style=document.createElement('style');style.textContent='.classroom-error-log{display:flex;align-items:center;gap:12px;margin:12px 0 0}.classroom-error-log span{font-size:.84rem;color:#66758a;line-height:1.4}.classroom-backup-dialog .classroom-error-log-button{flex:none;white-space:nowrap}@media(max-width:480px){.classroom-error-log{flex-direction:column;align-items:flex-start}}';document.head.append(style);
 const fmt=t=>{try{return new Date(t).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch{return t}};
 const update=()=>{const l=read();row.querySelector('span').textContent=l.length?`${l.length} ${l.length===1?'Eintrag':'Einträge'}, zuletzt ${fmt(l.at(-1).t)}. Hilft bei der Fehlersuche – enthält keine Schülerdaten.`:'Keine Fehler aufgezeichnet.';row.querySelector('button').disabled=!l.length};
 update();new MutationObserver(()=>{if(dialog.open)update()}).observe(dialog,{attributes:true,attributeFilter:['open']});
 row.querySelector('button').onclick=async()=>{
  const l=read();if(!l.length)return;
  const ver=document.querySelector('[data-app-version]')?.textContent||'';
  const text=`Classroom-Manager ${ver} · ${navigator.userAgent.replace(/^Mozilla\/5\.0 /,'').slice(0,120)}\n`+l.slice().reverse().map(e=>`${fmt(e.t)} · ${e.w}: ${e.m}${e.s?' ('+e.s+')':''}`).join('\n');
  const copy=await classroomConfirm(text,{ok:'Kopieren',cancel:'Schließen'});
  if(copy){try{await navigator.clipboard.writeText(text);if(await classroomConfirm('Das Fehlerprotokoll wurde kopiert. Soll es jetzt geleert werden?',{ok:'Leeren',cancel:'Behalten'})){localStorage.removeItem(key);update()}}catch{classroomAlert('Kopieren war nicht möglich. Bitte einen Screenshot machen.')}}
 };
})();

/* Schnell-Backup: Doppelknopf „Backup | ⤓“ in der Kopfzeile. Der rechte Teil speichert sofort eine JSON-Sicherung
   am eingestellten Speicherort (wie „Speichern“ im Backup-Fenster mit Format JSON) und zeigt kurz ein Häkchen. */
(()=>{
 const main=document.getElementById('classroomBackupButton'),exp=document.getElementById('classroomExportBackup'),dialog=document.querySelector('.classroom-backup-dialog');
 if(!main||!exp||document.getElementById('classroomQuickBackup'))return;
 const ICON='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/></svg>',
  OK='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
 const wrap=document.createElement('span');wrap.className='cb-split';main.before(wrap);wrap.append(main);
 const q=document.createElement('button');q.type='button';q.id='classroomQuickBackup';q.className='cb-quick';q.innerHTML=ICON;q.title='Backup sofort speichern (JSON)';q.setAttribute('aria-label','Backup sofort als JSON speichern');wrap.append(q);
 const st=document.createElement('style');st.textContent='.cb-split{display:inline-flex;align-items:stretch}.cb-split>#classroomBackupButton{border-top-right-radius:0!important;border-bottom-right-radius:0!important}.cb-split>.cb-quick{display:inline-flex;align-items:center;justify-content:center;width:40px;padding:0!important;margin:0!important;border-top-left-radius:0!important;border-bottom-left-radius:0!important;border-left:0!important;color:#2f5f9b}.cb-quick.is-ok{color:#2e8b57!important;background:#effaf3!important}.cb-quick.is-busy{opacity:.6;cursor:progress}';document.head.append(st);
 let busy=false;
 q.onclick=async()=>{if(busy)return;busy=true;q.classList.add('is-busy');
  const radios=[...(dialog?.querySelectorAll('input[name=classroomBackupFormat]')||[])],prev=radios.find(r=>r.checked),json=radios.find(r=>r.value==='json');if(json)json.checked=true;
  const status=document.getElementById('classroomBackupStatus');if(status)status.textContent='';
  try{await exp.onclick?.()}catch(e){console.error(e)}finally{if(prev)prev.checked=true;busy=false;q.classList.remove('is-busy')}
  const msg=(status?.textContent||'').trim(),ok=/gespeichert|bereitgestellt/i.test(msg);
  if(ok){q.classList.add('is-ok');q.innerHTML=OK;q.title=msg;setTimeout(()=>{q.classList.remove('is-ok');q.innerHTML=ICON;q.title='Backup sofort speichern (JSON)'},2000)}
  else if(msg&&!/abgebrochen/i.test(msg)){main.click()}};
 // ⬆ Neuestes Backup sofort wiederherstellen: am Mac (Chrome/Edge) aus dem festen Ordner bzw. dem Ordner der
 // automatischen Sicherung, sonst (Safari, iPad) über die Dateiauswahl. Rückfrage und „Rückgängig“ wie beim normalen Wiederherstellen.
 const UP='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V9"/><path d="m7 14 5-5 5 5"/><path d="M5 5h14"/></svg>';
 const r=document.createElement('button');r.type='button';r.id='classroomQuickRestore';r.className='cb-quick cb-restore';r.innerHTML=UP;r.title='Neuestes Backup wiederherstellen (mit Rückfrage, lässt sich rückgängig machen)';r.setAttribute('aria-label','Neuestes Backup wiederherstellen');wrap.append(r);
 const st2=document.createElement('style');st2.textContent='.cb-split>.cb-quick+.cb-quick{border-left:1px solid #cbd6e5!important}.cb-split>.cb-quick:not(:last-child){border-top-right-radius:0!important;border-bottom-right-radius:0!important}.classroom-restore-banner{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 16px 0;padding:10px 14px;border:1px solid #b7dfc4;border-radius:12px;background:#eefaf2;color:#1f5133;font-size:.92rem}.classroom-restore-banner .cr-actions{display:flex;gap:8px;flex:0 0 auto}.classroom-restore-banner button,.classroom-restore-undo{box-sizing:border-box;height:36px;padding:0 14px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:#2f5f9b;font:inherit;font-size:.9rem;cursor:pointer}.classroom-restore-undo{width:100%;margin-top:10px}@media (max-width:540px){.cb-split>.cb-quick{flex:0 0 34px!important;width:34px!important;min-width:34px!important}.cb-split>#classroomBackupButton{min-width:0!important;padding-inline:6px!important;font-size:.86rem!important}}@media screen and (max-width:540px) and (orientation:portrait){.app-header .classroom-global-actions.classroom-global-actions:has(.cb-restore){grid-template-columns:42px 42px minmax(0,.9fr) minmax(0,1.1fr)!important}.app-header .cb-split{width:100%}.app-header .cb-split>#classroomBackupButton{flex:1 1 auto}}';document.head.append(st2);
 const idb=(name,key)=>new Promise(res=>{try{const q=indexedDB.open(name,1);q.onupgradeneeded=()=>{q.result.createObjectStore('settings')};q.onerror=()=>res(null);q.onsuccess=()=>{const d=q.result;try{const g=d.transaction('settings','readonly').objectStore('settings').get(key);g.onsuccess=()=>{d.close();res(g.result||null)};g.onerror=()=>{d.close();res(null)}}catch{d.close();res(null)}}}catch{res(null)}});
 async function folders(){const out=[];let mode='';try{mode=localStorage.getItem('classroom-backup-location-v1')||''}catch{}
  if(mode==='folder'){const v=await idb('classroom-manager-backup-location','folder');if(v?.handle)out.push(v.handle)}
  const a=await idb('classroom-manager-auto-backup','folder');if(a?.enabled&&a.handle)out.push(a.handle);return out}
 async function newest(handles){let best=null;for(const h of handles){try{let p=await h.queryPermission({mode:'read'});if(p!=='granted')p=await h.requestPermission({mode:'read'});if(p!=='granted')continue;
   for await(const [name,entry] of h.entries()){if(entry.kind!=='file'||!/^Classroom-Manager-.*\.(json|xlsx)$/i.test(name)||/archiv/i.test(name))continue;const f=await entry.getFile();if(!best||f.lastModified>best.lastModified)best=f}}catch(e){console.warn(e)}}return best}
 const picker=()=>document.getElementById('classroomBackupFile')?.click();
 r.onclick=async()=>{if(typeof window.showDirectoryPicker!=='function'){picker();return}
  const hs=await folders();if(!hs.length){picker();return}
  const f=await newest(hs);if(!f){await (window.classroomAlert||alert)('Im Backup-Ordner wurde kein Backup gefunden. Bitte die Datei auswählen.');picker();return}
  try{await window.classroomRestoreFile(f)}catch(e){await (window.classroomAlert||alert)('Das Backup „'+f.name+'“ konnte nicht geladen werden: '+e.message)}};
 // Nach dem Wiederherstellen: Hinweis mit „Rückgängig“; im Backup-Dialog bleibt die letzte Wiederherstellung rückgängig zu machen.
 let done=null;try{done=sessionStorage.getItem('classroom-restore-done');sessionStorage.removeItem('classroom-restore-done')}catch{}
 if(done){const b=document.createElement('div');b.className='classroom-restore-banner';b.setAttribute('role','status');b.innerHTML='<span class="cr-text"></span><span class="cr-actions"><button type="button" class="cr-undo">Rückgängig</button><button type="button" class="cr-ok">OK</button></span>';b.querySelector('.cr-text').textContent='✓ '+done+' wiederhergestellt.';b.querySelector('.cr-ok').onclick=()=>b.remove();b.querySelector('.cr-undo').onclick=()=>window.classroomRestoreUndo?.();
  const place=()=>{const h=document.querySelector('.app-header');if(h){h.after(b);return true}return false};if(!place())addEventListener('DOMContentLoaded',place,{once:true})}
 const undoBtn=document.createElement('button');undoBtn.type='button';undoBtn.className='classroom-restore-undo';undoBtn.id='classroomRestoreUndoButton';undoBtn.hidden=true;undoBtn.onclick=()=>window.classroomRestoreUndo?.();
 (dialog?.querySelector('.classroom-dialog-actions')||dialog?.lastElementChild)?.after(undoBtn);
 async function refreshUndo(){const i=await window.classroomRestoreUndoInfo?.();undoBtn.hidden=!i;if(i)undoBtn.textContent='↶ Letzte Wiederherstellung rückgängig machen · Stand von '+new Date(i.at).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
 if(dialog)new MutationObserver(()=>{if(dialog.open)refreshUndo()}).observe(dialog,{attributes:true,attributeFilter:['open']});
})();
;

/* ==== student-overview.js ==== */
/* Schülerübersicht: links die Klasse mit Fehltagen, rechts das Profil der gewählten Person –
   Fehlzeiten (aus dem Unterrichts-Manager) und alle Übersichtswerte aus allen Fächern, Halbjahren und Quartalen
   (berechnet vom Noten-Manager wie in der Quartals- bzw. Halbjahresübersicht). Drucken bzw. als PDF sichern möglich.
   Geöffnet über „Schülerübersicht“ im Noten-Manager (links in der Aktionszeile). */
(()=>{
 const palette=['','#b8e9ce','#e0f2ce','#fffbb8','#ffedb8','#fbcbc7','#edb8b8'];
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const norm=s=>String(s||'').trim().toLocaleLowerCase('de-DE');
 const fmtDate=d=>d.split('-').reverse().join('.');
 const dlg=document.createElement('dialog');dlg.className='student-overview';dlg.setAttribute('aria-label','Schülerübersicht');
 dlg.innerHTML='<div class="so-head"><h2></h2><div class="so-head-actions"><button type="button" data-so-edit title="Schüler:innen hinzufügen, umbenennen oder entfernen">Bearbeiten</button><button type="button" data-so-gender title="Geschlecht in der Klassenliste bearbeiten">Geschlecht</button><button type="button" data-so-cmp title="Zwei Fächer dieser Klasse je Schüler:in nebeneinander">Fächer vergleichen</button><button type="button" data-so-print>Drucken</button><button type="button" data-so-close>Schließen</button></div></div>'
  +'<div class="so-body"><aside class="so-list"><input type="search" placeholder="Suchen …" aria-label="Person suchen" autocomplete="off"><div class="so-sort" role="group" aria-label="Sortierung"><button type="button" data-sort="name" aria-pressed="true">Name</button><button type="button" data-sort="absent" aria-pressed="false">Fehltage</button></div><ol></ol><p class="so-class-sum"></p></aside><section class="so-profile" tabindex="-1"></section></div><section class="so-cmp" hidden></section>';
 document.body.append(dlg);
 const list=dlg.querySelector('ol'),profile=dlg.querySelector('.so-profile'),search=dlg.querySelector('input'),title=dlg.querySelector('h2'),sum=dlg.querySelector('.so-class-sum');
 let group=null,keys=[],sort='name',selected=null,token=0;
 function currentGroup(preferred){
  const model=classroomModel||{};
  if(preferred){const g=model.classes?.find(c=>c.id===preferred);if(g)return g}
  let subject='',active={};try{subject=localStorage.getItem('notenrechner-aktives-fach-v1')||'';active=JSON.parse(localStorage.getItem('notenrechner-aktive-klassen-v1')||'{}')}catch{}
  const id=model.sourceClasses?.[subject+'::'+active[subject]];return model.classes?.find(c=>c.id===id)||null;
 }
 const absences=(g,id)=>Object.entries(g.attendance||{}).filter(([d,m])=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&m?.[id]===true).map(([d])=>d).sort();
 function people(){const q=norm(search.value);let rows=(group?.students||[]).filter(s=>!s.deleted).map(s=>({s,days:absences(group,s.id)}));if(q)rows=rows.filter(r=>norm(r.s.name).includes(q));rows.sort((a,b)=>sort==='absent'?b.days.length-a.days.length||a.s.name.localeCompare(b.s.name,'de'):a.s.name.localeCompare(b.s.name,'de'));return rows}
 /* 9.56: „Geschlecht“ im Kopf schaltet die Liste in den Bearbeiten-Modus (m | w je Zeile), „Fertig“ beendet ihn – ersetzt den Knopf „Geschlecht“ der Bewertungsseiten */
 let genderEdit=false;const rejected=new Set();
 /* Vorschlag aus dem Vornamen wie im früheren Fenster (gestrichelt); abgewählte Vorschläge bleiben leer */
 const guess=s=>{if(s.gender||rejected.has(s.id))return '';const g=window.classroomGenderGuess?.(s.name);return g==='m'||g==='w'?g:''};
 function applySuggestions(){const learn=[];for(const s of (group?.students||[])){if(s.deleted||s.gender)continue;const g=guess(s);if(g){s.gender=g;learn.push({name:s.name,gender:g,guess:g,suggest:g})}}if(learn.length){try{window.classroomLearnGenders?.(learn)}catch{}try{classroomBroadcast();classroomRequestRosters()}catch(e){console.warn(e)}}}
 function setGender(id,value){const person=group?.students.find(x=>x.id===id&&!x.deleted);if(!person)return;const had=!!person.gender;if(person.gender===value){person.gender='';rejected.add(person.id)}else person.gender=value;
  try{if(!had&&person.gender)window.classroomLearnGenders?.([{name:person.name,gender:person.gender,guess:window.classroomGenderGuess?.(person.name)??null,suggest:''}])}catch{}
  try{classroomBroadcast();classroomRequestRosters()}catch(e){console.warn(e)}renderList()}
 /* 10.42: Bearbeiten-Modus – hinzufügen (↵, auch ganze Listen einfügen), umbenennen (Namen antippen), entfernen (⊖ → „Entfernen“) */
 let rosterEdit=false,confirmId=null,renameId=null,editMsg='';
 const uuid=()=>(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
 const live=()=>(group?.students||[]).filter(s=>!s.deleted);
 const sync=()=>{try{ClassroomCore.sortStudents?.(group);classroomBroadcast();classroomRequestRosters()}catch(e){console.warn(e)}};
 function addNames(text){const names=String(text||'').split(/\r?\n|;|\t/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);if(!names.length)return;
  const have=new Set(live().map(s=>ClassroomCore.normalize(s.name))),added=[],dup=[];
  for(const n of names){const k=ClassroomCore.normalize(n);if(have.has(k)){dup.push(n);continue}
   /* früher entfernte Person mit gleichem Namen wieder aufnehmen (behält ihre ID, z. B. Fehltage) */const old=(group.students||[]).find(s=>s.deleted&&ClassroomCore.normalize(s.name)===k);
   if(old)delete old.deleted;else group.students.push({id:'student-'+uuid(),name:n});have.add(k);added.push(n)}
  editMsg=(added.length?added.length+(added.length===1?' Person':' Personen')+' hinzugefügt':'')+(dup.length?(added.length?' · ':'')+'schon vorhanden: '+dup.join(', '):'');if(added.length)sync();renderList();setTimeout(()=>list.querySelector('[data-so-add]')?.focus(),0)}
 function removePerson(id){const person=live().find(s=>s.id===id);if(!person)return;person.deleted=true;confirmId=null;editMsg=person.name+' entfernt (mit „Rückgängig“ oben wiederherstellbar)';if(selected===id){selected=null;profile.innerHTML='<p class="so-hint">Links eine Person wählen.</p>'}sync();renderList()}
 function renamePerson(id,name){const person=live().find(s=>s.id===id);name=String(name||'').replace(/\s+/g,' ').trim();renameId=null;if(!person||!name||name===person.name){renderList();return}
  try{window.classroomRenamePerson({classId:group.id,studentId:id,name});editMsg='Umbenannt in „'+name+'“'}catch(e){editMsg=e.message||'Bitte einen eindeutigen Namen eingeben.'}renderList();if(selected===id)renderProfile(id)}
 function renderEdit(){const rows=people();
  list.innerHTML='<li class="so-e-add"><div><input data-so-add placeholder="Nachname, Vorname" aria-label="Neuen Namen eingeben" autocomplete="off"><button type="button" data-so-addbtn aria-label="Hinzufügen">+</button></div><small>↵ fügt hinzu · eine kopierte Namensliste fügt alle auf einmal ein</small>'+(editMsg?'<small class="so-e-msg">'+esc(editMsg)+'</small>':'')+'</li>'
   +rows.map(({s})=>renameId===s.id?`<li class="so-e-row"><input data-so-ren="${esc(s.id)}" value="${esc(s.name)}" aria-label="Neuer Name"></li>`
    :`<li class="so-e-row${confirmId===s.id?' so-e-conf':''}"><button type="button" class="so-e-minus" data-so-minus="${esc(s.id)}" aria-label="${esc(s.name)} entfernen">−</button><button type="button" class="so-e-name" data-so-name="${esc(s.id)}" title="Antippen zum Umbenennen">${esc(s.name)}</button>${confirmId===s.id?`<button type="button" class="so-e-del" data-so-del="${esc(s.id)}">Entfernen</button>`:''}</li>`).join('');
  sum.textContent=live().length+' Schüler:innen';
  const add=list.querySelector('[data-so-add]');add.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();addNames(add.value)}};add.onpaste=e=>{const t=e.clipboardData?.getData('text')||'';if(/\n/.test(t.trim())){e.preventDefault();addNames(t)}};
  list.querySelector('[data-so-addbtn]').onclick=()=>addNames(add.value);
  const ren=list.querySelector('[data-so-ren]');if(ren){ren.focus();ren.select();let done=false;const fin=v=>{if(done)return;done=true;renamePerson(ren.dataset.soRen,v)};ren.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();fin(ren.value)}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();done=true;renameId=null;renderList()}};ren.onblur=()=>fin(ren.value)}}
 function renderList(){
  if(rosterEdit){renderEdit();return}
  if(genderEdit){const anySug=(group?.students||[]).some(s=>!s.deleted&&!s.gender&&guess(s));
   list.innerHTML='<li class="so-g-hint">Antippen wählt m oder w, erneutes Antippen hebt die Auswahl auf.'+(anySug?' Vorschläge aus dem Vornamen sind gestrichelt – sie werden mit „Fertig“ übernommen, bitte kurz prüfen.':'')+'</li>'+(people().map(({s})=>{const sg=s.gender?'':guess(s),hint=s.gender||sg?'':(window.classroomGenderGuess?.(s.name)==='?'?'nicht eindeutig':'unbekannt');return `<li class="so-g-row"><span title="${sg?'Vorschlag aus dem Vornamen':hint?'Vorname '+hint+' – bitte selbst wählen':''}">${esc(s.name)}</span><span class="so-mw" role="group" aria-label="Geschlecht von ${esc(s.name)}">${['m','w'].map(v=>`<button type="button" data-g="${v}" data-gid="${esc(s.id)}" aria-pressed="${s.gender===v}"${sg===v?' class="is-suggestion"':''} aria-label="${v==='m'?'männlich':'weiblich'}">${v}</button>`).join('')}</span></li>`}).join('')||'<li class="so-empty">Keine Treffer.</li>');
   const all=(group?.students||[]).filter(s=>!s.deleted),sugN=all.filter(s=>!s.gender&&guess(s)).length,open=all.filter(s=>!s.gender&&!guess(s)).length;sum.textContent=[sugN?sugN+(sugN===1?' Vorschlag':' Vorschläge'):'',open?open+' offen':''].filter(Boolean).join(' · ')||'Alle mit Angabe';return}
  list.innerHTML=people().map(({s,days})=>`<li><button type="button" data-id="${esc(s.id)}" aria-current="${s.id===selected}"><span>${esc(s.name)}</span><b class="${days.length>=5?'so-many':days.length?'':'so-none'}" title="Fehltage">${days.length}</b></button></li>`).join('')||'<li class="so-empty">Keine Treffer.</li>';
  const all=(group?.students||[]).filter(s=>!s.deleted),total=all.reduce((n,s)=>n+absences(group,s.id).length,0);
  sum.textContent=all.length?`${all.length} Schüler:innen · ${total} Fehltage insgesamt`:'';
 }
 let colors=null;
 function cellHtml(c){const n=typeof c.grade==='number'?Math.max(1,Math.min(6,c.grade)):null,lo=n&&Math.floor(n),hi=n&&Math.ceil(n),col=i=>colors?.[i]?.bg||palette[i];const bg=c.grade==='missing'?'#e5484d':n?(lo===hi?col(lo):`repeating-linear-gradient(135deg,${col(lo)} 0 6px,${col(hi)} 6px 12px)`):'';const fg=c.grade==='missing'?'#fff':n&&lo===hi&&colors?.[lo]?.fg?colors[lo].fg:'';const v=typeof c.v==='number'?c.v.toLocaleString('de-DE',{maximumFractionDigits:2}):c.v;return `<span class="so-val" style="${bg?'background:'+bg+';':''}${fg?'color:'+fg+';':''}">${esc(v===''||v==null?'—':v)}</span>`}
 async function renderProfile(id){
  const person=group?.students.find(s=>s.id===id);if(!person){profile.innerHTML='<p class="so-hint">Links eine Person wählen.</p>';return}
  selected=id;renderList();const days=absences(group,id),my=++token;
  profile.innerHTML=`<h3>${esc(person.name)}</h3><section class="so-section"><h4>Fehlzeiten</h4><p><strong>${days.length}</strong> ${days.length===1?'Fehltag':'Fehltage'} in ${esc(group.name)}</p>${days.length?'<div class="so-chips">'+days.map(d=>`<span>${fmtDate(d)}</span>`).join('')+'</div>':''}</section><p class="so-hint" data-so-loading>Bewertungen werden geladen …</p>`;
  let blocks=[];try{const r=await classroomCall(classroomNotes,'classroom:student-profile',{keys,name:person.name});blocks=r.blocks||[]/* Bewusst die hellen Farben (wie in der Schnelleingabe), nicht die kräftigen Tabellenfarben. */}catch(error){if(my===token)profile.querySelector('[data-so-loading]').textContent='Bewertungen konnten nicht geladen werden: '+error.message;return}
  if(my!==token)return;profile.querySelector('[data-so-loading]')?.remove();
  if(!blocks.length){profile.insertAdjacentHTML('beforeend','<p class="so-hint">Keine Bewertungen gefunden.</p>');return}
  const html=blocks.map(b=>{const parts=b.title.split(' · ').filter(p=>!/^(Noten|Notenpunkte)$/.test(p)),sums=b.header.map((h,i)=>({h,c:b.cells[i]})).filter(x=>x.h.summary||/^Quartalsnote|^Selbsteinschätzung|^Halbjahresnote/.test(x.h.label)),details=b.header.map((h,i)=>({h,c:b.cells[i]})).filter(x=>!x.h.summary&&!/^Quartalsnote|^Selbsteinschätzung|^Halbjahresnote/.test(x.h.label)&&x.c&&x.c.v!=='—'&&x.c.v!=='');
   return `<section class="so-section"><h4>${esc(parts.join(' · '))}</h4><div class="so-sums">${sums.map(x=>`<div><small>${esc(x.h.label)}</small>${cellHtml(x.c||{v:'—'})}</div>`).join('')}</div>${details.length?`<details><summary>Einzelwerte (${details.length})</summary><div class="so-details">${details.map(x=>`<div><small>${esc(x.h.label)}</small>${cellHtml(x.c)}</div>`).join('')}</div></details>`:''}</section>`}).join('');
  profile.insertAdjacentHTML('beforeend',html);
  subjectTable(person,my);
 }
 async function open({classId=null,studentId=null}={}){
  group=currentGroup(classId);if(!group){await classroomAlert('Bitte zuerst im Noten-Manager eine Klasse wählen.');return}
  keys=Object.entries(classroomModel.sourceClasses||{}).filter(([,v])=>v===group.id).map(([k])=>k);
  title.textContent='Schülerübersicht · '+group.name;search.value='';selected=null;genderEdit=false;rosterEdit=false;confirmId=null;renameId=null;editMsg='';{const eb=dlg.querySelector('[data-so-edit]');eb.textContent='Bearbeiten';eb.classList.remove('so-primary');eb.hidden=false;dlg.querySelector('[data-so-gender]').hidden=false}dlg.querySelector('[data-so-gender]').textContent='Geschlecht';dlg.querySelector('[data-so-gender]').classList.remove('so-primary');dlg.querySelector('.so-sort').hidden=false;renderList();
  if(!dlg.open)dlg.showModal();
  cmpData=null;cmpMode(false);dlg.querySelector('[data-so-cmp]').hidden=keys.length<2;
  const first=studentId||null;if(first)renderProfile(first);else profile.innerHTML='<p class="so-hint">Links eine Person wählen. Die Zahl rechts neben dem Namen sind die Fehltage.</p>';
  setTimeout(()=>(first?profile:search).focus(),0);
 }
 /* ---------- 10.65: Fächervergleich ---------- */
 let cmpData=null,cmpOn=false;const cmpState={a:'',b:'',hy:'',lv:'hj',exA:'',exB:'',sort:'name'};
 const cmpSec=dlg.querySelector('.so-cmp'),bodyEl=dlg.querySelector('.so-body');
 const loadCmp=()=>cmpData||(cmpData=classroomCall(classroomNotes,'classroom:subject-compare',{keys}).then(r=>r.subjects||[]).catch(e=>{cmpData=null;throw e}));
 const asGrade=(v,sys)=>v==null?null:sys==='gradePoints'?Math.max(1,Math.min(6,(17-v)/3)):v;
 const tend=v=>{const t=Math.round(v*3)/3,b=Math.round(t);return t<b-1e-6?b+'+':t>b+1e-6?b+'−':String(b)};
 const fmt=(v,sys,rounded)=>v==null?'—':sys==='gradePoints'?String(Math.round(v)):rounded?String(roundG(v)):tend(v);
 const roundG=v=>Math.max(1,Math.min(6,Math.ceil(Number(v)-0.5-1e-10)));
 const chip=(v,sys,rounded)=>v==null?'<span class="so-val so-none-v">—</span>':cellHtml({v:fmt(v,sys,rounded),grade:rounded&&sys!=='gradePoints'?roundG(v):asGrade(v,sys)});
 const dDe=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8,10)+'.'+d.slice(5,7)+'.':'';
 const hyLabels=data=>{const out=[];for(const x of data)for(const h of x.halfYears)if(h.label&&!out.includes(h.label))out.push(h.label);for(const x of data)for(const e of x.exams)if(e.halfYear&&!out.includes(e.halfYear))out.push(e.halfYear);return out};
 const examsIn=(x,hy)=>x.exams.filter(e=>!hy||e.halfYear===hy).sort((p,q)=>(p.date||'9').localeCompare(q.date||'9'));
 /* Variante 1: kompakte Tabelle oben im Profil (ein Fach je Zeile) */
 async function subjectTable(person,my){if(keys.length<2)return;let data;try{data=await loadCmp()}catch{return}if(my!==token)return;
  const name=String(person.name||'').trim(),hys=hyLabels(data);let hy='';for(const h of hys)if(data.some(x=>x.halfYears.find(y=>y.label===h)?.students[name]?.q.some(v=>v!=null)||examsIn(x,h).some(e=>e.values[name]!=null)))hy=h;if(!hy)return;
  const qn=Math.max(0,...data.map(x=>x.halfYears.find(y=>y.label===hy)?.quarters.length||0)),qh=(data.find(x=>x.halfYears.find(y=>y.label===hy)?.quarters.length===qn)?.halfYears.find(y=>y.label===hy)?.quarters)||[],kn=Math.max(0,...data.map(x=>examsIn(x,hy).length));
  const head='<tr><th>Fach</th>'+Array.from({length:qn},(_,i)=>'<th>'+esc(qh[i]||'Q'+(i+1))+'</th>').join('')+Array.from({length:kn},(_,i)=>'<th>'+(kn===1?'KA':'KA '+(i+1))+'</th>').join('')+'<th class="so-ft-hj">'+esc(hy.replace(/^(\d)\.\s*Halbjahr$/,'$1. Hj.'))+'</th></tr>';
  const rows=data.map(x=>{const h=x.halfYears.find(y=>y.label===hy),st=h?.students[name],ex=examsIn(x,hy);return '<tr><td class="so-ft-f">'+esc(x.subjectLabel)+'</td>'+Array.from({length:qn},(_,i)=>'<td>'+chip(st?.q[i]??null,x.system)+'</td>').join('')+Array.from({length:kn},(_,i)=>{const e=ex[i];return '<td'+(e?' title="'+esc([e.label,dDe(e.date),e.topic].filter(Boolean).join(' · '))+'"':'')+'>'+(e?chip(e.values[name]??null,e.system==='gradePoints'?'gradePoints':x.system):'<span class="so-none-v">—</span>')+'</td>'}).join('')+'<td class="so-ft-hj">'+chip(st?.hj??null,x.system,true)+'</td></tr>'}).join('');
  const sec=document.createElement('section');sec.className='so-section so-ftab';sec.innerHTML='<h4>Fächer im Überblick · '+esc(hy)+'</h4><div class="so-ftw"><table><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>';
  profile.querySelector(':scope>h3')?.after(sec)}
 /* Variante 2: zwei Fächer der Klasse nebeneinander */
 function cmpMode(on){cmpOn=on;cmpSec.hidden=!on;bodyEl.hidden=on;const b=dlg.querySelector('[data-so-cmp]');b.textContent=on?'← Schülerübersicht':'Fächer vergleichen';b.classList.toggle('so-primary',false);for(const sel of ['[data-so-edit]','[data-so-gender]'])dlg.querySelector(sel).hidden=on||dlg.querySelector(sel).dataset.hideCmp==='1';title.textContent=(on?'Fächer vergleichen · ':'Schülerübersicht · ')+(group?.name||'')}
 async function renderCmp(){cmpSec.innerHTML='<p class="so-hint">Wird berechnet …</p>';let data;try{data=await loadCmp()}catch(e){cmpSec.innerHTML='<p class="so-hint">Konnte nicht geladen werden: '+esc(e.message)+'</p>';return}
  const S=cmpState,byKey=k=>data.find(x=>x.key===k);if(!byKey(S.a))S.a=data[0]?.key||'';if(!byKey(S.b)||S.b===S.a)S.b=(data.find(x=>x.key!==S.a)||{}).key||'';const A=byKey(S.a),B=byKey(S.b);if(!A||!B){cmpSec.innerHTML='<p class="so-hint">In dieser Klasse gibt es nur ein Fach.</p>';return}
  const hys=hyLabels([A,B]);if(!hys.includes(S.hy))S.hy=hys.at(-1)||'';
  const hA=A.halfYears.find(y=>y.label===S.hy),hB=B.halfYears.find(y=>y.label===S.hy),qs=(hA?.quarters.length>=(hB?.quarters.length||0)?hA?.quarters:hB?.quarters)||[],eA=examsIn(A,S.hy),eB=examsIn(B,S.hy);
  const levels=[...qs.map((q,i)=>['q'+i,q]),['hj','Halbjahr'],['ka','Klassenarbeit']];if(!levels.some(l=>l[0]===S.lv))S.lv='hj';
  if(!eA.some(e=>e.id===S.exA))S.exA=eA[0]?.id||'';if(!eB.some(e=>e.id===S.exB))S.exB=eB[0]?.id||'';
  const opt=(list,sel,lab)=>list.map(x=>'<option value="'+esc(x.key??x.id)+'"'+((x.key??x.id)===sel?' selected':'')+'>'+esc(lab(x))+'</option>').join('');
  const exLab=e=>[e.label,dDe(e.date),e.topic].filter(Boolean).join(' · ');
  const seg=(items,cur,attr)=>'<div class="so-sort so-cseg">'+items.map(([k,l,dis])=>'<button type="button" '+attr+'="'+k+'" aria-pressed="'+(k===cur)+'"'+(dis?' disabled':'')+'>'+esc(l)+'</button>').join('')+'</div>';
  const get=(X,h,ex,name)=>{if(S.lv==='ka'){const e=ex.find(e=>e.id===(X===A?S.exA:S.exB));return e?{v:e.values[name]??null,sys:e.system==='gradePoints'?'gradePoints':X.system,r:false}:{v:null,sys:X.system}}const st=h?.students[name];if(S.lv==='hj')return {v:st?.hj??null,sys:X.system,r:true};return {v:st?.q[+S.lv.slice(1)]??null,sys:X.system,r:false}};
  /* ganze Notenstufe so, wie die Note angezeigt wird (3+ zählt als 3) */const stepOf=x=>{const g=asGrade(x.v,x.sys);return roundG(x.r||x.sys==='gradePoints'?g:Math.round(g*3)/3)};
  const pts=A.system==='gradePoints'&&B.system==='gradePoints'&&S.lv!=='ka'||S.lv==='ka'&&[...eA,...eB].every(e=>e.system==='gradePoints'),lim=pts?4:2;
  const names=(group?.students||[]).filter(s=>!s.deleted).map(s=>String(s.name||'').trim()).filter(Boolean);
  let rows=names.map(n=>{const a=get(A,hA,eA,n),b=get(B,hB,eB,n);let d=null;if(a.v!=null&&b.v!=null)d=pts?Math.round(b.v)-Math.round(a.v):stepOf(b)-stepOf(a);return {n,a,b,d}});
  if(S.sort==='diff')rows.sort((x,y)=>(y.d==null?-1:Math.abs(y.d))-(x.d==null?-1:Math.abs(x.d))||x.n.localeCompare(y.n,'de'));
  const big=r=>r.d!=null&&Math.abs(r.d)>=lim;
  const dHtml=d=>{if(d==null)return '<span class="so-none-v">—</span>';if(Math.abs(d)<1e-6)return '<span class="so-df so-eq">0</span>';const a=Math.abs(d),t=Number.isInteger(Math.round(a*1e6)/1e6)?String(Math.round(a)):a.toLocaleString('de-DE',{maximumFractionDigits:1});return '<span class="so-df '+(d>0?'so-dn':'so-up')+(a>=lim?' so-big':'')+'" title="'+(d>0?esc(B.subjectLabel)+' schlechter':esc(B.subjectLabel)+' besser')+'">'+(d>0?'▼':'▲')+' '+t+'</span>'};
  const mean=(list,side)=>{const v=list.map(r=>r[side]).filter(x=>x.v!=null).map(x=>x.sys==='gradePoints'?x.v:(x.r?roundG(x.v):x.v));if(!v.length)return '—';return (v.reduce((s,x)=>s+x,0)/v.length).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})};
  const lvLabel=(levels.find(l=>l[0]===S.lv)||[])[1]||'';
  cmpSec.innerHTML='<div class="so-cbar"><select data-c="a" aria-label="Erstes Fach">'+opt(data,S.a,x=>x.subjectLabel)+'</select><span class="so-cvs">vs.</span><select data-c="b" aria-label="Zweites Fach">'+opt(data.filter(x=>x.key!==S.a),S.b,x=>x.subjectLabel)+'</select>'+(hys.length>1?'<select data-c="hy" aria-label="Halbjahr">'+hys.map(h=>'<option'+(h===S.hy?' selected':'')+'>'+esc(h)+'</option>').join('')+'</select>':'')
   +seg(levels.map(([k,l])=>[k,l,k==='ka'&&!(eA.length&&eB.length)]),S.lv,'data-lv')+seg([['name','A–Z'],['diff','Unterschied']],S.sort,'data-cs')+'</div>'
   +(S.lv==='ka'?'<div class="so-cbar so-cex"><label>'+esc(A.subjectLabel)+' <select data-c="exA">'+opt(eA,S.exA,exLab)+'</select></label><label>'+esc(B.subjectLabel)+' <select data-c="exB">'+opt(eB,S.exB,exLab)+'</select></label></div>':'')
   +'<div class="so-ctw"><table class="so-ctab"><thead><tr><th>Schüler:in</th><th>'+esc(A.subjectLabel)+'</th><th>'+esc(B.subjectLabel)+'</th><th>Unterschied</th></tr></thead><tbody>'
   +rows.map(r=>'<tr class="'+(big(r)?'so-hl':'')+'"><td class="so-cn">'+esc(r.n)+'</td><td>'+chip(r.a.v,r.a.sys,r.a.r)+'</td><td>'+chip(r.b.v,r.b.sys,r.b.r)+'</td><td>'+dHtml(r.d)+'</td></tr>').join('')+'</tbody></table></div>'
   +'<div class="so-cfoot"><span><i class="so-dot"></i>'+rows.filter(big).length+' mit '+(pts?'4 oder mehr Punkten':'2 oder mehr Notenstufen')+' Abstand</span><span>'+esc(lvLabel)+' · Ø '+esc(A.subjectLabel)+' '+mean(rows,'a')+' · Ø '+esc(B.subjectLabel)+' '+mean(rows,'b')+'</span></div>'
   +'<p class="so-hint so-cnote">▼ = im zweiten Fach schlechter, ▲ = besser. Der Unterschied zählt ganze Notenstufen (gerundete Noten). Halbjahr: Zeugnisnote; Quartale und Klassenarbeiten mit Tendenz.</p>';
  cmpSec.querySelectorAll('select[data-c]').forEach(el=>el.onchange=()=>{S[el.dataset.c]=el.value;if(el.dataset.c==='a'&&S.b===S.a)S.b='';renderCmp()});
  cmpSec.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{S.lv=b.dataset.lv;renderCmp()});cmpSec.querySelectorAll('[data-cs]').forEach(b=>b.onclick=()=>{S.sort=b.dataset.cs;renderCmp()})}
 function cmpPrint(){const c=cmpSec.cloneNode(true);const parts=[...cmpSec.querySelectorAll('select')].map(x=>x.selectedOptions[0]?.textContent||'');const lv=cmpSec.querySelector('[data-lv][aria-pressed=true]')?.textContent||'';c.querySelectorAll('.so-cbar').forEach(x=>x.remove());return '<h3>'+esc(parts[0]+' / '+parts[1]+' · '+lv+(cmpState.hy?' · '+cmpState.hy:''))+'</h3>'+c.innerHTML}
 dlg.querySelector('[data-so-cmp]').onclick=()=>{cmpMode(!cmpOn);if(cmpOn)renderCmp()};
 dlg.addEventListener('close',()=>{if(cmpOn)cmpMode(false)});
 window.classroomOpenStudentOverview=open;
 list.onclick=e=>{if(rosterEdit){const m=e.target.closest('[data-so-minus]'),d=e.target.closest('[data-so-del]'),n=e.target.closest('[data-so-name]');if(d){removePerson(d.dataset.soDel);return}if(m){confirmId=confirmId===m.dataset.soMinus?null:m.dataset.soMinus;renderList();return}if(n){confirmId=null;renameId=n.dataset.soName;renderList();return}return}const g=e.target.closest('button[data-g]');if(g){setGender(g.dataset.gid,g.dataset.g);return}const b=e.target.closest('button[data-id]');if(b)renderProfile(b.dataset.id)};
 const gBtn=dlg.querySelector('[data-so-gender]');const paintG=()=>{gBtn.textContent=genderEdit?'✓ Fertig':'Geschlecht';gBtn.classList.toggle('so-primary',genderEdit);gBtn.setAttribute('aria-pressed',String(genderEdit));dlg.querySelector('.so-sort').hidden=genderEdit};
 gBtn.onclick=()=>{if(genderEdit)applySuggestions();else rejected.clear();genderEdit=!genderEdit;paintG();renderList()};dlg.addEventListener('close',()=>{if(genderEdit){genderEdit=false;paintG()}});
 const eBtn=dlg.querySelector('[data-so-edit]');const paintE=()=>{eBtn.textContent=rosterEdit?'✓ Fertig':'Bearbeiten';eBtn.classList.toggle('so-primary',rosterEdit);eBtn.setAttribute('aria-pressed',String(rosterEdit));gBtn.hidden=rosterEdit;dlg.querySelector('.so-sort').hidden=rosterEdit||genderEdit;eBtn.hidden=genderEdit};
 eBtn.onclick=()=>{rosterEdit=!rosterEdit;confirmId=null;renameId=null;editMsg='';if(rosterEdit&&genderEdit){genderEdit=false;paintG()}paintE();renderList();if(rosterEdit)setTimeout(()=>list.querySelector('[data-so-add]')?.focus(),0)};
 gBtn.addEventListener('click',()=>paintE());
 dlg.addEventListener('close',()=>{if(rosterEdit){rosterEdit=false;paintE()}});
 search.oninput=renderList;
 dlg.querySelector('.so-sort').onclick=e=>{const b=e.target.closest('button[data-sort]');if(!b)return;sort=b.dataset.sort;for(const x of dlg.querySelectorAll('.so-sort button'))x.setAttribute('aria-pressed',String(x===b));renderList()};
 dlg.querySelector('[data-so-close]').onclick=()=>dlg.close();
 dlg.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target===search&&search.value){e.preventDefault();search.value='';renderList()}});
 dlg.querySelector('[data-so-print]').onclick=()=>{
  const w=window.open('','_blank');if(!w){classroomAlert('Bitte Pop-ups für den Druck erlauben.');return}
  for(const d of profile.querySelectorAll('details'))d.open=true;
  w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${esc(title.textContent)}</title><style>${printCss}</style></head><body><p class="so-print-class">${esc(title.textContent)} · ${new Date().toLocaleDateString('de-DE')}</p>${cmpOn?cmpPrint():profile.innerHTML}</body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print()},250);
 };
 window.addEventListener('message',e=>{const m=e.data;if(m?.type==='classroom:open-profile'&&(e.source===classroomNotes.contentWindow||e.source===classroomSeats.contentWindow))open({classId:m.classId||null,studentId:m.studentId||null})});
 const base='.so-section{margin:0 0 14px;padding:12px 14px;border:1px solid #dce3ef;border-radius:12px;background:#fff}.so-section h4{margin:0 0 8px;font-size:.92rem;color:#315f99}.so-section p{margin:0 0 6px}'
  +'.so-sums,.so-details{display:flex;flex-wrap:wrap;gap:8px}.so-sums>div,.so-details>div{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:84px}.so-sums small,.so-details small{font-size:.72rem;color:#66758a;text-align:center;line-height:1.2;max-width:120px}'
  +'.so-val{display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:26px;padding:0 8px;border-radius:7px;background:#f1f4f8;font-weight:650;font-size:.9rem;color:#24334b;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
  +'.so-chips{display:flex;flex-wrap:wrap;gap:6px}.so-chips span{padding:2px 8px;border-radius:999px;background:#f1f3f6;border:1px solid #d5dbe3;font-size:.8rem}'
  +'details summary{cursor:pointer;margin-top:10px;font-size:.84rem;color:#315f99}.so-details{margin-top:8px}.so-hint{color:#66758a}h3{margin:0 0 12px}'
  +'.so-ftab table,.so-ctab{border-collapse:collapse;width:100%}.so-ftw,.so-ctw{overflow-x:auto}.so-ftab th,.so-ctab th{font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;color:#66758a;font-weight:650;padding:6px 6px;border-bottom:1.5px solid #dce3ef;text-align:center;white-space:nowrap}.so-ftab th:first-child,.so-ctab th:first-child{text-align:left}.so-ftab td,.so-ctab td{padding:5px 6px;border-bottom:1px solid #eef2f7;text-align:center}.so-ftab .so-val,.so-ctab .so-val{min-width:44px;height:24px}.so-ft-f,.so-cn{text-align:left!important;font-weight:600;white-space:nowrap}.so-ft-hj{background:#f4f7fb}th.so-ft-hj{color:#2f5f9b!important}.so-none-v{color:#a3adbb;background:none!important}.so-df{display:inline-block;font-weight:700;font-size:.85rem;padding:2px 8px;border-radius:7px;white-space:nowrap}.so-eq{color:#a3adbb}.so-up{color:#2c7a4b}.so-dn{color:#b5521d}.so-big.so-dn{background:#fde8dc}.so-big.so-up{background:#dff3e6}.so-hl .so-cn::before,.so-dot{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#d9822b;margin-right:7px;vertical-align:1px}.so-cfoot{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:10px;color:#66758a;font-size:.85rem}.so-cnote{font-size:.8rem;margin-top:8px}.so-ctab tbody tr:hover{background:#f7f9fd}';
 const printCss='body{font:13px/1.4 -apple-system,system-ui,sans-serif;color:#24334b;margin:16mm}'+base+'.so-print-class{color:#66758a;margin:0 0 6px}details summary{display:none}.so-section{break-inside:avoid}';
 const style=document.createElement('style');style.textContent=
  '.student-overview{width:min(1120px,calc(100vw - 24px));height:min(860px,calc(100dvh - 32px));padding:0;border:1px solid #dce3ef;border-radius:18px;color:#24334b;background:#f6f8fc;box-shadow:0 18px 60px #1c2b4630;font:15px/1.45 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}'
  +'.student-overview[open]{display:flex;flex-direction:column}.student-overview::backdrop{background:#1c2b4638}'
  +'.so-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;background:#fff;border-bottom:1px solid #dce3ef}.so-head h2{margin:0;font-size:1.15rem}.so-head-actions{display:flex;gap:8px}'
  +'.student-overview button{font:inherit}.so-head button{min-height:36px;padding:6px 14px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:var(--primary,#2f5f9b);font-size:.9rem;cursor:pointer}'
  +'.so-body{flex:1;min-height:0;display:grid;grid-template-columns:280px minmax(0,1fr)}'
  +'.so-head button.so-primary{background:#2f5f9b;border-color:#2f5f9b;color:#fff;font-weight:600}.so-g-hint{list-style:none;font-size:.82rem;color:#66758a;padding:2px 6px 6px}.so-g-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 6px;border-radius:8px}.so-g-row>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.so-mw{display:inline-flex;gap:2px;padding:2px;border-radius:999px;background:#e7edf6;flex:none}.so-mw button{width:30px;height:26px;border:0;border-radius:999px;background:transparent;color:#66778f;font-size:.9rem;cursor:pointer}.so-mw button.is-suggestion{box-shadow:inset 0 0 0 1.5px #2f5f9b;outline:1px dashed #2f5f9b;outline-offset:-4px;color:#2f5f9b}.so-mw button[aria-pressed=true]{background:#2f5f9b;color:#fff;font-weight:600}.so-sort[hidden]{display:none!important}'
  +'.so-list{display:flex;flex-direction:column;gap:8px;min-height:0;padding:12px;border-right:1px solid #dce3ef;background:#fff}'
  +'.so-list input{box-sizing:border-box;width:100%;min-height:36px;padding:6px 10px;border:1px solid #cbd6e5;border-radius:9px;font:inherit}'
  +'.so-sort{display:inline-flex;gap:2px;padding:3px;border-radius:9px;background:#e7edf6;align-self:flex-start}.so-sort button{border:0;background:none;padding:3px 12px;border-radius:7px;color:#66758a;font-size:.84rem;cursor:pointer}.so-sort button[aria-pressed=true]{background:#fff;color:var(--primary,#2f5f9b);font-weight:650;box-shadow:0 1px 3px #1c2b4626}'
  +'.so-list ol{flex:1;min-height:0;overflow:auto;margin:0;padding:0;list-style:none}.so-list li button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:7px 9px;border:0;border-radius:8px;background:none;text-align:left;color:#24334b;cursor:pointer;font-size:.92rem}.so-list li button:hover{background:#f3f6fb}.so-list li button[aria-current=true]{background:#e8f0fb;font-weight:600}'
  +'.so-list b{min-width:24px;padding:1px 7px;border-radius:999px;background:#f1f3f6;font-size:.78rem;text-align:center;color:#4a5b73}.so-list b.so-none{color:#a3adbb}.so-list b.so-many{background:#fbcbc7;color:#7a1d16}'
  +'.so-e-add{list-style:none;display:flex;flex-direction:column;gap:4px;padding:2px 2px 10px;border-bottom:1px solid #eef2f7;margin-bottom:6px}.so-e-add>div{display:flex;gap:6px}.so-list li.so-e-add input{flex:1;min-width:0;width:auto}.so-list li.so-e-add button{flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0;width:40px;height:40px;border:0;border-radius:10px;background:#2f5f9b;color:#fff;font-size:1.3rem;font-weight:700;cursor:pointer}.so-e-add small{font-size:.76rem;color:#8a97a8}.so-e-add .so-e-msg{color:#1f6b3d}'
  +'.so-e-row{display:flex;align-items:center;gap:8px;padding:3px 4px;border-radius:8px}.so-e-row.so-e-conf{background:#fdecec}.so-list li .so-e-minus{flex:none;width:22px;height:22px;padding:0;border-radius:50%;background:#d92d20;color:#fff;font-weight:800;font-size:1rem;line-height:1;display:inline-flex;align-items:center;justify-content:center}.so-list li .so-e-minus:hover{background:#b42318}.so-list li .so-e-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.so-list li .so-e-del{flex:none;width:auto;padding:4px 10px;border:1px solid #efb4b4;border-radius:8px;background:#fff;color:#b42318;font-size:.84rem;font-weight:600}.so-e-row input{width:100%}'
  +'.so-class-sum{margin:0;font-size:.78rem;color:#66758a}.so-empty{color:#66758a;padding:8px}'
  +'.so-profile{overflow:auto;padding:16px 18px}'+base
  +'.so-cmp{flex:1;min-height:0;overflow:auto;padding:16px 18px}.so-cmp[hidden],.so-body[hidden]{display:none!important}.so-cmp .so-ctw{background:#fff;border:1px solid #dce3ef;border-radius:12px;padding:6px 12px}.so-cbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px}.so-cbar select{min-height:36px;padding:4px 10px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:#2f5f9b;font:inherit;font-weight:600}.so-cvs{color:#66758a;font-size:.85rem}.so-cseg{align-self:center}.so-cseg button[disabled]{opacity:.4;cursor:default}.so-cex label{display:flex;align-items:center;gap:6px;font-size:.88rem;color:#66758a}.so-cex select{max-width:340px}'
  +'@media(max-width:720px){.so-body{grid-template-columns:1fr;grid-template-rows:42% 58%}.so-list{border-right:0;border-bottom:1px solid #dce3ef}}';
 document.head.append(style);
})();
;

/* ==== school-year.js ==== */
/* Schuljahr: Klick auf „Schuljahr 2026/27“ in der Navigationsleiste öffnet ein Menü:
   • Stundenplan …                       (timetable.js)
   • Archiv eines früheren Schuljahres öffnen …   – nur lesen, die aktuellen Daten bleiben unberührt
   • Schuljahr abschließen …             – Archivdatei speichern (optional mit Passwort), danach Noten, Hausaufgaben,
                                           Abwesenheiten und Sitzplan-Verläufe entfernen; gewählte Klassen gehen umbenannt ins neue Schuljahr.
   Außerdem: Verschlüsselung (AES-GCM, Passwort) für Archive; „Wiederherstellen“ kann verschlüsselte Archive lesen. */
(()=>{
 const el=document.querySelector('[data-school-year]');if(!el)return;
 const YEAR_KEY='notenrechner-schuljahr-v1';
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const yearStart=()=>{const m=/(\d{4})\/(\d{2})/.exec(el.textContent||'');if(m)return Number(m[1]);const d=new Date();return d.getMonth()>=7?d.getFullYear():d.getFullYear()-1};
 const yearLabel=y=>y+'/'+String(y+1).slice(2);

 /* ---------- Verschlüsselung ---------- */
 const b64=buf=>{let s='';const a=new Uint8Array(buf);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
 const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 async function keyFrom(password,salt){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
 async function encrypt(text,password,meta={}){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await keyFrom(password,salt);const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(text));return JSON.stringify({format:'classroom-manager-encrypted',version:1,...meta,salt:b64(salt),iv:b64(iv),data:b64(data)})}
 async function decrypt(obj,password){const key=await keyFrom(password,unb64(obj.salt));const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(obj.iv)},key,unb64(obj.data));return new TextDecoder().decode(plain)}
 function askPassword(text,confirmTwice=false){return new Promise(resolve=>{
  const d=document.createElement('dialog');d.className='ui-dialog sy-pw';d.innerHTML=`<p class="ui-dialog-text">${esc(text)}</p><input type="password" autocomplete="new-password" aria-label="Passwort" placeholder="Passwort">${confirmTwice?'<input type="password" autocomplete="new-password" aria-label="Passwort wiederholen" placeholder="Passwort wiederholen">':''}<p class="sy-pw-err" role="alert"></p><div class="ui-dialog-actions"><button type="button" data-c>Abbrechen</button><button type="button" class="ui-primary" data-o>OK</button></div>`;
  document.body.append(d);d.showModal();const [a,b]=d.querySelectorAll('input'),err=d.querySelector('.sy-pw-err');a.focus();
  const done=v=>{d.close();d.remove();resolve(v)};
  d.querySelector('[data-c]').onclick=()=>done(null);d.addEventListener('cancel',e=>{e.preventDefault();done(null)});
  const ok=()=>{if(!a.value){err.textContent='Bitte ein Passwort eingeben.';return}if(b&&a.value!==b.value){err.textContent='Die Passwörter stimmen nicht überein.';return}if(b&&a.value.length<6){err.textContent='Bitte mindestens 6 Zeichen verwenden.';return}done(a.value)};
  d.querySelector('[data-o]').onclick=ok;d.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}});
 })}
 // Für „Wiederherstellen“: verschlüsselte Archive nach Passwort entschlüsseln.
 window.classroomMaybeDecrypt=async obj=>{
  if(obj?.format!=='classroom-manager-encrypted')return obj;
  for(;;){const pw=await askPassword(`Diese Datei ist mit einem Passwort geschützt${obj.schoolYear?' (Schuljahr '+obj.schoolYear+')':''}. Bitte das Passwort eingeben.`);if(pw===null)throw Error('Abgebrochen – kein Passwort eingegeben.');try{return JSON.parse(await decrypt(obj,pw))}catch{await classroomAlert('Das Passwort ist falsch.')}}
 };

 window.classroomSchoolYearDebug={encrypt,decrypt};
 /* ---------- Menü ---------- */
 el.setAttribute('role','button');el.tabIndex=0;el.classList.add('sy-trigger');el.setAttribute('aria-haspopup','menu');
 const menu=document.createElement('div');menu.className='sy-menu';menu.setAttribute('role','menu');menu.hidden=true;
 menu.innerHTML='<div class="sy-menu-head"></div><button type="button" role="menuitem" data-sy="timetable" title="Stundenplan eintragen; die App wählt im Unterricht Klasse und Raum automatisch.">Stundenplan …</button><button type="button" role="menuitem" data-sy="archive" title="Eine Archivdatei eines früheren Schuljahres nur lesend ansehen.">Archiv eines früheren Schuljahres öffnen …</button><button type="button" role="menuitem" data-sy="close" class="sy-danger" title="Schuljahr als Archivdatei sichern und die Klassen für das neue Schuljahr vorbereiten. Vor jeder Änderung wird nachgefragt.">Schuljahr abschließen …</button>';
 document.body.append(menu);
 function openMenu(){menu.querySelector('.sy-menu-head').textContent='Schuljahr '+yearLabel(yearStart());menu.hidden=false;const r=el.getBoundingClientRect();menu.style.top=(r.bottom+6)+'px';menu.style.right=Math.max(8,innerWidth-r.right)+'px';menu.querySelector('button').focus()}
 const closeMenu=()=>{menu.hidden=true};
 const toggle=e=>{e.preventDefault();e.stopPropagation();menu.hidden?openMenu():closeMenu()};
 el.addEventListener('click',toggle,true);el.addEventListener('pointerdown',e=>e.stopPropagation(),true);
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')toggle(e)});
 document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!menu.contains(e.target)&&e.target!==el)closeMenu()},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();el.focus()}});
 menu.onclick=e=>{const b=e.target.closest('[data-sy]');if(!b)return;closeMenu();if(b.dataset.sy==='timetable')window.classroomOpenTimetable?.();else if(b.dataset.sy==='archive')openArchive();else openClose()};

 /* ---------- Schuljahr abschließen ---------- */
 const next=label=>{const m=/^(Klasse\s*)?(\d{1,2})(\s*[a-zäöü]?)$/i.exec(String(label).trim());return m?(m[1]||'')+(Number(m[2])+1)+m[3]:String(label).trim()};
 function rows(){
  const model=classroomModel||{classes:[],sourceClasses:{}},links=Object.entries(model.sourceClasses||{});
  const out=(model.classes||[]).map(c=>({modelId:c.id,label:c.name,keys:links.filter(([,v])=>v===c.id).map(([k])=>k)}));
  // Klassen des Noten-Managers ohne Verknüpfung
  let classes={};try{classes=JSON.parse(localStorage.getItem('notenrechner-klassen-v1')||'{}')}catch{}
  const linked=new Set(links.map(([k])=>k));
  for(const [subject,list] of Object.entries(classes))for(const item of list||[]){const k=subject+'::'+item.id;if(!linked.has(k))out.push({modelId:null,label:item.label,keys:[k]})}
  return out.filter(r=>r.keys.length||r.modelId).sort((a,b)=>a.label.localeCompare(b.label,'de',{numeric:true}));
 }
 function saveFile(name,text){
  const blob=new Blob([text],{type:'application/json'}),file=new File([blob],name,{type:'application/json'});
  if(typeof window.showSaveFilePicker==='function')return window.showSaveFilePicker({suggestedName:name,types:[{description:'Classroom-Manager-Archiv',accept:{'application/json':['.json']}}]}).then(async h=>{const w=await h.createWritable();await w.write(blob);await w.close();return 'saved'});
  if(navigator.canShare?.({files:[file]})&&classroomDevice.ios)return navigator.share({files:[file],title:name}).then(()=>'shared');
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return Promise.resolve('downloaded');
 }
 function openClose(){
  const from=yearStart(),to=from+1,list=rows();
  const d=document.createElement('dialog');d.className='ui-dialog sy-close';
  d.innerHTML=`<h2>Schuljahr ${yearLabel(from)} abschließen</h2><ol class="sy-steps"><li>Das gesamte Schuljahr wird als Archivdatei gespeichert.</li><li>Danach werden Noten, Hausaufgaben, Abwesenheiten und Sitzplan-Verläufe aus der App entfernt.</li><li>Die angehakten Klassen gehen ohne Noten ins Schuljahr ${yearLabel(to)} über (Schülerliste, Sitzplan und Räume bleiben).</li></ol>
  <div class="sy-table-wrap"><table class="sy-table"><thead><tr><th>Übernehmen</th><th>Bisher</th><th>Neu</th></tr></thead><tbody>${list.map((r,i)=>`<tr><td><input type="checkbox" checked data-i="${i}" aria-label="${esc(r.label)} übernehmen"></td><td>${esc(r.label)}</td><td><input type="text" value="${esc(next(r.label))}" data-n="${i}" aria-label="Neue Bezeichnung für ${esc(r.label)}" autocomplete="off"></td></tr>`).join('')}</tbody></table></div>
  <label class="sy-pw-opt"><input type="checkbox" data-pw> Archiv mit Passwort schützen <small>(ohne Passwort ist das Archiv nicht mehr lesbar)</small></label>
  <div class="ui-dialog-actions"><button type="button" data-c>Abbrechen</button><button type="button" class="ui-primary" data-o>Archiv speichern …</button></div>`;
  document.body.append(d);d.showModal();
  d.querySelector('tbody').addEventListener('change',e=>{const c=e.target.closest('[data-i]');if(c){const n=d.querySelector(`[data-n="${c.dataset.i}"]`);n.disabled=!c.checked}});
  const done=()=>{d.close();d.remove()};d.querySelector('[data-c]').onclick=done;d.addEventListener('cancel',e=>{e.preventDefault();done()});
  d.querySelector('[data-o]').onclick=async()=>{
   const keep=list.map((r,i)=>({r,on:d.querySelector(`[data-i="${i}"]`).checked,label:d.querySelector(`[data-n="${i}"]`).value.trim()||r.label}));
   let password=null;if(d.querySelector('[data-pw]').checked){password=await askPassword('Passwort für das Archiv festlegen. Ohne dieses Passwort lässt sich das Archiv nicht mehr öffnen – bitte gut aufbewahren.',true);if(password===null)return}
   const btn=d.querySelector('[data-o]');btn.disabled=true;btn.textContent='Archiv wird erstellt …';
   try{
    const backup=await classroomBackupData();backup.archive={schoolYear:yearLabel(from),closedAt:new Date().toISOString()};
    const text=JSON.stringify(backup),name=`Classroom-Manager-Archiv-Schuljahr-${from}-${String(to).slice(2)}.json`;
    const how=await saveFile(name,password?await encrypt(text,password,{schoolYear:yearLabel(from),createdAt:backup.createdAt}):text);
    done();
    const ok=await classroomConfirm(`Das Archiv „${name}“ wurde ${how==='saved'?'gespeichert':how==='shared'?'geteilt':'als Download gespeichert'}.\n\nBitte prüfe, dass die Datei vorhanden ist${how==='downloaded'?' (Ordner „Downloads“)':''}. Erst danach abschließen: Noten, Hausaufgaben, Abwesenheiten und Sitzplan-Verläufe werden aus der App entfernt.\n\nJetzt Schuljahr ${yearLabel(from)} abschließen und mit ${yearLabel(to)} beginnen?`,{ok:'Abschließen',danger:true});
    if(!ok)return;
    await finish(keep,to);
   }catch(error){if(error?.name==='AbortError'){btn.disabled=false;btn.textContent='Archiv speichern …';return}done();await classroomAlert('Das Schuljahr konnte nicht abgeschlossen werden: '+error.message+'\n\nEs wurde nichts gelöscht.')}
  };
 }
 async function finish(keep,to){
  const keepNoten={},dropNoten=[],keepModel=new Map(),dropModel=new Set();
  for(const {r,on,label} of keep){for(const k of r.keys){if(on)keepNoten[k]=label;else dropNoten.push(k)}if(r.modelId){if(on)keepModel.set(r.modelId,label);else dropModel.add(r.modelId)}}
  classroomRestoring=true;
  try{
   await classroomEnsureSeats();
   const seats=(await classroomCall(classroomSeats,'classroom:backup-request')).values||{};
   await classroomCall(classroomNotes,'classroom:new-school-year',{plan:{keep:keepNoten,drop:dropNoten}});
   // Sitzplan: Pläne behalten, Verläufe und Datumsbezüge entfernen, abgegebene Klassen löschen.
   const out={};
   for(const [k,v] of Object.entries(seats)){
    const m=/^sitzplan_NM:(class-[0-9a-f-]+)_/.exec(k);if(m&&dropModel.has(m[1]))continue;out[k]=v;
   }
   out['sitzplan_dated_layouts_v1']='{}';out['sitzplan_selected_versions_v1']='{}';
   try{const rooms=JSON.parse(out['sitzplan_rooms_v1']||'{}');for(const [ck,entry] of Object.entries(rooms)){const id=/^NM:(class-[0-9a-f-]+)$/.exec(ck)?.[1];if(id&&dropModel.has(id)){delete rooms[ck];continue}if(entry&&typeof entry==='object')entry.usedByDate={}}out['sitzplan_rooms_v1']=JSON.stringify(rooms)}catch{}
   try{const list=JSON.parse(out['sitzplan_klassen_liste']||'[]').filter(n=>!dropModel.has(String(n).replace(/^NM:/,'')));out['sitzplan_klassen_liste']=JSON.stringify(list);if(dropModel.has(String(out['sitzplan_aktuelle_klasse']||'').replace(/^NM:/,'')))out['sitzplan_aktuelle_klasse']=list[0]||''}catch{}
   await classroomCall(classroomSeats,'classroom:restore',{values:out});
   // Gemeinsame Klassenlisten
   const model=classroomModel;model.classes=(model.classes||[]).filter(c=>!dropModel.has(c.id));
   for(const c of model.classes){if(keepModel.has(c.id))c.name=keepModel.get(c.id);c.attendance={};c.students=(c.students||[]).filter(s=>!s.deleted)}
   for(const [k,v] of Object.entries(model.sourceClasses||{}))if(dropModel.has(v)||dropNoten.includes(k))delete model.sourceClasses[k];
   for(const k of Object.keys(model.studentAliases||{}))if(dropNoten.some(d=>k.startsWith(d.replace('::','::')+'::')))delete model.studentAliases[k];
   for(const k of Object.keys(model.sourceClassLabels||{}))if(dropNoten.includes(k))delete model.sourceClassLabels[k];
   classroomModel=model;classroomPersist();
   localStorage.setItem(YEAR_KEY,String(to));
   window.classroomSyncReset?.();
   location.reload();
  }catch(error){classroomRestoring=false;throw error}
 }

 /* ---------- Archiv ansehen ---------- */
 const palette=['','#b8e9ce','#e0f2ce','#fffbb8','#ffedb8','#fbcbc7','#edb8b8'];
 const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.hidden=true;document.body.append(fileInput);
 function openArchive(){fileInput.value='';fileInput.click()}
 fileInput.onchange=async()=>{
  const file=fileInput.files[0];if(!file)return;
  try{
   let data;try{data=JSON.parse(await file.text())}catch{throw Error('Die Datei ist kein Archiv des Classroom-Managers.')}
   data=await window.classroomMaybeDecrypt(data);
   if(data?.format!=='classroom-manager-backup'||!data.notes)throw Error('Die Datei ist kein Archiv bzw. Backup des Classroom-Managers.');
   const {sheets}=await classroomCall(classroomNotes,'classroom:archive-sheets',{values:data.notes});
   showArchive(data,sheets||[],file.name);
  }catch(error){if(!/Abgebrochen/.test(error.message))await classroomAlert('Das Archiv konnte nicht geöffnet werden: '+error.message)}
 };
 function cellHtml(c,tag='td'){const n=typeof c.grade==='number'?Math.max(1,Math.min(6,c.grade)):null,lo=n&&Math.floor(n),hi=n&&Math.ceil(n);const bg=c.grade==='missing'?'#e5484d':n?(lo===hi?palette[lo]:`repeating-linear-gradient(135deg,${palette[lo]} 0 6px,${palette[hi]} 6px 12px)`):'';const v=typeof c.v==='number'?c.v.toLocaleString('de-DE',{maximumFractionDigits:2}):c.v;return `<${tag} class="${c.summary?'sy-sum':''}" style="${bg?'background:'+bg+';':''}${c.grade==='missing'?'color:#fff;':''}">${esc(v??'')}</${tag}>`}
 function showArchive(data,sheets,fileName){
  const year=data.archive?.schoolYear||'',d=document.createElement('dialog');d.className='sy-archive';
  d.innerHTML=`<div class="sy-a-head"><div><h2>Archiv${year?' · Schuljahr '+esc(year):''}</h2><p>Nur lesen · ${esc(fileName)} · die aktuellen Daten bleiben unverändert</p></div><div class="sy-a-actions"><input type="search" placeholder="Person suchen …" aria-label="Person suchen" autocomplete="off"><button type="button" data-p>Drucken</button><button type="button" data-x>Schließen</button></div></div><div class="sy-a-body"><nav></nav><section tabindex="-1"></section></div>`;
  document.body.append(d);d.showModal();
  const nav=d.querySelector('nav'),view=d.querySelector('section'),search=d.querySelector('input');let current=0;
  nav.innerHTML=sheets.length?sheets.map((s,i)=>`<button type="button" data-s="${i}"><strong>${esc(s.name)}</strong><small>${esc(s.subjectLabel)}</small></button>`).join(''):'<p>Keine Bewertungen im Archiv.</p>';
  function render(){
   const s=sheets[current];if(!s){view.innerHTML='';return}const q=search.value.trim().toLocaleLowerCase('de');
   for(const b of nav.querySelectorAll('button'))b.setAttribute('aria-current',String(Number(b.dataset.s)===current));
   let html=`<h3>${esc(s.label||s.name)} · ${esc(s.subjectLabel)}</h3>`,open=false;
   for(const row of s.rows){
    if(row.kind==='title'){if(open)html+='</tbody></table></div>';html+=`<h4>${esc(row.cells[0]?.v)}</h4><div class="sy-a-table"><table>`;open=true}
    else if(row.kind==='header')html+='<thead><tr>'+row.cells.map(c=>`<th class="${c.summary?'sy-sum':''}">${esc(c.v)}</th>`).join('')+'</tr></thead><tbody>';
    else if(row.kind==='data'){if(q&&!String(row.cells[0]?.v||'').toLocaleLowerCase('de').includes(q))continue;html+='<tr>'+row.cells.map((c,i)=>i?cellHtml(c):`<th scope="row">${esc(c.v)}</th>`).join('')+'</tr>'}
   }
   if(open)html+='</tbody></table></div>';view.innerHTML=html;
  }
  nav.onclick=e=>{const b=e.target.closest('[data-s]');if(b){current=Number(b.dataset.s);render()}};
  search.oninput=render;
  const done=()=>{d.close();d.remove()};d.querySelector('[data-x]').onclick=done;d.addEventListener('cancel',e=>{if(document.activeElement===search&&search.value){e.preventDefault();search.value='';render();return}e.preventDefault();done()});
  d.querySelector('[data-p]').onclick=()=>{const w=window.open('','_blank');if(!w)return;w.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Archiv ${esc(year)}</title><style>body{font:11px/1.35 -apple-system,system-ui,sans-serif;margin:10mm;color:#24334b}table{border-collapse:collapse;margin-bottom:10px}td,th{border:1px solid #d6dfed;padding:3px 5px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}th[scope=row]{text-align:left;white-space:nowrap}h4{margin:12px 0 4px}.sy-a-table{break-inside:avoid}</style></head><body>${view.innerHTML}</body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print()},250)};
  render();
 }

 const style=document.createElement('style');style.textContent=
  '.sy-trigger{cursor:pointer;border-radius:8px;padding:3px 8px!important;transition:background .15s}.sy-trigger:hover,.sy-trigger:focus-visible{background:#eef3fb;outline:none;color:var(--primary,#2f5f9b)}'
  +'.sy-menu{position:fixed;z-index:1000;min-width:290px;padding:6px;background:#fff;border:1px solid #dce3ef;border-radius:12px;box-shadow:0 12px 30px #1c2b4626;font:15px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}'
  +'.sy-menu-head{padding:6px 12px 4px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#66758a}'
  +'.sy-menu button{display:block;width:100%;padding:9px 12px;border:0;border-radius:8px;background:none;text-align:left;color:var(--primary,#2f5f9b);font:inherit;font-size:14px;cursor:pointer}.sy-menu button:hover,.sy-menu button:focus-visible{background:#f3f6fb;outline:none}.sy-menu .sy-danger{color:#b42318}'
  +'.sy-close{width:min(620px,calc(100vw - 24px))}.sy-steps{margin:0 0 12px;padding-left:20px;color:#4a5b73;font-size:.92rem}.sy-table-wrap{max-height:46vh;overflow:auto;border:1px solid #e6ebf3;border-radius:10px}'
  +'.sy-table{width:100%;border-collapse:collapse;font-size:.92rem}.sy-table th,.sy-table td{padding:6px 10px;border-top:1px solid #e6ebf3;text-align:left}.sy-table thead th{position:sticky;top:0;background:#f8fafd;border-top:0;color:#66758a;font-size:.8rem}'
  +'.ui-dialog .sy-table input[type=text]{width:120px;min-height:30px;margin:0;padding:3px 8px}.ui-dialog .sy-table input[type=checkbox]{width:16px;height:16px;min-height:0;margin:0}'
  +'.sy-pw-opt{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:.92rem}.ui-dialog .sy-pw-opt input{width:16px;height:16px;min-height:0;margin:0}.sy-pw-opt small{color:#66758a}'
  +'.sy-pw input{margin-top:10px!important}.sy-pw-err{margin:8px 0 0;color:#b42318;font-size:.86rem}.sy-pw-err:empty{display:none}'
  +'.sy-archive{width:min(1200px,calc(100vw - 24px));height:min(880px,calc(100dvh - 32px));padding:0;border:1px solid #dce3ef;border-radius:18px;background:#f6f8fc;color:#24334b;box-shadow:0 18px 60px #1c2b4630;font:14px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}.sy-archive[open]{display:flex;flex-direction:column}.sy-archive::backdrop{background:#1c2b4638}'
  +'.sy-a-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#fff;border-bottom:1px solid #dce3ef}.sy-a-head h2{margin:0;font-size:1.1rem}.sy-a-head p{margin:2px 0 0;font-size:.8rem;color:#66758a}.sy-a-actions{display:flex;gap:8px;align-items:center}'
  +'.sy-a-actions input{min-height:34px;padding:4px 10px;border:1px solid #cbd6e5;border-radius:9px;font:inherit}.sy-a-actions button{min-height:34px;padding:5px 14px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:var(--primary,#2f5f9b);font:inherit;cursor:pointer}'
  +'.sy-a-body{flex:1;min-height:0;display:grid;grid-template-columns:220px minmax(0,1fr)}.sy-a-body nav{overflow:auto;padding:10px;background:#fff;border-right:1px solid #dce3ef}.sy-a-body nav button{display:flex;flex-direction:column;align-items:flex-start;width:100%;padding:7px 10px;border:0;border-radius:8px;background:none;text-align:left;font:inherit;color:#24334b;cursor:pointer}.sy-a-body nav button small{color:#66758a}.sy-a-body nav button[aria-current=true]{background:#e8f0fb}'
  +'.sy-a-body section{overflow:auto;padding:14px 18px}.sy-a-body h3{margin:0 0 6px}.sy-a-body h4{margin:16px 0 6px;color:#315f99;font-size:.9rem}.sy-a-table{overflow:auto;border:1px solid #dce3ef;border-radius:10px;background:#fff}'
  +'.sy-a-table table{border-collapse:collapse;font-size:12.5px}.sy-a-table th,.sy-a-table td{padding:4px 7px;border:1px solid #e6ebf3;text-align:center;white-space:nowrap}.sy-a-table thead th{background:#f8fafd;font-weight:600;color:#4a5b73;font-size:11.5px}.sy-a-table th[scope=row]{position:sticky;left:0;background:#fff;text-align:left;font-weight:500}.sy-a-table .sy-sum{font-weight:700}';
 document.head.append(style);
})();
;

/* ==== backup-crypto.js ==== */
/* 8.90: Verschlüsselte Backups (Backup-Fenster → „Verschlüsselung“).
   Ein zufälliger Backup-Schlüssel (AES-256-GCM) verschlüsselt jede Backup-Datei. In jeder Datei steckt dieser Schlüssel zweimal,
   selbst verschlüsselt: mit dem Notfall-Passwort (PBKDF2) und – falls eingerichtet – mit Touch ID / Face ID (Passkey, WebAuthn-PRF).
   Speichern braucht keine Bestätigung (der Schlüssel liegt nur auf diesem Gerät, in IndexedDB); Wiederherstellen verlangt
   automatisch Touch ID, bei Fehlschlag/Abbruch das Notfall-Passwort. Ein Gerät ohne eigene Einrichtung übernimmt die Verschlüsselung
   beim ersten erfolgreichen Öffnen. Excel-Dateien lassen sich nicht verschlüsseln. */
(()=>{
 const FORMAT='classroom-manager-encrypted',enc=new TextEncoder(),dec=new TextDecoder();
 const b64=buf=>{let s='';const a=new Uint8Array(buf);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
 const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const canPasskey=()=>!!(window.PublicKeyCredential&&navigator.credentials&&window.isSecureContext&&location.protocol!=='file:');

 /* ---------- Speicher (IndexedDB, nicht im Backup enthalten) ---------- */
 const DB='classroom-manager-backup-crypto';
 const db=()=>new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 async function load(){try{const d=await db();try{return await new Promise((res,rej)=>{const r=d.transaction('kv').objectStore('kv').get('cfg');r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}finally{d.close()}}catch{return null}}
 async function save(cfg){const d=await db();try{await new Promise((res,rej)=>{const tx=d.transaction('kv','readwrite');cfg?tx.objectStore('kv').put(cfg,'cfg'):tx.objectStore('kv').delete('cfg');tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}finally{d.close()}cache=cfg;sync()}
 let cache=null;load().then(c=>{cache=c;sync()});

 /* ---------- Krypto ---------- */
 const aes=raw=>crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
 async function pwKey(password,salt){const base=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:250000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
 async function seal(key,bytes){const iv=rnd(12);return {iv:b64(iv),data:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes))}}
 async function open(key,box){return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(box.iv)},key,unb64(box.data)))}
 async function wrapPw(master,password){const salt=rnd(16);return {salt:b64(salt),...await seal(await pwKey(password,salt),master)}}

 /* ---------- Touch ID / Face ID (Passkey mit PRF) ---------- */
 async function prfGet(credId,salt){
  const cred=await navigator.credentials.get({publicKey:{challenge:rnd(32),allowCredentials:[{type:'public-key',id:unb64(credId)}],userVerification:'required',timeout:60000,extensions:{prf:{eval:{first:unb64(salt)}}}}});
  const out=cred?.getClientExtensionResults?.()?.prf?.results?.first;if(!out)throw Object.assign(new Error('Dieses Gerät unterstützt die Verschlüsselung mit Touch ID nicht.'),{name:'NoPrf'});
  return aes(new Uint8Array(out))}
 async function prfCreate(){
  const cred=await navigator.credentials.create({publicKey:{rp:{name:'Classroom-Manager'},user:{id:rnd(16),name:'Classroom-Manager Backup',displayName:'Classroom-Manager Backup'},challenge:rnd(32),
   pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{residentKey:'required',userVerification:'required'},timeout:60000,extensions:{prf:{}}}});
  const ext=cred?.getClientExtensionResults?.()?.prf;if(ext&&ext.enabled===false)throw Object.assign(new Error('Touch ID kann hier nicht für die Verschlüsselung genutzt werden.'),{name:'NoPrf'});
  return b64(cred.rawId)}

 /* ---------- Dialoge ---------- */
 function dialog(html){const d=document.createElement('dialog');d.className='ui-dialog bc-dlg';d.innerHTML=html;document.body.append(d);d.showModal();return d}
 function askPassword(text,twice){return new Promise(resolve=>{
  const d=dialog(`<p class="ui-dialog-text">${esc(text)}</p><input type="password" autocomplete="${twice?'new-password':'current-password'}" placeholder="${twice?'Notfall-Passwort':'Passwort'}" aria-label="Passwort">${twice?'<input type="password" autocomplete="new-password" placeholder="Wiederholen" aria-label="Passwort wiederholen">':''}<p class="bc-err" role="alert"></p><div class="ui-dialog-actions"><button type="button" data-c>Abbrechen</button><button type="button" class="primary" data-o>OK</button></div>`);
  const [a,b]=d.querySelectorAll('input'),err=d.querySelector('.bc-err');a.focus();const done=v=>{d.close();d.remove();resolve(v)};
  const ok=()=>{if(!a.value){err.textContent='Bitte ein Passwort eingeben.';return}if(b&&a.value!==b.value){err.textContent='Die Passwörter stimmen nicht überein.';return}if(b&&a.value.length<6){err.textContent='Bitte mindestens 6 Zeichen verwenden.';return}done(a.value)};
  d.querySelector('[data-o]').onclick=ok;d.querySelector('[data-c]').onclick=()=>done(null);d.addEventListener('cancel',e=>{e.preventDefault();done(null)});d.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok()}})})}
 /* Touch-ID-Schritt mit Knopf (falls der Browser die Abfrage nur direkt nach einem Tipp erlaubt) */
 function touchButton(title,text){return new Promise(resolve=>{
  const d=dialog(`<div class="bc-center"><div class="bc-lock">🔒</div><p class="bc-title">${esc(title)}</p><p class="bc-sub">${esc(text)}</p><button type="button" class="primary bc-wide" data-t>Mit Touch ID öffnen</button><button type="button" class="bc-wide bc-alt" data-p>Notfall-Passwort eingeben</button><button type="button" class="bc-link" data-c>Abbrechen</button></div>`);
  const done=v=>{d.close();d.remove();resolve(v)};d.querySelector('[data-t]').onclick=()=>done('touch');d.querySelector('[data-p]').onclick=()=>done('pw');d.querySelector('[data-c]').onclick=()=>done(null);d.addEventListener('cancel',e=>{e.preventDefault();done(null)})})}

 /* ---------- Verschlüsseln beim Speichern ---------- */
 window.classroomBackupEncryptionOn=()=>!!(cache?.on&&cache.master);
 window.classroomBackupText=async(data,pretty=true)=>{
  const text=JSON.stringify(data,null,pretty?2:0);if(!window.classroomBackupEncryptionOn())return text;
  const body=await seal(await aes(unb64(cache.master)),enc.encode(text));
  return JSON.stringify({format:FORMAT,version:2,createdAt:data.createdAt||new Date().toISOString(),keyId:cache.keyId,wraps:{pw:cache.pwWrap,...(cache.prf?{prf:cache.prf}:{})},...body},null,1)};

 /* ---------- Entschlüsseln beim Wiederherstellen ---------- */
 const stamp=iso=>{const d=new Date(iso||'');return isNaN(d)?'':d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})};
 async function unlock(obj){
  const title='Verschlüsseltes Backup'+(stamp(obj.createdAt)?' vom '+stamp(obj.createdAt):''),prf=obj.wraps?.prf;
  const viaPrf=async()=>open(await prfGet(prf.credId,prf.salt),prf.wrap);
  if(prf&&canPasskey()){
   const t0=performance.now();
   try{return {master:await viaPrf(),how:'touch'}}catch(e){
    /* sofortige Ablehnung = keine Abfrage angezeigt (Browser verlangt einen Tipp) → Knopf; sonst Abbruch/Fehlschlag → Passwort */
    if(e?.name==='NotAllowedError'&&performance.now()-t0<600){const c=await touchButton(title,'Zum Öffnen Touch ID verwenden.');if(c===null)throw Error('Abgebrochen.');if(c==='touch'){try{return {master:await viaPrf(),how:'touch'}}catch{}}}
   }}
  for(;;){const pw=await askPassword(title+(prf&&canPasskey()?' – Touch ID hat nicht geklappt. Bitte das Notfall-Passwort eingeben.':' – bitte das Notfall-Passwort eingeben.'),false);if(pw===null)throw Error('Abgebrochen – kein Passwort eingegeben.');
   try{return {master:await open(await pwKey(pw,unb64(obj.wraps.pw.salt)),obj.wraps.pw),how:'pw'}}catch{await (window.classroomAlert||alert)('Das Passwort ist falsch.')}}}
 const previous=window.classroomMaybeDecrypt;
 window.classroomMaybeDecrypt=async obj=>{
  if(obj?.format!==FORMAT||obj.version!==2)return previous?previous(obj):obj;
  const {master}=await unlock(obj);const text=dec.decode(await open(await aes(master),obj));
  /* Gerät ohne eigene Einrichtung übernimmt die Verschlüsselung (gleicher Schlüssel, gleiches Touch ID, gleiches Notfall-Passwort) */
  if(!cache?.master){try{await save({on:true,master:b64(master),keyId:obj.keyId,pwWrap:obj.wraps.pw,prf:obj.wraps.prf||null,adopted:new Date().toISOString()})}catch{}}
  return JSON.parse(text)};

 /* ---------- Einrichten / Ändern ---------- */
 async function setup(){
  let master=cache?.master?unb64(cache.master):rnd(32);
  if(!cache?.pwWrap){const pw=await askPassword('Notfall-Passwort festlegen. Es öffnet deine verschlüsselten Backups, wenn Touch ID nicht verfügbar ist (z. B. auf einem anderen Gerät). Gut aufbewahren – ohne Touch ID und ohne dieses Passwort lässt sich ein Backup nicht mehr öffnen.',true);if(pw===null)return false;
   cache={...(cache||{}),master:b64(master),keyId:b64(rnd(8)),pwWrap:await wrapPw(master,pw)}}
  let prf=cache.prf||null;
  if(!prf&&canPasskey()){
   try{const credId=await prfCreate(),salt=b64(rnd(32));let key;
    try{key=await prfGet(credId,salt)}catch(e){if(e?.name==='NoPrf')throw e;const c=await touchButton('Touch ID bestätigen','Einmal bestätigen, damit Touch ID deine Backups öffnen kann.');if(c!=='touch')throw e;key=await prfGet(credId,salt)}
    prf={credId,salt,wrap:await seal(key,master)}}
   catch(e){await (window.classroomAlert||alert)((e?.name==='NoPrf'?e.message:'Touch ID wurde nicht eingerichtet.')+' Die Backups werden trotzdem verschlüsselt und lassen sich mit dem Notfall-Passwort öffnen.')}}
  await save({...cache,on:true,prf});return true}
 async function changePw(){if(!cache?.master)return;const pw=await askPassword('Neues Notfall-Passwort. Es gilt für alle künftigen Backups; ältere Backups öffnen weiterhin mit dem alten Passwort (oder Touch ID).',true);if(pw===null)return;await save({...cache,pwWrap:await wrapPw(unb64(cache.master),pw)})}
 async function redoTouch(){if(!cache?.master)return;const c={...cache,prf:null};cache=c;await setup()}

 /* ---------- Bereich im Backup-Fenster ---------- */
 const dlg=document.querySelector('.classroom-backup-dialog'),acc=dlg?.querySelector('.bk-acc');
 let sec,head,body,box,info;
 if(dlg&&acc){
  sec=document.createElement('section');sec.className='bk-sec';sec.dataset.section='crypt';
  head=document.createElement('button');head.type='button';head.className='bk-head';head.setAttribute('aria-expanded','false');head.innerHTML='<span class="bk-chev" aria-hidden="true">›</span><span class="bk-title">Verschlüsselung</span><span class="bk-status"></span>';
  body=document.createElement('div');body.className='bk-body';body.hidden=true;
  body.innerHTML='<label class="bc-switch"><input type="checkbox"> <span>Backups verschlüsseln</span></label><p class="bc-help">Backup-Dateien (auch die automatische Sicherung) sind nur mit Touch ID oder deinem Notfall-Passwort lesbar. Auf deinen Geräten mit demselben iCloud-Schlüsselbund reicht Touch ID. Excel-Dateien lassen sich nicht verschlüsseln.</p><div class="bc-info"></div><p class="bc-warn">Notfall-Passwort gut aufbewahren: Ohne Touch ID und ohne dieses Passwort lässt sich ein verschlüsseltes Backup nicht mehr öffnen.</p>';
  sec.append(head,body);acc.prepend(sec);
  /* 11.44: Schulbuchmaterial mitsichern – eigener Abschnitt */
  {const ms=document.createElement('section');ms.className='bk-sec';ms.dataset.section='mat';const mh=document.createElement('button');mh.type='button';mh.className='bk-head';mh.setAttribute('aria-expanded','false');mh.innerHTML='<span class="bk-chev" aria-hidden="true">›</span><span class="bk-title">Schulbuchmaterial</span><span class="bk-status"></span>';
   const mb=document.createElement('div');mb.className='bk-body';mb.hidden=true;mb.innerHTML='<label class="bc-switch"><input type="checkbox"> <span>Schulbuchmaterial mitsichern</span></label><p class="bc-help" data-mh>Reihen, Lerneinheiten, Lernpakete, Lateinarbeiten, Texte des Übersetzungs-Trainers und das Inhaltsverzeichnis kommen mit ins Backup. Nur für den eigenen Unterricht – das Backup nicht weitergeben.</p><div class="bk-rbox" data-rbox hidden></div>';
   ms.append(mh,mb);acc.append(ms);const mx=mb.querySelector('input'),MK='classroom-backup-material-v1';/* 11.60: welche Reihen nur auf diesem Gerät liegen – und wie groß das Material ist */
   const esc2=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),SJ={erdkunde:'Erdkunde',geschichte:'Geschichte',latein:'Latein'};
   const rinfo=()=>new Promise(res=>{try{const r=indexedDB.open('cm-lerneinheiten',1);r.onupgradeneeded=()=>r.result.createObjectStore('u');r.onerror=()=>res({R:[],n:0});r.onsuccess=()=>{const db=r.result,R=[];let n=0;const tx=db.transaction('u','readonly'),c=tx.objectStore('u').openCursor();c.onsuccess=()=>{const x=c.result;if(!x)return;const v=x.value;try{n+=JSON.stringify(v).length}catch{}if(typeof x.key==='string'&&x.key.startsWith('reihe:')&&v)R.push(v);x.continue()};tx.oncomplete=()=>{db.close();res({R,n})};tx.onerror=()=>{db.close();res({R,n})}}}catch{res({R:[],n:0})}});
   const msync=async()=>{let on=false;try{on=localStorage.getItem(MK)==='1'}catch{}mx.checked=on;const st=mh.querySelector('.bk-status');st.textContent=on?'An':'Aus';st.style.color='';st.style.fontWeight='';
    const {R,n}=await rinfo(),box=mb.querySelector('[data-rbox]'),mbs=Math.max(1,Math.round(n/1048576));R.sort((a,b)=>String(a.subject).localeCompare(String(b.subject))||(+b.jg||0)-(+a.jg||0)||(+a.n||0)-(+b.n||0));
    mb.querySelector('[data-mh]').textContent=(on?'Reihen, Lerneinheiten, Lernpakete, Lateinarbeiten, Texte und Inhaltsverzeichnis sind im Backup':'Mit dem Schalter kommen Reihen, Lerneinheiten, Lernpakete, Lateinarbeiten, Texte und Inhaltsverzeichnis ins Backup')+(n?' (zurzeit ca. '+mbs+' MB'+(on?' zusätzlich':'')+').':'.')+' Nur für den eigenen Unterricht – das Backup nicht weitergeben.';
    if(!R.length){box.hidden=true;return}const nm=r=>(SJ[r.subject]||r.subject)+(r.subject==='latein'?'':' '+r.jg)+' · '+(r.lab?r.lab+' ':'')+r.title;
    if(on){st.textContent='An · '+R.length+' Reihe'+(R.length>1?'n':'');st.style.color='#1f6f43';st.style.fontWeight='650';box.className='bk-rbox ok';box.innerHTML='✓ '+(R.length>1?'Alle '+R.length+' Reihen werden':'Die Reihe wird')+' mitgesichert. Nach dem Wiederherstellen ist alles da, ohne neu zu laden.'}
    else{st.textContent='Aus · '+R.length+' Reihe'+(R.length>1?'n fehlen':' fehlt');st.style.color='#b26a12';st.style.fontWeight='650';box.className='bk-rbox';
     box.innerHTML='<b>'+(R.length>1?'Diese Reihen sind':'Diese Reihe ist')+' nur auf diesem Gerät:</b><ul>'+R.slice(0,5).map(r=>'<li>'+esc2(nm(r))+'</li>').join('')+(R.length>5?'<li>… und '+(R.length-5)+' weitere</li>':'')+'</ul>Bewahre die .cmreihe-Dateien gut auf (z. B. iCloud Drive). Deine Änderungen an den Reihen und alle Noten sind im Backup – nach dem Wiederherstellen einfach die Dateien neu laden.'}
    box.hidden=false};msync();try{new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting))msync()}).observe(mh)}catch{}
   if(!document.getElementById('bk-rbox-css')){const c=document.createElement('style');c.id='bk-rbox-css';c.textContent='.bk-rbox{border:1px solid #f2c98a;background:#fff8ec;border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.45;color:#7a4b00;margin-top:8px}.bk-rbox ul{margin:6px 0 4px;padding-left:18px;color:#5b4a2c}.bk-rbox li{margin:2px 0}.bk-rbox.ok{border-color:#9fd3b4;background:#eef8f1;color:#1f6f43}';document.head.append(c)}
   mx.onchange=()=>{try{localStorage.setItem(MK,mx.checked?'1':'0')}catch{}msync()};
   mh.onclick=()=>{const openNow=mb.hidden;if(openNow)msync();for(const s2 of acc.querySelectorAll('.bk-sec')){const b2=s2.querySelector('.bk-body'),h2=s2.querySelector('.bk-head');if(b2){b2.hidden=true;h2?.setAttribute('aria-expanded','false')}}mb.hidden=!openNow;mh.setAttribute('aria-expanded',String(openNow))};
   acc.addEventListener('click',e=>{const h2=e.target.closest('.bk-head');if(h2&&h2!==mh){mb.hidden=true;mh.setAttribute('aria-expanded','false')}},true)}
  /* 8.92: Reihenfolge: Speicherort · Automatische Sicherung · Verschlüsselung · Speicher · Daten prüfen */
  for(const id of ['loc','auto','crypt','mat','store','check']){const x=acc.querySelector(':scope>[data-section="'+id+'"]');if(x)acc.append(x)}
  for(const x of acc.querySelectorAll(':scope>.bk-sec:not([data-section])'))acc.append(x);box=body.querySelector('input');info=body.querySelector('.bc-info');
  head.onclick=()=>{const openNow=body.hidden;for(const s of acc.querySelectorAll('.bk-sec')){const b=s.querySelector('.bk-body'),h=s.querySelector('.bk-head');if(b){b.hidden=true;h?.setAttribute('aria-expanded','false')}}body.hidden=!openNow;head.setAttribute('aria-expanded',String(openNow))};
  acc.addEventListener('click',e=>{const h=e.target.closest('.bk-head');if(h&&h!==head){body.hidden=true;head.setAttribute('aria-expanded','false')}},true);
  box.onchange=async()=>{if(box.checked){box.disabled=true;try{if(!await setup())box.checked=false}catch(e){box.checked=false;await (window.classroomAlert||alert)('Verschlüsselung konnte nicht eingerichtet werden: '+e.message)}finally{box.disabled=false;sync()}}else{await save({...(cache||{}),on:false})}};
  info.addEventListener('click',async e=>{const b=e.target.closest('[data-bc]');if(!b)return;if(b.dataset.bc==='pw')await changePw();else await redoTouch()});
 }
 function sync(){
  const on=window.classroomBackupEncryptionOn();
  if(head){const st=head.querySelector('.bk-status');st.textContent=on?'🔒 An'+(cache?.prf?' · Touch ID':' · Passwort'):'Aus';st.classList.toggle('bc-on',on)}
  if(box)box.checked=on;
  if(info)info.innerHTML=on?`<div>${cache.prf?'✓ Touch ID eingerichtet <span class="bc-dim">(iCloud-Schlüsselbund)</span>':'– Touch ID nicht eingerichtet'+(canPasskey()?' <button type="button" class="bc-mini" data-bc="touch">Einrichten</button>':' <span class="bc-dim">(nur in der installierten App bzw. im Browser möglich)</span>')}</div><div>✓ Notfall-Passwort festgelegt <button type="button" class="bc-mini" data-bc="pw">Ändern</button></div>`:'';
  /* Excel sperren, solange verschlüsselt wird */
  const x=dlg?.querySelector('input[name=classroomBackupFormat][value=xlsx]');if(x){x.disabled=on;const lab=x.closest('label');lab?.classList.toggle('bc-xdis',on);if(on&&x.checked){const j=dlg.querySelector('input[name=classroomBackupFormat][value=json]');if(j)j.checked=true}}
 }
 const st=document.createElement('style');st.textContent='.bc-switch{display:flex;align-items:center;gap:10px;font-weight:600;cursor:pointer}.bc-switch input{width:20px;height:20px;margin:0}.bc-help{margin:6px 0 10px;font-size:.86rem;color:#5b6b82}.bc-info{display:flex;flex-direction:column;gap:6px;font-size:.9rem}.bc-info:empty{display:none}.bc-dim{color:#66758a}.bc-mini{margin-left:8px;padding:2px 12px!important;min-height:0!important;border:1px solid #dce3ef!important;border-radius:999px!important;background:#fff!important;color:#2f5f9b!important;font:inherit!important;font-size:.82rem!important;cursor:pointer}.bc-warn{margin:10px 0 0;padding:8px 12px;border-radius:10px;background:#fff7e8;color:#8a5a12;font-size:.82rem}.bk-status.bc-on{color:#2f7a3f}.bc-xdis{opacity:.45;pointer-events:none}.bc-dlg input[type=password]{display:block;width:100%;box-sizing:border-box;margin:8px 0 0;padding:10px 12px;border:1px solid #cbd6e5;border-radius:10px;font:inherit}.bc-err{min-height:1.2em;margin:6px 0 0;color:#a33127;font-size:.85rem}.bc-center{text-align:center}.bc-lock{font-size:40px}.bc-title{font-weight:700;font-size:1.05rem;margin:6px 0}.bc-sub{color:#5b6b82;margin:0 0 16px;font-size:.92rem}.bc-wide{display:block;width:100%;height:44px;border-radius:12px;font:inherit;font-weight:600;cursor:pointer}.bc-wide.primary{border:0;background:#2f5f9b;color:#fff}.bc-alt{margin-top:10px;border:1px solid #dce3ef;background:#fff;color:#2f5f9b}.bc-link{margin-top:8px;border:0;background:none;color:#66758a;font:inherit;font-size:.88rem;cursor:pointer}';document.head.append(st);
 window.classroomBackupCryptoDebug={load,save,setup,unlock,pwKey,aes,open,seal,b64,unb64};
})();
;

/* ==== timetable.js ==== */
/* Stundenplan: Zeiten einmal eintragen – die Klassen erkennt die App selbst aus den Eingaben (Bewertungen, Hausaufgaben,
   Abwesenheiten zum heutigen Datum, auch in der Pause direkt nach der Stunde). Ab zwei Wochen mit derselben Klasse in derselben
   Stunde gilt sie als erkannt. Eigene Einträge im Stundenplan haben immer Vorrang.
   Früher: einmal eintragen, wann welche Klasse in welchem Raum ist. Beim Öffnen der App (und nach längerer Pause)
   wählt die App während einer Stunde (ab 10 Minuten vorher) automatisch Fach, Klasse und Raum und zeigt den Unterrichts-Manager.
   Jede Stunde wird nur einmal automatisch gewählt – danach gilt die eigene Auswahl. Ein Hinweis bietet „Rückgängig“.
   Gespeichert unter notenrechner-stundenplan-v1 (damit in Backup und Geräte-Abgleich enthalten). Geöffnet über das Schuljahr-Menü. */
(()=>{
 const KEY='notenrechner-stundenplan-v1',APPLIED='classroom-timetable-applied-v1',DAYS=['Mo','Di','Mi','Do','Fr'];
 const defaults=[['08:00','08:45'],['08:50','09:35'],['09:55','10:40'],['10:45','11:30'],['11:45','12:30'],['12:35','13:20'],['13:30','14:15'],['14:20','15:05']];
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function load(){let t=null;try{t=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}if(!t||!Array.isArray(t.slots))t={slots:defaults.map(([start,end])=>({start,end})),days:{}};t.days=t.days||{};return t}
 const store=t=>{try{localStorage.setItem(KEY,JSON.stringify(t))}catch{}};
 /* ---------- A-/B-Wochen (9.00) ----------
    t.ab={on:true,anchors:[{start:'2026-08-31',week:'A'},…]}: ab dem Montag von start gilt week, danach abwechselnd.
    Eine Zelle im Wechsel: {ab:true,A:{ref,room}|null,B:{ref,room}|null}; jede Woche gleich: {ref,room} wie bisher. */
 const isoDay=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 const monday=x=>{const d=typeof x==='string'?new Date(x+'T12:00:00'):new Date(x.getFullYear(),x.getMonth(),x.getDate(),12);d.setDate(d.getDate()-((d.getDay()+6)%7));return d};
 function weekOf(t,date){
  if(!t?.ab?.on)return '';const list=(t.ab.anchors||[]).filter(a=>/^\d{4}-\d{2}-\d{2}$/.test(a?.start||'')).sort((a,b)=>a.start<b.start?-1:1);if(!list.length)return '';
  const m=monday(date),a=[...list].reverse().find(x=>monday(x.start)<=m)||list[0],n=Math.round((m-monday(a.start))/6048e5);
  return (Math.abs(n)%2===0)===(a.week!=='B')?'A':'B';
 }
 const resolveCell=(e,week)=>e?.ab?(e[week||'A']?.ref?{...e[week||'A'],week:week||''}:{ref:'',off:true}):e;
 /* ---------- Lernen aus den Eingaben ---------- */
 const LEARN='notenrechner-stundenplan-lernen-v1';
 // Gespeichert als Objekt (Schlüssel Datum|Stunde|Klasse), damit der Geräte-Abgleich Beobachtungen beider Geräte zusammenführt.
 const loadObs=()=>{try{const o=JSON.parse(localStorage.getItem(LEARN)||'{}');return Array.isArray(o)?o:Object.values(o||{})}catch{return []}};
 const dateStr=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 // Stunde zu einer Uhrzeit: während der Stunde oder in der Pause danach (bis zum Beginn der nächsten, nach der letzten 20 Minuten).
 function slotAt(t,minutes){for(let i=0;i<t.slots.length;i++){const a=mm(t.slots[i].start),b=mm(t.slots[i].end),n=i+1<t.slots.length?mm(t.slots[i+1].start):(b??0)+20;if(a===null||b===null)continue;if(minutes>=a-5&&minutes<(n??b+20))return i}return -1}
 function mm(s){const [h,m]=String(s||'').split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null}
 function currentRoom(ref){try{const doc=classroomSeats.contentWindow.document,sel=doc.getElementById('classroomRoomSelect');const model=classroomModel?.sourceClasses?.[ref];const g=classroomSeats.contentWindow.classroomCurrentGroup?.();if(sel&&g&&g.id===model)return sel.selectedOptions[0]?.textContent.trim()||''}catch{}return ''}
 function observe(refs,time){
  const d=new Date(time),w=d.getDay();if(w<1||w>5)return;const t=load(),slot=slotAt(t,d.getHours()*60+d.getMinutes());if(slot<0)return;
  const date=dateStr(d),obs=loadObs();let changed=false;
  for(const ref of refs){if(obs.some(o=>o.d===date&&o.s===slot&&o.ref===ref))continue;obs.push({d:date,w,s:slot,ref,room:currentRoom(ref)});changed=true}
  if(!changed)return;const cutoff=dateStr(new Date(Date.now()-84*864e5)),map={};for(const o of obs)if(o.d>=cutoff)map[o.d+'|'+o.s+'|'+o.ref]=o;try{localStorage.setItem(LEARN,JSON.stringify(map))}catch{}
 }
 // Erkannter Stundenplan: je Wochentag und Stunde die Klasse, die an mindestens zwei verschiedenen Tagen und mehrheitlich (≥ 60 %) vorkam.
 function learned(){
  const out={},groups={};for(const o of loadObs()){const k=o.w+':'+o.s;(groups[k]||=[]).push(o)}
  for(const [k,list] of Object.entries(groups)){const days=new Set(list.map(o=>o.d)),by={};for(const o of list){(by[o.ref]||=new Set()).add(o.d)}const [ref,set]=Object.entries(by).sort((a,b)=>b[1].size-a[1].size)[0]||[];if(!ref||set.size<2||set.size/days.size<.6)continue;const rooms={};for(const o of list)if(o.ref===ref&&o.room)rooms[o.room]=(rooms[o.room]||0)+1;const room=Object.entries(rooms).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';const [w,s]=k.split(':');(out[w]||={})[s]={ref,room,learned:true}}
  return out;
 }
 function plan(date=new Date()){const t=load(),l=learned(),week=weekOf(t,date),days={};for(const w of ['1','2','3','4','5']){days[w]={};const L=l[w]||{},M=t.days[w]||{};for(const i of t.slots.keys()){const m=resolveCell(M[i],week);if(m)days[w][i]=m.ref?m:null;else if(L[i])days[w][i]=L[i]}}return {slots:t.slots,days,week}}
 window.classroomTimetableFor=date=>plan(date||new Date());window.classroomTimetableWeek=date=>weekOf(load(),date||new Date());
 document.addEventListener('classroom-data-changed',e=>{
  try{
   const {paths,raw,time}=e.detail||{},today=dateStr(new Date(time||Date.now()));let states=null;const refs=new Set();
   for(const p of paths||[]){
    const seg=p.split('\x1f');
    if(seg[0]==='n:notenrechner-fachwahl-states-v1'&&/^\.(.+)::class::(.+)$/.test(seg[1]||'')){
     const m=/^\.(.+)::class::(.+)$/.exec(seg[1]),field=seg.find(x=>/^\.(grades|rawScores|statuses)$/.test(x));if(!field)continue;const taskId=seg[seg.indexOf(field)+1]?.slice(1),page=seg[3]?.slice(1);if(!taskId||!page)continue;
     states??=JSON.parse(raw['n:notenrechner-fachwahl-states-v1']||'{}');const pg=states[`${m[1]}::class::${m[2]}`]?.customValues?.[page];const task=[...(pg?.tasks||[]),...(pg?.assignments||[])].find(x=>x.id===taskId);
     if(task?.date===today)refs.add(m[1]+'::'+m[2]);
    }else if(seg[0]==='m:classroom-manager-common-v2'&&seg[1]==='.classes'&&seg[3]==='.attendance'&&seg[4]==='.'+today){
     const modelId=seg[2].slice(1),keys=Object.entries(classroomModel?.sourceClasses||{}).filter(([,v])=>v===modelId).map(([k])=>k);let active='';try{active=localStorage.getItem('notenrechner-aktives-fach-v1')||''}catch{}
     const k=keys.find(x=>x.startsWith(active+'::'))||keys[0];if(k)refs.add(k);
    }
   }
   if(refs.size)observe([...refs],time||Date.now());
  }catch(error){console.warn('Stundenplan: Lernen nicht möglich',error)}
 });

 function classOptions(){
  let classes={};try{classes=JSON.parse(localStorage.getItem('notenrechner-klassen-v1')||'{}')}catch{}
  let label=id=>id;try{const f=classroomNotes.contentWindow.classroomSubjectLabel;if(typeof f==='function')label=f}catch{}
  const out=[];for(const [subject,list] of Object.entries(classes))for(const c of list||[])out.push({ref:subject+'::'+c.id,label:label(subject)+' · '+String(c.label).replace(/^Klasse\s+/i,'')});
  return out.sort((a,b)=>a.label.localeCompare(b.label,'de',{numeric:true}));
 }
 /* Räume einer Klasse: die Sitzplan-Räume dieser Lerngruppe (wo sie Unterricht hat); ohne eigene Räume alle Räume. */
 function roomsFor(ref){let rooms={};try{rooms=JSON.parse(localStorage.getItem('sitzplan_rooms_v1')||'{}')}catch{}let id='';try{id=classroomModel?.sourceClasses?.[ref]||''}catch{}const own=id?(rooms['NM:'+id]?.rooms||[]).map(r=>r?.name).filter(Boolean):[];return own.length?[...new Set(own)]:roomNames()}
 function roomOptionHtml(ref,current){const list=ref?roomsFor(ref):[];const opts=['<option value="">'+(ref?'Raum …':'—')+'</option>',...list.map(r=>`<option value="${esc(r)}"${r===current?' selected':''}>${esc(r)}</option>`)];if(current&&!list.includes(current))opts.push(`<option value="${esc(current)}" selected>${esc(current)}</option>`);return opts.join('')}
 function roomNames(){let rooms={};try{rooms=JSON.parse(localStorage.getItem('sitzplan_rooms_v1')||'{}')}catch{}const s=new Set();for(const e of Object.values(rooms))for(const r of e?.rooms||[])if(r?.name)s.add(r.name);return [...s].sort((a,b)=>a.localeCompare(b,'de',{numeric:true}))}

 /* ---------- Bearbeiten ---------- */
 /* 10.81: Stundenplan als Wochenraster – Doppelstunden (gleiche Klasse und gleicher Raum direkt hintereinander) sind EIN Block.
    Datenformat unverändert (je Stunde ein Eintrag); ein Block schreibt in alle seine Stunden. Antippen öffnet ein kleines Fenster. */
 /* gleiche Farbe je Klasse überall (Editor und Übersicht): Reihenfolge des ersten Auftretens Mo→Fr, 1.→letzte Stunde */
 function refColors(){const t=load(),L=learned(),m=new Map(),add=r=>{if(r&&!m.has(r))m.set(r,PAL[m.size%PAL.length])};for(let w=1;w<=5;w++)for(const i of t.slots.keys()){const st=t.days[w]?.[i];if(st?.ab){add(st.A?.ref);add(st.B?.ref)}else if(st)add(st.ref);else add(L[w]?.[i]?.ref)}return m}
 const PAL=[['#e3edfb','#2f5f9b'],['#fdebd7','#9a5414'],['#dff1e5','#2c7a4b'],['#fbe3e6','#a33a4a'],['#f6efcf','#7a6410'],['#def3f8','#1f6b80'],['#efe4da','#6d4c33'],['#e8ecf3','#44546a']];
 function openEditor(){
  const t=load(),L=learned(),opts=classOptions(),rooms=roomNames();
  const label=new Map(opts.map(o=>[o.ref,o.label]));
  /* Farben nur für Klassen im Plan vergeben (Reihenfolge des ersten Auftretens) – so haben verschiedene Klassen verschiedene Farben */
  const colorIdx=refColors(),colorOf=ref=>{if(!colorIdx.has(ref))colorIdx.set(ref,PAL[colorIdx.size%PAL.length]);return colorIdx.get(ref)};
  const d=document.createElement('dialog');d.className='tt-dialog tt-v2';
  /* Zelle lesen: {kind:'empty'|'man'|'learned'|'ab', ref, room, A, B} */
  function cellAt(w,i){const st=t.days[w]?.[i],lr=L[w]?.[i];
   if(st?.ab){if(t.ab?.on)return {kind:'ab',A:st.A?.ref?{ref:st.A.ref,room:st.A.room||''}:null,B:st.B?.ref?{ref:st.B.ref,room:st.B.room||''}:null};const base=st.A?.ref?st.A:st.B;return base?.ref?{kind:'man',ref:base.ref,room:base.room||''}:{kind:'empty'}}
   if(st)return st.ref?{kind:'man',ref:st.ref,room:st.room||''}:{kind:'empty',off:!!lr};
   if(lr?.ref)return {kind:'learned',ref:lr.ref,room:lr.room||''};return {kind:'empty'}}
  const keyOf=c=>c.kind==='empty'?'':c.kind==='ab'?'ab|'+(c.A?.ref||'')+'|'+(c.A?.room||'')+'|'+(c.B?.ref||'')+'|'+(c.B?.room||''):c.ref+'|'+c.room;
  /* Zelle schreiben: v = null (leer) | {ref,room} | {ab:true,A,B} */
  function setCell(w,i,v){t.days[w]??={};const lr=L[w]?.[i];
   if(!v||(!v.ab&&!v.ref)||(v.ab&&!v.A?.ref&&!v.B?.ref)){if(lr?.ref)t.days[w][i]={ref:'',off:true};else delete t.days[w][i];return}
   t.days[w][i]=v.ab?{ab:true,A:v.A?.ref?{ref:v.A.ref,room:v.A.room||''}:null,B:v.B?.ref?{ref:v.B.ref,room:v.B.room||''}:null}:{ref:v.ref,room:v.room||''}}
  function blocks(w){const out=[];let cur=null;for(const i of t.slots.keys()){const c=cellAt(w,i),k=keyOf(c);if(k&&cur&&cur.key===k&&cur.end===i-1){cur.end=i;continue}cur=k?{w,start:i,end:i,key:k,c}:null;if(cur)out.push(cur)}return out}
  const roomTxt=r=>r?(/^raum\b/i.test(r)?r:'Raum '+r):'';
  function blockHtml(bl){const c=bl.c,n=bl.end-bl.start+1,time=n>1?esc(t.slots[bl.start].start)+'–'+esc(t.slots[bl.end].end):'';
   let main,col;
   if(c.kind==='ab'){const half=(k,x)=>`<span class="tw-ab"><i class="tt-wk tt-wk-${k.toLowerCase()}">${k}</i>${x?esc(label.get(x.ref)||x.ref)+(x.room?' · '+esc(x.room):''):'—'}</span>`;col=colorOf((c.A||c.B)?.ref);main=half('A',c.A)+half('B',c.B)}
   else{col=colorOf(c.ref);main=`<b>${esc(label.get(c.ref)||c.ref)}</b><small>${[time,esc(roomTxt(c.room))].filter(Boolean).join(' · ')}</small>`}
   const tag=c.kind==='learned'?'<span class="tw-tag">Erkannt</span>':n>1?`<span class="tw-tag">${n===2?'Doppelstunde':n+' Std'}</span>`:'';
   return `<button type="button" class="tw-b${c.kind==='learned'?' tw-learned':''}" data-blk="${bl.w}:${bl.start}:${bl.end}" style="grid-row:${bl.start+2}/span ${n};grid-column:${bl.w+1};--bg:${col[0]};--fg:${col[1]}" title="${esc(DAYS[bl.w-1])}, ${bl.start+1}.${n>1?'–'+(bl.end+1)+'.':''} Stunde – antippen zum Ändern">${main}${tag}</button>`}
  function gridHtml(){let h=`<div class="tw-grid" style="grid-template-rows:auto repeat(${t.slots.length},56px)"><div class="tw-h"></div>${DAYS.map(x=>`<div class="tw-h">${x}</div>`).join('')}`;
   t.slots.forEach((s,i)=>{h+=`<div class="tw-t" style="grid-row:${i+2}"><b>${i+1}. Std</b>${esc(s.start||'')}–${esc(s.end||'')}</div>`});
   for(let w=1;w<=5;w++){const occ=new Set();for(const bl of blocks(w)){for(let i=bl.start;i<=bl.end;i++)occ.add(i);h+=blockHtml(bl)}
    for(const i of t.slots.keys())if(!occ.has(i))h+=`<button type="button" class="tw-e" data-new="${w}:${i}" style="grid-row:${i+2};grid-column:${w+1}" aria-label="${DAYS[w-1]}, ${i+1}. Stunde – Stunde eintragen" title="Stunde eintragen">+</button>`}
   return h+'</div>'}
  const optionHtml=sel=>'<option value="">—</option>'+opts.map(o=>`<option value="${esc(o.ref)}"${o.ref===sel?' selected':''}>${esc(o.label)}</option>`).join('');
  d.innerHTML=`<div class="tt-head"><div><h2 tabindex="-1" autofocus style="outline:none">Stundenplan</h2><p>Antippen zum Eintragen oder Ändern. Doppelstunden sind ein Block. <span class="tt-key">Erkannt</span> = von der App aus deinen Eingaben erkannt (ab zwei Wochen); eigene Einträge haben Vorrang. Während einer Stunde (ab 10 Minuten vorher) wählt die App beim Öffnen automatisch Klasse und Raum.</p></div></div><div class="tt-ab"></div><div class="tt-wrap tw-wrap"></div><div class="tw-times" hidden></div><div class="tt-foot"><button type="button" data-times title="Beginn und Ende der Stunden bearbeiten, Stunden hinzufügen oder entfernen">Zeiten …</button><span></span><button type="button" data-c>Abbrechen</button><button type="button" class="tt-primary" data-s>Speichern</button></div>`;
  document.body.append(d);const wrap=d.querySelector('.tw-wrap'),timesBox=d.querySelector('.tw-times');
  const render=()=>{for(let w=1;w<=5;w++)for(const i of t.slots.keys()){const c=cellAt(w,i);for(const r of [c.ref,c.A?.ref,c.B?.ref])if(r)colorOf(r)}wrap.innerHTML=gridHtml()};render();d.showModal();try{document.activeElement?.blur?.();d.querySelector('h2')?.focus({preventScroll:true})}catch{}
  /* Zeiten */
  function renderTimes(){timesBox.innerHTML=`<div class="tw-th"><b>Zeiten</b><span>Beginn und Ende jeder Stunde</span></div>`+t.slots.map((s,i)=>`<div class="tw-tr"><span>${i+1}.</span><input type="time" value="${esc(s.start)}" data-start="${i}" aria-label="Beginn ${i+1}. Stunde" title="Beginn ${i+1}. Stunde"> – <input type="time" value="${esc(s.end)}" data-end="${i}" aria-label="Ende ${i+1}. Stunde" title="Ende ${i+1}. Stunde"><button type="button" class="tt-del" data-del="${i}" aria-label="${i+1}. Stunde entfernen" title="Stunde entfernen (auch aus dem Plan)">−</button></div>`).join('')+`<button type="button" class="tw-add" data-add title="Eine weitere Stunde am Ende anfügen">+ Stunde</button>`}
  timesBox.addEventListener('input',e=>{const x=e.target;if(x.dataset.start!==undefined)t.slots[+x.dataset.start].start=x.value;else if(x.dataset.end!==undefined)t.slots[+x.dataset.end].end=x.value;else return;render()});
  /* A/B-Wochen (wie bisher) */
  const abBox=d.querySelector('.tt-ab'),fmtS=x=>x.split('-').reverse().slice(0,2).join('.')+'.';
  function renderAb(){const on=!!t.ab?.on;let h=`<span class="tt-ab-l">Wochenrhythmus</span><span class="tt-seg2"><button type="button" data-abm="off" class="${on?'':'on'}" title="Jede Woche derselbe Plan">Jede Woche gleich</button><button type="button" data-abm="on" class="${on?'on':''}" title="Stunden können nur in der A- oder B-Woche stattfinden">A/B-Wochen</button></span>`;
   if(on){const now=weekOf(t,new Date()),nx=new Date();nx.setDate(nx.getDate()+7);const next=weekOf(t,nx);h+=`<span class="tt-ab-now">Diese Woche: <b class="tt-wk tt-wk-${now.toLowerCase()}">${now}-Woche</b> · nächste: ${next}</span><div class="tt-anchors">${(t.ab.anchors||[]).map((a,k)=>`<div class="tt-anchor">Woche ab <input type="date" data-anchor-date="${k}" value="${esc(a.start)}" aria-label="Startpunkt ${k+1}" title="Montag dieser Woche"> ist <select data-anchor-week="${k}" aria-label="Woche am Startpunkt ${k+1}" title="A- oder B-Woche"><option value="A"${a.week!=='B'?' selected':''}>A-Woche</option><option value="B"${a.week==='B'?' selected':''}>B-Woche</option></select>${(t.ab.anchors||[]).length>1?`<button type="button" class="tt-del" data-anchor-del="${k}" aria-label="Startpunkt entfernen" title="Startpunkt entfernen">−</button>`:''}</div>`).join('')}<button type="button" class="tt-anchor-add" data-anchor-add title="Zum Beispiel nach den Ferien, wenn die Schule wieder mit A beginnt">＋ Neuer Startpunkt</button></div>`;
    const m0=monday(new Date());m0.setDate(m0.getDate()-14);h+='<div class="tt-weeks" aria-label="Kommende Wochen">'+Array.from({length:8},(_,k)=>{const m=new Date(m0);m.setDate(m0.getDate()+7*k);const w=weekOf(t,m),cur=k===2;return `<span class="tt-wkc tt-wkc-${w.toLowerCase()}${cur?' now':''}"><b>${w}</b>${fmtS(isoDay(m))}</span>`}).join('')+'</div>'}
   abBox.innerHTML=h}
  renderAb();
  const defaultStart=()=>{try{const p=JSON.parse(localStorage.getItem('notenrechner-period-dates')||'{}');const s=Object.values(p).map(x=>x?.start).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')).sort();const now=today();const past=s.filter(x=>x<=now);if(past.length)return past.at(-1)}catch{}return isoDay(monday(new Date()))};
  const readAnchors=()=>{if(!t.ab?.on)return;const a=[];for(const inp of d.querySelectorAll('[data-anchor-date]')){const k=inp.dataset.anchorDate;if(/^\d{4}-\d{2}-\d{2}$/.test(inp.value))a.push({start:inp.value,week:d.querySelector(`[data-anchor-week="${k}"]`)?.value==='B'?'B':'A'})}if(a.length)t.ab.anchors=a};
  abBox.addEventListener('change',()=>{readAnchors();renderAb();render()});
  /* Kleines Fenster für einen Block */
  let pop=null;const closePop=()=>{pop?.remove();pop=null;d.querySelectorAll('.tw-sel').forEach(x=>x.classList.remove('tw-sel'))};
  function openPop(btn,w,s,e){closePop();btn.classList.add('tw-sel');const c=cellAt(w,s),isNew=c.kind==='empty',abOn=!!t.ab?.on;let n=e-s+1;
   let mode=c.kind==='ab'?'ab':'all',A=c.kind==='ab'?c.A:null,B=c.kind==='ab'?c.B:null,ref=c.kind==='ab'?'':(c.ref||''),room=c.kind==='ab'?'':(c.room||'');
   pop=document.createElement('div');pop.className='tw-pop';pop.setAttribute('role','dialog');
   const lenMax=()=>{let m=n;while(s+m<t.slots.length&&m<4)m++;return m};
   const draw=()=>{const row=(k,x)=>`<div class="tw-r"><span class="tw-l">${k?`<i class="tt-wk tt-wk-${k.toLowerCase()}">${k}</i>`:'Klasse'}</span><select data-pref="${k}" title="Klasse${k?' in der '+k+'-Woche':''}">${optionHtml(x?.ref||'')}</select></div><div class="tw-r"><span class="tw-l">Raum</span><select data-proom="${k}" title="Raum${k?' in der '+k+'-Woche':''}">${roomOptionHtml(x?.ref||'',x?.room||'')}</select></div>`;
    const lens=[[1,'1 Std'],[2,'Doppelstunde']];if(n>2)lens.push([n,n+' Std']);
    pop.innerHTML=`<b class="tw-pt">${esc(DAYS[w-1])} · ${s+1}.${n>1?'–'+(s+n)+'.':''} Stunde${c.kind==='learned'?' <span class="tt-key">Erkannt</span>':''}</b>`
     +(abOn?`<div class="tw-r"><span class="tw-l">Woche</span><span class="tw-seg"><button type="button" data-pmode="all" class="${mode==='all'?'on':''}" title="Jede Woche">Jede</button><button type="button" data-pmode="ab" class="${mode==='ab'?'on':''}" title="Unterschiedlich in A- und B-Woche">A / B</button></span></div>`:'')
     +(mode==='ab'?row('A',A)+row('B',B):row('',{ref,room}))
     +`<div class="tw-r"><span class="tw-l">Länge</span><span class="tw-seg">${lens.map(([v,l])=>`<button type="button" data-plen="${v}" class="${n===v?'on':''}"${v>1&&s+v>t.slots.length?' disabled':''} title="${v===1?'Einzelstunde':v===2?'Diese und die nächste Stunde':v+' Stunden hintereinander'}">${l}</button>`).join('')}</span></div>`
     +`<div class="tw-r tw-act">${isNew?'<span></span>':'<button type="button" class="tw-rm" data-prm title="Diese Stunde(n) aus dem Plan entfernen">Entfernen</button>'}<button type="button" class="tw-ok" data-pok title="Übernehmen">Fertig</button></div>`};
   draw();d.append(pop);
   const place=()=>{const r=btn.getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight;let x=r.right+8,y=r.top;if(x+pw>innerWidth-8)x=r.left-pw-8;if(x<8)x=Math.max(8,Math.min(innerWidth-pw-8,r.left));y=Math.max(8,Math.min(innerHeight-ph-8,y));pop.style.left=x+'px';pop.style.top=y+'px'};place();
   const value=()=>mode==='ab'?{ab:true,A,B}:{ref,room};
   pop.addEventListener('change',ev=>{const x=ev.target;const k=x.dataset.pref??x.dataset.proom;if(k===undefined)return;
    if(x.dataset.pref!==undefined){const list=x.value?roomsFor(x.value):[];if(k){const o=k==='A'?A:B,nr=x.value?{ref:x.value,room:list.includes(o?.room)?o.room:(list.length===1?list[0]:'')}:null;if(k==='A')A=nr;else B=nr}else{ref=x.value;room=list.includes(room)?room:(list.length===1?list[0]:'')}draw();place()}
    else{if(k==='A'&&A)A.room=x.value;else if(k==='B'&&B)B.room=x.value;else if(!k)room=x.value}});
   pop.addEventListener('click',ev=>{const b2=ev.target.closest('button');if(!b2)return;ev.stopPropagation();
    if(b2.dataset.pmode){if(b2.dataset.pmode==='ab'&&mode!=='ab'){mode='ab';A=ref?{ref,room}:null;B=null}else if(b2.dataset.pmode==='all'&&mode==='ab'){mode='all';const x=A||B;ref=x?.ref||'';room=x?.room||''}draw();place();return}
    if(b2.dataset.plen){n=+b2.dataset.plen;draw();place();return}
    if(b2.hasAttribute('data-prm')){for(let i=s;i<=e;i++)setCell(w,i,null);closePop();render();return}
    if(b2.hasAttribute('data-pok')){const v=value(),empty=mode==='ab'?!A?.ref&&!B?.ref:!ref;
     /* belegte Folgestunde einer anderen Klasse nicht stillschweigend überschreiben */
     for(let i=s+1;i<s+n;i++){if(i<=e)continue;const o=cellAt(w,i);if(o.kind!=='empty'&&keyOf(o)!==keyOf(mode==='ab'?{kind:'ab',A,B}:{kind:'man',ref,room})&&!confirm(`${i+1}. Stunde ist schon belegt (${label.get(o.ref||(o.A||o.B)?.ref)||'andere Klasse'}). Überschreiben?`))return}
     for(let i=s;i<=Math.max(e,s+n-1);i++)setCell(w,i,empty?null:(i<s+n?v:null));closePop();render()}});
  }
  wrap.addEventListener('click',e=>{const b=e.target.closest('[data-blk],[data-new]');if(!b)return;e.stopPropagation();if(b.dataset.blk){const [w,s,en]=b.dataset.blk.split(':').map(Number);openPop(b,w,s,en)}else{const [w,i]=b.dataset.new.split(':').map(Number);openPop(b,w,i,i)}});
  d.addEventListener('click',e=>{if(pop&&!pop.contains(e.target)&&!e.target.closest('[data-blk],[data-new]'))closePop();
   const b=e.target.closest('button');if(!b||pop?.contains(b))return;
   if(b.dataset.abm){readAnchors();if(b.dataset.abm==='on'){t.ab=t.ab||{};t.ab.on=true;if(!t.ab.anchors?.length)t.ab.anchors=[{start:defaultStart(),week:'A'}]}else if(t.ab)t.ab.on=false;renderAb();render();return}
   if(b.hasAttribute('data-anchor-add')){readAnchors();t.ab.anchors.push({start:isoDay(monday(new Date())),week:'A'});renderAb();return}
   if(b.dataset.anchorDel!==undefined){readAnchors();t.ab.anchors.splice(Number(b.dataset.anchorDel),1);renderAb();render();return}
   if(b.hasAttribute('data-times')){timesBox.hidden=!timesBox.hidden;b.classList.toggle('on',!timesBox.hidden);if(!timesBox.hidden){renderTimes();timesBox.scrollIntoView({block:'nearest'})}return}
   if(b.hasAttribute('data-add')){const last=t.slots.at(-1),plus=m=>{const [h,mm]=(m||'08:00').split(':').map(Number),x=h*60+mm+50;return String(Math.floor(x/60)%24).padStart(2,'0')+':'+String(x%60).padStart(2,'0')};t.slots.push({start:plus(last?.start),end:plus(last?.end)});renderTimes();render();return}
   if(b.dataset.del!==undefined){const i=Number(b.dataset.del);t.slots.splice(i,1);for(const day of Object.keys(t.days)){const n={};for(const [k,v] of Object.entries(t.days[day])){const j=Number(k);if(j<i)n[j]=v;else if(j>i)n[j-1]=v}t.days[day]=n}renderTimes();render();return}
   if(b.hasAttribute('data-c')){d.close();d.remove()}
   else if(b.hasAttribute('data-s')){readAnchors();store(t);d.close();d.remove();window.classroomNowPills?.()}
  });
  d.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop){e.preventDefault();e.stopPropagation();closePop()}},true);
  d.addEventListener('cancel',e=>{e.preventDefault();if(pop){closePop();return}d.close();d.remove()});
  {const st=document.getElementById('tt-v2-css')||document.createElement('style');st.id='tt-v2-css';st.textContent='.tt-v2 .tw-wrap{overflow:auto}.tw-grid{display:grid;grid-template-columns:96px repeat(5,minmax(120px,1fr));gap:6px;min-width:720px;padding:2px}.tw-h{font-weight:700;color:#66758a;font-size:.8rem;padding:4px 4px 2px;position:sticky;top:0;background:#fff;z-index:1}'
   +'.tw-t{grid-column:1;display:flex;flex-direction:column;justify-content:center;font-size:.78rem;color:#66758a;border-top:1px solid #eef1f6;padding-left:2px}.tw-t b{color:#24334b;font-size:.86rem}'
   +'.tw-e{border:1.5px dashed #dbe3ef;border-radius:10px;background:#fff;color:#b5c1d3;font-size:18px;cursor:pointer}.tw-e:hover{border-color:#9fbbe6;color:#2f5f9b;background:#f6f9fe}'
   +'.tw-b{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:1px;min-width:0;padding:6px 10px;border:1px solid transparent;border-radius:10px;background:var(--bg);color:var(--fg);font:inherit;text-align:left;cursor:pointer;overflow:hidden}.tw-b b{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.tw-b small{font-size:.75rem;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}'
   +'.tw-b:hover{filter:brightness(.97)}.tw-learned{border:1.5px dashed var(--fg)}.tw-tag{position:absolute;top:5px;right:6px;font-size:10.5px;font-weight:800;background:#ffffffb0;border-radius:6px;padding:1px 6px}.tw-b:has(.tw-tag) b{padding-right:0}.tw-ab{display:flex;gap:6px;align-items:center;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}'
   +'.tw-sel{outline:3px solid #2f5f9b;outline-offset:1px}'
   +'.tw-pop{position:fixed;z-index:20;width:300px;background:#fff;border:1px solid #dce3ef;border-radius:14px;box-shadow:0 16px 40px #1c2b4630;padding:14px;font-size:.9rem}.tw-pt{display:block;margin-bottom:6px;font-size:.95rem}.tw-r{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:8px 0}.tw-l{color:#66758a;font-size:.84rem;display:flex;align-items:center}.tw-r select{flex:1;max-width:190px;height:34px;padding:0 8px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;font:inherit}'
   +'.tw-seg{display:inline-flex;background:#eef2f8;border-radius:10px;padding:3px}.tw-seg button{border:0;background:none;padding:5px 10px;border-radius:8px;font:inherit;font-size:.82rem;color:#66758a;cursor:pointer}.tw-seg button.on{background:#fff;color:#2f5f9b;font-weight:700;box-shadow:0 1px 3px #0001}.tw-seg button:disabled{opacity:.4;cursor:default}'
   +'.tw-act{margin-top:12px}.tw-act button{height:36px;padding:0 14px;border-radius:10px;font:inherit;font-weight:600;cursor:pointer}.tw-rm{background:#fff;color:#b42318;border:1px solid #efb4b4}.tw-ok{background:#2f5f9b;color:#fff;border:1px solid #2f5f9b}'
   +'.tw-times[hidden]{display:none!important}.tw-times{margin-top:12px;padding:12px 14px;border:1px solid #dce3ef;border-radius:12px;background:#f8fafd;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center}.tw-th{width:100%;display:flex;gap:10px;align-items:baseline}.tw-th span{color:#66758a;font-size:.82rem}.tw-tr{display:flex;align-items:center;gap:5px;font-size:.85rem}.tw-tr input{width:84px;padding:3px 4px;border:1px solid #cbd6e5;border-radius:7px;font:inherit}.tw-add{height:32px;padding:0 12px;border:1px solid #a8bdd8;border-radius:10px;background:#fff;color:#2f5f9b;font:inherit;font-weight:600;cursor:pointer}'
   +'.tt-foot button.on{background:#eaf0fa}';document.head.append(st)}
 }
 window.classroomOpenTimetable=openEditor;

 /* ---------- Automatisch wählen ---------- */
 const today=()=>{const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0')};
 const mins=s=>{const [h,m]=String(s||'').split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null};
 /* 10.82: Die Pause NACH einer Stunde gehört noch zu dieser Stunde (bis zum Beginn der nächsten; nach der letzten 20 Minuten).
    10 Minuten vorher gilt nur, wenn davor keine eigene Stunde liegt (erste Stunde oder nach einer Freistunde). */
 /* stay=true (Uhr, Zuletzt, Übersicht): nach der letzten Stunde des Tages bleibt diese bis Mitternacht „jetzt“ (10.84). Die Automatik beim Öffnen nutzt das nicht. */
 function lessonNow(stay=false){const t=plan(),n=new Date(),day=n.getDay(),now=n.getHours()*60+n.getMinutes();if(day<1||day>5)return null;let lastI=-1;for(const i of t.slots.keys())if(t.days[day]?.[i]?.ref)lastI=i;
  for(const [i,s] of t.slots.entries()){const a=mins(s.start),b=mins(s.end);if(a===null||b===null)continue;const e=t.days[day]?.[i];if(!e?.ref)continue;
   const prev=i>0&&t.days[day]?.[i-1]?.ref,next=i+1<t.slots.length?mins(t.slots[i+1].start):null,from=prev?a:a-10,to=stay&&i===lastI?24*60:next!==null&&next>b?next:b+20;
   if(now>=from&&now<to)return {...e,key:today()+':'+i}}return null}
 function toast(text,undo,more){document.querySelector('.tt-toast')?.remove();const bar=document.createElement('div');bar.className='tt-toast';bar.setAttribute('role','status');bar.innerHTML=`<span>${esc(text)}</span>${undo?'<button type="button" class="tt-undo">Rückgängig</button>':''}${more?'<button type="button" class="tt-more">'+esc(more.label)+'</button>':''}<button type="button" class="tt-toast-x" aria-label="Hinweis schließen">×</button>`;document.body.append(bar);bar.querySelector('.tt-toast-x').onclick=()=>bar.remove();if(undo)bar.querySelector('.tt-undo').onclick=()=>{bar.remove();undo()};if(more)bar.querySelector('.tt-more').onclick=()=>{bar.remove();more.run()};setTimeout(()=>bar.remove(),12000)}
 async function selectRoom(name){if(!name)return;for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,250));try{const sel=classroomSeats.contentWindow.document.getElementById('classroomRoomSelect');if(!sel)continue;const opt=[...sel.options].find(o=>o.textContent.trim().toLocaleLowerCase('de')===name.toLocaleLowerCase('de'));if(!opt)return;if(sel.value!==opt.value){sel.value=opt.value;sel.dispatchEvent(new Event('change',{bubbles:true}))}return}catch{}}}
 async function apply(force=false){
  const lesson=lessonNow();if(!lesson)return;
  let applied='';try{applied=localStorage.getItem(APPLIED)||''}catch{}
  if(!force&&applied===lesson.key)return;
  try{localStorage.setItem(APPLIED,lesson.key)}catch{}
  return applyLesson(lesson,'Stundenplan');
 }
 // Zuletzt unterrichtete Lerngruppe (heute bis jetzt, sonst die letzten Schultage)
 /* 10.80: „Zuletzt“ = die letzte ANDERE Klasse – die gerade laufende (auch die 2. Stunde einer Doppelstunde) zählt nicht */
 function lastLesson(){const n=new Date();let cur='';try{cur=lessonNow(true)?.ref||''}catch{}for(let back=0;back<14;back++){const d=new Date(n);d.setDate(n.getDate()-back);const day=d.getDay();if(day<1||day>5)continue;const t=plan(d);const lim=back?24*60:n.getHours()*60+n.getMinutes();let best=null;for(const [i,s] of t.slots.entries()){const a=mins(s.start);if(a===null||a>lim)continue;const e=t.days[day]?.[i];if(e?.ref&&e.ref!==cur)best={...e,date:dateStr(d)}}if(best)return best}return null}
 // „Aktuell“ (iPhone-Leiste): laufende Stunde, sonst die zuletzt unterrichtete Lerngruppe
 /* „Aktuell“ (iPhone-Leiste): läuft gerade eine Stunde, direkt in deren Sitzplan (mit Datum und Raum);
    sonst Übersicht für heute und den nächsten Schultag mit „Zuletzt“ (8.01). */
 /* 10.87: iPhone-„Aktuell“ (strict): nur während Stunde/Pause direkt in den Sitzplan, sonst die Übersicht.
    Die Uhr am Mac bleibt nach Schulschluss bei der letzten Stunde (stay). */
 window.classroomGoCurrent=async function(o){
  const now=lessonNow(!o?.strict);
  /* iPhone: ist die laufende Stunde schon offen (gleiche Klasse im Unterricht), zeigt „Aktuell“ die Übersicht – sonst passiert sichtbar nichts */
  if(now&&o?.strict){try{const sel=classroomNotes.contentWindow.classroomCurrentSelection()||{},[sub,cid]=now.ref.split('::');if(sel.subject===sub&&sel.classId===cid&&document.getElementById('tab-sitzplan')?.getAttribute('aria-selected')==='true'){openPlan();return}}catch{}}if(now){try{localStorage.setItem(APPLIED,now.key)}catch{}return applyLesson(now,'Jetzt')}
  openPlan();
 };
 /* 10.79: Doppelschalter am Mac – rechte Hälfte: zuletzt unterrichtete Klasse */
 window.classroomGoLast=async function(){const l=lastLesson();if(l)return applyLesson(l,'Zuletzt');openPlan()};
 window.classroomLessonInfo=function(){const labels=new Map(classOptions().map(o=>[o.ref,o.label]));let n=null,l=null;try{n=lessonNow(true)}catch{}try{l=lastLesson()}catch{}return {now:n?labels.get(n.ref)||'':'',last:l?labels.get(l.ref)||'':''}};
 const isPhone=()=>matchMedia('(max-width:540px) and (orientation:portrait) and (pointer:coarse),(max-height:500px) and (orientation:landscape) and (pointer:coarse)').matches;
 const WD=['So','Mo','Di','Mi','Do','Fr','Sa'],fmtD=d=>WD[d.getDay()]+', '+String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.';
 const roomText=r=>r?(/^raum\b/i.test(r)?r:'Raum '+r):'';
 let phDay=null;/* 11.15: iPhone hochkant – gewählter Tag (‹ › oder Wischen) */
 function openPlan(o){if(!o||!o.day)phDay=null;else phDay=o.day;
  document.querySelector('.tt-sheet')?.remove();
  const t=plan(),labels=new Map(classOptions().map(o=>[o.ref,o.label])),n=new Date(),nowM=n.getHours()*60+n.getMinutes();
  const total=Object.values(load().days||{}).reduce((a,d)=>a+Object.values(d||{}).filter(e=>e?.ref||e?.A?.ref||e?.B?.ref).length,0)+Object.values(t.days).reduce((a,d)=>a+Object.values(d||{}).filter(e=>e?.ref&&e.learned).length,0);
  const nowIdx=(()=>{try{const k=lessonNow(true)?.key;return k?Number(k.split(':').pop()):null}catch{return null}})();
  const sh=document.createElement('div');sh.className='tt-sheet'+(isPhone()&&matchMedia('(orientation:landscape)').matches?' tt-land':'');
  let html='<div class="tt-back"></div><section class="tt-panel" role="dialog" aria-label="Stundenplan"><div class="tt-grab"></div><div class="tt-head"><b>Stundenplan</b><button type="button" class="tt-x" aria-label="Schließen">✕</button></div><div class="tt-body">';
  const lessons=[],cmap=refColors(),col=r=>cmap.get(r)||PAL[0],land=isPhone()&&matchMedia('(orientation:landscape)').matches;
  /* 10.85: Tag als zusammengefasste Blöcke (Doppelstunden = ein Eintrag) */
  const blocksOf=d=>{const td=plan(d),list=td.slots.map((s,i)=>({s,i,e:td.days[d.getDay()]?.[i]})).filter(x=>x.e?.ref),m=[];for(const x of list){const p=m.at(-1);if(p&&p.last.i+1===x.i&&p.e.ref===x.e.ref&&(p.e.room||'')===(x.e.room||'')&&(p.e.week||'')===(x.e.week||''))p.last=x;else m.push({...x,first:x,last:x})}for(const x of m)x.s={start:x.first.s.start,end:x.last.s.end};return {td,m}};
  const spanTxt=x=>x.first.i===x.last.i?(x.first.i+1)+'. Std':(x.first.i+1)+'.–'+(x.last.i+1)+'. Std';
  const lbl=r=>esc(labels.get(r)||r),tag=e=>e.week?'<i class="tt-tag tt-wk-'+e.week.toLowerCase()+'">'+e.week+'</i>':'';
  if(!total){html+=isPhone()?'<p class="tt-empty">Auf diesem Gerät ist kein Stundenplan gespeichert. Bitte am Mac den Stundenplan eintragen, ein neues Backup erstellen und hier wiederherstellen.</p>':'<p class="tt-empty">Noch kein Stundenplan eingetragen. Trage die Stundenzeiten einmal ein – dann führt dieser Knopf während einer Stunde direkt zur richtigen Klasse.</p><button type="button" class="tt-edit">Stundenplan eintragen …</button>'}
  else if(land){
   /* iPhone quer: die ganze Woche wie am Mac */
   const mon=monday(n),tw=plan(n),rows=tw.slots.length;html+=`<div class="tt-wgrid" style="grid-template-rows:auto repeat(${rows},30px)"><div></div>`;
   const days=[1,2,3,4,5].map(k=>{const d=new Date(mon);d.setDate(mon.getDate()+k-1);return d});
   days.forEach((d,k)=>{html+=`<div class="tt-wh${dateStr(d)===today()?' on':''}" style="grid-column:${k+2}">${WD[d.getDay()]} ${d.getDate()}.${d.getMonth()+1}.</div>`});
   tw.slots.forEach((s,i)=>{html+=`<div class="tt-wt" style="grid-row:${i+2}">${i+1}.<small>${esc(s.start||'')}</small></div>`});
   days.forEach((d,k)=>{const isToday=dateStr(d)===today();for(const x of blocksOf(d).m){const c=col(x.e.ref),cur=isToday&&nowIdx!==null&&nowIdx>=x.first.i&&nowIdx<=x.last.i;lessons.push({...x.e,date:dateStr(d)});
    html+=`<button type="button" class="tt-wb${cur?' is-now':''}" data-i="${lessons.length-1}" title="${lbl(x.e.ref)}${x.e.room?' · '+esc(roomText(x.e.room)):''} – Sitzplan öffnen" style="grid-column:${k+2};grid-row:${x.first.i+2}/span ${x.last.i-x.first.i+1};--bg:${c[0]};--fg:${c[1]}"><b>${lbl(x.e.ref)}</b>${x.last.i>x.first.i?`<small>${esc(x.e.room||'')}${tag(x.e)}</small>`:tag(x.e)}</button>`}});
   html+='</div>';
  }else if(isPhone()){
   /* iPhone hochkant: der Tag als Zeitleiste (Variante A) – Doppelstunden als hohe Blöcke, rote Linie = jetzt, Vergangenes blasser */
   let showDay=new Date(n);if(phDay)showDay=new Date(phDay);else for(let k=0;k<10&&!(showDay.getDay()>=1&&showDay.getDay()<=5&&blocksOf(showDay).m.length);k++)showDay.setDate(showDay.getDate()+1);
   const isToday=dateStr(showDay)===today(),{td,m}=blocksOf(showDay),wk=td.week?' · <span class="tt-wk tt-wk-'+td.week.toLowerCase()+'">'+td.week+'-Woche</span>':'';
   html+=`<div class="tt-dnav"><button type="button" class="tt-dp" data-dd="-1" aria-label="Vorheriger Schultag">‹</button><h4>${isToday?'Heute · '+fmtD(showDay):(phDay?fmtD(showDay):'Nächster Schultag · '+fmtD(showDay))}${wk}</h4><button type="button" class="tt-dp" data-dd="1" aria-label="Nächster Schultag">›</button></div>`;sh.dataset.day=dateStr(showDay);
   if(!m.length)html+='<p class="tt-none">Kein Unterricht eingetragen</p>';
   else{const first=m[0].first.i,lastI=m.at(-1).last.i,R=52,G=5;html+=`<div class="tt-tl" style="grid-template-rows:repeat(${lastI-first+1},${R}px);row-gap:${G}px">`;
    for(let i=first;i<=lastI;i++)html+=`<div class="tt-tlt" style="grid-row:${i-first+1}">${esc(td.slots[i].start||'')}<small>${i+1}.</small></div>`;
    for(const x of m){const c=col(x.e.ref),b=mins(x.s.end),cur=isToday&&nowIdx!==null&&nowIdx>=x.first.i&&nowIdx<=x.last.i,past=isToday&&b!==null&&b<nowM&&!cur;lessons.push({...x.e,date:dateStr(showDay)});
     html+=`<button type="button" class="tt-tlb${past?' is-past':''}${cur?' is-now':''}" data-i="${lessons.length-1}" style="grid-row:${x.first.i-first+1}/span ${x.last.i-x.first.i+1};--bg:${c[0]};--fg:${c[1]}" title="Sitzplan öffnen"><b>${lbl(x.e.ref)}${tag(x.e)}</b><small>${esc(x.s.start||'')}–${esc(x.s.end||'')} · ${spanTxt(x)}${x.e.room?' · '+esc(roomText(x.e.room)):''}</small></button>`}
    if(isToday){let y=null;for(let i=first;i<=lastI;i++){const a=mins(td.slots[i].start),nx=i<lastI?mins(td.slots[i+1].start):mins(td.slots[i].end);if(a!==null&&nx!==null&&nowM>=a&&nowM<nx){y=(i-first)*(R+G)+Math.min(1,(nowM-a)/Math.max(1,nx-a))*(R+G);break}}if(y!==null)html+=`<div class="tt-nowline" style="top:${Math.round(y)}px" aria-hidden="true"></div>`}
    html+='</div>'}
  }else{
   /* Mac/iPad: Jetzt-Karte, Zuletzt, dann nur der aktuelle Tag */
   const nowL=lessonNow(true);let showDay=new Date(n);
   if(nowL){const x=blocksOf(n).m.find(x=>nowIdx>=x.first.i&&nowIdx<=x.last.i);if(x){const c=col(x.e.ref),b=mins(x.s.end),after=b!==null&&nowM>=b+20&&!blocksOf(n).m.some(y=>y.first.i>x.last.i);lessons.push({...x.e,date:today()});
     html+=`<button type="button" class="tt-hero" data-i="${lessons.length-1}" style="--bg:${c[0]};--fg:${c[1]}" title="Sitzplan dieser Stunde öffnen"><small>${after?'LETZTE STUNDE HEUTE':'JETZT'}${x.first.i!==x.last.i?' · DOPPELSTUNDE':''}</small><b>${lbl(x.e.ref)}${tag(x.e)}</b><span><em>${esc(x.s.start||'')}–${esc(x.s.end||'')} · ${spanTxt(x)}</em><em>${esc(roomText(x.e.room))}</em></span></button>`}}
   const last=lastLesson();if(last){const c=col(last.ref);lessons.push(last);html+=`<button type="button" class="tt-last" data-i="${lessons.length-1}" style="--fg:${c[1]}" title="Sitzplan der zuletzt unterrichteten Klasse öffnen"><small>Zuletzt unterrichtet${last.date&&last.date!==today()?' · '+fmtD(new Date(last.date+'T12:00')):''}</small><b>${lbl(last.ref)}</b><span>${esc(roomText(last.room))}</span></button>`}
   /* kein Unterricht heute (Wochenende, frei): nächster Schultag */
   for(let k=0;k<10&&!(showDay.getDay()>=1&&showDay.getDay()<=5&&blocksOf(showDay).m.length);k++)showDay.setDate(showDay.getDate()+1);
   const isToday=dateStr(showDay)===today(),{td,m}=blocksOf(showDay),wk=td.week?' · <span class="tt-wk tt-wk-'+td.week.toLowerCase()+'">'+td.week+'-Woche</span>':'';
   html+=`<h4>${isToday?'Heute · '+fmtD(showDay):'Nächster Schultag · '+fmtD(showDay)}${wk}</h4>`;if(!m.length)html+='<p class="tt-none">Kein Unterricht eingetragen</p>';
   for(const x of m){const c=col(x.e.ref),b=mins(x.s.end),cur=isToday&&nowIdx!==null&&nowIdx>=x.first.i&&nowIdx<=x.last.i,past=isToday&&b!==null&&b<nowM&&!cur;lessons.push({...x.e,date:dateStr(showDay)});
    html+=`<button type="button" class="tt-row${past?' is-past':''}${cur?' is-now':''}" data-i="${lessons.length-1}" style="--fg:${c[1]}" title="Sitzplan öffnen"><time>${esc(x.s.start||'')}–${esc(x.s.end||'')}<small class="tt-span">${spanTxt(x)}</small></time><b>${lbl(x.e.ref)}${tag(x.e)}</b><span>${esc(roomText(x.e.room))}</span></button>`}
  }
  html+='</div></section>';sh.innerHTML=html;document.body.append(sh);
  /* 11.15: iPhone hochkant – mit ‹ › oder Wischen nach links/rechts zwischen den Schultagen wechseln */
  if(sh.dataset.day){const step=d=>{const x=new Date(sh.dataset.day+'T12:00');do x.setDate(x.getDate()+d);while(x.getDay()===0||x.getDay()===6);openPlan({day:x});const b=document.querySelector('.tt-sheet .tt-body');if(b)b.scrollTop=0};
   sh.querySelectorAll('[data-dd]').forEach(b=>b.onclick=e=>{e.stopPropagation();step(+b.dataset.dd)});
   const bd=sh.querySelector('.tt-body');let x0=null,y0=0;bd.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});bd.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)step(dx<0?1:-1)},{passive:true})}
  const close=()=>sh.remove();sh.querySelector('.tt-x').onclick=close;sh.querySelector('.tt-edit')?.addEventListener('click',()=>{close();openEditor()});sh.querySelector('.tt-back').onclick=close;
  sh.querySelector('.tt-body').addEventListener('click',e=>{const b=e.target.closest('[data-i]');if(!b)return;const l=lessons[+b.dataset.i];close();applyLesson(l,b.classList.contains('tt-last')?'Zuletzt':(b.classList.contains('is-now')||b.classList.contains('tt-hero')?'Jetzt':'Stunde'))});
  /* iPhone drehen: Ansicht wechselt (quer = Woche, hochkant = Tag) */{const mq=matchMedia('(orientation:landscape)'),re=()=>{if(sh.isConnected)openPlan();mq.removeEventListener?.('change',re)};mq.addEventListener?.('change',re)}
  /* 9.10: Wegwischen entfällt – „Aktuell“ ist auf dem iPhone eine normale Seite */
 }
 window.classroomOpenPlan=openPlan;
 {const st=document.createElement('style');st.textContent='/* 10.85 Übersicht im Stundenplan-Design */'
  +'.tt-hero{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;margin:2px 0 10px;padding:14px 16px;border:0;border-radius:16px;background:var(--bg);color:var(--fg);font:inherit;text-align:left;cursor:pointer}.tt-hero small{font-size:11.5px;font-weight:800;letter-spacing:.03em;opacity:.85}.tt-hero b{font-size:21px;font-weight:750}.tt-hero span{display:flex;justify-content:space-between;width:100%;gap:10px;font-size:13.5px}.tt-hero em{font-style:normal}'
  +'.tt-sheet .tt-row,.tt-sheet .tt-last{border-left:6px solid var(--fg,#dbe3ef)}.tt-sheet .tt-row.is-now{outline:3px solid #2f5f9b;outline-offset:1px;background:#fff;border-color:#dbe3ef;border-left-color:var(--fg)}'
  +'.tt-wgrid{display:grid;grid-template-columns:44px repeat(5,minmax(0,1fr));gap:4px;padding-top:2px}.tt-wh{font-size:12px;font-weight:700;color:#66758a;text-align:center;padding:2px 0 4px}.tt-wh.on{color:#2f5f9b}.tt-wt{grid-column:1;font-size:11px;color:#66758a;display:flex;flex-direction:column;justify-content:center;line-height:1.15}.tt-wt small{font-size:10px;color:#8794a7}'
  +'.tt-wb{display:flex;flex-direction:row;flex-wrap:wrap;column-gap:6px;align-content:center;align-items:baseline;min-width:0;padding:3px 7px;border:0;border-radius:8px;background:var(--bg);color:var(--fg);font:inherit;text-align:left;cursor:pointer;overflow:hidden}.tt-wb b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.tt-wb small{font-size:10.5px;opacity:.85;white-space:nowrap}.tt-wb.is-now{outline:3px solid #2f5f9b;outline-offset:1px}.tt-tl{position:relative;display:grid;grid-template-columns:50px 1fr;column-gap:8px;margin-top:4px}.tt-tlt{grid-column:1;font-size:12px;color:#66758a;text-align:right;padding-top:3px;line-height:1.2}.tt-tlt small{display:block;font-size:10.5px;color:#8794a7}.tt-tlb{grid-column:2;display:flex;flex-direction:column;justify-content:flex-start;padding-top:8px!important;align-items:flex-start;gap:1px;min-width:0;padding:5px 12px;border:0;border-radius:11px;background:var(--bg);color:var(--fg);font:inherit;text-align:left;cursor:pointer}.tt-tlb{overflow:hidden}.tt-tlb b,.tt-tlb small{position:relative;z-index:3;text-shadow:0 0 3px var(--bg),0 0 3px var(--bg)}.tt-tlb b,.tt-tlb small{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tt-tlb b{font-size:15px}.tt-tlb small{font-size:11.5px;opacity:.85}.tt-tlb.is-past{opacity:.5}.tt-tlb.is-now{outline:3px solid #2f5f9b;outline-offset:1px}.tt-nowline{position:absolute;left:50px;right:0;height:2px;background:#d1453b;pointer-events:none;z-index:1}.tt-nowline::before{content:"";position:absolute;left:-5px;top:-4px;width:10px;height:10px;border-radius:50%;background:#d1453b}.tt-land .tt-head{padding:0 12px 2px 16px}.tt-land .tt-head .tt-x{height:30px}.tt-land .tt-grab{margin:5px auto 2px}.tt-land .tt-body{padding-top:2px!important}.tt-land .tt-wt{flex-direction:row;align-items:center;gap:3px}';document.head.append(st)}
 {const st=document.createElement('style');st.textContent='.tt-sheet{position:fixed;inset:0;z-index:9700}.tt-back{position:absolute;inset:0;background:#1c2b4655}'
  +'.tt-panel{position:absolute;left:0;right:0;bottom:0;max-height:82vh;display:flex;flex-direction:column;background:#fff;border-radius:20px 20px 0 0;box-shadow:0 -12px 34px #1c2b4633;padding-bottom:env(safe-area-inset-bottom)}'
  +'.tt-grab{width:40px;height:5px;border-radius:3px;background:#cbd6e5;margin:8px auto 4px}.tt-head{display:flex;align-items:center;justify-content:space-between;padding:4px 16px 8px}.tt-head b{font-size:17px}.tt-x{width:40px;height:40px;border:0;background:none;color:#66758a;font-size:17px}'
  +'.tt-dnav{display:flex;align-items:center;gap:6px;margin:8px 0 6px}.tt-dnav h4{flex:1;text-align:center;margin:0!important}.tt-dp{width:40px;height:40px;flex:none;border:1px solid #dbe3ef;border-radius:10px;background:#fff;color:#2f5f9b;font-size:22px;line-height:1;padding:0}'+'.tt-body{overflow:auto;padding:0 14px 16px}.tt-body h4{margin:14px 2px 6px;font-size:13px;color:#66758a;font-weight:700}.tt-none,.tt-empty{margin:4px 2px;color:#8794a7;font-size:14px;line-height:1.45}'
  +'.tt-row,.tt-last{display:grid;grid-template-columns:92px 1fr auto;align-items:center;gap:8px;width:100%;min-height:48px;margin:0 0 6px;padding:0 12px;border:1px solid #dbe3ef;border-radius:12px;background:#fff;color:#243247;font:inherit;text-align:left;cursor:pointer}'
  +'.tt-row time{font-size:13px;color:#66758a;font-variant-numeric:tabular-nums;line-height:1.25}.tt-row time .tt-span{display:block;font-size:11px;color:#8794a7}.tt-row b,.tt-last b{font-size:15px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tt-row span,.tt-last span{font-size:13px;color:#66758a;white-space:nowrap}'
  +'.tt-row.is-past{opacity:.6}.tt-row.is-now{border-color:#8fb0dc;background:#eaf0fa}'
  +'.tt-last{grid-template-columns:1fr auto;grid-template-rows:auto auto;min-height:58px;padding:8px 12px;margin-top:2px;background:#f7f9fc}.tt-last small{grid-column:1/-1;font-size:12px;color:#66758a}'
  +'.tt-toast .tt-more{font-weight:650}.tt-wk{display:inline-block;padding:1px 8px;border-radius:999px;font-size:11.5px;font-weight:800}.tt-wk-a{background:#dcefe3;color:#1f6a3e}.tt-wk-b{background:#fde9cf;color:#8a4b0c}.tt-tag{display:inline-block;font-style:normal;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:5px;margin-left:6px;vertical-align:1px}';document.head.append(st)}
 async function applyLesson(lesson,prefix){
  const [subject,classId]=lesson.ref.split('::');
  let before={};try{before=classroomNotes.contentWindow.classroomCurrentSelection()||{}}catch{}
  try{
   if(before.subject!==subject||before.classId!==classId)await classroomCall(classroomNotes,'classroom:select-class',{subject,classId});
   if(typeof selectView==='function')selectView('sitzplan');
   await classroomEnsureSeats();await selectRoom(lesson.room);
   /* 8.01: Datum der Stunde im Sitzplan setzen (heute bzw. Tag der zuletzt unterrichteten Stunde) */
   const setDate=()=>{try{const w=classroomSeats.contentWindow,inp=w.classroomDateInput,d=lesson.date&&lesson.date<=today()?lesson.date:today();if(inp&&inp.value!==d){inp.value=d;inp.dispatchEvent(new w.Event('input',{bubbles:true}));inp.dispatchEvent(new w.Event('change',{bubbles:true}))}}catch{}};
   /* der Sitzplan setzt beim Klassenwechsel das Datum ggf. selbst zurück – daher kurz danach noch einmal */setDate();setTimeout(setDate,700);setTimeout(setDate,1800);
   const label=classOptions().find(o=>o.ref===lesson.ref)?.label||'';
   const changed=before.subject!==subject||before.classId!==classId;
   /* 8.65: keine Meldung mehr beim automatischen Wechsel zur Stunde (Wunsch: nervt) */void label;void changed;
  }catch(error){console.warn('Stundenplan: Auswahl nicht möglich',error)}
 }
 window.classroomApplyTimetable=apply;
 // Beim Start (nachdem der Noten-Manager bereit ist) und nach einer Pause von mindestens 10 Minuten.
 let started=false,hiddenAt=0;
 /* 11.25: iPhone öffnet immer mit dem Stundenplan (Datenschutz: beim Öffnen sind keine Namen und Noten zu sehen) – beim Start und nach jeder Pause von über einer Minute */
 const phoneStart=()=>{if(!document.documentElement.classList.contains('is-phone'))return;try{if(!document.querySelector('.tt-sheet'))openPlan()}catch{}};
 const start=()=>{if(started)return;started=true;setTimeout(async()=>{try{await apply()}catch{}phoneStart()},1200)};
 window.addEventListener('message',e=>{if(e.data?.type==='classroom:noten-ready')start()});
 setTimeout(start,6000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')hiddenAt=Date.now();else{const away=hiddenAt?Date.now()-hiddenAt:0;if(hiddenAt&&away>=10*60000)apply();if(hiddenAt&&away>=60000)phoneStart()}});
 setInterval(()=>{if(document.visibilityState==='visible'&&!document.querySelector('dialog[open]'))apply()},60000);

 const style=document.createElement('style');style.textContent=
  '.tt-dialog{width:min(1100px,calc(100vw - 24px));max-height:calc(100dvh - 32px);padding:20px 22px;border:1px solid #dce3ef;border-radius:18px;background:#fff;color:#24334b;box-shadow:0 18px 60px #1c2b4630;font:14px/1.4 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}.tt-dialog[open]{display:flex;flex-direction:column}.tt-dialog::backdrop{background:#1c2b4638}'
  +'.tt-head h2{margin:0;font-size:1.2rem}.tt-head p{margin:2px 0 12px;color:#66758a;font-size:.86rem}.tt-wrap{overflow:auto;border:1px solid #e6ebf3;border-radius:12px}'
  +'.tt-dialog table{border-collapse:collapse;width:100%;min-width:860px}.tt-dialog th,.tt-dialog td{padding:6px;border-top:1px solid #e6ebf3;vertical-align:top}.tt-dialog thead th{position:sticky;top:0;background:#f8fafd;color:#66758a;font-size:.8rem;border-top:0;text-align:left}'
  +'.tt-dialog tbody th{white-space:nowrap;text-align:left;font-weight:500}.tt-dialog input[type=time]{width:84px;padding:3px 4px;border:1px solid #cbd6e5;border-radius:7px;font:inherit;margin-right:3px}'
  +'.tt-del{width:26px;height:26px;border:1px solid #e3c4c0;border-radius:7px;background:#fff;color:#b42318;cursor:pointer;vertical-align:middle}'
  +'.tt-dialog td select+select{margin-top:4px;color:#4a5b73}.tt-dialog td select,.tt-dialog td input[type=text]{display:block;box-sizing:border-box;width:100%;min-width:130px;padding:4px 6px;border:1px solid #cbd6e5;border-radius:7px;background:#fff;font:inherit;font-size:13px}.tt-dialog td input[type=text]{margin-top:4px;color:#4a5b73}'
  +'.tt-ab{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin:0 0 12px;padding:10px 12px;border:1px solid #e3e9f1;border-radius:12px;background:#f6f8fb;font-size:13.5px}.tt-ab-l{font-weight:650}'
  +'.tt-seg2{display:inline-flex;background:#e9eef5;border-radius:999px;padding:3px}.tt-seg2 button{border:0;background:none;padding:5px 12px;border-radius:999px;font:inherit;font-size:13px;color:#4a5b73;cursor:pointer}.tt-seg2 button.on{background:#fff;color:#1f2a3d;font-weight:650;box-shadow:0 1px 3px #0002}'
  +'.tt-ab-now{margin-left:auto;color:#4a5b73}.tt-wk{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:800}.tt-wk-a{background:#dcefe3;color:#1f6a3e}.tt-wk-b{background:#fde9cf;color:#8a4b0c}'
  +'.tt-anchors{flex-basis:100%;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}.tt-anchor{display:flex;align-items:center;gap:6px}.tt-anchor input,.tt-anchor select{padding:4px 6px;border:1px solid #cbd6e5;border-radius:7px;font:inherit;font-size:13px;background:#fff}.tt-anchor-add{border:0;background:none;color:#2f5f9b;font:inherit;font-size:13px;cursor:pointer;padding:4px 2px}'
  +'.tt-weeks{flex-basis:100%;display:flex;gap:6px;flex-wrap:wrap}.tt-wkc{min-width:58px;text-align:center;font-size:11.5px;color:#4a5b73;border:1px solid #e3e9f1;border-radius:8px;padding:3px 6px;background:#fff}.tt-wkc b{display:block;font-size:13px}.tt-wkc-a{background:#f1f9f4}.tt-wkc-b{background:#fff7ec}.tt-wkc.now{outline:2px solid #2f6fd6}'
  +'.tt-rh button.on[data-rh$=":all"]{background:#e3e9f1;color:#4a5b73}'
  +''
  +''
  +'.tt-key{display:inline-block;padding:0 7px;border-radius:6px;background:#eef4ff;border:1px solid #9fbbe6;color:#24477a;font-size:.78rem}'
  +'.tt-foot{display:flex;gap:10px;align-items:center;margin-top:14px}.tt-foot span{flex:1}.tt-foot button{min-height:38px;padding:7px 16px;border:1px solid #cbd6e5;border-radius:10px;background:#fff;color:var(--primary,#2f5f9b);font:inherit;font-weight:600;cursor:pointer}.tt-foot .tt-primary{background:var(--primary,#2f5f9b);border-color:var(--primary,#2f5f9b);color:#fff}'
  +'.tt-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2000;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;border-radius:12px;background:#24334b;color:#fff;box-shadow:0 10px 30px #1c2b4640;font:14px/1.3 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}'
  +'@media (max-width:540px) and (orientation:portrait){.tt-toast{top:calc(env(safe-area-inset-top) + 64px);bottom:auto;left:12px;right:12px;transform:none}.tt-toast span{flex:1}}'
  +'.tt-toast button{border:1px solid #ffffff55;border-radius:8px;background:none;color:#fff;padding:4px 10px;font:inherit;cursor:pointer}.tt-toast .tt-toast-x{border:0;font-size:18px;padding:0 4px}';
 document.head.append(style);
})();

/* 10.77/10.79: Mac/iPad – Doppelschalter rechts neben der Hilfe: [Uhr = laufende Stunde | Uhr rückwärts = zuletzt unterrichtet].
   Läuft keine Stunde bzw. gibt es keine letzte, öffnet sich die Übersicht (heute, morgen, zuletzt). */
(()=>{if(window.parent!==window)return;
 const SV='width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
 const NOW='<svg '+SV+'><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',LAST='<svg '+SV+'><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></svg>';
 const tips=g=>{let i={};try{i=window.classroomLessonInfo?.()||{}}catch{}const a=g.querySelector('.cn-now'),b=g.querySelector('.cn-last');
  a.title=i.now?'Jetzt: '+i.now+' – zum Sitzplan der laufenden Stunde':'Aktuelle Klasse laut Stundenplan (gerade keine Stunde – zeigt die Übersicht)';b.title=i.last?'Zuletzt: '+i.last+' – zum Sitzplan der zuletzt unterrichteten Klasse':'Zuletzt unterrichtete Klasse (noch keine – zeigt die Übersicht)'};
 /* 10.83: Pillen mit Klassenkürzel – Jetzt blau, Zuletzt grau. 8d → 8d, EK1e28 → EK1, Q1 → Q1 (höchstens 4 Zeichen) */
 const short=lbl=>{let x=String(lbl||'').split(' · ').pop().replace(/^Klasse\s+/i,'').trim();if(!x)return '';if(/^\d{1,2}[a-zA-Z]?$/.test(x))return x;const m=/^([A-Za-zÄÖÜäöü]{0,3})(\d)?/.exec(x);const r=m&&(m[1]+(m[2]||''));return (r||x).slice(0,4)};
 function pills(g){let i={};try{i=window.classroomLessonInfo?.()||{}}catch{}for(const [sel,v] of [['.cn-now',short(i.now)],['.cn-last',short(i.last)]]){const b=g.querySelector(sel);let p=b.querySelector('.cn-pill');if(!v){p?.remove();continue}if(!p){p=document.createElement('span');p.className='cn-pill';p.setAttribute('aria-hidden','true');b.append(p)}if(p.textContent!==v)p.textContent=v}}
 function place(){const a=document.querySelector('.classroom-global-actions');if(!a)return;let g=a.querySelector('.classroom-now-split');
  if(!g){g=document.createElement('div');g.className='classroom-now-split';g.setAttribute('role','group');g.setAttribute('aria-label','Aktuelle Klasse');
   g.innerHTML='<button type="button" class="cn-now" aria-label="Jetzt: laufende Stunde">'+NOW+'</button><button type="button" class="cn-last" aria-label="Zuletzt unterrichtete Klasse">'+LAST+'</button>';
   g.querySelector('.cn-now').onclick=()=>window.classroomGoCurrent?.();g.querySelector('.cn-last').onclick=()=>window.classroomGoLast?.();g.addEventListener('pointerenter',()=>tips(g));g.addEventListener('focusin',()=>tips(g));tips(g)}
  /* nur einmal anhängen – Reihenfolge per CSS (order) */if(!g.isConnected){a.append(g);pills(g)}}
 setInterval(()=>{const g=document.querySelector('.classroom-now-split');if(g&&document.visibilityState==='visible')pills(g)},30000);addEventListener('storage',e=>{if(e.key==='notenrechner-stundenplan-v1'){const g=document.querySelector('.classroom-now-split');if(g)pills(g)}});window.classroomNowPills=()=>{const g=document.querySelector('.classroom-now-split');if(g)pills(g)};
 const st=document.createElement('style');st.textContent='.classroom-global-actions>.classroom-help-button{order:-3}.classroom-global-actions>.classroom-now-split{order:-2}.classroom-global-actions>.classroom-privacy-button{order:-1}'
  +'.classroom-now-split{display:inline-flex;align-items:stretch;flex:none;box-sizing:border-box;height:40px;border:1px solid #a8bdd8;border-radius:10px;background:#fff}.classroom-now-split>button:first-child{border-radius:9px 0 0 9px!important}.classroom-now-split>button:last-child{border-radius:0 9px 9px 0!important}.classroom-now-split>button{position:relative}'+'.cn-pill{position:absolute;top:-9px;right:-8px;z-index:2;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:20px;height:18px;padding:0 5px;border-radius:9px;border:2px solid #fff;background:#2f5f9b;color:#fff;font:700 10.5px/1 system-ui,-apple-system,sans-serif;white-space:nowrap;pointer-events:none}.cn-last .cn-pill{background:#8a9ab0}'
  +'.classroom-now-split>button{display:inline-flex;align-items:center;justify-content:center;width:38px;height:100%;padding:0;margin:0;border:0;border-radius:0;background:transparent;color:#2f5f9b;cursor:pointer}.classroom-now-split>button+button{border-left:1px solid #cbd6e5}/* 10.92: Hover füllt die ganze Hälfte bis an den Rahmen (wie beim Backup-Schalter) */html body .classroom-global-actions>.classroom-now-split>button:not(#_):not(#__){isolation:isolate;height:38px!important;min-height:0!important;max-height:38px!important;margin:0!important}.classroom-now-split>button:hover{background:#e8f0fb!important}.classroom-now-split>.cn-now{z-index:2}.classroom-now-split>.cn-last{z-index:1}.classroom-now-split>button:focus-visible{outline:2px solid #8fb0dc;outline-offset:-2px}'
  +'@media screen and (max-width:540px) and (orientation:portrait),screen and (max-height:500px) and (orientation:landscape) and (pointer:coarse){.classroom-global-actions>.classroom-now-split{display:none!important}}'
  +'@media (min-width:700px) and (min-height:501px){.tt-sheet .tt-panel{left:50%;right:auto;top:84px;bottom:auto;width:min(480px,92vw);max-height:calc(100vh - 120px);transform:translateX(-50%);border-radius:16px;box-shadow:0 18px 50px #1c2b4640}.tt-sheet .tt-grab{display:none}.tt-sheet .tt-head{padding-top:12px}}'
  +'.tt-edit{margin:12px 2px 4px;height:40px;padding:0 16px;border:1px solid #2f5f9b;border-radius:10px;background:#2f5f9b;color:#fff;font:inherit;font-weight:600;cursor:pointer}';
 document.head.append(st);
 const go=()=>{place();const a=document.querySelector('.classroom-global-actions');if(a&&!a.__nowWatch){a.__nowWatch=true;new MutationObserver(()=>place()).observe(a,{childList:true})}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();let n=0;const iv=setInterval(()=>{go();if(++n>20)clearInterval(iv)},500)})();
;

/* ==== help.js ==== */
/* Hilfe: „?“-Button oben rechts öffnet kurze Anleitungen in Kapiteln, mit Suche.
   Geöffnet wird das Kapitel des gerade aktiven Managers. Der Inhalt steht in window.classroomHelpContent
   (wird auch für die ausdruckbare Kurzanleitung verwendet). */
(()=>{
 const C=window.classroomHelpContent=[
  // „Neu“: die letzten 10 neuen Funktionen (neueste oben, [Titel, Text, Wo, Version]) – bei jeder Version pflegen.
  {id:'neu',title:'Neu',cards:true,news:true,items:[['Vorschau: mit den Pfeiltasten durch die Stationen','In der Vorschau einer Lerneinheit blätterst du mit → zur nächsten und mit ← zur vorigen Station (← auf Station 1 führt zur Übersicht). Der Knopf „Als Schüler starten“ heißt jetzt „Von vorn beginnen“. Auf dem iPhone öffnet „Was ist neu?“ nach einem Update wieder zuverlässig die Seite „Neu“ in der Hilfe.','Unterricht › Einheit › Vorschau','11.61'],['Ein Knopf für alle Dateien · Backup zeigt fehlende Reihen','Unter Unterricht gibt es nur noch „Datei laden …“: Reihen öffnen ihren Dialog, Vokabel- und Grammatik-Pakete, Texte und Einheiten werden wie bisher zusammengeführt. „Exportieren …“ heißt jetzt „Inhalte exportieren …“. Im Backup-Fenster zeigt „Schulbuchmaterial“, welche Reihen nur auf diesem Gerät liegen und wie groß das Material ist. Die Einheiten-Seite ist aufgeräumt (ohne „Grundlagen“ und ohne die Kacheln L und V).','Unterricht › Datei laden','11.60'],['Reihen mit Änderungen weitergeben','„Reihe exportieren“ speichert jetzt auch deine Änderungen an den Lernpaketen der Lektionen mit. Lädst du die Datei auf dem iPad, ist die Reihe dort genauso geordnet und benannt – auch ausgeblendete Einträge lassen sich dort wieder einblenden.','Unterricht › Reihe exportieren','11.59'],['Latein: Pontes-Sequenzen als Reihen','Auch in Latein lädst du jetzt ganze Sequenzen mit „Reihe laden“, z. B. „15–19 Die römische Republik“ – mit Inhaltsverzeichnis, Grammatik, Übersetzungstexten, Lernpaketen und Alternativer Lateinarbeit. Die Seitenleiste zeigt jede Sequenz, die eine Lektion deines Jahrgangs enthält; Lektionen anderer Jahrgänge sind blass. Mit dem Stift ordnest du die Sequenz (z. B. die Transitio-Lektionen T1–T4) und in jeder Lektion die Lernpakete je Abschnitt: verschieben, umbenennen, ausblenden, löschen, eigene Einträge. Neue Lernpakete kommen künftig ohne App-Update.','Unterricht › Reihe laden','11.58'],['Unterrichtsreihen als Datei laden, bearbeiten und entfernen','Lerneinheiten gehören nicht mehr fest zur App: Unter Unterricht lädst du mit „Reihe laden“ eine ganze Reihe als eine Datei (.cmreihe) – mit Inhaltsverzeichnis, allen Einheiten und dem Schulbuchmaterial. Die App sortiert sie beim passenden Fach und Jahrgang ein; neue Einheiten brauchen kein App-Update mehr. Tippe links auf den Namen der Reihe: Mit dem Stift verschiebst du Einträge am Griff, benennst sie um, blendest sie aus, löschst sie oder fügst eigene Einträge hinzu (z. B. Test). „Reihe exportieren“ speichert deine Fassung als Datei, „Reihe entfernen“ nimmt sie vom Gerät – die Noten bleiben. Die Schüler-iPads bekommen eine Einheit einmal per „Einheit per AirDrop“, danach genügt der Start-QR.','Unterricht › Reihe laden','11.57'],['Neue Lerneinheit: Tageszeitenklima in den Tropen · Textmaterial als Text','Erdkunde 7 (AFB I, 10 Stationen, 20 Minuten): Klimadiagramme vergleichen (M1), Tageszeitenklima und Jahreszeitenklima, ein Tag im Regenwald (M3, M4), warum es jeden Nachmittag regnet und die beiden Wasserkreisläufe (M5, M6). Außerdem zeigen alle Lerneinheiten Tabellen, Listen und Textkästen aus der Schulbuch-Datei jetzt als echten Text statt als Bild – schärfer und deutlich kleiner. Lade dazu die neuen .cmeinheit-Dateien.','Unterricht › Lerneinheiten','11.56'],['Neue Lerneinheit: Was heißt Globalisierung?','Einstieg in die Reihe Globale Verflechtungen (Erdkunde 9, AFB I, 10 Stationen, 20 Minuten): das Wort Globalisierung, die Fotos aus M2, die fünf Verflechtungsbereiche (M4), die Erfindung wichtiger Medien (M1), die Entwicklung der Globalisierung (M3) und das Beispiel „Despacito“ (M5).','Unterricht → Erdkunde 9','11.55'],['Lateinarbeit in die Noten · vier neue Erdkunde-Einheiten','„In die Noten übernehmen …“ legt die Alternative Lateinarbeit als Klassenarbeit an: Notengrenzen aus ihrem Notenschlüssel, Eingabe je Schüler in A · B · C, die Summe zählt. Neue Lerneinheiten Erdkunde 9: Global Player, Gewusst – gekonnt: Globale Verflechtungen, Smartphone, Fast Fashion. Alle Lerneinheiten zeigen mit Schulbuch-Datei zuerst „Material ansehen“.','Unterricht · Noten','11.54'],['Alternative Lateinarbeit · alle Pontes-Lektionen','Ab Lektion 15 hat jede Lektion den Abschnitt 7 „Alternative Lateinarbeit“: Klassenarbeit nach den Grundsätzen der Schule (A Sprache 25–30 %, B Text 35–40 %, C Kontext 35–40 %). Die Arbeit selbst kommt aus einer privaten Datei; in der Vorschau zeigt „Lösungen“ den Erwartungshorizont, „Drucken / als PDF“ druckt Schülerfassung oder Erwartungshorizont. In der Seitenleiste blendet „Alle Lektionen von Pontes einblenden“ auch die anderen Jahrgänge ein.','Unterricht → Latein','11.53'],['Neue Lerneinheit: Die Gliederung der Tropen (Erdkunde 7)','Neue Lerneinheit „Die Gliederung der Tropen“ (Erdkunde 7, AFB I, 10 Stationen, 20 Minuten): Landschaftszonen von der Wüste bis zum Regenwald, arid und humid, Passat und Passatkreislauf, wandernder Zenitalregen und das Klimadiagramm von Timbuktu – mit eigenen Abbildungen, mit der Schulbuch-Datei auch mit M1–M5 und Info 2.','Unterricht → Erdkunde 7','11.52']]},
  {id:'start',title:'Erste Schritte',items:[
   ['Alles bleibt auf deinem Gerät','Der Classroom-Manager speichert alle Daten nur im Browser dieses Geräts – ohne Cloud und ohne Konto. Deshalb sind regelmäßige Backups wichtig (siehe „Backup und Datenschutz“).'],
   ['Zwei Bereiche','Oben wechselst du zwischen Unterrichts-Manager (Sitzplan, Mitarbeit und Hausaufgaben im Unterricht) und Noten-Manager (Bewertungen, Tests, Klausuren, Zeugnisnoten). Beide nutzen dieselben Klassen und Schülerlisten.'],
   ['Navigation','Die Leiste unter der Kopfzeile zeigt, wo du bist: Fach › Klasse › Halbjahr › Quartal › Bereich. Ein Klick auf den Pfeil links (oder auf die Leiste) klappt das vollständige Auswahlmenü auf, ein zweiter Klick auf die Leiste klappt es wieder ein (ebenso ein Klick daneben oder Esc).'],
   ['Fach und Klasse anlegen','Im aufgeklappten Menü mit „+ Fach“ und „+ Klasse“. Beim Anlegen der Klasse wählst du das Notensystem: Noten (Sek I) oder Notenpunkte (Oberstufe). Die Namen lassen sich einfügen oder aus einer Datei übernehmen (Excel, CSV, TXT, JSON oder das Klassenlisten-PDF der Schule). Beim PDF sucht die App die Seite mit dem eingegebenen Klassennamen (z. B. „5a“), übernimmt Namen und Geschlecht und vergleicht die Anzahl mit der Fußzeile des PDF; die Geschlechter verbessern zugleich die Vorschläge („Gelernte Namen“). Auch Kurslisten der Oberstufe werden erkannt: „EK1e28“ findet den Kurs über den Kurscode, „11a“ im Fach Erdkunde die Seite „Erdkunde 11a“; das Notensystem wird auf Notenpunkte gestellt, das Geschlecht aus dem Vornamen vorgeschlagen (bitte prüfen). Das PDF wird nur auf dem Gerät gelesen. Das Zahnrad neben einer Zeile öffnet Umbenennen und Löschen.'],
   ['Schülerliste','Im Noten-Manager mit „+ Schüler:in“ oder durch Einfügen einer kopierten Namensliste (z. B. aus Excel). Die Klassenliste gilt in allen Fächern und im Sitzplan; Änderungen werden überall übernommen.'],
   ['Geschlecht','In der „Schülerübersicht“ schaltet „Geschlecht“ (oben) die Liste auf m | w um: Antippen wählt m oder w, erneutes Antippen hebt die Auswahl auf; Änderungen gelten sofort. Für Personen ohne Angabe schlägt die App m oder w aus dem Vornamen vor (gestrichelt) – „Fertig“ übernimmt die Vorschläge. Die App lernt unbekannte Vornamen, die du festlegst.'],
   ['Rückgängig','„Rückgängig“ oben rechts (links neben „Backup“) nimmt die letzte Änderung zurück. Orange bedeutet: Es gibt etwas zum Zurücknehmen.'],
   ['Erinnerungen','Die Glocke oben rechts erinnert, wenn jemand im laufenden Halbjahr zum 3. bzw. 5. Mal Hausaufgaben oder Material vergessen hat (roter Punkt = Anzahl offener Erinnerungen; am iPhone erscheint die Glocke nur dann). Je Person: „Elternbrief verfassen“ (Text kopieren oder als Mail öffnen), „Erledigt“, „Später“ oder „Nicht nötig“ (erst beim nächsten Fehlen wieder). „Erledigt“ unten ist ausklappbar. „Vorlagen …“ ändert die vier Brieftexte samt Unterschrift; das Fenster schließt dort nur über „Abbrechen“ oder „Speichern“.']]},
  {id:'sitzplan',title:'Unterrichts-Manager',items:[
   ['Raum und Datum','Die Einstellungsleiste links (☰ in der Zoomleiste blendet sie ein und aus; auf dem iPad hochkant anfangs eingeklappt, quer eingeblendet) enthält Raum, Datum und gespeicherte Sitzpläne. „+ Raum“ legt einen weiteren Raum an, der Stift benennt ihn um. Das Datum bestimmt, auf welcher Mitarbeitsseite Bewertungen landen.'],
   ['Tische setzen','„Sitzplan bearbeiten“ öffnet den Bearbeiten-Modus (orange Leiste über dem Plan): Ein Klick setzt oder entfernt einen Tisch, ein Rechtsklick setzt das Pult. „Tischanordnung …“ bietet fertige Vorlagen. „Fertig“ übernimmt alles (auch eine gewählte Anordnung), „Abbrechen“ verwirft die Auswahl.'],
   ['Schüler verteilen','In der Seitenleiste legst du die Verteilung fest: einzeln, Zufallspaare, gleichgeschlechtliche oder feste Paare, dazu Tabu-Paare (nicht nebeneinander) und Anker (feste Plätze). „Verteilen“ setzt alle auf die Tische; „Schüler zuweisen“ setzt eine einzelne Person an einen freien Tisch. Namen lassen sich per Ziehen tauschen.'],
   ['Im Unterricht bewerten','Bewerten ist der Normalzustand: Ein kurzer Klick auf einen Namen öffnet das Bewertungsfenster für Mitarbeit, „Hausaufgabe fehlt“ und „Material fehlt“; unten „Abwesend“ (rot, wenn aktiv) und „Notiz“ (klappt ein Textfeld auf; „Notiz •“ = es gibt schon eine). Die Einträge landen automatisch im Noten-Manager auf der Seite zum gewählten Datum.'],
   ['Werkzeuge','„Zufallsauswahl“ wählt eine Person aus. „Schüler finden“ markiert schon beim Tippen alle passenden Plätze blau (Vor- oder Nachname); bei genau einem Treffer öffnet Enter das Bewertungsfenster (Esc oder ein Klick daneben beendet die Suche). „Rollen“ verschiebt alle Reihen nach vorn oder hinten (nicht im Gruppenmodus). „Perspektive“ dreht den Plan in die Sicht der Klasse.'],
   ['Zufallsgruppen','„Zufallsgruppen“ neben „Zufallsauswahl“ teilt die Klasse in Gruppen ein, ohne die Sitzordnung zu ändern: nach Anzahl der Gruppen oder Gruppengröße, Abwesende werden ausgelassen, Tabu-Paare getrennt, auf Wunsch gemischt m/w. „Neu mischen“, „Groß zeigen“ für den Beamer und „Drucken“.'],
   ['Hinweise am Tisch','Roter Rahmen: Hausaufgabe fehlt heute – ab der dritten fehlenden im Halbjahr wird er mit jeder weiteren dicker. Oranges „M“ unten links: Material fehlt (ab dem 3. Mal mit Anzahl). Getönter Tisch mit „1/3“: weniger als 3 mündliche Noten im Halbjahr – erscheint erst, wenn jemand schon 3 hat und die letzte Bewertung 2 Stunden her ist. Gezählt wird übers Halbjahr (das 1. bzw. 3. Quartal zählt mit).'],
   
   ['Bewertungen im Sitzplan','Der Schalter „Bewertungen“ über dem Sitzplan blendet Bewertungsfarben, fehlende Hausaufgaben und die Hinweise an den Tischen ein oder aus; im Gruppenmodus erscheinen dann die Gruppenfarben. Die Einträge bleiben erhalten.'],
   ['Stundenplan','Klick auf „Schuljahr …“ rechts in der Navigationsleiste → „Stundenplan …“: nur die Stundenzeiten eintragen. Welche Klasse wann Unterricht hat, erkennt die App aus deinen Eingaben zum heutigen Datum (auch in der Pause direkt nach der Stunde); ab zwei Wochen mit derselben Klasse in derselben Stunde gilt sie als erkannt (blau markiert). Eigene Einträge haben Vorrang. Während einer Stunde (ab 10 Minuten vorher) wählt die App beim Öffnen automatisch Klasse und Raum – einmal pro Stunde; „Rückgängig“ im Hinweis stellt die vorherige Auswahl wieder her.'],
   ['Zoom','Der Plan steht waagerecht in der Mitte. Am Mac wird er immer mit 100 % gezeigt (ist er breiter als die Fläche, scrollt er seitlich), auf dem iPad automatisch eingepasst – auch größer als 100 %. −/+, Regler, „100 %“ und „Einpassen“ passen ihn manuell an. Die Leiste bleibt einzeilig: Ist sie zu schmal, stehen „Bewertungen“, „100 %“ bzw. „Einpassen“ im Menü „Mehr“ ganz rechts.'],
   ['Mehr','Im Menü „Mehr“ unter dem Plan: „Vorlage speichern“ (aktuelle Tische als eigene Anordnung) und „Zurücksetzen …“. Ist die Buttonreihe zu schmal, stehen dort oben zusätzlich die Buttons, die nicht mehr in die Zeile passen – zuerst „Drucken“, dann „Rollen“, „Zufallsgruppen“ usw. „Schüler zuweisen“ (links) und „Verteilen“ (rechts) bleiben immer sichtbar.']]},
  {id:'noten',title:'Noten-Manager',items:[
   ['Buttonleisten','Auf jeder Seite gleich aufgebaut: oben rechts die Anzeige-Schalter (je nach Seite „1. Quartal“, „Kompaktansicht“, Sortierung „A–Z | 1–6“, Markierung Aus · Nur Farbe · Rahmen · Schraffur) und „Drucken“. Darunter nur Buttons: links „Schülerübersicht“ und „+ Schüler:in“, rechts z. B. „Import …“, „Notenspiegel“ und „Eingaben löschen“ (rot). Schalter, die nur eine Spalte betreffen (z. B. Dezimal/Tendenz/Gerundet), stehen im Tabellenkopf.'],
   ['Sortieren','„A–Z | 1–6“ (bei Notenpunkten „15–0“) sortiert die Anzeige – die beste Note steht vorn, an den Daten ändert sich nichts. Ein zweiter Tipp auf den aktiven Knopf dreht die Reihenfolge um (Z–A bzw. 6–1 / 0–15). Sortiert wird nach der Endnote der Seite (Ergebnis, Testmittel, Quartalsmittel, Durchschnitt, Quartals- oder Halbjahresnote); bei Hausaufgaben und Material nach der Anzahl „Fehlend“ (z. B. 3–0). Wer noch keine Note hat („offen“), steht am schwachen Ende: bei 6–1 bzw. 0–15 ganz oben – so siehst du sofort, wer noch bewertet werden muss –, bei 1–6 bzw. 15–0 ganz unten. Während du in der Tabelle tippst, springt nichts. Die Wahl gilt je Gerät für alle Seiten.'],
   ['Mündliche Mitarbeit','Pro Quartal eine Seite mit einer Spalte je Datum. Bewertungen als Zeichen (++ bis --) oder Noten; der Mittelwert wird automatisch berechnet. Schraffuren zeigen Tendenzen (z. B. 2–3), die Kompaktansicht spart Platz. Unter jedem Datum kannst du eine Bezeichnung eintragen, z. B. „Kurzvortrag“ oder „Exkursion“. Sie erscheint in der Quartalsübersicht, in der Schülerübersicht, im Excel-Export und bei der Schnelleingabe im Unterrichts-Manager; an der Berechnung ändert sie nichts.'],
   ['Hausaufgaben und Material','Status als Symbol: ✓ erledigt, ✗ fehlt, E entschuldigt, A abwesend, – nicht geprüft. Ein Tipp aufs Symbol öffnet die Auswahl. Die Spalte „Fehlend“ zählt übers ganze Halbjahr – im 2. (4.) Quartal zählt das 1. (3.) mit. Ab drei fehlenden Hausaufgaben wird die Zahl rot – ein Klick darauf bereitet eine Eltern-Mail vor.'],
   ['Schülerübersicht','Zeigt für jede Person einer Klasse alle Bewertungen aus allen Fächern, Halbjahren und Quartalen sowie die Fehltage mit Datum. Bei mehreren Fächern steht oben „Fächer im Überblick“; „Fächer vergleichen“ stellt zwei Fächer für die ganze Klasse nebeneinander. Links die Klasse mit Fehltagen (sortierbar), rechts das Profil; „Drucken“ erstellt ein Blatt, z. B. für den Elternsprechtag. Geöffnet über „Schülerübersicht“ links in der Aktionszeile des Noten-Managers.'],
   ['Tests','Die Tests-Übersicht sammelt alle Tests eines Quartals. Tests mit Rohpunkten haben eine eigene Seite mit Punkteskala (auch für A/B-Gruppen); mit „Manuell“ legst du die Punktgrenzen selbst fest. Neue Tests mit „＋ Test“ im Kopf der rechten Spalte – das öffnet „Test erstellen“: mit Rohpunkten oder Fehlern auf einer Detailseite („Öffnen ›“) oder direkt in der Spalte. Bei Fehlern gibst du die höchste Fehlerzahl an (z. B. 20); jeder Fehler kostet einen Punkt, die Grenzen gelten wie bei Rohpunkten. Über der Ergebnisliste schaltest du zwischen Rohpunkte und Fehler um; auf der Testseite Thema, Datum, „Fortschritt“, „Notenspiegel“ und das Schloss zum Sperren nach der Rückgabe.'],
   ['Klassenarbeiten und Klausuren','Aufgaben mit Gewichtung in Prozent; Rohpunkte werden über Berechnungsseiten in Noten bzw. Notenpunkte umgerechnet. Beim Anlegen einer Klassenarbeit oder Klausur wählst du Rohpunkte, Fehler oder „Direkt“ (nur die Note eintragen, in der Sek. I mit Tendenz); gibt es eine Vorgabe des Fachs, ist sie schon ausgewählt. „Notenspiegel“ zeigt die Verteilung; darin lassen sich die Notengrenzen mit Schiebern verschieben. „Vergleichen“ (links neben „Drucken“) stellt den Notenspiegel neben andere zurückgegebene Arbeiten oder Tests – aus anderen Klassen oder Fächern: bis zu 3 weitere bei Notenpunkten (2×2), bis zu 5 bei Noten (3×2), in Anzahl oder Prozent, mit Ø-Unterschied und Druck. In der Oberstufe fügt „＋ Abzug“ eine Spalte für Sprachrichtigkeit hinzu (ab 5 Fehlern je Seite −1, ab 7 −2 Notenpunkte). Die Klassenarbeiten-Übersicht zeigt alle Arbeiten mit Gewicht, Durchschnitt und Klassenschnitt; „＋ Klassenarbeit“ legt eine neue an, „−“ entfernt eine. Das Schloss sperrt zurückgegebene Arbeiten.'],
   ['Fach-Einstellungen','Das Zahnrad bei „Fächer umbenennen“ öffnet die Einstellungen des Fachs (Fachkonferenz): Notengrenzen in Prozent je Note mit Tendenzen und 1+, für Klassenarbeiten, Tests und Klausuren jeweils die Eingabe „Rohpunkte | Fehler | Direkt“ (wird beim Anlegen vorausgewählt), im Reiter „Tests“ außerdem die Gewichtung innerhalb der Sonstigen Mitarbeit (Mündliche Mitarbeit : Tests) – sie gilt dann fest in allen Klassen und die Gewichtung Sonstige Mitarbeit : Klassenarbeit – getrennt für eine und für zwei Arbeiten im Halbjahr (z. B. 2/3 : 1/3 in der Sek. I). Bei der ersten Arbeit einer Klasse zeigt die App diese Vorgaben noch einmal an.'],
   ['Quartal und Halbjahr','„Quartalsnoten“ fasst ein Quartal zusammen: Mündliche Mitarbeit und Tests ergeben die Sonstige Mitarbeit (z. B. 80 % : 20 %; ohne Tests zählt die Mündliche Mitarbeit allein), rechts Selbsteinschätzung und deine Quartalsnote. Eine eingetragene Note ist maßgeblich, sonst gilt der berechnete Wert. Klassenarbeiten stehen nicht im Quartal, sondern beim Halbjahr: Im 2. Quartal zeigt dieselbe Seite zusätzlich Quartalsnote Q1, „SoMi · Halbjahr“ (Q1 und Q2 je zur Hälfte), die Klassenarbeit, „Halbjahr ∑“ (sofort neu berechnet, nach der Gewichtung des Fachs) und dein Feld für die Halbjahresnote. In der Oberstufe zählen gerundete Notenpunkte.'],
   ['Markierung der Noten','Aus · Nur Farbe · Rahmen · Schraffur (vier Symbole rechts oben): Tendenzen wie 2− schraffiert, eingerahmt oder nur farbig zeigen – oder bei „Aus“ alles weiß. 4 Notenpunkte bleiben schraffiert (nicht bestanden), außer bei „Aus“. Die Wahl gilt für die ganze App, auch für Übersichten und Druck.'],
   ['Drucken und Excel','„Drucken“ auf jeder Seite erzeugt eine A4-Hochformat-Ansicht; Ergebnisse von Klassenarbeiten, Klausuren und Tests werden so sortiert wie gerade auf der Seite. Beim Sichern als PDF schlägt der Browser einen passenden Namen vor, z. B. „8d Latein KA 2 2026-10-28“. Eine Excel-Datei mit allen Bewertungstabellen erhältst du im Backup-Dialog mit dem Format „Excel“.']]},
  {id:'iphone',title:'Auf dem iPhone',items:[
   ['Schlanke Version für den Unterricht','Das iPhone ist zum Bewerten, Nachschauen und Finden der laufenden Stunde da. Eingetragen werden mündliche Noten, Hausaufgaben und Material im Unterricht; im Noten-Manager nur Selbsteinschätzung, Quartals- und Halbjahresnote sowie Notizen. Tests, Klassenarbeiten, neue Seiten und Schülerlisten am Mac oder iPad. Hochkant und quer verhalten sich gleich.'],
   ['Kopfzeile und Leiste','Oben: App-Symbol (Farbgestaltung), Lerngruppe (antippen = Fach und Klasse wählen), Datenschutzmodus 👁, die Glocke (nur bei offenen Erinnerungen), Rückgängig und Backup ⬇ | ⬆. Unten (quer links): Unterricht · Noten · Stundenplan · Hilfe. Die Versionsnummer steht in der Hilfe.'],
   ['Unterricht','Nur der Sitzplan im Bewertungsmodus. Oben das Datum („Heute ▾“ – antippen zum Nachtragen, ein anderer Tag erscheint orange) und „⇅ Perspektive“; auch ein Tipp aufs Pult dreht den Plan. Ein Tisch öffnet das Bewertungsfenster; „Weiter ›“ geht Tisch für Tisch weiter. Plätze tauschen, freie Tische zuweisen und Tische bearbeiten geht nur am Mac oder iPad.'],
   ['Noten als Karten','Halbjahr und Quartal ergeben sich aus dem Datum. Jede Person hat eine Karte. Oben wählst du „Q1“, „Q2“ oder „Halbjahr“ (Q1/Q2 gilt, bis du die App schließt; danach wieder nach Datum): Neben dem Namen steht dann die Halbjahresnote (eingetragen, sonst „Halbjahr ∑“, ohne Klassenarbeit vorläufig die Sonstige Mitarbeit des Halbjahres) bzw. die Q2-Note (eingetragen oder errechnet); fehlt sie noch, steht „—“. Darunter die Sonstige Mitarbeit, eingerückt Mündliche Mitarbeit und Tests mit Anteil (z. B. 80 % / 20 %), Einzelnoten und Datum sowie fehlende Hausaufgaben und Material. Im 2. Quartal folgen „Sonstige Mitarbeit · Halbjahr“, „Klassenarbeit · Halbjahr“ (mit der Gewichtung des Fachs) und „Halbjahr ∑“ (100 %). Oben: Markierung Aus · Nur Farbe · Rahmen · Schraffur, Darstellung 2 · 2− · 2,3, Sortierung A–Z | 6–1 (ein zweiter Tipp dreht um) und der Knopf zum Verkleinern der Karten.'],
   ['1. Quartal einblenden','In der Ansicht „Halbjahr“ stehen bei der Sonstigen Mitarbeit die Quartalsnoten Q1 und Q2 nebeneinander, die Einzelnoten des 1. Quartals stehen vor denen des 2. (getrennt durch einen gestrichelten Strich). In der Ansicht „Q2“ blendet „1. Quartal“ sie bei Bedarf ein. Das Detailblatt ist die Notenbesprechung: Zuerst siehst du nur die mündliche Seite und trägst Selbsteinschätzung und Quartalsnote ein. Sobald deine Quartalsnote steht (die Selbsteinschätzung kann fehlen), erscheint „Halbjahr im Überblick“ mit Sonstiger Mitarbeit · Halbjahr, Klassenarbeit bzw. Klausur, „Halbjahr ∑“ und deinem Feld für die Halbjahresnote.'],
   ['Hinweise und Notizen','Über den Karten zeigen Hinweise z. B., wer 3× oder öfter die HA vergessen hat – antippen filtert die Karten. Ein Tipp auf eine Karte öffnet alle Einträge der Person (‹ › oder wischen = nächste Person, nach unten wischen = schließen) mit einem Notizfeld. Die Notiz steht gelb in der Karte, am Mac in der Quartalsübersicht neben dem Namen und im Sitzplan als orangener Punkt am Tisch (Text oben im Bewertungsfenster). Über den Seiten erinnert „📝 2 Notizen in dieser Klasse“ – antippen zeigt die Liste, „✓ Erledigt“ entfernt eine Notiz.'],
   ['Erinnerungen','Die Glocke erscheint oben, sobald jemand zum 3. bzw. 5. Mal Hausaufgaben oder Material vergessen hat. Dort Elternbrief verfassen (Text kopieren), „Erledigt“, „Später“ oder „Nicht nötig“.'],
   ['Stundenplan','Läuft gerade eine Stunde, öffnet „Stundenplan“ direkt deren Sitzplan mit Raum und heutigem Datum. Sonst erscheint der Stundenplan des Tages; hochkant wechselst du mit ‹ › oder durch Wischen nach links/rechts zwischen den Schultagen, quer siehst du die ganze Woche. Der Stundenplan wird am Mac eingetragen und per Backup übertragen – die Abfrage beim Wiederherstellen zeigt, ob er enthalten ist.'],
   ['Mac und iPhone aktuell halten','Am Gerät mit dem neuesten Stand ⬇ tippen (Backup in den festen Ordner, z. B. iCloud Drive), am anderen Gerät ⬆ und das neueste Backup wählen. Achtung: Ein älteres Backup ersetzt neuere Einträge.']]},
  {id:'backup',title:'Backup und Datenschutz',items:[
   ['Backup speichern','„Backup“ oben rechts → „Speichern“. JSON ist die reine Sicherungsdatei; Excel enthält zusätzlich alle Bewertungstabellen und lässt sich ebenfalls wiederherstellen. Ein orangefarbener Punkt am Backup-Button erinnert, wenn das letzte Backup älter als 7 Tage ist. Schneller geht es mit dem kleinen Download-Knopf rechts neben „Backup“: Er speichert sofort ein JSON-Backup, ein grüner Haken bestätigt es.'],
   ['Backup sofort wiederherstellen','Der Knopf ⬆ ganz rechts neben „Backup“ lädt das neueste Backup – am Mac (Chrome/Edge) automatisch aus dem festen Ordner bzw. dem Ordner der automatischen Sicherung, sonst über die Dateiauswahl. Vorher kommt eine Rückfrage mit Datum. Danach erscheint oben „Rückgängig“; im Backup-Dialog lässt sich die letzte Wiederherstellung auch später noch zurücknehmen.'],
   ['Backups zusammenführen','Beim Laden eines Backups vergleicht die App es mit diesem Gerät: Was ist im Backup neu, was steht nur hier, was weicht ab (nach Bereichen wie Bewertungen, Hausaufgaben & Material, Anwesenheit). „Zusammenführen“ behält alles, was nur auf einer Seite steht, und nimmt bei Abweichungen den neueren Wert – dafür merkt sich die App seit Version 9.89 bei jedem Eintrag, wann er geändert oder gelöscht wurde. Für ältere Abweichungen ohne Zeitangabe wählst du, ob das Backup oder dieses Gerät gilt. „Ersetzen“ übernimmt das Backup vollständig. Beispiel: Hausaufgaben am Mac, Mitarbeit am iPad eintragen – dann das iPad-Backup am Mac laden und zusammenführen (und umgekehrt).'],
   ['Speicheranzeige','Backup → „Speicher“ zeigt, wie voll der Browserspeicher ist und was den meisten Platz braucht. Ab 85 % erscheint oben eine Warnung mit „Backup öffnen“.'],
   ['Wiederherstellen','Im Backup-Dialog „Wiederherstellen“ und eine JSON- oder Excel-Sicherung wählen. Das ersetzt alle aktuellen Daten – vorher ggf. ein Backup speichern.'],
   ['Speicherort für Backups','Am Desktop (Chrome, Edge) unter Backup → Speicherort: Downloads, jedes Mal fragen oder ein fester Ordner (z. B. in iCloud Drive). Chrome fragt höchstens einmal pro Sitzung nach der Schreiberlaubnis. Auf iPad/iPhone wird wie gewohnt über „Teilen / In Dateien sichern“ gespeichert.'],
   ['Automatische Sicherung','Am Desktop (Chrome, Edge) kann im Backup-Dialog ein Ordner gewählt werden; die App speichert Änderungen dann selbstständig mit Datum und Uhrzeit.'],
   ['Safari und iPad','Safari kann gespeicherte Daten löschen, wenn eine Webseite 7 Tage nicht geöffnet wurde. Als App auf dem Home-Bildschirm (Teilen → „Zum Home-Bildschirm“) bzw. im Dock gilt das nicht. Trotzdem regelmäßig sichern.'],
   ['Daten prüfen','Im Backup-Dialog unter „Daten prüfen“ (aufklappen): findet doppelte Bereiche, verwaiste Seiten, Zeilen ohne Namen und doppelte Namen und behebt, was eindeutig ist. Darunter „Alle Daten löschen …“: entfernt nach Rückfrage (auf Wunsch zuerst Backup, dann „LÖSCHEN“ eintippen) alle Daten dieses Geräts; andere Geräte und Backup-Dateien bleiben erhalten.'],
   ['Schuljahr abschließen','Klick auf „Schuljahr …“ in der Navigationsleiste → „Schuljahr abschließen …“: Das ganze Schuljahr wird als Archivdatei gespeichert (optional mit Passwort). Danach werden Noten, Hausaufgaben, Abwesenheiten und Sitzplan-Verläufe entfernt; die angehakten Klassen gehen umbenannt (z. B. 6e → 7e) mit Schülerliste, Sitzplan und Räumen ins neue Schuljahr. So bleibt die App schlank. Danach auf dem zweiten Gerät einmal komplett übertragen (Backup → Wiederherstellen).'],
   ['Archiv ansehen','„Schuljahr …“ → „Archiv eines früheren Schuljahres öffnen …“ zeigt die Übersichten eines Archivs nur zum Lesen, mit Personensuche und Drucken. Die aktuellen Daten bleiben unverändert. Ein Archiv lässt sich auch über „Wiederherstellen“ vollständig laden (ersetzt dann die aktuellen Daten). Ohne das Passwort ist ein geschütztes Archiv nicht lesbar.'],
   ['Neue Version','Die Web-App prüft beim Öffnen, beim Zurückkehren ins Fenster und alle 30 Minuten, ob es eine neuere Version gibt. Dann erscheint oben ein Hinweis; „Jetzt aktualisieren“ lädt sie, „Später“ blendet ihn bis zum nächsten Start aus. Ohne Klick wird nie neu geladen. In der einzelnen HTML-Datei gibt es keinen Hinweis – dort die neue Datei verwenden.'],
   ['Gerät wechseln','Daten werden je Gerät und Browser getrennt gespeichert. Zum Umziehen auf dem alten Gerät ein Backup speichern und auf dem neuen wiederherstellen.']]},
  {id:'tipps',title:'Tipps',items:[
   ['Farbgestaltung','Ein Klick auf das App-Symbol oben links öffnet neun Farbgestaltungen. Das Symbol nimmt die gewählte Farbe an – und ein Doppelklick lässt es hüpfen.'],
   ['Tastatur','Esc schließt Dialoge, Menüs und die Schülersuche. Tab springt zum nächsten Eingabefeld, Enter bestätigt.'],
   ['Startansicht','Nach einer kurzen Pause (unter zwei Stunden) öffnet die App den zuletzt benutzten Manager, sonst den Unterrichts-Manager.'],
   ['Hinweise beim Darüberfahren','Viele Buttons erklären beim Darüberfahren mit der Maus, was sie tun.']]},
  {id:'gut',title:'Gut zu wissen',cards:true,items:[
   ['Über den Classroom-Manager','Erfunden und entwickelt von Torsten Gruber – aus dem eigenen Unterrichtsalltag, für Lehrkräfte. Die lokale Unterrichts- & Notenverwaltung: alle Daten bleiben auf deinem Gerät.'],
   ['🔒 Arbeit sperren','Zurückgegebene Klassenarbeiten, Klausuren und Tests sperren – dann kann nichts mehr versehentlich geändert werden. Ansehen und Drucken gehen weiter.','Arbeit öffnen → Kopfzeile rechts'],
   ['Fortschritt beim Korrigieren','Zeigt, wie viele Arbeiten schon eingetragen sind – mit Farbbalken bis „fertig ✓“.','Ergebnisse → „Fortschritt“'],
   ['1. Quartal einblenden','Im 2. Quartal die Einträge aus dem 1. Quartal zum Vergleich daneben zeigen.','Kopfzeile → „1. Quartal“'],
   ['2. Quartal einblenden','Im 1. Quartal die Einträge aus dem 2. Quartal rechts daneben zeigen (nur Ansicht).','Kopfzeile → „2. Quartal“'],
   ['Gewicht der Klassenarbeiten','Eine Arbeit doppelt zählen lassen – wirkt auf den Durchschnitt und die Halbjahresnote.','Klassenarbeiten-Übersicht → „Gewicht“'],
   ['Sortieren nach Note','„A–Z | 1–6“ sortiert die Tabelle nach der Endnote (beste zuerst), bei Hausaufgaben nach der Anzahl „Fehlend“; zweiter Tipp dreht um.','Kopfzeile → „A–Z | 1–6“'],
   ['Aus · Nur Farbe · Rahmen · Schraffur','Tendenzen wie 2− schraffiert, eingerahmt, nur farbig oder alles weiß zeigen. 4 Notenpunkte bleiben schraffiert (außer bei „Aus“).','Ergebnisse → rechts oben'],
   ['Notengrenzen per Schieberegler','Im Modus „Manuell“ die Grenzen direkt auf der Farbskala ziehen; „Grenze für ausreichend“ verschiebt den passenden Griff mit.','Notengrenzen → „Manuell“'],
   ['Datenschutz-Auge','Blendet die Namen aus, z. B. wenn der Bildschirm im Unterricht gezeigt wird.','oben rechts → Auge'],
   ['Rückgängig','Die letzte Änderung zurücknehmen – auch nach versehentlichem Löschen. Orange heißt: Es gibt etwas zum Zurücknehmen.','oben rechts → „Rückgängig“'],
   ['Erinnerungen','Beim 3. und 5. Fehlen von Hausaufgaben oder Material – mit Elternbrief aus Vorlagen.','oben rechts → Glocke'],
   ['Speicheranzeige','Zeigt, wie voll der Browserspeicher ist. Ab 85 % erscheint oben eine Warnung mit dem Hinweis, ein Backup zu speichern.','Backup → „Speicher“'],
   ['Fester Speicherort für Backups','Backups immer im gleichen Ordner speichern, ohne jedes Mal zu suchen (Chrome, Edge).','Backup → „Speicherort“'],
   ['Farbgestaltung & Hüpfen','Klick aufs App-Symbol öffnet die Farbgestaltungen – ein Doppelklick lässt es hüpfen.','App-Symbol oben links']]}
 ];
 const dialog=document.createElement('dialog');dialog.className='classroom-help';dialog.setAttribute('aria-label','Hilfe');
 dialog.innerHTML='<div class="help-head"><h2>Hilfe <small class="help-version"></small></h2><input type="search" class="help-search" placeholder="Suchen …" aria-label="Hilfe durchsuchen" autocomplete="off"><button type="button" class="help-close">Schließen</button></div><div class="help-body"><nav class="help-nav" aria-label="Kapitel"></nav><div class="help-content" tabindex="-1"></div></div>';
 document.body.append(dialog);
 {const st=document.createElement('style');st.textContent='.help-cards-sub{margin:-4px 0 14px;color:#66758a;font-size:.9rem}.help-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}.help-card{border:1px solid #e3e8f0;border-radius:12px;padding:12px 14px;background:#fbfcfe}.help-card h4{margin:0 0 4px}.help-card p{margin:0;font-size:.9rem;line-height:1.45}.help-where{display:inline-block;margin-top:8px;font-size:.78rem;color:#2f5f9b;background:#eaf1fb;border-radius:6px;padding:2px 8px}/* 10.90: „Neu“ orange wie die Versions-Marken */button.help-nav-new:not(#_){color:#7a5216!important;background:#fff3e2!important;border:1px solid #efcf9c!important;font-weight:700}button.help-nav-new[aria-current=true]:not(#_){background:#f9dfb5!important;border-color:#e4b46a!important}.help-new{font-size:.7rem;font-weight:700;color:#7a5216;background:#fff3e2;border:1px solid #efcf9c;border-radius:6px;padding:0 6px;vertical-align:2px}';document.head.append(st)}
 const nav=dialog.querySelector('.help-nav'),content=dialog.querySelector('.help-content'),search=dialog.querySelector('.help-search');
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let active='start';
 const vnum=v=>{const m=/(\d+)\.(\d{1,2})/.exec(String(v||''));return m?Number(m[1])*100+Number(m[2]):0};
 /* 10.93: „Neu“ nur orange, solange neue Einträge noch nicht angesehen wurden */
 const NEWS_SEEN='classroom-help-news-seen-v1';
 const newestNews=()=>{const ch=C.find(c=>c.news);return Math.max(0,...(ch?.items||[]).map(it=>vnum(it[3])))};
 const newsUnseen=()=>{let v=0;try{v=Number(localStorage.getItem(NEWS_SEEN))||0}catch{}return newestNews()>v};
 const markNewsSeen=()=>{try{localStorage.setItem(NEWS_SEEN,String(newestNews()))}catch{}};
 function renderNav(){nav.innerHTML=C.map(ch=>`<button type="button" data-help-chapter="${ch.id}"${ch.news&&newsUnseen()?' class="help-nav-new"':''} aria-current="${ch.id===active&&!search.value.trim()}">${esc(ch.title)}</button>`).join('')}
 function renderChapter(id){active=id;const ch=C.find(c=>c.id===id)||C[0];if(ch.news&&newsUnseen()){markNewsSeen();setTimeout(()=>{try{renderNav()}catch{}},0)}content.innerHTML=ch.cards?`<h3>${esc(ch.title)}</h3><p class="help-cards-sub">${ch.news?'Die letzten zehn neuen Funktionen – die neueste steht oben.':'Kleine Helfer, die man leicht übersieht – mit dem Weg dorthin.'}</p><div class="help-cards">`+ch.items.slice(0,ch.news?10:undefined).map(([h,t,w,n])=>`<div class="help-card${ch.news&&n&&window.classroomHelpNewSince&&vnum(n)>window.classroomHelpNewSince?' help-card-fresh':''}"><h4>${ch.news&&n&&window.classroomHelpNewSince&&vnum(n)>window.classroomHelpNewSince?'<span class="help-fresh">Neu für dich</span> ':''}${n&&ch.news?`<span class="help-new" title="Version ${esc(n)}">v${esc(n)}</span> `:''}${esc(h)}</h4><p>${esc(t)}</p>${w?`<span class="help-where">${esc(w)}</span>`:''}</div>`).join('')+'</div>':`<h3>${esc(ch.title)}</h3>`+ch.items.map(([h,t])=>`<section><h4>${esc(h)}</h4><p>${esc(t)}</p></section>`).join('');content.scrollTop=0;renderNav()}
 function renderSearch(q){
  const words=q.toLocaleLowerCase('de').split(/\s+/).filter(Boolean),hits=[];
  for(const ch of C)for(const [h,t] of ch.items){const hay=(h+' '+t).toLocaleLowerCase('de');if(words.every(w=>hay.includes(w)))hits.push([ch.title,h,t])}
  const mark=s=>{let out=esc(s);for(const w of words)out=out.replace(new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>');return out};
  content.innerHTML=`<h3>Suche: „${esc(q)}“</h3>`+(hits.length?hits.map(([c,h,t])=>`<section><div class="help-chapter-tag">${esc(c)}</div><h4>${mark(h)}</h4><p>${mark(t)}</p></section>`).join(''):'<p class="help-empty">Nichts gefunden. Versuche ein anderes Wort.</p>');renderNav();
 }
 nav.onclick=e=>{const b=e.target.closest('[data-help-chapter]');if(!b)return;search.value='';renderChapter(b.dataset.helpChapter)};
 search.oninput=()=>{const q=search.value.trim();q?renderSearch(q):renderChapter(active)};
 dialog.querySelector('.help-close').onclick=()=>dialog.close();/* 9.10: das frühere Wegwischen (8.23) ist entfallen – Hilfe ist auf dem iPhone eine normale Seite */
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 // Esc: zuerst die Suche leeren, beim zweiten Mal schließen.
 dialog.addEventListener('keydown',e=>{if(e.key!=='Escape')return;e.preventDefault();if(search.value){search.value='';renderChapter(active)}else dialog.close()});
 function openHelp(chapter){{const v=document.querySelector('[data-app-version]')?.textContent?.trim();const hv=dialog.querySelector('.help-version');if(hv)hv.textContent=v?'Version '+v:''}{/* 8.22: iPhone – App-Name, Version und Untertitel oben im Hilfefenster (die Kopfzeile zeigt sie dort nicht) */const head=dialog.querySelector('.help-head');let br=head?.querySelector('.help-brand');if(head&&!br){br=document.createElement('div');br.className='help-brand';const img=document.querySelector('.app-header .brand-mark img');br.innerHTML=(img?'<img alt="" src="'+img.getAttribute('src')+'">':'')+'<div><b>Classroom-Manager <span data-app-version-copy data-app-version-help></span></b><small></small></div>';head.prepend(br)}if(br){const v=(document.querySelector('.app-header [data-app-version]')||document.querySelector('[data-app-version]'))?.textContent?.trim().replace(',','.')||'';br.querySelector('b span').textContent=v;br.querySelector('small').textContent=document.querySelector('.app-header .brand p')?.textContent||'Die lokale Unterrichts- & Notenverwaltung'}}const view=document.querySelector('[data-view][aria-selected="true"]')?.dataset.view;search.value='';/* 8.42: Startkapitel – beim allerersten Öffnen „Erste Schritte“, auf dem iPhone „Auf dem iPhone“, sonst passend zur Ansicht */let first=false;try{first=!localStorage.getItem('classroom-help-seen-v1');localStorage.setItem('classroom-help-seen-v1','1')}catch{}const phone=document.documentElement.classList.contains('is-phone');renderChapter(typeof chapter==='string'?chapter:first?'start':phone?'iphone':view==='noten'?'noten':view==='sitzplan'?'sitzplan':'start');/* 9.01: iPhone – als Seite (nicht modal), die Leiste unten bleibt bedienbar */if(phone){/* 11.61: eine offene Stundenplan-Seite verdeckte die Hilfe (z. B. bei „Was ist neu?“) – sie wird geschlossen wie beim Tab „Hilfe“ */document.querySelector('.tt-sheet')?.remove();if(dialog.open&&dialog.classList.contains('cm-nonmodal'))return;if(dialog.open)dialog.close();dialog.classList.add('cm-nonmodal');dialog.show()}else{dialog.classList.remove('cm-nonmodal');dialog.showModal()};content.focus()}
 window.classroomOpenHelp=openHelp;
 const button=document.createElement('button');button.type='button';button.className='classroom-help-button';button.textContent='?';button.title='Hilfe';button.setAttribute('aria-label','Hilfe öffnen');button.onclick=openHelp;
 /* 11.07: nur nach dem Einsetzen neu vermessen (vorher bei jeder Änderung der Kopfleiste) */function place(){const actions=document.querySelector('.classroom-global-actions');if(actions&&actions.firstElementChild!==button){actions.prepend(button);square()}}
 // Quadratisch und so hoch wie „Backup“.
 function square(){const phone=matchMedia('(max-width:540px) and (orientation:portrait)').matches,text='?';if(button.textContent!==text)button.textContent=text;const h=document.getElementById('classroomBackupButton')?.offsetHeight,w=phone||!h?'':h+'px';if(button.style.width!==w)button.style.width=w}
 addEventListener('resize',square);requestAnimationFrame(square);
 place();new MutationObserver(place).observe(document.querySelector('.app-header')||document.body,{childList:true,subtree:true});
 const style=document.createElement('style');style.textContent=
  '.classroom-global-actions>.classroom-help-button{align-self:stretch;flex:none;min-width:0;padding:0!important;font-weight:700!important;font-size:1rem!important}'
  +'.classroom-beamer-active .classroom-help-button{display:none!important}'
  +'.classroom-help{width:min(860px,calc(100vw - 24px));height:min(640px,calc(100dvh - 32px));padding:0;border:1px solid #dce3ef;border-radius:18px;color:#243247;background:#fff;box-shadow:0 18px 60px #1c2b4630;overflow:hidden}'
  +'.classroom-help[open]{display:flex;flex-direction:column}.classroom-help::backdrop{background:#1c2b4638}'
  +'.help-head{display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid #e6ebf3}'
  +'.help-head h2{margin:0;font-size:1.25rem;flex:none}.help-head .help-version{font-size:.75rem;font-weight:500;color:#8a97aa;margin-left:6px}'
  +'.help-search{flex:1;min-width:0;height:36px;box-sizing:border-box;padding:0 12px;border:1px solid #cbd6e5;border-radius:9px;font:inherit;font-size:.95rem;color:#243247;background:#fff}'
  +'.help-close{flex:none;margin-left:auto;height:36px;padding:0 14px;border:1px solid #cbd6e5;border-radius:9px;background:#fff;color:var(--primary,#2f5f9b);font:inherit;font-size:.9rem;font-weight:600;cursor:pointer}'
  +'.help-body{display:flex;flex:1;min-height:0}'
  +'.help-nav{flex:none;width:210px;padding:12px;border-right:1px solid #e6ebf3;background:#f8fafd;overflow:auto;display:flex;flex-direction:column;gap:4px}'
  +'.help-nav button{text-align:left;padding:9px 12px;border:0;border-radius:9px;background:none;color:#3c4b61;font:inherit;font-size:.92rem;cursor:pointer}'
  +'.help-nav button:hover{background:#eef2f8}.help-nav button[aria-current=true]{background:#fff;color:var(--primary,#2f5f9b);font-weight:650;box-shadow:0 1px 3px #25334914}'
  +'.help-content{flex:1;overflow:auto;padding:18px 26px 26px;outline:none}'
  +'.help-content h3{margin:0 0 12px;font-size:1.1rem}'
  +'.help-content section{padding:10px 0;border-bottom:1px solid #eef2f7}.help-content section:last-child{border-bottom:0}'
  +'.help-content h4{margin:0 0 4px;font-size:.95rem}.help-content p{margin:0;color:#4a5b73;font-size:.92rem;line-height:1.55}'
  +'.help-content mark{background:#fff3b0;color:inherit;border-radius:3px;padding:0 1px}'
  +'.help-chapter-tag{font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;color:#8a97aa;margin-bottom:2px}.help-empty{color:#66758a}'
  +'@media(max-width:640px){.help-body{flex-direction:column}.help-nav{width:auto;flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid #e6ebf3;padding:8px}.help-nav button{white-space:nowrap}.help-head{flex-wrap:wrap}.help-search{order:3;flex-basis:100%}.help-content{padding:14px 16px 20px}}'
  +'@media screen and (max-width:540px) and (orientation:portrait){.app-header .classroom-global-actions>.classroom-help-button{width:100%}}';
 document.head.append(style);
})();
/* 8.22: App-Name im Hilfefenster nur auf dem iPhone */
(()=>{const st=document.createElement('style');st.textContent=".help-brand{display:none}@media (max-width:540px) and (orientation:portrait),(max-height:500px) and (orientation:landscape) and (pointer:coarse){.help-brand{display:flex;align-items:center;gap:10px;width:100%;margin:0 0 2px}.help-brand img{width:36px;height:36px;border-radius:9px;flex:none}.help-brand b{display:block;font-size:17px;color:#1e293b}.help-brand b span{font-weight:500;color:#8794a7;font-size:14px}.help-brand small{display:block;font-size:12.5px;color:#66758a}.help-head .help-version{display:none}}@media (max-width:540px) and (orientation:portrait),(max-height:500px) and (orientation:landscape) and (pointer:coarse){.classroom-help:not(#_){position:fixed;inset:auto 0 0 0;margin:0;width:100vw;max-width:100vw;height:92dvh;max-height:92dvh;border:0;border-radius:20px 20px 0 0;box-shadow:0 -12px 34px #1c2b4633;padding-bottom:env(safe-area-inset-bottom)}.help-head .help-close:not(#_){width:40px;height:40px;padding:0;border:0;background:none;font-size:0;color:#66758a}.help-head .help-close:not(#_)::before{content:'✕';font-size:17px}}";document.head.append(st)})();
/* 8.35: frische „Neu“-Einträge nach einem Update hervorheben */
(()=>{const st=document.createElement('style');st.textContent='.help-card.help-card-fresh{border-color:#9fd3b4!important;background:#f1faf4!important;box-shadow:0 0 0 2px #c9ecd6}.help-fresh{display:inline-block;margin-right:4px;padding:1px 7px;border-radius:999px;background:#1f7a45;color:#fff;font-size:.72em;font-weight:700;vertical-align:middle}';document.head.append(st)})();
;

/* ==== global-undo.js ==== */
/* Shared undo journal: capture stored app data before user edits in either frame. */
(()=>{
 const journalKey='classroom-manager-undo-session-v2';
 const viewKey='classroom-manager-undo-view-v1';
 let resume=null;try{resume=JSON.parse(sessionStorage.getItem(viewKey)||'null');sessionStorage.removeItem(viewKey)}catch{}
 if(resume)window.addEventListener('load',()=>{
  const frame=document.getElementById('view-'+resume.view);
  const restoreScroll=()=>{try{const fb=frame.contentWindow.classroomFitBox?.();if(fb)fb.scrollTop=resume.y||0;else frame.contentWindow.scrollTo(resume.x||0,resume.y||0)}catch{}};
  frame?.addEventListener('load',()=>{restoreScroll();setTimeout(restoreScroll,350)});
  selectView(resume.view);restoreScroll();setTimeout(restoreScroll,500);
 },{once:true});
 const navigationKeys=new Set(['notenrechner-aktives-fach-v1','notenrechner-aktive-klassen-v1','sitzplan_aktuelle_klasse']);
 const relevant=key=>!navigationKeys.has(key)&&( key==='classroom-manager-common-v2'||key.startsWith('notenrechner-')||key.startsWith('sitzplan_')||key.startsWith('classroom-manager-linked-classes-'));
 const snapshot=()=>{const values={};for(const key of Object.keys(localStorage).filter(relevant).sort())values[key]=localStorage.getItem(key);return values};
 let history=[];try{history=JSON.parse(sessionStorage.getItem(journalKey)||'[]');if(!Array.isArray(history))history=[]}catch{}
 let pending=null,timer=null,restoring=false;
 const button=document.createElement('button');button.type='button';button.id='classroomUndoButton';button.className='cu-icon';button.setAttribute('aria-label','Rückgängig');button.textContent='Rückgängig';button.title='Letzte Änderung rückgängig machen';
 document.querySelector('.classroom-global-actions')?.prepend(button);
 function refresh(){button.disabled=!history.length&&!pending;button.setAttribute('aria-label','Letzte Änderung rückgängig machen')}
 // Höchstens etwa 1 MB Rückgängig-Schritte (iPhone/iPad haben wenig Sitzungsspeicher); ältere Schritte fallen weg.
 function persist(){const sizes=history.map(h=>JSON.stringify(h).length);let total=sizes.reduce((a,b)=>a+b,0);while(total>1000000&&history.length>1){history.shift();total-=sizes.shift()}const text=JSON.stringify(history);try{sessionStorage.setItem(journalKey,text)}catch{history=history.slice(-3);try{sessionStorage.setItem(journalKey,JSON.stringify(history))}catch{history=[];try{sessionStorage.removeItem(journalKey)}catch{}}}refresh()}
 function finish(){clearTimeout(timer);if(!pending)return;const before=pending;pending=null;const after=snapshot(),changes={};baseline=after;for(const key of new Set([...Object.keys(before),...Object.keys(after)]))if(before[key]!==after[key])changes[key]=before[key]??null;if(Object.keys(changes).length){history.push(changes);if(history.length>30)history.shift();persist()}else refresh()}
 function start(event){
  if(restoring||event.target?.closest?.('#classroomUndoButton'))return;
  if(event.type==='keydown'&&!['Backspace','Delete','Enter'].includes(event.key))return;
  if(event.type==='pointerdown')finish();
  if(!pending)pending=snapshot();clearTimeout(timer);timer=setTimeout(finish,700);
 }
 const watched=new WeakSet();
 function watch(win){try{if(win.__classroomUndoWatched){watched.add(win);return}win.__classroomUndoWatched=true;for(const name of ['pointerdown','input','change','paste','drop','keydown'])win.document.addEventListener(name,start,true);win.document.__classroomUndoDoc=true;watched.add(win)}catch{}}
 // Bei lokal geöffneter Datei (file://) ist kein direkter Frame-Zugriff möglich: Eingaben kommen per Nachricht.
 window.addEventListener('message',event=>{const msg=event.data;if(msg?.type!=='classroom:user-edit'||!event.source)return;let direct=false;try{direct=!!event.source.document.__classroomUndoDoc}catch{}if(direct)return;// Die Nachricht trifft erst nach der Speicherung ein; deshalb dient der zuletzt bekannte Stand als Ausgangspunkt.
  if(restoring)return;if(msg.kind==='keydown'&&!['Backspace','Delete','Enter'].includes(msg.key))return;if(msg.kind==='pointerdown')finish();if(!pending)pending=baseline||snapshot();clearTimeout(timer);timer=setTimeout(finish,700)});
 let baseline=null;window.addEventListener('load',()=>setTimeout(()=>{if(!pending)baseline=snapshot()},1500));
 watch(window);for(const frame of document.querySelectorAll('iframe')){frame.addEventListener('load',()=>watch(frame.contentWindow));watch(frame.contentWindow)}
 // Include asynchronous roster synchronization in the same undo step.
 window.addEventListener('message',()=>{if(pending){clearTimeout(timer);timer=setTimeout(finish,700)}});
 button.addEventListener('click',()=>{
  finish();if(!history.length)return;restoring=true;button.disabled=true;
  const before=history.pop(),current=snapshot();
  try{for(const [key,value] of Object.entries(before))if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);persist();const view=document.querySelector('[data-view][aria-selected="true"]')?.dataset.view||'noten',win=document.getElementById('view-'+view)?.contentWindow;let x=0,y=0;try{const fb=win?.classroomFitBox?.();x=win?.scrollX||0;y=fb?fb.scrollTop:(win?.scrollY||0)}catch{}/* bei file:// kein Zugriff auf die Scrollposition */sessionStorage.setItem(viewKey,JSON.stringify({view,x,y}));location.reload()}
  catch(error){for(const key of Object.keys(snapshot()))if(!(key in current))localStorage.removeItem(key);for(const [key,value] of Object.entries(current))localStorage.setItem(key,value);history.push(before);restoring=false;persist();alert('Die Änderung konnte nicht rückgängig gemacht werden.')}
 });
 refresh();
})();

/* 10.41: Rückgängig als Pfeil-Symbol (wie am iPhone) */
(()=>{const svg="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M9 14 4 9l5-5%27/%3E%3Cpath d=%27M4 9h10.5a5.5 5.5 0 0 1 0 11H11%27/%3E%3C/svg%3E";
 const st=document.createElement('style');st.textContent='#classroomUndoButton.cu-icon:not(#_):not(#__){display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:42px;min-width:42px;padding:0!important;font-size:0!important;line-height:0!important;letter-spacing:0;flex:none}#classroomUndoButton.cu-icon::before{flex:none;content:"";display:block;width:20px;height:20px;background:currentColor;-webkit-mask:url("'+svg+'") center/contain no-repeat;mask:url("'+svg+'") center/contain no-repeat}';document.head.append(st)})();
;

/* ==== index.html (eingebettet) ==== */
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(console.warn);
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

/* ==== theme-icon.js ==== */
/* Easteregg: Das App-Symbol neben dem Titel übernimmt die gewählte Farbgestaltung –
   als kräftige, leuchtende Version der dezenten Farbe. Folgt jeder Änderung im Dialog „Farbgestaltung“ mit weichem Überblenden.
   Doppelklick aufs Symbol lässt es kurz hüpfen. */
(()=>{
 const template="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\" width=\"1024\" height=\"1024\"><defs><linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"{b1}\"/><stop offset=\"0.55\" stop-color=\"{b2}\"/><stop offset=\"1\" stop-color=\"{b3}\"/></linearGradient><radialGradient id=\"glow\" cx=\"0.3\" cy=\"0.12\" r=\"0.75\"><stop offset=\"0\" stop-color=\"#FFFFFF\" stop-opacity=\"0.35\"/><stop offset=\"1\" stop-color=\"#FFFFFF\" stop-opacity=\"0\"/></radialGradient><linearGradient id=\"sheet\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#FFFFFF\"/><stop offset=\"1\" stop-color=\"#E4E9F0\"/></linearGradient><linearGradient id=\"card\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#FFFFFF\"/><stop offset=\"1\" stop-color=\"#EAF0F7\"/></linearGradient><linearGradient id=\"check\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"{c1}\"/><stop offset=\"1\" stop-color=\"{c2}\"/></linearGradient><filter id=\"drop\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"150%\"><feDropShadow dx=\"0\" dy=\"14\" stdDeviation=\"16\" flood-color=\"{sh}\" flood-opacity=\"0.35\"/></filter><filter id=\"dropSoft\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"150%\"><feDropShadow dx=\"0\" dy=\"8\" stdDeviation=\"10\" flood-color=\"{sh}\" flood-opacity=\"0.25\"/></filter><filter id=\"iconShadow\" x=\"-10%\" y=\"-10%\" width=\"120%\" height=\"125%\"><feDropShadow dx=\"0\" dy=\"10\" stdDeviation=\"12\" flood-color=\"#000\" flood-opacity=\"0.28\"/></filter><clipPath id=\"sheetClip\"><rect x=\"236\" y=\"250\" width=\"440\" height=\"440\" rx=\"72\"/></clipPath></defs><g filter=\"url(#iconShadow)\"><rect x=\"100\" y=\"100\" width=\"824\" height=\"824\" rx=\"185\" fill=\"url(#bg)\"/><rect x=\"100\" y=\"100\" width=\"824\" height=\"824\" rx=\"185\" fill=\"url(#glow)\"/><rect x=\"101.5\" y=\"101.5\" width=\"821\" height=\"821\" rx=\"184\" fill=\"none\" stroke=\"#FFFFFF\" stroke-opacity=\"0.25\" stroke-width=\"3\"/></g><g filter=\"url(#dropSoft)\"><rect x=\"236\" y=\"250\" width=\"440\" height=\"440\" rx=\"72\" fill=\"url(#sheet)\"/></g><g clip-path=\"url(#sheetClip)\" stroke=\"#8D9AAB\" stroke-width=\"9\" stroke-linecap=\"round\"><path d=\"M346 250V690M456 250V690M566 250V690\"/><path d=\"M236 360H676M236 470H676M236 580H676\"/></g><rect x=\"236\" y=\"250\" width=\"440\" height=\"440\" rx=\"72\" fill=\"none\" stroke=\"#C6D0DC\" stroke-width=\"5\"/><g filter=\"url(#drop)\"><rect x=\"420\" y=\"420\" width=\"400\" height=\"400\" rx=\"78\" fill=\"url(#card)\"/></g><rect x=\"421.5\" y=\"421.5\" width=\"397\" height=\"397\" rx=\"76.5\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"3\"/><path d=\"M514 628L590 704L728 548\" fill=\"none\" stroke=\"url(#check)\" stroke-width=\"56\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>";
 const colors={"blue": ["#2FC6FF", "#1A9BF0", "#0B6FD6", "#2A9BFF", "#0A63D1", "#06306B"], "green": ["#3EEAA8", "#16BE84", "#078C5F", "#22CC8C", "#06835A", "#04402C"], "orange": ["#FFB95A", "#FF8C22", "#E5600A", "#FF9B3D", "#D2560A", "#6B2A05"], "lavender": ["#B4AFFF", "#8D87F5", "#635DDB", "#948FFF", "#5650CC", "#2A2770"], "grey": ["#AEB9C6", "#808D9C", "#525E6C", "#8A98A8", "#4A5664", "#1E252D"], "yellow": ["#FFE45C", "#FFC61F", "#E6A000", "#F7BB0A", "#C78600", "#6B4A00"], "purple": ["#D08CFF", "#A852F2", "#7B22D1", "#B562FF", "#7420C9", "#3A0F66"], "teal": ["#35E6EE", "#14B5C4", "#088596", "#1CC4D3", "#077A8A", "#03404A"], "rose": ["#FF94BF", "#F45A94", "#D12E6C", "#FF639C", "#C72763", "#66102F"]};
 const keys=['b1','b2','b3','c1','c2','sh'];
 function url(theme){const c=colors[theme]||colors.blue;let s=template;keys.forEach((k,i)=>{s=s.split('{'+k+'}').join(c[i])});return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)}
 let ready=false;
 const motion=()=>!matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Weiches Überblenden: Das alte Symbol liegt kurz als Kopie darüber und wird ausgeblendet.
 function crossfade(img,next){
  const mark=img.closest('.brand-mark');
  if(ready&&mark&&motion()){mark.querySelectorAll('.brand-mark-fade').forEach(n=>n.remove());const ghost=img.cloneNode();ghost.className='brand-mark-fade';ghost.removeAttribute('data-original-src');mark.append(ghost);
   requestAnimationFrame(()=>requestAnimationFrame(()=>ghost.classList.add('out')));setTimeout(()=>ghost.remove(),600)}
  img.setAttribute('src',next);
 }
 function update(){const theme=document.documentElement.dataset.theme||'blue';for(const img of document.querySelectorAll('.brand-mark img:not(.brand-mark-fade)')){img.dataset.originalSrc??=img.getAttribute('src');const next=theme==='blue'?img.dataset.originalSrc:url(theme);if(img.getAttribute('src')!==next)crossfade(img,next)}}
 update();ready=true;
 // Hüpfer per Doppelklick: Ein einfacher Klick öffnet weiterhin die Farbgestaltung (kurz verzögert, um den Doppelklick zu erkennen).
 let timer=0;
 function hop(mark){const img=mark.querySelector('img:not(.brand-mark-fade)');if(!img)return;img.classList.remove('brand-mark-hop');void img.offsetWidth;img.classList.add('brand-mark-hop');img.addEventListener('animationend',()=>img.classList.remove('brand-mark-hop'),{once:true})}
 window.addEventListener('click',e=>{
  const mark=e.target.closest?.('button.brand-mark');if(!mark||e.detail===0)return; // Tastatur: sofort öffnen
  e.stopImmediatePropagation();e.preventDefault();clearTimeout(timer);
  if(e.detail===1)timer=setTimeout(()=>{const d=document.querySelector('.classroom-theme-dialog');if(d&&!d.open){d.showModal();d.tabIndex=-1;d.focus()}},260);
  else if(e.detail===2)hop(mark);
 },true);
 const style=document.createElement('style');style.textContent=
  '.brand-mark{position:relative}'
  +'.brand-mark .brand-mark-fade{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:1;transition:opacity .5s ease}'
  +'.brand-mark .brand-mark-fade.out{opacity:0}'
  +'@keyframes brandMarkHop{0%{transform:scale(1.18) translateY(0)}18%{transform:scale(1.24,1.12) translateY(0)}45%{transform:scale(1.14,1.24) translateY(-11px)}68%{transform:scale(1.18) translateY(0)}80%{transform:scale(1.25,1.11) translateY(0)}100%{transform:scale(1.18) translateY(0)}}'
  +'.brand-mark img.brand-mark-hop{animation:brandMarkHop .65s cubic-bezier(.3,.7,.4,1);transform-origin:50% 100%}'
  +'@media (prefers-reduced-motion:reduce){.brand-mark img.brand-mark-hop{animation-duration:.01s}.brand-mark .brand-mark-fade{transition:none}}';
 document.head.append(style);
 new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 // theme.js ersetzt das Symbol beim Start durch einen Button – danach erneut anwenden.
 new MutationObserver(update).observe(document.querySelector('.app-header')||document.body,{childList:true,subtree:true});
})();
;

/* ==== phone.js ==== */
/* iPhone-Ansicht (hochkant bis 540 px breit; quer bis 500 px hoch mit Leiste links): schmale Kopfzeile
   (Symbol · Auswahl · Datenschutz · Backup ⬇|⬆ · Rückgängig), Auswahlmenü als Blatt von unten,
   Leiste unten bzw. links (Unterricht · Noten · Aktuell · Hilfe). iPad und Mac bleiben unverändert.
   Die bestehenden Elemente werden nur umgehängt bzw. per CSS anders angeordnet; alle Funktionen bleiben dieselben. */
(()=>{
 if(window!==parent)return;
 const PHONE=matchMedia('(max-width:540px) and (orientation:portrait), (max-height:500px) and (pointer:coarse) and (orientation:landscape)');
 const icon={
  sitzplan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="4" width="7" height="6" rx="1.5"/><rect x="3" y="14" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/></svg>',
  noten:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
  now:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  /* 11.51: iPad mit Stift (digitale Unterrichtsinhalte) */book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2.5" width="14" height="19" rx="2.5"/><path d="M21.9 3.4l.9.9-10.1 10.1-1.9.9.9-1.9z" stroke-width="1.6"/></svg>',
  help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/></svg>'};
 // Leiste unten
 const bar=document.createElement('nav');bar.className='phone-tabbar';bar.setAttribute('aria-label','Bereiche');
 bar.innerHTML='<button type="button" data-ph="sitzplan">'+icon.sitzplan+'<span>Sitzplan</span></button><button type="button" data-ph="unterricht">'+icon.book+'<span>Unterricht</span></button><button type="button" data-ph="noten">'+icon.noten+'<span>Noten</span></button><button type="button" data-ph="aktuell">'+icon.now+'<span>Stundenplan</span></button><button type="button" data-ph="hilfe">'+icon.help+'<span>Hilfe</span></button>';
 document.body.append(bar);
 bar.addEventListener('click',e=>{const b=e.target.closest('[data-ph]');if(!b)return;const t=b.dataset.ph;
  /* 9.01: „Aktuell“ und „Hilfe“ sind Seiten wie „Unterricht“ und „Noten“ – ein anderer Tab schließt sie */
  const page=overlay();if(page===t)return;if(page)closeOverlay();
  if(t==='noten'&&!page&&b.classList.contains('on')){try{classroomNotes.contentWindow.classroomCardsDetailClose?.()}catch{}return}
  if(t==='sitzplan'||t==='noten'||t==='unterricht')document.getElementById('tab-'+t)?.click();
  else if(t==='aktuell')window.classroomGoCurrent?.({strict:true});
  else if(t==='hilfe')window.classroomOpenHelp?.()});
 function overlay(){return document.querySelector('.tt-sheet')?'aktuell':document.querySelector('dialog.classroom-help[open]')?'hilfe':''}
 function closeOverlay(){document.querySelector('.tt-sheet')?.remove();const h=document.querySelector('dialog.classroom-help[open]');if(h)h.close()}
 function sync(){const page=overlay();for(const t of ['sitzplan','unterricht','noten']){const on=document.getElementById('tab-'+t)?.getAttribute('aria-selected')==='true';bar.querySelector('[data-ph="'+t+'"]').classList.toggle('on',on&&!page);if(t==='noten'){document.documentElement.classList.toggle('ph-noten',on);if(!on||page)document.documentElement.classList.remove('qs-land-top');else try{classroomNotes.contentWindow.classroomCardsLandAuto?.(true)}catch{}}}for(const t of ['aktuell','hilfe'])bar.querySelector('[data-ph="'+t+'"]').classList.toggle('on',page===t)}
 new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-selected','class','open']});new MutationObserver(sync).observe(document.body,{childList:true});
 // Auswahl in die Kopfzeile holen (nur iPhone), sonst an ihren Platz über den Managern zurück
 let home=null;
 function place(){const nav=document.querySelector('.compact-navigation'),header=document.querySelector('.app-header'),brand=header?.querySelector('.brand');if(!nav||!brand)return;
  if(PHONE.matches){if(!home){home=document.createComment('nav');nav.before(home)}if(nav.parentElement!==header)brand.after(nav)}
  else if(home&&nav.parentElement===header){home.before(nav)}
  document.documentElement.classList.toggle('is-phone',PHONE.matches);sync()}
 // Auswahl-Blatt nach unten wegwischen
 function swipeDown(getEl,close){let el=null,y0=null,dy=0;
  document.addEventListener('touchstart',e=>{el=getEl(e.target);if(!el||!PHONE.matches)return;const sc=e.target.closest('.compact-navigation-flyout');if(sc&&sc.scrollTop>0){el=null;return}y0=e.touches[0].clientY;dy=0},{passive:true});
  document.addEventListener('touchmove',e=>{if(!el||y0===null)return;dy=e.touches[0].clientY-y0;if(dy<=0){el.style.removeProperty('transform');return}if(e.cancelable)e.preventDefault();el.style.setProperty('transition','none','important');el.style.setProperty('transform','translateY('+dy+'px)','important')},{passive:false});
  document.addEventListener('touchend',()=>{if(!el||y0===null){el=null;return}const t=el,d=dy;el=null;y0=null;t.style.removeProperty('transition');if(d>70){t.style.setProperty('transition','transform .18s ease','important');t.style.setProperty('transform','translateY(100%)','important');setTimeout(()=>{close();t.style.removeProperty('transform');t.style.removeProperty('transition')},170)}else t.style.removeProperty('transform')});
 }
 swipeDown(t=>t.closest?.('.app-header>.compact-navigation.is-open .compact-navigation-flyout'),()=>{if(typeof navigationSetOpen==='function')navigationSetOpen(false);else document.querySelector('.compact-navigation-backdrop')?.click()});
 PHONE.addEventListener?.('change',place);
 const tryPlace=()=>{place();if(!document.querySelector('.compact-navigation'))setTimeout(tryPlace,300)};tryPlace();
 const st=document.createElement('style');st.textContent=
  '.phone-tabbar{display:none}'
  /* Mit viewport-fit=cover: Inhalt nicht unter Home-Balken oder Kamera-Aussparung (iPhone/iPad als App) */
  +'body{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}'
  /* 10.31: iPad/Mac – Fenster dürfen bis 12 px über den Bildschirmrand reichen (Home-Balken-Abstand nicht doppelt) */
  +'@media (min-width:701px) and (min-height:501px){body{padding-bottom:0}}'
  +'@media (max-width:540px) and (orientation:portrait), (max-height:500px) and (pointer:coarse) and (orientation:landscape){'
  +'body:not(#_){padding-bottom:calc(64px + max(env(safe-area-inset-bottom),10px))}'
  +'.app-header:not(#_){position:relative;z-index:9450;display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:8px!important;padding:8px 12px!important}'
  +'.app-header .brand{flex:none!important;gap:0!important}.app-header .brand>div{display:none!important}.app-header .brand-mark{width:32px!important;height:32px!important}'
  +'.app-header>.module-tabs{display:none!important}'
  +'.app-header .classroom-global-actions:not(#_){display:flex!important;width:auto!important;flex:none!important;gap:0!important;margin:0!important}'
  +'.app-header .classroom-global-actions>*:not(#classroomUndoButton):not(.cb-split):not(.classroom-privacy-button){display:none!important}'
  /* 9.77: Reihenfolge wie am Mac – Auge, Glocke, Rückgängig, Backup */
/* Backup speichern ⬇ | wiederherstellen ⬆ als runde Doppel-Pille (breit genug zum Treffen), rundes Datenschutz- und Rückgängig-Symbol */
  +'.app-header .classroom-global-actions:not(#_){gap:5px!important;align-items:center;overflow:visible}'
  +'.app-header .cb-split:not(#_){order:2;display:inline-flex!important;flex:none!important;height:36px!important;width:auto!important;min-width:0!important;max-width:none!important;gap:0!important;border:1px solid #cbd6e5!important;border-radius:19px!important;overflow:hidden;background:#fff;box-shadow:none!important;margin:0!important;padding:0!important}'
  +'.app-header .cb-split #classroomBackupButton{display:none!important}'
  +'.app-header .cb-split .cb-quick:not(#_){position:relative;width:44px!important;min-width:44px!important;height:34px!important;min-height:34px!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:#fff!important;color:#2f5f9b!important;display:inline-flex;align-items:center;justify-content:center;box-shadow:none!important}'
  +'.app-header .cb-split .cb-quick+.cb-quick:not(#_){border-left:1px solid #e3e8f0!important}.app-header .cb-split .cb-quick svg{width:19px!important;height:19px!important}'
  +'.app-header .cb-split:has(#classroomBackupButton.backup-due) #classroomQuickBackup::after{content:"";position:absolute;top:3px;right:4px;width:8px;height:8px;border-radius:50%;background:#e39a3b;border:2px solid #fff}'
  +'.app-header #classroomUndoButton:not(#_){order:1;flex:none!important;box-sizing:border-box!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;min-width:36px!important;height:36px!important;min-height:36px!important;padding:0!important;margin:0!important;line-height:0!important;font-size:0!important;text-indent:0!important;border-radius:50%;border:1px solid #e9cfa5;background:#fffaf2;color:#b9771a}'
  +'.app-header #classroomUndoButton::before{content:"";display:block;width:20px;height:20px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M9 14 4 9l5-5%27/%3E%3Cpath d=%27M4 9h10.5a5.5 5.5 0 0 1 0 11H11%27/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M9 14 4 9l5-5%27/%3E%3Cpath d=%27M4 9h10.5a5.5 5.5 0 0 1 0 11H11%27/%3E%3C/svg%3E") center/contain no-repeat}'
  +'.app-header #classroomUndoButton::before{flex:none;margin:0;position:static!important;transform:translateX(-0.5px)}'
  +'.app-header #classroomUndoButton:disabled:not(#_){opacity:.45}'
  +'.app-header .classroom-privacy-button:not(#_){order:0;flex:none!important;box-sizing:border-box!important;display:inline-flex!important;align-items:center;justify-content:center;width:36px!important;min-width:36px!important;height:36px!important;min-height:36px!important;padding:0!important;margin:0!important;border:1px solid #cbd6e5!important;border-radius:50%!important;background:#fff!important;color:#2f5f9b!important;font-size:0!important}.app-header .classroom-privacy-button svg{width:19px!important;height:19px!important}'
  +'.app-header:not(#_){gap:6px!important;padding-left:10px!important;padding-right:10px!important}'
  /* Hochkant zeigt die Auswahl nur die Lerngruppe (ohne Fach); quer wie gehabt Fach · Klasse */
  +'@media (orientation:portrait){.app-header>.compact-navigation .compact-navigation-trail>.compact-navigation-chip:first-child:not(#_),.app-header>.compact-navigation .compact-navigation-trail>.compact-navigation-chip:first-child+.compact-navigation-separator:not(#_){display:none!important}}.app-header>.compact-navigation .compact-navigation-trail .compact-navigation-chip+.compact-navigation-separator+.compact-navigation-chip~*:not(#_){display:none!important}'
  +'.app-header>.compact-navigation:not(#_){flex:1 1 auto;min-width:0;margin:0!important;padding:0;border:0;background:transparent;box-shadow:none;position:static}'
  +'.app-header>.compact-navigation .compact-navigation-bar{min-height:38px;gap:0;padding:0 10px;border-radius:12px;background:#e7edf6;overflow:hidden;flex-direction:row}'
  +'.app-header>.compact-navigation .compact-navigation-arrow{order:2;flex:none;margin-left:4px;padding:0;color:#2f5f9b}.app-header>.compact-navigation .compact-navigation-arrow{width:28px;min-width:28px;height:28px;min-height:28px;border-radius:8px}.app-header>.compact-navigation .compact-navigation-arrow::after{width:8px;height:8px;left:9px;top:7px}.app-header>.compact-navigation.is-open .compact-navigation-arrow::after{top:11px}.app-header>.compact-navigation .compact-navigation-bar{padding:0 5px 0 10px}'
  +'.app-header>.compact-navigation .compact-navigation-trail{display:block;flex:1 1 auto;min-width:0;padding:0;background:transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13.5px;line-height:38px;text-align:center}'
  +'.app-header>.compact-navigation .compact-navigation-chip{display:inline;padding:0;background:none;box-shadow:none;border:0;font:inherit;font-weight:650;color:#243247}'
  +'.app-header>.compact-navigation .compact-navigation-chip+.compact-navigation-separator+.compact-navigation-chip~.compact-navigation-chip{font-weight:500;color:#66758a}'
  +'.app-header>.compact-navigation .compact-navigation-separator{display:inline;width:auto;height:auto;margin:0;background:none;border:0;transform:none}'
  +'.app-header>.compact-navigation .compact-navigation-separator::before{content:" · ";color:#8794a7}.app-header>.compact-navigation .compact-navigation-separator::after{display:none}'
  +'.app-header>.compact-navigation .compact-navigation-flyout{position:fixed;left:0;right:0;top:auto;bottom:0;max-height:78dvh;overflow:auto;z-index:9500;margin:0;padding:26px 16px calc(20px + env(safe-area-inset-bottom));border-radius:20px 20px 0 0;background:#fff;box-shadow:0 -12px 34px #1c2b4633;transform:translateY(16px)}'
  +'.app-header>.compact-navigation.is-open .compact-navigation-flyout{transform:translateY(0)}'
  +'.app-header>.compact-navigation .compact-navigation-flyout::before{content:"";position:absolute;top:9px;left:50%;width:40px;height:5px;margin-left:-20px;border-radius:3px;background:#cbd6e5}'
  +'.app-header>.compact-navigation .compact-navigation-row{gap:8px;margin:0 0 12px}'
  +'.compact-navigation-backdrop:not([hidden]){position:fixed;inset:0;z-index:9400;background:#1c2b4645}'
  +'.phone-tabbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:9000;justify-content:space-around;padding:6px calc(18px + env(safe-area-inset-right)) max(env(safe-area-inset-bottom),10px) calc(18px + env(safe-area-inset-left));background:#fffffff2;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-top:1px solid #e3e8f0}'
  +'.phone-tabbar button{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:54px;padding:5px 0 4px;border:0;background:none;color:#8794a7;font:inherit;font-size:10.5px;font-weight:600;cursor:pointer}'
  +'.phone-tabbar button svg{width:24px;height:24px}.phone-tabbar button.on{color:#2f5f9b;font-weight:750}'
  +''
  +'.app-header>.compact-navigation .school-year{display:none}'
  +'.classroom-update-banner,.classroom-restore-banner,.classroom-storage-warning{margin:8px 10px 0}'
  +'.classroom-beamer-active .phone-tabbar{display:none}'
  +'}'
  /* Schlanker Noten-Manager (iPhone hochkant und quer): im Auswahl-Blatt nur Fach und Klasse */
  +'@media (max-width:540px) and (orientation:portrait),(max-height:500px) and (pointer:coarse) and (orientation:landscape){html.ph-noten .app-header>.compact-navigation .compact-navigation-trail .compact-navigation-chip+.compact-navigation-separator+.compact-navigation-chip~*{display:none}html.ph-noten .app-header>.compact-navigation :is(.half-year-picker,.exam-picker){display:none}html .app-header>.compact-navigation :is(.rename-row-button,.add-subject-button){display:none!important}html.ph-noten .app-header>.compact-navigation .compact-navigation-flyout::after{content:"Eintragen: mündliche Noten, Hausaufgaben und Material im Bereich „Unterricht“. Tests, Klassenarbeiten, neue Seiten und Schülerlisten am Mac oder iPad.";display:block;margin-top:14px;padding:10px 12px;border-radius:12px;background:#f7f9fc;color:#66758a;font-size:12.5px;line-height:1.45}}'
  /* iPhone quer: Leiste als schmale Spalte am linken Rand, Inhalt daneben */
  +'@media (max-height:500px) and (pointer:coarse) and (orientation:landscape){'
  +'body:not(#_){padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) calc(68px + env(safe-area-inset-left))}'
  +'.phone-tabbar:not(#_){top:0;bottom:0;right:auto;width:calc(68px + env(safe-area-inset-left));box-sizing:border-box;flex-direction:column;justify-content:center;gap:4px;padding:env(safe-area-inset-top) 4px env(safe-area-inset-bottom) calc(4px + env(safe-area-inset-left));border-top:0;border-right:1px solid #e3e8f0}'
  +'.phone-tabbar button:not(#_){flex:none;min-height:58px}'
  +'.app-header:not(#_){padding:6px 10px!important}'
  +'}';
 document.head.append(st);
})();
/* 8.42: iPhone hochkant – kleines Fachkürzel („Ek“) als Chip neben der Klasse in der Kopfzeile */
(()=>{
 const MAP={'erdkunde':'Ek','geographie':'Ek','geschichte':'Ge','englisch':'En','mathematik':'Ma','mathe':'Ma','deutsch':'De','latein':'La','französisch':'Fr','franzoesisch':'Fr','biologie':'Bio','chemie':'Ch','physik':'Ph','musik':'Mu','kunst':'Ku','sport':'Sp','religion':'Re','ev. religion':'Re','kath. religion':'Re','evangelische religion':'Re','katholische religion':'Re'};
 const abbr=name=>{const n=String(name||'').trim();if(!n)return '';const k=n.toLocaleLowerCase('de-DE');if(MAP[k])return MAP[k];for(const [key,v] of Object.entries(MAP))if(k.startsWith(key))return v;const w=n.replace(/[^A-Za-zÄÖÜäöüß]/g,'');return w.slice(0,1).toLocaleUpperCase('de-DE')+w.slice(1,2).toLocaleLowerCase('de-DE')};
 let planned=false;
 function sync(){planned=false;for(const trail of document.querySelectorAll('.app-header>.compact-navigation .compact-navigation-trail')){const chips=[...trail.querySelectorAll(':scope>.compact-navigation-chip')];if(chips.length<2)continue;const a=abbr(chips[0].textContent),c=chips[1];if(c.dataset.fach!==a){if(a){c.dataset.fach=a;c.setAttribute('aria-label',chips[0].textContent.trim()+' · '+c.textContent.trim())}else delete c.dataset.fach}}}
 /* 10.95: gemeinsamer Beobachter */if(typeof classroomOnDomChange==='function')classroomOnDomChange(()=>{planned=false;sync()});else new MutationObserver(()=>{if(!planned){planned=true;requestAnimationFrame(sync)}}).observe(document.body,{childList:true,subtree:true,characterData:true});sync();
 const st=document.createElement('style');st.textContent='@media (max-width:540px) and (orientation:portrait) and (pointer:coarse){.app-header>.compact-navigation .compact-navigation-trail>.compact-navigation-chip[data-fach]::after{content:attr(data-fach);display:inline-flex;align-items:center;margin-left:8px;padding:1px 8px;border-radius:999px;background:#fff;color:#2f5f9b;font-size:12.5px;font-weight:700;line-height:18px;vertical-align:middle;box-shadow:inset 0 0 0 1px #cbd6e5}}';document.head.append(st);
})();
/* 8.44: iPhone – kein Pfeil neben Klasse/Fach; ein Tipp auf das Feld öffnet die Auswahl */
(()=>{const st=document.createElement('style');st.textContent='@media (max-width:540px) and (orientation:portrait) and (pointer:coarse),(max-height:500px) and (orientation:landscape) and (pointer:coarse){.app-header>.compact-navigation .compact-navigation-arrow{display:none}.app-header>.compact-navigation .compact-navigation-bar{padding:0 12px;cursor:pointer}}';document.head.append(st)})();
/* 9.01: iPhone – „Aktuell“ (Stundenplan) und „Hilfe“ als normale Seiten wie „Unterricht“ und „Noten“: Karte mit 6 px Rand
   zwischen Kopfzeile und Leiste, ohne Abdunkeln, Griff, ✕ und Wegwischen. */
(()=>{
 if(window!==parent)return;
 const set=()=>{if(!document.documentElement.classList.contains('is-phone'))return;const f=[...document.querySelectorAll('#view-sitzplan,#view-noten')].map(x=>x.getBoundingClientRect()).find(r=>r.height>0);if(!f)return;const r=document.documentElement.style;
  /* 11.48: randlos – von der Kopfzeile bis zur Leiste, ohne Spalt, durch den man dahinter schauen kann */const tb=document.querySelector('.phone-tabbar')?.getBoundingClientRect(),port=innerHeight>innerWidth;r.setProperty('--ph-page-top',Math.round(f.top)+'px');r.setProperty('--ph-page-bottom',Math.round(port&&tb&&tb.height?innerHeight-tb.top:innerHeight-f.bottom)+'px');r.setProperty('--ph-page-left',Math.round(!port&&tb&&tb.width?tb.right:f.left)+'px');r.setProperty('--ph-page-right',Math.round(innerWidth-f.right)+'px')};
 set();addEventListener('resize',set);setTimeout(set,800);new MutationObserver(set).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 const P='html.is-phone',st=document.createElement('style');st.textContent=
  P+' .tt-sheet:not(#_){inset:auto;left:var(--ph-page-left,6px);right:var(--ph-page-right,6px);top:var(--ph-page-top,62px);bottom:var(--ph-page-bottom,80px);z-index:8990}'
  +P+' .tt-sheet .tt-back:not(#_){display:none}'
  +P+' .tt-sheet .tt-panel:not(#_):not(#__):not(#___){position:absolute;inset:0;top:0;left:0;right:0;bottom:0;max-height:none;border:0;border-radius:0;box-shadow:none;transform:none!important;padding-bottom:0}'
  +P+' .tt-sheet :is(.tt-grab,.tt-x):not(#_){display:none}'+P+' .tt-sheet .tt-head:not(#_){padding:16px 16px 6px}'+P+' .tt-sheet .tt-head b:not(#_){font-size:19px}'
  +P+' dialog.classroom-help[open]:not(#_):not(#__):not(#___):not(#____){position:fixed;inset:auto;left:var(--ph-page-left,6px);right:var(--ph-page-right,6px);top:var(--ph-page-top,62px);bottom:var(--ph-page-bottom,80px);width:auto;max-width:none;height:auto;max-height:none;margin:0;border:0;border-radius:0;box-shadow:none;transform:none!important;z-index:8990}'
  +P+'.help-close):not(#_){display:none!important}';
 document.head.append(st);
})();

/* 11.48: iPhone – alle Hauptfenster randlos: Sitzplan, Unterricht und Noten füllen den Bereich zwischen Kopfzeile und Leiste ganz aus */
(()=>{
 if(window!==parent)return;
 const CSS='html.is-phone body:not(#_):not(#__){background:#fff!important}html.is-phone body:has(>.container>.grid-container):not(#_):not(#__):not(#___){padding:0!important}html.is-phone body>.container>.grid-container:not(#_):not(#__){border-radius:0!important;border-width:0!important;box-shadow:none!important;min-height:100%}'
  +'html.is-phone main:has(>div>section.panel):not(#_):not(#__):not(#___){padding:0!important}html.is-phone main>div>section.panel:not(#_):not(#__){border-radius:0!important;border-width:0!important;box-shadow:none!important}';
 const apply=()=>{const on=document.documentElement.classList.contains('is-phone');for(const f of document.querySelectorAll('#view-sitzplan,#view-noten')){let d;try{d=f.contentDocument}catch{continue}if(!d||!d.documentElement)continue;
  if(d.documentElement.classList.contains('is-phone')!==on)d.documentElement.classList.toggle('is-phone',on);if(d.head&&!d.getElementById('ph-full-css')){const st=d.createElement('style');st.id='ph-full-css';st.textContent=CSS;d.head.append(st)}}};
 {const st=document.createElement('style');st.textContent='html.is-phone body:not(#_):not(#__){background:#fff!important}';document.head.append(st)}
 for(const f of document.querySelectorAll('#view-sitzplan,#view-noten'))f.addEventListener('load',apply);
 new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:['class']});apply();setTimeout(apply,600);setTimeout(apply,2500);
})();
;

/* ==== pins.js ==== */
/* 11.41/11.42: Noten-Seiten anheften (neu; am iPhone ohne Nadel)
   – Auf jeder Noten-Seite: Nadel-Knopf links neben dem Papierkorb (bzw. am Ende der Knöpfe). Ein Tipp heftet an oder löst; angeheftet = orange.
   – Kopfleiste rechts neben „?“: Nadel mit Zahl der angehefteten Seiten; orange, wenn die offene Seite angeheftet ist.
     Tipp: eine angeheftete Seite → direkt hin; mehrere → kleines Menü (× löst einen Pin). Höchstens 6 Seiten, über alle Klassen und Fächer.
   Gesichert im Backup (Schlüssel classroom-pins-v1). */
(()=>{
 const KEY='classroom-pins-v1',MAX=6;
 const load=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {pins:Array.isArray(x.pins)?x.pins:[]}}catch{return {pins:[]}}};
 const store=d=>{try{localStorage.setItem(KEY,JSON.stringify({pins:d.pins}))}catch{}};
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const NF=()=>document.getElementById('view-noten');
 const NFw=()=>{try{return NF()?.contentWindow||null}catch{return null}};
 const ev=(w,x)=>{try{return w.eval(x)}catch{return null}};
 const notenOn=()=>{const f=NF();return !!f&&!f.hidden};
 const PIN='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path class="pp" d="M9 3h6l-1 6 4 3v2H6v-2l4-3z"/><path d="M12 14v7"/></svg>';
 const crumbs=()=>[...document.querySelectorAll('.compact-navigation-bar *')].filter(e=>!e.children.length&&!e.closest('[data-school-year]')).map(e=>e.textContent.trim()).filter(t=>t&&t!=='▾'&&t!=='▴'&&!/^Schuljahr/.test(t));
 /* Die gerade offene Seite: Fach, Klasse, Seite – und eine lesbare Beschriftung */
 function current(){if(!notenOn())return null;const w=NFw();if(!w)return null;const s=ev(w,'typeof currentSubject!=="undefined"?currentSubject:null'),c=ev(w,'typeof currentClassId!=="undefined"?currentClassId:null'),p=ev(w,'typeof activePage!=="undefined"?activePage:null');if(!s||!c||!p)return null;
  const cr=crumbs(),cls=(cr.find(t=>/^Klasse\b/.test(t))||cr[1]||'').replace(/^Klasse\s+/,''),subj=cr[0]||'';
  const info=ev(w,'(()=>{const g=subjectExamGroups(currentSubject),pg=customPagesFor(currentSubject).find(x=>x.key===activePage),own=g.find(x=>x.pages?.includes(activePage)),hy=own?.halfYearId&&g.find(x=>x.id===own.halfYearId);return JSON.stringify({pg:pg?.label||"",own:own?.label||"",hy:hy?.label||"",ex:/^exam/.test(own?.id||"")})})()');let page=cr.at(-1)||p;try{const I=JSON.parse(info);const parts=[I.own||I.pg];if(I.pg&&I.own&&I.pg!==I.own&&(!I.ex||I.pg!=='Ergebnisse'))parts.push(I.pg);if(!I.own&&/^homework/.test(p))parts.unshift('Hausaufgaben');if(I.hy&&!/Quartal/.test(I.pg))parts.push(I.hy.replace('Halbjahr','Hj.'));page=parts.filter(Boolean).join(' · ')||page}catch{}
  let topic='';try{const d=w.document;const inp=[...d.querySelectorAll('input[type=text]')].find(i=>i.offsetParent&&/Thema/.test(i.closest('label')?.textContent||i.previousElementSibling?.textContent||i.parentElement?.textContent||''));topic=(inp?.value||'').trim()}catch{}if(topic&&page.split(' · ').includes(topic))topic='';
  return {s,c,p,cls,page,subj,topic,id:s+'|'+c+'|'+p}}
 function toggle(){const d=load(),c=current();if(!c)return;const i=d.pins.findIndex(x=>x.id===c.id);if(i>=0)d.pins.splice(i,1);else{if(d.pins.length>=MAX){alert('Es können höchstens '+MAX+' Seiten angeheftet sein. Löse zuerst eine – oben über die Nadel neben „?“.');return}d.pins.push(c)}store(d);sync()}
 /* 11.43: auch Lektionen/Einheiten aus „Unterricht“ (Nadel neben „Aktuelle Einheit“) */
 const has=id=>load().pins.some(x=>x.id===id);
 function toggleObj(o){const d=load(),i=d.pins.findIndex(x=>x.id===o.id);if(i>=0)d.pins.splice(i,1);else{if(d.pins.length>=MAX){alert('Es können höchstens '+MAX+' Seiten angeheftet sein. Löse zuerst eine – oben über die Nadel neben „?“.');return}d.pins.push(o)}store(d);sync()}
 let busy=false;
 async function goEin(t){document.querySelector('[data-view="unterricht"]')?.click();await new Promise(r=>setTimeout(r,200));
  const w=NFw(),cs=w&&ev(w,'currentSubject'),cc=w&&ev(w,'currentClassId');if(cs!==t.s||cc!==t.c){if(typeof classroomCall==='function')await classroomCall(classroomNotes,'classroom:select-class',{subject:t.s,classId:t.c});await new Promise(r=>setTimeout(r,250))}
  try{await document.getElementById('view-sitzplan')?.contentWindow?.classroomEinheiten?.open(t.sel)}catch{}}
 async function go(id){if(busy)return;const d=load(),t=d.pins.find(x=>x.id===id);if(!t)return;busy=true;
  if(t.kind==='ein'){try{await goEin(t)}finally{busy=false;setTimeout(sync,150)}return}
  try{if(!notenOn()){document.getElementById('tab-noten')?.click();await new Promise(r=>setTimeout(r,250))}const w=NFw();if(!w)return;
   const cur=current();if(!cur||cur.s!==t.s||cur.c!==t.c){if(typeof classroomCall==='function')await classroomCall(classroomNotes,'classroom:select-class',{subject:t.s,classId:t.c});else{ev(w,'setSubject('+JSON.stringify(t.s)+')');ev(w,'selectClass('+JSON.stringify(t.c)+')')}await new Promise(r=>setTimeout(r,120))}
   const ok=ev(w,'(customPagesFor(currentSubject).some(p=>p.key==='+JSON.stringify(t.p)+')||(typeof visibleBuiltInPages==="function"&&visibleBuiltInPages(currentSubject).some(p=>p.key==='+JSON.stringify(t.p)+')))');
   if(!ok){alert('Diese Seite gibt es nicht mehr – der Pin wird gelöst.');const d2=load();d2.pins=d2.pins.filter(x=>x.id!==id);store(d2)}else ev(w,'setPage('+JSON.stringify(t.p)+')');
   try{w.scrollTo(0,0)}catch{}}finally{busy=false;setTimeout(sync,150)}}

 /* ---------- Kopfleiste: Nadel rechts neben „?“ ---------- */
 let hb=null,menu=null;
 function header(){const help=document.querySelector('.classroom-global-actions>.classroom-help-button');if(!help)return null;
  if(!hb){hb=document.createElement('button');hb.type='button';hb.className='cm-hpin';hb.setAttribute('aria-haspopup','menu');hb.innerHTML=PIN+'<span class="cm-hpin-n" hidden></span>';hb.onclick=e=>{e.stopPropagation();openMenu()}}
  if(!hb.isConnected||hb.previousElementSibling!==help&&!(hb.previousElementSibling?.classList.contains('classroom-privacy-button')&&hb.previousElementSibling.previousElementSibling===help)){(help.nextElementSibling?.classList.contains('classroom-privacy-button')?help.nextElementSibling:help).after(hb)}
  try{const o=getComputedStyle(help).order;if(hb.style.order!==o)hb.style.order=o}catch{}
  /* 11.48: Rahmen, Hintergrund, Höhe wie der „?“-Knopf */
  try{const cs=getComputedStyle(help);for(const k of ['height','minHeight','borderRadius','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','backgroundColor','color','boxShadow'])if(cs[k]!=null&&hb.style[k]!==cs[k])hb.style[k]=cs[k];const wd=help.getBoundingClientRect().width;if(wd>20){const v=wd+'px';if(hb.style.width!==v){hb.style.width=v;hb.style.minWidth=v}}}catch{}return hb}
 function closeMenu(){if(menu){menu.remove();menu=null;hb?.setAttribute('aria-expanded','false')}}
 function openMenu(){if(menu){closeMenu();return}const d=load(),cur=current();
  if(d.pins.length===1&&(!cur||d.pins[0].id!==cur.id)){go(d.pins[0].id);return}
  menu=document.createElement('div');menu.className='cm-pinmenu';menu.setAttribute('role','menu');
  menu.innerHTML='<div class="cm-pm-h">Angeheftet</div>'+(d.pins.length?d.pins.map(x=>{const here=cur&&x.id===cur.id;return '<div class="cm-pm-row'+(here?' here':'')+'"><button type="button" role="menuitem" data-go="'+esc(x.id)+'"><i></i><span><b>'+esc(x.cls)+' · '+esc(x.page)+(x.topic?' „'+esc(x.topic)+'“':'')+'</b><small>'+esc(x.kind==='ein'||/^(Noten|Unterricht) · /.test(x.subj||'')?x.subj:'Noten · '+(x.subj||''))+(here?' · diese Seite':'')+'</small></span></button><button type="button" class="x" data-rm="'+esc(x.id)+'" aria-label="Lösen" title="Lösen">×</button></div>'}).join('')
   :'<p class="cm-pm-empty">Noch keine Seite angeheftet. Tippe auf einer Noten-Seite auf die Nadel neben dem Papierkorb.</p>');
  document.body.append(menu);const r=hb.getBoundingClientRect(),W=Math.min(300,innerWidth-16);menu.style.width=W+'px';menu.style.top=(r.bottom+8)+'px';menu.style.left=Math.max(8,Math.min(innerWidth-W-8,r.left+r.width/2-W/2))+'px';hb.setAttribute('aria-expanded','true');
  menu.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const id=b.dataset.go;closeMenu();go(id)});
  menu.querySelectorAll('[data-rm]').forEach(b=>b.onclick=e=>{e.stopPropagation();const d=load();d.pins=d.pins.filter(p=>p.id!==b.dataset.rm);store(d);closeMenu();sync();if(d.pins.length)openMenu()})}
 addEventListener('click',e=>{if(menu&&!menu.contains(e.target)&&e.target!==hb&&!hb?.contains(e.target))closeMenu()},true);
 addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});addEventListener('resize',closeMenu);

 /* ---------- Noten-Seite: Nadel links neben dem Papierkorb ---------- */
 const FCSS='button.pi-icon.cm-pin-pg:not(#_){color:#2f5f9b}button.pi-icon.cm-pin-pg svg{width:20px;height:20px}button.pi-icon.cm-pin-pg.on:not(#_):not(#__):not(#___):not(#____){background:#fff4e0!important;border-color:#e8a23a!important;border-width:1px!important;border-style:solid!important;color:#c2410c!important;box-shadow:none!important}button.pi-icon.cm-pin-pg.on .pp{fill:#f6c27a}html.cm-beamer button.cm-pin-pg{display:none!important}';
 function pageBtn(pinned){const w=NFw();let doc;try{doc=w&&w.document}catch{return}if(!doc||!doc.body)return;
  if(!doc.getElementById('cm-pin-css')){const s=doc.createElement('style');s.id='cm-pin-css';s.textContent=FCSS;doc.head.append(s)}
  const vis=[...doc.querySelectorAll('button.pi-icon:not(.cm-pin-pg)')].filter(b=>b.offsetParent),danger=vis.find(b=>b.classList.contains('pi-danger')),ref=danger||vis.at(-1);
  doc.querySelectorAll('.cm-pin-pg').forEach(b=>{if(!ref||b.parentElement!==ref.parentElement)b.remove()});if(!ref)return;
  let b=ref.parentElement.querySelector(':scope>.cm-pin-pg');
  if(!b){b=doc.createElement('button');b.type='button';b.className='pi-icon cm-pin-pg';b.innerHTML=PIN;b.onclick=()=>toggle();if(danger)danger.before(b);else ref.after(b)}
  /* 11.42: Aussehen von einem normalen Nachbarknopf übernehmen (Safari zeigt sonst den grauen Standardknopf) */
  try{const nb=vis.find(x=>!x.classList.contains('pi-danger')&&!/is-on|warn/.test(x.className)&&x.getAttribute('aria-pressed')!=='true')||ref,cs=w.getComputedStyle(nb);for(const k of ['width','height','minWidth','minHeight','borderRadius','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','backgroundColor','color','boxShadow','appearance','webkitAppearance'])if(cs[k]!=null&&b.style[k]!==cs[k])b.style[k]=cs[k]}catch{}
  try{const o=parseInt(w.getComputedStyle(ref).order)||0,want=String(danger?o-1:o+1);if(b.style.getPropertyValue('order')!==want)b.style.setProperty('order',want,'important')}catch{}
  if(b.classList.contains('on')!==pinned)b.classList.toggle('on',pinned);const t=pinned?'Angeheftet – tippen zum Lösen':'Diese Seite anheften (oben über die Nadel neben „?“ wieder öffnen)';if(b.title!==t){b.title=t;b.setAttribute('aria-label',pinned?'Seite lösen':'Seite anheften');b.setAttribute('aria-pressed',String(pinned))}}

 /* ---------- Abgleich ---------- */
 function sync(){const d=load(),cur=current(),pinned=!!(cur&&d.pins.some(x=>x.id===cur.id));let einId=null;try{einId=document.getElementById('view-sitzplan')?.contentWindow?.classroomEinheiten?.pinId?.()}catch{}const hon=pinned||!!(einId&&!notenOn()&&d.pins.some(x=>x.id===einId));
  /* Beschriftung der offenen Seite auffrischen (Thema kann sich ändern) */
  if(cur){let ch=false;for(const x of d.pins)if(x.id===cur.id&&(x.topic!==cur.topic||x.page!==cur.page||x.cls!==cur.cls)){Object.assign(x,{topic:cur.topic,page:cur.page,cls:cur.cls,subj:cur.subj});ch=true}if(ch)store(d)}
  const h=header();if(h){h.classList.toggle('on',hon);const n=h.querySelector('.cm-hpin-n');n.hidden=!d.pins.length;if(n.textContent!==String(d.pins.length))n.textContent=d.pins.length;const t=d.pins.length?'Angeheftete Seiten ('+d.pins.length+')':'Angeheftete Seiten';if(h.title!==t){h.title=t;h.setAttribute('aria-label',t)}}
  if(notenOn())pageBtn(pinned)}
 let st=0;const later=()=>{clearTimeout(st);st=setTimeout(sync,120)};
 const css=document.createElement('style');css.textContent='.classroom-global-actions>.cm-hpin{position:relative;display:inline-grid;place-items:center;box-sizing:border-box;width:42px;min-width:42px;padding:0!important;flex:none;align-self:stretch}.classroom-global-actions>.cm-hpin svg{width:22px;height:22px;stroke-width:2}'
  +'.classroom-global-actions>.cm-hpin.on:not(#_):not(#__){background:#fff4e0!important;border-color:#e8a23a!important;color:#c2410c!important}.cm-hpin.on .pp{fill:#f6c27a}'
  +'.cm-hpin-n{position:absolute;top:-9px;right:-8px;z-index:2;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:20px;height:18px;padding:0 5px;border-radius:9px;border:2px solid #fff;background:#2f5f9b;color:#fff;font:700 10.5px/1 system-ui,-apple-system,sans-serif;white-space:nowrap;pointer-events:none}.cm-hpin-n[hidden]{display:none}'
  +'.cm-pinmenu{position:fixed;z-index:9500;background:#fff;border:1px solid #dce3ef;border-radius:14px;box-shadow:0 12px 32px rgba(30,50,80,.18);padding:6px;font:14px/1.3 -apple-system,BlinkMacSystemFont,Inter,"Segoe UI",sans-serif;color:#243247}'
  +'.cm-pm-h{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#8a97aa;padding:6px 10px 4px}.cm-pm-row{display:flex;align-items:center;border-radius:10px}.cm-pm-row:hover{background:#f4f8fe}.cm-pm-row.here{background:#fff4e0}'
  +'.cm-pm-row>button[data-go]{flex:1;display:flex;align-items:center;gap:9px;min-height:48px;padding:7px 4px 7px 10px;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}.cm-pm-row i{flex:none;width:8px;height:8px;border-radius:50%;background:#c9d5e6}.cm-pm-row.here i{background:#e8a23a}'
  +'.cm-pm-row span{display:flex;flex-direction:column;min-width:0}.cm-pm-row b{font-weight:650}.cm-pm-row small{color:#66758a;font-size:12.5px}.cm-pm-row .x{flex:none;width:40px;height:40px;border:0;background:none;color:#8a97aa;font-size:18px;font-weight:700;cursor:pointer;border-radius:10px}.cm-pm-row .x:hover{color:#b42318;background:#fdecec}'
  +'.cm-pm-empty{margin:4px 10px 10px;color:#66758a;font-size:13px}'
  +'@media screen and (max-width:540px) and (orientation:portrait){.app-header .classroom-global-actions>.cm-hpin{display:none!important}}html.is-phone .classroom-global-actions>.cm-hpin{display:none!important}';
 document.head.append(css);
 /* alte Leiste (11.39) entfernen, Liste „zuletzt“ wird nicht mehr gebraucht */
 try{document.querySelectorAll('.cm-pins').forEach(x=>x.remove());const d=load();store(d)}catch{}
 let fobs=null,fdoc=null;function watchFrame(){const w=NFw();let doc;try{doc=w&&w.document}catch{return}if(!doc||!doc.body||doc===fdoc)return;fdoc=doc;fobs?.disconnect();fobs=new MutationObserver(later);fobs.observe(doc.body,{childList:true,subtree:true})}
 const start=()=>{sync();const nb=document.querySelector('.compact-navigation-bar');if(nb)new MutationObserver(later).observe(nb,{childList:true,subtree:true,characterData:true});
  document.querySelectorAll('[data-view]').forEach(t=>t.addEventListener('click',()=>{closeMenu();setTimeout(sync,80)}));const f=NF();if(f){f.addEventListener('load',()=>{watchFrame();setTimeout(sync,400)});new MutationObserver(()=>{closeMenu();later()}).observe(f,{attributes:true,attributeFilter:['hidden']})}watchFrame();
  const ga=document.querySelector('.classroom-global-actions');if(ga)new MutationObserver(later).observe(ga,{childList:true})};
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else start();setTimeout(()=>{watchFrame();sync()},1500);
 window.classroomPins={render:sync,current,go,has,toggleObj};
})();
;

/* ==== quickview.js ==== */
/* 8.81: Noten-Schnellansicht am Mac/iPad – im Unterrichts-Manager zeigt der Knopf „Noten“ die Notenkarten (wie auf dem iPhone)
   in der linken Spalte neben dem Sitzplan. Es gibt nur EINEN Noten-Manager: sein Rahmen wird dafür über die linke Spalte gelegt. */
(()=>{
 const KEY='classroom-quickview-v1',get=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
 const nf=()=>document.getElementById('view-noten'),sf=()=>document.getElementById('view-sitzplan');
 let active=false;
 const view=()=>{try{return localStorage.getItem('classroom-manager-last-view-v1')||'noten'}catch{return 'noten'}};
 function sync(){const f=sf();try{const b=f?.contentDocument?.querySelector('[data-quickview]');if(b){const on=get(),t=on?'Noten-Schnellansicht schließen':'Noten der Klasse neben dem Sitzplan zeigen';if(b.getAttribute('aria-pressed')!==String(on))b.setAttribute('aria-pressed',String(on));if(b.title!==t)b.title=t}}catch{}}
 function off(){if(!active)return;active=false;const n=nf(),s=sf();try{unfreeze(n,s,s?.contentDocument)}catch{}if(n){n.classList.remove('cm-quick');n.removeAttribute('style');n.hidden=view()!=='noten'}try{s?.contentDocument?.documentElement.classList.remove('cm-quick-on')}catch{}try{n?.contentWindow?.classroomQuickViewSet?.(false)}catch{}}
 function freeze(n,s,doc){if(n.dataset.frozen)return;n.dataset.frozen='1';n.style.pointerEvents='none';if(getComputedStyle(s).position==='static'){s.dataset.qvPos='1';s.style.position='relative'}s.style.zIndex='6';if(!doc.getElementById('cm-qf-style')){const st=doc.createElement('style');st.id='cm-qf-style';st.textContent='html.cm-quick-frozen,html.cm-quick-frozen body{background:transparent!important}html.cm-quick-frozen .container>.panel{visibility:hidden!important}';doc.head.append(st)}doc.documentElement.classList.add('cm-quick-frozen')}
 function unfreeze(n,s,doc){if(!n?.dataset.frozen)return;delete n.dataset.frozen;n.style.pointerEvents='';s.style.zIndex='';if(s.dataset.qvPos){delete s.dataset.qvPos;s.style.position=''}try{doc?.documentElement.classList.remove('cm-quick-frozen')}catch{}}
 function layout(){
  const n=nf(),s=sf(),want=get()&&view()==='sitzplan'&&!document.documentElement.classList.contains('is-phone')&&!document.documentElement.classList.contains('classroom-beamer-active');
  sync();if(!want||!n||!s){off();return}
  let doc;try{doc=s.contentDocument}catch{}const panel=doc?.querySelector('.container>.panel');if(!panel||doc.documentElement.classList.contains('classroom-beamer')){off();return}
  /* 9.28: Ist im Unterrichts-Manager ein Fenster offen (z. B. Zufallsgruppen), bleibt die Noten-Spalte stehen („eingefroren“, nicht bedienbar);
     der Sitzplan-Rahmen liegt dann darüber und lässt sie durchscheinen, das Fenster liegt obenauf. */
  if([...doc.querySelectorAll('dialog[open]')].some(d=>{try{return d.matches(':modal')}catch{return true}})){if(active)freeze(n,s,doc);else off();return}else unfreeze(n,s,doc);
  const ws=n.parentElement.getBoundingClientRect(),sr=s.getBoundingClientRect(),r=panel.getBoundingClientRect();if(r.width<200){off();return}
  const top=Math.max(r.top,0),bottom=Math.min(r.bottom,s.clientHeight-12);
  /* 9.75: nur ändern, was sich wirklich ändert – der 0,7-s-Takt löste sonst jedes Mal Beobachter im Sitzplan aus */
  if(n.hidden)n.hidden=false;if(!n.classList.contains('cm-quick'))n.classList.add('cm-quick');
  {const off=n._qvOff||{x:0,y:0},want={position:'absolute',left:(sr.left-ws.left+r.left+off.x)+'px',top:(sr.top-ws.top+top+off.y)+'px',width:r.width+'px',height:Math.max(200,bottom-top)+'px',zIndex:'5'};for(const [k,v] of Object.entries(want))if(n.style[k]!==v)n.style[k]=v;
  /* 8.91: exakt auf die Einstellungs-Spalte legen (Versatz durch Rahmen/Abstände des Elternelements ausgleichen; Versatz wird gemerkt) */const goal={x:sr.left+r.left,y:sr.top+top},got=n.getBoundingClientRect(),dx=goal.x-got.left,dy=goal.y-got.top;if(Math.abs(dx)>.5||Math.abs(dy)>.5){n._qvOff={x:off.x+dx,y:off.y+dy};n.style.left=(parseFloat(n.style.left)+dx)+'px';n.style.top=(parseFloat(n.style.top)+dy)+'px'}}
  if(!doc.documentElement.classList.contains('cm-quick-on'))doc.documentElement.classList.add('cm-quick-on');
  /* 10.03: erst als aktiv merken, wenn der Noten-Manager die Schnellansicht wirklich übernommen hat (sonst beim nächsten Takt erneut) */
  if(!active||n.contentWindow?.classroomQuickView!==true){try{if(typeof n.contentWindow?.classroomQuickViewSet==='function'){n.contentWindow.classroomQuickViewSet(true);active=true}}catch{}}
 }
 window.classroomQuickToggle=()=>{try{localStorage.setItem(KEY,get()?'0':'1')}catch{}layout()};
 window.classroomQuickLayout=layout;
 /* 8.82: Karte zur angetippten Person zeigen (nur wenn die Schnellansicht offen ist) */
 window.classroomQuickFocus=name=>{if(!active)return;try{nf()?.contentWindow?.classroomCardsFocus?.(name)}catch{}};
 const st=document.createElement('style');st.textContent='.workspace iframe.cm-quick{border:1px solid #dce3ef!important;border-radius:18px;background:#fff;box-shadow:0 1px 3px #233d600d}';document.head.append(st);
 /* Ansichtswechsel, Größe, Scrollen im Sitzplan */
 if(typeof selectView==='function'){const o=selectView;window.selectView=selectView=function(v){off();const r=o.apply(this,arguments);setTimeout(layout,0);return r}}
 addEventListener('resize',()=>requestAnimationFrame(layout));
 let hooked=null;setInterval(()=>{if(document.hidden)return;const w=sf()?.contentWindow;if(w&&w!==hooked){hooked=w;try{w.addEventListener('scroll',()=>requestAnimationFrame(layout),{passive:true});w.addEventListener('resize',()=>requestAnimationFrame(layout));new MutationObserver(()=>requestAnimationFrame(layout)).observe(w.document.body,{subtree:true,attributes:true,attributeFilter:['open']})}catch{}}if(get())layout();else if(active)off();else sync()},700);
 new MutationObserver(()=>layout()).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
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
 function scan(root){if(!root||root.nodeType!==1)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){/* 9.75: erst der schnelle Zahlentest, dann die teure Prüfung der Umgebung */const value=node.textContent;if(!/^\s*[+−-]?\d+\.\d+\s*(?:%|Punkte)?\s*$/.test(value))continue;if(node.parentElement.closest('script,style,textarea,input,[contenteditable=true],[data-app-version],[data-app-version-copy],[data-no-decimal]'))continue;node.textContent=value.replace(/(\d)\.(\d)/,'$1,$2')}}
 const observer=new MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='characterData')scan(r.target.parentElement);else for(const node of r.addedNodes)scan(node.nodeType===1?node:node.parentElement)}watch()});function watch(){observer.observe(document.body,{childList:true,subtree:true,characterData:true})}scan(document.body);watch();
})();
;

/* ==== design-extras.js ==== */
/* Design 6.93 – Hauptfenster. Jede Rubrik ist eigenständig und lässt sich einzeln entfernen.
   B) „Gespeichert ✓“: kurze Rückmeldung, wenn eine Eingabe in Noten- oder Unterrichts-Manager gespeichert wurde. */
(()=>{
 const relevant=k=>!!k&&(k==='classroom-manager-common-v2'||k.startsWith('notenrechner-')||k.startsWith('sitzplan_'))&&!/aktive|aktuelle|navigation|undo|selected/.test(k);
 const started=Date.now();let lastInput=0,timer=null,pill=null;
 // Eingaben (auch in den Bereichen) merken – Speichervorgänge ohne Eingabe (z. B. beim Start) zeigen nichts an.
 // Nur Bearbeitungen zählen: Eingaben, Auswahl, Einfügen – Klicks nur in Tabellen, Sitzplan und Dialogen (nicht in der Navigation).
 const mark=e=>{if(e.type==='pointerdown'&&!e.target?.closest?.('tbody,.room-grid,.classroom-quick,dialog,[role=menu],.homework-status-menu'))return;if(e.type==='keydown'&&!e.target?.closest?.('input,select,textarea,[contenteditable]'))return;lastInput=Date.now()};
 const watch=win=>{try{if(win.__savedWatch)return;win.__savedWatch=true;for(const t of ['pointerdown','keydown','input','change','drop','paste'])win.document.addEventListener(t,mark,true)}catch{}};
 watch(window);const watchFrames=()=>document.querySelectorAll('iframe').forEach(f=>{try{if(f.contentWindow)watch(f.contentWindow)}catch{}f.addEventListener('load',()=>{try{f.contentWindow.__savedWatch=false;watch(f.contentWindow)}catch{}})});
 function show(){
  const actions=document.querySelector('.classroom-global-actions'),undo=document.getElementById('classroomUndoButton');if(!actions||!undo)return;
  if(!pill||!pill.isConnected){pill=document.createElement('span');pill.className='classroom-saved-pill';pill.setAttribute('role','status');pill.setAttribute('aria-live','polite');pill.textContent='Gespeichert ✓';actions.append(pill)}
  const a=actions.getBoundingClientRect(),u=undo.getBoundingClientRect();pill.style.left=(u.left-a.left+u.width/2)+'px';
  pill.classList.add('is-on');clearTimeout(timer);timer=setTimeout(()=>pill.classList.remove('is-on'),1300);
 }
 window.addEventListener('storage',e=>{if(e.storageArea!==localStorage||!relevant(e.key))return;if(Date.now()-started<5000||Date.now()-lastInput>4000)return;show()});
 const st=document.createElement('style');st.textContent='.classroom-global-actions{position:relative}.classroom-saved-pill{position:absolute;top:calc(100% + 6px);transform:translate(-50%,-4px);z-index:50;padding:3px 10px;border-radius:999px;background:#e5f4e4;color:#1d6b3a;border:1px solid #bfe0bc;font-size:12.5px;font-weight:650;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}.classroom-saved-pill.is-on{opacity:1;transform:translate(-50%,0)}@media print{.classroom-saved-pill{display:none}}';document.head.append(st);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchFrames,{once:true});else watchFrames();setTimeout(watchFrames,1500);
})();

/* F) Erscheinungsbild Hell · Automatisch · Dunkel (Logo antippen → Farbgestaltung). Automatisch folgt der Systemeinstellung.
   Dunkel wird über einen Farbfilter erzeugt (Farbtöne der Noten bleiben erkennbar, Bilder werden zurückgedreht). Zurücknehmen: diesen Block entfernen. */
(()=>{
 const KEY='classroom-manager-appearance-v1',mq=matchMedia('(prefers-color-scheme: dark)');
 const get=()=>{try{return localStorage.getItem(KEY)||'auto'}catch{return 'auto'}};
 const apply=()=>{const v=get(),dark=v==='dark'||(v==='auto'&&mq.matches);document.documentElement.classList.toggle('classroom-dark',dark);for(const b of document.querySelectorAll('[data-appearance]'))b.setAttribute('aria-checked',String(b.dataset.appearance===v))};
 mq.addEventListener?.('change',apply);window.addEventListener('storage',e=>{if(e.key===KEY)apply()});
 function inject(){const d=document.querySelector('.classroom-theme-dialog');if(!d||d.querySelector('.appearance-row'))return;
  const row=document.createElement('div');row.className='appearance-row';row.innerHTML='<span>Erscheinungsbild</span><div class="appearance-seg" role="radiogroup" aria-label="Erscheinungsbild"><button type="button" role="radio" data-appearance="light">Hell</button><button type="button" role="radio" data-appearance="auto" title="Wie in den Systemeinstellungen">Automatisch</button><button type="button" role="radio" data-appearance="dark">Dunkel</button></div>';
  row.querySelectorAll('[data-appearance]').forEach(b=>b.onclick=()=>{try{localStorage.setItem(KEY,b.dataset.appearance)}catch{}apply()});
  const choices=d.querySelector('.classroom-theme-choices');(choices||d.querySelector('p')||d.firstChild).before(row);apply()}
 new MutationObserver(inject).observe(document.body||document.documentElement,{childList:true});
 const st=document.createElement('style');st.textContent='html.classroom-dark{filter:invert(.9) hue-rotate(180deg);background:#fff}html.classroom-dark img,html.classroom-dark video{filter:invert(1) hue-rotate(180deg)}html.classroom-dark dialog{filter:invert(.9) hue-rotate(180deg)}html.classroom-dark dialog img{filter:none}/* 9.46: CSS wieder exakt wie 9.34 (Statusleiste); Hilfe auf dem iPhone (nicht modal, liegt im Seitenfilter) per Klasse ausnehmen */html.classroom-dark dialog.cm-nonmodal{filter:none}html.classroom-dark dialog.cm-nonmodal img{filter:invert(1) hue-rotate(180deg)}@media print{html.classroom-dark,html.classroom-dark dialog{filter:none!important}}'
  +'.appearance-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:6px 0 14px}.appearance-row>span{font-weight:650}.appearance-seg{display:inline-flex;gap:2px;padding:3px;border-radius:11px;background:#e7edf6}.appearance-seg>button{height:32px;padding:0 12px;border:0;border-radius:8px;background:transparent;color:#66778f;font:inherit;font-size:14.4px;cursor:pointer}.appearance-seg>button[aria-checked=true]{background:#fff;color:#243247;font-weight:650;box-shadow:0 2px 5px #233d6014}';
 document.head.append(st);apply();
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();inject()},{once:true});else inject();
})();

/* D) Navigationsmenü: Ab drei „＋“-Buttons in einer Zeile erscheint stattdessen „＋ Hinzufügen ▾“ mit Menü. Zurücknehmen: diesen Block entfernen. */
(()=>{
 function upgrade(){
  for(const m of document.querySelectorAll('.nav-add-menu'))if(!m.__btn?.isConnected)m.remove();
  for(const row of document.querySelectorAll('.compact-navigation-row')){
   if(row.querySelector(':scope .nav-add-menu-button'))continue;
   const adds=[...row.querySelectorAll('.add-subject-button')].filter(b=>!b.closest('.hide')&&!b.hidden&&b.getClientRects().length>0);
   if(adds.length<3)continue;
   adds.forEach(b=>b.classList.add('nav-add-bundled'));
   const wrap=document.createElement('span');wrap.className='nav-add-wrap';
   const btn=document.createElement('button');btn.type='button';btn.className='add-subject-button nav-add-menu-button';btn.setAttribute('aria-haspopup','menu');btn.setAttribute('aria-expanded','false');btn.textContent='＋ Hinzufügen ▾';
   const menu=document.createElement('div');menu.className='nav-add-menu';menu.setAttribute('role','menu');menu.hidden=true;
   for(const b of adds){const it=document.createElement('button');it.type='button';it.setAttribute('role','menuitem');it.textContent=b.textContent.replace(/^＋\s*/,'');it.onclick=e=>{e.stopPropagation();menu.hidden=true;b.click()};menu.append(it)}
   btn.onclick=e=>{e.stopPropagation();menu.hidden=!menu.hidden;btn.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden){const r=btn.getBoundingClientRect();menu.style.top=(r.bottom+6)+'px';menu.style.left=Math.min(r.left,innerWidth-230)+'px'}};
   menu.__btn=btn;wrap.append(btn);document.body.append(menu);(adds.at(-1).parentElement||row).append(wrap);
  }
 }
 document.addEventListener('click',e=>{for(const m of document.querySelectorAll('.nav-add-menu')){if(!m.__btn?.isConnected){m.remove();continue}if(!m.hidden&&!m.contains(e.target)&&!m.__btn.contains(e.target)){m.hidden=true;m.__btn.setAttribute('aria-expanded','false')}}});
 let q=false;const sched=()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;upgrade()})};
 const start=()=>{classroomOnDomChange(sched);sched()};
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
 const st=document.createElement('style');st.textContent='.compact-navigation-row .nav-add-bundled{display:none!important}.nav-add-wrap{position:relative;display:inline-flex}.nav-add-menu{position:fixed;z-index:9500;min-width:210px;padding:6px;border:1px solid #d6dfec;border-radius:12px;background:#fff;box-shadow:0 10px 26px #233d6026;display:flex;flex-direction:column;gap:2px}.nav-add-menu[hidden]{display:none}.nav-add-menu>button{text-align:left;padding:9px 12px;border:0;border-radius:8px;background:transparent;color:#243247;font:inherit;font-size:14.4px;cursor:pointer;white-space:nowrap}.nav-add-menu>button:hover,.nav-add-menu>button:focus-visible{background:#eef3fa}';document.head.append(st);
})();
;

/* ==== unit-preview.js ==== */
/* 11.22: „Ansehen“ am Mac – Vorschau einer Schülerseite (Übersetzungs-Trainer, Übungen, Lerneinheiten) oder einer Liste,
   ohne QR. Die Seite läuft mit ?vorschau=1: Speicher nur im Arbeitsspeicher, nichts wird gespeichert, keine Abgabe. */
(()=>{
 const css=`.cmpv{position:fixed;inset:0;z-index:2147483000;background:rgba(20,30,48,.42);display:flex;align-items:stretch;justify-content:center;padding:18px}
.cmpv-box{background:var(--paper,#fff);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.3);display:flex;flex-direction:column;width:min(1100px,100%);overflow:hidden}
.cmpv-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;background:#fff6e5;border-bottom:1px solid #f1d8a8;color:#7a4b00;font-weight:600}
.cmpv-t{flex:1;min-width:200px;font-size:.95rem}
.cmpv-bar button{height:40px;border-radius:10px;border:1px solid #d9c49a;background:#fff;color:#243247;font:inherit;font-weight:600;padding:0 14px;cursor:pointer}
.cmpv-bar button:hover{background:#fffaf0}
.cmpv-sol[hidden]{display:none!important}.cmpv-sheet[hidden]{display:none!important}.cmpv-bar button.cmpv-sheet[aria-pressed=true],.cmpv-bar button.cmpv-sol[aria-pressed=true]{background:#fff4e0;border-color:#e8a23a;color:#c2410c}
.cmpv-sol input{appearance:none;width:42px;height:24px;border-radius:12px;background:#c9d2df;position:relative;cursor:pointer;margin:0;transition:background .15s}
.cmpv-sol input::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .15s}
.cmpv-sol input:checked{background:#e8590c}.cmpv-sol input:checked::after{left:21px}
.cmpv iframe{flex:1;border:0;width:100%;background:#f6f8fc}
.cmpv-list{flex:1;overflow:auto;padding:16px 20px;color:#243247}
.cmpv-list h3{margin:14px 0 6px;font-size:.95rem;color:#66758a;text-transform:uppercase;letter-spacing:.04em}
.cmpv-list table{border-collapse:collapse;width:100%}.cmpv-list td{padding:6px 8px;border-bottom:1px solid #e6ebf3;vertical-align:top}
.cmpv-list td:first-child{font-weight:600;width:34%}.cmpv-list .info{color:#66758a;width:22%}
.cmpv-list .sol{color:#1f6b3a}.cmpv-list:not(.on) .sol{color:transparent;background:repeating-linear-gradient(90deg,#eef2f8 0 6px,#f6f8fc 6px 12px);border-radius:4px}
.cmpv-list .cmpv-note{color:#66758a;margin:0 0 8px}
@media (max-width:700px){.cmpv{padding:0}.cmpv-box{border-radius:0}}`;
 const st=document.createElement('style');st.textContent=css;document.head.append(st);
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 let cur=null;
 function close(){if(!cur)return;cur.remove();cur=null;document.removeEventListener('keydown',key,true)}
 function key(e){if(e.key==='Escape'){e.preventDefault();close();return}
  /* 11.61: Pfeiltasten blättern in der Vorschau durch die Stationen (auch wenn der Fokus noch außerhalb der Seite liegt) */if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&!e.altKey&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!(e.target&&(e.target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)))){try{const w=cur?.querySelector('iframe')?.contentWindow;if(typeof w?.cmPreviewStep==='function'){e.preventDefault();w.cmPreviewStep(e.key==='ArrowRight'?1:-1)}}catch{}}}
 /* o={title,url}  oder  o={title,html,solutions:true}  (html: Elemente mit class="sol" sind Lösungen) */
 window.classroomPreview=function(o){close();
  const box=document.createElement('div');box.className='cmpv';box.setAttribute('role','dialog');box.setAttribute('aria-label','Vorschau');
  box.innerHTML='<div class="cmpv-box"><div class="cmpv-bar"><span class="cmpv-t">👁 Vorschau · '+esc(o.title||'')+' · nichts wird gespeichert</span>'
   +'<button type="button" class="cmpv-sol" aria-pressed="false" hidden title="Lösungen direkt in der Seite zeigen – Station für Station">Lösungen</button>'
   +'<button type="button" class="cmpv-sheet" aria-pressed="false" hidden title="Alle Lösungen auf einer Seite (wie im Lehrerband)">Lösungsblatt</button>'
   +(o.url&&!o.noStudent?'<button type="button" data-restart title="Seite frisch laden – so wie ein Schüler sie zum ersten Mal sieht">Von vorn beginnen</button>':'')
   +'<button type="button" data-close>Schließen</button></div>'
   +(o.url?'<iframe title="Vorschau"></iframe>':'<div class="cmpv-list">'+(o.html||'')+'</div>')+'</div>';
  document.body.append(box);cur=box;document.addEventListener('keydown',key,true);
  box.addEventListener('click',e=>{if(e.target===box)close()});box.querySelector('[data-close]').onclick=close;
  /* 11.42: Knopf „Lösungen“ statt Schalter (links neben „Als Schüler starten“) */
  const sol=box.querySelector('.cmpv-sol'),chk={get checked(){return sol.getAttribute('aria-pressed')==='true'},set checked(v){sol.setAttribute('aria-pressed',String(!!v))},onchange:null};sol.onclick=()=>{chk.checked=!chk.checked;chk.onchange?.()};
  const sh=box.querySelector('.cmpv-sheet');sh.onclick=()=>{const on=sh.getAttribute('aria-pressed')!=='true';sh.setAttribute('aria-pressed',String(on));try{box.querySelector('iframe')?.contentWindow?.cmSolutionSheet?.(on)}catch{}};
  const offMsg=e=>{if(e.data&&e.data.type==='cm-sol-off'&&cur===box)sh.setAttribute('aria-pressed','false')};addEventListener('message',offMsg);box.addEventListener('remove',()=>removeEventListener('message',offMsg));
  if(o.url){const fr=box.querySelector('iframe');
   const load=()=>{chk.checked=false;sol.hidden=true;sh.hidden=true;sh.setAttribute('aria-pressed','false');fr.src='about:blank';setTimeout(()=>{fr.src=o.url},30)};
   /* die Seite meldet ihren Lösungs-Schalter evtl. erst nach dem Entpacken des Links – kurz nachsehen */fr.addEventListener('load',()=>{let n=0;const look=()=>{try{const w=fr.contentWindow;if(!w||w.location.href==='about:blank')return;if(typeof w.cmPreviewSolutions==='function'){sol.hidden=false;sh.hidden=typeof w.cmSolutionSheet!=='function';if(chk.checked)w.cmPreviewSolutions(true);return}}catch{return}if(++n<30)setTimeout(look,100)};look()});
   chk.onchange=()=>{try{fr.contentWindow.cmPreviewSolutions?.(chk.checked)}catch{}};
   const rs=box.querySelector('[data-restart]');if(rs)rs.onclick=load;load()}
  else{const L=box.querySelector('.cmpv-list');if(o.solutions){sol.hidden=false;chk.onchange=()=>L.classList.toggle('on',chk.checked)}else L.classList.add('on')}
  box.querySelector('[data-close]').focus();return box};
 window.classroomPreview.close=close;
})();
;
