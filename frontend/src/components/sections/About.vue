<script setup lang="ts">
import { CheckCircle2, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-vue-next'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
    <div class="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
      <div class="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]">
        <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80" alt="A refined, professionally cleaned interior" class="h-full min-h-[360px] w-full object-cover" />
      </div>

      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">About Miracle Shine</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Bringing quality, comfort, and calm to every space we serve.
        </h2>
        <p class="mt-5 text-lg leading-8 text-slate-600">
          We are a locally focused cleaning company committed to creating healthier and brighter spaces with the kind of care that feels personal, dependable, and elevated.
        </p>

        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center gap-2 text-primary">
              <Sparkles class="h-5 w-5" />
              <span class="font-semibold text-slate-900">Attention to detail</span>
            </div>
            <p class="mt-2 text-sm leading-7 text-slate-600">Every finish, fixture, and corner is treated with care.</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center gap-2 text-primary">
              <ShieldCheck class="h-5 w-5" />
              <span class="font-semibold text-slate-900">Reliable standards</span>
            </div>
            <p class="mt-2 text-sm leading-7 text-slate-600">Consistent service that you can count on, visit after visit.</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center gap-2 text-primary">
              <HeartHandshake class="h-5 w-5" />
              <span class="font-semibold text-slate-900">Customer-first approach</span>
            </div>
            <p class="mt-2 text-sm leading-7 text-slate-600">We listen closely and tailor every plan to your priorities.</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center gap-2 text-primary">
              <CheckCircle2 class="h-5 w-5" />
              <span class="font-semibold text-slate-900">Cleaner, healthier spaces</span>
            </div>
            <p class="mt-2 text-sm leading-7 text-slate-600">We help clients save time and enjoy more peace of mind.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>