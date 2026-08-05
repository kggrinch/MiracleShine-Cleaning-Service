import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ServicesView from '../views/ServicesView.vue'
import ContactView from '../views/ContactView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import QuoteView from '../views/QuoteView.vue'

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
      path: '/services/deep-cleaning',
      name: 'services-deep-cleaning',
      component: ServicesView,
    },
    {
      path: '/services/move-in-out-cleaning',
      name: 'services-move-in-out-cleaning',
      component: ServicesView,
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
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/get-quote',
      name: 'get-quote',
      component: QuoteView,
    },
  ],
})

export default router
