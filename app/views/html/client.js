import React, { createElement } from 'react'
import moment from 'moment'
import { render } from 'react-dom'
import { match, Router, browserHistory as history } from 'react-router'

moment.locale('zh-cn');

import config from '../../../config'

import routes from './routes'
import { Provider } from 'react-redux'
import configureStore from './store/configureStore'

const store = configureStore(window.__REDUX_STATE__)
const componentsState = window.__COMPONENTS_STATE__

if (!window.fetch) {
  require.ensure([], (require) => {
    require("whatwg-fetch")
  }, 'fetch')
}
if (!window.Promise) {
  require.ensure([], (require) => {
    require('es6-promise').polyfill();
    matchCallback()
  }, 'es6-promise')
} else {
  matchCallback();
}


function matchCallback() {
  match({ routes, history }, function(error, redirectLocation, renderProps) {
    var prefetchTasks = [];
    for (let i = 0; i < renderProps.routes.length; i++) {
      let route = renderProps.routes[i];
      if (route.getComponent) {
        (function(route) {
          prefetchTasks.push(new Promise(function(resolve, reject)  {
            route.getComponent(renderProps.location, function(error, component) {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            })
          }));
        })(route)
      }
    }
    Promise.all(prefetchTasks).then(function() {
      for (let component of renderProps.components) {
        if (component) {
          component.componentState = componentsState.shift();
        }
      }

      renderProps.createElement = function(component, props) {
        if (component == null) {
          return null;
        }
        if (component.componentState) {
          props.componentState = component.componentState;
          component.componentState = false
        }
        component = createElement(component, props);
        return component;
      }

      render(
        <Provider store={store}>
          <Router history={history} {...renderProps}>
            {routes}
          </Router>
        </Provider>,
        document.querySelector('#app')
      )
    })
  })
}
