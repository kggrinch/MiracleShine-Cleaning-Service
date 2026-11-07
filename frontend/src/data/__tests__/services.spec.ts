import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { toServiceCard, type CleaningService } from '@/services/catalog'
import ServiceCard from '@/components/services/ServiceCard.vue'

const service: CleaningService = {
  id: 'service-1',
  name: 'Residential Cleaning',
  description: 'Consistent care for kitchens, bathrooms, and living areas.',
  category: 'RESIDENTIAL',
  startingPrice: '125.00',
  estimatedDurationMinutes: 120,
  imageUrl: null,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('backend service presentation', () => {
  it('derives card presentation from a service returned by the API', () => {
    const card = toServiceCard(service)
    expect(card.id).toBe(service.id)
    expect(card.title).toBe(service.name)
    expect(card.slug).toBe('residential-cleaning')
    expect(card.description).toBe(service.description)
    expect(card.icon).toBeTruthy()
  })

  it('renders actual service fields and hides the empty includes list', () => {
    const card = toServiceCard(service)
    const wrapper = mount(ServiceCard, {
      props: { service: card, detailed: true },
      global: {
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })
    expect(wrapper.text()).toContain(service.name)
    expect(wrapper.text()).toContain('From $125.00')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
