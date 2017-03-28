import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import queryString from 'query-string'

import site from 'config/site'

import actions from '../../actions'

import Main from '../../components/Main'
import Messages from '../../components/Messages'


const title = '管理员登录';


@connect(state => ({
  token: state.get('token'),
}))
export default class Admin extends Component {

  static contextTypes = {
    fetch: React.PropTypes.func.isRequired,
  }

  state = {
    disabled: false,
  }

  componentDidMount() {
    var query = queryString.parse(this.props.location.search);
    if (this.props.token.get('admin')) {
      this.props.dispatch(actions.router.push(query.redirect_uri || '/'))
      return
    }
    if (query.message) {
      switch (query.message) {
        case '401':
          this.props.dispatch(actions.setMessages('你尚未登录请登录后访问'));
          break;
        default:
      }
    }
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.setState({disabled:true})
    try {
      var token = await this.context.fetch('/admin', {}, {password: this.refs.password.value})
      if (token.messages) {
        this.props.dispatch(actions.setMessages(token))
        return
      }
      this.props.dispatch(actions.setToken(token))
      var query = queryString.parse(this.props.location.search);
      var redirectUri = query.redirect_uri || '/';
      this.props.history.push(redirectUri)
    } catch (e) {
      this.props.dispatch(actions.setMessages(e.message))
    } finally {
      this.setState({disabled:false})
    }
  }

  render () {
    return <Main
        title={[title, site.title]}
        meta={[
          {name: 'robots', content:'none'},
        ]}
        breadcrumb={[title]}
      >
      <section id="content">
        <div id="admin">
          <Messages/>
          <form role="form" method="post" onSubmit={this.onSubmit}>
            <div className="form-group">
              <label htmlFor="password" className="form-label">密码:</label>
              <input name="password" className="form-control" type="password" required maxLength="32" placeholder="请输入密码" id="password" ref="password" />
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={this.state.disabled}>登陆</button>
            </div>
          </form>
        </div>
      </section>
    </Main>
  }
}
