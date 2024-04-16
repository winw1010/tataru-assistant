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

// show system message
function showSystemMessage(messageId = '', errorMessage = '') {
  const appLanguage = configModule.getConfig().system.appLanguage;
  const id = 'sid' + new Date().getTime();
  const code = 'FFFF';
  const systemMessage = getSystemMessage({ messageId, errorMessage, appLanguage });

  addDialog(id, code);
  updateDialog(id, code, '', systemMessage);
  setTimeout(() => {
    removeDialog(id);
  }, 7000);
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

// get system message
function getSystemMessage(option = { messageId: '', errorMessage: '', appLanguage: '' }) {
  const messageId = option.messageId;
  const errorMessage = option.errorMessage;
  const appLanguage = option.appLanguage;

  const systemMessage = {
    // system
    S000: ['OK', 'OK', 'OK'],
    S001: ['Error', 'Error', 'Error'],
    S002: ['已安裝最新版本', '已安装最新版本', 'The latest version has been installed.'],
    S003: ['已有可用的更新', '已有可用的更新', 'Updates are available.'],
    S004: ['版本檢查失敗', '版本检查失败', 'Version check failed.'],
    S005: ['翻譯失敗', '翻译失败', 'Translation failed.'],

    // config
    S100: ['設定已儲存', '设定已储存', 'Settings saved.'],
    S101: ['已恢復預設值', '已恢復预设值', 'Restored to default settings.'],
    S102: ['已儲存Google憑證', '已储存Google凭证', 'Google credential has been saved.'],
    S103: ['檔案格式不正確', '档案格式不正确', 'The file format is incorrect.'],

    // json
    S200: ['對照表下載完畢', '对照表下载完毕', 'Table of translations has been downloaded.'],
    S201: ['對照表下載失敗', '对照表下载失败', 'Failed to download table of translations.'],
    S202: ['對照表讀取完畢', '对照表读取完毕', 'Table of translations has been loaded.'],

    // capture
    S300: ['正在擷取螢幕畫面', '正在擷取螢幕畫面', 'Capturing the screenshot.'],
    S301: ['正在辨識圖片文字', '正在辨识图片文字', 'Extracting text from the screenshot.'],
    S302: ['辨識完成', '辨识完成', 'Extraction completed'],
    S303: ['無法擷取螢幕畫面', '无法撷取萤幕画面', 'Failed to capture the screenshot'],
    S304: ['圖片處理發生錯誤', '图片处理发生错误', 'Failed to process the screenshot'],
    S305: ['無法辨識圖片文字', '无法辨识图片文字', 'Failed to extract text from the screenshot'],
  };

  let languageIndex = 2;

  switch (appLanguage) {
    case 'Traditional-Chinese':
      languageIndex = 0;
      break;

    case 'Simplified-Chinese':
      languageIndex = 1;
      break;

    default:
      languageIndex = 2;
      break;
  }

  if (systemMessage[messageId]) {
    return systemMessage[messageId][languageIndex] + (errorMessage === '' ? '' : '\r\n' + errorMessage);
  } else {
    return errorMessage;
  }
}

// module exports
module.exports = {
  addDialog,
  updateDialog,
  removeDialog,
  showNotification,
  showSystemMessage,
  showDialog,
  getStyle,
  createLogName,
};
