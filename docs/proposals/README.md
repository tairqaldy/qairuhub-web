# Proposals

Each file here is a worked proposal for something qairuhub.com could become.

They are **not** implementation. Each one states a problem, shows what
comparable organisations actually do about it, proposes a specific answer, and
is honest about cost and risk. A proposal exists to be argued with — several of
these should be rejected, and rejecting one with a reason recorded is a good
outcome.

## How to read one

Every proposal follows the same shape:

| Section | What it answers |
|---|---|
| **Problem** | What is wrong or missing today, concretely |
| **Prior art** | What real organisations do, with links and what to steal |
| **Proposal** | The specific thing to build |
| **Scope** | Phases, smallest useful version first |
| **Data and schema** | What changes in `src/content.config.ts` or D1 |
| **Design** | How it fits the rules in `docs/DESIGN.md` |
| **Risks** | What could go wrong, and what would make this a bad idea |
| **Success** | How we would know it worked |
| **Effort** | Rough size, and what it depends on |

## Status

| Status | Meaning |
|---|---|
| `draft` | Written, not yet discussed |
| `accepted` | Agreed. Ready to be broken into issues |
| `rejected` | Decided against. The reasoning stays here on purpose |
| `superseded` | Replaced by a later proposal, which is linked |

## Index

Proposals are numbered in the order they were written, not in priority order.
See the table at the top of each file for its status.

<!-- INDEX:START -->

### Operations

| | Proposal | Effort | Status |
|---|---|---|---|
| 001 | [Build an admin console for submissions](001-admin-console.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/6) |
| 002 | [Run application review on a weekly sitting with a published rubric](002-application-review.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/7) |
| 003 | [Model the member lifecycle from first Friday to alumni](003-member-lifecycle.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/8) |
| 004 | [Send the email we already owe people](004-communications.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/9) |
| 005 | [Measure only what would change a decision](005-honest-metrics.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/10) |
| 006 | [Write the charter and start a decision log](006-governance.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/11) |

### Events

| | Proposal | Effort | Status |
|---|---|---|---|
| 007 | [Cancel a session without deleting it, then model the series](007-event-system.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/12) |
| 008 | [Record who came, not who said they would](008-attendance.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/13) |
| 009 | [Ship one .ics per session before shipping a feed](009-calendar-integration.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/14) |
| 010 | [Run the first hackathon on paper](010-hackathons.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/15) |
| 011 | [Make the write-up promise true, or take it down](011-session-writeups.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/16) |
| 012 | [Make the walk-in door findable and staffed](012-first-timer-path.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/17) |

### Community

| | Proposal | Effort | Status |
|---|---|---|---|
| 013 | [Keep the project registry true, and browsable later](013-project-registry.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/18) |
| 014 | [Give every member a page that shows what they actually did](014-member-profiles.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/19) |
| 015 | [Give the notes an order and an end](015-learning-tracks.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/20) |
| 016 | [Publish a monthly round-up that assembles itself](016-writing-and-newsletter.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/21) |
| 017 | [Take support without turning the site into a logo wall](017-partners-and-sponsorship.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/22) |
| 018 | [Make a first pull request survivable for a first-year](018-contribution-onramp.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/23) |

### Design

| | Proposal | Effort | Status |
|---|---|---|---|
| 020 | [Typeset the share card, because the link lands in Telegram first](020-og-images.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/25) |
| 021 | [Make the design guards component-shaped](021-component-library.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/26) |
| 022 | [Fix the reduced-motion block, then let motion carry meaning only](022-motion-and-interaction.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/27) |
| 023 | [Print one A3 from the site's own tokens](023-offline-assets.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/28) |
| 024 | [Fly our own flag, then cut one file for print](024-identity-system.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/29) |

### Platform

| | Proposal | Effort | Status |
|---|---|---|---|
| 025 | [Publish in Kazakh and Russian without machine translation](025-localisation.md) | L | draft |
| 026 | [Search the index at build time, not the page at request time](026-search.md) | M | draft |
| 027 | [Make the performance budget falsifiable, then print the bytes](027-performance-monitoring.md) | S | draft |
| 028 | [Run accessibility as a standing practice, not a one-off audit](028-accessibility-programme.md) | M | draft |
| 029 | [Find out the form is broken before the applications stop](029-observability.md) | S | draft |
| 030 | [Handle students' personal data properly](030-data-protection.md) | M | draft |

### Growth

| | Proposal | Effort | Status |
|---|---|---|---|
| 031 | [Push the site's facts into the Telegram group the club already lives in](031-telegram-bot.md) | M | draft |
| 033 | [Read a project's health from its repository, not its Markdown](033-github-integration.md) | M | draft |
| 034 | [Record what happens to people after they leave](034-outcomes-and-alumni.md) | M | draft |
| 035 | [Position QairuHub inside the Kazakh AI ecosystem](035-ecosystem-and-partnerships.md) | M | draft |
| 036 | [Hold three Fridays, then ship six things, and defer the rest for a year](036-the-first-hundred-days.md) | S | draft |

### Uncategorised

| | Proposal | Effort | Status |
|---|---|---|---|
| 019 | [Photograph the room, and fill the empty plates](019-photography-direction.md) | — | [in review](https://github.com/tairqaldy/qairuhub-web/pull/24) |

35 proposals, 24 still open for review, roughly 27,000 words merged. Generated by `node scripts/index-proposals.mjs` — do not edit by hand.

<!-- INDEX:END -->

## Writing one

Copy `_template.md`. Keep it specific: a proposal that could apply to any
student club is not a proposal, it is a wish. Cite real sources. State what you
are *not* proposing as clearly as what you are.
