'use strict';

// config module
const configModule = require('../system/config-module');

// dialog module
const dialogModule = require('../system/dialog-module');

// language table
const { languageEnum, fixSourceList } = require('../system/engine-module');

// translate module
const translateModule = require('../system/translate-module');

// fix module
const enFix = require('./en-fix');
const jpFix = require('./jp-fix');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// player channel
const playerChannel = getPlayerChannel();

// entry interval
let lastTimestamp = 0;
let running = false;
let entryIntervalItem = [];
let entryInterval = getEntryInterval();

// set running
function setRunning(value) {
  running = value;
}

// add task
function addTask(dialogData) {
  // check id and timestamp
  if (!dialogData.id || !dialogData.timestamp) {
    let timestamp = new Date().getTime();
    if (timestamp <= lastTimestamp) timestamp = lastTimestamp + 1;
    lastTimestamp = timestamp;
    dialogData.id = 'id' + timestamp;
    dialogData.timestamp = timestamp;
  }

  // check translation
  if (!dialogData.translation) {
    dialogData.translation = configModule.getConfig().translation;
  }

  // push
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
async function entry() {
  const config = configModule.getConfig();
  const dialogData = entryIntervalItem.shift();

  if (!dialogData) return;

  // add dialog
  dialogModule.addDialog(dialogData);

  // clear content
  dialogData.name = dialogData.name.replace(/[\r\n]/g, '');
  dialogData.text = dialogData.text.replace(/[\r\n]/g, '');

  // set translated content
  dialogData.translatedName = '';
  dialogData.translatedText = '';
  dialogData.audioText = '';

  // get true language
  const trueLanguage = getLanguage(dialogData);

  // JP/EN => XIV fix
  if (config.translation.fix && fixSourceList.includes(trueLanguage)) {
    // JP fix
    if (trueLanguage === languageEnum.ja) {
      if (jpFix.skipTranslation(dialogData)) {
        console.log('Skip translation');
        dialogModule.removeDialog(dialogData.id);
        return;
      }

      dialogData.translation.from = languageEnum.ja;
      await jpFix.start(dialogData);
    }
    // EN fix
    else {
      if (enFix.skipTranslation(dialogData)) {
        console.log('Skip translation');
        dialogModule.removeDialog(dialogData.id);
        return;
      }

      dialogData.translation.from = languageEnum.en;
      await enFix.start(dialogData);
    }
  }
  // normal translation
  else {
    // translate name
    if (npcChannel.includes(dialogData.code)) {
      dialogData.translatedName = await translateModule.translate(dialogData.name, dialogData.translation, [], 'name');
    }

    // translate text
    dialogData.translatedText = await translateModule.translate(dialogData.text, dialogData.translation);

    // set audio text
    dialogData.audioText = dialogData.text;
  }

  // update dialog
  if (dialogData.translatedText === '') {
    dialogData.translatedText = 'ERROR';
  }

  dialogModule.updateDialog(dialogData);
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
