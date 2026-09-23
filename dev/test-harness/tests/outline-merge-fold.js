// The course outline's module groups: fold toggles + the per-module "Merge" tick the export reads.
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)];
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'course-export.zip'));
const tops=topModules(MODEL.m.org).map(it=>it.getAttribute('identifier'));
const boxes=$a('.modchk'), groups=$a('#expl-list .cgroup');
const r={groups:groups.length, boxes:boxes.length, boxIdsMatchTops:JSON.stringify(boxes.map(x=>x.dataset.id))===JSON.stringify(tops),
  noneTickedByDefault:boxes.every(x=>!x.checked),
  openByDefault:groups.map(g=>!g.querySelector(':scope>.ctree')?.hidden)};
$q('#merge-all').click(); r.allTicks=boxes.every(x=>x.checked);
$q('#merge-none').click(); r.noneUnticks=boxes.every(x=>!x.checked);
$q('#fold-open').click(); r.expandAllVisible=$a('.ctopic').filter(x=>x.offsetParent).length;
$q('#fold-shut').click(); r.collapseAllVisible=$a('.ctopic').filter(x=>x.offsetParent).length;
const t=groups[5].querySelector('.ctoggle'); t.click(); r.toggleOpens=t.getAttribute('aria-expanded')==='true'&&!groups[5].querySelector(':scope>.ctree').hidden;
// Tick ONE module via its header label and export combine-only: only that module's pages fold.
groups[5].querySelector('.cmerge').click(); r.oneTicked=boxes.filter(x=>x.checked).map(x=>x.dataset.title);
document.querySelector('input[name=mode][value=restyle]').checked=true; document.querySelector('input[name=mode][value=restyle]').dispatchEvent(new Event('change'));
r.styledOnlyDisables=$q('.expl-tree').classList.contains('nomerge')&&boxes.every(x=>x.disabled)&&$q('#merge-note').textContent.includes('Styled only');
const cm=document.querySelector('input[name=mode][value=combine]'); cm.checked=true; cm.dispatchEvent(new Event('change'));
r.combineReenables=!$q('.expl-tree').classList.contains('nomerge')&&boxes.every(x=>!x.disabled);
document.getElementById('log').textContent=''; document.getElementById('go').click();
for(let i=0;i<300&&!/RESULT/.test(document.getElementById('log').textContent);i++) await new Promise(z=>setTimeout(z,100));
r.combineLog=document.getElementById('log').textContent.split('\n').filter(l=>/merge groups|RESULT/.test(l));
r.errs=window.__errs||[];
return r;
