import {combineReducers} from "redux-immutable";
import { reducer as form } from 'redux-form/immutable'

import routing from './routing'
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


export default combineReducers({
  routing,
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
})
