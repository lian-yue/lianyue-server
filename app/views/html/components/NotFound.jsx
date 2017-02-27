import React, { Component, PropTypes } from 'react'
import { Link, IndexLink } from 'react-router'
import Breadcrumb from './parts/Breadcrumb'

export default class NotFoundComponent extends Component {
  static fetchServer(state, store, params, ctx) {
    var res;
    if (__SERVER__) {
      res = async () => {
        if (ctx.status < 400) {
          ctx.status = 404
        }
      }
      res = res()
    }
    return res;
  }

  state = {}

  componentWillMount() {
    if (this.props.componentState) {
      this.setState(this.props.componentState)
    }
    this.props.setMeta({
      title: ['错误消息', __CONFIG__.site.title],
      robots: 'none',
    })
  }

  componentDidMount() {
    this.props.setMessages(this.state.messages ? this.state.messages : '您请求的页面不存在', 'danger', 'popup')
  }

  render () {
    return (
      <div id="not-found">
        <Breadcrumb>错误消息</Breadcrumb>
        <main id="main" role="main">
        </main>
      </div>
    )
  }
}
