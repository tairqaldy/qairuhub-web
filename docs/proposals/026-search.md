---
title: Search the index at build time, not the page at request time
status: draft
area: platform
effort: M
depends_on: []
---

# 026 — Search the index at build time, not the page at request time

| | |
|---|---|
| **Status** | draft |
| **Area** | platform |
| **Effort** | **M.** Route and index are S. The Kazakh normaliser is the real work. |
| **Depends on** | Nothing blocking. **025** decides when `/ru` and `/kk` exist; this ships English-only. It forces the open `lang`-filtering item in `docs/STATUS.md`: an index ignoring `lang` lists every entry three times. |

## Problem

There is no search. Today that costs nothing: `src/content/` holds eleven files,
every one `placeholder: true`, and the build emits 13 HTML pages totalling
315,630 bytes.

It stops being free around the third semester. The registry (013), the notes
(015) and the events index accumulate on one axis — one Markdown file per real
thing — and the design refuses the usual escape hatches: no infinite scroll, no
skeletons, no carousel, and §12.1 specifies a pager reading `1 2 3 … 9`. On page
four of a notes index, a student hunting the Friday session where somebody
explained embeddings has no move except scrolling.

The obvious fix is worse. A search box that ships 90 KB of WebAssembly to a
student on mobile data in Astana to find one of forty notes is not a feature.
Neither is a floating result panel, which §10.2 and the `[class*="card"]`
assertion in `tests/e2e/design-law.spec.ts` forbid. And the trilingual case is
not a refinement for later: Kazakh is the language this institution should be
strongest in, and the one every off-the-shelf tool handles worst.

## Prior art

**[Pagefind](https://pagefind.app/docs/multilingual/)** is the correct default
for a static site, so I ran it against this repository's real `dist/client`
rather than repeat its marketing. Pagefind 1.5.2 indexed all 13 pages in 0.029 s
into a 665,238-byte bundle. The critical path is what matters: `pagefind.js` is
45,555 B raw / **12,775 B gzip**, `pagefind-worker.js` 41,255 / **11,850**, the
English WASM 72,206 B — already gzip-compressed on disk, so that is the wire
cost — plus an 8,089 B index chunk and 448–1,431 B per result. Its bundled UI is
unusable here anyway: 29,579 B gzip, and it draws a modal. Worth stealing: the
fragment model, where result metadata loads lazily per result.

**[Snowball](https://snowballstem.org/algorithms/)** publishes 49 stemmers.
Russian is there, Turkish is there, Kazakh is not — nor any other Turkic
language. **[Elasticsearch's language
analyzers](https://www.elastic.co/docs/reference/text-analysis/analysis-lang-analyzer)**
tell the same story from another vendor: 34 analyzers, Russian and Turkish
included, no Kazakh. Confirmed downstream — Pagefind over three pages tagged
`lang="kk"`, `"ru"` and `"en"` prints:

```
Note: Pagefind doesn't support stemming for the language kk.
Search will still work, but will not match across root words.
```

and writes `"kk":{...,"wasm":null}` into `pagefind-entry.json`. Kazakh gets no
language WASM and falls back to `wasm.unknown.pagefind` — 68,023 B of engine
doing nothing for it. Russian gets a real 70,560-byte stemmer.

**[Cloudflare AI Search](https://developers.cloudflare.com/autorag/platform/limits-pricing/)**
is free in open beta within 20,000 queries a month, but "Workers AI and AI
Gateway usage is billed separately" —
[Workers AI](https://developers.cloudflare.com/workers-ai/platform/pricing/)
gives 10,000 Neurons a day free, then $0.011 per 1,000.
[Vectorize](https://developers.cloudflare.com/vectorize/platform/pricing/) gives
5 M stored and 30 M queried vector dimensions free: at 768 dimensions, 6,510
vectors and 39,062 queries a month. Both fit this site financially and both are
the wrong shape. Every query is a Worker invocation plus an embedding call, a
round trip from Astana before the first result; beta pricing is not a budget;
and the generative half collides with `docs/CONTENT.md`, since a model writing
summaries of what QairuHub does is the exact failure the site refuses.

**[D1 supports FTS5](https://developers.cloudflare.com/d1/sql-api/sql-statements/)**,
which is useful and not the answer. Its `unicode61` tokenizer does no stemming
for any language and `porter` is English-only, so it inherits the Kazakh problem
whole and adds a Worker invocation plus a D1 read per query. It wins when the
index is too large to ship: six figures of rows, not 150. Meanwhile [static
asset requests on Workers are "free and
unlimited"](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) —
a JSON file in `dist/client` costs nothing per query, with no beta.

## Proposal

A build-time JSON index per language, a real `/search` route, and about 10 KB of
JavaScript loaded on that route and nowhere else. Content routes ship what they
ship today: zero.

The part that is not off-the-shelf is a normalisation function applied
identically at index time and query time. Two things break Kazakh search, and
neither is stemming in the Snowball sense.

**Keyboard substitution.** Kazakh Cyrillic has 42 letters — the 33 Russian ones
plus `ә ғ қ ң ө ұ ү һ і`. A student on a phone with a Russian layout types the
nearest lookalike. Folding those nine pairs at both ends fixes it.

**Agglutination with stem alternation.** Suffixes stack, so prefix matching
handles much of it: `хакатонға`, `хакатондарда` and `хакатон` share a prefix.
The failure is stem-final voicing — `қонақ` → `қонағы`, `кітап` → `кітабы` —
where the stem changes and no prefix match can help.

On nine hand-written forms, naive substring matching returned 3 of 9. Fold, plus
an ordered suffix list, plus devoicing applied **only when a suffix was actually
stripped**, returned 9 of 9. The condition matters: unconditional devoicing
turns `жоба` into `жоп` and breaks a word that already worked. Nine cases is a
demonstration, not an evaluation. Russian needs far less — lowercase, fold `ё`
to `е`, prefix match — because its inflection leaves the stem alone.

## Scope

**Phase 1, English, one route.** `src/pages/search-index[lang].json.ts` with
`getStaticPaths`, reading through the existing `getPublished` helpers so the
`draft`/`placeholder` rules apply for free. One row per entry: `u` url, `t`
title, `s` summary, `k` kind, `d` date, `g` tags, `n` normalised key. `/search`
is prerendered, reads `?q=`, fetches the index once and filters. The masthead
gains one nav item.

**Phase 2**, `src/lib/normalise.ts` and a Vitest table of Kazakh and Russian
forms, shared by build and client so the two cannot drift. **Phase 3**, the
Kazakh and Russian indexes, when 025 publishes them.

**Not proposed:** body-text search, autocomplete, typo tolerance beyond
MiniSearch's `fuzzy`, search analytics, or anything server-side.

## Data and schema

No `src/content.config.ts` change, no D1 migration, no new binding. Every field
already exists. One `public/_headers` entry:

```
/search-index.*.json
  Cache-Control: public, max-age=300, stale-while-revalidate=86400
```

Sizes, measured on synthetic indexes with realistic vocabulary variance:

| Entries | Raw | Brotli |
|---|---|---|
| 150, English | 50,557 B | **9,584 B** |
| 150, Kazakh | 81,272 B | **10,582 B** |
| 400, Kazakh | 217,381 B | 25,367 B |
| 150, Kazakh, with 350-word bodies | 824,551 B | 77,196 B |

Cyrillic costs two UTF-8 bytes per character, inflating raw size about 1.6×;
Brotli reduces that to a 10% penalty.

That table decides it. Metadata-only the index is 10 KB; add body text and it is
77 KB, climbing linearly, at which point Pagefind's chunking is the better
engineering. On the wire,
[MiniSearch](https://github.com/lucaong/minisearch) is [5,814 B
gzip](https://bundlephobia.com/package/minisearch), normaliser and UI about
4 KB, index 10.5 KB — roughly **21 KB fetched on page load**. Pagefind's Kazakh
floor is 12,775 + 11,850 + 68,023 = **92,648 B fetched on the first keystroke**.
At 63 B per entry, this site needs about **1,400 published entries** before
Pagefind's fixed cost pays for itself; it has zero today and will plausibly have
150 in three years. On a 400 kbps link that is 0.4 s against 1.9 s, before WASM
compilation on the cheap Android panel §14 already requires testing on.

Ship the rows and call `addAll()`, not `MiniSearch.loadJSON`: a serialised index
is larger than the rows it came from.

## Design

`/search` is an INDEX (§12.1) with the PLATE removed. §7.2 says every page
carries exactly one; §12.5 already exempts 404 in practice. Write the amendment
down — the Playwright assertion is already `toBeLessThanOrEqual(1)`, so only
prose changes.

No modal, no dropdown, no floating panel. Results render in the page flow as
RECORD rows, hairline-separated, with a mono meta line and the rank numeral in
the rail. The input is a plain field under §10.5: no box, 1px `--rule-strong`
bottom rule, 44px, focus taking it to 2px cobalt plus the outline at 3px offset.
The four-icon budget in §10.4 has no magnifying glass in it, so the masthead
carries the word — `SEARCH` / `ІЗДЕУ` / `ПОИСК` in `m-label` mono. Matches take
`--cobalt-text` and a 1px underline, never a fill; §8.3 bans cobalt washes by
name, and the rail numeral doubles the signal so colour never carries meaning
alone. The count is tabular data: `12 RESULTS`.

**Empty state**, before anything is typed: the head, one lead line, and an
honest scope statement — *titles, summaries and tags of events, projects, notes,
people and programmes; not the body text of a note.* Saying what is not searched
is the same rule as saying a programme is closed.

**No results**, echoing §12.5's treatment of a missing path: `NOTHING FOUND`,
the query repeated in `m-data`, then the fact rather than the apology — *the
site has 4 published entries. It may simply not be here yet.* When an index is
genuinely small, "try different keywords" is a lie about whose fault it is. Two
section links follow. No illustration, no centring.

Search never crosses languages: `/search` queries the current locale's index
only, and while `/kk` and `/ru` are unpublished it exists in English alone.

## Risks and trade-offs

**The normaliser is written by someone who does not speak Kazakh.** This is the
real risk and care does not mitigate it. A native speaker must review the suffix
list before phase 2 lands, and the Vitest table is what they review. If nobody
is available, ship phase 1 English-only and leave the hook empty rather than
guess.

**Over-stemming.** `жоба` → `жоп` sits in the test file as a regression guard
because a plausible rule produced it. A minimum stem length and an explicit
ordered list contain it;
[apertium-kaz](https://github.com/apertium/apertium-kaz) (GPL-3.0, finite-state)
is the only complete answer and is too large both to ship and to maintain here.

**Latin Kazakh.** The [transition to a Latin
alphabet](https://en.wikipedia.org/wiki/Kazakh_alphabets) is scheduled to finish
in 2031. A student typing `qonaq` matches nothing. Transliteration is a known,
deferred second fold — cheap to add, wrong to guess at now.

**We give up body-text search.** Someone searching a phrase from inside a note
will not find it: a genuine loss, stated rather than hidden, and the specific
thing that would make Pagefind correct instead.

**A second thing to keep in sync**, mitigated by deriving the index from
`getPublished` and by a guard failing the build when index rows do not equal
published entries.

## Success

- Content routes still ship 0 bytes of search JavaScript, asserted in the 027
  budget check rather than eyeballed.
- `/search` total transfer stays under 30 KB compressed, or the build fails.
- The Kazakh test table passes and holds at least 40 real forms from a native
  speaker, not the nine written here.
- A student finds a six-month-old note in one query.

**What would tell us to remove it.** If the index never exceeds 30 entries, the
pager is enough and this is a maintained dependency serving nobody. Delete it.

**What would change my mind toward Pagefind.** Crossing roughly 1,400 published
entries; deciding body-text search is required; or Pagefind shipping a Kazakh
stemmer, at which point its fixed cost buys something this cannot build.

**Toward Cloudflare AI Search.** Only if it leaves beta with committed pricing,
offers retrieval with no generated prose, and somebody builds a labelled Kazakh
relevance set to evaluate it against. Without that set we would be choosing a
search engine on vibes, and the honesty rule applies to the platform too: do not
adopt what cannot be measured.

## Effort

**M.** The JSON endpoint and `/search` are about a day. The normaliser and its
test table are two to three days, most of it the review loop with a Kazakh
speaker — that loop is the schedule risk. Design-law amendments and the build
guard are half a day. No new vendor, no new binding, no recurring cost.
