// Load whatever export is served as /sandbox.zip (point SANDBOX at it) and report the outline's shape.
const t0=performance.now(); const bl=await (await fetch('/sandbox.zip')).blob(); const t1=performance.now();
await setFile(new File([bl],'het.zip')); const t2=performance.now();
const items=[...MODEL.m.doc.querySelectorAll('item')];
const depth=el=>{let d=0;for(let p=el.parentElement;p;p=p.parentElement)if(p.classList&&p.classList.contains('ctree'))d++;return d;};
const chips={};document.querySelectorAll('#expl-list .cpass .chip-pass').forEach(c=>chips[c.textContent]=(chips[c.textContent]||0)+1);
return {mb:Math.round(bl.size/1048576), fetchMs:Math.round(t1-t0), loadMs:Math.round(t2-t1), model:!!MODEL, isD2L:MODEL&&MODEL.isD2L, zipEntries:MODEL.zip.entries.length,
  manifestItems:items.length, pages:document.querySelectorAll('#expl-list .ctopic:not(.cintro)').length, intros:document.querySelectorAll('#expl-list .cintro').length,
  modules:document.querySelectorAll('#expl-list .cmodule').length, passChips:chips, maxTreeDepth:Math.max(...[...document.querySelectorAll('#expl-list .ctopic')].map(depth)),
  receipt:document.getElementById('r1')&&document.getElementById('r1').textContent, errs:__errs};
