<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import BackToTop from '@/components/layout/BackToTop.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background">
    <Navbar v-if="!route.meta.portal" />

    <main class="flex-1">
      <!-- Route transition keeps navigation feeling responsive. -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in" :key="route.path">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <Footer v-if="!route.meta.portal" />

    <BackToTop v-if="!route.meta.portal" />
  </div>
</template>