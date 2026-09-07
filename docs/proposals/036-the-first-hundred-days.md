---
title: Hold three Fridays, then ship six things, and defer the rest for a year
status: draft
area: growth
effort: S
depends_on: []
---

# 036 — Hold three Fridays, then ship six things, and defer the rest for a year

| | |
|---|---|
| **Status** | draft |
| **Area** | growth |
| **Effort** | S — this proposal builds nothing. It spends an afternoon deciding, and an hour a term re-deciding. |
| **Depends on** | Nothing. Everything else depends on it. |

## Problem

There are thirty-five proposals here. Twelve were on disk when this was written
— 019 through 030 — tagged five `S`, six `M`, one `L`. Those tags are
engineer-hours. In the only currency this project has, a student with maybe
three free hours a week in term, two of which go on preparing the session
itself, they are roughly twenty weeks. That is a third of the corpus, written in
a register — measured, sourced, sure of itself — that makes every item look like
a week's work.

That is how a proposal directory becomes a monument to what did not get done.
Few of them are wrong. 024 found a favicon that is a PNG with the wrong
extension served under `nosniff`. 030 found real students' names, emails and
Telegram handles in D1 with no privacy notice on the site. 022 found a
`prefers-reduced-motion` block that does not do what §9.5 says. All true, all
worth fixing.

The failure is that none of the thirty-five touches the fact underneath them:
`src/content/` holds eleven files and all eleven are `placeholder: true`. The
site is finished and empty. `docs/STATUS.md` says so under "What the site needs
from you", and every proposal since has assumed somebody else would handle it.

So the question is not "which proposal first". It is that a community which has
not held its sessions has no website bottleneck. It has a room-booking
bottleneck, a who-shows-up bottleneck, and a nobody-has-agreed-to-be-
photographed-yet bottleneck. The site is downstream of all three, and every hour
spent on it before the first Friday makes a truthful empty page marginally
prettier.

**On completeness:** twelve of thirty-five were readable. 013 (a projects
registry with facets), 015 (notes) and 017 (a sponsor deck) are known only from
citations inside those twelve. The rule below applies to any proposal, filed or
not; re-run the named sequence when the rest land.

## Prior art

**[Shape Up, ch. 7 "Bets, Not Backlogs"](https://basecamp.com/shapeup/2.2-chapter-08)**
(Basecamp, free online). Its two headings are the whole argument: **"No
backlogs"** and **"Important ideas come back"**. Nothing is committed until it is
bet for one cycle; the rest is writing, not a queue. *Steal:* re-read this
directory once a term and bet the next cycle. *Leave:* six-week cycles and a
shaping team — a volunteer's cycle is a semester, and the shaping already
happened here.

**[PEP 1](https://peps.python.org/pep-0001/)** (Python). On `Rejected`: *"Perhaps
after all is said and done it was not a good idea. It is still important to have
a record of this fact."* `Deferred` means stalled, not bad. *Steal:* both
statuses as defined, and the "Rejected Ideas" habit — a recorded no stops the
same idea arriving as proposal 041. *Leave:* the PEP editor role; there is one
maintainer.

**[Rust RFCs](https://github.com/rust-lang/rfcs)**. Separates closed-as-
*postponed* from closed-as-*rejected*: postponed means *"we want neither to think
about evaluating the proposal nor about implementing the described feature until
some time in the future"* — would we ever consider it? Yes. *Steal:* the
distinction, and writing the re-open trigger down. *Leave:* the FCP machinery.

**[GOV.UK Design Principles](https://www.gov.uk/guidance/government-design-principles)**.
Principle 2 is "Do less"; principle 8 is **"Build digital services, not
websites"** — the sentence this proposal applies. *Steal:* both. *Leave:* the
assumption behind principle 5's iterate-on-evidence, which presumes users on day
one. There are none yet, so ordering has to come from dependency rather than
data.

**[Paul Graham, "Do Things that Don't Scale"](https://paulgraham.com/ds.html)**:
*"You can't wait for users to come to you. You have to go out and get them."*
The mechanism is identical here — the first twenty members are recruited one at
a time, in person and in the Telegram group, by someone who knows them. *Steal:*
recruitment beats product. *Leave:* the growth framing; this is not trying to
grow fast.

**[Astana Hub](https://astanahub.com/en/)**, the national technopark: 1,800+
participant companies, 40+ community groups, its AI group reporting roughly
12,000 followers. *Steal:* the audience already congregates in chat-first
Kazakhstani tech communities, so one link posted into one of those beats every
SEO item in this directory. *Leave:* the numbers page — QairuHub has no numbers
and must not imply otherwise.

## Proposal

**One bet at a time, and the bet for the first hundred days is that Fridays
happen.** Three rules and a budget.

**Rule 1 — the website is never the blocker for a session.** Friday beats
shipping, every time, without guilt.

**Rule 2 — nothing ships that advertises something that has not happened.**
Already the site's law (`docs/CONTENT.md`), and also a scheduling rule: share
cards before real pages produce a beautiful card for an empty index, and Telegram
caches a preview per URL indefinitely (020), so that mistake is permanent in
someone's chat history.

**Rule 3 — every proposal gets a status this week.** `accepted` for the six
below, `deferred` with a written trigger, or `rejected` with a reason.

**The budget.** Fourteen weeks × ~2 hours of website work ≈ **28 hours**, and two
of those weeks are exam weeks worth zero. Everything is priced against that, not
against an unencumbered engineer's afternoon.

### The six, in order

| # | Weeks | Item | Why here |
|---|---|---|---|
| 1 | 1–2 | **030 Phase 1** — privacy notice, consent line on every form, `pruneRateLimits()` wired up, `user_agent` dropped | The only item that is *wrong* today rather than missing: the form is live and collecting personal data with no notice. ~4h |
| 2 | 2–3 | **024 Phase 1** — six icon files, the manifest, delete the Astro logo | Defect repair, ships alone, unblocks 020 and 023. ~4h |
| 3 | 4–7 | **019 Phase 1** — consent first, then three real plates on `/`, `/events`, `/about` | The largest change to what the site *is*. Cannot start before a Friday has happened. ~8h |
| 4 | 6–8 | **Real content** — two or three consented people, the next event, the charter | Mostly other people's time. Turns off the empty states. ~4h |
| 5 | 9–11 | **020 Phase 1** — one card template, twelve routes | Strictly after 3 and 4. Makes a Telegram link look like an institution. ~5h |
| 6 | 12–14 | **029 Phase 1** — result codes, `/api/health`, two UptimeRobot monitors | Last, because it protects the applications that 3–5 start producing. ~4h |

≈29 hours. That is the hundred days. **There is no seventh item.**

Two things run in parallel at zero engineering cost, starting week 1: recruit a
native Kazakh writer at the Fridays (025 is dead without one), and settle the
open decisions in `docs/STATUS.md` — the real GitHub and Telegram handles in
`src/lib/site.ts`, the QAIRU URL, and 024's Қайру/Кайру question, which 025 will
otherwise answer three different ways.

### Dependency graph

```
first Friday held ──┬──> 019 photographs ──┬──> 020 share cards ──> 023 A3 poster
                    ├──> real content ─────┘                            ^
                    │        └──> 013 registry · 015 notes · 026 search  │
                    │             (all need volume that does not exist)  │
                    └──> Kazakh writer found ──> 025 ──> 026 kk index    │
                                                                         │
unblocked today: 030 P1 · 024 P1 ─────────────────────────────────────────┘
                 029 P1 · 027 · 022 P1 · 028 P1 · 021 Step 1
```

Everything right of an arrow is next year. The six come from the unblocked row
plus the two the first Friday unlocks.

### Deferred for a year, with re-open triggers

| Item | Re-open when |
|---|---|
| **025** Phases 2–4 (Kazakh, Russian, default flip) | A named native speaker has agreed to write and proof eight routes. |
| **026** search | 40 published non-placeholder entries exist. At eleven placeholders it searches nothing. |
| **013** facets, **015** notes index | Ten real projects / ten real notes. |
| **020** Phase 2 | The first non-placeholder detail page of that collection ships — its own rule. |
| **021** Step 2, **022** Phases 2–3, **027** steps 2–4, **028** Phases 2–3, **029** Phases 2–3 | Later phases are second gates stacked on gates. Their Phase 1s are cheap enough for a spare evening. |
| **023** the A3 poster | 019 and 024 both done. Genuinely valuable — a noticeboard beats a domain for finding a club — but it needs a photograph and a wordmark file. |
| `/blog`, `/partners`, `/admin` | Already deferred in STATUS.md for the right reasons. |

### Rejected outright, with reasons

Mark these `rejected` in their own files rather than silently skipping them.

1. **Runtime-rendered OG images** (020 Phase 3). Needs Workers Paid; the static
   version is indistinguishable to a reader. Rejected on cost.
2. **Sentry, Logpush, Tail Workers, RUM, session replay** (029). These are
   students' membership applications. Rejected on principle, not budget, so a
   future free tier does not reopen it.
3. **A component library, `/dev/kitchen-sink`, a generated `COMPONENTS.md`**
   (021). Each is a second artefact to keep in sync with the first.
4. **A round sticker or any logo mark file** (023, 024). A 50 mm disc with the
   wordmark in it is an emblem; this identity is typographic.
5. **Machine translation of anything, ever.** Already law — recorded here so
   deferring 025 is never mistaken for permission to ship a machine Kazakh page.
6. **Any stats module, member counter or outcomes figure** before the numbers are
   real, including "50+ members" on a poster. This is the constraint that makes
   everything else on the site credible.
7. **A hundred-day plan that assumes the Fridays happen** — including this one.
   See Success.

## Scope

No code. A status edit on every other file here, the six-item table pasted into
`docs/STATUS.md`, and a re-read once a term. If this proposal grows a Phase 2,
it has failed.

## Data and schema

None. The only schema changes in the first hundred days belong to 019 (caption
and credit fields, the `plates` collection) and 030 (migration `0003`), and stay
owned by those proposals.

## Design

Nothing renders. One ordering constraint is nonetheless a design one and worth
stating: `docs/DESIGN.md` §3.4 says the PLATE is not optional, so 019 outranks
every other design proposal by the site's own law — including the ones that are
more fun to build.

## Risks and trade-offs

1. **The plan becomes a schedule for a fiction.** Mitigation, and it is real: **if
   no session has been held by day 30, stop all website work.** Not
   reprioritise — stop. The right answer to an empty room is not a better
   favicon.
2. **Dependency order is not enthusiasm order.** Asking classmates to sign a
   photo consent is harder and less rewarding than cutting six icon files, and
   this puts the consent first. A maintainer who follows it has a worse month
   than one who does not, and might quit. That trade may be wrong.
3. **These rejections might be wrong.** Use the Rust distinction: rejection is
   for ideas the answer is no to at any size; deferral carries a trigger.
   Anything here can be reopened by a proposal that argues with the recorded
   reason — that is what `superseded` is for.
4. **An order looks like a commitment.** It is one person's reading of
   thirty-five documents, twelve of which they could actually read. A new lead
   should disagree with it in writing.

## Success

At day 100, assessed honestly:

- **Three AI Fridays have happened.** The only item that is not optional.
- `placeholder: true` appears in fewer than eleven files. It is eleven of eleven
  today.
- At least three real photographs are live, with captions, credits and consent
  recorded.
- A privacy notice exists and every form links to it.
- Zero invented people, numbers or outcomes. Unchanged, and permanent.

**The failure signal, to be checked for deliberately:** five proposals marked
done and `placeholder: true` still on eleven files. That means the site got
better and the community did not happen — precisely what this exists to prevent.

**What would tell us to delete this:** a second lead writing a better ordering
and marking this one `superseded`. That is a good outcome. The directory reaching
fifty proposals would not be — it would make this more necessary, not less.

## Effort

**S.** An afternoon to set thirty-five statuses, then an hour at the start of
each term to re-bet. The six accepted items total roughly 29 hours over fourteen
weeks, which is the real budget of one student volunteer in term — and the number
every future proposal should be priced against.
