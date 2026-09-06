---
title: Send the email we already owe people
status: draft
area: operations
effort: M
depends_on: []
---

# 004 — Send the email we already owe people

| | |
|---|---|
| **Status** | draft |
| **Area** | operations |
| **Effort** | M |
| **Depends on** | none for Phases 0–2; Phase 3 onward wants 001 and 002 |

## Problem

Five form kinds write to `submissions` in D1 and nothing else happens.
`notify()` fires on every insert and returns `not configured` on all three
channels (`src/lib/notify.ts`), because `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`,
`NOTIFY_EMAIL_TO`, `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` have never been
set. The operator learns an application exists by running `wrangler d1 execute
qairuhub --remote --command "SELECT ..."` on a laptop.

The site makes a promise it cannot currently keep. `ApplyForm.tsx` tells the
applicant *"We read applications weekly and reply either way"*, and its step
list says *"We read it. Every application gets a human reply."* Nothing sends
that reply and nothing reminds anyone it is owed.

The applicant also leaves with nothing to hold. DESIGN §12.3 specifies a receipt
carrying a reference number; `POST /api/submit/[kind]` does return
`{ ok: true, id }`, but `form-kit.tsx` sets `{ status: 'success', errors: {} }`
and throws the id away. The success screen shows a title, a paragraph and three
steps — no reference, no date, nothing to search an inbox for.

RSVPs are worse. `countForEvent()` exists in `src/lib/db.ts` and is called by
nothing; `/events/[slug]` is prerendered and deliberately prints `Room holds 30
people` rather than a live count. An RSVP cannot be withdrawn —
`idx_submissions_unique` makes it one-shot per person per event — and cannot be
reminded. If a session moves or is cancelled, the only channel is the Telegram
group, and the people who RSVP'd are exactly the people who may not be in it.

An index that says "not yet published" is a designed empty state. A form that
accepts an application and then goes silent is a broken promise wearing one.

## Prior art

**[GOV.UK service manual — sending emails and text messages](https://www.gov.uk/service-manual/design/sending-emails-and-text-messages)**
splits messages into *transactional* ("relate directly to something a user has
done" — "You don't need to ask permission") and *subscription* ("Never send
subscription messages unless the user has explicitly asked for them"), and says
get the most important information into the first sentence so it appears in the
preview. **Steal:** the two-class model, which is the whole consent test here;
the first-sentence rule. **Leave:** the letter and SMS apparatus, and GOV.UK
Notify itself — UK public sector only.

**[Recurse Center — Applying to RC](https://www.recurse.com/apply)** publishes
its four stages before you apply, so an acknowledgement only has to repeat what
the page already said. **Steal:** the received-email restates published steps
and invents no date. **Leave:** the interview machinery; we have one reviewer.

**[Django Girls organiser manual — communication](https://organize.djangogirls.org/application_form/communication.html)**
auto-confirms every application ("they will receive an automatic confirmation to
their email address with a copy of their responses") and puts *two* links in the
acceptance email — `[rsvp-url-yes]` and `[rsvp-url-no]` — logging which one was
clicked, so the waiting list moves when someone declines. **Steal:** the
two-link confirm; it is what makes a capacity number true. Their
[organiser rejection template](https://github.com/DjangoGirls/djangogirls/blob/main/templates/emails/organize/rejection.html)
(for workshop proposals, not applicants) shows the other half: rejection copy
written once, reviewed in public, reused. **Leave:** the tone, warmer and more
exclamatory than this site's voice, and their bulk mailer.

**[Postmark — Message Streams](https://postmarkapp.com/message-streams)**: "we
have created a separate, but parallel, infrastructure for these two types of
email", so "transactional and broadcast traffic do not mix … including IP
ranges". **Steal:** the principle — the digest must never share reputation with
the receipt, which here means a second verified subdomain. **Leave:** Postmark
itself: a new vendor and a new bill, and Resend is already wired into
`notify.ts`.

**[Let's Encrypt — ending expiration notification emails](https://letsencrypt.org/2025/01/22/ending-expiration-emails/)**
deleted a popular feature and published the reasons: cost, that it "means that
we have to retain millions of email addresses", and complexity that "increases
the likelihood of mistakes being made". **Steal:** those three criteria as the
retirement test in **Success**.

**[Google's sender guidelines](https://support.google.com/a/answer/14229414)**:
keep spam complaints "below 0.1%" and never at "0.3% or higher"; SPF, DKIM and
DMARC required; one-click unsubscribe per
[RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058) "required only for
marketing and promotional messages". **Read the threshold honestly:** those
rules bind senders of 5,000+ messages a day. QairuHub will send perhaps 30 a
week, so nothing here is compliance — authentication is what gets a first-ever
message from an unknown subdomain into a Gmail inbox at all. **Leave:**
[Resend's advice](https://resend.com/blog/gmail-and-yahoo-bulk-sending-requirements-for-2024)
to get the unsubscribe headers "automatically when using Resend Broadcasts" —
that puts the subscriber list inside a vendor we may leave.

## Proposal

Six messages. Nothing else is ever sent.

| # | Message | Trigger | Class | Consent | Unsubscribe |
|---|---|---|---|---|---|
| 1 | Application received | successful `INSERT`, kinds `membership` / `accelerator` / `hackathon` / `rsvp` | transactional | none needed | none; real `Reply-To` |
| 2 | Decision | operator sets `submissions.status` to `accepted` / `declined` | transactional | none needed | none |
| 3 | Event reminder | cron, ~24h before `events.starts`, to that event's RSVPs | transactional | implied by the RSVP | link cancels the RSVP |
| 4 | Event changed or cancelled | operator, after the content PR merges | transactional, **unconditional** | none needed | none — and we say why |
| 5 | Post-event follow-up | cron, one message, the day after | transactional-adjacent | implied by the RSVP | one-click |
| 6 | Term digest | operator writes it; 3–4 a year | **marketing** | explicit opt-in, confirmed | one-click, RFC 8058 |

Only #6 requires a subscriber list.

**All six are `text/plain`, no HTML part.** The design system does not survive
email: no font API, no OKLCH, no reliable dark-mode inversion, and hairlines
become table borders — border + padding as a grouping device, which DESIGN §16
bans by name. Note this replaces the inline-styled HTML table currently built in
`sendEmail()`, which is an operator notification and was never seen by a
student.

**Copy.** `{}` are substitutions; a line whose substitution is missing is
deleted, never filled with a guess.

```
1 — Subject: We have your membership application

Hi {name},

Your application arrived {date} at {time}, Astana time.
Reference: {id8}

What happens next
01  A person reads it. Every one gets read.
02  If we want to talk, we write to this address.
03  You hear back either way.

We are students and we do this in the evenings, so this takes days,
not hours. If two weeks pass and you have heard nothing, reply here
and ask.

You do not need an application for Friday. The next AI Friday is
{date}, {time}, {room}. Walk in.

— QairuHub · QAIRU, Astana · qairuhub.com
Reply to this email and a person reads it.
```

```
2a — Subject: You're in — QairuHub {programme}

Hi {name},

You're in.

01  First session: {date}, {time}, {room}.
02  Group: {link}
03  Bring a laptop. Nothing else.

If you cannot make the start, reply and say so. It is not a problem,
but we need to know.

— {reviewer}
```

```
2b — Subject: About your QairuHub application

Hi {name},

We are not taking you into {programme} this intake.
{one sentence written by the reviewer, about this application}

Open to you right now, with no application:
—  AI Fridays, every Friday, {room}. Walk in.
—  The next intake opens {date}. Apply again — this does not count
    against you.
—  Everything we teach: qairuhub.com/learn

— {reviewer}
```

```
3 — Subject: Tomorrow: {title}, {time}, {room}

{title}
{weekday} {date}, {start}–{end}
{location}, {room}

{event.summary}

You said you would come. If you cannot, cancel here so someone else
can have the seat: {cancel_url}

— QairuHub
```

`{cancel_url}` is the point of message 3. It is the only way an RSVP can be
withdrawn — today `idx_submissions_unique` makes one permanent.

```
4 — Subject: Cancelled: {title}, {date}

{title} on {date} is cancelled.
Why: {reason, one sentence, written by a person}

{if moved} It now runs {new_date}, {new_time}, {new_room}. Your place
carries over. Nothing to do.
{else} The next session is {date}: {title}.

You are getting this even if you unsubscribed from everything else,
because otherwise you would walk to a locked room.

— QairuHub
```

```
5 — Subject: {title} — notes and what's next

{title} ran on {date}. The notes are up, whether or not you made it.

Notes: {link}
{Recording: {link}}

If you were there: one question, and one line is a real answer.
What would have made that session more useful?

Next: {date}, {title}. Same room.

— QairuHub
You RSVP'd to {title}. Stop these: {unsubscribe_url}
```

**Message 5 must not say "thanks for coming".** Nothing records attendance —
there is no attendance table and no check-in — so this goes to the RSVP list,
which includes everyone who said they would come and did not. Thanking them for
attending is exactly the kind of invented fact CONTENT.md forbids. Rewrite this
message, or delete it, if proposal 008 ever lands real attendance data.

```
6 — Subject: QairuHub, {term} {year}

Since {month}:
—  {project} shipped, by {names}: {link}
—  {n} AI Fridays. Notes: {link}
—  {intake} closes {date}: {link}

That is the whole message. When there is nothing to report we do not
send one.

— QairuHub
You subscribed {date} at qairuhub.com. Unsubscribe: {unsubscribe_url}
```

Messages 5 and 6 carry:

```
List-Unsubscribe: <https://qairuhub.com/api/unsubscribe?t={token}>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

RFC 8058 does not specify a response code; answering `200` and writing the row
is our choice. `GET` renders the `/unsubscribe` page. **Open and click tracking
are disabled on every send** — a pixel is surveillance of students, and an
unbranded click-tracking domain hurts deliverability rather than helping it.

### Deliverability

Verified against public DNS on 2026-09-06:

| Name | Type | Current value |
|---|---|---|
| `qairuhub.com` | TXT | `v=spf1 include:spf.efwd.registrar-servers.com ~all` |
| `qairuhub.com` | MX | `eforward1–5.registrar-servers.com` (10/10/10/15/20) |
| `_dmarc.qairuhub.com` | TXT | **does not exist** |
| `mail.qairuhub.com` | — | **does not exist** |

**The apex TXT and MX records are never touched.** A domain may hold exactly
one SPF policy; adding a second `v=spf1` record at the apex is a permanent error
that silently breaks Namecheap forwarding for the whole domain — the same
records ARCHITECTURE.md says to leave alone. Every Resend record goes on a new
subdomain, which is
[Resend's own instruction](https://resend.com/docs/dashboard/domains/cloudflare)
("best practice to use a subdomain … instead of the root domain"). Their example
names the record `send` in `us-east-1`; the label is arbitrary and the region is
fixed when the domain is created:

| Name | Type | Value | Proxy |
|---|---|---|---|
| `mail` | MX | `feedback-smtp.eu-west-1.amazonses.com`, priority 10 | DNS only |
| `mail` | TXT | `v=spf1 include:amazonses.com ~all` | — |
| `resend._domainkey.mail` | TXT | the key from the dashboard | DNS only |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@qairuhub.com; fo=1` | — |

`_dmarc` is the one record here that is **not** scoped to the subdomain: it
applies to `@qairuhub.com` as well. At `p=none` that is monitoring only and
harmless, which is exactly why it starts there.

Pick **eu-west-1** before verifying: the region is baked into the MX value and
changing it later means re-verifying. `From: QairuHub <hello@mail.qairuhub.com>`
(Resend permits a `From` only on the verified domain), `Reply-To:
hello@qairuhub.com` — which the Namecheap forwarders already deliver to a human
inbox. Confirm both that forward and a `dmarc@` alias exist before publishing
the records; a `Reply-To` that bounces is worse than none, and `rua` reports
sent to a dead address are the same as not collecting them.

DMARC starts at `p=none` while `rua` reports are read.
[Resend](https://resend.com/docs/dashboard/domains/dmarc) recommends "starting
with a policy of `p=none;` before moving to a stricter policy" and sets no
duration; 30 days is our number, not theirs. Before `p=quarantine`, check
whether anyone sends *as* `@qairuhub.com` from Gmail through the forwarder —
that mail would start failing.

Free tier: 3,000 emails a month, **100 a day**, 3 verified domains. At this
organisation's size — a few applications a week, thirty RSVPs at a busy Friday —
none of those bind. The one day they could is a hackathon: a 100-person RSVP
list reminded and followed up on consecutive days. If that day arrives, spread
the send or pay $20 for that month. Three domains is enough to buy the Postmark
stream split for nothing: if message 6 ever draws a complaint, verify
`news.qairuhub.com` and move *the digest* there, never the receipts.

### `waitUntil`, retries, and duplicates

`ctx.waitUntil` extends the invocation (~30s) but **never retries**. If the
Resend call fails, or the isolate is evicted, the email is gone and today only
a `console.error` records it. `waitUntil` is a latency optimisation; it is not
a delivery mechanism.

So: write the *intent* inside the request, in the same D1 round trip as the
submission — a row in `email_outbox` with status `queued`. `waitUntil` then
attempts an immediate send and marks the row `sent`. A sweeper picks up anything
still `queued` after five minutes, up to five attempts.

Every send carries `Idempotency-Key: {dedupe_key}` (below). Resend keeps
[idempotency keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys)
and returns the original response, so a retry after a timeout of unknown outcome
cannot double-send. Reusing a key with a different payload returns `409
invalid_idempotent_request`, which is the bug detector.

### The sweeper cannot live in this Worker

This is the blocking constraint and it is not obvious.
`@astrojs/cloudflare` regenerates `dist/server/wrangler.json` at build time and
`wrangler deploy` uses that file, not `wrangler.jsonc` (ARCHITECTURE.md, and the
reason custom domains are attached in the dashboard). The generated file in this
repo's current build output contains, literally:

```json
"triggers":{}, "queues":{"producers":[],"consumers":[]}, "send_email":[]
```

So a [cron trigger](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
declared in the source config is dropped, a
[Queues](https://developers.cloudflare.com/queues/platform/pricing/) producer
binding is dropped, and an Email Routing binding is dropped. Worse, an empty
`triggers` block is not "no opinion" — a deploy would remove a cron added by
hand in the dashboard, so the sweeper would work until the next `pnpm
run deploy:prod` and then silently stop.

**Therefore anything scheduled is a second Worker.** `qairuhub-mail`: its own
`wrangler.jsonc`, a `scheduled()` handler, the same D1 `database_id`, its own
`RESEND_API_KEY`, no assets and no routes. Perhaps 120 lines, deployed with its
own `wrangler deploy`. Queues on the Free plan (10,000 operations a day) becomes
possible once that second Worker exists, but the outbox table is still simpler
and reuses migrations we already run.
[Cloudflare Email Service](https://developers.cloudflare.com/email-service/)
would remove Resend entirely, but sending is beta and Workers Paid only.

This second deploy surface is the real cost of everything past Phase 1, and it
is why Phase 1 contains no cron.

## Scope

**Phase 0 — one hour, no code at all.** Create a Telegram bot, run
`wrangler secret put TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. `notify()`
already sends the Telegram branch; it has simply never been configured. The
operator now knows within seconds that an application arrived. This is the
smallest thing that is genuinely useful, it touches no DNS, and if the rest of
this proposal is rejected it still stands.

**Phase 1 — half a day.** DNS: `mail.qairuhub.com` verified in Resend, `p=none`
DMARC, apex untouched. Set `RESEND_API_KEY` / `NOTIFY_EMAIL_FROM` /
`NOTIFY_EMAIL_TO`. Add message **1** to `notify()`'s existing `waitUntil` call,
with an idempotency key of `received/{submissionId}` — no new table, no new
route, no cron. Also return the reference: `form-kit.tsx` already receives
`{ id }` and discards it; keep it in state and render the first eight characters
in the receipt, so the email and the screen agree. This alone closes the broken
promise.

**Phase 2 — the anti-rot device.** The `qairuhub-mail` Worker, `email_outbox`,
and one cron: a weekly message to *the operator* listing `status='new'`
submissions older than 14 days. Nothing to a student yet. If Phase 2 is not
built, Phase 1's *"you hear back either way"* line must be cut from the copy.

**Phase 3.** Messages **2** and **4** (both operator-triggered), then **3** and
**5**, `/unsubscribe`, `/api/rsvp/cancel`, the Resend webhook and
`email_suppressions`.

**Phase 4.** Message **6**, the opt-in checkbox, double opt-in. Only if somebody
actually wants to write it.

## Data and schema

Three migrations, one per phase. Do not create a table before the phase that
reads it.

`0003_email_outbox.sql` (Phase 2):

```sql
CREATE TABLE email_outbox (
  id              TEXT PRIMARY KEY,
  -- Also the Resend Idempotency-Key. Caller-built and meaningful:
  --   received/{submission_id}
  --   decision/{submission_id}
  --   reminder/{event_slug}/{email}
  --   digest/2026-autumn/{email}
  dedupe_key      TEXT NOT NULL UNIQUE,
  template        TEXT NOT NULL,
  submission_id   TEXT REFERENCES submissions(id),
  to_email        TEXT NOT NULL,
  event_slug      TEXT,
  vars            TEXT NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued','sent','failed','bounced','complained')),
  attempts        INTEGER NOT NULL DEFAULT 0,
  provider_id     TEXT,
  last_error      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_outbox_queued ON email_outbox (status, created_at);
```

`dedupe_key` is the second guard: if the endpoint runs twice the insert fails
before Resend is called, and if the row is inserted twice under different ids
Resend's own 24-hour key catches it. It carries a period (`2026-autumn`) so a
recurring message is not permanently blocked by its own first send — an index on
`(template, email)` alone would allow exactly one digest, ever.

`0004_email_suppressions.sql` (Phase 3) — `email TEXT PRIMARY KEY`, `reason
TEXT NOT NULL CHECK (reason IN ('bounce','complaint','manual','unsubscribe'))`,
`created_at`. Checked before every send, including transactional: a hard bounce
means the address is wrong, not that the person opted out.

`0005_email_prefs.sql` (Phase 4) — `email TEXT PRIMARY KEY`, `token TEXT NOT
NULL UNIQUE` (also the one-click unsubscribe token), `confirmed_at`, `source`,
`created_at`. An address, a token and two timestamps: no name, no behaviour,
nothing the site does not need.

`content.config.ts`, `events`: add `cancelled: z.boolean().default(false)` and
`changeNote: z.string().max(200).optional()`. A cancellation is content, so it
arrives as a reviewed pull request and the site cannot contradict the email.

**Message 4 cannot be triggered by content.** Content is compiled at build time
and the mail Worker never sees it; nothing diffs one build against the last. So
the sequence is explicit and two-step: merge the PR, then invoke the send. That
is a feature — it means a mistaken `cancelled: true` is a wrong page, not thirty
wrong emails.

New routes, all `prerender = false`: `POST /api/email/webhook` (Resend/Svix;
writes bounces and complaints into `email_suppressions`, deduplicated on
`svix-id`), `GET|POST /api/unsubscribe`, `GET /api/rsvp/cancel`. New pages:
`/unsubscribe`, `/digest/confirm`.

## Design

`/unsubscribe` and `/digest/confirm` are the FORM archetype's receipt state
(DESIGN §12.3): rail carries the reference, the well carries one mono line —
`UNSUBSCRIBED · hello@example.com · 2026-09-06 14:32` — then one sentence on
what still arrives (event cancellations do) and a `.link-action` back to
`/events`. No `.cta-primary`, so the pages hold **zero** cobalt fills. An
invalid or expired token renders the 404/EMPTY register: `d3` "That link is not
valid.", the path echoed in `m-data`, and the desk facts beneath — never a
generic error.

The digest opt-in is one unticked checkbox on `/apply` and `/contact`, styled
per §10.5, labelled `Email me the term digest — three or four times a year`.
Never pre-ticked, never bundled with the submit consent, and its absence
changes nothing else about the form.

Emails carry no logo, no colour, no image, and no emoji (CONTENT.md). The split
wordmark cannot be reproduced in mail without a webfont, so the sign-off is the
plain string `— QairuHub · QAIRU, Astana`.

## Risks and trade-offs

**The strongest argument against doing this at all.** Email does not read
applications. The bottleneck is that a student volunteer has to open a terminal
to see that someone applied, and every message here except the operator nudge
makes that bottleneck *more* visible without moving it. Sending "a person reads
it, you hear back either way" to fifty students and then not replying is worse
than the current silence: today the site over-promises in copy; afterwards it
over-promises in writing, individually, with a timestamp. Proposals 001
(admin console) and 002 (application review) attack the actual constraint. If
only one of the three gets built this term, it should not be this one. Phase 0
and Phase 1 survive that argument — an hour and half a day, and Phase 1's copy
promises days, not a date. Phases 2–4 do not survive it if nobody is reading.

- **The second Worker is a second thing to forget.** `qairuhub-mail` is deployed
  by hand, from one laptop, by a person who also has exams. If it stops, the
  outbox silently fills with `queued` rows and the sweeper's own failure has no
  watcher. Mitigation: the weekly operator email is sent *by that Worker*, so
  its absence on a Monday is the alarm.
- **Breaking mail for the whole domain.** Editing the apex SPF or MX is the one
  irreversible mistake here. Every record above is on `mail.` or `_dmarc.`
  Change nothing else, and send a test message to a forwarded `@qairuhub.com`
  address before and after.
- **Cold-start deliverability.** Thirty reminders from a two-day-old subdomain
  to thirty Gmail addresses looks exactly like spam. Phase 1 first, so the
  subdomain sends a trickle of one-to-one mail for weeks before any batch.
- **The operator changes every year.** Whoever inherits this must be able to
  read `rua` reports and rotate an API key. If that is not true, Phase 4 never
  ships — a digest nobody can maintain is worse than no digest.
- **Volume may never justify it.** At under ~20 applications a term, hand-typed
  replies from a real inbox are warmer and deliver better than anything here.
  Phase 0 and 1 are still worth it; the rest is not.
- **What we give up:** open rates, click maps, A/B subject tests. We will not
  know who read anything. That is the intended trade.

## Success

Nothing here depends on a tracking pixel.

- Every `submissions` row has a matching `email_outbox` row at `sent` within ten
  minutes, and the sweeper's backlog is empty at each run.
- `rua` reports show DMARC pass for `mail.qairuhub.com` across 30 consecutive
  days, and a test message to a forwarded `@qairuhub.com` address still arrives.
- Zero spam complaints. **Not** "under 0.1%" — at 30 messages a week a single
  complaint is 3%, so the rate is not a measurable quantity here and quoting it
  would be theatre. One complaint is the signal; investigate it individually.
- Median age of `status='new'` submissions trends toward zero after Phase 2.
  This is the only metric that says whether the promise is being kept.
- Reminders: RSVPs against heads in the room, counted by hand, for four events.
  If the ratio does not move, delete message 3.

**Retire a message when**, borrowing Let's Encrypt's reasoning: it costs more
attention than it returns, it forces us to hold data we would rather not, or
its complexity is now a likely source of mistakes. Concretely — the digest goes
two terms unwritten, or the follow-up draws no replies across six events.
Deleting one is a success, not a regression, and the reason gets recorded here.

## Effort

**M** overall. Phase 0 **XS** (one hour). Phase 1 **S** (half a day plus DNS
propagation). Phase 2 **M** — most of it is the second Worker, not the SQL.
Phase 3 **M**. Phase 4 **S**.

No hard dependencies, but Phase 3 should not start before 001/002. Message 2
fires on a `submissions.status` change, and today that change is
`wrangler d1 execute "UPDATE submissions SET status='accepted' WHERE id=?"` —
workable, and nobody will do it at 23:00.
