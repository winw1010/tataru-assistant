'use strict';

// chat code module
const chatCodeModule = require('./chat-code-module');

// config module
const configModule = require('./config-module');

// file module
const fileModule = require('./file-module');

// google tts
const googleTTS = require('../translator/google-tts');

// translate module
const translateModule = require('./translate-module');

// window module
const windowModule = require('./window-module');

// npc channel
const npcChannel = ['003D', '0044', '2AB9'];

// log location
const logLocation = fileModule.getUserDataPath('log');

// dialog timeout
let hideDialogTimeout = null;

// add dialog
function addDialog(id, code) {
  windowModule.sendIndex('add-dialog', {
    id,
    code,
    innerHTML: '<span>...</span>',
    style: getStyle(code),
    scroll: false,
  });
}

// update dialog
function updateDialog(id, code, name, text, dialogData = null, scroll = true) {
  // zh convert
  if (dialogData?.translation) {
    name = translateModule.zhConvert(name, dialogData.translation.to);
    text = translateModule.zhConvert(text, dialogData.translation.to);
  }

  // add dialog
  windowModule.sendIndex('add-dialog', {
    id,
    innerHTML: `<span>${name}</span>${name !== '' ? '：<br />' : ''}<span>${text}</span>`,
    style: { ...getStyle(code), display: 'block' },
    scroll: scroll,
  });

  // show dialog
  showDialog();

  // save dialog
  if (dialogData) {
    saveLog(id, name, text, dialogData);
  }
}

// remove dialog
function removeDialog(id) {
  windowModule.sendIndex('remove-dialog', id);
}

// show notification
function showNotification(text) {
  const config = configModule.getConfig();
  const timestamp = new Date().getTime();
  const id = 'sid' + timestamp;
  const code = 'FFFF';

  // zh convert
  text = translateModule.zhConvert(text, config.system.appLanguage);

  addDialog(id, code);
  updateDialog(id, code, '', text);
  setTimeout(() => {
    removeDialog(id);
  }, 7000 /*5000 + Math.min(text.length * 20, 5000)*/);
}

// show dialog
function showDialog() {
  clearTimeout(hideDialogTimeout);
  hideDialogTimeout = null;

  const config = configModule.getConfig();
  windowModule.sendIndex('hide-dialog', false);

  if (config.indexWindow.hideDialog) {
    hideDialogTimeout = setTimeout(() => {
      windowModule.sendIndex('hide-dialog', true);
    }, config.indexWindow.hideDialogTimeout * 1000);
  }
}

// get style
function getStyle(code = '003D') {
  const config = configModule.getConfig();
  return {
    fontWeight: config.dialog.weight,
    color: chatCodeModule.getColor(code),
    fontSize: config.dialog.fontSize + 'rem',
    marginTop: config.dialog.spacing + 'rem',
    borderRadius: config.dialog.radius + 'rem',
    backgroundColor: config.dialog.backgroundColor,
  };
}

// save dialog
function saveLog(id, name, text, dialogData) {
  try {
    const item = {
      id: id,
      code: dialogData.code,
      player: dialogData.playerName,
      name: dialogData.name,
      text: dialogData.text,
      audio_text: dialogData.audioText,
      translated_name: name,
      translated_text: text,
      timestamp: dialogData.timestamp,
      datetime: new Date(dialogData.timestamp).toLocaleString(),
      translation: dialogData.translation,
    };

    const filePath = fileModule.getPath(logLocation, createLogName(item.timestamp));
    let log = {};

    // read/create log file
    if (fileModule.exists(filePath)) {
      log = fileModule.read(filePath, 'json') || {};

      // fix old bug
      if (Array.isArray(log)) {
        log = {};
      }
    }

    // play speech at first time
    if (!log[item.id] && npcChannel.includes(dialogData.code) && dialogData.audioText !== '') {
      const urlList = googleTTS.getAudioUrl(dialogData.audioText, dialogData.translation.from);
      windowModule.sendIndex('add-to-playlist', urlList);
    }

    // add/replcae log
    log[item.id] = item;

    // write log file
    fileModule.write(filePath, log, 'json');
  } catch (error) {
    console.error(error);
  }
}

// create log name
function createLogName(milliseconds = null) {
  const date = Number.isInteger(milliseconds) ? new Date(milliseconds) : new Date();

  return (
    date.getFullYear().toString() +
    '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    date.getDate().toString().padStart(2, '0') +
    '.json'
  );
}

// module exports
module.exports = {
  addDialog,
  updateDialog,
  removeDialog,
  showNotification,
  showDialog,
  getStyle,
  createLogName,
};
