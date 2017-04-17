import { Types } from 'mongoose'
import { Tag } from 'models'
const ObjectId = Types.ObjectId
export default async (ctx, next) => {
  var e
  const token = await ctx.token(1)
  const body = ctx.request.body

  var tag
  if (ctx.state.tag) {
    tag = ctx.state.tag
    tag.set('updatedAt', new Date)
  } else {
    tag = new Tag();
  }

  if (body.names) {
    let names = body.names
    if (typeof names == 'string') {
      try {
        names = names.split(',')
      } catch (e) {
        e.status = 403
        throw e
      }
    }
    names = names.filter(name => !!name)
    tag.set('names', names)
  }

  if (body.parents) {
    let newParents = []
    let parents = body.parents
    if (typeof parents == 'string') {
      try {
        parents = parents.split(',')
      } catch (e) {
        e.status = 403
        throw e
      }
    }
    if (!(parents instanceof Array) || parents.length > 32) {
      e = new Error('参数错误 (parents)')
      e.status = 400
      throw e
    }

    for (let i = 0; i < parents.length; i++) {
      let parent = parents[i]
      if (!parent || typeof parent != 'string') {
        continue
      }
      let tag = await Tag.findByTag(parent).exec()
      if (!tag) {
        e = new Error('父级标签"'+ parent +'"不存在 (parents)')
        e.status = 403
        throw e
      }
      newParents.push(tag.get("_id"))
    }
    tag.set('parents', newParents)
  }


  if (typeof body.sort == 'string' || typeof body.sort == 'number') {
    tag.set('sort', body.sort)
  }



  if (typeof body.content == 'string') {
    tag.set('content', body.content)
  }

  await tag.save()

  if (!ctx.state.tag) {
    ctx.body =  201
  }

  ctx.vmState(tag)
}
