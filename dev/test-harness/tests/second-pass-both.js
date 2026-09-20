// An ALREADY-templated course (served as /sandbox.zip) put through "Make both versions", every section
// ticked, no edits: the styled build must equal the input file for file, and the combined build must
// reuse the existing cards — no page may gain a doubled title, a nested card or a blanked icon.
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const $id=i=>document.getElementById(i); const R={};
const dom=h=>new DOMParser().parseFromString(h,'text/html').body;
const badSvgs=d=>[...d.querySelectorAll('svg')].filter(v=>!v.getAttribute('viewBox')||[...v.querySelectorAll('path')].some(q=>!q.getAttribute('d'))).length;
await setFile(new File([await (await fetch('/sandbox.zip')).blob()],'templated.zip'));
document.querySelector('input[name=mode][value="both"]').checked=true; document.querySelectorAll('.modchk').forEach(b=>b.checked=true);
const t=performance.now(); $id('go').click(); for(let i=0;i<6000;i++){await sleep(100); if(!$id('go').disabled)break;} R.ms=Math.round(performance.now()-t);
R.log=$id('log').textContent.split('\n').map(l=>l.trim()).filter(l=>/restyled|combin|already|repaired|RESULT|icons|tag balance|went wrong/i.test(l)).map(l=>l.slice(0,160));
const links=[...document.querySelectorAll('#downloads a')]; R.downloads=links.map(a=>a.download.replace(/^.* - /,''));
{const z=readZip(await (await fetch(links[0].href)).arrayBuffer()); const d=MODEL.zip.entries.filter(e=>{const o=z.byName[e.name];return !o||o.crc!==e.crc||o.uncompSize!==e.uncompSize;});
 R.styledBuild={entries:z.entries.length+' (input '+MODEL.zip.entries.length+')', filesDifferentFromInput:d.length, names:d.slice(0,6).map(e=>e.name.slice(-50))};}
{const z=readZip(await (await fetch(links[1].href)).arrayBuffer()); let pages=0,cards=0,nested=0,blank=0,frames2=0,inCards=0,inBlank=0; const cardTitles=[],inTitles=[];
 const tally=async(zip,into)=>{let c=0,b=0;for(const e of zip.entries){if(!/\.html$/i.test(e.name))continue;const d=dom(await zip.text(e.name));const cs=[...d.querySelectorAll('div')].filter(isCardEl);if(!cs.length)continue;
   c+=cs.length;b+=badSvgs(d);cs.forEach(x=>into.push((x.firstElementChild.textContent||'').replace(/\s+/g,' ').trim()));
   if(zip===z){pages++;if(cs.some(x=>cs.some(y=>y!==x&&y.contains(x))))nested++;if([...d.querySelectorAll('div')].filter(x=>isFrameStyle(x.getAttribute('style'))).length>1)frames2++;}}return [c,b];};
 [cards,blank]=await tally(z,cardTitles); [inCards,inBlank]=await tally(MODEL.zip,inTitles);
 const lost=inTitles.filter(t=>!cardTitles.includes(t));
 R.combinedBuild={entries:z.entries.length, styledPages:pages, cards:cards+' (input '+inCards+')', pagesWithNestedCards:nested, pagesWithTwoFrames:frames2, blankIcons:blank+' (input '+inBlank+')', cardTitlesMissingFromOutput:[...new Set(lost)].slice(0,8)};}
R.errs=__errs; return R;
