<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { computed, onMounted, reactive, ref } from 'vue'
import { currentUser, type User } from '@/services/auth'
import api from '@/services/api'
import { getApiErrorMessage } from '@/services/errors'

const form = reactive({ firstName: '', lastName: '', email: '', phone: '' })
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showPasswordForm = ref(false)
const changingPassword = ref(false)
const passwordErrorMessage = ref('')
const passwordSuccessMessage = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const minimumPasswordLength = computed(() =>
  currentUser.value?.role === 'ADMIN' ? 12 : 8,
)
type PasswordField = keyof typeof passwordForm
const passwordErrors = reactive<Partial<Record<PasswordField, string>>>({})

onMounted(async () => {
  try {
    const { data } = await api.get<User>('/users/me')
    Object.assign(form, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? '',
    })
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Account information could not be loaded.')
  } finally {
    loading.value = false
  }
})

async function save() {
  errorMessage.value = ''
  successMessage.value = ''
  if (form.firstName.trim().length < 1 || form.lastName.trim().length < 1 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errorMessage.value = 'Enter a first name, last name, and valid email address.'
    return
  }

  saving.value = true
  try {
    const { data } = await api.patch<User>('/users/me', {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    })
    currentUser.value = data
    successMessage.value = 'Account details updated.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Account details could not be updated.')
  } finally {
    saving.value = false
  }
}

function clearPasswordErrors() {
  Object.keys(passwordErrors).forEach((key) => {
    delete passwordErrors[key as PasswordField]
  })
}

function validatePasswordForm(): boolean {
  clearPasswordErrors()
  passwordErrorMessage.value = ''

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Enter your current password.'
  }
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'Enter a new password.'
  } else if (passwordForm.newPassword.length < minimumPasswordLength.value) {
    passwordErrors.newPassword = `Password must be at least ${minimumPasswordLength.value} characters.`
  } else if (new TextEncoder().encode(passwordForm.newPassword).length > 72) {
    passwordErrors.newPassword = 'Password must be 72 bytes or fewer.'
  } else if (passwordForm.newPassword === passwordForm.currentPassword) {
    passwordErrors.newPassword = 'New password must differ from the current password.'
  }
  if (!passwordForm.confirmNewPassword) {
    passwordErrors.confirmNewPassword = 'Confirm your new password.'
  } else if (passwordForm.confirmNewPassword !== passwordForm.newPassword) {
    passwordErrors.confirmNewPassword = 'Passwords do not match.'
  }

  return Object.keys(passwordErrors).length === 0
}

async function changePassword() {
  if (changingPassword.value || !validatePasswordForm()) return

  passwordSuccessMessage.value = ''
  changingPassword.value = true
  try {
    const { data } = await api.patch<{ message: string }>('/users/me/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmNewPassword: passwordForm.confirmNewPassword,
    })
    passwordSuccessMessage.value = data.message
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmNewPassword = ''
    showPasswordForm.value = false
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
  } catch (error) {
    passwordErrorMessage.value = getApiErrorMessage(
      error,
      'Password could not be changed. Please try again.',
    )
  } finally {
    changingPassword.value = false
  }
}

function openPasswordForm() {
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''
  clearPasswordErrors()
  showPasswordForm.value = true
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

function cancelPasswordChange() {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmNewPassword = ''
  passwordErrorMessage.value = ''
  clearPasswordErrors()
  showPasswordForm.value = false
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Profile</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Account settings</h1>
      <p class="mt-2 text-slate-600">Update the profile information associated with your account.</p>
    </header>
    <p v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading account information…</p>
    <form v-else class="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" @submit.prevent="save">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="text-sm font-medium text-slate-700">First name
          <input v-model="form.firstName" maxlength="100" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
        <label class="text-sm font-medium text-slate-700">Last name
          <input v-model="form.lastName" maxlength="100" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
      </div>
      <label class="block text-sm font-medium text-slate-700">Email
        <input v-model="form.email" type="email" maxlength="255" required autocomplete="email" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
      </label>
      <label class="block text-sm font-medium text-slate-700">Phone <span class="font-normal text-slate-500">(optional)</span>
        <input v-model="form.phone" type="tel" maxlength="30" autocomplete="tel" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
      </label>
      <p class="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Password changes are not available in the current backend API. Contact an administrator if you need help with your password.
      </p>
      <p v-if="errorMessage" class="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{{ successMessage }}</p>
      <button type="submit" :disabled="saving" class="rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">{{ saving ? 'Saving…' : 'Save changes' }}</button>
    </form>

    <section class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Password</h2>
          <p class="mt-1 text-sm text-slate-600">Update the password you use to sign in.</p>
        </div>
        <button
          v-if="!showPasswordForm"
          type="button"
          class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
          aria-label="Open change password form"
          @click="openPasswordForm"
        >
          Change password
        </button>
      </div>

      <p v-if="passwordSuccessMessage" class="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
        {{ passwordSuccessMessage }}
      </p>
      <form
        v-if="showPasswordForm"
        class="password-change-form mt-5 space-y-4"
        :aria-busy="changingPassword"
        @submit.prevent="changePassword"
      >
        <div class="relative">
          <label for="current-password" class="block text-sm font-medium text-slate-700">Current password</label>
          <input
            id="current-password"
            v-model="passwordForm.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            autocomplete="current-password"
            :aria-invalid="Boolean(passwordErrors.currentPassword)"
            :aria-describedby="passwordErrors.currentPassword ? 'current-password-error' : undefined"
            class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            class="absolute right-3 top-9 rounded-md p-1.5 text-slate-500 hover:text-slate-800"
            :aria-label="showCurrentPassword ? 'Hide current password' : 'Show current password'"
            :aria-pressed="showCurrentPassword"
            @click="showCurrentPassword = !showCurrentPassword"
          >
            <EyeOff v-if="showCurrentPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
          <p v-if="passwordErrors.currentPassword" id="current-password-error" class="mt-1 text-sm text-red-700" role="alert">
            {{ passwordErrors.currentPassword }}
          </p>
        </div>

        <div class="relative">
          <label for="new-password" class="block text-sm font-medium text-slate-700">New password</label>
          <input
            id="new-password"
            v-model="passwordForm.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            maxlength="72"
            :aria-invalid="Boolean(passwordErrors.newPassword)"
            :aria-describedby="passwordErrors.newPassword ? 'new-password-error' : 'new-password-hint'"
            class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            class="absolute right-3 top-9 rounded-md p-1.5 text-slate-500 hover:text-slate-800"
            :aria-label="showNewPassword ? 'Hide new password' : 'Show new password'"
            :aria-pressed="showNewPassword"
            @click="showNewPassword = !showNewPassword"
          >
            <EyeOff v-if="showNewPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
          <p v-if="passwordErrors.newPassword" id="new-password-error" class="mt-1 text-sm text-red-700" role="alert">
            {{ passwordErrors.newPassword }}
          </p>
          <p v-else id="new-password-hint" class="mt-1 text-xs text-slate-500">
            At least {{ minimumPasswordLength }} characters.
          </p>
        </div>

        <div class="relative">
          <label for="confirm-new-password" class="block text-sm font-medium text-slate-700">Confirm new password</label>
          <input
            id="confirm-new-password"
            v-model="passwordForm.confirmNewPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            maxlength="72"
            :aria-invalid="Boolean(passwordErrors.confirmNewPassword)"
            :aria-describedby="passwordErrors.confirmNewPassword ? 'confirm-new-password-error' : undefined"
            class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            class="absolute right-3 top-9 rounded-md p-1.5 text-slate-500 hover:text-slate-800"
            :aria-label="showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'"
            :aria-pressed="showConfirmPassword"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
          <p v-if="passwordErrors.confirmNewPassword" id="confirm-new-password-error" class="mt-1 text-sm text-red-700" role="alert">
            {{ passwordErrors.confirmNewPassword }}
          </p>
        </div>

        <p v-if="passwordErrorMessage" class="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">
          {{ passwordErrorMessage }}
        </p>
        <div class="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            :disabled="changingPassword"
            class="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60"
          >
            {{ changingPassword ? 'Changing password…' : 'Change password' }}
          </button>
          <button
            type="button"
            :disabled="changingPassword"
            class="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-60"
            @click="cancelPasswordChange"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
