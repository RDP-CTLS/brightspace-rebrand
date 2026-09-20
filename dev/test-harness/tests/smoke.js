const f=new File([await (await fetch('/original.zip')).blob()],'course.zip'); await setFile(f);
return {model:!!MODEL, intros:Object.keys(MODEL.intros||{}).length, topics:document.querySelectorAll('#expl-list .ctopic').length, errs:__errs};
