<script setup lang="ts">
import { BrushCleaning, Clock3, ShieldCheck, Sparkles } from 'lucide-vue-next'

// A polished value section that emphasizes trust, consistency, and care.
const features = [
  {
    title: 'Professional Team',
    description: 'Skilled cleaners trained to deliver polished results with a calm, respectful approach.',
    icon: Sparkles,
  },
  {
    title: 'Reliable Scheduling',
    description: 'Flexible appointments that fit your routine, property demands, and service preferences.',
    icon: Clock3,
  },
  {
    title: 'Quality Guarantee',
    description: 'We set high standards and follow through with attentive detail every visit.',
    icon: ShieldCheck,
  },
  {
    title: 'Customer First',
    description: 'Your satisfaction shapes every plan, every follow-up, and every final walkthrough.',
    icon: BrushCleaning,
  },
]
</script>

<template>
  <section class="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-28">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(54,180,229,0.16),_transparent_30%)]" />

    <div class="relative mx-auto max-w-7xl px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div class="max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Why choose us</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            A premium cleaning experience built around trust, care, and consistency.
          </h2>
          <p class="mt-5 text-lg leading-8 text-slate-300">
            Our work goes beyond surface-level tidiness. We create environments that feel refreshed, comfortable, and genuinely cared for.
          </p>

          <div class="mt-8 rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Our promise</p>
            <p class="mt-3 text-xl font-semibold text-white">Reliable service, refined detail, and a stress-free experience from start to finish.</p>
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <article v-for="feature in features" :key="feature.title" class="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-sky-300">
              <component :is="feature.icon" class="h-6 w-6" />
            </div>
            <h3 class="mt-5 text-xl font-semibold">{{ feature.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-300">{{ feature.description }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>