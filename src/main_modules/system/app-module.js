'use strict';

// package module
const packageModule = require('../package-module');

// child process
const { exec } = packageModule.childProcess;

// electron
const { app, globalShortcut } = packageModule.electron;

// file module
const fileModule = packageModule.fileModule;

// config module
const configModule = packageModule.configModule;

// chat code module
const chatCodeModule = packageModule.chatCodeModule;

// window module
const windowModule = packageModule.windowModule;

// ipc module
const ipcModule = packageModule.ipcModule;

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

    // detect user language
    detectUserLanguage();

    // set ipc
    ipcModule.setIPC();

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

// module exports
module.exports = { startApp };
