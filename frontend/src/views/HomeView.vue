<script setup lang="ts">
const services = [
  {
    title: 'Office & Commercial Spaces',
    description: 'Daily, weekly, or monthly cleaning for busy workplaces and shared offices.',
  },
  {
    title: 'Move-In / Move-Out Cleaning',
    description: 'Leave every room ready for the next chapter with a detailed reset.',
  },
  {
    title: 'Janitorial Support',
    description: 'Reliable restroom, breakroom, and floor care for long-term property upkeep.',
  },
]

const stats = [
  { value: '20+', label: 'Years of experience' },
  { value: '100%', label: 'Satisfaction-focused service' },
  { value: '24/7', label: 'Responsive support' },
]
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-8 rounded-[2.5rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
      <div class="animate-[fadeInUp_0.7s_ease-out]">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Commercial cleaning done with care</p>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          MiracleShine Cleaning Service
        </h1>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          We create spotless, welcoming spaces for businesses that want polished presentation and dependable care every day.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <a href="/contact" class="rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:-translate-y-1 hover:bg-slate-700">Book a free estimate</a>
          <a href="/services" class="rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:-translate-y-1 hover:border-cyan-400 hover:text-cyan-600">View services</a>
        </div>
      </div>

      <div class="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Trusted by teams</p>
            <h2 class="mt-2 text-2xl font-semibold">Why businesses choose us</h2>
          </div>
        </div>
        <ul class="mt-6 space-y-4 text-sm text-slate-300">
          <li class="rounded-2xl border border-white/10 bg-white/10 p-4">Flexible scheduling for mornings, evenings, and weekends</li>
          <li class="rounded-2xl border border-white/10 bg-white/10 p-4">Friendly, uniformed professionals you can depend on</li>
          <li class="rounded-2xl border border-white/10 bg-white/10 p-4">Eco-conscious products that support healthier spaces</li>
        </ul>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <div v-for="stat in stats" :key="stat.label" class="rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 text-center shadow-lg shadow-slate-200/50 backdrop-blur">
        <p class="text-3xl font-semibold text-cyan-600">{{ stat.value }}</p>
        <p class="mt-2 text-sm font-medium text-slate-600">{{ stat.label }}</p>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">Featured services</p>
        <h2 class="mt-3 text-3xl font-semibold text-slate-900">Professional care for every visible detail</h2>
        <div class="mt-6 space-y-4">
          <article v-for="service in services" :key="service.title" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 class="font-semibold text-slate-900">{{ service.title }}</h3>
            <p class="mt-2 text-sm text-slate-600">{{ service.description }}</p>
          </article>
        </div>
      </div>

      <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80" alt="A polished office space" class="h-72 w-full object-cover transition duration-700 hover:scale-105" />
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>