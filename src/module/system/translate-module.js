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

// translate LLM
async function translateLLM(name = '', text = '', translation = {}, table = []) {
  const autoChange = translation.autoChange;
  const engineList = [translation.engine, translation.engineAlternate];
  const LLMTable = engineModule.getLLMTable();
  const option = {
    name: name,
    text: text,
    table: table,
    source: LLMTable[translation.from],
    target: LLMTable[translation.to],
  };

  let responseObject = null;
  let isError = false;

  do {
    const engine = engineList.shift();

    console.log('\r\nEngine:', engine);

    if (isError) {
      dialogModule.addNotification(`Change to ${engine}.`);
    }

    try {
      switch (engine) {
        case 'GPT':
          responseObject = await gpt.exec(option);
          break;

        case 'LLM-API':
          responseObject = await openai.exec(option);
          break;

        case 'Cohere':
          responseObject = await cohere.exec(option);
          break;

        case 'Gemini':
          responseObject = await gemini.exec(option);
          break;
        case 'Kimi':
          responseObject = await kimi.exec(option);
          break;

        default:
          break;
      }

      if (responseObject) {
        if (typeof responseObject === 'string') {
          responseObject = JSON.parse(responseObject);
        }

        responseObject.name = removeHonorific(zhConvert(responseObject.name, translation.to), table, 1);
        responseObject.text = removeHonorific(zhConvert(responseObject.text, translation.to), table, 1);
      } else {
        isError = true;
      }
    } catch (error) {
      dialogModule.addNotification(error);
      isError = true;
    }
  } while (isError && autoChange && engineList.length > 0);

  return responseObject;
}

// translate
async function translate(text = '', translation = {}, table = []) {
  let result = '';

  try {
    // clear newline
    text = text.replace(/[\r\n]/g, '');

    // check text
    if (text === '' || translation.from === translation.to) {
      return text;
    }

    // translate
    result = await translate2(text, translation, table);

    // process resutle
    if (engineModule.aiList.includes(translation.engine)) {
      try {
        const result2 = JSON.parse(result).text;
        if (text) {
          result = result2;
        }
      } catch (error) {
        error;
      }

      result = removeHonorific(zhConvert(removeQuote(result), translation.to), table, 1);
      return result;
    } else {
      result = removeHonorific(zhConvert(removeQuote(clearCode(result, table)), translation.to), table, 0);
      return result;
    }
  } catch (error) {
    console.log(error);
    result = '' + error;
  }

  return result;
}

// translate 2
async function translate2(text = '', translation = {}, table = []) {
  const autoChange = translation.autoChange;
  const engineList = engineModule.getEngineList(translation.engine, translation.engineAlternate);
  const result = { isError: false, text: '' };

  do {
    const engine = engineList.shift();
    const option = { ...engineModule.getTranslateOption(text, engine, translation), table };

    console.log('\r\nEngine:', engine);

    if (result.isError) {
      dialogModule.addNotification(`Change to ${engine}.`);
    }

    if (option) {
      const result2 = await getTranslation(engine, option);
      result.isError = result2.isError;
      result.text = result2.text;
    } else {
      continue;
    }
  } while (result.isError && autoChange && engineList.length > 0);

  return result.text;
}

// get translation
async function getTranslation(engine = '', option = {}) {
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

      /*
      case 'Google':
        result = await google.exec(option);
        break;
      */

      default:
        break;
    }
  } catch (error) {
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

function removeQuote(text = '') {
  if (/^「[^「」]+」$/.test(text) || /^"[^"]+"$/.test(text)) {
    text = text.slice(1, text.length - 1);
  }

  return text;
}

// remove honorific
function removeHonorific(text = '', table = [], targetIndex = 0) {
  const honorificArray = ['先生', '小姐'];

  for (let tableIndex = 0; tableIndex < table.length; tableIndex++) {
    const word = table[tableIndex][targetIndex];

    for (let honorificIndex = 0; honorificIndex < honorificArray.length; honorificIndex++) {
      const honorific = honorificArray[honorificIndex];
      const targetWord = word + honorific;
      text = text.replaceAll(targetWord, word);
    }
  }

  return text;
}

// module exports
module.exports = {
  translate,
  translateLLM,
  getTranslation,
  zhConvert,
};
