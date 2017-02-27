import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

import Storage from '../../../containers/parts/Storage'

export default class EditorComponent extends Component {
  static contextTypes = {
    onChange: React.PropTypes.func.isRequired,
    fetch: React.PropTypes.func.isRequired,
  }

  static defaultProps = {
    className: '',
    value: '',
  }

  state = {
  }

  onChange = this.context.onChange

  onStorageSelect = (files) => {
    var editor = this.state.editor
    editor.focus()
    if (!files.length) {
      return
    }
    var selection = editor.getSelection().trim()

    var values = []
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let name = selection || file.name
      if (selection) {
        name = name.replace(/^\s*\[(.*)\]\(.*\)\s*$/, '$1')
        if (name != selection) {
          let image = '!['+ name.replace(/([\[\]{}()~\\\\])/g, '') +']('+ file.original +')'
          values.push('['+ image +']('+ selection.replace(/^\s*\[.*\]\((.*)\)\s*$/, '$1') +')');
          continue
        }
        selection = ''
      }

      name = name.replace(/([\[\]{}()~\\\\])/g, '')
      values.push('!['+ name +']('+ file.original +')');
    }
    if (values.length > 1) {
      values.unshift('')
      values.push('')
      values = values.join('\n')
    } else {
      values = ' ' + values.join('\n') + ' '
    }
    editor.replaceSelection(values)
  }

  componentDidUpdate() {
    if (this.state.editor && this.props.value != this.state.editor.getValue()) {
      this.state.editor.setValue(this.props.value)
    }
  }

  componentDidMount() {
    require.ensure([], (require) => {
      const CodeMirror = require('codemirror');
      require('codemirror/mode/markdown/markdown');
      require('codemirror/mode/gfm/gfm');
      require('codemirror/addon/selection/active-line');
      require('codemirror/addon/display/placeholder');
      require('codemirror/addon/dialog/dialog');
      require('codemirror/addon/search/searchcursor');
      require('codemirror/addon/search/search');
      var editor = CodeMirror(this.refs.editor, {
        lineNumbers: true,
        styleActiveLine: true,
        mode: "gfm",
        gitHubSpice: false,
        placeholder: this.props.placeholder,
        value: this.props.value || this.props.defaultValue || '',
      });
      this.setState({editor})
      editor.setSize(null, (this.props.rows ? this.props.rows : 10) * 20);
      editor.on('change', () => {
        this.refs.textarea.value = editor.getValue()
        this.props.onChange({target: this.refs.textarea})
      });
    }, 'codemirror-markdown')
  }





  render() {
    const props = Object.assign({}, this.props)
    var className = props.className
    className +=  ' markdown'
    var storage = props.storage

    props.className = 'none'
    delete props.ref
    delete props.storage
    var historySize = this.state.editor ? this.state.editor.historySize() : {undo: 0, redo: 0}
    return (
      <div className={className}>
        <div className="markdown-editor form-control" ref="editor"></div>
        <textarea {...props} ref="textarea"></textarea>
        {storage ? <Storage select={this.onStorageSelect}>添加附件</Storage> : ''}
      </div>
    )
  }
}
