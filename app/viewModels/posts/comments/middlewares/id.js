import { Types } from 'mongoose'
import Comment from '../../../../models/comment'

const ObjectId = Types.ObjectId

export default async function(ctx, next) {
  var id
  try {
    id = new ObjectId(ctx.params.id)
  } catch (e) {
    e.status = 403
    throw e
  }

  var comment = await Comment.findById(id).exec();

  var token
  if (!comment || (comment.get('deletedAt') && (!(token = await ctx.token()) || !token.get('admin')))) {
    var e = new Error('评论不存在');
    e.status = 404;
    throw e;
  }

  ctx.state.comment = comment
  await next()
}
