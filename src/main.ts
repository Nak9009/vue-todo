import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
document.title = import.meta.env.VITE_APP_TITLE

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
