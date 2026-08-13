<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10 lg:p-12"
  >
    <div class="max-w-3xl">
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