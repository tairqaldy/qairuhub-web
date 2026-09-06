// @ts-check
import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

const SITE = process.env.PUBLIC_SITE_URL ?? 'https://qairuhub.com'

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

	integrations: [react(), mdx(), sitemap()],

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

	build: { inlineStylesheets: 'auto' },

	vite: {
		plugins: [tailwindcss()],
	},
})
