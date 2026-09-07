---
title: Publish in Kazakh and Russian without machine translation
status: draft
area: platform
effort: L
depends_on: []
---

# 025 — Publish in Kazakh and Russian without machine translation

| | |
|---|---|
| **Status** | draft |
| **Area** | platform |
| **Effort** | L |
| **Depends on** | — |

## Problem

QAIRU's own site serves Kazakh at the root and offers `KZ — Қазақша`,
`RU — Русский`, `EN — English`. QairuHub, the student community inside that
university, publishes only in English. A first-year from Kyzylorda lands on
`qairuhub.com`, sees `LEARN IT. BUILD IT. LAUNCH IT.` above a masthead where
`ҚАЗ` and `РУС` are grey `<span>`s with `title="Coming soon"`, and reads the club
as something for the English-medium students. A legitimacy problem, not a
convenience one.

Nothing consumes the i18n config that exists. `astro.config.mjs` declares
`locales: ['en', 'ru', 'kk']`, but `Base.astro` hardcodes `<html lang="en">` and
emits one canonical with no `alternate` links; `@astrojs/sitemap` runs without
its `i18n` option; `src/lib/site.ts` keeps `LOCALES` (one) and `PLANNED_LOCALES`
(two) as hand-written constants because there is no availability to compute; and
`src/lib/content.ts` filters on neither `lang` nor `translationKey`.
`docs/STATUS.md` already records the consequence as open: "It has to be addressed
before the second language ships, or an index would list the same entry twice."

So the work is not "translate the site": make the queries locale-aware,
availability computed rather than asserted, decide what a half-translated site
says about itself, and only then hand a volunteer something to write.

## Prior art

**[Astro's i18n routing guide](https://docs.astro.build/en/guides/internationalization/)**
and its [config reference](https://docs.astro.build/en/reference/configuration-reference/).
*Steal:* `astro:i18n`'s URL helpers, so no component builds a locale path by
concatenation. *Reject outright:* `i18n.fallback`. Under `fallbackType:
"rewrite"` a visitor to a missing page "will be shown the content for" the
fallback locale "without being redirected" — English prose at a `/kk/` URL under
`lang="kk"`. That is the half-translated page `docs/CONTENT.md` forbids,
delivered by a config flag. We ship **no `fallback` key**, and the absence needs
a comment saying why or someone will helpfully add it.

**[Google Search Central, localized versions of a page](https://developers.google.com/search/docs/specialty/international/localized-versions)**.
"Each language version must list itself as well as all other language versions",
and "If two pages don't both point to each other, the tags will be ignored."
*Steal:* self-referential, reciprocal `hreflang` generated from the same
availability function the switch uses, so the two cannot disagree. *Leave:*
region codes — there is no `kk-KZ` versus `kk-CN` problem here.

**[MDN's translated content policy](https://developer.mozilla.org/en-US/docs/MDN/Community/Translated_content)**.
Mozilla archived every locale except eight with active teams, because "a lot of
unmaintained and out-of-date content ended up in non-English locales". *Steal:*
a locale ships only with a named human attached, and an unmaintained one is
archived rather than left to rot. *Leave:* the machine-translated `de` and `it`
experiment.

**[MediaWiki's Content Translation quality limits](https://www.mediawiki.org/wiki/Help:Content_translation/Translating/Translation_quality)**.
Wikipedia does not ask translators to behave: "Publication is blocked if 95% or
more of the whole document consists of unmodified, machine translated content",
a paragraph is problematic above 85% unmodified MT, and 50 such paragraphs block
publishing. *Steal:* that an anti-MT rule is enforced by tooling, not by a
paragraph in a contributing guide. *Leave:* the thresholds; we forbid MT
outright, so the guard differs in kind (see Risks).

**Three Kazakh sites, three answers.** [QAIRU](https://qairu.edu.kz/) — Kazakh at
the root, `/ru`, `/en`, switcher `KZ` / `RU` / `EN`; *steal* the parent
institution's own answer to the default-locale question.
[Tengrinews](https://tengrinews.kz/) — Russian at the apex, Kazakh at
`kaz.tengrinews.kz`, English at `en.tengrinews.kz`; *leave* the subdomains, which
mean three Worker custom domains in the dashboard.
[Astana Hub](https://astanahub.com/en/) — `/en/`, `/ru/`, `/kz/`; *leave the
mistake:* `kz` is the ISO 3166 country code, and Google's rule above says the
first `hreflang` code "stands for the language" in ISO 639-1. Kazakh is `kk`.

Cost is not the constraint: for Workers static assets, "[requests to static
assets are free and unlimited](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)".
Tripling ~20 routes to ~60 files costs attention, not money.

## Proposal

**One locale per page, no fallback, availability computed.**

1. **A UI string catalogue**, `src/i18n/ui.ts`, typed
   `Record<Locale, Record<UiKey, string>>` so a missing Kazakh key is a
   `pnpm typecheck` failure rather than an English word on a Kazakh page. `NAV`
   labels move here; the tagline and motto become per-locale arrays, because
   §5.4 requires them line-broken by hand per language.

2. **Locale-aware queries.** `getPublished(collection, locale)` filters
   `entry.data.lang === locale`, and every helper takes the locale through. A new
   `getTranslations(collection, translationKey)` returns the locales an entry
   exists in — the single source of truth for the switch *and* `hreflang`.

3. **Availability, not a hand-written list.** Delete `PLANNED_LOCALES`. The
   switch asks whether *this* route exists in that locale: on an index, whether
   the page file exists; on a detail page, whether a sibling shares the
   `translationKey`. A locale with no counterpart keeps the `.lang__planned`
   style and states a real reason, not "Coming soon".

4. **Honest partial coverage.** An untranslated entry never appears in a
   translated index — the `lang` filter fixes the double-listing bug STATUS.md
   predicted. Each translated index instead closes with one mono line,
   `04 ЖАЗБА АҒЫЛШЫН ТІЛІНДЕ ҒАНА →`, linking to the English index: the gap
   stated in the reader's own language, offering what exists. No route is
   generated for a missing translation, so the switch never links into a 404, and
   the 404 page becomes locale-aware.

5. **Head tags.** `<html lang={locale}>`. Canonical stays self-referential per
   locale — never cross-language, which would ask Google to drop the Kazakh page.
   `hreflang` alternates only for locales that genuinely have that page,
   self-reference included, plus `x-default` on the English URL while English is
   default. `@astrojs/sitemap` gains
   `i18n: { defaultLocale: 'en', locales: { en: 'en', ru: 'ru', kk: 'kk' } }`
   with a `serialize` stripping alternates for untranslated routes.

**The default-locale question. Recommendation: flip, but not first.**
`docs/DESIGN.md` §13 specifies `/` = `kk` and QAIRU's own site agrees; it is the
right end state. It is the wrong first move, because it puts the *least*
complete language at the most linked address and rewrites every English URL on a
live site. Flip on a stated trigger: Kazakh covers the eight routes below, a
named maintainer exists, the design-law suite passes in Kazakh at 1280px. Then:

```js
// astro.config.mjs — phase 4 only
i18n: {
  defaultLocale: 'kk',
  locales: ['kk', 'ru', 'en'],
  routing: { prefixDefaultLocale: false },
  // No `fallback`: rewriting would serve English prose at a /kk/ URL.
}
```

Every `src/pages/*.astro` moves to `src/pages/en/`, `x-default` moves to `/`, and
`/about` → `/en/about` needs permanent redirects. Astro's `redirects` map is the
mechanism; verify whether the adapter emits `_redirects` or meta-refresh HTML
before relying on it, and keep them out of `wrangler.jsonc`, which the adapter
regenerates.

## Scope

**Phase 1 — plumbing, zero translated words (M).** Locale-aware `Base.astro`,
`getPublished(collection, locale)`, `src/i18n/ui.ts` with only `en` filled,
availability-driven switch, locale-aware 404, sitemap `i18n`. Output is
byte-identical apart from head tags. New guard `scripts/check-i18n.mjs`: every
`hreflang` target exists in `dist/`, every alternate is reciprocal.

**Phase 2 — Kazakh, eight routes (M),** in the order a prospective member reads
them: `/kk`, `/kk/programs`, `/kk/events`, `/kk/people`, `/kk/apply`,
`/kk/contact`, `/kk/about`, `/kk/docs/charter`. Detail pages arrive with their
content, never ahead of it.

**Phase 3 — Russian, the same eight,** not gated on Kazakh.
**Phase 4 — the default flip,** only on the trigger above.

Out of scope: translating form *submissions*, a translated admin view,
per-locale OG images (proposal 020).

## Data and schema

`src/content.config.ts`, in `base`:

```ts
lang: z.enum(['en', 'ru', 'kk']),              // was .default('en')
translationKey: z.string().min(1),             // was .optional()
```

Both become required. A default on `lang` means a Kazakh file that forgets the
field publishes as English — the silent failure to design out. An entry with no
`translationKey` is invisible to the switch and to `hreflang`, and looks fine.

Files live in a per-locale subfolder, `src/content/events/kk/<slug>.md`, which
the existing `glob({ pattern: '**/*.{md,mdx}' })` picks up already — but the
entry `id` becomes `kk/<slug>`, so `getStaticPaths` must build the URL param
from `translationKey`, not `entry.id`, or the route becomes
`/kk/events/kk/<slug>`.

One D1 migration: `ALTER TABLE submissions ADD COLUMN lang TEXT NOT NULL DEFAULT
'en';`, set from the page the form was rendered on, so a reply goes back in the
language the person wrote in.

## Design

No new component and no new cobalt: the switch already exists in the masthead
(§0) and colophon (§10.6) as `ҚАЗ / РУС / ENG`, and this only makes its states
real. Three rules do the work. §5.4: decks and mottos are authored per language,
so `ҮЙРЕН. / ЖАСА. / ІСКЕ ҚОС.` is data, not a transform. §16: measure the
section index in Kazakh at 1280px before shipping — `БАҒДАРЛАМАЛАР` against
`Programmes` is the row that breaks, and Kazakh runs about 20% longer. §5.2:
`/dev/glyphs` and `pnpm check:fonts` already verify all nine Kazakh letter pairs
in Onest, Geist and Geist Mono, so the type stack is unchanged. The empty state
is the mono "English only" line — a designed statement of a real gap, consistent
with the placeholder rule.

## Risks and trade-offs

**Rot is the main risk, and MDN is the evidence.** English is edited, Kazakh is
not, and the Kazakh reader gets last term's facts with no warning. Mitigation:
compare `updatedDate` across a `translationKey` at build time, warn in the build
log, and print a mono line — `АҒЫЛШЫН НҰСҚАСЫ 12.03.2027 ЖАҢАРТЫЛДЫ` — rather
than hiding the page. Stale-and-labelled beats silently stale.

**The MT ban needs a mechanism, not trust.** Ours is cruder than Wikipedia's:
translated content arrives by pull request from a named person, `CODEOWNERS`
routes non-`en` content to that locale's maintainer, and the PR template asks who
wrote it, in what language, from what source. There is no honest automated MT
detector at this budget, and claiming one would itself break the honesty rule.

**The volunteer graduates, and reviewer load triples.** A locale with no named
maintainer for two terms is archived: files out of the glob, routes gone, switch
back to unavailable. The review cost is paid on every content PR, forever.

**Script.** Kazakhstan's announced move of Kazakh to a Latin alphabet would
eventually make `kk` ambiguous and `kk-Cyrl` / `kk-Latn` meaningful — keep the
locale code in one constant.

**Performance.** No JS is added, so the <100KB budget is untouched. But fonts are
subset by `unicode-range`: an English visitor never fetched the Cyrillic files
and a Kazakh visitor now will. Measure the `cyrillic` and `cyrillic-ext` woff2
files in `dist/_astro/` and confirm LCP on `/kk` against the 1.8s budget before
phase 2 ships, rather than assuming the English numbers carry over on mobile data
in Astana.

## Success

Honestly measurable with Cloudflare Web Analytics alone: share of pageviews on
`/kk/*` and `/ru/*` versus `/`, and form submissions split by the new `lang`
column. Both count things that happened.

Not measurable, and not to be claimed: whether a visitor *wanted* Kazakh. The
site is static, reads no `Accept-Language`, sets no cookie. No honest
denominator exists, so no "Kazakh demand" number appears in any report.

The phase 2 target is coverage, not traffic: eight routes in Kazakh, a named
maintainer, `check-i18n` and the design-law suite green in every published
locale, zero `hreflang` targets that do not exist.

Remove it again if, two terms on, Kazakh has no maintainer or has not grown past
those eight routes: archive the locale, switch back to unavailable. An honest
"not yet" is what the site says today, and reverting to it is not a failure.

## Effort

**L.** Phase 1 is the load-bearing M: `Base.astro`, `src/lib/content.ts`,
`src/lib/site.ts`, `Masthead.astro`, `Colophon.astro`, every `getStaticPaths`,
the sitemap config, the e2e suite. Phases 2 and 3 are writing, not engineering,
and their size is set by the translator. Phase 4 is S in code and M in care. No
dependency on another proposal; proposal 020 (OG images) will need a locale
parameter once phase 2 lands, which is a paragraph there, not a blocker here.
