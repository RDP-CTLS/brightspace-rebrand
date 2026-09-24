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
