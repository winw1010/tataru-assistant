'use strict';

// json function
const jsonFunction = require('./json-function');

// language table
const { languageEnum, languageIndex } = require('../system/engine-module');

// ch array
const chArray = {};

// jp array
const jpArray = {};

// user array
const userArray = {};

// load
function load(targetLanguage) {
  const srcIndex = languageIndex[languageEnum.ja];
  const rplIndex = languageIndex[targetLanguage];
  const ch = targetLanguage === languageEnum.zht ? 'cht' : 'chs';

  // user array
  jsonFunction.readUserArray(userArray);

  // ch
  chArray.overwrite = jsonFunction.readOverwriteJP(rplIndex - 1);
  chArray.afterTranslation = jsonFunction.readText(jsonFunction.getTextPath('ch', `after-translation-${ch}.json`));
  chArray.chName = jsonFunction.readText(
    jsonFunction.getTextPath('ch', 'jp-ch-name.json'),
    true,
    true,
    srcIndex,
    rplIndex - 1
  );

  // jp
  jpArray.subtitle = jsonFunction.combineArray2(userArray.customSource, jsonFunction.readSubtitleJP());
  jpArray.ignore = jsonFunction.readText(jsonFunction.getTextPath('jp', 'ignore.json'));
  jpArray.jp1 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'jp1.json'));
  jpArray.jp2 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'jp2.json'));
  jpArray.listCrystalium = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listCrystalium.json'));
  jpArray.listDelete = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listDelete.json'));
  jpArray.listHira = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listHira.json'));
  jpArray.listReverse = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listReverse.json'));
  jpArray.special1 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'special1.json'));
  jpArray.special2 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'special2.json'));
  jpArray.title = jsonFunction.readText(jsonFunction.getTextPath('jp', 'title.json'));

  // main
  chArray.main = jsonFunction.readMain(srcIndex, rplIndex);

  // overwrite
  chArray.overwrite = jsonFunction.combineArray2(userArray.customOverwrite, chArray.overwrite);

  // combine
  chArray.combine = jsonFunction.combineArray2(chArray.main, userArray.tempName);
  chArray.combine = jsonFunction.combineArray2(userArray.customTarget, chArray.combine);
  chArray.combine = jsonFunction.combineArray2(userArray.playerName, chArray.combine);

  // create RegExp array
  jpArray.special1 = jsonFunction.createRegExpArray(jpArray.special1);
  jpArray.special2 = jsonFunction.createRegExpArray(jpArray.special2);

  // version fix
  versionFix();
}

// version fix
function versionFix() {
  // remove list
  const removeList = []
    .concat(jpArray.jp1, jpArray.jp2)
    .map((x) => x[0])
    .concat(jpArray.listDelete);

  // clear combine
  // 1 word
  // same word in jp1, jp2 and delete list
  for (let index = chArray.combine.length - 1; index >= 0; index--) {
    const element = chArray.combine[index][0];
    if (/(^.$)/.test(element) || removeList.includes(element)) {
      chArray.combine.splice(index, 1);
    }
  }

  // clear temp name
  for (let index = userArray.tempName.length - 1; index >= 0; index--) {
    const element = userArray.tempName[index][0];
    if (/(^.$)/.test(element) || removeList.includes(element)) {
      userArray.tempName.splice(index, 1);
    }
  }

  // update temp name
  jsonFunction.writeUserText('temp-name.json', userArray.tempName);

  /*
  // jp2
  // include words in combine -> move to jp1
  for (let index1 = 0; index1 < jpArray.jp2.length; index1++) {
    for (let index2 = 0; index2 < chArray.combine.length; index2++) {
      const element1 = jpArray.jp2[index1];
      const element2 = chArray.combine[index2];

      if (element1[0].includes(element2[0])) {
        jpArray.jp1.push(element1);
      }
    }
  }

  // sort jp1
  jpArray.jp1 = jsonFunction.sortArray(jpArray.jp1);
  */
}

// get ch array
function getChArray() {
  return chArray;
}

// get jp array
function getJpArray() {
  return jpArray;
}

// get user array
function getUserArray() {
  return userArray;
}

// module exports
module.exports = {
  load,
  getChArray,
  getJpArray,
  getUserArray,
};
