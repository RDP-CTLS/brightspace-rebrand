// Run with LMS=1: the tool believes it is a file inside a Brightspace course. It must use the
// in-course wording, never write a draft to storage (Brightspace's storage is shared by the whole
// site), never pick one up, and keep a typed $ as text (MathJax runs on every course file there).
localStorage.clear();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const frame=async src=>{const f=document.createElement('iframe');f.style.cssText='width:860px;height:600px';
  document.body.appendChild(f);await new Promise(r=>{f.onload=r;f.src=src;});await wait(250);
  const w=f.contentWindow;w.__e=[];w.addEventListener('error',e=>w.__e.push(String(e.message)));return w;};
const t=(d,s)=>(d.querySelector(s)||{}).textContent?.replace(/\s+/g,' ').trim()||'';
const keys=()=>Object.keys(localStorage).filter(k=>/^rdp-page-editor/.test(k));
const out={host:location.hostname};
// 1. plain address (no lesson): wording + no save while building a page
{const w=await frame('/index.html');const d=w.document;
 out.wording={rail:t(d,'.rail .rs[data-stage="3"] .t'),h3:t(d,'#h3s'),label:t(d,'label[for="pg-paste"]'),newpage:t(d,'.newpage .muted'),
   quiet:t(d,'#s1 p.quiet'),howpaste:t(d,'#howpaste li'),then:[...d.querySelectorAll('#s3 .s3-then')].map(e=>e.textContent),
   last:t(d,'#s3-course > p.muted:last-child'),hint:t(d,'#newpage-hint'),bodyClass:d.body.className};
 d.getElementById('start-blank').click();await wait(200);
 const add=[...d.querySelectorAll('button')].find(b=>/contact/i.test(b.textContent)&&b.getClientRects().length);add&&add.click();await wait(300);
 const inp=d.querySelector('.pgb-form input[data-k="name"]');if(inp){inp.value='Price $5 and $10';inp.dispatchEvent(new w.Event('input',{bubbles:true}));}
 await wait(300);
 out.plain={blocks:d.querySelectorAll('#pg-canvas .pgb').length,savestate:t(d,'#savestate'),keysAfterEdit:keys(),
   codeKeepsDollar:d.getElementById('pg-code').value.includes('Price $5 and $10'),errs:w.__e};}
// 2. a draft planted by another page on the site must NOT load
localStorage.setItem('rdp-page-editor',JSON.stringify({v:1,blocks:[{id:'x1',kind:'raw',html:'<p>PLANTED</p>'}],wrap:null,hist:[]}));
{const w=await frame('/index.html');const d=w.document;
 out.planted={loaded:(d.getElementById('pg-canvas')||{}).textContent?.includes('PLANTED')||false,blocks:d.querySelectorAll('#pg-canvas .pgb').length,
   stillThere:!!localStorage.getItem('rdp-page-editor'),errs:w.__e};}
localStorage.clear();
// 3. every lesson: starts clean, saves nothing
out.lessons={};
for(const l of ['new','contacts','callout','section','link','paste','course']){const w=await frame('/index.html?lesson='+l);
  out.lessons[l]=[w.document.querySelectorAll('#pg-canvas .pgb').length,t(w.document,'#savestate')||'-',keys().length,w.__e.length].join('|');}
out.pass=out.host==='rdp.brightspace.com'&&out.wording.h3==='Put it in your own course'&&/your own course/.test(out.wording.hint||'')&&out.wording.bodyClass.includes('mathjax_ignore')
  &&out.plain.blocks>0&&out.plain.keysAfterEdit.length===0&&out.plain.codeKeepsDollar&&!out.plain.errs.length
  &&!out.planted.loaded&&Object.values(out.lessons).every(v=>v.split('|')[2]==='0'&&v.split('|')[3]==='0');
return out;
