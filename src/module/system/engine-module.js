'use strict';

// all list
const allLanguageList = ['Japanese', 'English', 'Traditional-Chinese', 'Simplified-Chinese'];

// source list
const sourceList = ['Japanese', 'English'];

// target list
const targetList = ['Traditional-Chinese', 'Simplified-Chinese'];

// fix source list
const fixSourceList = ['Japanese', 'English'];

// fix target list
const fixTargetList = ['Traditional-Chinese', 'Simplified-Chinese'];

// ui list
const uiList = ['Traditional-Chinese', 'Simplified-Chinese'];

// engine list
const engineList = ['#Normal', 'Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL', '#LLM', 'GPT', 'Cohere', 'Gemini'];

// AI list
const aiList = ['GPT', 'Cohere', 'Gemini'];

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
  Cohere: {
    Auto: 'any languages',
    Japanese: 'Japanese',
    English: 'English',
    Chinese: 'Chinese',
    'Traditional-Chinese': 'Chinese',
    'Simplified-Chinese': 'Chinese',
  },
  Gemini: {
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
      innerHTML += `<option value="${name}" disabled>${name}</option>`;
    } else {
      innerHTML += `<option value="${name}"></option>`;
    }
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
  fixSourceList,
  fixTargetList,
  uiList,
  engineList,
  aiList,

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
