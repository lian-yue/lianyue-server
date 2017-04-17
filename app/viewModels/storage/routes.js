import Router from 'viewModels/router'

import body from 'viewModels/middlewares/body'
import bodyMultipart from 'viewModels/middlewares/bodyMultipart'
import token from 'viewModels/middlewares/token'
import admin from 'viewModels/middlewares/admin'

import id from './middlewares/id'


import index from './index'
import read from './read'
import create from './create'
import del from './delete'
import restore from './restore'

const router = new Router;


router.get('storage/index', '/', admin, index);
router.get('storage/read', '/:id', admin, id, read);

router.use(token)
router.use(admin)

router.post('/create', bodyMultipart, create);

router.del('/:id', id, del);
router.post('/:id/delete', id, del);

router.post('/:id/restore', id, restore);

export default router
