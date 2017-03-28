import {Map, fromJS} from 'immutable';
import { MESSAGES_SET, MESSAGES_CLOSE } from '../actions/messages'

export default function(state = fromJS({}), action) {
  switch (action.type) {
    case MESSAGES_SET:
      name = action.name || ''
      action.type = action._type;
      delete action._type
      return state.set(name, fromJS(action))
    case MESSAGES_CLOSE:
      name = action.name || ''
      if (!state.get(name)) {
        return state;
      }
      return state.setIn([name, 'close'], true)
    default:
      return state;
  }
}
