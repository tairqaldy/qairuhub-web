# QairuHub Architecture

How the site is built, where it runs, and the things about this stack that are
easy to get wrong.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 7.3** | The site is ~95% content. Static by default, zero JS unless asked for. |
| Interactivity | **React 19 islands** | Four form variants. Nothing else on the site needs client state. |
| Styling | **Tailwind v4** (`@tailwindcss/vite`) | CSS-first `@theme` tokens; no JS config file. |
| Hosting | **Cloudflare Workers** via `@astrojs/cloudflare` v14.3 | Cloudflare Pages is no longer supported by this adapter. |
| Database | **D1** (`qairuhub`, EEUR) | Form submissions and rate limiting. EEUR is the closest region to Astana. |
| Sessions | **KV** (`SESSION`) | Provisioned automatically by the adapter on deploy. |
| Images | **Cloudflare Images** binding | Only as a runtime fallback — see below. |
| Anti-spam | **Turnstile** | Verified server-side on every submission. |
| Notifications | **Resend** + **Telegram Bot API** | Called over plain `fetch`, no SDKs. |

## Rendering model

`output: 'static'` with per-route opt-out. Almost every page is prerendered;
`src/pages/api/**` sets `export const prerender = false`.

**Do not flip `output` to `'server'`.** It would make every page a Worker
invocation for no benefit. Astro's old `'hybrid'` mode no longer exists —
static-plus-opt-out *is* hybrid.

**But at least one route must opt out.** A build where every route is
prerendered ships no Worker at all, and the bindings, the session store and the
API endpoints silently cease to exist. The form endpoints keep the Worker alive.

## Accessing Cloudflare from Astro

The old `Astro.locals.runtime` accessors were **removed** in adapter v13. They
are not deprecated — they are defined as getters that throw.

| What you want | How to get it |
|---|---|
| Bindings, env vars, secrets | `import { env } from 'cloudflare:workers'` |
| Request geo (`cf` object) | `Astro.request.cf` |
| `ExecutionContext` (`waitUntil`) | `Astro.locals.cfContext` |
| Cache API | the global `caches` |

```ts
import { env } from 'cloudflare:workers'
import type { APIContext } from 'astro'

export const prerender = false

export async function POST(context: APIContext) {
  const { results } = await env.DB.prepare('SELECT 1').all()
  context.locals.cfContext.waitUntil(somethingSlow())
  return Response.json({ results })
}
```

Secrets are declared for TypeScript in `src/types/cloudflare-env.d.ts`, on
`Cloudflare.Env` — *not* the global `Env`, which is a separate declaration.
`wrangler types` regenerates `worker-configuration.d.ts` and would overwrite
anything added there.

## Images

```js
imageService: { build: 'compile', runtime: 'cloudflare-binding' }
```

Local images are optimised at build time — zero runtime cost, which is what a
static site wants. The adapter's own default is `cloudflare-binding`, which
pushes every transform to request time.

## Fonts

Self-hosted and subset by Astro's built-in `fonts` config. No request ever
leaves for a third-party font CDN.

`subsets` defaults to `['latin']` alone, so every family that carries Cyrillic
asks for `cyrillic` **and** `cyrillic-ext` explicitly — most Kazakh letters live
in the latter.

The display family is a pair, not a splice: Space Grotesk carries Latin and has
no Cyrillic whatsoever, so Onest sits behind it in the stack. Measured cap
heights agree to within 1%, so no `size-adjust` is needed. Run
`pnpm check:fonts` after any change to the type stack — it reads each font's
real glyph table rather than trusting subset labels. See
[docs/research/font-coverage.md](research/font-coverage.md).

## Forms

One endpoint, `POST /api/submit/[kind]`, for all five forms. Checks run
cheapest-first so abusive traffic costs as little as possible:

```
1. known form kind                          free
2. honeypot                                 free
3. Zod validation                           free
4. rate limit                               one indexed D1 write
5. Turnstile siteverify                     one outbound request
6. INSERT into D1
7. respond
8. ctx.waitUntil( Resend + Telegram + optional webhook )
```

Things that bite:

- Turnstile tokens are **single-use** and expire in ~5 minutes. Verify once, and
  reset the widget after every attempt — a replay returns `timeout-or-duplicate`
  and the user sees an error they cannot act on.
- The siteverify response field is `error-codes`, hyphenated.
- D1 placeholders are positional `?`. Named `:params` are not supported.
- `batch()` is the only transaction primitive; you cannot send `BEGIN`/`COMMIT`.
- Telegram answers HTTP 200 with `{"ok": false}` for many failures — check the
  body, not the status. Its URL has no slash after `bot`.
- `waitUntil` gets ~30 seconds. Use `Promise.allSettled`, never `Promise.all`,
  so one failing notifier does not hide the others.
- Client IPs are hashed before they reach `rate_limits`. No address is stored.

Resend is called over REST rather than through its SDK: the SDK needs
`nodejs_compat`, which this Worker does not otherwise require, and the REST call
is four lines. Note REST uses snake_case (`reply_to`) where the SDK uses
camelCase — mixing them silently drops the field.

## Deployment

```bash
pnpm build && pnpm exec wrangler deploy
```

**Custom domains are configured in the Cloudflare dashboard, not in
`wrangler.jsonc`.** `@astrojs/cloudflare` regenerates the deploy config into
`dist/server/wrangler.json` at build time with an empty `triggers` block, and
`wrangler deploy` uses *that* file. Routes declared in the source config are
silently dropped. Domains attached in the dashboard persist across deploys.

Attached: `qairuhub.com` and `www.qairuhub.com`, plus
`qairuhub-website.tairkaldybayev.workers.dev`.

### DNS

The zone is on Cloudflare (nameservers `vern`/`leia.ns.cloudflare.com`,
delegated from Namecheap). The domain previously served Namecheap's parking page
and answered **522** on the apex and **525** on www; those two records were
removed so the Worker could take the hostname.

The five `MX` records and the SPF `TXT` are Namecheap email forwarding. **Leave
them alone** — deleting them silently breaks mail for the domain.

### Continuous deployment

The `Deploy` workflow is **gated off by default** and skips rather than fails.

The API token it would need can edit Workers, KV, D1, R2 and Pages across the
entire Cloudflare account — which hosts more than this site — and this
repository is public. That is a deliberate decision, not a default. Until it is
made, deploy from a machine that is already logged in:

```bash
pnpm run deploy:prod
```

To turn it on:

1. Cloudflare → My Profile → API Tokens → Create Token → **Edit Cloudflare
   Workers** template, scoped to this account only.
2. GitHub → Settings → Secrets and variables → Actions:
   - secret `CLOUDFLARE_API_TOKEN`
   - secret `CLOUDFLARE_ACCOUNT_ID` = `aefda65292e1c46cd3d2c93049b66b03`
   - **variable** `CD_ENABLED` = `true`

The job checks both secrets before building and fails with a readable message if
either is missing, and curls the live site afterwards — a deploy that reports
success while the site is down is worse than one that fails loudly.

An alternative worth considering is **Cloudflare Workers Builds**, which
connects the repository on Cloudflare's side and stores no credential in GitHub
at all, and gives per-pull-request preview URLs. It costs a GitHub App
installation instead.

### Secrets

Set with `wrangler secret put <NAME>`, or in the dashboard under
Settings → Variables and secrets. None of them belong in the repository.

| Secret | Needed for | Set? |
|---|---|---|
| `TURNSTILE_SECRET` | form submission | ✅ |
| `RESEND_API_KEY` | notification email | not yet |
| `NOTIFY_EMAIL_FROM` / `NOTIFY_EMAIL_TO` | notification email | not yet |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Telegram notifications | not yet |
| `N8N_WEBHOOK_URL` | optional automation | not yet |

`PUBLIC_TURNSTILE_SITEKEY` is deliberately **not** a secret: it is rendered into
the page and visible in source, so it lives in `src/lib/site.ts` where builds
can reproduce anywhere without configuration.

Until the notification secrets are set, submissions are still stored in D1 —
`notify()` reports each channel as "not configured" and nothing is lost.

### Database

```bash
pnpm db:migrate:local     # local dev database
pnpm db:migrate:remote    # production
```

Wrangler v4 requires an explicit `--local` or `--remote`. Forgetting it on a
deploy step means migrating the wrong database.

## Verification

| Command | Checks |
|---|---|
| `pnpm check` | typecheck, lint, attribution guard, cobalt law, unit tests |
| `pnpm e2e` | design law across every route, at three breakpoints |
| `pnpm check:fonts` | Kazakh glyph coverage (needs network) |
| `pnpm shots` | full-page renders at 375 / 768 / 1440, both themes |

`/dev/glyphs` renders every family against the Kazakh letters and is `noindex`.

## Things that changed recently and break old advice

- `Astro.locals.runtime.*` — removed, throws.
- `platformProxy` — removed. `astro dev` runs real `workerd`, so it is obsolete.
- Cloudflare **Pages** — not supported by this adapter at all.
- `output: 'hybrid'` — gone; static + per-route opt-out replaces it.
- `compatibility_date` — derived from the local workerd. Do not paste a date
  from a tutorial; one ahead of your workerd breaks the dev server.
- Astro 7 uses **Zod v4** (`astro/zod`). The `z` re-export from `astro:content`
  is deprecated and goes away in Astro 8.
