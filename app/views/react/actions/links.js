export const LINKS_SET = 'LINKS_SET'

export function setLinks(value) {
  return {
    type: LINKS_SET,
    value:value,
  };
}
