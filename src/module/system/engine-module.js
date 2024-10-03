'use strict';

// all language list
const allLanguageList = ['Japanese', 'English', 'Traditional-Chinese', 'Simplified-Chinese', 'Korean', 'Russian', 'Italian'];

// source list
const sourceList = ['Japanese', 'English'];

// target list
const targetList = allLanguageList;

// fix source list
const fixSourceList = ['Japanese', 'English'];

// fix target list
const fixTargetList = ['Traditional-Chinese', 'Simplified-Chinese'];

// ui list
const uiList = ['Traditional-Chinese', 'Simplified-Chinese', 'English'];

// engine list
const engineList = ['#Web-Translator', 'Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL', '#AI-Translator', 'Gemini', 'GPT', 'Cohere', 'Kimi', 'LLM-API'];

// change list
const changeList = ['Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL'];

// AI list
const aiList = ['Gemini', 'GPT', 'Cohere', 'Kimi', 'LLM-API'];

// vision list
const visionList = ['tesseract-ocr', 'google-vision', 'gpt-vision'];

// language enum
const languageEnum = {
  auto: 'Auto',
  ja: 'Japanese',
  en: 'English',
  zht: 'Traditional-Chinese',
  zhs: 'Simplified-Chinese',
};

// language index (text/main)
const languageIndex = {
  Japanese: 0,
  English: 1,
  'Traditional-Chinese': 2,
  'Simplified-Chinese': 3,
  Korean: -1,
  Russian: -1,
  Italian: -1,
};

// LLM table
const llmTable = {
  Auto: 'any languages',
  Japanese: 'Japanese',
  English: 'English',
  Chinese: 'Chinese',
  'Traditional-Chinese': 'Chinese',
  'Simplified-Chinese': 'Chinese',
  Korean: 'Korean',
  Russian: 'Russian',
  Italian: 'Italian',
};

// engine table
const engineTable = {
  Baidu: {
    Auto: 'auto',
    Japanese: 'jp',
    English: 'en',
    Chinese: 'zh',
    'Traditional-Chinese': 'zh',
    'Simplified-Chinese': 'zh',
    Korean: 'kor',
    Russian: 'ru',
    Italian: 'it',
  },
  Caiyun: {
    Auto: 'auto',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh',
    'Traditional-Chinese': 'zh',
    'Simplified-Chinese': 'zh',
    Korean: 'ko',
    Russian: 'ru',
    Italian: 'it',
  },
  Youdao: {
    Auto: 'auto',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh-CHS',
    'Traditional-Chinese': 'zh-CHS',
    'Simplified-Chinese': 'zh-CHS',
    Korean: 'ko',
    Russian: 'ru',
    Italian: 'it',
  },
  Papago: {
    Auto: 'detect',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh-CN',
    'Traditional-Chinese': 'zh-CN',
    'Simplified-Chinese': 'zh-CN',
    Korean: 'ko',
    Russian: 'ru',
    Italian: 'it',
  },
  DeepL: {
    Auto: 'auto',
    Japanese: 'JA',
    English: 'EN',
    Chinese: 'ZH',
    'Traditional-Chinese': 'ZH',
    'Simplified-Chinese': 'ZH',
    Korean: 'KO',
    Russian: 'RU',
    Italian: 'IT',
  },
  Google: {
    Auto: 'auto',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh-CN',
    'Traditional-Chinese': 'zh-CN',
    'Simplified-Chinese': 'zh-CN',
    Korean: 'ko',
    Russian: 'ru',
    Italian: 'it',
  },
  GPT: llmTable,
  Gemini: llmTable,
  Cohere: llmTable,
  Kimi: llmTable,
  'LLM-API': llmTable,
};

// get engine select
function getEngineSelect() {
  return getSelect(engineList);
}

// get all language select
function getAllLanguageSelect() {
  return getSelect(allLanguageList);
}

// get source select
function getSourceSelect() {
  return getSelect(sourceList);
}

// get target select
function getTargetSelect() {
  return getSelect(targetList);
}

// get UI select
function getUISelect() {
  return getSelect(uiList);
}

// get select
function getSelect(list = []) {
  let innerHTML = '';

  for (let index = 0; index < list.length; index++) {
    const name = list[index];
    if (name[0] === '#') {
      innerHTML += `<option value="${name}" disabled></option>`;
    } else {
      innerHTML += `<option value="${name}"></option>`;
    }
  }

  return innerHTML;
}

// get engine list
function getEngineList(engine = changeList[0]) {
  const newEngineList = JSON.parse(JSON.stringify(changeList));
  const index = newEngineList.indexOf(engine);

  if (index >= 0) {
    newEngineList.splice(index, 1);
  }

  return [engine].concat(newEngineList);
}

// get translate option
function getTranslateOption(engine, from, to, text) {
  const table = engineTable[engine];

  if (table) {
    return {
      from: table[from],
      to: table[to],
      text: text,
    };
  } else {
    return null;
  }
}

// get language code
function getLanguageCode(language, engine) {
  const table = engineTable[engine];
  return table[language];
}

// sleep
function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// module exports
module.exports = {
  allLanguageList,
  sourceList,
  targetList,
  fixSourceList,
  fixTargetList,
  uiList,
  engineList,
  changeList,
  aiList,
  visionList,

  languageEnum,
  languageIndex,

  getEngineSelect,
  getAllLanguageSelect,
  getSourceSelect,
  getTargetSelect,
  getUISelect,

  getEngineList,
  getTranslateOption,
  getLanguageCode,
  sleep,
};
