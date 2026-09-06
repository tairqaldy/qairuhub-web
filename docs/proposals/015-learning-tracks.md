---
title: Give the notes an order and an end
status: draft
area: community
effort: M
depends_on: [011-session-writeups]
---

# 015 — Give the notes an order and an end

| | |
|---|---|
| **Status** | draft |
| **Area** | community |
| **Effort** | M |
| **Depends on** | 011. A track orders notes; today there are none to order. |

## Problem

`/learn` is `getLearnEntries()` — every note, newest first. That is a feed, and
a feed is the wrong shape for teaching: the first row a first-year sees is the
most recent one written, which is usually the hardest.

The schema already knows things the site refuses to use. `level` is
`intro | intermediate | advanced`; `LearnRow.astro` never reads it, and
`learn/[slug].astro` prints it once in a dot-separated meta line. Nothing sorts
by it, nothing routes a beginner to the intro ones. `minutes` renders per row
and is summed nowhere. `tags` has no controlled vocabulary, so it cannot carry
sequence either. Ordering is the one thing the collection cannot express.

The concrete failure: a first-year who wants to get from nothing to an agent
that calls a tool opens `/learn`, finds notes written for the room that was
already there, and cannot tell which to read first, what it assumes, or what
follows it. `learn/[slug].astro` ends at the recording link. There is no next.

And the material does not exist yet. `src/content/learn/` holds exactly one
file, `example-note.md`, marked `placeholder: true`, so production renders
`EmptyState`. Everything below is therefore written for the day after 011 lands,
and has to be honest on that day, when one note exists — or version one is a
table of contents for a book nobody wrote.

## Prior art

**[The Odin Project](https://www.theodinproject.com/paths)** ·
[curriculum repo](https://github.com/TheOdinProject/curriculum). One Foundations
path, then two full-stack paths; the site states plainly that "The courses
should be taken in the order that they are displayed."
[Foundations](https://www.theodinproject.com/paths/foundations/courses/foundations)
runs to roughly thirty lessons with five projects **interleaved** rather than
banked at the end — Rock Paper Scissors lands mid-JavaScript, and a later lesson
returns to it — and the whole curriculum is Markdown in a public repo that takes
pull requests from learners. **Steal:** one linear order, interleaved projects,
curriculum-as-Markdown-PR — already how this site works. **Leave:** the scale. A
track here that reaches thirty steps has failed.

**[freeCodeCamp's certification restructure](https://www.freecodecamp.org/news/introducing-freecodecamp-checkpoint-certifications/)**.
The full-stack capstone is ~1,800 hours, deliberately broken into six
intermediate certifications of roughly 300 hours each, earned on the way. The
same announcement states which parts do not exist yet — the curriculum is in
beta, the Back End JavaScript coursework is not live, the exam environment has
not shipped. **Steal:** both halves — a long thing must be a sequence of short
things that each end in something you keep, and the unfinished parts are named
in public. **Leave:** certificates and the exam. We cannot verify anyone did
anything, so we must not issue anything.

**[fast.ai — Practical Deep Learning for Coders](https://course.fast.ai/)**.
Nine lessons of about 90 minutes, taught strictly top-down: a working model in
lesson one, the mechanism underneath it later. Prerequisites are behavioural —
"know how to code (a year of experience is enough), preferably in Python, and
that you have at least followed a high school math course" — not credentials.
**Steal:** that ordering, the ~90-minute unit, prerequisites written as things
you can already do. **Leave:** the Part-1-then-Part-2 arc; a term of paid time.

**[Hack Club Jams](https://jams.hackclub.com/)**. 26 self-contained builds,
filterable by 30 or 60 minutes and Beginner / Intermediate / Advanced, each
ending in a thing that exists — but unordered: no jam depends on another.
**Steal:** the honest per-item time label, and that a unit ends in an artefact.
**Leave:** the flat catalogue, which is what `/learn` already is, and the
filters: 26 items justify a filter island, four notes do not.

**[MIT OpenCourseWare](https://ocw.mit.edu/about/)** ·
[OCW Scholar](https://ocw.mit.edu/collections/ocw-scholar/). OCW publishes
course materials with "No enrollment and always available" and states flatly
that "MIT does not offer credit or certification to users of OCW." Scholar
exists because raw course dumps fail independent learners: the same material
"arranged in logical sequences and with extensive multimedia" and "designed
especially for independent learners" is a different product. **Steal:** both
halves — say loudly what this is not, and accept that sequencing is the whole
value added over an archive.

**[Teach Yourself Computer Science](https://teachyourselfcs.com/)**. Nine
subjects in order, ideally one book and one lecture series each — written
against the "You don't need yet another '200+ Free Online Courses' listicle"
failure — and, for anyone who will not do all nine, a stated fallback of two
specific books. **Steal:** one resource per step, and a named shortest version
for the person who will not finish.

## Proposal

A track is an ordered, capped, maintained list of steps. Below is the shape it
settles into; Scope says which parts of it are worth building, and when.

**1. A track is a line, not a graph.** `steps` is ordered, minimum 3, **maximum
12**, enforced by the schema. No branches, no side quests, no levels within a
track. Optional reading belongs inside a note, not in the sequence.

**2. A step can admit it does not exist.** Five kinds: `note` (a `learn`
reference), `session` (an `events` reference), `build` (make this, no page
needed), `external` (a link, with one line on why it and not something else),
and `planned` — title plus an optional GitHub issue URL. A planned step is a row
with no link and the mono token `NOT WRITTEN YET`: not hidden, not faked.

**3. The count on the page is a real count.** The header carries
`6 / 11 STEPS WRITTEN`, computed at build from resolved references, and
`≈ 3 h 40 m WRITTEN`, summed from `minutes` on published steps only. Never a
total for steps that do not exist — the same rule as the capacity track in
DESIGN.md §10.3, which renders only when a real count exists.

**4. A track that has not been re-read says so, on the page.** `reviewed` is
printed in the meta line. Past 365 days the page prints `REVIEW OVERDUE` and
drops its `.cta-primary`: the track stops recommending itself. This is
DESIGN.md's accepted `stale_after` graft — live values expire rather than lie —
and it is deliberately not a build failure. See Risks.

**5. Every note learns where it sits.** A build-time reverse index in
`src/lib/content.ts` gives `learn/[slug].astro` a footer: *Step 03 of Agents
from zero → next: Give it one tool.* That is the "what comes next" mechanism,
and the highest-value part of this — it works on a note reached from a Telegram
link, with zero JavaScript, and it is worth shipping even if only one track ever
exists.

**6. Every track ends in something with a URL.** The last step is always a
`build` whose output is eligible for `src/content/projects/` at
`stage: prototype`. A track ending in a reading has no end.

**7. Nobody's progress is tracked, and the page says so.** One mono line under
the steps: *Nothing here is recorded. No account, no completion, no
certificate. Bookmark the step you stopped at.* Every step heading is a stable
anchor (`#step-03`) — the whole resume mechanism.

### What NOT to do

- **No progress state, certificates, badges, levels or XP** — for the reason the
  belts were rejected in 012.
- **No filter island.** React is used only for forms on this site; one or two
  tracks do not justify hydrating a route that renders fine as static HTML.
- **No track auto-generated** from `level` and `tags`. A tag-derived order is a
  guess presented as a curriculum.
- **No hour estimate for the whole track.** Only for the parts that exist.

## Scope

**Step 0 — no schema, no route, no code, ~1 hour.** Write the order as a `docs`
entry: `src/content/docs/agents-from-zero.md`, `category: process`. It renders
at the existing `/docs/[slug]` in the READ register, links the notes that exist,
and names the ones that do not. Nothing below ships until this page exists, has
been read by someone who was not in the room, and has survived a term. If
ordering four notes by hand is not worth an hour, it is not worth a collection.
This is the same move 012 makes with its Step 0 and 011 makes by putting the
write-up shape in `docs` rather than a new route.

**Step 1 — the footer only (~2 hours).** The reverse index and *Step 03 of… →
next:* on `learn/[slug].astro`, reading the order from a hand-written array of
slugs in `src/lib/tracks.ts` — about twenty lines, no schema change. (It cannot
live in the `docs` frontmatter: that schema is closed, and Zod drops unknown
keys silently rather than failing, so the array would vanish without an error.)
This is proposal item 5, the highest-value part, and it needs no `tracks`
collection at all.

**Step 2 — the collection (~1 day).** Only once a second track is genuinely
wanted and the first has been re-read at least once. The `tracks` collection,
`/learn/tracks/[slug]`, the counters, `scripts/check-tracks.mjs` into
`pnpm check`, and the footer repointed at it. A second track is the event that
justifies a schema; one track never did.

**Step 3.** A tracks block at the head of `/learn` (READ register per §7.4 — no
`/learn/tracks` index until there are three).

**Rejected, recorded here so it is not re-proposed.** A ~600-byte inline script
ticking steps in `localStorage`. It buys a resume marker the `#step-03` anchor
already buys, and would be the first thing on this site pretending to know
something about a person.

## Data and schema

Steps 0 and 1 change nothing here. What follows is Step 2 only: a new collection
in `src/content.config.ts`, loading `./src/content/tracks`.

```ts
const step = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('note'),     entry: reference('learn') }),
  z.object({ kind: z.literal('session'),  entry: reference('events') }),
  z.object({ kind: z.literal('build'),    title: z.string().max(80),
             minutes: z.number().int().positive(),
             brief: z.string().min(20).max(400) }),
  z.object({ kind: z.literal('external'), title: z.string().max(80),
             url: z.url(), minutes: z.number().int().positive(),
             why: z.string().min(10).max(160) }),
  z.object({ kind: z.literal('planned'),  title: z.string().max(80),
             issue: z.url().optional() }),
])

const tracks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tracks' }),
  schema: () => z.object({
    ...base,
    title: z.string().min(3).max(70),
    goal: z.string().min(20).max(200),   // "You finish with a bot at a URL you can send someone."
    level: z.enum(['intro','intermediate','advanced']).default('intro'),
    assumes: z.array(z.string().max(120)).max(4).default([]),  // behavioural, fast.ai style
    maintainer: reference('people'),      // required: one named owner
    reviewed: z.coerce.date(),            // required: printed on the page
    order: z.number().int().default(0),
    steps: z.array(step).min(3).max(12),
  }),
})
```

`getTrack()` cannot use the existing `resolveReferences`: it drops unpublished
and dangling entries silently, so a `draft` note would make step 04 disappear
and renumber the track between dev and production. **A step whose target is
missing or unpublished degrades to `planned`, keeping its ordinal.** That is a
new resolver in `src/lib/content.ts`, not a reuse.

Guards in `scripts/check-tracks.mjs`, wired into `pnpm check`:

1. Zero resolvable published steps fails. That is an outline; mark it
   `draft: true`.
2. Every step's `minutes` ≤ 90 (fast.ai's unit); a longer step is two steps.
3. No `learn` entry appears in two tracks, or "next" is ambiguous.
4. `reviewed` older than 365 days **warns** and the page degrades itself
   (proposal item 4). It does not fail — see Risks.

No D1 migration, no binding, no vendor, no cost.

## Design

DETAIL archetype (§12.2). Rail carries `04` and the change-bar. Cols 2–9: `d3`
title, `goal` as the lead, then a mono meta line —
`6 / 11 STEPS WRITTEN · ≈ 3 h 40 m WRITTEN · REVIEWED 2026-08-14 · <maintainer>`.
Steps are RECORD: hairline rows, mono ordinals `01`–`12` hanging into the rail,
title, kind token, minutes. No card, no box, no radius, no progress bar, no
connector line — a numbered hairline list is already a sequence. `assumes` sits
above them as a `<dl>`, reusing the shape of the spec table in
`src/pages/events/[slug].astro` — `.facts` is page-local there, so this is a new
shared component or a copy, not an existing class. Cols 11–13 take the sticky
spec table (level, maintainer, reviewed, and the four-line "what this is not").
One PLATE, or the awaiting-photography frame `Plate.astro` already renders —
though `Plate.astro` hard-codes `bleed-right plate--full`, so §12.2's 4:3 at
cols 2–9 is a variant that has to be added.

**Cobalt.** Exactly one `.cta-primary`, `Start step 01 →`, pointing at the first
published step, absent if none is published and absent once the review is
overdue. Planned rows are `--ink-3` with the token `NOT WRITTEN YET`, doubled by
a word as §8.2 requires — never cobalt, never a dashed border, never a skeleton.

**Empty states.** With no published tracks `/learn` renders its existing
`EmptyState`, unchanged. A track with holes renders the holes; a track that is
all holes fails guard 1 and never reaches a page.

## Risks and trade-offs

**The strongest case for doing none of this.** `src/content/learn/` contains one
placeholder file. Four notes do not need a collection, a route, a resolver, a
check script and a discriminated union of five step kinds — they need somebody
to write them in an order and say so in a paragraph. If the ordering problem is
real at four notes, Step 0 solves it for an hour of typing; if it is not real at
four notes, the machinery is a curriculum-shaped hole waiting for a curriculum,
and the placeholder rule exists precisely to stop the site from building those.
A cheaper 80% also exists and is not proposed here: read `level` in
`LearnRow.astro` and sort `intro` first — roughly twenty lines against a new
collection. It does not answer "what comes next", which is why Step 1 exists,
but it should be argued down before Step 2 is argued up.

**How the review gate actually fails.** A build that fails on wall-clock time
fails the *wrong* pull request: someone edits a typo on `/contact` in February,
CI goes red because a track's `reviewed` date crossed 365 days overnight, and
the fastest green is to bump the date without re-reading anything. That is worse
than no gate — it manufactures a false review record and trains people to bump
dates. Hence item 4: the page degrades in public instead, and `pnpm check`
warns. The residual risk is that nobody reads the warning and a stale track sits
there saying `REVIEW OVERDUE` for a year. That is visible, which is the point;
the fix at that stage is deleting the track, not more machinery.

**A named maintainer does not survive graduation, and the build will not tell
you.** `resolveReferences` filters on `draft`/`placeholder`, not on `active`, so
an alumnus still resolves and the row still renders; and a genuinely dangling
reference is dropped rather than crashing, contrary to DESIGN.md §12.2's
"a dangling reference fails the build", which the current library does not
implement. So `maintainer` buys a name on the page and nothing more. Do not
claim it as a safety mechanism.

**Publishing holes may read as unfinished rather than honest.** The `issue` link
mitigates it — a hole reading "write this one →" is a contribution ask, the way
Odin's curriculum grows. Residual risk: eleven rows with two written may look
worse to a first-year than today's flat list of two. If so, raise the
published-step minimum from 1 to 5, or go back to Step 0.

**Sequencing is opinionated and may be wrong.** A third-year assumes things a
first-year lacks; `assumes` is the mitigation and will be incomplete at first.
Twelve steps is arbitrary — chosen to be finishable in a term at a step a week,
and to make an Odin-scale curriculum impossible by accident.

## Success

- **Step 0 worked if** someone who was not in the room worked through the
  ordered list and shipped its last step to a URL that reaches
  `src/content/projects/` at `stage: prototype`. One person is the result; no
  percentage of anything gets reported.
- **Step 2 is justified if** a second track is wanted, and only then.
- Every published note in a track shows its position and next step.
- **Remove it if** a track carries more planned steps than written ones for two
  terms, or `REVIEW OVERDUE` sits on a page for a term. An outline nobody fills
  in is the failure the placeholder rule exists to prevent.

## Effort

**Step 0: ~1 hour** — one Markdown file, no code. **Step 1: ~2 hours** — a slug
array and a footer. **Step 2: M, about a day** — one collection, one route, one
resolver, one reverse index, one check script, a Plate variant, and edits to
`learn/[slug].astro` and `/learn`. No binding, no vendor, no runtime cost: every
count is computed at build and the JS budget stays at zero.

Blocked on 011: with one placeholder note, all three steps render nothing in
production. The real cost is one person deciding what order the notes go in,
writing the `goal` sentence honestly, and re-reading it once a year. Everything
a paid team would add — grading, tracking, certificates, adaptive ordering — is
what a volunteer community cannot sustain and must not simulate.
