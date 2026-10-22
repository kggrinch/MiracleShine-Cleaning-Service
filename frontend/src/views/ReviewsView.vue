<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, Star } from 'lucide-vue-next'
import PageBanner from '@/components/layout/PageBanner.vue'
import { fetchPublicReviews, getApiErrorMessage, type PublicReview } from '@/services/backend'

const reviews = ref<PublicReview[]>([])
const loading = ref(true)
const error = ref('')
const overallRating = computed(() => {
  if (!reviews.value.length) return null
  return reviews.value.reduce((total, review) => total + review.rating, 0) / reviews.value.length
})

onMounted(async () => {
  try {
    reviews.value = await fetchPublicReviews()
  } catch (cause) {
    error.value = getApiErrorMessage(cause, 'Customer reviews are temporarily unavailable.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
    <PageBanner
      eyebrow="Reviews"
      title="Trusted by clients who value reliability and polished results."
      description="We believe trust is built through consistency, respectful service, and finishing every job with care."
    />

    <div v-if="overallRating !== null" class="mt-12 flex flex-col gap-6 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white sm:flex-row sm:items-center sm:justify-between lg:p-10">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Customer rating</p>
        <div class="mt-3 flex items-end gap-3">
          <span class="text-5xl font-semibold">{{ overallRating.toFixed(1) }}</span>
          <span class="pb-1 text-lg text-slate-300">out of 5</span>
        </div>
      </div>
      <div class="space-y-3">
        <div class="flex items-center gap-1 text-accent" aria-label="Average rating">
          <Star v-for="n in 5" :key="n" class="h-6 w-6 fill-current" />
        </div>
        <p class="text-sm text-slate-300">Based on {{ reviews.length }} approved {{ reviews.length === 1 ? 'review' : 'reviews' }}.</p>
      </div>
    </div>

    <p v-if="loading" class="mt-10 rounded-2xl border border-slate-200 bg-white p-7 text-center text-slate-600" role="status">
      Loading approved customer reviews…
    </p>
    <p v-else-if="error" class="mt-10 rounded-2xl border border-red-200 bg-red-50 p-7 text-center text-red-700" role="alert">
      {{ error }}
    </p>
    <p v-else-if="reviews.length === 0" class="mt-10 rounded-2xl border border-slate-200 bg-white p-7 text-center text-slate-600">
      No customer reviews have been published yet.
    </p>
    <div v-else class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="review in reviews"
        :key="review.id"
        class="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1"
      >
        <div class="flex items-center gap-1 text-accent" :aria-label="`${review.rating} out of 5 stars`">
          <Star v-for="n in review.rating" :key="n" class="h-4 w-4 fill-current" />
        </div>
        <p v-if="review.comment" class="mt-5 text-[0.95rem] leading-7 text-slate-600">“{{ review.comment }}”</p>
        <p v-else class="mt-5 text-[0.95rem] leading-7 text-slate-600">Customer rating for {{ review.appointment.quoteRequest.service.name }}.</p>
        <div class="mt-auto border-t border-slate-100 pt-5" :class="review.comment ? 'mt-6' : ''">
          <p class="font-semibold text-slate-900">{{ review.appointment.quoteRequest.customerFirstName }}</p>
          <p class="text-sm text-slate-500">{{ review.appointment.quoteRequest.service.name }}</p>
        </div>
      </article>
    </div>

    <div class="mt-16 sm:mt-20">
      <PageBanner
        eyebrow="Your turn"
        title="Ready for a cleaner, more polished space?"
        description="Join the satisfied homeowners and businesses who trust Miracle Shine with their space. Get a free, tailored quote today."
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
