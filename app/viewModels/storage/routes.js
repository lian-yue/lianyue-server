import koaRouter from 'koa-router'
import koaBody from 'koa-body'

import body from '../middlewares/body'
import bodyMultipart from '../middlewares/bodyMultipart'
import token from '../middlewares/token'
import admin from '../middlewares/admin'

import id from './middlewares/id'


export default function router() {
  const router = koaRouter();


  router.get('/', admin, require('./index'));
  router.get('/:id', admin, id, require('./read'));

  router.use(token)
  router.use(admin)

  router.post('/create', bodyMultipart, require('./create'));

  router.del('/:id', id, require('./delete'));
  router.post('/:id/delete', id, require('./delete'));

  router.post('/:id/restore', id, require('./restore'));

  return router
}
