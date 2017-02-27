export default async (ctx, next) => {
  const token = await ctx.token(1);
  if (!token.get('admin')) {
    ctx.set('Cache-Control', 'no-cache,must-revalidate,max-age=0');
    var e = new Error('你尚未登录未登录');
    e.code = 'AUTHENTICATION';
    e.status = 401;
    if (ctx.request.accepts(['html', 'xml']) && (!ctx.query.view || ctx.query.view == 'desktop' || ctx.query.view == 'mobile')) {
      e.status = 302;
      e.redirect = '/admin?message=401&redirect_uri=' + encodeURIComponent(ctx.request.path + ctx.request.search);
    }
    throw e;
  }
  await next();
}
