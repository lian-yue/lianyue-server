import { fromJS } from 'immutable';
import { STORAGE_SET, STORAGE_CLEAR } from '../actions/storage';

const defState = fromJS({
  multiple: true,
  select: function(files) {

  }
})

export default function(state = defState, action) {
  switch (action.type) {
    case STORAGE_SET:
      return state.merge(action.value)
      break
    case STORAGE_CLEAR:
      return defState
      break
    default:
      return state;
  }
}
