/**
 * Created at 16/5/17.
 * @Author Ling.
 * @Email i@zeroling.com
 */
import { combineReducers } from 'redux'
import meta from './meta'
import token from './token'
import messages from './messages'

export default combineReducers({
  token,
  meta,
  messages,
})
