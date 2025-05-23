'use strict';

// electron
const { app } = require('electron');

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
    focusable: true,
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
    skipChinese: true,
    replace: true,
    engine: 'Youdao',
    from: 'Japanese',
    fromPlayer: 'Auto',
    to: 'Traditional-Chinese',
  },
  api: {
    googleVisionType: 'google-api-key',
    googleVisionApiKey: '',
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash',
    gptApiKey: '',
    gptModel: 'gpt-4o-mini-2024-07-18',
    cohereToken: '',
    cohereModel: 'command-r',
    kimiToken: '',
    kimiModel: 'moonshot-v1-8k',
    kimiCustomPrompt: '',
    llmApiUrl: '',
    llmApiKey: '',
    llmApiModel: '',
  },
  ai: {
    useChat: false,
    chatLength: '0',
    temperature: '0.7',
  },
  proxy: {
    enable: false,
    protocol: 'http:',
    hostname: '',
    port: '',
    username: '',
    password: '',
  },
  system: {
    firstTime: true,
    appLanguage: '',
    autoDownloadJson: true,
    sslCertificate: true,
  },
};

// current config
let currentConfig = getDefaultConfig();

// load config
function loadConfig() {
  try {
    currentConfig = fileModule.read(configLocation, 'json');

    // fix old bug
    if (
      typeof currentConfig !== 'object' ||
      currentConfig === null ||
      Array.isArray(currentConfig) ||
      (typeof currentConfig === 'object' && Object.keys(currentConfig).length === 0)
    ) {
      throw 'Use default config.';
    }

    // fix config 1
    fixConfig1(currentConfig);

    // fix options
    const mainNames = Object.keys(defaultConfig);
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
        const subNames = Object.keys(defaultConfig[mainName]);
        subNames.forEach((subName) => {
          if (
            typeof currentConfig[mainName][subName] === 'undefined' ||
            typeof currentConfig[mainName][subName] !== typeof defaultConfig[mainName][subName]
          ) {
            currentConfig[mainName][subName] = defaultConfig[mainName][subName];
          }
        });

        // delete redundant property
        const subNames2 = Object.keys(currentConfig[mainName]);
        if (subNames.length !== subNames2.length) {
          subNames2.forEach((subName) => {
            if (typeof defaultConfig[mainName][subName] === 'undefined') {
              delete currentConfig[mainName][subName];
            }
          });
        }
      }
    });

    // fix config 2
    fixConfig2(currentConfig);

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
  setAppLanguage();
}

// set SSL certificate
function setSSLCertificate() {
  if (currentConfig.system.sslCertificate) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;
  } else {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  }
}

// fix config 1
function fixConfig1(config) {
  try {
    // fix custom API
    if (config?.api?.unofficialApi) {
      // set LLM API
      config.translation.engine = 'LLM-API';
      config.api.llmApiUrl = config.api.unofficialApiUrl.replace(/\/$/, '') + '/chat/completions';
      config.api.llmApiKey = config.api.gptApiKey;
      config.api.llmApiModel = config.api.gptModel;

      // reset GPT
      config.api.gptApiKey = '';
      config.api.gptModel = '';
    }
  } catch (error) {
    error;
  }

  try {
    // fix protocol
    if (config.proxy.protocol !== '') {
      if (config.proxy.protocol.includes('https')) {
        config.proxy.protocol = 'https:';
      } else {
        config.proxy.protocol = 'http:';
      }
    }
  } catch (error) {
    error;
  }

  try {
    // fix hostname
    if (config.proxy.host) {
      config.proxy.hostname = config.proxy.host;
    }
  } catch (error) {
    error;
  }
}

// fix config 2
function fixConfig2(config) {
  try {
    // fix engine
    if (!engineModule.engineList.includes(config.translation.engine)) {
      config.translation.engine = defaultConfig.translation.engine;
    }
  } catch (error) {
    error;
  }

  try {
    // fix source
    if (!engineModule.sourceList.includes(config.translation.from)) {
      config.translation.from = defaultConfig.translation.from;
    }
  } catch (error) {
    error;
  }

  try {
    // fix player
    if (!engineModule.sourceList.includes(config.translation.fromPlayer)) {
      config.translation.fromPlayer = defaultConfig.translation.fromPlayer;
    }
  } catch (error) {
    error;
  }

  try {
    // fix target
    if (!engineModule.targetList.includes(config.translation.to)) {
      config.translation.to = defaultConfig.translation.to;
    }
  } catch (error) {
    error;
  }

  try {
    // fix text detect
    if (!engineModule.visionList.includes(config.captureWindow.type)) {
      if (config.captureWindow.type === 'google') {
        config.captureWindow.type = 'google-vision';
      } else {
        config.captureWindow.type = 'tesseract-ocr';
      }
    }
  } catch (error) {
    error;
  }

  try {
    // fix engine
    const googleJsonPath = fileModule.getUserDataPath('config', 'google-credential.json');
    const googleJsonPathNew = fileModule.getUserDataPath('config', 'google-vision-credential.json');
    if (fileModule.exists(googleJsonPath)) {
      const googleJson = fileModule.read(googleJsonPath, 'json');
      fileModule.write(googleJsonPathNew, googleJson, 'json');
      fileModule.unlink(googleJsonPath);
      currentConfig.api.googleVisionType = 'google-json';
    }
  } catch (error) {
    error;
  }
}

// set app language
function setAppLanguage() {
  const config = getConfig();
  const locale = app.getSystemLocale(); //Intl.DateTimeFormat().resolvedOptions().locale;

  if (/zh-(TW|HK|MO|CHT|Hant)/i.test(locale)) {
    config.translation.to = engineModule.languageEnum.zht;
    config.system.appLanguage = 'app-zht';
  } else if (/zh-(CN|CHS|Hans)/i.test(locale)) {
    config.translation.to = engineModule.languageEnum.zhs;
    config.system.appLanguage = 'app-zhs';
  } else {
    config.translation.to = engineModule.languageEnum.en;
    config.system.appLanguage = 'app-en';
  }

  setConfig(config);
}

// module exports
module.exports = {
  loadConfig,
  saveConfig,
  getConfig,
  setConfig,
  getDefaultConfig,
  setDefaultConfig,
  setAppLanguage,
};
