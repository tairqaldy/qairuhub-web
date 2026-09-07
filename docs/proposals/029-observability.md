---
title: Find out the form is broken before the applications stop
status: draft
area: platform
effort: S
depends_on: []
---

# 029 — Find out the form is broken before the applications stop

| | |
|---|---|
| **Status** | draft |
| **Area** | platform |
| **Effort** | S (Phase 1); M only if Phase 2 is ever triggered |
| **Depends on** | — |

## Problem

`POST /api/submit/[kind]` is the only route on qairuhub.com whose failure costs
the club something real, and it is engineered to fail quietly. Every exit path
ends in a polite sentence: a missing `env.DB` returns *"The form is temporarily
unavailable"*, a failed insert *"Something went wrong saving that"*, a rejected
token *"The anti-spam check did not pass."* Right words for the student; nothing
reaches anyone who could fix it.

The named failure is not hypothetical. Turnstile's siteverify returns
`invalid-input-secret` — "Secret key is invalid or expired" — and the handler
treats every non-success identically: one `console.warn`, then a 400. Rotate
`TURNSTILE_SECRET` in the dashboard without re-running `wrangler secret put` and
**every** submission is rejected, indefinitely, leaving only a warn line that
Cloudflare deletes after three days on the Free plan.

`notify()` is worse. It runs inside `waitUntil()` after the response has gone,
so a dead Resend key or revoked bot token produces a `console.error` nobody will
ever read. The line does carry a status code — `sendEmail()` returns
`` `${response.status}: ${body.slice(0, 200)}` `` — and that is its own problem:
two hundred characters of a Resend error body can echo back the `from` and `to`
addresses. The single error log this codebase has today is also the single PII
leak it has today.

Detection today is a student noticing that `SELECT COUNT(*) FROM submissions`
stopped moving. In term that is a week; in July it is indistinguishable from
normal. Web Analytics is cookieless and page-level and cannot see a 500 on an API
route.

## Prior art

**[Google SRE Book, "Monitoring Distributed Systems"](https://sre.google/sre-book/monitoring-distributed-systems/)**
— white-box ("metrics exposed by the internals of the system") versus black-box
("testing externally visible behavior as a user would see it"), and "Every page
should be actionable." *Steal:* alert on the symptom — no application saved — not
on D1 latency. *Leave:* the four golden signals as a dashboard; traffic and
saturation mean nothing at thirty requests a day.

**[GOV.UK Service Manual, "Monitoring the status of your service"](https://www.gov.uk/service-manual/technology/monitoring-the-status-of-your-service)**
— if an issue "could wait until the morning, consider changing your alert
strategy so that type of error doesn't prompt an alert in future." *Steal:* two
severities and a written rule that an unacted-on alert gets deleted. *Leave:* the
on-call rota. There is one maintainer.

**[Healthchecks.io](https://healthchecks.io/pricing/)** — the dead man's switch:
a job pings a URL on success and *silence* is the alarm. Hobbyist is free: 20
jobs, 100 log entries each. *Steal:* the inversion — nothing inside Cloudflare
can tell you Cloudflare stopped running your cron. *Leave:* the account. This
proposal ends up owning no cron, and UptimeRobot's free plan already carries
heartbeat monitoring, so a second vendor would buy nothing.

**[UptimeRobot](https://uptimerobot.com/pricing/)** — free: 50 monitors, a
5-minute minimum interval, keyword monitoring, custom headers and statuses,
heartbeat monitoring, three months of retention — and, checked against the plan
table because an earlier draft of this document asserted the opposite,
**Telegram is included on Free**, alongside Slack, Mattermost and MS Teams.
Webhook, Zapier and PagerDuty are not. *Steal:* nearly the whole design. A
monitor that sends its own `Authorization` header, matches a keyword in the
body and alerts to Telegram is the watchdog, without a watchdog. It also checks
from outside Cloudflare, the only thing that catches "Worker healthy, custom
domain fell off" — live here, since the adapter regenerates the deploy config
and the domains exist only in the dashboard. *Leave:* the status page.

**[Sentry pricing](https://sentry.io/pricing/)** and
**[the Cloudflare SDK docs](https://docs.sentry.io/platforms/javascript/guides/cloudflare/)**
— evaluated and rejected below.

## Proposal

**1. Structured result codes.** Every exit path logs one ~120-byte JSON line:
`{"evt":"submit","kind":"membership","result":"turnstile_failed","code":"invalid-input-secret","status":400,"ms":184}`.
`result` is a closed set (`ok`, `honeypot`, `invalid`, `rate_limited`,
`turnstile_failed`, `turnstile_unreachable`, `event_unknown`, `duplicate`,
`db_missing`, `db_error`). `console.error('submission insert failed', error)`
becomes `redactError(error)` — `error.name` plus 200 characters with anything
email-shaped scrubbed.

**Never logged, ever:** `name`, `email`, `telegram`, any key of `payload`, the
free text, the raw `user-agent`, the token, the IP. These are students'
applications, and D1 is in EEUR deliberately while Workers Logs are not regional.
`submissionId` is fine — a `randomUUID()` identifying nothing without D1 access.
Mechanise it: `scripts/check-logs.mjs`, in `pnpm check` beside
`check-cobalt.mjs`, fails the build on any `console.*` passing `data`, `raw`,
`parsed`, `payload`, `email`, `name`, `telegram` or a bare `error`.

**2. `GET /api/health`, exercising the real path.** `prerender = false`,
`no-store`, `X-Robots-Tag: noindex` (`/api/` is already disallowed in
`robots.txt`). *Shallow*: no auth, one `SELECT 1`, cached 60s via the Cache API,
returns the literal `qairuhub-ok` for a keyword monitor. *Deep* (`?deep=1` with
`Authorization: Bearer $HEALTH_TOKEN`) times five checks:

| Check | Does | Green | Red |
|---|---|---|---|
| `d1` | insert/select/delete a row in `health_probes` | round-trips | any `D1_ERROR` |
| `turnstile` | siteverify, real secret, literal token `qairuhub-health-probe` | `invalid-input-response` | `invalid-input-secret` |
| `telegram` | `getMe` | body `{"ok":true}` | anything else — status alone is not enough |
| `resend` | `GET /domains` | 200 | 401/403 |
| `content` | `getUpcomingEvents()` | resolves | throws |

The Turnstile probe is the trick: a deliberately invalid *token* against a valid
*secret* answers `invalid-input-response`; a dead secret answers
`invalid-input-secret`. One request distinguishes exactly the failure this
proposal is named after, with no browser and no real token spent. Three
subrequests against the Free plan's 50, all I/O — so the 10 ms Free CPU limit is
not in play.

**Be honest about what it cannot see.** It does not prove the widget rendered,
the island mounted, or that the CSP still allows `challenges.cloudflare.com`.
Turnstile tokens are single-use and issued to browsers; there is no server-side
way to fake one against a production sitekey. The browser half belongs to
`pnpm e2e` and to step 5 of the weekly check, not to a probe pretending
otherwise.

**3. A separate watchdog Worker.** `workers/watchdog/`, its own `wrangler.jsonc`
and deploy, ~120 lines, `"triggers": { "crons": ["*/15 * * * *"] }`. It must be
separate: `@astrojs/cloudflare` regenerates the deploy config with an empty
`triggers` block — the trap that already drops routes — so a cron on the site
Worker would never fire, failing in precisely the invisible way this proposal
exists to end. It also gives an independent failure domain: a bad site deploy
cannot silence its own watchdog. 96 invocations/day against 100,000/day, using 1
of the 5 cron triggers a Free account gets. Each run calls the deep check, writes
the verdict, decides on alerting, then pings Healthchecks.io *last* — so a
crashed watchdog stops pinging and Healthchecks.io raises the alarm itself.

**4. Telegram alerts, with the flap rules written down.** Plain text, no
MarkdownV2 — an alert must never fail to send because a hyphen was unescaped.
Alert on `ok → fail` only after **two consecutive failures** (30 minutes); while
failing, re-alert at most every 6 hours; send a recovery message with the outage
duration; name the check, the code, and the command to run
(`wrangler secret put TURNSTILE_SECRET`). Telegram allows 20 messages a minute to
a group; this tops out near four a day. Plus one **non-urgent nudge** at
`0 4 * * *` (09:00 Astana) if zero submissions have been saved in 14 days,
phrased as "worth a look" — zero applications in July is normal, and the honesty
rule forbids dressing a number we cannot interpret as an incident.

**Error tracking, three ways.** *Sentry Developer* — free at 5,000 errors/month,
one user, 30-day lookback, genuinely better at grouping. Rejected:
`@sentry/cloudflare` requires `compatibility_flags: ["nodejs_compat"]` and a
compat date ≥ `2024-09-23`, the exact dependency this project refused for the
Resend SDK; it adds bundle weight to the one route that must stay cheap; its
events carry request context, making PII scrubbing a permanent volunteer
obligation; and one seat means the account dies with the maintainer. *Workers
built-in observability* is already on — Free gives 200,000 log events/day at **3
days** retention (Paid: 20M/month, 7 days, $0.60 per extra million), nothing
leaves Cloudflare, no bundle cost — but three days is shorter than a week, and
logs are pull, never push, so it cannot alert. *D1* outlives three days, sits in
EEUR beside the data it describes, and answers to `wrangler d1 execute`; it
cannot record its own outage, which is what the external watchdog covers.

**Recommend: Workers Logs for debugging, D1 for history, watchdog → Telegram for
alerting, Healthchecks.io as the dead man's switch, UptimeRobot for black-box.
$0, two free accounts, both replaceable in ten minutes.**

**Logpush and Tail Workers: named, deferred.** Logpush is Workers Paid only and
truncates once `logs` and `exceptions` exceed 16,384 combined characters. Tail
Workers are Paid or Enterprise, billed by CPU time rather than requests,
configured as `"tail_consumers": [{ "service": "..." }]` — which the adapter
would drop like routes, so it too would need attaching in the dashboard. Right at
longer retention or a second Worker; not worth $5/month today. Cloudflare's
Standalone Health Checks are Pro and above, which is why UptimeRobot is here.

## Scope

**Phase 1 (S, one weekend):** result codes, `redactError()`, `check-logs.mjs`,
`/api/health`, migration `0003`, two UptimeRobot monitors (`/` keyword
`QairuHub`; `/api/health` keyword `qairuhub-ok`) alerting to email. No cron, no
Telegram — this alone turns a silent failure into one confirmable in thirty
seconds. **Phase 2:** the watchdog, D1 writes, the flap rules, Telegram, the
Healthchecks.io ping. **Phase 3:** `pnpm health`, the daily nudge, `/dev/health`.
**Not in scope:** Sentry, Logpush, Tail Workers, a public status page, RUM, and
session replay — permanently, because these are students' applications.

## Data and schema

No change to `src/content.config.ts`. Migration `0003_health.sql`:

```sql
CREATE TABLE IF NOT EXISTS health_events (
  id TEXT PRIMARY KEY,
  checked_at TEXT NOT NULL DEFAULT (datetime('now')),
  check_name TEXT NOT NULL,   -- d1 | turnstile | telegram | resend | content | endpoint
  status TEXT NOT NULL CHECK (status IN ('ok','warn','fail')),
  code TEXT,                  -- 'invalid-input-secret', 'D1_ERROR', 'http-502'
  ms INTEGER,
  detail TEXT                 -- <=200 chars, machine codes only, never user input
);
CREATE INDEX IF NOT EXISTS idx_health_events_time ON health_events (checked_at DESC);

CREATE TABLE IF NOT EXISTS health_state (
  check_name TEXT PRIMARY KEY, status TEXT NOT NULL, since TEXT NOT NULL,
  fail_count INTEGER NOT NULL DEFAULT 0, last_alert_at TEXT
);

-- Written and deleted by the deep check. Never `submissions`.
CREATE TABLE IF NOT EXISTS health_probes (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

A green run writes only `health_state`; failures and transitions write
`health_events`. Steady state is ~200 D1 writes/day against the Free plan's
100,000, and ~300 row reads/day from UptimeRobot's poll against 5,000,000. The
watchdog sweeps `health_events` past 90 days and `health_probes` past an hour in
the same run — the sibling of `pruneRateLimits()`, so no second cron.

New secrets: `HEALTH_TOKEN` on the site Worker; `HEALTH_URL`, `HEALTH_TOKEN`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `HEALTHCHECKS_PING_URL` on the
watchdog, which binds the same `qairuhub` database in its own config. Record all
of them and both vendor accounts in `docs/ARCHITECTURE.md` — an undocumented
account is a succession bug.

## Design

Mostly no visual surface, correctly. **No public status page.** `Табло` was
rejected in `docs/DESIGN.md` §0 partly for reading as one, and a club with a
single Worker route publishing uptime is theatre.

If a view is ever wanted it is `/dev/health`, `noindex`, beside `/dev/glyphs`, in
**THE RECORD**: five hairline rows, a mono state token per row
(`ЖҰМЫС ІСТЕП ТҰР` / `ІСТЕМЕЙДІ`), tabular figures for `ms`, no zebra, no card.
Cobalt appears only as the 1px × 12px margin change-bar tick on a row whose state
changed — never as the carrier of "ok", since §8.3 forbids cobalt as the sole
carrier of meaning and `--danger` owns errors. No pulsing dot, no sparkline, no
count-up (§7.4, CLAUDE.md §9). Empty state: `ӘЛІ ТЕКСЕРІЛМЕГЕН — NOT YET CHECKED`
in `--ink-3`. Zero bytes to the browser.

## Risks and trade-offs

**Alert fatigue is the failure mode, not missed alerts.** A maintainer who mutes
the channel is worse off than one with nothing, because they believe they are
covered. Mitigations are structural: one destination, two severities, two
strikes, a six-hour cap, and a standing commitment to delete or downgrade any
alert nobody acted on — GOV.UK's rule, verbatim.

**The endpoint is a small lever.** Shallow is unauthenticated but does one
indexed read behind a 60-second cache entry; deep needs the bearer token. A
leaked `HEALTH_TOKEN` buys a probe row and three outbound calls — no mail sent,
no submission touched — but rotate it.

**False green** is real and named: the probes pass while the browser half is
broken, which is why the weekly check ends with a real phone. **Accidental PII in
logs** is the one new privacy risk, hence a build gate rather than a review note.
**Succession:** register both new accounts under the club address.

**What would make this a bad idea:** growing past Phase 2. The moment it needs a
dashboard, a rota or a second maintainer, it has stopped being sized for this
club.

## Success

- The next failure is found by a Telegram message, not by a student saying "I
  applied and never heard back". That is the whole test.
- Detection under 30 minutes for endpoint failures — two cron runs.
- "Did any application fail to save this month?" answerable in one command.
- Nothing alerts that is not acted on. Count per term; if it is not zero, delete
  checks until it is.

**The weekly five-minute check** (`pnpm health` prints 1–4):

1. `curl -s https://qairuhub.com/api/health` — green now?
2. `SELECT check_name, status, COUNT(*) FROM health_events WHERE checked_at > datetime('now','-7 days') GROUP BY 1,2;`
3. `SELECT date(created_at), kind, COUNT(*) FROM submissions WHERE created_at > datetime('now','-7 days') GROUP BY 1,2;` — the symptom, catching everything the probes cannot.
4. The Worker's Metrics tab for the 7-day request and error graph. Not the logs — gone after three days on Free, which is why `health_events` exists.
5. Once a term, weekly in application season: submit the real form from a phone,
   confirm the row and the ping, delete the row by id.

**Remove it again if** two terms pass with nothing firing but flaps, or a month
passes without the weekly check. Either means the alerting is decoration; keep
`health_events`, the nudge and one monitor, delete the rest.

## Effort

**M** overall; Phase 1 is **S** — roughly 250 lines across the health route, the
log guard and the migration, all inside patterns the codebase already has. Phase
2 is the bulk: a second deployable Worker, a second `wrangler deploy` documented
in `docs/ARCHITECTURE.md`, six secrets. Phase 3 is a script and an optional page.

Depends on nothing. More useful once the notification secrets in
`docs/STATUS.md` are set, since two of the five checks report "not configured"
until then — itself an honest result, not a failure.
