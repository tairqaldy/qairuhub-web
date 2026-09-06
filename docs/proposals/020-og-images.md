---
title: Typeset the share card, because the link lands in Telegram first
status: draft
area: design
effort: S
depends_on: []
---

# 020 — Typeset the share card, because the link lands in Telegram first

| | |
|---|---|
| **Status** | draft |
| **Area** | design |
| **Effort** | S |
| **Depends on** | — |

## Problem

`Base.astro` emits `og:image` only when a page passes an `image` prop. No page passes one,
and `public/` holds two favicons and nothing else. So every link to qairuhub.com pasted
into a Telegram chat renders as a grey text stub: title, one line of description, the
domain. The site's whole argument — a printed record set in Onest and Geist Mono on warm
near-black — reaches the reader as system font on Telegram grey.

**Twelve public routes exist today** — the list in `scripts/shots.mjs`. Every entry in
`src/content/` is still `placeholder: true` and excluded from production builds, so there
are no event, project, person or note detail URLs to share at all. The link a member
actually forwards is `/events`, `/apply` or `/`. This is a twelve-file problem, not a
forty-file one, and the scope below is sized to that.

Telegram makes the mistake expensive to correct. Its crawler caches a preview per page URL
with [no documented TTL — in practice indefinitely](https://opengraphplus.com/consumers/telegram/caching),
and **messages already sent keep their original preview permanently**; refreshing through
`@WebpageBot` (`/updatepreview <url>`) affects new shares only. Every day this ships later
is a permanent bare card in someone's chat history — and every card shipped *wrong* is
permanent in exactly the same way. The permanence cuts both directions, which argues for a
small card that is right rather than a clever one that is not.

## Prior art

**[GitHub's repository card service](https://github.blog/engineering/architecture-optimization/framework-building-open-graph-images/)**
— Puppeteer screenshotting an HTML template: **~280 ms average**, **~2 million unique
images a day**, **40% served from cache**. Their big win was memory — Chromium treats a
device under 512 MB as low-spec and serialises work, so 512 MB → 1 GB bought ~500 ms.
*Steal:* the framing that a card is a *template over structured data*, one per content
type, not a poster — **and the mechanism.** Two million a day justifies a service; twelve
URLs render in under five seconds on a laptop. *Leave:* the service.

**[Satori](https://github.com/vercel/satori) and
[`@vercel/og`](https://vercel.com/docs/og-image-generation)** — HTML/CSS to SVG to PNG, no
browser. Verified constraints: *"Satori currently supports three font formats: TTF, OTF and
WOFF. Note that WOFF2 is not supported at the moment"*; flexbox only, no `display: grid`,
no `calc`; a 500 KB bundle ceiling on Vercel. *Steal:* the 1200×630 default, and Vercel's
own advice to `Allow` the image route in `robots.txt`. *Leave:* the engine. Each of those
constraints is a tax paid to avoid a browser this repository already has installed.

**[kvnang/workers-og](https://github.com/kvnang/workers-og)**,
**[jillesme/cf-workers-og](https://github.com/jillesme/cf-workers-og)** and
**["6 Pitfalls of Dynamic OG Image Generation on Cloudflare Workers"](https://dev.to/devoresyah/6-pitfalls-of-dynamic-og-image-generation-on-cloudflare-workers-satori-resvg-wasm-1kle)**
— what running Satori on Workers actually costs. The first port exists because *"the way
WASM is bundled is different and causes an error when using `@vercel/og` on a Worker"*; the
second is better maintained but ships a **bundled Roboto fallback**, which breaks §5.1
silently rather than failing loudly. The pitfalls piece is the rest: Workers block dynamic
WASM compilation, Satori's image fetching silently fails there, `satori-html` chokes on
data URLs around 400–500 KB, there is no WebP decoder, `node:buffer` is unavailable in the
Vite SSR build. Not six papercuts — the standing cost of a second renderer inside a runtime
that does not want one. *Leave: all of it.*

**[Jilles Soeters on build-time vs runtime OG in Astro](https://jilles.me/og-images-astro-build-vs-runtime/)**
— argues for runtime, because cards *"are requested by social platforms and heavily cached,
so runtime generation typically runs once per cache window"* — and names the exception
himself: build time is right when you need **real browser screenshots**, or CSS beyond
Satori's subset. Both apply here. *Steal:* the exception, not the conclusion.

## Proposal

**One Astro route renders the card in the site's own CSS; Playwright screenshots it; the
PNGs are committed.**

- **`src/pages/dev/og.astro`** — a `noindex` gate under the already-`Disallow`ed `/dev/`,
  rendering each card at exactly 1200×630 in the real stylesheets: the real `--paper` /
  `--ink-*` / `--rule` tokens, the real `@font-face` woff2, the real `m-eyebrow` and
  `m-label` classes. It gets looked at the way every other page gets looked at.
- **`scripts/build-og.mjs`** — the same `chromium.launch()` block `scripts/shots.mjs`
  already runs, `clip`ped to each 1200×630 element, writing `public/og/<route>.png`. Run by
  hand as `pnpm og` when a title changes.
- **`Base.astro`** gains a computed default: `ogImage` falls back to `/og/<route>.png`,
  plus `og:image:width` 1200, `og:image:height` 630, `og:image:alt`, and
  `twitter:card: summary_large_image` unconditionally rather than conditionally.

The images live at `/og/`, not `/api/`: `public/robots.txt` carries `Disallow: /api/`, and
a disallowed OG route is an invisible OG route. Vercel's own docs say the same thing.

**No new dependencies.** `@playwright/test` is already a devDependency and chromium is
already installed for `tests/e2e`. No Satori, no resvg, no yoga-layout, no WASM, no Worker
invocation, no font-subsetting script, no second colour system — and, the point, **no
second renderer that can drift from the site.** The card cannot lose a Kazakh glyph the
site has, because it loads the same font file; it cannot drift from a token, because it
reads the token.

Committing the PNGs rather than generating them inside `astro build` costs the build
nothing, needs no chromium in the deploy path, and makes every card a **reviewable image
diff**. Telegram's cache is permanent, so a card should be seen by a human before it
becomes unfixable — not rendered by CI after merge.

## Scope

**Phase 1 — one card type, twelve URLs.** A single `page` template over the twelve routes
in `scripts/shots.mjs`; its eyebrow is the route's `NAV` numeral where it has one. Plus
`Base.astro`, the `_headers` entry, `pnpm og`, and one Playwright assertion that every
route's `og:image` resolves to a file that exists. Then one pass of `@WebpageBot`.

That is the whole of the useful part: twelve routes, one template, one screenshot script.

**Phase 2 — a type per collection** (`event`, `project`, `note`, `person`), each added when
the first non-placeholder entry of that collection ships a detail page, and **not before**.
Building four templates for four collections that currently render zero public URLs is
precisely the thin-content failure §7.4 exists to prevent.

**Phase 3 — runtime rendering**, only with evidence that cards are being shared *and* that
a fact on one is genuinely stale between builds. It needs Workers Paid and a different
renderer, and it is a separate proposal.

**Not proposed:** animated cards, a card editor, `og:image` on `/dev/*`, or embedding a
photograph — §7.2 photographs do not exist, and a card must never fake one.

## Data and schema

No `content.config.ts` change, no D1 migration, no generated artefact, no font pipeline.
The card is HTML: it reads `SITE`, `NAV` and the title `Base.astro` already computes.

The Kazakh trap on the Satori path — a Latin-only subset silently rendering
`Ұйымдастырушылық` as boxes, unnoticed until a Kazakh page is shared — does not arise here.
The card is drawn by the browser from the same woff2 the page uses, under the same
`unicode-range` rules, already covered by `pnpm check:fonts` and `/dev/glyphs`. There is
nothing new to subset and nothing new to test. There is also no Kazakh page yet: `LOCALES`
in `src/lib/site.ts` publishes `en` only. When `kk` ships, the card ships with it for free,
including §5.4's `:lang(kk)` eyebrow adjustment, because that rule is already in the CSS
the card renders in.

## Design

**Register: RECORD, not PLATE.** The card is a ruled row blown up to 1200×630, not a
poster. It carries no photograph until photographs exist, and never fakes one. Dark polarity
only — Telegram draws it on its own ground, so the card commits to one edition.

Every size below is the site's own furniture *scaled* so the card reads at thumbnail size,
not a new type ramp; every colour is `var(--token)`, because this is real CSS in the real
stylesheet.

| Element | Spec |
|---|---|
| Canvas | 1200 × 630, ground `var(--paper)`, radius 0, 56px padding |
| Spine | 1px `var(--rule)` at x=144, y=56→574 — the rail's `border-inline-end`, quoted. Well runs x=176→1144 |
| Rail | section numeral, Onest 700 56px, `var(--ink-4)` — §14 permits it at ≥24px |
| Masthead | `Qairu` Onest 600 26px `var(--ink-1)` at -0.02em · 1px `var(--rule-2)` vertical, 8px each side · `HUB` Geist Mono 500 22px at 0.08em, baseline aligned (§10.1). Closed by the 2px `--rule-2` at y=140 |
| Eyebrow | `02 — EVENTS`, Geist Mono 500 17px / 0.14em, `var(--ink-3)` |
| Title | Onest 600 68px / 0.98 / -0.025em, `var(--ink-1)`, max 3 lines |
| Foot | 1px `var(--rule)` at y=500; below it Geist Mono 22px tabular — fact left, state token right |

**The eyebrow is a fact or it is absent.** Seven routes carry a `NAV` numeral
(`01 — PROGRAMMES` … `07 — CONTACT`). `/`, `/about`, `/apply`, `/apply/accelerator` and
`/404` carry none, and get no eyebrow rather than an invented one — §16, *every mono string
is a fact you could check*.

**The foot carries a fact, not a motto.** `LEARN IT. BUILD IT. LAUNCH IT.` is a standing
motto set under the nameplate (§1); alone on a share card it is exactly the hero slogan
floating in space that §1 forbids. The foot carries the colophon line —
`QAIRUHUB · QAZAQ AI RESEARCH UNIVERSITY · ASTANA` — or nothing.

**Cobalt.** At most one per card, and only §8.2 #8: a state token that is actionable *now*
— `WALK IN, NO APPLICATION`, `APPLICATIONS OPEN` — in `var(--cobalt-text)`. `CLOSED`,
`PAST`, `ARCHIVED` are `var(--ink-3)`. No cobalt fill, no cobalt rule, none in the wordmark
or the title. In Phase 1 only `/events` and `/apply` can carry one, and only while the
underlying fact is true; every other card carries none.

**Surviving the lint — by obeying it.** `check-cobalt.mjs` forbids `var(--cobalt` outside
`global.css` and `components.css` and restricts it inside them to `ALLOWED_SELECTORS`. The
card's state token is `.state--live`, already on that list. No new lint rule, no
`HEX_ALLOWLIST`, no hardcoded hex, no hex-parity test. A Satori card would have needed all
four, and DESIGN.md §4 says plainly: **never hardcode a colour in a component.** Not having
to ask for that exception is the strongest single argument for this approach.

**Anti-slop (§16), checked.** No gradient, no scrim, no glow, no radius, no shadow, no
emoji, no logo mark, no glowing brain. No border-plus-padding grouping anywhere — the card
is a ground, three hairlines and type. The rail carries its numeral where one exists. The
wordmark is uncoloured (§10.1). Nothing is centred (§6.1).

**Thumbnail legibility is looked at, not assumed.** Some clients render 1200×630 wide;
others crop toward a square. `/dev/og` shows every card at 1200px and again at 200px beside
a centre-crop guide, and the wordmark plus the first title line must survive both. This is
why the template is a route rather than a script writing straight to disk.

## Risks and trade-offs

**The strongest argument for not doing this at all.** The site has no photographs, no
Kazakh, and twelve routes of which most are indexes rendering `NOT YET PUBLISHED`. A
typeset share card makes a link *look* finished to someone who has not opened it. §7.4's
whole doctrine is that the thin state must be honest rather than dressed, and the share
card is the one surface where the dressing is seen without the substance behind it. If the
same fortnight could instead put one real photograph into one PLATE, or one real event on
`/events`, that is worth more than any card. **Ship this only once there is something on
the other side of the link.**

**Telegram's cache is the deployment risk.** Ship the card wrong and every URL already
shared keeps it permanently; `@WebpageBot` fixes future shares only. Mitigation: the card
is a reviewable image in a pull request, `/dev/og` is looked at before merge, and Phase 1
is twelve files — few enough to check by eye, one at a time.

**`immutable` would be the wrong header.** A card at a stable URL whose title later changes
must be able to change bytes. `public/_headers` gets `/og/*` at
`Cache-Control: public, max-age=86400` — not `immutable`. Telegram is already the permanent
cache layer; stacking a year of browser immutability on top removes the one escape hatch.
(Keep `/_astro/*` out of that file; the Cloudflare adapter appends its own block.)

**Chromium is a real dependency**, even though it is already installed. `pnpm og` needs
`playwright install chromium` on a fresh clone, and a browser upgrade could move a hairline
by a subpixel. Because the PNGs are committed, that surfaces as a diff in a pull request
rather than silently in production — the correct place for it.

**Committed binaries grow.** Twelve PNGs under 100 KB is about 1 MB in the repository, and
it scales with the route count. Somewhere around fifty routes this stops being reasonable
and Phase 3's endpoint starts to.

**What this gives up: the runtime path.** An Astro `.png.ts` endpoint could later flip to
`prerender = false`; a screenshot script cannot. Workers Free allows
[10 ms of CPU per invocation](https://developers.cloudflare.com/workers/platform/limits/)
and any render is orders of magnitude above that, so Phase 3 means Workers Paid
([$5/month, 10M requests and 30M CPU-ms included, then $0.30/M and $0.02/M](https://developers.cloudflare.com/workers/platform/pricing/))
— a $60/year decision on evidence we do not have. That optionality is worth less than the
Satori tax it costs today, and nothing downstream of `/og/<route>.png` knows how the bytes
were made, so Phase 3 is free to change renderer.

**What would make this a bad idea anyway:** if links reach people mostly as forwarded
Telegram *posts* rather than URLs, the preview never renders and this is decoration.

## Success

**The gate, before merge:** all twelve URLs pasted into a real Telegram chat, a real
WhatsApp chat and an OG debugger, and looked at. Each returns a 1200×630 PNG under 100 KB
with a legible wordmark and title at thumbnail size. That is checkable, and it is the only
thing this proposal can honestly promise.

**Explicitly not a success metric:** referrals from `t.me` in Cloudflare Web Analytics.
Telegram's clients frequently strip the referrer, so that number can sit flat while every
card renders perfectly — it cannot distinguish this shipping from it failing.

**Remove it again if** a maintainer has to hand-fix a card, or if a card ever states
something the page it links to does not.

## Effort

**S.** The `/dev/og` route and the card CSS, most of a day — and that day is design, not
plumbing. The screenshot script, an hour: it is `scripts/shots.mjs` with a `clip`.
`Base.astro`, the `_headers` entry and the Playwright assertion, an hour. No new
dependencies, no added build time, and nothing touching the under-100 KB content-route JS
budget, because none of this ships to a browser.
