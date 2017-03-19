import { fromJS, Map } from 'immutable';
import { TAG_LIST_ADD, TAG_LIST_CLEAR } from '../actions/tag'

const defState = fromJS({
  results: [],
  more: true,
})

export default function(state = defState, action) {
  switch (action.type) {
    case TAG_LIST_ADD:
      var value = action.value
      if (value.results) {
        value.results = state.get('results').concat(fromJS(value.results))
      }
      return state.merge(value)
      break
    case TAG_LIST_CLEAR:
      return defState
      break
    default:
      return state;
  }
}
