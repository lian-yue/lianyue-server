import Vue from 'vue'

import * as types from '../types'


function removeHeaders() {
  if (!__SERVER__) {
    var element
    var elements = document.querySelectorAll('head link[data-header],head meta[data-header]');
    for (var i = 0; i < elements.length; i++) {
      elements[i].parentNode.removeChild(elements[i])
    }
    document.title = ''
    var attributes = document.documentElement.attributes
    for (var i = 0; i < attributes.length; i++) {
      if (attributes[i].name != 'lang') {
        document.documentElement.removeAttribute(attributes[i].name)
      }
    }
  }
}

function addHeaders(payload) {
  if (!__SERVER__) {
    var head = document.querySelector('head');
    Object.keys(payload).forEach(function(name) {
      var value = payload[name]
      if (name == 'title') {
        document.title = value.join(' - ');
        return
      }
      if (name == 'html') {
        Object.keys(value).forEach(function(key) {
          document.documentElement.setAttribute(key, value[key])
        })
        return
      }

      if (['meta', 'link'].indexOf(name) == -1) {
        return
      }
      value.forEach(function(attrs) {
        var element = document.createElement(name)
        Object.keys(attrs).forEach(function(attrName) {
          element.setAttribute(attrName, attrs[attrName])
        })
        element.setAttribute('data-header', 'true')
        head.appendChild(element)
      })
    })
  }
}


function toObject(data) {
  if (data instanceof Error) {
    var error = data
    data = {}
    Object.keys(error).forEach(function(key) {
      data[key] = error[key]
    })
    data.message = error.message
  }

  for (var key in data) {
    if (data[key] && typeof data[key] == 'object') {
      data[key] = toObject(data[key])
    }
  }

  return data
}

export default {
  [types.HEADERS](state, payload) {
    removeHeaders()
    addHeaders(payload)
    state.headers = payload
  },

  [types.MESSAGES](state, payload) {
    payload = toObject(payload)
    if (payload.errors) {
      payload.messages = payload.errors
      delete payload.errors
    }

    if (payload.messages) {
      delete payload.message
    }

    if (payload.message) {
      payload = {...payload, messages: [payload]}
      delete payload.message
    }

    payload.type = payload._type
    payload.name = payload.name || ''

    Vue.set(state.messages, payload.name, payload)
  },

  [types.MESSAGES_CLOSE](state, payload) {
    if (state.messages[payload.name] && !state.messages[payload.name].close) {
      Vue.set(state.messages[payload.name], 'close', true)
    }
  },

  [types.TOKEN](state, payload) {
    var token = payload.token || {}
    state.token = payload.add ? {...state.token, ...token} : token
  },

  [types.PROTOCOL](state, payload) {
    state.protocol = payload.protocol || 'http'
  },
}
