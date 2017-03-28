export default async function(ctx) {
  var post = ctx.state.post
  if (post.get('deletedAt')) {
    var e = new Error('文章不存在');
    e.status = 404;
    throw e;
  }

  post.set('deletedAt', new Date);
  await post.save();

  ctx.status = 204;
  await ctx.render(post);
}
