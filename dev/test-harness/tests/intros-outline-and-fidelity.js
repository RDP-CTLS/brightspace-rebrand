const f=new File([await (await fetch('/original.zip')).blob()],'course.zip'); await setFile(f);
const R={};
// outline
const lines=[];(function walk(ul,d){for(const li of ul.children){const m=li.querySelector(':scope>.cmodule'),b=li.querySelector(':scope>.ctopic'),p=li.querySelector(':scope>.cpass');
  if(m)lines.push(' '.repeat(d)+'[M] '+m.textContent.trim().slice(0,40));
  else if(b)lines.push(' '.repeat(d)+(b.classList.contains('cintro')?'(i) ':'p ')+b.querySelector('.clabel').textContent.slice(0,40)+(b.querySelector('.chip-pass')?' {'+b.querySelector('.chip-pass').textContent+'}':''));
  else if(p)lines.push(' '.repeat(d)+'x '+p.textContent.trim().slice(0,50));
  const sub=li.querySelector(':scope>ul');if(sub)walk(sub,d+2);}})(document.querySelector('#expl-list>ul'),0);
R.outline=lines; R.introCount=Object.keys(MODEL.intros).length;
// open every intro; fidelity through the editor's sanitizer
const norm=s=>s.replace(/\s+/g,''); /* blocks are re-joined with newlines on export: compare text without whitespace */ const imgSig=d=>[...d.querySelectorAll('img')].map(i=>['src','width','height','style','alt'].map(a=>(i.getAttribute(a)||'').replace(/^https?:\/\/[^/]+/,'')).join('|'));
const rows=[]; const c=document.getElementById('pg-canvas');
for(const b of document.querySelectorAll('#expl-list .cintro')){ const key=b.dataset.entry, raw=await courseRawBody(key); let err='';
  try{EDITOR.openCoursePage(key,b.dataset.title,raw);}catch(e){err=String(e.message);}
  const blocks=c.querySelectorAll(':scope>.pgb').length; const falseEdit=Object.keys(EDITOR.courseEdits()).includes(key);
  [...c.querySelectorAll('.pgb-end button')].find(x=>/callout/i.test(x.textContent))?.click();
  const ed=EDITOR.courseEdits()[key]; const outHtml=ed&&ed.intro||''; 
  const o=new DOMParser().parseFromString(raw,'text/html').body; let n=new DOMParser().parseFromString(outHtml,'text/html').body;
  // the intro now exports inside the RDP card: step into it (drop the banner), then drop the added
  // callout (last child of the card body). Marker buttons become labelled <h3>s — not images — so the
  // image comparison is over NON-marker images, and label text is removed before the text compare.
  const cardEl=n.firstElementChild; let body=n;
  if(cardEl&&/border-radius/i.test(cardEl.getAttribute('style')||'')){const banner=cardEl.firstElementChild;if(banner)banner.remove();body=cardEl.lastElementChild||cardEl;}
  const last=body.lastElementChild; if(last)last.remove();
  body.querySelectorAll('h3').forEach(h=>{if(h.querySelector('span[style*="border-radius:50%"]')||h.querySelector('svg'))h.remove();});
  [...o.querySelectorAll('img')].forEach(i=>{if(markerName(i.getAttribute('src'),i.getAttribute('alt')))i.remove();});
  n=body;
  const oi=imgSig(o), ni=imgSig(n);
  rows.push({t:b.dataset.title.slice(0,26), kicker:b.dataset.kicker, carded:isTemplatedIntro(outHtml), rawKB:+(raw.length/1024).toFixed(1), blocks, falseEdit, payload:ed?Object.keys(ed).join():'none',
    textSame:norm(o.textContent)===norm(n.textContent), imgs:oi.length+'/'+ni.length, imgAttrsSame:JSON.stringify(oi)===JSON.stringify(ni), imgDiff:oi.map((x,i)=>x===ni[i]?null:[x.slice(0,110),(ni[i]||'').slice(0,110)]).filter(Boolean).slice(0,1),
    tables:o.querySelectorAll('table').length+'/'+n.querySelectorAll('table').length, links:o.querySelectorAll('a[href]').length+'/'+n.querySelectorAll('a[href]').length, iframes:o.querySelectorAll('iframe').length+'/'+n.querySelectorAll('iframe').length, err});}
R.rows=rows; R.editedBadges=document.querySelectorAll('#expl-list [data-edited]:not([hidden])').length; R.errs=__errs;
EDITOR.resetCourse(); return R;
