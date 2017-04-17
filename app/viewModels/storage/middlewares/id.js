import { Types } from 'mongoose'
import { Storage } from 'models'
const ObjectId = Types.ObjectId
export default async (ctx, next) => {
  var e;
  var id = ctx.params.id || '';
  try {
    id = new ObjectId(id);
  } catch (e) {
    e.status = 404;
    e.message = '文件不存在';
    throw e;
  }

  var storage = await Storage.findById(id).exec()

  var token
  if (!storage || (storage.get('deletedAt') && (!(token = await ctx.token()) || !token.get('admin')))) {
    e = new Error('文件不存在');
    e.status = 404;
    throw e;
  }

  ctx.state.storage = storage
  await next()
}
