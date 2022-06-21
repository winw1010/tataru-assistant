'use strict';

// child process
const { execSync } = require('child_process');

// fs
const { readFileSync, readdirSync } = require('fs');

// communicate with main process
const { ipcRenderer } = require('electron');

// drag module
const { setDragElement } = require('./module/drag-module');

// json fixer
const jsonFixer = require('json-fixer');

// log location
const logLocation = process.env.USERPROFILE + '\\Documents\\Tataru Helper Node\\log';

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    setView();
    setButton();
});

// set view
function setView() {
    readLogList();
}

// set button
function setButton() {
    // drag
    setDragElement(document.getElementById('img_button_drag'));

    // read
    document.getElementById('button_read').onclick = () => {
        const file = document.getElementById('select_log').value;
        readLog(file);
    };

    // view
    document.getElementById('button_view').onclick = () => {
        try {
            execSync(`start "" "${logLocation}"`);
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
        const logs = readdirSync(logLocation);

        if (logs.length > 0) {
            const select = document.getElementById('select_log');
            select.replaceChildren();

            let innerHTML = '';
            for (let index = 0; index < logs.length; index++) {
                const log = logs[index];
                innerHTML += `<option value="${log}">${log}</option>`;
            }

            select.innerHTML = innerHTML;

            try {
                select.value = select.lastElementChild.value;
            } catch (error) {
                console.log(error);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function readLog(fileName) {
    if (fileName === '') {
        ipcRenderer.send('send-index', 'show-notification', '檔案不存在');
        return;
    }

    try {
        const fileLocation = logLocation + '\\' + fileName;
        const log = jsonFixer(readFileSync(fileLocation).toString()).data;
        const logNames = Object.getOwnPropertyNames(log);

        if (logNames.length > 0) {
            ipcRenderer.send('send-index', 'clear-dialog');

            for (let index = 0; index < logNames.length; index++) {
                const logElement = log[logNames[index]];

                if (logElement.code !== 'FFFF') {
                    ipcRenderer.send('send-index', 'append-dialog', logElement.id, logElement.code, logElement.translated_name, logElement.translated_text)
                }
            }

            ipcRenderer.send('send-index', 'move-to-bottom');
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-index', 'show-notification', '無法讀取檔案');
    }
}