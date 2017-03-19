const path        = require('path')
const fs          = require('fs');
const webpack     = require('webpack');
const packageInfo = require('./package.json');

fs.writeFileSync('./config/version.js', "module.exports = '"+ packageInfo.version +"';");

var nodeModules = fs.readdirSync('node_modules').filter(function (i) {
  return ['.bin', '.npminstall'].indexOf(i) === -1
})


exports = {
  entry: [
    './app/index.js'
  ],

  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.js',
    publicPath: '/build/',
    libraryTarget: 'commonjs2'
  },

  target: 'node',

  node: {
    fs: 'empty',
    __dirname: true,
    __filename: true
  },

  resolve: {
    modules: [
      path.join(__dirname, 'node_modules'),
    ],
    extensions: ['.js', '.jsx', '.json', '.css', '.less', '.sass', '.scss', '.styl'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: require('./config/babel')(true),
          }
        ],
        exclude: [
          path.resolve(__dirname, "node_modules"),
        ],
      },
      {
        test: /\.json$/,
        use: 'json-loader',
      },
      {
        test: /\.styl$/,
        use: 'null-loader',
      },
      {
        test: /\.sass$/,
        use: 'null-loader',
      },
      {
        test: /\.scss$/,
        use: 'null-loader',
      },
      {
        test: /\.less$/,
        use: 'null-loader',
      },
      {
        test: /\.css$/,
        use: 'null-loader',
      },
      {
        test: /\.(gif|jpg|png)\??.*$/,
        use: 'url-loader',
      },
      {
        test: /\.(woff|svg|eot|ttf|woff2|woff)\??.*$/,
        use: 'null-loader',
      },
    ]
  },

  externals: [
    function (context, request, callback) {
      var pathStart = request.split('/')[0]
      if (!pathStart || pathStart[0] === '!') {
        return callback();
      }
      if (nodeModules.indexOf(pathStart) >= 0) {
        return callback(null, 'commonjs ' + request);
      }
      if (request.indexOf('../config') >= 0) {
        return callback(null, 'commonjs ' + '../config');
      }
      if (request.indexOf('./package') >= 0) {
        return callback(null, 'commonjs ' + '../package');
      }
      return callback();
    }
  ],


  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   mangle: {
    //   },
    //   compress: {
    //     warnings: false
    //   },
    // }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      },
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      '__ENV__': JSON.stringify(process.env.NODE_ENV),
      __SERVER__: true,
    }),
    // new webpack.optimize.OccurenceOrderPlugin(),
  ],

  devtool: 'cheap-source-map',
};





module.exports = [
  require('./webpack.config.js'),
  exports,
];



process.on('exit', function(code) {
  if (code) {
    return;
  }
  fs.writeFileSync('./package.json', JSON.stringify(packageInfo, null, '  '));
});
