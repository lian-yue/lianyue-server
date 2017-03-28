import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import moment from 'moment'
import queryString from 'query-string'
import actions from '../../../actions'

import Loading from '../../../components/Loading'

import Main from '../../../components/Main'

import View from '../../../components/Markdown/View'

const { site } = __CONFIG__





var componentServerMount
if (__SERVER__) {
  componentServerMount = async function componentServerMount(ctx, state) {
    state.path = this.context.getPath()
    state.tag = state.tag || null
    this.props.dispatch(actions.addPostList(state))
  }
}


@connect(state => ({
  postList: state.get('postList'),
  routing: state.get('routing'),
  token: state.get('token'),
}))

export default class Index extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
    toUrl: PropTypes.func.isRequired,
    getPath: PropTypes.func.isRequired,
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
      var result = await this.context.fetch(props.location.pathname, props.location.query)
      if (result.messages) {
        props.dispatch(actions.setMessages(result, 'danger', 'popup'))
        return
      }
      result.path = this.context.getPath(props)
      result.tag = result.tag || null
      props.dispatch(actions.addPostList(result))
    } catch (e) {
      props.dispatch(actions.setMessages([e, '请重试'], 'danger', 'popup'))
    } finally {
      this.setState({loading: false})
    }
  }


  onMore = (e) => {
    e.preventDefault();
    this.isMore = true
    this.context.router.push(e.target.pathname + e.target.search)
  }


  componentWillMount() {
    if (!__SERVER__) {
      if (this.props.postList.get('path') != this.context.getPath(this.props)) {
        this.props.dispatch(actions.clearPostList())
        this.fetch(this.props)
      }
    }
  }



  componentDidMount() {
    if (this.props.postList.get('path') == this.context.getPath(this.props) && this.props.postList.get('messages')) {
      this.props.dispatch(actions.setMessages(this.props.postList.toJS(), 'danger', 'popup'))
    }
  }


  componentWillReceiveProps(nextProps) {
    var props = this.props
    if (this.state.loading || this.context.getPath(props) == this.context.getPath(nextProps)) {
      return
    }
    if (!this.isMore) {
      this.props.dispatch(actions.clearPostList())
    } else if (!props.postList.get('more')) {
      return
    }
    this.isMore = false
    this.fetch(nextProps)
  }

  shouldComponentUpdate(nextProps, nextState) {
    var props = this.props
    var state = this.state
    if (props.postList.equals(nextProps.postList) && props.routing.equals(nextProps.routing) && state.loading == nextState.loading) {
      return false
    }
    return true
  }





  onTagState = async (e) => {
    e.preventDefault();
    var tag = this.props.postList.get('tag')
    var state = tag.get('state') == -1 ? 0 : -1
    try {
      var result = await this.context.fetch(tag.get('uri') +'/state', {}, {state})
      if (result.messages) {
        this.props.dispatch(actions.setMessages(result.messages, 'danger', 'popup'))
        return
      }
      tag = tag.set('state', state)
      this.props.dispatch(actions.setPostList({tag}))
    } catch (e) {
      this.props.dispatch(actions.setMessages(e, 'danger', 'popup'))
    }
  }

  render () {
    var headers = {
      html: {},
      title: [],
      meta: [],
      link: [],
      breadcrumb: [],
    }
    var query = {}

    var next
    var prev

    headers.html.prefix = 'og:http://ogp.me/ns/website#'

    var postList = this.props.postList

    var location = this.props.location
    var tag = postList.get('tag')

    var page = parseInt(location.query.page || 1)
    if (isNaN(page)) {
      page = 1
    }
    var search = (location.query.search || '').trim()

    if (search) {
      query.search = search
      headers.title.push('搜索 '+ search +' 的结果')
    } else if (tag) {

      headers.title.push(tag.get('names').get(0))
      headers.meta.push({name: 'keywords', content: tag.get('names').join(',')})
      headers.meta.push({name: 'description', content: tag.get('description')})
      headers.meta.push({property: 'og:description', content: tag.get('description')})
    } else if (location.query.isPage) {
      query.isPage = '1'
      headers.title.push('页面列表')
    } else {
      headers.meta.push({name: 'keywords', content: site.keywords.join(',')})
      headers.meta.push({name: 'description', content: site.description})
      headers.meta.push({property: 'og:description', content: site.description})
    }


    if (page > 1) {
      query.page = page
      headers.title.push('第' + page + '页')
    }

    headers.title.push(site.title)
    if (headers.title.length == 1) {
      headers.title.push(site.description)
    }

    headers.meta.push({property: 'og:type', content: 'website'})
    headers.meta.push({property: 'og:title', content: headers.title.join(' - ')})


    // 带有搜索 和页面列表的
    if (search || query.isPage) {
      headers.meta.push({name:'robots', content: 'none'})
    }

    headers.link.push({rel:'canonical', type: 'text/html', href: this.context.toUrl(location.pathname, query)})
    if (query.page > 1) {
      headers.link.push({rel:'prev', type: 'text/html', href: this.context.toUrl(location.pathname, Object.assign({}, query, {page:query.page == 2 ? undefined : query.page - 1}))})
      let search = queryString.stringify(Object.assign({}, query, {page:query.page == 2 ? undefined : query.page - 1}))
      prev = location.pathname + (search ? '?' + search : '')
    }

    if (postList.get('more')) {
      headers.link.push({rel:'next', type: 'text/html', href: this.context.toUrl(location.pathname, Object.assign({}, query, {page:query.page + 1})) })
      next = location.pathname + '?' + queryString.stringify(Object.assign({}, query, {page: page + 1}))
    }

    headers.link.push({rel:'alternate', type: 'application/rss+xml', title: site.title + ' » Feed', href: this.context.toUrl(location.pathname, Object.assign({}, query, {view: 'rss', page: undefined}))})


    if (search) {
      headers.breadcrumb.push('搜索结果')
    } else if (tag) {
      headers.breadcrumb.push(tag.get('names').get(0))
    } else if (query.isPage) {
      headers.breadcrumb.push('页面列表')
    } else {
      headers.breadcrumb.push('文章列表')
    }

    var h1 = ''
    if (search) {
      h1 = <h1 className="title">搜索<strong>{search}</strong>的结果</h1>
    } else if (tag) {
      h1 = <h1 className="title">标签<Link to={'/tag-' + tag.get('postUri')} title={tag.get('names').get(0)} rel="tag">{tag.get('names').get(0)}</Link>下的文章</h1>
    } else if (query.isPage) {
      h1 = <h1 className="title">页面列表</h1>
    }


    var adminMenu = ''
    if (this.props.token.get('admin')) {
      adminMenu = (
      <section id="admin-menu">
        <ul id="admin-menu-fixed" className="nav flex-column">
          <li className="nav-item">{location.query.deleted ? <Link to="/" className="nav-link">已发布</Link> : <Link to="/?deleted=1" className="nav-link">回收站</Link>}</li>
          <li className="nav-item">{query.isPage ? <Link to='/' className="nav-link">文章列表</Link> :  <Link to="/?isPage=1" className="nav-link">页面列表</Link>}</li>
          <li className="nav-item"><Link to="/create" className="nav-link">创建文章</Link></li>
          {tag && tag.get('state') != -1 ? <li className="nav-item"><Link to={tag.get('uri') + '/update'} className="nav-link">编辑标签</Link></li> : ''}
          {tag ? (<li className="nav-item"><a href="#" onClick={this.onTagState} className="nav-link">{tag.get('state') == -1 ? '启用标签' : '禁用标签'}</a></li>) : ''}
          <li className="nav-item"><Link to="/comments" className="nav-link">评论管理</Link></li>
        </ul>
      </section>
      )
    }

    return <Main {...headers}>
      <section id="content">
        <div id="posts-index">
          {h1}
          {postList.get('results').map((post, key) => {
            var createdAt = post.get('createdAt')
            if (createdAt) {
              createdAt = moment(createdAt).format()
            }
            var content = post.get('excerpt') || ''
            content  += '<p><a href="'+ post.get('uri') +'" class="more-link">继续阅读 »</a></p>'
            return (
              <article key={key} className="post entry hentry"  itemScope itemType="http://schema.org/BlogPosting">
                <header className="entry-header">
                  <h2 className="entry-title">
                    <Link to={post.get('uri')} rel="bookmark" title={post.get('title')} itemProp="headline">{post.get('title')}</Link>
                  </h2>
                  <div className="entry-meta">
                    <time className="entry-date" itemProp="datePublished" dateTime={createdAt} title={createdAt}>{createdAt ? moment(post.get('createdAt')).fromNow() : ''}</time>
                    <span className="comments-link">
                      <Link href={post.get('uri') + "#comments"} rel="nofollow">{(post.get('meta').get('comments') || 0) + '条评论'}</Link>
                    </span>
                  </div>
                </header>
                <View className="content entry-content" itemProp="articleBody" html={true}>{content}</View>
              </article>
            )
          })}
          <nav className="navigation pagination" role="navigation">
            {this.state.loading ? <Loading></Loading> : ''}
            {next && !this.state.loading ? <Link to={next} className="more" onClick={this.onMore} rel="next">加载更多</Link> : ''}
            {next || this.state.loading ? '' : <span className="loaded">全部已加载完毕</span>}
            {prev ? <Link to={prev} className="prev" rel="prev">上一页</Link> : ''}
            {next ? <Link to={next} className="next" rel="next">下一页</Link> : ''}
          </nav>
          {adminMenu}
        </div>
      </section>
    </Main>
  }
}
