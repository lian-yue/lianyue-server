import koaRouter from 'koa-router'

export default function router() {
  const router = koaRouter();

  router.use('/tags', require('./tags/routes')().routes());

  router.use('/storage', require('./storage/routes')().routes());

  router.use('/token', require('./token/routes')().routes());

  router.use('/admin', require('./admin/routes')().routes());

  router.use('', require('./posts/routes')().routes());

  return router
}
