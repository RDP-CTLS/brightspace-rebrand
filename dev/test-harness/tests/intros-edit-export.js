const R={}; const c=document.getElementById('pg-canvas');
const bars=()=>[...c.querySelectorAll(':scope>.pgb')]; const btn=(blk,re)=>[...blk.querySelectorAll('.pgb-bar button')].find(x=>re.test(x.textContent+x.title+(x.getAttribute('aria-label')||'')));
const addCallout=()=>[...c.querySelectorAll('.pgb-end button')].find(x=>/callout/i.test(x.textContent))?.click();
const open=async b=>{EDITOR.openCoursePage(b.dataset.entry,b.dataset.title,await courseRawBody(b.dataset.entry));};
const runGo=async()=>{document.getElementById('go').click(); for(let i=0;i<200;i++){await new Promise(r=>setTimeout(r,100)); if(document.querySelectorAll('#downloads a').length&&!document.getElementById('go').disabled)break;}
  return {zip:readZip(await (await fetch(document.querySelector('#downloads a').href)).arrayBuffer()), log:document.getElementById('log').textContent.split('\n').map(l=>l.trim()).filter(l=>/edited|restyled|updated|already|intro|RESULT|manifest parses/.test(l)).map(l=>l.slice(0,170)), downloads:[...document.querySelectorAll('#downloads a')].length};};
async function scenario(url,label){
  EDITOR.resetCourse(); await setFile(new File([await (await fetch(url)).blob()],label+'.zip'));
  const base=readZip(await (await repairRefs(await buildRestyle(MODEL.zip,MODEL.man,MODEL.m,false,{}))).arrayBuffer());
  const intros=[...document.querySelectorAll('#expl-list .cintro')]; const modIntro=intros.find(b=>b.dataset.kicker==='Editing module intro'&&/CTLS Resources/.test(b.dataset.title)), linkDesc=intros.find(b=>b.dataset.kicker==='Editing description');
  const page=[...document.querySelectorAll('#expl-list .ctopic:not(.cintro)')].find(b=>/Gibbs/.test(b.dataset.title));
  await open(modIntro); const n0=bars().length; btn(bars()[0],/delete|remove/i)?.click(); addCallout();
  await open(linkDesc); addCallout(); btn(bars()[bars().length-1],/move up/i)?.click();
  await open(page); addCallout();
  await open(modIntro); const kept=bars().length===n0;   // switching back keeps the intro's edit
  const ed=EDITOR.courseEdits(); const g=await runGo(); const out=g.zip;
  const newMan=await out.text('imsmanifest.xml'); const mk=k=>k.slice(5);
  // manifest: only the two description values may differ
  const blank=(s,ids)=>{for(const id of ids)s=s.replace(new RegExp('(<item identifier="'+id+'"[^>]*?\\sdescription=")[^"]*(")'),'$1@$2');return s;};
  const ids=Object.keys(ed).filter(isIntroKey).map(mk);
  const doc=parseManifest(newMan); const byId={};doc.querySelectorAll('item').forEach(it=>byId[it.getAttribute('identifier')]=it);
  let otherDiff=[]; for(const e of out.entries){ if(e.name==='imsmanifest.xml'||e.name===page.dataset.entry||!/\.(html|xml)$/i.test(e.name))continue; if((await out.text(e.name))!==(await base.text(e.name)))otherDiff.push(e.name.slice(0,40)); }
  const pg=await out.text(page.dataset.entry);
  return {label, editedKeys:Object.keys(ed).map(k=>k.slice(0,14)+':'+(typeof ed[k]==='object'?Object.keys(ed[k])[0]:'inner')), editKeptOnSwitch:kept, downloads:g.downloads, log:g.log,
    manifestChanged:newMan!==MODEL.man, manifestSameExceptTheTwo:blank(newMan,ids)===blank(MODEL.man,ids), bomOut:await out.hasBom('imsmanifest.xml'), bomIn:await MODEL.zip.hasBom('imsmanifest.xml'),
    readBack:ids.map(id=>{const v=byId[id].getAttribute('description'); return {id, equalsPayload:v.replace(/\r\n?/g,'\n')===ed['desc:'+id].intro.replace(/\r\n?/g,'\n'), hasSvgViewBox:/viewBox/.test(v), len:v.length};}),
    pageEdited:pg!==(await base.text(page.dataset.entry)), pageCards:(pg.match(/border-top:\s*4px\s+solid/g)||[]).length, otherTextFilesChanged:otherDiff, entries:[out.entries.length,base.entries.length]};}
R.first=await scenario('/original.zip','original');
R.second=await scenario('/sandbox.zip','sandbox-templated');
// refusal path: an id that isn't in the manifest must refuse everything and leave the manifest alone
const bad=applyIntroEdits(MODEL.man,{'desc:NOPE-404':{intro:'<p>x</p>'}}); R.refusal={failed:!!bad.failed,unchanged:bad.man===MODEL.man};
// no-intro-edit run keeps the manifest byte-identical (copied, not rewritten)
EDITOR.resetCourse(); const z0=readZip(await (await buildRestyle(MODEL.zip,MODEL.man,MODEL.m,false,{})).arrayBuffer()); const a=z0.byName['imsmanifest.xml'],b0=MODEL.zip.byName['imsmanifest.xml'];
R.noEditManifestBytesIdentical=a.comp.length===b0.comp.length&&a.comp.every((v,i)=>v===b0.comp[i]);
R.errs=__errs; return R;
