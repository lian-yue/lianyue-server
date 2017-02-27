export default async function(ctx) {
  var storage = ctx.state.storage
  if (!storage.get('deletedAt')) {
    var e = new Error('文件不存在');
    e.status = 404;
    throw e;
  }

  storage.set('deletedAt', undefined);
  await storage.save();

  await ctx.render(storage)
}
