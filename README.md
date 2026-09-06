# qairuhub.com

The website for **QairuHub** — the student-driven builder and AI community at
Qazaq AI Research University (QAIRU) in Astana.

> Learn it, build it, launch it.

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 7 (static by default, per-route SSR) |
| Interactivity | React 19 islands — forms and filters only |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Hosting | Cloudflare Workers via `@astrojs/cloudflare` |
| Data | D1 (submissions), KV (sessions), R2 (media) |
| Anti-spam | Cloudflare Turnstile |
| Notifications | Resend (email) + Telegram Bot API |
| Tooling | pnpm · TypeScript strict · Biome · Vitest · Playwright · lefthook |

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev
```

The dev server runs on the real `workerd` runtime, so Cloudflare bindings behave
locally the way they do in production.

Long-running agent sessions should prefer `pnpm dev:bg`, then `pnpm dev:logs`
and `pnpm dev:stop`.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Dev server on http://localhost:4321 |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the built Worker locally |
| `pnpm typecheck` | `astro check` |
| `pnpm lint` / `pnpm lint:fix` | Biome |
| `pnpm test` / `pnpm test:run` | Vitest |
| `pnpm e2e` | Playwright |
| **`pnpm check`** | The full gate: typecheck + lint + attribution guard + tests |

## Contributing content

You do not need to write code to add an event, project, or person. Add a Markdown
file under `src/content/` and open a pull request against `develop`. The schema is
validated on every build, so CI tells you if a field is missing.

See **[docs/CONTENT.md](docs/CONTENT.md)** for the exact fields and an example.

## Documentation

| Doc | What it covers |
|---|---|
| [docs/DESIGN.md](docs/DESIGN.md) | Design system, tokens, and the anti-slop checklist |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Routing, data flow, Cloudflare resources, deploys |
| [docs/CONTENT.md](docs/CONTENT.md) | Content model, voice, and the contribution workflow |
| [docs/BUILD-PLAN.md](docs/BUILD-PLAN.md) | Phased build plan and acceptance gates |

## Branches

`main` is production. Work happens on `feature/*` branches merged into `develop`,
which is promoted to `main` for release.

## Licence

Content © QairuHub. Source released under the MIT Licence — see [LICENSE](LICENSE).
