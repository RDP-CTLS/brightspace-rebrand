// Links on the page canvas: a click shows an "Open link" button for that link, Ctrl/Cmd-click opens it,
// unsafe addresses get no button, and the button never ends up in the copied page.
const f=document.createElement('iframe');f.style.cssText='width:860px;height:900px';document.body.appendChild(f);
await new Promise(r=>{f.onload=r;f.src='/index.html?lesson=link';});await new Promise(r=>setTimeout(r,150));
const w=f.contentWindow,d=w.document,pop=()=>d.querySelector('.pgb-linkpop');
const inp=d.querySelector('input[data-k="url"]');inp.value='https://www.rdpolytech.ca/';inp.dispatchEvent(new w.Event('input',{bubbles:true}));
await new Promise(r=>setTimeout(r,100));
const a=d.querySelector('#pg-canvas .pgb-body a');const out={};
const click=(el,o={})=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true,...o}));
click(a);out.shown=!pop().hidden;out.href=pop().href;out.target=pop().target;out.rel=pop().rel;
out.below=Math.abs(pop().getBoundingClientRect().top-a.getBoundingClientRect().bottom)<12;
d.querySelector('#pg-canvas .pgb-body').dispatchEvent(new w.Event('input',{bubbles:true}));out.hiddenOnType=pop().hidden;
click(a);d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));out.hiddenOnEsc=pop().hidden;
let opened=null;w.open=(u,t,feat)=>{opened={u,t,feat};return null;};
click(a,{ctrlKey:true});out.ctrlOpened=opened&&opened.u===a.href&&opened.t==='_blank'&&/noopener/.test(opened.feat);out.ctrlNoPop=pop().hidden;
opened=null;click(a,{metaKey:true});out.cmdOpened=!!opened;
// an unsafe address planted in a block gets no button and is not opened
const bad=d.createElement('a');bad.setAttribute('href','javascript:top.__pwn=1');bad.textContent='x';d.querySelector('#pg-canvas .pgb-body').appendChild(bad);
opened=null;click(bad);out.badNoPop=pop().hidden;click(bad,{ctrlKey:true});out.badNotOpened=opened===null;
// redraw hides it; copied page carries no button
click(a);d.querySelector('#pg-canvas [data-add="callout"]')?.click();await new Promise(r=>setTimeout(r,100));out.hiddenOnRedraw=pop().hidden;
d.getElementById('pg-next').click();await new Promise(r=>setTimeout(r,100));
out.cleanOut=!/pgb-linkpop|Open link/.test(d.getElementById('pg-code').value);
out.pwn=top.__pwn||w.__pwn||0;out.errs=__errs;
out.pass=out.shown&&out.target==='_blank'&&out.rel==='noopener'&&out.below&&out.hiddenOnType&&out.hiddenOnEsc&&out.ctrlOpened&&out.ctrlNoPop&&out.cmdOpened&&out.badNoPop&&out.badNotOpened&&out.hiddenOnRedraw&&out.cleanOut&&!out.pwn;
return out;
