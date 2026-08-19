import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { featuredServices, services } from '../services'
import { overallRating, reviews } from '../reviews'
import ServiceCard from '@/components/services/ServiceCard.vue'

describe('services data', () => {
  it('defines the full nine-service collection exactly once', () => {
    expect(services).toHaveLength(9)
    // Slug is the deep-link anchor id, so it must be unique & URL-safe.
    const slugs = services.map((service) => service.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs.every((slug) => /^[a-z0-9-]+$/.test(slug))).toBe(true)
  })

  it('gives every service a title, description, icon, and includes', () => {
    for (const service of services) {
      expect(service.title).toBeTruthy()
      expect(service.description).toBeTruthy()
      expect(service.icon).toBeTruthy()
      expect(service.includes.length).toBeGreaterThan(0)
    }
  })

  it('ships the required named services', () => {
    const titles = services.map((service) => service.title)
    expect(titles).toContain('Residential Cleaning')
    expect(titles).toContain('Commercial Cleaning')
    expect(titles).toContain('Deep Cleaning')
    expect(titles).toContain('Move In / Move Out Cleaning')
    expect(titles).toContain('Disinfecting & Sanitizing Services')
    expect(titles).toContain('Post Construction Cleaning')
    expect(titles).toContain('Carpet Cleaning')
    expect(titles).toContain('Office Cleaning')
    expect(titles).toContain('Special Service Cleaning')
  })

  it('keeps the home page as a strict subset of the full list', () => {
    expect(featuredServices.length).toBeGreaterThan(0)
    expect(featuredServices.length).toBeLessThan(services.length)
    for (const service of featuredServices) {
      expect(services.map((s) => s.slug)).toContain(service.slug)
    }
  })
})

describe('reviews data', () => {
  it('shares one rating and a non-empty testimonial list', () => {
    expect(overallRating).toBeGreaterThanOrEqual(0)
    expect(overallRating).toBeLessThanOrEqual(5)
    expect(reviews.length).toBeGreaterThan(0)
    for (const review of reviews) {
      expect(review.name).toBeTruthy()
      expect(review.quote).toBeTruthy()
    }
  })
})

describe('ServiceCard', () => {
  const RouterLinkStub = {
    props: { to: { type: String } },
    template: '<a><slot /></a>',
  }

  it('renders the service title and hides the checklist unless detailed', () => {
    const service = services[0]!
    const compact = mount(ServiceCard, { props: { service }, global: { stubs: { RouterLink: RouterLinkStub } } })
    expect(compact.text()).toContain(service.title)
    expect(compact.findAll('li')).toHaveLength(0)

    const detailed = mount(ServiceCard, {
      props: { service, detailed: true },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })
    expect(detailed.findAll('li')).toHaveLength(service.includes.length)
  })
})