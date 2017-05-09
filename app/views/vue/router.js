import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


export default new Router({
  mode: 'history',
  fallback: false,
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/tags',
      component: () => import('./views/tags/Index'),
    },
    {
      path: '/tags/create',
      component: () => import('./views/tags/Editor'),
    },
    {
      path: '/tags/:tag/update',
      component: () => import('./views/tags/Editor'),
    },

    {
      path: '/admin',
      component: () => import('./views/Admin'),
    },
    {
      path: '/comments',
      component: () => import('./views/Comment'),
    },

    {
      path: '/tag-:tag',
      component: () => import('./views/posts/Index'),
    },
    {
      path: '/create',
      component: () => import('./views/posts/Editor'),
    },
    {
      path: '/:slug',
      component: () => import('./views/posts/Read'),
    },
    {
      path: '/:slug/comments',
      component: () => import('./views/posts/Comment'),
    },
    {
      path: '/:slug/update',
      component: () => import('./views/posts/Editor'),
    },
    {
      path: '/',
      component: () => import('./views/posts/Index'),
    },
    {
      path: '*',
      component: () => import('./views/errors/NotFound'),
    },
  ]
})
