import { app, router, store } from './app'
import {PROTOCOL , TOKEN, HEADERS} from './store/types'


export default async function(context) {

  var ctx = context.ctx
  router.push(ctx.url)
  store.commit({
    type: PROTOCOL,
    protocol: ctx.protocol
  })
  var token = await ctx.token()
  if (token) {
    store.commit({
      type: TOKEN,
      token: token.toJSON()
    })
  }

  store.commit.fetch = async function (path, query, body) {
    query = query || {}
    if (typeof query != 'object') {
      query = queryString.parse(query)
    }
    try {
      return await ctx.viewModel(body ? 'POST' : 'GET', path, query, body).then(state => toJSONObject(state))
    } catch (err) {
      ctx.app.emit('error', err, ctx);
      throw err
    }
  }


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
        if (!component.methods) {
          return
        }
        if (!component.methods.fetch) {
          return
        }
        return component.methods.fetch(store)
      })).then(() => {
        matchedComponents.map(component => {
          if (!component.headers) {
            return
          }
          var headers = component.headers(store)
          if (headers) {
            headers.type = HEADERS
            store.commit(headers)
          }
        })
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
      state[key] = toJSONObject(state[key])
    }
  }
  return state
}
