import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux'
import { Link, Route, Switch } from 'react-router-dom'

import queryString from 'query-string'

import site from 'config/site'

import actions from '../../actions'

import PopupMessages from './PopupMessages'





function toJSONObject(state) {
  for (var key in state) {
    if (!state[key]) {
      continue
    }
    if (typeof state[key] != 'object') {
      continue
    }
    if (typeof state[key].toJSON == 'function') {
      state[key] = state[key].toJSON()
    } else {
      state[key] = toJSONObject(state[key])
    }
  }
  return state
}


function asyncComponent(cl, ...paths) {
  var RenderComponent;


  class AsyncComponent extends Component {
    state = {}

    async asyncComponent() {
      RenderComponent = await cl()
      RenderComponent = RenderComponent.default || RenderComponent
    }

    async componentDidMount() {
      if (!RenderComponent) {
        RenderComponent = await cl()
        RenderComponent = RenderComponent.default || RenderComponent
        this.setState({component: true})
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.token && !this.props.token.get('admin')) {
        this.props.dispatch(actions.router.push('/admin?message=401&redirect_uri=' + encodeURIComponent(this.props.location.pathname + this.props.location.search)))
      }
    }

    render() {
      if (!RenderComponent) {
        return null
      }
      if (this.props.token && !this.props.token.get('admin')) {
        return null
      }
      return <RenderComponent {...this.props} />
    }
  }

  if (paths.length) {
    return connect(state => {
      return ({token: state.get('token')})
    })(AsyncComponent);
  }
  return AsyncComponent
}


const ErrorsNotFoundComponent = asyncComponent(() => import('../Errors/NotFound'));
const AdminComponent = asyncComponent(() => import('../Admin'));

const PostsIndexComponent = asyncComponent(() => import('../Posts/Index'));
const PostsReadComponent = asyncComponent(() => import('../Posts/Read'));
const PostsEditorComponent = asyncComponent(() => import('../Posts/Editor'), true);
const PostsCommentComponent = asyncComponent(() => import('../Posts/Comment'));
const CommentComponent = asyncComponent(() => import('../Comment'), true);

const TagsIndexComponent = asyncComponent(() => import('../Tags/Index'));
const TagsEditorComponent = asyncComponent(() => import('../Tags/Editor'));

@connect(state => ({
  messages: state.get('messages'),
  token: state.get('token'),
  protocol: state.get('protocol'),
  router: state.get('router'),
}))
export default class App extends Component{
  static childContextTypes = {
    fetch: React.PropTypes.func,
    getPath: React.PropTypes.func,
    toUrl: React.PropTypes.func,
    onChange: React.PropTypes.func,
  }

  state = {
    github: '',
    email: '',
    feed: '',
  }

  getChildContext() {
    return {
      fetch: this.fetchUrl,
      toUrl: this.toUrl,
      getPath: this.getPath,
      onChange: this.onChange,
    }
  }

  toUrl = (pathname, query) => {
    pathname = pathname || '/'
    var url = this.props.protocol + site.url + (pathname == '/' ? pathname : pathname.replace(/\/$/, ''))
    if (!query) {

    } else if (typeof query == 'object') {
      query = queryString.stringify(query)
      if (query) {
        url += '?' + query
      }
    } else {
      url += query.charAt(0) == '?' ? query : '?' + query
    }
    return url
  }


  getPath = (props) => {
    var location = props && props.location ? props.location : this.props.router.get('location').toJS()
    return location.pathname + location.search
  }


  fetchUrl = async (path, query, body) => {
    query = query || {}
    if (typeof query != 'object') {
      query = queryString.parse(query)
    }

    if (__SERVER__) {
      var ctx = this.props.ctx
      try {
        return await ctx.viewModel(body ? 'POST' : 'GET', path, query, body).then(state => toJSONObject(state))
      } catch (err) {
        ctx.app.emit('error', err, ctx);
        throw err
      }
    }

    var opt = {}
    opt.headers = {}

    if (body && typeof body == 'object') {
      if (!this.props.token.get("_id")) {
        var token = await fetch('/token?view=json&create=1', {
          credentials: 'same-origin'
        }).then(response => response.json())
        await this.props.dispatch(actions.setToken(token));
      }
      body = queryString.stringify(Object.assign({}, body, {view: 'json', _token:this.props.token.get("_id")}))
    }

    if (query && typeof query == 'object') {
      query = queryString.stringify(body ? query : Object.assign({}, query, {view : 'json'}))
    }

    if (body) {
      opt.method = 'POST'
      opt.headers['Content-Type'] = "application/x-www-form-urlencoded"
    }

    if (body) {
      opt.body = body
    }
    opt.credentials = opt.credentials || 'same-origin'
    opt.timeout = 10000

    var response = await fetch(path + (query ? '?' + query : ''), opt).then((response) => {
      if (response.status == 204) {
        return {}
      }
      return response.json(true)
    })
    if (response.messages) {
      var err = new Error
      for (var key in response) {
        err[key] = response[key]
      }
      throw err
    }
    return response
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

  async fetch(props) {
    if (__SERVER__) {
      var ctx = props.ctx
      var token = await ctx.token();
      if (token) {
        await props.dispatch(actions.setToken(token.toJSON()));
      }
      await props.dispatch(actions.setProtocol(ctx.protocol));
    }
  }

  componentDidMount() {
    this.setState({
      github: '//github.com/lian-yue',
      email: 'mailto:' + site.email,
      feed: '//www.lianyue.org?view=json',
    })
    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  componentDidUpdate(props) {
    if (this.props.router.getIn(['location', 'key']) != props.router.getIn(['location', 'key']) && document.body.className) {
      setTimeout(function() {
        document.body.className = document.body.className.replace(/\s*header-open\s*/, '')
      }, 30)
    }
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


  onHeaderBackdrop(e) {
    e.preventDefault()
    document.body.className = document.body.className.replace(/\s*header-open\s*/, '')
  }




  render() {
    const pathname = this.props.router.getIn(['location', 'pathname'])

    return <div id="wrapper">
      <header id="header" role="banner">
        <div id="profile">
          <div id="logo">
              <Link to="/" title={site.title + ' - ' + site.description} rel="home">
                {site.title}
              </Link>
          </div>
          <h1 className="site-name">
            <Link to="/" title={site.title + ' - ' + site.description} rel="home">
              {site.title}
            </Link>
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
      <div id="container">
        <Switch>
          <Route exact path="/tags" component={TagsIndexComponent} />
          <Route exact path="/tags/create" component={TagsEditorComponent} />
          <Route exact path="/tags/:tag/update" component={TagsEditorComponent} />
          <Route exact path="/admin" component={AdminComponent} />
          <Route exact path="/comments" component={CommentComponent} />
          <Route exact path="/tag-:tag" component={PostsIndexComponent} />
          <Route exact path="/create" component={PostsEditorComponent} />
          <Route exact path="/:slug/comments" component={PostsCommentComponent} />
          <Route exact path="/:slug" component={PostsReadComponent} />
          <Route exact path="/:slug/update" component={PostsEditorComponent} />
          <Route exact path="/" component={PostsIndexComponent} />
          <Route component={ErrorsNotFoundComponent} />
        </Switch>
      </div>
      <footer id="footer" role="contentinfo">
        <div className="info">
          <span className="copyright">Copyright&nbsp;&#169;&nbsp;2009-2016&nbsp;<a href={site.url}>{site.title}</a>&nbsp;All Rights Reserved!</span>
          <span className="powered">Powered by Koa &amp; <a href="//www.lianyue.org" target="_blank">lianyue</a></span>
        </div>
      </footer>
      <div id="header-backdrop" onClick={this.onHeaderBackdrop}></div>
      <PopupMessages />
    </div>
  }
}
