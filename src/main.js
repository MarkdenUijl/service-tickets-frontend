import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setupWebsocket } from './plugins/initWebsocket'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import clickOutside from './directives/clickOutside'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

const pinia = createPinia();
pinia.use(piniaPluginPersistedState)
const app = createApp(App);

app.component('EasyDataTable', Vue3EasyDataTable)

app.use(i18n);
app.use(pinia);
app.use(router);
app.directive('click-outside', clickOutside)

setupWebsocket();

app.mount('#app');