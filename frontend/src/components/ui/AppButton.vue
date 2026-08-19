<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'light' | 'dark'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    /** Route to navigate to (renders a RouterLink). */
    to?: string
    /** External href (renders an anchor). */
    href?: string
    variant?: ButtonVariant
    size?: ButtonSize
    /** Full-width on small screens when true. */
    block?: boolean
    /** Appends a slide-on-hover arrow icon after the slot content. */
    arrow?: boolean
    type?: 'button' | 'submit'
    ariaLabel?: string
  }>(),
  { variant: 'primary', size: 'md', block: false, arrow: false, type: 'button', ariaLabel: undefined },
)

const base =
  'group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'transition-all duration-300 will-change-transform ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' +
  'active:translate-y-0 disabled:pointer-events-none disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-[0_10px_30px_-12px_rgba(54,180,229,0.8)] ' +
    'hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-[0_14px_34px_-12px_rgba(54,180,229,0.9)]',
  outline:
    'border border-slate-300 bg-white text-slate-700 ' +
    'hover:border-primary hover:text-primary-dark hover:shadow-[0_10px_26px_-16px_rgba(54,180,229,0.55)]',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-primary-dark',
  light: 'bg-white text-slate-900 shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-sky-50',
  dark: 'bg-slate-950 text-white shadow-lg shadow-black/20 hover:-translate-y-0.5 hover:bg-slate-800',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

const classes = computed(() => [
  base,
  variants[props.variant],
  sizes[props.size],
  props.block ? 'w-full' : 'inline-flex',
].join(' '))
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes" :aria-label="ariaLabel">
    <slot />
    <ArrowRight v-if="arrow" class="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
  </RouterLink>
  <a v-else-if="href" :href="href" :class="classes" :aria-label="ariaLabel">
    <slot />
    <ArrowRight v-if="arrow" class="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
  </a>
  <button v-else :type="type" :class="classes" :aria-label="ariaLabel">
    <slot />
    <ArrowRight v-if="arrow" class="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
  </button>
</template>