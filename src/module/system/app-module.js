'use strict';

// child process
const { exec } = require('child_process');

// electron
const { globalShortcut, ipcMain } = require('electron');

// file module
const fileModule = require('./file-module');

// config module
const configModule = require('./config-module');

// chat code module
const chatCodeModule = require('./chat-code-module');

// sharlayan module
const sharlayanModule = require('./sharlayan-module');

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

    // start sharlayan reader
    sharlayanModule.start();
}

// detect user language
function detectUserLanguage() {
    const config = configModule.getConfig();

    if (config.system.firstTime) {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale; //app.getSystemLocale();
        if (/zh-(TW|HK|MO|CHT|Hant)/i.test(locale)) {
            config.translation.to = 'Traditional-Chinese';
        } else if (/zh-(CN|SG|CHS|Hans)/i.test(locale)) {
            config.translation.to = 'Simplified-Chinese';
        } else {
            config.translation.to = 'Traditional-Chinese';
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
        exec(`explorer "${fileModule.getRootPath('src', 'json', 'text', 'readme', 'index.html')}"`);
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
module.exports = { startApp };
