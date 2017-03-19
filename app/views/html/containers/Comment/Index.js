import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import queryString from 'query-string'
import moment from 'moment'

import actions from '../../actions'

import Loading from '../../components/Loading'

import Messages from '../../components/Messages'

import Main from '../../components/Main'

import View from '../../components/Markdown/View'

const { site } = __CONFIG__

const title = '评论管理'


@connect(state => ({
  commentList: state.get('commentList'),
  routing: state.get('routing'),
}))
export default class Comment extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    fetch: React.PropTypes.func.isRequired,
    getPath: PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
  }

  onChange = this.context.onChange

  state = {
    loading: false,
  }


  componentDidMount() {
    var props = this.props
    var commentList = this.props.commentList
    if (commentList.get('path') != this.context.getPath(props)) {
      props.dispatch(actions.clearCommentList())
      this.fetch(props)
    } else if (this.props.commentList.get('messages')) {
      this.props.dispatch(actions.setMessages(this.props.commentList.toJS(), 'danger', 'popup'))
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
    var props = this.props
    if (this.state.loading || this.context.getPath(props) == this.context.getPath(nextProps)) {
      return
    }
    if (!this.isMore) {
      this.props.dispatch(actions.clearCommentList())
    } else if (!props.commentList.get('more')) {
      return
    }
    this.isMore = false
    this.fetch(nextProps)
  }


  onDelete(comment) {
    return async (e) => {
      e.preventDefault();
      try {
        var result = await this.context.fetch( '/' + comment.getIn(['post', '_id']) + '/comments/' + comment.get('_id') +'/delete', {}, {})
        if (result.messages) {
          this.props.dispatch(actions.setMessages(result.messages, 'danger', 'popup'))
          return
        }
        var results = this.props.commentList.get('results')
        var index = results.indexOf(comment)
        if (index != -1) {
          results = results.splice(index, 1);
          this.props.dispatch(actions.setCommentList({results}))
        }
      } catch (e) {
        this.props.dispatch(actions.setMessages(e, 'danger', 'popup'))
      }
    }
  }



  onRestore(comment) {
    return async (e) => {
      e.preventDefault();
      try {
        var result = await this.context.fetch( '/' + comment.getIn(['post', '_id']) + '/comments/' + comment.get('_id') +'/restore', {}, {})
        if (result.messages) {
          this.props.dispatch(actions.setMessages(result.messages, 'danger', 'popup'))
          return
        }
        var results = this.props.commentList.get('results')
        var index = results.indexOf(comment)
        if (index != -1) {
          results = results.splice(index, 1);
          this.props.dispatch(actions.setCommentList({results}))
        }
      } catch (e) {
        this.props.dispatch(actions.setMessages(e, 'danger', 'popup'))
      }
    }
  }


  onMore = (e) => {
    e.preventDefault();
    this.isMore = true
    this.context.router.push(e.target.pathname + e.target.search)
  }


  onReply(parent) {
    return (e) => {
      e && e.preventDefault()
      this.setState({parent}, () => {
        this.refs.content && this.refs.content.focus()
      })
    }
  }


  async fetch(props) {
    if (this.state.loading) {
      return false
    }
    this.setState({loading: true})
    try {
      var result = await this.context.fetch('/comments', props.location.query)
      if (result.messages) {
        props.dispatch(actions.setMessages(result, 'danger', 'popup'))
        return
      }
      result.path = this.context.getPath(props)
      props.dispatch(actions.addCommentList(result))
    } catch (e) {
      props.dispatch(actions.setMessages([e, '请重试'], 'danger', 'popup'))
    } finally {
      this.setState({loading: false})
    }
  }






  onSubmit = async (e) => {
    e.preventDefault();
    if (this.state.disabled) {
      return
    }

    var parent = this.state.parent

    var body = {
      author: this.state.author,
      email: this.state.email,
      content: this.state.content,
    }

    body.parent = parent.get('_id')

    this.setState({disabled: true});

    try {
      var result = await this.context.fetch(parent.getIn(['post', 'commentUri']) + '/create', {}, body)
      if (result.messages) {
        this.props.dispatch(actions.setMessages(result))
        this.setState({disabled: false})
        return
      }
      this.setState({parent: null, content: ''})
      this.props.dispatch(actions.addCommentList({results: [result]}))
      localStorage.setItem('email', body.email)
      localStorage.setItem('author', body.author)
    } catch (e) {
      this.props.dispatch(actions.setMessages(e))
    } finally {
      this.setState({disabled: false});
    }
  }



  render () {
    var commentList = this.props.commentList


    var headers = {
      title: [title, site.title],
      breadcrumb: [title],
      meta: [
        {name: 'robots', content:'none'},
      ],
    }

    var navigation = ''
    if (commentList.get('more')) {
      let id = commentList.get('results').size ? commentList.get('results').get(-1).get('_id') : undefined
      let to = '/comments?' + queryString.stringify(Object.assign({}, this.props.location.query, {id}))
      navigation = <nav className="navigation pagination" role="navigation">
        {!this.state.loading && commentList.get('more') ? <Link to={to} className="more" onClick={this.onMore} rel="next">加载更多</Link> : ''}
        {this.state.loading ? <Loading></Loading> : ''}
      </nav>
    }


    var section = <section id="comments">
      <ol id="comments-list">
        {commentList.get('results').map((comment) => {
          var createdAt = moment(comment.get('createdAt')).format()
          var parent = comment.get('parent')
          var post = comment.get('post') && comment.get('post').get ?  comment.get('post') : null
          var says
          if (parent) {
            says = <span className="says">对 <strong>{parent.get('author')}</strong> 说</span>
          } else {
            says = <span className="says">说</span>
          }
          var form = ''
          if (this.state.parent && this.state.parent.get('_id') == comment.get('_id')) {
            form = <form role="form" method="post" id="comments-form" onSubmit={this.onSubmit}>
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
          }

          return (
            <li key={comment.get('_id')} className={comment.get('admin') ? 'comment-admin' : ''}>
              <header className="comment-meta">
                <div className="comment-author"><img src={comment.get('avatar')} className="avatar photo" /></div>
                <div className="actions">
                  {comment.get('deletedAt') ? <a className="restore" href="#" rel="nofollow" onClick={this.onRestore(comment)}>恢复</a> : <a className="delete" href="#" rel="nofollow" onClick={this.onDelete(comment)}>删除</a>}
                  {post && post.get('comment') ? <a className="reply" href="#" rel="nofollow" onClick={this.onReply(comment)}>回复</a> : ''}
                </div>
                <div className="text">
                  <span className="author vcard">{comment.get('author')}</span>
                  {post ? <span className="title">在 <Link to={post.get('uri')} title={post.get('title')}>{post.get('title').length > 16 ? post.get('title').substr(0, 13) + '...' : post.get('title')}</Link></span> : ''}
                  {says}
                  <span className="time"><time dateTime={createdAt} title={createdAt}>{moment(comment.get('createdAt')).fromNow()}</time></span>
                </div>
              </header>
              <View className="content comment-content" html={true}>{(comment.get('htmlContent') || '')}</View>
              {form}
            </li>
          )
        })}
      </ol>
      {navigation}
    </section>


    var menu = <section id="admin-menu">
      <ul id="admin-menu-fixed" className="nav flex-column">
        <li className="nav-item">{this.props.location.query.deleted ? <Link to={this.props.location.pathname} className="nav-link">已发布</Link> : <Link to={this.props.location.pathname + "?deleted=1"} className="nav-link">回收站</Link>}</li>
      </ul>
    </section>


    return <Main {...headers}>
      {section}
      {menu}
    </Main>
  }
}
