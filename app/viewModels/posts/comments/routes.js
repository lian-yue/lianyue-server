import Router from 'viewModels/router'

import body from 'viewModels/middlewares/body'
import admin from 'viewModels/middlewares/admin'
import token from 'viewModels/middlewares/token'

import id from './middlewares/id'

import index from './index'
import create from './create'
import del from './delete'
import restore from './restore'

const router = new Router


router.get('posts/comments/index', '/', index)


router.use(body);
router.use(token);


router.put('/', create)
router.put('/create', create)
router.post('/', create)
router.post('/create', create)


router.use(admin);
router.del('/:id', id, del)
router.post('/:id/delete', id, del)
router.post('/:id/restore', id, restore)

export default router
