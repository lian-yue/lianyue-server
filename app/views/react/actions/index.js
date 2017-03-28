import * as protocol from './protocol';
import * as headers from './headers';
import * as token from './token';
import * as messages from './messages';
import * as storage from './storage';
import * as post from './post';
import * as tag from './tag';
import * as comment from './comment';


export default Object.assign(
  {},
  protocol,
  headers,
  token,
  messages,
  storage,
  post,
  tag,
  comment,
)
