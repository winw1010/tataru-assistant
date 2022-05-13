'use strict';

const engineList = ['Baidu', 'Caiyun', 'Youdao', 'Google'];

const languageTable = {
    auto: 'Auto',
    ja: 'Japanese',
    en: 'English',
    zht: 'Traditional-Chinese',
    zhs: 'Simplified-Chinese'
}

const languageIndex = {
    'Japanese': 0,
    'English': 1,
    'Traditional-Chinese': 2,
    'Simplified-Chinese': 3
}

const baiduTable = {
    'Auto': 'auto',
    'Japanese': 'jp',
    'English': 'en',
    'Traditional-Chinese': 'zh',
    'Simplified-Chinese': 'zh'
}

const caiyunTable = {
    'Auto': 'auto',
    'Japanese': 'ja',
    'English': 'en',
    'Traditional-Chinese': 'zh',
    'Simplified-Chinese': 'zh'
}

const youdaoTable = {
    'Auto': 'auto',
    'Japanese': 'ja',
    'English': 'en',
    'Traditional-Chinese': 'zh',
    'Simplified-Chinese': 'zh'
}

const papagoTable = {
    'Auto': 'detect',
    'Japanese': 'ja',
    'English': 'en',
    'Traditional-Chinese': 'zh-CN',
    'Simplified-Chinese': 'zh-CN'
}

const googleTable = {
    'Auto': 'auto',
    'Japanese': 'ja',
    'English': 'en',
    'Traditional-Chinese': 'zh-TW',
    'Simplified-Chinese': 'zh-CN'
}

function getTableValue(language, table) {
    const languageReg = new RegExp(language, 'gi');
    const propertyNames = Object.getOwnPropertyNames(table);

    for (let index = 0; index < propertyNames.length; index++) {
        const propertyName = propertyNames[index];
        if (propertyName.match(languageReg)) {
            return table[propertyName];
        }
    }

    return null;
}

console.log();

exports.engineList = engineList;
exports.languageTable = languageTable;
exports.languageIndex = languageIndex;
exports.baiduTable = baiduTable;
exports.caiyunTable = caiyunTable;
exports.youdaoTable = youdaoTable;
exports.papagoTable = papagoTable;
exports.googleTable = googleTable;
exports.getTableValue = getTableValue;