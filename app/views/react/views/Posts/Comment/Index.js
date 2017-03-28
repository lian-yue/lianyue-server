import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import queryString from 'query-string'
import moment from 'moment'
import site from 'config/site'


import actions from '../../../actions'


import View from '../../../components/Markdown/View'

import Messages from '../../../components/Messages'

import Loading from '../../../components/Loading'

import Main from '../../../components/Main'


const title = '评论'


var componentServerMount
if (__SERVER__) {
  componentServerMount = async function componentServerMount(ctx, state) {
    if (this.props.inline) {
      if (state._id) {
        const Comment = require('../../../../../models/comment');
        const Comments = require('../../../../../viewModels/posts/comments/index');
        await Comments(ctx, null, {})
        state = ctx.getViewState()
        state.path = this.context.getPath()
        this.props.dispatch(actions.addCommentList(state))
      }
      return
    }

    state.path = this.context.getPath()
    this.props.dispatch(actions.addCommentList(state))
  }
}


@connect(state => ({
  commentList: state.get('commentList'),
  router: state.get('router'),
  token: state.get('token'),
}))
export default class Comment extends Component {
  static contextTypes = {
    fetch: PropTypes.func.isRequired,
    getPath: PropTypes.func.isRequired,
    toUrl: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  }


  onChange = this.context.onChange

  state = {
    loading: false,
  }

  componentServerMount = componentServerMount


  async fetch(props) {
    if (this.state.loading) {
      return false
    }
    this.setState({loading: true})
    try {
      var result = await this.context.fetch('/' + props.match.params.slug + '/comments', props.inline ? {} : props.location.search)
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


  onMore = (e) => {
    e.preventDefault();
    this.isMore = true
    this.props.history.push(e.target.pathname + e.target.search)
  }


  componentWillMount() {
    if (!__SERVER__) {
      var props = this.props
      var commentList = this.props.commentList
      if (commentList.get('path') != this.context.getPath(props)) {
        props.dispatch(actions.clearCommentList())
        this.fetch(props)
      }
    }
  }

  componentDidMount() {
    if (this.props.commentList.get('path') == this.context.getPath(this.props) && this.props.commentList.get('messages')) {
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

  onMore = (e) => {
    e.preventDefault();
    this.isMore = true
    this.props.history.push(e.target.pathname + e.target.search)
  }


  onReply(parent) {
    return (e) => {
      e && e.preventDefault()
      this.setState({parent})
      this.refs.content.focus()
    }
  }


  onSubmit = async (e) => {
    e.preventDefault();
    if (this.state.disabled) {
      return
    }

    var body = {
      author: this.state.author,
      email: this.state.email,
      content: this.state.content,
    }

    if (this.state.parent) {
      body.parent = this.state.parent.get('_id')
    }

    this.setState({disabled: true});

    try {
      var result = await this.context.fetch(this.props.commentList.getIn(['post', 'commentUri']) + '/create', {}, body)
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




  onDelete(comment) {
    return async (e) => {
      e.preventDefault();
      try {
        var result = await this.context.fetch( '/' + this.props.match.params.slug + '/comments/' + comment.get('_id') +'/delete', {}, {})
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
        var result = await this.context.fetch( '/' + this.props.match.params.slug + '/comments/' + comment.get('_id') +'/restore', {}, {})
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


  render () {
    var commentList = this.props.commentList
    var post = commentList.get('post')
    var result
    if (commentList.get('messages')) {
      result = <section id="comment"></section>
      if (this.props.inline) {
        return result
      }
      return <Main
        statistics={false}
        title={[title, site.title]}
        breadcrumb={[title]} >
        {result}
      </Main>
    }

    var locationQuery = queryString.parse(this.props.location.search)



    var navigation = ''
    if (commentList.get('more')) {
      let index = commentList.get('results').size ? commentList.get('results').get(-1).get('index') : undefined
      let to = '/' + this.props.match.params.slug + '/comments?' + queryString.stringify(Object.assign({}, locationQuery, {index}))
      navigation = <nav className="navigation pagination" role="navigation">
        {!this.state.loading && commentList.get('more') ? <Link to={to} className="more" onClick={this.onMore} rel="next">加载更多</Link> : ''}
        {this.state.loading ? <Loading></Loading> : ''}
      </nav>
    }


    var form = ''
    if (post.get('comment')) {
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
            {this.state.parent ? <span className="reply-info">您正在回复 <strong>{this.state.parent.get('author')}</strong> 的评论 <a rel="nofollow" className="cancel-reply" href="#" onClick={this.onReply(null)}>点击这里取消回复。</a></span> : ''}
          <textarea id="comment-content" name="content" className="form-control"  ref="content" value={this.state.content || ''} maxLength="8192" required onChange={this.onChange()} ></textarea>
          <p>支持 <code>MarkDown</code> 代码, <code>Html</code> 标签</p>
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary btn-block btn-lg">提交</button>
        </div>
      </form>
    }


    var section = <section id="comments" className={this.props.inline ? "comments-inline" : ""}>
      <ol id="comments-list">
        {commentList.get('results').map((comment) => {
          var createdAt = moment(comment.get('createdAt')).format()
          var parent = comment.get('parent')
          var says
          if (parent) {
            says = <span className="says">对 <strong>{parent.get('author')}</strong> 说</span>
          } else {
            says = <span className="says">说</span>
          }

          return (
            <li key={comment.get('_id')} className={comment.get('admin') ? 'comment-admin' : ''}>
              <header className="comment-meta">
                <div className="comment-author"><img src={comment.get('avatar')} className="avatar photo" /></div>
                <div className="actions">
                  {this.props.token.get('admin') ? (comment.get('deletedAt') ? <a className="restore" href="#" rel="nofollow" onClick={this.onRestore(comment)}>恢复</a> : <a className="delete" href="#" rel="nofollow" onClick={this.onDelete(comment)}>删除</a>) : ''}
                  {post.get('comment') ? <a className="reply" href="#" rel="nofollow" onClick={this.onReply(comment)}>回复</a> : ''}
                </div>
                <div className="text">
                  <span className="author vcard">{comment.get('author')}</span>
                  {says}
                  <span className="time"><time dateTime={createdAt} title={createdAt}>{moment(comment.get('createdAt')).fromNow()}</time></span>
                </div>
              </header>
              <View className="content comment-content" html={true}>{(comment.get('htmlContent') || '')}</View>
            </li>
          )
        })}
      </ol>
      {navigation}
      {form}
    </section>




    if (this.props.inline) {
      return section
    }


    var menu = ''
    if (this.props.token.get('admin')) {
      menu = <section id="admin-menu">
        <ul id="admin-menu-fixed" className="nav flex-column">
          <li className="nav-item">{locationQuery.deleted ? <Link to={this.props.location.pathname} className="nav-link">已发布</Link> : <Link to={this.props.location.pathname + "?deleted=1"} className="nav-link">回收站</Link>}</li>
        </ul>
      </section>
    }


    var headers = {
      html: {},
      title: [],
      meta: [],
      link: [],
      breadcrumb: [],
    }

    headers.title.push('评论', post.get('title'), site.title)

    var postTitle = post.get('title')
    if (postTitle) {
      headers.breadcrumb.push({
        to: post.get('uri'),
        name: postTitle.length > 16 ? postTitle.substr(0, 13) + '...' : postTitle.substr(0, 16)
      })
    }

    headers.breadcrumb.push('评论')

    return <Main {...headers}>
      {section}
      {menu}
    </Main>
  }
}
