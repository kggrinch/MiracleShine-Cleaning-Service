<script setup lang="ts">
import CustomerDropdown from '@/components/CustomerDropdown.vue'
</script>

<template>
  <section class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
    <div class="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Contact us</p>
      <h1 class="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">Let’s make your space shine</h1>
      <p class="mt-4 text-lg text-slate-600">
        Reach out for a free estimate, service consultation, or a customized cleaning plan for your business.
      </p>
      <div class="mt-8 space-y-4 text-slate-700">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="font-semibold">Phone</p>
          <a href="tel:5550148" class="text-cyan-600">(555) 0148</a>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="font-semibold">Email</p>
          <a href="mailto:hello@miracleshine.com" class="text-cyan-600">hello@miracleshine.com</a>
        </div>
      </div>
    </div>

    <CustomerDropdown />
  </section>
</template>
