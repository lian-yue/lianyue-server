import koaRouter from 'koa-router'
import koaConvert from 'koa-convert'
import koaBody from 'koa-body'

import body from '../middlewares/body'
import admin from '../middlewares/admin'
import token from '../middlewares/token'

const router = koaRouter();


router.get('/', admin, require('./index'));
router.get('/:id', admin, require('./read'));

router.use(token)
router.use(admin)


router.del('/:id', require('./delete'));
router.post('/:id/delete', require('./delete'));

export default router;
