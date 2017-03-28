export const COMMENT_LIST_ADD = 'COMMENT_LIST_ADD'

export const COMMENT_LIST_SET = 'COMMENT_LIST_SET'

export const COMMENT_LIST_CLEAR = 'COMMENT_LIST_CLEAR'



export function addCommentList(value) {
  return {
    type: COMMENT_LIST_ADD,
    value: value
  }
}

export function setCommentList(value) {
  return {
    type: COMMENT_LIST_SET,
    value: value
  }
}

export function clearCommentList(value) {
  return {
    type: COMMENT_LIST_CLEAR,
    value: value
  }
}
