<script setup lang="ts">
import { CalendarCheck, Mail, MapPin, Phone } from 'lucide-vue-next'
import BackgroundDecor from '@/components/ui/BackgroundDecor.vue'

defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <div v-reveal class="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10">
    <BackgroundDecor />
    <div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-sky-100/70 to-accent/10 blur-2xl" aria-hidden="true" />

    <div class="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">{{ eyebrow }}</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{{ title }}</h1>
        <p class="mt-5 text-lg leading-8 text-slate-600">{{ description }}</p>

        <div class="mt-8 space-y-4">
          <div class="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_14px_34px_-22px_rgba(54,180,229,0.7)]">
            <Phone class="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-hover:scale-110" />
            <a href="tel:4255551234" class="font-medium text-slate-700 transition hover:text-primary-dark">(425) 555-1234</a>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_16px_34px_-22px_rgba(54,180,229,0.7)]">
            <Mail class="h-5 w-5 shrink-0 text-primary" />
            <a href="mailto:info@miracleshinecleaning.com" class="font-medium text-slate-700 transition hover:text-primary-dark">info@miracleshinecleaning.com</a>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_16px_34px_-22px_rgba(54,180,229,0.7)]">
            <MapPin class="h-5 w-5 shrink-0 text-primary" />
            <span class="font-medium text-slate-700">Serving the Seattle area with precision and care</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white lg:p-8">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">What happens next</p>
          <h2 class="mt-3 text-2xl font-semibold">A thoughtful estimate, with no pressure</h2>
          <p class="mt-4 text-sm leading-7 text-slate-300">
            We'll review your details and follow up with a tailored recommendation and a clear, upfront estimate that fits your schedule and standards.
          </p>
        </div>
        <div class="space-y-3 text-sm text-slate-300">
          <p class="flex items-center gap-2">
            <CalendarCheck class="h-4 w-4 text-sky-300" />
            Weekday, evening, and recurring appointments
          </p>
        </div>
      </div>
    </div>
  </div>
</template>