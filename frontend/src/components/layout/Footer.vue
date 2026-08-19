<script setup lang="ts">
import { Clock3, Mail, MapPin, Phone, Sparkles } from 'lucide-vue-next'
</script>

<template>
  <footer class="relative overflow-hidden border-t border-slate-200/80 bg-white/90">
    <!-- Faint brand glow along the top edge -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      aria-hidden="true"
    />

    <div class="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr] lg:px-8">
      <div>
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-lg font-semibold text-primary">
            MS
          </div>
          <div>
            <p class="text-lg font-semibold text-slate-900">Miracle Shine Cleaning Service</p>
            <p class="text-sm text-slate-500">Premium cleaning with a personal touch</p>
          </div>
        </div>

        <p class="mt-5 max-w-md text-sm leading-7 text-slate-600">
          We create brighter, healthier, more comfortable spaces for busy families and successful businesses that expect excellence.
        </p>

        <RouterLink
          to="/get-quote"
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          <Sparkles class="h-4 w-4" />
          Get a free quote
        </RouterLink>
      </div>

      <div>
        <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Quick Links</h3>
        <ul class="mt-4 space-y-3 text-sm text-slate-600">
          <li><RouterLink to="/" class="transition hover:text-primary">Home</RouterLink></li>
          <li><RouterLink to="/services" class="transition hover:text-primary">Services</RouterLink></li>
          <li><RouterLink to="/about" class="transition hover:text-primary">About Us</RouterLink></li>
          <li><RouterLink to="/reviews" class="transition hover:text-primary">Reviews</RouterLink></li>
          <li><RouterLink to="/get-quote" class="transition hover:text-primary">Contact</RouterLink></li>
        </ul>
      </div>

      <div>
        <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Contact</h3>
        <ul class="mt-4 space-y-3 text-sm text-slate-600">
          <li class="flex items-center gap-2"><Phone class="h-4 w-4 text-primary" /> (425) 555-1234</li>
          <li class="flex items-center gap-2"><Mail class="h-4 w-4 text-primary" /> info@miracleshinecleaning.com</li>
          <li class="flex items-center gap-2"><MapPin class="h-4 w-4 text-primary" /> Seattle Area, WA</li>
        </ul>
      </div>

      <div>
        <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Business Hours</h3>
        <ul class="mt-4 space-y-3 text-sm text-slate-600">
          <li class="flex items-center gap-2"><Clock3 class="h-4 w-4 text-primary" /> Mon-Fri: 8:00 AM - 6:00 PM</li>
          <li class="flex items-center gap-2"><Clock3 class="h-4 w-4 text-primary" /> Weekend: By appointment</li>
        </ul>
      </div>
    </div>

    <div class="relative border-t border-slate-200/80">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-center text-xs text-slate-400 sm:flex-row sm:text-left lg:px-8">
        <p>&copy; {{ new Date().getFullYear() }} Miracle Shine Cleaning Service. All rights reserved.</p>
        <p>Licensed &amp; insured &middot; Serving the greater Seattle area</p>
      </div>
    </div>
  </footer>
</template>