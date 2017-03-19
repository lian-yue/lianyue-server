import { fromJS } from 'immutable';
import React, { Component } from 'react'

export default class Tags extends Component {
  onAdd = (e) => {
    e && e.preventDefault()
    this.refs.addTags.value = ''
    var tags = this.value().map(function(tag) {
      if (tag.get('add')) {
        tag = tag.delete('add')
      }
      return tag
    })
    this.props.input.onChange(tags)
  }

  onEnter = (e) => {
    if(e.keyCode == 13) {
      this.onAdd(e)
    }
  }



  onChange = (e) => {
    var value = e.target.value
    value = value.split(/'|"|;|:|,|\.|\/|\?|!|#|`|｀|；|：|’|‘|“|”|，|。|／|？/)
    value = value.map(name => name.trim())
    .filter(name => name)
    .map(name => ({names: [name], add: true}))
    var tags = this.value().filter(tag => !tag.get('add'))

    tags = tags.concat(fromJS(value))
    var names = {}
    var name = {}
    tags = tags.filter(function(tag) {
      name = tag.getIn(['names', 0])
      if (names[name]) {
        return false
      }
      names[name] = true
      return true
    })
    this.props.input.onChange(tags)
  }

  onRemove(tag) {
    return (e) => {
      e.preventDefault()
      var tags = this.value()
      var index = tags.indexOf(tag)
      if (index != -1) {
        tags = tags.splice(index, 1);
        this.props.input.onChange(tags)
      }
    }
  }

  value() {
    return this.props.input.value || fromJS([])
  }

  render () {
    return <div className="form-group">
      <div className="input-group">
        <input type="text" className="form-control" ref="addTags" id="add-tags" name="add-tags" autoComplete="off" onChange={this.onChange} onKeyDown={this.onEnter} />
        <div className="input-group-btn">
          <button type="button" className="btn btn-secondary" onClick={this.onAdd}>
            添加
          </button>
        </div>
      </div>
      <p className="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
        <div className="tags-list">
          {this.value().map((tag, key) => {
            if (!tag) {
              return
            }
            if (tag.get('add')) {
              return
            }
            return <span key={key} className="name">{tag.getIn(['names', 0])}<span onClick={this.onRemove(tag)}>×</span></span>
          })}
        </div>
    </div>
  }
}
