import {Schema, Types} from 'mongoose'
import model from './model'

var schema = new Schema({
  logs: [
    {
      ip: {
        type: String,
        default: '0.0.0.0',
      },
      date: {
        type: Date,
        default: Date.now,
      },
      userAgent: {
        type: String,
        default: '',
      },
    }
  ],

  random: {
    type: String,
    default: function() {
      return Math.random().toString(36).substr(2);
    },
  },

  admin: {
    type: Boolean,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  expiredAt: {
    type: Date,
    default: () => {
      var date = new Date();
      date.setFullYear(date.getFullYear() + 4);
      return date;
    }
  },
});



schema.set('toJSON', {
  transform(doc, ret) {
    delete ret.logs;
    delete ret.random;
  },
});


module.exports = model('Token', schema);
