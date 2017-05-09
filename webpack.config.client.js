const path              = require('path')
const webpack           = require('webpack')
const merge             = require('webpack-merge')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const precss            = require('precss')
const autoprefixer      = require('autoprefixer')

const packageInfo       = require('./package')
const site              = require('./config/site')

// process.traceDeprecation = true

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const isDev = process.env.NODE_ENV == 'development'



function base(opts) {
  opts = opts || {}
  const publicPath = site.assets + opts.name + '/'

  const extractCSS = new ExtractTextPlugin({
    filename: "[name].css",
    disable: isDev,
  });

  var config = {
    entry: {
      index: [
        path.join(__dirname, 'app/views/' + opts.name + '/client.js'),
      ],
    },

    output: {
      path: path.join(__dirname, 'public/assets/'+ opts.name +'/'),
      publicPath,
      filename: "[name].js",
      chunkFilename: "[chunkhash:8].[name].chunk.js",
    },

    devServer: {
      hot: true,
      contentBase: path.join(__dirname, 'public/assets/' + opts.name+'/'),
      noInfo: true,
      publicPath,
      inline: true,
      historyApiFallback: true,
      overlay: {
        warnings: true,
        errors: true
      }
    },


    resolve: {
      modules: [
        path.join(__dirname, 'node_modules'),
      ],
      alias: {
        package: path.join(__dirname, 'package.js'),
        config: path.join(__dirname, 'config'),
        models: path.join(__dirname, 'app/models'),
      },
      extensions: [
        isDev ? '.dev.js' : '.prod.js',
        isDev ? '.dev.jsx' : '.prod.jsx',
        '.js',
        '.jsx',
        '.json',
        '.css',
        '.less',
        '.sass',
        '.scss',
        '.styl'
      ],
    },


    module: {
      rules: [
        {
          test: /\.(scss|sass)$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev,
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
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
                  sourceMap: true,
                  includePaths: [
                    path.join(__dirname, 'node_modules'),
                  ],
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
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev,
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  plugins: function () {
                    return [
                      precss,
                      autoprefixer
                    ];
                  }
                }
              },
              {
                loader: 'stylus-loader',
                options: {
                  sourceMap: true,
                }
              }
            ],
          })
        },
        {
          test: /\.less$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev,
                  sourceMap: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: true,
                  plugins: function () {
                    return [
                      precss,
                      autoprefixer
                    ];
                  }
                }
              },
              {
                loader:'less-loader',
                options: {
                  sourceMap: true,
                }
              }
            ],
          })
        },
        {
          test: /\.css$/,
          use: extractCSS.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  minimize: !isDev,
                  sourceMap: true,
                },
              },
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
          test: /\.(gif|jpg|png|webp|svg)\??.*$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 4096,
                name: 'images/[name].[ext]?[hash:8]',
                publicPath,
                useRelativePath: !isDev,
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
                name: 'fonts/[name].[ext]?[hash:8]',
                publicPath,
                useRelativePath: !isDev,
              }
            }
          ]
        },
      ]
    },


    plugins: [
      extractCSS,
      new webpack.BannerPlugin("Name: "+packageInfo.name+"\nVersion: "+ packageInfo.version +"\nAuthor: "+ packageInfo.author +"\nDescription: "+ packageInfo.description +""),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          version: JSON.stringify(packageInfo.version)
        },
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        __ENV__: JSON.stringify(process.env.NODE_ENV),
        __SERVER__: false,
      }),
      new webpack.ContextReplacementPlugin(/^\.\/locale$/, (context) => {
        if (context.regExp) {
          Object.assign(context, {
            regExp: /^\.\/(zh-cn)/,
          })
        }
      })
    ],

    devtool: isDev ? 'eval-source-map' : 'source-map'

  }
  if (isDev) {
    config.entry.index.unshift('webpack-hot-middleware/client?name=' + opts.name)
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin()
    )
  } else {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings : false,
        },
        comments: false,
        mangle: true,
        minimize: true,
        sourceMap: true,
      })
    )
  }

  return config

}

const ie = merge(base({name: 'ie'}), {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            "es2015",
            "stage-0"
          ],
          plugins: [
            "transform-decorators-legacy",
            "transform-runtime",
          ],
          cacheDirectory: isDev
        },
      },
    ]
  }
})

const react = merge(base({name: 'react'}), {
  module: {
    rules: [
      {
        test: require.resolve('react'),
        loader: 'expose-loader?React',
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'react-hot-loader/webpack',
          },
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
          },
        ],
        exclude: [
          path.resolve(__dirname, "node_modules"),
        ],
      },
    ]
  }
})

if (isDev) {
  react.entry.index.unshift('react-hot-loader/patch')
}



const vue = merge(base({name:'vue'}), {
  resolve: {
    extensions: [
      isDev ? '.dev.vue' : '.prod.vue',
      '.vue',
    ],
  },

  module: {
    rules: [
      {
        test: require.resolve('vue'),
        loader: 'expose-loader?Vue',
      },
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
          cssModules: {
            localIdentName: '[hash:base64:6]',
            camelCase: true
          },

          loaders: {
            js: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    "es2015",
                    "stage-0"
                  ],
                  plugins: [
                    "transform-decorators-legacy",
                    "transform-runtime",
                  ],
                  cacheDirectory: isDev
                }
              }
            ],
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
                options: {
                  sourceMap: true,
                  indentedSyntax: true,
                  includePaths: [
                    path.join(__dirname, 'node_modules'),
                  ],
                }
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
                  sourceMap: true,
                  includePaths: [
                    path.join(__dirname, 'node_modules'),
                  ],
                },
              },
            ]
          }
        }
      },
      {
        test: /\.jsx?$/,
        use: [
          {
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
        ],
        exclude: [
          path.resolve(__dirname, "node_modules"),
        ],
      },
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.VUE_ENV': '"client"'
    }),
  ],
})


module.exports = [
  ie,
  react,
  vue,
]
