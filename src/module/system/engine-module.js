'use strict';

/* Search Temp
('Japanese')|('English')|('Traditional-Chinese')|('Simplified-Chinese')

('Youdao')|('Baidu')|('Caiyun')|('Papago')|('DeepL')|('GPT')|(Google)

('Japanese')|('English')|('Traditional-Chinese')|('Simplified-Chinese')|('Youdao')|('Baidu')|('Caiyun')|('Papago')|('DeepL')|('GPT')|('Google')

(Japanese)|(English)|(Traditional-Chinese)|(Simplified-Chinese)|(Youdao)|(Baidu)|(Caiyun)|(Papago)|(DeepL)|(GPT)|(Google)
*/

// https://help.ads.microsoft.com/#apex/18/zh-CHT/10004/-1

// all list
const allLanguageList = ['ja', 'en', 'zh-cht', 'zh-chs'];

// source list
const sourceList = ['ja', 'en'];

// target list
const targetList = ['zh-cht', 'zh-chs'];

// ui list
const uiList = ['en', 'zh-cht', 'zh-chs'];

// engine list
const engineList = ['youdao', 'baidu', 'caiyun', 'papago', 'deepl', 'gpt'];

// language enum
const languageEnum = {
  auto: 'auto',
  ja: 'ja',
  en: 'en',
  zht: 'zh-cht',
  zhs: 'zh-chs',
};

// language index (text/main)
const languageIndex = {
  ja: 0,
  en: 1,
  'zh-cht': 2,
  'zh-chs': 3,
};

// language name
const languageName = {
  ja: '日文',
  en: '英文',
  German: '德文',
  French: '法文',
  'zh-cht': '繁體中文',
  'zh-chs': '簡體中文',
};

// engine name
const engineName = {
  youdao: '有道翻譯',
  baidu: '百度翻譯',
  caiyun: '彩雲小譯',
  papago: 'Papago',
  deepl: 'DeepL',
  gpt: 'ChatGPT',
};

// engine table
const engineTable = {
  baidu: {
    auto: 'auto',
    ja: 'jp',
    en: 'en',
    'zh-cht': 'zh',
    'zh-chs': 'zh',
  },
  caiyun: {
    auto: 'auto',
    ja: 'ja',
    en: 'en',
    'zh-cht': 'zh',
    'zh-chs': 'zh',
  },
  youdao: {
    auto: 'auto',
    ja: 'ja',
    en: 'en',
    'zh-cht': 'zh-CHS',
    'zh-chs': 'zh-CHS',
  },
  tencent: {
    auto: 'auto',
    ja: 'jp',
    en: 'en',
    'zh-cht': 'zh',
    'zh-chs': 'zh',
  },
  papago: {
    auto: 'detect',
    ja: 'ja',
    en: 'en',
    'zh-cht': 'zh-CN',
    'zh-chs': 'zh-CN',
  },
  deepl: {
    auto: 'auto',
    ja: 'JA',
    en: 'EN',
    'zh-cht': 'ZH',
    'zh-chs': 'ZH',
  },
  google: {
    auto: 'auto',
    ja: 'ja',
    en: 'en',
    'zh-cht': 'zh-CN',
    'zh-chs': 'zh-CN',
  },
  gpt: {
    auto: 'any languages',
    ja: 'Japanese',
    en: 'English',
    'zh-cht': 'Chinese',
    'zh-chs': 'Chinese',
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
function getEngineList(engine = 'youdao') {
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
