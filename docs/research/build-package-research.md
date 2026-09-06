# QairuHub Website — Research & Build Package (qairuhub.com)

## TL;DR
- **Build qairuhub.com as an Astro 6 site on Cloudflare Workers** (not Next.js): Cloudflare's press release confirms The Astro Technology Company team joined Cloudflare on **January 16, 2026**, Astro 6's `astro dev` now runs on the real `workerd` runtime with native D1/KV/R2 access, and a student-org site is ~90% content — the case Astro wins. Use React islands only for interactive bits (forms, calendar).
- **Escape "AI slop" by committing to one bold direction derived from QAIRU's real brand:** editorial × terminal, uppercase mono eyebrow labels, near-black canvas + one electric accent (no purple gradients), a distinctive display+mono type pairing (never Inter-everywhere), a real grid with asymmetry, and restrained purposeful motion. QAIRU's own site is a quiet black/white editorial Next.js site — QairuHub is its darker, denser, developer-native sibling.
- **The deliverables below are paste-ready:** `CLAUDE.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT.md`, `docs/BUILD-PLAN.md`, and a master Claude Code kickoff prompt — all embedding the hard rule that Claude must **never** attribute itself anywhere in code, commits, docs, or the site.

## Key Findings
1. **Stack is decided by Cloudflare's own strategy.** Cloudflare acquired Astro's team (Jan 16, 2026, per Cloudflare's press release, which names Astro users as "major brands like Unilever, Visa, and NBC News, as well as hundreds of thousands of developers"); Astro stays MIT open source. Astro 6's dev/preview run on `workerd`, so bindings behave locally exactly as in production — the single biggest DX advantage over Next.js's OpenNext build-transform loop.
2. **QAIRU's brand is monochrome-editorial, not ornamental.** The university site is a restrained black/white Next.js app with wordmark identity, uppercase Cyrillic eyebrows, numbered lists, and EXPO/Nur-Alem photography as the only color. That gives QairuHub a clear, safe "family" to diverge from into dark + electric-accent + mono-voice.
3. **Trilingual support (Kazakh/Russian/English) is the deciding font constraint.** Satoshi/General Sans are Latin-only and disqualified for body text; Geist has full Cyrillic including Kazakh glyphs (a redesigned Cyrillic shipped in Geist v1.7.0 on Jan 29, 2026).
4. **Anti-slop is now codified.** Anthropic's official `frontend-design` skill explicitly bans generic fonts (Inter/Roboto/Arial) and purple-gradient-on-white, and prescribes dominant-color-plus-sharp-accent palettes — exactly the direction below.

## Details

### A1. QAIRU brand analysis + QairuHub derivation
The official QAIRU site (qairu.kz / qairu.edu.kz, fetched Sept 2026) is a **Next.js** app (`/_next/image` optimizer, `og/qairu.jpg` cards). Visual system:
- **Wordmark, not a mark:** black `qairu-wordmark-black.png` on white; inverted white wordmark in the footer — the same pattern as QairuHub's existing dark-wordmark-on-white avatar.
- **Editorial, restrained:** large uppercase section eyebrows (ИНФРАСТРУКТУРА, ИССЛЕДОВАНИЯ, ГРАНТЫ, ПОЧЕМУ QAIRU), big sans headlines, generous whitespace, numbered step lists (01/02/03/04), photography-forward sections (EXPO "Nur Alem" sphere at night, robotics lab).
- **Palette:** effectively monochrome — near-black text on white, black inverted footer; photography supplies the color. No loud brand hue is exposed in markup. Tone: confident, national-scale, plain declaratives; tagline "Alma-mater of AI"; anchored to EXPO, Alem.ai, AlemLLM, alem.cloud.
- **Trilingual:** KZ/RU/EN toggle — Cyrillic + Kazakh + Latin all first-class.

**National cues:** QAIRU leans on the EXPO/Nur-Alem sphere and the Mangilik El address, not folk ornament. The modernist Astana-institutional look (lots of white, hard grids, monumental photography) is the cue to echo.

**QairuHub derivation ("in the family, but the builder sibling"):**

| Dimension | QAIRU (parent) | QairuHub (student/builder) |
|---|---|---|
| Mode | Light, institutional | **Dark-first**, dev-native (light mode available) |
| Type | Clean sans, editorial | Distinctive **display + mono** pairing; mono as UI voice |
| Color | Monochrome + photography | Black/near-black + **one electric accent** (signal, not gradient) |
| Layout | Calm editorial grid | Same grid DNA, **more asymmetry/density, ticker energy** |
| Voice | "Alma-mater of AI" | "Learn it, build it, launch it." — imperative, shipping-focused |
| Motion | Minimal | Purposeful: one orchestrated load, scroll reveals, hover states |

Shared DNA to preserve: uppercase mono eyebrows, wordmark-first identity, numbered lists, photography-as-color, whitespace discipline, trilingual from day one.

### A2. Reference gallery + analysis of designmd.ai/chef/rawblock
**designmd.ai/chef/rawblock** is a "RawBlock" brutalist design-system spec. Its transferable craft levers: **thick 3–5px borders as the organizing structure, replacing shadows entirely**; **full color inversion on hover/active** (black↔white) instead of opacity fades; a real 3-role type system (Archivo Black display 48–64px + Work Sans body + Space Mono); an **8px spacing base with intentional asymmetry**; uppercase + tracking for labels; sharp corners, no decorative imagery. The lesson for QairuHub: **borrow the discipline** (locked tokens, borders-as-structure, real type hierarchy, inversion states, mono labels) **but not the literal brutalism** — QairuHub is "editorial × terminal," warmer than pure RawBlock.

**Steal list (URLs + what to borrow):**
1. **Linear** (linear.app) — surface/border discipline, keyboard-crisp density, one orchestrated page-load.
2. **Vercel** (vercel.com) — Geist type system, black/white + sharp accent, OG image system.
3. **Stripe** (stripe.com) — editorial density that still breathes; impeccable grid.
4. **Raycast** (raycast.com) — dark surface layering, product-screenshot storytelling without glassmorphism.
5. **Resend** (resend.com) — minimal, mono accents, docs-adjacent marketing voice.
6. **Cursor** (cursor.com) — dark hero without the three-card cliché, bold single accent.
7. **Anthropic** (anthropic.com) — editorial calm, warm off-white; a light-mode reference.
8. **Y Combinator** (ycombinator.com) — directness, application-funnel clarity, everything links to action.
9. **a16z Speedrun** (speedrun.com) — cohort/community energy; per its own SR006 recap, "Over 19,000 startups applied to join the latest class of a16z speedrun, and just over 70 startups were ultimately selected" — steal the tight-cohort framing.
10. **South Park Commons** (southparkcommons.com) — "community of builders" IA.
11. **Recurse Center** (recurse.com) — values/《how we work》pages done as prose.
12. **Buildspace** (buildspace.so, archived) — cohort hype, "nights & weekends" energy.
13. **MLH** (mlh.io) — hackathon/event IA and season framing.
14. **TreeHacks / HackMIT** (treehacks.com, hackmit.org) — hackathon landing structure, sponsor tiers.
15. **Waterloo Velocity** (velocityincubator.com) — programs + outcomes framing.
16. **Stanford BASES** (bases.stanford.edu) — multi-program umbrella structure (mirrors QairuHub's sub-units).
17. **Berkeley ML@B** (ml.berkeley.edu) — projects registry + education tracks.
18. **Contrary / Pear / Founders Inc** (contrary.com, pear.vc, f.inc) — people-forward "the network" pages.
19. **Astana Hub** (astanahub.com) — local partner credibility, bilingual patterns.
20. **Awwwards / Godly / SiteInspire / Land-book / Mobbin / Refero** — filter for "community/accelerator/university/developer tools"; mine at the section level, don't copy wholesale.

### A3. Anti-slop checklist + craft checklist
Grounded in Anthropic's official `frontend-design` skill (SKILL.md: avoid "generic AI slop aesthetics," AVOID "Arial, Inter, Roboto, system fonts," AVOID "Purple gradients on white (cliched AI aesthetic)," and "Dominant colors with sharp accents outperform timid, evenly-distributed palettes"), plus the community anti-slop literature.

**Anti-slop (banned by default):**
- ❌ Purple/indigo→blue gradients; gradient text; glow.
- ❌ Glassmorphism / frosted translucent cards.
- ❌ Centered hero + exactly three icon feature cards.
- ❌ Inter/Roboto/Arial/system font as the display face.
- ❌ Emoji as UI icons.
- ❌ Uniform 16px radius + identical padding everywhere (no hierarchy).
- ❌ Lorem ipsum; clichés ("Empowering the future," "Supercharge," "Unleash," "Transform your X").
- ❌ Untouched default shadcn gray + Tailwind blue.
- ❌ Bounce/scale/spring hover on everything.
- ❌ Abstract gradient-blob illustrations.

**Craft (required):**
- ✅ One committed aesthetic direction, locked in DESIGN.md tokens (editorial × terminal).
- ✅ Distinctive display + mono type pairing; mono as a deliberate UI voice.
- ✅ Real 12-column grid with intentional asymmetry and varied module sizes.
- ✅ Near-black canvas + a single electric accent used as signal.
- ✅ Editorial hierarchy: oversized headlines, uppercase mono eyebrows, clear scale steps.
- ✅ Borders/rules as structure (the RawBlock lesson); restrained shadows only where meaningful.
- ✅ Real content, real photography (Astana/EXPO, real members), real project data.
- ✅ Purposeful motion: one orchestrated staggered page-load + scroll reveals on key sections; `prefers-reduced-motion` fully honored.
- ✅ APCA/WCAG-checked contrast on every text/bg pair.
- ✅ Density that respects the reader (Linear/Stripe standard).

Also load into the repo: Anthropic's `frontend-design` skill (`npx skills add https://github.com/anthropics/skills --skill frontend-design`) and reference Refactoring UI, Practical Typography, Rauno Freiberg's craft notes, and Emil Kowalski's animation principles as the canon.

### A4. Stack decision
**Recommendation: Astro 6 + React islands, deployed to Cloudflare Workers via `@astrojs/cloudflare`.**

| Option | SSR/SSG | Forms/API | CF primitives | Fit | Verdict |
|---|---|---|---|---|---|
| **Astro 6 + React islands (CF Workers)** | Static by default, on-demand per route | Astro endpoints / island + Worker | Native (adapter builds on Cloudflare Vite plugin; D1/KV/R2 in dev via workerd) | ~90% content, zero-JS default, React where needed | ✅ **Chosen** |
| Next.js App Router via `@opennextjs/cloudflare` | Full SSR/RSC | Route handlers / server actions | Good, but slow build-transform dev loop; Worker size limits (3 MiB free / 10 MiB paid, gzipped) | Overkill; ships 85–250KB JS a content site doesn't need | Runner-up only if it becomes an app |
| Remix / React Router v7 (CF Workers) | Full SSR | Loaders/actions | Good | Great for apps, more JS than needed here | No |
| TanStack Start | Full SSR | Server functions | Workable | Newer, smaller ecosystem, no content-collection story | No |

**Why Astro wins (2026 facts):**
- **Cloudflare owns Astro's future.** Cloudflare's press release confirms the Astro team joined Cloudflare on **January 16, 2026** ("The Astro Technology Company team, the creators of the Astro web framework, will be joining Cloudflare"); Astro stays MIT open source; Astro 6 beta shipped the same week with Cloudflare Vite plugin integration.
- **Dev = prod runtime.** In Astro 6, `astro dev`/`astro preview` run on the real `workerd` runtime, so **D1, KV, R2, and Workers AI bindings behave locally exactly as deployed** — the biggest DX win over OpenNext.
- **Performance/SEO by default:** ~0–5KB JS vs Next's ~85–120KB; Lighthouse 95–100 typical on content sites.
- **Content Collections** give typed Markdown/MDX with Zod schemas — exactly the "members edit via PR" model needed. React islands cover forms/calendar/filters without paying React's cost site-wide.

**Current package/version facts & gotchas (Astro on Cloudflare, 2026):**
- Adapter `@astrojs/cloudflare` v14.x (Astro 6 requires v13+); install `npx astro add cloudflare`.
- Config `adapter: cloudflare()` + `output: 'server'` (or per-page `export const prerender = false`).
- **Cloudflare Pages support was removed** — the adapter targets **Workers only**; deploy with `wrangler deploy`.
- `platformProxy` / `Astro.locals.runtime` were **removed** in Astro 6; access env via `import { env } from 'cloudflare:workers'`, plus `Astro.request.cf` and `Astro.locals.cfContext`.
- Set `compatibility_flags: ["nodejs_compat"]` and `compatibility_date` ≥ `2024-09-23` (use a recent date, e.g. `2025-05-21`).
- `prerenderEnvironment` defaults to `'workerd'`; set `'node'` if a prerendered page needs `node:fs`.
- Vite 8 gotcha: `astro add cloudflare` may prompt to pin `"overrides": { "vite": "^7" }` to avoid a workerd `require_dist` crash.
- Sessions auto-provision a KV namespace (binding `SESSION`).

**Supporting Cloudflare choices:** D1 (submissions); Turnstile (verify token server-side); Resend via its SDK from the Worker (`resend` npm, `env.RESEND_API_KEY` secret, send in `ctx.waitUntil` so the response isn't blocked); Telegram Bot API notifications; optional n8n webhook; R2 for image originals + Astro's `cloudflare-binding` image service; Cloudflare Web Analytics (cookieless, free) for v1; **Cloudflare Access (Zero Trust)** in front of `/admin` (no user auth in v1); Cloudflare Workers Builds (Git-connected) for per-PR preview URLs.

### A5. Design system decisions
**Type pairing — the Kazakh/Cyrillic verdict decides this.** QairuHub must render Kazakh (Cyrillic + Ә Ғ Қ Ң Ө Ұ Ү Һ І), Russian Cyrillic, and Latin.
- **Satoshi / General Sans (Fontshare): ❌ for body — Latin-only, no Cyrillic.** Fine only as a Latin-only display accent in EN contexts.
- **Geist / Geist Mono (Vercel, OFL): ✅ full Cyrillic** — the Geist v1.7.0 release (published Jan 29, 2026) "introduces a redesigned Cyrillic script for all Geist and Geist Mono styles" (redesign by Guido Ferreyra); also Greek + Vietnamese; free, variable, on Google Fonts and npm.

**Chosen pairing:** **Space Grotesk (display) + Geist Sans (body/UI) + Geist Mono (eyebrows, labels, stats, code).** Space Grotesk gives distinctive mechanical display character (escapes "Inter everywhere") and has Cyrillic coverage — use it for oversized headlines only; Geist Sans carries all body/UI with full Kazakh support; Geist Mono is the "terminal voice" for uppercase eyebrow labels, tags, stats. **Verify at build time:** run a Kazakh pangram with Ә Ғ Қ Ң Ө Ұ Ү Һ І through each face; if Space Grotesk misses a Kazakh glyph, fall back to Geist Sans for that string.
*Alternatives:* (a) Geist + Geist Mono only (max safety); (b) IBM Plex Sans + IBM Plex Mono (excellent Kazakh Cyrillic, institutional feel); (c) Instrument Serif (EN-only display accent) + Geist for a more editorial light mode.

**Color palette (OKLCH, dark-first):**
```
--bg:            oklch(0.16 0.006 265);   /* near-black */
--bg-elevated:   oklch(0.21 0.007 265);   /* card/surface */
--border:        oklch(0.30 0.008 265);   /* hairline rules */
--fg:            oklch(0.97 0.004 265);   /* primary text */
--fg-muted:      oklch(0.72 0.008 265);   /* secondary text */
--accent:        oklch(0.72 0.19 149);    /* electric green — "ship/go" */
--accent-fg:     oklch(0.16 0.006 265);
--success: oklch(0.72 0.17 150); --warning: oklch(0.80 0.16 80); --danger: oklch(0.63 0.22 25);
```
Near-black + one electric-green accent reads as "build/ship/go," avoids the purple-slop default, and differentiates from QAIRU's institutional white while staying monochrome-plus-signal. *Accent alternatives:* electric lime `oklch(0.85 0.20 128)` or a QAIRU-echo cobalt `oklch(0.62 0.20 255)`.

**Spacing/grid/radius/shadow/motion:** space base 4px (4/8/12/16/24/32/48/64/96/128); grid 12-col, max 72rem, 24px gutters, broken deliberately for editorial moments; radius 6px max (tags 2px), no pill cards; borders 1px hairline / 2px emphasis carry structure; no shadow on dark (use border + bg-elevated); motion 120/200/320ms, ease `cubic-bezier(0.22,1,0.36,1)`, reveal `cubic-bezier(0.16,1,0.3,1)`, page-load stagger 40–60ms, all gated on `prefers-reduced-motion`.

**Icons:** Lucide (ships with shadcn, consistent 1.5px stroke); no emoji icons. **Motion:** Motion (`motion/react`, formerly Framer Motion) for island component motion + Lenis (<5KB, honors reduced-motion natively) for smooth scroll; add GSAP + ScrollTrigger (made 100% free by Webflow on April 30, 2025, including formerly-paid plugins like SplitText/MorphSVG/ScrollTrigger for commercial use) only for a single showpiece scroll section. Use CSS scroll-driven animations + the View Transitions API (Astro native) for cheap wins.

**shadcn/ui (2026):** `npx shadcn@latest init -d`; Tailwind v4 (CSS `@theme`, tokens as CSS variables in the single global CSS file); Radix base (`--base radix`, the default). Every added component is restyled to the tokens (never ship default gray). **Storybook 10.x** (Vite-powered, works with Astro's Vite + React renderer) with Addon-Vitest (Storybook Test = interaction + a11y + visual in one run), axe-core, and Chromatic or Playwright visual snapshots; import the Tailwind v4 global CSS in `.storybook/preview.ts`.

### A6. Information architecture, content model, forms/data flow
**Sitemap:**
```
/                     Home
/about                Mission, values, structure (sub-units), charter link
/about/charter        Rendered from hub repo (governance, decision log)
/programs             Umbrella overview
  /programs/qairu-ai · /programs/hackathons
  /programs/accelerator  (Spring 2027 — "upcoming")
  /programs/education
/events (+ /events/[slug], /events/past, RSVP)
/apply (+ /apply/membership, /apply/accelerator, /apply/hackathon)
/projects (+ /projects/[slug])
/learn (+ /learn/[slug])   AI Fridays notes/recordings, guides
/community            Telegram, GitHub, how to contribute (PR guide)
/people               Core team + roles (from hub repo)
/partners · /blog (+ /blog/[slug]) · /docs (charter/decisions from hub) · /contact
```

**Content model — Astro Content Collections + Zod (members edit via PR, typed at build):**
```ts
// src/content.config.ts
import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/events' }),
  schema: z.object({
    title: z.string(), starts: z.coerce.date(), ends: z.coerce.date().optional(),
    location: z.string().default('QAIRU / EXPO, Astana'),
    program: z.enum(['qairu-ai','hackathons','accelerator','education']).optional(),
    rsvpUrl: z.string().url().optional(), cover: z.string().optional(),
    status: z.enum(['upcoming','past']).default('upcoming'), summary: z.string().max(200),
  }),
});
const programs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/programs' }),
  schema: z.object({ name: z.string(), slug: z.string(), tagline: z.string(),
    order: z.number().default(0), status: z.enum(['active','upcoming']).default('active'),
    lead: reference('people').optional() }),
});
const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/projects' }),
  schema: z.object({ name: z.string(), slug: z.string(), oneLiner: z.string().max(120),
    team: z.array(reference('people')).default([]), repo: z.string().url().optional(),
    demo: z.string().url().optional(), stage: z.enum(['idea','prototype','launched']).default('idea'),
    tags: z.array(z.string()).default([]), cover: z.string().optional() }),
});
const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/people' }),
  schema: z.object({ name: z.string(), role: z.string(),
    unit: z.enum(['core','qairu-ai','hackathons','accelerator','education','space']).optional(),
    avatar: z.string().optional(), github: z.string().optional(),
    telegram: z.string().optional(), order: z.number().default(0) }),
});
const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: 'src/content/blog' }),
  schema: z.object({ title: z.string(), publishDate: z.coerce.date(),
    author: reference('people'), excerpt: z.string().max(240),
    cover: z.string().optional(), draft: z.boolean().default(false) }),
});
export const collections = { events, programs, projects, people, posts };
```

**Hub repo sync:** use a **git submodule pinned to a tag/commit** (deterministic builds, no build-time API rate limits, works offline in CI), rendering selected markdown into `/docs` and `/about/charter`. Alternative: GitHub API fetch at build (freshest, but adds a token + network dependency). Avoid manual copy (drifts).

**Forms pipeline:**
```
Browser (React island form)
 → Turnstile widget issues token
 → POST /api/apply  (Astro endpoint on Worker)
     1. verify Turnstile token server-side (siteverify)
     2. Zod validate + honeypot + basic rate-limit (D1)
     3. INSERT submission into D1
     4. ctx.waitUntil( Resend email + Telegram Bot API sendMessage + optional n8n webhook )
     5. 200 → client success → redirect /apply/thanks
Admin: /admin/submissions behind Cloudflare Access → D1 table + CSV export
```

**Admin:** no app auth in v1. Put `/admin/*` behind **Cloudflare Access (Zero Trust)** — email-OTP or Google SSO for the core team, enforced at the edge. Minimal, secure v1.

### A7. Tooling / MCP for Claude Code
**MCP servers to actually use (exact `claude mcp add` commands):**
```bash
# Cloudflare (remote, OAuth)
claude mcp add --transport http cloudflare-bindings      https://bindings.mcp.cloudflare.com/mcp
claude mcp add --transport http cloudflare-docs          https://docs.mcp.cloudflare.com/mcp
claude mcp add --transport http cloudflare-builds        https://builds.mcp.cloudflare.com/mcp
claude mcp add --transport http cloudflare-observability https://observability.mcp.cloudflare.com/mcp
# (broad-API option: Code Mode server https://mcp.cloudflare.com/mcp)

claude mcp add --transport http github https://api.githubcopilot.com/mcp/   # GitHub (remote, official)
npx shadcn@latest mcp init --client claude                                   # shadcn official CLI MCP
claude mcp add playwright -- npx @playwright/mcp@latest                       # visual QA/screenshots
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp      # Figma Dev Mode (desktop app open, Dev Mode on)
claude mcp add --transport http context7 https://mcp.context7.com/mcp        # up-to-date library docs
```
- **Playwright MCP** exposes `browser_navigate`, `browser_snapshot` (accessibility tree — preferred for actions), and `browser_take_screenshot` — use it for design/visual review. Node 18+; pin a version in CI.
- **Figma:** the desktop server runs at `http://127.0.0.1:3845/mcp` while the desktop app is open in Dev Mode; Figma also offers a **remote server** at `https://mcp.figma.com/mcp` and now recommends the remote one (broadest feature set). A 403 in Claude Code means the account lacks Dev/MCP access or the token needs reconnecting.
- **Higgsfield MCP:** generate hero/section imagery and dark "AI-infrastructure" illustration with a **fixed seed + a locked style prompt + our palette** so images read as a set. Store originals in R2, export optimized sizes, and avoid the glowing-blue-brain cliché. Canva is optional (social cards) — not part of the build.

**`.mcp.json` (project-scoped, commit to repo):**
```json
{
  "mcpServers": {
    "cloudflare-bindings":     { "type": "http", "url": "https://bindings.mcp.cloudflare.com/mcp" },
    "cloudflare-docs":         { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
    "cloudflare-builds":       { "type": "http", "url": "https://builds.mcp.cloudflare.com/mcp" },
    "cloudflare-observability":{ "type": "http", "url": "https://observability.mcp.cloudflare.com/mcp" },
    "github":                  { "type": "http", "url": "https://api.githubcopilot.com/mcp/" },
    "shadcn":                  { "command": "npx", "args": ["shadcn@latest", "mcp"] },
    "playwright":              { "command": "npx", "args": ["@playwright/mcp@latest"] },
    "figma-desktop":           { "type": "http", "url": "http://127.0.0.1:3845/mcp" },
    "context7":                { "type": "http", "url": "https://mcp.context7.com/mcp" }
  }
}
```

**Claude Code features to leverage:** `CLAUDE.md` at root; `.claude/commands/*.md` slash commands (`/design-review`, `/new-component`, `/ship-check`); `.claude/agents/*` subagents (a **design-review subagent** that runs Playwright screenshots against the anti-slop checklist; an a11y subagent); hooks in `.claude/settings.json` (run `pnpm typecheck && pnpm lint && pnpm format` on edit); install Anthropic's `frontend-design` skill and Cloudflare's skills plugin (`/plugin marketplace add cloudflare/skills`, which includes a `wrangler` skill); git worktrees for parallel work. **Avoid `--dangerously-skip-permissions`** — keep prompts on for anything touching secrets, `wrangler deploy`, or `git push`.

### A8. Repo / CI / deploy blueprint
```
website/
├─ .github/{workflows/ci.yml, workflows/deploy.yml, ISSUE_TEMPLATE/, PULL_REQUEST_TEMPLATE.md, CODEOWNERS, dependabot.yml}
├─ .claude/{commands, agents, settings.json}   .mcp.json
├─ hub/                          # git submodule → github.com/qairuhub/hub (pinned)
├─ src/{content, components/ui (shadcn), components (Hero, Marquee, ProgramCard, EventCard,
│        Timeline, PeopleGrid, ProjectCard, ApplyForm, Stats, Nav, Footer), layouts, pages,
│        pages/api (apply.ts, rsvp.ts, contact.ts), styles/global.css, lib, i18n}   content.config.ts
├─ stories/  .storybook/  public/
├─ astro.config.mjs  wrangler.jsonc  components.json  tsconfig.json (strict)
├─ biome.json  vitest.config.ts  playwright.config.ts  lefthook.yml  .editorconfig  .gitattributes
└─ package.json (pnpm)  CLAUDE.md  docs/{DESIGN.md, ARCHITECTURE.md, CONTENT.md, BUILD-PLAN.md}
```
- **pnpm; TypeScript strict; Biome** (single fast lint+format) or ESLint+Prettier. **Tests:** Vitest (unit) + Storybook Test (component/a11y/visual) + Playwright (e2e apply flow). **Hooks:** lefthook (pre-commit format+lint+typecheck; pre-push test).
- **CI:** `ci.yml` = typecheck → lint → test → `astro build` → Storybook build (Chromatic optional), Node 20, pnpm cache.
- **Deploy:** Cloudflare Workers Builds (Git-connected, automatic per-PR preview URLs); or `deploy.yml` runs `wrangler deploy` on `main` + `wrangler versions upload` for PR previews. Secrets via `wrangler secret put` (runtime) and Actions secrets (CI): `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `RESEND_API_KEY`, `TURNSTILE_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `N8N_WEBHOOK_URL`.
- **Branch model:** `main` (prod) ← `develop` ← `feature/*`. CODEOWNERS gates `src/content/**` (light review for member content PRs) vs `src/components/**`, `docs/**`, infra (core-team review). Dependabot weekly.
- **SEO/OG:** per-page metadata + `@astrojs/sitemap` + `robots.txt`; **dynamic OG images** via `workers-og`/`cf-workers-og` (Satori + resvg-wasm) on `/og/[...].png` (bundle a font; Satori can't fetch external images on Workers — embed as base64).
- **Perf budget + Lighthouse CI:** LCP < 1.8s, CLS < 0.05, JS < 100KB on content routes — fail the build if exceeded.
- **i18n:** EN primary at `/`; scaffold `/ru`, `/kk` with Astro i18n routing and locale-keyed collections; ship EN first. Fonts already cover all three scripts.

---

## Part B — Paste-ready repo documents

### B1. `CLAUDE.md`
```md
# QairuHub Website — Claude Code Project Rules

## 0. HARD RULE — NO AI ATTRIBUTION (non-negotiable)
Never add yourself as author, co-author, contributor, or collaborator anywhere.
- NO `Co-Authored-By: Claude` or any AI trailer in commits.
- NO "Generated with Claude/AI", "built with AI", or similar notes in code,
  comments, docs, READMEs, PR descriptions, or the site.
- NO AI/assistant mentions in package.json authors, meta tags, or footers.
Commits are authored solely by the human developer. If unsure, omit attribution.

## 1. What this is
qairuhub.com — the single source of truth and front door for QairuHub, a
student-driven builder/AI community at QAIRU (Astana). Public marketing + content
site with a few interactive forms. Voice: "Learn it, build it, launch it."

## 2. Stack
- Astro 6 (content-first) + React islands for interactivity.
- Tailwind v4 (CSS `@theme`), shadcn/ui (Radix base), Lucide icons.
- Motion (`motion/react`) + Lenis for motion. Storybook 10 for components.
- Cloudflare Workers via `@astrojs/cloudflare` (Pages is NOT used).
- D1 (submissions), Turnstile (anti-spam), Resend (email), Telegram Bot API,
  optional n8n webhook. Cloudflare Access for /admin. Cloudflare Web Analytics.

## 3. Commands
- `pnpm dev` (workerd, D1/KV/R2 local) · `pnpm build` · `pnpm preview`
- `pnpm typecheck` · `pnpm lint` · `pnpm format` (Biome)
- `pnpm test` (Vitest + Storybook Test) · `pnpm storybook` · `pnpm e2e` (Playwright)
- Deploy: `wrangler deploy` (ASK FIRST — see §7)

## 4. Coding standards
- TypeScript strict. Small, single-purpose components. No `any`.
- Tokens only — never hardcode colors/spacing; use CSS vars from global.css.
- shadcn components must be restyled to our tokens before use.
- Content via Astro Content Collections + Zod (src/content.config.ts).

## 5. Design rules (full spec in docs/DESIGN.md)
- Aesthetic: editorial × terminal. Dark-first, one electric-green accent.
- Type: Space Grotesk (display) + Geist Sans (body) + Geist Mono (labels).
- Grid: 12-col; deliberate asymmetry. Radius 6px max. Borders carry structure.
- Motion: one orchestrated page-load + scroll reveals; honor prefers-reduced-motion.

## 6. DO NOT (anti-slop)
- No purple/blue gradients, gradient text, glow. No glassmorphism/frosted cards.
- No centered-hero + 3 identical feature cards. No Inter/Roboto/Arial display.
- No emoji icons. No uniform radius/padding everywhere. No lorem ipsum, no placeholder purple.
- No vague copy ("empowering the future", "supercharge", "unleash").

## 7. Git & stop-and-ask
- Branches: `main` (prod) ← `develop` ← `feature/*`. PRs into `develop`.
- Conventional commits: feat|fix|docs|style|refactor|test|chore|ci. Small diffs; plan first.
- STOP AND ASK before: any `git push`, any `wrangler deploy`, editing/creating secrets,
  DB migrations against remote D1, or installing new heavy deps.
- Never run --dangerously-skip-permissions.

## 8. Visual review
Use the Playwright MCP to screenshot changed pages at 375/768/1440 and check against
the anti-slop + a11y checklists in docs/DESIGN.md before calling done.
```

### B2. `docs/DESIGN.md`
```md
# QairuHub Design System

## Principles
1. Editorial × terminal — magazine hierarchy meets developer/mono texture.
2. Commit to the direction; hold the tokens everywhere (no "safe average").
3. Dark-first canvas, ONE electric accent as signal, not decoration.
4. Structure from grid + hairline borders, not shadows/glow.
5. Density that respects the reader (Linear/Stripe standard).
6. Motion is purposeful and accessible; content and a11y first.

## Brand derivation (from QAIRU)
QAIRU (parent) = light, institutional, monochrome + photography, uppercase mono
eyebrows, wordmark identity, trilingual. QairuHub (student sibling) keeps the grid
DNA, wordmark, uppercase-mono eyebrows and photography-as-color, but goes dark,
denser, kinetic, with an electric-green accent and a mono UI voice.

## Tokens
### Color (OKLCH; dark default, light inverts bg/fg)
--bg oklch(0.16 0.006 265); --bg-elevated oklch(0.21 0.007 265);
--border oklch(0.30 0.008 265); --fg oklch(0.97 0.004 265); --fg-muted oklch(0.72 0.008 265);
--accent oklch(0.72 0.19 149); --accent-fg oklch(0.16 0.006 265);
--success oklch(0.72 0.17 150); --warning oklch(0.80 0.16 80); --danger oklch(0.63 0.22 25);

### Type
Display: Space Grotesk (headlines only). Body/UI: Geist Sans. Mono: Geist Mono
(eyebrows, tags, stats, code). Scale (rem): 0.75 0.875 1 1.125 1.25 1.5 2 2.5 3.25 4.25 5.5.
Line-height 1.5 body / 1.05–1.15 display. Eyebrows: Geist Mono, uppercase, 0.08em tracking, --fg-muted.
KAZAKH/CYRILLIC VERDICT: Geist has full Cyrillic incl. Kazakh (Ә Ғ Қ Ң Ө Ұ Ү Һ І).
Space Grotesk covers Cyrillic; verify Kazakh glyphs in headlines else fall back to Geist Sans.
Satoshi/General Sans are Latin-only → NOT for body.

### Spacing / grid / radius / shadow / motion
Space base 4px (4/8/12/16/24/32/48/64/96/128). Grid 12-col, max 72rem, 24px gutter.
Radius: --radius 6px; tags 2px; no pill cards. Border 1px hairline / 2px emphasis.
Shadow: none on dark (border + bg-elevated). Motion 120/200/320ms; ease (0.22,1,0.36,1);
reveal (0.16,1,0.3,1); page-load stagger 40–60ms. All motion gated on prefers-reduced-motion.

## Component inventory
shadcn base (restyled): Button, Input, Textarea, Select, Dialog, Sheet, Tabs, Accordion,
Badge, Tooltip, Toast, Card, Separator, DropdownMenu.
Custom: Nav (+ mobile Sheet), Footer, Hero, Marquee/Ticker, ProgramCard, EventCard,
Timeline, PeopleGrid, ProjectCard, ApplyForm (Turnstile), Stats, SectionEyebrow, PostCard, PartnerGrid.

## Imagery / illustration
Photography: real Astana/EXPO, real members, real hackathons — dark, high-contrast.
Higgsfield art: fixed seed + locked style prompt + our palette so images read as a SET.
Store originals in R2; export optimized sizes. NO glowing-blue-brain cliché, NO gradient blobs.

## Accessibility & reduced motion
WCAG AA / APCA-checked contrast on every text/bg pair. Focus-visible rings in --accent.
Keyboard paths for Nav/Dialog/forms. prefers-reduced-motion: disable Lenis smoothing + reveals.

## Anti-slop checklist (must pass before "done")
[] No purple/blue gradients, gradient text, glow, glassmorphism.
[] Display font is Space Grotesk (not Inter/system). Mono eyebrows present.
[] One dominant accent; not an even rainbow.
[] Real grid + intentional asymmetry; varied module sizes; radius ≤ 6px.
[] Real copy + real content; zero lorem ipsum; no cliché slogans.
[] Motion purposeful; reduced-motion honored; contrast checked.
```

### B3. `docs/ARCHITECTURE.md`
```md
# QairuHub Architecture

## Stack
Astro 6 (SSR on Cloudflare Workers via @astrojs/cloudflare v14) + React islands.
Tailwind v4, shadcn/ui (Radix), Motion + Lenis, Storybook 10. TS strict, pnpm.

## astro.config.mjs (essentials)
import cloudflare from '@astrojs/cloudflare';
export default defineConfig({
  output: 'server',
  adapter: cloudflare({ imageService: 'cloudflare-binding' }),
  integrations: [react(), sitemap()],
  i18n: { defaultLocale: 'en', locales: ['en','ru','kk'], routing: { prefixDefaultLocale: false } },
  vite: { plugins: [tailwindcss()] },
});

## wrangler.jsonc (essentials)
{ "name": "qairuhub-website",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2025-05-21",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "binding": "ASSETS" },
  "d1_databases": [{ "binding": "DB", "database_name": "qairuhub", "database_id": "<id>" }],
  "r2_buckets": [{ "binding": "MEDIA", "bucket_name": "qairuhub-media" }],
  "kv_namespaces": [{ "binding": "SESSION", "id": "<id>" }] }

## Folder structure
src/{content,components/ui,components,layouts,pages,pages/api,styles,lib,i18n}
hub/ (git submodule → qairuhub/hub, pinned) rendered into /docs and /about/charter.

## Content collections & schemas
src/content.config.ts — Zod schemas for Event, Program, Project, Person, Post.
Members add MDX files via PR.

## Forms pipeline
Turnstile token → POST /pages/api/apply (Worker):
 1) verify Turnstile (siteverify) 2) Zod validate + honeypot + D1 rate-limit
 3) INSERT into D1 4) ctx.waitUntil(Resend email + Telegram sendMessage + optional n8n webhook)
 5) 200 → /apply/thanks. Same shape for /rsvp and /contact.

## Env vars / secrets (wrangler secret put; never in repo)
CF_ACCOUNT_ID, CF_API_TOKEN (CI), RESEND_API_KEY, TURNSTILE_SECRET, TURNSTILE_SITEKEY (public),
TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, N8N_WEBHOOK_URL.

## Deploy pipeline
Cloudflare Workers Builds (Git-connected): push → build → deploy; per-PR preview URLs.
main = production. Or GitHub Actions + wrangler deploy.

## Admin
/admin/* behind Cloudflare Access (Zero Trust, email-OTP/SSO). D1 table + CSV export. No app auth in v1.

## i18n plan
EN at /, RU at /ru, KZ at /kk. Ship EN first; translate high-traffic pages next. Fonts cover all three scripts.
```

### B4. `docs/CONTENT.md`
```md
# QairuHub Content & Copy

## Voice
Direct, builder, imperative. Short sentences. Concrete outcomes (shipped products,
hackathon wins, launched startups). Never "empowering the future"/"supercharge". EN first, trilingual-ready.

## Home
- Eyebrow: QAIRU · ASTANA · STUDENT-BUILT
- H1: "Learn it, build it, launch it."
- Sub: "QairuHub is the student-driven builder community at Qazaq AI Research University.
  We turn AI ideas into shipped products and startups."
- Primary CTA: "Join the next wave" → /apply/membership · Secondary: "See what we build" → /projects
- Stats ticker (real numbers only): founders · programs · events shipped.
- Programs grid (4): Qairu AI, Hackathons, Accelerator (Spring 2027 · upcoming), Education & Peer Learning.
- Upcoming events strip (from content). Featured projects. Community/Telegram/GitHub.

## About
Mission: "We help QAIRU students go from idea to shipped AI product — in public, together."
Values (concrete): 1) Ship over talk. 2) Learn in public. 3) Help the next student.
4) Real projects, real users. 5) Open by default.
Structure: umbrella org + sub-units (Qairu AI, Qairu Hackathons, Qairu Accelerator,
Education & Peer Learning, Qairu Space). Link to full charter (/about/charter, from the hub repo).

## Programs
- Qairu AI: hands-on AI building — agents, model tinkering, AI Fridays deep dives.
- Qairu Hackathons: regular build sprints; ship a demo in a weekend.
- Qairu Accelerator (Spring 2027, upcoming): prototype → launch with mentorship; mark clearly as upcoming.
- Education & Peer Learning: AI Fridays, study groups, guides, peer code review.

## Apply
Three funnels with clear who/when/what-you-need: Membership wave (open now), Accelerator
(opens later), Hackathon (per event). Each: short form (name, email, Telegram, links, one
paragraph "what you want to build"), Turnstile, success page.

## How members add content (PR workflow)
Events: add src/content/events/<slug>.mdx (title, starts, ends, location, program, summary).
Projects: src/content/projects/<slug>.mdx. People: src/content/people/<name>.md.
Open a PR into `develop`; CODEOWNERS routes content PRs for light review; CI validates schemas. No code needed.
```

### B5. `docs/BUILD-PLAN.md`
```md
# QairuHub Build Plan (Claude Code follows this)

Global: show a plan before big changes; small diffs; STOP AND ASK before any push, deploy,
secret, or remote DB migration. Run Playwright screenshots + anti-slop/a11y check at the end
of each phase. Report in the end-of-phase format (below).

## Phase 0 — Scaffold + tooling + CI + hello-world
Tasks: init Astro 6 + `astro add cloudflare` + React + Tailwind v4 + shadcn init; pnpm; TS strict;
Biome; Vitest; Playwright; Storybook 10; lefthook; .editorconfig; .gitattributes;
.github (CI, PR/issue templates, CODEOWNERS, dependabot); .mcp.json; wrangler.jsonc (D1/R2/KV
placeholders); add hub/ submodule.
Acceptance: `pnpm dev` runs on workerd; `pnpm build` passes; CI green; hello-world route renders.
DoD: repo pushed to `develop` (ASK before first push); Workers Builds connected (ASK first).
CHECKPOINT: stop for human to create Cloudflare resources + set secrets.

## Phase 1 — Design tokens + Storybook + core components
Tasks: global.css tokens (OKLCH) + fonts (Space Grotesk, Geist, Geist Mono); Tailwind @theme;
restyle shadcn primitives; build Nav+mobile, Footer, Hero, SectionEyebrow, Button/Input, Card
variants, Marquee, Stats; stories + a11y tests.
Acceptance: Storybook shows all core components in dark+light; axe passes; anti-slop checklist passes.
DoD: visual-review screenshots at 3 breakpoints attached.

## Phase 2 — Pages with real content
Tasks: content collections + schemas; Home, About(+charter), Programs(+4), Events(+detail/past),
Projects(+detail), Learn, People (from hub data), Partners, Blog, Community, Contact; real draft
copy from CONTENT.md; i18n routing scaffold (EN live).
Acceptance: all routes build; no lorem; Lighthouse ≥95 on Home.
DoD: content editable via MDX PR proven with one sample event/project/person.

## Phase 3 — Forms + data + Telegram
Tasks: /api/apply, /api/rsvp, /api/contact; Turnstile; D1 schema+migrations; Resend email;
Telegram Bot API; optional n8n webhook; /admin behind Cloudflare Access; CSV export.
Acceptance: end-to-end apply flow works locally on workerd; spam blocked.
DoD: e2e Playwright test for apply passes. CHECKPOINT: stop before remote D1 migrate and before wiring real secrets.

## Phase 4 — Polish + launch
Tasks: Motion page-load + scroll reveals (Lenis); reduced-motion; dynamic OG images (workers-og);
sitemap/robots/metadata; performance budget + Lighthouse CI; full a11y pass; 404; analytics.
Acceptance: budgets met (LCP<1.8s, JS<100KB content routes), Lighthouse ≥95 all core pages, axe clean.
DoD: launch checklist signed off. CHECKPOINT: stop before production deploy to main.

## End-of-phase report format
1) What changed (bullets) 2) Files touched 3) Screenshots (3 breakpoints)
4) Checklist results (anti-slop + a11y + perf) 5) Open questions / decisions needed
6) Proposed next step (wait for approval).
```

### B6. Master Claude Code kickoff prompt
```
You are helping build qairuhub.com in this empty folder. Read this fully before acting.

HARD RULE (non-negotiable): Never attribute yourself anywhere. No Co-Authored-By or AI trailers
in commits, no "generated with AI/Claude" notes in code, docs, PRs, or the site, no AI mentions
in package.json/meta/footer. All commits are authored solely by me.

CONTEXT: QairuHub is a student-driven builder/AI community at Qazaq AI Research University (QAIRU),
Astana. This site is the front door + source of truth: navigate, apply (membership/accelerator/
hackathon), events+RSVP, projects, learn (AI Fridays), people, charter/docs, contact.
Voice: "Learn it, build it, launch it." It must look crafted and distinctive — editorial × terminal,
dark-first, one electric-green accent — and must NOT look like generic AI slop.

DOCS: Read CLAUDE.md, docs/DESIGN.md, docs/ARCHITECTURE.md, docs/CONTENT.md, docs/BUILD-PLAN.md
(assume they are in the repo). Follow them exactly. DESIGN.md tokens and the anti-slop checklist are law.

STACK: Astro 6 + React islands, Tailwind v4, shadcn/ui (Radix base), Lucide, Motion + Lenis,
Storybook 10, Cloudflare Workers via @astrojs/cloudflare (NOT Pages), D1 + Turnstile + Resend +
Telegram Bot API + optional n8n. pnpm, TS strict, Biome.

MCP SERVERS to use: cloudflare-docs + cloudflare-bindings (resources), shadcn (components),
context7 (library docs), playwright (screenshot every changed page at 375/768/1440 for visual
review), figma-desktop if I share a Figma file. Prefer these over guessing APIs.

WORKING STYLE:
- Do Phase 0 from BUILD-PLAN.md ONLY, then stop and report. Do not jump ahead.
- Show me a concrete plan before creating files. Keep diffs small and reviewable.
- Never restyle anything into the generic look (no purple gradients, glassmorphism, Inter display,
  emoji icons, centered-hero-3-cards, lorem ipsum).
- Run typecheck/lint/format after edits. Use Playwright MCP to screenshot and self-check against
  the anti-slop + a11y checklists before saying a task is done.

STOP AND ASK before: any git push, any wrangler deploy, creating/editing secrets, any remote D1
migration, or adding heavy dependencies. Never use --dangerously-skip-permissions.

EXECUTE NOW — Phase 0:
1) Propose the exact scaffold plan (commands + files) and wait for my OK.
2) On approval: init Astro 6 + astro add cloudflare + React + Tailwind v4; shadcn init -d;
   set up pnpm, TS strict, Biome, Vitest, Playwright, Storybook 10, lefthook, .editorconfig,
   .gitattributes, .github (CI, templates, CODEOWNERS, dependabot), .mcp.json, wrangler.jsonc
   (D1/R2/KV placeholders), and add the hub submodule.
3) Verify `pnpm dev` runs on workerd and `pnpm build` passes; add a hello-world route.
4) Report in the end-of-phase format from BUILD-PLAN.md and WAIT. Do not push or deploy until I
   create Cloudflare resources and approve.
```

## Recommendations
1. **Now → kickoff (Sept 7):** Create `qairuhub/website`, paste the five docs + `.mcp.json`, register the MCP servers, and run the master prompt for **Phase 0 only**. **Threshold to proceed:** `pnpm dev` runs on workerd and CI is green.
2. **Week 1–2 (Phase 1: tokens + Storybook + core components).** Gate: the anti-slop checklist and axe pass in Storybook at both themes. If any component reads "generic," stop and re-derive from DESIGN.md before building pages.
3. **Week 2–4 (Phase 2: pages + real content).** Gate: Lighthouse ≥95 on Home, zero lorem, one real event/project/person added via PR to prove the content workflow.
4. **Week 4–5 (Phase 3: forms + D1 + Telegram/Resend/n8n; admin behind Access).** Gate: e2e apply test passes locally on workerd; only then wire real secrets and migrate remote D1.
5. **Week 5–6 (Phase 4: motion, OG images, perf, a11y, SEO) → launch.** Gate: performance budget met, then deploy to `main`.
- **Change triggers:** If the site grows into a real app (member dashboards, auth, realtime), revisit the stack — that's the scenario where Next.js on OpenNext or Remix becomes justified. If Kazakh headline glyphs render poorly in Space Grotesk, switch the display face to IBM Plex Sans (excellent Kazakh Cyrillic).

## Caveats
- **Versions move fast.** Astro 6, `@astrojs/cloudflare` v14, Storybook 10.x, shadcn CLI v4, Tailwind v4, Motion, and the Cloudflare adapter are all current as of Sept 2026 but change frequently — have Claude confirm exact latest versions via the shadcn/Context7/Cloudflare-docs MCPs at build time rather than pinning blindly.
- **QAIRU's exact brand hex/fonts weren't exposed in markup.** The university site uses image wordmarks and the Next.js image optimizer; I inferred the palette as effectively monochrome + photography from the rendered structure, not a published brand book. If QAIRU has an official brand guide, obtain it before finalizing the accent so QairuHub deliberately complements (not clashes with) the parent.
- **Figma remote vs desktop MCP:** the desktop server (`http://127.0.0.1:3845/mcp`) requires the Figma desktop app open in Dev Mode; Figma also offers a remote server (`https://mcp.figma.com/mcp`) and now recommends it — pick based on your seat/plan.
- **Higgsfield licensing/consistency:** confirm commercial-use terms for generated imagery and lock a single style/seed so images look like a coherent set; keep originals in R2.
- **Skills are guardrails, not guarantees.** Claude Code's `frontend-design` skill and community anti-slop skills help, but the human design review at each phase gate is what actually prevents slop.
- **Numbers must be real.** The Home stats ticker and any "X members / Y projects" claims should reflect actual data — with 15 founders and a Sept 7, 2026 kick-off, avoid inflated or fabricated metrics until they're true.