import React, {Component, PropTypes} from 'react'
import { connect } from 'react-redux'

import actions from '../../actions'

import Messages from '../../components/Messages'

@connect(state => ({
  messages: state.get('messages'),
  router: state.get('router'),
}))
export default class PopupMessages extends Component {
  componentDidUpdate(props) {
    const popup = this.props.messages.get('popup')
    if (popup && !popup.get('close')) {
      if (this.props.router.getIn(['location', 'key']) != props.router.getIn(['location', 'key'])) {
        this.props.dispatch(actions.closeMessages('popup'))
      } else {
        setTimeout(() => {
          this.props.dispatch(actions.closeMessages('popup'))
        }, 3000);
      }
    }
  }

  close = () => {
    this.props.dispatch(actions.closeMessages('popup'))
  }

  render() {
    return <div id="popup-messages" onDoubleClick={this.close}>
      <Messages name="popup" />
    </div>
  }
}
