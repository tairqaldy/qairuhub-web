import { defineConfig } from 'vitest/config'

/**
 * Unit tests run in plain Node, not in workerd.
 *
 * We deliberately do NOT use Astro's `getViteConfig` here: it loads
 * `astro.config.mjs`, which pulls in the Cloudflare adapter and makes Vitest
 * try to execute the suite inside a Worker runner. Anything that genuinely
 * needs Cloudflare bindings belongs in the Playwright e2e suite, which runs
 * against a real workerd server.
 */
export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/unit/**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			reporter: ['text', 'html'],
			include: ['src/lib/**', 'src/pages/api/**'],
		},
	},
})
