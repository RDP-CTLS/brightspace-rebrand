#!/usr/bin/env python3
"""Make the copy of the tool that runs as a file inside a Brightspace course.

Same index.html, with the help screenshots built in as data: URLs, because Brightspace
points relative image paths at the course's own files, where they don't exist.
The tool itself switches its wording when it finds it is running on brightspace.com.

    python3 dev/build-course-copy.py [out.html]
"""
import base64, os, re, sys

repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(repo, 'course-template-studio.html')
html = open(os.path.join(repo, 'index.html'), encoding='utf-8').read()

def inline(m):
    data = open(os.path.join(repo, m.group(1)), 'rb').read()
    return 'src="data:image/png;base64,' + base64.b64encode(data).decode() + '"'

html, n = re.subn(r'src="(shots/[\w.-]+\.png)"', inline, html)
open(out, 'w', encoding='utf-8').write(html)
print(f'{n} screenshots built in -> {out}')
