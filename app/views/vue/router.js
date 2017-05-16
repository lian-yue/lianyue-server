import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


const router = new Router({
  mode: 'history',
  fallback: false,
  scrollBehavior()  {
    return { y: 0 }
  },
  routes: [
    {
      path: '/tags',
      component: () => import('./views/tags/Index'),
    },
    {
      path: '/tags/create',
      component: () => import('./views/tags/Editor'),
      meta: {
        admin: true
      },
    },
    {
      path: '/tags/:tag/update',
      component: () => import('./views/tags/Editor'),
      meta: {
        admin: true
      },
    },

    {
      path: '/admin',
      component: () => import('./views/Admin'),
    },
    {
      path: '/comments',
      component: () => import('./views/Comment'),
      meta: {
        admin: true
      },
    },

    {
      path: '/tag-:tag',
      component: () => import('./views/posts/Index'),
    },
    {
      path: '/create',
      component: () => import('./views/posts/Editor'),
      meta: {
        admin: true
      },
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
      meta: {
        admin: true
      },
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
export default router
