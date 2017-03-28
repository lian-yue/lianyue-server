import moment from 'moment'

import React, { Children } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import createHistory from 'history/createMemoryHistory'
import { routerMiddleware, ConnectedRouter as Router } from 'react-router-redux'

import {  Route } from 'react-router-dom'
import { Provider } from 'react-redux'


import Store from './store'
import actions from './actions'

import App from './views/App'

import Theme from './Theme'



moment.locale('zh-cn');

export default async function (inlineState, ctx) {
  const start = new Date;

  const location = ctx.url

  const context = {}

  const history = createHistory({
    initialEntries:[location],
  })

  const middleware = routerMiddleware(history)

  const store = Store({}, [middleware])

  var app = <Provider store={store}>
    <Router history={history} context={context}>
      <App />
    </Router>
  </Provider>


  var startTree = new Date;
  await reactTreeWalker(app, {}, ctx, inlineState);
  var msTree = new Date - startTree;

  var app = renderToString(app);

  if (context.url) {
    return {redirect: context.url}
  }

  var html = renderToStaticMarkup(<Theme store={store}>{app}</Theme>)
  var body = '<!DOCTYPE html>' + html

  var ms = new Date - start;

  ctx.set('X-Render-Time', [ms, msTree].join(',') + 'ms');

  return {body}
}


// https://github.com/ctrlplusb/react-tree-walker/blob/master/src/index.js
async function reactTreeWalker(element, context = {}, ctx, inlineState) {
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

      if (instance.componentServerMount) {
        let promise = instance.componentServerMount(ctx, inlineState);
        if (promise && promise.then) {
          await promise
        }
      }

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
      await reactTreeWalker(child, childContext, ctx, inlineState);
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
        await reactTreeWalker(children[i], context, ctx, inlineState)
      }
    }
  }
}
