import koaRouter from 'koa-router'

import body from '../../middlewares/body'
import admin from '../../middlewares/admin'
import token from '../../middlewares/token'

import id from './middlewares/id'

const router = koaRouter()


router.get('/', require('./index'))


router.use(body);
router.use(token);


router.put('/', require('./create'))
router.put('/create', require('./create'))
router.post('/', require('./create'))
router.post('/create', require('./create'))


router.use(admin);
router.del('/:id', id, require('./delete'))
router.post('/:id/delete', id, require('./delete'))
router.post('/:id/restore', id, require('./restore'))

export default router;
