<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight, BadgeCheck, Clock3, ShieldCheck, Sparkles, Star } from 'lucide-vue-next'

const imageFrame = ref<HTMLElement | null>(null)
let raf = 0

const reduceMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

function updateParallax() {
  const el = imageFrame.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const center = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  const delta = rect.top + rect.height / 2 - center
  // Gentle, bounded drift so the image never detaches from its frame.
  const y = Math.max(-32, Math.min(32, delta * -0.05))
  el.style.transform = `translate3d(0, ${y}px, 0)`
}

function onScroll() {
  if (reduceMotion) return
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(updateParallax)
}

onMounted(() => {
  if (reduceMotion) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  updateParallax()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <section class="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(54,180,229,0.2),_transparent_32%),linear-gradient(135deg,_#f8fcfe_0%,_#eef6ff_45%,_#fdfefe_100%)]">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(247,231,51,0.16),_transparent_30%)]" />
    <div class="absolute right-[-10rem] top-24 hidden h-96 w-96 rounded-full bg-primary/10 blur-3xl lg:block" />

    <div class="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8 lg:py-24">
      <div class="grid gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div class="flex flex-col justify-center">
          <div class="hero-fade hero-fade-1 inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            <BadgeCheck class="h-4 w-4" />
            Commercial & residential cleaning specialists
          </div>

          <h1 class="hero-fade hero-fade-2 mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Professional commercial cleaning you can trust.
          </h1>

          <p class="hero-fade hero-fade-3 mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Miracle Shine delivers polished, dependable cleaning for offices, facilities, and homes — with detail-driven service and a satisfaction guarantee on every visit.
          </p>

          <div class="hero-fade hero-fade-4 mt-8 flex flex-col gap-3 sm:flex-row">
            <RouterLink
              to="/get-quote"
              class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              Get a Quote
              <ArrowRight class="h-4 w-4 shrink-0" />
            </RouterLink>

            <RouterLink
              to="/services"
              class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-primary hover:text-primary-dark"
            >
              View Services
            </RouterLink>
          </div>

          <div class="hero-fade hero-fade-5 mt-10 grid gap-4 sm:grid-cols-3">
            <div class="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <ShieldCheck class="h-4 w-4 shrink-0 text-primary" />
              <span class="font-semibold text-slate-900">Licensed &amp; Insured</span>
            </div>
            <div class="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <Clock3 class="h-4 w-4 shrink-0 text-primary" />
              <span class="font-semibold text-slate-900">Flexible Scheduling</span>
            </div>
            <div class="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <BadgeCheck class="h-4 w-4 shrink-0 text-primary" />
              <span class="font-semibold text-slate-900">Satisfaction Focused</span>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute inset-x-2 -inset-y-2 -rotate-1 rounded-[2.2rem] bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />

          <div ref="imageFrame" class="hero-frame reveal relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-2 shadow-2xl shadow-slate-300/70">
            <img
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80"
              alt="A pristine modern commercial office, cleaned and ready for the day"
              class="kenburns h-[400px] w-full rounded-[1.6rem] object-cover sm:h-[500px]"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </div>

          <div class="hero-float absolute right-4 top-6 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-primary">
              <Sparkles class="h-4 w-4" />
            </div>
            <div>
              <p class="text-sm font-semibold leading-tight text-slate-900">Satisfaction guaranteed</p>
              <p class="text-xs text-slate-600">Backed on every visit</p>
            </div>
          </div>

          <div class="hero-float-delay absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
            <div class="flex items-center gap-1 text-accent">
              <Star v-for="n in 5" :key="n" class="h-4 w-4 fill-current" />
            </div>
            <p class="mt-1 text-sm font-semibold leading-tight text-slate-900">4.9/5 average rating</p>
            <p class="text-xs text-slate-600">Trusted by households &amp; businesses</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Staggered entrance for the copy */
@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-fade {
  opacity: 0;
  animation: hero-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.hero-fade-1 {
  animation-delay: 0.08s;
}
.hero-fade-2 {
  animation-delay: 0.16s;
}
.hero-fade-3 {
  animation-delay: 0.24s;
}
.hero-fade-4 {
  animation-delay: 0.32s;
}
.hero-fade-5 {
  animation-delay: 0.4s;
}

/* Image frame: clip-path reveal + scroll drift */
.hero-frame {
  will-change: transform;
  animation: hero-reveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}
@keyframes hero-reveal {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

/* Gentle continuous move inside the frame */
.kenburns {
  animation: kenburns 26s ease-in-out alternate infinite;
  transform-origin: center;
}
@keyframes kenburns {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

/* Soft floating badges */
@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-9px);
  }
}
.hero-float {
  animation: hero-float 6s ease-in-out infinite;
}
.hero-float-delay {
  animation: hero-float 7s ease-in-out 0.6s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-fade {
    animation: none;
    opacity: 1;
  }
  .hero-frame {
    animation: none;
    clip-path: inset(0 0 0 0);
  }
  .kenburns,
  .hero-float,
  .hero-float-delay {
    animation: none;
  }
}
</style>