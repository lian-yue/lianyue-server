import { fromJS } from 'immutable';
import { HEADERS_SET } from '../actions/headers'


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


function addHeaders(state) {
  if (!__SERVER__) {
    var head = document.querySelector('head');
    state.forEach(function(value, name) {
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
        attrs.forEach(function(attrValue, attrName) {
          element.setAttribute(attrName, attrValue)
        })
        element.setAttribute('data-header', 'true')
        head.appendChild(element)
      })
    })
  }
}


export default function(state = fromJS({}), action, ...e) {
  switch (action.type) {
    case HEADERS_SET:
      state = fromJS(action.value);
      removeHeaders()
      addHeaders(state)
      return state
      break;
    default:
      return state;
  }
}
