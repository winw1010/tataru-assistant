'use strict';

// ch array
let chArray = getChArray();

// jp array
let jpArray = getJpArray();

// load
function load(targetLanguage) {}

// get ch array
function getChArray() {
    return {
        // force replace
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
