<script setup lang="ts">
import { reactive, ref } from 'vue'
import { CircleCheck, Send } from 'lucide-vue-next'
import api from '@/services/api'
import { currentUser } from '@/services/auth'
import { getApiErrorMessage } from '@/services/errors'

const form = reactive({
  customerName: currentUser.value ? `${currentUser.value.firstName} ${currentUser.value.lastName}` : '',
  email: currentUser.value?.email ?? '',
  phone: currentUser.value?.phone ?? '',
  subject: '',
  message: '',
})
const loading = ref(false)
const submitted = ref(false)
const errorMessage = ref('')

async function submit() {
  if (loading.value) return
  errorMessage.value = ''
  if (form.customerName.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.subject.trim().length < 2 || form.message.trim().length < 10) {
    errorMessage.value = 'Enter your name, a valid email address, a subject, and a message of at least 10 characters.'
    return
  }

  loading.value = true
  try {
    await api.post('/contact-messages', {
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      subject: form.subject.trim(),
      message: form.message.trim(),
    })
    submitted.value = true
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Your message could not be sent. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.3)] sm:p-8">
    <div class="mx-auto max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Have a question?</p>
      <h2 class="mt-2 text-2xl font-semibold text-slate-900">Send our team a message</h2>
      <p class="mt-2 text-sm leading-6 text-slate-600">This form stores your message for the team. It does not send an immediate email reply.</p>

      <div v-if="submitted" class="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-900" role="status">
        <CircleCheck class="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p class="font-semibold">Message received</p>
          <p class="mt-1 text-sm">Thank you. The Miracle Shine team will follow up using the contact information you provided.</p>
        </div>
      </div>
      <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="text-sm font-medium text-slate-700">Name
            <input v-model="form.customerName" maxlength="200" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label class="text-sm font-medium text-slate-700">Email
            <input v-model="form.email" type="email" required autocomplete="email" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label class="text-sm font-medium text-slate-700">Phone <span class="font-normal text-slate-500">(optional)</span>
            <input v-model="form.phone" type="tel" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
          <label class="text-sm font-medium text-slate-700">Subject
            <input v-model="form.subject" maxlength="200" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </label>
        </div>
        <label class="block text-sm font-medium text-slate-700">Message
          <textarea v-model="form.message" maxlength="5000" minlength="10" required rows="5" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
        <p v-if="errorMessage" class="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
        <button type="submit" :disabled="loading" class="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {{ loading ? 'Sending…' : 'Send message' }} <Send class="h-4 w-4" />
        </button>
      </form>
    </div>
  </section>
</template>
