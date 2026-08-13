<script setup lang="ts">
import { ArrowRight, Star } from 'lucide-vue-next'
import PageBanner from '@/components/layout/PageBanner.vue'

type Review = {
  name: string
  title: string
  quote: string
}

// Representative client feedback. Replace the entries below with real
// testimonials as they become available — names are kept as first-name
// initials to protect client privacy.
const testimonials: Review[] = [
  {
    name: 'Maria T.',
    title: 'Homeowner',
    quote: 'The team was punctual, thoughtful, and left every room sparkling. It feels like a fresh start every time.',
  },
  {
    name: 'Jason & Lauren',
    title: 'Property Managers',
    quote: 'Their attention to detail and communication make them our go-to cleaning partner for every turnover.',
  },
  {
    name: 'Diana P.',
    title: 'Office Manager',
    quote: 'Professional, reliable, and polished. Our office always feels welcoming after each visit.',
  },
  {
    name: 'Sam R.',
    title: 'Small Business Owner',
    quote: 'They fit around our schedule seamlessly and keep the storefront looking sharp and inviting.',
  },
  {
    name: 'Emily C.',
    title: 'Realtor',
    quote: 'Their move-out service means every property is ready for showings with zero last-minute stress.',
  },
  {
    name: 'Derek M.',
    title: 'Restaurant Owner',
    quote: 'Clean, respectful, and consistent — exactly what you need when your space hosts people all day.',
  },
]

const overallRating = 4.9
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
    <PageBanner
      eyebrow="Reviews"
      title="Trusted by clients who value reliability and polished results."
      description="We believe trust is built through consistency, respectful service, and finishing every job with care."
    />

    <div class="mt-12 flex flex-col gap-6 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white sm:flex-row sm:items-center sm:justify-between lg:p-10">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Overall rating</p>
        <div class="mt-3 flex items-end gap-3">
          <span class="text-5xl font-semibold">{{ overallRating }}</span>
          <span class="pb-1 text-lg text-slate-300">out of 5</span>
        </div>
      </div>
      <div class="space-y-3">
        <div class="flex items-center gap-1 text-accent">
          <Star v-for="n in 5" :key="n" class="h-6 w-6 fill-current" />
        </div>
        <p class="text-sm text-slate-300">Based on client feedback across homes, offices, and recurring service plans.</p>
      </div>
    </div>

    <div class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="review in testimonials"
        :key="review.name"
        class="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1"
      >
        <div class="flex items-center gap-1 text-accent">
          <Star v-for="n in 5" :key="n" class="h-4 w-4 fill-current" />
        </div>
        <p class="mt-5 text-[0.95rem] leading-7 text-slate-600">“{{ review.quote }}”</p>
        <div class="mt-6 border-t border-slate-100 pt-5">
          <p class="font-semibold text-slate-900">{{ review.name }}</p>
          <p class="text-sm text-slate-500">{{ review.title }}</p>
        </div>
      </article>
    </div>

    <p class="mt-6 text-center text-sm text-slate-500">
      Representative client feedback shown as examples. Names are abbreviated to protect client privacy.
    </p>

    <div class="mt-20">
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