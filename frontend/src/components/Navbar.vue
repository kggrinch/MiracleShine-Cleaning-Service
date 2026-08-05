<script setup lang="ts">
import { RouterLink } from 'vue-router'

const links = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
]
</script>

<template>
  <header class="sticky-top border-bottom bg-body bg-opacity-75" style="backdrop-filter: blur(16px);">
    <div class="container-fluid d-flex flex-wrap align-items-center justify-content-between px-4 py-3">
      <RouterLink to="/" class="d-flex align-items-center gap-3 text-decoration-none">
        <div class="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold" style="width:44px; height:44px;">
          M
        </div>
        <div>
          <p class="text-uppercase small mb-0 text-primary">MiracleShine</p>
          <p class="mb-0 fw-semibold text-dark">Cleaning Service</p>
        </div>
      </RouterLink>

      <nav class="d-none d-md-flex align-items-center gap-4">
        <RouterLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          class="nav-link text-muted px-2"
          active-class="active"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <a href="#contact" class="btn btn-primary d-none d-md-inline-flex">
        Get a Quote
      </a>
    </div>
  </header>
</template>
