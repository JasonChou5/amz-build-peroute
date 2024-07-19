/*
 * @Author: AlphaX Zo
 * @Date: 2023-03-21 23:50:46
 * @LastEditTime: 2023-04-16 23:50:37
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\auto-package-per-router\src\io-core\fileHandler.js
 * @Description: 文件处理类
 */
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const _ = require('lodash');
const fsUtils = require('./fileUtils');
const utils = require('../utils');
const reg = require('../common/fileRegExp');
const log = require('../common/logUtils');

module.exports = {
    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-27 23:40:59
     * @LastEditTime: Do not edit
     * @Description: 通过globby解析ignore path，可以利用globby的pattern模式匹配
     * @param {*} pathBase
     * @param {*} globParttern
     * @return {*}
     */
    getGlobRealPath(pathBase, globParttern) {
        if (!globParttern) return [];
        const paths = _.isString(globParttern) ? [globParttern] : globParttern;
        return globby.sync(paths.map(item => path.join(pathBase, item).replace(/\\/g, '/')));
    },

    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-27 23:43:52
     * @LastEditTime: Do not edit
     * @Description: 操作（删除，编辑等）中需要保留的文件，给到globby的pattern
     * @param {*} pathBase
     * @param {*} reservePath
     * @return {*}
     */
    getReservePath(pathBase, reservePath) {
        if (!reservePath) return [];
        const paths = _.isString(reservePath) ? [reservePath] : reservePath;
        return paths.map(item => `!${path.join(pathBase, item).replace(/\\/g, '/')}`);
    },

    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-27 23:44:26
     * @LastEditTime: Do not edit
     * @Description: 操作的全量对象路径，给到globby的pattern
     * @param {*} pathBase
     * @param {*} matchPath
     * @return {*}
     */
    getMatchPath(pathBase, matchPath) {
        if (!matchPath) return [pathBase];
        const paths = _.isString(matchPath) ? [matchPath] : matchPath;
        return paths.map(item => `${path.join(pathBase, item).replace(/\\/g, '/')}`);
    },

    filterFiles(files, ignores = []) {
        if (!_.isArray(ignores) || !ignores.length) return files;
        return files.filter(file => !ignores.some(ig => file.includes(ig)));
    },

    updateFileSync(pathBase, update, ignore, callback) {
        const updateFiles = this.getMatchPath(pathBase, update);
        const ignoreFiles = this.getGlobRealPath(pathBase, ignore);

        const files = globby.sync([...updateFiles], {});
        const updateNeedFiles = this.filterFiles(files, ignoreFiles);

        updateNeedFiles.forEach(fileName => {
            fsUtils.fsEditSync(fileName, fileContent => {
                if (typeof callback === 'function') {
                    const conte = callback(fileContent, updateNeedFiles, fileName);
                    log.succeed('File Update', fileName);
                    return conte;
                }

                return fileContent;
            });
        });
    },

    setEnv(envFile = '.env', envCodeVals, callback, pathRoot = process.cwd()) {
        return new Promise((resolve, reject) => {
            const envPath = path.join(pathRoot, envFile).replace(/\\/g, '/');
            try {
                let conte = '';
                fsUtils.fsEditSync(envPath, (fileContent, totalFiles) => {
                    conte = fileContent;
                    _.forEach(envCodeVals, (envVal, envCode) => {
                        conte = conte.replace(reg.RegProjEnvDynamic(envCode, 'g'), `$1${envVal}`);
                    });

                    typeof callback === 'function' && callback(conte, totalFiles);

                    return conte;
                });
                resolve({ result: true, envPath, conte });
                log.succeed('Update Env File', envPath);
            } catch (e) {
                log.failed('Update Env File', envPath);
                reject({ result: false, e });
            }
        });
    },

    getEnv(envFile = '.env', envCode, callback, pathRoot = process.cwd()) {
        return new Promise((resolve, reject) => {
            const envPath = path.join(pathRoot, envFile).replace(/\\/g, '/');
            try {
                // 读取文件
                const data = fs.readFileSync(envPath, 'utf8');
                const content = data.toString('utf8');
                const res = this.execAllFilter(
                    content,
                    reg.RegProjEnv,
                    item => item.indexOf('=') === -1
                );
                let output = {};
                res.map(item => (output[item[0]] = item[1]));
                output = envCode ? output[envCode] : output;
                typeof callback === 'function' && callback(output, envPath, content);

                resolve(output);
                log.succeed('Get Env File', envPath);
            } catch (e) {
                log.failed('Get Env File', envPath);
                reject(e);
            }
        });
    },

    execAllFilter(fileContent, regex, match) {
        let total = utils.execAll(fileContent, regex);
        return total.map(items => {
            return _.chain(items)
                .filter(item => (typeof match === 'function' ? match(item) : true))
                .compact()
                .value();
        });
    },

    getPathSplitDeep(paths, split, deep) {
        const tmpPaths = _.isString(paths) ? [paths] : paths;
        return tmpPaths
            .map(pathItem => pathItem.split(split))
            .filter(item => _.compact(item[1].split('/')).length > deep)
            .map(pathArr => pathArr.join(split));
    },
    prettierFormat(formatPath, relativePath = '') {
        const prettierPath = path.join(process.cwd(), '/node_modules/prettier/bin-prettier.js');
        exec(`node ${prettierPath}  --write ${formatPath}`);
        log.succeed('Format', path.relative(relativePath, formatPath));
    },
};
