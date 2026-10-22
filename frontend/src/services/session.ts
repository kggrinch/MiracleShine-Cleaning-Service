import { computed, ref } from 'vue'
import type { User } from '@/services/backend'

const tokenKey = 'miracle-shine-token'
const storedToken = window.localStorage.getItem(tokenKey)

export const currentUser = ref<User | null>(null)
export const isAuthenticated = computed(() => Boolean(window.localStorage.getItem(tokenKey)))
export const hasSession = ref(Boolean(storedToken))

export function saveSession(token: string, user: User) {
  window.localStorage.setItem(tokenKey, token)
  currentUser.value = user
  hasSession.value = true
}

export function clearSession() {
  window.localStorage.removeItem(tokenKey)
  currentUser.value = null
  hasSession.value = false
}
