// Try to break the lesson links: hostile addresses, blocked or poisoned storage, hostile input typed
// into the blocks, and the normal flows run from inside each lesson. window.__pwn must stay unset.
localStorage.clear();window.__pwn=0;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const frame=async src=>{const f=document.createElement('iframe');f.style.cssText='width:860px;height:600px';
  document.body.appendChild(f);await new Promise(r=>{f.onload=r;f.src=src;});await wait(200);
  const w=f.contentWindow;w.__e=[];w.addEventListener('error',e=>w.__e.push(String(e.message)));return w;};
const open=q=>frame('/index.html'+q);
const brief=w=>!w.document.getElementById('r1')?{way:'NOPAGE',r1:w.document.title.slice(0,30),blocks:0,stage:''}:({way:w.document.body.dataset.way||'',r1:w.document.getElementById('r1').textContent,
  blocks:w.document.querySelectorAll('#pg-canvas .pgb').length,stage:(w.document.querySelector('.stage.cur')||{}).id});
const out={};
// A. hostile / odd addresses: only the whitelisted names may do anything
out.fuzz={};
for(const q of ['?lesson=%3Cscript%3Eparent.__pwn%3D1%3C%2Fscript%3E','?lesson=__proto__','?lesson=constructor','?lesson=toString',
  '?lesson=CONTACTS','?lesson=contacts%00','?lesson=','?lesson=contacts&lesson=paste','?lesson=paste#lesson=course','?lesson[]=contacts',
  '#lesson=contactsX','#lesson=__proto__','#lesson=%63ontacts','?lesson=contacts#build','?lesson='+'a'.repeat(100000),
  '?lesson=course"><img src=x onerror=parent.__pwn=1>','#lesson=paste"onload="parent.__pwn=1']){
  const w=await open(q);const b=brief(w);out.fuzz[q.slice(0,44)]=[b.way,b.r1,b.blocks,w.__e.length].join('|');}
// B. storage blocked (as some browsers do for a tool shown inside another site): tool must still work
{const html=await (await fetch('/index.html')).text();
 const bad=html.replace('<head>','<head><script>Object.defineProperty(window,"localStorage",{get(){throw new DOMException("denied","SecurityError")}})<\/script>');
 const u=URL.createObjectURL(new Blob([bad],{type:'text/html'}));
 let blocked=false;const w=await frame(u+'#lesson=contacts');try{w.localStorage;}catch(e){blocked=true;}
 const b=brief(w);const inp=w.document.querySelector('.pgb-form input[data-k="name"]');
 if(inp){inp.value='Dr. Test';inp.dispatchEvent(new w.Event('input',{bubbles:true}));}
 await wait(150);w.document.getElementById('pg-next').click();await wait(100);
 out.blockedStorage={reallyBlocked:blocked,...b,code:w.document.getElementById('pg-code').value.includes('Dr. Test'),errs:w.__e};
 const p=await frame(u);out.blockedPlain={...brief(p),errs:p.__e};}
// C. poisoned saved drafts (another page on the same site could write these)
{const evil='<p>hi</p><img src=x onerror="parent.__pwn=1;top.__pwn=1"><script>parent.__pwn=1<\/script><a href="javascript:parent.__pwn=1">x</a><svg><a><animate attributeName="href" values="javascript:parent.__pwn=1"/><text y="20">x</text></a></svg>';
 const draft=JSON.stringify({v:1,blocks:[{id:'a1',kind:'raw',html:evil},{id:'a2',kind:'contacts',model:{heading:evil,theme:'"><img src=x onerror=parent.__pwn=1>',people:[{name:evil}]},html:evil},{id:'a3',kind:'__proto__',html:evil}],
   wrap:'<div onmouseover="parent.__pwn=1"><script>parent.__pwn=1<\/script>',hist:[JSON.stringify({blocks:[{id:'h',kind:'raw',html:evil}],wrap:null})]});
 for(const k of ['','contacts','paste','course','new'])localStorage.setItem('rdp-page-editor'+(k?':'+k:''),draft);
 out.poison={};
 for(const q of ['?lesson=contacts','?lesson=new','?lesson=paste','?lesson=course','']){
   const w=await open(q);await wait(300);const d=w.document;
   const live=d.querySelectorAll('#pg-canvas script,#pg-canvas [onerror],#pg-canvas [onmouseover],#pg-canvas a[href^="javascript"],#pg-canvas animate').length;
   let code='';if(brief(w).blocks){d.getElementById('pg-next').click();await wait(100);code=d.getElementById('pg-code').value;}
   out.poison[q||'plain']={...brief(w),live,codeBad:/onerror|onmouseover|<script|javascript:|<animate/i.test(code),errs:w.__e.length};}
 localStorage.clear();}
// D. hostile text typed into every field of every block lesson
out.typed={};
const P='"><img src=x onerror=parent.__pwn=1><script>parent.__pwn=1<\/script>\'"`${7*7}{{7*7}}</textarea></h2>';
for(const k of ['contacts','callout','section','link']){
  const w=await open('?lesson='+k),d=w.document;
  for(const url of (k==='link'?['javascript:parent.__pwn=1','data:text/html,<script>parent.__pwn=1<\/script>','https://x.org/"><img src=x onerror=parent.__pwn=1>','https://www.youtube.com/watch?v=abc"onload="parent.__pwn=1','vbscript:x',' JaVaScRiPt:parent.__pwn=1','mailto:a@b.c?subject=<script>']:[''])){
    d.querySelectorAll('.pgb-form input[data-k],.pgb-form textarea[data-k]').forEach(el=>{
      el.value=(el.dataset.k==='url')?url:P;el.dispatchEvent(new w.Event('input',{bubbles:true}));el.dispatchEvent(new w.Event('change',{bubbles:true}));});
    await wait(200);
    const live=d.querySelectorAll('#pg-canvas .pgb-body script,#pg-canvas .pgb-body [onerror],#pg-canvas .pgb-body [onload],#pg-canvas .pgb-body img[src="x"]').length;
    d.getElementById('pg-next').click();await wait(100);const code=d.getElementById('pg-code').value;
    const t=document.createElement('template');t.innerHTML=code;
    const bad=[...t.content.querySelectorAll('*')].filter(e=>e.tagName==='SCRIPT'||[...e.attributes].some(a=>/^on/i.test(a.name)||(/^(href|src)$/i.test(a.name)&&/^\s*(javascript|data|vbscript):/i.test(a.value)))).length;
    out.typed[k+(url?' '+url.slice(0,22):'')]={live,bad,len:code.length,errs:w.__e.length};
    d.querySelector('.rs[data-stage="2"]').click();await wait(50);}}
// E. normal flows from inside each lesson
{const w=await open('?lesson=paste'),d=w.document;const ta=d.getElementById('pg-paste');
 ta.value='<h2>Week 1</h2><p>Hello <a href="https://x.org">link</a></p><img src=x onerror=parent.__pwn=1>';ta.dispatchEvent(new w.Event('input',{bubbles:true}));await wait(900);
 out.pasteFlow={...brief(w),save:d.getElementById('savestate').textContent,errs:w.__e};}
{const w=await open('?lesson=course');const f=new w.File([await (await fetch('/test.imscc')).blob()],'test.imscc');await w.setFile(f);await wait(300);
 out.courseFlow={kind:w.eval('FLOW.kind()'),stage:brief(w).stage,msg:w.document.getElementById('drop-msg').textContent.slice(0,80),errs:w.__e};}
{const w=await open('?lesson=callout'),d=w.document;
 d.querySelector('.rs[data-stage="1"]').click();await wait(50);
 const vis=s=>{const e=d.querySelector(s);return !!e&&w.getComputedStyle(e).display!=='none';};
 const step1={drop:vis('#drop'),paste:vis('#pg-paste'),blank:vis('.newpage')};
 d.getElementById('start-blank').click();await wait(100);const afterBlank=brief(w).blocks;
 d.getElementById('pg-undo').click();await wait(100);const afterUndo=brief(w).blocks;
 out.blockFlow={step1,afterBlank,afterUndo,save:d.getElementById('savestate').textContent,errs:w.__e};}
// F. what a lesson leaves behind on the computer, and what it tells the person
{localStorage.clear();const w=await open('?lesson=contacts'),d=w.document;
 const el=d.querySelector('.pgb-form input[data-k="email"]');el.value='private.person@example.org';el.dispatchEvent(new w.Event('input',{bubbles:true}));await wait(300);
 out.leftBehind={says:d.getElementById('savestate').textContent,keys:Object.keys(localStorage),
   emailStored:Object.values(localStorage).some(v=>v.includes('private.person')),
   comesBack:brief(await open('?lesson=contacts')).r1};}
out.pwn=window.__pwn||0;out.errs=__errs;
return out;
