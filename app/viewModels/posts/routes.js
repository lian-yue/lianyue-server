import Router from 'viewModels/router'

import body from 'viewModels/middlewares/body'
import admin from 'viewModels/middlewares/admin'
import token from 'viewModels/middlewares/token'


import slug from './middlewares/slug'

import commentsRoutes from './comments/routes'


import comments from './comments.js'

import index from './index'
import read from './read'
import editor from './editor'
import del from './delete'
import restore from './restore'


const router = new Router


router.get('posts/index', '/', index);
router.get('posts/index', '/tag-:tag', index);


router.get('comments', '/comments', admin, comments);
router.use('/:slug/comments', slug, commentsRoutes);
router.get('posts/read', '/:slug', slug, read);



router.use(body);
router.use(token);

router.use(admin);

router.put('/', editor);
router.put('/create', editor);
router.post('/', editor);
router.post('/create', editor);

router.patch('/:slug', slug, editor);
router.post('/:slug', slug, editor);


router.del('/:slug', slug, del);
router.post('/:slug/delete', slug, del);


router.post('/:slug/restore', slug, restore);

export default router
