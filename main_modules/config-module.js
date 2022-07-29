'use strict';

//fs
const { readFileSync, writeFileSync } = require('fs');

// config location
const configLocation = process.env.USERPROFILE + '\\Documents\\Tataru Helper Node\\setting\\config.json';

// default config
const defaultConfig = {
    server: {
        host: 'localhost',
        port: 8898,
    },
    indexWindow: {
        x: -1,
        y: -1,
        width: -1,
        height: -1,
        alwaysOnTop: true,
        advance: true,
        hideButton: true,
        hideDialog: true,
        hideDialogTimeout: 20,
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
        x: -1,
        y: -1,
        width: -1,
        height: -1,
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
        replace: true,
        engine: 'Youdao',
        from: 'Japanese',
        fromPlayer: 'Japanese',
        to: 'Traditional-Chinese',
    },
    system: {
        autoDownloadJson: true,
    },
};

function loadConfig() {
    try {
        const config = JSON.parse(readFileSync(configLocation));
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

        return config;
    } catch (error) {
        saveDefaultConfig();
        return defaultConfig;
    }
}

function saveConfig(config) {
    try {
        writeFileSync(configLocation, JSON.stringify(config, null, '\t'));
    } catch (error) {
        console.log(error);
    }
}

function getDefaultConfig() {
    return defaultConfig;
}

function saveDefaultConfig() {
    try {
        writeFileSync(configLocation, JSON.stringify(defaultConfig, null, '\t'));
    } catch (error) {
        console.log(error);
    }
}

exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.getDefaultConfig = getDefaultConfig;
