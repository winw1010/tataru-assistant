'use strict';

// function
const enFunction = require('./en-function');
const fixFunction = require('./fix-function');

// en json
const enJson = require('./en-json');

// json function
const jsonFunction = require('./json-function');

// translate module
const translateModule = require('../system/translate-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// array
let enArray = enJson.getEnArray();
let chArray = enJson.getChArray();

async function startFix(dialogData = {}) {
  try {
    // get translation
    const translation = dialogData.translation;

    // skip check
    if (translation.skip && fixFunction.skipCheck(dialogData, enArray.ignore)) {
      throw '';
    }

    // name translation
    let translatedName = '';
    if (enFunction.isChinese(dialogData.name, translation)) {
      translatedName = fixFunction.replaceText(dialogData.name, chArray.combine, true);
    } else {
      if (npcChannel.includes(dialogData.code)) {
        if (translation.fix) {
          translatedName = await nameFix(dialogData.name, translation);
        } else {
          translatedName = await translateModule.translate(dialogData.name, translation);
        }
      } else {
        translatedName = dialogData.name;
      }
    }

    if (dialogData.name !== '') {
      // sleep 1 second
      await fixFunction.sleep();
    }

    // text translation
    let translatedText = '';
    if (enFunction.isChinese(dialogData.text, translation)) {
      translatedText = fixFunction.replaceText(dialogData.text, chArray.combine, true);
    } else {
      if (translation.fix) {
        if (translation.engine === 'GPT') {
          translatedText = await textFixGPT(dialogData.name, dialogData.text, translation);
        } else {
          translatedText = await textFix(dialogData.name, dialogData.text, translation);
        }
      } else {
        translatedText = await translateModule.translate(dialogData.text, translation);
      }
    }

    // set translated text
    dialogData.translatedName = translatedName;
    dialogData.translatedText = translatedText;
  } catch (error) {
    console.log(error);

    // set translated text
    dialogData.translatedName = 'Error';
    dialogData.translatedText = error;
  }

  return dialogData;
}

async function nameFix(name = '', translation = {}) {
  if (name === '') {
    return '';
  }

  // same check
  const target =
    fixFunction.sameAsArrayItem(name, chArray.combine) ||
    fixFunction.sameAsArrayItem(name + '#', chArray.combine) ||
    fixFunction.sameAsArrayItem(name + '##', chArray.combine);

  if (target) {
    return target[1];
  }

  // code
  const codeResult = enFunction.replaceTextByCode(name, chArray.combine);

  // translate name
  let translatedName = '';
  translatedName = codeResult.text;

  // skip check
  if (!enFunction.canSkipTranslation(translatedName, codeResult.table)) {
    // translate
    translatedName = await translateModule.translate(translatedName, translation, codeResult.table);
  }

  // table
  translatedName = fixFunction.replaceText(translatedName, codeResult.table);

  // save to temp
  saveName(name, translatedName);

  return translatedName;
}

async function textFix(name = '', text = '', translation = {}) {
  if (text === '') {
    return '';
  }

  // force overwrite
  const target = fixFunction.sameAsArrayItem(text, chArray.overwrite);
  if (target) {
    return fixFunction.replaceText(target[1], chArray.combine, true);
  }

  // en1
  text = fixFunction.replaceText(text, enArray.en1, true);

  // special fix
  text = specialFix(name, text);

  // combine
  const codeResult = enFunction.replaceTextByCode(text, chArray.combine);
  text = codeResult.text;

  // en2
  text = fixFunction.replaceText(text, enArray.en2, true);

  // mark fix
  text = fixFunction.markFix(text);

  // value fix before
  const valueResult = fixFunction.valueFixBefore(text);
  text = valueResult.text;

  // skip check
  if (!enFunction.canSkipTranslation(text, codeResult.table)) {
    // translate
    text = await translateModule.translate(text, translation, codeResult.table);
  }

  // value fix after
  text = fixFunction.valueFixAfter(text, valueResult.table);

  // mark fix
  text = fixFunction.markFix(text, true);

  // after translation
  text = fixFunction.replaceText(text, chArray.afterTranslation);

  // table
  text = fixFunction.replaceWord(text, codeResult.table);

  return text;
}

async function textFixGPT(name = '', text = '', translation = {}) {
  if (text === '') {
    return '';
  }

  // special fix
  text = specialFix(name, text);

  // combine
  const codeResult = enFunction.replaceTextByCode(text, chArray.combine);
  text = codeResult.text;

  // skip check
  if (!enFunction.canSkipTranslation(text, codeResult.table)) {
    // translate
    text = await translateModule.translate(text, translation, codeResult.table);
  }

  // after translation
  text = fixFunction.replaceText(text, chArray.afterTranslation);

  // table
  text = fixFunction.replaceWord(text, codeResult.table);

  return text;
}

// save name
function saveName(name = '', translatedName = '') {
  if (name === translatedName) {
    return;
  }

  chArray.chTemp = jsonFunction.readTemp('chTemp.json', false);

  if (name.length < 5) {
    chArray.chTemp.push([name + '#', translatedName, 'temp']);
  } else {
    chArray.chTemp.push([name, translatedName, 'temp']);
  }

  // set combine
  chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

  // write
  jsonFunction.writeTemp('chTemp.json', chArray.chTemp);
}

// special fix
function specialFix(name = '', text = '') {
  let loopCount = 0;

  if (name) {
    // do something
  }

  // A-Apple
  while (/(?<=\b)(\w{1,2})-\1/gi.test(text) && loopCount < 10) {
    text = text.replace(/(?<=\b)(\w{1,2})-\1/gi, '$1');
    loopCount++;
  }

  return text;
}

// module exports
module.exports = {
  startFix,
};
