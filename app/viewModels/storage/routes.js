import koaRouter from 'koa-router'
import koaConvert from 'koa-convert'
import koaBody from 'koa-body'

import body from '../middlewares/body'
import token from '../middlewares/token'
import admin from '../middlewares/admin'

import id from './middlewares/id'

const router = koaRouter();


router.get('/', admin, require('./index'));
router.get('/:id', admin, id, require('./read'));

router.use(token)
router.use(admin)

router.post('/create', async (ctx, next) => {
  await koaConvert(koaBody({
    multipart: true,
    formidable: {
      maxFields: 10,
      maxFieldsSize: 1024 * 1024 * 10,
      keepExtensions: false,
      multiples: false,
    }
  }))(ctx, next)
}, require('./create'));

router.del('/:id', id, require('./delete'));
router.post('/:id/delete', id, require('./delete'));

router.post('/:id/restore', id, require('./restore'));

export default router;
