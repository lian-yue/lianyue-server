export default async (ctx, next) => {
  var tag = ctx.state.tag
  var state = parseInt(ctx.request.body.state)
  if (isNaN(state)) {
    state = 0
  }
  if (tag.set('state') == state) {
    ctx.vmState({})
    return
  }

  tag.set('state', state)
  await tag.save()

  ctx.vmState({})
}
