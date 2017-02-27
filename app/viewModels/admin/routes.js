import koaRouter from 'koa-router'

import body from '../middlewares/body'
import token from '../middlewares/token'

const router = koaRouter();


router.get('/', require('./getIndex'));

router.use(body);
router.use(token);

router.post('/', require('./index'));

export default router;
