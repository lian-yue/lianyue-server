//  dev  babel
// 开发者 模式 服务器的  babel 配置
module.exports = {
  "presets": [
    "es2015",
    "react",
    "stage-0"
  ],
  "plugins": [
    "transform-runtime",
    "add-module-exports",
    [
      "transform-require-ignore",
      {
        "extensions": [
          ".less",
          ".sass",
          ".scss",
          ".css"
        ]
      }
    ]
  ]
}
