import { Types } from 'mongoose'
import Comment from '../../models/comment'

const ObjectId = Types.ObjectId

export default async function(ctx) {
  var e
  var token
  var limit = 100
  var sort = {
    createdAt: -1,
  }

  if (ctx.query.asc) {
    sort.createdAt = 1
  }

  var query = {}

  query.deletedAt = {$exists: false}
  if (ctx.query.deleted) {
    query.deletedAt = {$exists: true}
  }

  if (ctx.query.id) {
    var id = ctx.query.id
    try {
      id = new ObjectId(id)
    } catch (e) {
      e.status = 403
      throw e
    }
    query._id = sort.createdAt == -1 ? {$lt: id} : {$gt: id}
  }

  var results = await Comment.find(query, null, {limit: limit + 1, sort})
    .populate([{
      path: 'parent'
    }, {
      path: 'post',
      select: {title:1, slug: 1, comment:1},
    }])
    .exec();
  var more = results.length > limit;
  if (more) {
    results.pop();
  }

  await ctx.render('comments', {results, more});
}
