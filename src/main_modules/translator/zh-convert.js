'use strict';

// package module
const packageModule = require('../package-module');

// zh tables
const zhTables = packageModule.zhConvertTable;

// exec
function exec(option = { text: '', tableName: 'zh2Hant' }) {
    return replaceText(option.text, zhTables[option.tableName]);
}

// replace text
function replaceText(text = '', zhTable = []) {
    for (let index = 0; index < zhTable.length; index++) {
        text = text.replaceAll(zhTable[index][0], zhTable[index][1]);
    }

    return text;
}

// module exports
module.exports = { exec };
