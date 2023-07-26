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
    jpArray.special = jsonFunction.readText(jsonFunction.getTextPath('jp', 'special.json'));
    jpArray.title = jsonFunction.readText(jsonFunction.getTextPath('jp', 'title.json'));

    // main
    chArray.main = jsonFunction.readMain(srcIndex, rplIndex);

    // overwrite
    chArray.overwrite = jsonFunction.combineArrayWithTemp(chArray.overwriteTemp, chArray.overwrite);

    // combine
    chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);

    // create special array
    jpArray.special = createSpecialArray(jpArray.special);

    // version fix
    versionFix();
}

// create special array
function createSpecialArray(array = []) {
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
    for (let index = chArray.combine.length - 1; index >= 0; index--) {
        const element = chArray.combine[index][0];
        if (element.length < 3) {
            chArray.combine.splice(index, 1);
        }
    }
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
