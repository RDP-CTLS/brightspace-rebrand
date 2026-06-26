# RDP Course Rebrand

A small, **offline** web tool that gives a Brightspace (D2L) course the RDP look —
without changing any of your wording, links, files, or images. Only the design changes.

### ▶ Use it here: https://ajellebeans.github.io/brightspace-rebrand/

## What it does
- Restyles every page to the RDP design (Inter, eggplant/forest palette, clean cards).
- Turns old Blackboard marker **buttons** (READ / WATCH / BRING…) into plain text headings
  — nothing looks clickable unless it is.
- Optionally **combines** thin pages within a module so there's less clicking.
- Keeps your content, links, tables, PDFs and **videos** exactly as they were.
- Re-sorts numbered items (Lecture 1, 2, 3…) that the export listed out of order.

## How it's safe / private
Everything runs **in your own browser**. Your course file is never uploaded anywhere —
there is no server. You can even save the page and run it with no internet.

## How to use
1. In Brightspace: **Course Admin → Import / Export / Copy Components → Export as Common Cartridge**.
2. Download the file it makes — its name ends in **`.imscc`** (it is *not* a `.zip` you make yourself).
3. Open the link above, drag the `.imscc` onto the box, and download the rebranded file.
4. Import that file back into a **sandbox** course first to check it, then into the real course.

## Notes for maintainers
- `index.html` is the whole tool (no build step, no dependencies, no CDN). It is a copy of
  `Course-Rebranding/rebrand-tool/web/rebrand.html` in the working vault — keep the two in sync.
- The Python CLI version (`preflight.py` / `rebrand.py`) lives alongside that source and shares
  the same engine logic.
- `test.imscc` is a tiny synthetic cartridge for a quick self-test (expect two `RESULT: PASS`).
- `.nojekyll` tells GitHub Pages to serve files as-is.
