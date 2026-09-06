---
title: Fix the reduced-motion block, then let motion carry meaning only
status: draft
area: design
effort: S
depends_on: []
---

# 022 — Fix the reduced-motion block, then let motion carry meaning only

| | |
|---|---|
| **Status** | draft |
| **Area** | design |
| **Effort** | S |
| **Depends on** | — |

## Problem

**One thing is broken. Most of the rest is not built, and some of it cannot be
built yet.** Those are three different problems and the proposal below keeps
them apart.

### The defect

`docs/DESIGN.md` §9.5 says the reduced-motion block must set `animation: none`
and `animation-timeline: none`. `src/styles/global.css:269–277` ships this:

```css
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
scroll-behavior: auto !important;
```

Two faults:

1. **Duration is ignored by scroll-driven animations.** The day anything gets an
   `animation-timeline`, a reader who asked for less motion gets all of it.
2. **`transition-duration: 0.01ms` kills colour feedback.** Every transition in
   the codebase is a 120ms colour or `filter` change — link underline
   (`global.css:229`), `.btn` border and background, `.cta-primary` brightness.
   §9.5's own prose says these are "retained at 100ms because they are state
   feedback, not motion." They are not retained. Hover and focus become instant
   colour pops.

DESIGN.md is itself inconsistent here: its §9.5 code block says
`transition-duration: 1ms`, its prose two paragraphs down says 100ms. This
proposal picks 100ms and asks §9.5's code block to be corrected to match its
own prose.

### What is written down and unbuilt

- **§9.1 is one-third built.** `components.css:681–718` defines `.run-rule`,
  `.run-type`, `.run-rows`. `.run-type` and `.run-rows` are used on four
  elements (`Masthead.astro:67`, `index.astro:50`, `index.astro:126`,
  `Desk.astro:94`). **`.run-rule` is used on nothing at all** — the rail-spine
  `scaleY` and the masthead `scaleX` of §9.1 do not exist. And it cannot simply
  be applied: `.run-rule` animates `transform: scaleX()` on the element it sits
  on, so it is only ever legal on an element that contains no text. §9.1 says
  "text never scales."
- **§9.2, the section-rule draw, is blocked, not merely unbuilt.**
  `grep -rn "rule--section" src` returns **nothing**. The class DESIGN.md §4.3
  and §9.2 both name does not exist; `SectionHead.astro` renders no rule element
  at all. There is nothing to draw. Building it is a *structure* change, not a
  motion change, and it does not belong in this proposal.
- **§9.3, the running head.** `grep -rn "IntersectionObserver" src` returns
  nothing.
- **§9.4's RSVP expand does not apply.** There is no row expander.
  `RsvpForm.tsx` is a full form rendered `client:visible` inside
  `/events/[slug]` (`events/[slug].astro:86`). `0fr → 1fr` has nothing to
  expand. Proposing motion for it would be proposing to build a UI pattern
  under cover of a motion ticket.
- **Navigation.** Nothing exists. Every link is a full document load, and on a
  near-black page a cold navigation is a visible flash.
- **The submit-to-receipt moment.** `ApplyForm.tsx:80` returns `.done` in place
  of the `<form>` in a single render. §12.3 calls the receipt "the coldest
  moment on the site converted into its most memorable one." It has no
  transition, no focus move, and no acknowledgement between the click and the
  network round trip. `.cta-primary:disabled` is styled
  (`components.css:460`), but both forms use `aria-disabled`, which matches
  nothing — **the busy state is currently invisible.**
- **Late data.** Undecided. §7.4 bans skeletons for *empty* content; nothing
  says what happens while a value is in flight.

### One fact that constrains every string below

The site is **English-only today**. There is no `/ru/` or `/en/` route tree, and
every label in `ApplyForm.tsx` and `RsvpForm.tsx` is English (`Send`,
`Reserve`, `Sending…`). Any proposal that reserves width "for the longest label
in all three languages", or ships `ЖҮКТЕЛУДЕ…` as a loading string, is writing
cheques against content that does not exist. This proposal reserves width by
measurement and asserts CLS instead.

## Prior art

Every link below was fetched and every figure quoted from it was read off the
page.

**Emil Kowalski, "Great Animations"** —
<https://emilkowal.ski/ui/great-animations>. *Steal:* "Your animations should
also usually be shorter than 300ms"; "You should try to animate with `transform`
and `opacity` as they only trigger the third rendering step (composite)"; and
"Never animate keyboard initiated actions. These actions are repeated sometimes
hundreds of times a day, an animation would make them feel slow and disconnected
from user's actions." *Leave:* his spring curves and Framer Motion
interruptibility — both cost JavaScript this site has not got, and CSS
transitions are already interruptible for free. Note he does not prescribe
`ease-out` universally; our `--ease-out` stays because it is already the token,
not because he blessed it.

**Rauno Freiberg, "Invisible Details of Interaction Design"** —
<https://rauno.me/craft/interaction-design>. *Steal:* animation scales inversely
with interaction frequency — a thing done hundreds of times a day earns less
motion, not more; and spatial consistency, a thing should arrive from where it
lives. *Leave:* the gesture-physics material. There are no gestures here, and
momentum on a broadsheet is costume.

**Chrome, cross-document view transitions** —
<https://developer.chrome.com/docs/web-platform/view-transitions/cross-document>.
*Steal:* `@view-transition { navigation: auto; }` — same-origin MPA transitions
with **zero JavaScript**; Chrome and Edge 126+, Safari 18.2+, Firefox not
supported; unsupporting browsers navigate normally. *Leave:* the `pageswap` /
`pagereveal` hooks; that is where the JS creeps back in. **Note what the page
does not say:** it makes no mention of `prefers-reduced-motion`. The
reduced-motion posture is ours to build, and §1 below builds it.

**MDN, `@view-transition`** —
<https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition>. *Steal:*
the honest status — "This feature is not Baseline because it does not work in
some of the most widely-used browsers." MDN also does **not** state whether the
at-rule is valid inside `@media`. §1 therefore does not nest it.

**Astro, view transitions** —
<https://docs.astro.build/en/guides/view-transitions/>. *Steal:* the posture —
`<ClientRouter />` "includes a CSS media query that disables *all* view
transition animations, including fallback animation" under
`prefers-reduced-motion`. *Leave:* `<ClientRouter />` itself, argued below. The
page does not document the native `@view-transition` rule at all, so nothing
here is Astro-supported; it is plain CSS that Astro happens not to touch.

**Jakob Nielsen, "Response Times: The 3 Important Limits"** —
<https://www.nngroup.com/articles/response-times-3-important-limits/>. *Steal:*
"0.1 second is about the limit for having the user feel that the system is
reacting instantaneously, meaning that no special feedback is necessary except
to display the result"; 1.0s for uninterrupted flow of thought; 10s for
attention. This is the whole basis of the loading rule. *Leave:* the
percent-done indicator; nothing here takes ten seconds.

**Viget, "A Bone to Pick with Skeleton Screens"** —
<https://www.viget.com/articles/a-bone-to-pick-with-skeleton-screens/>. *Steal:*
the result. Across 136 participants (39 skeleton / 39 spinner / 58 blank) the
skeleton lost on every metric — 59% agreed content loaded quickly against 74%
for a spinner and 66% for a blank screen; mean perceived wait 2.82s against
2.41s and 2.29s. *Leave:* the conclusion that spinners are therefore right. A
spinner loops, and §9 bans loops. Blank is second-best and legal.

*Cut from an earlier draft:* Material Design 3's duration tokens and Apple's
HIG Motion page. Both URLs resolve but render their body from script, so
nothing on either could be quoted from the page. The M3 duration ladder added
nothing the 300ms rule does not already give us, and Apple's "motion is never
the only channel" is already law here as §8.3.

## Proposal

**1. Correct §9.5. This ships alone, first, and fixes a live defect.**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    animation-timeline: none !important;   /* after the shorthand, on purpose */
    transition-duration: 100ms !important; /* colour feedback is not motion */
    scroll-behavior: auto !important;
  }
  /* The `*` selector does not reach the view-transition pseudo tree. */
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) { animation: none !important; }
}
```

`animation: none` rather than a 0.01ms duration is what makes §9.5's
architectural claim true: it drops `animation-fill-mode: both` on the `.run-*`
classes, so every element resolves to its authored default — `opacity: 1`,
`transform: none` — instead of being parked at a fill state. That is precisely
what the existing test at `design-law.spec.ts:176` asserts, and why this change
is safe to make before anything else lands.

**2. Page transitions: reject `ClientRouter`, adopt `@view-transition`.**

`<ClientRouter />` ships a runtime on *every* route, including `/about`,
`/people` and every `/docs/*` page, which today carry zero client bundles. It
also converts three working things into maintained things: the `is:inline` theme
script in `Base.astro`, the `client:visible` islands, and any future running-head
observer would all need `astro:page-load` wiring, held by a volunteer. The gain
is a cross-fade. **No.**

Instead, CSS in `global.css`:

```css
@view-transition { navigation: auto; }

.masthead  { view-transition-name: masthead; }
.nav       { view-transition-name: nav; }
.colophon  { view-transition-name: colophon; }
main       { view-transition-name: well; }

/* Without this, everything unnamed keeps the UA's default root cross-fade,
   which is longer than ours — the two read as two events. */
::view-transition-old(root),
::view-transition-new(root) { animation: none; }

::view-transition-old(well) { animation: none; }
::view-transition-new(well) { animation: vt-well var(--t-nav) var(--ease-out) both; }
@keyframes vt-well { from { opacity: 0.001 } to { opacity: 1 } }
```

New token `--t-nav: 140ms`. The at-rule sits at the top level rather than inside
`@media (prefers-reduced-motion: no-preference)`, because neither MDN nor the
spec text we could read confirms it is valid inside a conditional group rule;
§1's pseudo-element block already suppresses it under reduced motion, which is
one line and does not depend on an unverified nesting rule.

`.masthead`, `.nav` and `.colophon` are *named*, so they get their own snapshot
groups and their identical pixels cross-fade invisibly; only the well changes.
That is §9's own thesis applied to routing — the furniture stays, the sheet
changes. The one visible consequence is intended: the nav's 2px cobalt active
underline moves between sections instead of blinking. Zero travel, zero scale,
zero JavaScript, and Firefox gets a normal navigation.

**A `view-transition-name` must be unique per document.** Two `.masthead`
elements on one page abort the whole transition silently. `Base.astro` renders
one of each, and the Playwright assertion below keeps it that way.

**3. The submit-to-receipt moment.**

- **Under 100ms, and it is currently invisible.** Extend the existing rule to
  `.cta-primary:disabled, .cta-primary[aria-disabled="true"]`, which is the
  smallest correct fix: it reuses the `opacity: 0.55` already at
  `components.css:460`, adds no colour, and makes the busy state real. The label
  already changes to `Sending…` and the existing `aria-live="polite"` note
  already reads. **No spinner** — a spinner is a loop. Nielsen's 0.1s limit is
  met by a state change, not by an animation.
  **Explicitly rejected:** taking the label to `--ink-3`. `--ink-3` (#9b9996) on
  `--cobalt` (#0c84fa) is not a legal pairing — §4.1 and §14 permit exactly one
  ink on a cobalt fill, `--on-cobalt`, because even white fails there at 3.7:1.
- **No width jump.** `.cta-primary` is `inline-flex` with no
  `min-inline-size`, so `Send → Sending…` and `Reserve → Sending…` reflow the
  row mid-click. Set `min-inline-size` from the widest label the site actually
  ships, measured — not guessed at in `ch`. `m-button` carries `0.08em`
  tracking on top of the mono advance, so a `ch` count under-reserves by roughly
  the tracking. The check is a Playwright CLS assertion on submit, which stays
  true when the Kazakh strings eventually land and a `ch` constant would not.
- **The receipt.** `.done` already carries a `2px --rule-2` top border
  (`components.css:793`). Draw it, then bring the type up. **`.run-rule` cannot
  be put on `.done`** — it scales the element it sits on, which would squash the
  receipt's type horizontally and break §9.1's "text never scales." The rule
  animates on a `.done::before` block of its own; `.run-type` goes on the
  reference line (`translateY(8px→0)`, 220ms, delay 100ms). Under 500ms total,
  inside §9.1's budget, no new keyframes. `.done` takes `tabIndex={-1}` and
  `.focus()` on mount, so the keyboard lands on the receipt and the existing
  `role="status"` is not the only channel.
- **Failure animates nothing.** `ErrorSummary` appears and takes focus
  instantly. §9.4: focus is never animated, and an error that slides is an error
  read late.

**4. Skeleton versus nothing: nothing.**

No content route fetches anything client-side today. The only late arrival is
the Turnstile script (`form-kit.tsx:37`); a live RSVP count from D1 is the only
one on the horizon. The rule:

- **Under 1s** — nothing. Nielsen: no feedback is necessary.
- **1–10s** — one mono line in `--ink-3` in the space the value will occupy.
  Never a grey bar, never a shimmer, never a pulse. The reserved space carries
  **no border, no background and no radius** — that is the line between reserving
  space and shipping a skeleton with a different name, and it is the same line
  §4.4 draws about faint hairlines.
- **Never** a skeleton (§7.4 bans them for empty content; this extends the ban to
  in-flight content) and never a spinner.
- **A value that fails to arrive renders as a value that does not exist.** The
  capacity rule does not render. §7.4's `stale_after` doctrine, unchanged.
- Turnstile renders into a bare `<div>` with no class and no CSS
  (`form-kit.tsx:68–70`; `grep -n turnstile src/styles/components.css` is
  empty). Give the wrapper a class and a `min-block-size` matched to the widget
  so the button never jumps.

**5. Guard the ground we are not building on.**

The lint lands now even though §9.2 does not, because the lint is what stops the
next contributor from inventing a scroll reveal. See Design below.

### Deliberately not in this proposal

- **§9.2's section-rule draw.** `.rule--section` does not exist. Building the
  section hairline as an addressable element is a structure change; propose it
  separately, and it inherits assertion 2 below on the day it lands. When it
  does, it should reuse the existing `--t-rule` (240ms) rather than introduce a
  second duration for the same gesture — DESIGN.md currently says 240ms in §9.1
  and 280ms in §9.2 for one act, and that is a bug in DESIGN.md.
- **§9.4's RSVP expand.** There is no row expander to expand.
- **§9.3's running head.** Real, wanted, ~10 lines of vanilla JS on one
  sentinel, `opacity` only, `position: fixed`, zero CLS. It is a *feature*, not a
  motion correction, and it is the first thing to cut if the budget moves.

## Data and schema

None. Motion is entirely presentational: no `src/content.config.ts` field, no D1
migration. The only token added is `--t-nav`.

## Design

Nothing here introduces a colour. `check-cobalt.mjs` needs no new
`ALLOWED_SELECTORS` entry: the view-transition pseudo-elements animate `opacity`
only, the receipt rule uses `--rule-2`, and the busy state reuses the existing
`.cta-primary` rule rather than adding a selector. The one place a colour was
tempting — a dimmed busy label — is rejected above on contrast grounds.

**§16, line by line.**

- *Card drift.* Nothing gains a border, a radius or padding as grouping. The
  reserved loading space is explicitly bare (§4 above).
- *Cobalt drift.* No new cobalt selector; no cobalt gradient, glow or wash; the
  busy state is doubled by a word (`Sending…`) as §8.3 requires.
- *Motion.* Nothing loops (asserted). Nothing travels more than 8px — the
  navigation travels zero. Nothing scales **except a rule**.
- *Thin content.* No skeleton, no shimmer, no placeholder row, in flight or
  empty.

**The one amendment this asks of DESIGN.md.** §16 says "nothing scales" while
§9.1 prescribes `scaleY` and `scaleX` on rules. The rule is **rules scale, type
never does**, and §16 should say so. The practical consequence is already
written into §3 above: `.run-rule` may only be applied to an element with no
text in it. §9.5's code block should also be corrected to agree with §9.5's own
prose (100ms, not 1ms).

**Three assertions in `tests/e2e/design-law.spec.ts`, over every route in
`ROUTES`:**

1. no element has `animation-iteration-count` other than `1`;
2. no element has a non-`none` `animation-timeline` — a bare ban until §9.2
   exists, then narrowed to `.rule--section`;
3. under `reducedMotion: 'reduce'`, every `.run-*` element resolves to
   `opacity: 1` **and** `transform: none`. The existing test at line 176 checks
   opacity only, and runs on `/` alone.

Plus one CLS assertion on submit, and a `view-transition-name` uniqueness check.

`scripts/check-motion.mjs`, wired into `pnpm check` beside `guard:cobalt`:
`@keyframes` bodies may name only `transform` and `opacity`, and no
`transition-duration` literal above 300ms may appear outside the `--t-*` tokens.
It is the cheapest thing in this proposal and the only part that still works in
two years, so it ships in Phase 1, not last.

## Scope

**Phase 1 — half a day, ships alone, fixes a live bug.** Correct the §9.5 block
(§1). Add assertions 1–3 and `check-motion.mjs`. Nothing else. This phase is
worth doing even if every later phase is abandoned.

**Phase 2 — half a day.** The busy state (`[aria-disabled]`), the measured
button width and its CLS assertion, the Turnstile height reservation, the
receipt sequence and focus move, the loading-text rule.

**Phase 3 — half a day.** `--t-nav`, `@view-transition` and the four names, plus
the uniqueness assertion. Last because it is the only part with no fallback and
the only part a reviewer might reasonably veto.

## Risks and trade-offs

1. **The strongest argument is that none of this should be done now.** The site
   has no photographs, so every PLATE is a ruled placeholder and §3.4 of
   DESIGN.md says the PLATE is not optional. It has no Open Graph images, so
   every share into Telegram or WhatsApp is a bare text card. It has no Kazakh
   and no Russian, on a site for students in Astana. Those three failures are
   visible to every visitor. Motion is visible only to a visitor on Chrome 126+
   or Safari 18.2+ who has not asked for reduced motion — and by design it is
   meant to be barely noticed. **Phase 1 is a bug fix and should ship regardless.
   Phases 2 and 3 should lose every scheduling contest against photography, OG
   images, and the second language until those exist.**
2. **Firefox gets nothing** from Phase 3. Accepted: a progressive enhancement
   with no fallback branch and no bytes. The site is identical without it.
3. **View transitions snapshot the whole document.** On a long `/docs` page that
   is a large surface on a weak GPU. Check on a low-end Android panel and a
   Windows laptop at 150% (§14), not on a MacBook. If `pnpm shots` or a real
   device shows a dropped frame at 375px, delete the block and the feature is
   gone.
4. **`@view-transition` inside `@media` is unverified**, which is why §2 does not
   nest it. If the pseudo-element suppression turns out not to cover some
   browser's fallback path, the fix is to delete the at-rule, not to add JS.
5. **A future maintainer will want a scroll reveal.** Assertion 2 is the answer,
   not code review. It is deliberately written as a total ban rather than an
   allowlist of one, so the day someone wants an exception they have to edit the
   test and say why.
6. **The measured button width goes stale when Kazakh lands.** The CLS assertion
   catches it; the number alone would not. Re-measure with the translation, not
   before it.

## Success

- `pnpm check` passes with `check-motion.mjs`; `pnpm e2e` passes with the new
  assertions.
- Under `prefers-reduced-motion: reduce`, every route resolves to `opacity: 1`,
  `transform: none`, `animation-timeline: none` — asserted, not eyeballed. The
  page is complete and correct, never mid-animation.
- Hover and focus colour feedback still takes 100ms under reduced motion, where
  today it takes 0.01ms. This is the defect being fixed and it is checkable in
  one `getComputedStyle` call.
- No route outside `/apply`, `/apply/*` and `/events/*` emits a client bundle in
  `pnpm build` output; the three that do are unchanged in size.
- CLS is 0 across the submit transition in a Playwright trace, and time from
  submit click to a visible state change is under 100ms in the same trace.
- Zero elements on any route have `animation-iteration-count` other than `1`.
- LCP stays under 1.8s. Cloudflare Web Analytics reports Core Web Vitals, but a
  student club's traffic may not give a stable field sample in two weeks; treat
  the Playwright trace as the gate and the field data as confirmation.

## Effort

**S** — about a day and a half for one person, and Phase 1 alone is half a day.
Roughly 40 lines of CSS, ~15 lines of TSX across `ApplyForm.tsx`,
`RsvpForm.tsx` and `form-kit.tsx`, ~50 lines of Playwright and one ~40-line
guard script. No dependency added, no paid tool, no new bytes on content routes.
Depends on nothing. The earlier M estimate assumed the section-rule draw, the
RSVP expander and the running head; all three are cut or deferred above.
