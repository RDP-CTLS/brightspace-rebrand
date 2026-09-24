// Regression for the "modules stuck / blank preview" bug (cfa73ab): if one image in a page fails to
// decode, courseAssetUrl used to reject and leave the pane on the PREVIOUS page. courseAssetUrl now
// swallows the decode error and returns null, so every view still updates.
// Needs ORIGINAL = a course whose content page carries a deflated (method 8) image, e.g. the ITL
// 23424 full export. PASS = original.paneUpdated && styled.paneUpdated && errs [].
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)],w=ms=>new Promise(z=>setTimeout(z,ms));
const until=async(f,n=60)=>{for(let i=0;i<n&&!f();i++)await w(50);return f();};
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'c.zip')); await w(200);
$a('.cgroup').forEach(g=>foldGroup(g,true));
const R={};
// find a content page with an <img> that resolves to a DEFLATED zip entry; corrupt that entry
let target=null,victim=null;
for(const t of $a('#expl-list .ctopic').filter(x=>!x.classList.contains('cintro'))){
  const raw=await MODEL.zip.text(t.dataset.entry);
  for(const m of raw.matchAll(/<img[^>]*src="([^"]+)"/gi)){const n=assetEntry(assetFolder(t.dataset.entry),m[1]);
    const e=n&&MODEL.zip.entries.find(x=>x.name===n);if(e&&e.method===8){target=t;victim=e;break;}}
  if(target)break;}
if(!victim)return{skipped:'no deflated content-page image in this fixture — needs the ITL 23424 full export'};
R.page=target&&target.dataset.title;R.img=victim&&victim.name;
victim.comp=new Uint8Array([0xff,0xff,0xff,0xff,0x00,0x13,0x37]);   // corrupt deflate data
// open a DIFFERENT page first so a stale pane is detectable
const other=$a('#expl-list .ctopic').find(x=>!x.classList.contains('cintro')&&x!==target);
const run=async label=>{other.click();await until(()=>($q('#cx-frame').srcdoc||'').length>50);await w(300);
  const before=$q('#cx-frame').srcdoc;const e0=(window.__errs||[]).length;
  target.click();await w(2500);
  const s=$q('#cx-frame').srcdoc||'';
  R[label]={title:$q('#cx-title').textContent,paneUpdated:s!==before&&s.length>50,stillShowsOtherPage:s===before,newErrs:(window.__errs||[]).slice(e0)};};
await run('original');
$q('#convert').click();await w(400);
await run('styled');
$q('#cx-views [data-view="edit"]').click();await w(300);
other.click();await w(800);target.click();await w(2500);
R.edit={title:$q('#cx-title').textContent,blocks:$a('#pg-canvas>.pgb').length,mountShown:!$q('#cx-mount').hidden};
R.errs=window.__errs;return R;
