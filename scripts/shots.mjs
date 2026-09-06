#!/usr/bin/env node
/**
 * Full-page screenshots of every route, at the three breakpoints the design
 * specifies, in both themes.
 *
 * This is the visual gate: docs/DESIGN.md requires every changed page to be
 * looked at at 375 / 768 / 1440 before it is called done.
 *
 *   node scripts/shots.mjs                      # all routes, all widths, dark
 *   node scripts/shots.mjs --routes / /apply    # only these routes
 *   node scripts/shots.mjs --themes dark light
 *   node scripts/shots.mjs --widths 1440
 *
 * Output goes to .shots/ (git-ignored).
 */
import { mkdirSync, rmSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.SHOT_BASE_URL ?? 'http://localhost:4321'
const OUT = '.shots'

function arg(name, fallback) {
	const i = process.argv.indexOf(`--${name}`)
	if (i === -1) return fallback
	const values = []
	for (let j = i + 1; j < process.argv.length && !process.argv[j].startsWith('--'); j++) {
		values.push(process.argv[j])
	}
	return values.length ? values : fallback
}

/** Every public route, so the documented "all routes" is what actually runs. */
const ALL_ROUTES = [
	'/',
	'/about',
	'/programs',
	'/events',
	'/projects',
	'/learn',
	'/people',
	'/docs',
	'/apply',
	'/apply/accelerator',
	'/contact',
	'/404',
]

const routes = arg('routes', ALL_ROUTES)
const widths = arg('widths', ['375', '768', '1440']).map(Number)
const themes = arg('themes', ['dark'])

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const problems = []

for (const theme of themes) {
	for (const width of widths) {
		const context = await browser.newContext({
			viewport: { width, height: width < 768 ? 812 : 1000 },
			deviceScaleFactor: 2,
			colorScheme: theme === 'light' ? 'light' : 'dark',
			reducedMotion: 'reduce', // capture the settled page, never mid-animation
		})
		const page = await context.newPage()

		page.on('console', (message) => {
			if (message.type() !== 'error') return
			const text = message.text()
			// Turnstile logs its own formatting noise through console.error.
			// It is not ours and it is not actionable.
			if (text.includes('font-size:0;color:transparent')) return
			problems.push(`console ${text.slice(0, 160)}`)
		})
		page.on('pageerror', (error) => problems.push(`pageerror ${String(error).slice(0, 160)}`))

		for (const route of routes) {
			const url = `${BASE}${route}`
			/*
			 * Not 'networkidle': the Turnstile widget holds a connection open, so
			 * a page with a form would never settle and the capture would time out.
			 */
			const response = await page.goto(url, { waitUntil: 'domcontentloaded' })
			const expected = route === '/404' ? 404 : 200
			if (!response || response.status() !== expected) {
				problems.push(`${route} returned ${response?.status()}, expected ${expected}`)
				continue
			}
			await page.evaluate(() => document.fonts.ready)
			// Let lazy images and any island finish painting before capturing.
			await page.waitForLoadState('load').catch(() => {})
			await page.waitForTimeout(1200)

			const name = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-')
			const file = `${OUT}/${name}--${width}--${theme}.png`
			await page.screenshot({ path: file, fullPage: true })

			// A horizontally scrolling body is always a bug in this design.
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
			)
			if (overflow > 1) problems.push(`${route} @${width} overflows horizontally by ${overflow}px`)

			console.log(`${file}`)
		}

		await context.close()
	}
}

await browser.close()

if (problems.length) {
	console.error('\nProblems found:')
	for (const problem of [...new Set(problems)]) console.error(` - ${problem}`)
	process.exit(1)
}
