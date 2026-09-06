# QairuHub Website — Project Rules

## 0. HARD RULE — NO AI ATTRIBUTION (non-negotiable)
Never add yourself as author, co-author, contributor, or collaborator anywhere.
- NO `Co-Authored-By` or any AI trailer in commits.
- NO "Generated with AI", "built with AI", or similar notes in code, comments,
  docs, READMEs, PR descriptions, or anywhere on the site.
- NO AI/assistant mentions in `package.json` authors, meta tags, or footers.
Commits are authored solely by the human developer. If unsure, omit attribution.

## 1. What this is
qairuhub.com — the front door and source of truth for QairuHub, a student-driven
builder/AI community at QAIRU (Astana). A content-first marketing site with a few
interactive forms. Voice: "Learn it, build it, launch it."

## 2. Stack (verified 2026-09-06 against the npm registry — not from memory)
- **Astro 7.3** (content-first) + **React 19** islands for interactivity only.
- **Tailwind v4.3** via `@tailwindcss/vite` (CSS-first `@theme`, no JS config file).
- **@astrojs/cloudflare v14.3** → Cloudflare **Workers** (Pages is NOT used).
- Static output by default; per-route `export const prerender = false` for API
  routes and anything dynamic. Do NOT flip the whole site to `output: 'server'`.
- D1 (submissions), Turnstile (anti-spam), Resend (email), Telegram Bot API.
- Cloudflare Access in front of `/admin`. Cloudflare Web Analytics.
- Tooling: pnpm, TypeScript strict, Biome, Vitest, Playwright, lefthook.

### Version reality check
The stack notes in `docs/research/build-package-research.md` say "Astro 6" and
predate this build. Astro 7.3.1 is current. **Always confirm a version against
the registry (`npm view <pkg> version`) or Context7 before writing code that
depends on its API.** Do not trust the research doc's version claims.

## 3. Commands
- `pnpm dev` — Astro dev server. Prefer `pnpm dev:bg` (`astro dev --background`)
  in agent contexts; manage with `astro dev stop|status|logs`.
- `pnpm build` · `pnpm preview` (runs the built Worker on workerd)
- `pnpm typecheck` (`astro check`) · `pnpm lint` · `pnpm format`
- `pnpm test` (Vitest) · `pnpm e2e` (Playwright)
- `pnpm check` — typecheck + lint + test, the pre-push gate
- Deploy: `pnpm deploy:prod` → `wrangler deploy` (ASK FIRST — see §7)

## 4. Coding standards
- TypeScript strict. No `any`. Small, single-purpose components.
- **Default to `.astro` components.** Reach for React only when the component
  needs client state, and then give it the narrowest `client:*` directive that
  works (`client:visible` > `client:idle` > `client:load`).
- **Tokens only.** Never hardcode a colour, space, or radius — use the CSS custom
  properties defined in `src/styles/global.css`. A raw hex in a component is a bug.
- Content lives in Astro Content Collections with Zod schemas
  (`src/content.config.ts`). No content hardcoded in page templates.
- Every route sets a real `<title>` and description via the shared SEO component.

## 5. Design rules (full spec in docs/DESIGN.md)
- Aesthetic: **editorial × terminal**. Dark-first, one cobalt accent as signal.
- Type: Space Grotesk (display) + Geist Sans (body/UI) + Geist Mono (labels).
- Grid: 12-col, deliberate asymmetry. Radius ≤ 6px. Hairline borders carry structure.
- Motion: one orchestrated page-load + scroll reveals. `prefers-reduced-motion`
  is honoured everywhere, no exceptions.
- **The accent is cobalt, which is a common colour in this category.** The site's
  distinctiveness must therefore come from type, grid, density and border
  structure — not the hue. Cobalt is a hard signal (links, CTAs, focus rings,
  active states), never a background wash or a gradient.

## 6. DO NOT (anti-slop)
- No gradients as decoration, no gradient text, no glow. No glassmorphism.
- No centred hero + three identical feature cards.
- No Inter/Roboto/Arial/system font as the display face. No emoji as UI icons.
- No uniform radius and padding everywhere — hierarchy must be visible.
- No lorem ipsum. No cliché copy ("empowering the future", "supercharge",
  "unleash", "transform your X").
- No invented statistics. See §9.

## 7. Git & stop-and-ask
- Branches: `main` (prod) ← `develop` ← `feature/*`. PRs target `develop`.
- Conventional commits: `feat|fix|docs|style|refactor|test|chore|ci`. Small diffs.
- STOP AND ASK before: `wrangler deploy` to production, creating or editing
  secrets, migrations against remote D1, pointing DNS at a Worker, or adding a
  heavy dependency.
- Never run `--dangerously-skip-permissions`.

## 8. Verification before "done"
`pnpm check` must pass, and `pnpm e2e` asserts the mechanical design rules on
every route at three breakpoints.

For anything visual, run `pnpm shots` — it captures every route at
375 / 768 / 1440 and fails on horizontal overflow or console errors — and check
the result against the anti-slop and a11y checklists in `docs/DESIGN.md`.

`/dev/glyphs` is the trilingual gate: it renders every family against the nine
Kazakh letter pairs. Run `pnpm check:fonts` after any change to the type stack.

## 9. Real data only
The site must not display invented numbers, people, or outcomes. Sample content in `src/content/` carries `placeholder: true`, and
`src/lib/content.ts` excludes those entries from production builds — every page
reads through it rather than calling `getCollection` directly. An index with no
real entries renders a designed empty state rather than a guess. See
`docs/CONTENT.md`.
