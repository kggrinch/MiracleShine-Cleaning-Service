import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ServicesView from '../views/ServicesView.vue'
import ContactQuoteView from '../views/ContactQuoteView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import AuthView from '../views/AuthView.vue'
import PortalLayout from '../components/layout/PortalLayout.vue'
import DashboardHomeView from '../views/DashboardHomeView.vue'
import AdminQuotesView from '../views/AdminQuotesView.vue'
import QuoteDetailView from '../views/QuoteDetailView.vue'
import AdminServicesView from '../views/AdminServicesView.vue'
import AdminMessagesView from '../views/AdminMessagesView.vue'
import AppointmentsView from '../views/AppointmentsView.vue'
import AdminReviewsView from '../views/AdminReviewsView.vue'
import CustomerSettingsView from '../views/CustomerSettingsView.vue'
import { currentUser, initializeAuth, type UserRole } from '@/services/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    role?: UserRole
    portal?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/services',
      name: 'services',
      component: ServicesView,
    },
    {
      // Legacy deep links redirect to the shared services page and its matching card.
      path: '/services/deep-cleaning',
      redirect: { path: '/services', hash: '#deep-cleaning' },
    },
    {
      path: '/services/move-in-out-cleaning',
      redirect: { path: '/services', hash: '#move-in-out-cleaning' },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: ReviewsView,
    },
    {
      // Preserve existing contact bookmarks while keeping one canonical quote destination.
      path: '/contact',
      redirect: { name: 'get-quote' },
    },
    {
      path: '/get-quote',
      name: 'get-quote',
      component: ContactQuoteView,
    },
    {
      path: '/login',
      name: 'customer-login',
      component: AuthView,
      meta: { guestOnly: true, role: 'CUSTOMER' },
    },
    {
      path: '/register',
      name: 'customer-register',
      component: AuthView,
      meta: { guestOnly: true, role: 'CUSTOMER' },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AuthView,
      meta: { guestOnly: true, role: 'ADMIN' },
    },
    {
      path: '/admin',
      component: PortalLayout,
      meta: { requiresAuth: true, role: 'ADMIN', portal: true },
      children: [
        { path: '', name: 'admin-home', component: DashboardHomeView },
        { path: 'quotes', name: 'admin-quotes', component: AdminQuotesView },
        { path: 'quotes/:id', name: 'admin-quote-detail', component: QuoteDetailView },
        { path: 'services', name: 'admin-services', component: AdminServicesView },
        { path: 'messages', name: 'admin-messages', component: AdminMessagesView },
        { path: 'appointments', name: 'admin-appointments', component: AppointmentsView },
        { path: 'reviews', name: 'admin-reviews', component: AdminReviewsView },
        { path: 'settings', name: 'admin-settings', component: CustomerSettingsView },
      ],
    },
    {
      path: '/account',
      component: PortalLayout,
      meta: { requiresAuth: true, role: 'CUSTOMER', portal: true },
      children: [
        { path: '', name: 'customer-home', component: DashboardHomeView },
        { path: 'quotes', name: 'customer-quotes', component: DashboardHomeView },
        { path: 'quotes/:id', name: 'customer-quote-detail', component: QuoteDetailView },
        { path: 'appointments', name: 'customer-appointments', component: AppointmentsView },
        { path: 'settings', name: 'customer-settings', component: CustomerSettingsView },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    // Back/forward: restore the exact spot the visitor left.
    if (savedPosition) return savedPosition
    // In-page anchor (e.g. /services#deep-cleaning): smooth scroll with an
    // offset so the sticky navbar never covers the target heading.
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' }
    // Every other navigation starts a fresh page at the top.
    return { top: 0, left: 0 }
  },
})

router.beforeEach(async (to) => {
  await initializeAuth()

  if (to.meta.guestOnly && currentUser.value) {
    return currentUser.value.role === 'ADMIN' ? { name: 'admin-home' } : { name: 'customer-home' }
  }

  if (to.meta.requiresAuth) {
    if (!currentUser.value) {
      return to.meta.role === 'ADMIN'
        ? { name: 'admin-login', query: { redirect: to.fullPath } }
        : { name: 'customer-login', query: { redirect: to.fullPath } }
    }

    const requiredRole = to.meta.role as UserRole | undefined
    if (requiredRole && currentUser.value.role !== requiredRole) {
      return currentUser.value.role === 'ADMIN' ? { name: 'admin-home' } : { name: 'customer-home' }
    }
  }

  return true
})

export default router
