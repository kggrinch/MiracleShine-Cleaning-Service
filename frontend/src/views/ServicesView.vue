<script setup lang="ts">
import { ArrowRight, BriefcaseBusiness, Building2, BrushCleaning, CalendarCheck, HousePlus, PhoneCall, Sparkles, Sprout } from 'lucide-vue-next'
import PageBanner from '@/components/layout/PageBanner.vue'

type Service = {
  title: string
  description: string
  icon: unknown
  includes: string[]
}

const services: Service[] = [
  {
    title: 'Office & Commercial Cleaning',
    description: 'Consistent professional upkeep for workplaces that need to stay meeting-ready every single day.',
    icon: Building2,
    includes: ['Workstations & desks', 'Meeting & conference rooms', 'Reception & common areas', 'High-touch point care'],
  },
  {
    title: 'Janitorial Care',
    description: 'Reliable recurring service that keeps restrooms, breakrooms, and shared facilities clean and cared for.',
    icon: BriefcaseBusiness,
    includes: ['Restroom cleaning & restocking', 'Breakroom & kitchen surfaces', 'Trash removal', 'Daily or weekly visits'],
  },
  {
    title: 'Deep Cleaning',
    description: 'A meticulous reset for high-traffic rooms, overlooked corners, and seasonal refreshes that need extra attention.',
    icon: Sparkles,
    includes: ['Baseboards & trim', 'Light fixtures & vents', 'Interior glass', 'Detailed surface care'],
  },
  {
    title: 'Move In / Move Out',
    description: 'A polished turnover service that helps landlords, tenants, and property managers leave a spotless space behind.',
    icon: BrushCleaning,
    includes: ['Full home or unit reset', 'Kitchens & bathrooms', 'Cabinets & appliances', 'Detailed final inspection'],
  },
  {
    title: 'Restroom & Breakroom Service',
    description: 'Focused care for the spaces your team and visitors use most, kept fresh, stocked, and hygienic.',
    icon: HousePlus,
    includes: ['Sanitizing high-touch points', 'Mirrors & fixtures', 'Floor & vanity care', 'Supply restocking'],
  },
  {
    title: 'Disinfection & Specialized Care',
    description: 'Extra attention for events, post-construction cleanup, and environments that call for elevated cleanliness.',
    icon: Sprout,
    includes: ['Post-construction cleanup', 'Event prep & teardown', 'Enhanced sanitizing', 'Custom service plans'],
  },
]

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
  <section class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
    <PageBanner
      eyebrow="Our services"
      title="Commercial cleaning plans built around the way you work."
      description="From daily office upkeep to thorough deep cleans and move-outs, every plan is tailored to your property, your schedule, and your standards."
    >
      <div class="flex flex-col gap-3 sm:flex-row">
        <RouterLink
          to="/get-quote"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Request a Quote
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
        <RouterLink
          to="/contact"
          class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-primary hover:text-primary-dark"
        >
          Talk to our team
        </RouterLink>
      </div>
    </PageBanner>

    <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="service in services"
        :key="service.title"
        class="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_-25px_rgba(15,23,42,0.35)]"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-primary">
          <component :is="service.icon" class="h-6 w-6" />
        </div>

        <h2 class="mt-5 text-xl font-semibold text-slate-900">{{ service.title }}</h2>
        <p class="mt-3 text-[0.95rem] leading-7 text-slate-600">{{ service.description }}</p>

        <ul class="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
          <li v-for="item in service.includes" :key="item" class="flex items-start gap-2">
            <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {{ item }}
          </li>
        </ul>

        <RouterLink to="/get-quote" class="mt-6 inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary-dark">
          Get this service
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </article>
    </div>

    <div class="mt-24">
      <div class="max-w-2xl">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">How it works</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          A simple process, from first call to spotless finish.
        </h2>
      </div>

      <div class="mt-10 grid gap-6 md:grid-cols-3">
        <div v-for="(step, index) in steps" :key="step.title" class="relative rounded-[1.75rem] border border-slate-200 bg-slate-50 p-7">
          <span class="absolute right-6 top-6 text-5xl font-semibold text-slate-200">{{ index + 1 }}</span>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            <component :is="step.icon" class="h-6 w-6" />
          </div>
          <h3 class="mt-5 text-xl font-semibold text-slate-900">{{ step.title }}</h3>
          <p class="mt-3 text-sm leading-7 text-slate-600">{{ step.description }}</p>
        </div>
      </div>
    </div>

    <div class="mt-24">
      <PageBanner
        eyebrow="Ready to get started?"
        title="Your space deserves a cleaner, more polished finish."
        description="Tell us what you need and we'll put together a tailored estimate with clear pricing and a schedule that works for you."
      >
        <RouterLink
          to="/get-quote"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark"
        >
          Request a free quote
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </PageBanner>
    </div>
  </section>
</template>
