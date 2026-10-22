<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { CalendarDays, CircleCheck, LogOut, Star, UserRound } from 'lucide-vue-next'
import {
  cancelAppointment,
  cancelQuote,
  createAppointment,
  createReview,
  fetchCurrentUser,
  fetchMyAppointments,
  fetchMyQuotes,
  getApiErrorMessage,
  login,
  register,
  type Appointment,
  type QuoteRequest,
} from '@/services/backend'
import { clearSession, currentUser, hasSession, saveSession } from '@/services/session'

const mode = ref<'login' | 'register'>('login')
const authForm = reactive({ firstName: '', lastName: '', email: '', password: '', phone: '' })
const authError = ref('')
const authLoading = ref(false)
const pageLoading = ref(false)
const pageError = ref('')
const quotes = ref<QuoteRequest[]>([])
const appointments = ref<Appointment[]>([])
const actionError = ref('')
const actionMessage = ref('')
const selectedQuote = ref<QuoteRequest | null>(null)
const appointmentForm = reactive({ scheduledDate: '', startTime: '', endTime: '', notes: '' })
const appointmentLoading = ref(false)
const reviewTarget = ref<Appointment | null>(null)
const reviewForm = reactive({ rating: 5, comment: '' })
const reviewLoading = ref(false)
const reviewedAppointmentIds = ref(new Set<string>())

const isRegistering = computed(() => mode.value === 'register')
const requestableQuotes = computed(() =>
  quotes.value.filter(
    (quote) =>
      quote.status === 'ACCEPTED' &&
      !appointments.value.some((appointment) => appointment.quoteRequestId === quote.id),
  ),
)
const reviewableAppointments = computed(() =>
  appointments.value.filter(
    (appointment) =>
      appointment.status === 'COMPLETED' &&
      !reviewedAppointmentIds.value.has(appointment.id),
  ),
)

onMounted(async () => {
  if (!hasSession.value) return
  pageLoading.value = true
  try {
    currentUser.value = await fetchCurrentUser()
    await refreshDashboard()
  } catch (error) {
    clearSession()
    pageError.value = getApiErrorMessage(error, 'Your session could not be restored. Please sign in again.')
  } finally {
    pageLoading.value = false
  }
})

async function submitAuth() {
  authError.value = ''
  authLoading.value = true
  try {
    const result = isRegistering.value
      ? await register({
          firstName: authForm.firstName.trim(),
          lastName: authForm.lastName.trim(),
          email: authForm.email.trim(),
          password: authForm.password,
          phone: authForm.phone.trim() || undefined,
        })
      : await login({ email: authForm.email.trim(), password: authForm.password })
    saveSession(result.token, result.user)
    pageError.value = ''
    await refreshDashboard()
  } catch (error) {
    authError.value = getApiErrorMessage(error, 'We could not sign you in. Please try again.')
  } finally {
    authLoading.value = false
  }
}

async function refreshDashboard() {
  pageLoading.value = true
  actionError.value = ''
  try {
    const [nextQuotes, nextAppointments] = await Promise.all([
      fetchMyQuotes(),
      fetchMyAppointments(),
    ])
    quotes.value = nextQuotes
    appointments.value = nextAppointments
    pageError.value = ''
  } catch (error) {
    pageError.value = getApiErrorMessage(error, 'Your account information could not be loaded.')
  } finally {
    pageLoading.value = false
  }
}

async function handleCancelQuote(quote: QuoteRequest) {
  actionError.value = ''
  actionMessage.value = ''
  try {
    await cancelQuote(quote.id)
    actionMessage.value = 'Quote request cancelled.'
    await refreshDashboard()
  } catch (error) {
    actionError.value = getApiErrorMessage(error, 'This quote request could not be cancelled.')
  }
}

async function handleCancelAppointment(appointment: Appointment) {
  actionError.value = ''
  actionMessage.value = ''
  try {
    await cancelAppointment(appointment.id)
    actionMessage.value = 'Appointment cancelled.'
    await refreshDashboard()
  } catch (error) {
    actionError.value = getApiErrorMessage(error, 'This appointment could not be cancelled.')
  }
}

function openAppointmentForm(quote: QuoteRequest) {
  selectedQuote.value = quote
  actionError.value = ''
  Object.assign(appointmentForm, {
    scheduledDate: '',
    startTime: '',
    endTime: '',
    notes: '',
  })
}

async function submitAppointment() {
  if (!selectedQuote.value) return
  actionError.value = ''
  appointmentLoading.value = true
  try {
    await createAppointment({
      quoteRequestId: selectedQuote.value.id,
      ...appointmentForm,
      notes: appointmentForm.notes.trim() || undefined,
    })
    selectedQuote.value = null
    actionMessage.value = 'Appointment request sent.'
    await refreshDashboard()
  } catch (error) {
    actionError.value = getApiErrorMessage(error, 'Your appointment request could not be submitted.')
  } finally {
    appointmentLoading.value = false
  }
}

function openReviewForm(appointment: Appointment) {
  reviewTarget.value = appointment
  reviewForm.rating = 5
  reviewForm.comment = ''
  actionError.value = ''
}

async function submitReview() {
  if (!reviewTarget.value) return
  actionError.value = ''
  reviewLoading.value = true
  try {
    await createReview({
      appointmentId: reviewTarget.value.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim() || undefined,
    })
    reviewedAppointmentIds.value.add(reviewTarget.value.id)
    reviewTarget.value = null
    actionMessage.value = 'Thank you. Your review was submitted for approval.'
  } catch (error) {
    actionError.value = getApiErrorMessage(error, 'Your review could not be submitted.')
  } finally {
    reviewLoading.value = false
  }
}

function signOut() {
  clearSession()
  quotes.value = []
  appointments.value = []
  selectedQuote.value = null
  reviewTarget.value = null
  actionMessage.value = ''
  pageError.value = ''
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function formatTime(value: string) {
  const time = value.match(/T(\d{2}):(\d{2})/)
  if (!time) return value
  return new Date(`1970-01-01T${time[1]}:${time[2]}:00`).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
    <div v-if="pageLoading" class="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-600" role="status">
      Loading your account…
    </div>

    <div v-else-if="!hasSession" class="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10">
      <div class="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary">
        <UserRound class="h-7 w-7" />
      </div>
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Customer account</p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {{ isRegistering ? 'Create your account' : 'Welcome back' }}
      </h1>
      <p class="mt-3 text-slate-600">
        Sign in to view quote requests and appointments, or create an account to get started.
      </p>
      <div class="mt-6 flex gap-2 rounded-full bg-slate-100 p-1">
        <button type="button" class="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition" :class="!isRegistering ? 'bg-white text-primary shadow-sm' : 'text-slate-600'" @click="mode = 'login'; authError = ''">Sign in</button>
        <button type="button" class="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition" :class="isRegistering ? 'bg-white text-primary shadow-sm' : 'text-slate-600'" @click="mode = 'register'; authError = ''">Create account</button>
      </div>
      <form class="mt-6 space-y-4" @submit.prevent="submitAuth">
        <p v-if="authError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ authError }}</p>
        <div v-if="isRegistering" class="grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-medium text-slate-700" for="account-first-name">
            First name
            <input id="account-first-name" v-model="authForm.firstName" required autocomplete="given-name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
          </label>
          <label class="block text-sm font-medium text-slate-700" for="account-last-name">
            Last name
            <input id="account-last-name" v-model="authForm.lastName" required autocomplete="family-name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
          </label>
          <label class="block text-sm font-medium text-slate-700 sm:col-span-2" for="account-phone">
            Phone (optional)
            <input id="account-phone" v-model="authForm.phone" type="tel" autocomplete="tel" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
          </label>
        </div>
        <label class="block text-sm font-medium text-slate-700" for="account-email">
          Email
          <input id="account-email" v-model="authForm.email" required type="email" autocomplete="email" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
        </label>
        <label class="block text-sm font-medium text-slate-700" for="account-password">
          Password
          <input id="account-password" v-model="authForm.password" required :minlength="isRegistering ? 8 : undefined" type="password" :autocomplete="isRegistering ? 'new-password' : 'current-password'" class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
        </label>
        <button type="submit" :disabled="authLoading" class="w-full rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
          {{ authLoading ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in' }}
        </button>
      </form>
    </div>

    <div v-else>
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Customer account</p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Welcome{{ currentUser ? `, ${currentUser.firstName}` : '' }}
          </h1>
          <p class="mt-2 text-slate-600">Your quote requests and cleaning appointments, together in one place.</p>
        </div>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary" @click="signOut">
          <LogOut class="h-4 w-4" />
          Sign out
        </button>
      </div>

      <p v-if="pageError" class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
        {{ pageError }}
        <button type="button" class="ml-2 font-semibold underline" @click="refreshDashboard">Try again</button>
      </p>
      <div v-if="actionError" class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ actionError }}</div>
      <div v-if="actionMessage" class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{{ actionMessage }}</div>

      <div class="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-semibold text-slate-900">Quote requests</h2>
            <RouterLink to="/get-quote" class="text-sm font-semibold text-primary hover:text-primary-dark">Request a quote</RouterLink>
          </div>
          <div v-if="quotes.length === 0" class="mt-5 rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-7 text-slate-600">
            <p class="font-medium text-slate-800">No quote requests yet.</p>
            <p class="mt-2 text-sm">Your submitted quotes will appear here.</p>
          </div>
          <div v-else class="mt-5 space-y-4">
            <article v-for="quote in quotes" :key="quote.id" class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-900">{{ quote.service.name }}</h3>
                  <p class="mt-1 text-sm text-slate-500">{{ quote.streetAddress }}, {{ quote.city }}, {{ quote.state }}</p>
                </div>
                <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary">{{ quote.status }}</span>
              </div>
              <p v-if="quote.preferredDate" class="mt-3 text-sm text-slate-600">Preferred date: {{ formatDate(quote.preferredDate) }}</p>
              <button v-if="!['DECLINED', 'COMPLETED'].includes(quote.status)" type="button" class="mt-4 text-sm font-semibold text-red-600 hover:text-red-700" @click="handleCancelQuote(quote)">
                Cancel quote request
              </button>
              <button v-if="requestableQuotes.some((item) => item.id === quote.id)" type="button" class="ml-4 text-sm font-semibold text-primary hover:text-primary-dark" @click="openAppointmentForm(quote)">
                Request appointment
              </button>
            </article>
          </div>

          <form v-if="selectedQuote" class="mt-4 space-y-4 rounded-[1.75rem] border border-sky-200 bg-sky-50 p-6" @submit.prevent="submitAppointment">
            <h3 class="font-semibold text-slate-900">Request an appointment</h3>
            <p class="text-sm text-slate-600">{{ selectedQuote.service.name }} · {{ selectedQuote.streetAddress }}</p>
            <div class="grid gap-4 sm:grid-cols-3">
              <label class="block text-sm font-medium text-slate-700" for="appointment-date">
                Date
                <input id="appointment-date" v-model="appointmentForm.scheduledDate" required type="date" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-primary" />
              </label>
              <label class="block text-sm font-medium text-slate-700" for="appointment-start">
                Start
                <input id="appointment-start" v-model="appointmentForm.startTime" required type="time" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-primary" />
              </label>
              <label class="block text-sm font-medium text-slate-700" for="appointment-end">
                End
                <input id="appointment-end" v-model="appointmentForm.endTime" required type="time" class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-primary" />
              </label>
            </div>
            <label class="block text-sm font-medium text-slate-700" for="appointment-notes">
              Notes (optional)
              <textarea id="appointment-notes" v-model="appointmentForm.notes" class="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary" />
            </label>
            <div class="flex gap-3">
              <button type="submit" :disabled="appointmentLoading" class="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{{ appointmentLoading ? 'Sending…' : 'Send request' }}</button>
              <button type="button" class="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700" @click="selectedQuote = null">Not now</button>
            </div>
          </form>
        </section>

        <section>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-2xl font-semibold text-slate-900">Appointments</h2>
            <CalendarDays class="h-5 w-5 text-primary" />
          </div>
          <div v-if="appointments.length === 0" class="mt-5 rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-7 text-slate-600">
            <p class="font-medium text-slate-800">No appointments yet.</p>
            <p class="mt-2 text-sm">Appointments linked to accepted quotes will appear here.</p>
          </div>
          <div v-else class="mt-5 space-y-4">
            <article v-for="appointment in appointments" :key="appointment.id" class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold text-slate-900">{{ appointment.quoteRequest.service.name }}</h3>
                  <p class="mt-1 text-sm text-slate-500">{{ formatDate(appointment.scheduledDate) }} · {{ formatTime(appointment.startTime) }}–{{ formatTime(appointment.endTime) }}</p>
                </div>
                <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-primary">{{ appointment.status }}</span>
              </div>
              <button v-if="!['CANCELLED', 'COMPLETED'].includes(appointment.status)" type="button" class="mt-4 text-sm font-semibold text-red-600 hover:text-red-700" @click="handleCancelAppointment(appointment)">
                Cancel appointment
              </button>
              <button v-if="reviewableAppointments.some((item) => item.id === appointment.id)" type="button" class="ml-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark" @click="openReviewForm(appointment)">
                <Star class="h-4 w-4" />
                Leave a review
              </button>
            </article>
          </div>

          <form v-if="reviewTarget" class="mt-4 space-y-4 rounded-[1.75rem] border border-sky-200 bg-sky-50 p-6" @submit.prevent="submitReview">
            <h3 class="font-semibold text-slate-900">Review your appointment</h3>
            <label class="block text-sm font-medium text-slate-700" for="review-rating">
              Rating
              <select id="review-rating" v-model.number="reviewForm.rating" required class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary">
                <option :value="5">5 — Excellent</option>
                <option :value="4">4 — Great</option>
                <option :value="3">3 — Good</option>
                <option :value="2">2 — Fair</option>
                <option :value="1">1 — Poor</option>
              </select>
            </label>
            <label class="block text-sm font-medium text-slate-700" for="review-comment">
              Comment (optional)
              <textarea id="review-comment" v-model="reviewForm.comment" class="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary" />
            </label>
            <div class="flex gap-3">
              <button type="submit" :disabled="reviewLoading" class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                <CircleCheck class="h-4 w-4" />
                {{ reviewLoading ? 'Submitting…' : 'Submit review' }}
              </button>
              <button type="button" class="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700" @click="reviewTarget = null">Not now</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </section>
</template>
