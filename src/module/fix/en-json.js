'use strict';

// json function
const jsonFunction = require('./json-function');

// language table
const { languageEnum, languageIndex } = require('../system/engine-module');

// ch array
let chArray = {};

// en array
let enArray = {};

// load
function load(targetLanguage) {
  const srcIndex = languageIndex[languageEnum.en];
  const rplIndex = languageIndex[targetLanguage];
  const ch = targetLanguage === languageEnum.zht ? 'cht' : 'chs';

  // temp
  chArray.chTemp = jsonFunction.readTemp('chTemp.json', false);
  chArray.overwriteTemp = jsonFunction.readTemp('overwriteTemp.json', false);
  chArray.player = jsonFunction.readTemp('player.json');

  // ch
  chArray.overwrite = jsonFunction.readOverwriteEN(rplIndex - 1);
  chArray.afterTranslation = jsonFunction.readText(
    jsonFunction.getTextPath('ch', `after-translation-${ch}.json`)
  );

  // en
  enArray.subtitle = jsonFunction.readSubtitleEN();
  enArray.ignore = jsonFunction.readText(
    jsonFunction.getTextPath('en', 'ignore.json')
  );
  enArray.en1 = jsonFunction.readText(
    jsonFunction.getTextPath('en', 'en1.json')
  );
  enArray.en2 = jsonFunction.readText(
    jsonFunction.getTextPath('en', 'en2.json')
  );
  enArray.uncountable = jsonFunction.readText(
    jsonFunction.getTextPath('en', 'uncountable.json')
  );

  // main
  chArray.main = jsonFunction.readMain(srcIndex, rplIndex);

  // overwrite
  chArray.overwrite = jsonFunction.combineArrayWithTemp(
    chArray.overwriteTemp,
    chArray.overwrite
  );

  // combine
  chArray.combine = jsonFunction.combineArrayWithTemp(
    chArray.chTemp,
    chArray.player,
    chArray.main
  );

  // version fix
  versionFix();
}

// version fix
function versionFix() {
  // combine
  // Allies
  for (let index = chArray.combine.length - 1; index >= 0; index--) {
    const element = chArray.combine[index][0];
    if (/^Allies$/gi.test(element)) {
      chArray.combine.splice(index, 1);
    }
  }
}

// get ch array
function getChArray() {
  return chArray;
}

// get en array
function getEnArray() {
  return enArray;
}

// module exports
module.exports = {
  load,
  getChArray,
  getEnArray,
};
