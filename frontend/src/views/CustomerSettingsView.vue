<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { currentUser, type User } from '@/services/auth'
import api from '@/services/api'
import { getApiErrorMessage } from '@/services/errors'

const form = reactive({ firstName: '', lastName: '', email: '', phone: '' })
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

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
  </div>
</template>
