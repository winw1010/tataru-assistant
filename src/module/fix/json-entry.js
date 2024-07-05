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
const tableURL = 'https://codeload.github.com/winw1010/tataru-assistant-text/zip/refs/heads/main';

// temp table path
const tempTablePath = fileModule.getRootDataPath('tempTable.zip');

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
  const tempTableStream = fs.createWriteStream(tempTablePath);
  https
    .get(tableURL)
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
