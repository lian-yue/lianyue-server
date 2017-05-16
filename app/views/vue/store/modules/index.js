// import posts from './posts'
import module from './module'
import * as types from '../types'

const links = module(
  types.LINKS,
  types.LINKS_CLEAR,
  {
    excerpt: '',
  },
  function(state) {
    return {
      excerpt: state.excerpt,
    }
  },
  function(payload) {
    payload.path = '/links'
    payload.query = {record:''}
    return payload
  }
)

const postList = module(
  types.POST_LIST,
  types.POST_LIST_CLEAR,
  {
    results: [],
    more: true,
    tag: null,
  }
)

const postRead = module(
  types.POST_READ,
  types.POST_READ_CLEAR,
  {
    tags: [],
    meta: {},
    images: [],
    url: '/',
  }
)




const tagList = module(
  types.TAG_LIST,
  types.TAG_LIST_CLEAR,
  {
    results: [],
    more: true,
  }
)
const tagRead = module(
  types.TAG_READ,
  types.TAG_READ_CLEAR,
  {
    parents: [],
    names: [],
  }
)


const commentList = module(
  types.COMMENT_LIST,
  types.COMMENT_LIST_CLEAR,
  {
    results: [],
    post: {},
    more: true,
  }
)

const commentRead = module(
  types.COMMENT_READ,
  types.COMMENT_READ_CLEAR,
  {
  }
)


export {
  links,
  postList,
  postRead,
  tagList,
  tagRead,
  commentList,
  commentRead,
}
