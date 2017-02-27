export default async function(ctx) {
  var comment = ctx.state.comment
  if (!comment.get('deletedAt')) {
    e = new Error('评论不存在');
    e.status = 404;
    throw e;
  }

  comment.set('deletedAt', undefined);
  await comment.save();

  await ctx.render(comment);
}
