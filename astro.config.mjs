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
	 * The display face is a pair, not a splice. Space Grotesk carries no Cyrillic
	 * at all, so Onest sits behind it in the stack and the browser reaches for it
	 * on the first Cyrillic codepoint. Measured with `node scripts/font-metrics.mjs`,
	 * the two agree on cap height to within 1% (700 vs 707 per 1000 em), which is
	 * why this needs no `size-adjust` gymnastics — and unlike a unicode-range
	 * splice, there is no hand-maintained range to get wrong.
	 */
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Space Grotesk',
			cssVariable: '--font-display-latin',
			weights: ['500 700'],
			styles: ['normal'],
			subsets: /** @type {[string, ...string[]]} */ (['latin', 'latin-ext']),
			display: 'swap',
			// Onest comes first in the fallback chain, so the browser reaches a real
			// display face on the first Cyrillic codepoint rather than a system sans.
			fallbacks: /** @type {[string, ...string[]]} */ (['Onest', ...SANS_FALLBACK]),
		},
		{
			provider: fontProviders.google(),
			name: 'Onest',
			cssVariable: '--font-display-cyrillic',
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
