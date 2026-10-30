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

  test('quote form shows required-field errors without submitting', async ({ page }) => {
    let quoteRequests = 0
    page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        new URL(request.url()).pathname === '/api/v1/quote-requests'
      ) {
        quoteRequests += 1
      }
    })

    await page.goto('/get-quote')
    await page.getByRole('button', { name: 'Request Quote' }).click()

    await expect(page.getByText('Please enter your first name.')).toBeVisible()
    await expect(page.getByText('Please enter your email address.')).toBeVisible()
    await expect(page.getByText('Tell us a little about your space and needs.')).toBeVisible()
    expect(quoteRequests).toBe(0)
  })

  test('sign-in displays the real API rejection for invalid credentials', async ({ page }) => {
    const loginResponses: number[] = []
    page.on('response', (response) => {
      if (new URL(response.url()).pathname === '/api/v1/auth/login') {
        loginResponses.push(response.status())
      }
    })

    await page.goto('/login')
    await page.getByLabel('Email').fill(`e2e-invalid-${Date.now()}@example.invalid`)
    await page.getByLabel('Password').fill('NotARealPassword-123!')
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toHaveText('Invalid email or password.')
    expect(loginResponses).toEqual([401])
  })
})
