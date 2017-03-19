import React, { Component, PropTypes } from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import Storage from './Storage'

import actions from '../../actions'

@connect(state => ({}))
export default class Button extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
  }

  static propTypes = {
    multiple: React.PropTypes.bool,
    select: React.PropTypes.func,
    className: React.PropTypes.string,
  }


  static defaultProps = {
    multiple: true,
    select: function(files) {

    },
    className: 'storage-button btn btn-secondary',
  }

  componentDidMount() {
    var storage = document.getElementById('storage')
    if (!storage) {
      storage = document.createElement('div')
      storage.id = 'storage'
      storage.className = 'storage'
      document.body.appendChild(storage)
      render(<Provider store={this.context.store}><Storage fetch={this.context.fetch}/></Provider>, storage)
    }
  }

  componentWillUnmount() {
    this.onClose()
  }

  onShow = (e) => {
    e && e.preventDefault();
    document.getElementById('storage').className = 'storage show'
    document.querySelector('#storage .modal').focus()
    if (document.body.className.indexOf('modal-open') == -1) {
      document.body.className += ' modal-open'
    }
    this.props.dispatch(actions.setStorage({eee: new Date, multiple: this.props.multiple, select: this.props.select}));
  }

  onClose = (e) => {
    e && e.preventDefault();
    document.getElementById('storage').className = 'storage fade'
    document.body.className = document.body.className.replace(/(^\s*|\s+)modal-open(\s+|\s*$)/g, '');
  }

  render() {
    return <button type="button" className={this.props.className} onClick={this.onShow}>{this.props.children || '选择'}</button>
  }
}
