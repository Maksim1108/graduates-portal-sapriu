import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './assets/styles/main.css'
import axios from 'axios'

import { useAuthStore } from './stores/auth'
import { useLanguageStore } from './stores/language'

// Настройка axios для отправки cookies с каждым запросом
axios.defaults.withCredentials = true

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
const languageStore = useLanguageStore()

authStore.checkAuthStatus()

languageStore.initializeLanguage()

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      try { await authStore.logout() } catch {}
      router.push('/auth')
    }
    return Promise.reject(error)
  }
)

app.mount('#app') 