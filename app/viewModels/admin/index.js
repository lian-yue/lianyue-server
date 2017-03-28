import {password as adminPassword } from 'config/admin'

export default async function(ctx) {
  var e;

  var body = ctx.request.body;
  var password = (body.password || '').toString();

  if (!password) {
    e = new Error('密码不能为空');
    e.code = 'ValidatorError';
    throw e;
  }

  if (password !== adminPassword) {
    e = new Error('密码错误');
    e.code = 'ValidatorError';
    throw e;
  }

  var token = await ctx.token(1);
  token.set('admin', true);
  await token.save();
  token = await ctx.token(2);

  await ctx.render(token)
}
