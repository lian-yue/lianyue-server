export const LINKS_SET = 'LINKS_SET'

export function setLinks(value) {
  return {
    type: LINKS_SET,
    value:value,
  };
}


export function fetchLinks() {
  if (__SERVER__) {
    return async function(dispatch) {
      const Post = require('../../../models/post');
      var post = await Post.findOne({slug: 'links'}, {excerpt: 1}).exec()
      dispatch(setLinks(post ? post.get('excerpt') : ''));
    }
  } else {
    return dispatch => {
      return fetch('/links?record=&view=json', {
        credentials: 'same-origin'
      })
        .then(response => response.json())
        .then(json => dispatch(setLinks(json.excerpt || '')))
    }
  }
}
