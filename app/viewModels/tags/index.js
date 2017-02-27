import { Types } from 'mongoose'
import Tag from '../../models/tag'
const ObjectId = Types.ObjectId
export default async (ctx, next) => {
  var e
  const token = await ctx.token();

  var limit = 100
  var skip = 0
  var sort = {
    sort:-1,
    count:-1,
  }
  var query = {}

  if (ctx.query.page) {
    let page = parseInt(ctx.query.page)
    if (isNaN(page) || page < 1) {
      page = 1
    } else if (page > 100) {
      page = 100
    }
    skip = (page - 1) * limit
  }

  query.state = {$ne: -1}
  if (token && typeof ctx.query.state != 'undefined' && token.get('admin')) {
    let state = parseInt(ctx.query.state)
    if (isNaN(state)) {
      state = 0
    }
    query.state = state
  }


  if (ctx.query.search) {
    let search = ctx.query.search.replace(/[\u0000-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007f]+/g, ' ').split(' ').filter(value => !!value)
    if (search.length) {
      query.$and = []
      for (let value of search) {
        query.$and.push({names:{$regex: value, $options:'i'}})
      }
    }
  }

  var results = await Tag.find(query, {parents: 0, content: 0, htmlContent: 0}, {limit: limit + 1, skip, sort}).exec();
  var more = results.length > limit;
  if (more) {
    results.pop();
  }

  if (skip && !results.length) {
    ctx.status = 404
  }

  await ctx.render('tags/index', {results, more});
}
