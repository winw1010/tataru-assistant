'use strict';

// json function
const jsonFunction = require('./json-function');

// language table
const { languageEnum, languageIndex, fixTargetList } = require('../system/engine-module');

// ch array
const chArray = {};

// en array
const enArray = {};

// user array
const userArray = {};

// load
function load(targetLanguage) {
  const srcIndex = languageIndex[languageEnum.en];
  const rplIndex = languageIndex[targetLanguage];
  const isChinese = fixTargetList.includes(targetLanguage);

  // user array
  jsonFunction.readUserArray(userArray);

  // ch
  chArray.overwrite = [];
  chArray.afterTranslation = [];

  // en
  enArray.subtitle = jsonFunction.combineArray2(userArray.customSource, jsonFunction.readSubtitleEN());
  enArray.ignore = jsonFunction.readText(jsonFunction.getTextPath('en', 'ignore.json'));
  enArray.en1 = jsonFunction.readText(jsonFunction.getTextPath('en', 'en1.json'));
  enArray.en2 = jsonFunction.readText(jsonFunction.getTextPath('en', 'en2.json'));
  enArray.uncountable = jsonFunction.readText(jsonFunction.getTextPath('en', 'uncountable.json'));

  // main
  chArray.main = [];

  // non AI
  chArray.nonAI = [];

  // chinese
  if (isChinese) {
    const ch = targetLanguage === languageEnum.zht ? 'cht' : 'chs';

    // ch
    chArray.overwrite = jsonFunction.readOverwriteEN(rplIndex - 1);
    chArray.afterTranslation = jsonFunction.readText(jsonFunction.getTextPath('ch', `after-translation-${ch}.json`));

    // main
    chArray.main = jsonFunction.readMain(srcIndex, rplIndex);

    // non AI
    chArray.nonAI = jsonFunction.readNonAI(srcIndex, rplIndex);
  }

  // overwrite
  chArray.overwrite = jsonFunction.combineArray2(userArray.customOverwrite, chArray.overwrite);

  // combine
  chArray.combine = jsonFunction.combineArray2(userArray.playerName, userArray.customTarget, chArray.main, userArray.tempNameValid);

  // clear temp name
  jsonFunction.clearTempName(jsonFunction.combineArray2(userArray.customTarget, chArray.main), userArray.tempName);

  // version fix
  if (isChinese) versionFix();
}

// version fix
function versionFix() {
  // clear combine
  for (let index = chArray.combine.length - 1; index >= 0; index--) {
    const element0 = chArray.combine[index][0];
    const element1 = chArray.combine[index][1];

    // 1 character words
    if (/(^.$)/.test(element0)) {
      console.log('Illegal single word:', chArray.combine[index]);
      chArray.combine.splice(index, 1);
    }
    // blank word
    else if (element0 === '' || element1 === '') {
      //console.log('blank word:', chArray.combine[index]);
      chArray.combine.splice(index, 1);
    }
    // error message
    else if (/error/gi.test(element0)) {
      chArray.combine.splice(index, 1);
    }
    // wrong AI translation (ex: Sorry Message)
    else if (/sorry/gi.test(element0)) {
      chArray.combine.splice(index, 1);
    }
  }

  // update temp name
  // jsonFunction.writeUserText('temp-name.json', userArray.tempName);
}

// get ch array
function getChArray() {
  return chArray;
}

// get en array
function getEnArray() {
  return enArray;
}

// get user array
function getUserArray() {
  return userArray;
}

// module exports
module.exports = {
  load,
  getChArray,
  getEnArray,
  getUserArray,
};
