import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import router from './router'

const app = createApp(App);

app.use(i18n);
app.use(router);
app.mount('#app');