/*
 * @Author: AlphaX Zo
 * @Date: 2023-04-06 22:15:55
 * @LastEditTime: 2023-04-16 23:40:56
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\auto-package-per-router\src\functions\execute.js
 * @Description: 重启当前进程
 */
const concurrently = require('concurrently');
const log = require('../common/logUtils');

module.exports = {
    exec(command, options = {}) {
        command = Array.isArray(command) ? command : [command];
        const { result } = concurrently(command, {
            prefix: '{time}-{pid}',
            timestampFormat: 'HH:mm:ss',
            killOthers: ['failure', 'success'],
            restartTries: 3,
            cwd: process.cwd(),
            ...options,
        });

        return result;
    },
    async execSync(command, options, succeed, failed) {
        command = Array.isArray(command) ? command : [command];
        const { result } = concurrently(command, {
            prefix: '{time}-{pid}',
            timestampFormat: 'HH:mm:ss',
            killOthers: ['failure', 'success'],
            restartTries: 3,
            cwd: process.cwd(),
            ...options,
        });

        await result.then(
            (...e) => {
                if (typeof succeed === 'function') succeed(e);
            },
            (...e) => {
                if (typeof failed === 'function') failed(e);
            }
        );
    },
    reboot(timer) {
        const ticker = setTimeout(() => {
            const devMode = process.env.MOCK_MODE || 0;

            const devModes = {
                0: 'npm:start',
                1: 'npm:dev:mock',
                2: 'dev:mock:third',
            };

            this.exec(devModes[devMode]).then(
                () => {
                    log.succeed('Reboot');
                },
                e => {
                    log.failed('Reboot');
                    process.exit(e);
                }
            );

            if (ticker) clearTimeout(ticker);
        }, timer);
    },
};
