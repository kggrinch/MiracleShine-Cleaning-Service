<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import BackToTop from '@/components/layout/BackToTop.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background">
    <Navbar />

    <main class="flex-1">
      <!-- Route transition keeps navigation feeling responsive. -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in" :key="route.path">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <Footer />

    <BackToTop />
  </div>
</template>