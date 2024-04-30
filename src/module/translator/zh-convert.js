'use strict';

// zh tables
const zhTables = require('./zh-convert-table');

// zh exception
const zhException = ['当当'];

// exec
function exec(option = { text: '', tableName: 'zh2Hant' }) {
  return replaceText(option.text, zhTables[option.tableName]);
}

// replace text
function replaceText(text = '', zhTable = []) {
  if (typeof text === 'string') {
    for (let index = 0; index < zhTable.length; index++) {
      const table = zhTable[index];
      if (!zhException.includes(table[0])) {
        text = text.replaceAll(table[0], table[1]);
      }
    }
  }

  return text;
}

// module exports
module.exports = { exec };
