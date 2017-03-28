import koaRouter from 'koa-router'
import body from '../middlewares/body'
import token from '../middlewares/token'
import admin from '../middlewares/admin'

import tag from './middlewares/tag'

export default function router() {
  const router = koaRouter()


  router.get('/', require('./index'))
  router.get('/create', require('./create'));
  router.get('/:tag', tag, require('./read'))
  router.get('/:tag/update', require('./update'));

  router.use(token)
  router.use(body)
  router.use(admin)

  router.put('/', require('./editor'))
  router.put('/create', require('./editor'))
  router.post('/', require('./editor'))
  router.post('/create', require('./editor'))

  router.patch('/:tag', tag, require('./editor'))
  router.post('/:tag', tag, require('./editor'))

  router.post('/:tag/state', tag, require('./state'))


  return router
}
