---
title: Push the site's facts into the Telegram group the club already lives in
status: draft
area: growth
effort: M
depends_on: []
---

# 031 — Push the site's facts into the Telegram group the club already lives in

| | |
|---|---|
| **Status** | draft |
| **Area** | growth |
| **Effort** | M |
| **Depends on** | — |

## Problem

The day-to-day of this club happens in a Telegram group. The site treats that
group as `SITE.social.telegram` — one link in the footer, pointing at
`t.me/qairuhub`, which `docs/STATUS.md` still lists as unconfirmed. Traffic runs
one way: a student who is already in the group has no reason to open the site,
and the site has no way to reach the group.

Meanwhile the site holds the facts worth pushing — the next session in
`src/content/events/`, a Friday note in `src/content/learn/`, a project that
moved from `idea` to `prototype` — and the Worker that could push them is already
built. `src/lib/notify.ts` contains a working `sendTelegram()` that escapes
MarkdownV2, posts to `sendMessage`, and checks `body.ok` rather than the HTTP
status. It has never run in production, because `TELEGRAM_BOT_TOKEN` and
`TELEGRAM_CHAT_ID` are unset.

The cost of that shows up on the intake path. A membership application lands in
D1 and stops there. The documented way to read it is:

```bash
wrangler d1 execute qairuhub --remote --command "SELECT created_at, kind, name, email FROM submissions ORDER BY created_at DESC LIMIT 20;"
```

Nobody runs that daily. A student who applies on a Friday hears nothing until
someone remembers, and the club's only real conversion path has a latency
measured in days for want of two `wrangler secret put` calls.

The RSVP path is worse for a different reason. `rsvpSchema` asks for name,
email and a Turnstile token — a form, a keyboard, an email address — from
somebody who is already sitting in the group where the session was announced.

The honest counterweight: the group is small and new. A bot that posts a lot
into a small group gets muted, and a muted group is worth less than the footer
link it replaced. Any design here has to be more careful about what it refuses
to send than about what it sends.

## Prior art

**[Telegram Bot API reference](https://core.telegram.org/bots/api)** — the
authority on the two landmines already recorded in `docs/ARCHITECTURE.md`.
Requests go to `https://api.telegram.org/bot<token>/METHOD_NAME` with **no
slash after `bot`**, and every response is a JSON object with `ok`,
`description`, `error_code` and an optional `parameters`. *Steal:*
`ResponseParameters` carries `retry_after` (429 backoff) and
`migrate_to_chat_id` — the latter is what you get when a basic group is upgraded
to a supergroup and the stored chat id stops working; the reply hands you the new
one. Also: `callback_data` on an inline button is capped at **64 bytes**, which
sizes the RSVP design below. *Leave:* files, payments, inline mode, Web Apps —
none of it applies.

**[Bot FAQ, "My bot is hitting limits"](https://core.telegram.org/bots/faq)** —
"In a single chat, avoid sending more than one message per second", "In a group,
bots are not be able to send more than 20 messages per minute", and bulk
broadcast is capped around 30 messages per second. *Steal:* the group limit as a
design constraint, not a ceiling to approach — it is roughly 30× more than this
proposal should ever want. *Leave:* paid broadcasts via Stars; the thresholds
(100,000 Stars, 100,000 monthly active users) are not this club.

**[Bot features](https://core.telegram.org/bots/features)** — privacy mode is
**on by default**: in a group the bot sees only commands aimed at it, replies to
its own messages, and `/start` when it spoke last. Deep-link payloads
(`t.me/<bot>?start=PAYLOAD`) are "up to 64 characters long" using `A-Z a-z 0-9 _
-`. *Steal:* both — privacy mode stays on, and the deep link is the entire RSVP
mechanism. *Leave:* `/setprivacy` off. The docs themselves recommend it only
"where it is absolutely necessary", and a bot reading every message in a student
group is a data-protection question (see proposal 030) before it is a feature.

**[grammY: long polling vs. webhooks](https://grammy.dev/guide/deployment-types)**
and **[grammY on Cloudflare Workers](https://grammy.dev/hosting/cloudflare-workers)**
— webhooks are the recommended mode on "serverless platforms, such as cloud
functions or programmable edge networks", because long polling needs a process
that stays alive and a Worker has none between requests. `setWebhook` and
`getUpdates` are mutually exclusive: once a webhook is set, `getUpdates` returns
nothing. *Steal:* the deployment shape. *Leave:* grammY itself. The Resend
precedent applies — the whole surface here is four methods over plain `fetch`,
and the framework would add a dependency this Worker does not otherwise need.

**[Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)**
and **[Workers limits](https://developers.cloudflare.com/workers/platform/limits/)**
— `scheduled(controller, env, ctx)`, configured as `triggers.crons`, running on
**UTC**; the Free plan allows 5 cron triggers per account, 100,000 requests/day,
50 subrequests per request and 10 ms CPU per invocation. *Steal:* everything;
this is the free scheduler. *Leave:* any assumption that local time works —
Astana is UTC+5, so a 17:00 session reminder is a `0 12 * * *` cron.

**[IndieWeb: POSSE](https://indieweb.org/POSSE)** — publish on your own site,
syndicate elsewhere, keep the canonical URL. *Steal:* the direction of travel.
The site stays the record; Telegram gets a pointer back to it. *Leave:* the full
backfeed machinery (Webmention, Brid.gy). Replies stay in Telegram.

## Proposal

**Two Telegram surfaces, never one.**

1. **A private admin group** — the bot's work queue. Every form submission
   arrives here within seconds of the student pressing submit. Two people, no
   noise budget, no cap.
2. **The public group** — humans talking. The bot posts here rarely and under a
   hard, code-enforced ceiling.

Then five pieces of work.

**1. `src/lib/telegram.ts`.** Lift the transport out of `notify.ts` into one
`call<T>(method, params)` that reads the body, not the status: on `ok: false` it
returns `description` and `error_code`; on `error_code === 429` it reads
`parameters.retry_after` and either sleeps once or gives up; on
`parameters.migrate_to_chat_id` it logs loudly that the stored chat id is stale.
`notify.ts` keeps its `escapeMarkdownV2()` and calls through this.

**2. Getting the chat ids, once.** Create the bot in @BotFather, add it to each
group, send one message, then — **before** any webhook is set, because the two
are mutually exclusive — call `getUpdates` from a laptop and read
`result[].message.chat.id`. Supergroup ids are negative and begin `-100`. If the
public group uses forum topics, keep `message.message_thread_id` too and pass it
on every send, or announcements land in "General". Store as
`TELEGRAM_ADMIN_CHAT_ID` and `TELEGRAM_GROUP_CHAT_ID`.

**3. The webhook, not polling.** A single route `POST /api/telegram/webhook`
with `export const prerender = false`. `setWebhook` is called once by hand with
`secret_token` and `allowed_updates: ["message","callback_query"]`; Telegram
sends that token back in the `X-Telegram-Bot-Api-Secret-Token` header and the
route returns 401 on any mismatch. This matters: the route is a public
unauthenticated URL on a Worker with a 100,000-request daily budget. Do **not**
put the bot token in the webhook path, which is a common pattern — request URLs
surface in logs. Commands are deliberately few: `/start`, `/next` (the next
session, from the site), `/help`.

**4. The announcer, on cron.** The events collection is compiled at build time,
so the scheduled handler cannot call `getCollection`. Emit a small
`/events.json` at build and have the cron `fetch()` the site's own URL — one
subrequest, and the content model stays the single source of truth. Every 15
minutes it asks: is there an event whose announcement or reminder is due and not
yet sent? Dedupe without a transaction (D1 has no `BEGIN`; `batch()` is the only
primitive) by claiming first: `INSERT OR IGNORE` into `announcements`, and send
only if `meta.changes === 1`. A re-fired cron claims nothing and sends nothing.

Adding `scheduled()` needs a custom Worker entrypoint. The adapter's
`workerEntryPoint` option is gone; the current route is to declare an entrypoint
in the Wrangler config and export a standard Worker object that re-exports
`fetch` from
[`@astrojs/cloudflare/handler`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/).
See the risks — this interacts badly with how this project deploys.

**5. RSVP from inside Telegram.** The event page and each announcement carry
`t.me/<bot>?start=e-<id8>` — an 8-character id derived from the slug, because the
payload is capped at 64 characters and `callback_data` at 64 bytes. `/start`
opens a **private** chat, where the bot restates the event and offers one inline
button. On `callback_query`: write the RSVP, always `answerCallbackQuery` (even
on failure, or the button spins forever), and `editMessageText` to confirm.
Turnstile cannot run here; the substitute is a stable `from.id` plus the existing
`rate_limits` table keyed on the user id instead of a hashed IP.

**What is deliberately not automated.** This is the part that decides whether
the bot survives.

- **A hard weekly cap on the public group** — at most 3 bot posts per 7 days,
  counted in D1, enforced in code. Over the cap the announcer logs and drops.
  Mechanised restraint, the same discipline `scripts/check-cobalt.mjs` applies to
  the accent colour.
- **No post per content commit.** Notes and projects do not each earn an
  announcement. At most one weekly digest, skipped entirely in a week with
  nothing in it.
- **One announcement, one reminder.** Publication, then 24 hours before. No
  countdown chains, no "good morning", no day-of hype. Reminders go as one group
  message, never as a fan-out of direct messages — that is the case that would
  actually approach the 20-per-minute limit, and it is the case that gets a bot
  blocked.
- **Privacy mode stays on.** No auto-replies, no keyword triggers, no FAQ bot,
  no welcome message on join, no karma, no leaderboard, no auto-kick, no
  auto-pin.
- **No names in the group.** RSVPs are confirmed in the private chat. The bot
  never posts "X is coming" — these are students, and consent to attend is not
  consent to be listed.
- **No machine translation.** Announcements are English until a human writes
  Kazakh or Russian, exactly as `docs/CONTENT.md` requires of the site.

## Scope

**Phase 0 — one hour, do this regardless.** Create the bot, create the admin
group, `wrangler secret put TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
`notify()` already works; applications start arriving in seconds. This is most of
the value in this document and none of the risk.

**Phase 1.** `src/lib/telegram.ts` with real error handling and unit tests
against recorded `{"ok": false}` bodies.

**Phase 2.** The webhook route, secret-token check, `/start`, `/next`, `/help`.

**Phase 3.** `/events.json`, the `scheduled()` entrypoint, the `announcements`
table, the weekly cap.

**Phase 4.** Deep-link RSVP and the callback button.

Out of scope: moderation, analytics on members, anything conversational, and a
second bot for anything.

## Data and schema

`src/content.config.ts`: one field on `events` —
`announce: z.boolean().default(true)` — so an entry can opt out. Nothing else.

Migration `0003_telegram.sql`, two small tables:

- `announcements(target_kind, target_slug, channel, message_id, sent_at)` with
  `UNIQUE(target_kind, target_slug, channel)`. The unique index *is* the
  idempotency mechanism.
- `telegram_rsvps(event_slug, tg_user_id, tg_username, created_at)` with
  `UNIQUE(event_slug, tg_user_id)`.

A separate table rather than reusing `submissions` is a deliberate trade. A
Telegram RSVP has no email, `submissions.email` is `NOT NULL`, and its unique
index is `(kind, email, COALESCE(event_slug,''))` — relaxing that in SQLite means
create-copy-drop-rename on the table that holds every real application. Not worth
it. The eventual admin view unions the two.

Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`,
`TELEGRAM_GROUP_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET` — declared for TypeScript on
`Cloudflare.Env` in `src/types/cloudflare-env.d.ts`, never in the repository, and
never `PUBLIC_`. The Free plan allows 64 variables and secrets per Worker at 5 KB
each, so the count is not a constraint. The token is the entire authentication:
anyone holding it can post as the club. It is revocable in @BotFather.

No new bindings. D1, KV and the Worker already exist. Cost against free tiers:
zero — a few hundred cron invocations and a handful of webhook requests a month
against 100,000 requests a day and 5 cron triggers.

## Design

Mostly off-site, but three things touch `docs/DESIGN.md`.

On an event page, RSVP keeps the single `.cta-primary` cobalt fill; "Ask in
Telegram" sits beside it as a plain underlined link. The cobalt law allows
exactly three fills site-wide and this is not one of them.

Message bodies are the site's voice in another medium: no emoji (`docs/CONTENT.md`
forbids them in UI and this is UI), dates rendered through the existing
`formatLongDate`/`formatTime` helpers so they carry `Asia/Almaty` rather than the
reader's zone, `link_preview_options: { is_disabled: true }` so the group does not
fill with cards, and one canonical `qairuhub.com` link at the end.

The empty state is the same rule the site follows. `/next` with no upcoming
session replies that there is none and when the next one is usually decided. It
does not invent one.

## Risks and trade-offs

**The group mutes the bot.** The failure mode, and it is silent. Mitigated by the
hard cap and the admin/public split; detected only by asking people, which is a
thing a human has to actually do at the end of term.

**The cron disappears on the next deploy.** `@astrojs/cloudflare` regenerates
`dist/server/wrangler.json` at build time and `wrangler deploy` uses *that* file —
which is exactly why this project's custom domains live in the dashboard rather
than in `wrangler.jsonc`. Assume `triggers.crons` is dropped the same way until
proven otherwise, set the cron in the dashboard, and verify the generated file
after a build. The announcer failing is invisible: nothing alerts, and the club
just quietly stops posting. This is the case proposal 029 exists for.

**A custom Worker entrypoint is new surface** on a build that currently has none,
and it is the piece most likely to break on an adapter upgrade.

**Token compromise.** One leaked token and someone posts as QairuHub. Secrets
only, never logged, never in a URL, revoke in @BotFather.

**One person owns the bot.** @BotFather has no co-owners. When that student
graduates the bot is orphaned. Record the owner in the charter and put the token
wherever the club keeps shared credentials.

**Consent.** Telegram usernames are personal data and belong in D1 and the admin
group only — never republished, never in the public group.

**Doing nothing is defensible.** Phase 0 alone closes the real gap. Phases 2–4
are a bot the club may not need until the group is bigger than it is today, and
saying so now is cheaper than building it and then muting it.

## Success

- Time from submission to a human seeing it drops from "whenever someone runs
  `wrangler d1 execute`" to under 60 seconds. Directly measurable, and the only
  number here that will be honest at this scale.
- `/next` is used by people who are not the maintainer. Countable.
- Announcements never exceed the cap — check the counter, not memory.
- Whether announced events draw more RSVPs is **not** a claim this club can make
  with one or two events. Record the numbers; do not present them as a finding.

Remove it if the cap is being hit routinely, if `/next` goes unused for a term,
or if anyone in the group asks it to stop. The admin channel stays either way —
it is a work queue, not a broadcast.

## Effort

**M.** Phase 0 is an hour with no code. Phase 1 is a short refactor of code that
already exists. Phases 2–4 are each roughly a weekend, and Phase 3 carries the
only real unknown — whether the cron trigger survives the adapter's regenerated
deploy config. Test that before committing to the announcer.

No hard dependencies. Reads better after 029 (an unannounced announcer is an
unnoticed outage) and should be read alongside 030 for the personal data.
