import Router from 'viewModels/router'

import storage from './storage/routes'
import token from './token/routes'
import admin from './admin/routes'
import tags from './tags/routes'
import posts from './posts/routes'

const router = new Router;

router.use('/storage', storage);

router.use('/token', token);

router.use('/admin', admin);

router.use('/tags', tags);

router.use(posts);

export default router


if (module.hot) {
  module.hot.accept()
}
