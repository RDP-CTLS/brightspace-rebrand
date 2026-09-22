// Module intros get the RDP card automatically (courses whose lessons live in module descriptions,
// no pages). Fixture: any untouched D2L export with module intros, served as /original.zip.
// Checks: both build paths restyle every module intro; no <svg>/data: in a description; images,
// iframes and links survive; marker buttons become labelled subheads; BOM kept; verify runs; a
// SECOND pass leaves the manifest byte-identical; the explorer opens an intro in the same card.
const R={};const errs=[];
const f=new File([await (await fetch('/original.zip')).blob()],'course.zip'); EDITOR.resetCourse(); await setFile(f);
const m=MODEL.m, pre=parseManifest(MODEL.man);
const srcDesc={};for(const it of pre.querySelectorAll('item')){const d=(it.getAttribute('description')||'').trim();if(!d)continue;
  const kind=m.resType[it.getAttribute('identifierref')||'']||'',isMod=[...it.children].some(c=>c.tagName==='item')||kind==='contentmodule';
  if(!m.htmlEntry(it))srcDesc[it.getAttribute('identifier')]={d,isMod,title:titleOf(it)};}
R.srcIntros=Object.keys(srcDesc).length; R.srcModuleIntros=Object.values(srcDesc).filter(x=>x.isMod).length;
const P=h=>new DOMParser().parseFromString('<body>'+h+'</body>','text/html').body;
const cnt=(b,sel)=>b.querySelectorAll(sel).length;
const markerImgs=b=>[...b.querySelectorAll('img')].filter(i=>markerName(i.getAttribute('src'),i.getAttribute('alt'))).length;
function checkZip(z,label){const out={label};const man=z.byName['imsmanifest.xml'];
  return (async()=>{const txt=await z.text('imsmanifest.xml');const doc=parseManifest(txt);
    out.bom=await z.hasBom('imsmanifest.xml'); out.parses=!doc.querySelector('parsererror');
    let styled=0,svg=0,data=0,noCard=[],lost=[],labels=0,linkDescStyled=0;
    for(const it of doc.querySelectorAll('item')){const id=it.getAttribute('identifier'),d=(it.getAttribute('description')||'').trim();const s=srcDesc[id];if(!s)continue;
      const b=P(d),sb=P(s.d);
      if(!s.isMod){if(isTemplatedIntro(d))linkDescStyled++;continue;}
      if(isTemplatedIntro(d))styled++;else noCard.push(s.title.slice(0,30));
      svg+=cnt(b,'svg');data+=(d.match(/(src|href)="data:/g)||[]).length;
      labels+=cnt(b,'h3');
      const keep=['iframe','a[href]','table'];for(const k of keep)if(cnt(b,k)<cnt(sb,k))lost.push(s.title.slice(0,25)+':'+k+' '+cnt(sb,k)+'->'+cnt(b,k));
      const wantImg=cnt(sb,'img')-markerImgs(sb);if(cnt(b,'img')<wantImg)lost.push(s.title.slice(0,25)+':img '+wantImg+'->'+cnt(b,'img'));
      if(!b.querySelector('h2')||!/margin:\s*-/.test(b.firstElementChild&&b.firstElementChild.firstElementChild&&b.firstElementChild.firstElementChild.getAttribute('style')||''))noCard.push('banner? '+s.title.slice(0,25));}
    Object.assign(out,{styled,svg,dataUrls:data,noCard:noCard.slice(0,6),lost:lost.slice(0,8),markerLabels:labels,linkDescStyled});
    const v=await verify(z.blob||null).catch(e=>({err:String(e.message)}));out.verify=v;return out;})();}
const logs=()=>document.getElementById('log').textContent.split('\n').map(l=>l.trim()).filter(l=>/intro|Heads-up|missing files|RESULT|restyled/.test(l)).map(l=>l.slice(0,140));
// (1) styled build
document.getElementById('log').textContent='';
const b1=await repairRefs(await buildRestyle(MODEL.zip,MODEL.man,MODEL.m,false,{}));const z1=readZip(await b1.arrayBuffer());z1.blob=b1;
R.restyle=await checkZip(z1,'restyle');R.restyleLog=logs();
// (2) condensed build
document.getElementById('log').textContent='';
const b2=await repairRefs(await buildCombineD2L(MODEL.zip,MODEL.man,MODEL.m,new Set()));const z2=readZip(await b2.arrayBuffer());z2.blob=b2;
R.combine=await checkZip(z2,'combine');R.combineLog=logs();
R.bothSameManifest=(await z1.text('imsmanifest.xml'))===(await z2.text('imsmanifest.xml'));
// (3) the #go path with a page-less package warns
document.getElementById('log').textContent='';document.querySelector('input[name=mode][value=restyle]').checked=true;document.getElementById('go').disabled=false;document.getElementById('go').click();
for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,100));if(document.querySelectorAll('#downloads a').length&&!document.getElementById('go').disabled)break;}
R.goLog=logs();R.goDownloads=document.querySelectorAll('#downloads a').length;
// (4) second pass: the styled output goes back in, must come out byte-identical
EDITOR.resetCourse();await setFile(new File([b1],'pass1.zip'));
document.getElementById('log').textContent='';
const b3=await repairRefs(await buildRestyle(MODEL.zip,MODEL.man,MODEL.m,false,{}));const z3=readZip(await b3.arrayBuffer());
const a1=z1.byName['imsmanifest.xml'],a3=z3.byName['imsmanifest.xml'];
R.secondPassManifestBytesIdentical=a1.comp.length===a3.comp.length&&a1.comp.every((v,i)=>v===a3.comp[i]);
R.secondPassLog=logs();
// (5) explorer: open a module intro → it wears the card, nothing counts as edited; add a callout → export keeps card, no svg
EDITOR.resetCourse();await setFile(f);
const intro=[...document.querySelectorAll('#expl-list .cintro')].find(b=>b.dataset.kicker==='Editing module intro');
if(intro){EDITOR.openCoursePage(intro.dataset.entry,intro.dataset.title,await courseRawBody(intro.dataset.entry));
  const c=document.getElementById('pg-canvas');R.explorer={title:intro.dataset.title.slice(0,30),blocks:c.querySelectorAll(':scope>.pgb').length,
    canvasSvg:c.querySelectorAll('svg').length,falseEdit:Object.keys(EDITOR.courseEdits()).length};
  [...c.querySelectorAll('.pgb-end button')].find(x=>/callout/i.test(x.textContent))?.click();
  const ed=EDITOR.courseEdits()[intro.dataset.entry];const out=ed&&ed.intro||'';
  R.explorer.editedOut={card:isTemplatedIntro(out),svg:cnt(P(out),'svg'),len:out.length};
  const b4=await repairRefs(await buildRestyle(MODEL.zip,MODEL.man,MODEL.m,false,EDITOR.courseEdits()));const z4=readZip(await b4.arrayBuffer());
  const d4=parseManifest(await z4.text('imsmanifest.xml'));const id=intro.dataset.entry.slice(5);
  const it4=[...d4.querySelectorAll('item')].find(x=>x.getAttribute('identifier')===id);
  R.explorer.exported={card:isTemplatedIntro(it4.getAttribute('description')||''),hasCallout:/border-left:4px/i.test(it4.getAttribute('description')||'')};}
R.errs=__errs;return R;
