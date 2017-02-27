export default async function(ctx) {
  var post = ctx.state.post
  if (!post.get('deletedAt')) {
    e = new Error('文章不存在');
    e.status = 404;
    throw e;
  }

  post.set('deletedAt', undefined);
  await post.save();

  await ctx.render(post);
}
