'use strict';

// child process
const { exec } = require('child_process');

// en json
const enJson = require('./en-json');

// jp json
const jpJson = require('./jp-json');

// download git
const downloadGit = require('./json-download-git');

// fix entry
const fixEntry = require('./fix-entry');

// dialog module
const dialogModule = require('../system/dialog-module');

// config module
const configModule = require('../system/config-module');

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
    // delete json
    exec('rmdir /Q /S src\\json\\text', (error) => {
        if (error) {
            console.log(error.message);
        } else {
            startDownload();
        }
    });
}

// start download
function startDownload() {
    // download git
    downloadGit('winw1010/tataru-helper-node-text-v2#main', 'src/json/text', (error) => {
        if (error) {
            console.log(error);
            dialogModule.showNotification('對照表下載失敗：' + error);
        } else {
            dialogModule.showNotification('對照表下載完畢');
            loadJSON();
        }
    });
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
}

// module exports
module.exports = {
    initializeJSON,
    downloadJSON,
    loadJSON,
};
