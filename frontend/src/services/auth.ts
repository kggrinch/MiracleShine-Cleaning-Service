import { computed, ref } from 'vue'
import api from '@/services/api'
import { getApiErrorMessage } from '@/services/errors'

export type UserRole = 'CUSTOMER' | 'ADMIN'

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type AuthResponse = {
  token: string
  user: User
}

export const currentUser = ref<User | null>(null)
export const authReady = ref(false)
export const authError = ref('')
export const isAuthenticated = computed(() => currentUser.value !== null)

export async function initializeAuth(): Promise<void> {
  if (authReady.value) return
  const token = sessionStorage.getItem('miracleshine-token')
  if (!token) {
    authReady.value = true
    return
  }

  try {
    const { data } = await api.get<User>('/auth/me')
    currentUser.value = data
  } catch (error) {
    currentUser.value = null
    authError.value = getApiErrorMessage(
      error,
      'Unable to verify your session. Please sign in again.',
    )
    sessionStorage.removeItem('miracleshine-token')
  } finally {
    authReady.value = true
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  sessionStorage.setItem('miracleshine-token', data.token)
  currentUser.value = data.user
  authError.value = ''
  authReady.value = true
  return data.user
}

export async function registerCustomer(input: {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/register', input)
  sessionStorage.setItem('miracleshine-token', data.token)
  currentUser.value = data.user
  authError.value = ''
  authReady.value = true
  return data.user
}

export function signOut(): void {
  sessionStorage.removeItem('miracleshine-token')
  currentUser.value = null
  authError.value = ''
  authReady.value = true
}

window.addEventListener('miracleshine:auth-expired', () => {
  currentUser.value = null
  authError.value = 'Your session expired. Please sign in again.'
})
