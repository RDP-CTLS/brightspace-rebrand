// Editor blocks are SECTIONS: a heading takes what follows it up to the next heading; boxes stay separate.
// A section exports exactly like the separate blocks it replaced (checked by regression.sh's page_* code).
const $id=i=>document.getElementById(i),w=ms=>new Promise(z=>setTimeout(z,ms));
const paste=async html=>{$id('start-blank').click();await w(60);$id('pg-paste').value=html;$id('pg-paste').dispatchEvent(new Event('input',{bubbles:true}));await w(500);
  return [...document.querySelectorAll('#pg-canvas>.pgb')].map(el=>el.querySelector('.pgb-kind').textContent+': '+el.querySelector('.pgb-sn').textContent);};
const R={};
R.markers=await paste('<h3>Read</h3><p>Chapter 1.</p><p>Chapter 2.</p><h3>Watch</h3><iframe src="https://www.youtube.com/embed/abc" width="560" height="315"></iframe><div style="border-left:4px solid #b00;padding:1rem">Heads up</div><p>After the box.</p>');
R.nested=await paste('<h2>Week 1</h2><p>Intro.</p><h3>Readings</h3><p>A</p><h2>Week 2</h2><p>B</p>');
R.boldHead=await paste('<p><strong>Course materials</strong></p><p>Text one.</p><p><strong>Assessment</strong></p><p>Text two.</p>');
R.noHead=await paste('<p>One.</p><p>Two.</p>');
// duplicate keeps it a Section; the copy exports the same html twice
const before=$id('pg-code').value;
document.querySelector('#pg-canvas>.pgb [data-act="dup"]').click();await w(100);
R.dupLabels=[...document.querySelectorAll('#pg-canvas>.pgb .pgb-kind')].map(x=>x.textContent);
R.dupDoubles=$id('pg-code').value.split('One.').length-1;
R.errs=window.__errs||[];return R;
