<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CalendarDays, Star } from 'lucide-vue-next'
import api from '@/services/api'
import { currentUser } from '@/services/auth'
import type { AppointmentRecord, AppointmentStatus } from '@/services/portal'
import { getApiErrorMessage } from '@/services/errors'

const isAdmin = currentUser.value?.role === 'ADMIN'
const appointments = ref<AppointmentRecord[]>([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const reviewDrafts = ref<Record<string, { rating: string; comment: string }>>({})
const reviewSubmitted = ref<string[]>([])
const appointmentTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  REQUESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
}

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const path = isAdmin ? '/admin/appointments' : '/appointments/me'
    const { data } = await api.get<AppointmentRecord[]>(path)
    appointments.value = data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Appointments could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function updateStatus(appointment: AppointmentRecord, status: AppointmentStatus) {
  if (!appointmentTransitions[appointment.status].includes(status)) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await api.patch<AppointmentRecord>(`/admin/appointments/${appointment.id}/status`, { status })
    appointment.status = data.status
    successMessage.value = 'Appointment status updated.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Appointment status could not be updated.')
  }
}

async function cancelAppointment(appointment: AppointmentRecord) {
  if (!window.confirm('Cancel this appointment?')) return
  errorMessage.value = ''
  try {
    const { data } = await api.post<AppointmentRecord>(`/appointments/${appointment.id}/cancel`)
    appointment.status = data.status
    successMessage.value = 'Appointment cancelled.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Appointment could not be cancelled.')
  }
}

async function submitReview(appointment: AppointmentRecord) {
  const draft = reviewDrafts.value[appointment.id]
  if (!draft || !draft.rating) {
    errorMessage.value = 'Select a rating before submitting your review.'
    return
  }
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await api.post('/reviews', {
      appointmentId: appointment.id,
      rating: Number(draft.rating),
      ...(draft.comment.trim() ? { comment: draft.comment.trim() } : {}),
    })
    reviewSubmitted.value = [...reviewSubmitted.value, appointment.id]
    successMessage.value = 'Review submitted for administrator approval.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Review could not be submitted.')
  }
}

function formatDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value)
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function formatTime(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(parsed)
}

function getReviewDraft(appointmentId: string) {
  return (reviewDrafts.value[appointmentId] ??= { rating: '', comment: '' })
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{{ isAdmin ? 'Scheduling' : 'Your schedule' }}</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Appointments</h1>
      <p class="mt-2 text-slate-600">{{ isAdmin ? 'Review upcoming appointments and update their supported status.' : 'View appointment requests connected to your quotes.' }}</p>
    </header>
    <p v-if="errorMessage" class="rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{{ successMessage }}</p>
    <p v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading appointments…</p>
    <div v-else-if="appointments.length" class="space-y-4">
      <article v-for="appointment in appointments" :key="appointment.id" class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex gap-4">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-primary"><CalendarDays class="h-6 w-6" /></span>
            <div>
              <h2 class="font-semibold text-slate-900">{{ appointment.quoteRequest.service.name }}</h2>
              <p class="mt-1 text-sm text-slate-600">{{ formatDate(appointment.scheduledDate) }} · {{ formatTime(appointment.startTime) }}–{{ formatTime(appointment.endTime) }}</p>
              <p class="mt-1 text-sm text-slate-500">
                {{ isAdmin ? `${appointment.quoteRequest.customerFirstName} ${appointment.quoteRequest.customerLastName} · ${appointment.quoteRequest.customerEmail}` : `${appointment.quoteRequest.streetAddress}, ${appointment.quoteRequest.city}` }}
              </p>
              <RouterLink :to="isAdmin ? `/admin/quotes/${appointment.quoteRequestId}` : `/account/quotes/${appointment.quoteRequestId}`" class="mt-2 inline-block text-sm font-semibold text-primary hover:underline">View quote request</RouterLink>
            </div>
          </div>
          <span class="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800">{{ appointment.status }}</span>
        </div>
        <p v-if="appointment.notes" class="mt-4 whitespace-pre-wrap text-sm text-slate-600">{{ appointment.notes }}</p>
        <div v-if="isAdmin && appointmentTransitions[appointment.status].length" class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button v-for="status in appointmentTransitions[appointment.status]" :key="status" type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary" @click="updateStatus(appointment, status)">
            Mark {{ status.toLowerCase() }}
          </button>
        </div>
        <div v-else-if="!isAdmin && !['CANCELLED', 'COMPLETED'].includes(appointment.status)" class="mt-4 border-t border-slate-100 pt-4">
          <button type="button" class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="cancelAppointment(appointment)">Cancel appointment</button>
        </div>
        <form v-if="!isAdmin && appointment.status === 'COMPLETED' && !reviewSubmitted.includes(appointment.id)" class="mt-4 space-y-3 border-t border-slate-100 pt-4" @submit.prevent="submitReview(appointment)">
          <h3 class="flex items-center gap-2 font-semibold text-slate-900"><Star class="h-4 w-4 text-amber-500" /> Leave a review</h3>
          <div class="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <label class="text-sm font-medium text-slate-700">Rating
              <select v-model="getReviewDraft(appointment.id).rating" required class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5">
                <option value="" disabled>Choose</option><option v-for="rating in [5, 4, 3, 2, 1]" :key="rating" :value="String(rating)">{{ rating }} / 5</option>
              </select>
            </label>
            <label class="text-sm font-medium text-slate-700">Comment <span class="font-normal text-slate-500">(optional)</span>
              <textarea v-model="getReviewDraft(appointment.id).comment" maxlength="5000" rows="2" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
            </label>
          </div>
          <button type="submit" class="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white">Submit for review</button>
        </form>
        <p v-if="reviewSubmitted.includes(appointment.id)" class="mt-4 text-sm text-emerald-700">Your review is awaiting approval.</p>
      </article>
    </div>
    <p v-else class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">No appointments to display.</p>
  </div>
</template>
