---
title: Keep the project registry true, and browsable later
status: draft
area: community
effort: S
depends_on: []
---

# 013 — Keep the project registry true, and browsable later

| | |
|---|---|
| **Status** | draft |
| **Area** | community |
| **Effort** | S |
| **Depends on** | — |

## Problem

Say the embarrassing part first: **production lists zero projects today.** Everything in
`src/content/projects/` is `placeholder: true`, so `/projects` renders its empty state,
correctly. Nothing here is urgent, and half of it is not useful yet. What follows is an
argument about which half is cheap to fix now and which half must wait for entries.

The interface half. `getProjects()` in `src/lib/content.ts` sorts launched → prototype →
idea → archived, then newest first, and `src/pages/projects/index.astro` pipes that into
one flat list of `ProjectRow`. No filtered view is linkable. That is fine at four rows
and useless at forty, and it is not the part that decays.

The half that decays is time. A project registry rots in a way an events diary does not:
an event stays true once it has happened, but a project row makes a **present-tense
claim** — this exists, this is a prototype, this demo works. Nobody opens a pull request
to say they stopped. So the page only grows, `stage: prototype` from March 2026 sits
beside `stage: prototype` from March 2028 looking identical, `demo` URLs 404 on expired
free tiers, and the registry makes the club look larger than it is. That breaks the one
rule in `docs/CONTENT.md` more slowly and more convincingly than a made-up member count
would, because every row was true when it was written. The obvious fix — chase every team
each term — is exactly the curation `docs/STATUS.md` says one busy maintainer cannot
sustain. Whatever we build has to survive four months of silence.

## Prior art

**[The YC Startup Directory](https://www.ycombinator.com/companies)** — a company that
failed stays listed, marked, one-liner intact. `status` is a first-class field taking
**Active / Inactive / Acquired / Public**, alongside `batch`, `industry`, `tags`,
`team_size`, `regions` and `one_liner`
([documented field list](https://apify.com/straightforward_hydra/yc-companies)).
*Steal:* status as a facet rather than a deletion, and the one-liner as the atomic unit
— the directory is legible because a row is a name, a date and one sentence. *Leave:*
the `top_company` flag. A club of thirty ranking its own students' projects is how you
make people stop submitting them.

**[Devpost's project gallery](https://help.devpost.com/article/80-what-is-the-project-gallery)** —
search indexes title, description, sponsor prizes, custom-question answers and screen
names; sort is three fixed options, defaulting to oldest-first, with recently-added and
by-name. *Steal:* a small fixed set of named sorts, never a sort builder. *Leave:* the
premise that a project is frozen at submission. Devpost rows are snapshots and correct
as such; ours claim to be current, a far harder promise.

**[This Week in Rust](https://this-week-in-rust.org/)** — content enters
[by pull request against a file in `drafts/`](https://github.com/rust-lang/this-week-in-rust),
and [Call for Participation](https://users.rust-lang.org/t/twir-call-for-participation/4821)
pushes the work onto the submitting project: label the difficulty, keep the issue tracker
public, link `CONTRIBUTING.md` if you have requirements. The ecosystem page
[Are We Learning Yet](https://github.com/anowell/are-we-learning-yet) keeps its crate
statistics current with **a weekly cron job**, not by hand. *Steal:* both — PR-shaped
intake, and the rule that anything needing recurring attention is a scheduled job or it
does not happen. *Leave:* the weekly cadence. We have neither the volume nor the people.

**Endings, designed.** The [Apache Attic](https://attic.apache.org/) exists "to make it
clear when an Apache project has reached its end of life", and it
[publishes the count](https://attic.apache.org/stats.html): **112 projects retired**,
plotted by year, 18 of them in 2020 alone.
[Archiving a GitHub repository](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories)
makes issues, code, releases and comments "read-only", keeps the repo searchable and
badged, and is undone from the same settings panel. Open Collective refuses deletion
once there is history and offers archiving instead —
[explicitly reversible](https://docs.opencollective.com/help/collectives/collective-settings/closing-a-collective).
*Steal:* archiving as a normal, reversible, undramatic state change, and publishing how
many have ended, so an archived row reads as ordinary rather than as failure. *Leave:*
the ceremony. For a student who moved on to a thesis, ending a project has to cost one
line in one file.

## Proposal

**1. Publish when the row was last confirmed, not a guess about the team.** The field
that fixes registry rot is `checkedOn` — *the last date a human confirmed this row still
describes reality*. It is the honest quantity because it is a fact about **us**: a row
unchecked for eight months does not say the project is dead, it says the registry has
not looked. That distinction is the whole anti-shaming design. Three things follow,
computed at build time:

- A row not confirmed within **180 days** (one term plus margin) renders a mono line,
  `Last confirmed 2026-02-14`. Never on `archived` rows — an ending stays true — and
  never on `launched` rows in their first year, because a finished tool that needs no
  commits is not decaying.
- `stage: archived` requires `stoppedOn` and accepts an optional 160-character
  `stoppedNote` written by the team. The row keeps its name, one-liner, team credit and
  repo link. Nothing is deleted, ever.
- The archived group carries one true sentence — *stopping is the normal outcome for
  most student projects* — and its count, derived from real content and therefore a
  number we are allowed to print.

**Explicitly rejected: health derived from GitHub activity.** Commit cadence needs a
build-time token, breaks reproducible builds, measures the wrong thing (a launched tool
needs no commits), and publishes surveillance of volunteers' work rate. We publish when
we last asked, not how often they push.

**2. The term prompt.** A GitHub Actions workflow on `schedule:` (1 September, 1
February) opening **one** issue — "Registry check — Autumn 2026" — listing every project
past its 180 days with its file path and the team's handles. One issue, twice a year,
worked through in twenty minutes or ignored. It needs only `GITHUB_TOKEN` with
`issues: write` and no Cloudflare credential, so unlike the gated `Deploy` workflow in
`docs/ARCHITECTURE.md` there is nothing to provision first. The message to each team is
one sentence — *is this still true, or should we mark it stopped?* — with "stopped"
offered as an equally good answer.

**3. Browsing, as pre-rendered routes, not as an app** — once there are enough rows to
browse. Facets become real URLs generated by `getStaticPaths`:

| Route | Contents |
|---|---|
| `/projects/` | Default: stage rank, then newest. Archived excluded, linked at the foot. |
| `/projects/stage/[stage]/` | `idea` · `prototype` · `launched` · `archived` |
| `/projects/tag/[tag]/` | One page per tag in the controlled vocabulary |
| `/projects/from/[program]/` | One page per programme that has projects |
| `/projects/a-z/` | The one alternative sort. Lookup, not ranking |

The filter bar is mono chips that are `<a>` elements; the sort is a named route, not a
control. That is `DESIGN.md` §12.1 — filter state in the URL, server-rendered, a
filtered view is a shareable link — with **zero bytes of JavaScript**, a stronger
reading than the `client:visible` island §12.1 sanctions. One alternative sort, not
three: at forty rows a second ordering is lookup, a third is decoration.

**No search box, and here is the crossover.**
[Pagefind](https://pagefind.app/) claims full-text search over a 10,000-page site "with
a total network payload under 300kB", "closer to 100kB" for most. Its fixed cost is the
problem: an
[independent measurement of a 555-page site](https://eklausme.github.io/blog/2023/10-23-pagefind-searching-in-static-sites/)
reports **100KB of JavaScript**, under 20KB of CSS, index chunks around 40KB and 596
files in all. `DESIGN.md` §15 budgets **under 100KB of JS for a whole content route** —
the loader alone spends it before fetching a chunk. Against sixty rows of `name` +
`oneLiner` + `tags`, roughly 16KB uncompressed. Pagefind is right when the index dwarfs
its runtime; here it is the other way round, and Ctrl-F works on one page. Revisit it
for a site-wide `/search` only when `learn` + `posts` + `events` + `docs` pass roughly
300 pages.

## Scope

The ordering is forced: there are zero real projects, and the chip bar is not allowed to
render below eight of them (Design, below). Building browsing first ships a control that
cannot appear.

**Phase 1 — honesty. Do now.** Three schema fields, the `superRefine`, `isStale()`, the
last-confirmed line, the archived treatment and its one sentence. Zero new routes. Doing
it while every entry is still `placeholder: true` costs nothing; doing it later is a
retrofit across every real file.

**Phase 2 — the term prompt. Do with phase 1.** The twice-yearly issue workflow. It has
nothing to list without phase 1's fields, and the first term boundary after the first
real project is the first time it can fire usefully.

**Phase 3 — browsing. Gated on eight published projects, not on a date.** Facet routes,
the chip bar, derived counts, the tag vocabulary, the reserved-slug guard.

**Not in scope, and it should stay that way:** a link checker that HEADs every `repo`
and `demo` — many hosts answer `405` to `HEAD`, and a checker that cries wolf is worse
than a dead link nobody clicked; per-person contribution pages (a `people` proposal);
stars or any popularity metric; any React island.

## Data and schema

`src/content.config.ts`, `projects` only:

```ts
/** Last date a human confirmed this row still describes reality. */
checkedOn: z.coerce.date().optional(),
/** Required with stage: 'archived'. */
stoppedOn: z.coerce.date().optional(),
/** One plain line on why it stopped. Written by the team, never by us. */
stoppedNote: z.string().max(160).optional(),
```

plus a `superRefine` — the mechanism `DESIGN.md` §13 already requires for `coverAlt` —
asserting that `archived` implies `stoppedOn`, that `stoppedOn` and `stoppedNote` are
absent otherwise, and that `checkedOn` and `stoppedOn` are both `>= started`.

No `supersededBy`. It is the field everyone wants and nothing in this proposal renders
it; add it with the page that shows it.

`src/lib/content.ts` gains `STALE_AFTER_DAYS = 180`,
`lastConfirmed(p) => p.data.checkedOn ?? p.data.updatedDate ?? p.data.started` — the
`updatedDate` fallback already exists on every collection via `base` — and
`isStale(p, now)`. No D1 migration, no new binding.

**Phase 3 only.** `tags` narrows to `z.array(z.enum(TAGS))`, `TAGS` exported from a new
`src/lib/taxonomy.ts` capped at **24** entries: free-text tags generate unbounded facet
routes and twenty near-synonyms, and a build failure on an unknown tag is the cheapest
taxonomy review available. `getProjectsByStage/Tag/Program()` and `getProjectFacets()`
return only facets with **two or more** entries — a chip returning one row is noise. One
unit test reserves `stage`, `tag`, `from` and `a-z` as project slugs, since
`src/pages/projects/[slug].astro` builds from `project.id` and shares that namespace.

## Design

RECORD register throughout; rows are the existing `ProjectRow`, unchanged.

- **Chips** obey §8.2 rule 6: the active chip is a 1px `--cobalt` border and a
  `--cobalt-text` label on a transparent ground, never a fill. The page's one cobalt
  fill is `Add a project →` at the foot; facet pages inherit it, none gets two.
- **The last-confirmed line** is 11px mono in `--ink-2` in the row's meta column.
  `--ink-3` is what a quiet line wants to be, and §14 forbids it: *"11px mono is
  `--ink-2` or brighter."* Not cobalt either — cobalt marks what is live or changed in
  the last seven days, and staleness is neither. The archived state token stays
  `--ink-3` per §8.2 item 8; `stoppedNote` is one plain sentence in the row body.
- **§7.4 governs the thin case:** under three projects the page is READ with no chip
  bar; the bar appears at eight or more, and only for axes that partition. A facet route
  exists only when it has entries, so no chip links into emptiness. An empty
  `/projects/` keeps today's `EmptyState`.
- **Below 768px** chips wrap to a second line — no scroller, no drawer, no accordion.
  Zero JS on `/projects/**` is a **new** assertion in `tests/e2e/design-law.spec.ts`;
  nothing enforces it today, and that file's `ROUTES` is a literal array, so every facet
  route has to be added to it or it is untested.

## Risks and trade-offs

**The strongest case for doing none of this.** The registry has no rows. Every problem
above is forecast, not observed, and the forecast assumes a second year that has not
happened. A club that folds in June never suffers registry rot, and a club with six
projects does not need facets — the `/projects` page as written today is adequate for
every state the site has actually been in. The honest counter is narrow: phase 1 is
three optional schema fields and one predicate, it costs a few hours, and doing it
before the first real project is the difference between a field contributors fill in
from habit and a retrofit across every entry. That argument justifies phase 1. It does
**not** justify phase 3, which is why phase 3 is gated on a real count rather than a
date. If phase 1 ships and the registry is still under eight rows in a year, the correct
outcome is that phase 3 is never built.

**The scheduled workflow will disable itself.** GitHub: *"In a public repository,
scheduled workflows are automatically disabled when no repository activity has occurred
in 60 days"*
([docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)).
`github.com/tairqaldy/qairuhub-web` is public, and a twice-yearly cron is precisely a
workflow whose repository goes quiet over a summer break — the check fires in September
only if someone pushed in July. Mitigation: the site publishes the check date rather
than asserting freshness, so a missed cron degrades into a visibly older date rather
than a silent lie. A `workflow_dispatch` trigger makes the manual run one click.

**Adding a workflow file breaks a passing test.** `tests/unit/workflows.test.ts`
asserts the workflow list equals exactly `['ci.yml', 'deploy.yml']`. The new file
requires editing that assertion in the same commit, and it must stay an exact list — the
test exists because a silently no-op workflow looks like a passing one.

**The last-confirmed line could read as a scoreboard.** Mitigated by wording it about
the registry, suppressing it on archived and recently-launched rows, and never colouring
it. If students report it as pressure, delete the line and keep the field.

**The clever no-JS alternatives lose.** CSS-only sorting works — build-time ranks plus
flex `order` — and must not be used: visual order would diverge from DOM order, breaking
tab order and screen-reader sequence for rows full of links. Filtering with
[`:has()`](https://labs.steren.fr/2022/pure-css-content-filtering-has/) is now broadly
supported but cannot produce a count, a page title or a shareable URL. Pre-rendered
routes cost ~35 extra pages of a few KB each at the enum ceiling, and win on every axis
except cleverness.

## Success

Only what could change a decision, and all three read off the repository rather than
analytics — the site has no analytics beacon installed, so any metric phrased as a
pageview is a metric nobody can read.

- **The share of non-archived rows confirmed within 180 days**, at each term boundary,
  from a `pnpm` script over the content collection. Target ≥90% after the second cycle.
  **Below 60% twice running, remove `checkedOn` and the line it renders**: a freshness
  date nobody maintains is worse than none.
- **At least one archived row carrying a `stoppedNote` written by its own team** within
  a year — evidence the ending is not experienced as punishment. Zero after two cycles
  means the framing failed and the archived treatment should be reconsidered, not
  reworded.
- **Phase 3 never becomes buildable.** If the registry is under eight published projects
  a year after phase 1, that is the answer, and the facet work should be closed as
  unnecessary rather than carried in the backlog.

## Effort

**S.** Phase 1 is a few hours — three fields, one `superRefine`, one predicate, one line
of row markup, one archived group. Phase 2 is one workflow file plus the edit to
`tests/unit/workflows.test.ts`. Phase 3, if it is ever earned, is a day. No new vendor,
no new binding, no D1 migration, no dependency added, and one (Pagefind) declined.
Independent of every other proposal.
