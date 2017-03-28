export const TAG_LIST_ADD = 'TAG_LIST_ADD'

export const TAG_LIST_SET = 'TAG_LIST_SET'

export const TAG_LIST_CLEAR = 'TAG_LIST_CLEAR'


export const TAG_READ_SET = 'TAG_READ_SET'

export const TAG_READ_CLEAR = 'TAG_READ_CLEAR'




export function addTagList(value) {
  return {
    type: TAG_LIST_ADD,
    value: value
  }
}

export function setTagList(value) {
  return {
    type: TAG_LIST_SET,
    value: value
  }
}

export function clearTagList(value) {
  return {
    type: TAG_LIST_CLEAR,
    value: value
  }
}



export function setTagRead(value) {
  return {
    type: TAG_READ_SET,
    value: value,
  }
}

export function clearTagRead() {
  return {
    type: TAG_READ_CLEAR,
  }
}
