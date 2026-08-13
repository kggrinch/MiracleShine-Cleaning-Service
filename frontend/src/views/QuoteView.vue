<script setup lang="ts">
import ContactQuotePanel from '@/components/contact/ContactQuotePanel.vue'
import QuoteForm from '@/components/sections/QuoteForm.vue'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
    <ContactQuotePanel
      eyebrow="Request a quote"
      title="Start with a customized cleaning estimate tailored to your space."
      description="Tell us about your property, preferred service, and schedule. We'll follow up with a thoughtful recommendation and a clear, upfront estimate — no pressure."
    />

    <QuoteForm />
  </section>
</template>