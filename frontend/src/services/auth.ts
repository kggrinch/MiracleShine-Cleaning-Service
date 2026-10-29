import api from './api'

export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: 'CUSTOMER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const TOKEN_STORAGE_KEY = 'miracle-shine-token'
const USER_STORAGE_KEY = 'miracle-shine-user'

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser | null): void {
  if (!user) {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function signOut(): void {
  clearStoredToken()
  setStoredUser(null)
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken())
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get('/auth/me')
  setStoredUser(data)
  return data as AuthUser
}

export async function loginUser(payload: { email: string; password: string }) {
  const { data } = await api.post('/auth/login', payload)
  setStoredToken(data.token)
  setStoredUser(data.user)
  return data as { token: string; user: AuthUser }
}

export async function registerUser(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}) {
  const { data } = await api.post('/auth/register', payload)
  setStoredToken(data.token)
  setStoredUser(data.user)
  return data as { token: string; user: AuthUser }
}
