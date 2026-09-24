// Convert first, then personalize: Original preview before Convert; after it Styled (the export's own
// HTML, edits included) and Edit; "Show how Compressed combines pages"; Download -> Spread out + Compressed.
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)],w=ms=>new Promise(z=>setTimeout(z,ms)),vis=e=>!!e&&e.offsetParent!==null;
const until=async f=>{for(let i=0;i<200&&!f();i++)await w(50);return f();};
// read what the pane rendered (srcdoc is set once, at the end of a render), not the frame's live doc
const src=()=>$q('#cx-frame').srcdoc||'';
const frameReady=async()=>until(()=>src().length>50);
const frameDoc=()=>({body:{innerHTML:src()},querySelectorAll:q=>new DOMParser().parseFromString(src(),'text/html').querySelectorAll(q)});
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'course-export.zip')); await w(100);
const R={};
R.before={convert:vis($q('#convert')),download:vis($q('#go')),ready:$q('#cx-ready').textContent};
const topics=$a('#expl-list .ctopic'),page=topics.find(t=>!t.classList.contains('cintro'));
$q('#cx-frame').srcdoc='';page.click();await frameReady();
R.before.views=$a('#cx-views button').filter(vis).map(x=>x.textContent);
R.before.previewShown=vis($q('#cx-preview'))&&!vis($q('#cx-mount'));
R.before.originalHasNoCard=!/border-top:4px solid/i.test(frameDoc().body.innerHTML);
// Convert
$q('#cx-frame').srcdoc='';$q('#convert').click();await frameReady();
R.after={convert:vis($q('#convert')),download:vis($q('#go')),views:$a('#cx-views button').filter(vis).map(x=>x.textContent),
  pressed:$q('#cx-views [aria-pressed="true"]').textContent,styledHasCard:/border-top:4px solid/i.test(frameDoc().body.innerHTML),
  frameScripts:frameDoc().querySelectorAll('script').length,sandbox:$q('#cx-frame').getAttribute('sandbox')};
// Edit, add a callout, back to Styled: the preview carries the edit
$q('#cx-views [data-view="edit"]').click();await until(()=>vis($q('#cx-mount'))&&$a('#pg-canvas>.pgb').length);
R.edit={mountShown:vis($q('#cx-mount')),previewHidden:!vis($q('#cx-preview')),blocks:$a('#pg-canvas>.pgb').length,viewNote:$q('#cx-viewnote').textContent};
$a('#pg-canvas button').find(x=>/^callout$/i.test(x.textContent.trim())).click();await w(150);
R.edit.edited=Object.keys(EDITOR.courseEdits()).length;
$q('#cx-frame').srcdoc='';$q('#cx-views [data-view="styled"]').click();await frameReady();
R.edit.styledShowsCallout=/border-left:4px/i.test(frameDoc().body.innerHTML);
$q('#cx-frame').srcdoc='';$q('#cx-views [data-view="original"]').click();await frameReady();
R.edit.originalUnchanged=!/border-left:4px/i.test(frameDoc().body.innerHTML);
R.edit.compressOffNote=$q('#merge-note').textContent;
// P1-2: downloading WITH an edit gives Spread out only + a disabled Compressed card
$q('#go').click();await until(()=>$q('#s3').classList.contains('cur')&&$a('#downloads a').length);await w(150);
R.editDownload={links:$a('#downloads a').length,disabled:$a('#downloads [aria-disabled="true"]').length,
  disabledLabel:(($q('#downloads [aria-disabled="true"] .dl-t')||{}).textContent||''),check:$q('#s3-check').textContent};
// fresh load: compress preview + Download
await setFile(new File([b],'course-export.zip'));await w(100);$q('#convert').click();await w(200);
$q('#show-compress').click();await w(400);
R.compress={hosts:$a('.ctopic.chost').length,combined:$a('.ctopic.cfolds').length,summary:$q('#cx-sum3').textContent};
$q('#go').click();await until(()=>$q('#s3').classList.contains('cur'));await w(200);
R.download={shown:$a('#downloads a').filter(vis).map(a=>a.querySelector('.dl-t').textContent.trim()+' | '+a.querySelector('.dl-s').textContent),
  check:$q('#s3-check').textContent,results:$q('#log').textContent.split('\n').filter(l=>/RESULT|merge groups/.test(l)).map(l=>l.trim())};
R.errs=window.__errs||[];return R;
