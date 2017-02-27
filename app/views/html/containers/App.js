import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Component from '../components/App'
import * as MessagesActions from '../actions/messages'
import * as TokenActions from '../actions/token'

function mapStateToProps(state) {
  return {
    token: state.token,
    messages: state.messages,
  }
}

function mapDispatchToProps(dispatch) {
  return Object.assign({}, bindActionCreators(TokenActions, dispatch), bindActionCreators(MessagesActions, dispatch));
}

export default connect(mapStateToProps, mapDispatchToProps)(Component)
