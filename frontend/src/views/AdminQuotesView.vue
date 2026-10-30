<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Search, RefreshCw } from 'lucide-vue-next'
import api from '@/services/api'
import { getApiErrorMessage } from '@/services/errors'
import { quoteStatuses, quoteTransitions, type QuoteRequest, type QuoteStatus } from '@/services/portal'

const quotes = ref<QuoteRequest[]>([])
const selectedStatus = ref('')
const searchEmail = ref('')
const loading = ref(false)
const updatingId = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const filteredStatuses = computed(() => ['', ...quoteStatuses])

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const params: Record<string, string> = {}
    if (selectedStatus.value) params.status = selectedStatus.value
    if (searchEmail.value.trim()) params.email = searchEmail.value.trim()
    const { data } = await api.get<QuoteRequest[]>('/admin/quote-requests', { params })
    quotes.value = data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Quote requests could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(selectedStatus, load)

async function updateStatus(quote: QuoteRequest, status: QuoteStatus) {
  if (!quoteTransitions[quote.status].includes(status)) return
  errorMessage.value = ''
  successMessage.value = ''
  updatingId.value = quote.id
  try {
    const { data } = await api.patch<QuoteRequest>(`/admin/quote-requests/${quote.id}/status`, { status })
    quote.status = data.status
    successMessage.value = 'Quote status updated.'
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Quote status could not be updated.')
  } finally {
    updatingId.value = ''
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Operations</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Quote requests</h1>
      <p class="mt-2 text-slate-600">Review submissions and move each request through the supported workflow.</p>
    </header>

    <section class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
      <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="load">
        <label class="sr-only" for="quote-email-filter">Search by customer email</label>
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="quote-email-filter" v-model="searchEmail" type="email" placeholder="Search customer email" class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-primary" />
        </div>
        <label class="sr-only" for="quote-status-filter">Filter by status</label>
        <select id="quote-status-filter" v-model="selectedStatus" class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary">
          <option v-for="status in filteredStatuses" :key="status" :value="status">{{ status || 'All statuses' }}</option>
        </select>
        <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
          <Search class="h-4 w-4" /> Search
        </button>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary" :disabled="loading" @click="load">
          <RefreshCw class="h-4 w-4" /> Refresh
        </button>
      </form>
    </section>

    <p v-if="errorMessage" class="rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{{ successMessage }}</p>
    <p v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading quote requests…</p>
    <div v-else-if="quotes.length" class="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div v-for="quote in quotes" :key="quote.id" class="border-b border-slate-100 p-5 last:border-0 sm:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="min-w-0">
            <RouterLink :to="`/admin/quotes/${quote.id}`" class="font-semibold text-slate-900 hover:text-primary">
              {{ quote.customerFirstName }} {{ quote.customerLastName }}
            </RouterLink>
            <p class="mt-1 text-sm text-slate-600">{{ quote.service.name }} · {{ quote.propertyType }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ quote.customerEmail }}<span v-if="quote.customerPhone"> · {{ quote.customerPhone }}</span></p>
            <p class="mt-1 text-xs text-slate-400">{{ formatDate(quote.createdAt) }} · {{ quote.city }}, {{ quote.state }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <span class="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800">{{ quote.status }}</span>
            <label class="sr-only" :for="`quote-status-${quote.id}`">Update status for {{ quote.customerFirstName }} {{ quote.customerLastName }}</label>
            <select
              :id="`quote-status-${quote.id}`"
              class="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              :disabled="updatingId === quote.id || quoteTransitions[quote.status].length === 0"
              :value="quote.status"
              @change="updateStatus(quote, ($event.target as HTMLSelectElement).value as QuoteStatus)"
            >
              <option :value="quote.status">{{ quote.status }}</option>
              <option v-for="status in quoteTransitions[quote.status]" :key="status" :value="status">{{ status }}</option>
            </select>
            <RouterLink :to="`/admin/quotes/${quote.id}`" class="text-sm font-semibold text-primary hover:underline">Details</RouterLink>
          </div>
        </div>
        <p v-if="quote.notes" class="mt-3 line-clamp-2 text-sm text-slate-600">{{ quote.notes }}</p>
      </div>
    </div>
    <p v-else class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">No quote requests match those filters.</p>
  </div>
</template>
