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
