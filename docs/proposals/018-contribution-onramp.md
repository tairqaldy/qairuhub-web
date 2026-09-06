---
title: Make a first pull request survivable for a first-year
status: draft
area: community
effort: M
depends_on: []
---

# 018 — Make a first pull request survivable for a first-year

| | |
|---|---|
| **Status** | draft |
| **Area** | community |
| **Effort** | M overall. Phase 1 is an hour. |
| **Depends on** | — (Phases 2–4 depend on one real contributor failing first) |

## Problem

The site invites contributions, and every route it offers is broken. All of this
is checkable against the tree.

**The links go nowhere.** `/projects` renders its empty state with
`actionLabel="How to contribute"` and `actionHref="/about"`
(`src/pages/projects/index.astro`). `/about` has a Contributing section whose
only outbound link is labelled `The repository ↗` and points at
`SITE.social.github` (`src/pages/about.astro`), which is
`https://github.com/qairuhub` (`src/lib/site.ts`). That organisation exists and
has **no public repositories**. The code is at
`github.com/tairqaldy/qairuhub-web` (`docs/STATUS.md`). A student who follows
the site's own instructions arrives at an empty page before touching git.
`tests/e2e/design-law.spec.ts` asserts that every *internal* link resolves; this
one is external, so nothing catches it.

**The base branch does not exist.** `README.md` and `docs/CONTENT.md` both say
*"open a pull request against `develop`."* `git ls-remote --heads origin`
returns `main` and five `proposal/*` branches. There is no `develop`, and
`ci.yml` triggers on `pull_request: branches: [main, develop]` — so the written
instruction names a base nobody can select and a trigger that never fires.

**CI charges a Markdown file the price of a code change.** `verify` runs
`pnpm check` (`astro check`, Biome, the attribution guard, the cobalt guard,
Vitest) and then `pnpm build`. `e2e` then does a second checkout and install,
`pnpm exec playwright install --with-deps chromium`, and runs `design-law.spec`
over the eleven routes in its `ROUTES` array at 1440 / 768 / Pixel 7 with
`workers: 2`. A one-file person entry pays all of it, and three of the failures
it can produce have nothing to do with the person adding the file:

1. **The attribution guard scans the tree, not the diff.** `pnpm check` invokes
   `scripts/check-no-attribution.mjs` with no arguments, so it falls back to
   `git ls-files`. Its `ALLOW` list covers `scripts/`, the guard's own test,
   `CLAUDE.md`, `AGENTS.md`, `docs/research/` and `.github/workflows/` — not
   `src/content/**`, and not `docs/proposals/`. One pattern is
   `/\bclaude\s+code\b/i`, labelled *"assistant tool name"*. A project one-liner
   that names the assistant it was built using turns the check red, in a message
   about authorship claims. The rule is about this repository's commit history;
   the failure reads like an accusation.
2. **Schema errors arrive as Zod paths.** `unit: ai` instead of `unit: qairu-ai`
   fails `astro check` against the six-value enum in `src/content.config.ts` —
   correct, and addressed to a maintainer.
3. **Local contributors are stopped before they push.** `lefthook.yml` runs
   `scripts/check-commit-msg.mjs` on `commit-msg`; `add me to people` fails the
   Conventional Commits regex it enforces.

**The paperwork is written for a different change.**
`.github/PULL_REQUEST_TEMPLATE.md` asks every author to tick *"Screenshots
attached at 375 / 768 / 1440"*, *"Anti-slop checklist in `docs/DESIGN.md`
passes"* and *"No new hardcoded colours, spacing, or radii"* — for a file that
contains no CSS. There is no `CONTRIBUTING.md` at the root, so GitHub's own
contributing-guidelines link points at nothing.
`.github/ISSUE_TEMPLATE/content.yml` is a dropdown plus one free-text
**Details** box: it produces an issue, and the maintainer still writes the
Markdown. `CODEOWNERS` routes `/src/content/` to `@tairqaldy` — the same handle
as `*` and as every other line — under the comment *"Content contributions get a
lighter review path"*, which describes nothing that exists.

## Prior art

**[First Contributions](https://github.com/firstcontributions/first-contributions).**
A repository whose only purpose is a disposable first pull request: fork, clone,
branch, add your name to `Contributors.md`, commit, push, PR. Parallel tutorials
for GitHub Desktop, VS Code, GitKraken, Sourcetree and IntelliJ, and READMEs
translated into dozens of languages. **Steal:** the practice PR that cannot break
anything, the GUI paths, and translated *instructions* — Kazakh and Russian cost
nothing here, where translated *content* cannot ship yet. **Leave:** sending
people elsewhere to practise. Practising here, against a real file, is the point.

**Hacktoberfest's 2020 collapse** — argued at the time in
[Spamtoberfest](https://drewdevault.com/blog/Spamtoberfest/) ("a deluge of
low-effort contributions to maintainers, leaving them to clean up the spam") and
in the [participation-rules issue](https://github.com/digitalocean/hacktoberfest/issues/609),
where the fixes were debated: maintainer opt-in via a repository topic, and a
merge-or-`hacktoberfest-accepted` gate. Rewarding pull-request *count* produced
pull-request count. **Steal:** the diagnosis — never make a number the reward —
and maintainer consent before anyone is aimed at a repository. **Leave:** the
drive format. A deadline campaign pointed at one volunteer reviewer is the worst
idea on this page.

**[Kubernetes — `good first issue`](https://github.com/kubernetes/community/blob/master/contributors/guide/help-wanted.md)**
· [contributor ladder](https://github.com/kubernetes/community/blob/master/community-membership.md).
The label is a contract with six named requirements: no barrier to entry, the
solution explained, context and suggested reading, links to similar examples, the
relevant code and tests linked, ready to test. Membership is a ladder — Member,
Reviewer, Approver, Subproject Owner — with reviewer and approver status scoped
to a part of the tree through `OWNERS`. **Steal:** the six criteria verbatim as
the label's definition of done, and directory-scoped review as the mechanism by
which a second person is added. **Leave:** sponsorship by two reviewers from
different member companies, and the bot fleet. There is one maintainer.

**[Rust](https://rustc-dev-guide.rust-lang.org/getting-started.html)** ·
[Awesome Rust Mentors](https://rustbeginners.github.io/awesome-rust-mentors/).
The dev guide points newcomers at a single issue search,
`label:E-easy,E-medium,E-help-wanted,E-mentor`; `E-mentor` means a person has
volunteered on that issue. The mentor list goes further, and is the part worth
copying: named people with their topics, contact, **timezone and the languages
they speak**. **Steal:** the named human on the issue, and the languages field —
"ask @handle, Kazakh or English" is a different offer from "easy" in a city
where the language of the room is a real filter. **Leave:** the scale of the
guide; our equivalent is one page.

[Steinmacher, Conte, Gerosa and Redmiles, CSCW '15](https://doi.org/10.1145/2675133.2675215)
catalogue 58 barriers newcomers hit when placing a first contribution, 13 of
them social, over a period they find frequently ends in dropout.

## Proposal

**1. Point the existing links at something real.** `SITE.social.github` becomes
the repository that exists. Decide once whether that is
`tairqaldy/qairuhub-web` or a move into the empty `qairuhub` organisation, and
make the URL match. `/about`'s Contributing link and `/projects`'s empty-state
action both point at `CONTRIBUTING.md` in that repository, rather than at
`/about` and at an empty organisation page.

**2. Make the documented base branch exist.** Either create `develop` and keep
the docs, or drop it and make `README.md`, `docs/CONTENT.md` and `ci.yml` name
`main`. One or the other, in the same commit. Whichever wins, the branch a
contributor is told to target must be the branch GitHub proposes.

**3. Write `CONTRIBUTING.md`.** Under 400 words.
[github.dev](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor)
first — press `.` on the repository: free, no install, no compute, and it does
fork, branch, commit and pull request from a locked lab machine. `pnpm` second,
for people who already have it. One worked example: copy
`src/content/people/example-member.md`, change five fields, commit.

**4. Charge content what it actually costs — without a second workflow.**
GitHub's
[troubleshooting page for required status checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks)
says a workflow skipped by path filtering leaves its checks *Pending* and blocks
the merge, and its advice is to **avoid requiring a workflow that can be
skipped** — not to shadow it with a second workflow reusing the job names. So
keep one `CI` workflow and the same two jobs, and make the *steps* conditional
instead. A first step computes the changed paths against the base ref and sets
one output. When a pull request touches only `src/content/**`, `docs/**` and
`*.md`, `verify` skips the three checks that Markdown cannot affect — Biome
(globbed to `js/ts/jsx/tsx/mjs/cjs/json/jsonc/css/astro`), `check-cobalt.mjs`
(which reads `.astro` and `.tsx`) and Vitest (unit tests of the scripts and form
handlers) — and keeps `astro check`, the attribution guard and `pnpm build`. No
path filters, so no check can hang *Pending*.

`e2e` keeps running on content. A long project name can overflow at 375px, and a
`cover` set without `coverAlt` can ship an `<img>` with no alt text — `coverAlt`
is `.optional()` in `src/content.config.ts` today, so the schema does not stop
it and only the Playwright assertion does. The saving there is `actions/cache`
on `~/.cache/ms-playwright` keyed on the Playwright version, which helps code
pull requests equally. **Measure before and after; do not promise a number in
advance.**

**5. Make the guards speak.** Pass the changed files to
`check-no-attribution.mjs` in CI — the script already accepts file arguments —
so a red X is always about a file the author touched. Scope the
`/\bclaude\s+code\b/i` pattern to non-content paths: naming a tool in a project
description is not an authorship claim. The co-author trailer, the "generated
with" note, the robot marker and the author email stay global and unscoped, and
the pre-commit hook still runs the full set locally. Then add
`scripts/explain-content.mjs`: after a failed `astro check` it maps each Zod
issue to one sentence and writes it to `$GITHUB_STEP_SUMMARY`. Target output:
`src/content/people/dana.md — unit must be one of core, qairu-ai, hackathons, accelerator, education, space. You wrote "ai". Change that one line and push again; nothing else is wrong.`

**6. A pull-request template that fits a Markdown file.** The current one asks
for three-breakpoint screenshots and a design-law pass. Split it: the content
path asks two questions — is every fact real, and did the person named agree to
be listed — and the code path keeps what it has.

**7. Issue forms that produce the file.** Only once step 3 has demonstrably
failed somebody. Issue forms have no conditional fields, so it is one form per
type: `person.yml`, `project.yml`, `event.yml`, one input per schema field.
`content.yml` stays as the catch-all for corrections and for `posts`, which has
a schema and no page. A workflow triggered on `issues: [labeled]` with
`content:ready` parses the form with
[`stefanbuck/github-issue-parser`](https://github.com/stefanbuck/github-issue-parser),
**runs `astro check` and `pnpm build` on the generated file in that same job**,
and only then opens the pull request with
[`peter-evans/create-pull-request`](https://github.com/peter-evans/create-pull-request).
Its
[concepts guide](https://github.com/peter-evans/create-pull-request/blob/main/docs/concepts-guidelines.md)
is explicit that "events triggered by the `GITHUB_TOKEN` will not create a new
workflow run", and lists the workarounds; the one that costs no credential is
`draft: always-true` plus a `pull_request` trigger on `ready_for_review`, so the
reviewer marking it ready is what fires CI. `person.yml` carries a required
checkbox: *I am this person, or I have their message agreeing to be listed.*

**8. What a reviewer says.** `.github/REVIEW.md`, three rules: a human reply
within 48 hours even when it is only "seen, reviewing Friday"; review content
against three questions only — is it true, is it in the voice, does it build;
fix formatting yourself in a follow-up commit rather than requesting changes on
it. Merge, never squash away the author.

**9. A `good first issue` stream, last.** Kubernetes' six criteria are the
label's definition of done, plus a named mentor and the language they will
answer in. Cap it at eight open issues. An empty stream loses the label rather
than keeping stale entries.

**10. No CMS.** [Sveltia CMS](https://github.com/sveltia/sveltia-cms) is the
right one if ever wanted: "the de facto successor to Netlify/Decap CMS", a
single-page application served from a CDN, and its OAuth proxy
[`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) is itself a
Cloudflare Worker, so the vendor rule holds at zero cost. The credential
objection is weaker than it looks — that repository's own README says "in most
cases, you don't need this authenticator". The real objection is the
`config.yml`: a Decap-compatible CMS restates every collection and every field
by hand, which is a second copy of `src/content.config.ts` that drifts the first
time a field changes. Revisit at fifteen content pull requests in a term from
six people, or the first time someone without a GitHub account is blocked.

## Scope

**Phase 1 — an hour, and it is the whole proposal until something proves
otherwise.** The repository URL in `src/lib/site.ts`. The base branch made real
in `README.md`, `docs/CONTENT.md` and `ci.yml`. `CONTRIBUTING.md`. The two
empty-state links repointed. Nothing else. This is the part that is broken
rather than merely expensive, and it adds no file to `.github/`.

**Phase 2 — half a day, when the first person hits CI.** Conditional steps in
`verify`, the Playwright browser cache, changed-file arguments to the attribution
guard, the content-path pattern scoping, the split pull-request template.

**Phase 3 — a day, when a schema error has actually confused somebody.**
`scripts/explain-content.mjs` and `.github/REVIEW.md`.

**Phase 4 — only if Phase 3 was not enough.** Three issue forms and the
issue-to-pull-request workflow. Then the `good first issue` stream.

**Not doing:** a CMS, a claim bot, a leaderboard, or any contributor count
anywhere on the site.

## Data and schema

**No change to `src/content.config.ts`.** No collection, no field, no D1
migration, no binding. Consent stays a process — a `consent: true` field is a
checkbox a stranger can tick on someone else's behalf, which is worse than no
field. A person entry merges only after that person has commented on the issue
or the pull request from their own account.

New and changed files, by phase. Phase 1: `CONTRIBUTING.md`; the `social.github`
constant in `src/lib/site.ts`; the Contributing link in `src/pages/about.astro`;
the empty-state action in `src/pages/projects/index.astro`; the branch name in
`README.md`, `docs/CONTENT.md` and `.github/workflows/ci.yml`. Phase 2: steps
and a cache in `ci.yml`; a path-scoped pattern set in
`scripts/check-no-attribution.mjs`; `.github/PULL_REQUEST_TEMPLATE.md`. Phase 3:
`scripts/explain-content.mjs`, `.github/REVIEW.md`. Phase 4:
`.github/ISSUE_TEMPLATE/{person,project,event}.yml` and
`.github/workflows/content-from-issue.yml`.

The practice target, if a practice pull request is offered at all, is
`docs/CONTRIBUTORS.md` — outside `src/content/`, so it renders nowhere and
cannot invent a person.

## Design

Almost all of this is repository, not site. Phase 1 changes two `href`s and one
constant. Both links are already `.link-action`, not `.cta-primary`, so the
one-cobalt-fill rule in `docs/DESIGN.md` §8.1 is untouched, no register changes,
and the under-100KB budget in §15 is unaffected — this proposal adds no client
JavaScript anywhere.

If a `contributing` page is ever wanted on the site itself, it is one entry in
the existing `docs` collection (`category: process`, `updatedDate` required),
rendered by the DOC archetype in READ (§12.4) with no new component and no new
route pattern. That is Phase 3 at the earliest, and it carries one honest cost:
`design-law.spec.ts` hard-codes eleven index-level routes, so a new
`/docs/<slug>` page gets no design-law coverage until that array is extended.

## Risks and trade-offs

**The strongest argument for not doing this at all.** Nobody has tried.
`src/content/people/` contains one file, `example-member.md`, and every entry in
every collection is `placeholder: true`. There is no content pull request from a
non-maintainer that failed, because there has been no content pull request.
Phases 2–4 build a machine for demand that has not appeared — the same error the
repository refuses everywhere else, dressed as process instead of as an invented
statistic. Phase 1 is different in kind: those links are broken today, for
anyone reading the site, whether or not they ever intended to contribute. The
defensible position is Phase 1 and a full stop, with each later phase paid for
by one real person failing in a way the previous phase did not fix. If that
never happens, this proposal correctly ends after an hour of work.

**Weakening a guard.** Scoping `/\bclaude\s+code\b/i` away from
`src/content/**` is a real loosening — that pattern is the one that catches a
tool name pasted into prose, and prose is what content is made of. Only that
pattern, only under that path, the other five stay global, and the pre-commit
hook runs the full set locally regardless.

**Skipping steps inside a required job.** If the changed-files step computes
wrongly — a merge commit, a force-push, a shallow checkout without the base ref
— a code change could pass with Biome and Vitest skipped and still report green.
The step must default to running everything on any failure or ambiguity, and
that default belongs in a unit test beside the ones already in
`tests/unit/workflows.test.ts`.

**Generated pull requests arriving without checks.** Real, and the reason the
generating job validates the file itself before opening anything, and opens it
as a draft. `REVIEW.md` states the rule plainly: never merge a generated pull
request without a green build. An earlier version of this proposal justified
storing a token by pointing at `docs/ARCHITECTURE.md`; that comparison was
wrong. The credential that document gates off is a Cloudflare token that "can
edit Workers, KV, D1, R2 and Pages across the entire Cloudflare account" in a
public repository. A fine-grained GitHub token scoped to one repository is a much
smaller thing. The reason to avoid one is that it is a credential a volunteer has
to rotate, not that it is equivalent to the other.

**No preview for a github.dev contributor.** They cannot run `pnpm dev`, so they
cannot see what they wrote. `docs/ARCHITECTURE.md` already names the answer:
Cloudflare Workers Builds "stores no credential in GitHub at all, and gives
per-pull-request preview URLs", at the cost of a GitHub App installation. That
decision is separate from this one and should be taken alongside it.

**Rot.** Eight stocked issues is eight issues someone writes, every week, which
is why that item is ranked last here. If the stream empties, delete the label
rather than leave stale entries — the discipline the site already applies to
empty indexes.

**Volume, and the missing second reviewer.** Success creates review load for one
person. `CODEOWNERS` names `@tairqaldy` on every line, so the "second reviewer
scoped to `/src/content/`" pressure valve is not a configuration change — it is a
person who does not exist yet, and finding one is the actual first rung of the
ladder.

## Success

- Every link the site offers about contributing resolves to a page with
  instructions on it. True or false the day Phase 1 lands.
- A first-year with no git installed goes from "I want to be listed" to a merged
  entry without installing anything.
- Zero content pull requests closed unmerged for a reason that was the
  repository's fault — a base branch that does not exist, a guard firing on a
  file the author never touched, an unexplained Zod path.
- Three or more distinct non-maintainer authors merged in the first term; median
  issue-to-merge under seven days; first human reply under 48 hours.

**Remove it again if:** Phase 4 fires fewer than three times in a term — delete
the forms and the workflow, keep `CONTRIBUTING.md`; or if generated pull
requests need more maintainer editing than a hand-written file would, in which
case the form is wrong and should go rather than be tuned.

## Effort

**M overall, and almost none of it up front.** Phase 1 is an hour: one constant,
two `href`s, three documents agreeing on one branch name, and a page. Phase 2 is
half a day of workflow editing with a unit test. Phase 3 is a day. Phase 4 is
the bulk and should not be started on speculation. No dependencies; it
complements 012, which is the same problem one corridor earlier.
