'use strict';

// all list
const allLanguageList = ['Japanese', 'English', 'Traditional-Chinese', 'Simplified-Chinese'];

// source list
const sourceList = ['Japanese', 'English'];

// target list
const targetList = ['Traditional-Chinese', 'Simplified-Chinese'];

// ui list
const uiList = ['English', 'Traditional-Chinese', 'Simplified-Chinese'];

// engine list
const engineList = ['Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL', 'GPT'];

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
};

// language name
const languageName = {
  Japanese: '日文',
  English: '英文',
  German: '德文',
  French: '法文',
  'Traditional-Chinese': '繁體中文',
  'Simplified-Chinese': '簡體中文',
};

// engine name
const engineName = {
  Youdao: '有道翻譯',
  Baidu: '百度翻譯',
  Caiyun: '彩雲小譯',
  Papago: 'Papago',
  DeepL: 'DeepL',
  GPT: 'ChatGPT',
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
  },
  Caiyun: {
    Auto: 'auto',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh',
    'Traditional-Chinese': 'zh',
    'Simplified-Chinese': 'zh',
  },
  Youdao: {
    Auto: 'auto',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh-CHS',
    'Traditional-Chinese': 'zh-CHS',
    'Simplified-Chinese': 'zh-CHS',
  },
  Tencent: {
    Auto: 'auto',
    Japanese: 'jp',
    English: 'en',
    Chinese: 'zh',
    'Traditional-Chinese': 'zh',
    'Simplified-Chinese': 'zh',
  },
  Papago: {
    Auto: 'detect',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh-CN',
    'Traditional-Chinese': 'zh-CN',
    'Simplified-Chinese': 'zh-CN',
  },
  DeepL: {
    Auto: 'auto',
    Japanese: 'JA',
    English: 'EN',
    Chinese: 'ZH',
    'Traditional-Chinese': 'ZH',
    'Simplified-Chinese': 'ZH',
  },
  Google: {
    Auto: 'auto',
    Japanese: 'ja',
    English: 'en',
    Chinese: 'zh-CN',
    'Traditional-Chinese': 'zh-CN',
    'Simplified-Chinese': 'zh-CN',
  },
  GPT: {
    Auto: 'any languages',
    Japanese: 'Japanese',
    English: 'English',
    Chinese: 'Chinese',
    'Traditional-Chinese': 'Chinese',
    'Simplified-Chinese': 'Chinese',
  },
};

// get engine select
function getEngineSelect() {
  return getSelect(engineList, engineName);
}

// get all language select
function getAllLanguageSelect() {
  return getSelect(allLanguageList, languageName);
}

// get source select
function getSourceSelect() {
  return getSelect(sourceList, languageName);
}

// get target select
function getTargetSelect() {
  return getSelect(targetList, languageName);
}

// get UI select
function getUISelect() {
  return getSelect(uiList, engineName);
}

// get select
function getSelect(list = [], names = {}) {
  let innerHTML = '';

  for (let index = 0; index < list.length; index++) {
    const name = list[index];
    innerHTML += `<option value="${name}">${names[name]}</option>`;
  }

  return innerHTML;
}

// get engine list
function getEngineList(engine = 'Youdao') {
  const engineIndex = engineList.indexOf(engine);

  let newEngineList = JSON.parse(JSON.stringify(engineList));
  newEngineList.splice(engineIndex, 1);

  return [engine].concat(newEngineList);
}

// get translate option
function getTranslateOption(engine, from, to, text) {
  const table = engineTable[engine];

  return {
    from: table[from],
    to: table[to],
    text: text,
  };
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
  uiList,
  engineList,

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
