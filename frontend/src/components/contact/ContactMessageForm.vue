<script setup lang="ts">
import { reactive, ref } from 'vue'
import { CircleCheck, Send } from 'lucide-vue-next'
import { createContactMessage, getApiErrorMessage } from '@/services/backend'

const form = reactive({
  customerName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
})
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await createContactMessage({
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      subject: form.subject.trim(),
      message: form.message.trim(),
    })
    sent.value = true
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Your message could not be sent. Please try again.')
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(form, { customerName: '', email: '', phone: '', subject: '', message: '' })
  sent.value = false
  error.value = ''
}
</script>

<template>
  <section class="mx-auto mt-10 max-w-7xl px-6 pb-12 lg:px-8">
    <div class="grid gap-8 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
      <div class="flex flex-col justify-center">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Have a question?</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Send our team a message.</h2>
        <p class="mt-4 leading-7 text-slate-600">For general questions or a special request, send us a note and our team will be in touch.</p>
      </div>

      <div class="rounded-[2rem] bg-slate-50 p-6 sm:p-8">
        <div v-if="sent" class="flex min-h-64 flex-col items-center justify-center gap-4 text-center" role="status">
          <CircleCheck class="h-12 w-12 text-primary" />
          <h3 class="text-xl font-semibold text-slate-900">Message sent</h3>
          <p class="max-w-md text-slate-600">Thanks for reaching out. We’ll follow up as soon as we can.</p>
          <button type="button" class="font-semibold text-primary hover:text-primary-dark" @click="reset">Send another message</button>
        </div>

        <form v-else class="space-y-4" @submit.prevent="submit">
          <p v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ error }}</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-medium text-slate-700" for="contact-name">
              Name
              <input id="contact-name" v-model="form.customerName" required minlength="2" autocomplete="name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary" />
            </label>
            <label class="block text-sm font-medium text-slate-700" for="contact-email">
              Email
              <input id="contact-email" v-model="form.email" required type="email" autocomplete="email" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary" />
            </label>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block text-sm font-medium text-slate-700" for="contact-phone">
              Phone (optional)
              <input id="contact-phone" v-model="form.phone" type="tel" autocomplete="tel" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary" />
            </label>
            <label class="block text-sm font-medium text-slate-700" for="contact-subject">
              Subject
              <input id="contact-subject" v-model="form.subject" required minlength="2" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary" />
            </label>
          </div>
          <label class="block text-sm font-medium text-slate-700" for="contact-message">
            Message
            <textarea id="contact-message" v-model="form.message" required minlength="10" class="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary" />
          </label>
          <button type="submit" :disabled="loading" class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
            {{ loading ? 'Sending…' : 'Send message' }}
            <Send class="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
