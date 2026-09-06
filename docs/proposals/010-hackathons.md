---
title: Run the first hackathon on paper
status: draft
area: events
effort: M
depends_on: [005-honest-metrics]
---

# 010 — Run the first hackathon on paper

| | |
|---|---|
| **Status** | draft |
| **Area** | events |
| **Effort** | M |
| **Depends on** | 005 phase 1 (`attended:`) for the one number this can publish honestly. Nothing else. |

## Problem

The hackathon form is already built. `ApplyForm` carries a `hackathon` variant —
team name, an experience select, "anything we should know?" — with its own
success copy ("You are signed up… Teams form on the day") and an `eventSlug` prop
that ties the entry to an event. `hackathonSchema` validates it.
`POST /api/submit/hackathon` rate-limits it, verifies Turnstile, answers 404 for
an unknown event and 410 for one that has finished, and writes the row to D1.

No page mounts it. `ApplyForm` is used on `/apply`, `/apply/accelerator` and
`/contact`, and nowhere else. `docs/STATUS.md` files this under *not built,
deliberately*, and states the actual blocker — "the form variant and the endpoint
exist; it needs a real event to attach to."

So the missing piece is a date, a room and someone to run it. A weekend sprint is
seven things — announcement, signup, team formation, brief, demo submission,
judging, published results — and the only one already done is the one that is
software.

The one that decides whether the event happens is team formation. A first-year
who knows nobody reads "hackathon", assumes everyone else arrives in a team, and
does not sign up. AI Fridays work because `walkIn: true` removes that fear for
two hours; a hackathon reintroduces it at ten times the commitment. The built
form already promises the answer — *teams form on the day* — and nothing on the
site or in any document says how that hour is run.

Underneath: nobody here has run one, and every file in `src/content/` is still
`placeholder: true`. Building six subsystems for an event whose shape we are
guessing at is how a volunteer spends a term shipping software instead of running
a hackathon.

## Prior art

**[MLH Hackathon Organizer Guide](https://guide.mlh.com/)** — CC-BY, and the only
free playbook in the category that carries arithmetic. The
[judging plan](https://guide.mlh.com/general-information/judging-and-submissions/judging-plan)
sizes the judge pool as `J = ⌈(P × n × t) / T⌉`, recommends `n = 3` rounds and
`t = 4` minutes per project (2 demo, 1 questions and scoring, 1 travel), reports
"an average submission rate of 1 project per 4 checked-in hackers", and asks each
judge for a top three instead of a score out of ten because that "normalizes
scores across judges". The
[rules template](https://github.com/MLH/mlh-hackathon-organizer-guide/blob/master/general-information/judging-and-submissions/rules-for-your-hackathon.md)
sets "teams can be 1-4 people", no work before the event, one project per person,
code submitted as a publicly available link, and AI use stated in the submission.
The
[cheating check](https://guide.mlh.com/general-information/judging-and-submissions/cheating-check)
runs on winning projects only, reads commit history ("Is it one big commit at the
beginning of the event?"), and is explicitly a conversation — "Talk to the team
ask who worked on what part."
[Hack Days](https://hackdays-guide.mlh.com/) puts the small-event shape at "four
to six hours … up to 12 hours".
*Steal:* the judge formula, the top-three ranking, the rules text almost
verbatim, the four-to-six-hour format, the cheating check as a conversation.
*Leave:* swag, buses, sponsor apparatus, MLH membership, and the hotlines in the
[Code of Conduct](https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md)
— they are regional numbers for North America, Canada, the UK, Europe,
Asia-Pacific and India, none of them local, so the report route here is a named
person in the room plus an address that answers. Copy that document's *scope*,
though: it binds "sponsors, judges, mentors, volunteers, organizers … and anyone
else participating in the event", not only attendees.

**[Gavel](https://github.com/anishathalye/gavel)** — HackMIT's expo judging
system. The
[write-up](https://anishathalye.com/gavel-an-expo-judging-system/) is the useful
part, not the code: "pairwise comparisons work much better than having judges
input scores from 1 to 10 or something like that", at "over 200 projects and 100
judges". *Steal:* the diagnosis that an absolute 1–10 score does not survive six
different judges. *Leave:* Gavel itself — a Flask app needing Postgres, Redis and
a Celery worker, none of which runs on Workers, and Crowd-BT needs far more
comparisons to converge than ten projects and four judges can supply.

**TreeHacks 2026** (Stanford) — 36 hours and
[over $500,000 in prizes across 14 categories](https://stanforddaily.com/2026/02/15/12th-annual-treehacks/),
judged on "creativity, technological complexity and social impact". *Steal:* the
fact that the largest budget in this reference set still judges on **three**
criteria. *Leave:* the rest, tracks included.

**Devpost** — the de facto schema for what a hackathon project *is*:
[name, tagline, a 3:2 thumbnail under 5 MB, a story, up to 25 "built with" tags,
try-it-out links, a video demo, a gallery, teammates, a repository URL, and
explicit licence and public-availability confirmations](https://help.devpost.com/article/126-know-your-submission-steps).
Its judging platform weights criteria equally and
["does not currently support varying weights"](https://help.devpost.com/article/64-judging-public-voting),
and
[printed score sheets](https://help.devpost.com/article/101-offline-judging-using-printed-score-sheets)
are documented rather than a fallback: "you may prefer to have them score
submissions using paper and a pencil". *Steal:* the record shape — almost exactly
a `projects` frontmatter block, which is what makes same-evening registry entries
a twenty-minute job — equal weights, and the paper sheets. *Leave:* Devpost
itself. It is another vendor, and it moves the record of what QairuHub built off
qairuhub.com.

## Proposal

**Two events, not one system.**

**Hackathon 00 runs on paper.** One Saturday, six hours, 20–40 people, in a room
QAIRU already has, using only what exists: one `events` entry, the built form
mounted on its page, a printed brief, index cards for teaming, paper score
sheets, and results typed into `src/content/projects/` that evening. Almost no
new code. What it produces is a written record of what actually broke.

Every field in the schemas below is a guess until then. Do teams want a name
before or after they have an idea? Do they submit a repo or a video? Does anyone
finish? A paper run answers that for the price of a printer, and a form that turns
out wrong costs a reprint instead of a migration. It also guards against the worst
outcome — not a bad hackathon, but a term spent building a hackathon platform for
an event that never gets scheduled.

**Team formation happens in the room, not in software.** The site's only job is to
say, above the signup button, that arriving alone is the normal case and that the
first 45 minutes are a teaming session. On the day: a wall of index cards, one
idea per card with the author's name and what they bring; a 45-minute block; a
floor of two people per card and a ceiling of four; and one named organiser whose
whole job that hour is walking unattached people to cards. No matchmaking
algorithm, and no roster of strangers' names on a public page.

**Judging** is an expo against a rubric published before signup opens: three
criteria, 5 points each, equally weighted, 15 total. MLH's arithmetic for ten
projects, `⌈(10 × 3 × 4) / 60⌉`, is **two judges** for a 60-minute expo and three
at 45 minutes — recruit four so one can drop out. Cheating check on winners only.

**Results the same evening.** `pnpm hackathon:export <slug>` turns D1 rows into
Markdown stubs; the organiser fills the gaps and opens one pull request. Every
submitted project gets a registry entry, not only the winners — that is the
difference between a hackathon and a competition.

## Scope

**Phase 0 — paper. No code.** Rules, rubric, brief, run-of-show, score sheet,
four judges, a room booking and someone paying for lunch. Run it. Write down what
broke. Everything below is conditional on this having happened.

**Phase 1 — announcement and signup.** Most of it is not the form. Add
`hackathon`, `submissionsClose` and `judgingCriteria` to the `events` schema;
render schedule, rules and rubric on `/events/<slug>`; mount the island that
already exists — `<ApplyForm variant="hackathon" eventSlug={event.id}
client:visible />` in place of `RsvpForm` when `data.hackathon` — and add one
field to `hackathonSchema`: `teamStatus: 'have-team' | 'looking'`. That single
select is the only reason this form differs from an RSVP: it tells the teaming
organiser how many people arrive alone. Nothing else is added, because nothing
else would be read — what a person brings goes on their index card in the room,
where it is used.

**Phase 2 — submission and results.** The `demo_submissions` table,
`/events/<slug>/submit` with a server-side close, the export script, and a
results page built from the registry.

**Phase 3 — conditional, possibly never.** A `teams` table with six-character
join codes, and a judging console behind Cloudflare Access. Do not start until a
real event proves the card wall failed.

**Not in scope, at any phase, for a first hackathon.** Not overnight — that is
security, two meals, sleeping arrangements and a duty of care a student volunteer
cannot carry. No application funnel: accept everyone. No tracks — one brief. No
sponsors, therefore no sponsor prizes and no sponsor round. No cash prizes; they
change who shows up and create a dispute surface. No custom judging software, no
check-in scanning, no badge printing, no hardware lending, no swag order. No live
scoreboard — `docs/DESIGN.md` §2 kills the ticker by name. And no attendance
figure published unless somebody counted, with the method stated.

## Data and schema

**`src/content.config.ts` — `events`:**

```ts
hackathon: z.boolean().default(false),
submissionsClose: z.coerce.date().optional(),
brief: reference('learn').optional(),
judgingCriteria: z.array(z.object({
  name: z.string().max(40),
  max: z.number().int().min(1).max(5),
  description: z.string().max(200),
})).max(4).default([]),
```

A `superRefine` requires, when `hackathon: true`, a `submissionsClose` between
`starts` and `ends` and at least two `judgingCriteria` — so a hackathon page
without a published rubric fails the build. That is the most valuable line here:
it makes "the rubric is published before signup opens" impossible to skip. Team
size is deliberately not a field — it is one line of the rules, and a schema
field nothing enforces is invented metadata. `brief` points at the existing
`learn` collection (`kind: 'guide'`); `docs/DESIGN.md` §12.2 already fails the
build on a dangling `reference()`.

**`projects`:** add `event: reference('events').optional()`,
`award: z.enum(['winner','runner-up','honourable-mention']).optional()`, and — the
one that matters — `credits: z.array(z.string().max(60)).max(6).default([])`.
`team` is `z.array(reference('people'))`, and a team of four first-years must not
become four new `people` files: those are for the named humans who run this and
consented to be listed. Credits are plain strings.

**Migration `demo_submissions.sql`** — number it when it lands. `0003` is already
claimed by proposals 001, 002, 004, 005/008 and 009, and only one of them can
have it.

```sql
CREATE TABLE IF NOT EXISTS demo_submissions (
  id              TEXT PRIMARY KEY,
  event_slug      TEXT NOT NULL,
  team_name       TEXT NOT NULL,
  project_name    TEXT NOT NULL,
  tagline         TEXT NOT NULL,               -- <=140, becomes projects.oneLiner
  repo_url        TEXT,
  demo_url        TEXT,
  built_with      TEXT NOT NULL DEFAULT '[]',  -- JSON, <=10 tags
  story           TEXT,                        -- <=1500, becomes the body
  members         TEXT NOT NULL DEFAULT '[]',  -- JSON [{name, telegram}]
  contact_email   TEXT NOT NULL,
  publish_consent INTEGER NOT NULL DEFAULT 0,
  award           TEXT CHECK (award IN ('winner','runner-up','honourable-mention')),
  registry_slug   TEXT,                        -- set once the Markdown entry exists
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_demos_team
  ON demo_submissions (event_slug, lower(team_name));
CREATE INDEX IF NOT EXISTS idx_demos_event
  ON demo_submissions (event_slug, created_at DESC);
```

A separate table rather than `submissions.payload`, for a reason about the
existing index rather than taste. `idx_submissions_unique` covers
`(kind, email, COALESCE(event_slug, ''))` for every kind but `contact`, so a
person who signed up as `hackathon` for an event and then filed their team's demo
under the same kind and slug would be refused as a duplicate of their own signup.
And the uniqueness this needs is per *team*: two members of one team must not be
able to file two competing entries, which is what `idx_demos_team` enforces and
an email-keyed index cannot.

Retention differs too. This row is a *public artefact*, not a private
application: signup rows are deleted 30 days after the event; demo rows with
`publish_consent = 0` are deleted once the import is done, and their registry
entry credits the team name only. The checkbox defaults to off — publishing a
first-year's name and Telegram handle against a weekend project they are
embarrassed by is a real harm and a cheap one to avoid.

**Routes:**

| Route | Prerender | Notes |
|---|---|---|
| `/events/<slug>` | yes | announcement, rules, rubric, signup island |
| `/learn/<brief>` | yes | the brief, as a guide |
| `/events/<slug>/submit` | **no** | closes server-side at `submissionsClose` |
| `POST /api/demos/<slug>` | no | ~60 lines reusing `verifyTurnstile`, `checkRateLimit`, `notify` |
| `/events/<slug>/results` | yes | built from `projects` filtered by `event` |

Results are a build-time page reading the registry. No live scoreboard, no second
source of truth.

## Design

The announcement is the DETAIL archetype (§12.2): `d3` title, mono meta line, READ
body, the event page's existing `facts` list in the aside taking two more rows
(submissions close, judges), and the rubric as a real `<table>` with `<th scope>`
and tabular figures — not three columns with icons. The brief is READ. Results
are RECORD, dropping to READ prose under three entries (§7.4).

**One cobalt fill, and the slot changes with the clock.** Before the event the
`.cta-primary` is *Sign up*; during the window it is *Submit your demo*;
afterwards the page has no CTA and the results link is a `.link-action`. State
tokens follow §8.2: `SIGNUP OPEN` and `SUBMISSIONS OPEN` in `--cobalt-text`,
`CLOSED` and `JUDGED` in `--ink-3`.

**No count on a prerendered page.** The capacity rule renders only where a
capacity and a live count both exist (§10.3, §13), and a static build has no live
count — so the page shows `SIGNUP OPEN` as text and no track. `countForEvent()`
exists in `src/lib/db.ts` and is called from nowhere, which is correct: a real
number would have to come from a `prerender = false` fragment or not at all. The
event page already refuses to let capacity read as availability — it prints "Room
holds 30 people" — and a hackathon changes nothing about that.

Empty states are designed: `NO DEMOS SUBMITTED YET`, then `RESULTS ARE PUBLISHED
THE SAME EVENING.` One PLATE per page — the previous sprint's photograph, or the
awaiting-photography frame. Rules and brief ship in English only; they are read
aloud in Kazakh and Russian at the opening, by a person.

## Risks and trade-offs

**The strongest argument against doing this at all.** QairuHub has no real event,
no real person file and no real project — every entry in `src/content/` is
`placeholder: true`, and `docs/STATUS.md` names exactly those as what the site
needs. A hackathon is the most expensive format available: a room for a day, four
judges, food for forty, and the club's whole volunteer capacity for a fortnight.
Almost everything it would produce — a first project, faces on the site, evidence
that people build here — a well-run AI Friday also produces, weekly, at a tenth
of the cost, through a door that is already open. If the choice is between running
Fridays properly for a term and running one hackathon, run Fridays. The honest
case for a hackathon is narrower: it is the one format that produces a *team* and
a finished artefact in a single day. That is worth having, and it is worth having
second.

**Nobody comes.** Twenty signups producing nine attendees is normal for a free
student event. Announce at three consecutive AI Fridays — the walk-in door is the
recruitment channel — and cater for 60% of signups. If fewer than twelve have
signed up at T-5 days, run it as a long Friday session and say so publicly.

**Team formation fails and solo arrivals leave in the first hour.** The failure
that ends the format. The card wall, the two-person floor and the named organiser
are the whole mitigation, and testing them is what hackathon 00 is for.

**Nobody has named a budget.** Food for forty people for a day is the largest
line and no document on this site says who pays it. MLH's budget figures are in
US dollars and do not price Astana. If the answer is "nobody", the event is four
hours with tea, and the brief says so rather than the room finding out at 13:00.

**The same-evening promise needs a deploy.** Pages are prerendered and continuous
deployment is deliberately gated off (`docs/ARCHITECTURE.md`), so publishing
results means `pnpm run deploy:prod` from the one machine logged in to
Cloudflare, at 22:00 on a Saturday, by the person who has been running an event
since 09:00. The export script makes the writing twenty minutes; it does nothing
about that. If it slips, the page says nothing — never "coming soon".

**The registry fills with abandoned weekend projects.** Ten hackathon entries
would outnumber everything else in `src/content/projects/`, and most weekend hacks
stop on Sunday. That is tolerable only because the registry records `stage` and
`started` honestly, so an entry stuck at `idea` reads as what it is. It stops
being tolerable the moment a hackathon entry is `featured` or counted as a
project shipped.

**Judging drama.** Rubric published before signup opens, judges named on the page,
each team handed its score sheet afterwards.

**Two stores for one event.** D1 is a staging buffer, the registry is the truth;
the buffer is emptied and `registry_slug` records the hand-off.

## Success

Three of these want a number the site cannot currently produce. The door count is
a paper sign-in sheet transcribed into 005's `attended:` integer — the only
honest source — and without it the show rate is not published at all.

- Of the people who arrived without a team, 70% are on one when the teaming block
  ends. Counted by the teaming organiser, at the card wall, during that hour.
- 80% of formed teams submit a demo. Counted from `demo_submissions`.
- MLH's one-project-per-four-hackers rate is the sanity check on the total; a
  wildly different figure means the format did not work the way theirs does.
- Every submitted project has a registry entry within 24 hours, winners and
  non-winners alike.
- At least one team is still working a month later — visible as a `stage` change
  in the registry, not as a claim.

Remove it if two consecutive events see fewer than half of solo arrivals form
teams, or if the organiser spends a full week per event. Delete the routes, keep
the Markdown: the registry entries stay true either way.

## Effort

Phase 0: no engineering, roughly 15 organiser-hours. Phase 1: **S** — mounting a
built island, three schema fields and one select; about a day, most of it spent
writing rules and rubric rather than code. Phase 2: **M**, two to three days.
Phase 3: **L**, conditional. Cloudflare Access is
[free for up to 50 users](https://www.cloudflare.com/sase/products/access/), so
four judges cost nothing — which means cost is not the reason to postpone phase 3.
The reason is that a paper score sheet has not failed yet.

Overall **M**, because phase 3 is a decision rather than a commitment. Phase 1
needs one real event on the calendar, which is what the rest of this site is
waiting for too.
