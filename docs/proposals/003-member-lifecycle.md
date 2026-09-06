---
title: Model the member lifecycle from first Friday to alumni
status: draft
area: operations
effort: M
depends_on: []
---

# 003 — Model the member lifecycle from first Friday to alumni

| | |
|---|---|
| **Status** | draft |
| **Area** | operations |
| **Effort** | M (phase 1 is XS — an afternoon) |
| **Depends on** | — |

## Problem

`src/content/people/` contains exactly one file — `example-member.md`, marked
`placeholder: true`. Zero real members are published. Everything the repository
records about a person's relationship to QairuHub is one row in `submissions`
carrying a `status` of `new`, `reviewing`, `accepted`, `declined` or `spam`,
edited by typing `wrangler d1 execute` into a terminal, plus one boolean —
`people.active`, default `true` — with nothing written anywhere about what makes
it false, who decides, or what happens afterwards.

That gap is specifically ours for three reasons.

1. **Visibility here is a git operation.** All content is Markdown added by pull
   request, so appearing on `/people` already means someone opened a PR. Today
   that is an accident of the architecture. It could be the first contribution.
2. **The site refuses to display what it cannot prove** (`docs/CONTENT.md`).
   Which states are public artefacts and which are private notes therefore has
   to be decided explicitly, and has not been.
3. **One person owns everything and will graduate.** `.github/CODEOWNERS` names
   `@tairqaldy` on every path, including `/src/content/` and `/docs/`. QAIRU's
   cohort turns over on a fixed annual clock. The standard failure of a student
   society is the person holding the credentials leaving with the institutional
   memory, and nothing in this repository would notice it happening.

## Prior art

**[Recurse Center — the User's Manual](https://www.recurse.com/manual).** Two
states, in batch and alum, no third. Alums keep the space permanently — *"all
day, every day, regardless of when you attended RC"* — under one standing rule:
*"Please do not use the Hub to do work for your day job."* The
[Zulip case study](https://zulip.com/case-studies/recurse-center/) has the
number and the mechanism: *"Almost 30% of the RC community is regularly active
on Zulip"*, in an alumni check-in channel where *"each alum uses a dedicated
topic ... Some alums drop by weekly, while others might come around once a
year."* **Steal:** two states, permanent membership, one long-running thread per
alum — a format in which a two-year silence is not a failure. **Leave:** the
batch and the building. RC's
[Never Graduate Week 2017 write-up](https://www.recurse.com/blog/114-never-graduate-week-2017-how-we-planned-and-ran-our-annual-alumni-week)
reports roughly $19,500 for 200+ people from 33 batches. Ours costs zero or does
not happen.

**[South Park Commons — FAQ](https://www.southparkcommons.com/faq/).** A
six-month residency, *"fee-free and equity-free"*, with *"only one expectation
of our members: that they show up"*, ending in three named exits — Founder
Fellowship, further funding, or *"work on their next endeavor full-time."*
**Steal:** one legible expectation, and naming the exits in advance so leaving
is a planned step rather than a disappearance. **Leave:** everything downstream
of the fund — and note that the FAQ grants lifetime membership to Founder
*Fellows*, not to residency members. "Access for life" is not the free part.

**[Hack Club — clubs](https://hackclub.com/clubs).** *"Every meeting ends with
demos. Showing your work creates momentum, confidence, and community."*
**Steal:** the demo as the membership event — attendance is not the artefact,
the thing shown is. **Leave:** the Slack-first model; ours is Telegram.

**[Imperial College Union — handover](https://imperialcollegeunion.freshdesk.com/support/solutions/articles/101000532492-handover).**
The least glamorous and most relevant. *"Both outgoing and incoming committee
members share responsibility for completing the handover"*, and the list starts
with credentials — *"login details and passwords, including the ... email
account and social media accounts"* — before constitution, budget and risk
assessments. **Steal:** handover as a dated artefact per role, credentials
first. **Leave:** the equipment inventory, and note what the page does *not* do:
it sets no deadline and no escalation if you inherit nothing. That is the half
that would actually bind us.

**[Kubernetes community membership](https://github.com/kubernetes/community/blob/main/community-membership.md).**
Written requirements per rung; two sponsors with *"close interactions with the
prospective member"*; and inactive members — *"no contributions across any
organization within 12 months"*, measured by CNCF DevStats — removed from a
public data source rather than from an opinion. **Steal:** written criteria, and
an inactivity rule read from public artefacts. **Leave:** the permissions
ladder, and the two-sponsor gate: at our size that is a popularity vote.

[Nielsen, *Participation Inequality*](https://www.nngroup.com/articles/participation-inequality/)
(2006): 90% lurk, 9% *"contribute from time to time"*, 1% *"account for most
contributions"*. That ratio means the community is normal, not broken, and
`membership.md` should say so out loud.

## Proposal

Write the lifecycle down as five named states, publish the definitions, and
implement only the parts the repository can prove. No admin panel, no login, no
attendance register.

| State | What it means | Moves in when | Moves out when | Where it lives |
|---|---|---|---|---|
| `applied` | A `membership` submission exists | Form submitted | Reviewed | `submissions.status` = `new` / `reviewing` |
| `member` | Accepted, in the Telegram group, invited to Fridays | `status = 'accepted'` | Never automatically | `submissions.status` |
| `contributor` | Their name is on a public artefact | A merged PR adding `src/content/people/<name>.md` | Never — see alumni | Git + `people` |
| `lead` | Owns a unit or programme, holds credentials | Named as `lead` on a `programs` entry | A handover doc is merged | `programs.lead` + `CODEOWNERS` |
| `alumni` | Left, on the record | `active: false` with an `until` date | — | `people` |

The first two are **private**: an accepted application is not evidence that a
person is part of anything, and the site cannot honestly show it. The last three
are **public**, each backed by a file in the repository anyone can read.

There is deliberately no `prospective` state. Nothing here can tell that someone
walked into a room, and a state only a human's memory can verify is exactly what
this proposal refuses everywhere else.

**What "active" honestly means.** Not attendance — a register nobody fills in is
worse than none (see 008). Active means *a public artefact in the last twelve
months carrying your name*: `events.hosts`, `learn.authors`, `projects.team`,
`posts.author`, or the PR that added you. All four fields are already
`reference('people')`, so this is computable from content collections with no
new storage and no new habit. Booking rooms and answering Telegram at midnight
are invisible to it, which is why the phase 3 sweep is advisory only.

**Leaving.** Alumni is announced, not decayed into. `active: false` requires an
`until` date and, for anyone named as a `programs.lead`, a merged handover
document in `src/content/docs/` (category `process`) naming the successor, what
they now own, and where the credentials are — Imperial's first item.

**The first two weeks** (phase 2). One page, `/start`, no account, three steps:
come to a Friday (date and room read from `events` at build time); pair on
someone else's thing, not your own; open the pull request that adds you, `since`
set to that Friday. That PR is the join action, the first contribution and the
git lesson at once — the one moment where Markdown-by-PR is an advantage rather
than a tax. Anyone who cannot do it alone is paired with someone who can, which
is step 2 for the other person.

**Alumni without pestering** (phase 3). Two contacts a year, dated in advance:
the annual note and the year-end demos. No newsletter, no mailing list, no
directory of contact details. Each alum may instead publish one `offer` line on
`/people` — one specific, freely given thing ("CV review, 30 minutes, email
me"). A list of offers is honest; a list of contact details is an asset waiting
to be mined.

## Scope

**Phase 1 — the exit rule (XS, no new page).** Two fields on `people` (`until`,
`succeededBy`) with a `superRefine`, plus `src/content/docs/membership.md`
publishing the state table. `membership.md` renders through the existing
`/docs/[slug]` route, so this ships without a new template, a new component, a
script, or a database change. It is the whole of the answer to reason 3 in
Problem, and it is an afternoon.

**Phase 2 — the entry path (S).** The `/start` page, the `since` field, and the
line the apply receipt already owes: DESIGN §12.3 requires *"one line on what to
do meanwhile: come Friday, room and time"*, and `ApplyForm.tsx` does not render
it. `ApplyForm` is a client island with no content access, so the page must pass
the next event down — `src/pages/apply/index.astro` calls `getUpcomingEvents()`
and hands `ApplyForm` a `nextEvent` prop of `{ starts, room }`. While there,
`NEXT_STEPS.membership` is three steps, not four.

**Phase 3 — alumni and the sweep (M).** The `offer` field, rendered in the
alumni group; and `pnpm lifecycle`, a report over content collections printing
each person's most recent public artefact and flagging anyone past twelve months
as *a question to ask*, not a change to make. Run once a year at handover.

**Explicitly not proposed:** attendance tracking, logins, points, badges,
streaks, a directory of contact details, automatic demotion, or any state only a
human's memory can verify.

## Data and schema

`src/content.config.ts`, `people` collection. Phase 1:

```ts
/** Set together with active:false. An alum has a leaving date, not a gap. */
until: z.coerce.date().optional(),
/** Who took the role over. Required when a programme lead sets active:false. */
succeededBy: reference('people').optional(),
```

Plus a `superRefine` on the object: `active: false` requires `until`, and `until`
requires `active: false`. A dangling `succeededBy` already fails the build
(DESIGN §12.2). Phase 2 adds `since: z.coerce.date().optional()`; phase 3 adds
`offer: z.string().max(120).optional()`. All four are optional, so no existing
entry breaks — `example-member.md` is the only one there is.

**D1: no migration, in any phase.** Note for whoever tries: SQLite has no
`ALTER TABLE … DROP CONSTRAINT`, so widening the `submissions.status` CHECK means
rebuilding the table and rewriting `migrations/0001_create_submissions.sql`'s
unique index. The existing five values already cover `applied` and `member`. Do
not widen them for tidiness. The phase 3 report reads content collections and
stores nothing.

## Design

`membership.md` is a DOC page (§12.4): numbered clauses, mono clause numbers in
the rail, no cards. `/start` is DETAIL-shaped READ (§12.2, §7.3) — three numbered
steps in the rail, 68ch body, one PLATE at 4:3, and exactly one `.cta-primary`,
the next Friday.

In the state table, only tokens actionable now take `--cobalt-text`
(`ӨТІНІШ АШЫҚ`); `АЛУМНИ` and `АРХИВ` are `--ink-3` (§8.2).

`/people` already renders the alumni group: `people.astro` calls `getAlumni()`
and omits the section entirely when it is empty — more honest than an empty
state, and no change needed. Phase 3 touches `PeopleStrip.astro`, which renders
portrait, name and role in a six-column grid with nowhere to put an `offer`
line. Render the alumni group as READ instead: §7.4 requires that below three
entries, and it will be below three entries for years.

## Risks and trade-offs

**The strongest argument against doing this at all.** There are no members.
`people` holds one placeholder, `docs` holds one placeholder charter, and
`STATUS.md` ranks "two or three real people" as the highest-value missing thing
on the site. A five-state lifecycle for a roster of zero is a governance
document for an imagined organisation — the exact failure the honesty rule
exists to prevent — and every afternoon spent on it is one not spent getting a
real person onto `/people`. The only honest rebuttal is that phase 1 is two
schema fields and one Markdown file, is written *for* the person who does not
exist yet, and otherwise gets written in the week the current lead graduates,
which is the worst possible week to write it. If that does not persuade you,
reject this and write `charter.md` instead.

- **CODEOWNERS cannot enforce the handover rule.** GitHub requests a review from
  an owner; it does not check for an attached document, and a sole owner cannot
  be blocked by a rule that only summons him. "No handover doc, no lead change"
  is a promise until there is a second core reviewer. The `superRefine` *does*
  fail the build, which is why phase 1 puts `until` and `succeededBy` in Zod
  rather than in a review checklist.
- **The PR-to-join step excludes people.** A first-year who has never used git
  will bounce. Someone who never opens the PR is still a member, just not on the
  site — true rather than unfriendly. If several stall, write it for them.
- **`/start` overlaps 012**, which also owns the walk-in door. If both ship,
  `/start` is a second answer to the same question in a different voice.
  Whichever lands first owns the first-Friday copy; the other links to it.
- **A ladder becomes a status game.** The public states describe artefacts, not
  rank, and `contributor` needs nothing beyond one merged PR. If people start
  describing themselves by rung, cut it to `member / lead / alumni`.
- **Nobody runs phase 3.** Likely — which is why it hangs off handover, the one
  annual event a graduating lead cannot skip, and why its output is a question
  rather than a state change.
- **Privacy.** `/people` is opt-in and always was. Nothing here adds a D1 column
  or records anything about a person who did not open a PR about themselves.

## Success

At twelve months — one full cohort turn, which is the only interval this
proposal is about:

- every person named as a `programs.lead` who has left has a merged handover
  document naming a successor, and `succeededBy` resolves;
- at least three people have a `src/content/people/` entry they wrote themselves;
- `membership.md` still matches what actually happens.

`membership.md` should say plainly that most members will be inactive most of
the time. 90-9-1 is the baseline, not the target. Ten people who each did one
visible thing this year is a healthy year for a volunteer club.

**Remove it if:** the state table is being maintained by hand in a way that no
longer matches reality, or phase 1 is still the whole of it after a year because
nobody needed the rest. A lifecycle that lies is worse than none; the fallback
is the `active` boolean we already have.

## Effort

Phase 1: XS — two schema fields with a refinement, one Markdown file on an
existing route. An afternoon.
Phase 2: S — one static page, one prop threaded from `apply/index.astro` into
`ApplyForm.tsx`.
Phase 3: M — a script over content collections, plus a `PeopleStrip` change
blocked on there being real alumni.

No hard dependencies. Overlaps 012 (`/start`) and 008 (attendance, which this
deliberately does not do). A future `/admin` (001) would render the two private
states, but is not required.
