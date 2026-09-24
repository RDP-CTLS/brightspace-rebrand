// The course outline's module groups: one per top-level module, first one open, fold/unfold (one or all),
// no per-module merge ticks (Compressed covers the whole course), and "Spread out only" turns the
// compress preview off.
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)],w=ms=>new Promise(z=>setTimeout(z,ms));
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'course-export.zip'));
const groups=$a('#expl-list .cgroup');
const r={groups:groups.length,tops:topModules(MODEL.m.org).length,noTicks:$a('.modchk,.cmerge').length===0,
  openByDefault:groups.map(g=>!g.querySelector(':scope>.ctree')?.hidden)};
$q('#fold-open').click(); r.expandAllVisible=$a('.ctopic').filter(x=>x.offsetParent).length;
$q('#fold-shut').click(); r.collapseAllVisible=$a('.ctopic').filter(x=>x.offsetParent).length;
const t=groups[5].querySelector('.ctoggle'); t.click(); r.toggleOpens=t.getAttribute('aria-expanded')==='true'&&!groups[5].querySelector(':scope>.ctree').hidden;
r.tickHiddenBeforeConvert=$q('.expl-tree-head .ctools').hidden;   // P3-3: the compress tick only appears after Convert
$q('#convert').click(); await w(200);
r.tickShownAfterConvert=!$q('.expl-tree-head .ctools').hidden;
$q('#show-compress').click(); await w(300); r.previewTags=$a('.cfold-tag').length;
const ro=$q('input[name=mode][value=restyle]'); ro.checked=true; ro.dispatchEvent(new Event('change')); await w(100);
r.spreadOnlyClearsPreview=$a('.cfold-tag').length===0&&$q('#show-compress').disabled&&/Spread out only/.test($q('#merge-note').textContent);
const bo=$q('input[name=mode][value=both]'); bo.checked=true; bo.dispatchEvent(new Event('change')); await w(300);
r.bothRestores=$a('.cfold-tag').length===r.previewTags&&!$q('#show-compress').disabled;
r.errs=window.__errs||[];return r;
