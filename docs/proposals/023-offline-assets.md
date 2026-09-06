---
title: Print one A3 from the site's own tokens
status: draft
area: design
effort: S
depends_on: [019, 020]
---

# 023 — Print one A3 from the site's own tokens

| | |
|---|---|
| **Status** | draft |
| **Area** | design |
| **Effort** | S for phase 1. Everything else is deliberately not phase 1. |
| **Depends on** | **019** — the plate variant of the poster cannot be drawn until a photograph exists. **020** — Open Graph images are that proposal's subject; an earlier draft of this one claimed them as a by-product, which was scope theft. **024** decides whether a wordmark *file* exists; the poster sets the wordmark as type (§10.1) and does not wait for it, but the sticker would. |

## Problem

Nobody finds a student club by typing `qairuhub.com`. They find it on a
noticeboard between the lift and the lecture theatre. QairuHub has nothing to
put on that board.

The default answer — somebody opens Canva an hour before the session — fails
predictably. On **identity**: `docs/DESIGN.md` §16 bans most of what a template
library is made of, and a hairline-and-grid system dissolves faster than most,
because its rules are subtractive and invisible. On **type**: Onest and Geist
Mono are the institutional voice and neither is in a stock picker. On
**succession**: the file lives in one student's personal account, and that
student graduates.

The site already has the system — tokens in `src/styles/global.css`, a light
polarity that is QAIRU's own paper (§4.2), fonts verified against the Kazakh
letters, a lint that enforces the accent, a Playwright suite that enforces the
components. It has no way to get any of it onto paper.

## Prior art

**[NYCTA Graphics Standards Manual](https://standardsmanual.com/products/nycta-graphics-standards-manual-full-size-edition)** (Vignelli
and Noorda, Unimark, 1970; 356 pages in the full-size reissue). A binder
dimensioning every sign, hook and flange so a contractor who never met the
designer produces the right object. *Steal:* an offline identity survives
through specification, not taste, and the specification names measurements.
*Leave:* 356 pages. A volunteer reads one.

**[Romek Marber's Penguin grid](https://romekmarber.com/portfolio/penguin-grid/)**
(1961). One grid with fixed zones — colophon and series band, title, author,
then two-thirds of the cover for the image — that let dozens of illustrators
produce a coherent series. *Steal:* fixed zones holding fixed information, so
filling it in wrongly is hard. *Leave:* the golden-section derivation; a second
proportional system would guarantee the poster and the site disagree.

**[Josef Müller-Brockmann for the Zurich Tonhalle](https://collections.vam.ac.uk/item/O110243/musica-viva-poster-josef-muller-brockmann/)**
— the V&A holds the *Musica Viva* sheet of 8 January 1959, one of a long series
under a single grid and a single sans. *Steal:* a series reads as a series
because its *structure* repeats, not its picture; that is the only way a
template survives a change of author. *Leave:* the geometry. He drew rectangles
because he had no photograph; we have a mandatory PLATE (§7.2), and substituting
abstract shapes for it breaks the one rule §3.4 calls non-optional.

**[Paged.js](https://pagedjs.org/)** and its
[web-design-for-print documentation](https://pagedjs.org/en/documentation/5-web-design-for-print/).
A CSS Paged Media polyfill that genuinely implements `bleed` and `marks: crop`,
which bare Chrome print does not. *Steal:* the vocabulary, and the whole
pipeline on the day there is a multi-page document to set — §12.4 already
promises the charter prints as one. *Leave:* the dependency, for now.
`pagedjs-cli@0.4.3` (MIT, last published 2025-09) pulls `puppeteer@^20`, which
downloads a **second** Chromium; Playwright's is not reused. A single-page
poster has nothing to paginate.

**[Hack Club's assets repo](https://github.com/hackclub/assets)** and
[brand page](https://hackclub.com/brand). A student organisation's logos, fonts
and colours in git behind a CDN, so a chapter is never blocked by whoever owns
an account. *Steal:* assets in version control, changed by pull request,
outliving their authors. *Leave:* the permissiveness — a hero colour and a
downloadable logo file. We have no logo file (§10.1: the wordmark *is* CSS).

**[ECI's profile downloads](https://eci.org/doku.php_id=en_downloads.html)**.
*Steal:* nothing yet. *Leave:* the entire question. The page itself says the
superseded profiles are kept only to open older files — so ISO Coated v2
(FOGRA39) is not even the current recommendation; PSO Coated v3 is. Which means
the honest move for forty sheets is to ask the Astana shop what their RIP runs,
not to pick a profile from a German standards body and hope.

## Proposal

**One A3 recruitment poster, rendered from the Astro repo by the Playwright
Chromium that is already installed, from the same tokens as the site.** No new
dependency. Not Figma, not Canva.

*Why not a design tool.* Canva's and Figma's education terms change quarterly
and are not worth citing, because the disqualifying argument does not depend on
them: neither tool holds the tokens, the fonts, the eyebrow grammar, the Kazakh
coverage check or the cobalt lint, and neither survives the student who owns the
account. All of that already passes CI here. A poster built in the repo inherits
it, is reviewed as a diff, and is reissued next term by editing one date. Figma
stays useful for sketching a layout; it is not where the artefact lives.

*Why not Paged.js yet.* One page needs no pagination, running heads or page
numbers, which is most of what Paged.js adds. Trim marks on a single sheet are
four pairs of hairlines on an oversized page box — 303 × 426mm for a 297 × 420
trim with 3mm bleed. `page.pdf({ preferCSSPageSize: true })` is in the installed
`playwright-core@1.63.0` and renders with `print` media, so `scripts/press.mjs`
is a near-copy of `scripts/shots.mjs`, which a volunteer can already read.

Two Chromium behaviours the script must set explicitly, or the poster is subtly
wrong and nobody notices until it is on a wall:

- `page.pdf()` "generates a pdf with modified colors for printing" by default —
  Playwright's own words. `print-color-adjust: exact` on the press root, or the
  one cobalt mark and the hairlines come back altered.
- `Base.astro` hardcodes `<html lang="en" dir="ltr">` with no `data-theme`. The
  press route needs both: `data-theme="light"` so the day edition is
  deterministic rather than inherited from whichever machine ran the build, and
  a real `lang` so `:lang()` rules can ever match.

## Scope

**Phase 1 — one poster, one language, no photograph.**
`src/pages/dev/press/a3.astro` passing `noindex` to `Base.astro` (the same
device `dev/glyphs.astro` uses; `astro.config.mjs` already filters `/dev/` out
of the sitemap); `src/styles/press.css` imported by that route alone and never
from `global.css`, so it adds no bytes to any content route; `scripts/press.mjs`
writing one PDF to `dist-press/`; the `/board` landing route. Then a physical
proof on the actual shop's press before a second copy is printed.

*One language, and it is English.* `src/lib/site.ts` ships
`LOCALES = [{ code: 'en', published: true }]` — there is no Kazakh or Russian
page on this site. A Kazakh poster would be the first Kazakh string set on the
project, unproofed, pointing a Kazakh reader at an English site: it breaks §13's
language rule at the artefact boundary rather than inside a viewport, which is
worse, not better. An English A3 in an Astana corridor is a compromise. It is
the site's compromise, and the poster should not be where it gets papered over.
The poster turns Kazakh the day `LOCALES` does, and that is a one-line change
because the deck is an authored line array either way.

**Later, and only after phase 1 has been on a wall for a term:** the A5
handbill, the sticker strip, the slide template. Each is a separate decision
with its own evidence, not a checkbox on this one.

**Not proposed.** Open Graph images — that is 020, and this proposal has no
business claiming them. A zine, merchandise, a roll-up banner. And **no round
sticker**: a 50mm disc containing the wordmark is a badge, and a badge is a
logo mark by a different route (§10.1 — no mark, no SVG, no logo file). If a
sticker ever ships it is the 65×18mm strip, which is the wordmark set as type on
a rule — a nameplate, not an emblem.

## Data and schema

Thin — no D1 migration. Poster content comes from existing collections: the next
`events` entry supplies date, `room` and `walkIn`; `programs` supplies
`intakeCloses`.

**Both `room` and `intakeCloses` are `.optional()` in
`src/content.config.ts` today** (§13 asks for `room` to be required; the code
disagrees and this proposal does not fix that). So `src/lib/press.ts` — the one
new module, holding trim size and QR target so the script and the route cannot
diverge — **refuses to build the poster when the room or the date is missing**.
A poster reading `AUD ___` is worse than an empty board.

**Attribution: a page, not a redirect.** A `/go/board` 302 to `/events` would
measure nothing. Cloudflare Web Analytics is a **JavaScript beacon**, and a 302
executes no JavaScript: the redirect records zero pageviews and `/events`
records an ordinary one. So `/board` is a real route: `noindex`,
`<link rel="canonical" href="/events">`, rendering the next
event and the walk-in line, one link onward. The beacon fires on a distinct path,
no query string, no pixel, and the reader lands somewhere that answers the
question the poster raised.

## Design

**Polarity, and how it is obtained.** The poster is the **day edition** —
on-concept (§4.2: light is QAIRU's own paper) and practical, since a full-bleed
near-black A3 on a student-budget digital press costs more, curls, and scuffs
white at every corner. It is not obtained by restating tokens. The press route
sets `data-theme="light"`, and `global.css` already defines the whole light
palette under `:root[data-theme="light"]` unconditionally. Nothing is copied,
and the build does not change meaning on a reviewer's dark laptop.

**One deliberate override, named.** Light `--ink-1` is `oklch(0.2 0.01 85)` —
a *warm* near-black, which is a decision about a glowing panel. On paper it
separates into four inks and small type comes back fringed. So `press.css`
carries exactly one token override, `--ink-1: #000`, with that sentence as its
comment. Paper supplies the warmth; the ink does not have to. Any second
override is this proposal failing.

**Grid.** `press.css` re-declares the *shell* in millimetres — not the tokens:
`--press-rail: 24mm`, `--press-gutter: 4mm`, 18mm outer margin,
`grid-template-columns: var(--press-rail) repeat(12, minmax(0, 1fr))`. On A3
that is a 261mm measure containing a 233mm well and a 15.75mm column
(261 − 24 rail − 48 of gutters = 189 ÷ 12). The rail's `border-inline-end` is
the spine, as on screen; nothing crosses left of it, and per §6.1 it is never
empty — it carries the section numeral and the date, nothing else.

The split is **7 / 1 / 4**, the homepage's own (§11 §3): deck and desk in cols
2–8, **col 9 genuinely empty carrying a `column-rule` hairline** — §6.3 rule 1
requires it, and it is the first thing a poster layout loses — then plate or
foot in cols 10–13. One block bleeds right, never left.

**Rules and type.** A 0.25pt hairline is 0.09mm and a 600dpi toner press drops
it in patches, so the minimum printed rule is **0.5pt (0.18mm)**: the site's 1px
maps to 0.5pt, its 2px rule to 1pt. Print scale in `press.css`: `p-d1`
108pt/0.90/-0.03em (nameplate), `p-d2` 34pt/0.98 (deck), `p-d4` 15pt (desk
title), `p-m-eyebrow` 7.5pt/0.14em, `p-m-data` 9pt, `p-m-foot` 11pt. **Nothing
below 7pt.** Legibility is specified by distance: the deck reads at 2m, the desk
at 1m, the QR block at 0.5m.

**The overflow gate.** `scripts/check-press-overflow.mjs` loads the press route
in the Playwright browser already installed and fails when a zone's
`scrollHeight` exceeds its `clientHeight`. It earns its place before any second
language exists, because a long event title overruns a fixed A3 zone exactly the
way a Kazakh deck will. When Kazakh does land, §5.4's step-down applies in print
— `:lang(kk) .p-d2 { font-size: 30pt }`, eyebrows 8pt/0.10em rather than
7.5pt/0.14em — and decks stay authored line arrays, never machine-wrapped.

**Cobalt: one mark, and it is not a fill.** Cobalt is ink for the live layer —
things that respond, or things that changed (§8). **On paper nothing responds.**
A solid cobalt block carrying a URL is a button that cannot be pressed: a fill
with no interaction behind it, which is the definition of decoration wearing
data's clothes. It is cut. The URL sets in `p-m-foot` in `--ink-1`, where it
belongs.

What survives is §8.2 #7's precedent: the change-bar is "the one editorial,
non-interactive use, and it carries provenance". A poster's dated fact is that
layer. So **one cobalt mark per sheet** — the state token
`WALK IN — NO APPLICATION`, set at 9pt or larger so a four-colour build cannot
fringe it. Because the mark is a sentence rather than a swatch, it still reads
off the photocopy somebody makes of the poster, which is the real §8.3 test.

It reuses the existing class name `.state--live`, so `scripts/check-cobalt.mjs`
takes **one** edit — `'src/styles/press.css'` into `STYLE_FILES` — and
`ALLOWED_SELECTORS` does not grow: it is matched as a substring against the
enclosing selector, and `.state--live` is already on it. `FORBIDDEN` is
untouched, so no cobalt gradient, glow, shadow or wash can enter through the new
file. `tests/e2e/press.spec.ts` asserts exactly one cobalt-carrying element on
the press route, and zero `.cta-primary`.

**The QR.** 40 × 40mm with the mandatory 4-module quiet zone
([ISO/IEC 18004:2024, via a practitioner summary](https://qrlynx.com/blog/qr-code-design-best-practices)).
Target `qairuhub.com/board` — short enough to encode at version 3 or below, so
with the quiet zone the module is at worst 40 ÷ 37 ≈ 1.08mm. The same source
calls the familiar 10:1 distance ratio a planning shortcut, "not a decoding
guarantee", so treat what follows as a starting point rather than evidence:
400mm, arm's length at a board; hang the sheet with the QR near 1.4m, then
**scan the printed proof from 400mm before the run**. Beneath it the URL in `p-m-foot` —
the code is never the only way in. It prints `--ink-1` on `--paper`, never
cobalt: scanners want maximum luminance contrast.

**The plate.** §7.2 wants one PLATE at 16:9 bleeding right, with its mono
caption and credit — those are required content fields on paper too, not a
website formality. **Phase 1 cannot draw it**: there are no photographs (019),
and `Plate.astro`'s hatched "awaiting photography" frame is honest on a website
and absurd on a wall. So phase 1 ships the no-photograph variant — a designed
one-column type poster at `p-d1` with the desk running full width, which is
§7.4's thin-content law applied to paper. The plate variant is drawn the week
019 delivers a frame, and not before.

**§16, on the poster specifically.** No folio, no issue number, no `ВЫПУСК`, no
`МАСШТАБ`, no "Set in Onest", no "Built with Astro" — a poster foot is the
single likeliest place that creeps in. Every mono string on the sheet is a fact
someone could check; a mono label that decorates is deleted. Radius 0 on
everything, since containers are rules. No three equal blocks in a row.

## Risks and trade-offs

**The strongest argument against doing this at all.** There is one volunteer,
and three proposals compete for the same evenings. 019 fills nine hatched
placeholder frames — the largest element on nine routes is currently a stripe
pattern. 020 fixes the share card, and every link forwarded into Telegram today
lands as a grey system-font stub: same audience, no paper, no logistics, no
shop, and it reaches the group chat that already exists rather than a corridor
that might. On reach per evening both beat a poster.

Worse, the poster points at the site. A stranger scans a QR in a corridor and
arrives at a page whose photography is a hatch pattern and whose only language
is English. **Printing the invitation before the room is finished is the actual
risk here**, and the honest sequencing is 019, then 020, then this. The counter
— and it is a real one — is that a term's recruitment happens on a date, the
board is where a first-year who has never heard the name looks, and phase 1 is
three evenings. If it slips behind 019 and 020 it should slip, not shrink.

**Nobody maintains it.** Mitigation: a named **Press Steward** per term in
`docs/CONTENT.md`, and reissuing being `pnpm press` after editing one event
entry — not a design act. This is why the proposal is one poster and not a kit:
six things nobody owns rot faster than one.

**It may not be the channel.** Corridor boards may be ignored. `/board` exists
so that is measurable rather than believed — see the removal criterion.

**CMYK.** The relevant cobalt is the **day** token, `oklch(0.50 0.20 255)` =
`#005dd1`, not the dark `#0c84fa` — a distinction easy to get wrong on an asset
that prints light. A blue at this chroma sits outside FOGRA-class CMYK either
way and comes back duller and more violet than the screen, and a generic
RGB→CMYK pass turns black into a four-colour black that misregisters as fringed
grey type. With the fill cut, the exposure is one small mark. The
recommendation is to **not solve this**: hand the shop the sRGB PDF and let
their RIP convert — digital presses do this well — and print type in flat `#000`
so a K-only path exists. Revisit only at offset volumes, and then by asking the
shop, not by picking a profile.

**Chromium is not a RIP.** No overprint, no spot colour, no PDF/X. If those are
ever needed the answer is the shop's prepress, not a hack in `press.mjs`.

**A second stylesheet is a second place to drift.** `press.css` declares layout
in millimetres and exactly one token override (above). Every colour, every
family, every radius comes from `:root`. A second copied value means this
proposal failed.

## Success

- The A3 is on ≥4 boards within two weeks of merge, and one printed sheet has
  been scanned from 400mm before the run.
- `/board` records ≥25 beacon pageviews in a term.
- The next term's steward reissues the poster with a one-line content change and
  no design decision.
- `pnpm check` still passes with `press.css` in `STYLE_FILES`, and
  `ALLOWED_SELECTORS` has not grown.
- **Remove it if:** two terms pass with <10 visits while walk-in attendance is
  healthy. Then the corridor is not the channel: delete the route, the
  stylesheet, the script and the one lint entry. All four are removable in a
  single commit, which is a deliberate property of this scope.

## Effort

**S.** About three evenings: `press.css` and the A3 route; then
`scripts/press.mjs`, the QR and `/board`; then the overflow gate, the one lint
edit and a physical proof. **No new dependency** — `@playwright/test@1.63.0` is
already installed and `page.pdf({ preferCSSPageSize: true })` is in its types.
No paid tool, no runtime cost, nothing added to any content route's bundle.

Paged.js becomes worth its dependency the day a multi-page document needs
setting — §12.4's charter. That is a different proposal.
