---
title: Cancel a session without deleting it, then model the series
status: draft
area: events
effort: M
depends_on: []
---

# 007 — Cancel a session without deleting it, then model the series

| | |
|---|---|
| **Status** | draft |
| **Area** | events |
| **Effort** | M |
| **Depends on** | — |

## Problem

**Start with what is actually in the repository.** `src/content/events/` holds one
file, `example-ai-friday.md`, carrying `placeholder: true`. No real event has ever
been published, so production correctly shows the designed empty state and
STATUS.md lists "the next real event" as the second thing the site is waiting on.
Everything below concerns a term that has not been typed yet. That is the reason
the Scope section is ordered the way it is, and it is the first thing an argument
against this proposal should reach for.

**There is no way to say a session is off.** The `events` schema has no `status`
field. Taking a session off the site means deleting the file, which 404s its URL —
and that URL is the one that went into the Telegram group, because the `/events`
empty state states the real mechanism itself: *"The next dates go into the Telegram
group first, then here."* The person who most needs that page is the one refreshing
it on the walk to Lab 2.14. Deleting the file is the one failure mode that costs a
student their afternoon rather than the organiser their time.

**The tense is decided at build time.** `isUpcoming()` in `src/lib/content.ts`
compares `data.ends ?? data.starts` against `new Date()`, and every caller —
`/events`, the homepage desk, `/events/[slug]`, the 404 facts — is prerendered, so
"now" freezes at the last deploy. Friday's session sits under **Upcoming** all
weekend. The project already conceded this in exactly one place: the guard in
`src/pages/api/submit/[kind].ts` re-runs `getPastEvents()` per request and answers
`410` for a finished session, because a build-frozen page was about to tell a
student they had a seat at something that ended last month. The server stopped
lying; the page still does. STATUS.md files this under review findings left open.

**Repetition is a cost not yet paid.** A fourteen-week term of AI Fridays would be
fourteen files differing in one line, the rest — `room: Lab 2.14`, `capacity: 30`,
`program: qairu-ai` — copied. That invites drift. It has not happened, because
nobody has typed the second file. It is a forecast, not an observation, and the
proposal should not pretend otherwise.

## Prior art

**[RFC 5545, iCalendar](https://www.rfc-editor.org/rfc/rfc5545.html)** (IETF).
`RRULE` with `FREQ`, `INTERVAL`, `BYDAY`, and `UNTIL` or `COUNT` — never both:
*"The UNTIL or COUNT rule parts are OPTIONAL, but they MUST NOT occur in the same
'recur'."* Also `EXDATE`; `RECURRENCE-ID`, naming an occurrence by its *original*
start so it can be overridden; and `STATUS`, whose values include `CANCELLED`.
**Steal** those as named, so a later `.ics` is serialisation rather than redesign.
**Leave** sub-daily `FREQ`, `BYSETPOS`, `BYWEEKNO`, `WKST`, and
`RANGE=THISANDFUTURE`, which lets one edit silently rewrite dozens of occurrences.
Also leave `RDATE` and `SEQUENCE`: a one-off extra session is just an ordinary
event file, and `SEQUENCE` only earns its keep once something is subscribed, which
is [009](009-calendar-integration.md)'s problem.

**[W3C — a cancelled meeting occurrence](https://www.w3.org/events/meetings/77aab509-d677-427b-9d18-b3f1a70bc44b/20260311T140000/)**.
The occurrence keeps its URL under a **Canceled** status with the reason in prose
(*"CANCELLED per our last meeting, will continue next week"*), states the rule in
words — *"Repeats: Every other week on Wednesday, starting from 11 March 2026,
until 8 May 2027"* — and links "Overview of the recurring event". **Steal** all
three. **Leave** the opaque UUID in the path; `ai-fridays-2026-10-03` reads aloud.

**[talks.cam](https://talks.cam.ac.uk/)** (University of Cambridge). Twenty years
of a university-wide diary, series first-class, each with a page and an iCal feed.
**Steal** both. **Leave** its cancellation convention, which is to type it into the
title — [`TALK CANCELLED`](https://talks.cam.ac.uk/talk/index/179450), with the
apology buried in the abstract. Unstyleable, unfilterable, and invisible to
anything reading the data. That is the argument for a structured `status` field
over a naming habit, and it is the whole of phase 1.

**[Google Calendar — `events.instances`](https://developers.google.com/workspace/calendar/api/v3/reference/events/instances)**.
*"Cancelled instances of recurring events will still be included if `singleEvents`
is False."* A deleted occurrence is a returned object with a status, not an
absence. **Steal** that; **leave** the sync surface.

**[Luma](https://help.luma.com/p/multi-session-recurring-events)**. No recurrence
model at all: the documented answer is cloning, *"up to 30 events at once"*, plus a
Calendar page listing them. **Steal** the calendar page as a series index. **Leave**
clone-as-recurrence — our forecast problem with a button on it.

## Proposal

Two independent things, deliberately in this order, plus a rendering change argued
on its own merits.

**A. A `status` field on `events`.** `confirmed | tentative | cancelled`, with a
reason and a date. A cancelled session keeps its slug, its URL and its page; the
row stays in the diary until its end time passes, in `--ink-3`, token `Cancelled`,
reason on the meta line. The detail page drops the `RsvpForm` island and renders
the reason, the date it was cancelled, and a link to the next session.
`POST /api/submit/rsvp` gains one clause beside the past-event check: cancelled
answers `410`. No new collection, no date arithmetic, no expansion.

**B. A `series` collection expanded at build time.**
`src/content/series/ai-fridays.md` carries one `rrule`, a `dtstart`, a duration,
exception dates, and the defaults every occurrence inherits.
`src/lib/series.ts` exports `expandSeries(series, now)` returning stubs with a
deterministic slug `${series.id}-${YYYY-MM-DD}`. `getUpcomingEvents()` and
`getPastEvents()` merge these with hand-written files, so `EventRow.astro`, the
desk, `/events`, the 404 facts and the RSVP guard keep working untouched. An
override file with `series: ai-fridays` and `occurrence: 2026-10-03T17:00:00+05:00`
— `RECURRENCE-ID`, the *original* start — replaces one occurrence and inherits what
it does not state.

**C. `prerender = false` on the two event routes.** Argued, and costed, in Risks.

## Scope

**Phase 1 — cancellation, on the collection that already exists.** Three fields on
`events`, one clause in the RSVP guard, one row treatment, one detail-page branch.
It needs no series, no expansion, no new collection, and nothing has to be written
until the first session is actually called off. It is the only part of this
proposal that can be true before a single real event exists, and it is the part
that stops a student walking to an empty room.

**Phase 2 — the series collection**, and only once a term of AI Fridays has
actually been published as files. Fourteen near-identical files in git are the
evidence that a series exists; a `series` file written before them is a forecast
the site would render as fact. See Risks.

**Phase 3 — server-render the two event routes.** Not two lines. See Risks.

**Phase 4 — a series index page**, `/events/series/[id]`: the rule as a sentence,
every occurrence listed, past and future.

**Not proposed:** attendance counting, capacity enforcement, reminders, notifying
existing RSVPs, an admin UI, and `.ics` in any form — that belongs to
[009](009-calendar-integration.md), which already depends on this file for a stable
occurrence slug and for `status`. Cancelling stays a commit plus a message in the
group.

## Data and schema

**Phase 1.** `events` gains three fields and no migration:

```ts
status: z.enum(['confirmed', 'tentative', 'cancelled']).default('confirmed'),
/** Plain and short. "Host ill" is a complete reason. */
cancelledReason: z.string().max(160).optional(),
cancelledOn: z.coerce.date().optional(),
```

One `superRefine`: `status: 'cancelled'` requires both `cancelledReason` and
`cancelledOn`. No minimum length on the reason — a floor of ten characters buys
nothing and forces prose where a fact will do.

**Phase 2.** A `series` collection carrying `rrule` (the RFC 5545 subset above),
`dtstart`, `durationMinutes`, `exdate`, `horizonDays` for a rule with no `UNTIL`,
and the inherited fields — `location`, `room`, `capacity`, `walkIn`, `program`,
`summary`, `hosts`, `tags` — in the same shapes `events` uses. `events` gains
`series: reference('series').optional()` and `occurrence: z.coerce.date().optional()`,
each requiring the other, with `starts` optional on an override so that setting it
moves the session while the slug stays put. Two overrides claiming one
`(series, occurrence)` fails the build.

**No date-relative build validation.** An earlier draft of this proposal wanted a
`superRefine` rejecting a past `exdate`, and a `pnpm check` gate failing when an
active series has fewer than two occurrences in the next 21 days. Both are traps:
a build that starts failing because time passed, on a repository maintained by one
student, blocks every unrelated pull request during the summer and teaches whoever
inherits it to skip the gate. The honest substitutes are already in place — the
`/events` empty state says why the diary is empty, and phase 4's series page states
the run dates in words. Ship neither check.

**Cancellation, never exclusion.** `exdate` exists only for term breaks known in
advance, before any occurrence is announced. Once a date has been rendered it is
cancelled, not excluded: retracting a URL already posted to Telegram is the one
thing this model must never do.

**D1: no migration.** `submissions.event_slug` already takes the occurrence slug,
and `idx_submissions_unique` on `(kind, email, COALESCE(event_slug, ''))`
`WHERE kind != 'contact'` (migration 0002) already makes an RSVP unique per person
per occurrence — the correct grain. A `series_slug` column can wait for something
that queries by series.

**No dependency.** Kazakhstan abolished daylight saving on
[15 March 2005](https://en.wikipedia.org/wiki/Time_in_Kazakhstan) and unified on
UTC+5 on 1 March 2024, so weekly expansion is arithmetic rather than a timezone
library. But the offset is a policy that changed within the last two years: read it
through `SITE_TIMEZONE` and `Intl` the way `src/lib/site.ts` already does, never as
a `+05:00` literal in `series.ts`.

## Design

Nothing new is drawn.

**Cancellation needs no new colour and, mostly, no new CSS.** `.state` in
`src/styles/components.css` already defaults to `--ink-3` with a `--rule-strong`
border, which is exactly what §8.2 #8 requires of a state that is not actionable —
so `Cancelled` is the plain `.state`, and only `walkIn`'s `.state--live` keeps
`--cobalt-text`. `scripts/check-cobalt.mjs` would fail the build for any cobalt
reference added to a component anyway. `--danger` stays out of it: §8.3 assigns it
to error states, and a cancelled session is not the reader's error. The one new
rule is a shape, because colour is never the only carrier: a 1px `--ink-4` strike
across the `row__day` figure.

**Detail page.** The `RsvpForm` island (`client:visible`) is not rendered for a
cancelled session; the aside carries the reason, `cancelledOn`, and a link to the
next occurrence. Capacity is untouched — "Room holds 30 people", no 2px track,
because there is still no live count to compare against (§10.3, and the comment
already in `src/pages/events/[slug].astro` says so).

**Series page (phase 4).** INDEX (§12.1) — masthead, one PLATE, RECORD rows — with
the rule stated as one standfirst sentence: "Every Friday during term, 17:00–19:00,
Lab 2.14. Runs to 19 December 2026." Never as an `RRULE`. §7.4 still applies: a
series of fewer than three sessions renders as READ, not as a table. A finished
series gets the designed empty line plus one true sentence — "This series ran from
5 September to 19 December 2026" — and never an invented next date.

## Risks and trade-offs

**The strongest argument against this is phase 2, and it is a good one.** A
`series` file with a weekly `rrule` and a 180-day horizon renders twenty-six dated
rows, each with its own URL and its own RSVP form, out of one assertion made by one
volunteer in September. The site's constitution is that it does not present an
assertion as a fact: that is what `placeholder` in `src/content.config.ts` is for,
what §7.4 says, and why STATUS.md is proud that production shows empty states. A
term that quietly stops in week five leaves twenty-one sessions the site invented,
and the honest version of this proposal has to admit that fourteen hand-typed files
cannot fail that way, because typing the file *is* the commitment. Hence the
ordering: phase 2 is gated on the fourteen files existing, not on the schema being
ready. If they never exist, phase 2 was never needed. Phase 1 is worth doing
either way.

**Phase 3 is not two lines.** Astro's docs are explicit that a server-rendered
dynamic route [cannot use `getStaticPaths`](https://docs.astro.build/en/guides/routing/)
and so cannot receive props. `src/pages/events/[slug].astro` reads
`Astro.props.event` from its `getStaticPaths`; opting out means rewriting it to
resolve `Astro.params.slug` against the collection and return a real 404 for an
unknown one — the case `getStaticPaths` currently handles for free. Second, and
easier to miss:
[`imageService: 'compile'`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
optimises images at build time for prerendered pages and configures *"the noop
`passthrough` option … for on-demand rendered pages"*. So the mandatory PLATE
(§7.2) on `/events` and every event page would ship at its original weight, against
the §15 budget. Today that costs nothing, because every Plate is the "awaiting
photography" frame — which is an argument for doing phase 3 *before* the first real
photograph lands, and for revisiting it the week after.

**Scheduled rebuild (Cloudflare Cron Triggers) — rejected.** This repo's own build
output settles it: `dist/server/wrangler.json` contains `"triggers":{}`, so
`@astrojs/cloudflare` drops any cron declared in `wrangler.jsonc` — the same
mechanism that already forces custom domains to be attached in the dashboard.
Working around it needs a second Worker firing a deploy hook, and that hook needs
the CD path this project deliberately switched off: a token able to edit Workers,
KV, D1 and R2 across an account hosting more than this site, in a public
repository. On top of that,
[Cron Triggers execute on UTC](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
and changes take up to 15 minutes to propagate, and the free plan allows
[5 per account](https://developers.cloudflare.com/workers/platform/limits/).
GitHub Actions is worse for this specific maintainer: the `schedule` event
[*"can be delayed during periods of high loads"*, and in a public repository scheduled workflows *"are automatically disabled when no repository activity has occurred in 60 days"*](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
— the exact shape of a student volunteer's summer.

**Freshness in the browser — rejected.** Reading `data-ends` off each row and
re-sorting breaks the zero-JS default and §9.5's rule that the page is complete
without script, and decisively: Telegram announces these sessions, and its unfurl
renders whatever the HTML says, because the crawler never runs the script.

**Server-render the two event routes — recommended, with the costs above.**
`export const prerender = false` on `src/pages/events/index.astro` and
`src/pages/events/[slug].astro`. Not the banned `output: 'server'` but the
per-route opt-out the architecture already sanctions for `/api/**`, applied to the
two pages whose correctness is time-dependent. It is the only option that is right
at the moment of reading, unfurls included, and it needs no token, no second
Worker, no vendor and no daily attention.
[Static-asset requests are free and unlimited](https://developers.cloudflare.com/workers/platform/pricing/);
these two routes become billable invocations against the free plan's 100,000
requests a day, at a 10 ms CPU ceiling. **The traffic is unknown** — the site has
never published a real event — so do not pretend to a number: ship it, then read
`wrangler tail`. Serve `Cache-Control: public, max-age=0, s-maxage=300` with
`caches.default` so a burst after a Telegram post collapses to one invocation per
five minutes; five minutes of staleness sits inside the honesty budget when the
alternative is five days. If the CPU ceiling bites, Workers Paid is $5/month and is
the only new cost anywhere in this proposal.

## Success

- A cancelled session keeps its URL and states why. Nobody walks to Lab 2.14 for
  nothing. Checkable the first time a session is called off. **(Phase 1.)**
- Loading `/events` the morning after a session, with no deploy in between, shows
  it under **Past**. Checkable by hand, once. **(Phase 3.)**
- A term of AI Fridays is one `series` file plus nought-to-three overrides, and
  rooms and times agree because they are stated once. Only measurable after a term
  has been run as files. **(Phase 2.)**

**Remove it again if** a term produces more override files than the series saved —
those sessions were never a series; or the diary is wrong twice after phase 3,
which would make the cache window the new lie; or phase 2 ever renders a date for a
session that did not happen, which is the failure this whole document is meant to
prevent.

## Effort

**Phase 1 — S.** Three schema fields, one `superRefine`, one clause in the API
guard, one strike rule, one detail-page branch. Half a day, and it is the only
phase with no prerequisite.

**Phase 2 — M**, and blocked on a real term existing as files: one collection,
~60 lines of date arithmetic, a merge in `src/lib/content.ts`.

**Phase 3 — S, but sharp**: a rewrite of `[slug].astro` off `getStaticPaths`, a
404 path, a cache header, and measurement.

**Phase 4 — half a day** on an existing archetype.

No new bindings, no D1 migration, no vendor, no dependency. Depends on nothing;
[009](009-calendar-integration.md) depends on phase 1's `status` and phase 2's
occurrence slug.
