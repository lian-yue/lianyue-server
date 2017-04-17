export const MESSAGES_SET = 'MESSAGES_SET'

export const MESSAGES_CLOSE = 'MESSAGES_CLOSE'


export function setMessages(action, type, name) {
  if (typeof action == 'object') {
    action = toObject(action)
    if (action.errors) {
      action.messages =  action.errors
      delete action.errors
    }
    if (action.messages) {
      delete action.message
    }
    if (action.message) {
      action = [action]
    }
  } else {
    action = [action]
  }

  if (Array.isArray(action)) {
    action = {messages: action}
  }

  action._type = type ||  action.type
  action.name = name || action.name

  action.type = MESSAGES_SET
  return action;
}

export function closeMessages(name) {
  return {name, type: MESSAGES_CLOSE};
}




function toObject(data) {
  if (data instanceof Error) {
    var error = data
    data = {}
    Object.keys(error).forEach(function(key) {
      data[key] = error[key]
    })
    data.message = error.message
  }

  for (var key in data) {
    if (data[key] && typeof data[key] == 'object') {
      data[key] = toObject(data[key])
    }
  }

  return data
}
