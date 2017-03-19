import React from 'react'
import {Route, IndexRoute} from 'react-router'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import App from './containers/App/Index'


var getComponent = function(name, ...paths) {
  return function(nextState, callback) {
    if (__SERVER__) {
      let value = require("./containers/" + name + '/Index');
      if (paths.length) {
        value = requireAuthentication(value, ...paths);
      }
      callback(null, value)
    } else {
      require.ensure([], function(require) {
        var bundle = require("bundle-loader!./containers/" + name + '/Index');
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
  if (Component.AuthenticatedComponent) {
    return Component.AuthenticatedComponent
  }

  class Authenticated extends React.Component {
    static contextTypes = {
      router: React.PropTypes.object.isRequired,
    }

    componentWillReceiveProps(nextProps) {
      if (!this.props.token.get('admin')) {
        let redirect = this.props.location.pathname + this.props.location.search;
        this.context.router.push('/admin?message=401&redirect_uri=' + encodeURIComponent(redirect));
      }
    }

    render() {
      if (this.props.token.get('admin')) {
        return <Component {...this.props}/>
      }
      return null
    }
  }
  function mapStateToProps(state) {
    return {
      token: state.get('token'),
    };
  }

  function mapDispatchToProps(dispatch) {
    return {};
  }
  Component.AuthenticatedComponent = connect(mapStateToProps, mapDispatchToProps)(Authenticated);
  return Component.AuthenticatedComponent
}




export default (
  <Route path="/" component={App}>
    <Route path="tags" component={({children}) => (children)}>
      <IndexRoute getComponent={getComponent('Tags/Index')} />
      <Route path="create" getComponent={getComponent('Tags/Editor', true)}/>
      <Route path=":tag/update" getComponent={getComponent('Tags/Editor', true)}/>
    </Route>
    <Route path="admin" getComponent={getComponent('Admin')} />
    <IndexRoute getComponent={getComponent('Posts/Index')} />
    <Route path="tag-:tag" getComponent={getComponent('Posts/Index')} />
    <Route path="create" getComponent={getComponent('Posts/Editor', true)} />
    <Route path="comments" getComponent={getComponent('Comment', true)} />
    <Route path=":slug" getComponent={getComponent('Posts/Read')} />
    <Route path=":slug/comments" getComponent={getComponent('Posts/Comment')} />
    <Route path=":slug/update" getComponent={getComponent('Posts/Editor', true)} />
    <Route path="*" getComponent={getComponent('Errors/NotFound')} />
  </Route>
)
