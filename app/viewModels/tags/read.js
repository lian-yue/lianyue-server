import Tag from '../../models/tag'
export default async (ctx, next) => {
  var tag = ctx.state.tag
  tag = await tag.populate({
    path: 'parents',
    select: {names:1, state:1, description: 1, count:1, sort: 1},
    match: {state: {$ne:-1}},
  }).execPopulate()


  tag = tag.toJSON()
  tag.children = await Tag.find({parents:tag._id, state: {$ne:-1}}, {names:1, state:1, description: 1, count:1, sort: 1}, {limit: 50, sort: {sort:-1, count:-1}}).exec()

  await ctx.render('tags/read', tag);
}
