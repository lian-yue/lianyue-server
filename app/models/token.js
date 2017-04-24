import {Schema, Types} from 'mongoose'

import model from './model'

const schema = new Schema({
  logs: [
    {
      ip: {
        type: String,
        default: '0.0.0.0',
      },
      date: {
        type: Date,
        default: Date.now,
      },
      userAgent: {
        type: String,
        default: '',
      },
    }
  ],

  random: {
    type: String,
    default: function() {
      return Math.random().toString(36).substr(2);
    },
  },

  user: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'User',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  expiredAt: {
    type: Date,
    default: () => {
      var date = new Date();
      date.setFullYear(date.getFullYear() + 4);
      return date;
    }
  },
});




schema.set('toJSON', {
  transform(doc, ret) {
    delete ret.logs;
    delete ret.random;
  },
});


schema.methods.validRoles = function() {
  var user = this.get('user');
  if (!user) {
    return new Promise(function(resolve, reject) {
      resolve([])
    });
  }
  return user.validRoles()
}

schema.methods.allValidRoles = function() {
  var user = this.get('user');
  if (!user) {
    return new Promise(function(resolve, reject) {
      resolve([])
    });
  }
  return user.allValidRoles()
}



schema.methods.can = async function(path, user) {
  if (path instanceof Array) {
    path = path.join('/')
  }


  path = '/' + path.replace(/^\/+/, '');
  if (path.indexOf('\\') != -1 || path.indexOf('//') != -1) {
    return false;
  }
  if (path.substr(-1, 1) != '/') {
    path += '/'
  }

  if (!this.get('user')) {
    return false;
  }

  const allValidRoles = await this.allValidRoles();
  var matches = {}
  var test;
  var matchLevel;
  for (let i = 0; i < allValidRoles.length; i++) {
    let role = allValidRoles[i].role;
    let id = role.get('_id').toString();

    let rules = role.get('rules');

    // 规则
    for (let ii = 0; ii < rules.length; ii++) {
      let rule = rules[ii]
      // 已匹配过的规则
      if (matches[rule.path]) {
        continue;
      }
      matches[rule.path] = false
      if (!rule.state) {
        continue;
      }
      test = new RegExp('^' + rule.path.replace(/([.?+$^\[\](){}|\\])/g, '\\$1').replace(/(?:\*\*)/g, '.+').replace(/[*]/g, '[^/\r\n\t]+') + '\/?$').test(path)
      if (!test) {
        continue;
      }
      if (rule.state < 0) {
        return false;
      }
      matchLevel = allValidRoles[i].level
      break;
    }
  }

  if (!test) {
    return false;
  }


  if (!user) {
    return true;
  }

  // 缓存用户
  if (!this.$_users) {
    this.$_users = {}
  }

  // 缓存用户组
  if (!this.$_usersValidRoles) {
    this.$_usersValidRoles = {}
  }

  // 取得用户
  if (!user.get) {
    let id = user.toString()
    if (typeof this.$_users[id] == 'undefined') {
      this.$_users[id] = await require('./index').default.findById(new Types.ObjectId(id)).populate({
        path: 'roles.role',
        select: {level: 1},
        match: {deletedAt: {$exists: false}},
      });
    }
    user = this.$_users[id]
  }
  if (!user) {
    return false;
  }

  var id = user.get('_id').toString();

  var selfRoleLevel = allValidRoles.length == 0 ? 0 : allValidRoles[0].level;

  // 当前角色
  if (selfRoleLevel === 255) {
    return true;
  }

  // 用户有效角色 不包括嵌套
  if (typeof this.$_usersValidRoles[id] == 'undefined') {
    this.$_usersValidRoles[id] = await user.validRoles()
  }

  // 用户最大等级
  var userRoleLevel = this.$_usersValidRoles[id].length == 0 ? 0 : this.$_usersValidRoles[id][0].get('level');
  if (userRoleLevel >= selfRoleLevel) {
    return false;
  }

  // 有效用户组 map 和创建者的用户组
  var validRolesMap = {}
  for (let i = 0; i < validRoles.length; i++) {
    let role = validRoles[i].role
    if (role.get('level') >= matchLevel) {
      continue
    }

    /*
    let creator = role.get('creator')
    if (creator.get) {
      creator = creator.get('_id')
    }
    if (creator.equals(this.get('user').get('_id'))) {
      return true;
    }
    */

    validRolesMap[role.get('_id')] = true
  }

  // 包含了 并且匹配的等级更高
  for (let i = 0; i < allValidRoles.length; i++) {
    let item = allValidRoles[i];
    if (item.parent && validRolesMap[item.role.get('_id')]) {
      return true;
    }
  }
  return false;
}



schema.post('save', function() {
  delete this.$_users
  delete this.$_usersValidRoles
});

export default model('Token', schema);
