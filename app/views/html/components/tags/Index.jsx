import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import queryString from 'query-string'

const { site } = __CONFIG__

import Breadcrumb from '../parts/Breadcrumb'

const title = '标签列表';

export default class IndexComponent extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    fetch: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    toUrl: React.PropTypes.func.isRequired,
  }

  onChange = this.context.onChange

  state = {
    results: [],
    more: true,
    loading: false,
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
      this.setState({results:[], more: true})
    }
    this.isMore = false
    this.fetch(nextProps)
  }


  setMeta(state) {
    var location = this.props.location
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
    }

    // 带有搜索 和页面列表的
    if (search) {
      meta.robots = 'none'
    }

    meta.title.push(title)

    if (page > 1) {
      query.page = page
      meta.title.push('第' + page + '页')
    }

    meta.title.push(site.title)

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

    this.props.setMeta(meta)
  }


  async fetch(props) {
    if (this.state.loading) {
      return false
    }
    this.setState({loading: true})
    try {
      var result = await this.context.fetch('/tags', props.location.query)
      result.loading = false
      result.results = this.state.results.concat(result.results)
      this.setState(result)
      this.setMeta(result)
    } catch (e) {
      props.setMessages([e, '请重试'], 'danger', 'popup')
      this.setState({loading: false})
    }
  }


  onMore = (e) => {
    this.isMore = true
  }

  render () {
    var location = this.props.location
    var query = location.query

    var menu = ''
    if (this.props.token.admin) {
      menu = (
      <section id="admin-menu">
        <ul id="admin-menu-fixed" className="nav flex-column">
          <li className="link-item">{this.props.location.query.state == -1 ? <Link to="/tags" className="link-link">已发布</Link> : <Link to="/tags?state=-1" className="link-link">已禁用</Link>}</li>
          <li  className="link-item"><Link to="/tags/create" className="link-link">创建</Link></li>
        </ul>
      </section>
      )
    }



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

    return (
      <div id="tags-index">
        <Breadcrumb>{title}</Breadcrumb>
        <main id="main" role="main">
          <section id="content">
            <h1 className="title">标签</h1>
            <ul className="tags-list">
              {this.state.results.map((tag, key) => {
                return (
                  <li key={tag._id}><Link to={tag.postUri} rel="tag" className="btn btn-outline-primary" title={tag.names[0]}>{tag.names[0] + '('+ tag.count +')'}</Link></li>
                )
              })}
            </ul>
            <nav className="navigation" role="navigation">
              {next ? <Link to={next} className="more" onClick={this.onMore} rel="next">{this.state.loading ? '载入中...' : '加载更多'}</Link> : <span className="more">全部已加载完毕</span>}
              {prev ? <Link to={prev} className="prev" rel="prev">上一页</Link> : ''}
              {next ? <Link to={next} className="next" rel="next">下一页</Link> : ''}
            </nav>
          </section>
          {menu}
        </main>
      </div>
    )
  }
}
