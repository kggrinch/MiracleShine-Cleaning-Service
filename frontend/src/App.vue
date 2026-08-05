<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="min-vh-100 d-flex flex-column bg-light">

    <Navbar />

    <main class="flex-fill">
      <router-view />
    </main>

    <Footer />

  </div>
</template>