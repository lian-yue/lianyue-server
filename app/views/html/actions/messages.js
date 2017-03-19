export const MESSAGES_SET = 'MESSAGES_SET'

export const MESSAGES_CLOSE = 'MESSAGES_CLOSE'


export function setMessages(action, type, name) {
  if (action instanceof Error) {
    action = [action]
  }

  if (!(action instanceof Object)) {
    action = [{message: action}]
  }

  if (action instanceof Array) {
    action = {messages:action}
  }

  action._type = type ||  action.type
  action.name = name || action.name

  action.type = MESSAGES_SET
  return action;
}

export function closeMessages(name) {
  return {name, type: MESSAGES_CLOSE};
}
