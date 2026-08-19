import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ServicesView from '../views/ServicesView.vue'
import ContactQuoteView from '../views/ContactQuoteView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

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

export default router
