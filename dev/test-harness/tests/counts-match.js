// Every total on screen agrees: the Step 1 receipt (pages + module intros), the module badges, and the
// "k of N" position. Link descriptions open and step with Prev/Next but aren't numbered.
const $q=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)],w=ms=>new Promise(z=>setTimeout(z,ms));
const b=await (await fetch('/original.zip')).blob(); await setFile(new File([b],'course-export.zip')); await w(200);
const rc=$q('#r1').textContent,m=rc.match(/(\d+) pages · (\d+) module intro/),total=+m[1]+ +m[2];
$q('#fold-open').click();
const badges=$a('.ccount').reduce((a,x)=>a+ +x.textContent,0);
const rows=$a('#expl-list .ctopic'),pos=[];
for(const r of rows){r.click();await w(60);pos.push($q('#cx-pos').textContent);}
const nums=pos.filter(p=>/ of /.test(p));
return {receipt:total,badges,rows:rows.length,numbered:nums.length,first:nums[0],last:nums[nums.length-1],
  unnumbered:[...new Set(pos.filter(p=>!/ of /.test(p)))],descRows:pos.filter(p=>p==='Link description').length,
  allOfTotal:nums.every(p=>p.endsWith(' of '+total)),errs:__errs};
