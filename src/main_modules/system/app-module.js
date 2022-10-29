'use strict';

// child process
const { exec } = require('child_process');

// electron
const { app, globalShortcut } = require('electron');

// file module
const fileModule = require('./file-module');

// config module
const configModule = require('./config-module');

// chat code module
const chatCodeModule = require('./chat-code-module');

// window module
const windowModule = require('./window-module');

// ipc module
const ipcModule = require('./ipc-module');

// start app
function startApp() {
    // disable http cache
    app.commandLine.appendSwitch('disable-http-cache');

    // directory check
    fileModule.directoryCheck();

    // load config
    configModule.loadConfig();

    // load chat code
    chatCodeModule.loadChatCode();

    // set ipc
    ipcModule.setIPC();

    // detect user language
    detectUserLanguage();

    // set shortcut
    setGlobalShortcut();
}

// detect user language
function detectUserLanguage() {
    const config = configModule.getConfig();

    if (config.system.firstTime) {
        const env = process.env;
        const envLanguage = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES || 'zh_TW';

        if (/zh_TW|zh_HK|zh_MO|zh_CHT|zh_Hant/i.test(envLanguage)) {
            config.translation.to = 'Traditional-Chinese';
        } else if (/zh_CN|zh_SG|zh_CHS|zh_Hans/i.test(envLanguage)) {
            config.translation.to = 'Simplified-Chinese';
        } else {
            config.translation.to = 'Traditional-Chinese';
        }
    }
}

// set global shortcut
function setGlobalShortcut() {
    globalShortcut.register('CommandOrControl+F9', () => {
        if (!configModule.getConfig().indexWindow.shortcut) {
            return;
        }

        exec(`explorer "${fileModule.getRootPath('src', 'json', 'text', 'readme', 'index.html')}"`);
    });

    globalShortcut.register('CommandOrControl+F10', () => {
        if (!configModule.getConfig().indexWindow.shortcut) {
            return;
        }

        try {
            windowModule.closeWindow('config');
        } catch (error) {
            windowModule.createWindow('config');
        }
    });

    globalShortcut.register('CommandOrControl+F11', () => {
        if (!configModule.getConfig().indexWindow.shortcut) {
            return;
        }

        try {
            windowModule.closeWindow('capture');
        } catch (error) {
            windowModule.createWindow('capture');
        }
    });

    globalShortcut.register('CommandOrControl+F12', () => {
        if (!configModule.getConfig().indexWindow.shortcut) {
            return;
        }

        windowModule.openDevTools();
    });
}

// module exports
module.exports = { startApp };
