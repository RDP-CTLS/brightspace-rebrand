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
const norm=s=>s.replace(/\s+/g,' ').trim(); const imgSig=d=>[...d.querySelectorAll('img')].map(i=>['src','width','height','style','alt'].map(a=>(i.getAttribute(a)||'').replace(/^https?:\/\/[^/]+/,'')).join('|'));
const rows=[]; const c=document.getElementById('pg-canvas');
for(const b of document.querySelectorAll('#expl-list .cintro')){ const key=b.dataset.entry, raw=await courseRawBody(key); let err='';
  try{EDITOR.openCoursePage(key,b.dataset.title,raw);}catch(e){err=String(e.message);}
  const blocks=c.querySelectorAll(':scope>.pgb').length; const falseEdit=Object.keys(EDITOR.courseEdits()).includes(key);
  [...c.querySelectorAll('.pgb-end button')].find(x=>/callout/i.test(x.textContent))?.click();
  const ed=EDITOR.courseEdits()[key]; const outHtml=ed&&ed.intro||''; 
  const o=new DOMParser().parseFromString(raw,'text/html').body, n=new DOMParser().parseFromString(outHtml,'text/html').body;
  // drop the added callout (last top-level element) before comparing
  const last=n.lastElementChild; if(last)last.remove();
  const oi=imgSig(o), ni=imgSig(n);
  rows.push({t:b.dataset.title.slice(0,26), kicker:b.dataset.kicker, rawKB:+(raw.length/1024).toFixed(1), blocks, falseEdit, payload:ed?Object.keys(ed).join():'none',
    textSame:norm(o.textContent)===norm(n.textContent), imgs:oi.length+'/'+ni.length, imgAttrsSame:JSON.stringify(oi)===JSON.stringify(ni), imgDiff:oi.map((x,i)=>x===ni[i]?null:[x.slice(0,110),(ni[i]||'').slice(0,110)]).filter(Boolean).slice(0,1),
    tables:o.querySelectorAll('table').length+'/'+n.querySelectorAll('table').length, links:o.querySelectorAll('a[href]').length+'/'+n.querySelectorAll('a[href]').length, iframes:o.querySelectorAll('iframe').length+'/'+n.querySelectorAll('iframe').length, err});}
R.rows=rows; R.editedBadges=document.querySelectorAll('#expl-list [data-edited]:not([hidden])').length; R.errs=__errs;
EDITOR.resetCourse(); return R;
