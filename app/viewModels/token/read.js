export default async function(ctx) {
  var token = await ctx.token(ctx.query.create ? 1 : 0);
  if (!token) {
    token = {};
  }
  ctx.set('Cache-Control', 'no-cache,must-revalidate,max-age=0');
  await ctx.render(token);
}
