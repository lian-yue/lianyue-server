import React, { Component } from 'react'

export default class ContainerComponent extends Component {
  render () {
    return (
      <div id="tags-container">
        {this.props.children}
      </div>
    )
  }
}
