import { fromJS } from 'immutable';
import React, { Component } from 'react'

export default class Parents extends Component {
  onAdd = (e) => {
    e && e.preventDefault()
    var value = this.refs.addParents.value
    this.refs.addParents.value = ''

    value = value.split(/'|"|;|:|,|\.|\/|\?|!|#|`|｀|；|：|’|‘|“|”|，|。|／|？/)
      .map(name => name.trim())
      .filter(name => name)
      .map(name => ({names: [name]}))

    var tags = this.value().concat(fromJS(value))

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

  onEnter = (e) => {
    if(e.keyCode == 13) {
      this.onAdd(e)
    }
  }

  value() {
    return this.props.input.value || fromJS([])
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

  render () {
    return <div className="form-group">
      <div className="input-group">
        <input type="text" className="form-control" id="add-parents" ref="addParents" name="add-parents" autoComplete="off" placeholder="" onKeyDown={this.onEnter} />
        <div className="input-group-btn">
          <button type="button" className="btn btn-secondary" onClick={this.onAdd}>添加</button>
        </div>
      </div>
      <p className="form-text">多个标签请用英文逗号（<code>,</code>）分开</p>
      <div className="tags-list">
        {this.value().map((tag, key) => {
          if (!tag) {
            return
          }
          return (
            <span key={key} className="name">{tag.getIn(['names', 0])}<span onClick={this.onRemove(tag)}>×</span></span>
          )
        })}
      </div>
    </div>
  }
}
