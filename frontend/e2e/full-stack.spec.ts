import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { cleanE2eData, connectE2eDatabase } from '../../backend/test/e2e/support.js'

const adminEmail = process.env.E2E_ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD
if (!adminEmail || !adminPassword) {
  throw new Error('Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for admin workflows.')
}

test('customer and admin workflows persist and clean up their own records', async ({ page }) => {
  test.setTimeout(120_000)
  const marker = randomUUID()
  const customerEmail = `e2e-${marker}@example.invalid`
  const customerPassword = `E2e-${marker}-aA1!`
  const customerFirstName = 'E2E'
  const customerLastName = `Customer${marker.slice(0, 8)}`
  const customerName = `${customerFirstName} ${customerLastName}`
  const serviceName = `E2E Service ${marker}`
  const contactSubject = `E2E contact ${marker}`
  const prisma = await connectE2eDatabase()
  try {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Create account' }).click()
    await page.getByLabel('First name').fill(customerFirstName)
    await page.getByLabel('Last name').fill(customerLastName)
    await page.getByLabel('Email').fill(customerEmail)
    await page.getByLabel('Password').fill(customerPassword)
    await page.getByRole('button', { name: 'Create account', exact: true }).last().click()
    await expect(page).toHaveURL(/\/account$/)
    await expect(page.getByRole('heading', { name: customerName })).toBeVisible()

    await page.goto('/get-quote')
    await page.getByLabel('First Name').fill(customerFirstName)
    await page.getByLabel('Last Name').fill(customerLastName)
    await page.getByLabel('Phone').fill('425-555-0199')
    await page.getByLabel('Email').fill(customerEmail)
    await page.getByLabel('Address').fill(`100 E2E Test Way ${marker.slice(0, 8)}`)
    await page.getByLabel('Cleaning Type').selectOption({ label: 'Commercial Cleaning' })
    await page.getByLabel('Property Type').selectOption('OFFICE')
    await page.getByLabel('City').fill('Seattle')
    await page.getByLabel('State').fill('WA')
    await page.getByLabel('ZIP / Postal Code').fill('98101')
    await page.getByLabel('Message').fill(`Synthetic end-to-end quote ${marker}`)

    const quoteResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith('/api/v1/quote-requests') &&
      response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Request Quote' }).click()
    const quoteResponse = await quoteResponsePromise
    expect(quoteResponse.status()).toBe(201)
    const quote = await quoteResponse.json() as { id: string; serviceId: string }
    await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible()

    const customerToken = await page.evaluate(() =>
      window.localStorage.getItem('miracle-shine-token'),
    )
    expect(customerToken).toBeTruthy()

    const contactResponse = await page.request.post(
      'http://localhost:3000/api/v1/contact-messages',
      {
        data: {
          customerName,
          email: customerEmail,
          phone: '425-555-0199',
          subject: contactSubject,
          message: `Synthetic end-to-end contact submission ${marker}`,
        },
      },
    )
    expect(contactResponse.status()).toBe(201)

    const appointmentResponse = await page.request.post(
      'http://localhost:3000/api/v1/appointments',
      {
        headers: { Authorization: `Bearer ${customerToken}` },
        data: {
          quoteRequestId: quote.id,
          scheduledDate: '2026-12-15',
          startTime: '10:00',
          endTime: '12:00',
          notes: `Synthetic appointment ${marker}`,
        },
      },
    )
    expect(appointmentResponse.status()).toBe(201)
    const appointment = await appointmentResponse.json() as { id: string }

    await page.goto('/account')
    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto('/login')
    await page.getByLabel('Email').fill(adminEmail)
    await page.getByLabel('Password').fill(adminPassword)
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/account$/)
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Operations dashboard' })).toBeVisible()

    await page.getByLabel('Name', { exact: true }).fill(serviceName)
    await page.getByLabel('Category').selectOption('COMMERCIAL')
    await page.getByLabel('Description').fill(`Synthetic service ${marker}`)
    await page.getByLabel('Starting price').fill('123.45')
    await page.getByLabel('Duration (minutes)').fill('90')
    await page.getByRole('button', { name: 'Create service' }).click()
    await expect(page.getByText(serviceName, { exact: true })).toBeVisible()

    const quoteSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Quote requests', exact: true }),
    })
    const quoteCard = quoteSection.getByText(customerEmail)
      .locator('xpath=../../..')
    await quoteCard.getByRole('button', { name: 'ACCEPTED', exact: true }).click()
    await expect(quoteCard.locator('span').first()).toHaveText('ACCEPTED')

    const appointmentSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Appointments', exact: true }),
    })
    const appointmentCard = appointmentSection.getByText(customerName, { exact: true })
      .locator('xpath=../../..')
    await appointmentCard.getByRole('button', { name: 'CONFIRMED', exact: true }).click()
    await expect(appointmentCard.locator('span').first()).toHaveText('CONFIRMED')
    await appointmentCard.getByRole('button', { name: 'COMPLETED', exact: true }).click()
    await expect(appointmentCard.locator('span').first()).toHaveText('COMPLETED')

    const contactSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Contact messages', exact: true }),
    })
    const contactCard = contactSection.getByText(contactSubject, { exact: true })
      .locator('xpath=../../..')
    await contactCard.getByRole('button', { name: 'RESPONDED', exact: true }).click()
    await expect(contactCard.locator('span').first()).toHaveText('RESPONDED')

    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto('/login')
    await page.getByLabel('Email').fill(customerEmail)
    await page.getByLabel('Password').fill(customerPassword)
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/account$/)
    await expect(page.getByText('COMPLETED', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Leave a review' }).click()
    await page.getByLabel('Rating').selectOption('5')
    await page.getByLabel('Comment').fill(`Synthetic end-to-end review ${marker}`)
    const reviewResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith('/api/v1/reviews') &&
      response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Submit review' }).click()
    const reviewResponse = await reviewResponsePromise
    expect(reviewResponse.status()).toBe(201)
    const review = await reviewResponse.json() as { id: string }
    await expect(page.getByText('Your review could not be submitted.')).toHaveCount(0)
    const pendingPublicReviews = await page.request.get(
      'http://localhost:3000/api/v1/reviews',
    )
    expect(pendingPublicReviews.status()).toBe(200)
    expect(await pendingPublicReviews.json()).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: review.id })]),
    )

    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto('/login')
    await page.getByLabel('Email').fill(adminEmail)
    await page.getByLabel('Password').fill(adminPassword)
    await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/account$/)
    await page.goto('/admin')
    const reviewSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Reviews', exact: true }),
    })
    const reviewCard = reviewSection.getByText(`${customerName}`, { exact: true })
      .locator('xpath=../../..')
    await expect(reviewCard.locator('span').first()).toHaveText('PENDING')
    await reviewCard.getByRole('button', { name: 'APPROVED', exact: true }).click()
    await expect(reviewCard.locator('span').first()).toHaveText('APPROVED')
    const approvedPublicReviews = await page.request.get(
      'http://localhost:3000/api/v1/reviews',
    )
    expect(approvedPublicReviews.status()).toBe(200)
    expect(await approvedPublicReviews.json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: review.id })]),
    )

    const [persistedUser, persistedQuote, persistedAppointment, persistedReview, persistedContact, persistedService] =
      await Promise.all([
        prisma.user.findUnique({ where: { email: customerEmail } }),
        prisma.quoteRequest.findUnique({
          where: { id: quote.id },
          include: { service: true, appointment: true },
        }),
        prisma.appointment.findUnique({ where: { id: appointment.id } }),
        prisma.review.findUnique({ where: { appointmentId: appointment.id } }),
        prisma.contactMessage.findFirst({
          where: { email: customerEmail, subject: contactSubject },
        }),
        prisma.service.findUnique({ where: { name: serviceName } }),
      ])

    expect(persistedUser?.role).toBe('CUSTOMER')
    expect(persistedQuote?.userId).toBe(persistedUser?.id)
    expect(persistedQuote?.serviceId).toBe(quote.serviceId)
    expect(persistedQuote?.status).toBe('ACCEPTED')
    expect(persistedQuote?.appointment?.id).toBe(appointment.id)
    expect(persistedAppointment?.status).toBe('COMPLETED')
    expect(persistedReview?.status).toBe('APPROVED')
    expect(persistedReview?.rating).toBe(5)
    expect(persistedContact?.status).toBe('RESPONDED')
    expect(persistedService?.startingPrice?.toString()).toBe('123.45')
  } finally {
    try {
      await cleanE2eData(prisma, customerEmail, serviceName)
    } finally {
      await prisma.$disconnect()
    }
  }
})
