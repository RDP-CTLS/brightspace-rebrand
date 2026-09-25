// Scrolled deep into a long preview, then opening a different (shorter) page snaps the window back to
// the top of the pane, so the new page's content is in view (not a blank area below its end).
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)],w=ms=>new Promise(z=>setTimeout(z,ms));
const until=async f=>{for(let i=0;i<200&&!f();i++)await w(50);return f();};
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'course-export.zip')); await w(200);
$q('#convert').click();await w(300);$q('#fold-open').click();
const pages=$a('#expl-list .ctopic');const R={};
const open=async btn=>{$q('#cx-frame').srcdoc='';btn.click();await until(()=>($q('#cx-frame').srcdoc||'').length>50);await w(900);
  return parseInt($q('#cx-frame').style.height)||0;};
// find the tallest and a short page
const hs=[];for(const p of pages.slice(0,40)){hs.push([await open(p),p]);}
hs.sort((a,b)=>b[0]-a[0]);const tall=hs[0],short=hs[hs.length-1];
R.tallH=tall[0];R.shortH=short[0];
await open(tall[1]);window.scrollTo(0,document.documentElement.scrollHeight);await w(300);
const sm=parseFloat(getComputedStyle($q('#cx-pane')).scrollMarginTop);
R.scrolledInto=$q('#cx-pane').getBoundingClientRect().top<sm;
await open(short[1]);
const r=$q('#cx-frame').getBoundingClientRect();
R.paneTopAligned=Math.abs($q('#cx-pane').getBoundingClientRect().top-sm)<30;
R.previewVisible=r.top<innerHeight&&r.bottom>sm;
// near the top already: clicking another page does not jump the window
window.scrollTo(0,0);await w(300);const y0=scrollY;await open(pages[1]);R.noJumpAtTop=Math.abs(scrollY-y0)<400;
R.errs=__errs;return R;
