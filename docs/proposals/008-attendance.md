---
title: Record who came, not who said they would
status: draft
area: events
effort: L
depends_on: [005-honest-metrics]
---

# 008 — Record who came, not who said they would

| | |
|---|---|
| **Status** | draft |
| **Area** | events |
| **Effort** | L |
| **Depends on** | 005 phase 1 having run for a term. Phase 2 belongs to 001. |

## Read 005 first

[005 — Measure only what would change a decision](005-honest-metrics.md) already
proposes an `attendance` table, a self check-in endpoint, an `ATTENDANCE_PEPPER`
secret and a migration named `0003_attendance.sql`. This is the argued version
of that phase 2 and nothing else; where the two disagree, 005 wins.

**And 005 phase 1 is what to build first, which is not this.** One optional
integer on the event's Markdown file — `attended: 23` — answers "six or forty"
completely, in half a day, with no database, route, secret or personal data.
Everything below buys the one thing that integer cannot say — *which* people —
and that only matters if someone is actually asking whether anyone comes back.

## Problem

`submissions` records intent. A row with `kind = 'rsvp'` and
`event_slug = 'ai-fridays-12'` means somebody typed an address into
`RsvpForm.tsx` some days earlier. It does not mean they walked into the room.

The gap is worst at the front door. `walkIn: true` events collect no RSVP at
all: `src/pages/events/[slug].astro` renders `No sign-up needed. Turn up at
{formatTime(data.starts)}` and no form. AI Fridays is the main conversion path
and it produces zero rows by construction.

So two questions get answered from memory. *Is the Friday slot working?* — six
people is a signal to change the format, forty is a signal to book a bigger
room; that one is answered by counting heads and writing the number down, which
is 005 phase 1. *Does anyone come twice?* — that one cannot be answered at all
without recording who, and it is the more useful of the two. A club that loses
everyone after session two has a problem between sessions, not at the door.

The constraint that decides the design: whoever runs this is a full-time
student. A laptop at the door will be forgotten by week three.

## Prior art

**[MLH's check-in guide](https://guide.mlh.com/general-information/managing-registrations/check-in-process)**
is deliberately unglamorous: "A simple ctrl+f for the name in a google
spreadsheet with a column to mark with an X is an easy way to set up check-in",
a separate form for late registrations, and the writing table moved off the desk
so the queue does not stall. *Steal:* a first-class path for people who never
registered — at a walk-in Friday that is most of the room. *Leave:* the desk.
MLH is solving for 500 hackers arriving inside one hour.

**[Hack Club's club dashboard](https://github.com/hackclub/club-dashboard)** —
"a comprehensive, modularized dashboard system for Hack Club leaders to manage
their clubs, track attendance, manage projects, and engage with their
community" — was **archived in August 2026**. Their staff-run event tool,
[Attend](https://attend.hackclub.com/), is alive, and logs NFC wristbands
scanned at stations ("Scanned in · Dining Hall"). The lesson is the split: the
staffed tool survives, the volunteer-run club dashboard did not. *Steal:* the
warning. *Leave:* both — NFC needs someone holding a reader, and the dashboard
is precisely what this must not become.

**[Meetup](https://help.meetup.com/hc/en-us/articles/9556581679245-Checking-in-attendees)**
opens QR check-in an hour before the event and closes it 24 hours after it ends;
the attendee list stays editable by hand beyond that.
**[Luma](https://help.luma.com/p/check-in)** pairs scanning with a name search
"so they can check guests in manually". *Steal:* the wide retroactive window —
attendance recorded on the tram home is still attendance — and two paths,
because one always fails. *Leave:* the per-guest QR, which assumes everyone
registered first, and the model where only the organiser can record anything:
entirely their labour, so entirely theirs to forget.

**[FOSDEM](https://archive.fosdem.org/2026/faq/).** "No registration is
required." The organisers genuinely do not know the number;
[per Wikimedia's Diff](https://diff.wikimedia.org/2023/06/14/what-we-can-learn-from-the-world-upside-down-at-fosdem-the-largest-existing-conference-organized-with-open-software-and-you-can-even-listen-to-the-audio/),
"at the end of the event they estimate attendance based on data from the network
and food sales". *Steal:* the honesty. *Leave:* the estimating. That inference
is defensible across 8,000 people and a campus; inferring 23 from anything is
inventing a number, which `docs/CONTENT.md` forbids outright.

## Proposal

**A code on the whiteboard, and a page the student opens themselves.**

A per-event code, six characters of Crockford base32 (no I, L, O, U), derived
server-side as `base32(HMAC-SHA256(CHECKIN_SECRET, eventSlug))[0..5]` — say
`Q7K3MP`. Nothing is stored to issue it and it never enters the public repo. The
organiser writes it on the whiteboard and says it out loud: the entire door
operation, and the one 005 already assumed.

`GET /in/[code]` resolves the code to an event, checks the window, and shows one
field and one button. `POST /api/checkin` runs the honeypot → Zod → rate limit →
Turnstile order of `src/pages/api/submit/[kind].ts`, hashes the address and
writes one row. The page becomes a receipt in the pattern of `DESIGN.md` §12.3:
`CHECKED IN · AI FRIDAYS 12 · 17:04`, then a link to the Telegram group. Links,
not fields — a walk-in is not harvested.

**Nobody checks anybody in, so no queue exists.** Check-in opens 30 minutes
before `starts` and closes at `ends + 2h` (or `starts + 3h` where `ends` is
absent). People check in sitting down, at the break, or on the way out. The
queue was always a symptom of the desk.

**The roster is audited by phase 0, not by a workflow.** Nine rows under a
counted 23 means the code did not reach people; the published sentence stays the
human *"23 people came"* and the roster is used only internally. This is why the
integer comes first — nothing inside the database can tell you it is short.

## Scope

**Phase 0 — 005 phase 1, and it is not built here.** `attended` and
`attendedBy` on the `events` schema, one line on the past-event page. Half a
day, no database. **Run it for a full term before reading further.** If the
integer does not get filled in, nothing below would have been filled in either,
and this proposal has been answered.

**Phase 1 — the roster.** Migration `0003_attendance.sql` (005's table),
`CHECKIN_SECRET`, `GET /in/[code]`, `POST /api/checkin`, the receipt. One
migration, one page, one endpoint, nothing rendered publicly. This is the
smallest thing that answers "did anyone come twice", and it is the whole of
what 008 adds over 005.

**Phase 2 — the fallback, inside 001.** A `+1` control and a typed total writing
`source = 'organiser'`, because lab wifi fails and someone will have no phone.
This is a row on [001's admin console](001-admin-console.md), not a page of its
own — it shares that page's Cloudflare Access setup or it does not happen.

**Not proposed:** names, a member database, per-person history shown to anyone,
streaks, badges, leaderboards, geofencing, QR codes, printed slips, a printable
tally sheet, a `confidence` workflow, or a dashboard.

## Data and schema

`src/content.config.ts` needs nothing from phase 1: `walkIn`, `starts` and
`ends` already carry what the window needs. The schema change is 005's
`attended` / `attendedBy`, in phase 0.

The migration is 005's, unchanged — same filename, so only one of the two
proposals writes it:

```sql
-- migrations/0003_attendance.sql
CREATE TABLE IF NOT EXISTS attendance (
  event_slug  TEXT NOT NULL,
  -- HMAC-SHA256(lower(email), ATTENDANCE_PEPPER), hex. No address is stored.
  person_key  TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'self' CHECK (source IN ('self','organiser')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_slug, person_key)
);
CREATE INDEX IF NOT EXISTS idx_attendance_person ON attendance (person_key, created_at);
```

No `had_rsvp` column — derivable by hashing `submissions.email` with the same
pepper, and a denormalised copy is a second thing to get wrong. No
`event_counts` table — the number a human vouched for lives in the Markdown file
as `attended`, in git, where it has an author and a diff.

The key is **not** salted per event, so "how many distinct people came this
term" is computable and an erasure request is one
`DELETE ... WHERE person_key = ?`. The cost is that one pseudonym links a person
across sessions. Stated, not hidden.

Two new secrets on `Cloudflare.Env`: `ATTENDANCE_PEPPER` (005's) and
`CHECKIN_SECRET`. Rotating the pepper destroys all historical linkage; rotating
the secret changes every code.

**Retention.** Raw email is hashed in the request and discarded. Rows are
deleted 18 months after `created_at` — by a cron this repository cannot
currently run; see Risks. Rate limiting reuses `checkRateLimit` unchanged.

**Cost: no new vendor.** Forty check-ins is forty writes against D1's free
[100,000 rows/day](https://developers.cloudflare.com/d1/platform/pricing/), and
[Turnstile's Managed mode is "completely free to everyone for unlimited
use"](https://blog.cloudflare.com/turnstile-ga/) — it is the same visible widget
already rendered by `src/components/form-kit.tsx`, so it costs one interaction,
not zero. Phase 2's Access page sits inside the
[free 50 seats](https://blog.cloudflare.com/teams-plans/); that figure is from
2021, so confirm it on the current plans page before relying on it.

## Design

`/in/[code]` is a FORM page per §12.3 cut to one field, whose success state is a
receipt. One `.cta-primary`: `I'M HERE`.

Nothing from the roster is published. The public sentence is 005's — one line of
prose on a past event page, *"23 people came"*, rendered only where a human set
`attended`. It is **not** a row in the facts `<dl>` beside `Room holds 30
people`, because a number describing what happened must not sit where
availability is read, and **it never appears on an upcoming event page.**

It also does not feed the §10.3 capacity rule, because **that rule is not
built**: `countForEvent()` in `src/lib/db.ts` is called from nowhere, and
`src/pages/events/[slug].astro` prints `Room holds 30 people` and stops. The
live-count track is separate work and this proposal does not do it.

An uncounted session renders **no line at all** — not `0`, not `—`; zero and
unknown are different facts. Any aggregate carries its denominator in the same
sentence: *"Counted at 6 of 9 sessions this term."*

`/in/*` is a `noindex` utility route, and there is no exemption list in
`tests/e2e/design-law.spec.ts` to join — it has an inclusion list, `ROUTES`, from
which `/dev/glyphs` is simply absent. Add `/in/*` to `ROUTES`: the plate
assertion is `≤ 1`, so a page with no PLATE passes, and the one-CTA, no-card,
no-shadow, one-`h1` and skip-link assertions should certainly apply to a page a
student meets at the door.

## Risks and trade-offs

**The strongest argument against building it at all: phase 0 already answers
the question anyone is currently asking.** "Six or forty" is the decision on the
table this term, and it costs one integer typed into a Markdown file. Everything
008 adds is return rate and walk-in-versus-RSVP — and 005 sets the floor for
return rate at eight weeks and twelve people, so the metric renders nothing for
most of the first term it exists. A system that produces no usable answer inside
the term it was built in, maintained by someone who graduates, is a bad bet.
Build phase 0, run it a term, then decide with the integer in hand.

**The organiser forgets. That is the expected outcome, not the edge case.** Week
one the code goes on the board. Week four somebody is late and it does not. Week
seven the habit is gone. The design is arranged so that failure is silent: an
uncounted session renders nothing and drags no aggregate down. If more than half
of one term's sessions have no roster, **drop the table** — a half-kept record
invites exactly the average `docs/CONTENT.md` exists to prevent.

**The obvious fix — a Telegram reminder on a Friday morning — cannot currently
be built, and that should change the plan.** `TELEGRAM_BOT_TOKEN` is declared in
`src/types/cloudflare-env.d.ts` but unset (`docs/STATUS.md`). There are no cron
triggers, and adding one to `wrangler.jsonc` would not survive: the adapter
regenerates the deploy config into `dist/server/wrangler.json`, which carries
`"triggers":{}` in this checkout right now — the same mechanism that silently
drops custom domains (`docs/ARCHITECTURE.md`). And its entrypoint
default-exports `{ fetch }` alone, so there is no `scheduled()` handler for a
trigger to reach even once one is attached in the dashboard. So "two cron
triggers (S)" is not a line anyone may put on a plan, and the same blockage sits
under the 18-month deletion cron above. Until it is solved the prompt is a
recurring reminder on somebody's phone — which is fine, and should be said
plainly rather than designed around.

**A code shared into a group chat lets someone check in from home.** Accepted:
there is no reward, the window is three and a half hours, and every
countermeasure — rotating codes, device ID, server time, geolocation, the whole
[ICSCA 2018 stack](https://dl.acm.org/doi/10.1145/3185089.3185093) — puts back
the laptop this proposal exists to remove. The threat model here is a forgetful
organiser, not a determined student.

**Email as the identifier excludes someone** — no phone, flat battery, no
address they want to hand over. Phase 2's `source = 'organiser'` is the answer,
which means phase 1 on its own systematically undercounts. Say so wherever the
roster is quoted, and never quote it as a head count.

**Access is a real dependency, and it is 001's to own.** Misconfigured, a gated
page is either unreachable or public; it should 404 rather than show a login
prompt when the header is absent. Solving that twice is how two half-working
admin surfaces get built.

## Success

There is no defensible target before a single session has been counted, so these
are directional, and 005's floors govern what may render.

- Self check-ins are the large majority of rows. A roster dominated by
  `source = 'organiser'` means the code is not reaching people.
- The roster and the typed `attended` agree within a few heads. A roster at half
  the counted total means the code is being announced badly — and the number
  published stays the human one.
- At a `walkIn: true` session, more check-ins than there were RSVPs. If not, the
  open Friday is not actually open, which is a bigger finding than attendance.

**Remove it when** someone asks to publish a roster count as though it were a
head count, when a term ends with most sessions unrecorded, or when `attendance`
is asked to do anything other than counting.

## Effort

**L, not M.** Phase 1 in isolation is S–M — a migration, a secret, one route,
one endpoint, one receipt, most of it `form-kit`, `verifyTurnstile` and
`checkRateLimit` already written. What makes the whole L is everything around
it: the cron and entrypoint work above, Cloudflare Access for phase 2, and phase
0 having to run for a term first. The calendar cost is a term, not a weekend.

Depends on **005 phase 1** having actually happened, and shares its migration,
its secret and its schema. Phase 2 belongs inside **001**. If 005 and 001 are
both rejected, reject this too — on its own it is a check-in system with nothing
to check itself against and nowhere to be administered from.
