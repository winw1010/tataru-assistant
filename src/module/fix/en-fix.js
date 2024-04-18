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

// ai engine
const aiEngine = ['GPT', 'Cohere'];

// array
const enArray = enJson.getEnArray();
const chArray = enJson.getChArray();
const userArray = enJson.getUserArray();

/*
fix start
*/

// start
async function start(dialogData = {}) {
  const name = dialogData.name;
  const text = dialogData.text;
  const translation = dialogData.translation;

  let translatedName = '';
  let translatedText = '';
  let audioText = '';

  try {
    // skip check
    if (translation.skip && fixFunction.skipCheck(dialogData, enArray.ignore)) {
      throw '';
    }

    // fix name
    if (translation.skipChinese && enFunction.isChinese(name)) {
      translatedName = fixFunction.replaceText(name, chArray.combine);
    } else {
      if (npcChannel.includes(dialogData.code)) {
        translatedName = await fixName(dialogData);
      } else {
        translatedName = name;
      }
    }

    // fix text
    if (translation.skipChinese && enFunction.isChinese(text)) {
      translatedText = fixFunction.replaceText(text, chArray.combine);
    } else {
      if (aiEngine.includes(translation.engine)) {
        translatedText = await fixTextAI(dialogData);
      } else {
        translatedText = await fixText(dialogData);
      }
    }

    // fix audio text
    if (/(?<=[a-z])[A-Z](?=[a-z\b])/g.test(text)) {
      const audioTextArray = text.split(' ');

      for (let index = 0; index < audioTextArray.length; index++) {
        const word = audioTextArray[index];
        audioTextArray[index] = word[0].toUpperCase + word.slice(1).toLowerCase();
      }

      audioText = audioTextArray.join(' ');
    }
  } catch (error) {
    console.log(error);
    translatedName = '';
    translatedText = error;
  }

  // set text
  dialogData.translatedName = translatedName;
  dialogData.translatedText = translatedText;
  dialogData.audioText = audioText;

  return dialogData;
}

/*
fix name
*/

// fix name
async function fixName(dialogData = {}) {
  const name = dialogData.name;
  const translation = dialogData.translation;

  let translatedName = '';

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

  // code result
  const codeResult = enFunction.replaceTextByCode(name, chArray.combine);

  // skip check
  if (enFunction.needTranslation(codeResult.text, codeResult.table)) {
    // translate
    translatedName = await translateModule.translate(codeResult.text, translation, codeResult.table);
  }

  // table
  translatedName = fixFunction.replaceWord(translatedName, codeResult.table);

  // after translation
  translatedName = fixFunction.replaceText(translatedName, chArray.afterTranslation);

  // save to temp
  saveName(name, translatedName);

  return translatedName;
}

// save name
function saveName(name = '', translatedName = '') {
  if (name === translatedName) {
    return;
  }

  if (name.length < 3) name += '#';

  // add to combine
  chArray.combine.push([name, translatedName]);
  chArray.combine = jsonFunction.sortArray(chArray.combine);

  // add to tempName
  userArray.tempName.push([name, translatedName]);
  jsonFunction.writeUserText('temp-name.json', userArray.tempName);
}

/*
fix text
*/

// fix text
async function fixText(dialogData = {}) {
  const name = dialogData.name;
  const text = dialogData.text;
  const translation = dialogData.translation;

  let text2 = text;
  let translatedText = '';

  if (text === '') {
    return '';
  }

  // force overwrite
  const target = fixFunction.sameAsArrayItem(text, chArray.overwrite);
  if (target) {
    return fixFunction.replaceText(target[1], chArray.combine, true);
  }

  // en1
  text2 = fixFunction.replaceText(text2, enArray.en1, true);

  // special fix
  text2 = specialFix(name, text2);

  // combine
  const codeResult = enFunction.replaceTextByCode(text2, chArray.combine);
  text2 = codeResult.text;

  // en2
  text2 = fixFunction.replaceText(text2, enArray.en2, true);

  // mark fix
  // text2 = fixFunction.markFix(text2);

  // value fix before
  const valueResult = fixFunction.valueFixBefore(text2);
  text2 = valueResult.text;

  // skip check
  if (enFunction.needTranslation(text2, codeResult.table)) {
    // translate
    translatedText = await translateModule.translate(text2, translation, codeResult.table);
  }

  // value fix after
  translatedText = fixFunction.valueFixAfter(translatedText, valueResult.table);

  // mark fix
  // translatedText = fixFunction.markFix(translatedText, true);

  // table
  translatedText = fixFunction.replaceWord(translatedText, codeResult.table);

  // after translation
  translatedText = fixFunction.replaceText(translatedText, chArray.afterTranslation);

  return translatedText;
}

async function fixTextAI(dialogData = {}) {
  const name = dialogData.name;
  const text = dialogData.text;
  const translation = dialogData.translation;

  let text2 = text;
  let translatedText = '';

  if (text === '') {
    return '';
  }

  // special fix
  text2 = specialFix(name, text2);

  // combine
  const codeResult = enFunction.replaceTextByCode(text2, chArray.combine);
  text2 = codeResult.text;

  // skip check
  if (enFunction.needTranslation(text2, codeResult.table)) {
    // translate
    translatedText = await translateModule.translate(text2, translation, codeResult.table);
  }

  // table
  translatedText = fixFunction.replaceText(translatedText, codeResult.table, true);

  // after translation
  translatedText = fixFunction.replaceText(translatedText, chArray.afterTranslation);

  return translatedText;
}

// special fix
function specialFix(name = '', text = '') {
  let loopCount = 0;

  if (name) {
    // do something
  }

  // Clive
  if (/^Clive$/gi.test(name)) {
    text = text
      .replace(/Dominant/gi, 'Dominant#')
      .replace(/Bearer/gi, 'Bearer#')
      .replace(/The Fallen/gi, 'The Fallen#');
  }

  // ApPlE => Apple
  if (/(?<=[a-z])[A-Z](?=[a-z\b])/g.test(text)) {
    let textArray = text.split(' ');
    for (let index = 0; index < textArray.length; index++) {
      const element = textArray[index];
      textArray[index] = element[0].toUpperCase() + element.slice(1).toLowerCase();
    }
    text = textArray.join(' ');
  }

  // A-Apple => Apple
  loopCount = 0;
  while (/(?<=\b)(\w{1,2})-\1/gi.test(text) && loopCount < 10) {
    text = text.replace(/(?<=\b)(\w{1,2})-\1/gi, '$1');
    loopCount++;
  }

  return text;
}

module.exports = {
  start,
};
