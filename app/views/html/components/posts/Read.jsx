import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import queryString from 'query-string'
import moment from 'moment'

const { site } = __CONFIG__

import View from '../parts/markdown/View'
import Breadcrumb from '../parts/Breadcrumb'
import Comment from './Comment'

export default class ReadComponent extends Component {


  // 服务端拉数据
  static fetchServer(state, store, params, ctx) {
    var res;
    if (__SERVER__) {
      res = async () => {
        if (state.messages) {
          return
        }
        const Comments = require('../../../../viewModels/posts/comments/index');
        await Comments(ctx, null, {})
        state.comments = ctx.getViewState()
      }
      res = res()
    }
    return res;
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    fetch: React.PropTypes.func.isRequired,
    toUrl: React.PropTypes.func.isRequired,
  }

  state = {
    meta: {},
    tags: [],
  }

  componentWillMount() {
    if (this.props.componentState) {
      this.setState(this.props.componentState);
      this.setMeta(this.props.componentState);
    }
  }


  componentDidMount() {
    if (!this.props.componentState) {
      this.fetch(this.props)
    } else if (this.state.messages) {
      this.props.setMessages(this.state.messages, 'danger', 'popup')
    }
  }




  setMeta(state) {
    if (state.messages) {
      this.props.setMeta({title: ['错误消息', site.title]});
      return
    }
    var tags = []
    if (state.tags) {
      for (var i = 0; i < state.tags.length; i++) {
        var tag = state.tags[i]
        if (tag && tag.names && tag.names.length) {
          tags.push(tag.names[0])
        }
      }
    }

    var meta = {
      title: [state.title, site.title],
      'rel:canonical': [],
    }
    meta['rel:canonical'].push({
      type: 'text/html',
      href: this.context.toUrl(state.uri)
    });
    meta.description = state.description
    meta.keywords = tags.join(',')

    if (state.prev) {
      meta['rel:prev'] = {
        type: 'text/html',
        href: this.context.toUrl(state.prev.uri),
        title: state.prev.title,
      }
    }

    if (state.next) {
      meta['rel:next'] = {
        type: 'text/html',
        href: this.context.toUrl(state.next.uri),
        title: state.next.title,
      }
    }

    meta['rel:alternate'] = {
      type: 'application/rss+xml',
      href: this.context.toUrl(state.uri, {view: 'rss'}),
      title:  state.title + ' » RSS 2.0',
    }


    meta['og:type'] = 'article'
    meta['og:title'] = state.title
    meta['og:description'] = state.description
    if (state.images.length) {
      meta['og:image'] = state.images[0]
    }
    meta['article:author'] = ['恋月 @' + site.author]
    meta['article:tag'] = meta.keywords
    meta['article:published_time'] = moment(state.createdAt).format()
    meta['article:modified_time'] = moment(state.updatedAt).format()
    this.props.setMeta(meta);
  }


  async fetch(props) {
    this.state = {
      meta: {},
      tags: [],
    }
    this.setState({})
    try {
      var state = await this.context.fetch(props.location.pathname)
      this.setState(state)
      this.setMeta(state)
      if (state.messages) {
        props.setMessages(state.messages, 'danger', 'popup')
      }
    } catch (e) {
      props.setMessages([e, '请重试'], 'danger', 'popup')
      return
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
    this.fetch(nextProps)
  }

  onDelete = async (e) => {
    e.preventDefault();
    try {
      var result = await this.context.fetch(this.state.uri +'/delete', {}, {})
      if (result.messages) {
        this.props.setMessages(result.messages, 'danger', 'popup')
        return
      }
      this.context.router.push('/')
    } catch (e) {
      this.props.setMessages(e, 'danger', 'popup')
    }
  }

  onRestore = async (e) => {
    e.preventDefault();
    try {
      var result = await this.context.fetch(this.state.uri +'/restore', {}, {})
      if (result.messages) {
        this.props.setMessages(result.messages, 'danger', 'popup')
        return
      }
      this.context.router.push('/')
    } catch (e) {
      this.props.setMessages(e, 'danger', 'popup')
    }
  }


  render() {
    const post = this.state;

    var menu = ''
    if (post._id && this.props.token.admin) {
      menu = (
        <section id="admin-menu">
          <ul id="admin-menu-fixed" className="nav flex-column">
            <li className="nav-item"><Link to={post.uri + '/update'} className="nav-link">编辑</Link></li>
            <li className="nav-item">{post.deletedAt ? <a href="#" onClick={this.onRestore} className="nav-link">恢复</a> : <a href="#" onClick={this.onDelete} className="nav-link">删除</a>}</li>
          </ul>
        </section>
      )
    }

    var createdAt = post.createdAt ? moment(post.createdAt).format() : ''


    var footerTags = ''
    if (!post.page && post.tags && post.tags.length) {
      footerTags = (
        <p className="tag-links">
          分类标签：<span itemProp="keywords">
          {post.tags.map((tag) => {
            if (!tag || !tag.names || !tag.names.length) {
              return
            }
            return <Link key={tag._id}  to={tag.postUri} rel="tag">{tag.names[0]}</Link>
          })}
           </span>
        </p>
      )
    }
    var footer = ''
    if (!post.page && post._id) {
      footer = (
        <footer className="entry-footer">
          <p>原文链接：<Link to={this.state.uri}>{this.context.toUrl(this.state.uri)}</Link></p>
          <p>发表时间：<time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{createdAt ? moment(post.createdAt).format('YYYY-MM-DD hh:mm:ss') : ''}</time></p>
          {footerTags}
        </footer>
      )
    }

    var breadcrumb = []
    if (post.page) {
      breadcrumb.push(post.title)
    } else {
        if (post.tags && post.tags.length && post.tags[0]) {
          breadcrumb.push(<Link key="1" to={post.tags[0].postUri}>{post.tags[0].names[0]}</Link>)
        }
        breadcrumb.push('文章内容')
    }

    var commentProps = Object.assign({}, this.props)
    commentProps.inline = true
    commentProps.componentState = this.state.comments

    var nav = ''
    if (post.prev || post.next) {
      nav = (
        <nav className="pagination">
          {post.prev ? <Link to={post.prev.uri} className="prev" rel="prev">{post.prev.title}</Link> : ''}
          {post.next ? <Link to={post.next.uri} className="next" rel="next">{post.next.title}</Link> : ''}
        </nav>
      )
    }

    return (
      <div id="posts-read">
        <Breadcrumb>{breadcrumb}</Breadcrumb>
        <main id="main" role="main">
          <section id="content">
            <article className="markdown entry hentry" itemScope itemType="http://schema.org/BlogPosting">
              <header className="entry-header">
                <h1 className="entry-title">
                  <Link to={post.uri} rel="bookmark" title={post.title} itemProp="headline">{post.title}</Link>
                </h1>
                <div className="entry-meta">
                  <time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{createdAt ? moment(post.createdAt).fromNow() : ''}</time>
                  <span className="entry-views">
                    {post._id ? post.meta.views + '次浏览' : ''}
                  </span>
                  <span className="comments-link">
                    <a href="#comments" rel="nofollow">{(post.meta.comments  ? post.meta.comments : 0) + '条评论'}</a>
                  </span>
                </div>
              </header>
              <View className="content entry-content" itemProp="articleBody" html={true}>{post.htmlContent}</View>
              {footer}
            </article>
            {nav}
          </section>
          <Comment {...commentProps}></Comment>
          {menu}
        </main>
      </div>
    )
  }
}
