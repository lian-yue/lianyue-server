import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import queryString from 'query-string'
import moment from 'moment'

import site from 'config/site'

import actions from '../../../actions'


import View from '../../../components/Markdown/View'
import Loading from '../../../components/Loading'

import Main from '../../../components/Main'

import Comment from '../Comment'







var componentServerMount
if (__SERVER__) {
  componentServerMount = async function componentServerMount(ctx, state) {
    if (!state) {
      return
    }
    state.path = this.context.getPath()
    this.props.dispatch(actions.setPostRead(state))
  }
}





@connect(state => ({
  postRead: state.get('postRead'),
  router: state.get('router'),
  token: state.get('token'),
}))
export default class Read extends Component {
  static contextTypes = {
    fetch: PropTypes.func.isRequired,
    getPath: PropTypes.func.isRequired,
    toUrl: PropTypes.func.isRequired,
  }

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
      var result = await this.context.fetch(props.location.pathname, props.location.search)
      result.path = this.context.getPath(this.props)
      props.dispatch(actions.setPostRead(result))
      if (result.messages) {
        props.dispatch(actions.setMessages(result, 'danger', 'popup'))
      }
    } catch (e) {
      props.dispatch(actions.setMessages([e, '请重试'], 'danger', 'popup'))
    } finally {
      this.setState({loading: false})
    }
  }


  componentWillMount() {
    if (!__SERVER__) {
      if (this.props.postRead.get('path') != this.context.getPath(this.props)) {
        this.props.dispatch(actions.clearPostRead())
        this.fetch(this.props)
      }
    }
  }


  componentDidMount() {
    if (this.props.postRead.get('path') == this.context.getPath(this.props) && this.props.postRead.get('messages')) {
      this.props.dispatch(actions.setMessages(this.props.postRead.toJS(), 'danger', 'popup'))
    }
  }

  componentWillReceiveProps(nextProps) {
    var props = this.props
    if (this.state.loading || this.context.getPath(props) == this.context.getPath(nextProps)) {
      return
    }
    props.dispatch(actions.clearPostRead())
    this.fetch(nextProps)
  }





  onDelete = async (e) => {
    e.preventDefault();
    try {
      var result = await this.context.fetch(this.props.postRead.get('uri') +'/delete', {}, {})
      if (result.messages) {
        this.props.dispatch(actions.setMessages(result.messages, 'danger', 'popup'))
        return
      }
      this.props.dispatch(actions.clearPostRead())
      this.props.dispatch(actions.clearPostList())

      this.props.history.push(this.props.location.pathname + '?r=' + Date.now())
    } catch (e) {
      this.props.dispatch(actions.setMessages(e, 'danger', 'popup'))
    }
  }

  onRestore = async (e) => {
    e.preventDefault();
    try {
      var result = await this.context.fetch(this.props.postRead.get('uri') +'/restore', {}, {})
      if (result.messages) {
        this.props.dispatch(actions.setMessages(result.messages, 'danger', 'popup'))
        return
      }

      this.props.dispatch(actions.clearPostRead())
      this.props.dispatch(actions.clearPostList())

      this.props.history.push(this.props.location.pathname + '?r=' + Date.now())
    } catch (e) {
      this.props.dispatch(actions.setMessages(e, 'danger', 'popup'))
    }
  }




  render () {
    var post = this.props.postRead;
    if (this.state.loading || post.get('messages')) {
      return <Main
        title={["文章内容", site.title]}
        breadcrumb={['文章内容']}
        statistics={false}
        >
        <section id="content">{this.state.loading ? <Loading size="xl" middle={true} /> : ''}</section>
      </Main>
    }



    var prev = post.get('prev')
    var next = post.get('next')
    var createdAt = moment(post.get('createdAt')).format()
    var postUri = post.get('uri') || '/'

    var headers = {
      html: {},
      title: [],
      meta: [],
      link: [],
      breadcrumb: [],
    }

    headers.html.prefix = 'og:http://ogp.me/ns/article#'
    headers.title.push(post.get('title'), site.title)


    var keywords = post.get('tags').filter(tag => !!tag).map(tag => tag.getIn(['names', 0]))

    headers.meta.push(
      {name:'description', content: post.get('description')},
      {name:'keywords', content: keywords.join(',')}
    )

    headers.meta.push(
      {property:'og:type', content: 'article'},
      {property:'og:title', content: post.get('title')},
      {property:'og:description', content: post.get('description')}
    )

    if (post.get('images').size) {
      headers.meta.push({property:'og:image', content: post.getIn(['images', 0])})
    }

    headers.meta.push({property:'article:author', content: '恋月 @' + site.author})
    headers.meta.push({property:'article:tag', content: keywords.join(',')})
    headers.meta.push({property:'article:published_time', content: createdAt})
    headers.meta.push({property:'article:modified_time', content: moment(post.get('updatedAt')).format()})


    headers.link.push({
      rel: 'canonical',
      type: "text/html",
      href: this.context.toUrl(postUri),
    })

    if (prev) {
      headers.link.push({
        rel: 'prev',
        type: "text/html",
        title: prev.get('title'),
        href: this.context.toUrl(prev.get('uri')),
      })
    }

    if (next) {
      headers.link.push({
        rel: 'next',
        type: "text/html",
        title: next.get('title'),
        href: this.context.toUrl(next.get('uri')),
      })
    }


    if (post.get('page')) {
      headers.breadcrumb.push(post.get('title'))
    } else {
      if (post.get('tags').size && post.getIn(['tags', 0])) {
        var tag = post.getIn(['tags', 0])
        headers.breadcrumb.push({to: tag.get('postUri'), name: tag.getIn(['names', 0])})
      }
      headers.breadcrumb.push('文章内容')
    }


    var footerTags = ''
    if (!post.get('page') && post.get('tags').size) {
      footerTags = <p className="tag-links">
        分类标签：<span itemProp="keywords">
        {post.get('tags').map((tag) => {
          if (!tag) {
            return
          }
          return <Link key={tag.get('_id')}  to={tag.get('postUri')} rel="tag">{tag.getIn(['names', 0])}</Link>
        })}
         </span>
      </p>
    }


    var footer = ''
    if (!post.get('page') && post.get('_id')) {
      footer = <footer className="entry-footer">
        <p>原文链接：<Link to={postUri}>{this.context.toUrl(postUri)}</Link></p>
        <p>发表时间：<time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{createdAt ? moment(post.get('createdAt')).format('YYYY-MM-DD hh:mm:ss') : ''}</time></p>
        {footerTags}
      </footer>
    }







    var menu = ''
    if (post.get('_id') && this.props.token.get('admin')) {
      menu = (
        <section id="admin-menu">
          <ul id="admin-menu-fixed" className="nav flex-column">
            <li className="nav-item"><Link to={postUri + '/update'} className="nav-link">编辑</Link></li>
            <li className="nav-item">{post.get('deletedAt') ? <a href="#" onClick={this.onRestore} className="nav-link">恢复</a> : <a href="#" onClick={this.onDelete} className="nav-link">删除</a>}</li>
          </ul>
        </section>
      )
    }

    var pagination = ''

    if (prev || next) {
      pagination = <nav className="pagination posts-pagination">
        {prev ? <Link to={prev.get('uri')} className="prev" rel="prev">{prev.get('title')}</Link> : ''}
        {next ? <Link to={next.get('uri')} className="next" rel="next">{next.get('title')}</Link> : ''}
      </nav>
    }

    return <Main {...headers}>
      <section id="content">
        <div id="posts-read">
          <article className="markdown entry hentry" itemScope itemType="http://schema.org/BlogPosting">
            <header className="entry-header">
              <h1 className="entry-title">
                <Link to={postUri} rel="bookmark" title={post.get('title')} itemProp="headline">{post.get('title')}</Link>
              </h1>
              <div className="entry-meta">
                <time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{moment(post.get('createdAt')).fromNow()}</time>
                <span className="entry-views">
                  {post.getIn(['meta', 'views']) + '次浏览'}
                </span>
                <span className="comments-link">
                  <Link to={postUri + "#comments"} rel="nofollow">{post.getIn(['meta', 'comments']) + '条评论'}</Link>
                </span>
              </div>
            </header>
            <View className="content entry-content" itemProp="articleBody" html={true}>{post.get('htmlContent')}</View>
            {footer}
          </article>
          {pagination}
        </div>
      </section>
      <Comment inline={true} location={this.props.location} history={this.props.history} match={this.props.match} />
      {menu}
    </Main>
  }
}
