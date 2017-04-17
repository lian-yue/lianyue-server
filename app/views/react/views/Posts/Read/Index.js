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


  async fetch(props) {
    if (this.state.loading) {
      return false
    }
    this.setState({loading: true})
    var path = this.context.getPath(props)
    await props.dispatch(actions.setPostRead({path}))
    try {
      var result = await this.context.fetch(props.location.pathname, props.location.search)
      result.path = path
      await props.dispatch(actions.setPostRead(result))
    } catch (e) {
      await props.dispatch(actions.setMessages(e, 'danger', 'popup'))
    } finally {
      this.setState({loading: false})
    }
  }


  componentWillMount() {
    if (__SERVER__) {
      return
    }
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    var props = this.props
    if (this.state.loading || nextProps.postRead.get('path') == this.context.getPath(nextProps)) {
      return
    }
    props.dispatch(actions.clearPostRead())
    this.fetch(nextProps)
  }



  onDelete = async (e) => {
    e.preventDefault();
    try {
      var result = await this.context.fetch(this.props.postRead.get('url') +'/delete', {}, {})
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
      var result = await this.context.fetch(this.props.postRead.get('url') +'/restore', {}, {})

      this.props.dispatch(actions.clearPostRead())
      this.props.dispatch(actions.clearPostList())

      this.props.history.push(this.props.location.pathname + '?r=' + Date.now())
    } catch (e) {
      this.props.dispatch(actions.setMessages(e, 'danger', 'popup'))
    }
  }




  render () {
    var post = this.props.postRead;
    if (this.state.loading || !post.get('_id')) {
      return <Main
        status={this.state.loading ? 200 : 404}
        title={["文章内容", site.title]}
        meta={[
          {name: 'robots', content:'none'},
        ]}
        breadcrumb={['文章内容']}
        statistics={false}
        >
        <section id="content">{this.state.loading ? <Loading size="xl" middle={true} /> : ''}</section>
      </Main>
    }



    var prev = post.get('prev')
    var next = post.get('next')
    var createdAt = moment(post.get('createdAt')).format()
    var postUrl = post.get('url') || '/'

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
      href: this.context.toUrl(postUrl),
    })

    if (prev) {
      headers.link.push({
        rel: 'prev',
        type: "text/html",
        title: prev.get('title'),
        href: this.context.toUrl(prev.get('url')),
      })
    }

    if (next) {
      headers.link.push({
        rel: 'next',
        type: "text/html",
        title: next.get('title'),
        href: this.context.toUrl(next.get('url')),
      })
    }


    if (post.get('page')) {
      headers.breadcrumb.push(post.get('title'))
    } else {
      if (post.get('tags').size && post.getIn(['tags', 0])) {
        var tag = post.getIn(['tags', 0])
        headers.breadcrumb.push({to: tag.get('postUrl'), name: tag.getIn(['names', 0])})
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
          return <Link key={tag.get('_id')}  to={tag.get('postUrl')} rel="tag">{tag.getIn(['names', 0])}</Link>
        })}
         </span>
      </p>
    }


    var footer = ''
    if (!post.get('page') && post.get('_id')) {
      footer = <footer className="entry-footer">
        <p>原文链接：<Link to={postUrl}>{this.context.toUrl(postUrl)}</Link></p>
        <p>发表时间：<time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{createdAt ? moment(post.get('createdAt')).format('YYYY-MM-DD hh:mm:ss') : ''}</time></p>
        {footerTags}
      </footer>
    }







    var menu = ''
    if (post.get('_id') && this.props.token.get('admin')) {
      menu = (
        <section id="admin-menu">
          <ul id="admin-menu-fixed" className="nav flex-column">
            <li className="nav-item"><Link to={postUrl + '/update'} className="nav-link">编辑</Link></li>
            <li className="nav-item">{post.get('deletedAt') ? <a href="#" onClick={this.onRestore} className="nav-link">恢复</a> : <a href="#" onClick={this.onDelete} className="nav-link">删除</a>}</li>
          </ul>
        </section>
      )
    }

    var pagination = ''

    if (prev || next) {
      pagination = <nav className="pagination posts-pagination">
        {prev ? <Link to={prev.get('url')} className="prev" rel="prev">{prev.get('title')}</Link> : ''}
        {next ? <Link to={next.get('url')} className="next" rel="next">{next.get('title')}</Link> : ''}
      </nav>
    }

    return <Main {...headers}>
      <section id="content">
        <div id="posts-read">
          <article className="markdown entry hentry" itemScope itemType="http://schema.org/BlogPosting">
            <header className="entry-header">
              <h1 className="entry-title">
                <Link to={postUrl} rel="bookmark" title={post.get('title')} itemProp="headline">{post.get('title')}</Link>
              </h1>
              <div className="entry-meta">
                <time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{moment(post.get('createdAt')).fromNow()}</time>
                <span className="entry-views">
                  {post.getIn(['meta', 'views']) + '次浏览'}
                </span>
                <span className="comments-link">
                  <Link to={postUrl + "#comments"} rel="nofollow">{post.getIn(['meta', 'comments']) + '条评论'}</Link>
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
