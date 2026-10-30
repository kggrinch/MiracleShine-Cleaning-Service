import { test, expect } from '@playwright/test'

const services = [
  {
    id: 'service-residential',
    name: 'Residential Cleaning',
    description: 'Care for kitchens, bathrooms, and living areas.',
    category: 'RESIDENTIAL',
    startingPrice: '125.00',
    estimatedDurationMinutes: 120,
    imageUrl: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'service-commercial',
    name: 'Commercial Cleaning',
    description: 'Professional upkeep for offices and shared spaces.',
    category: 'COMMERCIAL',
    startingPrice: null,
    estimatedDurationMinutes: 60,
    imageUrl: null,
    isActive: true,
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
]

const customer = {
  id: 'user-customer',
  firstName: 'Ava',
  lastName: 'Smith',
  email: 'ava@example.com',
  phone: null,
  role: 'CUSTOMER',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/services', (route) =>
    route.fulfill({ json: services }),
  )
  await page.route('**/api/v1/reviews', (route) => route.fulfill({ json: [] }))
})

test.describe('Miracle Shine public and account experiences', () => {
  test('home page renders the commercial-cleaning hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/commercial cleaning/i)
  })

  test('public services render the service catalog returned by the API', async ({ page }) => {
    await page.goto('/services')
    await expect(page.locator('article')).toHaveCount(2)
    await expect(page.getByRole('heading', { name: 'Residential Cleaning' })).toBeVisible()
    await expect(page.getByText('From $125.00')).toBeVisible()
  })

  test('contact and quote routes share the quote page and display both forms', async ({ page }) => {
    await page.goto('/get-quote')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/estimate/i)
    await page.goto('/contact')
    await expect(page).toHaveURL(/\/get-quote$/)
    await expect(page.locator('#quote form')).toHaveCount(1)
    await expect(page.getByRole('heading', { name: 'Send our team a message' })).toBeVisible()
  })

  test('customer sign-in opens the account dashboard and loads own records', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({ json: { token: 'test-token', user: customer } }),
    )
    await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: customer }))
    await page.route('**/api/v1/quote-requests/me', (route) => route.fulfill({ json: [] }))
    await page.route('**/api/v1/appointments/me', (route) => route.fulfill({ json: [] }))

    await page.goto('/login')
    await page.getByLabel('Email').fill(customer.email)
    await page.getByLabel('Password').fill('valid-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/account$/)
    await expect(page.getByRole('heading', { name: 'Welcome, Ava' })).toBeVisible()
    await expect(page.getByText('You have not submitted any quote requests yet.')).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Welcome, Ava' })).toBeVisible()
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/account$/)
  })

  test('administrator sign-in rejects customer-role credentials', async ({ page }) => {
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({ json: { token: 'test-token', user: customer } }),
    )

    await page.goto('/admin/login')
    await page.getByLabel('Email').fill(customer.email)
    await page.getByLabel('Password').fill('valid-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('alert')).toContainText('does not have admin access')
    await expect(page).toHaveURL(/\/admin\/login$/)
  })
})
