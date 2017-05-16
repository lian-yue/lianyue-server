import pathToRegexp from 'path-to-regexp'


export default async function(ctx, next) {
  if (['GET', 'HEAD'].indexOf(ctx.method) == -1 || ctx.query.view != 'xml') {
    await next()
    return
  }

  if (ctx.path != '/' && !pathToRegexp('/tag-:tag').test(ctx.path)) {
    await next()
    return
  }


  var state = await ctx.viewModel(ctx.method, ctx.path, ctx.query)

  state.ctx = ctx;
  ctx.type = 'xml'

  const template = require('./posts/index.ejs');
  ctx.body = template(state)
}


if(module.hot) {
  module.hot.accept();
}
