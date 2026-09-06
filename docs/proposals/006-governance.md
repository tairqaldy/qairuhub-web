---
title: Write the charter and start a decision log
status: draft
area: operations
effort: M
depends_on: []
---

# 006 — Write the charter and start a decision log

| | |
|---|---|
| **Status** | draft |
| **Area** | operations |
| **Effort** | M |
| **Depends on** | — |

## Problem

`/docs` is titled **"How decisions get made."** and its standfirst promises *"Open
by default — if something is not here, it is either not written down yet or we
have said why it is private."* It then renders `EmptyState`, because
`src/content/docs/charter.md` carries `placeholder: true` and is the only file in
the collection. The page that advertises transparency publishes nothing.

The schema meanwhile encodes an organisation nobody has written down.
`src/content.config.ts` defines a `unit` enum of six values — `core`, `qairu-ai`,
`hackathons`, `accelerator`, `education`, `space` — assigns every person to one,
and lets a programme name a `lead`. `src/content/people/` contains one file,
`example-member.md`, flagged placeholder. No document says who appoints a lead,
what a unit may decide alone, or what happens when a lead graduates.

Three specific things have no answer:

1. **Continuity — the bus factor is one, and STATUS.md documents it.** The
   Cloudflare account `aefda65292e1c46cd3d2c93049b66b03`, the domain, the
   Turnstile secret, the D1 database and the repository at
   `github.com/tairqaldy/qairuhub-web` — a personal namespace — are all held by
   one student, who is also a full-time student. The only way to read an
   application is `wrangler d1 execute qairuhub --remote` from a machine logged
   into that account; there is no `/admin`. `migrations/0001_create_submissions.sql`
   stores `name`, `email` and `telegram` for every applicant. When that student
   graduates, other people's contact details and DNS leave with him.
2. **Money.** There is no legal entity. If a company offers to sponsor a
   hackathon, the only account the money can land in is a personal card, in one
   name, with no second signature and no record of what was promised in return.
3. **QAIRU.** `src/lib/site.ts` links `qairu.edu.kz`, and STATUS.md still lists
   "confirm that is the right URL" as an open decision. Whether QairuHub is a
   university body, a recognised club, or a group that meets on campus decides
   who owns the name, who books rooms, and whether the university can close it.

## Prior art

**[Recurse Center — Social Rules](https://www.recurse.com/social-rules)** — four
named rules: no well-actually's, no feigning surprise, no backseat driving, no
subtle -isms. The page states they are lightweight and that you should not be
afraid of breaking one; the expected response is to apologise, reflect, and move
on. *Steal:* the four rules, and the hard separation from the
[code of conduct](https://www.recurse.com/code-of-conduct), which covers abuse,
discrimination and harassment and is enforced by RC faculty — abusive behaviour
means immediate removal, unwelcoming behaviour a warning first. Social rules are
for the everyday; a code of conduct is for the serious. *Leave:* RC has paid
faculty. QairuHub does not, so it must name a person **and** an escalation route
outside the organisation, or the code of conduct is decoration.

**[Debian Constitution](https://www.debian.org/devel/constitution)** — §5.2: the
Project Leader "serves for one year". §5.2(4): if nobody is nominated, the
nomination period extends by a week, "repeatedly if necessary". §4.1(2): amending
the constitution needs a 3:1 majority. *Steal:* a fixed one-year term, a written
rule for the case where nobody stands, and a higher bar to change the charter than
to make an ordinary decision. *Leave:* everything else. Debian has a Project
Secretary (§7.1), a Technical Committee of up to eight (§6.2), and Condorcet vote
counting (§A.5). QairuHub has single digits of active members. A constitution with
more offices than people is a costume.

**[Hack Club — fiscal sponsorship](https://hackclub.com/fiscal-sponsorship) and
[HCB's own public ledger](https://hcb.hackclub.com/hq)** — Hack Club HQ states it
is "100% transparent, including balances, expenses, payroll, donors", and the
page is live. *Steal:* the principle that money gets a **legal home and a public
ledger before it gets a budget**. *Leave:* HCB itself. Its
[eligibility rules](https://help.hcb.hackclub.com/en/articles/15409923-who-can-apply-for-fiscal-sponsorship)
require an organisation "led and primarily run by teenagers (ages 13 to 18)" and
say HCB is "still building out its support for organizations outside the US"; the
fee is 7% of revenue. University students in Astana do not qualify. Do not write
a vendor into a charter.

**[UCL Students' Union — committee handover](https://studentsunionucl.org/how-to/how-to-handover-to-your-new-committee)**
— a written handover covering "details and passwords of all your club/society
social media and email accounts", with the instruction to "change the password to
these accounts as soon as possible", plus key contacts and sponsors, inventory
with prices, upcoming fixtures, and a short report on what went well and what
needs to improve. *Steal:* the artefact and the password rotation, verbatim in
spirit. *Leave:* the union machinery in its
[re-registration process](https://studentsunionucl.org/how-to/clubs-and-societies/committee-handover-and-re-registration)
— core training, risk assessments, finance codes. UCL can gate a room-booking
system on compliance; QairuHub has nothing to gate, so the handover has to be
worth doing on its own.

**[MIT Association of Student Activities — constitution requirements](https://asa.mit.edu/start-group/constitution-requirements)**
— a publicly viewable constitution must state purpose, membership,
non-discrimination, officer duties, "explicit terms of office of your group's
officers that encompass every day of the year", removal processes, amendment
procedure, and a clause agreeing to abide by ASA rules. *Steal:* terms with no
uncovered day, and the governance clause — that clause is exactly the QAIRU
relationship QairuHub has never written. *Leave:* the quorum minutiae and the
membership floor (ASA requires at least 10 MIT students, more than half of them
MIT); a floor QairuHub cannot meet is a rule that dissolves it on paper.

**[Michael Nygard, "Documenting Architecture Decisions" (2011)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html)**
and [adr.github.io](https://adr.github.io/) — Title, Status, Context, Decision,
Consequences; "one or two pages long"; full sentences in paragraphs, because
"(Bullets kill people, even PowerPoint bullets.)" A superseded decision is kept
and marked, not edited. *Steal:* all of it, renamed from "architecture" to just
decisions. *Leave:* [adr-tools](https://github.com/npryce/adr-tools). A content
collection plus a pull request already is the tooling.

**[Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)**
— a four-rung ladder: correction, warning, temporary ban, permanent ban. *Steal:*
the ladder, so nobody improvises a punishment at 23:00 in a Telegram group.
*Leave:* the assumption of a moderation team.

## Proposal

Two artefacts and one rule.

**1. A real charter** at `src/content/docs/charter.md`, roughly 1,200 words,
numbered clauses, published under the DOC archetype (DESIGN §12.4). Thirteen
clauses, no more:

| # | Clause | What it settles |
|---|---|---|
| 1 | Purpose | One paragraph. No adjectives. |
| 2 | Membership | Anyone at QAIRU who turns up is a member; how membership ends. |
| 3 | Units | Which of the six `unit` values have a lead today, what a lead may decide alone, and that the rest are names in a schema. |
| 4 | Roles and terms | One academic year, ending 31 August, no day uncovered (MIT). |
| 5 | Succession | Nomination window, who votes, and what happens if nobody stands (Debian §5.2(4)). |
| 6 | Handover | The required checklist and the 14-day overlap (UCL). |
| 7 | Decisions | Three tiers: just do it · announce it · record it. |
| 8 | Money | Nothing lands in a personal account. In-kind only until clause 8.3's trigger fires. |
| 9 | QAIRU | Recognition status, the name, rooms, what the university may do. |
| 10 | Conduct | Four social rules, plus a code of conduct with a named contact and an external route. |
| 11 | Data | That the forms store `name`, `email`, `telegram`, a JSON payload, country and user-agent and no full IP; who may read `submissions`; how long rows are kept. |
| 12 | Amendment | Two-thirds of active members, 7 days' notice, recorded as a decision. |
| 13 | Dissolution | Where the domain, repository and D1 data go if this stops. |

**Public vs not.** Public: clauses 1–13 as written above. **Not public:** the
credential inventory (the *list of accounts* is public in clause 6; the accounts,
recovery codes and the password-manager vault are not), members' personal contact
details beyond a role address, sponsor terms before signature, any disciplinary
matter concerning a named person, and the contents of `submissions`.

**2. A decision log** — `src/content/decisions/NNNN-slug.md`, rendered at
`/docs/decisions`. Four headings in the body: Context, Decision, Consequences,
and optionally Alternatives. Never edited after acceptance; superseded instead.
A record is **required** only for: changing the charter, adding or closing a unit
or programme, accepting money or a partner, changing who holds an account or
credential, choosing a vendor, publishing a language, changing what the forms
collect, and anything the group argued about for more than one meeting. Everything
else is just done.

**3. The rule that makes it worth it.** Decision `0001` is *"Move the repository
into a GitHub organisation and the Cloudflare account onto a role address."* If
only one thing here ships, it is that one — and it does not wait for any of the
phases below.

## Scope

**Phase 1 — one Markdown file, no code.** `src/content/docs/how-this-works.md`,
`category: process`, roughly 400 words stating only what is true today: which
account holds what, that a submission is read with one `wrangler d1 execute`
command, that content lands by pull request, and who to contact. It needs no
ratification, no schema change and no new route — `/docs/[slug].astro` renders it
as it stands — and it stops `/docs` contradicting itself the day it merges. One
person can write it honestly, which is the point: the charter cannot be.

**Phase 2 — the charter.** The thirteen clauses, plus `revisions`, `ratified` and
`version` in the docs schema, and the §12.4 colophon and revision table, which no
page implements yet. Ship only once three people will ratify it; until then
Phase 1 is the honest artefact.

**Phase 3 — the decision log.** The `decisions` collection, `/docs/decisions` and
`/docs/decisions/[slug]`, seeded with `0001`.

**Phase 4 — print.** The print stylesheet §12.4 mandates; there is no
`@media print` block anywhere in `src/` today.

**Not proposed:** voting software, a members' register, elections held on the
site, a public financial ledger (there is no money), or registering a legal
entity. Clause 8.3 names the trigger for that last one; it has not fired.

## Data and schema

```ts
/* content.config.ts — add to the docs schema, per DESIGN §12.4 */
revisions: z.array(z.object({
  version: z.string(),            // "1.2"
  date: z.coerce.date(),
  change: z.string().max(160),    // "Clause 8 rewritten: in-kind only"
  by: reference('people'),
})).default([]),
ratified: z.coerce.date().optional(),
version: z.string().default('0.1'),

/* new collection */
const decisions = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/decisions' }),
  schema: () => z.object({
    ...base,
    n: z.number().int().positive(),          // 0001 — stable, never reused
    title: z.string().min(3).max(110),       // "Move the repository to an organisation"
    status: z.enum(['proposed', 'accepted', 'rejected', 'superseded']),
    decided: z.coerce.date(),
    decidedBy: z.array(reference('people')).min(1),
    supersedes: reference('decisions').optional(),
    supersededBy: reference('decisions').optional(),
    unit: unit.optional(),
    summary: z.string().min(20).max(260),
  }),
})
```

No D1 migration. No new binding. `getDecisions()` in `src/lib/content.ts`
alongside `getDocs()`, sorted by `n` descending, filtered through the same
`isPublished` guard — and `'decisions'` has to be added to the hand-written
`Collections` union in that file or `getPublished` will not type-check.

## Design

`/docs/[slug].astro` exists but is not the DOC archetype yet: it renders
`PageHeader`, a `Last updated` mono line, `Prose`, and an aside table of contents
built from h2 headings only. The §12.4 clause numbers hanging into the rail, the
version colophon and the revision table are not built, and no doc page uses the
`.change-bar` class that already exists in `src/styles/components.css`. Phase 1
needs none of it. Phase 2 adds the colophon, the revision table, and the cobalt
change-bar (§8.2 item 7) beside any clause amended in the last seven days — the
one editorial use of cobalt on the site, and governance is what it was invented
for.

`/docs/decisions` will hold one entry, so §7.4 applies: under three entries it
renders as READ — a hairline list with a sentence each, no column headers, no
sort. The status token follows §8.2 item 8: `proposed` is actionable now and
therefore `--cobalt-text`; `accepted`, `rejected` and `superseded` are `--ink-3`.
No `.cta-primary` on any of these pages; the page's one cobalt fill goes unspent,
which is correct. A superseded record keeps its page and links forward.

## Risks and trade-offs

**The strongest argument against doing this at all:** it is the wrong file to
write next. All 11 files in `src/content/` carry `placeholder: true` — one
example person, one example event, one placeholder charter. STATUS.md ranks the
charter fourth, behind two or three real people, the next real event and one real
project, and STATUS.md is right. A charter for an organisation with no published
members is fiction with clause numbers, and writing governance is the cheapest
available way for a tired student to feel productive on a Sunday. If there is one
free afternoon, it belongs to `src/content/people/`. Phase 1 exists because it
costs an hour; Phases 2–4 should wait behind real content.

- **The one item worth doing does not need this document.** Moving the repository
  to an organisation and the Cloudflare account to a role address is an afternoon
  of clicking. If this proposal is rejected, do that anyway.
- **Clause 3 is where this turns into a costume.** Six units are already in the
  schema and there are single digits of people. A charter that assigns leads to
  six units nobody staffs is exactly the Debian failure the prior art names.
  Clause 3 should describe the units that have a lead today and say the rest are
  names in a schema.
- **Governance theatre.** Thirteen clauses and one printed page is the ceiling.
  A 3,000-word draft is being written for an imaginary organisation.
- **The log dies at four entries.** Likely, and survivable — four honest records
  beat a mandated cadence. The eight named triggers exist because "record
  important decisions" always resolves to "no".
- **Clause 9 could be false.** Publishing a relationship with QAIRU that the
  university has not confirmed in writing breaks the honesty rule more seriously
  than any invented member count. Ship clause 9 only after someone at QAIRU
  confirms the status; until then it reads "not yet agreed" and says who is
  asking.
- **Naming officers is a privacy decision.** CONTENT.md already rules it: nobody
  is listed without agreeing to be.

## Success

- **The handover test:** a member who is not the founder deploys to production and
  reads a submission without asking him anything. This is the metric that matters,
  and it is pass/fail rather than a number.
- `/docs` renders a real document and stops promising what it does not deliver.
- Four to ten decision records in the first year. Forty means the log is being
  used for things that should just be done; zero means it is dead.
- One handover that used the clause 6 checklist, after which the incoming lead can
  answer "who decides this?" from the charter alone.

**Remove it if:** a year passes in which no decision record is referenced in an
argument and no handover uses the checklist. Then the charter shrinks to clauses
1, 6, 8 and 10 — purpose, handover, money, conduct — and the decision log is
deleted with a final record saying why.

## Effort

**M**, of which Phase 1 is an hour and no code. Phase 2 is a day of writing plus
the colophon and revision table §12.4 requires and no component implements.
Phase 3 is one collection, two routes and a helper — under a day, since
`/docs/[slug].astro` is the template. Phase 4 is half a day of print CSS. The
expensive parts are not engineering: a written answer from QAIRU for clause 9,
and two other people willing to read and ratify the text.
