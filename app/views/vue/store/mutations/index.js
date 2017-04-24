import Vue from 'vue'


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
      if (name == 'status' || name == 'type') {
        return
      }
      var value = payload[name]
      if (name == 'title') {
        document.title = value.join(' - ');
        return
      }
      if (name == 'html') {
        value.forEach(function(value, name) {
          document.documentElement.setAttribute(name, value)
        })
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


export function headers(state, payload) {
  removeHeaders()
  addHeaders(payload)
  state.headers = payload
}

export function messages(state, payload) {
  payload = toObject(payload)
  if (payload.errors) {
    payload.messages =  payload.errors
    delete payload.errors
  }

  if (payload.messages) {
    delete payload.message
  }

  if (payload.message) {
    payload.messages = [payload]
    delete payload.message
  }

  payload.type = payload._type
  payload.name = payload.name || ''

  Vue.set(state.messages, payload.name, payload)
}

export function closeMessages(state, payload) {
  if (state.messages[payload.name] && !state.messages[payload.name].close) {
    Vue.set(state.messages[payload.name], 'close', true)
  }
}

export function token(state, payload) {
  var token = payload.token || {}
  state.token = payload.add ? {...state.token, ...token} : token
}

export function protocol(state, payload) {
  state.protocol = payload.protocol || 'http'
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
