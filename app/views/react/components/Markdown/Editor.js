import React, { Component } from 'react'
import { Link } from 'react-router'

import Storage from '../Storage/Button'

export default class Editor extends Component {

  static defaultProps = {
    className: '',
    value: '',
  }

  state = {
  }



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
      values = values.join('\n')
    }
    editor.replaceSelection(values)
  }

  componentDidUpdate() {
    if (this.state.editor && this.props.input.value != this.state.editor.getValue()) {
      this.state.editor.setValue(this.props.input.value)
    }
  }

  componentDidMount() {
    if (!__SERVER__) {
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
          value: this.props.input.value,
        });
        this.setState({editor})
        editor.setSize(null, (this.props.rows ? this.props.rows : 10) * 20);
        editor.on('change', () => {
          this.props.input.onChange(editor.getValue())
        });
      }, 'codemirror-markdown')
    }
  }

  render() {
    var className = this.props.className
    var storage = this.props.storage
    className +=  ' markdown-editor form-control'
    return (
      <div className="markdown">
        <div className={className} ref="editor"></div>
        {storage ? <Storage select={this.onStorageSelect}>添加附件</Storage> : ''}
      </div>
    )
  }
}
