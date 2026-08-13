import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  // Hero headline should reflect the commercial-cleaning positioning.
  await expect(page.getByRole('heading', { level: 1 })).toContainText('commercial cleaning')
})
