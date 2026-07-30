<script setup lang="ts">
import { RouterLink } from 'vue-router'

const links = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
]
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-700 text-lg font-bold text-white shadow-lg shadow-cyan-500/20">
          M
        </div>
        <div>
          <p class="text-sm font-semibold tracking-[0.2em] text-cyan-600 uppercase">MiracleShine</p>
          <p class="text-base font-semibold text-slate-900">Cleaning Service</p>
        </div>
      </RouterLink>

      <nav class="hidden items-center gap-6 md:flex">
        <RouterLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="text-sm font-medium text-slate-600 transition hover:text-cyan-600"
          active-class="text-cyan-600"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <a href="#contact" class="hidden rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 md:inline-flex">
        Get a Quote
      </a>
    </div>
  </header>
</template>
