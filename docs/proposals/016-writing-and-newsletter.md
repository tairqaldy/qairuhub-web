---
title: Publish a monthly round-up that assembles itself
status: draft
area: community
effort: M
depends_on: []
---

# 016 — Publish a monthly round-up that assembles itself

| | |
|---|---|
| **Status** | draft |
| **Area** | community |
| **Effort** | M |
| **Depends on** | 011 (complementary, not required) |

## Problem

`src/pages/blog/` exists and is empty. Someone made the directory and put
nothing in it, which is the state of the whole idea. The `posts` collection in
`src/content.config.ts` is fully specified — `title`, `publishDate`, `author`,
`excerpt`, `cover`, `tags` — and `src/lib/content.ts` exports `getPosts()`,
which grep finds no caller for outside its own module. `src/content/blog/` holds
one file, `example-post.md`, marked `placeholder: true`. There is no feed:
`@astrojs/rss` is absent from `package.json`, and the only syndication in the
project is `@astrojs/sitemap`, which is for crawlers.

Meanwhile `src/pages/about.astro` publishes five values and the second is titled
**"Learn in public"**: *"Every session gets written up. Everything we build is in
the open. If you got stuck, say so — it is the most useful thing you can
publish."* The site states a publishing practice on a page that has no
publishing surface. Proposal 011 addresses half of it (session notes in `learn`,
which does have a page). The other half — the club speaking about itself, at
all, ever — has no home.

One blocking mechanic, stated precisely because it is a trap rather than a
blocker. `posts.author` is a required `reference('people')` and the only file in
`src/content/people/` is `example-member.md` with `placeholder: true`. Astro
fails the build on a reference to a **missing file**, so a typo is caught. A
reference to a **placeholder** file validates fine and is then dropped at render
by `resolveReferences()` in `src/lib/content.ts`, which filters unpublished
targets. So the first post would build green and render with no author. The
first real post is gated on the first real person, and nothing in CI will tell
you that — which is the same content unblock `docs/STATUS.md` already asks for
first.

**Be blunt about what usually happens next.** An organisational blog dies when
every post requires an act of authorship. Someone writes a launch post, two
enthusiastic posts, one apologetic "we've been quiet" post, and then nothing —
and the dead blog is worse than no blog, because a `/blog` whose newest entry is
eleven months old is a dated claim about how alive the organisation is, printed
on the organisation's own site. The failure is not laziness. It is that the unit
of work was "write something" and nobody could schedule that.

## Prior art

**[Recurse Center](https://www.recurse.com/blog)** — ten posts, January 2023 to
April 2026. Eight of them are from 2023; the remaining three are one a year.
That is the exact shape described above, produced by an organisation whose whole
culture is writing. Their formal publication went the same way:
[Code Words](https://codewords.recurse.com/) shows Issue Seven, October 2016, as
its newest. What did *not* die is [Joy of Computing](https://joy.recurse.com/about)
— one link every weekday at 7am ET, submitted by community members, approved
through a review queue before it publishes, with an Atom feed at `/feed.atom`.
**Steal:** the unit is a link and a sentence, contributed rather than
commissioned, and the digest is assembled rather than composed. **Leave:** the
assumption that the org blog is where the writing lives. At RC it is not,
because members write on their own sites; at twenty students in Astana with no
personal blogs yet, the round-up has to *be* the surface.

**[Julia Evans](https://jvns.ca/blog/2023/06/05/some-blogging-myths/)** — eight
myths, three of which are exactly what will stop a QAIRU first-year. On
originality: *"if I found it confusing, lots of other people probably did too"*.
On expertise: *"You actually just need to know 1-2 interesting things that the
reader doesn't"*. On correctness: her strategy is qualifiers — *"My understanding
is.."*, *"I think.."* — in front of anything she is unsure of. **Steal:** all
three, quoted in the writing doc so a first-time contributor reads them before
the first draft. **Leave:** the hedge when the sentence is a fact about us. "I
think about eleven people came" is not a voice choice, it is an invented number
under `docs/CONTENT.md`.

**[This Week in Rust](https://this-week-in-rust.org/)** — issue 667 on 2
September 2026, weekly, produced from a
[public repository](https://github.com/rust-lang/this-week-in-rust) where the
next issue already sits in `drafts/` and a contribution is a pull request
editing a section of it. The README lists current editors and, beside them, an
explicit **Alumni Editors** roll. **Steal:** the artefact exists before the
writing does, contributions arrive as PRs against it (already how content
reaches this site), and leaving the rotation is a documented normal state rather
than a failure. **Leave:** the weekly cadence. 667 issues is the output of ten
people watching a language ecosystem, not four students during exams.

**[Hack Club](https://github.com/hackclub/vip-newsletters)** — 28 numbered
newsletters in the repo, and a README that states the production model without
dressing it up: they are *"written by Christina with final edits from me"*, and
published to GitHub on roughly a six-week delay behind the send. The raw material
comes from [Scrapbook](https://scrapbook.hackclub.com/), where students post
their own work daily for their own reasons, day-counted. **Steal:** one named
writer plus one named editor beats a rotation at this size — a rotation of four
is a rotation of zero when two have midterms — and the digest is assembled from a
stream that exists anyway. **Leave:** the streak counters, and the tiered donor
framing. Our reader is a student deciding whether to walk into a Friday.

**[Increment](https://increment.com/issues/)** (Stripe) — 19 issues, April 2017
to November 2021, paid editors, commissioned writers, a print run, then nothing.
**Steal:** nothing. **Leave:** the belief that budget or seriousness sustains a
publication.

What survives across all five: the post is **assembly**, not composition; the
artefact exists before the writing; the unit is small enough to finish in one
sitting; and the schedule is one a bad month can still meet.

## Proposal

**Two kinds of post, and one of them writes itself.**

**1. The monthly round-up (`kind: 'roundup'`).** Published in the first week of
each month, covering the month before. A human writes exactly two things: the
opening sentence, and one line under `## What we got wrong`. Target **200–400
words**. Everything else is facts already in the repository:

- projects whose file changed, with the `stage` before and after (`prototype →
  launched` is the sentence);
- new files in `src/content/projects/` and `src/content/people/`;
- events whose `starts` fell inside the month, with `room` and `walkIn`;
- `learn` entries published, linked;
- programmes whose `intakeCloses` opened or passed.

If nothing shipped, the round-up says so in one sentence and **is published
anyway** — that rule is the whole proposal. A month with one line is a fact about
the club; a skipped month is where every example above started dying.

**2. Occasional pieces (`kind: 'piece'`).** No quota, no calendar, no assignment.
A piece is published when someone has already written it. Nobody is ever asked to
produce one for a date. This is the part allowed to be empty for a year without
anything being wrong.

**Session write-ups stay in `learn`,** where 011 puts them, and the round-up
links to them. Two collections both meaning "something a member wrote" is how a
site ends up with two half-dead indexes.

**3. The feed carries `learn` too.** `/rss.xml` over `posts` **and** `learn`,
sorted by date. Build-time only, zero bytes against the sub-100KB client budget.
A `<link rel="alternate" type="application/rss+xml">` in `Base.astro`, and the
subscribe link in the colophon's **Elsewhere** list beside GitHub and Telegram.

**4. Email: not yet. Telegram, later, and not by cron.** Recommendation is
**plain RSS for at least two terms**. Priced:

| Option | Cost at our scale | What it actually buys |
|---|---|---|
| **RSS only** | $0, no vendor, no list | Zero consent surface, zero addresses to hold or delete. Almost nobody at QAIRU reads RSS. |
| **[Resend](https://resend.com/pricing) broadcasts** | Free: 3,000 emails/month, 100/day, 1,000 marketing contacts. Marketing Pro $40/mo at 5,000 contacts. | Already the vendor in `src/lib/notify.ts`, so no new vendor to argue for. Risk flagged in 004: the list lives inside a vendor we may leave. |
| **[Buttondown](https://buttondown.com/pricing)** | Free to 100 subscribers, then priced by subscriber count; **RSS-to-email is a +$9/month add-on** | Hosted archives and a good editor. The one feature we would buy it for is the paid one, and it is a `fetch` we could write. |

**Telegram is where QAIRU students actually are**, and 004 is already setting
`TELEGRAM_BOT_TOKEN`. Two corrections to the obvious plan. First,
`TELEGRAM_CHAT_ID` in `src/lib/notify.ts` is the **operator's** alert chat;
posting publicly needs a second chat id and the bot made a channel admin.
Second, **a Cloudflare cron trigger cannot be declared in `wrangler.jsonc`** —
`@astrojs/cloudflare` regenerates the deploy config into
`dist/server/wrangler.json` with an empty `triggers` block and `wrangler deploy`
uses that file (`docs/ARCHITECTURE.md`, and the comment in `wrangler.jsonc`
recording the same behaviour for routes). A scheduled post therefore needs its
own separate Worker, or a human pasting a link once a month. **Paste it by
hand.** A human posting one link twelve times a year is not the bottleneck; a
second Worker is.

Email becomes a question when **25 people have asked** — a number, not a date.

Not proposed: a CMS, an editorial calendar, comments, tag pages, or a filter UI.

## Scope

**Step 1 — `/rss.xml` over `learn` alone.** No schema change, no new page, no
design decision, not gated on a real person, useful the day 011's first note
lands. `@astrojs/rss` plus `sanitize-html`, one route file, one `<link>` in
`Base.astro`, one line in the colophon. Half a day. Ship this before anything
else and the "Learn in public" value has a subscribable surface for the first
time.

**Step 2 — `/blog` and the writing doc.** `posts` schema changes, `/blog` index
and `/blog/[slug]`, the feed widened to both collections, and the contributor
guide as a `docs` entry (`category: 'process'`) at `/docs/writing`. Gated on one
real `people` entry. The pages render the designed empty state until the first
post.

**Step 3 — the generator, after two round-ups have been written by hand.**
`scripts/new-roundup.mjs` and `scripts/check-roundups.mjs` in `pnpm check`. You
cannot automate a format you have not produced twice; building the script first
means specifying an output nobody has read. Two hand-written round-ups is also
the cheapest possible test of whether anyone will do this at all.

**Step 4 — the "Mentioned in" cross-reference** on `/projects/[slug]` and
`/learn/[slug]`, free once `shipped` and `sessions` exist.

**Step 5, only on the 25-ask trigger.** D1 `subscribers`, a double-opt-in confirm
route, Resend broadcast from the same Markdown.

Two hardcoded route lists gain `/blog` at Step 2: `ALL_ROUTES` in
`scripts/shots.mjs` and `ROUTES` in `tests/e2e/design-law.spec.ts`. The existing
"every internal link resolves" test then covers `/rss.xml` for free.

## Data and schema

`src/content.config.ts`, `posts` only, at Step 2:

```ts
kind: z.enum(['roundup', 'piece']).default('piece'),
/** Round-ups only: the month covered, "2026-09". Unique per lang. */
period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
/** Replaces `author`. A round-up is assembled; a piece is written. */
authors: z.array(reference('people')).min(1),
shipped: z.array(reference('projects')).default([]),
sessions: z.array(reference('learn')).default([]),
```

`superRefine`: `period` required when `kind === 'roundup'`, forbidden otherwise.
Delete the redundant `updatedDate` line in `posts` — `base` already declares it
identically. Replacing `author` with `authors` is a breaking schema change that
costs nothing today because one placeholder file uses it; it is not free after
the first real post, so do it now or not at all.

`shipped` and `sessions` are the only reason the reverse cross-reference is free,
and the generator must write them rather than inlining links in the body. The
placeholder trap from the Problem section applies here too: while a project is
still `placeholder: true`, its reference validates and then vanishes at render.
`check-roundups.mjs` should therefore fail on a `shipped` or `sessions` entry
pointing at an unpublished target, and on two round-ups sharing a `period` and
`lang` — the one failure a generated file invites.

`src/lib/content.ts` gains `getRoundups()` and `getPieces()` over the existing
`getPosts()`. **No D1 migration before Step 5.** Step 5 adds
`0003_create_subscribers.sql`: `id`, `email` (unique), `token`, `confirmed_at`,
`unsubscribed_at`, `source`, `created_at`. The list of record stays in D1 and
Resend Audiences is a mirror, so leaving the vendor costs an export, not the
list.

## Design

`/blog` is the INDEX archetype (DESIGN §12.1): eyebrow, `d3` head, one `lead`
sentence, the mandatory PLATE, then RECORD rows — date · kind token · title · one
line of excerpt. Under three entries it renders as READ per the thin-content law
§7.4, which is its state for at least the first term. No filter bar, no pager
until there are more than 24 entries, no tag pages.

**It does not enter the section index.** `NAV` in `src/lib/site.ts` carries
exactly seven items and DESIGN §11 §2 says to measure that row in Kazakh at
1280px before it ships; an eighth item breaks the one measurement the spec
singles out. `Colophon.astro` renders `NAV` directly, so `/blog` is not in the
footer sections list either. It is reached from `/learn`, from `/about` beside
the value that promises it, and — for the feed — from the colophon's separate
**Elsewhere** list. The homepage desk is not an entry point: `Desk.astro`
composes at most four items in a fixed conversion ladder (next session,
applications, latest build, latest note) and a fifth would weaken it.

Cobalt: `/blog` carries **zero** `.cta-primary` — an archive asks nothing of you.
`Subscribe by RSS` is a `.link-action`, never a fill. On `/blog/[slug]` the single
cobalt fill is next Friday's event at the foot. The `roundup` and `piece` tokens
are mono words at `--ink-3`; neither is an actionable state, so neither takes
`--cobalt-text` (§8.2 #8). New posts pick up the 1px change-bar from
`updatedDate` via `isRecentlyChanged()`.

Empty state, via `EmptyState.astro` (`title`, `body`, optional
`actionLabel`/`actionHref`): *"Nothing published yet. The first monthly round-up
goes out at the start of the month after the first session."* Never a skeleton,
never a fake row, never a count of posts.

## Risks and trade-offs

**The strongest case for not doing this: delete `posts` and put round-ups in
`learn`.** `learn` already has an index, a detail page, `authors`, `publishDate`
and a `kind` enum. Adding `'roundup'` to that enum is a one-line change; `/blog`,
the second index, the second empty state, the second thin-content problem and the
schema migration all disappear, and the feed covers one collection instead of
two. What it costs is that `/learn` then mixes "how to do retrieval" with "what
happened in September", which are different reading intents, and the promise on
`/about` still has nowhere of its own to point. That trade is genuinely close.
**If Step 3 has not happened within two terms of Step 2, take this exit** — merge
into `learn` and keep `learn`.

**A one-line round-up published monthly is a public record of a dormant club.**
The generator cannot produce filler; its output is facts or nothing. The real
risk is the inverse — true information that reads as an obituary on a schedule.
**Exit stated up front:** after three consecutive one-line round-ups, stop
publishing and delete the "Learn in public" value from `about.astro`. Editing the
promise down to what is true is the correct move, not padding the archive.

**Full content in the feed is more work than it looks.** Astro's RSS recipe is
explicit that relative image paths and internal relative links are not supported
in the `content` field, and `docs/CONTENT.md` tells contributors to reference
images relatively. Full content therefore costs a URL-rewriting pass on top of
`sanitize-html`. If that pass is not written, ship excerpts and say so — a
half-rewritten feed with broken images is worse than a teaser.

**Dependencies.** `@astrojs/rss` plus `sanitize-html` on an eleven-dependency
project. Both are build-time and neither reaches the client, which is the trade
being accepted.

**The list is a liability, not an asset.** Let's Encrypt's reasons for
[ending expiration emails](https://letsencrypt.org/2025/01/22/ending-expiration-emails/)
— cost, having to retain millions of addresses, and complexity that *"increases
the likelihood of mistakes being made"* — apply at any scale. These are students'
addresses. Step 5 exists so we do not hold them until someone has asked.

**What would make this a bad idea:** if the club's real output is a Telegram
channel people already read, `/blog` is a second place to be quiet. Then ship
Step 1 only and stop.

## Success

Over two terms (about eight months): **eight round-ups, zero skipped**; at least
six published within the first week of the month; median length 200–400 words. At
least two `piece` entries in the first year, at least one by someone other than
the maintainer.

Remove or rewrite this if: three consecutive round-ups are one line (the club,
not the tooling); two consecutive round-ups were written from scratch because the
generator's output did not fit (the generator is wrong); or a round-up runs past
900 words, which is the archive being padded and the same warning sign as the
longest page in a dead wiki.

## Effort

**M**, but front-loaded small. Step 1 is **half a day** — `/rss.xml`, the head
link, the colophon line. Step 2 is about a day and a half: schema and
`superRefine` 2h, `/blog` index and detail 4h, widening the feed 1h, writing doc
and copy 2h, two route lists 30m. Step 3 is a day: `new-roundup.mjs` including
the `git log --since` pass over `src/content/` 5h, `check-roundups.mjs` 2h. Step
4 is 2h. Step 5 is not costed until 25 people ask.

Complementary to **011** — the round-up links session notes, and each is useful
alone. Step 5 depends on **004** for the Resend secrets. Step 2 is blocked in
practice on one real `people` entry, and nothing in CI will tell you so.
