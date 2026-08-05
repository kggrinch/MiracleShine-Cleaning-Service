<script setup lang="ts">

import { Phone, Mail } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
import logo from '@/assets/images/m_logo.png'

const company = {
    name: "MiracleShine Cleaning",
    phone: "(425) 555-1234",
    email: "info@miracleshinecleaning.com"
}

const links = [
    { name: "Home", to: "/" },
    { name: "Services", to: "/services" },
    { name: "About", to: "/about" },
    { name: "Reviews", to: "/reviews" },
    { name: "Contact", to: "/contact" }
]

</script>

<template>
    <!-- ================= Top Contact Bar ================= -->

    <section class="bg-primary text-white">
        <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between px-3 py-2">
            <div class="d-flex flex-column flex-md-row align-items-center gap-3">
                <div class="d-flex align-items-center gap-2">
                    <Phone :size="16" stroke-width="2" />
                    <span>{{ company.phone }}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <Mail :size="16" stroke-width="2" />
                    <span>{{ company.email }}</span>
                </div>
            </div>

            <div class="d-flex gap-3 mt-3 mt-md-0">
                <a href="#" class="text-white text-decoration-none">
                    <Icon icon="mdi:facebook" width="20" />
                </a>
                <a href="#" class="text-white text-decoration-none">
                    <Icon icon="mdi:instagram" width="20" />
                </a>
                <a href="#" class="text-white text-decoration-none">
                    <Icon icon="mdi:google" width="20" />
                </a>
            </div>
        </div>
    </section>

    <!-- ================= Main Navigation =================  -->

    <nav class="navbar navbar-expand-lg navbar-light bg-body border-bottom shadow-sm">
        <div class="container py-3">
            <RouterLink to="/" class="navbar-brand d-flex align-items-center gap-3">
                <div class="d-flex align-items-center justify-content-center rounded-3 bg-secondary text-white" style="width: 75px; height: 75px;">
                    <img :src="logo" alt="Company Logo" class="img-fluid" />
                </div>
                <div>
                    <h1 class="h5 mb-0 text-primary">MiracleShine Cleaning Service</h1>
                    <p class="mb-0 small text-muted">Cleaning Services</p>
                </div>
            </RouterLink>

            <div class="d-flex align-items-center gap-3">
                <nav class="d-none d-md-flex align-items-center gap-3">
                    <RouterLink
                        v-for="link in links"
                        :key="link.name"
                        :to="link.to"
                        class="nav-link px-2 text-muted"
                        active-class="active"
                    >
                        {{ link.name }}
                    </RouterLink>
                </nav>
                <a href="#contact" class="btn btn-outline-primary d-none d-md-inline-flex">
                    Free Quote
                </a>
            </div>
        </div>
    </nav>
</template>