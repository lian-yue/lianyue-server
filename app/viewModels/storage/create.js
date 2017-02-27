import fs from 'fs'


import Storage from '../../models/storage'




var unlink = function (path) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err, result) => {
      if (err) {
        reject(err)
        return;
      }
      resolve(result);
    });
  });
};



export default async function(ctx) {
  var e;

  if (!(ctx.request.body instanceof Object) || !(ctx.request.body.files instanceof Object) || !(ctx.request.body.files.file instanceof Object) || !ctx.request.body.files.file.path) {
    e = new Error('参数错误');
    e.code = 'PARAM';
    e.status = 400;
    throw e;
  }

  var file = ctx.request.body.files.file;

  const storage = new Storage({
    name: file.name,
    path: file.path,
  });

  try {
    await storage.save();
  } catch (e) {
    await unlink(file.path);
    throw e;
  }
  await unlink(file.path);

  ctx.status = 201;
  await ctx.render(storage);
}
