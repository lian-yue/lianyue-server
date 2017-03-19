import React, {Component, PropTypes, Children} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link, IndexLink } from 'react-router'
import queryString from 'query-string'

import actions from '../../actions'

import Messages from '../../components/Messages'

const { site } = __CONFIG__



var componentServerMount
if (__SERVER__) {
  componentServerMount = async function(ctx, state) {
    if (!ctx) {
      return
    }
    await this.props.dispatch(actions.fetchToken(0, ctx));
    await this.props.dispatch(actions.setProtocol(ctx.protocol));
  }
}

@connect(state => ({
  messages: state.get('messages'),
  token: state.get('token'),
  protocol: state.get('protocol'),
}))
export default class App extends Component{
  state = {
    github: '',
    email: '',
    feed: '',
  }


  static childContextTypes = {
    fetch: React.PropTypes.func,
    getPath: React.PropTypes.func,
    toUrl: React.PropTypes.func,
    onChange: React.PropTypes.func,
  }


  getChildContext() {
    return {
      fetch: this.fetch,
      toUrl: this.toUrl,
      getPath: this.getPath,
      onChange: this.onChange,
    }
  }
  componentServerMount = componentServerMount

  toUrl = (pathname, query) => {
    pathname = pathname || '/'
    var url = this.props.protocol + site.uri + (pathname == '/' ? pathname : pathname.replace(/\/$/, ''))
    query = queryString.stringify(query)
    if (query) {
      url += '?' + query
    }
    return url
  }


  getPath = (props) => {
    props = props || this.props
    return props.location.pathname + props.location.search
  }

  fetch = async (url, query, body, headers) => {
    headers = headers || {}
    query = query || {}
    var opt = {}

    if (body && typeof body == 'object') {
      if (!this.props.token.get("_id")) {
        await this.props.dispatch(actions.fetchToken(1));
      }
      body = queryString.stringify(Object.assign({}, body, {view: 'json', _token:this.props.token.get("_id")}))
    }

    if (query && typeof query == 'object') {
      query = queryString.stringify(body ? query : Object.assign({}, query, {view : 'json'}))
    }

    if (body) {
      opt.method = 'POST'
      headers['Content-Type'] = headers['Content-Type'] || "application/x-www-form-urlencoded"
    }

    opt.headers = headers
    if (body) {
      opt.body = body
    }
    opt.credentials = opt.credentials || 'same-origin'
    opt.timeout = 10000

    return await fetch(url + (query ? '?' + query : ''), opt).then((response) => {
      if (response.status == 204) {
        return {}
      }
      return response.json(true)
    })
  }




  onChange(name, debounce) {
    var timer;
    return (e) => {
      var el = e.target;
      var call = () => {
        if (!name) {
          name = el.name;
        }
        if (typeof name == 'function') {
          if (el.type == 'checkbox' && !el.checked) {
            name(false, el)
          } else {
            name(el.value, el)
          }
          return
        }

        if (typeof name == 'string') {
          name = name.split('.')
        }
        var data

        var value = this.state
        var endKey = name[name.length- 1]

        for (let i = 0; i < name.length - 1; i++) {
          let key = name[i]
          if (!value[key] || !(value[key] instanceof Object)) {
            value[key] = {}
          }
          value = value[key]
        }
        if ((el.type == 'select' && el.multiple) || el.type =='select-multiple') {
          var selected = []
          value[name[name.length -1]] = selected;
          for (let i = 0, l = el.options.length; i < l; i++) {
            if (el.options[i].selected) {
              selected.push(el.options[i].value);
            }
          }
        } else if (el.type == 'checkbox') {
          if (value[endKey] instanceof Object) {
            var index = value[endKey].indexOf(el.value);
            if (el.checked) {
              if (index == -1) {
                value[endKey].push(el.value)
              }
            } else {
              if (index != -1) {
                value[endKey].splice(index, 1)
              }
            }
          } else {
            if (el.checked) {
              value[endKey] = el.value
            } else {
              delete value[endKey]
            }
          }
        } else {
          value[endKey] = el.value
        }

        if (typeof this.state[name[0]] == 'undefined') {
          this.setState(this.state)
        } else {
          data = {}
          data[name[0]] = this.state[name[0]]
          this.setState(data)
        }
      }
      if (debounce) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        timer = setTimeout(call, debounce);
      } else {
        call();
      }
    }
  }

  componentDidMount() {
    this.setState({
      github: '//github.com/lian-yue',
      email: 'mailto:' + site.email,
      feed: '//list.qq.com/cgi-bin/qf_invite?id=d6c226834b15d2103bb6920ba251390e2adf75fd96a25230',
    })
    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  onResize() {
    const html = document.documentElement
    const footer = document.getElementById('footer')
    const container = document.getElementById('container')
    var marginTop
    if (html.currentStyle) {
      marginTop =  html.currentStyle.marginTop.marginTop
    } else if (window.getComputedStyle) {
      marginTop = document.defaultView.getComputedStyle(html, null).marginTop
    }
    marginTop = parseInt(marginTop.substr(0, marginTop.length - 2))
    const minHeight = document.documentElement.clientHeight - footer.offsetHeight - marginTop - 10
    container.style.minHeight = minHeight + 'px'
  }


  componentDidUpdate(props) {
    const popup = this.props.messages.get('popup')
    if(popup && !popup.get('close')) {
      if (this.props.location.key != props.location.key) {
        this.props.dispatch(actions.closeMessages('popup'))
      } else {
        setTimeout(() => {
          this.props.dispatch(actions.closeMessages('popup'))
        }, 3000);
      }
    }

    if (this.props.location.key != props.location.key && document.body.className) {
      setTimeout(function() {
        document.body.className = document.body.className.replace(/\s*header-open\s*/, '')
      }, 30)
    }
  }

  errorClose = () => {
    this.props.dispatch(actions.closeMessages('popup'))
  }

  onHeaderBackdrop(e) {
    e.preventDefault()
    document.body.className = document.body.className.replace(/\s*header-open\s*/, '')
  }

  render() {
    const pathname = this.props.location.pathname

    return <div id="wrapper">
      <header id="header" role="banner">
        <div id="profile">
          <div id="logo">
              <IndexLink to="/" title={site.title + ' - ' + site.description} rel="home">
                {site.title}
              </IndexLink>
          </div>
          <h1 className="site-name">
            <IndexLink to="/" title={site.title + ' - ' + site.description} rel="home">
              {site.title}
            </IndexLink>
          </h1>
          <p className="site-description">{site.description}</p>
        </div>
        <div id="nav">
          <nav id="nav-bar" className="navbar" role="navigation">
            <ul>
              <li><Link to="/" className={pathname == '/' ? 'active' : null}  rel="home" title="网站首页"><i className="fa fa-home"></i><span>首页</span></Link></li>
              <li><Link to="/tags"  className={pathname == '/tags' || pathname.substr(0, 6) == '/tags/' ? 'active' : null} title="分类标签"><i className="fa fa-tags"></i><span>标签</span></Link></li>
              <li><Link to="/about" className={pathname == '/about' ? 'active' : null} title="关于恋月"><i className="fa fa-user"></i><span>关于</span></Link></li>
              <li><Link to="/links"  className={pathname == '/links' ? 'active' : null} title="友情链接"><i className="fa fa-link"></i><span>友链</span></Link></li>
            </ul>
          </nav>
          <nav id="nav-icon" className="nav-icon" role="navigation">
            <ul>
              <li><a href={this.state.github} title="访问 GitHub" target="_blank" rel="nofollow"><i className="fa fa-lg fa-github"></i><span>GitHub</span></a></li>
              <li><a href={this.state.email} title="联系 E-Mail" target="_blank"  rel="nofollow"><i className="fa fa-lg fa-envelope"></i><span>联系 E-Mail</span></a></li>
              <li><a href={this.state.feed} title="Feed 订阅" target="_blank"  rel="nofollow"><i className="fa fa-lg fa-feed"></i><span>邮箱订阅</span></a></li>
            </ul>
          </nav>
        </div>
      </header>
      <div id="container">{this.props.children}</div>
      <footer id="footer" role="contentinfo">
        <div className="info">
          <span className="copyright">Copyright&nbsp;&#169;&nbsp;2009-2016&nbsp;<a href={site.uri}>{site.title}</a>&nbsp;All Rights Reserved!</span>
          <span className="powered">Powered by Koa &amp; <a href="//www.lianyue.org" target="_blank">lianyue</a></span>
        </div>
      </footer>
      <div id="header-backdrop" onClick={this.onHeaderBackdrop}></div>
      <div id="popup-messages" onDoubleClick={this.errorClose}>
        <Messages name="popup" />
      </div>
    </div>
  }
}
