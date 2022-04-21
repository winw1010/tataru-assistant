'use strict';

const { ipcRenderer } = require('electron');
const { readFileSync, writeFileSync } = require('fs');

let defaultConfig = {
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
        fix: true,
        skip: true,
        replace: true,
        engine: 'baidu',
        from: 'japanese',
        fromParty: 'japanese',
        to: 'traditional-chinese'
    },
    system: {
        autoDownloadJson: true
    }
}

function loadConfig() {
    try {
        let config = JSON.parse(readFileSync('./json/setting/config.json'));

        if (!config.server || !config.server.host || !config.server.port) {
            throw null;
        }

        return config;
    } catch (error) {
        saveDefaultConfig();
        return defaultConfig;
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