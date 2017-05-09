import ES6Promise from 'es6-promise/auto'
import moment from 'moment'
import queryString from 'query-string'

import { TOKEN } from './store/types'

moment.locale('zh-cn');

module.exports = async function() {
  if (!window.fetch) {
    await import("whatwg-fetch")
  }
  const {app, store, router} = require('./app')

  if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }

  store.commit.fetch = async function (path, query, body) {
    var opt = {}
    opt.headers = {}

    if (body && typeof body == 'object') {
      if (!store.state.token._id) {
        await store.dispatch({
          type: TOKEN,
          create: 1,
        })
      }
      body = queryString.stringify(Object.assign({}, body, {view: 'json', _token: store.state.token._id}))
    }

    if (query && typeof query == 'object') {
      query = queryString.stringify(body ? query : Object.assign({}, query, {view : 'json'}))
    }

    if (body) {
      opt.method = 'POST'
      opt.headers['Content-Type'] = "application/x-www-form-urlencoded"
    }

    if (body) {
      opt.body = body
    }
    opt.credentials = opt.credentials || 'same-origin'
    opt.timeout = 10000

    var response = await fetch(path + (query ? '?' + query : ''), opt).then((response) => {
      if (response.status == 204) {
        return {}
      }
      return response.json(true)
    })
    if (response.messages) {
      var err = new Error
      for (var key in response) {
        err[key] = response[key]
      }
      throw err
    }
    return response
  }

  router.onReady(() => {
    app.$mount('#app')
  })
}
module.exports()
