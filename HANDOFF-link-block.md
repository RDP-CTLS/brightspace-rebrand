# Handoff: Add a "Link / Embed" block to the page editor

**Date:** 2026-09-12
**Status:** Built 2026-09-12 — needs Brightspace paste verification
**File:** `index.html` (single-file tool, everything is in here)
**Live at:** https://rdp-ctls.github.io/brightspace-rebrand/

---

## What Aubs wants

Faculty should be able to add links and embeddable content (YouTube videos, Brightspace
Virtual Classroom recordings, external resources, etc.) directly in the page editor,
so they can do the full content design in Course Template Studio rather than adding
links after pasting into Brightspace.

> "something like a youtube video or a video from live classroom or really any of the
> type of stuff brightspace currently can link to, that way they can really do the hard
> work of the content design here"

---

## How the block system works (architecture)

### The pattern for every block kind

Each generated block has four parts — add all four to register a new kind:

1. **`newModel(kind)`** (L1515–1516) — returns the default model object for the kind
2. **`GEN[kind]`** (L1513) — a generator function that turns a model → inline-styled HTML
3. **`CHIP_LABEL[kind]` + `CHIP_ICON[kind]`** (L1725–1726) — label and icon for the
   "Add a block" palette chip
4. **`renderForm(f, b)`** (L1944–1972) — the settings form shown when the block is selected

Plus one line in the `chips()` array (L1727) so the button appears in the palette.

### Key functions to know

| Function | Line | Does |
|----------|------|------|
| `newModel(kind)` | 1515 | Returns fresh model for a kind |
| `regen(b)` | 1517 | Rebuilds `b.html` from `b.model` via `GEN[b.kind]` |
| `addBlock(kind, at)` | 1975 | Creates block, inserts, renders canvas, sets focus |
| `renderForm(f, b)` | 1944 | Builds the settings panel for a selected block |
| `renderCanvas()` | 1732 | Full re-render of all blocks in the editor |
| `pageOut()` | 1671 | Assembles all blocks into export HTML |
| `blockPart(b)` | 1667 | Per-block output: strips filler, adds landing pads |
| `wrapDoc(inner)` | 1648 | Wraps export in Brightspace's stylesheet shell |
| `clean(html)` | 1540 | Sanitises any HTML via `cleanDoc()` |
| `cleanDoc(root)` | 1531 | Strips scripts, bad URLs, event handlers |
| `okUrl(v)` | 771 | Validates URLs (http/https/mailto only) |
| `label(b)` | 1625 | Returns `[kindLabel, snippet]` for the block card bar |
| `KIND_LABEL` | 1622 | Maps kind → display name in the canvas bar |
| `stripFiller()` | 1660 | Removes grey placeholder hints from export |

### Existing block kinds

| Kind | Model fields | Generator | Notes |
|------|-------------|-----------|-------|
| `contacts` | `heading, theme, people[{name,role,office,hours,email,phone}]` | `genContacts()` L1493 | Multi-person grid |
| `callout` | `heading, body, theme, icon` | `genCallout()` L1499 | Coloured alert box |
| `section` | `title, body` | `genSection()` L1506 | Full RDP card with icon band |
| `raw` | `null` (no model) | — | Pasted HTML; not regenerable |

### Constants/registries to update

```
L1513  const GEN = {contacts:genContacts, callout:genCallout, section:genSection};
L1622  const KIND_LABEL = {contacts:'Contact cards', callout:'Callout', section:'Section'};
L1725  const CHIP_LABEL = {contacts:'People / contacts', callout:'Callout', section:'Section'};
L1726  const CHIP_ICON  = {contacts:'users', callout:'alert', section:'book'};
L1727  chips() array — currently hard-coded to ['contacts','callout','section']
```

---

## Existing media / link handling

The tool already handles iframes, video, embeds, and links — but only when they arrive
via **paste** (from an existing Brightspace page). There's no way to **create** them from
scratch. Key code:

- **`cleanBody()` (L778)** — preserves iframes, videos, embeds; upgrades http→https on
  iframe src; removes iframes with non-http URLs; adds `loading="lazy"` to iframes
- **`okUrl()` (L771)** — allows http/https/mailto only
- **MEDIA_STYLE (L692)** — default inline styles for iframe/video/audio elements:
  ```
  iframe: 'max-width:100%;border:0;border-radius:.6rem;margin:.6rem 0;'
  video:  'max-width:100%;border-radius:.6rem;margin:.6rem 0;'
  audio:  'width:100%;max-width:480px;margin:.6rem 0;'
  ```
- **ATTR allowlists (L676–680)** — what attributes survive on each element type:
  - `iframe`: src, width, height, allow, allowfullscreen, frameborder, title, loading
  - `video`: src, controls, poster, width, height, preload, loop, muted, playsinline
  - `a`: href, target, rel, title, aria-label
- **`label()` (L1625–1637)** — raw blocks auto-detect their kind label from root tag
  (e.g. a `<p>` with only an `<img>` → "Image"; an iframe block would currently show
  as "Block")

---

## Design direction

### Suggested model

```javascript
// kind: 'link'
// model:
{
  url: '',           // the URL the user pastes
  type: 'auto',      // auto | video | link | page
  title: '',         // display title (optional for videos)
  description: '',   // optional description line
  theme: 'forest',   // colour token for the styled card
}
```

### What the generator should produce

**For embeddable URLs** (YouTube, Vimeo, Brightspace Virtual Classroom, etc.):
a responsive iframe embed — the tool already has the inline styles for this in
MEDIA_STYLE (L692). Parse the URL to detect the provider and build the right embed
src (e.g. `youtube.com/watch?v=X` → `youtube-nocookie.com/embed/X`).

**For plain links** (a PDF, a Brightspace content page, any non-embeddable URL):
a styled card/button with the title, description, and a link icon — similar to how
Brightspace's own "Quicklink" or "URL Activity" renders. Keep inline styles so it
survives the Brightspace paste.

### URL patterns to recognise

| Provider | Watch URL pattern | Embed URL |
|----------|------------------|-----------|
| YouTube | `youtube.com/watch?v=ID` or `youtu.be/ID` | `youtube-nocookie.com/embed/ID` |
| Vimeo | `vimeo.com/ID` | `player.vimeo.com/video/ID` |
| Brightspace Virtual Classroom | varies by institution | May need iframe or plain link |
| Brightspace content links | `*.brightspace.com/d2l/...` | Plain link card |
| Microsoft Stream / OneDrive | `*.sharepoint.com/...` | Embed iframe |
| H5P | `*.h5p.com/...` | Embed iframe |
| Any other https URL | — | Plain link card |

### Form UI

The form should have:
- **URL input** (required) — paste a URL; auto-detect type on input
- **Title** (optional) — auto-populated from URL if possible, editable
- **Description** (optional) — one line of context
- **Colour swatches** — reuse existing `swatches()` helper (L1942) for the card border
- **Preview** — show a preview of the embed/link card as you fill in the form

### Things to watch

1. **Security**: all URLs must pass `okUrl()` (http/https only). YouTube embeds should
   use `youtube-nocookie.com` for privacy. Add `allow="accelerometer; autoplay;
   clipboard-write; encrypted-media; gyroscope; picture-in-picture"` and
   `allowfullscreen` for video iframes.

2. **Responsive**: video iframes need the aspect-ratio wrapper pattern
   (`aspect-ratio: 16/9; width: 100%;`) so they scale on mobile. The tool's existing
   `MEDIA_STYLE.iframe` does `max-width:100%` but doesn't handle aspect ratio.

3. **Export compatibility**: the output HTML must paste cleanly into Brightspace's
   Source Code editor. All styles inline, no classes/scripts. Test in Brightspace
   after implementation.

4. **`label()` function** (L1625): add `'link'` to `KIND_LABEL` so the block bar
   shows "Link" or "Video" (could detect from `model.type` or URL).

5. **`stripFiller()`** (L1660): if you add placeholder/hint text to the link block
   generator, register it in `FILLER_TEXT` / the `HINT_*` constants so it strips on
   export (see L1482–1490 for pattern).

6. **Chip icon**: Feather has `link` (chain links), `external-link`, `play-circle`
   (video), and `globe`. The SVG icon set is at L557–670 (the `SVG` object). Add
   any new icons there. A `link` or `play-circle` icon would be a good chip icon.

7. **`RAW_LABEL`**: check what tag your generated HTML uses at the root. If it's a
   `<div>`, the raw-block label logic (L1628) will show "Block" — you may want to
   add detection in `label()` so a pasted-back link block shows "Video" or "Link"
   instead.

---

## Files to change

Everything is in **`index.html`** — it's a single-file tool. The changes touch:

1. **Generator function** — new `genLink(model)` function (near L1512)
2. **Generator registry** — add to `GEN` object (L1513)
3. **Model factory** — add `link` case to `newModel()` (L1515)
4. **Form builder** — add `link` branch to `renderForm()` (L1944)
5. **Chip palette** — add to `CHIP_LABEL`, `CHIP_ICON`, `chips()` array (L1725–1728)
6. **Kind label** — add to `KIND_LABEL` (L1622)
7. **SVG icon** — add link/play-circle icon to `SVG` object if not already there (L557+)
8. **Filler hints** — if using placeholder text, register in the filler system (L1482–1490)

No other files exist — the tool is entirely self-contained.

---

## How to test

1. **New page path**: Click "Start a new page" → add a Link block → paste a YouTube URL
   → verify the embed preview renders → click "Copy page" → paste into Brightspace
   Source Code → verify the video plays.
2. **Various URLs**: test YouTube, Vimeo, a plain HTTPS link, and a Brightspace content
   link. Verify each renders appropriately (embed vs. link card).
3. **Mobile**: resize to 400px wide and verify the video embed scales down.
4. **Round-trip**: paste a page containing a YouTube iframe back into the tool → it should
   import as a raw block showing "Video" or similar → re-export should preserve it.
5. **Security**: try `javascript:alert(1)` as a URL — should be rejected by `okUrl()`.
6. **localStorage**: add a link block, reload — it should restore from autosave.

---

## Related recent work

- **UI copy pass** (commit `129e4c7`, 2026-09-12): stage labels, intake doors, and note
  copy were updated for friendlier wording; emojis replaced with Feather SVG icons.
  The tool's voice is casual-but-clear ("Build it from blocks", "Make it yours").
- **Section block fixes** (commit range through `515ce83`): title recovery, paste
  sanitisation, strip-filler system. The filler pattern is the one to follow.
- **Activity vocabulary** (commit `cf3a083`): ~120 activity words with colour-coded
  categories and Feather icons. The `SVG` object and `iconSvg()` helper are the icon
  system to use.

---

## Quick start for the implementing session

```
cd ~/Documents/Projects/Brightspace/brightspace-rebrand
# Read the block system: grep for genCallout to see the simplest generator pattern
# Read renderForm to see how the callout form works (simplest form)
# The callout block is the closest analogy — a model with a few fields,
# a generator that outputs inline-styled HTML, and a form with inputs.
```

The callout block (L1499–1504 generator, L1952–1955 form) is the best template to
copy from — it's the simplest generated block with a heading, body, theme, and icon.
