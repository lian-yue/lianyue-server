import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)










export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '/:slug', component: () => System.import('../views/Posts/Home.vue') },
    { path: '/', component: () => System.import('../views/Posts/Home.vue') },
  ]
})
