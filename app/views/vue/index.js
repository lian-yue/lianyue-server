if(module.hot) {
  module.hot.accept();
}

// import server from './server'

export default async function(ctx, next) {
  if (['GET', 'HEAD'].indexOf(ctx.method) == -1 || (ctx.query.view != 'vue' && ctx.cookies.get('view') != 'vue')) {
    await next()
    return
  }

  /*toJSONObject(state)

  var {redirect, body} = await server(state, ctx);


  if (redirect) {
    ctx.redirect(redirect.pathname + redirect.search)
    return;
  }

  if (!body) {
    var e = new Error('Vue match is empty');
    e.status = 404
    throw e;
  }

  ctx.type = 'text/html'
  ctx.body = body*/
}
