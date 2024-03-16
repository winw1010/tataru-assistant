'use strict';

// json function
const jsonFunction = require('./json-function');

// language table
const { languageEnum, languageIndex } = require('../system/engine-module');

// ch array
let chArray = {};

// jp array
let jpArray = {};

// load
function load(targetLanguage) {
  const srcIndex = languageIndex[languageEnum.ja];
  const rplIndex = languageIndex[targetLanguage];
  const ch = targetLanguage === languageEnum.zht ? 'cht' : 'chs';

  // temp
  jpArray.jpTemp = jsonFunction.readTemp('jpTemp.json', false);
  chArray.chTemp = jsonFunction.readTemp('chTemp.json', false);
  chArray.overwriteTemp = jsonFunction.readTemp('overwriteTemp.json', false);
  chArray.player = jsonFunction.readTemp('player.json');

  // ch
  chArray.overwrite = jsonFunction.readOverwriteJP(rplIndex - 1);
  chArray.afterTranslation = jsonFunction.readText(
    jsonFunction.getTextPath('ch', `after-translation-${ch}.json`)
  );
  chArray.chName = jsonFunction.readText(
    jsonFunction.getTextPath('ch', 'jp-ch-name.json'),
    true,
    true,
    srcIndex,
    rplIndex - 1
  );

  // jp
  jpArray.subtitle = jsonFunction.combineArrayWithTemp(
    jpArray.jpTemp,
    jsonFunction.readSubtitleJP()
  );
  jpArray.ignore = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'ignore.json')
  );
  jpArray.jp1 = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'jp1.json')
  );
  jpArray.jp2 = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'jp2.json')
  );
  jpArray.listCrystalium = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'listCrystalium.json')
  );
  jpArray.listDelete = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'listDelete.json')
  );
  jpArray.listHira = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'listHira.json')
  );
  jpArray.listReverse = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'listReverse.json')
  );
  jpArray.special1 = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'special1.json')
  );
  jpArray.special2 = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'special2.json')
  );
  jpArray.title = jsonFunction.readText(
    jsonFunction.getTextPath('jp', 'title.json')
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

  // create RegExp array
  jpArray.special1 = createRegExpArray(jpArray.special1);
  jpArray.special2 = createRegExpArray(jpArray.special2);

  // version fix
  versionFix();
}

// create RegExp array
function createRegExpArray(array = []) {
  let invalidIndex = [];

  // create RegExp
  for (let index = 0; index < array.length; index++) {
    try {
      array[index][0] = new RegExp(array[index][0], 'gi');
    } catch (error) {
      invalidIndex.push(index);
      //console.log(error);
    }
  }

  // delete invalid element
  invalidIndex = invalidIndex.reverse();
  for (let index = 0; index < invalidIndex.length; index++) {
    array.splice(invalidIndex[index], 1);
  }

  return array;
}

// version fix
function versionFix() {
  // combine
  // 2 letters name
  // ココ#
  for (let index = chArray.combine.length - 1; index >= 0; index--) {
    const element = chArray.combine[index][0];
    if (/(^[ァ-ヺー]{2}$)|(^ココ#$)|(^イケ#$)/.test(element)) {
      chArray.combine.splice(index, 1);
    } else {
      chArray.combine[index][0] = element.replace(
        /(?<![ァ-ヺー・＝])[ァ-ヺー]{2}(?![ァ-ヺー・＝#])/gi,
        '$&#'
      );
    }
  }

  // chTemp
  // 2 letters name
  // same word in jp1 and jp2
  const jpCombine = [].concat(jpArray.jp1, jpArray.jp2).map((x) => x[0]);
  for (let index = chArray.chTemp.length - 1; index >= 0; index--) {
    const element = chArray.chTemp[index][0];
    if (
      /(^[ァ-ヺー]{2}#$)/.test(element) ||
      jpCombine.includes(element) ||
      jpArray.listDelete.includes(element)
    ) {
      chArray.chTemp.splice(index, 1);
    }
  }

  // update temp
  jsonFunction.writeTemp('chTemp.json', chArray.chTemp);

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
}

// get ch array
function getChArray() {
  return chArray;
}

// get jp array
function getJpArray() {
  return jpArray;
}

// module exports
module.exports = {
  load,
  getChArray,
  getJpArray,
};
