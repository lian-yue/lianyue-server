import { Post } from 'models'
export default async function(ctx) {
  var post = ctx.state.post

  post = await post.populate({
    path: 'tags',
    select: {names:1, state:1, description: 1, count:1, sort: 1},
    match: {state: {$ne:-1}},
  }).execPopulate()


  var userAgent = (ctx.request.header['user-agent'] || '').toLocaleLowerCase()
  if ((typeof ctx.query.record =='string' && !ctx.query.record) || ctx.method != 'GET' || userAgent.indexOf('bot/') != -1 || userAgent.indexOf('http://') != -1 || userAgent.indexOf('https://') != -1 || userAgent.indexOf('spider') != -1) {
    // 机器人 或不记录
  } else {
    await Post.findByIdAndUpdate(post.get('_id'), {$inc:{'meta.views': 1}})
  }


  post = post.toJSON()
  post.prev = await Post.findOne({_id:{$lt: post._id}, createdAt:{$lte: post.createdAt}, page: {$exists: !!post.page}, deletedAt: {$exists: false}}, {content: 0, excerpt: 0}, {sort: {createdAt:-1}}).exec()
  post.next = await Post.findOne({_id:{$gt: post._id}, createdAt:{$gte: post.createdAt}, page: {$exists: !!post.page}, deletedAt: {$exists: false}}, {content: 0, excerpt: 0}, {sort: {createdAt:1}}).exec()
  ctx.vmState(post);
}
