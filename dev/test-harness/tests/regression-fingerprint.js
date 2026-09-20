// Fingerprint of everything the tool produced BEFORE the course explorer existed, using only the UI
// (file in -> "Apply the RDP template" -> downloads; paste -> page code) so it runs on old builds too.
// Run by dev/test-harness/regression.sh against two builds; the two JSON results must match.
try{localStorage.clear();}catch(e){}
const R={}; const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const $id=i=>document.getElementById(i);
const load=async(url,name)=>{await setFile(new File([await (await fetch(url)).blob()],name));};
const go=async(mode,tickAll)=>{document.querySelector('input[name=mode][value="'+mode+'"]').checked=true;
  document.querySelectorAll('.modchk').forEach(b=>b.checked=!!tickAll);
  $id('go').click(); for(let i=0;i<3000;i++){await sleep(100); if(!$id('go').disabled)break;}
  const out={log:$id('log').textContent.split('\n').map(l=>l.trim()).filter(l=>/restyled|combined|merged|repaired|RESULT|dangling|in-page refs|went wrong|already/.test(l)), files:{}};
  for(const a of document.querySelectorAll('#downloads a')){const z=readZip(await (await fetch(a.href)).arrayBuffer()); const f={};
    for(const e of z.entries)f[e.name]=e.crc+':'+e.uncompSize;          // crc of the real bytes: compression/timestamps don't matter
    out.files[a.download.replace(/^.* - /,'')]=f;}
  return out;};
// --- whole-course imports
await load('/original.zip','course.zip');  R.pkg_both_noneTicked=await go('both',false);
R.pkg_both_allTicked=await go('both',true);    R.pkg_restyleOnly=await go('restyle',false);   R.pkg_combineOnly=await go('combine',true);
await load('/test.imscc','cc.imscc');          R.cc_both_allTicked=await go('both',true);      R.cc_both_noneTicked=await go('both',false);
// --- a file that isn't a course: friendly message, nothing enabled
await load('/harness.html','not-a-zip.zip'); R.badFile={goDisabled:$id('go').disabled, downloads:document.querySelectorAll('#downloads a').length};
// --- the single-page tool: paste -> blocks -> page code
const paste=async html=>{$id('start-blank').click(); await sleep(60); $id('pg-paste').value=html; $id('pg-paste').dispatchEvent(new Event('input',{bubbles:true})); await sleep(500);
  return {blocks:$id('pg-canvas').querySelectorAll(':scope>.pgb').length, code:$id('pg-code').value};};
const srcZip=readZip(await (await fetch('/original.zip')).arrayBuffer()); const realPages=srcZip.entries.filter(e=>/\.html$/i.test(e.name)).sort((a,b)=>b.uncompSize-a.uncompSize).slice(0,3);
R.page_plain=await paste('<h2>Week 1</h2><p>Read <a href="https://example.org/a">this</a> first.</p><ul><li>one</li><li>two</li></ul><table><tr><th>A</th><td>1</td></tr></table><p><img src="pic.png" alt="x" width="40"></p><iframe src="https://www.youtube.com/embed/abc" width="560" height="315"></iframe>');
let n=0; for(const e of realPages){const raw=await srcZip.text(e.name); R['page_real'+(++n)]=await paste((raw.match(/<body[^>]*>([\s\S]*)<\/body>/i)||[,raw])[1]);}
// a blank page with one of every block the chips offer
$id('start-blank').click(); await sleep(60);
const kinds=[...new Set([...document.querySelectorAll('#s2-page [data-add]')].map(b=>b.dataset.add))];
for(const k of kinds){const all=[...document.querySelectorAll('#s2-page [data-add="'+k+'"]')]; all[all.length-1].click(); await sleep(40);}   // the last chip of a kind = "add at the end"
R.page_blank={kinds, blocks:$id('pg-canvas').querySelectorAll(':scope>.pgb').length, code:$id('pg-code').value};
R.errs=__errs; return R;
