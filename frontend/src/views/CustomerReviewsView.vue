<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Star } from 'lucide-vue-next'
import api from '@/services/api'
import { getApiErrorMessage } from '@/services/errors'

type CustomerReview = {
  id: string
  rating: number
  comment: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

const reviews = ref<CustomerReview[]>([])
const draft = reactive({ rating: '', comment: '' })
const loading = ref(true)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const { data } = await api.get<CustomerReview[]>('/reviews/me')
    reviews.value = data
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Your reviews could not be loaded.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function submit() {
  if (!draft.rating) {
    errorMessage.value = 'Select a rating before submitting.'
    return
  }
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await api.post('/reviews', {
      rating: Number(draft.rating),
      ...(draft.comment.trim() ? { comment: draft.comment.trim() } : {}),
    })
    draft.rating = ''
    draft.comment = ''
    successMessage.value = 'Review submitted for administrator approval.'
    await load()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Your review could not be submitted.')
  } finally {
    submitting.value = false
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Feedback</p>
      <h1 class="mt-2 text-3xl font-semibold text-slate-900">My reviews</h1>
      <p class="mt-2 text-slate-600">Share feedback and check the moderation status of your submissions.</p>
    </header>

    <form class="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" @submit.prevent="submit">
      <h2 class="text-lg font-semibold text-slate-900">Write a review</h2>
      <label class="block text-sm font-medium text-slate-700">
        Rating
        <select v-model="draft.rating" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3">
          <option value="" disabled>Choose a rating</option>
          <option v-for="rating in [5, 4, 3, 2, 1]" :key="rating" :value="String(rating)">
            {{ rating }} / 5
          </option>
        </select>
      </label>
      <label class="block text-sm font-medium text-slate-700">
        Review message <span class="font-normal text-slate-500">(optional)</span>
        <textarea v-model="draft.comment" maxlength="5000" rows="4" class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
      </label>
      <p v-if="errorMessage" class="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{{ successMessage }}</p>
      <button type="submit" :disabled="submitting" class="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {{ submitting ? 'Submitting…' : 'Submit review' }}
      </button>
    </form>

    <section class="space-y-4">
      <h2 class="text-lg font-semibold text-slate-900">Submitted reviews</h2>
      <p v-if="loading" class="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600" role="status">Loading reviews…</p>
      <article v-for="review in reviews" v-else :key="review.id" class="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-1 text-amber-500" :aria-label="`${review.rating} out of 5 stars`">
            <Star v-for="rating in 5" :key="rating" class="h-4 w-4" :class="rating <= review.rating ? 'fill-current' : ''" />
            <span class="ml-1 text-sm text-slate-600">{{ review.rating }}/5</span>
          </div>
          <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">{{ review.status }}</span>
        </div>
        <p class="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{{ review.comment || 'No written comment.' }}</p>
        <p class="mt-3 text-xs text-slate-400">{{ formatDate(review.createdAt) }}</p>
      </article>
      <p v-if="!loading && reviews.length === 0" class="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">You have not submitted any reviews yet.</p>
    </section>
  </div>
</template>
