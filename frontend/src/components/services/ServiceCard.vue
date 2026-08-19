<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { CleaningService } from '@/data/services'

defineProps<{
  service: CleaningService
  /** Renders the "includes" checklist (used on the full services page grid). */
  detailed?: boolean
}>()
</script>

<template>
  <article
    class="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-[0_30px_70px_-28px_rgba(15,23,42,0.4)]"
  >
    <!-- Hover wash: a soft brand-tinted sheen that fades in over the card -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/80 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      aria-hidden="true"
    />
    <!-- Accent hairline that lights up along the top edge on hover -->
    <div
      class="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      aria-hidden="true"
    />

    <div class="relative flex flex-1 flex-col">
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-primary ring-1 ring-inset ring-sky-100 transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:ring-primary"
      >
        <component
          :is="service.icon"
          class="h-7 w-7 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
          :stroke-width="1.6"
        />
      </div>

      <h3 class="mt-5 text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-primary-dark">
        {{ service.title }}
      </h3>
      <p class="mt-3 text-[0.95rem] leading-7 text-slate-600">
        {{ service.description }}
      </p>

      <ul v-if="detailed && service.includes.length" class="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
        <li v-for="item in service.includes" :key="item" class="flex items-center gap-2.5 text-sm text-slate-600">
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-primary transition-colors duration-300 group-hover:bg-sky-100">
            <Check class="h-3 w-3" :stroke-width="3" />
          </span>
          {{ item }}
        </li>
      </ul>

      <div v-if="!detailed" class="mt-6 flex-1" aria-hidden="true" />

      <RouterLink
        to="/get-quote"
        class="mt-6 inline-flex items-center gap-2 font-semibold text-primary transition-colors duration-300 group-hover:text-primary-dark"
      >
        {{ detailed ? 'Get this service' : 'Learn more' }}
        <svg
          class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </RouterLink>
    </div>
  </article>
</template>