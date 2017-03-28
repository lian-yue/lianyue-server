const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const mmmagic = require('mmmagic');
const configConfig = require('config/storage');

import { Schema } from 'mongoose'

import model from './model'

var schema = new Schema({
  createdAt: {
    type: Date,
    index: true,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  deletedAt: {
    index: true,
    type: Date,
  },

  type: {
    type: String,
    index: true,
    lowercase: true,
    trim: true,

    required: true,
    validate: [
      {
        validator: function(type) {
          return !!configConfig.types[type];
        },
        message: '文件类型不允许 ({PATH})',
      },
    ]
  },
  path: {
    type: Schema.Types.Mixed,
    required: true,
    set(value) {
      delete this.$_originalPath
      return value
    }
  },
  name: {
    type: String,
    trim: true,
    required: [true, '文件名不能为空'],
  },
  size: {
    type: Schema.Types.Integer,
    index: true,
    default: 0,
    max: [configConfig.size, '文件不能大于 '+ (configConfig.size / 1024 /1024) +'MB  ({PATH})']
  },

  md5: {
    type: String,
    lowercase: true,
    trim: true,
  },
  sha1: {
    type: String,
    lowercase: true,
    trim: true,
  },
  length: {
    type: Number,
    min:0,
  },
  width: {
    type: Schema.Types.Integer,
    min:0,
  },
  height: {
    type: Schema.Types.Integer,
    min:0,
  },
  meta: {
    type: Object,
    default: Object,
  },
});



schema.methods.uri = function(width = 0, height = 0, crop = 0, enlarge = 0, extension = 'jpg') {
  return configConfig.uri + this.get('path') + '!' + ([width, height, crop, enlarge].join('_')) + '.' + extension;
}


schema.virtual('original').get(function() {
  return configConfig.uri + this.get('path');
});


schema.virtual('thumbnail').get(function() {
  if (['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'].indexOf(this.get('type')) == -1) {
    return undefined;
  }
  return this.uri(200, 200, 0, 0, 'jpg');
});



schema.set('toJSON', {
  virtuals: true,
});




function mkdirPromise(dir) {
  const mkdir = (dir, callback)  => {
    fs.exists(dir, (exists) => {
      if (exists) {
        callback(null);
        return;
      }

      mkdir(path.dirname(dir), (err) => {
        fs.mkdir(dir, 0o755, (err) => {
          if (err && err.code != 'EEXIST') {
            callback(err);
            return;
          }
          callback(null);
        });
      });
    });
  }

  return new Promise((resolve, reject) => {
    mkdir(dir, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}





schema.pre('validate', async function() {
  if (!this.get('path') || !this.isModified('path') || this.$_originalPath) {
    return;
  }

  var originalPath = this.get('path');

  // 文件存在判断
  var exists = await new Promise((resolve, reject) => {
    if (originalPath instanceof Buffer) {
      resolve(true);
      return;
    }
    fs.exists(originalPath, (exists) => {
      resolve(exists);
    });
  })
  if (!exists) {
    throw new Error('上传的文件不存在');
  }


  // 文件类型
  var type = await module.exports.type(originalPath)
  this.set('type', type);


  // 文件大小
  var size = await new Promise((resolve, reject) => {
    if (originalPath instanceof Buffer) {
      resolve(originalPath.length);
    } else {
      fs.stat(originalPath, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stats.size);
      });

    }
  });
  this.set('size', size);


  // 文件 hash
  var { md5, sha1 } = await new Promise((resolve, reject) => {
    const md5 = crypto.createHash('md5')
    const sha1 = crypto.createHash('sha1')
    if (originalPath instanceof Buffer) {
      md5.update(originalPath)
      sha1.update(originalPath)
      resolve({md5:md5.digest('hex'), sha1: sha1.digest('hex')})
    } else {
      const input = fs.createReadStream(originalPath);
      var error = false;
      input.on('readable', () => {
        var data = input.read();
        if (data) {
          md5.update(data);
          sha1.update(data);
        }
      })

      input.on('error', (err) => {
        error = true;
        reject(err);
      });
      input.on('end', () => {
        if (!error) {
          resolve({md5:md5.digest('hex'), sha1: sha1.digest('hex')})
        }
      });
    }
  });
  this.set('md5', md5);
  this.set('sha1', sha1);


  // 图片大笑
  var { width, height } = await new Promise((resolve, reject) => {
    const magic = new mmmagic.Magic(mmmagic.MAGIC_RAW | mmmagic.MAGIC_CONTINUE);
    const callback = (err, result) => {
      if (err) {
        reject(err)
        return;
      }
      if (!result.length) {
        resolve({width:0, height:0});
        return;
      }

      var matches = result[0].match(/(?:^|,)\s*(\d+)\s*x\s*(\d+)\s*(?:,|$)/);
      if (!matches) {
        resolve({width:0, height:0});
        return;
      }
      resolve({width:parseInt(matches[1]), height: parseInt(matches[2])});
    }
    if (originalPath instanceof Buffer) {
      magic.detect(originalPath, callback);
    } else {
      magic.detectFile(originalPath, callback);
    }
  });
  this.set('width', width);
  this.set('height', height);



  // 新目录
  var names = this.get('name').split('.');
  var extension = names.length > 1 ? names[names.length - 1].toLowerCase() : '';
  if (configConfig.types[type] && configConfig.types[type].indexOf(extension) == -1) {
    extension = configConfig.types[type][0];
  }

  var date = new Date();
  var path = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours() + 1,
    date.getMinutes() + 1,
    Math.random().toString(36).substr(2, 4) + Math.random().toString(36).substr(4, 2) + '.' + extension,
  ].map((value) => {
    value = value.toString();
    if (value.length < 2) {
      value = '0' + value;
    }
    return value;
  }).join('/')

  path = '/' + path;
  this.set('path', path)
  this.$_originalPath = originalPath
});




schema.pre('save', async function() {
  if (!this.$_originalPath) {
    return;
  }
  var originalPath = this.$_originalPath
  var newPath = configConfig.dir + this.get('path')
  await mkdirPromise(path.dirname(newPath));



  await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(newPath);
    var error;
    if (originalPath instanceof Buffer) {
      writeStream.on('error', (err) => {
        error = true;
        reject(err);
      });

      writeStream.end(originalPath, function() {
        if (!error) {
          resolve();
        }
      });
    } else {
      const readStream = fs.createReadStream(originalPath);
      readStream.on('error', (err) => {
        error = true;
        reject(err);
      });

      readStream.on('end', () => {
        if (!error) {
          resolve();
        }
      });
      readStream.pipe(writeStream);
    }
  });
  delete this.$_originalPath
});


schema.statics.type = function(path) {
  return new Promise((resolve, reject) => {
    const magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);
    const callback = (err, result) => {
      if (err) {
        reject(err)
        return;
      }
      resolve(result);
    }
    if (path instanceof Buffer) {
      magic.detect(path, callback);
    } else {
      magic.detectFile(path, callback);
    }
  });
};



module.exports = model('Storage', schema);
