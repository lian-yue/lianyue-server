import moment from 'moment'
import { Types } from 'mongoose'

import { Post, Tag } from 'models'


export default async function(ctx) {
  var e;

  var token = await ctx.token()

  var query = {}

  // 删除
  if (ctx.query.deleted && token && token.get('admin')) {
    query.deletedAt = {$exists: true}
  } else {
    query.deletedAt = {$exists: false}
    query.page = {$exists: !!ctx.query.isPage}
  }


  var tag = null
  if (ctx.params.tag) {
    tag = await Tag.findByTag(ctx.params.tag, {content: 0}).populate({
      path: 'parents',
      select: {names:1, state:1, description: 1, count:1, sort: 1},
      match: {state: {$ne:-1}},
    }).exec()

    if (!tag) {
      e = new Error('标签不存在')
      e.status = 404
      throw e
    }

    if (tag.get('state') == -1  && (!token || !token.get('admin'))) {
      e = new Error('标签已被禁用')
      e.status = 403
      throw e
    }

    tag = tag.toJSON()
    tag.children = await Tag.find({state: {$ne:-1}}, {names:1, state:1, description: 1, count:1, sort: 1}, {limit: 50, sort: {sort:-1, count:-1}}).exec()
    query.tags = tag._id
  }



  // 搜索
  if (ctx.query.search) {
    let search = ctx.query.search.replace(/[\u0000-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007f]+/g, ' ').split(' ').filter(value => !!value)
    if (search.length) {
      query.$and = []
      for (let value of search) {
        query.$and.push({title:{$regex: value, $options:'i'}})
      }
    }
  }


  // 排序
  var sort = {createdAt: -1}

  // 条数
  var limit = 20

  // 页面 跳过条数
  var page = 1
  if (ctx.query.page > 1 && !isNaN(parseInt(ctx.query.page))) {
    page = parseInt(ctx.query.page)
    if (page > 100) {
      page = 100
    }
  }
  var skip = ((page - 1) * limit)

  var results = await Post.find(query, {content: 0, htmlContent: 0}, {limit: limit + 1, skip, sort}).populate({
      path: 'tags',
      select: {content: 0},
      match: {state: {$ne:-1}},
    })
    .exec()

  var more = results.length > limit;
  if (more) {
    results.pop();
  }
  if (page >= 100) {
    more = false
  }

  if (skip && !results.length) {
    ctx.status = 404
  }

  ctx.vmState({tag, results, more})
}
