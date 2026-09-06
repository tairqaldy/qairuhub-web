# Content and copy

How to add things to the site, and how the site talks.

## The one rule

**The site never presents invented people, numbers, or outcomes as real.**

Every collection carries two flags:

| Flag | Meaning |
|---|---|
| `draft: true` | Work in progress. Visible in `astro dev`, hidden everywhere else. |
| `placeholder: true` | A structural template describing nothing real. Visible in `astro dev` with a warning badge, **excluded from production builds**. |

Everything currently in `src/content/` is `placeholder: true`. That is why the
live site shows empty states rather than a roster of invented students. When an
entry describes something that actually happened, delete the `placeholder` line
and it appears.

This is enforced in code: `src/lib/content.ts` filters both flags, and every
page reads through it rather than calling `getCollection` directly. A stats
module renders nothing rather than render a guess.

## Adding content

You do not need to write code. Add one Markdown file and open a pull request
against `develop`. CI validates the schema and tells you if a field is missing
or malformed.

| What | Where | Filename |
|---|---|---|
| Event | `src/content/events/` | `<slug>.md` |
| Project | `src/content/projects/` | `<slug>.md` |
| Person | `src/content/people/` | `<name>.md` |
| Friday note or guide | `src/content/learn/` | `<slug>.md` |
| Programme | `src/content/programs/` | `<slug>.md` |
| Partner | `src/content/partners/` | `<slug>.md` |
| Governance document | `src/content/docs/` | `<slug>.md` |
| Blog post | `src/content/blog/` | `<slug>.md` |

The existing files in each folder are working templates. Copy one.

### An event

```yaml
---
title: 'AI Fridays: retrieval that actually works'
starts: 2026-10-03T17:00:00+05:00
ends: 2026-10-03T19:00:00+05:00
location: QAIRU, Astana
room: Lab 2.14
walkIn: true          # open to anyone, no application
capacity: 30
program: qairu-ai     # must match a file in src/content/programs/
summary: One or two sentences, 20–220 characters, saying what people will do.
tags: [retrieval, hands-on]
---

## What we will do

Markdown body.
```

`walkIn` matters: the homepage desk and the event row both read it, and they
must agree. Setting it wrongly makes the site contradict itself.

### A person

Nobody is listed without agreeing to be. Use real names and honest roles — the
point is that a visitor can see who actually runs this.

```yaml
---
name: Real Name
role: What they actually do
unit: core            # core | qairu-ai | hackathons | accelerator | education | space
github: their-handle  # handle, not URL — the site builds the link
telegram: their-handle
order: 1
active: true          # false moves them to the alumni group
---
```

### Images

Whenever a `cover` is set, `coverAlt` is required. Photographs on the site are
real: real members, real sessions, in colour. Put files in `src/assets/` and
reference them relatively — they are optimised at build time.

The PLATE (the large photograph on every page) currently renders an honest
"awaiting photography" frame. It keeps the exact footprint of the real image, so
a photograph drops straight in with no layout change.

## Voice

Direct, concrete, imperative. Short sentences. Name real things.

**Do:**
- "Two hours, open to anyone at QAIRU. Bring a laptop."
- "Applications are open. Anyone can walk into a Friday session."
- "A bot that answers questions about the timetable beats being passionate about AI."

**Do not:**
- "Empowering the next generation of innovators"
- "Supercharge your AI journey"
- "Unleash your potential"
- Anything you could paste onto another organisation's site unchanged.

Say what is true, including when it is small. "Three people came and two of them
finished something" is a better sentence than any adjective.

### Specific rules

- **Numbers must be real.** No member counts, project counts, or outcome
  statistics unless they are true today. An empty index is fine; a made-up
  number is not.
- **Never fake availability.** A closed programme says it is closed and offers
  the next best route. It does not collect applications nobody can act on.
- **A project is listed at its real stage.** An idea is an idea.
- **No emoji in UI.** They are not icons here.

## Languages

English is published today. Russian (`/ru`) and Kazakh (`/kk`) are routed and
the fonts are verified for both, but **neither is published until a native
speaker writes the copy.**

The design rule is that a page never mixes languages and never shows a machine
translation. A half-translated page is worse than an honest "English only" —
so the language switch shows KZ and RU as clearly unavailable rather than
linking to something broken.

When you translate:

1. Add the translated Markdown with `lang: kk` (or `ru`) and a
   `translationKey` matching the English entry.
2. Decks and headlines are **line-broken by hand per language**, never
   machine-wrapped.
3. Check `/dev/glyphs` — Cyrillic sets taller than Latin and headline leading is
   adjusted for it.

## Review

Content pull requests get a light review — is it true, is it in the voice, does
it build. Design and infrastructure changes get a closer one. `CODEOWNERS`
routes them.
