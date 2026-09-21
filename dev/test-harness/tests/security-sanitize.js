// security-sanitize.js — the hardening for "nothing unsanitized reaches Brightspace".
// Brightspace's import renders content-page HTML same-origin with NO CSP/sandbox and executes it
// (proven 2026-09-20, DESC-TEST v3 P06), so the tool's own sanitizers are the only guard and the
// buildRestyle edited-page branch bypasses re-cleaning. This test checks BOTH layers:
//   (1) the sanitizers strip every dangerous construct — cleanBody (restyle path) + EDITOR.clean
//       (paste/import path, the fixed cleanDoc: data:application/xhtml+xml, data:text/xml, ...).
//   (2) the verify() belt flags dangerous OUTPUT bytes — a tool-generated page or a manifest
//       description — so #go withholds the download; and it does NOT gate legacy passthrough pages
//       (not ours to vouch for) nor clean output.
// Run: dev/test-harness/run.sh tests/security-sanitize.js   (needs NO fixture — builds its own zips)

const R={};

// A page/description is "unsafe" if it still holds a script, an on* handler, or a url attribute whose
// scheme isn't allowed (http/https/mailto, or an inert data:image/* for an <img> src / poster). This
// mirrors the tool's scanDanger — an <object data="https://…/x.pdf"> is NOT unsafe (a real embed).
function unsafe(html){
  const b=new DOMParser().parseFromString('<body>'+(html||'')+'</body>','text/html').body,bad=[];
  if(b.querySelector('script'))bad.push('script');
  let onAttr=false,badUrl=false,dataIframe=false;
  b.querySelectorAll('*').forEach(el=>{const tag=el.tagName.toLowerCase();
    for(const a of el.attributes){const nm=a.name.toLowerCase();
      if(/^on/.test(nm))onAttr=true;
      if(nm==='href'||nm==='src'||nm==='data'||nm==='xlink:href'||nm==='poster'){
        const v=a.value.trim();if(!v||/^blob:/i.test(v))continue;
        if(tag==='iframe'&&/^data:/i.test(v))dataIframe=true;
        const good=((tag==='img'&&nm==='src')||nm==='poster')?okImg(v):okUrl(v);
        if(!good)badUrl=true;}}});
  if(onAttr)bad.push('on*'); if(badUrl)bad.push('bad-url'); if(dataIframe)bad.push('data-iframe');
  return bad;
}

// Every construct v3 proved reaches + renders in Brightspace, plus the two named cleanDoc scheme gaps.
const DANGER=[
  '<a href="javascript:alert(1)">x</a>',
  '<a href="vbscript:msgbox(1)">x</a>',
  '<iframe src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></iframe>',
  '<iframe src="data:application/xhtml+xml,%3Cscript%3E1%3C/script%3E"></iframe>',  // named cleanDoc gap
  '<iframe src="data:text/xml,<x/>"></iframe>',                                     // named cleanDoc gap
  '<p onmouseover="alert(1)" onclick="x()">hi</p>',
  '<img src="y" onerror="alert(1)">',
  '<script>window.__pwn=1</script>',
  '<svg><script>window.__pwn=1</script></svg>',                                     // svg-nested script
  '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>',              // svg-nested js url
  '<object data="javascript:alert(1)"></object>',
  '<embed src="data:text/html,x">'
].join('\n');

// ---- (1) sanitizers strip it (both paths) ----
R.cleanBodyLeaks = unsafe(cleanBody(DANGER));       // restyle path — expect []
R.cleanPasteLeaks = unsafe(EDITOR.clean(DANGER));   // paste/import path (fixed cleanDoc) — expect []

// prove the specific cleanDoc gaps closed: no data:-scheme iframe, no script survives the paste path
{const d=new DOMParser().parseFromString('<body>'+EDITOR.clean(DANGER)+'</body>','text/html');
 R.pasteDataIframes=[...d.querySelectorAll('iframe')].filter(f=>/^data:/i.test((f.getAttribute('src')||'').trim())).length; // 0
 R.pasteScripts=d.querySelectorAll('script').length;}   // 0
// a LEGIT embed must still survive the paste path (embeds are a feature, not a threat)
{const d=new DOMParser().parseFromString('<body>'+EDITOR.clean('<iframe src="https://www.youtube-nocookie.com/embed/abc"></iframe>')+'</body>','text/html');
 R.pasteKeepsGoodIframe=d.querySelectorAll('iframe').length;}   // 1

// ---- helpers: build a minimal package for verify() ----
const FP="font-family:'Inter','Aribau Grotesk'";   // the tool-output fingerprint verify scopes to
const xesc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function manifest(items){
  const its=items.map(it=>`<item identifier="${it.id}"${it.ref?` identifierref="${it.ref}"`:''}${it.desc!==undefined?` description="${xesc(it.desc)}"`:''}><title>${xesc(it.title||'T')}</title></item>`).join('');
  const res=items.filter(it=>it.ref).map(it=>`<resource identifier="${it.ref}" type="webcontent" href="${it.href}"><file href="${it.href}"/></resource>`).join('');
  return `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns="http://www.imsglobal.org/xsd/imscp_v1p1" identifier="TESTM"><organizations><organization identifier="O1"><item identifier="ROOT">${its}</item></organization></organizations><resources>${res}</resources></manifest>`;
}
async function pkg(files){const w=makeZipWriter();for(const[n,t]of Object.entries(files))await w.addText(n,t);return await w.finish();}

// ---- (2) verify() flags a dangerous tool-generated PAGE ----
{const man=manifest([{id:'I1',ref:'R1',href:'1.html',title:'P'}]);
 const page=pageHtml('P','<p>ok</p><script>window.__pwn=1</script><p onclick="x()">h</p><a href="javascript:1">bad</a>');
 const v=await verify(await pkg({'imsmanifest.xml':man,'1.html':page}));
 R.badPage={danger:v.danger,ok:v.ok};}          // expect danger>0, ok false

// ---- verify() flags a dangerous manifest DESCRIPTION (module intro / link) ----
{const man=manifest([{id:'I1',title:'Intro',desc:'<p onmouseover="x()">hi</p><script>1</script>'}]);
 const v=await verify(await pkg({'imsmanifest.xml':man}));
 R.badDesc={danger:v.danger};}                  // expect danger>0 (script / on* still caught)

// ---- a benign non-http link in a passthrough description must NOT block the export ----
// (unedited intros ride along untouched; a tel:/relative link is not the tool's to reject)
{const man=manifest([{id:'I1',title:'Intro',desc:'<p>call <a href="tel:+15551234">us</a> or see <a href="page.html">this</a></p>'}]);
 const v=await verify(await pkg({'imsmanifest.xml':man}));
 R.benignDesc={danger:v.danger};}               // expect danger 0

// ---- but an EXECUTABLE scheme in a description is still caught (defense-in-depth) ----
{const man=manifest([{id:'I1',title:'Intro',desc:'<p><a href="javascript:alert(1)">x</a></p>'}]);
 const v=await verify(await pkg({'imsmanifest.xml':man}));
 R.execDesc={danger:v.danger};}                 // expect danger>0

// ---- (3a) verify() passes CLEAN output (page + benign description, incl. a real embed & link) ----
{const man=manifest([{id:'I1',ref:'R1',href:'1.html',title:'P',desc:'<p>welcome <a href="https://x.org">link</a></p>'}]);
 const page=pageHtml('P','<p>all good</p><object data="https://x.org/a.pdf"></object><iframe src="https://www.youtube.com/embed/z"></iframe>');
 const v=await verify(await pkg({'imsmanifest.xml':man,'1.html':page}));
 R.cleanOutput={danger:v.danger};}              // expect danger 0 (embeds/links are fine)

// ---- (3b) verify() does NOT gate a legacy passthrough page (no fingerprint) that holds a script ----
{const man=manifest([{id:'I1',ref:'R1',href:'9.html',title:'legacy'}]);
 const legacy='<html><body><div>old course page</div><script>legacyThing()</script></body></html>';   // no font stack
 const v=await verify(await pkg({'imsmanifest.xml':man,'9.html':legacy}));
 R.passthroughNotGated={danger:v.danger};}      // expect danger 0

const pass =
  R.cleanBodyLeaks.length===0 && R.cleanPasteLeaks.length===0 &&
  R.pasteDataIframes===0 && R.pasteScripts===0 && R.pasteKeepsGoodIframe===1 &&
  R.badPage.danger>0 && R.badPage.ok===false &&
  R.badDesc.danger>0 &&
  R.benignDesc.danger===0 &&
  R.execDesc.danger>0 &&
  R.cleanOutput.danger===0 &&
  R.passthroughNotGated.danger===0;

R.errs=__errs;
return {pass,...R};
