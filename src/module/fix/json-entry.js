'use strict';

// child process
const { execSync } = require('child_process');

// en json
const enJson = require('./en-json');

// jp json
const jpJson = require('./jp-json');

// download git
const downloadGit = require('./json-download-git');

// fix entry
const fixEntry = require('./fix-entry');

// config module
const configModule = require('../system/config-module');

// dialog module
const dialogModule = require('../system/dialog-module');

// sharlayan module
const sharlayanModule = require('../system/sharlayan-module');

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
    deleteText('text2');
    downloadGit('winw1010/tataru-helper-node-text-v2#main', 'src/json/text2', (error) => {
        if (error) {
            dialogModule.showNotification('對照表下載失敗：' + error);
            console.log(error);
        } else {
            dialogModule.showNotification('對照表下載完畢');
            deleteText('text');
            moveText();
        }

        loadJSON();
    });
}

// delete text
function deleteText(dir) {
    try {
        execSync(`rmdir /Q /S src\\json\\${dir}`);
    } catch (error) {
        //console.log(error);
    }
}

// move text
function moveText() {
    try {
        execSync('move src\\json\\text2 src\\json\\text');
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

// module exports
module.exports = {
    initializeJSON,
    downloadJSON,
    loadJSON,
};
