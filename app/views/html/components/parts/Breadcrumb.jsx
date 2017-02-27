import React, { PureComponent } from 'react'
import { Link } from 'react-router'

export default class BreadcrumbComponent extends PureComponent {
  onHeaderToggle(e) {
    e.preventDefault()
    document.body.className = document.body.className.replace(/\s*header-open\s*/, '') + ' header-open'
  }

  render () {
    var children = this.props.children
    if (!(children instanceof Array)) {
      children = [children]
    }
    var li = []
    for (var i = 0; i < children.length; i++) {
      li.push(<li key={i} className={i == (children.length - 1) ? 'active' : ''}>{children[i]}</li>)
    }
    return (
      <div id="breadcrumb-bar">
        <div id="header-toggle">
          <button type="button" className="btn btn-header-toggle" onClick={this.onHeaderToggle}><i className="fa fa-bars fa-lg"></i><span>菜单</span></button>
        </div>
        <ol className="breadcrumb" id="breadcrumb" itemProp="breadcrumb">
          <li><Link to="/" rel="home"><i className="fa fa-home"></i>首页</Link></li>
          {li}
        </ol>
        <form id="search-form" method="get" action="/">
            <label htmlFor="search"><i className="fa fa-search fa-lg"></i><span>搜索:</span></label>
            <input type="search" defaultValue="" id="search" className="form-control" name="search" onChange={this.onChange} placeholder="请输入关键字" required />
            <button type="submit" className="btn btn-primary">搜索</button>
        </form>
      </div>
    )
  }
}
