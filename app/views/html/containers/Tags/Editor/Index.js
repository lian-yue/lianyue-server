import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Field, reduxForm } from 'redux-form/immutable'

import { fromJS } from 'immutable';


import actions from '../../../actions'

import Messages from '../../../components/Messages'

import Main from '../../../components/Main'

import FieldContent from '../../../components/Markdown/Editor'

import FieldParents from './Parents'


const { site } = __CONFIG__


@connect(state => ({
}))
@reduxForm({
  form: 'tagEditor'
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
    var tag = this.props.params.tag
    var parents = state.get('parents') || fromJS([])
    var body = {
      names: state.get('names'),
      content: state.get('content'),
      parents: parents.filter(tag => tag).map(tag => tag.getIn(['names', 0])).join(','),
      sort: state.get('sort') || 0,
    }

    try {
      var result = await this.context.fetch('/tags/' + (tag ?  tag : 'create'), {}, body)
      if (result.messages) {
        this.props.dispatch(actions.setMessages(result))
        return
      }
      this.context.router.push(result.postUri + '?message=' + (tag ? 'update' : 'create') + '&r='+ Date.now())
    } catch (e) {
      this.props.dispatch(actions.setMessages(e))
    }
  }


  componentDidMount() {
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
        props.dispatch(actions.setMessages(result.messages, 'danger', 'popup'))
        return
      }
      result.names = result.names.join(',')
      props.initialize(result)
    } catch (e) {
      props.dispatch(actions.setMessages([e, '请重试'], 'danger', 'popup'))
    } finally {
      this.setState({disabled: false})
    }
  }


  render () {
    const {handleSubmit, pristine, submitting} = this.props
    var title = '创建标签'
    if (this.props.params.slug) {
      title = '编辑标签'
    }

    return <Main
      title={[title, site.title]}
      meta={[
        {name: 'robots', content:'none'},
      ]}
      breadcrumb={[title]}
      >
      <section id="content">
        <form id="tags-editor" role="form" method="post" className="form-horizontal" onSubmit={handleSubmit(this.onSubmit)} autoComplete="off">
          <Messages />
            <div className="form-group row">
              <label className="form-label" htmlFor="names">标签名: </label>
              <Field  component="input" type="text" className="form-control" id="names" name="names" placeholder="" />
              <p className="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
            </div>
            <div className="form-group">
              <label htmlFor="content" className="form-label">内容: </label>
              <Field id="content" component={FieldContent} rows="20" placeholder="" className="form-control" name="content"  storage={true} />
            </div>
            <div className="form-group">
              <label htmlFor="parents" className="form-label">父级: </label>
              <Field id="parents" component={FieldParents} name="parents" />
            </div>
            <div className="form-group">
              <label htmlFor="sort" className="form-label">排序: </label>
              <Field component="input" type="number" className="form-control" name="sort" id="sort" />
            </div>
            <div className="form-group">
              <button type="submit" disabled={pristine || submitting || this.state.loading} className="btn btn-primary btn-lg btn-block">提交</button>
            </div>
        </form>
      </section>
    </Main>
  }
}
