#!/bin/bash
# Headless-Chrome test runner for Course Template Studio (no browser extension needed).
#   dev/test-harness/run.sh tests/smoke.js [timeoutSeconds]
# Fixtures are real course exports and are NOT in the repo. Point at them with env vars:
#   ORIGINAL  an untouched Brightspace Package   (served as /original.zip)
#   SANDBOX       an already-templated Package        (served as /sandbox.zip)
#   SAVE_DIR      where a test may keep a file it built: fetch('/save/<name>',{method:'POST',body:blob})
#   INDEX         the index.html under test (default: the repo's). Point it at a downloaded copy of
#                 the live site, or at `git show <old>:index.html`, to test that build instead.
# Defaults are placeholder names in ~/Downloads; point the env vars at your own exports. Each test file is the BODY of an async
# function evaluated inside the tool's own page (so it sees setFile, MODEL, EDITOR, buildRestyle…)
# and must `return` a JSON-able result. window.confirm is stubbed; page errors land in __errs.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
T="${1:-tests/smoke.js}"; MAX="${2:-150}"; PORT="${PORT:-8765}"
ORIGINAL="${ORIGINAL:-$HOME/Downloads/course-export.zip}"
SANDBOX="${SANDBOX:-$HOME/Downloads/sandbox-export.zip}"
INDEX="${INDEX:-$REPO/index.html}"
WORK="$(mktemp -d)"; trap 'kill $SRV $CHR 2>/dev/null; pkill -f "$WORK/profile" 2>/dev/null; rm -rf "$WORK"' EXIT
mkdir "$WORK/serve"
ln -s "$INDEX" "$WORK/serve/index.html"; ln -s "$REPO/test.imscc" "$WORK/serve/test.imscc"; ln -s "$HERE/harness.html" "$WORK/serve/harness.html"
ln -s "$HERE/$T" "$WORK/serve/test.js"
[ -f "$ORIGINAL" ] && ln -s "$ORIGINAL" "$WORK/serve/original.zip"
[ -f "$SANDBOX" ] && ln -s "$SANDBOX" "$WORK/serve/sandbox.zip"
python3 "$HERE/server.py" "$WORK/serve" "$WORK/result.json" "$PORT" & SRV=$!; disown
sleep 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-first-run \
  --user-data-dir="$WORK/profile" "http://127.0.0.1:$PORT/harness.html?t=test.js" >/dev/null 2>&1 & CHR=$!; disown
for i in $(seq 1 "$MAX"); do [ -s "$WORK/result.json" ] && break; sleep 1; done
[ -s "$WORK/result.json" ] && cat "$WORK/result.json" || { echo "NO RESULT after ${MAX}s"; exit 1; }
