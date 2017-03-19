//  dev  babel
// 开发者 模式 服务器的  babel 配置
module.exports = function (server) {
  var babel = {
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
    // cacheDirectory: process.env.NODE_ENV === "development"
  }
  if (server) {
    babel.plugins.push(
      [
        "transform-require-ignore",
        {
          extensions: [
            ".less",
            ".sass",
            ".scss",
            ".css"
          ]
        }
      ]
    )
  }
  return babel
}
