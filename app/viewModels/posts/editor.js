import { Types } from 'mongoose'
import {Post, Tag} from 'models'

export default async (ctx, next) => {
  var e
  const token = await ctx.token(1)
  const body = ctx.request.body

  var post
  if (ctx.state.post) {
    post = ctx.state.post
    post.set('updatedAt', new Date)
  } else {
    post = new Post();
  }

  if (typeof body.title == 'string') {
    post.set('title', body.title)
  }

  if (typeof body.slug == 'string') {
    post.set('slug', body.slug)
  }

  if (typeof body.content == 'string') {
    post.set('content', body.content)
  }

  if (typeof body.page != 'undefined') {
    post.set('page', body.page)
  }
  if (typeof body.comment != 'undefined') {
    post.set('comment', body.comment)
  }

  if (body.tags) {
    let names = body.tags
    let name
    let tags = []
    let tag
    if (typeof names == 'string') {
      names = names.split(',')
    }
    names = names.map(name => name.trim())

    if (!(names instanceof Array)) {
      e = new Error('标签数据格式错误')
      e.code = 'tags'
      e.status = 400
      throw e;
    }

    if (names.length > 32) {
      e = new Error('标签数不能大于 32 个')
      e.code = 'tags'
      e.status = 403
      throw e;
    }


    for (let i = 0; i < names.length; i++) {
      name = names[i]
      if (!name) {
        continue
      }
      name = String(name)
      tag = await Tag.findByTag(name).exec()

      // 自动创建
      if (!tag) {
        tag = new Tag({
          names: [name],
        })
        await tag.save()
      }

      tags.push(tag.get('_id'));
    }

    post.set('tags', tags)
  }


  await post.save()
  if (!ctx.state.post) {
    ctx.status = 201
  }

  ctx.vmState(post)
}
