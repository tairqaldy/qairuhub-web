---
title: Ship one .ics per session before shipping a feed
status: draft
area: events
effort: S
depends_on: [007-event-system]
---

# 009 — Ship one `.ics` per session before shipping a feed

| | |
|---|---|
| **Status** | draft |
| **Area** | events |
| **Effort** | S |
| **Depends on** | 007 for a stable occurrence slug, before any subscribable feed. Phase 1 depends on nothing. |

## Problem

Every path to an AI Friday ends with a student remembering something.
`src/pages/events/[slug].astro` builds a `facts` list — `Date`, `Time`, `Where`,
`Entry` — and hands the reader nothing to carry away. Walk-in sessions, the front
door (`walkIn: true`), are the worst case: we hold nothing about the person, so
the only place the date can live is their memory.

The RSVP path is barely better. `POST /api/submit/rsvp` writes one row to D1
`submissions` and calls `notify()`, which messages the *organiser* — and
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` and the Resend keys are all listed "not
yet" set in ARCHITECTURE.md, so today a student who RSVPs receives a JSON `ok`
and nothing else, ever. The `/events` empty state states the real mechanism
plainly: *"The next dates go into the Telegram group first, then here."*

**This is a small addition to that, and Scope is written to keep it small.** A
calendar entry does one thing a Telegram message cannot: it survives the scroll,
and it alarms at 15:00 on the day. That is worth a file. It is not obviously
worth a subscription — pages are prerendered, so a feed inherits build staleness
*and* keeps its copy on someone's phone until their client polls. A wrong page is
wrong until reload; a wrong feed is wrong for a day, or forever. See Risks.

## Prior art

**[Luma — iCal syncing](https://help.luma.com/p/ical-syncing).** Two artefacts:
a one-off `.ics`, and a subscribable feed. The help page states refresh reality
plainly — Google *"refreshes roughly every 12–24 hours"*, Apple *"roughly every
15 minutes to a few hours"*, Outlook *"roughly every 3–12 hours"*. *Steal:* the
split, and printing the refresh lag rather than letting a student discover it
when a cancellation does not arrive. *Leave:* the subscription flow, which runs
through a settings page inside an account. Ours has to be a link on a public
page, because the walk-in student has no account and never will.

**[Nextcloud Calendar #78](https://github.com/nextcloud/calendar/issues/78)**
(opened September 2016, closed). Someone subscribes to a Meetup feed; the
calendar *"show[s] up in Nextcloud Calendar with the correct name … but no events
ever show in the actual calendar view."* Nothing to steal. The lesson is the
failure mode, and it is the one that governs everything below: **a broken feed
inside a calendar client presents as an empty calendar, not as an error.** The
subscriber never learns, and neither do we.

**[FOSDEM's schedule exports](https://archive.fosdem.org/2026/schedule/).** One
plain line on the schedule page: *"The schedule data is available in: Pentabarf
XML, iCal, xCal."* *Steal:* export as a text link in the run of the page, not a
modal, not a widget.

**[add-to-calendar-button](https://github.com/add2cal/add-to-calendar-button)
and its separate
[timezones-ical-library](https://github.com/add2cal/timezones-ical-library).**
That a widely used button had to spin off its own library to turn IANA tzdata
into VTIMEZONE blocks is the best available evidence about where the bugs are.
*Steal:* the deep-link templates. *Leave:* the component — a JavaScript island
whose entire output is an `<a href>` we can emit at build time.

**[New Outlook enforces RFC 5545 property
order](https://experienceleaguecommunities.adobe.com/adobe-marketo-engage-general-27/microsoft-new-outlook-strictly-enforces-rfc-5545-potentially-breaking-ics-file-generators-though-not-marketo-s-147734)**
(Adobe Experience League, October 2025). Outlook's rewritten parser *"hews so
tightly to the standard … that previously supported ICS files now don't show the
Location field"*: `VALARM` placed before `LOCATION` is invalid, was tolerated
everywhere for years, and now silently drops the room number — the single field a
student needs. *Steal:* the ordering rule, and the warning that reference
libraries and validators do not catch this.

**[The Events Calendar's `ical_properties()`](https://docs.theeventscalendar.com/reference/classes/tribe-events-views-v2-icalendar-icalendar_handler/ical_properties/)**
emits `REFRESH-INTERVAL;VALUE=DURATION:PT1H` and `X-PUBLISHED-TTL:PT1H` side by
side. *Steal:* emitting both, since `REFRESH-INTERVAL` is
[RFC 7986](https://www.rfc-editor.org/rfc/rfc7986.html) and `X-PUBLISHED-TTL` is
Microsoft's older spelling, and clients honour one or the other. *Leave:* the
rest of the `X-` sprawl.

## Proposal

One build-time artefact, and a second one only if the first proves wanted.

**1. Per-event download — the whole of phase 1.**
`src/pages/events/[slug].ics.ts`, prerendered via `getStaticPaths` exactly as
`[slug].astro` already does it, over the same `getUpcomingEvents()` /
`getPastEvents()` pair so placeholder entries stay out of production. One
`VCALENDAR`, one `VTIMEZONE`, one `VEVENT`. Nothing subscribes to it; it is
imported once and then it is the student's copy, not ours.

**2. Deep link.** A build-time Google Calendar URL beside it:
`…/render?action=TEMPLATE&text=…&dates=20260919T170000/20260919T190000&ctz=Asia/Almaty&location=…`
— local times with **no** trailing `Z`, plus `ctz`. UTC stamps here render right
for us and wrong for anyone whose Google account sits in another zone.

**3. Series feed — phase 3, conditional.** `src/pages/events.ics.ts`, also
prerendered, so a polling client hits a static asset and costs zero Worker
invocations. Linked as `https://qairuhub.com/events.ics` and
`webcal://qairuhub.com/events.ics` — the same resource, but the scheme tells a
client to subscribe rather than import once. Everything dangerous in this
proposal lives here, which is why it is last and why it is conditional.

### Two mechanical facts about this repo

**A prerendered Astro endpoint writes only its body to disk.** The
`Content-Type` and `Content-Disposition` a handler returns are discarded; the
file becomes a static asset and Wrangler assigns the MIME type
[from its extension at upload](https://developers.cloudflare.com/workers/static-assets/headers/).
`.ics` maps to `text/calendar`, so the common case is right by accident — but
`charset` and `Content-Disposition: attachment` need a rule in `public/_headers`
(100 rules max) if they are wanted at all. Confirm with one `curl -I`; do not
assume.

**There is no cron on this Worker, and there cannot be.** This repo's build
output, `dist/server/wrangler.json`, contains `"triggers":{}` — the adapter
regenerates the deploy config and `wrangler deploy` uses *that* file, so a cron
declared in `wrangler.jsonc` is dropped and one added in the dashboard is cleared
on the next deploy. [004](004-communications.md) establishes this and proposes
the second Worker that would carry a schedule. **Reminders are therefore not in
this proposal at all.**

Calendar-level properties. The last three describe a resource that is polled, so
a one-off download emits everything above `REFRESH-INTERVAL` and nothing below:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//QairuHub//qairuhub.com//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
NAME:QairuHub — events
X-WR-CALNAME:QairuHub — events
REFRESH-INTERVAL;VALUE=DURATION:PT6H
X-PUBLISHED-TTL:PT6H
SOURCE;VALUE=URI:https://qairuhub.com/events.ics
```

And one event, with the `VTIMEZONE` alongside it:

```
BEGIN:VTIMEZONE
TZID:Asia/Almaty
BEGIN:STANDARD
DTSTART:20240301T000000
TZOFFSETFROM:+0600
TZOFFSETTO:+0500
TZNAME:+05
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:example-ai-friday@qairuhub.com
SEQUENCE:0
DTSTAMP:20260906T090000Z
LAST-MODIFIED:20260906T090000Z
DTSTART;TZID=Asia/Almaty:20260919T170000
DTEND;TZID=Asia/Almaty:20260919T190000
SUMMARY:AI Fridays: building your first agent
LOCATION:QAIRU\, Astana — Lab 2.14
URL:https://qairuhub.com/events/example-ai-friday
CATEGORIES:agents,hands-on
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
END:VALARM
END:VEVENT
```

**`VALARM` comes last, after `LOCATION`.** That ordering is the whole content of
the Outlook finding above, it is invisible to validators, and getting it wrong
loses the room number.

That single `STANDARD` block is Kazakhstan's 1 March 2024 move to a national
UTC+5 — the only transition this calendar needs, because `Asia/Almaty` observes
no daylight saving, the same fact 007 leans on to avoid an `rrule` dependency.
Thirty lines, no dependency, golden-file tested. What it buys is a correct
wall-clock reading on a device set to another zone. It is **not** insurance
against a future decree; see Risks.

Four properties decide whether a changed or cancelled session ever reaches a
phone that already has it:

- **`UID`** is `<slug>@qairuhub.com`, from the Markdown filename and nothing
  else. Never a build-time UUID, never the date or title: either mints a fresh
  event on every subscriber's calendar at each edit and orphans the previous one.
  A UID you stop emitting can never be cancelled — cancellation is addressed *by*
  UID. This is why phase 3 waits for [007](007-event-system.md): its deterministic
  occurrence slug `${series}-${YYYY-MM-DD}` is exactly the stable identity a feed
  needs, and inventing a second one here would guarantee the two disagree.
- **`SEQUENCE`** is **derived, never hand-kept**: whole days from a fixed epoch to
  `updatedDate ?? starts`. Monotonic, automatic, and read from a field already on
  `base` that already drives the rail change-bar. A frontmatter integer a
  volunteer must remember to raise is the same class of failure as a laptop at the
  door — clients ignore an update whose `SEQUENCE` has not risen, so the one time
  it is forgotten is the time it mattered.
- **`DTSTAMP`** / **`LAST-MODIFIED`** come from `updatedDate ?? starts`, **not**
  `Date.now()`. A timestamp that moves every build changes the feed's bytes on
  every deploy, churns the ETag, and makes a deploy that touched nothing look
  like an update.
- **`STATUS`** is `CONFIRMED`, or `CANCELLED` with a raised `SEQUENCE`, and **the
  cancelled event stays in the feed**. Deleting it leaves a ghost session on every
  subscriber's phone. The source of truth is 007's `status` field — this proposal
  serialises it and defines no cancellation fields of its own.

Serialisation is not optional either: CRLF endings (Outlook rejects LF-only);
folding at 75 **octets**, counted in bytes, which matters the moment a Cyrillic
title appears; escaping `\`, then `;`, `,` and newline, in that order. All of it
is golden-file tested, because none of it fails loudly.

## Scope

**Phase 1 — one file, one link. Half a day.** `src/lib/ics.ts` (serialiser plus
golden files), `src/pages/events/[slug].ics.ts`, and one row in the event page's
existing `facts` list. No schema change, no feed, no subscription semantics, no
tombstones, no D1, no cron. It fails safe: the worst outcome is one wrong entry
on one phone, which the student fixes by deleting it. Ship this, and stop.

**Phase 2 — make it durable.** `ends` required; `scripts/check-uids.mjs` wired
into `pnpm check`, comparing emitted UIDs against a committed ledger and failing
the build when one disappears without a tombstone. Both are cheap and both are
prerequisites for a feed, not for a download.

**Phase 3 — the feed, only on evidence, and only after 007.** `/events.ics`,
`webcal://`, the tombstone window, the subscribe line, `REFRESH-INTERVAL`. It
needs 007's stable occurrence slug and its `status` field to exist first, and it
needs someone to have asked. See Success.

**Not in this proposal, at all:** reminders of any kind (004, and its second
Worker); the RSVP confirmation email with the `.ics` attached (004 phase 1, where
the transactional path already lives); an `RRULE` for the standing Friday slot
(007 owns recurrence, and a recurring entry that outlives the term is worse than
no entry).

## Data and schema

**Phase 1 changes nothing.** `title`, `starts`, `ends`, `location`, `room`,
`summary` and `tags` are already on the `events` schema, and that is the whole
input to a `VEVENT`.

**Phase 2:** `ends` becomes **required** via `superRefine`. Without it the event
serialises to a zero-length `VEVENT`, and defaulting to two hours would be the
site inventing a fact. The cost today is zero — `src/content/events/` holds one
file and it already sets `ends`; the cost grows with every file written before
this lands, which is an argument for doing it early rather than for doing it now.

**Nothing else.** In particular: no `cancelled`, no `cancelledNote`, no
`sequence` field, and no `uid` override. Cancellation state belongs to 007's
`status` / `cancelledReason` / `cancelledOn`, and defining a parallel set here
would leave the diary and the feed able to disagree about whether a session
happened. `SEQUENCE` is derived from `updatedDate`. A hand-editable `uid` is not
an escape hatch, it is the mechanism by which UID drift happens.

**No D1 migration and no new binding.** Nothing here writes. (`0003` is already
claimed by [005](005-honest-metrics.md) for `attendance`.)

## Design

Phase 1 draws nothing new. The event page's aside gains one hairline
`facts__row` in the same `m-label` / `m-data` grammar as `Date` and `Where`:
term `Calendar`, value `.ics · Google`. Two `link-action` links in ink, no
cobalt — on an upcoming gated event the page's single `.cta-primary` (§8.1) is
the RSVP, and adding a date to a calendar is not what the page is for.

Phase 3, if it happens, adds one mono line under the `A — Upcoming` heading on
`/events`: `SUBSCRIBE — webcal · .ics · updates within a day`. The last clause is
the Luma lesson — state the refresh lag rather than imply live sync.

**Empty state.** Every file in `src/content/` is `placeholder: true` today, so
production renders the `/events` empty state and there is no event to attach an
`.ics` to at all. Phase 1 lights up with the first real event file and needs no
empty state of its own. A phase-3 subscribe line would need one — a `VCALENDAR`
with zero `VEVENT`s is valid, so *"Subscribe now — the feed fills when sessions
restart"* is honest — but shipping that line now would advertise an empty feed,
which is a second reason the download comes first.

No subscriber count appears anywhere. Cloudflare counts requests, not people, and
printing one as the other is the invented number this project refuses.

## Risks and trade-offs

**The strongest argument for not doing this at all.** There is one session a
week, it is announced in a Telegram group the student is already in, and the
message is a scroll away. An `.ics` saves perhaps fifteen seconds of typing for
someone who has already decided to come — and does nothing whatsoever for the
person who has not, who is the whole audience the walk-in door exists for. If
that is the honest size of the win, then the correct scope is phase 1 and only
phase 1: a serialiser and a link, no ongoing obligation. **Phase 3 has to clear a
much higher bar, because a feed is not a feature, it is a promise with no end
date.**

**A subscription is permanent and one-way.** Every subscriber keeps a copy that
outlives the term, the committee and possibly the club, and it fails silently in
both directions: Nextcloud #78 above is what a broken feed looks like to the
person subscribed to it. A UID we stop emitting can never be cancelled. The
`STATUS:DELETED` value in
[draft-ietf-calext-subscription-upgrade](https://www.ietf.org/archive/id/draft-ietf-calext-subscription-upgrade-09.txt)
would help, but draft-09 is dated February 2024 and expired that August, and it
requires a server implementing its enhanced `GET` — a static file on Cloudflare
is not one. So tombstones expire at 60 days and whoever never refreshed keeps the
ghost. There is no fix for this; there is only not shipping the feed.

**Google's refresh window is a day.** A cancellation posted on Thursday may not
reach a Google subscriber before Friday's start, and nothing can force a refresh.
Telegram stays the fast channel; the subscribe copy must not promise otherwise.

**UID drift.** Renaming an event's Markdown file mints a duplicate on every
subscriber's calendar and strands the old entry. `scripts/check-uids.mjs` is the
guard, and it must land in phase 2 — before the feed, not with it.

**The timezone argument is weaker than it first looks.** Kazakhstan moved to a
single national UTC+5 on 1 March 2024
([Interfax](https://interfax.com/newsroom/top-stories/98581/),
[timeanddate](https://www.timeanddate.com/news/time/kazakhstan-single-time-zone.html)),
and `Asia/Almaty` observes no daylight saving. `TZID` over UTC stamps is still
right — it is what makes the entry read `17:00` on a device set to another zone —
but it is **not** insurance against a future reversal. RFC 5545 lets the shipped
`VTIMEZONE` define the zone, so a client that honours it keeps our stale rule and
only one preferring its own tz database self-corrects, and which does which is
not ours to choose. If the offset changes, the fix is a redeploy and a raised
`SEQUENCE`; phase-3 subscribers stay an hour wrong until they poll.

**Privacy.** No `ATTENDEE` lines, ever. `ORGANIZER` omitted, or a role address —
a named student's mailbox in a public file is a permanent, unretractable
disclosure.

## Success

**Phase 1 is judged by asking.** Two or three students at the next AI Friday, out
loud: did you use the calendar link? That is a worse instrument than analytics
and the only honest one available — §15 permits Cloudflare Web Analytics alone,
which is a JavaScript beacon, and a calendar client runs no JavaScript.
Zone-level HTTP analytics sees the requests, but free-plan retention is short and
the breakdown is sampled, so any count published from it would be a number the
site cannot stand behind.

**Phase 3 is unlocked by a question, not a metric:** somebody asks for a
subscribable calendar unprompted. Until then it stays unbuilt, and the absence of
that question is itself the answer.

**Remove it if** the `.ics` and the page ever disagree about a room or a time.
The file is the copy a student walks by; the moment it can contradict the page it
is worse than the Telegram message it was meant to improve on.

## Effort

**S for phase 1** — an afternoon: roughly 120 lines of serialiser, a golden file,
one `getStaticPaths` endpoint modelled on `[slug].astro`, one row in an existing
`<dl>`, and a single `curl -I` against the deployed file. No dependency, no
migration, no binding, no vendor, no secret, no cron, nothing that needs
attention after it ships.

Phase 2 is an evening. Phase 3 is a day *and* a standing obligation, and it is
gated behind 007 landing and somebody asking for it.
