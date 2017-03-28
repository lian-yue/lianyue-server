const fs                = require('fs')
const path              = require('path')
const webpack           = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const precss            = require('precss')
const autoprefixer      = require('autoprefixer')

const packageInfo       = require('./package')


var ignoreModules = fs.readdirSync('node_modules')



process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const isDev = process.env.NODE_ENV == 'development'

module.exports = {
  entry: {
    index: [
      path.resolve(__dirname, 'app'),
    ],
  },

  output: {
    path: path.resolve(__dirname, isDev ? 'dev' : 'dist'),
    filename: "[name].js",
    chunkFilename: "[chunkhash:8].[name].chunk.js",
    libraryTarget: 'commonjs2',
  },


  externals: [
    function (context, request, callback) {
      var pathStart = request.split('/')[0]

      // ! 开始指定 loader
      if (!pathStart || pathStart[0] === '!' || request.indexOf('?') != -1) {
        return callback();
      }

      // 忽略的模块
      if (ignoreModules.indexOf(pathStart) != -1) {
        return callback(null, 'commonjs2 ' + request);
      }

      //  config 配置文件
      if (pathStart == 'config') {
        return callback(null, 'commonjs2 ../' + request);
      }

      //  config 配置文件
      if (pathStart == 'package') {
        return callback(null, 'commonjs2 ../' + request);
      }

      return callback();
    }
  ],

  resolve: {
    modules: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'app'),
    ],
    extensions: [isDev ? '.dev.js' : '.prod.js', isDev ? '.dev.jsx' : '.prod.jsx', '.js', '.jsx', '.ejs', '.json', '.css', '.less', '.sass', '.scss', '.styl'],
  },

  target: 'node',


  node: {
    console: false,
    global: true,
    process: true,
    Buffer: true,
    // __filename: "mock",
    // __dirname: "mock",
    __dirname: false,
    __filename: false,
    setImmediate: true
  },

  devServer: {
    hot: true,
    inline: true,
    noInfo: true,
  },


  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                "es2015",
                "react",
                "stage-0"
              ],
              plugins: [
                "transform-decorators-legacy",
                "transform-runtime",
                "add-module-exports",
              ],
              cacheDirectory: isDev
            },
          }
        ],
        exclude: [
          path.resolve(__dirname, "node_modules"),
        ],
      },
      {
        test: /\.(ejs)$/,
        use: [
          {
            loader: 'ejs-loader',
          },
        ],
      },
      {
        test: /\.(css|less|scss|sass|styl|gif|jpg|png|webp|woff|svg|eot|ttf|woff2|woff)\??.*$/,
        use: 'null-loader'
      },
    ]
  },


  plugins: [
    new webpack.BannerPlugin("Name: "+packageInfo.name+"\nVersion: "+ packageInfo.version +"\nAuthor: "+ packageInfo.author +"\nDescription: "+ packageInfo.description +""),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        version: JSON.stringify(packageInfo.version)
      },
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      __ENV__: JSON.stringify(process.env.NODE_ENV),
      __SERVER__: true,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings : false,
      },
      comments: true,
      beautify: true,
      mangle: false,
      output: {
        indent_level: 2,
      },
      sourceMap: true,
    }),
    new webpack.NoEmitOnErrorsPlugin(),
  ],


  devtool: isDev ? 'eval-source-map' : 'source-map'
}


if (isDev) {
  // module.exports.entry.index.unshift('react-hot-loader/patch', 'webpack/hot/poll?1000')
  module.exports.entry.index.unshift('webpack/hot/poll?1000')
  module.exports.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin())

}
