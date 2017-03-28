import React, { Component } from 'react'
import { connect } from 'react-redux'

import site from 'config/site'


import actions from '../../../actions'

import Main from '../../../components/Main'

const title = "错误消息"


@connect(state => ({}))
export default class NotFound extends Component {
  componentDidMount() {
    this.props.dispatch(actions.setMessages('您请求的页面不存在', 'danger', 'popup'))
  }

  render () {
    return <Main
      title={[title, site.title]}
      meta= {[
        {name: 'robots', content:'none'},
      ]}
      breadcrumb={[title]}
      >
      <section id="content">
        <div id="not-found">
        </div>
      </section>
    </Main>
  }
}
