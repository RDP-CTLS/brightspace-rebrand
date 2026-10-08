// A course SVG can carry script. On screen it must show through a data: URL (a blob: one shares the
// tool's origin, so "open image in new tab" would run it there; inside a course that is Brightspace),
// and it must go back to its real src in the page and in the export. Needs ORIGINAL = a course
// export with svg-test-mark.svg at the root and <img src="svg-test-mark.svg"> in "Detailed Schedule".
window.__pwn=0; const R={}; const c=document.getElementById('pg-canvas'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
EDITOR.resetCourse(); await setFile(new File([await (await fetch('/original.zip')).blob()],'svg.zip'));
const row=[...document.querySelectorAll('#expl-list .ctopic')].find(b=>/Detailed Schedule/.test(b.dataset.title));
R.found=!!row; if(!row)return R;
EDITOR.openCoursePage(row.dataset.entry,row.dataset.title,await courseRawBody(row.dataset.entry));
let img=null; for(let i=0;i<40;i++){img=[...c.querySelectorAll('.pgb-body img')].find(x=>x.alt==='test mark');if(img&&/^(data|blob):/.test(img.getAttribute('src')))break;await sleep(100);}
const src=img&&img.getAttribute('src')||'';
// the canvas may be off screen in headless (lazy), so decode the stand-in directly
const drawn=await new Promise(r=>{const t=new Image();t.onload=()=>r(t.naturalWidth>0);t.onerror=()=>r(false);t.src=src;setTimeout(()=>r(false),3000);});
R.onScreen={dataSvg:/^data:image\/svg\+xml;base64,/.test(src),blob:/^blob:/.test(src),drawn};
// edit the block holding it: the page's HTML must carry the real src back, not the stand-in
const body=img.closest('.pgb-body'); body.appendChild(document.createTextNode(' typed-by-test')); body.dispatchEvent(new InputEvent('input',{bubbles:true}));
await sleep(200);
const eds=EDITOR.courseEdits(); const html=Object.values(eds).map(e=>JSON.stringify(e)).join('');
R.edit={typed:/typed-by-test/.test(html),realSrc:/src=\\?"svg-test-mark\.svg\\?"/.test(html),standIn:/data:image\/svg|blob:/.test(html)};
// export: no stand-in anywhere, the real src is there
document.getElementById('go').click(); for(let i=0;i<300;i++){await sleep(100); if(document.querySelectorAll('#downloads a').length&&!document.getElementById('go').disabled)break;}
const z=readZip(await (await (await fetch(document.querySelector('#downloads a').href)).blob()).arrayBuffer());
let standIn=0,realSrc=0; for(const e of z.entries){if(!/\.(html|xml)$/i.test(e.name))continue;const t=await z.text(e.name);
  if(/data:image\/svg\+xml;base64|blob:/.test(t))standIn++; if(t.includes('src="svg-test-mark.svg"'))realSrc++;}
R.export={filesWithStandIn:standIn,filesWithRealSrc:realSrc,result:(document.getElementById('log').textContent.match(/RESULT: \w+/)||[''])[0]};
R.pwn=window.__pwn; R.errs=__errs;
R.pass=R.onScreen.dataSvg&&R.onScreen.drawn&&R.edit.typed&&R.edit.realSrc&&!R.edit.standIn&&!standIn&&realSrc>0&&!R.pwn;
return R;
