<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const testimonials = [
  {
    name: 'Maria T.',
    role: 'Homeowner',
    quote: 'They were punctual, attentive, and left our home feeling fresh and welcoming.',
  },
  {
    name: 'Jason & Lauren',
    role: 'Property Managers',
    quote: 'Their communication and attention to detail make every turnover feel effortless.',
  },
  {
    name: 'Diana P.',
    role: 'Office Manager',
    quote: 'Our office always looks polished after their visits and the team is a pleasure to work with.',
  },
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
    <div class="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Reviews</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Trusted by clients who value reliability and polished results.</h1>
        <p class="mt-5 text-lg leading-8 text-slate-600">We believe trust is built through consistency, respectful service, and finishing every job with care.</p>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-3">
        <article v-for="item in testimonials" :key="item.name" class="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
          <div class="flex items-center gap-1 text-accent">
            <Star v-for="n in 5" :key="n" class="h-4 w-4 fill-current" />
          </div>
          <p class="mt-5 text-sm leading-7 text-slate-600">“{{ item.quote }}”</p>
          <div class="mt-6">
            <p class="font-semibold text-slate-900">{{ item.name }}</p>
            <p class="text-sm text-slate-500">{{ item.role }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>