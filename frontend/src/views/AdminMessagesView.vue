<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Mail, Phone } from 'lucide-vue-next'
import api from '@/services/api'
import type { ContactMessage } from '@/services/portal'
import { getApiErrorMessage } from '@/services/errors'

const messages = ref<ContactMessage[]>([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const statuses: ContactMessage['status'][] = ['NEW', 'READ', 'RESPONDED', 'CLOSED']

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.get<ContactMessage[]>('/admin/contact-messages')
    messages.value = data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Contact messages could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function updateStatus(message: ContactMessage, status: ContactMessage['status']) {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await api.patch<ContactMessage>(`/admin/contact-messages/${message.id}/status`, { status })
    message.status = data.status
    successMessage.value = 'Message status updated.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Message status could not be updated.')
  }
}

function replyLink(message: ContactMessage) {
  const subject = encodeURIComponent(`Re: ${message.subject}`)
  const body = encodeURIComponent(`Hello ${message.customerName},\n\n`)
  return `mailto:${encodeURIComponent(message.email)}?subject=${subject}&body=${body}`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Inbox</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Contact messages</h1>
      <p class="mt-2 text-slate-600">Messages are stored for review. Replies are sent from your email application, not this portal.</p>
    </header>
    <p v-if="errorMessage" class="rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{{ successMessage }}</p>
    <p v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading contact messages…</p>
    <div v-else-if="messages.length" class="space-y-4">
      <article v-for="message in messages" :key="message.id" class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold text-slate-900">{{ message.subject }}</h2>
              <span class="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">{{ message.status }}</span>
            </div>
            <p class="mt-1 text-sm text-slate-500">{{ message.customerName }} · {{ formatDate(message.createdAt) }}</p>
          </div>
          <label class="text-xs font-medium text-slate-500">
            Message status
            <select :value="message.status" class="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700" @change="updateStatus(message, ($event.target as HTMLSelectElement).value as ContactMessage['status'])">
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </label>
        </div>
        <p class="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{{ message.message }}</p>
        <div class="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <a :href="replyLink(message)" class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"><Mail class="h-4 w-4" /> Email customer</a>
          <a v-if="message.phone" :href="`tel:${message.phone}`" class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"><Phone class="h-4 w-4" /> {{ message.phone }}</a>
        </div>
      </article>
    </div>
    <p v-else class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">No contact messages have been received.</p>
  </div>
</template>
