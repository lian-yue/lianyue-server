import React, { Component, PropTypes } from 'react'
import { Link, IndexLink } from 'react-router'

import { connect } from 'react-redux'
import { fromJS } from 'immutable';


import actions from '../actions'

@connect(state => ({}))
export default class Main extends Component {
  static propTypes = {
    html: PropTypes.object,
    title: PropTypes.array,
    meta: PropTypes.array,
    link: PropTypes.array,
    breadcrumb: PropTypes.array,
    className: PropTypes.string,
  }

  static defaultProps = {
    html: {},
    title: [],
    meta: [],
    link: [],
    breadcrumb: [],
    className: '',
  }

  componentWillMount() {
    const {title, meta, link, html, breadcrumb} = this.props;
    var headers = {title, meta, link, html}
    if (!this.headers || !this.headers.equals(fromJS(headers))) {
      this.props.dispatch(actions.setHeaders(headers));
      this.headers = fromJS(headers)
    }
  }

  componentDidUpdate() {
    this.componentWillMount()
  }

  componentWillUnmount() {
    this.props.dispatch(actions.setHeaders({html: {}, title: [], meta:[], link:[]}));
  }

  onSearch = (e) => {
    e.preventDefault();
    this.context.router.push('/?search=' + encodeURIComponent(this.refs.search.value || ''));
    this.refs.search.blur()
  }


  onHeaderToggle(e) {
    e.preventDefault()
    document.body.className = document.body.className.replace(/\s*header-open\s*/, '') + ' header-open'
  }


  render () {
    var activeKey = this.props.breadcrumb.length - 1
    const breadcrumb = this.props.breadcrumb.map(function(value, key) {
      if (typeof value != 'string') {
        value = <Link to={value.to}>{value.name}</Link>
      }
      return <li key={key} className={key == activeKey ? 'active' : ''}>{value}</li>
    });

    return <div className="main-component">
      <div id="breadcrumb-bar" key="breadcrumb">
        <div id="header-toggle">
          <button type="button" className="btn btn-header-toggle" onClick={this.onHeaderToggle}><i className="fa fa-bars fa-lg"></i><span>菜单</span></button>
        </div>
        <ol className="breadcrumb" id="breadcrumb" itemProp="breadcrumb">
          <li><Link to="/" rel="home"><i className="fa fa-home"></i>首页</Link></li>
          {breadcrumb}
        </ol>
        <form id="search-form" method="get" action="/" onSubmit={this.onSearch}>
          <label htmlFor="search"><i className="fa fa-search fa-lg"></i><span>搜索:</span></label>
          <input type="search" ref="search" id="search" className="form-control" name="search" placeholder="请输入关键字" required />
          <button type="submit" className="btn btn-primary">搜索</button>
        </form>
      </div>
      <main id="main" role="main" className={this.props.className} key="main">
        {this.props.children}
      </main>
    </div>
  }
}
