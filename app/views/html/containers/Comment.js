import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Component from '../components/Comment'
import * as MetaActions from '../actions/meta'
import * as TokenActions from '../actions/token'
import * as MessagesActions from '../actions/messages'
function mapStateToProps(state) {
  return {
    meta: state.meta,
    token: state.token,
  }
}

function mapDispatchToProps(dispatch) {
  return Object.assign({}, bindActionCreators(MetaActions, dispatch), bindActionCreators(MessagesActions, dispatch), bindActionCreators(TokenActions, dispatch));
}

export default connect(mapStateToProps, mapDispatchToProps)(Component)
