import { fromJS, Map } from 'immutable';
import { COMMENT_LIST_ADD, COMMENT_LIST_SET, COMMENT_LIST_CLEAR } from '../actions/comment'

const defState = fromJS({
  post: {},
  results: [],
  more: true,
})

export default function(state = defState, action) {
  switch (action.type) {
    case COMMENT_LIST_ADD:
      var value = action.value
      if (value.results) {
        value.results = state.get('results').concat(fromJS(value.results))
      }
      return state.merge(value)
      break
    case COMMENT_LIST_SET:
      return state.merge(action.value)
      break
    case COMMENT_LIST_CLEAR:
      return defState
      break
    default:
      return state;
  }
}
