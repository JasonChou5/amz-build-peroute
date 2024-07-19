/*
 * @Author: AlphaX Zo * @Date: 2023-03-27 21:56:58
 * @LastEditTime: 2023-04-16 23:59:07
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\auto-package-per-router\src\functions\build.js
 * @Description: 打包相关的脚本
 */
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const fse = require('fs-extra');
const ora = require('ora');
const colors = require('colors');
const inquirer = require('inquirer');
const _ = require('lodash');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');
const reg = require('../common/fileRegExp');
const log = require('../common/logUtils');
const dirPath = require('../common/entryDir');
const handler = require('../io-core/fileHandler');
const fileUtils = require('../io-core/fileUtils');
const fileZip = require('../io-core/fileZip');
const execute = require('./execute');
const utils = require('../utils');

module.exports = {
    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-28 16:14:23
     * @LastEditTime: Do not edit
     * @Description: 解析router
     * @return {*}
     */
    routeAnalytic() {
        const pathBase = dirPath.router;
        const matchFiles = handler.getMatchPath(pathBase, '/**/*.js');
        const ignoreFiles = handler.getReservePath(pathBase, '/index.js');
        const routers = globby.sync([...matchFiles, ...ignoreFiles]);
        const routeCollecter = [];
        _.map(routers, route => {
            const content = fs.readFileSync(route, 'utf8');
            const ast = parser.parse(content, {
                sourceType: 'unambiguous',
            });

            traverse(ast, {
                ObjectExpression(path) {
                    let routeItem = { icon: '', component: '' };
                    if (types.isObjectExpression(path.node)) {
                        _.forEach(path.node.properties, node => {
                            if (types.isStringLiteral(node.value)) {
                                routeItem[node.key.name] = node.value.value;
                            }
                            if (types.isArrowFunctionExpression(node.value)) {
                                const comps = node.value.body.arguments[0];
                                const comp = comps.elements[0];
                                if (types.isStringLiteral(comp)) routeItem.component = comp.value;
                                // comps = comps.elements.map(item => {
                                //     if (types.isStringLiteral(item)) return item.value;
                                //     return '';
                                // });

                                // routeItem.component = _.compact(comps);
                            }
                            if (types.isCallExpression(node.value)) {
                                let icon = node.value.arguments[0];
                                if (types.isStringLiteral(icon)) routeItem.icon = icon.value;
                            }
                        });

                        path.skip(); // 跳过子节点
                    }
                    routeCollecter.push(routeItem);
                    log.succeed('Obtain Router Information', routeItem.title);
                },
            });

            log.succeed('Obtain Router All Information', route);
        });

        log.succeed('Router Analytic', pathBase);

        const { DEV_PER_ROUTE_PACKAGE } = utils.getConfig();
        const needPacked = DEV_PER_ROUTE_PACKAGE;

        if (!_.isArray(needPacked) || (_.isArray(needPacked) && !needPacked.length)) return [];

        if (needPacked[0] === '*') return routeCollecter;

        // return _.compact(needPacked.map(item => _.find(routeCollecter, { name: item }, null)));// 保证按配置的路由顺序打包
        return routeCollecter.filter(item => needPacked.includes(item.name));
    },
    buildRoutePreExcute(buildRoute, recovery = false) {
        // TODO: 此处修改router入口页
        const routeEntry = path.join(dirPath.router, '/index.js');
        const content = fs.readFileSync(routeEntry, 'utf8');
        const ast = parser.parse(content, {
            sourceType: 'unambiguous',
        });

        traverse(ast, {
            IfStatement(path) {
                if (types.isIfStatement(path.node)) {
                    const alternate = path.get('alternate');
                    const consequent = path.get('consequent');
                    const key = 'redirect';
                    const value = `'${buildRoute.path}'`;
                    consequent.traverse({
                        ObjectExpression(path) {
                            const exsit = path.node.properties.filter(
                                node => types.isObjectProperty(node) && node.key.name === key
                            );
                            if (exsit.length && !recovery) {
                                exsit[0].value.value = value;
                                exsit[0].value.extra.raw = value;
                                exsit[0].value.extra.rawValue = value;
                                path.stop();
                                return;
                            }
                            path.traverse({
                                ObjectProperty(path) {
                                    if (recovery && path.node.key.name === key) {
                                        path.remove();
                                        path.stop();
                                        return;
                                    }

                                    if (!recovery && path.node.key.name === 'path') {
                                        let cloneNode = types.cloneNode(path.node);
                                        if (cloneNode) {
                                            cloneNode.key.name = key;
                                            cloneNode.key.loc.identifierName = key;
                                            cloneNode.value.name = value;
                                            cloneNode.value.loc.identifierName = value;
                                            cloneNode.value.identifierName = value;
                                            path.insertAfter(cloneNode);
                                            path.stop();
                                        }
                                    }
                                },
                            });
                        },
                    });

                    alternate.traverse({
                        ObjectExpression(path) {
                            const exsit = path.node.properties.filter(
                                node => types.isObjectProperty(node) && node.key.name === key
                            );
                            if (exsit.length && !recovery) {
                                exsit[0].value.value = value;
                                exsit[0].value.extra.raw = value;
                                exsit[0].value.extra.rawValue = value;
                                path.stop();
                                return;
                            }
                            path.traverse({
                                ObjectProperty(path) {
                                    if (recovery && path.node.key.name === key) {
                                        path.remove();
                                        path.stop();
                                        return;
                                    }

                                    if (!recovery && path.node.key.name === 'component') {
                                        let cloneNode = types.cloneNode(path.node);
                                        if (cloneNode) {
                                            cloneNode.key.name = key;
                                            cloneNode.key.loc.identifierName = key;
                                            cloneNode.value.name = value;
                                            cloneNode.value.loc.identifierName = value;
                                            cloneNode.value.identifierName = value;
                                            path.insertAfter(cloneNode);
                                            path.stop();
                                        }
                                    }
                                },
                            });
                        },
                    });
                }
            },
        });

        const { code } = generate(ast);

        fs.writeFileSync(routeEntry, code, 'utf8');
        fileUtils.fsPrettierFormat(routeEntry);
        log.succeed('Update Router Entry File', routeEntry);
    },
    updateDeployConfig(hostApi, hostFile, dir = '.packaged') {
        const pathBase = path.join(process.cwd(), dir);
        handler.updateFileSync(pathBase, '/**/IPConfig.js', '', (fileContent, _, fileName) => {
            fileContent = fileContent.replace(
                reg.RegProjEnvDynamic('CONFIG_IP', 'g'),
                `$1'${hostApi}'`
            );
            fileContent = fileContent.replace(
                reg.RegProjEnvDynamic('CONFIG_FILE', 'g'),
                `$1'${hostFile || hostApi}/Attachment'`
            );
            const commonConfigPath = path.join(pathBase, '/IPConfig.js');
            if (!fs.existsSync(commonConfigPath)) {
                fse.writeFileSync(commonConfigPath, fileContent);
                log.succeed('A Common Deploy Configure File Added', commonConfigPath);
            }

            log.succeed('Update Deploy Configure', fileName);

            return fileContent;
        });
    },
    moveFileToPackage(fromDir, route, nameType, pointer) {
        const mapType = {
            2: 'name',
            3: 'title',
        };

        let title = nameType === 1 ? pointer : route[mapType[nameType]];
        if (!title) {
            const tmpPath = route.path.split('/');
            title = tmpPath[tmpPath.length - 1];
        }

        const toDir = `/.packaged/${title}`;

        fse.moveSync(path.join(process.cwd(), fromDir), path.join(process.cwd(), toDir));
    },
    excCommandAll(params, callback) {
        const routes = this.routeAnalytic();
        let pointer = 0;
        let logs = [];

        log.warned(`=============== Build Multi Route Mode Start ===============`, '', '');
        if (!routes.length) {
            log.failed(
                `=============== There Is No Matched Router To Build ===============`,
                '',
                ''
            );
            return;
        }

        handler.setEnv('.env.tmp', { MULTIPLY_DEPLOY_MORE: 0 }).then(res => {
            fse.emptyDirSync(path.join(process.cwd(), '/.packaged'));
            this.buildRoutePreExcute(routes[0]);
            this.excCommand('npm:build', routes, pointer, logs, params, callback);
        });
    },
    /**
     * @Author: AlphaX Zo
     * @Date: 2023-03-28 16:14:57
     * @LastEditTime: Do not edit
     * @Description: 执行单个命令
     * @return {*}
     */
    excCommand(command, routes, pointer, logs = [], params, callback) {
        const { envDeploy, nameType, zip = true } = params;
        const currentRoute = routes[pointer];
        const cacheEnv = '.env.tmp';
        const spinner = ora(colors.green(`${currentRoute.title} Building...`)).start();
        spinner.color = 'green';
        if (pointer === routes.length - 1) {
            handler.setEnv(cacheEnv, {
                MULTIPLY_DEPLOY_MORE: 0,
                ROUTE_PACKAGE_NAME: `''`,
            });
        } else {
            handler.setEnv(cacheEnv, {
                MULTIPLY_DEPLOY_MORE: 1,
                ROUTE_PACKAGE_NAME: `'${currentRoute.title}'`,
            });
        }

        const logTxt = `${currentRoute.path}->${currentRoute.title}`;
        logs.push(logTxt);
        log.message(`Build Multi By Route Start`, logTxt, '', '');

        const result = execute.exec(command);

        result.then(
            (...e) => {
                spinner.succeed(colors.green(`${currentRoute.title} Packaged Successfully`));
                spinner.stop();
                log.succeed(`Build Multi By Route`, logTxt, 'Success', '');
                if (pointer < routes.length - 1) {
                    pointer += 1;
                    this.buildRoutePreExcute(routes[pointer]);
                    this.moveFileToPackage('/dist', currentRoute, nameType, pointer);
                    this.excCommand('node build/build.js', routes, pointer, logs, params, callback);
                    return;
                }
                spinner.stop();
                this.moveFileToPackage('/dist', currentRoute, nameType, pointer);
                this.buildRoutePreExcute(routes[routes.length - 1], true);
                log.succeed(`Build Multi By Route All`, logs, 'Success', '');
                log.warned(`=============== Build Multi Route Mode End ===============`, '', '');
                log.message(
                    `=============== Update The Deploy Config Start ===============`,
                    '',
                    ''
                );
                // TODO: 此处处理打包后的配置（比如apiconfig）
                this.updateDeployConfig(envDeploy.toString());
                log.message(`=============== Update The Deploy Config End ===============`, '', '');
                // TODO: 此处进行zip打包
                log.message(`Package The Deploy Code...`, '', '');
                if (zip) {
                    const rootPath = path.join(process.cwd(), '.packaged');
                    const ignores = [];
                    fileZip.zipDirectory(
                        rootPath,
                        ignores,
                        { outputPath: rootPath },
                        { gitignore: false }
                    );
                }
                if (typeof callback == 'function') callback();
            },
            (...e) => {
                log.failed(`Build Multi By Route`, logs, 'Failed', '', e);
                process.exit(1);
            }
        );
    },
    async buildSingle() {
        const spinner = ora(colors.green(`Single Building...`)).start();
        spinner.color = 'green';
        await execute.execSync('npm:build');
        spinner.succeed(colors.green(`Single Packaged Successfully`));
    },
    buildMultiple(zip, callback) {
        const QS = [
            {
                name: 'envDeploy',
                type: 'rawlist',
                message: colors.magenta(`即将按路由个数打包发布(产生多个子包)，请选择发布环境：\n`),
                default: 0,
                choices: [
                    {
                        name: `测试/${process.env.DEV_JOINT_TEST_ENV_HOST}`,
                        value: process.env.DEV_JOINT_TEST_ENV_HOST,
                    },
                    {
                        name: `生产/${process.env.DEV_JOINT_PROD_ENV_HOST}`,
                        value: process.env.DEV_JOINT_PROD_ENV_HOST,
                    },
                    {
                        name: `UAT/${process.env.DEV_JOINT_UAT_ENV_HOST}`,
                        value: process.env.DEV_JOINT_UAT_ENV_HOST,
                    },
                    {
                        name: '退出/',
                        value: '',
                    },
                ],
            },
        ];

        (async () => {
            const { envDeploy } = await inquirer.prompt(QS);
            if (!envDeploy) process.exit(1);
            const packageNameTypeQS = [
                {
                    name: 'packageNameType',
                    type: 'rawlist',
                    message: colors.magenta(`请选择子包命名类型：\n`),
                    default: 0,
                    choices: [
                        {
                            name: '数字/1',
                            value: 1,
                        },
                        {
                            name: '英文/2',
                            value: 2,
                        },
                        {
                            name: '中文/3',
                            value: 3,
                        },
                        {
                            name: '退出/4',
                            value: 4,
                        },
                    ],
                },
            ];

            const { packageNameType } = await inquirer.prompt(packageNameTypeQS);
            if (packageNameType === 4) process.exit(1);

            const params = {
                nameType: packageNameType,
                envDeploy,
                zip,
            };

            try {
                this.excCommandAll(params, () => {
                    if (typeof callback === 'function') callback();
                    log.succeed('Pack By Number Of Routes');
                });
            } catch (e) {
                log.failed('Pack By Number Of Routes', '', 'Failed', '', e);
                process.exit();
            }
        })();
    },
};
