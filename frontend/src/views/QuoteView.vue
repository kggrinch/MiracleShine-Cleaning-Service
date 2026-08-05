<script setup lang="ts">
import QuoteForm from '@/components/sections/QuoteForm.vue'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
    <div class="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Request a quote</p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Start with a customized cleaning estimate tailored to your space.</h1>
        <p class="mt-5 text-lg leading-8 text-slate-600">Tell us about your property, preferred service, and schedule, and we’ll follow up with a thoughtful recommendation.</p>
      </div>
    </div>

    <QuoteForm />
  </section>
</template>