// @ts-check
import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

const SITE = process.env.PUBLIC_SITE_URL ?? 'https://qairuhub.com'

/**
 * Cyrillic is not optional here and the API does not give it to you by default:
 * `subsets` defaults to `['latin']` alone. Every family below that can carry
 * Cyrillic asks for it explicitly, and `cyrillic-ext` is what actually holds
 * most of the Kazakh letters (Ә Ғ Қ Ң Ө Ү Һ).
 *
 * Coverage is verified against each font's real glyph table by
 * `pnpm check:fonts`. See docs/research/font-coverage.md.
 */
/** @type {[string, ...string[]]} */
const CYRILLIC = ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']

/** @type {[string, ...string[]]} */
const SANS_FALLBACK = ['system-ui', 'Segoe UI', 'Roboto', 'Noto Sans', 'Arial', 'sans-serif']

export default defineConfig({
	site: SITE,

	/**
	 * Static by default. This is a content site: almost every route can be
	 * prerendered, which keeps it fast and cheap. Routes that genuinely need the
	 * server — the form endpoints under /api and the admin views — opt out
	 * individually with `export const prerender = false`.
	 *
	 * Do not flip this to 'server'. It would make every page a Worker
	 * invocation for no benefit.
	 */
	output: 'static',

	adapter: cloudflare({
		/**
		 * Transform local images at build time (zero runtime cost, which is what
		 * a mostly-static site wants), and fall back to the Cloudflare Images
		 * binding for anything that has to be handled on demand.
		 *
		 * The adapter's own default is `cloudflare-binding`, which would push
		 * every transform to request time.
		 */
		imageService: { build: 'compile', runtime: 'cloudflare-binding' },
	}),

	integrations: [
		react(),
		mdx(),
		sitemap({
			// The /dev routes are noindex gates for contributors, not pages for
			// readers. Listing them in the sitemap contradicts their own robots tag.
			filter: (page) => !page.includes('/dev/'),
		}),
	],

	/**
	 * Self-hosted, subset and preloaded by Astro. No request ever leaves for a
	 * third-party font CDN.
	 *
	 * ONE display family, covering all three scripts.
	 *
	 * This was originally Space Grotesk for Latin with Onest behind it for
	 * Cyrillic. That silently did not work: Astro registers each family under a
	 * hashed name ("Onest-9e5a55aca0d744fc"), so naming "Onest" in the fallback
	 * list matched nothing. Cyrillic headlines fell through to system-ui while
	 * 88 KB of Onest was downloaded and never drawn — the exact failure the
	 * design specification set out to avoid.
	 *
	 * A cross-family stack cannot be made correct here: Astro appends generic
	 * fallbacks after the hashed name, and a generic always matches a Cyrillic
	 * glyph before a later real family gets a turn. Onest carries Latin, Russian
	 * and all nine Kazakh letter pairs on its own (verified by
	 * `pnpm check:fonts`), so it does the whole job with no splice to get wrong
	 * and one fewer font to download. Kazakh, Russian and English now set
	 * identically, which for this institution is the right default anyway.
	 */
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Onest',
			cssVariable: '--font-display-base',
			weights: ['500 800'],
			styles: ['normal'],
			subsets: CYRILLIC,
			display: 'swap',
			fallbacks: SANS_FALLBACK,
		},
		{
			provider: fontProviders.google(),
			name: 'Geist',
			cssVariable: '--font-sans-base',
			weights: ['400 500'],
			styles: ['normal'],
			subsets: CYRILLIC,
			display: 'swap',
			fallbacks: SANS_FALLBACK,
		},
		{
			provider: fontProviders.google(),
			name: 'Geist Mono',
			cssVariable: '--font-mono-base',
			weights: ['400 500'],
			styles: ['normal'],
			subsets: CYRILLIC,
			display: 'swap',
			fallbacks: /** @type {[string, ...string[]]} */ ([
				'ui-monospace',
				'SFMono-Regular',
				'Menlo',
				'Consolas',
				'monospace',
			]),
		},
	],

	/**
	 * English is the default and lives at the root. Russian and Kazakh get
	 * prefixes. Every font the site ships is verified to render Kazakh —
	 * see scripts/check-font-coverage.mjs.
	 */
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'ru', 'kk'],
		routing: { prefixDefaultLocale: false },
	},

	// Warm links in the viewport so navigation feels instant without shipping a router.
	prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

	/*
	 * Emit /about.html rather than /about/index.html, and write links without a
	 * trailing slash. With directory output, every internal link costs a 307 and
	 * a second round trip before the page is served.
	 */
	trailingSlash: 'never',

	build: { inlineStylesheets: 'auto', format: 'file' },

	vite: {
		plugins: [tailwindcss()],
	},
})
