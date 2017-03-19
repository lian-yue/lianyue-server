export const TOKEN_SET = 'TOKEN_SET'
export const TOKEN_ADD = 'TOKEN_ADD'

export function setToken(value) {
  return {
    type: TOKEN_SET,
    value:value,
  };
}

export function addToken(value) {
  return {
    type: TOKEN_ADD,
    value: value,
  };
}


export function fetchToken(create, ctx) {
  if (__SERVER__) {
    return async function(dispatch) {
      var token = await ctx.token(create);
      if (!token) {
        token = {};
      } else {
        token = token.toJSON();
      }
      dispatch(setToken(token));
    }
  } else {
    return dispatch => {
      return fetch('/token?view=json' + (create ? '&create=' + create : ''), {
        credentials: 'same-origin'
      })
        .then(response => response.json())
        .then(json => dispatch(setToken(json)))
    }
  }
}
