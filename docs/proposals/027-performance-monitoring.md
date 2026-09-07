---
title: Make the performance budget falsifiable, then print the bytes
status: draft
area: platform
effort: S
depends_on: []
---

# 027 — Make the performance budget falsifiable, then print the bytes

| | |
|---|---|
| **Status** | draft |
| **Area** | platform |
| **Effort** | S |
| **Depends on** | Nothing |

## Problem

`docs/DESIGN.md` §15 states a budget — LCP under 1.8 s, under 100 KB of
JavaScript on content routes — and nothing in `pnpm check`, `pnpm e2e` or
`.github/workflows/ci.yml` reads a byte of `dist/`. The design-law suite asserts
twelve rules over eleven routes at three breakpoints; not one of them is a size.

Everything below was measured from this repository's `dist/client` on
2026-09-07, brotli quality 11.

| | raw | brotli q11 |
|---|---|---|
| `page.8BiJFkSw.js` — every route | 2,542 | **973** |
| `client.B2huqpV0.js` — the React renderer | 184,100 | **49,564** |
| `react.Q2GtEPr4.js` | 7,607 | **2,612** |
| `ApplyForm.BwH7tCS3.js` | 5,730 | **1,893** |
| `form-kit.BZ_TdtWU.js` | 4,127 | **1,608** |
| `RsvpForm.DVPL-FU1.js` — referenced by no built page today | 2,034 | **830** |
| `Base.Blro5T9K.css` — one sheet, linked by every route | 28,849 | **5,682** |
| twelve `.woff2`, all twelve preloaded on every page | 213,444 | — |
| per-route HTML | 20,204–35,347 | **3,306–5,599** |

Five things fall out. Three of them break the shape of check this proposal
originally described.

**The budget does not say which unit it means.** `/apply` references 204,106
bytes of JavaScript uncompressed and 56,650 compressed — one twice the budget,
the other just over half of it. Whichever number DESIGN.md meant, the sentence
cannot be enforced until it says.

**Route classes are not a fixed list, and a hardcoded one would fail the
build.** `src/pages/apply/accelerator.astro` renders `<ApplyForm client:load />`
only inside `open ? … : …`, where `open = isIntakeOpen(accelerator, now)`. The
intake is closed, so the built `dist/client/apply/accelerator.html` contains no
`<astro-island>` at all and pulls the same 973 bytes as `/about`. Any
`ROUTES = { form: [… 'apply/accelerator'] }` map is wrong today and would go
from wrong to *red* on the evening a volunteer opens the intake — a build
failure caused by editing content, which is the exact failure mode this proposal
claims to avoid. Classification has to be derived from the built HTML, never
declared.

**The numbers above describe an empty site.** Every entry in `src/content/**` is
`placeholder: true`, and `src/lib/content.ts` filters placeholders out of
production builds, so the build emits **no `[slug]` page at all**: no
`/events/…`, no `/projects/…`, no `/docs/…`. `src/pages/events/[slug].astro`
carries `<RsvpForm client:visible />`, which is why `RsvpForm.js` exists in
`_astro/` while no HTML references it. These are floor numbers for a site with
one page per section and no images. Say so, or the first real content drop reads
as a regression.

**The largest script on a content route is not ours.** Cloudflare injects its
Web Analytics beacon at the edge:
`<script src="https://static.cloudflareinsights.com/beacon.min.js/v31edd6df…"
data-cf-beacon='{"version":"2024.11.0","token":"…","r":1,"spa":2}'>`, verified on
`/`, `/about` and `/apply`. Two caveats the earlier draft skipped. Injection is
conditional on the request: a bare `curl` with no `Accept: text/html` gets the
un-injected 35,347-byte `index.html` byte-for-byte identical to `dist/`, so
"verified in the live HTML" depends on how you asked. And it is served **gzip,
not brotli** — 30,294 bytes at `Accept-Encoding: identity`, 10,125 with
`Content-Encoding: gzip`, and the origin returns the same 10,125 when brotli is
offered. It is ten times `page.js` and no build-time check can see it.

**If LCP misses, it will be the fonts — and §15 describes fonts we do not
ship.** Twelve `.woff2` totalling **213,444 bytes**, every one `rel="preload"`
on every page: twenty times the JavaScript on a content route, competing for the
first round trips with the thing LCP measures. §15 says "preload the two faces
used above the fold" and "every face gets a metric-matched local fallback
(`size-adjust` / `ascent-override`)". Neither is true of the build — twelve
preloads, no `size-adjust` anywhere in `astro.config.mjs` or `src/styles`. The
unit ambiguity is not the only thing wrong with that section.

Two corrections to assumptions in the brief. **Astana is not far from the
edge:** `https://qairuhub.com/cdn-cgi/trace` from this machine returns
`colo=NQZ`, `loc=KZ`, and Cloudflare
[lists data centres](https://www.cloudflare.com/network/) in Aktobe, Almaty and
Astana. Repeated TTFB measurements land between roughly 40 and 95 ms and move
run to run — a range, not three quotable figures. What is far away is the last
mile: LTE in a lecture-hall basement, a cheap Android. A European CI runner
misleads because of its CPU and its link, not its geography.

**And per-route bytes are not what a student downloads.** `astro.config.mjs`
sets `prefetch: { prefetchAll: true, defaultStrategy: 'viewport' }`, and
`page.js` *is* that prefetcher — 973 bytes whose job is to fetch the HTML of
every link that scrolls into view. It skips only `saveData` and `effectiveType`
containing `2g`; ordinary LTE gets the full behaviour. A per-route byte count is
therefore a lower bound on real transfer, and no honest budget check can claim
otherwise.

## Prior art

- **[Lighthouse CI configuration](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md)**
  — Apache-2.0, free. Steal the assertion vocabulary,
  `"resource-summary:script:size": ["error", {"maxNumericValue": 250000}]`, and
  the trap the docs name themselves: `maxNumericValue` is in **bytes** while
  `budget.json` is in **kilobytes**. Do not take the server, the dashboard, or a
  per-PR browser run whose numbers move between runs on a shared runner.
- **[Lighthouse throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md)**
  — "Slow 4G" is 150 ms RTT, 1.6 Mbps down / 750 Kbps up, 4× CPU, and the default
  method is *simulated*, extrapolated from an unthrottled load. A fixed preset,
  not a survey of Kazakh mobile networks.
- **[Cloudflare Web Analytics — Core Web Vitals](https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/)**
  and **[dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/)**
  — LCP, INP and CLS. The docs say the Debug View shows p75 by default and
  exposes p50, p90 and p99 on an expanded element; the filterable dimensions are
  country, host, path, referer, device type, browser, operating system, site,
  exclude-bots and navigation type. "Currently, Cumulative Layout Shift is only
  supported in Chromium browsers, Firefox and Safari have not implemented support
  for the Layout Instability API." Already installed, already cookieless.
- **[Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/analytics/faq/web-analytics/)**
  — "you can access data for the previous six months"; "We retain unsampled
  beacon data for the past 7 days, after this point data is aggregated down to
  around 10%"; query-time sampling "between 0.0001% and 100%" chosen dynamically.
  These limits are the reason for the STATUS.md habit below.
- **No documented GraphQL dataset for this data.** The
  [datasets page](https://developers.cloudflare.com/analytics/graphql-api/features/data-sets/)
  explains the naming convention rather than enumerating nodes, and nothing under
  `developers.cloudflare.com/analytics/llms.txt` names a RUM or browser-performance
  node. A `perf:report` script is therefore **not** a known query — it is an
  [introspection](https://developers.cloudflare.com/analytics/graphql-api/features/discovery/introspection/)
  exercise that may come back empty. Treated as unproven below, not as a plan.
- **[web-vitals](https://github.com/GoogleChrome/web-vitals)** — "tiny (~3K,
  brotli'd)", attribution build larger "by about 1.5K, brotli'd"; `sendBeacon`
  flushed on `visibilitychange`. The pattern to copy if we ever build our own.
- **[CrUX methodology](https://developer.chrome.com/docs/crux/methodology/)** —
  a page or origin needs "a minimum number of visitors"; "An exact number is not
  disclosed". A student club will not meet it, so PageSpeed Insights' field-data
  panel stays empty for qairuhub.com. Not a failure; just not something to plan
  around.
- **[Workers Analytics Engine pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)**
  — "Currently, you will not be billed for your use of Workers Analytics Engine."
  Free plan: 100,000 data points written and 10,000 read queries per day. Paid:
  10 M writes/month then $0.25 per additional million, 1 M read queries/month then
  $1.00 per additional million. Our own RUM pipeline would cost nothing in money —
  which is why the case against it has to be made on other grounds. And
  [GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
  "is free for self-hosted runners and for public repositories that use standard
  GitHub-hosted runners", so CI time is not the constraint either. Maintainer
  attention is.

## Proposal

**Step 0 — fix `docs/DESIGN.md` §15. Thirty minutes, no code, and it is the only
part of this proposal that is unambiguously worth doing.** Three sentences are
currently unenforceable or false:

- *Unit.* "< 100KB JS on content routes" becomes: **under 100 KB means
  brotli-compressed JavaScript referenced by that route's built HTML,
  first-party plus edge-injected.**
- *Preload.* "preload the two faces used above the fold" becomes what the build
  does: twelve subset faces, all preloaded. Either change the sentence or change
  the config — but a design document that describes a font strategy the build
  does not implement is worse than no sentence at all.
- *Fallbacks.* Drop the `size-adjust` / `ascent-override` claim, or implement it.
  `astro.config.mjs` names fallback stacks with no metric overrides, and
  `docs/ARCHITECTURE.md` argues none are needed.

Until §15 says something testable, everything below is enforcing a guess.

**Step 1 — `scripts/check-budget.mjs`, and it *prints* before it *fails*.** Not
Lighthouse. A plain Node script that walks `dist/client/**/*.html`, resolves what
each page references, brotli-compresses it, and prints a table. Deterministic, no
browser, well under a second. It answers the question the budget asks — *how
many bytes does this route pull?* — rather than Lighthouse's, which is *what did
a simulated phone score on a shared runner this time*.

Three constraints the earlier draft got wrong.

*Derive the class; do not declare it.* A route's class is a property of its built
HTML: a page containing `<astro-island>` is a form route, a page without one is a
content route. `/apply/accelerator` is a content route today and becomes a form
route the day the intake opens, without a line of code changing. A literal
`ROUTES` map encodes today's content as tomorrow's build failure.

*Walk the island attributes.* Follow `<script src>`, stylesheet `href`, and the
`component-url` / `renderer-url` attributes on `<astro-island>` — that last pair
is the only path from `/apply` to `client.B2huqpV0.js`, and a naive
`<script src>` grep misses 184 KB of React entirely. (`<link rel="modulepreload">`
appears nowhere in the current build; handle it if it shows up, do not assume it.)

*Run it after the build, not inside `pnpm check`.* `check` is
`typecheck && lint && guard:attribution && guard:cobalt && test:run` — no build.
`.github/workflows/ci.yml` runs `pnpm run check` and *then* `pnpm run build`.
Appending `guard:budget` to `check` would read a stale `dist/` locally and an
absent one in CI. It belongs in a new `pnpm run guard:budget` invoked as its own
CI step after `Build`, where the artifact already exists.

**Step 2 — turn the print into a ceiling, once there is a second reading to
compare against.** A baseline in `perf-budget.json`; a growth warning that does
not block; and one absolute ceiling per class that does. Both numbers are set
from real measurements, not from §15's round number:

```jsonc
// perf-budget.json — brotli q11 bytes, from dist/client, recorded 2026-09-07.
// "content" = no <astro-island>. "form" = at least one.
{ "content": { "js":   1_500, "css": 6_500, "html":  6_500 },
  "form":    { "js":  60_000, "css": 6_500, "html":  6_500 },
  "fonts":   { "preloadedTotalRaw": 220_000 },
  "thirdPartyJs": { "cloudflare-beacon": 10_125 } }
```

The beacon constant is edge-injected, outside the build, and **gzip**:

```sh
curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}\n' \
  https://static.cloudflareinsights.com/beacon.min.js
```

**Bundle assertions in the existing Playwright suite: rejected.** Tempting — the
suite visits eleven routes at three breakpoints — but `playwright.config.ts`
boots `pnpm dev`, and `astro dev` serves unbundled, unminified, uncompressed
modules, so its byte counts are fiction. Making them real means pointing
`E2E_BASE_URL` at `astro preview`, and `docs/STATUS.md` already records that the
suite cannot reliably start its own server here. One cheap assertion still earns
its place in `tests/e2e/smoke.spec.ts`: a content route may issue at most **two**
script requests, which catches an island landing on the wrong page and does not
care about size.

**Step 3 — read what Cloudflare already collects, if it can be read.** The
beacon is live and reporting LCP, INP and CLS with country, path and device type.
The work would be a habit, not a pipeline: a `pnpm perf:report` that POSTs to
`https://api.cloudflare.com/client/v4/graphql` and prints p75 LCP for `KZ` on
mobile against the 1.8 s line, run monthly, pasted into `docs/STATUS.md` so the
history outlives the six-month window and the ~10 % aggregation after day seven.

**This step is unproven and must be spiked before it is scheduled.** Cloudflare
documents no RUM or browser-performance GraphQL node. The first hour is
introspection against the real schema with a read-only token; if no such dataset
is exposed, the honest outcome is a `docs/STATUS.md` line reading *"field numbers
are dashboard-only; no scripted export exists"* and the step is deleted. Do not
write the script before the schema answers.

One correction while we are here: `"r":1` in the beacon config is widely read as
"sample rate 1", but Cloudflare documents no such field. This proposal does not
claim the beacon samples at 100 %; it claims we do not know, and that the query
result — if there is one — must carry its sample rate with it.

**Our own RUM beacon: rejected.** Money is not the objection — Analytics Engine
is free at this volume. It adds ~3 KB on top of the 10 KB already there, needs an
`/api/vitals` route with `prerender = false` and therefore spam defences, and
turns a cookieless aggregate into a per-visit row in a project that deliberately
hashes client IPs before they reach `rate_limits`. Revisit only for what
Cloudflare cannot serve: per-element LCP attribution, which
`web-vitals/attribution` gives and the beacon does not.

## Scope

1. **`scripts/check-budget.mjs` + the unit definition in DESIGN.md.** Half a day.
   This is the version worth shipping alone.
2. **`perf-budget.json` baseline, the 5 % growth warning, and a `budget` step in
   `.github/workflows/ci.yml` after `pnpm run build`.** An hour.
3. **`pnpm perf:report` + the STATUS.md table.** Half a day, then ten minutes a
   month.
4. **Not now:** Lighthouse CI against `astro preview`, nightly rather than
   per-PR, and only if step 3 finds a field regression the budget missed.

## Data and schema

None. No change to `src/content.config.ts`, no D1 migration, no new binding, no
CSP change — `connect-src 'self'` already covers everything here and no new
origin is contacted from the page.

New files: `scripts/check-budget.mjs`, `perf-budget.json`. New scripts:
`guard:budget`, appended to `check`, and `perf:report`. Phase 3 needs a
Cloudflare API token scoped to **Account Analytics: Read** — and per
`docs/ARCHITECTURE.md` the deploy token is deliberately absent from GitHub, so
this one stays on the maintainer's machine too.

## Design

Platform, not page. Nothing renders. The only surface is terminal output, and it
should read the way `check-cobalt.mjs` reads: mono, one line per route class, the
number and the headroom, no colour that is not carrying meaning. No dashboard —
if a number ever reaches a page it is one line in the colophon register.

The empty state matters more than usual. Below 100 samples, `perf:report` prints
`not enough data` and no number: a p75 from twelve pageviews is an invented
statistic, and this site does not invent.

## Risks and trade-offs

- **A byte ceiling invites the wrong fix.** The cheapest way to make room is to
  drop a font subset, and `cyrillic-ext` is where Ә Ғ Қ Ң Ө Ү Һ live. The font
  budget is set at 220,000 — 6.5 KB above today's 213,444 — so trimming Kazakh is
  never the path of least resistance, and `pnpm check:fonts` stands behind it.
- **Our brotli is not Cloudflare's brotli.** We compress at quality 11; the edge
  may not. The number is a consistent floor, not the delivered byte count — say
  so in the script header.
- **The build cannot see the edge-injected beacon.** It is a hand-measured
  constant with a date on it; if Cloudflare doubles the beacon, CI will not tell
  us. Accepted, and the re-measure command sits in the file.
- **Free things change.** Retention, aggregation and sampling are Cloudflare's
  choices; copying p75 into STATUS.md is the hedge. Low traffic also makes the
  field numbers noisy — read p75 monthly, and refuse to act on a single week.
- **This is not monitoring.** Nothing here pages anyone; if the site 500s at
  03:00 no one is told. Calling a budget check monitoring would be exactly the
  dishonesty the platform rule forbids. Uptime and errors are a separate
  proposal.

## Success

The budget check fails at least once, on a real pull request, before any human
notices — that is the only proof it is doing work rather than decorating the
workflow.

Twelve months in, `docs/STATUS.md` holds twelve monthly rows of p75 LCP for KZ
mobile, and either the number stayed under 1.8 s or we can name the month it
stopped and the change that did it.

Remove the guard if a year of readings shows the field number never moved
whatever the bundle did: the ceiling would then be enforcing an idea rather than
an outcome, and the honest move is to keep the reading and delete the check.

## Effort

**S.** Phases 1 and 2 are a day for someone who has read
`scripts/check-cobalt.mjs`, which is the same shape of program. Phase 3 adds half
a day plus ten minutes a month, and is the part most likely to rot — which is why
it writes a row into version control instead of opening a dashboard.

No dependencies. Write the budget script before `/kk` and `/ru` ship: a second
locale triples the routes to walk.
