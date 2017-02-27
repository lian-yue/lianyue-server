import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Component from '../../components/parts/Storage'


function mapStateToProps(state) {
  return {
    token: state.token,
  }
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Component)
