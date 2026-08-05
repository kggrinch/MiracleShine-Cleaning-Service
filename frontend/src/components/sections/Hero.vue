<script setup lang="ts">
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Star } from 'lucide-vue-next'
</script>

<template>
  <section class="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(54,180,229,0.2),_transparent_32%),linear-gradient(135deg,_#f8fcfe_0%,_#eef6ff_45%,_#fdfefe_100%)]">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(247,231,51,0.16),_transparent_30%)]" />

    <div class="relative mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8 lg:py-28">
      <div class="rounded-[2.5rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:p-10 xl:p-14">
        <div class="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div class="flex flex-col justify-center">
            <div class="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
              <BadgeCheck class="h-4 w-4" />
              Trusted residential & commercial cleaning specialists
            </div>

            <h1 class="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Premium cleaning services that make every space feel effortless.
            </h1>

            <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Miracle Shine Cleaning Service brings polished detail, dependable scheduling, and a refined finish to homes, offices, and properties that deserve the very best.
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <RouterLink to="/get-quote" class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark">
                Request a Quote
                <ArrowRight class="h-4 w-4" />
              </RouterLink>

              <RouterLink to="/services" class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-primary hover:text-primary-dark">
                View Services
              </RouterLink>
            </div>

            <div class="mt-10 grid gap-4 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div class="flex items-center gap-2 text-slate-900">
                  <ShieldCheck class="h-4 w-4 text-primary" />
                  <span class="font-semibold">Licensed & Insured</span>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div class="flex items-center gap-2 text-slate-900">
                  <Clock3 class="h-4 w-4 text-primary" />
                  <span class="font-semibold">Flexible Scheduling</span>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div class="flex items-center gap-2 text-slate-900">
                  <BadgeCheck class="h-4 w-4 text-primary" />
                  <span class="font-semibold">Satisfaction Focused</span>
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/25 blur-3xl" />
            <div class="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl shadow-slate-300/70">
              <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80" alt="Professional cleaning team preparing a polished home interior" class="h-[420px] w-full rounded-[1.5rem] object-cover sm:h-[520px]" />
            </div>

            <div class="absolute bottom-4 left-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
              <div class="flex items-center gap-1 text-accent">
                <Star v-for="n in 5" :key="n" class="h-4 w-4 fill-current" />
              </div>
              <p class="mt-1 text-sm font-semibold text-slate-900">4.9/5 average review rating</p>
              <p class="text-sm text-slate-600">Trusted by households & growing businesses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>