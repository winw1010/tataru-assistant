'use strict';

// dialog module
const dialogModule = require('./dialog-module');

// engine module
const engineModule = require('./engine-module');

// translator
const baidu = require('../translator/baidu');
const youdao = require('../translator/youdao');
const caiyun = require('../translator/caiyun');
const papago = require('../translator/papago');
const deepl = require('../translator/deepl');
//const google = require('../translator/google');
const gpt = require('../translator/gpt');
const openai = require('../translator/openai');
const cohere = require('../translator/cohere');
const gemini = require('../translator/gemini');
const kimi = require('../translator/kimi');
const zhConverter = require('../translator/zh-convert');

// translate
async function translate(text = '', translation = {}, table = [], type = 'sentence') {
  let result = '';

  try {
    // clear newline
    text = text.replace(/[\r\n]/g, '');

    // check text
    if (text === '' || translation.from === translation.to) {
      return text;
    }

    // translate
    result = await translate2(text, translation, type);

    // zh convert
    return zhConvert(clearCode(result, table), translation.to);
  } catch (error) {
    console.log(error);
    result = '' + error;
  }

  return result;
}

// translate 2
async function translate2(text = '', translation = {}, type = 'sentence') {
  const autoChange = translation.autoChange;
  let engineList = engineModule.getEngineList(translation.engine);
  let result = { isError: false, text: '' };
  let engine = ''
  
  // If engineSecond is not in engineList, it indicates that it is an AI-based translator. In that case, add engineSecond to the list. 
  // Even if engineSecond causes an error due to misconfiguration, it will not affect the normal operation of the program.
  if (engineList.indexOf(translation.engineSecond) < 0 && translation.engineSecond != 'Auto') {
    engineList.push(translation.engineSecond)
  }

  do {
    // When result.isError is true and translation.engineSecond is not 'Auto' 
    // we also need to check whether the remaining contents of engineList include engineSecond.
    if (result.isError && translation.engineSecond != 'Auto' && engineList.indexOf(translation.engineSecond) > 0) {
      engine = translation.engineSecond
      engineList.splice(engineList.indexOf(translation.engineSecond), 1)
    } else {
      engine = engineList.shift();
    }
    const option = engineModule.getTranslateOption(engine, translation.from, translation.to, text);

    console.log('\r\nEngine:', engine);

    if (result.isError) {
      dialogModule.addNotification(`Change to ${engine}.`);
    }

    if (option) {
      result = await getTranslation(engine, option, type);
    } else {
      continue;
    }
  } while (result.isError && autoChange && engineList.length > 0);

  return result.text;
}

// get translation
async function getTranslation(engine = '', option = {}, type = 'sentence') {
  console.log('Before:', option?.text);

  let isError = false;
  let text = '';

  try {
    switch (engine) {
      case 'Baidu':
        text = await baidu.exec(option);
        break;

      case 'Youdao':
        text = await youdao.exec(option);
        break;

      case 'Caiyun':
        text = await caiyun.exec(option);
        break;

      case 'Papago':
        text = await papago.exec(option);
        break;

      case 'DeepL':
        text = await deepl.exec(option);
        break;

      case 'GPT':
        text = await gpt.exec(option, type);
        break;

      case 'LLM-API':
        text = await openai.exec(option, type);
        break;

      case 'Cohere':
        text = await cohere.exec(option, type);
        break;

      case 'Gemini':
        text = await gemini.exec(option, type);
        break;
      case 'Kimi':
        text = await kimi.exec(option, type);
        break;

      /*
      case 'Google':
        result = await google.exec(option);
        break;
      */

      default:
        break;
    }
  } catch (error) {
    console.log(error);
    dialogModule.addNotification(error);
    text = '';
    isError = true;
  }

  console.log('After:', text);

  return {
    isError,
    text,
  };
}

// zh convert
function zhConvert(text = '', languageTo = '') {
  if (languageTo === engineModule.languageEnum.zht) {
    text = zhConverter.exec({ text: text, tableName: 'zh2Hant' });
  } else if (languageTo === engineModule.languageEnum.zhs) {
    text = zhConverter.exec({ text: text, tableName: 'zh2Hans' });
  }

  return text;
}

// clear code
function clearCode(text = '', table = []) {
  let halfText = '';
  for (let index = 0; index < text.length; index++) {
    const ch = text[index];
    halfText += fullToHalf(ch);
  }
  text = halfText;

  if (table.length > 0) {
    table.forEach((value) => {
      const code = value[0];
      text = text.replaceAll(new RegExp(`${code}+`, 'gi'), code.toUpperCase());
    });
  }

  return text;
}

function fullToHalf(str = '') {
  // full-width English letters: [\uff21-\uff3a\uff41-\uff5a]
  // full-width characters: [\uff01-\uff5e]
  return str
    .replace(/[\uff21-\uff3a\uff41-\uff5a]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    })
    .replace(/\u3000/g, ' ');
}

// module exports
module.exports = {
  translate,
  getTranslation,
  zhConvert,
};
