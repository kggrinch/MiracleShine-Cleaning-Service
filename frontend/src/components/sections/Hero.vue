<script setup lang="ts">
import { BadgeCheck, Clock3, ShieldCheck, Sparkles, Star } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'
</script>

<template>
  <!-- Full-bleed professional cleaning photo as the hero canvas. A left-to-right
       dark gradient keeps the headline readable without masking the image. -->
  <section class="relative isolate overflow-hidden bg-[url('/images/hero-commercial-cleaning.jpg')] bg-cover bg-[position:58%_center] bg-no-repeat">
    <div
      class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl px-6 pt-20 pb-14 sm:pt-24 sm:pb-16 lg:px-8 lg:pt-28 lg:pb-20">
      <!-- Left column: headline + CTAs. max-w-xl keeps the copy readable
           over the wide image without stretching lines across the screen. -->
      <div class="mx-auto max-w-xl">
        <div class="hero-fade hero-fade-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/85 px-4 py-2 text-sm font-medium text-sky-800 backdrop-blur">
          <BadgeCheck class="h-4 w-4 text-sky-300" />
          Commercial &amp; residential cleaning specialists
        </div>

        <h1 class="hero-fade hero-fade-2 mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Professional commercial cleaning you can trust.
        </h1>

        <p class="hero-fade hero-fade-3 mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
          Miracle Shine delivers polished, dependable cleaning for offices, facilities, and homes - with detail-driven service and a satisfaction guarantee on every visit.
        </p>

        <div class="hero-fade hero-fade-4 mt-8 flex flex-col gap-3 sm:flex-row">
          <AppButton to="/get-quote" size="lg" arrow>
            Get a Quote
          </AppButton>
          <AppButton to="/services" variant="outline" size="lg">
            View Services
          </AppButton>
        </div>

        <div class="hero-fade hero-fade-5 mt-10 grid gap-4 sm:grid-cols-3">
          <div class="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/12 px-4 py-3 text-white shadow-sm backdrop-blur">
            <ShieldCheck class="h-4 w-4 shrink-0 text-sky-300" />
            <span class="font-semibold">Licensed &amp; insured</span>
          </div>
          <div class="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/12 px-4 py-3 text-white shadow-sm backdrop-blur">
            <Clock3 class="h-4 w-4 shrink-0 text-sky-300" />
            <span class="font-semibold">Flexible scheduling</span>
          </div>
          <div class="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/12 px-4 py-3 text-white shadow-sm backdrop-blur">
            <Star class="h-4 w-4 shrink-0 text-accent" />
            <span class="font-semibold">4.9/5 rating</span>
          </div>
        </div>
      </div>

      <!-- Floating trust badge (top-right, over the bright side of the photo) -->
      <div class="hero-float absolute right-6 top-14 hidden lg:block rounded-2xl border border-white/25 bg-white/90 px-4 py-2.5 shadow-lg shadow-black/25 backdrop-blur">
        <div class="flex items-center gap-2 text-slate-900">
          <Sparkles class="h-4 w-4 text-primary" />
          <span class="text-sm font-semibold">Satisfaction guaranteed</span>
        </div>
        <p class="text-xs text-slate-600">Backed on every visit</p>
      </div>

      <!-- Floating rating badge (bottom-left, over the darker gradient side) -->
      <div class="hero-float-delay absolute bottom-6 left-24 hidden lg:block rounded-2xl border border-white/20 bg-white/90 px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur">
        <div class="flex items-center gap-1 text-accent">
          <Star v-for="n in 5" :key="n" class="h-4 w-4 fill-current" />
        </div>
        <p class="mt-1 text-sm font-semibold leading-tight text-slate-900">4.9/5 average rating</p>
        <p class="text-xs text-slate-600">Trusted by households &amp; businesses</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Staggered entrance for the copy */
@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.hero-fade {
  opacity: 0;
  animation: hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.hero-fade-1 { animation-delay: 0.08s; }
.hero-fade-2 { animation-delay: 0.16s; }
.hero-fade-3 { animation-delay: 0.24s; }
.hero-fade-4 { animation-delay: 0.32s; }
.hero-fade-5 { animation-delay: 0.4s; }

/* Soft floating badges */
@keyframes hero-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}
.hero-float { animation: hero-float 6s ease-in-out infinite; }
.hero-float-delay { animation: hero-float 7s ease-in-out 0.6s infinite; }

@media (prefers-reduced-motion: reduce) {
  .hero-fade { animation: none; opacity: 1; }
  .hero-float,
  .hero-float-delay { animation: none; }
}
</style>
