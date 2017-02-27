"use strict";
require('babel-polyfill')
require('babel-core/register')(require('../config/babel.js'))

global.app = require('../app');
