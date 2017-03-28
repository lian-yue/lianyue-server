import koaRouter from 'koa-router'

import body from '../middlewares/body'
import token from '../middlewares/token'

export default function router() {
  const router = koaRouter();

  router.get('/', require('./getIndex'));

  router.use(body);
  router.use(token);

  router.post('/', require('./index'));

  return router;
}
