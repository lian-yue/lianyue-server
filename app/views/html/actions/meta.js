export const META_SET = 'META_SET'


export function setMeta(value) {
  return {
    type: META_SET,
    value: value,
  }
}
