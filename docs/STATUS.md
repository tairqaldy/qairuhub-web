# Status and next steps

Last updated 2026-09-06.

## Live

| | |
|---|---|
| Production | **https://qairuhub.com** (and `www`) |
| Worker URL | https://qairuhub-website.tairkaldybayev.workers.dev |
| Repository | https://github.com/tairqaldy/qairuhub-web |
| Account | Cloudflare `aefda65292e1c46cd3d2c93049b66b03` |

## What is done

**Infrastructure**
- Astro 7.3 on Cloudflare Workers, static with per-route SSR for the API.
- D1 `qairuhub` created in EEUR, migrated, and verified writing in production.
- KV session namespace provisioned. Cloudflare Images binding active.
- `qairuhub.com` and `www` attached to the Worker. The Namecheap parking
  records that were returning 522/525 are gone; email records untouched.
- Turnstile configured for all three hostnames; the secret is set and
  server-side verification is confirmed working against the live endpoint.

**The site**
- Every route in the section index, plus `/about`, `/apply`,
  `/apply/accelerator`, `/contact`, and a 404 that carries live facts.
- Detail pages for programmes, events, projects, notes and documents.
- Four form variants behind one endpoint, with rate limiting, honeypot,
  Turnstile, and D1 storage.
- Light and dark, both designed. Mobile layout built as its own composition.

**Guardrails**
- `pnpm check` — typecheck, lint, no-AI-attribution, cobalt law, unit tests.
- `pnpm e2e` — design law on every route at three breakpoints.
- `pnpm check:fonts` — Kazakh glyph coverage from real font tables.
- `/dev/glyphs` — visual trilingual gate.

## What the site needs from you

These are the things no amount of engineering can supply.

### 1. Real content (the big one)

Everything in `src/content/` is marked `placeholder: true`, so **production
correctly shows empty states**. The site refuses to invent members, events or
statistics. It fills up the moment real entries land.

Start with, in rough order of value:

1. **Two or three real people** — `src/content/people/`. The People section is
   the strongest signal that this is a real community.
2. **The next real event** — `src/content/events/`. This lights up the homepage
   desk, which is the main conversion path.
3. **One real project** — `src/content/projects/`.
4. **The charter** — `src/content/docs/charter.md`.

See [CONTENT.md](CONTENT.md). Each is one Markdown file.

### 2. Photography

Every page reserves a full-bleed frame for a photograph and currently renders an
honest "awaiting photography" placeholder at the exact final size. One good
photograph of people building changes the character of the site more than any
other single change. Real members, real sessions, in colour.

### 3. Notification secrets (optional)

Submissions are stored in D1 today and nothing is lost. To also get an email or
Telegram ping when one arrives:

```bash
wrangler secret put RESEND_API_KEY
wrangler secret put NOTIFY_EMAIL_FROM
wrangler secret put NOTIFY_EMAIL_TO
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
```

Until then, read submissions with:

```bash
wrangler d1 execute qairuhub --remote --command "SELECT created_at, kind, name, email FROM submissions ORDER BY created_at DESC LIMIT 20;"
```

### 4. Decisions still open

- **Default language.** English is published. The design specification argues
  for Kazakh at `/` with English at `/en`, which is a stronger position for a
  Kazakhstani university. That is a one-line config change plus real translated
  copy — and the copy must come from a native speaker, not a machine.
- **Real social handles.** `src/lib/site.ts` points at `github.com/qairuhub`
  and `t.me/qairuhub`. Correct them if those are not the real accounts.
- **The QAIRU link** points at `qairu.edu.kz`. Confirm that is the right URL.

## Not built, deliberately

- **`/blog` and `/partners`** — schemas and content folders exist, but no pages.
  Neither is in the navigation, so nothing is broken. Build them when there is
  something to put in them.
- **`/admin`** — reading submissions is a one-line `wrangler d1 execute` today.
  A page behind Cloudflare Access is worth building when someone other than you
  needs to triage applications.
- **R2** — images are optimised at build time and nothing reads from object
  storage. Add a bucket when there is original media to keep.
- **A hackathon signup page** — the form variant and the endpoint exist; it
  needs a real event to attach to.

## Review findings not yet acted on

A repository-wide adversarial review confirmed 43 findings. The substantive ones
are fixed; these are the ones deliberately left, with the reason.

| Finding | Why it is still open |
|---|---|
| Event upcoming/past is decided at build time | Inherent to a static site. The page can be a day stale, but the **server** now rejects an RSVP for a past or unknown event, which is the part that could actually mislead a student. Add a scheduled rebuild if the staleness starts to matter. |
| `pnpm e2e` cannot start its own dev server in an agent environment | Astro 7 backgrounds `astro dev`, so Playwright's `webServer` sees the process exit. Run a server yourself and pass `E2E_BASE_URL`. CI is unaffected. |
| `lang` is never filtered in content queries | Correct today, because only English is published. It has to be addressed before the second language ships, or an index would list the same entry twice. |
| `ApplyForm` uses `client:load` | On /apply and /contact the form *is* the page's purpose, so deferring it would only delay the thing the visitor came for. |
| No `/blog` or `/partners` page | Schemas exist and validate; no page renders them yet. Build them when there is content. |

## Known trade-offs

- **The accent is cobalt**, the most common colour in this category. The design
  compensates through type, grid, density and border structure, and mechanises
  the restraint in `scripts/check-cobalt.mjs`. If the site ever starts to look
  generic, that file is where the discipline lives.
- **The display face is Onest, not Space Grotesk.** Space Grotesk is the more
  distinctive face but contains no Cyrillic at all, and the two-family stack it
  needed could not be made to work through Astro's font API. Onest covers all
  three scripts on its own, so Kazakh and Russian headlines are set in the same
  face as English rather than the local languages getting a fallback. Some
  display character was traded for correctness in the site's own languages.
- **Playwright e2e runs against `pnpm dev`.** Ten parallel workers race the dev
  server's first-request compile and produce failures that look like design
  faults; workers are capped at four.
