/*
 * @Author: AlphaX Zo
 * @Date: 2023-03-06 22:42:25
 * @LastEditTime: 2023-04-16 23:57:20
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\auto-package-per-router\src\io-core\fileUtils.js
 * @Description: node 脚本工具
 */
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const log = require('../common/logUtils');
const utils = require('../utils');

module.exports = {
    getPath(filePath) {
        return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    },
    fsEditSync(filePath, callback) {
        const tmpPath = this.getPath(filePath);
        // 读取文件
        const data = fs.readFileSync(tmpPath, 'utf8');
        if (typeof callback === 'function') {
            const content = callback(data.toString('utf8'));
            if (!content) {
                log.failed('File Write', tmpPath, 'Failed', 'File Content Should Not Be Empty');
                return;
            }
            // 写入文件
            fs.writeFileSync(tmpPath, content, { encoding: 'utf8' });
            log.succeed('File Edit', tmpPath);

            this.fsPrettierFormat(tmpPath);
        }
    },
    fsPrettierFormat(formatPath, relativePath = '') {
        const prettierPath = path.join(process.cwd(), '/node_modules/prettier/bin-prettier.js');
        exec(`node ${prettierPath}  --write ${formatPath}`);
        log.succeed('Format', path.relative(relativePath, formatPath));
    },
    fsGetVersionTime() {
        const packageJsonPath = path.join(process.cwd(), 'package.json');

        const packageJson = require(packageJsonPath);
        const version = packageJson.version;

        return `v${version}_${utils.formatDate('yyyy-MM-dd_hhmmss', Date.now())}`;
    },
};
