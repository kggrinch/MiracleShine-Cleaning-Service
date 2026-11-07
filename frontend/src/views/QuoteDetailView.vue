<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, CalendarPlus, Mail, Phone } from 'lucide-vue-next'
import api from '@/services/api'
import { currentUser } from '@/services/auth'
import { getApiErrorMessage } from '@/services/errors'
import { quoteTransitions, type Appointment, type QuoteRequest, type QuoteStatus } from '@/services/portal'

const route = useRoute()
const isAdmin = currentUser.value?.role === 'ADMIN'
const quote = ref<QuoteRequest | null>(null)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const scheduleOpen = ref(false)
const schedule = reactive({ scheduledDate: '', startTime: '', endTime: '', notes: '' })
const minDate = new Date().toISOString().slice(0, 10)

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const endpoint = isAdmin ? `/admin/quote-requests/${route.params.id}` : `/quote-requests/${route.params.id}`
    const { data } = await api.get<QuoteRequest>(endpoint)
    quote.value = data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Quote details could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function updateStatus(status: QuoteStatus) {
  if (!quote.value || !quoteTransitions[quote.value.status].includes(status)) return
  errorMessage.value = ''
  successMessage.value = ''
  saving.value = true
  try {
    const { data } = await api.patch<QuoteRequest>(`/admin/quote-requests/${quote.value.id}/status`, { status })
    quote.value = { ...quote.value, ...data }
    successMessage.value = 'Quote status updated.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Quote status could not be updated.')
  } finally {
    saving.value = false
  }
}

async function cancelQuote() {
  if (!quote.value || !window.confirm('Cancel this quote request? Its status will become declined.')) return
  errorMessage.value = ''
  saving.value = true
  try {
    const { data } = await api.post<QuoteRequest>(`/quote-requests/${quote.value.id}/cancel`)
    quote.value = { ...quote.value, ...data }
    successMessage.value = 'Quote request cancelled.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Quote request could not be cancelled.')
  } finally {
    saving.value = false
  }
}

async function createAppointment() {
  if (!quote.value || saving.value) return
  errorMessage.value = ''
  successMessage.value = ''
  if (!schedule.scheduledDate || !schedule.startTime || !schedule.endTime || schedule.endTime <= schedule.startTime) {
    errorMessage.value = 'Choose a date and a valid time range.'
    return
  }
  saving.value = true
  try {
    const { data } = await api.post<Appointment>('/appointments', {
      quoteRequestId: quote.value.id,
      scheduledDate: schedule.scheduledDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      ...(schedule.notes.trim() ? { notes: schedule.notes.trim() } : {}),
    })
    quote.value.appointment = data
    scheduleOpen.value = false
    successMessage.value = 'Appointment request submitted.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Appointment could not be requested.')
  } finally {
    saving.value = false
  }
}

function formatDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value)
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function formatTime(value: string | null) {
  if (!value) return 'Not specified'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(date)
}
</script>

<template>
  <div class="space-y-6">
    <RouterLink :to="isAdmin ? '/admin/quotes' : '/account/quotes'" class="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
      <ArrowLeft class="h-4 w-4" /> Back to quote requests
    </RouterLink>
    <p v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading quote details…</p>
    <p v-if="errorMessage" class="rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{{ successMessage }}</p>

    <template v-if="quote && !loading">
      <header class="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Quote request</p>
          <h1 class="mt-2 text-3xl font-semibold text-slate-900">{{ quote.service.name }}</h1>
          <p class="mt-2 text-sm text-slate-500">Submitted {{ formatDate(quote.createdAt) }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800">{{ quote.status }}</span>
          <label v-if="isAdmin && quoteTransitions[quote.status].length" class="text-xs font-medium text-slate-500">
            Change status
            <select :value="quote.status" class="ml-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700" :disabled="saving" @change="updateStatus(($event.target as HTMLSelectElement).value as QuoteStatus)">
              <option :value="quote.status">{{ quote.status }}</option>
              <option v-for="status in quoteTransitions[quote.status]" :key="status" :value="status">{{ status }}</option>
            </select>
          </label>
          <button v-else-if="!isAdmin && !['DECLINED', 'COMPLETED'].includes(quote.status)" type="button" class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" :disabled="saving" @click="cancelQuote">
            Cancel request
          </button>
        </div>
      </header>

      <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <h2 class="text-lg font-semibold text-slate-900">Request details</h2>
          <dl class="mt-5 grid gap-4 sm:grid-cols-2">
            <div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Customer</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.customerFirstName }} {{ quote.customerLastName }}</dd></div>
            <div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Property</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.propertyType }}</dd></div>
            <div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</dt><dd class="mt-1 break-all font-medium text-slate-800">{{ quote.customerEmail }}</dd></div>
            <div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.customerPhone || 'Not provided' }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.streetAddress }}, {{ quote.city }}, {{ quote.state }} {{ quote.postalCode }}</dd></div>
            <div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Preferred date</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.preferredDate ? formatDate(quote.preferredDate) : 'Not specified' }}</dd></div>
            <div><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Preferred time</dt><dd class="mt-1 font-medium text-slate-800">{{ formatTime(quote.preferredTime) }}</dd></div>
            <div v-if="quote.squareFootage"><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Square footage</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.squareFootage }}</dd></div>
            <div v-if="quote.bedrooms !== null"><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Bedrooms</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.bedrooms }}</dd></div>
            <div v-if="quote.bathrooms !== null"><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Bathrooms</dt><dd class="mt-1 font-medium text-slate-800">{{ quote.bathrooms }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-xs font-semibold uppercase tracking-wider text-slate-400">Notes</dt><dd class="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{{ quote.notes || 'No additional notes.' }}</dd></div>
          </dl>
          <div class="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <a :href="`mailto:${encodeURIComponent(quote.customerEmail)}`" class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white"><Mail class="h-4 w-4" /> Email customer</a>
            <a v-if="quote.customerPhone" :href="`tel:${quote.customerPhone}`" class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"><Phone class="h-4 w-4" /> Call customer</a>
          </div>
        </section>

        <section class="h-fit rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
          <div class="flex items-center justify-between gap-3">
            <div><h2 class="text-lg font-semibold text-slate-900">Appointment</h2><p class="mt-1 text-sm text-slate-500">Scheduling linked to this request.</p></div>
            <CalendarPlus class="h-5 w-5 text-primary" />
          </div>
          <div v-if="quote.appointment" class="mt-5 rounded-2xl bg-slate-50 p-4">
            <p class="font-semibold text-slate-900">{{ formatDate(quote.appointment.scheduledDate) }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ formatTime(quote.appointment.startTime) }} – {{ formatTime(quote.appointment.endTime) }}</p>
            <p class="mt-2 text-sm font-semibold text-primary">{{ quote.appointment.status }}</p>
            <p v-if="quote.appointment.notes" class="mt-2 whitespace-pre-wrap text-sm text-slate-600">{{ quote.appointment.notes }}</p>
          </div>
          <template v-else-if="!isAdmin">
            <p class="mt-5 text-sm leading-6 text-slate-600">Request a preferred appointment time for the team to review.</p>
            <button type="button" class="mt-4 inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-sky-50" @click="scheduleOpen = !scheduleOpen">
              <CalendarPlus class="h-4 w-4" /> Request appointment
            </button>
            <form v-if="scheduleOpen" class="mt-4 space-y-3" @submit.prevent="createAppointment">
              <label class="block text-sm font-medium text-slate-700">Date
                <input v-model="schedule.scheduledDate" type="date" :min="minDate" required class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label class="block text-sm font-medium text-slate-700">Start
                  <input v-model="schedule.startTime" type="time" required class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                </label>
                <label class="block text-sm font-medium text-slate-700">End
                  <input v-model="schedule.endTime" type="time" required class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
                </label>
              </div>
              <label class="block text-sm font-medium text-slate-700">Notes <span class="font-normal text-slate-500">(optional)</span>
                <textarea v-model="schedule.notes" maxlength="5000" rows="3" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
              </label>
              <button type="submit" :disabled="saving" class="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{{ saving ? 'Submitting…' : 'Submit appointment request' }}</button>
            </form>
          </template>
          <p v-else class="mt-5 text-sm text-slate-600">No appointment has been requested yet.</p>
        </section>
      </div>
    </template>
  </div>
</template>
