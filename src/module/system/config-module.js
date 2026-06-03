'use strict';

// child process
const { exec } = require('child_process');

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
    shortcut: true,
    alwaysOnTop: true,
    focusable: true,
    minSize: false,
    hideButton: true,
    hideDialog: true,
    timeout: '15',
    backgroundColor: '#00000020',
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
    backgroundColor: '#000000d0',
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
    engineAlternate: 'Youdao',
    from: 'Japanese',
    fromPlayer: 'Auto',
    to: 'Traditional-Chinese',
    timeout: '10',
  },
  api: {
    googleVisionType: 'google-api-key',
    googleVisionApiKey: '',
    geminiApiKey: '',
    geminiModel: 'gemini-3.1-flash-lite',
    gptApiKey: '',
    gptModel: 'gpt-5.4-nano',
    cohereToken: '',
    cohereModel: 'command-a-03-2025',
    kimiToken: '',
    kimiModel: 'kimi-k2.5',
    llmApiUrl: 'https://api.openai.com/v1/chat/completions',
    llmApiHeader: '{"Content-Type":"application/json","Authorization":"Bearer [Your API Key]"}',
    llmApiPayload:
      '{"model":"[Your API Model]","messages":[{"role":"system","content":"${prompt}"},{"role":"user","content":"${user-content-sample}"},{"role":"assistant","content":"${assistant-content-sample}"},{},{"role":"user","content":"${user-content}"}]}',
    llmApiResponseLocation: 'choices.0.message.content',
    llmApiUserFormat: '{"role":"user","content":"${user-content}"}',
    llmApiAssistantFormat: '{"role":"assistant","content":"${assistant-content}"}',
  },
  ai: {
    useChat: true,
    chatLength: '3',
    useCustomTranslationPrompt: false,
    customTranslationPrompt: '',
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

// temp config
let tempConfig = getDefaultConfig();

// load config
function loadConfig() {
  try {
    currentConfig = fileModule.read(configLocation, 'json');
    tempConfig = JSON.parse(JSON.stringify(currentConfig));

    // fix old bug
    if (
      typeof currentConfig !== 'object' ||
      currentConfig === null ||
      Array.isArray(currentConfig) ||
      (typeof currentConfig === 'object' && Object.keys(currentConfig).length === 0)
    ) {
      throw 'Use default config.';
    }

    // fix options
    const mainNames = Object.keys(defaultConfig);
    mainNames.forEach((mainName) => {
      if (typeof currentConfig[mainName] !== typeof defaultConfig[mainName] || Array.isArray(currentConfig[mainName])) {
        // fix main object
        currentConfig[mainName] = defaultConfig[mainName];
      } else {
        // fix sub object

        // skip channel
        if (mainName === 'channel') {
          return;
        }

        // add property
        const subNames = Object.keys(defaultConfig[mainName]);
        subNames.forEach((subName) => {
          if (typeof currentConfig[mainName][subName] !== typeof defaultConfig[mainName][subName]) {
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
    fixConfig(currentConfig);

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

// fix config
function fixConfig(config) {
  // fix window position
  try {
    config.indexWindow.x = parseInt(tempConfig.indexWindow.x);
    config.indexWindow.y = parseInt(tempConfig.indexWindow.y);
    config.indexWindow.width = parseInt(tempConfig.indexWindow.width);
    config.indexWindow.height = parseInt(tempConfig.indexWindow.height);

    config.captureWindow.x = parseInt(tempConfig.captureWindow.x);
    config.captureWindow.y = parseInt(tempConfig.captureWindow.y);
    config.captureWindow.width = parseInt(tempConfig.captureWindow.width);
    config.captureWindow.height = parseInt(tempConfig.captureWindow.height);
  } catch (error) {
    error;
  }

  // fix LLM header
  try {
    if (tempConfig.api.llmApiKey) {
      config.api.llmApiHeader = config.api.llmApiHeader.replace('[Your API Key]', tempConfig.api.llmApiKey);
    }
  } catch (error) {
    error;
  }

  // fix LLM payload
  try {
    if (tempConfig.api.llmApiModel) {
      config.api.llmApiPayload = config.api.llmApiPayload.replace('[Your API Model]', tempConfig.api.llmApiModel);
    }
  } catch (error) {
    error;
  }

  try {
    // fix chat length
    if (config.ai.chatLength < 1) {
      config.ai.chatLength = 1;
    }
  } catch (error) {
    error;
  }

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
    // fix google vision
    const googleJsonPath = fileModule.getUserDataPath('config', 'google-credential.json');
    const googleJsonPathNew = fileModule.getUserDataPath('config', 'google-vision-credential.json');
    if (fileModule.exists(googleJsonPath)) {
      const googleJson = fileModule.read(googleJsonPath, 'json');
      fileModule.write(googleJsonPathNew, googleJson, 'json');
      fileModule.unlink(googleJsonPath);
      config.api.googleVisionType = 'google-json';
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

// open readme
function openReadme() {
  switch (currentConfig.system.appLanguage) {
    case 'app-zht':
      exec(`explorer "${fileModule.getRootPath('src', 'data', 'text', 'readme', 'html', 'cht', 'index.html')}"`);
      break;

    case 'app-zhs':
      exec(`explorer "${fileModule.getRootPath('src', 'data', 'text', 'readme', 'html', 'chs', 'index.html')}"`);
      break;

    default:
      exec(`explorer "${fileModule.getRootPath('src', 'data', 'text', 'readme', 'html', 'eng', 'index.html')}"`);
      break;
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
  setAppLanguage,
  openReadme,
};
