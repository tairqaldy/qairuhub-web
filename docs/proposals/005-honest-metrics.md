---
title: Measure only what would change a decision
status: draft
area: operations
effort: S
depends_on: ['008-attendance', '002-application-review', '001-admin-console']
---

# 005 — Measure only what would change a decision

| | |
|---|---|
| **Status** | draft |
| **Area** | operations |
| **Effort** | **S** for phases 0–1. M only if the console page in phase 2 is built. |
| **Depends on** | 008 for attendance rows, 002 and 001 for anything that writes `reviewed_at`. This proposal defines and renders; it collects almost nothing itself. |

## Problem

QairuHub records intent and nothing else, and the person who would notice is a
full-time QAIRU student.

- `submissions` carries `status` and `reviewed_at`
  (`migrations/0001_create_submissions.sql`). `insertSubmission()` is the only
  write path in `src/lib/db.ts`, so `status` is `'new'` on every row that
  exists and `reviewed_at` is `NULL` on every row that exists.
- `listSubmissions()`, `countForEvent()` and `pruneRateLimits()` are exported
  from `src/lib/db.ts` and called from nowhere in the repository.
- `wrangler.jsonc` has no `triggers` block. Nothing runs on a schedule.
- Everything in `src/content/` is `placeholder: true`, so today every
  denominator below is zero.

Reading any of it is `wrangler d1 execute --remote` from a laptop
(`docs/STATUS.md`). At a handful of applications a week that is not a tooling
problem — a terminal is fine for ten rows. The problem is that nobody counts
the same thing twice, so the two questions this term turns on — *is the Friday
slot working?* and *do people who apply ever turn up?* — are settled by whoever
remembers hardest.

Meanwhile the numbers that are free to produce — page views, Telegram members,
`SELECT COUNT(*) FROM submissions` — are exactly the ones a report to the
university will ask for, and none of them would change what happens on a
Friday. At n ≈ 10 a confident wrong number is worse than no number: one person
is eight percentage points.

`docs/CONTENT.md` governs what we publish. This turns the same rule inward: **a
metric that could not change a decision is not collected, and a number never
appears without its denominator.**

## Prior art

**[GOV.UK Service Manual — Measuring success](https://www.gov.uk/service-manual/measuring-success)**
mandates four KPIs for every government service: digital take-up, user
satisfaction, completion rate, cost per transaction.
[Completion rate](https://www.gov.uk/service-manual/measuring-success/measuring-completion-rate)
is "the number of digital transactions that your users complete as a percentage
of all digital transactions that your users start", and the actual work is
naming the start page and the end page first.
*Steal:* name the start and the end before measuring the middle.
*Leave:* the other three. Cost per transaction and digital take-up cannot vary
for us; importing a mandated KPI set is how a page fills with dead dials.

**[CHAOSS Starter Project Health](https://chaoss.community/kb/metrics-model-starter-project-health/)**
is deliberately **four** metrics, not the full catalogue:
[Time to First Response](https://chaoss.community/kb/metric-time-to-first-response/),
Change Request Closure Ratio,
[Contributor Absence Factor](https://chaoss.community/kb/metric-contributor-absence-factor/)
("the smallest number of people that make 50% of contributions"), Release
Frequency. Every metric page states a question, a collection method, and a
data-ethics notice: "The usage and dissemination of health metrics may lead to
privacy violations."
*Steal:* the small fixed set, the per-metric question, and Time to First
Response — a metric about the organisers, not the students.
*Leave:* the GrimoireLab and Augur tooling. A volunteer cannot run a pipeline.

**[Hack Club HQ's public ledger](https://hcb.hackclub.com/hq)** — a student
organisation publishing balances, transactions, donors and grants rather than a
summary, and labelling its own transparency "best effort".
*Steal:* publish the record rather than the headline, and state how good the
record is. *Leave:* the always-on dashboard. Theirs is a by-product of
[software they maintain full-time](https://hackclub.com/fiscal-sponsorship/open-source);
ours must survive a week when nobody opens the laptop.

**[MLH Hackathon Organizer Guide](https://guide.mlh.com/)** keeps
[check-in](https://guide.mlh.com/general-information/managing-registrations/check-in-process.md)
as a record separate from registration, because it "gives you a clear
demarcation of who actually attended the event". Its answer to attendance is
[one reminder a week before](https://guide.mlh.com/general-information/managing-registrations/sending-reminders.md)
carrying "clear instructions about when and where to check-in" — and an
instruction not to send more than that.
*Steal:* the split, and the remedy being one reminder rather than more
registrations. *Leave:* the post-event NPS survey — at n = 9, with the
respondent three metres from whoever ran the session, it is theatre.

**[Code Club's 2025 annual survey](https://www.raspberrypi.org/blog/discover-the-incredible-impact-of-code-club-the-code-club-annual-survey-report-2025/)**
reports 7,494 clubs and ~257,000 young people, 43% of them female, from 775
mentor responses.
*Steal:* one survey a year, and reporting the *composition* of who comes, not
only the total. *Leave:* the headline "96% of mentors responding to our surveys
agreeing that creators have increased skills". A self-report by the people
running the thing is the most seductive number in this space, and it is the one
that travels.

## Proposal

Six metrics. Each has one source, a stated failure mode, a floor below which it
renders nothing rather than a figure, and one decision it feeds.

| # | Metric | Source | Fails when | Floor | Decision |
|---|---|---|---|---|---|
| 1 | **Show rate** — heads ÷ signups | `events.attended` ÷ `countForEvent()` | `countForEvent()` counts every non-spam row carrying that `event_slug`, so a hackathon signup and an RSVP land in one denominator; `walkIn: true` events have no denominator at all; friends brought along push it over 1.0 | 3 gated sessions | 90% means the RSVP is theatre — drop it. 35% means send MLH's one reminder that morning |
| 2 | **Heads per session, in order** | `events.attended` | The counter rounds up and wants it to be big; a guest night is not a working night; exam weeks are not anything | 6 sessions | Four straight sessions under five: change the time, room or format — or stop |
| 3 | **Reply latency** — median days `created_at` → `reviewed_at` | `submissions`, once 002 or 001 writes `reviewed_at` | `reviewed_at` records a row being touched, not a human replying | 5 reviewed | Whether "reviewed weekly" (`src/pages/apply/index.astro`) and §12.3's five working days are promises or lies |
| 4 | **Application → first attendance ≤ 30 days** | 008's `attendance` ⋈ `submissions` on the hashed email key | Someone already attending before applying scores as a conversion; a personal address on the form and a university one at check-in is invisible, undetectably | 10 applications | Low means the fix is a named first session for accepted applicants, not more applications |
| 5 | **Return after week four** — first seen in week W, seen again in W+4 or later | 008's `attendance` alone | At n = 12 one person is eight points; summer and exams break the week grid; leaving Fridays for a project team reads as churn and is a success | 8 weeks, 12 people | Whether the programme has a middle. If people come twice and vanish, the fault is between sessions 2 and 3 |
| 6 | **Projects reaching a demo, per term** | `src/content/projects/` — git only, no person tracked | An entry exists only if someone wrote the file, so deaths go unrecorded; `stage` is self-declared and drifts up | 5 started | Whether the accelerator's shape works. 1 of 9 means shorten it, or fix a demo night to a date |

**Metric 3 is the one most likely to force a decision this term**, and it is
about us, not the students. It is also the one this proposal does least work
for: 002 defines the review sitting and 001 builds the control that writes
`reviewed_at`. If neither ships, metric 3 has no source and renders nothing.

**Metric 6's denominator is the trick.** The numerator is `demoedAt` — a date
on which the thing was shown to a room — not `stage: 'launched'`, which is
self-assessed. The entry must be created at `stage: idea` on day one, or the
denominator holds only survivors and the metric reports 100% forever.

### The numbers we refuse

Refuse a number if **(a)** it can only go up, **(b)** no plausible value of it
would change a decision, or **(c)** it would be quoted publicly more often than
acted on.

- **Total members.** Cumulative and monotone;
  [a16z](https://a16z.com/16-startup-metrics/) notes such charts "can go
  up-and-to-the-right *even when* a business is shrinking". Our only definition
  is `SELECT COUNT(*) FROM submissions`, which counts someone who applied in
  March and never came back — and, since `0002_allow_repeat_contact.sql`,
  counts a person who wrote to the contact form four times as four. Fails all
  three tests, and it is the number most likely to reach a report for the
  university, which is why it corrupts.
- **Page views as a headline.** Keep the tool; refuse the headline. Nothing we
  would do differently depends on 400 views versus 600.
- **GitHub stars.** Measures who posted a link, not who is in the room.
- **Telegram or Discord members.** Cumulative; nobody leaves a group.
- **NPS and satisfaction scores.** Not until >30 attendees and true anonymity.
- **Workshop-hours delivered.** Effort, not outcome; it rises when things go
  badly.

### Analytics: Cloudflare, nothing heavier

§15 already says Cloudflare Web Analytics only, and that holds. Cloudflare
["don't use any client-side state (like cookies or localStorage) for analytics
purposes"](https://blog.cloudflare.com/privacy-first-web-analytics/) and do not
fingerprint by IP or User Agent, so there is no consent banner to design. The
limits, from [the FAQ](https://developers.cloudflare.com/web-analytics/faq/):
"We retain unsampled beacon data for the past 7 days, after this point data is
aggregated down to around 10%", six months of history, and custom events "Not
yet".

That settles the funnel question: a GOV.UK-style completion rate needs a named
start and end event, and Cloudflare can record neither. **The only conversion
event this site has is a row in `submissions`, measured server-side.**
Everything upstream is unmeasured, and we claim no abandonment rate.

[Plausible](https://plausible.io/vs-cloudflare-web-analytics) argues its case
well — three-year retention, no sampling, custom events — at
[**$9/month or $108/year**](https://plausible.io/#pricing) on Starter, capped
at 10k monthly pageviews, against a budget of
approximately zero; self-hosting means a Postgres + ClickHouse stack outside
the Cloudflare-only constraint. **Rejected for now.** Revisit when someone can
name the decision it would change.

### What is never tracked

[Mozilla's Lean Data Practices](https://www.mozilla.org/en-US/about/policy/lean-data/)
— "Decide if all your data collection delivers value" — and
[Wikimedia's retention guidelines](https://foundation.wikimedia.org/wiki/Legal:Wikimedia_Foundation_Data_Retention_Guidelines),
where a visitor IP is written down once as "After at most 90 days, it will be
deleted, aggregated, or de-identified" rather than decided per incident:

- No cookie, no `localStorage` id, no fingerprint, no session replay, no
  heatmap, no scroll depth, no per-person page history. Cloudflare cannot do
  these — a feature, and a reason to stay.
- Never collected: university ID, faculty, year, gender, GPA. If a decision
  genuinely needs one, it gets its own proposal and its own consent line.
- Never stored in a queryable field: why an application was declined.
- No metric on this page is ever computed per named person. Metrics 4 and 5
  aggregate over 008's hashed key and report counts only.

## Scope

**Phase 0 — the head count exists. About an hour.** Two optional fields on the
`events` schema, typed by a human in the pull request that closes the session,
and one derived line on the past-event page. No database, no endpoint, no
computation, no personal data. This is the smallest thing that turns a memory
into a record, and it is the only phase with no dependency on another proposal.

**Phase 1 — the definitions exist. Half a day, no code.** The six rows of the
table above, plus their floors and failure modes, written into
`docs/CONTENT.md`; computed once a term by hand from `wrangler d1 execute`
output and pasted into `src/content/docs/` as a dated entry. A definition
argued over in a pull request is the part that changes behaviour; the screen is
not. If phases 0 and 1 are all that ever ships, this proposal succeeded.

**Phase 2 — the page.** `/admin/metrics` inside 001's console, computing 1, 2,
3 and 6 at request time. Requires 001 for the Access application and 002 or 001
for `reviewed_at`. Build it only when the hand computation in phase 1 has been
done twice and was annoying both times.

**Phase 3 — the cohort metrics.** 4 and 5, only if 008 ships *and* its roster
survives a full term. If check-in dies in week three, these two are deleted
rather than published against a partial roster.

## Data and schema

This proposal owns two schema changes. Nothing else here is new storage.

`src/content.config.ts`, `events`:

```ts
/** Heads counted in the room. Absent means nobody counted; 0 means nobody
 *  came. These are different facts and must stay different values. */
attended: z.number().int().nonnegative().optional(),
/** Who counted, so the number has an author. */
attendedBy: z.string().max(60).optional(),
```

`projects` already carries `stage` and `started`. Add
`demoedAt: z.coerce.date().optional()` — the date it was shown to a room.
Checkable; `stage` is not.

**Everything else is borrowed.** The `attendance` table, its hashed key, the
check-in endpoint and migration `0003` belong to **008**, which already
specifies them; this proposal does not get a second version of that table or a
second definition of the key, and metrics 4 and 5 use whatever 008 lands. The
Access application, the JWT verification and the write path for `reviewed_at`
belong to **001**. If this document and 008 or 001 ever disagree on a column
name, they are wrong here.

**Do not assume a cron is one line.** `wrangler.jsonc` warns that
`@astrojs/cloudflare` regenerates the config into `dist/server` at build time
and deploy uses *that* file, "which carries `"triggers": {}` and no routes —
anything declared here is silently dropped". Custom domains are attached in the
dashboard for exactly this reason. Whoever first needs a scheduled handler —
008's reminder, or a caller for `pruneRateLimits()`, which has waited since
`0001` — has to solve that, and should assume it costs more than an hour.

## Design

**No new route archetype and no second Access application.** Phase 2 is
`/admin/metrics`, inside the CONSOLE archetype and the `qairuhub.com/admin*`
Access application that 001 defines. A metrics page is exactly the kind of page
that would invent a photograph to satisfy §7.2, so it carries none:
`tests/e2e/design-law.spec.ts:147` asserts `toBeLessThanOrEqual(1)`, which zero
satisfies without an allowlist.

**It is not a dashboard.** §2 already rejected "the spine bar of six counts" as
the banned card pattern rotated, and killed tickers, clocks and count-ups. So:
one hairline RECORD table, one row per metric — name in `m-label`; the value
**as a fraction, never a bare percentage** (`7 / 11`, not `64%`), because a
percentage hides n; the window; the date computed; one `small` line naming the
decision.

§7.4's thin-content law applies to numbers. Below its floor a metric renders
the floor — `NOT ENOUGH DATA — NEEDS 6 SESSIONS, HAS 3` in `m-data` at
`--ink-3`; before anything is recorded, six names and `NOT YET MEASURED`.

Attendance over time is the one place a shape earns space: a row per session,
date in the rail at `dn`, and the §10.3 capacity-rule pattern — a 2px
`--rule-strong` track filled in proportion to the largest session, count in
tabular mono beside it. **The fill is `--ink-2`, not cobalt.** §10.3 licenses a
cobalt fill for a live capacity count on an open event; §8 restricts cobalt to
"things that respond, or things that changed", and a closed session is neither.
Following 001, the list page has no `.cta-primary` at all. No auto-refresh, no
charts, no library.

Publicly — and this is the only public surface in the proposal — one derived
line may appear on a past event page: `14 people came`. Checkable, in the voice
`docs/CONTENT.md` asks for, and rendered only when `attended` is present.

## Risks and trade-offs

**The strongest argument against doing this at all.** Every entry in
`src/content/` is `placeholder: true` and no session has been run under this
site, so all six metrics render `NOT YET MEASURED` for at least a term — and
four of them depend on proposals that have not been accepted. This builds the
instrument before the thing it measures exists. `docs/STATUS.md` ranks what the
site needs: two real people, the next real event, one real project, one
photograph. The same half-day spent on any of those is worth more than this
document, and if the choice is exclusive, this loses. Phase 0 is the answer
only because it is an hour and produces a fact — `attended: 14` — that has
value with or without the rest.

**The specific way it fails:** six rows that all say `NOT ENOUGH DATA` read as
a broken feature rather than an honest one, and the natural repair is to lower
the floors. Lowering a floor to make the page look finished is the exact
failure this proposal exists to prevent. The floors are fixed in phase 1, in
writing, before any of them can be embarrassing.

**`attended` will be filled from memory.** A number typed in a pull request
three weeks after the session is unfalsifiable, and `attendedBy` names the
author without verifying them. If 008 ships, its roster is the check: a roster
well below the counted heads means someone is guessing.

**Collection rots.** Phase 3 needs a whiteboard code read every Friday. Phases
0–2 are independent of it by design.

**We give up** knowing anything about visitors who never submit — accepted, in
exchange for not tracking students.

**A seventh metric is a proposal, not a commit.** Six is the ceiling.

## Success

Within one term, metric 3 has a real median and either the process or the
five-working-days promise changed because of it. Within two terms, at least two
of the six have visibly caused a decision — a moved slot, a dropped RSVP
requirement, a shortened accelerator.

**Remove it when** a metric goes two terms without changing anything, when
`attended` is filled from memory rather than counted, or when a floor is
lowered to make the page look fuller. Deleting a metric and recording why is a
good outcome.

## Effort

**Phase 0: S** — two fields in `src/content.config.ts`, one line on the event
detail page, a paragraph in `docs/CONTENT.md`. About an hour, no dependencies.
**Phase 1: S** — half a day of writing and one term-end evening with
`wrangler`. **Phase 2: M**, but almost all of it is 001's; on top of a built
console it is one route and four queries. **Phase 3: unsized** until 008 is
accepted.
