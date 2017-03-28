import { PROTOCOL_SET } from '../actions/protocol';


export default function(state = 'http', action) {
  switch (action.type) {
    case PROTOCOL_SET:
      return action.value
    default:
      return state;
  }
}
