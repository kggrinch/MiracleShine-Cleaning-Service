import { flushPromises, mount } from '@vue/test-utils'
import type { AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '@/services/api'
import CustomerSettingsView from '../CustomerSettingsView.vue'

vi.mock('@/services/api', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}))

describe('CustomerSettingsView password change', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset()
    vi.mocked(api.get).mockResolvedValue({
      data: {
        id: 'user-1',
        firstName: 'Ava',
        lastName: 'Smith',
        email: 'ava@example.com',
        phone: null,
        role: 'CUSTOMER',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    } as AxiosResponse)
    vi.mocked(api.patch).mockReset()
  })

  async function openForm() {
    const wrapper = mount(CustomerSettingsView)
    await flushPromises()
    await wrapper.get('button[aria-label="Open change password form"]').trigger('click')
    return wrapper
  }

  it('keeps the form collapsed and validates required, matching, and distinct passwords', async () => {
    const wrapper = mount(CustomerSettingsView)
    await flushPromises()
    expect(wrapper.find('.password-change-form').exists()).toBe(false)
    await wrapper.get('button[aria-label="Open change password form"]').trigger('click')
    expect(wrapper.find('.password-change-form').exists()).toBe(true)

    await wrapper.get('.password-change-form').trigger('submit')
    expect(wrapper.text()).toContain('Enter your current password.')
    expect(wrapper.text()).toContain('Enter a new password.')
    expect(wrapper.text()).toContain('Confirm your new password.')
    expect(api.patch).not.toHaveBeenCalled()

    await wrapper.get('#current-password').setValue('CurrentPassword123')
    await wrapper.get('#new-password').setValue('NewPassword123')
    await wrapper.get('#confirm-new-password').setValue('OtherPassword123')
    await wrapper.get('.password-change-form').trigger('submit')
    expect(wrapper.text()).toContain('Passwords do not match.')

    await wrapper.get('#new-password').setValue('CurrentPassword123')
    await wrapper.get('#confirm-new-password').setValue('CurrentPassword123')
    await wrapper.get('.password-change-form').trigger('submit')
    expect(wrapper.text()).toContain('New password must differ from the current password.')
    expect(api.patch).not.toHaveBeenCalled()

    await wrapper.get('#new-password').setValue('short')
    await wrapper.get('#confirm-new-password').setValue('short')
    await wrapper.get('.password-change-form').trigger('submit')
    expect(wrapper.text()).toContain('Password must be at least 8 characters.')
  })

  it('submits a valid change, shows success, and provides password visibility toggles', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { message: 'Password changed successfully.' },
    } as AxiosResponse)
    const wrapper = await openForm()

    await wrapper.get('#current-password').setValue('CurrentPassword123')
    await wrapper.get('#new-password').setValue('NewPassword123')
    await wrapper.get('#confirm-new-password').setValue('NewPassword123')
    const visibilityToggles = [
      ['current-password', 'Show current password'],
      ['new-password', 'Show new password'],
      ['confirm-new-password', 'Show password confirmation'],
    ]
    for (const [fieldId, label] of visibilityToggles) {
      await wrapper.get(`button[aria-label="${label}"]`).trigger('click')
      expect(wrapper.get(`#${fieldId}`).attributes('type')).toBe('text')
    }

    await wrapper.get('.password-change-form').trigger('submit')
    await flushPromises()

    expect(api.patch).toHaveBeenCalledWith('/users/me/password', {
      currentPassword: 'CurrentPassword123',
      newPassword: 'NewPassword123',
      confirmNewPassword: 'NewPassword123',
    })
    expect(wrapper.get('[role="status"]').text()).toContain('Password changed successfully.')
    expect(wrapper.find('.password-change-form').exists()).toBe(false)
  })

  it('shows backend errors without treating the change as successful', async () => {
    vi.mocked(api.patch).mockRejectedValue(
      Object.assign(new Error('request failed'), {
        isAxiosError: true,
        response: { data: { message: 'Current password is incorrect.' } },
      }),
    )
    const wrapper = await openForm()

    await wrapper.get('#current-password').setValue('WrongPassword123')
    await wrapper.get('#new-password').setValue('NewPassword123')
    await wrapper.get('#confirm-new-password').setValue('NewPassword123')
    await wrapper.get('.password-change-form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Current password is incorrect.')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })

  it('disables repeat submissions while the request is pending', async () => {
    let finishRequest!: (response: AxiosResponse) => void
    vi.mocked(api.patch).mockReturnValue(
      new Promise((resolve) => {
        finishRequest = resolve
      }),
    )
    const wrapper = await openForm()
    await wrapper.get('#current-password').setValue('CurrentPassword123')
    await wrapper.get('#new-password').setValue('NewPassword123')
    await wrapper.get('#confirm-new-password').setValue('NewPassword123')

    const form = wrapper.get('.password-change-form')
    await form.trigger('submit')
    expect(wrapper.get('.password-change-form button[type="submit"]').attributes('disabled')).toBeDefined()
    await form.trigger('submit')
    expect(api.patch).toHaveBeenCalledTimes(1)

    finishRequest({ data: { message: 'Password changed successfully.' } } as AxiosResponse)
    await flushPromises()
  })
})
