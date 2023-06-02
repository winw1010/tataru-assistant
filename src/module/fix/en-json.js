'use strict';

// ch array
let chArray = getChArray();

// en array
let enArray = getEnArray();

// load
function load(targetLanguage) {}

// get ch array
function getChArray() {
    return {
        // force replace
        overwrite: [],

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

// get en array
function getEnArray() {
    return {
        // ignore
        ignore: [],

        // en => en
        en1: [],
        en2: [],
    };
}

// module exports
module.exports = {
    load,
};
