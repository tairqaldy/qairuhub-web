---
title: Run accessibility as a standing practice, not a one-off audit
status: draft
area: platform
effort: M
depends_on: []
---

# 028 — Run accessibility as a standing practice, not a one-off audit

| | |
|---|---|
| **Status** | draft |
| **Area** | platform |
| **Effort** | M |
| **Depends on** | — |

## Problem

Of the nine per-route assertions in `tests/e2e/design-law.spec.ts`, four touch
accessibility. They run on all eleven routes at three viewports, which sounds
like coverage. Each proves less than its name suggests.

- `gives every image alternative text` filters on `!image.hasAttribute('alt')`.
  `alt=""` passes, and so would `alt="image"`. **1.1.1** is about equivalence,
  and no machine has ever checked equivalence. `docs/DESIGN.md` §8.4 describes
  this guard as "every `<img>` has non-empty `alt` and a sibling
  `<figcaption>`". It checks neither. The document is ahead of the code.
- `has a reachable skip link as the first focusable element` presses Tab once
  and reads `activeElement.className`. It never presses Enter, so it does not
  prove **2.4.1 Bypass Blocks** lands focus in `#main`.
- `exposes exactly one h1` says nothing about whether h2 and h3 descend in
  order — **1.3.1**.
- `bounds form controls with a 3:1 rule` compares a border colour to
  `--rule-strong`. That proves the token is applied, not that it is 3:1 against
  the surface behind the control — and row hover raises that surface from
  `--paper` to `--paper-2` (**1.4.11**). §4.2 puts light `--rule-strong` at
  3.1:1; there is a tenth of a point of headroom and nothing measures it.

And the whole suite runs in one theme. `playwright.config.ts` defines three
projects — `desktop`, `tablet`, `mobile` — all Chromium, none setting
`colorScheme`. §8.4 says these assertions run "in both themes". Dark is the bare
`:root` default, so every test has only ever seen dark. The light palette, which
§4.2 calls a component gate rather than a variant, is rendered by
`pnpm shots` and asserted by nothing.

Nobody has run a screen reader here. Keyboard-only navigation has not been
walked end to end. Every ratio in §4 is computed — the right way to *set* a
palette and a poor way to *trust* one: 5.4:1 cobalt on a warm near-black ground
behaves differently on a 1366×768 panel in a lit lab than it does in a formula.

The source turns up five defects the suite cannot structurally see:

1. **`#index-sheet`** (`Masthead.astro:124`, script at `:283–342`) traps Tab,
   closes on Escape and returns focus — and has no `role="dialog"`, no
   `aria-modal="true"`, no accessible name, and never makes the rest of the
   document `inert`. The word "inert" appears in the file exactly once, in a
   comment. A trap that holds Tab does not hold a virtual cursor: in NVDA browse
   mode the arrows read straight past the open sheet into the masthead behind
   it. The
   [APG modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
   requires all three.
2. **`ErrorSummary`** (`form-kit.tsx:250–256`) puts `role="alert"` and
   `tabIndex={-1}` on the *same* `<div>` and focuses it on mount. The live region
   fires, then the focus move reads the same subtree again.
3. **`ThemeToggle.astro:11`** puts `aria-live="polite"` on the button itself; a
   live region on the focused control re-announces the whole button on every
   press. **4.1.3** wants a status message, not a talking control.
4. **`#main` is not focusable.** `Base.astro:97` is a bare `<main id="main">`,
   and `Base.astro:93` is the skip link that targets it. Browsers mostly handle
   a fragment jump to a non-focusable target by moving the sequential navigation
   start point, which is not the same as moving focus and has never been
   uniform. `tabindex="-1"` on `#main` is the one-attribute fix, and it is
   exactly what the skip-link assertion above does not check.
5. **`forced-colors` appears nowhere in `src/`.** Windows High Contrast forces
   every `border-color` to one system colour, erasing §4.4's distinction between
   decorative `--rule` and structural `--rule-strong`. On a design whose only
   structure is hairlines, that is not a cosmetic loss.

None is exotic. All five would have surfaced in twenty minutes of a
keyboard-and-NVDA pass that has never happened.

## Prior art

**W3C, *WCAG 2.2* (Recommendation)** — <https://www.w3.org/TR/WCAG22/>.
*Steal:* criterion numbers as shared vocabulary, so a finding is "4.1.3" and not
"the announcing thing". *Leave:* the assumption that 2.2's new criteria are
where the work is. Checked one at a time against this codebase, they mostly are
not:

- **2.4.11 Focus Not Obscured (Minimum), AA** — engaged by the sticky running
  head, which §9.3 specifies and **nothing implements**: `IntersectionObserver`
  appears nowhere in `src/`. A live concern for 022, not for today.
- **2.5.8 Target Size (Minimum), AA** — 24×24 CSS px. The "mono filter chips"
  do not exist; the only hydrated islands are `ApplyForm` (three routes) and
  `RsvpForm`. Every `↗` in the source is an `aria-hidden` span *inside* a link,
  so it is not a target at all, and inline targets constrained by line-height
  are excepted regardless. §14 already floors hit targets at 44px.
- **3.3.7 Redundant Entry, A** — about not re-asking within a *process*. Every
  form here is one step and one submission, and `name`/`email` already carry
  `autocomplete`. No bite.
- **2.4.13 Focus Appearance** is **AAA**, not AA. The 2px cobalt ring at 3px
  offset does clear its 2-CSS-pixel-perimeter and 3:1 tests, but clearing an
  AAA criterion the project never claimed is not evidence of anything.

The criteria that actually bite here are old ones: **1.1.1**, **1.3.1**,
**1.4.10**, **1.4.11**, **2.4.1**, **2.4.3**, **2.4.7**, **4.1.3**.

**Deque, *Automated Accessibility Testing Coverage*** —
<https://www.deque.com/automated-accessibility-testing-coverage/>. *Steal:* the
honest ceiling, from the vendor with every incentive to raise it. Across
"13,000+ pages/page states" and "nearly 300,000 issues", "57.38% of total issues
were identified using Deque's automated tests". Read it carefully: that counts
*issue instances*, which template repetition inflates — one bad component in a
layout is eleven instances here — and the figure is Deque's rebuttal to a
conventional answer it quotes as varying "anywhere between 20 and 30 percent".
Two different denominators, and the honest summary is that automation finds
somewhere between a fifth and a half of what is wrong, and cannot tell you which
part it missed. *Leave:* the follow-on claim that coverage "can be increased
even further" with Intelligent Guided Tests — that is a gated report for a paid
product this project will not buy, and no number for it appears on the page.

**W3C WAI, *Easy Checks*** — <https://www.w3.org/WAI/test-evaluate/preliminary/>.
*Steal:* the shape — ten named checks (page title; image text alternatives;
headings; contrast ratio; resize text; keyboard access and visual focus; forms,
labels, and errors; moving, flashing, or blinking content; multimedia
alternatives; basic structure check) one non-specialist can do in a sitting,
plus the caveat the resource prints on itself: "A web page could seem to pass
these checks, yet still have significant accessibility barriers." *Leave:* the
multimedia checks — this site embeds no media, and an always-N/A item trains
people to skim past the items that are not.

**GOV.UK Design System, *Error summary*** —
<https://design-system.service.gov.uk/components/error-summary/>. *Steal:* the
exact structure this site got wrong — the outer `<div class="govuk-error-summary">`
takes focus, a nested `<div role="alert">` carries the announcement. *Leave:*
the component library.

**WebAIM, *Screen Reader User Survey #10*** —
<https://webaim.org/projects/screenreadersurvey10/> ("1539 valid responses",
December 2023 and January 2024): JAWS 40.5%, NVDA 37.7%, VoiceOver 9.7%,
Narrator 0.7%. Survey #11 has closed and its results are not published, so #10
is still the current figure. *Steal:* NVDA is not a compromise — under three
points off the leader, free, and the team is already on Windows. *Leave:* the
idea that one screen reader is enough. It is not; it is what is affordable, and
the survey's own point is that the field is split roughly in half.

## Proposal

**1. axe-core in the existing Playwright run.** A new
`tests/e2e/accessibility.spec.ts` using
[`@axe-core/playwright`](https://playwright.dev/docs/accessibility-testing) over
the same route list:

```ts
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze()
// Map before asserting, or a failure prints several screens of node JSON.
expect(results.violations.map((v) => `${v.id} ×${v.nodes.length}`)).toEqual([])
// The rule that matters most here returns `incomplete`, not `violation`.
expect(results.incomplete.filter((r) => r.id === 'color-contrast')).toEqual([])
```

The second assertion is the point. A contrast check axe could not complete — an
element over a partly transparent ground, or text over an image — lands in
`results.incomplete`, which `expect(violations).toEqual([])` passes silently. On
a site whose contrast story is the interesting part, checking only `violations`
is how a suite goes green while being wrong.

Two things not to get wrong. **`wcag22aa` is not in that tag list on purpose.**
In axe-core it currently selects exactly one rule, `target-size`, which ships
disabled by default; `withTags` filters the enabled set, it does not enable
anything. Adding the tag would buy a false sense of 2.2 coverage. If target-size
is ever wanted it has to be turned on explicitly, and §14's 44px floor means it
would have nothing to say first.

**And the theme dimension has to be built, not assumed.** Add one project to
`playwright.config.ts`:

```ts
{ name: 'a11y-dark',  use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } },
{ name: 'a11y-light', use: { ...devices['Desktop Chrome'], colorScheme: 'light' } },
```

`colorScheme` is enough because `Base.astro` only sets `data-theme` when
`localStorage` holds a choice; with none, §4.2's light block applies straight off
`prefers-color-scheme`. Restrict the a11y spec to these two projects with
`testMatch`, so it is 11 routes × 2 themes = 22 scans and not 66 — the existing
three viewport projects would triple the cost for a rule set that is almost
entirely viewport-independent.

**2. A one-hour manual checklist**, `docs/accessibility-checklist.md`, run once a
term and before any change to the masthead, sheet, forms or type scale. One
page, ~20 items, Easy Checks specialised to this design:

- Tab from a cold load to the footer on `/`, `/events`, `/apply`: ring visible at
  every stop, never hidden behind the running head (**2.4.11**), order matching
  reading order (**2.4.3**). Enter on the skip link lands in `#main`.
- Open the sheet at 375px, arrow through it, confirm the masthead behind it is
  unreachable. Escape closes; focus returns to the trigger.
- Submit `/apply` empty: the summary announces once, not twice, every field named
  and its error associated (**3.3.1**, **3.3.2**).
- 400% zoom on `/projects`: no two-dimensional scrolling (**1.4.10**).
- Windows High Contrast on: the record table still reads as rows, input borders
  still visible, the capacity rule still showing a filled proportion.
- Display scaling at 125% and 150% on a real laptop panel per §14, then one page
  read in a bright room at 40% brightness — a judgement, not a measurement, and
  the one the palette section cannot make.

**3. NVDA 2026.2** (free, open source, Windows 10+ —
<https://www.nvaccess.org/download/>) with Firefox. Six scripted tasks, not free
exploration: find the next event, RSVP to it, read a project's spec table, open
and close the mobile sheet, submit `/apply` with one field wrong, switch theme.
A sighted developer with a screen reader is a smoke test, not user research —
say so in the write-up.

**4. Findings become issues.** One GitHub label, `a11y`; title shape
`a11y: <what> (<SC number>)`. Each run writes
`docs/audits/YYYY-MM-DD-accessibility.md`: date, NVDA and browser versions, tasks
attempted, findings, and what was not tested. A finding with no issue is a note;
an issue with no criterion number is an opinion.

## Scope

**Phase 1, half a day.** Add the dependency, write the spec, fix the four named
defects, add `@media (forced-colors: active)` giving `--rule-strong` a
`ButtonText` border and the capacity fill a `Highlight` one.

**Phase 2, one day.** Write the checklist. Run it once. Run the NVDA script once.
File the first audit and its issues.

**Phase 3, one hour per term.** Repeat. Nothing else.

**Not proposed:** a paid audit, a VPAT, an overlay widget, or an
`/accessibility` page claiming conformance. "Tested 2026-11-04 with NVDA 2026.2
and Firefox; here is what is still broken" is true and worth publishing. "WCAG
2.2 AA compliant" is not something this team can honestly measure, and the
honesty rule applies to the platform.

## Data and schema

None. No `src/content.config.ts` change, no D1 migration, no binding, no new
Worker route. New files only, plus one `"e2e:a11y"` script.

`@axe-core/playwright` and `axe-core` are **devDependencies** — zero bytes reach
production, so the <100KB budget (§15) is untouched. axe-core is MPL-2.0: free,
no seat, no account. NVDA is free. GitHub Actions is free on public repositories,
and this one is public. **Total new spend: $0.** The added CI minutes are real
but unknown until measured; record the first run's delta rather than guess here.

One trap: axe is injected by evaluating its source, which the CSP in
`public/_headers` does not govern — but should a future version fall back to
`addScriptTag`, set `bypassCSP: true` on the a11y project **only**, never
globally, or the suite stops testing the CSP.

## Design

No new surface, no new cobalt. The §8.2 ring —
`outline: 2px solid var(--cobalt); outline-offset: 3px` — already satisfies
**2.4.7** and clears **2.4.13** at 5.4:1 against `--paper`; this protects it
rather than changes it.

Two token changes. `@media (prefers-contrast: more)` (`global.css:105`) raises
`--rule` and `--rule-2` and leaves `--ink-3` and the 11px eyebrow alone; it
should raise `--rule-strong` too and step the eyebrow to 12px, as §5.4 already
does for Cyrillic. And the forced-colors block must restate as borders what the
design says with tone — tone being exactly what that mode removes.

## Risks and trade-offs

**A green axe run reads as "accessible".** The failure this proposal exists to
prevent, and adding axe makes it *more* likely. Mitigation: the spec header
states the coverage figure and links Deque; the checklist's first line says what
the automated suite did not check.

**The checklist rots.** Every checklist a volunteer maintains does. Cap it at one
hour and one page; if a term passes with no run, delete it — a stale checklist is
a claim the project is not honouring.

**11px mono passes the maths and may still fail a person.** Contrast ratio is not
legibility: WCAG 2.x's model accounts for neither stroke weight nor the halation
thin light type on a near-black ground produces for readers with astigmatism.
Nothing automated catches this. Hence the bright-room check, and the honest
answer to "is 11px mono fine?" is "we do not know."

**One sighted tester with NVDA is not disabled-user testing.** Stated plainly in
each audit. One session a year with a QAIRU student who actually uses a screen
reader is worth asking for, and is not something this proposal can promise.

## Success

- axe reports zero violations *and* zero unreviewed `color-contrast` incompletes
  across eleven routes in both themes, in CI.
- The four named defects close, each commit carrying its SC number.
- `docs/audits/` holds at least one dated file, with at least one issue closed.
- A term later, the second run finds things axe cannot see. If two consecutive
  runs surface nothing axe had already flagged, drop the manual pass to annual
  and record that here.

## Effort

**M.** Phase 1 is half a day, most of it the four fixes rather than the tooling.
Phase 2 is a day of writing plus an hour of testing. Phase 3 is an hour a term
forever — the only part that can fail.

Independent of every other proposal. It touches 022, where a sticky running head
engages **2.4.11**, and the i18n work, where `lang` on `<html>` and `:lang()` on
translated fragments are **3.1.1** and **3.1.2** — cheaper to get right before
that copy ships than after.
