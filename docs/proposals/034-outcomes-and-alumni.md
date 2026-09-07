---
title: Record what happens to people after they leave
status: draft
area: growth
effort: M
depends_on: []
---

# 034 — Record what happens to people after they leave

| | |
|---|---|
| **Status** | draft |
| **Area** | growth |
| **Effort** | M |
| **Depends on** | — (related: 030 data protection) |

## Problem

The strongest sentence a community like this can write is "here is what the
people who did this went on to do." QairuHub cannot write it. It started in
2026, nobody has left yet, and the only outcome-shaped machinery on the site is
`active: false` in the people schema, which moves a person into an alumni group
and says nothing about what happened to them.

That is not a gap to fill later. It is the one moment when the rules can be
written cheaply. The first outcome will arrive as a Telegram message — "I got
the internship at X" — and it will arrive at the exact moment the site most
wants to say *our members get hired*. One true fact, published without a
denominator, is a claim about a rate. The site's existing guardrails do not
catch that: the placeholder rule (`docs/CONTENT.md`) stops invented entries, and
the copy law stops invented numbers, but neither stops four true sentences
arranged so a reader infers an untrue pattern. That failure is made of facts, so
nothing in `pnpm check` sees it.

There is also a denominator problem that is destroyed by inaction. If nobody
records who left and when, the number of people the club has ever had is
unrecoverable two years from now — and without it, no honest rate can ever be
published, only a list of the people who answered. The private ledger is the
part that must start in year one; the public page is the part that must not.

## Prior art

**[Recurse Center — FAQ](https://www.recurse.com/faq).** RC states plainly:
"If you want a programming job, either immediately after your batch or many
years later, we can help you find one. If you don't want a job, that's fine
too," and "There's no obligation to work with RC to get a job at any point."
It publishes no placement rate at all. *Steal:* refusing the metric outright
rather than publishing a flattering version of it, and decoupling the programme
from employment as a stated value. *Where it crosses:* the same FAQ explains RC
is funded because "Companies pay to hire RC alumni." The alumni body is the
revenue model, so RC's employer-facing pages are sales assets; publishing no
rate avoids both the lie and the accountability. We have no such excuse and no
such conflict.

**[Y Combinator — startup directory / top companies](https://www.ycombinator.com/topcompanies).**
A ranked directory of the most valuable companies YC funded. *Steal:* nothing
about the format. *Where it crosses:* the list **is** the crossing. It is a
selection of winners presented as evidence about the programme, with no
denominator anywhere near it — the thousands of companies that did not make the
list are not a footnote, they are absent. This is the single pattern QairuHub is
most likely to imitate by accident, because a young club's outcome page is
structurally identical to a top-companies list: only the good news exists yet.

**[42 Network](https://www.42network.org/).** The homepage carries four large
counters — campuses, countries, trained students, active students — which
animate on load and read as "0 +" to anything that does not run their
JavaScript. The largest outcome claim on the page is a third-party ranking
("named world's 3rd most innovative educational institution in 2026", WURI).
*Steal:* nothing. *Where it crosses:* the numbers are ornament — a count-up
animation is a design decision about impressiveness, not a report — and a
ranking is being used where an employment figure would belong. Both moves are
already banned here: `docs/DESIGN.md` §7.4 forbids animated numerals and renders
nothing for a statistic with no verified source.

**[Founders and Coders](https://www.foundersandcoders.com/).** The homepage
names four alumni and where they went — Neo4j, xAI, Kestrix, Sony — with
first-person quotes, and publishes no placement rate, no salary data and no
cohort size. *Steal:* the format, which is the right one for a small
organisation: named, individual, checkable, and in the person's own words rather
than the organisation's. *Where it crosses:* four destinations with no
denominator is a testimonial wall. A reader cannot tell whether those are four
of six or four of two hundred, and the page does not want them to.

**[FTC Endorsement Guides — what people are
asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking).**
US advertising law, not Kazakh law, but the reasoning is the cleanest statement
of the rule: if an advertiser lacks proof that an endorser's experience
"represents what people will generally achieve," the ad "must make clear to the
audience what the generally expected results" are — and a "results not typical"
disclaimer is not enough. *Steal:* the test. If we cannot state what generally
happens, we must not present an individual case as though it stands for
something. *Leave:* the jurisdiction. We adopt this because it is right, not
because it is enforceable in Astana.

**[CIRR — our standards](https://cirr.org/our-standards).** Six standards for
reporting education outcomes, including "Truth in Advertising", "Early Intent
Tracking — student career goals documented day one, verified by auditors to
prevent retrospective manipulation", "Complete Enrollment Data", and
"Independent Verification — annual third-party audits". Members commit to
"reporting 100% of student outcomes. No selective reporting." *Steal:* two
things exactly. Day-one intent capture, which is why the departures ledger below
starts before there is anything to publish; and the 100% rule, which is why a
non-answer is recorded rather than dropped. *Leave:* the audit apparatus. A
third-party audit costs money this club does not have, and the whole standard
assumes paying students in defined cohorts.

**[Graduate Outcomes (HESA)](https://www.graduateoutcomes.ac.uk/about-survey).**
A single standard instrument run 15 months after course completion, by a body
that is not the university being reported on, asking not only what graduates are
doing but whether they find it meaningful. *Steal:* the fixed census point. A
date decided in advance is what stops a number being collected until it looks
good. *Leave:* the machinery — one survey operator for a whole sector is not
available to us, and we will never have a sample where a survey is the right
instrument.

**[MIT — post-graduate and summer
outcomes](https://capd.mit.edu/post-graduateandsummer/).** A careers service
publishing several outcome dashboards. *Where it crosses:* quietly, by omission
— the hub page describes the surveys but surfaces no response rate, no census
timing and no caveats; the methodology is one layer further in than the numbers.
*Steal:* the inverse rule — on this site the denominator sits in the same
viewport as the outcome, never one click away.

## Proposal

**An outcome is a dated, externally checkable change in what a named person
does, published only with live consent, and never aggregated.**

**1. What counts.** Four kinds, nothing else: `internship`, `job`, `study` (a
graduate place, exchange or scholarship), `venture` (a company actually
incorporated or funded). Each needs a person, an organisation, a start date and
evidence. Explicitly not outcomes: a hackathon prize, a certificate, a course
completed, an offer declined, "in talks with", or anything QairuHub itself
awarded. Those are events and projects, and the site already has pages for them.

**2. No causal claim, ever.** The entry records that a person started something
on a date, and separately that the person was a member between two dates. The
site never writes "after QairuHub", "thanks to", or "our members go on to". The
reader is trusted to draw the line, and we keep the one thing we can actually
defend: the facts are true and independently checkable.

**3. Verification before publication.** Two independent signals, both required.
The person confirms it in writing, and one artefact exists outside our control:
an employer or university page naming them, their own public profile, a company
registry entry, or a document shown to a maintainer (shown — not stored, not
photographed). A Telegram message alone is never sufficient, including from a
person we trust. The entry stores who verified it and when, so the check is
attributable rather than assumed.

**4. Consent that expires.** Consent to be listed on `/people` is not consent to
have an employer named. Outcome consent is asked separately, in writing, and
carries `consentUntil`, at most twelve months out. The build drops any entry
whose consent has lapsed, using the same filter mechanism as `placeholder`. The
default is removal; silence takes the entry down. Renewal is one message per
person per year, sent by a human over Telegram — the platform this community
actually lives on — offering three answers: keep, change the wording, remove.
Removal needs no reason and happens on the next deploy. Consent is never
requested by a bot, and never by the person's own programme lead where anyone
else can ask, because that is a power relationship. "No" is not asked twice in
the same year.

The consent request must state one uncomfortable fact: the repository is public,
so a removed entry disappears from the site but remains in git history forever.
Anyone who would not accept that should not be asked to say yes.

**5. Presentation.** Outcomes appear in exactly one place — a section on
`/people`, under the alumni group — as a hairline list in the READ register,
reverse-chronological, never ranked. No employer logos (a logo wall is the
top-companies move performed with images), no photographs of offices, no
homepage placement, no counts. Every rendering carries the denominator in the
same viewport, in the rail as a margin note on desktop and inline below the
heading on mobile:

> 3 of the 41 people who have been members have told us what they did next.
> We do not know about the other 38.

That sentence is the proposal. Everything else is plumbing.

**6. The aggregate rule, written as law.** No percentage, rate, ratio, average,
median, or the words *most*, *many*, *typically*, *usually* may be published
about outcomes until all three hold: the cohort is closed (everyone who stopped
being active before a stated date), it contains at least 30 people, and current
answers exist from at least two thirds of them. Those thresholds are ours, not a
standard borrowed from anyone; they are chosen so the first aggregate is
several years away and boring when it arrives. Even then, any aggregate carries
n, the cohort definition, the census date and the non-response count in the same
sentence. `scripts/check-outcomes.mjs` enforces the prohibition the way
`check-cobalt.mjs` enforces the accent: it scans the rendered outcome routes for
digits followed by `%`, "N of M" constructions and the banned quantifiers, and
fails the build outside one allowlisted block that does not exist yet.

**7. Never borrow QAIRU's numbers.** When the university publishes graduate
employment figures, they describe QAIRU, not QairuHub. Restating them here would
be the most tempting sentence available and the least honest.

## Scope

**Phase 0 — now, with zero outcomes.** The `/people` section head "What people
did next", rendering the standard zero line plus one factual sentence:
*QairuHub started in 2026. Nobody has left yet. When someone does, and agrees to
it, what they did next will be listed here — with the number of people we
asked.* The departures ledger starts. The aggregate rule and
`check-outcomes.mjs` land before there is anything to check.

**Phase 1 — first outcome.** The collection, the render, the denominator note,
the consent text.

**Phase 2 — five or more.** The annual renewal round, run in one sitting.

**Phase 3 — only if the thresholds are met, realistically 2030 or never.** A
cohort report. Phase 3 never happening is a fine outcome, and the section works
without it.

## Data and schema

A new `outcomes` collection in `src/content.config.ts`, not fields on `people`:
one person can have several outcomes, and each carries its own consent clock.

```ts
const outcomes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/outcomes' }),
  schema: () =>
    z.object({
      ...base,
      person: reference('people'),
      kind: z.enum(['internship', 'job', 'study', 'venture']),
      organisation: z.string().min(2).max(80),
      role: z.string().max(80).optional(),        // omitted if they prefer
      started: z.coerce.date(),
      location: z.string().max(60).optional(),
      // Verification — both required before this renders.
      evidence: z.enum(['public-page', 'public-profile', 'registry', 'shown']),
      evidenceUrl: z.url().optional(),            // required unless 'shown'
      verifiedBy: reference('people'),
      verifiedOn: z.coerce.date(),
      // Consent — expires by default; the build drops a lapsed entry.
      consentOn: z.coerce.date(),
      consentUntil: z.coerce.date(),              // ≤ 400 days after consentOn
      consentChannel: z.enum(['telegram', 'email', 'written']),
      // Their words, if they want them. Never written for them.
      quote: z.string().max(240).optional(),
    })
})
```

Two `.refine()` checks carry the rules: `evidenceUrl` is required unless
`evidence === 'shown'`, and `consentUntil` may not exceed `consentOn` by more
than 400 days. `src/lib/content.ts` gains one filter — drop where
`consentUntil < now` — beside the existing `draft` and `placeholder` filters.

Because the site is statically built, an expired consent only disappears on the
next build. A scheduled rebuild is therefore part of this proposal, not an
optimisation: a nightly `schedule:` workflow in GitHub Actions, free on a public
repository, or a Cloudflare Cron Trigger, which the Workers free plan includes.
This is the `stale_after` idea from `docs/DESIGN.md` applied to consent — a
value that expires rather than lies.

One D1 migration for the private ledger, which is never rendered:

```sql
CREATE TABLE departures (
  person   TEXT PRIMARY KEY,   -- slug in src/content/people
  left_on  TEXT NOT NULL,      -- ISO date they stopped being active
  asked_on TEXT,               -- when we last asked what they did next
  answer   TEXT                -- 'outcome' | 'declined' | 'no-answer' | NULL
);
```

Names and dates only, no free text about anyone. It is personal data and falls
under the notice and retention schedule proposed in 030.

## Design

READ register, per §7.4 — with fewer than three entries this is prose, and a
four-row table with column headers would read as broken. Cobalt appears in
exactly one place: the ordinary margin change-bar when an entry was added in the
last seven days. An outcome is not actionable, so it never takes a cobalt state
token, never a fill, never a chip. No PLATE is added; `/people` already has one.
The empty state is the standard `ӘЛІ ЖАРИЯЛАНБАҒАН — NOT YET PUBLISHED` line
plus the one factual sentence above — the sparse state is the design, not a
placeholder for a better one. Organisation names keep their own spelling in
every locale; when `kk` and `ru` ship, an outcome is translated by hand or not
shown, like everything else.

## Risks and trade-offs

The denominator sentence makes this site look weaker than every competitor that
omits one. That is the trade and it should be made with eyes open — we are
choosing to be less persuasive than a page of four logos.

Survivorship runs the other way too: the people who answer are the ones with
good news. Recording `no-answer` in the ledger does not fix the bias, but it
measures it, which is why the denominator line is worded as *we do not know*
rather than *the rest declined*.

Consent expiry means the section can empty out because someone was busy, not
because they withdrew. A reader may misread absence. The denominator line is the
only mitigation, and it is imperfect.

The renewal round is real annual work for a volunteer. If it lapses, consents
expire and the section empties — the correct failure, which will look like
neglect. Asking students to name their employer also carries a real risk to
them: an employer relationship can sour, and a public statement is hard to
unmake once it is in git history.

The honest alternative is to build none of this and let people say what they
want in the Telegram group. That is better than a badly-maintained outcomes
page. If three years pass with fewer than five consented outcomes, delete the
section rather than nurse it.

## Success

Year one: every person who stops being active has a row in `departures` within a
month, and the site still says nothing. By year three: at least five verified
outcomes; every renewal round completed within 30 days of its due date; zero
aggregate claims published; `check-outcomes.mjs` never bypassed; and at least
one person has asked for an entry to be removed and it happened on the next
deploy — because that is the only proof the consent mechanism is real.

Remove this if fewer than five outcomes exist after three years, or if two
renewal rounds are missed.

## Effort

**M.** Phase 0 is a few hours: one section, one sentence, one migration, one
guard script. Phase 1 is roughly half a day for the collection, the filter, the
render and the consent text. The scheduled rebuild is a twenty-line workflow.
Nothing here depends on another proposal, though the consent wording should be
written alongside the privacy notice in 030 so a student reads one account of
what is held about them, not two.
