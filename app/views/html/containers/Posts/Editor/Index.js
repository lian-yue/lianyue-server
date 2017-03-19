import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Field, reduxForm } from 'redux-form/immutable'


import actions from '../../../actions'

import Main from '../../../components/Main'

import Messages from '../../../components/Messages'

import View from '../../../components/Markdown/View'

import FieldContent from '../../../components/Markdown/Editor'

import FieldTags from './Tags'

const { site } = __CONFIG__

@connect(state => ({}))
@reduxForm({
  form: 'postEditor'
})
export default class Editor extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    fetch: PropTypes.func.isRequired,
  }

  state = {
    loading: false,
  }

  onSubmit = async (state) => {
    var body = {
      title: state.get('title'),
      slug: state.get('slug'),
      content: state.get('content'),
      page: state.get('page'),
      comment: state.get('comment'),
      tags: [],
    }

    if (state.get('tags')) {
      body.tags = state.get('tags').filter(tag => !!tag).map((tag => tag.getIn(['names', 0])))
    }
    body.tags = body.tags.join(',')

    var slug = this.props.params.slug
    try {
      var result = await this.context.fetch((slug ?  '/' + slug : '/create'), {}, body)
      if (result.messages) {
        this.props.dispatch(actions.setMessages(result))
        return
      }
      this.context.router.push(result.uri + '?message=' + (slug ? 'update' : 'create') + '&r='+ Date.now())
    } catch (e) {
      this.props.dispatch(actions.setMessages(e))
    }
  }


  async fetch(props) {
    var slug = props.params.slug
    if (!slug) {
      return
    }
    this.setState({loading: true})
    try {
      var result = await this.context.fetch('/' + slug)
      if (result.messages) {
        this.props.dispatch(actions.setMessages(result.messages, 'danger', 'popup'))
        return
      }
      result.comment = result.comment ? '1' : ''
      result.page = result.page ? '1' : ''
      props.initialize(result)
    } catch (e) {
      this.props.dispatch(actions.setMessages([e, '请重试'], 'danger', 'popup'))
    } finally {
      this.setState({loading: false})
    }
  }


  componentDidMount() {
    this.fetch(this.props)
  }

  render () {
    const {handleSubmit, pristine, submitting} = this.props
    const post = this.props.postEditor
    var title = '创建文章'
    if (this.props.params.slug) {
      title = '编辑文章'
    }

    return <Main
        title={[title, site.title]}
        meta={[
          {name: 'robots', content:'none'},
        ]}
        breadcrumb={[title]}
      >
      <section id="content">
        <form id="posts-editor" role="form" method="post" className="form-horizontal" onSubmit={handleSubmit(this.onSubmit)} autoComplete="off">
          <Messages />
          <div className="form-group">
            <label htmlFor="title" className="form-label">标题: </label>
            <Field component="input" type="text" className="form-control" name="title" id="title" placeholder="在此输入标题"  maxLength="64" required />
          </div>
          <div className="form-group">
            <label htmlFor="slug"  className="form-label">自定义地址: </label>
            <Field component="input" type="text" className="form-control"  name="slug" minLength="3" maxLength="32" pattern="^[0-9a-z_-]{3,32}$"  id="slug" placeholder="只允许只用小写英文数字和下划线" />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">内容: </label>
            <Field id="content" component={FieldContent} rows="20" placeholder="" className="form-control" name="content"  storage={true} />
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">标签: </label>
            <Field id="tags" component={FieldTags} name="tags" />
          </div>

          <div className="form-group">
            <label htmlFor="page" className="form-label">文章类型: </label>
            <Field  component="select" name="page" id="page" className="form-control">
              <option value="">文章</option>
              <option value="1">页面</option>
            </Field>
          </div>

          <div className="form-group">
            <label htmlFor="comment" className="form-label">评论: </label>
            <Field  component="select" name="comment" id="comment" className="form-control">
              <option value="1">允许评论</option>
              <option value="">禁止评论</option>
            </Field>
          </div>
          <div className="form-group">
            <button type="submit" disabled={pristine || submitting || this.state.loading} className="btn btn-primary btn-lg btn-block">提交</button>
          </div>
        </form>
      </section>
    </Main>
  }
}
