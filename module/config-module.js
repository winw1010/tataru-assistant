'use strict';

//fs
const { readFileSync, writeFileSync } = require('fs');

// communicate with main process
const { ipcRenderer } = require('electron');

const defaultConfig = {
    server: {
        host: 'localhost',
        port: 8898
    },
    preloadWindow: {
        x: -1,
        y: -1,
        width: -1,
        height: -1,
        alwaysOnTop: true,
        advance: true,
        hideButton: true,
        hideDialog: true,
        hideDialogInterval: 20,
        backgroundColor: '#20202050'
    },
    dialog: {
        fontSize: '1.1',
        spacing: '1',
        radius: '0',
        backgroundColor: '#202020A0'
    },
    captureWindow: {
        x: -1,
        y: -1,
        width: -1,
        height: -1,
        type: "fast",
        split: true,
        edit: false
    },
    channel: {
        "FFFF": "#CCCCCC",
        '0039': '#CCCCCC',
        '0839': '#CCCCCC',
        '003D': '#ABD647',
        '0044': '#ABD647',
        '2AB9': '#ABD647'
    },
    translation: {
        autoChange: true,
        autoPlay: false,
        fix: true,
        skip: true,
        replace: true,
        engine: 'Baidu',
        from: 'Japanese',
        fromPlayer: 'Japanese',
        to: 'Traditional-Chinese'
    },
    system: {
        autoDownloadJson: true
    }
}

function loadConfig() {
    try {
        const config = JSON.parse(readFileSync('./json/setting/config.json'));

        if (!config.server || !config.server.host || !config.server.port) {
            throw null;
        }

        const defaultNames = Object.getOwnPropertyNames(defaultConfig);
        defaultNames.forEach((value) => {
            if (isDifferent(config, value)) {
                throw null;
            }
        });

        return config;
    } catch (error) {
        saveDefaultConfig();
        return defaultConfig;
    }
}

function isDifferent(config, name) {
    try {
        return !config[name] ||
            Object.getOwnPropertyNames(config[name]).length !== Object.getOwnPropertyNames(defaultConfig[name]).length;
    } catch (error) {
        return true;
    }
}

function saveConfig(config) {
    try {
        writeFileSync('./json/setting/config.json', JSON.stringify(config, null, '\t'));
    } catch (error) {
        ipcRenderer.send('send-preload', 'show-notification', error);
    }
}

function saveDefaultConfig() {
    try {
        writeFileSync('./json/setting/config.json', JSON.stringify(defaultConfig, null, '\t'));
    } catch (error) {
        ipcRenderer.send('send-preload', 'show-notification', error);
    }
}

exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.saveDefaultConfig = saveDefaultConfig;