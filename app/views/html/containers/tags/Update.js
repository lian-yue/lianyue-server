import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Component from '../../components/tags/Update'
import * as MetaActions from '../../actions/meta'
import * as MessagesActions from '../../actions/messages'

function mapStateToProps(state) {
  return {
    meta: state.meta,
  }
}

function mapDispatchToProps(dispatch) {
  return Object.assign({}, bindActionCreators(MetaActions, dispatch), bindActionCreators(MessagesActions, dispatch));
}

export default connect(mapStateToProps, mapDispatchToProps)(Component)
