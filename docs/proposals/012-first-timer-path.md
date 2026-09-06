---
title: Make the walk-in door findable and staffed
status: draft
area: events
effort: S
depends_on: []
---

# 012 — Make the walk-in door findable and staffed

| | |
|---|---|
| **Status** | draft |
| **Area** | events |
| **Effort** | S (Step 0), M (all of it) |
| **Depends on** | One real, non-placeholder walk-in event |

## Problem

The site claims the walk-in door five times and never says where it is.

- `index.astro` deck: `Anyone can walk into a Friday session.`
- `index.astro` step 01: `Two hours, open to anyone at QAIRU. Bring a laptop. You do not need to know anything first.`
- `Desk.astro` item 01 body: `Walk in — no application needed.`
- `Desk.astro` `.desk__aside`: *"Not ready to apply? The Friday sessions are open to anyone — turn up, or ask in Telegram."*
- `events/[slug].astro`, walk-in branch: *"the room is open from ten minutes before."*

For a first-year who has not written Python, none of that answers what decides
whether they come. `room: Lab 2.14` is a 60-character string; a first-year does
not know which entrance or which floor that is. Whether the security desk wants
a student card — and what happens if they are not a QAIRU student. What language
the room speaks: in Astana that is a real filter and the site is silent. Who to
walk up to. What to do at 17:20.

There is nobody on the door. `hosts` exists but `[slug].astro` renders it as
`hosts.map((h) => h.data.name).join(', ')` in the aside `facts` table — a name in
a spec sheet, not a person who will say hello. `learn` carries `level: 'intro'`
and nothing anywhere reads it, so there is no published starting point:
`LearnRow.astro` surfaces `kind` only. `RsvpForm.tsx`'s success state names "the
Telegram group" without linking it, assuming the reader is already in it.

The claim is true and unusable. The barrier is not the application we removed —
it is the corridor.

## Prior art

**[Recurse Center — social rules](https://www.recurse.com/social-rules)** ·
[manual](https://www.recurse.com/manual). Four rules: no well-actually's, no
feigning surprise, no backseat driving, no subtle -isms. Enforcement is a peer
saying *"hey, you just feigned surprise"*, and the answer is to "just apologize,
reflect for a second, and move on" — explicitly "not for punishing people".
**Steal:** the four rules and the callout norm, so a question costs nothing.
**Leave:** the batch machinery and the application.

**[Django Girls — coaching tips](https://coach.djangogirls.org/tips/)** ·
[organiser manual](https://organize.djangogirls.org/) ·
[tutorial](https://tutorial.djangogirls.org/en/). Behavioural coaching rules,
not pedagogical ones: don't say "it's easy" or "just…"; don't act surprised when
people say they don't know something; and *"imagine that their keyboard is made
of lava"* — ask "may I?" before typing. The manual sets "3 attendees + 1 coach"
and an installation party the evening before, so the first hour is not `pip`.
The tutorial promises to "put it online, so others will see your work".
**Steal:** the keyboard rule, setup-before-the-day, and ending in a public URL.
**Leave:** the full-day format and selection by application.

**[Rails Girls — coach guide](https://guides.railsgirls.com/coach)**. A coach
takes "anywhere from 2 to 5 girls" and needs no expertise: *"often coaches who
are just one step ahead of attendees are the best at explaining"*. **Steal:**
second-years coach first-years — the only staffing model a volunteer club
sustains, and it removes the expert caste.

**[Hack Club — clubs](https://hackclub.com/clubs/)** ·
[Jams](https://jams.hackclub.com/). Three acts: "leaders introduce a project
direction and get everyone started", members build, and *"every meeting ends
with demos"*. Jams filter to 30- and 60-minute builds. **Steal:** the demo close
and the 60-minute ship-something unit. **Leave:** the Slack-first identity —
Telegram must not be a prerequisite for walking in.

## Proposal

Four interventions. None needs a laptop at the door.

**1. A walk-in page says where the door is.** `entrance` and `access` render in
the lead column of `[slug].astro`, not inside the aside: the entrance and floor
in words a stranger can follow, and what the desk asks for. Plus `languages`,
because it is the filter nobody states.

**2. A named greeter, printed with a face.** `greeter: reference('people')`
renders name, `avatar` portrait and `telegram` handle under one line: *"Ask for
Aisulu. If nobody is there by 17:10, message her."* The greeter arrives before
the door opens, stands at the named door, and pairs each new person with someone
already building. That is the whole practice: one person, ten minutes.

**3. A published first ten minutes.** `firstTen`, 3–5 lines in the homepage
`.steps` idiom: the door opens ten minutes before; you write a first name on a
paper strip; the greeter walks you to a table with two other people; someone
says out loud, in three sentences, what the room is doing today. **No
introductions with credentials** — "third-year, ML research" is the sentence that
makes a first-year leave.

**4. A starting point that is not a beginner event.** Same room, same two hours,
same demo slot. Every AI Friday points at one `starterGuide: reference('learn')`
— `kind: 'guide'`, `level: 'intro'` — a 60-minute path ending in something
deployed. First one: *put a page with your name on the internet* — a Worker on
`workers.dev`, on the [Workers free
plan](https://developers.cloudflare.com/workers/platform/pricing/) this site
already runs on, finishing with a URL you can send to someone. It lists the
installs to do beforehand and says arriving with nothing installed is fine.

### What NOT to do

- **No separate beginner event.** No "Intro Friday", no beginner room, no
  beginner Telegram group. The moment beginners have their own session, regulars
  stop coming and it becomes the thing you graduate out of.
- **No `beginner` tag or filter on the events index** — it lets regulars opt out
  of the newcomers.
- **No levels, belts, badges or "mentor" titles on people.**
- **No attendance or capacity numbers** without a real count (DESIGN.md §10.3).
- **No `/events/first-time` route.** The content belongs in the `docs`
  collection, which already has `/docs/[slug]` and an index; a hand-rolled route
  over the same file would publish it at two URLs.
- **No requirement to be in Telegram**, and no quiz, form or application in
  front of a walk-in session.

## Scope

**Step 0 — no gate, no new page, ~1 hour.** Two optional fields, `entrance` and
`access`, added to `events` and rendered as two more rows in the existing
`facts` `<dl>`. Fill them on one real event. This is worth shipping on its own,
and it is the only part worth doing before there is a published event to attach
it to.

**Step 1.** `languages`, `bring` and `firstTen`; move the arrival facts out of
the aside into a `Getting in` block in `.col-lead`.

**Step 2.** `greeter`, the portrait block, and the build assertion below.

**Step 3.** `src/content/docs/first-time.md` (`category: 'process'`) — the four
Recurse rules in our own words, the coaching rules, what to do if you arrive
late, and the honest sentence about who gets past the security desk. It renders
at `/docs/first-time` through the existing route and lists in the `/docs` index
under Process; no new page code. `EventRow.astro` walk-in rows and `[slug].astro`
link to it.

**Step 4.** The first `starterGuide` in `learn/`.

**Step 5 (optional).** A "first time here" checkbox on `RsvpForm.tsx`. It needs
a field on `rsvpSchema` in `src/lib/forms.ts` — Zod strips unknown keys, so a
bare checkbox would be silently discarded — after which it rides in
`submissions.payload` with no D1 migration. Walk-in sessions have no RSVP, so it
covers only limited-place events.

## Data and schema

`src/content.config.ts`, `events`:

```ts
entrance:  z.string().max(160).optional(),      // "Main entrance, 3rd floor, past the lifts"
access:    z.string().max(160).optional(),      // what the desk asks for
languages: z.array(z.enum(['kk','ru','en'])).default([]),
bring:     z.array(z.string()).max(4).default([]),  // and what if you bring none of it
firstTen:  z.array(z.string()).max(5).default([]),
greeter:   reference('people').optional(),
starterGuide: reference('learn').optional(),
```

Seven fields. No `doorsOpen`: it is derivable from `starts`, and a second
absolute datetime per event is one more thing to get wrong on a copy-paste. The
door opens ten minutes before, which is what `[slug].astro` already says. Fix
that copy in one place rather than adding a field to restate it.

**The gate is not a `superRefine`.** `src/content.config.ts` contains no
`superRefine` at all — the `cover`/`coverAlt` requirement in DESIGN.md §13 is
written down and unimplemented, so there is no existing rule to follow the
spirit of. More to the point, Zod validates one entry in isolation and cannot
see whether a `greeter` resolves to a *published* person. `resolveReference` in
`src/lib/content.ts` drops any `draft` or `placeholder` target, so a required
greeter pointing at today's placeholder people would satisfy a schema gate,
build clean, and render **nothing** in production — precisely the failure this
is meant to prevent.

So the assertion goes where the reference is actually resolved, in
`[slug].astro`: if `data.walkIn` and `entrance`, `access`, `languages` or the
resolved greeter is missing, `throw`. That fails the build, and it fails on the
placeholder case too. One e2e assertion in `tests/e2e/design-law.spec.ts`: every
walk-in event page links to `/docs/first-time`.

The gate lands in Step 2, not Step 0. Until then the fields are optional and a
half-filled event still ships.

## Design

RECORD register: hairline rows, mono labels, no card, no box. `Getting in` is a
`<dl>` shaped like the existing `.facts` table, moved into `.col-lead`;
`firstTen` reuses the homepage `.steps` list with hanging mono ordinals; the
greeter portrait is `aspect-ratio: 56 / 72` at radius 0 with a 1px
`--rule-strong` border, matching `PeopleStrip.astro`. No cobalt is added: the
walk-in state token is already `.state--live` under §8.2 #8, the single
`.cta-primary` stays the RSVP button where there is one — a walk-in page has
none today — and `First time here →` is a `.link-action`.

**Copy changes.** `index.astro` step 01 names the door and the door-open time.
`Desk.astro` item 01 gains `First time? What happens →`. `EventRow.astro`
walk-in rows gain the same link under the state token. `[slug].astro` gains the
`Getting in` and `firstTen` blocks and the greeter; `facts` gains `Language`.
`RsvpForm.tsx`'s success copy gives the room and door time rather than naming an
unlinked Telegram group.

**Empty state.** `/docs/first-time` is standing instructions and names no date,
so it renders correctly with no upcoming session and needs no `EmptyState`.

## Risks and trade-offs

- **The strongest argument against doing any of this: there are no events.**
  Every file in `src/content/` is `placeholder: true`, production correctly
  shows empty states, and `docs/STATUS.md` names "the next real event" as the
  second most valuable thing anyone could add. This proposal builds a corridor
  to a room nobody has booked. Publishing one real AI Friday with a room and a
  host would beat all four interventions and needs none of them. Step 0 is
  scoped to an hour so the rest can wait behind a real event on purpose.
- **It makes publishing an event harder in the exact week the site most needs
  one published.** A walk-in event goes from ~10 lines of YAML to ~20, and Step 2
  makes six of them mandatory. That is the wrong direction while the count is
  zero. Mitigation: the gate lands last, and the fields are stable across a
  series — once a term plus a copy-paste.
- **The greeter rota is what rots.** It is a field in the pull request that
  publishes the event, not a weekly chore, but someone will fill it to satisfy
  the build and not show up — worse than silence, because the site then lied.
  The published fallback ("if nobody is there by 17:10, message X") is the only
  honest cover, and it is a promise made on a volunteer's behalf.
- **That fallback publishes a student's Telegram handle on a page inviting
  strangers to message it.** `people.telegram` already renders elsewhere, so the
  handle is not new, but "message her" changes what it is for. Ask the person
  every term, and let a greeter drop the line without dropping the job.
- **This may prove the walk-in claim is partly false.** If the desk requires a
  student card, "anyone can walk in" is untrue for a student from another
  university. Forcing `access` into writing surfaces that. The fix is
  operational, not a website change — but the site must stop claiming otherwise
  either way.
- **Stating the language may exclude someone.** Not stating it excludes more,
  silently, and only those already unsure.
- **Ghetto drift.** The starter guide is the risk: the day it gets its own room
  or its own hour, this has failed.

## Success

- One real walk-in event page names its entrance and what the desk asks for.
  That is Step 0, and it is the only criterion that means anything until an
  event exists.
- After Step 2: every walk-in event has a greeter that resolves to a published
  person. Build-enforced.
- Countable and honest: starter guides published in `learn/`, and URLs shipped
  from a first session that reach the project registry with a real name on them.
- **Remove it if** the greeter ritual is skipped three sessions running. Delete
  the copy rather than leave a promise the room does not keep — the
  invented-numbers rule applied to behaviour.

## Effort

**S for Step 0:** two optional fields and two rows in an existing `<dl>`.
**M for the rest:** five more fields, one build assertion, one Markdown file on
an existing route, three components edited, one e2e assertion. No new route, no
D1 migration, no new binding, no vendor, no cost. The expensive part is one
person standing by a door for ten minutes a week.
