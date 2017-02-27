import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import moment from 'moment'

import Editor from '../parts/markdown/Editor'

import Breadcrumb from '../parts/Breadcrumb'

import Messages from '../../containers/parts/Messages'

const { site } = __CONFIG__

export default class EditorComponent extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    fetch: React.PropTypes.func.isRequired,
  }

  onChange = this.context.onChange


  state = {
    content: '',
    parents: [],
    names: [],
    sort: 0,
    disabled: false
  }


  componentDidMount() {
    this.props.setMeta({
      title:[this.props.params.tag ? '编辑标签' : '创建标签', site.title],
      robots: 'none',
    })
    this.fetch(this.props)
  }


  async fetch(props) {
    var tag = props.params.tag
    if (!tag) {
      return
    }
    this.setState({disabled: true})
    try {
      var result = await this.context.fetch('/tags/' + tag)
      if (result.messages) {
        props.setMessages(result.messages, 'danger', 'popup')
        return
      }
      this.state.disabled = false
      this.setState(result)
    } catch (e) {
      props.setMessages([e, '请重试'], 'danger', 'popup')
    }
  }




  onSubmit = async (e) => {
    e.preventDefault();
    if (this.state.disabled) {
      return
    }
    var tag = this.props.params.tag
    var body = {
      names: typeof this.state.names == 'string' ? this.state.names.split(/,|，/) : this.state.names,
      content: this.state.content,
      parents: this.state.parents,
      sort: this.state.sort,
    }
    body.names = body.names.join(',')

    this.setState({disabled: true});

    try {
      var result = await this.context.fetch('/tags/' + (tag ?  tag : 'create'), {}, body)
      if (result.messages) {
        this.props.setMessages(result)
        this.setState({disabled: false})
        return
      }
      this.context.router.push(result.postUri + '?message=' + (tag ? 'update' : 'create') + '&r='+ Date.now())
    } catch (e) {
      this.props.setMessages(e)
      this.setState({disabled: false})
    }
  }







  onAddParents = (e) => {
    e.preventDefault();
    var addParents = this.state.addParents || ''
    addParents = addParents.trim()
    if (!addParents) {
      return
    }
    addParents = addParents.split(/,|，/)
    addParents = addParents.map(name => name.trim()).filter(name => name && name.length >= 2)
    var parents = this.state.parents.concat()

    var indexs = parents.map((tag) => {
      if (typeof tag == 'string') {
        return tag
      }
      return tag.names[0]
    })

    for (let i = 0; i < addParents.length; i++) {
      let name = addParents[i]
      name = name[0].toUpperCase() + name.substr(1)
      if (indexs.indexOf(name) != -1) {
        continue
      }
      if (parents.length >= 8) {
        alert('最多允许添加 8 个父级')
        return
      }
      indexs.push(name)
      parents.push(name)
    }
    this.setState({parents, addParents: ''})
  }

  onEnterParents = (e) => {
    if(e.keyCode == 13) {
      this.onAddParents(e)
    }
  }

  onRemoveParent(tag) {
    return (e) => {
      e.preventDefault();
      const parents = this.state.parents;
      var index = parents.indexOf(tag)
      if (index != -1) {
        parents.splice(index, 1)
      }
      this.setState({parents})
    }
  }


  render() {
    return (
      <div id="tags-editor">
        <Breadcrumb>{this.props.params.tag ? '编辑标签' : '创建标签'}</Breadcrumb>
        <main id="main" role="main">
          <section id="content">
            <form role="form" method="tag" className="form-horizontal" onSubmit={this.onSubmit} autoComplete="off">
              <Messages />
              <div className="form-group row">
                <label className="form-label" htmlFor="names">标签名: </label>
                <input type="text" className="form-control" id="names" name="names" autoComplete="off" placeholder="" value={typeof this.state.names == 'object' ? this.state.names.join(',') : this.state.names} onChange={this.onChange('names')} />
                <p className="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
              </div>
              <div className="form-group">
                <label htmlFor="content" className="form-label">内容: </label>
                <Editor id="content" rows="20" placeholder="" name="content"  value={this.state.content|| ''} onChange={this.onChange()} storage={true}></Editor>
              </div>
              <div className="form-group">
                <label htmlFor="sort" className="form-label">排序: </label>
                <input type="number" className="form-control" name="sort" id="sort" value={this.state.sort || 0} onChange={this.onChange()} />
              </div>
              <div className="form-group row">
                <label className="form-label" htmlFor="parents">父级标签: </label>
                <div className="input-group">
                  <input type="text" className="form-control" id="add-parents" name="add-parents" autoComplete="off" placeholder="" value={this.state.addParents || ''} onKeyDown={this.onEnterParents} onChange={this.onChange('addParents')} />
                  <div className="input-group-btn">
                    <button type="button" className="btn btn-secondary" onClick={this.onAddParents}>添加</button>
                  </div>
                </div>
                <p className="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
                <div className="tags-list">
                  {this.state.parents.map((tag, key) => {
                    if (!tag) {
                      return
                    }
                    return (
                      <span key={key} className="name">{typeof tag == 'string' ? tag : tag.names[0]}<span onClick={this.onRemoveParent(tag)}>×</span></span>
                    )
                  })}
                </div>
              </div>
              <div className="form-group">
                <button type="submit" disabled={this.state.disabled} className="btn btn-primary btn-lg btn-block">提交</button>
              </div>
            </form>
          </section>
        </main>
      </div>
    )
  }
}
