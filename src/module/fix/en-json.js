'use strict';

// json function
const jsonFunction = require('./json-function');

// language table
const { languageEnum, languageIndex } = require('../system/engine-module');

// ch array
let chArray = [];

// en array
let enArray = [];

// load
function load(targetLanguage) {
    const srcIndex = languageIndex[languageEnum.en];
    const rplIndex = languageIndex[targetLanguage];
    const ch = targetLanguage === languageEnum.zht ? 'cht' : 'chs';

    // temp
    chArray.chTemp = jsonFunction.readText(jsonFunction.getTempTextPath('chTemp.json'), false);
    chArray.overwriteTemp = jsonFunction.readText(jsonFunction.getTempTextPath('overwriteTemp.json'), false);
    chArray.player = jsonFunction.readText(jsonFunction.getTempTextPath('player.json'));

    // ch
    chArray.overwrite = jsonFunction.readOverwriteEN(rplIndex);
    chArray.afterTranslation = jsonFunction.readText(jsonFunction.getTextPath('ch', `after-translation-${ch}.json`));

    // en
    enArray.subtitle = jsonFunction.readSubtitleEN();
    enArray.ignore = jsonFunction.readText(jsonFunction.getTextPath('en', 'ignore.json'));
    enArray.en1 = jsonFunction.readText(jsonFunction.getTextPath('en', 'en1.json'));
    enArray.en2 = jsonFunction.readText(jsonFunction.getTextPath('en', 'en2.json'));

    // main
    chArray.main = jsonFunction.readMain(srcIndex, rplIndex);

    // overwrite
    chArray.overwrite = jsonFunction.combineArrayWithTemp(chArray.overwriteTemp, chArray.overwrite);

    // combine
    chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);
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
