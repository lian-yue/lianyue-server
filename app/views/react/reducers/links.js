import { LINKS_SET } from '../actions/links';

export default function(state = false, action) {
  switch (action.type) {
    case LINKS_SET:
      return action.value
    default:
      return state;
  }
}
