"strict mode"
const path        = require('path')
const fs          = require('fs');
const webpack     = require('webpack');
const packageInfo = require('./package.json');

fs.writeFileSync('./config/version.js', "module.exports = '"+ packageInfo.version +"';");

var nodeModules = fs.readdirSync('node_modules').filter(function (i) {
  return ['.bin', '.npminstall'].indexOf(i) === -1
})


exports = {
  entry: ['./app/index.js'],
  devtool: 'cheap-source-map',
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
    root: path.join(__dirname, 'node_modules'),
    alias: {
    },
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx', '.json'],
  },

  resolveLoader: {

  },
  module: {
    loaders: [
      {test: /\.(js|jsx)$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.json$/, loader: 'json'},
      {test: /\.styl$/, loader: 'null'},
      {test: /\.sass$/, loader: 'null'},
      {test: /\.scss$/, loader: 'null'},
      {test: /\.less$/, loader: 'null'},
      {test: /\.css$/, loader: 'null'},
      {test: /\.(gif|jpg|png)\??.*$/, loader: 'url'},
      {test: /\.(woff|svg|eot|ttf|woff2|woff)\??.*$/, loader: 'null'},
    ]
  },

  babel: require('./config/babel.js'),

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
    new webpack.optimize.DedupePlugin(),
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
    new webpack.optimize.OccurenceOrderPlugin(),
  ],

};




clientExports = require('./webpack.config.js');
clientExports.plugins.push(
  new webpack.optimize.DedupePlugin(),
  new webpack.BannerPlugin("Name: "+packageInfo.name+"\nVersion: "+ packageInfo.version +"\nAuthor: "+ packageInfo.author +"\nDescription: "+ packageInfo.description +""),
  new webpack.optimize.UglifyJsPlugin({
  mangle: {
  },
  compress: {
    warnings: false
  },
  comments: false,
  mangle: true,
  minimize: true,
}));



module.exports = [
  clientExports,
  exports,
];



process.on('exit', function(code) {
  if (code) {
    return;
  }
  fs.writeFileSync('./package.json', JSON.stringify(packageInfo, null, '  '));
});
