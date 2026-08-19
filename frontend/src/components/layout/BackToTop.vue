<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

// Floating "back to top" affordance - visible only after meaningful scroll.
const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 480
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-if="visible"
      type="button"
      aria-label="Back to top"
      class="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-sky-300/60 transition duration-300 hover:-translate-y-1 hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      @click="scrollToTop"
    >
      <ArrowUp class="h-5 w-5" />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top-enter-active,
  .back-to-top-leave-active {
    transition: none;
  }
}
</style>