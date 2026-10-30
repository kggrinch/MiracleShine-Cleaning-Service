<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Star } from 'lucide-vue-next'
import PageBanner from '@/components/layout/PageBanner.vue'
import { fetchPublicReviews, getPublicReviewerName, type PublicReview } from '@/services/reviews'
import { getApiErrorMessage } from '@/services/errors'

const reviews = ref<PublicReview[]>([])
const isLoading = ref(true)
const loadError = ref('')
const averageRating = computed(() => {
  if (!reviews.value.length) return null
  return (
    reviews.value.reduce((sum, review) => sum + review.rating, 0) / reviews.value.length
  ).toFixed(1)
})

onMounted(async () => {
  try {
    reviews.value = await fetchPublicReviews()
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'Reviews could not be loaded.')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
    <PageBanner
      eyebrow="Reviews"
      title="Trusted by clients who value reliability and polished results."
      description="Approved customer feedback from completed Miracle Shine appointments."
    />

    <div v-if="averageRating" class="mt-12 flex flex-col gap-6 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white sm:flex-row sm:items-center sm:justify-between lg:p-10">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Customer rating</p>
        <div class="mt-3 flex items-end gap-3">
          <span class="text-5xl font-semibold">{{ averageRating }}</span>
          <span class="pb-1 text-lg text-slate-300">out of 5</span>
        </div>
      </div>
      <div class="space-y-3">
        <div class="flex items-center gap-1 text-accent">
          <Star v-for="n in 5" :key="n" class="h-6 w-6 fill-current" />
        </div>
        <p class="text-sm text-slate-300">Based on {{ reviews.length }} approved {{ reviews.length === 1 ? 'review' : 'reviews' }}.</p>
      </div>
    </div>

    <p v-if="isLoading" class="mt-10 text-center text-slate-600" role="status">Loading approved reviews…</p>
    <p v-else-if="loadError" class="mt-10 text-center text-red-700" role="alert">{{ loadError }}</p>
    <p v-else-if="reviews.length === 0" class="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
      No approved reviews have been published yet.
    </p>

    <div v-else class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="review in reviews"
        :key="review.id"
        class="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1"
      >
        <div class="flex items-center gap-1 text-accent" :aria-label="`${review.rating} out of 5 stars`">
          <Star v-for="n in 5" :key="n" class="h-4 w-4" :class="n <= review.rating ? 'fill-current' : ''" />
        </div>
        <p class="mt-5 text-[0.95rem] leading-7 text-slate-600">{{ review.comment || 'Thank you for sharing your feedback.' }}</p>
        <div class="mt-6 border-t border-slate-100 pt-5">
          <p class="font-semibold text-slate-900">{{ getPublicReviewerName(review) }}</p>
          <p class="text-sm text-slate-500">{{ review.appointment.quoteRequest.service.name }}</p>
        </div>
      </article>
    </div>

    <div class="mt-16 sm:mt-20">
      <PageBanner
        eyebrow="Your turn"
        title="Ready for a cleaner, more polished space?"
        description="Get a free, tailored quote today."
      >
        <RouterLink
          to="/get-quote"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Request a free quote
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </PageBanner>
    </div>
  </section>
</template>
