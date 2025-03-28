'use strict';

// config module
const configModule = require('./config-module');

// dialog module
const dialogModule = require('./dialog-module');

// engine module
const engineModule = require('./engine-module');

// fix entry module
const fixEntryModule = require('../fix/fix-entry');

// data process
function dataProcess(dialogData) {
  if (checkData(dialogData)) {
    if (dialogData.type === 'SYSTEM') {
      dialogModule.addNotification(dialogData.text);
    } else {
      translateData(dialogData);
    }
  }
}

// check data
function checkData(dialogData) {
  const names = Object.keys(dialogData);
  return names.includes('type') && names.includes('code') && names.includes('name') && names.includes('text');
}

// translate data
function translateData(dialogData) {
  const config = configModule.getConfig();

  // check text and code
  if (dialogData.text === '' || !config.channel[dialogData.code]) {
    console.log('skip', dialogData.code);
    return;
  }

  // reset id and timestamp
  dialogData.id = null;
  dialogData.timestamp = null;

  // fix new line
  if (config.translation.from === engineModule.languageEnum.ja) {
    dialogData.text = dialogData.text.replaceAll('[r]', '、').replace(/(?<=[…、。？！])、/gi, '');
    /*
    if (dialogData.type.includes('CUTSCENE')) {
      dialogData.text = dialogData.text.replaceAll('[r]', '、').replace(/(?<=[…、。？！])、/gi, '');
    } else {
      dialogData.text = dialogData.text.replaceAll('[r]', '');
    }
    */
  } else {
    dialogData.text = dialogData.text.replaceAll('[r]', ' ');
  }

  // set translation
  dialogData.translation = config.translation;

  // start translation
  fixEntryModule.addTask(dialogData);
}

// module exports
module.exports = {
  dataProcess,
};
