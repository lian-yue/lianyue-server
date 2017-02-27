import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import queryString from 'query-string'
import moment from 'moment'

import Breadcrumb from './parts/Breadcrumb'
import View from './parts/markdown/View'
import Messages from '../containers/parts/Messages'

const { site } = __CONFIG__

const title = '评论管理';


export default class LoginComponent extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    fetch: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
  }

  onChange = this.context.onChange

  state = {
    results: [],
    more: true,
    loading: false,
  }

  componentWillMount() {
    this.props.setMeta({
      title:[title, site.title],
      'robots': 'none',
    });
  }
  componentDidMount() {
    var state = this.props.componentState
    if (state) {
      this.setState(state)
    } else {
      this.fetch(this.props)
    }

    if (state && state.messages) {
      this.props.setMessages(state.messages, 'danger', 'popup')
    }

    var email = localStorage.getItem('email')
    if (email) {
      this.setState({email})
    }
    var author = localStorage.getItem('author')
    if (author) {
      this.setState({author})
    }
  }


  componentWillReceiveProps(nextProps) {
    var location = this.props.location
    var nextLocation = nextProps.location
    if (location.key == nextLocation.key) {
      return
    }

    if (location.pathname == nextLocation.pathname && location.search == nextLocation.search) {
      return
    }
    if (!this.isMore) {
      this.setState({results:[], more: true})
    }
    this.isMore = false

    this.fetch(nextProps)
  }



  async fetch(props) {
    if (this.state.loading) {
      return false
    }
    this.setState({loading: true})
    try {
      var result = await this.context.fetch('/comments', props.location.query)
      if (result.messages) {
        props.setMessages(result, 'danger', 'popup')
      } else {
        result.results = this.state.results.concat(result.results)
      }
      result.loading = false
      this.setState(result)
    } catch (e) {
      props.setMessages([e, '请重试'], 'danger', 'popup')
      this.setState({loading: false})
    }
  }

  onReply(parent) {
    return (e) => {
      e && e.preventDefault()
      this.setState({parent})
      this.refs.content.focus()
    }
  }

  onDelete(comment) {
    return async (e) => {
      e.preventDefault();
      try {
        var result = await this.context.fetch( '/' + comment.post._id + '/comments/' + comment._id +'/delete', {}, {})
        if (result.messages) {
          this.props.setMessages(result.messages, 'danger', 'popup')
          return
        }
        var results = this.state.results
        var index = results.indexOf(comment)
        if (index != -1) {
          results.splice(index, 1)
        }
        this.setState({results})
      } catch (e) {
        this.props.setMessages(e, 'danger', 'popup')
      }
    }
  }



  onRestore(comment) {
    return async (e) => {
      e.preventDefault();
      try {
        var result = await this.context.fetch( '/' + comment.post._id + '/comments/' + comment._id +'/restore', {}, {})
        if (result.messages) {
          this.props.setMessages(result.messages, 'danger', 'popup')
          return
        }
        var results = this.state.results
        var index = results.indexOf(comment)
        if (index != -1) {
          results.splice(index, 1)
        }
        this.setState({results})
      } catch (e) {
        this.props.setMessages(e, 'danger', 'popup')
      }
    }
  }


  onMore = (e) => {
    this.isMore = true
  }

  render () {
    var location = this.props.location
    var query = location.query
    var results = this.state.results

    var nav = ''
    if (this.state.more) {
      nav = (
        <nav className="navigation" role="navigation">
          <Link to={'/comments?' + queryString.stringify(Object.assign({}, query, {id: results.length ? results[results.length - 1]._id : undefined}))} className="more" onClick={this.onMore} rel="next">{this.state.loading ? '载入中...' : '加载更多'}</Link>
        </nav>
      )
    }

    var adminMenu = (
      <section id="admin-menu">
        <ul id="admin-menu-fixed" className="nav flex-column">
          <li className="nav-item">{this.props.location.query.deleted ? <Link to={this.props.location.pathname} className="nav-link">已发布</Link> : <Link to={this.props.location.pathname + "?deleted=1"} className="nav-link">回收站</Link>}</li>
        </ul>
      </section>
    )

    return (
      <div id="admin-comments">
        <Breadcrumb>{title}</Breadcrumb>
        <main id="main" role="main">
          {adminMenu}
          <section id="comments">
            <ol id="comments-list">
              {results.map((comment) => {
                var createdAt = moment(comment.createdAt).format()
                var says
                if (comment.parent) {
                  says = <span className="says">对 <strong>{comment.parent.author}</strong> 说</span>
                } else {
                  says = <span className="says">说</span>
                }
                var form = ''
                if (this.state.parent &&this.state.parent._id == comment._id) {
                  form = (
                    <form role="form" method="post" id="comments-form" onSubmit={this.onSubmit}>
                      <Messages/>
                      <div className="form-group">
                        <label htmlFor="author">名称：</label>
                        <input id="author" name="author" className="form-control" placeholder="在此输入你的姓名" type="text" value={this.state.author || ''} maxLength="32" required onChange={this.onChange()} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">电子邮件：</label>
                        <input id="email" name="email" className="form-control" type="email"  placeholder="请输入你的电子邮箱" value={this.state.email || ''} maxLength="64" required onChange={this.onChange()} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="comment-content">评论内容：</label>
                          {this.state.parent ? <span className="reply-info">您正在回复 <strong>{this.state.parent.author}</strong> 的评论 <a rel="nofollow" className="cancel-reply" href="#" onClick={this.onReply(null)}>点击这里取消回复。</a></span> : ''}
                        <textarea id="comment-content" name="content" className="form-control"  ref="content" value={this.state.content || ''} maxLength="8192" required onChange={this.onChange()} ></textarea>
                        <p>支持 <code>MarkDown</code> 代码, <code>Html</code> 标签</p>
                      </div>
                      <div className="form-group">
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={this.state.disabled}>提交</button>
                      </div>
                    </form>
                  )
                }

                return (
                  <li key={comment._id}>
                    <header className="comment-meta">
                      <div className="comment-author"><img src={comment.avatar} className="avatar photo" /></div>
                      <div className="actions">
                        {this.props.token.admin ? (comment.deletedAt ? <a className="restore" href="#" rel="nofollow" onClick={this.onRestore(comment)}>恢复</a> : <a className="delete" href="#" rel="nofollow" onClick={this.onDelete(comment)}>删除</a>) : ''}
                        {comment.post.comment ? <a className="reply" href="#" rel="nofollow" onClick={this.onReply(comment)}>回复</a> : ''}
                      </div>
                      <div className="text">
                        <span className="author vcard">{comment.author}</span>
                        <span className="title">在 <Link to={comment.post.uri} title={comment.post.title}>{comment.post.title.length > 16 ? comment.post.title.substr(0, 13) + '...' : comment.post.title}</Link></span>
                        {says}
                        <span className="time"><time dateTime={createdAt} title={createdAt}>{moment(comment.createdAt).fromNow()}</time></span>
                      </div>
                    </header>
                    <View className="content comment-content" html={true}>{(comment.htmlContent || '')}</View>
                    {form}
                  </li>
                )
              })}
            </ol>
            {nav}
          </section>
        </main>
      </div>
    )
  }
}
