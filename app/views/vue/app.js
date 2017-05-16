import Vue from 'vue'
import { sync } from 'vuex-router-sync'

import router from './router'
import store from './store'
import * as filters from './filters'
import * as components from './components'
import * as plugins from './plugins'

import App from './views/App.vue'


sync(store, router)

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Object.keys(components).forEach(key => {
  Vue.component(key, components[key])
})

Object.keys(plugins).forEach(key => {
  Vue.use(plugins[key])
})



const app = new Vue({
  router,
  store,
  ...App
})


export { app, router, store }
