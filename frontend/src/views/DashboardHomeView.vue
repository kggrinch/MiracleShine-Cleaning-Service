<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight, CalendarDays, ClipboardList, Mail, Sparkles } from 'lucide-vue-next'
import api from '@/services/api'
import { currentUser } from '@/services/auth'
import type { AppointmentRecord, ContactMessage, QuoteRequest } from '@/services/portal'
import type { CleaningService } from '@/services/catalog'
import { getApiErrorMessage } from '@/services/errors'

const route = useRoute()
const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')
const quotes = ref<QuoteRequest[]>([])
const appointments = ref<AppointmentRecord[]>([])
const messages = ref<ContactMessage[]>([])
const services = ref<CleaningService[]>([])
const loading = ref(true)
const loadError = ref('')
const isQuoteList = computed(() => route.path === '/account/quotes')

const metrics = computed(() =>
  isAdmin.value
    ? [
        { label: 'All quote requests', value: quotes.value.length, icon: ClipboardList, color: 'bg-sky-50 text-sky-700' },
        { label: 'Pending quotes', value: quotes.value.filter((quote) => quote.status === 'PENDING').length, icon: CalendarDays, color: 'bg-amber-50 text-amber-700' },
        { label: 'Active services', value: services.value.filter((service) => service.isActive).length, icon: Sparkles, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'New messages', value: messages.value.filter((message) => message.status === 'NEW').length, icon: Mail, color: 'bg-violet-50 text-violet-700' },
      ]
    : [
        { label: 'My quote requests', value: quotes.value.length, icon: ClipboardList, color: 'bg-sky-50 text-sky-700' },
        { label: 'Open requests', value: quotes.value.filter((quote) => !['DECLINED', 'COMPLETED'].includes(quote.status)).length, icon: CalendarDays, color: 'bg-amber-50 text-amber-700' },
        { label: 'Appointments', value: appointments.value.length, icon: Sparkles, color: 'bg-emerald-50 text-emerald-700' },
      ],
)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    if (isAdmin.value) {
      const [quoteResponse, messageResponse, serviceResponse] = await Promise.all([
        api.get<QuoteRequest[]>('/admin/quote-requests'),
        api.get<ContactMessage[]>('/admin/contact-messages'),
        api.get<CleaningService[]>('/admin/services'),
      ])
      quotes.value = quoteResponse.data
      messages.value = messageResponse.data
      services.value = serviceResponse.data
    } else {
      const [quoteResponse, appointmentResponse] = await Promise.all([
        api.get<QuoteRequest[]>('/quote-requests/me'),
        api.get<AppointmentRecord[]>('/appointments/me'),
      ])
      quotes.value = quoteResponse.data
      appointments.value = appointmentResponse.data
    }
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'Dashboard information could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ isAdmin ? 'Business overview' : 'Your Miracle Shine account' }}</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {{ isQuoteList ? 'Your quote requests' : `Welcome, ${currentUser?.firstName}` }}
      </h1>
      <p class="mt-2 text-slate-600">
        {{ isAdmin ? 'A live snapshot of activity from your service records.' : 'Follow your cleaning requests and appointments in one place.' }}
      </p>
    </header>

    <p v-if="loadError" class="rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ loadError }}</p>
    <p v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading your latest information…</p>

    <template v-else>
      <div v-if="!isQuoteList" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="metric in metrics" :key="metric.label" class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-600">{{ metric.label }}</span>
            <span class="flex h-10 w-10 items-center justify-center rounded-2xl" :class="metric.color"><component :is="metric.icon" class="h-5 w-5" /></span>
          </div>
          <p class="mt-4 text-3xl font-semibold text-slate-900">{{ metric.value }}</p>
        </article>
      </div>

      <section class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">{{ isAdmin ? 'Recent quote requests' : 'Quote request history' }}</h2>
            <p class="mt-1 text-sm text-slate-500">{{ isAdmin ? 'Latest submissions across all customers.' : 'Your requests and their latest status.' }}</p>
          </div>
          <RouterLink v-if="isAdmin" to="/admin/quotes" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Manage requests <ArrowRight class="h-4 w-4" /></RouterLink>
          <RouterLink v-else-if="!isQuoteList" to="/account/quotes" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">View all <ArrowRight class="h-4 w-4" /></RouterLink>
        </div>
        <div v-if="quotes.length" class="mt-5 divide-y divide-slate-100">
          <RouterLink
            v-for="quote in (isAdmin ? quotes.slice(0, 5) : quotes)"
            :key="quote.id"
            :to="isAdmin ? `/admin/quotes/${quote.id}` : `/account/quotes/${quote.id}`"
            class="flex flex-col gap-2 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-2"
          >
            <div>
              <p class="font-semibold text-slate-900">{{ isAdmin ? `${quote.customerFirstName} ${quote.customerLastName}` : quote.service.name }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ isAdmin ? quote.service.name : formatDate(quote.createdAt) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">{{ quote.status }}</span>
              <span v-if="isAdmin" class="text-sm text-slate-500">{{ formatDate(quote.createdAt) }}</span>
              <ArrowRight class="h-4 w-4 text-slate-400" />
            </div>
          </RouterLink>
        </div>
        <p v-else class="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
          {{ isAdmin ? 'No quote requests have been submitted yet.' : 'You have not submitted any quote requests yet.' }}
          <RouterLink v-if="!isAdmin" to="/get-quote" class="ml-1 font-semibold text-primary hover:underline">Request a quote</RouterLink>
        </p>
      </section>

      <section v-if="!isAdmin && appointments.length" class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Upcoming appointments</h2>
          <RouterLink to="/account/appointments" class="text-sm font-semibold text-primary hover:underline">View all</RouterLink>
        </div>
        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div v-for="appointment in appointments.slice(0, 2)" :key="appointment.id" class="rounded-2xl bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">{{ appointment.quoteRequest.service.name }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ formatDate(appointment.scheduledDate) }} · {{ appointment.status }}</p>
          </div>
        </div>
      </section>

      <section v-if="isAdmin" class="grid gap-4 md:grid-cols-2">
        <RouterLink to="/admin/messages" class="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-primary">
          <h2 class="font-semibold text-slate-900">Contact messages</h2>
          <p class="mt-2 text-sm text-slate-600">{{ messages.length }} messages · {{ messages.filter((message) => message.status === 'NEW').length }} new</p>
        </RouterLink>
        <RouterLink to="/admin/services" class="rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-primary">
          <h2 class="font-semibold text-slate-900">Service catalog</h2>
          <p class="mt-2 text-sm text-slate-600">{{ services.filter((service) => service.isActive).length }} active services on the public website</p>
        </RouterLink>
      </section>
    </template>
  </div>
</template>
