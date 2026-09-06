---
title: Make the design guards component-shaped
status: draft
area: design
effort: S
depends_on: []
---

# 021 — Make the design guards component-shaped

| | |
|---|---|
| **Status** | draft |
| **Area** | design |
| **Effort** | S |
| **Depends on** | — |

## Problem

The mechanised half of the design law does not cover the site.

`tests/e2e/design-law.spec.ts` iterates a hardcoded `ROUTES` array of eleven
paths. `scripts/shots.mjs` iterates its own hardcoded `ALL_ROUTES` of twelve.
They already disagree — `shots.mjs` captures `/404`, the spec does not — and
`src/pages/` holds eighteen `.astro` files. **Neither list contains a single
`[slug]` route.** So the DETAIL archetype of §12.2 — the 4:3 PLATE, the sticky
mono spec table, the cross-reference list — has never been asserted once, in
either theme, at any width. Nor has `/404` (§12.5), nor `/dev/glyphs`.

Two smaller gaps sit inside the same file. §7.2 and §8.4 both say **exactly one**
PLATE per page; the assertion is `toBeLessThanOrEqual(1)`, so a page with zero
photography passes — which is today's state on every route. And §8.4 asks for a
non-empty `alt` plus a sibling `<figcaption>`; the test checks only that the
`alt` attribute is present.

This gets worse mechanically rather than staying flat. Proposal 013 builds the
registry out of `/projects/tag/[tag]/` and `/projects/from/[program]/` — roughly
thirty-five new routes on today's content, every one carrying chips, a PLATE and
a RECORD table, and not one of them reachable by a hardcoded array somebody
remembered to edit.

**What is not a problem.** `src/components/` holds eighteen files and four
near-identical RECORD rows, and that is fine: `ProgramRow`, `EventRow`,
`ProjectRow` and `LearnRow` diverge in their meta columns, which is the part
carrying the meaning. Nothing in the tree has drifted toward a card. No proposal
in `docs/proposals/` asks for tabs, a toast, a combobox or a person lookup. 013
already specifies its own filter chips down to the cobalt (`--cobalt-text` label,
transparent ground, never a fill) and puts its sort in named routes rather than a
control. **There is no component-library shortage. There is a coverage hole.**

## Prior art

**[GOV.UK Design System contribution criteria](https://design-system.service.gov.uk/community/contribution-criteria/)**
and the [community backlog](https://github.com/alphagov/govuk-design-system-backlog).
Two gates before a proposal is even developed: *useful* (evidence several
services need it) and *unique* (it does not replicate something already there);
then *usable*, *consistent*, *versatile* before publication. **Steal:** both
gates, and apply them to this document first — an earlier draft proposed seven
controls, and five failed *unique* or *useful* outright. **Leave:** the *usable*
gate as GOV.UK writes it, which requires research with a representative sample of
users including disabled users. One volunteer cannot run that; a keyboard and
screen-reader walkthrough is the honest substitute and should not be called
research.

**[GOV.UK Frontend: import JavaScript](https://frontend.design-system.service.gov.uk/import-javascript/)**.
Components are found by `data-module` attributes and started by `initAll()` or
`createAll()`, with an inline snippet setting `.govuk-frontend-supported`.
**Steal:** `data-module` as the single discovery mechanism, so one grep finds
every scripted component. **Leave:** `initAll()` — a document-wide scanner is the
opposite of an island and would put a bootstrap on routes that ship 1,162 bytes.

**[GOV.UK Pagination](https://design-system.service.gov.uk/components/pagination/)**.
A `<nav aria-label="Pagination">` around a list of plain links, current page
marked `aria-current="page"`, a visually-hidden `" page"`, `&ctdot;` for the
ellipsis, zero JavaScript, and an explicit warning that infinite scroll is a
keyboard barrier. The small-screen set is *current, previous, next, first, last*
— not a fixed count of numbers. **Steal:** all of it, if a pager is ever needed.
**Leave:** the SVG arrows; §10.4 caps the icon budget at four 1px glyphs and the
mono `←` `→` do the job.

**[MOJ sortable table](https://design-patterns.service.justice.gov.uk/components/sortable-table/)**,
one of the [44 MOJ components](https://design-patterns.service.justice.gov.uk/components/)
that extend GOV.UK Frontend instead of forking it. A real `<table>` carrying
`data-module="moj-sortable-table"`, `aria-sort` on the headers, `data-sort-value`
on cells so `6,961 meters` sorts as `6961`. **Steal:** `aria-sort` and
`data-sort-value` verbatim, and the extend-don't-fork posture toward a parent
system, which is our relationship to QAIRU. **Leave:** the client-only sort with
no no-JS path — and leave `Card`, `Interruption card` and `Ticket panel`, all
three in that set of 44 and all three banned here by name.

**[Radix Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)**.
**Steal:** the state-attribute contract — `data-state="active"`,
`data-orientation` — which is how you style behaviour without importing it, and
the per-component Keyboard Interactions table as a written spec.
**Leave:** the library. Not on its own price: on the floor beneath it. Measured
from this repo's own `dist/client/_astro/`, React plus the Astro renderer is
191,707 B raw and 60,120 B gzip *before any component*. Index routes ship
`page.js` alone — 2,542 B raw, 1,162 B gzip, zero React. The marginal cost of any
headless control on `/projects` is that floor first, and the floor is the
argument.

**[React Aria](https://react-aria.adobe.com/)** — the older
`react-spectrum.adobe.com/react-aria/` URL now 301s here. **Steal:** its keyboard
interaction tables as the spec a hand-built control is tested against.
**Leave:** adopting it.

**[Astro Container API](https://docs.astro.build/en/reference/container-reference/)**.
Added in `astro@4.9`, still documented as experimental and subject to breaking
changes in minor or patch releases; renders an `.astro` component to a string via
`experimental_AstroContainer.renderToString()` under Vitest. **Steal:** it as the
component-shaped assertion §8.4 has no route for, if one is ever needed.
**Leave:** any reliance that would force a component to change shape to satisfy
it.

## Proposal

**1. One generated route list, not two hardcoded ones.**
`scripts/routes.mjs` exports every route by reading `dist/` after a build — the
emitted `index.html` files are the ground truth, so `[slug]` pages, 013's facet
pages and `/404` are in it by construction and cannot be forgotten. Both
`design-law.spec.ts` and `shots.mjs` import it. One list, derived, never edited.

**2. Three assertions the spec is missing**, added while the list is being fixed:
exactly one `.plate` per content route rather than at most one; every `<img>` has
a *non-empty* `alt` and a sibling `<figcaption>`; and the §8.2 rule 6 chip is
transparent — `.chip[aria-current]`'s computed `background-color` must be
`rgba(0, 0, 0, 0)`. That last one is a sentence in §8.2 and again in 013, and
nothing checks it.

**3. `scripts/check-components.mjs`**, beside `check-cobalt.mjs` in `pnpm check`.
About 80 lines, no runtime cost. It fails on:

- a banned identifier in any `.astro` / `.tsx` / `.css` — `card`, `panel`, `box`,
  `wrapper`, `container`, `badge`, `pill`, `tile`;
- a `border-radius` outside `src/styles/global.css` that is not
  `var(--radius-…)`. The literal-value rule an earlier draft proposed — "`0`,
  `2px` or `4px` only" — would have failed on `global.css:243`, the 1px radius on
  the focus ring, on its first run;
- any `box-shadow` that is not `none`;
- any hex, `rgb()` or `oklch()` literal outside `global.css`;
- a `src/components/` file missing its three-line header.

**4. A three-line header on every component**, because it is the smallest thing a
lint can check and a reviewer can read:

```
Register: RECORD | PLATE | READ | chrome
Tier:     0 | 1 | 2
Cobalt:   <allowlist entry> | none
```

Prose lines — a thin-state description, a Kazakh-measured-at-1280px boolean —
were cut. A lint can only assert their presence, so all they buy is a tired
volunteer typing `yes`.

**5. The tier rule, as a decision rule rather than machinery.**
**Tier 0** is the platform: `<details>`, `<dialog>` (Baseline widely available
since March 2022; `showModal()` gives focus trap, `Esc`, an inert background and
`::backdrop` — note that `closedby="closerequest"` adds nothing to a modal, since
that is already `showModal()`'s behaviour), the Popover API (Baseline newly
available since January 2025, `popovertarget` toggling with no script), a real
`<table>` with `aria-sort`, a `<nav>` of links, a `<form method="get">`.
**Tier 1** is `.astro` plus ≤40 lines of vanilla JS registered by `data-module`,
inlined in the component's `<script>`. **Tier 2** is a React island, allowed only
on a route that already pays the 60 KB — today `/apply`, `/apply/accelerator`,
`/contact`, `/events/[slug]`. A control that cannot be Tier 0 or 1 is a design
question, not a dependency question.

**Cobalt.** This proposal requests **no new allowlist entry.** `ALLOWED_SELECTORS`
holds eleven today, and the chip entry belongs to 013, which is where the chip is
designed. Two rules are added to `check-cobalt.mjs` instead: every entry must
carry a trailing `// §8.x` comment naming the clause that permits it, asserted by
the script; and the array is capped at fourteen. Passing fourteen means amending
§8, not editing an array.

## Scope

**Step 1, and it is the whole useful thing (half a day).** `scripts/routes.mjs`,
both consumers switched to it, and the three missing assertions. This is the only
part that closes a hole that exists today, and it makes 013's thirty-five facet
routes covered on the day they ship rather than never.

**Step 2 (half a day), only after Step 1 runs green on the full route set.**
`check-components.mjs` and the three-line headers. Deliberately second: Step 1
will surface real failures on the detail routes, and those should be fixed before
a second gate is stacked on top of them.

**Step 3.** There is no step 3. If 013 turns out to want a pager after all, it is
built inside 013 against the GOV.UK markup above.

Explicitly **not** in scope: a component library, tabs, toasts, a combobox,
Radix, React Aria, Base UI, `shadcn/ui`, `/dev/kitchen-sink`, a generated
`docs/COMPONENTS.md`, a `components.map.json`, and a `pnpm shots --first-use`
mode. Every one of those is a second thing to keep in sync — the exact objection
§8.4 raises against a gallery, and it does not stop being true when the second
thing is a JSON file.

## Data and schema

None. No D1 migration, no binding, no `content.config.ts` change, no new content
field, no generated data file.

## Design

Nothing is drawn. This proposal ships two scripts and edits a spec file; it adds
no class, no token, no markup, no motion and no cobalt.

The one design consequence worth naming is a rule the new lint still cannot see.
§8.3 forbids **two cobalt elements touching**. 013's chip bar can put two active
chips side by side, each with a 1px `--cobalt` border, and those borders will
abut. Neither `check-cobalt.mjs` nor a computed-style assertion can catch it — it
is a layout fact, not a declaration. 013 must resolve it, either by spacing chips
so no two active borders meet or by making each facet single-select. Recorded
here so it is not discovered in review.

## Risks and trade-offs

**The strongest argument for doing none of this.** The hole is real but it has
never been hit. Nothing in `src/components/` has drifted toward a card, no
`box-shadow` has appeared, no second accent has been added, and the eleven-route
spec has never failed on a change it was meant to catch. What is proposed is a
build step, a derived route list and a fifth script, added to a site with one
maintainer, to prevent a class of failure that has not occurred once. The
volunteer who writes it will graduate; whoever inherits it will hit a red build
from a lint they did not design and reach for `--no-verify`. The alternative —
add the detail routes to both arrays by hand today, in one commit, and read diffs
— costs twenty minutes and no new machinery. That is a serious position, and
Step 2 in particular does not clearly beat it.

The counter is narrow, and is the only reason to proceed: **hand-editing two
arrays is precisely the thing that has already failed**, which is why they
disagree about `/404` right now, and 013 multiplies the routes by four. Step 1
removes the class of error instead of paying it down. Step 2 does not, and should
be dropped if Step 1 alone proves sufficient.

**The generated list makes the suite slower and less predictable.** Every new
content entry adds routes; a Playwright matrix over eleven paths becomes one over
fifty, then two hundred. Cap it: assert every static route plus the three newest
entries per collection, and put the full sweep behind a flag CI runs on `main`
only.

**The Container API is experimental and can break in a minor.** It is not in
scope here. If it is ever adopted, pin Astro and delete the snapshots rather than
reshape a component to satisfy them.

**The lint is gameable.** Ban `card` and someone writes `.tile`; the banned list
grows reactively, which is cheap. The deeper version is worse and stays unsolved:
with cobalt capped, someone invents a non-cobalt highlight — a `--paper-2` fill
with padding and a radius — and rebuilds the card without tripping a single
guard. The radius and identifier rules are a partial answer; §16 read by a human
is still the real one.

## Success

Six months out, `pnpm test:e2e` asserts every route in `dist/`, including every
`[slug]` page and every 013 facet page, and no route list is edited by hand.
`/projects` still ships the 2,542 B of JavaScript it ships today. No dependency
was added.

`check-components.mjs` has failed on a real change at least once. If it has not
fired within a month of landing, it is theatre and should be deleted — and that
deletion counts as a success.

**Reverse signal.** If the generated sweep makes CI slow enough that people skip
it, cap it at the static routes plus one detail page per collection and keep the
three new assertions. Those assertions are the part with value; route generation
is only the delivery mechanism.

## Effort

**S.** Step 1 is about half a day: read a build output directory, swap two
imports, add three assertions. Step 2 is about half a day and may be declined.
Depends on nothing. 013 does not depend on it, but lands better after it.
