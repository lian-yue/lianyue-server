import React, { Component, PropTypes } from 'react'

export default class Loading extends Component {
  static propTypes = {
    size: PropTypes.string,
  }
  static defaultProps = {
    size: '',
  }

  render () {
    return <div className={'loading ' + this.props.size + (this.props.middle ? ' middle' : '')}>
      <span className="circle">
      </span>
    </div>
  }
}
