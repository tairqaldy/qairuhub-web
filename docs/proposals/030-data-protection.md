---
title: Handle students' personal data properly
status: draft
area: platform
effort: M
depends_on: []
---

# 030 — Handle students' personal data properly

| | |
|---|---|
| **Status** | draft |
| **Area** | platform |
| **Effort** | M |
| **Depends on** | — |

## Problem

The `submissions` table in D1 holds real people. A membership application
carries a name (≤80 chars), an email (≤160), a Telegram handle (≤40), a year of
study (≤40), a links field (≤300), up to eight interest tags and 1,500
characters on what someone wants to build — under 3 KB at its maximum, usually
well under one. An accelerator application adds a 2,000-character pitch and is
**not** bounded at all: `repo` and `demo` are `z.url().optional().or(z.literal(''))`
with no `.max()`, so a single row can be as long as the request body allows.
Every row also stores `country` from `request.cf` and `user_agent` truncated to
300 characters.

Against that, the site says nothing: no privacy notice, no retention period, no
consent line under any form, and no answer to a student who asks what is held
about them. `pruneRateLimits()` exists in `src/lib/db.ts` and is called from
nowhere — `grep` across `src`, `tests` and `scripts` returns one definition and
no call site — so `rate_limits` grows for the life of the database. Nothing has
ever been deleted from either table.

Two facts the repository currently states about itself are incomplete.

**`rate_limits` is not only IPs.** `src/pages/api/submit/[kind].ts` calls
`checkRateLimit` twice, with `ip:${clientIp}` *and* with
`${kind}:email:${data.email.toLowerCase()}`. `hashBucket()` is an unsalted
SHA-256 hex digest sliced to 32 characters. So the table holds an unsalted hash
of every applicant's email address, and anyone holding it can confirm in **one
guess** whether a given address applied to a given form. Migration `0001`'s
comment — "the table holds nothing identifying" — and `ARCHITECTURE.md`'s "No
address is stored" are both true about IPs and both wrong about this.

**Submissions do not stay in D1.** `notify()` fans every submission out over
`waitUntil` to Resend, the Telegram Bot API and an optional n8n webhook, and the
`fields` array it is handed contains the name, the email, the Telegram handle
and the entire free-text answer. None of those secrets are set yet
(`ARCHITECTURE.md` → Secrets), so nothing leaves today — but the notice must
describe the system as configured, not as half-deployed. Turnstile is a third
call: every submitter's IP reaches Cloudflare's siteverify endpoint.

Kazakhstan's law is not ambiguous about the hardest part of this. DLA Piper's
country note states the rule in one line: *"Personal data should be stored in
databases located in Kazakhstan."* The `qairuhub` database is in Cloudflare's
EEUR region. Cloudflare documents six D1 location hints — `wnam`, `enam`,
`weur`, `eeur`, `apac`, `oc` — and none is in Central Asia; the jurisdiction
parameter that exists for Durable Objects accepts only `eu`, `us` and
`fedramp`. **There is no configuration change that puts this data in
Kazakhstan.** That is the finding, and it should be written down rather than
discovered later.

## Prior art

**[Law of the Republic of Kazakhstan No. 94-V of 21 May 2013, "On personal data
and their protection"](https://adilet.zan.kz/eng/docs/Z1300000094)** (Adilet,
the official legal database). *Steal:* Article 8(4)'s list is a template for a
consent line — it requires the name of the owner and/or operator, the name of
the subject, the term or period of the consent, transfer to third parties,
whether the data crosses the border, and dissemination in publicly available
sources. Article 8(7) gives **fifteen business days** to stop processing after a
withdrawal, or to return a reasoned refusal. *Leave:* the requirement to appoint
a named person responsible for processing, which applies to legal entities;
whether a student club at QAIRU is one is a question for the university, not for
this repository.

*Caveat, and it matters.* `adilet.zan.kz` currently fails TLS verification from
this machine, so the article text above is corroborated from a secondary copy
and from DLA Piper, not read on the official page. The two provisions cited are
the two that could be confirmed twice. **Nothing in this proposal cites an
article number for the localisation duty, and neither should the notice** until
somebody opens the Adilet text and checks. A confidently wrong statute citation
in a public privacy notice is worse than no citation.

**[DLA Piper, Data Protection Laws of the World —
Kazakhstan](https://www.dlapiperdataprotection.com/index.html?t=law&c=KZ)**.
Confirms the localisation rule in plain English and names the Ministry of
Digital Development, Innovations and Aerospace Industry as the regulator.
*Steal:* the framing that cross-border transfer and the storage duty are two
separate obligations, and the correct order of the transfer test — transfer is
permitted where the destination country "ensure[s] protection of personal
data", and consent is one of the routes when it does not. Consent is the
exception, not the rule. *Leave:* the implied comfort. A summary is not advice.

**[GDPR Recital 23](https://gdpr-info.eu/recitals/no-23/), [Article
3(2)](https://gdpr-info.eu/art-3-gdpr/), [Article
13(2)(a)](https://gdpr-info.eu/art-13-gdpr/)**. Recital 23 says that "the mere
accessibility of the controller's, processor's or an intermediary's website in
the Union, of an email address or of other contact details, or the use of a
language generally used in the third country where the controller is
established, is insufficient to ascertain such intention". *Steal:* the honest
conclusion — a site that sells nothing, quotes no currency, claims no European
members and addresses QAIRU students in Astana is not offering services into the
Union, so Article 3(2) is not engaged today even if a Latvian exchange student
applies. Also steal Article 13(2)(a) as the drafting bar: state "the period for
which the personal data will be stored, or if that is not possible, the criteria
used to determine that period". *Leave:* the argument that being in English
settles it. English is a Member State language; Recital 23 rules out *language
of the third country* as a signal, not language as such. The load-bearing facts
are the absence of payment and of EU targeting, not the absence of Russian.
Revisit if the site ever quotes a euro price or says "students across Europe".

**[The GOV.UK privacy notice](https://www.gov.uk/help/privacy-notice)**. Plain
declarative headings — *What data we collect*, *Why we need your data*, *How
long we keep your data*, *Where your data is processed and stored*, *Your
rights* — no preamble, and retention stated as numbers: feedback kept for 2
years, access logs containing an IP deleted after 120 days. *Steal:* the heading
shape and the refusal to settle for "as long as necessary". *Leave:* the
government contact machinery, and the legal-basis section — that is UK-GDPR
furniture we do not need.

**[37signals' policies](https://github.com/basecamp/policies)**, published under
CC BY 4.0. A company keeping its privacy policy in version control, changed by
pull request, readable by a person. *Steal:* the model — the notice belongs in
the repo next to the charter, so a change is a diff someone reviews. *Leave:*
the copy, which describes a SaaS product; and note the repo was **archived in
December 2023** and the live policies moved to a website. The idea outlived the
practice, which is a fair warning about how long a governance file stays
maintained.

**[Cloudflare D1: data
location](https://developers.cloudflare.com/d1/configuration/data-location/)**
and **[Time
Travel](https://developers.cloudflare.com/d1/reference/time-travel/)**. Time
Travel restores the database to a point in time "up to 30 days in the past
(Workers Paid plan) or 7 days (Workers Free plan)", at no extra cost. *Steal:*
the fact — a deleted row is gone from the table immediately and out of the
restore window afterwards. Check which plan this account is on before the notice
states either number, and do not promise an erasure the platform cannot perform.

## Proposal

**One notice, one schedule, one script, and a consent line under every form.**

**1. `src/content/docs/privacy.md`.** The docs collection already renders
`/docs/[slug]` and its schema (`title`, `summary`, `category`, `order`,
`updatedDate`) needs no change; `updatedDate` is already required, so it is the
version marker for free. Headings after GOV.UK: *What we collect*, *Why*, *Where
it is kept*, *Who else sees it*, *How long*, *What you can ask for*, *How to
ask*. One screen, not four.

**2. Say what is collected versus what is convenient.**

| Field | Verdict | Why |
|---|---|---|
| `name`, `email` | needed | there is no reply without them |
| free text (`motivation`, `pitch`, `message`) | needed | it is the thing being judged |
| `telegram` | convenient | optional, and the notice says so |
| `country` | keep | two letters, spam triage |
| `user_agent` | **drop** | 300 characters of fingerprint for a triage job nobody does |

**3. Name the recipients.** "Who else sees it" is the section this site is most
likely to fudge, so it is the one to get right: Cloudflare (hosting, D1,
Turnstile), and — once configured — Resend for the notification email, Telegram
for the notification message, and n8n if the webhook is ever set. Telegram
receiving an applicant's full text is a larger cross-border fact than D1's
region, and the notice says so in the same breath.

**4. A retention schedule with numbers, computable from columns.**

| Kind | Period | Clock |
|---|---|---|
| `rsvp`, `hackathon` | 90 days | `created_at` |
| `contact` | 12 months | `created_at` |
| `membership` | 12 months | `reviewed_at`, else `created_at` |
| `accelerator` | 24 months | `reviewed_at`, else `created_at` — cohorts are annual and teams reapply |
| `rate_limits` | 1 hour | `window_start` (`pruneRateLimits()`'s existing default) |

Every clock is a column, deliberately. An earlier draft of this schedule started
the RSVP clock at *the event date* — which is not in D1 at all. Event dates live
in `src/content/events/`, so a `DELETE … WHERE` could never compute it, and the
sweep would have to load the content collection to find out. Ninety days from
`created_at` is coarser and actually implementable.

Storage is not the reason for any of this — D1 includes 5 GB on both plans, far
more than this table will ever need. The reason is that holding a rejected
application from three years ago serves nobody.

**5. A deletion path a student can actually use.** One instruction in the
notice: write from the address you used, and we answer within fifteen business
days. A public self-serve delete endpoint is rejected deliberately —
unauthenticated delete-by-email is an enumeration oracle and a griefing tool.
Instead `pnpm data:erase <email>` runs the `DELETE`, prints the rows removed and
prints the date the Time Travel window closes, so the reply can be truthful.

**6. Fix the three things the IP hashing did not cover.**

- Make `hashBucket()` an HMAC keyed by a `RATE_LIMIT_PEPPER` secret. Four lines.
  Be honest about what this buys: it does nothing against the maintainer, who
  can read the table anyway. It defends against a leaked copy of the database,
  and it is the difference between "we hashed it" and "the hash means something".
  Rotating the pepper invalidates every bucket, which costs one 10-minute window.
- Call `pruneRateLimits()`. **Not from a cron in `wrangler.jsonc`** — the
  adapter regenerates the deploy config with an empty `triggers` block, so the
  schedule is dropped exactly as routes are, silently. Either prune inline on a
  small fraction of submissions, or — if [029](029-observability.md) lands —
  hang it off that watchdog's cron, which already sweeps its own tables.
- Bound `repo` and `demo` at 300 like `links`, so an accelerator row has a
  maximum size at all.

**7. Consent, not checkbox theatre.** One `m-note` line under the submit button
naming the operator, the data, the purpose, the retention period, the fact that
it is stored on Cloudflare outside Kazakhstan and passed to a notification
service, and a link to the notice — Article 8(4)'s list, in a sentence. Store
`notice_version` on the row from a single constant in `src/lib/site.ts`, with a
unit test asserting it equals `privacy.md`'s `updatedDate`, so the two cannot
drift and the value is never taken from the client.

## Scope

**Phase 1 — the notice and the consent line.** `privacy.md`, the `ConsentLine`
component, a Colophon link, and `insertSubmission` stops passing `userAgent`.
Content and copy only, plus one deleted argument. No migration, no new binding,
no new vendor. This is the whole point and it ships on its own.

**Phase 2 — the code fixes.** The pepper, `pruneRateLimits()` wired up, the
`repo`/`demo` bounds, and the migration that drops the now-unwritten column and
adds `notice_version`.

**Phase 3 — enforce retention.** A scheduled `DELETE` by kind and age, on
029's cron or a dashboard cron, with a unit test over frozen dates.

**Phase 4 — `scripts/erase.mjs`** and a runbook in `ARCHITECTURE.md`.

**Not proposed:** a cookie banner — Cloudflare Web Analytics states "We don't
use any client-side state (like cookies or localStorage) for analytics
purposes"; a DPO; a Kazakh VPS.

## Data and schema

Migration `0003_data_retention.sql`, applied **after** the Phase 1 deploy has
stopped writing the column:

```sql
ALTER TABLE submissions ADD COLUMN notice_version TEXT;
ALTER TABLE submissions DROP COLUMN user_agent;
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at);
```

Two hazards. The ordering is not cosmetic: `insertSubmission` names
`user_agent` in a nine-column `INSERT`, so dropping it before that code ships
breaks every submission on the site. And Cloudflare's D1 SQL reference does not
state whether `ALTER TABLE … DROP COLUMN` is supported — it documents supported
PRAGMAs and says D1 is "compatible with most" of SQLite's SQL, without listing
exclusions. Try it on the local database first; if it is rejected, `UPDATE
submissions SET user_agent = NULL` and leave the column, which achieves the same
thing for a student and costs nothing.

`src/content.config.ts` is untouched. `RATE_LIMIT_PEPPER` joins the secrets
table in `ARCHITECTURE.md`, and the comments in `0001` and in `ARCHITECTURE.md`
that call `rate_limits` non-identifying get corrected in the same commit.

## Design

The notice is a document, so it takes **THE READ** at `/docs/privacy`, under
`06 — Charter`, with `category: 'governance'` and `order: 2`. No new navigation
entry; the Colophon gains one link beside the legal line. Cobalt appears only
where links already are.

Two consequences worth naming. `charter.md` is `placeholder: true`, so `/docs`
renders its empty state in production today — `privacy.md` would be the first
real entry, which lands the index in §7.4's under-three-entries rule and makes it
render as READ, not RECORD. And `/docs/privacy` should join `ROUTES` in
`tests/e2e/design-law.spec.ts`: it will be the first stable non-placeholder
detail page, and no detail route is covered by the 95 assertions today.

The consent line is a `ConsentLine` exported from `form-kit.tsx` and used by
both `ApplyForm.tsx` and `RsvpForm.tsx` — the submit button lives in those, not
in the kit — as a second `m-note` beneath the existing one, never a modal, never
a checkbox. There is no empty state: a privacy notice with nothing in it should
not ship.

## Risks and trade-offs

**The strongest argument for doing nothing at all.** Every entry in
`src/content/` is `placeholder: true` and the site correctly shows empty states;
there is no published event to RSVP to and no cohort to apply for. If
`submissions` is empty or near it, this proposal governs approximately zero
rows, and the better answer is the one at the bottom of this file: take the forms
down until there is something to apply to, and collect nothing. **Count the rows
before starting.** Second: a dated public statement about Kazakh data law,
written by students and reviewed by nobody, is a documented and wrong thing where
silence was merely an absence. Silence is not compliance, but a confident notice
that misdescribes the law is a worse artefact than no notice — which is why this
proposal cites no article number it could not confirm twice, and why the notice
should be read by the university's legal office before it ships.

**The localisation gap does not close.** Cloudflare cannot store this data in
Kazakhstan, and consent to a cross-border *transfer* is not obviously a defence
to a *storage* duty. This proposal does not pretend otherwise. The honest
position: collect the minimum, keep it briefly, say plainly where it is, get
explicit consent to the transfer, and put the open question to the university.
Moving the store to a volunteer-run VPS in Astana would trade a managed database
for an unpatched one — worse for students, better only on paper.

**Truthfulness costs something.** Naming Cloudflare, EEUR, Telegram and "outside
Kazakhstan" may make an applicant hesitate. That is the correct outcome of
telling the truth, and it is the site's rule everywhere else.

**Retention deletes evidence.** A 12-month membership window means a student who
applied 14 months ago and asks "did you get it?" gets an honest "we no longer
hold it". Say so in the notice. Dropping `user_agent` likewise loses a triage
signal nobody has used — both are reversible, neither has been missed.

**It becomes a second thing to translate.** [025](025-localisation.md) routes
`/ru` and `/kk`, and the honesty rule forbids machine translation. A privacy
notice a student cannot read in their own language is the one document where
that gap bites hardest, and this proposal adds to the backlog rather than
clearing it.

## Success

A student can find, in under thirty seconds from any page, what is held about
them, who else sees it, for how long, and how to have it deleted — and every
number there is true. `SELECT COUNT(*) FROM rate_limits` stays small between
sweeps. No row older than its schedule survives a check. If a year passes with
zero deletion requests, the notice still stays: it is not measured by traffic.

**Remove it if** the forms are ever removed and no personal data is collected at
all — which would be the strongest version of this proposal, and is worth
deciding before building the rest.

## Effort

**M**, and lopsided. Phase 1 is a content file, a component and a deleted
argument — an evening, and it is where the value is. Phases 2 and 4 are small
code changes. Phase 3 is the only part with a trap in it (the dropped cron), and
it is documented above. No dependencies, no new vendor, no cost. The unpriced
item is the legal read, which this repository cannot supply.
