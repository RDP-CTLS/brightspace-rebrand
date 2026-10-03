// A page's frame (the opening tags around its blocks) must come back unchanged after a reload,
// and a tampered frame in storage must be dropped rather than reach the copied page code.
localStorage.clear();
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const open=async()=>{const f=document.createElement('iframe');f.style.cssText='width:860px;height:600px';document.body.appendChild(f);
  await new Promise(r=>{f.onload=r;f.src='/index.html';});await wait(200);return f.contentWindow;};
const code=async w=>{w.document.getElementById('pg-next').click();await wait(100);return w.document.getElementById('pg-code').value;};
const out={};
const pages={templated:pageHtml('P',card('Welcome','<p>Hello</p>','forest','book')),
  framed:'<div class="container-fluid" style="border:1px solid #ccc;padding:1rem;background:#fafafa;" id="main" data-x="1"><section role="region" aria-label="x"><h2>T</h2><p>Body</p></section></div>'};
for(const [n,src] of Object.entries(pages)){localStorage.clear();
  const w=await open(),ta=w.document.getElementById('pg-paste');ta.value=src;ta.dispatchEvent(new w.Event('input',{bubbles:true}));await wait(900);
  const saved=JSON.parse(localStorage.getItem('rdp-page-editor')||'{}').wrap,before=await code(w);
  const w2=await open(),after=await code(w2);
  out[n]={hasFrame:!!saved,frameTags:saved?saved.split('<').length-1:0,sameAfterReload:before===after,restored:w2.document.getElementById('r1').textContent};}
out.tampered={};
for(const [n,wrap] of Object.entries({handler:'<div onmouseover="x()">',script:'<div><script>x()<\/script>',img:'<div><img src=x onerror="x()">',
  styleUrl:'<div style="background:url(javascript:x)">',href:'<div href="javascript:x">',gt:'<div title="a>b" onclick="x()">',notString:{a:1},
  mixed:'<div style="padding:1rem;"><section onclick="x()"><main class="ok">'})){
  localStorage.setItem('rdp-page-editor',JSON.stringify({v:1,blocks:[{id:'a1',kind:'raw',html:'<p>ok</p>'}],wrap,hist:[JSON.stringify({blocks:[{id:'a1',kind:'raw',html:'<p>old</p>'}],wrap})]}));
  const w=await open();let c=await code(w);const body=c.slice(c.indexOf('<body'));
  w.document.querySelector('.rs[data-stage="2"]').click();await wait(50);w.document.getElementById('pg-undo').click();await wait(100);const c2=await code(w);
  out.tampered[n]={bad:/onmouseover|onclick|onerror|<script|javascript:|<img/i.test(c+c2),content:c.includes('<p>ok</p>')&&c2.includes('<p>old</p>'),divs:(body.match(/<(div|section|main)\b/g)||[]).length};}
out.errs=__errs;return out;
