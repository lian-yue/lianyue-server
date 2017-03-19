const path              = require('path')
const webpack           = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const precss            = require('precss')
const autoprefixer      = require('autoprefixer')

const packageInfo       = require('./package.json')


// process.traceDeprecation = true


const extractCSS = new ExtractTextPlugin({
  filename: "[name].css",
  disable: process.env.NODE_ENV == "development",
});

if (!process.env.npm_config_noVersion && process.env.NODE_ENV != "development") {
  let version = packageInfo.version.split('.');
  version[version.length -1] = parseInt(version[version.length -1]) + 1;
  packageInfo.version = version.join('.');
}


module.exports = {
  entry: {
    bundle: [
      path.join(__dirname, 'app/views/html/client.js'),
      path.join(__dirname, 'app/views/html/style/index.js'),
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
    modules: [
      path.join(__dirname, 'node_modules'),
    ],
    extensions: ['.js', '.jsx', '.json', '.css', '.less', '.sass', '.scss', '.styl'],
  },

  devServer: {
    hot: true,
    contentBase: path.join(__dirname, 'public/assets/html/'),
    noInfo: true,
    publicPath: '/assets/html/',
    inline: true,
    historyApiFallback: true,
    overlay: {
      warnings: true,
      errors: true
    }
  },

  module: {
    rules: [
      {
        test: require.resolve('react'),
        loader: 'expose-loader?React'
      },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: require('./config/babel')(false),
          }
        ],
        exclude: [
          path.resolve(__dirname, "node_modules"),
        ],
      },
      {
        test: /\.(scss|sass)$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    precss,
                    autoprefixer
                  ];
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [
                  path.join(__dirname, 'node_modules'),
                ]
              }
            }
          ],
        })
      },

      {
        test: /\.styl$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    precss,
                    autoprefixer
                  ];
                }
              }
            },
            'stylus-loader'
          ],
        })
      },
      {
        test: /\.less$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    precss,
                    autoprefixer
                  ];
                }
              }
            },
            'less-loader'
          ],
        })
      },
      {
        test: /\.css$/,
          use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    precss,
                    autoprefixer
                  ];
                }
              }
            }
          ],
        })
      },
      {
        test: /\.(gif|jpg|png|webp)\??.*$/,
        use: 'url-loader?limit=4096&name=images/[name].[ext]?v=[hash:8]'
      },
      {
        test: /\.(woff|svg|eot|ttf|woff2|woff)\??.*$/,
        use: 'url-loader?limit=4096&name=fonts/[name].[ext]?v=[hash:8]'
      },
    ]
  },


  plugins: [
    extractCSS,
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

  devtool: 'eval-source-map'
};
if (process.env.NODE_ENV == "development") {
  module.exports.entry.bundle.unshift('react-hot-loader/patch')


  module.exports.entry.bundle.unshift('webpack-hot-middleware/client?name=bundle')
  module.exports.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )

} else {
  module.exports.devtool = 'source-map'
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      mangle: {
      },
      compress: {
        warnings: false
      },
      comments: false,
      mangle: true,
      minimize: true,
    }),
    new webpack.optimize.OccurrenceOrderPlugin()
  )
}
