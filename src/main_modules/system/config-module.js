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
        type: 'tesseract',
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
        scu: '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
        userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    },
};

// current config
let currentConfig = getDefaultConfig();

// load config
function loadConfig() {
    try {
        currentConfig = fileModule.jsonReader(configLocation, false);

        // fix old bug
        if (Array.isArray(currentConfig) || Object.getOwnPropertyNames(currentConfig).length === 0) {
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

        // fix property
        // translator
        if (!['Youdao', 'Baidu', 'Caiyun', 'Papago', 'DeepL'].includes(currentConfig.translation.engine)) {
            currentConfig.translation.engine = 'Youdao';
        }

        // text detect
        if (!['tesseract', 'google'].includes(currentConfig.captureWindow.type)) {
            currentConfig.captureWindow.type = 'tesseract';
        }

        currentConfig.system.firstTime = false;
    } catch (error) {
        console.log(error);
        currentConfig = getDefaultConfig();
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
    return JSON.parse(JSON.stringify(currentConfig));
}

// set config
function setConfig(newConfig) {
    currentConfig = newConfig;
}

// get default config
function getDefaultConfig() {
    return JSON.parse(JSON.stringify(defaultConfig));
}

// set default config
function setDefaultConfig() {
    currentConfig = getDefaultConfig();
}

// module exports
module.exports = {
    loadConfig,
    saveConfig,
    getConfig,
    setConfig,
    getDefaultConfig,
    setDefaultConfig,
};
