import moment from 'moment'
import site from 'config/site'
import queryString from 'query-string'

export function fromNow(time) {
  return moment(time).fromNow()
}

export function fromDate(time, fromt) {
  return moment(time).format(fromt)
}

export function toUrl(path, query, state) {
  if (!query) {
    query = ''
  } else if (typeof query == 'object') {
    query = queryString.stringify(query)
    if (query) {
      query = '?' + query
    }
  } else {
    if (query.substr(0, 1) == '?') {
      query = '?' + query
    }
  }
  if (state) {
    return state.protocol + ':' +  site.url + path + query
  }
  return path + query
}
