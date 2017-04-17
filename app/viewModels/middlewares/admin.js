export default async (ctx, next) => {
  const token = await ctx.token(1);
  if (!token.get('admin')) {
    ctx.set('Cache-Control', 'no-cache,must-revalidate, max-age=0');
    ctx.throw('你尚未登录请登录后重试', 401, {code: 'AUTHENTICATION'})
  }
  await next();
}
