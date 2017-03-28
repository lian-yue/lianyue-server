import { fromJS } from 'immutable';
import { POST_READ_SET, POST_READ_CLEAR } from '../actions/post'

const defState = fromJS({
  tags: [],
  meta: {},
  images: [],
})

export default function(state = defState, action) {
  switch (action.type) {
    case POST_READ_SET:
      return defState.merge(action.value)
      break
    case POST_READ_CLEAR:
      return defState
      break
    default:
      return state;
  }
}
