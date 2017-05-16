# 基于 Koa2 React Vuejs 的单用户 SSR 同构博客

# 技能栈

Koa2
Vuejs
React  
SPA  
SSR
同构  
MVVM 服务端+客户端端 都是  
View 高度 和 服务端分离 可以新增视图使用 Vuejs  移除 React  
Mongodb  
pm2  


# 安装
```
git@github.com:lian-yue/lianyue-server.git
npm run build
npm run start
```

## 管理员密码
打开 目录文件下的 `/config/admin.js` 修改密码保存 然后执行命令 `npm run restart`
打开浏览器 http://localhost:3000/admin 登陆到管理员 然后出现 管理员 导航

## 配置配置信息
```
/config/site.js     # 基本信息
/config/storage.js  # 文件储存路径 和 url
/config/mongodb.js  # 数据库信息
```



# 储存web端口需要安装
https://github.com/lian-yue/lianyue-storage

# 开发测试

```
npm run dev
```

## 目录解说
```
/app 应用程序目录
/config 各种配置文件
/webpack.config.build.js   webpack 发布版 配置文件
/webpack.config.server.js    webpack 服务端 配置文件
/webpack.config.client.js    webpack 客户端 配置文件
```

### app 目录结构
```
/app/index.js  程序入口
/app/models  模块
/app/viewModels  视图模块 服务器的 路由
/app/views  视图
```
