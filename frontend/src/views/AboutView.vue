<script setup lang="ts">
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-vue-next'
import PageBanner from '@/components/layout/PageBanner.vue'

type Stat = {
  label: string
  value: string
}

const stats: Stat[] = [
  { value: 'Licensed & Insured', label: 'Professional, protected service' },
  { value: 'Detail-Driven', label: 'Every corner, every visit' },
  { value: 'Flexible Plans', label: 'One-time, weekly, or recurring' },
  { value: 'Seattle Area', label: 'Locally focused & responsive' },
]

type Value = {
  title: string
  description: string
  icon: unknown
}

const values: Value[] = [
  {
    title: 'Attention to detail',
    description: 'We treat every finish, fixture, and corner with the same care we would want in our own space.',
    icon: Sparkles,
  },
  {
    title: 'Reliable standards',
    description: 'Consistent, dependable service you can count on — visit after visit, without surprises.',
    icon: ShieldCheck,
  },
  {
    title: 'Customer-first approach',
    description: 'We listen closely and shape every plan around your priorities, feedback, and schedule.',
    icon: HeartHandshake,
  },
  {
    title: 'Cleaner, healthier spaces',
    description: 'A genuinely clean environment supports comfort, focus, and peace of mind for everyone inside.',
    icon: BadgeCheck,
  },
]
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
    <PageBanner
      eyebrow="About us"
      title="A local cleaning company built on trust, consistency, and care."
      description="Miracle Shine Cleaning Service exists to give busy families and successful businesses the gift of a space that feels genuinely refreshed — handled with respect and finished with pride."
    />

    <div class="mt-12 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div class="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]">
        <img
          src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80"
          alt="A refined, professionally cleaned interior"
          class="h-full min-h-[360px] w-full object-cover"
        />
      </div>

      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Our story & mission</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          We bring order, polish, and peace of mind to every visit.
        </h2>
        <p class="mt-5 text-lg leading-8 text-slate-600">
          Miracle Shine was founded on a simple belief: a truly well-kept space can change the way a home feels and the way a business operates. We combine professional training with a genuine, personal approach so every job is finished to a standard we'd be proud to stand behind.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Whether it's a daily office refresh or a thorough move-out reset, we show up on time, respect your space, and never stop until the details are right.
        </p>

        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center gap-2 text-primary">
              <ShieldCheck class="h-5 w-5" />
              <span class="font-semibold text-slate-900">Trained professionals</span>
            </div>
            <p class="mt-2 text-sm leading-7 text-slate-600">Polished results delivered with a calm, respectful approach.</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex items-center gap-2 text-primary">
              <HeartHandshake class="h-5 w-5" />
              <span class="font-semibold text-slate-900">Built on relationships</span>
            </div>
            <p class="mt-2 text-sm leading-7 text-slate-600">Many clients start with us and stay for years of dependable care.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-16 grid gap-5 rounded-[2.5rem] border border-slate-200 bg-slate-950 p-8 text-white sm:grid-cols-2 lg:grid-cols-4 lg:p-10">
      <div v-for="stat in stats" :key="stat.label">
        <p class="text-2xl font-semibold text-sky-300">{{ stat.value }}</p>
        <p class="mt-1 text-sm text-slate-300">{{ stat.label }}</p>
      </div>
    </div>

    <div class="mt-24">
      <div class="max-w-2xl">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">What we stand for</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Why customers choose Miracle Shine, again and again.
        </h2>
      </div>

      <div class="mt-10 grid gap-6 md:grid-cols-2">
        <article
          v-for="value in values"
          :key="value.title"
          class="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_15px_45px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-primary">
            <component :is="value.icon" class="h-6 w-6" />
          </div>
          <h3 class="mt-5 text-xl font-semibold text-slate-900">{{ value.title }}</h3>
          <p class="mt-3 text-[0.95rem] leading-7 text-slate-600">{{ value.description }}</p>
        </article>
      </div>
    </div>

    <div class="mt-24">
      <PageBanner
        eyebrow="See the difference"
        title="Experience a space that's cleaned with genuine care."
        description="Tell us about your home or business and we'll put together a tailored plan that fits your schedule and standards."
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
