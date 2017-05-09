import Vue from 'vue'
import queryString from 'query-string'
import {MESSAGES} from '../types'

export default function (type, clearType, defaultState, stateCl = state => state, loadCl = payload => payload) {
  const module = {
    state: {...defaultState},
    mutations: {
      [type](state, payload) {
        var newState = payload.state
        if (payload.add) {
          if (newState.results && Array.isArray(newState.results) && state.results && Array.isArray(state.results)) {
            newState.results = [].concat(state.results, newState.results)
          }
        } else {
          newState = {...defaultState, ...newState}
        }
        var keys = Object.keys(newState)
        var key
        for (var i = 0; i < keys.length; i++) {
          key = keys[i]
          if (state[key] !== newState[key]) {
            Vue.set(state, key, newState[key])
          }
        }

        if (!payload.add) {
          for (var key in state) {
            if (keys.indexOf(key) == -1) {
              Vue.delete(state, key)
            }
          }
        }
      },
    },
    actions: {
      async [type]({commit, state, rootState}, payload) {
        payload = loadCl(payload)
        var routeFullPath = rootState.route.fullPath
        var key = __SERVER__ ? null : Math.random().toString(36).substr(2)
        var fullPath = payload.fullPath
        if (!fullPath) {
          let query = payload.query ? queryString.stringify(payload.query) : ''
          fullPath = payload.path + (query ? '?' + query : '')
        }
        var add = payload.add

        var oldKey = state.key || ''
        commit({
          type,
          add,
          state: {
            key,
            loading: true,
          },
        })
        try {
          var newState = await commit.fetch(payload.path, payload.query, payload.body)
          newState = stateCl(newState)
          if (payload.state) {
            newState = payload.state(newState)
          }
        } catch (e) {
          if (state.key == key && state.loading && routeFullPath == rootState.route.fullPath) {
            commit({
              ...e,
              name: 'popup',
              type: MESSAGES,
              message: e.message
            })
            commit({
              type,
              add: true,
              state: {
                key: oldKey,
                loading: false,
              }
            })
          }
          return
        }
        if (state.key == key && state.loading) {
          commit({
            type,
            add,
            state: {
              ...newState,
              key,
              loading: false,
              fullPath,
            }
          })
        }
      },
    }
  }
  if (clearType) {
    module.mutations[clearType] = function(state, payload) {
      var keys = Object.keys(defaultState)
      var key
      for (var i = 0; i < keys.length; i++) {
        key = keys[i]
        Vue.set(state, key, defaultState[key])
      }

      for (var key in state) {
        if (keys.indexOf(key) == -1) {
          Vue.delete(state, key)
        }
      }
    }
  }
  return module
}
