import crypto from 'crypto'

import { Schema } from 'mongoose'

import model from './model'

import Post from './post'

import validator from './validator'





var schema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    index:true,
    ref: 'Post',
    required: true,
    validate: [
      {
        validator: async function(id, cl) {
          var post = await Post.findById(id).exec()
          cl(post && post.get('comment') && !post.get('deletedAt'))
        },
        message: '不允许回复该文章 ({PATH})',
      },
    ]
  },

  author: {
    type: String,
    trim: true,
    required: [true, '名称不能为空'],
    maxlength: [32, '名称长度不能大于 32 字节 {PATH}'],
  },

  email: {
    type: String,
    maxlength: [64, '电子邮箱长度不能大于 64 字节 {PATH}'],
    set(value) {
      return value || undefined
    },
    validate: [
      {
        validator: function(email) {
          email = validator.email(email);
          if (!email) {
            return false;
          }
          this.set('email', email);
          return true;
        },
        message: '电子邮箱格式不正确',
      },
    ]
  },

  admin: {
    type: Boolean,
  },

  ip: {
    type: String,
    maxlength: 40,
  },

  token: {
    type: Schema.Types.ObjectId,
    ref: 'Token',
    required: true,
  },

  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    validate: [
      {
        validator: async function(id, cl) {
          var comment = await module.exports.findById(id).exec()
          cl(comment && !comment.get('deletedAt'))
        },
        message: '不允许回复该评论 ({PATH})',
      },
    ]
  },


  index: {
    type: Schema.Types.Integer,
    index: true,
  },

  content: {
    type: String,
    required: [true, '回复内容不能为空'],
    maxlength: [1024 * 8, '回复内容不能大于 8KB'],
  },

  htmlContent: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index:true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  deletedAt: {
    type: Date,
    index:true,
  },
});


schema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret.ip
    delete ret.email
  },
});


schema.virtual('avatar').get(function() {
  return '//cn.gravatar.com/avatar/'+  crypto.createHash('md5').update(this.get('email')).digest("hex") +'?s=50&r=pg&d=mm'
});


schema.pre('save', async function() {
  // 楼层自动递增数据
  if (this.isNew) {
    var post = await Post.findByIdAndUpdate(this.get('post'), {$inc: {'meta.comments': 1}}, {new: true})
    this.set('index', post.get('meta.comments'))
  }

  // 内容
  if (this.isModified('content') && !this.isModified('htmlContent')) {
    this.set('htmlContent', this.getMarkdown().toHtml())
  }
})


module.exports = model('Comment', schema);
