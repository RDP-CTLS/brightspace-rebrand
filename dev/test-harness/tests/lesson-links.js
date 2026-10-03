// Lesson links: ?lesson=<name> opens the tool at one way of using it, starts clean every time, saves nothing on the computer, and shows only its own way in.
// Each case loads the tool in its own frame (same origin, so they share localStorage like real lesson links do).
localStorage.clear();
const open=async q=>{const f=document.createElement('iframe');f.style.cssText='width:860px;height:600px';
  document.body.appendChild(f);await new Promise(r=>{f.onload=r;f.src='/index.html'+q;});
  await new Promise(r=>setTimeout(r,150));return f.contentWindow;};
const look=w=>{const d=w.document,vis=s=>{const e=d.querySelector(s);return !!e&&w.getComputedStyle(e).display!=='none';};
  return {r1:d.getElementById('r1').textContent,stage:(d.querySelector('.stage.cur')||{}).id,
    blocks:d.querySelectorAll('#pg-canvas .pgb').length,
    kinds:Object.keys(w.localStorage).filter(k=>k.startsWith('rdp-page-editor')).sort(),
    drop:vis('#drop'),paste:vis('#pg-paste'),blank:vis('.newpage'),ors:[...d.querySelectorAll('#s1 .or')].filter(e=>w.getComputedStyle(e).display!=='none').length,
    undo:!d.getElementById('pg-undo').disabled};};
const out={};
// 1. each block lesson starts a new page with that block placed
for(const k of ['contacts','callout','section','link']){const w=await open('?lesson='+k);out[k]=look(w);
  out[k].kind=w.document.querySelector('#pg-canvas .pgb .pgb-form [data-k]').dataset.k;
  out[k].save=w.document.getElementById('savestate').textContent;}
// 2. the hash form works too, and reopening a lesson starts clean (a new page with one block, nothing picked up)
out.hashAgain=look(await open('#lesson=callout'));
// 2b. ?lesson=new is an empty new page
out.fresh=look(await open('?lesson=new'));
// 3. paste and course lessons show only that way in
out.paste=look(await open('?lesson=paste'));out.course=look(await open('?lesson=course'));
// 4. the plain address is untouched by lesson drafts: nothing restored, all three ways in showing
out.plain=look(await open(''));
// 4b. a page saved at the plain address survives a lesson visit and is still picked up afterwards
{const p=await open('');p.document.getElementById('start-blank').click();p.document.querySelector('#pg-canvas [data-add="section"]').click();
 await new Promise(r=>setTimeout(r,100));await open('?lesson=contacts');out.plainKept=look(await open('')).r1;}
// 5. an unknown lesson name behaves like the plain address
out.bogus=look(await open('?lesson=nope'));
// 6. Copy page output from a lesson is a real page
const w=await open('?lesson=contacts');w.document.getElementById('pg-next').click();await new Promise(r=>setTimeout(r,100));
out.code=w.document.getElementById('pg-code').value.length>200;
out.errs=__errs;
return out;
