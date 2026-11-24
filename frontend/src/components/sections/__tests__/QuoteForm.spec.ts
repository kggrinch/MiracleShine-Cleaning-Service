import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import api from '@/services/api'
import { currentUser } from '@/services/auth'
import QuoteForm from '../QuoteForm.vue'

vi.mock('@/services/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

describe('QuoteForm', () => {
  const serviceId = 'service-1'

  beforeEach(() => {
    currentUser.value = null
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({
      data: [
        {
          id: serviceId,
          name: 'Residential Cleaning',
          description: 'Care for the home.',
        },
      ],
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

  it('submits optional property and preferred schedule details without client-supplied ownership', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { id: 'quote-2' } } as AxiosResponse)
    const wrapper = mount(QuoteForm)
    await fillForm(wrapper)
    await wrapper.find('#quote-square-footage').setValue('1200')
    await wrapper.find('#quote-bedrooms').setValue('3')
    await wrapper.find('#quote-bathrooms').setValue('1.5')
    await wrapper.find('#quote-preferred-date').setValue('2030-08-15')
    await wrapper.find('#quote-preferred-time').setValue('09:30')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith(
      '/quote-requests',
      expect.objectContaining({
        serviceId,
        propertyType: 'HOUSE',
        squareFootage: 1200,
        bedrooms: 3,
        bathrooms: 1.5,
        preferredDate: '2030-08-15',
        preferredTime: '09:30',
      }),
    )
    expect(vi.mocked(api.post).mock.calls[0]?.[1]).not.toHaveProperty('userId')
    expect(wrapper.text()).toContain('not a confirmed cleaning appointment')
  })

  it('prefills editable account contact information and hides residential fields for offices', async () => {
    currentUser.value = {
      id: 'customer-1',
      firstName: 'Ava',
      lastName: 'Smith',
      email: 'ava@example.com',
      phone: '425-555-0101',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    }

    const wrapper = mount(QuoteForm)
    await flushPromises()

    expect((wrapper.get('#quote-first-name').element as HTMLInputElement).value).toBe('Ava')
    expect((wrapper.get('#quote-email').element as HTMLInputElement).value).toBe('ava@example.com')

    await fillForm(wrapper)
    await wrapper.find('#quote-bedrooms').setValue('2')
    await wrapper.find('#quote-bathrooms').setValue('1.5')
    await wrapper.find('#quote-property-type').setValue('OFFICE')
    expect(wrapper.find('#quote-bedrooms').exists()).toBe(false)
    expect(wrapper.find('#quote-bathrooms').exists()).toBe(false)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    const submittedData = vi.mocked(api.post).mock.calls[0]?.[1]
    expect(submittedData).not.toHaveProperty('userId')
    expect(submittedData).not.toHaveProperty('bedrooms')
    expect(submittedData).not.toHaveProperty('bathrooms')
  })

  it('preselects a service passed from its service page and shows its description', async () => {
    const wrapper = mount(QuoteForm, { props: { serviceId } })
    await flushPromises()

    expect((wrapper.get('#quote-service').element as HTMLSelectElement).value).toBe(serviceId)
    expect(wrapper.text()).toContain('Care for the home.')
  })

  it('rejects negative measurements and dates in the past before submission', async () => {
    const wrapper = mount(QuoteForm)
    await fillForm(wrapper)
    await wrapper.find('#quote-square-footage').setValue('-1')
    await wrapper.find('#quote-preferred-date').setValue('2000-01-01')
    await wrapper.find('form').trigger('submit')

    expect(api.post).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Enter a whole number between 0 and 2,147,483,647.')
    expect(wrapper.text()).toContain('Choose today or a future date.')
  })

  it('ignores repeated submits while the first request is still in flight', async () => {
    let resolveRequest!: (response: AxiosResponse) => void
    vi.mocked(api.post).mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }),
    )
    const wrapper = mount(QuoteForm)
    await fillForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await wrapper.find('form').trigger('submit')

    expect(api.post).toHaveBeenCalledTimes(1)
    resolveRequest({ data: { id: 'quote-3' } } as AxiosResponse)
    await flushPromises()
  })
})
