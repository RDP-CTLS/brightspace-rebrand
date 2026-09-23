// Moving around the course outline: summary + Start, Prev/Next (across folded modules), keep-in-view,
// arrow keys, find-a-page, and that an edit survives navigating away and back.
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)],wait=ms=>new Promise(z=>setTimeout(z,ms));
const until=async f=>{for(let i=0;i<100&&!f();i++)await wait(50);return f();};
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'course-export.zip'));
await wait(50);
const r={summary:$q('#cx-sum').textContent,sum2:$q('#cx-sum2').textContent};
const topics=$a('#expl-list .ctopic'), sel=()=>$q('#expl-list .ctopic.sel'), idx=()=>topics.indexOf(sel());
$q('#cx-start').click(); await until(()=>!$q('#cx-pane').hidden&&sel());
r.startOpensFirst=idx()===0; r.pos1=$q('#cx-pos').textContent; r.prevDisabledAtStart=$q('#cx-prev').disabled;
// walk Next to the first page of the 2nd module (group 1 starts folded)
const g1first=$a('.cgroup')[1].querySelector('.ctopic'); const g1i=topics.indexOf(g1first);
r.g1FoldedBefore=$a('.cgroup')[1].querySelector(':scope>.ctree').hidden;
for(let k=0;k<g1i;k++){$q('#cx-next').click();await wait(30);}
await until(()=>sel()===g1first);
r.nextCrossesModule=sel()===g1first; r.g1UnfoldedAfter=!$a('.cgroup')[1].querySelector(':scope>.ctree').hidden;
// keep-in-view: jump to the last page, then check it's inside the outline's box, below the sticky head
$a('.cgroup').forEach(g=>foldGroup(g,true)); topics[topics.length-1].click(); await until(()=>idx()===topics.length-1);
const tr=$q('.expl-tree').getBoundingClientRect(),er=sel().getBoundingClientRect();
r.lastInView=er.top>=tr.top+$q('.expl-tree-head').offsetHeight-1&&er.bottom<=tr.bottom+1;
r.nextDisabledAtEnd=$q('#cx-next').disabled; r.bottomNextHidden=$q('#cx-next2').hidden; r.bottomPrevLabel=$q('#cx-prev2').textContent;
// edit survives navigation: add a callout on page 3, go Next, come back
topics[2].click(); await until(()=>idx()===2); await wait(100);
[...$a('#pg-canvas .pgb-end button')].find(x=>/callout/i.test(x.textContent))?.click(); await wait(100);
const e3=topics[2].dataset.entry; r.editedBadge=!topics[2].querySelector('[data-edited]').hidden;
$q('#cx-next').click(); await until(()=>idx()===3); $q('#cx-prev').click(); await until(()=>idx()===2);
r.editKeptAfterNav=!!EDITOR.courseEdits()[e3]; r.editDotOnModule=!topics[2].closest('.cgroup').querySelector('[data-editdot]').hidden;
r.mergeOffWithEdits=$q('.expl-tree').classList.contains('nomerge');
// arrow keys
topics[0].focus(); topics[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
r.arrowDownMoves=document.activeElement===topics[1];
const t2=$a('.ctoggle')[2]; foldGroup(t2.closest('.cgroup'),false); t2.focus();
t2.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); r.arrowRightUnfolds=t2.getAttribute('aria-expanded')==='true';
// find-a-page
const f=$q('#cx-filter'); $a('.cgroup').forEach((g,i)=>foldGroup(g,i===0));
f.value='gibbs'; f.dispatchEvent(new Event('input'));
const vis=()=>$a('#expl-list .ctopic').filter(x=>x.offsetParent!==null).map(x=>x.dataset.title);
r.filterGibbs=vis(); r.filterGroupsShown=$a('.cgroup').filter(g=>!g.hidden).length;
f.value='module intro'; f.dispatchEvent(new Event('input')); r.filterIntros=vis().length;
f.value='zzzz'; f.dispatchEvent(new Event('input')); r.noMatchShown=!$q('#cx-nomatch').hidden;
f.value=''; f.dispatchEvent(new Event('input')); r.clearRestoresFolds=$a('.cgroup').map(g=>!g.querySelector(':scope>.ctree')?.hidden).filter(Boolean).length;
r.clearShowsAll=$a('.cgroup').every(g=>!g.hidden)&&$a('#expl-list li[hidden]').length===0;
$q('#cx-close').click(); r.summaryAfter=$q('#cx-sum2').textContent;
r.errs=window.__errs||[];
return r;
