'use strict';

// dialog
const { BrowserWindow, dialog } = require('electron');

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
function addDialog(dialogData) {
  windowModule.sendIndex('add-dialog', dialogData);
}

// update dialog
function updateDialog(dialogData = {}, scroll = true, save = true) {
  // zh convert
  if (dialogData?.translation) {
    dialogData.translatedName = translateModule.zhConvert(dialogData.translatedName, dialogData.translation.to);
    dialogData.translatedText = translateModule.zhConvert(dialogData.translatedText, dialogData.translation.to);
  }

  // send
  windowModule.sendIndex('update-dialog', dialogData, getStyle(dialogData.code), scroll);

  // show dialog
  showDialog();

  // save dialog
  if (save) {
    saveDialog(dialogData);
  }
}

// add notification
function addNotification(text) {
  const config = configModule.getConfig();

  // zh convert
  text = translateModule.zhConvert(text, config.system.appLanguage);

  // add
  windowModule.sendIndex('add-notification', text, getStyle('FFFF'));
}

// show info
function showInfo(webContents = null, message = '') {
  if (!webContents) return;

  dialog.showMessageBox(BrowserWindow.fromWebContents(webContents), {
    type: 'info',
    title: 'Tataru Assistant',
    message: message,
  });
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
function saveDialog(dialogData) {
  try {
    const item = {
      id: dialogData.id,
      code: dialogData.code,
      player: dialogData.playerName,
      name: dialogData.name,
      text: dialogData.text,
      audio_text: dialogData.audioText,
      translated_name: dialogData.translatedName,
      translated_text: dialogData.translatedText,
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

    // speech text at first time
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
  addNotification,
  showInfo,
  showDialog,
  getStyle,
  createLogName,
};
