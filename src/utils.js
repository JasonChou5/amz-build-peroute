/*
 * @Author: AlphaX Zo
 * @Date: 2023-03-22 20:28:28
 * @LastEditTime: 2023-04-08 17:49:01
 * @LastEditors: Do not edit
 * @FilePath: \WeBoard\scripts\utils.js
 * @Description: 工具函数（CommonJs风格）
 */
// const fs = require('fs');
const path = require('path');

module.exports = {
    capitalize(input) {
        return input.charAt(0).toUpperCase() + input.slice(1);
    },

    hyphenToHump(input) {
        return `${input}`.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());
    },

    hyphenToBigHump(input) {
        const hump = this.hyphenToHump(input);

        return this.capitalize(hump);
    },

    humpToHyphen(input) {
        return `${this.capitalize(input)}`
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .slice(1);
    },

    execAll(content, regex) {
        let matched;
        let totalMatched = [];
        while ((matched = regex.exec(content)) != null) {
            totalMatched.push(matched);
        }

        return totalMatched;
    },
    /**
     * @Author: AlphaX Zo
     * @Date: 2022-04-21 13:55:53
     * @LastEditTime: Do not edit
     * @Description: 通用日期格式化
     * 形如：YYYY-MM-DD hh:mm:ss,YYYY/MM/DD hh:mm:ss等
     * @param {String} fmt --> 日期的字符串格式
     * @param {String|Number} val --> 标准的日期值
     * @return {String} --> 格式化后的日期值
     */
    formatDate(fmt, val) {
        if (!val) return null;
        //author: meizz
        const date = new Date(val);
        const o = {
            'M+': date.getMonth() + 1, //月份
            'd+': date.getDate(), //日
            'h+': date.getHours(), //小时
            'm+': date.getMinutes(), //分
            's+': date.getSeconds(), //秒
            'q+': Math.floor((date.getMonth() + 3) / 3), //季度
            S: date.getMilliseconds(), //毫秒
        };

        if (/(y+)/i.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substring(4 - RegExp.$1.length));
        const flag = key => (!['M+', 'm+'].includes(key) ? 'i' : ''); // 除了月份和分钟，其他不区分大小写
        for (let k in o)
            if (new RegExp('(' + k + ')', flag(k)).test(fmt))
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substring(('' + o[k]).length)
                );

        return fmt;
    },

    execGet(cmd) {
        return require('child_process')
            .execSync(cmd)
            .toString()
            .trim();
    },

    getConfig() {
        return require(path.join(process.cwd(), '/.config'));
    },
};
