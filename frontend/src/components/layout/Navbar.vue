<script setup lang="ts">

import { Phone, Mail } from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
import logo from '@/assets/images/main_logo.png'

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

        <div
            class="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-sm">

            <div class="flex items-center gap-6">


                <!-- PHONE -->

                <div class="flex items-center gap-2">

                    <Phone 
                        :size="16"
                        stroke-width="2"
                    />

                    <span>{{ company.phone }}</span>

                </div>


                <!-- EMAIL -->

                <div class="flex items-center gap-2">

                    <Mail 
                        :size="16"
                        stroke-width="2"
                    />

                    <span>{{ company.email }}</span>

                </div>


            </div>


            <!-- SOCIAL MEDIA -->

            <div class="flex gap-4">


                <!-- FACEBOOK -->

                <a href="#" class="hover:text-gray-200">

                    <Icon 
                        icon="mdi:facebook"
                        width="20"
                    />

                </a>


                <!-- INSTAGRAM -->

                <a href="#" class="hover:text-gray-200">

                    <Icon 
                        icon="mdi:instagram"
                        width="20"
                    />

                </a>


                <!-- GOOGLE REVIEWS -->

                <a href="#" class="hover:text-gray-200">

                    <Icon 
                        icon="mdi:google"
                        width="20"
                    />

                </a>


            </div>

        </div>

    </section>



    <!-- ================= Main Navigation ================= -->

    <nav class="border-b bg-white shadow-sm">

        <div
            class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">


            <!-- COMPANY LOGO -->

            <RouterLink
                to="/"
                class="flex items-center gap-4">


                <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">

                    <img 
                        :src="logo" 
                        alt="Company Logo"
                        class="h-full w-full object-cover"
                    />

                </div>


                <div>

                    <h1 class="text-2xl font-bold text-primary-dark">

                        MiracleShine

                    </h1>


                    <p class="text-sm tracking-wide text-gray-500">

                        Cleaning Services

                    </p>

                </div>


            </RouterLink>



            <!-- NAV LINKS -->

            <div class="flex items-center gap-8">


                <RouterLink
                    v-for="link in links"
                    :key="link.name"
                    :to="link.to"
                    class="font-medium text-gray-700 transition hover:text-primary-dark">

                    {{ link.name }}

                </RouterLink>


            </div>



            <!-- QUOTE BUTTON -->

            <button
                class="rounded-lg bg-accent px-6 py-3 font-semibold text-gray-900 transition hover:bg-accent-dark">

                Free Quote

            </button>


        </div>

    </nav>

</template>