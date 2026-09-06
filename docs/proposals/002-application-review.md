---
title: Run application review on a weekly sitting with a published rubric
status: draft
area: operations
effort: S
depends_on: []
---

# 002 — Run application review on a weekly sitting with a published rubric

| | |
|---|---|
| **Status** | draft |
| **Area** | operations |
| **Effort** | Phase 0 is one hour. Everything after it is separately decidable. |
| **Depends on** | Nothing. Any review *interface* is proposal 001 phase 3, not this. |

## Problem

Five strings in production promise a review process that does not exist.

| Where | Promise |
|---|---|
| `src/components/ApplyForm.tsx:18` | "We read applications weekly and reply either way." |
| `src/components/ApplyForm.tsx:41` | "We read it. Every application gets a human reply." |
| `src/components/Desk.astro:60` | "Rolling intake · reviewed weekly" |
| `src/pages/apply/index.astro:19,24` | "reviewed weekly" |
| `docs/DESIGN.md:896` (§12.3) | *"Жауап 5 жұмыс күні ішінде"* — reply within five working days |

The last two cannot both hold: an application arriving Tuesday is past five working days
before the next Sunday sitting. `docs/CONTENT.md` bans this class of claim for content
and `src/lib/content.ts` enforces it; the claim is live in components, where nothing
checks.

Behind the copy there is no mechanism. `migrations/0001_create_submissions.sql` gives
every row `status = 'new'`, `reviewed_at NULL`, `notes NULL`. **No file under `src/`
issues an `UPDATE` against `submissions`** — the `reviewing`, `accepted` and `declined`
values in the `CHECK` constraint have never been written by any code path, and
`reviewed_at` exists only as a TypeScript field (`src/lib/db.ts:26`). Reading the queue
is `wrangler d1 execute` (`docs/STATUS.md:83`). Nothing distinguishes "we decided no"
from "nobody opened the terminal for three weeks".

The QairuHub-specific part is that **there is nothing to select for.** The operator is
one full-time QAIRU student. Volume is a handful a week across five form kinds. Places
are not oversubscribed; `src/content/` is entirely `placeholder: true`, so there is not
yet a published event to invite an accepted applicant to. Unlike every organisation
below, this is not an admissions filter — it is a routing problem and a turning-up
problem. The student who applies and hears nothing does not come to Friday either, and
Friday is the only door the club has.

## Prior art

**[Recurse Center — What we look for](https://www.recurse.com/what-we-look-for)**
publishes six named criteria as plain sentences ("You're self-directed", "You're
pleasant") plus what does *not* count: degrees and credentials — "poor proxies for all of
our admissions criteria" — specific languages, employment status and work authorisation.
Its four [social rules](https://www.recurse.com/social-rules) — no well-actually's, no
feigned surprise, no backseat driving, no subtle -isms — give a reviewer something
concrete to assess "pleasant" against.
**Steal:** the named-quality format, the "does not count" list, and short written
behaviour rules so the culture criterion is assessed rather than felt.
**Leave:** the four-stage [process](https://www.recurse.com/apply) — a 25-minute alumni
call and a pairing interview — and the count of six. Six axes at six applications a week
is a scoring surface with nothing to score.

**[Y Combinator — Apply](https://www.ycombinator.com/apply)** publishes two dates: apply
by 2 November 8pm PT, decision by 11 December, and "we give everyone who interviews
detailed feedback on our decision".
**Steal:** a date, not an adjective. "By 11 December" is checkable; "soon" is not.
**Leave:** the batch deadline. Intake here is continuous, and a deadline would close the
only low-friction door the club has.

**[a16z speedrun — FAQ](https://speedrun.a16z.com/faq)** states its turnaround out loud —
"Our team reviews applications on a rolling basis, usually within 4–6 weeks" — and
publishes its limit: "Because we review a high volume of applications, we aren't able to
give detailed feedback on every submission."
**Steal:** publishing the carve-out instead of quietly failing the promise.
**Leave:** the carve-out itself. At six a week, "high volume" is a lie.

**[Hack Club — Clubs](https://hackclub.com/clubs)** is three steps — an application
("Tell us about your school and who is leading"), school approval, first meeting — "less
than an hour to kick off", and the real gate is the school's approval, not Hack Club's
judgement.
**Steal:** the posture. Default to yes; spend review effort on routing, not filtering.
**Leave:** keeping no record. At that scale it does not pay; here a five-line record
costs a minute and is the club's only institutional memory.

**[On Deck — Admissions](https://admissions.joinodf.com/)** prints the pipeline as one
string: "Apply ➜ (optional) async video ➜ interview ➜ (optional) 2nd interview ➜ decision
in ~36 hours".
**Steal:** the whole route in one legible line, optional stages marked optional. It maps
onto the `01 ЖІБЕРУ · 02 ОҚИМЫЗ · 03 ӘҢГІМЕ · 04 ЖАУАП` rail in DESIGN.md §12.3.
**Leave:** 36 hours. On Deck is a paid product with staff; a volunteer promising 36 hours
is promising to fail.

## Proposal

**The sitting.** One fixed hour a week — Sunday 20:00 Astana — at which every `new`
submission is read and decided. Anything needing daily attention will rot.

**The service level, published and dated.** Every applicant gets a human reply within
**7 days**, from a named person. All five strings in the table above change to seven
days. Two published exceptions: during QAIRU exam sessions the window is 14 days, dates
stated; and a missed sitting is announced rather than left to age silently.

**The rubric, published at `/docs/how-we-review`.** Four questions answered
`yes` / `no` / `unclear` — never scored, because averaging four scores at n=6 manufactures
precision that does not exist. **The default answer is yes**; the reviewer looks for a
reason not to.

1. **Can they name one concrete thing they want to build or learn?** A timetable bot
   beats "passionate about AI". Nothing built is fine; nothing *named* is `unclear`.
2. **Can they turn up?** This runs in a room in Astana on Friday evenings. Someone who
   cannot be in that room is a different problem, and saying so beats silence.
3. **Would we be glad to have them in the room?** There is no conduct document to assess
   this against — `src/content/docs/` holds only `charter.md`, which is
   `placeholder: true` and therefore excluded from production. So the same page carries
   four behaviour lines, in the Recurse form, and the criterion is assessed against those
   words. Without them this question is impression, and impression is where a small club
   quietly becomes people who already knew each other.
4. **Do we have anything to give them right now?** A closed accelerator with no mentor is
   our constraint, not their failure, and the letter says which.

Plus a **what does not count** list: faculty, year of study, GPA, prior ML experience,
English fluency, a GitHub account, who they know.

**Two reviewers without duplicated work** (phase 2 only). Claim before you read. A conditional `UPDATE`
is the lock — the D1 binding cannot send `BEGIN`/`COMMIT` (`src/lib/db.ts:5`), so this is
the primitive that exists:

```sql
UPDATE submissions
   SET status = 'reviewing', claimed_by = ?1, claimed_at = datetime('now')
 WHERE id = ?2
   AND status = 'new'
   AND (claimed_by IS NULL OR claimed_at < datetime('now', '-24 hours'));
```

`meta.changes === 0` means someone else has it. Claims expire after 24 hours, so a
reviewer who claims six rows then sits an exam does not freeze the queue.

A **second reviewer is required only for the two outcomes that disappoint** — `no-fit`
and `waiting`. An accept is cheap and reversible; a decline costs someone something. If
the second reviewer becomes the bottleneck, drop the rule: the rule is a courtesy, the
seven days is the promise.

**How a decline is written.**

1. Decision in the first sentence. No compliment sandwich.
2. About the thing, not the person: "the accelerator takes teams with something already
   running", never "you were not strong enough".
3. **One specific detail from their application appears in the letter.** It costs a
   minute and is the difference between a decision and a form. Never dropped.
4. One next action with a date and a room — the next Friday, walk-in, no application. A
   decline is a redirect, never an exit.
5. A date to come back, if there is one. Signed with a real name.
6. Banned: "due to the high volume of applications". At six a week that is a lie, and the
   honesty rule does not stop at the edge of the website.

```
Subject: Your QairuHub application

Aizhan — we are not taking the accelerator route for you this intake.
It is for teams with something already running, and the scheduling app
you described is still a sketch.

Two real things: AI Fridays, 19 September, 18:00, Lab 2.14 — walk in, no
application, bring the sketch. And the next accelerator intake opens
2 February; a working prototype by then makes it a straightforward yes.

I read your application myself. Come on Friday.
— Tair
```

## Scope

**Phase 0 — make the copy true. One hour, no new artefact.** Change the five strings in
the table above to one number, seven days, and put the sitting in a calendar. **This is
the smallest useful version.** It removes a live false claim from production and commits
to nothing that needs maintaining. If the proposal is rejected at every later phase,
phase 0 should still ship.

**Phase 1 — publish the rubric. One Markdown file.** `/docs/how-we-review` in the
existing `docs` collection with `category: 'process'`; `src/pages/docs/[slug].astro`
already renders it and `src/content.config.ts:205` already validates it. Four questions,
the "does not count" list, the four behaviour lines, the seven-day number. Records kept
by hand in `notes` via `wrangler d1 execute`. No schema change.

**Phase 2 — `pnpm review`**, only once a single sitting has held ≥5 applications twice.
`scripts/review.mjs` over `wrangler d1 execute --remote --json`: print the open queue
with days elapsed and overdue flagged, claim a row, write a record, set `replied_at`.
This is where the migration below lands. No new route, binding or vendor.

**Not proposed at all: a review interface.** Proposal 001 phase 3 already specifies
`POST /admin/s/[id]` writing `status` and `notes` behind Cloudflare Access. A second
Access-protected route rendering the same table would be the same work twice. If a UI is
wanted, it is 001's, and the `decision_reason` vocabulary below is what it writes.

Also not proposed: interviews, scores, an applicant status page, automated decisions.

## Data and schema

`migrations/0003_review_workflow.sql`, additive only, and not before phase 2. SQLite
cannot alter a `CHECK` constraint, so the `status` vocabulary in
`migrations/0001_create_submissions.sql` is **frozen** — changing it means the full
table-rebuild procedure, which the binding's lack of transactions makes risky. The
routing outcome goes in a new column instead.

```sql
ALTER TABLE submissions ADD COLUMN claimed_by      TEXT;
ALTER TABLE submissions ADD COLUMN claimed_at      TEXT;
ALTER TABLE submissions ADD COLUMN decided_by      TEXT;  -- 'tair' or 'tair,aiman'
ALTER TABLE submissions ADD COLUMN decision_reason TEXT;  -- vocabulary below
ALTER TABLE submissions ADD COLUMN replied_at      TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_open
  ON submissions (created_at) WHERE status IN ('new', 'reviewing');
```

`reviewed_at` and `notes` already exist unused; they get used, not duplicated. The
reply-due date is **not stored** — it is `datetime(created_at, '+7 days')`. Stored
derived data is how two numbers start disagreeing.

`decision_reason` vocabulary, enforced in `src/lib/review.ts`, not in a constraint:

| Value | Means | Second reviewer |
|---|---|---|
| `joined` | In, as applied | no |
| `routed` | In, but to a different programme than they asked for | no |
| `waiting` | Good; no room in the thing they applied to. Named return date | **yes** |
| `question` | We could not tell what they want. One question asked; re-read on reply | no |
| `no-fit` | Not a QAIRU student, or not something we do | **yes** |
| `spam` | | no |

**The decision record**: five fixed lines in `notes`, plain text rather than JSON, because
today's only reader is a human squinting at a terminal column — and one regex parses it
into `decision_reason` when phase 2 or proposal 001 lands.

```
rubric: name=yes turnup=yes room=yes capacity=no
route:  waiting
by:     tair,aiman
on:     2026-09-13
note:   Scheduling app, still a sketch. Accelerator has no mentor until
        February. Pointed at Friday 19 Sep and the Feb intake.
```

**Privacy.** The rule for notes: *write nothing you would not read aloud to the applicant.*
They describe the application, never the person. Rows are deleted after twelve months on
`decision_reason`, not `status`, because `status` will still be `'new'` on every row that
this proposal never reaches:

```sql
DELETE FROM submissions
 WHERE decision_reason IN ('no-fit','spam')
   AND created_at < datetime('now', '-12 months');
```

Run quarterly by hand, beside `pruneRateLimits`. Before phase 2 the column does not
exist and the predicate is `notes LIKE '%route:  no-fit%'` — ugly, and the reason the
column is worth having once there is anything to delete. No new field is collected from
applicants.

## Design

`/docs/how-we-review` is a DOC (§12.4): READ register, numbered clauses hanging into the
rail, `updatedDate` driving the change-bar, and a print stylesheet — a rubric that cannot
be printed is not published. **It ships without the revision table.** §12.4 builds that
from "`updatedDate` and a `revisions` array"; the `docs` schema
(`src/content.config.ts:205–216`) has no `revisions` field, and adding one is a schema
change that belongs with the charter, not with this.

The receipt (§12.3) is the natural place to print the due date — `ЖАУАП: 2026-09-13
ДЕЙІН` in `m-data`, tabular figures — but **there is no receipt to add it to.**
`ApplyForm.tsx:80–96` renders an eyebrow, a title, a body and the numbered step list;
there is no reference number, no date, no struck-through step, and the client discards
the `id` the endpoint returns (`src/pages/api/submit/[kind].ts:251`). Building §12.3's
receipt is its own piece of work. Until it exists, the seven-day promise lives in the
success body copy and on the rubric page, and the applicant does not hold a date.

## Risks and trade-offs

**The strongest argument against this proposal.** The false claim is five strings and a
line of DESIGN.md. Fixing them takes an hour and needs no rubric, no vocabulary, no
migration and no script. Everything after phase 0 is process built for roughly six rows a
week that one person reads in one sitting: a rubric written for a single reviewer is a
note to self, and publishing it converts a private habit into a public commitment that
outlives whoever wrote it. The next lead inherits `/docs/how-we-review` as an obligation
and no context. If the honest answer is "we read them when we can", say that, ship phase
0, and stop. **The case for going further is one thing only:** the rubric is written now,
while the club can still afford to say yes to everyone, rather than later, when the first
person has to be turned away and the criteria get invented to fit the decision.

**The published number is the whole risk.** A broken 7-day promise is worse than no
promise, and one bad exam week breaks it. The sitting is an hour and most replies are
three sentences. **Kill switch:** if median reply time exceeds 14 days across a month,
remove the number and say "we read applications weekly and we are currently behind".

**Publishing the rubric invites writing to it.** Mostly fine — gaming criterion 1 means
writing a clearer application. Criterion 2 is gameable, so Friday attendance is the real
check, not a stated intention.

**Two reviewers is aspirational.** Today there is one, and everything above must work with
one. If `claimed_by` never holds two names in a year, delete it and the lock with it.

**What we give up:** speed. A Monday applicant waits six days for a reply that could have
taken ten minutes. The Friday walk-in door is what makes that acceptable — which means
phase 0 is a lie until there is a real event in `src/content/events/` to walk in to.

## Success

- **Nothing overdue.** `SELECT COUNT(*) FROM submissions WHERE status='new' AND kind IN
  ('membership','accelerator') AND created_at < datetime('now','-7 days')` must return 0.
  This works from phase 0 with no schema change, which is why it is the primary measure.
- **Median days from `created_at` to `replied_at`.** Target ≤7. Requires phase 2.
  Published on `/docs/how-we-review` only once twenty decisions exist to average — fewer
  is a guess, and §7.4 forbids shipping it.
- **Declined and waitlisted people who turn up at a Friday within a month.** The number
  that actually matters, and **not measurable**: attendance is not recorded anywhere, and
  this proposal does not propose recording it.

**Remove this if** the rubric page has not been opened by a reviewer in a term, or if the
queue never exceeds two rows a month — at that volume the correct process is a Telegram
message.

## Effort

**Phase 0** — five string changes and a calendar entry. One hour.
**Phase 1** — one Markdown file against an existing schema and route. An evening, most of
it spent deciding what the four behaviour lines say.
**Phase 2** — one migration, `src/lib/review.ts`, `scripts/review.mjs`, unit tests for the
claim lock and the record parser. Two or three evenings, and not until the trigger fires.

No new vendor, binding or recurring cost at any phase.
