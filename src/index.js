/*
 * @Author: AlphaX Zo
 * @Date: 2023-03-27 21:54:55
 * @LastEditTime: 2023-04-17 00:02:43
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\auto-package-per-router\src\index.js
 * @Description: 按路由个数打包多个看板
 */
const loadEnv = require('./loadEnv');
loadEnv.reload();
const build = require('./functions/build');

module.exports = build;
