// Course images show in the editor (blob: stand-ins in the DOM) and can never reach an export.
const R={}; const c=document.getElementById('pg-canvas'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const open=async b=>{EDITOR.openCoursePage(b.dataset.entry,b.dataset.title,await courseRawBody(b.dataset.entry));};
const loaded=async()=>{for(let i=0;i<40;i++){const im=[...c.querySelectorAll('.pgb-body img')];if(im.length&&im.every(x=>x.complete&&(x.naturalWidth>0||!/^blob:/.test(x.getAttribute('src')))))break;await sleep(100);}
  return [...c.querySelectorAll('.pgb-body img')].map(x=>({blob:/^blob:/.test(x.getAttribute('src')),w:x.naturalWidth}));};
const find=(sel,re)=>[...document.querySelectorAll(sel)].find(b=>re.test(b.dataset.title));
async function course(url,label){
  EDITOR.resetCourse(); await setFile(new File([await (await fetch(url)).blob()],label+'.zip')); const out={};
  // every intro + page that has images: do they all resolve and actually decode?
  const rows=[]; for(const b of document.querySelectorAll('#expl-list .ctopic')){const raw=await courseRawBody(b.dataset.entry); const n=(raw.match(/<img\b/gi)||[]).length; if(!n)continue;
    await open(b); await loaded(); await sleep(150); const im=[...c.querySelectorAll('.pgb-body img')];
    // an image left pointing INTO the zip (not blob:, not the web) is one the editor failed to show
    const left=im.filter(x=>!/^(blob:|https?:|data:|\/)/i.test(x.getAttribute('src')||'')).length;
    rows.push({t:(b.classList.contains('cintro')?'(i) ':'')+b.dataset.title.slice(0,30), rawImgs:n, onCanvas:im.length, fromZip:im.filter(x=>/^blob:/.test(x.getAttribute('src'))&&x.naturalWidth>0).length, leftUnshown:left});}
  out.totals={pagesWithImgs:rows.length, fromZip:rows.reduce((k,r)=>k+r.fromZip,0), leftUnshown:rows.reduce((k,r)=>k+r.leftUnshown,0)}; out.unshownRows=rows.filter(r=>r.leftUnshown); out.falseEdits=Object.keys(EDITOR.courseEdits()).length; out.badges=document.querySelectorAll('#expl-list [data-edited]:not([hidden])').length;
  // type into a block that holds an image -> the read-back must carry the ORIGINAL src
  const intro=find('#expl-list .cintro',/CTLS Resources/); await open(intro); await loaded();
  const body=[...c.querySelectorAll('.pgb-body')].find(x=>x.querySelector('img')); const origSrc=(await courseRawBody(intro.dataset.entry)).match(/<img[^>]*src="([^"]*)"/)[1];
  body.appendChild(document.createTextNode(' typed-by-test'));   // headless has no focus for execCommand; the input event below is what the editor listens to
  // also drop a COPY of the on-screen image (blob src) into the block, as a paste/drag inside the canvas would
  const clone=body.querySelector('img').cloneNode(true); body.appendChild(clone); body.dispatchEvent(new InputEvent('input',{bubbles:true}));
  const ed=EDITOR.courseEdits()[intro.dataset.entry]; const html=ed&&ed.intro||'';
  out.afterTyping={edited:!!ed, typed:/typed-by-test/.test(html), blobInHtml:/blob:/.test(html), origSrcCount:html.split('src="'+origSrc+'"').length-1, domStillBlob:/^blob:/.test(body.querySelector('img').getAttribute('src'))};
  // leave + come back: still shown (cached, synchronous), edit kept
  await open(find('#expl-list .ctopic:not(.cintro)',/./)); await open(intro); out.afterSwitch={img:(await loaded())[0], typedKept:/typed-by-test/.test(c.textContent)};
  // export
  document.getElementById('go').click(); for(let i=0;i<300;i++){await sleep(100); if(document.querySelectorAll('#downloads a').length&&!document.getElementById('go').disabled)break;}
  const blob=await (await fetch(document.querySelector('#downloads a').href)).blob(); const z=readZip(await blob.arrayBuffer()); let blobFiles=0; for(const e of z.entries){if(/\.(html|xml)$/i.test(e.name)&&/blob:/.test(await z.text(e.name)))blobFiles++;}
  out.export={filesWithBlob:blobFiles, log:document.getElementById('log').textContent.split('\n').map(l=>l.trim()).filter(l=>/updated|images:|RESULT/.test(l))};
  out.assetsHeld=ASSET_BACK.size; return out;}
R.first=await course('/original.zip','original'); R.second=await course('/sandbox.zip','sandbox');
// the lint really fires: force a blob: into a page and into the manifest
const bad=await buildRestyle(MODEL.zip,MODEL.man,MODEL.m,false,{[Object.keys(MODEL.m.titleByHref).map(h=>MODEL.m.entryFor(h)).find(e=>e&&/\.html$/i.test(e))]:'<p><img src="blob:http://x/1"></p>'});
document.getElementById('log').textContent=''; R.lintCatchesPageBlob=(await verify(bad)).ok===false&&/temporary in-browser image/.test(document.getElementById('log').textContent);
// loading another file revokes everything
EDITOR.resetCourse(); await setFile(new File([await (await fetch('/original.zip')).blob()],'again.zip')); R.assetsAfterNewFile=ASSET_BACK.size+ASSET_URLS.size;
R.errs=__errs; return R;
