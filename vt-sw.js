/* 10.57: Offline-Speicher nur für die Schülerseite des iPad-Vokabeltests (eigener, enger Geltungsbereich).
   Mit Internet: immer die aktuelle Seite (und Kopie speichern). Ohne Internet (Flugmodus): die gespeicherte Kopie.
   Der Test selbst steht im QR-Code-Link (#…) und wird nie übertragen. */
const C='vt-v5',PAGE=new URL('./vokabeltest.html',self.location).href;/* 10.75 QR-Erzeuger · 12.28 QR-Leser · 12.79 PDF-Export des Ergebnisses */
const FILES=['./qr-code.js','./glyph-icons.js','./vendor/jsqr.js','./unit-pdf.js'].map(f=>new URL(f,self.location).href);
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll([PAGE,...FILES].map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('vt-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url),bare=u.href.split('#')[0].split('?')[0];if(e.request.method!=='GET'||u.origin!==self.location.origin)return;const key=FILES.includes(bare)?bare:(e.request.mode==='navigate'||bare===PAGE)?PAGE:null;if(!key)return;
 e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(key,cp)).catch(()=>{})}return r}).catch(()=>caches.match(key).then(r=>r||Response.error())))});
