import server from './server'

export default async function(ctx, relPath, state) {
  if (typeof ctx.body == 'string') {
    return
  }
  ctx.body = ''

  if (!relPath || relPath === true || (ctx.method != 'GET' && ctx.method != 'HEAD')) {
    ctx.set("X-Content-Type-Options", 'nosniff');
    ctx.body = JSON.stringify(state);
    return
  }

  toJSONObject(state)
  
  var {redirect, body} = await server(state, ctx);

  if (redirect) {
    ctx.redirect(redirect.pathname + redirect.search)
    return;
  }
  if (!body) {
    var e = new Error('React match is empty');
    e.status = 404
    throw e;
  }

  ctx.type = 'text/html'
  ctx.body = body
}


function toJSONObject(state) {
  for (var key in state) {
    if (!state[key]) {
      continue
    }
    if (typeof state[key] != 'object') {
      continue
    }
    if (typeof state[key].toJSON == 'function') {
      state[key] = state[key].toJSON()
    } else {
      toJSONObject(state[key])
    }
  }
}
