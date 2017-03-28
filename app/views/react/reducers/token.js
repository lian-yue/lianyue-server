import {Map, fromJS} from 'immutable';
import { TOKEN_SET, TOKEN_ADD } from '../actions/token';


export default function(state = fromJS({}), action) {
  switch (action.type) {
    case TOKEN_SET:
      return fromJS(action.value)
    case TOKEN_ADD:
      return state.merge(action.value)
    default:
      return state;
  }
}
