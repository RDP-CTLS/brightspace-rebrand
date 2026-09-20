// New-feature check on a BIG, ALREADY-TEMPLATED export served as /sandbox.zip (written for the 563 MB
// a big already-templated course zip: multi-card condensed pages, 3-deep outline, no intros).
//   SANDBOX="$HOME/Downloads/big-templated-export.zip" dev/test-harness/run.sh tests/big-templated-course.js 900
// Every comparison is against the INPUT zip (crc + size per entry), so only one build is held at a time.
const R={}; const c=document.getElementById('pg-canvas'); const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const $id=i=>document.getElementById(i);
const bars=()=>[...c.querySelectorAll(':scope>.pgb')]; const act=(blk,a)=>blk.querySelector('.pgb-bar [data-act="'+a+'"]');
const addCallout=()=>[...c.querySelectorAll('.pgb-end button')].find(x=>/callout/i.test(x.textContent))?.click();
const open=async b=>{EDITOR.openCoursePage(b.dataset.entry,b.dataset.title,await courseRawBody(b.dataset.entry));};
const dom=h=>new DOMParser().parseFromString('<body>'+h+'</body>','text/html').body;
const norm=s=>s.replace(/\s+/g,' ').trim();
const badSvgs=d=>[...d.querySelectorAll('svg')].filter(v=>!v.getAttribute('viewBox')||[...v.querySelectorAll('path')].some(q=>!q.getAttribute('d'))).length;
const cardsIn=d=>[...d.querySelectorAll('div')].filter(isCardEl);
const runGo=async mode=>{document.querySelector('input[name=mode][value="'+mode+'"]').checked=true; const t=performance.now(); $id('go').click();
  for(let i=0;i<6000;i++){await sleep(100); if(!$id('go').disabled)break;}
  const links=[...document.querySelectorAll('#downloads a')];
  return {ms:Math.round(performance.now()-t), names:links.map(a=>a.download.replace(/^.* - /,'')), log:$id('log').textContent.split('\n').map(l=>l.trim()).filter(Boolean),
    zip:links[0]?readZip(await (await fetch(links[0].href)).arrayBuffer()):null};};
const diffVsInput=(out,skip)=>{const d=[]; for(const e of MODEL.zip.entries){const o=out.byName[e.name]; if(skip.includes(e.name))continue; if(!o||o.crc!==e.crc||o.uncompSize!==e.uncompSize)d.push(e.name.slice(-60));} return {inputEntries:MODEL.zip.entries.length,outputEntries:out.entries.length,changed:d.length,names:d.slice(0,8)};};

const t0=performance.now(); await setFile(new File([await (await fetch('/sandbox.zip')).blob()],'big-course.zip')); R.loadMs=Math.round(performance.now()-t0);

// ---- 1. outline vs manifest
const items=[...MODEL.m.doc.querySelectorAll('item')]; const pagesBtn=[...document.querySelectorAll('#expl-list .ctopic:not(.cintro)')];
const manPageTitles=items.filter(it=>MODEL.m.htmlEntry(it)).map(titleOf);
R.outline={manifestItems:items.length, outlineRows:document.querySelectorAll('#expl-list .ctopic, #expl-list .cmodule, #expl-list .cpass').length, pages:pagesBtn.length, manifestPages:manPageTitles.length,
  pageTitlesAndOrderMatchManifest:JSON.stringify(pagesBtn.map(b=>b.dataset.title))===JSON.stringify(manPageTitles),
  introRows:document.querySelectorAll('#expl-list .cintro').length, nonEmptyDescriptions:items.filter(it=>(it.getAttribute('description')||'').trim()).length};

// ---- 2. open EVERY page: already-templated detection, granular blocks, text fidelity, no false edits
const rows=[]; let tOpen=performance.now();
for(const b of pagesBtn){const raw=await courseRawBody(b.dataset.entry); const d=dom(raw); const before=__errs.length;
  await open(b); const n=bars().length;
  rows.push({t:b.dataset.title.slice(0,38), entry:b.dataset.entry, kb:+(raw.length/1024).toFixed(1), templated:isTemplated(raw), cards:cardsIn(d).length, blocks:n, rawBadSvg:badSvgs(d),
    textKept:norm(d.textContent).length?+(norm(c.querySelectorAll('.pgb-body').length?[...c.querySelectorAll('.pgb-body')].map(x=>x.textContent).join(' '):'').length/norm(d.textContent).length).toFixed(2):null,
    err:__errs.length>before});}
R.sweep={pages:rows.length, ms:Math.round(performance.now()-tOpen), templated:rows.filter(r=>r.templated).length, notTemplated:rows.filter(r=>!r.templated).map(r=>r.t),
  multiCardPages:rows.filter(r=>r.cards>1).length, maxCards:Math.max(...rows.map(r=>r.cards)), pagesOpeningAsOneOrTwoBlobs:rows.filter(r=>r.blocks<=2&&r.kb>3).map(r=>r.t+' ('+r.blocks+' blocks, '+r.kb+' KB)'),
  blocksTotal:rows.reduce((k,r)=>k+r.blocks,0), pagesWithAlreadyBlankIconsInInput:rows.filter(r=>r.rawBadSvg).map(r=>r.t), jsErrorsWhileOpening:rows.filter(r=>r.err).map(r=>r.t),
  falseEdits:Object.keys(EDITOR.courseEdits()).length, editedBadges:document.querySelectorAll('#expl-list [data-edited]:not([hidden])').length};
const t1=performance.now(); EDITOR.hasCourseEdits(); R.sweep.hasCourseEditsMs=+(performance.now()-t1).toFixed(1);

// ---- 3. zero-edit export through the real button: a second pass must change NOTHING
$id('cx-close').click();
let g=await runGo('restyle');
R.zeroEdit={ms:g.ms, downloads:g.names, log:g.log.filter(l=>/restyled|already|repaired|RESULT|icons|tag balance|in-page refs|went wrong/.test(l)).map(l=>l.slice(0,160)), vsInput:diffVsInput(g.zip,[])};
g=null;

// ---- 4. edit the page with the MOST cards (condensed) + one single-card page, then export
const multi=rows.slice().sort((a,b)=>b.cards-a.cards)[0], single=rows.find(r=>r.cards===1&&r.blocks>=3&&r.entry!==multi.entry);
const btnFor=r=>pagesBtn.find(b=>b.dataset.entry===r.entry); const edited=[];
for(const r of [multi,single].filter(Boolean)){await open(btnFor(r)); const n0=bars().length; addCallout();
  act(bars()[bars().length-1],'up').click(); act(bars()[bars().length-2],'up').click();        // the new callout, moved up twice
  act(bars()[bars().length-1],'dup').click(); act(bars()[bars().length-1],'del').click();      // duplicate the last block, delete the copy
  edited.push({t:r.t, entry:r.entry, cards:r.cards, blocksBefore:n0, blocksAfter:bars().length});}
await open(btnFor(multi)); const keptOnSwitch=bars().length===edited[0].blocksAfter;
const ed=EDITOR.courseEdits(); document.querySelector('input[name=mode][value="both"]').checked=true;   // ask for BOTH: the edit must force styled-only
g=await runGo('both'); const out=g.zip; const pages=[];
for(const e of edited){const html=await out.text(e.entry), src=await MODEL.zip.text(e.entry); const d=dom((html.match(/<body[^>]*>([\s\S]*)<\/body>/i)||[,html])[1]), s=dom((src.match(/<body[^>]*>([\s\S]*)<\/body>/i)||[,src])[1]); const cs=cardsIn(d);
  pages.push({t:e.t, changed:html!==src, frames:[...d.querySelectorAll('div')].filter(x=>isFrameStyle(x.getAttribute('style'))).length, cards:cs.length+' (was '+e.cards+')', cardInsideCard:cs.some(x=>cs.some(y=>y!==x&&y.contains(x))),
    bannersSame:JSON.stringify(cardsIn(s).map(x=>x.firstElementChild.outerHTML))===JSON.stringify(cs.map(x=>x.firstElementChild.outerHTML)), h1Titles:d.querySelectorAll('h1').length+' (was '+s.querySelectorAll('h1').length+')',
    calloutAdded:d.querySelectorAll('svg').length>s.querySelectorAll('svg').length, blankIcons:badSvgs(d)+' (was '+badSvgs(s)+')', blobRefs:(html.match(/blob:/g)||[]).length, nbspPads:(html.match(/<p>(&nbsp;| )<\/p>/g)||[]).length,
    editorChromeLeaked:/pgb-|contenteditable/i.test(html), textKept:norm(s.textContent).length?+(norm(d.textContent).length/norm(s.textContent).length).toFixed(2):null});}
R.editExport={ms:g.ms, edited, editKeptOnPageSwitch:keptOnSwitch, editKeys:Object.keys(ed).length, payloadKinds:Object.values(ed).map(v=>typeof v==='object'?Object.keys(v).join():'inner'), badges:document.querySelectorAll('#expl-list [data-edited]:not([hidden])').length,
  downloads:g.names, log:g.log.filter(l=>/You edited|restyled|already|repaired|RESULT|icons|tag balance|went wrong/.test(l)).map(l=>l.slice(0,170)), pages,
  everythingElseVsInput:diffVsInput(out,edited.map(e=>e.entry))};
g=null;
R.errs=__errs; EDITOR.resetCourse(); return R;
