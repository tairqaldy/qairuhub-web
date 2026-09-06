---
title: Photograph the room, and fill the empty plates
status: draft
area: design
effort: M
depends_on: []
---

# 019 — Photograph the room, and fill the empty plates

| | |
|---|---|
| **Status** | draft |
| **Area** | design |
| **Effort** | M |
| **Depends on** | — |

## Problem

`docs/DESIGN.md` §7.2 says every page carries exactly one PLATE, that it is the
site's only source of colour, and (§3.4) that it is not optional. There are ten
`<Plate />` instances in `src/pages/` and **every one of them is written
`<Plate />`, with no props at all.** Every route renders `.plate__pending`, a
hatched 16:9 frame at the exact final footprint saying "awaiting photography".

That frame is the right call and should stay. But the largest element on ten
routes is a stripe pattern, and the parent, [QAIRU](https://qairu.edu.kz/), runs
a near-monochrome layout in which the robotics lab, the Nur Alem sphere at night
and the rector's portrait supply all the colour. This is meant to be that press
with the polarity flipped; it is that press with the photographs missing.

**And the checks that would catch a bad photograph do not exist yet.** §8.4
promises three of them; `tests/e2e/design-law.spec.ts` implements none:

- `gives every image alternative text` asserts only `hasAttribute('alt')` — an
  `alt=""` passes.
- Nothing asserts a sibling `<figcaption>`, so caption and credit are unenforced.
- `the plate appears exactly once` asserts `toBeLessThanOrEqual(1)`, so a page
  with **zero** plates passes today. That is why nobody noticed.

Nor is the schema ready. `cover: image()` and `coverAlt` are on four
collections (`events`, `programs`, `projects`, `posts`), **no entry in
`src/content/` sets `cover`**, there is no caption or credit field anywhere, and
there is no `src/assets/` directory at all.

## Prior art

**[Magnum Contact Sheets](https://www.magnumphotos.com/theory-and-practice/magnum-contact-sheets/)**
— 67 photographers' unedited rolls printed beside the frame that ran, put there
to ask whether the famous image "was a set-up, or a serendipitous encounter".
**Steal:** work a situation until it resolves, then edit hard — 300 frames to 10
keepers, reviewed twice a day apart. **Leave:** the mystique of the decisive
moment; the contact sheets are the argument against it.

**[NPPA Code of Ethics](https://nppa.org/code-ethics)** — do not stage, do not
intentionally contribute to or alter the event you are covering, treat subjects
with respect. **Steal:** the no-staging standard; it is the exact opposite of
"everyone look over here". **Leave:** press neutrality — we photograph our own
room, and the honest version of that is naming the photographer in the caption.

**[The Photo Bill of Rights](https://www.photobillofrights.com/)** — Authority
Collective, Color Positive, Diversify Photo, Juntos, Natives Photograph, NPPA,
The Everyday Projects and Women Photograph, on pay, credit and abuse in the
photo industry. It is a labour document, **not** a consent framework — read it
for what it says, not for what we wish it said. **Steal:** credit is not
optional, and a named human is attached to every frame. **Leave:** everything
about rates and commissions; nobody here is being paid.

**[Hack Club's hackathon-photos](https://github.com/hackclub/hackathon-photos)**
— sixteen event albums in one table, each row carrying a licence (mostly CC BY
4.0, some CC0) and a contact GitHub handle. **Steal:** one photograph, one
licence, one named human. **Leave:** the album dump; our constraint is scarcity,
not volume.

**[Recurse Center](https://www.recurse.com/)** — eight homepage photographs, all
candid, all people at tables and screens; no posed groups, no whiteboard
pointing. The closest thing to the register we want. **Steal:** the subject
matter and the refusal to smile at the lens. **Leave:** the implementation — the
eight `<img>` tags carry no alt text. Ours cannot ship without it.

## Proposal

Write `docs/PHOTOGRAPHY.md` — one page a student with a phone can follow — then
build only what its output cannot land without.

**A fluorescent lab at night.** Mains here is 50 Hz and a tube peaks twice per
cycle, so the light pulses at 100 Hz and any exposure that is not a whole
multiple of 10 ms integrates a different amount of light along the sensor's
rolling readout — visible as horizontal bands. So **1/100 s, or 1/50 s for the
extra stop; never 1/60, never 1/125** — which needs a manual app, since auto
picks 1/60. That is arithmetic anyone can check against a test frame, which is
the only reason it is in a brief a volunteer maintains. ISO ≤1600. **Set white
balance once at ~4000 K, tint off green, and leave it**: a set shot on auto WB
cannot be graded as one set. Main camera only, RAW if offered — the ultrawide is
slow and distorts faces under 1 m. **Night mode and HDR optimiser off**: they
stack frames, so hands smear into the glossy look this design is against. No
flash, ever. Brace on the table, burst of five, get close — 0.6–1.5 m for hands,
1.5–3 m for a room.

**Framing.** Shoot native 4:3 and crop to 16:9 after. At 1440px the homepage
plate renders 1288 × 724 CSS px full-bleed right, so fill the width — three along
a bench, a table end-on, a person at each end of a whiteboard — never a head in
the middle with empty desk either side. Leave ~12% headroom, and hold desk edges
level to 0.5°: this page is nothing but exact horizontal hairlines, so a 2° tilt
reads as a bug, not a style.

**The grade — one preset, four numbers**, committed as
`docs/assets/qairuhub-plate.xmp`. (1) **Clamp the tonal range to [24, 245] in
8-bit sRGB** — above `--paper` in dark (`#0b0a08` = 11), below `--paper` in light
(`#fbfaf8` = 251), so one range serves both themes and no crushed shadow or blown
tube punches a hole in the page. (2) **Warm ~200 K after neutralising**: the
ground is hue 85, and a cold frame on it looks pasted in. (3) **Green saturation
−15, hue +8 toward yellow** — the fluorescent cast, and the only channel touched;
§2 rejected draining the rest. (4) **No vignette, grain, LUT, or clarity above
+10**: a vignette is a decorative gradient (§16) that fights the 1px border.

**The grade lives in the file, never in CSS.** No `filter` on `.plate img` — not
`saturate`, not `sepia`, not `brightness`, not at 2%. §7.2 bans filters and
overlays outright, and "just warming the set up in one place" is the single most
plausible way this proposal turns into the thing §16 exists to stop. If a
photograph does not sit on the page, re-grade the photograph or do not publish
it.

**Files.** `node scripts/ingest-plate.mjs <source> <slug>` applies EXIF rotation,
caps the long edge at 2560px, converts to sRGB, strips all metadata including
GPS, and writes mozjpeg q82 to `src/assets/plates/<slug>.jpg` (0.8–1.2 MB).
Slugs read `2026-09-19-ai-friday-c208-hands`; RAWs stay out of the repository.
**`sharp` is not currently installable from the project root** — there is no
`node_modules/sharp` under pnpm's strict layout, only Astro's own nested copy, so
`import 'sharp'` in a root script throws `ERR_MODULE_NOT_FOUND`. It needs one
line: `pnpm add -D sharp`. Dev-only, no runtime cost, no effect on the JS budget.

**Consent.** [Art. 145 of the Civil Code](https://kodeksy-kz.com/ka/grazhdanskij_kodeks/145.htm)
— *«Никто не имеет право использовать изображение какого-либо лица без его
согласия»* — makes the consent of an identifiable person a legal precondition of
publishing their image. That is the floor, not the practice. Announce it at the
start in the room's language and card the door — *«Бүгін фотоға түсіреміз»*, with
the photographer's name. Anyone with the opt-out sticker on their laptop lid is
never framed identifiably: default is no, no reason asked. Where a person is the
subject rather than incidental, show them the frame and ask before publishing.
Under-18s need a guardian's written consent. Withdrawal takes one message, inside
72 hours.

**The consent record is private and stays out of the repository.** A public
`plates/*.md` file listing which named people are in which photograph and how
each of them consented is a worse disclosure than the photograph — it is a
machine-readable roster of who was in room C-208 on a Friday night. One private
sheet the officers hold, keyed by plate slug. No D1 table in this proposal.

**Shot list, first session** (AI Friday, 19:00–22:00; no camera for the first 30
minutes — sit down and work first): the room from the doorway; hands on a
keyboard, screen soft behind; two at one screen; the whiteboard mid-argument,
from the side, read first for anything private; an over-the-shoulder terminal,
legible enough to be true, not enough to leak a token; the table end-on, six
laptops receding; the tea corner at 21:30; one person still working at 22:00; a
portrait at 1.2 m, ambient only, looking at their work. Target 200–400 frames,
10 keepers, and exactly one published to start (§Scope).

**What would make us look like every other club.** Stock imagery. Everyone
smiling at the lens. The banner group photo, the thumbs up, the jump. Staged
laptops — a clean desk with one open lid and nobody at it, a lid angled to show
the logo, a chat window opened for the camera. A whiteboard with the club's name
on it for the shot. Pointing at a monitor. Handshakes and certificates. A podium
shot like a press call. Flash. Night-mode plastic skin. A demo screenshot in
browser chrome (§7.2). Any frame where someone's Telegram is readable over a
shoulder.

## Scope

**Phase 0 — one photograph, one route, no new code.** `Plate.astro` already
accepts `src`, `alt`, `caption` and `credit`; `src/assets/plates/` is one
`mkdir`. Shoot one session, grade one frame by hand, pass it to the `<Plate />`
on `/`. That is the whole first deliverable, and it is a gate: **if that frame is
not visibly better than the honest placeholder beside it, stop here.** Nothing
below is worth building for photographs we cannot make. Everything else in this
proposal is generalisation, and generalising nothing is how a student-run site
acquires a pipeline it never feeds.

**Phase 1 — make it repeatable.** `docs/PHOTOGRAPHY.md`, the `.xmp` preset,
`pnpm add -D sharp` and `scripts/ingest-plate.mjs`, the `plates` collection, a
`slug` prop on `Plate.astro`, and the three corrections the built component needs
before §7.2 is actually true (§Design). Two more plates, on `/events`, `/about`.

**Phase 2 — enforce it.** The five assertions below, then a plate for every
remaining route and a second session so no plate is used twice.

**Phase 3 — spend it twice.** Portraits for the `/people` strip (56×72, same
grade), and the share card: [020](./020-og-images.md) has no image to put on an
`og:image` until this lands, and Telegram and WhatsApp are where these links
actually get opened.

## Data and schema

**Phase 0 needs none of this.** Props already exist.

**Phase 1.** New collection `plates` (`src/content/plates/*.md`) spreading
`...base`, so it inherits `lang`, `translationKey`, `draft` and `placeholder` — a
Kazakh page cannot carry a Russian caption (§13). Fields, and only these:
`image: image()`, `alt` (40–220 chars, saying what is happening, not "students at
a hackathon"), `caption`, `credit`, `shot: z.coerce.date()`, `room`,
`focus: z.string().default('50% 50%')` (the `object-position` used when the 4:3
master is cropped to 16:9), `facesVisible: z.boolean()`.

**Deliberately not in the schema:** `people` and `consent`. Both would publish
the consent record as static HTML (see §Proposal). And **no `coverCaption` /
`coverCredit` `superRefine`** — zero entries in `src/content/` set `cover` today,
so it would guard nothing and fire first on whoever adds one. It belongs in the
proposal that gives `cover` a job. **No D1 migration.**

**Phase 2 — five assertions in `design-law.spec.ts`.** Three of them are §8.4
promises the file does not keep, and they are worth adding whether or not a
photograph ever lands:

1. `.plate` count is **exactly** 1, not `≤ 1`.
2. Every `<img>` has a **non-empty** `alt`, not merely the attribute.
3. Every `.plate` containing an `<img>` has a sibling `<figcaption>` with text.
4. No `.plate img` resolved `src` appears on two routes.
5. ≥50% of rendered plates have `facesVisible` — and the LCP element on `/` and
   on every index route is still text, read from a `PerformanceObserver` entry
   rather than assumed (§Design).

## Design

THE PLATE (§7.2): full-bleed right at 16:9 on index routes, cols 2–9 at 4:3 on
detail routes, 1px `--rule-strong`, radius 0, no shadow, full colour at rest,
nothing on hover (§9.4). Caption in `m-label` beneath:
`СУРЕТ 01 — AI ЖҰМА, C-208, QAIRU · 19.09.2026 · ФОТО: <аты-жөні>`.

**Three things in the built component contradict that, and this proposal owns
all three.** They are not "unchanged":

1. **The 4:3 detail variant does not exist.** `Plate.astro` hardcodes
   `class="plate bleed-right plate--full"` and `components.css` hardcodes
   `.plate img { aspect-ratio: 16 / 9 }`. Three of the ten `<Plate />` instances
   sit on detail routes (`events/[slug]`, `programs/[slug]`,
   `projects/[slug]`) and all three render the index composition. Add a
   `variant: 'index' | 'detail'` prop; the detail case drops `bleed-right`, takes
   cols 2–9, and sets 4:3.
2. **`.plate__credit` is `--ink-4` at 12px.** §14 permits `--ink-4` at ≥24px
   only, and `components.css:735` already applies exactly that rule elsewhere
   with the comment *"--ink-4 is reserved for >=24px. This is 12px, so it uses
   --ink-3."* The credit becomes a required field in this proposal, so it stops
   being a small inconsistency and starts being a contrast failure on every page.
   `--ink-3`.
3. **`sizes="100vw"` is a lie above 768px.** The plate never spans the viewport
   there — `bleed-right` reaches the right edge only, and at the 1440px shell the
   homepage plate is about 1288 CSS px. `widths={[640, 1024, 1600]}` also tops
   out below the 2576 device px a DPR-2 phone or a 150%-scaled Windows laptop
   asks for. So the browser over-fetches on desktop and under-serves on the two
   machines this audience actually owns. Fix `sizes` to the real measure and add
   a 2560 width before the first photograph ships, not after.

**Cobalt: none.** This adds no token, touches neither `global.css` nor
`components.css` selectors, and names no selector — `check-cobalt.mjs` scans
source for `var(--cobalt`, and a photograph's colour is image data it neither
sees nor should. The `--ink-4` → `--ink-3` change is a neutral swap in
`Plate.astro`'s scoped block and passes the lint untouched. The warmth arrives as
pixels, which is precisely why §8 can keep the accent scarce.

**LCP, asserted rather than assumed.** §7.2 puts the plate below the fold on the
homepage, and §16 requires it never be the LCP element. But the INDEX archetype
(§12.1) places the PLATE directly after a one-sentence lead, where at 1440px it
can sit above the fold on nine routes — at which point a 250 KB image becomes
LCP and the 1.8s budget is decided by a JPEG. `loading="lazy"` is not a
guarantee of this. Assertion 5 above measures it.

`.plate__pending` stays: it is what a route shows before its plate exists and
what it falls back to when one is withdrawn. One caveat to check in Phase 0 —
its hatch is a `repeating-linear-gradient` at a 15px period, structurally the
construction §2 killed for rendering moiré at the 1.25× and 1.5× DPRs standard
on Windows laptops. Look at it at 125% and 150% on a real one. If it moirés,
replace it with a single hairline and the note, not with a second pattern.

## Risks and trade-offs

**The strongest case for not doing this at all.** The placeholder is currently
telling the truth, and truth is the site's whole register. A phone photograph of
six students at laptops under fluorescent tubes *is* the banned frame — "students
at a hackathon" — only made in-house, which does not redeem it. §7.2's "exactly
one PLATE, mandatory" multiplied by ten routes is not a quality bar; it is
standing pressure to publish weak frames, and §16's photography block cannot
catch a bad photograph, only a missing caption. So the realistic failure is not
an empty frame. It is ten mediocre ones, permanently in git, of named students
who are still in the room, on a site whose credibility rests on not inventing
things. Against that: §3.4 is explicit that without the PLATE this becomes the
fourth drafting-sheet site of the day, and §7.4 leans on the plate to carry the
visual mass while the registers are thin. Both are true at once. Phase 0 is the
resolution and it is a real gate: one frame, judged beside the placeholder by
someone willing to say no.

**Git history is permanent.** Deleting a withdrawn photograph removes it from the
site at once; removing it from history needs a force-push. Ten 2560px masters is
roughly 10 MB in the repository forever, and every clone carries every withdrawn
frame. That is the honest cost of committing images rather than paying for object
storage — which the near-zero budget says we do not do.

**Consent in a small community is soft** — someone says yes because a friend
asked. Mitigations: default no, the opt-out sticker, an ask made by someone who
is not an officer, withdrawal with no reason required. **A camera changes the
room:** hence the 30-minute rule and no flash; if sessions stop feeling normal,
we stop. **Single point of failure:** two photographers per session. **Grade
drift:** the shared `.xmp` and four checkable numbers.

## Success

One published plate that a member of the room would send to a friend — that is
the Phase 0 test and there is no metric for it. After that, all asserted rather
than reviewed: ≥50% of plates show faces, no plate appears on two routes, every
plate has a non-empty `alt` and a figcaption naming a real session, a real room
and a real photographer, largest variant ≤250 KB, and the LCP element still text.

Note what is *not* a success metric: **zero routes rendering `.plate__pending`.**
That number rewards filling frames, which is this proposal's failure mode. A
route with no photograph worth publishing should keep the honest frame.

**What would tell us to remove it:** we cannot produce ten keepers a semester, or
Phase 0 produces a frame nobody defends. Then amend §7.2 to one plate per
*section* rather than per page — do not fill the frames with something weaker.

## Effort

**M**, and unevenly distributed. Phase 0 is one session and one file — no code.
Phase 1 (brief, preset, `sharp`, ingest script, schema, the `variant` prop, the
`sizes`/`--ink-4` fixes) is about a day; Phase 2's assertions half of one. The
photography is recurring — roughly three hours per session including the edit —
and that, not the code, is the actual proposal. If nobody will own it every
Friday, none of the rest should be built.
