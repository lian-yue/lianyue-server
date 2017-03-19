require('babel-polyfill')
require('babel-core/register')(require('../config/babel')(true))

global.app = require('../app');
