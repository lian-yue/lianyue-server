import path from 'path'
import consolidate from 'consolidate'
import moment from 'moment'

import React, { createElement } from 'react'
import { RouterContext, match } from 'react-router'
import { Provider } from 'react-redux'
import { renderToString } from 'react-dom/server'
import configureStore from './store/configureStore'

moment.locale('zh-cn');


function reactMatch(location) {
  return new Promise((resolve, reject) => {
    const routes = require('./routes');
    match({
      routes,
      location,
    }, (err, redirectLocation, renderProps) => {
      if (err) {
        return reject(err)
      }
      resolve({redirectLocation, renderProps})
    })
  });
};





async function render(ctx, renderProps, state) {
  const store = configureStore()
  var componentsState = [];
  for (let component of renderProps.components) {
    if (component) {
      component.componentState = state;
      componentsState.push(component.componentState);
      if (!component.WrappedComponent || !component.WrappedComponent.fetchServer) {
        continue;
      }
      try {
        await component.WrappedComponent.fetchServer(state, store, renderProps.params, ctx)
      } catch (e) {
        throw e;
      }
    }
  }

  renderProps.createElement = function(component, props) {
    if (component == null) {
      return null;
    }
    if (component.componentState) {
      props.componentState = component.componentState;
    }
    return createElement(component, props);
  }

  var html = renderToString(
    <Provider store={store}>
      <RouterContext {...renderProps} />
    </Provider>
  );
  var reduxState = store.getState();
  return Object.assign({}, reduxState, {
    html: html,
    reduxState: reduxState,
    componentsState: componentsState,
  });
}


export default async function(ctx, relPath, state) {
  if (typeof ctx.body == 'string') {
    return
  }
  ctx.body = ''

  if (!relPath || relPath === true || (ctx.method != 'GET' && ctx.method != 'HEAD')) {
    ctx.set("X-Content-Type-Options", 'nosniff');
    ctx.body = JSON.stringify(state);
    return
  }


  var {redirectLocation, renderProps} = await reactMatch(ctx.url);
  if (redirectLocation) {
    ctx.redirect(redirectLocation.pathname + redirectLocation.search)
    return;
  }

  if (!renderProps) {
    var e = new Error('React match is empty');
    e.status = 500
    throw e;
  }

  state = await render(ctx, renderProps, state)

  ctx.type = 'text/html'
  state.ctx = ctx;
  state.cache = ctx.app.env != 'development'
  ctx.body = await consolidate.ejs(path.join(__dirname, './index.ejs'), state)
}
