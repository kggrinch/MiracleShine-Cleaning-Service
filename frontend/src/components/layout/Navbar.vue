<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Phone, Sparkles, X } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'

const route = useRoute()

// Primary navigation. "Services" is a plain top-level link that navigates
// directly to the services page - there is no dropdown or submenu.
const links = [
  { name: 'Home', to: '/' },
  { name: 'Services', to: '/services' },
  { name: 'About Us', to: '/about' },
  { name: 'Reviews', to: '/reviews' },
  { name: 'Contact', to: '/get-quote' },
]

const mobileMenuOpen = ref(false)

/** Close the mobile menu whenever the route changes so stale panels never linger. */
watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

// Shared underline-animated styles for the desktop nav links.
const desktopLinkClass =
  'after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:origin-left after:rounded-full ' +
  'after:bg-primary after:transition-transform after:duration-300 relative text-sm font-medium text-slate-700 ' +
  'transition-colors duration-200 hover:text-primary'
const desktopLinkIdle = 'after:scale-x-0 hover:after:scale-x-100'
const desktopLinkActive = 'text-primary after:scale-x-100'
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
      <RouterLink to="/" class="group flex items-center gap-3" aria-label="Miracle Shine Cleaning Service - Home">
        <img
          src="/m_logo.png"
          alt="Miracle Shine Cleaning"
          class="h-12 w-40 rounded-xl object-cover object-[center_50%] shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
      </RouterLink>

            <!-- Desktop nav -->
      <nav class="hidden items-center gap-8 lg:flex" aria-label="Primary">
        <RouterLink
          v-for="link in links"
          :key="link.name"
          :to="link.to"
          :class="[desktopLinkClass, route.path === link.to ? desktopLinkActive : desktopLinkIdle]"
          active-class="text-primary after:scale-x-100"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 lg:flex">
        <a
          href="tel:4255551234"
          class="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
        >
          <Phone class="h-4 w-4" />
          (425) 555-1234
        </a>
        <AppButton to="/get-quote" size="sm">
          <Sparkles class="h-4 w-4" />
          Get a Quote
        </AppButton>
      </div>

      <button
        class="rounded-full border border-slate-200 p-2 text-slate-700 transition hover:border-primary hover:text-primary lg:hidden"
        :aria-expanded="mobileMenuOpen"
        :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
        aria-controls="mobile-menu"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <Menu v-if="!mobileMenuOpen" class="h-5 w-5" />
        <X v-else class="h-5 w-5" />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-show="mobileMenuOpen" id="mobile-menu" class="border-t border-slate-200 bg-white px-6 py-4 shadow-xl shadow-slate-200/50 lg:hidden">
        <div class="flex flex-col gap-1">
          <RouterLink
            v-for="link in links"
            :key="link.name"
            :to="link.to"
            class="rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-primary"
            active-class="bg-sky-50 text-primary font-semibold"
            @click="mobileMenuOpen = false"
          >
            {{ link.name }}
                    </RouterLink>

          <AppButton to="/get-quote" variant="primary" block class="mt-3 mb-4" @click="mobileMenuOpen = false">
            <Sparkles class="h-4 w-4" />
            Get a Quote
          </AppButton>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* Mobile menu slide-down. The desktop Services dropdown and the mobile
   "Explore services" submenu have both been removed, so their transition
   classes are gone too. */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
  transform-origin: top;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: none;
  }
}
</style>