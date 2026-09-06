# QairuHub — Design Specification

**Status: LAW.** This document governs every visual and interaction decision on
qairuhub.com. If code and this document disagree, the code is wrong.

Direction: **NIGHT EDITION — ТҮНГІ БАСЫЛЫМ**
Version: 1.0 · 2026-09-06

---

## 0. The decision

Five directions were explored and judged on four lenses (distinctiveness, brief
fit, craft feasibility, audience fit). **Night Edition wins as the spine.**

**Why it wins, against the critique rather than the scores.**

`Night Edition` and `Табло` tied on average (6.375). `Табло` had the higher floor
(min 6 vs 4), and the rule is that a fatal single-lens failure disqualifies. So
this needs justifying.

`Табло`'s weaknesses are *structural to its concept and unfixable*: a live
scoreboard whose thesis is currency, run by volunteer students, spends July
announcing that nothing is happening; the sprint counter, commit ticker,
countdown clock, blinking LED and sparkline are the Linear/Vercel/Railway
convention stack arriving through behaviour instead of hue — it survives in
greyscale, but it survives *as a status page*; its 88px fixed row unit
mathematically cannot hold a Cyrillic two-line title plus a meta line; and its
photography allocation is smaller than its ticker, discarding the parent brand's
single defining trait. You cannot remove the ticker, the countdown and the live
board from `Табло` and still have `Табло`.

`Night Edition`'s failure — AUDIENCE_FIT 4 — is *diagnosed precisely and is
entirely a content, copy and placement failure*, not a structural one. The
verdict was: no Apply above the fold, the one accent link points at the charter,
the apply flow reads as institutional paperwork ("ФОРМА 01", "the instrument"),
no low-threshold door, no faces, no warmth, and a layout that needs content
volume the club does not have. Every one of those is fixed below by moving a CTA,
rewriting a register, promoting photography from footnote to structural
requirement, and designing the sparse state as a first-class composition. None of
them requires touching the grid, the type system or the cobalt doctrine.

It also brings the three strongest assets in the whole exploration, and they are
independent of one another: the **day edition / night edition** framing (which
makes dark-first an editorial decision and the QAIRU relationship *structural*
rather than a colour copy), the **cobalt doctrine** (the only real answer to the
brief's stated key risk), and the highest craft-feasibility score (7.5) — every
signature move is zero-JS by construction, which is what buys the performance
budget outright.

**What lost, and what we took from each:** §2.

---

## 1. Concept and voice

QAIRU is the day edition: white paper, near-black ink, generous margins, an
institutional broadsheet. **QairuHub is the night edition off the same press** —
same type furniture, same numbered eyebrows, same wordmark identity, same
photography-supplies-the-colour rule, printed on warm near-black and running
denser, because students ship more often than institutions publish.

A newspaper is a machine for presenting dated, verifiable, changing facts under a
fixed masthead. That is exactly this site's job: what is open, what is happening,
what got shipped.

**Voice.** Direct, imperative, shipping-focused. Short sentences. Concrete
outcomes with dates and numbers attached. "Learn it, build it, launch it" is a
standing motto set in mono under the nameplate — never a hero slogan floating in
space.

**The copy law:** every headline, deck and eyebrow must name a checkable fact or
a concrete action. A line that could appear on any student club's site anywhere
is a bug. Specifically banned as decks: manifesto lines, identity claims, "don't
wait for permission", anything about the future of anything.

---

## 2. Grafts accepted, grafts rejected

### Accepted (and why they cohere)

| Graft | From | Why it fits |
|---|---|---|
| **Split wordmark** `QAIRU` in display 600 · hairline · `HUB` in mono | Console / Registry | States the whole parent-child relationship in twelve characters of CSS, with no logo mark — matching QAIRU's wordmark identity. It *is* a masthead. |
| **The application receipt** — submit issues a real reference id on a receipt page | Registry | A newspaper of record printing your entry. Converts the coldest moment on the site into its most memorable one. |
| **"What happens next" 01–04** rail beside the apply form | Registry | Literally QAIRU's numbered step list, and the single best conversion device found. Fixes the apply-anxiety failure. |
| **Warm neutral ramp (hue 85, chroma 0.004–0.006)** instead of a blue-black | Console | Puts cobalt (hue 255) in maximum opposition to its ground instead of letting it melt in. Newsprint is warm. Verified: it also *raises* cobalt's contrast to 5.35:1. |
| **State tokens on every index row** (`ОТКРЫТ` · `18/40` · `АРХИВ`) | Табло | Tells a student at a glance whether a thing is open to them. Adopted as mono text in the row, **not** as a header bar on every module — that would flatten six page types into one. |
| **Radius as a hierarchy signal** (0 / 2 / 4) rather than one constant | Табло / Console | Satisfies the uniform-radius ban with information instead of taste. |
| **Cobalt allowlist enforced by lint + Playwright**, replacing "count it on a screenshot" | Console | The 2% rule was correct and unenforceable. See §8.4. |
| **`/dev/glyphs` build gate** failing on `.notdef` | All four | The only cheap way to catch a missing Kazakh glyph before it ships. |
| **Per-language authored headlines**, never machine-wrapped | Broadsheet / Табло | Kazakh runs ~20% longer than English. |
| **Errors as margin notes** with `aria-describedby`, collapsing inline on mobile | Broadsheet | Better than the category default and layout-stable. |
| **Live values that expire rather than lie** (`stale_after`) | Табло | A dormant state renders automatically instead of showing a stale claim. |
| **Photography promoted from footnote to structural requirement** (THE PLATE, §7.2) | Blueprint's inverse + every critic | The parent brand's stated colour source and this direction's biggest unspent asset. This is the largest single intervention in this document. |

### Rejected, with reasons

- **Vertical rotated Cyrillic rail labels** (Табло). The rail already carries the
  section numeral, marginalia and change-bars. Rotated type collides with all
  three and is decoration, not structure.
- **Ticker / countdown / sprint counter / blinking status square / live clock /
  GPS coordinates / folio numbers / issue numbers** (Табло, and Night Edition's
  own masthead). All of it is decoration wearing data's clothes. A live clock on
  a static build is either stale or a hydration island on every route.
  Coordinates inform nobody applying to a hackathon in their own city.
  **Killed outright.**
- **The tick ruler** (Console / Blueprint). `repeating-linear-gradient` at an 8px
  period renders alternating 1px/2px ticks and moiré at the 1.25× and 1.5× DPRs
  standard on Windows laptops — i.e. a QAIRU student lab. The repair for that is
  always decoration.
- **Terminal prompt, block cursor, ASCII checkboxes, diff glyphs** (Console). A
  `$` you cannot type into is a false affordance, and it is exactly the costume
  the same document bans two paragraphs later.
- **Sheet coordinates A–F / 1–12** (Blueprint). They address nothing and are
  referenced from nowhere. Charter clause numbers stay because they are real.
- **`МАСШТАБ 1:1`, `r.34`, `ЛИСТ 01 из 09`** (Blueprint). Invented metadata.
- **The spine bar of six counts** (Registry). Six identical cells each carrying
  one label and one big number is the banned three-card pattern rotated, and the
  count-up animation is the tell.
- **The drop cap and all multi-column body setting** (Night Edition's own). Print
  furniture that reads as a WordPress theme more often than as a broadsheet; rags
  brutally at 40ch in Kazakh (`ұйымдастырушылық`, and there is no `hyphens: auto`
  dictionary for `kk`); and it disappears below 768px, meaning the signature
  homepage composition would not exist for most visitors. **Killed.**
- **"No second hue for error states"** (Console / Табло). Aesthetic absolutism at
  the exact point where users are most anxious. We ship a `--danger` token.
- **Grayscale-at-rest photography, colour on hover** (Табло / Blueprint). A stock
  2015 move, invisible on touch, and it switches off the site's only warmth
  mechanism in its default state. **Photographs are full colour at rest, always.**
- **`position: fixed` full-height spine** (Night Edition's own). Replaced by a
  `border-inline-end` on the rail grid column: identical appearance, one fewer
  stacking context, and it removes the iOS-Safari triple-sticky risk.

---

## 3. Accepted trade-offs (unresolvable)

1. **Space Grotesk has no Cyrillic.** The display face is locked by the brief.
   The resolution (§5.2) is a metric-tuned Cyrillic companion (Onest) under the
   same family name — *not* a fallback to the body face. It is a close optical
   match, not the same typeface. Kazakh and Russian headlines will not be
   metrically identical to English ones. Every headline is reviewed in all three
   scripts. **Accepted.**
2. **The broadsheet needs content volume.** With four events and six projects the
   register reads thin. §7.4 designs the thin state deliberately (the PLATE
   carries the mass; an index under three entries renders as prose, not a table),
   but a first issue is a first issue. **Accepted, mitigated.**
3. **Density is a desktop advantage.** Below 768px the rail is off and the site
   is a single dense column. §6.5 designs that state first rather than inheriting
   it, but the composition is strongest at ≥1024px. **Accepted.**
4. **Editorial-brutalist is itself a genre.** Hairlines, mono eyebrows, oversized
   margin numerals and flush-left everything are a recognisable 2024–2026 look.
   Our separation from it is: no drop cap, no multicol, no coordinates, no folio,
   no clock, no ruler — plus photography at scale, which almost nothing in that
   genre does. If the PLATE is dropped, this becomes the fourth drafting-sheet
   site of the day. **The PLATE is not optional.**

---

## 4. Colour tokens

All values are OKLCH. Hex values and contrast ratios below are **computed, not
estimated**, against the relevant ground. Never hardcode a colour in a component.

### 4.1 Dark (default)

```css
:root {
  /* ground — warm, hue 85, near-zero chroma. This is what keeps cobalt from
     melting into its background the way it does on every blue-black dev site. */
  --paper:        oklch(0.145 0.004 85);  /* #0b0a08  page ground             */
  --paper-2:      oklch(0.185 0.005 85);  /* #141310  row hover / raised      */

  /* ink ramp */
  --ink-1:        oklch(0.955 0.004 85);  /* #f1f0ed  17.4:1  primary text    */
  --ink-2:        oklch(0.800 0.005 85);  /* #bfbdba  10.6:1  secondary text  */
  --ink-3:        oklch(0.685 0.006 85);  /* #9b9996   7.0:1  meta, eyebrows  */
  --ink-4:        oklch(0.550 0.006 85);  /* #73716e   4.1:1  ≥24px ONLY      */

  /* rules */
  --rule:         oklch(0.320 0.006 85);  /* #34332f   1.6:1  decorative only */
  --rule-2:       oklch(0.400 0.006 85);  /* #494744   2.2:1  section bounds  */
  --rule-strong:  oklch(0.500 0.006 85);  /* #65635f   3.3:1  REQUIRED wherever
                                             a 1px line is the only boundary of
                                             an interactive control (1.4.11)  */

  /* signal */
  --cobalt:       oklch(0.62 0.20 255);   /* #0c84fa   5.4:1  fills, 2px rules,
                                             focus rings                      */
  --cobalt-text:  oklch(0.74 0.16 255);   /* #5fadff   8.4:1  MANDATORY for any
                                             cobalt text ≤13px, any 1px mark  */
  --on-cobalt:    oklch(0.16 0 0);        /* #0d0d0d   5.2:1 on cobalt fill.
                                             White on cobalt is 3.7:1 — banned */
  --danger:       oklch(0.70 0.17 25);    /* #f66d67   6.9:1  errors only     */
}
```

### 4.2 Light (the day edition — the parent's own polarity)

Light mode is not a courtesy toggle. It is QAIRU's paper, and it passes the same
component gate. A component that only works in dark is a bug, not a variant.

```css
/* applied under :root[data-theme="light"] and under
   @media (prefers-color-scheme: light) guarded as :root:not([data-theme="dark"]) */
--paper:        oklch(0.985 0.003 85);  /* #fbfaf8 */
--paper-2:      oklch(0.955 0.004 85);  /* #f1f0ed */
--ink-1:        oklch(0.200 0.010 85);  /* #181611  17.3:1 */
--ink-2:        oklch(0.420 0.010 85);  /* #504d47   8.1:1 */
--ink-3:        oklch(0.520 0.010 85);  /* #6b6963   5.3:1 */
--ink-4:        oklch(0.620 0.010 85);  /*           ≥24px ONLY */
--rule:         oklch(0.840 0.008 85);  /* #cdcac5   1.6:1 decorative */
--rule-2:       oklch(0.740 0.008 85);  /* #adaaa5   2.2:1 */
--rule-strong:  oklch(0.650 0.008 85);  /* #918f8a   3.1:1 */
--cobalt:       oklch(0.50 0.20 255);   /* #005dd1   5.8:1 */
--cobalt-text:  oklch(0.50 0.20 255);   /* small text darkens, it does not lift */
--on-cobalt:    oklch(1 0 0);           /* white on light cobalt = 6.0:1 */
--danger:       oklch(0.50 0.20 25);    /* #bb061e   6.4:1 */
```

Theme is a three-state system: explicit `data-theme="dark"` / `data-theme="light"`
on `<html>`, and system default when the attribute is absent. Define the full dark
palette on bare `:root`; redefine only the changed tokens in the two blocks above.

### 4.3 Higher-contrast tier

```css
@media (prefers-contrast: more) {
  :root { --rule: oklch(0.44 0.006 85); --rule-2: oklch(0.56 0.006 85); }
  .rule--section { border-block-end-width: 2px; }
}
```

### 4.4 Law of hairlines

- `--rule` is **decorative**: it separates blocks that already carry text on both
  sides. It is never the sole indicator of anything.
- `--rule-strong` is **structural**: input borders, chip borders, the capacity
  track, any 1px edge that is the only boundary of an interactive control. 3:1
  minimum, non-negotiable.
- The fix for "this hairline looks faint" is `--rule-strong` — never a filled
  surface, never a radius, never padding. **That path is exactly how this design
  turns into a card grid.** See §16.

---

## 5. Typography

### 5.1 Families and roles

| Family | Faces | Job | Never |
|---|---|---|---|
| `--font-display` "QH Display" | Space Grotesk (Latin) **+ Onest (Cyrillic)** | Nameplate, decks, section heads, row titles, rail numerals | UI, buttons, table cells, anything < 1.125rem, uppercase, positive tracking |
| `--font-sans` "QH Sans" | **Geist Sans, all scripts** | All reading text, row descriptions, form values | Labels, eyebrows, data, anything > 1.0625rem |
| `--font-mono` "QH Mono" | **Geist Mono, all scripts** | **The institutional voice** — eyebrows, labels, nav numerals, captions, dates, counts, statuses, clause numbers, buttons, chips, all tabular data | Any paragraph longer than one line |

**Only the display family is a composite.** Geist Sans and Geist Mono each
contain Latin, Russian Cyrillic and all nine Kazakh letter pairs, so splicing
them would add complexity and two more font requests for nothing.

Mono is roughly a third of the type on this site. That is what makes the page read
as a printed record rather than a product page. It is not a code voice.

### 5.2 The trilingual font architecture (blocking; build first)

Kazakh needs nine letter pairs that Russian Cyrillic does not have:
**Ә ә Ғ ғ Қ қ Ң ң Ө ө Ұ ұ Ү ү Һ һ І і**. Every face the site ships is verified
against them by reading its `cmap` table — `node scripts/check-font-coverage.mjs`.
Subset labels are not evidence: a family can advertise a `cyrillic` subset and
contain none of these.

**Verified 2026-09-06** (full audit in `docs/research/font-coverage.md`):

| Face | Kazakh | Consequence |
|---|---|---|
| Geist Sans | ✅ complete | body needs no splice |
| Geist Mono | ✅ complete | mono needs no splice |
| Onest | ✅ complete | usable for Cyrillic display |
| **Space Grotesk** | ❌ **no Cyrillic at all** | Latin only; must be spliced |
| **JetBrains Mono** | ❌ **missing Ә Ғ Қ Ң Ұ Һ** | **banned from this site** |

JetBrains Mono is the dangerous case and was the original proposal for the mono
Cyrillic half: it renders Russian correctly and drops exactly the Kazakh letters,
so the failure would only appear on a Kazakh page nobody tested. Geist Mono covers
all three scripts on its own, so there is no splice and no risk.

**Only the display family is composite.** Space Grotesk carries Latin, Onest
carries Cyrillic, under one CSS family name:

```css
/* Latin — the locked display face */
@font-face { font-family:"QH Display"; src:url(/fonts/space-grotesk-500.woff2) format("woff2");
  font-weight:500; font-display:swap; unicode-range:U+0000-024F,U+2000-206F,U+2190-21BB; }
@font-face { font-family:"QH Display"; src:url(/fonts/space-grotesk-700.woff2) format("woff2");
  font-weight:700; font-display:swap; unicode-range:U+0000-024F,U+2000-206F,U+2190-21BB; }

/* Cyrillic — Onest, metric-matched to Space Grotesk. NOT the body face.
   Overrides are MEASURED from each font's head/OS-2/hhea tables by
   `node scripts/font-metrics.mjs "Space+Grotesk:wght@500" "Onest:wght@600"`,
   never estimated. Space Grotesk cap 700/1000; Onest cap 707/1000. */
@font-face { font-family:"QH Display"; src:url(/fonts/onest-600.woff2) format("woff2");
  font-weight:500; font-display:swap;
  unicode-range:U+0400-04FF,U+0500-052F,U+2DE0-2DFF,U+A640-A69F;
  size-adjust:99.01%; ascent-override:97.97%; descent-override:30.80%;
  line-gap-override:0%; }
@font-face { font-family:"QH Display"; src:url(/fonts/onest-800.woff2) format("woff2");
  font-weight:700; font-display:swap;
  unicode-range:U+0400-04FF,U+0500-052F,U+2DE0-2DFF,U+A640-A69F;
  size-adjust:99.01%; ascent-override:97.97%; descent-override:30.80%;
  line-gap-override:0%; }
```

**Residual mismatch, stated rather than hidden.** Cap heights match to within
0.01% after adjustment, but the two faces disagree on x-height: Space Grotesk sits
at 48.60% of its em, Onest at 52.18% once scaled — Cyrillic lowercase reads about
7% larger than Latin lowercase at the same cap height. Cap-matching is the correct
anchor for display type, and §5.4 already line-breaks decks per language by hand,
so the two never set side by side. Do not "fix" this by scaling Onest down: that
would leave Kazakh capitals visibly short next to English ones, which is worse.

**Verification.** `/dev/glyphs` renders `Ә Ғ Қ Ң Ө Ұ Ү Һ І` and `AEHOKX` at
96 / 34 / 13 / 11px in every family, weight and theme, with the Latin reference
overlaid at 50% opacity. The route **fails the build on any `.notdef`**.

Never a mixed-face line within a word. Never browser-synthesised bold or oblique.

### 5.3 Scale (root = 16px)

**Display — QH Display. Four jobs only: nameplate, decks, section heads, rail
numerals.**

| Token | Size | Line-height | Tracking | Weight |
|---|---|---|---|---|
| `d1` nameplate | `clamp(2.5rem, 6.2vw, 5.5rem)` | 0.90 | -0.03em | 700 |
| `d2` deck | `clamp(2rem, 3.6vw, 3.5rem)` | 0.98 | -0.025em | 600 |
| `d3` section head | `clamp(1.625rem, 2.2vw, 2.125rem)` | 1.02 | -0.02em | 600 |
| `d4` row title | `1.375rem` | 1.15 | -0.01em | 600 |
| `d5` small head | `1.125rem` | 1.25 | -0.005em | 600 |
| `dn` rail numeral | `3.5rem` | 1 | -0.02em | 700, `--ink-4` |

**Body — QH Sans. Weights 400 and 500 only. 500 for names, row titles and
labels-in-body.**

| Token | Size | Line-height | Measure |
|---|---|---|---|
| `lead` | `1.0625rem` (17px) | 1.55 | 62ch |
| `body` | `1rem` (16px) | 1.60 | 62ch |
| `longform` | `1.0625rem` (17px) | 1.65 | 68ch |
| `small` | `0.875rem` (14px) | 1.50 | 62ch |

**Mono — QH Mono.**

| Token | Size | LH | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `m-eyebrow` | `0.6875rem` (11px) | 1 | 0.14em | 500 | eyebrows, uppercase |
| `m-label` | `0.75rem` (12px) | 1.3 | 0.06em | 500 | nav, captions, state tokens |
| `m-data` | `0.8125rem` (13px) | 1.4 | 0 | 400 | dates, counts, table cells |
| `m-note` | `0.75rem` (12px) | 1.45 | 0 | 400 | margin notes |
| `m-button` | `0.75rem` (12px) | 1 | 0.08em | 500 | buttons, chips, uppercase |

**Nothing on this site is set below 11px.** `font-variant-numeric: tabular-nums`
is global on `.mono, th, td, time` — the registry and the diary depend on figures
aligning in a column.

### 5.4 Cyrillic adjustments

```css
:lang(kk), :lang(ru) {
  --m-eyebrow-size: 0.75rem;   /* 11px Cyrillic with Kazakh diacritics is not legible */
  --m-eyebrow-track: 0.10em;   /* 0.14em is tuned for PROJECTS, not ИНФРАСТРУКТУРА */
}
:lang(kk) .d1, :lang(ru) .d1 { font-size: clamp(2.25rem, 5.4vw, 4.75rem); }
:lang(kk) .d2, :lang(ru) .d2 { font-size: clamp(1.75rem, 3.1vw, 3rem); line-height: 0.99; }
```

Decks are **line-broken per language by hand**, never machine-wrapped. A deck in
content is an array of lines, not a string.

### 5.5 The eyebrow grammar

Always `NN — WORD`: a two-digit numeral, an em dash, then the label, in
`m-eyebrow` uppercase at `--ink-3`, the numeral one step dimmer via opacity
(never `--ink-4`, never below 4.5:1). This is the direct descendant of QAIRU's
`ИНФРАСТРУКТУРА` eyebrows and `01 02 03 04` step lists.

Eyebrows sit either 12px above a section head, or **riding the section hairline**
with a background cut:

```css
.eyebrow--on-rule { background: var(--paper); padding-inline-end: 0.75rem; }
```

The background-cut is forbidden over the PLATE, over `--paper-2`, and inside any
full-bleed block — set the eyebrow above the rule there instead. Never centred,
never with an icon.

### 5.6 Links

Body links carry a **permanent** 1px underline in `--ink-3` at 2px offset. On
hover and focus, `text-decoration-color` goes `--cobalt-text` and the offset goes
to 3px. Underlines are never revealed on hover — they were always there; only the
colour changes.

---

## 6. Grid and space

### 6.1 The shell

```css
.page {
  max-inline-size: 1440px; margin-inline: auto; padding-inline: 2rem;
  display: grid;
  grid-template-columns: var(--rail) repeat(12, minmax(0, 1fr));
  column-gap: var(--gutter);
}
.rail {
  grid-column: 1;
  border-inline-end: 1px solid var(--rule);
  padding-inline-end: 0.75rem;
  text-align: end;
}
```

The rail's `border-inline-end` **is the spine**. There is no fixed-position spine
element. Every horizontal rule on the page starts at the spine and terminates into
it; no rule ever crosses left of it.

The rail carries, and only carries: the sticky section numeral, margin notes,
figure numbers, change-bar ticks, clause numbers, form step markers and form
errors. **It never holds body text.** If a section has no marginalia the rail
still carries its numeral — the rail is never empty on desktop.

Content never begins at the true left edge. Nothing on this site is ever centred:
not the hero, not section heads, not the footer, not empty states, not the 404.

### 6.2 Breakpoints

| Range | `--rail` | Cols | `--gutter` | Padding | Section pad |
|---|---|---|---|---|---|
| ≥1280px | 96px | 12 | 24px | 32px | 96px |
| 1024–1279 | 72px | 12 | 20px | 28px | 80px |
| 768–1023 | 48px | 8 | 20px | 24px | 64px |
| <768 | 0 (off) | 4 | 16px | 20px | 48px |

At 1440px a column is 88px.

### 6.3 Asymmetry rules (non-negotiable)

1. **Never 6/6.** Splits of the 12-column well are 7/5, 8/4 or 9/3, with one
   genuinely empty column between carrying a `column-rule` hairline. A 5/7
   inversion is permitted **once per page** as the editorial break.
2. **Bleed right only.** Exactly one block per page breaks the well and runs
   full-bleed to the right viewport edge: a table, the registry, or a PLATE. Never
   bleeds left — the spine holds that side. One per page, never two.
3. **Hanging punctuation into the rail.** Pull quotes, list bullets and clause
   numbers hang into the rail via negative `text-indent`. The rail is the only
   place ink is permitted left of the well.
4. Headline blocks top-align to their section rule; body text starts one 4px row
   lower, so heads and text never share a baseline.

### 6.4 Vertical rhythm and radius

Base unit 4px. Index rows are 44px minimum — never the 32px a terminal would use;
this is a recruitment site, not a console. Every hit target is ≥44px.

Radius takes exactly **three** values with fixed jobs. The 6px ceiling exists in
the tokens and is used by nothing.

- `0` — every structural element: rules, rows, tables, plates, photographs, the
  colophon, section blocks. **Containers never round, because containers are
  rules.**
- `2px` — inline mono tokens, tags, filter chips.
- `4px` — inputs, buttons, form controls.

No shadows exist in the codebase. Depth is ink step and rule weight only.

### 6.5 The <768px collapse — designed, not inherited

This is the state most visitors see. It is built first.

- Rail off; the section numeral moves inline above each section head at `1.75rem`
  display in `--ink-4`.
- Margin notes collapse to inline `m-note` lines directly beneath the paragraph or
  field they annotate, each prefixed by a 16px 1px leader dash.
- Change-bar ticks move to a 1px × 12px cobalt mark before the row title.
- Index tables become **slips** with one DOM and no duplicate markup:
  `tr, td { display: block }` plus `td::before { content: attr(data-label) }` in
  `m-eyebrow`. A slip is three lines: state token + date · title · meta joined by
  ` · `. Slips are separated by the same 1px `--rule` and are **never given
  padding, a border and a radius** — that is a card.
- The full-bleed-right block runs edge to edge with 20px inset content.
- **Navigation:** the header is 48px — split wordmark left, the word `МӘЗІР` /
  `МЕНЮ` / `MENU` in `m-button` right (a word, never a hamburger icon). It opens a
  full-screen index sheet: the same numbered section list at `d5`, one per row,
  44px tall, hairline-separated, language switch at the foot, `ЖАБУ` / `ЗАКРЫТЬ` /
  `CLOSE` top right. Focus trapped, `Esc` closes, focus returns to the trigger. It
  is a contents page, not a drawer — which is on-concept.

---

## 7. The three registers

Every page composes from exactly three registers, and **every page must use at
least two.** This is the answer to "six page types, one rhythm".

### 7.1 THE RECORD — dense hairline rows

Tabular, hairline-separated, tabular figures, mono metadata, a state token per
row, no zebra, no card, no box. The default for programmes, events, projects,
people, notes and charter clauses.

### 7.2 THE PLATE — documentary photography at scale (mandatory)

**Every page carries exactly one PLATE.** Not "at most" — exactly one. It is the
parent brand's colour source and this site's only warmth mechanism.

- Full colour at rest. No grayscale, no duotone, no filter, no overlay, no
  gradient scrim, no text on top of it.
- 1px `--rule-strong` border, radius 0, no shadow.
- Sized to be a compositional force: on the homepage and index pages it is the
  full-bleed-right block at 16:9; on detail pages it is cols 2–9 at 4:3.
- A mono caption beneath it, always: `СУРЕТ 02 — ЛАБОРАТОРИЯ, QAIRU · ФОТО:
  <name>`. Caption, alt text and credit are **required content fields**; a photo
  without them fails the build.
- Subject matter: what actually happened here. Build nights, robotics labs, people
  at whiteboards, a demo at 23:00, the Nur Alem sphere. Never a render, never
  stock, never an abstract, never a screenshot in browser chrome.
- People must appear. Across the site, ≥50% of PLATEs show faces.
- The PLATE is never behind text and never the LCP element on the homepage — it
  sits immediately *below* the fold, which preserves the text LCP.

### 7.3 THE READ — long-form

Single column, 68ch, `longform` type, marginalia in the rail aligned to the
paragraphs they annotate, numbered figures with mono captions, and a right-hand
hairline-separated table of contents whose active item is marked by a 1px × 16px
cobalt vertical tick — not a pill, not a highlight, not a filled background.

**Multi-column body text does not exist on this site.** No `column-count`
anywhere, at any breakpoint, for any block.

### 7.4 The thin-content law

A young club does not have 300 projects. The register must look correct at day one.

- An index with **fewer than 3 entries renders as READ, not RECORD** — a short
  hairline-separated list with a sentence each, no column headers, no sort. A
  four-row table with headers reads as broken; four paragraphs read as early.
- An index with **zero** entries renders its eyebrow, its section rule, and one
  mono line: `ӘЛІ ЖАРИЯЛАНБАҒАН — NOT YET PUBLISHED` in `--ink-3`. Never a
  placeholder row, a skeleton, a shimmer, or a fake entry.
- A statistic with no verified source renders **nothing**. No count-ups, no
  tickers, no animated numerals anywhere on the site (CLAUDE.md §9).
- The PLATE carries the visual mass while the registers are thin. This is why it
  is mandatory.

---

## 8. The cobalt law

Cobalt is ink for the **live layer** only — things that respond, or things that
changed. It is never a surface, never atmosphere, never a mood.

### 8.1 The three fills (site-wide total)

1. **`.cta-primary`** — solid `--cobalt`, `--on-cobalt` label, 4px radius, 44px
   tall, `m-button`. **One per page, maximum.** On the homepage it is `ӨТІНІШ →`
   in THE DESK. Hover darkens L by 0.04; no lift, no shadow, no scale.
2. **`::selection`** — cobalt ground, `--on-cobalt` text.
3. **The 2px active-nav underline**, and the filled portion of the 2px capacity
   rule. Both are rules doing data work.

### 8.2 Cobalt as ink (1px marks and text only)

4. Inline link underline colour on hover/focus (§5.6).
5. `outline: 2px solid var(--cobalt); outline-offset: 3px` on `:focus-visible`, on
   every focusable element without exception, in both themes. Never removed.
6. Active/selected filter chip: 1px `--cobalt` border + `--cobalt-text` label on a
   transparent ground. **Never a cobalt fill.**
7. **The margin change-bar** — a 1px × 12px `--cobalt` tick in the rail beside
   anything modified in the last 7 days (desk item, event, project row, amended
   charter clause). Lifted from the revision bar of a printed legal instrument.
   This is the one editorial, non-interactive use, and it carries provenance.
8. A state token whose state is **actionable now** — `ТІРКЕЛУ АШЫҚ`, `ӨТІНІШ
   АШЫҚ`, `КЕЛЕСІ` — in `--cobalt-text`. `ЖАБЫҚ`, `АРХИВ`, `ӨТКЕН`, `ІСКЕ
   ҚОСЫЛДЫ` are `--ink-3`.
9. The active TOC / form-step tick: a 1px × 16px vertical mark.

### 8.3 Forbidden, exhaustively

Cobalt in the masthead or wordmark. Cobalt in any headline, deck or section head.
Cobalt on the rail numerals. Cobalt on the spine or any idle hairline. Cobalt on
structural or decorative rules. Cobalt tint in `--paper` or any surface. Cobalt at
reduced alpha as a wash (`oklch(... / 0.08)` panels — banned by name; this is how
the no-wash rule gets broken by stealth). Any gradient, glow, blur or
`box-shadow` in cobalt. Cobalt as body-text colour. Two cobalt elements touching.
Cobalt as the only carrier of meaning — every cobalt state is doubled by a mono
word or a geometric change. Error states use `--danger`, never cobalt.

### 8.4 Enforcement (mechanised, not reviewed)

"Count it on a screenshot" is correct in spirit and dies in practice. Replace with:

1. **Lint gate** — `scripts/check-cobalt.mjs`, wired into `pnpm check`:
   `var(--cobalt` and `var(--cobalt-text` may appear only inside
   `src/styles/global.css`, in the `@layer components` blocks named in
   `COBALT_ALLOWLIST`. A reference from any `.astro` / `.tsx` file fails the build.
2. **Playwright assertions** — `tests/e2e/design-law.spec.ts`, over every route at
   375 / 768 / 1440 in both themes:
   - ≤1 `.cta-primary` per page;
   - zero elements matching `[class*="card"]`;
   - zero computed `box-shadow` other than `none` in dark mode;
   - zero `border-radius` > 6px;
   - exactly one `.plate` per page;
   - every `<img>` has non-empty `alt` and a sibling `<figcaption>`;
   - every `input`/`select`/`textarea` border colour resolves to `--rule-strong`.
3. **Gates** — `/dev/kitchen-sink` (every component, every state, both themes) and
   `/dev/glyphs` (§5.2). Both fail the build on error.

---

## 9. Motion — "the press run"

The page assembles the way a sheet is printed: rules first, then type. Nothing
bounces, nothing scales, nothing travels more than 8px, nothing loops.

### 9.1 Page load (one sequence, 520ms total, once per navigation)

| t | Element | Property | Duration | Easing |
|---|---|---|---|---|
| 0ms | rail spine | `scaleY(0→1)`, origin top | 240ms | `cubic-bezier(.22,1,.36,1)` |
| 40ms | masthead 2px rule | `scaleX(0→1)`, origin left | 240ms | same |
| 100ms | nameplate + deck | `translateY(8px→0)` **only** — opacity stays 1 so the LCP text paints on frame one | 220ms | same |
| 160ms | desk rows | `opacity 0→1`, 24ms stagger | 180ms each | `ease-out` |

Text never scales. Rail numerals never animate.

### 9.2 Scroll

Two behaviours only, both CSS:

1. Section hairlines draw in via `scaleX` on entry, 280ms, once, using
   `animation-timeline: view()`. Under
   `@supports not (animation-timeline: view())` they are simply present.
2. The sticky rail numeral cross-fades as sections hand off — free, because it is
   a sticky element being displaced.

**Body text never animates on scroll. It is already printed.** No fade-up on rows,
no parallax, no scroll-jacking, and never a reveal on content that carries meaning.

### 9.3 The running head

Past 240px of scroll a `position: fixed` 44px running head fades in: split
wordmark at `m-label` left, section index right, 1px bottom rule. **The masthead
does not collapse and nothing in flow changes height** — this is an overlay, not a
reflow, so it contributes zero CLS. Driven by one IntersectionObserver on a
sentinel div (~8 lines, no scroll listener).

### 9.4 Hover and state — 120ms, no drama

- Index rows: `background-color` to `--paper-2`; the rail numeral lifts one ink
  step. **No cobalt on row hover.** No lift, no scale, no shadow.
- Buttons: 1px border to `--ink-1`; `.cta-primary` darkens 4% in L.
- Photographs: nothing changes on hover.
- Focus: instant, never animated.
- RSVP expands the row in place: `grid-template-rows: 0fr → 1fr`, 260ms. No modal,
  no overlay, no backdrop.

### 9.5 Reduced motion — architectural, not a patch

**Every animated property's final state is the default CSS; animations only
override it.** Therefore:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    animation-timeline: none !important;  /* scroll-driven animations ignore duration */
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}
```

yields a fully drawn, fully correct page with zero JS involvement and zero missing
content. Colour transitions are retained at 100ms because they are state feedback,
not motion. Nothing on the site depends on an animation having run.

---

## 10. Component law

### 10.1 The split wordmark

`QAIRU` in QH Display 600 at tracking -0.02em · a 1px `--rule-2` vertical hairline
with 8px each side · `HUB` in QH Mono 500 uppercase at tracking 0.08em, baseline
aligned. The parent is set in the family's sans, the student sibling in mono. No
mark, no SVG, no logo file. Never coloured.

### 10.2 The index row (RECORD)

Grid-aligned to the page columns. Rail: numeral or change-bar. Then: state token
(`m-label`), title (`d4` or `body 500`), one line of description (`small`,
`--ink-2`), mono meta with tabular figures, action link right. Hover lifts the row
to `--paper-2`. The whole row is a link via a stretched `::after`;
`:focus-visible` paints the ring on the row.

**There is no `.card` class in this codebase. The identifier is banned in review
and asserted against in `design-law.spec.ts`.** Grouping is hairlines and
whitespace.

### 10.3 Rules that carry data

- **Section label riding its hairline** (§5.5).
- **Capacity:** a 2px `--rule-strong` track beneath an event row, filled
  `--cobalt` to the real proportion, with `18 / 40 ОРЫН` in tabular mono beside it.
  Renders **only** when both a capacity and a live count exist; otherwise the row
  shows `ТІРКЕЛУ АШЫҚ` as text and no track. No progress bars, no meters, no
  badges.
- **The change-bar** (§8.2 #7).

### 10.4 Buttons and controls

- `.cta-primary` — §8.1.
- `.cta-secondary` — transparent, 1px `--rule-strong` border, `--ink-1` label, 4px
  radius, 44px. Hover: border to `--ink-1`.
- `.link-action` — bare text + `→`, permanent underline, cobalt on hover.
- Icons: the entire budget is four 1px-stroke glyphs — `arrow-right`, `chevron`,
  `external-link`, `close`. No icon library. No emoji, ever, anywhere.

### 10.5 Form fields

No boxes:

```css
border: 0;
border-block-end: 1px solid var(--rule-strong);
background: transparent;
block-size: 44px;
border-radius: 4px 4px 0 0;
```

Label above in `m-label` uppercase; helper in `small` `--ink-3`. Focus takes the
bottom rule to 2px `--cobalt` **and** applies the 2px cobalt outline at 3px
offset. Required marker: a `--cobalt-text` mono asterisk plus a visually-hidden
"required".

Errors: bottom rule to `--danger`; message in `m-note` `--danger` **in the rail**
as a margin note, wired with `aria-describedby` + `aria-invalid`. Nothing below the
field moves. Below 768px the message renders inline beneath the field. On failed
submit a form-level error summary appears above the first field and takes focus.

### 10.6 The inverting colophon

The footer always flips to the **opposite polarity of the page**: in dark mode a
light band (`oklch(0.955 0.004 85)` ground, `oklch(0.20 0.01 85)` ink — 15.9:1);
in light mode QAIRU's near-black inverted footer exactly. Cobalt inside the light
band uses the light-mode value (`oklch(0.50 0.20 255)`, 5.3:1 on the band).

It carries: the split wordmark, the numbered section index, contact, the language
switch, and one colophon line naming the parent — `QAIRUHUB · QAZAQ AI RESEARCH
UNIVERSITY · ASTANA`. No "built with", no font credits, no coordinates, no issue
number. It is the clearest structural quotation of the parent brand, and no dark
developer site ends on white.

---

## 11. The homepage, section by section

Above the fold contains **exactly two cobalt elements**: the `.cta-primary` and one
active-nav underline.

**§0 · MASTHEAD STRIP** — 32px, `m-label`, `--ink-3`, closed by a 1px rule. Left:
`QAIRU · ALMA-MATER OF AI ↗` (a real link to the parent university). Right: the
language switch `ҚАЗ / РУС / ENG`, active in `--ink-1` with a 2px cobalt
underline. Nothing else. No clock, no coordinates, no date.

**§1 · NAMEPLATE** — the split wordmark at `d1`, flush to column 2. Right-aligned
on the same block, the motto stacked in `m-label` uppercase, three lines, authored
per language:
`ҮЙРЕН. / ЖАСА. / ІСКЕ ҚОС.` — `УЧИСЬ. / СТРОЙ. / ЗАПУСКАЙ.` — `LEARN IT. / BUILD
IT. / LAUNCH IT.`
Closed by the 2px `--rule-2` — one of only two 2px rules on the page.

**§2 · SECTION INDEX** — seven items in `m-label` uppercase with hairline
verticals, each prefixed by a two-digit numeral in `--ink-3`:
`01 БАҒДАРЛАМАЛАР · 02 ІС-ШАРАЛАР · 03 ЖОБАЛАР · 04 ОҚУ · 05 АДАМДАР · 06 ХАРТИЯ ·
07 БАЙЛАНЫС`. Active: numeral cobalt plus a 2px cobalt underline under the label
only, not the cell. Below 768px this becomes the index sheet (§6.5). **Measure this
row in Kazakh at 1280px before it ships.**

**§3 · THE FOLD — 7 / 1 / 4**

*Cols 2–8 — THE LEAD.* Deck at `d2`, three authored lines, naming a concrete dated
fact — the open intake and its close date, or the next thing shipping. Not a
manifesto. Beneath it a standing 80–100 word statement at `lead`, **single column,
62ch**, saying what QairuHub is, who it is for, and explicitly that no prior
experience is required. One `.link-action` at the end.

*Col 9 — EMPTY*, with a `column-rule` hairline. The page breathes on a line.

*Cols 10–13 — THE DESK.* A real `<ol>` of live facts, hairline-separated, ordinal
in `m-eyebrow` in a 20px hanging indent. **The order is the conversion ladder,
lowest commitment first:**

1. `КЕЛЕСІ ЖҰМА` — the next AI Friday: date, time, room, and `КІРУ ЕРКІН —
   ӨТІНІШСІЗ` (walk in, no application). This is the door for someone who is not
   sure yet, and it is item one.
2. `ӨТІНІШ` — the open intake, its close date in tabular figures, and the page's
   single `.cta-primary`. If nothing is open: `ЖАБЫҚ · КЕЛЕСІ ҚАБЫЛДАУ <label>`
   plus a waitlist link. **It never fakes availability.**
3. The most recently shipped project.
4. The latest AI Fridays note.

Anything updated in the last 7 days carries a change-bar. If only two items are
live, the desk is two items long. It is never padded.

Closing the fold: a 1px rule with `01 — БАҒДАРЛАМАЛАР` riding it.

**§4 · THE PLATE** — full-bleed right, 16:9, immediately below the fold. People
building. Full colour, 1px border, mono caption. This is the page's single
grid-break and its only source of colour.

**§5 · 01 — БАҒДАРЛАМАЛАР (RECORD).** Four rows, one per programme. Rail numeral
01–04. Cols 2–3: a mono meta stack — cadence, commitment, cohort size, next intake,
all tabular. Cols 4–8: the name at `d3` plus two sentences. Cols 9–11: the entry
requirement stated plainly (`Кез келген факультет. ML тәжірибесі қажет емес.`) and
three outcomes as a mono hanging list. Cols 12–13: the state token and the action.
A programme with no open intake shows `ЖАБЫҚ` in `--ink-3` and no CTA.

**§6 · 02 — ІС-ШАРАЛАР (RECORD).** The next three events as diary rows. Date in the
rail as an oversized figure (day at `dn`, month beneath in `m-label`). Capacity
rule where real. RSVP expands the row in place. `→ БАРЛЫҚ ІС-ШАРАЛАР`.

**§7 · 03 — ЖОБАЛАР (RECORD).** The six most recent registry rows. `→ ТІЗІЛІМ`.

**§8 · 04 — ЖҰМА ЖАЗБАЛАРЫ (RECORD / READ).** Three latest notes.

**§9 · 05 — АДАМДАР.** A strip of six portraits at 56×72, full colour, 1px border,
radius 0, name in `body 500` and role in `m-label` beneath each, then `→ БАРЛЫҚ
АДАМДАР`. Faces at rest, not on hover.

**§10 · COLOPHON** (§10.6).

---

## 12. Page archetypes

Every route is one of these five. A new page type requires a design decision.

### 12.1 INDEX (events, projects, people, learn, programmes)

Masthead → eyebrow + `d3` head + one `lead` sentence saying what this index is →
**PLATE** (full-bleed right) → filter/sort bar (mono chips; the only React island,
`client:visible`) → RECORD table spanning cols 2–13 → pager (mono `1 2 3 … 9`; no
infinite scroll, no skeletons).

Rows are static HTML: 300 projects cost no JS. Filter state lives in the URL
(`?stage=launched&sort=started:desc`), server-rendered on first paint, so a
filtered view is a shareable link and the no-JS view still renders the full sorted
table. Sort indicators are `↑ ↓` mono glyphs. Below 768px → slips (§6.5). Under 3
entries → READ (§7.4).

### 12.2 DETAIL (project, event, person, note, programme)

Rail carries the section numeral and the change-bar. Cols 2–9: `d3` title, a mono
meta line (dates, state token, team as links), then READ body at 68ch. Cols 11–13:
a sticky spec table in mono (stack, repo `↗`, demo `↗`, programme, team). One PLATE
at 4:3 in cols 2–9. Foot: `ҚАТЫСТЫ ЖАЗБАЛАР` — cross-references computed at build
time from content-collection `reference()` fields, rendered as a hairline list. A
dangling reference fails the build.

### 12.3 FORM (apply, RSVP, contact)

**Register: plain and human. Not "the instrument", not "ФОРМА 01".** The page is
headed `ӨТІНІШ / ЗАЯВКА / APPLY` at `d3` with one `lead` line stating the entry bar
and the time cost: *"~6 минут. Тәжірибе қажет емес. Жауап 5 жұмыс күні ішінде."*

- Fields in cols 2–8, single column, §10.5.
- Cols 10–13: a sticky mono list `01 ЖІБЕРУ · 02 ОҚИМЫЗ · 03 ӘҢГІМЕ · 04 ЖАУАП`,
  each with one line saying what actually happens and when. Current step cobalt.
  This is the most direct quotation of QAIRU's numbered step list on the site.
- Multi-step progress is `01 · 02 · 03 · 04` in the rail, current step cobalt. No
  progress bar.
- Turnstile is a normal field row, not a floating widget.
- **The receipt.** On success the page does not toast and does not redirect to a
  generic thank-you. It becomes a receipt: the rail carries the reference number,
  the well carries one mono line — `ҚАБЫЛДАНДЫ · QH-APP-0217 · 2026-09-06 14:32` —
  the applicant's name, what they applied to, and the four steps with 01 struck
  through. Beneath it one line on what to do meanwhile: come Friday, room and time.
  No illustration, no checkmark graphic, no confetti.

### 12.4 DOC (charter, governance, process)

READ register. Numbered clauses `1.` / `1.1` / `1.1.1` with mono clause numbers
hanging into the rail. Version and ratification colophon at the head (`v1.2 ·
РАТИФИКАЦИЯЛАНҒАН 2026-04-18`). A revision table at the foot: version, date, what
changed, who — from `updatedDate` and a `revisions` array. Change-bar in the rail
against every clause amended in the last 7 days. FAQ items use native `<details>`;
nothing else on the site accordions. A real print stylesheet — light polarity,
black rules, page numbers — because the charter must print as a document.

### 12.5 404 / EMPTY

Left-aligned on the rail like everything else. `d3` `МҰНДАЙ БЕТ ЖОҚ.`, the
requested path echoed in `m-data`, and the four most recent live facts from THE
DESK beneath it. No centring, no illustration.

---

## 13. Content model requirements

These changes to `src/content.config.ts` are **required by the design** and must
land before the components that consume them.

**All collections**
- `lang: z.enum(['kk','ru','en'])` — required.
- `translationKey: z.string()` — links the three language versions of one entry.
- `updatedDate: z.coerce.date().optional()` — currently only on `posts` and `docs`;
  the change-bar marks events, projects, people and learn too and has no data
  source without it.

**`programs`** — add `commitment: z.string()` (e.g. `"4 сағат/апта, 8 апта"`),
`requirements: z.string()` (the entry bar, stated plainly), `cohortSize:
z.number().int().optional()`, `intakeCloses: z.coerce.date().optional()`. The row
renders `ЖАБЫҚ` and no CTA when `intakeCloses` is absent or past.

**`events`** — add `capacity: z.number().int().optional()`, `room: z.string()`,
`walkIn: z.boolean().default(false)`. The capacity rule renders only when
`capacity` **and** a live RSVP count from D1 both exist.

**Images** — whenever `cover` is set, `coverAlt`, `coverCaption` and `coverCredit`
become required (`superRefine`). A PLATE without a caption and a credit fails the
build.

**Language rule** — never mix languages inside one viewport. Every string in a
rendered page comes from the same `lang`. A missing translation renders a mono line
offering the language that exists — never a machine translation, never a
half-translated page.

Routes: `/` = `kk`, `/ru/`, `/en/`. `hreflang` on every page.

---

## 14. Accessibility floor

- Nothing below 11px anywhere. 11px mono is `--ink-2` or brighter — never
  `--ink-3`, never `--ink-4`.
- `--ink-4` (4.1:1) is permitted **only** at ≥24px and for non-essential marks.
- Any 1px line that is the sole boundary of an interactive control uses
  `--rule-strong` (3:1). Decorative hairlines may be `--rule`.
- Cobalt text ≤13px uses `--cobalt-text` (8.4:1). `--on-cobalt` is ink, never
  white, in dark mode (5.2:1 vs 3.7:1).
- Focus ring on everything, always visible, never restyled away.
- Every cobalt state is doubled by a word or a shape.
- Hit targets and rows ≥44px.
- Decorative rules, ticks and the spine are out of the accessibility tree.
- Tables are real `<table>` with `<th scope>`; slips keep the same DOM.
- Reduced motion yields a complete page with zero missing content (§9.5).
- The index sheet traps focus and returns it on close.
- Test on a cheap Windows laptop at 125% and 150% scaling and on one low-end
  Android panel — not only on a MacBook. Hairlines and 11px mono fail there first.

---

## 15. Performance budget

- **LCP < 1.8s**, and the LCP element is text (the nameplate/deck). Nothing above
  the fold is an image. The load animation touches `translateY` only, never
  opacity, on the LCP text.
- **< 100KB JS on content routes.** The only islands are the index filter/sort
  (`client:visible`), the RSVP expander and the apply form. The running head is ~8
  lines of vanilla JS on an IntersectionObserver. There is no countdown, no ticker,
  no clock and no count-up, so there is nothing else to hydrate.
- Fonts: self-hosted `woff2`, subset per `unicode-range`, `font-display: swap`,
  preload the two faces used above the fold (display 700 for the current language,
  mono 500). Every face gets a metric-matched local fallback
  (`size-adjust` / `ascent-override`) so swap costs no layout shift. **Fonts, not
  scripts, are the LCP risk here.**
- Zero CLS: the running head is an overlay, nothing in flow changes height, images
  carry intrinsic dimensions.
- No third-party embeds. Cloudflare Web Analytics only.

---

## 16. Anti-slop checklist — tailored to THIS direction

Run on every changed page, at 375 / 768 / 1440, in both themes, in Kazakh. These
are the specific ways *Night Edition* goes wrong.

**Newspaper cosplay** (this direction's dominant failure mode)
- [ ] No GPS coordinates, no live clock, no folio numbers, no issue numbers, no
      `ВЫПУСК`, no `МАСШТАБ`, no revision number for a page that has none.
- [ ] No drop cap. No `column-count`. No serif anywhere. No paper texture, no
      sepia, no torn edges, no ruled-notepad kitsch.
- [ ] No colophon preciousness — no "Set in Space Grotesk", no "Built in Astro".
- [ ] Every mono string is a fact you could check. If it is not, delete it.

**Card drift** (the pressure the hairlines create)
- [ ] Zero `card` identifiers. Zero elements using border + radius + padding as a
      grouping device.
- [ ] The fix for a faint hairline was `--rule-strong` — not a tint, not padding,
      not a radius.
- [ ] Mobile slips have no border and no radius.
- [ ] No section is three equal blocks in a row. No section is 6/6.

**Cobalt drift**
- [ ] ≤1 `.cta-primary` on the page; ≤2 cobalt elements above the fold.
- [ ] No cobalt in a headline, deck, section head, the wordmark, a rail numeral, or
      any idle rule.
- [ ] No `oklch(... / 0.0x)` cobalt tint anywhere.
- [ ] Every cobalt state is doubled by a word.
- [ ] `check-cobalt.mjs` and `design-law.spec.ts` both pass.

**The rail**
- [ ] The rail carries something on every screen where it exists.
- [ ] No body text in the rail. No rotated type in the rail.
- [ ] Change-bars appear only where `updatedDate` is genuinely within 7 days.

**Photography**
- [ ] Exactly one PLATE on this page, and it is not the LCP element.
- [ ] Full colour at rest. No grayscale, no filter, no overlay, no text on top.
- [ ] Caption, alt and credit present. Subject is real and happened here.
- [ ] Across the site, ≥50% of PLATEs show faces.

**Audience** (the failure that nearly disqualified this direction)
- [ ] Apply is above the fold and it is the page's one cobalt fill.
- [ ] The walk-in door (next AI Friday, room, "no application") is item 01 of the
      desk — above the application.
- [ ] The entry bar is stated in words a first-year believes ("no ML experience
      required"), on the homepage and on every programme row.
- [ ] The apply page states time cost and reply window before the first field.
- [ ] The form does not use `ФОРМА`, `ИНСТРУМЕНТ`, `РЕГЛАМЕНТ`, or any register a
      student associates with being rejected.
- [ ] There are faces on this page or one click away.

**Trilingual**
- [ ] One language per viewport. No mixed-script chrome.
- [ ] The deck's line breaks were authored, not wrapped.
- [ ] The section index row fits in Kazakh at 1280px.
- [ ] `/dev/glyphs` shows no `.notdef` and cap heights match within 1%.
- [ ] Cyrillic eyebrows are 12px at 0.10em, not 11px at 0.14em.

**Thin content**
- [ ] No index with 1–2 entries is rendering as a table with column headers.
- [ ] No placeholder rows, no skeletons, no shimmer, no invented counts.
- [ ] Empty sections say `ӘЛІ ЖАРИЯЛАНБАҒАН` — not nothing, and not a fake.

**Motion**
- [ ] Nothing loops. Nothing animates on scroll except section rules.
- [ ] Nothing travels more than 8px. Nothing scales.
- [ ] With `prefers-reduced-motion: reduce` the page is complete and correct.

---

## 17. Build order

1. Tokens, `/dev/kitchen-sink`, `/dev/glyphs`, and the font architecture (§5.2).
   Nothing else starts until Kazakh renders correctly at every size.
2. The `<768px` layout — rail off, slips, the index sheet. Mobile first, literally.
3. The grid shell, rail, spine, eyebrow-on-rule, colophon.
4. The RECORD row, the PLATE, the READ layout.
5. Homepage.
6. Index / detail / form / doc archetypes.
7. `check-cobalt.mjs` and `design-law.spec.ts` wired into `pnpm check`.

`pnpm check` must pass. Screenshot every changed page at 375 / 768 / 1440 in both
themes and run §16 before calling anything done.
