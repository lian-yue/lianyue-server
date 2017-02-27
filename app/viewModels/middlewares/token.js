export default async (ctx, next) => {
  if (['HEAD', 'GET', 'OPTIONS'].indexOf(ctx.method) != -1) {
    await next();
    return;
  }

  var tokenId = ctx.query._token || '';
  if (ctx.request.header['x-csrf-token']) {
    tokenId = ctx.request.header['x-csrf-token']
  } else if (ctx.request.body instanceof Object) {
    if (ctx.request.body._token) {
      tokenId = ctx.request.body._token;
    } else if (ctx.request.body.fields instanceof Object  && ctx.request.body.fields._token) {
      tokenId = ctx.request.body.fields._token;
    }
  }


  const token = await ctx.token();
  if (!token || (ctx.app.env != 'development' && tokenId !== token.get('_id').toString())) {
    ctx.set('Cache-Control', 'no-cache,must-revalidate,max-age=0');
    var e = new Error('验证数据错误，请刷新页面重试');
    e.code = 'CSRF';
    e.status = 401;
    throw e;
  }
  await next();
}
