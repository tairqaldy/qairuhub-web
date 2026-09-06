---
title: Make the write-up promise true, or take it down
status: draft
area: events
effort: S
depends_on: []
---

# 011 — Make the write-up promise true, or take it down

| | |
|---|---|
| **Status** | draft |
| **Area** | events |
| **Effort** | S |
| **Depends on** | — |

## Problem

Four places on the live site promise that every Friday session is written up:

| Where | What it says |
|---|---|
| `src/pages/index.astro:202` | "Every Friday session is written up afterwards so people who missed it can still follow along." |
| `src/pages/learn/index.astro:21` | "Every Friday session gets written up afterwards." |
| `src/pages/about.astro:17` | "Every session gets written up." |
| `src/content/programs/education.md:15` | "notes get written up, guides get published" |

Against that: `src/content/learn/` holds one file, `example-note.md`, marked
`placeholder: true`, so production correctly renders the empty state. Nothing in
the repository, the build, or anyone's calendar makes the promise true.

The `learn` schema carries `event: reference('events').optional()` — and **no
page reads it**. Grep `data.event` across `src/pages/` and `src/components/`:
nothing. So even once a real note exists, `/events/[slug]` will not link to it
and `/learn/[slug]` will not name the session it came from. The field is a
declared intention with no consumer.

The failure will not be dramatic. The person who ran the session is best placed
to write it up and least willing to on Friday night. Weeks one to four get
notes. Week five is midterms, week six has the note "half written", and by week
nine nobody remembers the site claims otherwise. The page still says it. An
unwritten note is a gap; an unwritten note behind a published promise is a lie,
and it is the first lie a student who missed a session will catch us in.

The structural gap underneath: the site can say *here is the note* or say
nothing. It has no way to say *this session has no write-up*. Silence is what
hides the rot, and silence is the default today.

## Prior art

**[ML@B Deep Learning Reading Group, UC Berkeley](https://github.com/mlberkeley/deep-learning-reading-group)** —
a public repo scheduling about twenty sessions, four commits total, `{TBD}`
still sitting in the template for the sponsoring professor, the room and the
member count. Untouched since 2016. *Steal:* the per-session row is the right
unit. *Leave:* a repo where nothing exists before the session, and only a
maintainer can update it, dies with that maintainer's semester.

**[Latent Space Paper Club](https://eugeneyan.com/writing/paper-club/)** —
weekly, an unbroken streak over 18 months and 80+ papers. The one transferable
practice: *at the start of each session, ask for volunteers to facilitate next
week's* — not at the end, not over chat. The facilitation is recorded; the Q&A
deliberately is not, which protects candour and keeps a reason to attend live.
Notes live in [eugeneyan/llm-paper-notes](https://github.com/eugeneyan/llm-paper-notes):
51 papers, one to three sentences each. *Steal:* the ask at the top of the
session; a note small enough it is never postponed. *Leave:* one README as the
archive — it attaches to no event and cannot express "not written".

**[Kubernetes community meeting](https://github.com/kubernetes/community/blob/main/events/community-meeting.md)** —
a shared notes document, and the norm stated in writing: volunteers are welcome
to add notes directly to the document, or to tell the host at the beginning of
the call that they will take them. Old minutes move into a
[dated archive file](https://github.com/kubernetes/community/blob/main/communication/meeting-notes-archive/201808-201902_Community_Meeting_Minutes.md)
rather than being deleted. *Steal:* the role is asked for aloud, and the archive
lives in the repository. *Leave:* any assumption that this is permanent — that
same page now records the meeting as inactive. Kubernetes had paid staff and it
still stopped.

**[UW–Madison AIRG](https://wiscairg.github.io/)** — a weekly ML reading group
whose archive goes back to 2002. Presenters volunteer to the coordinators and
announce the paper about a week ahead on the mailing list. Twenty-plus years of
survival on a record of date, presenter and paper. *Steal:* a minimal record
kept forever beats a rich one kept for a term. *Leave:* the mailing-list rhythm
— nothing is public until someone rebuilds the page by hand.

One counter-example worth holding onto: the
[Papers We Love organizers repo](https://github.com/papers-we-love/organizers)
gives chapters a code-of-conduct template, venue and sponsorship advice and
Meetup guidance, and says nothing at all about notes. Chapters have run for
years without a write-up norm; the durable artefacts are the paper and a link.
Sometimes the honest floor is source material, not prose.

What separates the survivors: the record is small, the owner is named in front
of witnesses, and the debt is bounded. What kills it: unbounded backlog, a
single owner, and a promise larger than the practice.

## Proposal

**1. Make the four strings true today.** This is the whole fix for the lie, and
it needs no schema, no script and no process. Replace "every Friday session is
written up" with what is actually true: sessions that were written up are on
`/learn`, and each event page says whether its own note exists. If the rotation
below never happens, the site is still honest — which is not the case now.

**2. One new field: `scribe` on `events`.** Who owes the write-up for that
session. Named in the room, at the *start*, per Latent Space and Kubernetes, and
written into the event file before anyone leaves. The host does not scribe.

**3. Derive the state; never store it.** A write-up is **written** when a `learn`
entry with `event: <slug>` exists. Otherwise it is **owed** until the session
date + 14 days, and **not written** after that. Both are functions of the event
date and the build clock, so they are right at every build and nobody edits a
file to flip them. No stub files, no `state` enum, no day-14 job. An earlier
draft of this proposal had all three, and every one of them was a thing a
volunteer had to remember — the exact failure mode the constraints forbid.

**4. Give the note a shape that fits in fifteen minutes.** Five headings,
250–450 words, published as a `docs` entry (`category: process`) at
`/docs/session-writeup`:
`## What we did` (two sentences) · `## The one idea` (four at most) ·
`## The code` (paste what actually ran, uncleaned) ·
`## Where people got stuck` (two items minimum) ·
`## Links, in the order we used them`.
"Where people got stuck" is the only section a reader cannot get anywhere else,
and it is the reason the note is worth writing. Over 700 words is a warning, not
an error: the second-longest note in an archive is usually the last one anyone
wrote.

**5. Bound the debt in the copy, not in code.** A session either has a note or
publicly does not, permanently, after fourteen days. Nothing chases it, nothing
reopens it, nothing accumulates. An open-ended backlog is what killed the dead
archives above.

Not proposed: an admin UI, a CMS, a review gate, an attendance number, an R2
bucket, or any new vendor. Recordings stay as they are — an unlisted link in the
existing `recordingUrl`. A 45-minute video is not a write-up; it is unskimmable
and unsearchable, and treating it as one is how a club stops writing.

## Scope

**Phase 1 — half a day, and worth doing even if nothing else ever ships.** The
copy fix (part 1), the `scribe` field, a derived Notes row in the existing facts
list on `/events/[slug]`, and a link from `/learn/[slug]` back to its session.
After this the site states the truth about every session it has held, with no
new process, no new page and no new dependency.

**Phase 2 — after two real notes exist.** `/learn/backlog`, the template
document, one roster line in a `docs` entry naming who is up next.

**Phase 3 — not before Phase 2 has survived a term.** Automated nudges. See
Risks; they are blocked today for reasons that are our build's, not the
platform's.

**Explicitly rejected: a build-failing check.** An earlier draft had a
`check-notes.mjs` fail `pnpm check` when a past event had no note. That holds
the whole site hostage to a volunteer's Friday night — a room change, a typo fix
and a broken link all become unshippable because nobody wrote up week six. If a
check is wanted, it prints a warning and exits zero.

## Data and schema

`src/content.config.ts`, `events` only:

```ts
/** Who owes the write-up for this session. Named in the room, at the start. */
scribe: reference('people').optional(),
```

That is the entire schema change. `learn.event` already exists and needs a
consumer, not a migration. `state`, `dueDate` and an `attachments` array are all
either derivable or premature, and every stored field is a field that can go
stale.

**No D1 migration, no new binding, no new secret.** This is content: it must
keep working with the database down, and it does.

Routes: `/events/[slug]` gains one `.facts__row` in the `<dl class="facts">`
that is already there; `/learn/[slug]` gains a session link beside its existing
meta line; `/learn/backlog` is new and prerendered, in Phase 2.

## Design

The Notes row on the event page, by state — never hidden, never a broken link:

| Case | Value |
|---|---|
| Event is in the future | row absent |
| Owed | `Owed — Aidana, due 7 October` |
| Written | `Read the note →` |
| Not written, recorded | `Not written. Recording available ↗` |
| Not written, nothing recorded | `Not written. Nothing was recorded.` |

`/learn/backlog` composes RECORD plus the mandatory PLATE (§7.2); under three
rows it renders as READ per the thin-content law (§7.4) — exactly its state in
week two. Columns: date · session · scribe · state. Tabular figures, mono
metadata, hairline separation, no card, no box.

**State tokens are English only:** `OWED`, `WRITTEN`, `NOT WRITTEN` in
`m-label`. A `КҮТУДЕ / OWED` pair breaks §16's "one language per viewport, no
mixed-script chrome" and contradicts `docs/CONTENT.md`, which holds Kazakh and
Russian unpublished until a native speaker writes them. These tokens get
translated with the rest of the site or not at all.

**No cobalt anywhere in this feature.** Cobalt is the live layer (§8.1–8.2):
something the *reader* can act on. A reader cannot act on someone else's writing
debt, so all three tokens are `--ink-3`. The backlog page spends its one
`.cta-primary` on nothing — a "Claim a session" button is a false affordance
while claiming happens out loud in a room and there is no admin interface to
receive it.

`/learn` already has a designed empty state (`EmptyState` in
`src/pages/learn/index.astro`); it needs its copy corrected, not replacing. Once
notes exist, a foot line carries counts that are genuinely countable from
content — `14 sessions · 11 written up · 3 not` — never a percentage, never
animated.

## Risks and trade-offs

**The ledger reads as a wall of shame.** Mitigated by asymmetry: the scribe's
name shows while a note is *owed* and as a byline on the *written* note; once a
session passes into `not written`, the row names the session only. Credit is
personal, failure is institutional.

**Nothing flips without a build.** Derived state is correct at build time and
the site rebuilds on push, so in practice any content change fixes every stale
row. But a quiet month means a row can still read `Owed` past its due date. This
is the same class as the upcoming/past staleness `docs/STATUS.md` already
records, and the same fix — a scheduled rebuild — is blocked by the same thing.

**The nudges cannot ship as Phase 3 describes them, today.** Three verified
obstacles, none of them Cloudflare's fault. (a) `@astrojs/cloudflare` regenerates
the deploy config into `dist/server/wrangler.json` with an empty `triggers`
block and `wrangler deploy` uses *that* file — documented in
`docs/ARCHITECTURE.md`, and exactly why the custom domains live in the dashboard
instead. A `crons` array added to `wrangler.jsonc` would be silently dropped.
(b) `main` is `@astrojs/cloudflare/entrypoints/server`, so a `scheduled()`
handler needs a custom entrypoint re-exporting `@astrojs/cloudflare/handler`;
the adapter's `workerEntryPoint` option was
[removed](https://docs.astro.build/en/guides/integrations-guide/cloudflare/).
(c) The Telegram credentials do not exist — `src/lib/notify.ts` returns
`not configured` without them, and STATUS lists them as optional secrets nobody
has set. The platform side is fine
([5 cron triggers per account on the free plan, 10 ms CPU, and I/O wait does not
count toward it](https://developers.cloudflare.com/workers/platform/limits/)),
which is why this is deferred rather than abandoned.

**Rotation conscripts weaker English writers.** A note in Kazakh or Russian is a
real note; `learn` already carries `lang`. Do not machine-translate. This hits
the open `lang`-filtering finding in STATUS before a second language ships.

**Quality floor versus existence floor.** No review gate; a second person
merging with "reads OK" is enough. A gate is a queue, and a queue is where this
dies.

**The strongest argument for not doing any of this.** There is not one real
event, one real person or one real note in the repository — everything in
`src/content/` is `placeholder: true`. This proposal builds a rotation, a ledger
and a nudge for a practice that has not been performed once. The cheaper move is
Phase 1's first line on its own: change the four strings so the site stops
promising something that has never happened, then write one note by hand after
the next real Friday. If two land unprompted, build the rest. If they do not, no
schema would have produced them, and the promise was the only thing that needed
fixing.

**And if the sessions do not produce prose.** If AI Fridays are hands-on
workshops where nothing meaningful transfers as text, a summary is a different
kind of lie. Publish the exercise and the code, drop the prose headings, and
call the artefact what it is.

## Success

Over one term of 14 Fridays: at least 11 notes published within 7 days of their
session; at least 5 distinct scribes; nothing still reading `Owed` past day 14.

Rewrite or remove this if, after two terms, one person wrote over 60% of notes
(the rotation failed), `not written` outnumbers `written` (the promise is wrong,
not the tooling), or the median note falls under 120 words (we are publishing
filler).

## Effort

**S** — Phase 1 is about half a day: the `scribe` field 20 minutes, the two page
rows and the derived-state helper 2h, copy 30 minutes. Phase 2 adds roughly a
day: `/learn/backlog` 4h, template and roster documents 2h. Phase 3 is not
costed, because it is blocked.

Depends on no other proposal, and entirely on content: one real event and at
least four real `people` entries before a rotation means anything — the same
unblock `docs/STATUS.md` already asks for.
