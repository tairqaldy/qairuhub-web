import { expect, type Page, test } from '@playwright/test'

/**
 * The design rules that can be checked mechanically (docs/DESIGN.md §8.4).
 *
 * "Review it on a screenshot" is correct in spirit and dies in practice, so the
 * rules that a rushed change would break first are asserted here instead. These
 * run against every public route.
 */

const ROUTES = [
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
]

/** Resolve a CSS custom property to the value the browser actually computed. */
async function token(page: Page, name: string): Promise<string> {
	return page.evaluate(
		(property) => getComputedStyle(document.documentElement).getPropertyValue(property).trim(),
		name,
	)
}

test.describe('design law', () => {
	for (const route of ROUTES) {
		test.describe(route, () => {
			test.beforeEach(async ({ page }) => {
				const response = await page.goto(route)
				expect(response?.status(), `${route} should render`).toBeLessThan(400)
			})

			test('has at most one primary call to action', async ({ page }) => {
				// The single solid cobalt fill. Two on a page means neither is primary.
				const count = await page.locator('.cta-primary').count()
				expect(count, `${route} has ${count} primary CTAs`).toBeLessThanOrEqual(1)
			})

			test('uses no cards', async ({ page }) => {
				// Structure comes from rules, not from boxes. A class named "card"
				// is the first symptom of the design collapsing into a grid of them.
				expect(await page.locator('[class*="card"]').count()).toBe(0)
			})

			test('casts no shadows', async ({ page }) => {
				const shadows = await page.evaluate(() =>
					[...document.querySelectorAll('*')]
						.map((element) => getComputedStyle(element).boxShadow)
						.filter((value) => value && value !== 'none'),
				)
				expect(shadows, 'depth is ink step and rule weight, never shadow').toEqual([])
			})

			test('keeps every radius at or below 6px', async ({ page }) => {
				const oversized = await page.evaluate(() => {
					const found: string[] = []
					for (const element of document.querySelectorAll('*')) {
						const style = getComputedStyle(element)
						for (const corner of [
							style.borderTopLeftRadius,
							style.borderTopRightRadius,
							style.borderBottomLeftRadius,
							style.borderBottomRightRadius,
						]) {
							const px = Number.parseFloat(corner)
							// Percentages resolve to a px value on measured elements; a
							// circular avatar would show up here, and we do not have one.
							if (!Number.isNaN(px) && px > 6 && !corner.includes('%')) {
								found.push(`${element.tagName.toLowerCase()}.${element.className} ${corner}`)
							}
						}
					}
					return found.slice(0, 5)
				})
				expect(oversized).toEqual([])
			})

			test('gives every image alternative text', async ({ page }) => {
				const missing = await page.evaluate(() =>
					[...document.querySelectorAll('img')]
						.filter((image) => !image.hasAttribute('alt'))
						.map((image) => image.getAttribute('src') ?? '(no src)'),
				)
				expect(missing).toEqual([])
			})

			test('bounds form controls with a 3:1 rule, not a hairline', async ({ page }) => {
				const controls = page.locator('input:not([type=hidden]), select, textarea')
				const count = await controls.count()
				if (count === 0) test.skip()

				const strong = await token(page, '--rule-strong')
				for (let i = 0; i < count; i++) {
					const control = controls.nth(i)
					// The honeypot is clipped out of the layout and is not a real control.
					if (await control.evaluate((el) => el.closest('.honeypot') !== null)) continue

					const border = await control.evaluate((el) => getComputedStyle(el).borderTopColor)
					// Resolve the token to the same rgb() form getComputedStyle returns,
					// so the comparison is like-for-like rather than oklch vs rgb.
					const expected = await page.evaluate((value) => {
						const probe = document.createElement('div')
						probe.style.color = value
						document.body.appendChild(probe)
						const resolved = getComputedStyle(probe).color
						probe.remove()
						return resolved
					}, strong)
					expect(border, 'an input border is its only boundary — WCAG 1.4.11').toBe(expected)
				}
			})

			test('never scrolls the body sideways', async ({ page }) => {
				for (const width of [375, 768, 1440]) {
					await page.setViewportSize({ width, height: 900 })
					const overflow = await page.evaluate(
						() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
					)
					expect(overflow, `${route} overflows at ${width}px`).toBeLessThanOrEqual(1)
				}
			})

			test('exposes exactly one h1', async ({ page }) => {
				expect(await page.locator('h1').count()).toBe(1)
			})

			test('has a reachable skip link as the first focusable element', async ({ page }) => {
				await page.keyboard.press('Tab')
				const focused = await page.evaluate(() => document.activeElement?.className ?? '')
				expect(focused).toContain('skip-link')
			})
		})
	}

	test('the plate appears exactly once where it appears at all', async ({ page }) => {
		for (const route of ROUTES) {
			await page.goto(route)
			const plates = await page.locator('.plate').count()
			expect(plates, `${route} has ${plates} plates`).toBeLessThanOrEqual(1)
		}
	})

	test('every internal link resolves', async ({ page, request }) => {
		const seen = new Set<string>()
		for (const route of ROUTES) {
			await page.goto(route)
			const hrefs = await page.evaluate(() =>
				[...document.querySelectorAll('a[href]')]
					.map((anchor) => anchor.getAttribute('href') ?? '')
					.filter((href) => href.startsWith('/')),
			)
			for (const href of hrefs) seen.add(href.split('#')[0])
		}

		const broken: string[] = []
		for (const href of seen) {
			if (!href) continue
			const response = await request.get(href)
			if (response.status() >= 400) broken.push(`${href} → ${response.status()}`)
		}
		expect(broken).toEqual([])
	})
})

test.describe('reduced motion', () => {
	test.use({ reducedMotion: 'reduce' })

	test('renders the page complete, not mid-animation', async ({ page }) => {
		await page.goto('/')
		// Every element that participates in the load sequence must be fully
		// opaque and untransformed once motion is suppressed.
		const unsettled = await page.evaluate(() =>
			[...document.querySelectorAll('.run-type, .run-rule, .run-rows > *')]
				.filter((element) => {
					const style = getComputedStyle(element)
					return Number.parseFloat(style.opacity) < 0.99
				})
				.map((element) => element.className),
		)
		expect(unsettled).toEqual([])
	})
})
