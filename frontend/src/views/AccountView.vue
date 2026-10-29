<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { CalendarDays, CircleX, MessageSquareQuote, PlusCircle, ShieldCheck, User } from 'lucide-vue-next'
import api from '@/services/api'
import { signOut, type AuthUser, getStoredUser } from '@/services/auth'

const router = useRouter()
const user = ref<AuthUser | null>(getStoredUser())
const quotes = ref<any[]>([])
const appointments = ref<any[]>([])
const loading = ref(true)
const loadError = ref('')
const reviewDrafts = reactive<Record<string, { rating: number; comment: string }>>({})
const workingReviewIds = ref<string[]>([])
const cancellingQuoteIds = ref<string[]>([])
const cancellingAppointmentIds = ref<string[]>([])

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not specified'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not specified'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

function formatTime(value: string | null | undefined): string {
  if (!value) return 'Not specified'
  const date = new Date(`1970-01-01T${value}.000Z`)
  if (Number.isNaN(date.getTime())) return 'Not specified'
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(date)
}

async function loadAccountData() {
  if (!user.value) {
    await router.push('/login')
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const [profileResponse, quotesResponse, appointmentsResponse] = await Promise.all([
      api.get('/users/me'),
      api.get('/quote-requests/me'),
      api.get('/appointments/me'),
    ])

    user.value = profileResponse.data
    quotes.value = quotesResponse.data
    appointments.value = appointmentsResponse.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      signOut()
      await router.push('/login')
      return
    }

    loadError.value = 'We could not load your account details. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  signOut()
  await router.push('/')
}

async function cancelQuote(id: string) {
  cancellingQuoteIds.value.push(id)
  try {
    await api.post(`/quote-requests/${id}/cancel`)
    await loadAccountData()
  } catch (error) {
    loadError.value = 'Could not cancel this quote request.'
  } finally {
    cancellingQuoteIds.value = cancellingQuoteIds.value.filter((item) => item !== id)
  }
}

async function cancelAppointment(id: string) {
  cancellingAppointmentIds.value.push(id)
  try {
    await api.post(`/appointments/${id}/cancel`)
    await loadAccountData()
  } catch (error) {
    loadError.value = 'Could not cancel this appointment.'
  } finally {
    cancellingAppointmentIds.value = cancellingAppointmentIds.value.filter((item) => item !== id)
  }
}

function reviewFor(appointmentId: string) {
  if (!reviewDrafts[appointmentId]) {
    reviewDrafts[appointmentId] = { rating: 5, comment: '' }
  }
  return reviewDrafts[appointmentId]
}

async function submitReview(appointmentId: string) {
  const draft = reviewDrafts[appointmentId]
  if (!draft) return

  workingReviewIds.value.push(appointmentId)
  try {
    await api.post('/reviews', {
      appointmentId,
      rating: Number(draft.rating),
      comment: draft.comment.trim() || undefined,
    })
    delete reviewDrafts[appointmentId]
    await loadAccountData()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message
      loadError.value = Array.isArray(message)
        ? message.join(' ')
        : typeof message === 'string'
          ? message
          : 'Your review could not be submitted.'
    } else {
      loadError.value = 'Your review could not be submitted.'
    }
  } finally {
    workingReviewIds.value = workingReviewIds.value.filter((id) => id !== appointmentId)
  }
}

onMounted(() => {
  void loadAccountData()
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
    <div v-if="loading" class="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-600">
      Loading your account…
    </div>

    <div v-else class="space-y-8">
      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary">
              <User class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Customer profile</p>
              <h1 class="mt-2 text-3xl font-semibold text-slate-900">
                {{ user?.firstName }} {{ user?.lastName }}
              </h1>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>

        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Email</p>
            <p class="mt-2 text-base font-medium text-slate-900">{{ user?.email }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Phone</p>
            <p class="mt-2 text-base font-medium text-slate-900">{{ user?.phone || 'Not provided' }}</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Account role</p>
            <div class="mt-2 flex items-center gap-2 text-base font-medium text-slate-900">
              <ShieldCheck class="h-4 w-4 text-primary" />
              {{ user?.role }}
            </div>
          </div>
        </div>
      </section>

      <p v-if="loadError" class="text-sm text-red-600" role="alert">{{ loadError }}</p>

      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="mb-5 flex items-center gap-3">
          <MessageSquareQuote class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold text-slate-900">Quote requests</h2>
        </div>

        <div v-if="quotes.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
          No quote requests yet. Submit a new quote to get started.
        </div>

        <div v-else class="space-y-4">
          <article v-for="quote in quotes" :key="quote.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{{ quote.service?.name || 'Service' }}</p>
                <h3 class="mt-2 text-lg font-semibold text-slate-900">
                  {{ quote.customerFirstName }} {{ quote.customerLastName }}
                </h3>
                <p class="mt-1 text-sm text-slate-600">{{ quote.city }}, {{ quote.state }}</p>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {{ quote.status }}
                </span>
                <button
                  v-if="quote.status !== 'DECLINED' && quote.status !== 'COMPLETED'"
                  type="button"
                  :disabled="cancellingQuoteIds.includes(quote.id)"
                  class="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  @click="cancelQuote(quote.id)"
                >
                  {{ cancellingQuoteIds.includes(quote.id) ? 'Cancelling…' : 'Cancel' }}
                </button>
              </div>
            </div>

            <div class="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <div><span class="font-medium text-slate-500">Created:</span> {{ formatDate(quote.createdAt) }}</div>
              <div><span class="font-medium text-slate-500">Property:</span> {{ quote.propertyType }}</div>
              <div><span class="font-medium text-slate-500">Preferred date:</span> {{ formatDate(quote.preferredDate) }}</div>
            </div>
          </article>
        </div>
      </section>

      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="mb-5 flex items-center gap-3">
          <CalendarDays class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold text-slate-900">Appointments</h2>
        </div>

        <div v-if="appointments.length === 0" class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
          No appointments scheduled yet.
        </div>

        <div v-else class="space-y-4">
          <article v-for="appointment in appointments" :key="appointment.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{{ appointment.quoteRequest?.service?.name || 'Service' }}</p>
                <h3 class="mt-2 text-lg font-semibold text-slate-900">
                  {{ formatDate(appointment.scheduledDate) }} · {{ formatTime(appointment.startTime) }}–{{ formatTime(appointment.endTime) }}
                </h3>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {{ appointment.status }}
                </span>
                <button
                  v-if="appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'"
                  type="button"
                  :disabled="cancellingAppointmentIds.includes(appointment.id)"
                  class="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  @click="cancelAppointment(appointment.id)"
                >
                  {{ cancellingAppointmentIds.includes(appointment.id) ? 'Cancelling…' : 'Cancel' }}
                </button>
              </div>
            </div>

            <div v-if="appointment.status === 'COMPLETED'" class="mt-5 border-t border-slate-200 pt-4">
              <div v-if="!reviewDrafts[appointment.id] && !workingReviewIds.includes(appointment.id)" class="flex items-center justify-between gap-4">
                <p class="text-sm text-slate-600">Share feedback for this completed appointment.</p>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
                  @click="reviewFor(appointment.id)"
                >
                  <PlusCircle class="h-4 w-4" />
                  Leave a review
                </button>
              </div>

              <div v-else class="rounded-2xl border border-slate-200 bg-white p-4">
                <label class="block text-sm font-medium text-slate-700" :for="`rating-${appointment.id}`">Rating</label>
                <select
                  :id="`rating-${appointment.id}`"
                  v-model="reviewFor(appointment.id).rating"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                >
                  <option :value="5">5 - Excellent</option>
                  <option :value="4">4 - Great</option>
                  <option :value="3">3 - Good</option>
                  <option :value="2">2 - Fair</option>
                  <option :value="1">1 - Poor</option>
                </select>

                <label class="mt-4 block text-sm font-medium text-slate-700" :for="`review-comment-${appointment.id}`">Comment</label>
                <textarea
                  :id="`review-comment-${appointment.id}`"
                  v-model="reviewFor(appointment.id).comment"
                  rows="3"
                  class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary"
                  placeholder="Tell us about your experience"
                />

                <div class="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                    @click="delete reviewDrafts[appointment.id]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    :disabled="workingReviewIds.includes(appointment.id)"
                    class="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60"
                    @click="submitReview(appointment.id)"
                  >
                    {{ workingReviewIds.includes(appointment.id) ? 'Submitting…' : 'Submit review' }}
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div v-if="!user" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Sign in to manage your account.
      </div>
    </div>
  </div>
</template>
