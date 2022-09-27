'use strict';

// file module
const fm = require('./file-module');

// config location
const configLocation = fm.getUserDataPath('setting', 'config.json');

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
        hideButton: true,
        hideDialog: true,
        hideDialogTimeout: 30,
        backgroundColor: '#20202050',
    },
    dialog: {
        weight: 'normal',
        fontSize: '1.1',
        spacing: '1',
        radius: '0',
        backgroundColor: '#202020A0',
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

// load config
function loadConfig() {
    try {
        let config = fm.jsonReader(configLocation, false);

        // fix old bug
        if (Array.isArray(config)) {
            throw null;
        }

        const mainNames = Object.getOwnPropertyNames(defaultConfig);
        mainNames.forEach((mainName) => {
            if (config[mainName]) {
                // skip checking when value is channel
                if (mainName === 'channel') {
                    return;
                }

                // add property
                const subNames = Object.getOwnPropertyNames(defaultConfig[mainName]);
                subNames.forEach((subName) => {
                    if (config[mainName][subName] === null || config[mainName][subName] === undefined) {
                        config[mainName][subName] = defaultConfig[mainName][subName];
                    }
                });

                // delete redundant property
                const subNames2 = Object.getOwnPropertyNames(config[mainName]);
                if (subNames.length !== subNames2.length) {
                    subNames2.forEach((subName) => {
                        if (
                            defaultConfig[mainName][subName] === null ||
                            defaultConfig[mainName][subName] === undefined
                        ) {
                            delete config[mainName][subName];
                        }
                    });
                }
            } else {
                config[mainName] = defaultConfig[mainName];
            }
        });

        // adjust property
        if (config.translation.engine === 'Google') {
            config.translation.engine = 'Youdao';
        }

        config.system.firstTime = false;

        return config;
    } catch (error) {
        saveDefaultConfig();
        return defaultConfig;
    }
}

// save config
function saveConfig(config) {
    try {
        fm.jsonWriter(configLocation, config);
    } catch (error) {
        console.log(error);
    }
}

// get default config
function getDefaultConfig() {
    return defaultConfig;
}

// save default config
function saveDefaultConfig() {
    try {
        fm.jsonWriter(configLocation, defaultConfig);
    } catch (error) {
        console.log(error);
    }
}

// exports
module.exports = {
    loadConfig,
    saveConfig,
    getDefaultConfig,
};
