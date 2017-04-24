const fs                = require('fs')
const path              = require('path')
const webpack           = require('webpack')
const merge             = require('webpack-merge')
const precss            = require('precss')
const autoprefixer      = require('autoprefixer')
const { VueSSRServerPlugin } = require('vue-ssr-webpack-plugin')


const packageInfo       = require('./package')


var ignoreModules = fs.readdirSync('node_modules')

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const isDev = process.env.NODE_ENV == 'development'




function base() {
  return {
    output: {
      path: path.resolve(__dirname, isDev ? 'dev' : 'dist'),
      filename: "[name].js",
      chunkFilename: "[chunkhash:8].[name].chunk.js",
      libraryTarget: 'commonjs2',
    },


    target: 'node',

    node: {
      console: false,
      global: true,
      process: true,
      Buffer: true,
      __dirname: false,
      __filename: false,
      setImmediate: true
    },

    resolve: {
      modules: [
        path.join(__dirname, 'node_modules'),
        path.join(__dirname, 'app'),
        path.join(__dirname, isDev ? 'dev' : 'dist'),
      ],
      extensions: [
        isDev ? '.dev.js' : '.prod.js',
        isDev ? '.dev.jsx' : '.prod.jsx',
        '.js',
        '.jsx',
        '.json',
        '.ejs',
      ],
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

        //  package 配置文件
        if (pathStart == 'package') {
          return callback(null, 'commonjs2 ../' + request);
        }

        //  vue-ssr-bundle
        if (pathStart == 'vue-ssr-bundle' && !isDev) {
          return callback(null, 'commonjs2 ./' + request);
        }

        return callback();
      }
    ],


    devServer: {
      hot: true,
      inline: true,
      noInfo: true,
    },

    module: {
      rules: [
        {
          test: /\.ejs$/,
          use: [
            {
              loader: 'ejs-loader',
            },
          ],
        },
        {
          test: /\.(gif|jpg|png|webp|svg)\??.*$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 4096,
                name: 'images/[name].[ext]?[hash:8]'
              }
            }
          ]
        },
        {
          test: /\.(woff|eot|ttf|woff2|woff)\??.*$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 4096,
                name: 'fonts/[name].[ext]?[hash:8]'
              }
            }
          ]
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
      new webpack.NamedModulesPlugin(),
    ],

    devtool: isDev ? 'eval-source-map' : 'source-map'
  }
}



const index = merge(base(), {
  entry: {
    index: [
      path.resolve(__dirname, 'app'),
    ],
  },


  resolve: {
    extensions: [
      '.css',
      '.less',
      '.sass',
      '.scss',
      '.styl',
    ],
  },


  module: {
    rules: [
      {
        test: /\.jsx?$/,
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
        test: /\.(css|less|scss|sass|styl)\??.*$/,
        use: 'null-loader'
      },
    ]
  },
})


if (isDev) {
  index.entry.index.unshift('webpack/hot/poll?1000')
  index.plugins.push(new webpack.HotModuleReplacementPlugin())
}


const viewsVue = merge(base(), {
  entry: {
    viewsVue: [
      path.resolve(__dirname, 'app/views/vue/server'),
    ],
  },

  resolve: {
    extensions: [
      isDev ? '.dev.vue' : '.prod.vue',
      '.vue',
    ],
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          preserveWhitespace: false,
          postcss: {
            plugins: function () {
              return [
                precss,
                autoprefixer
              ];
            }
          },
          loaders: {
            sass: [
              {
                loader: 'vue-style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev,
                },
              },
              {
                loader: 'sass-loader',
              },
            ],
            scss: [
              {
                loader: 'vue-style-loader',
              },
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  indentedSyntax: true,
                },
              },
            ]
          }
        }
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            "es2015",
            "stage-0"
          ],
          plugins: [
            "transform-vue-jsx",
            "transform-decorators-legacy",
            "transform-runtime",
          ],
          cacheDirectory: isDev
        },
      },
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.VUE_ENV': '"server"'
    }),
    new VueSSRServerPlugin(),
  ],
})

module.exports = [
  viewsVue,
  index,
]
