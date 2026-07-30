<script setup lang="ts">
const services = [
  {
    title: 'Office & Commercial Cleaning',
    body: 'Flexible cleaning programs for reception areas, meeting rooms, and shared workspaces.',
  },
  {
    title: 'Move-In / Move-Out Reset',
    body: 'Detailed turnover cleaning that helps landlords and tenants leave a polished space behind.',
  },
  {
    title: 'Janitorial Care',
    body: 'Reliable restroom, floor care, and breakroom attention for long-term upkeep.',
  },
  {
    title: 'Disinfection & Sanitizing',
    body: 'Extra attention to high-touch points for a healthier environment.',
  },
]
</script>

<template>
  <section class="space-y-8">
    <div class="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-200/70 backdrop-blur">
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Our services</p>
      <h1 class="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">Custom cleaning plans for every kind of property</h1>
      <p class="mt-4 max-w-3xl text-lg text-slate-600">
        From daily office refreshes to large-scale property care, we tailor each visit around your schedule and standards.
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <article v-for="service in services" :key="service.title" class="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl">
        <h2 class="text-2xl font-semibold text-slate-900">{{ service.title }}</h2>
        <p class="mt-3 text-slate-600">{{ service.body }}</p>
      </article>
    </div>
  </section>
</template>
