'use strict';

// engine module
const engineModule = require('./engine-module');

// translator
const baidu = require('../translator/baidu');
const youdao = require('../translator/youdao');
const caiyun = require('../translator/caiyun');
const papago = require('../translator/papago');
const deepl = require('../translator/deepl');
const google = require('../translator/google');
const gpt = require('../translator/gpt');
const cohere = require('../translator/cohere');
const zhConverter = require('../translator/zh-convert');

// translate
async function translate(text = '', translation = {}, table = []) {
  // clear newline
  text = text.replace(/\r|\n/g, '');

  // check length
  if (text === '') {
    return '……';
  }

  // check target
  if (translation.from === translation.to) {
    return text;
  }

  // translate
  try {
    const result = await translate2(text, translation);
    return zhConvert(clearCode(result, table), translation.to);
  } catch (error) {
    return zhConvert(error, translation.to);
  }

  /*
  // initialize
  const maxCount = 3;
  let count = 0;
  let missingCode = [];
  let result = '';
  let previousResult = '';

  try {
    // clear table
    table = clearTable(text, table);

    // translate process
    do {
      // sleep
      if (count > 0) {
        console.log('Missing Code:', missingCode);
        await engineModule.sleep();
      }

      // add count
      count++;

      // fix code
      text = fixCode(text, missingCode);

      // translate
      result = await translate2(text, translation);

      // check translated text
      if (result === '') {
        if (previousResult === '') {
          result = '翻譯失敗';
        } else {
          result = previousResult;
        }
        break;
      }

      // check table
      missingCode = checkTable(result, table);

      // set previous translated text
      previousResult = result;
    } while (missingCode.length > 0 && count < maxCount);

    return zhConvert(clearCode(result, table), translation.to);
  } catch (error) {
    console.log(error);
    return 'Failed to get translation: ' + error;
  }
  */
}

// translate 2
async function translate2(text = '', translation = {}, table = []) {
  const autoChange = translation.autoChange;
  let engineList = engineModule.getEngineList(translation.engine);
  let result = '';

  do {
    const engine = engineList.shift();
    const option = engineModule.getTranslateOption(engine, translation.from, translation.to, text);
    result = await getTranslation(engine, option, table);
  } while (result === '' && autoChange && engineList.length > 0);

  return result;
}

// get translation
async function getTranslation(engine = '', option = {}, table = []) {
  console.log('Before:', option?.text);

  let result = '';

  try {
    switch (engine) {
      case 'Baidu':
        result = await baidu.exec(option);
        break;

      case 'Youdao':
        result = await youdao.exec(option);
        break;

      case 'Caiyun':
        result = await caiyun.exec(option);
        break;

      case 'Papago':
        result = await papago.exec(option);
        break;

      case 'DeepL':
        result = await deepl.exec(option);
        break;

      case 'GPT':
        result = await gpt.exec(option, table);
        break;

      case 'Cohere':
        result = await cohere.exec(option, table);
        break;

      case 'Google':
        result = await google.exec(option);
        break;

      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }

  console.log('After:', result);

  return result || '';
}

// zh convert
function zhConvert(text = '', languageTo = '') {
  if (text === '') {
    return text;
  }

  if (languageTo === engineModule.languageEnum.zht) {
    return zhConverter.exec({ text: text, tableName: 'zh2Hant' });
  } else if (languageTo === engineModule.languageEnum.zhs) {
    return zhConverter.exec({ text: text, tableName: 'zh2Hans' });
  } else {
    return text;
  }
}

// clear table
function clearTable(text = '', table = []) {
  for (let index = table.length - 1; index >= 0; index--) {
    const code = table[index][0];
    if (!text.includes(code.toUpperCase()) && !text.includes(code.toLowerCase())) {
      table.splice(index, 1);
    }
  }

  return table;
}

// check table
function checkTable(text = '', table = []) {
  let missingCodes = [];

  for (let index = 0; index < table.length; index++) {
    const code = table[index][0];
    if (!text.includes(code.toUpperCase()) && !text.includes(code.toLowerCase())) {
      missingCodes.push(code);
    }
  }

  return missingCodes;
}

// fix code
function fixCode(text = '', missingCode = []) {
  if (missingCode.length > 0) {
    for (let index = 0; index < missingCode.length; index++) {
      const code = missingCode[index][0];
      const codeRegExp = new RegExp(`(${code}+)`, 'gi');
      text = text.replaceAll(codeRegExp, '$1' + code);
    }
  }

  return text;
}

// clear code
function clearCode(text = '', table = []) {
  if (table.length > 0) {
    table.forEach((value) => {
      const code = value[0];
      text = text.replaceAll(new RegExp(`${code}+`, 'gi'), code.toUpperCase());
    });
  }

  return text;
}

// module exports
module.exports = {
  translate,
  getTranslation,
  zhConvert,
};
