import Router from 'viewModels/router'

import body from 'viewModels/middlewares/body'
import token from 'viewModels/middlewares/token'

import index from './index'

const router = new Router;

router.use(body);
router.use(token);

router.post('/', index);

export default router
