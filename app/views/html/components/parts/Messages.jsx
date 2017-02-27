import React, { Component, PropTypes } from 'react'
export default class MessagesComponent extends Component {

  static propTypes = {
    messages: React.PropTypes.object.isRequired,
    closeMessages: React.PropTypes.func.isRequired,
    name: React.PropTypes.string,
    close: React.PropTypes.func,
  }

  static defaultProps = {
    name: '',
  }

  close(e) {
    e && e.preventDefault();
    this.props.closeMessages(this.props.name);
    this.props.close && this.props.close()
  }

  componentWillUnmount() {
    this.close()
  }

  render () {
    const data = this.props.messages[this.props.name] || {};
    const messages = data.messages || [];
    var  type = data.type || 'danger'
    if (type == 'error') {
      type = 'danger'
    }
    return (
      <div role="alert" className={['alert', 'alert-' + type, 'messages'].join(' ')} style={{display: messages.length && !data.close ? '' : 'none'}}>
        <button type="button" className="close" onClick={this.close.bind(this)}><span>×</span></button>
        {
          messages.map(function(message, i) {
            return <p key={i}>{message.message}</p>
          })
        }
      </div>
    )
  }
}
