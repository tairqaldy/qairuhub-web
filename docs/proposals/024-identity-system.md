---
title: Fly our own flag, then cut one file for print
status: draft
area: design
effort: M
depends_on: []
---

# 024 — Fly our own flag, then cut one file for print

| | |
|---|---|
| **Status** | draft |
| **Area** | design |
| **Effort** | M — but Phase 1 is S and stands alone |
| **Depends on** | Nothing. 020 (share cards) and 023 (print an A3) both need the wordmark file this creates; 017 needs it for a sponsor's deck. |

## Problem

`public/favicon.ico` is not an ICO. Its first eight bytes are `89 50 4e 47 0d 0a 1a 0a` — a 655-byte PNG with the wrong extension, from the Astro template. Verified live on 2026-09-06:

```
$ curl -sI https://qairuhub.com/favicon.ico
Content-Type: image/vnd.microsoft.icon
Cache-Control: public, max-age=0, must-revalidate
```

Cloudflare labels it by extension, under the site-wide `X-Content-Type-Options: nosniff` that tells a browser not to rescue a mislabelled file. `public/favicon.svg` is Astro's own logo, `prefers-color-scheme` rule and all — and `Base.astro` prefers it, so that is the mark on the tab. A site with a 1,088-line design law flies the framework's flag.

`/apple-touch-icon.png` returns 404. So does `/manifest.webmanifest`. Adding qairuhub.com to an iPhone home screen produces a screenshot of the page. There is no `theme-color`.

Off the browser there is nothing at all. `.wordmark` (`components.css:582`) is `font-family: var(--font-display)` at weight 700 with an `<em>` at 500 and `opacity: 0.62` — an identity that exists only where a browser has already downloaded Onest under Astro's hashed family name. An A3 for the next AI Friday, a line in a sponsor's deck (017), a credit stamp on a documentary still (019/023): each needs a file, and there is none. `Base.astro` already emits `og:image` and switches to `summary_large_image` when given one — 020 is one asset away from working, and that asset is a wordmark.

And the two specifications of the wordmark disagree three ways. §10.1 says `QAIRU` in display **600** · a 1px `--rule-2` hairline · `HUB` in **mono 500 uppercase**. The code ships `Qairu` + `Hub` (`src/lib/site.ts`), both display, **700 / 500**, no hairline, no mono, no uppercase. An outline file freezes whichever is drawn, so this has to be settled first.

Then the question nobody has answered. Under Kazakhstan's 2021 Latin alphabet, Cyrillic **Қ** maps to **Q** and **К** to **K** — which is why the parent is *Qazaq* AI Research University, Қазақ. Back-transliterated honestly, Qairu is **Қайру**. Russian has no Қ, so a Russian page is pushed toward **Кайру**: a different letter for a different sound. `LOCALES` ships `en` alone while `PLANNED_LOCALES` already promises `ҚАЗ` and `РУС` in the masthead. Decide it now, or 025 decides it three ways.

## Prior art

**[Evil Martians — How to Favicon](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)** (2021 slug, continuously revised). Six assets and a manifest behind four link tags — the list reproduced in the table below. The ICO carries `sizes="32x32"` *"in order to fix the Chrome bug where it chooses an ICO file over an SVG"*, and an Apple touch icon *"will look better if you place `20px` padding around the icon and add some background color."* **Steal:** the file list and both specifics. **Leave:** nothing — but note it never mentions `theme-color`, so that comes from MDN below.

**[web.dev — maskable icons](https://web.dev/articles/maskable-icon)**. *"The important parts of your icon … must be within a circular area in the center of the icon with a radius equal to 40% of the icon width"* — 409px on a 512px icon. *"By default, icons have a purpose of `"any"`. In Android, these icons are resized on a white background."* **Steal:** the circle and the `purpose` key. **Leave:** the PWA framing; §15 funds no service worker.

**[Linear](https://linear.app/brand)** and **[Vercel](https://vercel.com/design/brands)**, the two wordmark-first identities closest to this one. Linear's wordmark *"should be used in all references to Linear as space allows"*, its logomark is for *"tight layouts or logo-only grids"*, and *"Monochrome usage is preferred."* Vercel's symbol *"should only be used in places where there is not enough room to display the full logo, or in cases where only brand symbols of multiple brands are displayed"*, and *"The safety area surrounding the Primary Logo is defined by the height of our symbol."* **Steal:** wordmark-first with one bounded exception written as a sentence — Vercel's names the sponsor-wall case exactly — and clear space defined by the mark's own geometry. **Leave:** logos shipped as an npm import; a volunteer must be able to drag a file into Figma.

**[Stripe — Brand assets](https://stripe.com/newsroom/brand-assets)**. *"Use slate and blurple on light backgrounds, and white on dark backgrounds. Do not use any other color for the wordmark."* **Steal:** the shape of that rule; ours is shorter — ink on paper, never cobalt (§8.3). **Leave:** the badge and the Marks Usage Agreement.

**[Recurse Center](https://www.recurse.com/)** and **[qairu.edu.kz](https://qairu.edu.kz/)**, read from their own responses. RC ships one CloudFront `.ico` at `type="image/x-icon"` and nothing else — no SVG, no manifest, no apple-touch-icon. QAIRU has no `/favicon.ico` at all (404) and serves `/icon.svg` (200); its header wordmark is `/brand/qairu-wordmark-black.png` with `-white.png` beside it, and it is the *same Latin wordmark on `/kk`, `/ru` and `/en`*. **Steal:** one Latin wordmark across three languages, and the `/brand/` path, so the child's file structure quotes the parent's. **Leave:** two rasters where one `currentColor` SVG does the job, and RC's file set.

**QAIRU's own Kazakh copy**, which has already solved declension for us: it writes `QAIRU-да оқығыңыз келе ме`, `QAIRU-да оқу практикасы`, `ADMISSION-ҒА КІРУ` — Latin name, hyphen, Cyrillic case ending. **Steal:** exactly that pattern, and nothing else; the parent has settled it in public.

**[Kazakh alphabets](https://en.wikipedia.org/wiki/Kazakh_alphabets)** and **[MDN — `theme-color`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color)**. The April 2021 revision maps Қ→Q and К→K; *"the target year for finishing the transition was pushed back to 2031."* MDN: *"This feature is not Baseline because it does not work in some of the most widely-used browsers"*, and documents `media` taking `prefers-color-scheme`. **Steal:** Қ↔Q as the basis of the naming rule; the two-tag pattern. **Leave:** any assumption `theme-color` is load-bearing.

## Proposal

**1. The mark is `QH`, drawn once, in one face.** `QH` is already the short code in this project's own specification — the receipt id `QH-APP-0217` (§12.3), the family names `QH Display` / `QH Sans` / `QH Mono` (§5.1) — and it is the one piece of it that has reached code, as the `qh-theme` storage key.

The obvious move is to set `Q` in display beside `H` in mono, quoting the split wordmark. **Reject it.** The two-voice device needs both faces legible against each other; at 16px it is two grey lumps, and drawing a two-face lockup means the 16px frame can only be rescued by falling back to `Q` alone — which is the parent's mark, and shipping `Q` at 16 and `QH` at 32 is a fractured identity to save one glyph. So: one pair, drawn from Onest alone, outlined, never live text. The display/mono split lives in the wordmark, where it is readable.

**2. 16px is solved by drawing on a 16-unit grid, not by hoping.** `icon.svg` gets `viewBox="0 0 16 16"`, stems 2 units wide, every edge on a whole unit, so a 1× rasterisation lands on pixel boundaries instead of smearing. This file — not the ICO — is what Chrome, Firefox and Safari put on the tab. The ICO carries the same `QH` in two hand-tuned frames (32 and 16, neither auto-downscaled) for the places that still reach for it: a pinned Windows shortcut, a feed reader.

**3. The files.** Under `public/`:

| File | Size | Content |
|---|---|---|
| `favicon.ico` | 16 + 32 | two frames, `#181611` on `#fbfaf8` |
| `icon.svg` | `viewBox 0 0 16 16` | `fill:#0b0a08`, → `#f1f0ed` under `prefers-color-scheme: dark` |
| `apple-touch-icon.png` | 180×180 | `#0b0a08` to the edge, mark in `#f1f0ed`, 20px padding, no alpha, square corners |
| `icon-192.png` / `icon-512.png` | 192 / 512 | as above |
| `icon-mask.png` | 512×512 | mark inside the 409px centre circle, ground bleeding to all four edges |
| `brand/qairuhub-wordmark.svg` | — | outlines, `fill="currentColor"` |
| `brand/qairuhub-monogram.svg` | — | outlines, `fill="currentColor"` |

Every hex is a §4 token: `#0b0a08` / `#f1f0ed` are dark `--paper` / `--ink-1`, `#fbfaf8` / `#181611` their light counterparts. `public/favicon.svg` — Astro's logo — is **deleted**, not overwritten. In `Base.astro`, replacing the two existing icon lines:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
<meta name="theme-color" content="#fbfaf8" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0b0a08" media="(prefers-color-scheme: dark)" />
```

`manifest.webmanifest`: `name`/`short_name` `"QairuHub"`, `id`/`start_url` `"/"`, `background_color` and `theme_color` `"#0b0a08"`, the three PNGs with `"purpose": "maskable"` on `icon-mask.png`, and `"display": "browser"` — a website, not an app. `standalone` invites an install prompt and, behind it, a service worker nobody can maintain. The manifest is same-origin, so it passes the existing CSP under `default-src 'self'`; no `_headers` change is needed for any of this.

**4. The wordmark: the code is wrong, not the law.** DESIGN.md's own first line settles the drift — *"If code and this document disagree, the code is wrong."* So `.wordmark` and `SITE.wordmark` are corrected to §10.1 (`QAIRU` display 600 · 1px `--rule-2` hairline · `HUB` mono 500 uppercase) before anything is outlined, and no amendment is needed for that.

The amendment §10.1 does need is one sentence, because *"No mark, no SVG, no logo file"* was written to stop someone inventing a logo and also stops the site being printed:

> *In the browser the wordmark is set live in QH Display and QH Mono and is never an image. Outside the browser it is `public/brand/qairuhub-wordmark.svg` — the same two words outlined from the same two faces at the same tracking, in `currentColor`, with no second file for a second polarity.*

Clear space is the cap height of the `Q` on all four sides; minimum 88px wide on screen (one grid column at 1440px, §6.2) and 18mm in print. `currentColor` is what stops QAIRU's black/white pair problem happening here.

**5. The stamp on a photograph lives outside the frame.** §7.2 forbids overlay, scrim, filter and text on a PLATE, and this does not weaken it. The monogram may be composited into an *exported* still, in the margin beside the frame, never over the image. On the site the credit stays the mono `<figcaption>`.

**6. The name does not transliterate.** The wordmark is Latin `QairuHub` on all three routes, exactly as QAIRU's is. §13's *"never mix languages inside one viewport"* gains an explicit exemption for proper names, so nobody later "fixes" it. **`Кайру` is banned as a spelling of the club's name anywhere**, Russian copy included: it substitutes a letter Kazakh does not use for this sound. A pronunciation gloss, if ever wanted, is **Қайру**, in a `lang="kk"` span even on the Russian route. `Hub` stays English — `Хаб` reads as a 2010s coworking space. Declension copies the parent verbatim: `QairuHub-қа`, `QairuHub-тың`, `QairuHub-та`; Russian takes no hyphen, `в QairuHub`. Those four lines go in `docs/CONTENT.md`; the full case table waits for 025, which is when a translator will actually need it.

## Scope

**Phase 1 — the tab. This is defect repair and it ships alone.** Draw the monogram, cut the six icon files, write the manifest, replace the two head lines, delete `favicon.ico` and `favicon.svg`. Nothing else in this document has to happen for Phase 1 to be worth doing.

**Phase 2 — off the browser.** Correct `.wordmark` and `SITE.wordmark` to §10.1, outline the wordmark, create `public/brand/`, land the §10.1 and §13 amendments, and write `docs/BRAND.md`: the two files, clear space, minimum size, the monochrome rule, the naming rule, the licence line.

**Phase 3 — the gate.** Extend `/dev/glyphs` (not a new `/dev/kitchen-sink`, which §8.4 rules out) with the monogram at 16 / 32 / 180px on both grounds, in the same hairline rows the route already uses — no boxes, no radius, no swatch grid. Plus a check that the files exist, that `favicon.ico` begins `00 00 01 00`, and the colour guard below.

**Not in scope:** Open Graph images (020), a non-typographic logomark, an animated favicon, any raster wordmark, and a `Cache-Control` block for the icons. These files are unhashed, so a long `max-age` is a stale mark you cannot bust; the current `max-age=0, must-revalidate` already gets a 304 against an ETag off a warm edge cache, and the saving is not worth the foot-gun.

## Data and schema

None. No collection field, no D1 migration, no binding. Changes are confined to `public/`, `src/layouts/Base.astro`, `src/lib/site.ts`, `src/styles/components.css`, `scripts/` and two clauses of `docs/DESIGN.md`.

## Design

The mark is chrome and belongs to no register. Against §16, line by line: no gradient, no glow, no shadow, no glassmorphism — the files are flat fills; no emoji; no second accent, because there is exactly one ink and one ground per file; no card, because nothing here is a container; no illustration, and specifically no brain, no node graph, no circuit board, no isometric Q — every shape in every file is a letter. Nothing animates (§9). Radius is 0 in every file we ship; iOS masks the Apple touch icon and Android masks `icon-mask.png`, and that rounding is the platform's — the one place §6.4 is overridden by something outside our control, stated rather than quietly broken.

**Cobalt needs enforcing, because the lint cannot currently see these files.** `check-cobalt.mjs` walks `git ls-files` and skips anything not matching `\.(astro|tsx|ts|jsx|js|css)$`, and it matches on `var(--cobalt`, not on colour values — so a cobalt hex in `public/brand/qairuhub-wordmark.svg` is invisible to it twice over. It gains a fourth check, and the right shape is a whitelist, not a blocklist of three hexes that `#0C84FA`, `rgb(12,132,250)` or any neighbouring blue would walk straight past:

- Every `fill` and `stroke` in `public/brand/*.svg` must be `currentColor` or `none`. Nothing else parses.
- Every colour literal in `public/icon.svg` must be one of the four §4 token hexes named in the table above.

Both are one regex each, and together they make it impossible to smuggle a second accent into the identity without editing the lint on purpose.

## Risks and trade-offs

1. **The strongest argument against doing this at all: the site has no photographs.** §7.2 makes the PLATE mandatory and §3 calls it non-optional — *"If the PLATE is dropped, this becomes the fourth drafting-sheet site of the day"* — and today every one of them is a hatched placeholder. A first-year deciding whether to walk in on Friday is not stopped by the favicon; they are stopped by there being no faces. Spending a volunteer's scarce design hours drawing a monogram before a single photograph exists is the identity version of §7.4's banned placeholder row: it makes the site look finished where it is not. **019 should go first.** The reason this proposal survives that argument is only the phase split — Phase 1 is repairing a shipped defect, not designing, and Phase 2 is the single asset 020 and 023 are both blocked on. If Phases 2–3 slip behind 019, that is the right outcome, not a failure.
2. **`QH` may still be mush at 16px on a 1× Windows panel** — the machine §14 insists on. There is no fallback drawing by design (see Proposal 1). If it fails the `/dev/glyphs` review, the retreat is a plain ruled square in the token hexes — anonymous, but honest and legible — not a second, different mark.
3. **Where the font files even are.** Onest and Geist are fetched by Astro's Google provider at build time; there is no `public/fonts/`, and DESIGN.md §5.2's `@font-face` block naming `/fonts/space-grotesk-500.woff2` is stale. Whoever outlines the wordmark pulls the faces from Google Fonts directly and records exactly which version in `docs/BRAND.md`.
4. **Font licensing.** Both are SIL Open Font License 1.1 — [Geist](https://github.com/vercel/geist-font), [Onest](https://github.com/google/fonts/blob/main/ofl/onest/OFL.txt) (*"Copyright 2021 The Onest Project Authors"*, no Reserved Font Name). Outlined glyphs in an SVG are not Font Software and are not a redistribution of the font. Still: record the licence line and the source in `docs/BRAND.md` before the file lands, and do not outline anything on the strength of this paragraph alone.
5. **Tooling.** `sharp@0.35.4` and `svgo@4.1.0` are in the pnpm store as transitive dependencies of Astro, but pnpm's strict layout means a script cannot import them without declaring them. Rasterise through the headless Chromium Playwright already installs: no new dependency, no cost.
6. **`theme-color` is not Baseline.** A nicety. Nothing may depend on it.

## Success

- `curl -I` on the five icon and manifest URLs returns 200 with the right `Content-Type`; `favicon.ico` begins `00 00 01 00`; `/favicon.svg` is gone.
- The tab shows `QH` in Chrome, Firefox and Safari, light and dark, at 100 / 125 / 150% Windows scaling.
- "Add to Home Screen" on an iPhone yields the monogram, not a screenshot.
- `pnpm guard:cobalt` fails when a cobalt fill is pasted into `public/brand/qairuhub-wordmark.svg`. Test it by pasting one.
- 020 ships a share card, and 023 prints an A3, using `qairuhub-wordmark.svg` with no raster and no colour edit. Until one of those happens, Phase 2 has not been proven useful.
- **Remove it again if:** after the `/dev/glyphs` review the mark is unreadable at 16px. Ship the ruled square rather than a mark nobody can resolve.

## Effort

**M**, in three separable parts. Phase 1 is S — about two hours plus the drawing — and blocks nothing and is blocked by nothing. Phase 2 is S plus one review to settle the §10.1 correction. Phase 3 is S. Phase 2 unblocks 020 and 023; it should queue behind 019.
