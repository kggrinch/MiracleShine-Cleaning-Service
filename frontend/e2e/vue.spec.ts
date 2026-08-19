import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test.describe('Miracle Shine Cleaning Service', () => {
  test('home page renders the commercial-cleaning hero', async ({ page }) => {
    await page.goto('/')
    // Hero headline should reflect the commercial-cleaning positioning.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/commercial cleaning/i)
  })

  test('services page lists all nine services', async ({ page }) => {
    await page.goto('/services')
    const gridCards = page.locator('article')
    await expect(gridCards).toHaveCount(9)
    // First h1 is the page banner (the lower "call to action" banner is also an h1).
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(/commercial cleaning plans/i)
  })

  test('Get a Quote and Contact share the same page', async ({ page }) => {
    await page.goto('/get-quote')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/estimate/i)
    await page.goto('/contact')
    await expect(page).toHaveURL(/\/get-quote$/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/estimate/i)
    // Both routes render the same request form.
    await expect(page.locator('#quote form')).toHaveCount(1)
  })
})
