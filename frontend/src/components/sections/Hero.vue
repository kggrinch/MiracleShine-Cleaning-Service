<script setup lang="ts">
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Star } from 'lucide-vue-next'
import heroImage from '@/assets/images/main_logo.png'
</script>

<template>
  <section class="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(54,180,229,0.14),_transparent_30%),linear-gradient(180deg,_#f8fcfe_0%,_#eef6ff_45%,_#fdfefe_100%)]">
    <div class="absolute inset-x-0 top-0 h-32 bg-white/60 blur-3xl" />
    <div class="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-28">
      <div class="relative overflow-hidden rounded-[2.75rem] border border-slate-200/90 bg-white/90 p-6 shadow-[0_35px_110px_-40px_rgba(15,23,42,0.28)] backdrop-blur-xl lg:p-10 xl:p-14">
        <div class="absolute -left-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div class="absolute right-0 top-16 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />

        <div class="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div class="relative z-10 flex flex-col justify-center gap-8">
            <div class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
              <BadgeCheck class="h-4 w-4" />
              Trusted commercial cleaning partner
            </div>

            <div class="space-y-5">
              <h1 class="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Professional commercial cleaning you can trust.
              </h1>
              <p class="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Miracle Shine keeps offices, facilities, and retail spaces spotless with experienced crews, dependable standards, and thoughtful care for your business environment.
              </p>
            </div>

            <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
              <RouterLink to="/contact" class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark">
                Get a Quote
                <ArrowRight class="h-4 w-4" />
              </RouterLink>
              <RouterLink to="/services" class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary-dark">
                View Services
              </RouterLink>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5">
                <div class="flex items-center gap-2 text-slate-900">
                  <ShieldCheck class="h-4 w-4 text-primary" />
                  <span class="font-semibold">Licensed & Insured</span>
                </div>
              </div>
              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5">
                <div class="flex items-center gap-2 text-slate-900">
                  <Clock3 class="h-4 w-4 text-primary" />
                  <span class="font-semibold">Flexible Scheduling</span>
                </div>
              </div>
              <div class="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5">
                <div class="flex items-center gap-2 text-slate-900">
                  <BadgeCheck class="h-4 w-4 text-primary" />
                  <span class="font-semibold">Satisfaction Focused</span>
                </div>
              </div>
            </div>
          </div>

          <div class="relative z-10">
            <div class="group relative overflow-hidden rounded-[2.25rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl shadow-slate-300/70 transition duration-500 hover:-translate-y-1 lg:hover:scale-[1.005]">
              <div class="relative overflow-hidden rounded-[1.75rem]">
                <img :src="heroImage" alt="Commercial cleaning team inside a polished office building" class="h-[420px] w-full object-cover transition duration-1000 ease-out motion-safe:animate-hero-image" />
                <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              </div>

              <div class="absolute left-5 top-5 rounded-3xl border border-white/75 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                <p class="text-xs uppercase tracking-[0.35em] text-slate-500">Facility care</p>
                <p class="mt-2 text-sm font-semibold text-slate-900">Office, retail, and property cleaning</p>
              </div>

              <div class="absolute bottom-5 left-5 right-5 rounded-[1.75rem] border border-white/70 bg-white/95 px-4 py-4 shadow-xl backdrop-blur-sm">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-2 text-slate-900">
                    <Star class="h-4 w-4 text-accent" />
                    <span class="font-semibold">4.9/5 service rating</span>
                  </div>
                  <div class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700">
                    Trusted
                  </div>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-600">Dependable crews, polished results, and thorough walk-throughs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes hero-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.015); }
}

.motion-safe\:animate-hero-image {
  animation: hero-scale 14s ease-in-out infinite;
}
</style>