import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'

import * as modules from './modules'


Vue.use(Vuex)


const plugins = []
if (process.env.NODE_ENV === 'development') {
  plugins.push(function(store) {
    store.subscribe(function(mutation, state) {
      if (__SERVER__) {
        const debug = require('debug')('vue:vuex')
        debug('%s  %s', mutation.type, JSON.stringify(state, null, '  '));
      } else {
        console.log(mutation.type, state)
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
