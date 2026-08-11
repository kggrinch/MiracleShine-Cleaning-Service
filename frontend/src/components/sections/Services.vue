<script setup lang="ts">
import { ArrowRight, BriefcaseBusiness, Building2, BrushCleaning, HousePlus, Sparkles, Sprout } from 'lucide-vue-next'

// Service offering cards designed to feel premium and conversion-driven.
const services = [
  {
    title: 'Residential Cleaning',
    description: 'Consistent care for kitchens, bathrooms, living areas, and the details that matter most.',
    icon: HousePlus,
  },
  {
    title: 'Commercial Cleaning',
    description: 'Professional upkeep for offices, storefronts, and shared spaces that need to look polished daily.',
    icon: Building2,
  },
  {
    title: 'Deep Cleaning',
    description: 'A meticulous reset for high-traffic rooms, overlooked corners, and seasonal refreshes.',
    icon: Sparkles,
  },
  {
    title: 'Move In / Move Out',
    description: 'A polished turnover service for landlords, tenants, and property managers doing their best work.',
    icon: BrushCleaning,
  },
  {
    title: 'Office Cleaning',
    description: 'Flexible care plans that keep reception areas, workstations, and common rooms welcoming.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Special Cleaning Services',
    description: 'Custom solutions for events, post-construction, and high-touch environments that need extra care.',
    icon: Sprout,
  },
]
</script>

<template>
  <section id="services" class="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Our services</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Tailored cleaning plans for homes, offices, and properties that demand excellence.
        </h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Every visit is planned around your needs, schedule, and standards so you can enjoy a cleaner, calmer environment without the stress.
        </p>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
        Weekly • Bi-weekly • One-time • Custom plans
      </div>
    </div>

    <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="service in services" :key="service.title" class="group rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_-25px_rgba(15,23,42,0.35)]">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-primary transition group-hover:scale-105">
          <component :is="service.icon" class="h-6 w-6" />
        </div>

        <h3 class="mt-5 text-xl font-semibold text-slate-900">{{ service.title }}</h3>
        <p class="mt-3 text-[0.95rem] leading-7 text-slate-600">{{ service.description }}</p>

        <RouterLink to="/contact" class="mt-6 inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary-dark">
          Learn More
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </article>
    </div>
  </section>
</template>