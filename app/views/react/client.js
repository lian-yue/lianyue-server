import moment from 'moment'


import React, { Component, PropTypes, Children } from 'react'
import { render as renderToElement } from 'react-dom'
import createHistory from 'history/createBrowserHistory'
import { routerMiddleware, ConnectedRouter as Router, LOCATION_CHANGE } from 'react-router-redux'

import {  Route } from 'react-router-dom'

import { Provider } from 'react-redux'

import Store from './store'
import actions from './actions'


require('./style')

moment.locale('zh-cn');

const history = createHistory()

const middleware = routerMiddleware(history)

const store = Store(window.__REDUX_STATE__, [middleware])

const element = document.getElementById('app')



var isReactTreeWalker
export async function render() {
  const App = require('./views/App');

  var app = <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>

  if (process.env.NODE_ENV == 'development') {
    const AppContainer = require('react-hot-loader').AppContainer;
    var app = <AppContainer>{app}</AppContainer>
  }
  if (!isReactTreeWalker) {
    isReactTreeWalker = true
    await reactTreeWalker(app, {})
  }

  renderToElement(app, element)
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

  await render();

  // 不使用  react-router-redux  的 Router 优先级bug 修复
  history.listen(function(location) {
    store.dispatch({
       type: LOCATION_CHANGE,
       payload: location
     })
  })

  if(module.hot) {
    module.hot.accept('./views/App', function() {
      render();
    });
  }
}









// https://github.com/ctrlplusb/react-tree-walker/blob/master/src/index.js
async function reactTreeWalker(element, context = {}) {
  if (typeof element.type === 'function') {
    const Component = element.type;
    const props = Object.assign({}, Component.defaultProps, element.props);
    let childContext = context;
    let child;

    // Is this a class component? (http://bit.ly/2j9Ifk3)
    const isReactClassComponent = Component.prototype &&
      (Component.prototype.isReactComponent || Component.prototype.isPureReactComponent);

    if (isReactClassComponent) {
      const instance = new Component(props, context);
      // In case the user doesn't pass these to super in the constructor
      instance.props = instance.props || props;
      instance.context = instance.context || context;

      // Make the setState synchronous.
      instance.setState = (newState) => {
        instance.state = Object.assign({}, instance.state, newState);
      };

      instance.pretreatment = true

      if (instance.asyncComponent) {
        let promise = instance.asyncComponent()
        if (promise && promise.then) {
          await promise
        }
      }

      if (instance.componentWillMount) {
        // Make the setState synchronous.
        instance.componentWillMount();
      }


      // Ensure the child context is initialised if it is available. We will
      // need to pass it down the tree.
      if (instance.getChildContext) {
        childContext = Object.assign({}, context, instance.getChildContext());
      }

      // Get the render output as the child.
      child = instance.render();
    } else {
      // Stateless Functional Component

      // Get the output for the function, as the child.
      child = Component(props, context);
    }

    // Only continue walking if a child exists.
    if (child) {
      await reactTreeWalker(child, childContext);
    }
  } else {
    // This must be a basic element, such as a string or dom node.

    // If the element has children then we will walk them.
    if (element.props && element.props.children) {
      let children = []
      Children.forEach(element.props.children, (child) => {
        if (child) {
          children.push(child)
        }
      });
      for (let i = 0; i < children.length; i++) {
        await reactTreeWalker(children[i], context)
      }
    }
  }
}



module.exports()
