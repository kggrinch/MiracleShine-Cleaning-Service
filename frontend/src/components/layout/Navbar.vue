<script setup lang="ts">
import { ref } from 'vue'
import { Menu, Phone, Sparkles, X } from 'lucide-vue-next'

// Navigation structure for the premium local service experience.
const links = [
  { name: 'Home', to: '/' },
  { name: 'Services', to: '/services' },
  { name: 'About Us', to: '/about' },
  { name: 'Reviews', to: '/reviews' },
  { name: 'Contact', to: '/contact' },
]

const mobileMenuOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-lg font-semibold text-primary shadow-sm">
          MS
        </div>
        <div>
          <p class="text-base font-semibold tracking-tight text-slate-900">Miracle Shine</p>
          <p class="text-sm text-slate-500">Cleaning Service</p>
        </div>
      </RouterLink>

      <nav class="hidden items-center gap-8 lg:flex">
        <RouterLink
          v-for="link in links"
          :key="link.name"
          :to="link.to"
          class="text-sm font-medium text-slate-700 transition duration-200 hover:text-primary"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <a href="tel:4255551234" class="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary">
          <Phone class="h-4 w-4" />
          (425) 555-1234
        </a>
        <RouterLink to="/get-quote" class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark">
          <Sparkles class="h-4 w-4" />
          Get a Quote
        </RouterLink>
      </div>

      <button class="rounded-full border border-slate-200 p-2 text-slate-700 lg:hidden" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
        <Menu v-if="!mobileMenuOpen" class="h-5 w-5" />
        <X v-else class="h-5 w-5" />
      </button>
    </div>

    <div v-if="mobileMenuOpen" class="border-t border-slate-200 bg-white px-6 py-4 lg:hidden">
      <div class="flex flex-col gap-2">
        <RouterLink v-for="link in links" :key="link.name" :to="link.to" class="rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-primary" @click="mobileMenuOpen = false">
          {{ link.name }}
        </RouterLink>
        <RouterLink to="/get-quote" class="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white" @click="mobileMenuOpen = false">
          Get a Quote
        </RouterLink>
      </div>
    </div>
  </header>
</template>