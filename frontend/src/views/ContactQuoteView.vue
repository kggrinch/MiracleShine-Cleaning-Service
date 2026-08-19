<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ContactQuotePanel from '@/components/contact/ContactQuotePanel.vue'
import QuoteForm from '@/components/sections/QuoteForm.vue'
import BackgroundDecor from '@/components/ui/BackgroundDecor.vue'

/**
 * Shared Contact / Get-a-Quote page.
 *
 * Both `/contact` and `/get-quote` routes render this view - the route name
 * only swaps the intro copy so "Contact" and "Get a Quote" never maintain two
 * separate forms or skeletons. Keep any new fields here so both stay in sync.
 */
const route = useRoute()

const content = computed(() => {
  const isQuote = route.name === 'get-quote'
  return {
    eyebrow: isQuote ? 'Request a quote' : 'Contact us',
    title: isQuote
      ? 'Get a free, tailored cleaning estimate.'
      : "Let's make your space shine.",
    description: isQuote
      ? "Tell us about your property, preferred service, and schedule. We'll follow up with a thoughtful recommendation and a clear, upfront estimate - no pressure."
      : 'Reach out for a personalized estimate, a same-week consultation, or a custom cleaning plan built around your priorities.',
  }
})
</script>

<template>
  <div class="relative overflow-hidden">
    <BackgroundDecor />

    <section class="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
      <ContactQuotePanel
        :eyebrow="content.eyebrow"
        :title="content.title"
        :description="content.description"
      />

      <!-- Compact quote section that sits alongside the intro panel -->
      <QuoteForm compact />
    </section>
  </div>
</template>