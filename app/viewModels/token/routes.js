import koaRouter from 'koa-router'

const router = koaRouter();

router.get('/', require('./read'));


export default router;
