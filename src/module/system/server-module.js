'use strict';

// config module
const configModule = require('./config-module');

// dialog module
const dialogModule = require('./dialog-module');

// engine module
const engineModule = require('./engine-module');

// fix entry module
const fixEntryModule = require('../fix/fix-entry');

// system channel
// const systemChannel = ['0039', '0839', '0003', '0038', '003C', '0048', '001D', '001C'];

// text history
let textHistory = {};

// data process
function dataProcess(dialogData) {
  if (checkData(dialogData)) {
    if (dialogData.type === 'CONSOLE') {
      showData(dialogData);
    } else {
      console.log('Dialog Data:', dialogData);
      translateData(dialogData);
    }
  }
}

// check data
function checkData(dialogData) {
  const names = Object.getOwnPropertyNames(dialogData);
  return names.includes('type') && names.includes('code') && names.includes('name') && names.includes('text');
}

// check repetition
function checkRepetition(dialogData, fixText = false) {
  let code = dialogData.code;
  let text = dialogData.text;

  if (fixText) {
    text = text
      .replaceAll('\r', '')
      .replaceAll(/（.*?）/gi, '')
      .replaceAll(/\(.*?\)/gi, '');
  }

  if (text !== textHistory[code]) {
    textHistory[code] = text;
    return true;
  }

  return false;
}

// show data
function showData(dialogData) {
  if (checkRepetition(dialogData)) {
    console.log(dialogData.text);

    if (['Waiting...', 'Start reading...', 'Stop reading...'].includes(dialogData.text)) {
      return;
    } else {
      dialogModule.showNotification(dialogData.text);
    }
  }
}

// translate data
function translateData(dialogData) {
  const config = configModule.getConfig();

  // check text and code
  if (dialogData.text === '' || !config.channel[dialogData.code]) {
    console.log('Skip');
    return;
  }

  // fix text
  dialogData.text = dialogData.text
    .replaceAll(/^#/gi, '')
    .replaceAll(')*', '')
    .replaceAll('%&', '')
    .replaceAll('「+,', '「');

  // check repetition
  if (!checkRepetition(dialogData, true)) {
    return;
  }

  // reset id and timestamp
  dialogData.id = null;
  dialogData.timestamp = null;

  /*
  // fix system message
  if (systemChannel.includes(dialogData.code)) {
    if (dialogData.name !== '') {
      dialogData.text = dialogData.name + ':' + dialogData.text;
      dialogData.name = '';
    }
  }
  */

  // fix new line
  if (config.translation.from === engineModule.languageEnum.ja) {
    dialogData.text = dialogData.text.replace(/(?<=[…、。？！])\r/gi, '').replace(/\r/gi, '、');
  } else {
    dialogData.text = dialogData.text.replace(/\r/gi, ' ');
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
