"use strict";
const path          = require('path')
const http          = require('http')
const assert        = require('assert')
const Koa           = require('koa')
const koaConvert    = require('koa-convert')     // 1.x 兼容
const koaStatic     = require('koa-static')      // 静态文件


global.__SERVER__ = true;


const packageInfo = require('../package.json')
const config = require('../config')
const models = require('./models')
const routers = require('./routers')


// Add http 451
http.STATUS_CODES[451] = 'Unavailable For Legal Reasons';
http.STATUS_CODES[499] = 'Request aborted';

const app = new Koa();

app.env = process.env.NODE_ENV || 'development';


// error
app.context.onerror = function(err) {
  if (null == err) {
    return;
  }
  assert(err instanceof Error, 'non-error thrown: ' + err);
  const ctx = this;

  // ENOENT support
  if ('ENOENT' === err.code) {
    err.status = 404;
  }

  if (err.status == 400 && err.statusCode > 400 && err.statusCode < 500) {
    err.status = err.status;
  }

  if ((err.code == 'HPE_INVALID_EOF_STATE' || err.code == 'ECONNRESET' || err.message == 'Request aborted') && !err.status) {
    err.status = 499;
  }

  if (err.name == 'ValidationError' || err.name == 'ValidatorError') {
    err.status = err.status || 403;
    err.code = err.name;
  }

  if (err.code == 'ValidationError' || err.code == 'ValidatorError') {
    err.status = err.status || 403;
  }

  if ('number' !== typeof err.status || !http.STATUS_CODES[err.status]) {
    err.status = 500;
  }


  ctx.app.emit('error', err, ctx);

  if (err.status == 499) {
    return;
  }

  if (ctx.headerSent || !ctx.writable) {
    err.headerSent = true;
    return;
  }

  if (!ctx.status || ctx.status < 300 || ctx.status == 404 || err.status >= 500) {
    ctx.status = err.status;
  }

  if (ctx.status >= 300 && ctx.status < 400) {
    ctx.redirect(err.redirect)
  }
  var state = {}

  ctx.set(err.headers)
  if (err.state) {
    if (typeof err.state.toJSON == 'function') {
      err.state = err.state.toJSON()
    }
    state = Object.assign(state, err.state)
  }

  var messages = [];
  if (err.name == 'ValidationError' && err.errors) {
    for (let path in err.errors) {
      let message = err.errors[path];
      messages.push({
        code: message.code || message.name,
        path: message.path || path,
        message: message.message,
      });
    }
  } else {
    messages.push({
      code: err.code || 'ERROR',
      status: err.status,
      message: (app.env == 'development' || err.status != 500) && err.message ? `${err.message}` : http.STATUS_CODES[err.status]
    });
  }

  var data = {
    success: false,
    status: err.status,
    messages: messages,
  };

  data = Object.assign(state, data);
  ctx.render('messages', data).then(() => {
    ctx.res.end(ctx.body);
  }, (e) => {
    if (data.status == 500) {
      throw e
    }
    e.status = 500
    this.onerror(e)
  });
};

app.context.getViewState = function() {
  if (!this.state.views) {
    return false
  }
  return this.state.views[this.state.views.length -1]
}

app.context.render = async function(relPath, state) {
  const ctx = this;

  state = state || {}
  if (typeof state.toJSON == 'function') {
    state = state.toJSON();
  }
  if (relPath instanceof Object) {
    if (typeof relPath.toJSON == 'function') {
      relPath = relPath.toJSON();
    }
    state = Object.assign(relPath, state);
    relPath = false;
  }

  var view = '';

  if (ctx.query.view) {
    view = ctx.query.view
  } else if (ctx.request.body instanceof Object && ctx.request.body.view) {
    view = ctx.request.body.view
  }

  if (!ctx.state.views) {
    ctx.state.views = []
  }
  ctx.state.views.push(state)

  if (!relPath) {
    view = 'json';
  }

  var res
  switch (view) {
    case 'json':
      res = require('./views/json/index')
      break;
    case 'rss':
      res = require('./views/rss/index')
      break;
    default:
      res = require('./views/html/index')
  }
  return await res.call(this, ctx, relPath, state)
}



// token
;(function() {
  const Token = require('./models/token');

  const newToken = async function(create, ctx) {
    if (!create) {
      return false;
    }

    var token = new Token({
      logs:[{
        ip: ctx.request.ip,
        date: new Date,
        userAgent: ctx.request.header['user-agent'] || '',
      }],
    });

    await token.save();

    ctx.cookies.set('_token', token.get('_id').toString() + '.' + token.get('random'),  Object.assign({}, __CONFIG__.cookie, {expires: token.get('expiredAt'), path:'/', httponly: true}));
    return ctx.state.token = token;
  }

  app.context.token = async function(create) {
    if (create == 3) {
      return await newToken(this);
    }
    if (this.state.token && create < 2) {
      return this.state.token;
    }
    var cookie = this.cookies.get('_token');
    if (!cookie || cookie.length < 26) {
      return await newToken(create, this);
    }

    cookie = cookie.split('.');
    if (cookie.length != 2) {
      return await newToken(create, this);
    }

    var token
    try {
      token = Token.findById(cookie[0]);
      if (create == 2) {
        token = token.read('primary');
      }
      token = await token.exec();
      if (!token) {
        return await newToken(create, this);
      }
      if (cookie[1] !== token.get('random') || (token.get('expiredAt') && token.get('expiredAt') <= (new Date))) {
        return await newToken(create, this);
      }
      let logs = token.get('logs') || [];
      let now = Date.now()
      let set = true;
      for (let log of logs) {
        if (log.ip == this.request.ip && (log.date.getTime() + 1800000) > now) {
          set = false;
          break;
        }
      }

      if (set) {
        if (logs.length && logs[logs.length -1].ip == this.request.ip) {
          logs.pop()
        }
        logs.push({
          ip: this.request.ip,
          date: now,
          userAgent: this.request.header['user-agent'] || '',
        });
        if (logs.length > 100) {
          logs.splice(1, 2)
        }
        token.set('logs', logs);
        await token.save();
      }
    } catch (e) {
      return token ? token : await newToken(create, this);
    }
    return this.state.token = token;
  }
})()






// development  webpack
if (process.env.NODE_ENV === "development") {
  process.env.DEBUG = '*';
  let webpackDevMiddleware = require('koa-webpack-dev-middleware');
  let webpack              = require('webpack');
  let webpackConfig        = require('../webpack.config.js');

  app.use(koaConvert(webpackDevMiddleware(webpack(webpackConfig), {
    contentBase: webpackConfig.output.path,
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    inline: true,
    noInfo:true,
    hideModules: true,
    colors: true,
  })));
}



// public file
app.use(koaStatic(path.join(__dirname, '../public')));

// access log
app.use(async function(ctx, next) {
  var start = new Date;
  await next()
  var ms = new Date - start;
  var userAgent = ctx.request.header['user-agent'] || '';
  console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms}ms - ${ctx.request.ip} - ${userAgent}`);
  ctx.set('X-Response-Time', ms + 'ms');
  ctx.set('X-Version', packageInfo.version);
  ctx.set('X-Author', packageInfo.author);
});




// timeout
app.use(async function(ctx, next) {
  var clear = setTimeout(function() {
    var err = new Error('Request timeout');
    err.status = 502;
    ctx.onerror(err);
  }, 60000);
  try {
    await next()
  } catch (e) {
    clearTimeout(clear);
    throw e;
  }
  clearTimeout(clear);
})


app.use(routers.routes());
app.use(routers.allowedMethods());

// 404
app.use(async function(ctx) {
  ctx.status = 404
  await ctx.render('messages', {
    success: false,
    status: 404,
    messages: [{code: 404, message: http.STATUS_CODES[404]}],
  });
})

// 错误捕获
app.on('error', function(err, ctx) {
  if (err.status >= 500) {
    console.error('server error :', err, ctx);
  } else {
    console.warn(`${ctx.method} ${ctx.status} ${ctx.url} - ${ctx.request.ip} - ${err.message}`);
  }
});


module.exports = app;
