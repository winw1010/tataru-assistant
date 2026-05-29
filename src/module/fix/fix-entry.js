'use strict';

// config module
const configModule = require('../system/config-module');

// dialog module
const dialogModule = require('../system/dialog-module');

// engine module
const engineModule = require('../system/engine-module');

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
  if (!(dialogData.id && dialogData.timestamp)) {
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
    if (running) {
      const dialogData = entryIntervalItem.shift();

      if (dialogData && dialogData.text) {
        entry(dialogData);
      }
    }
  }, 1000);
}

// entry
async function entry(dialogData) {
  const config = configModule.getConfig();

  // add dialog
  dialogModule.addDialog(dialogData);

  // clear newline
  dialogData.name = dialogData.name.replace(/[\r\n\t]/g, '');
  dialogData.text = dialogData.text.replace(/[\r\n\t]/g, '');

  // reset translated content
  dialogData.translatedName = '';
  dialogData.translatedText = '';
  dialogData.audioText = dialogData.text;

  // get true language
  const trueLanguage = getLanguage(dialogData);
  dialogData.translation.from = trueLanguage;

  // translator list
  const translatorList = engineModule.getEngineList(dialogData.translation.engine, dialogData.translation.engineAlternate);

  do {
    // get translaor
    const translaor = translatorList.shift();
    const isLLM = engineModule.aiList.includes(translaor);
    dialogData.translation.engine = translaor;

    // loop message
    if (dialogData.translatedText.includes('Assistant Error:')) {
      dialogModule.addNotification('Change to ' + translaor);
    }

    // translate
    if (trueLanguage === dialogData.translation.to) {
      dialogData.translatedName = dialogData.name;
      dialogData.translatedText = dialogData.text;
    } else {
      // FIX is on & Source = JP or EN => fix translation
      if (config.translation.fix && engineModule.fixSourceList.includes(trueLanguage)) {
        // JP fix
        if (trueLanguage === engineModule.languageEnum.ja) {
          if (jpFix.skipTranslation(dialogData)) {
            console.log('Skip Translation.');
            dialogModule.removeDialog(dialogData.id);
            return;
          }

          showTranslating(dialogData);
          await jpFix.start(dialogData);
        }
        // EN fix
        else {
          if (enFix.skipTranslation(dialogData)) {
            console.log('Skip Translation.');
            dialogModule.removeDialog(dialogData.id);
            return;
          }

          showTranslating(dialogData);
          await enFix.start(dialogData);
        }
      }
      // normal translation
      else {
        showTranslating(dialogData);

        if (isLLM) {
          const responseObject = await translateModule.translateLLM(dialogData.name, dialogData.text, dialogData.translation);

          if (npcChannel.includes(dialogData.code)) {
            dialogData.translatedName = responseObject.name;
          } else {
            dialogData.translatedName = dialogData.name;
          }

          dialogData.translatedText = responseObject.text;
        } else {
          if (npcChannel.includes(dialogData.code)) {
            dialogData.translatedName = await translateModule.translate(dialogData.name, dialogData.translation);
          } else {
            dialogData.translatedName = dialogData.name;
          }

          dialogData.translatedText = await translateModule.translate(dialogData.text, dialogData.translation);
        }
      }
    }

    // empty check
    if (dialogData.translatedText === '') {
      dialogData.translatedText = 'Assistant Error: Empty String.';
    }

    // update dialog
    dialogModule.updateDialog(dialogData);
  } while (dialogData.translatedText.includes('Assistant Error:') && dialogData.translation.autoChange && translatorList.length > 0);
}

// get language
function getLanguage(dialogData) {
  return isPlayerChannel(dialogData.code) ? dialogData.translation.fromPlayer : dialogData.translation.from;
}

// is player channel
function isPlayerChannel(code) {
  return playerChannel.includes(code);
}

// show translating
function showTranslating(dialogData) {
  const temp = JSON.parse(JSON.stringify(dialogData));
  temp.translatedName = '';
  temp.translatedText = '...';
  dialogModule.updateDialog(temp);
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
