<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-vue-next'
import { loginUser, registerUser } from '@/services/auth'

type Mode = 'login' | 'register'

type LoginForm = {
  email: string
  password: string
}

type RegisterForm = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}

const router = useRouter()
const mode = ref<Mode>('login')
const loading = ref(false)
const authError = ref('')

const loginForm = reactive<LoginForm>({
  email: '',
  password: '',
})

const registerForm = reactive<RegisterForm>({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
})

const isLoginMode = computed(() => mode.value === 'login')

function validateLogin(): string | null {
  if (!loginForm.email.trim()) return 'Please enter your email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) return 'Please enter a valid email.'
  if (!loginForm.password.trim()) return 'Please enter your password.'
  return null
}

function validateRegister(): string | null {
  if (!registerForm.firstName.trim()) return 'Please enter your first name.'
  if (!registerForm.lastName.trim()) return 'Please enter your last name.'
  if (!registerForm.email.trim()) return 'Please enter your email.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) return 'Please enter a valid email.'
  if (registerForm.password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

async function handleLogin() {
  authError.value = ''
  const validationMessage = validateLogin()
  if (validationMessage) {
    authError.value = validationMessage
    return
  }

  loading.value = true
  try {
    await loginUser({
      email: loginForm.email.trim(),
      password: loginForm.password,
    })
    await router.push('/account')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message
      authError.value = Array.isArray(message)
        ? message.join(' ')
        : typeof message === 'string'
          ? message
          : 'Unable to sign in. Please try again.'
    } else {
      authError.value = 'Unable to sign in. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  authError.value = ''
  const validationMessage = validateRegister()
  if (validationMessage) {
    authError.value = validationMessage
    return
  }

  loading.value = true
  try {
    await registerUser({
      firstName: registerForm.firstName.trim(),
      lastName: registerForm.lastName.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      phone: registerForm.phone.trim() || undefined,
    })
    await router.push('/account')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message
      authError.value = Array.isArray(message)
        ? message.join(' ')
        : typeof message === 'string'
          ? message
          : 'Unable to create your account. Please try again.'
    } else {
      authError.value = 'Unable to create your account. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-8">
    <div class="grid gap-8 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.4)] lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
      <div class="rounded-[2rem] bg-slate-950 p-8 text-white">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Account access</p>
        <h1 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Your cleaning account</h1>
        <p class="mt-4 text-base leading-7 text-slate-300">
          Manage upcoming appointments, quote requests, and service updates with a secure account built around your cleaning history.
        </p>

        <div class="mt-8 space-y-4">
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <LockKeyhole class="h-5 w-5 text-sky-300" />
            <span class="text-sm text-slate-200">Secure customer authentication</span>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <UserRound class="h-5 w-5 text-sky-300" />
            <span class="text-sm text-slate-200">Track quotes and appointments</span>
          </div>
        </div>
      </div>

      <div class="p-2 sm:p-4">
        <div class="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            class="rounded-full px-5 py-2 text-sm font-semibold transition"
            :class="isLoginMode ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            @click="mode = 'login'"
          >
            Sign in
          </button>
          <button
            type="button"
            class="rounded-full px-5 py-2 text-sm font-semibold transition"
            :class="!isLoginMode ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            @click="mode = 'register'"
          >
            Create account
          </button>
        </div>

        <form v-if="isLoginMode" class="space-y-4" @submit.prevent="handleLogin" novalidate>
          <div>
            <label class="block text-sm font-medium text-slate-700" for="login-email">Email</label>
            <div class="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-primary">
              <Mail class="h-4 w-4 text-slate-400" />
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                class="w-full bg-transparent py-3 pr-3 text-slate-900 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700" for="login-password">Password</label>
            <div class="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-primary">
              <LockKeyhole class="h-4 w-4 text-slate-400" />
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                class="w-full bg-transparent py-3 pr-3 text-slate-900 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <p v-if="authError" class="text-sm text-red-600" role="alert">{{ authError }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
          >
            {{ loading ? 'Signing in…' : 'Sign in' }}
            <ArrowRight class="h-4 w-4" />
          </button>
        </form>

        <form v-else class="space-y-4" @submit.prevent="handleRegister" novalidate>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-slate-700" for="register-first-name">First name</label>
              <input
                id="register-first-name"
                v-model="registerForm.firstName"
                type="text"
                class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                placeholder="Alex"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700" for="register-last-name">Last name</label>
              <input
                id="register-last-name"
                v-model="registerForm.lastName"
                type="text"
                class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                placeholder="Morgan"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700" for="register-email">Email</label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700" for="register-password">Password</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700" for="register-phone">Phone (optional)</label>
            <input
              id="register-phone"
              v-model="registerForm.phone"
              type="tel"
              class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
              placeholder="(425) 555-1234"
            />
          </div>

          <p v-if="authError" class="text-sm text-red-600" role="alert">{{ authError }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
          >
            {{ loading ? 'Creating account…' : 'Create account' }}
            <ArrowRight class="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
