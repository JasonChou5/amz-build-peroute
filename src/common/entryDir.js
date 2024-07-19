/*
 * @Author: AlphaX Zo
 * @Date: 2023-03-24 20:16:10
 * @LastEditTime: 2023-04-10 10:15:51
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\scripts\common\entryDir.js
 * @Description: 项目处理目录
 */
const path = require('path');

module.exports = {
    entry: path.join(process.cwd(), '/src').replace(/\\/g, '/'), // 入口
    router: path.join(process.cwd(), '/src/router').replace(/\\/g, '/'), // 第一步要处理的
    views: path.join(process.cwd(), '/src/views').replace(/\\/g, '/'), // 第二步要处理的
    echarts: path.join(process.cwd(), '/src/components/echart-packaged').replace(/\\/g, '/'), // 第三步要处理的
    mocks: path.join(process.cwd(), '/mock/api/modules').replace(/\\/g, '/'), // 第四步要处理的
    images: path.join(process.cwd(), '/src/assets/images/board-cards').replace(/\\/g, '/'), // 第五步要处理的
    comps: path.join(process.cwd(), '/src/components').replace(/\\/g, '/'),
    app: path.join(process.cwd(), '/src/App.vue').replace(/\\/g, '/'),
    package: path.join(process.cwd(), '/package.json').replace(/\\/g, '/'),
    scripts: path.join(process.cwd(), '/scripts').replace(/\\/g, '/'),
    tools: path.join(process.cwd(), '/src/tools').replace(/\\/g, '/'),
};
