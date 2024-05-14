'use strict';

// file module
const fileModule = require('./file-module');

// engine module
const engineModule = require('./engine-module');

// config location
const configLocation = fileModule.getUserDataPath('config', 'config.json');

// default config
const defaultConfig = {
  indexWindow: {
    x: -1,
    y: -1,
    width: -1,
    height: -1,
    alwaysOnTop: true,
    shortcut: true,
    hideButton: true,
    hideDialog: true,
    minSize: true,
    hideDialogTimeout: '15',
    backgroundColor: '#00000034',
    clickThrough: false,
    lock: false,
    speech: false,
    speechSpeed: '1',
  },
  dialog: {
    weight: 'normal',
    fontSize: '1',
    spacing: '1',
    radius: '0',
    backgroundColor: '#000000A0',
  },
  captureWindow: {
    x: -1,
    y: -1,
    width: -1,
    height: -1,
    type: 'tesseract-ocr',
    split: true,
    edit: true,
  },
  channel: {
    '0039': '#CCCCCC',
    '0839': '#CCCCCC',
    '003D': '#ABD647',
    '0044': '#ABD647',
    '2AB9': '#ABD647',
  },
  translation: {
    autoChange: true,
    fix: true,
    skip: true,
    skipChinese: false,
    replace: true,
    engine: 'Youdao',
    from: 'Japanese',
    fromPlayer: 'Japanese',
    to: 'Traditional-Chinese',
  },
  api: {
    geminiApiKey: '',
    cohereToken: '',
    gptApiKey: '',
    gptModel: '',
    unofficialApi: false,
    unofficialApiUrl: 'https://api.openai.com/v1',
  },
  system: {
    firstTime: true,
    appLanguage: 'Traditional-Chinese',
    autoDownloadJson: true,
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
    if (currentConfig === null || typeof currentConfig !== typeof defaultConfig || Array.isArray(currentConfig)) {
      throw 'Incorrect config type';
    }

    const mainNames = Object.getOwnPropertyNames(defaultConfig);
    mainNames.forEach((mainName) => {
      if (
        typeof currentConfig[mainName] === 'undefined' ||
        typeof currentConfig[mainName] !== typeof defaultConfig[mainName] ||
        Array.isArray(currentConfig[mainName])
      ) {
        currentConfig[mainName] = defaultConfig[mainName];
      } else {
        // skip channel
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
            currentConfig[mainName][subName] = defaultConfig[mainName][subName];
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

    // fix engine
    if (!engineModule.engineList.includes(currentConfig.translation.engine)) {
      currentConfig.translation.engine = defaultConfig.translation.engine;
    }

    // fix source
    if (!engineModule.sourceList.includes(currentConfig.translation.from)) {
      currentConfig.translation.from = defaultConfig.translation.from;
    }

    // fix player
    if (!engineModule.sourceList.includes(currentConfig.translation.fromPlayer)) {
      currentConfig.translation.fromPlayer = defaultConfig.translation.fromPlayer;
    }

    // fix target
    if (!engineModule.targetList.includes(currentConfig.translation.to)) {
      currentConfig.translation.to = defaultConfig.translation.to;
    }

    // fix app language
    if (!engineModule.uiList.includes(currentConfig.system.appLanguage)) {
      currentConfig.system.appLanguage = defaultConfig.system.appLanguage;
    }

    // fix text detect
    if (!['tesseract-ocr', 'google-vision'].includes(currentConfig.captureWindow.type)) {
      if (currentConfig.captureWindow.type === 'google') {
        currentConfig.captureWindow.type = 'google-vision';
      } else {
        currentConfig.captureWindow.type = 'tesseract-ocr';
      }
    }

    // fix GPT model
    if (currentConfig.api.gptModel === '3') {
      currentConfig.api.gptModel = 'gpt-3.5-turbo';
    } else if (currentConfig.api.gptModel === '4') {
      currentConfig.api.gptModel = 'gpt-4-turbo';
    } else if (!/gpt-\d+(\.\d+)?(-turbo)?(-preview)?$/i.test(currentConfig.api.gptModel)) {
      currentConfig.api.gptModel = '';
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
