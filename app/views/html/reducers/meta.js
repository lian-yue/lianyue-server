import { META_SET, META_ADD } from '../actions/meta'
const { site } = __CONFIG__



export default function(state = {title:[]}, action) {
  switch (action.type) {
    case META_SET:
      state = action.value;
      break;
    default:
      return state;
  }

  if (!__SERVER__) {
    var html = document.querySelector('html');
    var head = document.querySelector('head');
    var element
    var elements = head.querySelectorAll('link[rel],meta[itemprop],meta[name],meta[property]');
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i]
      if (!element.getAttribute('readonly')) {
        element.parentNode.removeChild(element)
      }
    }

    if (state.title) {
      document.title = state.title.join(' - ');
    }
    var html = document.querySelector('html');
    if (state.itemtype) {
      html.setAttribute('itemtype', state.itemtype);
    } else {
      html.removeAttribute('itemtype');
    }
    if (state.itemscope) {
      html.setAttribute('itemscope', true);
    } else {
      html.removeAttribute('itemscope');
    }


    var prefix = "og: http://ogp.me/ns"
    if (state['og:type'] && ['article', 'profile', 'book', 'video', 'website', 'music'].indexOf(state['og:type']) != -1) {
      prefix += '/' + state['og:type'];
    }
    html.setAttribute('prefix', prefix + '#');




    var addHeader = function(name, value) {
      if (['title', 'itemscope', 'itemtype'].indexOf(name) != -1) {
        return
      }
      if (value instanceof Array) {
        if (value.length == 0) {
          return;
        }
        if (value[0] instanceof Object) {
          for (var i = 0; i < value.length; i++) {
            addHeader(name, value[i]);
          }
          return
        }
        value = value.join(',');
      }
      var element
      if (name.indexOf('rel:') == 0) {
        name = name.substr(4);
        element = document.createElement('link')
        element.setAttribute('rel', name)
        if (value instanceof Object) {
          for (var attribute in value) {
            element.setAttribute(attribute, value[attribute])
          }
        } else {
          element.setAttribute('href', value)
        }
      } else {
        element = document.createElement('meta')
        if (name.indexOf('itemprop:') == 0) {
          name = name.substr(9);
          var attribute = 'itemprop';
        } else {
          var attribute = name.indexOf(':') == -1 || name.indexOf('twitter:') == 0 ? 'name' : 'property'
        }
        element.setAttribute(attribute, name)
        element.setAttribute('content', value)
      }
      head.appendChild(element)
    };


    for (let name in state) {
      let value = state[name];
      addHeader(name, value)
    }
  }
  return state;
}
