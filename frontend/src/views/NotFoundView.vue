<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">404</p>
      <h1 class="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Page not found.</h1>
      <p class="mt-5 text-lg leading-8 text-slate-600">
        The page you're looking for doesn't exist or has moved. Let's get you back to a clean start.
      </p>
      <RouterLink
        to="/"
        class="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to Home
      </RouterLink>
    </div>
  </section>
</template>