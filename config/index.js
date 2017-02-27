if (__SERVER__) {
  if (global.__CONFIG__) {
    module.exports = global.__CONFIG__
  } else {
    var fs = require('fs');
    fs
    .readdirSync(__dirname)
    .filter(function (file) {
      return file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js'
    })
    .map(function (file) {
      exports[file.substr(0, file.length-3)] = require('../config/' + file);
    })
    global.__CONFIG__ = exports
  }
} else {
  if (window.__CONFIG__) {
    module.exports = window.__CONFIG__
  } else {
    exports.version = require('./version')
    exports.site = require('./site')
    window.__CONFIG__ = exports
  }
}
