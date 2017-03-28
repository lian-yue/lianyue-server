import {combineReducers} from "redux-immutable";
import { reducer as form } from 'redux-form/immutable'

import router from './router'
import protocol from './protocol'
import headers from './headers'
import token from './token'
import messages from './messages'
import storage from './storage'


import postList from './postList'
import postRead from './postRead'


import tagList from './tagList'
import tagRead from './tagRead'


import commentList from './commentList'
import links from './links'


export default combineReducers({
  router,
  protocol,
  headers,
  token,
  form,
  messages,
  storage,
  postList,
  postRead,
  tagList,
  tagRead,
  commentList,
  links,
})
