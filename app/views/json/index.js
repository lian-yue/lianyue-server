export default async function(ctx, path, state) {
  if (ctx.method != 'POST' || ctx.request.type != 'multipart/form-data') {
    ctx.type = 'json';
  }
  ctx.set("X-Content-Type-Options", 'nosniff');
  var body = JSON.stringify(state);
  ctx.body = body;
}
