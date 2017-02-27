import { TOKEN_SET, TOKEN_ADD } from '../actions/token'

export default function(state = {}, action) {
  switch (action.type) {
    case TOKEN_SET:
      return action.value;
    case TOKEN_ADD:
      return Object.assign({}, state, action.value);
    default:
      return state;
  }
}
