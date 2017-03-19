import koaBody from 'koa-body'

const bodyParse = koaBody({
  formLimit: '1mb',
  jsonLimit: '1mb',
  textLimit: '1mb',
});

export default async (ctx, next) => {
  if (['HEAD', 'GET', 'DELETE', 'OPTIONS'].indexOf(ctx.method) === 0) {
    await next();
    return;
  }

  await bodyParse(ctx, async () => {
    if (!(ctx.request.body instanceof Object)) {
      var e = new Error('参数错误');
      e.code = 'PARAM';
      e.status = 400;
      throw e;
    }
    await next();
  });
}
