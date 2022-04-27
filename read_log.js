'use strict';

// child process
const { exec } = require('child_process');

// fs
const { readFileSync, readdirSync } = require('fs');

// communicate with main process
const { ipcRenderer } = require('electron');

// json fixer
const jsonFixer = require('json-fixer');

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    // F12
    document.addEventListener('keydown', (event) => {
        if (event.code === 'F12') {
            ipcRenderer.send('open-devtools');
        }
    });

    setHTML();
});

// set html
function setHTML() {
    setView();
    setEvent();
    setButton();
}

// set view
function setView() {
    readLogList();
}

// set event
function setEvent() {}

// set button
function setButton() {
    // read
    document.getElementById('button_read').onclick = () => {
        const file = document.getElementById('select_log').value;
        readLog(file);
    };

    // view
    document.getElementById('button_view').onclick = () => {
        exec('start "" "json\\log"');
    };

    // close
    document.getElementById('img_button_close').onclick = () => {
        ipcRenderer.send('close-window');
    };
}

function readLogList() {
    try {
        const logs = readdirSync('./json/log');

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

function readLog(file) {
    if (file === '') {
        ipcRenderer.send('send-preload', 'show-notification', '檔案不存在');
        return;
    }

    try {
        const log = jsonFixer(readFileSync('./json/log/' + file).toString()).data;
        const logNames = Object.getOwnPropertyNames(log);

        if (logNames.length > 0) {
            for (let index = 0; index < logNames.length; index++) {
                const logItem = log[logNames[index]];

                if (logItem.code !== 'FFFF') {
                    ipcRenderer.send('send-preload', 'append-dialog', logItem.id, logItem.code, logItem.translated_name, logItem.translated_text)
                }
            }
        }
    } catch (error) {
        console.log(error);
        ipcRenderer.send('send-preload', 'show-notification', '無法讀取檔案');
    }
}