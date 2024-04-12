'use strict';

function fixEngine(engine = '', defaultEngine = '') {
  engine = engine.toLowerCase();

  if (!['youdao', 'baidu', 'caiyun', 'papago', 'deepl', 'gpt'].includes(engine)) {
    engine = defaultEngine;
  }

  return engine;
}

function fixLanguage(lang = '', defaultlang = '') {
  if (['Japanese', 'English', 'Traditional-Chinese', 'Simplified-Chinese'].includes(lang)) {
    switch (lang) {
      case 'Japanese':
        lang = 'ja';
        break;

      case 'English':
        lang = 'en';
        break;

      case 'Traditional-Chinese':
        lang = 'zh-cht';
        break;

      case 'Simplified-Chinese':
        lang = 'zh-chs';
        break;

      default:
        lang = defaultlang;
        break;
    }
  }

  if (!['ja', 'en', 'zh-cht', 'zh-chs'].includes(lang)) {
    lang = defaultlang;
  }

  return lang;
}

module.exports = {
  fixEngine,
  fixLanguage,
};
