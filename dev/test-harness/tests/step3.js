// Step 3: Spread out + Compressed as two choices (one when only one was built), a one-line check result,
// numbered import steps, and single-page copy feedback that is visible in Step 3 itself.
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)],w=ms=>new Promise(z=>setTimeout(z,ms)),vis=e=>!!e&&e.offsetParent!==null;
const b=await (await fetch('/original.zip')).blob();
const run=async mode=>{await setFile(new File([b],'course-export.zip'));await w(100);
  const r=$q(`input[name=mode][value=${mode}]`);r.checked=true;r.dispatchEvent(new Event('change'));
  $q('#go').click();for(let i=0;i<900&&!$q('#s3').classList.contains('cur');i++)await w(100);
  const as=$a('#downloads a');
  return {inDom:as.length,shown:as.filter(vis).map(a=>({kind:a.dataset.kind,main:!a.classList.contains('sec'),t:a.querySelector('.dl-t').textContent.trim(),s:a.querySelector('.dl-s').textContent,file:a.download})),
    check:$q('#s3-check').textContent,steps:$a('#s3-course .steps li').length};};
const R={};
R.both=await run('both');
R.restyle=await run('restyle');
R.combine=await run('combine');

// ---- P1-1: an edit made AFTER Download invalidates the stale files (course mode) ----
const until=async(f,n=300)=>{for(let i=0;i<n&&!f();i++)await w(50);return f();};
const setBoth=()=>{const r=$q('input[name=mode][value=both]');r.checked=true;r.dispatchEvent(new Event('change'));};
const contentPages=()=>$a('#expl-list .ctopic').filter(x=>!x.classList.contains('cintro'));
const openInEdit=async t=>{t.click();await w(200);$q('#cx-views [data-view="edit"]').click();await until(()=>!$q('#cx-mount').hidden);await w(120);};
const addCallout=async()=>{$a('#pg-canvas button').find(x=>/^callout$/i.test(x.textContent.trim())).click();await w(300);};
const freshCourse=async()=>{await setFile(new File([b],'course-export.zip'));await w(150);$q('#convert').click();await w(200);};
const download=async()=>{setBoth();$q('#go').click();await until(()=>$q('#s3').classList.contains('cur')&&$a('#downloads a').length);
  const n=$a('#downloads a').length;$q('#s2 [data-go="2"]').click();await w(150);return n;};
// Negative 1: open a page in Edit, change nothing → downloads survive
await freshCourse();const n1=await download();await openInEdit(contentPages()[0]);
R.editNoChange={was:n1,now:$a('#downloads a').length,edits:Object.keys(EDITOR.courseEdits()).length};
// Negative 2: edit A, download, reopen A in Edit with no new change → downloads survive
await freshCourse();await openInEdit(contentPages()[0]);await addCallout();const n2=await download();
await openInEdit(contentPages()[0]);
R.reopenEdited={was:n2,now:$a('#downloads a').length};
// Positive: a real new edit after Download clears them and asks for a re-download
await freshCourse();const n3=await download();await openInEdit(contentPages()[0]);await addCallout();
R.editClears={was:n3,now:$a('#downloads a').length,check:$q('#s3-check').textContent,r2:($q('#r2')||{}).textContent};
R.p11pass=R.editNoChange.was===R.editNoChange.now&&R.editNoChange.now>0
  &&R.reopenEdited.was===R.reopenEdited.now&&R.reopenEdited.now>0
  &&R.editClears.now===0&&/again/.test(R.editClears.check);
// re-enter single-page mode cleanly for the copy-feedback checks below
// single page: copy success (stubbed clipboard) and failure both say so inside Step 3
document.getElementById('start-blank').click();await w(50);
[...document.querySelectorAll('#pg-canvas button')].find(x=>/^callout$/i.test(x.textContent.trim())).click();await w(50);
$q('#pg-next').click();await w(100);
const realClip=navigator.clipboard;
Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{}}});
$q('#pg-copy').click();await w(100);
R.copyOk={msg:$q('#pg-copymsg').textContent,visible:vis($q('#pg-copymsg')),err:$q('#pg-copymsg').classList.contains('err')};
Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}});
document.execCommand=()=>false;
$q('#pg-copy').click();await w(100);
R.copyFail={msg:$q('#pg-copymsg').textContent.slice(0,40),visible:vis($q('#pg-copymsg')),err:$q('#pg-copymsg').classList.contains('err'),codeOpen:$q('#pg-code').closest('details').open};
R.pageSteps=$a('#s3-page .steps li').length;
R.errs=window.__errs||[];return R;
