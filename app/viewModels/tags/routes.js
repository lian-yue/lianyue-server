import Router from 'viewModels/router'

import body from 'viewModels/middlewares/body'
import token from 'viewModels/middlewares/token'
import admin from 'viewModels/middlewares/admin'

import tag from './middlewares/tag'

import index from './index'
import read from './read'
import editor from './editor'
import state from './state'


const router = new Router;


router.get('tags/index', '/', index)
router.get('tags/read', '/:tag', tag, read)

router.use(token)
router.use(body)
router.use(admin)

router.put('/', editor)
router.put('/create', editor)
router.post('/', editor)
router.post('/create', editor)

router.patch('/:tag', tag, editor)
router.post('/:tag', tag, editor)

router.post('/:tag/state', tag, state)

export default router
