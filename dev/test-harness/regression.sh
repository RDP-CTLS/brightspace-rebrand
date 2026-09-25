#!/bin/bash
# Did a change break what the tool already did?  Runs tests/regression-fingerprint.js against TWO builds
# of index.html and compares every output file (crc + size), the run logs and the single-page code.
#   dev/test-harness/regression.sh [baseline-git-ref] [index.html under test]
# Defaults: baseline = 58ce548 (live 2026-09-25: Compressed = each module one page; 2debdee was the
# last build before the course explorer), under test = the repo's
# index.html. Pass a downloaded copy of the live page as the 2nd argument to test what is served.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
REF="${1:-58ce548}"; NEW="${2:-$REPO/index.html}"; TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
git -C "$REPO" show "$REF:index.html" > "$TMP/old.html"
INDEX="$TMP/old.html" "$HERE/run.sh" tests/regression-fingerprint.js 600 > "$TMP/old.json"
INDEX="$NEW"          "$HERE/run.sh" tests/regression-fingerprint.js 600 > "$TMP/new.json"
[ -n "$KEEP" ] && cp "$TMP/old.json" "$TMP/new.json" "$KEEP/"
python3 - "$TMP/old.json" "$TMP/new.json" "$REF" <<'PY'
import json,sys
old,new=(json.load(open(p)) for p in sys.argv[1:3]); bad=0
for k in sorted(set(old)|set(new)):
    a,b=old.get(k),new.get(k)
    if k=='errs':
        print(f"{'ok ' if not b else 'FAIL'} js errors  baseline={a} under-test={b}"); bad+=bool(b); continue
    if isinstance(a,dict) and 'files' in a:
        n=0; diffs=[]
        for dl in sorted(set(a['files'])|set(b['files'])):
            fa,fb=a['files'].get(dl,{}),b['files'].get(dl,{}); n+=len(fb)
            diffs+=[f"{dl}: {f}" for f in sorted(set(fa)|set(fb)) if fa.get(f)!=fb.get(f)]
        logsame=a['log']==b['log']
        ok=not diffs and logsame and list(a['files'])==list(b['files'])
        print(f"{'ok ' if ok else 'FAIL'} {k}: {len(b['files'])} download(s), {n} files compared, {len(diffs)} differ, log {'same' if logsame else 'DIFFERS'} · {[l for l in b['log'] if 'RESULT' in l]}")
        for d in diffs[:10]: print('      '+d)
        if not logsame:
            for x,y in zip(a['log'],b['log']):
                if x!=y: print('      log was: '+x[:150]); print('      log now: '+y[:150])
        bad+=not ok
    else:
        ok=a==b; print(f"{'ok ' if ok else 'FAIL'} {k}: {'identical' if ok else 'DIFFERS'}" + (f" ({b.get('blocks')} blocks, {len(b.get('code',''))} chars of page code)" if isinstance(b,dict) and 'code' in b else '')); bad+=not ok
print(('REGRESSION CHECK: PASS — same output as '+sys.argv[3]) if not bad else f'REGRESSION CHECK: {bad} DIFFERENCE(S) vs '+sys.argv[3]); sys.exit(1 if bad else 0)
PY
