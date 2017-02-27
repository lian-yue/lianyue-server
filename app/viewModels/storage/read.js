export default async function(ctx) {
  var storage = ctx.state.storage
  await ctx.render(storage);
}
