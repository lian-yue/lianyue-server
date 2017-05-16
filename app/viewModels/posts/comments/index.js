import { Types } from 'mongoose'
import { Comment } from 'models'

const ObjectId = Types.ObjectId

export default async function(ctx, next) {
  var e
  var post = ctx.state.post
  var token
  var limit = 5
  var sort = {
    index: 1,
  }
  if (ctx.query.desc) {
    sort.index = -1
  }

  var query = {}
  query.post = post.get('_id')

  query.deletedAt = {$exists: false}
  if (ctx.query.deleted && (token = await ctx.token()) && token.get('admin')) {
    query.deletedAt = {$exists: true}
  }


  if (ctx.query.index) {
    var index = parseInt(ctx.query.index)
    if (isNaN(index) || index < 1) {
      index = 0
    }
    if (index) {
      query.index = sort.index == -1 ? {$lt: index} : {$gt: index}
    }
  }

  var results = await Comment.find(query, null, {limit: limit + 1, sort})
    .populate({
      path: 'parent'
    })
    .exec();
  var more = results.length > limit;
  if (more) {
    results.pop();
  }

  post = post.toJSON()
  delete post.content
  delete post.htmlContent
  ctx.vmState({results, more, post});
}
