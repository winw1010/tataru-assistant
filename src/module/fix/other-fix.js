'use strict';

// function
const jpFunction = require('./jp-function');
const enFunction = require('./en-function');
const fixFunction = require('./fix-function');

// other json
const otherJson = require('./other-json');

// json function
const jsonFunction = require('./json-function');

// engine module
const { languageEnum } = require('../system/engine-module');

// translate module
const translateModule = require('../system/translate-module');

// engine module
const { aiList } = require('../system/engine-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// array
const sourceArray = otherJson.getSourceArray();
const targetArray = otherJson.getTargetArray();
const userArray = otherJson.getUserArray();

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

  try {
    // fix name
    if (npcChannel.includes(dialogData.code)) {
      translatedName = await fixName(dialogData);
    } else {
      translatedName = name;
    }

    // fix text
    if (aiList.includes(translation.engine)) {
      translatedText = await fixTextAI(dialogData);
    } else {
      translatedText = await fixText(dialogData);
    }
  } catch (error) {
    console.log(error);
    translatedName = '';
    translatedText = error;
  }

  // set text
  dialogData.translatedName = translatedName;
  dialogData.translatedText = translatedText;
  dialogData.audioText = text;

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
    fixFunction.sameAsArrayItem(name, targetArray.combine) ||
    fixFunction.sameAsArrayItem(name + '#', targetArray.combine) ||
    fixFunction.sameAsArrayItem(name + '##', targetArray.combine);

  if (target) {
    return target[1];
  }

  // code result
  const codeResult =
    translation.from === languageEnum.ja
      ? jpFunction.replaceTextByCode(name, targetArray.combine)
      : enFunction.replaceTextByCode(name, targetArray.combine);

  if (aiList.includes(translation.engine)) {
    translatedName = await translateModule.translate(name, translation, codeResult.aiTable);
  } else {
    translatedName = await translateModule.translate(codeResult.text, translation, codeResult.table);
    translatedName = fixFunction.replaceWord(translatedName, codeResult.table);
  }

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
  targetArray.combine.push([name, translatedName]);
  targetArray.combine = jsonFunction.sortArray(targetArray.combine);

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
  const target = fixFunction.sameAsArrayItem(text, targetArray.overwrite);
  if (target) {
    return fixFunction.replaceText(target[1], targetArray.combine, true);
  }

  // subtitle
  text2 = fixFunction.replaceText(text2, sourceArray.subtitle, true);

  // special fix
  text2 = specialFix(name, text2);

  // combine
  const codeResult =
    translation.from === languageEnum.ja
      ? jpFunction.replaceTextByCode(text2, targetArray.combine)
      : enFunction.replaceTextByCode(text2, targetArray.combine);
  text2 = codeResult.text;

  // value fix before
  const valueResult = fixFunction.valueFixBefore(text2);
  text2 = valueResult.text;

  // translate
  translatedText = await translateModule.translate(text2, translation, codeResult.table);

  // value fix after
  translatedText = fixFunction.valueFixAfter(translatedText, valueResult.table);

  // table
  translatedText = fixFunction.replaceWord(translatedText, codeResult.table);

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
  const codeResult =
    translation.from === languageEnum.ja
      ? jpFunction.replaceTextByCode(text2, targetArray.combine)
      : enFunction.replaceTextByCode(text2, targetArray.combine);

  // translate
  translatedText = await translateModule.translate(text2, translation, codeResult.aiTable);

  return translatedText;
}

// special fix
function specialFix(name = '', text = '') {
  let loopCount = 0;

  if (name) {
    // do something
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
