import { expect, test } from '@playwright/test'

test('home page renders and has a real title', async ({ page }) => {
	const response = await page.goto('/')
	expect(response?.status()).toBe(200)
	await expect(page).toHaveTitle(/\S/)
})

test('home page has no console errors', async ({ page }) => {
	const errors: string[] = []
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text())
	})
	await page.goto('/')
	await page.waitForLoadState('networkidle')
	expect(errors).toEqual([])
})
