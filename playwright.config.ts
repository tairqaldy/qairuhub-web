import { defineConfig, devices } from '@playwright/test'

const PORT = 4321
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : undefined,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
	timeout: 30_000,
	expect: { timeout: 10_000 },
	use: {
		baseURL: BASE_URL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
		},
		{
			name: 'tablet',
			use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
		},
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
	],
	// Reuse a running dev server locally; boot one in CI.
	webServer: process.env.E2E_BASE_URL
		? undefined
		: {
				command: 'pnpm dev --port 4321',
				url: BASE_URL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
})
