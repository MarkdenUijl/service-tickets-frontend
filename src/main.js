import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import clickOutside from './directives/clickOutside'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

const app = createApp(App);

app.component('EasyDataTable', Vue3EasyDataTable)

app.use(i18n);
app.use(router);
app.directive('click-outside', clickOutside)
app.mount('#app');