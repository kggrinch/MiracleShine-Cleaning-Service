<script setup lang="ts">
import ContactQuotePanel from '@/components/contact/ContactQuotePanel.vue'
import QuoteForm from '@/components/sections/QuoteForm.vue'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
    <ContactQuotePanel
      eyebrow="Contact us"
      title="Let's make your space shine."
      description="Reach out for a personalized estimate, a same-week consultation, or a custom cleaning plan built around your priorities."
    />

    <QuoteForm />
  </section>
</template>
