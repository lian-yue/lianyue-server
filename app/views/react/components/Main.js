import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'
import { fromJS } from 'immutable'


import actions from '../actions'

@connect(state => ({router: state.get('router')}))
export default class Main extends Component {
  static propTypes = {
    html: PropTypes.object,
    title: PropTypes.array,
    meta: PropTypes.array,
    link: PropTypes.array,
    breadcrumb: PropTypes.array,
    statistics: PropTypes.bool,
    className: PropTypes.string,
  }

  static defaultProps = {
    html: {},
    title: [],
    meta: [],
    link: [],
    breadcrumb: [],
    className: '',
    statistics: true
  }



  componentWillMount() {
    const {title, meta, link, html, breadcrumb} = this.props;
    var headers = {title, meta, link, html}
    if (!this.headers || !this.headers.equals(fromJS(headers))) {
      this.props.dispatch(actions.setHeaders(headers));
      this.headers = fromJS(headers)

      if (!__SERVER__) {
        if (this.timer) {
          clearTimeout(this.timer)
          this.timer = null
        }
        this.timer = setTimeout(() => {
          this.timer = null
          this.statistics()
        }, 100)
      }
    }
  }

  componentDidUpdate() {
    this.componentWillMount()
  }

  componentWillUnmount() {
    this.props.dispatch(actions.setHeaders({html: {}, title: [], meta:[], link:[]}));
    this.unStatistics()
  }

  onSearch = (e) => {
    e.preventDefault();
    this.props.dispatch(actions.router.push('/?search=' + encodeURIComponent(this.refs.search.value || '')))
    this.refs.search.blur()
  }



  statistics() {
    if (!this.props.statistics) {
      return
    }
    if (process.env.NODE_ENV == 'development') {
      return
    }

    var location = this.props.router.get('location')
    var path = location.get('pathname') + location.get('search')
    if (path == this.statisticsPath) {
      return
    }
    this.statisticsPath = path
    this.unStatistics()

    var head = document.querySelector('head');


    this.baidu = document.createElement("script");
    this.baidu.src = "//hm.baidu.com/hm.js?8789b6b101273bb744a6e97f0a7fa145";
    this.baidu.async = 1;

    this.cnzz = document.createElement("script");
    this.cnzz.src = "//s5.cnzz.com/z_stat.php?id=1842933&web_id=1842933";
    this.cnzz.async = 1;

    head.appendChild(this.baidu)
    head.appendChild(this.cnzz)

    if (!window.ga) {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    }

    ga('create', 'UA-18091019-2', 'auto');
    ga('send', 'pageview');
  }


  unStatistics() {
    if (this.baidu) {
      this.baidu.parentNode.removeChild(this.baidu)
      this.baidu = null
    }
    if (this.cnzz) {
      this.cnzz.parentNode.removeChild(this.cnzz)
      this.cnzz = null
    }
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
