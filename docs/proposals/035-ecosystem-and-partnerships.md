---
title: Position QairuHub inside the Kazakh AI ecosystem
status: draft
area: growth
effort: M
depends_on: []
---

# 035 — Position QairuHub inside the Kazakh AI ecosystem

| | |
|---|---|
| **Status** | draft |
| **Area** | growth |
| **Effort** | M — S for phase 1, M for phase 2 |
| **Depends on** | Nothing. Phase 2 is better with 020 (Open Graph images) shipped |

## Problem

The site names QAIRU exactly three times: the masthead strip link, the colophon
line, and one paragraph on `/about` saying the university provides the room and
the lab access. That paragraph is the single best sentence on the site and it is
also the only one. Everything else about where this community sits is missing.

The surrounding geography is unusually dense and none of it is on the page.
QAIRU is licensed as a university (KZ61LAM00011226, 29 April 2026) at 55/1
Mangilik El Ave. in the EXPO Business Center. Alem.ai — the international AI
centre on the same avenue — publishes a floor plan that includes TUMO Astana,
Tomorrow School, an AI Campus incubator and AI laboratories. Astana Hub, the
national technopark, runs the participant regime that gives its member companies
0% corporate income tax, an events calendar, an education platform, and about
forty topic communities of which the AI and machine learning one is among the
largest. A QairuHub member can walk between all three in an afternoon. A visitor
to qairuhub.com cannot tell that from the site.

Two specific harms follow. First, the site wears the university's name in its
own wordmark and never states the scope of that claim — a reader has to guess
whether QairuHub is a department, an admissions channel, or a club. Second,
`partners` has a schema in `src/content.config.ts` and no page, so there is no
place on the site where a relationship can be recorded even if one existed. The
honest position — one real relationship, publicly stated, and a written rule for
what the site will print about the rest — currently has nowhere to live.

This is not a request for a logo wall. `docs/DESIGN.md` bans the card grid that a
logo wall would need, and `docs/CONTENT.md` bans presenting anything unearned as
real. The two rules already agree. What is missing is the sentence.

## Prior art

- **[Machine Learning at Berkeley](https://ml.studentorg.berkeley.edu/)** — a
  student-run non-profit that names three distinct relationship types on its own
  site: consulting partnerships, industry partnerships and research
  partnerships. **Steal:** naming the *kind* of relationship rather than
  displaying a mark. A reader learns what actually happens. **Do not steal:** the
  paid consulting track. That needs a legal entity, a contract, and someone with
  the standing to refuse scope creep on behalf of students who are not employees.
  QairuHub has none of those.
- **[Recurse Center FAQ](https://www.recurse.com/faq)** — states its funding
  model in public: companies pay to hire alumni, and "This payment never comes
  out of your salary", with no obligation on participants to take part at all.
  **Steal:** disclose the exchange on the public site, and make the member's
  participation opt-in per instance. **Do not steal:** the recruiting-agency
  model itself. Selling access to students is exactly what a volunteer club
  cannot govern.
- **[MLH member events](https://www.mlh.com/event-membership)** — affiliation as
  a written agreement: apply three to four months ahead, interview, follow the
  event guidelines and code of conduct, get a named contact and on-site support
  in return, at no fee. **Steal:** the shape. An affiliation is obligations in
  both directions written down, not a mention. The smaller party's obligation —
  a code of conduct and a clear process — is the one thing QairuHub can already
  offer before it has a track record.
- **[Hack Club clubs](https://hackclub.com/clubs/)** — requires school approval
  as a step in joining, and explicitly lets an existing club keep its own name.
  **Steal:** approval precedes affiliation, and affiliation does not consume
  identity.
- **[Astana Hub](https://astanahub.com/en/)** and its
  [startup page](https://astanahub.com/en/startup/) — the realistic near-term
  relationship is not partnership. It is being listed in someone else's calendar
  and posting in someone else's community channel, both of which are open to any
  member today and cost nothing.
- **[Alem.ai](https://alem.ai/)** and **[QAIRU](https://qairu.edu.kz/en)** — read
  these to see what QairuHub is *not*. QAIRU lists Samsung, Lenovo and Huawei as
  industrial partners and TU Wien, the ETH AI Center and the Shanghai Innovation
  Institute as research collaborators. Those are the university's relationships.
  A page that puts "our ecosystem" one scroll below the QAIRU link invites a
  reader to collapse the two, and that would be a fabricated claim made by layout
  rather than by words.

## Proposal

**One vocabulary, three tiers, and a published rule that a name appears only at
the tier that is literally true.**

- **Parent — QAIRU.** One entity, stated as fact about hosting and permission,
  not endorsement. The sentence to write and get read by a named person at the
  university, before it ships: *QairuHub is run by students at QAIRU. The
  university gives us the room and lab access. It does not run QairuHub, does not
  review what we publish, and is not responsible for it.*
- **Host** — anyone who gave a room, a slot or lab time, named with the date and
  the thing they hosted.
- **Contributor** — a person who ran a session, mentored or reviewed work. A
  named person with consent, not a company mark. The company appears only as that
  person's affiliation, in text.

There is deliberately no fourth tier. **Sponsor does not exist on this site**
until money or goods have actually changed hands, and then it is a line of text
stating what was given, not an image.

**What QairuHub genuinely has to offer, priced honestly.** A room of students who
came voluntarily on a Friday evening. That is an audience for a talk and a place
to run a two-hour hands-on workshop — one engineer, one evening — with a written
note published afterwards under the engineer's name. It is not a hiring pipeline,
and calling it one would be the first lie. Over time the project registry becomes
evidence; today it is near-empty and should be described that way.

**What it refuses,** stated as what the site will and will not print rather than
as demands on anyone: no member lists, CVs or contact details shared with any
organisation; no logo in exchange for a logo; no exclusive claim on the Friday
slot; no unpaid build work framed as a student project (if a company wants
software, that is a job); nothing published about QAIRU that QAIRU has not said
itself; and no listing of an institution as a partner because members attended
its event.

**The asymmetry, and what makes the approach credible anyway.** A club with no
track record approaching a national institution has no leverage and should not
pretend otherwise. Four things make the approach worth answering. First, the ask
is small, specific and dated — a room on 3 October, one engineer for one evening,
one line in a channel — never "let us partner". Second, the risk in saying yes is
reputational, and the way to lower it is to be visibly governed: a public charter,
a code of conduct, a project registry that lists things at their real stage, and
a site that shows empty states rather than invented numbers. That is unusual
among student clubs and is the cheapest credibility available. Third, the one
asset that is genuinely scarce is access to the exact constituency these
institutions exist to produce, and QairuHub is inside the building. Fourth, the
reciprocity is cheap for us and real for them: a written note, attendance numbers
sent afterwards, and the event listed in their format.

**The ask travels on Telegram.** This is Kazakhstan; a partnerships email address
is a dead letterbox. The outreach is a forwardable Telegram message with one
permanent link, not a deck, and the site's organisational contact must offer a
Telegram handle with email as the fallback rather than the reverse. This is also
why the destination page needs a link preview that survives being pasted into a
group chat (proposal 020).

## Scope

**Phase 1 — the sentence, no new route.** Three paragraphs added to `/about`:
what QAIRU is and is not to QairuHub, the three tiers, and the refusals. One real
`partners` entry for QAIRU. Schema fields below. Ship this first; it is most of
the value and costs an afternoon.

**Phase 2 — `/ecosystem`,** built only once there is one entry that is not QAIRU.
An INDEX route holding the register plus the policy as READ body. **Not added to
the navigation** — the section index is seven items and must still fit in Kazakh
at 1280px (DESIGN §11). It is linked from `/about` and `/contact`.

**Phase 3 — structured data.** `Organization` with `parentOrganization` pointing
at QAIRU is the one relationship claim that is true today and machine-readable.

**Not in scope:** a sponsorship tier, a logo grid, a partner enquiry form, and any
page listing institutions QairuHub has only visited.

## Data and schema

`partners` in `src/content.config.ts`:

- add `relation: z.enum(['parent','host','contributor'])` — what they did, as
  distinct from the existing `kind`, which says what they are;
- remove `'sponsor'` from `kind` until the tier exists;
- add `since: z.coerce.date()` and `verifiedOn: z.coerce.date()`;
- add `evidence: z.string().optional()` — a path to the event or note that proves
  the relationship, resolved and validated at build time like other cross-refs;
- `superRefine`: if `logo` is set, `logoPermission: z.string()` becomes required
  and must name who granted it and when.

`verifiedOn` applies the accepted graft from DESIGN §2 — live values expire rather
than lie. An entry unverified for twelve months renders a mono note saying so
instead of a silent stale claim.

No D1 migration and no new bindings. The outreach log — who was contacted, when,
what they said — names people who have not consented to being named and therefore
**stays out of the public repository**.

## Design

The register uses RECORD once there are three entries and READ below that, which
§7.4 already handles: on day one it is a short hairline-separated list with one
sentence each, not a four-row table with headers. The policy text is the page's
real content and it is true on day one, which is what keeps a nearly empty page
from reading as a placeholder.

The no-logo-wall rule is not only an honesty rule here: a grid of marks needs the
card pattern that DESIGN §10.2 bans outright, and every image on the site owes a
caption, an alt text and a credit. Logos fail all three.

One PLATE, mandatory. There is no photograph of a partner session because there
has not been one — so the frame renders the honest "awaiting photography" state,
and the first workshop is the photograph. Cobalt: one `.cta-primary`, the
Telegram contact, plus change-bars in the rail against entries verified in the
last seven days. Empty state on `/ecosystem` before phase 2 does not exist,
because the route does not exist yet.

## Risks and trade-offs

The largest risk is that the university reads the sentence and disagrees with it
— about the hosting, the independence, or the name. Writing it forces that
conversation, which is the point, and the conversation could end with this site
changing its wordmark. That is a real cost and it is still cheaper than
discovering the disagreement after a journalist or an applicant asks.

Publishing a list of refusals from a group with no track record can read as
posturing. The mitigation is register: describe what the site prints, keep it to
a paragraph, and never phrase it as conditions imposed on anyone.

The failure mode worth watching is a club that talks about partnerships instead
of building things. Phasing guards against it — `/ecosystem` does not get built
until there is something other than QAIRU on it.

Finally, refusing recruiter access and unpaid build work will cost relationships.
Some institutions want a channel to students and a metric to report. Saying no
loses those. Accepted: the alternative is a club that quietly sells its members.

## Success

- The QAIRU sentence is live on `/about` and a named person at the university has
  read it.
- Within two terms, at least one `partners` entry that is not QAIRU, each with a
  `since` date and an `evidence` link to the session it refers to.
- One workshop run by an outside contributor, written up in `/learn`, with that
  person named by consent.
- An outreach message is answered within a term without a personal introduction —
  the test of whether the site does any of this work.

**What would tell us to remove it:** the register still holds one entry a year
from now, or `/ecosystem` draws more traffic than `/projects`. Either means the
community is marketing relationships instead of accumulating them, and the
correct response is to delete the page and go build something.

## Effort

**M.** Phase 1 is S — copy, one content file, five schema fields, no route.
Phase 2 is M — one INDEX route reusing existing components plus the register
rendering. Phase 3 is XS. The expensive part is not code: it is the conversation
with QAIRU and the first honest workshop, neither of which a build can supply.
