<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { fetchPublicServices, toServiceCard, type CleaningServiceCard } from '@/data/services'
import { getApiErrorMessage } from '@/services/errors'

const services = ref<CleaningServiceCard[]>([])
const isLoading = ref(true)
const loadError = ref('')

onMounted(async () => {
  try {
    services.value = (await fetchPublicServices()).slice(0, 6).map(toServiceCard)
  } catch (error) {
    loadError.value = getApiErrorMessage(error, 'Services could not be loaded. Please try again later.')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section id="services" class="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Our services</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Tailored cleaning plans for homes, offices, and properties that demand excellence.
        </h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Every visit is planned around your needs, schedule, and standards so you can enjoy a cleaner, calmer environment without the stress.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
        <span>Weekly</span><span aria-hidden="true" class="text-primary">&bull;</span><span>Bi-weekly</span><span aria-hidden="true" class="text-primary">&bull;</span><span>One-time</span><span aria-hidden="true" class="text-primary">&bull;</span><span>Custom plans</span>
      </div>
    </div>

    <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <p v-if="isLoading" class="col-span-full text-center text-slate-600" role="status">Loading services…</p>
      <p v-else-if="loadError" class="col-span-full text-center text-red-700" role="alert">{{ loadError }}</p>
      <p v-else-if="services.length === 0" class="col-span-full text-center text-slate-600">No services are available right now.</p>
      <article v-for="service in services" :key="service.id" class="group rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_-25px_rgba(15,23,42,0.35)]">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-primary transition group-hover:scale-105">
          <component :is="service.icon" class="h-6 w-6" />
        </div>

        <h3 class="mt-5 text-xl font-semibold text-slate-900">{{ service.title }}</h3>
        <p class="mt-3 text-[0.95rem] leading-7 text-slate-600">{{ service.description }}</p>
        <p class="mt-3 text-sm font-semibold text-slate-800">
          {{ service.startingPrice === null ? 'Custom quote' : `From $${Number(service.startingPrice).toFixed(2)}` }}
        </p>

        <RouterLink :to="{ name: 'get-quote', query: { serviceId: service.id } }" class="mt-6 inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary-dark">
          Learn More
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </article>
    </div>
  </section>
</template>