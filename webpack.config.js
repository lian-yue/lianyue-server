"strict mode"
const path              = require('path')
const webpack           = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const precss            = require('precss')
const autoprefixer      = require('autoprefixer')

const packageInfo       = require('./package.json')

var version = packageInfo.version.split('.');
version[version.length -1] = parseInt(version[version.length -1]) + 1;
packageInfo.version = version.join('.');


module.exports = {
  entry: {
    bundle: [
      path.join(__dirname, 'app/views/html/client.js'),
      path.join(__dirname, 'app/views/html/style/index.js')
    ],
    ie: [
      path.join(__dirname, 'node_modules/html5shiv/src/html5shiv.js'),
      path.join(__dirname, 'app/views/html/ie.js'),
    ],
  },

  output: {
    path: path.join(__dirname, 'public/assets/html/'),
    publicPath: '/assets/html/',
    filename: "[name].js",
    chunkFilename: "[chunkhash:8].[name].chunk.js",
  },

  resolve: {
    root: path.join(__dirname, 'node_modules'),
    alias: {
    },
    extensions: ['', '.js', '.jsx', '.json', '.css', '.less', '.sass', '.scss', '.styl'],
  },

  resolveLoader: {

  },

  devServer: {
    hot: true,
    inline: true
  },
  module: {
    loaders: [
      {test: require.resolve('react'), loader: 'expose?React'},
      {test: /\.(js|jsx)$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.styl$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!stylus')},
      {test: /\.sass$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')},
      {test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')},
      {test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css!postcss!less')},
      {test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css!postcss")},
      {test: /\.(gif|jpg|png)\??.*$/, loader: 'url-loader?limit=4096&name=images/[name].[ext]?v=[hash:8]'},
      {test: /\.(woff|svg|eot|ttf|woff2|woff)\??.*$/, loader: 'url-loader?limit=4096&name=fonts/[name].[ext]?v=[hash:8]'},
    ]
  },

  babel: {
    presets: ['es2015', 'react', 'stage-0'],
    plugins: ['transform-runtime', 'add-module-exports'],
  },


  postcss: function () {
    return [precss, autoprefixer];
  },

  plugins: [
    new ExtractTextPlugin("[name].css"),
    new webpack.BannerPlugin("Name: "+packageInfo.name+"\nVersion: "+ packageInfo.version +"\nAuthor: "+ packageInfo.author +"\nDescription: "+ packageInfo.description +""),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      },
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      '__ENV__': JSON.stringify(process.env.NODE_ENV),
      'process.version': JSON.stringify(packageInfo.version),
      __SERVER__: false,
    }),
  ],

  devtool: '#eval-source-map'
};


if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
}
