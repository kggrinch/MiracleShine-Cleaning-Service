<script setup lang="ts">
import { CalendarCheck, PhoneCall, Sparkles } from 'lucide-vue-next'
import { services } from '@/data/services'
import ServiceCard from '@/components/services/ServiceCard.vue'
import PageBanner from '@/components/layout/PageBanner.vue'
import BackgroundDecor from '@/components/ui/BackgroundDecor.vue'
import AppButton from '@/components/ui/AppButton.vue'

// Step-by-step "how it works" strip that turns interest into action.
const steps = [
  {
    title: 'Request a quote',
    description: 'Share a few details about your space, priorities, and preferred schedule through our quick form.',
    icon: PhoneCall,
  },
  {
    title: 'We build your plan',
    description: 'We follow up with a clear, tailored estimate and a cleaning plan that fits your rhythm and standards.',
    icon: CalendarCheck,
  },
  {
    title: 'Enjoy a polished space',
    description: 'Our team delivers dependable, detail-driven service — then backs it with a satisfaction guarantee.',
    icon: Sparkles,
  },
]
</script>

<template>
  <div class="relative overflow-hidden">
    <BackgroundDecor />

    <section class="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
      <PageBanner
        eyebrow="Our services"
        title="Commercial cleaning plans built around the way you work."
        description="From daily office upkeep to thorough deep cleans and move-outs, every plan is tailored to your property, your schedule, and your standards."
      >
        <div class="flex flex-col gap-3 sm:flex-row">
          <AppButton to="/get-quote" arrow>
            Request a Quote
          </AppButton>
          <AppButton to="/get-quote" variant="outline">
            Talk to our team
          </AppButton>
        </div>
      </PageBanner>

      <!-- Every service card shares the same data + component as the home grid -->
      <div class="mt-12 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="(service, index) in services"
          :id="service.slug"
          :key="service.slug"
          class="scroll-mt-24"
          v-reveal="(index % 3) * 90"
        >
          <ServiceCard :service="service" detailed />
        </div>
      </div>

      <div class="mt-16 sm:mt-20">
        <div class="max-w-2xl">
          <p v-reveal class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">How it works</p>
          <h2 v-reveal="80" class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            A simple process, from first call to spotless finish.
          </h2>
        </div>

        <div class="mt-10 grid gap-6 md:grid-cols-3">
          <div
            v-for="(step, index) in steps"
            :key="step.title"
            v-reveal="index * 100"
            class="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:bg-white hover:shadow-[0_25px_60px_-30px_rgba(54,180,229,0.6)]"
          >
            <span class="absolute right-6 top-6 text-5xl font-semibold text-slate-200 transition-colors duration-300 group-hover:text-sky-100">{{ index + 1 }}</span>
            <div class="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm transition-transform duration-300 group-hover:scale-110">
              <component :is="step.icon" class="h-6 w-6" />
            </div>
            <h3 class="mt-5 text-xl font-semibold text-slate-900">{{ step.title }}</h3>
            <p class="mt-3 text-sm leading-7 text-slate-600">{{ step.description }}</p>
          </div>
        </div>
      </div>

      <div class="mt-16 sm:mt-20">
        <PageBanner
          eyebrow="Ready to get started?"
          title="Your space deserves a cleaner, more polished finish."
          description="Tell us what you need and we'll put together a tailored estimate with clear pricing and a schedule that works for you."
        >
          <AppButton to="/get-quote" arrow>
            Request a free quote
          </AppButton>
        </PageBanner>
      </div>
    </section>
  </div>
</template>