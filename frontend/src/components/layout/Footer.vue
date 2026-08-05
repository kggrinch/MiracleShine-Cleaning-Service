<script setup lang="ts">
import { Clock3, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-vue-next'
</script>

<template>
  <footer class="border-t border-slate-200/80 bg-white/90">
    <div class="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr] lg:px-8">
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
      </div>

      <div>
        <h3 class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Quick Links</h3>
        <ul class="mt-4 space-y-3 text-sm text-slate-600">
          <li><RouterLink to="/" class="transition hover:text-primary">Home</RouterLink></li>
          <li><RouterLink to="/services" class="transition hover:text-primary">Services</RouterLink></li>
          <li><RouterLink to="/about" class="transition hover:text-primary">About Us</RouterLink></li>
          <li><RouterLink to="/reviews" class="transition hover:text-primary">Reviews</RouterLink></li>
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
          <li class="flex items-center gap-2"><Clock3 class="h-4 w-4 text-primary" /> Mon–Fri: 8:00 AM – 6:00 PM</li>
          <li class="flex items-center gap-2"><Clock3 class="h-4 w-4 text-primary" /> Weekend: By appointment</li>
        </ul>

        <div class="mt-5 flex gap-3">
          <a href="#" class="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-primary hover:text-primary"><Facebook class="h-4 w-4" /></a>
          <a href="#" class="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-primary hover:text-primary"><Instagram class="h-4 w-4" /></a>
        </div>
      </div>
    </div>
  </footer>
</template>
