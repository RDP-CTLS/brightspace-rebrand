// Generic sweep: open every page/intro of the course served as /sandbox.zip and report images the
// editor failed to show from the zip. Point SANDBOX at any export to try it.
const c=document.getElementById('pg-canvas'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
await setFile(new File([await (await fetch('/sandbox.zip')).blob()],'sweep.zip'));
const rows=[]; let fromZip=0,web=0,left=0,broken=0;
for(const b of document.querySelectorAll('#expl-list .ctopic')){
  EDITOR.openCoursePage(b.dataset.entry,b.dataset.title,await courseRawBody(b.dataset.entry));
  for(let i=0;i<30;i++){const im=[...c.querySelectorAll('.pgb-body img')];if(im.every(x=>x.complete))break;await sleep(100);} await sleep(120);
  const im=[...c.querySelectorAll('.pgb-body img')]; const l=im.filter(x=>!/^(blob:|https?:|data:|\/)/i.test(x.getAttribute('src')||''));
  const z=im.filter(x=>/^blob:/.test(x.getAttribute('src'))); fromZip+=z.length;
  // cleanBody marks page images loading="lazy", so off-screen ones never report a size: decode the blob itself
  for(const x of z){try{const bl=await (await fetch(x.getAttribute('src'))).blob(); if(bl.type==='image/svg+xml'){if(!bl.size)broken++;}else{const bm=await createImageBitmap(bl); if(!bm.width)broken++;}}catch(e){broken++;}} web+=im.filter(x=>/^https?:/i.test(x.getAttribute('src')||'')).length; left+=l.length;
  if(l.length)rows.push({page:b.dataset.title.slice(0,40),entryFolder:b.dataset.entry.includes('/')?'(in a folder)':'(root)',unshown:l.map(x=>x.getAttribute('src').slice(0,90))});}
const r={pages:document.querySelectorAll('#expl-list .ctopic').length,shownFromZip:fromZip,decodedBroken:broken,webImages:web,leftUnshown:left,rows:rows.slice(0,8),falseEdits:Object.keys(EDITOR.courseEdits()).length,errs:__errs};
EDITOR.resetCourse(); return r;
