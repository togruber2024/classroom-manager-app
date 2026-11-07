const CACHE='classroom-manager-v877';
const ASSETS=["./","./index.html","./Start.html","./app.js","./design.css","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./noten/index.html","./noten/noten.js","./sitzplan/index.html","./sitzplan/sitzplan.js","./vendor/pdfjs.js","./vendor/pdfjs-worker.js"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 for(const key of await caches.keys())if((key.startsWith('classroom-manager-v')||key.startsWith('classroom-preview-'))&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith((async()=>{
 const cache=await caches.open(CACHE);
 // Immer beim Server nachfragen (kurz per ETag, meist „unverändert“), damit eine neue Version nicht im Browser-Zwischenspeicher hängen bleibt.
 try{const response=await fetch(new Request(event.request,{cache:'no-cache'}));if(response.ok&&!new URL(event.request.url).searchParams.has('update-check'))await cache.put(event.request,response.clone());return response}catch(error){return await cache.match(event.request,{ignoreSearch:true})||Response.error()}
})())});

self.addEventListener('message',event=>{if(event.data?.type==='GET_CACHE_NAME'&&event.ports[0])event.ports[0].postMessage({cacheName:CACHE})});
