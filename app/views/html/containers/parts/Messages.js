import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Component from '../../components/parts/Messages'

import * as MessagesActions from '../../actions/messages'


function mapStateToProps(state) {
  return {
    messages: state.messages,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(MessagesActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Component)
