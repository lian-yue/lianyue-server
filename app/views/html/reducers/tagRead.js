import { fromJS } from 'immutable';
import { TAG_READ_SET, TAG_READ_CLEAR } from '../actions/tag'

const defState = fromJS({
  parents: [],
  names: [],
})

export default function(state = defState, action) {
  switch (action.type) {
    case TAG_READ_SET:
      return defState.merge(action.value)
      break
    case TAG_READ_CLEAR:
      return defState
      break
    default:
      return state;
  }
}
