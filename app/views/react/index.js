import server from './server'


export default async function(ctx, next) {
  if (['GET', 'HEAD'].indexOf(ctx.method) == -1 || (ctx.query.view && ctx.query.view != 'react') || (ctx.query.view != 'react' && ctx.cookies.get('view') != 'react')) {
    await next()
    return
  }

  if (ctx.cookies.get('view')) {
    ctx.cookies.set('view', 'deleted', {expires: new Date(86400 * 1000 * 2), path:'/', httponly: true})
  }

  var {redirect, body, state} = await server(ctx);

  if (redirect) {
    ctx.redirect(redirect.pathname + redirect.search)
    return;
  }

  if (!body) {
    var e = new Error('Router not match');
    e.status = 404
    throw e;
  }
  ctx.status = state.get('headers').get('status') || 200
  ctx.type = 'text/html'
  ctx.body = body
}


if(module.hot) {
  module.hot.accept();
}
