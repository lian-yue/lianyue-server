export const STORAGE_SET = 'STORAGE_SET'

export const STORAGE_CLEAR = 'STORAGE_CLEAR'


export function setStorage(value) {
  return {
    type: STORAGE_SET,
    value: value,
  }
}

export function clearStorage(value) {
  return {
    type: STORAGE_CLEAR,
    value: value,
  }
}
