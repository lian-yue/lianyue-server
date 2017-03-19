import {fromJS} from 'immutable';
import {LOCATION_CHANGE} from 'react-router-redux'


export default (state = fromJS({locationBeforeTransitions: null}), action) => {
  switch (action.type) {
    case LOCATION_CHANGE:
      return state.merge({
        locationBeforeTransitions: action.payload
      });
      break;
    default:
      return state
  }
};
