/* 10.57: Offline-Speicher nur für die Schülerseite des iPad-Vokabeltests (eigener, enger Geltungsbereich).
   Mit Internet: immer die aktuelle Seite (und Kopie speichern). Ohne Internet (Flugmodus): die gespeicherte Kopie.
   Der Test selbst steht im QR-Code-Link (#…) und wird nie übertragen. */
const C='vt-v2',PAGE=new URL('./vokabeltest.html',self.location).href,QR=new URL('./qr-code.js',self.location).href;/* 10.75: QR-Erzeuger für die Abgabe per QR-Code */
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll([new Request(PAGE,{cache:'reload'}),new Request(QR,{cache:'reload'})])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('vt-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!(e.request.mode==='navigate'||u.href.split('#')[0].split('?')[0]===PAGE||u.href.split('?')[0]===QR))return;const key=u.href.split('?')[0]===QR?QR:PAGE;
 e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(key,cp)).catch(()=>{})}return r}).catch(()=>caches.match(key).then(r=>r||Response.error())))});
