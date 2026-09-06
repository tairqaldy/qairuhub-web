---
title: Take support without turning the site into a logo wall
status: draft
area: community
effort: M
depends_on: []
---

# 017 — Take support without turning the site into a logo wall

| | |
|---|---|
| **Status** | draft |
| **Area** | community |
| **Effort** | M |
| **Depends on** | Nothing in code. Three things outside it: a written answer from QAIRU on whether a body under its name may take corporate money, someone other than the person holding the Cloudflare account who keeps the receipts, and one event that has actually happened. |

## Problem

`partners` is a validated collection with no page and no caller.
`src/content.config.ts` gives it `name`, `url`, `logo`, `logoAlt`, `kind`
(`university` · `company` · `community` · `sponsor`), `relationship` and
`order`. `src/lib/content.ts` already exports `getPartners()`, which filters
draft and placeholder entries and sorts by `order` then `name`; grep finds no
caller for it anywhere in `src/pages/`. `docs/STATUS.md` lists `/partners` under
"Not built, deliberately". The one file in `src/content/partners/` is
`placeholder: true` and carries a comment warning contributors: *"do not list a
logo we have not been given permission to use."*

So the schema already anticipates sponsorship — `kind` has a `sponsor` value —
and the only thing standing between it and the obvious failure is a comment in a
Markdown file. `logo: image()` is a field that exists, and a field that exists
gets used. The default path from here is a wall of other companies' brand
colours, breaking §7.2 (photography is the site's only colour) and §10.2 (no
`card`) in the same commit.

Money is not hypothetical, and it is small. A six-hour, forty-person build day
costed from
[MLH's own budgeting figures](https://guide.mlh.com/general-information/hackathon-budgeting)
— **"Food: $8-10 per person per meal"** — is one meal for forty at $9, or $360.
With prizes, kit and a few intercity fares it lands near **$760 ≈ ₸347,000**, at
the National Bank of Kazakhstan's official rate of **456.56 ₸/$ on 2026-09-07**.
For calibration, Astana Hub's calendar currently lists the Qostanai Agrotech
Hackathon on 17–18 September with a prize pool of ₸1,000,000 — three times our
entire event. This is an amount a company says yes to casually, and then asks
for something back.

Three questions have no answer today. **Where may a partner's name appear**, on
a site whose only colour is documentary photography? **Whose name is on the bank
account**, when there is no legal entity and the only instrument is a student's
personal card? And **what do we say when a sponsor asks for the attendee list**
— which `migrations/0001_create_submissions.sql` stores as `name`, `email` and
`telegram` for every person who has ever submitted a form?

## Prior art

**MLH —
[Sponsorship Prospectus](https://guide.mlh.com/general-information/getting-sponsorship/sponsorship-prospectus)**
and
[Potential Sponsor Perks](https://guide.mlh.com/general-information/getting-sponsorship/potential-sponsor-perks).
Three tiers — "reasonable, moderate, and expensive" — and one hard number:
**"Your most expensive tier should not be more than 25% of your budget."**
*Steal:* that cap, which is the anti-logo-wall argument expressed as arithmetic
— if nobody funds more than a quarter, nobody owns the event. *Leave:* the
Recruiting perk category, which offers "Resume critiques", a "1:1
Recruiter/Sponsorship Fair", and interviews in dedicated office-style spaces.
That is the mechanism by which a hackathon becomes a hiring funnel, and it is
the thing a company will ask us for first.

**[Django Girls — Find sponsors](https://organize.djangogirls.org/remote_workshops/remote_sponsors/find_sponsor)**.
The rule, stated plainly: **"never give the data of your attendees (names,
emails, etc)"** — and the substitute in the same breath: *"You can send e-mails
to attendees on behalf of the sponsor, but you can't share private information
of people with them."* Sponsorships run 500–1500 EUR, and the
[DSF](https://djangogirls.org/en/organize/event_funding/) gives **$300 per
event, or $500** where a group has "difficulty fundraising or events outside of
the US or Western Europe" — which is us. *Steal:* the data rule, the
mail-on-their-behalf substitute, and the smallness. *Leave:* the logo and the
venue banner.

**[PyLadies — Sponsor Us](https://pyladies.com/sponsor/)** against
[PyLadiesCon 2025](https://2025.conference.pyladies.com/en/sponsors/). One
organisation, two registers. The chapter page has no tiers and no prices at all:
"Email us, indicating how you would like to sponsor Pyladies", then donate
through the PSF. The conference runs six rungs from Champion $10,000 to
Individual $50+, and the difference between them is measured in LinkedIn posts
(6 / 4 / 2 / 1 / 1). *Steal:* the chapter register, and keeping money inside a
parent body rather than a volunteer's account. *Leave:* the ladder, which ranks
supporters by cheque size in public and prices publicity by the post.

**[PyCon US Privacy Notice](https://policies.python.org/us.pycon.org/Privacy-Notice/)**.
The PSF shares name, email, job title, employer and country with a sponsor only
where the attendee "explicitly consented to having this information shared with
those sponsors by permitting them to scan your PyCon US badge", and "You may
review the sponsors who have received your data and report any improper badge
scans via the PyCon US dashboard." *Steal:* the principle that data moves only
by a per-sponsor, auditable act. *Leave:* the scheme — badges, scanners, a
dashboard, and a person to answer a complaint. **We could copy the consent and
not the audit, and consent with no audit trail is not consent.** That is the
argument for refusing outright rather than building an opt-in.

**[Astana Hub](https://astanahub.com/en/service/)**. The state technopark: a
participant tax regime, free access to partner resources, and
[a calendar already running hackathons in Kazakhstani cities](https://astanahub.com/en/event/).
Its member companies are the realistic sponsor pool, and a co-hosted event
borrows a room rather than renting one. *Steal:* the ecosystem and the room.
*Leave:* the grant programmes — startup funding carries reporting obligations
and belongs to a *project*, not to a club.

**[Open Collective](https://documentation.opencollective.com/why-open-collective/pricing)**
and its
[fiscal hosts](https://docs.opencollective.com/help/fiscal-hosts/become-a-fiscal-host).
A host lets a group "accept and disburse money in full transparency, without the
Collectives having to create their own legal entity and bank account" —
precisely our missing piece. Host fees are "typically 4-10%, sometimes higher".
*Steal:* the split — money public, personal details private. *Leave:* the
platform. Hosts are overwhelmingly US and EU, and nothing on either page
suggests one will take a Kazakhstani student club or pay out in tenge. **Do not
name it in any document, or to any company, until a named host has said yes in
writing.**

## Proposal

**Publish the price list. Refuse the ladder.**

**1. Lines, not metals.** A sponsor funds one named cost of one named event.

| Line | What it buys | Cost |
|---|---|---|
| `food` | one meal and water for 40, at MLH's $9/person | $360 ≈ ₸164,000 |
| `prizes` | three non-cash prizes | $200 ≈ ₸91,000 |
| `kit` | power strips, HDMI, markers, printing, first aid | $80 ≈ ₸37,000 |
| `travel` | four intercity fares for participants outside Astana | $120 ≈ ₸55,000 |
| | **whole event** | **$760 ≈ ₸347,000** |

Tenge at 456.56 ₸/$, National Bank of Kazakhstan, 2026-09-07. A figure without a
rate and a date is a lie six months later.

Prizes are non-cash because with no legal entity the only route for cash is a
transfer from one student's personal card to another's, which is
indistinguishable from a gift and leaves no receipt.

**No single sponsor funds more than one line.** Be honest about what that rule
achieves: it is stricter than MLH's 25% cap on three of the four lines and
weaker on one, because `food` is 47% of the budget by itself. So `food` is the
line that gets split between two sponsors or taken in kind. The point is not the
percentage; it is that nobody can buy the whole event and therefore nobody can
name it.

**2. Three deliverables, identical for every line.** Nothing to climb.

1. A row on `/partners`: name, link, what they gave, and one `relationship`
   sentence they have read and approved.
2. One line in the event's write-up naming the cost they covered.
3. If they want to be in the room: **one mentor seat, one judge seat, or a
   40-minute technical workshop**, reviewed like any other session.

**Deliberately not a deliverable: the photo caption.**
`src/components/Plate.astro` renders `caption` and `credit`, and §7.2 fixes what
those say — where the photograph was taken and who took it. Selling a third slot
in it turns the site's provenance line into an ad unit set in mono. A sponsor's
name belongs in prose and in the ledger, where a reader can check it against
something.

**3. Refused, in advance.**

- **Member or attendee contact details — ever, including "only the ones who tick
  a box."** Three reasons, each sufficient on its own. *Consent is
  purpose-bound:* Kazakhstan's Law No. 94-V of 21 May 2013 on Personal Data and
  their Protection limits processing to specific, predetermined purposes, and
  [transfers beyond the stated purpose require separate consent](https://www.dlapiperdataprotection.com/index.html?t=law&c=KZ).
  A student typed an email into `/apply` in order to apply; that is the purpose.
  *Consent is not free here:* the asker is a recruiter standing in a room at the
  student's own university, and a nineteen-year-old who wants an internship
  cannot say no at that table. *There is no audit:* PyCon's opt-in works because
  a student can see who scanned them and complain; we have no dashboard and are
  never going to build one. The substitute is Django Girls': **the sponsor gives
  us a link, we publish it, students go to them.** No address leaves D1.
- **Naming rights** — no "QairuHub, powered by X", no "X AI Fridays", no sponsor
  in a `<title>`, an OG image, or the masthead.
- **Editorial control**, and any claim on what members build.
- **Attendance conditional on anything** — a channel, an app, an account, an
  NDA.
- **Any claim the site cannot verify**, and **money with no named counterparty
  or no invoice.**

The refusal sentence, so nobody drafts one at 23:00:

> We do not share participants' names, emails or Telegram handles with anyone —
> that is a rule we publish, not a negotiation. What we can do is publish your
> role, your link and your open positions on the event page, so anyone
> interested contacts you directly.

**4. In-kind is the default.** The sponsor buys the food and has it delivered.
No account, no transfer, no tax position — and the worst failure mode is a
missing delivery rather than a missing ₸164,000 and an argument about whose card
it was on.

## Scope

**Phase 1 — delete the logo fields.** Two lines out of `src/content.config.ts`,
and the warning comment out of `src/content/partners/example-partner.md` because
it no longer has anything to warn about. This is the whole thesis, it is useful
on its own, and it needs no partner, no page, no permission and no meeting.
Nothing renders `partners` today, so nothing breaks. **Do this first even if the
rest is rejected.**

**Phase 2 — ask QAIRU, in writing.** Before any conversation with any company:
may a body under the university's name take corporate money, and if so through
whose account? Record the answer in `src/content/docs/`. Three outcomes, all
workable: the university receives and spends it; it disclaims it in writing; or
it forbids it and QairuHub is in-kind forever. **Do not start Phase 3 without
this**, because Phase 3 is a page that quotes prices.

**Phase 3 — `/partners/support`.** One READ page: what is needed, what it costs,
what a sponsor gets, what is refused, and who to email. No PDF — one URL, one
document to keep true. The enquiry route already exists: `contactSchema` in
`src/lib/forms.ts` already carries `organisation` and a `topic` enum including
`'partnership'`, so this page links to `/contact` and needs no new endpoint, no
new form, and no migration.

**Phase 4 — `/partners`.** Built when a real relationship exists. Under three
entries it renders as READ (§7.4); at zero it is not built at all.

**Phase 5 — the ledger.** One `src/content/docs/ledger-<event>.md` per sponsored
event: every line in, every line out, receipts held by whoever keeps them. Open
Collective's transparency for the cost of a pull request.

**Not in scope.** Logo rendering. Tier ranking. A sponsor dashboard. An Open
Collective account. Any D1 change at all. `/partners` in the colophon — §10.6
enumerates what the colophon carries, and amending it is a DESIGN.md change.

## Data and schema

`src/content.config.ts`, `partners`. **Remove `logo` and `logoAlt`.** A field
that exists gets used; deleting it is the only enforcement that survives a busy
week.

```ts
- logo: image().optional(),
- logoAlt: z.string().optional(),

+ /** Which costs this partner actually covered. */
+ support: z.array(z.enum([
+   'food', 'prizes', 'kit', 'travel', 'space', 'mentoring', 'compute',
+ ])).min(1),
+ /** True when they bought the thing rather than sending money. */
+ inKind: z.boolean().default(true),
+ /** Which events this paid for. Empty means a standing relationship. */
+ supported: z.array(reference('events')).default([]),
+ since: z.coerce.date(),
+ /** A partner who stopped is listed as past, not deleted. */
+ until: z.coerce.date().optional(),
+ /** The member who owns this relationship. Never rendered on the page. */
+ contact: reference('people').optional(),
+ /** Written permission to publish this name and this sentence. */
+ nameApproved: z.boolean().default(false),
```

`support` lists costs only. Whether it arrived as money or as goods is `inKind`,
because "in-kind" is a mode of giving and "food" is a thing given; an enum that
mixes the two can answer neither question.

`contact` names a student and is never rendered. Publishing which
nineteen-year-old handles a company's money is not a thing the site should do,
and the nobody-is-listed-without-agreeing rule covers the role as much as the
name.

**No `amount` field, deliberately.** Money per partner on a public page is a
ranking. Money per event in a ledger is an account.

`getPartners()` **already exists** in `src/lib/content.ts` — it filters draft
and placeholder entries and sorts by `order` then `name`, and nothing calls it.
It gains one condition and one split: require `nameApproved`, and separate
current from past on `until`. It must never sort by anything money-shaped.

**No D1 work.** `migrations/0001_create_submissions.sql` writes `kind IN (…)` as
a CHECK that SQLite cannot alter — and nothing needs altering. Partnership
enquiries already arrive today as `kind: 'contact'` with `topic: 'partnership'`,
through the existing rate limiting, honeypot and Turnstile.

## Design

**Register.** `/partners` is INDEX → RECORD, collapsing to READ under three
entries (§7.4) and to slips below 768px; `/partners/support` is READ at 68ch.

**Colour.** Zero partner-supplied colour anywhere. The single image on
`/partners` is its PLATE, and its subject is what the support paid for — forty
people eating, not a rectangle of brand blue. Until that photograph exists,
`Plate.astro` renders its honest pending frame at the final size, as every other
index does today.

**Cobalt.** None on `/partners`: a partner is not a state that is actionable now
(§8.2 #8), so the `support` tokens are `m-label` in `--ink-3` on transparent
with a 1px `--rule-strong` border — the inactive chip, never the active one.
`/partners/support` carries the page's one `.cta-primary`, and it is the link to
`/contact`.

**Enforcement.** `tests/e2e/design-law.spec.ts` holds a literal `ROUTES` array.
Adding `'/partners'` and `'/partners/support'` to it is two lines, and it buys
the entire existing suite on both pages: zero `[class*="card"]`, zero
box-shadow, no radius over 6px, exactly one `h1`, `alt` on every image, at most
one `.cta-primary`, at most one `.plate`, no sideways scroll at 375/768/1440,
and every internal link resolving. **One assertion is genuinely new:** zero
elements matching `[class*="logo"]`, in the same shape as the existing card ban.
Do not assert an exact `<img>` count — `Plate.astro` renders no `<img>` until
there is a photograph, and an assertion that fails on an honest empty state
teaches people to delete assertions.

**Empty state.** Zero partners uses the existing `EmptyState` component with no
action, in the same English register `/projects` already uses: *"No partners are
listed yet. When someone supports an event, they are named here with what they
gave."* Not "become our first sponsor" — the ask lives on `/partners/support`,
behind ordinary prose rather than a CTA.

## Risks and trade-offs

**The strongest argument for not doing this at all.** Everything from Phase 3
onward can be replaced by one sentence on `/contact`: *"We take support in kind.
Email us."* That sentence costs nothing, refuses nothing in public, and is the
honest register for an organisation with no published members, no completed
event and no photograph. A price list from a club with no public record is a
stranger asking for money — and a published refusal policy, for offers nobody
has yet made, is a way of sounding consequential before being consequential.
**If Phase 2 comes back slowly, ship the sentence and stop.** The only part of
this that clearly earns its place today is Phase 1, which deletes a field.

**Refusing costs the food.** A company will ask for the attendee list, hear no,
and walk. Make that trade now, in writing, while nobody is hungry and no
volunteer is making it alone with a sponsor on the phone.

**The prospectus rots.** It names a rate, a date and four prices; stamp the date
on it and treat it as expired without one — the tenge figures above are already
wrong if the rate has moved. **A row is a permanent obligation** too, which is
what `until` and a past group are for, borrowed from `people.active`.

**The ledger names people.** Take Open Collective's split: amounts and
counterparties public, contact details and scanned receipts not.

**QAIRU may say yes and then say no**, after a company has been told yes. That
is why Phase 2 sits before any conversation, and why the first sponsored thing
should be in kind, where withdrawing costs a delivery rather than a refund.

**Deleting `logo` will be argued with.** The answer holds because it is already
true of everything else: no page on qairuhub.com renders any logo, including
QAIRU's and our own. The wordmark is CSS (§10.1) — no mark, no SVG, no logo
file.

## Success

- One partner row with a `relationship` sentence the partner would recognise as
  their own, `nameApproved: true`, and a named `contact` who is not the founder.
- One published ledger that balances, checkable by a third person, with no line
  called "miscellaneous".
- Zero `[class*="logo"]` on `/partners`, asserted in CI rather than remembered.
- No sponsor funded more than one line, and the refusal sentence got used once.

**Remove it if:** two years pass with no real partner — `/partners` is deleted,
`/partners/support` shrinks to a paragraph on `/contact`, and the collection
goes with them. Or sooner: if a name is on the page that nobody can show agreed
to be there, it comes down that day.

## Effort

**M**, very unevenly. Phase 1 is fifteen minutes. The `getPartners()` change and
the CI lines are an hour. `/partners` is half a day, reusing the RECORD row.
`/partners/support` is a day, almost all of it writing.

The engineering is the cheap part and always was. The expensive parts are a
written answer from QAIRU, someone keeping receipts who is not the person
holding the Cloudflare account, one event that happened, and one photograph.
None of them is unblocked by code, and starting with the code is how this
becomes a beautifully typeset empty page about money nobody has offered.
