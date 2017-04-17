import { Types } from 'mongoose'
import { Comment } from 'models'

const ObjectId = Types.ObjectId

export default async function(ctx) {
  var e
  const post = ctx.state.post;

  const body = ctx.request.body;

  const token = await ctx.token(1);

  var comment = new Comment({
    ip: ctx.ip,
    admin: token.get('admin'),
    token: token.get('_id'),
  })

  comment.set('post', post.get('_id'))

  // content
  comment.set('content', body.content || '')

  // 作者
  comment.set('author', body.author || '')

  // email
  comment.set('email', body.email || '')


  // parent
  if (body.parent) {
    let parent = body.parent
    try {
      parent = new ObjectId(parent)
    } catch (e) {
      e.status = 403
      throw e
    }
    comment.set('parent', parent)
  }

  await comment.save()

  comment = await comment.populate('parent').execPopulate()

  ctx.vmState(comment)
}
