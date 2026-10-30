<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Star } from 'lucide-vue-next'
import api from '@/services/api'
import type { AdminReview } from '@/services/portal'
import { getApiErrorMessage } from '@/services/errors'

const reviews = ref<AdminReview[]>([])
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const statuses: AdminReview['status'][] = ['PENDING', 'APPROVED', 'REJECTED']

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.get<AdminReview[]>('/admin/reviews')
    reviews.value = data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Reviews could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function updateStatus(review: AdminReview, status: AdminReview['status']) {
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await api.patch<AdminReview>(`/admin/reviews/${review.id}/status`, { status })
    review.status = data.status
    successMessage.value = `Review ${status.toLowerCase()}.`
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Review status could not be updated.')
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Moderation</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">Customer reviews</h1>
      <p class="mt-2 text-slate-600">Only approved reviews are shown publicly.</p>
    </header>
    <p v-if="errorMessage" class="rounded-2xl bg-red-50 p-4 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
    <p v-if="successMessage" class="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{{ successMessage }}</p>
    <p v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading reviews…</p>
    <div v-else-if="reviews.length" class="space-y-4">
      <article v-for="review in reviews" :key="review.id" class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-semibold text-slate-900">{{ review.appointment.quoteRequest.customerFirstName }} {{ review.appointment.quoteRequest.customerLastName }} · {{ review.appointment.quoteRequest.service.name }}</p>
            <div class="mt-2 flex items-center gap-1 text-amber-500" :aria-label="`${review.rating} out of 5 stars`">
              <Star v-for="rating in 5" :key="rating" class="h-4 w-4" :class="rating <= review.rating ? 'fill-current' : ''" />
              <span class="ml-1 text-sm font-medium text-slate-600">{{ review.rating }}/5</span>
            </div>
            <p class="mt-2 text-xs text-slate-400">{{ formatDate(review.createdAt) }} · {{ review.status }}</p>
          </div>
          <label class="text-xs font-medium text-slate-500">
            Moderation status
            <select :value="review.status" class="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700" @change="updateStatus(review, ($event.target as HTMLSelectElement).value as AdminReview['status'])">
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </label>
        </div>
        <p class="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{{ review.comment || 'No written comment.' }}</p>
      </article>
    </div>
    <p v-else class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">No reviews have been submitted.</p>
  </div>
</template>
