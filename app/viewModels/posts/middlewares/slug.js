import { Types } from 'mongoose'
import Post from '../../../models/post'
const ObjectId = Types.ObjectId
export default async (ctx, next) => {
  var id
  try {
    id = new ObjectId(ctx.params.slug)
  } catch (e) {
  }

  var post;
  if (id) {
    post = Post.findById(id);
  } else {
    post = Post.findOne({slug: ctx.params.slug || ''});
  }
  post = await post.exec()
  var token
  if (!post || (post.get('deletedAt') && (!(token = await ctx.token()) || !token.get('admin')))) {
    var e = new Error('文章不存在');
    e.status = 404;
    throw e;
  }

  ctx.state.post = post
  await next()
}
