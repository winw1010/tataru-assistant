'use strict';

// child process
const { execSync } = require('child_process');

// https
const https = require('https');

// fs
const fs = require('fs');

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

// table URL
const tableURL = 'https://codeload.github.com/winw1010/tataru-helper-node-text-v2/zip/refs/heads/main';

// table name
const tableName = 'table.zip';

// table temp path
const tableTempPath = fileModule.getRootDataPath(tableName);

// table path
const tablePath = fileModule.getRootDataPath('text');

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
function downloadJSON() {
  download(tableURL, tableTempPath, async (file) => {
    file.close();
    console.log('Download Completed. (URL: ' + tableURL + ')');

    if (file.errored) {
      console.log('Download Failed: ' + file.errored.message);
      dialogModule.showNotification('對照表下載失敗: ' + file.errored.message);
    } else {
      deleteTable();
      await decompress(tableTempPath, tablePath, { strip: 1 });
      fileModule.unlink(tableTempPath);
      dialogModule.showNotification('對照表下載完畢');
    }

    loadJSON();
  });
}

// download
function download(URL = '', disc = '', callback = function () {}) {
  const file = fs.createWriteStream(disc);
  https.get(URL, function (response) {
    response.pipe(file);

    // after download completed close filestream
    file.on('finish', () => {
      callback(file);
    });
  });
}

// delete table
function deleteTable() {
  try {
    execSync(`rmdir /Q /S ${tablePath}`);
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
  dialogModule.showNotification('對照表讀取完畢');
  fixEntry.setRunning(true);

  // start sharlayan reader
  if (firstTime) {
    firstTime = false;
    sharlayanModule.start();
  }
}

// get array
function getArray(language = '', type = '', name = '') {
  let array = [];

  if (language === 'jp') {
    if (type === 'ch') {
      array = jpJson.getChArray()[name];
    } else {
      array = jpJson.getJpArray()[name];
    }
  } else if (language === 'en') {
    if (type === 'ch') {
      array = enJson.getChArray()[name];
    } else {
      array = enJson.getEnArray()[name];
    }
  }

  return array || [];
}

// module exports
module.exports = {
  initializeJSON,
  downloadJSON,
  loadJSON,
  getArray,
};
