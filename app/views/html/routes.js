import React from 'react'
import { Router, Route, IndexRoute, browserHistory, pushState } from 'react-router'

import { bindActionCreators } from 'redux'
import {connect} from 'react-redux';
import App from './containers/App'



var getComponent = function(component, ...paths) {
  return function(nextState, callback) {
    if (__SERVER__) {
      let value = require("./containers/" + component);
      if (paths.length) {
        value = requireAuthentication(value, ...paths);
      }
      callback(null, value)
    } else {
      require.ensure([], function(require) {
        var bundle = require("bundle!./containers/" + component);
        bundle(function(value) {
          value = value.default || value;
          if (paths.length) {
            value = requireAuthentication(value, ...paths);
          }
          callback(null, value);
        });
      }, 'components');
    }
  }
}

function requireAuthentication(Component, isAdmin) {
  class AuthenticatedComponent extends React.Component {
    static contextTypes = {
      router: React.PropTypes.object.isRequired,
    }

    state = {
      admin: true,
    }

    componentWillMount() {
      this.checkAuth();
    }

    componentWillReceiveProps(nextProps) {
      this.checkAuth();
    }

    checkAuth() {
      const token  = this.props.token;
      const admin = token ? token.admin : null;

      if (!admin) {
        let redirect = this.props.location.pathname + this.props.location.search;
        this.context.router.push('/admin?message=401&redirect_uri=' + encodeURIComponent(redirect));
        return;
      }
      this.setState({admin});
    }

    render() {
      return (
        <div className="c-authentication">
          {this.state.admin ? <Component {...this.props}/> : null}
        </div>
      )
    }
  }

  function mapStateToProps(state) {
    return {
      token: state.token,
    };
  }
  return connect(mapStateToProps)(AuthenticatedComponent);
}







export default (
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="tags" getComponent={getComponent('tags/Container')}>
        <IndexRoute getComponent={getComponent('tags/Index')} />
        <Route path="create" getComponent={getComponent('tags/Create', true)}/>
        <Route path=":tag/update" getComponent={getComponent('tags/Update', true)}/>
      </Route>
      <Route path="admin" getComponent={getComponent('Admin')} />

      <IndexRoute getComponent={getComponent('posts/Index')} />
      <Route path="tag-:tag" getComponent={getComponent('posts/Index')} />
      <Route path="comments" getComponent={getComponent('Comment', true)} />
      <Route path="create" getComponent={getComponent('posts/Create', true)}/>
      <Route path=":slug/comments" getComponent={getComponent('posts/Comment')} />
      <Route path=":slug/update" getComponent={getComponent('posts/Update', true)}/>
      <Route path=":slug" getComponent={getComponent('posts/Read')}/>
      <Route path="*" getComponent={getComponent('NotFound')} />
    </Route>
  </Router>
)
