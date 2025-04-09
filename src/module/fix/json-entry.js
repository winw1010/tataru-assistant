'use strict';

// downloader
const { Downloader } = require('nodejs-file-downloader');

// https
// const https = require('https');

// fs
// const fs = require('fs');

// decompress
const decompress = require('decompress');

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
  /*
  const tempTableStream = fs.createWriteStream(filePath);
  const config = configModule.getConfig();
  const requestOptions = config.proxy.enable
    ? {
        protocol: config.proxy.protocol,
        host: config.proxy.hostname,
        port: parseInt(config.proxy.port),
        username: config.proxy.username,
        password: config.proxy.password,
        path: textURL,
      }
    : textURL;

  https
    .get(requestOptions)
    .on('response', (response) => {
      // pipe to table temp stream
      response.pipe(tempTableStream);

      // after download completed close filestream
      tempTableStream.on('finish', async () => {
        tempTableStream.close();
        console.log('Download Completed. (URL: ' + textURL + ')');

        if (tempTableStream.errored) {
          console.log('Download Failed: ' + tempTableStream.errored.message);
          dialogModule.addNotification(tempTableStream.errored.message);
        } else {         
          fileModule.rmdir(textPath);
          await decompress(filePath, textPath, { strip: 1 });
          fileModule.unlink(filePath);
          dialogModule.addNotification('DOWNLOAD_COMPLETED');
        }

        loadJSON();
      });
    })
    .on('error', (e) => {
      console.error(e);
      dialogModule.addNotification(e.message);
      loadJSON();
    });
  */

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

      // decompress new text files
      await decompress(filePath, textPath, { strip: 1 });
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
