#!/usr/bin/env python3
"""Generate the hosted marker-icon set for module DESCRIPTIONS.

Brightspace strips inline <svg> from module/topic descriptions on import (proven
2026-09-20, HANDOFF-desc-test-v3.md) but KEEPS a real-URL <img>. Pages still use
inline <svg>; descriptions reference these files by absolute https URL instead.

Each file is one Feather-style 24x24 stroke icon with the marker COLOUR baked in
(an <img>-loaded SVG can't inherit colour from the host page). We emit only the
(icon, colour) pairs the tool can actually produce, read straight out of index.html
so the set can never drift from the code.

    python3 dev/gen-icons.py            # writes icons/v1/<icon>-<token>.svg + manifest.txt

Output path is icons/v1/ so a future icon redesign ships as v2 without breaking
courses already importing v1 URLs.
"""
import re, pathlib, sys

REPO = pathlib.Path(__file__).resolve().parent.parent
SRC = (REPO / "index.html").read_text(encoding="utf-8")
OUT = REPO / "icons" / "v1"

def block(name, open_delim, close):
    """Return the text of `const NAME={...}` / `[...]` literal."""
    i = SRC.index(f"const {name}={open_delim}" if open_delim in "{[" else f"const {name}=")
    i = SRC.index(open_delim, i)
    depth, j = 0, i
    pairs = {"{": "}", "[": "]"}
    while j < len(SRC):
        if SRC[j] == open_delim: depth += 1
        elif SRC[j] == pairs[open_delim]:
            depth -= 1
            if depth == 0: break
        j += 1
    return SRC[i:j+1]

def strip_comments(s):
    return re.sub(r"//[^\n]*", "", s)

# --- COLORS: token -> hex ---
COLORS = dict(re.findall(r"(\w+):'(#[0-9a-fA-F]{3,8})'", block("COLORS", "{", "}")))
TOKENS = list(COLORS)

# --- SVG map: icon key -> inner markup ---
SVG = dict(re.findall(r"(\w+):'((?:[^'\\]|\\.)*)'", block("SVG", "{", "}")))

# --- MARKER_SVG / MARKER_COLOR: marker -> icon / token ---
def kv(name):
    body = strip_comments(block(name, "{", "}"))
    return dict((k1 or k2, v) for k1, k2, v in
                re.findall(r"(?:'([^']+)'|([A-Za-z][\w -]*))\s*:\s*'([^']+)'", body))
MARKER_SVG = kv("MARKER_SVG")
MARKER_COLOR = kv("MARKER_COLOR")

# --- TITLE_RULES: [/re/, ['tok','icon']] ---
TITLE = re.findall(r"\['(\w+)','(\w+)'\]", strip_comments(block("TITLE_RULES", "[", "]")))

# --- CALLOUT_ICONS list ---
CALLOUT = re.findall(r"'(\w+)'", block("CALLOUT_ICONS", "[", "]"))

# --- reachable (icon, token) pairs ---
pairs = set()
def add(icon, tok):
    if icon in SVG and tok in COLORS:
        pairs.add((icon, tok))

for m in set(MARKER_SVG) | set(MARKER_COLOR):          # marker subheads + banners
    add(MARKER_SVG.get(m, "book"), MARKER_COLOR.get(m, "slate"))   # cleanBody uses ||'slate'
for tok, icon in TITLE:                                 # card banners by title keyword
    add(icon, tok)
for icon in CALLOUT + ["pin", "clock", "mail", "phone", "link", "book", "circle"]:
    for tok in TOKENS:                                  # callout/contact/link/defaults × every colour
        add(icon, tok)
# fallback safety: any marker/title icon can fall back to slate or forest — cover both
for icon in {MARKER_SVG.get(m, "book") for m in set(MARKER_SVG) | set(MARKER_COLOR)} | {i for _, i in TITLE}:
    add(icon, "slate"); add(icon, "forest")
# white variant of every used icon — for the white glyph inside a solid coloured chip/badge
COLORS = {**COLORS, "white": "#ffffff"}
for icon in {i for i, _ in pairs}:
    pairs.add((icon, "white"))

# --- write files ---
OUT.mkdir(parents=True, exist_ok=True)
for f in OUT.glob("*.svg"): f.unlink()                  # clean regen
TMPL = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" '
        'fill="none" stroke="{hex}" stroke-width="2" stroke-linecap="round" '
        'stroke-linejoin="round">{inner}</svg>\n')
names = []
for icon, tok in sorted(pairs):
    name = f"{icon}-{tok}.svg"
    (OUT / name).write_text(TMPL.format(hex=COLORS[tok], inner=SVG[icon]), encoding="utf-8")
    names.append(name)
(OUT / "manifest.txt").write_text("\n".join(names) + "\n", encoding="utf-8")

print(f"colours={len(COLORS)} icons={len(SVG)} markers={len(set(MARKER_SVG)|set(MARKER_COLOR))} "
      f"title_rules={len(TITLE)} callout={len(CALLOUT)}")
print(f"wrote {len(names)} icon files to {OUT.relative_to(REPO)}/ (+manifest.txt)")
print("sample:", ", ".join(names[:8]))
