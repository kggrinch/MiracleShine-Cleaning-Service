<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">

    <Navbar />

    <main class="flex-1">
      <router-view />
    </main>

    <Footer />

  </div>
</template>