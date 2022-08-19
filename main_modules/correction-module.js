'use strict';

// language table
const { languageEnum } = require('./engine-module');

// correction module
const { addToCorrectionQueue_JP } = require('./correction-module-jp');
const { addToCorrectionQueue_EN } = require('./correction-module-en');

// player channel
const playerChannel = [
    // Say
    '000A',

    // Shout
    '000B',

    // Party
    '000E',

    // Tell
    '000D',

    // FreeCompany
    '0018',

    // Yell
    '001E',

    // Alliance
    '000F',

    // LinkShell
    '0010',
    '0011',
    '0012',
    '0013',
    '0014',
    '0015',
    '0016',
    '0017',

    // CWLS
    '0025',
    '0065',
    '0066',
    '0067',
    '0068',
    '0069',
    '006A',
    '006B',

    // NoviceNetwork
    '001B',
];

function correctionEntry(dialogData, translation) {
    if (getLanguageFrom(dialogData, translation) === languageEnum.ja) {
        translation.from = languageEnum.ja;
        addToCorrectionQueue_JP(dialogData, translation);
    } else if (getLanguageFrom(dialogData, translation) === languageEnum.en) {
        translation.from = languageEnum.en;
        addToCorrectionQueue_EN(dialogData, translation);
    }
}

function getLanguageFrom(dialogData, translation) {
    return isPlayerChannel(dialogData.code) ? translation.fromPlayer : translation.from;
}

function isPlayerChannel(code) {
    return playerChannel.includes(code);
}

exports.correctionEntry = correctionEntry;
