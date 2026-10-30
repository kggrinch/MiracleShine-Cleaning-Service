<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Building2, CalendarDays, ClipboardList, Home, LogOut, Mail, Settings, Sparkles, Star } from 'lucide-vue-next'
import { currentUser, signOut } from '@/services/auth'

const route = useRoute()
const router = useRouter()
const isAdmin = computed(() => currentUser.value?.role === 'ADMIN')
const navigation = computed(() =>
  isAdmin.value
    ? [
        { label: 'Overview', path: '/admin', icon: Home },
        { label: 'Quote requests', path: '/admin/quotes', icon: ClipboardList },
        { label: 'Services', path: '/admin/services', icon: Sparkles },
        { label: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
        { label: 'Contact messages', path: '/admin/messages', icon: Mail },
        { label: 'Reviews', path: '/admin/reviews', icon: Star },
        { label: 'Account settings', path: '/admin/settings', icon: Settings },
      ]
    : [
        { label: 'Overview', path: '/account', icon: Home },
        { label: 'My quote requests', path: '/account/quotes', icon: ClipboardList },
        { label: 'Appointments', path: '/account/appointments', icon: CalendarDays },
        { label: 'Account settings', path: '/account/settings', icon: Settings },
      ],
)

function isActive(path: string): boolean {
  if (route.path === path) return true
  if (path === '/admin' || path === '/account') return false
  return route.path.startsWith(`${path}/`)
}

async function logout() {
  signOut()
  await router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <RouterLink to="/" class="flex items-center gap-3" aria-label="Miracle Shine home">
          <img src="/m_logo.png" alt="" class="h-10 w-32 rounded-lg object-cover" />
          <span class="hidden border-l border-slate-200 pl-3 text-sm font-semibold text-slate-600 sm:block">
            {{ isAdmin ? 'Administrator portal' : 'Customer portal' }}
          </span>
        </RouterLink>
        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-slate-600 sm:inline">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
          <RouterLink to="/" class="text-sm font-medium text-primary hover:underline">Visit website</RouterLink>
          <button type="button" class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-primary hover:text-primary" @click="logout">
            <LogOut class="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </header>

    <div class="mx-auto grid max-w-[90rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:py-8">
      <aside class="h-fit rounded-3xl border border-slate-200 bg-white p-3 lg:sticky lg:top-6">
        <p class="px-3 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {{ isAdmin ? 'Manage business' : 'Your account' }}
        </p>
        <nav class="grid grid-cols-2 gap-1 lg:grid-cols-1" :aria-label="isAdmin ? 'Administrator navigation' : 'Customer navigation'">
          <RouterLink
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition"
            :class="isActive(item.path) ? 'bg-sky-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
        <RouterLink to="/" class="mt-4 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Building2 class="h-4 w-4" /> Public website
        </RouterLink>
      </aside>

      <main class="min-w-0">
        <RouterView />
      </main>
    </div>
  </div>
</template>
