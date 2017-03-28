import path from 'path'
import fs from 'fs'

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
  ctx.type = 'xml'
  const template = require('./' + relPath + '.ejs');
  ctx.body = template(state)
}
