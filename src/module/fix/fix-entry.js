'use strict';

// language table
const { languageEnum } = require('../system/engine-module');

// fix module
const enFix = require('./en-fix');
const jpFix = require('./jp-fix');

// player channel
const playerChannel = getPlayerChannel();

// entry interval
let running = true;
let entryIntervalItem = [];
let entryInterval = getEntryInterval();

// set running
function setRunning(value) {
    running = value;
}

// add task
function addTask(dialogData) {
    entryIntervalItem.push(dialogData);
}

// restart entry interval
function restartEntryInterval() {
    clearInterval(entryInterval);
    entryIntervalItem = [];
    entryInterval = getEntryInterval();
}

// get entry interval
function getEntryInterval() {
    return setInterval(() => {
        if (running) entry();
    }, 1000);
}

// entry
function entry() {
    const dialogData = entryIntervalItem.shift();
    if (dialogData) {
        // check id and timestamp
        if (!dialogData.id || !dialogData.timestamp) {
            const timestamp = new Date().getTime();
            dialogData.id = 'id' + timestamp;
            dialogData.timestamp = timestamp;
        }

        // check language
        const dataLanguage = getLanguage(dialogData);
        if (dataLanguage === languageEnum.ja) {
            dialogData.translation.from = languageEnum.ja;
            jpFix.startFix(dialogData, dialogData.translation);
        } else if (dataLanguage === languageEnum.en) {
            dialogData.translation.from = languageEnum.en;
            enFix.startFix(dialogData, dialogData.translation);
        }
    }
}

// get language
function getLanguage(dialogData) {
    return isPlayerChannel(dialogData.code) ? dialogData.translation.fromPlayer : dialogData.translation.from;
}

// is player channel
function isPlayerChannel(code) {
    return playerChannel.includes(code);
}

// get player channel
function getPlayerChannel() {
    return [
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
}

// module exports
module.exports = {
    setRunning,
    addTask,
    restartEntryInterval,
};
