'use strict';

const { addToQueue_JP } = require('./correction-module-jp');
const { addToQueue_EN } = require('./correction-module-en');

function correctionEntry(dialogData, translation) {
    if (languageCheck(dialogData, translation, 'japanese')) {
        addToQueue_JP(dialogData, translation);
    } else if (languageCheck(dialogData, translation, 'english')) {
        addToQueue_EN(dialogData, translation);
    }
}

function languageCheck(dialogData, translation, language) {
    return isPlayerChannel(dialogData.code) ? translation.fromPlayer === language : translation.from === language;
}

function isPlayerChannel(code) {
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
    return playerChannel.includes(code);
}

exports.correctionEntry = correctionEntry;