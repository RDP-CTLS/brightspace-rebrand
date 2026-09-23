// Step 2's header carries the next action: Apply in course mode, Continue in single-page mode.
const $q=s=>document.querySelector(s),vis=s=>{const e=$q(s);return !!e&&e.offsetParent!==null;},wait=ms=>new Promise(z=>setTimeout(z,ms));
const r={};
document.getElementById('start-blank').click(); await wait(100);
r.page={continueShown:vis('#pg-next'),applyHidden:!vis('#go'),s2cur:$q('#s2').classList.contains('cur')};
$q('#pg-next').click(); await wait(50); r.page.emptyNoteStays=$q('#s2').classList.contains('cur')&&/Add a block/.test($q('#pg-note').textContent);
[...document.querySelectorAll('#pg-canvas button')].find(x=>/^callout$/i.test(x.textContent.trim()))?.click(); await wait(100);
r.page.blocksAdded=document.querySelectorAll('#pg-canvas .pgb').length;
$q('#pg-next').click(); await wait(100);
r.page.continueGoesToStep3=$q('#s3').classList.contains('cur'); r.page.headerActHiddenWhenNotCur=!vis('#pg-next');
r.page.startOverStillThere=!!$q('#s2-page .act #pg-clear');
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'course-export.zip')); await wait(300);
r.course={applyShown:vis('#go'),continueHidden:!vis('#pg-next'),sticky:getComputedStyle($q('#s2>.sh')).position};
// open a course page then go back to a blank page: the canvas must land back in the single-page section
document.querySelectorAll('#expl-list .ctopic')[1].click(); await wait(400);
document.getElementById('start-blank').click(); await wait(100);
r.backToPage={canvasInPage:!!$q('#s2-page #pg-canvas'),canvasBeforeAct:$q('#s2-page #pg-canvas')?.nextElementSibling===$q('#s2-page .act'),continueShown:vis('#pg-next')};
r.errs=window.__errs||[];return r;
