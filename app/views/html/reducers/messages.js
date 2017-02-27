import { MESSAGES_SET, MESSAGES_CLOSE } from '../actions/messages'

export default function(state = {}, action) {
  switch (action.type) {
    case MESSAGES_SET:
      state = Object.assign({}, state)
      name = action.name || ''
      action.type = action._type;
      delete action._type
      state[name] = action
      return state;
    case MESSAGES_CLOSE:
      name = action.name || ''
      if (!state[name]) {
        return state;
      }
      state = Object.assign({}, state)
      state[name].close  = true
      return state;
    default:
      return state;
  }
}
