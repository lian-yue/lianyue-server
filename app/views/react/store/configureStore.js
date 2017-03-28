import { fromJS } from 'immutable';
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import promise from 'redux-promise'


import rootReducer from '../reducers'
export default function configureStore(preloadedState) {
  const store = createStore(
    rootReducer,
    fromJS(preloadedState),
    applyMiddleware(thunk, promise)
  )


  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers')
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
