import { Schema, Types } from 'mongoose'
import model from './model'
import Tag from './tag'


var schema = new Schema({
  // slug
  slug: {
    type: String,
    index: true,
    trim: true,
    lowercase: true,

    minlength: [3, 'Slug 长度不能少于 3 位或大于 32 字节'],
    maxlength: [32, 'Slug 长度不能少于 3 位或大于 32 字节'],
    match: [/^[0-9a-z_-]+$/, 'Slug 只允许使用小写英文，数字和 _-'],
    set(value) {
      return value || undefined
    },
    validate: [
      {
        validator: function(slug) {
          return __CONFIG__.retain(slug);
        },
        message: 'Slug 名被系统保留 ({PATH})',
      },
      {
        validator: function(slug) {
          if (slug.length != 24) {
            return true
          }
          try {
            new Types.ObjectId(slug)
          } catch (e) {
            return true
          }
          return false
        },
        message: 'Slug 不能是 ID ({PATH})',
      },
      {
        validator: async function(slug, cb) {
          var post = await module.exports.findOne({slug}).read('primary').exec();
          cb(!post || post.get('_id').equals(this.get('_id')));
        },
        message: 'Slug 已存在 ({PATH})',
      },
    ]
  },

  // 是否是页面
  page: {
    type: Boolean,
    index: true,
    set(value) {
      return value || undefined
    }
  },

  // 是否允许评论
  comment: {
    type: Boolean,
    index: true,
    default: true,
  },

  tags: [
    {
      type: Schema.Types.ObjectId,
      index: true,
      ref: 'Tag',
      required: true,
    }
  ],

  // 创建时间
  createdAt: {
    type: Date,
    index: true,
    default: Date.now,
  },


  //  更新时间
  updatedAt: {
    type: Date,
    index: true,
    default: Date.now,
  },


  //  删除时间
  deletedAt: {
    type: Date,
    index: true,
  },

  // 最后评论时间
  commentAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  meta: {
    views: {
      type: Schema.Types.Integer,
      default: 0,
    },
    comments: {
      type: Schema.Types.Integer,
      index: true,
      default: 0,
    },
  },

  // 标题
  title: {
    type: String,
    required: [true, '标题不能为空'],
    maxlength: [128, '标题不能长度不能大于 128 字节 {PATH}'],
  },

  //  内容
  content: {
    type: String,
    required: [true, '内容不能为空'],
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
});


schema.path('tags').set(function(tags) {
  if (!this.$_oldTags) {
    this.$_oldTags = this.get('tags')
  }
  return tags
})


schema.path('tags').validate(function(tags) {
  return tags.length <= 32
}, '标签数不能大于 32 个 ({PATH})')



schema.path('tags').validate(function(tags) {
  var exists = {}
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i]
    if (exists[tag]) {
      return false
    }
    exists[tag] = true
  }
  return true
}, '标签存在重复 ({PATH})');



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

  // 标签数量
  let oldTags = this.$_oldTags
  let newTags = this.get('tags')
  delete this.$_oldTags
  if (oldTags) {
    oldTags = oldTags.filter(tag => tag).map(tag => tag.toString())
    newTags = newTags.filter(tag => tag).map(tag => tag.toString())
    let addTags = newTags.filter(id => oldTags.indexOf(id) == -1).map(id => new Types.ObjectId(id))
    let delTags = oldTags.filter(id => newTags.indexOf(id) == -1).map(id => new Types.ObjectId(id))
    if (addTags.length) {
      await Tag.update({_id:{$in:addTags}}, {$inc:{count:1}}, {multi: true})
    }
    if (delTags.length) {
      await Tag.update({_id:{$in: delTags}, count:{$gt: 0}}, {$inc:{count:-1}}, {multi: true})
    }
  }
});




schema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
  },
});

schema.virtual('uri').get(function() {
  return '/' + encodeURIComponent(this.get('slug') || this.get('_id'));
});

schema.virtual('commentUri').get(function() {
  return '/' + encodeURIComponent(this.get('slug') || this.get('_id')) + '/comments';
});



module.exports = model('Post', schema);
