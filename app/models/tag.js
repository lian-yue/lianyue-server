import { Schema, Types } from 'mongoose'
import model from './model'


var schema = new Schema({
  // 节点类型
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  names: [{
    type: String,
    unique: true,
    trim: true,
    required: [true, '标签名称不能为空'],
    minlength: [2, '签名称长度不能少于 2 位或大于 32 字节 ({PATH})'],
    maxlength: [32, '签名称长度不能少于 2 位或大于 32 字节 ({PATH})'],
    set(name) {
      return String(name).replace(/\s+/g, ' ').trim()
    },
    validate: [
      {
        validator: function(name) {
          name = name.toLocaleLowerCase()
          if (__CONFIG__.retains.indexOf(name.substr(-1, 1) == 's' ? name.substr(0, -1) : name) != -1) {
            return false;
          }
          return true;
        },
        message: '标签"{VALUE}"被系统保留 ({PATH})',
      },
      {
        validator(name) {
          return !(/[\u0000-\u001f\u0021-\u0026\u0028-\u002f\u003b-\u0040\u005b-\u0060\u007b-\u007f]/.test(name));
        },
        message: '标签名不能带有 [,_-@/#?] 等特殊字符 ({PATH})',
      },
      {
        validator: function(name) {
          try {
            new Types.ObjectId(name)
          } catch (e) {
            return true
          }
          return false
        },
        message: '标签"{VALUE}"不能是 ID ({PATH})',
      },
      {
        validator: async function(name, cb) {
          var tag = await module.exports.findByTag(name).read('primary').exec();
          cb(!tag || tag.get('_id').equals(this.get('_id')), '');
        },
        message: '标签"{VALUE}"已存在 ({PATH})',
      },
    ],
  }],

  //  内容
  content: {
    type: String,
    maxlength: [1024 * 128, '内容不能大于 128KB {PATH}'],
  },

  // 内容 html 格式
  htmlContent: {
    type: String,
    default: '',
  },
  // 摘要
  excerpt: {
    type: String,
  },

  // 摘要
  description: {
    type: String,
    trim: true,
    maxlength: [255, '描述长度不能大于 255 字节 {PATH}'],
  },

  // 图片
  images: [{
    type: String,
    required: true,
  }],

  state: {
    type: Schema.Types.Integer,
    index: true,
    default: 0,
    max: 1,
    min: -1,
  },

  sort: {
    type: Schema.Types.Integer,
    index: true,
    default: 0,
  },

  count: {
    type: Schema.Types.Integer,
    index: true,
    default: 0,
  },

  parents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
      required: true,
      index: true,
    }
  ],
});








schema.path('names').validate(function(names) {
  return !!names.length
}, '必须添加一个名称 ({PATH})');

schema.path('names').validate(function(names) {
  return names.length <= 16
}, '最多添加 16 个名称 ({PATH})');



schema.path('parents').validate(function(parents) {
  return parents.length <= 16
}, '最多添加 16 个父级 ({PATH})');

schema.path('parents').validate(function(parents) {
  var ids = []
  for (let i = 0; i < parents.length; i++) {
    if (parents[i].equals(this.get('_id'))) {
      return false
    }
  }
  return true
}, '父级标签不能包含自己 ({PATH})');


schema.pre('save', async function() {
  // 内容
  if (this.isModified('content') && !this.isModified('htmlContent')) {
    this.set('htmlContent', this.getMarkdown().toHtml())
  }

  // 摘要
  if (this.isModified('content') && !this.isModified('excerpt')) {
    this.set('excerpt', this.getMarkdown().getExcerpt(this.get('uri')))
  }

  // 描述
  if (this.isModified('content') && !this.isModified('description')) {
    this.set('description', this.getMarkdown().getDescription())
  }

  // 图片
  if (this.isModified('content') && !this.isModified('images')) {
    this.set('images', this.getMarkdown().getImages())
  }
})

schema.set('toJSON', {
  virtuals: true,
});

schema.virtual('uri').get(function() {
  var names = this.get('names')
  if (!names || !names.length) {
    return '/tags/' + this.get('_id');
  }
  var name = names[names.length -1]
  if (name && /^[0-9a-zA-Z ]+$/.test(name)) {
    name = name.toLocaleLowerCase().replace(/ /g, '_')
  } else {
    name = this.get('_id')
  }
  return '/tags/' + encodeURIComponent(name);
});

schema.virtual('postUri').get(function() {
  var names = this.get('names')
  if (!names || !names.length) {
    return '/tag-' + this.get('_id');
  }
  var name = names[names.length -1]
  if (name && /^[0-9a-zA-Z ]+$/.test(name)) {
    name = name.toLocaleLowerCase().replace(/ /g, '_')
  } else {
    name = this.get('_id')
  }
  return '/tag-' + encodeURIComponent(name);
});

schema.statics.findByTag = function(value, projection, callback) {
  value = String(value).replace(/\s+|[_\-]+/g, ' ').trim()
  try {
    value = new Types.ObjectId(value)
    return this.findById(value, projection, callback)
  } catch (e) {
  }

  if (/^[0-9a-zA-Z ]+$/.test(value)) {
    value = {$regex:'^'+ value +'$', $options:'i'}
  }
  return this.findOne({names:value}, projection, callback)
}


module.exports = model('Tag', schema);
