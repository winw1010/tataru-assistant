'use strict';

// file module
const fileModule = require('./file-module');

// engine module
const engineModule = require('./engine-module');

// config location
const configLocation = fileModule.getUserDataPath('setting', 'config.json');

// default config
const defaultConfig = {
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
    minSize: true,
    hideDialogTimeout: '30',
    backgroundColor: '#00000034',
    clickThrough: false,
    lock: false,
  },
  dialog: {
    weight: 'normal',
    fontSize: '1',
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
    firstTime: true,
    appLanguage: 'Traditional-Chinese',
    autoDownloadJson: true,
    gptModel: 'please-select-gpt-model',
    gptApiKey: '',
    UnofficialApi: false,
    unofficialApiUrl: 'https://api.openai.com/v1',
    sslCertificate: true,
    scu: '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  },
};

// current config
let currentConfig = getDefaultConfig();

// load config
function loadConfig() {
  try {
    currentConfig = fileModule.read(configLocation, 'json') || {};

    // fix old bug
    if (Array.isArray(currentConfig) || Object.getOwnPropertyNames(currentConfig).length === 0) {
      throw null;
    }

    const mainNames = Object.getOwnPropertyNames(defaultConfig);
    mainNames.forEach((mainName) => {
      if (
        typeof currentConfig[mainName] === 'undefined' ||
        typeof currentConfig[mainName] !== typeof defaultConfig[mainName]
      ) {
        currentConfig[mainName] = defaultConfig[mainName];
      } else {
        // skip checking when value is channel
        if (mainName === 'channel') {
          return;
        }

        // add property
        const subNames = Object.getOwnPropertyNames(defaultConfig[mainName]);
        subNames.forEach((subName) => {
          if (
            typeof currentConfig[mainName][subName] === 'undefined' ||
            typeof currentConfig[mainName][subName] !== typeof defaultConfig[mainName][subName]
          ) {
            if (!['x', 'y', 'width', 'height'].includes(subName)) {
              currentConfig[mainName][subName] = defaultConfig[mainName][subName];
            }
          }
        });

        // delete redundant property
        const subNames2 = Object.getOwnPropertyNames(currentConfig[mainName]);
        if (subNames.length !== subNames2.length) {
          subNames2.forEach((subName) => {
            if (typeof defaultConfig[mainName][subName] === 'undefined') {
              delete currentConfig[mainName][subName];
            }
          });
        }
      }
    });

    // fix translator
    if (!engineModule.engineList.includes(currentConfig.translation.engine)) {
      currentConfig.translation.engine = defaultConfig.translation.engine;
    }

    // fix source
    if (!engineModule.sourceList.includes(currentConfig.translation.from)) {
      currentConfig.translation.from = defaultConfig.translation.from;
    }

    // fix target
    if (!engineModule.targetList.includes(currentConfig.translation.to)) {
      currentConfig.translation.to = defaultConfig.translation.to;
    }

    // fix text detect
    if (!['tesseract', 'google'].includes(currentConfig.captureWindow.type)) {
      currentConfig.captureWindow.type = 'tesseract';
    }

    // fix GPT model
    if (currentConfig.system.gptModel === '3') {
      currentConfig.system.gptModel = 'gpt-3.5-turbo';
    } else if (currentConfig.system.gptModel === '4') {
      currentConfig.system.gptModel = 'gpt-4';
    }

    // set first time off
    currentConfig.system.firstTime = false;
  } catch (error) {
    console.log(error);
    currentConfig = getDefaultConfig();
  }

  setSSLCertificate();
  saveConfig();
  return currentConfig;
}

// save config
function saveConfig() {
  try {
    fileModule.write(configLocation, currentConfig, 'json');
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
  setSSLCertificate();
  saveConfig();
}

// get default config
function getDefaultConfig() {
  return JSON.parse(JSON.stringify(defaultConfig));
}

// set default config
function setDefaultConfig() {
  currentConfig = getDefaultConfig();
  setSSLCertificate();
}

// set SSL certificate
function setSSLCertificate() {
  if (currentConfig.system.sslCertificate) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;
  } else {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  }
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
