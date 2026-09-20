// Pasting a page (or starting a blank one) mid-course must not strand the course edits.
try{localStorage.clear();}catch(e){}
const R={}; const c=document.getElementById('pg-canvas'); const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const $id=i=>document.getElementById(i);
const open=async b=>{EDITOR.openCoursePage(b.dataset.entry,b.dataset.title,await courseRawBody(b.dataset.entry));};
const addCallout=()=>[...c.querySelectorAll('.pgb-end button')].find(x=>/callout/i.test(x.textContent))?.click();
const state=()=>({kind:FLOW.kind(), banner:!$id('course-back').hidden, msg:$id('course-back').hidden?'':$id('course-back-msg').textContent, explorerShown:!$id('s2-course').hidden&&!$id('explorer').hidden, paneOpen:!$id('cx-pane').hidden,
  badges:document.querySelectorAll('#expl-list [data-edited]:not([hidden])').length, edits:Object.keys(EDITOR.courseEdits()).length, canvasInExplorer:!!document.querySelector('#cx-mount #pg-canvas'), receipt1:$id('r1').textContent});
await setFile(new File([await (await fetch('/original.zip')).blob()],'course.zip'));
// any course works (point ORIGINAL at it): no "Gibbs" page -> the first page; no intros -> a second page stands in
const allPages=[...document.querySelectorAll('#expl-list .ctopic:not(.cintro)')]; const page=allPages.find(b=>/Gibbs/.test(b.dataset.title))||allPages[0], intro=document.querySelector('#expl-list .cintro')||allPages.find(b=>b!==page);
await open(page); addCallout(); await open(intro); addCallout(); R.before=state();
// 1) paste a page mid-course (the real input path, debounced)
$id('pg-paste').value='<p>PASTED-SINGLE-PAGE one</p><p>two</p>'; $id('pg-paste').dispatchEvent(new Event('input',{bubbles:true})); await sleep(400); R.afterPaste=state(); R.pastedOnCanvas=/PASTED-SINGLE-PAGE/.test(c.textContent);
// 2) the way back
$id('course-back-btn').click(); await sleep(50); R.afterBack=state();
await open(page); R.pageEditKept=/callout|Callout/i.test(c.innerHTML)&&c.querySelectorAll(':scope>.pgb').length>1; R.openedAfterBack=state();
// the single-page draft survived the round trip too
$id('cx-close').click(); R.afterClosePane=state(); R.draftStillThere=/PASTED-SINGLE-PAGE/.test($id('pg-code').value);
// 3) export still carries both edits
$id('go').click(); for(let i=0;i<300;i++){await sleep(100); if(document.querySelectorAll('#downloads a').length&&!$id('go').disabled)break;}
R.exportLog=$id('log').textContent.split('\n').map(l=>l.trim()).filter(l=>/You edited|applied your edits|updated|RESULT/.test(l));
// 4) "Start a new page" mid-course: same banner, same way back
FLOW.go(2); await open(page); $id('start-blank').click(); await sleep(50); R.afterBlank=state(); $id('course-back-btn').click(); await sleep(50); R.afterBack2=state();
// 5) parked in page mode, then a file that fails to load: the banner must not promise a course that's gone
$id('start-blank').click(); await sleep(50); await setFile(new File([new Uint8Array([1,2,3,4])],'not-a-zip.zip')); R.afterBadFile={...state(), model:!!MODEL};
// 6) and a good file brings course mode back cleanly
await setFile(new File([await (await fetch('/original.zip')).blob()],'again.zip')); R.afterNewCourse=state();
R.errs=__errs; return R;
