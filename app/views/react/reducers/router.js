import {fromJS} from 'immutable';
import {LOCATION_CHANGE} from 'react-router-redux'


export default (state = fromJS({location: null}), action) => {
  switch (action.type) {
    case LOCATION_CHANGE:
      return state.merge({
        location: action.payload
      });
      break;
    default:
      return state
  }
};
