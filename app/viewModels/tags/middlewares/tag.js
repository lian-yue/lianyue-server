import { Types } from 'mongoose'
import { Tag } from 'models'
const ObjectId = Types.ObjectId
export default async (ctx, next) => {
  var tag = await Tag.findByTag(ctx.params.tag).exec()

  if (!tag) {
    var e = new Error('标签不存在');
    e.status = 404;
    throw e;
  }

  var token
  if (tag.get('state') == -1 && (!(token = await ctx.token()) || !token.get('admin'))) {
    e = new Error('标签被禁用');
    e.status = 403;
    throw e;
  }

  ctx.state.tag = tag
  await next()
}
