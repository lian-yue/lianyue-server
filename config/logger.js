"use strict";
const log4js = require("log4js");
const path = require("path");
log4js.configure({
  appenders: [
    { type: "console" }, //控制台输出
    {
      type: "file",     //文件输出
      filename: path.join(__dirname, "../../logs/server/access."+ process.pid +".log"),
      maxLogSize: 1024 * 1024 * 10,
      backups: 32,
      category: "normal"
    }
  ],
  // replaceConsole: true,
});

const logger = log4js.getLogger("normal");
logger.setLevel("DEBUG");

module.exports = logger
