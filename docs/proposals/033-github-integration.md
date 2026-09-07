---
title: Read a project's health from its repository, not its Markdown
status: draft
area: growth
effort: M
depends_on: []
---

# 033 — Read a project's health from its repository, not its Markdown

| | |
|---|---|
| **Status** | draft |
| **Area** | growth |
| **Effort** | M |
| **Depends on** | — |

## Problem

`src/content.config.ts` gives a project a `stage` of `idea | prototype |
launched | archived`, a `started` date, and an optional `repo` URL. Every one of
those is a hand-typed assertion that decays. `stage` is set once, on the day the
Markdown is written, by a student who then goes and does the actual work
somewhere else. Nothing in `pnpm check` can tell that `stage: prototype` became
false eight months ago, because nothing in the repository knows.

This collides with the rule the site is built around. CONTENT.md says a project
is listed at its real stage and that numbers must be real. A registry that
quietly reports a dead project as a live one is not a formatting bug — it is the
site telling a checkable lie about itself, and the check is one click away on
the `repo` link the row already renders.

The failure mode is specific to a volunteer club with a summer. In term, someone
notices. In July, the person who would notice is not reading the repository
either. The truth is already public and machine-readable; the site is the only
place it is not.

There is also a step-zero problem worth stating plainly. `src/lib/site.ts`
points `social.github` at `https://github.com/qairuhub`. That organisation
exists — but as of 2026-09-07 it has **no public repositories**, and the site's
own source lives at `tairqaldy/qairuhub-web`, outside it. Nothing below builds
anything until repositories actually live in the org.

## Prior art

**[GitHub, "Rate limits for the REST API"](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)**
— 60 requests per hour unauthenticated, per originating IP; 5,000/hour for a
personal access token; 1,000/hour per repository for the built-in Actions
`GITHUB_TOKEN`. *Steal:* the Actions token, because it needs no secret created,
rotated or remembered by a busy maintainer. *Leave:* unauthenticated calls
entirely. The limit is per IP and CI runners sit behind shared egress; testing
this proposal from a laptop today already returned `403 API rate limit exceeded
for <ip>` before a single useful call was made.

**[GitHub, "Best practices for using the REST API"](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)**
— "Making a conditional request does not count against your primary rate limit
if a `304` response is returned and the request was made while correctly
authorized." *Steal:* store the `etag` per URL and send `if-none-match`, so a
sync that finds nothing changed costs nothing. *Steal also:* requests serially,
and respect `retry-after`. *Leave:* the advice to prefer webhooks — a webhook
needs a receiver, and this site's Worker exists to accept forms, not to hold
mutable state about GitHub.

**[GitHub, "Rate limits for the GraphQL API"](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api)**
— 5,000 points per hour, points computed from connection size, 500,000 nodes per
call. *Steal:* nothing yet. GraphQL wins when you need many repos' issues in one
round trip, and it requires a token in every case. At single-digit repositories,
`GET /orgs/{org}/repos?per_page=100` is one REST call for the entire
organisation and is simpler to debug from `curl`. Revisit at ~20 repos.

**[up-for-grabs.net](https://up-for-grabs.net/)** — a directory of projects with
curated newcomer tasks, where each project is a hand-written YAML file in a
public repository and the *issues* are pulled live by label. *Steal:* the split
— humans curate which projects belong, machines fetch which issues are open. It
is exactly the division this proposal wants: the Markdown keeps the judgement,
GitHub keeps the facts. *Leave:* the aggregator ambition; QairuHub is one org.

**[GitHub, "Encouraging helpful contributions … with labels"](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/encouraging-helpful-contributions-to-your-project-with-labels)**
— `good first issue` is a default label GitHub itself uses to surface
approachable work. *Steal:* the label, unmodified, so an issue written for
qairuhub.com is also discoverable on GitHub with no extra work. *Leave:* the
assumption that labelling is enough. GitHub surfaces the issue; it does not
explain that you can walk into Lab 2.14 and ask.

**[CHAOSS metrics](https://chaoss.community/kbtopic/all-metrics/)** — the open
source community-health metric catalogue: *Time to First Response*, *Contributor
Absence Factor*, *Inactive Contributors*, *Activity Dates and Times*. *Steal:*
the framing that health is responsiveness and continuity, not audience size.
*Leave:* the whole apparatus. Measuring *Contributor Absence Factor* on a
three-person project is theatre.

**[github.com/hackclub](https://github.com/hackclub)** — a genuinely comparable
student community: 1,000+ public repos, mascot art and finances open-sourced
alongside code, and the organisation page itself doing the work of a portfolio.
*Steal:* the posture — the org page is the artefact; the website links to it
rather than reimplementing it. *Leave:* the scale. Their pinned repos carry
thousands of stars; ours will carry three, which is the whole argument in §Design
against ever rendering that number.

## Proposal

**The build never talks to GitHub.** A committed JSON snapshot,
`src/data/github.json`, is the only thing Astro reads. A separate script
refreshes it. GitHub being slow, down, or angry can therefore make the site
*stale*; it can never make the site *fail*.

**1. `scripts/sync-github.mjs`.** One call for the org
(`GET /orgs/qairuhub/repos?per_page=100&type=public`) returns every repository
with full metadata. Then, only for repositories referenced by a published,
non-placeholder project, one call each for
`GET /repos/{o}/{r}/issues?labels=good+first+issue&state=open&per_page=10`,
issued serially. At the club's realistic size that is under ten requests per
run against a 1,000/hour budget.

Every request carries the stored `etag` in `if-none-match`. ETags live in
`.github-sync-cache.json`, deliberately separate from the data file so the
committed diff stays human-readable.

**2. A GitHub Actions workflow**, daily plus `workflow_dispatch`, running with
`permissions: { contents: read }` and the built-in `GITHUB_TOKEN`, opening a PR
when the snapshot changes. Note the trap: in a public repository, scheduled
workflows are
[automatically disabled after 60 days without repository activity](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
— which is precisely the summer this proposal exists to survive. The manual
trigger and the staleness rule below are the answer.

**3. Fail-soft, per repository.** `Promise.allSettled`, never `Promise.all`. A
repository that errors keeps its previous snapshot entry rather than
disappearing. The script refuses to write a snapshot with fewer repositories
than the last one unless passed `--prune`, so one bad response cannot silently
empty `/projects`.

**4. Staleness is rendered, not hidden.** The snapshot carries `fetchedAt`. If
it is older than 14 days at build time, the site drops the GitHub metadata row
entirely and shows only the hand-written Markdown. This follows the `stale_after`
rule already in DESIGN.md — *live values that expire rather than lie*. Showing
"last commit 12 June" from a snapshot taken in June compounds two staleness
errors into one confidently wrong sentence.

**5. Fields worth pulling.** `pushed_at` (last push to any branch), `archived`,
`language`, `license.spdx_id`, `default_branch`, and open `good first issue`
entries. `archived: true` is the strongest one: it overrides `stage` and forces
the row's existing `АРХИВ` state token, so a repository the team archived cannot
keep advertising itself as a prototype.

**6. Fields not worth pulling, on purpose.** No `stargazers_count`, no forks, no
watchers. Stars are a popularity number that says nothing about whether code
runs, are trivially inflated by twenty club members clicking a button, and will
read as `0` beside every honest project here — publishing a zero that means
nothing is the same error as publishing an invented number that means nothing.
No `open_issues_count`: the Issues API
[counts pull requests as issues](https://docs.github.com/en/rest/issues/issues),
so the number is wrong before it is meaningless. No `description` — the
hand-written `oneLiner` is better copy and stays.

**7. Contributor record — opt-in only, or not at all.** `people` entries already
carry a `github` handle, given with consent. The integration may only *match*
commit authors against handles already present. It must never create a person
from GitHub data, and never render a GitHub avatar or username the site was not
given. CONTENT.md's rule is absolute: nobody is listed without agreeing to be,
and "their commits are public anyway" is not agreement to appear on
qairuhub.com. If that constraint makes the feature thin, the honest answer is to
ship phases 1–2 and drop this one.

## Scope

**Phase 1 — truth on the row.** Sync script, snapshot schema, and one mono meta
line on `/projects` and each project page. Archived repos flip the state token.
Ship with the workflow running manually before automating it.

**Phase 2 — the contribute block.** A `## Contribute` section at the bottom of
`/projects` listing open `good first issue` entries with repo, title and link.
Not a new nav entry: the section index is numbered `01`–`07` and an eighth item
is a design change, not a feature. Rendered only when there is at least one
issue — a contribute page listing nothing is worse than no contribute page.

**Phase 3 — contributors, only under §Proposal 7's constraint, and only if there
is a real roster to match against.**

**Not proposed:** live client-side fetching, a GitHub App, webhooks, commit
graphs, sparklines, a contribution heatmap, or anything that renders per-request.
DESIGN.md killed the ticker family already; this is that family with an API key.

## Data and schema

**No D1 migration and no new binding.** This is build-time data and belongs
nowhere near the request path.

`src/content.config.ts`: add `githubSync: z.boolean().default(true)` to
`projects`, so a project on a student's personal account can opt out. `repo`
already exists as `z.url().optional()` and needs no change; owner and name are
parsed from it at build.

New `src/data/github.json`, keyed by lowercase `full_name`:

```json
{
  "fetchedAt": "2026-09-07T04:00:00Z",
  "repos": {
    "qairuhub/timetable-bot": {
      "pushedAt": "2026-09-04T18:22:11Z",
      "archived": false,
      "language": "Python",
      "license": "MIT",
      "goodFirstIssues": [
        { "number": 12, "title": "Handle an empty timetable response", "url": "https://github.com/qairuhub/timetable-bot/issues/12" }
      ]
    }
  }
}
```

`src/lib/github.ts` validates it with Zod and returns `null` on a missing,
malformed or stale file — never throws. A rename is detectable: GitHub's API
returns the canonical `full_name`, so a mismatch with the Markdown `repo` URL is
logged as "repo renamed, update the Markdown" rather than silently dropped.

Astro's [content loader API](https://docs.astro.build/en/reference/content-loader-reference/)
is the idiomatic alternative, with `meta` for sync tokens and `generateDigest`
for incremental updates. It is rejected here for one reason: it puts the fetch
inside the build. Its data store persists between builds *on one machine*, and
[Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
(free tier: 3,000 build minutes/month, one concurrent build, 20-minute timeout)
starts from a clean checkout. A committed file is the cache that actually
survives.

## Design

The metadata renders as one mono meta line in the existing project row grammar,
beside the state token: `PUSHED 04.09 · PYTHON · MIT`. Tabular numerals via
`formatShortDate`, Astana timezone like every other date on the site.

**No cobalt.** This is metadata, not an action; the only accent in the row stays
the repo link that is already there, and `scripts/check-cobalt.mjs` should not
have to be argued with.

**Empty state:** absence. A project with no `repo`, `githubSync: false`, no
snapshot entry, or a stale snapshot renders exactly what it renders today. The
line is additive and silently missing, which is also what the site does now when
there are no projects at all.

The good-first-issue block uses the index-row register — number, title, repo —
not cards.

## Risks and trade-offs

**The org is empty.** Verified 2026-09-07: `github.com/qairuhub` has no public
repositories. Building this before repositories move there produces a correct
integration reading nothing.

**Automating a date does not make it flattering.** Today a stale `stage` field
hides abandonment; afterwards `PUSHED 14.03` announces it on the index. That is
the honest outcome and the point of the proposal, but it is a real cost and the
club should choose it deliberately rather than discover it.

**`pushed_at` lies in both directions.** A Dependabot bump or a README typo makes
a dead project look alive; work happening on a private mirror makes a live one
look dead. It is a *push* timestamp, not a *progress* timestamp, and the label
must say `PUSHED`, not `UPDATED`.

**`language` is Linguist's byte count**, and GitHub itself notes that
[vendored and generated files skew it](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-repository-languages).
A notebook-heavy AI project may report `Jupyter Notebook` where a student would
say Python. Acceptable; it is GitHub's own answer, and it is fixable in
`.gitattributes` rather than by the site inventing a better one.

**A token is a thing to forget.** `GITHUB_TOKEN` inside Actions needs no setup
and cannot be forgotten. If repositories are ever private, this breaks and the
fix is a fine-grained PAT with metadata and issues read — which is a rotation
burden, and at that point reconsider whether the feature is worth it.

**What would make this a bad idea:** if last-commit dates start being read as a
leaderboard between students, or if the daily PR becomes noise the maintainer
rubber-stamps. Both are cultural failures the code cannot detect.

## Success

- A term passes and no project row on `/projects` contradicts its repository on
  a spot check. This is checkable by hand in five minutes.
- **Zero builds fail because of GitHub.** If even one does, the architecture is
  wrong and phase 1 gets reverted, not patched.
- At least one person arrives at a repository through the contribute block —
  measurable as a first-time contributor asking about a specific issue number in
  the Telegram group, which is where they will ask.

Remove it if: the org still holds fewer than three active repositories after two
terms; sync PRs are being merged unread; or the metadata row is making live
projects look dead often enough that people start avoiding the registry.

## Effort

**M.** The sync script and snapshot schema are a focused day; the row, the
contribute block and tests another. It depends on no other proposal, and on one
thing no proposal can supply: repositories in `github.com/qairuhub`, moved there
with their authors' agreement.
