export default async function(ctx) {
  var storage = ctx.state.storage
  ctx.vmState(storage);
}
