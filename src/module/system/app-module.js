'use strict';

// child process
const { exec } = require('child_process');

// electron
const { app, globalShortcut, ipcMain } = require('electron');

// file module
const fileModule = require('./file-module');

// config module
const configModule = require('./config-module');

// chat code module
const chatCodeModule = require('./chat-code-module');

// engine module
const { languageEnum } = require('./engine-module');

// window module
const windowModule = require('./window-module');

// ipc module
const ipcModule = require('./ipc-module');

// start app
function startApp() {
  // directory check
  fileModule.directoryCheck();

  // load config
  configModule.loadConfig();

  // load chat code
  chatCodeModule.loadChatCode();

  // detect user language
  detectUserLanguage();

  // set IPC
  ipcModule.setIPC();

  // set global shortcut
  setGlobalShortcut();

  // set shortcut IPC
  ipcMain.on('set-global-shortcut', () => {
    setGlobalShortcut();
  });
}

// write log
function wirteLog(type = '', message = '') {
  fileModule.writeLog(type, message);
}

// detect user language
function detectUserLanguage() {
  const config = configModule.getConfig();

  if (config.system.firstTime) {
    const locale = app.getSystemLocale(); //Intl.DateTimeFormat().resolvedOptions().locale;

    if (/zh-(TW|HK|MO|CHT|Hant)/i.test(locale)) {
      config.translation.to = languageEnum.zht;
      config.system.appLanguage = languageEnum.zht;
    } else if (/zh-(CN|CHS|Hans)/i.test(locale)) {
      config.translation.to = languageEnum.zhs;
      config.system.appLanguage = languageEnum.zhs;
    } else {
      config.translation.to = languageEnum.en;
      config.system.appLanguage = languageEnum.en;
    }

    configModule.setConfig(config);
  }
}

// set global shortcut
function setGlobalShortcut() {
  if (configModule.getConfig().indexWindow.shortcut) {
    registerGlobalShortcut();
  } else {
    unregisterGlobalShortcut();
  }
}

// register global shortcut
function registerGlobalShortcut() {
  globalShortcut.unregisterAll();

  globalShortcut.register('CommandOrControl+F8', () => {
    let config = configModule.getConfig();
    config.translation.getCutsceneText = !config.translation.getCutsceneText;
    configModule.setConfig(config);
    windowModule.sendIndex('change-reccord-icon', config.translation.getCutsceneText);
  });

  globalShortcut.register('CommandOrControl+F9', () => {
    exec(`explorer "${fileModule.getRootPath('src', 'data', 'text', 'readme', 'index.html')}"`);
  });

  globalShortcut.register('CommandOrControl+F10', () => {
    try {
      windowModule.closeWindow('config');
    } catch (error) {
      windowModule.createWindow('config');
    }
  });

  globalShortcut.register('CommandOrControl+F11', () => {
    try {
      windowModule.closeWindow('capture');
    } catch (error) {
      windowModule.createWindow('capture');
    }
  });

  globalShortcut.register('CommandOrControl+F12', () => {
    windowModule.openDevTools();
  });
}

// unregister global shortcut
function unregisterGlobalShortcut() {
  globalShortcut.unregisterAll();
}

// module exports
module.exports = {
  startApp,
  wirteLog,
};
