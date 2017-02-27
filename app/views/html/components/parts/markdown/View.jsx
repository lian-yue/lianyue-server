import React, { PureComponent, PropTypes } from 'react'


export default class ViewComponent extends PureComponent {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  static defaultProps = {
    className: '',
  }
  componentDidMount() {
    this.content(this.props)
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }


  shouldComponentUpdate(nextProps) {
    if (nextProps.debounce) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.timer = null
        this.content(nextProps)
      }, nextProps.debounce);
    } else {
      this.content(nextProps)
    }
    return false
  }

  iframes = []
  onResize = () => {
    var element
    for (var i = 0; i < this.iframes.length; i++) {
      element = this.iframes[i]
      element.style.height = (element.clientWidth * 9 / 16).toString() + 'px';
    }
  }

  content(props) {
    var children = props.children || ''
    var el = this.refs.content
    if (this._children == children && this._innerHTML == el.innerHTML) {
      return
    }
    this._children = children
    if (!children) {
      el.innerHTML = ''
      this._innerHTML = ''
      el.className = el.className.replace('invisible', '')
      this.event()
      return
    }

    if (props.html) {
      if (!this._event) {
        this._innerHTML = el.innerHTML
        this.event()
        return
      }
      el.innerHTML = children
      this._innerHTML = el.innerHTML
      el.className = el.className.replace('invisible', '')
      this.event()
      return
    }

    if (!__SERVER__) {
      require.ensure([], (require) => {
        const markdown = require('../../../../../models/markdown');
        var token = markdown(children, props.options)
        token.toNode(el)
        this._innerHTML = el.innerHTML
        el.className = el.className.replace('invisible', '')
        if (props.didUpdate) {
          props.didUpdate(el)
        }
        this.event()
      }, 'markdown-x')
    }
  }

  event() {
    var el = this.refs.content
    this._event = true

    // 修改链接
    var elements = el.querySelectorAll('a')
    var element
    var _this = this
    for (var i = 0; i < elements.length; i++) {
      element = elements[i]
      if (!element.onclick) {
        element.onclick = function(e) {
          if (!this.getAttribute('target')) {
            this.setAttribute('target', '_blank')
          }
          if (this.host != window.location.host) {
            return
          }
          var href = this.getAttribute('href')
          if (!href) {
            return
          }

          if (_this.props.editor) {
            if (this.pathname == window.location.pathname && this.search == window.location.search) {
              e.preventDefault()
              return
            }
            return
          }

          e.preventDefault()
          if (this.pathname == window.location.pathname && this.search == window.location.search) {
            window.location.hash = this.hash
            return
          }

          _this.context.router.push(this.pathname + this.search + this.hash)
        }
      }
    }


    // 宽度自动
    this.iframes = el.querySelectorAll('iframe,embed')
    this.onResize()
  }

  render () {
    const props = Object.assign({}, this.props)
    var html  = props.html
    props.className = props.className + ' markdown-content'
    if (!html) {
      props.className += ' invisible'
    }
    delete props.debounce
    delete props.didUpdate
    delete props.options
    delete props.editor
    delete props.ref
    delete props.children
    delete props.html
    if (html) {
      return <div {...props} ref="content" dangerouslySetInnerHTML={{__html: this.props.children}}></div>
    }
    return <div {...props} ref="content">{this.props.children ? this.props.children.replace(/<\/?\s*[a-zA-Z].*?>|[\r\n]/g, '') : ''}</div>
  }
}
