import './assets/styles/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { reveal } from './directives/reveal'

const app = createApp(App)

// Scroll-reveal directive available to every component: `v-reveal="120"`.
app.directive('reveal', reveal)

app.use(router)
app.mount('#app')
