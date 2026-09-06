---
title: Build an admin console for submissions
status: draft
area: operations
effort: S
depends_on: []
---

# 001 — Build an admin console for submissions

| | |
|---|---|
| **Status** | draft |
| **Area** | operations |
| **Effort** | S for phase 1 (half a day). Later phases are separately decidable. |
| **Depends on** | Nothing in this repository. One free Cloudflare Zero Trust team domain. |

## Problem

QairuHub receives a handful of submissions a week across five forms. Volume is
not the problem; the path to reading one is.

1. **Nothing tells anyone a submission arrived.** `src/lib/notify.ts` implements
   Resend, Telegram and a webhook, but `docs/ARCHITECTURE.md` lists
   `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN` and the rest as *not yet* set, so each
   notifier returns `{ ok: false, detail: 'not configured' }`. Rows land in D1
   silently.
2. **Reading one means holding the keys to everything.** `docs/STATUS.md` gives
   the procedure: `wrangler d1 execute qairuhub --remote --command "SELECT ..."`.
   That needs a login to Cloudflare account `aefda65292e1c46cd3d2c93049b66b03`,
   which `docs/ARCHITECTURE.md` says "hosts more than this site" — the stated
   reason continuous deployment is gated off. There is no way to let a second
   core-team member read applications short of handing over that account.
3. **The site already publishes a cadence.** `/apply` reads "Membership is open
   continuously and reviewed weekly", and DESIGN.md §12.3 requires the lead line
   to state the reply window before the first field. That promise is currently
   kept by one student — the same one who writes the content and sits exams —
   remembering a shell command.
4. **Two functions exist for an admin view that was never built.**
   `listSubmissions()` and `countForEvent()` in `src/lib/db.ts` are called from
   nowhere in `src/` or `tests/`.
5. **`status` has never been written.** Migration `0001` defines
   `CHECK (status IN ('new','reviewing','accepted','declined','spam'))` plus
   `reviewed_at` and `notes`; no code path sets any of them. So `countForEvent()`,
   which counts `WHERE status != 'spam'`, cannot be trusted, and the capacity
   rule of DESIGN.md §10.3 — `18 / 40 ОРЫН`, which renders *only* where a live
   count exists — stays switched off. `src/pages/events/[slug].astro` prints
   `Room holds — 40 people` instead, with a comment saying why. Nothing false is
   on the site. A true thing is unavailable.

## Prior art

**[MOJ Design System](https://design-patterns.service.justice.gov.uk/)** — the UK
Ministry of Justice's components for *internal caseworking*, the closest
published relative of this. The
[filter component](https://design-patterns.service.justice.gov.uk/components/filter/)
puts selected filters at the top as individually removable items: "Clicking on a
selected filter refreshes the page and removes the filter." The
[filter-a-list pattern](https://design-patterns.service.justice.gov.uk/patterns/filter-a-list)
starts the list unfiltered and treats a case list as a table, not a dashboard.
**Steal:** both. **Leave:** the coloured tag palette — a palette of status
colours is cobalt drift under another name (§8.3) — and the GOV.UK front-end.
MOJ also says filters "shouldn't persist across sessions or navigation" by
default; keeping them in the URL here is DESIGN.md §12.1's rule, not theirs.

**[Django Girls](https://github.com/DjangoGirls/djangogirls)** — a volunteer-run
organisation reviewing workshop applications in its own open-source code.
`applications/models.py` defines five application states — `submitted`,
`accepted`, `rejected`, `waitlisted`, `declined` — a separate RSVP state machine
(`RSVP_WAITING / RSVP_YES / RSVP_NO`), and a `Score` model whose help text reads
"5 being the most positive, 1 being the most negative". **Steal:** the state list
*is* the workflow, and `waitlisted` is one we lack and probably want. **Leave:**
the scoring. Averaging reviewer scores is machinery for a hundred applicants, and
a number invites treating a judgement as a measurement.

**[Outreachy](https://github.com/outreachy/website)** — `ApprovalStatus` in
`home/models.py` carries `PENDING / APPROVED / WITHDRAWN / REJECTED` plus a
free-text `reason_denied` field, shown only to organisers. **Steal:** exactly
that — recording *why*, not only *what*. A decline with no reason is unusable
three months later. **Leave:** the eligibility automation. Automatic rejection is
what you build after being overwhelmed once, not before.

**[Hack Club](https://hackclub.com/programs)** — runs ~40 concurrent grant and
event programmes for teenagers ("Every event below is free and open to any teen")
out of Airtable views. Even the internal
[YSWS receipt printer](https://github.com/hackclub/ysws-receipt-printer) is a
thin reader configured with a `PROD_BASE`, `PROD_TABLE` and `PROD_VIEW`.
**Steal:** the shape — the review surface is one filtered view over one table of
records, and the tooling stays thin enough to throw away. **Leave:** Airtable. A
per-seat vendor that would move students' applications out of D1 in EEUR into US
SaaS for no capability we lack.

**[CiviCRM](https://docs.civicrm.org/sysadmin/en/latest/)** — good software whose
*system administrator guide is a book*: "This guide is for people setting up,
maintaining and upgrading a CiviCRM instance for an organization." A student club
that adopts it acquires a second job. **Steal:** nothing. **Leave:** all of it,
and the instinct behind it. What follows is not a CRM: no contacts, no pipeline,
no second table.

## Proposal

Up to four routes, all `export const prerender = false`, behind Cloudflare
Access, each verifying the Access JWT itself. Phase 1 is the first row only.

| Route | Method | Does |
|---|---|---|
| `/admin` | GET | The queue. RECORD table, newest first. |
| `/admin/s/[id]` | GET | One submission: shared columns, decoded `payload`, notes. |
| `/admin/s/[id]` | POST | Set status and notes. A plain form post — no island, no JSON, no JS. |
| `/admin/export.csv` | GET | The current filter, as CSV. |

**Access.** One self-hosted application, domain `qairuhub.com`, path `admin`.
Subpaths inherit: the
[app-paths documentation](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/)
says a rule on a parent applies to children unless a child has its own rule, in
which case "the more specific rule takes precedence" and the parent's is *not*
inherited — so do not add a second, narrower rule for `/admin/s`. The same page
notes Access does not support query strings in an application path, which is why
the filter lives in `?kind=` and the *path* is what is protected. Policy: Allow,
`Emails` listing three or four named core-team addresses. An
`Emails ending in @qairu.edu.kz` rule is tempting and wrong — it admits the whole
university. Login: one-time PIN to email, plus Google. Session 24 hours.
[Free to 50 users](https://www.cloudflare.com/plans/zero-trust-services/).

**The workers.dev hole.** `STATUS.md` records that the Worker also answers on
`qairuhub-website.tairkaldybayev.workers.dev`, which an application scoped to
`qairuhub.com` does not cover — `/admin` would be open there. Add a second
application for that host, and verify the JWT in code. The
[Worker-level Access toggle](https://developers.cloudflare.com/workers/configuration/cloudflare-access/)
would close the hole in one click — it "automatically protects every domain
associated with the Worker, including its routes, Custom Domains, `workers.dev`
hostname, and previews" — and that is exactly why it is wrong here: it would put
a login screen in front of the public recruitment site.

**Why the header, not the cookie.** Access is a proxy in front of an origin that
is still a public HTTP endpoint; a request that never crossed the Access edge
carries no enforcement at all. Cloudflare's own
[validation guide](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
says to validate the `Cf-Access-Jwt-Assertion` header rather than the
`CF_Authorization` cookie, "since the cookie is not guaranteed to be passed".
About forty lines in `src/lib/access.ts`:

```ts
// Fail closed: an unconfigured console is a 503, never an open one.
const jwks = createRemoteJWKSet(
  new URL(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`),
)
const { payload } = await jwtVerify(
  request.headers.get('Cf-Access-Jwt-Assertion') ?? '',
  jwks,                                  // matched by `kid`, never `public_cert`
  { issuer: `https://${env.ACCESS_TEAM_DOMAIN}`, audience: env.ACCESS_AUD },
)
return payload.email as string
```

Any failure returns **404**, not 403: a 403 confirms `/admin` exists.

**Out of search.** `Disallow: /admin` in `public/robots.txt`, beside the existing
`/dev/` and `/api/` lines; `noindex` via the `noindex` prop
`src/layouts/Base.astro` already accepts; and `X-Robots-Tag: noindex, nofollow`
plus `Cache-Control: private, no-store` as response headers, because a CSV
carries no meta tag. Also add `!page.includes('/admin')` to the sitemap `filter`
in `astro.config.mjs` — belt and braces, since a route that is not prerendered
does not reach the sitemap in the first place. None of this is protection.
Access is. It only keeps the URL out of a result page.

## Scope

Each phase ships alone and is worth stopping after.

**Phase 0 — not this proposal, do it first.** `wrangler secret put
TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. `src/lib/notify.ts` is already
written and already called from `waitUntil`; two secrets turn problem 1 off for
zero new lines and zero new attack surface. If a Telegram ping carrying name,
kind and date turns out to be enough, phase 1 is not needed.

**Phase 1 — the smallest useful console.** `GET /admin` only: `access.ts`, plus
`listSubmissions()` finally called, rendered as a RECORD table of date, kind,
name, status. **Read-only. No detail page, no writes, no filters, no CSV, no
migration.** It replaces the `wrangler` command in `STATUS.md` and nothing more.

**Phase 2 — `GET /admin/s/[id]`.** The decoded `payload`, which the list
deliberately does not show. Still read-only.

**Phase 3 — the first write.** `POST /admin/s/[id]` sets `status` and `notes`,
adds migration `0003`, and unblocks the §10.3 capacity rule by making `spam`
reachable. Only worth doing once phase 2 is genuinely being opened.

**Phase 4:** filter chips on `kind` and `status`, CSV export.
**Phase 5, only if 4 is used:** a `waitlisted` state, a structured decline reason
after Outreachy's `reason_denied`.

**Not proposed:** sending email from the console, bulk actions, search inside
`payload`, a counts dashboard, roles beyond the Access policy, editing what a
student wrote, any second table.

## Data and schema

No new table. Phases 1 and 2 need no migration at all — `status`, `notes` and
`reviewed_at` have existed since `0001` and have never been written. Phase 3 adds
one column, so "who moved this" is answerable:

```sql
-- migrations/0003_admin_actor.sql  (phase 3, not before)
ALTER TABLE submissions ADD COLUMN reviewed_by TEXT;  -- Access email of a team member
```

A team member's address, never a student's — the only personal data this
proposal adds.

`src/lib/db.ts` gains `getSubmission(db, id)` (phase 2), then
`setStatus(db, id, status, actor)` — which also sets
`reviewed_at = datetime('now')` — and `setNotes(db, id, text)` (phase 3).
`listSubmissions()` takes `kind` and `limit` today; phase 4 adds `status` and
`offset`. `idx_submissions_status (status, created_at DESC)` already exists and
is the right index; a composite `(kind, status, created_at)` would be premature.

New configuration: `ACCESS_TEAM_DOMAIN` (e.g. `qairuhub.cloudflareaccess.com`)
and `ACCESS_AUD`, both from Zero Trust → Applications → Additional settings.
Neither is secret, but set both with `wrangler secret put` rather than as `vars`
in `wrangler.jsonc`: `@astrojs/cloudflare` regenerates that file into
`dist/server/wrangler.json` at build time and silently drops declared routes
(ARCHITECTURE.md, Deployment), so whether `vars` survive is a thing to test
rather than assume, and a secret avoids the question. Declare them on
`SiteSecrets` in `src/types/cloudflare-env.d.ts` — not
`worker-configuration.d.ts`, which `wrangler types` overwrites.

CSV columns (phase 4): `id, created_at, kind, status, name, email, telegram,
event_slug, country, notes`; `payload` only under `?full=1`. Any cell beginning
`=`, `+`, `-`, `@`, tab or CR is prefixed with `'`, so a motivation field
containing `=cmd|...` cannot execute in a spreadsheet.

## Design

DESIGN.md §12: "Every route is one of these five. A new page type requires a
design decision." Here it is.

**12.6 CONSOLE.** RECORD register (§7.1) and nothing else: hairline rows, mono
metadata, tabular figures, 44px rows, no zebra, no box. Mobile collapses to slips
(§6.5) — triage happens on a phone between classes, so build that first. One mono
head line, `ADMIN · SUBMISSIONS · <email>`, with a sign-out link to
`/cdn-cgi/access/logout`. No masthead, no section index, no colophon.

**The PLATE departure, named.** §7.2 requires *exactly* one photograph per page.
A queue has no photograph and must not invent one, so CONSOLE carries zero. This
needs no test exemption: `design-law.spec.ts` asserts
`expect(plates).toBeLessThanOrEqual(1)` — at most one, not exactly one — and its
`ROUTES` constant is a hardcoded list of eleven public routes that `/admin` is
not in. **Do not add it there**, or the design-law suite needs an Access session
to run. Test the console in its own spec: at 375 and 1440, no `[class*="card"]`,
no `box-shadow`, no radius > 6px, ≤ 1 `.cta-primary`, `--rule-strong` on every
input, and a 404 when the Access header is absent.

**Cobalt.** Phase 1 has no `.cta-primary` at all; zero satisfies "one maximum",
and a read-only list has no primary action. Phase 3's detail page spends its
single fill on the save action. Phase 4's active filter chip is 1px `--cobalt`
border, `--cobalt-text` label, transparent ground (§8.2 #6) — never a fill.
Status follows the §8.2 #8 grammar: `NEW` is the one actionable state and takes
`--cobalt-text`; `REVIEWING`, `ACCEPTED`, `DECLINED`, `SPAM` are `--ink-3`. Every
state is a word. Export is a `.link-action`.

**Filters (phase 4) are URL state**, as §12.1 already requires of public indexes:
`/admin?kind=membership&status=new` is shareable, server-rendered, and works with
JavaScript off. No islands on these routes.

**Empty state** obeys §7.4 — eyebrow, rule, one mono line in `--ink-3`. One
deliberate departure: a queue of two rows stays a table rather than collapsing to
READ. The under-three rule exists so a thin *public* index does not look
early-broken to a visitor; here the reader is doing a task and wants columns.

## Risks and trade-offs

**The strongest argument against building this at all.** Today, every student
application sits behind an interface with no public surface whatsoever: a
`wrangler` binary and a Cloudflare login. Phase 1 converts that into an
internet-facing HTTPS endpoint that returns those applications to anyone who
satisfies a policy configured in a dashboard, outside this repository, with no
review, no test and no diff. The operator is a student; the failure is silent;
and the thing being disclosed is other students' names, emails and motivation
letters. Meanwhile problem 1 — nobody knows a submission arrived — is fixed by
two `wrangler secret put` commands against code that is already written and
already tested. If phase 0 lands and the weekly review promise starts being kept,
**this proposal has no remaining problem to solve** and should be closed.

The rest, assuming it is built anyway:

- **Access is the whole security model and lives in a dashboard.** A wrong
  `ACCESS_AUD`, an application scoped to one hostname, or a domain attached
  later is a full disclosure. Mitigations: fail closed (an unset `ACCESS_AUD`
  is a 503, never an open page); verify the JWT so a request that bypassed the
  edge still gets a 404; and after any domain change, log out and `curl` both
  `/admin` and `/admin/s/<uuid>` on **both** hostnames.
- **Concentration of personal data.** These rows move from behind a CLI to a tab
  that stays logged in on a student's laptop. So phase 1's list shows name, kind,
  date and status only; email and `payload` need the deliberate click of phase 2;
  sessions are 24 hours; `no-store` everywhere; export is an act, not a view.
- **Nothing here may nag.** No unread badge, no SLA countdown, no digest. A
  console that generates obligation is one a volunteer avoids, and then it rots.
- **Phase creep is the CRM mistake in miniature.** Building 3–5 before 1 is being
  opened is how this becomes CiviCRM.
- **Removal is cheap on purpose:** delete the routes and `access.ts`, delete the
  Access application, drop two lines from `robots.txt` and `astro.config.mjs`.
  The `0003` column can stay; an unused nullable column costs nothing.

## Success

- `docs/STATUS.md` no longer names `wrangler d1 execute` as the way to read a
  submission, and `/admin` moves out of its "Not built, deliberately" list.
- At least one person other than the repository owner has signed in, visible in
  the Access logs — the only place it needs to be visible. This is the whole
  point: today, reading one application requires a login to an account
  `ARCHITECTURE.md` says hosts more than this site.
- After phase 3, one query says whether it is used, from real rows and no
  invented metric: `SELECT status, COUNT(*) FROM submissions GROUP BY status`.
- The §10.3 capacity rule becomes buildable, because `spam` is finally reachable.

**Remove it if** the status breakdown is still all `new` after a full intake
cycle, or the team is triaging in Telegram anyway. Either is an answer worth
recording.

## Effort

**Phase 1 is about half a day:** one `.astro` route, one `access.ts`, one
Playwright spec, one Zero Trust application. Each later phase is smaller than the
one before it except phase 3, which introduces the first write path and the
migration.

One new dependency: [`jose`](https://github.com/panva/jose) for
`createRemoteJWKSet` and `jwtVerify`. It lists Cloudflare Workers as a supported
runtime, "has no dependencies", and assumes WebCryptoAPI and Fetch — which is
what `workerd` provides — and these routes ship no client JS anyway.
Hand-rolling RS256 is roughly eighty lines and no dependency; take the library,
and note that a library is not a vendor. No new Cloudflare product, no new bill.
