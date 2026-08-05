<script setup lang="ts">
import { Mail, MapPin, Phone } from 'lucide-vue-next'
import QuoteForm from '@/components/sections/QuoteForm.vue'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-20 lg:px-8">
    <div class="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-10">
      <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Contact us</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Let’s make your space shine.</h1>
          <p class="mt-5 text-lg leading-8 text-slate-600">
            Reach out for a personalized estimate, a same-week consultation, or a custom cleaning plan built around your priorities.
          </p>

          <div class="mt-8 space-y-4">
            <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Phone class="h-5 w-5 text-primary" />
              <a href="tel:4255551234" class="font-medium text-slate-700">(425) 555-1234</a>
            </div>
            <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Mail class="h-5 w-5 text-primary" />
              <a href="mailto:info@miracleshinecleaning.com" class="font-medium text-slate-700">info@miracleshinecleaning.com</a>
            </div>
            <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <MapPin class="h-5 w-5 text-primary" />
              <span class="font-medium text-slate-700">Serving the Seattle area with precision and care</span>
            </div>
          </div>
        </div>

        <div class="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white">
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Service availability</p>
          <h2 class="mt-3 text-2xl font-semibold">Flexible appointments for homes and businesses</h2>
          <p class="mt-4 text-sm leading-7 text-slate-300">
            We offer weekday, evening, and recurring service options to fit the rhythm of your home or team.
          </p>
        </div>
      </div>
    </div>

    <QuoteForm />
  </section>
</template>
