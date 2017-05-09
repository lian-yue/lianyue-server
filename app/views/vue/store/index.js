import Vue from 'vue'
import Vuex from 'vuex'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'

import * as modules from './modules'




Vue.use(Vuex)


const plugins = []
if (process.env.NODE_ENV === 'development') {
  plugins.push(function(store) {
    store.subscribe(function(mutation, state) {
      if (__SERVER__) {
        const debug = require('debug')('vue:vuex')
        debug('%s  %s', mutation.type, JSON.stringify(mutation.payload, null, '  '));
      } else {
        console.log(mutation.type, mutation.payload)
      }
    })
  })
}

export default new Vuex.Store({
  state: {
    protocol: 'http',
    headers: {},
    messages: {},
    token: {},
  },
  actions,
  getters,
  modules,
  mutations,
  plugins,
  strict: process.env.NODE_ENV === 'development',
})
