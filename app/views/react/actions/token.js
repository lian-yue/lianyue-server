export const TOKEN_SET = 'TOKEN_SET'
export const TOKEN_ADD = 'TOKEN_ADD'

export function setToken(value) {
  return {
    type: TOKEN_SET,
    value:value,
  };
}

export function addToken(value) {
  return {
    type: TOKEN_ADD,
    value: value,
  };
}
