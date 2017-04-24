import { app, router, store } from './app'


export default async function(context) {
  var ctx = context.ctx
  router.push(ctx.url)
  store.commit('protocol', {protocol: ctx.protocol})
  var token = await ctx.token()
  if (token) {
    store.commit('token', {token: token.toJSON()})
  }
  store.commit('headers', {status: 404, meta: [{
    www: 211,
  }]})

  await new Promise((resolve, reject) => {
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      if (!matchedComponents.length) {
        var e = new Error('Router not match');
        e.status = 404
        reject(e)
        return
      }

      Promise.all(matchedComponents.map(component => {
        return component.preFetch && component.preFetch(store)
      })).then(() => {
        resolve(app)
      }).catch(reject)
    })
  })


  context.state = store.state

  var headers = store.state.headers

  if (headers.status) {
    ctx.status = headers.status
  }


  var head = []
  head.push('<title>'+ (headers.title ? htmlencode(headers.title.join(' - ')) : '') +'</title>')
  if (headers.meta) {
    headers.meta.forEach(function(attrs) {
      head.push('<meta '+ attrsToString(attrs) +' data-header />')
    })
  }
  if (headers.link) {
    headers.link.forEach(function(attrs) {
      head.push('<link '+ attrsToString(attrs) +' data-header />')
    })
  }
  context.head = head.join('\n')



  return app
}





function attrsToString(attrs) {
  var res = []
  for (var key in attrs) {
    if (attrs[key] === false || attrs[key] === null || attrs[key] === undefined) {
      continue
    }
    res.push(htmlencode(key) +'="'+ htmlencode(String(attrs[key])) +'"')
  }
  return res.join(' ')
}


function htmlencode(str) {
  return str.replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/\'/g,"&#39;")
    .replace(/\"/g,"&quot;")
}
