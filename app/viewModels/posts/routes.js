import koaRouter from 'koa-router'
import body from '../middlewares/body'
import admin from '../middlewares/admin'
import token from '../middlewares/token'


import slug from './middlewares/slug'

export default function router() {

  const router = koaRouter();


  router.get('/', require('./index'));
  router.get('/tag-:tag', require('./index'));
  router.get('/create', require('./create'));
  router.get('/:slug/update', require('./update'));


  router.get('/comments', admin, require('./comments.js'));
  router.use('/:slug/comments', slug, require('./comments/routes')().routes());
  router.get('/:slug', slug, require('./read'));



  router.use(body);
  router.use(token);

  router.use(admin);

  router.put('/', require('./editor'));
  router.put('/create', require('./editor'));
  router.post('/', require('./editor'));
  router.post('/create', require('./editor'));

  router.patch('/:slug', slug, require('./editor'));
  router.post('/:slug', slug, require('./editor'));


  router.del('/:slug', slug, require('./delete'));
  router.post('/:slug/delete', slug, require('./delete'));


  router.post('/:slug/restore', slug, require('./restore'));


  return router
}
