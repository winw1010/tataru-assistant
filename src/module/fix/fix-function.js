'use strict';

// reg symbols
const regRegSymbol = /[.*+?^${}()|[\]\\]/g;

// unnecessary title
const unnecessaryTitle = [
  '先生',
  '小姐',
  '同學',
  '同事',
  '班級',
  '班別',
  '班',
  '組別',
  '小組',
  '組',
  '公司',
  '地區',
  '地',
  '處',
  '區域',
  '區',
  '點',
  '號',
  '國家',
  '國',
  '',
];

// skip check
function skipCheck(dialogData, ignoreArray = []) {
  return ['0039', '0839'].includes(dialogData.code) && canIgnore(dialogData.text, ignoreArray);
}

// can ignore
function canIgnore(text = '', ignoreArray = []) {
  if (text === '' || !Array.isArray(ignoreArray) || !ignoreArray.length > 0) {
    return false;
  }

  for (let index = 0; index < ignoreArray.length; index++) {
    const element = ignoreArray[index];
    const regIgnore = new RegExp(element, 'gi');
    if (regIgnore.test(text)) {
      return true;
    }
  }

  return false;
}

// replace text
function replaceText(text = '', array = [], useRegExp = false) {
  const srcIndex = 0;
  const rplIndex = 1;

  if (text === '' || !Array.isArray(array) || !array.length > 0) {
    return text;
  }

  if (useRegExp) {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      const element0 = removeRegSymbol(element[0]);
      const name0 = new RegExp(element0, 'gi');
      const name1 = element[1];
      text = text.replaceAll(name0, name1);
    }
  } else {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      text = text.replaceAll(element[srcIndex], element[rplIndex]);
    }
  }

  return text;
}

// replace word
function replaceWord(text = '', table = []) {
  if (text === '' || !Array.isArray(table) || !table.length > 0) {
    return text;
  }

  const tableCode = table.map((x) => x[0]);
  let target = text.match(/[A-Z]+/gi)?.sort((a, b) => b.length - a.length) || [];
  let wordTable = [];

  for (let index = 0; index < target.length; index++) {
    let code = `*@${index}*`;
    text = text.replace(target[index], code);
    wordTable.push([code, target[index]]);
  }

  console.log('replaceWord before:', text);

  for (let index = 0; index < wordTable.length; index++) {
    const element = wordTable[index];
    let word = element[1];

    if (codeTest(word, tableCode)) {
      word = replaceText(word, table);
    } else if (/[a-z]/.test(word)) {
      word = word[0].toUpperCase() + word.slice(1).toLowerCase();
    }

    for (let index = 0; index < unnecessaryTitle.length; index++) {
      const title = unnecessaryTitle[index];
      text = text.replace(element[0] + title, word);
    }
  }

  console.log('replaceWord after:', text);

  return text;
}

// code test
function codeTest(text = '' /*, code = []*/) {
  /*
  if (text === '') return false;

  // remove table code from text
  for (let index = 0; index < code.length; index++) {
    text = text.replaceAll(code[index], '');
  }

  // remove Roman numeral and HQ from text
  text = text.replace(/[IVXLCDMHQ]/gi, '');
  */

  text = text.replace(/[BCFGJLMNPRSTVWXYZ]/gi, ''); // Replace code
  text = text.replace(/[IVXLCDM]/gi, ''); // Roman numeral
  text = text.replace(/[HQ]/gi, ''); // HQ
  text = text.replace(/[A-Z]/g, ''); // Uppercase

  return !/[A-Z]/i.test(text);
}

// includes array item
function includesArrayItem(text = '', array = [], searchIndex = 0, useRegex = false) {
  // search array
  let searchArray = array;

  // target
  let target = null;

  if (text === '' || !Array.isArray(array) || !array.length > 0) {
    return target;
  }

  // 2d check
  if (Array.isArray(array[0])) {
    searchArray = array.map((value) => value[searchIndex]);
  }

  // match
  let temp = [];

  if (useRegex) {
    for (let index = 0; index < searchArray.length; index++) {
      const element = removeRegSymbol(searchArray[index]);
      if (new RegExp(element, 'gi').test(text)) {
        text = text.replaceAll(element, '');
        temp.push(array[index]);
      }
    }
  } else {
    for (let index = 0; index < searchArray.length; index++) {
      const element = searchArray[index];
      if (text.includes(element)) {
        text = text.replaceAll(element, '');
        temp.push(array[index]);
      }
    }
  }

  target = temp.length > 0 ? temp : null;

  return target;
}

// same as array item
function sameAsArrayItem(text = '', array = [], searchIndex = 0) {
  // search array
  let searchArray = array;

  // target
  let target = null;

  if (text === '' || !Array.isArray(array) || !array.length > 0) {
    return target;
  }

  // 2d check
  if (Array.isArray(array[0])) {
    searchArray = array.map((value) => value[searchIndex]);
  }

  // match
  for (let index = 0; index < searchArray.length; index++) {
    const element = removeRegSymbol(searchArray[index]);

    if (new RegExp('^' + element + '$', 'gi').test(text)) {
      target = array[index];
      break;
    }
  }

  return target;
}

// mark fix
function markFix(text = '', isTranslated = false) {
  // remove （） and its content
  text = text.replaceAll(/（.*?）/gi, '');

  // remove () and its content
  text = text.replaceAll(/\(.*?\)/gi, '');

  if (isTranslated) {
    // fix 「「
    if (text.includes('「') && !text.includes('」')) {
      text = text.replaceAll(/「(.+?)「/gi, '「$1」');
    }

    // fix 」」
    if (text.includes('」') && !text.includes('「')) {
      text = text.replaceAll(/」(.+?)」/gi, '「$1」');
    }

    // fix ""
    // text = text.replaceAll(/"(.+?)"/gi, '「$1」');

    // fix .
    // text = text.replaceAll(/([^.0-9])\.([^.0-9])/gi, '$1・$2');

    // ["(?<=[^-,.\\w]|^)0(?=[^-,.\\w/%]|$)", "零"]
  }

  return text;
}

// mark fix
function removeMark(text = '') {
  // remove （） and its content
  text = text.replaceAll(/（.*?）/gi, '');

  // remove () and its content
  text = text.replaceAll(/\(.*?\)/gi, '');

  return text;
}

// value fix before
function valueFixBefore(text = '') {
  const valueList = text.match(/\d+((,\d{3})+)?(\.\d+)?/gi);
  let valueTable = [];

  if (valueList) {
    for (let index = 0; index < valueList.length; index++) {
      const value = valueList[index];
      if (value.includes(',')) {
        const tempValue = value.replaceAll(',', '');
        text = text.replaceAll(value, tempValue);
        valueTable.push([tempValue, value]);
      }
    }
  }

  return {
    text: text,
    table: valueTable.sort((a, b) => b[0].length - a[0].length),
  };
}

// value fix after
function valueFixAfter(text = '', valueTable = []) {
  for (let index = 0; index < valueTable.length; index++) {
    const element = valueTable[index];
    text = text.replaceAll(element[0], element[1]);
  }

  return text;
}

// remove reg symbol
function removeRegSymbol(text = '') {
  return text.replace(regRegSymbol, '\\$&');
}

// sleep
function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  skipCheck,
  replaceText,
  replaceWord,
  includesArrayItem,
  sameAsArrayItem,
  markFix,
  removeMark,
  valueFixBefore,
  valueFixAfter,
  removeRegSymbol,
  sleep,
};
