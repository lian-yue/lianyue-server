import koaRouter from 'koa-router'

export default function router() {
  const router = koaRouter();

  router.get('/', require('./read'));

  return router
}
