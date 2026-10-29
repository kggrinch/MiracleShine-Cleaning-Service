<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { BriefcaseBusiness, Building2, CheckCheck, Mail, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-vue-next'
import api from '@/services/api'
import { getStoredUser, signOut, type AuthUser } from '@/services/auth'

const router = useRouter()
const currentUser = ref<AuthUser | null>(getStoredUser())
const loading = ref(true)
const loadError = ref('')
const services = ref<any[]>([])
const quotes = ref<any[]>([])
const appointments = ref<any[]>([])
const contactMessages = ref<any[]>([])
const reviews = ref<any[]>([])
const serviceForm = reactive({
  name: '',
  description: '',
  category: 'RESIDENTIAL',
  startingPrice: '',
  estimatedDurationMinutes: 60,
  imageUrl: '',
  isActive: true,
})

const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')

function statusTone(status: string) {
  const palette: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONTACTED: 'bg-sky-100 text-sky-700',
    QUOTED: 'bg-violet-100 text-violet-700',
    ACCEPTED: 'bg-emerald-100 text-emerald-700',
    DECLINED: 'bg-red-100 text-red-700',
    COMPLETED: 'bg-slate-900 text-white',
    REQUESTED: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NEW: 'bg-sky-100 text-sky-700',
    READ: 'bg-violet-100 text-violet-700',
    RESPONDED: 'bg-emerald-100 text-emerald-700',
    CLOSED: 'bg-slate-900 text-white',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  return palette[status] ?? 'bg-slate-100 text-slate-700'
}

async function loadDashboard() {
  if (!currentUser.value) {
    await router.push('/login')
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const profile = await api.get('/auth/me')
    const nextUser = profile.data as AuthUser
    currentUser.value = nextUser
    if (nextUser.role !== 'ADMIN') {
      await router.push('/account')
      return
    }

    const [servicesResponse, quotesResponse, appointmentsResponse, contactResponse, reviewsResponse] = await Promise.all([
      api.get('/admin/services'),
      api.get('/admin/quote-requests'),
      api.get('/admin/appointments'),
      api.get('/admin/contact-messages'),
      api.get('/admin/reviews'),
    ])

    services.value = servicesResponse.data
    quotes.value = quotesResponse.data
    appointments.value = appointmentsResponse.data
    contactMessages.value = contactResponse.data
    reviews.value = reviewsResponse.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      signOut()
      await router.push('/login')
      return
    }
    loadError.value = 'Could not load the admin dashboard.'
  } finally {
    loading.value = false
  }
}

async function updateQuoteStatus(id: string, status: string) {
  await api.patch(`/admin/quote-requests/${id}/status`, { status })
  await loadDashboard()
}

async function updateAppointmentStatus(id: string, status: string) {
  await api.patch(`/admin/appointments/${id}/status`, { status })
  await loadDashboard()
}

async function updateContactStatus(id: string, status: string) {
  await api.patch(`/admin/contact-messages/${id}/status`, { status })
  await loadDashboard()
}

async function updateReviewStatus(id: string, status: string) {
  await api.patch(`/admin/reviews/${id}/status`, { status })
  await loadDashboard()
}

async function createService() {
  await api.post('/services', {
    name: serviceForm.name,
    description: serviceForm.description,
    category: serviceForm.category,
    startingPrice: serviceForm.startingPrice ? Number(serviceForm.startingPrice) : undefined,
    estimatedDurationMinutes: Number(serviceForm.estimatedDurationMinutes),
    imageUrl: serviceForm.imageUrl || undefined,
    isActive: serviceForm.isActive,
  })

  serviceForm.name = ''
  serviceForm.description = ''
  serviceForm.category = 'RESIDENTIAL'
  serviceForm.startingPrice = ''
  serviceForm.estimatedDurationMinutes = 60
  serviceForm.imageUrl = ''
  serviceForm.isActive = true

  await loadDashboard()
}

async function resetCatalog() {
  await api.post('/admin/services/reset-defaults')
  await loadDashboard()
}

async function handleLogout() {
  signOut()
  await router.push('/')
}

onMounted(() => {
  void loadDashboard()
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
    <div v-if="loading" class="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-600">
      Loading admin dashboard…
    </div>

    <div v-else-if="!isAdmin" class="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700">
      You do not have administrator access to this page.
    </div>

    <div v-else class="space-y-8">
      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary">
              <ShieldCheck class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Administration</p>
              <h1 class="mt-2 text-3xl font-semibold text-slate-900">Operations dashboard</h1>
            </div>
          </div>

          <button
            type="button"
            class="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>
      </section>

      <p v-if="loadError" class="text-sm text-red-600" role="alert">{{ loadError }}</p>

      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="mb-5 flex items-center gap-3">
          <Building2 class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold text-slate-900">Service catalog</h2>
        </div>

        <div class="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-slate-700" for="service-name">Name</label>
            <input id="service-name" v-model="serviceForm.name" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700" for="service-category">Category</label>
            <select id="service-category" v-model="serviceForm.category" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary">
              <option value="RESIDENTIAL">RESIDENTIAL</option>
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="SPECIALTY">SPECIALTY</option>
            </select>
          </div>
          <div class="lg:col-span-2">
            <label class="block text-sm font-medium text-slate-700" for="service-description">Description</label>
            <textarea id="service-description" v-model="serviceForm.description" rows="3" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700" for="service-price">Starting price</label>
            <input id="service-price" v-model="serviceForm.startingPrice" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary" placeholder="120.00" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700" for="service-duration">Duration (minutes)</label>
            <input id="service-duration" v-model.number="serviceForm.estimatedDurationMinutes" type="number" class="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-primary" />
          </div>
          <div class="lg:col-span-2 flex flex-wrap gap-3">
            <button type="button" class="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white" @click="createService">Create service</button>
            <button type="button" class="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" @click="resetCatalog">Reset defaults</button>
          </div>
        </div>

        <div class="space-y-3">
          <div v-for="service in services" :key="service.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-base font-semibold text-slate-900">{{ service.name }}</p>
                <p class="text-sm text-slate-600">{{ service.category }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]" :class="service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                {{ service.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="mb-5 flex items-center gap-3">
          <BriefcaseBusiness class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold text-slate-900">Quote requests</h2>
        </div>

        <div class="space-y-3">
          <div v-for="quote in quotes" :key="quote.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-slate-900">{{ quote.customerFirstName }} {{ quote.customerLastName }}</p>
                <p class="text-sm text-slate-600">{{ quote.customerEmail }} · {{ quote.service?.name }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]" :class="statusTone(quote.status)">{{ quote.status }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button v-for="status in ['PENDING','CONTACTED','QUOTED','ACCEPTED','DECLINED','COMPLETED']" :key="status" type="button" class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary" @click="updateQuoteStatus(quote.id, status)">{{ status }}</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="mb-5 flex items-center gap-3">
          <CheckCheck class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold text-slate-900">Appointments</h2>
        </div>

        <div class="space-y-3">
          <div v-for="appointment in appointments" :key="appointment.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-slate-900">{{ appointment.quoteRequest?.customerFirstName }} {{ appointment.quoteRequest?.customerLastName }}</p>
                <p class="text-sm text-slate-600">{{ appointment.quoteRequest?.service?.name }} · {{ appointment.scheduledDate }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]" :class="statusTone(appointment.status)">{{ appointment.status }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button v-for="status in ['REQUESTED','CONFIRMED','CANCELLED','COMPLETED']" :key="status" type="button" class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary" @click="updateAppointmentStatus(appointment.id, status)">{{ status }}</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="mb-5 flex items-center gap-3">
          <Mail class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold text-slate-900">Contact messages</h2>
        </div>

        <div class="space-y-3">
          <div v-for="message in contactMessages" :key="message.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-slate-900">{{ message.customerName }}</p>
                <p class="text-sm text-slate-600">{{ message.subject }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]" :class="statusTone(message.status)">{{ message.status }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button v-for="status in ['NEW','READ','RESPONDED','CLOSED']" :key="status" type="button" class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary" @click="updateContactStatus(message.id, status)">{{ status }}</button>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.3)] sm:p-8">
        <div class="mb-5 flex items-center gap-3">
          <Sparkles class="h-5 w-5 text-primary" />
          <h2 class="text-2xl font-semibold text-slate-900">Reviews</h2>
        </div>

        <div class="space-y-3">
          <div v-for="review in reviews" :key="review.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-slate-900">{{ review.appointment?.quoteRequest?.customerFirstName }} {{ review.appointment?.quoteRequest?.customerLastName }}</p>
                <p class="text-sm text-slate-600">{{ review.rating }}/5 · {{ review.appointment?.quoteRequest?.service?.name }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]" :class="statusTone(review.status)">{{ review.status }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button v-for="status in ['PENDING','APPROVED','REJECTED']" :key="status" type="button" class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary" @click="updateReviewStatus(review.id, status)">{{ status }}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
