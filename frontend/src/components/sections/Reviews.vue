<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, ArrowRight, Star } from 'lucide-vue-next'

type Review = {
  name: string
  title: string
  quote: string
}

// Social proof cards to reinforce trust and perceived quality.
const reviews: Review[] = [
  {
    name: 'Facility Manager',
    title: 'Commercial Property',
    quote: 'The team is reliable, thorough, and keeps our office looking polished every week.',
  },
  {
    name: 'Building Director',
    title: 'Multi-tenant Office',
    quote: 'Their approach is professional, efficient, and respectful of our schedule and tenants.',
  },
  {
    name: 'Operations Lead',
    title: 'Retail Facility',
    quote: 'They deliver consistent results with a strong attention to detail in shared spaces and restrooms.',
  },
]

const activeIndex = ref(0)

const currentReview = computed(() => {
  const index = Math.max(0, Math.min(activeIndex.value, reviews.length - 1))
  return reviews[index] as Review
})

function nextReview() {
  activeIndex.value = (activeIndex.value + 1) % reviews.length
}

function prevReview() {
  activeIndex.value = (activeIndex.value - 1 + reviews.length) % reviews.length
}
</script>

<template>
  <section class="bg-slate-50 py-24 sm:py-28">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Reviews</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Loved by customers for dependable service and beautiful results.
          </h2>
        </div>

        <div class="flex gap-2">
          <button @click="prevReview" class="rounded-full border border-slate-300 bg-white p-3 text-slate-700 transition hover:border-primary hover:text-primary">
            <ArrowLeft class="h-4 w-4" />
          </button>
          <button @click="nextReview" class="rounded-full border border-slate-300 bg-white p-3 text-slate-700 transition hover:border-primary hover:text-primary">
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_22px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10">
        <div class="flex items-center gap-1 text-accent">
          <Star v-for="n in 5" :key="n" class="h-5 w-5 fill-current" />
        </div>

        <blockquote class="mt-6 text-xl leading-9 text-slate-700 sm:text-2xl">
          “{{ currentReview.quote }}”
        </blockquote>

        <div class="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="font-semibold text-slate-900">{{ currentReview.name }}</p>
            <p class="text-sm text-slate-500">{{ currentReview.title }}</p>
          </div>
          <div class="flex gap-2">
            <button v-for="(review, index) in reviews" :key="review.name" class="h-2.5 w-2.5 rounded-full transition" :class="activeIndex === index ? 'bg-primary' : 'bg-slate-300'" @click="activeIndex = index" :aria-label="`Show review ${index + 1}`" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>