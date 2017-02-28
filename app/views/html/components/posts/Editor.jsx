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
    tags: [],
    comment: true,
    disabled: false
  }


  componentDidMount() {
    this.props.setMeta({
      title:[this.props.params.slug ? '编辑文章' : '发布文章', site.title],
      robots: 'none',
    })
    this.fetch(this.props)
  }


  async fetch(props) {
    var slug = props.params.slug
    if (!slug) {
      return
    }
    this.setState({disabled: true})
    try {
      var result = await this.context.fetch('/' + slug)
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



  onAddTags = (e) => {
    e.preventDefault()
    var addTags = this.state.addTags || '';
    addTags = addTags.trim()
    if (!addTags) {
      return;
    }
    var indexs = this.state.tags.map((tag) => {
      if (typeof tag == 'string' || !tag) {
        return tag
      }
      return tag.names[0]
    })
    addTags = addTags.split(/'|"|;|:|,|\.|\/|\?|!|#|`|｀|；|：|’|‘|“|”|，|。|／|？/)
    addTags = addTags.map(name => name.trim()).filter(name => name && (name.length != 24 || !/^\w+$/.test(name)))
    var tags = this.state.tags.concat()
    for (let i = 0; i < addTags.length; i++) {
      let name = addTags[i]
      name = name[0].toUpperCase() + name.substr(1)
      if (indexs.indexOf(name) != -1) {
        continue
      }
      indexs.push(name)
      tags.push(name)
    }
    this.setState({tags, addTags:''})
  }

  onEnterTags = (e) => {
    if(e.keyCode == 13) {
      this.onAddTags(e)
    }
  }

  onRemoveTag(tag) {
    return (e) => {
      e.preventDefault()
      var tags = this.state.tags
      var index = tags.indexOf(tag)
      if (index != -1) {
        tags.splice(index, 1);
        this.setState({tags})
      }
    }
  }



  onSubmit = async (e) => {
    e.preventDefault();
    if (this.state.disabled) {
      return
    }
    var slug = this.props.params.slug
    var body = {
      title: this.state.title,
      slug: this.state.slug,
      content: this.state.content,
      page: this.state.page,
      comment: this.state.comment === true || this.state.comment === 'true' ? '1' : '',
      tags: [],
    }

    for (let i = 0; i < this.state.tags.length; i++) {
      let tag = this.state.tags[i]
      if (!tag) {
        continue
      }
      body.tags.push(typeof tag == 'string' ? tag : tag.names[0])
    }

    body.tags = body.tags.join(',')

    this.setState({disabled: true});
    try {
      var result = await this.context.fetch((slug ?  '/' + slug : '/create'), {}, body)
      if (result.messages) {
        this.props.setMessages(result)
        this.setState({disabled: false})
        return
      }
      this.context.router.push(result.uri + '?message=' + (slug ? 'update' : 'create') + '&r='+ Date.now())
    } catch (e) {
      this.props.setMessages(e)
      this.setState({disabled: false})
    }
  }


  render() {
    return (
      <div id="posts-editor">
        <Breadcrumb>{this.props.params.slug ? '编辑文章' : '发布文章'}</Breadcrumb>
        <main id="main" role="main">
          <section id="content">
            <form role="form" method="post" className="form-horizontal" onSubmit={this.onSubmit} autoComplete="off">
              <Messages />
              <div className="form-group">
                <label htmlFor="title" className="form-label">标题: </label>
                <input type="text" className="form-control" name="title" id="title" placeholder="在此输入标题" maxLength="64" required value={this.state.title || ''}  onChange={this.onChange()}/>
              </div>
              <div className="form-group">
                <label htmlFor="slug"  className="form-label">自定义地址: </label>
                <input type="text" className="form-control"  name="slug" minLength="3" maxLength="32" pattern="^[0-9a-z_-]{3,32}$"  id="slug" placeholder="只允许只用小写英文数字和下划线" value={this.state.slug || ''} onChange={this.onChange()} />
              </div>
              <div className="form-group">
                <label htmlFor="content" className="form-label">内容: </label>
                <Editor id="content" rows="20" placeholder="" name="content"  value={this.state.content|| ''} onChange={this.onChange()} storage={true}></Editor>
              </div>
              <div className="form-group">
                <label htmlFor="tags" className="form-label">标签: </label>
                <div className="form-group">
                  <div className="input-group">
                    <input type="text" className="form-control" id="new-tags" name="add-tags" autoComplete="off" placeholder="" value={this.state.addTags || ''} onChange={this.onChange('addTags')} onKeyDown={this.onEnterTags} />
                    <div className="input-group-btn">
                      <button type="button" className="btn btn-secondary" onClick={this.onAddTags}>
                        添加
                      </button>
                    </div>
                  </div>
                  <p className="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
                  <div className="tags-list">
                    {this.state.tags.map((tag) => {
                      if (!tag) {
                        return
                      }
                      let name = typeof tag == 'string' ? tag : tag.names[0]
                      return (
                        <span key={name} className="name">{name}<span onClick={this.onRemoveTag(tag)}>×</span></span>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="page" className="form-label">文章类型: </label>
                <select name="page" id="page" value={this.state.page ? '1' : ''} className="form-control" onChange={this.onChange()}>
                  <option value="">文章</option>
                  <option value="1">页面</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment" className="form-label">评论: </label>
                <select name="comment" id="comment" value={this.state.comment} className="form-control" onChange={this.onChange()}>
                  <option value={true}>允许评论</option>
                  <option value={false}>禁止评论</option>
                </select>
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
