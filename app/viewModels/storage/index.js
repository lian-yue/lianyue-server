import Storage from '../../models/storage'
const ObjectId = require('mongoose').Types.ObjectId;




export default async function(ctx) {
  var e
  var limit
  var query = {}

  const token = await ctx.token()

  if (!ctx.query.limit || ctx.query.limit > 200 || ctx.query.limit < 1 || isNaN(ctx.query.limit)) {
    limit = 50
  } else {
    limit = parseInt(ctx.query.limit)
  }



  if (ctx.query.lt_id) {
    try {
      query._id = {$lt: new ObjectId(ctx.query.lt_id)}
    } catch (e) {
      e.status = 403;
      throw e;
    }
  }

  var start, end
  if (ctx.query.start) {
    start = new Date(ctx.query.start);
    if (isNaN(start)) {
      e = new Error('Query start');
      e.status = 403;
      throw e;
    }
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
  }


  if (ctx.query.end) {
    end = new Date(ctx.query.end);
    if (isNaN(end)) {
      e = new Error('Query end');
      e.status = 403;
      throw e;
    }
    end.setHours(0);
    end.setMinutes(0);
    end.setSeconds(0);
    end.setMilliseconds(0);
  }

  if (end && start && start > end) {
    let start2 = start
    let end2 = end
    start = end2
    end = start2
  }

  if (start) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$gte = start;
  }

  if (end) {
    query.createdAt = query.createdAt || {};
    query.createdAt.$lte = end;
  }

  if (token && token.get('admin') && ctx.query.deleted) {
    query.deletedAt = {$exists: true}
  } else {
    query.deletedAt = {$exists: false}
  }


  if (ctx.query.search) {
    let search = String(ctx.query.search).replace(/[\u0000-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007f]+/g, ' ').split(' ').filter(value => !!value);
    if (search.length) {
      query.$and = []
      for (let value of search) {
        query.$and.push({name:{$regex: value, $options:'i'}});
      }
    }
  }


  var results = await Storage.find(query, null, {limit: limit + 1, sort:{_id:-1}}).exec();
  var more = results.length > limit;
  if (more) {
    results.pop();
  }
  await ctx.render({results, more});
}
