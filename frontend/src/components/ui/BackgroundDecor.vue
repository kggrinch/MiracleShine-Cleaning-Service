<script setup lang="ts">
/**
 * BackgroundDecor - a reusable, purely decorative layer for sections.
 *
 * Renders soft color glows, a faint dot grid, floating bubbles, and twinkling
 * sparkles that adapt their tint to light or dark sections. Every element is
 * `pointer-events-none` and absolutely positioned, so content painted after it
 * in the DOM always sits on top. Parent section must be `relative overflow-hidden`.
 */
withDefaults(defineProps<{ dark?: boolean }>(), { dark: false })
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden"
    :style="{ '--decor-ink': dark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.14)' }"
    aria-hidden="true"
  >
    <!-- Large blurred glows that give the section gentle depth -->
    <div
      class="decor-blob decor-blob-a"
      :class="dark ? 'bg-sky-400/15' : 'bg-primary/15'"
    />
    <div
      class="decor-blob decor-blob-b"
      :class="dark ? 'bg-accent/10' : 'bg-accent/20'"
    />

    <!-- Faint dot grid, faded toward one edge so it reads as texture -->
    <div class="decor-dots" />

    <!-- Softly rising bubbles -->
    <span class="decor-bubble decor-bubble-1" :class="dark ? 'border-white/20 bg-white/5' : 'border-sky-200/70 bg-sky-100/40'" />
    <span class="decor-bubble decor-bubble-2" :class="dark ? 'border-white/15 bg-white/5' : 'border-sky-200/60 bg-sky-100/30'" />
    <span class="decor-bubble decor-bubble-3" :class="dark ? 'border-accent/25 bg-accent/5' : 'border-accent/60 bg-accent/20'" />

    <!-- Sparkles that softly pulse -->
    <svg class="decor-sparkle decor-sparkle-1 text-primary" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
    </svg>
    <svg class="decor-sparkle decor-sparkle-2 text-accent" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
    </svg>
    <svg class="decor-sparkle decor-sparkle-3 text-primary" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
    </svg>
  </div>
</template>

<style scoped>
/* All decorations start hidden on small screens to keep mobile layouts clean;
   they fade in as the viewport widens. */
.decor-blob,
.decor-dots,
.decor-sparkle {
  opacity: 0;
}
@media (min-width: 1024px) {
  .decor-blob,
  .decor-dots,
  .decor-sparkle {
    opacity: 1;
  }
}

/* --- Soft color glows --------------------------------------------------- */
.decor-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
  animation: decor-drift 18s ease-in-out infinite alternate;
}
.decor-blob-a {
  top: -8rem;
  right: -6rem;
  width: 26rem;
  height: 26rem;
}
.decor-blob-b {
  bottom: -10rem;
  left: -8rem;
  width: 22rem;
  height: 22rem;
  animation-delay: -6s;
}

/* --- Dot grid texture ---------------------------------------------------- */
.decor-dots {
  position: absolute;
  top: 2.5rem;
  left: -3rem;
  width: 15rem;
  height: 15rem;
  background-image: radial-gradient(var(--decor-ink) 1.2px, transparent 1.3px);
  background-size: 20px 20px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 72%);
}

/* --- Floating bubbles ----------------------------------------------------- */
.decor-bubble {
  position: absolute;
  border-radius: 9999px;
  border-width: 1px;
  animation: decor-rise 9s ease-in-out infinite;
}
.decor-bubble-1 {
  top: 22%;
  right: 12%;
  width: 3.25rem;
  height: 3.25rem;
}
.decor-bubble-2 {
  top: 48%;
  left: 6%;
  width: 2.25rem;
  height: 2.25rem;
  animation-delay: -3s;
}
.decor-bubble-3 {
  right: 6%;
  bottom: 18%;
  width: 1.75rem;
  height: 1.75rem;
  animation-delay: -5.5s;
}

/* --- Sparkles -------------------------------------------------------------- */
.decor-sparkle {
  position: absolute;
  width: 1rem;
  height: 1rem;
  animation: decor-twinkle 5s ease-in-out infinite;
}
.decor-sparkle-1 {
  top: 38%;
  right: 22%;
}
.decor-sparkle-2 {
  top: 16%;
  left: 42%;
  width: 0.75rem;
  height: 0.75rem;
  animation-delay: -1.4s;
}
.decor-sparkle-3 {
  bottom: 24%;
  left: 20%;
  width: 0.9rem;
  height: 0.9rem;
  animation-delay: -3.2s;
}

/* --- Keyframes & motion preference ---------------------------------------- */
@keyframes decor-drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(-24px, 20px, 0) scale(1.06);
  }
}
@keyframes decor-rise {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-14px) scale(1.04);
  }
}
@keyframes decor-twinkle {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.9) rotate(0deg);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.1) rotate(12deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .decor-blob,
  .decor-bubble,
  .decor-sparkle {
    animation: none;
  }
}
</style>