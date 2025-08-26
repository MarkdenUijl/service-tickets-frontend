import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import clickOutside from './directives/clickOutside'

const app = createApp(App);

app.use(i18n);
app.use(router);
app.directive('click-outside', clickOutside)
app.mount('#app');