import path from 'path'

// development
if (process.env.NODE_ENV == "development") {
  // 自动重载  路由
  const watcher = require("chokidar").watch([
    __dirname,
  ]).on('ready', () => {
    watcher.on('all', (event, path) => {
      Object.keys(require.cache).forEach(id => {
        if (/[\/\\]app[\/\\]/.test(id)) {
          delete require.cache[id];
        }
      });
      console.info('Delete require cache');
      require('./models')
    });
  })
  module.exports.routes = function() {
    return function(ctx, next) {
      return require('./viewModels/routes').routes()(ctx, next);
    };
  }
  module.exports.allowedMethods = function() {
    return function(ctx, next) {
      return require('./viewModels/routes').allowedMethods()(ctx, next);
    };
  }
} else {
  module.exports = require('./viewModels/routes')
}
