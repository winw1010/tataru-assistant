'use strict';

// json function
const jsonFunction = require('./json-function');

// language table
const { languageEnum, languageIndex } = require('../system/engine-module');

// ch array
let chArray = getChArray();

// jp array
let jpArray = getJpArray();

// load
function load(targetLanguage) {
    const srcIndex = languageIndex[languageEnum.ja];
    const rplIndex = languageIndex[targetLanguage];
    const ch = targetLanguage === languageEnum.zht ? 'cht' : 'chs';

    // temp
    chArray.chTemp = jsonFunction.readText(jsonFunction.getTempTextPath('chTemp.json'), false);
    chArray.jpTemp = jsonFunction.readText(jsonFunction.getTempTextPath('jpTemp.json'), false);
    chArray.overwriteTemp = jsonFunction.readText(jsonFunction.getTempTextPath('overwriteTemp.json'), false);
    chArray.player = jsonFunction.readText(jsonFunction.getTempTextPath('player.json'));

    // ch
    chArray.overwrite = jsonFunction.readOverwriteJP(rplIndex);
    chArray.afterTranslation = jsonFunction.readText(jsonFunction.getTextPath('ch', `afterTranslation-${ch}.json`));
    chArray.chName = jsonFunction.readText(jsonFunction.getTextPath('ch', 'chName.json'), true, true, srcIndex, rplIndex);

    // jp
    jpArray.subtitle = jsonFunction.combineArrayWithTemp(chArray.jpTemp, jsonFunction.readSubtitleJP());
    jpArray.ignore = jsonFunction.readText(jsonFunction.getTextPath('jp', 'ignore.json'));
    jpArray.jp1 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'jp1.json'));
    jpArray.jp2 = jsonFunction.readText(jsonFunction.getTextPath('jp', 'jp2.json'));
    jpArray.kana = jsonFunction.readText(jsonFunction.getTextPath('jp', 'kana.json'));
    jpArray.listCrystalium = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listCrystalium.json'));
    jpArray.listHira = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listHira.json'));
    jpArray.listReverse = jsonFunction.readText(jsonFunction.getTextPath('jp', 'listReverse.json'));

    // main
    chArray.main = jsonFunction.readMain(srcIndex, rplIndex);

    // overwrite
    chArray.overwrite = jsonFunction.combineArrayWithTemp(chArray.overwriteTemp, chArray.overwrite);

    // combine
    chArray.combine = jsonFunction.combineArrayWithTemp(chArray.chTemp, chArray.player, chArray.main);
}

// get ch array
function getChArray() {
    return {
        // force replace
        overwriteTemp: [],
        overwrite: [],

        // kana name
        chName: [],

        // after
        afterTranslation: [],

        // replace
        main: [],

        // player
        player: [],

        // temp
        chTemp: [],

        // combine
        combine: [],
    };
}

// get jp array
function getJpArray() {
    return {
        // ignore
        ignore: [],

        // jp => jp
        subtitle: [],
        jp1: [],
        jp2: [],

        // temp
        jpTemp: [],

        // jp char
        kana: [],

        // jp list
        listHira: [],
        listReverse: [],
        listCrystalium: [],
    };
}

// module exports
module.exports = {
    load,
};
