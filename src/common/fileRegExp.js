/*
 * @Author: AlphaX Zo
 * @Date: 2023-03-21 23:46:37
 * @LastEditTime: 2023-03-29 14:14:15
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\scripts\io-core\fileRegExp.js
 * @Description: Vue组件文件分析正则
 */
module.exports = {
    // 公共
    RegCh: /^[\u4E00-\u9FA5]+$/, // 中文
    RegEn: /^[a-zA-Z]+[-\s]?[a-zA-Z]+$/, // 英文
    RegDoubleSlashComment: /\s*\/\/\s*[\u4E00-\u9FA5]+\s*/gi, // 双斜杠注释

    // 环境变量.env
    RegProjEnv: /(([A-Z]+[A-Z_]+[A-Z]+)\s*?(?==)\s*?=\s*)(['"]?.+['"]?)/g,
    RegProjEnvDynamic: (match = '[A-Z]+[A-Z_]+[A-Z]+', opt = 'g') =>
        new RegExp(`((${match})\\s*?(?==)\\s*?=\\s*)(['"]?.+['"]?)`, opt),
    // RegProjEnv: /(([A-Z]+[A-Z_]+[A-Z]+)\s*?(?==)\s*?=\s*)(['"]?[\w@&\*\^#$~%\?\s\\_\-:\/\/\.<>\[\]\(\){}\u4E00-\u9FA5]+['"]?)/g,
    // RegProjEnvDynamic: (match = '[A-Z]+[A-Z_]+[A-Z]+', opt = 'g') =>
    //     new RegExp(`((${match})\\s*?(?==)\\s*?=\\s*)(['"]?[\\w@&\\*\\^#$~%\\?\\s\\\_\\-:\\/\\/\\.<>\\[\\]\\(\\){}\u4E00-\u9FA5]+['"]?)`, opt),

    // 路由或目录
    RegRouteInclude: /\.?\/?[\w\/]*(\/\w)\/.*?/,
    RegRouteIncludeDynamic: (match = '\\w', opt) =>
        new RegExp(`\\.?\\/?[\\w\\/]*(\\/${match})\\/.*?`, opt),
    RegRouteInclude: /\.?\/?[\w\/]*(\/\w)\/.*?/,
    RegRouteIncludeDynamic: (match = '\\w', opt) =>
        new RegExp(`\\.?\\/?[\\w\\/]*(\\/${match})\\/.*?`, opt),
    RegRouteVueInclude: /(['"]@.+[^'"])(\/\w)(\/[a-zA-Z]\w*\.vue['"])/,
    RegRouteVueIncludeDynamic: (match = '\\w', opt = 'ig') =>
        new RegExp(`(['"]@.+[^'"])(\\/${match})(\\/[a-zA-Z]\\w*\.vue['"])`, opt),
    RegRouteImgInclude: /(['"]@.+[^'"])(\/\w)(\/.+\.(png|jeg|jpeg)['"])/,
    RegRouteImgIncludeDynamic: (match = '\\w', opt = 'ig') =>
        new RegExp(`(['"]@.+[^'"])(\\/${match})(\\/.+\\.(png|jeg|jpeg)['"])`, opt),

    // template部分
    RegCompUsed: /<(\w+[-\w]*\w+)\s*/gi, // Vue组件中模板使用的组件
    RegEchartImported: /import\s+?([A-Z]+\w+)\s+?from\s+?['"]@.*?chart.+?[^'"]\/([A-Z]+\w+)["'];?\s*/gi, // Vue组件中模板使用的组件
    RegEchartImportedDynamic: (match = '[A-Z]+\\w+', opt = 'ig') =>
        new RegExp(
            `import\\s+?(${match})\\s+?from\\s+?['"]@.*?chart.+?[^'"]\\/([A-Z]+\\w+)["'];?\\s*`,
            opt
        ), // Vue组件中模板使用的组件(动态)
    RegVueComp: /(components:\s*{)([\s\S]*?[^{}])(},)/i, // Vue组件中components注入组件的部分
    RegCompInject: /([a-zA-Z\w]+\s*,\s*)|(['"][a-z]+[-\w]+['"]\s*:\s*[a-zA-Z\w]+\s*,\s*)|([a-zA-Z\w]+\s*\s*:\s*[a-zA-Z\w]+\s*,\s*)/gi, // Vue组件中通过components注入的组件
    RegCompInjectDynamic: (match = '[a-zA-Z\\w]+', opt = 'ig') =>
        new RegExp(
            `(${match}\\s*,\\s*)|(['"][a-z]+[-\\w]+['"]\\s*:\\s*${match}\\s*,\\s*)|([a-zA-Z\\w]+\\s*\\s*:\\s*${match}\\s*,\\s*)`,
            opt
        ), // Vue组件中通过components注入的组件(动态匹配)
    // script部分

    // style部分
};
