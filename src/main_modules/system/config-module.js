'use strict';

// file module
const fileModule = require('./file-module');

// config location
const configLocation = fileModule.getUserDataPath('setting', 'config.json');

// default config
const defaultConfig = {
    server: {
        host: 'localhost',
        port: 8898,
    },
    indexWindow: {
        x: null,
        y: null,
        width: null,
        height: null,
        alwaysOnTop: true,
        focusable: true,
        shortcut: true,
        hideButton: true,
        hideDialog: true,
        hideDialogTimeout: 30,
        backgroundColor: '#00000034',
    },
    dialog: {
        weight: 'normal',
        fontSize: '1.1',
        spacing: '1',
        radius: '0',
        backgroundColor: '#000000A0',
    },
    captureWindow: {
        x: null,
        y: null,
        width: null,
        height: null,
        type: 'standard',
        split: true,
        edit: false,
    },
    channel: {
        FFFF: '#CCCCCC',
        '0039': '#CCCCCC',
        '0839': '#CCCCCC',
        '003D': '#ABD647',
        '0044': '#ABD647',
        '2AB9': '#ABD647',
    },
    translation: {
        autoChange: true,
        autoPlay: false,
        fix: true,
        skip: true,
        skipChinese: true,
        replace: true,
        engine: 'Youdao',
        from: 'Japanese',
        fromPlayer: 'Japanese',
        to: 'Traditional-Chinese',
    },
    system: {
        autoDownloadJson: true,
        firstTime: true,
    },
};

// current config
let currentConfig = defaultConfig;

// load config
function loadConfig() {
    try {
        currentConfig = fileModule.jsonReader(configLocation, false);

        // fix old bug
        if (Array.isArray(currentConfig)) {
            throw null;
        }

        const mainNames = Object.getOwnPropertyNames(defaultConfig);
        mainNames.forEach((mainName) => {
            if (currentConfig[mainName]) {
                // skip checking when value is channel
                if (mainName === 'channel') {
                    return;
                }

                // add property
                const subNames = Object.getOwnPropertyNames(defaultConfig[mainName]);
                subNames.forEach((subName) => {
                    if (currentConfig[mainName][subName] === null || currentConfig[mainName][subName] === undefined) {
                        currentConfig[mainName][subName] = defaultConfig[mainName][subName];
                    }
                });

                // delete redundant property
                const subNames2 = Object.getOwnPropertyNames(currentConfig[mainName]);
                if (subNames.length !== subNames2.length) {
                    subNames2.forEach((subName) => {
                        if (
                            defaultConfig[mainName][subName] === null ||
                            defaultConfig[mainName][subName] === undefined
                        ) {
                            delete currentConfig[mainName][subName];
                        }
                    });
                }
            } else {
                currentConfig[mainName] = defaultConfig[mainName];
            }
        });

        // adjust property
        if (currentConfig.translation.engine === 'Google') {
            currentConfig.translation.engine = 'Youdao';
        }

        if (currentConfig.captureWindow.type !== 'google') {
            currentConfig.captureWindow.type = 'tesseract';
        }

        currentConfig.system.firstTime = false;
    } catch (error) {
        console.log(error);
        currentConfig = defaultConfig;
    }

    return currentConfig;
}

// save config
function saveConfig() {
    try {
        fileModule.jsonWriter(configLocation, currentConfig);
    } catch (error) {
        console.log(error);
    }
}

// get config
function getConfig() {
    return currentConfig;
}

// set config
function setConfig(newConfig) {
    currentConfig = newConfig;
}

// set default config
function setDefaultConfig() {
    currentConfig = defaultConfig;
}

// module exports
module.exports = {
    loadConfig,
    saveConfig,
    getConfig,
    setConfig,
    setDefaultConfig,
};
