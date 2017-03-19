import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Map, List } from 'immutable';

import actions from '../actions'

const defaultMessage = Map({})
const defaultMessages = List([])


@connect(state => (
  {
    messages: state.get('messages'),
  }
))
export default class Messages extends Component {

  static propTypes = {
    name: PropTypes.string,
  }

  static defaultProps = {
    name: '',
  }

  close = (e) => {
    e && e.preventDefault();
    this.props.dispatch(actions.closeMessages(this.props.name));
    this.props.onClose && this.props.onClose(this.props.name)
  }

  componentWillUnmount() {
    this.close()
  }

  render () {
    const data = this.props.messages.get(this.props.name) || defaultMessage;
    const messages = data.get('messages') || defaultMessages;
    var  type = data.get('type') || 'danger'
    if (type == 'error') {
      type = 'danger'
    }
    return <div role="alert" className={['alert', 'alert-' + type, 'messages'].join(' ')} style={{display: messages.size && !data.get('close') ? '' : 'none'}}>
      <button type="button" className="close" onClick={this.close}><span>×</span></button>
      {
        messages.map(function(message, key) {
          return <p key={key}>{typeof message == 'string' ? message : (message.message ? message.message : message.get('message'))}</p>
        })
      }
    </div>
  }
}
