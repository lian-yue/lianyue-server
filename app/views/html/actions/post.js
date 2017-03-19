export const POST_LIST_ADD = 'POST_LIST_ADD'

export const POST_LIST_SET = 'POST_LIST_SET'

export const POST_LIST_CLEAR = 'POST_LIST_CLEAR'


export const POST_READ_SET = 'POST_READ_SET'

export const POST_READ_CLEAR = 'POST_READ_CLEAR'



export function addPostList(value) {
  return {
    type: POST_LIST_ADD,
    value: value
  }
}

export function setPostList(value) {
  return {
    type: POST_LIST_SET,
    value: value
  }
}

export function clearPostList(value) {
  return {
    type: POST_LIST_CLEAR,
    value: value
  }
}



export function setPostRead(value) {
  return {
    type: POST_READ_SET,
    value: value,
  }
}

export function clearPostRead() {
  return {
    type: POST_READ_CLEAR,
  }
}
