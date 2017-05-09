import http        from 'http'
import pathToRegExp from 'path-to-regexp'
import queryString from 'query-string'

const debug = require('debug')('vm:router');

export default class Router {

  stack = []

  allowMethods = ['HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE']

  constructor() {

  }

  async match(ctx, method, path, query, body, next, recursion) {
    method = method || 'GET'
    query = query || {}
    path = path || '/'
    if (typeof query == 'string') {
      query = queryString.parse(query)
    }

    if (this.allowMethods.indexOf(method) == -1) {
      ctx.throw(http.STATUS_CODES[405], 405);
    }
    if (!recursion) {
      debug('%s %s', method, path);
      ctx.routeStack = ctx.routeStack || []
      ctx.routeStack.push({
        state: ctx.state.vm,
        params: ctx.params || {},
        method: ctx.request.method,
        path: ctx.request.path,
        query: ctx.request.query,
        body: ctx.request.body,
      })

      delete ctx.state.vm

      ctx.params = {}
      if (method != ctx.request.method) {
        ctx.request.method = method
      }
      if (path != ctx.request.path) {
        ctx.request.path = path
      }
      if (query != ctx.request.query) {
        ctx.request.query = query
      }
      if (body !== ctx.request.body) {
        ctx.request.body = body
      }
    }

    var dispatch = (routeIndex, middlewareIndex) => {
      if (!this.stack[routeIndex]) {
        return Promise.resolve(next)
      }
      var route = this.stack[routeIndex]
      if (middlewareIndex == 0) {
        var matches
        if ((route.methods.length && route.methods.indexOf(method) == -1) || (route.regexp && !(matches = path.match(route.regexp)))) {
          try {
            return Promise.resolve(dispatch(routeIndex + 1, 0))
          } catch (err) {
            return Promise.reject(err)
          }
        }
        if (route.path) {
          debug(route.path);
        }
        ctx.routeMatches = matches
        if (matches) {
          matches = matches.slice(1)
          for (var i = 0; i < matches.length; i++) {
            if (route.paramNames[i]) {
              ctx.params[route.paramNames[i].name] = matches[i] ? decodeURIComponent(matches[i]) : matches[i];
            }
          }
        }
      }

      // 处理中间件
      var fn = route.middleware[middlewareIndex]
      if (!fn) {
        return Promise.resolve(dispatch(routeIndex + 1, 0))
      }
      if (fn instanceof this.constructor) {
        return Promise.resolve(fn.match(ctx, ctx.method, ctx.path.substr(ctx.routeMatches ? ctx.routeMatches[0].length : 0), ctx.query, ctx.request.body, function() {
          return dispatch(routeIndex, middlewareIndex + 1)
        }, true))
      } else {
        return Promise.resolve(fn(ctx, function() {
          return dispatch(routeIndex, middlewareIndex + 1)
        }))
      }
    }


    try {
      await dispatch(0, 0)
    } catch (e) {
      throw e
    } finally {
      if (!recursion) {
        var state = ctx.state.vm
        var routeRequest =  ctx.routeStack.pop()
        ctx.params = routeRequest.params
        ctx.state.vm = routeRequest.state
        if (ctx.request.method != routeRequest.method) {
          ctx.request.method = routeRequest.method
        }
        if (ctx.request.path != routeRequest.path) {
          ctx.request.path = routeRequest.path
        }
        if (ctx.request.query != routeRequest.query) {
          ctx.request.query = routeRequest.query
        }
        if (ctx.request.body != routeRequest.body) {
          ctx.request.body = routeRequest.body
        }
      }
    }

    return state
  }

  middleware = async (ctx, next) => {
    var isNext = false
    var state = await this.match(ctx, ctx.method, ctx.path, ctx.query, ctx.request.body, function() {
      isNext = true
    })

    if (isNext) {
      await next()
      return
    }

    if (state && (!ctx.body || typeof ctx.body == 'string')) {
      ctx.type = 'json'
      ctx.set("X-Content-Type-Options", 'nosniff')
      ctx.body = JSON.stringify(state)
    }
  }


  all(path, ...middleware) {
    return this.register({
      path,
      middleware,
    })
  }

  get(path, ...middleware) {
    return this.register({
      methods: ['GET', 'HEAD'],
      path,
      middleware,
    })
  }

  post(path, ...middleware) {
    return this.register({
      methods: ['POST'],
      path,
      middleware,
    })
  }

  put(path, ...middleware) {
    return this.register({
      methods: ['PUT'],
      path,
      middleware,
    })
  }

  patch(path, ...middleware) {
    return this.register({
      methods: ['PATCH'],
      path,
      middleware,
    })
  }

  del(path, ...middleware) {
    return this.register({
      methods: ['DELETE'],
      path,
      middleware,
    })
  }

  use(...middleware) {
    if (Array.isArray(middleware[0]) && typeof middleware[0][0] === 'string') {
      var paths = middleware[0]
      middleware = middleware.slice(1)
      paths.forEach((path) => {
        this.use(path, ...middleware)
      });
      return this
    }
    if (typeof middleware[0] == 'string') {
      var path = middleware[0]
      middleware = middleware.slice(1)
    } else {
      var path = null
    }

    return this.register({
      path,
      middleware,
      end: false,
    })
  }

  register(opts) {
    if (typeof opts.middleware[0] == 'string' || Array.isArray(opts.middleware[0])) {
      var path = opts.middleware.shift()
      opts.name = opts.path
      opts.path = path
    }
    if (Array.isArray(opts.path)) {
      opts.path.forEach((path)  => {
        this.register(Object.assign({}, opts, {path}));
      });
    } else {
      this.stack.push(new Route(opts))
    }
    return this
  }
}


class Route {

  methods = []

  paramNames = []

  middleware = []

  prefix = {}

  constructor(opts) {
    opts = opts || {}
    for (var key in opts) {
      if (opts[key]) {
        this[key] = opts[key]
      }
    }
    this.middleware = Array.isArray(this.middleware) ? this.middleware : [this.middleware];
    if (this.path) {
      this.regexp = pathToRegExp(this.path, this.paramNames, opts);
    }
  }
}


if (module.hot) {
  module.hot.accept();
}
