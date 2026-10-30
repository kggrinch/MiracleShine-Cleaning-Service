import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import api from '@/services/api'
import QuoteForm from '../QuoteForm.vue'

vi.mock('@/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

describe('QuoteForm', () => {
  const serviceId = 'service-1'

  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: serviceId, name: 'Residential Cleaning' }],
    } as AxiosResponse)
    vi.mocked(api.post).mockReset()
  })

  async function fillForm(wrapper: ReturnType<typeof mount>) {
    await flushPromises()
    await wrapper.find('#quote-first-name').setValue('Ava')
    await wrapper.find('#quote-last-name').setValue('Smith')
    await wrapper.find('#quote-phone').setValue('425-555-0101')
    await wrapper.find('#quote-email').setValue('ava@example.com')
    await wrapper.find('#quote-address').setValue('1 Main Street')
    await wrapper.find('#quote-city').setValue('Seattle')
    await wrapper.find('#quote-state').setValue('WA')
    await wrapper.find('#quote-postal-code').setValue('98101')
    await wrapper.find('#quote-property-type').setValue('HOUSE')
    await wrapper.find('#quote-message').setValue('Please clean my home.')
  }

  it('submits the quote to the API and only then displays success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'quote-1' } } as AxiosResponse)
    const wrapper = mount(QuoteForm)
    await fillForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/quote-requests', {
      serviceId,
      customerFirstName: 'Ava',
      customerLastName: 'Smith',
      customerEmail: 'ava@example.com',
      customerPhone: '425-555-0101',
      propertyType: 'HOUSE',
      streetAddress: '1 Main Street',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      notes: 'Please clean my home.',
    })
    expect(wrapper.text()).toContain('Request received')
  })

  it('shows server errors without displaying a success message', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network error'))
    const wrapper = mount(QuoteForm)
    await fillForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('We could not submit your request')
    expect(wrapper.text()).not.toContain('Request received')
  })

  it('requires the address fields before sending a request', async () => {
    const wrapper = mount(QuoteForm)
    await fillForm(wrapper)
    await wrapper.find('#quote-city').setValue('')
    await wrapper.find('form').trigger('submit')

    expect(api.post).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Enter between 2 and 100 characters.')
  })
})
