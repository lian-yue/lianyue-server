import moment from 'moment'

import React, { createElement } from 'react'
import { render as renderToElement, unmountComponentAtNode } from 'react-dom'
import { match, Router, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
import { syncHistoryWithStore } from 'react-router-redux';


import config from '../../../config'

import routes from './routes'
import configureStore from './store/configureStore'

moment.locale('zh-cn');


async function render() {

  const store = configureStore(window.__REDUX_STATE__)

  const history = syncHistoryWithStore(browserHistory, store, {
    selectLocationState(state) {
      var routing = state.get('routing')
      return routing ? routing.toJS() : routing
    },
  })

  const app = document.getElementById('app')


  const {redirect, props} = await new Promise((resolve, reject) => {
    match({
      routes,
      history,
    }, (err, redirect, props) => {
      if (err) {
        return reject(err)
      }
      resolve({redirect, props})
    })
  });

  if (process.env.NODE_ENV == 'development') {
    const AppContainer = require('react-hot-loader').AppContainer;
    renderToElement(
      <AppContainer>
        <Provider store={store}>
          <Router {...props} history={history}>
            {routes}
          </Router>
        </Provider>
      </AppContainer>,
      app
    )


    if (module.hot) {
      module.hot.accept('./routes', () => {
        const routes = require('./routes');
        unmountComponentAtNode(app)
        renderToElement(
          <AppContainer>
            <Provider store={store}>
              <Router history={history}>
                {routes}
              </Router>
            </Provider>
          </AppContainer>,
          app
        );
      });
    }
  } else {
    renderToElement(
      <Provider store={store}>
        <Router history={history}>
          {routes}
        </Router>
      </Provider>,
      app
    )
  }
}




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
  await render()
}

module.exports()
