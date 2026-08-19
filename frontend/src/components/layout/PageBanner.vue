<script setup lang="ts">
import BackgroundDecor from '@/components/ui/BackgroundDecor.vue'

defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div
    v-reveal class="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10 lg:p-12"
  >
    <!-- Soft brand-tinted sheen so the page banner never feels like a flat white box -->
    <BackgroundDecor />
    <div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-sky-100/80 to-accent/10 blur-2xl" aria-hidden="true" />

    <div class="relative max-w-3xl">
      <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
        {{ eyebrow }}
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-5 text-lg leading-8 text-slate-600">
        {{ description }}
      </p>
      <div v-if="$slots.default" class="mt-7">
        <slot />
      </div>
    </div>
  </div>
</template>