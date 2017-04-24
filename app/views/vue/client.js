import moment from 'moment'

moment.locale('zh-cn');


module.exports = async function() {
  if (!window.fetch) {
    await new Promise(function(resolve, reject) {
      require.ensure([], (require) => {
        require("whatwg-fetch")
        resolve(true)
      }, 'fetch')
    });
  }

  if (!window.Promise) {
    await new Promise(function(resolve, reject) {
      require.ensure([], (require) => {
        require('es6-promise').polyfill();
        resolve(true)
      }, 'es6-promise')
    });
  }

  const {app, store, router} = require('./app')


  if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }

  router.onReady(() => {
    app.$mount('#app')
  })



}


module.exports()
