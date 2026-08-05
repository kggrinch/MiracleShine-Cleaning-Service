<script setup lang="ts">
import { Mail, Phone, Send } from 'lucide-vue-next'
</script>

<template>
  <section id="quote" class="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
    <div class="grid gap-8 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_-28px_rgba(2,8,23,0.65)] lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
      <div class="flex flex-col justify-center">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Free quote</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get your free cleaning quote today.
        </h2>
        <p class="mt-5 max-w-xl text-lg leading-8 text-slate-300">
          Share a few details about your property and preferred service, and we’ll follow up with a tailored estimate that fits your schedule and standards.
        </p>

        <div class="mt-8 space-y-4">
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
            <Phone class="h-5 w-5 text-sky-300" />
            <span>(425) 555-1234</span>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
            <Mail class="h-5 w-5 text-sky-300" />
            <span>info@miracleshinecleaning.com</span>
          </div>
        </div>
      </div>

      <form class="rounded-[2rem] bg-white p-6 text-slate-900 shadow-xl shadow-black/10 sm:p-8">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="block text-sm font-medium text-slate-700">
            First Name
            <input class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="Jordan" />
          </label>
          <label class="block text-sm font-medium text-slate-700">
            Last Name
            <input class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="Lee" />
          </label>
          <label class="block text-sm font-medium text-slate-700">
            Phone
            <input class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="(555) 123-4567" />
          </label>
          <label class="block text-sm font-medium text-slate-700">
            Email
            <input class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="you@example.com" />
          </label>
        </div>

        <label class="mt-4 block text-sm font-medium text-slate-700">
          Address
          <input class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="123 Main Street" />
        </label>

        <label class="mt-4 block text-sm font-medium text-slate-700">
          Cleaning Type
          <select class="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary">
            <option>Residential Cleaning</option>
            <option>Commercial Cleaning</option>
            <option>Deep Cleaning</option>
            <option>Move In / Move Out</option>
          </select>
        </label>

        <label class="mt-4 block text-sm font-medium text-slate-700">
          Message
          <textarea class="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary" placeholder="Tell us about your space and scheduling needs." />
        </label>

        <button class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark">
          Request Quote
          <Send class="h-4 w-4" />
        </button>
      </form>
    </div>
  </section>
</template>