// Builds the zip for the Step 6 acceptance test (import into the Brightspace sandbox and eyeball it):
// the untouched original course, styled, with ONE page, ONE module intro and ONE link description edited.
// Every edit carries the marker text STEP6 so it is easy to find in Brightspace.
//   SAVE_DIR=~/Desktop dev/test-harness/run.sh tests/make-step6-zip.js
const c=document.getElementById('pg-canvas'); const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const $id=i=>document.getElementById(i);
const bars=()=>[...c.querySelectorAll(':scope>.pgb')]; const open=async b=>{EDITOR.openCoursePage(b.dataset.entry,b.dataset.title,await courseRawBody(b.dataset.entry));};
const add=re=>[...c.querySelectorAll('.pgb-end button')].find(x=>re.test(x.textContent)).click();
const mark=(label)=>{const body=bars()[bars().length-1].querySelector('.pgb-body'); const p=document.createElement('p'); p.textContent='STEP6 test edit — '+label; body.appendChild(p); body.dispatchEvent(new InputEvent('input',{bubbles:true}));};
await setFile(new File([await (await fetch('/original.zip')).blob()],'course.zip'));
const intros=[...document.querySelectorAll('#expl-list .cintro')];
const page=[...document.querySelectorAll('#expl-list .ctopic:not(.cintro)')].find(b=>/Gibbs/.test(b.dataset.title)), modIntro=intros.find(b=>b.dataset.kicker==='Editing module intro'&&/CTLS Resources/.test(b.dataset.title)), linkDesc=intros.find(b=>b.dataset.kicker==='Editing description');
await open(page); add(/callout/i); mark('callout added to a PAGE'); add(/section/i);
await open(modIntro); add(/callout/i); mark('callout added to a MODULE INTRO');
await open(linkDesc); add(/callout/i); mark('callout added to a LINK/ASSIGNMENT DESCRIPTION');
const ed=EDITOR.courseEdits(); $id('go').click(); for(let i=0;i<600;i++){await sleep(100); if(!$id('go').disabled)break;}
const a=document.querySelector('#downloads a'); const blob=await (await fetch(a.href)).blob(); const name='STEP6-import-test - '+a.download;
await fetch('/save/'+encodeURIComponent(name),{method:'POST',body:blob});
return {saved:name, mb:+(blob.size/1048576).toFixed(1), edited:{page:page.dataset.title, moduleIntro:modIntro.dataset.title, linkDescription:linkDesc.dataset.title}, editKeys:Object.keys(ed).length,
  log:$id('log').textContent.split('\n').map(l=>l.trim()).filter(l=>/You edited|restyled|updated|RESULT|went wrong/.test(l)), errs:__errs};
