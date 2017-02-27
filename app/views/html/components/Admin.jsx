import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import queryString from 'query-string'

import Breadcrumb from './parts/Breadcrumb'
import Messages from '../containers/parts/Messages'
const { site } = __CONFIG__

const title = '管理员登录';


export default class LoginComponent extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    fetch: React.PropTypes.func.isRequired,
    formData: React.PropTypes.func.isRequired,
  }


  state = {
    password: '',
  }

  componentWillMount() {

    this.props.setMeta({
      title:[title, site.title],
      'robots': 'none',
    });
  }

  componentDidMount() {
    var query = Object.assign({}, this.props.location.query);
    if (this.props.token && this.props.token.admin) {
      this.context.router.push(query.redirect_uri || '/')
      return
    }
    delete query.disabled
    if (query.message) {
      switch (query.message) {
        case '401':
          this.props.setMessages('你尚未登录请登录后访问');
          break;
        default:
      }
    }
    this.setState(query);
  }


  onSubmit = async (e) => {
    e.preventDefault();
    this.setState({disabled:true})
    try {
      var token = await this.context.fetch('/admin', {}, this.context.formData(e))
      if (token.messages) {
        this.setState({disabled:false})
        this.props.setMessages(token)
        return
      }
      this.props.setToken(token);
      var query = this.props.location.query;
      var redirectUri = query.redirect_uri || '/';
      this.context.router.push(redirectUri)
    } catch (e) {
      this.setState({disabled:false})
      this.props.setMessages(e.message);
    }
  }


  render () {
    var search = queryString.stringify(Object.assign({}, this.props.location.query, {message: undefined, login: undefined}));
    if (search) {
      search = '?' + search;
    }
    return (
      <div id="admin">
        <Breadcrumb>{title}</Breadcrumb>
        <main id="main" role="main">
          <section id="content">
            <Messages/>
            <form role="form" method="post" onSubmit={this.onSubmit}>
              <div className="form-group">
                <label htmlFor="password" className="form-label">密码:</label>
                <input name="password" className="form-control" type="password" required maxLength="32" placeholder="请输入密码" id="password" />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={this.state.disabled}>登陆</button>
              </div>
            </form>
          </section>
        </main>
      </div>
    )
  }
}
