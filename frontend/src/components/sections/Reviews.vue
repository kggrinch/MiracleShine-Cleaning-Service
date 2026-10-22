<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, ArrowRight, Star } from 'lucide-vue-next'
import { fetchPublicReviews, getApiErrorMessage, type PublicReview } from '@/services/backend'

const reviews = ref<PublicReview[]>([])
const activeIndex = ref(0)
const loading = ref(true)
const error = ref('')
const currentReview = computed(() => reviews.value[activeIndex.value])

onMounted(async () => {
  try {
    reviews.value = await fetchPublicReviews()
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Reviews are temporarily unavailable.')
  } finally {
    loading.value = false
  }
})

function nextReview() {
  if (reviews.value.length) activeIndex.value = (activeIndex.value + 1) % reviews.value.length
}

function prevReview() {
  if (reviews.value.length) {
    activeIndex.value = (activeIndex.value - 1 + reviews.value.length) % reviews.value.length
  }
}
</script>

<template>
  <section class="bg-slate-50 py-12 sm:py-16">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Reviews</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Loved by customers for dependable service and beautiful results.
          </h2>
        </div>
        <div v-if="reviews.length > 1" class="flex gap-2">
          <button type="button" @click="prevReview" aria-label="Previous review" class="rounded-full border border-slate-300 bg-white p-3 text-slate-700 transition hover:border-primary hover:text-primary">
            <ArrowLeft class="h-4 w-4" />
          </button>
          <button type="button" @click="nextReview" aria-label="Next review" class="rounded-full border border-slate-300 bg-white p-3 text-slate-700 transition hover:border-primary hover:text-primary">
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10" aria-live="polite">
        <p v-if="loading" class="text-slate-600" role="status">Loading customer reviews…</p>
        <p v-else-if="error" class="text-sm text-red-700" role="alert">{{ error }}</p>
        <p v-else-if="!currentReview" class="text-slate-600">No customer reviews have been published yet.</p>
        <template v-else>
          <div class="flex items-center gap-1 text-accent" :aria-label="`${currentReview.rating} out of 5 stars`">
            <Star v-for="n in currentReview.rating" :key="n" class="h-5 w-5 fill-current" />
          </div>
          <blockquote v-if="currentReview.comment" class="mt-6 text-xl leading-9 text-slate-700 sm:text-2xl">
            “{{ currentReview.comment }}”
          </blockquote>
          <p v-else class="mt-6 text-xl leading-9 text-slate-700 sm:text-2xl">A customer rated their {{ currentReview.appointment.quoteRequest.service.name }} experience.</p>
          <div class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-semibold text-slate-900">{{ currentReview.appointment.quoteRequest.customerFirstName }}</p>
              <p class="text-sm text-slate-500">{{ currentReview.appointment.quoteRequest.service.name }}</p>
            </div>
            <div class="flex gap-2">
              <button v-for="(review, index) in reviews" :key="review.id" type="button" class="h-2.5 w-2.5 rounded-full transition" :class="activeIndex === index ? 'bg-primary' : 'bg-slate-300'" :aria-label="`Show review ${index + 1}`" :aria-current="activeIndex === index ? 'true' : 'false'" @click="activeIndex = index" />
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
