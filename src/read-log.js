'use strict';

// child process
const { exec } = require('child_process');

// fs
const { readdirSync } = require('fs');

// file module
const fm = require('./main_modules/file-module');

// communicate with main process
const { ipcRenderer } = require('electron');

// drag module
const { setDragElement } = require('./renderer_modules/drag-module');

// ui module
const { changeUIText } = require('./renderer_modules/ui-module');

// log location
const logPath = fm.getUserDataPath('log');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setButton();
});

// set view
function setView() {
    readLogList();
    changeUIText();
}

// set button
function setButton() {
    // drag
    setDragElement(document.getElementById('img_button_drag'));

    // read
    document.getElementById('button_read_log').onclick = () => {
        const file = document.getElementById('select_log').value;
        readLog(file);
    };

    // view
    document.getElementById('button_view_log').onclick = () => {
        try {
            exec(`start "" "${logPath}"`);
        } catch (error) {
            console.log(error);
        }
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };
}

function readLogList() {
    try {
        const logs = readdirSync(logPath);

        if (logs.length > 0) {
            const select = document.getElementById('select_log');

            let innerHTML = '';
            for (let index = 0; index < logs.length; index++) {
                const log = logs[index];
                innerHTML += `<option value="${log}">${log}</option>`;
            }

            select.innerHTML = innerHTML;
            select.value = logs[logs.length - 1];
        }
    } catch (error) {
        console.log(error);
    }
}

function readLog(fileName) {
    if (fileName === 'none') {
        ipcRenderer.send('send-index', 'show-notification', '檔案不存在');
        return;
    }

    try {
        const fileLocation = fm.getPath(logPath, fileName);
        const log = fm.jsonReader(fileLocation, false);
        const logNames = Object.getOwnPropertyNames(log);

        if (logNames.length > 0) {
            ipcRenderer.send('send-index', 'clear-dialog');

            for (let index = 0; index < logNames.length; index++) {
                const logElement = log[logNames[index]];

                if (logElement.code !== 'FFFF') {
                    ipcRenderer.send(
                        'send-index',
                        'append-dialog',
                        logElement.id,
                        logElement.code,
                        logElement.translated_name,
                        logElement.translated_text
                    );
                }
            }

            ipcRenderer.send('send-index', 'move-to-bottom');
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法讀取檔案');
    }
}
