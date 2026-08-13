'use strict';

// downloader
const { Downloader } = require('nodejs-file-downloader');

// https
// const https = require('https');

// fs
// const fs = require('fs');

// node-stream-zip
const StreamZip = require('node-stream-zip');

// en json
const enJson = require('./en-json');

// jp json
const jpJson = require('./jp-json');

// fix entry
const fixEntry = require('./fix-entry');

// config module
const configModule = require('../system/config-module');

// dialog module
const dialogModule = require('../system/dialog-module');

// file module
const fileModule = require('../system/file-module');

// sharlayan module
const sharlayanModule = require('../system/sharlayan-module');

// text URL
const textURL = 'https://codeload.github.com/winw1010/tataru-assistant-text/zip/refs/heads/main';

// data path
const dataPath = fileModule.getRootDataPath();

// text path
const textPath = fileModule.getRootDataPath('text');

// file path
// const filePath = fileModule.getRootDataPath('text', 'text.zip');

// first time
let firstTime = true;

// initialize json
function initializeJSON() {
  const config = configModule.getConfig();

  if (config.system.autoDownloadJson) {
    downloadJSON();
  } else {
    loadJSON();
  }
}

// download json
async function downloadJSON() {
  const downloaderConfig = {
    url: textURL,
    directory: dataPath,
    fileName: 'text.zip',
  };

  const proxyString = getProxyString();

  if (proxyString !== '') {
    downloaderConfig.proxy = proxyString;
  }

  const downloader = new Downloader(downloaderConfig);

  try {
    const { filePath, downloadStatus } = await downloader.download();
    console.log('All done');

    if (downloadStatus === 'COMPLETE') {
      // delete old text files
      fileModule.rmdir(textPath);
      fileModule.mkdir(textPath);

      // extract new text files
      const zip = new StreamZip.async({ file: filePath });
      await zip.extract('tataru-assistant-text-main', textPath);
      await zip.close();

      // delete zip file
      fileModule.unlink(filePath);

      dialogModule.addNotification('DOWNLOAD_COMPLETED');
    }
  } catch (error) {
    console.log('Download failed', error);
    dialogModule.addNotification(error);
  }

  loadJSON();
}

// get proxy string
function getProxyString() {
  const config = configModule.getConfig();
  let proxyString = '';

  if (config.proxy.enable) {
    proxyString += config.proxy.protocol + '//';

    if (config.proxy.username && config.proxy.password) {
      proxyString += config.proxy.username + ':' + config.proxy.password + '@';
    }

    proxyString += config.proxy.hostname + ':' + config.proxy.port;
  }

  return proxyString;
}

// load json
function loadJSON() {
  fixEntry.setRunning(false);
  const config = configModule.getConfig();
  const targetLanguage = config.translation.to;
  enJson.load(targetLanguage);
  jpJson.load(targetLanguage);
  dialogModule.addNotification('LOAD_COMPLETED');
  fixEntry.setRunning(true);

  // start sharlayan reader
  if (firstTime) {
    firstTime = false;
    sharlayanModule.start();
  }
}

// get array
function getUserArray(arrayName = '') {
  let array = jpJson.getUserArray()[arrayName];
  return array || [];
}

// module exports
module.exports = {
  initializeJSON,
  downloadJSON,
  loadJSON,
  getUserArray,
};
