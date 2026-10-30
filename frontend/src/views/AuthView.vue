<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { authError, registerCustomer, signIn, signOut, type UserRole } from '@/services/auth'
import { getApiErrorMessage } from '@/services/errors'

const route = useRoute()
const router = useRouter()
const isAdminLogin = computed(() => route.meta.role === 'ADMIN')
const isRegistration = computed(() => route.name === 'customer-register')
const roleLabel = computed(() => isAdminLogin.value ? 'Administrator' : 'Customer')
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const errors = reactive<Record<string, string>>({})

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (isRegistration.value && form.firstName.trim().length < 1) errors.firstName = 'Enter your first name.'
  if (isRegistration.value && form.lastName.trim().length < 1) errors.lastName = 'Enter your last name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (!form.password) errors.password = 'Enter your password.'
  else if (isRegistration.value && form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  return Object.keys(errors).length === 0
}

async function submit() {
  errorMessage.value = ''
  if (isSubmitting.value || !validate()) return
  isSubmitting.value = true
  try {
    if (isRegistration.value) {
      await registerCustomer({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      })
    } else {
      const user = await signIn(form.email.trim(), form.password)
      const requiredRole = isAdminLogin.value ? 'ADMIN' : 'CUSTOMER'
      if (user.role !== requiredRole) {
        signOut()
        errorMessage.value = `This account does not have ${requiredRole.toLowerCase()} access.`
        return
      }
    }
    const role = route.meta.role as UserRole | undefined
    const rootPath = role === 'ADMIN' ? '/admin' : '/account'
    const requestedPath = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const redirect =
      requestedPath.startsWith(`${rootPath}/`) || requestedPath === rootPath
        ? requestedPath
        : rootPath
    await router.replace(redirect)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'We could not complete sign-in. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="relative isolate flex min-h-[calc(100vh-7rem)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
    <div class="absolute -left-20 top-0 -z-10 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
    <div class="absolute -right-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />
    <div class="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 md:grid-cols-[0.9fr_1.1fr]">
      <div class="hidden flex-col justify-between bg-slate-950 p-10 text-white md:flex">
        <RouterLink to="/" class="inline-flex items-center gap-3">
          <Sparkles class="h-7 w-7 text-sky-300" />
          <span class="text-lg font-semibold">Miracle Shine</span>
        </RouterLink>
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">{{ roleLabel }} portal</p>
          <h1 class="mt-4 text-4xl font-semibold leading-tight">
            {{ isRegistration ? 'A brighter way to manage your cleaning.' : 'Welcome back to a space that shines.' }}
          </h1>
          <p class="mt-5 leading-7 text-slate-300">Access your account securely and stay connected with your Miracle Shine service.</p>
        </div>
        <p class="flex items-center gap-2 text-sm text-slate-400"><ShieldCheck class="h-4 w-4 text-sky-300" /> Your account is protected by secure sign-in.</p>
      </div>

      <div class="p-6 sm:p-10">
        <RouterLink to="/" class="text-sm font-medium text-primary hover:underline">← Back to website</RouterLink>
        <p class="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {{ isRegistration ? 'Create your customer account' : `Sign in · ${roleLabel}` }}
        </p>
        <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {{ isRegistration ? 'Get started' : 'Welcome back' }}
        </h2>
        <p class="mt-2 text-slate-600">
          {{ isRegistration ? 'Track requests and appointments in one place.' : 'Enter your credentials to continue.' }}
        </p>

        <form class="mt-8 space-y-4" novalidate @submit.prevent="submit">
          <div v-if="isRegistration" class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-medium text-slate-700">
              First name
              <input v-model="form.firstName" maxlength="100" autocomplete="given-name" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              <span v-if="errors.firstName" class="mt-1 block text-sm text-red-700" role="alert">{{ errors.firstName }}</span>
            </label>
            <label class="block text-sm font-medium text-slate-700">
              Last name
              <input v-model="form.lastName" maxlength="100" autocomplete="family-name" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              <span v-if="errors.lastName" class="mt-1 block text-sm text-red-700" role="alert">{{ errors.lastName }}</span>
            </label>
          </div>
          <label v-if="isRegistration" class="block text-sm font-medium text-slate-700">
            Phone <span class="font-normal text-slate-500">(optional)</span>
            <input v-model="form.phone" type="tel" maxlength="30" autocomplete="tel" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
          </label>
          <label class="block text-sm font-medium text-slate-700">
            Email
            <input v-model="form.email" type="email" autocomplete="email" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            <span v-if="errors.email" class="mt-1 block text-sm text-red-700" role="alert">{{ errors.email }}</span>
          </label>
          <label class="block text-sm font-medium text-slate-700">
            Password
            <input v-model="form.password" type="password" :autocomplete="isRegistration ? 'new-password' : 'current-password'" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
            <span v-if="isRegistration" class="mt-1 block text-xs font-normal text-slate-500">At least 8 characters.</span>
            <span v-if="errors.password" class="mt-1 block text-sm text-red-700" role="alert">{{ errors.password }}</span>
          </label>
          <p v-if="authError" class="rounded-xl bg-amber-50 p-3 text-sm text-amber-800" role="status">{{ authError }}</p>
          <p v-if="errorMessage" class="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
          <button type="submit" :disabled="isSubmitting" class="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">
            {{ isSubmitting ? 'Please wait…' : isRegistration ? 'Create account' : 'Sign in' }}
            <ArrowRight class="h-4 w-4" />
          </button>
        </form>

        <p v-if="!isAdminLogin" class="mt-6 text-center text-sm text-slate-600">
          <template v-if="isRegistration">Already registered? <RouterLink to="/login" class="font-semibold text-primary hover:underline">Sign in</RouterLink></template>
          <template v-else>New to Miracle Shine? <RouterLink to="/register" class="font-semibold text-primary hover:underline">Create an account</RouterLink></template>
        </p>
        <p v-if="!isAdminLogin && !isRegistration" class="mt-3 text-center text-xs text-slate-500">
          Administrator? <RouterLink to="/admin/login" class="font-medium text-primary hover:underline">Use administrator sign-in</RouterLink>
        </p>
      </div>
    </div>
  </section>
</template>
