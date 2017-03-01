import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import queryString from 'query-string'
import moment from 'moment'

const { site } = __CONFIG__

import View from '../parts/markdown/View'
import Breadcrumb from '../parts/Breadcrumb'

export default class IndexComponent extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    fetch: React.PropTypes.func.isRequired,
    toUrl: React.PropTypes.func.isRequired,
  }

  state = {
    results: [],
    more: true,
    loading: false,
    links: false,
  }


  // 服务端拉数据
  static fetchServer(state, store, params, ctx) {
    var res;
    if (__SERVER__) {
      res = async () => {
        if (ctx.request.path == '/' && !ctx.request.search) {
          const Post = require('../../../../models/post');
          var post = await Post.findOne({slug: 'links'}, {excerpt: 1}).exec()
          if (post) {
            state.links = post.get('excerpt')
          }
        }
      }
      res = res()
    }
    return res;
  }

  componentWillMount() {
    if (this.props.componentState) {
      this.setState(this.props.componentState)
      this.setMeta(this.props.componentState)
    }
  }

  componentDidMount() {
    if (!this.props.componentState) {
      this.fetch(this.props)
    } else if (this.state.messages) {
      this.props.setMessages(this.state.messages, 'danger', 'popup')
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
      this.setState({results:[], tag: null, more: true})
    }
    this.isMore = false
    this.fetch(nextProps)
  }

  onMore = (e) => {
    this.isMore = true
  }

  setMeta(state) {
    var location = this.props.location
    var tag = state.tag

    var page = parseInt(location.query.page || 1)
    if (isNaN(page)) {
      page = 1
    }
    var search = (location.query.search || '').trim()

    var meta = {
      title: [],
      'rel:alternate': [],
      'rel:canonical': [],
    }

    var query = {}


    if (search) {
      query.search = search
      meta.title.push('搜索 '+ search +' 的结果')
    } else if (tag) {
      meta.title.push(tag.names[0])
      meta.keywords = tag.name
      meta.description = tag.description
    } else if (location.query.isPage) {
      meta.title.push('页面列表')
    } else {
      meta.keywords = site.keywords,
      meta.description = site.description
    }

    // 带有搜索 和页面列表的
    if (search || location.query.isPage) {
      meta.robots = 'none'
    }

    if (page > 1) {
      query.page = page
      meta.title.push('第' + page + '页')
    }
    meta.title.push(site.title)
    if (meta.title.length == 1) {
      meta.title.push(site.description)
    }


    meta['rel:canonical'].push({
      type: 'text/html',
      href: this.context.toUrl(location.pathname, query)
    });

    if (query.page > 1) {
      meta['rel:prev'] = {
        type: 'text/html',
        href: this.context.toUrl(location.pathname, Object.assign({}, query, {page:query.page == 2 ? undefined : query.page - 1}))
      }
    }
    if (state.more) {
      meta['rel:next'] = {
        type: 'text/html',
        href: this.context.toUrl(location.pathname, Object.assign({}, query, {page:query.page + 1}))
      }
    }
    meta['og:type'] = 'website'
    meta['og:title'] = meta.title.join(' - ')
    meta['og:description'] = meta.description

    meta['rel:alternate'].push({
      type: 'application/rss+xml',
      title:  site.title + ' » Feed',
      href: this.context.toUrl(location.pathname, Object.assign({}, query, {view: 'rss', page: undefined})),
    })

    this.props.setMeta(meta)
  }


  async fetch(props) {
    if (this.state.loading) {
      return false
    }
    this.setState({loading: true})
    try {
      var result = await this.context.fetch(props.location.pathname, props.location.query)
      if (result.messages) {
        props.setMessages(result, 'danger', 'popup')
      } else {
        result.results = this.state.results.concat(result.results)
      }
      result.loading = false
      this.setState(result)
      this.setMeta(result)
    } catch (e) {
      props.setMessages([e, '请重试'], 'danger', 'popup')
      this.setState({loading: false})
    }
    if (this.state.links === false && props.location.pathname == '/' && !props.location.search) {
      this.setState({links: ''})
      try {
        var result = await this.context.fetch('/links', {record: ''})
        if (result.excerpt) {
          this.setState({links: result.excerpt})
        }
      } catch (e) {
      }
    }
  }


  onTagState = async (e) => {
    e.preventDefault();
    var tag = this.state.tag
    var state = tag.state == -1 ? 0 : -1
    try {
      var result = await this.context.fetch(tag.uri +'/state', {}, {state})
      if (result.messages) {
        this.props.setMessages(result.messages, 'danger', 'popup')
        return
      }
      tag.state = state
      this.setState({tag})
    } catch (e) {
      this.props.setMessages(e, 'danger', 'popup')
    }
  }

  render () {
    var location = this.props.location
    var query = location.query
    var tag = this.state.tag
    var search = (query.search || '').trim()

    var page = parseInt(query.page || 1)
    if (isNaN(page)) {
      page = 1
    }
    var next
    var prev
    if (page > 1) {
      let search = queryString.stringify(Object.assign({}, query, {page:query.page == 2 ? undefined : query.page - 1}))
      prev = location.pathname + (search ? '?' + search : '')
    }
    if (this.state.more) {
      next = location.pathname + '?' + queryString.stringify(Object.assign({}, query, {page: page + 1}))
    }

    var breadcrumb
    if (search) {
      breadcrumb = '搜索结果'
    } else if (tag) {
      breadcrumb = tag.names[0]
    } else if (this.props.params && this.props.params.tag) {
      breadcrumb = '标签'
    } else if (location.query.isPage) {
      breadcrumb = '页面列表'
    } else {
      breadcrumb = '文章列表'
    }


    var title = ''
    if (search) {
      title = <h1 className="title">搜索<strong>{search}</strong>的结果</h1>
    } else if (this.state.tag) {
      var tag = this.state.tag
      title = <h1 className="title">标签<Link to={'/tag-' + tag.postUri} title={tag.names[0]} rel="tag">{tag.names[0]}</Link>下的文章</h1>
    } else if (location.query.isPage) {
      title = <h1 className="title">页面列表</h1>
    }


    var adminMenu = ''
    if (this.props.token.admin) {
      tag = this.state.tag
      adminMenu = (
      <section id="admin-menu">
        <ul id="admin-menu-fixed" className="nav flex-column">
          <li className="nav-item">{this.props.location.query.deleted ? <Link to="/" className="nav-link">已发布</Link> : <Link to="/?deleted=1" className="nav-link">回收站</Link>}</li>
          <li className="nav-item">{query.isPage ? <Link to='/' className="nav-link">文章列表</Link> :  <Link to="/?isPage=1" className="nav-link">页面列表</Link>}</li>
          <li className="nav-item"><Link to="/create" className="nav-link">创建文章</Link></li>
          {tag && tag.state != -1 ? <li className="nav-item"><Link to={tag.uri + '/update'} className="nav-link">编辑标签</Link></li> : ''}
          {tag ? (<li className="nav-item"><a href="#" onClick={this.onTagState} className="nav-link">{tag.state == -1 ? '启用标签' : '禁用标签'}</a></li>) : ''}
          <li className="nav-item"><Link to="/comments" className="nav-link">评论管理</Link></li>
        </ul>
      </section>
      )
    }


    return (
      <div id="posts-index">
        <Breadcrumb>{breadcrumb}</Breadcrumb>
        <main id="main" role="main">
          <section id="content">
            {title}
            {this.state.results.map((post) => {
              var createdAt = post.createdAt ? moment(post.createdAt).format() : ''
              var content = post.excerpt || ''
              content  += '<p><a href="'+ post.uri +'" class="more-link">继续阅读 »</a></p>'
              return (
                <article key={post._id} className="post entry hentry"  itemScope itemType="http://schema.org/BlogPosting">
                  <header className="entry-header">
                    <h2 className="entry-title">
                      <Link to={post.uri} rel="bookmark" title={post.title} itemProp="headline">{post.title}</Link>
                    </h2>
                    <div className="entry-meta">
                      <time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{createdAt ? moment(post.createdAt).fromNow() : ''}</time>
                      <span className="comments-link">
                        <Link href={post.uri + "#comments"} rel="nofollow">{(post.meta.comments  ? post.meta.comments : 0) + '条评论'}</Link>
                      </span>
                    </div>
                  </header>
                  {<View className="content entry-content" itemProp="articleBody" html={true}>{content}</View>}
                </article>
              )
            })}
            <nav className="navigation" role="navigation">
              {next ? <Link to={next} className="more" onClick={this.onMore} rel="next">{this.state.loading ? '载入中...' : '加载更多'}</Link> : <span className="more">全部已加载完毕</span>}
              {prev ? <Link to={prev} className="prev" rel="prev">上一页</Link> : ''}
              {next ? <Link to={next} className="next" rel="next">下一页</Link> : ''}
            </nav>
          </section>
          {location.pathname == '/' && !location.search && this.state.links ? <section id="links" dangerouslySetInnerHTML={{__html: '<h2 class="title">友情链接</h2>' + this.state.links}}></section> : ''}
          {adminMenu}
        </main>
      </div>
    )
  }
}
