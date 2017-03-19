import { fromJS, Map } from 'immutable';
import { POST_LIST_ADD, POST_LIST_SET, POST_LIST_CLEAR } from '../actions/post'

const defState = fromJS({
  tag: null,
  results: [],
  more: true,
})

export default function(state = defState, action) {
  switch (action.type) {
    case POST_LIST_ADD:
      var value = action.value
      if (value.results) {
        value.results = state.get('results').concat(fromJS(value.results))
      }
      return state.merge(value)
      break
    case POST_LIST_SET:
      return state.merge(action.value)
      break
    case POST_LIST_CLEAR:
      return defState
      break
    default:
      return state;
  }
}
