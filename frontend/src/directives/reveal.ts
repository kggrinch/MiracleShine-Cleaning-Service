import type { Directive } from 'vue'

/**
 * Applies the shared reveal class without allowing off-screen content to reserve
 * invisible layout space. Page content remains visible for direct links, anchor
 * navigation, fast scrolling, and reduced-motion visitors.
 */
export const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal')
    const delay = typeof binding.value === 'number' && binding.value > 0 ? binding.value : 0
    if (delay) el.style.transitionDelay = `${delay}ms`

    requestAnimationFrame(() => {
      el.classList.add('is-revealed')
    })
  },
}