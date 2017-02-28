var retains = [
  'all',
  'black',
  'select',
  'create',
  'update',
  'select',
  'delete',
  'remove',
  'editor',
  'index',
  'home',
  'info',
  'get',
  'add',
  'set',
  'del',
  'put',
  'patch',
  'www',
  'user',
  'vip',
  'log',
  'role',
  'post',
  'slug',
  'tag',
  'date',
  'page',
  'page',
  'sort',
  'skip',
  'order',
  'limit',
  'filter',
  'type',
  'name',
  'comment',
  'state',
  'status',
]


module.exports = function(value) {
  if (typeof value != 'string' || value < 3) {
    return false
  }
  value = value.trim().toLocaleLowerCase()
  if (value.substr(0, 4) == 'tag-' || value.substr(0, 4) == 'cat-') {
    return false
  }
  if (value.substr(-1, 1) == 's') {
    value = value.substr(0, value.length -1)
  }

  return retains.indexOf(value) == -1
}
