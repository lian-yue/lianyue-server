import path from 'path'
import fs from 'fs'
import consolidate from 'consolidate'

const relPaths = ['posts/index']

export default async function(ctx, relPath, state) {
  if (typeof ctx.body == 'string') {
    return
  }
  if (ctx.method != 'GET' && ctx.method != 'HEAD') {
    return
  }
  if (relPath === true || relPath == 'messages' || relPaths.indexOf(relPath) == -1) {
    return
  }
  state.ctx = ctx;
  state.cache = ctx.app.env != 'development'
  ctx.type = 'xml'
  ctx.body = await consolidate.ejs(path.join(__dirname, './', relPath + '.ejs'), state)
}
