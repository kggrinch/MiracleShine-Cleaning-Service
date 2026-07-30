<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_40%),linear-gradient(135deg,_#f8fbff_0%,_#eef5ff_100%)] text-slate-900">
    <Navbar />
    <main class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <RouterView />
    </main>
  </div>
</template>