"use strict";

const mongoose = require('mongoose');
const utils = require('mongoose/lib/utils')
const markdown = require('./markdown');

mongoose.Promise = global.Promise;

const db = mongoose.createConnection(__CONFIG__.mongodb, {noVirtualId: true, useNestedStrict: true,id: false});

function Integer(key, options) {
  mongoose.SchemaType.call(this, key, options, 'Integer')
}
Integer.prototype = Object.create(mongoose.Schema.Types.Number.prototype);


Integer.prototype.cast = function(value) {
  var _value = parseInt(value);
  if (isNaN(_value)) {
    throw new Error('Integer: ' + value + ' is not a integer');
  }
  return _value;
}
mongoose.Schema.Types.Integer = Integer;
(function(Schema) {
  if (Schema.prototype.preOriginal) {
    return;
  }

  Schema.prototype.preOriginal = Schema.prototype.pre
  Schema.prototype.postOriginal = Schema.prototype.post

  Schema.prototype.pre = function(name, isAsync, fn, errorCb) {
    if (arguments.length == 2 && isAsync.length == 0) {
      fn = function(next) {
        var result = isAsync.apply(this, []);
        if (result && result.then) {
          result.then(() => {
            next();
          }, next);
        } else {
          next()
        }
      }
      return this.preOriginal.apply(this, [name, fn])
    }
    return this.preOriginal.apply(this, arguments)
  }

  Schema.prototype.post = function(name, isAsync, fn) {
    if (arguments.length == 2 && isAsync.length == 0) {
      fn = function(doc, next) {
        var result = isAsync.apply(this, []);
        if (result && result.then) {
          result.then(() => {
            next();
          }, next);
        } else {
          next()
        }
      }
      return this.postOriginal.apply(this, [name, fn])
    }
    return this.postOriginal.apply(this, arguments)
  }
})(mongoose.Schema)







mongoose.SchemaType.prototype.doValidate = function(value, fn, scope) {
  var err = false,
      path = this.path,
      count = this.validators.length;

  if (!count) {
    return fn(null);
  }

  var validate = function(ok, validatorProperties) {
    if (err) {
      return;
    }
    if (ok === undefined || ok) {
      --count || fn(null);
    } else {
      err = new mongoose.Error.ValidatorError(validatorProperties);
      fn(err);
    }
  };

  var _this = this;
  this.validators.forEach(function(v) {
    if (err) {
      return;
    }

    var validator = v.validator;

    var validatorProperties = utils.clone(v);
    validatorProperties.path = path;
    validatorProperties.value = value;

    if (validator instanceof RegExp) {
      validate(validator.test(value), validatorProperties);
    } else if (typeof validator === 'function') {
      if (value === undefined && !_this.isRequired) {
        validate(true, validatorProperties);
        return;
      }
      if (validator.length === 2) {
        var isReturn = false
        var returnVal = validator.call(scope, value, function(ok, customMsg) {
          if (isReturn) {
            return
          }
          isReturn = true
          if (typeof returnVal === 'boolean') {
            return;
          }
          if (customMsg) {
            validatorProperties.message = customMsg;
          }
          validate(ok, validatorProperties);
        });
        if (typeof returnVal === 'boolean') {
          validate(returnVal, validatorProperties);
        } else if (returnVal instanceof Promise) {
          returnVal.then(function(ok) {
            if (isReturn) {
              return
            }
            isReturn = true
            validate(ok, validatorProperties)
          }, function(e) {
            if (isReturn) {
              return
            }
            isReturn = true
            validatorProperties.message = e.message
            validate(false, validatorProperties)
          })
        }
      } else {
        validate(validator.call(scope, value), validatorProperties);
      }
    }
  });
};



mongoose.Document.prototype.savePost = function(fn) {
  this.$_savePosts = this.$_savePosts || []
  this.$_savePosts.push(fn)
  return this
}
mongoose.Document.prototype.removePost = function(fn) {
  this.$_removePosts = this.$_removePosts || []
  this.$_removePosts.push(fn)
  return this
}

mongoose.Document.prototype.getMarkdown = function() {
  if (!this.$_markdown) {
    this.$_markdown = markdown(this.get('content'), {modelName: this.constructor.modelName})
  }
  return this.$_markdown
}


module.exports = function(name, schema, options) {
  if (schema instanceof mongoose.Schema) {
    if (options) {
      for (let key in options) {
        schema.set(key, options[value]);
      }
    }
  } else {
    schema = new mongoose.Schema(schema, options || {});
  }
  var path = schema.path('content')
  if (path) {
    path.set(function(value) {
      delete this.$_markdown
      return value
    })
  }

  schema.post('save', async function() {
    var savePosts = this.$_savePosts || []
    var removePosts = this.$_removePosts || []
    delete this.$_savePosts
    delete this.$_removePosts
    this.$_savePosts = []
    this.$_removePosts = []

    for (let i = 0; i < savePosts.length; i++) {
      let item = savePosts[i];
      if (!item) {
        continue
      }

      try {
        if (typeof item == 'function') {
          await item.call(this)
        } else {
          await item.save()
        }
      } catch (e) {
        throw e
      }
    }

    for (let i = 0; i < removePosts.length; i++) {
      let item = removePosts[i];
      if (!item) {
        continue
      }
      try {
        if (typeof item == 'function') {
          await item.call(this)
        } else {
          await item.remove()
        }
      } catch (e) {
        throw e
      }
    }
  })
  return db.model(name, schema);
};
