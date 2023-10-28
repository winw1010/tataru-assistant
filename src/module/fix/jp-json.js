'use strict';

// file module
const fileModule = require('../system/file-module');

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
    chArray.overwrite = jsonFunction.readOverwriteJP(rplIndex);
    chArray.afterTranslation = jsonFunction.readText(jsonFunction.getTextPath('ch', `after-translation-${ch}.json`));
    chArray.chName = jsonFunction.readText(jsonFunction.getTextPath('ch', 'jp-ch-name.json'), true, true, srcIndex, rplIndex - 1);

    // jp
    jpArray.subtitle = jsonFunction.combineArrayWithTemp(jpArray.jpTemp, jsonFunction.readSubtitleJP());
    jpArray.ignore = jsonFunction.readText(jsonFunction.getTextPath('jp', 'ignore.json'));
    jpArray.jp1 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'jp1.json'));
    jpArray.jp2 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'jp2.json'));
    jpArray.listCrystalium = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listCrystalium.json'));
    jpArray.listHira = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listHira.json'));
    jpArray.listReverse = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listReverse.json'));
    jpArray.special1 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'special1.json'));
    jpArray.special2 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'special2.json'));
    jpArray.title = jsonFunction.readText(jsonFunction.getTextPath('jp', 'title.json'));

    // main
    chArray.main = jsonFunction.readMain(srcIndex, rplIndex);

    // overwrite
    chArray.overwrite = jsonFunction.combineArrayWithTemp(chArray.overwriteTemp, chArray.overwrite);

    // combine
    chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

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
    // 2 words name
    // ココ#
    for (let index = chArray.combine.length - 1; index >= 0; index--) {
        const element = chArray.combine[index][0];
        if (/(^[ァ-ヺー]{2}$)|(^ココ#$)/.test(element)) {
            chArray.combine.splice(index, 1);
        } else {
            chArray.combine[index][0] = element.replace(/(?<![ァ-ヺー・＝])[ァ-ヺー]{2}(?![ァ-ヺー・＝#])/gi, '$&#');
        }
    }

    // chTemp
    // ココ#
    // same word in jp1 and jp2
    const jpCombine = jpArray.jp1.concat(jpArray.jp2).map((x) => x[0]);
    for (let index = chArray.chTemp.length - 1; index >= 0; index--) {
        const element = chArray.chTemp[index][0];
        if (/(^ココ#$)/.test(element) || jpCombine.includes(element)) {
            chArray.chTemp.splice(index, 1);
        }
    }

    // update temp
    fileModule.write(fileModule.getPath(fileModule.getUserDataPath('temp'), 'chTemp.json'), chArray.chTemp, 'json');
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
