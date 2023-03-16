'use strict';

// child process
const { exec } = require('child_process');

// dialog module
const dialogModule = require('../system/dialog-module');

// download git repo
const downloadGitRepo = require('./download-module');

// correction-module
const { loadJSON_EN } = require('./correction-module-en');
const { loadJSON_JP } = require('./correction-module-jp');

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
    try {
        // delete text
        exec('rmdir /Q /S src\\json\\text', () => {
            // download text
            downloadGitRepo('winw1010/tataru-helper-node-text-v2#main', 'src/json/text', (error) => {
                if (error) {
                    console.log(error);
                    dialogModule.showNotification('對照表下載失敗：' + error);
                } else {
                    dialogModule.showNotification('對照表下載完畢');
                    loadJSON();
                }
            });
        });
    } catch (error) {
        console.log(error);
    }
}

// load json
function loadJSON() {
    const config = configModule.getConfig();
    const languageTo = config.translation.to;

    loadJSON_EN(languageTo);
    loadJSON_JP(languageTo);

    dialogModule.showNotification('對照表讀取完畢');
}

// module exports
module.exports = {
    initializeJSON,
    downloadJSON,
    loadJSON,
};
