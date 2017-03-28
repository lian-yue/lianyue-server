export const HEADERS_SET = 'HEADERS_SET'

export function setHeaders(value) {
  return {
    type: HEADERS_SET,
    value: value,
  }
}
