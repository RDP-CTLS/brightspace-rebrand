// Step 6 fix: generated blocks (callout/section/contacts/link) added to a module intro / topic
// DESCRIPTION must emit NO inline <svg> (Brightspace strips svg from descriptions on import), while a
// callout on a content PAGE must keep its svg (pages keep svg). The box/banner + heading must survive,
// and no empty flex-child <div> may be left where the icon was.
const c=document.getElementById('pg-canvas');
const add=k=>c.querySelector(`[data-add="${k}"]`)?.click();
const open=async b=>{EDITOR.openCoursePage(b.dataset.entry,b.dataset.title,await courseRawBody(b.dataset.entry));};
function an(html){
  const d=new DOMParser().parseFromString(html||'','text/html');
  const divs=[...d.querySelectorAll('div')];
  return {
    svg:d.querySelectorAll('svg').length,
    viewBox:[...d.querySelectorAll('svg')].some(s=>s.hasAttribute('viewBox')),
    path:d.querySelectorAll('path').length,
    calloutBox:divs.some(x=>/border-left:4px/i.test(x.getAttribute('style')||'')&&/background/i.test(x.getAttribute('style')||'')),
    cardBanner:/margin:-1.35rem/.test(html||''),
    // the icon-wrapper div (`flex-shrink:0;margin-top:.1rem`) is the gap culprit: it must be ABSENT in a
    // description (fix removes it) and PRESENT-with-svg on a page.
    iconWrappers:divs.filter(x=>/flex-shrink:0;margin-top:\.1rem/.test(x.getAttribute('style')||'')).length,
    iconWrappersEmpty:divs.filter(x=>/flex-shrink:0;margin-top:\.1rem/.test(x.getAttribute('style')||'')&&!(x.textContent||'').trim()&&x.children.length===0).length,
    len:(html||'').length
  };
}
EDITOR.resetCourse();
await setFile(new File([await (await fetch('/original.zip')).blob()],'course.zip'));
const intros=[...document.querySelectorAll('#expl-list .cintro')];
const modIntro=intros.find(b=>b.dataset.kicker==='Editing module intro'&&/CTLS Resources/.test(b.dataset.title));
const page=[...document.querySelectorAll('#expl-list .ctopic:not(.cintro)')].find(b=>/Gibbs/.test(b.dataset.title));

// --- module intro: callout + section, expect zero svg, box/banner kept, no empty gap div ---
await open(modIntro);
add('callout'); add('section');
const introForm=!!document.querySelector('.pgb-form .iconpick');   // icon picker should be HIDDEN here
const introEd=EDITOR.courseEdits()[modIntro.dataset.entry];
const introHtml=introEd&&introEd.intro||'';
const intro=an(introHtml);

// --- content page: callout, expect the svg to survive (pages keep svg) ---
await open(page);
add('callout');
const pageForm=!!document.querySelector('.pgb-form .iconpick');    // icon picker should be SHOWN here
const pageEd=EDITOR.courseEdits()[page.dataset.entry];
const pageHtml=typeof pageEd==='string'?pageEd:(pageEd&&(pageEd.intro||pageEd.framed))||'';
const pg=an(pageHtml);

const pass = intro.svg===0 && intro.calloutBox && intro.cardBanner && intro.iconWrappers===0
          && pg.svg>=1 && pg.viewBox && pg.path>=1 && pg.iconWrappers>=1
          && introForm===false && pageForm===true;
return {pass, intro:{...intro,iconPickerShown:introForm}, page:{...pg,iconPickerShown:pageForm}, errs:__errs};
