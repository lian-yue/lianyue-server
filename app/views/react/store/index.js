import { fromJS } from 'immutable';
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import promise from 'redux-promise'


import reducers from '../reducers'
export default function(state, middleware = []) {
  middleware.push(thunk, promise)
  const store = createStore(
    reducers,
    fromJS(state),
    applyMiddleware(...middleware)
  )


  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const reducers = require('../reducers')
      store.replaceReducer(reducers)
    })
  }

  return store
}
