'use strict';

// child process
const { execSync } = require('child_process');

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

// temp table path
// const tempTablePath = fileModule.getRootDataPath('tempTable.zip');

// data path
const dataPath = fileModule.getRootDataPath();

// text path
const textPath = fileModule.getRootDataPath('text');

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
  const tempTableStream = fs.createWriteStream(tempTablePath);
  const config = configModule.getConfig();
  const proxyAuth = config.proxy.username && config.proxy.password;
  const requestOption = config?.proxy?.enable
    ? {
        protocol: config.proxy.protocol + ':',
        host: config.proxy.host,
        port: parseInt(config.proxy.port),
        username: proxyAuth ? config.proxy.username : undefined,
        password: proxyAuth ? config.proxy.password : undefined,
        path: tableURL,
      }
    : tableURL;

  https
    .get(requestOption)
    .on('response', (response) => {
      // pipe to table temp stream
      response.pipe(tempTableStream);

      // after download completed close filestream
      tempTableStream.on('finish', async () => {
        tempTableStream.close();
        console.log('Download Completed. (URL: ' + tableURL + ')');

        if (tempTableStream.errored) {
          console.log('Download Failed: ' + tempTableStream.errored.message);
          dialogModule.addNotification(tempTableStream.errored.message);
        } else {
          deleteTable();
          await decompress(tempTablePath, tablePath, { strip: 1 });
          fileModule.unlink(tempTablePath);
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

  const proxyOption = getProxyOption();
  const downloader = new Downloader({
    ...proxyOption,
    url: textURL,
    directory: dataPath,
    fileName: 'text.zip',
  });

  try {
    const { filePath, downloadStatus } = await downloader.download();
    console.log('All done');

    if (downloadStatus === 'COMPLETE') {
      deleteTable();
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
function getProxyOption() {
  const config = configModule.getConfig();
  const proxyAuth = config.proxy.username && config.proxy.password;
  const proxyOption = {};

  if (config?.proxy?.enable) {
    proxyOption.proxy = `${config.proxy.protocol}://`;

    if (proxyAuth) {
      proxyOption.proxy += `${config.proxy.username}:${config.proxy.password}@`;
    }

    proxyOption.proxy += `${config.proxy.host}:${config.proxy.port}`;
  }

  return proxyOption;
}

// delete table
function deleteTable() {
  try {
    execSync(`rmdir /Q /S ${textPath}`);
  } catch (error) {
    //console.log(error);
  }
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
